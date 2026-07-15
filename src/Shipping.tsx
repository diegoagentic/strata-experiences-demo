/**
 * Shipping page · consolidates active shipments with per-row Send notification CTA + bulk actions.
 *
 * Standalone navbar page consolidating all active shipments.
 * Bulk actions: Resend Notifications · Escalate Delays · Export.
 * Row click opens existing TrackingModal (reuse · no rebuild).
 * Source badges (Post-Neocon-review 2026-06-06 · PDF #11): only Email + Manual.
 *
 * Per Modal Normalization Spec + Strata DS LAWS.
 */

import { useMemo, useState } from 'react'
import {
    Truck,
    Package,
    Clock,
    MapPin,
    Mail,
    AlertTriangle,
    Download,
    Filter,
    Search,
    Send,
    CheckCircle2,
    ChevronDown,
    ScanText,
} from 'lucide-react'
import Navbar from './components/Navbar'
import Breadcrumbs from './components/Breadcrumbs'
import ManufacturerTrackingModal, { type TrackingStep as ManufacturerTrackingStep } from './components/manufacturer/TrackingModal'
import EmailDraftModal, { type EmailDraft } from './components/manufacturer/EmailDraftModal'
import { useViewAs } from './components/manufacturer/viewAsSignal'

interface ShippingProps {
    onLogout: () => void
    onNavigateToWorkspace: () => void
    onNavigate?: (page: string) => void
}

// Shipment statuses use the official order lifecycle (see src/lib/orderLifecycle.ts).
// "Delayed" is an operational flag that coexists with stage (not a stage itself).
type ShipmentStatus = 'Ready to ship' | 'Shipped' | 'Delivered'
// Post-Neocon-review · sources reduction rounds:
//   Round 1 (2026-06-05): OCR removed, NetSuite added per Christian (B).
//   Round 2 (2026-06-06 · PDF #11): reduced to just Email + Manual.
type ShipmentSource = 'Email' | 'Manual'

interface ShipmentRow {
    id: string
    orderId: string
    dealer: string
    project: string
    eta: string
    carrier: string
    trackingNumber: string
    status: ShipmentStatus
    delayed?: boolean
    source: ShipmentSource
    daysToETA: number
    lastNotificationAt: string
}

const SHIPMENTS: ShipmentRow[] = [
    { id: 'SHP-2026-018', orderId: '#ORD-2055', dealer: 'NorthPoint Furniture Group', project: 'Tech HQ Buildout', eta: 'Mar 20, 2026', carrier: 'FedEx Freight LTL', trackingNumber: '129483-AB-2055', status: 'Ready to ship', source: 'Email', daysToETA: 8, lastNotificationAt: '2026-01-22 09:14' },
    { id: 'SHP-2026-017', orderId: '#ORD-2053', dealer: 'Pacific Workspaces', project: 'Lobby Refresh', eta: 'Jan 30, 2026', carrier: 'XPO Logistics', trackingNumber: 'XPO-558122', status: 'Shipped', source: 'Email', daysToETA: 2, lastNotificationAt: '2026-01-21 16:30' },
    { id: 'SHP-2026-016', orderId: '#ORD-2054', dealer: 'Cascade Workplace Co', project: 'HQ Upgrade · Floor 18', eta: 'Feb 15, 2026', carrier: 'YRC Worldwide', trackingNumber: 'YRC-118876', status: 'Shipped', source: 'Email', daysToETA: 18, lastNotificationAt: '2026-01-19 11:42' },
    { id: 'SHP-2026-015', orderId: '#ORD-2052', dealer: 'Global Furniture Partners', project: 'Warehouse Office', eta: 'Dec 15, 2025', carrier: 'DB Schenker', trackingNumber: 'DBS-998012', status: 'Delivered', source: 'Email', daysToETA: -8, lastNotificationAt: '2025-12-15 17:20' },
    { id: 'SHP-2026-014', orderId: '#ORD-2050', dealer: 'Heritage Office Group', project: 'Residential A', eta: 'Apr 2, 2026', carrier: 'Estes Express', trackingNumber: 'EXP-440891', status: 'Shipped', delayed: true, source: 'Email', daysToETA: 26, lastNotificationAt: '2026-01-20 14:08' },
    { id: 'SHP-2026-013', orderId: '#ORD-2048', dealer: 'Midwest Contract Furniture', project: 'Mountain Retreat Lodge', eta: 'Feb 20, 2026', carrier: 'FedEx Freight LTL', trackingNumber: 'FDX-7700521', status: 'Ready to ship', source: 'Email', daysToETA: 24, lastNotificationAt: '2026-01-18 08:55' },
    { id: 'SHP-2026-012', orderId: '#ORD-2047', dealer: 'Apex Office Design', project: 'Sky Vista · Tower 3', eta: 'Feb 5, 2026', carrier: 'XPO Logistics', trackingNumber: 'XPO-558118', status: 'Shipped', source: 'Email', daysToETA: 9, lastNotificationAt: '2026-01-21 10:14' },
]

