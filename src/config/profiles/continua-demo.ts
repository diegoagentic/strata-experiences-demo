// ═══════════════════════════════════════════════════════════════════════════════
// Continua — Demo Profile
// Workplace integrator: Furniture + AV + Architectural solutions.
// MillerKnoll Certified Dealer | 200+ manufacturers | Own fleet & installers
// Multi-location warehousing with proprietary asset management & AI platform.
//
// Narrative: Large corporate HQ project (8 floors, $3.2M) showcasing
// full project lifecycle from RFP to post-occupancy.
//
// AI Automation + Expert-in-the-Loop (HITL) per flow:
// Flow 1: Inventory & Asset Intelligence (5 steps) — Forecast→Reuse→Price→Sync→Consignment
// Flow 2: Facility Management & Service Center (5 steps) — Request→Triage→Expert→Relocation→Resolution
// Flow 3: Project Lifecycle & Procurement (5 steps) — RFP→PO→ACK→Receiving→Install
// Flow 4: Sustainability & Client Reporting (5 steps) — Metrics→Portal→Finance→Survey→Warranty
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const CONTINUA_DEMO_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // FLOW 1: Inventory & Asset Intelligence (5 steps)
    // Smart inventory management — new, reused, consignment, multi-location
    // 2 auto (System) + 3 interactive (Expert)
    // ═══════════════════════════════════════════
    {
        id: '1.1',
        groupId: 1,
        groupTitle: 'Flow 1: Inventory & Asset Intelligence',
        title: 'Inventory Health & Forecasting',
        description: 'InventoryIntelAgent presents dashboard: 2,400 items across 3 warehouses (Chicago, Minneapolis, Madison). AI forecast: Chicago warehouse reaches 85% capacity in 2 weeks with incoming deliveries for UAL phase 3. Suggests relocating 120 items from staging to overflow — savings $4,200/month in storage. Expert reviews recommendations.',
        app: 'inventory',
        role: 'Expert',
        highlightId: 'inventory-health-forecast',
    },
    {
        id: '1.2',
        groupId: 1,
        groupTitle: 'Flow 1: Inventory & Asset Intelligence',
        title: 'Reuse Assessment & Cataloging',
        description: 'SustainabilityAgent catalogs furniture from floor 7 teardown (pre-renovation). 340 items evaluated: 180 reusable (refurbish), 95 recyclable (metal/fabric), 65 end-of-life. AI assigns condition score (1-5) with photo evidence. Reusable items auto-listed in inventory with "Refurbished" tag and estimated value. Savings: $89,000 vs new procurement.',
        app: 'inventory',
        role: 'Expert',
        highlightId: 'reuse-assessment-catalog',
    },
    {
        id: '1.3',
        groupId: 1,
        groupTitle: 'Flow 1: Inventory & Asset Intelligence',
        title: 'Price Verification Engine',
        description: 'PriceVerificationAgent scans 200+ manufacturer price lists (Q1 updates). Detects: 14 items in inventory with outdated cost basis (price increases). 3 consignment items from Herman Miller with 90-day review pending. AI recalculates margins: average 34% → recommends adjusting 6 items where margin <25%. Report with suggested price updates sent to expert.',
        app: 'dealer-kanban',
        role: 'Facility Manager',
        highlightId: 'price-verification-engine',
    },
    {
        id: '1.4',
        groupId: 1,
        groupTitle: 'Flow 1: Inventory & Asset Intelligence',
        title: 'Multi-Location Sync',
        description: 'LocationSyncAgent synchronizes 3 warehouses + 2 active job sites in real-time. Tracking: 45 items in-transit (Chicago→project site), 12 pending QC (Minneapolis), 8 allocated but not shipped (Madison). AI optimizes routing: consolidate 2 deliveries to same project site — savings $1,800 in freight. Map view with status by location.',
        app: 'inventory',
        role: 'Facility Manager',
        highlightId: 'multi-location-sync',
    },
    {
        id: '1.5',
        groupId: 1,
        groupTitle: 'Flow 1: Inventory & Asset Intelligence',
        title: 'Consignment & Vendor Returns',
        description: 'ConsignmentAgent manages 35 items on consignment from 4 manufacturers. 12 items approaching 90-day return window — AI prioritizes: 8 high-value chairs ($24,000 total) need decision this week. Auto-generates RMA requests for 4 confirmed returns. Expert reviews remaining 4 with AI recommendation: convert to purchase (demand trending up 12%).',
        app: 'inventory',
        role: 'Expert',
        highlightId: 'consignment-management',
    },

    {
        id: '1.6',
        groupId: 1,
        groupTitle: 'Flow 1: Inventory & Asset Intelligence',
        title: 'Client Review & Approval',
        description: 'UAL project manager (Emily Chen) receives a consolidated Inventory Intelligence Report covering all changes: warehouse capacity optimized (120 items relocated, $4,200/mo savings), reuse assessment cataloged (180 items, $89K savings), prices verified (14 updated, 6 margin flags), locations synced ($1,800 freight saved), consignment decisions processed. End user reviews each section with AI confidence scores, then signs off digitally.',
        app: 'dashboard',
        role: 'Facility User',
        highlightId: 'mobile-client-review',
    },

    // ═══════════════════════════════════════════
    // FLOW 2: Facility Management & Service Center (5 steps)
    // End user reports issue → AI triage → Expert dispatch → Quick relocation → Resolution
    // 2 auto (System) + 2 interactive (Expert/Dealer) + 1 interactive (End User)
    // ═══════════════════════════════════════════
    {
        id: '2.1',
        groupId: 2,
        groupTitle: 'Flow 2: Facility Management & Service Center',
        title: 'Service Request Intake',
        description: 'Carlos Rivera (Facilities Coordinator) reports a broken Aeron chair (gas cylinder failure — safety concern) and a flickering desk lamp in Office 3-214 via the Service Center. ServiceIntakeAgent extracts request details, identifies affected assets (AST-1847, AST-2103), cross-references warranty coverage, and classifies as Priority: HIGH with safety flag. Request REQ-FM-2026-018 created.',
        app: 'dashboard',
        role: 'Facility User',
        highlightId: 'mobile-service-request',
    },
    {
        id: '2.2',
        groupId: 2,
        groupTitle: 'Flow 2: Facility Management & Service Center',
        title: 'AI Triage & Cross-Reference',
        description: 'TriageAgent cross-references 4 databases: warranty system confirms Aeron chair covered until Mar 2027 (auto-claim eligible), inventory shows 3 replacement Aeron chairs in Warehouse Zone A (Herman Miller consignment), contracts database validates ProInstall LLC service agreement, scheduling identifies installer slot tomorrow 9AM-12PM. AI generates resolution plan: warranty claim + consignment swap ($0 cost) + temporary office relocation.',
        app: 'mac',
        role: 'System',
        highlightId: 'fm-ai-triage',
    },
    {
        id: '2.3',
        groupId: 2,
        groupTitle: 'Flow 2: Facility Management & Service Center',
        title: 'Expert Review & Dispatch',
        description: 'David Park (Regional Sales Manager) reviews AI resolution plan in Expert Hub. Warranty claim CLM-2026-019 auto-drafted, consignment Aeron Remastered available ($0 cost — 98% match to original), ProInstall LLC dispatched for tomorrow. Expert validates consignment selection, approves dispatch, and sends notifications to Carlos Rivera (end user), Sara Chen (dealer), and ProInstall LLC (installer) with resolution timeline.',
        app: 'expert-hub',
        role: 'Expert',
        highlightId: 'fm-expert-dispatch',
    },
    {
        id: '2.4',
        groupId: 2,
        groupTitle: 'Flow 2: Facility Management & Service Center',
        title: 'Quick Action — Office Relocation',
        description: 'While the chair replacement is in progress, Carlos needs a workspace. Sara Chen (dealer) opens Quick Transfer to relocate Carlos\'s workstation assets (laptop dock, 2 monitors, keyboard, personal items) from Office 3-214 to Office 3-216 (vacant). Drag-and-drop interface with AI ergonomic arrangement suggestion. Batch move committed — inventory locations update in real-time, Carlos notified of temporary workspace.',
        app: 'inventory',
        role: 'Facility Manager',
        highlightId: 'fm-quick-relocation',
    },
    {
        id: '2.5',
        groupId: 2,
        groupTitle: 'Flow 2: Facility Management & Service Center',
        title: 'Resolution & Installer Report',
        description: 'ProInstall LLC completes the chair swap: old Aeron removed (warranty return), consignment Aeron Remastered installed in Office 3-214. Installer files completion report with photos, serial number transfer, and QC checklist. System updates: inventory reflects consignment conversion, warranty claim CLM-2026-019 filed with Herman Miller, Carlos relocated back to 3-214. All stakeholders notified. Total resolution: 26 hours, $0 cost.',
        app: 'mac',
        role: 'System',
        highlightId: 'fm-resolution-report',
    },

    // ═══════════════════════════════════════════
    // FLOW 3: Project Lifecycle & Procurement (6 steps)
    // From RFP to installation — how Strata orchestrates a multi-manufacturer project
    // 1 auto (System) + 4 interactive (Expert/Dealer) + 1 interactive (End User)
    // ═══════════════════════════════════════════
    {
        id: '3.1',
        groupId: 3,
        groupTitle: 'Flow 3: Project Lifecycle & Procurement',
        title: 'Project Intake & Scope',
        description: 'Corporate client submits workspace project request through the Strata app — new HQ with 8 floors, 1,200 workstations, 40 conference rooms, 2 cafeterias, AV integration. Budget estimate $3.2M. Request triggers AI-powered project intake pipeline.',
        app: 'crm',
        role: 'Facility Manager',
        highlightId: 'project-intake',
    },
    {
        id: '3.2',
        groupId: 3,
        groupTitle: 'Flow 3: Project Lifecycle & Procurement',
        title: 'PO Generation',
        description: 'AI generates consolidated POs from project spec, compares pricing across 4 sources, applies volume discounts, flags lead time issues. Expert reviews $3.2M package. TrackingAgent monitors 12 active POs — 9 ACKs received and auto-validated. AI detects Knoll ACK +4% price increase vs contract, auto-generates dispute draft.',
        app: 'transactions',
        role: 'Expert',
        highlightId: 'procurement-po-package',
    },
    {
        id: '3.3',
        groupId: 3,
        groupTitle: 'Flow 3: Project Lifecycle & Procurement',
        title: 'PO to Acknowledgement Conversion',
        description: 'Quick Action review: contract compliance verification, quantity matching, delivery schedule validation, price verification against manufacturer catalogs. Expert converts validated PO package to Acknowledgement for $3.2M project.',
        app: 'transactions',
        role: 'Expert',
        highlightId: 'po-ack-conversion',
    },
    {
        id: '3.4',
        groupId: 3,
        groupTitle: 'Flow 3: Project Lifecycle & Procurement',
        title: 'Approval Chain',
        description: 'Sequential approval for PO-to-ACK conversion: AI Compliance Agent auto-validates data integrity and contract terms, Expert David Park reviews manufacturer confirmations and volume discounts, Dealer Sara Chen gives final approval. 3-level chain with visual progression.',
        app: 'transactions',
        role: 'Facility Manager',
        highlightId: 'approval-chain-progress',
    },
    {
        id: '3.5',
        groupId: 3,
        groupTitle: 'Flow 3: Project Lifecycle & Procurement',
        title: 'Warehouse Receiving & QC',
        description: 'ReceivingAgent processes 3 incoming shipments at Chicago warehouse. QR scan → auto-match vs PO line items. 47/50 items matched. QC check: 2 task chairs with fabric defect — photographed and auto-reported to manufacturer via warranty claim. Inventory auto-updated with location assignment (Zone B, Rack 14). Warehouse utilization at 72%.',
        app: 'inventory',
        role: 'Expert',
        highlightId: 'warehouse-receiving-qc',
    },
    {
        id: '3.6',
        groupId: 3,
        groupTitle: 'Flow 3: Project Lifecycle & Procurement',
        title: 'Installation Schedule & Dispatch',
        description: 'InstallationAgent generates schedule for floors 4-6 (phase 2). Coordinates: 8 in-house installers, 2 AV techs, delivery truck schedule. Auto-detects conflict: Herman Miller delivery for floor 5 delayed 3 days — AI re-sequences to start with floor 6, notifies GC. Field verification checklist auto-generated with 120 items.',
        app: 'mac',
        role: 'System',
        highlightId: 'installation-dispatch',
    },

    // ═══════════════════════════════════════════
    // FLOW 4: Sustainability & Client Reporting (5 steps)
    // Impact metrics, compliance, and automated reporting
    // 2 auto (System) + 2 interactive (Expert/Dealer) + 1 interactive (End User)
    // ═══════════════════════════════════════════
    {
        id: '4.1',
        groupId: 4,
        groupTitle: 'Flow 4: Sustainability & Client Reporting',
        title: 'Sustainability Dashboard',
        description: 'SustainabilityMetricsAgent compiles UAL project impact: 194 tons diverted from landfill, 78% embodied carbon reduction, 2,000 items refurbished. Dashboard charts: carbon savings by category, tonnage by material type, cost savings from reuse program. AI generates narrative for Metropolis Award submission. Auto-benchmarks against industry standards.',
        app: 'dashboard',
        role: 'Facility Manager',
        highlightId: 'sustainability-dashboard',
    },
    {
        id: '4.2',
        groupId: 4,
        groupTitle: 'Flow 4: Sustainability & Client Reporting',
        title: 'Client Project Portal',
        description: 'ClientPortalAgent generates view for facilities team: project timeline (82% complete), budget tracking ($2.65M of $3.2M invoiced), installation schedule by floor, open items (3 pending deliveries, 1 warranty claim). Single-pane-of-glass — "one contact, one contract, one invoice". Client change requests route to PM automatically.',
        app: 'expert-hub',
        role: 'Facility Manager',
        highlightId: 'client-project-portal',
    },
    {
        id: '4.3',
        groupId: 4,
        groupTitle: 'Flow 4: Sustainability & Client Reporting',
        title: 'Financial Reconciliation',
        description: 'FinancialAgent reconciles UAL project: 47 POs, 42 invoices, 38 payments received. 4 invoices pending >30 days — AI categorizes: 2 awaiting ACK resolution, 1 partial delivery pending, 1 client approval needed. Auto-generates aging report with recommended actions. Margin analysis: realized 33.2% vs quoted 34% — variance from price increase on 6 items.',
        app: 'dealer-kanban',
        role: 'Expert',
        highlightId: 'financial-reconciliation',
    },
    {
        id: '4.4',
        groupId: 4,
        groupTitle: 'Flow 4: Sustainability & Client Reporting',
        title: 'Post-Occupancy Intelligence',
        description: 'PostOccupancyAgent deploys conversational survey to floor 4 occupants (installed 60 days ago). Topics: workspace comfort, furniture ergonomics, AV quality, temperature, noise. AI analyzes 85 responses: 92% overall satisfaction, task chairs rated 4.6/5, conference room AV 3.8/5 (suggestion: recalibrate mic arrays). Auto-generates report for facilities team.',
        app: 'survey',
        role: 'Facility User',
        highlightId: 'post-occupancy-survey',
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const CONTINUA_DEMO_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    // Flow 1: Inventory & Asset Intelligence
    '1.1': { mode: 'interactive', userAction: 'Review inventory health: 2,400 items, 3 warehouses. Chicago at 85% capacity forecast. AI suggests relocating 120 items — $4,200/mo savings. Click "Apply Recommendations"' },
    '1.2': { mode: 'interactive', userAction: 'Review reuse assessment: 340 items from floor 7 teardown. 180 reusable, 95 recyclable, 65 EOL. $89,000 savings vs new. Click "Catalog Reusable Items"' },
    '1.3': { mode: 'interactive', userAction: 'Price Verification Engine processes 200+ manufacturer price lists. Review results, then click "Continue to Quote Draft"' },
    '1.4': { mode: 'auto', duration: 8, aiSummary: 'LocationSyncAgent: synchronizing 3 warehouses + 2 job sites — optimizing delivery routing, consolidating shipments for $1,800 freight savings' },
    '1.5': { mode: 'interactive', userAction: 'Review consignment: 35 items, 12 approaching 90-day window. 4 RMA auto-generated. AI recommends converting 4 items to purchase (demand up 12%). Click "Process Decisions"' },
    '1.6': { mode: 'interactive', userAction: 'Emily Chen (UAL PM) reviews consolidated Inventory Intelligence Report — capacity, reuse, pricing, logistics, consignment. Click "Approve All Changes"' },

    // Flow 2: Facility Management & Service Center
    '2.1': { mode: 'interactive', userAction: 'Carlos reports broken Aeron chair (gas cylinder — safety) + flickering lamp in Office 3-214. Watch AI extract details and classify priority. Click "Submit Request"' },
    '2.2': { mode: 'auto', duration: 14, aiSummary: 'TriageAgent: cross-referencing warranty, inventory, contracts, and scheduling — generating resolution plan with consignment swap option' },
    '2.3': { mode: 'interactive', userAction: 'Review AI resolution: warranty claim auto-drafted, consignment Aeron available ($0 cost, 98% match), installer dispatched tomorrow. Click "Approve & Notify"' },
    '2.4': { mode: 'interactive', userAction: 'Sara opens Quick Transfer to relocate Carlos\'s workstation assets from Office 3-214 to 3-216 (vacant). Drag items to new office, then click "Commit Moves"' },
    '2.5': { mode: 'auto', duration: 10, aiSummary: 'ResolutionAgent: processing installer report, updating inventory, filing warranty claim, notifying all stakeholders — $0 cost resolution' },

    // Flow 3: Project Lifecycle & Procurement
    '3.1': { mode: 'interactive', userAction: 'As the corporate client, review the workspace project request details (8 floors, 1,200 workstations, $3.2M). Click "Submit Project Request" to send to your dealer network.' },
    '3.2': { mode: 'interactive', userAction: 'Review PO package and ACK tracking: 12 manufacturers, $3.2M total. Watch TrackingAgent validate 9 ACKs and detect Knoll +4% price discrepancy. Click "Next Step" when ready.' },
    '3.3': { mode: 'interactive', userAction: 'Quick Action: review conversion checklist — contract compliance, quantities, delivery schedule, price verification. Click "Convert PO to Acknowledgement" when verified.' },
    '3.4': { mode: 'interactive', userAction: 'Review approval chain for PO-to-ACK conversion: AI Compliance auto-validates, Expert David Park reviews, then click "Approve" as Dealer Sara Chen.' },
    '3.5': { mode: 'interactive', userAction: 'Review receiving: 47/50 items matched. QC flag: 2 chairs with fabric defect. Accept AI location assignment (Zone B, Rack 14). Click "Confirm Receiving"' },
    '3.6': { mode: 'auto', duration: 10, aiSummary: 'InstallationAgent: generating schedule for floors 4-6 — coordinating 8 installers + 2 AV techs, re-sequencing around Herman Miller delay' },

    // Flow 4: Sustainability & Client Reporting
    '4.1': { mode: 'auto', duration: 10, aiSummary: 'SustainabilityMetricsAgent: compiling impact data — 194 tons diverted, 78% carbon reduction, generating award submission narrative' },
    '4.2': { mode: 'interactive', userAction: 'Review client portal: timeline 82% complete, $2.65M/$3.2M invoiced, 3 pending deliveries, 1 warranty claim. Click "Publish Portal Update"' },
    '4.3': { mode: 'interactive', userAction: 'Review reconciliation: 47 POs, 42 invoices, 38 payments. 4 invoices >30 days — AI categorized with actions. Margin 33.2% vs 34% quoted. Click "Export Aging Report"' },
    '4.4': { mode: 'interactive', userAction: 'Review survey results: 85 responses, 92% satisfaction. Chairs 4.6/5, AV 3.8/5 (recalibrate mics). Click "Send Report to Client"' },
};

