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

/** Map demo currentStep.id → MANATT column index (0-4) in the funnel */
export function stepIdToColIdx(stepId: string | undefined): number {
    if (!stepId) return 0
    if (stepId === 'sc1.0') return 0
    if (['sc1.1', 'sc1.2', 'sc1.2b', 'sc1.3', 'sc1.3b', 'sc1.4'].includes(stepId)) return 1
    if (['sc1.5', 'sc1.5b', 'sc1.5c', 'sc1.6', 'sc1.7'].includes(stepId)) return 2
    if (['sc1.8', 'sc1.8b'].includes(stepId)) return 3
    if (stepId === 'sc1.9') return 4
    return 0
}
