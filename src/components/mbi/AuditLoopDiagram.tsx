/**
 * COMPONENT: AuditLoopDiagram
 * PURPOSE: ⭐ HERO visual for Quotes AI — the transformation from today's 4
 *          sequential human audit loops (Design → Compass → Sales → PC — errors
 *          still pass) to Strata's 1 AI validation + 1 human checkpoint.
 *
 *          Left side shows 4 stacked boxes ("before"). Right side shows 2
 *          consolidated boxes (1 AI + 1 human, "after"). Arrow between them
 *          with TrendingDown and "3 loops eliminated" badge.
 *
 * PROPS: none — static showcase
 *
 * DS TOKENS: bg-muted (before — faded) · bg-primary/5 (after) · success accent
 *
 * USED BY: MBIQuotesPage (Phase 4.C hero moment)
 */

import { Users, Sparkles, Eye, X, Check, TrendingDown, ArrowRight } from 'lucide-react'
import { StatusBadge } from '../shared'

const BEFORE_LOOPS = [
    { label: 'Design self-check', detail: 'Designer reviews own CET output', human: true },
    { label: 'Compass validation', detail: 'HNI quoting tool comparison', human: true },
    { label: 'Salesperson audit', detail: 'Tertiary review of SIF/BOM', human: true },
    { label: 'PC final check', detail: 'Catches what others missed', human: true },
]

const AFTER_LOOPS = [
    { label: 'Strata AI validation', detail: 'Duplicates · non-catalog pricing · qty match · SKU check', isAI: true },
    { label: 'Human checkpoint', detail: 'PC reviews AI report · signs off', isAI: false },
]

export default function AuditLoopDiagram() {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                        <TrendingDown className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Audit loop collapse · 4 → 1 + 1</div>
                        <div className="text-[10px] text-muted-foreground">
                            Today: errors still reach manufacturers despite 4 reviews. Strata: 1 AI check + 1 human sign-off.
                        </div>
                    </div>
                </div>
                <StatusBadge label="3 loops eliminated" tone="success" size="sm" />
            </div>

            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                    {/* Before — 4 loops */}
                    <div className="space-y-2">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Before · 4 sequential human reviews</div>
                        {BEFORE_LOOPS.map((loop, i) => (
                            <div key={i} className="bg-muted/20 border border-border rounded-lg px-3 py-2 flex items-center gap-2 opacity-70">
                                <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-muted-foreground">{loop.label}</div>
                                    <div className="text-[10px] text-muted-foreground truncate">{loop.detail}</div>
                                </div>
                                <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            </div>
                        ))}
                        <div className="flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400 pt-1 font-semibold">
                            <X className="h-3 w-3" />
                            Errors still reach manufacturers
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <ArrowRight className="h-5 w-5 text-zinc-900 dark:text-primary" />
                            <div className="text-[10px] font-bold text-zinc-900 dark:text-primary uppercase tracking-wider text-center">
                                Strata
                            </div>
                        </div>
                    </div>

                    {/* After — 1 + 1 */}
                    <div className="space-y-2">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">After · 1 AI check + 1 human</div>
                        {AFTER_LOOPS.map((loop, i) => (
                            <div key={i} className={`border rounded-lg px-3 py-2 flex items-center gap-2 ${loop.isAI ? 'bg-ai/5 border-ai/30' : 'bg-primary/5 border-primary/30'}`}>
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${loop.isAI ? 'bg-ai/10 text-ai' : 'bg-primary/10 text-zinc-900 dark:text-primary'}`}>
                                    {loop.isAI ? <Sparkles className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-foreground">{loop.label}</div>
                                    <div className="text-[10px] text-muted-foreground truncate">{loop.detail}</div>
                                </div>
                                <Check className="h-3.5 w-3.5 text-success shrink-0" />
                            </div>
                        ))}
                        <div className="flex items-center gap-1.5 text-[11px] text-success pt-1 font-semibold">
                            <Check className="h-3 w-3" />
                            Errors caught before PO transmission
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
