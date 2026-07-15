// ═══════════════════════════════════════════════════════════════════════════════
// CLC — Creative Library Concepts · Strata AI Multi-Flow Demo Profile
//
// CLIENT: Creative Library Concepts (Manalapan NJ · 12 employees · founded 1993
//         ~$7-10M revenue · NY/NJ/PA · 100+ manufacturer partners · privately owned)
//
// DEMO PROCESS: 4 parallel flows operating on top of IQ (read-only API) + QuickBooks
//               (integrated to IQ) + Microsoft 365 (Outlook · SharePoint · OneDrive)
//               + CET (designers → SIF → IQ)
//
// PROTAGONIST: Director of Operations · joined Aug 2025 · 18yr industry vet ·
//              SOP standardization lead · drives all 3 operational flows
// CO-PROTAGONIST: Office Director · 14yr CLC tenure · runs accounting/invoicing ·
//                 IQ champion
//
// DEMO CLIENT (anchor): Fairport Public Library (Fairport NY) · Tappé Architects ·
//                       SWBR Architects & Engineers · 5 vendors on state contracts
//                       (TMC · KI · Smith System · Media Tech · Aurora)
//
// STRUCTURE: 12 steps across 4 flows
//
//   Group 1 — Calendar Sync (Flow 1)        clc1.1 → clc1.4   (IQ → Outlook)
//   Group 2 — SharePoint Seeding (Flow 2)   clc2.1 → clc2.3   (IQ → SharePoint)
//   Group 3 — Intake Validation (Flow 3)    clc3.1 → clc3.3   (Survey ↔ IQ)
//   Group 4 — Data Lake Dashboard (Flow 4)  clc4.1            (persistent tab)
//
// STAKEHOLDER PAIN MAP (from Avanto discovery call · 2026-05-27):
//   #1 Calendar visibility → clc1.* "if it happened tomorrow, would be huge"
//   #2 SharePoint seeding  → clc2.* installer iPad pain
//   #3 Intake gaps         → clc3.* "stuff slipping through, can't close gaps"
//   #4 Data foundation     → clc4.* enabler for 1-3, plus future agentic AI
//
// HARD CONSTRAINTS:
//   - IQ API is read-only · all "write-back" demos render as "Queued for IQ
//     batch sync" (mock · not a real API write)
//   - State-contract structure means 1 customer project = up to 5 IQ jobs
//     (one per vendor) · customer tags linkage
//   - Role labels only · no proper names (matches Officeworks convention)
//   - No auto-send (mirrors industry constraint · drafts only)
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const CLC_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // GROUP 1: Calendar Sync (Flow 1) · IQ → Outlook
    // ═══════════════════════════════════════════
    {
        id: 'clc1.1',
        groupId: 1,
        groupTitle: 'Calendar Sync',
        title: 'Pull install schedule from IQ',
        description: 'Strata pulls ship/install dates from IQ for all active jobs · 14 jobs across NY/NJ/PA · last sync 2 minutes ago. The Director of Operations starts the week reviewing capacity instead of building a manual Outlook calendar from a spreadsheet export.',
        app: 'clc-calendar',
        role: 'Director of Operations',
        flowId: 'calendar',
    },
    {
        id: 'clc1.2',
        groupId: 1,
        groupTitle: 'Calendar Sync',
        title: 'Publish to Outlook calendar · visual load view',
        description: 'Strata renders the install jobs on an Outlook-style week view · color-coded by region (NY/NJ/PA) · Sparkles on jobs Strata pre-scheduled from IQ data. Now the operator sees "3 jobs first week of June" at a glance instead of reading a date list.',
        app: 'clc-calendar',
        role: 'Director of Operations',
        flowId: 'calendar',
    },
    {
        id: 'clc1.3',
        groupId: 1,
        groupTitle: 'Calendar Sync',
        title: 'Drag-drop reschedule · AI-suggested slot',
        description: 'Strata flags week-of-Jun-1 NY capacity (Jamestown · Fairport · Troy · Brockport stack up) and suggests rescheduling Fairport to Mon Jun 8 (NJ-only week). Drop on the highlighted ghost slot, confirm, and queue for the nightly IQ batch sync · IQ has no write-back API so the platform stages the change.',
        app: 'clc-calendar',
        role: 'Director of Operations',
        flowId: 'calendar',
    },
    {
        id: 'clc1.4',
        groupId: 1,
        groupTitle: 'Calendar Sync',
        title: 'Capacity warning · third-party installer trigger',
        description: 'NY region overloaded the week of Jun 1 · 3 jobs back-to-back · in-house crew at 100%. Strata flags the conflict and suggests Albany Install Co. (vetted third-party · 4hr radius · prior 7 jobs). One click drafts the outreach email · drafts only · operator reviews and sends.',
        app: 'clc-calendar',
        role: 'Director of Operations',
        flowId: 'calendar',
    },

    // ═══════════════════════════════════════════
    // GROUP 2: SharePoint Seeding (Flow 2) · IQ → SharePoint
    // ═══════════════════════════════════════════
    {
        id: 'clc2.1',
        groupId: 2,
        groupTitle: 'SharePoint Seeding',
        title: 'Job hits Scheduled · seed installer folder',
        description: 'Fairport Public Library install is now in "Scheduled" status in IQ · Strata triggers folder seeding. The installer needs every shop drawing, ACK, and runbook on his iPad before Jun 2 · today this takes 30+ minutes of copy/paste across 5 separate IQ jobs.',
        app: 'clc-sharepoint',
        role: 'Director of Operations',
        flowId: 'sharepoint',
    },
    {
        id: 'clc2.2',
        groupId: 2,
        groupTitle: 'SharePoint Seeding',
        title: 'Consolidate 5 IQ jobs · exclude 2 unrelated',
        description: 'State contract structure: Fairport spans 5 IQ jobs (TMC · KI · Smith System · Media Tech · Aurora). Customer has 2 unrelated punch orders (Tappé · SWBR Q4) tagged differently · Strata excludes them automatically with rationale shown. Operator reviews the 5 in / 2 out decisions.',
        app: 'clc-sharepoint',
        role: 'Director of Operations',
        flowId: 'sharepoint',
    },
    {
        id: 'clc2.3',
        groupId: 2,
        groupTitle: 'SharePoint Seeding',
        title: 'Review consolidated assets · publish to SharePoint',
        description: '8 shop drawings · 5 ACKs · 1 site plan · 1 runbook · all pulled from the 5 IQ jobs. Operator previews each PDF inline · Sparkles on the ACK Strata flagged (KI vendor short-ship · operator acknowledges or removes). Then publishes the folder to SharePoint · installer notified via Outlook with iPad-ready link · single source for the install day.',
        app: 'clc-sharepoint',
        role: 'Director of Operations',
        flowId: 'sharepoint',
    },

    // ═══════════════════════════════════════════
    // GROUP 3: Intake Validation (Flow 3) · Survey ↔ IQ
    // ═══════════════════════════════════════════
    {
        id: 'clc3.1',
        groupId: 3,
        groupTitle: 'Intake Validation',
        title: 'Award received · pick delivery channel',
        description: 'Fairport just awarded · 10-question site-conditions survey ready to send. Strata flags the phishing concern with direct email links and recommends delivery through the customer\'s existing platform (Procore · Teams · OneDrive shared). Operator picks the channel.',
        app: 'clc-intake',
        role: 'Director of Operations',
        flowId: 'intake',
    },
    {
        id: 'clc3.2',
        groupId: 3,
        groupTitle: 'Intake Validation',
        title: 'Customer survey · 10 site-conditions questions',
        description: 'Conversational survey delivered to the library project lead · 10 questions covering site contact, elevator, floor, loading dock, building hours, renovation status, ready-date, day-of-install contact, special access. Strata captures answers and flags anything ambiguous.',
        app: 'clc-intake',
        role: 'Director of Operations',
        flowId: 'intake',
    },
    {
        id: 'clc3.3',
        groupId: 3,
        groupTitle: 'Intake Validation',
        title: 'Reconcile survey vs IQ · queue corrections',
        description: 'Two-column diff · IQ value (left) vs survey answer (right) · status chips per field. 3 IQ fields are blank, 2 mismatched, 5 match. Operator resolves each row · approved changes queue for IQ batch sync · the "validated project record" payload drops to the project file.',
        app: 'clc-intake',
        role: 'Director of Operations',
        flowId: 'intake',
    },

    // ═══════════════════════════════════════════
    // GROUP 4: Data Lake Dashboard (Flow 4) · persistent
    // ═══════════════════════════════════════════
    {
        id: 'clc4.1',
        groupId: 4,
        groupTitle: 'Data Lake Dashboard',
        title: 'Operational dashboard · KPIs pulling from IQ + QuickBooks + M365',
        description: 'Persistent dashboard backed by the data lake that powers the other 3 flows · install cycle time · punch-order backlog · regional load · intake completeness. Source chips on every panel make the data foundation visible. The Office Director uses this for weekly ops review.',
        app: 'clc-dashboard',
        role: 'Office Director',
        flowId: 'data-lake',
    },

];

