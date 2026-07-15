/**
 * ProformaInvoiceModal · faithful Leland proforma document (grounded in the real
 * Leland proforma PDF · SO2503148 / PO 4522-7162 · Continua Interiors).
 *
 * Renders a print-style proforma replica (white paper) inside the modal chrome,
 * with Print (isolated @media print) + Close. Opened from QuoteDetail's
 * "Proforma" quick action.
 */

import { Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react'
import { X, FileText, Printer } from 'lucide-react'

interface ProformaInvoiceModalProps {
    isOpen: boolean
    onClose: () => void
    // Kept for call-site compatibility (QuoteDetail) · the document uses verbatim Leland data.
    quoteId?: string
    project?: string
    dealer?: string
    grossValue?: number
    netValue?: number
    depositPct?: number
}

// ── Verbatim Leland proforma data (from the real PDF) ──────────────────────
const LELAND = {
    orderNumber: 'SO2503148',
    poNumber: '4522 - 7162',
    dateOfOrder: '03/28/2025',
    shipWeek: '05/23/2025',
    company: ['Leland Furniture', '5695 Eagle Drive SE', 'Grand Rapids, MI', '49512', 'Phone: 1-616-975-9260', 'Fax: 1-616-975-9280'],
    soldTo: ['Continua Interiors of Illinois', '550 Bond Street', 'Lincolnshire, Illinois', 'USA, 60069'],
    shipTo: ['Continua IL Warehouse', '550 Bond St', 'Lincolnshire, Illinois', 'USA, 60069'],
    telephone: '847-325-1000',
    attnTelephone: '847-325-1082',
    representative: 'Leland',
    salesOrderType: 'General',
    terms: 'Net 15 Days',
    shipVia: 'TBD - To Be Determined',
    lines: [
        {
            item: 1, qty: 1, code: 'FXT-3072-29-LWH-DLTW2-S',
            desc: ['Model: Fixed Table, Dining Height', 'Top Size: 30" x 72" Rectangle', 'Top Finish: Designer White D354-60 Laminate', 'Leg Finish: Dolphin Textured', 'Edge Type: 1" Flat Plywood', 'Edge Finish: Natural 11M', 'Power/Data: None'],
            sidemark: 'Mark For: T-3 LOUNGE 203 Q16720-01', unit: '$1,611.90', ext: '$1,611.90',
        },
        {
            item: 2, qty: 2, code: 'M3CMBB-DLT-DLT-36D-LW2-11M',
            desc: ['Model: M3 pedestal table counter height 36H medium circle base', 'Base column finish: Dolphin Textured', 'Base plate finish: Dolphin Textured', 'Top size: 36 dia round', 'Top type: Laminate', 'Laminate Vendor: Wilsonart', 'Top finish or color: Walnut Laminate', 'Edge: 1 flat plywood', 'Edge finish: Natural 11M', 'M3 Counter Height: Custom Counter Height - 36H'],
            sidemark: 'Mark For: T-4 LOUNGE 203 Q16720-01', unit: '$1,103.85', ext: '$2,207.70',
        },
        {
            item: 3, qty: 1, code: 'Freight',
            desc: ['Freight Charges (Not subject to discount)'],
            sidemark: 'Mark For: Q16720-01', unit: '$339.52', ext: '$339.52',
        },
    ],
    comment: 'Customer requested order to arrive 5/19/25',
    subTotal: '$4,159.12',
    paymentsMade: '-4,159.12',
    balance: '$0.00',
}

function MetaRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-zinc-300 py-1">
            <span className="text-[11px] font-bold text-zinc-700">{label}</span>
            <span className="text-[11px] text-zinc-900">{value}</span>
        </div>
    )
}

