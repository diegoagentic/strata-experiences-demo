// ═══════════════════════════════════════════════════════════════════════════════
// OFFICEWORKS — Officeworks Inc. · Strata AI Spec Check & Design Demo Profile
//
// CLIENT: Officeworks Inc. (Burlington MA · ~181 employees · 10 markets · $100M+
//         Teknion 30-year partner · GSA contract · 2022 Teknion Orion Award)
//
// DEMO PROCESS: Spec Check & Design (Furniture vertical · 30 designers · 3 mgrs)
// PROTAGONIST: Design Manager Ellis (Design Manager · PA/Pittsburgh/Ancillary)
// DEMO CLIENT: Metro Legal Firm LLC · DC market · price-protected SQ
//
// STRUCTURE: 17 steps mapped from BPMN (12 numbered tasks + 9 sub-steps +
//            13 gateways + 3 end events) in 5 swimlanes
//
//   Group 1 — Intake & Assignment       sc1.0, sc1.0b
//   Group 2 — Design & Validation       sc1.2 (BOM export + send validation), sc1.4 (SQ)
//   Group 3 — Teknion Order Preview     sc1.5, sc1.5b (phasing folded into sc1.5b post-resubmit)
//   Group 4 — Spec Check  ⭐ HEROES     sc1.6 (SC2+SC3), sc1.7 (SC7)
//   Group 5 — Submission & Confirm      sc1.8, sc1.8b, sc1.9 ⭐ (Gemini)
//
// CEO TOP 4 PAIN POINTS (CEO Hart confirmed):
//   #1 SC2 → sc1.6  |  #2 SC5 → Dashboard
//   #3 SC7 → sc1.7  |  #4 SC6 → Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const OFFICEWORKS_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // GROUP 1: Intake & Assignment
    // ═══════════════════════════════════════════
    {
        id: 'sc1.0',
        groupId: 1,
        groupTitle: 'Intake & Assignment',
        title: 'Form arrives · review & send clarification',
        description: 'Review the incoming intake form · CAD missing and SQ blank for the GSA price-protected client. Strata drafted the clarifying email · review and send. Designer assignment unlocks once the reply arrives.',
        app: 'officeworks-intake',
        role: 'Design Manager',
        flowId: 'spec-check',
    },
    {
        id: 'sc1.0b',
        groupId: 1,
        groupTitle: 'Intake & Assignment',
        title: 'Reply received · review form & assign designer',
        description: 'Reply received with CAD attached and SQ confirmed · form complete. Review the updated intake and assign a designer · Strata recommends one based on capacity, region and project history.',
        app: 'officeworks-intake',
        role: 'Design Manager',
        flowId: 'spec-check',
    },

    // ═══════════════════════════════════════════
    // GROUP 2: Design & Validation
    // ═══════════════════════════════════════════
    {
        id: 'sc1.2',
        groupId: 2,
        groupTitle: 'Design & Validation',
        title: 'Design BOM + Validation Doc · send for client approval',
        description: 'Three sub-steps · upload the BOM · attach the validation deck · send the proposal for client sign-off.',
        app: 'officeworks-design',
        role: 'Designer',
        flowId: 'spec-check',
    },
    {
        id: 'sc1.4',
        groupId: 2,
        groupTitle: 'Design & Validation',
        title: 'SQ / Price-protected check',
        description: 'Verify the SQ number and confirm the catalog effective date for the price-protected GSA client · Strata embeds the manufacturer platform inline, no context switch.',
        app: 'officeworks-spec-check',
        role: 'Designer',
        flowId: 'spec-check',
    },

    // ═══════════════════════════════════════════
    // GROUP 3: Teknion Order Preview
    // ═══════════════════════════════════════════
    {
        id: 'sc1.5',
        groupId: 3,
        groupTitle: 'Teknion Order Preview',
        title: 'Submit Order Preview via Teknion portal',
        description: 'Submit the Order Preview to the manufacturer portal · BOM auto-fills. Wait for the response (typical 1-2 weeks) and pick the outcome · clean, spec gap, or timeline conflict.',
        app: 'officeworks-spec-check',
        role: 'Design Manager',
        flowId: 'spec-check',
    },
    {
        id: 'sc1.5b',
        groupId: 3,
        groupTitle: 'Teknion Order Preview',
        title: 'Resolve specification gaps',
        description: 'A spec gap is flagged on a line · Strata suggests the fix · accept or edit · BOM revised · resubmit the preview.',
        app: 'officeworks-spec-check',
        role: 'Designer',
        flowId: 'spec-check',
    },
    // ═══════════════════════════════════════════
    // GROUP 4: Spec Check ⭐ HERO FLOWS
    // ═══════════════════════════════════════════
    {
        id: 'sc1.6',
        groupId: 4,
        groupTitle: 'Spec Check',
        title: 'Self-audit BOM × 6 attributes',
        description: 'Run the 5-step audit · Big Picture → Validation Doc → BOM & Drawing → CRs → One Last Check · across 71 lines and 13 CRs. AI cross-references floor plan, validation doc and CR catalog. Today 6h on paper · with Strata 25min.',
        app: 'officeworks-spec-check',
        role: 'Designer',
        flowId: 'spec-check',
    },
    {
        id: 'sc1.7',
        groupId: 4,
        groupTitle: 'Spec Check',
        title: 'Peer review · second designer',
        description: 'A peer designer audits the self-audit · Strata summarizes deltas to focus the review and surfaces tacit-knowledge rules captured from prior projects. Save them to the knowledge base before approving.',
        app: 'officeworks-spec-check',
        role: 'Peer Reviewer',
        flowId: 'spec-check',
    },

    // ═══════════════════════════════════════════
    // GROUP 5: Submission & Confirmation
    // ═══════════════════════════════════════════
    {
        id: 'sc1.8',
        groupId: 5,
        groupTitle: 'Submission & Confirmation',
        title: 'BOM submission email · PDF + SP4',
        description: 'Send the BOM Submission email · BOM PDF and SP4 file attached. Strata pre-validates the SP4 against the ERP schema.',
        app: 'officeworks-submission',
        role: 'Designer',
        flowId: 'spec-check',
    },
    {
        id: 'sc1.8b',
        groupId: 5,
        groupTitle: 'Submission & Confirmation',
        title: 'Coordinator uploads · Salesperson releases PO',
        description: 'Three sequential sub-steps · upload the SP4 to the ERP · apply the discount · review and release the PO to the manufacturer.',
        app: 'officeworks-submission',
        role: 'Sales Coordinator',
        flowId: 'spec-check',
    },
    {
        id: 'sc1.9',
        groupId: 5,
        groupTitle: 'Submission & Confirmation',
        title: 'Acknowledgment review · Gemini supercharge',
        description: 'Open the manufacturer acknowledgment · run the diff scan across 71 lines and 13 CRs · resolve any discrepancy. Three terminal states · Acknowledged, Confirmed, or Held/Canceled.',
        app: 'officeworks-submission',
        role: 'Design Manager',
        flowId: 'spec-check',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // F29 · 2026-07-23 · L&D y Sales flows removidos del profile officeworks.
    // ─────────────────────────────────────────────────────────────────────
    // Diego decidió que estos 2 flows conceptualmente no pertenecen a la
    // experiencia "Spec Check & Design Validation" · L&D cabe mejor en WRG
    // (Labor Estimation) y Sales en CRM Standalone. Migración pendiente:
    //   · F30 · sc-LD.* → profile wrg-demo.ts (8 steps · vendor pool + bids)
    //   · F31 · sc-S.*  → profile crm.ts       (8 steps · inbox + proposal)
    // Los apps 'officeworks-labor' y 'officeworks-sales' + los 16 panels
    // del OfficeworksDocumentReviewModal (~2500 líneas) quedan intactos
    // como targets de la migración · el modal se puede reusar desde otros
    // profiles con flowId param cuando llegue F30/F31.
    // ═══════════════════════════════════════════════════════════════════════

];

