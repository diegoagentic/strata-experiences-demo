// ═══════════════════════════════════════════════════════════════════════════════
// BFI — BFI Furniture Industries · Strata AI Demo Profile
//
// CLIENT: BFI Furniture (Elizabeth, NJ · ~50 employees · Women Owned
//         Government/Municipal furniture dealer · CoNY primary customer)
//
// DEMO STRUCTURE: 1 flow · 13 steps in 3 sidebar groups (post-Jessica revisions May 2026)
//
//   Dashboard — permanent navbar tab (not a tour step)
//
//   GROUP 1 · Pre-award (a1.0 → a1.2c · 6 steps)
//     a1.0:   Quote request arrives    — Miller Knoll sends specs · auto-ingested
//     a1.1:   Ingestion                — Lauren opens · DOE-2847 surfaced
//     a1.2:   Confirm receipt          — Lauren replies · Miller Knoll acknowledges
//     a1.2b:  Quote · Credit · Labor   — unified step (3 actions in one modal):
//                                        1) review Quote Tool pricing
//                                        2) confirm the CMF Free line CORE already prepared (single line · negative cost / $0 sell · Day-1 GP)
//                                        3) email WIG for labor · Michael compiles
//     a1.2b3: Send proposal            — Lauren emails NYC DOE the full proposal
//     a1.2c:  PO received              — Lauren confirms the PO in CORE
//
//   GROUP 2 · Receiving & Resolution (a1.2d → a1.2f · 3 steps)
//     a1.2d:  Bingo check              — Strata scans WIG report · finds missing carton
//     a1.2e:  File shortage claim      — Lauren files claim with Herman Miller (preserves the email dialog)
//     a1.2f:  Notify scheduler         — Replacement confirmed · Walter notified (preserves the email dialog)
//
//   GROUP 3 · CPR & Closing (a1.3 → a1.4 · 4 steps)
//     a1.3:   CPR review               — Field hours vs quote · Lauren approves (preserves CPR notify dialog)
//     a1.3b:  Manager approval         — Michael sends invoice request to Nancy (preserves Nancy email)
//     a1.3c:  Invoice forward          — Lauren forwards approved invoice to Patricia/Finance (preserves Patricia email)
//     a1.4:   Fee verification         — Patricia compares Nancy's fee vs contract (Strata catches gap)
//
// PRESENTATION DATE: May 14, 2026
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const BFI_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // GROUP 1: Pre-award  (a1.0 → a1.2c)
    // Quote intake · validation · proposal · PO received
    // ═══════════════════════════════════════════
    {
        id: 'a1.0',
        groupId: 1,
        groupTitle: 'Flow 1: Pre-award',
        title: 'Quote request arrives',
        description: 'Robert Chen (Miller Knoll) sends a quote request for a Herman Miller installation at 30 Court Street, Brooklyn. Specs, floor plan, and the pricing file land directly in Strata — no email tracking needed.',
        app: 'bfi-agency-fee',
        role: 'Designer',
    },
    {
        id: 'a1.1',
        groupId: 1,
        groupTitle: 'Flow 1: Pre-award',
        title: 'Ingestion',
        description: 'Lauren opens her ingestion queue. Strata ranks active CoNY orders by urgency and surfaces DOE-2847 at the top — ready for review.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.2',
        groupId: 1,
        groupTitle: 'Flow 1: Pre-award',
        title: 'Confirm receipt',
        description: 'Robert acknowledges the order — quote Q-2026-0089 is locked in. Lauren moves on to validate pricing.',
        app: 'bfi-agency-fee',
        role: 'Designer',
    },
    {
        id: 'a1.2b',
        groupId: 1,
        groupTitle: 'Flow 1: Pre-award',
        title: 'Quote · Credit · Labor',
        description: 'Three actions in one step: ① validate pricing in Quote Tool, ② confirm the CMF Free line CORE prepared (single line item · negative cost / $0 sell · per CoNY Contract ANT122 · Day-1 GP visible), ③ email WIG for the labor quote.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.2b3',
        groupId: 1,
        groupTitle: 'Flow 1: Pre-award',
        title: 'Send proposal',
        description: 'Product pricing and labor are both ready. Lauren reviews the full proposal and sends it to NYC DOE procurement.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.2c',
        groupId: 1,
        groupTitle: 'Flow 1: Pre-award',
        title: 'PO received',
        description: 'The Purchase Order comes back from NYC DOE. Lauren checks it against the proposal and locks in the 30-day delivery window in CORE.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },

    // ═══════════════════════════════════════════
    // GROUP 2: Receiving & Resolution  (a1.2d → a1.2f)
    // One logical session: bingo check · shortage claim · work order ready.
    // Kept as 3 steps to preserve the dialogs (claim email to HM, Walter notify).
    // ═══════════════════════════════════════════
    {
        id: 'a1.2d',
        groupId: 2,
        groupTitle: 'Flow 1: Receiving & Resolution',
        title: 'Bingo check',
        description: 'The receiving report arrives from WIG. Strata scans the packing list against the order and flags what\'s missing — no manual carton counting.',
        app: 'bfi-receiving',
        role: 'Receiving Coordinator',
    },
    {
        id: 'a1.2e',
        groupId: 2,
        groupTitle: 'Flow 1: Receiving & Resolution',
        title: 'File shortage claim',
        description: 'Lena flags a missing carton. Lauren reviews the order, attaches the receiving report as proof, and files the claim with Herman Miller.',
        app: 'bfi-receiving',
        role: 'Account Manager',
    },
    {
        id: 'a1.2f',
        groupId: 2,
        groupTitle: 'Flow 1: Receiving & Resolution',
        title: 'Notify scheduler',
        description: 'Herman Miller confirms the replacement shipment. Lauren reviews the updated work order and notifies Walter (project manager) to schedule the install crew.',
        app: 'bfi-receiving',
        role: 'Account Manager',
    },

    // ═══════════════════════════════════════════
    // GROUP 3: CPR & Closing  (a1.3 → a1.4)
    // Financial close: CPR review · manager approval · invoice forward · fee verify.
    // Kept as 4 steps to preserve the dialogs (CPR notify, Nancy email, Patricia forward).
    // ═══════════════════════════════════════════
    {
        id: 'a1.3',
        groupId: 3,
        groupTitle: 'Flow 1: CPR & Closing',
        title: 'CPR review',
        description: 'Labor hours from the field don\'t match the original quote. Lauren reviews the gaps — Strata prepared the revision automatically — approves line by line, and notifies the team.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.3b',
        groupId: 3,
        groupTitle: 'Flow 1: CPR & Closing',
        title: 'Manager approval',
        description: 'Michael reviews Lauren\'s CPR approval and the final labor numbers, then sends the invoice request to Nancy at Herman Miller.',
        app: 'bfi-agency-fee',
        role: 'BFI Manager',
    },
    {
        id: 'a1.3c',
        groupId: 3,
        groupTitle: 'Flow 1: CPR & Closing',
        title: 'Invoice forward',
        description: 'The invoice arrives. Lauren attaches it to the record — Strata identifies the document automatically — and forwards it to Finance/AR to close out the order.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.4',
        groupId: 3,
        groupTitle: 'Flow 1: CPR & Closing',
        title: 'Fee verification',
        description: 'Patricia compares Nancy\'s reported fee against the per-line GP already booked in CORE (per Contract ANT122). Each product is matched line by line — Strata catches a −$255.24 gap on HMI-LS-500 automatically. Patricia decides whether to confirm the match or flag the discrepancy.',
        app: 'bfi-agency-fee',
        role: 'Finance / AR',
    },

];

