import { useState, useEffect, useMemo, useRef } from 'react'
import { useDemo } from '../../context/DemoContext'
import { FolderTree, Folder, FolderOpen, Sparkles, AlertCircle, CheckCircle2, ExternalLink, FileText, Database, MoreHorizontal } from 'lucide-react'
import CLCAssetConsolidationModal from './CLCAssetConsolidationModal'
import CLCSharePointFolderModal from './CLCSharePointFolderModal'
import CLCViewToggle, { type ViewMode } from './shared/CLCViewToggle'
import CLCFilterBar, { type StatusOption } from './shared/CLCFilterBar'
import CLCSummaryChipsBar, { type SummaryChip } from './shared/CLCSummaryChipsBar'
import CLCIngestionOverlay from './shared/CLCIngestionOverlay'
import { FAIRPORT_VENDOR_JOBS, COMMON_ASSETS, SHAREPOINT_FOLDER_URL, SCHEDULED_INSTALL_DATE } from './shared/assetSeedingData'

type SeedingStatus = 'ready' | 'filtering' | 'reviewing' | 'publishing' | 'live' | 'archived'

interface SeedingProject {
    id: string
    name: string
    installDate: string
    status: SeedingStatus
    assetCount: number
    flaggedCount: number
    url?: string
}

const STATUS_LABEL: Record<SeedingStatus, string> = {
    ready:      'Triggered',
    filtering:  'Consolidating',
    reviewing:  'Reviewing',
    publishing: 'Publishing',
    live:       'Live',
    archived:   'Complete',
}

const STATUS_TONE: Record<SeedingStatus, string> = {
    ready:      'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    filtering:  'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    reviewing:  'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    publishing: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300',
    live:       'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
    archived:   'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
}

const FUNNEL_STATUSES: SeedingStatus[] = ['ready', 'filtering', 'reviewing', 'publishing', 'live']
/** Per-status semantic dot color · matches the CLCFunnelView pattern of
    Flow 1 (and OfficeworksFunnel). The dot carries the semantic accent so
    the column-header text stays high-contrast `text-foreground`. */
const FUNNEL_DOT: Record<SeedingStatus, string> = {
    ready:      'bg-ai',
    filtering:  'bg-info',
    reviewing:  'bg-warning',
    publishing: 'bg-primary',
    live:       'bg-success',
    archived:   'bg-muted-foreground',
}
const FUNNEL_AVATAR_BG: Record<SeedingStatus, string> = {
    ready:      'bg-ai/20',
    filtering:  'bg-info/20',
    reviewing:  'bg-warning/20',
    publishing: 'bg-primary/20',
    live:       'bg-success/20',
    archived:   'bg-muted',
}
const FUNNEL_AVATAR_TEXT: Record<SeedingStatus, string> = {
    ready:      'text-ai',
    filtering:  'text-info',
    reviewing:  'text-warning',
    publishing: 'text-primary',
    live:       'text-success',
    archived:   'text-muted-foreground',
}

/** 2-letter initials from a folder name like "Fairport-Library-Phase1" → "FA" */
function folderInitials(name: string): string {
    const cleaned = name.replace(/[^a-z0-9 -]/gi, '').toUpperCase()
    const parts = cleaned.split(/[-\s]/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).slice(0, 3)
    return cleaned.slice(0, 2)
}

/**
 * Flow 2 · SharePoint Asset Seeding (refactored to scene shell pattern).
 *
 * View modes: Funnel · List (no Calendar — installs don't fit a calendar grid).
 * Per-step:
 *   clc2.1 → list view · Fairport row appears with "Triggered" status
 *   clc2.2 → list view + modal at Filter stage
 *   clc2.3 → list view + modal at Review stage
 *   clc2.3 → list view + modal at Review stage · user navega internamente a Publish · autoswap to Funnel after publish
 */