// ─── STEP BEHAVIOR (presenter guide · action-forward) ────────────────────────

export const OFFICEWORKS_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'sc1.0':  { mode: 'interactive', userAction: 'Open the notification · review the form · send the clarification email' },
    'sc1.0b': { mode: 'interactive', userAction: 'Open the reply notification · review the completed form · approve and assign the designer' },
    'sc1.2':  { mode: 'interactive', userAction: '(1) Drop the BOM · review the 3 findings · (2) Attach the validation deck · (3) Send the proposal for client approval' },
    'sc1.4':  { mode: 'interactive', userAction: 'Open the manufacturer platform inline · verify the SQ # and the catalog year' },
    'sc1.5':  { mode: 'interactive', userAction: 'Submit the Order Preview · wait for the response · pick the outcome (clean / spec gap / timeline conflict)' },
    'sc1.5b': { mode: 'interactive', userAction: 'Accept the spec gap fix · resubmit the preview' },
    'sc1.6':  { mode: 'interactive', userAction: 'Toggle Current State → Strata · run the 5-step audit · resolve issues · send to peer' },
    'sc1.7':  { mode: 'interactive', userAction: 'Read the peer annotations · save the tacit-knowledge rules · approve · send BOM submission' },
    'sc1.8':  { mode: 'interactive', userAction: 'Review the BOM Submission email · send to the client and coordinator' },
    'sc1.8b': { mode: 'interactive', userAction: 'Watch the ERP upload + discount · release the PO to the manufacturer' },
    'sc1.9':  { mode: 'interactive', userAction: 'Open the real PO acknowledgment · run the diff · resolve any discrepancy · pick terminal state (Confirmed / Held)' },
};

