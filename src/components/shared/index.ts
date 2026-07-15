/**
 * Shared component barrel · reusable across all demos + main app.
 *
 * These components live here (not in mbi/) because the patterns are
 * generic enough to be adopted by any flow: persona identity, status
 * badges, reason-capture dialogs. They depend only on the DS semantic
 * tokens (bg-success / bg-warning / bg-info / bg-ai / bg-danger /
 * bg-primary), not on any MBI-specific data or narrative.
 */

export { default as PersonaBadge } from './PersonaBadge'
export type { PersonaMarker } from './PersonaBadge'

export { default as StatusBadge } from './StatusBadge'
export type { StatusTone } from './StatusBadge'

export { default as ReasonDialog } from './ReasonDialog'
export type { ReasonTone, ReasonPayload } from './ReasonDialog'
