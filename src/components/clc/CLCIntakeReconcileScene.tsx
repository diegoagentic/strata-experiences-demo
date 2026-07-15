import { useState, useMemo } from 'react'
import { Check, X, ArrowRight, Sparkles, CheckCircle2, ChevronDown, ChevronRight, Clock, FileCheck2 } from 'lucide-react'
import { INTAKE_QUESTIONS, type IntakeQuestion } from './shared/intakeData'
import CLCFilterBar, { type StatusOption } from './shared/CLCFilterBar'
import CLCSummaryChipsBar, { type SummaryChip } from './shared/CLCSummaryChipsBar'

type Decision = 'pending' | 'approved' | 'rejected'
type DecisionMap = Record<string, Decision>

const STATUS_OPTIONS: StatusOption[] = [
    { key: 'match',        label: 'Match' },
    { key: 'mismatch',     label: 'Mismatch' },
    { key: 'iq-blank',     label: 'IQ blank' },
    { key: 'survey-blank', label: 'Survey blank' },
]

/**
 * Flow 3 — Reconcile scene (clc3.3).
 * Two-column diff · IQ value (left) vs survey answer (right) · status chips per field.
 * Operator resolves each row · approved changes queue for IQ batch sync.
 *
 * Additive in Phase D: summary chips + filter bar on top.
 */
