import { Send, Eye, SkipForward, Sparkles, Check, Loader2, Calendar as CalendarIcon } from 'lucide-react'
import type { InstallJob } from './installScheduleData'

interface JobQuickActionsProps {
    job: InstallJob
    /** Layout variant per host view:
        - 'card'    · Funnel · 3 horizontal pill buttons below the divider
        - 'row'     · List · 3 icon-only buttons in the Sync column
        - 'compact' · Calendar · hover overlay (3 small icon buttons) */
    variant: 'card' | 'row' | 'compact'
    onPublish: (jobId: string) => void
    onView: (jobId: string) => void
    onSkip: (jobId: string) => void
    /** When true, hides the action set entirely (used by Calendar variant
        in steps where drag-drop owns the card). */
    disabled?: boolean
    /** When true, the View button gets a pulse + ring + ai/10 tint to call
        the user's attention. Used by Flow 1 step 1.1 when the Action Center
        notification CTA redirects the user to a specific job for review. */
    pulseView?: boolean
    /** When true, the action set renders a "Sending to Outlook…" indicator
        (variant-aware) instead of the buttons · used during the ~1200ms
        publish simulation between click and the Published terminal state. */
    isPublishing?: boolean
    /** When defined, a Reschedule action (Calendar icon) renders alongside
        the other quick actions. Click bubbles a request up to the parent ·
        the parent decides whether to open the inline popover (calendar
        view) or the ViewJobPanel (list/funnel views). */
    onReschedule?: (jobId: string) => void
}

/**
 * Per-card quick actions for Flow 1. Three actions:
 *   Send to Outlook · publishes individually (sparkles + Published pill)
 *   View            · opens floating panel with job context
 *   Skip            · marks job as deferred (grayscale, removed from calendar)
 *
 * Handlers each stopPropagation() to avoid interfering with drag-drop
 * (Calendar variant) and row navigation (List variant).
 *
 * Once a job has `publishedToOutlook` or `skipped`, the action set renders
 * a terminal pill instead of the buttons so the user doesn't re-trigger.
 */
