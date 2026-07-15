// ═══════════════════════════════════════════════════════════════════════════════
// WORKSPACES — Workscapes, Inc. · Strata AI Demo Profile
//
// CLIENT: Workscapes, Inc. (Tampa, FL · ~126 employees · ~$60.7M · Women Owned
//         MillerKnoll dealer · 5 Florida locations)
// PREPARED BY: Avanto
// DATE: May 2026
//
// DEMO NARRATIVE: 1 unified flow — the story of a $142.50 expense (John Smith)
//   travelling through 4 roles and 2 platforms, end to end.
//
//   John (Employee, Mobile) submits a receipt → Sarah (Ops Manager, Desktop)
//   approves with receipt inline → John tracks status in real time →
//   Letza (AP Coordinator, Desktop) confirms GL and auto-posts to CORE →
//   Mehmet/Tammy (CFO/CAO, Desktop) see spend dashboard for the first time.
//
// FLOW — Expense Management End to End · 8 scenes (w1.x → w2.x)
//   w1.1: Mobile Submit + OCR — camera capture · AI auto-fill · multi-receipt · notes · Excel
//   w1.2: Approval Queue — manager queue · SLA aging · receipts visible · AS-IS contrast
//   w1.3: Approve with Receipt — inline receipts · approve/reject · resubmit loop
//   w1.4: Expense Status — employee timeline · approved path / returned path · audit trail
//   w2.1: AP Review Queue — GL pre-suggestion · confidence legend · aging · AS-IS contrast
//   w2.2: GL + CORE Sync — GL confidence% · override · auto-post animation
//   w2.3: Admin Self-Service — manager list · categories · hierarchy
//   w2.4: CFO/CAO Dashboard — spend view · filters · trends · drill-down · export
//
// SOT: src/config/profiles/workspaces-data/workspaces-sot.md
// DESIGNER BRIEF: src/config/profiles/workspaces-data/Workscapes_Designer_Brief.html
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const WORKSPACES_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════════════════════════════
    // 1 UNIFIED FLOW: Expense Management End to End
    // Employee → Manager → Employee → AP Coordinator → CFO/CAO
    // ═══════════════════════════════════════════════════════════════════
    {
        id: 'w1.1',
        groupId: 0,
        groupTitle: 'Workscapes · Expense Management End to End',
        title: 'Mobile Submit + OCR',
        description: 'Strata captures a receipt photo and extracts vendor, date, amount, and category automatically — pre-populating the entire form. Employee adds an optional note for context, chooses from four upload options (Camera, Gallery, PDF, Excel), and submits in seconds. The 3-day SLA and approving manager are visible the moment the form is sent.',
        app: 'workspaces-submit',
        role: 'Employee',
    },
    {
        id: 'w1.2',
        groupId: 0,
        groupTitle: 'Workscapes · Expense Management End to End',
        title: 'Approval Queue',
        description: 'The manager\'s approval queue shows all pending expenses with receipts visible inline — no login to another system required. Aging alerts flag reports that have been sitting too long. The new expense arrives via notification with both receipts attached and ready to review without leaving the screen.',
        app: 'workspaces-approval',
        role: 'Operations Manager',
    },
    {
        id: 'w1.3',
        groupId: 0,
        groupTitle: 'Workscapes · Expense Management End to End',
        title: 'Approve with Receipt',
        description: 'The manager sees the receipt directly in the approval screen — not as an email attachment, not in a separate system. One click to approve and route to the accounting team automatically, or return with a required note that notifies the employee immediately and logs the full correction request.',
        app: 'workspaces-approval',
        role: 'Operations Manager',
    },
    {
        id: 'w1.4',
        groupId: 0,
        groupTitle: 'Workscapes · Expense Management End to End',
        title: 'Expense Status',
        description: 'The employee tracks their expense in real time — Submitted, In Review, Approved, Posted, Paid — with a timestamp at every step. Toggle between the approved path (payment issued) and the returned path (rejection note, correction form, resubmit) to show both outcomes.',
        app: 'workspaces-submit',
        role: 'Employee',
    },
    {
        id: 'w2.1',
        groupId: 0,
        groupTitle: 'Workscapes · Expense Management End to End',
        title: 'AP Review Queue',
        description: 'The AP coordinator\'s queue receives all manager-approved expenses with accounting codes pre-suggested by the rules engine. A confidence legend guides attention: ≥90% is safe to confirm, 75–89% warrants a look, <75% needs manual review. The batch that used to take 45 minutes now takes under 5.',
        app: 'workspaces-ap',
        role: 'Accountant',
    },
    {
        id: 'w2.2',
        groupId: 0,
        groupTitle: 'Workscapes · Expense Management End to End',
        title: 'GL + CORE Sync',
        description: 'Strata pre-fills accounting codes per expense line with a confidence percentage from the category rules engine. The coordinator confirms or overrides inline, then approves — triggering an automatic 3-step post to the accounting system (Validate → Create entry → Notify). Manual re-entry eliminated entirely.',
        app: 'workspaces-ap',
        role: 'Accountant',
    },
    {
        id: 'w2.3',
        groupId: 0,
        groupTitle: 'Workscapes · Expense Management End to End',
        title: 'Admin Self-Service',
        description: 'The Parking line just matched at 72% confidence — Letza opens Admin to fix the GL rule directly, no IT ticket needed. She updates the mapping, adjusts the approval managers, and refines the category list. Changes apply immediately: the next parking expense will auto-classify at 97%+. Self-service configuration that used to take two weeks now takes two minutes.',
        app: 'workspaces-ap',
        role: 'Accountant',
    },
    {
        id: 'w2.4',
        groupId: 0,
        groupTitle: 'Workscapes · Expense Management End to End',
        title: 'CFO / CAO Dashboard',
        description: 'After Letza confirms GL codes and improves the Parking rule, the CFO receives a real-time notification: May cycle closed — 23 expenses posted, all receipts verified, 1 GL rule improved. The dashboard aggregates spend by category with month-over-month comparison, surfaces SLA outliers, and has the full report ready to export. Switch to Tammy\'s view to see how Ops & Procurement performed.',
        app: 'workspaces-reporting',
        role: 'CFO',
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const WORKSPACES_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'w1.1': { mode: 'interactive', userAction: 'Snap the receipt — watch Strata auto-fill all fields · add an optional note · choose upload method · submit to the reviewing manager · see the expected approval window' },
    'w1.2': { mode: 'interactive', userAction: 'See the manager queue — the new expense arrives with receipts inline · notice the aging alert · click Review to open it' },
    'w1.3': { mode: 'interactive', userAction: 'Review the receipt inline · approve to route to the accounting team — or try the return path to see the correction loop' },
    'w1.4': { mode: 'interactive', userAction: 'Track expense status · toggle between Approved path (payment issued) and Returned path (rejection note → correction → resubmit)' },
    'w2.1': { mode: 'interactive', userAction: 'Review the AP queue — accounting codes pre-suggested per expense · read the confidence legend · click Review on the low-confidence line' },
    'w2.2': { mode: 'interactive', userAction: 'Review accounting codes with confidence percentages · override if needed · confirm and watch the 3-step auto-post to the accounting system' },
    'w2.3': { mode: 'interactive', userAction: 'Parking matched at 72% → click the rule to fix it · update managers if needed · see changes apply live · no IT ticket' },
    'w2.4': { mode: 'interactive', userAction: 'Tap the notification — cycle summary shows 23 expenses + 1 GL rule improved · filter by dept · drill into Fuel · preview the full report · switch to Tammy\'s division view' },
};

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const WORKSPACES_STEP_MESSAGES: Record<string, string[]> = {
    'w1.1': [
        'Analyzing receipt image',
        'Extracting vendor, date, and amount',
        'Matching category from expense rules',
        'Form pre-populated · receipt attached · ready to submit',
    ],
    'w1.2': [
        'Loading pending approval queue',
        'Attaching receipts to each approval card',
        'Checking SLA age for all pending reports',
        'Queue ready · 1 SLA alert · receipts visible inline',
    ],
    'w1.3': [
        'Loading expense detail for review',
        'Verifying receipt attachments',
        'Preparing approval action',
        'Ready to approve · return will trigger resubmit loop',
    ],
    'w1.4': [
        'Fetching expense status from platform',
        'Building status timeline with timestamps',
        'Calculating average payment time',
        'Status timeline ready · audit trail complete',
    ],
    'w2.1': [
        'Loading manager-approved expenses',
        'Running GL rules engine on each expense',
        'Pre-filling GL codes by category',
        'AP queue ready · GL pre-suggested · aging flags applied',
    ],
    'w2.2': [
        'Loading expense lines for accounting code review',
        'Calculating confidence by category match',
        'Verifying receipt attachments for AP',
        'Accounting codes ready · confirm or override · auto-post queued',
    ],
    'w2.3': [
        'Loading admin configuration',
        'Fetching current manager list',
        'Loading expense categories and hierarchy',
        'Admin panel ready · all sections editable',
    ],
    'w2.4': [
        'Aggregating expense data from CORE',
        'Building spend breakdown by category',
        'Calculating SLA compliance and aging',
        'Dashboard ready · company view + division rollup · export available',
    ],
};

