/**
 * COMPONENT: ReceivingCloseScene
 * PURPOSE: Flow 2 · Scene 8 — Order marked invoiceable in CORE.
 *          Bridges to Agency Fee flow — CPR and fee verification now unblocked.
 *          Brief scene: Lauren confirms, demo closes naturally.
 *
 * DS TOKENS: bg-card · bg-success/5 · text-success · border-border
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { CheckCircle2, ArrowRight, Unlock } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface ReceivingCloseSceneProps {
    onClose?: () => void
}

export default function ReceivingCloseScene({ onClose }: ReceivingCloseSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [closed, setClosed] = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleClose = () => {
        setClosed(true)
        setTimeout(pauseAware(() => {
            onClose?.()
            nextStep()
        }), 800)
    }

    return (
        <div className="space-y-4">
            {/* Status summary */}
            <div className="bg-success/5 border border-success/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <div className="text-xs font-bold text-foreground">Receiving complete · DOH-0671 invoiceable</div>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-[11px] pl-6">
                    {[
                        ['100% received', 'May 6, 2026'],
                        ['Work order dispatched', 'May 6, 2026'],
                        ['Walter notified', '3 min ago'],
                        ['CORE status', 'Invoiceable'],
                    ].map(([label, value]) => (
                        <div key={label}>
                            <span className="text-muted-foreground">{label}: </span>
                            <span className="font-medium text-foreground">{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Agency Fee UNBLOCKED card — always visible as the "unlock" visual */}
            <div className="border border-ai/30 bg-ai/5 rounded-xl p-3.5 space-y-2.5 animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                    <Unlock className="h-4 w-4 text-ai shrink-0" />
                    <div className="text-xs font-bold text-foreground">Agency Fee flow · UNBLOCKED by receiving close</div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground pl-6">
                    <ArrowRight className="h-3 w-3 text-ai shrink-0" />
                    DOH-0671 receiving complete → CPR gate → agency fee calculation
                </div>
                <div className="pl-6 text-[11px] text-ai font-medium">
                    Lauren can now run agency fee verification for DOH-0671
                </div>
            </div>

            {/* Bridge to Agency Fee */}
            <div className="border border-border rounded-xl p-3.5 bg-card">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2.5">Next steps unlocked</div>
                <div className="space-y-2">
                    {[
                        'CPR reconciliation — certified hours vs quoted labor',
                        'Agency fee verification — T-code calculation vs MK invoice',
                        'Finance / AR close — Patricia confirms and closes CORE',
                    ].map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <ArrowRight className="h-3 w-3 text-ai shrink-0" />
                            {step}
                        </div>
                    ))}
                </div>
            </div>

            {/* Before Strata contrast */}
            <div className="bg-muted/60 border border-border rounded-xl p-3 space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Before Strata</div>
                <div className="text-xs text-foreground leading-relaxed">
                    Lauren manually updated CORE status, emailed Patricia to notify the close, and waited 1–2 days before Agency Fee calculation could begin.{' '}
                    <span className="font-medium">The handoff was invisible — Patricia never knew when to start.</span>
                </div>
            </div>

            {/* Action */}
            {!closed ? (
                <div className="flex justify-end">
                    <button
                        onClick={handleClose}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Close receiving &amp; open agency fee
                    </button>
                </div>
            ) : (
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">Receiving flow complete · DOH-0671</div>
                        <div className="text-muted-foreground mt-0.5">Agency fee flow unblocked — CPR and fee verification ready to run</div>
                    </div>
                </div>
            )}

            <DataSourcesBar groups={[
                { sources: [SOURCES.CORE_RPA, SOURCES.STRATA_AI] },
            ]} />
        </div>
    )
}
