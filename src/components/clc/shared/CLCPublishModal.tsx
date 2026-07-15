import { useMemo, useState } from 'react'
import { Send, X, Filter as FilterIcon, Sparkles, Eye, Loader2, CheckCircle2 } from 'lucide-react'
import type { InstallJob, Region } from './installScheduleData'
import { REGION_BADGE, REGION_LABEL } from './installScheduleData'

interface CLCPublishModalProps {
    /** Full display list · the modal shows every job in the calendar, with
        published/skipped rows rendered read-only. */
    jobs: InstallJob[]
    onClose: () => void
    onPublish: (selectedJobIds: Set<string>) => void
    /** Opens the install detail panel for any row · the publish modal does
        NOT close on click (the detail panel stacks above), so the operator
        can review a job and return to their bulk selection. */
    onViewJob?: (jobId: string) => void
    /** Jobs currently in the per-job publish simulation · rows render a
        Sending pill instead of the checkbox state. */
    publishingJobIds?: Set<string>
    /** Array of jobIds in the current bulk-publish wave · null when no
        wave in flight. When present the modal switches to progress-UI mode
        and the footer shows a Publishing progress bar instead of Cancel/Publish. */
    bulkPublishIds?: string[] | null
}

const STATUS_OPTIONS: { key: InstallJob['status']; label: string }[] = [
    { key: 'pending',   label: 'Pulled' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'in-flight', label: 'In-flight' },
]

/**
 * Bulk-publish-to-Outlook modal · the user reviews the queued install
 * jobs, deselects any they don't want sent, optionally filters by
 * region or status, and confirms with a Send.
 *
 * Replaces the previous "Publish all" header button shortcut, which
 * advanced the step without any user confirmation.
 */
