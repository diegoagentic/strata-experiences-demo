// ═══════════════════════════════════════════════════════════════════════════════
// COI Demo Profile — Furniture Dealer Experience (current demo)
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

export const COI_STEPS: DemoStep[] = [
    // ═══════════════════════════════════════════
    // FLOW 1: RFQ to PO Processing
    // ═══════════════════════════════════════════
    {
        id: '1.1',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Email Ingestion',
        description: 'Dealer sends email with RFQ: text + PDF spec + CSV line items.',
        app: 'email-marketplace',
        role: 'Dealer',
        highlightId: 'email-rfq-incoming'
    },
    {
        id: '1.2',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'AI Extraction & Parsing',
        description: 'OCR/TextExtract processes attachments. Parser extracts line items, quantities, finishes, ship-to, dates.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'kanban-ai-extraction'
    },
    {
        id: '1.3',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Normalization & Confidence',
        description: 'DataNormalizationAgent unifies data to RFQ/Quote Draft. Shows confidence score per field and missing fields.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'kanban-normalization'
    },
    {
        id: '1.4',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Quote Draft Creation',
        description: 'High confidence → auto Quote draft. Low confidence or missing fields → "Needs Attention" task for Expert.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'kanban-quote-draft'
    },
    {
        id: '1.5',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Expert Review (HITL)',
        description: 'Expert sees discrepancies and missing fields in queue. Approves AI corrections or manually edits.',
        app: 'expert-hub',
        role: 'Expert',
        highlightId: 'expert-validation-row'
    },
    {
        id: '1.6',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Quote Approval Chain',
        description: 'System Policy Engine auto-approves. Manager shown as pending approval. Auto-advances.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'approval-chain-progress'
    },
    {
        id: '1.7',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Dealer Quote Approval',
        description: 'Dealer receives quote notification, reviews pricing and line items with AI summary, and approves.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'manager-approval-view'
    },
    {
        id: '1.8',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Sales Approval',
        description: 'Sales Analyst receives Quote approval notification on mobile. Reviews and acknowledges from their phone.',
        app: 'dashboard',
        role: 'End User',
        highlightId: 'mobile-dealer-approval'
    },
    {
        id: '1.9',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'PO Generation & Order Approval',
        description: 'Both approvers shown approved. PO auto-generated. Followed by automated order approval chain.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'po-order-approval'
    },
    {
        id: '1.10',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Smart Notifications',
        description: 'Dealer: "RFQ received, Quote ready, PO approved." Expert: only exceptions, digest by priority.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'action-center-notifications'
    },
    {
        id: '1.11',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Pipeline View',
        description: 'Order creation notification. Pipeline view shows new order card with animated column transition.',
        app: 'expert-hub',
        role: 'Dealer',
        highlightId: 'order-pipeline-view'
    },

    // ═══════════════════════════════════════════
    // FLOW 2: PO & Acknowledgement Comparison
    // ═══════════════════════════════════════════
    {
        id: '2.1',
        groupId: 2,
        groupTitle: 'Flow 2: PO & Acknowledgement Comparison',
        title: 'Acknowledgement Intake — Pipeline',
        description: 'Two Acknowledgements arrive: AIS (50 lines, $65K) and HAT (5 lines, $8K). Both appear in Pending column.',
        app: 'expert-hub',
        role: 'System',
        highlightId: 'ack-pipeline-intake'
    },
    {
        id: '2.2',
        groupId: 2,
        groupTitle: 'Flow 2: PO & Acknowledgement Comparison',
        title: 'Normalization & Smart Comparison',
        description: 'HAT: AI trained — color/desc mismatch OK (part# match). HAT → Confirmed. AIS: grommet error flagged → Discrepancy.',
        app: 'expert-hub',
        role: 'System',
        highlightId: 'ack-dual-normalization'
    },
    {
        id: '2.3',
        groupId: 2,
        groupTitle: 'Flow 2: PO & Acknowledgement Comparison',
        title: 'AIS Acknowledgement — Delta Engine',
        description: 'Grommet config error (AI auto-corrects), date shifts (auto-accepted), quantity shortfall (escalated to expert).',
        app: 'expert-hub',
        role: 'System',
        highlightId: 'ack-delta-results'
    },
    {
        id: '2.4',
        groupId: 2,
        groupTitle: 'Flow 2: PO & Acknowledgement Comparison',
        title: 'Expert Review — 50 Line Items',
        description: 'Expert reviews Acknowledgement #ACK-7842. AI corrections shown. Quantity shortfall reviewed and accepted.',
        app: 'expert-hub',
        role: 'Expert',
        highlightId: 'expert-ack-review'
    },
    {
        id: '2.5',
        groupId: 2,
        groupTitle: 'Flow 2: PO & Acknowledgement Comparison',
        title: 'Approval Chain',
        description: 'Expert review routed to automated 3-approver authorization chain for Acknowledgement processing.',
        app: 'expert-hub',
        role: 'System',
        highlightId: 'backorder-approval-chain'
    },
    {
        id: '2.6',
        groupId: 2,
        groupTitle: 'Flow 2: PO & Acknowledgement Comparison',
        title: 'Pipeline Resolution',
        description: 'Pipeline shows: HAT in Confirmed, AIS in Partial. Both Acknowledgements resolved.',
        app: 'expert-hub',
        role: 'Dealer',
        highlightId: 'ack-pipeline-resolved'
    },
    {
        id: '2.7',
        groupId: 2,
        groupTitle: 'Flow 2: PO & Acknowledgement Comparison',
        title: 'Smart Notifications',
        description: 'Dealer: "2 Acknowledgements processed, 1 clean, 1 with 3 exceptions resolved." Expert: only exceptions.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'action-center-ack-notify'
    },

    // ═══════════════════════════════════════════
    // FLOW 3: Punch List / Warranty Claims
    // ═══════════════════════════════════════════
    {
        id: '3.1',
        groupId: 3,
        groupTitle: 'Flow 3: Punch List / Warranty Claims',
        title: 'Request Intake & AI Validation',
        description: 'Expert + AI review incoming service request. AI checks for required documentation: order number, line number, photos of issue, label, and box. Missing items flagged for expert clarification.',
        app: 'mac',
        role: 'Expert',
        highlightId: 'punch-request-intake'
    },
    {
        id: '3.2',
        groupId: 3,
        groupTitle: 'Flow 3: Punch List / Warranty Claims',
        title: 'Labor Quote Requested',
        description: 'Presenter describes the labor quote request process. No UI changes — narration only.',
        app: 'mac',
        role: 'Expert',
        highlightId: 'punch-labor-requested'
    },
    {
        id: '3.3',
        groupId: 3,
        groupTitle: 'Flow 3: Punch List / Warranty Claims',
        title: 'Labor Reimbursement Review',
        description: 'AI validates labor quote against business rules: repair total, trip charge, certified installer, warranty coverage. Expert approves, edits, or rejects.',
        app: 'mac',
        role: 'Expert',
        highlightId: 'punch-labor-review'
    },
    {
        id: '3.4',
        groupId: 3,
        groupTitle: 'Flow 3: Punch List / Warranty Claims',
        title: 'Claim Submission & Tracking',
        description: 'Claim package assembled with photos, issue description, and ship-to address. Acknowledgement received from manufacturer. Shipment tracked on dashboard.',
        app: 'mac',
        role: 'Dealer',
        highlightId: 'punch-claim-submission'
    },
    {
        id: '3.5',
        groupId: 3,
        groupTitle: 'Flow 3: Punch List / Warranty Claims',
        title: 'End User Process Report',
        description: 'End user receives the completed punch list report on mobile. Reviews details and can leave comments before final acknowledgement.',
        app: 'dashboard',
        role: 'End User',
        highlightId: 'mobile-enduser-report'
    },
];

