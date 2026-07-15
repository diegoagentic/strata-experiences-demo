// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Proposal PDF Preview Modal
// v7 · reused by w2.1 PricingWaterfall and w2.2 ProposalActionBar
//
// Same visual pattern as VerificationPdfPreviewModal (header strip, body
// sections, footer with Close / Download) but shows the full proposal
// breakdown the dealer sees before approving.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect } from 'react'
import { CheckCircle2, Download, FileText, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useDemo } from '../../context/DemoContext'

interface ProposalPdfPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    onDownload?: () => void
    clientName: string
    productList: number
    discount: number
    labor: number
    freight: number
}

function formatMoney(n: number, { signed = false } = {}): string {
    const abs = Math.abs(Math.round(n))
    const body = abs.toLocaleString('en-US')
    if (signed && n < 0) return `-$${body}`
    if (signed && n > 0) return `+$${body}`
    return `$${body}`
}

export default function ProposalPdfPreviewModal({
    isOpen,
    onClose,
    onDownload,
    clientName,
    productList,
    discount,
    labor,
    freight,
}: ProposalPdfPreviewModalProps) {
    const { isDemoActive, isSidebarCollapsed } = useDemo()
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed
    const offsetClass = sidebarExpanded ? 'lg:left-80' : ''

    useEffect(() => {
        if (!isOpen) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const discountAmount = productList * discount
    const productNet = productList - discountAmount
    const total = productNet + labor + freight
    const discountPct = Math.round(discount * 100)
    const today = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })

    return (
        <div
            className={clsx(
                'fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200 p-4',
                offsetClass
            )}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="proposal-pdf-title"
        >
            <div
                className="w-full max-w-2xl max-h-[85vh] bg-card dark:bg-zinc-900 rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Paper header */}
                <div className="px-6 py-4 bg-muted/40 border-b border-border flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-foreground dark:text-primary flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                        </span>
                        <div>
                            <p
                                id="proposal-pdf-title"
                                className="text-sm font-bold text-foreground uppercase tracking-wider"
                            >
                                Quote Proposal
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                {clientName} · {today}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Close preview"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Paper body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-minimal">

                    {/* Cover summary */}
                    <div className="rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 px-4 py-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                            Total investment
                        </p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-xl text-muted-foreground">$</span>
                            <span className="text-4xl font-bold text-foreground tabular-nums">
                                {Math.round(total).toLocaleString('en-US')}
                            </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            MillerKnoll quote · JPS contract discount · labor · freight
                        </p>
                    </div>

                    {/* Financial breakdown */}
                    <section className="space-y-2">
                        <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                            Financial breakdown
                        </p>
                        <dl className="space-y-1.5 px-1">
                            <div className="flex items-baseline justify-between gap-3 text-xs">
                                <dt className="text-muted-foreground">
                                    MillerKnoll product list
                                </dt>
                                <dd className="font-semibold text-foreground tabular-nums">
                                    {formatMoney(productList)}
                                </dd>
                            </div>
                            <div className="flex items-baseline justify-between gap-3 text-xs">
                                <dt className="text-green-700 dark:text-green-400">
                                    JPS contract ({discountPct}% off)
                                </dt>
                                <dd className="font-semibold text-green-700 dark:text-green-400 tabular-nums">
                                    {formatMoney(-discountAmount, { signed: true })}
                                </dd>
                            </div>
                            <div className="flex items-baseline justify-between gap-3 text-xs pt-1 border-t border-border">
                                <dt className="font-semibold text-foreground">
                                    Product net
                                </dt>
                                <dd className="font-semibold text-foreground tabular-nums">
                                    {formatMoney(productNet)}
                                </dd>
                            </div>
                            <div className="flex items-baseline justify-between gap-3 text-xs">
                                <dt className="text-blue-700 dark:text-blue-400">
                                    Labor (delivery + installation)
                                </dt>
                                <dd className="font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
                                    {formatMoney(labor, { signed: true })}
                                </dd>
                            </div>
                            <div className="flex items-baseline justify-between gap-3 text-xs">
                                <dt className="text-blue-700 dark:text-blue-400">
                                    Freight
                                </dt>
                                <dd className="font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
                                    {formatMoney(freight, { signed: true })}
                                </dd>
                            </div>
                            <div className="flex items-baseline justify-between gap-3 pt-2 border-t-2 border-primary/40">
                                <dt className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                    Total proposal
                                </dt>
                                <dd className="text-lg font-black text-foreground tabular-nums">
                                    {formatMoney(total)}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    {/* Delivery schedule */}
                    <section className="space-y-2">
                        <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                            Delivery schedule
                        </p>
                        <ol className="space-y-2">
                            {[
                                { label: 'Contract signed', date: 'Week 0 — today' },
                                { label: 'Order placed with MillerKnoll', date: 'Week 1' },
                                { label: 'On-site installation', date: 'Weeks 8-10' },
                                { label: 'Final walk-through', date: 'Week 11' },
                            ].map((step, i) => (
                                <li
                                    key={step.label}
                                    className="flex items-start gap-2 text-xs"
                                >
                                    <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-foreground dark:text-primary text-[10px] font-bold flex items-center justify-center tabular-nums">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-foreground font-semibold leading-tight">
                                            {step.label}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground leading-tight">
                                            {step.date}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>

                    {/* Approval chain placeholder */}
                    <section className="space-y-2">
                        <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                            Approval chain (4 signatures required)
                        </p>
                        <ul className="grid grid-cols-2 gap-2">
                            {[
                                'David Park · Regional Sales Manager',
                                'Alex Rivera · Designer',
                                'Sara Chen · Account Manager',
                                'Jordan Park · VP Sales',
                            ].map((line) => (
                                <li
                                    key={line}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 text-[11px]"
                                >
                                    <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400 shrink-0" />
                                    <span className="text-foreground truncate">{line}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <p className="text-[10px] text-muted-foreground italic text-center">
                        This proposal is part of the Strata audit trail and will be
                        written back to CORE on release.
                    </p>
                </div>

                {/* Paper footer */}
                <div className="px-6 py-3 bg-muted/30 border-t border-border flex items-center justify-between shrink-0">
                    <p className="text-[9px] text-muted-foreground">
                        Prepared by Strata Estimator · {today}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onDownload?.()
                                onClose()
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                            <Download className="w-3 h-3" />
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
