// ═══════════════════════════════════════════════════════════════════════════════
// Metro Legal · Labor & Delivery Estimation demo data
//
// Same project as METRO_LEGAL_ORDER_META (manattOrderData.ts) · PO-DC-0009642 ·
// Metro Legal Firm · 4th Floor · DC market · 1551 K St NW.
//
// The L&D flow runs IN PARALLEL to the Spec Check & Design flow per the
// AS-IS BPMN: while Kimberly's BOM is being designed, Alan's ops team is
// running the labor RFP to 3 approved DC installers.
//
// Source anchors (every datum traces to AS-IS doc / clarification call):
//   - Volumes:        Notion AS-IS §Summary
//   - Conditions:     Notion AS-IS §3 + Clarification call ~6:54 / ~52:05
//   - Installers:     Notion AS-IS §4 (DC pool consolidation)
//   - Benchmark:      Notion AS-IS §6 (Alan's mental formula)
//   - DC 2024 case:   Notion AS-IS §8 ($160k → $106k post-rebid)
// ═══════════════════════════════════════════════════════════════════════════════

export const METRO_LEGAL_LD_RFP = {
    poNumber: 'PO-DC-0009642',                          // mismo PO sc1.x
    projectName: 'Metro Legal Firm · 4th Floor',
    market: 'DC',
    gcCompany: 'CBRE',
    gcContact: 'jonathan.spence@cbre.com',
    gcContactName: 'Jonathan Spence',
    drawingFile: 'manatt-4th-floor.dwg',                // mismo file sc1.0b
    rfpReceivedAt: '2026-05-12 09:14',
    slaDeadlineHours: 48,
    slaDeadlineAt: '2026-05-14 09:14',
    gcPortalRef: 'BC-RFP-882041',
    gcPortal: 'Building Connected',
    buildingAddress: '1551 K St NW · Washington DC',
    priorProjectsAtAddress: 5,
} as const;

export const METRO_LEGAL_TAKEOFF = {
    workstationCount: 127,
    crCount: 18,
    estimatedLaborHours: 320,
    estimatedDeliveryStops: 2,
    takeoffSourceFile: 'manatt-4th-floor.dwg',
    bluebeamTimeManualMin: 150,                          // 2.5h manual count
    strataTimeSec: 18,
} as const;

export const TAKEOFF_BULLETS = [
    'Reading manatt-4th-floor.dwg · 4,820 entities',
    'Detecting workstations · 127 found',
    'Detecting CRs · 18 found',
    'Estimating labor hours · 320 h',
    'Detecting delivery stops · 2 stops',
] as const;

export type ConditionConfidence = 'high' | 'medium' | 'low';

export const METRO_LEGAL_BUILDING_CONDITIONS = [
    { id: 'freight',    label: 'Freight elevator',          value: "Yes · 8'×6'×9'",       confidence: 'high'   as ConditionConfidence, source: 'Building KB · 1551 K St NW (5 prior projects)' },
    { id: 'lift',       label: 'Single vs double lift',     value: 'Single lift',           confidence: 'high'   as ConditionConfidence, source: 'Building KB · 1551 K St NW' },
    { id: 'dock',       label: 'Loading dock',              value: 'Dock with leveler',     confidence: 'high'   as ConditionConfidence, source: 'Building KB · 1551 K St NW' },
    { id: 'trailer',    label: 'Trailer size limit',        value: "48' max",               confidence: 'high'   as ConditionConfidence, source: 'Building KB · 1551 K St NW' },
    { id: 'union',      label: 'Union building',            value: 'Yes · IBEW Local 26',   confidence: 'high'   as ConditionConfidence, source: 'Building KB · 1551 K St NW' },
    { id: 'hours',      label: 'Receiving hours',           value: 'M-F 7am-4pm',           confidence: 'medium' as ConditionConfidence, source: 'Project intake form (CBRE)' },
    { id: 'ot',         label: 'OT vs straight-time',       value: 'Straight-time only',    confidence: 'high'   as ConditionConfidence, source: 'GC RFP attachment' },
    { id: 'noise',      label: 'Noise restriction hours',   value: 'After 8pm',             confidence: 'medium' as ConditionConfidence, source: 'Building KB · 1551 K St NW' },
    { id: 'prevailing', label: 'Prevailing wage',           value: 'No',                    confidence: 'medium' as ConditionConfidence, source: 'GC RFP attachment' },
    { id: 'osha',       label: 'OSHA + badging',            value: 'OSHA-30 + badging',     confidence: 'high'   as ConditionConfidence, source: 'GC RFP attachment' },
    { id: 'stair',      label: 'Stair carry required',      value: 'No',                    confidence: 'high'   as ConditionConfidence, source: 'Floor plan analysis' },
    { id: 'equipment',  label: 'Equipment provision',       value: '100% installer-provided', confidence: 'high' as ConditionConfidence, source: 'OW MSA policy · all special equipment by installer' },
] as const;

