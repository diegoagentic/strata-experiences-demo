import { Fragment, useMemo, useState, useEffect } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, FolderTree, Sparkles, Check, CheckCircle2, AlertTriangle, ChevronRight, FileText, ArrowRight, ExternalLink, Copy, Folder, Mail, XCircle, RotateCcw, Pencil, Send, Save } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import {
    FAIRPORT_VENDOR_JOBS,
    COMMON_ASSETS,
    ASSET_TYPE_META,
    SHAREPOINT_FOLDER_URL,
    type AssetEntry,
} from './shared/assetSeedingData'
import CLCIngestionOverlay from './shared/CLCIngestionOverlay'
import AIEmailComposer from '../shared/AIEmailComposer'

interface Props {
    isOpen: boolean
    onClose: () => void
    /** Step that opened the modal · controls which stage shows first */
    initialStage?: Stage
    onPublished?: () => void
}

type Stage = 'filter' | 'review' | 'publish'

/**
 * Asset consolidation modal · refactor to mimic the OfficeworksDocumentReviewModal
 * layout shell (header + stage stepper + AI banner + split-pane 3:2 + per-row
 * status badges + CTA in the right panel). Diego pasó screenshot del Officeworks
 * modal en spec check · esa es la referencia visual.
 *
 * 3 stages (Discover/clc2.1 + Filter/clc2.2 colapsadas en un solo Filter ·
 * Diego eliminó el beat puramente narrativo de Discover, el trigger context
 * vive en el AI banner del Filter ahora):
 *   filter   · Include/exclude lists (5 IN · 2 OUT) con rationale per row · Decision summary + CTA
 *   review   · Asset list con type tabs + per-row preview                  · Asset summary + flag detail + CTA
 *   publish  · Folder structure preview + lista final                      · SharePoint URL + email draft + CTA
 */

/** Contextual AI banner per stage · single line, sits under the header. */
const STAGE_AI_BANNER: Record<Stage, string> = {
    filter:   'Trigger detected · Fairport hit Scheduled at 2:14 PM. Strata searched IQ for the customer tag and found 7 candidates · 5 in-project (TMC · KI · Smith System · Media Tech · Aurora) · 2 tag mismatch (Tappé punch order + SWBR Q4) auto-excluded · operator can override.',
    review:   '15 assets staged from the 5 IQ jobs (8 shop drawings · 5 ACKs · 1 site plan · 1 runbook). 1 vendor short-ship flagged on J-44022 ACK · operator confirms before publish.',
    publish:  'Folder structure ready · permissions set for install crew + Director of Operations · installer notification drafted with iPad-friendly link · operator reviews and sends.',
}

const STAGE_TITLE: Record<Stage, string> = {
    filter:   'Filter',
    review:   'Review',
    publish:  'Publish',
}

/** Default installer notification email · operator can edit via the
    AIEmailComposer triggered from the publish-stage right pane. */
const DEFAULT_DRAFT_SUBJECT = 'Fairport Public Library install · Jun 2 · folder ready'
const DEFAULT_DRAFT_BODY = [
    'Hi —',
    '',
    'Your install day folder for Fairport Public Library is live in SharePoint. You\'ll find 8 shop drawings, 5 vendor ACKs, the site plan and your runbook.',
    '',
    'One ACK has a Strata flag for short-shipped lounge chairs (KI · 2 of 24) — vendor proposes back-order. Please verify on receipt and note any discrepancies on the punch list.',
    '',
    'Tap the link from your iPad to open · everything you need for the install day is in one place.',
    '',
    'Thanks,',
    'Account Manager Kai · Account Manager',
    'Creative Library Concepts',
].join('\n')
const DRAFT_RECIPIENT = 'Install crew · Marcus Reed + Tomás Hernandez · iPad delivery'

