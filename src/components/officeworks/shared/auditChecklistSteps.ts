/**
 * OW Audit Checklist 2026 — 5-step structure (literal from PDF)
 * Used BOTH for self audit (sc1.6) and peer audit (sc1.7)
 *
 * Auditor's golden rule (PDF quote):
 * "When conducting an audit, begin with the assumption that errors WILL exist.
 *  Make it your mission to find them! Even a perfect looking BOM can hide mistakes!"
 *
 * Source: src/assets/officeworks-pdfs/OW_Audit_Checklist_-_2026.pdf
 */

export interface AuditChecklistItem {
    label: string;
    description?: string;
    critical?: boolean;
}

export interface AuditStep {
    stepNumber: 1 | 2 | 3 | 4 | 5;
    title: string;
    items: AuditChecklistItem[];
    /** Sub-categories for Step 3 only */
    subCategories?: AuditSubCategory[];
}

export interface AuditSubCategory {
    name: 'Panels' | 'Glass' | 'Electrical' | 'Storage' | 'HAT' | 'Private Offices' | 'Conference Rooms' | 'Ancillary' | 'Accessories';
    items: AuditChecklistItem[];
}

export const AUDIT_CHECKLIST_STEPS: AuditStep[] = [
    {
        stepNumber: 1,
        title: 'Start with the Big Picture',
        items: [
            { label: 'Review scope of work — familiarize with overall quantities' },
            { label: 'Review project location — NY/DC/Chicago need special electrical requirements', critical: true },
            { label: 'Confirm if there is any reconfigure work or existing scope' },
        ],
    },
    {
        stepNumber: 2,
        title: 'Review Validation Document',
        items: [
            { label: 'Confirm Overall Floor plan matches CAD floor plans' },
            { label: 'Check 2D & 3D drawings — descriptions match the drawings' },
            { label: 'Confirm Finishes are included and check against renderings' },
            { label: 'Review grain direction (check application guide)' },
            { label: 'HAT height range noted (clamped: lowest 24" · bolt+HSD: lowest 29")', critical: true },
            { label: 'Review wire management package' },
            { label: 'Power module — Should it be included? Is it Non-Teknion?' },
            { label: 'Monitor arm — Should it be included? Is it Non-Teknion?' },
            { label: 'Seating — Should it be included? Is it Non-Teknion?' },
            { label: 'Review electrical wiring sheet' },
            { label: 'Conference Tables — is electrical info included (power / wire mgmt)?' },
        ],
    },
    {
        stepNumber: 3,
        title: 'Review BOM & Drawing',
        items: [
            { label: 'Verify all quantities, all part numbers, all CRs and all descriptions', critical: true },
            { label: 'Confirm all finishes match validation document' },
        ],
        subCategories: [
            {
                name: 'Panels',
                items: [
                    { label: 'Frame selections — Leverage rule of thumb (Conventional) · District rule of thumb (Convertible)' },
                    { label: 'Power placement correct' },
                    { label: 'Materials of fascias' },
                    { label: 'CRs captured if required with correct list price', critical: true },
                    { label: 'Fascia clip kit (UNELK) — needed when solid fascias & convertible panels specified' },
                    { label: 'Fascia segments — light block / panel rails required?' },
                ],
            },
            {
                name: 'Glass',
                items: [
                    { label: 'Inset or Not Inset — confirm panel frame' },
                    { label: 'Clear / Frost / Vanceva' },
                    { label: 'Finish in BOM matches the validation document' },
                    { label: '6mm or 10mm — must be noted on validation doc', critical: true },
                    { label: 'Glass thickness and trim thickness matches' },
                    { label: 'Refer to application guide for inset glass at 2-way / 3-way / 4-way connections' },
                    { label: '2-Way Corner Cap for corner extended glass — needed?' },
                ],
            },
            {
                name: 'Electrical',
                items: [
                    { label: 'Confirm Basefeed locations on the Electrical Plan', critical: true },
                    { label: 'NY, DC, VA or Chicago electrical — review code requirements', critical: true },
                    { label: 'Wiring system matches validation document' },
                    { label: 'All electrical is the same wiring system (order a few extras of each)' },
                    { label: 'Multiple electrical circuits — Circuit # noted on floor plan for qty counts' },
                    { label: 'Controlled outlets needed?' },
                    { label: 'District — Basefeed fascias, add extra LH & RH!' },
                    { label: 'Leverage — Communication basefeed' },
                    { label: 'Leverage — Note: CANNOT field cut metal Fascia for BF or Comm BF', critical: true },
                    { label: 'Data Extender Plate' },
                ],
            },
            {
                name: 'Storage',
                items: [
                    { label: 'UPR mobile pedestals — smooth slide?' },
                    { label: 'District Extended Glides' },
                    { label: 'All pulls match each other' },
                    { label: 'SOKL Key Counts' },
                    { label: 'Master & Change Keys included' },
                ],
            },
            {
                name: 'HAT',
                items: [
                    { label: 'OW Best Practice: hiSpace Slide table (unless other finish · >72"w · or C-Leg required)', critical: true },
                    { label: 'OW Best Practice: power strip priced by WPC via 3rd-party manufacturer · note in Validation Doc' },
                    { label: 'Will table hit any furniture when lowered/raised? Add YSRK Leg Riser Kit' },
                    { label: 'Table specified with 6" frame width reduction if desk edge screen installed' },
                    { label: 'Wood screws (CR 2059283) if specifying base only with District surface' },
                    { label: 'Confirm 1" gap clearance' },
                    { label: 'All HAT should include wire management (wkst & offices)' },
                ],
            },
            {
                name: 'Private Offices',
                items: [
                    { label: 'Expansion Casegoods — wall panel/tackboard height corresponds to product height' },
                    { label: 'Part # Review: K with K (mid-height) · H with H (high) · L with L (low)' },
                    { label: 'Wall Panels secured to storage or CR for Wall mounted' },
                    { label: 'Wall Panel — Side Filler (BAWPF)' },
                    { label: 'Window sill / exterior of building condition — units secured to wall for stability' },
                    { label: 'Monitor arms on HAT interfere with shelving above or kneespace modules?' },
                    { label: 'YESW Wire Clips · Task light cord wire management' },
                ],
            },
            {
                name: 'Conference Rooms',
                items: [
                    { label: 'Confirm Plug-In vs Hardwired (must be on validation doc)', critical: true },
                    { label: 'Power boxes — correct sizes & qty' },
                    { label: 'YESW Wire Clips' },
                    { label: 'Vertical wire manager' },
                ],
            },
            {
                name: 'Accessories',
                items: [
                    { label: 'Power Cubes — OW Best Practice: high capacity (needed for current iPhones)' },
                    { label: 'Touch up kits (Make sure Leverage is on the SQ)' },
                    { label: 'Monitor Arms should NOT be installed under overheads' },
                    { label: 'Monitor arms with clamp/bolt mount — wire management? Grommet needed?' },
                ],
            },
        ],
    },
    {
        stepNumber: 4,
        title: 'Review CRs',
        items: [
            { label: 'Compare CR info in CREATE to BOM — they MUST match', critical: true },
            { label: 'Check part number — OW Best Practice: part # to match CREATE' },
            { label: 'Check list pricing' },
            { label: 'Review Special Features and application' },
            { label: 'Review any Pricer Comments' },
            { label: 'Review any attachments' },
            { label: 'Confirm BOM has "Special" and "Quote" columns turned on · "Special" column has check mark', critical: true },
        ],
    },
    {
        stepNumber: 5,
        title: 'One Last Check',
        items: [
            { label: 'Scan plan vs validation document — empty rooms/spaces questioned', critical: true },
            { label: 'Scan BOM — no lines with $0 list price', critical: true },
            { label: 'Scan BOM — no skipped options' },
            { label: 'Turn on PZ Description Column — confirm CURRENT catalogs (or OLD for price-protected)', critical: true },
            { label: 'Review all aisle dimensions — make sure they are to code' },
            { label: 'Validation Document — mark up spelling mistakes or visual issues' },
        ],
    },
];