export default function ProformaInvoiceModal({ isOpen, onClose }: ProformaInvoiceModalProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                {/* Print isolation — only #leland-proforma prints */}
                <style>{`@media print { body * { visibility: hidden !important; } #leland-proforma, #leland-proforma * { visibility: visible !important; } #leland-proforma { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; } .no-print { display: none !important; } }`}</style>
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-start justify-center p-4 py-8">
                        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-3xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                                {/* Modal chrome header */}
                                <div className="no-print px-5 py-3 border-b border-border bg-card flex items-center gap-3 shrink-0">
                                    <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                                        <FileText className="h-4 w-4 text-warning" aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0">
                                        <DialogTitle as="h3" className="text-sm font-bold text-foreground">Proforma · {LELAND.orderNumber}</DialogTitle>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">Leland Furniture · PO {LELAND.poNumber}</p>
                                    </div>
                                    <button type="button" onClick={onClose} aria-label="Close proforma" className="ml-auto shrink-0 h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Document body · the printable paper */}
                                <div className="flex-1 overflow-y-auto bg-muted/40 p-4">
                                    <div id="leland-proforma" className="mx-auto max-w-[800px] bg-white text-zinc-900 px-8 py-7 shadow-sm">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-6">
                                            <h1 className="text-2xl font-bold tracking-tight">Leland Proforma</h1>
                                            <div className="text-3xl font-serif font-bold tracking-tight">LELAND</div>
                                        </div>

                                        {/* Meta box + company */}
                                        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="max-w-sm">
                                                <MetaRow label="Our order number:" value={LELAND.orderNumber} />
                                                <MetaRow label="Your PO number:" value={LELAND.poNumber} />
                                                <MetaRow label="Date of order:" value={LELAND.dateOfOrder} />
                                                <MetaRow label="Estimated ship week of:" value={LELAND.shipWeek} />
                                            </div>
                                            <div className="md:text-right text-[11px] text-zinc-700 leading-relaxed">
                                                {LELAND.company.map((l, i) => <div key={i} className={i === 0 ? 'font-bold text-zinc-900' : ''}>{l}</div>)}
                                            </div>
                                        </div>

                                        {/* Sold to / Ship to */}
                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] leading-relaxed">
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Sold To:</div>
                                                {LELAND.soldTo.map((l, i) => <div key={i} className={i === 0 ? 'font-bold text-zinc-900' : 'text-zinc-700'}>{l}</div>)}
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Ship To:</div>
                                                {LELAND.shipTo.map((l, i) => <div key={i} className={i === 0 ? 'font-bold text-zinc-900' : 'text-zinc-700'}>{l}</div>)}
                                            </div>
                                        </div>

                                        {/* Contact row */}
                                        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-1 text-[11px] text-zinc-700 border-t border-zinc-200 pt-3">
                                            <span><span className="font-bold">TELEPHONE:</span> {LELAND.telephone}</span>
                                            <span><span className="font-bold">FAX:</span> —</span>
                                            <span><span className="font-bold">ATTENTION:</span> —</span>
                                            <span><span className="font-bold">TELEPHONE:</span> {LELAND.attnTelephone}</span>
                                        </div>

                                        {/* Terms row */}
                                        <div className="mt-3 grid grid-cols-4 border-y border-zinc-300 text-[10px]">
                                            {[['Representative', LELAND.representative], ['Sales Order Type', LELAND.salesOrderType], ['Terms', LELAND.terms], ['Ship Via', LELAND.shipVia]].map(([l, v]) => (
                                                <div key={l} className="px-2 py-1.5">
                                                    <div className="font-bold uppercase tracking-wider text-zinc-500">{l}</div>
                                                    <div className="text-zinc-900 mt-0.5">{v}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Line items */}
                                        <table className="w-full mt-4 text-[11px]">
                                            <thead>
                                                <tr className="border-b border-zinc-400 text-[9px] uppercase tracking-wider text-zinc-600">
                                                    <th className="text-left font-bold py-1 w-8">Item</th>
                                                    <th className="text-left font-bold py-1 w-8">Qty</th>
                                                    <th className="text-left font-bold py-1">Product Code</th>
                                                    <th className="text-left font-bold py-1">Description</th>
                                                    <th className="text-right font-bold py-1 whitespace-nowrap">Unit Price</th>
                                                    <th className="text-right font-bold py-1 whitespace-nowrap">Extended</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {LELAND.lines.map(l => (
                                                    <tr key={l.item} className="border-b border-zinc-200 align-top">
                                                        <td className="py-2 text-zinc-900 tabular-nums">{l.item}</td>
                                                        <td className="py-2 text-zinc-900 tabular-nums">{l.qty}</td>
                                                        <td className="py-2 font-mono text-[10px] text-zinc-900 pr-2">{l.code}</td>
                                                        <td className="py-2 text-zinc-700 pr-2">
                                                            {l.desc.map((d, i) => <div key={i}>{d}</div>)}
                                                            <div className="text-[10px] font-semibold text-zinc-900 mt-0.5">SIDEMARK: {l.sidemark}</div>
                                                        </td>
                                                        <td className="py-2 text-right tabular-nums text-zinc-900 whitespace-nowrap">{l.unit}</td>
                                                        <td className="py-2 text-right tabular-nums font-medium text-zinc-900 whitespace-nowrap">{l.ext}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Comment + totals */}
                                        <div className="mt-5 flex items-end justify-between gap-8">
                                            <div className="text-[11px] max-w-xs">
                                                <div className="font-bold text-zinc-700">COMMENT:</div>
                                                <div className="text-zinc-700">{LELAND.comment}</div>
                                            </div>
                                            <div className="w-56 text-[11px]">
                                                <div className="flex items-center justify-between border-b border-zinc-300 py-1">
                                                    <span className="font-bold text-zinc-700">SubTotal</span>
                                                    <span className="font-bold tabular-nums text-zinc-900">{LELAND.subTotal}</span>
                                                </div>
                                                <div className="flex items-center justify-between py-1">
                                                    <span className="text-zinc-600">Payments Made</span>
                                                    <span className="tabular-nums text-zinc-900">{LELAND.paymentsMade}</span>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-zinc-300 py-1">
                                                    <span className="font-bold text-zinc-900">Balance Now Owing</span>
                                                    <span className="font-bold tabular-nums text-zinc-900">{LELAND.balance}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-8 pt-3 border-t border-zinc-200 flex items-center justify-between text-[9px] text-zinc-500">
                                            <span>All orders are subject to the Terms and Conditions found at www.lelandfurniture.com</span>
                                            <span>Page 1 of 1</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal chrome footer */}
                                <div className="no-print px-5 py-3 border-t border-border bg-card flex items-center justify-between gap-2 shrink-0">
                                    <span className="text-[10px] text-muted-foreground italic">Verbatim Leland proforma · grounded in client document</span>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={onClose} className="inline-flex items-center justify-center h-9 px-4 rounded-md text-[12px] font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors">Close</button>
                                        <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md text-[12px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                                            <Printer className="h-3.5 w-3.5" aria-hidden="true" /> Print
                                        </button>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
