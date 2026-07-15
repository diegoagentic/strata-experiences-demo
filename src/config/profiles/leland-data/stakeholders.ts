import type { LelandStakeholder } from './types';

// Personas referenced in the PO-to-Order flow.
// IDs are kebab-case and used in DemoStep / sidebar data threads.
export const LELAND_STAKEHOLDERS: LelandStakeholder[] = [
    // Leadership / Review
    {
        id: 'joshua',
        name: 'Joshua',
        role: 'Senior Reviewer',
        team: 'review',
        q4Trust: 7,
        adoption: 'early-adopter',
        isEarlyAdopter: true,
    },
    {
        id: 'josh',
        name: 'Josh',
        role: 'Director Operations',
        team: 'leadership',
        q4Trust: 8,
        adoption: 'early-adopter',
    },
    {
        id: 'brandon',
        name: 'Brandon',
        role: 'Admin · Dealer Onboarding',
        team: 'admin',
        q4Trust: 6,
        adoption: 'early-majority',
    },

    // Sales
    {
        id: 'wendy',
        name: 'Wendy',
        role: 'Director Sales',
        team: 'sales',
        q4Trust: 7,
        adoption: 'early-adopter',
    },
    {
        id: 'am-current',
        name: 'Account Manager',
        role: 'Account Manager',
        team: 'sales',
        q4Trust: 5,
        adoption: 'early-majority',
    },
];

export function getLelandStakeholder(id: string): LelandStakeholder | undefined {
    return LELAND_STAKEHOLDERS.find(s => s.id === id);
}
