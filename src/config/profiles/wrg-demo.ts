// ═══════════════════════════════════════════════════════════════════════════════
// WRG — Demo Profile v8 (BPMN-aligned · see docs/wrg-demo/V8_BPMN_ALIGNMENT_PLAN.md)
//
// FLOW 1 — AI Labor Estimation (internal · BPMN stages 1-14)
//   w1.1: Labor estimation kickoff · David (Senior Estimator) pulls JPS from
//         CORE and runs the dual-engine calc (Delivery Pricer + Labor Worksheet)
//   w1.2: Designer verification · Alex validates the escalated custom item
//
// FLOW 2 — Internal handoff (BPMN stages 15-18)
//   w2.1: Salesperson review · Sara receives the Outlook notification from
//         CORE, reviews the labor estimate, and forwards to SAC
//   w2.2: SAC quote assembly & release · Riley combines labor + product +
//         markup, runs the internal release checklist, and publishes the
//         client quote through CORE
//   w2.3: PM execution handoff · James Ortiz picks up the approved quote
//         and builds the internal execution plan (crews, tools, logistics)
//
// All roles are WRG internal. Client delivery is Phase 2 / out of scope.
//
// CORE constraint: CORE is EXPORT-ONLY. Strata reads files exported from CORE,
// never syncs or integrates directly. See docs/wrg-demo/requirements/CORE_INTEGRATION_CONSTRAINT.md
//
// Data: JPS Health Center for Women — 24 items, 185.04 man-hours, $202,138 proposal
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const WRG_DEMO_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // FLOW 1: AI Labor Estimation
    // Expert + Designer · 2 steps
    // ═══════════════════════════════════════════
    {
        id: 'w1.1',
        groupId: 0,
        groupTitle: 'Flow 1: AI Labor Estimation',
        title: 'Labor estimation kickoff',
        description: 'David, the senior estimator, gets a new project notification and connects to the dealer system to pull in the project brief. The assistant reads the site conditions, imports the product list, classifies every item and drafts the labor estimate. A special item needs a designer to double-check it.',
        app: 'wrg-estimator',
        role: 'Expert',
    },
    {
        id: 'w1.2',
        groupId: 0,
        groupTitle: 'Flow 1: AI Labor Estimation',
        title: 'Designer verification',
        description: 'Alex, the designer, receives the item that needs a second opinion. She reviews the assembly details, confirms how it should be installed and sends her validation back to the estimator.',
        app: 'wrg-estimator',
        role: 'Designer',
    },

    // ═══════════════════════════════════════════
    // FLOW 2: Internal handoff (BPMN stages 15-18)
    // Salesperson → SAC → PM · all internal WRG roles
    // ═══════════════════════════════════════════
    {
        id: 'w2.1',
        groupId: 1,
        groupTitle: 'Flow 2: Internal Handoff',
        title: 'Salesperson review',
        description: 'Sara, the salesperson, gets an alert that the labor estimate is ready. She reviews it, sends a quick question to the estimator about one line, gets the answer back and forwards the estimate to the next person on the team.',
        app: 'wrg-estimator',
        role: 'Dealer',
    },
    {
        id: 'w2.2',
        groupId: 1,
        groupTitle: 'Flow 2: Internal Handoff',
        title: 'Internal release assembly',
        description: 'Riley, the sales coordinator, puts the package together: combines the labor work with the product side, reviews the full breakdown, previews the release document and walks it through the internal sign-off chain before releasing it.',
        app: 'wrg-estimator',
        role: 'Sales Coordinator',
    },
    {
        id: 'w2.3',
        groupId: 1,
        groupTitle: 'Flow 2: Internal Handoff',
        title: 'Execution handoff',
        description: 'James, the project manager, receives the approved package. He reviews the execution plan that was prepared for him (crew, tools, delivery windows, site notes) and accepts the project so the team can start scheduling the work.',
        app: 'wrg-estimator',
        role: 'Project Manager',
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const WRG_DEMO_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'w1.1': { mode: 'interactive', userAction: 'Bring the project in, watch the draft being built, and send the tricky item to the designer' },
    'w1.2': { mode: 'interactive', userAction: 'Check the flagged item and send your validation back to the estimator' },
    'w2.1': { mode: 'interactive', userAction: 'Review the estimate, ask any question that comes up, and forward it on' },
    'w2.2': { mode: 'interactive', userAction: 'Put the full package together and walk it through the internal sign-off' },
    'w2.3': { mode: 'interactive', userAction: 'Review the execution plan and accept the project for scheduling' },
};

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const WRG_DEMO_STEP_MESSAGES: Record<string, string[]> = {
    'w1.1': [
        'Loading project brief from the dealer system…',
        'Importing the product list',
        'Classifying every item by labor category',
        'Checking scope limits',
        'Drafting the estimate',
        'Flagging items that need designer review',
    ],
    'w1.2': [
        'Opening the flagged item on its own',
        'Checking the assembly details',
        'Confirming how it should be installed',
        'Validating the time estimate',
        'Sending the confirmation back',
    ],
    'w2.1': [
        'Notifying the salesperson that the estimate is ready',
        'Opening the estimate for review',
        'Checking it matches the original request',
        'Forwarding to the next person on the team',
    ],
    'w2.2': [
        'Putting the full package together',
        'Applying the contract rules',
        'Previewing the release document',
        'Walking it through the internal sign-off',
        'Releasing the final package',
    ],
    'w2.3': [
        'Notifying the project manager',
        'Preparing the execution plan',
        'Coordinating crew, tools, and delivery windows',
        'Accepting the project for scheduling',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const WRG_DEMO_SELF_INDICATED: string[] = [
    'w1.1', 'w1.2',
    'w2.1', 'w2.2', 'w2.3',
];

// ─── STEP TIMING ─────────────────────────────────────────────────────────────

export interface WrgStepTiming {
    notifDelay: number;     // ms before notification appears
    notifDuration: number;  // ms notification stays before processing
    agentStagger: number;   // ms between each agent appearing
    agentDone: number;      // ms after agent appears before checkmark
    breathing: number;      // ms pause between processing and revealed
    resultsDur: number;     // ms results shown before auto-advance (0 = manual)
}

export const WRG_STEP_TIMING: Record<string, WrgStepTiming> = {
    'w1.1': { notifDelay: 3400, notifDuration: 11900, agentStagger: 2500, agentDone: 1400, breathing: 4300, resultsDur: 0 },
    'w1.2': { notifDelay: 2500, notifDuration: 10100, agentStagger: 2500, agentDone: 1400, breathing: 3400, resultsDur: 0 },
    'w2.1': { notifDelay: 2500, notifDuration: 10100, agentStagger: 2500, agentDone: 1400, breathing: 4300, resultsDur: 0 },
    'w2.2': { notifDelay: 3400, notifDuration: 13500, agentStagger: 0,    agentDone: 0,   breathing: 0,    resultsDur: 0 },
    'w2.3': { notifDelay: 2500, notifDuration: 10100, agentStagger: 0,    agentDone: 0,   breathing: 3400, resultsDur: 0 },
};
