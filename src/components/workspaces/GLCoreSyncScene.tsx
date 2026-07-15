/**
 * w2.2 — GLCoreSyncScene
 * AP (Letza): context state → GL review → 3-step posting → posted
 * State machine: 'context' | 'reviewing' | 'posting' | 'posted'
 * Wow moment: "Posted · No manual re-entry · Letza saved ~15 min"
 */

import { useState, useRef, useCallback } from 'react'
import {
    Sparkles, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
    MessageSquare, CheckCheck, Send, Check, Flag, AlertCircle, Download,
} from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import { ReceiptImage } from './ExpenseSubmitScene'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

type SceneState   = 'reviewing' | 'posting' | 'posted' | 'rejecting' | 'rejected'
type PostingStep  = 'validating' | 'creating' | 'notifying'
type ThreadStatus = 'open' | 'resolved'
type MsgSide      = 'incoming' | 'ap'

interface ApMessage { id: string; author: string; initials: string; side: MsgSide; text: string; time: string }
interface ApThread  { id: string; status: ThreadStatus; messages: ApMessage[] }

const QUICK_REASONS = [
    'GL code doesn\'t match expense type',
    'Receipt is unclear or incomplete',
    'Amount doesn\'t match the receipt',
    'Missing itemization',
    'Expense exceeds policy limit',
]

const GL_CODES = ['6200 · Vehicle Expenses', '6210 · Travel & Transit', '6100 · Meals & Entertainment', '6300 · Office Expenses']

const LINES = [
    { id: 'fuel',    description: 'Mileage — Tampa',          amount: '$95.00',  glCode: '6200 · Vehicle Expenses', confidence: 94 },
    { id: 'parking', description: 'Tolls / Cab / Parking',    amount: '$47.50',  glCode: '6210 · Travel & Transit', confidence: 72 },
]

const RECEIPTS = [
    { variant: 'fuel'    as const, title: 'Fuel Receipt',     sub: 'Suncoast Fuel Services · $95.00' },
    { variant: 'parking' as const, title: 'Parking Receipt',  sub: 'Waterside Garage · $47.50'       },
]

const POSTING_STEPS: { key: PostingStep; label: string }[] = [
    { key: 'validating', label: 'Validating GL codes...'          },
    { key: 'creating',   label: 'Creating CORE entry #CR-2847...' },
    { key: 'notifying',  label: 'Notifying John Smith...'         },
]

// ── Activity data ─────────────────────────────────────────────────────────────

const AP_TIMELINE = [
    { label: 'Submitted',      actor: 'John Smith',    initials: 'JS', time: 'May 5 · 10:32 AM', done: true,  current: false, ai: false },
    { label: 'Mgr approved',   actor: 'Sarah Johnson', initials: 'SJ', time: 'May 6 · 9:15 AM',  done: true,  current: false, ai: false },
    { label: 'Routed to AP',   actor: 'Strata AI',     initials: '✦',  time: 'May 6 · 9:16 AM',  done: true,  current: false, ai: true  },
    { label: 'GL pre-filled',  actor: 'Strata AI',     initials: '✦',  time: 'May 6 · 9:16 AM',  done: true,  current: false, ai: true  },
    { label: 'AP review',      actor: 'Letza Bombard', initials: 'LB', time: 'May 6 · 2:47 PM',  done: true,  current: true,  ai: false },
    { label: 'Post to CORE',   actor: '',              initials: '',   time: 'Pending',            done: false, current: false, ai: false },
]

const AP_INITIAL_THREADS: ApThread[] = [
    {
        id: 'ap-t1',
        status: 'open',
        messages: [
            {
                id: 'ap-m1',
                author: 'Sarah Johnson',
                initials: 'SJ',
                side: 'incoming',
                text: 'Approval note: John confirmed the Capital Grille is a gas station on Suncoast Pkwy — GL 6200 is correct, not meals. Receipts match amounts.',
                time: 'May 6 · 9:15 AM',
            },
        ],
    },
]