// ─── STEP MESSAGES (AI agent progress · short, status-style) ─────────────────

export const OFFICEWORKS_STEP_MESSAGES: Record<string, string[]> = {
    'sc1.0': [
        'Form received · Metro Legal 4th Floor · DC market',
        'Scanning attachments · CAD file required: not found',
        'GSA client detected · SQ number required: not provided',
        'Drafting clarification email back to Designer Nova',
        'Designer assignment blocked until reply with CAD + SQ',
    ],
    'sc1.0b': [
        'Reply received from Designer Nova · 2026-04-17 11:08',
        'CAD attachment parsed · manatt-4th-floor.dwg · 4.8 MB',
        'SQ #436533 confirmed · GSA price-protected · catalog 2025',
        'Form completeness · all required fields satisfied',
        'Pulling designer capacity across 3 regions',
        'Cross-referencing prior Metro Legal assignments',
    ],
    'sc1.2': [
        'Designer building BOM externally in CET / CAP',
        'Capacity ledger · CET session opened · +6h committed to Kimberly',
        'BOM uploaded · parsing PDF · 149 line items · 15 pages · Teknion T25',
        '11 areas tagged · 22 Custom Requests flagged for spec-check',
        '1 finish inconsistency surfaced · Item 73 · XS vs area XG Very White',
        'Pricing parsed · $1,541,392 List · AI Validator queued · 894 checks',
        'Validation deck attached · Metro Legal-Validation-Doc-v1.pptx · 24 slides',
        'Strata read 6 sections · floor plan · 2D · 3D · finishes · wire mgmt · electrical',
        'Proposal sent to Designer Nova · BOM PDF + Validation Doc attached',
        'GW2A gate · SQ + Teknion submission blocked until client sign-off',
        'EVP Design approved · proposal locked · proceed to SQ check',
    ],
    'sc1.4': [
        'GW2C: client = Metro Legal · GSA contract · SQ required',
        'Opening Create platform inline · NO context switch',
        'SQ #436533 confirmed · price-protected effective 2025',
        'PZ Description column verified vs current catalog',
    ],
    'sc1.5': [
        'Filling Teknion Order Preview form · auto-from BOM',
        'Submitting to Tifani · awaiting response (1-2 weeks)',
        'Order preview #OP-2025-0001605 returned',
        'GW3: timeline conflict detected on 40-day CRs',
    ],
    'sc1.5b': [
        'Highlighting spec gap on line · CR 2046138 leadtime',
        'Drafting fix · phasing recommendation',
        'BOM revised · resubmitting preview',
    ],
    'sc1.6': [
        'AUDIT: assumption that errors WILL exist · find them!',
        'Step 1 Big Picture · DC market · OWDC electrical req',
        'Step 2 Validation Doc · 2D/3D match floor plan · finishes OK',
        'Step 3 BOM × 6 attrs across 71 lines · 8 sub-categories',
        'Step 4 CRs in Create · 13 CRs · CR 2075919 BIFMA advisory',
        'Step 5 final check · 0 $0-list · catalogs current · aisle code OK',
        'Self-audit complete · 3 issues resolved · ready for peer review',
    ],
    'sc1.7': [
        'Peer assigned: Rebecca Warren (MA/NY/NJ)',
        'Delta summary: focus on CRs + electrical layout',
        'Strata surfaced: District inset glass should be 6mm (from EVP Design\'s history)',
        'Strata surfaced: Leverage NO field cut metal fascia (from EVP Design\'s history)',
        '2 new rules saved to Officeworks knowledge base',
        'Peer audit complete · BOM approved · send submission',
    ],
    'sc1.8': [
        'Drafting BOM Submission email · standard template',
        'Attaching BOM PDF + SP4 file',
        'Pre-validating SP4 vs NetSuite schema',
        'Sent to Designer Nova + Sales Coordinator',
    ],
    'sc1.8b': [
        'Coordinator: uploading SP4 to NetSuite · 4 min',
        'Coordinator: applying discount · 79% off list',
        'Salesperson Caitlin: reviewing PO',
        'PO released to Teknion · PO-DC-0009642 generated',
    ],
    'sc1.9': [
        'Acknowledgment received · Universal #2-10468963',
        'Loading real PO-DC-0009642.pdf · 11 pages',
        'Gemini cross-reference: 71 lines · 13 CRs',
        'Diff scan: line 6 part # variant · within spec',
        'GW6: 70/71 lines match · 1 discrepancy on shipping date',
        'Drafting Change Order to ack@teknion.example',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const OFFICEWORKS_SELF_INDICATED: string[] = [
    'sc1.0', 'sc1.0b', 'sc1.2', 'sc1.4',
    'sc1.5', 'sc1.5b', 'sc1.6', 'sc1.7', 'sc1.8', 'sc1.8b', 'sc1.9',
];
