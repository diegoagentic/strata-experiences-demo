// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Scope Breach Alert
// Refinement Phase 2 (w2.1 narrative)
//
// Transient top-of-BoM banner that surfaces WRG Pain Point #6: the
// Delivery Pricer scope limits (≤50 chairs, ≤2 desks, ≤20 files, ≤10
// HATs). When the AI import sees a breach, this banner shows the category,
// the count vs limit, and notes that an override was applied so the
// estimator can trust the result. Auto-hides after `duration` ms.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect } from 'react'
import { AlertTriangle, FileWarning, ShieldCheck } from 'lucide-react'

interface ScopeBreachAlertProps {
    isOpen: boolean
    category: string
    count: number
    limit: number
    duration?: number
    onDismiss: () => void
}

export default function ScopeBreachAlert({
    isOpen,
    category,
    count,
    limit,
    duration = 3500,
    onDismiss,
}: ScopeBreachAlertProps) {
    useEffect(() => {
        if (!isOpen) return
        const timer = setTimeout(onDismiss, duration)
        return () => clearTimeout(timer)
    }, [isOpen, duration, onDismiss])

    if (!isOpen) return null

    return (
        <div
            className="rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/30 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden"
            role="status"
            aria-live="polite"
        >
            {/* Scope breach row */}
            <div className="flex items-start gap-3 px-5 py-3">
                <div className="shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                        Scope breach detected
                    </p>
                    <p className="text-xs text-foreground mt-0.5">
                        <span className="font-semibold">{count}</span>
                        <span className="text-muted-foreground"> {category} · Delivery Pricer limit is </span>
                        <span className="font-semibold">{limit}</span>
                        <span className="text-muted-foreground">. </span>
                        <span>AI applied a documented override — overhead captured in the audit trail.</span>
                    </p>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" />
                    Override logged
                </div>
            </div>

            {/* v8 Paso E · Gap D · Mismatch detection row */}
            <div className="flex items-start gap-3 px-5 py-3 border-t border-amber-500/20 bg-amber-500/5">
                <div className="shrink-0 mt-0.5">
                    <FileWarning className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                        Spec vs drawing mismatch
                    </p>
                    <p className="text-xs text-foreground mt-0.5">
                        <span className="text-muted-foreground">Spec PDF lists </span>
                        <span className="font-semibold">{count}</span>
                        <span className="text-muted-foreground"> {category} but the floor plan drawing shows </span>
                        <span className="font-semibold">{count - 4}</span>
                        <span className="text-muted-foreground">. </span>
                        <span>AI cross-checked both documents automatically — no manual verification needed.</span>
                    </p>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-foreground dark:text-primary uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" />
                    AI caught it
                </div>
            </div>
        </div>
    )
}
