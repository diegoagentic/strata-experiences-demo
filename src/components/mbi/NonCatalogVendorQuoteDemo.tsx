/**
 * COMPONENT: NonCatalogVendorQuoteDemo
 * PURPOSE: Simulates Strata reading an Allsteel vendor quote (PDF) for a
 *          flagged non-catalog item and generating a structured SIF entry —
 *          removing manual re-entry for the PC team.
 *
 *          Layout when running/done: two-column — left = processing steps +
 *          SIF entry card, right = vendor quote PDF mockup (zones highlight
 *          as extraction progresses, mirroring PoExtractionPreview pattern).
 *
 *          State machine: idle → running → done → accepted
 *
 * PROPS: onResolved — called when PC accepts the generated SIF entry
 *
 * USED BY: QuoteValidationScene (inline, not in a sheet)
 */

import { useState, useEffect } from 'react'
import { Play, Loader2, CheckCircle2, FileText, Sparkles, Check, Pencil, X, Save } from 'lucide-react'
import { usePauseAware } from '../../context/usePauseAware'
import MBIDetailSheet from './MBIDetailSheet'

const QUOTE_STEPS = [
    'BluDot vendor quote received · PDF attachment detected via Teams',
    'AI reading quote · extracting SKU · unit price · lead time · MOQ',
    'SIF entry generated · qty 8 · $445/unit · ready for PC review',
]

const GENERATED_ENTRY = {
    sku: 'BD-FRM-WLN-2442',
    description: 'Frame side table · walnut',
    qty: 8,
    unitPrice: 445,
    leadWeeks: 5,
    moq: 2,
    source: 'BluDot vendor quote · received via Teams · Apr 29 2026',
}

type Phase = 'idle' | 'running' | 'done' | 'accepted'

interface SIFAdjust {
    qty: number
    unitPrice: number
    leadWeeks: number
}

interface Props {
    onResolved: () => void
}

