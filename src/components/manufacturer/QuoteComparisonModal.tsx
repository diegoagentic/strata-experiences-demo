/**
 * QuoteComparisonModal · Compare 2 quotes side-by-side (W9 · Wendy item 3)
 *
 * "Quote compare" was flagged as especially dealer-relevant. Shows 2 quotes
 * with same-line diff highlighting + winner badges per line.
 *
 * Per Modal Normalization Spec.
 */

import { Fragment, useMemo } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    X,
    Sparkles,
    Scale,
    DollarSign,
    Calendar,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react'

interface QuoteLine {
    sku: string
    description: string
    qty: number
    price: number
}

interface QuoteSnapshot {
    id: string
    label: string
    dealer: string
    grossValue: number
    netValue: number
    avgDiscount: number
    leadTimeWeeks: number
    validUntil: string
    lines: QuoteLine[]
}

const QUOTE_A: QuoteSnapshot = {
    id: 'QT-1025',
    label: 'Quote v1 · current',
    dealer: 'NorthPoint Furniture Group',
    grossValue: 67240,
    netValue: 25398,
    avgDiscount: 60.8,
    leadTimeWeeks: 8,
    validUntil: 'Feb 18, 2026',
    lines: [
        { sku: 'T-RCR306029HLG2', description: 'TBL, REC, 30Dx60Wx29H', qty: 4, price: 479.18 },
        { sku: 'X-BBFPFS182812', description: 'CBX Full Depth BBF Ped', qty: 4, price: 398.24 },
        { sku: 'W-WS3072', description: 'WORKSURFACE RECT 30Dx72W', qty: 6, price: 249.28 },
        { sku: 'F-SSC346030C', description: 'LB LOUNGE 2 SEAT 34"H', qty: 2, price: 2031.12 },
        { sku: '7730', description: 'AUBURN GRAY CONFERENCE CHAIR', qty: 12, price: 471.60 },
    ],
}

const QUOTE_B: QuoteSnapshot = {
    id: 'QT-1031',
    label: 'Quote v2 · scope-down option',
    dealer: 'NorthPoint Furniture Group',
    grossValue: 58420,
    netValue: 22106,
    avgDiscount: 62.2,
    leadTimeWeeks: 6,
    validUntil: 'Feb 22, 2026',
    lines: [
        { sku: 'T-RCR306029HLG2', description: 'TBL, REC, 30Dx60Wx29H', qty: 4, price: 462.00 },
        { sku: 'X-BBFPFS182812', description: 'CBX Full Depth BBF Ped', qty: 4, price: 398.24 },
        { sku: 'W-WS3072', description: 'WORKSURFACE RECT 30Dx72W', qty: 4, price: 249.28 },
        { sku: 'F-SSC346030C', description: 'LB LOUNGE 2 SEAT 34"H (CF-6021)', qty: 2, price: 1843.50 },
        { sku: '7731', description: 'AUBURN GRAY CONFERENCE CHAIR · alt fabric', qty: 12, price: 442.00 },
    ],
}

interface QuoteComparisonModalProps {
    isOpen: boolean
    onClose: () => void
    quoteA?: QuoteSnapshot
    quoteB?: QuoteSnapshot
}

function fmt(n: number): string {
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
    return `$${n.toFixed(2)}`
}

