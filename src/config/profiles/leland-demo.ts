// ═══════════════════════════════════════════════════════════════════════════════
// Leland — Strata AI Demo Profile (v0.5 · role-based copy · plain language)
//
// CLIENT: Leland · Avanto · April 2026
//
// DEMO NARRATIVE: Purchase order pipeline with one edge case integrated
//   mid-flow. Reviewer appears in the middle — caught by Strata, resolved
//   in 1 click — instead of at the end of a separate exception flow.
//
// FLOW 0 — Briefing (1 step)
//   l0.1: Today the Account Manager bounces between four systems per PO
//
// FLOW 1 — Pipeline (8 steps)
//   l1.1  Purchase order arrives · captured automatically
//   l1.2  Matching quote found in the order system
//   l1.3  Catches a price difference · pauses for review
//   l1.4  Reviewer approves the catch · 1 click ⭐ INTERACTIVE
//   l1.5  Customer · materials · configuration validated
//   l1.6  Order built in the order system
//   l1.7  Comments and rebate applied
//   l1.8  Order logged · ticket closed
//
// FLOW 2 — Reveal (1 step)
//   l2.1  Before / after · what this means at scale
//
// HERO IMPACT: a single price catch projects to material annual savings.
// Numbers live in the hero cards (PriceComparisonTable, RevealMetrics) —
// the rest of the copy stays action-focused, not number-heavy.
//
// Reference: strata-projects/leland/LELAND_DEMO_DEVELOPMENT_PLAN.md
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const LELAND_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // FLOW 0: Briefing — life before Strata
    // ═══════════════════════════════════════════
    {
        id: 'l0.1',
        groupId: 0,
        groupTitle: 'Briefing · today',
        title: 'A purchase order needs to become an order',
        description: 'The Account Manager opens a fresh PO email and starts the manual dance: jump to the order system to look up the quote, open the materials reference, check the supplier site for current pricing, paste it back. The Reviewer sees every PO before it can move forward.',
        app: 'leland-inbox',
        role: 'Dealer',
    },

    // ═══════════════════════════════════════════
    // FLOW 1: PO-to-Order pipeline
    // ═══════════════════════════════════════════
    {
        id: 'l1.1',
        groupId: 1,
        groupTitle: 'Pipeline',
        title: 'Strata picks up the purchase order',
        description: 'The email lands and Strata recognizes it as a PO. It reads the document, pulls out everything that matters — what is being ordered, where it ships, the reference quote — and structures it for the rest of the pipeline.',
        app: 'leland-strata',
        role: 'System',
    },
    {
        id: 'l1.2',
        groupId: 1,
        groupTitle: 'Pipeline',
        title: 'Matching quote found',
        description: 'Strata looks for a matching quote in the order system using several search angles at once. The right one comes back at the top — bringing along approved pricing, configuration and shipping.',
        app: 'leland-strata',
        role: 'System',
    },
    {
        id: 'l1.3',
        groupId: 1,
        groupTitle: 'Pipeline',
        title: 'Catches a price difference',
        description: 'One line on the PO is priced lower than the approved quote. Strata catches it before it can quietly cost the dealer money, pauses auto-approval, and packs the full context for a Reviewer to decide.',
        app: 'leland-strata',
        role: 'System',
        highlightId: 'price-mismatch-row-1',
    },
    {
        id: 'l1.4',
        groupId: 1,
        groupTitle: 'Pipeline',
        title: 'Reviewer approves the catch',
        description: 'The Reviewer opens the queue and sees only what needs a human decision. The catch is presented with the side-by-side comparison and a clear recommendation. One click resolves it and Strata picks the work back up.',
        app: 'leland-review',
        role: 'Expert',
        highlightId: 'joshua-exception-detail',
    },
    {
        id: 'l1.5',
        groupId: 1,
        groupTitle: 'Pipeline',
        title: 'Customer, materials and config validated',
        description: 'Strata confirms the customer, validates shipping addresses, configures every line item, calculates shipping costs, and verifies the materials. Everything checks out — ready to build the order.',
        app: 'leland-strata',
        role: 'System',
    },
    {
        id: 'l1.6',
        groupId: 1,
        groupTitle: 'Pipeline',
        title: 'Order built in the order system',
        description: 'Strata builds the sales order automatically. Watch the fields fill in one after another — header from the matched quote, then line items, then the rest. The order number is assigned at the end.',
        app: 'leland-seradex',
        role: 'System',
    },
    {
        id: 'l1.7',
        groupId: 1,
        groupTitle: 'Pipeline',
        title: 'Comments and rebate applied',
        description: 'The standard comments populate from templates, project metadata is filled in, and the contract-specific rebate line is added automatically — exactly the kind of detail that is easy to miss when typed by hand.',
        app: 'leland-seradex',
        role: 'System',
    },
    {
        id: 'l1.8',
        groupId: 1,
        groupTitle: 'Pipeline',
        title: 'Order logged · ticket closed',
        description: 'The order is logged, the notification goes out, the support ticket closes, and the tracker updates — all without anyone touching another system. What used to take an afternoon now takes minutes.',
        app: 'leland-strata',
        role: 'System',
    },

    // ═══════════════════════════════════════════
    // FLOW 2: Reveal
    // ═══════════════════════════════════════════
    {
        id: 'l2.1',
        groupId: 2,
        groupTitle: 'Reveal · before / after',
        title: 'What this means at scale',
        description: 'From a half-hour per PO to a few minutes. From every order going through the Reviewer to only the ones that need a decision. From manual data entry to fully automated. What Strata catches today projects to real savings over a year.',
        app: 'leland-strata',
        role: 'System',
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const LELAND_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'l0.1': { mode: 'interactive', userAction: 'Click the highlighted email to let Strata pick up this PO' },

    'l1.1': { mode: 'auto', duration: 5, aiSummary: 'Reading the PO and structuring the data' },
    'l1.2': { mode: 'auto', duration: 5, aiSummary: 'Looking for a matching quote in the order system' },
    'l1.3': { mode: 'auto', duration: 5, aiSummary: 'Comparing line prices · catching the difference' },
    'l1.4': { mode: 'interactive', userAction: 'Open the catch and approve in one click — Strata resumes the order' },
    'l1.5': { mode: 'auto', duration: 6, aiSummary: 'Validating customer · materials · configuration' },
    'l1.6': { mode: 'auto', duration: 6, aiSummary: 'Building the sales order in the order system' },
    'l1.7': { mode: 'auto', duration: 3, aiSummary: 'Adding comments · metadata · contract rebate' },
    'l1.8': { mode: 'auto', duration: 3, aiSummary: 'Logging the order · closing the support ticket' },

    'l2.1': { mode: 'interactive', userAction: 'Review the before / after summary and what comes next' },
};

