/**
 * COMPONENT: FreightTariffPanel
 * PURPOSE: Q10 #2 priority (7.7/10 avg, BD + PC teams: 10/10) — auto-checks
 *          CORE orders for missing freight + tariff lines. CORE does not pull
 *          these lines automatically (gap evaluated in Phase 1), so today MBI
 *          checks every order manually. Strata flags missing lines before submit.
 *
 *          Mock data: 5 open orders, 2 with missing freight, 1 with missing tariff.
 *
 * STATES per row:
 *   - clean — green check, both freight + tariff present
 *   - missing — amber warning, "Add line" button
 *
 * DS TOKENS: bg-card · border-border · success/amber accents
 *
 * USED BY: MBIAccountingPage (Phase 3.B section)
 */

import { useState } from 'react'
import { Truck, AlertTriangle, CheckCircle2, Plus, Sparkles } from 'lucide-react'

interface OpenOrder {
    id: string
    vendor: string
    amount: number
    hasFreight: boolean
    hasTariff: boolean
    freightSuggested?: number
    tariffSuggested?: number
}

const MOCK_ORDERS: OpenOrder[] = [
    { id: 'PO-2026-0067', vendor: 'Allsteel', amount: 41400, hasFreight: true, hasTariff: true },
    { id: 'PO-2026-0068', vendor: 'HON', amount: 17850, hasFreight: false, hasTariff: true, freightSuggested: 1785 },
    { id: 'PO-2026-0069', vendor: 'CaseWorks', amount: 38250, hasFreight: false, hasTariff: false, freightSuggested: 3825, tariffSuggested: 765 },
    { id: 'PO-2026-0070', vendor: 'Pinnacle', amount: 16800, hasFreight: true, hasTariff: false, tariffSuggested: 336 },
    { id: 'PO-2026-0071', vendor: 'Apex Workspace', amount: 12900, hasFreight: true, hasTariff: true },
]

export default function FreightTariffPanel() {
    const [resolved, setResolved] = useState<Record<string, boolean>>({})
    const flagged = MOCK_ORDERS.filter(o => (!o.hasFreight || !o.hasTariff))
    const cleanCount = MOCK_ORDERS.length - flagged.length
    const remainingFlagged = flagged.filter(o => !resolved[o.id]).length

    return (
        <div className="space-y-3">
            {/* Summary header */}
            <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                        <Truck className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Freight & Tariff auto-check</div>
                        <div className="text-[10px] text-muted-foreground">
                            Flags missing freight + tariff lines before CORE order submission · Q10 priority #2 (7.7/10 avg)
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold tabular-nums">
                        <span className="text-success">{cleanCount}</span>
                        <span className="text-muted-foreground"> clean · </span>
                        <span className={remainingFlagged > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-success'}>{remainingFlagged}</span>
                        <span className="text-muted-foreground"> flagged</span>
                    </div>
                </div>
            </div>

            {/* Orders list */}
            <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-2 border-b border-border grid grid-cols-[1fr_0.6fr_0.7fr_0.7fr_0.6fr] gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <div>Order · Vendor</div>
                    <div className="text-right">Amount</div>
                    <div className="text-center">Freight</div>
                    <div className="text-center">Tariff</div>
                    <div className="text-right">Action</div>
                </div>
                <div className="divide-y divide-border">
                    {MOCK_ORDERS.map(order => {
                        const flagged = !order.hasFreight || !order.hasTariff
                        const isResolved = resolved[order.id]
                        const status = isResolved || !flagged ? 'clean' : 'flagged'
                        return (
                            <div key={order.id} className="px-4 py-2.5 grid grid-cols-[1fr_0.6fr_0.7fr_0.7fr_0.6fr] gap-3 items-center text-xs">
                                <div className="min-w-0">
                                    <div className="font-mono text-foreground text-[11px] truncate">{order.id}</div>
                                    <div className="text-[10px] text-muted-foreground truncate">{order.vendor}</div>
                                </div>
                                <div className="text-right font-bold text-foreground tabular-nums">
                                    ${order.amount.toLocaleString()}
                                </div>
                                <div className="text-center">
                                    <FlagPill present={order.hasFreight || isResolved} suggestedValue={order.freightSuggested} />
                                </div>
                                <div className="text-center">
                                    <FlagPill present={order.hasTariff || isResolved} suggestedValue={order.tariffSuggested} />
                                </div>
                                <div className="text-right">
                                    {status === 'clean' ? (
                                        <span className="text-[10px] font-bold text-success uppercase tracking-wider inline-flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            OK
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => setResolved(prev => ({ ...prev, [order.id]: true }))}
                                            className="text-[10px] font-bold text-primary-foreground bg-primary px-2 py-1 rounded inline-flex items-center gap-1 hover:opacity-90 transition-opacity"
                                        >
                                            <Plus className="h-3 w-3" />
                                            Add lines
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* AI hint */}
            {remainingFlagged > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-ai/5 border border-ai/10 rounded-xl p-3">
                    <Sparkles className="h-4 w-4 text-ai shrink-0" />
                    <span>
                        Strata suggests freight (10% of net) and tariff (2% for HNI brands) based on contract rules. One click adds both lines and re-submits.
                    </span>
                </div>
            )}
        </div>
    )
}

// ─── Flag pill ───────────────────────────────────────────────────────────────
function FlagPill({ present, suggestedValue }: { present: boolean; suggestedValue?: number }) {
    if (present) {
        return (
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-success/10 text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
        )
    }
    return (
        <span title={suggestedValue ? `Suggested: $${suggestedValue.toLocaleString()}` : 'Missing'}
            className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400"
        >
            <AlertTriangle className="h-3.5 w-3.5" />
        </span>
    )
}
