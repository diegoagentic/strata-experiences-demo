/**
 * OrderActionsBar · Send Acknowledgement + Send Shipping Notification (C5)
 *
 * Implements the missing email actions in Asly's N1 narrative:
 *   "Receive PO → enter info → SEND ACKNOWLEDGEMENT → schedule → see
 *   production → SEND SHIPPING EMAIL with {ETA + carrier + tracking#}"
 *
 * Both actions open a mini modal with email preview + Send. Each transitions
 * the order status forward and surfaces a Strata AI-drafted body.
 *
 * Per modal normalization spec.
 */

import { Fragment, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    X,
    Send,
    Mail,
    Truck,
    CheckCircle2,
    Sparkles,
    Clock,
    Building2,
    PackageCheck,
} from 'lucide-react'
import { useViewAs } from './viewAsSignal'
import { type OrderStageId, ORDER_STAGE_IDS, ORDER_STAGE_LABELS, getStageIndex, legacyStatusToStage } from '../../lib/orderLifecycle'

function resolveStageId(status: string): OrderStageId | null {
    // 1. exact match against official labels (e.g. "PO Reviewed")
    const exact = ORDER_STAGE_IDS.find(id => ORDER_STAGE_LABELS[id] === status)
    if (exact) return exact
    // 2. legacy/alias fallback
    return legacyStatusToStage(status)
}

type ActionMode = 'ack' | 'shipping'

interface OrderActionsBarProps {
    orderId: string
    dealer: string
    project: string
    /** Current order lifecycle stage label (one of the 10 official stages from orderLifecycle.ts).
     *  Legacy strings are mapped via legacyStatusToStage; unknown values fall back to the no-action state. */
    status: string
    /** Mock shipping data for the shipping notification preview */
    eta?: string
    carrier?: string
    trackingNumber?: string
}

interface EmailContent {
    title: string
    subject: string
    body: string
    successCopy: string
    primaryLabel: string
    icon: typeof Mail
}

function buildEmail(
    mode: ActionMode,
    args: { orderId: string; dealer: string; project: string; eta?: string; carrier?: string; trackingNumber?: string }
): EmailContent {
    if (mode === 'ack') {
        return {
            title: 'Send Acknowledgement',
            subject: `Order Acknowledgement · ${args.orderId} · production scheduled`,
            body: `Hi,

We acknowledge receipt of PO ${args.orderId} for the ${args.project} project. The order has been entered and validated. Production will be scheduled within the next 48 hours.

Confirmed quantities and ship-date commitments per line item are in the attached EDI/855 acknowledgement document. If any line needs adjustment before production releases, reply to this thread within 24 hours.

Best,
Strata · Order Entry`,
            successCopy: 'Acknowledgement sent · production scheduling queued',
            primaryLabel: 'Send Acknowledgement',
            icon: PackageCheck,
        }
    }
    // Shipping confirmation · verbatim Leland wording (grounded in the real Leland shipping confirmation)
    return {
        title: 'Send Shipping Notification',
        subject: `Shipping Confirmation · ${args.orderId} · shipped 05/23/25`,
        body: `Hi,

Thank you for your purchase order ${args.orderId}, Leland sales order number SO2503148. Your order was shipped on 05/23/25. To better assist, here is your tracking information:

  · Shipped with: ${args.carrier ?? 'Central Transport'}
  · Tracking number: ${args.trackingNumber ?? '231125600'}

If your order was shipped with a dedicated truck, the driver's phone number will be given in place of the tracking number.

If you have any questions, please let us know. You can contact your customer experience representative at hello@lelandfurniture.com or 616-975-9260 if you have any questions about this order.

Best,
Leland · Customer Experience`,
        successCopy: 'Shipping confirmation sent · tracking 231125600',
        primaryLabel: 'Send Shipping Notification',
        icon: Truck,
    }
}

