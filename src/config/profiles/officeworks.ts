// ═══════════════════════════════════════════════════════════════════════════════
// OFFICEWORKS — Officeworks Inc. · Strata AI Spec Check & Design Demo Profile
//
// CLIENT: Officeworks Inc. (Burlington MA · ~181 employees · 10 markets · $100M+
//         Teknion 30-year partner · GSA contract · 2022 Teknion Orion Award)
//
// DEMO PROCESS: Spec Check & Design (Furniture vertical · 30 designers · 3 mgrs)
// PROTAGONIST: Kimberly Tucker (Design Manager · PA/Pittsburgh/Ancillary)
// DEMO CLIENT: MANATT Phelps & Phillips LLP · DC market · price-protected SQ
//
// STRUCTURE: 17 steps mapped from BPMN (12 numbered tasks + 9 sub-steps +
//            13 gateways + 3 end events) in 5 swimlanes
//
//   Group 1 — Intake & Assignment       sc1.0, sc1.0b
//   Group 2 — Design & Validation       sc1.1, sc1.1-bypass, sc1.2, sc1.2b,
//                                       sc1.3, sc1.3b, sc1.4
//   Group 3 — Teknion Order Preview     sc1.5, sc1.5b, sc1.5c
//   Group 4 — Spec Check  ⭐ HEROES     sc1.6 (SC2+SC3), sc1.7 (SC7)
//   Group 5 — Submission & Confirm      sc1.8, sc1.8b, sc1.9 ⭐ (Gemini)
//
// CEO TOP 4 PAIN POINTS (Chris Hanes confirmed):
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
        title: 'Form arrives · review & assign designer',
        description: 'Felicia (EVP Design & PM) opens the new MANATT intake. Caitlin Barolet (DC) submitted the Works form but the required CAD is missing and the SQ for the price-protected GSA client is blank. Strata drafted the clarifying email to Caitlin and surfaced the capacity heatmap. Felicia analyzes form completeness and assigns a designer in one move · Strata recommends Kimberly Tucker (PA · 65% utilized · prior MANATT · cross-market).',
        app: 'officeworks-intake',
        role: 'Design Manager',
    },

    // ═══════════════════════════════════════════
    // GROUP 2: Design & Validation
    // ═══════════════════════════════════════════
    {
        id: 'sc1.1',
        groupId: 2,
        groupTitle: 'Design & Validation',
        title: 'Kickoff call · scope + project size',
        description: 'Kimberly schedules a kickoff with Caitlin. Strata auto-generates the unclarified-items checklist from the form gaps and transcribes the call. The project-size gateway (GW1B) determines the path: Small (1-5 stations bypass) or Standard/Large (full flow).',
        app: 'officeworks-intake',
        role: 'Designer',
    },
    {
        id: 'sc1.2',
        groupId: 2,
        groupTitle: 'Design & Validation',
        title: 'Draw furniture plan in CET',
        description: 'Kimberly draws the furniture layout in CET — workstations, finishes, CRs. Optional parallel task surfaces: "Prepare Deep Discounting BOM" for volume discount negotiations (DDP).',
        app: 'officeworks-design',
        role: 'Designer',
    },
    {
        id: 'sc1.2b',
        groupId: 2,
        groupTitle: 'Design & Validation',
        title: 'Export BOM CET → CAP',
        description: 'CAP generates the Bill of Materials — 71 line items across 4 tags. Specifications documentation and electrical coordination are embedded here, not standalone steps.',
        app: 'officeworks-design',
        role: 'Designer',
    },
    {
        id: 'sc1.3',
        groupId: 2,
        groupTitle: 'Design & Validation',
        title: 'Validation document + client approval',
        description: 'The validation document compiles in Google Slides — 2D/3D drawings, finishes, electrical specs. Sent to MANATT for approval. If revisions requested, sub-gateway determines: layout change (Task 3 loop) or BOM-only change (Task 4 loop).',
        app: 'officeworks-submission',
        role: 'Designer',
    },
    {
        id: 'sc1.3b',
        groupId: 2,
        groupTitle: 'Design & Validation',
        title: 'Field verification handoff',
        description: 'Pre-installation drawings (2D dimensions + blocking + electrical/floor cores) hand off to Abigail\'s PM team. Field verification happens BEFORE order placed with Teknion — confirms GC built space to spec.',
        app: 'officeworks-submission',
        role: 'Designer',
    },
    {
        id: 'sc1.4',
        groupId: 2,
        groupTitle: 'Design & Validation',
        title: 'SQ / Price-protected check',
        description: 'MANATT is a price-protected GSA client (SQ #436533). Strata embeds the Teknion Create platform inline — no context switch — to verify SQ number and confirm the correct catalog effective date.',
        app: 'officeworks-spec-check',
        role: 'Designer',
    },

    // ═══════════════════════════════════════════
    // GROUP 3: Teknion Order Preview
    // ═══════════════════════════════════════════
    {
        id: 'sc1.5',
        groupId: 3,
        groupTitle: 'Teknion Order Preview',
        title: 'Submit Order Preview via Teknion portal',
        description: 'Felicia tracks the Teknion preview submission · Kimberly\'s BOM auto-filled in the portal. Tifani returns the preview number — typical turnaround 1-2 weeks. Gateway GW3 reveals the outcome: clean, specification gap, or timeline conflict.',
        app: 'officeworks-spec-check',
        role: 'Design Manager',
    },
    {
        id: 'sc1.5b',
        groupId: 3,
        groupTitle: 'Teknion Order Preview',
        title: 'Resolve specification gaps',
        description: 'Tifani flags a spec gap on a line. Strata suggests the fix · Kimberly accepts or edits · BOM revised · preview resubmitted.',
        app: 'officeworks-spec-check',
        role: 'Designer',
    },
    {
        id: 'sc1.5c',
        groupId: 3,
        groupTitle: 'Teknion Order Preview',
        title: 'Strategize order phasing',
        description: 'Teknion can\'t hit the date. 3-way huddle (Designer + PM + Salesperson) drafts the phasing plan. GW3A: does the revised plan require a new preview?',
        app: 'officeworks-spec-check',
        role: 'Designer',
    },

    // ═══════════════════════════════════════════
    // GROUP 4: Spec Check ⭐ HERO FLOWS
    // ═══════════════════════════════════════════
    {
        id: 'sc1.6',
        groupId: 4,
        groupTitle: 'Spec Check',
        title: 'Self-audit BOM × 6 attributes',
        description: 'Today: printed BOMs + highlighters + pens, no laptop. With Strata: 5-step audit (Big Picture → Validation Doc → BOM & Drawing → CRs → One Last Check) across 71 lines, 13 CRs, 8 sub-categories. AI cross-references floor plan + validation doc + Create CR database. Estimated time saved: 6h → 25min.',
        app: 'officeworks-spec-check',
        role: 'Designer',
    },
    {
        id: 'sc1.7',
        groupId: 4,
        groupTitle: 'Spec Check',
        title: 'Peer review · second designer',
        description: 'Felicia opens the peer audit · Rebecca Warren reviews Kimberly\'s self-audit. Strata summarizes deltas to focus the review. Felicia drops her own tacit knowledge as rules ("I always check District inset glass — should be 6mm not CET default 10mm") — converting tacit to explicit knowledge base · CEO #3 priority (SC7).',
        app: 'officeworks-spec-check',
        role: 'Design Manager',
    },

    // ═══════════════════════════════════════════
    // GROUP 5: Submission & Confirmation
    // ═══════════════════════════════════════════
    {
        id: 'sc1.8',
        groupId: 5,
        groupTitle: 'Submission & Confirmation',
        title: 'BOM submission email · PDF + SP4',
        description: 'Kimberly sends the BOM Submission email to Caitlin (and the Coordinator) — the BOM PDF and SP4 file attached. Strata pre-validates SP4 against NetSuite schema.',
        app: 'officeworks-submission',
        role: 'Designer',
    },
    {
        id: 'sc1.8b',
        groupId: 5,
        groupTitle: 'Submission & Confirmation',
        title: 'Coordinator uploads · Salesperson releases PO',
        description: 'Sales Coordinator uploads SP4 into NetSuite and applies the discount. Salesperson reviews and releases the PO to Teknion. Two distinct lanes, observed downstream.',
        app: 'officeworks-submission',
        role: 'Sales Coordinator',
    },
    {
        id: 'sc1.9',
        groupId: 5,
        groupTitle: 'Submission & Confirmation',
        title: 'Acknowledgment review · Gemini supercharge',
        description: 'Felicia opens the Teknion acknowledgment (real PO-DC-0009642) · the team\'s Gemini AI is already in use today for this exact cross-reference. Strata supercharges it. Diff scan across 71 lines + 13 CRs. Three terminal states: Acknowledged · Confirmed (post-resolve) · Held/Canceled.',
        app: 'officeworks-submission',
        role: 'Design Manager',
    },

];

