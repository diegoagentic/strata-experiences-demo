/**
 * COMPONENT: OfficeworksPage + OfficeworksDashboardPage
 *
 * REFACTOR Iter 2: Manager-centric architecture.
 *   - OfficeworksPage renders OfficeworksFunnel as the ALWAYS-visible main view.
 *   - When a demo step is active, OfficeworksDocumentReviewModal opens automatically
 *     on top with stage-adaptive content.
 *   - For 3 hero stages (self-audit, peer-review, ack-review), existing scene
 *     components are passed as `fullContent` to preserve their rich logic.
 *   - For 12 simple stages, modal uses its built-in default panels.
 *
 * OfficeworksDashboardPage: standalone export for the persistent Dashboard navbar tab.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, LayoutDashboard, ClipboardCheck, Send, Inbox, Truck, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import MBIPageShell from '../mbi/MBIPageShell'
import { useDemo } from '../../context/DemoContext'

import OfficeworksFunnel from './OfficeworksFunnel'
import OfficeworksDocumentReviewModal, { type OfficeworksReviewStage } from './OfficeworksDocumentReviewModal'
import OfficeworksDashboardScene from './OfficeworksDashboardScene'

// Hero scenes used as fullContent inside the modal at their stages
import PeerReviewScene from './PeerReviewScene'
import AckReviewScene from './AckReviewScene'

// F29 · Spec Check flow stages en orden lineal · usado por el stepper
// inline fuera de tour para navegar los 11 stages sin depender de
// currentStep del DemoContext. Diego 2026-07-23.
const SPEC_CHECK_STAGES_ORDER: OfficeworksReviewStage[] = [
    'intake',           // sc1.0
    'intake-complete',  // sc1.0b
    'design',           // sc1.2
    'sq-check',         // sc1.4
    'teknion-preview',  // sc1.5
    'spec-gap',         // sc1.5b
    'self-audit',       // sc1.6
    'peer-review',      // sc1.7
    'submission',       // sc1.8
    'handoff',          // sc1.8b
    'ack-review',       // sc1.9
]

const STAGE_TITLES: Record<OfficeworksReviewStage, string> = {
    'intake':           'Form arrives · review & send clarification',
    'intake-complete':  'Reply received · assign designer',
    'design':           'Design BOM + Validation Doc',
    'sq-check':         'SQ / price-protected check',
    'teknion-preview':  'Submit Order Preview',
    'spec-gap':         'Resolve spec gaps',
    'self-audit':       'Self-audit BOM · Strata × 6 attrs',
    'peer-review':      'Peer review · save tacit rules',
    'submission':       'BOM submission · email coordinator',
    'handoff':          'Coordinator upload · release PO',
    'ack-review':       'Ack review · Gemini supercharge',
    // Fallbacks para stages L&D/Sales (mantenidos para type completeness)
    'ld-rfp-intake':    'RFP intake', 'ld-takeoff': 'AI takeoff', 'ld-conditions': 'Conditions',
    'ld-vendor-pool':   'Vendor pool', 'ld-bid-send': 'Send bid', 'ld-bid-compare': 'Compare bids',
    'ld-winner-select': 'Winner select', 'ld-final-upload': 'Final quote',
    'sales-inbox':      'Inbox triage', 'sales-intake': 'Opp intake', 'sales-capacity': 'Capacity ledger',
    'sales-assign':     'Assign rep', 'sales-discovery': 'Discovery', 'sales-outreach': 'Outreach',
    'sales-proposal':   'Proposal', 'sales-handoff': 'Close + handoff',
}

// ─── Map currentStep.id → modal stage ─────────────────────────────────────────

function stepIdToStage(stepId: string | undefined): OfficeworksReviewStage {
    switch (stepId) {
        case 'sc1.0':   return 'intake'
        case 'sc1.0b':  return 'intake-complete'
        case 'sc1.2':   return 'design'
        case 'sc1.4':   return 'sq-check'
        case 'sc1.5':   return 'teknion-preview'
        case 'sc1.5b':  return 'spec-gap'
        case 'sc1.6':   return 'self-audit'
        case 'sc1.7':   return 'peer-review'
        case 'sc1.8':   return 'submission'
        case 'sc1.8b':  return 'handoff'
        case 'sc1.9':   return 'ack-review'
        // ─── L&D flow ───────────────────────────────────────────────────────
        case 'sc-LD.0': return 'ld-rfp-intake'
        case 'sc-LD.1': return 'ld-takeoff'
        case 'sc-LD.2': return 'ld-conditions'
        case 'sc-LD.3': return 'ld-vendor-pool'
        case 'sc-LD.4': return 'ld-bid-send'
        case 'sc-LD.5': return 'ld-bid-compare'
        case 'sc-LD.6': return 'ld-winner-select'
        case 'sc-LD.7': return 'ld-final-upload'
        // ─── Sales flow ─────────────────────────────────────────────────────
        case 'sc-S.0':  return 'sales-inbox'
        case 'sc-S.1':  return 'sales-intake'
        case 'sc-S.2':  return 'sales-capacity'
        case 'sc-S.3':  return 'sales-assign'
        case 'sc-S.4':  return 'sales-discovery'
        case 'sc-S.5':  return 'sales-outreach'
        case 'sc-S.6':  return 'sales-proposal'
        case 'sc-S.7':  return 'sales-handoff'
        default:        return 'intake'
    }
}

// When validating these steps, keep the modal open so Flow 2 plays as a
// continuous in-modal journey (Design BOM + Validation Doc + client approval → SQ).
const STAYS_OPEN_WITHIN_FLOW2 = new Set(['sc1.2'])

// ─── Officeworks notification events (dispatched by ActionCenter) ─────────────
// Per P52 contract: every officeworks: custom event opens the review modal.
// The notification configs live in src/components/notifications/ActionCenter.tsx
// (OFFICEWORKS_STEP_NOTIFICATIONS + OFFICEWORKS_SC10_NOTIFICATIONS).
const OFFICEWORKS_NOTIF_EVENTS = [
    'officeworks:intake-ingest',
    'officeworks:intake-reply-open',
    'officeworks:cet-open',
    'officeworks:bom-open',
    'officeworks:sq-open',
    'officeworks:preview-open',
    'officeworks:preview-response-open',
    'officeworks:preview-resubmit-open',
    'officeworks:phasing-open',
    'officeworks:peer-open',
    'officeworks:submission-open',
    'officeworks:po-tracking-open',
    'officeworks:ack-open',
    // Labor & Delivery flow events
    'officeworks:ld-rfp-ingest',
    'officeworks:ld-takeoff-open',
    'officeworks:ld-conditions-open',
    'officeworks:ld-vendor-pool-open',
    'officeworks:ld-bid-send-open',
    'officeworks:ld-bid-compare-open',
    'officeworks:ld-winner-select-open',
    'officeworks:ld-final-upload-open',
    // Sales flow events
    'officeworks:sales-inbox-ingest',
    'officeworks:sales-intake-open',
    'officeworks:sales-capacity-open',
    'officeworks:sales-assign-open',
    'officeworks:sales-discovery-open',
    'officeworks:sales-outreach-open',
    'officeworks:sales-proposal-open',
    'officeworks:sales-handoff-open',
] as const

const STEP_ICONS_BY_APP: Record<string, React.ReactElement> = {
    'officeworks-intake':      <Inbox className="h-5 w-5" />,
    'officeworks-design':      <Pencil className="h-5 w-5" />,
    'officeworks-spec-check':  <ClipboardCheck className="h-5 w-5" />,
    'officeworks-submission':  <Send className="h-5 w-5" />,
    'officeworks-dashboard':   <LayoutDashboard className="h-5 w-5" />,
    'officeworks-labor':       <Truck className="h-5 w-5" />,
    'officeworks-sales':       <Inbox className="h-5 w-5" />,
}

const STEP_TITLES_BY_APP: Record<string, string> = {
    'officeworks-intake':      'Intake',
    'officeworks-design':      'Design',
    'officeworks-spec-check':  'Spec Check',
    'officeworks-submission':  'Submission',
    'officeworks-dashboard':   'Design Dashboard',
    'officeworks-labor':       'Labor & Delivery',
    'officeworks-sales':       'Sales',
}

// ─── Main page component ──────────────────────────────────────────────────────

export default function OfficeworksPage() {
    const { currentStep, nextStep, isDemoActive } = useDemo()
    // Funnel-first: modal opens via the Metro Legal card's "Review →" button OR
    // when any officeworks:* notification CTA is dispatched from ActionCenter.
    const [isModalOpen, setIsModalOpen] = useState(false)
    // Active designer assignment for Metro Legal · selected via IntakeAssignPanel or Dashboard
    const [assignedDesigner, setAssignedDesigner] = useState<string | null>(null)
    // Peer reviewer picked at sc1.6 (SelfAuditScene → PeerAssignPopover) · propagated to sc1.7
    const [peerReviewerName, setPeerReviewerName] = useState<string | null>(null)
    // L&D · installer pool picked at sc-LD.3 · propagated to sc-LD.4/5 (state
    // kept for future F30 migration · vendor panels aún viven en el modal)
    const [selectedVendorIds, setSelectedVendorIds] = useState<string[] | null>(null)
    // L&D · winner picked at sc-LD.6 · propagated to sc-LD.7
    const [winnerVendorId, setWinnerVendorId] = useState<string | null>(null)

    // F29 · Manual stage state para navegación fuera de tour. Cuando
    // isDemoActive es false, este state controla qué panel se renderea
    // en el modal. Cuando isDemoActive es true, cede control a currentStep.
    const [manualStage, setManualStage] = useState<OfficeworksReviewStage>('intake')

    // F29.f · Reset counter · cada increment forza re-mount del
    // OfficeworksDocumentReviewModal (React reconciler ve nuevo key) ·
    // limpia flowProgress interno (bomUploaded/validationCompiled/etc)
    // + cualquier state local de los panels. Diego 2026-07-23.
    const [resetCounter, setResetCounter] = useState(0)

    const stepId = currentStep?.id
    // F29 · stage dual · derivado de currentStep en tour · del manualStage
    // fuera de tour. Fallback siempre 'intake'.
    const stage: OfficeworksReviewStage = isDemoActive ? stepIdToStage(stepId) : manualStage
    // F22 · fallback 'officeworks-intake' cuando no hay currentStep.
    const app = currentStep?.app ?? 'officeworks-intake'
    const icon = STEP_ICONS_BY_APP[app] ?? <Inbox className="h-5 w-5" />
    const pageTitle = STEP_TITLES_BY_APP[app] ?? 'Intake'
    // Flow derived from current step · drives the funnel + page chrome.
    const flowId = (currentStep?.flowId ?? 'spec-check') as 'spec-check' | 'labor-delivery' | 'sales'

    // F29 · index del stage en el flow Spec Check · usado por el stepper
    // inline. Solo aplica a stages Spec Check (0-10) · L&D/Sales devuelven -1.
    const stageIdx = useMemo(() => SPEC_CHECK_STAGES_ORDER.indexOf(stage), [stage])
    const totalStages = SPEC_CHECK_STAGES_ORDER.length

    // Listen for all officeworks notification CTA events to open the modal
    useEffect(() => {
        const open = () => setIsModalOpen(true)
        OFFICEWORKS_NOTIF_EVENTS.forEach(evt => window.addEventListener(evt, open))
        return () => OFFICEWORKS_NOTIF_EVENTS.forEach(evt => window.removeEventListener(evt, open))
    }, [])

    const handleClose = () => setIsModalOpen(false)

    // F29 · Sincronizar manualStage cuando el tour arranca/termina · así el
    // user retoma navegación desde el último stage visto en el tour.
    useEffect(() => {
        if (!isDemoActive) return
        const derived = stepIdToStage(stepId)
        if (SPEC_CHECK_STAGES_ORDER.includes(derived)) {
            setManualStage(derived)
        }
    }, [isDemoActive, stepId])

    // F29 · Handler dual · si tour activo llama nextStep del DemoContext
    // (comportamiento actual · STAYS_OPEN_WITHIN_FLOW2 para sc1.2). Fuera
    // de tour avanza manualStage al siguiente en SPEC_CHECK_STAGES_ORDER.
    const handleValidate = useCallback(() => {
        if (isDemoActive) {
            const id = currentStep?.id ?? ''
            if (STAYS_OPEN_WITHIN_FLOW2.has(id)) {
                nextStep()
                return
            }
            setIsModalOpen(false)
            setTimeout(() => nextStep(), 200)
            return
        }
        // Fuera de tour · avanza manualStage
        const nextIdx = stageIdx + 1
        if (nextIdx >= totalStages) {
            // Último stage · cerrar modal · reset al intake para próxima apertura
            setIsModalOpen(false)
            setTimeout(() => setManualStage('intake'), 300)
            return
        }
        setManualStage(SPEC_CHECK_STAGES_ORDER[nextIdx])
    }, [isDemoActive, currentStep, nextStep, stageIdx, totalStages])

    // F29 · Prev button · solo aplica fuera de tour.
    const handlePrevStage = useCallback(() => {
        if (isDemoActive || stageIdx <= 0) return
        setManualStage(SPEC_CHECK_STAGES_ORDER[stageIdx - 1])
    }, [isDemoActive, stageIdx])

    // F29 · Reset · vuelve a 'intake' fuera de tour.
    // F29.f · extended · también limpia peer/vendors/winner/designer + fuerza
    // re-mount del modal via resetCounter para limpiar flowProgress interno
    // (bomUploaded, validationCompiled, clientApproved) y state de los panels.
    // Diego 2026-07-23.
    const handleResetStage = useCallback(() => {
        setManualStage('intake')
        setAssignedDesigner(null)
        setPeerReviewerName(null)
        setSelectedVendorIds(null)
        setWinnerVendorId(null)
        setResetCounter(c => c + 1)
    }, [])

    // Pick hero scene as fullContent when at hero stages.
    // sc1.6 'self-audit' uses the standard split-pane pattern · the modal
    // dispatches SelfAuditScene as the right panel so the BOM/Validation Doc
    // tabs stay visible on the left.
    let fullContent: React.ReactNode | undefined
    if (stage === 'peer-review') {
        fullContent = <PeerReviewScene onContinue={handleValidate} peerName={peerReviewerName} />
    } else if (stage === 'ack-review') {
        fullContent = <AckReviewScene onContinue={handleValidate} />
    }

    // F29 · Stepper inline JSX · visible solo cuando modal abierto + no tour.
    const stepperInline = !isDemoActive && isModalOpen && stageIdx >= 0 ? (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/95 backdrop-blur-xl shadow-lg">
            <button
                type="button"
                onClick={handlePrevStage}
                disabled={stageIdx === 0}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-foreground bg-muted hover:bg-muted/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Previous stage"
            >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Prev
            </button>
            <div className="flex flex-col items-center px-3 min-w-0 max-w-xs">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Spec Check · Stage {stageIdx + 1} of {totalStages}
                </p>
                <p className="text-xs font-semibold text-foreground truncate max-w-full">
                    {STAGE_TITLES[stage]}
                </p>
            </div>
            <button
                type="button"
                onClick={handleResetStage}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                aria-label="Reset to first stage"
                title="Reset the Spec Check flow to the first stage"
            >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset
            </button>
            <button
                type="button"
                onClick={handleValidate}
                disabled={stageIdx >= totalStages - 1}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Next stage"
            >
                Next
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
        </div>
    ) : null

    return (
        <MBIPageShell
            title={pageTitle}
            tenantLabel="Dealer Falcon"
            productLabel="Strata for Dealer Falcon"
            icon={icon}
        >
            <div className="space-y-4 animate-in fade-in duration-500">
                {/* Notifications now come from ActionCenter (bell icon in navbar).
                    Each officeworks step has an entry in OFFICEWORKS_STEP_NOTIFICATIONS;
                    the CTA dispatches an officeworks:* custom event that opens the modal. */}
                <OfficeworksFunnel
                    onOpenReview={() => setIsModalOpen(true)}
                    hideReviewCta={isModalOpen}
                    assignedDesigner={assignedDesigner}
                    flowId={flowId}
                />
            </div>

            <OfficeworksDocumentReviewModal
                key={resetCounter}
                isOpen={isModalOpen}
                onClose={handleClose}
                stage={stage}
                onValidate={handleValidate}
                fullContent={fullContent}
                assignedDesigner={assignedDesigner}
                onAssignDesigner={setAssignedDesigner}
                peerReviewerName={peerReviewerName}
                onAssignPeerReviewer={setPeerReviewerName}
                selectedVendorIds={selectedVendorIds}
                onSelectVendors={setSelectedVendorIds}
                winnerVendorId={winnerVendorId}
                onSelectWinner={setWinnerVendorId}
                onReset={handleResetStage}
            />

            {/* F29 · stepper flotante que aparece encima del modal cuando el
                user está fuera del tour · permite navegar los 11 stages del
                Spec Check flow sin dependencia del DemoContext. Diego
                2026-07-23. */}
            {stepperInline}
        </MBIPageShell>
    )
}

// ─── Dashboard tab (persistent, no demo step) ─────────────────────────────────

export function OfficeworksDashboardPage() {
    return (
        <MBIPageShell
            title="Design Dashboard"
            tenantLabel="Dealer Falcon"
            productLabel="Strata for Dealer Falcon"
            icon={<LayoutDashboard className="h-5 w-5" />}
        >
            <div className="animate-in fade-in duration-500">
                <OfficeworksDashboardScene />
            </div>
        </MBIPageShell>
    )
}