// ─── STEP MESSAGES ───────────────────────────────────────────────────────────

export const CONTINUA_DEMO_STEP_MESSAGES: Record<string, string[]> = {
    // Flow 1: Inventory & Asset Intelligence
    '1.1': [
        'InventoryIntelAgent: analyzing 2,400 items across 3 warehouses...',
        'Chicago: 68% → forecast 85% in 2 weeks with UAL phase 3 deliveries',
        'Minneapolis: 52% | Madison: 41% — overflow capacity available',
        'Recommendation: relocate 120 items from staging → savings $4,200/month',
    ],
    '1.2': [
        'SustainabilityAgent: cataloging floor 7 teardown — 340 items...',
        '180 reusable (refurbish) | 95 recyclable (metal/fabric) | 65 end-of-life',
        'AI condition scoring: photo evidence + wear analysis per item',
        'Reusable items auto-listed with "Refurbished" tag — estimated savings $89,000',
    ],
    '1.3': [
        'PriceVerificationAgent: scanning 200+ manufacturer price lists...',
        '14 items detected with outdated cost basis — Q1 price increases',
        '3 Herman Miller consignment items: 90-day review window approaching',
        'Margin recalculation: avg 34% — 6 items flagged below 25% threshold',
    ],
    '1.4': [
        'LocationSyncAgent: synchronizing 3 warehouses + 2 job sites...',
        '45 items in-transit (Chicago → project site) | 12 pending QC (Minneapolis)',
        '8 allocated but not shipped (Madison) — scheduling pickup',
        'Route optimization: consolidating 2 deliveries — $1,800 freight savings',
    ],
    '1.5': [
        'ConsignmentAgent: reviewing 35 items across 4 manufacturers...',
        '12 items approaching 90-day return window — prioritizing high-value',
        '8 chairs ($24,000) need decision this week — 4 RMA auto-generated',
        'AI recommendation: convert remaining 4 to purchase — demand up 12%',
    ],
    '1.6': [
        'Inventory Intelligence Report ready for UAL project review...',
        'Consolidated: 5 intelligence modules — capacity, reuse, pricing, logistics, consignment',
        'Total savings identified: $95,200 + $4,200/mo ongoing',
        'Awaiting client approval — Emily Chen (UAL PM) notified',
    ],

    // Flow 2: Facility Management & Service Center
    '2.1': [
        'ServiceIntakeAgent: incoming request from Carlos Rivera — Office 3-214...',
        'Extracting: broken Aeron chair (gas cylinder failure) + flickering desk lamp',
        'Warranty check: AST-1847 covered until Mar 2027 — auto-claim eligible',
        'Priority classified: HIGH (safety concern — gas cylinder failure)',
    ],
    '2.2': [
        'TriageAgent: cross-referencing 4 databases for REQ-FM-2026-018...',
        'Warranty DB: Aeron chair covered — auto-claim eligible',
        'Inventory: 3 replacement Aeron chairs in Warehouse Zone A (consignment)',
        'Resolution plan: warranty claim + consignment swap + temporary relocation',
    ],
    '2.3': [
        'Expert review: David Park reviewing AI resolution plan...',
        'Consignment match: Aeron Remastered from Zone A — 98% match, $0 cost',
        'Installer dispatch: ProInstall LLC, tomorrow 9AM-12PM — certified vendor',
        'Approval sent — notifications dispatched to Carlos, Sara, ProInstall',
    ],
    '2.4': [
        'RelocationAgent: preparing asset transfer — Office 3-214 → 3-216...',
        'Assets identified: laptop dock, 2 monitors, keyboard, personal items',
        'Target: Office 3-216 (vacant workstation, same floor, ergonomic match)',
        'Quick Transfer modal ready — drag-and-drop to commit moves',
    ],
    '2.5': [
        'ResolutionAgent: installer report received from ProInstall LLC...',
        'Chair swap complete: old Aeron removed, consignment Aeron installed',
        'Inventory updated: AST-3201 activated, AST-1847 marked for warranty return',
        'All stakeholders notified — REQ-FM-2026-018 resolved, $0 cost, 26h total',
    ],

    // Flow 3: Project Lifecycle & Procurement
    '3.1': [
        'CRMAgent: RFP received — corporate HQ project, 8 floors',
        'Auto-extracting requirements: 1,200 workstations, 40 conference rooms, 2 cafeterias',
        'Preliminary estimate calculated: $3.2M across Herman Miller, Knoll, DIRTT',
        'Project team suggested based on current capacity and expertise',
    ],
    '3.2': [
        'ProcurementAgent: generating consolidated POs for 12 manufacturers...',
        'Contract pricing applied — tiered discounts for MillerKnoll products',
        'Lead time flags: 3 items >8 weeks (DIRTT modular walls, custom desks)',
        'PO package ready: $2.8M furniture + $280K AV + $120K architectural',
    ],
    '3.3': [
        'ConversionAgent: initiating PO-to-ACK conversion review...',
        'Contract compliance: 12/12 manufacturers verified against master agreements',
        'Price verification: cross-referencing 4 catalog sources — 45/46 items matched',
        'Conversion package ready — pending approval chain',
    ],
    '3.4': [
        'ApprovalEngine: initiating 3-level approval chain...',
        'Level 1 — AI Compliance: data integrity + contract terms validated',
        'Level 2 — Expert David Park: manufacturer confirmations reviewed',
        'Level 3 — Dealer Sara Chen: final approval pending',
    ],
    '3.5': [
        'ReceivingAgent: processing 3 shipments at Chicago warehouse...',
        'QR scan → auto-matching against PO line items: 47/50 matched',
        'QC flag: 2 task chairs — fabric defect detected, photo evidence captured',
        'Inventory updated: Zone B, Rack 14 | Warehouse utilization: 72%',
    ],
    '3.6': [
        'InstallationAgent: generating schedule for floors 4-6 (phase 2)...',
        'Coordinating: 8 installers + 2 AV techs + delivery trucks',
        'Conflict detected: Herman Miller delivery delayed 3 days for floor 5',
        'AI re-sequencing: start with floor 6 — GC notified, checklist generated (120 items)',
    ],

    // Flow 4: Sustainability & Client Reporting
    '4.1': [
        'SustainabilityMetricsAgent: compiling UAL project impact data...',
        '194 tons diverted from landfill | 78% embodied carbon reduction',
        '2,000 items refurbished | Shaw carpet take-back: 103 tons recycled',
        'Award narrative generated — benchmarked against industry standards',
    ],
    '4.2': [
        'ClientPortalAgent: generating single-pane view for facilities team...',
        'Timeline: 82% complete | Budget: $2.65M of $3.2M invoiced',
        'Open items: 3 pending deliveries, 1 warranty claim, 0 overdue invoices',
        '"One contact, one contract, one invoice" — change requests routed to PM',
    ],
    '4.3': [
        'FinancialAgent: reconciling UAL project — 47 POs, 42 invoices...',
        '38 payments received | 4 invoices pending >30 days',
        'AI categorization: 2 awaiting ACK, 1 partial delivery, 1 client approval',
        'Margin analysis: 33.2% realized vs 34% quoted — 6 items with price variance',
    ],
    '4.4': [
        'PostOccupancyAgent: deploying conversational survey — floor 4 occupants...',
        '85 responses collected: workspace comfort, ergonomics, AV quality',
        'Overall: 92% satisfaction | Task chairs: 4.6/5 | AV: 3.8/5',
        'Recommendation: recalibrate conference room mic arrays — report generated',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────
// Steps that handle their own AI indicator via DemoProcessPanel (lupa effect).
// System-role auto steps display AgentPipelineStrip + timeline in the lupa panel.

export const CONTINUA_DEMO_SELF_INDICATED: string[] = [
    '1.1', '1.2', '1.3', '1.4', '1.5', '1.6',
    '2.1', '2.2', '2.5',
    '3.1', '3.2', '3.3', '3.4', '4.1', '4.4',
];

// ─── STEP TIMING PROFILES ────────────────────────────────────────────────────
// Per-step timing for varied pacing. Hero steps (1.2, 3.2, 4.1) are slower;
// System auto-steps (2.4) are faster. Interactive steps have resultsDur=0 (manual).
export interface StepTiming {
    notifDelay: number;     // ms before notification appears
    notifDuration: number;  // ms notification stays before auto-advancing to processing
    agentStagger: number;   // ms between each agent appearing
    agentDone: number;      // ms after agent appears before checkmark
    breathing: number;      // ms pause between processing complete and revealed banner
    resultsDur: number;     // ms results shown before auto-advance (0 = manual/interactive)
}

export const CONTINUA_STEP_TIMING: Record<string, StepTiming> = {
    '1.1': { notifDelay: 2500, notifDuration: 6000, agentStagger: 800,  agentDone: 500,  breathing: 1500, resultsDur: 0 },
    '1.2': { notifDelay: 2500, notifDuration: 7000, agentStagger: 1000, agentDone: 700,  breathing: 1800, resultsDur: 0 },
    '1.3': { notifDelay: 3000, notifDuration: 7000, agentStagger: 1200, agentDone: 800,  breathing: 2000, resultsDur: 0 },
    '1.4': { notifDelay: 2500, notifDuration: 6000, agentStagger: 900,  agentDone: 600,  breathing: 1500, resultsDur: 10000 },
    '1.5': { notifDelay: 2500, notifDuration: 7000, agentStagger: 900,  agentDone: 600,  breathing: 1500, resultsDur: 0 },
    '1.6': { notifDelay: 2000, notifDuration: 6000, agentStagger: 0,    agentDone: 0,    breathing: 0,    resultsDur: 0 },
    // Flow 2: FM & Service Center
    '2.1': { notifDelay: 2000, notifDuration: 6000, agentStagger: 600,  agentDone: 400,  breathing: 1200, resultsDur: 0 },
    '2.2': { notifDelay: 2000, notifDuration: 5000, agentStagger: 800,  agentDone: 500,  breathing: 1500, resultsDur: 12000 },
    '2.3': { notifDelay: 2500, notifDuration: 7000, agentStagger: 900,  agentDone: 600,  breathing: 1500, resultsDur: 0 },
    '2.4': { notifDelay: 2500, notifDuration: 5000, agentStagger: 0,    agentDone: 0,    breathing: 0,    resultsDur: 0 },
    '2.5': { notifDelay: 2000, notifDuration: 5000, agentStagger: 700,  agentDone: 500,  breathing: 1000, resultsDur: 10000 },
    '3.1': { notifDelay: 2000, notifDuration: 6000, agentStagger: 0,    agentDone: 0,   breathing: 1500, resultsDur: 0 },
    '3.2': { notifDelay: 3000, notifDuration: 8000, agentStagger: 1200, agentDone: 800,  breathing: 2000, resultsDur: 0 },
    '3.3': { notifDelay: 2000, notifDuration: 5000, agentStagger: 600,  agentDone: 400,  breathing: 1200, resultsDur: 0 },
    '3.4': { notifDelay: 2000, notifDuration: 5000, agentStagger: 0,    agentDone: 0,    breathing: 0,    resultsDur: 0 },
    '3.5': { notifDelay: 2500, notifDuration: 6000, agentStagger: 800,  agentDone: 500,  breathing: 1500, resultsDur: 0 },
    '3.6': { notifDelay: 2000, notifDuration: 5000, agentStagger: 700,  agentDone: 500,  breathing: 1000, resultsDur: 10000 },
    '4.1': { notifDelay: 3000, notifDuration: 7000, agentStagger: 1100, agentDone: 700,  breathing: 2000, resultsDur: 12000 },
    '4.2': { notifDelay: 2500, notifDuration: 6000, agentStagger: 900,  agentDone: 600,  breathing: 1500, resultsDur: 0 },
    '4.3': { notifDelay: 2000, notifDuration: 5000, agentStagger: 800,  agentDone: 500,  breathing: 1200, resultsDur: 0 },
    '4.4': { notifDelay: 2500, notifDuration: 6000, agentStagger: 900,  agentDone: 600,  breathing: 1500, resultsDur: 0 },
};
