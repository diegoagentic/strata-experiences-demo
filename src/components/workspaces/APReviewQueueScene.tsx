/**
 * w2.1 — APReviewQueueScene
 * AP (Letza): list always visible → toast overlay on notification → click to review
 * State machine: 'list' | 'notified'
 * Pain points resolved: PP8 (45 min manual → 4 min), PP10 (open one by one)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Sparkles, ChevronRight, Bell, CheckCircle2, X, Flag, AlertCircle, Calendar, ChevronDown } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

type SceneState  = 'list' | 'notified' | 'rejecting' | 'rejected'
type FilterKey   = 'all' | 'pending' | 'posted'
type TimeFilter  = 'any' | 'today' | '3days' | '7days' | 'month'

const QUICK_REASONS = [
    'Receipt is unclear or incomplete',
    'GL code doesn\'t match expense type',
    'Amount doesn\'t match the receipt',
    'Missing itemization',
    'Expense exceeds policy limit',
]

// ── Data ──────────────────────────────────────────────────────────────────────

const PENDING_EXPENSES = [
    {
        id: 'john',
        name: 'Employee Alpha',
        amount: '$95.00',
        approvedBy: 'Operations Manager Solano',
        approvedDate: 'May 6',
        glLines: [
            { code: 'Mileage',               amount: '$95.00',  confidence: 94 },
            { code: 'Tolls / Cab / Parking', amount: '$47.50',  confidence: 72 },
        ],
        ageDays: 0,
        sla: false,
        focus: true,
        posted: false,
    },
    {
        id: 'maria',
        name: 'Maria Lopez',
        amount: '$89.00',
        approvedBy: 'Operations Manager Solano',
        approvedDate: 'May 5',
        glLines: [
            { code: 'Personal Meals', amount: '$89.00', confidence: 96 },
        ],
        ageDays: 1,
        sla: false,
        focus: false,
        posted: false,
    },
    {
        id: 'carlos',
        name: 'Carlos Ruiz',
        amount: '$210.00',
        approvedBy: 'Mike Torres',
        approvedDate: 'May 2',
        glLines: [
            { code: 'Air Fare',  amount: '$120.00', confidence: 91 },
            { code: 'Mileage',   amount: '$55.00',  confidence: 88 },
            { code: 'Misc Cost', amount: '$35.00',  confidence: 85 },
        ],
        ageDays: 4,
        sla: false,
        focus: false,
        posted: false,
    },
]

const POSTED_EXPENSES = [
    {
        id: 'ana',
        name: 'Ana Kim',
        amount: '$65.00',
        approvedBy: 'Operations Manager Solano',
        approvedDate: 'May 3',
        glLines: [{ code: 'Personal Meals', amount: '$65.00', confidence: 98 }],
        ageDays: 4,
        sla: false,
        focus: false,
        posted: true,
        postedGl: 'Personal Meals ✓',
        postedDate: 'May 3',
    },
    {
        id: 'robert',
        name: 'Robert Kim',
        amount: '$120.00',
        approvedBy: 'Mike Torres',
        approvedDate: 'May 2',
        glLines: [{ code: 'Misc Cost', amount: '$120.00', confidence: 95 }],
        ageDays: 5,
        sla: false,
        focus: false,
        posted: true,
        postedGl: 'Misc Cost ✓',
        postedDate: 'May 2',
    },
]

const ALL_EXPENSES = [...PENDING_EXPENSES, ...POSTED_EXPENSES]

const MAX_AGE: Record<TimeFilter, number> = { any: Infinity, today: 0, '3days': 3, '7days': 7, month: 30 }

// ── Main component ────────────────────────────────────────────────────────────

export default function APReviewQueueScene({ onReview }: { onReview?: () => void }) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    isPausedRef.current = isPaused

    const [scene, setScene]               = useState<SceneState>('list')
    const [filter, setFilter]             = useState<FilterKey>('all')
    const [timeFilter, setTimeFilter]     = useState<TimeFilter>('any')
    const [expandedCard, setExpandedCard] = useState<string | null>(null)
    const [rejectNote, setRejectNote]     = useState('')

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const tick = () => {
            if (isPausedRef.current) { setTimeout(tick, 100); return }
            if (Date.now() - start >= delay) fn()
            else setTimeout(tick, 100)
        }
        setTimeout(tick, 0)
    }, [])

    useEffect(() => {
        pauseAware(() => setScene('notified'), 2000)
    }, [pauseAware])

    const base = filter === 'pending' ? PENDING_EXPENSES : filter === 'posted' ? POSTED_EXPENSES : ALL_EXPENSES
    const filteredExpenses = base.filter(e => e.ageDays <= MAX_AGE[timeFilter])

    return (
        <div className="space-y-4">

            {/* Toast — overlays above list, slides in when notified */}
            {scene === 'notified' && (
                <APQueueToast onReview={onReview} onDismiss={() => setScene('list')} onFlag={() => { setRejectNote('Receipt is unclear or incomplete'); setScene('rejecting') }} />
            )}

            {/* Rejecting overlay */}
            {scene === 'rejecting' && (
                <div className="bg-card border border-border rounded-xl px-3 py-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                        <p className="text-xs font-semibold text-foreground">Flag expense for revision</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Returning before GL review · manager and employee will be notified</p>
                    </div>
                    <div className="space-y-2">
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
                            placeholder="Reason for returning — e.g. missing receipt, wrong category"
                            className="w-full border border-border rounded-xl px-3 py-2.5 text-xs text-foreground bg-background resize-none h-16 focus:outline-none focus:ring-1 focus:ring-destructive/40 placeholder:text-muted-foreground/60"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setScene('notified')}
                            className="flex-1 text-xs font-semibold text-muted-foreground py-2.5 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setScene('rejected')}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-destructive text-destructive-foreground text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Send back
                        </button>
                    </div>
                </div>
            )}

            {/* Rejected confirmation */}
            {scene === 'rejected' && (
                <>
                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-3 space-y-2 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                            <p className="text-xs font-semibold text-destructive">Expense returned before GL review</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Employee Alpha · $95.00 · removed from AP queue</p>
                        {rejectNote && (
                            <div className="bg-background border border-border rounded-lg px-2.5 py-2">
                                <p className="text-[10px] text-muted-foreground italic">"{rejectNote}"</p>
                            </div>
                        )}
                        <p className="text-[10px] text-muted-foreground">Manager and employee notified · expense requires resubmission</p>
                    </div>
                    <button
                        onClick={() => { setScene('list'); setRejectNote('') }}
                        className="w-full text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5 text-center"
                    >
                        ← Back to AP queue
                    </button>
                </>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { value: '8',    label: 'Processed yesterday' },
                    { value: '0',    label: 'Pending now' },
                    { value: '< 1d', label: 'Avg processing' },
                ].map(stat => (
                    <div key={stat.label} className="bg-card border border-border rounded-xl px-3 py-3 text-center">
                        <p className="text-base font-bold text-foreground leading-none">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Confidence legend — always visible */}
            <div className="flex items-center gap-1.5 flex-wrap px-1">
                <span className="text-[9px] text-muted-foreground font-medium">Confidence:</span>
                <span className="text-[9px] bg-success/10 text-success border border-success/20 px-1.5 py-0.5 rounded-full font-medium">≥ 90% safe</span>
                <span className="text-[9px] bg-warning/10 text-warning border border-warning/20 px-1.5 py-0.5 rounded-full font-medium">75–89% review</span>
                <span className="text-[9px] bg-muted text-muted-foreground border border-border px-1.5 py-0.5 rounded-full font-medium">&lt; 75% manual</span>
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-2 flex-wrap">
                <FilterBar active={filter} onChange={setFilter} />
                <TimeRangeFilter active={timeFilter} onChange={setTimeFilter} />
            </div>

            {/* Expense list */}
            <div className="space-y-3">
                {filteredExpenses.map((exp: typeof ALL_EXPENSES[0]) => (
                    exp.posted
                        ? <PostedCard key={exp.id} exp={exp as typeof POSTED_EXPENSES[0]} />
                        : <ExpenseCard
                            key={exp.id}
                            exp={exp}
                            expanded={expandedCard === exp.id}
                            onToggleExpand={() => setExpandedCard(expandedCard === exp.id ? null : exp.id)}
                          />
                ))}
                {filteredExpenses.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No expenses match this filter.</p>
                )}
            </div>

            {/* Bell indicator — only while waiting */}
            {scene === 'list' && (
                <div className="flex items-center gap-2 justify-center py-1">
                    <Bell className="h-3 w-3 text-muted-foreground animate-pulse" />
                    <p className="text-[10px] text-muted-foreground">Waiting for manager approvals to route to AP...</p>
                </div>
            )}

            {/* AS-IS contrast */}
            <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Before Strata:</span> Letza opened GlobalSearch, copied every field manually into CORE — ~15 min per expense, ~45 min for a batch of 3. One typo meant a wrong GL post.
                </p>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}