export default function CLCSharePointScene() {
    const { currentStep, nextStep, stepClickCount } = useDemo()
    const stepId = currentStep?.id
    // Live ref to current stepId · used inside event listeners and async
    // callbacks to gate nextStep() on the operator actually being at the
    // expected source step. Without this the auto-bridge could fire from
    // stale closures when stepId has already advanced.
    const stepIdRef = useRef(stepId)
    useEffect(() => { stepIdRef.current = stepId }, [stepId])

    const [modalOpen, setModalOpen] = useState(false)
    const [initialStage, setInitialStage] = useState<'filter' | 'review' | 'publish'>('filter')
    const [published, setPublished] = useState(false)
    // Extraction overlay · plays between the Action Center CTA click and
    // the consolidation modal opening. Mirrors Flow 1's clc1.1 ingestion
    // overlay · gives a visible "Strata is analyzing 15 documents across
    // 5 IQ jobs" beat instead of an instant modal teleport.
    const [extractionInProgress, setExtractionInProgress] = useState(false)
    // SharePoint folder viewer modal · opens when the operator clicks
    // "Open folder" on a published (Live) project · replaces the old
    // `<a href={mock-url}>` that 404'd the demo.
    const [folderViewerOpen, setFolderViewerOpen] = useState(false)
    // Full default asset list · what the published folder shows · the
    // viewer is read-only and doesn't reflect operator removals in
    // Review (intentional simplification per the plan's out-of-scope).
    const publishedAssets = useMemo(
        () => [...FAIRPORT_VENDOR_JOBS.filter(j => j.included).flatMap(j => j.assets), ...COMMON_ASSETS],
        [],
    )

    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const [hasUserToggled, setHasUserToggled] = useState(false)
    const [statuses, setStatuses] = useState<string[]>([])
    const [customerQuery, setCustomerQuery] = useState('')

    // Auto-open modal + reset narrative state per step. Backward sidebar
    // nav to 2.1/2.2/2.3 resets `published` (and closes the folder viewer)
    // so the card status reflects where we ARE narratively, not the future
    // state from a previous test run.
    useEffect(() => {
        if (stepId === 'clc2.1') {
            setPublished(false)
            setFolderViewerOpen(false)
            setModalOpen(false)
        } else if (stepId === 'clc2.2') {
            setPublished(false)
            setFolderViewerOpen(false)
            setInitialStage('filter')
            setModalOpen(true)
        } else if (stepId === 'clc2.3') {
            // Merged step · cubre los modal stages Review + Publish · el user
            // navega internamente vía goNext (sin avanzar el sidebar).
            // setPublished(false) solo cuando NO está ya published · evita
            // resetear el Live status si el operator vuelve a clc2.3 después
            // de un publish exitoso (publish overlay completes → published=true).
            setFolderViewerOpen(false)
            setInitialStage('review')
            setModalOpen(true)
        } else {
            setModalOpen(false)
            setFolderViewerOpen(false)
        }
    }, [stepId])

    // Action Center CTA listener · clc2.1 notification dispatches this event.
    // Now plays the extraction overlay FIRST (Strata "analyzing 15 docs
    // across 5 IQ jobs") then opens the consolidation modal at filter
    // stage when the overlay finishes. Mirrors Flow 1's clc1.1 ingestion
    // pattern · narrative beat for the AI work.
    useEffect(() => {
        const handler = () => setExtractionInProgress(true)
        window.addEventListener('clc:sharepoint-trigger', handler)
        return () => window.removeEventListener('clc:sharepoint-trigger', handler)
    }, [])
    const handleExtractionComplete = () => {
        setExtractionInProgress(false)
        setInitialStage('filter')
        setModalOpen(true)
        // 2.1 → 2.2 bridge · clicking the Action Center CTA is the
        // documented "Open the Scheduled trigger" action · advance the
        // sidebar so it stays coherent with what the user is doing.
        if (stepIdRef.current === 'clc2.1') {
            nextStep()
        }
    }

    // 2.2 → 2.3 and 2.3 → 2.4 bridges · the modal dispatches
    // clc:sharepoint-stage-changed when the operator clicks goNext
    // (Stage 15 assets → / Ready to publish →). Each is the documented
    // moment to move the sidebar forward.
    useEffect(() => {
        const handler = (e: Event) => {
            const newStage = (e as CustomEvent).detail?.stage as 'review' | 'publish' | undefined
            if (!newStage) return
            // Solo el bridge 2.2 → 2.3 sobrevive · clc2.3 ahora cubre Review +
            // Publish del modal · el goNext de Review → Publish queda internal
            // al modal y NO mueve el sidebar.
            if (newStage === 'review' && stepIdRef.current === 'clc2.2') {
                nextStep()
            }
        }
        window.addEventListener('clc:sharepoint-stage-changed', handler)
        return () => window.removeEventListener('clc:sharepoint-stage-changed', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Reset user-toggled flag when step changes
    useEffect(() => {
        setHasUserToggled(false)
    }, [stepId])

    // Autoswap to funnel after publish (clc2.3 outcome · publish action lives inside the merged Review+Publish step)
    useEffect(() => {
        if (!published || hasUserToggled) return
        const t = setTimeout(() => setViewMode('funnel'), 1500)
        return () => clearTimeout(t)
    }, [published, hasUserToggled])

    const includedVendors = FAIRPORT_VENDOR_JOBS.filter(j => j.included)
    const totalAssetCount = includedVendors.reduce((s, v) => s + v.assets.length, 0) + 2
    const flaggedCount = includedVendors.reduce((s, v) => s + v.assets.filter(a => a.aiFlagged).length, 0)

    // Build the project list — Fairport appears once we're in Flow 2
    const projects: SeedingProject[] = useMemo(() => {
        const arr: SeedingProject[] = []
        if (stepId?.startsWith('clc2.')) {
            const fairportStatus: SeedingStatus =
                published ? 'live' :
                stepId === 'clc2.3' ? 'reviewing' :
                stepId === 'clc2.2' ? 'filtering' :
                'ready'
            arr.push({
                id: 'fairport',
                name: 'Fairport-Library-Phase1',
                installDate: SCHEDULED_INSTALL_DATE,
                status: fairportStatus,
                assetCount: totalAssetCount,
                flaggedCount,
                url: published ? SHAREPOINT_FOLDER_URL : undefined,
            })
        }
        // Always-present prior projects (archived context)
        arr.push({ id: 'brockport', name: 'Brockport-Library-Q1',  installDate: 'Mar 4, 2026',  status: 'archived', assetCount: 12, flaggedCount: 0 })
        arr.push({ id: 'princeton', name: 'Princeton-TechBar-Q1',  installDate: 'Feb 12, 2026', status: 'archived', assetCount: 8,  flaggedCount: 0 })
        return arr
    }, [stepId, published, totalAssetCount, flaggedCount])

    // Filter
    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            if (statuses.length > 0 && !statuses.includes(p.status)) return false
            if (customerQuery && !p.name.toLowerCase().includes(customerQuery.toLowerCase())) return false
            return true
        })
    }, [projects, statuses, customerQuery])

    // Summary chips
    const activeCount = projects.filter(p => p.status !== 'archived' && p.status !== 'live').length
    const publishedCount = projects.filter(p => p.status === 'live').length
    const chips: SummaryChip[] = [
        {
            id: 'projects',
            label: `${filteredProjects.length} project${filteredProjects.length === 1 ? '' : 's'}`,
            count: filteredProjects.length,
            tone: 'neutral',
            panelTitle: 'Seeding queue',
            panel: <ProjectsSummaryPanel projects={filteredProjects} />,
        },
        {
            id: 'active',
            label: `${activeCount} active`,
            count: activeCount,
            tone: 'info',
            panelTitle: 'Active seeding workflows',
            panel: <SimpleList items={filteredProjects.filter(p => p.status !== 'archived' && p.status !== 'live').map(p => `${p.name} · ${STATUS_LABEL[p.status]}`)} emptyMessage="No active seeds." />,
        },
        {
            id: 'flagged',
            label: `${flaggedCount} flagged`,
            count: flaggedCount,
            tone: 'warning',
            pulse: flaggedCount > 0 && (stepId === 'clc2.3'),
            panelTitle: 'Assets flagged by Strata',
            panel: <FlaggedAssetsPanel />,
        },
        {
            id: 'published',
            label: `${publishedCount} published`,
            count: publishedCount,
            tone: 'success',
            pulse: published && stepId === 'clc2.3',
            panelTitle: 'Published folders',
            panel: <SimpleList items={projects.filter(p => p.status === 'live').map(p => `${p.name} · ${p.url ?? ''}`)} emptyMessage="No folders published yet." />,
        },
    ]

    const statusOptions: StatusOption[] = FUNNEL_STATUSES.map(s => ({ key: s, label: STATUS_LABEL[s] }))

    const openModal = (stage: typeof initialStage) => {
        setInitialStage(stage)
        setModalOpen(true)
        // 2.1 → 2.2 bridge · clicking "Open" on the Fairport row also
        // counts as "Open the Scheduled trigger" per the doc.
        if (stepIdRef.current === 'clc2.1') {
            nextStep()
        }
    }

    const handleViewChange = (m: ViewMode) => {
        setViewMode(m)
        setHasUserToggled(true)
    }

    return (
        <div className="flex flex-col h-full bg-muted/5">
            {/* Header */}
            <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                        <h1 className="text-xl font-bold text-foreground">SharePoint · Installs</h1>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">creativelibraryconcepts.sharepoint.com / sites / Installs</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground px-2 py-1 rounded-md bg-muted">
                        <Database className="h-3 w-3" />
                        Backed by IQ · QuickBooks · M365
                    </span>
                </div>
            </header>

            {/* Summary chips */}
            <CLCSummaryChipsBar chips={chips} />

            {/* Filter bar — no date / no region for Flow 2 */}
            <CLCFilterBar
                statuses={statuses}
                onStatuses={setStatuses}
                statusOptions={statusOptions}
                customerQuery={customerQuery}
                onCustomerQuery={setCustomerQuery}
                customerPlaceholder="Search project…"
                showDateRange={false}
                showRegion={false}
            />

            {/* View toggle */}
            <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-2">
                <div className="text-[11px] text-muted-foreground">
                    {filteredProjects.length === projects.length ? `${projects.length} projects` : `${filteredProjects.length} of ${projects.length} projects`}
                </div>
                <CLCViewToggle value={viewMode} onChange={handleViewChange} available={['funnel', 'list']} />
            </div>

            {/* Body */}
            <section className="flex-1 overflow-y-auto px-5 pb-5">
                {viewMode === 'funnel'
                    ? <FunnelView projects={filteredProjects} onOpenProject={openModal} stepId={stepId} modalOpen={modalOpen} onOpenFolder={() => setFolderViewerOpen(true)} />
                    : <ListView projects={filteredProjects} onOpenProject={openModal} stepId={stepId} modalOpen={modalOpen} onOpenFolder={() => setFolderViewerOpen(true)} />
                }
            </section>

            {/* Per-step hint */}
            {stepId === 'clc2.1' && (
                <div className="px-5 py-2.5 border-t border-border bg-muted/20">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" />
                        Strata detected the IQ status change · two paths · click the pulsing bell + <strong>Open seed workflow →</strong> · or click <strong>Open</strong> on the Fairport row directly. Either jumps to the Filter stage where you confirm the 5 IN / 2 OUT decision.
                    </p>
                </div>
            )}

            {/* key={stepClickCount} fuerza remount del modal cada vez que el
                operator hace sidebar click · state interno (jobOverrides,
                flagAck, draft edits) se resetea para una replay limpia. */}
            <CLCAssetConsolidationModal
                key={stepClickCount}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                initialStage={initialStage}
                onPublished={() => {
                    setPublished(true)
                    setModalOpen(false)
                }}
            />

            {/* SharePoint folder viewer · abre cuando el operator click
                "Open folder" en una published row · simulación read-only
                del folder live · reemplaza el `<a href={mock}>` que 404'aba. */}
            <CLCSharePointFolderModal
                isOpen={folderViewerOpen}
                onClose={() => setFolderViewerOpen(false)}
                assets={publishedAssets}
            />

            {/* Extraction overlay · plays before the modal opens when the
                user clicks the Action Center CTA. 5 phases · ~2.8s total. */}
            {extractionInProgress && (
                <CLCIngestionOverlay
                    onComplete={handleExtractionComplete}
                    title="Strata is extracting install assets"
                    phases={[
                        'IQ status change detected · Fairport now Scheduled',
                        'Searching IQ for customer-tag · 7 candidates found',
                        'Filtering · 5 in-project · 2 tag mismatch (Tappé · SWBR)',
                        'Extracting 15 assets · 8 shop drawings · 5 ACKs · site plan · runbook',
                        'Analyzing vendor ACKs · 1 short-ship flagged on KI J-44022',
                    ]}
                    footnote="Fairport Public Library · 5 IQ jobs · J-44021 → J-44025 · 11.8 MB"
                />
            )}
        </div>
    )
}

