/**
 * COMPONENT: CoNYOrderMonitorScene
 * PURPOSE: Flow 2 · Scene 1 — WIG receiving monitor.
 *          3 orders with received%, storage window, FedEx gap alert.
 *          DOH-0671 at 100% has the active "Despachar work order" button.
 *          Clicking it IS the transition to Scene 2 — no separate Next button.
 *
 * DS TOKENS: bg-card · bg-success/5 · bg-amber-50 · border-border
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { Sparkles, CheckCircle2, AlertTriangle, Package, ChevronDown, ChevronUp, Truck, Lock } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface CoNYOrderMonitorSceneProps {
    onDispatch?: () => void
}

const ORDERS = [
    {
        id: 'DOH-0671',
        agency: 'NYC Dept. of Health',
        received: 100,
        daysInWig: 22,
        daysRemaining: 8,
        status: 'ready',
        carrier: 'Freight',
        fedexGap: null,
        agencyFeeBlocked: false,
    },
    {
        id: 'DCAS-1182',
        agency: 'NYC DCAS',
        received: 72,
        daysInWig: 18,
        daysRemaining: 12,
        status: 'in-progress',
        carrier: 'Freight + FedEx',
        fedexGap: {
            trackingNums: ['FX284920', 'FX284921', 'FX284922'],
            detail: 'Strata detected 3 items shipped via FedEx small parcel without WIG confirmation. POD request sent to MK Contact.',
        },
        agencyFeeBlocked: true,
    },
    {
        id: 'NYPD-0394',
        agency: 'NYPD Precinct 40',
        received: 45,
        daysInWig: 8,
        daysRemaining: 22,
        status: 'in-progress',
        carrier: 'Freight',
        fedexGap: null,
        agencyFeeBlocked: false,
    },
]

export default function CoNYOrderMonitorScene({ onDispatch }: CoNYOrderMonitorSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const [fedexExpanded, setFedexExpanded] = useState(false)
    const [dispatched, setDispatched] = useState(false)

    const handleDispatch = () => {
        setDispatched(true)
        setTimeout(pauseAware(() => {
            onDispatch?.()
            nextStep()
        }), 700)
    }

    return (
        <div className="space-y-4">
            {/* Context banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Receiving Monitor · Strata · WIG</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Strata monitors received% in CORE, detects FedEx gaps, and alerts when an order reaches 100% receipt.
                    </div>
                </div>
            </div>

            {/* Orders */}
            <div className="space-y-2">
                {ORDERS.map((order) => (
                    <OrderMonitorCard
                        key={order.id}
                        order={order}
                        fedexExpanded={fedexExpanded && order.id === 'DCAS-1182'}
                        onToggleFedex={() => setFedexExpanded(v => !v)}
                        onDispatch={order.id === 'DOH-0671' ? handleDispatch : undefined}
                        dispatched={dispatched && order.id === 'DOH-0671'}
                    />
                ))}
            </div>

            <DataSourcesBar groups={[
                { sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] },
            ]} />
        </div>
    )
}

function OrderMonitorCard({ order, fedexExpanded, onToggleFedex, onDispatch, dispatched }: {
    order: typeof ORDERS[number]
    fedexExpanded: boolean
    onToggleFedex: () => void
    onDispatch?: () => void
    dispatched: boolean
}) {
    const isReady = order.status === 'ready'
    const isWarning = order.daysRemaining <= 10

    return (
        <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${
            isReady
                ? 'border-success/40 bg-success/5'
                : isWarning && order.fedexGap
                ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5'
                : 'border-border bg-card'
        }`}>
            <div className="p-3.5">
                <div className="flex items-start gap-3">
                    {/* Status icon */}
                    <div className="shrink-0 mt-0.5">
                        {isReady
                            ? <CheckCircle2 className="h-4 w-4 text-success" />
                            : order.fedexGap
                            ? <AlertTriangle className="h-4 w-4 text-amber-500" />
                            : <Package className="h-4 w-4 text-muted-foreground" />
                        }
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-foreground">{order.id}</span>
                                <span className="text-xs text-muted-foreground">· {order.agency}</span>
                                {/* Carrier badge */}
                                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                                    order.carrier === 'Freight + FedEx'
                                        ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
                                        : 'text-muted-foreground bg-muted border-border'
                                }`}>
                                    <Truck className="h-2.5 w-2.5" />
                                    {order.carrier}
                                </span>
                            </div>
                            <span className={`text-xs font-bold tabular-nums shrink-0 ${
                                isReady ? 'text-success' : 'text-foreground'
                            }`}>
                                {order.received}% received
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                    isReady ? 'bg-success' : 'bg-primary dark:bg-brand-400'
                                }`}
                                style={{ width: `${order.received}%` }}
                            />
                        </div>

                        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span>{order.daysInWig} days in WIG</span>
                            <span className={`font-medium ${order.daysRemaining <= 10 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                                {order.daysRemaining} days remaining
                            </span>
                        </div>

                        {/* Mini bingo progress — DOH-0671 only */}
                        {order.id === 'DOH-0671' && (
                            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <span className="text-success font-medium">35/36 Bingo #s confirmed</span>
                                <span>·</span>
                                <span className="text-amber-600 dark:text-amber-400 font-medium">1 FedEx subpath</span>
                            </div>
                        )}

                        {/* FedEx gap alert */}
                        {order.fedexGap && (
                            <button
                                onClick={onToggleFedex}
                                className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                            >
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                FedEx gap detected · 3 items unconfirmed
                                {fedexExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                        )}

                        {fedexExpanded && order.fedexGap && (
                            <div className="mt-2 text-[11px] text-foreground bg-amber-100 dark:bg-amber-500/10 rounded-lg px-2.5 py-2 border border-amber-200 dark:border-amber-500/20 animate-in fade-in slide-in-from-top-1 duration-200 space-y-1">
                                <p className="text-muted-foreground">{order.fedexGap.detail}</p>
                                <p className="font-medium">Tracking: {order.fedexGap.trackingNums.join(' · ')}</p>
                                <p className="text-muted-foreground">Status: tracking — response pending</p>
                            </div>
                        )}

                        {/* Agency Fee blocked cross-process badge */}
                        {order.agencyFeeBlocked && (
                            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-2.5 py-1.5">
                                <Lock className="h-3 w-3 shrink-0" />
                                Agency Fee blocked · receiving gate not met · FedEx gap must resolve first
                            </div>
                        )}

                        {/* Dispatch action — only on DOH-0671 */}
                        {onDispatch && (
                            <div className="mt-3 flex justify-end">
                                {dispatched ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Work order started
                                    </span>
                                ) : (
                                    <button
                                        onClick={onDispatch}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                                    >
                                        <Package className="h-3.5 w-3.5" />
                                        Dispatch work order
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