// ─── STEP BEHAVIOR (presenter guide · action-forward) ────────────────────────

export const OFFICEWORKS_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'sc1.0':  { mode: 'interactive', userAction: 'Click the Strata notification → review the form (CAD missing · SQ blank) · click Kimberly Tucker in the heatmap → Approve & Assign' },
    'sc1.1':  { mode: 'interactive', userAction: 'Run through the kickoff checklist · pick Project Size (Standard/Large for MANATT) · confirm scope' },
    'sc1.2':  { mode: 'interactive', userAction: 'Watch CET fill in typicals · optionally enable DDP parallel · export to CAP' },
    'sc1.2b': { mode: 'interactive', userAction: 'Watch the 71-line BOM populate · review subtotals by Tag (WS-01/02/02/02.A) · continue to validation' },
    'sc1.3':  { mode: 'interactive', userAction: 'Preview the validation doc · send to MANATT · simulate approval (or trigger a revision loop)' },
    'sc1.3b': { mode: 'interactive', userAction: 'Send pre-install drawings to Abigail · field verification scheduled · resolve any GC discrepancies' },
    'sc1.4':  { mode: 'interactive', userAction: 'GW2C: SQ required (yes for MANATT) · open Create inline · verify SQ #436533 + 2025 catalog' },
    'sc1.5':  { mode: 'interactive', userAction: 'Submit Order Preview · wait for Tifani · pick GW3 outcome (clean / spec gap / timeline conflict)' },
    'sc1.5b': { mode: 'interactive', userAction: 'Accept Strata\'s spec gap fix · resubmit preview' },
    'sc1.5c': { mode: 'interactive', userAction: 'Open 3-way phasing card · review revised plan · GW3A: new preview or proceed' },
    'sc1.6':  { mode: 'interactive', userAction: 'Toggle Current State (paper) → Strata digital · run the 5-step audit · resolve issues · click any CR to lookup in Create inline · send to peer' },
    'sc1.7':  { mode: 'interactive', userAction: 'Read Rebecca\'s annotations · save Felicia\'s tacit knowledge as rules · approve · send BOM submission' },
    'sc1.8':  { mode: 'interactive', userAction: 'Review the BOM Submission email · send to Caitlin + Coordinator' },
    'sc1.8b': { mode: 'interactive', userAction: 'Watch NetSuite upload + discount · Salesperson releases PO to Teknion' },
    'sc1.9':  { mode: 'interactive', userAction: 'Open the real PO-DC-0009642 acknowledgment · run the diff · resolve any discrepancy with Teknion · pick terminal state (Confirmed / Held)' },
};

