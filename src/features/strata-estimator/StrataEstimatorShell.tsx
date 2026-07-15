// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Shell (main container)
// Phase 3 + 4.8 of WRG Demo v6 implementation
//
// Shell is role-aware: when running inside the WRG demo, it reads the
// currentStep from DemoContext to determine the connected user, the active
// tab, and the visual state (idle / estimation-active / escalated / assembly
// / proposal-review). A HandoffBanner is shown whenever the role changes
// between steps so the narrative of work being passed between David, Alex
// and Sara is visible inside the single collaborative Shell.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, CheckCircle2, MousePointer2, ShieldCheck, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useDemo } from '../../context/DemoContext'
import CoreConnectionModal from './CoreConnectionModal'
import type { CorePhase, CursorTarget } from './CoreConnectionModal'
import SifExportModal from './SifExportModal'
import SifPreviewModal from './SifPreviewModal'
import ProjectContextPanel from './ProjectContextPanel'
import DualEngineCalculation from './DualEngineCalculation'
import CoreOutlookCard from './CoreOutlookCard'
import StrataEstimatorNavbar from './StrataEstimatorNavbar'
import EstimatorDossierCard from './EstimatorDossierCard'
import FinancialSummaryHero from './FinancialSummaryHero'
import BillOfMaterialsTable from './BillOfMaterialsTable'
import OperationalConstraintsPanel from './OperationalConstraintsPanel'
import ProjectsArchiveView from './ProjectsArchiveView'
import PricingWaterfall from './PricingWaterfall'
import VisionEngineModal from './VisionEngineModal'
import HandoffBanner from './HandoffBanner'
import DesignerVerificationOverlay from './DesignerVerificationOverlay'
import ProposalActionBar from './ProposalActionBar'
import type { ProposalActionTarget } from './ProposalActionBar'
import SalespersonActionBar from './SalespersonActionBar'
import ApprovalChainModal from './ApprovalChainModal'
import ReleaseSuccessModal from './ReleaseSuccessModal'
import RequestClarificationModal from './RequestClarificationModal'
import ProposalPdfPreviewModal from './ProposalPdfPreviewModal'
import ScopeBreachAlert from './ScopeBreachAlert'
import FlaggedItemBanner from './FlaggedItemBanner'
import AuditTrailPanel from './AuditTrailPanel'
import type { AuditCategory, AuditEvent } from './AuditTrailPanel'
import RoleHandoffTransition from './RoleHandoffTransition'
import type { HandoffPerson } from './RoleHandoffTransition'
import VerificationLogCard from './VerificationLogCard'
import PMExecutionHandoff from './PMExecutionHandoff'
import DesignerTaskNotification from './DesignerTaskNotification'
import { ROLE_PROFILES } from './roles'
import { calculateInstall } from './calculations'
import { getStepRole, getStepState, getStepTab } from './stepStates'
import {
    DEALERS,
    INITIAL_CONFIG,
    INITIAL_VARIABLES,
    JPS_CONTRACT_DISCOUNT,
    JPS_CUSTOMER,
    JPS_FREIGHT,
    JPS_LINE_ITEMS,
    JPS_PRODUCT_LIST,
    MOCK_SAVED_ESTIMATES,
    SCOPE_LIMITS,
    getAiConfidence,
} from './mockData'
import type { AiConfidence } from './mockData'
import type {
    ConfigState,
    Customer,
    EstimateStatus,
    EstimatorTab,
    LineItem,
    OperationalVariables,
    SavedEstimate,
    SyncStatus,
} from './types'

interface StrataEstimatorShellProps {
    onExit?: () => void
}

