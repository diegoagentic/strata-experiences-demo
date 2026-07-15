/**
 * COMPONENT: OfficeworksDocumentReviewModal
 * PURPOSE: Stage-adaptive document review modal · Manager opens it from
 *          the OfficeworksFunnel to drill into MANATT project at any stage.
 *
 * CLONE OF: src/components/bfi/BFIDocumentReviewModal.tsx (simplified shell)
 *
 * STAGE: one of 15 — matches every demo step
 * LAYOUT:
 *   - Header (project · stage progress · close)
 *   - AI context banner (per stage)
 *   - Split pane: Left doc tabs (3/5) · Right stage panel (2/5)
 *   - Footer: Approve & Continue CTA → calls onValidate (= nextStep)
 *
 * DS TOKENS: bg-card · bg-ai/X · text-foreground · semantic only
 */

import { useState } from 'react'
import { Sparkles, FileText, MapPin, ClipboardCheck, ArrowRight, AlertCircle, CheckCircle2, FileWarning, Image as ImageIcon, Eye, UserCheck, Users } from 'lucide-react'
import { SplitPaneReviewModal } from 'strata-design-system'
import { useDemo } from '../../context/DemoContext'
import { MANATT_ORDER_META } from './shared/manattOrderData'
import { OFFICEWORKS_FUNNEL } from './shared/funnelStages'
import BOMTable from './shared/BOMTable'
import CapacityHeatmap from './shared/CapacityHeatmap'
import { OFFICEWORKS_PDFS } from './shared/PDFPreviewModal'
import { findDesigner, regionLabel } from './shared/designerProfiles'

// 15 stages matching demo steps (see plan)
export type OfficeworksReviewStage =
    | 'intake' | 'kickoff' | 'design' | 'bom-gen' | 'validation' | 'field-verify'
    | 'sq-check' | 'teknion-preview' | 'spec-gap' | 'phasing'
    | 'self-audit' | 'peer-review' | 'submission' | 'handoff' | 'ack-review'

// Stage → funnel column index (5 cols: intake / design / spec-check / submission / ack)
const STAGE_TO_COL: Record<OfficeworksReviewStage, number> = {
    'intake': 0, 'kickoff': 1, 'design': 1, 'bom-gen': 1, 'validation': 1, 'field-verify': 1, 'sq-check': 1,
    'teknion-preview': 2, 'spec-gap': 2, 'phasing': 2, 'self-audit': 2, 'peer-review': 2,
    'submission': 3, 'handoff': 3,
    'ack-review': 4,
}

const STAGE_LABELS: Record<OfficeworksReviewStage, string> = {
    'intake':           'Intake review · CAD missing',
    'kickoff':          'Kickoff call · scope + project size',
    'design':           'CET design',
    'bom-gen':          'BOM generation',
    'validation':       'Validation document · client approval',
    'field-verify':     'Field verification handoff',
    'sq-check':         'SQ / price-protected check',
    'teknion-preview':  'Teknion Order Preview',
    'spec-gap':         'Resolve specification gaps',
    'phasing':          'Order phasing strategy',
    'self-audit':       'Self-audit · BOM × 6 attributes',
    'peer-review':      'Peer review · Rebecca Warren',
    'submission':       'BOM submission · PDF + SP4',
    'handoff':          'Coordinator handoff · NetSuite',
    'ack-review':       'Acknowledgment review · Gemini supercharge',
}