// ── Main component ────────────────────────────────────────────────────────────

export default function GLCoreSyncScene({ onPost, onBack }: { onPost?: () => void; onBack?: () => void }) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    isPausedRef.current = isPaused

    const [sceneState,      setSceneState]      = useState<SceneState>('reviewing')
    const [overrides,       setOverrides]       = useState<Record<string, string>>({})
    const [acceptedLines,   setAcceptedLines]   = useState<Set<string>>(new Set())
    const [postingStep,     setPostingStep]     = useState<PostingStep>('validating')
    const [receiptIdx,      setReceiptIdx]      = useState(0)
    const [glTab,           setGlTab]           = useState<'pending' | 'confirmed'>('pending')

    // Activity & Discussion state
    const [rejectNote,   setRejectNote]   = useState('')

    const [activityTab,  setActivityTab]  = useState<'timeline' | 'discussion'>('discussion')
    const [activityOpen, setActivityOpen] = useState(true)
    const [apThreads,    setApThreads]    = useState<ApThread[]>(AP_INITIAL_THREADS)
    const [replyTexts,   setReplyTexts]   = useState<Record<string, string>>({})
    const [newNote,      setNewNote]      = useState('')
    const [showNoteForm, setShowNoteForm] = useState(false)
    const [glDownloaded, setGlDownloaded] = useState(false)

    const openThreadCount = apThreads.filter(t => t.status === 'open').length

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const tick = () => {
            if (isPausedRef.current) { setTimeout(tick, 100); return }
            if (Date.now() - start >= delay) fn()
            else setTimeout(tick, 100)
        }
        setTimeout(tick, 0)
    }, [])

    const handleReject   = () => { setRejectNote('GL code doesn\'t match expense type'); setSceneState('rejecting') }
    const handleSendBack = () => setSceneState('rejected')

    const handlePost = () => {
        setSceneState('posting')
        setPostingStep('validating')
        pauseAware(() => setPostingStep('creating'),  450)
        pauseAware(() => setPostingStep('notifying'), 900)
        pauseAware(() => setSceneState('posted'),     1300)
    }

    const getGL = (line: typeof LINES[0]) => overrides[line.id] ?? line.glCode

    const resolveThread = (id: string) =>
        setApThreads(ts => ts.map(t => t.id === id ? { ...t, status: 'resolved' } : t))

    const addReply = (threadId: string) => {
        const text = (replyTexts[threadId] ?? '').trim()
        if (!text) return
        const msg: ApMessage = { id: Date.now().toString(), author: 'Letza Bombard', initials: 'LB', side: 'ap', text, time: 'Just now' }
        setApThreads(ts => ts.map(t => t.id === threadId ? { ...t, messages: [...t.messages, msg] } : t))
        setReplyTexts(r => ({ ...r, [threadId]: '' }))
    }

    const addNote = () => {
        const text = newNote.trim()
        if (!text) return
        const thread: ApThread = {
            id: Date.now().toString(),
            status: 'open',
            messages: [{ id: Date.now().toString(), author: 'Letza Bombard', initials: 'LB', side: 'ap', text, time: 'Just now' }],
        }
        setApThreads(ts => [...ts, thread])
        setNewNote('')
        setShowNoteForm(false)
    }

    const activityPanel = (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <button
                onClick={() => setActivityOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">Activity &amp; Notes</span>
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
                    <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${activityOpen ? 'rotate-180' : ''}`} />
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
                                {tab === 'timeline' ? 'Timeline' : 'Notes'}
                                {tab === 'discussion' && openThreadCount > 0 && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ── Timeline tab ── */}
                    {activityTab === 'timeline' && (
                        <div className="space-y-0">
                            {AP_TIMELINE.map((step, i) => (
                                <div key={step.label + i} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 border-2 transition-all ${
                                            step.current
                                                ? 'bg-primary text-primary-foreground border-primary/30 ring-2 ring-primary/20'
                                                : step.ai && step.done
                                                    ? 'bg-ai/15 text-ai border-ai/30'
                                                    : step.done
                                                        ? 'bg-success/15 text-success border-success/30'
                                                        : 'bg-muted text-muted-foreground/40 border-border'
                                        }`}>
                                            {step.ai ? '✦' : step.done && !step.current ? '✓' : step.initials[0] ?? ''}
                                        </div>
                                        {i < AP_TIMELINE.length - 1 && (
                                            <div className={`w-px flex-1 mt-1 mb-1 min-h-[20px] ${step.done ? (step.ai ? 'bg-ai/20' : 'bg-success/25') : 'bg-border/50'}`} />
                                        )}
                                    </div>
                                    <div className="pb-3 flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-xs font-semibold ${
                                                step.current ? 'text-foreground font-bold' : step.done ? (step.ai ? 'text-ai' : 'text-foreground') : 'text-muted-foreground/50'
                                            }`}>{step.label}</p>
                                            <span className={`text-[10px] shrink-0 ${step.done ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
                                                {step.time}
                                            </span>
                                        </div>
                                        {step.actor && (
                                            <p className={`text-[10px] ${step.current ? 'text-muted-foreground' : step.done ? (step.ai ? 'text-ai/70' : 'text-muted-foreground') : 'text-muted-foreground/40'}`}>
                                                {step.actor}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Notes/Discussion tab ── */}
                    {activityTab === 'discussion' && (
                        <div className="space-y-3">
                            {apThreads.map(thread => (
                                <ApThreadCard
                                    key={thread.id}
                                    thread={thread}
                                    replyText={replyTexts[thread.id] ?? ''}
                                    onReplyChange={text => setReplyTexts(r => ({ ...r, [thread.id]: text }))}
                                    onReply={() => addReply(thread.id)}
                                    onResolve={() => resolveThread(thread.id)}
                                />
                            ))}

                            {!showNoteForm ? (
                                <button
                                    onClick={() => setShowNoteForm(true)}
                                    className="w-full text-[11px] text-muted-foreground py-2.5 border border-dashed border-border rounded-xl hover:text-foreground hover:border-border/80 transition-colors"
                                >
                                    + Add internal AP note
                                </button>
                            ) : (
                                <div className="space-y-2 animate-in fade-in duration-200">
                                    <textarea
                                        value={newNote}
                                        onChange={e => setNewNote(e.target.value)}
                                        placeholder="Add a note for this expense (visible to AP team only)..."
                                        rows={2}
                                        autoFocus
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-1 focus:ring-primary/50"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => { setShowNoteForm(false); setNewNote('') }}
                                            className="text-xs text-muted-foreground px-2 py-1 hover:text-foreground"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={addNote}
                                            disabled={!newNote.trim()}
                                            className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity"
                                        >
                                            Add note
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )

    // ── Reviewing state ───────────────────────────────────────────────────────

    if (sceneState === 'reviewing') {
        const toggleAccepted = (id: string) =>
            setAcceptedLines(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

        return (
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 animate-in fade-in duration-300">

                {/* ── LEFT — GL review action area ── */}
                <div className="space-y-4">

                {/* Back to queue */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Back to AP queue
                    </button>
                )}

                {/* Expense header */}
                <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-bold text-foreground">John Smith · $95.00</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Approved by Sarah Johnson · May 6 · <span className="text-success font-medium">on time ✓</span>
                        </p>
                    </div>
                    <span className="text-[10px] bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full font-medium shrink-0">
                        1 receipt verified ✓
                    </span>
                </div>

                {/* GL assignment */}
                <div className="space-y-2">
                    {/* Header + tab switcher */}
                    <div className="flex items-center justify-between px-1">
                        <p className="text-xs font-semibold text-foreground">GL Code Assignment</p>
                        <div className="flex gap-0.5 bg-muted/40 rounded-lg p-0.5">
                            {(['pending', 'confirmed'] as const).map(tab => {
                                const count = tab === 'pending'
                                    ? LINES.filter(l => !acceptedLines.has(l.id)).length
                                    : LINES.filter(l =>  acceptedLines.has(l.id)).length
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setGlTab(tab)}
                                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                                            glTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {tab === 'pending' ? 'To confirm' : 'Confirmed'}
                                        <span className={`text-[10px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center leading-none ${
                                            tab === 'pending'
                                                ? count > 0 ? 'bg-warning/20 text-warning' : 'bg-success/15 text-success'
                                                : count > 0 ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
                                        }`}>{count}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-ai/5 border border-ai/15 rounded-xl px-3 py-2.5">
                        <Sparkles className="h-3.5 w-3.5 text-ai shrink-0" />
                        <p className="text-[11px] text-ai leading-snug">
                            Strata analyzed these lines from the receipt — verify each code looks right, then post to CORE
                        </p>
                    </div>

                    {/* To confirm tab */}
                    {glTab === 'pending' && (() => {
                        const pendingLines = LINES.filter(l => !acceptedLines.has(l.id))
                        if (pendingLines.length === 0) return (
                            <div className="bg-success/5 border border-success/20 rounded-xl px-3 py-4 text-center space-y-1">
                                <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                                <p className="text-xs font-semibold text-success">All lines confirmed</p>
                                <p className="text-[10px] text-muted-foreground">Ready to post to CORE</p>
                            </div>
                        )
                        return (
                            <div className="space-y-2 animate-in fade-in duration-200">
                                {pendingLines.map(line => {
                                    const gl = getGL(line)
                                    return (
                                        <div
                                            key={line.id}
                                            className={`bg-card border rounded-xl p-4 space-y-3 transition-all duration-200 ${
                                                line.confidence < 75 ? 'border-destructive/30 bg-destructive/5' : 'border-ai/20'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-xs font-semibold text-foreground">{line.description}</p>
                                                    <p className="text-xs font-mono text-muted-foreground">{line.amount}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                                                    <ConfidencePill pct={line.confidence} />
                                                    <button
                                                        onClick={() => toggleAccepted(line.id)}
                                                        className="h-7 w-7 rounded-full border-2 border-border text-muted-foreground hover:border-success/60 hover:text-success flex items-center justify-center transition-all"
                                                        aria-label="Confirm this code"
                                                        title="Confirm this code"
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles className={`h-3 w-3 shrink-0 ${line.confidence >= 90 ? 'text-ai' : line.confidence >= 75 ? 'text-warning' : 'text-destructive'}`} />
                                                    <span className={`text-[10px] font-medium ${line.confidence >= 90 ? 'text-ai' : line.confidence >= 75 ? 'text-warning' : 'text-destructive'}`}>
                                                        {line.confidence >= 90
                                                            ? 'Strata matched this with high confidence — confirm to continue'
                                                            : line.confidence >= 75
                                                            ? 'Strata matched this — verify before confirming'
                                                            : 'Lower confidence — please verify this code before confirming'}
                                                    </span>
                                                </div>
                                                <div className="relative">
                                                    <select
                                                        value={gl}
                                                        onChange={e => {
                                                            setOverrides(prev => ({ ...prev, [line.id]: e.target.value }))
                                                            setAcceptedLines(prev => { const n = new Set(prev); n.delete(line.id); return n })
                                                        }}
                                                        className="w-full appearance-none bg-background border border-input rounded-lg px-3 py-2.5 pr-8 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 cursor-pointer transition-colors"
                                                    >
                                                        {GL_CODES.map(g => <option key={g}>{g}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })()}

                    {/* Confirmed tab */}
                    {glTab === 'confirmed' && (() => {
                        const confirmedLines = LINES.filter(l => acceptedLines.has(l.id))
                        if (confirmedLines.length === 0) return (
                            <div className="bg-card border border-border rounded-xl px-3 py-4 text-center">
                                <p className="text-[11px] text-muted-foreground">No lines confirmed yet — confirm a code in the "To confirm" tab</p>
                            </div>
                        )
                        return (
                            <div className="space-y-2 animate-in fade-in duration-200">
                                {confirmedLines.map(line => (
                                    <div key={line.id} className="bg-success/5 border border-success/20 rounded-xl px-3 py-2.5 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-foreground">{line.description}</p>
                                            <p className="text-[10px] text-muted-foreground">{getGL(line)} · {line.amount}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <ConfidencePill pct={line.confidence} />
                                            <button
                                                onClick={() => toggleAccepted(line.id)}
                                                className="h-7 w-7 rounded-full border-2 border-success bg-success text-white flex items-center justify-center transition-all hover:opacity-80"
                                                title="Confirmed ✓ — click to undo"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    })()}
                </div>

                {activityPanel}

                {/* CTA + sub-label */}
                <div className="space-y-1.5">
                    <div className="flex gap-2">
                        <button
                            onClick={handleReject}
                            className="flex-1 flex items-center justify-center gap-1.5 border border-destructive/30 text-destructive text-xs font-semibold py-2.5 rounded-xl hover:bg-destructive/5 transition-colors"
                        >
                            <Flag className="h-3.5 w-3.5" />
                            Flag for revision
                        </button>
                        <button
                            onClick={handlePost}
                            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-sm py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <Sparkles className="h-4 w-4" />
                            Confirm &amp; Post to CORE
                        </button>
                    </div>
                    <p className="text-[11px] text-center text-muted-foreground">
                        {LINES.length} lines ready · entry posts automatically · no manual re-entry
                    </p>
                </div>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
                </div>{/* end LEFT */}

                {/* ── RIGHT — receipt carousel ── */}
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <div>
                                <p className="text-sm font-semibold text-foreground">{RECEIPTS[receiptIdx].title}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{RECEIPTS[receiptIdx].sub}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="flex items-center gap-1.5">
                                    {RECEIPTS.map((_, i) => (
                                        <button key={i} onClick={() => setReceiptIdx(i)}
                                            className={`rounded-full transition-all duration-200 ${i === receiptIdx ? 'w-5 h-2 bg-foreground' : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'}`}
                                            aria-label={`Receipt ${i + 1}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] text-muted-foreground tabular-nums">{receiptIdx + 1} / {RECEIPTS.length}</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setReceiptIdx(i => Math.max(0, i - 1))}
                                        disabled={receiptIdx === 0}
                                        className="h-7 w-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-default transition-colors"
                                        aria-label="Previous receipt"
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setReceiptIdx(i => Math.min(RECEIPTS.length - 1, i + 1))}
                                        disabled={receiptIdx === RECEIPTS.length - 1}
                                        className="h-7 w-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-default transition-colors"
                                        aria-label="Next receipt"
                                    >
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            <ReceiptImage variant={RECEIPTS[receiptIdx].variant} />
                        </div>
                        <div className="px-4 py-2 bg-muted/30 border-t border-border">
                            <p className="text-[10px] text-ai">✦ Strata Mobile capture · OCR verified · amounts match GL lines</p>
                        </div>
                    </div>
                </div>{/* end RIGHT */}

            </div>
        )
    }

    // ── Rejecting state ───────────────────────────────────────────────────────

    if (sceneState === 'rejecting') {
        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-card border border-border rounded-xl px-3 py-2.5">
                    <p className="text-xs font-semibold text-foreground">John Smith · $95.00</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Flagging for revision — message will be sent to the approving manager</p>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Reason for returning</p>
                    <div className="flex flex-wrap gap-1.5">
                        {QUICK_REASONS.map(r => (
                            <button
                                key={r}
                                onClick={() => setRejectNote(r)}
                                className={`text-[10px] font-medium px-2 py-1 rounded-full border transition-colors ${
                                    rejectNote === r
                                        ? 'bg-destructive/10 border-destructive/30 text-destructive'
                                        : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted/70'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={rejectNote}
                        onChange={e => setRejectNote(e.target.value)}
                        placeholder="Describe the issue — the manager and employee will see this note"
                        className="w-full border border-border rounded-xl px-3 py-2.5 text-xs text-foreground bg-background resize-none h-16 focus:outline-none focus:ring-1 focus:ring-destructive/40 placeholder:text-muted-foreground/60"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSceneState('reviewing')}
                        className="flex-1 text-xs font-semibold text-muted-foreground py-2.5 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSendBack}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-destructive text-destructive-foreground text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                    >
                        Send back to manager
                    </button>
                </div>
                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
            </div>
        )
    }

    // ── Rejected state ────────────────────────────────────────────────────────

    if (sceneState === 'rejected') {
        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-3 space-y-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                        <p className="text-xs font-semibold text-destructive">Expense returned to manager</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">John Smith · $95.00 · Mileage · Tolls / Cab / Parking</p>
                    {rejectNote && (
                        <div className="bg-background border border-border rounded-lg px-2.5 py-2">
                            <p className="text-[10px] text-muted-foreground italic">"{rejectNote}"</p>
                        </div>
                    )}
                    <p className="text-[10px] text-muted-foreground">Approving manager notified · expense removed from GL queue</p>
                </div>
                <p className="text-[10px] text-muted-foreground/60 text-center">
                    This expense will not post to the accounting system until resubmitted and re-approved
                </p>
                <button
                    onClick={() => { setSceneState('reviewing'); setRejectNote('') }}
                    className="w-full text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5 text-center"
                >
                    ← Back to GL review queue
                </button>
                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
            </div>
        )
    }

    // ── Posting state ─────────────────────────────────────────────────────────

    if (sceneState === 'posting') {
        const currentIdx = POSTING_STEPS.findIndex(s => s.key === postingStep)
        return (
            <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-card border border-border rounded-xl px-4 py-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 border-2 border-ai border-t-transparent rounded-full animate-spin shrink-0" />
                        <p className="text-sm font-semibold text-foreground">Posting to CORE...</p>
                    </div>
                    <div className="space-y-2.5">
                        {POSTING_STEPS.map((step, idx) => {
                            const done   = idx < currentIdx
                            const active = idx === currentIdx
                            return (
                                <div key={step.key} className="flex items-center gap-2.5">
                                    {done
                                        ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                        : <div className={`h-3.5 w-3.5 rounded-full border shrink-0 ${active ? 'border-ai border-2' : 'border-border'}`} />
                                    }
                                    <span className={`text-xs transition-colors duration-300 ${done ? 'text-success' : active ? 'text-foreground font-medium' : 'text-muted-foreground/40'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
            </div>
        )
    }

    // ── Posted state ──────────────────────────────────────────────────────────

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-success/10 border border-success/20 rounded-xl px-4 py-4 space-y-3">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <p className="text-sm font-bold text-success">Entry #CR-2847 posted to CORE</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">GL 6200 · $95.00 · Vehicle Expenses</p>
                    <p className="text-xs text-muted-foreground">GL 6210 · $47.50 · Travel &amp; Transit</p>
                </div>
                <p className="text-xs text-muted-foreground pt-1 border-t border-success/20">
                    John Smith notified: <span className="text-foreground font-medium">"Your expense was posted · payment processing"</span>
                </p>
            </div>

            {/* Download GL entry */}
            <button
                onClick={() => setGlDownloaded(true)}
                className={`w-full flex items-center justify-center gap-1.5 border text-xs font-semibold py-2.5 rounded-xl transition-colors ${
                    glDownloaded
                        ? 'border-success/30 text-success bg-success/5'
                        : 'border-border text-foreground hover:bg-muted/30'
                }`}
            >
                <Download className="h-3.5 w-3.5" />
                {glDownloaded ? 'GL entry downloaded ✓' : 'Download GL entry (PDF)'}
            </button>

            <div className="bg-card border border-border rounded-xl px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Before Strata</span>
                    <span className="text-xs text-muted-foreground line-through">~15 min/expense · manual re-entry</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">With Strata</span>
                    <span className="text-xs font-bold text-success">1 click · 0 manual re-entry ✓</span>
                </div>
                <p className="text-[10px] text-muted-foreground pt-1">
                    Letza saved ~15 min on this expense · ~45 min for a batch of 3 → now under 4 min
                </p>
            </div>

            {/* Bridge card — one thing to improve */}
            <div className="bg-warning/5 border border-warning/20 rounded-xl px-3 py-3 space-y-2 animate-in fade-in duration-700">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-ai shrink-0" />
                    <p className="text-xs font-semibold text-foreground">One thing to improve</p>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    The <span className="font-semibold text-foreground">Parking</span> line matched at{' '}
                    <span className="font-semibold text-warning">72% confidence</span> — it needed manual review this time.
                    Updating the classification rule takes two minutes and will auto-classify future parking expenses at 97%+ with no manual step.
                </p>
                <p className="text-[10px] text-ai font-medium">✦ Strata flagged this automatically — no IT ticket needed to fix it</p>
                <button
                    onClick={() => onPost?.()}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold border border-border text-foreground py-2 rounded-xl hover:bg-muted/30 transition-colors"
                >
                    Fix the Parking rule in Admin
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
        </div>
    )
}


// ── AP thread card ────────────────────────────────────────────────────────────

function ApThreadCard({ thread, replyText, onReplyChange, onReply, onResolve }: {
    thread: ApThread
    replyText: string
    onReplyChange: (v: string) => void
    onReply: () => void
    onResolve: () => void
}) {
    const resolved = thread.status === 'resolved'
    return (
        <div className={`rounded-xl border p-3 space-y-2.5 ${resolved ? 'border-success/20 bg-success/5' : 'border-border bg-card'}`}>
            <div className="flex items-center justify-between">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${resolved ? 'text-success bg-success/10' : 'text-warning bg-warning/10'}`}>
                    {resolved ? 'Resolved' : 'Open'}
                </span>
                {!resolved && (
                    <button onClick={onResolve} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-success transition-colors">
                        <CheckCheck className="h-3 w-3" />
                        Mark resolved
                    </button>
                )}
            </div>

            {thread.messages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.side === 'ap' ? 'flex-row-reverse' : ''}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        msg.side === 'ap' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                        {msg.initials}
                    </div>
                    <div className={`rounded-2xl px-3 py-2 max-w-[85%] ${
                        msg.side === 'ap' ? 'bg-primary/10 rounded-tr-sm' : 'bg-muted rounded-tl-sm'
                    }`}>
                        <p className="text-[9px] font-bold text-muted-foreground">{msg.author} · {msg.time}</p>
                        <p className="text-xs text-foreground mt-0.5 leading-relaxed">{msg.text}</p>
                    </div>
                </div>
            ))}

            {!resolved && (
                <div className="flex gap-2 pt-0.5">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-primary-foreground shrink-0">
                        LB
                    </div>
                    <div className="flex-1 flex gap-1.5">
                        <input
                            value={replyText}
                            onChange={e => onReplyChange(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onReply() } }}
                            placeholder="Reply or add a note..."
                            className="flex-1 bg-background border border-border rounded-full px-3 py-1 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 min-w-0"
                        />
                        <button
                            onClick={onReply}
                            disabled={!replyText.trim()}
                            className="shrink-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-opacity"
                            aria-label="Send"
                        >
                            <Send className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function ConfidencePill({ pct }: { pct: number }) {
    const color = pct >= 90
        ? 'text-success bg-success/10 border border-success/20'
        : pct >= 75
        ? 'text-warning bg-warning/10 border border-warning/20'
        : 'text-destructive bg-destructive/10 border border-destructive/20'
    const label = pct >= 75 ? `${pct}%` : 'Verify'
    return (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>{label}</span>
    )
}
