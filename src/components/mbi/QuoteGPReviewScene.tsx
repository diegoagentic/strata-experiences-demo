/**
 * COMPONENT: QuoteGPReviewScene
 * PURPOSE: Flow 2 · Scene 2 — Human GP entry before CORE Quote is created.
 *          Wendy's feedback: the salesperson must provide GP% per vendor (or
 *          globally) before import. When a contract dictates cost + sell, GP
 *          is auto-applied. Otherwise the PC enters it manually.
 *
 *          Flow: AI extracts 4 fields from SIF → GP table surfaces → PC
 *          reviews/edits → Strata calculates sell prices → CORE Quote created.
 *
 * STATE MACHINE: idle → extracting → gp-ready → creating → created
 *
 * DS TOKENS: bg-card · ai / primary accents · success
 *
 * USED BY: MBIQuotesPage (wizard scene 1)
 */

import { useState, useEffect } from 'react'
import {
    Check, Sparkles, FileText, CheckCircle2,
    ArrowRight, Lock, Pencil, Loader2,
} from 'lucide-react'
import { usePauseAware } from '../../context/usePauseAware'

const CORE_STEPS = [
    'Applying GP to 7 line items · calculating sell prices',
    'Freight + install lines confirmed · $14,200 + $8,800',
    'Proposal has been created and is ready for review · $372,500 total',
]

interface GPVendor {
    id: string
    name: string
    lineCount: number
    contract: string | null
    suggestedGP: number | null
    contractGP: number | null
    locked: boolean
}

const GP_VENDORS: GPVendor[] = [
    {
        id: 'hni',
        name: 'HNI',
        lineCount: 4,
        contract: 'HNI Corporate 55%',
        suggestedGP: null,
        contractGP: 38,
        locked: true,
    },
    {
        id: 'allsteel',
        name: 'Allsteel',
        lineCount: 2,
        contract: null,
        suggestedGP: 32,
        contractGP: null,
        locked: false,
    },
    {
        id: 'custom',
        name: 'Custom / Millwork',
        lineCount: 1,
        contract: null,
        suggestedGP: null,
        contractGP: null,
        locked: false,
    },
]

type Phase = 'idle' | 'extracting' | 'gp-ready' | 'creating' | 'created'
type GPMode = 'byVendor' | 'allLines'

