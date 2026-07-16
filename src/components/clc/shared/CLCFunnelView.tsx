import { MoreHorizontal, Sparkles } from 'lucide-react'
import type { InstallJob, Region } from './installScheduleData'
import { REGION_LABEL } from './installScheduleData'
import JobQuickActions from './JobQuickActions'

interface CLCFunnelViewProps {
    jobs: InstallJob[]
    queuedJobIds: Set<string>
    highlightedJobId?: string | null
    onPublish?: (jobId: string) => void
    onView?: (jobId: string) => void
    onSkip?: (jobId: string) => void
    /** When set, the View action of that specific job pulses to draw attention.
        Used in step 1.1 when the notification CTA redirects to a job. */
    pulseViewActionForJobId?: string | null
    /** Jobs currently in the ~1200ms publish simulation · their action
        column renders a "Sending…" indicator instead of the buttons. */
    publishingJobIds?: Set<string>
    /** Reschedule request handler · opens the ViewJobPanel with the date
        editor pre-expanded. Passed to JobQuickActions when defined. */
    onReschedule?: (jobId: string) => void
}

type FunnelStage = 'pulled' | 'reviewed' | 'scheduled' | 'in-flight' | 'complete'

/**
 * 5-stage funnel view of install jobs by lifecycle status.
 * Layout aligned with OfficeworksFunnel · card structure: avatar +
 * title/subtitle + description + divider + footer.
 *
 * Column header uses `text-foreground` (high contrast) for the label and
 * a small colored dot for the per-stage semantic accent — keeps the visual
 * variety without sacrificing readability. Officeworks does the same:
 * semantic color tokens only paint the column with the "active" Metro Legal
 * card · everything else is text-foreground.
 */
const STAGES: { id: FunnelStage; label: string; dot: string }[] = [
    { id: 'pulled',    label: 'Pulled from IQ', dot: 'bg-ai'      },
    { id: 'reviewed',  label: 'Reviewed',       dot: 'bg-info'    },
    { id: 'scheduled', label: 'Scheduled',      dot: 'bg-warning' },
    { id: 'in-flight', label: 'In-flight',      dot: 'bg-primary' },
    { id: 'complete',  label: 'Complete',       dot: 'bg-success' },
]

function jobStage(job: InstallJob): FunnelStage {
    if (job.status === 'complete')   return 'complete'
    if (job.status === 'in-flight')  return 'in-flight'
    if (job.status === 'scheduled')  return 'scheduled'
    if (job.status === 'pending' && job.aiScheduled) return 'reviewed'
    return 'pulled'
}

// Avatar tokens per region · stronger contrast than the Officeworks
// bg-{token}/20 pattern · those low-alpha bg + semantic text combos read
// poorly on white. Use higher-saturation light/dark tone pairs (same
// pattern as the REGION_BADGE used elsewhere).
const REGION_AVATAR_BG: Record<Region, string> = {
    ny: 'bg-blue-100 dark:bg-blue-500/30',
    nj: 'bg-amber-100 dark:bg-amber-500/30',
    pa: 'bg-emerald-100 dark:bg-emerald-500/30',
}
const REGION_AVATAR_TEXT: Record<Region, string> = {
    ny: 'text-blue-800 dark:text-blue-200',
    nj: 'text-amber-800 dark:text-amber-200',
    pa: 'text-emerald-800 dark:text-emerald-200',
}

