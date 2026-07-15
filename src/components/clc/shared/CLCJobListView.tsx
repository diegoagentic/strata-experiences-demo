import { useState, useMemo } from 'react'
import { Sparkles, ChevronUp, ChevronDown } from 'lucide-react'
import type { InstallJob, Region } from './installScheduleData'
import { REGION_BADGE, REGION_LABEL } from './installScheduleData'
import JobQuickActions from './JobQuickActions'

type SortKey = 'customer' | 'region' | 'startDate' | 'iqJobs' | 'status'
type SortDir = 'asc' | 'desc'

interface CLCJobListViewProps {
    jobs: InstallJob[]
    queuedJobIds: Set<string>
    highlightedJobId?: string | null
    onJobClick?: (jobId: string) => void
    onPublish?: (jobId: string) => void
    onView?: (jobId: string) => void
    onSkip?: (jobId: string) => void
    /** When set, the View action of that specific job pulses to draw attention. */
    pulseViewActionForJobId?: string | null
    /** Jobs currently in the publish simulation · render "Sending…" indicator. */
    publishingJobIds?: Set<string>
    /** Reschedule request handler · opens the ViewJobPanel with the date
        editor pre-expanded. Passed to JobQuickActions when defined. */
    onReschedule?: (jobId: string) => void
}

const STATUS_LABEL: Record<InstallJob['status'], string> = {
    pending:    'Pulled',
    scheduled:  'Scheduled',
    'in-flight': 'In-flight',
    complete:   'Complete',
}

const STATUS_TONE: Record<InstallJob['status'], string> = {
    pending:    'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    scheduled:  'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    'in-flight': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    complete:   'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
}

/**
 * Table-style list view of install jobs with sortable columns.
 * Pattern adapted from ThreeWayMatchView grid + the prior SourceListGridFallback
 * in CLCCalendarScene. Sort state is local to the view.
 */
export default function CLCJobListView({ jobs, queuedJobIds, highlightedJobId, onJobClick, onPublish, onView, onSkip, pulseViewActionForJobId, publishingJobIds, onReschedule }: CLCJobListViewProps) {
    const hasActions = !!(onPublish && onView && onSkip)
    const gridCols = hasActions ? 'grid-cols-[1fr_70px_120px_70px_110px_160px]' : 'grid-cols-[1fr_70px_120px_70px_110px_110px]'
    const [sortKey, setSortKey] = useState<SortKey>('startDate')
    const [sortDir, setSortDir] = useState<SortDir>('asc')

    const sortedJobs = useMemo(() => {
        const arr = [...jobs]
        arr.sort((a, b) => {
            let cmp = 0
            switch (sortKey) {
                case 'customer':  cmp = a.customer.localeCompare(b.customer); break
                case 'region':    cmp = a.region.localeCompare(b.region); break
                case 'startDate': cmp = a.startDate.localeCompare(b.startDate); break
                case 'iqJobs':    cmp = a.iqJobIds.length - b.iqJobIds.length; break
                case 'status':    cmp = a.status.localeCompare(b.status); break
            }
            return sortDir === 'asc' ? cmp : -cmp
        })
        return arr
    }, [jobs, sortKey, sortDir])

    const toggleSort = (key: SortKey) => {
        if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortKey(key); setSortDir('asc') }
    }

    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className={`grid ${gridCols} gap-2 px-3 py-2 bg-muted/40 border-b border-border`}>
                <SortHeader label="Project"  active={sortKey==='customer'}  dir={sortDir} onClick={() => toggleSort('customer')} />
                <SortHeader label="Region"   active={sortKey==='region'}    dir={sortDir} onClick={() => toggleSort('region')} />
                <SortHeader label="Start"    active={sortKey==='startDate'} dir={sortDir} onClick={() => toggleSort('startDate')} />
                <SortHeader label="IQ jobs"  active={sortKey==='iqJobs'}    dir={sortDir} onClick={() => toggleSort('iqJobs')} align="right" />
                <SortHeader label="Status"   active={sortKey==='status'}    dir={sortDir} onClick={() => toggleSort('status')} />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{hasActions ? 'Actions' : 'Sync'}</span>
            </div>
            <div className="divide-y divide-border">
                {sortedJobs.length === 0 ? (
                    <div className="px-3 py-8 text-center text-xs text-muted-foreground">No jobs match the current filters.</div>
                ) : sortedJobs.map(job => {
                    const isQueued = queuedJobIds.has(job.id)
                    const isHighlighted = highlightedJobId === job.id
                    return (
                        <div
                            key={job.id}
                            onClick={() => onJobClick?.(job.id)}
                            className={`grid ${gridCols} gap-2 px-3 py-2.5 items-center text-sm hover:bg-muted/30 transition-colors ${
                                job.justArrived ? 'bg-ai/10 animate-pulse' :
                                isHighlighted   ? 'bg-red-50/40 dark:bg-red-500/5' :
                                isQueued        ? 'bg-yellow-50/40 dark:bg-yellow-500/5' : ''
                            } ${job.skipped ? 'opacity-50 grayscale' : ''} ${onJobClick ? 'cursor-pointer' : ''}`}
                            role={onJobClick ? 'button' : undefined}
                        >
                            <div className="min-w-0 flex items-center gap-1.5">
                                <span className="font-semibold text-foreground truncate">{job.customer}</span>
                                {(job.aiScheduled || job.publishedToOutlook) && (
                                    <Sparkles className="h-3 w-3 text-zinc-800 dark:text-zinc-200 shrink-0" />
                                )}
                                {job.isAnchor && (
                                    <span className="inline-flex items-center text-[9px] font-bold px-1 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 uppercase tracking-wider whitespace-nowrap">
                                        Anchor
                                    </span>
                                )}
                                {job.justArrived && (
                                    <span className="inline-flex items-center text-[9px] font-bold px-1 py-0.5 rounded bg-ai/15 text-ai uppercase tracking-wider whitespace-nowrap">
                                        Just arrived
                                    </span>
                                )}
                            </div>
                            <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider w-fit ${REGION_BADGE[job.region as Region]}`}>
                                {REGION_LABEL[job.region as Region]}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">{job.startDate}</span>
                            <span className="text-xs font-bold text-foreground text-right tabular-nums">{job.iqJobIds.length}</span>
                            <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider w-fit ${STATUS_TONE[job.status]}`}>
                                {STATUS_LABEL[job.status]}
                            </span>
                            <div className="flex items-center gap-1">
                                {hasActions ? (
                                    <JobQuickActions
                                        job={job}
                                        variant="row"
                                        pulseView={pulseViewActionForJobId === job.id}
                                        isPublishing={publishingJobIds?.has(job.id) ?? false}
                                        onPublish={onPublish!}
                                        onView={onView!}
                                        onSkip={onSkip!}
                                        onReschedule={onReschedule}
                                    />
                                ) : isQueued ? (
                                    <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300 uppercase tracking-wider">
                                        Queued
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function SortHeader({ label, active, dir, onClick, align = 'left' }: { label: string; active: boolean; dir: SortDir; onClick: () => void; align?: 'left' | 'right' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors ${align === 'right' ? 'justify-end' : ''}`}
            aria-label={`Sort by ${label}`}
        >
            <span>{label}</span>
            {active && (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
        </button>
    )
}
