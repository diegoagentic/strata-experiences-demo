// ═══════════════════════════════════════════════════════════════════════════════
// OPS — Demo Profile (Demo 2)
// Tailored to OPS stakeholder priorities: Receiving→Invoice automation,
// Change Order management, QuickBooks integration, financial command center.
//
// Closes gaps from Demo 1 (COI):
//   Req #2: Cost/Sell per line item (steps 1.4, 2.3)
//   Req #3: Receiving → Invoice from actual monthly services (steps 1.1→1.5)
//   Req #5: QuickBooks hero moment — $60,250 batch sync (steps 1.6, 3.2)
//   NEW:    Multi-project financial dashboard for CFO/Controller (steps 3.1→3.3)
//
// AI Automation + Expert-in-the-Loop (HITL) per flow:
// Flow 1: 3 auto + 3 HITL + 2 interactive — Delivery→3-Way Match→Invoice→QB
// Flow 2: 2 auto + 1 HITL + 1 interactive — CO Request→Delta→Approval→Amendment
// Flow 3: 0 auto + 3 interactive — Financial Dashboard, QB Recon, Budget vs Actual
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const OPS_DEMO_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // FLOW 1: Receiving & Invoice Automation (7 steps + 1 CRM = 8 steps)
    // 3 automated + 3 HITL + 2 interactive
    // Closes: Req #3 (Receiving→Invoice), Req #2 (Cost/Sell per line)
    // ═══════════════════════════════════════════
    {
        id: '1.1',
        groupId: 1,
        groupTitle: 'Flow 1: Receiving & Invoice Automation',
        title: 'Delivery Notice Ingested',
        description: 'ReceivingAgent auto-ingests ASN (Advance Shipment Notice) from supplier. Carrier confirms delivery of ORD-2055: 50 items across 3 shipments. System cross-references PO, matches line items, flags quantity differences. 14 agents processing in parallel — no manual document handling.',
        app: 'expert-hub',
        role: 'System',
        highlightId: 'receiving-agent-pipeline',
    },
    {
        id: '1.2',
        groupId: 1,
        groupTitle: 'Flow 1: Receiving & Invoice Automation',
        title: 'Receiving Doc Review',
        description: 'ReceivingDocAgent presents PO ↔ Delivery Receipt comparison: 47 lines auto-matched, 3 flagged. Flag 1: Task chairs 18/20 received — partial delivery (94% confidence). Flag 2: Delivery date 3 days early vs PO — auto-acceptable. Flag 3: Qty shortfall 2 units — AI suggests "Accept and note for invoice adjustment". Expert reviews flags, accepts or overrides — audit trail recorded.',
        app: 'expert-hub',
        role: 'Expert',
        highlightId: 'receiving-doc-review',
    },
    {
        id: '1.3',
        groupId: 1,
        groupTitle: 'Flow 1: Receiving & Invoice Automation',
        title: '3-Way Match Engine',
        description: 'MatchingAgent executes PO ↔ Acknowledgement ↔ Delivery Receipt comparison across 50 line items. Result: 47 auto-matched (94%), 2 partial match (qty delta), 1 mismatch (item not received). Invoice draft auto-generated from matched lines — $41,150 from product delivery. Unmatched items excluded from invoice automatically.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'three-way-match-engine',
    },
    {
        id: '1.4',
        groupId: 1,
        groupTitle: 'Flow 1: Receiving & Invoice Automation',
        title: 'Invoice Preview & Cost/Sell',
        description: 'InvoicePreviewAgent generates INV-2055 with full cost/sell breakdown per line: Task Chairs (18 units): Cost $89 | Sell $142 | Margin 37.2%. Standing Desks (15 units): Cost $245 | Sell $395 | Margin 38.0%. Total: $41,150. Expert reviews line-by-line — margin per item visible. Partial delivery reflected: 18 of 20 chairs, $2,556 pending backorder resolution.',
        app: 'expert-hub',
        role: 'Expert',
        highlightId: 'invoice-cost-sell-lines',
    },
    {
        id: '1.5',
        groupId: 1,
        groupTitle: 'Flow 1: Receiving & Invoice Automation',
        title: 'Monthly Services Invoice',
        description: 'ServicesInvoiceAgent generates SVC-03-2026 from Daily Log activity — not from a PO. March services: Installation labor 24hrs × $95 = $2,280 | Project management fee $850 | Delivery coordination 3 trips = $325. Total: $3,455. Generated from actual registered activity — zero re-entry. Expert validates logged hours vs approved before sending to QB.',
        app: 'expert-hub',
        role: 'Expert',
        highlightId: 'services-invoice-preview',
    },
    {
        id: '1.6',
        groupId: 1,
        groupTitle: 'Flow 1: Receiving & Invoice Automation',
        title: 'QuickBooks Sync Batch',
        description: 'QB Sync panel shows batch ready: INV-2055 ($41,150 product) + SVC-03-2026 ($3,455 services) = $44,605 total. GL codes auto-mapped by category: Furniture → COGS-F01, Services → SVC-REV, Freight → SHIP-EXP. Tax rates applied per line. Customer "Apex Furniture" matched in QB. Dealer reviews GL mapping and confirms batch.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'qb-sync-batch-panel',
    },
    {
        id: '1.7',
        groupId: 1,
        groupTitle: 'Flow 1: Receiving & Invoice Automation',
        title: 'Sync Confirmation',
        description: 'QuickBooks confirms sync in real time: INV-2055 → QB Bill QB-4421 created ($41,150). SVC-03-2026 → QB Bill QB-4424 created ($3,455). GL accounts auto-reconciled. Dealer sees Bill IDs, GL category breakdown, and timestamp. Zero re-entry into QuickBooks — data flowed directly from Strata.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'qb-sync-confirmation',
    },
    // CRM: Receiving Milestone (integrated at end of Flow 1)
    {
        id: '1.8',
        groupId: 1,
        groupTitle: 'Flow 1: Receiving & Invoice Automation',
        title: 'CRM: Receiving Milestone',
        description: 'ReceivingMilestoneAgent updates CRM project "Apex HQ Office Renovation": Delivery confirmed March 2026 — 47/50 SKUs received, $41,150 product invoiced, $3,455 services invoiced, QB Bills QB-4421 + QB-4424 created. Daily Log auto-updated: DL-004 "Receiving complete — partial delivery noted, backorder tracked". Project timeline advances — no manual CRM entry needed.',
        app: 'crm',
        role: 'System',
        highlightId: 'crm-receiving-milestone',
    },

    // ═══════════════════════════════════════════
    // FLOW 2: Change Order Management (4 steps)
    // 2 automated + 1 HITL + 1 interactive
    // Reinforces: Req #4 (Daily Log + CO → Invoice), Req #2 (cost/sell in CO)
    // ═══════════════════════════════════════════
    {
        id: '2.1',
        groupId: 2,
        groupTitle: 'Flow 2: Change Order Management',
        title: 'CO Request Received',
        description: 'End User submits CO-007 via Customer Portal: 22 line item changes requesting ergonomic task chair upgrade from standard model. Request auto-routed to Strata — CostAnalysisAgent begins impact calculation immediately. End User sees portal confirmation: "CO-007 received — under review". No emails, no phone calls to initiate.',
        app: 'dashboard',
        role: 'End User',
        highlightId: 'co-request-incoming',
    },
    {
        id: '2.2',
        groupId: 2,
        groupTitle: 'Flow 2: Change Order Management',
        title: 'CO Delta Analysis',
        description: 'CODeltaAgent analyzes all 22 modified lines in parallel. Financial impact per line calculated: task chairs Cost $89/$142 → $140/$300 (ergonomic). Overall: Revenue +$3,200 | Cost +$2,010 | Margin 35.4% → 36.1% (improvement). Delivery impact: +7 days. Supplier pricing verified against current catalog. Full CO document assembled for expert review.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'co-delta-analysis',
    },
    {
        id: '2.3',
        groupId: 2,
        groupTitle: 'Flow 2: Change Order Management',
        title: 'CO Approval — Financial Impact',
        description: 'Expert sees CO approval panel with 3 columns: Original | Delta | New Total per line. Task chairs: $89/$142/37.2% → $140/$300/53.3%. Overall: Revenue +$3,200 | Cost +$2,010 | Margin 35.4%→36.1% (improved). Delivery: +7 days. Customer approval already registered in portal. Expert can add note. One click approves — audit trail and PO amendment auto-transmitted to supplier.',
        app: 'expert-hub',
        role: 'Expert',
        highlightId: 'co-approval-panel',
    },
    {
        id: '2.4',
        groupId: 2,
        groupTitle: 'Flow 2: Change Order Management',
        title: 'Invoice + QB Amendment',
        description: 'Three systems update in parallel — zero human action: InvoiceDeltaAgent updates INV-2055 from $43,750 → $46,950 (+$3,200 CO-007). QuickBooksAgent amends Bill QB-4421 with memo "CO-007: ergonomic upgrade approved". Daily Log auto-records DL-007 "CO-007 Applied — $3,200 delta". Confirmation: "Amendment complete across all systems."',
        app: 'dashboard',
        role: 'System',
        highlightId: 'invoice-amendment-parallel',
    },

    // ═══════════════════════════════════════════
    // FLOW 3: Financial Command Center (3 steps)
    // 0 automated + 3 interactive — CFO/Controller executive view
    // NEW gap closed: multi-project financial aggregation + budget vs actual
    // ═══════════════════════════════════════════
    {
        id: '3.1',
        groupId: 3,
        groupTitle: 'Flow 3: Financial Command Center',
        title: 'Multi-Project Financial Dashboard',
        description: 'Executive financial dashboard shows 3 active projects with real-time status: Apex Furniture ($46,950 | 82% delivered | QB synced | 1 CO), Workspace Group ($12,300 | invoiced | QB synced), Meridian Group ($98,400 | quote approved | 68% win probability). Pipeline total: $157,650. Each project shows invoice status, QB sync state, delivery %, open COs — one place, zero QB logins, zero Excel.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'financial-command-center',
    },
    {
        id: '3.2',
        groupId: 3,
        groupTitle: 'Flow 3: Financial Command Center',
        title: 'QuickBooks Reconciliation',
        description: 'QB Reconciliation Report for current period: INV-2055 $46,950 → QB-4421 ✓ | SVC-03-2026 $3,455 → QB-4424 ✓ | INV-2048 $12,300 → QB-4422 ✓. GL breakdown by category: Furniture $41,150 | Services $3,455 | Freight $2,345. Total posted to QB: $60,250. Aging AP: 0 items overdue. Controller exports directly — no manual reconciliation needed.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'qb-reconciliation-report',
    },
    {
        id: '3.3',
        groupId: 3,
        groupTitle: 'Flow 3: Financial Command Center',
        title: 'Budget vs. Actual Analysis',
        description: 'Budget vs. Actual for Apex Furniture project: Quote original $43,750 (100% base) → CO-007 +$3,200 (+7.3%) → Services March +$3,455 (+7.9%) → Total actual $50,205. Variance +$6,455 — every dollar documented and approved. CFO sees each variance has justification: CO approved by expert + customer, services approved by expert. Zero surprises in billing.',
        app: 'crm',
        role: 'Sales Rep',
        highlightId: 'budget-vs-actual-chart',
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const OPS_DEMO_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    // Flow 1: Receiving & Invoice Automation
    '1.1': { mode: 'auto', duration: 14, aiSummary: 'ReceivingAgent ingesting ASN — cross-referencing PO ORD-2055 with delivery across 3 shipments' },
    '1.2': { mode: 'interactive', userAction: 'Review 3 flagged discrepancies (47 auto-matched). Flag 1: partial delivery 18/20 chairs. Accept AI suggestions or override. Click "Approve Receiving Doc"' },
    '1.3': { mode: 'auto', duration: 28, aiSummary: '3-Way Match: reconciling PO ↔ ACK ↔ Delivery Receipt across 50 lines — 47 auto-matched, generating invoice draft $41,150' },
    '1.4': { mode: 'interactive', userAction: 'Review INV-2055 cost/sell: Task Chairs $89→$142 (37.2% margin), Standing Desks $245→$395 (38.0%). Partial delivery reflected. Click "Approve Invoice Draft"' },
    '1.5': { mode: 'interactive', userAction: 'Review SVC-03-2026: $3,455 from Daily Log — 24hrs installation + PM fee + delivery. Verify hours vs approved. Click "Approve Services Invoice"' },
    '1.6': { mode: 'interactive', userAction: 'QB Sync batch: $44,605 (INV-2055 $41,150 + SVC-03-2026 $3,455). GL codes auto-mapped — review and click "Sync to QuickBooks"' },
    '1.7': { mode: 'interactive', userAction: 'QB confirmed: QB-4421 ($41,150) + QB-4424 ($3,455) created. Review Bill IDs and GL breakdown. Click "Done"' },
    '1.8': { mode: 'auto', duration: 10, aiSummary: 'ReceivingMilestoneAgent: updating CRM project timeline and Daily Log — receiving confirmed, QB sync recorded' },

    // Flow 2: Change Order Management
    '2.1': { mode: 'interactive', userAction: 'CO-007 received from Apex Furniture portal: 22 line item changes — ergonomic upgrade request. Review and click "Begin CO Analysis"' },
    '2.2': { mode: 'auto', duration: 22, aiSummary: 'CODeltaAgent: analyzing 22 modified lines — calculating per-line financial impact, verifying supplier pricing' },
    '2.3': { mode: 'interactive', userAction: 'Review CO-007: Revenue +$3,200, Margin 35.4%→36.1% (improves), Delivery +7 days. Customer already approved in portal. Click "Approve Change Order"' },
    '2.4': { mode: 'auto', duration: 18, aiSummary: 'InvoiceDeltaAgent amending INV-2055 → $46,950 | QuickBooksAgent amending Bill QB-4421 | Daily Log DL-007 recording — all systems in parallel' },

    // Flow 3: Financial Command Center
    '3.1': { mode: 'interactive', userAction: 'Review Financial Dashboard: Apex $46,950 | Workspace Group $12,300 | Meridian $98,400 pipeline = $157,650. No Excel, no QB login. Click "Open Apex Furniture"' },
    '3.2': { mode: 'interactive', userAction: 'QB Reconciliation: $60,250 posted, 0 discrepancies, GL by category. Aging AP: 0 overdue. Click "Export to Controller"' },
    '3.3': { mode: 'interactive', userAction: 'Budget vs. Actual: base $43,750 → actual $50,205. Variance +$6,455 (+14.7%) — all documented: CO-007 + March services. Click "Download Report"' },
};

