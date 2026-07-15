// ═══════════════════════════════════════════════════════════════════════════════
// MBI — Pain Points (Apr 23 reorganization)
//
// Structured dataset for the 4-AI demo. Each pain point is tagged with:
//   - module           which Strata AI module addresses it (one only)
//   - severity         critical | high | medium  (for priority ordering)
//   - resolvedInPhase  Avanto roadmap phase 1-5 that ships the resolution
//                      (1=Foundation, 2=Accounting Quick Wins, 3=Budget Builder,
//                       4=Quotes/Design AI, 5=Connected Operations)
//   - q10Priority      from the 17-respondent AI Readiness Questionnaire (when applicable)
//
// SOURCE: MBI_SOURCE_OF_TRUTH.md Section 4 + Notion AI Readiness Assessment
// APR 23 STAKEHOLDER NOTE: Matt confirmed CET is NOT an Accounting blocker —
// CET pricing export failure only impacts Quotes/Design AI. Do not list it
// under module:'accounting'.
// ═══════════════════════════════════════════════════════════════════════════════

export type PainModule = 'accounting' | 'budget' | 'quotes' | 'design';
export type PainSeverity = 'critical' | 'high' | 'medium';
export type RoadmapPhase = 1 | 2 | 3 | 4 | 5;

export interface PainPoint {
    id: string;
    title: string;
    module: PainModule;
    severity: PainSeverity;
    resolvedInPhase: RoadmapPhase;
    area: string;          // Stakeholder owner: "Accounting · Kathy", "Sales/BD/Design", etc.
    before: string;        // Current state, owner-tone
    after: string;         // With Strata, owner-tone
    q10Priority?: number;  // 0-10, from Q10 questionnaire
    notes?: string;        // Optional: contextual flag (e.g. "prereq for X")
}