const STAGE_AI_BANNER: Record<OfficeworksReviewStage, string> = {
    'intake':           '75-80% of Works forms arrive incomplete · Strata detected missing CAD + blank SQ · email drafted to Caitlin',
    'kickoff':          'Auto-transcribe + checklist of unclarified items · GW1B project size selector',
    'design':           'CET layout · 71 lines · Flintwood 5N White Oak finish · DDP parallel optional',
    'bom-gen':          'CAP generates BOM · 71 lines across 4 Tags · List $296,228 / Net $61,464.80 · 13 CRs (25-40 days)',
    'validation':       'Google Slides auto-compiled · client approval gate · GW2A revision type sub-gateway',
    'field-verify':     'Pre-installation drawings sent to Abigail PM · field verification BEFORE Teknion order',
    'sq-check':         'MANATT GSA · SQ #436533 confirmed · Create platform inline · 2025 catalog vigente',
    'teknion-preview':  'Tifani returns preview · 1-2 weeks · GW3: clean / spec gap / timeline conflict',
    'spec-gap':         'Spec gap on CR 2046138 (40-day leadtime) · Strata suggests fix · resubmit preview',
    'phasing':          'Teknion can\'t meet date · 3-way huddle Designer + PM + Salesperson · phased plan',
    'self-audit':       'Kimberly checks her own BOM · 5-step audit · 71 lines × 6 attrs · 13 CRs · Today: 6h paper. With Strata: 25min.',
    'peer-review':      'Rebecca reviews Kimberly\'s audit · Felicia\'s tacit knowledge surfaces as rules (SC7)',
    'submission':       'BOM PDF + SP4 file to Caitlin + Coordinator · OW Best Practice template',
    'handoff':          'Coordinator uploads SP4 to NetSuite · 79% discount · Caitlin releases PO to Teknion',
    'ack-review':       'Gemini already in use · Strata supercharges · 71-line diff · 2 EE terminal states',
}

// ─── Sub-component: Stage progress stepper (5 stages) ──────────────────────────

function StageProgress({ activeCol }: { activeCol: number }) {
    return (
        <div className="flex items-center gap-1">
            {OFFICEWORKS_FUNNEL.map((s, i) => {
                const isPast = i < activeCol
                const isActive = i === activeCol
                return (
                    <Fragment key={s.id}>
                        <div className={`flex items-center gap-1.5 px-2.5 h-7 rounded-md text-[11px] font-medium ${
                            isActive ? 'bg-primary text-primary-foreground' :
                            isPast ? 'bg-success/10 text-success' :
                            'bg-muted text-muted-foreground'
                        }`}>
                            <span className="font-mono tabular-nums">{i + 1}</span>
                            <span>{s.label}</span>
                        </div>
                        {i < OFFICEWORKS_FUNNEL.length - 1 && (
                            <div className={`h-px w-3 ${isPast ? 'bg-success/40' : 'bg-border'}`} />
                        )}
                    </Fragment>
                )
            })}
        </div>
    )
}

// ─── Document tabs (left panel) ────────────────────────────────────────────────

const DOC_TABS = [
    { id: 'works-form' as const, icon: FileText, label: 'Works Form' },
    { id: 'bom' as const,        icon: ClipboardCheck, label: 'BOM' },
    { id: 'validation' as const, icon: FileText, label: 'Validation Doc' },
    { id: 'floor-plan' as const, icon: MapPin, label: 'Floor Plan' },
    { id: 'ack' as const,        icon: FileText, label: 'Acknowledgment' },
] as const

type DocTab = typeof DOC_TABS[number]['id']

// Default doc tab per stage (which document is most relevant)
const DEFAULT_DOC: Record<OfficeworksReviewStage, DocTab> = {
    'intake': 'works-form', 'kickoff': 'works-form',
    'design': 'floor-plan', 'bom-gen': 'bom', 'validation': 'validation', 'field-verify': 'floor-plan',
    'sq-check': 'bom', 'teknion-preview': 'bom', 'spec-gap': 'bom', 'phasing': 'bom',
    'self-audit': 'bom', 'peer-review': 'bom',
    'submission': 'bom', 'handoff': 'bom',
    'ack-review': 'ack',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    isOpen: boolean
    onClose: () => void
    stage: OfficeworksReviewStage
    /** Called when user clicks "Approve & Continue" — advances demo */
    onValidate: () => void
    /** Optional override for the right-panel content (used by parent to inject hero scenes) */
    rightPanelOverride?: React.ReactNode
    /** Optional override for the left doc panel (default shows BOM/floor plan placeholders) */
    leftPanelOverride?: React.ReactNode
    /** Bypass split-pane entirely · use full modal body for the content (hero scenes) */
    fullContent?: React.ReactNode
    /** Currently assigned designer (passed in from parent state) · used by IntakeAssignPanel */
    assignedDesigner?: string | null
    /** Called when user assigns/changes a designer from inside the modal */
    onAssignDesigner?: (name: string) => void
}

