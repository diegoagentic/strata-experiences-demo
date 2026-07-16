import type { Tenant } from './types';

// F16.6.c.2 · aliased for public demo (see src/config/aliases.ts).
// Original: Modern Business Interiors (St. Charles MO dealer, real client).
export const MBI_TENANT: Tenant = {
    name: 'Dealer Ivory',
    short: 'DI',
    hq: 'Midwest City, MO',
    satellite: 'Midwest City, KS',
    remoteDesigners: ['Regional Hub A', 'Regional Hub B', 'Regional Hub C'],
    employees: 42,
    revenue: '~$17M',
    founded: 1987,
    verticals: ['corporate', 'healthcare', 'education', 'government'],
    primaryDealer: 'Allsteel',
    manufacturerCount: 30,
    aiReadiness: {
        current: 2.35,
        target: 3.6,
        tier: 'AI Explorer',
    },
};