export const COI_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    // Flow 1: RFQ to PO Processing
    '1.1':  { mode: 'auto', duration: 34, aiSummary: 'Ingesting dealer email — extracting RFQ attachments' },
    '1.2':  { mode: 'auto', duration: 27, aiSummary: 'AI agents parsed and extracted 200 line items' },
    '1.3':  { mode: 'interactive', userAction: 'Click "Continue to Quote Draft" when ready' },
    '1.4':  { mode: 'interactive', userAction: 'Click "Route to Expert Hub" to escalate' },
    '1.5':  { mode: 'interactive', userAction: 'Review AI corrections, then click "Approve & Create Quote"' },
    '1.6':  { mode: 'auto', duration: 19, aiSummary: 'Policy engine and approval chain running automatically' },
    '1.7':  { mode: 'interactive', userAction: 'Review quote details, then click "Approve Quote"' },
    '1.8':  { mode: 'interactive', userAction: 'Review PO notification on mobile, tap "Acknowledge"' },
    '1.9':  { mode: 'auto', duration: 50, aiSummary: 'Generating PO and running automated order approval chain' },
    '1.10': { mode: 'interactive', userAction: 'Review smart notifications' },
    '1.11': { mode: 'interactive', userAction: 'Review pipeline resolution, click "Send Notifications"' },
    // Flow 2: PO & Acknowledgement Comparison
    '2.1':  { mode: 'auto', duration: 14, aiSummary: 'Two Acknowledgements arriving in pipeline — AIS and HAT' },
    '2.2':  { mode: 'interactive', userAction: 'Review comparison results, click "Review Discrepancies" on AIS card' },
    '2.3':  { mode: 'interactive', userAction: 'Review delta results, click "Accept and Send to System of Record"' },
    '2.4':  { mode: 'interactive', userAction: 'Review AI corrections and edit flagged line items, then click "Accept and Send to System of Record"' },
    '2.5':  { mode: 'auto', duration: 20, aiSummary: 'Running 3-approver authorization chain' },
    '2.6':  { mode: 'interactive', userAction: 'Review pipeline resolution, click "Send Notifications"' },
    '2.7':  { mode: 'interactive', userAction: 'Review notification digests' },
    // Flow 3: Punch List / Warranty Claims
    '3.1':  { mode: 'interactive', userAction: 'Review AI validation checklist, resolve flagged items, click "Validate & Continue"' },
    '3.2':  { mode: 'interactive', userAction: 'Presenter describes the labor quote request process — click Next to continue' },
    '3.3':  { mode: 'interactive', userAction: 'Review labor quote and business rules, click "Reviewed and Continue"' },
    '3.4':  { mode: 'auto', duration: 24, aiSummary: 'Assembling claim, forwarding evidence, tracking shipment' },
    '3.5':  { mode: 'interactive', userAction: 'Review punch list report on mobile, leave comments, then acknowledge' },
};

