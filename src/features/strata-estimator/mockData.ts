// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Mock Data
// Phase 1 of WRG Demo v6 implementation
// Based on Project Aries defaults + JPS Health Network project data
// ═══════════════════════════════════════════════════════════════════════════════

import type {
    Category,
    ConfigState,
    Customer,
    LineItem,
    OperationalVariables,
    SavedEstimate,
} from './types'

// ── Categories (5 categories with subcategories) ──────────────────────────────
export const INITIAL_CATEGORIES: Record<string, Category> = {
    SYSTEMS: {
        id: 'SYSTEMS',
        label: 'Systems / Workstations',
        rate: 2.5,
        subcategories: {
            'SYS_BENCH': { id: 'SYS_BENCH', label: 'Benching / Open Plan', rate: 2.0 },
            'SYS_TILE': { id: 'SYS_TILE', label: 'Tile / Frame System', rate: 3.2 },
            'SYS_TYP': { id: 'SYS_TYP', label: 'Standard 6x6 Typical', rate: 2.5 },
        },
    },
    PRIVATE_OFFICE: {
        id: 'PRIVATE_OFFICE',
        label: 'Private Office / Casegoods',
        rate: 1.75,
        subcategories: {
            'PO_WOOD': { id: 'PO_WOOD', label: 'Wood Veneer Executive', rate: 2.2 },
            'PO_LAM': { id: 'PO_LAM', label: 'Laminate Standard', rate: 1.5 },
        },
    },
    TASK_SEATING: {
        id: 'TASK_SEATING',
        label: 'Task Seating',
        rate: 0.15,
        subcategories: {
            'SEAT_TASK': { id: 'SEAT_TASK', label: 'Ergonomic Task Chair', rate: 0.15 },
            'SEAT_STOOL': { id: 'SEAT_STOOL', label: 'Drafting Stool', rate: 0.20 },
        },
    },
    CONFERENCE: {
        id: 'CONFERENCE',
        label: 'Conference / Large Tables',
        rate: 3.0,
        subcategories: {
            'TAB_LG': { id: 'TAB_LG', label: '12ft+ Multi-section Table', rate: 4.5 },
            'TAB_SM': { id: 'TAB_SM', label: 'Huddle / Round Table', rate: 1.5 },
        },
    },
    ANCILLARY: {
        id: 'ANCILLARY',
        label: 'Ancillary / Lounge',
        rate: 1.0,
        subcategories: {
            'LOUNGE_SOFA': { id: 'LOUNGE_SOFA', label: 'Modular Sofa / Sectional', rate: 1.5 },
            'LOUNGE_CLUB': { id: 'LOUNGE_CLUB', label: 'Club / Side Chair', rate: 0.5 },
        },
    },
}

// ── Rates, Multipliers, Margin ────────────────────────────────────────────────
export const INITIAL_RATES = { NON_UNION: 65, UNION: 95 }
export const INITIAL_MULTIPLIERS = { STAIR_CARRY: 1.30, AFTER_HOURS: 1.50, SITE_PROTECTION: 1.05 }
export const INITIAL_MARGIN = 0.35

// ── Default Config ────────────────────────────────────────────────────────────
export const INITIAL_CONFIG: ConfigState = {
    categories: INITIAL_CATEGORIES,
    rates: INITIAL_RATES,
    multipliers: INITIAL_MULTIPLIERS,
    defaultMargin: INITIAL_MARGIN,
}

// ── Default Operational Variables ─────────────────────────────────────────────
export const INITIAL_VARIABLES: OperationalVariables = {
    noElevator: false,
    isUnion: false,
    afterHours: false,
    siteProtection: false,
    duration: 1,
}

// ── JPS Health Network — Customer ─────────────────────────────────────────────
export const JPS_CUSTOMER: Customer = {
    name: 'JPS Health Network',
    address: '1500 S Main St, Fort Worth, TX',
    zipCode: '76104',
}