export default function JobQuickActions({
    job, variant, onPublish, onView, onSkip, disabled, pulseView, isPublishing, onReschedule,
}: JobQuickActionsProps) {
    if (disabled) return null

    const stop = (e: React.MouseEvent | React.PointerEvent) => {
        e.stopPropagation()
    }

    // ── In-flight publish · between click and the published terminal state ──
    if (isPublishing) {
        return <PublishingIndicator variant={variant} />
    }
    // ── Terminal states ──────────────────────────────────────────────────
    // Compact variant (Calendar): the Sparkles indicator is already inline
    // in the JobCard content, so for published cards we keep the View +
    // Reschedule actions instead of taking over with a Published pill ·
    // matches Diego's "los quick actions que correspondan según el estado".
    if (job.publishedToOutlook && variant !== 'compact') {
        return <PublishedPill variant={variant} />
    }
    if (job.skipped) {
        return <SkippedPill variant={variant} />
    }

    const handlePublish    = (e: React.MouseEvent) => { stop(e); onPublish(job.id) }
    const handleView       = (e: React.MouseEvent) => { stop(e); onView(job.id) }
    const handleSkip       = (e: React.MouseEvent) => { stop(e); onSkip(job.id) }
    const handleReschedule = (e: React.MouseEvent) => { stop(e); onReschedule?.(job.id) }

    // ── Variant: card (Funnel) ─────────────────────────────────────────
    if (variant === 'card') {
        return (
            <div className="flex items-center gap-1.5" onPointerDown={stop}>
                <button
                    onClick={handlePublish}
                    title="Send to Outlook · publish this job individually"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-foreground text-background hover:opacity-90 transition-opacity"
                >
                    <Send className="h-3 w-3" />
                    Send
                </button>
                <button
                    onClick={handleView}
                    title={pulseView ? 'Open install detail' : 'View job details'}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md border text-foreground transition-all ${
                        pulseView
                            ? 'border-ai bg-ai/15 ring-2 ring-ai/50 ring-offset-1 ring-offset-card animate-pulse'
                            : 'border-border hover:bg-muted'
                    }`}
                >
                    <Eye className="h-3 w-3" />
                    View
                </button>
                {onReschedule && (
                    <button
                        onClick={handleReschedule}
                        title="Reschedule to a different date"
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md border border-border text-foreground hover:bg-muted transition-colors"
                    >
                        <CalendarIcon className="h-3 w-3" />
                        Reschedule
                    </button>
                )}
                <button
                    onClick={handleSkip}
                    title="Skip · defer this job out of the calendar"
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-auto"
                >
                    <SkipForward className="h-3 w-3" />
                    Skip
                </button>
            </div>
        )
    }

    // ── Variant: row (List) ────────────────────────────────────────────
    if (variant === 'row') {
        return (
            <div className="inline-flex items-center gap-0.5" onPointerDown={stop}>
                <button
                    onClick={handlePublish}
                    title="Send to Outlook"
                    aria-label="Send to Outlook"
                    className="p-1.5 rounded-md text-foreground hover:bg-muted transition-colors"
                >
                    <Send className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={handleView}
                    title="View details"
                    aria-label="View details"
                    className={`p-1.5 rounded-md transition-all ${
                        pulseView
                            ? 'bg-ai/15 text-foreground ring-2 ring-ai/60 animate-pulse'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                    <Eye className="h-3.5 w-3.5" />
                </button>
                {onReschedule && (
                    <button
                        onClick={handleReschedule}
                        title="Reschedule"
                        aria-label="Reschedule"
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <CalendarIcon className="h-3.5 w-3.5" />
                    </button>
                )}
                <button
                    onClick={handleSkip}
                    title="Skip · defer"
                    aria-label="Skip"
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                    <SkipForward className="h-3.5 w-3.5" />
                </button>
            </div>
        )
    }

    // ── Variant: compact (Calendar hover overlay) ──────────────────────
    // Send/Skip only render when meaningful · published jobs hide both
    // (can't re-send, can't skip into the void), so the overlay shrinks to
    // View + Reschedule for already-Published cards.
    return (
        <div
            className={`absolute top-1 right-1 inline-flex items-center gap-0.5 transition-opacity bg-card border border-border rounded-md shadow-sm p-0.5 ${
                pulseView ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            onPointerDown={stop}
        >
            {!job.publishedToOutlook && (
                <button
                    onClick={handlePublish}
                    title="Send to Outlook"
                    aria-label="Send to Outlook"
                    className="p-1 rounded text-foreground hover:bg-muted transition-colors"
                >
                    <Send className="h-3 w-3" />
                </button>
            )}
            <button
                onClick={handleView}
                title="View details"
                aria-label="View details"
                className={`p-1 rounded transition-all ${
                    pulseView
                        ? 'bg-ai/15 text-foreground ring-2 ring-ai/60 animate-pulse'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
                <Eye className="h-3 w-3" />
            </button>
            {onReschedule && (
                <button
                    onClick={handleReschedule}
                    title="Reschedule"
                    aria-label="Reschedule"
                    className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                    <CalendarIcon className="h-3 w-3" />
                </button>
            )}
            {!job.publishedToOutlook && (
                <button
                    onClick={handleSkip}
                    title="Skip"
                    aria-label="Skip"
                    className="p-1 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                    <SkipForward className="h-3 w-3" />
                </button>
            )}
        </div>
    )
}

// ── Terminal pills ──────────────────────────────────────────────────────

function PublishedPill({ variant }: { variant: 'card' | 'row' | 'compact' }) {
    if (variant === 'compact') {
        return (
            <div className="absolute top-1 right-1 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-success/15 text-success">
                <Sparkles className="h-2.5 w-2.5" />
                Sent
            </div>
        )
    }
    if (variant === 'row') {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-success/15 text-success uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                Published
            </span>
        )
    }
    return (
        <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-success/15 text-success">
                <Sparkles className="h-3 w-3" />
                Published to Outlook
            </span>
        </div>
    )
}

function PublishingIndicator({ variant }: { variant: 'card' | 'row' | 'compact' }) {
    if (variant === 'compact') {
        return (
            <div className="absolute top-1 right-1 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-foreground/10 text-foreground">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                Sending
            </div>
        )
    }
    if (variant === 'row') {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-foreground/10 text-foreground uppercase tracking-wider">
                <Loader2 className="h-3 w-3 animate-spin" />
                Sending…
            </span>
        )
    }
    return (
        <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-foreground/10 text-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Sending to Outlook…
            </span>
        </div>
    )
}

function SkippedPill({ variant }: { variant: 'card' | 'row' | 'compact' }) {
    if (variant === 'compact') {
        return (
            <div className="absolute top-1 right-1 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-muted text-muted-foreground">
                <Check className="h-2.5 w-2.5" />
                Skipped
            </div>
        )
    }
    if (variant === 'row') {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground uppercase tracking-wider">
                <Check className="h-3 w-3" />
                Skipped
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
            <Check className="h-3 w-3" />
            Skipped
        </span>
    )
}
