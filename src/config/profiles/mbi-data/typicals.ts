import type { Typical } from './types';

// Furniture packages by space type and tier — used for Quick Budget mode
// "Typicals library" defined with Lisa/Amy in Phase 1
export const MBI_TYPICALS: Typical[] = [
    {
        id: 'TYP-WS-GOOD',
        name: 'Workstation — Economy',
        spaceType: 'workstation',
        tier: 'good',
        manufacturer: 'Allsteel',
        lineItems: [
            { sku: 'ALS-BEY-PNL-60', qty: 1 },
            { sku: 'ALS-ALT-DSK-60', qty: 1 },
            { sku: 'HON-BSY-VL502', qty: 1 },
        ],
        baselineUnitCost: 1590,
    },
    {
        id: 'TYP-WS-BETTER',
        name: 'Workstation — Mid-Range',
        spaceType: 'workstation',
        tier: 'better',
        manufacturer: 'Allsteel',
        lineItems: [
            { sku: 'ALS-FUR-PNL-60', qty: 1 },
            { sku: 'ALS-FUR-DSK-60', qty: 1 },
            { sku: 'HON-IGN-TASK', qty: 1 },
        ],
        baselineUnitCost: 2525,
    },
    {
        id: 'TYP-WS-BEST',
        name: 'Workstation — Premium',
        spaceType: 'workstation',
        tier: 'best',
        manufacturer: 'Allsteel',
        lineItems: [
            { sku: 'ALS-FUR-PNL-60', qty: 1 },
            { sku: 'HM-JRV-DSK-60', qty: 1 },
            { sku: 'HM-AER-REM', qty: 1 },
        ],
        baselineUnitCost: 3410,
    },
    {
        id: 'TYP-CONF-MED',
        name: 'Conference Room — 8 person',
        spaceType: 'conference',
        tier: 'better',
        manufacturer: 'Pinnacle',
        lineItems: [
            { sku: 'KNOLL-PROP-84', qty: 1 },
            { sku: 'HON-IGN-TASK', qty: 8 },
        ],
        baselineUnitCost: 7600,
    },
    {
        id: 'TYP-LOUNGE-STD',
        name: 'Lounge — Standard',
        spaceType: 'lounge',
        tier: 'better',
        manufacturer: 'Apex Workspace',
        lineItems: [
            { sku: 'HM-EMB-LNG', qty: 4 },
        ],
        baselineUnitCost: 8600,
    },
];
