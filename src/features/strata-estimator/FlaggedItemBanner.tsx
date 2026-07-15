// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Flagged Item Banner
// Refinement Phase 2 (w2.1 narrative)
//
// Sits below the Bill of Materials when the AI has flagged one or more
// items that need human verification. Closes the w2.1 beat timeline with
// an "Escalate to Designer" CTA — clicking it advances the demo into
// w2.2 (Designer verification).
// ═══════════════════════════════════════════════════════════════════════════════

import { ArrowRight, Sparkles } from 'lucide-react'

interface FlaggedItemBannerProps {
    isOpen: boolean
    count: number
    itemLabel: string
    reason: string
    onEscalate: () => void
}

export default function FlaggedItemBanner({
    isOpen,
    count,
    itemLabel,
    reason,
    onEscalate,
}: FlaggedItemBannerProps) {
    if (!isOpen) return null

    return (
        <div
            className="flex items-center gap-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/30 px-5 py-4 animate-in fade-in slide-in-from-top-2 duration-300"
            role="status"
            aria-live="polite"
        >
            <div className="shrink-0 w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {count} item flagged by AI
                </p>
                <p className="text-xs text-foreground mt-0.5 truncate">
                    <span className="font-semibold">{itemLabel}</span>
                    <span className="text-muted-foreground"> · {reason}</span>
                </p>
            </div>
            <button
                onClick={onEscalate}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
                Escalate to Designer
                <ArrowRight className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}