export default function OfficeworksDocumentReviewModal({
    isOpen, onClose, stage, onValidate, rightPanelOverride, leftPanelOverride, fullContent,
    assignedDesigner, onAssignDesigner,
}: Props) {
    const { isSidebarCollapsed, isDemoActive } = useDemo()
    const leftOffset = isDemoActive && !isSidebarCollapsed ? 'left-80' : 'left-0'
    const activeCol = STAGE_TO_COL[stage]
    const label = STAGE_LABELS[stage]
    const aiBanner = STAGE_AI_BANNER[stage]

    const subtitle = `${MANATT_ORDER_META.sqName} · ${MANATT_ORDER_META.poNumber} · ${label}`
    const isIntakeInteractive = !rightPanelOverride && stage === 'intake'

    const rightPane = isIntakeInteractive ? (
        <IntakeAssignPanel
            assignedDesigner={assignedDesigner ?? null}
            onAssignDesigner={onAssignDesigner}
            onValidate={onValidate}
        />
    ) : (
        <div className="flex-1 overflow-y-auto p-5">
            {rightPanelOverride ?? <DefaultStagePanel stage={stage} onValidate={onValidate} />}
        </div>
    )

    const footer = (!fullContent && !rightPanelOverride && !isIntakeInteractive) ? (
        <button
            type="button"
            onClick={onValidate}
            className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
        >
            Approve & Continue
            <ArrowRight className="h-4 w-4" />
        </button>
    ) : null

    return (
        <SplitPaneReviewModal
            open={isOpen}
            onClose={onClose}
            sidebarOffsetClass={leftOffset}
            title="Document Review — MANATT 4th Floor"
            subtitle={subtitle}
            headerCenter={<StageProgress activeCol={activeCol} />}
            aiBanner={<><span className="font-bold">Strata AI · </span>{aiBanner}</>}
            leftPane={leftPanelOverride ?? <DefaultDocTabs stage={stage} />}
            rightPane={rightPane}
            fullContent={fullContent ? <div className="p-5">{fullContent}</div> : undefined}
            footer={footer}
        />
    )
}

// ─── Default doc tabs (left panel) ─────────────────────────────────────────────

