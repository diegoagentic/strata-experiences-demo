/**
 * FreightCalculator · Automatic freight + recalc button (W10 · Wendy item 4)
 *
 * Computes freight from LTL base + zone + surcharges (lift gate, residential,
 * inside delivery) with a "Recalculate" button that re-fetches rates.
 *
 * Mock data · backend integration to FedEx/XPO/YRC pending Daniela's review.
 */

import { useEffect, useState } from 'react'
import {
    Truck,
    RotateCw,
    MapPin,
    Package,
    Plus,
    CheckCircle2,
    Sparkles,
} from 'lucide-react'

type Surcharge = 'lift-gate' | 'residential' | 'inside-delivery' | 'limited-access'

interface FreightConfig {
    deliveryZip: string
    zone: string
    ltlBase: number
    weightLbs: number
    palletCount: number
    surcharges: Record<Surcharge, boolean>
}

const SURCHARGE_META: Record<Surcharge, { label: string; cost: number }> = {
    'lift-gate': { label: 'Lift gate', cost: 95 },
    'residential': { label: 'Residential delivery', cost: 145 },
    'inside-delivery': { label: 'Inside delivery', cost: 175 },
    'limited-access': { label: 'Limited access', cost: 85 },
}

const INITIAL_CONFIG: FreightConfig = {
    deliveryZip: 'Austin, TX 78701',
    zone: 'Zone 4 · TX',
    ltlBase: 2450,
    weightLbs: 1820,
    palletCount: 6,
    surcharges: {
        'lift-gate': true,
        'residential': false,
        'inside-delivery': true,
        'limited-access': false,
    },
}

interface FreightCalculatorProps {
    /** Optional callback when freight is applied to the parent quote. */
    onApply?: (total: number) => void
}

export default function FreightCalculator({ onApply }: FreightCalculatorProps) {
    const [config, setConfig] = useState<FreightConfig>(INITIAL_CONFIG)
    const [recalculating, setRecalculating] = useState(false)
    const [applied, setApplied] = useState(false)

    const surchargeTotal = (Object.keys(config.surcharges) as Surcharge[])
        .filter(k => config.surcharges[k])
        .reduce((sum, k) => sum + SURCHARGE_META[k].cost, 0)

    const fuelSurcharge = Math.round(config.ltlBase * 0.245)
    const subtotal = config.ltlBase + surchargeTotal + fuelSurcharge
    const total = subtotal

    // Wendy item 4 · initial calc · auto-apply when total changes (after first paint)
    useEffect(() => {
        onApply?.(total)
    }, [total, onApply])

    const handleRecalculate = () => {
        setRecalculating(true)
        // Mock rate refresh · in production this hits carrier APIs
        setTimeout(() => {
            setConfig(prev => ({ ...prev, ltlBase: prev.ltlBase + Math.round((Math.random() - 0.5) * 100) }))
            setRecalculating(false)
        }, 900)
    }

    const handleApply = () => {
        setApplied(true)
        onApply?.(total)
        setTimeout(() => setApplied(false), 1800)
    }

    const toggleSurcharge = (key: Surcharge) => {
        setConfig(prev => ({
            ...prev,
            surcharges: { ...prev.surcharges, [key]: !prev.surcharges[key] },
        }))
    }

    return (
        <section aria-labelledby="freight-heading" className="rounded-xl border border-border bg-card overflow-hidden">
            <header className="px-5 py-3 border-b border-border bg-card flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
                    <Truck className="h-4 w-4 text-info" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 id="freight-heading" className="text-sm font-bold text-foreground">Freight · automatic LTL calculation</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{config.deliveryZip} · {config.zone}</p>
                </div>
                <button
                    type="button"
                    onClick={handleRecalculate}
                    disabled={recalculating}
                    aria-label="Recalculate freight rates"
                    className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-bold bg-card border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-60"
                >
                    <RotateCw className={`h-3 w-3 ${recalculating ? 'animate-spin' : ''}`} aria-hidden="true" />
                    {recalculating ? 'Refreshing…' : 'Recalculate'}
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {/* Shipment profile */}
                <div className="md:col-span-1 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Package className="h-3 w-3" aria-hidden="true" />
                        Shipment profile
                    </div>
                    <dl className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                        <dt className="text-muted-foreground">Weight</dt>
                        <dd className="text-foreground tabular-nums text-right">{config.weightLbs.toLocaleString()} lbs</dd>
                        <dt className="text-muted-foreground">Pallets</dt>
                        <dd className="text-foreground tabular-nums text-right">{config.palletCount}</dd>
                        <dt className="text-muted-foreground inline-flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" aria-hidden="true" />
                            Zone
                        </dt>
                        <dd className="text-foreground text-right">{config.zone}</dd>
                    </dl>
                </div>

                {/* Surcharges */}
                <div className="md:col-span-1 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Plus className="h-3 w-3" aria-hidden="true" />
                        Surcharges
                    </div>
                    <div className="space-y-1">
                        {(Object.keys(SURCHARGE_META) as Surcharge[]).map(k => {
                            const checked = config.surcharges[k]
                            const meta = SURCHARGE_META[k]
                            return (
                                <label key={k} className="flex items-center justify-between gap-2 text-[11px] cursor-pointer hover:bg-muted/20 rounded px-2 py-1 transition-colors">
                                    <span className="inline-flex items-center gap-2 min-w-0">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleSurcharge(k)}
                                            aria-label={`Add ${meta.label} surcharge`}
                                            className="h-3 w-3 rounded border-input"
                                        />
                                        <span className="text-foreground truncate">{meta.label}</span>
                                    </span>
                                    <span className={`tabular-nums shrink-0 ${checked ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                        +${meta.cost}
                                    </span>
                                </label>
                            )
                        })}
                    </div>
                </div>

                {/* Rate breakdown */}
                <div className="md:col-span-1 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-ai" aria-hidden="true" />
                        Rate breakdown
                    </div>
                    <dl className="grid grid-cols-2 gap-y-1 text-[11px]">
                        <dt className="text-muted-foreground">LTL base</dt>
                        <dd className="text-foreground tabular-nums text-right">${config.ltlBase.toLocaleString()}</dd>
                        <dt className="text-muted-foreground">Surcharges</dt>
                        <dd className="text-foreground tabular-nums text-right">${surchargeTotal.toLocaleString()}</dd>
                        <dt className="text-muted-foreground">Fuel (24.5%)</dt>
                        <dd className="text-foreground tabular-nums text-right">${fuelSurcharge.toLocaleString()}</dd>
                        <dt className="text-foreground font-bold pt-1 border-t border-border mt-1">Total freight</dt>
                        <dd className="text-foreground font-bold tabular-nums text-right pt-1 border-t border-border mt-1 text-base">
                            ${total.toLocaleString()}
                        </dd>
                    </dl>
                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={applied}
                        aria-label="Apply freight to quote"
                        className="w-full inline-flex items-center justify-center gap-1.5 h-8 rounded-md text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 mt-2"
                    >
                        {applied ? (
                            <>
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                Applied to quote
                            </>
                        ) : (
                            <>
                                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                Apply to quote
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="px-5 py-2 border-t border-border bg-muted/10 text-[10px] text-muted-foreground italic">
                Strata pulls rates from carrier APIs · click Recalculate to refresh · backend bridge to FedEx/XPO/YRC pending Daniela's review.
            </div>
        </section>
    )
}
