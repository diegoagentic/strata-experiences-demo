/**
 * COMPONENT: QuoteProposalReviewScene
 * PURPOSE: Flow 2 · Scene 3 — Proposal Review before proposal creation.
 *          PC reviews the CORE Quote line item breakdown, can edit any
 *          financial field for unlocked vendors, then advances to create
 *          the proposal.
 *
 * USED BY: MBIQuotesPage (wizard scene 3)
 */

import { useState } from 'react'
import {
    ChevronDown, Check, Pencil, Sparkles,
    CheckCircle2, FileText, X, Lock,
} from 'lucide-react'

interface VendorItem {
    vendor: string
    description: string
    lines: number
    list: number
    sell: number
    cost: number
    gp: number
    gpPct: number
    tax: number
    gross: number
    avgDisc: number
    contract: string | null
    locked: boolean
}

const VENDOR_FINANCIALS: VendorItem[] = [
    {
        vendor: 'HNI', description: 'Workstations + storage', lines: 4,
        list: 277500, sell: 218400, cost: 134000, gp: 84400, gpPct: 38.6,
        tax: 0, gross: 218400, avgDisc: 21.3, contract: 'HNI Corporate 55%',
        locked: true,
    },
    {
        vendor: 'Allsteel', description: 'Seating', lines: 2,
        list: 160333, sell: 96200, cost: 72150, gp: 24050, gpPct: 25.0,
        tax: 0, gross: 96200, avgDisc: 40.0, contract: null,
        locked: false,
    },
    {
        vendor: 'BluDot', description: 'Lounge + side tables', lines: 1,
        list: 57538, sell: 34900, cost: 26175, gp: 8725, gpPct: 25.0,
        tax: 0, gross: 34900, avgDisc: 39.4, contract: null,
        locked: false,
    },
]

const VENDOR_TOTAL = {
    lines: 7, list: 495371, sell: 349500, cost: 232325,
    gp: 117175, gpPct: 33.5, tax: 0, gross: 349500, avgDisc: 29.5,
}

interface FieldEdit {
    editing: boolean
    list: string
    sell: string
    cost: string
    gp: string
    gpPct: string
    tax: string
    gross: string
    avgDisc: string
}

type EditMap = Record<string, FieldEdit>

function toEdit(v: VendorItem): FieldEdit {
    return {
        editing: true,
        list: String(v.list),
        sell: String(v.sell),
        cost: String(v.cost),
        gp: String(v.gp),
        gpPct: String(v.gpPct),
        tax: String(v.tax),
        gross: String(v.gross),
        avgDisc: String(v.avgDisc),
    }
}

