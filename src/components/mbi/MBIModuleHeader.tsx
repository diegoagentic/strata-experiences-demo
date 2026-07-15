/**
 * COMPONENT: MBIModuleHeader
 * PURPOSE: Per-module header that surfaces (a) the owner-tone outcome, (b) the
 *          critical/high pain points the module addresses, and (c) the Phase 1-4
 *          deployment roadmap so MBI can "unitize" and Avanto can price by
 *          module-phase. Apr 23 stakeholder ask from Matt.
 *
 * USED BY: MBIAccountingPage · MBIBudgetPage · MBIQuotesPage · MBIDesignPage
 *
 * PROPS:
 *   - module: PainModule          which AI module this header describes
 *   - outcome: string             1-line owner-tone outcome statement
 *   - tint?: tone                 visual tint for the header card and chips
 *
 * STATES:
 *   - default                     pain cluster collapsed (top 3 critical+high)
 *   - expanded                    user clicks "show all N pain points"
 *   - phase-detail                user clicks a phase chip → expands deliverables
 *
 * DS TOKENS USED:
 *   - bg-card · border-border · rounded-2xl · text-foreground / muted-foreground
 *   - StatusBadge tones (primary/ai/info/success) for phase chips
 */

import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight, Layers, Award } from 'lucide-react'
import {
    PAIN_POINTS_BY_MODULE,
    MODULE_PHASES_BY_MODULE,
    type PainModule,
    type PainPoint,
    type ModulePhase,
} from '../../config/profiles/mbi-data'
import { StatusBadge } from '../shared'
import { useDemo } from '../../context/DemoContext'

type Tint = 'ai' | 'primary' | 'info' | 'success'

interface MBIModuleHeaderProps {
    module: PainModule
    outcome: string
    tint?: Tint
}

const SEVERITY_STYLE: Record<PainPoint['severity'], { dot: string; label: string }> = {
    critical: { dot: 'bg-destructive', label: 'Critical' },
    high: { dot: 'bg-amber-500 dark:bg-amber-400', label: 'High' },
    medium: { dot: 'bg-zinc-400 dark:bg-muted0', label: 'Medium' },
}

const TINT_OUTCOME: Record<Tint, string> = {
    ai: 'border-ai/30 bg-ai/5 dark:bg-ai/10',
    primary: 'border-primary/30 bg-primary/5 dark:bg-primary/10',
    info: 'border-info/30 bg-info/5 dark:bg-info/10',
    success: 'border-success/30 bg-success/5 dark:bg-success/10',
}

