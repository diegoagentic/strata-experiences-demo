import type { SpecCheckReport } from './types';

export const MBI_SPEC_CHECKS: SpecCheckReport[] = [
    {
        id: 'SC-001',
        projectId: 'Lakeside-ICU-2026',
        runAt: '2026-04-19T10:00:00Z',
        lineItemsScanned: 47,
        flags: [
            { type: 'finish', severity: 'warning', description: 'Line 23: HON Ignition finish "Forest Green" inconsistent with project palette "Marine Blue"', lineRef: 'L23' },
        ],
        status: 'needs-review',
    },
    {
        id: 'SC-002',
        projectId: 'ENT-HQ-F12',
        runAt: '2026-04-18T14:30:00Z',
        lineItemsScanned: 143,
        flags: [],
        status: 'clean',
    },
    {
        id: 'SC-003',
        projectId: 'COMMERCE-CLAYTON',
        runAt: '2026-04-17T16:15:00Z',
        lineItemsScanned: 26,
        flags: [],
        status: 'clean',
    },
];