export default function CLCAssetConsolidationModal({ isOpen, onClose, initialStage = 'filter', onPublished }: Props) {
    const [stage, setStage] = useState<Stage>(initialStage)
    const [previewAsset, setPreviewAsset] = useState<AssetEntry | null>(null)
    // Sync internal stage when the parent's initialStage prop changes ·
    // covers backward sidebar nav (e.g. user at clc2.3 jumps back to clc2.2
    // and we want the modal to reset to the filter stage to match).
    useEffect(() => {
        setStage(initialStage)
    }, [initialStage])
    // Sidebar-aware offset · 320px sidebar + 64px gap = lg:pl-96 (384px).
    // Diego's "modal pegado al sidebar" needs visible breathing room, not flush.
    const { isDemoActive, isSidebarCollapsed } = useDemo()
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed
    const offsetClass = sidebarExpanded ? 'lg:pl-96' : ''

    // Per-flagged-asset agency · operator can Acknowledge ("publish anyway")
    // or Remove ("don't ship to installer"). Both are reversible. Strata
    // never blocks the publish CTA · the UI just reflects which decision
    // the operator made per the doc's "operator confirms each flag" beat.
    const [flagAcknowledgedIds, setFlagAcknowledgedIds] = useState<Set<string>>(new Set())
    const [removedAssetIds, setRemovedAssetIds] = useState<Set<string>>(new Set())

    // Per-IQ-job override en Filter stage · operator can flip Strata's
    // include/exclude decision per row, mirroring the doc's "Rationale
    // shown inline · operator can override" beat (clc2.2 step messages).
    // A jobId in jobOverrides means "operator flipped this from Strata's
    // default" · effective inclusion is computed via XOR with j.included.
    const [jobOverrides, setJobOverrides] = useState<Set<string>>(new Set())
    const handleToggleJobOverride = (jobId: string) =>
        setJobOverrides(prev => {
            const next = new Set(prev)
            if (next.has(jobId)) next.delete(jobId)
            else next.add(jobId)
            return next
        })

    // Publish-time state · overlay plays for ~2.5s before the modal
    // actually closes, so the operator sees Strata doing the work
    // (folder create + permissions + upload + link gen) instead of an
    // instant close.
    const [publishingInProgress, setPublishingInProgress] = useState(false)

    // Installer notification draft · default values seeded, operator can
    // edit via the AIEmailComposer (same shell used in MBI's AR collection
    // flow and CLC's capacity outreach panel). `draftEdited` drives the
    // "edited by operator" indicator next to the draft heading.
    const [draftSubject, setDraftSubject] = useState(DEFAULT_DRAFT_SUBJECT)
    const [draftBody, setDraftBody] = useState(DEFAULT_DRAFT_BODY)
    const [draftEdited, setDraftEdited] = useState(false)
    const [emailComposerOpen, setEmailComposerOpen] = useState(false)

    const handleSaveDraft = (subject: string, body: string) => {
        setDraftSubject(subject)
        setDraftBody(body)
        setDraftEdited(true)
        setEmailComposerOpen(false)
    }

    // Effective include/exclude based on Strata default XOR operator override.
    // A job is "effectively included" when its default differs from whether
    // it's in jobOverrides · so toggling a row flips it across the divider.
    const effectiveIncludedJobs = useMemo(
        () => FAIRPORT_VENDOR_JOBS.filter(j => j.included !== jobOverrides.has(j.iqJobId)),
        [jobOverrides],
    )
    const effectiveExcludedJobs = useMemo(
        () => FAIRPORT_VENDOR_JOBS.filter(j => !(j.included !== jobOverrides.has(j.iqJobId))),
        [jobOverrides],
    )
    // includedAssets now derives from the EFFECTIVE included jobs · downstream
    // stages (Review, Publish) automatically reflect any operator override.
    const includedAssets = useMemo(() => {
        const fromVendors = effectiveIncludedJobs.flatMap(j => j.assets)
        return [...fromVendors, ...COMMON_ASSETS]
    }, [effectiveIncludedJobs])

    // Effective set drives the right-pane summary, the publish folder tree
    // and the email draft counts. The left-pane list shows ALL assets
    // (including removed) so the operator can undo without re-entering Review.
    const effectiveAssets = useMemo(
        () => includedAssets.filter(a => !removedAssetIds.has(a.id)),
        [includedAssets, removedAssetIds],
    )

    const assetCounts = useMemo(() => {
        const counts: Record<AssetEntry['type'], number> = {
            'shop-drawing': 0, 'ack': 0, 'site-plan': 0, 'runbook': 0,
        }
        for (const a of includedAssets) counts[a.type]++
        return counts
    }, [includedAssets])

    const totalSizeKb = includedAssets.reduce((s, a) => s + a.sizeKb, 0)
    const effectiveSizeKb = effectiveAssets.reduce((s, a) => s + a.sizeKb, 0)

    const handleAcknowledgeFlag = (id: string) =>
        setFlagAcknowledgedIds(prev => new Set(prev).add(id))
    const handleUndoAcknowledge = (id: string) =>
        setFlagAcknowledgedIds(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })
    const handleRemoveAsset = (id: string) => {
        setRemovedAssetIds(prev => new Set(prev).add(id))
        setFlagAcknowledgedIds(prev => {
            const next = new Set(prev)
            next.delete(id)   // a removed asset can't also be acknowledged
            return next
        })
    }
    const handleUndoRemove = (id: string) =>
        setRemovedAssetIds(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })

    const goNext = () => {
        if (stage === 'filter') {
            setStage('review')
            // Sidebar bridge · CLCSharePointScene listens and advances
            // clc2.2 → clc2.3 if applicable. Doc maps "Stage 15 assets" to
            // the proceed action of clc2.2's userAction.
            window.dispatchEvent(new CustomEvent('clc:sharepoint-stage-changed', { detail: { stage: 'review' } }))
        } else if (stage === 'review') {
            setStage('publish')
            // Review → Publish · internal stage transition · ya NO mueve el sidebar
            // (clc2.3 cubre Review + Publish después del merge). El dispatch queda
            // por compatibilidad pero el scene listener lo ignora.
            window.dispatchEvent(new CustomEvent('clc:sharepoint-stage-changed', { detail: { stage: 'publish' } }))
        }
    }
    const goPrev = () => {
        if (stage === 'publish') setStage('review')
        else if (stage === 'review') setStage('filter')
    }

    const handlePublish = () => {
        // Start the publishing simulation · overlay plays, modal stays open.
        setPublishingInProgress(true)
    }
    const handlePublishComplete = () => {
        setPublishingInProgress(false)
        window.dispatchEvent(new CustomEvent('clc:sharepoint-folder-created', {
            detail: {
                url: SHAREPOINT_FOLDER_URL,
                notificationSubject: draftSubject,
                notificationBody: draftBody,
                notificationEdited: draftEdited,
            },
        }))
        onPublished?.()
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[200]">
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" />
                </TransitionChild>
                <div className={`fixed inset-0 flex items-center justify-center p-4 ${offsetClass}`}>
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <DialogPanel className="w-full max-w-[1200px] h-[88vh] max-h-[860px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
                            {/* ─── Header · title + stage stepper to the right + close ─── */}
                            <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="h-9 w-9 rounded-lg bg-ai/15 flex items-center justify-center shrink-0">
                                        <Sparkles className="h-4 w-4 text-ai" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-base font-bold text-foreground truncate">Consolidate install assets — Fairport Library Phase 1</h2>
                                        <p className="text-[11px] text-muted-foreground truncate">Scheduled Jun 2 · 5 IQ jobs to bundle · 15 assets total</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <StageStepper current={stage} onJump={setStage} />
                                    <button onClick={onClose} aria-label="Close" className="p-1.5 -m-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* ─── AI banner · contextual per stage ─── */}
                            <div className="px-5 py-2.5 border-b border-border bg-ai/5 flex items-start gap-2">
                                <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                                <p className="text-xs text-foreground leading-snug">
                                    <strong className="text-foreground">Strata AI</strong> · {STAGE_AI_BANNER[stage]}
                                </p>
                            </div>

                            {/* ─── Body · split-pane 3:2 ─── */}
                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 overflow-hidden">
                                {/* Left (3/5) · stage-aware content */}
                                <div className="lg:col-span-3 overflow-y-auto border-r border-border">
                                    {stage === 'filter'   && (
                                        <FilterLeft
                                            included={effectiveIncludedJobs}
                                            excluded={effectiveExcludedJobs}
                                            jobOverrides={jobOverrides}
                                            onToggleJobOverride={handleToggleJobOverride}
                                        />
                                    )}
                                    {stage === 'review'   && (
                                        <ReviewLeft
                                            assets={includedAssets}
                                            counts={assetCounts}
                                            totalSizeKb={totalSizeKb}
                                            onPreview={setPreviewAsset}
                                            flagAcknowledgedIds={flagAcknowledgedIds}
                                            removedAssetIds={removedAssetIds}
                                            onAcknowledgeFlag={handleAcknowledgeFlag}
                                            onRemoveAsset={handleRemoveAsset}
                                            onUndoAcknowledge={handleUndoAcknowledge}
                                            onUndoRemove={handleUndoRemove}
                                        />
                                    )}
                                    {stage === 'publish'  && <PublishLeft assets={effectiveAssets} />}
                                </div>
                                {/* Right (2/5) · action panel + primary CTA */}
                                <div className="lg:col-span-2 overflow-y-auto bg-muted/20">
                                    {stage === 'filter'   && (
                                        <FilterRight
                                            includedCount={effectiveIncludedJobs.length}
                                            excludedCount={effectiveExcludedJobs.length}
                                            assetCount={includedAssets.length}
                                            overrideCount={jobOverrides.size}
                                            onContinue={goNext}
                                        />
                                    )}
                                    {stage === 'review'   && (
                                        <ReviewRight
                                            assets={includedAssets}
                                            effectiveAssetCount={effectiveAssets.length}
                                            effectiveSizeKb={effectiveSizeKb}
                                            flagAcknowledgedIds={flagAcknowledgedIds}
                                            removedAssetIds={removedAssetIds}
                                            onContinue={goNext}
                                        />
                                    )}
                                    {stage === 'publish'  && (
                                        <PublishRight
                                            assetCount={effectiveAssets.length}
                                            totalSizeKb={effectiveSizeKb}
                                            draftSubject={draftSubject}
                                            draftBody={draftBody}
                                            draftEdited={draftEdited}
                                            onOpenEditor={() => setEmailComposerOpen(true)}
                                            onPublish={handlePublish}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* ─── Footer · minimal · Back left, "operator confirms" right ─── */}
                            <div className="border-t border-border px-5 py-2.5 bg-muted/20 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    {stage !== 'filter' && (
                                        <button onClick={goPrev} className="px-2.5 py-1.5 text-xs font-semibold text-foreground border border-border rounded-md hover:bg-muted transition-colors">
                                            ← Back to {STAGE_TITLE[prevStage(stage)]}
                                        </button>
                                    )}
                                </div>
                                <div className="text-[11px] text-muted-foreground italic">
                                    Strata never auto-sends · operator confirms each send.
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>

            {/* Asset preview · floating overlay above the modal */}
            <Transition show={previewAsset !== null} as={Fragment}>
                <Dialog onClose={() => setPreviewAsset(null)} className="relative z-[220]">
                    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" />
                    <div className={`fixed inset-0 flex items-center justify-center p-3 ${offsetClass}`}>
                        <DialogPanel className="w-full h-[90vh] max-w-[1100px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="font-mono text-sm font-semibold text-foreground truncate">{previewAsset?.name}</span>
                                    {previewAsset && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${ASSET_TYPE_META[previewAsset.type].colorClass}`}>
                                            {ASSET_TYPE_META[previewAsset.type].label}
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => setPreviewAsset(null)} aria-label="Close preview" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex-1 bg-muted/40 flex items-center justify-center text-muted-foreground">
                                <div className="text-center max-w-sm p-8">
                                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-sm font-semibold text-foreground mb-1">{previewAsset?.name}</p>
                                    <p className="text-xs">PDF preview (mock) · in production this renders the actual document inline.</p>
                                    {previewAsset?.aiFlagged && (
                                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 p-3 text-left">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Sparkles className="h-3.5 w-3.5 text-zinc-800 dark:text-zinc-200" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Strata AI flag</span>
                                            </div>
                                            <p className="text-xs text-foreground">{previewAsset.flagReason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            </Transition>

            {/* AI Email Composer · same shell used in MBI AR collections + CLC
                capacity outreach. Opens from the "Edit" button on the
                installer notification draft. Save updates the local draft
                state · publish-time event detail carries the latest values. */}
            <AIEmailComposer
                isOpen={emailComposerOpen}
                onClose={() => setEmailComposerOpen(false)}
                title="Edit installer notification"
                subtitle="Strata-drafted · operator reviews and sends with the SharePoint link"
                icon={<Mail className="h-4 w-4" />}
                to={DRAFT_RECIPIENT}
                initialSubject={draftSubject}
                initialBody={draftBody}
                badge={{ label: 'Installer notification', tone: 'info', icon: <Mail className="h-3 w-3" /> }}
                actionLabel="Save draft"
                actionIcon={<Save className="h-3.5 w-3.5" />}
                onAction={handleSaveDraft}
            />

            {/* Publish-time overlay · plays for ~2.5s after the operator
                confirms. Modal stays open behind it so the close animation
                happens after the publish work "lands". */}
            {publishingInProgress && (
                <CLCIngestionOverlay
                    onComplete={handlePublishComplete}
                    title="Strata is publishing the install folder"
                    phases={[
                        `Creating SharePoint folder · /sites/Installs/Fairport-Library-Phase1/`,
                        'Setting permissions · install crew + Director of Operations',
                        `Uploading ${effectiveAssets.length} assets · ${(effectiveSizeKb / 1024).toFixed(1)} MB`,
                        'Generating iPad-friendly share link',
                        draftEdited
                            ? 'Queueing operator-edited installer notification'
                            : 'Queueing Strata-drafted installer notification',
                    ]}
                    footnote={`Fairport Library Phase 1 · ${effectiveAssets.length} assets · ${draftEdited ? 'operator-edited draft' : 'Strata draft'}`}
                />
            )}
        </Transition>
    )
}

function prevStage(s: Stage): Stage {
    return s === 'publish' ? 'review' : 'filter'
}

// ─── Stage stepper ──────────────────────────────────────────────────────────

function StageStepper({ current, onJump }: { current: Stage; onJump: (s: Stage) => void }) {
    const stages: { id: Stage; label: string }[] = [
        { id: 'filter',   label: 'Filter'   },
        { id: 'review',   label: 'Review'   },
        { id: 'publish',  label: 'Publish'  },
    ]
    const currentIdx = stages.findIndex(s => s.id === current)
    return (
        <div className="hidden md:flex items-center gap-1.5">
            {stages.map((s, i) => {
                const isPast = i < currentIdx
                const isActive = i === currentIdx
                return (
                    <Fragment key={s.id}>
                        <button
                            onClick={() => onJump(s.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                                isActive ? 'bg-primary text-primary-foreground' :
                                isPast   ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200 hover:bg-green-200' :
                                           'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            <span className={`inline-flex items-center justify-center h-4 w-4 rounded-full text-[10px] font-bold ${
                                isActive ? 'bg-primary-foreground text-primary' :
                                isPast   ? 'bg-green-700 text-white' :
                                           'bg-zinc-300 text-zinc-600 dark:bg-zinc-600 dark:text-zinc-300'
                            }`}>
                                {isPast ? <Check className="h-2.5 w-2.5" /> : (i + 1)}
                            </span>
                            {s.label}
                        </button>
                        {i < stages.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                    </Fragment>
                )
            })}
        </div>
    )
}

// (Discover stage colapsado en Filter · trigger context vive en el AI banner ahora)

// ─── Filter stage ───────────────────────────────────────────────────────────

function FilterLeft({
    included, excluded, jobOverrides, onToggleJobOverride,
}: {
    included: typeof FAIRPORT_VENDOR_JOBS
    excluded: typeof FAIRPORT_VENDOR_JOBS
    jobOverrides: Set<string>
    onToggleJobOverride: (jobId: string) => void
}) {
    const totalIncluded = included.length
    const totalExcluded = excluded.length
    const originalIncludedCount = FAIRPORT_VENDOR_JOBS.filter(j => j.included).length
    const originalExcludedCount = FAIRPORT_VENDOR_JOBS.filter(j => !j.included).length
    const includedDelta = totalIncluded - originalIncludedCount
    const excludedDelta = totalExcluded - originalExcludedCount
    return (
        <div className="p-5 space-y-4">
            {/* Included list · effective state · operator can move any row out */}
            <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-1.5 flex items-center gap-1.5">
                    <span>Included · {totalIncluded} IQ job{totalIncluded !== 1 ? 's' : ''}</span>
                    {includedDelta !== 0 && (
                        <span className="text-amber-700 dark:text-amber-300 normal-case font-semibold">
                            (was {originalIncludedCount} · {includedDelta > 0 ? '+' : ''}{includedDelta} by operator)
                        </span>
                    )}
                </div>
                <div className="rounded-2xl border border-success/30 bg-success/5 overflow-hidden">
                    <div className="divide-y divide-success/15">
                        {included.map(j => (
                            <FilterRow
                                key={j.iqJobId}
                                job={j}
                                effectiveIncluded
                                overridden={jobOverrides.has(j.iqJobId)}
                                onToggle={() => onToggleJobOverride(j.iqJobId)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Excluded list · effective state · operator can move any row back in */}
            <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-1.5 flex items-center gap-1.5">
                    <span>Excluded · {totalExcluded} IQ job{totalExcluded !== 1 ? 's' : ''}</span>
                    {excludedDelta !== 0 && (
                        <span className="text-amber-700 dark:text-amber-300 normal-case font-semibold">
                            (was {originalExcludedCount} · {excludedDelta > 0 ? '+' : ''}{excludedDelta} by operator)
                        </span>
                    )}
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 overflow-hidden">
                    <div className="divide-y divide-border">
                        {excluded.map(j => (
                            <FilterRow
                                key={j.iqJobId}
                                job={j}
                                effectiveIncluded={false}
                                overridden={jobOverrides.has(j.iqJobId)}
                                onToggle={() => onToggleJobOverride(j.iqJobId)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Doc-aligned footer · "operator can override" */}
            <div className="rounded-xl border border-ai/30 bg-ai/5 p-3 flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                <p className="text-[11px] text-foreground leading-relaxed">
                    <strong className="text-foreground">Strata never blocks · operator can override.</strong> Default decisions use the customer tag · click any row to move it across the divider if your project context calls for it.
                </p>
            </div>
        </div>
    )
}

function FilterRow({
    job, effectiveIncluded, overridden, onToggle,
}: {
    job: typeof FAIRPORT_VENDOR_JOBS[number]
    effectiveIncluded: boolean
    overridden: boolean
    onToggle: () => void
}) {
    // Row tone · default Strata decisions use the list bg (success/5 or
    // muted/30). Overrides get an amber accent stripe + light amber tint so
    // they're unmistakable across both lists · mirrors the flag pattern in
    // ReviewLeft (border-l-[3px] border-amber-500).
    const rowTone = overridden
        ? 'bg-amber-50/60 dark:bg-amber-500/10 border-l-[3px] border-amber-500'
        : ''
    return (
        <div className={`p-3 flex items-start gap-3 ${rowTone} ${!effectiveIncluded && !overridden ? 'opacity-80' : ''}`}>
            {/* Leading status badge · 4-way state: Strata include / Strata exclude /
                Operator include / Operator exclude */}
            <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5 ${
                overridden && effectiveIncluded
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200'
                    : overridden && !effectiveIncluded
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200'
                        : effectiveIncluded
                            ? 'bg-success/15 text-success'
                            : 'bg-muted text-muted-foreground'
            }`}>
                {overridden ? (
                    <>
                        <RotateCcw className="h-2.5 w-2.5 mr-0.5" />
                        Operator · {effectiveIncluded ? 'include' : 'exclude'}
                    </>
                ) : effectiveIncluded ? (
                    <>
                        <Check className="h-2.5 w-2.5 mr-0.5" />
                        Strata · include
                    </>
                ) : (
                    <>
                        <XCircle className="h-2.5 w-2.5 mr-0.5" />
                        Strata · exclude
                    </>
                )}
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`font-mono text-xs font-bold ${effectiveIncluded ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{job.iqJobId}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{job.vendor}</span>
                </div>
                <div className={`text-sm leading-snug ${effectiveIncluded ? 'text-foreground' : 'text-muted-foreground'}`}>{job.description}</div>
                <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                    <span className="font-mono">{job.customerTag}</span> · {job.rationale}
                </div>

                {/* Per-row action button · doc-aligned: "operator can override" */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    {!overridden && effectiveIncluded && (
                        <button
                            type="button"
                            onClick={onToggle}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            <XCircle className="h-3 w-3" />
                            Move to excluded
                        </button>
                    )}
                    {!overridden && !effectiveIncluded && (
                        <button
                            type="button"
                            onClick={onToggle}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                            <Check className="h-3 w-3" />
                            Move to included
                        </button>
                    )}
                    {overridden && (
                        <button
                            type="button"
                            onClick={onToggle}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md text-muted-foreground hover:text-foreground hover:underline"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Restore Strata's decision
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function FilterRight({ includedCount, excludedCount, assetCount, overrideCount, onContinue }: { includedCount: number; excludedCount: number; assetCount: number; overrideCount: number; onContinue: () => void }) {
    const hasOverrides = overrideCount > 0
    return (
        <div className="p-5 flex flex-col h-full">
            <div className="space-y-3 flex-1">
                <div>
                    <h3 className="text-base font-bold text-foreground mb-0.5">Consolidation summary</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Strata used the customer tag as the consolidation key · the customer already maintains it.</p>
                </div>

                {/* Big KPI cards · reactive to operator overrides. The amber
                    pill below each card surfaces "operator override" when the
                    set was modified, mirroring the per-row badge in the lists. */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-success/30 bg-success/5 p-3">
                        <div className="text-[10px] font-bold text-success uppercase tracking-wider">In-project</div>
                        <div className="text-2xl font-bold text-foreground tabular-nums mt-0.5">{includedCount}</div>
                        <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">Tag-matched · will seed</div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Excluded</div>
                        <div className="text-2xl font-bold text-foreground tabular-nums mt-0.5">{excludedCount}</div>
                        <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">Tag mismatch · won't seed</div>
                    </div>
                </div>

                {hasOverrides && (
                    <div className="rounded-xl border border-amber-500/40 bg-amber-50/40 dark:bg-amber-500/5 p-2.5 flex items-start gap-2">
                        <RotateCcw className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-foreground leading-snug">
                            <strong className="text-amber-700 dark:text-amber-300">{overrideCount} operator override{overrideCount !== 1 ? 's' : ''}</strong>
                            {' · '}publishing with the operator's selection, not Strata's default.
                        </p>
                    </div>
                )}

                <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Completeness checks</div>
                    <div className="space-y-1.5">
                        <FilterCheckRow label={`${includedCount} of 7 included · ${hasOverrides ? 'operator-adjusted from customer tag' : 'matching customer tag'}`} ok />
                        <FilterCheckRow label={`${excludedCount} excluded · rationale shown per row`} ok />
                        <FilterCheckRow label={`${effectiveVendorCount(includedCount)} distinct vendor${effectiveVendorCount(includedCount) !== 1 ? 's' : ''} · no overlap`} ok />
                        <FilterCheckRow label={`Estimated ${assetCount} asset${assetCount !== 1 ? 's' : ''} ready to stage`} ok />
                    </div>
                </div>

                <div className="rounded-xl border border-ai/30 bg-ai/5 p-3 flex items-start gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                    <p className="text-[11px] text-foreground leading-relaxed">
                        {hasOverrides
                            ? 'After staging, Strata previews each PDF inline · the operator override carries through to Review and Publish.'
                            : 'After staging, Strata previews each PDF inline so the operator can verify the install-day pack before publishing.'}
                    </p>
                </div>
            </div>

            <button
                onClick={onContinue}
                disabled={assetCount === 0}
                className="w-full mt-4 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Stage {assetCount} asset{assetCount !== 1 ? 's' : ''}
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    )
}

/** Vendor count for the completeness row · 1 vendor per included job (5
    seed jobs map to 5 distinct vendors). Tappé + SWBR aren't vendors per
    the seed data, so overrides that flip them in/out don't change the
    vendor count beyond what's in the included list. */
function effectiveVendorCount(includedCount: number): number {
    // The 5 seed vendor jobs are 1:1 with vendors · clamp to that bound.
    return Math.min(includedCount, 5)
}

function FilterCheckRow({ label, ok }: { label: string; ok: boolean }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            {ok ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <span className="text-foreground">{label}</span>
        </div>
    )
}

// ─── Review stage ───────────────────────────────────────────────────────────

type AssetTypeKey = AssetEntry['type']
type AssetTab = 'all' | AssetTypeKey

function ReviewLeft({
    assets, counts, totalSizeKb, onPreview,
    flagAcknowledgedIds, removedAssetIds,
    onAcknowledgeFlag, onRemoveAsset, onUndoAcknowledge, onUndoRemove,
}: {
    assets: AssetEntry[]
    counts: Record<AssetTypeKey, number>
    totalSizeKb: number
    onPreview: (a: AssetEntry) => void
    flagAcknowledgedIds: Set<string>
    removedAssetIds: Set<string>
    onAcknowledgeFlag: (id: string) => void
    onRemoveAsset: (id: string) => void
    onUndoAcknowledge: (id: string) => void
    onUndoRemove: (id: string) => void
}) {
    const [tab, setTab] = useState<AssetTab>('all')
    const visible = tab === 'all' ? assets : assets.filter(a => a.type === tab)
    return (
        <div className="p-5 space-y-3">
            {/* Tabs · counts are static (show original) so labels don't jitter */}
            <div className="flex items-center gap-1.5 flex-wrap">
                <TabButton label={`All ${assets.length}`} active={tab === 'all'} onClick={() => setTab('all')} />
                {(Object.keys(counts) as AssetTypeKey[]).map(k => (
                    <TabButton key={k} label={`${ASSET_TYPE_META[k].label} ${counts[k]}`} active={tab === k} onClick={() => setTab(k)} />
                ))}
                <span className="ml-auto text-[11px] text-muted-foreground">{(totalSizeKb / 1024).toFixed(1)} MB total</span>
            </div>

            {/* Asset list · status-aware row treatment per flag state */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="divide-y divide-border">
                    {visible.map(a => {
                        const isFlagged = !!a.aiFlagged
                        const isAck = flagAcknowledgedIds.has(a.id)
                        const isRemoved = removedAssetIds.has(a.id)
                        // Status-aware row container · the entire row gets a
                        // background tint + left-border accent so the flagged
                        // state is unmissable, not just a pill on the side.
                        const rowTone = isRemoved
                            ? 'bg-muted/10 opacity-60'
                            : isFlagged && isAck
                                ? 'bg-emerald-50/60 dark:bg-emerald-500/10 border-l-[3px] border-emerald-500'
                                : isFlagged
                                    ? 'bg-amber-50/60 dark:bg-amber-500/10 border-l-[3px] border-amber-500'
                                    : ''
                        return (
                            <div key={a.id} className={rowTone}>
                                {/* Main file row · click previews PDF */}
                                <button
                                    onClick={() => onPreview(a)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/20 transition-colors text-left"
                                >
                                    {/* Leading status icon · semantic per row state */}
                                    {isFlagged && !isAck && !isRemoved ? (
                                        <div className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-500/30 flex items-center justify-center shrink-0">
                                            <AlertTriangle className="h-3 w-3 text-amber-700 dark:text-amber-300" />
                                        </div>
                                    ) : isFlagged && isAck ? (
                                        <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-500/30 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-700 dark:text-emerald-300" />
                                        </div>
                                    ) : isRemoved ? (
                                        <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                                            <XCircle className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0 mx-0.5" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-sm font-mono truncate ${isRemoved ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                {a.name}
                                            </span>
                                            <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${ASSET_TYPE_META[a.type].colorClass}`}>
                                                {ASSET_TYPE_META[a.type].label}
                                            </span>
                                            {isFlagged && !isAck && !isRemoved && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200 uppercase tracking-wider">
                                                    <Sparkles className="h-2.5 w-2.5" />
                                                    Strata · review
                                                </span>
                                            )}
                                            {isFlagged && isAck && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200 uppercase tracking-wider">
                                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                                    Operator ack
                                                </span>
                                            )}
                                            {isRemoved && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground uppercase tracking-wider">
                                                    <XCircle className="h-2.5 w-2.5" />
                                                    Removed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-xs tabular-nums shrink-0 ${isRemoved ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>
                                        {a.sizeKb.toLocaleString()} KB
                                    </span>
                                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                </button>

                                {/* Flag detail + action affordances · only for flagged assets */}
                                {isFlagged && (
                                    <div className="px-3 pb-3 pl-11 space-y-2">
                                        {!isRemoved && (
                                            <p className="text-[11px] text-foreground leading-snug">
                                                <strong className="text-foreground">Strata detected · </strong>
                                                {a.flagReason}
                                            </p>
                                        )}
                                        {!isAck && !isRemoved && (
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={() => onAcknowledgeFlag(a.id)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                                                >
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Acknowledge · publish anyway
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onRemoveAsset(a.id)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors"
                                                >
                                                    <XCircle className="h-3 w-3" />
                                                    Remove from folder
                                                </button>
                                                <span className="text-[10px] text-muted-foreground italic ml-1">
                                                    Strata never blocks · operator confirms.
                                                </span>
                                            </div>
                                        )}
                                        {isAck && !isRemoved && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold inline-flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Operator-acknowledged · publishes with the flag noted
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => onUndoAcknowledge(a.id)}
                                                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground hover:underline"
                                                >
                                                    <RotateCcw className="h-2.5 w-2.5" />
                                                    Undo
                                                </button>
                                            </div>
                                        )}
                                        {isRemoved && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] text-muted-foreground font-semibold inline-flex items-center gap-1">
                                                    <XCircle className="h-3 w-3" />
                                                    Removed from the publish folder
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => onUndoRemove(a.id)}
                                                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground hover:underline"
                                                >
                                                    <RotateCcw className="h-2.5 w-2.5" />
                                                    Restore
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                active ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
        >
            {label}
        </button>
    )
}

