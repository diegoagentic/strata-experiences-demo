/**
 * COMPONENT: ScenarioComparisonCards
 * PURPOSE: 🌟 HERO COMPONENT — 3-column side-by-side comparison of Good/Better/Best
 *          budget scenarios with swap badges + deltas. Single-select with primary
 *          border + ring. Stagger-in animation on mount.
 *
 *          This is a NET-NEW MBI component — no equivalent in UI-Dealer,
 *          Smart Comparator, or Expert Hub. Unique 3-column comparison grammar.
 *
 * PROPS:
 *   - scenarios: Scenario[3]              — always exactly 3 (Good/Better/Best)
 *   - selected: ScenarioTier | null       — which card is selected
 *   - onSelect: (tier: ScenarioTier) => void
 *   - markupAdjustment?: Record<ScenarioTier, number>   — override markup per tier
 *                                          if defined, recalculates total
 *
 * STATES:
 *   - default  — 3 cards, none selected
 *   - selected — one card has primary border + ring-2
 *   - mount    — stagger fade-in slide-up (150ms each)
 *
 * DS TOKENS: bg-card · border-border · rounded-2xl · primary/20 ring
 *
 * USED BY: ScenariosStep
 */

import { CheckCircle2, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import { StatusBadge, type StatusTone } from '../shared'
import type { Scenario, ScenarioTier } from '../../config/profiles/mbi-data'

const TIER_META: Record<ScenarioTier, { tone: StatusTone; accent: string }> = {
    good: {
        tone: 'neutral',
        accent: 'text-muted-foreground dark:text-zinc-300',
    },
    better: {
        tone: 'primary',
        accent: 'text-zinc-900 dark:text-primary',
    },
    best: {
        tone: 'warning',
        accent: 'text-amber-600 dark:text-amber-400',
    },
}

interface ScenarioComparisonCardsProps {
    scenarios: Scenario[]
    selected: ScenarioTier | null
    onSelect: (tier: ScenarioTier) => void
    markupAdjustment?: Partial<Record<ScenarioTier, number>>
}

export default function ScenarioComparisonCards({
    scenarios,
    selected,
    onSelect,
    markupAdjustment,
}: ScenarioComparisonCardsProps) {
    // Baseline for delta computation = Mid-Range ("better")
    const baseline = scenarios.find(s => s.tier === 'better')?.total ?? scenarios[0].total

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((s, i) => {
                const isSelected = selected === s.tier
                const effectiveMarkup = markupAdjustment?.[s.tier] ?? s.markup
                const markupFactor = (1 + effectiveMarkup) / (1 + s.markup)
                const adjustedTotal = Math.round(s.total * markupFactor)
                const delta = adjustedTotal - baseline

                return (
                    <button
                        key={s.tier}
                        onClick={() => onSelect(s.tier)}
                        style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'backwards' }}
                        className={`
                            relative text-left bg-card dark:bg-zinc-800 border rounded-2xl p-5 space-y-3 transition-all
                            animate-in fade-in slide-in-from-bottom-4 duration-500
                            ${isSelected
                                ? 'border-primary ring-4 ring-primary/15 shadow-lg dark:bg-zinc-900/40'
                                : 'border-border hover:border-muted-foreground/40 hover:shadow-md'
                            }
                        `}
                    >
                        {/* Top: tier pill + recommended badge */}
                        <div className="flex items-center justify-between">
                            <StatusBadge label={s.label} tone={TIER_META[s.tier].tone} size="sm" />
                            {s.tier === 'better' && (
                                <span className="text-[10px] font-bold text-zinc-900 dark:text-primary uppercase flex items-center gap-1">
                                    ⭐ Recommended
                                </span>
                            )}
                        </div>

                        {/* Total + delta */}
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-foreground tabular-nums">
                                    ${(adjustedTotal / 1000).toFixed(1)}K
                                </span>
                                <span className="text-sm text-muted-foreground tabular-nums">
                                    / ${adjustedTotal.toLocaleString()}
                                </span>
                            </div>
                            {s.tier !== 'better' && (
                                <div className={`flex items-center gap-1 text-xs font-semibold mt-0.5 ${delta < 0 ? 'text-success' : 'text-amber-600 dark:text-amber-400'}`}>
                                    {delta < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                                    <span>{delta > 0 ? '+' : ''}${delta.toLocaleString()} vs Mid-Range</span>
                                </div>
                            )}
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground border-y border-border py-2">
                            <div>
                                <span className="font-semibold text-foreground tabular-nums">{s.lineItemCount}</span> items
                            </div>
                            <div className="h-3 w-px bg-border" />
                            <div>
                                markup <span className="font-semibold text-foreground tabular-nums">{Math.round(effectiveMarkup * 100)}%</span>
                            </div>
                        </div>

                        {/* Swaps */}
                        {s.swaps.length > 0 && s.swaps[0].delta !== 0 && (
                            <div className="space-y-1.5">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Key swaps</div>
                                {s.swaps.slice(0, 3).map((swap, j) => (
                                    <div key={j} className="text-[11px] leading-snug">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <span className="truncate">{swap.from}</span>
                                            <ArrowRight className="h-3 w-3 shrink-0" />
                                            <span className="text-foreground truncate">{swap.to}</span>
                                        </div>
                                        <div className={`text-[10px] font-bold tabular-nums ${swap.delta < 0 ? 'text-success' : 'text-amber-600 dark:text-amber-400'}`}>
                                            {swap.delta > 0 ? '+' : ''}${swap.delta.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Selected indicator */}
                        {isSelected && (
                            <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        )}
                    </button>
                )
            })}
        </div>
    )
}