// ─── STEP BEHAVIOR (presenter guide · action-forward) ────────────────────────

export const CLC_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'clc1.1': { mode: 'interactive', userAction: 'Open the IQ source list · confirm 14 jobs pulled · proceed to publish' },
    'clc1.2': { mode: 'interactive', userAction: 'Review the Outlook week view · Sparkles on Strata-scheduled jobs · scan by region' },
    'clc1.3': { mode: 'interactive', userAction: 'Drag the Fairport card from Jun 2 to Jun 5 · confirm "Queued for IQ batch sync" chip appears' },
    'clc1.4': { mode: 'interactive', userAction: 'Expand the NY region warning · review the third-party installer suggestion · open the draft email' },

    'clc2.1': { mode: 'interactive', userAction: 'Open the Scheduled trigger · review the Fairport job hitting the seed condition' },
    'clc2.2': { mode: 'interactive', userAction: 'Review the 5 IQ jobs included · check the 2 excluded with tag-mismatch rationale · proceed' },
    'clc2.3': { mode: 'interactive', userAction: 'Preview the staged assets · acknowledge or remove the Strata-flagged ACK · review the SharePoint URL + installer notification draft · publish the folder' },

    'clc3.1': { mode: 'interactive', userAction: 'Read the phishing-risk warning · pick the recommended platform delivery channel' },
    'clc3.2': { mode: 'interactive', userAction: 'Watch the conversational survey play through · 10 questions · customer answers stream in' },
    'clc3.3': { mode: 'interactive', userAction: 'Review the 10-field diff · resolve the 2 mismatches · approve the IQ batch-sync queue' },

    'clc4.1': { mode: 'interactive', userAction: 'Open the Dashboard tab · scan 4 KPIs · drill into the at-risk Fairport row' },
};

