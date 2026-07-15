// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — CORE ↔ Outlook Card
// v8 Paso E · Two gap-closure beats:
//
//   incoming → Beat 1 at the start of w1.1. CORE has assigned a new
//              estimating request to David and fired an Outlook email.
//              Bridges BPMN stages 1-3 so the audience understands why
//              David is about to log into CORE.
//
//   outgoing → Beat 2 at the start of w2.1. Strata has written the
//              labor estimate back into CORE and triggered an Outlook
//              notification to Sara. Bridges BPMN stages 18-19 so the
//              write-back moment is visible instead of implicit.
//
// The card is inline (not a modal) so it flows with the workspace and
// auto-dismisses via its own timer.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import {
    ArrowRight,
    CheckCircle2,
    Database,
    Mail,
    Sparkles,
} from 'lucide-react'

type Variant = 'incoming' | 'outgoing'

interface CoreOutlookCardProps {
    variant: Variant
    duration?: number
    onDismiss?: () => void
}

export default function CoreOutlookCard({
    variant,
    duration = 1800,
    onDismiss,
}: CoreOutlookCardProps) {
    const [leaving, setLeaving] = useState(false)

    useEffect(() => {
        const leaveTimer = setTimeout(() => setLeaving(true), duration - 300)
        const dismissTimer = setTimeout(() => onDismiss?.(), duration)
        return () => {
            clearTimeout(leaveTimer)
            clearTimeout(dismissTimer)
        }
    }, [duration, onDismiss])

    const incoming = variant === 'incoming'

    return (
        <div
            className={clsx(
                'transition-all duration-300',
                leaving
                    ? 'opacity-0 -translate-y-2'
                    : 'opacity-100 translate-y-0 animate-in fade-in slide-in-from-top-4'
            )}
            role="status"
            aria-live="polite"
        >
            <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm overflow-hidden">
                <div
                    className={clsx(
                        'p-5 border-l-4 ring-1 rounded-r-2xl',
                        incoming
                            ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500 ring-indigo-500/20'
                            : 'bg-primary/5 dark:bg-primary/10 border-primary ring-primary/20'
                    )}
                >
                    <div className="flex items-start gap-4">
                        {/* Icon badge */}
                        <div className="relative shrink-0">
                            <div
                                className={clsx(
                                    'w-10 h-10 rounded-xl flex items-center justify-center ring-2',
                                    incoming
                                        ? 'bg-indigo-500/15 ring-indigo-500/40'
                                        : 'bg-primary/15 ring-primary/40'
                                )}
                            >
                                {incoming ? (
                                    <Mail
                                        className={clsx(
                                            'w-5 h-5',
                                            'text-indigo-600 dark:text-indigo-400'
                                        )}
                                    />
                                ) : (
                                    <Database className="w-5 h-5 text-foreground dark:text-primary" />
                                )}
                            </div>
                            {/* Secondary badge */}
                            <div
                                className={clsx(
                                    'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-card dark:ring-zinc-800',
                                    incoming ? 'bg-indigo-500' : 'bg-primary'
                                )}
                            >
                                <ArrowRight
                                    className={clsx(
                                        'h-2.5 w-2.5',
                                        incoming ? 'text-white' : 'text-primary-foreground'
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Title row */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-foreground">
                                    {incoming
                                        ? 'CORE → Outlook'
                                        : 'Strata → CORE → Outlook'}
                                </span>
                                <span
                                    className={clsx(
                                        'text-[9px] px-2 py-0.5 rounded-full font-bold animate-pulse',
                                        incoming
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-primary text-primary-foreground'
                                    )}
                                >
                                    {incoming ? 'Incoming' : 'Outgoing'}
                                </span>
                            </div>

                            {/* Body */}
                            {incoming ? (
                                <>
                                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                                        New estimating request assigned to{' '}
                                        <span className="font-bold text-foreground">
                                            David Park
                                        </span>{' '}
                                        · Dallas office
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap mt-2">
                                        <span className="text-[9px] font-bold px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                                            JPS Health Network
                                        </span>
                                        <span className="text-[9px] font-bold px-2 py-1 rounded-md bg-muted/50 text-muted-foreground uppercase tracking-wider">
                                            24 items
                                        </span>
                                        <span className="text-[9px] font-bold px-2 py-1 rounded-md bg-muted/50 text-muted-foreground uppercase tracking-wider">
                                            Healthcare
                                        </span>
                                        <span className="text-[9px] font-bold px-2 py-1 rounded-md bg-muted/50 text-muted-foreground uppercase tracking-wider">
                                            Priority · High
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                                        Labor estimate written back to CORE with full
                                        audit trail · Outlook notification sent to{' '}
                                        <span className="font-bold text-foreground">
                                            Sara Chen
                                        </span>{' '}
                                        (Salesperson)
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap mt-2">
                                        <span className="text-[9px] font-bold px-2 py-1 rounded-md bg-primary/10 text-foreground dark:text-primary border border-primary/30 uppercase tracking-wider flex items-center gap-1">
                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                            185.04 hrs · $10,547
                                        </span>
                                        <span className="text-[9px] font-bold px-2 py-1 rounded-md bg-primary/10 text-foreground dark:text-primary border border-primary/30 uppercase tracking-wider flex items-center gap-1">
                                            <Sparkles className="w-2.5 h-2.5" />
                                            Audit trail attached
                                        </span>
                                        <span className="text-[9px] font-bold px-2 py-1 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/30 uppercase tracking-wider">
                                            Both engines merged
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
