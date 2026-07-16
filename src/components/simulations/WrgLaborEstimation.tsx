// ═══════════════════════════════════════════════════════════════════════════════
// WR — Flow 2: Labor Estimation
// Steps: w2.1 (Cost calc + expert review → "Ask Designer" → nextStep)
//        w2.2 (Designer verification page for OFS Serpentine)
//        w2.3 (Expert confirmation — all adjustments resolved, send to dealer)
//        w2.4 (WrgEstimatorReview — Dealer review + Approval Chain, HITL in Dashboard)
//
// Data: JPS Health Center for Women — 24 line items, 185.04 man-hours, $10,547.28
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDemo } from '../../context/DemoContext';
import { AIAgentAvatar } from './DemoAvatars';
import {
    CheckCircleIcon,
    ArrowPathIcon,
    ArrowRightIcon,
    ArrowDownIcon,
    ExclamationTriangleIcon,
    CalculatorIcon,
    ChevronDownIcon,
    CheckIcon,
    DocumentTextIcon,
    CubeIcon,
    ShieldCheckIcon,
    ClipboardDocumentListIcon,
    ClipboardDocumentCheckIcon,
    AdjustmentsHorizontalIcon,
    SparklesIcon,
    TruckIcon,
    WrenchScrewdriverIcon,
    UserGroupIcon,
    PaperAirplaneIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    ChatBubbleLeftEllipsisIcon,
    CpuChipIcon,
    ClockIcon,
    EyeIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { WRG_STEP_TIMING, type WrgStepTiming } from '../../config/profiles/wrg-demo';
import ApprovalChainModal, { type Approver } from '../modals/ApprovalChainModal';

// ─── Expert avatar ───────────────────────────────────────────────────────────
const EXPERT_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AgentVis { name: string; detail: string; visible: boolean; done: boolean }

type PipelinePhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed';
type ConfirmSubPhase = 'confirm' | 'staging' | 'staging-pipeline' | 'staging-revealed' | 'markup' | 'markup-pipeline' | 'markup-revealed';
type ReviewPhase = 'notification' | 'reviewing' | 'approved' | 'releasing' | 'done';

// Designer avatar for escalation micro-interaction
const DESIGNER_PHOTO = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face';

// ─── JPS Line Item Data (real project) ───────────────────────────────────────

interface JpsLineItem {
    id: number;
    qty: number;
    product: string;
    kd: boolean;
    deliveryCategory: string;
    deliveryMinPerItem: number;
    installCategory: string;
    installHrsPerItem: number;
    confidence: 'HIGH' | 'LOW';
    confidenceScore: number;
    flagged: boolean;
    flagReason?: string;
}

const JPS_LINE_ITEMS: JpsLineItem[] = [
    { id: 1, qty: 2, product: 'Pre-Install Site Visit', kd: false, deliveryCategory: '—', deliveryMinPerItem: 0, installCategory: 'Overhead', installHrsPerItem: 4.00, confidence: 'HIGH', confidenceScore: 99, flagged: false },
    { id: 2, qty: 1, product: 'Punch Walk', kd: false, deliveryCategory: '—', deliveryMinPerItem: 0, installCategory: 'Overhead', installHrsPerItem: 4.00, confidence: 'HIGH', confidenceScore: 99, flagged: false },
    { id: 3, qty: 2, product: 'Extra Trips', kd: false, deliveryCategory: '—', deliveryMinPerItem: 0, installCategory: 'Overhead — Logistics', installHrsPerItem: 8.00, confidence: 'HIGH', confidenceScore: 95, flagged: false },
    { id: 4, qty: 40, product: 'Healthcare Guest Chairs — Small Frame', kd: false, deliveryCategory: 'Patient/Guest Chair', deliveryMinPerItem: 30, installCategory: 'Seating — Guest', installHrsPerItem: 0.20, confidence: 'HIGH', confidenceScore: 96, flagged: false },
    { id: 5, qty: 119, product: 'KD SOI Amplify Task Chairs', kd: true, deliveryCategory: 'Task/Side Chair KD', deliveryMinPerItem: 30, installCategory: 'Seating — Task KD', installHrsPerItem: 0.30, confidence: 'HIGH', confidenceScore: 94, flagged: true, flagReason: 'Exceeds 50-chair scope limit (119 chairs)' },
    { id: 6, qty: 5, product: 'KD SOI Amplify Task Stools', kd: true, deliveryCategory: 'Task/Side Chair KD', deliveryMinPerItem: 30, installCategory: 'Seating — Task KD', installHrsPerItem: 0.33, confidence: 'HIGH', confidenceScore: 93, flagged: false },
    { id: 7, qty: 2, product: 'Folding Guest Chairs', kd: false, deliveryCategory: 'Stack or Folding Chair', deliveryMinPerItem: 10, installCategory: 'Seating — Folding', installHrsPerItem: 0.25, confidence: 'HIGH', confidenceScore: 95, flagged: false },
    { id: 8, qty: 2, product: 'Healthcare Guest Chairs — Full Frame', kd: false, deliveryCategory: 'Patient/Guest Chair', deliveryMinPerItem: 30, installCategory: 'Seating — Guest', installHrsPerItem: 0.25, confidence: 'HIGH', confidenceScore: 94, flagged: false },
    { id: 9, qty: 5, product: 'Healthcare Bariatric Chairs — Full Frame', kd: false, deliveryCategory: 'Patient/Guest Chair', deliveryMinPerItem: 30, installCategory: 'Seating — Bariatric', installHrsPerItem: 0.33, confidence: 'LOW', confidenceScore: 71, flagged: true, flagReason: 'Bariatric category — no standard rate match' },
    { id: 10, qty: 19, product: 'Plastic Stacking Chairs', kd: false, deliveryCategory: 'Stack or Folding Chair', deliveryMinPerItem: 10, installCategory: 'Seating — Stack', installHrsPerItem: 0.20, confidence: 'HIGH', confidenceScore: 96, flagged: false },
    { id: 11, qty: 28, product: 'Folding Seat Multipurpose Chairs', kd: false, deliveryCategory: 'Stack or Folding Chair', deliveryMinPerItem: 10, installCategory: 'Seating — Folding', installHrsPerItem: 0.25, confidence: 'HIGH', confidenceScore: 95, flagged: false },
    { id: 12, qty: 3, product: 'Pediatric Lounge Chairs', kd: false, deliveryCategory: 'Lounge Chair', deliveryMinPerItem: 30, installCategory: 'Seating — Lounge', installHrsPerItem: 0.33, confidence: 'LOW', confidenceScore: 68, flagged: true, flagReason: 'Pediatric variant — verify lounge classification' },
    { id: 13, qty: 17, product: 'Healthcare Lounge Chairs', kd: false, deliveryCategory: 'Lounge Chair', deliveryMinPerItem: 30, installCategory: 'Seating — Lounge', installHrsPerItem: 0.50, confidence: 'HIGH', confidenceScore: 92, flagged: false },
    { id: 14, qty: 1, product: 'Custom 8-Seat Back-to-Back Carolina Booth', kd: false, deliveryCategory: 'Sofa (3-4 person)', deliveryMinPerItem: 75, installCategory: 'Custom Assembly — Booth', installHrsPerItem: 3.00, confidence: 'LOW', confidenceScore: 62, flagged: true, flagReason: 'Custom product — no standard category match' },
    { id: 15, qty: 1, product: 'Custom OFS Coact Serpentine Lounge — 12 Seats', kd: false, deliveryCategory: 'Sleeper sofa/chair', deliveryMinPerItem: 150, installCategory: 'Custom Assembly — Lounge', installHrsPerItem: 12.00, confidence: 'LOW', confidenceScore: 58, flagged: true, flagReason: 'Custom 12-seat ganged — no standard rate' },
    { id: 16, qty: 2, product: 'Healthcare Recliners', kd: false, deliveryCategory: 'Lounge Chair', deliveryMinPerItem: 30, installCategory: 'Seating — Healthcare', installHrsPerItem: 1.00, confidence: 'HIGH', confidenceScore: 91, flagged: false },
    { id: 17, qty: 12, product: 'Glassboards 36×48', kd: false, deliveryCategory: 'Whiteboard wall-attached', deliveryMinPerItem: 90, installCategory: 'Wall Mount — Glassboard', installHrsPerItem: 2.50, confidence: 'HIGH', confidenceScore: 92, flagged: false },
    { id: 18, qty: 4, product: '24×72 Training Tables', kd: false, deliveryCategory: 'Training table w/wire mgmt', deliveryMinPerItem: 90, installCategory: 'Tables — Training', installHrsPerItem: 1.25, confidence: 'HIGH', confidenceScore: 90, flagged: false },
    { id: 19, qty: 7, product: '30×30 Cafe Tables', kd: false, deliveryCategory: 'Cafeteria Table Rd/Sq to 48"', deliveryMinPerItem: 45, installCategory: 'Tables — Cafe', installHrsPerItem: 1.25, confidence: 'HIGH', confidenceScore: 91, flagged: false },
    { id: 20, qty: 1, product: 'Waterfall Conference Table 84×24 — No Power', kd: false, deliveryCategory: 'Conference Table >72" <96"', deliveryMinPerItem: 180, installCategory: 'Tables — Conference Large', installHrsPerItem: 6.00, confidence: 'HIGH', confidenceScore: 89, flagged: false },
    { id: 21, qty: 2, product: 'D-Top Conference Tables 36×72 — No Power', kd: false, deliveryCategory: 'Conference Table >72" <96"', deliveryMinPerItem: 180, installCategory: 'Tables — Conference', installHrsPerItem: 4.00, confidence: 'HIGH', confidenceScore: 90, flagged: false },
    { id: 22, qty: 2, product: 'Solid Surface 24" Round Side Tables', kd: false, deliveryCategory: 'End/occasional (no assy)', deliveryMinPerItem: 30, installCategory: 'Tables — Side', installHrsPerItem: 1.00, confidence: 'HIGH', confidenceScore: 91, flagged: false },
    { id: 23, qty: 9, product: 'Solid Surface 20" Round Side Tables', kd: false, deliveryCategory: 'End/occasional (no assy)', deliveryMinPerItem: 30, installCategory: 'Tables — Side', installHrsPerItem: 1.00, confidence: 'HIGH', confidenceScore: 91, flagged: false },
    { id: 24, qty: 2, product: 'Solid Surface 36" Round Coffee Tables', kd: false, deliveryCategory: 'Coffee table', deliveryMinPerItem: 45, installCategory: 'Tables — Coffee', installHrsPerItem: 1.50, confidence: 'HIGH', confidenceScore: 90, flagged: false },
];

// ─── Computed totals ─────────────────────────────────────────────────────────
const INSTALL_RATE = 57;
const DELIVERY_RATE_PER_MIN = 0.95;
const INSTALL_TOTAL_HRS = JPS_LINE_ITEMS.reduce((s, i) => s + i.qty * i.installHrsPerItem, 0);
const INSTALL_TOTAL_COST = Math.round(INSTALL_TOTAL_HRS * INSTALL_RATE * 100) / 100;
const DELIVERY_BASE_MIN = JPS_LINE_ITEMS.reduce((s, i) => s + i.qty * i.deliveryMinPerItem, 0);
const SECTION_G_CHARGES = 171 + 114; // trip + hospital
const DELIVERY_TOTAL_COST = Math.round((DELIVERY_BASE_MIN * DELIVERY_RATE_PER_MIN + SECTION_G_CHARGES) * 100) / 100;
const COMBINED_TOTAL = Math.round((INSTALL_TOTAL_COST + DELIVERY_TOTAL_COST) * 100) / 100;
const REVIEWED_INSTALL_COST = Math.round(INSTALL_TOTAL_COST * 0.97 * 100) / 100;
const REVIEWED_COMBINED = Math.round((REVIEWED_INSTALL_COST + DELIVERY_TOTAL_COST) * 100) / 100;
const FLAGGED_COUNT = JPS_LINE_ITEMS.filter(i => i.flagged).length;

// ─── Cost Calculation Agents (w2.1) ──────────────────────────────────────────

const COST_AGENTS: AgentVis[] = [
    { name: 'DocumentLoader', detail: 'Loading Spec Narrative, Selection Doc, Site Reqs', visible: false, done: false },
    { name: 'RateCardEngine', detail: 'Applying Strata rate cards — delivery + installation', visible: false, done: false },
    { name: 'ScopeLimitChecker', detail: 'Validating scope limits and thresholds', visible: false, done: false },
    { name: 'SiteConditionAnalyzer', detail: 'Hospital site: restricted hours, freight elevator', visible: false, done: false },
    { name: 'DualCostEngine', detail: 'Running delivery + installation calculations in parallel', visible: false, done: false },
];

// ─── Business Rules (w2.1 revealed) ─────────────────────────────────────────

const BUSINESS_RULES = [
    {
        icon: 'rate', label: 'Rate Cards Applied', badge: 'STANDARD', badgeColor: 'green',
        items: [
            'Installation rate: $57/hr (Strata Healthcare Standard)',
            'Delivery base rate: $0.95/min (TX metro)',
            'KD assembly surcharge: +15% on KD items',
        ],
    },
    {
        icon: 'scope', label: 'Scope Limits Checked', badge: '1 ALERT', badgeColor: 'amber',
        items: [
            '119 KD Task Chairs exceed 50-chair Delivery Pricer limit',
            'Custom booth — no standard category match → manual rate',
            'Serpentine lounge — custom 12-seat → manual rate',
        ],
    },
    {
        icon: 'site', label: 'Site Conditions', badge: 'HOSPITAL', badgeColor: 'amber',
        items: [
            'Hospital delivery: restricted hours (6PM–6AM only)',
            'Freight elevator required — max load 3,000 lbs',
            'Section G trip charge: $171 + hospital surcharge: $114',
        ],
    },
    {
        icon: 'confidence', label: 'Confidence Analysis', badge: `${FLAGGED_COUNT} FLAGGED`, badgeColor: 'amber',
        items: [
            `${JPS_LINE_ITEMS.filter(i => i.confidence === 'HIGH').length} items HIGH confidence (>85% score)`,
            `${FLAGGED_COUNT} items LOW confidence — require expert review`,
            'Categories: bariatric, pediatric, custom assembly',
        ],
    },
];

// ─── Expert Adjustments (w2.1 revealed) ──────────────────────────────────────

const EXPERT_ADJUSTMENTS = [
    { id: 1, item: 'Healthcare Bariatric Chairs', issue: 'No standard rate match', aiSuggestion: 'Apply Lounge Chair rate ($0.33/hr) + 20% bariatric handling surcharge', impact: '+$4.95', requiresDesigner: false },
    { id: 2, item: 'Custom 8-Seat Carolina Booth', issue: 'Custom product — no category', aiSuggestion: 'Use Custom Assembly rate: 3.0 hrs base + 1.5 hrs site fit', impact: '+$256.50', requiresDesigner: false },
    { id: 3, item: 'OFS Coact Serpentine 12-Seat', issue: 'No standard ganged lounge rate — requires designer verification of connection hardware and modular configuration', aiSuggestion: 'Apply modular assembly: 12.0 hrs + 2.0 hrs alignment/leveling', impact: '+$114.00', requiresDesigner: true },
];

// ─── Agent Pipelines ─────────────────────────────────────────────────────────

// ─── Approval Chain (for w2.4 — Dealer review) ─────────────────────────────
const ESTIMATION_APPROVERS: Approver[] = [
    { name: 'Regional Sales Manager Reyes', role: 'Strata Expert', status: 'approved' },
    { name: 'Designer Alden', role: 'Designer', status: 'approved' },
    { name: 'Account Manager Kai', role: 'Dealer — WR', status: 'approved' },
    { name: 'Jordan Park', role: 'Product Owner', status: 'current' },
];

// ─── Designer Verification Agents (w2.2) ────────────────────────────────────
const DESIGNER_VERIFY_AGENTS: AgentVis[] = [
    { name: 'HardwareScanner', detail: 'Checking connection hardware specs for 12-seat serpentine', visible: false, done: false },
    { name: 'ModularValidator', detail: 'Verifying modular configuration — bracket compatibility', visible: false, done: false },
    { name: 'AssemblyEstimator', detail: 'Calculating assembly time: 12 × 1.0 hr + alignment', visible: false, done: false },
];

// ─── w2.2 Module definitions (interactive verification) ─────────────────────
const VERIFICATION_MODULES = [
    { id: 'estimation', label: 'Expert Estimation Summary', detail: `Delivery $${DELIVERY_TOTAL_COST.toLocaleString()} · Installation $${REVIEWED_INSTALL_COST.toLocaleString()} · Combined $${REVIEWED_COMBINED.toLocaleString()}` },
    { id: 'scope', label: 'Project Scope', detail: 'JPS Health Center — Healthcare · 24 items · Restricted hours, freight elevator' },
    { id: 'escalated', label: 'Escalated Item — OFS Serpentine', detail: 'Custom 12-seat ganged lounge — no standard rate, confidence 58%' },
    { id: 'verification', label: 'Assembly Verification', detail: 'Modular assembly confirmed — brackets compatible, 14.0 hrs total' },
    { id: 'rate', label: 'Applied Rate', detail: '12.0 hrs + 2.0 hrs alignment = 14.0 hrs × $57/hr = $798.00' },
];

// ─── w2.3: Sub-phase agent pipelines (from WrgAssembly) ─────────────────────
const STAGING_AGENTS: AgentVis[] = [
    { name: 'CoreMonitor', detail: 'Approved estimate $15,378 detected', visible: false, done: false },
    { name: 'SalesNotifier', detail: 'Salesperson emailed', visible: false, done: false },
    { name: 'ProductQuoteRetriever', detail: 'MillerKnoll $287,450 list', visible: false, done: false },
    { name: 'QuoteStager', detail: 'Both components staged', visible: false, done: false },
];
const MARKUP_AGENTS: AgentVis[] = [
    { name: 'DiscountResolver', detail: 'JPS contract 38% off list', visible: false, done: false },
    { name: 'LaborMarkupEngine', detail: '15% margin → $17,685', visible: false, done: false },
    { name: 'FreightCalculator', detail: '$6,234 freight', visible: false, done: false },
    { name: 'ProposalAssembler', detail: 'Total $202,138', visible: false, done: false },
];
const RELEASE_AGENTS: AgentVis[] = [
    { name: 'CoreWriter', detail: 'Proposal written to CORE', visible: false, done: false },
    { name: 'ProposalAttacher', detail: 'PDF + audit trail attached', visible: false, done: false },
    { name: 'ClientNotifier', detail: 'JPS Health Network notified', visible: false, done: false },
];

// ─── Pricing waterfall (from WrgAssembly) ───────────────────────────────────
const WATERFALL_ROWS: Array<{ label: string; value: string; type: 'base' | 'discount' | 'subtotal' | 'addon' | 'total' }> = [
    { label: 'Product List', value: '$287,450', type: 'base' },
    { label: 'JPS Contract -38%', value: '', type: 'discount' },
    { label: 'Product Net', value: '$178,219', type: 'subtotal' },
    { label: 'Labor (15% margin)', value: '$17,685', type: 'addon' },
    { label: 'Freight', value: '$6,234', type: 'addon' },
    { label: 'Total', value: '$202,138', type: 'total' },
];
const waterfallStyles: Record<string, string> = {
    base: 'p-3 bg-card border-b border-border',
    discount: 'px-3 py-1.5 bg-muted/30 border-b border-border',
    subtotal: 'p-3 bg-green-50 dark:bg-green-500/5 border-b border-border',
    addon: 'p-3 bg-blue-50 dark:bg-blue-500/5 border-b border-border',
    total: 'p-4 bg-brand-50 dark:bg-brand-500/5 border-2 border-brand-400 dark:border-brand-500/40',
};
const waterfallTextStyles: Record<string, string> = {
    base: 'text-foreground',
    discount: 'text-green-700 dark:text-green-400',
    subtotal: 'text-green-700 dark:text-green-400',
    addon: 'text-blue-700 dark:text-blue-400',
    total: 'text-foreground',
};

// ─── Cost breakdown details (w2.3 expandable cards) ─────────────────────────
const DELIVERY_BREAKDOWN = [
    { category: 'Seating — Chairs & Task', items: '162 pcs', minutes: '4,980 min', detail: 'Guest, task KD, stacking, folding, bariatric' },
    { category: 'Seating — Lounge & Custom', items: '23 pcs', minutes: '930 min', detail: 'Lounge, recliners, Carolina Booth, OFS Serpentine' },
    { category: 'Tables & Surfaces', items: '25 pcs', minutes: '1,290 min', detail: 'Training, café, conference, side, coffee' },
    { category: 'Wall-Mount', items: '12 pcs', minutes: '1,080 min', detail: 'Glassboards 36×48 with mounting hardware' },
    { category: 'Overhead — Logistics', items: '5 trips', minutes: '0 min', detail: 'Pre-install visit, punch walk, extra trips' },
    { category: 'Section G — Site Charges', items: '—', minutes: '$285', detail: 'Trip charge ($171) + hospital surcharge ($114)' },
];

const INSTALLATION_BREAKDOWN = [
    { category: 'Task Seating KD (+15%)', items: '124 pcs', hours: '42.8 hrs', detail: 'KD assembly surcharge applied — SOI Amplify chairs & stools' },
    { category: 'Guest & Stack Seating', items: '71 pcs', hours: '21.6 hrs', detail: 'Healthcare guest, folding, stacking, bariatric' },
    { category: 'Lounge & Specialty', items: '22 pcs', hours: '23.3 hrs', detail: 'Lounge chairs, recliners, pediatric variant' },
    { category: 'Custom Assembly', items: '2 pcs', hours: '15.0 hrs', detail: 'Carolina Booth (3.0 hrs) + OFS Serpentine (12.0 hrs)' },
    { category: 'Tables', items: '25 pcs', hours: '37.0 hrs', detail: 'Conference, training, café, side, coffee tables' },
    { category: 'Wall Mount — Glassboards', items: '12 pcs', hours: '30.0 hrs', detail: '2.5 hrs each — drill, level, anchor, hang' },
    { category: 'Overhead', items: '5 visits', hours: '16.0 hrs', detail: 'Site visits (8 hrs), punch walk (4 hrs), logistics' },
];

const COMBINED_BREAKDOWN = [
    { label: 'Delivery base', value: `$${(DELIVERY_BASE_MIN * DELIVERY_RATE_PER_MIN).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, note: `${DELIVERY_BASE_MIN.toLocaleString()} min × $0.95/min` },
    { label: 'Section G charges', value: `$${SECTION_G_CHARGES}`, note: 'Trip + hospital surcharge' },
    { label: 'Installation labor', value: `$${REVIEWED_INSTALL_COST.toLocaleString()}`, note: `${INSTALL_TOTAL_HRS.toFixed(1)} hrs × $57/hr (adjusted)` },
    { label: 'Expert adjustments', value: '+$375.45', note: 'Bariatric +$4.95, Carolina +$256.50, OFS +$114.00' },
    { label: 'Items resolved', value: '24 / 24', note: '5 flagged → all reviewed & approved' },
];

// ─── Project intake report (shared by w2.3 and w2.4) ────────────────────────
const INTAKE_REPORT = {
    project: [
        { label: 'Project', value: 'JPS Health Center for Women' },
        { label: 'Client', value: 'JPS Health Network' },
        { label: 'Vertical', value: 'Healthcare', badge: 'HC' },
        { label: 'Area', value: '14,200 sqft · 6 floors' },
        { label: 'Location', value: 'Fort Worth, TX (JPS campus)' },
        { label: 'Site', value: 'Hospital delivery — restricted hours', badge: 'HOSP' },
    ],
    scope: [
        { label: 'Manufacturer', value: 'MillerKnoll (Herman Miller Healthcare)' },
        { label: 'Line Items', value: '24 products across 4 categories' },
        { label: 'Special Items', value: '2 custom configurations (Carolina Booth, OFS Serpentine)' },
        { label: 'Documents', value: 'Spec Narrative, Selection Doc, Site Requirements' },
    ],
    team: [
        { name: 'Regional Sales Manager Reyes', role: 'Strata Expert', detail: 'Dallas, TX · 96.3% HC accuracy · 60% workload', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
        { name: 'Designer Alden', role: 'Designer', detail: 'Verified OFS Serpentine · 5 modules validated', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face' },
    ],
    registration: [
        { label: 'Smartsheet Row', value: '#2026-JPS-HCW' },
        { label: 'Estimation Template', value: 'Complex Sheet (>50 items)' },
        { label: 'Quote Type', value: 'Product + Installation Labor + Delivery' },
    ],
    mismatches: [
        { item: 'Plastic Stacking Chair', badge: 'QTY MISMATCH', resolution: 'Qty updated to 20' },
        { item: 'OFS Coact Serpentine', badge: 'CUSTOM CONFIG', resolution: '12-week lead accepted' },
        { item: 'Nemschoff NC-2240 Recliner', badge: 'DISCONTINUED', resolution: 'Replaced with NC-2250' },
    ],
};

// ─── Staging cards breakdown (w2.3 staging-revealed) ────────────────────────
const LABOR_ESTIMATE_BREAKDOWN = [
    { label: 'Installation labor', value: `$${REVIEWED_INSTALL_COST.toLocaleString()}`, detail: `${INSTALL_TOTAL_HRS.toFixed(1)} hrs × $57/hr (Strata HC Standard)` },
    { label: 'KD assembly surcharge', value: '+$450', detail: '124 KD chairs — 15% surcharge on assembly time' },
    { label: 'Delivery base', value: `$${(DELIVERY_BASE_MIN * DELIVERY_RATE_PER_MIN).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, detail: `${DELIVERY_BASE_MIN.toLocaleString()} min × $0.95/min (TX metro rate)` },
    { label: 'Section G — site charges', value: `$${SECTION_G_CHARGES}`, detail: 'Trip charge $171 + hospital surcharge $114' },
    { label: 'Expert adjustments', value: '+$375', detail: 'Bariatric (+$4.95), Carolina Booth (+$256.50), OFS Serpentine (+$114)' },
    { label: 'Designer verification', value: '—', detail: 'OFS Serpentine 14.0 hrs confirmed — brackets compatible' },
];

const PRODUCT_QUOTE_BREAKDOWN = [
    { label: 'Seating — task & guest', value: '$142,800', detail: '166 pcs — SOI Amplify, healthcare guest, stacking, folding' },
    { label: 'Seating — lounge & specialty', value: '$68,500', detail: '23 pcs — lounge, recliners, bariatric, pediatric' },
    { label: 'Custom products', value: '$38,200', detail: 'Carolina Booth ($12,400) + OFS Serpentine ($25,800)' },
    { label: 'Tables & surfaces', value: '$24,350', detail: '25 pcs — conference, training, café, side, coffee' },
    { label: 'Wall-mount accessories', value: '$13,600', detail: '12 glassboards 36×48 with mounting hardware' },
];

// ─── Dealer picker options (for w2.3 send) ──────────────────────────────────
const DEALER_OPTIONS = [
    { name: 'Account Manager Kai', role: 'Account Manager', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face' },
    { name: 'Jordan Park', role: 'Product Owner', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face' },
    { name: 'Michael Torres', role: 'Regional Director', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face' },
];

// ═════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT: WrgLaborEstimation (steps w2.1, w2.2, w2.3)
// ═════════════════════════════════════════════════════════════════════════════

export default function WrgLaborEstimation({ onNavigate }: { onNavigate: (page: string) => void }) {
    const { currentStep, nextStep, isPaused } = useDemo();
    const stepId = currentStep.id;

    // pauseAware
    const isPausedRef = useRef(isPaused);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    const pauseAware = useCallback((fn: () => void) => {
        return () => {
            if (!isPausedRef.current) { fn(); return; }
            const poll = setInterval(() => {
                if (!isPausedRef.current) { clearInterval(poll); fn(); }
            }, 200);
        };
    }, []);

    // runChain: sorts events by absolute time and chains them one by one so that
    // pause correctly halts the entire sequence, not just the current callback.
    const runChain = useCallback((
        events: Array<[number, () => void]>,
        timers: ReturnType<typeof setTimeout>[]
    ) => {
        const sorted = [...events].sort((a, b) => a[0] - b[0]);
        const step = (i: number) => {
            if (i >= sorted.length) return;
            const prevTime = i === 0 ? 0 : sorted[i - 1][0];
            const delay = Math.max(1, sorted[i][0] - prevTime);
            timers.push(setTimeout(pauseAware(() => { sorted[i][1](); step(i + 1); }), delay));
        };
        step(0);
    }, [pauseAware]);

    const tp = (id: string): WrgStepTiming => WRG_STEP_TIMING[id] || WRG_STEP_TIMING['w2.1'];

    // ── Phase state (shared by w2.1 and w2.2) ─────────────────────────────
    const [phase, setPhase] = useState<PipelinePhase>('idle');
    const [agents, setAgents] = useState<AgentVis[]>([]);
    const [progress, setProgress] = useState(0);

    // w2.1: dual engine progress
    const [deliveryProgress, setDeliveryProgress] = useState(0);
    const [installProgress, setInstallProgress] = useState(0);
    const [showScopeAlert, setShowScopeAlert] = useState(false);
    const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set(['rate', 'scope', 'site', 'confidence']));
    const [adjustments, setAdjustments] = useState<Record<number, boolean>>({});
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [manualRate, setManualRate] = useState('');
    const [manualHrs, setManualHrs] = useState('');
    const [manualNote, setManualNote] = useState('');
    const [manualEdits, setManualEdits] = useState<Record<number, { rate: string; hrs: string; note: string }>>({});

    // w2.1: only non-designer items can be adjusted here
    const expertOnlyAdjusted = EXPERT_ADJUSTMENTS.filter(a => !a.requiresDesigner).every(a => adjustments[a.id]);

    // w2.2: designer module validation
    const [designerVerified, setDesignerVerified] = useState(false);
    const [moduleValidated, setModuleValidated] = useState<Record<string, boolean>>({});
    const [moduleComments, setModuleComments] = useState<Record<string, string>>({});
    const [commentingModule, setCommentingModule] = useState<string | null>(null);
    const [commentDraft, setCommentDraft] = useState('');
    const [searchFilter, setSearchFilter] = useState('');
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const allModulesValidated = VERIFICATION_MODULES.every(m => moduleValidated[m.id]);

    // w2.3: cost cards expanded state (expanded by default)
    const [expandedCostCards, setExpandedCostCards] = useState<Set<string>>(new Set(['delivery', 'installation', 'combined', 'labor', 'product']));
    const toggleCostCard = (card: string) => setExpandedCostCards(prev => { const n = new Set(prev); n.has(card) ? n.delete(card) : n.add(card); return n; });

    // w2.3: sub-phase state
    const [subPhase, setSubPhase] = useState<ConfirmSubPhase>('confirm');
    const [subAgents, setSubAgents] = useState<AgentVis[]>([]);
    const [subProgress, setSubProgress] = useState(0);
    const [showDealerPicker, setShowDealerPicker] = useState(false);
    const [selectedDealer, setSelectedDealer] = useState<string | null>(null);
    const [sendingToDealer, setSendingToDealer] = useState(false);
    const [showProposalPreview, setShowProposalPreview] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [fieldOverrides, setFieldOverrides] = useState<Record<string, string>>({});
    const [expertNotes, setExpertNotes] = useState('');

    // ── Step init effect ─────────────────────────────────────────────────────
    useEffect(() => {
        if (stepId === 'w2.1') {
            setPhase('idle');
            setProgress(0);
            setDeliveryProgress(0);
            setInstallProgress(0);
            setShowScopeAlert(false);
            setExpandedRules(new Set(['rate', 'scope', 'site', 'confidence']));
            setAdjustments({});

            setAgents(COST_AGENTS.map(a => ({ ...a, visible: false, done: false })));

            const t = tp(stepId);
            const timer = setTimeout(pauseAware(() => setPhase('notification')), t.notifDelay);
            return () => clearTimeout(timer);
        }

        if (stepId === 'w2.2') {
            setPhase('idle');
            setProgress(0);
            setDesignerVerified(false);
            setModuleValidated({});
            setModuleComments({});
            setCommentingModule(null);
            setCommentDraft('');
            setSearchFilter('');
            setShowPdfPreview(false);
            setAgents(DESIGNER_VERIFY_AGENTS.map(a => ({ ...a, visible: false, done: false })));

            const timer = setTimeout(pauseAware(() => setPhase('notification')), 1750);
            return () => clearTimeout(timer);
        }

        if (stepId === 'w2.3') {
            setSubPhase('confirm');
            setSubAgents([]);
            setSubProgress(0);
            setShowDealerPicker(false);
            setSelectedDealer(null);
            setSendingToDealer(false);
        }
    }, [stepId, pauseAware]);

    // ── Notification → processing ─────────────────────────────────────────
    // w2.1: waits for button click. w2.2: auto-advance after delay.
    useEffect(() => {
        if (phase !== 'notification') return;
        if (stepId === 'w2.1') return; // w2.1 waits for button click
        if (stepId === 'w2.2') {
            const timer = setTimeout(pauseAware(() => setPhase('processing')), 5100);
            return () => clearTimeout(timer);
        }
    }, [phase, stepId, pauseAware]);

    // ── Processing: agent pipeline (chained for correct pause behavior) ───────
    useEffect(() => {
        if (phase !== 'processing') return;
        const timers: ReturnType<typeof setTimeout>[] = [];

        if (stepId === 'w2.1') {
            setAgents(prev => prev.map(a => ({ ...a, visible: false, done: false })));
            setProgress(0);
            const totalAgents = COST_AGENTS.length;
            const stagger = 1500;
            const doneDelay = 1000;
            const dualStart = stagger * totalAgents;
            const totalTime = stagger * totalAgents + doneDelay + 3800;

            const events: Array<[number, () => void]> = [];
            for (let i = 0; i < totalAgents; i++) {
                const idx = i;
                events.push([stagger * idx, () => setAgents(prev => prev.map((a, j) => j === idx ? { ...a, visible: true } : a))]);
                events.push([stagger * idx + doneDelay, () => setAgents(prev => prev.map((a, j) => j === idx ? { ...a, done: true } : a))]);
            }
            events.push([stagger * 2, () => setShowScopeAlert(true)]);
            for (let i = 1; i <= 20; i++) {
                const dp = i * 5, ip = i * 5;
                events.push([dualStart + 170 * i, () => setDeliveryProgress(dp)]);
                events.push([dualStart + 170 * i + 340, () => setInstallProgress(ip)]);
            }
            for (let i = 1; i <= 20; i++) {
                const pct = i * 5;
                events.push([(totalTime / 20) * i, () => setProgress(pct)]);
            }
            events.push([totalTime + 200, () => setPhase('breathing')]);
            runChain(events, timers);
        }

        if (stepId === 'w2.2') {
            setAgents(prev => prev.map(a => ({ ...a, visible: false, done: false })));
            setProgress(0);
            const totalAgents = DESIGNER_VERIFY_AGENTS.length;
            const stagger = 1700;
            const doneDelay = 1200;
            const totalTime = stagger * totalAgents + doneDelay;

            const events: Array<[number, () => void]> = [];
            for (let i = 0; i < totalAgents; i++) {
                const idx = i;
                events.push([stagger * idx, () => setAgents(prev => prev.map((a, j) => j === idx ? { ...a, visible: true } : a))]);
                events.push([stagger * idx + doneDelay, () => setAgents(prev => prev.map((a, j) => j === idx ? { ...a, done: true } : a))]);
            }
            for (let i = 1; i <= 20; i++) {
                const pct = i * 5;
                events.push([(totalTime / 20) * i, () => setProgress(pct)]);
            }
            events.push([totalTime + 200, () => setPhase('breathing')]);
            runChain(events, timers);
        }

        return () => timers.forEach(clearTimeout);
    }, [phase, stepId, pauseAware, runChain]);

    // ── Breathing → revealed ─────────────────────────────────────────────────
    useEffect(() => {
        if (phase !== 'breathing') return;
        const breathing = stepId === 'w2.2' ? 1400 : tp(stepId).breathing;
        const timer = setTimeout(pauseAware(() => setPhase('revealed')), breathing);
        return () => clearTimeout(timer);
    }, [phase, stepId, pauseAware]);

    // ── w2.3 sub-phase pipelines ─────────────────────────────────────────────
    useEffect(() => {
        if (stepId !== 'w2.3') return;
        if (subPhase !== 'staging-pipeline' && subPhase !== 'markup-pipeline') return;
        const agentList = subPhase === 'staging-pipeline' ? STAGING_AGENTS : MARKUP_AGENTS;
        setSubAgents(agentList.map(a => ({ ...a, visible: false, done: false })));
        setSubProgress(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        const stagger = 1400;
        const doneDelay = 900;
        const totalTime = stagger * agentList.length + doneDelay;
        const nextPhase: ConfirmSubPhase = subPhase === 'staging-pipeline' ? 'staging-revealed' : 'markup-revealed';

        const events: Array<[number, () => void]> = [];
        for (let i = 0; i < agentList.length; i++) {
            const idx = i;
            events.push([stagger * idx, () => setSubAgents(prev => prev.map((a, j) => j === idx ? { ...a, visible: true } : a))]);
            events.push([stagger * idx + doneDelay, () => setSubAgents(prev => prev.map((a, j) => j === idx ? { ...a, done: true } : a))]);
        }
        for (let i = 1; i <= 20; i++) {
            const pct = i * 5;
            events.push([(totalTime / 20) * i, () => setSubProgress(pct)]);
        }
        events.push([totalTime + 1400, () => setSubPhase(nextPhase)]);
        runChain(events, timers);
        return () => timers.forEach(clearTimeout);
    }, [stepId, subPhase, pauseAware, runChain]);

    // ── Render helper: agent pipeline ────────────────────────────────────────
    const renderAgentPipeline = (agts: AgentVis[], prog: number, label: string) => (
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-3">
                <AIAgentAvatar />
                <span className="text-xs font-bold text-foreground">{label}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                <div className="h-full rounded-full bg-brand-400 transition-all duration-[3500ms] ease-linear" style={{ width: `${prog}%` }} />
            </div>
            <div className="space-y-1.5">
                {agts.map(agent => (
                    <div key={agent.name} className={`flex items-center gap-2 text-[10px] transition-all duration-300 ${agent.visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                        {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-indigo-500 animate-spin shrink-0" />}
                        <span className={agent.done ? 'text-foreground' : 'text-indigo-600 dark:text-indigo-400'}>{agent.name}</span>
                        <span className="text-muted-foreground">{agent.detail}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    // ═════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═════════════════════════════════════════════════════════════════════════

    if (!['w2.1', 'w2.2', 'w2.3'].includes(stepId)) return null;

    return (
        <div className="p-6 space-y-4 max-w-5xl mx-auto">

            {/* ── w2.1: Dual-Engine Cost Calculation ── */}
            {stepId === 'w2.1' && (
                <>
                    {/* Interactive notification — button to start */}
                    {phase === 'notification' && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-3">
                            <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-brand-500 text-zinc-900">
                                        <CalculatorIcon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-foreground">Cost Estimation — JPS Health Center</span>
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">Ready</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            5 estimation agents will analyze documents, apply rate cards, check scope limits, and run dual-engine calculation for delivery + installation costs.
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                                            <span className="flex items-center gap-1"><DocumentTextIcon className="h-3 w-3" /> 3 docs</span>
                                            <span className="flex items-center gap-1"><CubeIcon className="h-3 w-3" /> 24 items</span>
                                            <span className="flex items-center gap-1"><ShieldCheckIcon className="h-3 w-3" /> 4 rule sets</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setPhase('processing')}
                                className="w-full py-3 rounded-xl text-xs font-bold bg-brand-400 text-zinc-900 hover:bg-brand-300 shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <CalculatorIcon className="h-4 w-4" />
                                Start Estimation Agents
                            </button>
                        </div>
                    )}

                    {/* Scope alert — shows during processing + revealed */}
                    {(phase === 'processing' || phase === 'breathing' || phase === 'revealed') && showScopeAlert && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-300 dark:border-amber-500/30 flex items-start gap-2">
                                <ExclamationTriangleIcon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400">Scope Limit Alert</span>
                                    <p className="text-[10px] text-amber-700 dark:text-amber-400/80 mt-0.5">
                                        119 KD Task Chairs exceed the 50-chair Delivery Pricer limit. Expert override will be required.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Processing — agent pipeline + document panel + dual engines */}
                    {phase === 'processing' && (
                        <div className="space-y-3 animate-in fade-in duration-300">
                            {/* Agent pipeline */}
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <AIAgentAvatar />
                                    <span className="text-xs font-bold text-foreground">Estimation Pipeline</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                    <div className="h-full rounded-full bg-brand-400 transition-all duration-[3500ms] ease-linear" style={{ width: `${progress}%` }} />
                                </div>
                                <div className="space-y-1.5">
                                    {agents.map(agent => (
                                        <div key={agent.name} className={`flex items-center gap-2 text-[10px] transition-all duration-300 ${agent.visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                                            {agent.done ?
                                                <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> :
                                                <ArrowPathIcon className="h-3.5 w-3.5 text-indigo-500 animate-spin shrink-0" />
                                            }
                                            <span className={agent.done ? 'text-foreground' : 'text-indigo-600 dark:text-indigo-400'}>{agent.name}</span>
                                            <span className="text-muted-foreground">{agent.detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Documents being analyzed */}
                            <div className="p-3 rounded-xl bg-card border border-border">
                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Documents Analyzed</div>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { name: 'Spec Narrative', pages: '12 pg', icon: <DocumentTextIcon className="h-3.5 w-3.5" /> },
                                        { name: 'Selection Document', pages: '8 pg', icon: <ClipboardDocumentListIcon className="h-3.5 w-3.5" /> },
                                        { name: 'Site Requirements', pages: '4 pg', icon: <AdjustmentsHorizontalIcon className="h-3.5 w-3.5" /> },
                                    ].map(doc => (
                                        <div key={doc.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border">
                                            <span className="text-indigo-500">{doc.icon}</span>
                                            <div className="min-w-0">
                                                <div className="text-[9px] font-bold text-foreground truncate">{doc.name}</div>
                                                <div className="text-[8px] text-muted-foreground">{doc.pages}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Dual engine progress */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-card border border-blue-200 dark:border-blue-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TruckIcon className="h-3.5 w-3.5 text-blue-500" />
                                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Delivery</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-blue-100 dark:bg-blue-500/10 overflow-hidden mb-1.5">
                                        <div className="h-full rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${deliveryProgress}%` }} />
                                    </div>
                                    {deliveryProgress >= 100 && <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400">${DELIVERY_TOTAL_COST.toLocaleString()}</div>}
                                </div>
                                <div className="p-3 rounded-xl bg-card border border-green-200 dark:border-green-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <WrenchScrewdriverIcon className="h-3.5 w-3.5 text-green-500" />
                                        <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Installation</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-green-100 dark:bg-green-500/10 overflow-hidden mb-1.5">
                                        <div className="h-full rounded-full bg-green-500 transition-all duration-300" style={{ width: `${installProgress}%` }} />
                                    </div>
                                    {installProgress >= 100 && <div className="text-[10px] font-bold text-green-700 dark:text-green-400">${INSTALL_TOTAL_COST.toLocaleString()}</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Revealed — totals + business rules + expert adjustments */}
                    {(phase === 'breathing' || phase === 'revealed') && (
                        <div className="animate-in fade-in duration-500 space-y-3">
                            {/* Cost totals */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <TruckIcon className="h-3.5 w-3.5 text-blue-500" />
                                        <span className="text-[9px] text-muted-foreground uppercase">Delivery</span>
                                    </div>
                                    <div className="text-lg font-bold text-blue-700 dark:text-blue-400">${DELIVERY_TOTAL_COST.toLocaleString()}</div>
                                    <div className="text-[9px] text-muted-foreground">{DELIVERY_BASE_MIN} min + Section G</div>
                                </div>
                                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <WrenchScrewdriverIcon className="h-3.5 w-3.5 text-green-500" />
                                        <span className="text-[9px] text-muted-foreground uppercase">Installation</span>
                                    </div>
                                    <div className="text-lg font-bold text-green-700 dark:text-green-400">${INSTALL_TOTAL_COST.toLocaleString()}</div>
                                    <div className="text-[9px] text-muted-foreground">{INSTALL_TOTAL_HRS.toFixed(1)} hrs × $57/hr</div>
                                </div>
                                <div className="p-3 rounded-xl bg-card border-2 border-foreground/20">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <CalculatorIcon className="h-3.5 w-3.5 text-foreground" />
                                        <span className="text-[9px] text-muted-foreground uppercase">Combined</span>
                                    </div>
                                    <div className="text-lg font-bold text-foreground">${COMBINED_TOTAL.toLocaleString()}</div>
                                    <div className="text-[9px] text-muted-foreground">24 items · {FLAGGED_COUNT} flagged</div>
                                </div>
                            </div>

                            {/* Business rules tracking */}
                            <div className="p-4 rounded-xl bg-card border border-border">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Estimation Criteria & Rules Applied</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {BUSINESS_RULES.map(rule => {
                                        const ruleIcons: Record<string, React.ReactNode> = {
                                            rate: <CalculatorIcon className="h-4 w-4" />,
                                            scope: <ShieldCheckIcon className="h-4 w-4" />,
                                            site: <TruckIcon className="h-4 w-4" />,
                                            confidence: <AdjustmentsHorizontalIcon className="h-4 w-4" />,
                                        };
                                        const isExpanded = expandedRules.has(rule.icon);
                                        const colorMap: Record<string, string> = {
                                            green: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30',
                                            amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30',
                                        };
                                        return (
                                            <div key={rule.icon} className="rounded-lg border border-border overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedRules(prev => {
                                                        const next = new Set(prev);
                                                        next.has(rule.icon) ? next.delete(rule.icon) : next.add(rule.icon);
                                                        return next;
                                                    })}
                                                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                                                >
                                                    <span className="text-indigo-500 shrink-0">{ruleIcons[rule.icon]}</span>
                                                    <span className="text-[10px] font-bold text-foreground flex-1">{rule.label}</span>
                                                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold shrink-0 ${colorMap[rule.badgeColor]}`}>{rule.badge}</span>
                                                    <ChevronDownIcon className={`w-3 h-3 text-muted-foreground transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                                                </button>
                                                {isExpanded && (
                                                    <div className="px-3 pb-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                                        <div className="space-y-1 pt-1 border-t border-border">
                                                            {rule.items.map((item, i) => (
                                                                <div key={i} className="flex items-start gap-2 py-0.5">
                                                                    <CheckCircleIcon className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                                                                    <span className="text-[10px] text-foreground">{item}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Expert Adjustments — flagged items for review */}
                            {phase === 'revealed' && (
                                <div className="p-4 rounded-xl bg-card border border-border">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expert Review — Flagged Items</div>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${expertOnlyAdjusted ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30'}`}>
                                            {Object.values(adjustments).filter(Boolean).length}/{EXPERT_ADJUSTMENTS.filter(a => !a.requiresDesigner).length} REVIEWED
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {EXPERT_ADJUSTMENTS.map(adj => (
                                            <div key={adj.id} className={`p-3 rounded-lg border transition-all duration-300 ${adjustments[adj.id] ? 'bg-green-50/50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20' : adj.requiresDesigner ? 'bg-sky-50/30 dark:bg-sky-500/5 border-sky-200 dark:border-sky-500/20' : 'bg-amber-50/30 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20'}`}>
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="text-[11px] font-bold text-foreground">{adj.item}</div>
                                                        <div className="text-[10px] text-muted-foreground">{adj.issue}</div>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 shrink-0">{adj.impact}</span>
                                                </div>
                                                {adj.requiresDesigner ? (
                                                    /* Designer escalation — shown as pending, resolved in w2.2 */
                                                    <div className="flex items-start gap-2 p-2 rounded-md bg-sky-50/50 dark:bg-sky-500/5 border border-sky-200/50 dark:border-sky-500/20">
                                                        <UserGroupIcon className="h-3.5 w-3.5 text-sky-500 shrink-0 mt-0.5" />
                                                        <div className="flex-1">
                                                            <div className="text-[9px] font-bold text-sky-600 dark:text-sky-400 mb-0.5">Requires Designer Verification</div>
                                                            <div className="text-[10px] text-foreground">Connection hardware and modular configuration need designer sign-off before rate can be applied.</div>
                                                        </div>
                                                    </div>
                                                ) : !adjustments[adj.id] ? (
                                                    /* Standard expert adjustment — apply AI or edit manually */
                                                    editingItemId === adj.id ? (
                                                        /* Manual edit form */
                                                        <div className="p-2.5 rounded-md bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/20 space-y-2 animate-in fade-in duration-200">
                                                            <div className="flex items-center gap-1.5">
                                                                <PencilSquareIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                                                <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400">Manual Override</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className="text-[8px] font-bold text-muted-foreground uppercase">Rate / Unit</label>
                                                                    <input value={manualRate} onChange={e => setManualRate(e.target.value)} placeholder="e.g. $0.40/hr" className="w-full mt-0.5 px-2 py-1 rounded-md text-[10px] bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-400" />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[8px] font-bold text-muted-foreground uppercase">Hours</label>
                                                                    <input value={manualHrs} onChange={e => setManualHrs(e.target.value)} placeholder="e.g. 1.5 hrs" className="w-full mt-0.5 px-2 py-1 rounded-md text-[10px] bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-400" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-[8px] font-bold text-muted-foreground uppercase">Note</label>
                                                                <input value={manualNote} onChange={e => setManualNote(e.target.value)} placeholder="Justification for override..." className="w-full mt-0.5 px-2 py-1 rounded-md text-[10px] bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-400" />
                                                            </div>
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => setEditingItemId(null)} className="px-2.5 py-1 rounded-md text-[9px] font-bold text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                                                                <button
                                                                    onClick={() => { setManualEdits(prev => ({ ...prev, [adj.id]: { rate: manualRate, hrs: manualHrs, note: manualNote } })); setAdjustments(prev => ({ ...prev, [adj.id]: true })); setEditingItemId(null); }}
                                                                    className="px-2.5 py-1 rounded-md text-[9px] font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center gap-1"
                                                                >
                                                                    <CheckIcon className="h-3 w-3" />
                                                                    Apply Override
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        /* AI suggestion + Edit button */
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-start gap-2 p-2 rounded-md bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-200/50 dark:border-indigo-500/20">
                                                                <SparklesIcon className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                                                <div className="flex-1">
                                                                    <div className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 mb-0.5">AI Suggestion</div>
                                                                    <div className="text-[10px] text-foreground">{adj.aiSuggestion}</div>
                                                                </div>
                                                                <button
                                                                    onClick={() => setAdjustments(prev => ({ ...prev, [adj.id]: true }))}
                                                                    className="px-2.5 py-1.5 rounded-md text-[9px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shrink-0 flex items-center gap-1"
                                                                >
                                                                    <CheckIcon className="h-3 w-3" />
                                                                    Apply
                                                                </button>
                                                            </div>
                                                            <button
                                                                onClick={() => { setEditingItemId(adj.id); setManualRate(''); setManualHrs(''); setManualNote(''); }}
                                                                className="w-full py-1.5 rounded-md text-[9px] font-bold border border-dashed border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-colors flex items-center justify-center gap-1.5"
                                                            >
                                                                <PencilSquareIcon className="h-3 w-3" />
                                                                Edit Manually
                                                            </button>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="flex items-center gap-2 text-[10px] text-green-700 dark:text-green-400">
                                                        <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" />
                                                        {manualEdits[adj.id] ? (
                                                            <div>
                                                                <span className="font-bold">Manual override applied</span>
                                                                <span className="text-muted-foreground ml-1">— {manualEdits[adj.id].rate} · {manualEdits[adj.id].hrs}{manualEdits[adj.id].note ? ` · "${manualEdits[adj.id].note}"` : ''}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="font-bold">Applied — {adj.aiSuggestion.split('.')[0]}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* "Ask Designer" button — appears when expert items resolved, triggers nextStep to w2.2 */}
                            {phase === 'revealed' && expertOnlyAdjusted && (
                                <button
                                    onClick={() => nextStep()}
                                    className="w-full py-3 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <PaperAirplaneIcon className="h-3.5 w-3.5" />
                                    Send to Designer for Verification
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ── w2.2: Designer Verification Page ── */}
            {stepId === 'w2.2' && (
                <>
                    {/* Notification — escalation request from Expert */}
                    {phase === 'notification' && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-3">
                            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-500/10 border-2 border-sky-400 dark:border-sky-500/40 shadow-lg shadow-sky-500/10">
                                <div className="flex items-start gap-3">
                                    <img src={EXPERT_PHOTO} alt="" className="w-10 h-10 rounded-full ring-2 ring-sky-400" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-foreground">Verification Request from Regional Sales Manager Reyes</span>
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-500 text-white font-bold">ESCALATED</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            Custom OFS Coact Serpentine Lounge — 12 Seats. Need verification of connection hardware specs and modular assembly configuration before rate can be applied.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Processing — designer verification agents */}
                    {phase === 'processing' && (
                        <div className="space-y-3 animate-in fade-in duration-300">
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <img src={DESIGNER_PHOTO} alt="" className="w-6 h-6 rounded-full ring-1 ring-sky-400" />
                                    <span className="text-xs font-bold text-foreground">Designer Verification</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                    <div className="h-full rounded-full bg-sky-500 transition-all duration-[3500ms] ease-linear" style={{ width: `${progress}%` }} />
                                </div>
                                <div className="space-y-1.5">
                                    {agents.map(agent => (
                                        <div key={agent.name} className={`flex items-center gap-2 text-[10px] transition-all duration-300 ${agent.visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                                            {agent.done ?
                                                <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> :
                                                <ArrowPathIcon className="h-3.5 w-3.5 text-sky-500 animate-spin shrink-0" />
                                            }
                                            <span className={agent.done ? 'text-foreground' : 'text-sky-600 dark:text-sky-400'}>{agent.name}</span>
                                            <span className="text-muted-foreground">{agent.detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Revealed — Interactive module verification */}
                    {(phase === 'breathing' || phase === 'revealed') && (
                        <div className="animate-in fade-in duration-500 space-y-3">

                            {/* Search bar */}
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search modules..."
                                    value={searchFilter}
                                    onChange={e => setSearchFilter(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                                />
                                {searchFilter && (
                                    <button onClick={() => setSearchFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <XMarkIcon className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                    </button>
                                )}
                            </div>

                            {/* Validation progress */}
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] text-muted-foreground">
                                    {Object.values(moduleValidated).filter(Boolean).length}/{VERIFICATION_MODULES.length} modules validated
                                </span>
                                {allModulesValidated && (
                                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30">ALL VALIDATED</span>
                                )}
                            </div>

                            {/* Module 1: Expert Estimation Summary */}
                            {(!searchFilter || 'expert estimation summary delivery installation combined'.includes(searchFilter.toLowerCase())) && (
                                <div className={`p-4 rounded-xl border transition-all ${moduleValidated['estimation'] ? 'bg-green-50/30 dark:bg-green-500/5 border-green-200 dark:border-green-500/20' : 'bg-card border-border'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setModuleValidated(prev => ({ ...prev, estimation: !prev.estimation }))}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${moduleValidated['estimation'] ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground/40 hover:border-sky-400'}`}
                                            >
                                                {moduleValidated['estimation'] && <CheckIcon className="h-3 w-3" />}
                                            </button>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expert Estimation Summary</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${moduleValidated['estimation'] ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20'}`}>
                                                {moduleValidated['estimation'] ? 'VALIDATED' : 'PENDING'}
                                            </span>
                                            <button
                                                onClick={() => { setCommentingModule(commentingModule === 'estimation' ? null : 'estimation'); setCommentDraft(moduleComments['estimation'] || ''); }}
                                                className={`p-1 rounded hover:bg-muted transition-colors ${moduleComments['estimation'] ? 'text-sky-500' : 'text-muted-foreground'}`}
                                            >
                                                <ChatBubbleLeftEllipsisIcon className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    {commentingModule === 'estimation' && (
                                        <div className="mb-3 p-2.5 rounded-lg bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/20 animate-in fade-in duration-200">
                                            <textarea
                                                value={commentDraft}
                                                onChange={e => setCommentDraft(e.target.value)}
                                                placeholder="Add comment for expert..."
                                                className="w-full text-[10px] bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
                                                rows={2}
                                            />
                                            <div className="flex justify-end gap-2 mt-1.5">
                                                <button onClick={() => setCommentingModule(null)} className="text-[9px] px-2 py-1 rounded text-muted-foreground hover:text-foreground">Cancel</button>
                                                <button onClick={() => { setModuleComments(prev => ({ ...prev, estimation: commentDraft })); setCommentingModule(null); }} className="text-[9px] px-2 py-1 rounded bg-sky-600 text-white font-bold">Save</button>
                                            </div>
                                        </div>
                                    )}
                                    {moduleComments['estimation'] && commentingModule !== 'estimation' && (
                                        <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-sky-50/50 dark:bg-sky-500/5 border border-sky-200/50 dark:border-sky-500/20">
                                            <div className="text-[9px] text-sky-600 dark:text-sky-400 font-bold mb-0.5">Designer Comment</div>
                                            <div className="text-[10px] text-foreground">{moduleComments['estimation']}</div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
                                            <div className="text-[9px] text-muted-foreground uppercase">Delivery</div>
                                            <div className="text-sm font-black text-blue-700 dark:text-blue-400">${DELIVERY_TOTAL_COST.toLocaleString()}</div>
                                            <div className="text-[9px] text-muted-foreground">{DELIVERY_BASE_MIN} min + Section G</div>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-ai/5 border border-purple-200 dark:border-purple-500/20">
                                            <div className="text-[9px] text-muted-foreground uppercase">Installation</div>
                                            <div className="text-sm font-black text-purple-700 dark:text-purple-400">${REVIEWED_INSTALL_COST.toLocaleString()}</div>
                                            <div className="text-[9px] text-muted-foreground">{INSTALL_TOTAL_HRS.toFixed(1)} hrs × $57/hr</div>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                                            <div className="text-[9px] text-muted-foreground uppercase">Combined</div>
                                            <div className="text-sm font-black text-green-700 dark:text-green-400">${REVIEWED_COMBINED.toLocaleString()}</div>
                                            <div className="text-[9px] text-muted-foreground">24 items · {FLAGGED_COUNT} flagged</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-1.5">
                                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Expert Adjustments Applied</div>
                                        {EXPERT_ADJUSTMENTS.filter(a => !a.requiresDesigner).map(adj => (
                                            <div key={adj.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/30 border border-border">
                                                <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                                <span className="text-[10px] text-foreground flex-1">{adj.item}</span>
                                                <span className="text-[9px] font-bold text-green-700 dark:text-green-400">{adj.impact}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Module 2: Project Scope */}
                            {(!searchFilter || 'project scope healthcare hospital items rate card site conditions'.includes(searchFilter.toLowerCase())) && (
                                <div className={`p-4 rounded-xl border transition-all ${moduleValidated['scope'] ? 'bg-green-50/30 dark:bg-green-500/5 border-green-200 dark:border-green-500/20' : 'bg-card border-border'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setModuleValidated(prev => ({ ...prev, scope: !prev.scope }))}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${moduleValidated['scope'] ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground/40 hover:border-sky-400'}`}
                                            >
                                                {moduleValidated['scope'] && <CheckIcon className="h-3 w-3" />}
                                            </button>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Project Scope</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${moduleValidated['scope'] ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20'}`}>
                                                {moduleValidated['scope'] ? 'VALIDATED' : 'PENDING'}
                                            </span>
                                            <button
                                                onClick={() => { setCommentingModule(commentingModule === 'scope' ? null : 'scope'); setCommentDraft(moduleComments['scope'] || ''); }}
                                                className={`p-1 rounded hover:bg-muted transition-colors ${moduleComments['scope'] ? 'text-sky-500' : 'text-muted-foreground'}`}
                                            >
                                                <ChatBubbleLeftEllipsisIcon className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    {commentingModule === 'scope' && (
                                        <div className="mb-3 p-2.5 rounded-lg bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/20 animate-in fade-in duration-200">
                                            <textarea value={commentDraft} onChange={e => setCommentDraft(e.target.value)} placeholder="Add comment for expert..." className="w-full text-[10px] bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none" rows={2} />
                                            <div className="flex justify-end gap-2 mt-1.5">
                                                <button onClick={() => setCommentingModule(null)} className="text-[9px] px-2 py-1 rounded text-muted-foreground hover:text-foreground">Cancel</button>
                                                <button onClick={() => { setModuleComments(prev => ({ ...prev, scope: commentDraft })); setCommentingModule(null); }} className="text-[9px] px-2 py-1 rounded bg-sky-600 text-white font-bold">Save</button>
                                            </div>
                                        </div>
                                    )}
                                    {moduleComments['scope'] && commentingModule !== 'scope' && (
                                        <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-sky-50/50 dark:bg-sky-500/5 border border-sky-200/50 dark:border-sky-500/20">
                                            <div className="text-[9px] text-sky-600 dark:text-sky-400 font-bold mb-0.5">Designer Comment</div>
                                            <div className="text-[10px] text-foreground">{moduleComments['scope']}</div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { k: 'Project', v: 'JPS Health Center for Women' },
                                            { k: 'Vertical', v: 'Healthcare — Hospital' },
                                            { k: 'Items', v: `24 products · ${FLAGGED_COUNT} flagged` },
                                            { k: 'Rate Card', v: '$57/hr Strata HC Standard' },
                                            { k: 'Site Conditions', v: 'Restricted hours, freight elevator' },
                                            { k: 'Scope Alert', v: '119 KD chairs > 50 limit' },
                                        ].map(r => (
                                            <div key={r.k} className="flex items-start justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-muted/20 border border-border">
                                                <span className="text-[9px] text-muted-foreground uppercase shrink-0">{r.k}</span>
                                                <span className="text-[10px] text-foreground font-medium text-right">{r.v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Module 3: Escalated Item */}
                            {(!searchFilter || 'escalated item ofs serpentine custom assembly lounge'.includes(searchFilter.toLowerCase())) && (
                                <div className={`p-4 rounded-xl border transition-all ${moduleValidated['escalated'] ? 'bg-green-50/30 dark:bg-green-500/5 border-green-200 dark:border-green-500/20' : 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setModuleValidated(prev => ({ ...prev, escalated: !prev.escalated }))}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${moduleValidated['escalated'] ? 'bg-green-500 border-green-500 text-white' : 'border-amber-400 hover:border-sky-400'}`}
                                            >
                                                {moduleValidated['escalated'] && <CheckIcon className="h-3 w-3" />}
                                            </button>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Escalated Item — Requires Your Verification</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${moduleValidated['escalated'] ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20'}`}>
                                                {moduleValidated['escalated'] ? 'VALIDATED' : 'PENDING'}
                                            </span>
                                            <button
                                                onClick={() => { setCommentingModule(commentingModule === 'escalated' ? null : 'escalated'); setCommentDraft(moduleComments['escalated'] || ''); }}
                                                className={`p-1 rounded hover:bg-muted transition-colors ${moduleComments['escalated'] ? 'text-sky-500' : 'text-muted-foreground'}`}
                                            >
                                                <ChatBubbleLeftEllipsisIcon className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    {commentingModule === 'escalated' && (
                                        <div className="mb-3 p-2.5 rounded-lg bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/20 animate-in fade-in duration-200">
                                            <textarea value={commentDraft} onChange={e => setCommentDraft(e.target.value)} placeholder="Add comment for expert..." className="w-full text-[10px] bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none" rows={2} />
                                            <div className="flex justify-end gap-2 mt-1.5">
                                                <button onClick={() => setCommentingModule(null)} className="text-[9px] px-2 py-1 rounded text-muted-foreground hover:text-foreground">Cancel</button>
                                                <button onClick={() => { setModuleComments(prev => ({ ...prev, escalated: commentDraft })); setCommentingModule(null); }} className="text-[9px] px-2 py-1 rounded bg-sky-600 text-white font-bold">Save</button>
                                            </div>
                                        </div>
                                    )}
                                    {moduleComments['escalated'] && commentingModule !== 'escalated' && (
                                        <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-sky-50/50 dark:bg-sky-500/5 border border-sky-200/50 dark:border-sky-500/20">
                                            <div className="text-[9px] text-sky-600 dark:text-sky-400 font-bold mb-0.5">Designer Comment</div>
                                            <div className="text-[10px] text-foreground">{moduleComments['escalated']}</div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <div className="text-[9px] text-muted-foreground uppercase">Product</div>
                                            <div className="text-[11px] font-bold text-foreground">OFS Coact Serpentine Lounge — 12 Seats</div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="text-[9px] text-muted-foreground uppercase">Category</div>
                                            <div className="text-[11px] font-bold text-foreground">Custom Assembly — Lounge</div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="text-[9px] text-muted-foreground uppercase">Issue</div>
                                            <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400">No standard ganged lounge rate</div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="text-[9px] text-muted-foreground uppercase">Confidence</div>
                                            <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400">58% — LOW</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Module 4: Assembly Verification */}
                            {(!searchFilter || 'assembly verification modular brackets hardware'.includes(searchFilter.toLowerCase())) && (
                                <div className={`p-4 rounded-xl border transition-all ${moduleValidated['verification'] ? 'bg-green-50/30 dark:bg-green-500/5 border-green-200 dark:border-green-500/20' : 'bg-card border-border'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setModuleValidated(prev => ({ ...prev, verification: !prev.verification }))}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${moduleValidated['verification'] ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground/40 hover:border-sky-400'}`}
                                            >
                                                {moduleValidated['verification'] && <CheckIcon className="h-3 w-3" />}
                                            </button>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assembly Verification</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${moduleValidated['verification'] ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20'}`}>
                                                {moduleValidated['verification'] ? 'VALIDATED' : 'PENDING'}
                                            </span>
                                            <button
                                                onClick={() => { setCommentingModule(commentingModule === 'verification' ? null : 'verification'); setCommentDraft(moduleComments['verification'] || ''); }}
                                                className={`p-1 rounded hover:bg-muted transition-colors ${moduleComments['verification'] ? 'text-sky-500' : 'text-muted-foreground'}`}
                                            >
                                                <ChatBubbleLeftEllipsisIcon className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    {commentingModule === 'verification' && (
                                        <div className="mb-3 p-2.5 rounded-lg bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/20 animate-in fade-in duration-200">
                                            <textarea value={commentDraft} onChange={e => setCommentDraft(e.target.value)} placeholder="Add comment for expert..." className="w-full text-[10px] bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none" rows={2} />
                                            <div className="flex justify-end gap-2 mt-1.5">
                                                <button onClick={() => setCommentingModule(null)} className="text-[9px] px-2 py-1 rounded text-muted-foreground hover:text-foreground">Cancel</button>
                                                <button onClick={() => { setModuleComments(prev => ({ ...prev, verification: commentDraft })); setCommentingModule(null); }} className="text-[9px] px-2 py-1 rounded bg-sky-600 text-white font-bold">Save</button>
                                            </div>
                                        </div>
                                    )}
                                    {moduleComments['verification'] && commentingModule !== 'verification' && (
                                        <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-sky-50/50 dark:bg-sky-500/5 border border-sky-200/50 dark:border-sky-500/20">
                                            <div className="text-[9px] text-sky-600 dark:text-sky-400 font-bold mb-0.5">Designer Comment</div>
                                            <div className="text-[10px] text-foreground">{moduleComments['verification']}</div>
                                        </div>
                                    )}
                                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                                        <div className="flex items-start gap-3">
                                            <img src={DESIGNER_PHOTO} alt="" className="w-8 h-8 rounded-full ring-2 ring-green-400" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-bold text-foreground">Verification Complete</span>
                                                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300 font-bold ring-1 ring-inset ring-green-600/20">VERIFIED</span>
                                                </div>
                                                <div className="text-[10px] text-foreground mt-1.5 space-y-1">
                                                    <p>Confirmed modular assembly approach — 12 seats × 1.0 hr + 2.0 hrs alignment/leveling.</p>
                                                    <p>Connection hardware verified: standard brackets compatible. Total: <span className="font-bold">14.0 hrs</span>.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Module 5: Applied Rate */}
                            {(!searchFilter || 'applied rate modular assembly hours cost'.includes(searchFilter.toLowerCase())) && (
                                <div className={`p-4 rounded-xl border transition-all ${moduleValidated['rate'] ? 'bg-green-50/30 dark:bg-green-500/5 border-green-200 dark:border-green-500/20' : 'bg-card border-border'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setModuleValidated(prev => ({ ...prev, rate: !prev.rate }))}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${moduleValidated['rate'] ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground/40 hover:border-sky-400'}`}
                                            >
                                                {moduleValidated['rate'] && <CheckIcon className="h-3 w-3" />}
                                            </button>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Applied Rate</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${moduleValidated['rate'] ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20'}`}>
                                                {moduleValidated['rate'] ? 'VALIDATED' : 'PENDING'}
                                            </span>
                                            <button
                                                onClick={() => { setCommentingModule(commentingModule === 'rate' ? null : 'rate'); setCommentDraft(moduleComments['rate'] || ''); }}
                                                className={`p-1 rounded hover:bg-muted transition-colors ${moduleComments['rate'] ? 'text-sky-500' : 'text-muted-foreground'}`}
                                            >
                                                <ChatBubbleLeftEllipsisIcon className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    {commentingModule === 'rate' && (
                                        <div className="mb-3 p-2.5 rounded-lg bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/20 animate-in fade-in duration-200">
                                            <textarea value={commentDraft} onChange={e => setCommentDraft(e.target.value)} placeholder="Add comment for expert..." className="w-full text-[10px] bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none" rows={2} />
                                            <div className="flex justify-end gap-2 mt-1.5">
                                                <button onClick={() => setCommentingModule(null)} className="text-[9px] px-2 py-1 rounded text-muted-foreground hover:text-foreground">Cancel</button>
                                                <button onClick={() => { setModuleComments(prev => ({ ...prev, rate: commentDraft })); setCommentingModule(null); }} className="text-[9px] px-2 py-1 rounded bg-sky-600 text-white font-bold">Save</button>
                                            </div>
                                        </div>
                                    )}
                                    {moduleComments['rate'] && commentingModule !== 'rate' && (
                                        <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-sky-50/50 dark:bg-sky-500/5 border border-sky-200/50 dark:border-sky-500/20">
                                            <div className="text-[9px] text-sky-600 dark:text-sky-400 font-bold mb-0.5">Designer Comment</div>
                                            <div className="text-[10px] text-foreground">{moduleComments['rate']}</div>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div className="text-[10px] text-foreground">Modular assembly: 12.0 hrs + 2.0 hrs alignment = <span className="font-bold">14.0 hrs × $57/hr</span></div>
                                        <span className="text-[11px] font-bold text-green-700 dark:text-green-400">$798.00</span>
                                    </div>
                                </div>
                            )}

                            {/* Preview Report + Send buttons */}
                            {phase === 'revealed' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowPdfPreview(true)}
                                        className="flex-1 py-3 rounded-xl text-xs font-bold border border-border bg-card text-foreground hover:bg-muted transition-all flex items-center justify-center gap-2"
                                    >
                                        <EyeIcon className="h-3.5 w-3.5" />
                                        Preview Report
                                    </button>
                                    <button
                                        onClick={() => { if (allModulesValidated) nextStep(); }}
                                        disabled={!allModulesValidated}
                                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${allModulesValidated ? 'bg-sky-600 text-white hover:bg-sky-700 shadow-lg shadow-sky-500/20' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                                    >
                                        Send Back to Expert
                                        <ArrowRightIcon className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PDF Preview Modal */}
                    {showPdfPreview && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200" onClick={() => setShowPdfPreview(false)}>
                            <div className="w-full max-w-2xl max-h-[85vh] bg-card rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                                {/* PDF header */}
                                <div className="px-6 py-4 bg-muted border-b border-border flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-foreground">DESIGN VERIFICATION REPORT</div>
                                        <div className="text-[10px] text-muted-foreground">JPS Health Center for Women — {new Date().toLocaleDateString()}</div>
                                    </div>
                                    <button onClick={() => setShowPdfPreview(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                                        <XMarkIcon className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </div>
                                {/* PDF body */}
                                <div className="p-6 space-y-5 overflow-y-auto max-h-[65vh]">
                                    {VERIFICATION_MODULES.map(mod => (
                                        <div key={mod.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="text-[11px] font-bold text-foreground uppercase tracking-wider">{mod.label}</div>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${moduleValidated[mod.id] ? 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-600/20'}`}>
                                                    {moduleValidated[mod.id] ? 'VALIDATED' : 'PENDING'}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">{mod.detail}</div>
                                            {moduleComments[mod.id] && (
                                                <div className="px-3 py-2 rounded-lg bg-sky-50 dark:bg-sky-500/5 border-l-2 border-sky-400">
                                                    <div className="text-[9px] text-sky-600 font-bold mb-0.5">Designer Comment</div>
                                                    <div className="text-[10px] text-foreground">{moduleComments[mod.id]}</div>
                                                </div>
                                            )}
                                            <div className="border-b border-border" />
                                        </div>
                                    ))}
                                </div>
                                {/* PDF footer */}
                                <div className="px-6 py-3 bg-muted dark:bg-zinc-800 border-t border-border flex items-center justify-between">
                                    <div className="text-[9px] text-muted-foreground">Verified by Designer Alden, Designer — {new Date().toLocaleDateString()}</div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowPdfPreview(false)} className="px-4 py-2 rounded-lg text-[10px] font-bold border border-border bg-card text-foreground hover:bg-muted transition-colors">Close</button>
                                        <button onClick={() => setShowPdfPreview(false)} className="px-4 py-2 rounded-lg text-[10px] font-bold bg-sky-600 text-white hover:bg-sky-700 transition-colors">Download PDF</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── w2.3: Expert Confirmation & Quote Assembly (sub-phases) ── */}
            {stepId === 'w2.3' && (
                <div className="animate-in fade-in duration-500 space-y-3">

                    {/* ── Sub-phase A: Confirm — designer-verified modules + review ── */}
                    {subPhase === 'confirm' && (<>
                        {/* Designer verification summary */}
                        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <img src={DESIGNER_PHOTO} alt="" className="w-6 h-6 rounded-full ring-1 ring-sky-400" />
                                <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">Designer Verification — All Modules Validated</span>
                            </div>
                            <div className="grid grid-cols-5 gap-1.5">
                                {VERIFICATION_MODULES.map(mod => (
                                    <div key={mod.id} className="flex items-center gap-1 px-2 py-1 rounded bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                                        <CheckCircleIcon className="h-3 w-3 text-green-500 shrink-0" />
                                        <span className="text-[8px] font-bold text-green-700 dark:text-green-400 truncate">{mod.label.split(' — ')[0]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cost totals — expandable cards */}
                        <div className="grid grid-cols-3 gap-3">
                            {/* Delivery card */}
                            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 overflow-hidden">
                                <button onClick={() => toggleCostCard('delivery')} className="w-full p-3 text-left hover:bg-blue-100/50 dark:hover:bg-blue-500/10 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <TruckIcon className="h-3.5 w-3.5 text-blue-500" />
                                            <span className="text-[9px] text-muted-foreground uppercase font-bold">Delivery</span>
                                        </div>
                                        <ChevronDownIcon className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${expandedCostCards.has('delivery') ? 'rotate-180' : ''}`} />
                                    </div>
                                    <div className="text-lg font-bold text-blue-700 dark:text-blue-400">${DELIVERY_TOTAL_COST.toLocaleString()}</div>
                                    <div className="text-[9px] text-muted-foreground">{DELIVERY_BASE_MIN.toLocaleString()} min + Section G</div>
                                </button>
                                {expandedCostCards.has('delivery') && (
                                    <div className="px-3 pb-3 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="h-px bg-blue-200 dark:bg-blue-500/20 mb-1.5" />
                                        {DELIVERY_BREAKDOWN.map(row => (
                                            <div key={row.category} className="flex items-start gap-1.5">
                                                <CheckCircleIcon className="h-2.5 w-2.5 text-blue-400 shrink-0 mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[8px] font-bold text-foreground truncate">{row.category}</span>
                                                        <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400 shrink-0 ml-1">{row.minutes}</span>
                                                    </div>
                                                    <div className="text-[7px] text-muted-foreground">{row.items} — {row.detail}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Installation card */}
                            <div className="rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 overflow-hidden">
                                <button onClick={() => toggleCostCard('installation')} className="w-full p-3 text-left hover:bg-green-100/50 dark:hover:bg-green-500/10 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <WrenchScrewdriverIcon className="h-3.5 w-3.5 text-green-500" />
                                            <span className="text-[9px] text-muted-foreground uppercase font-bold">Installation</span>
                                        </div>
                                        <ChevronDownIcon className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${expandedCostCards.has('installation') ? 'rotate-180' : ''}`} />
                                    </div>
                                    <div className="text-lg font-bold text-green-700 dark:text-green-400">${REVIEWED_INSTALL_COST.toLocaleString()}</div>
                                    <div className="text-[9px] text-muted-foreground">{INSTALL_TOTAL_HRS.toFixed(1)} hrs × $57/hr</div>
                                </button>
                                {expandedCostCards.has('installation') && (
                                    <div className="px-3 pb-3 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="h-px bg-green-200 dark:bg-green-500/20 mb-1.5" />
                                        {INSTALLATION_BREAKDOWN.map(row => (
                                            <div key={row.category} className="flex items-start gap-1.5">
                                                <CheckCircleIcon className="h-2.5 w-2.5 text-green-400 shrink-0 mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[8px] font-bold text-foreground truncate">{row.category}</span>
                                                        <span className="text-[8px] font-bold text-green-600 dark:text-green-400 shrink-0 ml-1">{row.hours}</span>
                                                    </div>
                                                    <div className="text-[7px] text-muted-foreground">{row.items} — {row.detail}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Combined card */}
                            <div className="rounded-xl bg-card border-2 border-foreground/20 overflow-hidden">
                                <button onClick={() => toggleCostCard('combined')} className="w-full p-3 text-left hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <CalculatorIcon className="h-3.5 w-3.5 text-foreground" />
                                            <span className="text-[9px] text-muted-foreground uppercase font-bold">Combined</span>
                                        </div>
                                        <ChevronDownIcon className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${expandedCostCards.has('combined') ? 'rotate-180' : ''}`} />
                                    </div>
                                    <div className="text-lg font-bold text-foreground">${REVIEWED_COMBINED.toLocaleString()}</div>
                                    <div className="text-[9px] text-muted-foreground">24 items · all resolved</div>
                                </button>
                                {expandedCostCards.has('combined') && (
                                    <div className="px-3 pb-3 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="h-px bg-border mb-1.5" />
                                        {COMBINED_BREAKDOWN.map(row => (
                                            <div key={row.label} className="flex items-start gap-1.5">
                                                <CheckCircleIcon className="h-2.5 w-2.5 text-muted-foreground shrink-0 mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[8px] font-bold text-foreground">{row.label}</span>
                                                        <span className="text-[8px] font-bold text-foreground shrink-0 ml-1">{row.value}</span>
                                                    </div>
                                                    <div className="text-[7px] text-muted-foreground">{row.note}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* All adjustments — pre-resolved */}
                        <div className="p-4 rounded-xl bg-card border border-border">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">All Adjustments Applied</div>
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30">
                                    {EXPERT_ADJUSTMENTS.length}/{EXPERT_ADJUSTMENTS.length} COMPLETE
                                </span>
                            </div>
                            <div className="space-y-2">
                                {EXPERT_ADJUSTMENTS.map(adj => (
                                    <div key={adj.id} className="p-3 rounded-lg border bg-green-50/50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20">
                                        <div className="flex items-start justify-between mb-1">
                                            <div className="text-[11px] font-bold text-foreground">{adj.item}</div>
                                            <span className="text-[10px] font-bold text-green-700 dark:text-green-400 shrink-0">{adj.impact}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-green-700 dark:text-green-400">
                                            <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" />
                                            <span className="font-bold">Applied — {adj.aiSuggestion.split('.')[0]}</span>
                                            {adj.requiresDesigner && <span className="text-[8px] px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 ring-1 ring-inset ring-sky-600/20 font-bold">DESIGNER VERIFIED</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Continue to quote assembly */}
                        <button
                            onClick={() => { setSubPhase('staging'); setTimeout(pauseAware(() => setSubPhase('staging-pipeline')), 500); }}
                            className="w-full py-3 rounded-xl text-xs font-bold bg-brand-400 text-zinc-900 hover:bg-brand-300 shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            Continue to Quote Assembly
                            <ArrowRightIcon className="h-3.5 w-3.5" />
                        </button>
                    </>)}

                    {/* ── Sub-phase B: Staging pipeline ── */}
                    {(subPhase === 'staging' || subPhase === 'staging-pipeline') && (<>
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-brand-500 text-zinc-900"><CheckCircleIcon className="h-5 w-5" /></div>
                                    <div>
                                        <div className="text-xs font-bold text-foreground">Staging for Assembly</div>
                                        <div className="text-[11px] text-muted-foreground mt-1">Retrieving MillerKnoll product quote and staging both labor and product components for proposal assembly.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {subPhase === 'staging-pipeline' && renderAgentPipeline(subAgents, subProgress, 'Estimate Staging')}
                    </>)}

                    {/* ── Sub-phase B revealed: Labor + Product cards ── */}
                    {subPhase === 'staging-revealed' && (
                        <div className="animate-in fade-in duration-500 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                {/* Labor Estimate — expandable */}
                                <div className="rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 overflow-hidden">
                                    <button onClick={() => toggleCostCard('labor')} className="w-full p-4 text-left hover:bg-green-100/50 dark:hover:bg-green-500/10 transition-colors">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Labor Estimate</span>
                                            <ChevronDownIcon className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${expandedCostCards.has('labor') ? 'rotate-180' : ''}`} />
                                        </div>
                                        <div className="text-xl font-bold text-green-700 dark:text-green-400">$15,378</div>
                                        <div className="text-[10px] text-muted-foreground mt-1">Install ${REVIEWED_INSTALL_COST.toLocaleString()} + Delivery ${DELIVERY_TOTAL_COST.toLocaleString()}</div>
                                        <div className="mt-2"><span className="text-[9px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30 font-bold">DAVID PARK &#10003;</span></div>
                                    </button>
                                    {expandedCostCards.has('labor') && (
                                        <div className="px-4 pb-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="h-px bg-green-200 dark:bg-green-500/20 mb-1" />
                                            {LABOR_ESTIMATE_BREAKDOWN.map(row => (
                                                <div key={row.label} className="flex items-start gap-1.5">
                                                    <CheckCircleIcon className="h-3 w-3 text-green-400 shrink-0 mt-0.5" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[9px] font-bold text-foreground">{row.label}</span>
                                                            <span className="text-[9px] font-bold text-green-600 dark:text-green-400 shrink-0 ml-1">{row.value}</span>
                                                        </div>
                                                        <div className="text-[8px] text-muted-foreground">{row.detail}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Product Quote — expandable */}
                                <div className="rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 overflow-hidden">
                                    <button onClick={() => toggleCostCard('product')} className="w-full p-4 text-left hover:bg-blue-100/50 dark:hover:bg-blue-500/10 transition-colors">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Product Quote</span>
                                            <ChevronDownIcon className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${expandedCostCards.has('product') ? 'rotate-180' : ''}`} />
                                        </div>
                                        <div className="text-xl font-bold text-blue-700 dark:text-blue-400">$287,450</div>
                                        <div className="mt-1"><span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/30 font-bold">MILLERKNOLL LIST</span></div>
                                        <div className="text-[10px] text-muted-foreground mt-1">24 line items</div>
                                    </button>
                                    {expandedCostCards.has('product') && (
                                        <div className="px-4 pb-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="h-px bg-blue-200 dark:bg-blue-500/20 mb-1" />
                                            {PRODUCT_QUOTE_BREAKDOWN.map(row => (
                                                <div key={row.label} className="flex items-start gap-1.5">
                                                    <CubeIcon className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[9px] font-bold text-foreground">{row.label}</span>
                                                            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 shrink-0 ml-1">{row.value}</span>
                                                        </div>
                                                        <div className="text-[8px] text-muted-foreground">{row.detail}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 py-1">
                                <ArrowRightIcon className="h-4 w-4 text-brand-500" />
                                <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Ready for Markup</span>
                                <ArrowRightIcon className="h-4 w-4 text-brand-500" />
                            </div>
                            <button
                                onClick={() => { setSubPhase('markup'); setTimeout(pauseAware(() => setSubPhase('markup-pipeline')), 500); }}
                                className="w-full py-3 rounded-xl text-xs font-bold bg-brand-400 text-zinc-900 hover:bg-brand-300 shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                Continue to Markup
                                <ArrowRightIcon className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}

                    {/* ── Sub-phase C: Markup pipeline ── */}
                    {(subPhase === 'markup' || subPhase === 'markup-pipeline') && (<>
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-brand-500 text-zinc-900"><CpuChipIcon className="h-5 w-5" /></div>
                                    <div>
                                        <div className="text-xs font-bold text-foreground">Running Markup Engine</div>
                                        <div className="text-[11px] text-muted-foreground mt-1">Applying JPS Health Network contract discount, labor margin, and freight calculation.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {subPhase === 'markup-pipeline' && renderAgentPipeline(subAgents, subProgress, 'Markup & Proposal')}
                    </>)}

                    {/* ── Sub-phase C revealed: Full proposal report ── */}
                    {subPhase === 'markup-revealed' && (
                        <div className="animate-in fade-in duration-500 space-y-3">

                            {/* Intake report — project, scope, team, registration, mismatches */}
                            <div className="p-3 rounded-xl bg-card border border-border space-y-3">
                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Project & Intake Summary</div>
                                {/* Project details */}
                                <div className="grid grid-cols-3 gap-2">
                                    {INTAKE_REPORT.project.map(f => (
                                        <div key={f.label} className="px-2 py-1.5 rounded-lg bg-muted/50">
                                            <div className="text-[7px] text-muted-foreground uppercase">{f.label}</div>
                                            <div className="text-[9px] font-bold text-foreground flex items-center gap-1">
                                                {f.value}
                                                {f.badge && <span className="text-[7px] px-1 py-0.5 rounded bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold">{f.badge}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Scope + Registration */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Product Scope</div>
                                        {INTAKE_REPORT.scope.map(s => (
                                            <div key={s.label} className="flex items-center justify-between py-0.5">
                                                <span className="text-[8px] text-muted-foreground">{s.label}</span>
                                                <span className="text-[8px] font-bold text-foreground">{s.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Strata Registration</div>
                                        {INTAKE_REPORT.registration.map(r => (
                                            <div key={r.label} className="flex items-center justify-between py-0.5">
                                                <span className="text-[8px] text-muted-foreground">{r.label}</span>
                                                <span className="text-[8px] font-bold text-foreground">{r.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Team */}
                                <div>
                                    <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1.5">Assigned Team</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {INTAKE_REPORT.team.map(t => (
                                            <div key={t.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border">
                                                <img src={t.photo} alt="" className="w-7 h-7 rounded-full ring-1 ring-border" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[9px] font-bold text-foreground">{t.name}</div>
                                                    <div className="text-[8px] text-muted-foreground">{t.role} — {t.detail}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Mismatches resolved */}
                                <div>
                                    <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Mismatches Resolved (Flow 1)</div>
                                    <div className="space-y-1">
                                        {INTAKE_REPORT.mismatches.map(m => (
                                            <div key={m.item} className="flex items-center justify-between py-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <CheckCircleIcon className="h-3 w-3 text-green-500 shrink-0" />
                                                    <span className="text-[8px] font-bold text-foreground">{m.item}</span>
                                                    <span className="text-[7px] px-1 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold ring-1 ring-inset ring-amber-600/20">{m.badge}</span>
                                                </div>
                                                <span className="text-[8px] text-muted-foreground">{m.resolution}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Pricing waterfall — editable */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                {WATERFALL_ROWS.map(row => (
                                    <div key={row.label} className={`flex items-center justify-between ${waterfallStyles[row.type]}`}>
                                        {row.type === 'discount' ? (
                                            <div className="flex items-center gap-2">
                                                <ArrowDownIcon className="h-3 w-3 text-green-500" />
                                                <span className="text-[10px] font-bold text-green-700 dark:text-green-400">{row.label}</span>
                                            </div>
                                        ) : (
                                            <span className={`text-[11px] ${row.type === 'total' ? 'text-xs font-bold uppercase tracking-wider' : 'font-medium'} ${waterfallTextStyles[row.type]}`}>{row.label}</span>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            {row.value && (
                                                editingField === row.label ? (
                                                    <input
                                                        autoFocus
                                                        defaultValue={fieldOverrides[row.label] || row.value}
                                                        onBlur={e => { setFieldOverrides(prev => ({ ...prev, [row.label]: e.target.value })); setEditingField(null); }}
                                                        onKeyDown={e => { if (e.key === 'Enter') { setFieldOverrides(prev => ({ ...prev, [row.label]: (e.target as HTMLInputElement).value })); setEditingField(null); } }}
                                                        className="w-24 text-right text-sm font-bold bg-card border border-brand-400 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-400"
                                                    />
                                                ) : (
                                                    <span className={`${row.type === 'total' ? 'text-xl font-black' : 'text-sm font-bold'} ${waterfallTextStyles[row.type]} ${fieldOverrides[row.label] ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                                                        {fieldOverrides[row.label] || row.value}
                                                    </span>
                                                )
                                            )}
                                            {row.value && row.type !== 'discount' && row.type !== 'total' && (
                                                <button onClick={() => setEditingField(editingField === row.label ? null : row.label)} className="p-0.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                                                    <PencilSquareIcon className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-center">
                                <span className="text-[9px] px-3 py-1 rounded-full bg-muted text-muted-foreground font-bold uppercase tracking-wider">TAX EXEMPT — Government Healthcare Entity</span>
                            </div>

                            {/* Estimation criteria summary — 2-col */}
                            <div className="p-3 rounded-xl bg-card border border-border">
                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Estimation Criteria Applied</div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                    {[
                                        { icon: <CalculatorIcon className="h-3 w-3" />, text: 'Rate cards: $57/hr install · $0.95/min delivery' },
                                        { icon: <TruckIcon className="h-3 w-3" />, text: 'Delivery Pricer sections A-G applied' },
                                        { icon: <ExclamationTriangleIcon className="h-3 w-3" />, text: 'Hospital site: restricted hrs, freight elevator' },
                                        { icon: <ShieldCheckIcon className="h-3 w-3" />, text: 'Scope limit: 119 KD chairs > 50-chair cap' },
                                        { icon: <SparklesIcon className="h-3 w-3" />, text: '20 HIGH + 5 LOW confidence items reviewed' },
                                        { icon: <CubeIcon className="h-3 w-3" />, text: '24 items: seating, tables, boards, custom' },
                                    ].map((c, i) => (
                                        <div key={i} className="flex items-center gap-1.5 py-0.5">
                                            <span className="text-indigo-500 shrink-0">{c.icon}</span>
                                            <span className="text-[8px] text-muted-foreground">{c.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery timeline */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2.5 rounded-lg bg-card border border-border">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <ClockIcon className="h-3 w-3 text-green-500" />
                                        <span className="text-[9px] font-bold text-foreground">Standard items</span>
                                    </div>
                                    <div className="text-sm font-bold text-green-700 dark:text-green-400">8–10 weeks</div>
                                    <div className="text-[8px] text-muted-foreground">22 standard MillerKnoll items</div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-card border border-border">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <ClockIcon className="h-3 w-3 text-amber-500" />
                                        <span className="text-[9px] font-bold text-foreground">Custom OFS Serpentine</span>
                                    </div>
                                    <div className="text-sm font-bold text-amber-600 dark:text-amber-400">12 weeks</div>
                                    <div className="text-[8px] text-muted-foreground">Custom 12-seat — designer verified</div>
                                </div>
                            </div>

                            {/* Review activity trail */}
                            <div className="p-3 rounded-xl bg-card border border-border">
                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Review Trail</div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[9px]">
                                        <CheckCircleIcon className="h-3 w-3 text-green-500 shrink-0" />
                                        <span><span className="font-bold">Regional Sales Manager Reyes</span> (Expert) — 24 items reviewed, 5 adjustments, OFS escalated</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px]">
                                        <CheckCircleIcon className="h-3 w-3 text-sky-500 shrink-0" />
                                        <span><span className="font-bold">Designer Alden</span> (Designer) — 5 modules validated, OFS Serpentine confirmed</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px]">
                                        <SparklesIcon className="h-3 w-3 text-indigo-500 shrink-0" />
                                        <span>AI — Intake, Delivery Pricer A-G, scope limits, markup engine</span>
                                    </div>
                                </div>
                            </div>

                            {/* Expert notes */}
                            <div className="p-3 rounded-xl bg-card border border-border">
                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Expert Notes for Dealer</div>
                                <textarea
                                    value={expertNotes}
                                    onChange={e => setExpertNotes(e.target.value)}
                                    placeholder="Add notes or observations for the dealer review (optional)..."
                                    className="w-full text-[10px] bg-muted/30 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-brand-400 border border-border"
                                    rows={2}
                                />
                            </div>

                            {/* Action buttons: Preview + Send */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowProposalPreview(true)}
                                    className="flex-1 py-3 rounded-xl text-xs font-bold border border-border bg-card text-foreground hover:bg-muted transition-all flex items-center justify-center gap-2"
                                >
                                    <EyeIcon className="h-3.5 w-3.5" />
                                    Preview Proposal
                                </button>
                                <button
                                    onClick={() => setShowDealerPicker(true)}
                                    className="flex-1 py-3 rounded-xl text-xs font-bold bg-brand-400 text-zinc-900 hover:bg-brand-300 shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <PaperAirplaneIcon className="h-3.5 w-3.5" />
                                    Send for Dealer Review
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Proposal Preview Modal (w2.3) */}
                    {showProposalPreview && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200" onClick={() => setShowProposalPreview(false)}>
                            <div className="w-full max-w-3xl max-h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                                {/* Header */}
                                <div className="px-6 py-4 bg-muted border-b border-border flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-foreground tracking-wide">PROPOSAL — JPS HEALTH CENTER FOR WOMEN</div>
                                        <div className="text-[10px] text-muted-foreground">Quote #WRG-2024-0847 · Prepared by Regional Sales Manager Reyes · {new Date().toLocaleDateString()}</div>
                                    </div>
                                    <button onClick={() => setShowProposalPreview(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                                        <XMarkIcon className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </div>
                                <div className="p-5 space-y-4 overflow-y-auto max-h-[72vh]">

                                    {/* §1 — Project & Intake Summary */}
                                    <div>
                                        <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <DocumentTextIcon className="h-3.5 w-3.5 text-indigo-500" />1. Project & Intake Summary
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                            {INTAKE_REPORT.project.map(f => (
                                                <div key={f.label} className="px-2 py-1.5 rounded-lg bg-muted/40">
                                                    <div className="text-[8px] text-muted-foreground uppercase">{f.label}</div>
                                                    <div className="text-[10px] font-bold text-foreground flex items-center gap-1">
                                                        {f.value}
                                                        {f.badge && <span className="text-[7px] px-1 py-0.5 rounded bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold">{f.badge}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Product Scope</div>
                                                {INTAKE_REPORT.scope.map(s => (
                                                    <div key={s.label} className="flex items-center justify-between py-0.5">
                                                        <span className="text-[8px] text-muted-foreground">{s.label}</span>
                                                        <span className="text-[8px] font-bold text-foreground">{s.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div>
                                                <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Strata Registration</div>
                                                {INTAKE_REPORT.registration.map(r => (
                                                    <div key={r.label} className="flex items-center justify-between py-0.5">
                                                        <span className="text-[8px] text-muted-foreground">{r.label}</span>
                                                        <span className="text-[8px] font-bold text-foreground">{r.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-px bg-border" />

                                    {/* §2 — Assigned Team */}
                                    <div>
                                        <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <UserGroupIcon className="h-3.5 w-3.5 text-sky-500" />2. Assigned Team
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {INTAKE_REPORT.team.map(t => (
                                                <div key={t.name} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 border border-border">
                                                    <img src={t.photo} alt="" className="w-8 h-8 rounded-full ring-1 ring-border" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[10px] font-bold text-foreground">{t.name}</div>
                                                        <div className="text-[8px] text-muted-foreground">{t.role} — {t.detail}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-px bg-border" />

                                    {/* §3 — Mismatches Resolved */}
                                    <div>
                                        <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <ExclamationTriangleIcon className="h-3.5 w-3.5 text-amber-500" />3. Mismatches Resolved (Flow 1)
                                        </div>
                                        <div className="space-y-1">
                                            {INTAKE_REPORT.mismatches.map(m => (
                                                <div key={m.item} className="flex items-center justify-between py-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <CheckCircleIcon className="h-3 w-3 text-green-500 shrink-0" />
                                                        <span className="text-[9px] font-bold text-foreground">{m.item}</span>
                                                        <span className="text-[7px] px-1 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold ring-1 ring-inset ring-amber-600/20">{m.badge}</span>
                                                    </div>
                                                    <span className="text-[8px] text-muted-foreground">{m.resolution}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-px bg-border" />

                                    {/* §4 — Flagged Items & Expert Adjustments */}
                                    <div>
                                        <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <AdjustmentsHorizontalIcon className="h-3.5 w-3.5 text-ai" />4. Flagged Items & Expert Adjustments
                                        </div>
                                        <div className="space-y-1.5">
                                            {EXPERT_ADJUSTMENTS.map(adj => (
                                                <div key={adj.id} className="p-2 rounded-lg bg-muted/30 border border-border">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <span className="text-[9px] font-bold text-foreground">{adj.item}</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[8px] font-bold text-green-600 dark:text-green-400">{adj.impact}</span>
                                                            {adj.requiresDesigner && <span className="text-[7px] px-1 py-0.5 rounded bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold">DESIGNER</span>}
                                                        </div>
                                                    </div>
                                                    <div className="text-[8px] text-muted-foreground">{adj.aiSuggestion}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-px bg-border" />

                                    {/* §5 — Labor Cost Breakdown */}
                                    <div>
                                        <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <CalculatorIcon className="h-3.5 w-3.5 text-blue-500" />5. Labor Cost Breakdown
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 text-center">
                                                <div className="text-[8px] text-muted-foreground uppercase">Delivery</div>
                                                <div className="text-sm font-bold text-blue-700 dark:text-blue-400">${DELIVERY_TOTAL_COST.toLocaleString()}</div>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 text-center">
                                                <div className="text-[8px] text-muted-foreground uppercase">Installation</div>
                                                <div className="text-sm font-bold text-green-700 dark:text-green-400">${REVIEWED_INSTALL_COST.toLocaleString()}</div>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                                                <div className="text-[8px] text-muted-foreground uppercase">Combined</div>
                                                <div className="text-sm font-bold text-foreground">${REVIEWED_COMBINED.toLocaleString()}</div>
                                            </div>
                                        </div>
                                        {/* Detailed breakdowns */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <div className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Delivery Detail</div>
                                                {DELIVERY_BREAKDOWN.map(d => (
                                                    <div key={d.category} className="flex items-center justify-between py-0.5 border-b border-border/50 last:border-0">
                                                        <span className="text-[8px] text-muted-foreground">{d.category}</span>
                                                        <span className="text-[8px] font-bold text-foreground">{d.minutes}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div>
                                                <div className="text-[8px] font-bold text-green-600 dark:text-green-400 uppercase mb-1">Installation Detail</div>
                                                {INSTALLATION_BREAKDOWN.map(d => (
                                                    <div key={d.category} className="flex items-center justify-between py-0.5 border-b border-border/50 last:border-0">
                                                        <span className="text-[8px] text-muted-foreground">{d.category}</span>
                                                        <span className="text-[8px] font-bold text-foreground">{d.hours}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-px bg-border" />

                                    {/* §6 — Product Quote & Pricing Waterfall */}
                                    <div>
                                        <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <CubeIcon className="h-3.5 w-3.5 text-success" />6. Product Quote & Pricing Waterfall
                                        </div>
                                        {/* Product breakdown */}
                                        <div className="mb-2">
                                            <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1">MillerKnoll Product Breakdown</div>
                                            {PRODUCT_QUOTE_BREAKDOWN.map(p => (
                                                <div key={p.label} className="flex items-center justify-between py-0.5 border-b border-border/50 last:border-0">
                                                    <div>
                                                        <span className="text-[9px] font-bold text-foreground">{p.label}</span>
                                                        <span className="text-[8px] text-muted-foreground ml-1.5">{p.detail}</span>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-foreground">{p.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Waterfall */}
                                        <div className="rounded-xl border border-border overflow-hidden">
                                            {WATERFALL_ROWS.map(row => (
                                                <div key={row.label} className={`flex items-center justify-between ${waterfallStyles[row.type]}`}>
                                                    {row.type === 'discount' ? (
                                                        <div className="flex items-center gap-2">
                                                            <ArrowDownIcon className="h-3 w-3 text-green-500" />
                                                            <span className="text-[10px] font-bold text-green-700 dark:text-green-400">{row.label}</span>
                                                        </div>
                                                    ) : (
                                                        <span className={`text-[11px] ${row.type === 'total' ? 'text-xs font-bold uppercase' : 'font-medium'} ${waterfallTextStyles[row.type]}`}>{row.label}</span>
                                                    )}
                                                    {row.value && <span className={`${row.type === 'total' ? 'text-lg font-black' : 'text-sm font-bold'} ${waterfallTextStyles[row.type]} ${fieldOverrides[row.label] ? 'text-amber-600 dark:text-amber-400' : ''}`}>{fieldOverrides[row.label] || row.value}</span>}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-center mt-1.5">
                                            <span className="text-[8px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold uppercase tracking-wider">TAX EXEMPT — Government Healthcare Entity</span>
                                        </div>
                                    </div>
                                    <div className="h-px bg-border" />

                                    {/* §7 — Estimation Criteria */}
                                    <div>
                                        <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <ShieldCheckIcon className="h-3.5 w-3.5 text-indigo-500" />7. Estimation Criteria Applied
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                            {[
                                                { icon: <CalculatorIcon className="h-3 w-3" />, text: 'Rate cards: $57/hr install · $0.95/min delivery' },
                                                { icon: <TruckIcon className="h-3 w-3" />, text: 'Delivery Pricer sections A-G applied' },
                                                { icon: <ExclamationTriangleIcon className="h-3 w-3" />, text: 'Hospital site: restricted hrs, freight elevator' },
                                                { icon: <ShieldCheckIcon className="h-3 w-3" />, text: 'Scope limit: 119 KD chairs > 50-chair cap' },
                                                { icon: <SparklesIcon className="h-3 w-3" />, text: '20 HIGH + 5 LOW confidence items reviewed' },
                                                { icon: <CubeIcon className="h-3 w-3" />, text: '24 items: seating, tables, boards, custom' },
                                            ].map((c, i) => (
                                                <div key={i} className="flex items-center gap-1.5 py-0.5">
                                                    <span className="text-indigo-500 shrink-0">{c.icon}</span>
                                                    <span className="text-[8px] text-muted-foreground">{c.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-px bg-border" />

                                    {/* §8 — Delivery Timeline */}
                                    <div>
                                        <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <ClockIcon className="h-3.5 w-3.5 text-green-500" />8. Delivery Timeline
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                                                <div className="text-[9px] font-bold text-foreground mb-0.5">Standard items</div>
                                                <div className="text-sm font-bold text-green-700 dark:text-green-400">8–10 weeks</div>
                                                <div className="text-[8px] text-muted-foreground">22 standard MillerKnoll items</div>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                                                <div className="text-[9px] font-bold text-foreground mb-0.5">Custom OFS Serpentine</div>
                                                <div className="text-sm font-bold text-amber-600 dark:text-amber-400">12 weeks</div>
                                                <div className="text-[8px] text-muted-foreground">Custom 12-seat — designer verified</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-px bg-border" />

                                    {/* §9 — Review Trail */}
                                    <div>
                                        <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <ClipboardDocumentCheckIcon className="h-3.5 w-3.5 text-sky-500" />9. Review Trail
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-[9px]">
                                                <CheckCircleIcon className="h-3 w-3 text-green-500 shrink-0" />
                                                <span><span className="font-bold">Regional Sales Manager Reyes</span> (Expert) — 24 items reviewed, 5 adjustments, OFS escalated</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px]">
                                                <CheckCircleIcon className="h-3 w-3 text-sky-500 shrink-0" />
                                                <span><span className="font-bold">Designer Alden</span> (Designer) — 5 modules validated, OFS Serpentine confirmed</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px]">
                                                <SparklesIcon className="h-3 w-3 text-indigo-500 shrink-0" />
                                                <span>AI — Intake processing, Delivery Pricer A-G, scope limits, markup engine</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expert notes */}
                                    {expertNotes && (<>
                                        <div className="h-px bg-border" />
                                        <div>
                                            <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                <PencilSquareIcon className="h-3.5 w-3.5 text-amber-500" />Expert Notes
                                            </div>
                                            <div className="text-[10px] text-muted-foreground italic px-3 py-2 rounded-lg bg-muted/30 border border-border">{expertNotes}</div>
                                        </div>
                                    </>)}
                                </div>
                                {/* Footer */}
                                <div className="px-6 py-3 bg-muted dark:bg-zinc-800 border-t border-border flex items-center justify-between">
                                    <div className="text-[9px] text-muted-foreground">Prepared by Regional Sales Manager Reyes, Expert — Strata Services · {new Date().toLocaleDateString()}</div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowProposalPreview(false)} className="px-4 py-2 rounded-lg text-[10px] font-bold border border-border bg-card text-foreground hover:bg-muted transition-colors">Close</button>
                                        <button onClick={() => setShowProposalPreview(false)} className="px-4 py-2 rounded-lg text-[10px] font-bold bg-brand-400 text-zinc-900 hover:bg-brand-300 transition-colors">Download PDF</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dealer picker floating window */}
                    {showDealerPicker && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200" onClick={() => setShowDealerPicker(false)}>
                            <div className="w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                                <div className="px-5 py-4 border-b border-border">
                                    <div className="text-sm font-bold text-foreground">Select Dealer for Review</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">The selected dealer will review the proposal, generate the approval chain, and assemble the final quote.</div>
                                </div>
                                <div className="p-4 space-y-2">
                                    {DEALER_OPTIONS.map(dealer => (
                                        <button
                                            key={dealer.name}
                                            onClick={() => setSelectedDealer(dealer.name)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedDealer === dealer.name ? 'border-brand-400 bg-brand-50 dark:bg-brand-500/10 ring-2 ring-brand-400/30' : 'border-border hover:bg-muted/50'}`}
                                        >
                                            <img src={dealer.photo} alt="" className="w-10 h-10 rounded-full ring-1 ring-border" />
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-foreground">{dealer.name}</div>
                                                <div className="text-[10px] text-muted-foreground">{dealer.role}</div>
                                            </div>
                                            {selectedDealer === dealer.name && (
                                                <CheckCircleIcon className="h-5 w-5 text-brand-500 shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="px-5 py-3 border-t border-border flex gap-2">
                                    <button onClick={() => setShowDealerPicker(false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-border bg-card text-foreground hover:bg-muted transition-colors">Cancel</button>
                                    <button
                                        onClick={() => {
                                            if (!selectedDealer) return;
                                            setSendingToDealer(true);
                                            setShowDealerPicker(false);
                                            setTimeout(pauseAware(() => nextStep()), 2500);
                                        }}
                                        disabled={!selectedDealer}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${selectedDealer ? 'bg-brand-400 text-zinc-900 hover:bg-brand-300' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                                    >
                                        <PaperAirplaneIcon className="h-3.5 w-3.5" />
                                        Send to {selectedDealer || 'Dealer'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sending toast */}
                    {sendingToDealer && (
                        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="px-4 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl flex items-center gap-2">
                                <CheckCircleIcon className="h-4 w-4 text-green-400 dark:text-green-600" />
                                <span className="text-xs font-bold">Proposal sent to {selectedDealer} for review</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}


// ═════════════════════════════════════════════════════════════════════════════
// NAMED EXPORT: WrgEstimatorReview (step w2.4 — Dealer Review + Approval + Release)
// Rendered inside Dashboard.tsx
// ═════════════════════════════════════════════════════════════════════════════

// ─── Estimation criteria for dealer review (from Delivery Pricer 2026) ───────
const ESTIMATION_CRITERIA = [
    {
        id: 'rate-cards',
        icon: 'calculator',
        label: 'Rate Cards Applied',
        chips: [
            { text: '$57/hr INSTALL', color: 'green' },
            { text: '$0.95/min DELIVERY', color: 'blue' },
            { text: 'KD +15%', color: 'purple' },
        ],
        items: [
            'Installation rate: $57/hr — Strata Healthcare Standard (TX metro)',
            'Delivery base rate: $0.95/min — DFW area multiplier',
            'KD assembly surcharge: +15% on knock-down items (124 chairs)',
        ],
    },
    {
        id: 'delivery-sections',
        icon: 'truck',
        label: 'Delivery Pricer — Sections A-G',
        chips: [
            { text: '7 SECTIONS', color: 'blue' },
            { text: 'SECTION G: $285', color: 'amber' },
        ],
        items: [
            'Section A (Seating): 241 items — task, guest, lounge, bariatric',
            'Section D (Tables): 25 items — conference, training, café, side',
            'Section E (Accessories): 12 glassboards — wall-mount installation',
            'Section F (Multipliers): Hospital site — restricted hours, freight elevator',
            'Section G (Transport): Trip charge $171 + hospital surcharge $114 = $285',
        ],
    },
    {
        id: 'site-conditions',
        icon: 'building',
        label: 'Site Conditions — Hospital',
        chips: [
            { text: 'RESTRICTED HOURS', color: 'amber' },
            { text: 'FREIGHT ELEVATOR', color: 'amber' },
            { text: 'TAX EXEMPT', color: 'green' },
        ],
        items: [
            'Delivery window: 6PM–6AM only (hospital policy)',
            'Freight elevator required — max load 3,000 lbs per trip',
            'Government Healthcare Entity — tax exempt',
            '3 floors — furniture distributed across Women\'s Health Center',
        ],
    },
    {
        id: 'scope-limits',
        icon: 'shield',
        label: 'Scope Limits & Overrides',
        chips: [
            { text: '1 OVERRIDE', color: 'amber' },
            { text: '2 CUSTOM', color: 'purple' },
        ],
        items: [
            '119 KD Task Chairs exceed 50-chair Delivery Pricer limit — expert override applied',
            'Custom 8-seat Carolina Booth — manual rate: 3.0 hrs + 1.5 hrs site fit',
            'Custom OFS Serpentine 12-seat — designer-verified: 14.0 hrs assembly',
        ],
    },
    {
        id: 'confidence',
        icon: 'chart',
        label: 'AI Confidence Analysis',
        chips: [
            { text: '19 HIGH', color: 'green' },
            { text: '5 LOW', color: 'amber' },
            { text: 'ALL RESOLVED', color: 'green' },
        ],
        items: [
            '19 items mapped automatically — confidence >85%',
            '5 items flagged for expert review — bariatric, pediatric, custom assembly',
            'All 5 resolved: 2 by expert, 1 by designer, 2 AI-suggested rates applied',
        ],
    },
    {
        id: 'product-categories',
        icon: 'cube',
        label: 'Product Categories — 24 Line Items',
        chips: [
            { text: '287 UNITS', color: 'blue' },
            { text: '185 MAN-HRS', color: 'green' },
        ],
        items: [
            'Seating (241 pcs): task chairs, guest, lounge, bariatric, folding, stacking',
            'Tables (25 pcs): conference, training, café, side, coffee',
            'Accessories (12 pcs): glassboards 36×48 with wall-mount',
            'Overhead (5 trips): pre-install site visit, punch walk, extra trips',
            'Custom (2 pcs): Carolina Booth + OFS Serpentine Lounge',
        ],
    },
];

// ─── Process comparison data (manual vs AI) ──────────────────────────────────
const PROCESS_COMPARISON = [
    { phase: 'Project intake & scope', manual: '2–3 days', manualMin: 2880, ai: '8 min', aiMin: 8, steps: 'w1.1–w1.5' },
    { phase: 'Cost estimation', manual: '4–8 hours', manualMin: 360, ai: '90s + 4 min review', aiMin: 5.5, steps: 'w2.1' },
    { phase: 'Designer verification', manual: '1–2 days', manualMin: 1440, ai: '3 min', aiMin: 3, steps: 'w2.2' },
    { phase: 'Quote assembly', manual: '2–4 hours', manualMin: 180, ai: '80s + 2 min review', aiMin: 3.3, steps: 'w2.3' },
    { phase: 'Approval & release', manual: '1–2 days', manualMin: 1440, ai: '2 min', aiMin: 2, steps: 'w2.4' },
];

export function WrgEstimatorReview({ onNavigate }: { onNavigate: (page: string) => void }) {
    const { currentStep, nextStep, isPaused } = useDemo();

    if (currentStep.id !== 'w2.4') return null;

    // pauseAware
    const isPausedRef = useRef(isPaused);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    const pauseAware = useCallback((fn: () => void) => {
        return () => {
            if (!isPausedRef.current) { fn(); return; }
            const poll = setInterval(() => { if (!isPausedRef.current) { clearInterval(poll); fn(); } }, 200);
        };
    }, []);

    const runChain = useCallback((
        events: Array<[number, () => void]>,
        timers: ReturnType<typeof setTimeout>[]
    ) => {
        const sorted = [...events].sort((a, b) => a[0] - b[0]);
        const step = (i: number) => {
            if (i >= sorted.length) return;
            const prevTime = i === 0 ? 0 : sorted[i - 1][0];
            const delay = Math.max(1, sorted[i][0] - prevTime);
            timers.push(setTimeout(pauseAware(() => { sorted[i][1](); step(i + 1); }), delay));
        };
        step(0);
    }, [pauseAware]);

    const [reviewPhase, setReviewPhase] = useState<ReviewPhase>('notification');
    const [showApprovalChain, setShowApprovalChain] = useState(false);
    const [dealerModuleComments, setDealerModuleComments] = useState<Record<string, string>>({});
    const [dealerCommentingModule, setDealerCommentingModule] = useState<string | null>(null);
    const [dealerCommentDraft, setDealerCommentDraft] = useState('');
    const [showQuotePreview, setShowQuotePreview] = useState(false);
    const [clarificationSent, setClarificationSent] = useState(false);
    const [clarificationConfirmed, setClarificationConfirmed] = useState(false);
    const [releaseAgents, setReleaseAgents] = useState<AgentVis[]>(RELEASE_AGENTS.map(a => ({ ...a, visible: false, done: false })));
    const [releaseProgress, setReleaseProgress] = useState(0);
    const [showToast, setShowToast] = useState(false);

    // ── Release pipeline ──────────────────────────────────────────────────
    useEffect(() => {
        if (reviewPhase !== 'releasing') return;
        setReleaseAgents(RELEASE_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        setReleaseProgress(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        const events: Array<[number, () => void]> = [];
        for (let i = 0; i < RELEASE_AGENTS.length; i++) {
            const idx = i;
            events.push([1400 * idx, () => setReleaseAgents(prev => prev.map((a, j) => j === idx ? { ...a, visible: true } : a))]);
            events.push([1400 * idx + 900, () => setReleaseAgents(prev => prev.map((a, j) => j === idx ? { ...a, done: true } : a))]);
        }
        for (let i = 1; i <= 20; i++) {
            const pct = i * 5;
            events.push([250 * i, () => setReleaseProgress(pct)]);
        }
        events.push([5100, () => { setReviewPhase('done'); setShowToast(true); }]);
        events.push([15200, () => setShowToast(false)]);
        runChain(events, timers);
        return () => timers.forEach(clearTimeout);
    }, [reviewPhase, pauseAware, runChain]);

    return (
        <div className="space-y-4">

            {/* ── Notification phase — expert sends proposal ── */}
            {reviewPhase === 'notification' && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-3">
                    <button
                        onClick={() => setReviewPhase('reviewing')}
                        className="w-full text-left p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-xl hover:shadow-brand-500/15 transition-all group cursor-pointer"
                    >
                        <div className="flex items-start gap-3">
                            <img src={EXPERT_PHOTO} alt="" className="w-10 h-10 rounded-full ring-2 ring-brand-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-foreground">Regional Sales Manager Reyes</span>
                                    <span className="text-[9px] text-muted-foreground">Strata Expert · Just now</span>
                                </div>
                                <div className="text-[11px] text-foreground leading-relaxed mb-2">
                                    Proposal ready for your review — <span className="font-bold">JPS Health Center for Women</span>. All labor costs verified by expert + designer, product quote from MillerKnoll applied with JPS contract pricing.
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <CubeIcon className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[9px] text-muted-foreground">24 line items</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CalculatorIcon className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[9px] text-muted-foreground">$202,138 total</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircleIcon className="h-3 w-3 text-green-500" />
                                        <span className="text-[9px] text-green-600 dark:text-green-400 font-bold">Expert + Designer verified</span>
                                    </div>
                                </div>
                            </div>
                            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-400 text-zinc-900 text-[9px] font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                                <EyeIcon className="h-3 w-3" />
                                Review
                            </div>
                        </div>
                    </button>

                    {/* Quick summary cards */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                            <div className="text-[8px] text-muted-foreground uppercase">Product</div>
                            <div className="text-sm font-bold text-foreground">$178,219</div>
                            <div className="text-[8px] text-muted-foreground">MillerKnoll net</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                            <div className="text-[8px] text-muted-foreground uppercase">Labor + Freight</div>
                            <div className="text-sm font-bold text-green-700 dark:text-green-400">$23,919</div>
                            <div className="text-[8px] text-muted-foreground">$17,685 + $6,234</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-brand-50 dark:bg-brand-500/5 border-2 border-brand-400 dark:border-brand-500/40 text-center">
                            <div className="text-[8px] text-muted-foreground uppercase">Total</div>
                            <div className="text-sm font-bold text-foreground">$202,138</div>
                            <div className="text-[8px] text-muted-foreground">Tax exempt</div>
                        </div>
                    </div>

                    {/* Attachments */}
                    <div className="p-3 rounded-xl bg-card border border-border">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Attachments</div>
                        <div className="space-y-1.5">
                            {[
                                { icon: <DocumentTextIcon className="h-3.5 w-3.5" />, name: 'Proposal_JPS_HCW_2026.pdf', size: '2.4 MB', color: 'text-red-500' },
                                { icon: <ClipboardDocumentListIcon className="h-3.5 w-3.5" />, name: 'Labor_Estimation_Report.xlsx', size: '856 KB', color: 'text-green-600' },
                                { icon: <DocumentTextIcon className="h-3.5 w-3.5" />, name: 'MillerKnoll_Quote_287450.pdf', size: '1.8 MB', color: 'text-red-500' },
                            ].map(att => (
                                <div key={att.name} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                                    <span className={att.color}>{att.icon}</span>
                                    <span className="text-[9px] font-bold text-foreground flex-1">{att.name}</span>
                                    <span className="text-[8px] text-muted-foreground">{att.size}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Reviewing phase ── */}
            {reviewPhase === 'reviewing' && (
                <div className="animate-in fade-in duration-500 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">Proposal Review — JPS Health Center for Women</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 font-bold ring-1 ring-inset ring-brand-600/20">$202,138</span>
                    </div>

                    {/* Pricing summary grid */}
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { label: 'Product Net', val: '$178,219', sub: 'MillerKnoll -38%', color: 'text-foreground' },
                            { label: 'Labor', val: '$17,685', sub: '15% margin', color: 'text-green-700 dark:text-green-400' },
                            { label: 'Freight', val: '$6,234', sub: 'DFW metro', color: 'text-blue-700 dark:text-blue-400' },
                        ].map(c => (
                            <div key={c.label} className="p-3 rounded-lg bg-card border border-border text-center">
                                <div className="text-[9px] text-muted-foreground uppercase">{c.label}</div>
                                <div className={`text-sm font-bold ${c.color}`}>{c.val}</div>
                                <div className="text-[8px] text-muted-foreground">{c.sub}</div>
                            </div>
                        ))}
                        <div className="p-3 rounded-lg bg-brand-50 dark:bg-brand-500/5 border-2 border-brand-400 dark:border-brand-500/40 text-center">
                            <div className="text-[9px] text-muted-foreground uppercase">Total</div>
                            <div className="text-sm font-bold text-foreground">$202,138</div>
                            <div className="text-[8px] text-muted-foreground">Tax exempt</div>
                        </div>
                    </div>

                    {/* Intake report — collapsible */}
                    <div className="p-3 rounded-xl bg-card border border-border space-y-2.5">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Project & Intake Summary</div>
                        <div className="grid grid-cols-3 gap-2">
                            {INTAKE_REPORT.project.map(f => (
                                <div key={f.label} className="px-2 py-1.5 rounded-lg bg-muted/50">
                                    <div className="text-[7px] text-muted-foreground uppercase">{f.label}</div>
                                    <div className="text-[9px] font-bold text-foreground flex items-center gap-1">
                                        {f.value}
                                        {f.badge && <span className="text-[7px] px-1 py-0.5 rounded bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold">{f.badge}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Product Scope</div>
                                {INTAKE_REPORT.scope.map(s => (
                                    <div key={s.label} className="flex items-center justify-between py-0.5">
                                        <span className="text-[8px] text-muted-foreground">{s.label}</span>
                                        <span className="text-[8px] font-bold text-foreground">{s.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Assigned Team</div>
                                {INTAKE_REPORT.team.map(t => (
                                    <div key={t.name} className="flex items-center gap-2 py-0.5">
                                        <img src={t.photo} alt="" className="w-5 h-5 rounded-full ring-1 ring-border" />
                                        <div>
                                            <span className="text-[8px] font-bold text-foreground">{t.name}</span>
                                            <span className="text-[8px] text-muted-foreground ml-1">— {t.role}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Mismatches Resolved (Flow 1)</div>
                            <div className="space-y-0.5">
                                {INTAKE_REPORT.mismatches.map(m => (
                                    <div key={m.item} className="flex items-center justify-between py-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircleIcon className="h-2.5 w-2.5 text-green-500 shrink-0" />
                                            <span className="text-[8px] font-bold text-foreground">{m.item}</span>
                                            <span className="text-[7px] px-1 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold ring-1 ring-inset ring-amber-600/20">{m.badge}</span>
                                        </div>
                                        <span className="text-[8px] text-muted-foreground">{m.resolution}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 2x2 Grid: AI Draft + Delivery | Review Activity + Timeline */}
                    <div className="grid grid-cols-2 gap-2">
                        {/* AI Draft */}
                        <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                            <div className="text-[9px] text-muted-foreground uppercase mb-1">AI Draft (Labor)</div>
                            <div className="text-lg font-bold text-foreground">${COMBINED_TOTAL.toLocaleString()}</div>
                            <div className="text-[10px] text-muted-foreground">24 items · {FLAGGED_COUNT} flagged</div>
                        </div>
                        {/* Expert+Designer Review */}
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 text-center">
                            <div className="text-[9px] text-muted-foreground uppercase mb-1">Expert + Designer Review</div>
                            <div className="text-lg font-bold text-green-700 dark:text-green-400">${REVIEWED_COMBINED.toLocaleString()}</div>
                            <div className="text-[10px] text-muted-foreground">24 approved · {FLAGGED_COUNT} adjusted</div>
                        </div>
                        {/* Delivery Timeline */}
                        <div className="p-3 rounded-lg bg-card border border-border">
                            <div className="text-[9px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Delivery Timeline</div>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                    <ClockIcon className="h-3 w-3 text-green-500 shrink-0" />
                                    <span className="text-[9px] text-foreground">Standard: <span className="font-bold">8-10 wk</span></span>
                                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full rounded-full bg-green-500" style={{ width: '70%' }} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <ClockIcon className="h-3 w-3 text-amber-500 shrink-0" />
                                    <span className="text-[9px] text-foreground">Custom OFS: <span className="font-bold">12 wk</span></span>
                                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full rounded-full bg-amber-500" style={{ width: '85%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Review Activity */}
                        <div className="p-3 rounded-lg bg-card border border-border">
                            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Review Activity</div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[9px]">
                                    <CheckCircleIcon className="h-3 w-3 text-green-500 shrink-0" />
                                    <span className="text-foreground"><span className="font-bold">Regional Sales Manager Reyes</span> — 24 items, {FLAGGED_COUNT} adjusted</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px]">
                                    <CheckCircleIcon className="h-3 w-3 text-sky-500 shrink-0" />
                                    <span className="text-foreground"><span className="font-bold">Designer Alden</span> — 5 modules verified</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px]">
                                    <SparklesIcon className="h-3 w-3 text-indigo-500 shrink-0" />
                                    <span className="text-foreground">AI — Pricer A-G, scope, markup</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Estimation criteria — 2-col grid */}
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Estimation Criteria Applied</div>
                    <div className="grid grid-cols-2 gap-2">
                    {ESTIMATION_CRITERIA.map(criteria => {
                        const iconMap: Record<string, React.ReactNode> = {
                            calculator: <CalculatorIcon className="h-3.5 w-3.5" />,
                            truck: <TruckIcon className="h-3.5 w-3.5" />,
                            building: <ExclamationTriangleIcon className="h-3.5 w-3.5" />,
                            shield: <ShieldCheckIcon className="h-3.5 w-3.5" />,
                            chart: <SparklesIcon className="h-3.5 w-3.5" />,
                            cube: <CubeIcon className="h-3.5 w-3.5" />,
                        };
                        const chipColors: Record<string, string> = {
                            green: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30',
                            blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/30',
                            amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30',
                            purple: 'bg-purple-50 text-purple-700 dark:bg-ai/15 dark:text-purple-300 ring-1 ring-inset ring-purple-600/20 dark:ring-purple-400/30',
                        };
                        return (
                            <div key={criteria.id} className="p-2.5 rounded-xl bg-card border border-border">
                                <div className="flex items-start justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-indigo-500 shrink-0">{iconMap[criteria.icon]}</span>
                                        <span className="text-[9px] font-bold text-foreground leading-tight">{criteria.label}</span>
                                    </div>
                                    <button
                                        onClick={() => { setDealerCommentingModule(dealerCommentingModule === criteria.id ? null : criteria.id); setDealerCommentDraft(dealerModuleComments[criteria.id] || ''); }}
                                        className={`p-0.5 rounded hover:bg-muted transition-colors shrink-0 ${dealerModuleComments[criteria.id] ? 'text-brand-500' : 'text-muted-foreground'}`}
                                    >
                                        <ChatBubbleLeftEllipsisIcon className="h-3 w-3" />
                                    </button>
                                </div>
                                {/* Chips */}
                                <div className="flex flex-wrap gap-1 mb-1.5">
                                    {criteria.chips.map(chip => (
                                        <span key={chip.text} className={`text-[7px] px-1 py-0.5 rounded font-bold ${chipColors[chip.color]}`}>{chip.text}</span>
                                    ))}
                                </div>
                                {/* Detail items */}
                                <div className="space-y-0.5">
                                    {criteria.items.map((item, i) => (
                                        <div key={i} className="flex items-start gap-1.5 py-0.5">
                                            <CheckCircleIcon className="h-2.5 w-2.5 text-green-500 shrink-0 mt-0.5" />
                                            <span className="text-[9px] text-muted-foreground leading-tight">{item}</span>
                                        </div>
                                    ))}
                                </div>
                                {/* Comment editor */}
                                {dealerCommentingModule === criteria.id && (
                                    <div className="mt-1.5 p-2 rounded-lg bg-brand-50 dark:bg-brand-500/5 border border-brand-200 dark:border-brand-500/20 animate-in fade-in duration-200">
                                        <textarea value={dealerCommentDraft} onChange={e => setDealerCommentDraft(e.target.value)} placeholder="Add observation..." className="w-full text-[9px] bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none" rows={2} />
                                        <div className="flex justify-end gap-2 mt-1">
                                            <button onClick={() => setDealerCommentingModule(null)} className="text-[8px] px-2 py-0.5 rounded text-muted-foreground hover:text-foreground">Cancel</button>
                                            <button onClick={() => { setDealerModuleComments(prev => ({ ...prev, [criteria.id]: dealerCommentDraft })); setDealerCommentingModule(null); }} className="text-[8px] px-2 py-0.5 rounded bg-brand-400 text-zinc-900 font-bold">Save</button>
                                        </div>
                                    </div>
                                )}
                                {dealerModuleComments[criteria.id] && dealerCommentingModule !== criteria.id && (
                                    <div className="mt-1.5 px-2 py-1 rounded-lg bg-brand-50/50 dark:bg-brand-500/5 border border-brand-200/50 dark:border-brand-500/20">
                                        <div className="text-[8px] text-brand-600 dark:text-brand-400 font-bold mb-0.5">Dealer Observation</div>
                                        <div className="text-[9px] text-foreground">{dealerModuleComments[criteria.id]}</div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    </div>

                    {/* Expert clarification simulation */}
                    {!clarificationSent && (
                        <button
                            onClick={() => setClarificationSent(true)}
                            className="w-full py-2 rounded-xl text-[10px] font-bold border border-sky-300 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/5 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/10 transition-all flex items-center justify-center gap-2"
                        >
                            <ChatBubbleLeftEllipsisIcon className="h-3 w-3" />
                            Request Clarification from Expert
                        </button>
                    )}
                    {clarificationSent && !clarificationConfirmed && (
                        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-start gap-3">
                                <img src={EXPERT_PHOTO} alt="" className="w-7 h-7 rounded-full ring-2 ring-sky-400" />
                                <div className="flex-1">
                                    <div className="text-[10px] font-bold text-foreground">Response from Regional Sales Manager Reyes</div>
                                    <div className="text-[9px] text-muted-foreground mt-1">
                                        The bariatric chair rate includes a 20% handling surcharge per Strata HC Standard. The OFS Serpentine assembly was verified by the designer — 14.0 hrs total, standard brackets confirmed. Section G charges include hospital surcharge ($114) as required for healthcare facilities.
                                    </div>
                                    <button
                                        onClick={() => setClarificationConfirmed(true)}
                                        className="mt-1.5 px-3 py-1 rounded-lg text-[9px] font-bold bg-sky-600 text-white hover:bg-sky-700 transition-colors flex items-center gap-1"
                                    >
                                        <CheckIcon className="h-3 w-3" />
                                        Clarification Received
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {clarificationConfirmed && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                            <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            <span className="text-[10px] font-bold text-green-700 dark:text-green-400">Expert clarification confirmed — all items resolved</span>
                        </div>
                    )}

                    {/* Action buttons: Preview + Approve */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowQuotePreview(true)}
                            className="flex-1 py-3 rounded-xl text-xs font-bold border border-border bg-card text-foreground hover:bg-muted transition-all flex items-center justify-center gap-2"
                        >
                            <EyeIcon className="h-3.5 w-3.5" />
                            Preview Quote
                        </button>
                        <button
                            onClick={() => setShowApprovalChain(true)}
                            className="flex-1 py-3 rounded-xl text-xs font-bold bg-brand-400 text-zinc-900 hover:bg-brand-300 shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            Approve & Release
                            <ArrowRightIcon className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Approved phase — preview & release ── */}
            {reviewPhase === 'approved' && (
                <div className="animate-in fade-in duration-500 space-y-3">
                    {/* Approval confirmed header */}
                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 shrink-0" />
                            <div>
                                <div className="text-[11px] font-bold text-foreground">Approval Chain Complete</div>
                                <div className="text-[9px] text-muted-foreground">Regional Sales Manager Reyes, Designer Alden, Account Manager Kai, Jordan Park — all approved</div>
                            </div>
                        </div>
                    </div>

                    {/* Quote summary */}
                    <div className="p-3 rounded-xl bg-card border border-border">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Proposal Summary</div>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { label: 'Product Net', val: '$178,219', color: 'text-foreground' },
                                { label: 'Labor', val: '$17,685', color: 'text-green-700 dark:text-green-400' },
                                { label: 'Freight', val: '$6,234', color: 'text-blue-700 dark:text-blue-400' },
                            ].map(c => (
                                <div key={c.label} className="text-center">
                                    <div className="text-[8px] text-muted-foreground uppercase">{c.label}</div>
                                    <div className={`text-xs font-bold ${c.color}`}>{c.val}</div>
                                </div>
                            ))}
                            <div className="text-center">
                                <div className="text-[8px] text-muted-foreground uppercase">Total</div>
                                <div className="text-xs font-black text-foreground">$202,138</div>
                            </div>
                        </div>
                    </div>

                    {/* Recipients */}
                    <div className="p-3 rounded-xl bg-card border border-border">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Recipients</div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px]">
                                <PaperAirplaneIcon className="h-3 w-3 text-brand-500 shrink-0" />
                                <span className="text-foreground"><span className="font-bold">JPS Health Network</span> — Client (PDF proposal)</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px]">
                                <UserGroupIcon className="h-3 w-3 text-sky-500 shrink-0" />
                                <span className="text-foreground"><span className="font-bold">Regional Sales Manager Reyes, Designer Alden, Account Manager Kai</span> — Confirmation</span>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowQuotePreview(true)}
                            className="flex-1 py-3 rounded-xl text-xs font-bold border border-border bg-card text-foreground hover:bg-muted transition-all flex items-center justify-center gap-2"
                        >
                            <EyeIcon className="h-3.5 w-3.5" />
                            Preview Quote PDF
                        </button>
                        <button
                            onClick={() => setReviewPhase('releasing')}
                            className="flex-1 py-3 rounded-xl text-xs font-bold bg-brand-400 text-zinc-900 hover:bg-brand-300 shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <PaperAirplaneIcon className="h-3.5 w-3.5" />
                            Release to Client
                        </button>
                    </div>
                </div>
            )}

            {/* ── Releasing phase — agent pipeline ── */}
            {reviewPhase === 'releasing' && (
                <div className="animate-in fade-in duration-500 space-y-3">
                    <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <AIAgentAvatar />
                            <span className="text-xs font-bold text-foreground">Quote Generation & Client Release</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                            <div className="h-full rounded-full bg-brand-400 transition-all duration-[3500ms] ease-linear" style={{ width: `${releaseProgress}%` }} />
                        </div>
                        <div className="space-y-1.5">
                            {releaseAgents.map(agent => (
                                <div key={agent.name} className={`flex items-center gap-2 text-[10px] transition-all duration-300 ${agent.visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                                    {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-indigo-500 animate-spin shrink-0" />}
                                    <span className={agent.done ? 'text-foreground' : 'text-indigo-600 dark:text-indigo-400'}>{agent.name}</span>
                                    <span className="text-muted-foreground">{agent.detail}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Done state ── */}
            {reviewPhase === 'done' && (
                <div className="animate-in fade-in scale-in-95 duration-500 space-y-3">
                    {/* Header */}
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                        <div className="flex items-center gap-3">
                            <CheckCircleIcon className="h-6 w-6 text-green-500 shrink-0" />
                            <div>
                                <div className="text-xs font-bold text-foreground">Proposal Released to JPS Health Network</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Quote #WRG-2024-0847 · $202,138 · {new Date().toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Process comparison: 2x2 + 1 cards with icons */}
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider px-1">Process Time — Manual vs AI</div>
                    <div className="grid grid-cols-2 gap-2">
                        {PROCESS_COMPARISON.map(row => {
                            const iconMap: Record<string, React.ReactNode> = {
                                'w1.1–w1.5': <DocumentTextIcon className="h-4 w-4" />,
                                'w2.1': <CalculatorIcon className="h-4 w-4" />,
                                'w2.2': <ClipboardDocumentListIcon className="h-4 w-4" />,
                                'w2.3': <CubeIcon className="h-4 w-4" />,
                                'w2.4': <PaperAirplaneIcon className="h-4 w-4" />,
                            };
                            const maxMin = Math.max(...PROCESS_COMPARISON.map(r => r.manualMin));
                            const savingPct = Math.round((1 - row.aiMin / row.manualMin) * 100);
                            return (
                                <div key={row.phase} className="p-2.5 rounded-xl bg-card border border-border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-indigo-500 shrink-0">{iconMap[row.steps]}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[9px] font-bold text-foreground truncate">{row.phase}</div>
                                            <span className="text-[7px] font-bold text-muted-foreground bg-muted px-1 py-0.5 rounded">{row.steps}</span>
                                        </div>
                                    </div>
                                    {/* Stacked mini bars */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
                                                <div className="h-full rounded bg-zinc-300 dark:bg-zinc-600" style={{ width: `${(row.manualMin / maxMin) * 100}%` }} />
                                            </div>
                                            <span className="text-[8px] font-bold text-muted-foreground w-12 text-right">{row.manual}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
                                                <div className="h-full rounded bg-brand-400" style={{ width: `${Math.max((row.aiMin / maxMin) * 100, 2)}%` }} />
                                            </div>
                                            <span className="text-[8px] font-bold text-brand-600 dark:text-brand-400 w-12 text-right">{row.ai}</span>
                                        </div>
                                    </div>
                                    <div className="mt-1.5 text-right">
                                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-bold">{savingPct}% faster</span>
                                    </div>
                                </div>
                            );
                        })}
                        {/* Total summary card */}
                        <div className="col-span-2 p-3 rounded-xl bg-brand-50 dark:bg-brand-500/5 border-2 border-brand-300 dark:border-brand-500/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                                    <div>
                                        <div className="text-[10px] font-bold text-foreground">Full Process</div>
                                        <div className="text-[9px] text-muted-foreground"><span className="line-through">3–5 days manual</span></div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-brand-700 dark:text-brand-400">22 min</div>
                                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-brand-200 dark:bg-brand-500/20 text-brand-800 dark:text-brand-300 font-bold">~99% faster</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Completion items */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border">
                            <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-[10px] text-foreground">Quote $202,138 written to CORE — audit trail attached</span>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border">
                            <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-[10px] text-foreground">PDF proposal sent to JPS Health Network</span>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border">
                            <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-[10px] text-foreground">Stakeholders notified — Regional Sales Manager Reyes, Designer Alden, Account Manager Kai</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Quote Preview Modal */}
            {showQuotePreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200" onClick={() => setShowQuotePreview(false)}>
                    <div className="w-full max-w-3xl max-h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="px-6 py-4 bg-muted border-b border-border flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-foreground tracking-wide">CLIENT PROPOSAL — JPS HEALTH CENTER FOR WOMEN</div>
                                <div className="text-[10px] text-muted-foreground">Quote #WRG-2024-0847 · Prepared by Regional Sales Manager Reyes · {new Date().toLocaleDateString()}</div>
                            </div>
                            <button onClick={() => setShowQuotePreview(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                                <XMarkIcon className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4 overflow-y-auto max-h-[72vh]">

                            {/* §1 — Project & Intake Summary */}
                            <div>
                                <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <DocumentTextIcon className="h-3.5 w-3.5 text-indigo-500" />1. Project & Intake Summary
                                </div>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    {INTAKE_REPORT.project.map(f => (
                                        <div key={f.label} className="px-2 py-1.5 rounded-lg bg-muted/40">
                                            <div className="text-[8px] text-muted-foreground uppercase">{f.label}</div>
                                            <div className="text-[10px] font-bold text-foreground flex items-center gap-1">
                                                {f.value}
                                                {f.badge && <span className="text-[7px] px-1 py-0.5 rounded bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold">{f.badge}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Product Scope</div>
                                        {INTAKE_REPORT.scope.map(s => (
                                            <div key={s.label} className="flex items-center justify-between py-0.5">
                                                <span className="text-[8px] text-muted-foreground">{s.label}</span>
                                                <span className="text-[8px] font-bold text-foreground">{s.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Strata Registration</div>
                                        {INTAKE_REPORT.registration.map(r => (
                                            <div key={r.label} className="flex items-center justify-between py-0.5">
                                                <span className="text-[8px] text-muted-foreground">{r.label}</span>
                                                <span className="text-[8px] font-bold text-foreground">{r.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="h-px bg-border" />

                            {/* §2 — Assigned Team */}
                            <div>
                                <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <UserGroupIcon className="h-3.5 w-3.5 text-sky-500" />2. Assigned Team
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {INTAKE_REPORT.team.map(t => (
                                        <div key={t.name} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 border border-border">
                                            <img src={t.photo} alt="" className="w-8 h-8 rounded-full ring-1 ring-border" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[10px] font-bold text-foreground">{t.name}</div>
                                                <div className="text-[8px] text-muted-foreground">{t.role} — {t.detail}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="h-px bg-border" />

                            {/* §3 — Mismatches Resolved */}
                            <div>
                                <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <ExclamationTriangleIcon className="h-3.5 w-3.5 text-amber-500" />3. Mismatches Resolved (Flow 1)
                                </div>
                                <div className="space-y-1">
                                    {INTAKE_REPORT.mismatches.map(m => (
                                        <div key={m.item} className="flex items-center justify-between py-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircleIcon className="h-3 w-3 text-green-500 shrink-0" />
                                                <span className="text-[9px] font-bold text-foreground">{m.item}</span>
                                                <span className="text-[7px] px-1 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold ring-1 ring-inset ring-amber-600/20">{m.badge}</span>
                                            </div>
                                            <span className="text-[8px] text-muted-foreground">{m.resolution}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="h-px bg-border" />

                            {/* §4 — Flagged Items & Expert Adjustments */}
                            <div>
                                <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <AdjustmentsHorizontalIcon className="h-3.5 w-3.5 text-ai" />4. Flagged Items & Expert Adjustments
                                </div>
                                <div className="space-y-1.5">
                                    {EXPERT_ADJUSTMENTS.map(adj => (
                                        <div key={adj.id} className="p-2 rounded-lg bg-muted/30 border border-border">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-[9px] font-bold text-foreground">{adj.item}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[8px] font-bold text-green-600 dark:text-green-400">{adj.impact}</span>
                                                    {adj.requiresDesigner && <span className="text-[7px] px-1 py-0.5 rounded bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold">DESIGNER</span>}
                                                </div>
                                            </div>
                                            <div className="text-[8px] text-muted-foreground">{adj.aiSuggestion}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="h-px bg-border" />

                            {/* §5 — Labor Cost Breakdown */}
                            <div>
                                <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <CalculatorIcon className="h-3.5 w-3.5 text-blue-500" />5. Labor Cost Breakdown
                                </div>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 text-center">
                                        <div className="text-[8px] text-muted-foreground uppercase">Delivery</div>
                                        <div className="text-sm font-bold text-blue-700 dark:text-blue-400">${DELIVERY_TOTAL_COST.toLocaleString()}</div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 text-center">
                                        <div className="text-[8px] text-muted-foreground uppercase">Installation</div>
                                        <div className="text-sm font-bold text-green-700 dark:text-green-400">${REVIEWED_INSTALL_COST.toLocaleString()}</div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                                        <div className="text-[8px] text-muted-foreground uppercase">Combined</div>
                                        <div className="text-sm font-bold text-foreground">${REVIEWED_COMBINED.toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Delivery Detail</div>
                                        {DELIVERY_BREAKDOWN.map(d => (
                                            <div key={d.category} className="flex items-center justify-between py-0.5 border-b border-border/50 last:border-0">
                                                <span className="text-[8px] text-muted-foreground">{d.category}</span>
                                                <span className="text-[8px] font-bold text-foreground">{d.minutes}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-bold text-green-600 dark:text-green-400 uppercase mb-1">Installation Detail</div>
                                        {INSTALLATION_BREAKDOWN.map(d => (
                                            <div key={d.category} className="flex items-center justify-between py-0.5 border-b border-border/50 last:border-0">
                                                <span className="text-[8px] text-muted-foreground">{d.category}</span>
                                                <span className="text-[8px] font-bold text-foreground">{d.hours}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="h-px bg-border" />

                            {/* §6 — Product Quote & Pricing Waterfall */}
                            <div>
                                <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <CubeIcon className="h-3.5 w-3.5 text-success" />6. Product Quote & Pricing Waterfall
                                </div>
                                <div className="mb-2">
                                    <div className="text-[8px] font-bold text-muted-foreground uppercase mb-1">MillerKnoll Product Breakdown</div>
                                    {PRODUCT_QUOTE_BREAKDOWN.map(p => (
                                        <div key={p.label} className="flex items-center justify-between py-0.5 border-b border-border/50 last:border-0">
                                            <div>
                                                <span className="text-[9px] font-bold text-foreground">{p.label}</span>
                                                <span className="text-[8px] text-muted-foreground ml-1.5">{p.detail}</span>
                                            </div>
                                            <span className="text-[9px] font-bold text-foreground">{p.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="rounded-xl border border-border overflow-hidden">
                                    {WATERFALL_ROWS.map(row => (
                                        <div key={row.label} className={`flex items-center justify-between ${waterfallStyles[row.type]}`}>
                                            {row.type === 'discount' ? (
                                                <div className="flex items-center gap-2">
                                                    <ArrowDownIcon className="h-3 w-3 text-green-500" />
                                                    <span className="text-[10px] font-bold text-green-700 dark:text-green-400">{row.label}</span>
                                                </div>
                                            ) : (
                                                <span className={`text-[11px] ${row.type === 'total' ? 'text-xs font-bold uppercase' : 'font-medium'} ${waterfallTextStyles[row.type]}`}>{row.label}</span>
                                            )}
                                            {row.value && <span className={`${row.type === 'total' ? 'text-lg font-black' : 'text-sm font-bold'} ${waterfallTextStyles[row.type]}`}>{row.value}</span>}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-center mt-1.5">
                                    <span className="text-[8px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold uppercase tracking-wider">TAX EXEMPT — Government Healthcare Entity</span>
                                </div>
                            </div>
                            <div className="h-px bg-border" />

                            {/* §7 — Estimation Criteria */}
                            <div>
                                <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <ShieldCheckIcon className="h-3.5 w-3.5 text-indigo-500" />7. Estimation Criteria Applied
                                </div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                    {[
                                        { icon: <CalculatorIcon className="h-3 w-3" />, text: 'Rate cards: $57/hr install · $0.95/min delivery' },
                                        { icon: <TruckIcon className="h-3 w-3" />, text: 'Delivery Pricer sections A-G applied' },
                                        { icon: <ExclamationTriangleIcon className="h-3 w-3" />, text: 'Hospital site: restricted hrs, freight elevator' },
                                        { icon: <ShieldCheckIcon className="h-3 w-3" />, text: 'Scope limit: 119 KD chairs > 50-chair cap' },
                                        { icon: <SparklesIcon className="h-3 w-3" />, text: '20 HIGH + 5 LOW confidence items reviewed' },
                                        { icon: <CubeIcon className="h-3 w-3" />, text: '24 items: seating, tables, boards, custom' },
                                    ].map((c, i) => (
                                        <div key={i} className="flex items-center gap-1.5 py-0.5">
                                            <span className="text-indigo-500 shrink-0">{c.icon}</span>
                                            <span className="text-[8px] text-muted-foreground">{c.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="h-px bg-border" />

                            {/* §8 — Delivery Timeline */}
                            <div>
                                <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <ClockIcon className="h-3.5 w-3.5 text-green-500" />8. Delivery Timeline
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                                        <div className="text-[9px] font-bold text-foreground mb-0.5">Standard items</div>
                                        <div className="text-sm font-bold text-green-700 dark:text-green-400">8–10 weeks</div>
                                        <div className="text-[8px] text-muted-foreground">22 standard MillerKnoll items</div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                                        <div className="text-[9px] font-bold text-foreground mb-0.5">Custom OFS Serpentine</div>
                                        <div className="text-sm font-bold text-amber-600 dark:text-amber-400">12 weeks</div>
                                        <div className="text-[8px] text-muted-foreground">Custom 12-seat — designer verified</div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-px bg-border" />

                            {/* §9 — Review Trail */}
                            <div>
                                <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <ClipboardDocumentCheckIcon className="h-3.5 w-3.5 text-sky-500" />9. Review Trail
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-[9px]">
                                        <CheckCircleIcon className="h-3 w-3 text-green-500 shrink-0" />
                                        <span><span className="font-bold">Regional Sales Manager Reyes</span> (Expert) — 24 items reviewed, 5 adjustments, OFS escalated</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px]">
                                        <CheckCircleIcon className="h-3 w-3 text-sky-500 shrink-0" />
                                        <span><span className="font-bold">Designer Alden</span> (Designer) — 5 modules validated, OFS Serpentine confirmed</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px]">
                                        <SparklesIcon className="h-3 w-3 text-indigo-500 shrink-0" />
                                        <span>AI — Intake processing, Delivery Pricer A-G, scope limits, markup engine</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dealer comments if any */}
                            {Object.keys(dealerModuleComments).length > 0 && (<>
                                <div className="h-px bg-border" />
                                <div>
                                    <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                        <ChatBubbleLeftEllipsisIcon className="h-3.5 w-3.5 text-brand-500" />Dealer Comments
                                    </div>
                                    <div className="space-y-1">
                                        {Object.entries(dealerModuleComments).map(([moduleId, comment]) => (
                                            <div key={moduleId} className="text-[9px] px-3 py-1.5 rounded-lg bg-muted/30 border border-border">
                                                <span className="font-bold text-foreground capitalize">{moduleId.replace(/-/g, ' ')}:</span>{' '}
                                                <span className="text-muted-foreground italic">{comment}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>)}
                        </div>
                        {/* Footer */}
                        <div className="px-6 py-3 bg-muted dark:bg-zinc-800 border-t border-border flex items-center justify-between">
                            <div className="text-[9px] text-muted-foreground">Prepared by Regional Sales Manager Reyes, Expert — Strata Services · {new Date().toLocaleDateString()}</div>
                            <div className="flex gap-2">
                                <button onClick={() => setShowQuotePreview(false)} className="px-4 py-2 rounded-lg text-[10px] font-bold border border-border bg-card text-foreground hover:bg-muted transition-colors">Close</button>
                                <button onClick={() => setShowQuotePreview(false)} className="px-4 py-2 rounded-lg text-[10px] font-bold bg-brand-400 text-zinc-900 hover:bg-brand-300 transition-colors">Download PDF</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Chain Modal */}
            <ApprovalChainModal
                isOpen={showApprovalChain}
                onClose={() => setShowApprovalChain(false)}
                trigger="Proposal $202,138 requires multi-role approval before client release"
                approvers={ESTIMATION_APPROVERS}
                onComplete={() => {
                    setShowApprovalChain(false);
                    setReviewPhase('approved');
                }}
            />

            {/* Toast */}
            {showToast && (
                <div className="fixed bottom-20 right-6 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="px-4 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-400 dark:text-green-600" />
                        <span className="text-xs font-bold">Proposal released — JPS Health Network notified</span>
                    </div>
                </div>
            )}
        </div>
    );
}