// ─── DATA THREADS ─────────────────────────────────────────────────────────────
// Mini-summaries shown in DemoSidebar when a step is completed.
// All reference the same $142.50 expense to reinforce the narrative thread.

export const WORKSPACES_DATA_THREADS: Record<string, string> = {
    'w1.1': 'Receipt captured · expense submitted · manager notified',
    'w1.2': 'Queue reviewed · expense ready for approval decision',
    'w1.3': 'Approved · routed to AP queue automatically',
    'w1.4': 'Status visible · payment timeline confirmed',
    'w2.1': 'Accounting codes pre-filled · AP queue ready',
    'w2.2': 'Entry posted to accounting system · no re-entry',
    'w2.3': 'Configuration updated · live immediately',
    'w2.4': 'CFO + division spend visibility · dashboard active',
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────
// Steps that handle their own AI indicator (don't use DemoAIIndicator default)

export const WORKSPACES_SELF_INDICATED: string[] = [
    'w1.1', // OCR animation handles its own AI reveal
    'w1.2', // Notification card inside the scene replaces the banner
    'w1.3', // Approve/reject scenario toggle is self-indicating
    'w1.4', // Push notification inside the scene is self-indicating
    'w2.1', // Scene has its own queue indicators
    'w2.2', // CORE post animation handles its own AI reveal
    'w2.3', // Admin scene is self-explanatory
    'w2.4', // Dashboard scene has its own filter/action affordances
];