export default function QuoteProposalReviewScene() {
    const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({})
    const [editMap, setEditMap] = useState<EditMap>({})

    const toggleExpand = (vendor: string) =>
        setExpandedMap(prev => ({ ...prev, [vendor]: !prev[vendor] }))

    const startEdit = (vendor: string, v: VendorItem) => {
        setExpandedMap(prev => ({ ...prev, [vendor]: true }))
        setEditMap(prev => ({ ...prev, [vendor]: toEdit(v) }))
    }

    const saveEdit = (vendor: string) =>
        setEditMap(prev => ({ ...prev, [vendor]: { ...prev[vendor], editing: false } }))

    const cancelEdit = (vendor: string, v: VendorItem) =>
        setEditMap(prev => {
            const next = { ...prev }
            delete next[vendor]
            return next
        })

    const setField = (vendor: string, field: keyof Omit<FieldEdit, 'editing'>, value: string) =>
        setEditMap(prev => ({ ...prev, [vendor]: { ...prev[vendor], [field]: value } }))

    const displayVal = (vendor: string, field: keyof Omit<FieldEdit, 'editing'>, fallback: number): string => {
        const e = editMap[vendor]
        if (e && !e.editing) return e[field]
        return String(fallback)
    }

    return (
        <div className="space-y-4">

            {/* Banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">CORE Quote ready · proposal review</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Quote QUOT-2026-003 is ready. Review the line item detail below — click <strong className="text-foreground">Edit</strong> on any unlocked vendor to adjust values — then click <strong className="text-foreground">Create proposal</strong>.
                    </div>
                </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-3">
                {([
                    { label: 'Quote ID',   value: 'QUOT-2026-003', mono: true,  highlight: false },
                    { label: 'Total',      value: '$372,500',       mono: false, highlight: true  },
                    { label: 'Avg GP%',    value: '33.5%',          mono: false, highlight: true  },
                    { label: 'Line items', value: '7 · 3 vendors',  mono: false, highlight: false },
                ] as const).map(s => (
                    <div key={s.label} className="bg-card dark:bg-zinc-800 border border-border rounded-xl p-3">
                        <div className="text-[10px] text-muted-foreground">{s.label}</div>
                        <div className={`text-sm font-bold mt-0.5 ${s.highlight ? 'text-success' : 'text-foreground'} ${s.mono ? 'font-mono text-xs' : ''}`}>
                            {s.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Vendor table */}
            <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <div className="text-xs font-bold text-foreground">Line items · Quote QUOT-2026-003</div>
                    <div className="text-[10px] text-muted-foreground">
                        Expand each vendor to see the full breakdown · click Edit on unlocked vendors to adjust any field
                    </div>
                </div>

                <div className="divide-y divide-border">
                    {VENDOR_FINANCIALS.map(v => {
                        const edit = editMap[v.vendor]
                        const isExpanded = expandedMap[v.vendor] ?? false
                        const isEditing = edit?.editing === true
                        const gpPctDisplay = edit ? edit.gpPct : String(v.gpPct)
                        const sellDisplay = edit ? edit.sell : String(v.sell)

                        return (
                            <div key={v.vendor}>
                                {/* Header row */}
                                <div className={`px-3 py-2.5 flex items-center gap-3 text-xs ${isEditing ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                                    <button
                                        onClick={() => !isEditing && toggleExpand(v.vendor)}
                                        className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-70 transition-opacity"
                                    >
                                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-foreground">{v.vendor}</div>
                                            <div className="text-[10px] text-muted-foreground">{v.description} · {v.lines} lines</div>
                                            {v.contract && (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-success/10 text-success mt-0.5">
                                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                                    {v.contract}
                                                </span>
                                            )}
                                        </div>
                                    </button>

                                    {/* Right side: GP + sell + action */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className={`text-sm font-bold tabular-nums ${v.locked ? 'text-success' : 'text-foreground'}`}>
                                            {gpPctDisplay}% GP
                                        </div>
                                        <div className="font-bold text-foreground tabular-nums w-20 text-right">
                                            ${Number(sellDisplay).toLocaleString()}
                                        </div>
                                        {v.locked ? (
                                            <Lock className="h-3.5 w-3.5 text-success/60 shrink-0" />
                                        ) : isEditing ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => saveEdit(v.vendor)}
                                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-primary text-zinc-900 rounded-lg hover:opacity-90"
                                                >
                                                    <Check className="h-3 w-3" /> Save
                                                </button>
                                                <button
                                                    onClick={() => cancelEdit(v.vendor, v)}
                                                    className="p-1 text-muted-foreground hover:text-foreground"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => startEdit(v.vendor, v)}
                                                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                                title="Edit fields"
                                            >
                                                <Pencil className="h-3 w-3" />
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded: read-only or editable breakdown */}
                                {isExpanded && (
                                    <div className="px-3 pb-3 animate-in fade-in slide-in-from-top-1 duration-150">
                                        <div className="rounded-xl overflow-hidden border border-border">
                                            {/* Column headers */}
                                            <div className="grid grid-cols-[1.2rem_1fr_1fr_1fr_1fr_2.5rem_2rem_1fr_3.2rem] gap-x-2 px-3 py-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/20">
                                                <span>#</span><span>List $</span><span>Sell $</span><span>Cost $</span>
                                                <span>GP $</span><span>GP%</span><span>Tax</span><span>Gross $</span><span>Avg Disc%</span>
                                            </div>
                                            {/* Data row */}
                                            {isEditing ? (
                                                <div className="grid grid-cols-[1.2rem_1fr_1fr_1fr_1fr_2.5rem_2rem_1fr_3.2rem] gap-x-2 px-3 py-2 text-[10px] bg-primary/5 dark:bg-primary/10 items-center">
                                                    <span className="text-muted-foreground">{v.lines}</span>
                                                    {(['list','sell','cost','gp','gpPct','tax','gross','avgDisc'] as const).map(field => (
                                                        <input
                                                            key={field}
                                                            type="number"
                                                            value={edit[field]}
                                                            onChange={e => setField(v.vendor, field, e.target.value)}
                                                            className="w-full text-[10px] font-semibold text-foreground bg-background border border-primary/50 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary tabular-nums"
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-[1.2rem_1fr_1fr_1fr_1fr_2.5rem_2rem_1fr_3.2rem] gap-x-2 px-3 py-2 text-[10px] tabular-nums bg-card dark:bg-zinc-800">
                                                    <span className="text-muted-foreground">{v.lines}</span>
                                                    <span className="text-muted-foreground">${Number(displayVal(v.vendor,'list',v.list)).toLocaleString()}</span>
                                                    <span className="font-semibold text-foreground">${Number(displayVal(v.vendor,'sell',v.sell)).toLocaleString()}</span>
                                                    <span className="text-muted-foreground">${Number(displayVal(v.vendor,'cost',v.cost)).toLocaleString()}</span>
                                                    <span className="text-success font-semibold">${Number(displayVal(v.vendor,'gp',v.gp)).toLocaleString()}</span>
                                                    <span className="text-success font-semibold">{displayVal(v.vendor,'gpPct',v.gpPct)}%</span>
                                                    <span className="text-muted-foreground">{Number(displayVal(v.vendor,'tax',v.tax)).toFixed(2)}</span>
                                                    <span className="text-foreground">${Number(displayVal(v.vendor,'gross',v.gross)).toLocaleString()}</span>
                                                    <span className="text-muted-foreground">{Number(displayVal(v.vendor,'avgDisc',v.avgDisc)).toFixed(2)}%</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {/* Totals row */}
                    <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 px-3 py-2.5 bg-muted/20 text-xs font-bold border-t-2 border-border">
                        <span className="text-muted-foreground">{VENDOR_TOTAL.lines} lines</span>
                        <span className="text-foreground">{VENDOR_TOTAL.gpPct}% avg GP · ${VENDOR_TOTAL.cost.toLocaleString()} cost</span>
                        <span className="text-foreground tabular-nums">${VENDOR_TOTAL.sell.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Forward cue */}
            <div className="flex items-center gap-3 text-xs bg-muted/30 border border-border rounded-xl p-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                    Line items confirmed · click <strong className="text-foreground">Create proposal</strong> to generate the client proposal.
                </span>
            </div>
        </div>
    )
}
