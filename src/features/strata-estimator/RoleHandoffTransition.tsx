// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Role Handoff Transition
// Refinement Phase 7.3 (reusable role-to-role transition)
//
// Fullscreen dimmer + centered card that plays between role changes:
//   w2.1 → w2.2 · David escalates to Alex
//   w2.2 → w2.3 · Alex returns to David
//   w2.3 → w2.4 · David sends to Sara
//
// The animation reads like a mini agent-routing moment: both avatars
// visible (from is dimmed, to is highlighted with a primary ring), arrow
// pulses between them, progress bar fills to signal the handoff is
// actually routing through something. When the progress bar completes,
// onComplete() fires — the Shell then calls nextStep() to advance the
// demo profile. Fades out on the way out.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'

export interface HandoffPerson {
    name: string
    role: string
    photo: string
}

interface RoleHandoffTransitionProps {
    isOpen: boolean
    fromUser: HandoffPerson
    toUser: HandoffPerson
    message: string
    duration?: number
    onComplete: () => void
}

export default function RoleHandoffTransition({
    isOpen,
    fromUser,
    toUser,
    message,
    duration = 3000,
    onComplete,
}: RoleHandoffTransitionProps) {
    const [progress, setProgress] = useState(0)
    const [leaving, setLeaving] = useState(false)
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    useEffect(() => {
        if (!isOpen) {
            setProgress(0)
            setLeaving(false)
            return
        }

        // Next frame: kick the CSS transition from 0 → 100
        const rafStart = requestAnimationFrame(() => setProgress(100))

        // Pause-aware wrapper: if paused when timer fires, polls until unpaused
        const pauseAware = (fn: () => void) => () => {
            if (!isPausedRef.current) { fn(); return }
            const poll = setInterval(() => {
                if (!isPausedRef.current) { clearInterval(poll); fn() }
            }, 200)
        }

        // After duration: start leave animation (respects pause)
        const leaveTimer = setTimeout(pauseAware(() => setLeaving(true)), duration)

        // After duration + leave buffer: fire onComplete (respects pause)
        const completeTimer = setTimeout(pauseAware(() => onComplete()), duration + 400)

        return () => {
            cancelAnimationFrame(rafStart)
            clearTimeout(leaveTimer)
            clearTimeout(completeTimer)
        }
    }, [isOpen, duration, onComplete])

    if (!isOpen) return null

    return (
        <div
            className={[
                'fixed inset-0 z-[250] flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm transition-opacity duration-300',
                leaving ? 'opacity-0' : 'opacity-100 animate-in fade-in',
            ].join(' ')}
            role="status"
            aria-live="polite"
        >
            <div
                className={[
                    'w-full max-w-md mx-4 p-6 rounded-2xl bg-card dark:bg-zinc-800 border border-border shadow-2xl transition-all duration-300',
                    leaving
                        ? 'opacity-0 scale-95 translate-y-2'
                        : 'opacity-100 scale-100 translate-y-0 animate-in zoom-in-95',
                ].join(' ')}
            >
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center mb-6">
                    Routing through Strata
                </p>

                {/* Avatar row: from → arrow → to */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center flex-1 min-w-0">
                        <img
                            src={fromUser.photo}
                            alt={fromUser.name}
                            className="w-12 h-12 rounded-full object-cover opacity-50 grayscale"
                        />
                        <p className="text-[10px] text-muted-foreground mt-2 truncate max-w-full">
                            {fromUser.name}
                        </p>
                    </div>

                    <div className="shrink-0 flex items-center">
                        <ArrowRight className="w-5 h-5 text-foreground dark:text-primary animate-pulse" />
                    </div>

                    <div className="flex flex-col items-center flex-1 min-w-0">
                        <img
                            src={toUser.photo}
                            alt={toUser.name}
                            className="w-16 h-16 rounded-full object-cover ring-4 ring-primary/40"
                        />
                        <p className="text-sm font-bold text-foreground mt-2 truncate max-w-full">
                            {toUser.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-full">
                            {toUser.role}
                        </p>
                    </div>
                </div>

                {/* Message */}
                <p className="text-xs text-muted-foreground text-center mt-5">
                    {message}
                </p>

                {/* Progress bar */}
                <div className="mt-4 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full bg-primary"
                        style={{
                            width: `${progress}%`,
                            transition: `width ${duration}ms linear`,
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