type FilterId = 'all' | ShipmentStatus | 'delayed'

const FILTERS: Array<{ id: FilterId; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'Ready to ship', label: 'Ready to ship' },
    { id: 'Shipped', label: 'Shipped' },
    { id: 'Delivered', label: 'Delivered' },
    { id: 'delayed', label: 'Delayed' },
]

function statusClass(status: ShipmentStatus): string {
    if (status === 'Ready to ship') return 'bg-info/10 text-info border-info/20'
    if (status === 'Shipped') return 'bg-primary/10 text-foreground border-primary/30'
    if (status === 'Delivered') return 'bg-success/10 text-success border-success/20'
    return 'bg-muted text-muted-foreground border-border'
}

function sourceIcon(source: ShipmentSource) {
    if (source === 'Email') return Mail
    return ScanText // Manual
}

// Subset of the official 10 stages applicable to a shipping view (post-approval → delivered).
const TRACKING_STEPS_FOR_SHIPMENT: ManufacturerTrackingStep[] = [
    { id: 'approved', title: 'Order Approved', status: 'completed', timestamp: 'Dec 20, 9:00 AM', location: 'System' },
    { id: 'production', title: 'In production', status: 'completed', timestamp: 'Dec 21, 10:30 AM', location: 'Warehouse A' },
    { id: 'shipped', title: 'Shipped', status: 'current', timestamp: 'Dec 22, 4:15 PM', location: 'Logistics Center' },
    { id: 'delivered', title: 'Delivered', status: 'upcoming' },
]

/**
 * Inner Shipping content · everything except the page chrome (Navbar + Breadcrumbs).
 * Exported so the Transactions tab can render the same body inline without
 * duplicating data, per Wendy 51:59 "inside transactions" (Neocon-review 2026-06-05).
 */
