/**
 * Designer profiles for the ~30 Officeworks design team members.
 * Names match those in CapacityHeatmap.tsx exactly.
 * Used by:
 *   - OfficeworksDashboardScene (charts + click-to-detail)
 *   - DesignerDetailModal (per-designer drill-in)
 *   - IntakeAssignPanel (assignment dropdown)
 */

export type Seniority = 'Lead' | 'Senior' | 'Mid' | 'Junior'
export type Region = 'dc' | 'ma' | 'pa'

export interface ActiveProject {
    code: string
    client: string
    value: number
    stage: 'Intake' | 'Design' | 'Spec Check' | 'Submission' | 'Acknowledgment'
    progress: number  // 0-100
    /**
     * Committed hours this week for this project · participates in the SUMIF on
     * Form Responses 1 (column O = designer, column P = hours). Optional so the
     * fallback in computeCapacity() can derive committed hours from utilization
     * for designers without per-project hour entries yet.
     */
    weeklyHours?: number
}

/** Obligation that reduces a designer's available hours (PTO, training, lead 1:1s, etc.) */
export interface Obligation {
    label: string
    hoursPerWeek: number
}

export interface DesignerProfile {
    name: string
    region: Region
    seniority: Seniority
    yearsAtOW: number
    /**
     * Stored utilization · drives chip color + sort order. May differ from
     * computeCapacity(...).utilization by ±2% when project hours don't divide
     * exactly into the available bucket — the breakdown is the source of truth
     * for the math display.
     */
    utilization: number
    /** Standard hours per week before obligations. Defaults to 40 in computeCapacity. */
    availableHoursPerWeek?: number
    /** PTO / training / lead time / etc — subtracted from availableHoursPerWeek. */
    obligations?: Obligation[]
    projects: {
        active: ActiveProject[]
        completedYTD: number
        largeProjects: number   // >$500K
        mediumProjects: number  // $50K–$500K
        smallProjects: number   // <$50K
        totalValueYTD: number
    }
    areas: string[]  // categories/markets
    kpis: {
        avgCycleTime: number          // weeks
        errorRate: number             // % · industry benchmark 0.025%
        revisionsPerProject: number
        peerReviewsCompletedYTD: number
    }
    priorMANATT?: boolean
    isLead?: boolean
}

/** Capacity breakdown as the stakeholder's spreadsheet describes it. */
export interface CapacityBreakdown {
    standardHours: number      // 40 default
    obligations: Obligation[]
    obligationHours: number    // sum
    availableHours: number     // max(0, standardHours − obligationHours)
    projectHours: number       // Σ active.weeklyHours
    committedHours: number     // = projectHours, or fallback to stored utilization
    freeHours: number          // max(0, availableHours − committedHours)
    utilization: number        // round(committed / available × 100)
}

/**
 * Reproduce the stakeholder's spreadsheet formula:
 *   Utilization % = Committed Hours ÷ Available Hours
 *   Committed   = =SUMIF('Form Responses 1'!O:O, designer, 'Form Responses 1'!P:P)
 *   Available   = standard hours per week − PTO / training / other obligations
 *
 * Fallback: when a profile has no per-project hours yet (active: [] or no
 * weeklyHours), derive committed from the stored utilization so the displayed
 * numbers stay consistent with chip colors and sort order.
 */
export function computeCapacity(profile: DesignerProfile): CapacityBreakdown {
    const standardHours = profile.availableHoursPerWeek ?? 40
    const obligations = profile.obligations ?? []
    const obligationHours = obligations.reduce((s, o) => s + o.hoursPerWeek, 0)
    const availableHours = Math.max(0, standardHours - obligationHours)
    const projectHours = profile.projects.active.reduce((s, p) => s + (p.weeklyHours ?? 0), 0)
    const committedHours = projectHours > 0
        ? projectHours
        : Math.round((profile.utilization / 100) * availableHours)
    const freeHours = Math.max(0, availableHours - committedHours)
    const utilization = availableHours > 0
        ? Math.round((committedHours / availableHours) * 100)
        : 0
    return {
        standardHours, obligations, obligationHours,
        availableHours, projectHours, committedHours, freeHours, utilization,
    }
}

