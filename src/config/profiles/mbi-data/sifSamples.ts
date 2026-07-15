import type { SIFSample, LineItem } from './types';

// Clean SIF — used by non-hero budgets
const LINDENWOOD_LINES: LineItem[] = [
    { sku: 'ALS-BEY-PNL-60', manufacturer: 'Allsteel', description: 'Vertex Essential 60" panel', finish: 'Onyx', quantity: 18, unitPrice: 485, total: 8730 },
    { sku: 'ALS-ALT-DSK-60', manufacturer: 'Allsteel', description: 'Vertex Altitude A6 desk 60×30', finish: 'Walnut laminate', quantity: 18, unitPrice: 820, total: 14760 },
    { sku: 'HON-IGN-TASK', manufacturer: 'HON', description: 'Meridian Sync task chair', finish: 'Onyx mesh', quantity: 18, unitPrice: 425, total: 7650 },
    { sku: 'HON-CONF-TBL-96', manufacturer: 'HON', description: 'Meridian Prestige 96" conference table', finish: 'Walnut', quantity: 4, unitPrice: 2350, total: 9400 },
];

// HERO SIF — has the Allsteel worksurface mismatch
const ENTERPRISE_LINES: LineItem[] = [
    { sku: 'ALS-FUR-PNL-60', manufacturer: 'Allsteel', description: 'Vertex Modular panel system (60" spine)', finish: 'Graphite', quantity: 45, unitPrice: 920, total: 41400 },
    { sku: 'ALS-FUR-DSK-60', manufacturer: 'Allsteel', description: 'Vertex Modular desk 60×30 (matches panel)', finish: 'White laminate', quantity: 25, unitPrice: 1180, total: 29500 },
    { sku: 'ALS-FUR-DSK-72', manufacturer: 'Allsteel', description: 'Vertex Modular desk 72×36', finish: 'White laminate', quantity: 20, unitPrice: 1520, total: 30400, /* ⚠ the $18K hero issue */ },
    { sku: 'HON-IGN-TASK', manufacturer: 'HON', description: 'Meridian Sync task chair', finish: 'Onyx mesh', quantity: 42, unitPrice: 425, total: 17850 },
    { sku: 'HON-IGN-TASK-G', manufacturer: 'HON', description: 'Meridian Sync task chair', finish: 'Forest Green', quantity: 3, unitPrice: 425, total: 1275, /* ⚠ finish inconsistency */ },
    { sku: 'KNOLL-PROP-84', manufacturer: 'Pinnacle', description: 'Pinnacle Orbit conference table 84"', finish: 'Walnut', quantity: 2, unitPrice: 4200, total: 8400 },
    { sku: 'HM-EMB-LNG', manufacturer: 'Apex Workspace', description: 'Apex Embody lounge', finish: 'Charcoal', quantity: 6, unitPrice: 2150, total: 12900 },
];

export const MBI_SIF_SAMPLES: SIFSample[] = [
    {
        id: 'SIF-LINDENWOOD-001',
        fileName: 'Lindenwood_AdminBuilding_SIF_v3.xml',
        exportedAt: '2026-04-18T08:30:00Z',
        cetVersion: '16.5.2',
        fieldCount: 16,
        lineItems: LINDENWOOD_LINES,
        totals: { itemCount: 58, grossValue: 40540 },
    },
    {
        id: 'SIF-ENTERPRISE-001',
        fileName: 'EnterpriseHoldings_HQF12_SIF_v5.xml',
        exportedAt: '2026-04-18T10:20:00Z',
        cetVersion: '16.5.2',
        fieldCount: 24,
        lineItems: ENTERPRISE_LINES,
        totals: { itemCount: 143, grossValue: 141725 },
        hasIssue: true,
    },
];

export const getSIFSample = (id: string): SIFSample | undefined =>
    MBI_SIF_SAMPLES.find(s => s.id === id);
