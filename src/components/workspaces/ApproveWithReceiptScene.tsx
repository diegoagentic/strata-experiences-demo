/**
 * w1.3 — ApproveWithReceiptScene
 * Manager: receipt inline (wow #2) · AI policy check · GL preview · edit · approve/reject/plan-B
 *
 * Scenario modes:
 *   approve   — standard flow: AI checks pass → approve → routed to AP with GL pre-filled
 *   reject    — manager sends back with required note → employee resubmit loop
 *   planb     — policy exception: $95.00 > $75 meal per-diem cap → override with reason OR reject
 *
 * SOT data surfaced:
 *   - Employee context: 3rd expense · avg $118.50 · all past approved within SLA
 *   - AI policy checks: within limit · no duplicates · category allowed
 *   - GL preview: 6200 Vehicle 94% + 6210 Travel 97% (what AP will receive on approval)
 *   - Audit trail: submitted via mobile · 10:32 AM · device: Strata Mobile
 *   - Edit expense inline: reclassify category or adjust amount before approving
 */

import { useState } from 'react'
import {
    CheckCircle2, XCircle, Receipt, AlertTriangle, ChevronRight,
    RotateCcw, Sparkles, Pencil, X, ShieldCheck, Clock, User, Send,
    Wand2, ZoomIn, ChevronLeft, MessageSquare, CheckCheck, Download,
} from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import { ReceiptImage } from './ExpenseSubmitScene'

type ScenarioMode = 'approve' | 'reject' | 'planb'
type ApproveState = 'pending' | 'editing' | 'sending' | 'approved' | 'rejected' | 'overridden'

const CATEGORIES = ['Mileage', 'Tolls / Cab / Parking', 'Personal Meals', 'Business Meals & Ent.', 'Air Fare', 'Car Rental', 'Lodging', 'Misc Cost', 'Market Events', 'Other']

// ── Activity & Discussion data ─────────────────────────────────────────────────

const TIMELINE_STEPS = [
    { label: 'Submitted',     actor: 'John Smith',    initials: 'JS', time: 'May 5 · 10:32 AM', done: true,  current: false },
    { label: 'Mgr notified',  actor: 'Sarah Johnson', initials: 'SJ', time: 'May 5 · 10:33 AM', done: true,  current: false },
    { label: 'In review',     actor: 'Sarah Johnson', initials: 'SJ', time: 'May 6 · 9:15 AM',  done: true,  current: true  },
    { label: 'Routed to AP',  actor: 'Letza Bombard', initials: 'LB', time: 'Pending',           done: false, current: false },
]

type ThreadStatus = 'open' | 'resolved'
type Message = { id: string; author: string; initials: string; side: 'employee' | 'manager'; text: string; time: string }
type Thread   = { id: string; status: ThreadStatus; messages: Message[] }

const INITIAL_THREADS: Thread[] = [
    {
        id: 't1',
        status: 'open',
        messages: [
            {
                id: 'm1',
                author: 'John Smith',
                initials: 'JS',
                side: 'employee',
                text: 'Hi Sarah — FYI on the Capital Grille receipt: that\'s the gas station on Suncoast Pkwy that uses that brand name. "Server: Maria V." is just the cashier. Definitely fuel, not dining.',
                time: '10:35 AM',
            },
        ],
    },
]

const AI_CHECKS = [
    { label: 'Within $150 per-diem limit',                ok: true  },
    { label: 'Category allowed · Mileage · Tolls / Cab / Parking', ok: true  },
    { label: 'No duplicate detected (last 7 days)',        ok: true  },
]

const AI_CHECKS_PLANB = [
    { label: '$95.00 exceeds $75 meal per-diem cap',       ok: false },
    { label: 'Category allowed · Mileage · Tolls / Cab / Parking', ok: true  },
    { label: 'No duplicate detected (last 7 days)',        ok: true  },
]

const GL_LINES = [
    { desc: 'Mileage — Tampa',          amount: '$95.00',  gl: '6200 · Vehicle Expenses',  confidence: 94 },
    { desc: 'Tolls / Cab / Parking',    amount: '$47.50',  gl: '6210 · Travel & Transit',  confidence: 97 },
]