function ReviewRight({
    assets, effectiveAssetCount, effectiveSizeKb,
    flagAcknowledgedIds, removedAssetIds, onContinue,
}: {
    assets: AssetEntry[]
    effectiveAssetCount: number
    effectiveSizeKb: number
    flagAcknowledgedIds: Set<string>
    removedAssetIds: Set<string>
    onContinue: () => void
}) {
    const flaggedAsset = assets.find(a => a.aiFlagged)
    // Three-way status of the flagged asset · drives the summary card
    // styling and the folder-readiness row.
    const flagStatus: 'awaiting' | 'acknowledged' | 'removed' | 'none' =
        !flaggedAsset ? 'none'
        : removedAssetIds.has(flaggedAsset.id) ? 'removed'
        : flagAcknowledgedIds.has(flaggedAsset.id) ? 'acknowledged'
        : 'awaiting'
    return (
        <div className="p-5 flex flex-col h-full">
            <div className="space-y-3 flex-1">
                <div>
                    <h3 className="text-base font-bold text-foreground mb-0.5">Asset summary</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        <strong className="text-foreground tabular-nums">{effectiveAssetCount}</strong> asset{effectiveAssetCount !== 1 ? 's' : ''} · {(effectiveSizeKb / 1024).toFixed(1)} MB · will be staged to a single SharePoint folder.
                        {removedAssetIds.size > 0 && (
                            <> <span className="text-muted-foreground">({removedAssetIds.size} removed by operator)</span></>
                        )}
                    </p>
                </div>

                {flaggedAsset && (
                    <div className={`rounded-xl border p-3 space-y-2 ${
                        flagStatus === 'awaiting'     ? 'border-amber-500/40 bg-amber-50/40 dark:bg-amber-500/5' :
                        flagStatus === 'acknowledged' ? 'border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-500/5' :
                                                        'border-border bg-muted/30'
                    }`}>
                        <div className="flex items-center gap-1.5">
                            {flagStatus === 'awaiting' && <Sparkles className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" />}
                            {flagStatus === 'acknowledged' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />}
                            {flagStatus === 'removed' && <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                flagStatus === 'awaiting' ? 'text-amber-700 dark:text-amber-300' :
                                flagStatus === 'acknowledged' ? 'text-emerald-700 dark:text-emerald-300' :
                                'text-muted-foreground'
                            }`}>
                                {flagStatus === 'awaiting'     && '1 Strata flag · awaiting operator review'}
                                {flagStatus === 'acknowledged' && '1 Strata flag · operator-acknowledged'}
                                {flagStatus === 'removed'      && '1 asset removed by operator'}
                            </span>
                        </div>
                        <div>
                            <div className={`text-xs font-bold font-mono truncate ${flagStatus === 'removed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                {flaggedAsset.name}
                            </div>
                            <p className="text-[11px] text-foreground leading-snug mt-0.5">{flaggedAsset.flagReason}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">
                            Strata never blocks · operator confirms each flag before publishing.
                        </p>
                    </div>
                )}

                <div className="rounded-xl border border-border bg-card p-3 space-y-1.5">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Folder readiness</div>
                    <ReadinessRow label={`All ${effectiveAssetCount} assets readable from IQ`} status="ok" />
                    <ReadinessRow label="Installer iPad permissions verified" status="ok" />
                    {flagStatus === 'awaiting'     && <ReadinessRow label="1 flagged asset · awaiting review" status="warn" />}
                    {flagStatus === 'acknowledged' && <ReadinessRow label="1 flagged asset · operator-acknowledged" status="ok" />}
                    {flagStatus === 'removed'      && <ReadinessRow label="1 flagged asset · removed by operator" status="muted" />}
                </div>
            </div>

            <button
                onClick={onContinue}
                className="w-full mt-4 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
                Ready to publish
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    )
}

function ReadinessRow({ label, status }: { label: string; status: 'ok' | 'warn' | 'muted' }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            {status === 'ok' && (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            {status === 'warn' && (
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            {status === 'muted' && (
                <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className="text-foreground">{label}</span>
        </div>
    )
}

// ─── Publish stage ──────────────────────────────────────────────────────────

function PublishLeft({ assets }: { assets: AssetEntry[] }) {
    const grouped = useMemo(() => {
        const map: Record<AssetTypeKey, AssetEntry[]> = {
            'shop-drawing': [], 'ack': [], 'site-plan': [], 'runbook': [],
        }
        for (const a of assets) map[a.type].push(a)
        return map
    }, [assets])
    return (
        <div className="p-5 space-y-3">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Folder preview · ready to publish</div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border">
                    <FolderTree className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-mono text-foreground">Fairport-Library-Phase1/</span>
                </div>
                <div className="p-3 space-y-2.5">
                    {(Object.keys(grouped) as AssetTypeKey[]).map(type => {
                        if (grouped[type].length === 0) return null
                        return (
                            <div key={type}>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs font-mono font-bold text-foreground">{ASSET_TYPE_META[type].label.toLowerCase().replace(' ', '-')}s/</span>
                                    <span className="text-[10px] text-muted-foreground">{grouped[type].length}</span>
                                </div>
                                <div className="ml-5 space-y-0.5">
                                    {grouped[type].map(a => (
                                        <div key={a.id} className="flex items-center gap-1.5 text-[11px] py-0.5">
                                            <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                                            <span className="font-mono text-muted-foreground truncate flex-1">{a.name}</span>
                                            {a.aiFlagged && <Sparkles className="h-2.5 w-2.5 text-warning" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

function PublishRight({
    assetCount, totalSizeKb,
    draftSubject, draftBody, draftEdited,
    onOpenEditor, onPublish,
}: {
    assetCount: number
    totalSizeKb: number
    draftSubject: string
    draftBody: string
    draftEdited: boolean
    onOpenEditor: () => void
    onPublish: () => void
}) {
    const copyUrl = () => {
        navigator.clipboard?.writeText(SHAREPOINT_FOLDER_URL).catch(() => {})
    }
    // Body preview line · first non-empty line of the (possibly edited) draft.
    const bodyPreview = draftBody.split('\n').find(l => l.trim().length > 0) ?? draftBody
    return (
        <div className="p-5 flex flex-col h-full">
            <div className="space-y-3 flex-1">
                <div>
                    <h3 className="text-base font-bold text-foreground mb-0.5">Ready to publish</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{assetCount} assets · {(totalSizeKb / 1024).toFixed(1)} MB · single SharePoint folder · installer iPad accessible.</p>
                </div>

                <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">SharePoint URL</div>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                        <code className="text-[11px] text-foreground flex-1 truncate font-mono">{SHAREPOINT_FOLDER_URL}</code>
                        <button onClick={copyUrl} className="p-1 rounded hover:bg-muted transition-colors shrink-0" title="Copy URL">
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-3 space-y-1.5">
                    {/* Header · label + Edited badge + Edit button */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Installer notification · draft</span>
                        {draftEdited && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-ai/15 text-ai uppercase tracking-wider">
                                <Sparkles className="h-2.5 w-2.5" />
                                Edited
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={onOpenEditor}
                            className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-foreground hover:bg-muted px-1.5 py-0.5 rounded-md transition-colors"
                        >
                            <Pencil className="h-3 w-3" />
                            Edit
                        </button>
                    </div>
                    <div className="text-[11px] text-foreground">
                        <strong>Subject:</strong> {draftSubject}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-3">
                        {bodyPreview}
                    </p>
                </div>
            </div>

            <button
                onClick={onPublish}
                className="w-full mt-4 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
                <Check className="h-4 w-4" />
                Publish folder
            </button>
        </div>
    )
}