const REGION_LABEL: Record<Region, string> = {
    dc: 'DC + Southern',
    ma: 'MA / NY / NJ',
    pa: 'PA / Pittsburgh / Ancillary',
}

export function regionLabel(r: Region): string {
    return REGION_LABEL[r]
}

const SENIORITY_COLOR: Record<Seniority, string> = {
    Lead:   'bg-primary/10 text-primary border-primary/30',
    Senior: 'bg-success/10 text-success border-success/30',
    Mid:    'bg-info/10 text-info border-info/30',
    Junior: 'bg-muted text-muted-foreground border-border',
}

export function seniorityClass(s: Seniority): string {
    return SENIORITY_COLOR[s]
}

export const DESIGNER_PROFILES: DesignerProfile[] = [
    // ── DC + Southern (Felicia's region · 10 designers) ──
    {
        name: 'Felicia Miano-Poles', region: 'dc', seniority: 'Lead', yearsAtOW: 25, utilization: 95, isLead: true, priorMANATT: true,
        availableHoursPerWeek: 40,
        obligations: [{ label: 'Lead 1:1s + reviews', hoursPerWeek: 2 }],
        projects: { active: [
            { code: 'NYC-DOH-2847', client: 'NYC Dept. of Health', value: 148200, stage: 'Intake', progress: 5,   weeklyHours: 6 },
            { code: 'GSA-DC-1102',  client: 'GSA · DC2 expansion', value: 642000, stage: 'Spec Check', progress: 65, weeklyHours: 30 },
        ], completedYTD: 28, largeProjects: 6, mediumProjects: 14, smallProjects: 8, totalValueYTD: 8_400_000 },
        areas: ['DC', 'GSA', 'Government', 'Healthcare', 'Higher Ed'],
        kpis: { avgCycleTime: 3.2, errorRate: 0.012, revisionsPerProject: 2.1, peerReviewsCompletedYTD: 54 },
    },
    {
        name: 'Sandra Park', region: 'dc', seniority: 'Senior', yearsAtOW: 9, utilization: 72,
        availableHoursPerWeek: 40,
        projects: { active: [
            { code: 'GSA-DC2-0892',  client: 'GSA · DC2', value: 76500, stage: 'Submission', progress: 88, weeklyHours: 10 },
            { code: 'NYC-DCAS-1182', client: 'NYC DCAS', value: 127400, stage: 'Design',     progress: 35, weeklyHours: 19 },
        ], completedYTD: 19, largeProjects: 2, mediumProjects: 10, smallProjects: 7, totalValueYTD: 3_200_000 },
        areas: ['DC', 'Federal', 'GSA'],
        kpis: { avgCycleTime: 3.6, errorRate: 0.018, revisionsPerProject: 2.4, peerReviewsCompletedYTD: 32 },
    },
    {
        name: 'James O\'Brien', region: 'dc', seniority: 'Senior', yearsAtOW: 7, utilization: 88,
        availableHoursPerWeek: 40,
        projects: { active: [
            { code: 'JPM-ATL-4471', client: 'JPMorgan · Atlanta HQ', value: 892400, stage: 'Spec Check', progress: 70, weeklyHours: 35 },
        ], completedYTD: 15, largeProjects: 4, mediumProjects: 8, smallProjects: 3, totalValueYTD: 5_800_000 },
        areas: ['DC', 'Atlanta', 'Financial Services'],
        kpis: { avgCycleTime: 4.1, errorRate: 0.020, revisionsPerProject: 2.6, peerReviewsCompletedYTD: 28 },
    },
    {
        name: 'Maya Patel', region: 'dc', seniority: 'Mid', yearsAtOW: 4, utilization: 45, priorMANATT: true,
        availableHoursPerWeek: 40,
        projects: { active: [
            { code: 'AMD-DC-3320', client: 'American Diabetes Assoc.', value: 38500, stage: 'Design', progress: 50, weeklyHours: 18 },
        ], completedYTD: 22, largeProjects: 1, mediumProjects: 8, smallProjects: 13, totalValueYTD: 1_400_000 },
        areas: ['DC', 'Nonprofit', 'Healthcare'],
        kpis: { avgCycleTime: 3.4, errorRate: 0.015, revisionsPerProject: 2.2, peerReviewsCompletedYTD: 18 },
    },
    {
        name: 'Tom Hartford', region: 'dc', seniority: 'Mid', yearsAtOW: 5, utilization: 67,
        projects: { active: [] }, completedYTD: 17, largeProjects: 1, mediumProjects: 9, smallProjects: 7, totalValueYTD: 2_100_000,
        areas: ['DC', 'Government', 'Healthcare'],
        kpis: { avgCycleTime: 3.8, errorRate: 0.022, revisionsPerProject: 2.8, peerReviewsCompletedYTD: 21 },
    } as DesignerProfile,
    {
        name: 'Lisa Cheng', region: 'dc', seniority: 'Senior', yearsAtOW: 8, utilization: 82,
        projects: { active: [] }, completedYTD: 21, largeProjects: 3, mediumProjects: 12, smallProjects: 6, totalValueYTD: 4_700_000,
        areas: ['DC', 'Atlanta', 'Corporate', 'Life Sciences'],
        kpis: { avgCycleTime: 3.5, errorRate: 0.014, revisionsPerProject: 2.0, peerReviewsCompletedYTD: 34 },
    } as DesignerProfile,
    {
        name: 'David Ruiz', region: 'dc', seniority: 'Mid', yearsAtOW: 3, utilization: 59,
        projects: { active: [] }, completedYTD: 14, largeProjects: 0, mediumProjects: 6, smallProjects: 8, totalValueYTD: 980_000,
        areas: ['Charlotte', 'Nashville', 'Corporate'],
        kpis: { avgCycleTime: 3.9, errorRate: 0.024, revisionsPerProject: 3.0, peerReviewsCompletedYTD: 16 },
    } as DesignerProfile,
    {
        name: 'Ana Sokolov', region: 'dc', seniority: 'Senior', yearsAtOW: 11, utilization: 91,
        projects: { active: [] }, completedYTD: 24, largeProjects: 5, mediumProjects: 13, smallProjects: 6, totalValueYTD: 7_100_000,
        areas: ['DC', 'GSA', 'Government', 'Higher Ed'],
        kpis: { avgCycleTime: 3.1, errorRate: 0.011, revisionsPerProject: 1.9, peerReviewsCompletedYTD: 42 },
    } as DesignerProfile,
    {
        name: 'Mike Davis', region: 'dc', seniority: 'Junior', yearsAtOW: 2, utilization: 38,
        projects: { active: [] }, completedYTD: 9, largeProjects: 0, mediumProjects: 3, smallProjects: 6, totalValueYTD: 420_000,
        areas: ['Charlotte', 'Corporate'],
        kpis: { avgCycleTime: 4.5, errorRate: 0.028, revisionsPerProject: 3.4, peerReviewsCompletedYTD: 8 },
    } as DesignerProfile,
    {
        name: 'Priya Iyer', region: 'dc', seniority: 'Mid', yearsAtOW: 4, utilization: 75,
        projects: { active: [] }, completedYTD: 18, largeProjects: 1, mediumProjects: 9, smallProjects: 8, totalValueYTD: 2_300_000,
        areas: ['DC', 'Healthcare', 'Life Sciences'],
        kpis: { avgCycleTime: 3.7, errorRate: 0.019, revisionsPerProject: 2.5, peerReviewsCompletedYTD: 22 },
    } as DesignerProfile,

    // ── MA / NY / NJ (Rebecca's region · 10 designers) ──
    {
        name: 'Rebecca Warren', region: 'ma', seniority: 'Lead', yearsAtOW: 15, utilization: 89, isLead: true,
        availableHoursPerWeek: 40,
        obligations: [{ label: 'Lead 1:1s + peer reviews', hoursPerWeek: 4 }],
        projects: { active: [
            { code: 'HSBC-HY-9921',  client: 'HSBC · Hudson Yards',   value: 1_240_000, stage: 'Acknowledgment', progress: 95, weeklyHours: 4 },
            { code: 'BNY-NJ-2293',   client: 'BNY Mellon · Jersey C.', value: 720_000,  stage: 'Design',         progress: 60, weeklyHours: 18 },
            { code: 'MIT-LAB-0917',  client: 'MIT · Lab fit-out',     value: 380_000,  stage: 'Spec Check',     progress: 40, weeklyHours: 10 },
        ], completedYTD: 31, largeProjects: 8, mediumProjects: 15, smallProjects: 8, totalValueYTD: 11_200_000 },
        areas: ['NYC', 'NJ', 'Boston', 'Financial Services', 'Corporate', 'LEED'],
        kpis: { avgCycleTime: 3.0, errorRate: 0.009, revisionsPerProject: 1.8, peerReviewsCompletedYTD: 62 },
    },
    {
        name: 'John Chen', region: 'ma', seniority: 'Senior', yearsAtOW: 8, utilization: 64,
        projects: { active: [] }, completedYTD: 20, largeProjects: 2, mediumProjects: 11, smallProjects: 7, totalValueYTD: 3_900_000,
        areas: ['Boston', 'NJ', 'Corporate'],
        kpis: { avgCycleTime: 3.4, errorRate: 0.016, revisionsPerProject: 2.2, peerReviewsCompletedYTD: 30 },
    } as DesignerProfile,
    {
        name: 'Sara Bennett', region: 'ma', seniority: 'Mid', yearsAtOW: 5, utilization: 55,
        projects: { active: [] }, completedYTD: 16, largeProjects: 1, mediumProjects: 8, smallProjects: 7, totalValueYTD: 2_000_000,
        areas: ['Boston', 'Higher Ed', 'Life Sciences'],
        kpis: { avgCycleTime: 3.6, errorRate: 0.018, revisionsPerProject: 2.4, peerReviewsCompletedYTD: 20 },
    } as DesignerProfile,
    {
        name: 'Marco Russo', region: 'ma', seniority: 'Senior', yearsAtOW: 9, utilization: 78,
        projects: { active: [] }, completedYTD: 22, largeProjects: 3, mediumProjects: 12, smallProjects: 7, totalValueYTD: 5_200_000,
        areas: ['NYC', 'NJ', 'Financial Services', 'Corporate'],
        kpis: { avgCycleTime: 3.3, errorRate: 0.013, revisionsPerProject: 2.0, peerReviewsCompletedYTD: 36 },
    } as DesignerProfile,
    {
        name: 'Emily Stone', region: 'ma', seniority: 'Senior', yearsAtOW: 7, utilization: 92,
        projects: { active: [] }, completedYTD: 19, largeProjects: 4, mediumProjects: 10, smallProjects: 5, totalValueYTD: 6_400_000,
        areas: ['NYC', 'LEED', 'WELL', 'Corporate'],
        kpis: { avgCycleTime: 3.2, errorRate: 0.010, revisionsPerProject: 1.9, peerReviewsCompletedYTD: 38 },
    } as DesignerProfile,
    {
        name: 'Raj Kumar', region: 'ma', seniority: 'Junior', yearsAtOW: 2, utilization: 41,
        projects: { active: [] }, completedYTD: 11, largeProjects: 0, mediumProjects: 4, smallProjects: 7, totalValueYTD: 580_000,
        areas: ['NJ', 'Corporate'],
        kpis: { avgCycleTime: 4.2, errorRate: 0.026, revisionsPerProject: 3.2, peerReviewsCompletedYTD: 10 },
    } as DesignerProfile,
    {
        name: 'Hannah Liu', region: 'ma', seniority: 'Mid', yearsAtOW: 4, utilization: 70,
        projects: { active: [] }, completedYTD: 17, largeProjects: 1, mediumProjects: 8, smallProjects: 8, totalValueYTD: 1_900_000,
        areas: ['Boston', 'Healthcare', 'Life Sciences'],
        kpis: { avgCycleTime: 3.5, errorRate: 0.017, revisionsPerProject: 2.3, peerReviewsCompletedYTD: 23 },
    } as DesignerProfile,
    {
        name: 'Pete Falco', region: 'ma', seniority: 'Senior', yearsAtOW: 10, utilization: 83,
        projects: { active: [] }, completedYTD: 23, largeProjects: 4, mediumProjects: 13, smallProjects: 6, totalValueYTD: 6_100_000,
        areas: ['NYC', 'NJ', 'Financial Services'],
        kpis: { avgCycleTime: 3.2, errorRate: 0.012, revisionsPerProject: 2.0, peerReviewsCompletedYTD: 35 },
    } as DesignerProfile,
    {
        name: 'Nora Singh', region: 'ma', seniority: 'Mid', yearsAtOW: 3, utilization: 49,
        projects: { active: [] }, completedYTD: 13, largeProjects: 0, mediumProjects: 6, smallProjects: 7, totalValueYTD: 920_000,
        areas: ['NJ', 'Corporate'],
        kpis: { avgCycleTime: 3.8, errorRate: 0.022, revisionsPerProject: 2.7, peerReviewsCompletedYTD: 15 },
    } as DesignerProfile,
    {
        name: 'Devin Hayes', region: 'ma', seniority: 'Mid', yearsAtOW: 4, utilization: 66,
        projects: { active: [] }, completedYTD: 17, largeProjects: 1, mediumProjects: 9, smallProjects: 7, totalValueYTD: 2_100_000,
        areas: ['Boston', 'Higher Ed'],
        kpis: { avgCycleTime: 3.5, errorRate: 0.018, revisionsPerProject: 2.4, peerReviewsCompletedYTD: 22 },
    } as DesignerProfile,

    // ── PA + Pittsburgh + Ancillary (Kimberly's region · 10 designers) ──
    {
        name: 'Kimberly Tucker', region: 'pa', seniority: 'Lead', yearsAtOW: 12, utilization: 45, isLead: true, priorMANATT: true,
        availableHoursPerWeek: 40,
        projects: { active: [
            { code: 'PHI-LAW-2204', client: 'Philly Law Firm', value: 286000, stage: 'Design',     progress: 40, weeklyHours: 14 },
            { code: 'CMU-ANC-0118', client: 'CMU Ancillary',  value: 92500,  stage: 'Submission', progress: 85, weeklyHours: 4 },
        ], completedYTD: 26, largeProjects: 5, mediumProjects: 14, smallProjects: 7, totalValueYTD: 7_800_000 },
        areas: ['Philly', 'Pittsburgh', 'Ancillary', 'Higher Ed', 'Corporate'],
        kpis: { avgCycleTime: 3.1, errorRate: 0.011, revisionsPerProject: 1.9, peerReviewsCompletedYTD: 48 },
    },
    {
        name: 'Olivia Berg', region: 'pa', seniority: 'Senior', yearsAtOW: 6, utilization: 71,
        projects: { active: [] }, completedYTD: 19, largeProjects: 2, mediumProjects: 10, smallProjects: 7, totalValueYTD: 3_600_000,
        areas: ['Philly', 'Corporate'],
        kpis: { avgCycleTime: 3.4, errorRate: 0.015, revisionsPerProject: 2.1, peerReviewsCompletedYTD: 27 },
    } as DesignerProfile,
    {
        name: 'Connor Walsh', region: 'pa', seniority: 'Senior', yearsAtOW: 8, utilization: 84,
        projects: { active: [] }, completedYTD: 22, largeProjects: 3, mediumProjects: 12, smallProjects: 7, totalValueYTD: 5_400_000,
        areas: ['Pittsburgh', 'Healthcare', 'Higher Ed'],
        kpis: { avgCycleTime: 3.3, errorRate: 0.013, revisionsPerProject: 2.0, peerReviewsCompletedYTD: 33 },
    } as DesignerProfile,
    {
        name: 'Yasmin El-Sayed', region: 'pa', seniority: 'Mid', yearsAtOW: 3, utilization: 47,
        projects: { active: [] }, completedYTD: 14, largeProjects: 0, mediumProjects: 7, smallProjects: 7, totalValueYTD: 1_200_000,
        areas: ['Philly', 'Ancillary'],
        kpis: { avgCycleTime: 3.7, errorRate: 0.020, revisionsPerProject: 2.5, peerReviewsCompletedYTD: 18 },
    } as DesignerProfile,
    {
        name: 'Tyler Brooks', region: 'pa', seniority: 'Senior', yearsAtOW: 9, utilization: 90,
        projects: { active: [] }, completedYTD: 24, largeProjects: 4, mediumProjects: 13, smallProjects: 7, totalValueYTD: 6_200_000,
        areas: ['Pittsburgh', 'Corporate', 'Financial Services'],
        kpis: { avgCycleTime: 3.2, errorRate: 0.012, revisionsPerProject: 1.9, peerReviewsCompletedYTD: 37 },
    } as DesignerProfile,
    {
        name: 'Grace Park', region: 'pa', seniority: 'Mid', yearsAtOW: 4, utilization: 58,
        projects: { active: [] }, completedYTD: 16, largeProjects: 1, mediumProjects: 8, smallProjects: 7, totalValueYTD: 1_800_000,
        areas: ['Philly', 'Higher Ed'],
        kpis: { avgCycleTime: 3.6, errorRate: 0.017, revisionsPerProject: 2.3, peerReviewsCompletedYTD: 21 },
    } as DesignerProfile,
    {
        name: 'Eli Johnson', region: 'pa', seniority: 'Mid', yearsAtOW: 5, utilization: 76,
        projects: { active: [] }, completedYTD: 18, largeProjects: 2, mediumProjects: 9, smallProjects: 7, totalValueYTD: 3_100_000,
        areas: ['Pittsburgh', 'Corporate'],
        kpis: { avgCycleTime: 3.4, errorRate: 0.016, revisionsPerProject: 2.2, peerReviewsCompletedYTD: 25 },
    } as DesignerProfile,
    {
        name: 'Megan Reed', region: 'pa', seniority: 'Junior', yearsAtOW: 2, utilization: 39,
        projects: { active: [] }, completedYTD: 10, largeProjects: 0, mediumProjects: 3, smallProjects: 7, totalValueYTD: 510_000,
        areas: ['Philly', 'Ancillary'],
        kpis: { avgCycleTime: 4.3, errorRate: 0.027, revisionsPerProject: 3.3, peerReviewsCompletedYTD: 9 },
    } as DesignerProfile,
    {
        name: 'Vincent Lo', region: 'pa', seniority: 'Mid', yearsAtOW: 4, utilization: 68,
        projects: { active: [] }, completedYTD: 17, largeProjects: 1, mediumProjects: 9, smallProjects: 7, totalValueYTD: 2_400_000,
        areas: ['Philly', 'Healthcare'],
        kpis: { avgCycleTime: 3.5, errorRate: 0.018, revisionsPerProject: 2.3, peerReviewsCompletedYTD: 22 },
    } as DesignerProfile,
    {
        name: 'Sofia Marini', region: 'pa', seniority: 'Senior', yearsAtOW: 7, utilization: 87,
        projects: { active: [] }, completedYTD: 21, largeProjects: 3, mediumProjects: 11, smallProjects: 7, totalValueYTD: 4_900_000,
        areas: ['Pittsburgh', 'Corporate', 'Financial Services'],
        kpis: { avgCycleTime: 3.3, errorRate: 0.013, revisionsPerProject: 2.0, peerReviewsCompletedYTD: 31 },
    } as DesignerProfile,
]

