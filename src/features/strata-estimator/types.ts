// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — TypeScript types
// Phase 1 of WRG Demo v6 implementation
// ═══════════════════════════════════════════════════════════════════════════════

// ── Tabs ──────────────────────────────────────────────────────────────────────
export type EstimatorTab = 'ESTIMATOR' | 'PROJECTS'

// ── Status ────────────────────────────────────────────────────────────────────
// Aries parity: only 2 sync states (synced | saving). No idle/error.
export type EstimateStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'COMPLETED'
export type SyncStatus = 'synced' | 'saving'

// ── Categories & Subcategories ────────────────────────────────────────────────
export interface Subcategory {
    id: string
    label: string
    rate: number
}

export interface Category {
    id: string
    label: string
    rate: number
    subcategories: Record<string, Subcategory>
}

// ── Line Items ────────────────────────────────────────────────────────────────
export interface LineItem {
    id: string
    categoryId: string
    subCategoryId: string
    description: string
    quantity: number
}

// ── Customer ──────────────────────────────────────────────────────────────────
export interface Customer {
    name: string
    address: string
    zipCode: string
}

// ── Operational Variables ─────────────────────────────────────────────────────
export interface OperationalVariables {
    noElevator: boolean
    isUnion: boolean
    afterHours: boolean
    siteProtection: boolean
    duration: number
}

// ── Estimate Result ───────────────────────────────────────────────────────────
export interface EstimateResult {
    baseHours: string
    totalHours: string
    totalCost: string
    salesPrice: string
    grossMargin: string
    crewSize: number
    hourlyRate: number
}

// ── Config State ──────────────────────────────────────────────────────────────
export interface ConfigState {
    categories: Record<string, Category>
    rates: { NON_UNION: number; UNION: number }
    multipliers: { STAIR_CARRY: number; AFTER_HOURS: number; SITE_PROTECTION: number }
    defaultMargin: number
}

// ── Saved Estimate (archive) ──────────────────────────────────────────────────
export interface SavedEstimate {
    id: string
    customer: Customer
    lineItems: LineItem[]
    variables: OperationalVariables
    config: ConfigState
    estimate: EstimateResult
    status: EstimateStatus
    actualCost: number
    timestamp: number
}
