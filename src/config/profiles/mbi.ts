// ═══════════════════════════════════════════════════════════════════════════════
// MBI — Modern Business Interiors · Strata AI Demo Profile
//
// CLIENT: Modern Business Interiors (St. Charles, MO + Lenexa, KS · ~42 employees
//         · ~$17M · 30+ manufacturer partners · Allsteel dealer)
// PREPARED BY: Avanto
// DATE: April 2026 · revised Apr 27 2026
//
// DEMO NARRATIVE: 3 AI modules · Phase 1 = Accounting AI (Sponsor's pick).
//                 Budget Builder removed from the Thursday demo per Apr 23
//                 stakeholder direction (Sponsor). The MBIBudgetPage component +
//                 m1.x history live in git in case priorities shift.
//
// FLOW 1 — Accounting AI (Phase 2, Controller · Phase 1 Pilot) · 5 scenes / 5 beats
//   m2.1: Bill queue — 3-column kanban (pending · in-progress · done)
//   m2.2: HealthTrust exception — GPO rebate · approve / override / escalate
//   m2.3: Non-EDI reconciliation — PO vs invoice line-by-line diff
//   m2.4: AR aging review — live status taxonomy + analytics (Apr 23 split)
//   m2.5: Collection drafts + close — review/edit/send + handoff to Flow 2
//
// FLOW 2 — Quotes AI (Phase 4, PM bottleneck resolution) · 4 scenes / 4 beats
//   m3.1: Incoming budget — signed handoff from the Account Manager → PM queue
//   m3.2: GP review + CORE Quote — PC sets GP per vendor · Strata creates CORE Quote
//   m3.3: AI validation — audit loops collapse into 1 AI + 1 human review
//   m3.4: Send proposal — closes the active tour (Design AI is Phase 4
//         directional context · available via Design AI tab outside the tour)
//
// DESIGN AI (Phase 4, early-adopter Designer · 3 scenes) — REMOVED FROM TOUR
// per Apr 27 stakeholder direction (Sales Lead: "primary and only necessary
// demonstration is accounting" + Phase 4 modules are directional only).
// MBIDesignPage stays navigable via the Design AI nav tab so anyone who
// asks about Spec Check (Q10 #1 priority) can still see it. The m4.x
// step definitions live in git history if the tour needs them back.
//
// HERO SCENARIO: Allsteel invoice · 3% GPO rebate · pre-flagged by AI
// (the $18K Allsteel worksurface story belonged to the Budget Builder flow that
// is no longer in this demo)
//
// Note on step IDs: m2.x / m3.x / m4.x are kept verbatim from the original
// 4-flow plan so per-page STEP_TO_WIZARD_INDEX maps and useDemo wiring keep
// working without per-component churn. Only the visible groupTitle ("Flow 1:",
// "Flow 2:", "Flow 3:") and groupId numbering reflect the 3-flow trim.
//
// Reference: strata-projects/mbi/MBI_DEMO_DEVELOPMENT_PLAN.md
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const MBI_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // FLOW 1: Accounting AI (Phase 1 · Sponsor's pick)
    // Controller · Phase 1 Pilot · 4 scenes
    // ═══════════════════════════════════════════
    {
        id: 'm2.1',
        groupId: 0,
        groupTitle: 'Flow 1: Accounting AI',
        title: 'AP · Pending Review',
        description: 'Strata processes vendor bills continuously as they arrive. Kathy opens her queue and sees the current state: 5 auto-posted to CORE, 3 being reconciled by agents, and 4 pending her decision — flagged exceptions that need a human call before posting.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.3',
        groupId: 0,
        groupTitle: 'Flow 1: Accounting AI',
        title: 'Bill Review — line-by-line',
        description: 'Strata OCRs paper and PDF bills and compares them line-by-line to the matching PO. The Controller sees flagged variances surfaced inline — price mismatches, short-shipped items, missing freight lines — and resolves each with an accept or an override and reason.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    // ═══════════════════════════════════════════
    // FLOW 2: Collections AI
    // Controller · AR aging + collection follow-ups
    // ═══════════════════════════════════════════
    {
        id: 'm2.4',
        groupId: 1,
        groupTitle: 'Flow 2: Collections AI',
        title: 'AR aging — live board',
        description: 'Kathy shifts to receivables: $240K open across active accounts. The live aging board replaces the bi-weekly Excel — accounts routed by status (sent, no response, escalated, on hold). Strata protects two accounts from auto-collections and scheduled the next contact where a client already replied with a date.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.5',
        groupId: 1,
        groupTitle: 'Flow 2: Collections AI',
        title: 'Collection drafts + wrap up',
        description: 'Strata auto-sent 6 standard follow-ups today and held back 2 accounts where the project isn\'t complete yet. For the two escalation cases, Strata drafted emails in each client\'s tone history — the Controller reviews, edits if needed, and sends. With AP posted and AR actioned, the queue closes.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },

    // ═══════════════════════════════════════════
    // FLOW 3: Quotes AI (Phase 4)
    // Project Manager · 4 scenes
    // ═══════════════════════════════════════════
    {
        id: 'm3.3',
        groupId: 2,
        groupTitle: 'Flow 3: Quotes AI',
        title: 'BOM completeness check',
        description: "Strata reviews the uploaded BOM, converts to SIF format if necessary, and performs multiple validations.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },
    {
        id: 'm3.5',
        groupId: 2,
        groupTitle: 'Flow 3: Quotes AI',
        title: 'Vendor quote upload · non-catalog resolution',
        description: "Drop a vendor quote PDF and Strata reads it — SKU, unit price, lead time, MOQ extracted automatically. Non-catalog items flagged by the validator are resolved here, no manual re-entry.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },
    {
        id: 'm3.2',
        groupId: 2,
        groupTitle: 'Flow 3: Quotes AI',
        title: 'GP review',
        description: "The PC reviews gross profit per vendor. Contract lines auto-lock (HNI Corporate 55%); unlocked vendors need a GP entry. Strata calculates sell prices.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },
    {
        id: 'm3.6',
        groupId: 2,
        groupTitle: 'Flow 3: Quotes AI',
        title: 'Proposal review',
        description: "Review CORE Quote line items · adjust GP if needed before generating the proposal.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },
    {
        id: 'm3.4',
        groupId: 2,
        groupTitle: 'Flow 3: Quotes AI',
        title: 'Proposal creation · close the tour',
        description: "One human review later, the proposal is sent.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },

    // Design AI (m4.x) intentionally removed from MBI_STEPS · MBIDesignPage
    // remains navigable via the Design AI nav tab. See header comment.
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const MBI_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'm2.1': { mode: 'interactive', userAction: 'Review the queue · bills processed as they arrived · exceptions flagged for human decision' },
    'm2.3': { mode: 'interactive', userAction: 'Review flagged bill variances line-by-line · accept or override each one' },
    'm2.4': { mode: 'interactive', userAction: 'Scan the AR aging board · spot escalations and on-hold accounts · forecast updates live' },
    'm2.5': { mode: 'interactive', userAction: 'Review the AI-drafted collection emails · edit if needed · send · then wrap up the queue' },
    'm3.3': { mode: 'interactive', userAction: 'Review the BOM validation — duplicates, non-catalog pricing, qty consistency · then proceed to vendor quote upload' },
    'm3.5': { mode: 'interactive', userAction: 'Upload the vendor quote PDF · Strata reads it · review the extracted data and resolve the flagged NC-004 item' },
    'm3.2': { mode: 'interactive', userAction: 'Run SIF extraction · enter GP per vendor · confirm to create CORE Quote QUOT-2026-003' },
    'm3.6': { mode: 'interactive', userAction: 'Review CORE Quote line items · adjust GP% if needed · then click Create proposal' },
    'm3.4': { mode: 'interactive', userAction: 'Approve and send the proposal · orders route to manufacturers · this closes the active tour' },
};

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const MBI_STEP_MESSAGES: Record<string, string[]> = {
    'm2.1': [
        'Fetching bill queue',
        'Document AI extracting fields from each vendor bill',
        'Matching bill lines to open POs in CORE',
        'Clean bills auto-posted · agents reconciling non-EDI · exceptions surfaced',
    ],
    'm2.3': [
        'OCR extracting fields from paper and PDF bills',
        'Matching bill to its source PO line-by-line',
        'Surfacing variances inline · price mismatch + missing freight line',
        'Override logged · vendor-specific matcher updated',
    ],
    'm2.4': [
        'Generating AR aging report (live, not bi-weekly)',
        'Routing accounts by status · paid · committed-to-pay · escalated',
        'Updating leadership billing forecast in real-time',
        'AR analytics ready · drafts queued for the next scene',
    ],
    'm2.5': [
        'Drafting collection emails by account tone + history',
        'Loading client past-conversation context per draft',
        'Awaiting Controller review · send · close',
        'Queue complete · ready for handoff to Quotes AI',
    ],
    'm3.2': [
        'Reading SIF · extracting 24 fields from CET export',
        'Contract matched · HNI Corporate 55% discount applied',
        'Staging for GP review · contract lines locked · unlocked vendors need PC input',
        'PC confirmed GP · sell prices calculated · CORE Quote QUOT-2026-003 created',
    ],
    'm3.6': [
        'Loading CORE Quote QUOT-2026-003 line items',
        'Surfacing GP breakdown per vendor',
        'Unlocked vendors ready for PC adjustment',
        'Line items confirmed · ready to generate proposal',
    ],
    'm3.3': [
        'Scanning BOM for duplicate line items',
        'Checking non-catalog pricing vs manufacturer price books',
        'Validating quantity consistency — SIF vs quote',
        'BOM validation complete · 1 non-catalog item flagged · vendor quote needed',
    ],
    'm3.5': [
        'Vendor quote PDF detected · reading attachment',
        'Extracting SKU · unit price · lead time · MOQ',
        'Matching quote to flagged NC-004 line item',
        'Data confirmed · SIF entry ready · no manual re-entry needed',
    ],
    'm3.4': [
        'Project Manager signed off · proposal ready to send',
        'Transmitting EDI to manufacturers that support it',
        'Drafting non-EDI POs for the rest',
        'Account Manager pinged · tour complete',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const MBI_SELF_INDICATED: string[] = [
    'm2.1', 'm2.3', 'm2.4', 'm2.5',
    'm3.3', 'm3.5', 'm3.2', 'm3.6', 'm3.4',
];