// ── Toast overlay ─────────────────────────────────────────────────────────────

function APQueueToast({ onReview, onDismiss, onFlag }: { onReview?: () => void; onDismiss: () => void; onFlag: () => void }) {
    return (
        <div className="animate-in slide-in-from-top duration-500 bg-card border border-ai/40 rounded-xl px-4 py-3 shadow-sm space-y-2">
            <div className="flex items-start gap-3">
                <div className="relative shrink-0 mt-0.5">
                    <div className="h-8 w-8 rounded-xl bg-ai/10 flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-ai" />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-ai border-2 border-card animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-ai uppercase tracking-wide mb-0.5">Strata · AP Queue ready</p>
                    <p className="text-xs font-semibold text-foreground leading-snug">
                        Employee Alpha · $95.00 · Mileage · Tolls / Cab / Parking — approved by Operations Manager Solano
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                        Categories mapped · ready to confirm and post
                    </p>
                </div>
                <button
                    onClick={onDismiss}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                    aria-label="Dismiss notification"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
            <button
                onClick={onReview}
                className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
                Review GL — Employee Alpha
                <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
                onClick={onFlag}
                className="w-full flex items-center justify-center gap-1 text-[11px] font-medium text-destructive/70 hover:text-destructive transition-colors py-1"
            >
                <Flag className="h-3 w-3" />
                Flag for revision without reviewing
            </button>
        </div>
    )
}