function DefaultDocTabs({ stage }: { stage: OfficeworksReviewStage }) {
    const [activeTab, setActiveTab] = useState<DocTab>(DEFAULT_DOC[stage])

    return (
        <>
            {/* Tab bar */}
            <div className="flex items-center gap-0 border-b border-border bg-muted/30 shrink-0 px-4 pt-2 overflow-x-auto">
                {DOC_TABS.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold border-b-2 mr-1 shrink-0 transition-colors ${
                            activeTab === tab.id
                                ? 'border-primary text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <tab.icon className="h-3 w-3" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 min-h-0">
                <DocTabContent tab={activeTab} stage={stage} />
            </div>
        </>
    )
}

// ─── Doc tab content dispatch (real previews) ─────────────────────────────────

function DocTabContent({ tab, stage }: { tab: DocTab; stage: OfficeworksReviewStage }) {
    if (tab === 'works-form') return <WorksFormPreview stage={stage} />
    if (tab === 'bom') return <BOMPreview stage={stage} />
    if (tab === 'validation') return <ValidationDocPreview stage={stage} />
    if (tab === 'floor-plan') return <FloorPlanPreview />
    if (tab === 'ack') return <AckPreview stage={stage} />
    return null
}

// ─── Works Form preview · highlights missing fields at intake ────────────────

interface FormField {
    label: string
    value: string | null
    status: 'complete' | 'missing'
    required: boolean
    note?: string
}

function WorksFormPreview({ stage }: { stage: OfficeworksReviewStage }) {
    // At intake: CAD missing + SQ blank. At other stages: complete (gaps resolved).
    const isIntake = stage === 'intake'

    const fields: FormField[] = [
        { label: 'Client', value: 'Manatt Phelps & Phillips LLP', status: 'complete', required: true },
        { label: 'Project', value: 'MANATT · 4th Floor · Workstations', status: 'complete', required: true },
        { label: 'Market', value: 'DC (Washington D.C.)', status: 'complete', required: true },
        { label: 'Scope', value: '~30 workstations · Standard/Large', status: 'complete', required: true },
        { label: 'Submitted by', value: 'Caitlin Barolet · DC Salesrep', status: 'complete', required: true },
        { label: 'Co-submitter', value: 'Danielle Dunlap', status: 'complete', required: false },
        { label: 'CAD file (.dwg)', value: isIntake ? null : 'manatt-4th-floor.dwg · received 18h after submission', status: isIntake ? 'missing' : 'complete', required: true, note: isIntake ? 'Required to start design in CET' : undefined },
        { label: 'PDF floor plan', value: 'manatt-4th-floor-floorplan.pdf', status: 'complete', required: false },
        { label: 'SQ number (price-protected)', value: isIntake ? null : `#${MANATT_ORDER_META.specialQuote}`, status: isIntake ? 'missing' : 'complete', required: true, note: isIntake ? 'GSA client · price protection required' : undefined },
        { label: 'Catalog effective', value: isIntake ? 'Strata suggests 2025' : '2025', status: 'complete', required: true },
        { label: 'Due date', value: '2026-03-20 (Sched Ship)', status: 'complete', required: true },
    ]

    const missingCount = fields.filter(f => f.status === 'missing').length

    return (
        <div className="h-full overflow-y-auto p-6 bg-muted/20">
            <div className="bg-card border border-border rounded-xl overflow-hidden max-w-2xl mx-auto">
                {/* Header */}
                <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Google Form · Works Intake</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Submitted 2026-04-16 · auto-routed to 3 design managers</div>
                    </div>
                    {isIntake && missingCount > 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20 rounded-md px-2 py-1 animate-pulse">
                            {missingCount} missing
                        </span>
                    )}
                </div>

                {/* AI helper line at intake */}
                {isIntake && missingCount > 0 && (
                    <div className="px-4 py-2 bg-ai/5 border-b border-ai/20 flex items-start gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                        <div className="text-[11px] text-ai">
                            <span className="font-bold">Strata flagged {missingCount} missing required fields</span> · email drafted to Caitlin Barolet · CAD must arrive before design can start in CET (Task 3)
                        </div>
                    </div>
                )}

                {/* Form fields */}
                <div className="divide-y divide-border">
                    {fields.map((f, i) => (
                        <div
                            key={i}
                            className={`px-4 py-2.5 grid grid-cols-3 gap-3 items-center text-sm ${
                                f.status === 'missing' ? 'bg-warning/5' : ''
                            }`}
                        >
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                {f.label}
                                {f.required && <span className="text-destructive">*</span>}
                            </div>
                            <div className="col-span-2 flex items-center justify-between gap-2">
                                <span className={`text-sm flex-1 truncate ${
                                    f.status === 'missing' ? 'text-warning italic' : 'text-foreground'
                                }`}>
                                    {f.value ?? '— required —'}
                                </span>
                                {f.status === 'missing' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/30 rounded px-1.5 py-0.5 shrink-0 animate-pulse">
                                        <AlertCircle className="h-3 w-3" />
                                        Missing
                                    </span>
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                )}
                            </div>
                            {f.note && (
                                <div className="col-span-3 text-[10px] text-warning italic pl-2 -mt-1">{f.note}</div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 bg-muted/30 border-t border-border text-[10px] text-muted-foreground text-center">
                    The Works form (intranet) · auto-routes to all 3 design managers · 24-48h assignment SLA (not enforced)
                </div>
            </div>
        </div>
    )
}

// ─── BOM tab ──────────────────────────────────────────────────────────────────

function BOMPreview({ stage }: { stage: OfficeworksReviewStage }) {
    // BOM not generated yet for stages before bom-gen
    const preBOMStages: OfficeworksReviewStage[] = ['intake', 'kickoff', 'design']
    const notGenerated = preBOMStages.includes(stage)

    if (notGenerated) {
        return (
            <div className="h-full flex items-center justify-center p-6 bg-muted/20">
                <div className="bg-card border border-dashed border-border rounded-xl p-8 max-w-md text-center space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                        <ClipboardCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">BOM not yet generated</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            Bill of Materials will be exported from CET → CAP after the design phase completes.
                            Currently at stage <span className="font-mono">{stage}</span>.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full overflow-y-auto p-4 bg-muted/20">
            <BOMTable compact />
        </div>
    )
}

// ─── Validation Doc tab ───────────────────────────────────────────────────────

function ValidationDocPreview({ stage }: { stage: OfficeworksReviewStage }) {
    const preValidationStages: OfficeworksReviewStage[] = ['intake', 'kickoff', 'design', 'bom-gen']
    const notCompiled = preValidationStages.includes(stage)

    if (notCompiled) {
        return (
            <div className="h-full flex items-center justify-center p-6 bg-muted/20">
                <div className="bg-card border border-dashed border-border rounded-xl p-8 max-w-md text-center space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">Validation document not yet compiled</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            Google Slides validation doc auto-compiles after BOM is generated.
                            Currently at stage <span className="font-mono">{stage}</span>.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const slides = [
        { title: 'Overall floor plan', content: 'CAD-aligned · 71 stations' },
        { title: '2D drawings', content: 'Workstation typicals · dimensions' },
        { title: '3D renderings', content: 'Detailed product descriptions' },
        { title: 'Finishes', content: 'Mica Very White 83 · Smooth Felt QR Admiral Blue · Flintwood 5N White Oak' },
        { title: 'Wire management', content: 'E-chain · cable wrap · power cubes · monitor arms' },
        { title: 'Electrical', content: 'OWDC code · BF visible · Power Spine 120' },
    ]

    return (
        <div className="h-full overflow-y-auto p-4 bg-muted/20">
            <div className="bg-card border border-border rounded-xl overflow-hidden max-w-2xl mx-auto">
                <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Validation Document · Google Slides</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">MANATT 4th Floor · {MANATT_ORDER_META.poNumber} · auto-compiled</div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 rounded-md px-2 py-1">
                        Approved
                    </span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                    {slides.map((s, i) => (
                        <div key={i} className="bg-muted/30 border border-border rounded-lg aspect-video flex flex-col items-center justify-center text-center p-3 text-xs">
                            <ImageIcon className="h-5 w-5 text-muted-foreground mb-1" />
                            <div className="font-semibold text-foreground">{s.title}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">{s.content}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── Floor Plan tab · simple SVG mock ─────────────────────────────────────────

function FloorPlanPreview() {
    return (
        <div className="h-full overflow-y-auto p-4 bg-muted/20">
            <div className="bg-card border border-border rounded-xl overflow-hidden max-w-3xl mx-auto">
                <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">CAD Floor Plan</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">MANATT 4th Floor · 71 stations · WS-01(10) + WS-02(6)×2 + WS-02.A(8)</div>
                    </div>
                    <span className="text-[10px] text-success font-medium">CAD verified ✓</span>
                </div>
                <div className="p-4 bg-muted/10">
                    <svg viewBox="0 0 400 280" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
                        {/* Floor outline */}
                        <rect x="10" y="10" width="380" height="260" fill="none" stroke="currentColor" className="text-border" strokeWidth="2" />

                        {/* Internal walls */}
                        <line x1="200" y1="10" x2="200" y2="170" stroke="currentColor" className="text-border" strokeWidth="1" />
                        <line x1="10" y1="170" x2="200" y2="170" stroke="currentColor" className="text-border" strokeWidth="1" />

                        {/* Workstation pictograms · WS-01 (10) bottom-left */}
                        <text x="20" y="195" fill="currentColor" className="text-[8px] fill-current text-muted-foreground" fontSize="8">WS-01 (10)</text>
                        {Array.from({ length: 10 }).map((_, i) => {
                            const col = i % 5
                            const row = Math.floor(i / 5)
                            return (
                                <rect
                                    key={`ws1-${i}`}
                                    x={20 + col * 32}
                                    y={205 + row * 24}
                                    width="28" height="20"
                                    className="fill-primary/30 stroke-primary"
                                    strokeWidth="1"
                                    rx="2"
                                />
                            )
                        })}

                        {/* WS-02 (6+6) top-left */}
                        <text x="20" y="30" fill="currentColor" className="text-[8px] fill-current text-muted-foreground" fontSize="8">WS-02 (12)</text>
                        {Array.from({ length: 12 }).map((_, i) => {
                            const col = i % 6
                            const row = Math.floor(i / 6)
                            return (
                                <rect
                                    key={`ws2-${i}`}
                                    x={20 + col * 28}
                                    y={40 + row * 22}
                                    width="24" height="18"
                                    className="fill-info/30 stroke-info"
                                    strokeWidth="1"
                                    rx="2"
                                />
                            )
                        })}

                        {/* WS-02.A (8) right side */}
                        <text x="220" y="30" fill="currentColor" className="text-[8px] fill-current text-muted-foreground" fontSize="8">WS-02.A (8)</text>
                        {Array.from({ length: 8 }).map((_, i) => {
                            const col = i % 4
                            const row = Math.floor(i / 4)
                            return (
                                <rect
                                    key={`ws2a-${i}`}
                                    x={220 + col * 38}
                                    y={40 + row * 26}
                                    width="34" height="22"
                                    className="fill-warning/30 stroke-warning"
                                    strokeWidth="1"
                                    rx="2"
                                />
                            )
                        })}

                        {/* Common area · right bottom */}
                        <text x="240" y="195" fill="currentColor" className="text-[8px] fill-current text-muted-foreground" fontSize="8">Conference + Break</text>
                        <rect x="220" y="200" width="160" height="60" className="fill-muted stroke-border" strokeWidth="1" rx="3" />

                        {/* Compass */}
                        <text x="370" y="22" className="text-[10px] fill-current text-muted-foreground" fontSize="10">N ↑</text>
                    </svg>
                </div>
                <div className="px-4 py-2.5 bg-muted/30 border-t border-border text-[10px] text-muted-foreground text-center">
                    {MANATT_ORDER_META.sqName} · {MANATT_ORDER_META.poNumber} · DC market · 4th Floor
                </div>
            </div>
        </div>
    )
}

// ─── Acknowledgment tab · real PDF iframe at ack-review · placeholder otherwise ─

function AckPreview({ stage }: { stage: OfficeworksReviewStage }) {
    if (stage !== 'ack-review') {
        return (
            <div className="h-full flex items-center justify-center p-6 bg-muted/20">
                <div className="bg-card border border-dashed border-border rounded-xl p-8 max-w-md text-center space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                        <FileWarning className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">Acknowledgment not yet received</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            Teknion acknowledgment arrives after the Sales Coordinator releases the PO (stage <span className="font-mono">handoff</span>).
                            Currently at stage <span className="font-mono">{stage}</span>.
                        </p>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="h-full flex flex-col bg-muted/20">
            <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center gap-2 shrink-0">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Real Teknion Acknowledgment · {MANATT_ORDER_META.poNumber}
                </div>
                <span className="ml-auto text-[10px] text-success font-medium">Universal #{MANATT_ORDER_META.universal}</span>
            </div>
            <iframe
                src={OFFICEWORKS_PDFS.poAcknowledgment}
                title="PO-DC-0009642 Acknowledgment"
                className="flex-1 w-full border-0 bg-card"
            />
        </div>
    )
}

// ─── Default right panel (used for stages without a hero override) ─────────────

interface PanelProps { stage: OfficeworksReviewStage; onValidate: () => void }

function DefaultStagePanel({ stage }: PanelProps) {
    const intro: Record<OfficeworksReviewStage, { headline: string; body: React.ReactNode; cta?: string }> = {
        'intake': {
            headline: 'Form completeness · Assign designer',
            body: <>
                <p>Caitlin Barolet submitted the Works form for MANATT 4th Floor. <span className="text-warning font-medium">CAD file missing</span>, <span className="text-warning font-medium">SQ blank</span>.</p>
                <p className="mt-2">Strata drafted a clarifying email to Caitlin and surfaced the capacity heatmap. Felicia can assign now or proceed to kickoff in parallel (GW1 soft check).</p>
            </>,
            cta: 'Request CAD + assign designer',
        },
        'kickoff': {
            headline: 'Kickoff scope + project size (GW1B)',
            body: <>
                <p>Kimberly + Caitlin · scope checklist auto-populated from form gaps. Audio transcribed.</p>
                <p className="mt-2">Project size: <span className="font-medium text-foreground">Standard/Large</span> (~30 stations) → full flow. Small (1-5 stations) would bypass Tasks 3, 5, 6, 7.</p>
            </>,
            cta: 'Confirm scope · continue',
        },
        'design': {
            headline: 'CET layout in progress',
            body: <p>Kimberly drawing 32 typicals across 4 tag groups (WS-01/02/02/02.A) · Level 4. Teknion part library loaded. <span className="font-medium">Optional DDP parallel:</span> Prepare Deep Discounting BOM for volume discount negotiation.</p>,
            cta: 'Export to CAP',
        },
        'bom-gen': {
            headline: 'CAP exports BOM · 71 line items',
            body: <p>Specifications + electrical coordination embedded here (not standalone steps). Subtotals grouped per Tag (Alias 1) + Level 4 (Alias 2). List Total ${MANATT_ORDER_META.listTotal.toLocaleString()}.</p>,
            cta: 'Continue to validation',
        },
        'validation': {
            headline: 'Client approval gate (GW2A)',
            body: <p>Google Slides validation doc compiled (2D/3D drawings, finishes, electrical). Sent to MANATT for approval. <span className="text-warning font-medium">Primary delay driver.</span> If revisions: layout change → Task 3 (CET) · BOM-only → Task 4 (CAP).</p>,
            cta: 'Client approved · proceed',
        },
        'field-verify': {
            headline: 'Field verification (PM handoff)',
            body: <p>Pre-installation drawings (2D dimensions + blocking + electrical) sent to Abigail's PM team. Field verification happens <span className="font-medium">BEFORE order placed</span> with Teknion. Confirms GC built space to spec.</p>,
            cta: 'Field verification complete',
        },
        'sq-check': {
            headline: 'SQ #436533 · price-protected GSA',
            body: <p>MANATT is a price-protected law firm. Strata embeds the Teknion Create platform inline (no context switch · SC3 dramatized). Verifying SQ #436533 + 2025 catalog effective date.</p>,
            cta: 'Confirm SQ · use 2025 catalog',
        },
        'teknion-preview': {
            headline: 'Order Preview submitted to Tifani',
            body: <p>Form auto-filled from BOM. Submitted. Tifani's typical turnaround 1-2 weeks. <span className="font-medium">GW3 outcomes:</span> clean → audit · spec gap → Task 7A · timeline conflict → Task 7B phasing.</p>,
            cta: 'Tifani: clean · proceed to audit',
        },
        'spec-gap': {
            headline: 'Resolve specification gaps',
            body: <p>Tifani flagged a spec gap on a 40-day CR. Strata suggests the fix · designer accepts/edits · BOM revised · preview resubmitted (sub-loop back to GW3).</p>,
            cta: 'Apply fix · resubmit preview',
        },
        'phasing': {
            headline: '3-way order phasing huddle',
            body: <p>Teknion can't meet Must-Arrive Date due to 40-day Flintwood CRs. 3-way comms: Designer + PM (Abigail) + Salesperson (Caitlin). Long-lead items phased into subsequent deliveries.</p>,
            cta: 'Phased plan accepted',
        },
        'self-audit':  { headline: 'Self-audit panel', body: <p>Hero panel · see right side.</p> },
        'peer-review': { headline: 'Peer review panel', body: <p>Hero panel · see right side.</p> },
        'submission': {
            headline: 'BOM Submission email',
            body: <p>Standard template auto-filled. Two attachments: BOM PDF + SP4 file (NetSuite-ready). Strata pre-validates SP4 against schema before send. Sent to Caitlin Barolet + Sales Coordinator.</p>,
            cta: 'Send to Caitlin + Coordinator',
        },
        'handoff': {
            headline: 'Coordinator → Salesperson handoff',
            body: <p>Cross-lane: Coordinator uploads SP4 to NetSuite + applies discount (79% off list = ${MANATT_ORDER_META.netTotal.toLocaleString()} net). Then Salesperson Caitlin releases the PO to Teknion (PO-DC-0009642 generated).</p>,
            cta: 'Wait for Teknion acknowledgment',
        },
        'ack-review': { headline: 'Acknowledgment review', body: <p>Hero panel · see right side.</p> },
    }

    const data = intro[stage]

    return (
        <div className="space-y-4 text-sm">
            <div>
                <h4 className="text-base font-semibold text-foreground">{data.headline}</h4>
                <div className="text-muted-foreground mt-2 leading-relaxed">{data.body}</div>
            </div>
        </div>
    )
}

// ─── IntakeAssignPanel · interactive · CapacityHeatmap embedded ────────────────

interface IntakeAssignPanelProps {
    assignedDesigner: string | null
    onAssignDesigner?: (name: string) => void
    onValidate: () => void
}

function IntakeAssignPanel({ assignedDesigner, onAssignDesigner, onValidate }: IntakeAssignPanelProps) {
    const designerProfile = assignedDesigner ? findDesigner(assignedDesigner) : null

    return (
        <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
                {/* Form completeness summary */}
                <div>
                    <h4 className="text-base font-semibold text-foreground">Form completeness</h4>
                    <ul className="mt-2 space-y-1.5">
                        <li className="flex items-start gap-2 text-xs text-warning">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span><span className="font-semibold">CAD file missing</span> · Strata drafted email to Caitlin Barolet</span>
                        </li>
                        <li className="flex items-start gap-2 text-xs text-warning">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span><span className="font-semibold">SQ blank</span> · GSA price-protected · Strata suggests SQ #{MANATT_ORDER_META.specialQuote} · catalog 2025</span>
                        </li>
                        <li className="flex items-start gap-2 text-xs text-success">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>All other fields complete · proceed in parallel (GW1 soft check)</span>
                        </li>
                    </ul>
                </div>

                {/* Assign designer section */}
                <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            Assign designer
                        </h4>
                        {!assignedDesigner && (
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-warning/10 text-warning border border-warning/20 rounded px-2 py-0.5 animate-pulse">
                                Required
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                        Click any designer below to assign. Felicia recommends <span className="font-medium text-foreground">Kimberly Tucker</span> (PA · 65% utilized · prior MANATT · cross-market).
                    </p>

                    <CapacityHeatmap
                        onSelect={onAssignDesigner}
                        selectedName={assignedDesigner}
                    />

                    {/* Selected designer summary */}
                    {designerProfile && (
                        <div className="mt-3 bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs space-y-1 animate-in fade-in slide-in-from-top-1 duration-300">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-foreground flex items-center gap-1.5">
                                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                                    Assigning to {designerProfile.name}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{designerProfile.seniority}</span>
                            </div>
                            <div className="text-muted-foreground grid grid-cols-2 gap-2">
                                <div><span className="text-[10px] uppercase">Region · </span>{regionLabel(designerProfile.region)}</div>
                                <div><span className="text-[10px] uppercase">Utilization · </span>{designerProfile.utilization}%</div>
                                <div><span className="text-[10px] uppercase">Active · </span>{designerProfile.projects.active.length} projects</div>
                                <div><span className="text-[10px] uppercase">YTD · </span>{designerProfile.projects.completedYTD} completed</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer CTA · enabled only when designer selected */}
            <div className="border-t border-border px-5 py-3 bg-card shrink-0">
                <button
                    type="button"
                    onClick={onValidate}
                    disabled={!assignedDesigner}
                    className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {assignedDesigner ? (
                        <>
                            Approve & Assign · Continue to Kickoff
                            <ArrowRight className="h-4 w-4" />
                        </>
                    ) : (
                        'Select a designer to continue'
                    )}
                </button>
            </div>
        </>
    )
}
