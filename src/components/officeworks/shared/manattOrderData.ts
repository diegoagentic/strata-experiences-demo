/**
 * Metro Legal Firm LLC · 4th Floor Workstations
 * Real data extracted from Order Acknowledgment PO-DC-0009642 (Universal #2-10468963)
 *
 * 71 line items + 13 CRs + 4 Tags (WS-01·10 / WS-02·6 / WS-02·6 / WS-02.A·8)
 * Manufacturer: Teknion (TFS) · Dealer: OFFICEWORKS-DC (U01042)
 * Net Total: $61,464.80 / List Total: $296,228.13 / Discount: $234,763.33
 *
 * Source: src/assets/officeworks-pdfs/PO-DC-0009642.pdf (real)
 */

export const METRO_LEGAL_ORDER_META = {
    poNumber: 'PO-DC-0009642',
    universal: '2-10468963',
    specialQuote: '436533',
    sqName: 'Metro Legal Firm LLC',
    revisionNumber: 1,
    dealer: 'U01042 OFFICEWORKS-DC',
    dealerIRS: '84-3813627',
    poAmount: 58711.68,
    listTotal: 296228.13,
    discountTotal: 234763.33,
    netTotal: 61464.80,
    orderReceipt: '2025/12/30',
    schedShipDate: '2026/03/20',
    noChangeAfter: '2026/01/12',
    manufacturer: 'Teknion (TFS)',
    salesreps: ['Designer Nova', 'Danielle Dunlap'],
    shipTo: {
        company: 'TURN KEY OFFICE INSTALLATIONS',
        project: 'OWDC - Metro Legal - 4TH FLOOR - WORKSTATIONS',
        address: '10001 FRANKLIN SQUARE DRIVE STE H',
        city: 'NOTTINGHAM, MD 21236-4911',
    },
    billTo: {
        company: 'OFFICEWORKS-DC',
        address: '7950 JONES BRANCH DR, 5 NORTH',
        city: 'MCLEAN, VA 22102',
    },
    freightTerms: 'PNS',
    shipVia: 'BEST WAY',
    cbd: 'Receiving 24 HRS · (410) 870-1240',
    afterHours: 'Receiving · (410) 870-1240',
    shippingNotes: 'OP-2025-0001605 Metro Legal - Teknion - PO & Wks',
} as const;

export const METRO_LEGAL_TAGS = [
    { tag: 1, field1: 'WS-01(10)', field2: 'LEVEL 4', count: 10 },
    { tag: 2, field1: 'WS-02(6)', field2: 'LEVEL 4', count: 6 },
    { tag: 3, field1: 'WS-02 (6)', field2: 'LEVEL 4', count: 6 },
    { tag: 4, field1: 'WS-02.A(8)', field2: 'LEVEL 4', count: 8 },
] as const;

export type BOMLineStatus = 'verified' | 'warning' | 'critical' | 'pending';
export type BOMLineCategory = 'panels' | 'glass' | 'electrical' | 'storage' | 'hat' | 'office' | 'conference' | 'accessory' | 'workstation' | 'screen';

export interface BOMLine {
    seq: number;
    partNumber: string;
    description: string;
    quantity: number;
    unitList: number;
    extList: number;
    tag: number;
    mfr: 'TEK' | 'TCO' | 'TDI' | 'TDS' | 'RNH' | 'COS';
    isSpecial: boolean;
    crNumber?: string;
    crLeadDays?: number;
    crNotes?: string;
    finishes?: string[];
    category: BOMLineCategory;
    /** Demo-only: flagged issues for spec check dramatization */
    status?: BOMLineStatus;
    statusReason?: string;
}

/**
 * 71 line items from real PO-DC-0009642 acknowledgment.
 * Critical CRs include leadtime warnings (30/35/40 days) and special features.
 *
 * Selected lines (representative subset for the demo BOM table).
 * Numbers match the Dealer PO Seq No / Teknion Seq No from the real document.
 */
