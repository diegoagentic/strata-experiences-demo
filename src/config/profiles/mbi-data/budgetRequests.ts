import type { BudgetRequest, Scenario, Validation } from './types';

// ═══ HERO BUDGET — Enterprise Holdings · Mark Kielhafner's $18K story ═══
// This is the demo's emotional peak. The validation step catches an Allsteel
// worksurface mismatch with $18,240 prevented impact (94% AI confidence).

export const HERO_VALIDATION: Validation = {
    id: 'VAL-001',
    budgetId: 'BDG-2026-002',
    field: 'Line 5: Vertex Modular — Worksurface Size',
    severity: 'critical',
    confidence: 94,
    expected: '20 units · 60×30 worksurface (matches CET panel config)',
    actual: '20 units · 72×36 worksurface (current SIF — incompatible)',
    aiSuggestion: 'Worksurface 72×36 does not fit the selected Vertex Modular panel system. Recommend swap to Vertex Profile (compatible 72×36). Alternative: adjust panel spec.',
    estimatedImpact: 18240,
    status: 'pending',
};

export const HERO_VALIDATION_SECONDARY: Validation = {
    id: 'VAL-002',
    budgetId: 'BDG-2026-002',
    field: 'Line 11: Meridian Sync Task Chair — Finish',
    severity: 'warning',
    confidence: 88,
    expected: 'Onyx Black (matches project palette)',
    actual: 'Forest Green (outside Enterprise palette)',
    aiSuggestion: 'Finish inconsistent with the rest of the specification. Recommend Onyx Black to match palette.',
    estimatedImpact: 320,
    status: 'pending',
};

export const HERO_SCENARIOS: Scenario[] = [
    {
        tier: 'good',
        label: 'Economy',
        total: 322450,
        markup: 0.32,
        subtotal: 241900,
        freight: 24190,
        install: 29028,
        contingency: 12095,
        lineItemCount: 38,
        swaps: [
            { from: 'Vertex Modular panel system', to: 'Vertex Essential (entry tier)', delta: -18200 },
            { from: 'Meridian Sync task chair', to: 'Meridian Base VL502', delta: -6800 },
            { from: 'Apex Sit-Stand desk', to: 'Vertex Altitude A6', delta: -4300 },
        ],
    },
    {
        tier: 'better',
        label: 'Mid-Range',
        total: 372500,
        markup: 0.35,
        subtotal: 275930,
        freight: 27593,
        install: 33112,
        contingency: 13796,
        lineItemCount: 42,
        swaps: [
            { from: 'Baseline configuration', to: 'Recommended balance of cost + quality', delta: 0 },
        ],
    },
    {
        tier: 'best',
        label: 'Premium',
        total: 418700,
        markup: 0.38,
        subtotal: 303410,
        freight: 30341,
        install: 36409,
        contingency: 15170,
        lineItemCount: 45,
        swaps: [
            { from: 'Vertex Modular (standard)', to: 'Vertex Modular Premium finish', delta: 8200 },
            { from: 'Meridian Sync task chair', to: 'Apex Aeron Pro', delta: 14800 },
            { from: 'Standard conference table', to: 'Pinnacle Orbit height-adjust', delta: 9400 },
        ],
    },
];

// ═══ BUDGET REQUESTS ═══

export const MBI_BUDGET_REQUESTS: BudgetRequest[] = [
    {
        id: 'BDG-2026-001',
        client: { name: 'Lindenwood University', project: 'Administrative Building', vertical: 'education' },
        scope: { privateOffices: 18, conferenceRooms: 4, reception: 1 },
        contract: 'Omnia',
        budgetCeiling: 215000,
        path: 'design-assisted',
        status: 'intake',
        createdBy: 'keyla-gettings',
        createdAt: '2026-04-18T09:15:00Z',
    },
    {
        id: 'BDG-2026-002',
        client: { name: 'Enterprise Holdings', project: 'New HQ Floor 12', vertical: 'corporate' },
        scope: { workstations: 45, privateOffices: 8, conferenceRooms: 2, lounge: 1 },
        contract: 'HNI',
        budgetCeiling: 385000,
        path: 'design-assisted',
        status: 'validation',
        createdBy: 'amanda-renshaw',
        createdAt: '2026-04-18T10:30:00Z',
        total: 372500,
        scenarios: HERO_SCENARIOS,
        validations: [HERO_VALIDATION, HERO_VALIDATION_SECONDARY],
        sifSampleId: 'SIF-ENTERPRISE-001',
        isHero: true,
    },
    {
        id: 'BDG-2026-003',
        client: { name: 'Lakeside Health', project: 'ICU Expansion', vertical: 'healthcare' },
        scope: { privateOffices: 30, conferenceRooms: 0, lounge: 2 },
        contract: 'HealthTrust',
        budgetCeiling: 425000,
        path: 'design-assisted',
        status: 'parsing',
        createdBy: 'lynda-alexander',
        createdAt: '2026-04-19T08:20:00Z',
        total: 411750,
    },
    {
        id: 'BDG-2026-004',
        client: { name: 'Commerce Bank', project: 'Branch Remodel — Clayton', vertical: 'corporate' },
        scope: { privateOffices: 6, workstations: 12, reception: 1 },
        contract: 'HNI',
        budgetCeiling: 124000,
        path: 'quick-budget',
        status: 'review',
        createdBy: 'nicky-wesemann',
        createdAt: '2026-04-17T14:45:00Z',
        total: 118200,
    },
    {
        id: 'BDG-2026-005',
        client: { name: 'Ranken Technical College', project: 'Library Common Area', vertical: 'education' },
        scope: { lounge: 1, reception: 1 },
        contract: 'Omnia',
        budgetCeiling: 85000,
        path: 'quick-budget',
        status: 'approved',
        createdBy: 'stacey',
        createdAt: '2026-04-15T11:00:00Z',
        total: 82400,
    },
    {
        id: 'BDG-2026-006',
        client: { name: 'City of St. Charles', project: 'Police HQ — Admin Wing', vertical: 'government' },
        scope: { workstations: 24, privateOffices: 6 },
        contract: 'Omnia',
        budgetCeiling: 195000,
        path: 'design-assisted',
        status: 'approved',
        createdBy: 'amanda-renshaw',
        createdAt: '2026-04-14T13:30:00Z',
        total: 189500,
    },
];

export const getHeroBudget = (): BudgetRequest =>
    MBI_BUDGET_REQUESTS.find(b => b.isHero)!;