// ─── Views ───────────────────────────────────────────────────────────────────

function ListView({ projects, onOpenProject, stepId, modalOpen, onOpenFolder }: { projects: SeedingProject[]; onOpenProject: (s: 'filter' | 'review' | 'publish') => void; stepId?: string; modalOpen?: boolean; onOpenFolder?: () => void }) {
    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-3 grid grid-cols-[28px_1fr_180px_120px_120px] gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/40">
                <span></span>
                <span>Folder</span>
                <span>Install date</span>
                <span>Status</span>
                <span className="text-right">Action</span>
            </div>
            <div className="divide-y divide-border">
                {projects.length === 0 ? (
                    <div className="px-4 py-10 text-center text-xs text-muted-foreground">
                        No projects match the current filters. Adjust the filters above to widen the queue.
                    </div>
                ) : projects.map(p => {
                    // "In progress" affordance · when the modal is already open
                    // for this active project, the click is a no-op visually.
                    // Reword the button + tone it ai-tinted to communicate
                    // "you're already in this flow · keep going in the modal".
                    const isActiveInModal = modalOpen === true && p.status !== 'archived' && p.status !== 'live'
                    return (
                        <SharePointRow
                            key={p.id}
                            project={p}
                            inProgress={isActiveInModal}
                            onOpen={() => onOpenProject(
                                stepId === 'clc2.3' ? 'review' :
                                'filter'
                            )}
                            onOpenFolder={onOpenFolder}
                        />
                    )
                })}
            </div>
        </div>
    )
}