export type BuildingCondition = (typeof METRO_LEGAL_BUILDING_CONDITIONS)[number];

export const APPROVED_INSTALLERS_DC = [
    {
        id: 'V001',
        name: 'Pinnacle Systems Inc',
        markets: 'DC · NoVA',
        msaRate: '$58/hr blended',
        headroom: 'Low (3 active)',
        headroomTone: 'warning' as const,
        activeJobsCount: 3,
        crewCapacityRemaining: 8,
        onTimeRate: 92,
        onTimeTrend: 'flat' as const,
        changeOrderRate: 4,
        changeOrderTrend: 'flat' as const,
        unionStatus: 'Union',
        flagText: 'Capacity headroom Low',
        flagTone: 'warning' as const,
        past12moJobs: 11,
    },
    {
        id: 'V002',
        name: 'Northeast Installation Co',
        markets: 'DC · MD',
        msaRate: '$62/hr blended',
        headroom: 'Available',
        headroomTone: 'neutral' as const,
        activeJobsCount: 1,
        crewCapacityRemaining: 28,
        onTimeRate: 88,
        onTimeTrend: 'down' as const,
        changeOrderRate: 7,
        changeOrderTrend: 'up' as const,
        unionStatus: 'Union',
        flagText: null,
        flagTone: null,
        past12moJobs: 8,
    },
    {
        id: 'V003',
        name: 'TriState Labor Solutions',
        markets: 'DC · NJ · NY',
        msaRate: '$56/hr blended',
        headroom: 'High',
        headroomTone: 'success' as const,
        activeJobsCount: 0,
        crewCapacityRemaining: 42,
        onTimeRate: 96,
        onTimeTrend: 'up' as const,
        changeOrderRate: 2,
        changeOrderTrend: 'down' as const,
        unionStatus: 'Union + non-union',
        flagText: 'Strata recommends',
        flagTone: 'success' as const,
        past12moJobs: 14,
    },
] as const;

export type Installer = (typeof APPROVED_INSTALLERS_DC)[number];

export const BID_RESPONSES = [
    { vendorId: 'V001', laborTotal: 18450, deliveryTotal: 2800, total: 21250, receivedAt: '2026-05-13 14:22', deliveryHours: 28, arrivalDelayMs:  800 },
    { vendorId: 'V002', laborTotal: 19200, deliveryTotal: 2500, total: 21700, receivedAt: '2026-05-13 16:08', deliveryHours: 32, arrivalDelayMs: 1700 },
    { vendorId: 'V003', laborTotal: 17800, deliveryTotal: 3100, total: 20900, receivedAt: '2026-05-14 09:45', deliveryHours: 24, arrivalDelayMs: 2700 },
] as const;

export type BidResponse = (typeof BID_RESPONSES)[number];

export const INTERNAL_BENCHMARK = {
    laborHours: 320,
    hourlyRateBlend: 60,
    laborBaseline: 19200,
    deliveryStops: 2,
    deliveryRateEach: 1350,
    deliveryBaseline: 2700,
    totalBaseline: 21900,
    formulaText: '320 hrs × $60/hr (MSA blended DC) + 2 stops × $1,350',
    varianceThresholdPct: 15,
} as const;