export function findDesigner(name: string): DesignerProfile | undefined {
    return DESIGNER_PROFILES.find(d => d.name === name)
}

/** Aggregate metrics across all designers for Dashboard headline KPIs */
export function aggregateProjectMix() {
    let large = 0, medium = 0, small = 0
    for (const d of DESIGNER_PROFILES) {
        large += d.projects.largeProjects
        medium += d.projects.mediumProjects
        small += d.projects.smallProjects
    }
    return { large, medium, small, total: large + medium + small }
}

/** Project size distribution by region for the stacked bar chart */
export function projectMixByRegion() {
    const result: Record<Region, { large: number; medium: number; small: number }> = {
        dc: { large: 0, medium: 0, small: 0 },
        ma: { large: 0, medium: 0, small: 0 },
        pa: { large: 0, medium: 0, small: 0 },
    }
    for (const d of DESIGNER_PROFILES) {
        result[d.region].large += d.projects.largeProjects
        result[d.region].medium += d.projects.mediumProjects
        result[d.region].small += d.projects.smallProjects
    }
    return result
}

/** Mock 8-week cycle time trend (Dashboard line chart) */
export const CYCLE_TIME_TREND = [
    { week: 'W-7', value: 4.1 },
    { week: 'W-6', value: 3.9 },
    { week: 'W-5', value: 3.7 },
    { week: 'W-4', value: 3.8 },
    { week: 'W-3', value: 3.6 },
    { week: 'W-2', value: 3.5 },
    { week: 'W-1', value: 3.4 },
    { week: 'Now', value: 3.4 },
]

