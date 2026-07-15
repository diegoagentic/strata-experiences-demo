// ═══════════════════════════════════════════════════════════════════════════════
// MBI — Module Phases (Apr 23 modular pricing structure)
//
// Matt's Apr 23 ask: each AI module presented as a header with its own
// Phase 1-4 breakdown, so MBI can "unitize" the solution and Avanto can
// price by module-phase. This is the per-module roadmap, NOT the global
// Avanto Phase 1-5 roadmap (which spans all modules).
//
// One row per (module, modulePhase). 4 phases per module, 4 modules = 16 rows.
//
// SOURCE: MBI_SOURCE_OF_TRUTH.md Section 5 + Notion AI Assessment per-module
// AS-IS docs.
// ═══════════════════════════════════════════════════════════════════════════════

import type { PainModule } from './painPoints';

export type ModulePhaseNumber = 1 | 2 | 3 | 4;

export interface ModulePhase {
    module: PainModule;
    phase: ModulePhaseNumber;
    title: string;
    summary: string;
    deliverables: string[];   // 3-5 concrete items per phase
    estimatedDuration: string; // e.g. "4-6 weeks"
    isPilot?: boolean;         // The phase that ships the named pilot user (Kathy/Beth)
}

export const MBI_MODULE_PHASES: ModulePhase[] = [
    // ═══ ACCOUNTING AI ═══════════════════════════════════════════════════════
    {
        module: 'accounting',
        phase: 1,
        title: 'Foundation',
        summary: 'Data access + process documentation before any AI ships.',
        deliverables: [
            'CORE API access + voucher schema mapping',
            'AP/AR process documented (Kathy session)',
            'Vendor bill template inventory (top 30 manufacturers)',
            'HealthTrust GPO contract logic captured',
        ],
        estimatedDuration: '3-4 weeks',
    },
    {
        module: 'accounting',
        phase: 2,
        title: 'AP Automation (Pilot)',
        summary: 'Kathy stops typing bills. Document AI + non-EDI recon ship.',
        deliverables: [
            'Document AI bill ingestion → CORE pre-fill',
            'Non-EDI line-by-line reconciliation agent',
            'Installer bill vs PO reconciliation agent (Teams workflow)',
            'Exception-only review queue for Kathy',
            'Freight & tariff missing-line flagging when exceeding the agreed threshold',
        ],
        estimatedDuration: '5-7 weeks',
        isPilot: true,
    },
    {
        module: 'accounting',
        phase: 3,
        title: 'AR + Exception Agents',
        summary: 'Healthcare royalties, aging alerts, AI-drafted collections.',
        deliverables: [
            'HealthTrust 3% rebate auto-flag + escalation',
            'AR aging alerts + status taxonomy dashboard',
            'AI-augmented AR emails · auto-send for standard terms · AI drafts for escalations',
        ],
        estimatedDuration: '4-5 weeks',
    },
    {
        module: 'accounting',
        phase: 4,
        title: 'Forecast + Dashboards',
        summary: 'Real-time billing forecast replaces the bi-weekly Excel.',
        deliverables: [
            'Live billing forecast dashboard (90%+ accuracy target)',
            'Backup-protocol playbook for Controller bus-factor',
            'Cross-team KPI dashboards (Jordan + Mark visibility)',
            'AP/AR audit trail with full lineage',
        ],
        estimatedDuration: '3-4 weeks',
    },

    // ═══ BUDGET BUILDER ══════════════════════════════════════════════════════
    {
        module: 'budget',
        phase: 1,
        title: 'Foundation',
        summary: 'Pricing reference, typicals library, scenario rules captured.',
        deliverables: [
            'Pricing reference DB (manufacturer + contract + escalation buffer)',
            'Typicals library by space type (corp/healthcare/edu/gov)',
            'Discount/markup rules documented (Amanda + Justin session)',
            'Substitution rules for Good/Better/Best swap logic',
        ],
        estimatedDuration: '4-5 weeks',
    },
    {
        module: 'budget',
        phase: 2,
        title: 'Intake + Parsing',
        summary: 'Two paths: SIF/CAP design-assisted, or salesperson Quick Budget.',
        deliverables: [
            'Budget Request Form (CET, CAP, template, substitution rules) — to validate',
            'CET export → CORE direct import · contract pricing + markup applied automatically',
            'Quick Budget form for salesperson-only path',
            'Pre-flight validation chain (5 checks)',
        ],
        estimatedDuration: '5-6 weeks',
    },
    {
        module: 'budget',
        phase: 3,
        title: 'AI Generation (Hero)',
        summary: 'Good/Better/Best scenarios + the $18K error-class catch.',
        deliverables: [
            'Good/Better/Best automatic scenario generation',
            'AI validation agent ($18K-class qty/price prevention)',
            'Markup slider with live recalc per scenario',
            'Side-by-side scenario comparison + tier swap',
        ],
        estimatedDuration: '6-8 weeks',
    },
    {
        module: 'budget',
        phase: 4,
        title: 'Output + Handoff',
        summary: 'Branded client deliverable + clean handoff to Quotes.',
        deliverables: [
            'LLM-generated branded MBI client summary (PDF + Excel)',
            'Versioned SharePoint deliverable',
            'Approval gate + audit trail',
            'Automated handoff package to Quotes AI (Phase 4 module)',
        ],
        estimatedDuration: '3-4 weeks',
    },

    // ═══ QUOTES AI ═══════════════════════════════════════════════════════════
    {
        module: 'quotes',
        phase: 1,
        title: 'Foundation',
        summary: 'Vendor fix + storage migration + handoff criteria.',
        deliverables: [
            'CET pricing export fix (vendor coordination — critical prereq)',
            'iDrive → SharePoint/OneDrive migration',
            'Quote readiness handoff checklist (budget · contract · scope)',
            'PC team intake standardization',
        ],
        estimatedDuration: '4-6 weeks',
    },
    {
        module: 'quotes',
        phase: 2,
        title: 'Auto-Import',
        summary: 'SIF → CORE without retyping. Freight & tariff flagged.',
        deliverables: [
            'SIF/BOM → CORE auto-import (largest manual step eliminated)',
            'Freight & tariff agent (EDI + non-EDI flagging)',
            'AI proposal draft from SIF + customer + shipping context',
            'EDI transmission for HNI/Allsteel/Gunlocke/HON/Kimball',
        ],
        estimatedDuration: '6-7 weeks',
    },
    {
        module: 'quotes',
        phase: 3,
        title: 'Validation Layer',
        summary: 'Quote validation + non-catalog pricing collapses 4 audit loops to 1.',
        deliverables: [
            'Quote Validation Engine (duplicates · non-catalog pricing · qty · SKU)',
            'Non-Catalog Item Validator (covers 80-90% of specs)',
            'Audit loop collapse: 4 → 1 AI + 1 human review',
        ],
        estimatedDuration: '6-8 weeks',
    },
    {
        module: 'quotes',
        phase: 4,
        title: 'Reconciliation + Closure',
        summary: 'Complete proposal automation · EDI + non-EDI routing.',
        deliverables: [
            'Non-EDI PO agent (email generation for non-EDI vendors)',
            'Teams spec check bot (M365-native)',
            'PC role shift from builder → reviewer',
            'End-to-end audit trail + handoff to Account Manager',
        ],
        estimatedDuration: '4-5 weeks',
    },

    // ═══ DESIGN AI ═══════════════════════════════════════════════════════════
    {
        module: 'design',
        phase: 1,
        title: 'Foundation',
        summary: 'Storage, version control, file discoverability.',
        deliverables: [
            'CET pricing export fix (shared with Quotes prereq)',
            'iDrive → SharePoint migration (remote designers gain access)',
            'Auto Project Numbering + normalized client index',
            'Version control on CET / CAP / Budget files',
        ],
        estimatedDuration: '4-6 weeks',
    },
    {
        module: 'design',
        phase: 2,
        title: 'Spec Check Pilot (Beth)',
        summary: "Q10 #1 priority shipped — Beth's 8/10 trust unlocks the team.",
        deliverables: [
            'Spec Check Engine v1 (BOM-only, 4 check types)',
            'Beth Gianino early-adopter pilot (1 ICU project)',
            'Severity ranking + CET cross-reference',
            'Findings review UI with accept/override/reject',
        ],
        estimatedDuration: '5-6 weeks',
        isPilot: true,
    },
    {
        module: 'design',
        phase: 3,
        title: 'Adoption Layer',
        summary: 'Live budget visibility + CET assistance during design.',
        deliverables: [
            'CET Config Assistant (chat-style helper)',
            'Live Budget Tracker (vs-actual during design)',
            'Client-facing discount auto-fill (rules-driven)',
            'Designer Capacity Board (Lisa + 3 hybrids)',
        ],
        estimatedDuration: '5-6 weeks',
    },
    {
        module: 'design',
        phase: 4,
        title: 'Team Rollout',
        summary: 'M365-native bots + the 3.3/10 trust majority onboarded 1:1.',
        deliverables: [
            'Teams Spec Check bot (M365 workflow)',
            'Handoff checklist bot (Design → Budget / Quotes)',
            '1:1 onboarding sessions for low-trust designers (Carrie, etc.)',
            'Folder template tree + project search',
        ],
        estimatedDuration: '4-5 weeks',
    },
];

// ─── Selectors ──────────────────────────────────────────────────────────────

export function getPhasesForModule(module: PainModule): ModulePhase[] {
    return MBI_MODULE_PHASES.filter(p => p.module === module).sort((a, b) => a.phase - b.phase);
}

export const MODULE_PHASES_BY_MODULE: Record<PainModule, ModulePhase[]> = {
    accounting: getPhasesForModule('accounting'),
    budget: getPhasesForModule('budget'),
    quotes: getPhasesForModule('quotes'),
    design: getPhasesForModule('design'),
};
