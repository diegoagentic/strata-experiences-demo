/**
 * ItemDetailsModal · Centered modal for full line-item detail.
 *
 * Despite the legacy filename, this is now a centered dialog (max-w-4xl)
 * that matches the rest of the Order/Quote/Ack modal family
 * (QuoteRevisionRequestModal, ProformaInvoiceModal, FreightCalculatorModal).
 * A previous version of this component used a slide-from-right drawer; the
 * wider, two-column centered layout lets us surface the manufacturer-side
 * information that Wendy and Asly explicitly asked for (Sales Rep, textile
 * grade, size, discount approval, sample request, stock) without scrolling.
 *
 * The export name is kept as ItemDetailsDrawer for compatibility with the
 * existing imports in Order/Quote/Ack detail pages.
 *
 * Per Modal Normalization Spec · sits at z-[300] to clear the floating navbar
 * (z-50) AND the ViewAsToggle pill (z-[70]).
 */

import { Fragment, type ReactNode } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    X,
    Sparkles,
    Package,
    Tag as TagIcon,
    Boxes,
    User,
    History,
    Layers,
    BadgeCheck,
} from 'lucide-react'
import MaterialSwatch from './MaterialSwatch'
import { swatchFor } from './textileRef'
import { getSampleFlowBySku, useSampleFlowVersion } from './sampleFlowSignal'
import { sizeForCategory, formatSize, formatSizeLong } from './itemSpecs'

export interface ItemDetailsDrawerItem {
    id: string
    name: string
    category?: string
    tag?: string
    qtyOrd?: number
    qtyShip?: number
    qtyBO?: number
    listPrice?: number
    netPrice?: number
    discPct?: number
    amount?: number
    configs?: string[]
    status?: string
    flag?: 'partial' | 'backorder' | 'exception' | 'delayed'
    exceptionDetail?: string
    originalEta?: string
    newEta?: string
    delayDays?: number
    delayReason?: string
    aiStatus?: string
    source?: string
    stock?: number
}

export interface ItemDetailsQuickAction {
    /** Lucide-style icon component */
    icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
    label: string
    onClick: () => void
    /** Optional tone — `primary` highlights the action; defaults to neutral. */
    tone?: 'primary' | 'neutral' | 'destructive'
}

interface ItemDetailsDrawerProps {
    isOpen: boolean
    onClose: () => void
    item: ItemDetailsDrawerItem | null
    /** Sales rep responsible for the line · Wendy item 2a. */
    salesRep?: { name: string; initials: string; role?: string }
    /** Current document revision number · Wendy item 2d. */
    revisionNumber?: number
    /** Contextual quick actions rendered in the footer · same actions as the tab bar. */
    quickActions?: ItemDetailsQuickAction[]
    /** Optional extra content rendered after the standard sections. */
    extras?: ReactNode
}

/** Placeholder product image · keyed by category. Uses placehold.co (no auth needed). */
function productImageUrl(category?: string, name?: string): string {
    const label = (category ?? name ?? 'Item').toUpperCase().slice(0, 20)
    return `https://placehold.co/600x340/F4F4F5/52525B/png?text=${encodeURIComponent(label)}&font=inter`
}

const LIFECYCLE_STAGES = ['PO received', 'PO Reviewed', 'Order Approved', 'In production', 'Shipped', 'Delivered'] as const

