/**
 * COMPONENT: OfficeworksStepNotification
 * PURPOSE: BFI-style notification banner shown above the funnel at the start
 *          of early-funnel steps (sc1.0, sc1.1, sc1.2). Auto-shows after a
 *          short delay; CTA opens the document review modal.
 *
 * CLONE OF: src/components/bfi/BFIDashboardScene.tsx (lines 99-122 notification card)
 *
 * DS TOKENS: bg-card · border-ai/40 · text-ai · text-foreground · text-muted-foreground
 */

import { useEffect, useState } from 'react'
import { Sparkles, ArrowRight, X } from 'lucide-react'

interface Props {
    title: string
    desc: string
    cta: string
    /** Called when user clicks the CTA button (typically opens the modal) */
    onAction: () => void
    /** Optional dismiss · if absent, X button is hidden */
    onDismiss?: () => void
    /** Delay before showing (ms) · default 1500ms */
    delayMs?: number
}

/**
 * IMPORTANT: parent must pass `key={stepId}` so that React remounts this
 * component when the step changes — that re-initializes the `visible` state
 * and re-triggers the show timer. This avoids `react-hooks/set-state-in-effect`.
 */
export default function OfficeworksStepNotification({
    title, desc, cta, onAction, onDismiss, delayMs = 1500,
}: Props) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delayMs)
        return () => clearTimeout(t)
    }, [delayMs])

    if (!visible) return null

    return (
        <div
            className="bg-card border border-ai/40 rounded-2xl p-4 shadow-sm animate-in slide-in-from-top-2 fade-in duration-500 flex items-start gap-3"
            role="status"
            aria-live="polite"
        >
            <div className="h-10 w-10 rounded-xl bg-ai/10 text-ai flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
                <div className="text-sm font-semibold text-foreground">{title}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button
                    type="button"
                    onClick={onAction}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-foreground text-background hover:opacity-80 text-xs font-bold transition-all"
                >
                    {cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
                {onDismiss && (
                    <button
                        type="button"
                        onClick={onDismiss}
                        aria-label="Dismiss notification"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </div>
    )
}
