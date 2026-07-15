/**
 * COMPONENT: DesignerResponseScene  (a1.2)
 * PURPOSE: Agency Fee step 2 — Robert Chen (Miller Knoll Rep) reads Lauren's
 *          confirmation email in his mail client and acknowledges receipt.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { CheckCircle2, FileText, ArrowLeft, Mail } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface DesignerResponseSceneProps {
    onAcknowledge?: () => void
}

export default function DesignerResponseScene({ onAcknowledge }: DesignerResponseSceneProps) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const [acknowledged, setAcknowledged] = useState(false)

    const handleAcknowledge = () => {
        setAcknowledged(true)
        setTimeout(pauseAware(() => { onAcknowledge?.() }), 800)
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
                        Re: SIF Received · Q-2026-0089 · DOE-2847
                    </div>
                    <div className="space-y-0.5">
                        {[
                            { label: 'From', value: 'lauren.demarco@bfifurniture.com' },
                            { label: 'To',   value: 'robert.chen@millerknoll.com'     },
                            { label: 'Date', value: 'May 6, 2026 · 8:21 AM'          },
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
                        <p>Hi Robert,</p>
                        <p>
                            We've received your SIF for{' '}
                            <span className="font-semibold">DOE-2847</span>. Documents are on file.
                        </p>
                        <p>
                            Quote <span className="font-semibold">Q-2026-0089</span> has been logged. We'll
                            follow up shortly with next steps.
                        </p>
                        <p className="text-muted-foreground">
                            — Lauren DeMarco<br />BFI Furniture · CoNY Account Manager
                        </p>
                    </div>

                    {/* Attachment chips */}
                    <div className="flex flex-col gap-1.5 mt-2">
                        {[
                            { name: 'DOE-2847-SIF.pdf',         label: 'SIF'        },
                            { name: 'DOE-2847-spec-sheet.pdf',  label: 'Spec Sheet' },
                            { name: 'DOE-2847-floor-plan.pdf',  label: 'Floor Plan' },
                        ].map(a => (
                            <div key={a.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border text-[11px] text-foreground font-medium">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                {a.name}
                                <span className="text-[9px] text-muted-foreground ml-1">· {a.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Acknowledged state */}
                {acknowledged && (
                    <div className="mx-4 mb-3 bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <div className="font-bold text-foreground">Receipt acknowledged · Q-2026-0089 · May 6 · 9:25 AM</div>
                            <div className="text-muted-foreground mt-0.5">Documents logged in Strata · BFI proceeding to Quote Tool validation</div>
                        </div>
                    </div>
                )}

                <div className="px-4 pb-4">
                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
                </div>
            </div>

            {/* CTA */}
            {!acknowledged && (
                <div className="px-4 py-3 border-t border-border bg-card shrink-0">
                    <button
                        onClick={handleAcknowledge}
                        className="w-full flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                    >
                        Continue →
                    </button>
                </div>
            )}
        </div>
    )
}
