import type { Tenant } from './types';

export const MBI_TENANT: Tenant = {
    name: 'Modern Business Interiors',
    short: 'MBI',
    hq: 'St. Charles, MO',
    satellite: 'Lenexa, KS',
    remoteDesigners: ['Kansas City', 'Iowa', 'Topeka'],
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