// ─── STEP MESSAGES (AI agent progress · short, status-style) ─────────────────

export const OFFICEWORKS_STEP_MESSAGES: Record<string, string[]> = {
    'sc1.0': [
        'Form received · MANATT 4th Floor · DC market',
        'Scanning attachments · CAD file required: not found',
        'GSA client detected · SQ number required: not provided',
        'Drafting clarification email back to Caitlin Barolet',
        'Pulling designer capacity across 3 regions',
        'Cross-referencing prior MANATT assignments',
        'Match: Kimberly Tucker · 65% utilized · resource-share PA→DC',
    ],
    'sc1.1': [
        'Scheduling kickoff with Caitlin Barolet',
        'Auto-populating scope checklist from form',
        'GW1B: project size · ~30 stations · Standard/Large path',
        'Timeline template loaded · OW_Awarded Design Timeline',
    ],
    'sc1.2': [
        'Loading Teknion part library · 30-year catalog',
        'Suggesting typicals from MANATT brief',
        'Optional DDP parallel: Deep Discounting BOM for RFP',
        'Workstation tagging by Level 4 + Tag (WS-01/02)',
    ],
    'sc1.2b': [
        'Exporting CET → CAP',
        'Generating 71 line items · 13 CRs · 4 tags',
        'Subtotals by Alias 1 · Level 4 · running total $296,228.13 List',
        'Specs + electrical coordination embedded · ready for validation',
    ],
    'sc1.3': [
        'Compiling Validation Document · Google Slides',
        '2D/3D drawings · finishes · electrical wiring · wire mgmt',
        'Sent to MANATT contact for approval',
        'GW2A: awaiting response · client approval is primary delay driver',
    ],
    'sc1.3b': [
        'Pre-install drawings: hold-to dimensions · blocking · floor cores',
        'Sent to Abigail\'s team · field verification scheduled',
        'GW2B: verifying space matches drawings · no GC discrepancy',
        'Field verification complete · proceed to SQ check',
    ],
    'sc1.4': [
        'GW2C: client = MANATT · GSA contract · SQ required',
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
    'sc1.5c': [
        'Drafting 3-way phasing plan',
        'Notifying Caitlin (Salesperson) + Abigail (PM)',
        'GW3A: phasing changes order structure · new preview needed',
        'Proceed to self-audit · phased BOM',
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
        'Felicia tacit knowledge: District inset glass should be 6mm',
        'Felicia tacit: Leverage NO field cut metal fascia',
        '2 new rules saved to Officeworks knowledge base',
        'Peer audit complete · BOM approved · send submission',
    ],
    'sc1.8': [
        'Drafting BOM Submission email · standard template',
        'Attaching BOM PDF + SP4 file',
        'Pre-validating SP4 vs NetSuite schema',
        'Sent to Caitlin Barolet + Sales Coordinator',
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
        'Drafting Change Order to tekco1@teknion.com',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const OFFICEWORKS_SELF_INDICATED: string[] = [
    'sc1.0', 'sc1.1', 'sc1.2', 'sc1.2b', 'sc1.3', 'sc1.3b', 'sc1.4',
    'sc1.5', 'sc1.5b', 'sc1.5c', 'sc1.6', 'sc1.7', 'sc1.8', 'sc1.8b', 'sc1.9',
];
