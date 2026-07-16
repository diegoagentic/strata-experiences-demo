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
import { CLC_STEPS, CLC_STEP_BEHAVIOR, CLC_STEP_MESSAGES, CLC_SELF_INDICATED } from './profiles/clc';

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
    | 'officeworks-intake' | 'officeworks-design' | 'officeworks-spec-check' | 'officeworks-submission' | 'officeworks-dashboard'
    | 'clc-calendar' | 'clc-sharepoint' | 'clc-intake' | 'clc-dashboard';

export interface DemoStep {
    id: string;
    groupId: number;
    groupTitle: string;
    title: string;
    description: string;
    app: SimulationApp;
    role: 'Expert' | 'System' | 'Dealer' | 'End User' | 'Sales Rep' | 'Facility Manager' | 'Facility User' | 'Designer' | 'Sales Coordinator' | 'Estimator' | 'Project Manager' | 'Operations Manager' | 'AP Coordinator' | 'CFO' | 'CAO' | 'Employee' | 'Account Manager' | 'Receiving Coordinator' | 'Finance / AR' | 'Accountant' | 'BFI Manager' | 'Design Manager' | 'Order Entry' | 'Order Entry Manager' | 'Production Manager' | 'Logistics' | 'AR/AP' | 'Director of Operations' | 'Office Director';
    highlightId?: string;
    /** Optional grouping key for multi-flow profiles (ej. CLC: 'calendar' | 'sharepoint' | 'intake' | 'data-lake'). */
    flowId?: string;
}

export type DemoProfileId = 'acme' | 'coi' | 'dupler' | 'ops' | 'continua' | 'wrg' | 'mbi' | 'leland' | 'bfi' | 'workspaces' | 'officeworks' | 'inbound-outbound' | 'clc';

/** Icon aliases surface as Lucide icons via components/RoleSwitcher.tsx's ICON_MAP. */
export type RoleIcon =
    | 'factory' | 'store' | 'building' | 'user' | 'users' | 'wrench'
    | 'truck' | 'palette' | 'clipboard-check' | 'calculator' | 'sparkles'
    | 'receipt' | 'shield' | 'mail' | 'calendar' | 'folder';

export interface RoleDef {
    /** Stable slug persisted in sessionStorage (${profileId}:role). */
    id: string;
    /** Human label shown in the RoleSwitcher menu + trigger. */
    label: string;
    /** Optional icon alias (see RoleIcon). Falls back to a generic user icon. */
    icon?: RoleIcon;
}

export interface DemoProfile {
    id: DemoProfileId;
    /** Feature-first title shown in the dropdown (ej: "Spec Check & Design Validation").
     *  Does NOT include the client name. */
    title: string;
    /** Cliente + scenes complementarias (ej: "Officeworks · Intake + CET/CAP + Audit").
     *  Optional. Shown below the title in the dropdown. */
    subtitle?: string;
    /** Legacy label kept for compat (some tour components still read it).
     *  New code should use `title`. */
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

    // ─── Role switching (generalized in F3) ──────────────────────────────────
    /** Roles this experience can be "viewed as" (Dealer / Manufacturer / etc). */
    roles?: RoleDef[];
    /** First role rendered before the user picks; falls back to roles[0]. */
    defaultRoleId?: string;
    /** When true, RoleSwitcher renders in the navbar. */
    hasRoleSwitcher?: boolean;

    // ─── Landing modo normal (F5+) ──────────────────────────────────────────
    /**
     * SimulationApp to render when the user opens this experience WITHOUT
     * launching the tour. Same canvas that scene-1 of the tour shows,
     * without spotlight/overlays. Makes the profile self-explanatory
     * before the user hits "Start Demo".
     */
    defaultApp?: SimulationApp;
}

