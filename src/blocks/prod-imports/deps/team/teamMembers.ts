export interface TeamMember {
    id: string
    name: string
    initials: string
    role: 'Account Manager' | 'Expert Hub' | 'Admin' | 'User' | 'Expert'
    /** Pseudo-online status — only "me" is treated as online for the demo. */
    online?: boolean
}

// Sentinel for the current logged-in user (shown as "Me" in pickers).
export const CURRENT_USER_ID = 'me'

// Team list matches production Assign Feedback picker · adds the canonical
// "me" (Diego Zuluaga) at top + the 4 visible team members from prod.
// Legacy synthetic members kept for backward-compat con seeds existentes que
// referencian ids antiguos (marcus, priya, etc).
export const TEAM_MEMBERS: TeamMember[] = [
    { id: 'me',        name: 'Diego Zuluaga',   initials: 'DZ', role: 'Expert', online: true },
    { id: 'carlos',    name: 'Carlos Cedeno',   initials: 'CC', role: 'User' },
    { id: 'christian', name: 'Christian Mejia', initials: 'CM', role: 'User' },
    { id: 'daniela',   name: 'Daniela Puerta',  initials: 'DP', role: 'User' },
    { id: 'jennifer',  name: 'Jennifer Vargas', initials: 'JV', role: 'User' },
    // Legacy seeds (referenced by FeedbackBoard mock items)
    { id: 'sarah',     name: 'Sarah Johnson',   initials: 'SJ', role: 'User' },
    { id: 'marcus',    name: 'Marcus Webb',     initials: 'MW', role: 'User' },
    { id: 'priya',     name: 'Priya Shah',      initials: 'PS', role: 'User' },
    { id: 'daniel',    name: 'Daniel Okafor',   initials: 'DO', role: 'User' },
    { id: 'elena',     name: 'Elena Martínez',  initials: 'EM', role: 'User' },
    { id: 'noah',      name: 'Noah Fischer',    initials: 'NF', role: 'User' },
    { id: 'tomas',     name: 'Tomás Álvarez',   initials: 'TA', role: 'User' },
]

export function getTeamMember(id: string | undefined | null): TeamMember | null {
    if (!id) return null
    return TEAM_MEMBERS.find(m => m.id === id) ?? null
}

// Distinct background hue per member so chips/avatars stay visually identifiable
// without depending on a stored value. Pure function of the member id.
const AVATAR_HUES = [
    'from-indigo-500 to-indigo-700',
    'from-emerald-500 to-emerald-700',
    'from-rose-500 to-rose-700',
    'from-amber-500 to-amber-700',
    'from-purple-500 to-purple-700',
    'from-cyan-500 to-cyan-700',
    'from-orange-500 to-orange-700',
    'from-blue-500 to-blue-700',
]

export function avatarGradient(memberId: string): string {
    let hash = 0
    for (let i = 0; i < memberId.length; i++) hash = (hash * 31 + memberId.charCodeAt(i)) >>> 0
    return AVATAR_HUES[hash % AVATAR_HUES.length]
}

// Avatar bg solid · canonical palette across board + modal + picker.
// Deterministic hash from initials/seed picks one of 8 curated tones · each
// user keeps a consistent color across the app.
const SOLID_AVATAR_PALETTE = [
    'bg-blue-600',
    'bg-indigo-600',
    'bg-violet-600',
    'bg-sky-600',
    'bg-cyan-600',
    'bg-rose-500',
    'bg-amber-500',
    'bg-emerald-600',
]
export function solidAvatarColor(seed: string): string {
    let hash = 0
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
    return SOLID_AVATAR_PALETTE[Math.abs(hash) % SOLID_AVATAR_PALETTE.length]
}
