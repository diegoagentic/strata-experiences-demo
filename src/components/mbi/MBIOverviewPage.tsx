/**
 * COMPONENT: MBIOverviewPage
 * PURPOSE: Landing hub for the MBI demo. Shows the 4 AI flows as a chain
 *          (Design → Budget → Quotes → Accounting) with each card surfacing:
 *          protagonist, before/after, pain solved, and a jump CTA that routes
 *          the tour sidebar to the entry beat.
 *
 *          Also shows aggregate impact stats and the Phase 1 Pilot adoption
 *          note — the sequencing narrative (Kathy + Beth first, rest after)
 *          surfaces here too, not just inside each flow.
 *
 * USED BY: Navbar MBI → E2E Flow tab (default landing when the user clicks
 *          MBI without a demo tour active).
 */

import { useState } from 'react'
import { useDemo } from '../../context/DemoContext'
import {
    Receipt, FileText, Palette, ArrowRight, Sparkles,
    Clock, Award, Users, Building2, Network, ExternalLink,
} from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import BudgetRequestFormPreview from './BudgetRequestFormPreview'
import UpstreamPreviewSheet from './UpstreamPreviewSheet'
import { StatusBadge, type StatusTone } from '../shared'
import { MBI_TENANT } from '../../config/profiles/mbi-data'

interface FlowCard {
    number: number
    title: string
    persona: string
    personaRole: string
    personaInitials: string
    isPilot?: boolean
    isPrototype?: boolean
    /** Caption when the flow is in the codebase but NOT in the active demo tour
     *  (e.g. Design AI, removed from the tour Apr 27 but still navigable via tab). */
    availabilityNote?: string
    pain: string
    outcome: string
    timeBefore: string
    timeAfter: string
    scenes: number
    entryStepId: string
    icon: React.ReactNode
    tint: 'ai' | 'primary' | 'success' | 'info'
}

// Presentation order per Matt's Apr 23 approval: Accounting AI = Phase 1
// (Mark explicitly requested it). Budget Builder removed from the Thursday
// demo per Apr 23 stakeholder direction (Carlos): out of scope for now.
// The MBIBudgetPage component + m1.x demo tour steps are intentionally left
// in the codebase so re-enabling is a one-line change in App.tsx mbiNav.
//
// Internal step IDs (m2.x for Accounting, m3.x for Quotes, m4.x for Design)
// intentionally remain unchanged so the demo tour, per-page
// STEP_TO_WIZARD_INDEX maps, and useDemo navigation keep working.
const FLOWS: FlowCard[] = [
    {
        number: 1,
        title: 'Accounting AI',
        persona: 'Operations Manager Rowe',
        personaRole: 'Controller',
        personaInitials: 'KB',
        isPilot: true,
        isPrototype: true,
        pain: 'Daily 4-hour routine reading every bill, reconciling every PO, updating AR biweekly in Excel',
        outcome: '12 bills processed continuously as received, pending exceptions reviewed, AR aging live, collection emails sent',
        timeBefore: '4 hours',
        timeAfter: '18 min',
        scenes: 5,
        entryStepId: 'm2.1',
        icon: <Receipt className="h-5 w-5" />,
        tint: 'ai',
    },
    {
        number: 2,
        title: 'Quotes AI',
        persona: 'Design Coordinator',
        personaRole: 'Director of PM · 3.5 PCs for 29 staff',
        personaInitials: 'ML',
        pain: '2 hours of manual SIF re-entry into CORE + 4 sequential audit loops per proposal',
        outcome: 'SIF auto-imported, audit loops collapsed to 1 AI + 1 human, proposal sent',
        timeBefore: '2 hours',
        timeAfter: '12 min',
        scenes: 4,
        entryStepId: 'm3.1',
        icon: <FileText className="h-5 w-5" />,
        tint: 'info',
    },
    {
        number: 3,
        title: 'Design AI',
        persona: 'Design Manager Fane',
        personaRole: 'Designer · 8/10 trust',
        personaInitials: 'BG',
        isPilot: true,
        // Apr 27: Design removed from active tour AND from the navbar (was
        // briefly available via tab; the user removed it after seeing it
        // only added confusion). Card stays so MBI sees the module exists
        // in the roadmap, marker frames it as Phase 4 directional context.
        availabilityNote: 'Phase 4 · roadmap context · not navigable in this demo',
        pain: '"Everything is blue, this one chair is green" — spec misses slip to the client',
        outcome: 'Scan 47 BOM items in 5 min · catch palette + finish + dimension + availability issues',
        timeBefore: 'manual · sometimes missed',
        timeAfter: '< 5 min',
        scenes: 3,
        entryStepId: 'm4.1',
        icon: <Palette className="h-5 w-5" />,
        tint: 'success',
    },
]

