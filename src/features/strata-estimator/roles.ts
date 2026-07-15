// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Role Profiles
// v8 · Aligned with the 18-stage WRG BPMN (see V8_BPMN_ALIGNMENT_PLAN.md)
//
// Role keys are kept stable (Expert/Designer/Dealer/Sales Coordinator) for
// backwards compatibility with stepStates.ts and the demo profile, but the
// human-readable names + role labels now reflect the internal WRG process:
//
//   · Expert  → Senior Estimator (BPMN stages 10-14)
//   · Dealer  → Salesperson      (BPMN stages 15-16)
//   · Sales Coordinator → SAC    (BPMN stage 17)
//   · Project Manager            (BPMN stage 18, new)
// ═══════════════════════════════════════════════════════════════════════════════

import type { ConnectedUser } from './StrataEstimatorNavbar'

export const ROLE_PROFILES: Record<string, ConnectedUser> = {
    Expert: {
        name: 'David Park',
        role: 'Senior Estimator',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    },
    Designer: {
        name: 'Alex Rivera',
        role: 'Designer',
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face',
    },
    Dealer: {
        name: 'Sara Chen',
        role: 'Salesperson',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    },
    'Sales Coordinator': {
        name: 'Riley Morgan',
        role: 'Sales Account Coordinator',
        photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face',
    },
    'Project Manager': {
        name: 'James Ortiz',
        role: 'Senior Project Manager',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    },
}

/**
 * Returns the ConnectedUser for a given role string, or null if not found.
 * Used by the Shell to pass the correct user to the navbar based on currentStep.role.
 */
export function getRoleProfile(role: string | undefined): ConnectedUser | null {
    if (!role) return null
    return ROLE_PROFILES[role] ?? null
}
