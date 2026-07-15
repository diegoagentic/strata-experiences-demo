import { useEffect, useState } from 'react'
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react'

interface CLCIngestionOverlayProps {
    /** Called once the ingestion sequence finishes · the parent uses it
        to trigger the next-stage redirect (Flow 1: calendar + highlight,
        Flow 2: open consolidation modal at filter stage). */
    onComplete: () => void
    /** Overrides the default Flow 1 phases · pass any sequence of
        status lines (one per "Strata is doing work" beat). */
    phases?: string[]
    /** Overrides the title shown next to the Sparkles header. */
    title?: string
    /** Overrides the small caption shown under the progress bar. */
    footnote?: string
}

/** Default phases · Flow 1 (clc1.1 · Troy inbound). */
const DEFAULT_PHASES: string[] = [
    'Pulling J-44099 from IQ reporting API',
    'Parsing vendor schedule · KI · 2-crew',
    'Checking capacity · NY · week of Jun 1, 2026',
    'Ready to publish · no conflicts',
]
const DEFAULT_TITLE = 'Strata is processing the IQ install request'
const DEFAULT_FOOTNOTE = 'Troy Public Library · J-44099 · Inbound from IQ reporting API'

const STEP_MS = 480
const FINAL_PAUSE_MS = 420

/**
 * Strata "is processing" overlay · plays for ~2.3-3.3s between an
 * Action Center CTA click and the actual scene action (modal open,
 * scene redirect, etc.). Narratively replaces an instant teleport
 * with a beat that shows the AI doing real work.
 *
 * Reused in Flow 1 (`clc:inbound-job-open` · CLCCalendarScene) and
 * Flow 2 (`clc:sharepoint-trigger` · CLCSharePointScene). The shell
 * is identical · phases/title/footnote drive the content.
 */
export default function CLCIngestionOverlay({
    onComplete,
    phases = DEFAULT_PHASES,
    title = DEFAULT_TITLE,
    footnote = DEFAULT_FOOTNOTE,
}: CLCIngestionOverlayProps) {
    const [phase, setPhase] = useState(0)

    useEffect(() => {
        const timers: number[] = []
        phases.forEach((_, i) => {
            timers.push(window.setTimeout(() => setPhase(i + 1), (i + 1) * STEP_MS))
        })
        timers.push(window.setTimeout(onComplete, phases.length * STEP_MS + FINAL_PAUSE_MS))
        return () => timers.forEach(t => clearTimeout(t))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-foreground/30 backdrop-blur-sm"
            role="status"
            aria-live="polite"
        >
            <div className="bg-card border border-ai/40 rounded-2xl shadow-2xl p-5 max-w-md w-full mx-4">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-ai animate-pulse" />
                    <h3 className="text-sm font-bold text-foreground">{title}</h3>
                </div>
                <ul className="space-y-2.5">
                    {phases.map((label, idx) => {
                        const isComplete = idx < phase
                        const isActive = idx === phase
                        return (
                            <li key={idx} className="flex items-center gap-2.5 text-xs">
                                {isComplete ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                ) : isActive ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-ai shrink-0" />
                                ) : (
                                    <span className="h-3.5 w-3.5 rounded-full border border-border shrink-0" aria-hidden />
                                )}
                                <span className={isComplete || isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                    {label}
                                </span>
                            </li>
                        )
                    })}
                </ul>
                <div className="mt-4 h-1 rounded-full bg-muted overflow-hidden" aria-hidden>
                    <div
                        className="h-full bg-ai transition-all duration-500 ease-out"
                        style={{ width: `${(phase / phases.length) * 100}%` }}
                    />
                </div>
                <p className="mt-3 text-[10px] text-muted-foreground text-center">
                    {footnote}
                </p>
            </div>
        </div>
    )
}
