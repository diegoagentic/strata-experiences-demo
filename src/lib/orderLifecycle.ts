/**
 * Order Lifecycle · SINGLE SOURCE OF TRUTH
 *
 * 10 official client-defined stages (Wendy / Liliana team feedback · 2026-06).
 * All components/pages/modals that display order tracking MUST import from here.
 *
 * NOT in scope (these flows live independently):
 *  · Quote statuses (Priced, Awaiting Pricing, Negotiating) · quote is pre-order
 *  · RFQ kanban statuses (Pending Review, In Review) · OCRPipeline
 *  · AR aging tones (current, due-soon, past-due, escalated) · ARDepositsPanel
 *  · Asset statuses (Available, In Use, ...) · ChangeStatusModal
 *
 * Legacy item-level statuses that were folded into stages (see ITEM_FLAG_LABELS
 * for operational exception flags that coexist with stages):
 *  · Backordered      → 'scheduled' + ITEM_FLAG 'backorder'
 *  · Partial Ship     → 'shipped'   + ITEM_FLAG 'partial'
 *  · Allocated        → 'ready-to-ship'
 *  · Confirmed (Ack)  → 'po-reviewed'
 *  · Exception (Ack)  → 'po-reviewed' + ITEM_FLAG 'exception'
 *  · In Transit       → 'shipped'
 *  · Order Placed     → 'order-entered'
 *  · Awaiting ACK     → 'po-received'
 */

export const ORDER_STAGE_IDS = [
    'po-received',
    'po-reviewed',
    'order-entered',
    'order-approved',
    'scheduled',
    'in-production',
    'quality-control',
    'ready-to-ship',
    'shipped',
    'delivered',
] as const

export type OrderStageId = typeof ORDER_STAGE_IDS[number]

export const ORDER_STAGE_LABELS: Record<OrderStageId, string> = {
    'po-received': 'PO received',
    'po-reviewed': 'PO Reviewed',
    'order-entered': 'Order Entered',
    'order-approved': 'Order Approved',
    'scheduled': 'Scheduled for production',
    'in-production': 'In production',
    'quality-control': 'Quality control',
    'ready-to-ship': 'Ready to ship',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
}

export const ORDER_STAGE_PHASES = {
    preProduction: ['po-received', 'po-reviewed', 'order-entered', 'order-approved'],
    production: ['scheduled', 'in-production', 'quality-control'],
    postProduction: ['ready-to-ship', 'shipped', 'delivered'],
} satisfies Record<string, OrderStageId[]>

export function getStageLabel(id: OrderStageId): string {
    return ORDER_STAGE_LABELS[id]
}

export function getStageIndex(id: OrderStageId): number {
    return ORDER_STAGE_IDS.indexOf(id)
}

export function isStageBefore(a: OrderStageId, b: OrderStageId): boolean {
    return getStageIndex(a) < getStageIndex(b)
}

export function isStageAfter(a: OrderStageId, b: OrderStageId): boolean {
    return getStageIndex(a) > getStageIndex(b)
}

/**
 * Operational flags that COEXIST with stages (not stages themselves).
 * Example: stage = 'shipped' + flag = 'partial' → "Shipped · Partial 6 of 8"
 */
export type ItemFlag =
    | 'partial'      // partial ship
    | 'backorder'    // material/supply delay
    | 'exception'    // ack mismatch (finish, date, qty)
    | 'delayed'      // shipping delay vs ETA

export const ITEM_FLAG_LABELS: Record<ItemFlag, string> = {
    partial: 'Partial',
    backorder: 'Backorder',
    exception: 'Exception',
    delayed: 'Delayed',
}

/** Map a legacy status string to an official stage (use during refactor). */
export function legacyStatusToStage(legacy: string): OrderStageId | null {
    switch (legacy) {
        case 'Backordered': return 'scheduled'
        case 'Partial Ship': return 'shipped'
        case 'Allocated': return 'ready-to-ship'
        case 'Confirmed': return 'po-reviewed'
        case 'In Transit': return 'shipped'
        case 'Order Placed': return 'order-entered'
        case 'Awaiting ACK': return 'po-received'
        case 'Shipped': return 'shipped'
        case 'Delivered': return 'delivered'
        case 'Ready to Ship':
        case 'Ready to ship': return 'ready-to-ship'
        case 'In Production':
        case 'In production': return 'in-production'
        case 'Processing & Production': return 'in-production'
        case 'Shipped from Facility': return 'shipped'
        case 'Delivered to Dealer': return 'delivered'
        default: return null
    }
}
