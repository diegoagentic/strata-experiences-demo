import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, Users, GripVertical, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react'
import type { InstallJob, WeekColumn, Region } from './installScheduleData'
import { REGION_BADGE, REGION_LABEL } from './installScheduleData'
import JobQuickActions from './JobQuickActions'

interface WeekCalendarGridProps {
    weeks: WeekColumn[]
    jobs: InstallJob[]
    /** Highlight a specific job (used by the capacity warning panel) */
    highlightedJobId?: string | null
    /** When set, drag-and-drop is enabled and onJobDrop fires on a successful drop */
    onJobDrop?: (jobId: string, newStartDate: string) => void
    /** When set, the user is informed that the row is "queued for IQ batch sync" */
    queuedJobIds?: Set<string>
    /** Phase D · per-card quick actions (compact variant) on hover */
    onPublish?: (jobId: string) => void
    onView?: (jobId: string) => void
    onSkip?: (jobId: string) => void
    /** When false (e.g. during clc1.3 drag-drop), the hover overlay is hidden
        so the actions don't fight with the drag affordance. */
    showQuickActions?: boolean
    /** When set, the View action of that specific job pulses to draw attention. */
    pulseViewActionForJobId?: string | null
    /** Jobs currently in the publish simulation · render "Sending…" overlay. */
    publishingJobIds?: Set<string>
    /** When set, the specified job gets an ai-tinted ring + animate-pulse +
        a small grip icon · used in step 1.3 to point the user at the
        Fairport card that the narrative asks them to drag. */
    suggestDragJobId?: string | null
    /** When defined, each card shows a small Calendar icon button (top-right)
        that opens an inline date picker · lets the operator reschedule to
        any date without leaving the calendar view (skips the View modal
        and the prev/next navigation chain for far-future dates). */
    onReschedule?: (jobId: string, newStart: string) => void
    /** Strata-AI suggestion · renders a ghost "drop here" preview at the
        targetDate cell. The actual job (jobId) stays at its current start
        until the user drags it there (or accepts via the date picker). */
    aiSuggestion?: { jobId: string; targetDate: string; customer: string } | null
    /** When set, the specified job gets a pulsing "Review · AI flagged"
        badge top-left + a warning ring. Click on the badge dispatches the
        clc:capacity-warning-open event to open the capacity panel. Used in
        step 1.4 to make the alert a card-level affordance. */
    aiFlaggedJobId?: string | null
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const

/** Add N days to an ISO YYYY-MM-DD string (UTC-safe arithmetic). */
function addDays(iso: string, days: number): string {
    const [y, m, d] = iso.split('-').map(Number)
    const dt = new Date(Date.UTC(y, m - 1, d))
    dt.setUTCDate(dt.getUTCDate() + days)
    return dt.toISOString().slice(0, 10)
}

/** Days between two ISO dates (b - a, in UTC days). */
function daysBetween(a: string, b: string): number {
    const [ay, am, ad] = a.split('-').map(Number)
    const [by, bm, bd] = b.split('-').map(Number)
    const ams = Date.UTC(ay, am - 1, ad)
    const bms = Date.UTC(by, bm - 1, bd)
    return Math.round((bms - ams) / 86400000)
}

/**
 * Outlook-style week × weekday grid with install job cards.
 * Net-new primitive · no calendar widget existed in the repo.
 *
 * Layout: rows = 1 per week (Mon-Fri columns), each job rendered as a card
 * positioned in the Mon-cell of its start day. Weekends collapsed (most installs
 * are weekday-only). HTML5 drag-and-drop with no dependency.
 */
export default function WeekCalendarGrid({ weeks, jobs, highlightedJobId, onJobDrop, queuedJobIds, onPublish, onView, onSkip, showQuickActions = true, pulseViewActionForJobId, publishingJobIds, suggestDragJobId, onReschedule, aiSuggestion, aiFlaggedJobId }: WeekCalendarGridProps) {
    const [dragJobId, setDragJobId] = useState<string | null>(null)
    const [dragOverCell, setDragOverCell] = useState<string | null>(null)

    // Index jobs by (weekMonday, dayIndex) cell for rendering.
    const jobsByCell = useMemo(() => {
        const idx: Record<string, InstallJob[]> = {}
        for (const job of jobs) {
            const wk = weeks.find(w => {
                const diff = daysBetween(w.monday, job.startDate)
                return diff >= 0 && diff <= 4 // Mon-Fri
            })
            if (!wk) continue
            const dayIdx = daysBetween(wk.monday, job.startDate)
            const key = `${wk.monday}::${dayIdx}`
            if (!idx[key]) idx[key] = []
            idx[key].push(job)
        }
        return idx
    }, [jobs, weeks])

    const handleDragStart = (e: React.DragEvent, jobId: string) => {
        if (!onJobDrop) return
        setDragJobId(jobId)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', jobId)
    }
    const handleDragEnd = () => {
        setDragJobId(null)
        setDragOverCell(null)
    }
    const handleDragOver = (e: React.DragEvent, cellKey: string) => {
        if (!onJobDrop || !dragJobId) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (dragOverCell !== cellKey) setDragOverCell(cellKey)
    }
    const handleDrop = (e: React.DragEvent, weekMonday: string, dayIdx: number) => {
        if (!onJobDrop || !dragJobId) return
        e.preventDefault()
        const newDate = addDays(weekMonday, dayIdx)
        onJobDrop(dragJobId, newDate)
        handleDragEnd()
    }

    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Header — day labels */}
            <div className="grid grid-cols-[60px_repeat(5,1fr)] bg-muted/40 border-b border-border">
                <div className="px-3 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-r border-border">
                    Week
                </div>
                {DAY_LABELS.map((label, i) => (
                    <div key={label} className={`px-3 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider ${i < 4 ? 'border-r border-border' : ''}`}>
                        {label}
                    </div>
                ))}
            </div>