// ─── STEP BEHAVIOR (presenter guide · action-forward) ────────────────────────

export const BFI_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'a1.0': { mode: 'interactive', userAction: 'Watch Robert Chen send the request to Lauren · specs, floor plan and pricing file arrive in Strata' },
    'a1.1': { mode: 'interactive', userAction: 'Open the ingestion queue · DOE-2847 surfaces as priority · click to investigate' },
    'a1.2': { mode: 'interactive', userAction: 'Read Robert\'s acknowledgment · quote Q-2026-0089 confirmed · move on to validate pricing' },
    'a1.2b': { mode: 'interactive', userAction: '① Review Quote Tool: HMI-FU-300 corrected $1,350 → $1,260 · service fees variable per product (avg 4.0%) · ② Review the CMF Free line CORE prepared (single line item · Cost −$9,255.24 · Sell $0 · Day-1 GP +$9,255.24 · Calc Code 7 · Direct Bill-HMI · GL 4200-Agency-Fees) · confirm to open the labor request · ③ Open the labor request email to WIG · send · wait for Michael\'s compiled response (within contract caps) · continue to proposal' },
    'a1.2b3': { mode: 'interactive', userAction: 'Review the full proposal (product + labor) · send to NYC DOE procurement · wait for the PO' },
    'a1.2c': { mode: 'interactive', userAction: 'Open the PO from NYC DOE · check it against the proposal · confirm the 30-day delivery window in CORE' },
    'a1.2d': { mode: 'interactive', userAction: 'Open the WIG receiving notification · review the packing list · run AI analysis to find the missing carton' },
    'a1.2e': { mode: 'interactive', userAction: 'Open Lena\'s missing-carton alert · expand the order · send the claim to Herman Miller' },
    'a1.2f': { mode: 'interactive', userAction: 'Open the claim-resolved notification · review the work order + floor plan · notify Walter to schedule the crew' },
    'a1.3': { mode: 'interactive', userAction: 'Review CPR discrepancies line by line · approve · open the team notification · send the CORE update' },
    'a1.3b': { mode: 'interactive', userAction: 'Review Lauren\'s CPR approval · send the invoice request to Nancy at Herman Miller' },
    'a1.3c': { mode: 'interactive', userAction: 'Upload the approved invoice · Strata detects it automatically · forward to Patricia in Finance/AR' },
    'a1.4': { mode: 'interactive', userAction: 'Compare per-line: each product expected vs received from Nancy · 2 lines match · 1 line gap (HMI-LS-500 · −$255.24) · confirm or flag' },
};