export default function QuoteGPReviewScene() {
    const [phase, setPhase] = useState<Phase>('gp-ready')
    const [coreStep, setCoreStep] = useState(0)
    const [gpMode, setGPMode] = useState<GPMode>('byVendor')
    const [allLinesGP, setAllLinesGP] = useState('')
    const [vendorGP, setVendorGP] = useState<Record<string, string>>({
        allsteel: '32',
        custom: '',
    })
    const { pauseAwareTimeout } = usePauseAware()

    // CORE Quote creation animation
    useEffect(() => {
        if (phase !== 'creating') return
        if (coreStep < CORE_STEPS.length) {
            return pauseAwareTimeout(() => setCoreStep(s => s + 1), 800)
        } else {
            return pauseAwareTimeout(() => setPhase('created'), 400)
        }
    }, [phase, coreStep, pauseAwareTimeout])

    const canConfirm = gpMode === 'byVendor'
        ? GP_VENDORS.filter(v => !v.locked).every(v => {
            const val = vendorGP[v.id] ?? ''
            const n = Number(val)
            return val !== '' && !isNaN(n) && n > 0 && n < 100
          })
        : (() => { const n = Number(allLinesGP); return allLinesGP !== '' && !isNaN(n) && n > 0 && n < 100 })()

    const handleConfirm = () => {
        if (!canConfirm) return
        setPhase('creating')
        setCoreStep(0)
    }

    return (
        <div className="space-y-4">
            {/* Intro banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">GP review</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Strata reads the SIF and applies the contract. When the contract dictates cost + sell, GP is auto-locked.
                        For vendors without a contract, the PC enters the target GP — then Strata calculates sell prices and creates the quote.
                    </div>
                </div>
            </div>

            {/* GP Review table */}
            {(phase === 'gp-ready' || phase === 'creating' || phase === 'created') && (
                <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <div className="text-xs font-bold text-foreground">GP review · by vendor</div>
                            <div className="text-[10px] text-muted-foreground">
                                Contract-locked lines are auto-applied · unlocked vendors require PC input
                            </div>
                        </div>
                        {phase === 'gp-ready' && (
                            <div className="flex items-center rounded-lg border border-border overflow-hidden text-[10px] font-bold">
                                <button
                                    onClick={() => setGPMode('byVendor')}
                                    className={`px-2.5 py-1.5 transition-colors ${gpMode === 'byVendor' ? 'bg-primary text-zinc-900' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    By vendor
                                </button>
                                <button
                                    onClick={() => setGPMode('allLines')}
                                    className={`px-2.5 py-1.5 transition-colors border-l border-border ${gpMode === 'allLines' ? 'bg-primary text-zinc-900' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    All lines
                                </button>
                            </div>
                        )}
                    </div>

                    {gpMode === 'byVendor' ? (
                        <div className="divide-y divide-border">
                            {/* Table header */}
                            <div className="px-4 py-2 grid grid-cols-[1fr_auto_auto_auto] gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                <div>Vendor</div>
                                <div className="text-center w-28">Contract</div>
                                <div className="text-center w-24">Target GP%</div>
                                <div className="w-6" />
                            </div>
                            {GP_VENDORS.map(vendor => (
                                <GPVendorRow
                                    key={vendor.id}
                                    vendor={vendor}
                                    value={vendor.locked ? String(vendor.contractGP) : (vendorGP[vendor.id] ?? '')}
                                    onChange={val => setVendorGP(prev => ({ ...prev, [vendor.id]: val }))}
                                    confirmed={phase === 'creating' || phase === 'created'}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-4">
                            <div className="text-xs text-muted-foreground mb-2">Apply one GP% to all 7 line items</div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        max="99"
                                        value={allLinesGP}
                                        onChange={e => setAllLinesGP(e.target.value)}
                                        placeholder="e.g. 35"
                                        disabled={phase !== 'gp-ready'}
                                        className="w-24 text-sm font-bold text-foreground bg-background border border-border rounded-lg px-3 py-2 pr-7 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                                    />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                                </div>
                                <span className="text-[11px] text-muted-foreground">applied to HNI · Allsteel · Custom</span>
                            </div>
                            <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400">
                                Note: overrides the HNI Corporate contract GP for this quote only
                            </div>
                        </div>
                    )}

                    {/* Confirm button */}
                    {phase === 'gp-ready' && (
                        <div className="px-4 py-3 border-t border-border flex items-center gap-3">
                            <button
                                onClick={handleConfirm}
                                disabled={!canConfirm}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Confirm GP
                            </button>
                            <span className="text-[10px] text-muted-foreground">
                                {canConfirm ? 'All GP values set · ready to create' : 'Enter GP for all unlocked vendors'}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* CORE Quote creation animation */}
            {(phase === 'creating' || phase === 'created') && (
                <div className={`rounded-2xl border overflow-hidden animate-in fade-in duration-300 transition-colors ${
                    phase === 'created' ? 'bg-primary/5 dark:bg-primary/10 border-primary/30' : 'bg-ai/5 dark:bg-ai/10 border-ai/30'
                }`}>
                    <div className="px-4 py-3 border-b border-inherit flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                            {phase === 'creating'
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <FileText className="h-3.5 w-3.5" />
                            }
                        </div>
                        <div>
                            <div className="text-xs font-bold text-foreground">
                                {phase === 'creating' ? 'Creating CORE Quote…' : 'Proposal ready for review'}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                Strata applies GP · calculates sell prices · creates the quote in CORE
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-3 space-y-1.5">
                        {CORE_STEPS.map((step, i) => {
                            const done = phase === 'created' || i < coreStep
                            const running = phase === 'creating' && i === coreStep
                            const visible = done || running
                            return (
                                <div
                                    key={i}
                                    className={`flex items-center gap-2 text-[11px] transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-20'}`}
                                >
                                    {done
                                        ? <Check className="h-3 w-3 text-zinc-900 dark:text-primary shrink-0" />
                                        : running
                                            ? <Loader2 className="h-3 w-3 text-zinc-900 dark:text-primary shrink-0 animate-spin" />
                                            : <div className="h-3 w-3 rounded-full border border-border shrink-0" />
                                    }
                                    <span className={done ? 'text-foreground' : 'text-muted-foreground'}>{step}</span>
                                </div>
                            )
                        })}
                    </div>
                    {phase === 'created' && (
                        <div className="px-4 pb-3 grid grid-cols-3 gap-3 text-[11px]">
                            <CoreQuoteStat label="Quote ID" value="QUOT-2026-003" mono />
                            <CoreQuoteStat label="Total" value="$372,500" highlight />
                            <CoreQuoteStat label="PC effort" value="~4 min" />
                        </div>
                    )}
                </div>
            )}

            {/* Forward cue */}
            {phase === 'created' && (
                <div className="flex items-center gap-3 text-xs bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3 animate-in fade-in duration-300">
                    <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0" />
                    <span className="flex-1 text-foreground">
                        Proposal ready. Next: Final Review
                    </span>
                </div>
            )}
        </div>
    )
}

function GPVendorRow({
    vendor,
    value,
    onChange,
    confirmed,
}: {
    vendor: GPVendor
    value: string
    onChange: (v: string) => void
    confirmed: boolean
}) {
    const isValid = value !== '' && !isNaN(Number(value)) && Number(value) > 0 && Number(value) < 100

    return (
        <div className={`px-4 py-2.5 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center text-xs ${
            vendor.locked ? 'bg-success/5 dark:bg-success/10' : ''
        }`}>
            <div className="min-w-0">
                <div className="font-bold text-foreground truncate">{vendor.name}</div>
                <div className="text-[10px] text-muted-foreground">{vendor.lineCount} line{vendor.lineCount !== 1 ? 's' : ''}</div>
            </div>
            <div className="w-28 text-center">
                {vendor.contract ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-success/15 text-success">
                        <Check className="h-2.5 w-2.5" />
                        {vendor.contract}
                    </span>
                ) : (
                    <span className="text-[10px] text-muted-foreground italic">—</span>
                )}
            </div>
            <div className="w-24 flex items-center justify-center">
                {vendor.locked ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-success">
                        <Lock className="h-3 w-3" />
                        {value}%
                    </div>
                ) : confirmed ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                        <Check className="h-3 w-3 text-success" />
                        {value}%
                    </div>
                ) : (
                    <div className="relative">
                        <input
                            type="number"
                            min="1"
                            max="99"
                            value={value}
                            onChange={e => onChange(e.target.value)}
                            placeholder={vendor.suggestedGP ? String(vendor.suggestedGP) : '—'}
                            className={`w-20 text-xs font-bold text-foreground text-right bg-background border rounded-lg px-2 py-1.5 pr-6 focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
                                value && !isValid ? 'border-destructive' : isValid ? 'border-success/50' : 'border-border'
                            }`}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                    </div>
                )}
            </div>
            <div className="w-6 flex justify-center">
                {vendor.locked
                    ? <Lock className="h-3 w-3 text-success/60" />
                    : value && isValid
                        ? <Pencil className="h-3 w-3 text-muted-foreground/40" />
                        : null
                }
            </div>
        </div>
    )
}

function CoreQuoteStat({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-lg p-2.5">
            <div className="text-[10px] text-muted-foreground">{label}</div>
            <div className={`text-sm font-bold mt-0.5 ${highlight ? 'text-success' : 'text-foreground'} ${mono ? 'font-mono text-xs' : ''}`}>
                {value}
            </div>
        </div>
    )
}
