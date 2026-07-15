// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Financial Summary Hero
// Phase 5 of WRG Demo v6 implementation
//
// Hero strip: Final Quote Price (left) · 4 metrics (center) · Generate
// Proposal CTA (right). Uses the same card surface as every other section
// so the ESTIMATOR tab reads as one coherent stack.
// ═══════════════════════════════════════════════════════════════════════════════

import { ArrowRight, Receipt, Sparkles } from 'lucide-react'
import { DELIVERY_HOURS_RATIO } from './mockData'
import type { EstimateResult } from './types'

interface FinancialSummaryHeroProps {
    ctaLabel?: string
    estimate: EstimateResult
    onGenerateProposal: () => void
    hideGenerateCTA?: boolean
    /**
     * Progress multiplier for the dual-engine calculation beat (Agent Step 4).
     * 0 = $0 across every value · 1 = real values. Values in between are
     * used while the Shell rAF-animates the count-up on w2.1. Default 1
     * (no animation).
     */
    calculationProgress?: number
    /**
     * When true the Generate Proposal CTA shows a simulated-press state
     * (ring pulse + scale-95) to tell the user the demo is auto-running
     * the action before the waterfall modal takes over.
     */
    pulseGenerateCTA?: boolean
}

function formatMoney(raw: string): string {
    const n = parseFloat(raw)
    if (Number.isNaN(n)) return '0'
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatHours(raw: string): string {
    const n = parseFloat(raw)
    if (Number.isNaN(n)) return '0'
    return n.toLocaleString('en-US', { maximumFractionDigits: 1 })
}

export default function FinancialSummaryHero({
    estimate,
    onGenerateProposal,
    hideGenerateCTA = false,
    calculationProgress = 1,
    pulseGenerateCTA = false,
    ctaLabel = 'Generate Proposal',
}: FinancialSummaryHeroProps) {
    const progress = Math.max(0, Math.min(1, calculationProgress))
    const isCalculating = progress < 1

    // Every visible number is scaled by the calc progress — rAF in the
    // Shell drives progress 0 → 1 during the dual-engine beat.
    const scaledSalesPrice = (parseFloat(estimate.salesPrice) || 0) * progress
    const scaledBaseCost = (parseFloat(estimate.totalCost) || 0) * progress
    const scaledMargin = (parseFloat(estimate.grossMargin) || 0) * progress
    const scaledTotalHours = (parseFloat(estimate.totalHours) || 0) * progress
    const scaledCrew = Math.round(estimate.crewSize * progress)

    const salesPrice = formatMoney(String(scaledSalesPrice))
    const baseCost = formatMoney(String(scaledBaseCost))
    const margin = formatMoney(String(scaledMargin))
    const marginPct = (() => {
        const sp = parseFloat(estimate.salesPrice)
        const gm = parseFloat(estimate.grossMargin)
        if (!sp) return '0'
        return ((gm / sp) * 100).toFixed(0)
    })()

    return (
        <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm p-6 overflow-hidden">
            <div className="flex items-center gap-6">

                {/* Left: Final Quote Price */}
                <div className="shrink-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        {isCalculating ? (
                            <>
                                <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                                <span className="text-indigo-600 dark:text-indigo-400">
                                    Calculating…
                                </span>
                            </>
                        ) : (
                            'Final Quote Price'
                        )}
                    </p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl text-muted-foreground">$</span>
                        <span className="text-4xl font-bold tracking-tight text-foreground tabular-nums">
                            {salesPrice}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px h-16 bg-border shrink-0" />

                {/* Center: 4 metrics */}
                <div className="flex-1 grid grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Base Cost</p>
                        <p className="text-lg font-semibold text-foreground tabular-nums">
                            ${baseCost}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">
                            Margin ({marginPct}%)
                        </p>
                        <p className="text-lg font-semibold text-foreground dark:text-primary tabular-nums">
                            ${margin}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Hours</p>
                        <p className="text-lg font-semibold text-foreground leading-tight tabular-nums">
                            {formatHours(String(scaledTotalHours))}
                        </p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5 tabular-nums">
                            {formatHours(String(scaledTotalHours * (1 - DELIVERY_HOURS_RATIO)))}
                            {' install · '}
                            {formatHours(String(scaledTotalHours * DELIVERY_HOURS_RATIO))}
                            {' delivery'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">
                            Crew Requirement
                        </p>
                        <p className="text-lg font-semibold text-foreground tabular-nums">
                            {scaledCrew}
                            <span className="text-xs font-normal text-muted-foreground ml-1">
                                installers
                            </span>
                        </p>
                    </div>
                </div>

                {/* Right: Generate Proposal CTA (hidden in proposal-review mode) */}
                {!hideGenerateCTA && (
                    <button
                        onClick={onGenerateProposal}
                        className={[
                            'shrink-0 flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-sm',
                            pulseGenerateCTA
                                ? 'scale-95 ring-4 ring-primary/50 shadow-lg shadow-primary/40 animate-pulse'
                                : '',
                        ].join(' ')}
                    >
                        <Receipt className="w-4 h-4" />
                        {ctaLabel}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    )
}