// ─── STEP MESSAGES (AI agent progress · short, status-style) ─────────────────

export const BFI_STEP_MESSAGES: Record<string, string[]> = {
    'a1.0': [
        'Quote request received · DOE-2847 · Miller Knoll',
        'Reading attachments: SIF, spec sheet, floor plan',
        'Extracted 3 product lines',
        'Documents in intake · alerting Lauren',
    ],
    'a1.1': [
        'Pulling active CoNY orders',
        'Scanning new SIFs and attachments',
        'Checking prices against the CoNY contract',
        'DOE-2847 ranked top · ready for review',
    ],
    'a1.2': [
        'Confirmation sent to Robert Chen',
        'Quote Q-2026-0089 logged',
        'Specs and floor plan attached',
        'Receipt acknowledged · moving to pricing validation',
    ],
    'a1.2b': [
        'Sending pricing file to Quote Tool',
        'Comparing prices vs CoNY Contract ANT122',
        'Corrected HMI-FU-300 · $1,350 → $1,260',
        'Restricted-product check · all clear',
        'Service fees applied · variable per product (2.9% / 4.0% / 3.9%) · total $9,255.24',
        'Reading CMF Free line from CORE · single line item · Day-1 GP',
        'Calc Code 7 verified · Direct Bill-HMI vendor type · GL 4200-Agency-Fees',
        'GP recognized per product · Filing 2.9% · Workstations 4.0% · Lounge 3.9% · Total $9,255.24',
        'Day-1 GP visible per Contract ANT122 (no end-of-month wait)',
        'Opening labor quote request · scope auto-filled',
        'Sending request to WIG',
        'WIG response in · forwarded to Michael',
        'Michael compiled labor · Teamsters 24h · Carpenters 50h · OT 8h · Inside 4h',
        'Labor total $7,640 · ready for proposal',
    ],
    'a1.2b3': [
        'Compiling proposal · product + labor',
        'Drafting email to NYC DOE',
        'Attaching updated SIF, Quote Tool file, labor quote',
        'Proposal sent · awaiting PO',
    ],
    'a1.2c': [
        'Purchase Order in · from NYC DOE',
        'PO matched against the proposal · pricing aligns',
        'Delivery window locked · May 14–21, 2026',
        'Order confirmed in CORE',
    ],
    'a1.3': [
        'Loading CPR document',
        'Reading certified hours by labor category',
        'Found gaps · Carpenters −5h · OT −2h',
        'Drafting CORE update + team notification',
    ],
    'a1.3b': [
        'CPR approval received from Lauren',
        'Final labor · Teamsters 24h · Carpenters 45h · OT 6h',
        'New total $6,920 (−$720 from quote)',
        'Drafting invoice request to Nancy',
    ],
    'a1.3c': [
        'Invoice received · invoice-QT-DOE2847.pdf',
        'Reading document with OCR',
        'Invoice approved · $6,920',
        'Matches CPR · ready for Finance/AR',
    ],
    'a1.4': [
        'Loading contract codes for DOE-2847 · ANT122',
        'Per-line expected: $219.24 / $5,760 / $3,276 · total $9,255.24',
        'Pulling Nancy\'s report from Herman Miller',
        'Per-line match · 2 lines ✓ · HMI-LS-500 gap −$255.24',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const BFI_SELF_INDICATED: string[] = [
    'a1.0', 'a1.1', 'a1.2', 'a1.2b', 'a1.2b3', 'a1.2c', 'a1.2d', 'a1.2e', 'a1.2f', 'a1.3', 'a1.3b', 'a1.3c', 'a1.4',
];