export default function CLCIntakeReconcileScene() {
    const [decisions, setDecisions] = useState<DecisionMap>(() => {
        const initial: DecisionMap = {}
        for (const q of INTAKE_QUESTIONS) initial[q.id] = 'pending'
        return initial
    })
    const [committed, setCommitted] = useState(false)
    const [expandedRow, setExpandedRow] = useState<string | null>(INTAKE_QUESTIONS.find(q => q.status !== 'match')?.id ?? null)

    // Phase D — filter state
    const [statuses, setStatuses] = useState<string[]>([])
    const [customerQuery, setCustomerQuery] = useState('')

    // Filtered questions for table rendering
    const filteredQuestions = useMemo(() => {
        return INTAKE_QUESTIONS.filter(q => {
            if (statuses.length > 0 && !statuses.includes(q.status)) return false
            if (customerQuery && !q.label.toLowerCase().includes(customerQuery.toLowerCase())) return false
            return true
        })
    }, [statuses, customerQuery])

    const counts = useMemo(() => {
        const c = { match: 0, mismatch: 0, iqBlank: 0, surveyBlank: 0 }
        for (const q of INTAKE_QUESTIONS) {
            if (q.status === 'match') c.match++
            else if (q.status === 'mismatch') c.mismatch++
            else if (q.status === 'iq-blank') c.iqBlank++
            else if (q.status === 'survey-blank') c.surveyBlank++
        }
        return c
    }, [])

    const needsAction = INTAKE_QUESTIONS.filter(q => q.status !== 'match')
    const resolvedCount = needsAction.filter(q => decisions[q.id] !== 'pending').length
    const allResolved = resolvedCount === needsAction.length

    const decide = (id: string, choice: Decision) => {
        setDecisions(prev => ({ ...prev, [id]: choice }))
    }

    const commit = () => {
        setCommitted(true)
        window.dispatchEvent(new CustomEvent('clc:intake-iq-writeback-queued', { detail: { decisions } }))
    }

    // Summary chips (additive)
    const chips: SummaryChip[] = [
        {
            id: 'fields',
            label: `${INTAKE_QUESTIONS.length} fields`,
            count: INTAKE_QUESTIONS.length,
            tone: 'neutral',
            panelTitle: 'All intake fields',
            panel: <ChipPanelList items={INTAKE_QUESTIONS.map(q => `${q.label} · ${q.status}`)} empty="No fields." />,
        },
        {
            id: 'attention',
            label: `${needsAction.length} need attention`,
            count: needsAction.length,
            tone: 'warning',
            pulse: !committed && resolvedCount < needsAction.length,
            panelTitle: 'Fields needing attention',
            panel: <ChipPanelList items={needsAction.map(q => `${q.label} · ${q.status}`)} empty="All clean." />,
        },
        {
            id: 'resolved',
            label: `${resolvedCount} resolved`,
            count: resolvedCount,
            tone: 'info',
            panelTitle: 'Resolved fields',
            panel: <ChipPanelList items={needsAction.filter(q => decisions[q.id] !== 'pending').map(q => `${q.label} · ${decisions[q.id]}`)} empty="No fields resolved yet." />,
        },
        {
            id: 'queued',
            label: `${committed ? needsAction.length : 0} queued`,
            count: committed ? needsAction.length : 0,
            tone: 'success',
            pulse: committed,
            panelTitle: 'Queued for IQ batch sync',
            panel: <ChipPanelList items={committed ? needsAction.filter(q => decisions[q.id] === 'approved').map(q => q.label) : []} empty="Nothing queued yet · resolve fields and click 'Queue corrections for IQ' below." />,
        },
    ]

    return (
        <div className="flex flex-col h-full bg-muted/5">
            {/* Header */}
            <header className="flex items-start gap-3 px-5 pt-5 pb-3">
                <div className="h-9 w-9 rounded-xl bg-brand-300/40 dark:bg-brand-500/20 flex items-center justify-center shrink-0">
                    <FileCheck2 className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                </div>
                <div className="min-w-0">
                    <div className="text-base font-bold text-foreground">Reconcile · Project Intake</div>
                    <p className="text-xs text-muted-foreground">Fairport Public Library · compare survey answers vs IQ record · queue corrections for IQ batch sync.</p>
                </div>
            </header>

            {/* Summary chips */}
            <CLCSummaryChipsBar chips={chips} />

            {/* Filter bar — status pills + field search only */}
            <CLCFilterBar
                statuses={statuses}
                onStatuses={setStatuses}
                statusOptions={STATUS_OPTIONS}
                customerQuery={customerQuery}
                onCustomerQuery={setCustomerQuery}
                customerPlaceholder="Search field name…"
                showDateRange={false}
                showRegion={false}
            />

            {/* Body */}
            <section className="flex-1 overflow-y-auto px-5 pb-5 pt-3 space-y-4">
                {/* Original count tiles (kept inside body for at-a-glance) */}
                <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="grid grid-cols-4 gap-2">
                        <CountTile label="Match" count={counts.match} color="green" />
                        <CountTile label="Mismatch" count={counts.mismatch} color="red" />
                        <CountTile label="IQ blank" count={counts.iqBlank} color="amber" />
                        <CountTile label="Survey blank" count={counts.surveyBlank} color="muted" />
                    </div>
                </div>

            {/* Diff table */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="grid grid-cols-[40px_1fr_1.4fr_1.4fr_140px_180px] gap-2 px-4 py-2.5 bg-muted/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span></span>
                    <span>Field</span>
                    <span>IQ value</span>
                    <span>Survey answer</span>
                    <span>Status</span>
                    <span className="text-right">Your call</span>
                </div>
                <div className="divide-y divide-border">
                    {filteredQuestions.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                            No fields match the current filters. Adjust above to widen the diff.
                        </div>
                    ) : filteredQuestions.map((q) => {
                        const idx = INTAKE_QUESTIONS.indexOf(q)
                        const isOpen = expandedRow === q.id
                        const decision = decisions[q.id]
                        return (
                            <div key={q.id}>
                                <div className={`grid grid-cols-[40px_1fr_1.4fr_1.4fr_140px_180px] gap-2 px-4 py-3 items-center text-sm ${q.status === 'match' ? '' : 'bg-amber-50/30 dark:bg-amber-500/5'}`}>
                                    <button
                                        onClick={() => setExpandedRow(isOpen ? null : q.id)}
                                        className="p-1 hover:bg-muted rounded transition-colors"
                                    >
                                        {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                                    </button>
                                    <div className="min-w-0">
                                        <div className="font-semibold text-foreground truncate">{q.label}</div>
                                        <div className="text-[10px] text-muted-foreground">Q{idx + 1}</div>
                                    </div>
                                    <div className="text-xs text-muted-foreground line-clamp-1 font-mono">
                                        {q.iqValue ?? <em className="text-muted-foreground/60">— blank —</em>}
                                    </div>
                                    <div className={`text-xs line-clamp-1 ${q.status === 'mismatch' || q.status === 'iq-blank' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                                        {q.customerAnswer}
                                    </div>
                                    <StatusChip status={q.status} />
                                    <div className="text-right">
                                        {q.status === 'match' ? (
                                            <span className="text-[11px] text-muted-foreground">No action</span>
                                        ) : committed ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-yellow-700 dark:text-yellow-300">
                                                <Clock className="h-3 w-3" />
                                                Queued
                                            </span>
                                        ) : (
                                            <DecisionPills
                                                decision={decision}
                                                onDecide={(d) => decide(q.id, d)}
                                            />
                                        )}
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="px-4 pb-4 pt-1 bg-muted/10 grid grid-cols-1 lg:grid-cols-2 gap-3">
                                        <div className="rounded-lg border border-border bg-card p-3">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">IQ value</div>
                                            <div className="text-sm font-mono text-foreground leading-relaxed">
                                                {q.iqValue ?? <em className="text-muted-foreground">— field is blank in IQ —</em>}
                                            </div>
                                        </div>
                                        <div className={`rounded-lg border p-3 ${q.status === 'match' ? 'border-border bg-card' : 'border-blue-200 bg-blue-50/40 dark:border-blue-500/30 dark:bg-blue-500/10'}`}>
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Survey answer</div>
                                            <div className="text-sm text-foreground leading-relaxed">
                                                {q.customerAnswer}
                                            </div>
                                            {q.helper && <div className="text-xs text-muted-foreground mt-1.5">{q.helper}</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Commit footer */}
            <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                <div className="text-xs text-muted-foreground flex-1">
                    {committed ? (
                        <span className="text-foreground font-semibold">Approved changes queued for IQ batch sync · next window 2am ET tonight.</span>
                    ) : allResolved ? (
                        <span><strong className="text-foreground">All {needsAction.length} gaps resolved</strong> · ready to queue corrections.</span>
                    ) : (
                        <span><strong className="text-foreground">{resolvedCount} of {needsAction.length}</strong> gaps resolved · accept or reject each to continue.</span>
                    )}
                </div>
                <button
                    disabled={!allResolved || committed}
                    onClick={commit}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {committed ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                    {committed ? 'Queued for IQ batch sync' : 'Queue corrections for IQ'}
                </button>
            </div>
            </section>
        </div>
    )
}

// ─── Chip panel helper ──────────────────────────────────────────────────────

function ChipPanelList({ items, empty }: { items: string[]; empty: string }) {
    return (
        <div className="p-3">
            {items.length === 0 ? (
                <p className="text-xs text-muted-foreground">{empty}</p>
            ) : (
                <ul className="space-y-1">
                    {items.map((s, i) => (
                        <li key={i} className="text-xs text-foreground truncate">· {s}</li>
                    ))}
                </ul>
            )}
        </div>
    )
}

// ─── Bits ────────────────────────────────────────────────────────────────────

function CountTile({ label, count, color }: { label: string; count: number; color: 'green' | 'red' | 'amber' | 'muted' }) {
    const colorClass = {
        green: 'border-green-200 bg-green-50/60 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300',
        red:   'border-red-200 bg-red-50/60 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        amber: 'border-amber-200 bg-amber-50/60 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        muted: 'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-300',
    }[color]
    return (
        <div className={`rounded-lg border p-3 ${colorClass}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider">{label}</div>
            <div className="text-2xl font-bold mt-1">{count}</div>
        </div>
    )
}

function StatusChip({ status }: { status: IntakeQuestion['status'] }) {
    const meta = {
        'match':         { label: 'Match',        classes: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300' },
        'mismatch':      { label: 'Mismatch',     classes: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300' },
        'iq-blank':      { label: 'IQ blank',     classes: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
        'survey-blank':  { label: 'Survey blank', classes: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300' },
    }[status]
    return (
        <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider w-fit ${meta.classes}`}>
            {meta.label}
        </span>
    )
}

function DecisionPills({ decision, onDecide }: { decision: Decision; onDecide: (d: Decision) => void }) {
    return (
        <div className="inline-flex items-center gap-1">
            <button
                onClick={() => onDecide('approved')}
                title="Approve · queue this update to IQ"
                className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                    decision === 'approved'
                        ? 'bg-green-600 text-white'
                        : 'bg-transparent text-muted-foreground ring-1 ring-border hover:bg-muted hover:text-foreground'
                }`}
            >
                <Check className="h-3 w-3" />
                Accept
            </button>
            <button
                onClick={() => onDecide('rejected')}
                title="Reject · keep the IQ value, ignore the survey answer"
                className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                    decision === 'rejected'
                        ? 'bg-red-600 text-white'
                        : 'bg-transparent text-muted-foreground ring-1 ring-border hover:bg-muted hover:text-foreground'
                }`}
            >
                <X className="h-3 w-3" />
                Reject
            </button>
        </div>
    )
}
