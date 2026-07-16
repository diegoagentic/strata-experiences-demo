/**
 * SHARED: Officeworks funnel stages + step-to-column mapping.
 * Used by OfficeworksFunnel (kanban) and OfficeworksDocumentReviewModal (stage progress).
 * Exported here so Fast Refresh works in components (rule: only export components).
 */

export const OFFICEWORKS_FUNNEL = [
    { id: 'intake',     label: 'Intake'         },
    { id: 'design',     label: 'Design'         },
    { id: 'spec-check', label: 'Spec Check'     },
    { id: 'submission', label: 'Submission'     },
    { id: 'ack',        label: 'Acknowledgment' },
] as const

/** Map demo currentStep.id → Metro Legal column index (0-4) in the funnel.
 *  Same mapping shape for both Spec Check and Labor & Delivery flows: the
 *  funnel renders 5 columns regardless, only the labels + data differ. */
export function stepIdToColIdx(stepId: string | undefined): number {
    if (!stepId) return 0
    // Spec Check & Design flow
    if (stepId === 'sc1.0' || stepId === 'sc1.0b') return 0
    if (['sc1.2', 'sc1.4'].includes(stepId)) return 1
    if (['sc1.5', 'sc1.5b', 'sc1.6', 'sc1.7'].includes(stepId)) return 2
    if (['sc1.8', 'sc1.8b'].includes(stepId)) return 3
    if (stepId === 'sc1.9') return 4
    // Labor & Delivery flow (sc-LD.0 to sc-LD.7)
    if (['sc-LD.0', 'sc-LD.1'].includes(stepId)) return 0          // RFP Intake
    if (stepId === 'sc-LD.2') return 1                              // Conditions
    if (['sc-LD.3', 'sc-LD.4'].includes(stepId)) return 2          // Vendor Bid
    if (['sc-LD.5', 'sc-LD.6'].includes(stepId)) return 3          // Bid Eval
    if (stepId === 'sc-LD.7') return 4                              // Final Quote
    // Sales flow (sc-S.0 to sc-S.7)
    if (['sc-S.0', 'sc-S.1'].includes(stepId)) return 0            // Triage
    if (['sc-S.2', 'sc-S.3'].includes(stepId)) return 1            // Assign
    if (['sc-S.4', 'sc-S.5'].includes(stepId)) return 2            // Discover
    if (stepId === 'sc-S.6') return 3                               // Propose
    if (stepId === 'sc-S.7') return 4                               // Close
    return 0
}