// ── JPS Health Network — Line Items (24 items) ────────────────────────────────
// Healthcare facility — MillerKnoll products
export const JPS_LINE_ITEMS: LineItem[] = [
    // Workstations (5)
    { id: 'li-01', categoryId: 'SYSTEMS', subCategoryId: 'SYS_TYP', description: 'MillerKnoll Canvas Office 6x6 workstation — 3rd floor nursing station', quantity: 12 },
    { id: 'li-02', categoryId: 'SYSTEMS', subCategoryId: 'SYS_BENCH', description: 'MillerKnoll Layout Studio benching — admin area', quantity: 8 },
    { id: 'li-03', categoryId: 'SYSTEMS', subCategoryId: 'SYS_TILE', description: 'MillerKnoll Ethospace tile system — charting rooms', quantity: 6 },
    { id: 'li-04', categoryId: 'SYSTEMS', subCategoryId: 'SYS_BENCH', description: 'Herman Miller Canvas benching — residents lounge', quantity: 4 },
    { id: 'li-05', categoryId: 'SYSTEMS', subCategoryId: 'SYS_TYP', description: 'MillerKnoll Canvas Office — triage station', quantity: 3 },

    // Private offices (4)
    { id: 'li-06', categoryId: 'PRIVATE_OFFICE', subCategoryId: 'PO_WOOD', description: 'Geiger Tuxedo executive casegood — chief medical officer', quantity: 1 },
    { id: 'li-07', categoryId: 'PRIVATE_OFFICE', subCategoryId: 'PO_LAM', description: 'Herman Miller Everywhere Table desk — physician offices', quantity: 8 },
    { id: 'li-08', categoryId: 'PRIVATE_OFFICE', subCategoryId: 'PO_LAM', description: 'MillerKnoll Co/Struc casegood — nurse manager offices', quantity: 4 },
    { id: 'li-09', categoryId: 'PRIVATE_OFFICE', subCategoryId: 'PO_WOOD', description: 'Geiger Ward Bennett credenza — director suite', quantity: 2 },

    // Task seating (5)
    { id: 'li-10', categoryId: 'TASK_SEATING', subCategoryId: 'SEAT_TASK', description: 'Herman Miller Aeron Remastered — physician offices', quantity: 12 },
    { id: 'li-11', categoryId: 'TASK_SEATING', subCategoryId: 'SEAT_TASK', description: 'Herman Miller Mirra 2 — nursing stations', quantity: 45 },
    { id: 'li-12', categoryId: 'TASK_SEATING', subCategoryId: 'SEAT_STOOL', description: 'Herman Miller Aeron stool — exam rooms', quantity: 62 },
    { id: 'li-13', categoryId: 'TASK_SEATING', subCategoryId: 'SEAT_TASK', description: 'Herman Miller Verus — admin area', quantity: 18 },
    { id: 'li-14', categoryId: 'TASK_SEATING', subCategoryId: 'SEAT_TASK', description: 'Herman Miller Setu side chair — consultation rooms', quantity: 24 },

    // Conference tables (4)
    { id: 'li-15', categoryId: 'CONFERENCE', subCategoryId: 'TAB_LG', description: 'Geiger Tuxedo 14ft conference table — board room', quantity: 1 },
    { id: 'li-16', categoryId: 'CONFERENCE', subCategoryId: 'TAB_SM', description: 'Herman Miller Everywhere huddle table — collaboration zones', quantity: 8 },
    { id: 'li-17', categoryId: 'CONFERENCE', subCategoryId: 'TAB_SM', description: 'Herman Miller Civic round table — break rooms', quantity: 6 },
    { id: 'li-18', categoryId: 'CONFERENCE', subCategoryId: 'TAB_LG', description: 'Geiger Rhythm 10ft table — medical staff meeting', quantity: 2 },

    // Ancillary / Lounge (6)
    { id: 'li-19', categoryId: 'ANCILLARY', subCategoryId: 'LOUNGE_SOFA', description: 'OFS Serpentine 12-seat curved lounge — family waiting area [CUSTOM]', quantity: 1 },
    { id: 'li-20', categoryId: 'ANCILLARY', subCategoryId: 'LOUNGE_CLUB', description: 'Geiger Tuxedo club chair — visitor lounges', quantity: 32 },
    { id: 'li-21', categoryId: 'ANCILLARY', subCategoryId: 'LOUNGE_SOFA', description: 'Herman Miller Bevel sectional — patient family rooms', quantity: 6 },
    { id: 'li-22', categoryId: 'ANCILLARY', subCategoryId: 'LOUNGE_CLUB', description: 'Herman Miller Eames molded side chair — corridors', quantity: 40 },
    { id: 'li-23', categoryId: 'ANCILLARY', subCategoryId: 'LOUNGE_SOFA', description: 'Geiger Ward Bennett lounge — chapel', quantity: 4 },
    { id: 'li-24', categoryId: 'ANCILLARY', subCategoryId: 'LOUNGE_CLUB', description: 'Herman Miller Goetz sofa — pediatric waiting', quantity: 2 },
]

// ── Dealers (w2.3 dealer selector) ────────────────────────────────────────────
export interface DealerOption {
    id: string
    name: string
    role: string
    photo: string
    badge?: string
}

export const DEALERS: DealerOption[] = [
    {
        id: 'sara',
        name: 'Sara Chen',
        role: 'Account Manager',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
        badge: 'Primary',
    },
    {
        id: 'jordan',
        name: 'Jordan Park',
        role: 'VP Sales',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    },
    {
        id: 'michael',
        name: 'Michael Torres',
        role: 'Senior Dealer',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    },
]

// ── Quote assembly constants (w2.3 pricing waterfall) ─────────────────────────
// MillerKnoll product list price for the JPS scenario. Kept as a constant
// so the waterfall can show the real dealer-side number while labor stays
// live from calculateInstall().
export const JPS_PRODUCT_LIST = 287450
export const JPS_CONTRACT_DISCOUNT = 0.38
export const JPS_FREIGHT = 6234

