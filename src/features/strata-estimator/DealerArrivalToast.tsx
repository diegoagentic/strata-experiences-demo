// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Dealer Arrival Toast
// Refinement Phase 7.6 (w2.4 preamble — Sara's turn)
//
// Small centered toast that appears when the demo lands on w2.4. Gives the
// dealer role an explicit "your turn" cue before the floating
// ProposalActionBar takes over the bottom of the Shell. Auto-dismisses.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { Sparkles } from 'lucide-react'

interface DealerArrivalToastProps {
    isOpen: boolean
    dealerName: string
    dealerPhoto: string
    salesPrice: string
    duration?: number
    onDismiss?: () => void
}

export default function DealerArrivalToast({
    isOpen,
    dealerName,
    dealerPhoto,
    salesPrice,
    duration = 2200,
    onDismiss,
}: DealerArrivalToastProps) {
    const [leaving, setLeaving] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        if (!isOpen) {
            setMounted(false)
            setLeaving(false)
            return
        }

        setMounted(true)
        setLeaving(false)

        const leaveTimer = setTimeout(() => setLeaving(true), duration - 300)
        const unmountTimer = setTimeout(() => {
            setMounted(false)
            onDismiss?.()
        }, duration)

        return () => {
            clearTimeout(leaveTimer)
            clearTimeout(unmountTimer)
        }
    }, [isOpen, duration, onDismiss])

    if (!mounted) return null

    return (
        <div
            className={clsx(
                'fixed top-28 left-1/2 -translate-x-1/2 z-40 flex justify-center px-4 pointer-events-none transition-all duration-300',
                leaving
                    ? 'opacity-0 -translate-y-2'
                    : 'opacity-100 translate-y-0 animate-in fade-in slide-in-from-top-2'
            )}
            role="status"
            aria-live="polite"
        >
            <div className="max-w-md flex items-center gap-3 px-5 py-3 rounded-full bg-card/95 dark:bg-zinc-800/95 backdrop-blur-xl border border-border shadow-xl pointer-events-auto">
                <img
                    src={dealerPhoto}
                    alt={dealerName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/40 shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-foreground dark:text-primary" />
                        Your turn, {dealerName.split(' ')[0]}
                    </p>
                    <p className="text-xs font-semibold text-foreground leading-tight mt-0.5">
                        Review the ${salesPrice} proposal and release when ready.
                    </p>
                </div>
            </div>
        </div>
    )
}