export default function MBIModuleHeader({ module, outcome, tint = 'ai' }: MBIModuleHeaderProps) {
    const allPains = PAIN_POINTS_BY_MODULE[module]
    const phases = MODULE_PHASES_BY_MODULE[module]
    const criticalAndHigh = allPains.filter(p => p.severity === 'critical' || p.severity === 'high')
    const headlinePains = criticalAndHigh.slice(0, 3)
    const remaining = allPains.length - headlinePains.length

    const [showAllPains, setShowAllPains] = useState(false)
    const visiblePains = showAllPains ? allPains : headlinePains

    // Auto-compact when the demo tour is driving a step on this page —
    // collapses the pain cluster + Phase 1-4 into expandable summaries so
    // the wizard scene below isn't pushed off-fold on smaller laptops.
    const { isDemoActive } = useDemo()
    const [forceExpanded, setForceExpanded] = useState(false)
    const compact = isDemoActive && !forceExpanded

    return (
        <div className="space-y-3">
            {/* Outcome statement — the most vendible line, given visual priority */}
            <div className={`border rounded-2xl p-4 flex items-start gap-3 ${TINT_OUTCOME[tint]}`}>
                <div className="h-9 w-9 rounded-lg bg-background/60 dark:bg-zinc-900/40 border border-border flex items-center justify-center text-foreground shrink-0">
                    <Award className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Outcome for MBI
                    </div>
                    <div className="text-base font-semibold text-foreground leading-snug mt-1">
                        {outcome}
                    </div>
                </div>
                {compact && (
                    <button
                        onClick={() => setForceExpanded(true)}
                        className="shrink-0 text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider flex items-center gap-1 self-center"
                        aria-label="Show pain points and Phase 1-4 roadmap"
                    >
                        Details
                        <ChevronDown className="h-3 w-3" />
                    </button>
                )}
            </div>

            {/* Pain cluster + Phase 1-4 — hidden when compact (demo tour active).
                Two columns on md+, stacked on mobile. */}
            {!compact && <>
            {isDemoActive && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setForceExpanded(false)}
                        className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider"
                    >
                        Hide details
                    </button>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                {/* Pain points (2/5) */}
                <section className="lg:col-span-2 bg-card dark:bg-zinc-800 border border-border rounded-2xl p-4">
                    <header className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                Pain points · ranked
                            </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                            {criticalAndHigh.length} critical+high · {allPains.length} total
                        </span>
                    </header>
                    <ul className="space-y-1.5">
                        {visiblePains.map(p => (
                            <PainItem key={p.id} pain={p} />
                        ))}
                    </ul>
                    {remaining > 0 && (
                        <button
                            onClick={() => setShowAllPains(v => !v)}
                            className="mt-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                            {showAllPains ? (
                                <>
                                    <ChevronDown className="h-3 w-3" />
                                    Show top 3 only
                                </>
                            ) : (
                                <>
                                    <ChevronRight className="h-3 w-3" />
                                    Show {remaining} more
                                </>
                            )}
                        </button>
                    )}
                </section>

                {/* Phase 1-4 (3/5) */}
                <section className="lg:col-span-3 bg-card dark:bg-zinc-800 border border-border rounded-2xl p-4">
                    <header className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-foreground" />
                            <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                Phase 1-4 · price + ship by phase
                            </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">module roadmap</span>
                    </header>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {phases.map(p => (
                            <PhaseCard key={p.phase} phase={p} tint={tint} />
                        ))}
                    </div>
                </section>
            </div>
            </>}
        </div>
    )
}

function PainItem({ pain }: { pain: PainPoint }) {
    const sev = SEVERITY_STYLE[pain.severity]
    return (
        <li className="flex items-start gap-2 text-[11px]">
            <span className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${sev.dot}`} aria-hidden="true" />
            <div className="min-w-0">
                <div className="text-foreground font-medium leading-snug">{pain.title}</div>
                <div className="text-muted-foreground text-[10px] mt-0.5">
                    {sev.label} · {pain.area}
                    {pain.q10Priority !== undefined && ` · Q10 ${pain.q10Priority}/10`}
                </div>
            </div>
        </li>
    )
}

function PhaseCard({ phase, tint }: { phase: ModulePhase; tint: Tint }) {
    const [open, setOpen] = useState(false)
    const tone = (phase.phase === 1 ? tint : 'info') as 'ai' | 'primary' | 'info' | 'success'

    return (
        <div className="border border-border rounded-xl bg-background/40 dark:bg-zinc-900/40 overflow-hidden">
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between gap-2 p-2.5 text-left hover:bg-background/60 dark:hover:bg-zinc-900/60 transition-colors"
                aria-expanded={open}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <StatusBadge label={`P${phase.phase}`} tone={tone} size="xs" />
                    <div className="min-w-0">
                        <div className="text-[11px] font-bold text-foreground truncate">{phase.title}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                            {phase.estimatedDuration}
                            {phase.isPilot && ' · pilot'}
                        </div>
                    </div>
                </div>
                <ChevronDown
                    className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>
            {open && (
                <div className="px-2.5 pb-2.5 pt-1 space-y-1 border-t border-border/60">
                    <div className="text-[10px] text-muted-foreground italic leading-snug">
                        {phase.summary}
                    </div>
                    <ul className="space-y-1 mt-1.5">
                        {phase.deliverables.map((d, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[10.5px] text-foreground leading-snug">
                                <span className="text-muted-foreground mt-0.5">·</span>
                                <span>{d}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
