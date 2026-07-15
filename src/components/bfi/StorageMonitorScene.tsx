/**
 * COMPONENT: StorageMonitorScene
 * PURPOSE: Flow 2 · Scene 7 — 30-day storage countdown per WIG order.
 *          Alerts at day 20. Lauren sets alerts for approaching orders.
 *
 * DS TOKENS: bg-card · bg-amber-50 · border-border · text-success
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, CheckCircle2, AlertTriangle, Clock, CalendarDays } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface StorageMonitorSceneProps {
    onConfirm?: () => void
}

const ORDERS = [
    { id: 'DOH-0671',  agency: 'NYC Dept. of Health',    daysIn: 22, total: 30, remaining: 8,  dispatched: true,  expiresLabel: 'May 15', june30Risk: false },
    { id: 'DCAS-1182', agency: 'NYC DCAS',                daysIn: 18, total: 30, remaining: 12, dispatched: false, expiresLabel: 'May 19', june30Risk: false },
    { id: 'NYPD-0394', agency: 'NYPD Precinct 40',       daysIn: 8,  total: 30, remaining: 22, dispatched: false, expiresLabel: 'May 29', june30Risk: false },
    { id: 'DOE-2847',  agency: 'NYC Dept. of Education',  daysIn: 3,  total: 30, remaining: 27, dispatched: false, expiresLabel: 'Jun 3',  june30Risk: true  },
]

export default function StorageMonitorScene({ onConfirm }: StorageMonitorSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [confirmed, setConfirmed] = useState(false)
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
    const [alertSet, setAlertSet] = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleConfirm = () => {
        setConfirmed(true)
        setTimeout(pauseAware(() => {
            onConfirm?.()
            nextStep()
        }), 700)
    }

    return (
        <div className="space-y-4">
            {/* Peak season banner */}
            <div className="bg-warning/5 border border-warning/30 rounded-xl p-3 flex items-start gap-2.5">
                <CalendarDays className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Peak Season · Mar – Jul 2026</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        WIG storage fees accelerate in peak season. Orders expiring after June 1 carry elevated billing risk — prioritize dispatch before June 30.
                    </div>
                </div>
            </div>

            {/* Context banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">30-Day Storage Monitor · WIG</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Strata tracks storage days for all CoNY orders at WIG — alerting at day 20 before billable charges begin.
                    </div>
                </div>
            </div>

            {/* Order storage cards */}
            <div className="space-y-2">
                {ORDERS.map((order) => {
                    const isUrgent = order.remaining <= 10
                    const isWarning = order.remaining <= 15 && !isUrgent
                    const pct = Math.round((order.daysIn / order.total) * 100)

                    const isExpanded = expandedOrder === order.id
                    const isDOE = order.id === 'DOE-2847'

                    return (
                        <div
                            key={order.id}
                            className={`border rounded-xl p-3.5 transition-colors ${
                                isUrgent
                                    ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5'
                                    : isDOE
                                    ? 'border-warning/40 bg-warning/5 cursor-pointer hover:bg-warning/10'
                                    : 'border-border bg-card'
                            } ${isDOE ? 'cursor-pointer' : ''}`}
                            onClick={isDOE ? () => setExpandedOrder(isExpanded ? null : order.id) : undefined}
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                    <span className="text-xs font-bold text-foreground">{order.id}</span>
                                    <span className="text-[11px] text-muted-foreground ml-1.5">· {order.agency}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {order.dispatched && (
                                        <span className="text-[10px] font-medium text-success bg-success/10 border border-success/20 rounded px-1.5 py-0.5">Dispatched</span>
                                    )}
                                    {isUrgent && !order.dispatched && (
                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                    )}
                                    {!isUrgent && !order.dispatched && (
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-1.5 bg-border rounded-full overflow-hidden mb-1.5">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                        isUrgent ? 'bg-amber-500' : isWarning ? 'bg-amber-400' : 'bg-success'
                                    }`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-muted-foreground">{order.daysIn} of {order.total} days used</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">expires {order.expiresLabel}</span>
                                    <span className={`font-medium ${isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                                        {order.remaining} days left
                                    </span>
                                </div>
                            </div>

                            {/* June 30 peak season risk */}
                            {order.june30Risk && (
                                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 border border-warning/20 rounded px-1.5 py-1">
                                    <CalendarDays className="h-2.5 w-2.5 shrink-0" />
                                    Expires during peak season · elevated storage fees if delayed past Jun 30
                                </div>
                            )}

                            {/* Expanded detail for DOE-2847 */}
                            {isDOE && isExpanded && (
                                <div className="mt-3 pt-3 border-t border-border space-y-2 animate-in fade-in duration-200">
                                    <div className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                                        <AlertTriangle className="h-3 w-3 text-warning shrink-0" />
                                        Approaching peak season window
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        Order expires Jun 3 — during Mar–Jul peak. WIG fees accelerate if delayed past Jun 30.
                                    </div>
                                    {!alertSet ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setAlertSet(true) }}
                                            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all"
                                        >
                                            Set priority alert for DOE-2847 →
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-[11px] text-success font-medium animate-in fade-in duration-200">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Alert set ✓ · Strata monitoring · alert at day 20 · Lauren notified
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Summary */}
            <div className="text-[11px] text-muted-foreground text-center">
                4 orders monitored · 1 dispatched · 1 approaching day-20 threshold
            </div>

            {/* Action */}
            {!confirmed ? (
                <div className="flex justify-end">
                    <button
                        onClick={handleConfirm}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Set alerts · confirm monitor active
                    </button>
                </div>
            ) : (
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-center gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <div className="text-xs font-bold text-foreground">Storage monitor active · alerts set for all 4 orders</div>
                </div>
            )}

            <DataSourcesBar groups={[
                { sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] },
            ]} />
        </div>
    )
}
