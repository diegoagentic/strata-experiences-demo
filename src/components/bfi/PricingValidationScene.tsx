/**
 * COMPONENT: PricingValidationScene
 * PURPOSE: Flow 1 · Scene 2 — SIF vs CoNY contract validation.
 *
 * Sub-interactions:
 *   1. Progressive row reveal (350ms each) — each line checks against contract
 *   2. Price mismatch auto-corrected (Filing Units $8,100 → $7,560)
 *   3. Restricted item exception — Panel System not in CoNY catalog →
 *      Strata pre-drafts email to MK designer · Lauren sends 1 click
 *   4. After restriction notice sent → "Apply & continue" CTA unlocks
 *
 * Real process replaced:
 *   Price mismatch: Quote Tool upload→wait→download cycle (~45 min)
 *   Restricted item: screenshot + manual email → wait 1-3 days (MK resolution)
 *
 * DS TOKENS: bg-card · bg-ai/5 · text-success · border-amber-*
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Send, Ban } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

type LineStatus = 'ok' | 'price' | 'restricted'

interface LineItem {
    product: string
    sif: string
    contract: string
    status: LineStatus
    restrictionNote?: string
}

const LINE_ITEMS: LineItem[] = [
    {
        product: 'Workstations (×18)',
        sif: '$108,000',
        contract: '$108,000',
        status: 'ok',
    },
    {
        product: 'Task Chairs (×18)',
        sif: '$32,400',
        contract: '$32,400',
        status: 'ok',
    },
    {
        product: 'Filing Units (×6)',
        sif: '$8,100',
        contract: '$7,560',
        status: 'price',
    },
    {
        product: 'Panel System · custom config',
        sif: '$4,200',
        contract: '—',
        status: 'restricted',
        restrictionNote: 'Not in CoNY catalog · requires MK designer substitution or removal',
    },
]

export default function PricingValidationScene() {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [sceneState, setSceneState] = useState<'idle' | 'validating'>('idle')
    const [revealedCount, setRevealedCount] = useState(0)
    const [noticeSent, setNoticeSent] = useState(false)
    const [applied, setApplied] = useState(false)

    const allRevealed = revealedCount >= LINE_ITEMS.length
    const hasRestricted = LINE_ITEMS.some(l => l.status === 'restricted')
    const ctaUnlocked = allRevealed && (!hasRestricted || noticeSent)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    // Progressive row reveal — only starts after validating begins
    useEffect(() => {
        if (sceneState !== 'validating') return
        if (revealedCount >= LINE_ITEMS.length) return
        const t = setTimeout(pauseAware(() => setRevealedCount(c => c + 1)), 400)
        return () => clearTimeout(t)
    }, [revealedCount, pauseAware, sceneState])

    const handleSendNotice = () => {
        setNoticeSent(true)
    }

    const handleApply = () => {
        setApplied(true)
        setTimeout(pauseAware(() => nextStep()), 600)
    }

    if (sceneState === 'idle') {
        return (
            <div className="space-y-3">
                {/* Order header + summary */}
                <div className="border border-border rounded-xl overflow-hidden bg-card">
                    <div className="flex items-start justify-between gap-2 px-3.5 pt-3.5 pb-3">
                        <div>
                            <div className="text-xs font-bold text-foreground">NYPD-0394 · SIF received from Miller Knoll designer</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">NYC Police Dept. · Precinct 40 · May 6, 7:52 AM</div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">Pending</span>
                    </div>
                    {/* Summary metrics */}
                    <div className="grid grid-cols-3 border-t border-border divide-x divide-border">
                        <div className="px-3.5 py-2.5">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">SIF Total</div>
                            <div className="text-sm font-bold text-foreground tabular-nums mt-0.5">$152,700</div>
                        </div>
                        <div className="px-3.5 py-2.5">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Line Items</div>
                            <div className="text-sm font-bold text-foreground tabular-nums mt-0.5">4 items</div>
                        </div>
                        <div className="px-3.5 py-2.5">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Contract</div>
                            <div className="text-sm font-bold text-foreground tabular-nums mt-0.5">CoNY 42.3%</div>
                        </div>
                    </div>
                </div>

                {/* SIF items — visible before validation so presenter can point them out */}
                <div className="border border-border rounded-xl overflow-hidden">
                    <div className="grid grid-cols-3 gap-0 bg-muted/40 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <span className="col-span-2">Product · SIF</span>
                        <span className="text-right">SIF Price</span>
                    </div>
                    {LINE_ITEMS.map((item) => (
                        <div key={item.product} className="grid grid-cols-3 gap-0 px-3.5 py-2.5 border-t border-border bg-card">
                            <span className="col-span-2 text-xs font-medium text-foreground">{item.product}</span>
                            <span className="text-xs tabular-nums text-foreground text-right">{item.sif}</span>
                        </div>
                    ))}
                    <div className="px-3.5 py-2 border-t border-border bg-muted/20 flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">4 SIF items · not yet validated against CoNY contract</span>
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Unverified</span>
                    </div>
                </div>

                {/* AS-IS + CTA */}
                <div className="border border-border rounded-xl p-3.5 bg-card space-y-3">
                    <div className="text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                        Before Strata: Lauren uploaded the SIF to Quote Tool, waited for validation, then downloaded the result — ~45 min per order.
                    </div>
                    <button
                        onClick={() => setSceneState('validating')}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Run pricing validation →
                    </button>
                </div>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Context banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Pricing Validation · NYPD-0394 · NYPD Precinct 40</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Strata validated the SIF from the Miller Knoll designer against the CoNY contract. Price corrections and catalog restrictions surfaced automatically.
                    </div>
                </div>
            </div>

            {/* Validation table */}
            <div className="border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 gap-0 bg-muted/40 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="col-span-2">Product</span>
                    <span>SIF Price</span>
                    <span>CoNY Contract</span>
                </div>

                {LINE_ITEMS.slice(0, revealedCount).map((item) => (
                    <div
                        key={item.product}
                        className={`px-3.5 py-2.5 border-t border-border animate-in fade-in slide-in-from-left-1 duration-300 ${
                            item.status === 'restricted'
                                ? 'bg-red-50 dark:bg-red-500/5'
                                : item.status === 'price' && !applied
                                ? 'bg-amber-50 dark:bg-amber-500/5'
                                : ''
                        }`}
                    >
                        <div className="grid grid-cols-4 gap-0">
                            <span className="col-span-2 font-medium text-foreground text-xs">{item.product}</span>

                            {/* SIF price */}
                            <span className={`text-xs tabular-nums ${
                                item.status !== 'ok' ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}>
                                {item.sif}
                            </span>

                            {/* Contract price */}
                            <span className="text-xs flex items-center gap-1.5 tabular-nums font-medium">
                                {item.status === 'ok' && (
                                    <><CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" /><span className="text-foreground">{item.contract}</span></>
                                )}
                                {item.status === 'price' && !applied && (
                                    <><AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" /><span className="text-foreground">{item.contract}</span></>
                                )}
                                {item.status === 'price' && applied && (
                                    <><CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" /><span className="text-foreground">{item.contract}</span></>
                                )}
                                {item.status === 'restricted' && (
                                    <><Ban className="h-3.5 w-3.5 text-red-500 shrink-0" /><span className="text-red-600 dark:text-red-400">Restricted</span></>
                                )}
                            </span>
                        </div>

                        {/* Restriction detail row */}
                        {item.status === 'restricted' && item.restrictionNote && (
                            <div className="mt-1.5 col-span-4 text-[11px] text-red-600 dark:text-red-400 pl-0">
                                {item.restrictionNote}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Restricted item exception — appears after that row reveals */}
            {allRevealed && !noticeSent && (
                <div className="border border-red-200 dark:border-red-500/30 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="flex items-center gap-2 px-3.5 py-2 border-b border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5">
                        <Ban className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                            Restricted item detected · designer notification required
                        </span>
                    </div>
                    <div className="px-3.5 py-3 bg-card space-y-2">
                        <div className="text-[11px] text-muted-foreground">
                            Strata pre-drafted the restriction notice to the Miller Knoll designer.
                        </div>
                        <div className="bg-muted/30 rounded-lg px-3 py-2.5 space-y-1 text-[11px]">
                            <div className="text-muted-foreground">To: MK Designer · Re: NYPD-0394 · CoNY SIF Review</div>
                            <p className="text-foreground leading-relaxed">
                                "The Panel System (custom config, $4,200) is not included in the CoNY contract catalog. Please provide a substitute item from the approved list or remove this line before we can proceed."
                            </p>
                            <div className="text-muted-foreground text-[10px]">— Lauren DeMarco, CoNY Account Manager · BFI Furniture</div>
                        </div>
                        <div className="flex justify-end pt-0.5">
                            <button
                                onClick={handleSendNotice}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                            >
                                <Send className="h-3.5 w-3.5" />
                                Send notice to designer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notice sent confirmation */}
            {noticeSent && (
                <div className="bg-muted/30 border border-border rounded-xl p-3 flex items-center gap-2.5 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">Restriction notice sent · MK designer notified</div>
                        <div className="text-muted-foreground mt-0.5">Panel System removed from order pending designer response · 3 lines validated</div>
                    </div>
                </div>
            )}

            {/* Price correction summary — appears after all revealed */}
            {allRevealed && (
                <div className="bg-card border border-border rounded-xl p-3.5 space-y-1.5 animate-in fade-in duration-400">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Price correction applied automatically
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground tabular-nums">42.3%</span>
                        <span className="text-xs text-muted-foreground">across 3 validated lines · CoNY contract pricing applied</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        Filing Units corrected $8,100 → $7,560 · CoNY contract rate applied
                    </div>
                    <div className="text-[10px] text-muted-foreground/70 pt-0.5 border-t border-border">
                        Before: upload SIF → wait Quote Tool email → download → re-upload · ~65 min. Now: 0 min — Strata posts the CMF Free line automatically.
                    </div>
                </div>
            )}

            {/* Semantic CTA — unlocks after reveal + notice sent (if restricted item) */}
            {ctaUnlocked && !applied && (
                <div className="flex items-center justify-end animate-in fade-in slide-in-from-bottom-1 duration-300">
                    <button
                        onClick={handleApply}
                        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                    >
                        Apply pricing &amp; continue
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {applied && (
                <div className="flex items-center gap-2 text-xs text-success font-medium animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    NYPD-0394 · 3 lines validated · pricing applied in CORE
                </div>
            )}

            <DataSourcesBar groups={[
                { sources: [SOURCES.SIF_FILE, SOURCES.STRATA_SPEC] },
            ]} />
        </div>
    )
}
