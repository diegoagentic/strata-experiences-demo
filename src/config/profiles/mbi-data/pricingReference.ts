import type { PricingReferenceRow } from './types';

// Pricing reference table — updated 1-2x/year + escalation buffer
// Used by Budget Builder for Quick Budget mode and validation
export const MBI_PRICING_REFERENCE: PricingReferenceRow[] = [
    { sku: 'ALS-FUR-PNL-60', manufacturer: 'Allsteel', description: 'Vertex Modular panel system 60"', listPrice: 920, lastUpdated: '2026-01-15' },
    { sku: 'ALS-FUR-DSK-60', manufacturer: 'Allsteel', description: 'Vertex Modular desk 60×30', listPrice: 1180, lastUpdated: '2026-01-15' },
    { sku: 'ALS-FUR-DSK-72', manufacturer: 'Allsteel', description: 'Vertex Modular desk 72×36', listPrice: 1520, lastUpdated: '2026-01-15' },
    { sku: 'ALS-SHA-DSK-72', manufacturer: 'Allsteel', description: 'Vertex Profile desk 72×36 (panel-compatible)', listPrice: 1485, lastUpdated: '2026-01-15' },
    { sku: 'ALS-BEY-PNL-60', manufacturer: 'Allsteel', description: 'Vertex Essential panel 60"', listPrice: 485, lastUpdated: '2026-01-15' },
    { sku: 'ALS-ALT-DSK-60', manufacturer: 'Allsteel', description: 'Vertex Altitude A6 desk 60×30', listPrice: 820, lastUpdated: '2026-01-15' },
    { sku: 'HON-IGN-TASK', manufacturer: 'HON', description: 'Meridian Sync task chair', listPrice: 425, lastUpdated: '2026-02-01' },
    { sku: 'HON-CONF-TBL-96', manufacturer: 'HON', description: 'Meridian Prestige 96" conference table', listPrice: 2350, lastUpdated: '2026-02-01' },
    { sku: 'HON-BSY-VL502', manufacturer: 'HON', description: 'Meridian Base VL502 task chair', listPrice: 285, lastUpdated: '2026-02-01' },
    { sku: 'KNOLL-PROP-84', manufacturer: 'Pinnacle', description: 'Pinnacle Orbit conference table 84"', listPrice: 4200, lastUpdated: '2026-01-20' },
    { sku: 'HM-EMB-LNG', manufacturer: 'Apex Workspace', description: 'Apex Embody lounge', listPrice: 2150, lastUpdated: '2026-02-10' },
    { sku: 'HM-AER-REM', manufacturer: 'Apex Workspace', description: 'Apex Aeron Pro', listPrice: 1195, lastUpdated: '2026-02-10' },
    { sku: 'HM-JRV-DSK-60', manufacturer: 'Apex Workspace', description: 'Apex Sit-Stand sit-stand 60×30', listPrice: 1295, lastUpdated: '2026-02-10' },
];

export const PRICING_BUFFER_PCT = 0.025; // 2.5% escalation buffer applied automatically