export default function NonCatalogVendorQuoteDemo({ onResolved }: Props) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [stepsDone, setStepsDone] = useState(0)
    const [adjustOpen, setAdjustOpen] = useState(false)
    const [overrides, setOverrides] = useState<Partial<SIFAdjust>>({})
    const { pauseAwareTimeout } = usePauseAware()

    const entry = {
        ...GENERATED_ENTRY,
        qty: overrides.qty ?? GENERATED_ENTRY.qty,
        unitPrice: overrides.unitPrice ?? GENERATED_ENTRY.unitPrice,
        leadWeeks: overrides.leadWeeks ?? GENERATED_ENTRY.leadWeeks,
    }

    const handleStart = () => {
        setPhase('running')
        setStepsDone(0)
    }

    useEffect(() => {
        if (phase !== 'running') return
        if (stepsDone < QUOTE_STEPS.length) {
            return pauseAwareTimeout(() => setStepsDone(s => s + 1), 900)
        } else {
            return pauseAwareTimeout(() => setPhase('done'), 400)
        }
    }, [phase, stepsDone, pauseAwareTimeout])

    const handleAccept = () => {
        setPhase('accepted')
        onResolved()
    }

    if (phase === 'idle') {
        return (
            <button
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm mt-3"
            >
                <Play className="h-4 w-4" />
                Watch Strata process the vendor quote
            </button>
        )
    }

    if (phase === 'accepted') {
        return (
            <div className="mt-3 bg-success/10 dark:bg-success/15 border border-success/30 rounded-xl p-3 flex items-center gap-2.5 animate-in fade-in duration-300">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Vendor quote accepted · SIF entry updated</div>
                    <div className="text-muted-foreground mt-0.5">
                        NC-004 · {entry.qty} × ${entry.unitPrice.toLocaleString()} · ${(entry.qty * entry.unitPrice).toLocaleString()} confirmed · no re-entry needed
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-3 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

                {/* Left — processing steps + SIF entry */}
                <div className="space-y-3">
                    <div className="rounded-xl border bg-ai/5 dark:bg-ai/10 border-ai/30 p-3">
                        <div className="flex items-center gap-1.5 mb-2.5">
                            {phase === 'done'
                                ? <Sparkles className="h-3.5 w-3.5 text-ai shrink-0" />
                                : <Loader2 className="h-3.5 w-3.5 text-ai shrink-0 animate-spin" />
                            }
                            <span className="text-[10px] font-bold text-ai uppercase tracking-wider">
                                {phase === 'done' ? 'Quote processed · SIF entry ready' : 'Processing vendor quote…'}
                            </span>
                        </div>
                        <div className="space-y-1.5">
                            {QUOTE_STEPS.map((step, i) => {
                                const done = phase === 'done' || i < stepsDone
                                const running = phase === 'running' && i === stepsDone
                                return (
                                    <div
                                        key={i}
                                        className={`flex items-center gap-2 text-[11px] transition-opacity duration-200 ${done || running ? 'opacity-100' : 'opacity-20'}`}
                                    >
                                        {done
                                            ? <Check className="h-3 w-3 text-ai shrink-0" />
                                            : <Loader2 className="h-3 w-3 text-ai shrink-0 animate-spin" />
                                        }
                                        <span className={done ? 'text-foreground' : 'text-muted-foreground'}>{step}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Generated SIF entry — revealed when done */}
                    {phase === 'done' && (
                        <>
                            <div className="bg-card dark:bg-zinc-800 border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="px-3 py-2 border-b border-border bg-muted/20 flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Generated SIF entry · PC review</span>
                                    {Object.keys(overrides).length > 0 && (
                                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-ai/15 text-ai uppercase tracking-wider">Adjusted</span>
                                    )}
                                </div>
                                <div className="p-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
                                    <SIFRow label="SKU" value={entry.sku} mono />
                                    <SIFRow label="Description" value={entry.description} />
                                    <SIFRow label="Qty" value={String(entry.qty)} />
                                    <SIFRow label="Unit price" value={`$${entry.unitPrice.toLocaleString()}`} highlight />
                                    <SIFRow label="Line total" value={`$${(entry.qty * entry.unitPrice).toLocaleString()}`} highlight />
                                    <SIFRow label="Lead time" value={`${entry.leadWeeks} weeks · MOQ ${entry.moq}`} />
                                    <div className="col-span-2 pt-1 border-t border-border mt-1">
                                        <span className="text-[10px] text-muted-foreground italic">{entry.source}</span>
                                    </div>
                                </div>
                                <div className="px-3 pb-3 flex items-center gap-2">
                                    <button
                                        onClick={handleAccept}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Accept SIF entry
                                    </button>
                                    <button
                                        onClick={() => setAdjustOpen(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-foreground bg-background dark:bg-zinc-900 border border-border rounded-lg hover:border-muted-foreground/50 transition-colors"
                                    >
                                        <Pencil className="h-3 w-3" />
                                        Adjust
                                    </button>
                                    <span className="text-[10px] text-muted-foreground ml-auto">Confidence 94%</span>
                                </div>
                            </div>
                            <SIFAdjustSheet
                                isOpen={adjustOpen}
                                current={entry}
                                onClose={() => setAdjustOpen(false)}
                                onSave={(adj) => { setOverrides(adj); setAdjustOpen(false) }}
                            />
                        </>
                    )}
                </div>

                {/* Right — vendor quote PDF mockup */}
                <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <FileText className="h-3 w-3" />
                        Vendor quote · PDF source
                    </div>
                    <VendorQuoteDocument stepsDone={stepsDone} phase={phase} />
                </div>
            </div>
        </div>
    )
}

// ─── Vendor Quote PDF mockup ──────────────────────────────────────────────────

type QuoteZone = 'header' | 'customer' | 'item' | 'pricing' | 'terms'

function VendorQuoteDocument({ stepsDone, phase }: { stepsDone: number; phase: Phase }) {
    const allDone = phase === 'done'

    const highlighted = (zone: QuoteZone) => {
        if (allDone) return true
        if (stepsDone === 0) return false
        if (zone === 'header' || zone === 'customer') return stepsDone >= 1
        if (zone === 'item') return stepsDone >= 2
        if (zone === 'pricing' || zone === 'terms') return stepsDone >= 2
        return false
    }

    const cls = (zone: QuoteZone) =>
        `px-1 py-0.5 rounded transition-all duration-300 ${highlighted(zone) ? 'ring-1 ring-ai/60 bg-ai/10' : ''}`

    return (
        <div className="bg-white text-zinc-900 rounded-2xl shadow-md border border-border overflow-hidden text-[9px] font-mono leading-snug">

            {/* ── Page header — Leland style ── */}
            <div className="px-3 pt-3 pb-2 border-b border-zinc-300">
                <div className="flex justify-between items-start">
                    <div className="text-[10px] font-black font-serif">BluDot Quote</div>
                    <div className="text-right">
                        <div className={`text-[16px] font-black tracking-widest font-serif leading-none ${cls('header')}`}>BluDot</div>
                        <div className="text-[7px] text-muted-foreground mt-0.5">BluDot Design Inc.</div>
                        <div className="text-[7px] text-muted-foreground">Minneapolis, MN 55413</div>
                        <div className="text-[7px] text-muted-foreground">Phone: 1-612-782-1844</div>
                    </div>
                </div>

                {/* Metadata rows */}
                <div className={`mt-1.5 space-y-0.5 ${cls('header')}`}>
                    {[
                        { label: 'Quote Number:', value: 'BD-Q-2026-0187  (Please reference on your P.O.)' },
                        { label: 'Quote Date:', value: 'Apr 28, 2026' },
                        { label: 'Project Name:', value: 'Enterprise Holdings · Floor 12' },
                        { label: 'Specifier:', value: 'MBI · PC Team' },
                    ].map(row => (
                        <div key={row.label} className="flex items-baseline gap-2 border-b border-zinc-200 pb-0.5 text-[8px]">
                            <span className="text-muted-foreground w-20 shrink-0">{row.label}</span>
                            <span className="font-semibold text-zinc-900 truncate">{row.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Bill To / Ship To ── */}
            <div className={`flex gap-4 px-3 py-2 border-b border-zinc-200 text-[8px] ${cls('customer')}`}>
                <div className="flex-1">
                    <div className="font-bold uppercase text-[6.5px] tracking-wider text-muted-foreground mb-0.5">BILL TO:</div>
                    <div className="font-semibold text-zinc-900">Modern Business Interiors</div>
                    <div className="text-muted-foreground">2020 N Highway 94 Service Rd W</div>
                    <div className="text-muted-foreground">St. Charles, MO 63303 USA</div>
                </div>
                <div className="flex-1">
                    <div className="font-bold uppercase text-[6.5px] tracking-wider text-muted-foreground mb-0.5">SHIP TO:</div>
                    <div className="text-muted-foreground">Missouri</div>
                    <div className="text-muted-foreground">Attn: PC Team</div>
                </div>
            </div>

            {/* ── Shipping terms bar ── */}
            <div className="grid grid-cols-4 gap-x-2 px-3 py-1.5 border-b border-zinc-300 text-[7.5px]">
                <div><div className="font-bold text-muted-foreground uppercase text-[6.5px]">FOB</div><div className="text-zinc-900">Minneapolis</div></div>
                <div><div className="font-bold text-muted-foreground uppercase text-[6.5px]">Sales Order Type</div><div className="text-zinc-900">Standard</div></div>
                <div><div className="font-bold text-muted-foreground uppercase text-[6.5px]">Terms</div><div className="text-zinc-900">Pre-Paid</div></div>
                <div><div className="font-bold text-muted-foreground uppercase text-[6.5px]">Ship Via</div><div className="text-zinc-900">TBD</div></div>
            </div>

            {/* ── List Priced Items ── */}
            <div className="px-3 pt-2 pb-1">
                <div className="bg-zinc-800 text-white px-2 py-1 text-[7.5px] font-bold mb-1 rounded-sm">
                    List Priced Items
                </div>
                {/* Column headers */}
                <div className="grid grid-cols-[1.4rem_1.2rem_2.5rem_1fr_3rem_3.5rem] gap-x-1.5 text-[6.5px] font-bold uppercase text-muted-foreground px-1 mb-0.5">
                    <span>ITEM</span>
                    <span>QTY</span>
                    <span>PROD CODE</span>
                    <span>DESCRIPTION</span>
                    <span className="text-right">LIST PRICE</span>
                    <span className="text-right">EXTENDED</span>
                </div>
                {/* Row 1 */}
                <div className={`grid grid-cols-[1.4rem_1.2rem_2.5rem_1fr_3rem_3.5rem] gap-x-1.5 px-1 py-1 border-b border-zinc-200 ${cls('item')}`}>
                    <span>1</span>
                    <span className={highlighted('pricing') ? 'text-zinc-900' : 'text-muted-foreground'}>8</span>
                    <span className="font-bold text-[7.5px] text-zinc-900 truncate">BD-FRM-WLN-2442</span>
                    <div>
                        <div className="font-semibold text-zinc-900">Frame side table · walnut</div>
                        <div className="text-muted-foreground text-[7px]">SIDEMARK: Enterprise Holdings · Floor 12</div>
                    </div>
                    <span className={`text-right tabular-nums ${highlighted('pricing') ? 'font-semibold text-zinc-900' : 'text-muted-foreground'}`}>$445.00</span>
                    <span className="text-right tabular-nums font-bold text-zinc-900">$3,560.00</span>
                </div>
                {/* Row 2 */}
                <div className={`grid grid-cols-[1.4rem_1.2rem_2.5rem_1fr_3rem_3.5rem] gap-x-1.5 px-1 py-1 border-b border-zinc-200 ${cls('item')}`}>
                    <span>2</span>
                    <span className={highlighted('pricing') ? 'text-zinc-900' : 'text-muted-foreground'}>4</span>
                    <span className="font-bold text-[7.5px] text-zinc-900 truncate">BD-LNG-OAK-2880</span>
                    <div>
                        <div className="font-semibold text-zinc-900">Lounge chair · natural oak frame</div>
                        <div className="text-muted-foreground text-[7px]">SIDEMARK: Enterprise Holdings · Floor 12</div>
                    </div>
                    <span className={`text-right tabular-nums ${highlighted('pricing') ? 'font-semibold text-zinc-900' : 'text-muted-foreground'}`}>$890.00</span>
                    <span className="text-right tabular-nums font-bold text-zinc-900">$3,560.00</span>
                </div>
                {/* Row 3 */}
                <div className={`grid grid-cols-[1.4rem_1.2rem_2.5rem_1fr_3rem_3.5rem] gap-x-1.5 px-1 py-1 border-b border-zinc-200 ${cls('item')}`}>
                    <span>3</span>
                    <span className="text-muted-foreground">2</span>
                    <span className="font-bold text-[7.5px] text-zinc-900 truncate">BD-CTB-WLN-3642</span>
                    <div>
                        <div className="font-semibold text-zinc-900">Coffee table · walnut veneer</div>
                        <div className="text-muted-foreground text-[7px]">SIDEMARK: Enterprise Holdings · Floor 12</div>
                    </div>
                    <span className="text-right tabular-nums text-muted-foreground">$680.00</span>
                    <span className="text-right tabular-nums font-bold text-zinc-900">$1,360.00</span>
                </div>
                {/* Row 4 */}
                <div className={`grid grid-cols-[1.4rem_1.2rem_2.5rem_1fr_3rem_3.5rem] gap-x-1.5 px-1 py-1 border-b border-zinc-200 ${cls('item')}`}>
                    <span>4</span>
                    <span className="text-muted-foreground">4</span>
                    <span className="font-bold text-[7.5px] text-zinc-900 truncate">BD-LMP-BRS-FLR</span>
                    <div>
                        <div className="font-semibold text-zinc-900">Floor lamp · brushed brass</div>
                        <div className="text-muted-foreground text-[7px]">SIDEMARK: Enterprise Holdings · Floor 12</div>
                    </div>
                    <span className="text-right tabular-nums text-muted-foreground">$210.00</span>
                    <span className="text-right tabular-nums font-bold text-zinc-900">$840.00</span>
                </div>
                {/* List SubTotal */}
                <div className={`flex justify-end gap-4 mt-1 text-[8px] pr-1 ${cls('pricing')}`}>
                    <span className="text-muted-foreground">List SubTotal</span>
                    <span className="font-bold tabular-nums border-t border-zinc-400 pt-0.5">$9,320.00</span>
                </div>
            </div>

            {/* ── Terms / Lead time ── */}
            <div className={`px-3 py-1.5 border-t border-zinc-200 grid grid-cols-4 gap-x-2 text-[7.5px] ${cls('terms')}`}>
                <div><div className="font-bold text-muted-foreground uppercase text-[6.5px]">Lead Time</div><div className="font-semibold text-zinc-900">5 weeks</div></div>
                <div><div className="font-bold text-muted-foreground uppercase text-[6.5px]">MOQ</div><div className="font-semibold text-zinc-900">2 units</div></div>
                <div><div className="font-bold text-muted-foreground uppercase text-[6.5px]">Validity</div><div className="text-muted-foreground">May 28 2026</div></div>
                <div><div className="font-bold text-muted-foreground uppercase text-[6.5px]">Confidence</div><div className="text-zinc-900">94%</div></div>
            </div>

            {/* ── Footer ── */}
            <div className="px-3 py-1.5 border-t border-zinc-300 flex justify-between text-[6.5px] text-muted-foreground">
                <span>All orders subject to Terms &amp; Conditions at bluedotdesign.com</span>
                <span>Page 1 of 1</span>
            </div>
        </div>
    )
}

// ─── Supporting components ────────────────────────────────────────────────────

function SIFRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
    return (
        <div className="flex items-baseline gap-2">
            <span className="text-muted-foreground w-20 shrink-0">{label}</span>
            <span className={`font-semibold truncate ${highlight ? 'text-success' : 'text-foreground'} ${mono ? 'font-mono text-[10px]' : ''}`}>{value}</span>
        </div>
    )
}

function SIFAdjustSheet({
    isOpen,
    current,
    onClose,
    onSave,
}: {
    isOpen: boolean
    current: typeof GENERATED_ENTRY & { qty: number; unitPrice: number; leadWeeks: number }
    onClose: () => void
    onSave: (adj: Partial<SIFAdjust>) => void
}) {
    const [qty, setQty] = useState(current.qty)
    const [unitPrice, setUnitPrice] = useState(current.unitPrice)
    const [leadWeeks, setLeadWeeks] = useState(current.leadWeeks)

    useEffect(() => {
        if (isOpen) {
            setQty(current.qty)
            setUnitPrice(current.unitPrice)
            setLeadWeeks(current.leadWeeks)
        }
    }, [isOpen, current.qty, current.unitPrice, current.leadWeeks])

    const lineTotal = qty * unitPrice
    const changed = qty !== current.qty || unitPrice !== current.unitPrice || leadWeeks !== current.leadWeeks

    return (
        <MBIDetailSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Adjust SIF entry"
            subtitle="Override the AI-extracted values · the original vendor quote is preserved"
            icon={<Pencil className="h-4 w-4" />}
            width="sm"
        >
            <div className="space-y-5">
                <div className="bg-muted/30 rounded-xl p-3 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">NC-004 · {current.sku}</span>
                    <span className="ml-2">{current.description}</span>
                </div>

                <div className="space-y-4">
                    <AdjustField label="Quantity" hint="Units on the SIF" value={qty} onChange={setQty} min={1} />
                    <AdjustField label="Unit price ($)" hint="From vendor quote" value={unitPrice} onChange={setUnitPrice} min={1} prefix="$" />
                    <AdjustField label="Lead time (weeks)" hint="Vendor quoted lead time" value={leadWeeks} onChange={setLeadWeeks} min={1} />
                </div>

                <div className="bg-success/5 border border-success/20 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Revised line total</span>
                    <span className="text-sm font-bold text-success">${lineTotal.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave({ qty, unitPrice, leadWeeks })}
                        disabled={!changed}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Save className="h-3.5 w-3.5" />
                        Save adjustments
                    </button>
                </div>
            </div>
        </MBIDetailSheet>
    )
}

function AdjustField({
    label, hint, value, onChange, min, prefix,
}: {
    label: string; hint: string; value: number; onChange: (v: number) => void; min?: number; prefix?: string
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
                <span className="text-[10px] text-muted-foreground">{hint}</span>
            </div>
            <div className="relative">
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">{prefix}</span>
                )}
                <input
                    type="number"
                    min={min}
                    value={value}
                    onChange={e => onChange(Math.max(min ?? 0, Number(e.target.value)))}
                    className={`w-full bg-background dark:bg-zinc-800 border border-border rounded-lg py-2 text-sm text-foreground focus:outline-none focus:border-primary ${prefix ? 'pl-7 pr-3' : 'px-3'}`}
                />
            </div>
        </div>
    )
}
