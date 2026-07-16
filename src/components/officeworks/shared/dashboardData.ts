// ═══════════════════════════════════════════════════════════════════════════════
// Officeworks Dashboard data · Spec Check + Labor & Delivery
//
// Spec Check Dashboard adds (post-4-KPI-cards row) an "SLA risk · At-risk
// projects · Active alerts" section anchored to Enhanced BPMN PP#4 (SC6):
// "SLA breach detection + Dashboard: in-flight, SLA risk, hot-spots".
//
// L&D Dashboard is brand-new · 4 KPI cards core (Active / Bid SLA / Variance /
// GC compliance) + vendor scorecard + RFP intake formats + Building KB
// coverage + Furniture/Walls split. KPIs anchored to Notion L&D painpoints.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── SPEC CHECK DASHBOARD · new "at-risk + alerts" row ───────────────────────

export interface AtRiskProject {
    code: string;
    client: string;
    phase: string;
    daysInPhase: number;
    slaDays: number;
    designer: string;
}

export const SPEC_CHECK_AT_RISK: AtRiskProject[] = [
    { code: 'Metro Legal-4F',     client: 'Metro Legal Firm · DC',  phase: 'Spec Check',       daysInPhase: 4,  slaDays: 5,  designer: 'Kimberly Tucker' },
    { code: 'JPM-ATL-4471',  client: 'JPMorgan · Atlanta HQ',          phase: 'Teknion Preview',  daysInPhase: 11, slaDays: 14, designer: 'James O\'Brien' },
    { code: 'NYC-DOH-2847',  client: 'NYC Dept of Health · Brooklyn',  phase: 'Intake',           daysInPhase: 2,  slaDays: 3,  designer: 'Unassigned' },
    { code: 'GSA-DC2-0892',  client: 'GSA · DC2 (price-protected)',    phase: 'Submission',       daysInPhase: 1,  slaDays: 2,  designer: 'Sandra Park' },
    { code: 'COL-BOS-1208',  client: 'Colonial Boston · 8F',           phase: 'Design',           daysInPhase: 7,  slaDays: 10, designer: 'Marcus Chen' },
];

export type AlertSeverity = 'high' | 'medium' | 'low';
export interface SpecCheckAlert {
    id: number;
    severity: AlertSeverity;
    text: string;
    actionLabel: string;
}

export const SPEC_CHECK_ALERTS: SpecCheckAlert[] = [
    { id: 1, severity: 'high',   text: 'JPM-ATL-4471 · Teknion preview 3 days overdue · escalate to Sr Designer', actionLabel: 'Escalate' },
    { id: 2, severity: 'medium', text: 'NYC-DOH-2847 · designer assignment pending · 22h to SLA breach',          actionLabel: 'Assign now' },
    { id: 3, severity: 'medium', text: 'Metro Legal-4F · spec check nearing SLA (4/5 days) · Strata recommends peer review queue', actionLabel: 'Open audit' },
];

export const SPEC_CHECK_SLA_SUMMARY = {
    atRiskCount: SPEC_CHECK_AT_RISK.length,
    totalInFlight: 28,
    nearestBreachLabel: '22h',
    nearestBreachCode: 'NYC-DOH-2847',
    breachLast30Days: 2,
    breachRate: 7,  // %
} as const;

// ─── L&D DASHBOARD · core 4 KPI cards · per vertical ────────────────────────

export type KPITone = 'success' | 'warning' | 'destructive' | 'neutral';

export interface KPICardData {
    value: number | string;
    label: string;
    sub: string;
    tone: KPITone;
    iconName: 'Briefcase' | 'Clock' | 'Target' | 'CheckCircle2' | 'TrendingUp' | 'Activity';
}

export const LD_KPI_FURNITURE: Record<'activeEstimates' | 'bidSlaCompliance' | 'bidVarianceAvg' | 'gcPortalCompliance', KPICardData> = {
    activeEstimates:    { value: 67,     label: 'Active estimates',      sub: 'across 8 markets · 12 awaiting bids', tone: 'neutral', iconName: 'Briefcase' },
    bidSlaCompliance:   { value: '84%',  label: 'Bid SLA compliance',    sub: '24-48h MSA · last 30 days',           tone: 'warning', iconName: 'Clock' },
    bidVarianceAvg:     { value: '-3%',  label: 'Variance vs benchmark', sub: '1 outlier (Pinnacle +18%)',           tone: 'success', iconName: 'Target' },
    gcPortalCompliance: { value: '96%',  label: 'GC portal on-time',     sub: 'last 30 days · 24 submitted',         tone: 'success', iconName: 'CheckCircle2' },
};

export const LD_KPI_WALLS: typeof LD_KPI_FURNITURE = {
    activeEstimates:    { value: 14,     label: 'Active estimates',      sub: 'across 3 markets · 4 awaiting bids',  tone: 'neutral', iconName: 'Briefcase' },
    bidSlaCompliance:   { value: '93%',  label: 'Bid SLA compliance',    sub: '24-48h MSA · last 30 days',           tone: 'success', iconName: 'Clock' },
    bidVarianceAvg:     { value: '+1%',  label: 'Variance vs benchmark', sub: 'all within 15% threshold',            tone: 'success', iconName: 'Target' },
    gcPortalCompliance: { value: '100%', label: 'GC portal on-time',     sub: 'last 30 days · 6 submitted',          tone: 'success', iconName: 'CheckCircle2' },
};

// ─── L&D charts · 8-week trends ──────────────────────────────────────────────

