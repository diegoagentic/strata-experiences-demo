import { useEffect, useMemo, useRef, useState } from 'react'
import { useDemo } from '../../context/DemoContext'
import { Database, RefreshCw, Clock, Sparkles, ArrowRight, Send, Users, X, Loader2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react'
import WeekCalendarGrid from './shared/WeekCalendarGrid'
import CLCCapacityWarningPanel from './shared/CLCCapacityWarningPanel'
import CLCViewToggle, { type ViewMode } from './shared/CLCViewToggle'
import CLCFilterBar from './shared/CLCFilterBar'
import CLCSummaryChipsBar, { type SummaryChip } from './shared/CLCSummaryChipsBar'
import CLCFunnelView from './shared/CLCFunnelView'
import CLCJobListView from './shared/CLCJobListView'
import CLCPublishModal from './shared/CLCPublishModal'
import CLCToastStack from './shared/CLCToastStack'
import CLCIngestionOverlay from './shared/CLCIngestionOverlay'
import CLCRescheduleConfirmModal from './shared/CLCRescheduleConfirmModal'
import {
    INITIAL_JOBS, INBOUND_JOB, REGION_BADGE, REGION_LABEL, CAPACITY_BY_REGION,
    INITIAL_ANCHOR_MONDAY, generateWeeks, shiftMondayByWeeks, mondayOfWeek,
    type InstallJob, type Region,
} from './shared/installScheduleData'

type CalendarPeriod = '1w' | '4w' | '6w'
const PERIOD_WEEKS: Record<CalendarPeriod, number> = { '1w': 1, '4w': 4, '6w': 6 }
const PERIOD_LABEL: Record<CalendarPeriod, string> = { '1w': '1 week', '4w': '4 weeks', '6w': '6 weeks' }

/**
 * Flow 1 · Calendar Sync (refactored to scene shell).
 *
 * Architecture:
 *   header (title + sync pill + Resync) — persistent
 *   summary chips bar — persistent · chips double as floating-panel triggers
 *   filter bar — persistent
 *   view toggle (Funnel · List · Calendar) — persistent
 *   body (1 of 3 views) — only this swaps per step
 *   step hint footer — varies per step
 *
 * Per-step behavior:
 *   clc1.1 → list view · all chips visible · no drag · no auto-open
 *   clc1.2 → list → calendar autoswap @1500ms · calendar chip pulses · no drag
 *   clc1.3 → calendar · drag enabled · queued chip pulses on each drop
 *   clc1.4 → calendar · alert chip pulses red + auto-opens capacity popover
 */
export default function CLCCalendarScene() {
    const { currentStep, nextStep, stepClickCount } = useDemo()
    const stepId = currentStep?.id

    // Job state (drag-drop reschedules these via WeekCalendarGrid)
    const [jobs, setJobs] = useState<InstallJob[]>(INITIAL_JOBS)
    const [queuedJobIds, setQueuedJobIds] = useState<Set<string>>(new Set())

    // Narrative interaction state (Phase C)
    const [inboundDelivered, setInboundDelivered] = useState(false)
    const [publishedJobIds, setPublishedJobIds] = useState<Set<string>>(new Set())
    const [skippedJobIds, setSkippedJobIds] = useState<Set<string>>(new Set())
    const [viewPanelJobId, setViewPanelJobId] = useState<string | null>(null)
    // Set by the Action Center notification CTA in step 1.1 · forces calendar
    // mode, highlights the inbound job, and pulses its View button so the
    // user has a clear next gesture (click View → opens the install detail
    // panel). Cleared when the user clicks View (or step changes).
    const [inboundReviewJobId, setInboundReviewJobId] = useState<string | null>(null)
    const userClickedPublishAllRef = useRef(false)

    // Bulk-publish modal · the Publish all to Outlook button opens this
    // instead of advancing directly · the user reviews & selects what to send.
    const [publishModalOpen, setPublishModalOpen] = useState(false)
    // The wave of jobIds currently being published in bulk · null when no
    // bulk wave is in flight. Drives the modal's footer mode (progress UI
    // vs the normal Cancel/Publish CTAs) and is what the modal watches to
    // compute the live "X of N sent" count.
    const [bulkPublishIds, setBulkPublishIds] = useState<string[] | null>(null)

    // Resync animation · the IQ pull is read-only but the operator still
    // needs to refresh on demand. State drives the spinner + the pill label.
    const [isResyncing, setIsResyncing] = useState(false)
    const [syncLabel, setSyncLabel] = useState('Synced from IQ · 2 min ago')

    // Per-job publish simulation · between Send click and the Published
    // terminal state, the job sits in publishingJobIds for ~1200ms so the
    // UI can render a "Sending…" indicator (toast fires on completion).
    const [publishingJobIds, setPublishingJobIds] = useState<Set<string>>(new Set())

    // Ingestion overlay · plays for ~2350ms after the Action Center CTA
    // click, before the actual scene redirect. Diego asked for a beat
    // that shows Strata doing real work instead of an instant teleport.
    const [ingestionInProgress, setIngestionInProgress] = useState(false)

    // Calendar period + anchor · drives the weeks rendered in calendar view.
    // 1w/4w/6w lets the operator zoom in for a single week or zoom out to
    // the long-range capacity view. The anchor moves with prev/next so they
    // can see jobs scheduled into future months.
    const [calendarPeriod, setCalendarPeriod] = useState<CalendarPeriod>('6w')
    const [calendarAnchor, setCalendarAnchor] = useState<string>(INITIAL_ANCHOR_MONDAY)

    // Pending reschedule confirmation · populated in clc1.3 when the user
    // drags/picks a new date. Drives the CLCRescheduleConfirmModal · Accept
    // commits the move + advances to clc1.4 · Cancel just closes.
    const [pendingReschedule, setPendingReschedule] = useState<{
        jobId: string
        newStart: string
        isAiSuggested: boolean
    } | null>(null)

    // When the operator triggers Reschedule from a List/Funnel row, we want
    // the ViewJobPanel to open with the date editor already expanded · skips
    // the extra click. Cleared when the panel closes.
    const [viewPanelStartInReschedule, setViewPanelStartInReschedule] = useState(false)

    // View mode (step-aware default + user override)
    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const [pulseMode, setPulseMode] = useState<ViewMode | null>(null)
    // Use a ref (not state) so toggling inside a step does NOT re-trigger
    // the per-step useEffect — which would race with the autoswap timer
    // and cause Step 1.1 to never switch to Calendar.
    const userToggledRef = useRef(false)
    // Track the last stepId we ran setup for, so re-renders that don't
    // actually change the step don't re-run the per-step logic (and don't
    // cancel the in-flight autoswap timer).
    const lastStepRef = useRef<string | null>(null)
    // Track the stepClickCount we last reacted to · when this differs from
    // the current one, the user navigated via the sidebar and we reset
    // interaction state (instead of preserving it like nextStep does).
    const lastClickCountRef = useRef<number | null>(null)
    // Live ref to the current stepId · used inside setTimeout closures
    // (handlePublish / handlePublishSelected) to check the step at
    // COMPLETION time rather than CLICK time. Without this, rapid
    // individual sends in 1.1 would each fire nextStep at completion and
    // skip past 1.2.
    const stepIdRef = useRef<string | undefined>(stepId)
    useEffect(() => { stepIdRef.current = stepId }, [stepId])

    // Filter state
    const [statuses, setStatuses] = useState<string[]>([])
    const [customerQuery, setCustomerQuery] = useState('')
    const [regionFilter, setRegionFilter] = useState<Region | 'all'>('all')
    const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null)

    // ─── Per-step wiring ──────────────────────────────────────────────────
    // Idempotent setup per step entry. The lastStepRef gate ensures unrelated
    // re-renders (e.g. from filter state) do NOT re-run the per-step block ·
    // crucial because the autoswap setTimeout would otherwise be re-scheduled
    // or cancelled by every re-render.
    useEffect(() => {
        if (!stepId) return

        const stepIdChanged = lastStepRef.current !== stepId
        const clickCountChanged = lastClickCountRef.current !== null && lastClickCountRef.current !== stepClickCount
        if (!stepIdChanged && !clickCountChanged) return

        // Sidebar re-entry · wipe interaction state so the demo replays
        // cleanly. nextStep/prevStep advance stepId without incrementing
        // stepClickCount, so they fall through this branch and preserve
        // state (the autoswap → published narrative depends on that).
        if (clickCountChanged) {
            setPublishedJobIds(new Set())
            setSkippedJobIds(new Set())
            setQueuedJobIds(new Set())
            setInboundDelivered(false)
            setPublishingJobIds(new Set())
            setIngestionInProgress(false)
            setViewPanelJobId(null)
            setPublishModalOpen(false)
            setBulkPublishIds(null)
            setPendingReschedule(null)
            setViewPanelStartInReschedule(false)
            setJobs(INITIAL_JOBS)   // restore original Fairport start date etc.
            userClickedPublishAllRef.current = false
        }

        lastStepRef.current = stepId
        lastClickCountRef.current = stepClickCount
        userToggledRef.current = false
        // Always reset the review-target on step transitions · it's a 1.1-only
        // affordance and would leak into 1.2+ otherwise.
        setInboundReviewJobId(null)

        // eslint-disable-next-line no-console
        console.log('[CLC] enter step', stepId, { clickCountChanged })

        if (stepId === 'clc1.1') {
            setViewMode('list')
            setPulseMode(null)
            // Narrative: a new job arrives from IQ 1500ms after entering.
            setInboundDelivered(false)
            const inboundT = setTimeout(() => setInboundDelivered(true), 1500)
            return () => clearTimeout(inboundT)
        }
        if (stepId === 'clc1.2') {
            // Two paths:
            //   A) User used a Publish affordance in 1.1 → fastPath · the
            //      user made an explicit choice already · just swap views,
            //      do NOT override with a bulk-mark.
            //   B) User advanced via sidebar/Next without publishing →
            //      existing 1500ms autoswap + bulk-mark fallback so the
            //      demo state still reads "everything sent".
            const fastPath = userClickedPublishAllRef.current
            setViewMode('list')
            setPulseMode('calendar')
            const delay = fastPath ? 500 : 1500
            // Beat between visualization render and the 1.3 auto-bridge ·
            // long enough for the user to absorb the published calendar.
            const BRIDGE_TO_13_MS = 3200
            setTimeout(() => {
                if (userToggledRef.current) return
                setViewMode('calendar')
                setPulseMode(null)
                if (!fastPath) {
                    setPublishedJobIds(prev => {
                        const next = new Set(prev)
                        for (const j of jobs) {
                            if (!skippedJobIds.has(j.id)) next.add(j.id)
                        }
                        if (inboundDelivered && !skippedJobIds.has(INBOUND_JOB.id)) {
                            next.add(INBOUND_JOB.id)
                        }
                        return next
                    })
                }
                // Auto-bridge to clc1.3 (drag-drop reschedule) once the
                // calendar has rendered · only fires when:
                //   · we came from the publish path (fastPath)
                //   · we're still in 1.2 at completion time
                //   · the user hasn't toggled a view (they're not exploring)
                //   · the demo isn't paused
                if (fastPath) {
                    setTimeout(() => {
                        if (stepIdRef.current !== 'clc1.2') return
                        if (userToggledRef.current) return
                        nextStep()
                    }, BRIDGE_TO_13_MS)
                }
            }, delay)
            return
        }
        if (stepId === 'clc1.3') {
            setViewMode('calendar')
            setPulseMode(null)
            return
        }
        if (stepId === 'clc1.4') {
            setViewMode('calendar')
            setPulseMode(null)
            return
        }
        // Any other step · cleanup the inbound flag so it doesn't leak.
        setInboundDelivered(false)
    }, [stepId, stepClickCount])  // eslint-disable-line react-hooks/exhaustive-deps

    const handleViewChange = (m: ViewMode) => {
        setViewMode(m)
        userToggledRef.current = true
        setPulseMode(null)
    }

    // ─── Drag-drop · commit primitive ─────────────────────────────────────
    /** Pure state mutation · moves the job + queues for IQ batch sync.
        Does NOT advance the step or open any modal · the wrappers below
        decide whether the move goes through the confirmation gate first. */
    const commitReschedule = (jobId: string, newStart: string) => {
        setJobs(prev => prev.map(j => {
            if (j.id !== jobId) return j
            const [oy, om, od] = newStart.split('-').map(Number)
            const startUTC = Date.UTC(oy, om - 1, od)
            const endUTC = startUTC + (j.durationDays - 1) * 86400000
            const endDate = new Date(endUTC).toISOString().slice(0, 10)
            return { ...j, startDate: newStart, endDate }
        }))
        setQueuedJobIds(prev => new Set(prev).add(jobId))
        window.dispatchEvent(new CustomEvent('clc:calendar-writeback-queued', { detail: { jobId, newStart } }))
    }

    /** Drag-drop and date-picker entry point · in clc1.3 every reschedule
        runs through the confirm modal (Strata-AI framing when the date
        matches the suggestion · neutral framing otherwise). Outside 1.3
        the move commits immediately (current behavior preserved). */
    const handleJobDrop = (jobId: string, newStart: string) => {
        if (stepId === 'clc1.3') {
            const job = displayedJobs.find(j => j.id === jobId)
            const isAiSuggested = !!job?.aiSuggestedDate && job.aiSuggestedDate === newStart
            setPendingReschedule({ jobId, newStart, isAiSuggested })
            return
        }
        commitReschedule(jobId, newStart)
    }

    // ─── Calendar period · nav · reschedule auto-shift ────────────────────
    const visibleWeeks = useMemo(
        () => generateWeeks(calendarAnchor, PERIOD_WEEKS[calendarPeriod]),
        [calendarAnchor, calendarPeriod],
    )
    const shiftCalendar = (deltaWeeksUnit: number) => {
        const stride = PERIOD_WEEKS[calendarPeriod]
        setCalendarAnchor(prev => shiftMondayByWeeks(prev, deltaWeeksUnit * stride))
    }
    const goToToday = () => setCalendarAnchor(INITIAL_ANCHOR_MONDAY)
    /** Reschedule a job to an arbitrary date · used by ViewJobPanel's
        inline date picker AND the per-card calendar popover. Same confirm
        gate as handleJobDrop · clc1.3 routes through the modal, other
        steps commit immediately. Also auto-shifts the calendar anchor
        when the new date is outside the currently visible window. */
    const handleReschedule = (jobId: string, newStart: string) => {
        handleJobDrop(jobId, newStart)
        const newMonday = mondayOfWeek(newStart)
        const inWindow = visibleWeeks.some(w => w.monday === newMonday)
        if (!inWindow) {
            setCalendarAnchor(newMonday)
            setViewMode('calendar')
            userToggledRef.current = true
        }
    }

    /** Reschedule request from a List or Funnel row · opens ViewJobPanel
        with the date editor pre-expanded. The calendar view uses the
        inline popover from WeekCalendarGrid instead · this handler is
        passed only to the non-calendar views. */
    const handleRescheduleRequest = (jobId: string) => {
        setViewPanelJobId(jobId)
        setViewPanelStartInReschedule(true)
    }

    /** Confirm-modal callbacks · accept commits + advances, cancel just closes. */
    const handleConfirmReschedule = () => {
        if (!pendingReschedule) return
        commitReschedule(pendingReschedule.jobId, pendingReschedule.newStart)
        // Auto-shift the calendar window if the new date is off-screen.
        const newMonday = mondayOfWeek(pendingReschedule.newStart)
        if (!visibleWeeks.some(w => w.monday === newMonday)) {
            setCalendarAnchor(newMonday)
            setViewMode('calendar')
            userToggledRef.current = true
        }
        setPendingReschedule(null)
        // Any reschedule in 1.3 bridges to 1.4 · matches the publish-bridge
        // pattern from 1.1 (every commit is a narrative step).
        if (stepIdRef.current === 'clc1.3') {
            nextStep()
        }
    }
    const handleCancelReschedule = () => setPendingReschedule(null)

    // ─── Per-card quick actions ───────────────────────────────────────────
    const handlePublish = (jobId: string) => {
        // Idempotent · ignore re-clicks while the job is in-flight.
        if (publishingJobIds.has(jobId) || publishedJobIds.has(jobId)) return
        setPublishingJobIds(prev => new Set(prev).add(jobId))
        // Capture the customer name now · displayedJobs may change between
        // click and timeout, but the name is stable for this jobId.
        const customer = displayedJobs.find(j => j.id === jobId)?.customer ?? 'Install job'
        setTimeout(() => {
            setPublishingJobIds(prev => {
                const next = new Set(prev)
                next.delete(jobId)
                return next
            })
            setPublishedJobIds(prev => new Set(prev).add(jobId))
            // Toast lives in CLCToastStack · driven by this event.
            window.dispatchEvent(new CustomEvent('clc:job-published', {
                detail: { jobId, customer },
            }))
            // If the install detail panel is open on this job, close it
            // so the user sees their action reflected in the calendar.
            setViewPanelJobId(prev => (prev === jobId ? null : prev))
            // Bridge to 1.2 · any explicit publish in 1.1 advances the
            // narrative (matches the bulk modal flow so every Send affordance
            // converges on the visualization step). stepIdRef check makes
            // rapid sends collapse to a single nextStep instead of skipping
            // past 1.2.
            if (stepIdRef.current === 'clc1.1') {
                userClickedPublishAllRef.current = true   // preserve the user's explicit selection · 1.2 won't bulk-mark
                setPublishModalOpen(false)                 // close any open bulk modal too
                nextStep()
            }
        }, 1200)
    }
    const handleSkip = (jobId: string) =>
        setSkippedJobIds(prev => new Set(prev).add(jobId))
    const handleView = (jobId: string) => {
        setViewPanelJobId(jobId)
        // Clicking the pulsing View action completes the guided redirect ·
        // stop pulsing so it doesn't compete with the open modal.
        setInboundReviewJobId(prev => (prev === jobId ? null : prev))
    }
    const handlePublishAll = () => {
        // Opens the bulk-publish modal · the actual publish + step advance
        // happens in handlePublishSelected once the user confirms.
        setPublishModalOpen(true)
    }
    const handlePublishSelected = (selectedIds: Set<string>) => {
        userClickedPublishAllRef.current = true
        const idsArray = Array.from(selectedIds)
        if (idsArray.length === 0) {
            setPublishModalOpen(false)
            nextStep()
            return
        }
        // Open the bulk wave · drives modal into progress-UI mode and
        // queues every selected job into publishingJobIds at once. The
        // modal then renders per-row Sending pills as the stagger fires.
        setBulkPublishIds(idsArray)
        setPublishingJobIds(prev => {
            const next = new Set(prev)
            for (const id of idsArray) next.add(id)
            return next
        })
        // Adaptive stagger · keeps the total wave between ~1.6s (few jobs)
        // and ~2.6s (many jobs) so it never feels instant or tedious.
        const stagger = Math.max(110, Math.min(260, Math.floor(1800 / idsArray.length)))
        const INITIAL_DELAY = 220
        const FINAL_PAUSE = 700
        idsArray.forEach((id, idx) => {
            setTimeout(() => {
                setPublishingJobIds(prev => {
                    const next = new Set(prev)
                    next.delete(id)
                    return next
                })
                setPublishedJobIds(prev => new Set(prev).add(id))
            }, INITIAL_DELAY + idx * stagger)
        })
        setTimeout(() => {
            // Summary toast · listened to by CLCToastStack via the count-only payload.
            window.dispatchEvent(new CustomEvent('clc:bulk-published', {
                detail: { count: idsArray.length },
            }))
            setBulkPublishIds(null)
            setPublishModalOpen(false)
            // Guard · only advance if we're still in 1.1 at completion time
            // (an individual handlePublish from inside the modal may have
            // already triggered the transition before the wave finished).
            if (stepIdRef.current === 'clc1.1') {
                nextStep()
            }
        }, INITIAL_DELAY + idsArray.length * stagger + FINAL_PAUSE)
    }
    const handleResync = () => {
        if (isResyncing) return
        setIsResyncing(true)
        setSyncLabel('Pulling from IQ…')
        // Read-only re-pull · IQ has no write-back, but the operator can
        // refresh the source data on demand. Short animation feels like a
        // real round-trip without faking heavy network work.
        setTimeout(() => {
            setIsResyncing(false)
            setSyncLabel('Synced from IQ · just now')
        }, 1200)
    }

    // Listen for the Action Center notification CTA · instead of opening
    // the modal directly, run a two-stage guided experience:
    //   stage 1 · Strata ingestion overlay plays for ~2.3s (showing the AI
    //              pulling the IQ job, parsing the vendor schedule, and
    //              checking capacity).
    //   stage 2 · once the overlay finishes, redirect to calendar mode +
    //              highlight the inbound job + pulse its View button.
    useEffect(() => {
        const handler = () => setIngestionInProgress(true)
        window.addEventListener('clc:inbound-job-open', handler)
        return () => window.removeEventListener('clc:inbound-job-open', handler)
    }, [])
    const handleIngestionComplete = () => {
        setIngestionInProgress(false)
        setViewMode('calendar')
        userToggledRef.current = true   // prevent any in-flight autoswap from overriding
        setInboundDelivered(true)        // safety · if the CTA fires before the delivery timer
        setInboundReviewJobId('job-troy')
    }

    // ─── Display pipeline ─────────────────────────────────────────────────
    // Inject INBOUND_JOB only during clc1.1 (after delivery). Apply
    // per-job state flags so views render published/skipped/just-arrived.
    const displayedJobs = useMemo(() => {
        const arr: InstallJob[] = [...jobs]
        if (stepId === 'clc1.1' && inboundDelivered) {
            arr.push({ ...INBOUND_JOB, justArrived: true })
        }
        return arr.map(j => ({
            ...j,
            publishedToOutlook: publishedJobIds.has(j.id),
            skipped: skippedJobIds.has(j.id),
        }))
    }, [jobs, stepId, inboundDelivered, publishedJobIds, skippedJobIds])

    // ─── Filter pipeline ──────────────────────────────────────────────────
    const filteredJobs = useMemo(() => {
        return displayedJobs.filter(j => {
            if (statuses.length > 0 && !statuses.includes(j.status)) return false
            if (regionFilter !== 'all' && j.region !== regionFilter) return false
            if (customerQuery && !j.customer.toLowerCase().includes(customerQuery.toLowerCase())) return false
            if (dateRange) {
                if (j.startDate < dateRange.from) return false
                if (j.startDate > dateRange.to) return false
            }
            return true
        })
    }, [displayedJobs, statuses, regionFilter, customerQuery, dateRange])

    // ─── Summary chips ────────────────────────────────────────────────────
    const alertCount = CAPACITY_BY_REGION.filter(r => r.status === 'red').length
    const regionCounts = useMemo(() => {
        const c: Record<Region, number> = { ny: 0, nj: 0, pa: 0 }
        for (const j of filteredJobs) c[j.region]++
        return c
    }, [filteredJobs])

    // 1.4 no longer auto-opens the capacity chip on entry · "se abría de la
    // nada". Instead the Action Center fires a notification with a CTA, the
    // alert chip pulses on the toolbar, and the AI-flag pill on Fairport
    // dispatches the same open event · all three converge on the chip via
    // window.dispatchEvent('clc:open-chip', { chipId: 'alert' }).
    const autoOpenChipId = null

    // Capacity-warning event listener · the Action Center CTA (clc1.4
    // notification) and the AI-flag quick action both dispatch this event.
    // We forward it to the chip bar via clc:open-chip so the panel opens.
    useEffect(() => {
        const handler = () => {
            window.dispatchEvent(new CustomEvent('clc:open-chip', { detail: { chipId: 'alert' } }))
        }
        window.addEventListener('clc:capacity-warning-open', handler)
        return () => window.removeEventListener('clc:capacity-warning-open', handler)
    }, [])

    // Flow 1 → Flow 2 auto-bridge · when the operator sends either the
    // outreach (Albany) or dispatcher email from the capacity panel in
    // clc1.4, the narrative beat is "operator has handled the capacity
    // conflict · ready to proceed". We give the success toast time to
    // play (~2.5s) and then advance to clc2.1 (SharePoint seeding) so
    // the cross-flow handoff matches the documented intent.
    useEffect(() => {
        const handler = () => {
            if (stepIdRef.current !== 'clc1.4') return
            setTimeout(() => {
                if (stepIdRef.current === 'clc1.4') {
                    nextStep()
                }
            }, 2500)
        }
        window.addEventListener('clc:flow1-handled', handler)
        return () => window.removeEventListener('clc:flow1-handled', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const chips: SummaryChip[] = [
        {
            id: 'jobs',
            label: `${filteredJobs.length} jobs`,
            count: filteredJobs.length,
            tone: 'neutral',
            panelTitle: 'IQ source · install jobs',
            panel: <SourceListPanelContent jobCount={filteredJobs.length} regionCounts={regionCounts} queuedCount={queuedJobIds.size} />,
        },
        {
            id: 'alert',
            label: `${alertCount} alert${alertCount === 1 ? '' : 's'}`,
            count: alertCount,
            tone: 'warning',
            pulse: stepId === 'clc1.4',
            panelTitle: 'Capacity alerts',
            panel: (
                <div className="p-2">
                    <CLCCapacityWarningPanel stepId={stepId} />
                </div>
            ),
        },
        {
            id: 'queued',
            label: `${queuedJobIds.size} queued`,
            count: queuedJobIds.size,
            tone: 'success',
            pulse: queuedJobIds.size > 0 && stepId === 'clc1.3',
            panelTitle: 'Queued for IQ batch sync',
            panel: <QueuedJobsList queuedJobIds={queuedJobIds} jobs={displayedJobs} />,
        },
    ]

    const allowDragDrop = stepId === 'clc1.3' && viewMode === 'calendar'
    const highlightFairport = stepId === 'clc1.4' ? 'job-fairport' : null
    // AI-flag · Fairport in 1.4 gets a pulsing "Review · AI flagged" badge ·
    // click dispatches clc:capacity-warning-open to open the capacity panel.
    const aiFlaggedJobId = stepId === 'clc1.4' ? 'job-fairport' : null
    // AI suggestion currently only fires in 1.3 for Fairport · pulled from
    // the job data so the seed file is the single source of truth.
    const aiSuggestion = useMemo(() => {
        if (stepId !== 'clc1.3') return null
        const j = displayedJobs.find(j => j.aiSuggestedDate)
        if (!j || !j.aiSuggestedDate) return null
        return { jobId: j.id, targetDate: j.aiSuggestedDate, customer: j.customer }
    }, [stepId, displayedJobs])
    const pendingRescheduleJob = pendingReschedule
        ? displayedJobs.find(j => j.id === pendingReschedule.jobId) ?? null
        : null
    // In 1.3 · point the user at the Fairport card (matches the step's
    // userAction: "Drag the Fairport card from Jun 2 to Jun 5"). The visual
    // is an ai-tinted ring + "Drag me" badge — different language from the
    // red highlight used for the 1.4 capacity alert.
    const suggestDragJobId = stepId === 'clc1.3' && !queuedJobIds.has('job-fairport') ? 'job-fairport' : null
    // When the user clicked the notification CTA, the inbound job also gets
    // the highlight ring on the calendar card · same visual language as the
    // capacity-alert highlight in 1.4.
    const highlightedJobId = inboundReviewJobId ?? highlightFairport
    const showPublishAll = stepId === 'clc1.1' || stepId === 'clc1.2'
    // Disable when in 1.2 (already published) OR when there's literally
    // nothing left to send (everything's already published or skipped).
    const publishableCount = useMemo(
        () => displayedJobs.filter(j => !j.publishedToOutlook && !j.skipped).length,
        [displayedJobs],
    )
    const publishAllDisabled = publishableCount === 0 || stepId === 'clc1.2'
    const viewedJob = viewPanelJobId ? displayedJobs.find(j => j.id === viewPanelJobId) ?? null : null

    return (
        <div className="flex flex-col h-full bg-muted/5">
            {/* Header — title + subtitle only · sync/publish moved next to the view toggle */}
            <header className="flex items-start gap-4 px-5 pt-5 pb-3 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Install Schedule</h1>
                    <p className="text-sm text-muted-foreground">6-week view · Mon Jun 1 → Fri Jul 10 · {displayedJobs.length} jobs across NY/NJ/PA</p>
                </div>
            </header>

            {/* Summary chips */}
            <CLCSummaryChipsBar chips={chips} autoOpenChipId={autoOpenChipId} />

            {/* Filter bar · stays clean · filters only */}
            <CLCFilterBar
                dateRange={dateRange}
                onDateRange={setDateRange}
                statuses={statuses}
                onStatuses={setStatuses}
                customerQuery={customerQuery}
                onCustomerQuery={setCustomerQuery}
                regionFilter={regionFilter}
                onRegionFilter={setRegionFilter}
            />

            {/* Toolbar row · jobs count on the left · view toggle + data actions on the right */}
            <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-2 flex-wrap">
                <div className="text-[11px] text-muted-foreground">
                    {filteredJobs.length === jobs.length ? `${jobs.length} jobs` : `${filteredJobs.length} of ${jobs.length} jobs`}
                </div>
                <div className="inline-flex items-center gap-2 flex-wrap">
                    <CLCViewToggle value={viewMode} onChange={handleViewChange} pulse={pulseMode} />
                    {/* Divider · view-mode cluster on the left of it · data actions on the right */}
                    <span className="h-5 w-px bg-border mx-1 hidden sm:inline-block" aria-hidden />
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground px-2 py-1 rounded-md bg-muted">
                        {isResyncing ? (
                            <RefreshCw className="h-3 w-3 animate-spin text-foreground" />
                        ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        )}
                        {syncLabel}
                    </span>
                    <button
                        onClick={handleResync}
                        disabled={isResyncing}
                        title="Re-pull install jobs from IQ"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-foreground border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-60 disabled:cursor-wait"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isResyncing ? 'animate-spin' : ''}`} />
                        {isResyncing ? 'Syncing…' : 'Resync'}
                    </button>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('clc:capacity-warning-open'))}
                        title="Open the Strata capacity report (per-region load + 3rd-party suggestions)"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Capacity report
                    </button>
                    {showPublishAll && (
                        <button
                            onClick={handlePublishAll}
                            disabled={publishAllDisabled}
                            title="Publish every queued install to the Outlook calendar and advance the flow"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-background bg-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Send className="h-3.5 w-3.5" />
                            Publish all to Outlook
                        </button>
                    )}
                </div>
            </div>

            {/* Body — one view at a time */}
            <section className="flex-1 overflow-y-auto px-5 pb-5">
                {viewMode === 'funnel' && (
                    <CLCFunnelView
                        jobs={filteredJobs}
                        queuedJobIds={queuedJobIds}
                        highlightedJobId={highlightedJobId}
                        pulseViewActionForJobId={inboundReviewJobId}
                        publishingJobIds={publishingJobIds}
                        onPublish={handlePublish}
                        onView={handleView}
                        onSkip={handleSkip}
                        onReschedule={stepId === 'clc1.3' ? handleRescheduleRequest : undefined}
                    />
                )}
                {viewMode === 'list' && (
                    <CLCJobListView
                        jobs={filteredJobs}
                        queuedJobIds={queuedJobIds}
                        highlightedJobId={highlightedJobId}
                        pulseViewActionForJobId={inboundReviewJobId}
                        publishingJobIds={publishingJobIds}
                        onPublish={handlePublish}
                        onView={handleView}
                        onSkip={handleSkip}
                        onReschedule={stepId === 'clc1.3' ? handleRescheduleRequest : undefined}
                    />
                )}
                {viewMode === 'calendar' && (
                    <>
                        <div className="mb-3 flex items-center gap-3 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50/40 dark:border-blue-500/30 dark:bg-blue-500/10">
                            <span className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                                Outlook Calendar · Director of Operations · Mailbox view
                            </span>
                            <div className="ml-auto flex items-center gap-3 text-[11px] text-blue-900/80 dark:text-blue-200/80">
                                {(['ny','nj','pa'] as Region[]).map(r => (
                                    <span key={r} className="inline-flex items-center gap-1">
                                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${REGION_BADGE[r]}`}>
                                            {REGION_LABEL[r]}
                                        </span>
                                        {regionCounts[r]}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Calendar period selector · nav controls.
                            Left · prev / Today / next (stride = current period).
                            Right · 1w / 4w / 6w chip group. */}
                        <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
                            <div className="inline-flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => shiftCalendar(-1)}
                                    title={`Previous ${PERIOD_LABEL[calendarPeriod]}`}
                                    aria-label={`Previous ${PERIOD_LABEL[calendarPeriod]}`}
                                    className="p-1.5 rounded-md border border-border text-foreground hover:bg-muted transition-colors"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={goToToday}
                                    title="Jump back to Jun 1, 2026"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-border text-foreground hover:bg-muted transition-colors"
                                >
                                    <CalendarIcon className="h-3.5 w-3.5" />
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={() => shiftCalendar(1)}
                                    title={`Next ${PERIOD_LABEL[calendarPeriod]}`}
                                    aria-label={`Next ${PERIOD_LABEL[calendarPeriod]}`}
                                    className="p-1.5 rounded-md border border-border text-foreground hover:bg-muted transition-colors"
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                                <span className="ml-2 text-[11px] font-mono text-muted-foreground tabular-nums">
                                    {visibleWeeks[0]?.label} → {visibleWeeks[visibleWeeks.length - 1]?.label}
                                </span>
                            </div>
                            <div className="inline-flex items-center gap-0.5 bg-muted rounded-md p-0.5" role="group" aria-label="Calendar period">
                                {(['1w', '4w', '6w'] as CalendarPeriod[]).map(p => {
                                    const isActive = calendarPeriod === p
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setCalendarPeriod(p)}
                                            aria-pressed={isActive}
                                            className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors ${
                                                isActive
                                                    ? 'bg-card text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {PERIOD_LABEL[p]}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <WeekCalendarGrid
                            weeks={visibleWeeks}
                            jobs={filteredJobs}
                            highlightedJobId={highlightedJobId}
                            pulseViewActionForJobId={inboundReviewJobId}
                            publishingJobIds={publishingJobIds}
                            suggestDragJobId={suggestDragJobId}
                            aiSuggestion={aiSuggestion}
                            aiFlaggedJobId={aiFlaggedJobId}
                            onJobDrop={allowDragDrop ? handleJobDrop : undefined}
                            onReschedule={(stepId === 'clc1.3' || stepId === 'clc1.4') ? handleReschedule : undefined}
                            queuedJobIds={queuedJobIds}
                            onPublish={handlePublish}
                            onView={handleView}
                            onSkip={handleSkip}
                            showQuickActions={!allowDragDrop}
                        />
                    </>
                )}
            </section>

            {/* Per-step hint */}
            <StepHint stepId={stepId} />

            {/* Bulk publish modal · opened by the Publish all to Outlook header button.
                onViewJob does NOT close the modal · the install detail panel
                stacks above so the operator can review and return to the
                bulk-selection context. The ViewJobPanel below renders AFTER
                in the DOM so it sits on top despite sharing z-index. */}
            {publishModalOpen && (
                <CLCPublishModal
                    jobs={displayedJobs}
                    onClose={() => setPublishModalOpen(false)}
                    onPublish={handlePublishSelected}
                    onViewJob={(jobId) => setViewPanelJobId(jobId)}
                    publishingJobIds={publishingJobIds}
                    bulkPublishIds={bulkPublishIds}
                />
            )}

            {/* View panel · opened via per-card View action, Action Center CTA,
                or the View button inside the bulk-publish modal. Rendered last
                so it stacks above any concurrent modal. isPublishing keeps the
                panel open during the send simulation · handlePublish auto-closes
                it once the published-state is committed. */}
            {viewedJob && (
                <ViewJobPanel
                    job={viewedJob}
                    isPublishing={publishingJobIds.has(viewedJob.id)}
                    startInReschedule={viewPanelStartInReschedule}
                    onClose={() => { setViewPanelJobId(null); setViewPanelStartInReschedule(false) }}
                    onPublish={() => handlePublish(viewedJob.id)}
                    onReschedule={(newStart) => handleReschedule(viewedJob.id, newStart)}
                />
            )}

            {/* AI-or-manual reschedule confirmation · clc1.3 routes every
                handleJobDrop/handleReschedule through this gate. Accept
                commits + bridges to 1.4 · Cancel just closes. */}
            {pendingReschedule && pendingRescheduleJob && (
                <CLCRescheduleConfirmModal
                    job={pendingRescheduleJob}
                    newStart={pendingReschedule.newStart}
                    isAiSuggested={pendingReschedule.isAiSuggested}
                    onConfirm={handleConfirmReschedule}
                    onCancel={handleCancelReschedule}
                />
            )}

            {/* Strata ingestion overlay · plays when the Action Center CTA fires.
                onComplete runs the calendar redirect + highlight + pulse. */}
            {ingestionInProgress && (
                <CLCIngestionOverlay onComplete={handleIngestionComplete} />
            )}

            {/* Success toast stack · listens for clc:job-published events
                dispatched at the end of each handlePublish simulation. */}
            <CLCToastStack />
        </div>
    )
}

// ─── Floating-panel content ─────────────────────────────────────────────────

function SourceListPanelContent({ jobCount, regionCounts, queuedCount }: { jobCount: number; regionCounts: Record<Region, number>; queuedCount: number }) {
    return (
        <div className="p-3 space-y-3">
            <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground">IQ source</h3>
                <span className="text-[10px] font-semibold text-muted-foreground ml-auto uppercase tracking-wider">read-only</span>
            </div>
            <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pulled jobs</div>
                <div className="text-2xl font-bold text-foreground tabular-nums">{jobCount}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
                {(['ny','nj','pa'] as Region[]).map(r => (
                    <div key={r} className="rounded-md bg-muted/30 p-2">
                        <div className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${REGION_BADGE[r]}`}>
                            {REGION_LABEL[r]}
                        </div>
                        <div className="text-lg font-bold text-foreground tabular-nums mt-1">{regionCounts[r]}</div>
                    </div>
                ))}
            </div>
            {queuedCount > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50/60 dark:border-yellow-500/30 dark:bg-yellow-500/10 p-2.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <Clock className="h-3.5 w-3.5 text-yellow-700 dark:text-yellow-300" />
                        <span className="text-[11px] font-bold text-foreground">{queuedCount} queued for IQ batch sync</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">Next batch · 2am ET tonight.</p>
                </div>
            )}
            <p className="text-[11px] text-muted-foreground leading-relaxed">
                Strata pulls ship &amp; install dates from IQ's reporting API. Changes made here are <strong className="text-foreground">queued</strong> for the nightly batch · IQ has no write-back API.
            </p>
        </div>
    )
}

function QueuedJobsList({ queuedJobIds, jobs }: { queuedJobIds: Set<string>; jobs: InstallJob[] }) {
    const queued = jobs.filter(j => queuedJobIds.has(j.id))
    return (
        <div className="p-3 space-y-3">
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
                <h3 className="text-sm font-bold text-foreground">Queued for IQ batch sync</h3>
            </div>
            {queued.length === 0 ? (
                <p className="text-xs text-muted-foreground">No changes queued. Drag-drop a job on the calendar to queue an IQ batch update.</p>
            ) : (
                <>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Next batch · 2am ET tonight. Operator can revert until then.
                    </p>
                    <ul className="space-y-1.5">
                        {queued.map(j => (
                            <li key={j.id} className="rounded-md border border-yellow-200 bg-yellow-50/40 dark:border-yellow-500/30 dark:bg-yellow-500/10 px-2.5 py-2">
                                <div className="text-xs font-semibold text-foreground truncate">{j.customer}</div>
                                <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                    {j.iqJobIds.join(' · ')} · {j.startDate}
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    )
}

// ─── Per-step hint ──────────────────────────────────────────────────────────

function StepHint({ stepId }: { stepId: string | undefined }) {
    if (!stepId) return null
    let hint: string | null = null
    if (stepId === 'clc1.1') hint = 'Any Send action bridges to step 1.2 · use a card\'s Send for one job, the detail panel for a single review-then-send, or Publish all for the bulk review modal.'
    else if (stepId === 'clc1.2') hint = 'Calendar visualization rendered · Sparkles mark Strata-scheduled jobs. Auto-continuing to drag-drop in a moment · toggle a view to stay on this step.'
    else if (stepId === 'clc1.3') hint = 'Strata suggests moving Fairport to Mon Jun 8 (the dashed ghost slot). Drop the card there to confirm with the AI-framed modal · or pick any other cell / use 📅 Reschedule from any view for a manual override. Confirm queues for IQ batch and bridges to 1.4.'
    else if (stepId === 'clc1.4') hint = 'Strata detected an NY-region capacity conflict. Three paths to the capacity report · bell · pulsing alert chip · "Review · AI" pill on Fairport. Send the outreach draft (or contact dispatcher) and the demo auto-bridges to Flow 2 · SharePoint seeding.'
    if (!hint) return null
    return (
        <div className="px-5 py-2.5 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                {hint}
                {stepId !== 'clc1.4' && <ArrowRight className="h-3 w-3 ml-1" />}
            </p>
        </div>
    )
}

// ─── View Job panel ─────────────────────────────────────────────────────────

function ViewJobPanel({ job, onClose, onPublish, isPublishing, onReschedule, startInReschedule = false }: { job: InstallJob; onClose: () => void; onPublish: () => void; isPublishing: boolean; onReschedule?: (newStart: string) => void; startInReschedule?: boolean }) {
    const [rescheduling, setRescheduling] = useState(startInReschedule)
    const [newDate, setNewDate] = useState(job.startDate)
    // When the panel re-opens for a different job, reset the editor state.
    useEffect(() => {
        setRescheduling(startInReschedule)
        setNewDate(job.startDate)
    }, [job.id, job.startDate, startInReschedule])
    const canReschedule = !!onReschedule && !isPublishing && !job.skipped
    const commitReschedule = () => {
        if (!onReschedule) return
        if (!newDate || newDate === job.startDate) {
            setRescheduling(false)
            return
        }
        onReschedule(newDate)
        setRescheduling(false)
    }
    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                <header className="p-4 border-b border-border flex items-start justify-between gap-3">
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Install detail</div>
                        <h2 className="text-base font-bold text-foreground leading-tight">{job.customer}</h2>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{job.project}</p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </header>
                <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Region</div>
                            <div className="text-sm font-semibold text-foreground">{REGION_LABEL[job.region]} · {job.region.toUpperCase()}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Crew</div>
                            <div className="inline-flex items-center gap-1 text-sm font-semibold text-foreground"><Users className="h-3.5 w-3.5" />{job.crewSize}</div>
                        </div>
                        <div className="col-span-2">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Start</div>
                            {!rescheduling ? (
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-sm font-mono text-foreground">{job.startDate}</span>
                                    <span className="text-xs text-muted-foreground">· {job.durationDays} day{job.durationDays !== 1 ? 's' : ''}</span>
                                    {canReschedule && (
                                        <button
                                            type="button"
                                            onClick={() => { setRescheduling(true); setNewDate(job.startDate) }}
                                            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-muted px-1.5 py-0.5 rounded-md transition-colors"
                                        >
                                            <CalendarIcon className="h-3 w-3" />
                                            Reschedule
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    <input
                                        type="date"
                                        value={newDate}
                                        onChange={e => setNewDate(e.target.value)}
                                        className="px-2 py-1 text-xs font-mono bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        aria-label="New start date"
                                    />
                                    <button
                                        type="button"
                                        onClick={commitReschedule}
                                        disabled={!newDate || newDate === job.startDate}
                                        className="px-2.5 py-1 text-[10px] font-bold bg-foreground text-background rounded-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setRescheduling(false); setNewDate(job.startDate) }}
                                        className="px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <span className="text-[10px] text-muted-foreground">Queues for IQ batch sync · 2am ET</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Vendors</div>
                        <div className="flex flex-wrap gap-1">
                            {job.vendors.map(v => (
                                <span key={v} className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-border text-foreground">{v}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">IQ jobs</div>
                        <div className="flex flex-wrap gap-1">
                            {job.iqJobIds.map(id => (
                                <span key={id} className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-foreground">{id}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <footer className="p-3 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
                    <button
                        onClick={onClose}
                        disabled={isPublishing}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Close
                    </button>
                    {!job.publishedToOutlook && !job.skipped && (
                        <button
                            onClick={onPublish}
                            disabled={isPublishing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-wait"
                        >
                            {isPublishing ? (
                                <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Sending to Outlook…
                                </>
                            ) : (
                                <>
                                    <Send className="h-3 w-3" />
                                    Send to Outlook
                                </>
                            )}
                        </button>
                    )}
                </footer>
            </div>
        </div>
    )
}