export default function CLCFunnelView({ jobs, queuedJobIds, highlightedJobId, onPublish, onView, onSkip, pulseViewActionForJobId, publishingJobIds, onReschedule }: CLCFunnelViewProps) {
    const byStage: Record<FunnelStage, InstallJob[]> = {
        pulled:     [],
        reviewed:   [],
        scheduled:  [],
        'in-flight': [],
        complete:   [],
    }
    for (const job of jobs) byStage[jobStage(job)].push(job)

    const regionsCount = new Set(jobs.map(j => j.region)).size

    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Outer header · same shape as OfficeworksFunnel Spec Check Pipeline header */}
            <div className="flex items-start justify-between gap-4 p-5 pb-3 border-b border-border flex-wrap">
                <div>
                    <h3 className="text-base font-bold text-foreground">Install Pipeline</h3>
                    <p className="text-sm text-muted-foreground">Director of Operations · {jobs.length} active install jobs across {regionsCount} region{regionsCount !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Kanban content */}
            <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {STAGES.map(stage => {
                        const cards = byStage[stage.id]
                        return (
                            <div key={stage.id} className="space-y-3 min-h-[200px]">
                                {/* Column header — label uses text-foreground (high contrast) ·
                                    the semantic accent lives in the small colored dot to its left */}
                                <div className="flex items-center justify-between mb-1 px-1">
                                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                                        <span className={`inline-block h-2 w-2 rounded-full ${stage.dot}`} aria-hidden="true" />
                                        {stage.label}
                                        <span className="bg-muted text-foreground text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums">{cards.length}</span>
                                    </h4>
                                    <button className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Column options" aria-label="Column options">
                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {cards.length === 0 ? (
                                    <div className="border-2 border-dashed border-border rounded-xl p-5 text-center">
                                        <p className="text-xs text-muted-foreground">No projects</p>
                                    </div>
                                ) : (
                                    cards.map(job => (
                                        <JobCard
                                            key={job.id}
                                            job={job}
                                            queued={queuedJobIds.has(job.id)}
                                            highlighted={highlightedJobId === job.id}
                                            pulseView={pulseViewActionForJobId === job.id}
                                            isPublishing={publishingJobIds?.has(job.id) ?? false}
                                            onPublish={onPublish}
                                            onView={onView}
                                            onSkip={onSkip}
                                            onReschedule={onReschedule}
                                        />
                                    ))
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// ─── Card · aligned with Officeworks context card layout ────────────────────

function JobCard({ job, queued, highlighted, pulseView, isPublishing, onPublish, onView, onSkip, onReschedule }: {
    job: InstallJob
    queued: boolean
    highlighted: boolean
    pulseView: boolean
    isPublishing: boolean
    onPublish?: (jobId: string) => void
    onView?: (jobId: string) => void
    onSkip?: (jobId: string) => void
    onReschedule?: (jobId: string) => void
}) {
    const avatarBg = REGION_AVATAR_BG[job.region as Region]
    const avatarText = REGION_AVATAR_TEXT[job.region as Region]
    const regionLabel = REGION_LABEL[job.region as Region]
    const vendorSummary = job.vendors.length === 1 ? job.vendors[0] : `${job.vendors[0]} +${job.vendors.length - 1}`
    const hasActions = !!(onPublish && onView && onSkip)

    return (
        <div
            className={`relative rounded-2xl border bg-card p-3.5 space-y-2.5 shadow-sm transition-shadow ${
                job.justArrived ? 'border-ai/40 ring-2 ring-ai/30 ring-offset-2 ring-offset-background' :
                highlighted    ? 'border-destructive/40 ring-2 ring-destructive/20' :
                queued         ? 'border-warning/40' :
                                 'border-border hover:shadow-md'
            } ${job.skipped ? 'opacity-50 grayscale' : ''}`}
            title={`${job.customer} · ${job.crewSize} crew · ${job.iqJobIds.length} IQ job${job.iqJobIds.length > 1 ? 's' : ''}`}
        >
            {job.justArrived && (
                <div className="absolute -top-2 -right-2 text-[9px] font-bold uppercase tracking-wider bg-ai text-background px-2 py-0.5 rounded-full shadow-md animate-pulse">
                    Just arrived
                </div>
            )}
            <div className="flex items-center gap-2.5">
                <div className={`h-8 w-8 rounded-full ${avatarBg} flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-zinc-900`}>
                    <span className={`text-[10px] font-black ${avatarText}`}>{regionLabel}</span>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">{job.customer}</span>
                        {(job.aiScheduled || job.publishedToOutlook) && (
                            <Sparkles className="h-3 w-3 text-foreground shrink-0" aria-label="Strata signal" />
                        )}
                        {job.isAnchor && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 uppercase tracking-wider shrink-0">
                                Anchor
                            </span>
                        )}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{job.project}</div>
                </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                {vendorSummary} · {job.crewSize}-crew install · {job.iqJobIds.length} IQ job{job.iqJobIds.length > 1 ? 's' : ''}
            </p>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground truncate">{job.startDate}</span>
                <span className="font-semibold text-foreground tabular-nums">{queued ? 'Queued · IQ batch' : `${job.durationDays}d`}</span>
            </div>

            {hasActions && (
                <JobQuickActions
                    job={job}
                    variant="card"
                    pulseView={pulseView}
                    isPublishing={isPublishing}
                    onPublish={onPublish!}
                    onView={onView!}
                    onSkip={onSkip!}
                    onReschedule={onReschedule}
                />
            )}
        </div>
    )
}