export const LD_ACTIVE_ESTIMATES_TREND_FURNITURE = [
    { week: 'W-7', value: 58, slaCompliance: 78 },
    { week: 'W-6', value: 61, slaCompliance: 80 },
    { week: 'W-5', value: 64, slaCompliance: 81 },
    { week: 'W-4', value: 70, slaCompliance: 79 },
    { week: 'W-3', value: 72, slaCompliance: 82 },
    { week: 'W-2', value: 69, slaCompliance: 83 },
    { week: 'W-1', value: 65, slaCompliance: 84 },
    { week: 'Now', value: 67, slaCompliance: 84 },
] as const;

export const LD_ACTIVE_ESTIMATES_TREND_WALLS = [
    { week: 'W-7', value: 11, slaCompliance: 90 },
    { week: 'W-6', value: 13, slaCompliance: 91 },
    { week: 'W-5', value: 12, slaCompliance: 92 },
    { week: 'W-4', value: 15, slaCompliance: 91 },
    { week: 'W-3', value: 14, slaCompliance: 92 },
    { week: 'W-2', value: 16, slaCompliance: 93 },
    { week: 'W-1', value: 13, slaCompliance: 92 },
    { week: 'Now', value: 14, slaCompliance: 93 },
] as const;

export const LD_BID_VARIANCE_DISTRIBUTION_FURNITURE = [
    { month: 'Dec', avgVariance: -2, outliers: 1 },
    { month: 'Jan', avgVariance: -1, outliers: 0 },
    { month: 'Feb', avgVariance: -4, outliers: 2 },
    { month: 'Mar', avgVariance: -3, outliers: 1 },
    { month: 'Apr', avgVariance: -5, outliers: 1 },
    { month: 'May', avgVariance: -3, outliers: 1 },
] as const;

export const LD_BID_VARIANCE_DISTRIBUTION_WALLS = [
    { month: 'Dec', avgVariance: 2,  outliers: 0 },
    { month: 'Jan', avgVariance: 1,  outliers: 0 },
    { month: 'Feb', avgVariance: 0,  outliers: 0 },
    { month: 'Mar', avgVariance: 1,  outliers: 0 },
    { month: 'Apr', avgVariance: -1, outliers: 1 },
    { month: 'May', avgVariance: 1,  outliers: 0 },
] as const;

// ─── L&D vendor scorecard summary ────────────────────────────────────────────

export type ScorecardTrend = 'up' | 'down' | 'flat';

export interface VendorScorecardRow {
    name: string;
    market: string;
    onTime: number;
    coRate: number;
    jobs12mo: number;
    trend: ScorecardTrend;
}

export const LD_VENDOR_SCORECARD_FURNITURE: VendorScorecardRow[] = [
    { name: 'TriState Labor Solutions', market: 'DC · NJ · NY', onTime: 96, coRate: 2, jobs12mo: 14, trend: 'up' },
    { name: 'Pinnacle Systems Inc',     market: 'DC · NoVA',    onTime: 92, coRate: 4, jobs12mo: 11, trend: 'flat' },
    { name: 'Northeast Installation Co', market: 'DC · MD',     onTime: 88, coRate: 7, jobs12mo: 8,  trend: 'down' },
];

export const LD_VENDOR_SCORECARD_WALLS: VendorScorecardRow[] = [
    { name: 'Metro Walls Inc',           market: 'NJ · PA',      onTime: 94, coRate: 3, jobs12mo: 9,  trend: 'up' },
    { name: 'Modular Systems Group',     market: 'MA · NJ · PA', onTime: 93, coRate: 4, jobs12mo: 11, trend: 'up' },
    { name: 'Architectural Build Co',    market: 'NJ · NY',      onTime: 91, coRate: 5, jobs12mo: 7,  trend: 'flat' },
];

// ─── L&D RFP intake formats (7 from AS-IS Notion) ───────────────────────────

export interface IntakeFormatRow {
    name: string;
    count: number;
    pct: number;
    tone: 'success' | 'warning' | 'neutral';
}

export const LD_INTAKE_FORMATS: IntakeFormatRow[] = [
    { name: 'Building Connected',     count: 28, pct: 42, tone: 'success' },
    { name: 'Plain email',            count: 18, pct: 27, tone: 'warning' },
    { name: 'GC portal direct',       count: 9,  pct: 13, tone: 'neutral' },
    { name: 'Dropbox / file server',  count: 5,  pct: 8,  tone: 'neutral' },
    { name: 'Gensler-style portal',   count: 4,  pct: 6,  tone: 'warning' },
    { name: 'Spreadsheet only',       count: 2,  pct: 3,  tone: 'warning' },
    { name: 'Zip folder',             count: 1,  pct: 1,  tone: 'warning' },
];

// ─── L&D Building KB coverage (anchored to PP #1 painpoint) ─────────────────

export const LD_BUILDING_KB_COVERAGE = {
    addressesIndexed:   47,
    fullCoverage:       31,   // ≥10 of 12 conditions captured
    partialCoverage:    12,   // 5-9 conditions
    minimalCoverage:    4,    // <5 conditions
    targetAddresses:    60,   // CEO target by EOY 2026
} as const;

// ─── L&D volume split · Furniture vs Walls (80/20) ──────────────────────────

export const LD_VOLUME_SPLIT = {
    furniturePct:       80,
    wallsPct:           20,
    furnitureMonthly:   240,
    wallsMonthly:       60,
    totalMonthly:       300,
    activeSimultaneous: 81,   // 67 + 14
} as const;
