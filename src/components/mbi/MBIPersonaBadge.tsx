/**
 * MBIPersonaBadge — backward-compat re-export.
 *
 * This file used to hold the full implementation. As of Fase B of the DS
 * consolidation (2026-04), the component moved to `components/shared/
 * PersonaBadge.tsx` so any demo can reuse it. Existing MBI imports keep
 * working via this re-export; new usage should import from `shared/`
 * directly.
 *
 * The public API is unchanged except that `isPilot: boolean` is now
 * expressed as `marker={{ label: 'Phase 1 Pilot' }}` for generality.
 * A thin shim below keeps the old `isPilot` prop working.
 */

import PersonaBadge, { type PersonaMarker } from '../shared/PersonaBadge'

interface MBIPersonaBadgeProps {
    name: string
    role: string
    /** @deprecated use `marker` instead */
    isPilot?: boolean
    marker?: PersonaMarker
    size?: 'sm' | 'md'
    tone?: 'neutral' | 'success' | 'ai' | 'info' | 'warning'
}

export default function MBIPersonaBadge({ isPilot, marker, ...rest }: MBIPersonaBadgeProps) {
    const resolvedMarker = marker ?? (isPilot ? { label: 'Phase 1 Pilot' } : undefined)
    return <PersonaBadge {...rest} marker={resolvedMarker} />
}
