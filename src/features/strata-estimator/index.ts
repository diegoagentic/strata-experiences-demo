// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Barrel Export
// Based on Project Aries structure, built with Strata DS components
// See docs/wrg-demo/IMPLEMENTATION_PLAN.md for implementation phases
// ═══════════════════════════════════════════════════════════════════════════════

// Types (Phase 1)
export type {
    EstimatorTab,
    EstimateStatus,
    SyncStatus,
    Category,
    Subcategory,
    LineItem,
    Customer,
    OperationalVariables,
    EstimateResult,
    ConfigState,
    SavedEstimate,
} from './types'

// Shell + Navbar (Phase 3)
export { default as StrataEstimatorShell } from './StrataEstimatorShell'
export { default as StrataEstimatorNavbar } from './StrataEstimatorNavbar'
export type { ConnectedUser } from './StrataEstimatorNavbar'

// Estimator sections (Phase 4+)
export { default as EstimatorDossierCard } from './EstimatorDossierCard'
export { default as FinancialSummaryHero } from './FinancialSummaryHero'
export { default as BillOfMaterialsTable } from './BillOfMaterialsTable'
export { default as OperationalConstraintsPanel } from './OperationalConstraintsPanel'
export { default as VisionEngineModal } from './VisionEngineModal'
export { default as ProjectsArchiveView } from './ProjectsArchiveView'
export { default as EstimatorAdminView } from './EstimatorAdminView'
export { default as PricingWaterfall } from './PricingWaterfall'
export { default as ProposalActionBar } from './ProposalActionBar'
export { default as ApprovalChainModal } from './ApprovalChainModal'
export { default as ReleaseSuccessModal } from './ReleaseSuccessModal'
export { default as ScopeBreachAlert } from './ScopeBreachAlert'
export { default as FlaggedItemBanner } from './FlaggedItemBanner'
export { default as AuditTrailPanel } from './AuditTrailPanel'
export { default as RoleHandoffTransition } from './RoleHandoffTransition'
export { default as VerificationLogCard } from './VerificationLogCard'
export { default as DealerArrivalToast } from './DealerArrivalToast'
export { default as AgentRoutingToast } from './AgentRoutingToast'
export { default as PMExecutionHandoff } from './PMExecutionHandoff'
export { default as DesignerTaskNotification } from './DesignerTaskNotification'
export { default as VerificationPdfPreviewModal } from './VerificationPdfPreviewModal'
export { default as ProposalPdfPreviewModal } from './ProposalPdfPreviewModal'
export { default as AuditTrailPdfPreviewModal } from './AuditTrailPdfPreviewModal'
export { default as DesignerVerificationOverlay } from './DesignerVerificationOverlay'

// WRG Demo v6 Origin Splash (Phase 4.6)

// WRG Demo v6 Handoff Banner (Phase 4.7)
export { default as HandoffBanner } from './HandoffBanner'

// Role profiles + Step state mapping (Phase 4.5)
export { ROLE_PROFILES, getRoleProfile } from './roles'
export {
    getStepState,
    getStepTab,
    getStepRole,
} from './stepStates'
export type { EstimatorStepState } from './stepStates'

// Calculations (Phase 2)
export { calculateInstall } from './calculations'

// Mock data (Phase 1)
export {
    INITIAL_CATEGORIES,
    INITIAL_RATES,
    INITIAL_MULTIPLIERS,
    INITIAL_MARGIN,
    INITIAL_CONFIG,
    INITIAL_VARIABLES,
    JPS_CUSTOMER,
    JPS_LINE_ITEMS,
    MOCK_SAVED_ESTIMATES,
} from './mockData'