// ─── STEP MESSAGES (rotated through DemoAIIndicator during auto steps) ───────

export const LELAND_STEP_MESSAGES: Record<string, string[]> = {
    'l0.1': [
        'A new PO is sitting in the inbox',
        'The Account Manager has to bounce between four systems to process it',
        'Every order goes through the Reviewer before it can move forward',
    ],

    'l1.1': [
        'Email landed · ticket created',
        'Recognizing the document as a PO',
        'Reading the attached document',
        'Pulling out what matters — items, quantities, ship-to',
        'Data structured · ready for the next check',
    ],
    'l1.2': [
        'Searching the order system for matching quotes',
        'Trying different search angles at once',
        'Top match found · pulling pricing and configuration',
        'Shipping already approved on the matched quote',
    ],
    'l1.3': [
        'Comparing line prices against the matched quote',
        'Most lines match cleanly',
        'One line off · catching it before it slips through',
        'Pausing auto-approval · packing the catch for review',
    ],
    'l1.4': [
        'The Reviewer opens the queue',
        'Only what needs a human decision shows up',
        'Catch presented with full context · awaiting a decision',
    ],
    'l1.5': [
        'Looking up the customer in the order system',
        'Confirming shipping addresses · validated',
        'Configuring each line item · field dependencies handled',
        'Calculating shipping costs',
        'Verifying the materials · standard pattern · no extras',
    ],
    'l1.6': [
        'Switching to the order system',
        'Header pre-filled from the matched quote',
        'Importing the line items',
        'Filling the remaining fields automatically',
        'Order number assigned',
    ],
    'l1.7': [
        'Adding the standard comments',
        'Filling in project metadata',
        'Detecting the contract terms',
        'Applying the contract-specific rebate line',
    ],
    'l1.8': [
        'Logging the order · firing the notification',
        'Sales order moves to the final state',
        'Support ticket closes · category updated',
        'Tracker updates · everything in sync',
    ],

    'l2.1': [
        'Half an hour per PO · now a few minutes',
        'Every order through the Reviewer · now only the exceptions',
        'Manual entry · now fully automated',
        'What Strata catches today projects to real annual savings',
        'This is the first phase of the broader roadmap',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const LELAND_SELF_INDICATED: string[] = [
    'l1.1',  // PoExtractionPreview runs its own field-by-field cascade
    'l1.4',  // Reviewer queue is interactive — manages its own state
    'l1.6',  // RpaBotCanvas runs its own cursor + typing animation
];