// ── Dual-engine split (Pain #2 — delivery + installation unified) ────────────
// WRG's AS-IS has delivery (minutes / Section F/G) and installation (man-hours
// / JPS labor sheet) in two disconnected Excels. Strata's agent runs both in
// parallel. For the demo we treat the hero's totalHours as the unified bucket
// and present a fixed visual split so users see both engines without the
// calculation engine having to actually compute Delivery Pricer minutes.
export const DELIVERY_HOURS_RATIO = 0.30

// ── AI confidence mapping (per WRG AI readiness assessment) ───────────────────
// ~85% of BoM items are HIGH (template-parsed), ~15% are LOW (LLM fallback
// routed to human review). For JPS we hand-label 3 of the 24 items as LOW —
// the ones where the product code didn't match the template lookup cleanly.
export type AiConfidence = 'HIGH' | 'LOW'
const LOW_CONFIDENCE_ITEM_IDS = new Set(['li-06', 'li-15', 'li-19'])
export function getAiConfidence(itemId: string): AiConfidence {
    return LOW_CONFIDENCE_ITEM_IDS.has(itemId) ? 'LOW' : 'HIGH'
}

// ── Scope limits (Delivery Pricer 2026 · Sections F/G) ────────────────────────
// Used to detect breaches like 119 KD chairs > 50 limit (Pain #6).
export interface ScopeLimit {
    category: string
    limit: number
}
export const SCOPE_LIMITS: Record<string, ScopeLimit> = {
    KD_CHAIRS: { category: 'KD task chairs', limit: 50 },
    DESKS:     { category: 'Desk setups',    limit: 2 },
    FILES:     { category: 'File cabinets',  limit: 20 },
    HATS:      { category: 'HAT runs',       limit: 10 },
}

// ── Saved Estimates (archive mock) ────────────────────────────────────────────
export const MOCK_SAVED_ESTIMATES: SavedEstimate[] = [
    {
        id: 'est-001',
        customer: JPS_CUSTOMER,
        lineItems: JPS_LINE_ITEMS,
        variables: { noElevator: false, isUnion: false, afterHours: true, siteProtection: true, duration: 4 },
        config: INITIAL_CONFIG,
        estimate: {
            baseHours: '185.04',
            totalHours: '291.44',
            totalCost: '18,943.60',
            salesPrice: '202,138.00',
            grossMargin: '183,194.40',
            crewSize: 10,
            hourlyRate: 65,
        },
        status: 'PENDING',
        actualCost: 0,
        timestamp: Date.now() - 1000 * 60 * 60 * 2,
    },
    {
        id: 'est-002',
        customer: { name: 'Baylor Scott & White', address: '2401 S 31st St, Temple, TX', zipCode: '76508' },
        lineItems: JPS_LINE_ITEMS.slice(0, 10),
        variables: { noElevator: true, isUnion: false, afterHours: false, siteProtection: false, duration: 2 },
        config: INITIAL_CONFIG,
        estimate: {
            baseHours: '82.50',
            totalHours: '107.25',
            totalCost: '6,971.25',
            salesPrice: '94,850.00',
            grossMargin: '87,878.75',
            crewSize: 7,
            hourlyRate: 65,
        },
        status: 'APPROVED',
        actualCost: 7245.00,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
    },
    {
        id: 'est-003',
        customer: { name: 'Methodist Health System', address: '1441 N Beckley Ave, Dallas, TX', zipCode: '75203' },
        lineItems: JPS_LINE_ITEMS.slice(0, 15),
        variables: { noElevator: false, isUnion: true, afterHours: true, siteProtection: true, duration: 5 },
        config: INITIAL_CONFIG,
        estimate: {
            baseHours: '142.30',
            totalHours: '291.71',
            totalCost: '27,712.45',
            salesPrice: '142,860.00',
            grossMargin: '115,147.55',
            crewSize: 8,
            hourlyRate: 95,
        },
        status: 'COMPLETED',
        actualCost: 26890.00,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 21,
    },
    {
        id: 'est-004',
        customer: { name: 'Cook Children\'s Medical Center', address: '801 7th Ave, Fort Worth, TX', zipCode: '76104' },
        lineItems: JPS_LINE_ITEMS.slice(5, 18),
        variables: { noElevator: false, isUnion: false, afterHours: false, siteProtection: false, duration: 3 },
        config: INITIAL_CONFIG,
        estimate: {
            baseHours: '98.60',
            totalHours: '98.60',
            totalCost: '6,409.00',
            salesPrice: '87,200.00',
            grossMargin: '80,791.00',
            crewSize: 5,
            hourlyRate: 65,
        },
        status: 'DRAFT',
        actualCost: 0,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1,
    },
]
