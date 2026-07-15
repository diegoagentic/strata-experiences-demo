/**
 * COMPONENT: BFIDashboardScene
 * PURPOSE: Operations dashboard — live view of CoNY shipments, alerts, and Walter's feed.
 *
 * Props:
 *   staticMode       — true: no notification timer (used when accessed via navbar tab)
 *   notificationConfig — overrides default notification text (used by WIGBingoCheckScene)
 *   onNavigate       — called when notification or primary alert CTA is clicked
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { AlertTriangle, Package, Clock, DollarSign, ChevronRight, Bell, CheckCircle2, Sparkles } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface NotificationConfig {
    title: string
    desc: string
    cta: string
}

interface BFIDashboardSceneProps {
    onNavigate?: () => void
    staticMode?: boolean
    notificationConfig?: NotificationConfig
}

const DEFAULT_NOTIF: NotificationConfig = {
    title: 'New PMO received',
    desc: 'PMO-2026-0412 · 35 cartons · WIG New Jersey',
    cta: 'Start receiving →',
}

const STAT_CARDS = [
    { icon: Package,       label: 'Active Shipments',      value: '14',      color: 'text-foreground' },
    { icon: AlertTriangle, label: 'Missing Carton Alerts', value: '3',       color: 'text-destructive' },
    { icon: Clock,         label: 'Orders Near 30-Day',    value: '5',       color: 'text-warning' },
    { icon: DollarSign,    label: 'Agency Fee (MTD)',       value: '$48,200', color: 'text-success' },
]

const ALERTS = [
    {
        type: 'missing-carton',
        severity: 'destructive',
        title: 'Missing Carton · PMO-2026-0412',
        desc: 'Carton #34 not received at WIG NJ — packing list mismatch detected by AI',
        cta: 'Start Receiving →',
        primary: true,
    },
    {
        type: 'storage',
        severity: 'warning',
        title: 'Storage Warning · DOE-2847',
        desc: '27 days in WIG storage — nearing 30-day limit. Delivery scheduling needed.',
        cta: 'View order',
        primary: false,
    },
    {
        type: 'cpr',
        severity: 'warning',
        title: 'CPR Mismatch · DOE-2847',
        desc: 'Carpenters −5h · OT −2h · City of NY does not pay until CPR is corrected',
        cta: 'Review CPR',
        primary: false,
    },
]

const SHIPMENTS = [
    { pmo: 'PMO-2026-0412', client: 'City of NY · DOE',  cartons: '34/35', location: 'WIG NJ', status: 'Alert',          statusClass: 'text-destructive bg-destructive/10 border-destructive/30' },
    { pmo: 'PMO-2026-0408', client: 'City of NY · DOE',  cartons: '22/22', location: 'WIG NJ', status: '100% Received',   statusClass: 'text-success bg-success/10 border-success/30' },
    { pmo: 'PMO-2026-0401', client: 'City of NY · DCAS', cartons: '18/18', location: 'WIG NJ', status: 'Invoiceable',     statusClass: 'text-ai bg-ai/10 border-ai/20' },
    { pmo: 'PMO-2026-0395', client: 'City of NY · NYPD', cartons: '31/31', location: 'WIG NJ', status: 'Closed',          statusClass: 'text-muted-foreground bg-muted border-border' },
]

const WALTER_EVENTS = [
    { time: '9:04 AM', actor: 'Strata', action: 'Notification sent to Walter (CoNY PM)', tag: 'push notification' },
    { time: '9:06 AM', actor: 'Walter', action: 'Notification received · DOH-0671 ready', tag: 'confirmed' },
    { time: '9:45 AM', actor: 'Walter', action: 'Crew scheduling confirmed · May 14–16',  tag: 'loop closed' },
]

export default function BFIDashboardScene({
    onNavigate,
    staticMode = false,
    notificationConfig,
}: BFIDashboardSceneProps) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [showNotif, setShowNotif] = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const notif = notificationConfig ?? DEFAULT_NOTIF

    useEffect(() => {
        if (staticMode) return
        const id = setTimeout(pauseAware(() => setShowNotif(true)), 2000)
        return () => clearTimeout(id)
    }, [staticMode, pauseAware])

    return (
        <div className="space-y-5">
            {/* Notification slide-in (interactive mode only) */}
            {showNotif && (
                <button
                    onClick={() => onNavigate?.()}
                    className="w-full animate-in slide-in-from-top duration-500 flex items-start gap-2.5 bg-card border border-ai/40 rounded-xl px-3 py-3 text-left shadow-md group"
                >
                    <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-ai uppercase tracking-wide mb-0.5">{notif.title}</p>
                        <p className="text-xs font-semibold text-foreground leading-snug">{notif.desc}</p>
                        <p className="text-[11px] font-semibold text-ai mt-1.5 group-hover:underline">{notif.cta}</p>
                    </div>
                </button>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {STAT_CARDS.map(s => (
                    <div key={s.label} className="border border-border rounded-xl bg-card px-3.5 py-3 space-y-1">
                        <div className="flex items-center gap-1.5">
                            <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground font-medium">{s.label}</span>
                        </div>
                        <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Active alerts */}
            <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Active Alerts</p>
                {ALERTS.map(a => (
                    <div
                        key={a.type}
                        className={`border rounded-xl px-3.5 py-3 space-y-2 ${
                            a.severity === 'destructive'
                                ? 'border-destructive/30 bg-destructive/5'
                                : 'border-warning/30 bg-warning/5'
                        }`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
                                    a.severity === 'destructive' ? 'text-destructive' : 'text-warning'
                                }`} />
                                <div>
                                    <div className="text-xs font-bold text-foreground">{a.title}</div>
                                    <div className="text-[11px] text-muted-foreground mt-0.5">{a.desc}</div>
                                </div>
                            </div>
                            {/* Primary CTA: navigates in interactive mode, static in staticMode */}
                            {a.primary && !staticMode ? (
                                <button
                                    onClick={() => onNavigate?.()}
                                    className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-destructive hover:underline whitespace-nowrap"
                                >
                                    {a.cta} <ChevronRight className="h-3 w-3" />
                                </button>
                            ) : (
                                <span className="shrink-0 text-[11px] text-muted-foreground whitespace-nowrap">{a.cta}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Two-col: Recent shipments + Walter's view */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent shipments */}
                <div className="border border-border rounded-xl overflow-hidden bg-card">
                    <div className="px-3.5 py-2 border-b border-border bg-muted/40">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Recent Shipments</span>
                    </div>
                    <div className="divide-y divide-border">
                        {SHIPMENTS.map(s => (
                            <div key={s.pmo} className="flex items-center gap-3 px-3.5 py-2.5">
                                <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-semibold text-foreground truncate">{s.pmo}</div>
                                    <div className="text-[10px] text-muted-foreground">{s.client} · {s.cartons} · {s.location}</div>
                                </div>
                                <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${s.statusClass}`}>
                                    {s.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Walter's Live View */}
                <div className="border border-border rounded-xl overflow-hidden bg-card">
                    <div className="px-3.5 py-2 border-b border-border bg-muted/40 flex items-center gap-2">
                        <Bell className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Walter's Live View · CoNY PM</span>
                    </div>
                    <div className="p-3.5 space-y-2.5">
                        {WALTER_EVENTS.map((ev, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-[11px] font-medium text-foreground">{ev.actor}</span>
                                        <span className="text-[10px] text-muted-foreground">· {ev.action}</span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">{ev.time} · {ev.tag}</div>
                                </div>
                            </div>
                        ))}
                        <div className="text-[10px] text-muted-foreground border-t border-border pt-2">
                            Before Strata: Walter found out when the paper work order arrived — 1–2 days later
                        </div>
                    </div>
                </div>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