/** Mock 6-month error rate (Dashboard bar chart) */
export const ERROR_RATE_BY_MONTH = [
    { month: 'Dec', value: 0.022, benchmark: 0.025 },
    { month: 'Jan', value: 0.019, benchmark: 0.025 },
    { month: 'Feb', value: 0.021, benchmark: 0.025 },
    { month: 'Mar', value: 0.018, benchmark: 0.025 },
    { month: 'Apr', value: 0.017, benchmark: 0.025 },
    { month: 'May', value: 0.018, benchmark: 0.025 },
]

/** Mock recent activity (Dashboard timeline) */
export const RECENT_ACTIVITY = [
    { when: '2 min ago',  text: 'MANATT 4th Floor · arrived in Intake · awaiting designer assignment',     kind: 'arrive' },
    { when: '14 min ago', text: 'HSBC Hudson Yards · acknowledgment confirmed by Teknion',                 kind: 'success' },
    { when: '1 hr ago',   text: 'JPM Atlanta · spec check started by James O\'Brien',                       kind: 'progress' },
    { when: '2 hr ago',   text: 'GSA DC2 · Sandra Park submitted BOM (PDF + SP4)',                          kind: 'progress' },
    { when: 'Yesterday',  text: 'NYC DOH · peer review completed by Rebecca Warren',                       kind: 'success' },
    { when: '2 days ago', text: 'Philly Law Firm · designer reassigned · Kimberly Tucker (cross-market)',  kind: 'progress' },
    { when: '3 days ago', text: 'CMU Ancillary · acknowledgment discrepancy resolved with Teknion',        kind: 'success' },
]