const TINT_MAP = {
    ai: { bg: 'bg-ai/10 dark:bg-ai/15', border: 'border-ai/30', icon: 'text-ai bg-ai/15', badge: 'bg-ai/15 text-ai' },
    primary: { bg: 'bg-primary/10 dark:bg-primary/15', border: 'border-primary/30', icon: 'text-zinc-900 dark:text-primary bg-primary/10', badge: 'bg-primary/15 text-zinc-900 dark:text-primary' },
    success: { bg: 'bg-success/10 dark:bg-success/15', border: 'border-success/30', icon: 'text-success bg-success/15', badge: 'bg-success/15 text-success' },
    info: { bg: 'bg-info/10 dark:bg-info/15', border: 'border-info/30', icon: 'text-info bg-info/15', badge: 'bg-info/15 text-info' },
}

export default function MBIOverviewPage() {
    const { steps, goToStep, isDemoActive } = useDemo()
    const [upstreamPreview, setUpstreamPreview] = useState<'crm' | 'project' | null>(null)

    const jumpTo = (stepId: string) => {
        const idx = steps.findIndex(s => s.id === stepId)
        if (idx >= 0) goToStep(idx)
    }

    return (
        <MBIPageShell
            title="MBI · 3 AI modules · one platform"
            subtitle={`${MBI_TENANT.name} · ${MBI_TENANT.hq} + ${MBI_TENANT.satellite} · ${MBI_TENANT.revenue} revenue · ${MBI_TENANT.manufacturerCount}+ manufacturers`}
            icon={<Network className="h-5 w-5" />}
            activeApp="mbi-overview"
        >
            {/* Pitch banner */}
            <div className="bg-gradient-to-br from-primary/5 to-ai/5 dark:from-primary/10 dark:to-ai/10 border border-primary/30 rounded-2xl p-5 flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/15 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                    <Sparkles className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        The thesis
                    </div>
                    <div className="text-base font-bold text-foreground mt-0.5">
                        Phase 2 = Accounting AI prototype · Quotes + Design are the roadmap
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        The Thursday demo focuses on <strong className="text-foreground">Accounting AI</strong> — Mark's pick: cleanest metric, lowest risk, single owner (Kathy). Uses RPA to interact with CORE — no direct API yet.
                        <strong className="text-foreground"> Quotes AI</strong> is in the active tour as the natural Phase 4 follow-up that closes the PC handoff.
                        <strong className="text-foreground"> Design AI</strong> (Spec Check, Q10 #1 priority) lives in code and is one tab away if the conversation goes there — directional, not Phase 2.
                    </div>
                </div>
            </div>

            {/* Aggregate impact stats — one per module + Phase 1 pilots callout. */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <ImpactStat icon={<Clock className="h-4 w-4" />} value="4 hrs → 18 min" sub="Kathy · accounting queue" accent="text-ai" />
                <ImpactStat icon={<Clock className="h-4 w-4" />} value="2 hrs → 12 min" sub="Marcia · quote turnaround" accent="text-info" />
                <ImpactStat icon={<Award className="h-4 w-4" />} value="9.08/10" sub="Q10 spec check priority" accent="text-success" />
                <ImpactStat icon={<Users className="h-4 w-4" />} value="2 pilots" sub="Phase 1 · Kathy + Beth" accent="text-ai" />
            </div>

            {/* Tour CTA when the demo is inactive */}
            {!isDemoActive && (
                <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground">Walk the active tour · 9 beats</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            Start from Kathy's queue (5 beats) and continue to Marcia's PC team (4 beats). Design AI is built but kept off the navigable surface for this demo — see the Phase 4 card below for context.
                        </div>
                    </div>
                    <button
                        onClick={() => jumpTo('m2.1')}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Sparkles className="h-4 w-4" />
                        Start from Flow 1
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Where it starts — Apr 23 ask from Matt: E2E must include CRM +
                project creation, otherwise the demo opens mid-flow. These two
                cards are non-AI (existing CORE/CRM workflow); they sit upstream
                of the 4 AI modules and explain where every project enters the
                pipeline. Visual style is intentionally muted vs the AI flows. */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <div className="text-xs font-bold text-foreground uppercase tracking-wider">Where it starts · upstream of AI</div>
                    <div className="flex-1 h-px bg-border" />
                    <div className="text-[10px] text-muted-foreground">CORE + CRM · existing workflow · no AI changes here</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <UpstreamCard
                        icon={<Users className="h-4 w-4" />}
                        title="CRM · Lead capture"
                        meta="Sales · Account Manager"
                        body="Sales team logs the opportunity in CORE — client, vertical, contract context (HNI / Allsteel / HealthTrust), rough scope, expected ceiling."
                        onClick={() => setUpstreamPreview('crm')}
                    />
                    <UpstreamCard
                        icon={<Building2 className="h-4 w-4" />}
                        title="Project Creation"
                        meta="PC · auto-numbered, contract-tagged"
                        body="Project record opens in CORE with auto-numbering, contract identified, scope locked, salesperson + healthcare-vertical flags set. Now Strata takes over."
                        onClick={() => setUpstreamPreview('project')}
                    />
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground py-1">
                    <ArrowRight className="h-3 w-3 rotate-90" />
                    <span className="uppercase tracking-wider font-bold">Strata picks up here</span>
                    <ArrowRight className="h-3 w-3 rotate-90" />
                </div>
            </div>

            {/* 4-flow chain */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <div className="text-xs font-bold text-foreground uppercase tracking-wider">The 3 AI modules</div>
                    <div className="flex-1 h-px bg-border" />
                    <div className="text-[10px] text-muted-foreground">Accounting AI (Phase 2 · active demo) → Quotes AI (Phase 4) → Design AI (Phase 4 · directional)</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {FLOWS.map(flow => (
                        <FlowCardView key={flow.entryStepId} flow={flow} onLaunch={() => jumpTo(flow.entryStepId)} />
                    ))}
                </div>
            </div>

            {/* Adoption sequencing callout */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-2xl p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-ai/15 text-ai flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <div className="text-[10px] font-bold text-ai uppercase tracking-wider">
                        Phase 1 · pilot before rollout
                    </div>
                    <div className="text-sm font-bold text-foreground mt-0.5">
                        Deploy to the 8/10, not the 1/10
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        MBI's AI-trust scores vary wildly (design team Q4 avg <strong className="text-foreground">3.3/10</strong>, Carrie at 1/10).
                        Rogers Diffusion says start with the early adopters — <strong className="text-foreground">Operations Manager Rowe</strong> (8/10, Controller) and
                        <strong className="text-foreground"> Design Manager Fane</strong> (8/10, Designer). Their visible wins unlock team-wide adoption in Phase 2.
                    </div>
                </div>
            </div>

            {/* Future state preview — Apr 23 ask from Matt: show MBI the
                Budget Request Form trigger they'll see in the future state.
                Marked clearly as "to validate" so it doesn't read like a
                promise. Lives here on the Overview because Budget Builder
                itself is out of the Thursday demo (Carlos). */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <div className="text-xs font-bold text-foreground uppercase tracking-wider">Future state · what's coming</div>
                    <div className="flex-1 h-px bg-border" />
                    <div className="text-[10px] text-muted-foreground">Validate the field set with MBI in the Phase 1 design session</div>
                </div>
                <BudgetRequestFormPreview />
            </div>

            <UpstreamPreviewSheet
                kind={upstreamPreview}
                onClose={() => setUpstreamPreview(null)}
            />
        </MBIPageShell>
    )
}

function FlowCardView({ flow, onLaunch }: { flow: FlowCard; onLaunch: () => void }) {
    const tint = TINT_MAP[flow.tint]
    return (
        <div className={`border rounded-2xl p-4 flex flex-col gap-3 ${tint.bg} ${tint.border}`}>
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${tint.icon}`}>
                    {flow.icon}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge label={`Flow ${flow.number}`} tone={flow.tint as StatusTone} size="xs" />
                        {flow.isPrototype && (
                            <StatusBadge label="Prototype" tone="primary" size="xs" />
                        )}
                        {flow.availabilityNote && (
                            <StatusBadge label="Outside tour" tone="warning" size="xs" />
                        )}
                        <span className="text-[9px] text-muted-foreground">{flow.scenes} scenes</span>
                    </div>
                    <div className="text-base font-bold text-foreground leading-tight mt-0.5">{flow.title}</div>
                </div>
            </div>

            {/* Persona row */}
            <div className="flex items-center gap-2.5 bg-background/60 dark:bg-zinc-900/40 border border-border rounded-lg p-2.5">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${tint.icon}`}>
                    {flow.personaInitials}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-foreground truncate">{flow.persona}</span>
                        {flow.isPilot && (
                            <StatusBadge
                                label="Phase 1 Pilot"
                                tone="ai"
                                size="xs"
                                icon={<Award className="h-2.5 w-2.5" />}
                            />
                        )}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{flow.personaRole}</div>
                </div>
            </div>

            {/* Availability note for flows kept in code but excluded from the active tour */}
            {flow.availabilityNote && (
                <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-lg px-2.5 py-1.5 text-[10px] text-foreground leading-snug">
                    <strong className="text-amber-700 dark:text-amber-400">Note:</strong> {flow.availabilityNote}
                </div>
            )}

            {/* Pain → Outcome */}
            <div className="space-y-1.5">
                <div className="bg-background/60 dark:bg-zinc-900/40 border border-border rounded-lg p-2.5">
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Before</div>
                    <div className="text-[11px] text-foreground leading-snug">{flow.pain}</div>
                </div>
                <div className="bg-background/60 dark:bg-zinc-900/40 border border-border rounded-lg p-2.5">
                    <div className="text-[9px] font-bold text-success uppercase tracking-wider mb-0.5">With Strata</div>
                    <div className="text-[11px] text-foreground leading-snug">{flow.outcome}</div>
                </div>
            </div>

            {/* Time strip + CTA */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-current/10">
                <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-muted-foreground line-through">{flow.timeBefore}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-success font-bold">{flow.timeAfter}</span>
                </div>
                {flow.availabilityNote ? (
                    <span className="text-[10px] font-bold text-muted-foreground px-3 py-1.5 rounded-lg bg-muted/60 border border-border cursor-default">
                        Roadmap · not in tour
                    </span>
                ) : (
                    <button
                        onClick={onLaunch}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-opacity hover:opacity-90 shadow-sm ${tint.badge}`}
                    >
                        Start Flow {flow.number}
                        <ArrowRight className="h-3 w-3" />
                    </button>
                )}
            </div>
        </div>
    )
}

function UpstreamCard({
    icon,
    title,
    meta,
    body,
    onClick,
}: {
    icon: React.ReactNode
    title: string
    meta: string
    body: string
    onClick?: () => void
}) {
    const interactive = !!onClick
    const Wrapper: React.ElementType = interactive ? 'button' : 'div'
    return (
        <Wrapper
            onClick={onClick}
            className={`text-left bg-card dark:bg-zinc-800 border border-border rounded-2xl p-4 flex flex-col gap-2 transition-all ${
                interactive ? 'hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm cursor-pointer' : ''
            }`}
        >
            <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-background/60 dark:bg-zinc-900/40 border border-border flex items-center justify-center text-muted-foreground shrink-0">
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Pre-AI · existing</div>
                    <div className="text-sm font-bold text-foreground leading-tight mt-0.5">{title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{meta}</div>
                </div>
                {interactive && (
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" aria-hidden="true" />
                )}
            </div>
            <p className="text-[11px] text-foreground leading-snug">{body}</p>
            {interactive && (
                <div className="text-[10px] font-bold text-info uppercase tracking-wider">
                    Click to preview the form →
                </div>
            )}
        </Wrapper>
    )
}

function ImpactStat({
    icon,
    value,
    sub,
    accent = 'text-foreground',
}: {
    icon: React.ReactNode
    value: string
    sub: string
    accent?: string
}) {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl p-3">
            <div className={`flex items-center gap-2 ${accent}`}>
                {icon}
                <span className="text-base font-bold tabular-nums leading-none truncate">{value}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1.5">{sub}</div>
        </div>
    )
}
