/**
 * COMPONENT: DesignerRFQScene  (a1.0)
 * PURPOSE: Agency Fee step 0 — Robert Chen (Miller Knoll Rep) sends a
 *          Request for Quote to Lauren DeMarco (BFI) for the DOE-2847 project.
 *          Includes SIF, spec sheet, and floor plan attachments.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, FileText, ArrowLeft, Mail } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface DesignerRFQSceneProps {
    onSend?: () => void
}

const ATTACHMENTS = [
    { name: 'DOE-2847-SIF.pdf',          label: 'SIF File'   },
    { name: 'NYC-DOE-2847-specs.pdf',     label: 'Spec Sheet' },
    { name: 'DOE-2847-floorplan.pdf',     label: 'Floor Plan' },
]

export default function DesignerRFQScene({ onSend }: DesignerRFQSceneProps) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const [sent, setSent] = useState(false)

    const handleSend = () => {
        setSent(true)
        setTimeout(pauseAware(() => { onSend?.() }), 900)
    }

    return (
        <div className="flex flex-col h-full bg-background">

            {/* Email client header bar */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card shrink-0">
                <ArrowLeft className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-info/20 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-black text-info">RC</span>
                    </div>
                    <div className="min-w-0">
                        <div className="text-[11px] font-bold text-foreground leading-none truncate">Robert Chen</div>
                        <div className="text-[9px] text-muted-foreground leading-none mt-0.5">Miller Knoll Rep</div>
                    </div>
                </div>
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>

            <div className="flex-1 overflow-y-auto">

                {/* Email metadata */}
                <div className="px-4 pt-4 pb-3 border-b border-border/60 space-y-1.5">
                    <div className="text-[13px] font-bold text-foreground leading-snug">
                        Request for Quote · DOE-2847 · NYC Dept. of Education
                    </div>
                    <div className="space-y-0.5">
                        {[
                            { label: 'From', value: 'robert.chen@millerknoll.com'   },
                            { label: 'To',   value: 'lauren.demarco@bfifurniture.com' },
                            { label: 'Date', value: 'May 5, 2026 · 9:14 AM'         },
                        ].map(r => (
                            <div key={r.label} className="flex items-center gap-2 text-[10px]">
                                <span className="text-muted-foreground w-7 shrink-0">{r.label}:</span>
                                <span className="text-foreground font-medium truncate">{r.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Email body */}
                <div className="px-4 py-4 space-y-3">
                    <div className="text-[12px] text-foreground leading-relaxed space-y-3">
                        <p>Hi Lauren,</p>
                        <p>
                            Please find attached the SIF, product specifications, and floor plan for order{' '}
                            <span className="font-semibold">DOE-2847</span> — a Herman Miller installation for the{' '}
                            <span className="font-semibold">NYC Dept. of Education</span> at 30 Court Street, Brooklyn, NY.
                        </p>
                        <p>
                            Scope includes Filing Units ×6, Aeron seating ×12, and Ethospace workstations ×8.
                            All supporting documents are attached for your review.
                        </p>

                        <p className="text-muted-foreground">
                            — Robert Chen<br />
                            Miller Knoll · NYC Government Accounts
                        </p>
                    </div>

                    {/* PDF attachment chips */}
                    <div className="flex flex-col gap-1.5 mt-2">
                        {ATTACHMENTS.map(a => (
                            <div key={a.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border text-[11px] text-foreground font-medium">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                {a.name}
                                <span className="text-[9px] text-muted-foreground ml-1">· {a.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sent confirmation */}
                {sent && (
                    <div className="mx-4 mb-3 bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                        <Send className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <div className="font-bold text-foreground">SIF sent to Quote Tool · DOE-2847 · May 5 · 9:14 AM</div>
                            <div className="text-muted-foreground mt-0.5">Confirmation sent to HMK Designer · SIF queued for Quote Tool</div>
                        </div>
                    </div>
                )}

                <div className="px-4 pb-4">
                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
                </div>
            </div>

            {/* CTA */}
            {!sent && (
                <div className="px-4 py-3 border-t border-border bg-card shrink-0">
                    <button
                        onClick={handleSend}
                        className="w-full flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                    >
                        <Send className="h-3.5 w-3.5" />
                        Send SIF to Quote Tool →
                    </button>
                </div>
            )}
        </div>
    )
}