export const AUDITOR_GOLDEN_RULE = 'When conducting an audit, begin with the assumption that errors WILL exist. Make it your mission to find them! Even a perfect looking BOM can hide mistakes!';

export const PRINT_STATE_QUOTE = 'All documents should be printed. Spec checks should NOT be conducted on your laptop screen. Notes should be made directly on the BOM, Plans & Validation Document, not in the body of an email.';

/** Change Order Reasons (from Design Checklist 2026 PDF) — used in sc1.9 discrepancy resolution */
export const CHANGE_ORDER_REASONS = [
    'Add on Cost Only',
    'GC / customer hold-to missed',
    'GC / customer-directed change',
    'PM Field verification error',
    'Design Spec error',
    'Installer Error',
    'Job-site Damage',
    'Lost / Late / Out of Stock Product',
    'Teknion error / claim denied',
    'Shipping damage (visible)',
    'Shipping damage (concealed)',
    'Coordinator Order Entry Error',
    'Reconsignment Fees for OW Providing wrong ship to address',
    'WPC concession / good faith accommodation',
    'SALES / WPC Error',
    'Vendor Chargeback',
    'Vendor Commission Payment',
    'Service PM Request',
    'Mock Up Conversion to Real Order',
    'Billable Add On Change Order',
];

/** Felicia's tacit knowledge surfaced in sc1.7 peer review */
export interface TacitKnowledgeRule {
    rule: string;
    context: string;
    feliciaQuote?: string;
}

export const FELICIA_TACIT_KNOWLEDGE: TacitKnowledgeRule[] = [
    {
        rule: 'District inset glass should be 6mm, not CET default 10mm',
        context: 'CET defaults to 10mm. Manual correction required every time.',
        feliciaQuote: "I've been doing this for 25 years and still find it complex.",
    },
    {
        rule: 'Leverage panels: CANNOT field cut metal Fascia for BF or Comm BF',
        context: 'Critical electrical constraint. Field cuts impossible — must specify correct part at order.',
    },
    {
        rule: 'OWDC projects: all BF need to be visible',
        context: 'DC market specific code requirement — Felicia\'s region.',
    },
    {
        rule: 'hiSpace Slide best for Metro Legal-style finish (Platinum/Ebony/Very White)',
        context: 'Switch to C-Leg only if finish other than these three OR width >72".',
    },
];
