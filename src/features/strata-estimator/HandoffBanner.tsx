// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Handoff Banner
// v7 refinement · inline card at the top of each step's workspace
//
// Renders inline (not fixed) at the top of the estimator workspace when one
// role hands work off to another. Auto-dismisses after `duration` ms so the
// surrounding content reclaims the space. Visual language matches the
// DesignerTaskNotification inline card: bg-primary/5 brand accent, avatar
// with send badge, Just-now pulse pill, status chips describing the
// direction of the handoff.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { ArrowRight, Send } from 'lucide-react'
import type { ConnectedUser } from './StrataEstimatorNavbar'

interface HandoffBannerProps {
    fromUser: ConnectedUser
    toUser: ConnectedUser
    message: string
    duration?: number
    onDismiss?: () => void
}

export default function HandoffBanner({
    fromUser,
    toUser,
    message,
    duration = 3000,
    onDismiss,
}: HandoffBannerProps) {
    const [visible, setVisible] = useState(true)
    const [leaving, setLeaving] = useState(false)

    useEffect(() => {
        const leaveTimer = setTimeout(() => setLeaving(true), duration - 300)
        const dismissTimer = setTimeout(() => {
            setVisible(false)
            onDismiss?.()
        }, duration)

        return () => {
            clearTimeout(leaveTimer)
            clearTimeout(dismissTimer)
        }
    }, [duration, onDismiss])

    if (!visible) return null

    return (
        <div
            className={clsx(
                'transition-all duration-300',
                leaving
                    ? 'opacity-0 -translate-y-2'
                    : 'opacity-100 translate-y-0 animate-in slide-in-from-top-4 fade-in'
            )}
            role="status"
            aria-live="polite"
        >
            <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-5 bg-primary/5 dark:bg-primary/10 border-l-4 border-primary ring-1 ring-primary/20 rounded-r-2xl">
                    <div className="flex items-start gap-4">

                        {/* Sender avatar with send-badge (Dupler pattern) */}
                        <div className="relative shrink-0">
                            <img
                                src={fromUser.photo}
                                alt={fromUser.name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/40"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center ring-2 ring-card dark:ring-zinc-800">
                                <Send className="h-2.5 w-2.5 text-primary-foreground" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Title + "Just now" pulse pill */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-foreground">
                                    Role handoff
                                </span>
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold animate-pulse">
                                    Just now
                                </span>
                            </div>

                            {/* Sender line */}
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="font-bold text-foreground">
                                    {fromUser.name}
                                </span>{' '}
                                ({fromUser.role}) · {message}
                            </p>

                            {/* Direction chip row — from → to */}
                            <div className="flex items-center gap-2 flex-wrap mt-3">
                                <span className="text-[8px] font-bold px-2 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 ring-2 ring-amber-500/20 shadow-sm shadow-amber-500/10 uppercase tracking-wider">
                                    <Send className="h-3 w-3" />
                                    {fromUser.role}
                                </span>
                                <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" aria-hidden />
                                <span className="text-[8px] font-bold px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1 uppercase tracking-wider">
                                    <img
                                        src={toUser.photo}
                                        alt=""
                                        className="w-3 h-3 rounded-full object-cover"
                                        aria-hidden
                                    />
                                    {toUser.role}
                                </span>
                            </div>

                            {/* Secondary chip */}
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-700 dark:text-green-400 font-bold border border-green-500/30 uppercase tracking-wider">
                                    Routed by strata
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