            {/* Body — week rows */}
            {weeks.map((week, wkIdx) => (
                <div
                    key={week.monday}
                    className={`grid grid-cols-[60px_repeat(5,1fr)] ${wkIdx < weeks.length - 1 ? 'border-b border-border' : ''}`}
                >
                    {/* Week label column */}
                    <div className="px-3 py-3 text-xs font-bold text-foreground bg-muted/20 border-r border-border flex items-center">
                        {week.label}
                    </div>
                    {/* 5 weekday cells */}
                    {DAY_LABELS.map((_, dayIdx) => {
                        const cellKey = `${week.monday}::${dayIdx}`
                        const cellJobs = jobsByCell[cellKey] ?? []
                        const isDropTarget = dragOverCell === cellKey
                        // Suggested ghost · only renders when the AI's target
                        // date maps to THIS cell AND the actual job hasn't yet
                        // been moved there (still at its original startDate).
                        const cellIso = addDays(week.monday, dayIdx)
                        const ghostJob = aiSuggestion && aiSuggestion.targetDate === cellIso
                            ? jobs.find(j => j.id === aiSuggestion.jobId && j.startDate !== aiSuggestion.targetDate)
                            : null
                        return (
                            <div
                                key={cellKey}
                                onDragOver={(e) => handleDragOver(e, cellKey)}
                                onDrop={(e) => handleDrop(e, week.monday, dayIdx)}
                                onDragLeave={() => dragOverCell === cellKey && setDragOverCell(null)}
                                className={`min-h-[88px] p-1.5 space-y-1 transition-colors ${
                                    dayIdx < 4 ? 'border-r border-border' : ''
                                } ${
                                    isDropTarget ? 'bg-ai/15' :
                                    ghostJob ? 'bg-ai/5 ring-1 ring-ai/30 ring-inset' :
                                    'hover:bg-muted/20'
                                }`}
                            >
                                {ghostJob && aiSuggestion && (
                                    <div
                                        className="rounded-md border-2 border-dashed border-ai/60 bg-card/40 p-2 space-y-1 pointer-events-none animate-pulse"
                                        aria-hidden
                                    >
                                        <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-ai">
                                            <Sparkles className="h-2.5 w-2.5" />
                                            Strata suggests
                                        </div>
                                        <div className="text-[10px] font-semibold text-foreground/70 leading-tight line-clamp-2">
                                            {aiSuggestion.customer}
                                        </div>
                                        <div className="text-[9px] text-muted-foreground italic">
                                            Drop here to accept
                                        </div>
                                    </div>
                                )}
                                {cellJobs.map(job => (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        highlighted={highlightedJobId === job.id}
                                        queued={queuedJobIds?.has(job.id) ?? false}
                                        // Skipped jobs are NOT draggable (user explicitly removed
                                        // them) · published jobs ARE draggable in steps that allow
                                        // it (the rescheduling is what 1.3 demos). The step-level
                                        // gate is onJobDrop being defined.
                                        draggable={!!onJobDrop && !job.skipped}
                                        onDragStart={(e) => handleDragStart(e, job.id)}
                                        onDragEnd={handleDragEnd}
                                        isDragging={dragJobId === job.id}
                                        onPublish={onPublish}
                                        onView={onView}
                                        onSkip={onSkip}
                                        showQuickActions={showQuickActions}
                                        pulseView={pulseViewActionForJobId === job.id}
                                        isPublishing={publishingJobIds?.has(job.id) ?? false}
                                        suggestDrag={suggestDragJobId === job.id}
                                        onReschedule={onReschedule}
                                        aiFlagged={aiFlaggedJobId === job.id}
                                    />
                                ))}
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}

// ─── Job card ────────────────────────────────────────────────────────────────

interface JobCardProps {
    job: InstallJob
    highlighted: boolean
    queued: boolean
    draggable: boolean
    onDragStart: (e: React.DragEvent) => void
    onDragEnd: () => void
    isDragging: boolean
    onPublish?: (jobId: string) => void
    onView?: (jobId: string) => void
    onSkip?: (jobId: string) => void
    showQuickActions: boolean
    pulseView: boolean
    isPublishing: boolean
    suggestDrag: boolean
    onReschedule?: (jobId: string, newStart: string) => void
    aiFlagged: boolean
}

function JobCard({ job, highlighted, queued, draggable, onDragStart, onDragEnd, isDragging, onPublish, onView, onSkip, showQuickActions, pulseView, isPublishing, suggestDrag, onReschedule, aiFlagged }: JobCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [rescheduleOpen, setRescheduleOpen] = useState(false)
    const [rescheduleDraft, setRescheduleDraft] = useState(job.startDate)
    const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null)
    // Keep the draft in sync with the source date when the card isn't being
    // edited · prevents stale defaults if the job was rescheduled elsewhere.
    useEffect(() => {
        if (!rescheduleOpen) setRescheduleDraft(job.startDate)
    }, [job.startDate, rescheduleOpen])
    const canReschedule = !!onReschedule && !job.skipped

    /** Calculate where the popover should sit · below the card by default,
        flipped above when there's no room. Right edge clamped to viewport. */
    const computePopoverPos = () => {
        if (!cardRef.current) return null
        const rect = cardRef.current.getBoundingClientRect()
        const POPOVER_WIDTH = 260
        const POPOVER_HEIGHT = 200
        const MARGIN = 12
        let top = rect.bottom + 4
        let left = rect.left
        if (left + POPOVER_WIDTH + MARGIN > window.innerWidth) {
            left = Math.max(MARGIN, window.innerWidth - POPOVER_WIDTH - MARGIN)
        }
        if (top + POPOVER_HEIGHT + MARGIN > window.innerHeight) {
            top = Math.max(MARGIN, rect.top - POPOVER_HEIGHT - 4)
        }
        return { top, left }
    }

    const openReschedule = (e: React.MouseEvent) => {
        e.stopPropagation()
        setRescheduleDraft(job.startDate)
        const pos = computePopoverPos()
        if (pos) setPopoverPos(pos)
        setRescheduleOpen(true)
    }
    const commitReschedule = () => {
        if (rescheduleDraft && rescheduleDraft !== job.startDate && onReschedule) {
            onReschedule(job.id, rescheduleDraft)
        }
        setRescheduleOpen(false)
        setPopoverPos(null)
    }
    const cancelReschedule = () => {
        setRescheduleDraft(job.startDate)
        setRescheduleOpen(false)
        setPopoverPos(null)
    }

    // While the popover is open, recompute its position on scroll/resize so
    // it stays glued to the card. If the card scrolls off-screen, close.
    useEffect(() => {
        if (!rescheduleOpen) return
        const recalc = () => {
            if (!cardRef.current) return
            const rect = cardRef.current.getBoundingClientRect()
            if (rect.bottom < 0 || rect.top > window.innerHeight) {
                setRescheduleOpen(false)
                setPopoverPos(null)
                return
            }
            const pos = computePopoverPos()
            if (pos) setPopoverPos(pos)
        }
        window.addEventListener('scroll', recalc, true)
        window.addEventListener('resize', recalc)
        return () => {
            window.removeEventListener('scroll', recalc, true)
            window.removeEventListener('resize', recalc)
        }
    }, [rescheduleOpen])
    const regionBadge = REGION_BADGE[job.region as Region]
    const hasActions = showQuickActions && !!(onPublish && onView && onSkip)
    return (
        <div
            ref={cardRef}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={`relative group rounded-md border bg-card p-2 transition-all ${
                draggable ? 'cursor-grab active:cursor-grabbing' : ''
            } ${
                isDragging ? 'opacity-40 scale-95' : ''
            } ${
                job.justArrived ? 'border-ai/40 ring-2 ring-ai/30' :
                suggestDrag    ? 'border-ai ring-2 ring-ai/50 ring-offset-1 ring-offset-card animate-pulse' :
                aiFlagged      ? 'border-warning/50' :
                highlighted    ? 'border-red-300 ring-1 ring-red-200 dark:border-red-500/50 dark:ring-red-500/20' :
                queued         ? 'border-yellow-300 dark:border-yellow-500/50' :
                                 'border-border hover:border-foreground/30'
            } ${job.skipped ? 'opacity-50 grayscale' : ''}`}
            title={suggestDrag
                ? `Drag ${job.customer} to a different day to reschedule`
                : aiFlagged
                    ? `${job.customer} · Strata flagged this for capacity review`
                    : `${job.customer} · ${job.crewSize} crew · ${job.iqJobIds.length} IQ job${job.iqJobIds.length > 1 ? 's' : ''}`}
        >
            {suggestDrag && (
                <div className="absolute -top-2 -left-2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-ai text-background px-1.5 py-0.5 rounded-full shadow-md">
                    <GripVertical className="h-2.5 w-2.5" />
                    Drag me
                </div>
            )}
            {aiFlagged && (
                <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation()
                        window.dispatchEvent(new CustomEvent('clc:capacity-warning-open'))
                    }}
                    title="Strata flagged this for capacity review · click to open the report"
                    aria-label="Open capacity review"
                    className="w-full flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-warning/15 text-yellow-800 dark:text-yellow-300 hover:bg-warning/25 px-1.5 py-0.5 rounded mb-1 transition-colors animate-pulse"
                >
                    <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">Strata · Review capacity</span>
                </button>
            )}
            {canReschedule && (
                <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={openReschedule}
                    title="Reschedule to any date"
                    aria-label="Reschedule"
                    className="absolute top-1 right-1 p-1 rounded bg-card border border-border shadow-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors z-10"
                >
                    <CalendarIcon className="h-3 w-3" />
                </button>
            )}
            {canReschedule && rescheduleOpen && popoverPos && createPortal(
                <>
                    {/* Backdrop · click-outside to dismiss the popover.
                        Lives above all calendar cards (z-[9998]) so the
                        popover above it (z-[9999]) is the only interactive
                        surface · click anywhere outside cancels. */}
                    <div
                        className="fixed inset-0 z-[9998]"
                        onClick={cancelReschedule}
                        aria-hidden
                    />
                    <div
                        className="fixed z-[9999] w-[260px] rounded-lg border border-border bg-card shadow-xl p-3 space-y-2"
                        style={{ top: popoverPos.top, left: popoverPos.left }}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => e.preventDefault()}
                        role="dialog"
                        aria-label={`Reschedule ${job.customer}`}
                    >
                        <div className="flex items-center gap-1.5">
                            <CalendarIcon className="h-3.5 w-3.5 text-foreground" />
                            <h4 className="text-xs font-bold text-foreground">Reschedule</h4>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-snug">
                            {job.customer} · current: <span className="font-mono">{job.startDate}</span>
                        </p>
                        <input
                            type="date"
                            value={rescheduleDraft}
                            onChange={(e) => setRescheduleDraft(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs font-mono bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            aria-label="New start date"
                            autoFocus
                        />
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                            <button
                                type="button"
                                onClick={cancelReschedule}
                                className="px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={commitReschedule}
                                disabled={!rescheduleDraft || rescheduleDraft === job.startDate}
                                className="px-2.5 py-1 text-[10px] font-bold bg-foreground text-background rounded-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Save
                            </button>
                        </div>
                        <p className="text-[9px] text-muted-foreground italic">
                            Queues for IQ batch sync · 2am ET
                        </p>
                    </div>
                </>,
                document.body,
            )}
            <div className="flex items-start gap-1.5 mb-1">
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap ${regionBadge}`}>
                    {REGION_LABEL[job.region as Region]}
                </span>
                {(job.aiScheduled || job.publishedToOutlook) && (
                    <Sparkles className="h-3 w-3 text-zinc-800 dark:text-zinc-200 shrink-0 mt-0.5" aria-label="Strata signal" />
                )}
                {job.isAnchor && (
                    <span className="inline-flex items-center text-[9px] font-bold px-1 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 uppercase tracking-wider whitespace-nowrap">
                        Anchor
                    </span>
                )}
            </div>
            <div className="text-[11px] font-semibold text-foreground leading-tight line-clamp-2">
                {job.customer}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-0.5">
                    <Users className="h-3 w-3" />
                    {job.crewSize}
                </span>
                <span className="font-mono">{job.iqJobIds.length} job{job.iqJobIds.length > 1 ? 's' : ''}</span>
            </div>
            {queued && (
                <div className="mt-1 text-[9px] font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wider">
                    Queued · IQ batch
                </div>
            )}
            {job.justArrived && (
                <div className="absolute -top-1.5 -right-1.5 text-[8px] font-bold uppercase tracking-wider bg-ai text-background px-1.5 py-0.5 rounded-full shadow-md animate-pulse">
                    New
                </div>
            )}
            {hasActions && (
                <JobQuickActions
                    job={job}
                    variant="compact"
                    pulseView={pulseView}
                    isPublishing={isPublishing}
                    onPublish={onPublish!}
                    onView={onView!}
                    onSkip={onSkip!}
                />
            )}
        </div>
    )
}
