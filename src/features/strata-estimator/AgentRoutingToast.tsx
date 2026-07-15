// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Agent Routing Toast
// Refinement Phase 7.7 (Agent Step 1 — Trigger)
//
// Tiny top-centered toast that fires the instant the demo enters w2.1.
// Surfaces the missing Agent Step 1 (per WRG_CONSOLIDATED_REFERENCE.md §3):
// 'Agent monitors CORE for estimating-ready requests. Identifies estimator
// by location. Creates job record.' — we can't realistically show 12 s of
// monitoring, but we CAN say 'routed JPS to David Park, Dallas' as a one-
// liner before the dossier loading beat takes over.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { Sparkles } from 'lucide-react'

interface AgentRoutingToastProps {
    isOpen: boolean
    project: string
    assignee: string
    office: string
    duration?: number
    onDismiss?: () => void
}

export default function AgentRoutingToast({
    isOpen,
    project,
    assignee,
    office,
    duration = 1600,
    onDismiss,
}: AgentRoutingToastProps) {
    const [mounted, setMounted] = useState(false)
    const [leaving, setLeaving] = useState(false)

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
            <div className="max-w-md flex items-center gap-3 px-5 py-3 rounded-full bg-card/95 dark:bg-zinc-800/95 backdrop-blur-xl border border-indigo-500/30 shadow-xl pointer-events-auto">
                <span className="shrink-0 w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider leading-none">
                        Agent · Routing
                    </p>
                    <p className="text-xs font-semibold text-foreground leading-tight mt-0.5 truncate">
                        {project} → {assignee}
                        <span className="text-muted-foreground font-normal"> · {office}</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