export const METRO_LEGAL_BOM_LINES: BOMLine[] = [
    // Surcharge line (Teknion Seq 72)
    {
        seq: 0, partNumber: 'T5062', description: 'Surcharge',
        quantity: 1, unitList: 3479.13, extList: 3479.13,
        tag: 1, mfr: 'COS', isSpecial: false,
        category: 'workstation',
        status: 'verified',
    },

    // === Tag 1 · WS-01(10) — Power Spine workstations ===
    {
        seq: 1, partNumber: 'YEWH300183N', description: 'Wire Management Hammock, 30"w',
        quantity: 10, unitList: 299.00, extList: 2990.00,
        tag: 1, mfr: 'TCO', isSpecial: false,
        finishes: ['Dark Grey 01', 'Mica · Very White 83', 'Wire Loom: No'],
        category: 'workstation',
        status: 'verified',
    },
    {
        seq: 2, partNumber: 'YSRKS283', description: 'hiSpace Height-Adjustable Leg Riser Kit, 2 Risers (Rectangular)',
        quantity: 10, unitList: 111.00, extList: 1110.00,
        tag: 1, mfr: 'TCO', isSpecial: false,
        finishes: ['Base 83 Very White'],
        category: 'hat',
        status: 'verified',
    },
    {
        seq: 3, partNumber: 'GZBHS422059RYQR83', description: 'Smooth Felt Sqr Crn Desk Edge Screen, Partial Mod Ht (23"), 42" Datum Ht, 20"d×59"w, Right, Wire Mgr',
        quantity: 5, unitList: 1710.00, extList: 8550.00,
        tag: 1, mfr: 'TCO', isSpecial: true,
        crNumber: '2087978', crLeadDays: 30,
        crNotes: 'SCREEN TO BE INSTALLED WITH CR2087977. SCREEN DEPTH & WIDTH TO MATCH SURFACE DEPTH & WIDTH. Same as CR 2046129.',
        finishes: ['Smooth Felt QR Admiral Blue', 'Mica · Very White 83'],
        category: 'screen',
        status: 'warning',
        statusReason: 'CR 2087978 leadtime 30 days · verify against Must Arrive Date',
    },
    {
        seq: 4, partNumber: 'GZBHS422059LYQR83', description: 'Smooth Felt Sqr Crn Desk Edge Screen, Partial Mod Ht (23"), 42" Datum Ht, 20"d×59"w, Left, Wire Mgr',
        quantity: 5, unitList: 1621.00, extList: 8105.00,
        tag: 1, mfr: 'TCO', isSpecial: true,
        crNumber: '2046129', crLeadDays: 30,
        crNotes: 'SCREEN TO BE INSTALLED WITH CR 2042261. SCREEN DEPTH & WIDTH TO MATCH SURFACE DEPTH & WIDTH.',
        finishes: ['Smooth Felt QR Admiral Blue', 'Mica · Very White 83'],
        category: 'screen',
        status: 'verified',
    },
    {
        seq: 5, partNumber: 'GZSHS4229QR83', description: 'Smooth Felt Side Desk Edge Screen, Partial Modesty Height (23"), 42" Datum Height, 29"w',
        quantity: 10, unitList: 552.00, extList: 5520.00,
        tag: 1, mfr: 'TCO', isSpecial: true,
        crNumber: '2046130', crLeadDays: 30,
        finishes: ['Smooth Felt QR Admiral Blue', 'Mica · Very White 83'],
        category: 'screen',
        status: 'verified',
    },
    {
        seq: 6, partNumber: 'YSKB9E23586NN__8__83DNV', description: 'hiSpace Slide HA FS Complete Table w/Rect WS, Ext.Elec(22.6-48.7"), 6"Frm Actl W.Red, No Cutout, 23"d×58"w',
        quantity: 5, unitList: 4326.00, extList: 21630.00,
        tag: 1, mfr: 'TCO', isSpecial: true,
        crNumber: '2087977', crLeadDays: 35,
        crNotes: 'To have Angled worksurface Left hand Parallel top in Flintwood 5N WHITE OAK. PRICER COMMENTS: No radius on corner. Follow standard UZWA2460LHD.',
        finishes: ['Foundation Laminate ~A', 'Flat Trim 8', 'Base 83 Very White', 'Switch D · Up/Down Memory'],
        category: 'hat',
        status: 'critical',
        statusReason: 'Line 6 BOM part code differs from Ack shipped code (width 58 → 60 per pricer comment) · verify intentional',
    },
    {
        seq: 7, partNumber: 'YSKB9E23586NN__8__83DNV', description: 'hiSpace Slide HA FS Complete Table w/Rect WS (RH version)',
        quantity: 5, unitList: 4326.00, extList: 21630.00,
        tag: 1, mfr: 'TCO', isSpecial: true,
        crNumber: '2075934', crLeadDays: 35,
        crNotes: 'Angled worksurface right hand Parallel top in Flintwood 5N WHITE OAK, like UZWA2460RHD.',
        finishes: ['Foundation Laminate ~A', 'Flat Trim 8', 'Base 83 Very White'],
        category: 'hat',
        status: 'verified',
    },
    {
        seq: 8, partNumber: 'UNELCM4LB136083', description: 'Metal Power/Comm. Fascia, 2 Duplex Outlets Plus VDM, Left, Bottom of Fascia, 13"h × 60"w',
        quantity: 5, unitList: 165.00, extList: 825.00,
        tag: 1, mfr: 'TDI', isSpecial: false,
        finishes: ['Mica Very White 83'],
        category: 'electrical',
        status: 'verified',
    },
    {
        seq: 9, partNumber: 'UNELCM4RB136083', description: 'Metal Power/Comm. Fascia, Right, 13"h × 60"w',
        quantity: 5, unitList: 165.00, extList: 825.00,
        tag: 1, mfr: 'TDI', isSpecial: false,
        finishes: ['Mica Very White 83'],
        category: 'electrical',
        status: 'verified',
    },
    {
        seq: 10, partNumber: 'UNELM136083', description: 'Metal Fascia, 13"h × 60"w',
        quantity: 14, unitList: 165.00, extList: 2310.00,
        tag: 1, mfr: 'TDI', isSpecial: false,
        finishes: ['Mica Very White 83'],
        category: 'electrical',
        status: 'verified',
    },
    {
        seq: 11, partNumber: 'UNQBFR7T72AYV', description: 'Base Feed, 7 Wire Non-Isolated Ground, 72" Length',
        quantity: 4, unitList: 492.00, extList: 1968.00,
        tag: 1, mfr: 'TDI', isSpecial: false,
        finishes: ['Bezel Very White YV', 'PVC Free Standard'],
        category: 'electrical',
        status: 'verified',
    },
    {
        seq: 12, partNumber: 'UNQBHR8T048A', description: 'Power Harness, 8 Wire Isolated Ground, 48" Length',
        quantity: 8, unitList: 228.00, extList: 1824.00,
        tag: 1, mfr: 'TDI', isSpecial: false,
        category: 'electrical',
        status: 'verified',
    },
    {
        seq: 13, partNumber: 'JNEWACB38G', description: 'Wrap Around Cable Manager, Base Feed, 38"l',
        quantity: 4, unitList: 165.00, extList: 660.00,
        tag: 1, mfr: 'RNH', isSpecial: false,
        finishes: ['Grey G'],
        category: 'electrical',
        status: 'verified',
    },
    {
        seq: 22, partNumber: 'UZYK2960P83', description: 'Power Spine 120 Hub Support Kit, 120 Power Spine, 29"h × 60"w',
        quantity: 4, unitList: 863.00, extList: 3452.00,
        tag: 1, mfr: 'TDI', isSpecial: false,
        finishes: ['Mica Very White 83'],
        category: 'electrical',
        status: 'verified',
    },
    {
        seq: 23, partNumber: 'UNYH2960P', description: 'Power Spine 120 Hub Panel, 29"h × 60"w',
        quantity: 4, unitList: 821.00, extList: 3284.00,
        tag: 1, mfr: 'TDI', isSpecial: false,
        category: 'electrical',
        status: 'verified',
    },
    {
        seq: 24, partNumber: 'UPRS19R7XGXGXGRYP107', description: 'Rolling Pedestal, Box/File Smooth Slide, 19"d',
        quantity: 10, unitList: 1927.00, extList: 19270.00,
        tag: 1, mfr: 'TDS', isSpecial: true,
        crNumber: '2075919', crLeadDays: 30,
        crNotes: '⚠️ BIFMA STABILITY ADVISORY: 12"W pedestal reaches minimum BIFMA standards. Strongly recommend mock-up first to evaluate stability before ordering large quantity. Special pencil tray X80-64145-XX inside drawer.',
        finishes: ['Pull Rectangular R', 'Mica · 7 Platinum', 'Source Lam · XG Very White', 'Key Random', 'Seat Cushion Y · F02 Percept Pristine P107'],
        category: 'storage',
        status: 'critical',
        statusReason: 'CR 2075919 BIFMA stability advisory · mock-up strongly recommended · escape risk',
    },

    // === Tag 2 · WS-02(6) — Smaller workstation variant ===
    {
        seq: 40, partNumber: 'JZSASBC5166ISW_________83', description: 'Solid Add-On Screen - EZ Fence Beam-Mtd - Std Height, 51"h, 66"w, In-Line, Std Corner, Align. Holes',
        quantity: 1, unitList: 1406.00, extList: 1406.00,
        tag: 3, mfr: 'RNH', isSpecial: true,
        crNumber: '2046138', crLeadDays: 40,
        crNotes: 'FINISH TO BE FLINTWOOD 5N White Oak.',
        finishes: ['Source Laminate', 'Mica Very White 83'],
        category: 'screen',
        status: 'warning',
        statusReason: 'CR 2046138 leadtime 40 days = LONGEST · drives Must Arrive Date',
    },
    {
        seq: 42, partNumber: 'JNSFST51072RN_________83', description: 'Floor Screen Leg-Mounted, 2 Users, Datum 51"h, 72"w, Radius Corner, No Pass-Through',
        quantity: 2, unitList: 1893.00, extList: 3786.00,
        tag: 2, mfr: 'RNH', isSpecial: true,
        crNumber: '2090871', crLeadDays: 40,
        crNotes: 'To be mounted on 18"H leg, JZSFL. FINISH TO BE FLINTWOOD 5N White Oak.',
        finishes: ['Source Laminate', 'Mica Very White 83'],
        category: 'screen',
        status: 'verified',
    },
    {
        seq: 47, partNumber: 'YSKB9E29646NN__8__83DNV', description: 'hiSpace Slide HA FS Complete Table w/Rect WS, Ext.Elec, 29"d×64"w',
        quantity: 6, unitList: 3911.00, extList: 23466.00,
        tag: 3, mfr: 'TCO', isSpecial: true,
        crNumber: '2046131', crLeadDays: 25,
        crNotes: 'SURFACE FINISH TO BE FLINTWOOD. STANDARD FLINTWOOD FINISH TO BE SPECIFIED AT TIME OF ORDER.',
        finishes: ['Foundation Laminate', 'Base 83 Very White', 'Switch D'],
        category: 'hat',
        status: 'verified',
    },
    {
        seq: 48, partNumber: 'UPRS19R7XGXGXGRYP107', description: 'Rolling Pedestal, Box/File (Tag 2 variant)',
        quantity: 6, unitList: 1927.00, extList: 11562.00,
        tag: 3, mfr: 'TDS', isSpecial: true,
        crNumber: '2075919', crLeadDays: 30,
        crNotes: 'Duplicate of CR 2075919 · same BIFMA advisory',
        finishes: ['Source Lam · XG Very White'],
        category: 'storage',
        status: 'warning',
        statusReason: 'Same CR as line 24 — verify intentional split or merge',
    },

    // === Tag 4 · WS-02.A(8) — 8 workstations variant ===
    {
        seq: 64, partNumber: 'JZSASBC5166ESW_________83', description: 'Solid Add-On Screen End, Std Height, 51"h, 66"w',
        quantity: 4, unitList: 923.00, extList: 3692.00,
        tag: 4, mfr: 'RNH', isSpecial: true,
        crNumber: '2090112', crLeadDays: 40,
        crNotes: 'FINISH TO BE FLINTWOOD 5N White Oak.',
        finishes: ['Source Laminate', 'Mica Very White 83'],
        category: 'screen',
        status: 'verified',
    },
    {
        seq: 70, partNumber: 'YSKB9E29646NN__8__83DNV', description: 'hiSpace Slide HA FS Complete Table 29"d×64"w (Tag 4)',
        quantity: 8, unitList: 3911.00, extList: 31288.00,
        tag: 4, mfr: 'TCO', isSpecial: true,
        crNumber: '2046131', crLeadDays: 25,
        finishes: ['Foundation Laminate', 'Base 83 Very White'],
        category: 'hat',
        status: 'verified',
    },
    {
        seq: 71, partNumber: 'UPRS19R7XGXGXGRYP107', description: 'Rolling Pedestal, Box/File (Tag 4)',
        quantity: 8, unitList: 1927.00, extList: 15416.00,
        tag: 4, mfr: 'TDS', isSpecial: true,
        crNumber: '2075919', crLeadDays: 30,
        finishes: ['Source Lam · XG Very White'],
        category: 'storage',
        status: 'verified',
    },
];

