// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Step State Mapping
// v8 · BPMN-aligned (see docs/wrg-demo/V8_BPMN_ALIGNMENT_PLAN.md)
//
// Visual state names are kept stable for backwards compatibility with the
// Shell render branches, but their meaning has shifted to reflect the
// internal WRG process:
//
//   · estimation-active    → w1.1 Estimator labor estimation (Expert)
//   · estimation-escalated → w1.2 Designer verification
//   · estimation-assembly  → w2.1 Salesperson review (Dealer role = Sara)
//   · proposal-review      → w2.2 SAC quote assembly & release (Sales Coord)
//   · pm-handoff           → w2.3 PM execution handoff (NEW)
// ═══════════════════════════════════════════════════════════════════════════════

import { getRoleProfile } from './roles'
import type { ConnectedUser } from './StrataEstimatorNavbar'
import type { EstimatorTab } from './types'

/**
 * Visual states the Estimator can be in, driven by currentStep.
 */
export type EstimatorStepState =
    | 'idle'                    // default — JPS pre-loaded, not yet interactive
    | 'estimation-active'       // w1.1 — Hero live, AI stagger import, flag row 19
    | 'estimation-escalated'    // w1.2 — BoM row 19 focused, Designer overlay open
    | 'estimation-assembly'     // w2.1 — Salesperson read-only review, forward to SAC
    | 'proposal-review'         // w2.2 — SAC quote assembly + internal release checklist
    | 'pm-handoff'              // w2.3 — PM execution planning + crew/tool assignment

interface StepMapping {
    state: EstimatorStepState
    tab: EstimatorTab
    role: string // key into ROLE_PROFILES
}

/**
 * Map each step ID to the corresponding Estimator state + active tab + role.
 */
const STEP_MAP: Record<string, StepMapping> = {
    // Flow 1 — AI Labor Estimation (BPMN stages 1-14)
    'w1.1': { state: 'estimation-active',    tab: 'ESTIMATOR', role: 'Expert' },
    'w1.2': { state: 'estimation-escalated', tab: 'ESTIMATOR', role: 'Designer' },
    // Flow 2 — Internal handoff (BPMN stages 15-18)
    'w2.1': { state: 'estimation-assembly',  tab: 'ESTIMATOR', role: 'Dealer' },
    'w2.2': { state: 'proposal-review',      tab: 'ESTIMATOR', role: 'Sales Coordinator' },
    'w2.3': { state: 'pm-handoff',           tab: 'ESTIMATOR', role: 'Project Manager' },
}

/**
 * Returns the Estimator visual state for a given step ID.
 * Defaults to 'idle' if step is not mapped.
 */
export function getStepState(stepId: string | undefined): EstimatorStepState {
    if (!stepId) return 'idle'
    return STEP_MAP[stepId]?.state ?? 'idle'
}

/**
 * Returns the tab that should be active for a given step ID.
 * Defaults to 'ESTIMATOR' if step is not mapped.
 */
export function getStepTab(stepId: string | undefined): EstimatorTab {
    if (!stepId) return 'ESTIMATOR'
    return STEP_MAP[stepId]?.tab ?? 'ESTIMATOR'
}

/**
 * Returns the ConnectedUser for a given step ID, or null if none applies.
 */
export function getStepRole(stepId: string | undefined): ConnectedUser | null {
    if (!stepId) return null
    const role = STEP_MAP[stepId]?.role
    if (!role) return null
    return getRoleProfile(role)
}
