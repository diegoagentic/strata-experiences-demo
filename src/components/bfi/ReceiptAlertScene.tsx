/**
 * COMPONENT: ReceiptAlertScene
 * PURPOSE: Flow 2 · Scene 4 — 100% receipt alert auto-generated when DOH-0671
 *          hits full received% in CORE. Lauren acknowledges and proceeds.
 *
 * DS TOKENS: bg-card · bg-success/5 · text-success · border-border
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface ReceiptAlertSceneProps {
    onAcknowledge?: () => void
}

type SceneState = 'monitoring' | 'alert'

export default function ReceiptAlertScene({ onAcknowledge }: ReceiptAlertSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [sceneState, setSceneState] = useState<SceneState>('monitoring')
    const [acknowledged, setAcknowledged] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setSceneState('alert'), 1500)
        return () => clearTimeout(t)
    }, [])

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleAcknowledge = () => {
        setAcknowledged(true)
        setTimeout(pauseAware(() => {
            onAcknowledge?.()
            nextStep()
        }), 700)
    }

    if (sceneState === 'monitoring') {
        return (
            <div className="space-y-4">
                <div className="border border-border rounded-xl p-4 bg-card space-y-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Receiving Monitor · Active Orders</div>
                    {[
                        { id: 'DOH-0671', label: 'NYC Dept. of Health',     pct: 99, status: 'updating', active: true },
                        { id: 'DCAS-1182', label: 'NYC DCAS',               pct: 72, status: null,       active: false },
                        { id: 'NYPD-0394', label: 'NYC Police Dept.',       pct: 100, status: null,      active: false },
                        { id: 'DOE-2847',  label: 'NYC Dept. of Education', pct: 45, status: null,       active: false },
                    ].map(order => (
                        <div key={order.id} className={`border rounded-lg px-3 py-2.5 space-y-1.5 ${order.active ? 'border-ai/40 bg-ai/5' : 'border-border'}`}>
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <span className="text-[11px] font-bold text-foreground">{order.id}</span>
                                    <span className="text-[10px] text-muted-foreground ml-1.5">{order.label}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-[11px] font-bold tabular-nums ${order.pct === 100 ? 'text-success' : 'text-foreground'}`}>{order.pct}%</span>
                                    {order.active && <Loader2 className="h-3 w-3 text-ai animate-spin" />}
                                </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1">
                                <div
                                    className={`h-1 rounded-full transition-all duration-1000 ${order.pct === 100 ? 'bg-success' : 'bg-ai'}`}
                                    style={{ width: `${order.pct}%` }}
                                />
                            </div>
                            {order.active && (
                                <div className="text-[10px] text-ai font-medium animate-pulse">99% received · updating...</div>
                            )}
                        </div>
                    ))}
                </div>
                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
            </div>
        )
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Alert card */}
            <div className="bg-success/5 border border-success/30 rounded-xl p-4 flex items-start gap-3">
                <div className="relative shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-success animate-pulse" />
                </div>
                <div className="flex-1">
                    <div className="text-sm font-bold text-foreground">100% received · DOH-0671</div>
                    <div className="text-xs text-muted-foreground mt-0.5">NYC Dept. of Health · 36 cartons confirmed at WIG · May 6, 2026</div>
                    <div className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        Strata detected full receipt in CORE. Storage window: <span className="font-medium text-amber-600 dark:text-amber-400">8 days remaining</span>. Work order can now be generated.
                    </div>
                </div>
            </div>

            {/* Storage urgency */}
            <div className="border border-amber-200 dark:border-amber-500/30 rounded-xl p-3 flex items-center gap-2.5 bg-amber-50 dark:bg-amber-500/5">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="text-xs">
                    <div className="font-bold text-foreground">Storage alert · 22 of 30 days used</div>
                    <div className="text-muted-foreground mt-0.5">8 days remaining before billable storage — urgent work order coordination required</div>
                </div>
            </div>

            {/* Before Strata contrast */}
            <div className="bg-muted/60 border border-border rounded-xl p-3 space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Before Strata</div>
                <div className="text-xs text-foreground leading-relaxed">
                    Lauren checked CORE manually every morning for each active WIG order — no automatic alert.
                    She also fielded Walter's status calls while chasing receiving confirmations.{' '}
                    <span className="font-medium">4 orders × daily manual check = ~20 min/day with zero value-add.</span>
                </div>
            </div>

            {/* What happens next */}
            <div className="border border-border rounded-xl p-3.5 bg-card space-y-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Next steps unlocked</div>
                <div className="space-y-1.5">
                    {[
                        'Generate work order with NYC signature requirement',
                        'Notify Walter (CoNY PM) before paper arrives',
                        'Monitor storage countdown — coordinate installation',
                    ].map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <ArrowRight className="h-3 w-3 text-ai shrink-0" />
                            {step}
                        </div>
                    ))}
                </div>
            </div>

            {/* Stakeholder Visibility */}
            <div className="border border-border rounded-xl p-3.5 bg-card space-y-2.5">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Who knows about DOH-0671 right now</div>
                {[
                    { name: 'Lauren',  status: '● Informed',  time: 'May 6 · 8:06 AM', note: 'this alert',                       dot: 'bg-success' },
                    { name: 'Lena',    status: '● Confirmed', time: 'May 6 · 9:02 AM', note: 'CORE entry',                        dot: 'bg-success' },
                    { name: 'Walter',  status: '○ Pending',   time: '',                 note: 'notified when work order generated', dot: 'bg-muted-foreground' },
                    { name: 'Michael', status: '○ Not yet',   time: '',                 note: 'notified after CPR reconciliation', dot: 'bg-muted-foreground' },
                ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-[11px]">
                        <span className="w-14 text-muted-foreground shrink-0">{s.name}</span>
                        <span className={`font-medium shrink-0 ${s.time ? 'text-success' : 'text-muted-foreground'}`}>{s.status}</span>
                        {s.time && <span className="text-muted-foreground tabular-nums shrink-0">{s.time}</span>}
                        <span className="text-muted-foreground text-[10px] truncate">— {s.note}</span>
                    </div>
                ))}
            </div>

            {/* Action */}
            {!acknowledged ? (
                <div className="flex justify-end">
                    <button
                        onClick={handleAcknowledge}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Acknowledge · proceed to work order
                    </button>
                </div>
            ) : (
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-center gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <div className="text-xs font-bold text-foreground">Alert acknowledged · generating work order</div>
                </div>
            )}

            <DataSourcesBar groups={[
                { sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] },
            ]} />
        </div>
    )
}
