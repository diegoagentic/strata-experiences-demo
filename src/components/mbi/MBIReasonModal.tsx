/**
 * MBIReasonModal — backward-compat re-export.
 *
 * The implementation moved to `components/shared/ReasonDialog.tsx` as part
 * of Fase B of the DS consolidation (2026-04). Existing MBI imports keep
 * working via this re-export; new usage should prefer `ReasonDialog` from
 * `components/shared/` directly.
 */

export { default } from '../shared/ReasonDialog'
export type { ReasonTone, ReasonPayload } from '../shared/ReasonDialog'
