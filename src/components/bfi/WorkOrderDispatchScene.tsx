/**
 * COMPONENT: WorkOrderDispatchScene
 * PURPOSE: Flow 2 · Scene 2 — CoNY PM notification + work order confirmation.
 *          "Confirmar despacho" is the final semantic action. After confirmation,
 *          the demo closes naturally — no "End of demo" overlay.
 *
 * DS TOKENS: bg-card · bg-success/5 · border-success/30 · text-success
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { CheckCircle2, Package, AlertTriangle, Printer } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

export default function WorkOrderDispatchScene() {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [confirmed, setConfirmed] = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleConfirm = () => {
        setConfirmed(true)
        setTimeout(pauseAware(() => nextStep()), 800)
    }

    return (
        <div className="space-y-4">
            {/* Notification sent — auto-shown */}
            <div className="bg-success/5 border border-success/30 rounded-xl p-3.5 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <div className="text-xs">
                    <div className="font-bold text-foreground">CoNY Project Manager notified</div>
                    <div className="text-muted-foreground mt-1 leading-relaxed italic">
                        "DOH-0671 — NYC Dept. of Health — 100% received in WIG. Delivery available starting today. Remaining window: 8 storage days. Installation coordination can begin."
                    </div>
                    <div className="text-muted-foreground mt-1 text-[10px]">Sent 2 minutes ago · via Microsoft Graph</div>
                </div>
            </div>

            {/* Work order card */}
            <div className="border border-border rounded-xl p-3.5 space-y-3 bg-card">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <div className="text-xs font-bold text-foreground">Work Order DOH-0671</div>
                        <div className="text-[11px] text-muted-foreground">NYC Dept. of Health · 14 West 31st Street, NY 10001</div>
                    </div>
                    <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                        <div className="text-muted-foreground">Items</div>
                        <div className="font-medium text-foreground mt-0.5">Lounge Seating ×12 · Workstations ×24</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">Status</div>
                        <div className="flex items-center gap-1 font-medium text-success mt-0.5">
                            <CheckCircle2 className="h-3 w-3" />
                            100% received · 22 days in WIG
                        </div>
                    </div>
                </div>

                {/* Storage warning */}
                <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    8 storage days remaining — urgent coordination
                </div>

                {/* NYC signature note */}
                <div className="text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5">
                    New York City requires physical ink signature. Print and deliver with installation drawings.
                </div>
            </div>

            {/* Actions */}
            {!confirmed && (
                <div className="flex items-center gap-2 justify-end">
                    <button
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-foreground bg-card border border-border rounded-xl hover:bg-muted transition-colors"
                    >
                        <Printer className="h-3.5 w-3.5" />
                        Print work order
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirm dispatch
                    </button>
                </div>
            )}

            {confirmed && (
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in slide-in-from-bottom-1 duration-400">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">Dispatch confirmed · DOH-0671</div>
                        <div className="text-muted-foreground mt-0.5">
                            CoNY Project Manager has full visibility. Storage: 8 days remaining — no storage charge risk.
                        </div>
                    </div>
                </div>
            )}

            <DataSourcesBar groups={[
                { sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] },
            ]} />
        </div>
    )
}