// ── Filter bar ────────────────────────────────────────────────────────────────

const FILTER_LABELS: Record<FilterKey, string> = {
    all:     'All',
    pending: 'Pending GL',
    posted:  'Posted ✓',
}

// ── Time range filter ─────────────────────────────────────────────────────────

const TIME_OPTIONS: { key: TimeFilter; label: string }[] = [
    { key: 'any',    label: 'Any time'    },
    { key: 'today',  label: 'Today'       },
    { key: '3days',  label: 'Last 3 days' },
    { key: '7days',  label: 'Last 7 days' },
    { key: 'month',  label: 'This month'  },
]

function TimeRangeFilter({ active, onChange }: { active: TimeFilter; onChange: (k: TimeFilter) => void }) {
    const [open, setOpen] = useState(false)
    const selected = TIME_OPTIONS.find(o => o.key === active)!
    const isFiltered = active !== 'any'

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                    isFiltered
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground'
                }`}
            >
                <Calendar className="h-3 w-3" />
                {selected.label}
                <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-lg overflow-hidden w-40 animate-in fade-in slide-in-from-top-1 duration-150">
                    {TIME_OPTIONS.map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => { onChange(opt.key); setOpen(false) }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50 ${
                                active === opt.key ? 'font-semibold text-foreground' : 'text-muted-foreground'
                            }`}
                        >
                            {opt.label}
                            {active === opt.key && <span className="text-ai text-[10px]">✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Filter bar ────────────────────────────────────────────────────────────────

function FilterBar({ active, onChange }: { active: FilterKey; onChange: (k: FilterKey) => void }) {
    return (
        <div className="flex gap-1.5 flex-wrap">
            {(Object.keys(FILTER_LABELS) as FilterKey[]).map(key => (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                        active === key
                            ? 'bg-foreground text-background border-foreground'
                            : 'bg-card text-muted-foreground border-border hover:text-foreground'
                    }`}
                >
                    {FILTER_LABELS[key]}
                </button>
            ))}
        </div>
    )
}

// ── Pending expense card ──────────────────────────────────────────────────────

type PendingExpense = typeof PENDING_EXPENSES[0]

function ExpenseCard({ exp, expanded, onToggleExpand }: {
    exp: PendingExpense
    expanded: boolean
    onToggleExpand: () => void
}) {
    return (
        <div className={`bg-card border rounded-xl p-4 space-y-3 ${exp.focus ? 'border-ai/30' : 'border-border'}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{exp.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Approved by {exp.approvedBy} · {exp.approvedDate}
                        {exp.ageDays > 0 ? ` · ${exp.ageDays} day${exp.ageDays > 1 ? 's' : ''} in queue` : ' · Just arrived'}
                    </p>
                </div>
                <p className="text-sm font-bold text-foreground shrink-0">{exp.amount}</p>
            </div>

            {/* GL badge */}
            <button
                onClick={exp.focus ? undefined : onToggleExpand}
                className={`flex items-center gap-2 ${!exp.focus ? 'hover:opacity-80 transition-opacity cursor-pointer' : 'cursor-default'}`}
            >
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-ai bg-ai/10 border border-ai/20 px-2 py-1 rounded-full">
                    <Sparkles className="h-2.5 w-2.5" />
                    GL pre-filled · {exp.glLines.length} line{exp.glLines.length > 1 ? 's' : ''} ready
                </span>
                {!exp.focus && (
                    <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
                )}
            </button>

            {/* Inline GL preview — non-focus cards */}
            {!exp.focus && expanded && (
                <div className="border border-border rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    {exp.glLines.map((line, i) => (
                        <div key={line.code} className={`flex items-center justify-between px-3 py-2 gap-2 ${i > 0 ? 'border-t border-border' : ''}`}>
                            <div className="flex items-center gap-1.5 min-w-0">
                                <Sparkles className="h-2.5 w-2.5 text-ai shrink-0" />
                                <span className="text-[11px] text-foreground truncate">{line.code}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] font-mono text-foreground">{line.amount}</span>
                                <ConfidencePill pct={line.confidence} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* GL lines preview — focus card shows inline, non-focus cards expand on demand */}
            {exp.focus && (
                <div className="border border-border rounded-lg overflow-hidden">
                    {exp.glLines.map((line, i) => (
                        <div key={line.code} className={`flex items-center justify-between px-3 py-2 gap-2 ${i > 0 ? 'border-t border-border' : ''}`}>
                            <div className="flex items-center gap-1.5 min-w-0">
                                <Sparkles className="h-2.5 w-2.5 text-ai shrink-0" />
                                <span className="text-[11px] text-foreground truncate">{line.code}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] font-mono text-foreground">{line.amount}</span>
                                <ConfidencePill pct={line.confidence} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Non-focus toggle */}
            {!exp.focus && (
                <button
                    onClick={onToggleExpand}
                    className="w-full text-xs text-muted-foreground py-2 rounded-lg hover:text-foreground border border-border transition-colors"
                >
                    {expanded ? 'Hide GL preview' : 'Review GL →'}
                </button>
            )}
        </div>
    )
}

// ── Posted expense card (compact, read-only) ──────────────────────────────────

type PostedExpense = typeof POSTED_EXPENSES[0]

function PostedCard({ exp }: { exp: PostedExpense }) {
    return (
        <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{exp.name}</p>
                    <p className="text-[10px] text-muted-foreground">{exp.postedDate} · {exp.postedGl}</p>
                </div>
            </div>
            <div className="text-right shrink-0">
                <p className="text-xs font-bold text-foreground">{exp.amount}</p>
                <p className="text-[10px] text-success font-medium">Posted to CORE ✓</p>
            </div>
        </div>
    )
}

// ── Confidence pill ───────────────────────────────────────────────────────────

function ConfidencePill({ pct }: { pct: number }) {
    const color = pct >= 90 ? 'text-success bg-success/10' : pct >= 75 ? 'text-warning bg-warning/10' : 'text-muted-foreground bg-muted'
    return (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>{pct}%</span>
    )
}
