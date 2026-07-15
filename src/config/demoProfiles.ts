// ═══════════════════════════════════════════════════════════════════════════════
// Demo Profile Registry — Central configuration for multi-demo support
// ═══════════════════════════════════════════════════════════════════════════════

import type { StepBehavior } from '../components/demo/DemoStepBanner';
import { COI_STEPS, COI_STEP_BEHAVIOR, COI_STEP_MESSAGES, COI_SELF_INDICATED } from './profiles/coi';
import { COI_DEMO_STEPS, COI_DEMO_STEP_BEHAVIOR, COI_DEMO_STEP_MESSAGES, COI_DEMO_SELF_INDICATED } from './profiles/coi-demo';
import { DUPLER_STEPS, DUPLER_STEP_BEHAVIOR, DUPLER_STEP_MESSAGES, DUPLER_SELF_INDICATED } from './profiles/dupler';
import { OPS_DEMO_STEPS, OPS_DEMO_STEP_BEHAVIOR, OPS_DEMO_STEP_MESSAGES, OPS_DEMO_SELF_INDICATED } from './profiles/ops-demo';
import { CONTINUA_DEMO_STEPS, CONTINUA_DEMO_STEP_BEHAVIOR, CONTINUA_DEMO_STEP_MESSAGES, CONTINUA_DEMO_SELF_INDICATED } from './profiles/continua-demo';
import { WRG_DEMO_STEPS, WRG_DEMO_STEP_BEHAVIOR, WRG_DEMO_STEP_MESSAGES, WRG_DEMO_SELF_INDICATED } from './profiles/wrg-demo';
import { MBI_STEPS, MBI_STEP_BEHAVIOR, MBI_STEP_MESSAGES, MBI_SELF_INDICATED } from './profiles/mbi';
import { LELAND_STEPS, LELAND_STEP_BEHAVIOR, LELAND_STEP_MESSAGES, LELAND_SELF_INDICATED } from './profiles/leland-demo';
import { BFI_STEPS, BFI_STEP_BEHAVIOR, BFI_STEP_MESSAGES, BFI_SELF_INDICATED } from './profiles/bfi';
import { WORKSPACES_STEPS, WORKSPACES_STEP_BEHAVIOR, WORKSPACES_STEP_MESSAGES, WORKSPACES_SELF_INDICATED } from './profiles/workspaces';
import { OFFICEWORKS_STEPS, OFFICEWORKS_STEP_BEHAVIOR, OFFICEWORKS_STEP_MESSAGES, OFFICEWORKS_SELF_INDICATED } from './profiles/officeworks';
import {
    INBOUND_OUTBOUND_STEPS,
    INBOUND_OUTBOUND_STEP_BEHAVIOR,
    INBOUND_OUTBOUND_STEP_MESSAGES,
    INBOUND_OUTBOUND_SELF_INDICATED,
} from './profiles/inbound-outbound';

export type SimulationApp =
    | 'dashboard' | 'expert-hub' | 'email-marketplace'
    | 'quote-po' | 'dealer-kanban' | 'service-now'
    | 'catalog' | 'survey' | 'ack-detail' | 'order-detail'
    | 'quote-detail' | 'transactions' | 'mac' | 'inventory'
    | 'crm'
    | 'dupler-pdf' | 'dupler-warehouse' | 'dupler-reporting'
    | 'wrg-estimator'
    | 'mbi-overview' | 'mbi-budget' | 'mbi-accounting' | 'mbi-quotes' | 'mbi-design'
    | 'leland-strata' | 'leland-inbox' | 'leland-seradex' | 'leland-review'
    | 'bfi-agency-fee' | 'bfi-receiving'
    | 'workspaces-submit' | 'workspaces-approval' | 'workspaces-ap' | 'workspaces-reporting'
    | 'officeworks-intake' | 'officeworks-design' | 'officeworks-spec-check' | 'officeworks-submission' | 'officeworks-dashboard';

export interface DemoStep {
    id: string;
    groupId: number;
    groupTitle: string;
    title: string;
    description: string;
    app: SimulationApp;
    role: 'Expert' | 'System' | 'Dealer' | 'End User' | 'Sales Rep' | 'Facility Manager' | 'Facility User' | 'Designer' | 'Sales Coordinator' | 'Estimator' | 'Project Manager' | 'Operations Manager' | 'AP Coordinator' | 'CFO' | 'CAO' | 'Employee' | 'Account Manager' | 'Receiving Coordinator' | 'Finance / AR' | 'Accountant' | 'BFI Manager' | 'Design Manager' | 'Order Entry' | 'Order Entry Manager' | 'Production Manager' | 'Logistics' | 'AR/AP';
    highlightId?: string;
}

export type DemoProfileId = 'acme' | 'coi' | 'dupler' | 'ops' | 'continua' | 'wrg' | 'mbi' | 'leland' | 'bfi' | 'workspaces' | 'officeworks' | 'inbound-outbound';

export interface DemoProfile {
    id: DemoProfileId;
    name: string;
    companyName: string;
    description: string;
    icon: string;
    /** Optional override for the navbar's small uppercase label.
     *  Defaults to "Dealer Experience" if not set. */
    experienceLabel?: string;
    steps: DemoStep[];
    stepBehavior: Record<string, StepBehavior>;
    stepMessages: Record<string, string[]>;
    selfIndicatedSteps: string[];
}

