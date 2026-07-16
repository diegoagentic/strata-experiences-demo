import type { LelandTenant } from './types';

// F16.6.c.2 · aliased for public demo (see src/config/aliases.ts).
// Original: Leland (Grand Rapids MI dealer, real client).
export const LELAND_TENANT: LelandTenant = {
    name: 'Dealer Bear',
    short: 'DB',
    hq: 'Northern City, MI',
    address: '100 Example Ave',
    nysVendorId: '1000000000',
    founded: 1953,
    primarySystems: ['CRM', 'Order System', 'Strata AI'],
    aiReadiness: {
        current: 2.1,
        target: 3.5,
        tier: 'AI Explorer',
    },
};