// ─── STEP MESSAGES ───────────────────────────────────────────────────────────

export const OPS_DEMO_STEP_MESSAGES: Record<string, string[]> = {
    // Flow 1: Receiving & Invoice Automation
    '1.1': [
        'ReceivingAgent: ASN received from supplier — 3 shipments confirmed by carrier',
        'Cross-referencing ORD-2055: 50 line items across 3 delivery zones',
        '14 agents processing in parallel — no manual document handling needed',
        'Quantity discrepancies detected: 3 items flagged for expert review',
    ],
    '1.2': [
        'ReceivingDocAgent: PO ↔ Delivery Receipt comparison ready',
        '47 lines auto-matched — green | 3 flagged — amber with AI suggestions',
        'Flag 1: Task chairs 18/20 received — partial delivery, AI confidence 94%',
        'Expert validating AI suggestions — not searching for errors',
    ],
    '1.3': [
        'MatchingAgent: PO ↔ Acknowledgement ↔ Delivery Receipt — 50 lines',
        '47 auto-matched (94%) — invoice draft generating...',
        '2 partial match (qty delta) | 1 mismatch (item not received)',
        'INV-2055 draft: $41,150 — unmatched items excluded automatically',
    ],
    '1.4': [
        'InvoicePreviewAgent: generating INV-2055 with cost/sell breakdown...',
        'Task Chairs: cost $89 | sell $142 | margin 37.2%',
        'Standing Desks: cost $245 | sell $395 | margin 38.0%',
        'Partial delivery of 18/20 chairs reflected — $2,556 backorder noted',
    ],
    '1.5': [
        'ServicesInvoiceAgent: consolidating Daily Log entries for March...',
        'Installation: 24hrs × $95 = $2,280 | PM fee: $850 | Delivery: $325',
        'SVC-03-2026 generated from actual activity — not re-entered manually',
        'Linked to Apex Furniture — ready for approval and QB sync',
    ],
    '1.6': [
        'QB Sync batch: INV-2055 ($41,150) + SVC-03-2026 ($3,455) = $44,605',
        'GL codes auto-mapped: Furniture → COGS-F01 | Services → SVC-REV',
        'Tax rates applied, customer matched in QuickBooks',
        'Waiting for dealer confirmation before posting',
    ],
    '1.7': [
        'QuickBooks sync processing...',
        'INV-2055 → QB Bill QB-4421 created ($41,150) ✓',
        'SVC-03-2026 → QB Bill QB-4424 created ($3,455) ✓',
        'GL auto-reconciled — zero re-entry into QuickBooks',
    ],
    '1.8': [
        'ReceivingMilestoneAgent: updating CRM project timeline...',
        'Delivery confirmed: 47/50 SKUs | $41,150 product | $3,455 services invoiced',
        'Daily Log DL-004: "Receiving complete — partial delivery, backorder tracked"',
        'QB Bills QB-4421 + QB-4424 linked to project record',
    ],

    // Flow 2: Change Order Management
    '2.1': [
        'CO-007 received via Customer Portal — Apex Furniture',
        '22 line item changes: ergonomic upgrade request submitted',
        'CostAnalysisAgent queued — financial impact calculation starting',
    ],
    '2.2': [
        'CODeltaAgent: analyzing 22 modified lines in parallel...',
        'Task chairs: $89/$142 → $140/$300 | Revenue impact: +$3,200',
        'Overall: Cost +$2,010 | Margin 35.4% → 36.1% (improvement)',
        'Delivery impact: +7 days | Supplier pricing verified vs. catalog',
    ],
    '2.3': [
        'CO-007: 22 lines modified — impact analysis complete',
        'Revenue +$3,200 | Cost +$2,010 | Margin: 35.4% → 36.1% (improves)',
        'Customer approval registered in portal — no calls needed',
        'Expert approving — PO amendment will auto-transmit to supplier',
    ],
    '2.4': [
        'InvoiceDeltaAgent: updating INV-2055 → $46,950 (+$3,200)...',
        'QuickBooks Bill QB-4421 amended — memo "CO-007: $3,200 delta"',
        'Daily Log DL-007 auto-recorded — full traceability maintained',
        'All systems updated in parallel — zero re-entry',
    ],

    // Flow 3: Financial Command Center
    '3.1': [
        'Financial Dashboard: aggregating data from 3 active projects...',
        'Apex Furniture: $46,950 | QB synced | 1 CO applied | 82% delivered',
        'Pipeline total: $157,650 — no Excel, no QB login, no calls',
    ],
    '3.2': [
        'QB Reconciliation: crossing Strata invoices vs. QuickBooks Bills...',
        '$60,250 total | 3 invoices | 0 discrepancies | 0 items overdue',
        'GL breakdown: Furniture $41,150 | Services $3,455 | Freight $2,345',
        'Controller-ready — zero manual adjustments required this period',
    ],
    '3.3': [
        'Budget vs. Actual: Apex Furniture — complete project analysis',
        'Base: $43,750 | CO-007: +$3,200 | Services: +$3,455 | Total: $50,205',
        'Variance +14.7% — 100% documented, approved, audited',
        'Report ready for CFO — zero surprises, zero manual work',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────
// Steps that handle their own AI indicator via DemoProcessPanel (lupa effect).
// These 4 auto steps will display AgentPipelineStrip + timeline in the lupa panel.
// All other steps use DemoAIIndicator for status messaging.
// NOTE: DemoProcessPanel must be profile-aware when OPS steps are wired (Stage 1).

export const OPS_DEMO_SELF_INDICATED: string[] = [
    '1.1', '1.3', '2.2', '2.4',
];
