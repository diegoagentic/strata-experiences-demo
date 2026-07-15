import type { LelandTenant } from './types';

export const LELAND_TENANT: LelandTenant = {
    name: 'Leland',
    short: 'LF',
    hq: 'Grand Rapids, MI',
    address: '5695 Eagle Dr SE',
    nysVendorId: '1000008256',
    founded: 1953,
    primarySystems: ['HubSpot', 'Seradex', 'Rica AI'],
    aiReadiness: {
        current: 2.1,
        target: 3.5,
        tier: 'AI Explorer',
    },
};