export const FINAL_QUOTE = {
    winnerVendorId: 'V003',
    vendorNet: 20900,                                   // TriState total
    owMarginPct: 0.18,
    owMarginAmount: 3762,
    quotedTotal: 24662,
    excelTemplate: 'CBRE-Quote-Template-v3.xlsx',
    excelCells: { labor: 'B12', delivery: 'B13', owTotal: 'B14', owMarginPct: 'D17' },
    portalSubmittedAt: '2026-05-14 16:42',
    portalRef: 'BC-RFP-882041',
} as const;

export const PORTAL_UPLOAD_BULLETS = [
    'Validating Excel cells · B12 / B13 / B14 / D17',
    'Verifying formula integrity · 4/4 cells balanced',
    'Encrypting payload · Building Connected secure channel',
    'Uploading to Building Connected · BC-RFP-882041',
] as const;

export const HISTORICAL_RECEIPTS = {
    dcRebid2024:        { quoted: 160000, actual: 106000, delta: 54000, note: 'DC job 2024 · $160k/floor quoted → $106k/floor post-rebid' },
    colonialBoston2024: { quoted: 175000, internal: 100000, delta: 75000, note: 'Colonial/Boston 2024 · $175k quoted vs $100k internal check' },
    netflixNearMiss:    { note: 'Netflix RFP 2024 · priced manually on phone with Alan minutes before portal close' },
} as const;

// ─── Volume painpoints citados literalmente del AS-IS / call transcript ─────
export const LD_VOLUME_FACTS = {
    estimatesPerMonth: 300,
    furniturePct: 80,                                   // ~240/mes
    wallsPct: 20,                                       // ~40/mes
    activeSimultaneous: '50–100',
    outboundEmailsPerMonth: '700–900',
    bluebeamManualNote: 'Single most time-consuming step entire process · Alan + Paul confirmed',
    nowhereCurrentlyQuote: '"Nowhere currently. Nowhere currently." — Alan McPhee · clarification call ~6:54',
    vendorConsolidationNote: 'DC pool consolidated May/2026 · 20 → 6 vendors · target ≤4 per market',
} as const;

// ─── L&D actor · Furniture vertical ─────────────────────────────────────────
// Alan McPhee · Sr Operations · Burlington MA · 25+ yrs · Furniture vertical
// regional lead · equivalente operativo a Felicia en design.
export const ALAN_MCPHEE = {
    fullName: 'Alan McPhee',
    initials: 'AM',
    role: 'Sr Operations · Furniture',
    region: 'Burlington MA · Regional Lead',
    seniorityYears: 25,
    email: 'alan.mcphee@officeworks.com',
} as const;