function deltaBadge(a: number, b: number, lowerIsBetter: boolean = true) {
    if (a === b) return null
    const aWins = lowerIsBetter ? a < b : a > b
    const tone = aWins ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'
    const diff = Math.abs(((b - a) / a) * 100).toFixed(1)
    return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${tone}`}>
            {aWins ? '−' : '+'}{diff}%
        </span>
    )
}

export default function QuoteComparisonModal({
    isOpen,
    onClose,
    quoteA = QUOTE_A,
    quoteB = QUOTE_B,
}: QuoteComparisonModalProps) {
    const matchingLines = useMemo(() => {
        return quoteA.lines.map(la => {
            const lb = quoteB.lines.find(l => l.sku === la.sku || l.description === la.description)
            return { a: la, b: lb }
        })
    }, [quoteA, quoteB])

    const savingsPct = ((quoteA.netValue - quoteB.netValue) / quoteA.netValue) * 100
    const recommendation = quoteB.netValue < quoteA.netValue ? 'B' : quoteA.netValue < quoteB.netValue ? 'A' : 'tie'

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-4xl rounded-xl border border-border bg-card shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
                                {/* Header */}
                                <div className="px-5 py-4 border-b border-border bg-card flex items-start gap-3 shrink-0">
                                    <div className="h-9 w-9 rounded-lg bg-ai/10 flex items-center justify-center shrink-0">
                                        <Scale className="h-4 w-4 text-ai" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-foreground">Quote comparison · side-by-side</h3>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            {quoteA.id} vs {quoteB.id} · {quoteA.dealer}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        aria-label="Close comparison"
                                        className="shrink-0 h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                    {/* AI recommendation */}
                                    <div className="rounded-xl border border-ai/30 bg-ai/5 px-4 py-3 flex items-start gap-3">
                                        <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" aria-hidden="true" />
                                        <div className="flex-1 text-xs">
                                            <div className="font-bold text-foreground">
                                                {recommendation === 'B' && (
                                                    <>Strata AI recommends <strong className="text-success">Quote {quoteB.label}</strong> · saves ${(quoteA.netValue - quoteB.netValue).toLocaleString()} ({savingsPct.toFixed(1)}%) + faster lead time</>
                                                )}
                                                {recommendation === 'A' && (
                                                    <>Strata AI recommends <strong className="text-success">Quote {quoteA.label}</strong> · better net total</>
                                                )}
                                                {recommendation === 'tie' && <>Both quotes are equivalent in net value</>}
                                            </div>
                                            <div className="text-muted-foreground mt-1">
                                                Compared on net total · lead time · catalog match · risk. Dealer-visible.
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary metrics side-by-side */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { quote: quoteA, badge: 'A' as const },
                                            { quote: quoteB, badge: 'B' as const },
                                        ].map(({ quote, badge }) => {
                                            const isWinner = recommendation === badge
                                            return (
                                                <div key={quote.id} className={`rounded-xl border p-4 ${isWinner ? 'border-success/40 bg-success/5' : 'border-border bg-card'}`}>
                                                    <div className="flex items-start justify-between gap-2 mb-3">
                                                        <div>
                                                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{quote.id}</div>
                                                            <div className="text-sm font-bold text-foreground">{quote.label}</div>
                                                        </div>
                                                        {isWinner && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20">
                                                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                                Recommended
                                                            </span>
                                                        )}
                                                    </div>
                                                    <dl className="grid grid-cols-2 gap-y-2 gap-x-3 text-[11px]">
                                                        <dt className="text-muted-foreground inline-flex items-center gap-1">
                                                            <DollarSign className="h-3 w-3" aria-hidden="true" />
                                                            Net total
                                                        </dt>
                                                        <dd className="text-foreground font-bold tabular-nums text-right">${quote.netValue.toLocaleString()}</dd>
                                                        <dt className="text-muted-foreground">Gross</dt>
                                                        <dd className="text-foreground tabular-nums text-right">${quote.grossValue.toLocaleString()}</dd>
                                                        <dt className="text-muted-foreground">Avg discount</dt>
                                                        <dd className="text-foreground tabular-nums text-right">{quote.avgDiscount}%</dd>
                                                        <dt className="text-muted-foreground inline-flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" aria-hidden="true" />
                                                            Lead time
                                                        </dt>
                                                        <dd className="text-foreground tabular-nums text-right">{quote.leadTimeWeeks}w</dd>
                                                        <dt className="text-muted-foreground">Expiration Date</dt>
                                                        <dd className="text-muted-foreground tabular-nums text-right">{quote.validUntil}</dd>
                                                    </dl>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Line items diff table */}
                                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                                        <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">Line-by-line comparison</span>
                                            <span className="ml-auto text-[10px] text-muted-foreground italic">{matchingLines.length} lines</span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead className="bg-muted/20">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">SKU · Description</th>
                                                        <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">A · price</th>
                                                        <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">A · ext</th>
                                                        <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">vs</th>
                                                        <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">B · price</th>
                                                        <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">B · ext</th>
                                                        <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delta</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {matchingLines.map(({ a, b }) => {
                                                        const aExt = a.qty * a.price
                                                        const bExt = b ? b.qty * b.price : 0
                                                        return (
                                                            <tr key={a.sku}>
                                                                <td className="px-3 py-2">
                                                                    <div className="text-[11px] font-mono text-foreground">{a.sku}</div>
                                                                    <div className="text-[10px] text-muted-foreground truncate max-w-[260px]">{a.description}</div>
                                                                </td>
                                                                <td className="px-3 py-2 text-right text-[11px] text-foreground tabular-nums">${a.price.toFixed(2)}</td>
                                                                <td className="px-3 py-2 text-right text-[11px] font-bold text-foreground tabular-nums">${aExt.toFixed(2)}</td>
                                                                <td className="px-3 py-2 text-center"><ArrowRight className="h-3 w-3 text-muted-foreground mx-auto" aria-hidden="true" /></td>
                                                                {b ? (
                                                                    <>
                                                                        <td className="px-3 py-2 text-right text-[11px] text-foreground tabular-nums">${b.price.toFixed(2)}</td>
                                                                        <td className="px-3 py-2 text-right text-[11px] font-bold text-foreground tabular-nums">${bExt.toFixed(2)}</td>
                                                                        <td className="px-3 py-2 text-center">{deltaBadge(bExt, aExt) ?? <span className="text-[10px] text-muted-foreground">—</span>}</td>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <td className="px-3 py-2 text-center text-[11px] text-muted-foreground italic">—</td>
                                                                        <td className="px-3 py-2 text-center text-[11px] text-muted-foreground italic">—</td>
                                                                        <td className="px-3 py-2 text-center">
                                                                            <span className="inline-flex items-center gap-1 text-[10px] text-warning font-medium">
                                                                                <AlertCircle className="h-2.5 w-2.5" aria-hidden="true" />
                                                                                missing
                                                                            </span>
                                                                        </td>
                                                                    </>
                                                                )}
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-3 border-t border-border bg-card flex items-center justify-end gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="inline-flex items-center justify-center h-9 px-4 rounded-md text-[12px] font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors"
                                    >
                                        Close
                                    </button>
                                    {recommendation !== 'tie' && (
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md text-[12px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                            Select Quote {recommendation}
                                        </button>
                                    )}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
