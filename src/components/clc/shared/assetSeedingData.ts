// Mock data for Flow 2 — SharePoint Asset Seeding
//
// Fairport Public Library project · 5 IQ jobs (1 per vendor) on state contracts,
// 2 excluded IQ jobs that share the customer but belong to different projects.

export interface VendorJob {
    iqJobId: string
    vendor: string
    description: string
    customerTag: string
    /** When false, this job is excluded from the seeding bundle */
    included: boolean
    /** Reason for inclusion / exclusion */
    rationale: string
    /** Assets produced by this vendor for this project */
    assets: AssetEntry[]
}

export interface AssetEntry {
    id: string
    name: string
    type: 'shop-drawing' | 'ack' | 'site-plan' | 'runbook'
    sizeKb: number
    /** Strata flag · raises a Sparkles indicator when true */
    aiFlagged?: boolean
    flagReason?: string
}

export const PROJECT_CUSTOMER_TAG = 'Fairport Library Phase 1'

export const FAIRPORT_VENDOR_JOBS: VendorJob[] = [
    // ─── INCLUDED (5 vendors on the project) ───────────────────────────────
    {
        iqJobId: 'J-44021',
        vendor: 'TMC',
        description: 'Custom millwork · circulation desk + end panels',
        customerTag: PROJECT_CUSTOMER_TAG,
        included: true,
        rationale: 'Customer tag matches project · scheduled · ready to seed',
        assets: [
            { id: 'tmc-sd-1', name: 'TMC-circ-desk-shop-drawing.pdf',  type: 'shop-drawing', sizeKb: 1320 },
            { id: 'tmc-sd-2', name: 'TMC-end-panels-layout.pdf',       type: 'shop-drawing', sizeKb: 980 },
            { id: 'tmc-ack-1', name: 'TMC-ACK-pkg-Fairport.pdf',        type: 'ack',          sizeKb: 420 },
        ],
    },
    {
        iqJobId: 'J-44022',
        vendor: 'KI',
        description: 'Adult & teen seating · reading nooks',
        customerTag: PROJECT_CUSTOMER_TAG,
        included: true,
        rationale: 'Customer tag matches project · scheduled · ready to seed',
        assets: [
            { id: 'ki-sd-1', name: 'KI-seating-layout-v3.pdf', type: 'shop-drawing', sizeKb: 1180 },
            { id: 'ki-ack-1', name: 'KI-ACK-Fairport-2026-05-29.pdf', type: 'ack', sizeKb: 510,
              aiFlagged: true, flagReason: '2 of 24 lounge chairs short-shipped · vendor proposes back-order' },
        ],
    },
    {
        iqJobId: 'J-44023',
        vendor: 'Smith System',
        description: 'Study tables · adjustable height · 18 stations',
        customerTag: PROJECT_CUSTOMER_TAG,
        included: true,
        rationale: 'Customer tag matches project · scheduled · ready to seed',
        assets: [
            { id: 'ss-sd-1', name: 'SS-study-tables-shop-drawing.pdf', type: 'shop-drawing', sizeKb: 890 },
            { id: 'ss-sd-2', name: 'SS-mobility-detail.pdf',           type: 'shop-drawing', sizeKb: 620 },
            { id: 'ss-ack-1', name: 'SS-ACK-Fairport.pdf',              type: 'ack',          sizeKb: 380 },
        ],
    },
    {
        iqJobId: 'J-44024',
        vendor: 'Media Tech',
        description: 'AV cabinetry · 4 collaboration zones',
        customerTag: PROJECT_CUSTOMER_TAG,
        included: true,
        rationale: 'Customer tag matches project · scheduled · ready to seed',
        assets: [
            { id: 'mt-sd-1', name: 'MT-AV-cabinetry-shop-drawing.pdf', type: 'shop-drawing', sizeKb: 1480 },
            { id: 'mt-ack-1', name: 'MT-ACK-Fairport.pdf',              type: 'ack',          sizeKb: 410 },
        ],
    },
    {
        iqJobId: 'J-44025',
        vendor: 'Aurora',
        description: 'Lounge upholstery · 12 chairs · finish coordination',
        customerTag: PROJECT_CUSTOMER_TAG,
        included: true,
        rationale: 'Customer tag matches project · scheduled · ready to seed',
        assets: [
            { id: 'ar-sd-1', name: 'Aurora-lounge-shop-drawing.pdf', type: 'shop-drawing', sizeKb: 760 },
            { id: 'ar-ack-1', name: 'Aurora-ACK-Fairport.pdf',        type: 'ack',          sizeKb: 350 },
        ],
    },
    // ─── EXCLUDED (same customer, different projects) ──────────────────────
    {
        iqJobId: 'J-43901',
        vendor: 'Tappé Architects · TMC fulfillment',
        description: 'Punch order from prior install (Phase 0)',
        customerTag: 'Fairport Library Phase 0 · Punch',
        included: false,
        rationale: 'Customer tag mismatch · "Fairport Library Phase 0 · Punch" vs current project · already installed Apr 2026',
        assets: [],
    },
    {
        iqJobId: 'J-44510',
        vendor: 'SWBR coordination · KI fulfillment',
        description: 'Q4 reading garden renovation · pre-order',
        customerTag: 'Fairport Renovation Q4',
        included: false,
        rationale: 'Customer tag mismatch · "Fairport Renovation Q4" · ready-date Oct 2026 · separate work order',
        assets: [],
    },
]

/** Shared site-plan and runbook (not per-vendor) added by Strata in step clc2.3. */
export const COMMON_ASSETS: AssetEntry[] = [
    { id: 'common-1', name: 'Fairport-site-plan-v2.pdf',         type: 'site-plan', sizeKb: 2200 },
    { id: 'common-2', name: 'Fairport-installer-runbook-v1.pdf', type: 'runbook',   sizeKb: 540 },
]

export const SHAREPOINT_FOLDER_URL =
    'https://creativelibraryconcepts.sharepoint.com/sites/Installs/Fairport-Library-Phase1/'

export const SCHEDULED_INSTALL_DATE = '2026-06-02'

export interface AssetTypeMeta {
    label: string
    colorClass: string
}
export const ASSET_TYPE_META: Record<AssetEntry['type'], AssetTypeMeta> = {
    'shop-drawing': { label: 'Shop drawing', colorClass: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
    'ack':          { label: 'ACK',          colorClass: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
    'site-plan':    { label: 'Site plan',    colorClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
    'runbook':      { label: 'Runbook',      colorClass: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300' },
}
