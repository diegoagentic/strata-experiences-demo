/**
 * COMPONENT: PMOIntakeScene  (r1.1)
 * PURPOSE: Product Receiving step 1 — Lauren enters PMO details.
 *          Form pre-filled from CORE. CTA advances to WIG Bingo Check.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { ClipboardList, ChevronRight } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import ReceivingProcessBar from './ReceivingProcessBar'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface PMOIntakeSceneProps {
    onSubmit?: () => void
}

const FIELDS = [
    { label: 'PMO Number',     value: '2026-0412',    tag: 'from CORE' },
    { label: 'Receipt Date',   value: '2026-05-11',   tag: 'from CORE' },
    { label: 'Expected Cartons', value: '35',         tag: 'from CORE' },
    { label: 'Shipment Type',  value: 'Large Truck',  tag: 'from CORE' },
    { label: 'WIG Location',   value: 'WIG New Jersey', tag: 'from CORE' },
]

export default function PMOIntakeScene({ onSubmit }: PMOIntakeSceneProps) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = () => {
        setSubmitted(true)
        setTimeout(pauseAware(() => onSubmit?.()), 400)
    }

    return (
        <div className="space-y-4">
            <ReceivingProcessBar stepId="r1.1" />

            {/* Context */}
            <div className="bg-ai/5 border border-ai/20 rounded-xl px-3 py-3 flex items-start gap-2.5">
                <ClipboardList className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">PMO Intake · DOE-2847 · City of NY</div>
                    <div className="text-muted-foreground mt-0.5">
                        Strata pre-filled the intake form from CORE — PMO number, expected carton count, and WIG location are pulled automatically. Lauren reviews and proceeds.
                    </div>
                </div>
            </div>

            {/* Pre-filled form */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="px-3.5 py-2 border-b border-border bg-muted/40">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">PMO Form · Pre-filled from CORE</span>
                </div>
                <div className="divide-y divide-border">
                    {FIELDS.map(f => (
                        <div key={f.label} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                            <span className="text-[11px] text-muted-foreground">{f.label}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-foreground tabular-nums">{f.value}</span>
                                <span className="text-[9px] text-ai bg-ai/10 border border-ai/20 px-1.5 py-0.5 rounded-full font-medium">
                                    {f.tag}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AS-IS contrast */}
            <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Before Strata:</span> Lauren opened CORE, looked up the PMO manually, copied each field into a separate spreadsheet, and emailed WIG to confirm. Intake alone took 15–20 minutes per shipment.
                </p>
            </div>

            <button
                onClick={handleSubmit}
                disabled={submitted}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-all shadow-sm"
            >
                Proceed to WIG Bingo Check
                <ChevronRight className="h-4 w-4" />
            </button>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