// Order: most recently created demo first (newest at top of Switch Demo dropdown).
// To add a new demo, prepend its entry — do not append.
export const DEMO_PROFILES: DemoProfile[] = [
    {
        id: 'inbound-outbound',
        title: 'Manufacturer Order Entry',
        subtitle: 'Senator pitch · Inbound RFQ / Outbound Ack · Dealer↔Manufacturer',
        name: 'Inbound | Outbound',
        companyName: 'Inbound | Outbound',
        description: 'Manufacturer order entry · inbound RFQ + PO · outbound quote + ack + shipping + invoice · 12 steps · 2 flows',
        icon: '📦',
        experienceLabel: 'Manufacturer Experience',
        steps: INBOUND_OUTBOUND_STEPS,
        stepBehavior: INBOUND_OUTBOUND_STEP_BEHAVIOR,
        stepMessages: INBOUND_OUTBOUND_STEP_MESSAGES,
        selfIndicatedSteps: INBOUND_OUTBOUND_SELF_INDICATED,
        hasRoleSwitcher: true,
        defaultRoleId: 'manufacturer',
        roles: [
            { id: 'manufacturer', label: 'Manufacturer', icon: 'factory' },
            { id: 'dealer',       label: 'Dealer',       icon: 'store' },
        ],
    },
    {
        id: 'clc',
        title: 'Install Scheduling + Data Reconciliation',
        subtitle: 'CLC · Calendar Sync + SharePoint Seeding + Intake Validation + Data Lake',
        name: 'CLC',
        companyName: 'Creative Library Concepts',
        description: 'IQ × Outlook × SharePoint × M365 · install scheduling · asset seeding · intake validation · data lake',
        icon: '📅',
        experienceLabel: 'Operations Experience',
        defaultApp: 'clc-dashboard',
        steps: CLC_STEPS,
        stepBehavior: CLC_STEP_BEHAVIOR,
        stepMessages: CLC_STEP_MESSAGES,
        selfIndicatedSteps: CLC_SELF_INDICATED,
    },
    {
        id: 'officeworks',
        title: 'Spec Check & Design Validation',
        subtitle: 'Officeworks · Intake + CET/CAP + Teknion Preview + Audit',
        name: 'Officeworks',
        companyName: 'Officeworks Inc.',
        description: 'Spec Check & Design AI · Teknion BOM validation · MANATT 4th Floor',
        icon: '📐',
        defaultApp: 'officeworks-dashboard',
        steps: OFFICEWORKS_STEPS,
        stepBehavior: OFFICEWORKS_STEP_BEHAVIOR,
        stepMessages: OFFICEWORKS_STEP_MESSAGES,
        selfIndicatedSteps: OFFICEWORKS_SELF_INDICATED,
    },
    {
        id: 'workspaces',
        title: 'Expense Management End-to-End',
        subtitle: 'Workscapes · Mobile OCR + Approval + GL Sync + CFO Dashboard',
        name: 'Workscapes',
        companyName: 'Workscapes, Inc.',
        description: 'Expense report AI · GL auto-fill · CORE sync · spend dashboard',
        icon: '💰',
        steps: WORKSPACES_STEPS,
        stepBehavior: WORKSPACES_STEP_BEHAVIOR,
        stepMessages: WORKSPACES_STEP_MESSAGES,
        selfIndicatedSteps: WORKSPACES_SELF_INDICATED,
    },
    {
        id: 'bfi',
        title: 'Agency Fee Lifecycle',
        subtitle: 'BFI · Pre-Award + Receiving & Claims + CPR Closing',
        name: 'BFI',
        companyName: 'BFI',
        description: 'Agency Fee AI · CoNY receiving workflow',
        icon: '🏛️',
        defaultApp: 'bfi-dashboard',
        steps: BFI_STEPS,
        stepBehavior: BFI_STEP_BEHAVIOR,
        stepMessages: BFI_STEP_MESSAGES,
        selfIndicatedSteps: BFI_SELF_INDICATED,
    },
    {
        id: 'leland',
        title: 'PO-to-Order Automation',
        subtitle: 'Leland · PO Intake + Quote Match + Price Catch Review',
        name: 'Leland',
        companyName: 'Leland',
        description: 'Purchase order pipeline · materials review · exception handling',
        icon: '🪑',
        defaultApp: 'leland-strata',
        steps: LELAND_STEPS,
        stepBehavior: LELAND_STEP_BEHAVIOR,
        stepMessages: LELAND_STEP_MESSAGES,
        selfIndicatedSteps: LELAND_SELF_INDICATED,
    },
    {
        id: 'mbi',
        title: 'Back-Office AI (AP + AR + Quotes)',
        subtitle: 'MBI · Accounting + Collections + Quotes AI',
        name: 'MBI',
        companyName: 'MBI',
        description: 'Modern Business Interiors · Budget Builder prototype + Accounting/Quotes/Design AI',
        icon: '🏢',
        defaultApp: 'mbi-accounting',
        steps: MBI_STEPS,
        stepBehavior: MBI_STEP_BEHAVIOR,
        stepMessages: MBI_STEP_MESSAGES,
        selfIndicatedSteps: MBI_SELF_INDICATED,
    },
    {
        id: 'wrg',
        title: 'Labor Estimation',
        subtitle: 'WRG · Estimator + Designer Verification + Sales Review + Handoff',
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
        title: 'Project & Inventory Intelligence',
        subtitle: 'Continua · Inventory + FM + Procurement + Sustainability',
        name: 'Continua',
        companyName: 'Continua',
        description: 'Project lifecycle, inventory intelligence & sustainability',
        icon: '🏗️',
        defaultApp: 'inventory',
        steps: CONTINUA_DEMO_STEPS,
        stepBehavior: CONTINUA_DEMO_STEP_BEHAVIOR,
        stepMessages: CONTINUA_DEMO_STEP_MESSAGES,
        selfIndicatedSteps: CONTINUA_DEMO_SELF_INDICATED,
    },
    {
        id: 'dupler',
        title: 'Vendor Data → SIF → Warehouse',
        subtitle: 'Dupler · PDF Extraction + Warehouse & Transit + Reporting',
        name: 'Dupler',
        companyName: 'Dupler',
        description: 'PDF→SIF, Warehouse & Transit, Unified Reporting',
        icon: '📄',
        steps: DUPLER_STEPS,
        stepBehavior: DUPLER_STEP_BEHAVIOR,
        stepMessages: DUPLER_STEP_MESSAGES,
        selfIndicatedSteps: DUPLER_SELF_INDICATED,
    },
    {
        id: 'ops',
        title: 'Receiving → Invoice → QB Sync',
        subtitle: 'Apex Furniture · 3-Way Match + Change Orders + CFO Dashboard',
        name: 'OPS Demo (Demo 2)',
        companyName: 'Apex Furniture',
        description: 'Receiving, invoicing & financial control',
        icon: '📊',
        steps: OPS_DEMO_STEPS,
        stepBehavior: OPS_DEMO_STEP_BEHAVIOR,
        stepMessages: OPS_DEMO_STEP_MESSAGES,
        selfIndicatedSteps: OPS_DEMO_SELF_INDICATED,
    },
    {
        id: 'coi',
        title: 'Email RFQ → PO → Warranty',
        subtitle: 'COI · Email Ingestion + Kanban + Expert Hub + CRM',
        name: 'COI',
        companyName: 'COI',
        description: 'Contract office interiors',
        icon: '📧',
        steps: COI_DEMO_STEPS,
        stepBehavior: COI_DEMO_STEP_BEHAVIOR,
        stepMessages: COI_DEMO_STEP_MESSAGES,
        selfIndicatedSteps: COI_DEMO_SELF_INDICATED,
    },
    {
        id: 'acme',
        title: 'Dealer RFQ → PO',
        subtitle: 'Acme Corp · Furniture dealer flow (COI legacy sin CRM steps)',
        name: 'Acme Corp',
        companyName: 'Acme Corp',
        description: 'Furniture dealer experience',
        icon: '🏭',
        steps: COI_STEPS,
        stepBehavior: COI_STEP_BEHAVIOR,
        stepMessages: COI_STEP_MESSAGES,
        selfIndicatedSteps: COI_SELF_INDICATED,
    },
];
