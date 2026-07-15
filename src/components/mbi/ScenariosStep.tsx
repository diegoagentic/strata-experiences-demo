/**
 * COMPONENT: ScenariosStep
 * PURPOSE: Wizard step 3 (Scenarios) — focused on the selection decision.
 *          Hero: 3 comparison cards. Below: markup slider with the live total
 *          shown inline. The full pricing breakdown moves to a DetailSheet so
 *          the surface stays focused on the choice.
 *
 * PROPS:
 *   - scenarios: Scenario[]
 *   - selectedTier: ScenarioTier | null
 *   - onSelectTier: (tier) => void
 *   - markupOverrides: Record<ScenarioTier, number>
 *   - onMarkupChange: (tier, v) => void
 *
 * DS TOKENS: bg-card · border-border · rounded-2xl · primary
 *
 * USED BY: MBIBudgetPage (wizard index 2)
 */

import { useState } from 'react'
import { DollarSign, ChevronRight } from 'lucide-react'
import ScenarioComparisonCards from './ScenarioComparisonCards'
import MarkupSlider from './MarkupSlider'
import MBIDetailSheet from './MBIDetailSheet'
import type { Scenario, ScenarioTier } from '../../config/profiles/mbi-data'

interface ScenariosStepProps {
    scenarios: Scenario[]
    selectedTier: ScenarioTier | null
    onSelectTier: (tier: ScenarioTier) => void
    markupOverrides: Partial<Record<ScenarioTier, number>>
    onMarkupChange: (tier: ScenarioTier, v: number) => void
}

export default function ScenariosStep({
    scenarios,
    selectedTier,
    onSelectTier,
    markupOverrides,
    onMarkupChange,
}: ScenariosStepProps) {
    const selected = scenarios.find(s => s.tier === selectedTier) ?? null
    const markupValue = selected ? markupOverrides[selected.tier] ?? selected.markup : 0.35
    const [breakdownOpen, setBreakdownOpen] = useState(false)

    const totals = selected ? computeTotals(selected, markupValue) : null

    return (
        <div className="space-y-4">
            {/* 3-card comparison — primary action */}
            <ScenarioComparisonCards
                scenarios={scenarios}
                selected={selectedTier}
                onSelect={onSelectTier}
                markupAdjustment={markupOverrides}
            />

            {/* Markup + total + breakdown trigger */}
            {selected && totals && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="lg:col-span-3">
                        <MarkupSlider
                            value={markupValue}
                            onChange={v => onMarkupChange(selected.tier, v)}
                        />
                    </div>
                    <button
                        onClick={() => setBreakdownOpen(true)}
                        className="lg:col-span-2 bg-card dark:bg-zinc-800 border border-border rounded-2xl p-4 text-left hover:border-primary/40 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                                    <DollarSign className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-foreground">{selected.label} total</div>
                                    <div className="text-[10px] text-muted-foreground">Live · markup {Math.round(markupValue * 100)}%</div>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-3xl font-bold text-foreground tabular-nums leading-none">
                            ${totals.total.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-zinc-900 dark:text-primary font-bold uppercase tracking-wider mt-2">
                            View breakdown
                        </div>
                    </button>
                </div>
            )}

            {/* ─── Floating breakdown ──────────────────────────────────── */}
            {selected && totals && (
                <MBIDetailSheet
                    isOpen={breakdownOpen}
                    onClose={() => setBreakdownOpen(false)}
                    title={`Pricing breakdown — ${selected.label}`}
                    subtitle={`Markup ${Math.round(markupValue * 100)}% · ${selected.lineItemCount} items · budget-grade`}
                    icon={<DollarSign className="h-4 w-4" />}
                    width="md"
                >
                    <dl className="space-y-2">
                        <Row label="Subtotal (incl. markup)" value={totals.subtotal} />
                        <Row label="Freight (10% of net)" value={totals.freight} muted />
                        <Row label="Install (12% non-union)" value={totals.install} muted />
                        <Row label="Contingency buffer" value={totals.contingency} muted />
                        <div className="pt-3 mt-3 border-t border-border">
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm font-bold text-foreground uppercase tracking-wider">Total</span>
                                <span className="text-3xl font-bold text-foreground tabular-nums">
                                    ${totals.total.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </dl>

                    <div className="mt-5 text-xs text-muted-foreground bg-muted/30 dark:bg-zinc-800 border border-border rounded-xl p-3">
                        Numbers recompute live as you tune the markup slider. This view is budget-grade — final figures are signed off in the Review step.
                    </div>
                </MBIDetailSheet>
            )}
        </div>
    )
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function computeTotals(scenario: Scenario, markup: number) {
    const factor = (1 + markup) / (1 + scenario.markup)
    const subtotal = Math.round(scenario.subtotal * factor)
    const freight = Math.round(scenario.freight * factor)
    const install = Math.round(scenario.install * factor)
    const contingency = Math.round(scenario.contingency * factor)
    return { subtotal, freight, install, contingency, total: subtotal + freight + install + contingency }
}

function Row({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <dt className={`text-sm ${muted ? 'text-muted-foreground' : 'text-foreground'}`}>{label}</dt>
            <dd className={`text-sm font-semibold tabular-nums ${muted ? 'text-muted-foreground' : 'text-foreground'}`}>
                ${value.toLocaleString()}
            </dd>
        </div>
    )
}