function FunnelView({ projects, onOpenProject, stepId, onOpenFolder }: { projects: SeedingProject[]; onOpenProject: (s: 'filter' | 'review' | 'publish') => void; stepId?: string; modalOpen?: boolean; onOpenFolder?: () => void }) {
    const activeCount = projects.filter(p => p.status !== 'archived').length
    const liveCount = projects.filter(p => p.status === 'live').length
    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Outer header · matches the CLCFunnelView "Install Pipeline" pattern */}
            <div className="flex items-start justify-between gap-4 p-5 pb-3 border-b border-border flex-wrap">
                <div>
                    <h3 className="text-base font-bold text-foreground">Asset Seeding Pipeline</h3>
                    <p className="text-sm text-muted-foreground">Director of Operations · {activeCount} active · {liveCount} live</p>
                </div>
            </div>

            {/* Kanban content */}
            <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {FUNNEL_STATUSES.map(status => {
                const col = projects.filter(p => p.status === status)
                return (
                    <div key={status} className="space-y-3 min-h-[200px]">
                        {/* Column header — label uses text-foreground (high contrast) ·
                            the semantic accent lives in the small colored dot to its left */}
                        <div className="flex items-center justify-between mb-1 px-1">
                            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                                <span className={`inline-block h-2 w-2 rounded-full ${FUNNEL_DOT[status]}`} aria-hidden="true" />
                                {STATUS_LABEL[status]}
                                <span className="bg-muted text-foreground text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums">{col.length}</span>
                            </h4>
                            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Column options" aria-label="Column options">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {col.length === 0 ? (
                            <div className="border-2 border-dashed border-border rounded-xl p-5 text-center">
                                <p className="text-xs text-muted-foreground">No projects</p>
                            </div>
                        ) : col.map(p => {
                            const action = () => p.url
                                ? onOpenFolder?.()
                                : onOpenProject(stepId === 'clc2.3' ? 'review' : 'filter')
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={action}
                                    className="w-full text-left rounded-2xl border border-border bg-card p-3.5 space-y-2.5 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className={`h-8 w-8 rounded-full ${FUNNEL_AVATAR_BG[p.status]} flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-zinc-900`}>
                                            <span className={`text-[10px] font-black ${FUNNEL_AVATAR_TEXT[p.status]}`}>{folderInitials(p.name)}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-semibold text-foreground truncate">{p.name}</div>
                                            <div className="text-[10px] text-muted-foreground truncate">{p.installDate}</div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                                        {p.assetCount} files · {p.flaggedCount > 0 ? `${p.flaggedCount} flagged · ` : ''}{STATUS_LABEL[p.status]}
                                    </p>
                                    <div className="h-px bg-border" />
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-muted-foreground truncate">
                                            {p.url ? (
                                                <span className="inline-flex items-center gap-1 text-info"><ExternalLink className="h-3 w-3" /> Open folder</span>
                                            ) : 'View →'}
                                        </span>
                                        <span className="font-semibold text-foreground tabular-nums">{p.assetCount} <span className="text-muted-foreground font-normal">files</span></span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )
            })}
                </div>
            </div>
        </div>
    )
}