// Order: most recently created demo first (newest at top of Switch Demo dropdown).
// To add a new demo, prepend its entry — do not append.
export const DEMO_PROFILES: DemoProfile[] = [
    {
        id: 'inbound-outbound',
        name: 'Inbound | Outbound',
        companyName: 'Inbound | Outbound',
        description: 'Manufacturer order entry · inbound RFQ + PO · outbound quote + ack + shipping + invoice · 12 steps · 2 flows',
        icon: '📦',
        experienceLabel: 'Manufacturer Experience',
        steps: INBOUND_OUTBOUND_STEPS,
        stepBehavior: INBOUND_OUTBOUND_STEP_BEHAVIOR,
        stepMessages: INBOUND_OUTBOUND_STEP_MESSAGES,
        selfIndicatedSteps: INBOUND_OUTBOUND_SELF_INDICATED,
    },
    {
        id: 'officeworks',
        name: 'Officeworks',
        companyName: 'Officeworks Inc.',
        description: 'Spec Check & Design AI · Teknion BOM validation · MANATT 4th Floor',
        icon: '📐',
        steps: OFFICEWORKS_STEPS,
        stepBehavior: OFFICEWORKS_STEP_BEHAVIOR,
        stepMessages: OFFICEWORKS_STEP_MESSAGES,
        selfIndicatedSteps: OFFICEWORKS_SELF_INDICATED,
    },
    {
        id: 'workspaces',
        name: 'Workscapes',
        companyName: 'Workscapes, Inc.',
        description: 'Expense report AI · GL auto-fill · CORE sync · spend dashboard',
        icon: '📊',
        steps: WORKSPACES_STEPS,
        stepBehavior: WORKSPACES_STEP_BEHAVIOR,
        stepMessages: WORKSPACES_STEP_MESSAGES,
        selfIndicatedSteps: WORKSPACES_SELF_INDICATED,
    },
    {
        id: 'bfi',
        name: 'BFI',
        companyName: 'BFI',
        description: 'Agency Fee AI · CoNY receiving workflow',
        icon: '🏛️',
        steps: BFI_STEPS,
        stepBehavior: BFI_STEP_BEHAVIOR,
        stepMessages: BFI_STEP_MESSAGES,
        selfIndicatedSteps: BFI_SELF_INDICATED,
    },
    {
        id: 'leland',
        name: 'Leland',
        companyName: 'Leland',
        description: 'Purchase order pipeline · materials review · exception handling',
        icon: '🪑',
        steps: LELAND_STEPS,
        stepBehavior: LELAND_STEP_BEHAVIOR,
        stepMessages: LELAND_STEP_MESSAGES,
        selfIndicatedSteps: LELAND_SELF_INDICATED,
    },
    {
        id: 'mbi',
        name: 'MBI',
        companyName: 'MBI',
        description: 'Modern Business Interiors · Budget Builder prototype + Accounting/Quotes/Design AI',
        icon: '🏢',
        steps: MBI_STEPS,
        stepBehavior: MBI_STEP_BEHAVIOR,
        stepMessages: MBI_STEP_MESSAGES,
        selfIndicatedSteps: MBI_SELF_INDICATED,
    },
    {
        id: 'wrg',
        name: 'WRG',
        companyName: 'WRG',
        description: 'Quoting lifecycle — intake to client proposal',
        icon: '🔧',
        steps: WRG_DEMO_STEPS,
        stepBehavior: WRG_DEMO_STEP_BEHAVIOR,
        stepMessages: WRG_DEMO_STEP_MESSAGES,
        selfIndicatedSteps: WRG_DEMO_SELF_INDICATED,
    },
    {
        id: 'continua',
        name: 'Continua',
        companyName: 'Continua',
        description: 'Project lifecycle, inventory intelligence & sustainability',
        icon: '🏗️',
        steps: CONTINUA_DEMO_STEPS,
        stepBehavior: CONTINUA_DEMO_STEP_BEHAVIOR,
        stepMessages: CONTINUA_DEMO_STEP_MESSAGES,
        selfIndicatedSteps: CONTINUA_DEMO_SELF_INDICATED,
    },
    {
        id: 'dupler',
        name: 'Dupler',
        companyName: 'Dupler',
        description: 'PDF→SIF, Warehouse & Transit, Unified Reporting',
        icon: '🏢',
        steps: DUPLER_STEPS,
        stepBehavior: DUPLER_STEP_BEHAVIOR,
        stepMessages: DUPLER_STEP_MESSAGES,
        selfIndicatedSteps: DUPLER_SELF_INDICATED,
    },
    {
        id: 'ops',
        name: 'OPS Demo (Demo 2)',
        companyName: 'Apex Furniture',
        description: 'Receiving, invoicing & financial control',
        icon: '📦',
        steps: OPS_DEMO_STEPS,
        stepBehavior: OPS_DEMO_STEP_BEHAVIOR,
        stepMessages: OPS_DEMO_STEP_MESSAGES,
        selfIndicatedSteps: OPS_DEMO_SELF_INDICATED,
    },
    {
        id: 'coi',
        name: 'COI',
        companyName: 'COI',
        description: 'Contract office interiors',
        icon: '🏗️',
        steps: COI_DEMO_STEPS,
        stepBehavior: COI_DEMO_STEP_BEHAVIOR,
        stepMessages: COI_DEMO_STEP_MESSAGES,
        selfIndicatedSteps: COI_DEMO_SELF_INDICATED,
    },
    {
        id: 'acme',
        name: 'Acme Corp',
        companyName: 'Acme Corp',
        description: 'Furniture dealer experience',
        icon: '🪑',
        steps: COI_STEPS,
        stepBehavior: COI_STEP_BEHAVIOR,
        stepMessages: COI_STEP_MESSAGES,
        selfIndicatedSteps: COI_SELF_INDICATED,
    },
];
