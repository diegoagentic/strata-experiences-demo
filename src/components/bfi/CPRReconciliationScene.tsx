/**
 * COMPONENT: CPRReconciliationScene
 * PURPOSE: Flow 1 · Scene 6 — Certified Payroll Records vs quoted hours.
 *
 * Micro-interaction: Per-line approval with individual override
 *   Each discrepancy line can be:
 *     → Approved as-is (accept CPR hours)
 *     → Edited with reason (override via ReasonDialog)
 *   After ALL discrepancy lines resolved → "Approve CPR review" unlocks.
 *
 * Real process: Lauren goes line by line manually (~45–60 min).
 *   75% of orders have at least one discrepancy. Payment-critical.
 *
 * DS TOKENS: bg-card · bg-amber-50 · bg-success/5 · border-border
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, CheckCircle2, AlertTriangle, Building2, Edit3, ArrowRight } from 'lucide-react'
import { ReasonDialog } from '../shared'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface CPRLine {
    id: string
    category: string
    quoted: string
    cpr: string
    diff: string | null
    impact: string | null
    ok: boolean
}

const CPR_LINES: CPRLine[] = [
    { id: 'teamsters',       category: 'Teamsters',       quoted: '24h', cpr: '24h', diff: null,  impact: null,      ok: true  },
    { id: 'carpenters',      category: 'Carpenters',      quoted: '50h', cpr: '45h', diff: '-5h', impact: '-$1,800', ok: false },
    { id: 'ot-carpenters',   category: 'OT Carpenters',   quoted: '8h',  cpr: '6h',  diff: '-2h', impact: '-$540',   ok: false },
    { id: 'inside-delivery', category: 'Inside Delivery', quoted: '4h',  cpr: '4h',  diff: null,  impact: null,      ok: true  },
]

const EDIT_REASONS = [
    { id: 'verified-cpr',   label: 'CPR verified manually with the union' },
    { id: 'partial-work',   label: 'Partial work confirmed — hours are correct' },
    { id: 'override',       label: 'Override approved by Director' },
    { id: 'other',          label: 'Other (describe below)' },
]

type LineState = 'pending' | 'approved' | 'edited'

export default function CPRReconciliationScene() {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    // Per-line state for discrepancy lines
    const [lineStates, setLineStates] = useState<Record<string, LineState>>({
        'carpenters': 'pending',
        'ot-carpenters': 'pending',
    })
    const [editingLine, setEditingLine] = useState<string | null>(null)
    const [allApproved, setAllApproved] = useState(false)

    const discrepancyLines = CPR_LINES.filter(l => !l.ok)
    const allDiscrepanciesResolved = discrepancyLines.every(
        l => lineStates[l.id] === 'approved' || lineStates[l.id] === 'edited'
    )

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const approveLine = (id: string) => {
        setLineStates(prev => ({ ...prev, [id]: 'approved' }))
    }

    const handleApproveAll = () => {
        setAllApproved(true)
        setTimeout(pauseAware(() => nextStep()), 1400)
    }

    const totalImpact = discrepancyLines
        .map(l => l.impact ?? '$0')
        .reduce((sum, v) => sum + parseInt(v.replace(/[^0-9-]/g, '')), 0)

    return (
        <div className="space-y-4">
            {/* Stakes banner — always visible */}
            <div className="bg-warning/5 border border-warning/30 rounded-xl p-3 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Payment-critical · City of New York</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Union labor (Teamsters · Carpenters) — if any CPR line has an error →{' '}
                        <span className="font-bold text-foreground">City of NY does not pay</span>.
                        75% of orders have at least one discrepancy. CPR = Certified Payroll Records, mandated by City contracts.
                    </div>
                </div>
            </div>

            {/* Context banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">CPR Reconciliation · DOE-2847 · NYC Dept. of Education</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Strata cross-referenced quoted hours vs. certified payroll records from WIG — 2 discrepancies detected.
                        Before Strata: Lauren compared these manually line by line (~45–60 min, error-prone).
                    </div>
                </div>
            </div>

            {/* CPR table */}
            <div className="border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-5 gap-0 bg-muted/40 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="col-span-2">Category</span>
                    <span>Quoted</span>
                    <span>CPR Actual</span>
                    <span className="text-right">Impact</span>
                </div>

                {CPR_LINES.map((line) => {
                    const state = line.ok ? 'ok' : (lineStates[line.id] ?? 'pending')
                    const isResolved = state === 'approved' || state === 'edited' || line.ok

                    return (
                        <div key={line.id} className="border-t border-border">
                            <div className={`grid grid-cols-5 gap-0 px-3.5 py-2.5 text-xs transition-colors duration-300 ${
                                state === 'pending' && !line.ok
                                    ? 'bg-amber-50 dark:bg-amber-500/5'
                                    : isResolved
                                    ? allApproved ? 'bg-success/5' : ''
                                    : ''
                            }`}>
                                <span className="col-span-2 font-medium text-foreground">{line.category}</span>
                                <span className="text-muted-foreground tabular-nums">{line.quoted}</span>
                                <span className={`tabular-nums font-medium ${
                                    !line.ok && state === 'pending'
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-foreground'
                                }`}>
                                    {line.cpr}
                                    {line.diff && state === 'pending' && (
                                        <span className="ml-1 text-[10px] text-amber-500">{line.diff}</span>
                                    )}
                                </span>
                                <span className="text-right flex items-center justify-end gap-1">
                                    {line.ok && (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                    )}
                                    {!line.ok && state === 'pending' && (
                                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold tabular-nums">
                                            <AlertTriangle className="h-3 w-3 shrink-0" />
                                            {line.impact}
                                        </span>
                                    )}
                                    {!line.ok && state !== 'pending' && (
                                        <span className="inline-flex items-center gap-1 text-success">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            <span className="text-[10px] font-medium">
                                                {state === 'edited' ? 'Edited' : 'Approved'}
                                            </span>
                                        </span>
                                    )}
                                </span>
                            </div>

                            {/* Per-line actions — only for discrepancy lines in pending state */}
                            {!line.ok && state === 'pending' && !allApproved && (
                                <div className="flex items-center gap-2 px-3.5 pb-2.5 bg-amber-50 dark:bg-amber-500/5">
                                    <span className="text-[10px] text-muted-foreground flex-1">
                                        {line.category}: {line.quoted} quoted → {line.cpr} actual ({line.diff})
                                    </span>
                                    <button
                                        onClick={() => setEditingLine(line.id)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <Edit3 className="h-3 w-3" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => approveLine(line.id)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
                                    >
                                        <CheckCircle2 className="h-3 w-3" />
                                        Accept CPR
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}

                {/* Total row */}
                <div className="px-3.5 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Total adjustment</span>
                    <span className={`font-bold tabular-nums ${
                        allApproved ? 'text-success' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                        {allApproved ? '✓ Applied in CORE' : `${totalImpact < 0 ? '-' : ''}$${Math.abs(totalImpact).toLocaleString()}`}
                    </span>
                </div>
            </div>

            {/* Post-approval confirmation + chain */}
            {allApproved && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-1 duration-400">
                    <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <div className="font-bold text-foreground">CORE updated · −$2,340 applied to DOE-2847</div>
                            <div className="text-muted-foreground mt-0.5">Carpenters: 50h → 45h · OT Carpenters: 8h → 6h</div>
                        </div>
                    </div>

                    {/* Approval chain */}
                    <div className="border border-border rounded-xl p-3.5 bg-card space-y-2.5">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Chain initiated automatically</div>
                        {[
                            { actor: 'Michael (Dir. Strategic Accounts)', action: 'Notified · pre-drafted relay to Nancy', done: true  },
                            { actor: 'Nancy Bos (HM Invoice Processor)',  action: 'Invoice update required · relay pending',  done: false },
                            { actor: 'City of NY payment',                action: 'UNBLOCKED — CPR now correct',             done: false },
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <ArrowRight className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${step.done ? 'text-success' : 'text-muted-foreground'}`} />
                                <div className="text-xs">
                                    <span className={`font-medium ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.actor}</span>
                                    <span className="text-muted-foreground"> · {step.action}</span>
                                </div>
                            </div>
                        ))}
                        <div className="text-[10px] text-muted-foreground border-t border-border pt-2.5 mt-1">
                            Before Strata: this chain took 1–3 days via email + phone · now automatic
                        </div>
                    </div>
                </div>
            )}

            {/* Approve all — unlocks when all discrepancies resolved */}
            {!allApproved && allDiscrepanciesResolved && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
                    <p className="text-[11px] text-muted-foreground flex-1">
                        All discrepancies resolved · CORE will be updated and Michael notified automatically.
                    </p>
                    <button
                        onClick={handleApproveAll}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm shrink-0"
                    >
                        <Building2 className="h-3.5 w-3.5" />
                        Approve CPR review
                    </button>
                </div>
            )}

            {/* Hint when still pending */}
            {!allApproved && !allDiscrepanciesResolved && (
                <p className="text-[11px] text-muted-foreground">
                    Review each discrepancy — accept the CPR hours or edit with a reason before approving.
                </p>
            )}

            {/* Per-line ReasonDialog */}
            {editingLine !== null && (
                <ReasonDialog
                    isOpen={true}
                    onClose={() => setEditingLine(null)}
                    onSubmit={() => {
                        setLineStates(prev => ({ ...prev, [editingLine]: 'edited' }))
                        setEditingLine(null)
                    }}
                    tone="neutral"
                    title="Edit hours manually"
                    subtitle={`DOE-2847 · ${CPR_LINES.find(l => l.id === editingLine)?.category ?? ''}`}
                    categories={EDIT_REASONS}
                    defaultCategoryId="verified-cpr"
                    categoryPrompt="Reason for adjustment"
                    notesPlaceholder="e.g. CPR confirmed by Receiving Coordinator — Carpenters worked 45h per official report."
                    notesRequiredForCategoryId="other"
                    confirmLabel="Apply adjustment"
                />
            )}

            <DataSourcesBar groups={[
                { sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] },
            ]} />
        </div>
    )
}
