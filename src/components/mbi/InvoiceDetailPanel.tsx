/**
 * COMPONENT: InvoiceDetailPanel
 * PURPOSE: Detail view for the currently-selected invoice. Shows an OCR-style
 *          document preview mockup, extracted fields with per-field confidence,
 *          and (for HealthTrust invoices) the specific 3% rebate flag that
 *          Strata applies automatically per MBI's contract logic.
 *
 *          This is the trust-building moment for Kathy: she sees AI reading
 *          her invoices and pre-populating CORE without losing visibility.
 *
 * PROPS:
 *   - invoice: Invoice                 — the currently selected invoice
 *
 * STATES:
 *   - default — show preview + extracted fields
 *   - HealthTrust — extra ribbon + 3% rebate callout
 *   - exception — warning card at top
 *
 * DS TOKENS: bg-card · border-border · amber (HealthTrust) · red (exception) ·
 *            ai (Strata AI surfaces) · primary (CORE voucher CTA)
 *
 * USED BY: MBIAccountingPage (Document AI section, right column)
 */

import { useState } from 'react'
import { FileText, AlertTriangle, Building2, Calendar, DollarSign, Sparkles, Clock, CreditCard, FileDown } from 'lucide-react'
import type { Invoice } from '../../config/profiles/mbi-data'
import MBIDetailSheet from './MBIDetailSheet'

interface InvoiceDetailPanelProps {
    invoice: Invoice
}

// ─── InvoiceDocPreview ───────────────────────────────────────────────────────
// Panel central: header de la factura + exception banner + mockup del documento
export function InvoiceDocPreview({ invoice }: InvoiceDetailPanelProps) {
    const [pdfOpen, setPdfOpen] = useState(false)
    const received = new Date(invoice.received)

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                            <FileText className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-bold text-foreground truncate">{invoice.id} · {invoice.vendor}</div>
                            <div className="text-[10px] text-muted-foreground">
                                Received {received.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} · {received.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {invoice.isEDI ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 uppercase tracking-wider">EDI</span>
                        ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">OCR</span>
                        )}
                        <button
                            onClick={() => setPdfOpen(true)}
                            className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-zinc-900 dark:text-primary hover:bg-primary/20 transition-colors uppercase tracking-wider"
                            title="View full PDF"
                        >
                            <FileDown className="h-3 w-3" />
                            PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Exception banner */}
            {invoice.hasException && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/20 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                        <div className="font-bold text-red-700 dark:text-red-400">Exception requires review</div>
                        <div className="text-muted-foreground mt-0.5">{invoice.exceptionReason}</div>
                    </div>
                </div>
            )}

            {/* Document mockup */}
            <div className="p-4">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Source document</div>
                <div className="aspect-[4/3] bg-card border border-border rounded-xl p-5 text-[10px] text-foreground overflow-hidden">
                    <InvoiceMockup invoice={invoice} />
                </div>
            </div>

            {/* PDF detail sheet */}
            <MBIDetailSheet
                isOpen={pdfOpen}
                onClose={() => setPdfOpen(false)}
                title={`${invoice.id} · ${invoice.vendor}`}
                subtitle={`Source document · OCR-extracted · received ${received.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                icon={<FileText className="h-4 w-4" />}
                width="lg"
            >
                <InvoicePDFFull invoice={invoice} />
            </MBIDetailSheet>
        </div>
    )
}

// ─── InvoiceExtractedFields ───────────────────────────────────────────────────
// Panel derecho: campos extraídos por AI + rebate callout + CTA de CORE
export function InvoiceExtractedFields({ invoice }: InvoiceDetailPanelProps) {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            {/* AI extracted fields */}
            <div className="px-4 pt-4 pb-3 space-y-3">
                <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-ai" />
                    <div className="text-[10px] font-bold text-ai uppercase tracking-wider">Strata extracted · confidence {invoice.ocrConfidence}%</div>
                </div>
                <div className="space-y-1.5">
                    <FieldRow icon={<Building2 className="h-3 w-3" />} label="Vendor" value={invoice.vendor} confidence={99} />
                    {invoice.clientName && (
                        <FieldRow icon={<Building2 className="h-3 w-3" />} label="Project" value={invoice.clientName} confidence={99} />
                    )}
                    <FieldRow icon={<FileText className="h-3 w-3" />} label="PO Number" value={invoice.poNumber} confidence={invoice.ocrConfidence} />
                    <FieldRow icon={<DollarSign className="h-3 w-3" />} label="Amount" value={`$${invoice.amount.toLocaleString()}`} confidence={invoice.ocrConfidence} />
                    {invoice.invoiceDate && (
                        <FieldRow icon={<Calendar className="h-3 w-3" />} label="Bill Date" value={new Date(invoice.invoiceDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} confidence={invoice.ocrConfidence} />
                    )}
                    {invoice.paymentTerms && (
                        <FieldRow icon={<CreditCard className="h-3 w-3" />} label="Terms" value={invoice.paymentTerms} confidence={invoice.ocrConfidence} />
                    )}
                    {invoice.dueDate && (
                        <FieldRow icon={<Clock className="h-3 w-3" />} label="Due Date" value={new Date(invoice.dueDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} confidence={100} highlight={new Date(invoice.dueDate) < new Date(Date.now() + 7 * 86400000)} />
                    )}
                </div>
            </div>


        </div>
    )
}

// ─── Default export (backwards compat) ───────────────────────────────────────
export default function InvoiceDetailPanel({ invoice }: InvoiceDetailPanelProps) {
    return (
        <div className="space-y-4">
            <InvoiceDocPreview invoice={invoice} />
            <InvoiceExtractedFields invoice={invoice} />
        </div>
    )
}

// ─── Internal row helper ─────────────────────────────────────────────────────
function FieldRow({
    icon,
    label,
    value,
    confidence,
    highlight,
}: {
    icon: React.ReactNode
    label: string
    value: string
    confidence: number
    highlight?: boolean
}) {
    return (
        <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border ${highlight ? 'bg-amber-50/60 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30' : 'bg-muted/20 border-border'}`}>
            <div className={`shrink-0 ${highlight ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>{icon}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-20 shrink-0">{label}</div>
            <div className={`flex-1 font-semibold truncate ${highlight ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'}`}>{value}</div>
            <div className="text-[9px] font-bold text-ai tabular-nums">{confidence}%</div>
        </div>
    )
}

