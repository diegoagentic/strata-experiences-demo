// ═══════════════════════════════════════════════════════════════════════════════
// COI — Demo Profile
// Tailored to COI stakeholder priorities: Acknowledgement processing,
// quote ingestion, shipment visibility, customer communication, reporting.
// Reuses existing simulation apps with COI-specific narrative.
//
// AI Automation + Expert-in-the-Loop (HITL) per step:
// Flow 1: 6 auto + 5 HITL + 2 CRM — email→extraction→normalization→quote→PO→CRM
// Flow 2: ~95% auto PO vs Ack comparison + 1 CRM sync
// Flow 3: AI validates docs + business rules + 1 CRM traceability
// CRM steps integrated at end of each flow — data flows without re-entry
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const COI_DEMO_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // FLOW 1: RFQ → PO Processing (11 + 2 CRM = 13 steps)
    // 6 automated + 5 HITL
    // Addresses: #4 PDF/email quote ingestion, #5 reduce double entry,
    //            #9 better customer quote, #10 familiar interfaces
    // ═══════════════════════════════════════════
    {
        id: '1.1',
        groupId: 1,
        groupTitle: 'Flow 1: Quote Ingestion to Purchase Order',
        title: 'Email Ingestion',
        description: 'System detects incoming email with RFQ, identifies PDF spec + CSV attachments. Strata queues for AI processing — no manual download or re-entry needed.',
        app: 'email-marketplace',
        role: 'Dealer',
        highlightId: 'email-rfq-incoming'
    },
    {
        id: '1.2',
        groupId: 1,
        groupTitle: 'Flow 1: Quote Ingestion to Purchase Order',
        title: 'AI Extraction',
        description: '5 AI agents: OCR processes PDF, TextExtract parses CSV, extracts 200 line items, maps 4 delivery zones. Data converted to structured SIF format for 2020 Worksheet — fully automated, no human intervention.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'kanban-ai-extraction'
    },
    {
        id: '1.3',
        groupId: 1,
        groupTitle: 'Flow 1: Quote Ingestion to Purchase Order',
        title: 'Normalization',
        description: '4 AI agents: DataNormalizationAgent unifies data, generates confidence score per field, flags missing fields. 94% accuracy overall. Low-confidence items escalate as "Needs Attention" for expert review.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'kanban-normalization'
    },
    {
        id: '1.4',
        groupId: 1,
        groupTitle: 'Flow 1: Quote Ingestion to Purchase Order',
        title: 'Quote Draft',
        description: 'QuoteBuilder Agent auto-generates quote draft with pricing rules, applies volume discounts. Freight routing for multi-zone delivery requires human validation. Expert decides: "Route to Expert Hub" if exceptions exist.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'kanban-quote-draft'
    },
    {
        id: '1.5',
        groupId: 1,
        groupTitle: 'Flow 1: Quote Ingestion to Purchase Order',
        title: 'Expert Review (HITL)',
        description: 'QuotePricingAgent validated 8 items, avg discount 60.8%. Flag: lounge seating 58% < standard 62%. Flag: Freight LTL $2,450 for Austin, TX due to building restrictions. Expert inputs freight rate manually, reviews warranties, approves corrections. Audit trail records each decision.',
        app: 'expert-hub',
        role: 'Expert',
        highlightId: 'expert-validation-row'
    },
    {
        id: '1.6',
        groupId: 1,
        groupTitle: 'Flow 1: Quote Ingestion to Purchase Order',
        title: 'Approval Chain',
        description: 'Policy Engine auto-approves: VP Operations → auto, CFO → auto. 3-level automatic chain completes without human intervention — visual progression shown in real time.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'approval-chain-progress'
    },
    {
        id: '1.7',
        groupId: 1,
        groupTitle: 'Flow 1: Quote Ingestion to Purchase Order',
        title: 'Dealer Approval',
        description: 'AI pre-fills summary: total value $43,750, margin 35.4%, key metrics highlighted. Dealer reviews and approves final quote with one click.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'manager-approval-view'
    },
    {
        id: '1.8',
        groupId: 1,
        groupTitle: 'Flow 1: Quote Ingestion to Purchase Order',
        title: 'Sales Approval (Mobile)',
        description: 'Automatic push notification sent to mobile device. End User taps "Acknowledge" from their phone — simplified view with products and delivery timeline, not technical line items.',
        app: 'dashboard',
        role: 'End User',
        highlightId: 'mobile-dealer-approval'
    },
    {
        id: '1.9',
        groupId: 1,
        groupTitle: 'Flow 1: Quote Ingestion to Purchase Order',
        title: 'PO Generation',
        description: 'Fully automated: generates PO, maps 5 SKUs, executes 3-level approval chain, transmits to supplier. Zero re-entry — data flows from vendor PDF to PO without manual re-typing.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'po-order-approval'
    },
    {
        id: '1.10',
        groupId: 1,
        groupTitle: 'Flow 1: Quote Ingestion to Purchase Order',
        title: 'Smart Notifications',
        description: 'AI digests by role: Dealer receives lifecycle summary, Expert receives only exceptions by priority. Consistent nationwide communication — informational, no action required.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'action-center-notifications'
    },
    {
        id: '1.11',
        groupId: 1,
        groupTitle: 'Flow 1: Quote Ingestion to Purchase Order',
        title: 'Pipeline View',
        description: 'New order card appears in pipeline with animated column transition. Full traceability from original vendor email to PO. Project info auto-flows to CRM — no separate data entry needed.',
        app: 'expert-hub',
        role: 'Dealer',
        highlightId: 'order-pipeline-view'
    },
    // CRM: Project Auto-Created (integrated at end of Flow 1)
    {
        id: '1.12',
        groupId: 1,
        groupTitle: 'Flow 1: Quote Ingestion to Purchase Order',
        title: 'CRM: Project Auto-Created',
        description: 'ProjectCreationAgent auto-creates CRM project from approved quote. Data flows: Customer "Apex Furniture", Quote #QT-1025 ($43,750), PO #ORD-2055, 200 line items across 4 delivery zones. Project record populated with all customer and product data — zero manual CRM entry required.',
        app: 'crm',
        role: 'Sales Rep',
        highlightId: 'crm-project-created'
    },
    {
        id: '1.13',
        groupId: 1,
        groupTitle: 'Flow 1: Quote Ingestion to Purchase Order',
        title: 'CRM: Customer 360 Updated',
        description: 'CustomerIntelligenceAgent updates Apex Furniture profile: new project linked, purchase history updated ($1.2M lifetime value across 5 projects), contact info cross-referenced with dealer system. Sales Rep reviews unified customer view — all data aggregated from Dealer Experience, Expert Hub, and quote system.',
        app: 'crm',
        role: 'Sales Rep',
        highlightId: 'crm-customer-360'
    },

    // ═══════════════════════════════════════════
    // FLOW 2: PO & Acknowledgement Comparison (7 + 1 CRM = 8 steps)
    // AI eliminates ~95% of manual PO vs Acknowledgement work
    // Addresses: #1 AI acknowledgement processing (highest priority),
    //            #2 shipment/order visibility, #3 customer communication
    // ═══════════════════════════════════════════
    {
        id: '2.1',
        groupId: 2,
        groupTitle: 'Flow 2: Acknowledgement Processing & Visibility',
        title: 'Acknowledgement Intake',
        description: 'EDI/855 automatic intake. AIS (50 line items, $65K) + HAT (5 line items, $8K) arrive in the pipeline. Both queued for AI comparison — monitoring only, no human action.',
        app: 'expert-hub',
        role: 'System',
        highlightId: 'ack-pipeline-intake'
    },
    {
        id: '2.2',
        groupId: 2,
        groupTitle: 'Flow 2: Acknowledgement Processing & Visibility',
        title: 'Smart Comparison',
        description: '8 AI agents: EDI normalization from eManage ONE. HAT: AI-trained — color "Warm Grey 4" vs "Folkstone Grey" → same part# → auto-confirms at 91% confidence. AIS: grommet configuration error → flagged as discrepancy. Expert sees results: HAT = green "Confirmed", AIS = red "Discrepancy".',
        app: 'expert-hub',
        role: 'System',
        highlightId: 'ack-dual-normalization'
    },
    {
        id: '2.3',
        groupId: 2,
        groupTitle: 'Flow 2: Acknowledgement Processing & Visibility',
        title: 'Delta Engine',
        description: 'AI auto-corrections shown: (1) Grommet error → AI auto-corrects config, (2) Date shifts +14d and +11d → auto-accepted as routine. Escalated: Qty shortfall 8→6 and 4→2 → exceeds threshold → escalates to Expert. Expert sees options: Accept new date / Expedite (+$800) / Cancel.',
        app: 'expert-hub',
        role: 'System',
        highlightId: 'ack-delta-results'
    },
    {
        id: '2.4',
        groupId: 2,
        groupTitle: 'Flow 2: Acknowledgement Processing & Visibility',
        title: 'Expert Review — 50 Lines (HITL)',
        description: 'DiscrepancyResolverAgent pre-analyzed: Azure fabric ≈ Navy (same price $89, same lead time). AI suggestions with confidence scores (91%, 76%). Expert reviews side-by-side PO vs Acknowledgement, can: accept AI correction (✓), reject (✗), edit fields, add notes. 50 line items with flagged rows highlighted. Audit log records each action.',
        app: 'expert-hub',
        role: 'Expert',
        highlightId: 'expert-ack-review'
    },
    {
        id: '2.5',
        groupId: 2,
        groupTitle: 'Flow 2: Acknowledgement Processing & Visibility',
        title: 'Authorization Chain',
        description: '3-approver chain runs automatically (5s intervals). Approvals based on business rules and dollar thresholds — no human intervention needed.',
        app: 'expert-hub',
        role: 'System',
        highlightId: 'backorder-approval-chain'
    },
    {
        id: '2.6',
        groupId: 2,
        groupTitle: 'Flow 2: Acknowledgement Processing & Visibility',
        title: 'Pipeline Resolution',
        description: 'HAT → Confirmed column. AIS → Partial column (quantity shortfall). Order status updated across all systems — customer portal reflects current state. Informational view.',
        app: 'expert-hub',
        role: 'Dealer',
        highlightId: 'ack-pipeline-resolved'
    },
    {
        id: '2.7',
        groupId: 2,
        groupTitle: 'Flow 2: Acknowledgement Processing & Visibility',
        title: 'Smart Notifications',
        description: '"2 Acknowledgements processed, 1 clean, 1 with 3 exceptions resolved" (Dealer digest). Expert receives only exceptions by priority. Consistent communication across all roles — informational.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'action-center-ack-notify'
    },
    // CRM: Order Lifecycle Synced (integrated at end of Flow 2)
    {
        id: '2.8',
        groupId: 2,
        groupTitle: 'Flow 2: Acknowledgement Processing & Visibility',
        title: 'CRM: Order Lifecycle Synced',
        description: 'OrderSyncAgent updates CRM project timeline: AIS acknowledgment (50 lines, $65K) — 3 exceptions resolved, delivery dates adjusted +14d. HAT acknowledgment (5 lines, $8K) — confirmed, on schedule. Project "Apex HQ Office Renovation" timeline auto-updated with actual delivery milestones. Customer portal reflects current status.',
        app: 'crm',
        role: 'System',
        highlightId: 'crm-order-synced'
    },

    // ═══════════════════════════════════════════
    // FLOW 3: Punch List / Warranty Claims (5 + 1 CRM = 6 steps)
    // AI validates docs + business rules, expert resolves exceptions
    // Addresses: #6 reporting automation, #7 consistent reporting,
    //            #2 shipment visibility, #3 customer communication
    // ═══════════════════════════════════════════
    {
        id: '3.1',
        groupId: 3,
        groupTitle: 'Flow 3: Service, Warranty & Reporting',
        title: 'Request Intake (HITL)',
        description: 'AI validates 5 required documents with confidence: Order# ✓98%, Line# ✓96%, Issue photo ✓94%, Label photo ⚠️62% (SKU mismatch potential CC-AZ-2024 vs 2025), Box photo ✗0% (missing). Expert reviews each flag: Label → "May be model year variant, confirm with requester". Box → "Critical for carrier liability, contact requester".',
        app: 'mac',
        role: 'Expert',
        highlightId: 'punch-request-intake'
    },
    {
        id: '3.2',
        groupId: 3,
        groupTitle: 'Flow 3: Service, Warranty & Reporting',
        title: 'Labor Quote Requested',
        description: 'Labor quote requested from certified installer. Strata tracks the request and triggers AI validation when quote arrives.',
        app: 'mac',
        role: 'Expert',
        highlightId: 'punch-labor-requested'
    },
    {
        id: '3.3',
        groupId: 3,
        groupTitle: 'Flow 3: Service, Warranty & Reporting',
        title: 'Labor Review (HITL)',
        description: 'AI validates labor quote against 6 business rules: Repair $510 vs $500 max ⚠️, Trip $175 ✓, Certified Installer ✓, Labor 6hrs vs 4hrs typical ⚠️, Warranty active ✓, No duplicates ✓. 4/6 passed, 2 flagged. Expert chooses from AI suggestions: Repair → [Adjust $495] [Exception $510] [Split 2×$255]. Hours → [4hrs standard] [5hrs partial] [6hrs justified].',
        app: 'mac',
        role: 'Expert',
        highlightId: 'punch-labor-review'
    },
    {
        id: '3.4',
        groupId: 3,
        groupTitle: 'Flow 3: Service, Warranty & Reporting',
        title: 'Claim Submission & Tracking',
        description: 'ClaimSubmissionAgent assembles claim package, forwards photos with SHA256 hashes, verifies ship-to, submits to manufacturer, receives acknowledgement, updates dashboard. Replacement unit tracked — customer sees real-time shipping status. Expert can review liability analysis (optional).',
        app: 'mac',
        role: 'Dealer',
        highlightId: 'punch-claim-submission'
    },
    {
        id: '3.5',
        groupId: 3,
        groupTitle: 'Flow 3: Service, Warranty & Reporting',
        title: 'End User Report (Mobile)',
        description: 'AI generates punch list report with photos, status, timeline. End User reviews on mobile: issue photos, resolution timeline, claim status. Can leave comments before final acknowledgement.',
        app: 'dashboard',
        role: 'End User',
        highlightId: 'mobile-enduser-report'
    },
    // CRM: Service Record Logged (integrated at end of Flow 3)
    {
        id: '3.6',
        groupId: 3,
        groupTitle: 'Flow 3: Service, Warranty & Reporting',
        title: 'CRM: Full Project Traceability',
        description: 'ServiceRecordAgent logs punch list claim against project. Complete lifecycle captured: original email (1.1) → AI extraction (1.2) → quote approval (1.7) → PO generation (1.9) → ack processing (2.4) → warranty claim (3.4). Zero data re-entered across 5 systems. AI generates project health report: $43,750 value, 1 open service claim, 98% delivery complete.',
        app: 'crm',
        role: 'Sales Rep',
        highlightId: 'crm-full-traceability'
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const COI_DEMO_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    // Flow 1: RFQ → PO (6 auto + 5 HITL)
    '1.1': { mode: 'auto', duration: 34, aiSummary: 'System detected email with RFQ — identifying PDF spec + CSV attachments' },
    '1.2': { mode: 'auto', duration: 27, aiSummary: '5 AI agents: OCR processing PDF, TextExtract parsing CSV — extracting 200 line items across 4 delivery zones' },
    '1.3': { mode: 'interactive', userAction: 'Review confidence scores (94% overall). Low-confidence items marked "Needs Attention" — click "Continue to Quote Draft"' },
    '1.4': { mode: 'interactive', userAction: 'Review QuoteBuilder output with pricing rules and volume discounts. Click "Route to Expert Hub" for freight exceptions' },
    '1.5': { mode: 'interactive', userAction: 'Review 8 validated items (avg 60.8% discount). Input freight rate for Austin TX ($2,450 LTL). Click "Approve & Create Quote"' },
    '1.6': { mode: 'auto', duration: 19, aiSummary: 'Policy Engine: VP Operations → auto-approved, CFO → auto-approved. 3-level chain complete' },
    '1.7': { mode: 'interactive', userAction: 'Review AI summary: $43,750 total, 35.4% margin. Click "Approve Quote"' },
    '1.8': { mode: 'interactive', userAction: 'Push notification on mobile — tap "Acknowledge" to confirm order' },
    '1.9': { mode: 'auto', duration: 50, aiSummary: 'Generating PO — mapping 5 SKUs, executing 3-level approval chain, transmitting to supplier. Zero re-entry' },
    '1.10': { mode: 'interactive', userAction: 'Review role-based notification digests: Dealer lifecycle, Expert exceptions only' },
    '1.11': { mode: 'interactive', userAction: 'New order card appears with animated column transition. Click "Send Notifications"' },

    // Flow 2: PO & Acknowledgement Comparison (AI eliminates ~95% manual work)
    '2.1': { mode: 'auto', duration: 14, aiSummary: 'EDI/855 intake: AIS (50 lines, $65K) + HAT (5 lines, $8K) arriving in pipeline' },
    '2.2': { mode: 'interactive', userAction: '8 AI agents completed comparison. HAT = green "Confirmed" (91%). AIS = red "Discrepancy". Click "Review Discrepancies" on AIS' },
    '2.3': { mode: 'interactive', userAction: 'Delta results: grommet auto-corrected, dates +14d/+11d accepted. Qty shortfall 8→6, 4→2 escalated. Choose: Accept / Expedite (+$800) / Cancel' },
    '2.4': { mode: 'interactive', userAction: 'Review 50 line items with AI confidence scores (91%, 76%). Accept ✓, reject ✗, or edit. Click "Send to System of Record"' },
    '2.5': { mode: 'auto', duration: 20, aiSummary: '3-approver authorization chain running (5s intervals) — business rules and dollar thresholds' },
    '2.6': { mode: 'interactive', userAction: 'HAT → Confirmed column. AIS → Partial column. Review pipeline resolution, click "Send Notifications"' },
    '2.7': { mode: 'interactive', userAction: 'Review: "2 Acknowledgements processed, 1 clean, 1 with 3 exceptions resolved"' },

    // Flow 3: Punch List / Warranty (AI validates, expert resolves)
    '3.1': { mode: 'interactive', userAction: 'Review 5-doc validation: Order# ✓98%, Line# ✓96%, Photo ✓94%, Label ⚠️62% (SKU mismatch), Box ✗0%. Resolve flags, click "Validate & Continue"' },
    '3.2': { mode: 'interactive', userAction: 'Presenter describes labor quote process — click Next to continue' },
    '3.3': { mode: 'interactive', userAction: 'Review 6 rules: Repair $510 vs $500 max ⚠️, Hours 6 vs 4 typical ⚠️. Choose AI suggestions: [Adjust $495] [Exception] [Split]. Click "Reviewed and Continue"' },
    '3.4': { mode: 'auto', duration: 24, aiSummary: 'ClaimSubmissionAgent assembling claim with SHA256 hashes, submitting to manufacturer, tracking replacement shipment' },
    '3.5': { mode: 'interactive', userAction: 'AI-generated punch list report on mobile. Review photos, timeline, status. Leave comments, then acknowledge' },

    // CRM steps (integrated at end of each flow)
    '1.12': { mode: 'interactive', userAction: 'Review CRM Dashboard: notification + daily log entry auto-appear. Click "View Full Project" to see full project record with zero manual entry' },
    '1.13': { mode: 'interactive', userAction: 'Review Customer 360: Apex Furniture profile with $1.2M lifetime value, 5 projects, cross-system data aggregated' },
    '2.8': { mode: 'auto', duration: 10, aiSummary: 'OrderSyncAgent: syncing acknowledgment data to CRM project timeline — delivery dates adjusted, status updated' },
    '3.6': { mode: 'interactive', userAction: 'Review complete project traceability: email → extraction → quote → PO → ack → service claim. Zero data re-entered' },
};

