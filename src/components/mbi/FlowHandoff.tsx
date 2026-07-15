/**
 * COMPONENT: FlowHandoff
 * PURPOSE: Reusable narrative bridge shown at the end of any MBI flow.
 *          Three blocks:
 *            1. Recap stats (tiles)
 *            2. Downstream timeline (5 nodes showing cross-flow chain)
 *            3. Narrative time-skip + primary/secondary jump CTAs
 *
 *          Generalized from the Flow 1→2 implementation — config-driven so
 *          every flow can assemble its own recap/timeline/bridge without
 *          duplicating chrome.
 *
 * PROPS: see interfaces below.
 *
 * USED BY: OutputStep (Flow 1→2), Flow 2 wrap (→3), Flow 3 wrap (→4),
 *          Flow 4 recap (final loop).
 */

import type { ReactNode } from 'react'
import { useDemo } from '../../context/DemoContext'
import { ArrowRight, Sparkles } from 'lucide-react'

export interface FlowHandoffStat {
    icon: ReactNode
    value: string
    sub: string
    accent?: string
}

export interface FlowHandoffTimelineNode {
    status: 'done' | 'next' | 'future'
    icon: ReactNode
    label: string
    caption: string
    /** Which flow handles this stage (e.g. 'Flow 2 · Accounting AI'). Use '—' if human step only. */
    flow: string
    highlight?: boolean
}

export interface FlowHandoffCTA {
    label: string
    icon?: ReactNode
    targetStepId: string
}

interface FlowHandoffProps {
    /** Optional eyebrow text above the recap heading (e.g. 'Flow 1 complete'). */
    eyebrow?: string
    /** Bold lead line for the recap block. */
    recapHeading: string
    /** 1-line context under the heading. */
    recapSubheading?: string
    /** 3–4 stat tiles. */
    recapStats: FlowHandoffStat[]
    /** Horizontal timeline nodes. */
    timeline: FlowHandoffTimelineNode[]
    /** Narrative block — eyebrow ('3 weeks later'), title, body copy. */
    narrative: {
        eyebrow?: string
        icon?: ReactNode
        title: string
        body: ReactNode
    }
    /** Primary jump CTA (brand-colored). */
    primaryCTA: FlowHandoffCTA
    /** Optional secondary CTAs rendered as small pills. */
    secondaryCTAs?: FlowHandoffCTA[]
}

export default function FlowHandoff({
    eyebrow,
    recapHeading,
    recapSubheading,
    recapStats,
    timeline,
    narrative,
    primaryCTA,
    secondaryCTAs = [],
}: FlowHandoffProps) {
    const { steps, goToStep, isDemoActive } = useDemo()

    const goToFlow = (stepId: string) => {
        const idx = steps.findIndex(s => s.id === stepId)
        if (idx >= 0) goToStep(idx)
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Recap */}
            <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        {eyebrow && (
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                                {eyebrow}
                            </div>
                        )}
                        <div className="text-base font-bold text-foreground">{recapHeading}</div>
                        {recapSubheading && (
                            <div className="text-xs text-muted-foreground mt-0.5">{recapSubheading}</div>
                        )}
                    </div>
                </div>

                <div className={`grid gap-3 ${recapStats.length >= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
                    {recapStats.map((stat, i) => (
                        <RecapStat key={i} {...stat} />
                    ))}
                </div>
            </div>

            {/* 2. Timeline */}
            {timeline.length > 0 && (
                <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">What happens next</div>
                        <div className="flex-1 h-px bg-border" />
                        <div className="text-[10px] text-muted-foreground">One chain across MBI's AIs</div>
                    </div>

                    <ol className={`grid grid-cols-1 gap-3 ${timeline.length === 5 ? 'md:grid-cols-5' : timeline.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                        {timeline.map((node, i) => (
                            <TimelineNode key={i} {...node} />
                        ))}
                    </ol>
                </div>
            )}

            {/* 3. Narrative + CTAs */}
            <div className="bg-gradient-to-br from-primary/5 to-ai/5 dark:from-primary/10 dark:to-ai/10 border border-primary/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                    {narrative.icon && (
                        <div className="h-10 w-10 rounded-xl bg-ai/15 text-ai flex items-center justify-center shrink-0">
                            {narrative.icon}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        {narrative.eyebrow && (
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                {narrative.eyebrow}
                            </div>
                        )}
                        <div className="text-sm font-bold text-foreground leading-snug">
                            {narrative.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {narrative.body}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => goToFlow(primaryCTA.targetStepId)}
                    disabled={!isDemoActive}
                    title={isDemoActive ? undefined : 'Start the demo tour to enable flow navigation'}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                    {primaryCTA.icon}
                    <span>{primaryCTA.label}</span>
                    <ArrowRight className="h-4 w-4" />
                </button>

                {secondaryCTAs.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Or jump to</span>
                        {secondaryCTAs.map((cta, i) => (
                            <button
                                key={i}
                                onClick={() => goToFlow(cta.targetStepId)}
                                disabled={!isDemoActive}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:border-primary/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {cta.icon}
                                {cta.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Recap stat tile ─────────────────────────────────────────────────────────
function RecapStat({
    icon,
    value,
    sub,
    accent = 'text-foreground',
}: FlowHandoffStat) {
    return (
        <div className="bg-muted/60 dark:bg-zinc-900/40 border border-border rounded-xl p-3">
            <div className={`flex items-center gap-1.5 ${accent}`}>
                {icon}
                <span className="text-xl font-bold tabular-nums leading-none">{value}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1.5">{sub}</div>
        </div>
    )
}

// ─── Timeline node ───────────────────────────────────────────────────────────
function TimelineNode({
    status,
    icon,
    label,
    caption,
    flow,
    highlight,
}: FlowHandoffTimelineNode) {
    const isAIStep = flow !== '—'
    const theme = (() => {
        if (status === 'done') return {
            bg: 'bg-success/10 dark:bg-success/15 border-success/30',
            dotBg: 'bg-success text-white',
            labelColor: 'text-foreground',
        }
        if (highlight) return {
            bg: 'bg-ai/10 dark:bg-ai/15 border-ai/40 ring-2 ring-ai/20',
            dotBg: 'bg-ai text-white',
            labelColor: 'text-foreground',
        }
        if (status === 'next') return {
            bg: 'bg-muted/30 dark:bg-zinc-900/40 border-border',
            dotBg: 'bg-muted-foreground/30 text-muted-foreground',
            labelColor: 'text-foreground',
        }
        return {
            bg: 'bg-muted/20 dark:bg-zinc-800/30 border-border',
            dotBg: 'bg-muted text-muted-foreground',
            labelColor: 'text-muted-foreground',
        }
    })()

    return (
        <li className={`rounded-xl border p-3 flex flex-col gap-1.5 ${theme.bg}`}>
            <div className={`h-7 w-7 rounded-full flex items-center justify-center ${theme.dotBg}`}>
                {icon}
            </div>
            <div className={`text-xs font-bold leading-tight ${theme.labelColor}`}>{label}</div>
            <div className="text-[10px] text-muted-foreground">{caption}</div>
            {isAIStep && (
                <div className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${status === 'done' || highlight ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {flow}
                </div>
            )}
        </li>
    )
}
