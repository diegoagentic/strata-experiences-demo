/**
 * roleSignal · generalized role-switch pattern.
 *
 * sessionStorage-scoped by profile id (so switching profiles keeps each
 * one's last-picked role). CustomEvent fan-out so any consumer reads the
 * current role without prop-drilling.
 *
 * Storage key: `${profileId}:role`.
 * Event: 'role:change' with detail `{ profileId, roleId }`.
 *
 * viewAsSignal (inbound-outbound-specific) is now a thin wrapper over
 * this same store — see components/manufacturer/viewAsSignal.ts.
 */

import { useEffect, useState } from 'react'

export type RoleId = string
export const ROLE_EVENT = 'role:change'

const keyFor = (profileId: string) => `${profileId}:role`

export function readRole(profileId: string): RoleId | null {
    if (typeof window === 'undefined') return null
    return window.sessionStorage.getItem(keyFor(profileId))
}

export function writeRole(profileId: string, roleId: RoleId): void {
    if (typeof window === 'undefined') return
    window.sessionStorage.setItem(keyFor(profileId), roleId)
    window.dispatchEvent(
        new CustomEvent(ROLE_EVENT, { detail: { profileId, roleId } }),
    )
}

/**
 * React hook · returns the currently-selected role for `profileId`, or
 * `defaultRoleId` (if provided) when nothing has been stored yet.
 *
 * Re-renders on every 'role:change' event whose detail matches this profile.
 */
export function useCurrentRole(profileId: string, defaultRoleId?: RoleId): RoleId | null {
    const [state, setState] = useState<RoleId | null>(() =>
        readRole(profileId) ?? defaultRoleId ?? null,
    )
    useEffect(() => {
        const onChange = (e: Event) => {
            const detail = (e as CustomEvent).detail as { profileId?: string; roleId?: string } | undefined
            if (detail?.profileId === profileId) {
                setState(detail.roleId ?? null)
            }
        }
        window.addEventListener(ROLE_EVENT, onChange)
        return () => window.removeEventListener(ROLE_EVENT, onChange)
    }, [profileId])
    return state
}