// ─── STEP MESSAGES ───────────────────────────────────────────────────────────

export const COI_DEMO_STEP_MESSAGES: Record<string, string[]> = {
    // Flow 1
    '1.1': [
        'Incoming email detected — scanning for RFQ attachments...',
        'Found: PDF spec sheet + CSV price list from manufacturer',
        'Queuing attachments for AI extraction pipeline',
    ],
    '1.2': [
        '5 AI agents activated: OCR processing vendor PDF...',
        'TextExtract parsing CSV — mapping 4 delivery zones',
        'Extracted 200 line items into SIF format — zero manual entry',
    ],
    '1.3': [
        '4 AI agents: DataNormalizationAgent unifying data...',
        'Confidence scoring: 94% overall extraction accuracy',
        'Low-confidence items flagged as "Needs Attention" for expert',
    ],
    '1.4': [
        'QuoteBuilder Agent generating quote draft...',
        'Applying pricing rules and volume discounts',
        'Multi-zone freight routing requires validation — routing to Expert Hub',
    ],
    '1.5': [
        'QuotePricingAgent validated 8 items — avg discount 60.8%',
        'Flag: Lounge seating 58% < standard 62%',
        'Flag: Freight LTL $2,450 for Austin, TX — building restrictions',
        'Expert reviewing — all corrections tracked in audit trail',
    ],
    '1.6': [
        'Policy Engine triggered — 3-level approval chain',
        'VP Operations → auto-approved',
        'CFO → auto-approved',
        'Approval chain complete',
    ],
    '1.7': [
        'AI pre-filled summary: $43,750 total value',
        'Margin analysis: 35.4% — above target',
        'Dealer reviewing final quote — one click to approve',
    ],
    '1.8': [
        'Push notification sent to mobile device...',
        'Simplified view: products + delivery timeline',
        'Waiting for End User acknowledgement',
    ],
    '1.9': [
        'Generating Purchase Order from approved quote...',
        'Mapping 5 SKUs to standardized PO format',
        'Executing 3-level approval chain',
        'PO transmitted to supplier — zero re-entry achieved',
    ],
    '1.10': [
        'AI generating role-based notification digests...',
        'Dealer: lifecycle summary with milestones',
        'Expert: exceptions only, sorted by priority',
    ],
    '1.11': [
        'New order card added to pipeline',
        'Animated column transition — full traceability',
        'CRM project auto-created from quote data',
    ],

    // Flow 2
    '2.1': [
        'EDI/855 intake processing...',
        'AIS: 50 line items, $65K — queued for AI comparison',
        'HAT: 5 line items, $8K — queued for AI comparison',
    ],
    '2.2': [
        '8 AI agents: EDI normalization from eManage ONE...',
        'HAT: "Warm Grey 4" vs "Folkstone Grey" — same part# → auto-confirmed (91%)',
        'AIS: grommet configuration error → flagged as discrepancy',
    ],
    '2.3': [
        'Delta Engine categorizing discrepancies...',
        '(1) Grommet error → AI auto-corrected config',
        '(2) Date shifts +14d, +11d → auto-accepted (routine)',
        'Qty shortfall 8→6, 4→2 → exceeds threshold → escalated to expert',
    ],
    '2.4': [
        'DiscrepancyResolverAgent pre-analyzed: Azure fabric ≈ Navy',
        'Same price $89, same lead time — confidence 91%',
        'Expert reviewing 50 line items with AI assistance',
    ],
    '2.5': [
        '3-approver authorization chain running...',
        'Approver 1 → approved (5s)',
        'Approver 2 → approved (5s)',
        'Approver 3 → approved — chain complete',
    ],
    '2.6': [
        'HAT → moved to Confirmed column',
        'AIS → moved to Partial column (qty shortfall)',
        'Order status updated across all systems',
    ],
    '2.7': [
        'Dealer digest: "2 Acknowledgements processed"',
        '"1 clean, 1 with 3 exceptions resolved"',
        'Expert: exceptions only, sorted by priority',
    ],

    // Flow 3
    '3.1': [
        'AI validating 5 required documents...',
        'Order# ✓98% | Line# ✓96% | Issue photo ✓94%',
        'Label photo ⚠️62% (SKU mismatch CC-AZ-2024 vs 2025)',
        'Box photo ✗0% — missing, critical for carrier liability',
    ],
    '3.2': [
        'Labor quote requested from certified installer...',
        'Strata tracking request — AI validation triggers on arrival',
    ],
    '3.3': [
        'Validating labor quote against 6 business rules...',
        'Repair $510 vs $500 max ⚠️ | Trip $175 ✓ | Certified ✓',
        'Labor 6hrs vs 4hrs typical ⚠️ | Warranty ✓ | No duplicates ✓',
        '4/6 passed — 2 flagged with AI suggestions for expert',
    ],
    '3.4': [
        'ClaimSubmissionAgent assembling claim package...',
        'Forwarding photos with SHA256 hashes — verifying ship-to',
        'Submitted to manufacturer — acknowledgement received',
        'Replacement unit tracked on dashboard — real-time status active',
    ],
    '3.5': [
        'AI generating service report for End User...',
        'Mobile view: issue photos, resolution timeline, claim status',
        'Waiting for End User comments and acknowledgement',
    ],

    // CRM steps (integrated at end of each flow)
    '1.12': [
        'ProjectCreationAgent: mapping quote data to CRM...',
        'Customer: Apex Furniture | Quote #QT-1025 | $43,750',
        'Project "Apex HQ Office Renovation" created — zero manual entry',
    ],
    '1.13': [
        'CustomerIntelligenceAgent: aggregating cross-system data...',
        'Lifetime value: $1.2M | 5 projects | 12 orders',
        'Customer 360 profile ready for review',
    ],
    '2.8': [
        'OrderSyncAgent: linking acknowledgment data to project...',
        'AIS: 50 lines, $65K — 3 exceptions resolved, +14d delivery',
        'HAT: 5 lines, $8K — confirmed, on schedule',
    ],
    '3.6': [
        'ServiceRecordAgent: logging warranty claim to project...',
        'Full lifecycle: email → AI → quote → PO → ack → service',
        'Project health: $43,750 | 98% delivered | 1 open claim',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────
// Steps that handle their own AI indicator in the simulation UI

export const COI_DEMO_SELF_INDICATED: string[] = [
    '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10', '1.11', '1.12', '1.13',
    '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8',
    '3.1', '3.2', '3.3', '3.4', '3.5', '3.6',
];