export const MBI_PAIN_POINTS: PainPoint[] = [
    // ═══ ACCOUNTING AI ═══════════════════════════════════════════════════════
    {
        id: 'ap-invoice-manual',
        title: 'AP Bill — Manual upload to CORE',
        module: 'accounting',
        severity: 'high',
        resolvedInPhase: 2,
        area: 'Accounting · Kathy',
        before: '15-30 min per bill, manual for every PDF',
        after: '<5 min · AI extracts fields and pre-fills CORE voucher',
    },
    {
        id: 'non-edi-recon-manual',
        title: 'Non-EDI Reconciliation — Manual line-by-line',
        module: 'accounting',
        severity: 'high',
        resolvedInPhase: 2,
        area: 'Accounting · Kathy',
        before: 'Line-by-line manual comparison PO vs bill',
        after: 'Exception-only review · clean docs auto-reconciled',
    },
    {
        id: 'healthtrust-penny-match',
        title: 'HealthTrust Penny-Match — Manual per healthcare job',
        module: 'accounting',
        severity: 'high',
        resolvedInPhase: 2,
        area: 'Healthcare · Lynda + Kathy',
        before: 'Manual penny-match + 3% rebate calc per Riverside/Lakeside bill',
        after: 'Auto-flagged with 3% rebate pre-calculated; review/approve/escalate',
    },
    {
        id: 'ar-collection-manual',
        title: 'AR Collection Follow-up — Manual, ad-hoc',
        module: 'accounting',
        severity: 'high',
        resolvedInPhase: 2,
        area: 'Accounting · Kathy',
        before: 'Manual aging review + drafted-from-scratch follow-up emails',
        after: 'Auto-aging alerts · standard follow-ups auto-sent per payment terms · AI drafts escalations for review',
    },
    {
        id: 'billing-forecast-excel',
        title: 'Billing Forecast — Bi-weekly static Excel, 75-80% accurate',
        module: 'accounting',
        severity: 'medium',
        resolvedInPhase: 2,
        area: 'Accounting · Kathy',
        before: '8 manual steps, bi-weekly cadence, 75-80% accuracy',
        after: 'Real-time dashboard, 90%+ accuracy, 3 steps',
    },
    {
        id: 'controller-bus-factor',
        title: 'Controller Bus Factor — 1-person department',
        module: 'accounting',
        severity: 'high',
        resolvedInPhase: 2,
        area: 'Accounting · Kathy',
        before: 'Single point of failure · no documented backup protocol',
        after: 'AI-augmented workflow + system-encoded process knowledge',
    },

    // ═══ BUDGET BUILDER ═══════════════════════════════════════════════════════
    {
        id: 'budget-cycle-time',
        title: 'Budget Cycle Time — 1 week vs 24h client expectation',
        module: 'budget',
        severity: 'critical',
        resolvedInPhase: 3,
        area: 'Sales · BD · Design',
        before: '1 week turnaround · deals lost before proposal submitted',
        after: '<24 hours · same-day rough estimates',
    },
    {
        id: 'budget-18k-error-risk',
        title: '$18K Error Risk — Documented quantity mistake',
        module: 'budget',
        severity: 'critical',
        resolvedInPhase: 3,
        area: 'Sales · BD · Mark',
        before: 'Documented $18K error from a single quantity mistake · no validation checkpoint',
        after: 'AI validation prevents the class of errors at parse time (94% confidence catch)',
    },
    {
        id: 'over-engineering-revisions',
        title: 'Over-engineering Culture — 10+ revision rounds',
        module: 'budget',
        severity: 'high',
        resolvedInPhase: 3,
        area: 'Design + Sales',
        before: '10+ scenario revision cycles per opportunity',
        after: 'Good/Better/Best generated upfront · scenarios swap in <30s',
    },
    {
        id: 'pricing-rules-tribal',
        title: 'Pricing/Discount Rules — Tribal knowledge',
        module: 'budget',
        severity: 'high',
        resolvedInPhase: 1,
        area: 'Sales · Amanda + Justin',
        before: "Markup, freight %, install %, contingency live in people's heads",
        after: 'Centralized Pricing DB + rules engine (SharePoint-backed)',
    },
    {
        id: 'manual-excel-to-pdf',
        title: 'Excel → PDF/PPT for client delivery — 100% manual',
        module: 'budget',
        severity: 'medium',
        resolvedInPhase: 3,
        area: 'Sales · Amanda',
        before: 'Manual translation · inconsistent formatting per salesperson',
        after: 'LLM-generated branded MBI client summary · locked template',
    },

    // ═══ QUOTES AI ════════════════════════════════════════════════════════════
    {
        id: 'sif-re-entry',
        title: 'SIF Re-Entry into CORE — Largest manual step in quoting',
        module: 'quotes',
        severity: 'high',
        resolvedInPhase: 4,
        area: 'Project Coordinators · Marcia',
        before: '~2 hours of manual SIF re-entry per quote',
        after: 'Structured auto-import · zero keystrokes',
    },
    {
        id: 'cet-pricing-export-failure',
        title: 'CET Pricing Export Failure — Blocks 4+ AI use cases',
        module: 'quotes',
        severity: 'critical',
        resolvedInPhase: 1,
        area: 'Design + Quotes downstream',
        before: 'Vendor-side export bug · pricing data unreliable',
        after: 'Vendor coordination fix in Phase 1 (prereq for Quotes/Design AI)',
        notes: 'Pre-req for Quotes & Design AI. Does NOT impact Accounting AI (Matt confirmed Apr 23).',
    },
    {
        id: 'pc-bottleneck',
        title: 'PC Bottleneck — 3.5 PCs for 29 staff',
        module: 'quotes',
        severity: 'high',
        resolvedInPhase: 4,
        area: 'PM · Marcia',
        before: '3.5 PCs become builder + reviewer for all 29 staff',
        after: 'PC role shifts from builder → reviewer (AI builds drafts)',
    },
    {
        id: 'freight-tariff-manual',
        title: 'Freight & Tariff — Manual every order',
        module: 'quotes',
        severity: 'high',
        resolvedInPhase: 2,
        area: 'PC + BD + Sales',
        before: '100% manual freight/tariff calculation per CORE order',
        after: 'AI agent flags missing lines exceeding the agreed threshold (EDI + non-EDI)',
        q10Priority: 7.7,
    },
    {
        id: 'audit-loops-x4',
        title: '4 Review Layers — Errors still slip through',
        module: 'quotes',
        severity: 'high',
        resolvedInPhase: 4,
        area: 'Design → Compass → Sales → PC',
        before: '4 sequential audit loops · errors still reach the client',
        after: '1 AI validation + 1 human review (3 loops collapsed)',
    },
    {
        id: 'no-handoff-criteria',
        title: 'No Handoff Criteria — Informal between teams',
        module: 'quotes',
        severity: 'medium',
        resolvedInPhase: 4,
        area: 'Design → PM',
        before: 'Informal handoffs · missing context per project',
        after: 'Enforced Teams checklist (budget · contract · scope · finishes)',
    },

    // ═══ DESIGN AI ════════════════════════════════════════════════════════════
    {
        id: 'spec-check-manual',
        title: 'Spec Check — Manual, ad hoc',
        module: 'design',
        severity: 'critical',
        resolvedInPhase: 4,
        area: 'Design Team',
        before: 'No structured process · tribal knowledge · Teams chat requests',
        after: 'AI report in <5 min · severity ranking · CET cross-reference',
        q10Priority: 9.08,
        notes: 'Q10 #1 priority across the team (9.08/10).',
    },
    {
        id: 'idrive-local-server',
        title: 'iDrive — Local server, remote designers offline',
        module: 'design',
        severity: 'high',
        resolvedInPhase: 1,
        area: 'Design / Remote Teams',
        before: 'iDrive in St. Louis · KC/IA/Topeka designers cannot access',
        after: 'SharePoint/OneDrive migration (Phase 1 prereq)',
    },
    {
        id: 'tribal-knowledge',
        title: 'Tribal Knowledge — Operating manual in heads',
        module: 'design',
        severity: 'high',
        resolvedInPhase: 1,
        area: 'All teams',
        before: 'Process knowledge undocumented · exits with people',
        after: 'Documented + system-encoded · Teams bot interfaces',
    },
    {
        id: 'no-version-control',
        title: 'No Version Control — CET / CAP / Budgets',
        module: 'design',
        severity: 'medium',
        resolvedInPhase: 1,
        area: 'Design',
        before: 'Overwrites lose history · no audit trail',
        after: 'Auto version history + audit trail per file',
    },
    {
        id: 'non-catalog-items-unvalidated',
        title: 'Non-Catalog Items — 80-90% unvalidated',
        module: 'design',
        severity: 'high',
        resolvedInPhase: 4,
        area: 'Design + Quotes',
        before: 'No validation for non-catalog items (most specs)',
        after: 'AI cross-check with Compass + manufacturer rules',
    },
];