export default function StrataEstimatorShell({ onExit: _onExit }: StrataEstimatorShellProps = {}) {
    const { currentStep, nextStep, goToStep, isPaused } = useDemo()
    const stepId = currentStep?.id
    const stepState = getStepState(stepId)
    const connectedUser = getStepRole(stepId) ?? undefined
    const isProposalReview = stepState === 'proposal-review'
    // During w2.2 "Approve & Release", the Shell temporarily redirects to
    // David Park's workspace so the audience watches the notification land
    // in his actual interface before the chain modal opens.
    // See handleApproveRelease below.

    // ── Pause support ─────────────────────────────────────────────────────────
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    const pauseAware = (fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }

    const runChain = (
        events: Array<[number, () => void]>,
        timers: ReturnType<typeof setTimeout>[]
    ) => {
        const sorted = [...events].sort((a, b) => a[0] - b[0])
        const step = (i: number) => {
            if (i >= sorted.length) return
            const prevTime = i === 0 ? 0 : sorted[i - 1][0]
            const delay = Math.max(1, sorted[i][0] - prevTime)
            timers.push(setTimeout(pauseAware(() => { sorted[i][1](); step(i + 1) }), delay))
        }
        step(0)
    }

    // ── State ────────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<EstimatorTab>(getStepTab(stepId))
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')
    const [customer, setCustomer] = useState<Customer>(JPS_CUSTOMER)
    const [lineItems, setLineItems] = useState<LineItem[]>(JPS_LINE_ITEMS)
    const [variables, setVariables] = useState<OperationalVariables>(INITIAL_VARIABLES)
    const [config, setConfig] = useState<ConfigState>(INITIAL_CONFIG)
    const [isSearchingRates, setIsSearchingRates] = useState(false)
    const [lastFile, setLastFile] = useState<{ name: string } | null>(null)
    const [isAiModalOpen, setIsAiModalOpen] = useState(false)
    const [isWaterfallOpen, setIsWaterfallOpen] = useState(false)
    const [isApprovalOpen, setIsApprovalOpen] = useState(false)
    const [isReleaseOpen, setIsReleaseOpen] = useState(false)
    const [isClarificationOpen, setIsClarificationOpen] = useState(false)
    const [isProposalPdfOpen, setIsProposalPdfOpen] = useState(false)
    const [approveReleasePulsed, setApproveReleasePulsed] = useState(false)
    // v8 · w2.2 Riley scripted action bar state
    const [rileyCursorTarget, setRileyCursorTarget] = useState<ProposalActionTarget>(null)
    const [rileyCursorClicked, setRileyCursorClicked] = useState(false)
    const [rileyPulseAssemble, setRileyPulseAssemble] = useState(false)
    const [rileyPulsePreview, setRileyPulsePreview] = useState(false)
    // v8 · w2.1 scripted action bar + David reply card state
    type SalespersonCursor = 'request-clarification' | 'forward' | null
    const [saraCursorTarget, setSaraCursorTarget] = useState<SalespersonCursor>(null)
    const [saraCursorClicked, setSaraCursorClicked] = useState(false)
    const [saraPulseClarify, setSaraPulseClarify] = useState(false)
    const [saraPulseForward, setSaraPulseForward] = useState(false)
    const [davidReplyVisible, setDavidReplyVisible] = useState(false)
    const [davidReplyAccepted, setDavidReplyAccepted] = useState(false)
    const [davidApprovalActive, setDavidApprovalActive] = useState(false)
    const [davidSigned, setDavidSigned] = useState(false)
    const [davidCardVisible, setDavidCardVisible] = useState(false)
    const [davidCursorShown, setDavidCursorShown] = useState(false)
    const [davidClicked, setDavidClicked] = useState(false)
    const [savedEstimates, setSavedEstimates] = useState<SavedEstimate[]>(MOCK_SAVED_ESTIMATES)
    const [isInitialLoading, setIsInitialLoading] = useState(true)

    // ── w1.1 beat timeline state (refinement Phase 2 + 7.1) ──────────────────
    type W21Phase =
        | 'idle'
        | 'importing-files'
        | 'loading-dossier'
        | 'importing-bom'
        | 'mapping-bom'
        | 'scope-breach'
        | 'flagged'
    const [w21Phase, setW21Phase] = useState<W21Phase>('idle')
    // w1.1 pre-phase · CORE connection modal + navbar highlight
    const [importModalOpen, setImportModalOpen] = useState(false)
    const [importModalPhase, setImportModalPhase] = useState<CorePhase>('source-picker')
    const [importModalProgress, setImportModalProgress] = useState(0)
    const [importCursorTarget, setImportCursorTarget] = useState<CursorTarget>(null)
    const [importCursorClicked, setImportCursorClicked] = useState(false)
    const [highlightImportButton, setHighlightImportButton] = useState(false)
    // v8 Paso E · Gap F + B · CORE ↔ Outlook beat cards
    const [outlookIncomingVisible, setOutlookIncomingVisible] = useState(false)
    const [outlookOutgoingVisible, setOutlookOutgoingVisible] = useState(false)
    const [importStatus, setImportStatus] = useState<string | null>(null)
    const [scopeBreachOpen, setScopeBreachOpen] = useState(false)
    const [scopeBreachActive, setScopeBreachActive] = useState(false)
    const [flaggedRowIds, setFlaggedRowIds] = useState<string[]>([])
    const [escalatedAt, setEscalatedAt] = useState<number | null>(null)
    const [verifiedAt, setVerifiedAt] = useState<number | null>(null)
    const [approvedAt, setApprovedAt] = useState<number | null>(null)
    const [designerTaskOpened, setDesignerTaskOpened] = useState(false)
    const [generateCtaPressed, setGenerateCtaPressed] = useState(false)
    const [mappingResolvedCount, setMappingResolvedCount] = useState<number>(Infinity)
    // Dual-engine calculation progress (0 → 1). Default 1 = show real values.
    const [calcProgress, setCalcProgress] = useState<number>(1)
    const calcRafRef = useRef<number | null>(null)

    // ── Role handoff transition (Phase 7.3 — reusable for all 3 swaps) ──────
    interface PendingHandoff {
        from: HandoffPerson
        to: HandoffPerson
        message: string
    }
    const [handoff2, setHandoff2] = useState<PendingHandoff | null>(null)
    const triggerHandoff = (
        from: HandoffPerson,
        to: HandoffPerson,
        message: string
    ) => {
        setHandoff2({ from, to, message })
    }
    const handleHandoffComplete = () => {
        setHandoff2(null)
        if (nextStep) nextStep()
    }

    // ── Audit trail (Pain #4 — structured data layer proof) ─────────────────
    const [auditLog, setAuditLog] = useState<AuditEvent[]>([])
    const logEvent = (actor: string, action: string, category: AuditCategory) => {
        setAuditLog((prev) => [
            ...prev,
            {
                id: `ev-${Date.now()}-${prev.length}`,
                timestamp: Date.now(),
                actor,
                action,
                category,
            },
        ])
    }

    // Derived: AI confidence map for every line item (mock — HIGH / LOW per
    // the WRG assessment's 85/15 template-vs-fallback split).
    const confidenceMap = useMemo<Record<string, AiConfidence>>(() => {
        return Object.fromEntries(
            lineItems.map((item) => [item.id, getAiConfidence(item.id)])
        )
    }, [lineItems])

    // Derived: sticky scope breach badge (shown after the transient alert
    // fades so the state stays visible throughout w1.1-w2.2).
    const scopeBreachBadge = scopeBreachActive
        ? { category: SCOPE_LIMITS.KD_CHAIRS.category, count: 119, limit: SCOPE_LIMITS.KD_CHAIRS.limit }
        : null

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

    // ── Derived: financial estimate (pure calc) ──────────────────────────────
    const estimate = useMemo(
        () => calculateInstall(lineItems, variables, config),
        [lineItems, variables, config]
    )

    // ── w1.1 beat timeline ───────────────────────────────────────────────────
    // Runs every time the demo enters w1.1 (first entry + every restart). The
    // Shell resets to an empty-ish state and then plays the narrative:
    //   importing-files → loading-dossier → importing-bom (stagger) →
    //   scope-breach → flagged
    useEffect(() => {
        if (stepId !== 'w1.1') return

        // v8 · w1.1 is the first step — always clear any leftover inline
        // handoff banner (e.g. after a demo restart from a later step)
        // so the page arrives clean.
        setHandoff(null)

        // Reset the Shell to the "just arrived from CORE" state
        setCustomer({ ...JPS_CUSTOMER, zipCode: '', address: '' })
        setLineItems([])
        setVariables(INITIAL_VARIABLES)
        setScopeBreachOpen(false)
        setScopeBreachActive(false)
        setFlaggedRowIds([])
        setImportStatus(null)
        setW21Phase('importing-files')
        setHighlightImportButton(false) // stays false while outlook card shows
        setImportModalOpen(false)
        setImportModalPhase('source-picker')
        setImportModalProgress(0)
        setImportCursorTarget(null)
        setImportCursorClicked(false)
        setOutlookIncomingVisible(true) // v8 Paso E · Gap F — CORE → Outlook
        setOutlookOutgoingVisible(false)
        setMappingResolvedCount(0) // all rows will first appear as chips
        setCalcProgress(0) // hero starts at $0 and counts up during the calc beat
        setEscalatedAt(null) // drop any stale escalation context
        setVerifiedAt(null) // drop any stale verification context
        setApprovedAt(null) // drop any stale approval context
        setAuditLog([])
        logEvent(
            'AI Agent',
            'Agent Step 1 · Routed JPS Health Network to David Park (Dallas)',
            'ai'
        )
        logEvent('System', 'Session opened · JPS Health Network', 'system')

        const timers: ReturnType<typeof setTimeout>[] = []

        // Constants (same as before — only the scheduling changes)
        const OUTLOOK_LEAD = 1800 // ms · outlook card + import pulse overlap
        const IMPORT_OFFSET = 16600 // ms (= 14800 modal + 1800 outlook lead)

        // t=0 — outlook card is already visible (set above)
        logEvent(
            'System',
            'CORE → Outlook · new estimating request assigned to David Park',
            'system'
        )

        // Build flat events array — runChain converts to a pause-aware chain
        // so only ONE timer is active at any time (no cascade on resume).
        const events: Array<[number, () => void]> = [
            [1500, () => setHighlightImportButton(true)],
            [OUTLOOK_LEAD, () => setOutlookIncomingVisible(false)],
            [OUTLOOK_LEAD + 500, () => {
                setHighlightImportButton(false)
                setImportModalOpen(true)
                setImportModalPhase('source-picker')
                logEvent('David Park', 'Opened new project ingestion dialog', 'edit')
            }],
            [OUTLOOK_LEAD + 1500, () => setImportCursorTarget('connect-core')],
            [OUTLOOK_LEAD + 2500, () => setImportCursorClicked(true)],
            [OUTLOOK_LEAD + 3200, () => {
                setImportModalPhase('core-login')
                setImportCursorTarget(null)
                setImportCursorClicked(false)
            }],
            [OUTLOOK_LEAD + 4200, () => setImportCursorTarget('core-authenticate')],
            [OUTLOOK_LEAD + 5000, () => setImportCursorClicked(true)],
            [OUTLOOK_LEAD + 5700, () => {
                setImportModalPhase('core-connecting')
                setImportCursorTarget(null)
                setImportCursorClicked(false)
                logEvent('System', 'CORE · secure session established', 'system')
            }],
            [OUTLOOK_LEAD + 7500, () => {
                setImportModalPhase('core-dashboard')
                logEvent('David Park', 'Browsing CORE estimating queue · 5 projects pending', 'edit')
            }],
            [OUTLOOK_LEAD + 8500, () => setImportCursorTarget('project-jps')],
            [OUTLOOK_LEAD + 9500, () => setImportCursorClicked(true)],
            [OUTLOOK_LEAD + 10200, () => {
                setImportModalPhase('core-project-detail')
                setImportCursorTarget(null)
                setImportCursorClicked(false)
                logEvent('David Park', 'Opened JPS Health Network project · 24 items · 3 attachments', 'edit')
            }],
            [OUTLOOK_LEAD + 11500, () => setImportCursorTarget('pull-project')],
            [OUTLOOK_LEAD + 12300, () => setImportCursorClicked(true)],
            [OUTLOOK_LEAD + 12800, () => {
                setImportModalPhase('extracting-uploading')
                setImportModalProgress(15)
                setImportCursorTarget(null)
                setImportCursorClicked(false)
                logEvent('System', 'CORE · downloading JPS_PSS_ANCILLARY.pdf, JPS_Spec_Sheet.pdf, JPS_Contract.pdf', 'system')
            }],
            [OUTLOOK_LEAD + 13500, () => {
                setImportModalPhase('extracting-parsing')
                setImportModalProgress(50)
            }],
            [OUTLOOK_LEAD + 14000, () => {
                setImportModalPhase('extracting-extracting')
                setImportModalProgress(80)
                logEvent('AI Agent', 'Extracting 24 line items from the CORE attachments…', 'ai')
            }],
            [OUTLOOK_LEAD + 14500, () => {
                setImportModalPhase('extracting-done')
                setImportModalProgress(100)
            }],
            [OUTLOOK_LEAD + 14800, () => {
                setImportModalOpen(false)
                setW21Phase('loading-dossier')
                logEvent('System', 'Strata workspace ready · waiting for data to populate', 'system')
                if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }
            }],
            [IMPORT_OFFSET + 1800, () => {
                setCustomer(JPS_CUSTOMER)
                logEvent('AI Agent', 'Loaded CORE export · ZIP 76104 / Fort Worth', 'ai')
            }],
            [IMPORT_OFFSET + 2800, () => {
                setW21Phase('importing-bom')
                setImportStatus('Importing 24 items from JPS_specs.pdf…')
                if (typeof window !== 'undefined') {
                    document
                        .getElementById('wrg-section-bom')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
            }],
            [IMPORT_OFFSET + 3400, () => {
                setLineItems(JPS_LINE_ITEMS)
                logEvent('AI Agent', 'Imported 24 line items from JPS_specs.pdf (85% template, 15% fallback)', 'ai')
            }],
            [IMPORT_OFFSET + 6200, () => {
                setW21Phase('mapping-bom')
                setImportStatus('Mapping products to labor categories…')
                logEvent('AI Agent', 'Mapping products to labor categories', 'ai')
            }],
        ]

        // Mapping chips — one event per item, 70 ms apart
        const itemCount = JPS_LINE_ITEMS.length
        for (let i = 0; i < itemCount; i++) {
            const idx = i
            events.push([IMPORT_OFFSET + 6400 + idx * 70, () => setMappingResolvedCount(idx + 1)])
        }

        events.push(
            [IMPORT_OFFSET + 8200, () => {
                setImportStatus(null)
                logEvent('AI Agent', 'Mapped 24 items · 21 template, 3 fallback', 'ai')
            }],
            [IMPORT_OFFSET + 8700, () => {
                setW21Phase('scope-breach')
                setScopeBreachOpen(true)
                setScopeBreachActive(true)
                logEvent('AI Agent', 'Scope override · 119 KD chairs > 50 (Delivery Pricer limit)', 'ai')
            }],
            [IMPORT_OFFSET + 9100, () => {
                logEvent('AI Agent', 'Running dual-engine calculation · installation + delivery', 'ai')
                if (typeof window !== 'undefined') {
                    document
                        .getElementById('wrg-section-dual-engine')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                const duration = 2200
                const start = performance.now()
                const tick = (now: number) => {
                    const elapsed = now - start
                    const p = Math.min(1, elapsed / duration)
                    const eased = 1 - Math.pow(1 - p, 3)
                    setCalcProgress(eased)
                    if (p < 1) {
                        calcRafRef.current = requestAnimationFrame(tick)
                    } else {
                        calcRafRef.current = null
                        logEvent('AI Agent', 'Draft produced · line items + margin + crew', 'ai')
                    }
                }
                calcRafRef.current = requestAnimationFrame(tick)
            }],
            [IMPORT_OFFSET + 11800, () => {
                setW21Phase('flagged')
                setFlaggedRowIds(['li-19'])
                logEvent('AI Agent', 'Flagged OFS Serpentine 12-seat lounge for designer review', 'ai')
                if (typeof window !== 'undefined') {
                    document
                        .getElementById('wrg-section-hero')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            }],
        )

        runChain(events, timers)

        return () => {
            timers.forEach(clearTimeout)
            if (calcRafRef.current !== null) {
                cancelAnimationFrame(calcRafRef.current)
                calcRafRef.current = null
            }
        }
    }, [stepId])

    // ── w2.1 Sara (Salesperson) fully scripted paced flow ──────────────────
    // Each action is visibly triggered via SalespersonActionBar with a
    // simulated cursor click before the next modal or card appears.
    useEffect(() => {
        if (stepId !== 'w2.1') {
            setGenerateCtaPressed(false)
            setOutlookOutgoingVisible(false)
            setIsClarificationOpen(false)
            setSaraCursorTarget(null)
            setSaraCursorClicked(false)
            setSaraPulseClarify(false)
            setSaraPulseForward(false)
            setDavidReplyVisible(false)
            setDavidReplyAccepted(false)
            return
        }
        const OUTGOING_LEAD = 2500
        setOutlookOutgoingVisible(true)
        logEvent(
            'System',
            'CORE · labor estimate + audit trail written back · Outlook notification triggered',
            'system'
        )

        const timers: ReturnType<typeof setTimeout>[] = []

        const events: Array<[number, () => void]> = [
            [OUTGOING_LEAD, () => setOutlookOutgoingVisible(false)],
            [3800, () => {
                setSaraCursorTarget('request-clarification')
                setSaraPulseClarify(true)
            }],
            [4500, () => setSaraCursorClicked(true)],
            [4700, () => {
                logEvent('Sara Chen', 'Opened Request Clarification form · OFS Serpentine assembly', 'edit')
                setIsClarificationOpen(true)
                setSaraCursorTarget(null)
                setSaraCursorClicked(false)
                setSaraPulseClarify(false)
            }],
            [8600, () => {
                setDavidReplyVisible(true)
                logEvent('David Park', 'Replied to clarification · OFS Serpentine 14 h confirmed · +2 h buffer for alignment', 'edit')
            }],
            [11700, () => setDavidReplyAccepted(true)],
            [11900, () => {
                logEvent('Sara Chen', "Accepted David's clarification · estimate confirmed", 'edit')
            }],
            [13000, () => setDavidReplyVisible(false)],
            [13500, () => {
                setSaraCursorTarget('forward')
                setSaraPulseForward(true)
            }],
            [14200, () => setSaraCursorClicked(true)],
            [14400, () => handleForwardToSAC()],
            [14700, () => {
                setSaraCursorTarget(null)
                setSaraCursorClicked(false)
                setSaraPulseForward(false)
            }],
        ]

        runChain(events, timers)

        return () => {
            timers.forEach(clearTimeout)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepId])

    // v8 · w2.2 (Riley/SAC) fully scripted paced flow. Each action is
    // visibly triggered from the ProposalActionBar with a simulated
    // cursor click before the next modal opens — same pattern as Sara's
    // w2.1 flow.
    //
    // Timeline (all ms from step entry):
    //    0   handoff banner Sara → Riley visible
    //  1500  cursor lands on "Assemble quote" button (pulse starts)
    //  2300  cursor click simulated
    //  2500  PricingWaterfall opens (quote assembly math)
    //  7500  waterfall closes (Riley "confirmed" the math)
    //  8000  cursor lands on "Preview PDF" button (pulse starts)
    //  8800  cursor click simulated
    //  9000  ProposalPdfPreviewModal opens
    // 12000  PDF modal closes
    // 12500  cursor lands on "Approve & Release" button (pulse starts)
    // 13300  cursor click simulated
    // 13500  handleApproveRelease fires (release checklist + David detour)
    // 14000  clear all cursor/pulse state
    useEffect(() => {
        if (stepId !== 'w2.2') {
            setApproveReleasePulsed(false)
            setRileyCursorTarget(null)
            setRileyCursorClicked(false)
            setRileyPulseAssemble(false)
            setRileyPulsePreview(false)
            return
        }

        const timers: ReturnType<typeof setTimeout>[] = []

        const events: Array<[number, () => void]> = [
            [1500, () => {
                setRileyCursorTarget('assemble')
                setRileyPulseAssemble(true)
            }],
            [2300, () => setRileyCursorClicked(true)],
            [2500, () => {
                logEvent('Riley Morgan', 'Opened quote assembly · MillerKnoll + discount + markup', 'edit')
                setIsWaterfallOpen(true)
                setRileyCursorTarget(null)
                setRileyCursorClicked(false)
                setRileyPulseAssemble(false)
            }],
            [7500, () => {
                logEvent('Riley Morgan', 'Confirmed quote assembly math · net + labor + freight + markup', 'edit')
                setIsWaterfallOpen(false)
            }],
            [8000, () => {
                setRileyCursorTarget('preview')
                setRileyPulsePreview(true)
            }],
            [8800, () => setRileyCursorClicked(true)],
            [9000, () => {
                logEvent('Riley Morgan', 'Previewed the release document', 'edit')
                setIsProposalPdfOpen(true)
                setRileyCursorTarget(null)
                setRileyCursorClicked(false)
                setRileyPulsePreview(false)
            }],
            [12000, () => setIsProposalPdfOpen(false)],
            [12500, () => {
                setRileyCursorTarget('approve')
                setApproveReleasePulsed(true)
            }],
            [13300, () => setRileyCursorClicked(true)],
            [13500, () => handleApproveRelease()],
            [14000, () => {
                setRileyCursorTarget(null)
                setRileyCursorClicked(false)
                setApproveReleasePulsed(false)
            }],
        ]

        runChain(events, timers)

        return () => {
            timers.forEach(clearTimeout)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepId])

    // ── w1.2 designer task notification ──────────────────────────────────────
    // When the demo enters w1.2, show a centred task notification on a
    // dimmed backdrop BEFORE the DesignerVerificationOverlay slides in. The
    // user has to click 'Open task' to advance — this gives the handoff a
    // concrete anchor instead of the overlay appearing from nowhere.
    useEffect(() => {
        if (stepState !== 'estimation-escalated') {
            setDesignerTaskOpened(false)
        }
    }, [stepState])

    // ── w1.2 scroll-into-view ────────────────────────────────────────────────
    // Only fires after the user clicks the DesignerTaskNotification — that
    // way the scroll happens in sync with the side panel sliding in, not
    // while the task-inbox modal is still on top.
    useEffect(() => {
        if (stepState !== 'estimation-escalated' || !designerTaskOpened) return
        const timer = setTimeout(() => {
            const row = document.querySelector('tr[data-row-id="li-19"]')
            if (row) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }, 350)
        return () => clearTimeout(timer)
    }, [stepState, designerTaskOpened])

    // ── Handoff banner (fires when step role changes) ────────────────────────
    const prevStepIdRef = useRef<string | undefined>(undefined)
    const [handoff, setHandoff] = useState<{
        fromUser: NonNullable<typeof connectedUser>
        toUser: NonNullable<typeof connectedUser>
        message: string
        duration?: number
    } | null>(null)

    useEffect(() => {
        const prevId = prevStepIdRef.current
        prevStepIdRef.current = stepId

        // Only show handoff when moving from a previous estimator step to a new one
        if (!prevId || prevId === stepId) return

        // v8 · w1.1 is the flow's starting point — never fire a handoff
        // banner on arrival, even if the user navigated back from a later
        // step. The w1.1 entry effect also clears any existing banner as a
        // belt-and-suspenders guard.
        if (stepId === 'w1.1') {
            setHandoff(null)
            return
        }

        const prevRole = getStepRole(prevId)
        if (!prevRole) return
        if (!connectedUser || prevRole.name === connectedUser.name) return

        // Skip the HandoffBanner for steps that already have their own
        // inline arrival surface so we don't duplicate the "role changed"
        // cue. Also clear any stale handoff state left over from the
        // previous step so a backwards navigation (e.g. w2.2 → w2.1) can't
        // persist an old "Riley → Sara" banner into Sara's own entry.
        //   · w1.2 owns the DesignerTaskNotification
        //   · w2.1 owns the CoreOutlookCard variant="outgoing"
        //   · w2.3 owns the CORE email card inside PMExecutionHandoff
        if (stepId === 'w1.2' || stepId === 'w2.1' || stepId === 'w2.3') {
            setHandoff(null)
            return
        }

        setHandoff({
            fromUser: prevRole,
            toUser: connectedUser,
            message: `Handed off to ${connectedUser.name} · ${currentStep?.title ?? ''}`,
        })
    }, [stepId, connectedUser, currentStep?.title])

    // ── Sync active tab with the step's declared tab ─────────────────────────
    useEffect(() => {
        setActiveTab(getStepTab(stepId))
    }, [stepId])

    // ── Close all modals + transient cards on step change ───────────────────
    // When the user navigates via the demo sidebar (Back/Next) or a step
    // completion auto-advances, any modal or transient notification
    // opened by the previous step must close so processes don't repeat or
    // leak into the new step. The step-specific effects below will re-
    // set the ones they need after their own scripted delays, so clearing
    // all of them here is safe.
    useEffect(() => {
        setIsReleaseOpen(false)
        setIsClarificationOpen(false)
        setIsProposalPdfOpen(false)
        setIsApprovalOpen(false)
        setIsWaterfallOpen(false)
        setIsAiModalOpen(false)
        setImportModalOpen(false)
        // The David approval detour is coupled to the w2.2 flow — reset it
        // so jumping to another step doesn't keep the navbar avatar
        // stuck on David.
        setDavidApprovalActive(false)
        // Transient inline cards (CORE → Outlook incoming / outgoing).
        // These are owned by w1.1 and w2.1 respectively; force-dismiss
        // them on every step transition so they don't leak into the next
        // step and confuse the audience (e.g. the outgoing card showing
        // up on w2.2 next to Riley's handoff banner).
        setOutlookIncomingVisible(false)
        setOutlookOutgoingVisible(false)
        // davidSigned persists intentionally so the chain modal re-opens
        // with David pre-approved if the user comes back to w2.2 mid-run;
        // the release complete / restart handlers clear it properly.
    }, [stepId])

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleSave = () => {
        setSyncStatus('saving')
        setTimeout(pauseAware(() => setSyncStatus('synced')), 1500)
    }

    // ── SIF Export state ───────────────────────────────────────────────────
    const [sifExportOpen, setSifExportOpen] = useState(false)
    const [sifPreviewOpen, setSifPreviewOpen] = useState(false)

    const [sifDownloadToast, setSifDownloadToast] = useState(false)

    const handleExportBackup = () => {
        logEvent('System', 'SIF export initiated · converting project to Strata Interchange Format', 'system')
        setSifExportOpen(true)
    }

    const handleSifDownload = () => {
        logEvent(
            'System',
            `SIF file downloaded · ${customer.name || 'JPS'}_Health_Center.sif`,
            'system'
        )
        setSifExportOpen(false)
        setSifPreviewOpen(false)
        setSifDownloadToast(true)
        setTimeout(pauseAware(() => setSifDownloadToast(false)), 4000)
    }

    const handleImportBackup = () => {
        console.log('Import backup')
    }

    const handleRateLookup = () => {
        setIsSearchingRates(true)
        setTimeout(pauseAware(() => setIsSearchingRates(false)), 1500)
    }

    const handleGenerateProposal = () => {
        // v8 · In w2.1 Sara presses this CTA (relabelled "Forward to SAC").
        // handleForwardToSAC handles the Salesperson → SAC transition.
        // In any other step (not expected in v8), fall back to opening the
        // waterfall directly.
        if (stepId === 'w2.1') {
            handleForwardToSAC()
            return
        }
        setIsWaterfallOpen(true)
    }

    const handleForwardToSAC = () => {
        // v8 · w2.1 → w2.2 · Sara (Salesperson) forwards the approved labor
        // estimate to Riley (SAC) for quote assembly.
        const formatted = Number(estimate.salesPrice).toLocaleString('en-US', {
            maximumFractionDigits: 0,
        })
        logEvent(
            'Sara Chen',
            `Forwarded $${formatted} labor estimate to Riley Morgan (SAC) for quote assembly`,
            'approval'
        )
        triggerHandoff(
            ROLE_PROFILES.Dealer,
            ROLE_PROFILES['Sales Coordinator'],
            `Forwarding $${formatted} labor estimate to SAC for quote assembly`
        )
    }

    const handleSendForReview = (dealerId: string) => {
        // v8 · w2.2 · Riley picks the internal reviewer from the pricing
        // waterfall's dealer list. The pick only logs an audit entry and
        // closes the waterfall — the audience stays in w2.2 where the
        // ProposalActionBar lets Riley launch the release checklist.
        const dealer = DEALERS.find((d) => d.id === dealerId)
        const formatted = Number(estimate.salesPrice).toLocaleString('en-US', {
            maximumFractionDigits: 0,
        })
        logEvent(
            'Riley Morgan',
            `Assembled $${formatted} quote · routing to ${dealer?.name ?? 'internal reviewer'}`,
            'approval'
        )
        setIsWaterfallOpen(false)
    }

    // ── w2.2 — Proposal review handlers ──────────────────────────────────────
    const handleRequestClarification = () => {
        // v8 · step-aware sender: Sara in w2.1, Riley in w2.2
        const sender = stepId === 'w2.1' ? 'Sara Chen' : 'Riley Morgan'
        logEvent(sender, 'Opened Request Clarification form', 'edit')
        setIsClarificationOpen(true)
    }

    const handleClarificationSent = (topic: string, _message: string) => {
        const sender = stepId === 'w2.1' ? 'Sara Chen' : 'Riley Morgan'
        logEvent(
            sender,
            `Clarification request sent to David Park · ${topic}`,
            'edit'
        )
    }

    const handlePreviewProposalPdf = () => {
        const sender = stepId === 'w2.1' ? 'Sara Chen' : 'Riley Morgan'
        logEvent(sender, 'Previewed proposal PDF before release', 'edit')
        setIsProposalPdfOpen(true)
    }

    const handleAssembleQuote = () => {
        logEvent(
            'Riley Morgan',
            'Opened quote assembly · MillerKnoll + discount + markup',
            'edit'
        )
        setIsWaterfallOpen(true)
    }

    const handleApproveRelease = () => {
        // Phase 1 — Sara initiates the chain. Open the modal with nobody
        // signed yet so the audience sees the empty chain for a beat.
        logEvent('Sara Chen', 'Initiated approval chain', 'approval')
        setDavidSigned(false)
        setIsApprovalOpen(true)

        // Phase 2 — after ~2.5 s, close the modal and redirect the Shell
        // to David's real workspace so the audience watches the
        // notification land in his Estimator view. The David approval
        // card (rendered below when davidApprovalActive is true) now
        // carries the handoff direction chips inline, so we no longer
        // fire a separate HandoffBanner — one unified card instead of
        // two stacked notifications.
        setTimeout(pauseAware(() => {
            setIsApprovalOpen(false)
            logEvent(
                'Sara Chen',
                'Sent proposal to David Park for approval',
                'approval'
            )
            setDavidApprovalActive(true)
            // Make sure any stale handoff banner from an earlier step is
            // dismissed so the David approval card stands alone.
            setHandoff(null)
            // Scroll the workspace to the top so the approval card is
            // on-screen when the detour lands.
            if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }

            // Approval card slides in ~1 s after the banner.
            setTimeout(pauseAware(() => setDavidCardVisible(true)), 1000)

            // Halfway through, David "reviews" the line items and the
            // simulated cursor appears over the Approve button.
            setTimeout(pauseAware(() => {
                logEvent(
                    'David Park',
                    'Reviewing proposal line items · OFS Serpentine, Canvas workstations, freight',
                    'edit'
                )
                setDavidCursorShown(true)
            }), 2800)

            // Cursor "clicks" — button flips to Approved with a ring pulse.
            setTimeout(pauseAware(() => setDavidClicked(true)), 4500)

            // Phase 3 — after David "reviews and approves" in his own
            // workspace, clear the redirect, mark David signed, and
            // re-open the chain modal to auto-advance Alex / Sara /
            // Jordan.
            setTimeout(pauseAware(() => {
                logEvent(
                    'David Park',
                    'Approved proposal from his workspace',
                    'approval'
                )
                setDavidApprovalActive(false)
                setHandoff(null)
                setDavidCardVisible(false)
                setDavidCursorShown(false)
                setDavidClicked(false)
                setDavidSigned(true)
                setIsApprovalOpen(true)
            }), 7000)
        }), 2500)
    }

    const handleApprovalChainComplete = () => {
        // All 4 signatures collected → swap approval modal for the release modal
        logEvent(
            'System',
            'Approval chain complete · David / Alex / Sara / Jordan',
            'approval'
        )
        logEvent(
            'System',
            `Released $${Number(estimate.salesPrice).toLocaleString('en-US', {
                maximumFractionDigits: 0,
            })} proposal to JPS Health Network`,
            'release'
        )
        setIsApprovalOpen(false)
        setDavidSigned(false) // reset the two-phase gate for next run
        setIsReleaseOpen(true)
    }

    const handleReleaseDownloadPdf = () => {
        console.log('Download JPS_proposal.pdf')
    }

    const handleContinueToPMHandoff = () => {
        // v8 · close the release modal and trigger the Riley (SAC) → James
        // (PM) handoff. onComplete fires nextStep() → w2.3 (PM execution).
        setIsReleaseOpen(false)
        setApprovedAt(Date.now())
        logEvent(
            'System',
            'Quote released · routing execution plan to Senior Project Manager',
            'ai'
        )
        triggerHandoff(
            ROLE_PROFILES['Sales Coordinator'],
            ROLE_PROFILES['Project Manager'],
            'Handing approved quote to James Ortiz for execution planning'
        )
    }

    const handleRestartDemo = () => {
        // Reset every piece of Shell state and jump the demo profile back to w1.1
        setIsReleaseOpen(false)
        setIsApprovalOpen(false)
        setIsWaterfallOpen(false)
        setIsAiModalOpen(false)
        setDavidApprovalActive(false)
        setDavidSigned(false)
        setImportModalOpen(false)
        setImportModalPhase('source-picker')
        setImportModalProgress(0)
        setImportCursorTarget(null)
        setImportCursorClicked(false)
        setHighlightImportButton(false)
        setOutlookIncomingVisible(false)
        setOutlookOutgoingVisible(false)
        setCustomer(JPS_CUSTOMER)
        setLineItems(JPS_LINE_ITEMS)
        setVariables(INITIAL_VARIABLES)
        setConfig(INITIAL_CONFIG)
        setLastFile(null)
        setActiveTab('ESTIMATOR')
        setSavedEstimates(MOCK_SAVED_ESTIMATES)
        // Refinement Phase 2: reset the w1.1 beat state so the restart replays it
        setW21Phase('idle')
        setImportStatus(null)
        setScopeBreachOpen(false)
        setScopeBreachActive(false)
        setFlaggedRowIds([])
        // Refinement Phase 7.1: restore mapping to "all resolved" for the
        // next w1.1 entry (the beat effect re-sets it to 0 on its own).
        setMappingResolvedCount(Infinity)
        // Refinement Phase 7.2: snap calc progress back to 1 so the hero
        // shows real numbers between runs; the w1.1 beat will drop it to 0.
        setCalcProgress(1)
        if (calcRafRef.current !== null) {
            cancelAnimationFrame(calcRafRef.current)
            calcRafRef.current = null
        }
        // Refinement Phase 7.3: dismiss any pending handoff transition
        setHandoff2(null)
        // v8 · clear the inline handoff banner and the step-tracking ref
        // so the auto-trigger effect doesn't fire a stale back-handoff
        // (e.g. Alex -> David with "Labor estimation kickoff") when we
        // jump back to w1.1 from a later step.
        setHandoff(null)
        prevStepIdRef.current = undefined
        // Refinement Phase 7.4 + 7.5 + v7: clear every handoff timestamp
        setEscalatedAt(null)
        setVerifiedAt(null)
        setApprovedAt(null)
        // v7 · reset the designer task notification gate
        setDesignerTaskOpened(false)
        // v7 · clear any lingering Generate Proposal press animation
        setGenerateCtaPressed(false)
        // Refinement Phase 6d: clear audit log so the new session starts fresh
        setAuditLog([])
        if (goToStep) goToStep(0)
    }

    // ── Line item CRUD ───────────────────────────────────────────────────────
    const handleUpdateItem = (
        id: string,
        field: keyof LineItem,
        value: string | number
    ) => {
        setLineItems((items) =>
            items.map((item) => {
                if (item.id !== id) return item
                // Reset subcategory when the parent category changes
                if (field === 'categoryId') {
                    return { ...item, categoryId: String(value), subCategoryId: '' }
                }
                return { ...item, [field]: value }
            })
        )
    }

    const handleAddItem = () => {
        const firstCategory = Object.keys(config.categories)[0] ?? ''
        setLineItems((items) => [
            ...items,
            {
                id: `item-${Date.now()}`,
                categoryId: firstCategory,
                subCategoryId: '',
                description: '',
                quantity: 1,
            },
        ])
    }

    const handleRemoveItem = (id: string) => {
        setLineItems((items) => items.filter((item) => item.id !== id))
    }

    const handleAiImport = () => {
        setLastFile(null) // force the initial "Select Spec Document" mode
        setIsAiModalOpen(true)
    }

    const handleAiRefine = () => {
        setIsAiModalOpen(true)
    }

    const handleItemsExtracted = (items: LineItem[], fileName: string) => {
        setLineItems(items)
        setLastFile({ name: fileName })
    }

    // ── Projects archive CRUD ────────────────────────────────────────────────
    const handleLoadEstimate = (est: SavedEstimate) => {
        setCustomer(est.customer)
        setLineItems(est.lineItems)
        setVariables(est.variables)
        setActiveTab('ESTIMATOR')
    }

    const handleDeleteEstimate = (id: string) => {
        setSavedEstimates((list) => list.filter((e) => e.id !== id))
    }

    const handleUpdateStatus = (id: string, status: EstimateStatus) => {
        setSavedEstimates((list) =>
            list.map((e) => (e.id === id ? { ...e, status } : e))
        )
    }

    const handleUpdateActualCost = (id: string, actualCost: number) => {
        setSavedEstimates((list) =>
            list.map((e) => (e.id === id ? { ...e, actualCost } : e))
        )
    }

    // When redirected to David's workspace during the w2.2 approval, swap
    // the navbar avatar to David so the audience knows whose view they are
    // looking at. Everything else in the workspace keeps its existing props.
    const effectiveConnectedUser = davidApprovalActive
        ? ROLE_PROFILES.Expert
        : connectedUser

    return (
        <div className="min-h-screen bg-background text-foreground font-sans pb-10">
            {/* Top navbar — floating pill, matches src/components/Navbar.tsx */}
            <StrataEstimatorNavbar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                syncStatus={syncStatus}
                onSave={handleSave}
                onExportBackup={handleExportBackup}
                onImportBackup={handleImportBackup}
                connectedUser={effectiveConnectedUser}
                highlightImport={highlightImportButton}
            />

            {/* Tab content */}
            <main>
                {isInitialLoading ? (
                    <div className="pt-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-6 animate-pulse">
                        <div className="h-32 bg-muted/40 rounded-2xl" />
                        <div className="h-64 bg-muted/30 rounded-2xl" />
                        <div className="h-96 bg-muted/20 rounded-2xl" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'ESTIMATOR' && stepState === 'pm-handoff' && (
                            <div key="PM-HANDOFF" className="pt-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-6 animate-fade-in">
                                {handoff && (
                                    <HandoffBanner
                                        fromUser={handoff.fromUser}
                                        toUser={handoff.toUser}
                                        message={handoff.message}
                                        duration={handoff.duration}
                                        onDismiss={() => setHandoff(null)}
                                    />
                                )}
                                <ProjectContextPanel defaultCollapsed={true} />
                                <PMExecutionHandoff
                                    proposalPrice={Number(estimate.salesPrice).toLocaleString('en-US', {
                                        maximumFractionDigits: 0,
                                    })}
                                    clientName={customer.name}
                                    approvedBy={ROLE_PROFILES['Sales Coordinator'].name}
                                    approvedAt={approvedAt ?? Date.now()}
                                    onRestart={handleRestartDemo}
                                    onAccepted={() => {
                                        logEvent(
                                            ROLE_PROFILES['Project Manager'].name,
                                            'Accepted execution plan · crews & tools assigned for weeks 8-10',
                                            'edit'
                                        )
                                    }}
                                />
                            </div>
                        )}

                        {activeTab === 'ESTIMATOR' && stepState !== 'pm-handoff' && (
                            <div key="ESTIMATOR" className="pt-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-6 animate-fade-in">

                                {/* v8 Paso E · Gap F · CORE → Outlook incoming
                                    (start of w1.1, before the CORE modal) */}
                                {outlookIncomingVisible && stepId === 'w1.1' && (
                                    <CoreOutlookCard
                                        variant="incoming"
                                        duration={1800}
                                        onDismiss={() => setOutlookIncomingVisible(false)}
                                    />
                                )}

                                {/* v8 Paso E · Gap B · Strata → CORE → Outlook outgoing
                                    (start of w2.1, before Sara's forward press) */}
                                {outlookOutgoingVisible && stepId === 'w2.1' && (
                                    <CoreOutlookCard
                                        variant="outgoing"
                                        duration={2500}
                                        onDismiss={() => setOutlookOutgoingVisible(false)}
                                    />
                                )}

                                {/* v7 · inline handoff banner (replaces the former fixed toast) */}
                                {handoff && (
                                    <HandoffBanner
                                        fromUser={handoff.fromUser}
                                        toUser={handoff.toUser}
                                        message={handoff.message}
                                        duration={handoff.duration}
                                        onDismiss={() => setHandoff(null)}
                                    />
                                )}

                                {/* v8 polish · All transient notifications live at
                                    the top of the page, above the persistent content.
                                    Each is gated by its own step/state condition. */}

                                {/* w2.2 · David's unified approval card · merges
                                    the previous Role handoff banner and the Your
                                    approval required card into a single
                                    notification with sender avatar, direction
                                    chips, key stats and the Approve CTA. */}
                                {davidApprovalActive && (
                                    <div
                                        className={clsx(
                                            'transition-all duration-500',
                                            davidCardVisible
                                                ? 'opacity-100 translate-y-0 animate-in fade-in slide-in-from-top-2'
                                                : 'opacity-0 -translate-y-2 pointer-events-none'
                                        )}
                                    >
                                        <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm overflow-hidden">
                                            <div className="flex items-start gap-4 px-5 py-4 bg-primary/5 dark:bg-primary/10 border-l-4 border-primary ring-1 ring-primary/20 rounded-r-2xl">
                                                {/* Sender avatar with send badge */}
                                                <div className="relative shrink-0">
                                                    <img
                                                        src={ROLE_PROFILES.Dealer.photo}
                                                        alt={ROLE_PROFILES.Dealer.name}
                                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/40"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center ring-2 ring-card dark:ring-zinc-800">
                                                        <ShieldCheck className="h-2.5 w-2.5 text-primary-foreground" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm font-bold text-foreground">
                                                            Approval request
                                                        </span>
                                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold animate-pulse">
                                                            Just now
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        <span className="font-bold text-foreground">
                                                            {ROLE_PROFILES.Dealer.name}
                                                        </span>{' '}
                                                        ({ROLE_PROFILES.Dealer.role}) · JPS Health Network proposal · $202,138 awaiting your sign-off
                                                    </p>
                                                    {/* Direction chips · Sara → David */}
                                                    <div className="flex items-center gap-2 flex-wrap mt-2">
                                                        <span className="text-[8px] font-bold px-2 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                                                            {ROLE_PROFILES.Dealer.role}
                                                        </span>
                                                        <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" aria-hidden />
                                                        <span className="text-[8px] font-bold px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                                                            {ROLE_PROFILES.Expert.role}
                                                        </span>
                                                    </div>
                                                    {/* Key stats row */}
                                                    <div className="flex items-center gap-5 mt-3">
                                                        <div>
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                                                Total proposal
                                                            </p>
                                                            <p className="text-sm font-black text-foreground tabular-nums">
                                                                $202,138
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                                                Line items
                                                            </p>
                                                            <p className="text-sm font-black text-foreground tabular-nums">
                                                                24
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                                                Chain
                                                            </p>
                                                            <p className="text-sm font-black text-foreground tabular-nums">
                                                                4 signers
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="relative shrink-0 self-center">
                                                    <button
                                                        type="button"
                                                        disabled
                                                        className={clsx(
                                                            'flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-primary/40 transition-all duration-200',
                                                            davidClicked &&
                                                                'scale-95 ring-4 ring-primary/60 shadow-xl shadow-primary/50'
                                                        )}
                                                    >
                                                        {davidClicked ? (
                                                            <>
                                                                <Check className="w-4 h-4" strokeWidth={3} />
                                                                Approved
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShieldCheck className="w-4 h-4" />
                                                                Approve proposal
                                                            </>
                                                        )}
                                                    </button>
                                                    {davidCursorShown && (
                                                        <MousePointer2
                                                            className={clsx(
                                                                'absolute -right-2 -bottom-3 w-5 h-5 text-foreground drop-shadow-lg pointer-events-none transition-all duration-300',
                                                                davidClicked
                                                                    ? 'translate-x-0 translate-y-0 scale-90'
                                                                    : 'translate-x-1 translate-y-1 animate-bounce'
                                                            )}
                                                            aria-hidden
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* w1.2 · Designer task notification */}
                                {stepId === 'w1.2' && !designerTaskOpened && (
                                    <DesignerTaskNotification
                                        fromUser={ROLE_PROFILES.Expert}
                                        taskTitle="OFS Serpentine ready for verification"
                                        taskSummary="Custom product — check connection hardware and confirm the 14 h assembly estimate. 5 modules to validate before sending back."
                                        onOpen={() => {
                                            logEvent(
                                                ROLE_PROFILES.Designer.name,
                                                'Opened verification task from inbox',
                                                'edit'
                                            )
                                            setDesignerTaskOpened(true)
                                        }}
                                    />
                                )}

                                {/* w2.1 · David's reply to Sara's clarification.
                                    Slides in after the Request Clarification
                                    modal closes; the reply is accepted by the
                                    scripted flow and the card auto-dismisses. */}
                                {stepId === 'w2.1' && davidReplyVisible && (
                                    <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="p-5 bg-indigo-500/5 dark:bg-indigo-500/10 border-l-4 border-indigo-500 ring-1 ring-indigo-500/20 rounded-r-2xl">
                                            <div className="flex items-start gap-4">
                                                <div className="relative shrink-0">
                                                    <img
                                                        src={ROLE_PROFILES.Expert.photo}
                                                        alt={ROLE_PROFILES.Expert.name}
                                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center ring-2 ring-card dark:ring-zinc-800">
                                                        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm font-bold text-foreground">
                                                            David Park replied
                                                        </span>
                                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold animate-pulse">
                                                            Just now
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        <span className="font-bold text-foreground">
                                                            Senior Estimator
                                                        </span>{' '}
                                                        · Reply to your OFS Serpentine clarification
                                                    </p>
                                                    <div className="mt-3 p-3 rounded-lg bg-card dark:bg-zinc-900 border border-border">
                                                        <p className="text-[11px] text-foreground leading-snug italic">
                                                            "Hi Sara — 14 h install is correct for
                                                            standard modular assembly. Added a +2 h
                                                            buffer for the alignment tolerance on
                                                            the custom radius, so the final line
                                                            reads 16 h. Everything else stands."
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-primary/10 text-foreground dark:text-primary border border-primary/30">
                                                            OFS Serpentine · 14 h → 16 h
                                                        </span>
                                                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-muted/50 text-muted-foreground">
                                                            +$114 labor
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 self-center">
                                                    <button
                                                        type="button"
                                                        disabled
                                                        className={clsx(
                                                            'flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200',
                                                            davidReplyAccepted
                                                                ? 'bg-green-500 text-white scale-95'
                                                                : 'bg-primary text-primary-foreground ring-2 ring-primary/40'
                                                        )}
                                                    >
                                                        {davidReplyAccepted ? (
                                                            <>
                                                                <Check className="w-3 h-3" strokeWidth={3} />
                                                                Accepted
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check className="w-3 h-3" />
                                                                Accept &amp; update
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* w2.1 · Verification log card preamble */}
                                {stepId === 'w2.1' && verifiedAt && (
                                    <VerificationLogCard
                                        verifiedByName={ROLE_PROFILES.Designer.name}
                                        verifiedByPhoto={ROLE_PROFILES.Designer.photo}
                                        verifiedAt={verifiedAt}
                                    />
                                )}

                                {/* w1.1 · Scope breach alert (transient) */}
                                {stepId === 'w1.1' && (
                                    <ScopeBreachAlert
                                        isOpen={scopeBreachOpen}
                                        category="KD task chairs"
                                        count={119}
                                        limit={50}
                                        onDismiss={() => setScopeBreachOpen(false)}
                                    />
                                )}

                                {/* w1.1 · Flagged item banner · Escalate CTA */}
                                {stepId === 'w1.1' && (
                                    <FlaggedItemBanner
                                        isOpen={w21Phase === 'flagged'}
                                        count={1}
                                        itemLabel="OFS Serpentine 12-seat curved lounge"
                                        reason="Custom product · designer verification recommended"
                                        onEscalate={() => {
                                            logEvent(
                                                'David Park',
                                                'Escalated OFS Serpentine to Alex Rivera',
                                                'edit'
                                            )
                                            setEscalatedAt(Date.now())
                                            triggerHandoff(
                                                ROLE_PROFILES.Expert,
                                                ROLE_PROFILES.Designer,
                                                'Escalating OFS Serpentine for verification'
                                            )
                                        }}
                                    />
                                )}

                                {/* v8 · Project Dossier always first on every page */}
                                <div id="wrg-section-dossier" />
                                <EstimatorDossierCard
                                    customer={customer}
                                    onCustomerChange={setCustomer}
                                    onRateLookup={handleRateLookup}
                                    isSearchingRates={isSearchingRates}
                                    presets={savedEstimates}
                                    onLoadPreset={handleLoadEstimate}
                                    readOnly={isProposalReview}
                                    rightSlot={
                                        <AuditTrailPanel
                                            events={auditLog}
                                            hidden={stepState === 'estimation-escalated'}
                                        />
                                    }
                                />

                                {/* v8 Paso B · Project Context Panel — hidden only
                                    during the w1.1 CORE ingestion modal pre-phase. */}
                                {w21Phase !== 'importing-files' && (
                                    <ProjectContextPanel
                                        defaultCollapsed={stepState === 'estimation-escalated'}
                                    />
                                )}

                                {/* v8 polish · Operational Constraints sits directly
                                    below Project Context so the estimator-manipulable
                                    inputs stack as one block at the top of the page. */}
                                {w21Phase !== 'importing-files' && (
                                    <OperationalConstraintsPanel
                                        variables={variables}
                                        onVariablesChange={setVariables}
                                        crewSize={estimate.crewSize}
                                        readOnly={isProposalReview}
                                    />
                                )}

                                {/* v8 polish · BoM is the main manipulable input. All
                                    notifications above it have been hoisted to the top
                                    of the page (just below the HandoffBanner). */}
                                <div id="wrg-section-bom" />
                                <BillOfMaterialsTable
                                    lineItems={lineItems}
                                    config={config}
                                    onUpdateItem={handleUpdateItem}
                                    onAddItem={handleAddItem}
                                    onRemoveItem={handleRemoveItem}
                                    onAiImport={handleAiImport}
                                    onAiRefine={handleAiRefine}
                                    hasLastFile={!!lastFile}
                                    readOnly={isProposalReview}
                                    staggerImport={stepId === 'w1.1' && (w21Phase === 'importing-bom' || w21Phase === 'mapping-bom' || w21Phase === 'scope-breach')}
                                    flaggedRowIds={flaggedRowIds}
                                    importStatus={importStatus}
                                    focusedRowId={stepState === 'estimation-escalated' ? 'li-19' : null}
                                    confidenceMap={confidenceMap}
                                    scopeBreachBadge={scopeBreachBadge}
                                    mappingResolvedCount={mappingResolvedCount}
                                />

                                {/* v8 Paso D · Dual-engine calculation (OUTPUT).
                                    Moved below the BoM/constraints so the inputs
                                    read as causes and the calc reads as effect. */}
                                <div id="wrg-section-dual-engine" />
                                {(stepId === 'w2.1' ||
                                    (stepId === 'w1.1' &&
                                        (w21Phase === 'scope-breach' ||
                                            w21Phase === 'flagged'))) && (
                                    <DualEngineCalculation
                                        progress={stepId === 'w1.1' ? calcProgress : 1}
                                    />
                                )}

                                {/* Phase 5 + Refinement 7.2 + v8: Financial Summary Hero
                                    (OUTPUT). Final number + step CTA. */}
                                <div id="wrg-section-hero" />
                                <FinancialSummaryHero
                                    estimate={estimate}
                                    onGenerateProposal={handleGenerateProposal}
                                    hideGenerateCTA={isProposalReview}
                                    calculationProgress={calcProgress}
                                    pulseGenerateCTA={generateCtaPressed}
                                    ctaLabel={
                                        stepId === 'w2.1'
                                            ? 'Forward to SAC'
                                            : 'Generate Proposal'
                                    }
                                />

                                <p className="text-[10px] text-center text-muted-foreground/60 font-mono">
                                    step {stepId ?? '—'} · state {stepState} · {variables.duration} day(s)
                                </p>
                            </div>
                        )}

                        {activeTab === 'PROJECTS' && (
                            <div key="PROJECTS" className="animate-fade-in">
                                <ProjectsArchiveView
                                    savedEstimates={savedEstimates}
                                    onLoadEstimate={handleLoadEstimate}
                                    onDeleteEstimate={handleDeleteEstimate}
                                    onUpdateStatus={handleUpdateStatus}
                                    onUpdateActualCost={handleUpdateActualCost}
                                />
                            </div>
                        )}

                    </>
                )}
            </main>

            {/* Phase 8: Vision Engine modal (AI Import / Refine) */}
            <VisionEngineModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                onItemsExtracted={handleItemsExtracted}
                lastFile={lastFile}
            />

            {/* Phase 13 + Refinement Phase 3: Pricing Waterfall with live numbers */}
            <PricingWaterfall
                isOpen={isWaterfallOpen}
                onClose={() => setIsWaterfallOpen(false)}
                onSendForReview={handleSendForReview}
                productList={JPS_PRODUCT_LIST}
                discount={JPS_CONTRACT_DISCOUNT}
                labor={parseFloat(estimate.salesPrice) || 0}
                freight={JPS_FREIGHT}
                dealers={DEALERS}
            />

            {/* Phase 14 + Refinement 7.4: Designer Verification Overlay with provenance */}
            <DesignerVerificationOverlay
                isOpen={stepState === 'estimation-escalated' && designerTaskOpened}
                onSendBack={() => {
                    logEvent(
                        'Alex Rivera',
                        'Verified OFS Serpentine · 14 h install (modular assembly confirmed) · sent for approval',
                        'edit'
                    )
                    setVerifiedAt(Date.now())
                    // v8 · w1.2 → w2.1 · designer sends the verified module
                    // to Sara (Salesperson) who reviews before forwarding
                    // to the SAC. Previously this routed back to the
                    // Expert which was a legacy v7 leftover.
                    triggerHandoff(
                        ROLE_PROFILES.Designer,
                        ROLE_PROFILES.Dealer,
                        'Sending verified module to Sara for approval'
                    )
                }}
                onPreviewPdf={() => console.log('Preview PDF')}
                escalationContext={
                    escalatedAt
                        ? {
                              fromName: ROLE_PROFILES.Expert.name,
                              fromRole: ROLE_PROFILES.Expert.role,
                              fromPhoto: ROLE_PROFILES.Expert.photo,
                              reason: 'Custom product · OFS Serpentine 12-seat curved lounge needs designer verification of connection hardware + assembly time',
                              receivedAt: escalatedAt,
                              itemRef: 'li-19',
                          }
                        : undefined
                }
                onScrollToItem={(rowId) => {
                    const row = document.querySelector(`tr[data-row-id="${rowId}"]`)
                    if (row) {
                        row.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }
                }}
            />

            {/* Refinement Phase 1 + v8 scripted w2.2 · Proposal review
                action bar with 4 CTAs (Assemble / Clarify / Preview /
                Approve). Hidden while the Shell is in David's workspace
                redirect. Every CTA is driven by Riley's scripted cursor
                + pulse state so the audience sees each click. */}
            {isProposalReview && !davidApprovalActive && (
                <ProposalActionBar
                    salesPrice={Number(estimate.salesPrice).toLocaleString('en-US', {
                        maximumFractionDigits: 0,
                    })}
                    onAssemble={handleAssembleQuote}
                    onRequestClarification={handleRequestClarification}
                    onPreviewPdf={handlePreviewProposalPdf}
                    onApproveRelease={handleApproveRelease}
                    pulseAssemble={rileyPulseAssemble}
                    pulsePreview={rileyPulsePreview}
                    pulseApprove={approveReleasePulsed}
                    cursorTarget={rileyCursorTarget}
                    cursorClicked={rileyCursorClicked}
                />
            )}

            {/* v8 · w2.1 · Salesperson action bar (Sara). Two CTAs driven
                by the scripted cursor + pulse state so the audience sees
                every click. */}
            {stepId === 'w2.1' && (
                <SalespersonActionBar
                    salesPrice={Number(estimate.salesPrice).toLocaleString('en-US', {
                        maximumFractionDigits: 0,
                    })}
                    onRequestClarification={handleRequestClarification}
                    onForwardToSac={handleForwardToSAC}
                    pulseRequestClarification={saraPulseClarify}
                    pulseForward={saraPulseForward}
                    cursorTarget={saraCursorTarget}
                    cursorClicked={saraCursorClicked}
                />
            )}

            {/* v8 · Request Clarification modal. Sara (w2.1) auto-sends with
                autoSendAfter=2000 ms; Riley (w2.2) uses it manually. */}
            <RequestClarificationModal
                isOpen={isClarificationOpen}
                onClose={() => setIsClarificationOpen(false)}
                onSent={handleClarificationSent}
                autoSendAfter={stepId === 'w2.1' ? 2000 : undefined}
                initialTopicId={stepId === 'w2.1' ? 'ofs-serpentine' : undefined}
                senderName={stepId === 'w2.1' ? 'Sara' : 'Riley'}
            />

            {/* v7 · w2.2 — Proposal PDF preview (reused by the Preview PDF CTA) */}
            <ProposalPdfPreviewModal
                isOpen={isProposalPdfOpen}
                onClose={() => setIsProposalPdfOpen(false)}
                clientName={customer.name}
                productList={JPS_PRODUCT_LIST}
                discount={JPS_CONTRACT_DISCOUNT}
                labor={Number(estimate.totalCost)}
                freight={JPS_FREIGHT}
            />

            {/* Refinement Phase 1: w2.2 — Approval chain.
                Two-phase: first opens empty for ~2 s while the Shell
                prepares the David redirect, then re-opens with David
                pre-signed and auto-chains through the rest. */}
            <ApprovalChainModal
                isOpen={isApprovalOpen}
                davidSigned={davidSigned}
                onClose={() => setIsApprovalOpen(false)}
                onComplete={handleApprovalChainComplete}
            />

            {/* Refinement Phase 1 + v7: w2.2 — Release success → continue to w2.3 */}
            <ReleaseSuccessModal
                isOpen={isReleaseOpen}
                salesPrice={Number(estimate.salesPrice).toLocaleString('en-US', {
                    maximumFractionDigits: 0,
                })}
                clientName={customer.name}
                auditLog={auditLog}
                onDownloadPdf={handleReleaseDownloadPdf}
                onContinueToDelivery={handleContinueToPMHandoff}
            />

            {/* Refinement Phase 6d · v7 · Audit trail panel lives inside the
                Dossier card's rightSlot, not as a separate floating element. */}

            {/* Refinement Phase 7.3: Role handoff transition — plays between
                nextStep() calls on every role change */}
            {handoff2 && (
                <RoleHandoffTransition
                    isOpen={!!handoff2}
                    fromUser={handoff2.from}
                    toUser={handoff2.to}
                    message={handoff2.message}
                    onComplete={handleHandoffComplete}
                />
            )}

            {/* v8 Paso A · w1.1 opening · CORE connection simulation */}
            <CoreConnectionModal
                isOpen={importModalOpen}
                phase={importModalPhase}
                progress={importModalProgress}
                cursorTarget={importCursorTarget}
                cursorClicked={importCursorClicked}
            />

            {/* v8 · SIF Export modal + preview */}
            <SifExportModal
                isOpen={sifExportOpen}
                projectName={customer.name ? `${customer.name} · Health Center for Women` : 'JPS Health Network'}
                itemCount={lineItems.length || 24}
                onClose={handleSifDownload}
                onPreview={() => {
                    setSifExportOpen(false)
                    setSifPreviewOpen(true)
                }}
            />
            <SifPreviewModal
                isOpen={sifPreviewOpen}
                projectName={customer.name ? `${customer.name} Health Center for Women` : 'JPS Health Network'}
                customerName={customer.name || 'JPS Health Network'}
                totalAmount={Number(estimate.salesPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                itemCount={lineItems.length || 24}
                onClose={() => setSifPreviewOpen(false)}
                onDownload={handleSifDownload}
            />

            {/* SIF download confirmation toast */}
            {sifDownloadToast && (
                <div className="fixed bottom-6 right-6 z-[200] w-80 max-w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-green-500/10 dark:bg-green-500/15 border border-green-500/30 shadow-lg backdrop-blur-sm">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground">
                                SIF file downloaded
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                {customer.name || 'JPS'}_Health_Center_for_Women.sif saved to your downloads folder.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSifDownloadToast(false)}
                            className="shrink-0 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* v7 · legacy DealerArrivalToast + AgentRoutingToast were removed —
                HandoffBanner (inline) now covers every role transition on its own. */}
        </div>
    )
}