export default function ApproveWithReceiptScene({ onApprove }: { onApprove?: () => void }) {
    const [mode,          setMode]          = useState<ScenarioMode>('approve')
    const [appState,      setAppState]      = useState<ApproveState>('pending')
    const [rejectNote,    setRejectNote]    = useState('Receipt is unclear · please reattach with full amount visible')
    const [overrideNote,  setOverrideNote]  = useState('Client entertainment · pre-approved by CFO · exceptional client week')
    const [showReject,    setShowReject]    = useState(false)
    const [showOverride,  setShowOverride]  = useState(false)
    const [aiExpanded,    setAiExpanded]    = useState(true)
    const [glExpanded,    setGlExpanded]    = useState(false)
    const [editAmount,    setEditAmount]    = useState('$95.00')
    const [editCategory,  setEditCategory]  = useState('Mileage · Tolls / Cab / Parking')
    const [editDesc,      setEditDesc]      = useState('Business client dinner — The Capital Grille')
    const [aiApplied,     setAiApplied]    = useState(false)
    const [receiptIdx,      setReceiptIdx]      = useState(0)
    const [receiptModal,    setReceiptModal]    = useState(false)

    // Activity & Discussion
    const [activityTab,   setActivityTab]  = useState<'timeline' | 'discussion'>('timeline')
    const [activityOpen,  setActivityOpen] = useState(true)
    const [threads,       setThreads]      = useState<Thread[]>(INITIAL_THREADS)
    const [replyTexts,    setReplyTexts]   = useState<Record<string, string>>({})
    const [newQuestion,   setNewQuestion]  = useState('')
    const [showAskForm,        setShowAskForm]        = useState(false)
    const [approvalDownloaded, setApprovalDownloaded] = useState(false)

    const openThreadCount = threads.filter(t => t.status === 'open').length

    const resolveThread = (threadId: string) =>
        setThreads(ts => ts.map(t => t.id === threadId ? { ...t, status: 'resolved' } : t))

    const addReply = (threadId: string) => {
        const text = (replyTexts[threadId] ?? '').trim()
        if (!text) return
        const msg: Message = { id: Date.now().toString(), author: 'Sarah Johnson', initials: 'SJ', side: 'manager', text, time: 'Just now' }
        setThreads(ts => ts.map(t => t.id === threadId ? { ...t, messages: [...t.messages, msg] } : t))
        setReplyTexts(r => ({ ...r, [threadId]: '' }))
    }

    const addQuestion = () => {
        const text = newQuestion.trim()
        if (!text) return
        const thread: Thread = {
            id: Date.now().toString(),
            status: 'open',
            messages: [{ id: Date.now().toString(), author: 'Sarah Johnson', initials: 'SJ', side: 'manager', text, time: 'Just now' }],
        }
        setThreads(ts => [...ts, thread])
        setNewQuestion('')
        setShowAskForm(false)
    }

    // AI detects category mismatch: restaurant vendor → Mileage · Tolls / Cab / Parking is inconsistent
    const categoryMismatch = editCategory === 'Mileage · Tolls / Cab / Parking' && !aiApplied

    const checks = mode === 'planb' ? AI_CHECKS_PLANB : AI_CHECKS
    const policyViolation = mode === 'planb'

    const reset = () => {
        setAppState('pending')
        setRejectNote('Receipt is unclear · please reattach with full amount visible')
        setOverrideNote('Client entertainment · pre-approved by CFO · exceptional client week')
        setShowReject(false)
        setShowOverride(false)
        setEditAmount('$95.00')
        setEditCategory('Mileage · Tolls / Cab / Parking')
        setEditDesc('Business client dinner — The Capital Grille')
        setAiApplied(false)
        setApprovalDownloaded(false)
    }

    const switchMode = (m: ScenarioMode) => { setMode(m); reset() }

    const handleApprove = () => {
        setAppState('sending')
        setTimeout(() => {
            setAppState('approved')
        }, 1200)
    }

    const handleRejectConfirm = () => {
        if (!rejectNote.trim()) return
        setAppState('rejected')
    }

    const handleOverrideConfirm = () => {
        if (!overrideNote.trim()) return
        setAppState('overridden')
        setTimeout(() => onApprove?.(), 900)
    }

    return (
        <div className="space-y-4">

            {/* ── Expense detail card ── */}
            {appState !== 'editing' ? (
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-foreground">John Smith</p>
                                <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">Sales Rep</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{editCategory} · May 5, 2026 · The Capital Grille — Tampa, FL</p>
                            <p className="text-xs text-muted-foreground">Approved by: Sarah Johnson — Operations · Tampa</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-foreground">{editAmount}</p>
                        </div>
                    </div>

                    {/* Employee context row */}
                    <div className="flex gap-4 pt-1 border-t border-border/60">
                        <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">3rd expense this month</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">Submitted 10:32 AM · Strata Mobile</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-success" />
                        <span className="text-[10px] text-muted-foreground">All 2 prior expenses approved · avg $118.50 · no policy flags</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-warning shrink-0" />
                        <span className="text-[10px] text-muted-foreground">Receipt amounts pending verification</span>
                    </div>

                    {/* Edit button */}
                    {appState === 'pending' && (
                        <button
                            onClick={() => setAppState('editing')}
                            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1 transition-colors"
                        >
                            <Pencil className="h-3 w-3" />
                            Edit before approving
                        </button>
                    )}
                </div>
            ) : (
                /* ── Inline edit form — full fields + AI flags ── */
                <div className="bg-card border border-primary/30 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-foreground">Review &amp; edit expense</p>
                        <span className="text-[10px] text-muted-foreground">Fields pre-filled by AI</span>
                    </div>

                    {/* Row 1 — Vendor (read-only) + Date (read-only) */}
                    <div className="grid grid-cols-2 gap-3 items-end">
                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Vendor</label>
                            <div className="flex items-center justify-between bg-muted/40 border border-border rounded-lg px-3 py-1.5">
                                <span className="text-sm text-foreground">The Capital Grille</span>
                                <span className="text-[9px] font-bold text-ai bg-ai/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                                    <Sparkles className="h-2 w-2" /> AI
                                </span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Date</label>
                            <div className="flex items-center justify-between bg-muted/40 border border-border rounded-lg px-3 py-1.5">
                                <span className="text-sm text-foreground">May 5, 2026</span>
                                <span className="text-[9px] font-bold text-ai bg-ai/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                                    <Sparkles className="h-2 w-2" /> AI
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Row 2 — Amount (editable) + Category (editable, AI flag) */}
                    <div className="grid grid-cols-2 gap-3 items-end">
                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Amount</label>
                            <input
                                value={editAmount}
                                onChange={e => setEditAmount(e.target.value)}
                                className="w-full text-sm font-semibold bg-background border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Category</label>
                                {categoryMismatch && (
                                    <span className="text-[9px] font-bold text-warning bg-warning/10 border border-warning/20 px-1.5 py-0.5 rounded-full">⚠ AI flag</span>
                                )}
                                {!categoryMismatch && aiApplied && (
                                    <span className="text-[9px] font-bold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded-full">✓ Updated</span>
                                )}
                            </div>
                            <select
                                value={editCategory}
                                onChange={e => setEditCategory(e.target.value)}
                                className={`w-full text-sm bg-background border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 ${
                                    categoryMismatch
                                        ? 'border-warning/50 focus:ring-warning/30'
                                        : 'border-border focus:ring-primary/50'
                                }`}
                            >
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* AI inconsistency flag — category mismatch */}
                    {categoryMismatch && (
                        <div className="bg-warning/5 border border-warning/30 rounded-xl p-3 space-y-2 animate-in fade-in duration-200">
                            <div className="flex items-start gap-2">
                                <Wand2 className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold text-foreground">AI detected a category mismatch</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                                        Vendor <span className="font-medium text-foreground">"The Capital Grille"</span> is a restaurant.
                                        Current category <span className="font-medium text-foreground">Mileage · Tolls / Cab / Parking</span> may be incorrect —
                                        Strata suggests <span className="font-medium text-foreground">Business Meals &amp; Entertainment</span>.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 pl-5">
                                <button
                                    onClick={() => { setEditCategory('Meals & Entertainment'); setAiApplied(true) }}
                                    className="flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 border border-warning/20 px-2.5 py-1 rounded-lg hover:bg-warning/20 transition-colors"
                                >
                                    <Sparkles className="h-2.5 w-2.5" />
                                    Apply AI suggestion
                                </button>
                                <button
                                    onClick={() => setAiApplied(true)}
                                    className="text-[10px] font-medium text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg transition-colors"
                                >
                                    Keep as Mileage · Tolls / Cab / Parking
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Applied confirmation */}
                    {aiApplied && editCategory === 'Meals & Entertainment' && (
                        <div className="flex items-center gap-2 bg-success/5 border border-success/20 rounded-lg px-3 py-2 animate-in fade-in duration-200">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                            <p className="text-[10px] text-foreground">Category updated · GL will remap to <span className="font-bold text-ai">6100 Meals &amp; Entertainment</span> on save</p>
                        </div>
                    )}

                    {/* Row 3 — Description */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Description</label>
                        <input
                            value={editDesc}
                            onChange={e => setEditDesc(e.target.value)}
                            placeholder="Add a description..."
                            className="w-full text-sm bg-background border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                    </div>

                    {/* Audit trail note */}
                    <div className="flex items-start gap-2 bg-ai/5 border border-ai/20 rounded-lg px-2.5 py-2">
                        <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                        <p className="text-[10px] text-foreground">Any edits are logged in the audit trail · GL codes will update automatically on save</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setAppState('pending')}
                            className="flex-1 text-xs font-bold py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                        >
                            Save &amp; continue
                        </button>
                        <button
                            onClick={() => { setEditAmount('$95.00'); setEditCategory('Mileage · Tolls / Cab / Parking'); setEditDesc('Business client dinner — The Capital Grille'); setAiApplied(false); setAppState('pending') }}
                            className="px-3 text-xs py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* ── AI review panel ── */}
            {appState !== 'editing' && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <button
                        onClick={() => setAiExpanded(v => !v)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-ai" />
                            <span className="text-xs font-semibold text-foreground">AI Policy Review</span>
                            {policyViolation
                                ? <span className="text-[10px] font-bold text-warning bg-warning/10 border border-warning/20 px-1.5 py-0.5 rounded-full">1 exception</span>
                                : <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-full">All checks passed</span>
                            }
                        </div>
                        <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${aiExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {aiExpanded && (
                        <div className="px-4 pb-4 space-y-2 animate-in fade-in duration-200">
                            {checks.map(c => (
                                <div key={c.label} className="flex items-center gap-2">
                                    {c.ok
                                        ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                        : <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                                    }
                                    <span className={`text-[11px] ${c.ok ? 'text-foreground' : 'text-warning font-semibold'}`}>{c.label}</span>
                                </div>
                            ))}

                            {/* GL preview */}
                            <button
                                onClick={() => setGlExpanded(v => !v)}
                                className="w-full mt-2 pt-2 border-t border-border/60 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="h-3 w-3 text-ai" />
                                    <span className="text-[11px] font-semibold text-ai">GL pre-fill preview · what AP will receive</span>
                                </div>
                                <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${glExpanded ? 'rotate-90' : ''}`} />
                            </button>

                            {glExpanded && (
                                <div className="space-y-1.5 animate-in fade-in duration-200">
                                    {GL_LINES.map(line => (
                                        <div key={line.desc} className="flex items-center justify-between bg-ai/5 border border-ai/10 rounded-lg px-3 py-2">
                                            <p className="text-[11px] font-medium text-foreground">{line.desc}</p>
                                            <div className="text-right shrink-0">
                                                <p className="text-[11px] font-semibold text-foreground">{line.amount}</p>
                                                <p className="text-[10px] text-muted-foreground">{line.confidence}% confidence</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Receipt inline — Wow moment #2 ── */}
            {appState !== 'editing' && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground">Receipts</span>
                            <span className="text-[10px] text-warning font-medium">Pending verification</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Carousel nav */}
                            <button
                                onClick={() => setReceiptIdx(i => Math.max(0, i - 1))}
                                disabled={receiptIdx === 0}
                                className="text-[10px] text-muted-foreground disabled:opacity-30 hover:text-foreground"
                            >‹</button>
                            <span className="text-xs text-muted-foreground">{receiptIdx + 1} of 2</span>
                            <button
                                onClick={() => setReceiptIdx(i => Math.min(1, i + 1))}
                                disabled={receiptIdx === 1}
                                className="text-[10px] text-muted-foreground disabled:opacity-30 hover:text-foreground"
                            >›</button>
                        </div>
                    </div>

                    {/* Receipt thumbnail — clickable to open modal */}
                    <button
                        onClick={() => setReceiptModal(true)}
                        className="mx-4 mb-2 w-[calc(100%-2rem)] rounded-xl overflow-hidden border border-border/50 shadow-sm group relative"
                        aria-label="Open receipt preview"
                    >
                        <ReceiptImage variant={receiptIdx === 0 ? 'fuel' : 'parking'} />
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                                <ZoomIn className="h-3.5 w-3.5 text-foreground" />
                                <span className="text-[11px] font-semibold text-foreground">View full receipt</span>
                            </div>
                        </div>
                    </button>

                    <p className="px-4 pb-3 text-[10px] text-muted-foreground italic">
                        Before Strata: managers approved without seeing receipts — GlobalSearch showed none
                    </p>
                </div>
            )}

            {/* ── Activity & Discussion ── */}
            {appState !== 'editing' && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    {/* Collapsible header */}
                    <button
                        onClick={() => setActivityOpen(v => !v)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground">Activity &amp; Discussion</span>
                            {!activityOpen && openThreadCount > 0 && (
                                <span className="text-[10px] font-bold text-warning bg-warning/10 border border-warning/20 px-1.5 py-0.5 rounded-full">
                                    {openThreadCount} open
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Participant avatars */}
                            <div className="flex -space-x-1.5">
                                {[
                                    { initials: 'JS', title: 'John Smith' },
                                    { initials: 'SJ', title: 'Sarah Johnson' },
                                    { initials: 'LB', title: 'Letza Bombard' },
                                ].map(p => (
                                    <div key={p.initials} title={p.title}
                                        className="h-5 w-5 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[8px] font-bold text-muted-foreground"
                                    >
                                        {p.initials}
                                    </div>
                                ))}
                            </div>
                            <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${activityOpen ? 'rotate-90' : ''}`} />
                        </div>
                    </button>

                    {activityOpen && (
                        <div className="px-4 pb-4 space-y-3 animate-in fade-in duration-200">
                            {/* Tab switcher */}
                            <div className="flex gap-1 bg-muted/40 rounded-lg p-0.5">
                                {(['timeline', 'discussion'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActivityTab(tab)}
                                        className={`flex-1 text-[11px] font-semibold py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                                            activityTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {tab === 'timeline' ? 'Timeline' : 'Discussion'}
                                        {tab === 'discussion' && openThreadCount > 0 && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* ── Timeline tab ── */}
                            {activityTab === 'timeline' && (
                                <div className="space-y-0">
                                    {TIMELINE_STEPS.map((step, i) => (
                                        <div key={step.label} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 border-2 transition-all ${
                                                    step.current
                                                        ? 'bg-primary text-primary-foreground border-primary/30 ring-2 ring-primary/20'
                                                        : step.done
                                                            ? 'bg-success/15 text-success border-success/30'
                                                            : 'bg-muted text-muted-foreground/40 border-border'
                                                }`}>
                                                    {step.done && !step.current ? '✓' : step.initials[0]}
                                                </div>
                                                {i < TIMELINE_STEPS.length - 1 && (
                                                    <div className={`w-px flex-1 mt-1 mb-1 min-h-[20px] ${step.done ? 'bg-success/25' : 'bg-border/50'}`} />
                                                )}
                                            </div>
                                            <div className="pb-3 flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-xs font-semibold ${
                                                        step.current ? 'text-foreground font-bold' : step.done ? 'text-foreground' : 'text-muted-foreground/50'
                                                    }`}>{step.label}</p>
                                                    <span className={`text-[10px] shrink-0 ${step.done ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
                                                        {step.time}
                                                    </span>
                                                </div>
                                                <p className={`text-[10px] ${step.current ? 'text-muted-foreground' : step.done ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
                                                    {step.actor}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ── Discussion tab ── */}
                            {activityTab === 'discussion' && (
                                <div className="space-y-3">
                                    {threads.map(thread => (
                                        <ThreadCard
                                            key={thread.id}
                                            thread={thread}
                                            replyText={replyTexts[thread.id] ?? ''}
                                            onReplyChange={text => setReplyTexts(r => ({ ...r, [thread.id]: text }))}
                                            onReply={() => addReply(thread.id)}
                                            onResolve={() => resolveThread(thread.id)}
                                        />
                                    ))}

                                    {/* Ask a question */}
                                    {!showAskForm ? (
                                        <button
                                            onClick={() => { setShowAskForm(true); setActivityTab('discussion') }}
                                            className="w-full text-[11px] text-muted-foreground py-2.5 border border-dashed border-border rounded-xl hover:text-foreground hover:border-border/80 transition-colors"
                                        >
                                            + Ask employee a question
                                        </button>
                                    ) : (
                                        <div className="space-y-2 animate-in fade-in duration-200">
                                            <textarea
                                                value={newQuestion}
                                                onChange={e => setNewQuestion(e.target.value)}
                                                placeholder="Ask John something about this expense..."
                                                rows={2}
                                                autoFocus
                                                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-1 focus:ring-primary/50"
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => { setShowAskForm(false); setNewQuestion('') }}
                                                    className="text-xs text-muted-foreground px-2 py-1 hover:text-foreground"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={addQuestion}
                                                    disabled={!newQuestion.trim()}
                                                    className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity"
                                                >
                                                    Send question
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Receipt modal ── */}
            {receiptModal && (
                <ReceiptModal
                    idx={receiptIdx}
                    onNavigate={setReceiptIdx}
                    onClose={() => setReceiptModal(false)}
                />
            )}

            {/* ── Actions — contextual by scenario ── */}
            {(appState === 'pending') && (
                <div className="space-y-2">

                    {/* Decision divider */}
                    <div className="flex items-center gap-3 pt-1">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Decision</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* ── Normal approval scenario ── */}
                    {mode === 'approve' && (
                        <div className="space-y-2">
                            <button
                                onClick={handleApprove}
                                className="w-full flex items-center justify-center gap-2 bg-success text-white font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-opacity"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Approve & route to accounting
                            </button>
                            {!showReject ? (
                                <>
                                    <button
                                        onClick={() => setShowReject(true)}
                                        className="w-full flex items-center justify-center gap-2 bg-card border border-border text-foreground text-xs font-semibold py-2.5 rounded-xl hover:bg-muted/40 transition-colors"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                                        Return to employee
                                    </button>
                                    <p className="text-center text-[10px] text-muted-foreground">
                                        To show the full return loop with resubmit:{' '}
                                        <button
                                            onClick={() => switchMode('reject')}
                                            className="text-destructive font-semibold hover:underline"
                                        >
                                            switch to Return path →
                                        </button>
                                    </p>
                                </>
                            ) : (
                                <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-warning" />
                                        <p className="text-sm font-semibold text-foreground">Note to employee required</p>
                                    </div>
                                    <textarea
                                        value={rejectNote}
                                        onChange={e => setRejectNote(e.target.value)}
                                        placeholder="Receipt is unclear · please reattach with full amount visible"
                                        rows={2}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowReject(false)} className="px-3 text-xs py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleRejectConfirm}
                                            disabled={!rejectNote.trim()}
                                            className="flex-1 flex items-center justify-center gap-1.5 bg-destructive text-destructive-foreground text-xs font-bold py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            Send to employee
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Return path scenario ── */}
                    {mode === 'reject' && (
                        <div className="space-y-2">
                            {!showReject ? (
                                <>
                                    <button
                                        onClick={() => setShowReject(true)}
                                        className="w-full flex items-center justify-center gap-2 bg-card border-2 border-border text-foreground font-bold text-sm py-3 rounded-xl hover:bg-muted/40 transition-colors"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Return to employee with note
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        className="w-full text-xs text-muted-foreground py-1.5 hover:text-foreground transition-colors"
                                    >
                                        Approve instead →
                                    </button>
                                </>
                            ) : (
                                <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-warning" />
                                        <p className="text-sm font-semibold text-foreground">Note to employee required</p>
                                    </div>
                                    <textarea
                                        value={rejectNote}
                                        onChange={e => setRejectNote(e.target.value)}
                                        placeholder="Receipt is unclear · please reattach with full amount visible"
                                        rows={2}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowReject(false)} className="px-3 text-xs py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleRejectConfirm}
                                            disabled={!rejectNote.trim()}
                                            className="flex-1 flex items-center justify-center gap-1.5 bg-destructive text-destructive-foreground text-xs font-bold py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            Send to employee
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Policy flag scenario ── */}
                    {mode === 'planb' && !showOverride && !showReject && (
                        <div className="space-y-2">
                            <div className="bg-warning/10 border border-warning/30 rounded-xl px-4 py-3 flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Policy exception required</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Amount exceeds the per-diem cap for this category. Override with a documented reason or reject.</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowOverride(true)}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-warning text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    Override with reason
                                </button>
                                <button
                                    onClick={() => setShowReject(true)}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-card border border-border text-muted-foreground text-xs font-semibold py-2.5 rounded-xl hover:text-foreground transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Reject
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Plan B — override form */}
                    {mode === 'planb' && showOverride && (
                        <div className="bg-card border border-warning/30 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-warning" />
                                <p className="text-sm font-semibold text-foreground">Override reason required</p>
                            </div>
                            <textarea
                                value={overrideNote}
                                onChange={e => setOverrideNote(e.target.value)}
                                placeholder="e.g. Client entertainment · pre-approved by CFO · exceptional week"
                                rows={2}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-1 focus:ring-warning/40"
                            />
                            <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                                <ShieldCheck className="h-3 w-3 shrink-0 mt-0.5" />
                                This exception will be logged in the audit trail and flagged on the CFO dashboard
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowOverride(false)}
                                    className="px-3 text-xs py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleOverrideConfirm}
                                    disabled={!overrideNote.trim()}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-warning/80 text-white text-xs font-bold py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Approve with override
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Plan B — reject form */}
                    {mode === 'planb' && showReject && !showOverride && (
                        <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-warning" />
                                <p className="text-sm font-semibold text-foreground">Rejection note required</p>
                            </div>
                            <textarea
                                value={rejectNote}
                                onChange={e => setRejectNote(e.target.value)}
                                placeholder="Amount exceeds policy cap and cannot be overridden at this time"
                                rows={2}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-1 focus:ring-primary"
                            />
                            <div className="flex gap-2">
                                <button onClick={() => setShowReject(false)} className="px-3 text-xs py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRejectConfirm}
                                    disabled={!rejectNote.trim()}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-destructive text-destructive-foreground text-xs font-bold py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Confirm rejection
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Sending state ── */}
            {appState === 'sending' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="bg-card border border-border rounded-xl px-4 py-5 flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center animate-pulse">
                            <Send className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-bold text-foreground">Approving expense...</p>
                            <p className="text-xs text-muted-foreground">Routing to AP · Pre-filling GL codes · Notifying John Smith</p>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '70%' }} />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Approved state ── */}
            {(appState === 'approved' || appState === 'overridden') && (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <div className={`border rounded-xl px-4 py-4 ${appState === 'overridden' ? 'bg-warning/10 border-warning/30' : 'bg-success/10 border-success/20'}`}>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className={`h-4 w-4 ${appState === 'overridden' ? 'text-warning' : 'text-success'}`} />
                            <p className={`text-sm font-bold ${appState === 'overridden' ? 'text-warning' : 'text-success'}`}>
                                {appState === 'overridden' ? 'Approved with policy exception' : 'Approved · Routed to AP automatically'}
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {appState === 'overridden'
                                ? 'Override logged in audit trail · flagged on CFO dashboard · AP team notified'
                                : 'AP team notified · employee will receive a status update · accounting codes pre-filled'
                            }
                        </p>
                    </div>
                    {/* Download approval record */}
                    <button
                        onClick={() => setApprovalDownloaded(true)}
                        className={`w-full flex items-center justify-center gap-1.5 border text-xs font-semibold py-2.5 rounded-xl transition-colors ${
                            approvalDownloaded
                                ? 'border-success/30 text-success bg-success/5'
                                : 'border-border text-foreground hover:bg-muted/30'
                        }`}
                    >
                        <Download className="h-3.5 w-3.5" />
                        {approvalDownloaded ? 'Approval record downloaded ✓' : 'Download approval record (PDF)'}
                    </button>

                    {/* Explicit handoff — presenter controls when to switch to employee view */}
                    <button
                        onClick={() => onApprove?.()}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-xs font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                        See employee status update
                    </button>
                </div>
            )}

            {/* ── Rejected state ── */}
            {appState === 'rejected' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-destructive" />
                            <p className="text-sm font-bold text-destructive">Returned to John Smith</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Rejection note attached · John notified immediately</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl px-4 py-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <RotateCcw className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-semibold text-foreground">John Smith received the rejection note ✓</p>
                        </div>
                        <p className="text-xs text-muted-foreground italic">"{rejectNote || overrideNote}"</p>
                        <p className="text-xs text-muted-foreground pt-1">
                            John can correct and resubmit directly from the app — full audit trail maintained · no calls to AP needed
                        </p>
                    </div>
                    <button
                        onClick={() => onApprove?.()}
                        className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                    >
                        Continue demo <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={reset} className="w-full text-xs text-muted-foreground py-2 hover:text-foreground transition-colors">
                        ↺ Reset scenario
                    </button>
                </div>
            )}

            {/* ── Presenter control — scenario switcher ── */}
            <div className="bg-muted/30 border border-border rounded-xl px-3 py-2.5 space-y-1.5">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Presenter: switch scenario</p>
                <div className="flex gap-1 flex-wrap">
                    {([
                        { key: 'approve', label: '✓ Normal approval' },
                        { key: 'reject',  label: '↩ Return path'     },
                        { key: 'planb',   label: '⚠ Policy flag'     },
                    ] as { key: ScenarioMode; label: string }[]).map(s => (
                        <button
                            key={s.key}
                            onClick={() => switchMode(s.key)}
                            className={`text-[10px] px-2.5 py-1 rounded-lg transition-all font-semibold border ${
                                mode === s.key
                                    ? s.key === 'reject'
                                        ? 'bg-destructive/10 text-destructive border-destructive/20'
                                        : s.key === 'planb'
                                        ? 'bg-warning/10 text-warning border-warning/20'
                                        : 'bg-success/10 text-success border-success/20'
                                    : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/60'
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
        </div>
    )
}

// ── Thread card ───────────────────────────────────────────────────────────────

function ThreadCard({ thread, replyText, onReplyChange, onReply, onResolve }: {
    thread: Thread
    replyText: string
    onReplyChange: (v: string) => void
    onReply: () => void
    onResolve: () => void
}) {
    const resolved = thread.status === 'resolved'
    return (
        <div className={`rounded-xl border p-3 space-y-2.5 ${resolved ? 'border-success/20 bg-success/5' : 'border-border bg-card'}`}>
            {/* Status row */}
            <div className="flex items-center justify-between">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${resolved ? 'text-success bg-success/10' : 'text-warning bg-warning/10'}`}>
                    {resolved ? 'Resolved' : 'Open'}
                </span>
                {!resolved && (
                    <button
                        onClick={onResolve}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-success transition-colors"
                    >
                        <CheckCheck className="h-3 w-3" />
                        Mark resolved
                    </button>
                )}
            </div>

            {/* Messages */}
            {thread.messages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.side === 'manager' ? 'flex-row-reverse' : ''}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        msg.side === 'manager' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                        {msg.initials}
                    </div>
                    <div className={`rounded-2xl px-3 py-2 max-w-[85%] ${
                        msg.side === 'manager' ? 'bg-primary/10 rounded-tr-sm' : 'bg-muted rounded-tl-sm'
                    }`}>
                        <p className="text-[9px] font-bold text-muted-foreground">{msg.author} · {msg.time}</p>
                        <p className="text-xs text-foreground mt-0.5 leading-relaxed">{msg.text}</p>
                    </div>
                </div>
            ))}

            {/* Reply input — only open threads */}
            {!resolved && (
                <div className="flex gap-2 pt-0.5">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-primary-foreground shrink-0">
                        SJ
                    </div>
                    <div className="flex-1 flex gap-1.5">
                        <input
                            value={replyText}
                            onChange={e => onReplyChange(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onReply() } }}
                            placeholder="Reply to John..."
                            className="flex-1 bg-background border border-border rounded-full px-3 py-1 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 min-w-0"
                        />
                        <button
                            onClick={onReply}
                            disabled={!replyText.trim()}
                            className="shrink-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-opacity"
                            aria-label="Send reply"
                        >
                            <Send className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Receipt modal ─────────────────────────────────────────────────────────────

const RECEIPT_META = [
    { label: 'The Capital Grille', sub: 'Fuel — Tampa · $95.00', variant: 'fuel'    as const },
    { label: 'Waterside Garage',   sub: 'Parking · $47.50',      variant: 'parking' as const },
]

function ReceiptModal({ idx, onNavigate, onClose }: {
    idx: number
    onNavigate: (i: number) => void
    onClose: () => void
}) {
    const total = RECEIPT_META.length
    const meta  = RECEIPT_META[idx]

    return (
        <div
            className="fixed left-80 top-0 right-0 bottom-0 z-[400] flex items-center justify-center p-4 animate-in fade-in duration-200"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <div
                className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-200 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div>
                        <p className="text-base font-bold text-foreground">{meta.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{meta.sub}</p>
                        <p className="text-[10px] text-ai mt-0.5">✦ Strata Mobile capture · OCR verified</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Receipt */}
                <div className="p-5">
                    <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm max-h-[65vh] overflow-y-auto">
                        <ReceiptImage variant={meta.variant} />
                    </div>
                </div>

                {/* Navigation footer */}
                <div className="flex items-center justify-between px-4 pb-4">
                    <button
                        onClick={() => onNavigate(Math.max(0, idx - 1))}
                        disabled={idx === 0}
                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground disabled:opacity-30 hover:text-foreground transition-colors disabled:cursor-default"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Previous
                    </button>

                    {/* Dots */}
                    <div className="flex items-center gap-1.5">
                        {RECEIPT_META.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => onNavigate(i)}
                                className={`rounded-full transition-all ${i === idx ? 'w-4 h-2 bg-foreground' : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'}`}
                                aria-label={`Receipt ${i + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => onNavigate(Math.min(total - 1, idx + 1))}
                        disabled={idx === total - 1}
                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground disabled:opacity-30 hover:text-foreground transition-colors disabled:cursor-default"
                    >
                        Next
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
