/**
 * COMPONENT: AdoptionProgressStrip
 * PURPOSE: Visualizes Rogers Diffusion of Innovations applied to MBI's design
 *          team. Sets the story: AI trust 3.3/10 avg in Design — careful
 *          sequenced rollout starting with Design Manager Fane (8/10 Early Adopter).
 *
 *          5 tiers from Innovators → Laggards with team members tagged + counts.
 *
 * PROPS: none — uses MBI_STAKEHOLDERS
 *
 * STATES: static
 *
 * DS TOKENS: bg-card · border-border · primary (current focus) · success (done)
 *
 * USED BY: MBIDesignPage (Phase 5.A)
 */

import { Fragment } from 'react'
import { Sparkles, Users, ArrowRight, BadgeCheck } from 'lucide-react'
import { MBI_STAKEHOLDERS } from '../../config/profiles/mbi-data'

const TIERS = [
    { id: 'innovator', label: 'Innovators', pct: '2.5%', accent: 'border-success/30 bg-success/5 text-success', dotBg: 'bg-success/20 text-success' },
    { id: 'early-adopter', label: 'Early Adopters', pct: '13.5%', accent: 'border-primary/30 bg-primary/5 text-zinc-900 dark:text-primary', dotBg: 'bg-primary/20 text-zinc-900 dark:text-primary' },
    { id: 'early-majority', label: 'Early Majority', pct: '34%', accent: 'border-info/30 bg-info/5 text-info', dotBg: 'bg-info/20 text-info' },
    { id: 'late-majority', label: 'Late Majority', pct: '34%', accent: 'border-amber-300 bg-amber-50/30 dark:bg-amber-500/5 dark:border-amber-500/30 text-amber-700 dark:text-amber-400', dotBg: 'bg-amber-500/20 text-amber-700 dark:text-amber-400' },
    { id: 'laggard', label: 'Laggards', pct: '16%', accent: 'border-muted bg-muted/20 text-muted-foreground', dotBg: 'bg-muted text-muted-foreground' },
] as const

export default function AdoptionProgressStrip() {
    const designTeam = MBI_STAKEHOLDERS.filter(s => s.team === 'design')
    const beth = designTeam.find(s => s.id === 'beth-gianino')

    // Bucket design team by adoption tier
    const buckets = TIERS.reduce((acc, t) => {
        acc[t.id] = designTeam.filter(s => s.adoption === t.id)
        return acc
    }, {} as Record<string, typeof designTeam>)

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                        <Users className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Design team adoption strategy</div>
                        <div className="text-[10px] text-muted-foreground">
                            Q4 trust avg <span className="font-bold tabular-nums">3.3/10</span> — lowest in company. Sequenced rollout via Rogers Diffusion.
                        </div>
                    </div>
                </div>
                {beth && (
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-success uppercase tracking-wider inline-flex items-center gap-1">
                            <BadgeCheck className="h-3 w-3" />
                            Pilot confirmed
                        </div>
                        <div className="text-xs font-bold text-foreground">{beth.name}</div>
                        <div className="text-[10px] text-muted-foreground">Q4 {beth.q4Trust}/10 · Early Adopter</div>
                    </div>
                )}
            </div>

            {/* Pipeline row */}
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] items-stretch gap-2">
                    {TIERS.map((tier, i) => {
                        const members = buckets[tier.id]
                        return (
                            <Fragment key={tier.id}>
                                <div className={`border rounded-xl p-3 ${tier.accent}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`text-[10px] font-bold uppercase tracking-wider`}>{tier.label}</div>
                                        <div className={`text-[9px] font-bold tabular-nums px-1.5 py-0.5 rounded ${tier.dotBg}`}>{tier.pct}</div>
                                    </div>
                                    {members.length === 0 ? (
                                        <div className="text-[10px] text-muted-foreground italic">—</div>
                                    ) : (
                                        <div className="space-y-0.5">
                                            {members.map(m => (
                                                <div key={m.id} className="text-[11px] font-semibold text-foreground truncate">
                                                    {m.name}
                                                    {m.q4Trust !== undefined && (
                                                        <span className="text-[9px] text-muted-foreground ml-1 tabular-nums">({m.q4Trust}/10)</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {i < TIERS.length - 1 && (
                                    <div className="hidden md:flex items-center justify-center">
                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                )}
                            </Fragment>
                        )
                    })}
                </div>

                {/* Strategy note */}
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-ai/5 border border-ai/10 rounded-xl p-3">
                    <Sparkles className="h-4 w-4 text-ai shrink-0" />
                    <span>
                        <strong className="text-foreground">{beth?.name ?? 'Early Adopter'}</strong> pilots Spec Check Engine on her Riverside ICU project.
                        Visible success unlocks team-wide rollout. 1:1 onboarding for low-trust members <strong className="text-foreground">after</strong> early adopter success — never before.
                    </span>
                </div>
            </div>
        </div>
    )
}
