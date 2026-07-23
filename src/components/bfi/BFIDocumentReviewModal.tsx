/**
 * BFIDocumentReviewModal
 * Adapts Smart Comparator's DocumentPreviewModal + FieldReviewModal
 * for the BFI Agency Fee demo (DOE-2847 / Q-2026-0089).
 *
 * Left panel (3/5): Tabs — SIF document preview | Floor Plan
 * Right panel (2/5): Field review with Quote Tool-based discrepancy resolution
 *
 * step prop controls which fields and funnel position are shown.
 */

import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    X, FileText,
    ChevronDown, ChevronUp, CheckCircle2, Sparkles,
    Edit, Edit2, Edit3, Zap, Info, MapPin, Send, AlertCircle,
    Download, Mail, Upload, Loader2, Paperclip,
    CreditCard, ArrowRight, AlertTriangle, Building2
} from 'lucide-react'
import { SplitPaneReviewModal } from 'strata-design-system'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import EmailMetadataBlock from './EmailMetadataBlock'
import { useDemo } from '../../context/DemoContext'

// ─── Types ────────────────────────────────────────────────────────────────────

export type BFIReviewStep = 'extract' | 'quote' | 'val-sif' | 'val-ovniq' | 'labor' | 'cpr' | 'fee'

interface BFIDocumentReviewModalProps {
    isOpen: boolean
    onClose: () => void
    step: BFIReviewStep
    onValidate?: () => void
    scenario?: 'match' | 'gap'  // for step='fee'
    /** Michael mode: pre-approves CPR lines, changes footer to send-to-Nancy */
    michaelMode?: boolean
    /** Invoice upload mode: opens on Attachments tab, adds upload zone + Strata detection + forward to Patricia */
    invoiceUpload?: boolean
}

interface ReviewField {
    id: string
    name: string
    category: 'header' | 'labor' | 'items' | 'logistics' | 'fee'
    extractedValue: string
    expectedValue?: string
    ovniqSuggestion?: string
    status: 'valid' | 'inconsistent' | 'missing'
    reason?: string
}

// ─── Floor Plan SVG ──────────────────────────────────────────────────────────

export function FloorPlanSVG() {
    return (
        <svg viewBox="0 0 300 145" width="100%" className="block rounded border border-zinc-300 bg-white">
            <rect x="0.5" y="0.5" width="299" height="144" fill="#f9f9f9" stroke="#52525b" strokeWidth="1.5"/>
            <line x1="188" y1="0.5" x2="188" y2="144.5" stroke="#52525b" strokeWidth="1.5"/>
            <line x1="188" y1="73" x2="299.5" y2="73" stroke="#52525b" strokeWidth="1.5"/>
            <line x1="8" y1="65" x2="185" y2="65" stroke="#a1a1aa" strokeWidth="0.4" strokeDasharray="4,3"/>
            <line x1="93" y1="14" x2="93" y2="140" stroke="#a1a1aa" strokeWidth="0.4" strokeDasharray="4,3"/>
            <text x="6" y="11" fontSize="5" fill="#71717a" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">OPEN AREA</text>
            {([[8,18],[100,18],[8,78],[100,78]] as [number,number][]).map(([px,py],pi) => (
                <g key={pi}>
                    {[0,1,2].map(i => (
                        <g key={i}>
                            <rect x={px+i*27} y={py} width={24} height={10} fill="#e4e4e7" stroke="#71717a" strokeWidth="0.8" rx="0.5"/>
                            <rect x={px+i*27+8} y={py+11} width={8} height={4} fill="#d4d4d8" stroke="#71717a" strokeWidth="0.4" rx="0.5"/>
                            <rect x={px+i*27+8} y={py+19} width={8} height={4} fill="#d4d4d8" stroke="#71717a" strokeWidth="0.4" rx="0.5"/>
                            <rect x={px+i*27} y={py+24} width={24} height={10} fill="#e4e4e7" stroke="#71717a" strokeWidth="0.8" rx="0.5"/>
                        </g>
                    ))}
                </g>
            ))}
            <text x="193" y="11" fontSize="5" fill="#71717a" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">LOUNGE</text>
            <rect x="192" y="17" width="50" height="20" rx="3" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.8"/>
            <rect x="192" y="17" width="7" height="20" rx="2" fill="#d4d4d8" stroke="#71717a" strokeWidth="0.5"/>
            <rect x="235" y="17" width="7" height="20" rx="2" fill="#d4d4d8" stroke="#71717a" strokeWidth="0.5"/>
            <line x1="199" y1="30" x2="235" y2="30" stroke="#71717a" strokeWidth="0.4" strokeDasharray="2,2"/>
            <ellipse cx="217" cy="48" rx="13" ry="6" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7"/>
            <rect x="192" y="42" width="10" height="13" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7"/>
            <rect x="242" y="42" width="10" height="13" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7"/>
            <rect x="204" y="58" width="11" height="8" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7"/>
            <rect x="219" y="58" width="11" height="8" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7"/>
            <text x="193" y="82" fontSize="5" fill="#71717a" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">STORAGE ROOM</text>
            {[0,1,2,3,4,5].map(i => (
                <g key={i}>
                    <rect x={193+i*18} y={89} width={15} height={22} fill="#e4e4e7" stroke="#71717a" strokeWidth="0.7" rx="0.5"/>
                    <line x1={193+i*18} y1={100} x2={208+i*18} y2={100} stroke="#71717a" strokeWidth="0.4"/>
                    <circle cx={200.5+i*18} cy={95} r="1.2" fill="#71717a"/>
                    <circle cx={200.5+i*18} cy={106} r="1.2" fill="#71717a"/>
                </g>
            ))}
        </svg>
    )
}

// ─── Quote Document Tab (Quote Tool Comparison) ────────────────────────────────

type QTField = { k: string; reqVal: string; resVal: string; changed?: boolean }

const QT_LINES: { code: string; desc: string; lineNum: number; corrected: boolean; fields: QTField[] }[] = [
    {
        code: 'HMI-FU-300', desc: 'Filing Unit', lineNum: 1, corrected: true,
        fields: [
            { k: 'Qty',         reqVal: '×6',       resVal: '×6'       },
            { k: 'List Unit $', reqVal: '1,350.00',  resVal: '1,260.00', changed: true },
            { k: 'List Ext $',  reqVal: '8,100.00',  resVal: '7,560.00', changed: true },
            { k: 'GP target',   reqVal: '0%',         resVal: '0%'        },
            { k: 'Sell Unit $', reqVal: '243.00',     resVal: '226.80',   changed: true },
            { k: 'Sell Ext $',  reqVal: '1,458.00',   resVal: '1,360.80', changed: true },
            { k: 'Lead Time',   reqVal: 'Assigned',   resVal: '20 Day'   },
            { k: 'Disc. Code',  reqVal: 'IV',         resVal: 'IV'        },
        ],
    },
    {
        code: 'HMI-WS-2400', desc: 'Ethospace Workstation', lineNum: 2, corrected: false,
        fields: [
            { k: 'Qty',         reqVal: '×24',          resVal: '×24'          },
            { k: 'List Ext $',  reqVal: '144,000.00',   resVal: '144,000.00'   },
            { k: 'GP target',   reqVal: '0%',            resVal: '0%'           },
            { k: 'Lead Time',   reqVal: '20 Day',       resVal: '20 Day'       },
            { k: 'Disc. Code',  reqVal: 'IV',            resVal: 'IV'           },
        ],
    },
    {
        code: 'HMI-LS-500', desc: 'Aeron Seating', lineNum: 3, corrected: false,
        fields: [
            { k: 'Qty',         reqVal: '×12',         resVal: '×12'         },
            { k: 'List Ext $',  reqVal: '84,000.00',   resVal: '84,000.00'   },
            { k: 'GP target',   reqVal: '0%',           resVal: '0%'          },
            { k: 'Lead Time',   reqVal: '20 Day',      resVal: '20 Day'      },
            { k: 'Disc. Code',  reqVal: 'IV',           resVal: 'IV'          },
        ],
    },
]