function StatusBadge({ status }: { status?: string }) {
    if (!status) return null
    const isPositive = status === 'Shipped' || status === 'Delivered' || status === 'Ready to ship'
    const tone = isPositive
        ? 'bg-success/10 text-success border-success/20'
        : 'bg-muted text-foreground border-border'
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${tone}`}>
            {status}
        </span>
    )
}

function FlagBadge({ flag, detail, delayDays }: { flag?: ItemDetailsDrawerItem['flag']; detail?: string; delayDays?: number }) {
    if (!flag) return null
    const label = flag === 'partial' ? 'Partial'
        : flag === 'backorder' ? 'Backorder'
        : flag === 'delayed' ? `Delayed${delayDays ? ` · ${delayDays}d` : ''}`
        : `Exception${detail ? ` · ${detail}` : ''}`
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-warning/10 text-warning border-warning/30">
            {label}
        </span>
    )
}

function MetricCard({ label, value, tone }: { label: string; value: string | number; tone?: 'foreground' | 'warning' | 'success' }) {
    const valueTone = tone === 'warning' ? 'text-warning' : tone === 'success' ? 'text-success' : 'text-foreground'
    return (
        <div className="rounded-md border border-border bg-muted/30 px-2 py-1.5">
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate">{label}</div>
            <div className={`text-sm font-bold tabular-nums mt-0.5 ${valueTone}`}>{value}</div>
        </div>
    )
}

function SectionLabel({ icon: Icon, children }: { icon?: typeof Package; children: ReactNode }) {
    return (
        <div className="flex items-center gap-1.5 mb-1.5">
            {Icon && <Icon className="h-3 w-3 text-muted-foreground" aria-hidden="true" />}
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{children}</span>
        </div>
    )
}

function hasFabricSpec(configs: string[] = []): { hasFabric: boolean; fabricLabel: string } {
    const fabric = configs.find(c => /fabric/i.test(c))
    return { hasFabric: Boolean(fabric), fabricLabel: fabric ?? '' }
}

export default function ItemDetailsDrawer({ isOpen, onClose, item, salesRep, revisionNumber, quickActions, extras }: ItemDetailsDrawerProps) {
    const reachedIdx = item?.status ? LIFECYCLE_STAGES.indexOf(item.status as typeof LIFECYCLE_STAGES[number]) : -1
    const { hasFabric, fabricLabel } = hasFabricSpec(item?.configs)
    const size = sizeForCategory(item?.category)
    // Flow 3 · reflect a confirmed sample substitution (CF-6036 → CF-6021)
    useSampleFlowVersion()
    const sampleFlow = getSampleFlowBySku(item?.id ?? '')
    const substituted = !!sampleFlow?.substituted
    const effFabricLabel = substituted ? 'Fabric: CF-6021 Navy' : fabricLabel

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[300]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 z-[300] bg-foreground/70 backdrop-blur-sm" aria-hidden="true" />
                </TransitionChild>
                <div className="fixed inset-0 z-[300] overflow-y-auto">
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
                            <DialogPanel className="w-full max-w-4xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                                {/* Header */}
                                <header className="px-5 py-3 border-b border-border bg-card flex items-start gap-3 shrink-0">
                                    <div className="h-9 w-9 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                                        <Package className="h-4 w-4 text-foreground" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-foreground truncate">{item?.name ?? 'Item details'}</h3>
                                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate">{item?.id ?? '—'}</p>
                                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                                            <StatusBadge status={item?.status} />
                                            <FlagBadge flag={item?.flag} detail={item?.exceptionDetail} delayDays={item?.delayDays} />
                                            {item?.tag && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-muted text-muted-foreground border-border">
                                                    Tag {item.tag}
                                                </span>
                                            )}
                                            {item?.category && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-muted text-muted-foreground border-border">
                                                    {item.category}
                                                </span>
                                            )}
                                            {item?.source && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-muted/50 text-muted-foreground border-border uppercase tracking-wider">
                                                    {item.source}
                                                </span>
                                            )}
                                            {revisionNumber != null && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-info/10 text-info border-info/20">
                                                    <History className="h-2.5 w-2.5" aria-hidden="true" />
                                                    Revision # {revisionNumber}
                                                </span>
                                            )}
                                            {salesRep && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-muted/50 text-foreground border-border">
                                                    <User className="h-2.5 w-2.5" aria-hidden="true" />
                                                    {salesRep.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        aria-label="Close item details"
                                        className="shrink-0 h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </header>

                                {/* Body · 2-column grid · left = product info · right = metrics/lifecycle */}
                                <div className="flex-1 overflow-y-auto p-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                        {/* LEFT column · product detail */}
                                        <div className="space-y-4">
                                            {/* Product image · placeholder by category */}
                                            <div className="rounded-lg border border-border overflow-hidden bg-muted/20">
                                                <img
                                                    src={productImageUrl(item?.category, item?.name)}
                                                    alt={item?.name ?? 'Item placeholder'}
                                                    className="w-full h-44 object-cover"
                                                    loading="lazy"
                                                />
                                            </div>

                                            {/* Specifications */}
                                            {((item?.configs && item.configs.length > 0) || size) && (
                                                <section>
                                                    <SectionLabel icon={Layers}>Specifications</SectionLabel>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {item?.configs?.map((cfg, i) => {
                                                            const isFab = /fabric/i.test(cfg)
                                                            const displayCfg = isFab && substituted ? effFabricLabel : cfg
                                                            const sw = swatchFor(displayCfg)
                                                            return (
                                                                <span key={i} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] bg-muted/40 text-foreground border border-border">
                                                                    {sw && <span className="h-3 w-3 rounded ring-1 ring-border shrink-0" style={{ backgroundColor: sw.hex }} aria-hidden="true" />}
                                                                    {displayCfg}
                                                                    {isFab && substituted && <span className="text-[9px] font-bold uppercase tracking-wider text-success">· substituted</span>}
                                                                </span>
                                                            )
                                                        })}
                                                        {size && (
                                                            <span
                                                                title={`Product size · ${formatSizeLong(size)}`}
                                                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/60 text-foreground border border-border"
                                                            >
                                                                Size · {formatSize(size)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </section>
                                            )}

                                            {/* Textile / Fabric grade · Wendy item 2c */}
                                            {hasFabric && (
                                                <section>
                                                    <SectionLabel icon={TagIcon}>Textile · graded-in</SectionLabel>
                                                    <div className="rounded-md border border-success/20 bg-success/5 px-3 py-2 flex items-center gap-2">
                                                        {(() => { const sw = swatchFor(effFabricLabel); return sw
                                                            ? <MaterialSwatch swatch={sw} size="md" className="shrink-0" />
                                                            : <BadgeCheck className="h-4 w-4 text-success shrink-0" aria-hidden="true" /> })()}
                                                        <div className="text-[11px] leading-snug min-w-0">
                                                            <div className="text-foreground font-bold truncate">Grade B · CF Stinson{substituted && ' · substituted'}</div>
                                                            <div className="text-muted-foreground truncate">{effFabricLabel} · $24/yd · vendor verified{substituted ? ' · was CF-6036 Ocean Blue' : ''}</div>
                                                        </div>
                                                    </div>
                                                </section>
                                            )}

                                            {/* Validation panel (Discount approval) removed per Wendy PDF item 8 (Neocon-review 2026-06-05).
                                                Manufacturer doesn't state discount in Quote view; if discount approval needs to surface
                                                later it belongs on PO/Ack/Order where the dealer's contract discount lives. */}

                                            {/* AI Suggestions */}
                                            {item?.aiStatus && (
                                                <section>
                                                    <SectionLabel icon={Sparkles}>AI Suggestions</SectionLabel>
                                                    <div className={`rounded-md border px-3 py-2 flex items-start gap-2 ${item.aiStatus === 'warning' ? 'border-warning/30 bg-warning/5' : 'border-ai/30 bg-ai/5'}`}>
                                                        <Sparkles className={`h-4 w-4 shrink-0 mt-0.5 ${item.aiStatus === 'warning' ? 'text-warning' : 'text-ai'}`} aria-hidden="true" />
                                                        <div className="text-[11px] leading-snug">
                                                            <div className="text-foreground font-bold">{item.aiStatus === 'warning' ? 'Action required' : 'Optimization opportunity'}</div>
                                                            <p className="text-muted-foreground">
                                                                {item.aiStatus === 'warning'
                                                                    ? 'Strata AI detected a mismatch on this line. Review the suggestion in the activity stream.'
                                                                    : 'Strata AI suggests a refinement to lower lead time or improve margin on this item.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </section>
                                            )}
                                        </div>

                                        {/* RIGHT column · metrics + lifecycle */}
                                        <div className="space-y-4">
                                            {/* Amount headline */}
                                            {item?.amount != null && (
                                                <section className="rounded-lg border border-border bg-muted/20 px-4 py-3 flex items-baseline justify-between">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amount</span>
                                                    <span className="text-2xl font-bold text-foreground tabular-nums">${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                </section>
                                            )}

                                            {/* Metrics grid · post-Neocon-review (2026-06-05) · Wendy PDF item 8.
                                                Removed the 3 pricing boxes (Net price / Discount / List price) per
                                                "Remove both of these" annotation on the Item Details Drawer screenshot.
                                                Single AMOUNT headline above already covers the per-line total. Quantities stay. */}
                                            <section>
                                                <SectionLabel icon={Boxes}>Quantities</SectionLabel>
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    {item?.qtyOrd != null && <MetricCard label="Ordered" value={item.qtyOrd} />}
                                                    {(item?.qtyShip ?? 0) > 0 && <MetricCard label="Shipped" value={item?.qtyShip ?? 0} />}
                                                    {(item?.qtyBO ?? 0) > 0 && <MetricCard label="Backord." value={item?.qtyBO ?? 0} tone="warning" />}
                                                    {item?.stock != null && (
                                                        <MetricCard label="Stock" value={item.stock} tone={item.stock === 0 ? 'warning' : 'foreground'} />
                                                    )}
                                                </div>
                                            </section>

                                            {/* Lifecycle · horizontal dots with connecting line */}
                                            <section>
                                                <SectionLabel icon={History}>Lifecycle</SectionLabel>
                                                <ol className="flex items-center gap-1 relative">
                                                    {LIFECYCLE_STAGES.map((label, idx) => {
                                                        const reached = reachedIdx >= 0 && idx <= reachedIdx
                                                        const isCurrent = idx === reachedIdx
                                                        return (
                                                            <li key={label} className="flex flex-col items-center flex-1 min-w-0 relative">
                                                                <div className="flex items-center w-full">
                                                                    {idx > 0 && (
                                                                        <div className={`flex-1 h-0.5 ${reached ? 'bg-success' : 'bg-muted'}`} aria-hidden="true" />
                                                                    )}
                                                                    <span className={`h-2.5 w-2.5 rounded-full mx-0.5 shrink-0 ${reached ? (isCurrent ? 'bg-primary ring-2 ring-primary/30' : 'bg-success') : 'bg-muted border border-border'}`} aria-hidden="true" />
                                                                    {idx < LIFECYCLE_STAGES.length - 1 && (
                                                                        <div className={`flex-1 h-0.5 ${reachedIdx > idx ? 'bg-success' : 'bg-muted'}`} aria-hidden="true" />
                                                                    )}
                                                                </div>
                                                                <span className={`text-[9px] mt-1 text-center truncate w-full leading-tight ${reached ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
                                                            </li>
                                                        )
                                                    })}
                                                </ol>
                                            </section>

                                            {/* Caller-provided extras */}
                                            {extras && <section>{extras}</section>}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer · close only (quick actions live in the tab bar, not in the modal) */}
                                <footer className="px-5 py-3 border-t border-border bg-card flex items-center justify-end shrink-0">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="inline-flex items-center justify-center h-9 px-4 rounded-md text-[12px] font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors"
                                    >
                                        Close
                                    </button>
                                </footer>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