/**
 * 13 unique CRs (special parts) — used by sc1.6 CR Lookup inline panel
 * Each CR has matching detail in the Create platform that the auditor must verify
 */
export interface CRDetail {
    crNumber: string;
    leadDays: number;
    description: string;
    specialFeatures: string;
    drawing: string;
    unitList: number;
    timesUsed: number;
    pzNote?: string;
}

export const METRO_LEGAL_CRS: CRDetail[] = [
    { crNumber: '2087978', leadDays: 30, description: 'Smooth Felt Sqr Crn Desk Edge Screen Right · 42" Datum Ht', specialFeatures: 'Screen depth & width to match surface depth & width', drawing: 'TBA', unitList: 1710.00, timesUsed: 5 },
    { crNumber: '2046129', leadDays: 30, description: 'Smooth Felt Sqr Crn Desk Edge Screen Left · 42" Datum Ht', specialFeatures: 'Install with CR 2042261', drawing: 'TBA', unitList: 1621.00, timesUsed: 5 },
    { crNumber: '2046130', leadDays: 30, description: 'Smooth Felt Side Desk Edge Screen 29"w', specialFeatures: 'Install with CR 2042261 + CR 2046129', drawing: 'TBA', unitList: 552.00, timesUsed: 10 },
    { crNumber: '2087977', leadDays: 35, description: 'hiSpace Slide HA Table · Angled worksurface LH · Flintwood 5N White Oak', specialFeatures: 'No radius on corner. Follow standard UZWA2460LHD (23" actual depth)', drawing: 'TBA', unitList: 4326.00, timesUsed: 5 },
    { crNumber: '2075934', leadDays: 35, description: 'hiSpace Slide HA Table · Angled worksurface RH · Flintwood 5N', specialFeatures: 'Like UZWA2460RHD', drawing: 'TBA', unitList: 4326.00, timesUsed: 5 },
    { crNumber: '2046138', leadDays: 40, description: 'Solid Add-On Screen In-Line · 51"h × 72"w · Flintwood 5N White Oak', specialFeatures: 'FINISH TO BE FLINTWOOD 5N', drawing: 'NDR', unitList: 1406.00, timesUsed: 1, pzNote: '⚠️ Longest leadtime in BOM' },
    { crNumber: '2046136', leadDays: 40, description: 'Solid Add-On Screen End · 51"h × 72"w', specialFeatures: 'FINISH TO BE FLINTWOOD 5N', drawing: 'NDR', unitList: 1406.00, timesUsed: 2 },
    { crNumber: '2046139', leadDays: 30, description: 'Smooth Felt Sqr Crn Desk Edge Screen LH · Semi Mod Ht 19" · 51" Datum', specialFeatures: 'Use with YSKB9E29646NN · meet middle with RH CR 2046140', drawing: 'TBA', unitList: 2161.00, timesUsed: 14 },
    { crNumber: '2046140', leadDays: 30, description: 'Smooth Felt Sqr Crn Desk Edge Screen RH · Semi Mod Ht 19"', specialFeatures: 'Use with YSKB9E29646NN · meet middle with LH CR 2046139', drawing: 'TBA', unitList: 2161.00, timesUsed: 14 },
    { crNumber: '2046131', leadDays: 25, description: 'hiSpace Slide HA FS Complete Table 29"d×64"w · Flintwood', specialFeatures: 'STANDARD FLINTWOOD FINISH at time of order', drawing: 'TBA', unitList: 3911.00, timesUsed: 14 },
    { crNumber: '2075919', leadDays: 30, description: 'Rolling Pedestal Box/File 19"d · 12"W special config', specialFeatures: '⚠️ BIFMA STABILITY ADVISORY · mock-up strongly recommended · special pencil tray X80-64145-XX · file bar PC0861-600+XX', drawing: 'NDR', unitList: 1927.00, timesUsed: 24 },
    { crNumber: '2090112', leadDays: 40, description: 'Solid Add-On Screen End · 51"h × 66"w · Flintwood', specialFeatures: 'FINISH TO BE FLINTWOOD 5N', drawing: 'NDR', unitList: 923.00, timesUsed: 4 },
    { crNumber: '2090871', leadDays: 40, description: 'Floor Screen Leg-Mounted 2 Users · Flintwood', specialFeatures: 'Mounted on 18"H leg JZSFL', drawing: 'see dwg', unitList: 1893.00, timesUsed: 6 },
];

/** Demo issues surfaced during self-audit · used by sc1.6 issues counter */
export const METRO_LEGAL_AUDIT_ISSUES = {
    critical: 2,
    advisory: 3,
    autoFixable: 1,
};

/** Per-Tag subtotals (computed from BOM lines) */
export function getTagSubtotals() {
    const subtotals = new Map<number, number>();
    for (const line of METRO_LEGAL_BOM_LINES) {
        subtotals.set(line.tag, (subtotals.get(line.tag) ?? 0) + line.extList);
    }
    return Array.from(subtotals.entries()).map(([tag, subtotal]) => ({ tag, subtotal }));
}