// ─── Selectors ──────────────────────────────────────────────────────────────

const SEVERITY_RANK: Record<PainSeverity, number> = { critical: 0, high: 1, medium: 2 };

function bySeverity(a: PainPoint, b: PainPoint): number {
    return SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
}

export function getPainPointsByModule(module: PainModule): PainPoint[] {
    return MBI_PAIN_POINTS.filter(p => p.module === module).sort(bySeverity);
}

export function getPainPointsByPhase(phase: RoadmapPhase): PainPoint[] {
    return MBI_PAIN_POINTS.filter(p => p.resolvedInPhase === phase).sort(bySeverity);
}

export function getCriticalAndHighByModule(module: PainModule): PainPoint[] {
    return MBI_PAIN_POINTS.filter(
        p => p.module === module && (p.severity === 'critical' || p.severity === 'high'),
    ).sort(bySeverity);
}

// Pre-grouped lookup for module headers (Fase C will consume this)
export const PAIN_POINTS_BY_MODULE: Record<PainModule, PainPoint[]> = {
    accounting: getPainPointsByModule('accounting'),
    budget: getPainPointsByModule('budget'),
    quotes: getPainPointsByModule('quotes'),
    design: getPainPointsByModule('design'),
};

// Sanity check exposed for tests / runtime assertion: Accounting must
// not reference CET (Matt confirmed Apr 23 — CET is a Quotes/Design prereq).
export function assertNoCETInAccounting(): void {
    const offenders = PAIN_POINTS_BY_MODULE.accounting.filter(
        p => /\bCET\b/.test(p.title) || /\bCET\b/.test(p.before) || /\bCET\b/.test(p.after),
    );
    if (offenders.length > 0) {
        throw new Error(
            `MBI pain points: Accounting module must not reference CET. Offenders: ${offenders.map(o => o.id).join(', ')}`,
        );
    }
}