// ─── Full PDF invoice (shown in sheet) ───────────────────────────────────────
function InvoicePDFFull({ invoice }: { invoice: Invoice }) {
    const invoiceDate = invoice.invoiceDate
        ? new Date(invoice.invoiceDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
        : new Date(invoice.received).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    const dueDate = invoice.dueDate
        ? new Date(invoice.dueDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
        : '—'

    const total = invoice.amount
    const ratios = [0.38, 0.27, 0.20, 0.10]
    const specs = [
        { qty: 4, code: 'WS-PANEL-48',  description: `${invoice.vendor} — Workstation panels 48"W, fabric-wrapped` },
        { qty: 6, code: 'CHR-TASK-M2',  description: `${invoice.vendor} — Task seating, adjustable-height arms` },
        { qty: 3, code: 'STG-LAT-36',   description: `${invoice.vendor} — Lateral file 36"W, 2-drawer, laminate` },
        { qty: 8, code: 'ACC-TASK-KIT', description: `${invoice.vendor} — Task lighting + cable management` },
        { qty: 1, code: 'FREIGHT',      description: 'Freight + white-glove delivery prep, prepaid' },
    ]
    let used = 0
    const lineItems = specs.map((s, i) => {
        const extended = i < ratios.length ? Math.round(total * ratios[i]) : total - used
        if (i < ratios.length) used += extended
        const unitPrice = Math.round(extended / s.qty)
        return { item: i + 1, ...s, unitPrice, extended }
    })

    return (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden text-zinc-900 font-mono text-[11px] leading-snug shadow-sm">
            {/* ── Header ── */}
            <div className="px-6 pt-5 pb-4 border-b-2 border-zinc-900 flex justify-between items-start">
                <div>
                    <div className="text-[13px] font-black font-serif">Vendor Invoice</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Please reference invoice number on your P.O.</div>
                </div>
                <div className="text-right">
                    <div className="text-[22px] font-black tracking-widest font-serif leading-none">{invoice.vendor.toUpperCase()}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">Office Furniture · St. Louis, MO 63101</div>
                    <div className="text-[10px] text-muted-foreground">Phone: 314-555-0190 · Fax: 314-555-0191</div>
                </div>
            </div>

            {/* ── Metadata rows ── */}
            <div className="px-6 py-3 space-y-1.5 border-b border-zinc-200">
                {[
                    { label: 'Invoice Number:', value: invoice.id },
                    { label: 'Invoice Date:', value: invoiceDate },
                    { label: 'PO Reference:', value: invoice.poNumber },
                    { label: 'Terms:', value: invoice.paymentTerms ?? 'Net 30' },
                    { label: 'Due Date:', value: dueDate },
                ].map(row => (
                    <div key={row.label} className="flex items-baseline gap-3 border-b border-zinc-100 pb-1">
                        <span className="text-muted-foreground w-28 shrink-0 text-[10px]">{row.label}</span>
                        <span className="font-semibold">{row.value}</span>
                    </div>
                ))}
            </div>

            {/* ── Bill To / Ship To ── */}
            <div className="px-6 py-4 border-b border-zinc-200 grid grid-cols-2 gap-6">
                <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">BILL TO:</div>
                    <div className="font-bold text-[12px]">Modern Business Interiors</div>
                    <div className="text-muted-foreground">2020 N Highway 94 Service Rd W</div>
                    <div className="text-muted-foreground">St. Charles, MO 63303 USA</div>
                    <div className="text-muted-foreground mt-1 text-[10px]">Attn: Accounts Payable</div>
                </div>
                <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">SHIP TO:</div>
                    <div className="font-bold text-[12px]">Modern Business Interiors</div>
                    <div className="text-muted-foreground">2020 N Highway 94 Service Rd W</div>
                    <div className="text-muted-foreground">St. Charles, MO 63303 USA</div>
                    <div className="text-muted-foreground mt-1 text-[10px]">Missouri</div>
                </div>
            </div>

            {/* ── Shipping terms bar ── */}
            <div className="px-6 py-2 border-b border-zinc-300 grid grid-cols-4 gap-4 text-[10px]">
                <div><div className="font-bold text-muted-foreground uppercase text-[9px]">FOB</div><div>St. Louis</div></div>
                <div><div className="font-bold text-muted-foreground uppercase text-[9px]">Sales Order Type</div><div>Standard</div></div>
                <div><div className="font-bold text-muted-foreground uppercase text-[9px]">Terms</div><div>{invoice.paymentTerms ?? 'Net 30'}</div></div>
                <div><div className="font-bold text-muted-foreground uppercase text-[9px]">Ship Via</div><div>Prepaid Freight</div></div>
            </div>

            {/* ── List Priced Items ── */}
            <div className="px-6 py-3">
                <div className="bg-zinc-900 text-white px-3 py-1.5 text-[10px] font-bold rounded-sm mb-2">
                    List Priced Items
                </div>
                {/* Column headers */}
                <div className="grid grid-cols-[2rem_2.5rem_3.5rem_1fr_4.5rem_4.5rem] gap-x-3 text-[9px] font-bold uppercase text-muted-foreground px-2 mb-1">
                    <span>ITEM</span><span>QTY</span><span>PROD CODE</span><span>DESCRIPTION</span>
                    <span className="text-right">2026 LIST PRICE</span><span className="text-right">EXTENDED PRICE</span>
                </div>
                {lineItems.map(li => (
                    <div key={li.item} className="grid grid-cols-[2rem_2.5rem_3.5rem_1fr_4.5rem_4.5rem] gap-x-3 px-2 py-2 border-b border-zinc-100 text-[11px]">
                        <span className="text-muted-foreground">{li.item}</span>
                        <span>{li.qty}</span>
                        <span className="font-bold text-[10px] text-muted-foreground truncate">{li.code}</span>
                        <div>
                            <div className="font-semibold">{li.description}</div>
                            {li.item === 1 && invoice.hasException && (
                                <div className="text-red-600 text-[10px] mt-0.5">⚠ {invoice.exceptionReason}</div>
                            )}
                            <div className="text-muted-foreground text-[9px]">Ref PO: {invoice.poNumber}</div>
                        </div>
                        <span className="text-right tabular-nums">${li.unitPrice.toLocaleString()}</span>
                        <span className="text-right tabular-nums font-bold">${li.extended.toLocaleString()}</span>
                    </div>
                ))}
                {/* List SubTotal */}
                <div className="flex justify-end gap-6 mt-2 pr-2 text-[11px]">
                    <span className="text-muted-foreground">List SubTotal</span>
                    <span className="font-bold tabular-nums border-t border-zinc-400 pt-0.5 min-w-[4.5rem] text-right">${invoice.amount.toLocaleString()}</span>
                </div>
            </div>

            {/* ── Net Priced Items (freight/extras) ── */}
            <div className="px-6 py-3 border-t border-zinc-200">
                <div className="bg-zinc-700 text-white px-3 py-1.5 text-[10px] font-bold rounded-sm mb-2">
                    Net Priced Items
                </div>
                <div className="grid grid-cols-[2rem_2.5rem_3.5rem_1fr_4.5rem_4.5rem] gap-x-3 text-[9px] font-bold uppercase text-muted-foreground px-2 mb-1">
                    <span>ITEM</span><span>QTY</span><span>CODE</span><span>DESCRIPTION</span>
                    <span className="text-right">NET PRICE</span><span className="text-right">EXTENDED</span>
                </div>
                {[
                    { item: 1, qty: 1, code: 'FREIGHT', description: 'Freight Charges (Not subject to discount)', net: 0, ext: 0 },
                ].map(li => (
                    <div key={li.item} className="grid grid-cols-[2rem_2.5rem_3.5rem_1fr_4.5rem_4.5rem] gap-x-3 px-2 py-1.5 border-b border-zinc-100 text-[11px]">
                        <span className="text-muted-foreground">{li.item}</span>
                        <span>{li.qty}</span>
                        <span className="font-bold text-[10px] text-muted-foreground">{li.code}</span>
                        <span>{li.description}</span>
                        <span className="text-right tabular-nums">Included</span>
                        <span className="text-right tabular-nums font-bold">$0.00</span>
                    </div>
                ))}
                <div className="flex justify-end gap-6 mt-2 pr-2 text-[11px]">
                    <span className="text-muted-foreground">Net SubTotal</span>
                    <span className="font-bold tabular-nums border-t border-zinc-400 pt-0.5 min-w-[4.5rem] text-right">$0.00</span>
                </div>
            </div>

            {/* ── Grand total ── */}
            <div className="px-6 py-3 border-t-2 border-zinc-900 flex justify-end gap-6 text-[13px]">
                <span className="font-black">TOTAL DUE</span>
                <span className="font-black tabular-nums">${invoice.amount.toLocaleString()}</span>
            </div>

            {/* ── Comments / T&C ── */}
            <div className="px-6 py-3 border-t border-zinc-200 space-y-1 text-[10px] text-muted-foreground">
                <div className="font-bold text-muted-foreground text-[11px]">COMMENT:</div>
                <div>Pricing is valid for 30 days from the invoice date. Please verify quantities and specifications.</div>
                <div>Payment due within terms stated above. Late payments subject to 1.5% monthly finance charge.</div>
                <div className="font-bold text-muted-foreground mt-1">FREIGHT TERMS:</div>
                <div>Freight included in list price. Delivery Mon–Fri 8:00 AM–5:00 PM. Special arrangements may incur additional charges.</div>
            </div>

            {/* ── Footer ── */}
            <div className="px-6 py-2 border-t border-zinc-200 flex justify-between text-[9px] text-muted-foreground bg-muted">
                <span>All orders are subject to Terms and Conditions. Auto-extracted by Strata Document AI · logged to CORE on post.</span>
                <span>Page 1 of 1</span>
            </div>
        </div>
    )
}

// ─── Mini invoice mockup — Leland-style corporate document ───────────────────
function InvoiceMockup({ invoice }: { invoice: Invoice }) {
    const invoiceDate = invoice.invoiceDate
        ? new Date(invoice.invoiceDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
        : new Date(invoice.received).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
    const dueDate = invoice.dueDate
        ? new Date(invoice.dueDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
        : '—'

    return (
        <div className="h-full w-full text-[8px] text-zinc-900 dark:text-zinc-900 flex flex-col overflow-hidden leading-snug bg-white dark:bg-white">
            {/* ── Header ── */}
            <div className="flex justify-between items-start pb-1 border-b border-zinc-400">
                <div>
                    <div className="text-[10px] font-black font-serif">Vendor Invoice</div>
                </div>
                <div className="text-right">
                    <div className="text-[13px] font-black tracking-widest font-serif leading-none">{invoice.vendor.toUpperCase()}</div>
                    <div className="text-[7px] text-muted-foreground mt-0.5">Office Furniture · St. Louis, MO</div>
                    <div className="text-[7px] text-muted-foreground">Phone: 314-555-0190</div>
                </div>
            </div>

            {/* ── Metadata rows ── */}
            <div className="mt-1 space-y-0.5">
                {[
                    { label: 'Invoice Number:', value: `${invoice.id}  (Please reference on your P.O.)` },
                    { label: 'Invoice Date:', value: invoiceDate },
                    { label: 'PO Reference:', value: invoice.poNumber },
                    { label: 'Terms:', value: invoice.paymentTerms ?? 'Net 30' },
                ].map(row => (
                    <div key={row.label} className="flex items-baseline gap-2 border-b border-zinc-200 pb-0.5">
                        <span className="text-muted-foreground w-20 shrink-0">{row.label}</span>
                        <span className="font-semibold truncate">{row.value}</span>
                    </div>
                ))}
            </div>

            {/* ── Bill To / Ship To ── */}
            <div className="flex gap-4 mt-1.5">
                <div>
                    <div className="font-bold uppercase text-[6px] tracking-wider text-muted-foreground">BILL TO:</div>
                    <div className="font-semibold">Modern Business Interiors</div>
                    <div className="text-muted-foreground">2020 N Highway 94 Service Rd W</div>
                    <div className="text-muted-foreground">St. Charles, MO 63303 USA</div>
                </div>
                <div>
                    <div className="font-bold uppercase text-[6px] tracking-wider text-muted-foreground">SHIP TO:</div>
                    <div className="text-muted-foreground">Missouri</div>
                    <div className="text-muted-foreground">Due: {dueDate}</div>
                </div>
            </div>

            {/* ── Terms bar ── */}
            <div className="grid grid-cols-4 gap-x-2 mt-1.5 border-t border-b border-zinc-300 py-0.5 text-[7px]">
                <div><div className="font-bold text-muted-foreground uppercase">FOB</div><div>St. Louis</div></div>
                <div><div className="font-bold text-muted-foreground uppercase">Type</div><div>Standard</div></div>
                <div><div className="font-bold text-muted-foreground uppercase">Terms</div><div>{invoice.paymentTerms ?? 'Net 30'}</div></div>
                <div><div className="font-bold text-muted-foreground uppercase">Ship Via</div><div>Prepaid</div></div>
            </div>

            {/* ── List Priced Items ── */}
            <div className="mt-1 flex-1 min-h-0">
                <div className="bg-zinc-800 text-white flex items-center px-1.5 py-0.5 text-[7px] font-bold mb-0.5">
                    <span>List Priced Items</span>
                </div>
                <div className="grid grid-cols-[1rem_1rem_1fr_auto_auto] gap-x-1.5 text-[6.5px] font-bold uppercase text-muted-foreground px-1 mb-0.5">
                    <span>#</span><span>QTY</span><span>DESCRIPTION</span><span className="text-right">UNIT</span><span className="text-right">EXT</span>
                </div>
                {[
                    { n: 1, qty: 4, desc: `${invoice.vendor} — Workstation panels 48"W`, unit: Math.round(invoice.amount * 0.48 / 4), ext: Math.round(invoice.amount * 0.48) },
                    { n: 2, qty: 6, desc: `${invoice.vendor} — Task seating, adj. arms`,  unit: Math.round(invoice.amount * 0.33 / 6), ext: Math.round(invoice.amount * 0.33) },
                    { n: 3, qty: 3, desc: 'Storage + accessories · Ref: ' + invoice.poNumber, unit: Math.round((invoice.amount - Math.round(invoice.amount * 0.48) - Math.round(invoice.amount * 0.33)) / 3), ext: invoice.amount - Math.round(invoice.amount * 0.48) - Math.round(invoice.amount * 0.33) },
                ].map(row => (
                    <div key={row.n} className="grid grid-cols-[1rem_1rem_1fr_auto_auto] gap-x-1.5 px-1 border-b border-zinc-200 py-0.5">
                        <span className="text-muted-foreground">{row.n}</span>
                        <span>{row.qty}</span>
                        <div className="font-semibold truncate">{row.desc}</div>
                        <span className="tabular-nums text-right">${row.unit.toLocaleString()}</span>
                        <span className="tabular-nums text-right font-bold">${row.ext.toLocaleString()}</span>
                    </div>
                ))}
                <div className="flex justify-end gap-3 mt-0.5 text-[7px] pr-1">
                    <span className="text-muted-foreground">List SubTotal</span>
                    <span className="font-bold tabular-nums">${invoice.amount.toLocaleString()}</span>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-zinc-300 pt-0.5 flex justify-between text-[6px] text-muted-foreground mt-auto">
                <span className="italic">Auto-extracted by Strata Document AI · logged to CORE</span>
                <span>Page 1 of 1</span>
            </div>
        </div>
    )
}
