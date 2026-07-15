/**
 * COMPONENT: OrderTrackerScene
 * PURPOSE: Flow 1 · Scene 5 — Unified order tracker (CORE + Quote Tool + R Drive).
 *          Brief scene — shows consolidated status, Lauren confirms.
 *
 * DS TOKENS: bg-card · bg-success/5 · text-success · border-border
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, CheckCircle2, Clock, Package, FileCheck } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface OrderTrackerSceneProps {
    onConfirm?: () => void
}

const TRACKER_ROWS = [
    { system: 'CORE',       status: 'PO received · order entered', icon: 'check',   date: 'May 2, 2026'  },
    { system: 'Quote Tool', status: 'EDI acknowledged · order confirmed', icon: 'check',   date: 'May 2, 2026'  },
    { system: 'R Drive',    status: 'Tracking sheet updated · delivery May 14', icon: 'check',   date: 'May 3, 2026'  },
    { system: 'WIG',        status: 'Order in transit · receiving not started', icon: 'clock',   date: 'Pending'      },
]

export default function OrderTrackerScene({ onConfirm }: OrderTrackerSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [revealedRows, setRevealedRows] = useState(0)
    const [checking, setChecking] = useState(false)
    const [reminderSet, setReminderSet] = useState(false)
    const [confirmed, setConfirmed] = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleCheck = () => {
        setChecking(true)
        TRACKER_ROWS.forEach((_, i) => {
            setTimeout(pauseAware(() => setRevealedRows(i + 1)), 400 * (i + 1))
        })
    }

    const handleSetReminder = () => {
        setReminderSet(true)
    }

    const handleConfirm = () => {
        setConfirmed(true)
        setTimeout(pauseAware(() => {
            onConfirm?.()
            nextStep()
        }), 700)
    }

    const allRevealed = revealedRows >= TRACKER_ROWS.length
    const wigPending = allRevealed && TRACKER_ROWS[3].icon === 'clock'

    return (
        <div className="space-y-4">
            {/* Context banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Order Tracker · DOE-2847</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Strata consolidated CORE, Quote Tool, and the R Drive tracking sheet into a single live view.
                    </div>
                </div>
            </div>

            {/* Order header */}
            <div className="border border-border rounded-xl p-3.5 bg-card">
                <div className="flex items-start gap-3">
                    <Package className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <div className="text-xs font-bold text-foreground">DOE-2847 · NYC Dept. of Education</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">PO 18082-27619 · Delivery May 14, 2026 · $236,100</div>
                    </div>
                    <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg px-2 py-0.5">
                        Receiving pending
                    </div>
                </div>
            </div>

            {/* Check button — shown before reveal starts */}
            {!checking && (
                <div className="flex justify-end">
                    <button
                        onClick={handleCheck}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Check status across systems
                    </button>
                </div>
            )}

            {/* System status rows — revealed sequentially */}
            {revealedRows > 0 && (
                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                    {TRACKER_ROWS.slice(0, revealedRows).map((row) => (
                        <div key={row.system} className="flex items-center gap-3 px-3.5 py-3 bg-card animate-in fade-in slide-in-from-top-1 duration-300">
                            <div className="shrink-0">
                                {row.icon === 'check'
                                    ? <CheckCircle2 className="h-4 w-4 text-success" />
                                    : <Clock className="h-4 w-4 text-amber-500" />
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-foreground">{row.system}</div>
                                <div className="text-[11px] text-muted-foreground">{row.status}</div>
                            </div>
                            <div className="text-[11px] text-muted-foreground tabular-nums shrink-0">{row.date}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* WIG pending note + reminder CTA */}
            {wigPending && !reminderSet && (
                <div className="flex items-center justify-between gap-3 border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 rounded-xl px-3.5 py-2.5 animate-in fade-in duration-300">
                    <div className="text-[11px] text-foreground">
                        <span className="font-bold">WIG in transit</span> · Lauren sets a reminder for receiving confirmation
                    </div>
                    <button
                        onClick={handleSetReminder}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all shrink-0"
                    >
                        Set reminder
                    </button>
                </div>
            )}

            {reminderSet && (
                <div className="text-[11px] text-success font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Reminder set · DOH-0671 receiving confirmation
                </div>
            )}

            {/* Confirm CTA — appears after all revealed */}
            {allRevealed && !confirmed ? (
                <div className="flex justify-end">
                    <button
                        onClick={handleConfirm}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                    >
                        <FileCheck className="h-3.5 w-3.5" />
                        Confirm order status
                    </button>
                </div>
            ) : confirmed ? (
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-center gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <div className="text-xs font-bold text-foreground">Order status confirmed · DOE-2847 on track</div>
                </div>
            ) : null}

            <DataSourcesBar groups={[
                { sources: [SOURCES.CORE_PO, SOURCES.CORE_AR] },
            ]} />
        </div>
    )
}