export default function CLCPublishModal({ jobs, onClose, onPublish, onViewJob, publishingJobIds, bulkPublishIds }: CLCPublishModalProps) {
    // Derived bulk state · drives footer mode + disables close/cancel.
    const isBulkPublishing = !!bulkPublishIds && bulkPublishIds.length > 0
    const bulkTotal = bulkPublishIds?.length ?? 0
    const bulkSent = useMemo(() => {
        if (!bulkPublishIds) return 0
        const publishedSet = new Set(jobs.filter(j => j.publishedToOutlook).map(j => j.id))
        return bulkPublishIds.reduce((acc, id) => acc + (publishedSet.has(id) ? 1 : 0), 0)
    }, [bulkPublishIds, jobs])
    const bulkAllDone = isBulkPublishing && bulkSent >= bulkTotal
    // The modal mirrors the calendar · shows ALL displayed jobs with
    // status-aware rendering. Published rows are checked + disabled with
    // a Published pill, skipped rows are disabled + grayed. Only the
    // publishable subset is interactive.
    const publishable = useMemo(
        () => jobs.filter(j => !j.publishedToOutlook && !j.skipped),
        [jobs],
    )
    const alreadyPublishedCount = useMemo(
        () => jobs.filter(j => j.publishedToOutlook).length,
        [jobs],
    )
    const skippedOnlyCount = useMemo(
        () => jobs.filter(j => j.skipped && !j.publishedToOutlook).length,
        [jobs],
    )

    // Selection defaults to "everything publishable" · matches the original
    // implicit behaviour of "Publish all to Outlook" so a quick Send still
    // sends the full set with one extra click.
    const [selectedIds, setSelectedIds] = useState<Set<string>>(
        () => new Set(publishable.map(j => j.id)),
    )
    const [regionFilter, setRegionFilter] = useState<Region | 'all'>('all')
    const [statusFilter, setStatusFilter] = useState<string[]>([])

    // Visible set · ALL jobs that pass the region+status filter, regardless
    // of publish/skip state. Diego's call · the modal should feel "complete"
    // by showing the calendar context, not a sparse list of leftovers.
    const visible = useMemo(() => {
        return jobs.filter(j => {
            if (regionFilter !== 'all' && j.region !== regionFilter) return false
            if (statusFilter.length > 0 && !statusFilter.includes(j.status)) return false
            return true
        })
    }, [jobs, regionFilter, statusFilter])

    const selectedCount = selectedIds.size

    const toggle = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const selectAllVisible = () => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            for (const j of visible) {
                if (!j.publishedToOutlook && !j.skipped) next.add(j.id)
            }
            return next
        })
    }
    const deselectAllVisible = () => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            for (const j of visible) {
                if (!j.publishedToOutlook && !j.skipped) next.delete(j.id)
            }
            return next
        })
    }

    const toggleStatus = (key: string) => {
        setStatusFilter(prev => (prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]))
    }

    const handleSubmit = () => onPublish(selectedIds)

    // Per-region counts of selected items · power user info at the footer
    const regionBreakdown = useMemo(() => {
        const counts: Record<Region, number> = { ny: 0, nj: 0, pa: 0 }
        for (const j of publishable) {
            if (selectedIds.has(j.id)) counts[j.region]++
        }
        return counts
    }, [publishable, selectedIds])

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-modal-title"
        >
            <div
                className="fixed inset-0 bg-foreground/40 backdrop-blur-sm"
                onClick={isBulkPublishing ? undefined : onClose}
            />
            {/* Fixed height · h-[640px] keeps the modal stable as the user
                filters or selects, instead of growing/shrinking with the
                visible job count. max-h-[90vh] handles short viewports. */}
            <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col h-[640px] max-h-[90vh]">
                <header className="p-4 border-b border-border flex items-start justify-between gap-3">
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Bulk publish</div>
                        <h2 id="publish-modal-title" className="text-base font-bold text-foreground leading-tight inline-flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-foreground" />
                            Publish to Outlook
                        </h2>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            <strong className="text-foreground tabular-nums">{selectedCount}</strong> of {publishable.length} pending selected
                            {alreadyPublishedCount > 0 && (
                                <> · <span className="text-success font-semibold">{alreadyPublishedCount} already in Outlook</span></>
                            )}
                            {skippedOnlyCount > 0 && (
                                <> · {skippedOnlyCount} skipped</>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        disabled={isBulkPublishing}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                {/* Filter row · same pattern as CLCFilterBar */}
                <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2 flex-wrap">
                    <FilterIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <select
                        value={regionFilter}
                        onChange={e => setRegionFilter(e.target.value as Region | 'all')}
                        aria-label="Filter by region"
                        className="px-2.5 py-1.5 text-xs font-medium bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="all">All regions</option>
                        <option value="ny">NY · New York</option>
                        <option value="nj">NJ · New Jersey</option>
                        <option value="pa">PA · Pennsylvania</option>
                    </select>
                    <div className="inline-flex items-center gap-1 flex-wrap">
                        {STATUS_OPTIONS.map(opt => {
                            const isOn = statusFilter.includes(opt.key)
                            return (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => toggleStatus(opt.key)}
                                    aria-pressed={isOn}
                                    className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                                        isOn
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-background border border-border text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            )
                        })}
                    </div>
                    <div className="ml-auto inline-flex items-center gap-2 text-[11px]">
                        <button
                            type="button"
                            onClick={selectAllVisible}
                            className="font-semibold text-foreground hover:underline"
                        >
                            Select visible
                        </button>
                        <span className="text-muted-foreground">·</span>
                        <button
                            type="button"
                            onClick={deselectAllVisible}
                            className="font-semibold text-muted-foreground hover:text-foreground hover:underline"
                        >
                            Deselect visible
                        </button>
                    </div>
                </div>

                {/* Job list with checkboxes · all calendar jobs, with status-aware
                    rendering (Published rows checked+disabled, Skipped rows
                    grayed+disabled, publishable rows interactive). */}
                <div className="flex-1 overflow-y-auto">
                    {visible.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">
                            No jobs match the current filter.
                        </div>
                    ) : (
                        <ul className="divide-y divide-border">
                            {visible.map(job => {
                                const isPublished = !!job.publishedToOutlook
                                const isSkipped = !!job.skipped && !isPublished
                                const isSending = !!publishingJobIds?.has(job.id) && !isPublished
                                const isInteractive = !isPublished && !isSkipped && !isSending && !isBulkPublishing
                                const isSelected = (isInteractive || isSending) && selectedIds.has(job.id)
                                const checked = isPublished || isSending || isSelected

                                const rowTone = isPublished
                                    ? 'bg-success/5'
                                    : isSending
                                        ? 'bg-ai/5'
                                        : isSkipped
                                            ? 'bg-muted/30 opacity-60'
                                            : isSelected
                                                ? 'bg-background hover:bg-muted/30'
                                                : 'bg-muted/10 hover:bg-muted/30 opacity-70'

                                return (
                                    <li key={job.id} className={`flex items-center transition-colors ${rowTone}`}>
                                        <label className={`flex items-center gap-3 px-4 py-2.5 flex-1 min-w-0 ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                disabled={!isInteractive}
                                                onChange={() => isInteractive && toggle(job.id)}
                                                aria-label={`Select ${job.customer}`}
                                                className="h-4 w-4 rounded border-border accent-foreground disabled:opacity-50"
                                            />
                                            <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${REGION_BADGE[job.region as Region]}`}>
                                                {REGION_LABEL[job.region as Region]}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5 flex-wrap">
                                                    <span className="truncate">{job.customer}</span>
                                                    {isSending && (
                                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-ai/15 text-ai uppercase tracking-wider">
                                                            <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                                            Sending
                                                        </span>
                                                    )}
                                                    {isPublished && (
                                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-success/15 text-success uppercase tracking-wider">
                                                            <Sparkles className="h-2.5 w-2.5" />
                                                            Published
                                                        </span>
                                                    )}
                                                    {isSkipped && (
                                                        <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider">
                                                            Skipped
                                                        </span>
                                                    )}
                                                    {job.isAnchor && (
                                                        <span className="inline-flex items-center text-[9px] font-bold px-1 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 uppercase tracking-wider">
                                                            Anchor
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground truncate">
                                                    {job.project} · {job.iqJobIds.join(', ')}
                                                </div>
                                            </div>
                                            <div className="text-xs font-mono text-muted-foreground tabular-nums shrink-0 hidden sm:block">
                                                {job.startDate}
                                            </div>
                                            <div className="text-[11px] font-semibold text-foreground tabular-nums shrink-0">
                                                {job.crewSize}-crew · {job.durationDays}d
                                            </div>
                                        </label>
                                                        {onViewJob && !isBulkPublishing && (
                                            <button
                                                type="button"
                                                onClick={() => onViewJob(job.id)}
                                                title={isPublished ? 'View Outlook entry detail' : 'View install detail'}
                                                aria-label={`View detail for ${job.customer}`}
                                                className="shrink-0 mr-3 p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>

                {/* Footer · two modes:
                    - default · breakdown + Cancel/Publish CTAs
                    - bulk publishing · progress bar + "Sending X of N" status */}
                {isBulkPublishing ? (
                    <footer className="p-3 border-t border-border bg-muted/20 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs">
                                {bulkAllDone ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                        <span className="font-bold text-foreground">
                                            All {bulkTotal} jobs sent to Outlook
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin text-ai" />
                                        <span className="font-semibold text-foreground">
                                            Publishing to Outlook · <span className="tabular-nums">{bulkSent}</span> of <span className="tabular-nums">{bulkTotal}</span> sent
                                        </span>
                                    </>
                                )}
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider tabular-nums">
                                {Math.round((bulkSent / Math.max(bulkTotal, 1)) * 100)}%
                            </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ease-out ${bulkAllDone ? 'bg-success' : 'bg-ai'}`}
                                style={{ width: `${(bulkSent / Math.max(bulkTotal, 1)) * 100}%` }}
                            />
                        </div>
                    </footer>
                ) : (
                    <footer className="p-3 border-t border-border bg-muted/20 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="font-semibold">Breakdown:</span>
                            {(['ny', 'nj', 'pa'] as Region[]).map(r => (
                                <span key={r} className="inline-flex items-center gap-1">
                                    <span className={`inline-flex items-center text-[9px] font-bold px-1 py-0.5 rounded uppercase tracking-wider ${REGION_BADGE[r]}`}>
                                        {REGION_LABEL[r]}
                                    </span>
                                    <span className="tabular-nums text-foreground font-semibold">{regionBreakdown[r]}</span>
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-1.5 text-xs font-semibold rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={selectedCount === 0}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-foreground text-background hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                            >
                                <Send className="h-3 w-3" />
                                Publish {selectedCount}
                            </button>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    )
}