function QuoteDocumentTab({ ovniqLines, isPO, validated = true }: { ovniqLines: OvniqLine[]; isPO?: boolean; validated?: boolean }) {
    if (isPO) {
        const parseAmt = (s: string) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0
        const parseQty = (q?: string) => parseInt((q ?? '').replace(/[^0-9]/g, ''), 10) || 1
        const fmt = (n: number) => '$' + n.toLocaleString('en-US')
        const fmtUnit = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
        const sifTotal = ovniqLines.reduce((sum, l) => sum + parseAmt(l.sifPrice), 0)
        const adjTotal = ovniqLines.reduce((sum, l) => sum + parseAmt(l.ovniq), 0)
        const discountAmt = Math.round(adjTotal * 0.375)
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 bg-zinc-100 dark:bg-zinc-950 scrollbar-minimal">
                    <div className="mx-auto w-full bg-card rounded-xl shadow border border-border overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-primary to-[#C3E433]" />
                        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between">
                            <div>
                                <span className="inline-block text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded mb-2">Purchase Order</span>
                                <p className="text-lg font-extrabold text-foreground leading-tight">DOE-2847</p>
                                <p className="text-xs font-mono text-muted-foreground mt-0.5">NYC Dept. of Education · Herman Miller</p>
                            </div>
                            <div className="text-right">
                                <div className="text-[11px] font-black uppercase tracking-widest text-foreground">NYC DOE</div>
                                <div className="text-xs text-muted-foreground mt-0.5">Procurement Office · May 6, 2026</div>
                            </div>
                        </div>
                        <div className="bg-zinc-800 dark:bg-zinc-700 px-6 py-1.5 flex items-center justify-between">
                            <span className="text-[8px] font-bold uppercase text-zinc-200 tracking-widest">LINE ITEMS · CoNY CONTRACT</span>
                            <span className="text-[8px] font-bold text-primary tracking-widest">PO DOE-2847 · Quote Tool Validated ✓</span>
                        </div>
                        <div className="px-6 pt-3 pb-1 grid grid-cols-7 gap-2">
                            {['Code', 'Product', 'Qty', 'T-Code', 'List Unit', 'Sale Unit', 'Sale Ext'].map(h => (
                                <span key={h} className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide">{h}</span>
                            ))}
                        </div>
                        <div className="px-6 pb-4 space-y-0">
                            {ovniqLines.map((line) => {
                                const corrected = line.sifPrice !== line.ovniq
                                const qty       = parseQty(line.qty)
                                const sifExt    = parseAmt(line.sifPrice)
                                const sellExt   = parseAmt(line.ovniq)
                                const sifUnit   = sifExt / qty
                                const unitSell  = sellExt / qty
                                // List = sale / (1 - 37.5% CoNY discount) — catalog price BEFORE CoNY discount
                                const listUnit  = sifUnit / 0.625
                                return (
                                    <div key={line.code ?? line.product} className={`grid grid-cols-7 gap-2 items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${corrected ? 'bg-warning/5 -mx-6 px-6' : ''}`}>
                                        <span className="text-[9px] font-mono text-muted-foreground truncate">{line.code}</span>
                                        <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-100 col-span-1 truncate">{line.product}</span>
                                        <span className="text-[10px] font-mono text-muted-foreground">{line.qty}</span>
                                        <span className="text-[10px] font-mono text-muted-foreground">{line.tcode}</span>
                                        {/* List Unit · catalog · static (pre-CoNY-discount) */}
                                        <span className="text-[10px] font-mono text-muted-foreground dark:text-zinc-300">{fmtUnit(listUnit)}</span>
                                        {/* Sale Unit · with Quote Tool correction story (strikethrough orig + green corrected) */}
                                        {corrected ? (
                                            <span className="text-[10px] font-mono">
                                                <span className="text-warning line-through mr-1">{fmtUnit(sifUnit)}</span>
                                                <span className="text-success font-semibold">{fmtUnit(unitSell)}</span>
                                                <span className="ml-1 text-[8px] font-black text-success">↓</span>
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-semibold font-mono text-zinc-800 dark:text-zinc-100">{fmtUnit(unitSell)}</span>
                                        )}
                                        <span className="text-[10px] font-semibold font-mono text-zinc-800 dark:text-zinc-100">{fmtUnit(sellExt)}</span>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mx-6 mb-4 rounded-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                            {(() => {
                                const listTotal = ovniqLines.reduce((sum, l) => sum + (parseAmt(l.sifPrice) / 0.625), 0)
                                return [
                                    { label: 'List Total · pre-CoNY-discount',     value: fmt(Math.round(listTotal)), muted: true },
                                    { label: 'Adjusted Total · post-discount',     value: fmt(adjTotal),              bold: true  },
                                    { label: 'Discount (−37.5% CoNY)',             value: `−${fmt(discountAmt)}`,    accent: true },
                                ]
                            })().map(row => (
                                <div key={row.label} className={`flex items-center justify-between px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${row.bold ? 'bg-muted dark:bg-zinc-800/50' : ''}`}>
                                    <span className="text-[10px] text-muted-foreground">{row.label}</span>
                                    <span className={`text-[11px] font-mono font-semibold ${row.accent ? 'text-success' : row.muted ? 'text-muted-foreground' : 'text-foreground'}`}>{row.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-[9px] text-muted-foreground dark:text-muted-foreground text-center py-3 border-t border-zinc-100 dark:border-zinc-800">
                            Purchase Order DOE-2847 · Quote Tool validated · CoNY contract · 1 correction applied
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // step='quote': simple Quote document (same structure as isPO but with Quote Tool branding)
    const fmtQ = (n: number) => '$' + n.toLocaleString('en-US')
    const parseAmt = (s: string) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0
    const parseQty = (q?: string) => parseInt((q ?? '').replace(/[^0-9]/g, ''), 10) || 1
    const fmtUnit  = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
    const sifTotal = ovniqLines.reduce((sum, l) => sum + parseAmt(l.sifPrice), 0)
    const adjTotal = ovniqLines.reduce((sum, l) => sum + parseAmt(l.ovniq), 0)
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-100 dark:bg-zinc-950 scrollbar-minimal">
                <div className="mx-auto w-full bg-card rounded-xl shadow border border-border overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-primary to-[#C3E433]" />
                    <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between">
                        <div>
                            <span className="inline-block text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded mb-2">{validated ? 'Quote · Quote Tool' : 'Quote · From SIF'}</span>
                            <p className="text-lg font-extrabold text-foreground leading-tight">Q-2026-0089</p>
                            <p className="text-xs font-mono text-muted-foreground mt-0.5">DOE-2847 · NYC Dept. of Education</p>
                        </div>
                        <div className="text-right">
                            <div className="text-[11px] font-black uppercase tracking-widest text-foreground">MILLER KNOLL</div>
                            <div className="text-xs text-muted-foreground mt-0.5">Account Manager Bly · Rep · May 6, 2026</div>
                        </div>
                    </div>
                    <div className="bg-zinc-800 dark:bg-zinc-700 px-6 py-1.5 flex items-center justify-between">
                        <span className="text-[8px] font-bold uppercase text-zinc-200 tracking-widest">LINE ITEMS · CoNY CONTRACT</span>
                        <span className={`text-[8px] font-bold tracking-widest ${validated ? 'text-primary' : 'text-muted-foreground'}`}>{validated ? 'Quote Tool VALIDATED ✓' : 'PENDING QUOTE TOOL VALIDATION'}</span>
                    </div>
                    {/* Headers · 7 cols · List Unit (pre-CoNY-discount HIGHER, per Wendy) + Sale columns */}
                    <div className="px-6 pt-3 pb-1 grid gap-2 grid-cols-7">
                        {['Code', 'Product', 'Qty', 'T-Code', 'List Unit', 'Sale Unit', 'Sale Ext'].map(h => (
                            <span key={h} className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide">{h}</span>
                        ))}
                    </div>
                    <div className="px-6 pb-4 space-y-0">
                        {ovniqLines.map((line) => {
                            const qty       = parseQty(line.qty)
                            const sifExt    = parseAmt(line.sifPrice)
                            const sellExt   = parseAmt(line.ovniq)
                            const sifUnit   = sifExt / qty
                            const unitSell  = sellExt / qty
                            // List = sale / (1 - 37.5% CoNY discount) — catalog price BEFORE CoNY discount
                            const listUnit  = sifUnit / 0.625
                            const corrected = line.sifPrice !== line.ovniq
                            return (
                                <div key={line.code ?? line.product} className={`grid gap-2 items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0 grid-cols-7 ${corrected ? 'bg-warning/5 -mx-6 px-6' : ''}`}>
                                    <span className="text-[9px] font-mono text-muted-foreground truncate">{line.code}</span>
                                    <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-100 col-span-1 truncate">{line.product}</span>
                                    <span className="text-[10px] font-mono text-muted-foreground">{line.qty}</span>
                                    <span className="text-[10px] font-mono text-muted-foreground">{line.tcode}</span>
                                    {/* List Unit · catalog price · pre-CoNY-discount · static (list doesn't change with Quote Tool) */}
                                    <span className="text-[10px] font-mono text-muted-foreground dark:text-zinc-300">{fmtUnit(listUnit)}</span>
                                    {/* Sale Unit · per-unit post-discount · strikethrough orig + green corrected (Quote Tool correction story) */}
                                    {corrected ? (
                                        <span className="text-[10px] font-mono">
                                            <span className="text-warning line-through mr-1">{fmtUnit(sifUnit)}</span>
                                            <span className="text-success font-semibold">{fmtUnit(unitSell)}</span>
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-semibold font-mono text-zinc-800 dark:text-zinc-100">{fmtUnit(unitSell)}</span>
                                    )}
                                    {/* Sale Ext · extended sale (post-discount, post-correction) */}
                                    <span className="text-[10px] font-semibold font-mono text-zinc-800 dark:text-zinc-100">{fmtUnit(sellExt)}</span>
                                </div>
                            )
                        })}
                        {/* CMF Free · single line item in CORE · negative cost / $0 sell · captures Day-1 GP */}
                        {validated && (
                            <div className="grid gap-2 items-center py-2.5 border-b border-success/20 grid-cols-7 bg-success/5 -mx-6 px-6">
                                <span className="text-[9px] font-mono font-bold text-success truncate">CMF Free</span>
                                <span className="text-[10px] font-semibold text-foreground col-span-1 truncate">
                                    Agency fee · ANT122 <span className="font-mono font-bold text-destructive ml-1">(Cost −$9,255.24)</span>
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground">1</span>
                                <span className="text-[10px] font-mono text-muted-foreground">AG</span>
                                <span className="text-[10px] font-mono text-muted-foreground">—</span>
                                <span className="text-[10px] font-mono font-semibold text-foreground">$0</span>
                                <span className="text-[10px] font-mono font-semibold text-foreground">$0</span>
                            </div>
                        )}
                    </div>
                    <div className="mx-6 mb-4 rounded-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                        {(() => {
                            const listTotal = ovniqLines.reduce((sum, l) => sum + (parseAmt(l.sifPrice) / 0.625), 0)
                            const rows: { label: string; value: string; muted?: boolean; bold?: boolean; accent?: boolean }[] = [
                                { label: 'List Total · pre-CoNY-discount',     value: fmtQ(Math.round(listTotal)), muted: true },
                                { label: 'Adjusted Total · post-discount',     value: fmtQ(adjTotal),              bold: true  },
                            ]
                            if (validated) rows.push({ label: 'Net Day-1 GP · CMF Free line', value: '+$9,255.24', accent: true })
                            return rows
                        })().map(row => (
                            <div key={row.label} className={`flex items-center justify-between px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${row.bold ? 'bg-muted dark:bg-zinc-800/50' : ''}`}>
                                <span className="text-[10px] text-muted-foreground">{row.label}</span>
                                <span className={`text-[11px] font-mono font-semibold ${row.accent ? 'text-success' : row.muted ? 'text-muted-foreground' : 'text-foreground'}`}>{row.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* CORE Entry Preview — how CORE registers this order (Wendy + Jessica: CMF Free as single line item) */}
                    {validated && (
                        <div className="mx-6 mb-4 rounded-lg border border-border bg-muted dark:bg-zinc-800/40 overflow-hidden">
                            <div className="px-4 py-2 border-b border-border bg-muted/60 flex items-center gap-2">
                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">CORE Entry Preview</p>
                                <span className="ml-auto text-[8px] font-bold text-info bg-info/10 border border-info/20 px-1.5 py-0.5 rounded uppercase tracking-wider">From CORE</span>
                            </div>
                            <div className="px-4 py-2 space-y-1 text-[10px]">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Order Type</span>
                                    <span className="font-mono text-zinc-800 dark:text-zinc-100">Direct Bill-HMI</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Calc Code</span>
                                    <span className="font-mono text-zinc-800 dark:text-zinc-100">7 (Enter Cost / Enter Sell)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Booking method</span>
                                    <span className="font-mono text-zinc-800 dark:text-zinc-100">CMF Free · single line item</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">GP target</span>
                                    <span className="font-mono text-zinc-800 dark:text-zinc-100">$9,255.24 Day-1 GP (negative-cost line)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">CMF Free line</span>
                                    <span className="font-mono font-bold text-success">Cost −$9,255.24 · Sell $0 · GP +$9,255.24</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="text-[9px] text-muted-foreground dark:text-muted-foreground text-center py-3 border-t border-zinc-100 dark:border-zinc-800">
                        {validated ? 'Quote Tool validated · 1 correction applied · CoNY Contract ANT122' : 'SIF pricing · Awaiting Quote Tool validation against CoNY contract'}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Service Fees Document Tab ────────────────────────────────────────────────

// ─── CoNY Master Services Agreement (mock contract data · per Jessica 20-may) ──
// The contract is the single source of truth for labor rules and agency fee %s.
// Vigencia 15 years + 15 optional. Locked-in pricing per product category.
const CONY_CONTRACT_DATA = {
    id: 'ANT122',
    name: 'City of New York · Master Services Agreement',
    effective: 'Jan 1, 2025',
    expires: 'Dec 31, 2040',
    extension: '+15 years optional',
    laborRules: [
        { label: 'Minimum',     value: '4h skilled labor (per visit)'                },
        { label: 'Rounding',    value: 'Quarter-hour · rounded up'                   },
        { label: 'OT rate',     value: '1.5× standard rate'                          },
        { label: 'Max labor',   value: '8% of order subtotal (projects under $250K)' },
    ],
    feeSchedule: [
        { category: 'Filing & Storage',       pct: '2.9%' },
        { category: 'Workstations & Systems', pct: '4.0%' },
        { category: 'Lounge & Seating',       pct: '3.9%' },
        { category: 'Tables · Custom',        pct: '3.5% (avg · varies)' },
    ],
}

// ─── Booking method (post Wendy + Jessica 21-may decision) ─────────────────────
// "CMF Free as one line item in Core. Negative cost and 0 sell. NOT a credit memo.
//  Created at line import." Same mechanics as Method 2 of David's transcript,
//  but applied Day 1 (not post-delivery). Resolves the backlog-GP-invisible pain.
// CMF Free amount: $9,255.24 = sum of per-product fees per CoNY ANT122.

// ─── SIF Document Mock Preview ───────────────────────────────────────────────

function SIFDocumentPreview({ step }: { resolvedIds?: Set<string>; step?: BFIReviewStep; customValues?: Record<string, string> }) {
    const isLabor = step === 'labor' || step === 'cpr' || step === 'fee'
    const Row = ({ field, val, num }: { field: string; val: string; num?: boolean }) => (
        <div className="flex font-mono text-[11px] leading-[1.75]">
            <span className="text-muted-foreground w-8 shrink-0">{field}</span>
            <span className="text-muted-foreground/60 shrink-0">=</span>
            <span className={num ? 'text-foreground font-medium' : 'text-foreground'}>{val}</span>
        </div>
    )
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-100 dark:bg-zinc-950 scrollbar-minimal">
                <div className="bg-card rounded-xl shadow border border-border overflow-hidden">
                    {/* Document header */}
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 bg-muted dark:bg-zinc-800/50">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-[11px] font-mono text-foreground font-medium">
                            {isLabor ? 'DOE-2847.po' : 'DOE-2847.sif'}
                        </span>
                        <span className="ml-auto text-[9px] font-mono text-muted-foreground uppercase tracking-widest">SIF</span>
                    </div>
                    {/* SIF content */}
                    <div className="px-5 py-4 space-y-0">
                        <Row field="SF" val={isLabor ? 'S:\\PO\\doe-2847-purchase-order.pdf' : 'S:\\Quotes\\doe-2847-q-2026-0089.pdf'} />
                        <Row field="ST" val="Special T" />
                        <Row field="H2" val="CoNY" />
                        <div className="h-3" />
                        <Row field="PN" val="HMI-FU-300" />
                        <Row field="PD" val="Lateral Filing Unit 3-Drawer" />
                        <Row field="MC" val="" />
                        <Row field="QT" val="6.00" num />
                        <Row field="PL" val="8100.00" num />
                        <Row field="PS" val="0.00" num />
                        <Row field="BP" val="1350.00" num />
                        <Row field="WT" val="0" num />
                        <Row field="S-" val="  0.000" num />
                        <Row field="P%" val="  0.000" num />
                        <Row field="ON" val="FINISH" />
                        <Row field="OD" val="Studio White" />
                        <Row field="ON" val="HANDLE" />
                        <Row field="OD" val="Chrome Pull" />
                        <Row field="UNC" val="56110000" num />
                        <Row field="UND" val="Furniture and Furnishings" />
                        <Row field="UNM" val="N" />
                        <div className="h-3" />
                        <Row field="PN" val="HMI-WS-2400" />
                        <Row field="PD" val="Locale Open-Plan Workstation" />
                        <Row field="MC" val="" />
                        <Row field="QT" val="24.00" num />
                        <Row field="PL" val="144000.00" num />
                        <Row field="PS" val="0.00" num />
                        <Row field="BP" val="6000.00" num />
                        <Row field="WT" val="0" num />
                        <Row field="S-" val="  0.000" num />
                        <Row field="P%" val="  0.000" num />
                        <Row field="ON" val="PANEL" />
                        <Row field="OD" val="Glass" />
                        <Row field="ON" val="FINISH" />
                        <Row field="OD" val="Studio White" />
                        <Row field="UNC" val="56110000" num />
                        <Row field="UND" val="Furniture and Furnishings" />
                        <Row field="UNM" val="N" />
                        <div className="h-3" />
                        <Row field="PN" val="HMI-LS-500" />
                        <Row field="PD" val="Brody WorkLounge" />
                        <Row field="MC" val="" />
                        <Row field="QT" val="12.00" num />
                        <Row field="PL" val="84000.00" num />
                        <Row field="PS" val="0.00" num />
                        <Row field="BP" val="7000.00" num />
                        <Row field="WT" val="0" num />
                        <Row field="S-" val="  0.000" num />
                        <Row field="P%" val="  0.000" num />
                        <Row field="ON" val="FABRIC" />
                        <Row field="OD" val="Momentum Keylargo" />
                        <Row field="ON" val="FINISH" />
                        <Row field="OD" val="Graphite" />
                        <Row field="UNC" val="56110000" num />
                        <Row field="UND" val="Furniture and Furnishings" />
                        <Row field="UNM" val="N" />
                    </div>
                    {/* Footer */}
                    <div className="px-5 py-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5">
                        <div className="h-3.5 w-3.5 bg-zinc-900 dark:bg-white rounded flex items-center justify-center">
                            <span className="text-[7px] font-extrabold text-primary">S</span>
                        </div>
                        <span className="text-[9px] text-muted-foreground">Strata AI · OCR Extraction</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Field data per step ─────────────────────────────────────────────────────

const FIELDS_EXTRACT: ReviewField[] = [
    { id: 'fh1', name: 'Quote #',    category: 'header', extractedValue: 'Q-2026-0089',            status: 'valid' },
    { id: 'fh2', name: 'Contract',   category: 'header', extractedValue: 'CoNY · City of New York', status: 'valid' },
    { id: 'fh3', name: 'Agency',     category: 'header', extractedValue: 'NYC Dept. of Education',  status: 'valid' },
    { id: 'fh4', name: 'Date',       category: 'header', extractedValue: 'May 6, 2026',             status: 'valid' },
    { id: 'f1', name: 'HMI-FU-300 · Filing Unit',            category: 'items', extractedValue: '×6',  status: 'valid' },
    { id: 'f2', name: 'HMI-WS-2400 · Ethospace Workstation', category: 'items', extractedValue: '×24', status: 'valid' },
    { id: 'f3', name: 'HMI-LS-500 · Aeron Seating',          category: 'items', extractedValue: '×12', status: 'valid' },
]

const FIELDS_LABOR: ReviewField[] = [
    // ── Document Header ──────────────────────────────────────────────────────
    { id: 'lh1', name: 'PO #',       category: 'header', extractedValue: 'DOE-2847',                status: 'valid' },
    { id: 'lh2', name: 'Contract',   category: 'header', extractedValue: 'CoNY · City of New York', status: 'valid' },
    { id: 'lh3', name: 'Agency',     category: 'header', extractedValue: 'NYC Dept. of Education',  status: 'valid' },
    { id: 'lh4', name: 'PO Date',    category: 'header', extractedValue: 'May 6, 2026',             status: 'valid' },
    // ── Labor (from SIF) — already reconciled in Quote step, show corrected Quote Tool values
    { id: 'f1', name: 'Carpenters labor', category: 'labor', extractedValue: '45h', status: 'valid' },
    { id: 'f2', name: 'Overtime labor',   category: 'labor', extractedValue: '6h',  status: 'valid' },
    { id: 'l3', name: 'Teamsters',            category: 'labor', extractedValue: '24h', status: 'valid' },
    // ── Pricing & Delivery ────────────────────────────────────────────────────
    { id: 'l4', name: 'PO amount',        category: 'logistics', extractedValue: '$242,480',         status: 'valid' },
    { id: 'l5', name: 'Delivery window',  category: 'logistics', extractedValue: 'May 14–21, 2026',  status: 'valid' },
    { id: 'l6', name: 'Install crew',     category: 'logistics', extractedValue: '3 techs · A·B·C',  status: 'valid' },
]

const FIELDS_CPR: ReviewField[] = [
    {
        id: 'c1', name: 'Carpenters (CPR)', category: 'labor',
        extractedValue: '45h', expectedValue: '50h', ovniqSuggestion: '45h',
        status: 'inconsistent',
        reason: 'CPR muestra 45h reales vs 50h citados. Quote Tool confirma 45h — aceptar CPR.',
    },
    {
        id: 'c2', name: 'OT Carpenters (CPR)', category: 'labor',
        extractedValue: '6h', expectedValue: '8h', ovniqSuggestion: '6h',
        status: 'inconsistent',
        reason: 'CPR muestra 6h OT vs 8h citados. Quote Tool confirma 6h — aceptar CPR.',
    },
    { id: 'c3', name: 'Equipment rental', category: 'items',    extractedValue: '$1,200', status: 'valid' },
    { id: 'c4', name: 'Delivery (actual)', category: 'logistics', extractedValue: 'May 15, 2026', status: 'valid' },
]

const FIELDS_FEE_MATCH: ReviewField[] = [
    { id: 'fe1', name: 'Open Area workstations', category: 'fee', extractedValue: '$18,400', status: 'valid' },
    { id: 'fe2', name: 'Lounge chairs',          category: 'fee', extractedValue: '$9,600',  status: 'valid' },
    { id: 'fe3', name: 'Installation',        category: 'fee', extractedValue: '$12,400', status: 'valid' },
    { id: 'fe4', name: 'Agency fee total',    category: 'fee', extractedValue: '$4,820',  status: 'valid' },
]

const FIELDS_FEE_GAP: ReviewField[] = [
    { id: 'fe1', name: 'Open Area workstations', category: 'fee', extractedValue: '$18,400', status: 'valid' },
    { id: 'fe2', name: 'Lounge chairs',          category: 'fee', extractedValue: '$9,600',  status: 'valid' },
    { id: 'fe3', name: 'Installation',        category: 'fee', extractedValue: '$12,400', status: 'valid' },
    {
        id: 'fe4', name: 'Agency fee total', category: 'fee',
        extractedValue: '$4,505', expectedValue: '$4,820', ovniqSuggestion: '$4,820',
        status: 'inconsistent',
        reason: 'MK Invoice muestra $4,505. Expected $4,820 — gap de −$315. Contactar Account Manager Bly.',
    },
]

function getFields(step: BFIReviewStep, scenario?: 'match' | 'gap'): ReviewField[] {
    if (step === 'labor')   return FIELDS_LABOR
    if (step === 'cpr')     return FIELDS_CPR
    if (step === 'fee')     return scenario === 'gap' ? FIELDS_FEE_GAP : FIELDS_FEE_MATCH
    return FIELDS_EXTRACT
}

// ─── Attachments Panel ───────────────────────────────────────────────────────

const BFI_ATTACHMENTS = [
    { name: 'CPR-NYPL-17706.pdf',      path: '/docs/bfi/cpr/CPR-NYPL-17706.pdf?v=2',          category: 'CPR'     },
    { name: 'invoice-030923-NYPL.pdf', path: '/docs/bfi/invoices/invoice-030923-NYPL.pdf?v=2', category: 'Invoice' },
    { name: 'signin-NYPL-17706.pdf',   path: '/docs/bfi/signin/signin-NYPL-17706.pdf?v=2',     category: 'Sign-In' },
]

const CATEGORY_COLORS: Record<string, string> = {
    CPR:     'bg-info/10 text-info border-info/20',
    Invoice: 'bg-muted text-muted-foreground border-border',
    'Sign-In': 'bg-success/10 text-success border-success/20',
}

// ─── Patricia Dialog ──────────────────────────────────────────────────────────

const PATRICIA_MESSAGE =
`Hi Patricia,

The Quote Tool approved invoice for DOE-2847 (NYC Dept. of Education) has been received and attached.

Invoice details:
  · Vendor: Herman Miller
  · Order: Q-2026-0089
  · Amount: $6,920 (CPR reconciliation approved)
  · Quote Tool status: Approved · May 6, 2026

Please proceed with agency fee verification at your earliest convenience.

— Account Manager DeMar
  BFI Furniture · CoNY Account Manager`

function PatriciaDialog({ isOpen, onSent }: { isOpen: boolean; onSent: () => void }) {
    const [fromEmail, setFromEmail] = useState('lauren.demarco@bfifurniture.com')
    const [toEmail,   setToEmail]   = useState('patricia.hilger@bfifurniture.com · Finance / AR')
    const [ccEmail,   setCcEmail]   = useState('michael.boyle@bfifurniture.com')
    const [subject,   setSubject]   = useState('Quote Tool Approved Invoice · DOE-2847 · Fee Verification')
    const [message,   setMessage]   = useState(PATRICIA_MESSAGE)
    const [attachments, setAttachments] = useState([
        { name: 'invoice-OQ-DOE2847.pdf', badge: 'Quote Tool Approved' },
    ])
    const [sending,   setSending]   = useState(false)
    const [sent,      setSent]      = useState(false)

    const handleSend = () => {
        setSending(true)
        setTimeout(() => { setSending(false); setSent(true); setTimeout(() => onSent(), 900) }, 800)
    }

    const removeAttachment = (name: string) =>
        setAttachments(prev => prev.filter(a => a.name !== name))

    const META_FIELDS = [
        { label: 'From', value: fromEmail, onChange: setFromEmail },
        { label: 'To',   value: toEmail,   onChange: setToEmail },
        { label: 'CC',   value: ccEmail,   onChange: setCcEmail, muted: true },
        { label: 'Subj', value: subject,   onChange: setSubject },
    ]

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={() => {}} className="relative z-[400]">
                <TransitionChild as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>
                <div className="fixed inset-0 flex items-center justify-center p-6">
                    <TransitionChild as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95 translate-y-2" enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg bg-card rounded-2xl shadow-2xl flex flex-col max-h-[88vh] border border-border overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
                                <div className="h-8 w-8 rounded-full bg-ai/10 flex items-center justify-center shrink-0">
                                    <span className="text-[11px] font-black text-ai">ST</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-foreground">Fee Verification · DOE-2847</p>
                                    <p className="text-[10px] text-muted-foreground">Quote Tool invoice attached · Strata AI</p>
                                </div>
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>

                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                                {/* Invoice attachments — removable */}
                                {attachments.map(a => (
                                    <div key={a.name} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-success/30 bg-success/5">
                                        <Paperclip className="h-3.5 w-3.5 text-success shrink-0" />
                                        <span className="text-[11px] font-semibold text-foreground flex-1 truncate">{a.name}</span>
                                        <span className="text-[9px] font-bold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded">{a.badge}</span>
                                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                        {!sent && (
                                            <button onClick={() => removeAttachment(a.name)} className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0" aria-label={`Remove ${a.name}`}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {/* Email metadata — read-only by default · Edit reveals inputs */}
                                <EmailMetadataBlock variant="bordered" fields={META_FIELDS} disabled={sent} />

                                {/* Editable message */}
                                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={12} disabled={sent}
                                    className="w-full rounded-xl border border-border bg-card px-3 py-3 text-[11px] text-foreground leading-relaxed resize-none focus:outline-none focus:border-primary/50 transition-colors font-mono disabled:opacity-60" />

                                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OVNIQ] }]} />
                            </div>

                            <div className="px-5 py-4 border-t border-border shrink-0">
                                {sent ? (
                                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success/10 border border-success/20">
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                        <span className="text-[12px] font-bold text-success">Sent to Patricia · Fee verification initiated</span>
                                    </div>
                                ) : (
                                    <button onClick={handleSend} disabled={sending}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ai text-white text-[12px] font-bold hover:opacity-90 transition-all disabled:opacity-60">
                                        <Send className="h-3.5 w-3.5" />
                                        {sending ? 'Sending…' : 'Send →'}
                                    </button>
                                )}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

// ─── Attachments Panel ────────────────────────────────────────────────────────

type UploadState = 'idle' | 'uploading' | 'detected'

function AttachmentsPanel({ invoiceUpload, michaelMode, onValidate }: { invoiceUpload?: boolean; michaelMode?: boolean; onValidate?: () => void }) {
    const [lightbox, setLightbox] = useState<{ path: string; name: string } | null>(null)
    const [uploadState,        setUploadState]        = useState<UploadState>('idle')
    const [progress,           setProgress]           = useState(0)
    const [showPatriciaDialog, setShowPatriciaDialog] = useState(false)
    const [activation, setActivation] = useState<'detecting' | 'activated'>(
        invoiceUpload ? 'detecting' : 'activated'
    )
    const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set())
    const [uploadingFile, setUploadingFile] = useState<string | null>(null)
    const [fileProgress,  setFileProgress]  = useState(0)

    const simulateFileUpload = (name: string) => {
        if (uploadingFile || uploadedFiles.has(name)) return
        setUploadingFile(name)
        setFileProgress(0)
        const start = Date.now()
        const tick = setInterval(() => {
            const p = Math.min(100, Math.round(((Date.now() - start) / 1200) * 100))
            setFileProgress(p)
            if (p >= 100) {
                clearInterval(tick)
                setUploadedFiles(prev => new Set([...prev, name]))
                setUploadingFile(null)
            }
        }, 40)
    }

    useEffect(() => {
        if (activation === 'detecting') {
            const t = setTimeout(() => setActivation('activated'), 1600)
            return () => clearTimeout(t)
        }
    }, [activation])

    const simulateUpload = () => {
        if (uploadState !== 'idle') return
        setUploadState('uploading')
        setProgress(0)
        const start = Date.now()
        const tick = setInterval(() => {
            const p = Math.min(100, Math.round(((Date.now() - start) / 1400) * 100))
            setProgress(p)
            if (p >= 100) { clearInterval(tick); setUploadState('detected') }
        }, 40)
    }

    if (invoiceUpload && activation === 'detecting') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5 py-10">
                <Loader2 className="h-6 w-6 text-ai animate-spin" />
                <p className="text-[12px] font-bold text-ai">Strata AI · Verifying manager approval…</p>
                <p className="text-[10px] text-muted-foreground">Scanning inbox for CPR approval message</p>
            </div>
        )
    }

    return (
        <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">

                {/* ── AI approval banner (invoiceUpload only) ── */}
                {invoiceUpload && (
                    <div className="rounded-xl border border-ai/30 bg-ai/5 p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
                        <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                        <div className="text-[11px]">
                            <p className="font-bold text-ai">Strata AI · Manager approval detected</p>
                            <p className="text-muted-foreground mt-0.5">Manager Boyle approved CPR reconciliation · Invoice upload unlocked for DOE-2847</p>
                        </div>
                    </div>
                )}

                {/* ── Invoice upload zone — hidden for manager (read-only) ── */}
                <div className="space-y-3">
                    {uploadState === 'idle' && !michaelMode && (
                        invoiceUpload ? (
                            <button
                                onClick={simulateUpload}
                                className="w-full border-2 border-dashed border-ai/30 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-ai/60 hover:bg-ai/5 transition-all group animate-in fade-in slide-in-from-bottom-2 duration-500"
                            >
                                <Upload className="h-6 w-6 text-ai/60 group-hover:text-ai transition-colors" />
                                <p className="text-[12px] font-bold text-foreground">Quote Tool Approved Invoice</p>
                                <p className="text-[10px] text-muted-foreground">Attach the Quote Tool invoice PDF for Purchase Order DOE-2847</p>
                                <p className="text-[9px] text-muted-foreground/60">Accepted: PDF · Max 10MB</p>
                            </button>
                        ) : (
                            <div className="w-full border-2 border-dashed border-border/40 rounded-2xl p-5 flex flex-col items-center gap-2 opacity-40 cursor-not-allowed bg-muted/10">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                                <p className="text-[12px] font-bold text-muted-foreground">Quote Tool Invoice Upload</p>
                                <p className="text-[10px] text-muted-foreground">Available after manager approval</p>
                            </div>
                        )
                    )}

                        {uploadState === 'uploading' && (
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-3.5 w-3.5 text-ai animate-spin shrink-0" />
                                    <span className="text-[11px] font-bold text-foreground">Uploading Quote Tool invoice…</span>
                                    <span className="ml-auto text-[10px] font-mono text-muted-foreground">{progress}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full bg-ai rounded-full transition-all duration-75" style={{ width: `${progress}%` }} />
                                </div>
                                <p className="text-[10px] text-muted-foreground">Strata AI scanning document…</p>
                            </div>
                        )}

                        {uploadState === 'detected' && (
                            <div className="rounded-2xl border-2 border-ai/50 bg-ai/8 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Detection header */}
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-ai shrink-0" />
                                    <span className="text-[14px] font-black text-ai">Strata AI · Invoice Detected</span>
                                    <CheckCircle2 className="h-5 w-5 text-success ml-auto shrink-0" />
                                </div>

                                {/* Detection detail */}
                                <div className="bg-card rounded-xl border border-ai/20 px-3 py-3 space-y-1.5">
                                    {[
                                        ['Document type', 'Quote Tool Invoice · APPROVED'],
                                        ['Purchase Order', 'DOE-2847 · NYC Dept. of Education'],
                                        ['Vendor',        'Herman Miller'],
                                        ['Amount',        '$6,920 · Matches CPR reconciliation ✓'],
                                        ['Date',          'May 6, 2026'],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex gap-2 text-[11px]">
                                            <span className="text-muted-foreground w-24 shrink-0">{label}</span>
                                            <span className="font-semibold text-foreground">{value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* File chip */}
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-success/30 bg-success/5">
                                    <Paperclip className="h-3.5 w-3.5 text-success shrink-0" />
                                    <span className="text-[11px] font-medium text-foreground flex-1">invoice-OQ-DOE2847.pdf · 284 KB</span>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={() => setShowPatriciaDialog(true)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ai text-white text-[12px] font-bold hover:opacity-90 transition-all"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    Forward to Fee Verification →
                                </button>
                            </div>
                        )}

                        {/* Divider */}
                        {uploadState !== 'idle' && (
                            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest text-center">Reference documents</p>
                        )}
                </div>

                {/* Reference files header */}
                {uploadState === 'idle' && (
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Reference documents</span>
                        <div className="flex-1 h-px bg-border/60" />
                        {uploadedFiles.size === 0 && !uploadingFile && (
                            <span className="text-[9px] text-muted-foreground italic">not valid for this upload</span>
                        )}
                        {uploadedFiles.size > 0 && (
                            <span className="text-[9px] text-success font-bold">{uploadedFiles.size} uploaded</span>
                        )}
                    </div>
                )}

                {/* Existing files list */}
                {BFI_ATTACHMENTS.map(file => {
                    const isUploaded  = uploadedFiles.has(file.name)
                    const isUploading = uploadingFile === file.name
                    return (
                        <div key={file.path} className={`rounded-xl border overflow-hidden transition-all ${
                            isUploaded  ? 'border-success/30 bg-success/5 opacity-100' :
                            isUploading ? 'border-ai/30 bg-ai/5 opacity-100' :
                            'border-border/60 bg-muted/20 opacity-70'
                        }`}>
                            <div className="flex items-center gap-2.5 px-3 py-2.5">
                                {isUploaded
                                    ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                    : <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                }
                                <span className={`text-[11px] font-medium flex-1 min-w-0 truncate ${isUploaded ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {file.name}
                                </span>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${CATEGORY_COLORS[file.category]}`}>
                                    {file.category}
                                </span>
                                <button onClick={() => setLightbox(file)}
                                    className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0">
                                    Preview
                                </button>
                                {!isUploaded && !isUploading && !invoiceUpload && !michaelMode && (
                                    <button onClick={() => simulateFileUpload(file.name)}
                                        className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors shrink-0">
                                        Upload →
                                    </button>
                                )}
                                {isUploaded && (
                                    <span className="text-[9px] font-bold text-success shrink-0">✓ Done</span>
                                )}
                            </div>
                            {isUploading && (
                                <div className="px-3 pb-2.5 space-y-1.5">
                                    <div className="flex items-center gap-2 text-[10px]">
                                        <Loader2 className="h-3 w-3 text-ai animate-spin shrink-0" />
                                        <span className="text-ai font-medium">Uploading…</span>
                                        <span className="ml-auto font-mono text-muted-foreground">{fileProgress}%</span>
                                    </div>
                                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full bg-ai rounded-full transition-all duration-75" style={{ width: `${fileProgress}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div className="fixed inset-0 z-[500] bg-black/80 flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setLightbox(null)}>
                    <div className="relative bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                        style={{ width: 680, height: '88vh' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800 shrink-0">
                            <span className="text-[10px] font-bold text-zinc-300 truncate">{lightbox.name}</span>
                            <button onClick={() => setLightbox(null)} className="text-muted-foreground hover:text-white text-lg leading-none ml-4 transition-colors">×</button>
                        </div>
                        <iframe
                            src={`${lightbox.path}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                            title={lightbox.name}
                            className="flex-1 w-full border-none bg-zinc-950"
                        />
                    </div>
                </div>
            )}

            <PatriciaDialog isOpen={showPatriciaDialog} onSent={() => { setShowPatriciaDialog(false); onValidate?.() }} />
        </>
    )
}

// ─── CPR Review Panel ─────────────────────────────────────────────────────────

const CPR_LINES = [
    { id: 'teamsters',       category: 'Teamsters',      quoted: '24h', cpr: '24h', diff: null,   impact: null,    ok: true  },
    { id: 'carpenters',      category: 'Carpenters',     quoted: '50h', cpr: '45h', diff: '-5h',  impact: '-$450', ok: false },
    { id: 'ot-carpenters',   category: 'OT Carpenters',  quoted: '8h',  cpr: '6h',  diff: '-2h',  impact: '-$270', ok: false },
    { id: 'inside-delivery', category: 'Inside Delivery', quoted: '4h', cpr: '4h',  diff: null,   impact: null,    ok: true  },
]

// ─── CPR Notify Dialog ────────────────────────────────────────────────────────

function CPRNotifyDialog({ isOpen, onSent, onClose }: { isOpen: boolean; onSent: () => void; onClose?: () => void }) {
    // F30.d · leftOffset dinámico · idéntico al fix del BFIDocumentReviewModal.
    const { isSidebarCollapsed, isDemoActive } = useDemo()
    const leftOffset = isDemoActive && !isSidebarCollapsed ? 'left-80' : 'left-0'
    const [fromEmail, setFromEmail] = useState('lauren.demarco@bfifurniture.com')
    const [toEmail,   setToEmail]   = useState('michael.boyle@bfifurniture.com')
    const [ccEmail,   setCcEmail]   = useState('walter@conyny.gov · lena.watts@bfi-warehouse.com')
    const [dateText,  setDateText]  = useState('May 6, 2026 · 11:30 AM')
    const [message, setMessage]     = useState(
`Hi Michael,

CPR reconciliation for DOE-2847 is complete. Adjusted labor hours have been reviewed and applied in CORE:

  · Carpenters:    50h → 45h (−5h · −$450)
  · OT Carpenters: 8h → 6h (−2h · −$270)
  · Total impact:  −$720

Signed sign-in sheet (DOE-2847-signin.pdf) is attached as NYC backup. CPR + sign-in together are required to invoice the city.

Please confirm so we can proceed to agency fee verification.

— Account Manager DeMar
  BFI Furniture · CoNY Account Manager`
    )
    const [sending, setSending] = useState(false)
    const [sent, setSent]       = useState(false)

    const handleSend = () => {
        setSending(true)
        setTimeout(() => {
            setSending(false)
            setSent(true)
            setTimeout(() => onSent(), 900)
        }, 800)
    }

    const META_FIELDS = [
        { label: 'From', value: fromEmail, onChange: setFromEmail },
        { label: 'To',   value: toEmail,   onChange: setToEmail },
        { label: 'CC',   value: ccEmail,   onChange: setCcEmail, muted: true },
        { label: 'Date', value: dateText,  onChange: setDateText },
    ]

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={() => {}} className="relative z-[400]">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className={`fixed top-0 ${leftOffset} right-0 bottom-0 bg-black/60 backdrop-blur-sm`} />
                </TransitionChild>

                <div className={`fixed top-0 ${leftOffset} right-0 bottom-0 flex items-center justify-center p-6`}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95 translate-y-2" enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg bg-card rounded-2xl shadow-2xl flex flex-col max-h-[88vh] border border-border overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
                                <div className="h-8 w-8 rounded-full bg-ai/10 flex items-center justify-center shrink-0">
                                    <span className="text-[11px] font-black text-ai">ST</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-foreground">Stakeholder Notification · DOE-2847</p>
                                    <p className="text-[10px] text-muted-foreground">Strata AI pre-drafted · CORE updated</p>
                                </div>
                                <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0" aria-label="Close">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Scrollable body */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                                {/* Section A — CORE update summary */}
                                <div className="rounded-xl border border-success/30 bg-success/5 p-3.5 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                        <span className="text-[11px] font-bold text-success">CORE Updated · WO-2026-0089 · DOE-2847</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-5 text-[10px]">
                                        <span className="text-muted-foreground">Carpenters labor</span>
                                        <span className="font-mono font-semibold text-foreground">50h → 45h (−5h)</span>
                                        <span className="text-muted-foreground">OT Carpenters</span>
                                        <span className="font-mono font-semibold text-foreground">8h → 6h (−2h)</span>
                                        <span className="text-muted-foreground">Total impact</span>
                                        <span className="font-mono font-bold text-warning">−$720</span>
                                        <span className="text-muted-foreground">SIF</span>
                                        <span className="font-semibold text-foreground">Updated accordingly</span>
                                    </div>
                                </div>

                                {/* Section B — Email metadata · read-only by default · Edit reveals inputs */}
                                <EmailMetadataBlock variant="bordered" fields={META_FIELDS} disabled={sent} />

                                {/* Section C — Editable message */}
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    rows={12}
                                    disabled={sent}
                                    className="w-full rounded-xl border border-border bg-card px-3 py-3 text-[11px] text-foreground leading-relaxed resize-none focus:outline-none focus:border-primary/50 transition-colors font-mono disabled:opacity-60"
                                />

                                {/* DataSources */}
                                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-4 border-t border-border shrink-0">
                                {sent ? (
                                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success/10 border border-success/20">
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                        <span className="text-[12px] font-bold text-success">Sent & CORE confirmed</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={onClose}
                                            className="px-4 py-2.5 text-[12px] font-bold text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSend}
                                            disabled={sending}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ai text-white text-[12px] font-bold hover:opacity-90 transition-all disabled:opacity-60"
                                        >
                                            <Send className="h-3.5 w-3.5" />
                                            {sending ? 'Sending…' : 'Send & Confirm →'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

// ─── CPR Review Panel ─────────────────────────────────────────────────────────

// CPR line id → SIF_GROUPS fieldId mapping (for live doc sync)
const CPR_TO_SIF: Record<string, string> = {
    'carpenters':    'f1',
    'ot-carpenters': 'f2',
}

function CPRReviewPanel({ onValidate, michaelMode, invoiceUpload, onResolveChange }: { onValidate?: () => void; michaelMode?: boolean; invoiceUpload?: boolean; onResolveChange?: (ids: Set<string>) => void }) {
    const diffLines = CPR_LINES.filter(l => !l.ok)
    // Michael/invoiceUpload mode: lines arrive pre-approved
    const [approved, setApproved] = useState<Set<string>>(
        (michaelMode || invoiceUpload) ? new Set(diffLines.map(l => l.id)) : new Set()
    )
    const [sent, setSent]             = useState(false)
    const [showDialog, setShowDialog] = useState(false)
    const [showReject, setShowReject] = useState(false)
    const [rejectSent, setRejectSent] = useState(false)
    const [showComment, setShowComment] = useState(false)
    const [commentTo,   setCommentTo]   = useState<'lauren' | 'michael' | 'doe'>('lauren')
    const [commentSent, setCommentSent] = useState(false)
    const [editingLine,  setEditingLine]  = useState<string | null>(null)
    const [editHours,    setEditHours]    = useState('')
    const [editReason,   setEditReason]   = useState('')
    const [editedMap,    setEditedMap]    = useState<Record<string, { hours: string; reason: string }>>({})

    const handleEditSave = (id: string) => {
        setEditedMap(prev => ({ ...prev, [id]: { hours: editHours, reason: editReason } }))
        const next = new Set([...approved, id])
        setApproved(next)
        const sifIds = new Set([...next].map(cprId => CPR_TO_SIF[cprId]).filter(Boolean))
        onResolveChange?.(sifIds)
        setEditingLine(null)
        setEditHours('')
        setEditReason('')
    }

    const COMMENT_RECIPIENTS = {
        lauren:  { initials: 'LD',  name: 'Account Manager DeMar',       role: 'BFI · Account Manager',         color: 'bg-info/20 text-info'       },
        michael: { initials: 'MB',  name: 'Manager Boyle',         role: 'BFI Manager',                   color: 'bg-ai/15 text-ai'           },
        doe:     { initials: 'DOE', name: 'NYC DOE Procurement',  role: 'nycdoe-procurement@schools.nyc.gov', color: 'bg-success/15 text-success' },
    } as const
    const commentRecipient = COMMENT_RECIPIENTS[commentTo]
    const commentMessage = `Hi ${commentRecipient.name.split(' ')[0]} — update on DOE-2847 CPR reconciliation: both labor adjustments (Carpenters −5h · OT −2h · total impact −$720) have been reviewed and approved. Figures are now reflected in CORE.\n\n— Account Manager DeMar, BFI Furniture`

    const handleCommentSend = () => {
        setCommentSent(true)
        setTimeout(() => { setShowComment(false); setCommentSent(false) }, 1200)
    }
    // invoiceUpload mode starts on attachments tab
    const [rightTab, setRightTab] = useState<'review' | 'attachments'>(invoiceUpload ? 'attachments' : 'review')

    const allApproved  = diffLines.every(l => approved.has(l.id))
    const totalImpact  = '-$720'

    const handleApprove = (id: string) => {
        const next = new Set([...approved, id])
        setApproved(next)
        // sync resolved SIF fields: map each approved CPR line to its SIF fieldId
        const sifIds = new Set([...next].map(cprId => CPR_TO_SIF[cprId]).filter(Boolean))
        onResolveChange?.(sifIds)
    }

    const handleDialogSent = () => {
        setSent(true)
        setShowDialog(false)
        setTimeout(() => onValidate?.(), 600)
    }

    return (
        <div className="flex flex-col h-full bg-card min-h-0">
            {/* Header */}
            <div className="bg-background px-5 py-3.5 border-b border-border shrink-0">
                <h4 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">CPR RECONCILIATION</h4>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">DOE-2847 · Approve adjusted labor lines</p>
            </div>

            {/* Right panel tabs */}
            <div className="flex gap-1 px-5 py-2 border-b border-border shrink-0 bg-background">
                {(['review', 'attachments'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setRightTab(t)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            rightTab === t
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {t === 'review' ? 'CPR Review' : 'Attachments'}
                    </button>
                ))}
            </div>

            {rightTab === 'attachments' ? (
                <AttachmentsPanel invoiceUpload={invoiceUpload} michaelMode={michaelMode} onValidate={onValidate} />
            ) : (
            <div className="flex-1 overflow-y-auto">
                {/* AI Banner */}
                <div className="mx-5 mt-4 flex items-start gap-2 p-3 bg-ai/5 border border-ai/20 rounded-xl">
                    <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                    <p className="text-[11px] text-ai leading-relaxed">
                        CPR reconciliation complete · Carpenters −5h · OT −2h · Total impact: <span className="font-bold">{totalImpact}</span>
                    </p>
                </div>

                {/* CPR table */}
                <div className="px-5 mt-4">
                    <div className="rounded-xl border border-border overflow-hidden">
                        <div className="grid grid-cols-4 px-3 py-2 bg-muted/40 border-b border-border">
                            {['Category', 'Quoted', 'CPR', 'Impact'].map(h => (
                                <span key={h} className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{h}</span>
                            ))}
                        </div>
                        {CPR_LINES.map(line => {
                            const isApproved = approved.has(line.id)
                            const isEditing  = editingLine === line.id
                            const wasEdited  = editedMap[line.id] !== undefined
                            return (
                                <div key={line.id} className="border-b border-border/50 last:border-0">
                                <div className={`grid grid-cols-4 items-center px-3 py-2.5 transition-colors ${
                                    isApproved ? 'bg-success/5' : line.ok ? '' : isEditing ? 'bg-muted/30' : 'bg-warning/5'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                            isApproved ? 'bg-success' : line.ok ? 'bg-success' : 'bg-warning'
                                        }`} />
                                        <span className="text-[11px] font-medium text-foreground">{line.category}</span>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground font-mono">{line.quoted}</span>
                                    <span className={`text-[11px] font-mono font-semibold ${line.ok || isApproved ? 'text-foreground' : 'text-warning'}`}>
                                        {wasEdited ? editedMap[line.id].hours : line.cpr}
                                        {wasEdited && <span className="ml-1 text-[8px] text-muted-foreground font-normal">edited</span>}
                                    </span>
                                    <div className="flex items-center justify-end gap-1">
                                        <span className={`text-[11px] font-mono font-semibold ${line.impact ? (isApproved ? 'text-success' : 'text-warning') : 'text-muted-foreground'}`}>
                                            {line.impact ?? '—'}
                                        </span>
                                        {isApproved && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />}
                                    </div>
                                </div>
                                {/* Action bar — below the row for pending discrepancy lines */}
                                {!line.ok && !isApproved && !isEditing && (
                                    <div className="flex items-center gap-2 px-3 pb-2 bg-warning/5">
                                        <span className="text-[10px] text-muted-foreground flex-1">
                                            {line.category}: {line.quoted} quoted → {line.cpr} actual
                                        </span>
                                        <button
                                            onClick={() => { setEditingLine(line.id); setEditHours(line.cpr); setEditReason('') }}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors shrink-0"
                                        >
                                            <Edit3 className="h-3 w-3" /> Edit hours
                                        </button>
                                        <button
                                            onClick={() => handleApprove(line.id)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-success/10 text-success border border-success/20 rounded-lg hover:bg-success/20 transition-all shrink-0"
                                        >
                                            <CheckCircle2 className="h-3 w-3" /> Accept CPR
                                        </button>
                                    </div>
                                )}
                                {/* Inline edit form */}
                                {isEditing && (
                                    <div className="px-3 pb-3 pt-2.5 bg-muted/20 border-t border-border/40 space-y-2.5 animate-in fade-in duration-150">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 space-y-1">
                                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Adj. hours</label>
                                                <input
                                                    type="text"
                                                    value={editHours}
                                                    onChange={e => setEditHours(e.target.value)}
                                                    placeholder={line.cpr}
                                                    className="w-full text-[11px] bg-background border border-border rounded-lg px-2 py-1.5 outline-none focus:border-primary/50 transition-colors font-mono"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Reason</label>
                                                <input
                                                    type="text"
                                                    value={editReason}
                                                    onChange={e => setEditReason(e.target.value)}
                                                    placeholder="e.g. Confirmed by receiving coordinator"
                                                    className="w-full text-[11px] bg-background border border-border rounded-lg px-2 py-1.5 outline-none focus:border-primary/50 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => { setEditingLine(null); setEditHours(''); setEditReason('') }}
                                                className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleEditSave(line.id)}
                                                disabled={!editHours.trim()}
                                                className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-all"
                                            >
                                                Save adjustment
                                            </button>
                                        </div>
                                    </div>
                                )}
                                </div>
                            )
                        })}
                        <div className="grid grid-cols-4 px-3 py-2 bg-warning/5 border-t border-warning/20">
                            <span className="text-[10px] font-black text-foreground col-span-3 uppercase tracking-wide">Total impact</span>
                            <span className="text-[11px] font-black text-warning font-mono">{totalImpact}</span>
                        </div>
                    </div>
                </div>

                <div className="h-4" />
            </div>
            )}

            {/* Footer — only shown on CPR Review tab */}
            {rightTab === 'review' && !invoiceUpload && (
            <div className="px-5 py-4 border-t border-border bg-card shrink-0 space-y-2.5">
                {!michaelMode && (
                    <div className="text-[10px] text-muted-foreground font-bold text-center uppercase tracking-widest">
                        {approved.size}/{diffLines.length} lines approved
                    </div>
                )}
                <div className="flex gap-2">
                    {michaelMode && (
                        <button
                            onClick={() => setShowReject(true)}
                            className="shrink-0 px-5 py-3 text-[12px] font-black rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all uppercase tracking-widest"
                        >
                            Return
                        </button>
                    )}
                    <button
                        onClick={allApproved ? (michaelMode ? () => onValidate?.() : () => setShowDialog(true)) : undefined}
                        disabled={!allApproved}
                        className={`flex-1 py-3 px-6 text-[12px] font-black rounded-xl transition-all uppercase tracking-wide ${
                            allApproved
                                ? 'bg-ai text-white hover:opacity-90 cursor-pointer'
                                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-40'
                        }`}
                    >
                        {michaelMode
                            ? 'Send →'
                            : (sent ? '✓ CORE Updated & Notified' : allApproved ? 'Update CORE & Notify →' : 'Approve lines to continue')
                        }
                    </button>
                </div>
            </div>
            )}

            {!michaelMode && <CPRNotifyDialog isOpen={showDialog} onSent={handleDialogSent} onClose={() => setShowDialog(false)} />}

            {/* Michael reject dialog */}
            <Transition show={showReject} as={Fragment}>
                <Dialog as="div" className="relative z-[500]" onClose={() => setShowReject(false)}>
                    <TransitionChild as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                        leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                    </TransitionChild>
                    <div className="fixed inset-0 flex items-center justify-center p-6">
                        <TransitionChild as={Fragment}
                            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
                                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-muted/30">
                                    <div className="h-8 w-8 rounded-xl bg-warning/10 flex items-center justify-center">
                                        <Mail className="h-4 w-4 text-warning" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-foreground">Return to Lauren</p>
                                        <p className="text-[11px] text-muted-foreground">DOE-2847 · Add a note for Account Manager DeMar</p>
                                    </div>
                                    <button onClick={() => setShowReject(false)} className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="px-5 py-4 space-y-3">
                                    {[
                                        { label: 'From', value: 'michael.boyle@bfifurniture.com' },
                                        { label: 'To',   value: 'lauren.demarco@bfifurniture.com' },
                                    ].map(r => (
                                        <div key={r.label} className="flex items-start gap-2 text-[11px]">
                                            <span className="text-muted-foreground w-10 shrink-0">{r.label}</span>
                                            <span className="font-medium text-foreground">{r.value}</span>
                                        </div>
                                    ))}
                                    <textarea
                                        defaultValue={`Hi Lauren,\n\nReturning DOE-2847 for review before I sign off on the final quote.\n\nPlease double-check the adjusted labor hours against the Quote Tool invoice and confirm before I forward to the client.\n\n— Manager Boyle\n  BFI Furniture · Account Manager`}
                                        rows={7}
                                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[11px] text-foreground leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                <div className="px-5 py-4 border-t border-border flex gap-3">
                                    <button onClick={() => setShowReject(false)} className="text-[12px] font-bold text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                                    <button
                                        onClick={() => { setRejectSent(true); setTimeout(() => { setShowReject(false); setRejectSent(false) }, 900) }}
                                        disabled={rejectSent}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-warning/10 text-warning border border-warning/30 text-[12px] font-black hover:bg-warning/20 transition-all uppercase tracking-widest disabled:opacity-60"
                                    >
                                        {rejectSent
                                            ? <><CheckCircle2 className="h-3.5 w-3.5" /> Returned to Lauren</>
                                            : <><Send className="h-3.5 w-3.5" /> Return →</>
                                        }
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}

// ─── Ask Lauren Dialog ────────────────────────────────────────────────────────

const ASK_LAUREN_MESSAGE =
`Hi Lauren,

Returning DOE-2847 for a quick check before I confirm the agency fee.

Please verify that the CPR-adjusted hours (Carpenters 45h, OT 6h) are correctly reflected in the MK Invoice before I close this out.

Let me know once confirmed and I'll approve.

— Finance Lead Halbert
  BFI Furniture · Finance & AR`

function AskLaurenDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [fromEmail, setFromEmail] = useState('patricia.hilger@bfifurniture.com')
    const [toEmail,   setToEmail]   = useState('lauren.demarco@bfifurniture.com · Account Manager')
    const [message, setMessage] = useState(ASK_LAUREN_MESSAGE)
    const [sending, setSending] = useState(false)
    const [sent,    setSent]    = useState(false)

    const handleSend = () => {
        setSending(true)
        setTimeout(() => {
            setSending(false)
            setSent(true)
            setTimeout(onClose, 900)
        }, 800)
    }

    const META_FIELDS = [
        { label: 'From', value: fromEmail, onChange: setFromEmail },
        { label: 'To',   value: toEmail,   onChange: setToEmail },
    ]

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[500]" onClose={onClose}>
                <TransitionChild as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-6">
                    <TransitionChild as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-xl bg-warning/10 flex items-center justify-center">
                                        <Mail className="h-4 w-4 text-warning" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-foreground">Return to Lauren</p>
                                        <p className="text-[11px] text-muted-foreground">DOE-2847 · Add a note for Account Manager DeMar</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="px-5 pt-4 pb-2 space-y-2.5">
                                <EmailMetadataBlock fields={META_FIELDS} disabled={sent} />

                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    rows={9}
                                    disabled={sent}
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[11px] text-foreground leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                                />
                            </div>

                            <div className="px-5 pb-4">
                                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OVNIQ] }]} />
                            </div>

                            <div className="px-5 py-4 border-t border-border flex items-center gap-3">
                                <button onClick={onClose} className="text-[12px] font-bold text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                                <button
                                    onClick={handleSend}
                                    disabled={sending || sent}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-[12px] font-black hover:opacity-90 transition-all uppercase tracking-widest disabled:opacity-60"
                                >
                                    {sent
                                        ? <><CheckCircle2 className="h-3.5 w-3.5" /> Returned to Lauren</>
                                        : sending
                                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending…</>
                                        : <><Send className="h-3.5 w-3.5" /> Send & Return →</>
                                    }
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

// ─── Fee Review Panel ─────────────────────────────────────────────────────────

// Fee verification · per-line match · expected vs received per product
const FEE_LINES = [
    { product: 'HMI-WS-2400 · Workstations',  sale: '$144,000', tcode: '4.0%', expected: '$5,760.00', receivedMatch: '$5,760.00', receivedGap: '$5,760.00', delta: '$0',       gapDelta: '$0'        },
    { product: 'HMI-LS-500 · Lounge Seating', sale: '$84,000',  tcode: '3.9%', expected: '$3,276.00', receivedMatch: '$3,276.00', receivedGap: '$3,020.76', delta: '$0',       gapDelta: '−$255.24'  },
    { product: 'HMI-FU-300 · Filing Units',   sale: '$7,560',   tcode: '2.9%', expected: '$219.24',   receivedMatch: '$219.24',   receivedGap: '$219.24',   delta: '$0',       gapDelta: '$0'        },
]

const EXPECTED_FEE = '$9,255.24'
const MK_INVOICE_MATCH = '$9,255.24'
const MK_INVOICE_GAP   = '$9,000.00'
const FEE_GAP          = '−$255.24'

function FeeReviewPanel({ scenario, onValidate }: { scenario: 'match' | 'gap'; onValidate?: () => void }) {
    const isMatch        = scenario === 'match'
    const mkInvoice      = isMatch ? MK_INVOICE_MATCH : MK_INVOICE_GAP
    const [showAskLauren, setShowAskLauren] = useState(false)
    // CORE submit state · 'idle' → 'submitting' (loading 800ms) → 'confirmed' (toast 3s) → onValidate()
    const [coreState, setCoreState] = useState<'idle' | 'submitting' | 'confirmed'>('idle')

    const handleConfirmCore = () => {
        setCoreState('submitting')
        setTimeout(() => {
            setCoreState('confirmed')
            setTimeout(() => onValidate?.(), 3000)
        }, 800)
    }

    return (
        <div className="flex flex-col h-full bg-card min-h-0">
            {/* Header */}
            <div className="bg-background px-5 py-3.5 border-b border-border shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">AGENCY FEE VERIFICATION</h4>
                    <span className="text-[8px] font-bold text-ai bg-ai/10 border border-ai/20 px-1.5 py-0.5 rounded uppercase tracking-wider">CMF Free · per-line match</span>
                </div>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">Finance Lead Halbert · Finance & AR · DOE-2847</p>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Status banner */}
                <div className={`mx-5 mt-4 flex items-start gap-2 p-3 rounded-xl border ${
                    isMatch ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'
                }`}>
                    {isMatch
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                        : <AlertCircle  className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                    }
                    <p className={`text-[11px] leading-relaxed font-medium ${isMatch ? 'text-success' : 'text-warning'}`}>
                        {isMatch
                            ? 'Fee verified · MK Invoice matches T-code calculation · Ready to confirm'
                            : `Fee gap detected · MK Invoice ${MK_INVOICE_GAP} vs expected ${EXPECTED_FEE} · Difference: ${FEE_GAP}`
                        }
                    </p>
                </div>

                {/* CPR Reconciliation Summary — already applied */}
                <div className="px-5 mt-3">
                    <div className="rounded-xl border border-border bg-muted/20 p-3">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                            CPR Reconciliation · Applied
                        </p>
                        <div className="space-y-1">
                            {[
                                { label: 'Carpenters',    quoted: '50h', cpr: '45h', impact: '−$450' },
                                { label: 'OT Carpenters', quoted: '8h',  cpr: '6h',  impact: '−$270' },
                            ].map(row => (
                                <div key={row.label} className="flex items-center gap-2 text-[10px]">
                                    <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                                    <span className="text-foreground font-medium w-24 shrink-0">{row.label}</span>
                                    <span className="text-muted-foreground line-through">{row.quoted}</span>
                                    <span className="text-success font-bold ml-1">{row.cpr}</span>
                                    <span className="ml-auto text-success font-mono text-[9px]">{row.impact}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-2 text-[10px] pt-1 border-t border-border/50 mt-1">
                                <span className="font-black text-foreground ml-5 w-24 shrink-0">Total impact</span>
                                <span className="ml-auto text-success font-black font-mono text-[11px]">−$720</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fee breakdown table · per-line match (Expected vs Received) */}
                <div className="px-5 mt-4">
                    <div className="rounded-xl border border-border overflow-hidden">
                        <div className="px-3 py-2 bg-muted/40 border-b border-border flex items-center gap-2">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Per-line match · Contract ANT122 vs Nancy report</p>
                        </div>
                        <div className="grid grid-cols-[1.6fr_5rem_5rem_5rem_3rem] px-3 py-2 bg-muted/20 border-b border-border/50">
                            {['Product · T-code', 'Expected', 'Received', 'Delta', 'Status'].map(h => (
                                <span key={h} className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide">{h}</span>
                            ))}
                        </div>
                        {FEE_LINES.map((line, i) => {
                            const received = isMatch ? line.receivedMatch : line.receivedGap
                            const delta = isMatch ? line.delta : line.gapDelta
                            const isLineGap = delta !== '$0'
                            return (
                                <div key={i} className="grid grid-cols-[1.6fr_5rem_5rem_5rem_3rem] px-3 py-2 border-b border-border/30 last:border-0 items-center">
                                    <div className="pr-2 leading-tight">
                                        <p className="text-[10px] font-medium text-foreground truncate">{line.product}</p>
                                        <p className="text-[8px] text-muted-foreground font-mono">T-code {line.tcode}</p>
                                    </div>
                                    <span className="text-[10px] font-mono text-foreground tabular-nums">{line.expected}</span>
                                    <span className={`text-[10px] font-mono tabular-nums ${isLineGap ? 'text-warning' : 'text-foreground'}`}>{received}</span>
                                    <span className={`text-[10px] font-mono font-semibold tabular-nums ${isLineGap ? 'text-warning' : 'text-muted-foreground'}`}>{delta}</span>
                                    <span className="flex justify-center">
                                        {isLineGap
                                            ? <AlertCircle className="h-3.5 w-3.5 text-warning" />
                                            : <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                        }
                                    </span>
                                </div>
                            )
                        })}
                        <div className="grid grid-cols-[1.6fr_5rem_5rem_5rem_3rem] px-3 py-2.5 bg-muted/30 border-t border-border items-center">
                            <span className="text-[10px] font-black text-foreground uppercase tracking-wide">Total</span>
                            <span className="text-[10px] font-mono font-bold text-foreground tabular-nums">{EXPECTED_FEE}</span>
                            <span className={`text-[10px] font-mono font-bold tabular-nums ${isMatch ? 'text-success' : 'text-warning'}`}>{mkInvoice}</span>
                            <span className={`text-[10px] font-mono font-black tabular-nums ${isMatch ? 'text-success' : 'text-warning'}`}>{isMatch ? '$0' : FEE_GAP}</span>
                            <span className="flex justify-center">
                                {isMatch
                                    ? <CheckCircle2 className="h-4 w-4 text-success" />
                                    : <AlertCircle className="h-4 w-4 text-warning" />
                                }
                            </span>
                        </div>
                    </div>
                </div>

                {/* MK Invoice comparison */}
                <div className="px-5 mt-3">
                    <div className={`rounded-xl border p-3 flex items-center gap-3 ${
                        isMatch ? 'border-success/20 bg-success/5' : 'border-warning/20 bg-warning/5'
                    }`}>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">MK Invoice</p>
                            <p className={`text-[20px] font-black font-mono mt-0.5 ${isMatch ? 'text-success' : 'text-warning'}`}>
                                {mkInvoice}
                            </p>
                        </div>
                        {!isMatch && (
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Gap</p>
                                <p className="text-[16px] font-black text-warning font-mono mt-0.5">{FEE_GAP}</p>
                            </div>
                        )}
                        <div className="flex-1 text-right">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Expected</p>
                            <p className="text-[20px] font-black font-mono mt-0.5 text-foreground">{EXPECTED_FEE}</p>
                        </div>
                    </div>
                </div>

                <div className="h-4" />
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border bg-card shrink-0 space-y-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAskLauren(true)}
                        disabled={coreState !== 'idle'}
                        className="px-3 py-2.5 text-[11px] font-bold rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all shrink-0 disabled:opacity-50"
                    >
                        Return to Lauren →
                    </button>
                    <button
                        onClick={coreState === 'idle' ? handleConfirmCore : undefined}
                        disabled={coreState !== 'idle'}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest ${
                            coreState === 'confirmed'
                                ? (isMatch
                                    ? 'bg-success/15 text-success border border-success/30 cursor-default'
                                    : 'bg-warning/15 text-warning border border-warning/30 cursor-default')
                                : coreState === 'submitting'
                                    ? 'bg-muted text-muted-foreground cursor-wait'
                                    : (isMatch
                                        ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm'
                                        : 'bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20')
                        }`}
                    >
                        {coreState === 'confirmed' ? (
                            isMatch
                                ? <><CheckCircle2 className="h-3.5 w-3.5" /> Order Closed in CORE</>
                                : <><AlertCircle className="h-3.5 w-3.5" /> Discrepancy Flagged</>
                        ) : coreState === 'submitting' ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {isMatch ? 'Closing in CORE…' : 'Flagging…'}</>
                        ) : (
                            isMatch ? 'Close Order & Apply Fee →' : 'Flag discrepancy →'
                        )}
                    </button>
                </div>
                <AskLaurenDialog isOpen={showAskLauren} onClose={() => setShowAskLauren(false)} />
            </div>

            {/* Toast · z-[500] over modal · visible 3s after CORE close/flag */}
            {coreState === 'confirmed' && (
                <div className={`fixed top-6 right-6 z-[500] w-80 rounded-xl border shadow-2xl p-3.5 animate-in fade-in slide-in-from-top-2 duration-300 bg-card ${
                    isMatch ? 'border-success/30' : 'border-warning/30'
                }`}>
                    <div className="flex items-start gap-2.5">
                        {isMatch
                            ? <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                            : <AlertCircle  className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                        }
                        <div className="text-[11px] leading-relaxed">
                            <p className={`font-bold text-[12px] ${isMatch ? 'text-success' : 'text-warning'}`}>
                                {isMatch ? 'Order DOE-2847 closed in CORE' : 'Discrepancy flagged'}
                            </p>
                            <ul className="text-muted-foreground mt-1 space-y-0.5">
                                {isMatch ? (
                                    <>
                                        <li>· Agency fee posted: $9,255.24</li>
                                        <li>· Status: Reconciled · Ready for AR</li>
                                    </>
                                ) : (
                                    <>
                                        <li>· HMI-LS-500 gap: −$255.24</li>
                                        <li>· Flagged to Lauren · awaiting Nancy response</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

// ─── Quote Review Panel ───────────────────────────────────────────────────────

interface OvniqLine { product: string; sifPrice: string; ovniq: string; corrected: boolean; code?: string; qty?: string; tcode?: string }

const INITIAL_OVNIQ_LINES: OvniqLine[] = [
    { product: 'Lateral Filing Unit', sifPrice: '$8,100',   ovniq: '$7,560',   corrected: true,  code: 'HMI-FU-300',  qty: '×6',  tcode: '18%' },
    { product: 'Locale Open-Plan Wks', sifPrice: '$144,000', ovniq: '$144,000', corrected: false, code: 'HMI-WS-2400', qty: '×24', tcode: '18%' },
    { product: 'Brody WorkLounge',    sifPrice: '$84,000',  ovniq: '$84,000',  corrected: false, code: 'HMI-LS-500',  qty: '×12', tcode: '18%' },
]


const LQ_SCOPE = [
    { code: 'HMI-FU-300',  desc: 'Filing Unit',           qty: '×6'  },
    { code: 'HMI-WS-2400', desc: 'Ethospace Workstation', qty: '×24' },
    { code: 'HMI-LS-500',  desc: 'Aeron Seating',         qty: '×12' },
]
const LQ_LABOR = [
    { role: 'Teamsters',       hours: 24, rate: '$75/h',  subtotal: '$1,800' },
    { role: 'Carpenters',      hours: 50, rate: '$90/h',  subtotal: '$4,500' },
    { role: 'OT Carpenters',   hours: 8,  rate: '$135/h', subtotal: '$1,080' },
    { role: 'Inside Delivery', hours: 4,  rate: '$65/h',  subtotal: '$260'   },
]
const LQ_LABOR_TOTAL = '$7,640'

// ─── Labor Quote Dialog (overlay · same email-composer pattern as SendProposalDialog) ──

type LaborDialogPhase = 'draft' | 'sent' | 'received'

function LaborQuoteDialog({ isOpen, onComplete, onClose }: {
    isOpen: boolean
    onComplete: () => void
    onClose: () => void
}) {
    const [phase, setPhase] = useState<LaborDialogPhase>('draft')
    const [fromEmail, setFromEmail] = useState('lauren.demarco@bfifurniture.com')
    const [toEmail,   setToEmail]   = useState('m.weller@wiginstall.com')
    const [ccEmail,   setCcEmail]   = useState('michael.boyle@bfifurniture.com')
    const [dateText,  setDateText]  = useState('May 6, 2026 · 2:47 PM')
    const [subject,   setSubject]   = useState('Labor Quote Request · DOE-2847 · NYC Dept. of Education')
    const [bodyText,  setBodyText]  = useState(
`Hi Michael,

Please provide a labor quote for the following installation at 30 Court Street, Brooklyn, NY 11201 (NYC Dept. of Education · Order DOE-2847).

Attached is the floor plan and product list for your reference.

Thanks,

— Account Manager DeMar
BFI Furniture · CoNY Account Manager`
    )
    const [attachments, setAttachments] = useState([
        { name: 'DOE-2847-floorplan.pdf',     label: 'Floor Plan'   },
        { name: 'DOE-2847-product-list.pdf',  label: 'Product List' },
    ])

    const removeAttachment = (name: string) =>
        setAttachments(prev => prev.filter(a => a.name !== name))

    // CORE push state · activates when user confirms received labor (Fase E.17 SOT)
    const [coreState, setCoreState] = useState<'idle' | 'submitting' | 'confirmed'>('idle')

    // Reset phase + coreState whenever the dialog re-opens
    useEffect(() => { if (!isOpen) { setPhase('draft'); setCoreState('idle') } }, [isOpen])

    const handleSend = () => {
        setPhase('sent')
        setTimeout(() => setPhase('received'), 1600)
    }

    const handleConfirmCore = () => {
        setCoreState('submitting')
        setTimeout(() => {
            setCoreState('confirmed')
            setTimeout(() => onComplete(), 3000)
        }, 800)
    }

    const locked = phase !== 'draft'

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[400]" onClose={() => {}}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-6">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg transform rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

                            {/* Header */}
                            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-muted/30 shrink-0">
                                <div className="h-8 w-8 rounded-full bg-info/15 flex items-center justify-center shrink-0">
                                    <span className="text-[9px] font-black text-info">WIG</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[12px] font-bold text-foreground truncate">Workplace Installation Group</div>
                                    <div className="text-[10px] text-muted-foreground">Installation Vendor · DOE-2847</div>
                                </div>
                                <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0" aria-label="Close">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Scrollable body */}
                            <div className="flex-1 overflow-y-auto">

                                {/* Metadata · read-only by default · Edit reveals inputs */}
                                <div className="px-5 pt-4 pb-3 border-b border-border/60">
                                    <EmailMetadataBlock
                                        subject={{ value: subject, onChange: setSubject }}
                                        fields={[
                                            { label: 'From', value: fromEmail, onChange: setFromEmail },
                                            { label: 'To',   value: toEmail,   onChange: setToEmail },
                                            { label: 'CC',   value: ccEmail,   onChange: setCcEmail, muted: true },
                                            { label: 'Date', value: dateText,  onChange: setDateText },
                                        ]}
                                        disabled={locked}
                                    />
                                </div>

                                {/* Body */}
                                <div className="px-5 py-4 space-y-3">
                                    <textarea value={bodyText} onChange={e => setBodyText(e.target.value)} disabled={locked}
                                        rows={10}
                                        className="w-full text-[12px] text-foreground leading-relaxed bg-transparent outline-none border border-transparent hover:border-border/60 focus:border-primary/50 rounded-lg px-2 py-1.5 -mx-2 transition-colors disabled:opacity-60 resize-y" />

                                    {/* Attachment chips — removable while in draft (pattern from SendProposalDialog) */}
                                    <div className="flex flex-col gap-1.5">
                                        {attachments.map(a => (
                                            <div key={a.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border text-[11px] text-foreground font-medium">
                                                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                <span className="flex-1 truncate">{a.name}</span>
                                                <span className="text-[9px] text-muted-foreground">· {a.label}</span>
                                                {!locked && (
                                                    <button
                                                        onClick={() => removeAttachment(a.name)}
                                                        className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                                                        aria-label={`Remove ${a.name}`}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Sent confirmation — adapts to phase */}
                                    {phase !== 'draft' && (
                                        <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                            <div className="text-xs">
                                                <div className="font-bold text-foreground">Sent to WIG · May 6 · 2:47 PM</div>
                                                <div className="text-muted-foreground mt-0.5">
                                                    {phase === 'sent'
                                                        ? 'Awaiting labor quote · Manager Boyle (BFI) will compile WIG response'
                                                        : 'Labor quote received · Manager Boyle (BFI) compiled WIG response below'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Loading */}
                                    {phase === 'sent' && (
                                        <div className="rounded-xl border border-ai/40 bg-ai/10 px-4 py-3 flex items-center gap-2">
                                            <Loader2 className="h-3.5 w-3.5 text-ai animate-spin" />
                                            <span className="text-[11px] font-bold text-ai uppercase tracking-wide">Waiting for WIG response…</span>
                                        </div>
                                    )}

                                    {/* Michael's compiled response */}
                                    {phase === 'received' && (
                                        <div className="rounded-xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-400">
                                            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-muted/30 border-b border-border">
                                                <div className="h-7 w-7 rounded-full bg-ai/15 flex items-center justify-center shrink-0">
                                                    <span className="text-[9px] font-black text-ai">MB</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-bold text-foreground">Manager Boyle · BFI → Account Manager DeMar</p>
                                                    <p className="text-[9px] text-muted-foreground">May 6, 2026 · 3:15 PM · RE: Labor Quote Request · DOE-2847</p>
                                                </div>
                                                <span className="text-[8px] font-bold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded shrink-0">Compiled</span>
                                            </div>
                                            <div className="px-4 py-3 space-y-2.5">
                                                <p className="text-[11px] text-foreground leading-relaxed">
                                                    Hi Lauren, labor quote compiled for{' '}
                                                    <span className="font-semibold">DOE-2847</span> — 30 Court Street installation.
                                                </p>
                                                <div className="rounded-xl border border-border overflow-hidden">
                                                    <div className="px-3 py-2 bg-muted/40 border-b border-border flex items-center justify-between">
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Labor Quote · DOE-2847</p>
                                                        <span className="text-[9px] font-bold text-muted-foreground">Ref: WIG-2026-0412</span>
                                                    </div>
                                                    <div className="grid grid-cols-[1fr_3.5rem_4rem_5rem] px-3 py-1.5 bg-muted/20 border-b border-border/50">
                                                        {['Role', 'Hours', 'Rate', 'Subtotal'].map(h => (
                                                            <span key={h} className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide text-right first:text-left">{h}</span>
                                                        ))}
                                                    </div>
                                                    {LQ_LABOR.map(l => (
                                                        <div key={l.role} className="grid grid-cols-[1fr_3.5rem_4rem_5rem] px-3 py-2 border-b border-border/30 last:border-0 items-center">
                                                            <span className="text-[10px] font-medium text-foreground">{l.role}</span>
                                                            <span className="text-[10px] font-mono text-muted-foreground text-right">{l.hours}h</span>
                                                            <span className="text-[10px] font-mono text-muted-foreground text-right">{l.rate}</span>
                                                            <span className="text-[10px] font-mono font-semibold text-foreground text-right">{l.subtotal}</span>
                                                        </div>
                                                    ))}
                                                    <div className="px-3 py-2.5 bg-muted/30 border-t border-border flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Total Labor Quote</span>
                                                        <span className="text-[13px] font-black font-mono text-foreground">{LQ_LABOR_TOTAL}</span>
                                                    </div>
                                                </div>
                                                {/* Contract labor rules · sourced from CoNY ANT122 */}
                                                <div className="rounded-lg border border-info/30 bg-info/5 overflow-hidden">
                                                    <div className="px-3 py-1.5 border-b border-info/20 bg-info/10 flex items-center gap-2">
                                                        <Building2 className="h-2.5 w-2.5 text-info" />
                                                        <p className="text-[8px] font-bold text-info uppercase tracking-widest">Contract labor rules · {CONY_CONTRACT_DATA.id}</p>
                                                    </div>
                                                    <div className="px-3 py-1.5 space-y-0.5 text-[9px]">
                                                        {CONY_CONTRACT_DATA.laborRules.map(r => (
                                                            <div key={r.label} className="flex justify-between gap-3">
                                                                <span className="text-muted-foreground shrink-0">{r.label}</span>
                                                                <span className="text-foreground text-right">{r.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">
                                                    — Manager Boyle<br />
                                                    BFI · Director of Strategic Accounts
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="px-5 pb-4">
                                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
                                </div>
                            </div>

                            {/* Footer CTA — by phase */}
                            {phase === 'draft' && (
                                <div className="px-5 py-3.5 border-t border-border bg-card shrink-0">
                                    <button
                                        onClick={handleSend}
                                        className="w-full flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                        Send Request to WIG →
                                    </button>
                                </div>
                            )}
                            {phase === 'sent' && (
                                <div className="px-5 py-3.5 border-t border-border bg-card shrink-0">
                                    <button
                                        disabled
                                        className="w-full flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold bg-muted text-muted-foreground"
                                    >
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Sending…
                                    </button>
                                </div>
                            )}
                            {phase === 'received' && (
                                <div className="px-5 py-3.5 border-t border-border bg-card shrink-0">
                                    <button
                                        onClick={coreState === 'idle' ? handleConfirmCore : undefined}
                                        disabled={coreState !== 'idle'}
                                        className={`w-full flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold transition-all shadow-sm ${
                                            coreState === 'confirmed'
                                                ? 'bg-success/15 text-success border border-success/30 cursor-default'
                                                : coreState === 'submitting'
                                                    ? 'bg-muted text-muted-foreground cursor-wait'
                                                    : 'bg-primary text-primary-foreground hover:opacity-90'
                                        }`}
                                    >
                                        {coreState === 'confirmed' ? (
                                            <><CheckCircle2 className="h-3.5 w-3.5" /> Labor Saved to CORE</>
                                        ) : coreState === 'submitting' ? (
                                            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating CORE…</>
                                        ) : (
                                            <><CheckCircle2 className="h-3.5 w-3.5" /> Push Labor to CORE & Continue →</>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Toast · z-[500] over modal · visible 3s after labor pushed to CORE */}
                            {coreState === 'confirmed' && (
                                <div className="fixed top-6 right-6 z-[500] w-80 rounded-xl border border-success/30 bg-card shadow-2xl p-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-start gap-2.5">
                                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                                        <div className="text-[11px] leading-relaxed">
                                            <p className="font-bold text-success text-[12px]">Labor figures saved to CORE</p>
                                            <ul className="text-muted-foreground mt-1 space-y-0.5">
                                                <li>· Total: $7,640</li>
                                                <li>· 4 categories (Teamsters · Carpenters · OT · Inside Delivery)</li>
                                                <li>· Ready to compile proposal</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

// CMF Free · sourced from CORE (Calc Code 7 · Direct Bill-HMI vendor type)
// CORE registers the CMF Free line (single line item · negative cost / $0 sell)
// when the Quote Tool output is uploaded.
// Strata's role: surface CORE's record so Lauren can confirm — no draft/push.
// Booking method per Wendy + Jessica 21-may: CMF Free line · NOT a credit memo.
const CL_FIELDS: { label: string; value: string; mono?: boolean }[] = [
    { label: 'GL Account', value: '4200-Agency-Fees',                            mono: true },
    { label: 'Calc Code',  value: '7 · Enter Cost / Enter Sell Price'                       },
    { label: 'Vendor',     value: 'Direct Bill-HMI',                             mono: true },
    { label: 'Linked to',  value: 'DOE-2847 · Q-2026-0089',                      mono: true },
    { label: 'Memo',       value: 'Per CoNY Contract ANT122 · CMF Free line item · Day 1' },
]

function QuoteReviewPanel({ onValidate }: { onValidate?: () => void }) {
    const fmt2 = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    const [compOpen, setCompOpen] = useState(false)
    const [showLaborDialog, setShowLaborDialog] = useState(false)

    const handleConfirmAndOpenLabor = () => setShowLaborDialog(true)
    const handleLaborComplete = () => {
        setShowLaborDialog(false)
        onValidate?.()
    }

    return (
        <div className="flex flex-col h-full bg-card min-h-0">
            {/* Header */}
            <div className="bg-background px-5 py-3.5 border-b border-border shrink-0">
                <h4 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">QUOTE TOOL VALIDATION</h4>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">DOE-2847 · Q-2026-0089</p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {/* Correction callout */}
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[9px] font-black text-destructive">1</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[11px] font-bold text-foreground">1 price correction applied</p>
                            <span className="text-[8px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">Source: Quote Tool</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">HMI-FU-300 · $8,100 → $7,560 · per CoNY contract ANT122</p>
                    </div>
                </div>

                {/* Quote Comparison — collapsible · with Restricted Products status chip */}
                <div className="rounded-xl border border-border overflow-hidden">
                    <button
                        onClick={() => setCompOpen(v => !v)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 bg-muted/40 hover:bg-muted/60 transition-colors"
                    >
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Quote Comparison · Requested vs Response</p>
                        <span className="text-[8px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">Source: Quote Tool</span>
                        <span
                            title="Quote Tool OCR'd the Quote Comparison Download · all 3 lines cleared. Exception path ready."
                            className="inline-flex items-center gap-1 text-[8px] font-bold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded uppercase tracking-wider"
                        >
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            Restricted · 0 flagged
                        </span>
                        <span className="ml-auto inline-flex items-center">
                            {compOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                        </span>
                    </button>
                    {compOpen && (
                        <div className="border-t border-border divide-y divide-border/50">
                            {QT_LINES.map(line => (
                                <div key={line.code} className="px-4 py-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[9px] text-muted-foreground">#{line.lineNum}</span>
                                        <span className="text-[10px] font-bold text-foreground">{line.code}</span>
                                        <span className="text-[9px] text-muted-foreground">· {line.desc}</span>
                                        {line.corrected
                                            ? <span className="ml-auto text-[7px] font-black px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/20">CORRECTED</span>
                                            : <span className="ml-auto text-[7px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">NO CHANGE</span>
                                        }
                                    </div>
                                    {line.corrected && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {(['REQUESTED', 'RESPONSE'] as const).map(col => (
                                                <div key={col} className={`rounded-lg px-2.5 py-2 border ${col === 'RESPONSE' ? 'border-success/30 bg-success/5' : 'border-border bg-muted/20'}`}>
                                                    <p className={`text-[7px] font-bold uppercase tracking-widest mb-0.5 ${col === 'RESPONSE' ? 'text-success' : 'text-muted-foreground'}`}>{col}</p>
                                                    <p className="text-[7px] text-muted-foreground/70 mb-1.5 normal-case tracking-normal">
                                                        {col === 'REQUESTED' ? 'From SIF · Designer' : 'Validated by Quote Tool'}
                                                    </p>
                                                    {line.fields.filter(f => f.changed || ['Qty','Sell %'].includes(f.k)).slice(0, 5).map(f => (
                                                        <div key={f.k} className="flex justify-between font-mono text-[8px]">
                                                            <span className="text-muted-foreground">{f.k}</span>
                                                            <span className={col === 'RESPONSE' && f.changed ? 'text-success font-semibold' : 'text-foreground'}>
                                                                {col === 'REQUESTED' ? f.reqVal : f.resVal}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />

                {/* ─── CMF Free · From CORE (single line item · read-only) ──────────── */}
                <div className="rounded-xl border border-ai/30 bg-ai/5 overflow-hidden">
                    <div className="px-4 py-3 border-b border-ai/20 bg-ai/5 flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-ai/15 flex items-center justify-center shrink-0">
                            <CreditCard className="h-3.5 w-3.5 text-ai" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-[12px] font-bold text-foreground">CMF Free · From CORE</p>
                                <span className="text-[8px] font-bold text-info bg-info/10 border border-info/20 px-1.5 py-0.5 rounded uppercase tracking-wider">Source: CORE</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Single line item · negative cost / $0 sell · created at line import (Day 1 GP)</p>
                        </div>
                    </div>

                    <div className="px-4 py-3 space-y-2.5">
                        {/* CMF Free line item · Day-1 GP captured via negative-cost line */}
                        <div className="rounded-lg border border-success/30 bg-success/5 overflow-hidden">
                            <div className="px-3 py-2 bg-success/10 border-b border-success/20 flex items-center justify-between gap-2">
                                <p className="text-[9px] font-bold text-success uppercase tracking-widest">CMF Free · Line item details</p>
                                <span className="text-[8px] font-bold text-success bg-success/15 border border-success/30 px-1.5 py-0.5 rounded uppercase tracking-wider">Day 1 GP captured</span>
                            </div>
                            <div className="px-3 py-2.5 space-y-1.5 text-[10px]">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Description</span>
                                    <span className="text-foreground font-medium">Agency fee · CoNY ANT122</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Calc Code</span>
                                    <span className="text-foreground font-mono">7 · Enter Cost / Enter Sell</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Cost</span>
                                    <span className="font-mono font-bold text-destructive">−$9,255.24</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Sell</span>
                                    <span className="font-mono font-bold text-foreground">$0</span>
                                </div>
                            </div>
                            <div className="px-3 py-2 bg-success/10 border-t border-success/20 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Net effect · Day-1 GP</span>
                                <span className="text-[12px] font-black font-mono text-success">+{fmt2(9255.24)}</span>
                            </div>
                            <div className="px-3 py-2 border-t border-success/20 bg-card/50">
                                <p className="text-[9px] text-muted-foreground leading-snug">
                                    GP = Sell − Cost = 0 − (−$9,255.24) = <span className="text-success font-bold">+$9,255.24</span>. Same mechanic BFI uses today, applied at booking instead of post-delivery — GP visible in backlog Day 1.
                                </p>
                            </div>
                        </div>

                        {/* Read-only metadata fields (GL, Calc Code, Vendor, Linked, Memo) */}
                        <div className="rounded-lg border border-border overflow-hidden text-[11px] bg-card">
                            {CL_FIELDS.map((row, i) => (
                                <div key={row.label} className={`flex gap-3 px-3 py-2 ${i < CL_FIELDS.length - 1 ? 'border-b border-border/60' : ''}`}>
                                    <span className="text-muted-foreground font-semibold w-24 shrink-0">{row.label}</span>
                                    <span className={`flex-1 text-foreground ${row.mono ? 'font-mono tabular-nums' : 'leading-snug'}`}>{row.value}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>

            {/* Footer — status (Strata already posted to CORE) + acknowledge CTA */}
            <div className="px-5 py-4 border-t border-border bg-card shrink-0 space-y-2">
                {/* Status row · Strata already pushed corrected SIF + booked fee */}
                <div className="rounded-lg border border-success/20 bg-success/5 px-3 py-2 flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                    <div className="text-[10px] leading-snug">
                        <p className="font-bold text-success">Corrected SIF posted to CORE</p>
                        <p className="text-muted-foreground">CMF Free line booked per Contract ANT122 · Day-1 GP +$9,255.24</p>
                    </div>
                </div>
                <button
                    onClick={handleConfirmAndOpenLabor}
                    className="w-full py-2.5 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 shadow-sm inline-flex items-center justify-center gap-2"
                >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Confirm & continue →
                </button>
            </div>

            {/* Labor Quote Dialog — opens after CMF Free line confirmed; overlay z-[400] over the modal */}
            <LaborQuoteDialog
                isOpen={showLaborDialog}
                onComplete={handleLaborComplete}
                onClose={() => setShowLaborDialog(false)}
            />
        </div>
    )
}

// ─── Labor Ready Panel (paso 1.5 — all reconciled, send PO) ─────────────────

function LaborReadyPanel({ onValidate, onCustomValue, ovniqLines, onUpdateLine, acceptedRows, onSetAccepted }: {
    onValidate?: () => void
    onCustomValue?: (fieldId: string, value: string) => void
    ovniqLines: OvniqLine[]
    onUpdateLine: (i: number, field: keyof OvniqLine, val: string) => void
    acceptedRows: Set<number>
    onSetAccepted: (next: Set<number>) => void
}) {
    const [showAsk,   setShowAsk]   = useState(false)
    const [askTo,     setAskTo]     = useState<'designer' | 'manager'>('designer')
    const [askSent,   setAskSent]   = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [fieldEdits, setFieldEdits] = useState<Record<string, string>>({})
    const [editingOvniqIdx, setEditingOvniqIdx] = useState<number | null>(null)
    const [ovniqEditVals,   setOvniqEditVals]   = useState<{ sif: string; ovniq: string }>({ sif: '', ovniq: '' })
    // CORE submit state · 'idle' → 'submitting' (loading) → 'confirmed' (toast 3s) → onValidate()
    const [coreState, setCoreState] = useState<'idle' | 'submitting' | 'confirmed'>('idle')

    const handleConfirmCore = () => {
        setCoreState('submitting')
        setTimeout(() => {
            setCoreState('confirmed')
            setTimeout(() => onValidate?.(), 3000)
        }, 800)
    }

    const openOvniqEdit = (i: number) => {
        setEditingOvniqIdx(i)
        setOvniqEditVals({ sif: ovniqLines[i].sifPrice, ovniq: ovniqLines[i].ovniq })
    }
    const saveOvniqEdit = () => {
        if (editingOvniqIdx === null) return
        const i = editingOvniqIdx
        onUpdateLine(i, 'sifPrice', ovniqEditVals.sif)
        onUpdateLine(i, 'ovniq',    ovniqEditVals.ovniq)
        if (ovniqEditVals.sif !== ovniqEditVals.ovniq) {
            const n = new Set(acceptedRows); n.add(i); onSetAccepted(n)
        }
        setEditingOvniqIdx(null)
    }

    const FIELD_GROUPS: { label: string; fields: ReviewField[] }[] = [
        { label: 'Document Header',    fields: FIELDS_LABOR.filter(f => f.category === 'header')    },
        { label: 'Labor (from SIF)',   fields: FIELDS_LABOR.filter(f => f.category === 'labor')     },
        { label: 'Pricing & Delivery', fields: FIELDS_LABOR.filter(f => f.category === 'logistics') },
    ]

    const getVal = (f: ReviewField) => fieldEdits[f.id] ?? f.extractedValue ?? ''

    const handleSaveField = (f: ReviewField) => {
        const val = fieldEdits[f.id] ?? f.extractedValue ?? ''
        onCustomValue?.(f.id, val)
        setEditingId(null)
    }

    const NOTIFY = [
        { initials: 'RC', label: 'Account Manager Bly',   sub: 'Miller Knoll Rep', color: 'bg-info/20 text-info' },
        { initials: 'MB', label: 'Manager Boyle',  sub: 'BFI Manager',      color: 'bg-ai/15 text-ai' },
        { initials: 'DOE', label: 'NYC DOE',      sub: 'Procurement',      color: 'bg-success/15 text-success' },
    ]
    const RECIPIENTS = {
        designer: { initials: 'RC', name: 'Account Manager Bly',  role: 'Miller Knoll Rep', color: 'bg-info/20 text-info' },
        manager:  { initials: 'MB', name: 'Manager Boyle', role: 'BFI Manager',       color: 'bg-ai/15 text-ai'    },
    }
    const recipient = RECIPIENTS[askTo]
    const askMessage = `Hi ${recipient.name.split(' ')[0]} — quick check on PO DOE-2847 before we confirm: can you verify the labor schedule (Carpenters 45h · OT 6h) matches your records? We're ready to transmit to CORE.\n\n— Account Manager DeMar, BFI Furniture`

    const handleAskSend = () => {
        setAskSent(true)
        setTimeout(() => { setShowAsk(false); setAskSent(false) }, 1200)
    }

    return (
        <div className="flex flex-col h-full bg-card min-h-0">
            <div className="bg-background px-5 py-3.5 border-b border-border shrink-0">
                <h4 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">PO &amp; LABOR REVIEW</h4>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">DOE-2847 · Ready to confirm &amp; send</p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* All-clear banner */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-success/5 border border-success/25">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[13px] font-bold text-success">All fields validated</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            PO, pricing, and labor figures are reconciled with Quote Tool. Ready to update CORE and notify stakeholders.
                        </p>
                    </div>
                </div>

                {/* Quote Tool Validated — pricing from paso 1.4, editable */}
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">PO DOE-2847 · Quote Tool Validated</p>
                    <div className="rounded-xl border border-border overflow-hidden">
                        {/* Column headers */}
                        <div className="grid grid-cols-[1fr_5rem_5.5rem_2rem] px-4 py-2 bg-muted/40 border-b border-border">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Product</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide text-right">SIF Price</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide text-right">Quote Tool</span>
                            <span />
                        </div>
                        {ovniqLines.map((line, i) => {
                            const isAccepted   = acceptedRows.has(i)
                            const corrected    = line.sifPrice !== line.ovniq
                            const isEditingRow = editingOvniqIdx === i

                            if (isEditingRow) return (
                                <div key={i} className="px-4 py-3 border-b border-border/50 last:border-0 bg-card animate-in fade-in duration-150">
                                    <p className="text-[10px] font-bold text-muted-foreground mb-2 truncate">{line.product}</p>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div className="space-y-1">
                                            <label className="text-[9px] text-muted-foreground uppercase tracking-wide font-bold">SIF Price</label>
                                            <input
                                                value={ovniqEditVals.sif}
                                                onChange={e => setOvniqEditVals(v => ({ ...v, sif: e.target.value }))}
                                                className="w-full rounded-lg border border-primary px-2 py-1 bg-card ring-2 ring-primary/20 text-[11px] font-mono text-foreground focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] text-muted-foreground uppercase tracking-wide font-bold">Quote Tool</label>
                                            <input
                                                value={ovniqEditVals.ovniq}
                                                onChange={e => setOvniqEditVals(v => ({ ...v, ovniq: e.target.value }))}
                                                className="w-full rounded-lg border border-primary px-2 py-1 bg-card ring-2 ring-primary/20 text-[11px] font-mono text-foreground focus:outline-none"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={saveOvniqEdit}
                                            className="flex-1 py-1.5 text-[11px] font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all">
                                            Save
                                        </button>
                                        <button onClick={() => setEditingOvniqIdx(null)}
                                            className="py-1.5 px-3 text-[11px] font-bold border border-border text-foreground bg-card rounded-lg hover:bg-muted/50 transition-all">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )

                            return (
                                <div key={i} className={`grid grid-cols-[1fr_5rem_5.5rem_2rem] items-center px-4 py-2.5 border-b border-border/50 last:border-0 transition-colors ${
                                    corrected && isAccepted ? 'bg-success/5' : corrected ? 'bg-warning/5' : ''
                                }`}>
                                    <span className="text-[11px] font-medium text-foreground truncate pr-2">{line.product}</span>
                                    <span className={`text-[11px] font-mono tabular-nums text-right ${corrected ? 'text-warning line-through' : 'text-muted-foreground'}`}>
                                        {line.sifPrice}
                                    </span>
                                    <span className={`text-[11px] font-mono font-semibold tabular-nums text-right ${corrected ? (isAccepted ? 'text-success' : 'text-warning') : 'text-foreground'}`}>
                                        {line.ovniq}
                                    </span>
                                    <span />
                                </div>
                            )
                        })}
                        {/* Accepted footer */}
                        {ovniqLines.some((l, i) => l.sifPrice !== l.ovniq && acceptedRows.has(i)) && (
                            <div className="px-4 py-2 bg-success/5 border-t border-success/20 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                                    <span className="text-[10px] text-success font-medium">
                                        {ovniqLines.filter((l, i) => l.sifPrice !== l.ovniq && acceptedRows.has(i)).map(l => `${l.sifPrice} → ${l.ovniq}`).join(' · ')} · accepted
                                    </span>
                                </div>
                                <button
                                    onClick={() => { const n = new Set(acceptedRows); ovniqLines.forEach((l, i) => { if (l.sifPrice !== l.ovniq) n.delete(i) }); onSetAccepted(n) }}
                                    className="text-[9px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border hover:text-foreground transition-all shrink-0 ml-3"
                                >
                                    Undo
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Editable field list */}
                <div className="space-y-4">
                    {FIELD_GROUPS.map(group => (
                        <div key={group.label}>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{group.label}</p>
                            <div className="space-y-1.5">
                                {group.fields.map(field => (
                                    <div key={field.id} className={`border rounded-xl overflow-hidden transition-all ${
                                        editingId === field.id ? 'border-primary/40 bg-card' : 'border-success/20 bg-success/5'
                                    }`}>
                                        {editingId !== field.id ? (
                                            <div className="flex items-center gap-2.5 px-3 py-2.5">
                                                <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                                                <span className="text-[11px] font-bold text-foreground flex-1 min-w-0 truncate">{field.name}</span>
                                                <span className="text-[11px] font-mono text-muted-foreground shrink-0">{getVal(field)}</span>
                                            </div>
                                        ) : (
                                            <div className="p-3 space-y-2 animate-in fade-in duration-150">
                                                <p className="text-[11px] font-bold text-foreground">{field.name}</p>
                                                <input
                                                    type="text"
                                                    value={fieldEdits[field.id] ?? ''}
                                                    onChange={e => setFieldEdits(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                    className="w-full rounded-lg border border-primary px-2.5 py-1.5 bg-card ring-2 ring-primary/20 text-[12px] font-mono text-foreground focus:outline-none"
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSaveField(field)}
                                                        className="flex-1 py-1.5 text-[11px] font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="py-1.5 px-3 text-[11px] font-bold border border-border text-foreground bg-card rounded-lg hover:bg-muted/50 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stakeholders to notify */}
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stakeholders notified</p>
                    {NOTIFY.map(n => (
                        <div key={n.initials} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border">
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black ${n.color}`}>{n.initials}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-foreground">{n.label}</p>
                                <p className="text-[10px] text-muted-foreground">{n.sub}</p>
                            </div>
                            <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                        </div>
                    ))}
                </div>

            </div>

            <div className="px-5 py-4 border-t border-border bg-card shrink-0">
                <button
                    onClick={coreState === 'idle' ? handleConfirmCore : undefined}
                    disabled={coreState !== 'idle'}
                    className={`w-full py-2.5 text-[13px] font-black rounded-xl transition-all uppercase tracking-widest inline-flex items-center justify-center gap-2 ${
                        coreState === 'confirmed'
                            ? 'bg-success/15 text-success border border-success/30 cursor-default'
                            : coreState === 'submitting'
                                ? 'bg-muted text-muted-foreground cursor-wait'
                                : 'bg-primary text-primary-foreground hover:opacity-90'
                    }`}
                >
                    {coreState === 'confirmed' ? (
                        <><CheckCircle2 className="h-4 w-4" /> Order Entered in CORE</>
                    ) : coreState === 'submitting' ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Updating CORE…</>
                    ) : (
                        <>Confirm PO &amp; Update CORE →</>
                    )}
                </button>
            </div>

            {/* Toast · z-[500] over modal · visible 3s after CORE update */}
            {coreState === 'confirmed' && (
                <div className="fixed top-6 right-6 z-[500] w-80 rounded-xl border border-success/30 bg-card shadow-2xl p-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-relaxed">
                            <p className="font-bold text-success text-[12px]">Order DOE-2847 entered in CORE</p>
                            <ul className="text-muted-foreground mt-1 space-y-0.5">
                                <li>· Type: Direct Bill-HMI</li>
                                <li>· Delivery: May 14–21, 2026</li>
                                <li>· Stakeholders notified</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Right Panel Dispatcher ───────────────────────────────────────────────────

function RightPanel({ step, scenario, onValidate, michaelMode, invoiceUpload, onResolveChange, onCustomValue, ovniqLines, onUpdateLine, acceptedRows, onSetAccepted }: {
    step: BFIReviewStep
    scenario?: 'match' | 'gap'
    onValidate?: () => void
    michaelMode?: boolean
    invoiceUpload?: boolean
    onResolveChange?: (ids: Set<string>) => void
    onCustomValue?: (fieldId: string, value: string) => void
    ovniqLines: OvniqLine[]
    onUpdateLine: (i: number, field: keyof OvniqLine, val: string) => void
    acceptedRows: Set<number>
    onSetAccepted: (next: Set<number>) => void
}) {
    if (step === 'extract') return <ExtractReviewPanel onValidate={onValidate} onResolveChange={onResolveChange} onCustomValue={onCustomValue} />
    if (step === 'quote') return <QuoteReviewPanel onValidate={onValidate} />
    if (step === 'labor')  return <LaborReadyPanel onValidate={onValidate} onCustomValue={onCustomValue} ovniqLines={ovniqLines} onUpdateLine={onUpdateLine} acceptedRows={acceptedRows} onSetAccepted={onSetAccepted} />
    if (step === 'cpr')   return <CPRReviewPanel onValidate={onValidate} michaelMode={michaelMode} invoiceUpload={invoiceUpload} onResolveChange={onResolveChange} />
    if (step === 'fee')   return <FeeReviewPanel scenario={scenario ?? 'match'} onValidate={onValidate} />
    return <BFIFieldReview step={step} scenario={scenario} onValidate={onValidate} onResolveChange={onResolveChange} onCustomValue={onCustomValue} />
}

// ─── Funnel Stepper ──────────────────────────────────────────────────────────

const FUNNEL_STEPS = [
    { id: 'intake',    label: 'Intake'     },
    { id: 'quote',     label: 'Quote'      },
    { id: 'po-labor',  label: 'PO & Labor' },
    { id: 'cpr',       label: 'CPR'        },
    { id: 'fee-verify',label: 'Fee Verify' },
]

const STEP_TO_FUNNEL_IDX: Record<BFIReviewStep, number> = {
    extract:     0,
    quote:       1,
    'val-sif':   1,
    'val-ovniq': 1,
    labor:       2,
    cpr:         3,
    fee:         4,
}

function FunnelStepper({ step }: { step: BFIReviewStep }) {
    const activeIdx = STEP_TO_FUNNEL_IDX[step]
    return (
        <div className="flex items-center gap-1 shrink-0">
            {FUNNEL_STEPS.map((s, i) => {
                const active = i === activeIdx
                const past   = i < activeIdx
                return (
                    <Fragment key={s.id}>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold transition-all shrink-0 ${
                            active ? 'bg-primary text-primary-foreground'
                            : past  ? 'bg-muted/60 text-foreground/70'
                            :         'bg-muted/30 text-muted-foreground'
                        }`}>
                            <span className={`h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 ${
                                active ? 'bg-primary-foreground/20'
                                : past  ? 'bg-success/20'
                                :         'bg-muted-foreground/20'
                            }`}>
                                {past
                                    ? <CheckCircle2 className="h-2.5 w-2.5 text-success" />
                                    : <span className="text-[8px] font-bold">{i + 1}</span>
                                }
                            </span>
                            {s.label}
                        </div>
                        {i < FUNNEL_STEPS.length - 1 && (
                            <div className="h-px w-3 bg-border shrink-0" />
                        )}
                    </Fragment>
                )
            })}
        </div>
    )
}

// ─── Extract Review Panel (tabs: SIF Fields · Quote · Floor Plan) ───────────

interface ExtractQuoteLine { code: string; name: string; qty: string; sif: string; net: string; corrected: boolean }

// SIF arrives with LIST extended prices (catalog · pre-CoNY-discount). The 37.5% discount is applied in CORE later (Fase D).
// List = sale / 0.625 · so $8,100 sale ext → $12,960 list ext
const EXTRACT_QUOTE_LINES: ExtractQuoteLine[] = [
    { code: 'HMI-FU-300',  name: 'Lateral Filing Unit 3-Drawer', qty: '×6',  sif: '$12,960',  net: '$12,960',  corrected: false },
    { code: 'HMI-WS-2400', name: 'Locale Open-Plan Workstation', qty: '×24', sif: '$230,400', net: '$230,400', corrected: false },
    { code: 'HMI-LS-500',  name: 'Brody WorkLounge',             qty: '×12', sif: '$134,400', net: '$134,400', corrected: false },
]

const EXTRACT_ZONES = [
    { id: 'A', label: 'Open Area',   qty: '', chip: 'bg-info/10 text-info border-info/20',          dot: 'bg-info'    },
    { id: 'B', label: 'Lounge',      qty: '', chip: 'bg-ai/10 text-ai border-ai/20',                dot: 'bg-ai'      },
    { id: 'C', label: 'Storage Room', qty: '', chip: 'bg-success/10 text-success border-success/20', dot: 'bg-success' },
]

function ExtractReviewPanel({ onValidate, onResolveChange, onCustomValue }: { onValidate?: () => void; onResolveChange?: (ids: Set<string>) => void; onCustomValue?: (fieldId: string, value: string) => void }) {
    const [tab, setTab] = useState<'sif' | 'quote' | 'floorplan'>('sif')
    const [quoteLines] = useState<ExtractQuoteLine[]>(EXTRACT_QUOTE_LINES)

    const TABS = [
        { id: 'sif'       as const, label: 'SIF'          },
        { id: 'quote'     as const, label: 'Product List' },
        { id: 'floorplan' as const, label: 'Floor Plan'   },
    ]

    const SIF_GROUPS_DISPLAY = [
        { label: 'Document Header',    fields: FIELDS_EXTRACT.filter(f => f.category === 'header')    },
        { label: 'Labor (from SIF)',   fields: FIELDS_EXTRACT.filter(f => f.category === 'labor')     },
        { label: 'Items',              fields: FIELDS_EXTRACT.filter(f => f.category === 'items')     },
        { label: 'Pricing & Delivery', fields: FIELDS_EXTRACT.filter(f => f.category === 'logistics') },
    ].filter(g => g.fields.length > 0)

    return (
        <div className="flex flex-col h-full bg-card min-h-0">
            {/* Tab bar */}
            <div className="flex gap-1 px-4 py-2.5 border-b border-border bg-background shrink-0">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                            tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'sif' && (
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
                    {SIF_GROUPS_DISPLAY.map(group => (
                        <div key={group.label}>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{group.label}</p>
                            <div className="rounded-xl border border-border overflow-hidden">
                                {group.fields.map((field, i) => (
                                    <div key={field.id} className={`flex items-center justify-between px-3 py-2 text-[11px] ${
                                        i > 0 ? 'border-t border-border/40' : ''
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                                            <span className="text-muted-foreground">{field.name}</span>
                                        </div>
                                        <span className="font-mono font-semibold text-foreground">{field.extractedValue}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI] }]} />
                </div>
            )}

            {tab === 'quote' && (
                <div className="flex flex-col h-full min-h-0">
                    <div className="bg-background px-5 py-3 border-b border-border shrink-0">
                        <h4 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">PRODUCT LIST (FROM SIF)</h4>
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5">Q-2026-0089 · Pending Quote Tool validation</p>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                        {/* Column headers */}
                        <div className="grid grid-cols-4 gap-2 px-1">
                            {['Product', 'Qty', 'List Ext', 'Net (OmniQ)'].map(h => (
                                <span key={h} className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide">{h}</span>
                            ))}
                        </div>
                        {/* Read-only line items */}
                        {quoteLines.map((line) => (
                            <div key={line.code} className={`rounded-xl border p-3 ${
                                line.corrected ? 'border-success/30 bg-success/5' : 'border-border bg-card'
                            }`}>
                                <div className="grid grid-cols-4 gap-2 items-center">
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-mono text-muted-foreground truncate">{line.code}</p>
                                        <p className="text-[10px] font-semibold text-foreground leading-tight truncate">{line.name}</p>
                                    </div>
                                    <span className="text-[10px] font-mono text-muted-foreground">{line.qty}</span>
                                    <span className={`text-[10px] font-mono ${line.corrected ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>{line.sif}</span>
                                    <span className={`text-[10px] font-mono font-semibold ${line.corrected ? 'text-success' : 'text-foreground'}`}>{line.net}</span>
                                </div>
                                {line.corrected && (
                                    <p className="text-[9px] text-success mt-1.5">↓ Corrected from {line.sif} per CoNY T-code 18%</p>
                                )}
                            </div>
                        ))}
                        {/* Totals — raw from SIF, pending Quote Tool validation */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            {[
                                { label: 'List Total · pre-CoNY-discount', value: '$377,760', bold: true  },
                                { label: 'Line items',                     value: '3 lines',  muted: true },
                            ].map(row => (
                                <div key={row.label} className={`flex items-center justify-between px-4 py-2 border-b border-border/50 last:border-0 text-[11px] ${row.bold ? 'bg-muted/20' : ''}`}>
                                    <span className="text-muted-foreground">{row.label}</span>
                                    <span className={`font-mono font-semibold ${row.muted ? 'text-muted-foreground' : 'text-foreground'}`}>{row.value}</span>
                                </div>
                            ))}
                        </div>
                        <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OVNIQ] }]} />
                    </div>
                </div>
            )}


            {tab === 'floorplan' && (
                <div className="flex flex-col h-full min-h-0">
                    <div className="bg-background px-5 py-3 border-b border-border shrink-0">
                        <h4 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">Floor Plan</h4>
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5">30 Court St · Brooklyn · Floor 12</p>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                        <FloorPlanSVG />
                        <div className="space-y-2">
                            {EXTRACT_ZONES.map(zone => (
                                <div key={zone.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${zone.chip}`}>
                                    <span className={`h-2 w-2 rounded-full shrink-0 ${zone.dot}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-semibold">{zone.label}</p>
                                    </div>
                                    {zone.qty && <span className="text-[10px] font-mono font-bold">{zone.qty}</span>}
                                </div>
                            ))}
                        </div>
                        <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
                    </div>
                </div>
            )}

            {/* Shared footer — always visible */}
            <div className="px-5 py-4 border-t border-border bg-card shrink-0">
                <div className="flex gap-2">
                    <button className="flex-1 py-2.5 text-[12px] font-black border border-border text-foreground rounded-xl hover:bg-muted/50 transition-all uppercase tracking-wide">
                        Save
                    </button>
                    <button
                        onClick={() => onValidate?.()}
                        className="flex-1 py-2.5 text-[12px] font-black rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all uppercase tracking-wide"
                    >
                        Validate Extraction
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Field Review Panel ──────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<string, { label: string; chip: string }> = {
    header:    { label: 'Document Header',    chip: 'bg-muted text-muted-foreground border-border'          },
    labor:     { label: 'Labor (from SIF)',   chip: 'bg-info/10 text-info border-info/20'                   },
    items:     { label: 'Products',           chip: 'bg-ai/10 text-ai border-ai/20'                         },
    logistics: { label: 'Pricing & Delivery', chip: 'bg-success/10 text-success border-success/20'          },
    fee:       { label: 'Agency Fee',         chip: 'bg-warning/10 text-warning border-warning/20'          },
}

function BFIFieldReview({ step, scenario, onValidate, onResolveChange, onCustomValue }: {
    step: BFIReviewStep
    scenario?: 'match' | 'gap'
    onValidate?: () => void
    onResolveChange?: (ids: Set<string>) => void
    onCustomValue?: (fieldId: string, value: string) => void
}) {
    const [fields]            = useState<ReviewField[]>(() => getFields(step, scenario))
    const [resolved, setResolved] = useState<Set<string>>(new Set())
    const [expanded, setExpanded] = useState<string | null>(() => {
        const first = getFields(step, scenario).find(f => f.status !== 'valid')
        return first?.id ?? null
    })
    const [editValues, setEditValues] = useState<Record<string, string>>({})
    const [manualEditId, setManualEditId] = useState<string | null>(null)
    const [keptSifIds, setKeptSifIds] = useState<Set<string>>(new Set())

    const issueFields    = fields.filter(f => f.status !== 'valid')
    const totalIssues    = issueFields.length
    const resolvedCount  = resolved.size
    const allResolved    = resolvedCount >= totalIssues

    const handleAcceptOVNIQ = (id: string) => {
        setResolved(prev => {
            const next = new Set([...prev, id])
            onResolveChange?.(next)
            return next
        })
        setExpanded(null)
    }

    const handleEditResolved = (id: string) => {
        setResolved(prev => { const n = new Set(prev); n.delete(id); return n })
        setExpanded(id)
    }

    const handleAutoResolve = () => {
        const remaining = issueFields.filter(f => !resolved.has(f.id))
        remaining.forEach((f, i) => {
            setTimeout(() => setResolved(prev => {
                const next = new Set([...prev, f.id])
                onResolveChange?.(next)
                return next
            }), i * 150)
        })
    }

    const resolveLabel = step === 'fee' ? 'APPLY CORRECTION' : 'APPLY QUOTE TOOL'
    const actionLabel  = step === 'cpr' ? 'Accept CPR'    :
                         step === 'fee' ? 'Confirm value'  : 'Accept Quote Tool'
    const altLabel     = step === 'cpr' ? 'Edit'           :
                         step === 'fee' ? 'Flag gap'       : 'Keep SIF'

    const PANEL_TITLE: Partial<Record<BFIReviewStep, string>> = {
        extract:     'SIF EXTRACTION',
        labor:       'PO & LABOR REVIEW',
        'val-sif':   'SIF VALIDATION',
        'val-ovniq': 'QUOTE TOOL VALIDATION',
    }
    const PANEL_SUBTITLE: Partial<Record<BFIReviewStep, string>> = {
        extract:     'DOE-2847 · Validate extracted SIF fields',
        labor:       'DOE-2847 · Validate PO & labor figures vs Quote Tool',
        'val-sif':   'DOE-2847 · SIF field validation',
        'val-ovniq': 'DOE-2847 · Quote Tool vs CoNY contract',
    }
    const VALIDATE_LABEL: Partial<Record<BFIReviewStep, string>> = {
        extract: 'Validate Extraction →',
        labor:   'Confirm & Continue →',
    }

    return (
        <div className="flex flex-col h-full bg-card min-h-0">
            {/* Panel header */}
            <div className="bg-background px-5 py-3.5 border-b border-border shrink-0">
                <h4 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">
                    {PANEL_TITLE[step] ?? 'FIELD REVIEW'}
                </h4>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                    {PANEL_SUBTITLE[step] ?? 'DOE-2847 · Validate fields'}
                </p>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-5 pt-4 pb-2">
                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden relative">
                            <div className="h-full bg-zinc-200 dark:bg-zinc-700 rounded-full" style={{ width: '100%' }} />
                            <div
                                className="h-full bg-success rounded-full absolute top-0 left-0 transition-all duration-700"
                                style={{ width: `${totalIssues > 0 ? (resolvedCount / totalIssues) * 100 : 100}%` }}
                            />
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap shrink-0">
                            {resolvedCount}/{totalIssues} resolved
                        </span>
                    </div>

                    {/* Status dots + auto-resolve */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-success" />
                                <span className="text-xs font-bold text-foreground">{fields.filter(f => f.status === 'valid').length}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-warning" />
                                <span className="text-xs font-bold text-foreground">{fields.filter(f => f.status === 'inconsistent').length}</span>
                            </div>
                            {fields.some(f => f.status === 'missing') && (
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-destructive" />
                                    <span className="text-xs font-bold text-foreground">{fields.filter(f => f.status === 'missing').length}</span>
                                </div>
                            )}
                        </div>
                        {totalIssues > 0 && (
                            <button
                                onClick={handleAutoResolve}
                                className="flex items-center gap-1.5 text-[10px] font-black text-foreground hover:opacity-70 transition-all uppercase tracking-wider"
                            >
                                <Zap className="h-3 w-3 fill-current" /> {resolveLabel}
                            </button>
                        )}
                    </div>
                </div>

                {/* Field list — grouped by category */}
                <div className="px-5 py-3 pb-6 space-y-4">
                    {(() => {
                        const seenCategories = new Set<string>()
                        return fields.map(field => {
                        const showHeader = !seenCategories.has(field.category)
                        if (showHeader) seenCategories.add(field.category)
                        const catStyle = CATEGORY_STYLE[field.category] ?? CATEGORY_STYLE.header

                        const isExpanded  = expanded === field.id
                        const isResolved  = resolved.has(field.id)
                        const isIssue     = field.status !== 'valid'
                        const canEdit = field.status === 'valid' || isResolved

                        return (
                            <div key={field.id}>
                            {showHeader && (
                                <div className="flex items-center gap-2 mb-2.5">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest ${catStyle.chip}`}>
                                        {catStyle.label}
                                    </span>
                                    <div className="flex-1 h-px bg-border/60" />
                                </div>
                            )}
                            <div className={`border rounded-xl transition-all ${
                                isExpanded && field.status === 'valid' ? 'border-primary/30 bg-primary/5 shadow-sm'
                                : isExpanded  ? 'border-warning/40 dark:border-warning/30 bg-card shadow-sm'
                                : isResolved  ? 'border-success/20 dark:border-success/20 bg-success/5'
                                :               'border-border'
                            }`}>
                                {/* Row header */}
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <div className="relative shrink-0">
                                        <span className={`h-2 w-2 rounded-full block ${
                                            isResolved ? 'bg-success' :
                                            field.status === 'inconsistent' ? 'bg-warning' :
                                            field.status === 'missing' ? 'bg-destructive' : 'bg-success'
                                        }`} />
                                        {isExpanded && isIssue && <div className="absolute inset-0 h-2 w-2 rounded-full bg-warning animate-ping opacity-40" />}
                                    </div>

                                    {/* Name + value — clickable only for issue fields */}
                                    <button
                                        onClick={() => isIssue && !isResolved ? setExpanded(isExpanded ? null : field.id) : undefined}
                                        className={`flex-1 min-w-0 text-left ${isIssue && !isResolved ? 'cursor-pointer' : 'cursor-default'}`}
                                    >
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${catStyle.chip}`}>
                                                {catStyle.label}
                                            </span>
                                            <span className="text-[12px] font-bold text-foreground truncate">{field.name}</span>
                                            {field.status === 'inconsistent' && !isResolved && (
                                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-warning text-white uppercase tracking-tighter shrink-0">Quote Tool</span>
                                            )}
                                            {isResolved && (
                                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-success text-white uppercase tracking-tighter shrink-0">RESOLVED</span>
                                            )}
                                        </div>
                                        <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                                            {isResolved && field.ovniqSuggestion && !keptSifIds.has(field.id) ? field.ovniqSuggestion : field.extractedValue || 'empty'}
                                            {field.ovniqSuggestion && !isResolved && (
                                                <span className="ml-1 text-warning font-semibold">→ {field.ovniqSuggestion}</span>
                                            )}
                                        </div>
                                    </button>

                                    {/* Edit icon for valid/resolved fields */}
                                    {canEdit && (
                                        <button
                                            onClick={() => isResolved
                                                ? handleEditResolved(field.id)
                                                : setExpanded(isExpanded ? null : field.id)
                                            }
                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
                                            aria-label="Edit field"
                                        >
                                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <Edit className="h-3.5 w-3.5" />}
                                        </button>
                                    )}

                                    {/* Chevron for issue fields */}
                                    {isIssue && !isResolved && (
                                        <div className="text-muted-foreground shrink-0 pointer-events-none">
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    )}
                                </div>

                                {/* Expanded: valid field — simple edit view */}
                                {isExpanded && field.status === 'valid' && (
                                    <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="space-y-1.5">
                                            <p className="text-[12px] font-semibold text-foreground">Current Value</p>
                                            <input
                                                type="text"
                                                value={editValues[field.id] ?? field.extractedValue ?? ''}
                                                onChange={e => setEditValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                className="w-full rounded-lg border border-primary px-3 py-2 bg-card ring-2 ring-primary/20 text-[13px] font-mono text-foreground focus:outline-none"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={() => setExpanded(null)}
                                                className="flex-1 py-2 text-[12px] font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setExpanded(null)}
                                                className="py-2 px-4 text-[12px] font-bold border border-border text-foreground bg-card rounded-lg hover:bg-muted/50 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Expanded: issue field — Quote Tool review */}
                                {isExpanded && isIssue && !isResolved && (
                                    <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[12px] font-semibold text-foreground">Extracted Value (SIF)</p>
                                                <button
                                                    onClick={() => setManualEditId(prev => prev === field.id ? null : field.id)}
                                                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                                                        manualEditId === field.id
                                                            ? 'bg-primary text-primary-foreground border-primary'
                                                            : 'text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
                                                    }`}
                                                >
                                                    <Edit2 className="h-2.5 w-2.5" />
                                                    Enter manually
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={editValues[field.id] ?? field.extractedValue ?? ''}
                                                onChange={e => setEditValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                readOnly={manualEditId !== field.id}
                                                autoFocus={manualEditId === field.id}
                                                className={`w-full rounded-lg border px-3 py-2 text-[13px] font-mono text-foreground focus:outline-none transition-all ${
                                                    manualEditId === field.id
                                                        ? 'border-primary bg-card ring-2 ring-primary/20 cursor-text'
                                                        : 'border-border bg-background cursor-default'
                                                }`}
                                            />
                                            {manualEditId === field.id && (
                                                <p className="text-[10px] text-muted-foreground animate-in fade-in duration-200">
                                                    Type your custom value above, then click Save.
                                                </p>
                                            )}
                                        </div>

                                        {field.ovniqSuggestion && manualEditId !== field.id && (
                                            <div className="space-y-1.5">
                                                <p className="text-[12px] font-semibold text-foreground">Quote Tool suggests</p>
                                                <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2">
                                                    <span className="text-[13px] font-mono font-bold text-warning">{field.ovniqSuggestion}</span>
                                                </div>
                                            </div>
                                        )}

                                        {field.reason && manualEditId !== field.id && (
                                            <div className="flex items-start gap-2 p-3 bg-ai/5 border border-ai/20 rounded-lg">
                                                <Info className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                                                <p className="text-[11px] text-ai leading-relaxed">{field.reason}</p>
                                            </div>
                                        )}

                                        {manualEditId === field.id ? (
                                            <div className="flex items-center gap-2 pt-1">
                                                <button
                                                    onClick={() => {
                                                        const val = editValues[field.id] ?? field.extractedValue
                                                        onCustomValue?.(field.id, val)
                                                        handleAcceptOVNIQ(field.id)
                                                        setManualEditId(null)
                                                    }}
                                                    className="flex-1 py-2 text-[12px] font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
                                                >
                                                    Save custom value
                                                </button>
                                                <button
                                                    onClick={() => setManualEditId(null)}
                                                    className="py-2 px-4 text-[12px] font-bold border border-border text-foreground bg-card rounded-lg hover:bg-muted/50 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 pt-1">
                                                <button
                                                    onClick={() => handleAcceptOVNIQ(field.id)}
                                                    className="flex-1 py-2 text-[12px] font-bold bg-success text-white rounded-lg hover:opacity-90 transition-all"
                                                >
                                                    {actionLabel}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (step === 'cpr') {
                                                            setManualEditId(field.id)
                                                        } else if (step !== 'fee') {
                                                            const val = field.extractedValue ?? ''
                                                            onCustomValue?.(field.id, val)
                                                            setKeptSifIds(prev => new Set([...prev, field.id]))
                                                            handleAcceptOVNIQ(field.id)
                                                        } else {
                                                            setExpanded(null)
                                                        }
                                                    }}
                                                    className="flex-1 py-2 text-[12px] font-bold border border-border text-foreground bg-card rounded-lg hover:bg-muted/50 transition-all flex items-center justify-center gap-1.5"
                                                >
                                                    <Edit className="h-3.5 w-3.5" /> {altLabel}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            </div>
                        )
                    })
                    })()}
                </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border bg-card shrink-0">
                <div className="flex gap-2">
                    <button className="flex-1 py-2.5 text-[11px] font-black border border-border text-foreground rounded-xl hover:bg-muted/50 transition-all uppercase tracking-widest">
                        SAVE
                    </button>
                    <button
                        onClick={() => allResolved && onValidate?.()}
                        disabled={!allResolved}
                        className={`flex-1 py-2.5 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest ${
                            allResolved
                                ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm'
                                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                        }`}
                    >
                        {allResolved
                            ? (VALIDATE_LABEL[step] ?? 'VALIDATE')
                            : 'Resolve all fields to continue'
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function BFIDocumentReviewModal({
    isOpen, onClose, step, onValidate, scenario, michaelMode, invoiceUpload
}: BFIDocumentReviewModalProps) {
    // F30.d · leftOffset dinámico · respeta sidebar del demo cuando expandido.
    // Fuera de tour o sidebar colapsado el modal cubre todo el viewport.
    // Antes 'left-80' hardcoded dejaba 320px de gap sin cubrir. Pattern
    // idéntico al F30.b BFIProcessKanban + F29 Officeworks. Diego 2026-07-23.
    const { isSidebarCollapsed, isDemoActive } = useDemo()
    const leftOffset = isDemoActive && !isSidebarCollapsed ? 'left-80' : 'left-0'

    const [activeTab, setActiveTab] = useState<'sif' | 'specs' | 'floorplan'>(step === 'quote' ? 'specs' : 'sif')
    const [downloadConfirm, setDownloadConfirm] = useState<string | null>(null)
    // quote/fee/labor + cpr(michaelMode/invoiceUpload): start with f1+f2 resolved (already reconciled)
    // cpr regular (paso 1.9): start empty so approvals drive the SIF doc live
    const [resolvedIds, setResolvedIds] = useState<Set<string>>(() =>
        ['quote', 'fee', 'labor'].includes(step) || (step === 'cpr' && (michaelMode || invoiceUpload))
            ? new Set(['f1', 'f2'])
            : new Set()
    )
    const [customValues, setCustomValues] = useState<Record<string, string>>(
        step === 'labor' ? { f1: '45h', f2: '6h' } : {}
    )
    // Quote Tool lines — shared between left doc and right review panel
    const [ovniqLines, setOvniqLines] = useState<OvniqLine[]>(INITIAL_OVNIQ_LINES)
    const [acceptedRows, setAcceptedRows] = useState<Set<number>>(() =>
        step === 'labor' ? new Set([0]) : new Set()
    )
    const updateOvniqLine = (i: number, field: keyof OvniqLine, val: string) => {
        setOvniqLines(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: val }; return n })
    }

    const handleDownload = () => {
        const filename = activeTab === 'sif' ? 'DOE-2847.sif' : 'NYC-DOE-2847-specs.pdf'
        setDownloadConfirm(filename)
        setTimeout(() => setDownloadConfirm(null), 2000)
    }

    const STEP_LABELS: Record<BFIReviewStep, string> = {
        extract:     'Extracting fields',
        quote:       'Quote Tool Validation',
        'val-sif':   'Validating SIF',
        'val-ovniq': 'Validating Quote Tool',
        labor:       'PO & Labor Review',
        cpr:         'CPR Reconciliation',
        fee:         'Agency Fee Verification',
    }

    const subtitle = (step === 'labor' || step === 'cpr' || step === 'fee')
        ? `NYC Dept. of Education · Purchase Order DOE-2847 · ${STEP_LABELS[step]}`
        : `NYC Dept. of Education · Quote Q-2026-0089 · ${STEP_LABELS[step]}`

    const aiBanner = step === 'quote'
        ? <><span className="font-bold">Quote Tool</span> · 1 price correction · CMF Free line item · $9,255.24 Day-1 GP captured in CORE</>
        : step === 'cpr'
            ? <><span className="font-bold">CPR</span> · 2 lines adjusted · Impact −$720 · ready to approve</>
            : step === 'fee'
                ? scenario === 'gap'
                    ? <><span className="font-bold">Agency fee</span> · gap detected · {FEE_GAP}</>
                    : <><span className="font-bold">Agency fee</span> · verified · matches contract</>
                : step === 'labor'
                    ? <><span className="font-bold">Strata AI</span> · PO received · confirm receipt</>
                    : <><span className="font-bold">Strata AI</span> · SIF ingested · ready for intake review</>

    const leftPane = step === 'labor' ? (
        <div className="flex flex-col h-full bg-zinc-100 dark:bg-zinc-950">
            {/* Header with title + download */}
            <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border bg-muted/30 shrink-0">
                <div className="flex items-center gap-1.5">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] font-semibold text-foreground">DOE-2847 · Purchase Order</span>
                </div>
                {downloadConfirm ? (
                    <span className="flex items-center gap-1 text-[10px] text-success font-semibold px-2">
                        <CheckCircle2 className="h-3 w-3" />
                        {downloadConfirm} downloaded
                    </span>
                ) : (
                    <a
                        href="/docs/bfi/po/customer-po-example.pdf"
                        download
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted/50"
                    >
                        <Download className="h-3 w-3" />
                        Download PO
                    </a>
                )}
            </div>
            {/* Info banner · sticky · Wendy disclaimer */}
            <div className="px-4 py-2 bg-info/5 border-b border-info/20 flex items-start gap-2 shrink-0">
                <Info className="h-3.5 w-3.5 text-info shrink-0 mt-0.5" />
                <p className="text-[10px] text-foreground leading-snug">
                    <span className="font-bold text-info">Reference example</span>
                    {' · NYC DOE PO format · not actual DOE-2847 data'}
                </p>
            </div>
            <div className="flex-1 min-h-0">
                <iframe
                    src="/docs/bfi/po/customer-po-example.pdf#toolbar=0&navpanes=0&view=FitH"
                    className="w-full h-full border-0"
                    title="DOE-2847 Purchase Order (reference example)"
                />
            </div>
        </div>
    ) : (
        <>
            {/* Tab bar */}
            <div className="flex items-center gap-0 border-b border-border bg-muted/30 shrink-0 px-4 pt-2">
                {([
                    { id: 'sif' as const,       icon: FileText, label: 'SIF · DOE-2847' },
                    { id: 'specs' as const,     icon: FileText, label: (step === 'cpr' || step === 'fee') ? 'DOE-2847 · Purchase Order' : 'Quote' },
                    { id: 'floorplan' as const,  icon: MapPin,   label: 'Floor Plan' },
                ]).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold border-b-2 transition-all mr-1 ${
                            activeTab === tab.id
                                ? 'border-primary text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <tab.icon className="h-3 w-3" />
                        {tab.label}
                    </button>
                ))}
                {(activeTab === 'sif' || activeTab === 'specs') && (
                    <div className="ml-auto pb-1.5 shrink-0">
                        {downloadConfirm ? (
                            <span className="flex items-center gap-1 text-[10px] text-success font-semibold px-2">
                                <CheckCircle2 className="h-3 w-3" />
                                {downloadConfirm} downloaded
                            </span>
                        ) : (
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted/50"
                            >
                                <Download className="h-3 w-3" />
                                {activeTab === 'sif' ? 'Download SIF' : (step === 'cpr' || step === 'fee') ? 'Download PO' : 'Download Quote'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Tab content */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {activeTab === 'sif' ? (
                    <SIFDocumentPreview resolvedIds={resolvedIds} step={step} customValues={customValues} />
                ) : activeTab === 'specs' ? (
                    <QuoteDocumentTab ovniqLines={ovniqLines} isPO={step === 'cpr' || step === 'fee'} validated={step !== 'extract'} />
                ) : (
                    <div className="h-full overflow-y-auto p-4 bg-zinc-100 dark:bg-zinc-950">
                        <div className="border border-border rounded-xl overflow-hidden bg-card">
                            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-muted/40 border-b border-border">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                                    Architectural Layout · 52 Chambers St · Floor 12
                                </span>
                                <span className="ml-auto text-[9px] text-success font-medium">OCR ✓</span>
                            </div>
                            <div className="p-3">
                                <FloorPlanSVG />
                            </div>
                            <div className="px-3.5 py-2 bg-muted/20 border-t border-border">
                                <p className="text-[10px] text-muted-foreground">
                                    NYC Dept. of Education · DOE-2847 · by Account Manager Bly · Miller Knoll
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )

    return (
        <SplitPaneReviewModal
            open={isOpen}
            onClose={onClose}
            sidebarOffsetClass={leftOffset}
            title="Document Review — DOE-2847"
            subtitle={subtitle}
            headerCenter={<FunnelStepper step={step} />}
            aiBanner={aiBanner}
            leftPane={leftPane}
            rightPane={
                <RightPanel
                    step={step}
                    scenario={scenario}
                    onValidate={onValidate}
                    michaelMode={michaelMode}
                    invoiceUpload={invoiceUpload}
                    onResolveChange={setResolvedIds}
                    onCustomValue={(fid, val) => setCustomValues(prev => ({ ...prev, [fid]: val }))}
                    ovniqLines={ovniqLines}
                    onUpdateLine={updateOvniqLine}
                    acceptedRows={acceptedRows}
                    onSetAccepted={setAcceptedRows}
                />
            }
        />
    )
}