export const COI_STEP_MESSAGES: Record<string, string[]> = {
    // ═══ Flow 1: RFQ to PO Processing ═══
    '1.1': [
        'Reading dealer email and scanning attachments...',
        'Detected: PDF spec sheet + CSV with line items',
        'Preparing RFQ for intelligent extraction pipeline',
    ],
    '1.2': [
        'OCR scanning PDF specification sheet...',
        'Parser extracting line items, quantities, finishes',
        '200 items identified across 5 product categories',
    ],
    '1.3': [
        'Normalizing extracted data to standard RFQ format...',
        'Calculating confidence score for each field',
        '94% overall extraction accuracy achieved',
    ],
    '1.4': [
        'Building optimized quote draft with pricing rules...',
        'Applying volume discounts and payment terms',
        'Quote QT-1025 ready — routing for expert review',
    ],
    '1.5': [
        'Expert review queue loaded',
        'Review AI corrections, then approve to continue',
    ],
    '1.6': [
        'Policy engine triggered — total exceeds $100K threshold',
        'VP Operations reviewed and approved',
        'Awaiting CFO authorization...',
        'Approval chain complete',
    ],
    '1.7': [
        'Dealer reviewing final quote with AI summary',
        'Review pricing and line items, then approve',
    ],
    '1.8': [
        'Delivering PO approval to Dealer mobile device...',
        'Push notification: PO-1029 approved — Apex Furniture $134,250',
    ],
    '1.9': [
        'Generating Purchase Order from approved quote...',
        'Mapping 5 SKUs to standardized PO format',
        'Running automated 3-level approval chain',
        'PO-1029 approved and transmitted to supplier',
    ],
    '1.10': [
        'Smart notifications generated by role',
        'Review digest — Dealer updates vs Expert exceptions',
    ],
    '1.11': [
        'Full pipeline resolved — all steps complete',
        'Review summary and dispatch notifications',
    ],

    // ═══ Flow 2: PO & Acknowledgement Comparison ═══
    '2.1': [
        'Acknowledgements arriving from supplier ERPs...',
        'EDI/855 translation processing',
        'Two suppliers acknowledged: AIS + HAT',
    ],
    '2.2': [
        'Normalizing Acknowledgement data to standard model...',
        'Linking acknowledgement to original PO-1029',
        'Running intelligent line-by-line comparison',
    ],
    '2.3': [
        'Delta analysis complete — review discrepancies',
        'Substitutions and price variances detected',
    ],
    '2.4': [
        'Expert review queue loaded — 50 line items',
        'Edit flagged items, then accept and send to client',
    ],
    '2.5': [
        'Routing expert review to approval chain...',
        'Running 3-approver authorization chain',
        'All approvals complete — ready for pipeline resolution',
    ],
    '2.6': [
        'Pipeline resolved — review final summary',
        'Dispatch notifications to all stakeholders',
    ],
    '2.7': [
        'Notification digests ready by persona',
        'Dealer: lifecycle updates — Expert: exceptions only',
    ],

    // ═══ Flow 3: Punch List / Warranty Claims ═══
    '3.1': [
        'Scanning incoming service request for required documentation...',
        'Checking: order number, line number, issue photo, label photo, box photo',
        'AI flagged 2 items needing attention — expert review required',
    ],
    '3.2': [
        'Labor quote requested from installer...',
        'Presenter narration — no automated actions',
    ],
    '3.3': [
        'Labor reimbursement requested — validating installer quote...',
        'Checking repair total against threshold, trip charge vs standard rate',
        'Business rules checklist: 4/6 passed, 2 flagged for expert review',
    ],
    '3.4': [
        'Assembling warranty claim package with evidence photos...',
        'Forwarding issue description and ship-to address to manufacturer',
        'Acknowledgement received — tracking shipment on dashboard',
    ],
    '3.5': [
        'Delivering punch list report to end user mobile...',
        'End user reviewing claim details and evidence summary',
        'Awaiting end user acknowledgement',
    ],
};

export const COI_SELF_INDICATED: string[] = [
    // DemoProcessPanel (lupa) steps
    '1.2', '1.3', '1.4',
    // ExpertHubTransactions — AgentPipelineStrip + AI Context boxes
    '1.5', '1.6', '1.8', '1.11',
    '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7',
    // EmailSimulation, Dashboard, Transactions, OrderDetail, MAC — own inline indicators
    '1.1', '1.7', '1.9', '1.10',
    '3.1', '3.2', '3.3', '3.4', '3.5',
];