export default function OrderActionsBar({
    orderId,
    dealer,
    project,
    status,
    eta,
    carrier,
    trackingNumber,
}: OrderActionsBarProps) {
    const viewAs = useViewAs()
    const [mode, setMode] = useState<ActionMode | null>(null)
    const [sent, setSent] = useState<{ ack: boolean; shipping: boolean }>({ ack: false, shipping: false })
    // W11 · Dealer mirror · OrderActionsBar is manufacturer-only write surface
    if (viewAs === 'dealer') return null

    // Resolve the order's lifecycle stage from the SOT (handles official + legacy strings).
    // Ack is offered between PO received and Order Approved.
    // Shipping notification is offered between Scheduled for production and Shipped.
    const stageId = resolveStageId(status)
    const stageIdx = stageId ? getStageIndex(stageId) : -1
    const showAck = !sent.ack && stageIdx >= 0 && stageIdx <= getStageIndex('order-approved')
    const showShipping = !sent.shipping && stageIdx >= getStageIndex('scheduled') && stageIdx <= getStageIndex('shipped')

    const handleSend = () => {
        if (!mode) return
        setSent(prev => ({ ...prev, [mode]: true }))
        setTimeout(() => setMode(null), 1000)
    }

    const email = mode ? buildEmail(mode, { orderId, dealer, project, eta, carrier, trackingNumber }) : null
    const ModeIcon = email?.icon

    return (
        <>
            {(showAck || showShipping || sent.ack || sent.shipping) && (
                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 flex-wrap">
                    <div className="h-9 w-9 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4 text-foreground" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-foreground">Outbound communications</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            Strata pre-drafts · you review and send · drafts only, never auto-sent
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {showAck && (
                            <button
                                type="button"
                                onClick={() => setMode('ack')}
                                aria-label="Send acknowledgement email to dealer"
                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                <PackageCheck className="h-3 w-3" aria-hidden="true" />
                                Send Acknowledgement
                            </button>
                        )}
                        {sent.ack && (
                            <span className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20">
                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                Ack sent
                            </span>
                        )}
                        {showShipping && (
                            <button
                                type="button"
                                onClick={() => setMode('shipping')}
                                aria-label="Send shipping notification with ETA, carrier and tracking"
                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[11px] font-bold bg-info/10 text-info border border-info/30 hover:bg-info/20 transition-colors"
                            >
                                <Truck className="h-3 w-3" aria-hidden="true" />
                                Send Shipping Notification
                            </button>
                        )}
                        {sent.shipping && (
                            <span className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20">
                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                Shipping sent
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Email preview modal · per Modal Normalization Spec */}
            <Transition appear show={mode !== null} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setMode(null)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-200"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-150"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-lg overflow-hidden flex flex-col max-h-[85vh]">
                                    {email && (
                                        <>
                                            <div className="px-5 py-4 border-b border-border bg-card flex items-start gap-3 shrink-0">
                                                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${mode === 'shipping' ? 'bg-info/10' : 'bg-primary/20'}`}>
                                                    {ModeIcon && <ModeIcon className={`h-4 w-4 ${mode === 'shipping' ? 'text-info' : 'text-foreground'}`} aria-hidden="true" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-bold text-foreground">{email.title}</h3>
                                                    <div className="text-[11px] text-muted-foreground mt-0.5">
                                                        {orderId} · {dealer} · {project}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setMode(null)}
                                                    aria-label="Close"
                                                    className="shrink-0 h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                                >
                                                    <X className="h-4 w-4" aria-hidden="true" />
                                                </button>
                                            </div>

                                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                                {/* Shipping context cards · only for shipping mode */}
                                                {mode === 'shipping' && (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="rounded-lg border border-border bg-muted/30 p-3">
                                                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                                <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                                                                ETA
                                                            </div>
                                                            <div className="text-xs font-bold text-foreground mt-1">{eta ?? 'TBD'}</div>
                                                        </div>
                                                        <div className="rounded-lg border border-border bg-muted/30 p-3">
                                                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                                <Truck className="h-2.5 w-2.5" aria-hidden="true" />
                                                                Carrier
                                                            </div>
                                                            <div className="text-xs font-bold text-foreground mt-1">{carrier ?? 'FedEx Freight LTL'}</div>
                                                        </div>
                                                        <div className="rounded-lg border border-border bg-muted/30 p-3">
                                                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                                <Building2 className="h-2.5 w-2.5" aria-hidden="true" />
                                                                Tracking
                                                            </div>
                                                            <div className="text-xs font-mono text-foreground mt-1">{trackingNumber ?? '129483-AB-2055'}</div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* AI draft */}
                                                <div className="rounded-xl border border-ai/30 bg-ai/5 overflow-hidden">
                                                    <div className="px-4 py-2.5 bg-card border-b border-ai/20 flex items-center gap-2">
                                                        <Sparkles className="h-3.5 w-3.5 text-ai" aria-hidden="true" />
                                                        <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">Pre-drafted by Strata AI</span>
                                                        <span className="ml-auto text-[10px] text-ai italic">ready to review</span>
                                                    </div>
                                                    <div className="px-4 py-3 space-y-2 text-xs bg-card">
                                                        <div>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">To: </span>
                                                            <span className="text-foreground font-medium">ap@{dealer.toLowerCase().replace(/\s+/g, '-')}.com</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Subject: </span>
                                                            <span className="text-foreground font-medium">{email.subject}</span>
                                                        </div>
                                                        <pre className="whitespace-pre-wrap font-sans text-[11px] text-muted-foreground leading-relaxed pt-2 border-t border-border">{email.body}</pre>
                                                    </div>
                                                </div>

                                                <div className="text-[10px] text-muted-foreground italic">
                                                    Strata never auto-sends · you approve before send · this is the gate per the manufacturer protocol.
                                                </div>
                                            </div>

                                            <div className="px-5 py-3 border-t border-border bg-card flex items-center justify-end gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setMode(null)}
                                                    className="inline-flex items-center justify-center h-9 px-4 rounded-md text-[12px] font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleSend}
                                                    className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md text-[12px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                                >
                                                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                                    {email.primaryLabel}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}