export function ShippingContent() {
    const [activeFilter, setActiveFilter] = useState<FilterId>('all')
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [trackingShipment, setTrackingShipment] = useState<ShipmentRow | null>(null)
    // Shipping confirmation draft (Asly feedback 2026-06-05) · per-row CTA so the flow is discoverable from Shipping.tsx, not only from OrderActionsBar deep in OrderDetail.
    const [notifyShipment, setNotifyShipment] = useState<ShipmentRow | null>(null)
    const [notifyToast, setNotifyToast] = useState<string | null>(null)
    const fireNotifyToast = (msg: string) => { setNotifyToast(msg); window.setTimeout(() => setNotifyToast(null), 3000) }
    const [bulkToast, setBulkToast] = useState<string | null>(null)
    const viewAs = useViewAs()
    const isDealerView = viewAs === 'dealer'

    const filtered = useMemo(() => {
        return SHIPMENTS.filter(s => {
            if (activeFilter !== 'all') {
                if (activeFilter === 'delayed') {
                    if (!s.delayed) return false
                } else if (s.status !== activeFilter) {
                    return false
                }
            }
            if (search) {
                const q = search.toLowerCase()
                if (!s.orderId.toLowerCase().includes(q) && !s.dealer.toLowerCase().includes(q) && !s.trackingNumber.toLowerCase().includes(q)) return false
            }
            return true
        })
    }, [activeFilter, search])

    const counts = useMemo(() => ({
        all: SHIPMENTS.length,
        active: SHIPMENTS.filter(s => s.status === 'Ready to ship' || s.status === 'Shipped').length,
        ready: SHIPMENTS.filter(s => s.status === 'Ready to ship').length,
        transit: SHIPMENTS.filter(s => s.status === 'Shipped').length,
        delivered: SHIPMENTS.filter(s => s.status === 'Delivered').length,
        delayed: SHIPMENTS.filter(s => s.delayed).length,
    }), [])

    const toggleSelected = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const allFilteredSelected = filtered.length > 0 && filtered.every(s => selected.has(s.id))
    const toggleSelectAll = () => {
        if (allFilteredSelected) {
            setSelected(new Set())
        } else {
            setSelected(new Set(filtered.map(s => s.id)))
        }
    }

    const handleBulkAction = (action: string) => {
        const count = selected.size
        if (count === 0) return
        setBulkToast(`${action} · ${count} shipment${count === 1 ? '' : 's'} queued`)
        setSelected(new Set())
        setTimeout(() => setBulkToast(null), 2500)
    }

    return (
        <>
            <div className="space-y-6">

                {/* Header + summary metrics */}
                <header className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
                                <Truck className="h-5 w-5 text-info" aria-hidden="true" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-foreground">Shipping &amp; Logistics</h1>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Automatic notifications · tracking · carrier · ETA
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
                        {[
                            { label: 'Active shipments', value: counts.active, icon: Package, tone: 'text-foreground' },
                            { label: 'Ready to ship', value: counts.ready, icon: Clock, tone: 'text-info' },
                            { label: 'In transit', value: counts.transit, icon: Truck, tone: 'text-foreground' },
                            { label: 'Delivered today', value: counts.delivered, icon: CheckCircle2, tone: 'text-success' },
                            { label: 'Delayed', value: counts.delayed, icon: AlertTriangle, tone: 'text-destructive' },
                        ].map(m => {
                            const Icon = m.icon
                            return (
                                <div key={m.label} className="rounded-lg border border-border bg-muted/20 p-3">
                                    <div className="flex items-center gap-2">
                                        <Icon className={`h-3.5 w-3.5 ${m.tone}`} aria-hidden="true" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{m.label}</span>
                                    </div>
                                    <div className={`text-2xl font-bold tabular-nums leading-tight mt-1 ${m.tone}`}>{m.value}</div>
                                </div>
                            )
                        })}
                    </div>
                </header>

                {/* How shipping confirmations are sent · Asly feedback 2026-06-05 (the existing flow was buried in OrderActionsBar). */}
                <div className="rounded-xl border border-info/30 bg-info/5 p-4 flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4 text-info" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground">How shipping confirmations are sent</p>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                            Send shipping notifications individually with the <strong className="text-foreground font-semibold">Send notification</strong> button on each row,
                            or in bulk via the <strong className="text-foreground font-semibold">Resend Notifications</strong> action above.
                            Drafts include ETA, carrier and tracking number.
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <input
                            type="text"
                            placeholder="Search by order # · dealer · tracking #"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 h-9 rounded-md border border-border bg-background text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>

                    {/* Status filter pills */}
                    <div className="flex items-center gap-1 flex-wrap">
                        {FILTERS.map(f => (
                            <button
                                key={f.id}
                                type="button"
                                onClick={() => setActiveFilter(f.id)}
                                aria-label={`Filter ${f.label}`}
                                className={`inline-flex items-center gap-1 h-8 px-3 rounded-md text-[11px] font-bold transition-colors ${
                                    activeFilter === f.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted/40 text-foreground hover:bg-muted'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Bulk actions · W11 disabled in dealer view (read-only) */}
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-[10px] text-muted-foreground italic">
                            {selected.size > 0 ? `${selected.size} selected` : `${filtered.length} of ${SHIPMENTS.length}`}
                        </span>
                        {!isDealerView && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => handleBulkAction('Resend notifications')}
                                    disabled={selected.size === 0}
                                    aria-label="Resend shipping notifications for selected"
                                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[11px] font-bold bg-card border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="h-3 w-3" aria-hidden="true" />
                                    Resend Notifications
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleBulkAction('Escalate delays')}
                                    disabled={selected.size === 0}
                                    aria-label="Escalate delays for selected"
                                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[11px] font-bold bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                                    Escalate Delays
                                </button>
                            </>
                        )}
                        <button
                            type="button"
                            aria-label="Export shipments"
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[11px] font-bold bg-card border border-border text-foreground hover:bg-muted transition-colors"
                        >
                            <Download className="h-3 w-3" aria-hidden="true" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Shipments table */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    <th className="px-3 py-2.5 w-10">
                                        <input
                                            type="checkbox"
                                            aria-label="Select all shipments"
                                            checked={allFilteredSelected}
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 rounded border-input bg-background"
                                        />
                                    </th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Shipment</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dealer / Project</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ETA</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Carrier</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tracking #</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Source</th>
                                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map(s => {
                                    const SourceIcon = sourceIcon(s.source)
                                    return (
                                        <tr key={s.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setTrackingShipment(s)}>
                                            <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    aria-label={`Select shipment ${s.id}`}
                                                    checked={selected.has(s.id)}
                                                    onChange={() => toggleSelected(s.id)}
                                                    className="h-4 w-4 rounded border-input bg-background"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="text-xs font-mono font-medium text-foreground">{s.id}</div>
                                                <div className="text-[10px] font-mono text-muted-foreground">{s.orderId}</div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="text-xs font-medium text-foreground">{s.dealer}</div>
                                                <div className="text-[10px] text-muted-foreground">{s.project}</div>
                                                {/* Sales Rep + Revision # surfaced on every shipment row for at-a-glance ownership. */}
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                                        <span className="h-3.5 w-3.5 rounded-full bg-primary/20 text-foreground text-[7px] font-bold uppercase tracking-wider flex items-center justify-center">DP</span>
                                                        Rep · <strong className="text-foreground font-medium">David Park</strong>
                                                    </span>
                                                    <span className="inline-flex items-center gap-0.5 px-1 py-0 rounded text-[9px] font-bold uppercase tracking-wider bg-info/10 text-info border border-info/20">
                                                        Revision # 2
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="text-xs text-foreground">{s.eta}</div>
                                                <div className={`text-[10px] tabular-nums ${s.daysToETA < 0 ? 'text-muted-foreground' : s.daysToETA <= 3 ? 'text-warning' : 'text-muted-foreground'}`}>
                                                    {s.daysToETA < 0 ? `${Math.abs(s.daysToETA)}d ago` : `${s.daysToETA}d to ETA`}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="text-xs text-foreground">{s.carrier}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-foreground border border-border">{s.trackingNumber}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusClass(s.status)}`}>
                                                        {s.status}
                                                    </span>
                                                    {s.delayed && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-destructive/10 text-destructive border-destructive/30">
                                                            <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
                                                            Delayed
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-muted/50 text-muted-foreground border border-border">
                                                    <SourceIcon className="h-2.5 w-2.5" aria-hidden="true" />
                                                    {s.source}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                <div className="inline-flex items-center gap-1 justify-end">
                                                    {/* Per-row 'Send notification' CTA · only for stages where a shipping confirmation makes sense (not yet Delivered). */}
                                                    {s.status !== 'Delivered' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setNotifyShipment(s)}
                                                            aria-label={`Send shipping notification for ${s.id}`}
                                                            title="Send shipping notification (review draft before send)"
                                                            className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[10px] font-bold bg-primary/10 text-foreground border border-primary/30 hover:bg-primary/20 transition-colors"
                                                        >
                                                            <Send className="h-3 w-3" aria-hidden="true" />
                                                            Send notification
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setTrackingShipment(s)}
                                                        aria-label={`Open tracking for ${s.id}`}
                                                        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                                    >
                                                        <MapPin className="h-4 w-4" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-8 text-center text-xs text-muted-foreground italic">
                                            No shipments match the current filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="text-[10px] text-muted-foreground italic px-1">
                    Strata pre-drafts notifications · you review and send · backend bridges (FedEx, XPO, YRC) under integration review with Daniela.
                </div>
            </div>

            {/* Tracking modal (reuse from manufacturer/) */}
            {trackingShipment && (
                <ManufacturerTrackingModal
                    isOpen={!!trackingShipment}
                    onClose={() => setTrackingShipment(null)}
                    title={`${trackingShipment.id} · ${trackingShipment.dealer}`}
                    trackingId={trackingShipment.trackingNumber}
                    type="movement"
                    steps={TRACKING_STEPS_FOR_SHIPMENT}
                    carrier={trackingShipment.carrier}
                    eta={trackingShipment.eta}
                    contact="hello@lelandfurniture.com · 616-975-9260"
                    note="If shipped with a dedicated truck, the driver's phone number is given in place of the tracking number."
                />
            )}

            {/* Per-row shipping notification draft · Asly feedback (reuses the existing EmailDraftModal). */}
            {notifyShipment && (() => {
                const draft: EmailDraft = {
                    label: 'Shipping notification',
                    to: `${notifyShipment.dealer.toLowerCase().replace(/[^a-z]/g, '')}@example.com · david.park@strata-mfg.com`,
                    subject: `${notifyShipment.orderId} · shipping notification — ETA ${notifyShipment.eta}`,
                    body: `Hi,\n\nYour shipment for ${notifyShipment.orderId} (${notifyShipment.dealer} · ${notifyShipment.project}) is on its way.\n\nCarrier: ${notifyShipment.carrier}\nTracking #: ${notifyShipment.trackingNumber}\nETA: ${notifyShipment.eta}\n\nIf shipped with a dedicated truck, the driver's phone number is given in place of the tracking number.\n\nThanks,\nStrata · Order Management`,
                }
                return (
                    <EmailDraftModal
                        isOpen={!!notifyShipment}
                        onClose={() => setNotifyShipment(null)}
                        draft={draft}
                        onSent={() => fireNotifyToast(`Shipping notification sent · ${notifyShipment.dealer} via email · logged to Activity.`)}
                    />
                )
            })()}

            {/* Bulk action toast */}
            {bulkToast && (
                <div className="fixed bottom-6 right-6 z-[300] animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="rounded-xl shadow-2xl border border-success/30 bg-success/10 text-success px-4 py-3 max-w-sm">
                        <p className="text-sm font-bold flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            Bulk action queued
                        </p>
                        <p className="text-xs mt-1 text-foreground">{bulkToast}</p>
                    </div>
                </div>
            )}

            {/* Per-row notification toast */}
            {notifyToast && (
                <div className="fixed bottom-6 right-6 z-[400] animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="flex items-center gap-3 rounded-xl shadow-2xl border border-border bg-card pl-3 pr-5 py-3 max-w-sm">
                        <span className="h-7 w-7 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                        </span>
                        <p className="text-sm font-semibold text-foreground">{notifyToast}</p>
                    </div>
                </div>
            )}
        </>
    )
}

/**
 * Default export · standalone page wrapper kept for back-compat with the /shipping route.
 * The content body has been extracted into ShippingContent so Transactions can render
 * the same body inline as a tab (Wendy 51:59 · Neocon-review 2026-06-05).
 */
export default function Shipping({ onLogout, onNavigateToWorkspace, onNavigate }: ShippingProps) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar onLogout={onLogout} onNavigateToWorkspace={onNavigateToWorkspace} activeTab="shipping" onNavigate={onNavigate} />
            <div className="pt-24 px-4 max-w-[1600px] mx-auto">
                <Breadcrumbs items={[{ label: 'Dashboard', onClick: () => onNavigate?.('dashboard') }, { label: 'Shipping', active: true }]} />
                <ShippingContent />
            </div>
        </div>
    )
}