// ─── Row + panels ────────────────────────────────────────────────────────────

function SharePointRow({ project, onOpen, inProgress = false, onOpenFolder }: { project: SeedingProject; onOpen: () => void; inProgress?: boolean; onOpenFolder?: () => void }) {
    const tone = STATUS_TONE[project.status]
    const isPrior = project.status === 'archived'
    return (
        <div className={`grid grid-cols-[28px_1fr_180px_120px_120px] gap-2 px-3 py-3 items-center transition-colors ${isPrior ? 'opacity-75' : 'hover:bg-muted/30'}`}>
            {isPrior ? <Folder className="h-4 w-4 text-muted-foreground" /> : <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
            <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{project.name}</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    {project.assetCount} files
                    {project.flaggedCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-amber-700 dark:text-amber-300">
                            <AlertCircle className="h-3 w-3" />
                            {project.flaggedCount} flagged
                        </span>
                    )}
                </div>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{project.installDate}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider w-fit ${tone}`}>
                {project.status === 'live' ? <CheckCircle2 className="h-3 w-3" /> :
                 project.status === 'archived' ? <CheckCircle2 className="h-3 w-3" /> :
                 project.status === 'publishing' ? <Sparkles className="h-3 w-3" /> :
                 project.status === 'reviewing' ? <FileText className="h-3 w-3" /> :
                 <FolderOpen className="h-3 w-3" />}
                {STATUS_LABEL[project.status]}
            </span>
            <div className="text-right">
                {project.url ? (
                    <button
                        onClick={onOpenFolder}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline"
                        title="Open the SharePoint folder · simulated view"
                    >
                        Open folder <ExternalLink className="h-3 w-3" />
                    </button>
                ) : isPrior ? (
                    <span className="text-[11px] text-muted-foreground">archived</span>
                ) : inProgress ? (
                    <button
                        onClick={onOpen}
                        title="The consolidation modal is already open · click resumes focus on it"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold border border-ai/40 text-ai bg-ai/10 rounded-md hover:bg-ai/15 transition-colors"
                    >
                        <Sparkles className="h-3 w-3" />
                        In progress
                    </button>
                ) : (
                    <button onClick={onOpen} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                        Open
                    </button>
                )}
            </div>
        </div>
    )
}

function ProjectsSummaryPanel({ projects }: { projects: SeedingProject[] }) {
    return (
        <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground">Seeding queue</h3>
            </div>
            <ul className="space-y-1.5">
                {projects.map(p => (
                    <li key={p.id} className="flex items-center gap-2 text-xs">
                        <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider w-fit ${STATUS_TONE[p.status]}`}>
                            {STATUS_LABEL[p.status]}
                        </span>
                        <span className="text-foreground truncate">{p.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function FlaggedAssetsPanel() {
    return (
        <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                <h3 className="text-sm font-bold text-foreground">Flagged assets</h3>
            </div>
            {FAIRPORT_VENDOR_JOBS.flatMap(v => v.assets.filter(a => a.aiFlagged).map(a => ({ vendor: v.vendor, asset: a }))).map(({ vendor, asset }) => (
                <div key={asset.id} className="rounded-md border border-amber-200 bg-amber-50/40 dark:border-amber-500/30 dark:bg-amber-500/10 p-2.5">
                    <div className="text-[11px] font-bold text-foreground">{asset.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Vendor · {vendor}</div>
                    <p className="text-[11px] text-foreground mt-1 leading-snug">{asset.flagReason}</p>
                </div>
            ))}
        </div>
    )
}

function SimpleList({ items, emptyMessage }: { items: string[]; emptyMessage: string }) {
    return (
        <div className="p-3">
            {items.length === 0 ? (
                <p className="text-xs text-muted-foreground">{emptyMessage}</p>
            ) : (
                <ul className="space-y-1">
                    {items.map((s, i) => (
                        <li key={i} className="text-xs text-foreground truncate">· {s}</li>
                    ))}
                </ul>
            )}
        </div>
    )
}
