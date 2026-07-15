import type { Contract } from './types';

export const MBI_CONTRACTS: Contract[] = [
    { id: 'hni-corporate', name: 'HNI Corporate — Allsteel Series', type: 'HNI', discount: 0.55, vertical: 'corporate' },
    { id: 'hni-national', name: 'HNI National Account', type: 'HNI', discount: 0.52, vertical: 'corporate' },
    { id: 'healthtrust-gpo', name: 'HealthTrust GPO', type: 'HealthTrust', discount: 0.58, vertical: 'healthcare', notes: 'Penny-match required · 3% rebate line flagged per job' },
    { id: 'omnia-partners-edu', name: 'Omnia Partners Education', type: 'Omnia', discount: 0.50, vertical: 'education' },
    { id: 'omnia-cooperative', name: 'Omnia Cooperative Purchasing', type: 'Omnia', discount: 0.48, vertical: 'government' },
];

export const getContract = (id: string): Contract | undefined =>
    MBI_CONTRACTS.find(c => c.id === id);