// ─── STEP MESSAGES (AI agent progress · short, status-style) ─────────────────

export const CLC_STEP_MESSAGES: Record<string, string[]> = {
    'clc1.1': [
        'Pulling install schedule from IQ · 14 jobs active',
        'Last sync · 2 minutes ago',
        'NY region · 6 jobs · NJ · 5 · PA · 3',
        'Cross-checking ship dates vs install dates · all aligned',
        'Ready to publish to Outlook',
    ],
    'clc1.2': [
        'Building Outlook week view · Jun 1-Jul 12 (6 weeks)',
        'Color-coding by region · NY blue · NJ amber · PA green',
        'Fairport Public Library · Jun 2 · NY · 5 IQ jobs linked',
        'Sparkles on 11 of 14 jobs · Strata pre-scheduled from IQ data',
        'Capacity overlay computed · 1 conflict surfaced for clc1.4',
    ],
    'clc1.3': [
        'Drag detected · Fairport Public Library · Jun 2 → Jun 5',
        'Checking conflicts · Jun 5 NY slot available · 1 crew open',
        'IQ API is read-only · staging change as queued batch sync',
        'Queued for IQ batch sync · nightly window 2am ET',
        'Operator can revert from the source list before sync runs',
    ],
    'clc1.4': [
        'Capacity alert · NY region · week of Jun 1',
        '3 jobs back-to-back · in-house crew at 100%',
        'Searching vetted third-party installers · radius 4h',
        'Match · Albany Install Co. · 7 prior CLC jobs · COI on file',
        'Drafting outreach email · drafts only · operator reviews and sends',
    ],
    'clc2.1': [
        'IQ status change detected · Fairport · "Scheduled"',
        'Trigger fired · folder seeding kicked off',
        'Customer tag · "Fairport Library Phase 1"',
        'Looking for linked IQ jobs via customer tag',
        'Found 5 related jobs · 2 unrelated to exclude',
    ],
    'clc2.2': [
        'IQ jobs included · J-44021 (TMC) · J-44022 (KI) · J-44023 (Smith System)',
        'IQ jobs included · J-44024 (Media Tech) · J-44025 (Aurora)',
        'IQ jobs excluded · J-43901 (Tappé · punch order · different tag)',
        'IQ jobs excluded · J-44510 (SWBR · Q4 project · future ready-date)',
        'Rationale shown inline · operator can override',
    ],
    'clc2.3': [
        'Staging 15 assets from the 5 IQ jobs',
        '8 shop drawings · 5 ACKs · 1 site plan · 1 runbook',
        'Sparkles on J-44022 ACK · vendor short-ship flagged',
        'Generating thumbnails · PDF preview ready',
        'Operator acknowledges or removes the flagged ACK',
        'Publishing to SharePoint · /sites/Installs/Fairport-Library-Phase1/',
        'Setting permissions · install crew + Director of Operations',
        'Folder live · installer notification queued for review',
    ],
    'clc3.1': [
        'Fairport awarded · 10-question survey ready',
        'Phishing risk · direct email links flagged by major spam filters',
        'Customer uses Procore · already authenticated · trusted source',
        'Recommendation · deliver via Procore project channel',
        'Operator picks channel · platform delivery default',
    ],
    'clc3.2': [
        'Survey delivered via Procore · 10 questions',
        'Question 1 · site contact name + mobile · answered',
        'Question 4 · freight elevator (Y/N + dimensions) · answered',
        'Question 8 · floor ready-date · "Jun 1, 2026"',
        'All 10 answers received · ready for reconciliation',
    ],
    'clc3.3': [
        'Reconciling survey vs IQ · 10 fields compared',
        'Match · 5 fields (vendor name · address · floor · payment terms · subtotal)',
        'Mismatch · 2 fields (ready-date · day-of-install contact)',
        'IQ blank · 3 fields (elevator dimensions · loading dock · after-hours surcharge)',
        'Operator resolves each row · approved changes queue for IQ batch sync',
    ],
    'clc4.1': [
        'Data lake online · IQ + QuickBooks + Outlook + SharePoint + CET',
        'KPIs computed · avg install cycle 18d · target 14d',
        'Punch backlog · $42K open · 4 projects in 31-60d bucket',
        'Regional load · NY at 92% · NJ at 71% · PA at 54%',
        'Intake completeness · 86% post-Strata · was 41% pre-Strata',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const CLC_SELF_INDICATED: string[] = [
    'clc1.1', 'clc1.2', 'clc1.3', 'clc1.4',
    'clc2.1', 'clc2.2', 'clc2.3',
    'clc3.1', 'clc3.2', 'clc3.3',
    'clc4.1',
];
