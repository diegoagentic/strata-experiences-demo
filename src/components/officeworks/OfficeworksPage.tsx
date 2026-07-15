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

import { useState } from 'react'
import { Pencil, LayoutDashboard, ClipboardCheck, Send, Inbox } from 'lucide-react'
import MBIPageShell from '../mbi/MBIPageShell'
import { useDemo } from '../../context/DemoContext'

import OfficeworksFunnel from './OfficeworksFunnel'
import OfficeworksDocumentReviewModal, { type OfficeworksReviewStage } from './OfficeworksDocumentReviewModal'
import OfficeworksDashboardScene from './OfficeworksDashboardScene'
import OfficeworksStepNotification from './OfficeworksStepNotification'

// Hero scenes used as fullContent inside the modal at their stages
import SelfAuditScene from './SelfAuditScene'
import PeerReviewScene from './PeerReviewScene'
import AckReviewScene from './AckReviewScene'

// ─── Map currentStep.id → modal stage ─────────────────────────────────────────

function stepIdToStage(stepId: string | undefined): OfficeworksReviewStage {
    switch (stepId) {
        case 'sc1.0':   return 'intake'
        case 'sc1.1':   return 'kickoff'
        case 'sc1.2':   return 'design'
        case 'sc1.2b':  return 'bom-gen'
        case 'sc1.3':   return 'validation'
        case 'sc1.3b':  return 'field-verify'
        case 'sc1.4':   return 'sq-check'
        case 'sc1.5':   return 'teknion-preview'
        case 'sc1.5b':  return 'spec-gap'
        case 'sc1.5c':  return 'phasing'
        case 'sc1.6':   return 'self-audit'
        case 'sc1.7':   return 'peer-review'
        case 'sc1.8':   return 'submission'
        case 'sc1.8b':  return 'handoff'
        case 'sc1.9':   return 'ack-review'
        default:        return 'intake'
    }
}

// ─── Step-start notifications (early-funnel steps only) ───────────────────────

const STEP_NOTIFICATIONS: Record<string, { title: string; desc: string; cta: string }> = {
    'sc1.0': {
        title: 'New project intake · MANATT 4th Floor',
        desc: 'Caitlin Barolet (DC) submitted the Works form · CAD file missing · SQ blank for the GSA client. Strata drafted the clarifying email and surfaced the capacity heatmap for assignment.',
        cta: 'Review & assign designer',
    },
    'sc1.1': {
        title: 'Assignment received · MANATT 4th Floor',
        desc: 'Felicia assigned you the project · kickoff with Caitlin Barolet ready to schedule · scope confirmation needed before CET drawing can start.',
        cta: 'Open kickoff briefing',
    },
    'sc1.2': {
        title: 'Kickoff complete · ready for CET design',
        desc: 'Scope confirmed · ~30 stations · Standard/Large · Flintwood 5N White Oak finishes. Optional DDP parallel BOM available for RFP volume discount.',
        cta: 'Open CET workspace',
    },
}

const STEP_ICONS_BY_APP: Record<string, React.ReactElement> = {
    'officeworks-intake':      <Inbox className="h-5 w-5" />,
    'officeworks-design':      <Pencil className="h-5 w-5" />,
    'officeworks-spec-check':  <ClipboardCheck className="h-5 w-5" />,
    'officeworks-submission':  <Send className="h-5 w-5" />,
    'officeworks-dashboard':   <LayoutDashboard className="h-5 w-5" />,
}

const STEP_TITLES_BY_APP: Record<string, string> = {
    'officeworks-intake':      'Intake',
    'officeworks-design':      'Design',
    'officeworks-spec-check':  'Spec Check',
    'officeworks-submission':  'Submission',
    'officeworks-dashboard':   'Design Dashboard',
}

// ─── Main page component ──────────────────────────────────────────────────────

export default function OfficeworksPage() {
    const { currentStep, nextStep } = useDemo()
    // Funnel-first: modal opens only when user clicks "Review →" in the MANATT card
    // or the step notification CTA. Manager-driven (not auto-driven).
    const [isModalOpen, setIsModalOpen] = useState(false)
    // Active designer assignment for MANATT · selected via IntakeAssignPanel or Dashboard
    const [assignedDesigner, setAssignedDesigner] = useState<string | null>(null)
    // Track which step's notification was dismissed (re-arms when stepId changes)
    const [dismissedStepNotif, setDismissedStepNotif] = useState<string | null>(null)

    const stepId = currentStep?.id
    const stage = stepIdToStage(stepId)
    const app = currentStep?.app ?? 'officeworks-spec-check'
    const icon = STEP_ICONS_BY_APP[app] ?? <ClipboardCheck className="h-5 w-5" />
    const pageTitle = STEP_TITLES_BY_APP[app] ?? 'Spec Check'

    const stepNotif = stepId ? STEP_NOTIFICATIONS[stepId] : undefined
    const showNotif = !!stepNotif && stepId !== dismissedStepNotif && !isModalOpen

    const handleClose = () => setIsModalOpen(false)

    const handleValidate = () => {
        setIsModalOpen(false)
        // brief pause so user sees modal close before next step renders
        setTimeout(() => nextStep(), 200)
    }

    const handleNotifAction = () => {
        if (stepId) setDismissedStepNotif(stepId)
        setIsModalOpen(true)
    }

    const handleNotifDismiss = () => {
        if (stepId) setDismissedStepNotif(stepId)
    }

    // Pick hero scene as fullContent when at hero stages
    let fullContent: React.ReactNode | undefined
    if (stage === 'self-audit') {
        fullContent = <SelfAuditScene onContinue={handleValidate} />
    } else if (stage === 'peer-review') {
        fullContent = <PeerReviewScene onContinue={handleValidate} />
    } else if (stage === 'ack-review') {
        fullContent = <AckReviewScene onContinue={handleValidate} />
    }

    return (
        <MBIPageShell
            title={pageTitle}
            tenantLabel="Officeworks"
            productLabel="Strata for Officeworks"
            icon={icon}
        >
            <div className="space-y-4 animate-in fade-in duration-500">
                {/* Step notification banner · auto-shows on entry for sc1.0/sc1.1/sc1.2 */}
                {showNotif && stepNotif && stepId && (
                    <OfficeworksStepNotification
                        key={stepId}
                        title={stepNotif.title}
                        desc={stepNotif.desc}
                        cta={stepNotif.cta}
                        onAction={handleNotifAction}
                        onDismiss={handleNotifDismiss}
                    />
                )}

                <OfficeworksFunnel
                    onOpenReview={() => setIsModalOpen(true)}
                    hideReviewCta={isModalOpen}
                    assignedDesigner={assignedDesigner}
                />
            </div>

            <OfficeworksDocumentReviewModal
                isOpen={isModalOpen}
                onClose={handleClose}
                stage={stage}
                onValidate={handleValidate}
                fullContent={fullContent}
                assignedDesigner={assignedDesigner}
                onAssignDesigner={setAssignedDesigner}
            />
        </MBIPageShell>
    )
}

// ─── Dashboard tab (persistent, no demo step) ─────────────────────────────────

export function OfficeworksDashboardPage() {
    return (
        <MBIPageShell
            title="Design Dashboard"
            tenantLabel="Officeworks"
            productLabel="Strata for Officeworks"
            icon={<LayoutDashboard className="h-5 w-5" />}
        >
            <div className="animate-in fade-in duration-500">
                <OfficeworksDashboardScene />
            </div>
        </MBIPageShell>
    )
}
