/**
 * viewAsSignal · thin backward-compat wrapper over the generalized
 * roleSignal (see src/lib/roleSignal.ts).
 *
 * The inbound-outbound experience declares two roles ('manufacturer' /
 * 'dealer') in demoProfiles.ts. The global RoleSwitcher writes to the
 * same store this file reads, so the 10+ manufacturer-side consumers
 * (ARDepositsPanel, ItemDetailsDrawer, OrderActionsBar, etc.) keep
 * working unchanged.
 *
 * New code should prefer `useCurrentRole(profileId)` from
 * `src/lib/roleSignal.ts` directly.
 */

import { readRole, writeRole, useCurrentRole } from '../../lib/roleSignal'

export type ViewAs = 'manufacturer' | 'dealer'

const PROFILE_ID = 'inbound-outbound'

const normalize = (v: string | null): ViewAs =>
    v === 'dealer' ? 'dealer' : 'manufacturer'

export function readViewAs(): ViewAs {
    return normalize(readRole(PROFILE_ID))
}

export function writeViewAs(value: ViewAs): void {
    writeRole(PROFILE_ID, value)
}

export function useViewAs(): ViewAs {
    return normalize(useCurrentRole(PROFILE_ID, 'manufacturer'))
}