// ─── L&D actor · Walls vertical ─────────────────────────────────────────────
// Paul Egan · Head of Operations · Walls Group · Centralized governance lead.
// Operational opposite of Alan: regulated · workload-balanced · structured PDF.
export const PAUL_EGAN = {
    fullName: 'Paul Egan',
    initials: 'PE',
    role: 'Head of Ops · Walls',
    region: 'Centralized · NJ + PA + MA',
    seniorityYears: 25,
    email: 'paul.egan@officeworks.com',
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// WALLS VERTICAL · 20% of volume · centralized governance (Paul Egan)
// Same BPMN structure as Furniture but different scope language + vendor pool
// ═══════════════════════════════════════════════════════════════════════════════

export const WALLS_TAKEOFF = {
    linearFeet: 482,
    wallHeights: "9' standard · 12' lobby",
    doorCount: 18,
    estimatedLaborHours: 285,
    estimatedDeliveryStops: 1,
    takeoffSourceFile: 'manatt-4th-floor.dwg',
    bluebeamTimeManualMin: 180,
    strataTimeSec: 22,
} as const;

export const WALLS_TAKEOFF_BULLETS = [
    'Reading manatt-4th-floor.dwg · 4,820 entities',
    'Detecting wall runs · 482 linear feet found',
    'Detecting door openings · 18 doors found',
    'Estimating labor hours · 285 h',
    'Detecting delivery stops · 1 stop',
] as const;

export const APPROVED_INSTALLERS_WALLS = [
    {
        id: 'W001',
        name: 'Metro Walls Inc',
        markets: 'NJ · PA',
        msaRate: '$72/hr blended',
        headroom: 'Available',
        headroomTone: 'neutral' as const,
        activeJobsCount: 1,
        crewCapacityRemaining: 32,
        onTimeRate: 94,
        onTimeTrend: 'up' as const,
        changeOrderRate: 3,
        changeOrderTrend: 'down' as const,
        unionStatus: 'Union',
        flagText: 'Strata recommends',
        flagTone: 'success' as const,
        past12moJobs: 9,
    },
    {
        id: 'W002',
        name: 'Architectural Build Co',
        markets: 'NJ · NY',
        msaRate: '$68/hr blended',
        headroom: 'Available',
        headroomTone: 'neutral' as const,
        activeJobsCount: 2,
        crewCapacityRemaining: 18,
        onTimeRate: 91,
        onTimeTrend: 'flat' as const,
        changeOrderRate: 5,
        changeOrderTrend: 'flat' as const,
        unionStatus: 'Union',
        flagText: null,
        flagTone: null,
        past12moJobs: 7,
    },
    {
        id: 'W003',
        name: 'Modular Systems Group',
        markets: 'MA · NJ · PA',
        msaRate: '$70/hr blended',
        headroom: 'High',
        headroomTone: 'success' as const,
        activeJobsCount: 0,
        crewCapacityRemaining: 40,
        onTimeRate: 93,
        onTimeTrend: 'up' as const,
        changeOrderRate: 4,
        changeOrderTrend: 'flat' as const,
        unionStatus: 'Union + non-union',
        flagText: null,
        flagTone: null,
        past12moJobs: 11,
    },
] as const;

export const WALLS_BID_RESPONSES = [
    { vendorId: 'W001', laborTotal: 20520, deliveryTotal: 1800, total: 22320, receivedAt: '2026-05-13 11:08', deliveryHours: 16, arrivalDelayMs:  900 },
    { vendorId: 'W002', laborTotal: 19380, deliveryTotal: 2200, total: 21580, receivedAt: '2026-05-13 15:24', deliveryHours: 20, arrivalDelayMs: 1700 },
    { vendorId: 'W003', laborTotal: 19950, deliveryTotal: 2050, total: 22000, receivedAt: '2026-05-14 08:12', deliveryHours: 18, arrivalDelayMs: 2600 },
] as const;

export const WALLS_INTERNAL_BENCHMARK = {
    laborHours: 285,
    hourlyRateBlend: 70,
    laborBaseline: 19950,
    deliveryStops: 1,
    deliveryRateEach: 1950,
    deliveryBaseline: 1950,
    totalBaseline: 21900,
    formulaText: '285 hrs × $70/hr (MSA blended Walls) + 1 stop × $1,950',
    varianceThresholdPct: 15,
} as const;

export const WALLS_FINAL_QUOTE = {
    winnerVendorId: 'W001',
    vendorNet: 22320,
    owMarginPct: 0.18,
    owMarginAmount: 4018,
    quotedTotal: 26338,
    excelTemplate: 'CBRE-Quote-Template-v3.xlsx',
    excelCells: { labor: 'B12', delivery: 'B13', owTotal: 'B14', owMarginPct: 'D17' },
    portalSubmittedAt: '2026-05-14 16:42',
    portalRef: 'BC-RFP-882041',
} as const;

export const WALLS_GOVERNANCE = {
    actor: 'Paul Egan · Head of Ops · Walls',
    structuredPDF: 'Installation Quote Request · Sections A-G',
    centralized: true,
    workloadBalancing: 'Active · Paul selects',
    contrastNote: 'vs Furniture: decentralized · PMs select · no workload check',
} as const;

export const WALLS_VOLUME_FACTS = {
    estimatesPerMonth: 60,                              // ~20% of 300
    pctOfTotal: 20,
    structuredPDFUsage: '~70% of bid requests · plain email under pressure',
    strategicAccountPct: 75,
    activeSimultaneous: '10–20',
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// DOC PREVIEW CONTENT · mocks for the modal left-panel previews
// Used by the LDxxxPreview components in OfficeworksDocumentReviewModal.
// ═══════════════════════════════════════════════════════════════════════════════

export const COVER_LETTER_BODY = {
    from: 'Jonathan Spence',
    fromTitle: 'Construction Manager · CBRE',
    fromEmail: 'jonathan.spence@cbre.com',
    to: 'Alan McPhee',
    toTitle: 'Sr Operations · Officeworks',
    subject: 'Labor RFP · Metro Legal 4F · responses due Wed May 14 9 AM',
    receivedAt: '2026-05-12 09:14',
    body: [
        'Alan,',
        'Please quote labor + delivery for the Metro Legal Firm project (4th Floor build-out, 1551 K St NW, Washington DC).',
        'Drawings + SIF attached. Submit pricing back via Building Connected — ref BC-RFP-882041.',
        'Deadline 48h MSA window. Reach out if anything is unclear.',
        'Thanks,',
        'Jonathan',
    ],
} as const;

export const SIF_FURNITURE = {
    title: 'Scope of Information File',
    project: 'Metro Legal 4th Floor · Build-out',
    market: 'DC',
    deliveryAddress: '1551 K St NW · Washington DC',
    scope: [
        { label: 'Workstations',        value: '127 units · Focus + Teknion' },
        { label: 'Conference rooms',    value: '4 (8/12/20/24 seats)' },
        { label: 'Soft seating areas',  value: '2' },
        { label: 'Storage cabinets',    value: '38 units' },
        { label: 'Configurable items',  value: '18 CRs · 25-40 day lead time' },
        { label: 'Union rules',         value: 'IBEW Local 26 · straight-time only' },
        { label: 'Delivery window',     value: 'Mon-Fri 7am-4pm · dock leveler' },
    ],
} as const;

export const SIF_WALLS = {
    title: 'Scope of Information File',
    project: 'Metro Legal 4th Floor · Build-out',
    market: 'DC',
    deliveryAddress: '1551 K St NW · Washington DC',
    scope: [
        { label: 'Linear feet',         value: '482 linear feet' },
        { label: 'Wall heights',        value: "9' standard · 12' lobby" },
        { label: 'Door openings',       value: '18 doors' },
        { label: 'Glass panels',        value: '24 panels' },
        { label: 'Wall finishes',       value: 'Standard · 2 accent zones' },
        { label: 'Union rules',         value: 'IBEW Local 26 · straight-time only' },
        { label: 'Delivery window',     value: 'Mon-Fri 7am-4pm · dock leveler' },
    ],
} as const;

export const BID_REQUEST_EMAIL_FURNITURE = {
    from: 'Alan McPhee <alan.mcphee@officeworks.com>',
    subject: 'Bid request · Metro Legal 4F · respond by Wed May 14 9 AM',
    body: [
        'Team,',
        'We have a labor + delivery RFP for Metro Legal 4th Floor (DC market · 1551 K St NW). Scope summary + drawings attached.',
        'Scope: 127 workstations · 18 CRs · ~320h estimated labor · 2 delivery stops. Union building (IBEW Local 26), dock leveler, straight-time only.',
        'Deadline: respond by Wed May 14 9 AM (48h MSA window). Please separate labor and delivery in your quote.',
        '— Alan',
    ],
    preFlight: [
        'Recipient list complete (3)',
        'Attachments present (3) · drawings + conditions + bid form',
        'Deadline within 48h MSA window',
    ],
} as const;

export const WALLS_BID_REQUEST_SECTIONS_A_G = {
    title: 'Installation Quote Request',
    template: 'Walls Group · standard form · Sections A-G',
    sections: [
        { id: 'A', label: 'Project Information',     fields: ['Project name: Metro Legal 4F', 'Market: DC', 'GC: CBRE', 'PO ref: BC-RFP-882041'] },
        { id: 'B', label: 'Scope of Work',           fields: ['482 linear feet', '18 doors', '9–12 ft wall heights', '24 glass panels'] },
        { id: 'C', label: 'Site Conditions',         fields: ['IBEW Local 26 union', 'Dock leveler · single lift', 'M-F 7am-4pm receiving', 'OSHA-30 + badging required'] },
        { id: 'D', label: 'Labor Rates',             fields: ['MSA blended rate per market', 'Prevailing wage: No', 'OT vs straight-time: ST only'] },
        { id: 'E', label: 'Delivery Requirements',   fields: ['1 delivery stop', 'Trailer 48\' max', 'No stair carry', 'Equipment 100% installer-provided'] },
        { id: 'F', label: 'Schedule',                fields: ['Submission deadline: Wed May 14 9 AM', 'Award decision: 48h post-bids'] },
        { id: 'G', label: 'Terms',                   fields: ['Lump-sum response required', 'Labor + Delivery separated', 'Change-order policy per MSA'] },
    ],
} as const;

export const NOTIFICATION_DRAFTS = {
    winner: {
        subject: 'Award notification · Metro Legal 4F',
        body: [
            'Congratulations · TriState Labor Solutions has been selected for the Metro Legal 4F installation.',
            'Net contract: $20,900 (labor + delivery).',
            'Next steps: kickoff call to schedule mobilization. Reach out to coordinate.',
            '— Alan',
        ],
    },
    loserPinnacle: {
        subject: 'Bid decision · Metro Legal 4F',
        body: [
            'Thank you for submitting your bid for Metro Legal 4F. We have selected another installer this round.',
            'Your scorecard remains strong · we will continue to invite you to upcoming RFPs.',
            '— Alan',
        ],
    },
    loserNortheast: {
        subject: 'Bid decision · Metro Legal 4F',
        body: [
            'Thank you for your bid for Metro Legal 4F. We have selected another installer this round.',
            'We appreciate the timely response and will continue inviting you to future RFPs.',
            '— Alan',
        ],
    },
} as const;

export const PORTAL_STATUS = {
    portal: 'Building Connected',
    ref: 'BC-RFP-882041',
    submittedAt: '2026-05-14 16:42',
    deadline: '2026-05-15 00:00',
    status: 'Submitted on time',
    timeBeforeDeadline: '7h 18m',
} as const;

// ─── Helper · resolve all vertical-specific datasets in one call ────────────
// Panels call this once per render and destructure what they need · keeps the
// inline conditionals out of the JSX.
//
// Returns vendors/bids/benchmark/finalQuote/takeoff/takeoffBullets typed as the
// looser union of Furniture + Walls shapes (they share field names) so the
// component code stays the same regardless of vertical.

export type Vertical = 'furniture' | 'walls';

export function getActiveVerticalData(vertical: Vertical) {
    if (vertical === 'walls') {
        return {
            vertical,
            actor: PAUL_EGAN,
            takeoff: WALLS_TAKEOFF,
            takeoffBullets: WALLS_TAKEOFF_BULLETS,
            installers: APPROVED_INSTALLERS_WALLS,
            bids: WALLS_BID_RESPONSES,
            benchmark: WALLS_INTERNAL_BENCHMARK,
            finalQuote: WALLS_FINAL_QUOTE,
            governance: WALLS_GOVERNANCE,
            volume: WALLS_VOLUME_FACTS,
            // Walls scope display · use linear-feet + wall-height idiom.
            scopeUnitLabel: 'Linear feet',
            scopeUnitValue: `${WALLS_TAKEOFF.linearFeet} lf`,
            scopeSecondary: WALLS_TAKEOFF.wallHeights,
        } as const;
    }
    return {
        vertical,
        actor: ALAN_MCPHEE,
        takeoff: METRO_LEGAL_TAKEOFF,
        takeoffBullets: TAKEOFF_BULLETS,
        installers: APPROVED_INSTALLERS_DC,
        bids: BID_RESPONSES,
        benchmark: INTERNAL_BENCHMARK,
        finalQuote: FINAL_QUOTE,
        governance: null,
        volume: LD_VOLUME_FACTS,
        scopeUnitLabel: 'Workstations',
        scopeUnitValue: `${METRO_LEGAL_TAKEOFF.workstationCount}`,
        scopeSecondary: `${METRO_LEGAL_TAKEOFF.crCount} CRs`,
    } as const;
}

// ─── L&D Pipeline data · context cards + Metro Legal badges/subtitles per col ────
// Mirrors the shape of CONTEXT_CARDS / METRO_LEGAL_BADGE / METRO_LEGAL_SUBTITLE in
// OfficeworksFunnel.tsx so the funnel can render the L&D flow consistently.

export interface LDContextCard {
    code: string
    initials: string
    client: string
    value: string
    colIdx: number
    avatarBg: string
    avatarColor: string
    desc: string
    designer: string
}

export const LD_CONTEXT_PROJECTS: LDContextCard[] = [
    {
        code: 'TECHVIEW-MA-2F', initials: 'TV', client: 'TechView Systems · Cambridge MA',
        value: '$18,200', colIdx: 2,                              // Vendor Bid column
        avatarBg: 'bg-warning/20', avatarColor: 'text-warning',
        desc: '3 RFPs sent · awaiting installer responses · 18h remaining',
        designer: 'Priya Shah (MA)',
    },
    {
        code: 'BAYHILL-NJ-3F', initials: 'BH', client: 'Bay Hill Law · Newark NJ',
        value: '$32,400', colIdx: 3,                              // Bid Eval column
        avatarBg: 'bg-primary/20', avatarColor: 'text-primary',
        desc: '3 bids received · Northeast winner candidate · variance 8%',
        designer: 'Marcus Chen (NJ)',
    },
    {
        code: 'GENSCAP-PA-5F', initials: 'GC', client: 'GenCap Capital · Philadelphia PA',
        value: '$48,800', colIdx: 4,                              // Final Quote column
        avatarBg: 'bg-success/20', avatarColor: 'text-success',
        desc: 'Quote $48.8k · uploaded to GC portal · awaiting award',
        designer: 'Marcus Chen (NJ)',
    },
];

export const METRO_LEGAL_LD_BADGE: Record<number, { label: string; className: string }> = {
    0: { label: 'RFP routed',     className: 'bg-ai/10 text-ai border border-ai/20' },
    1: { label: 'Conditions OK',  className: 'bg-info/10 text-info border border-info/20' },
    2: { label: 'Bid sent',       className: 'bg-warning/10 text-warning border border-warning/20' },
    3: { label: 'Variance OK',    className: 'bg-primary/10 text-primary border border-primary/20' },
    4: { label: 'Quote uploaded', className: 'bg-success/10 text-success border border-success/20' },
};

export const METRO_LEGAL_LD_BADGE_BY_STEP: Record<string, { label: string; className: string }> = {
    'sc-LD.0': { label: 'New RFP',          className: 'bg-ai/10 text-ai border border-ai/20' },
    'sc-LD.1': { label: 'Takeoff ready',    className: 'bg-info/10 text-info border border-info/20' },
    'sc-LD.2': { label: 'Conditions OK',    className: 'bg-info/10 text-info border border-info/20' },
    'sc-LD.3': { label: 'Pool picked',      className: 'bg-warning/10 text-warning border border-warning/20' },
    'sc-LD.4': { label: 'Bids out · 48h',   className: 'bg-warning/10 text-warning border border-warning/20' },
    'sc-LD.5': { label: '3/3 bids · in',    className: 'bg-primary/10 text-primary border border-primary/20' },
    'sc-LD.6': { label: 'Winner picked',    className: 'bg-primary/10 text-primary border border-primary/20' },
};

export const METRO_LEGAL_LD_SUBTITLE: Record<number, string> = {
    0: 'RFP from CBRE · 3 attachments · SLA 48h running',
    1: '12 conditions captured · 1551 K St NW · union IBEW 26',
    2: '3 installers DC · Pinnacle · Northeast · TriState',
    3: '3 bids in · benchmark $21.9k · TriState recommended',
    4: 'Net $20.9k + 18% margin = $24,662 · uploaded · BC-RFP-882041',
};

export const METRO_LEGAL_LD_SUBTITLE_BY_STEP: Record<string, string> = {
    'sc-LD.0': 'New RFP from the GC · awaiting acknowledge · SLA 48h',
    'sc-LD.1': 'RFP routed · ready to run AI takeoff on the drawing',
    'sc-LD.2': '8 of 12 conditions from Building KB · 2 medium-confidence pending confirm',
    'sc-LD.3': '3 approved installers shortlisted · scorecards visible · ready to send',
    'sc-LD.4': 'Bid request emails out to 3 installers · SLA timers running per recipient',
    'sc-LD.5': '3 bids received within 48h · variance check in progress · benchmark $21.9k',
    'sc-LD.6': 'Winner selected · 3 notifications drafted (winner + 2 declines)',
};
