import { TruckIcon, ClockIcon, ArrowRightIcon, BellAlertIcon, MapPinIcon, CubeIcon } from '@heroicons/react/24/outline'

export interface DelayAlertCardProps {
    orderId: string
    originalEta: string
    newEta: string
    delayDays: number
    reason: string
    affectedItems: { sku: string; name: string }[]
    onNotifyDealer?: () => void
    onViewTracking?: () => void
}

export default function DelayAlertCard({
    orderId,
    originalEta,
    newEta,
    delayDays,
    reason,
    affectedItems,
    onNotifyDealer,
    onViewTracking,
}: DelayAlertCardProps) {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-warning/15">
                        <TruckIcon className="w-5 h-5 text-warning" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Shipment Delay Alert — {orderId}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {affectedItems.length} line{affectedItems.length !== 1 ? 's' : ''} affected · delivery shifted {delayDays} day{delayDays !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-warning/15 text-warning text-[10px] font-bold uppercase rounded-full tracking-wider border border-warning/30">
                    <ClockIcon className="w-3 h-3" aria-hidden="true" /> Delayed +{delayDays}d
                </span>
            </div>

            {/* ETA timeline */}
            <div className="bg-muted/30 border border-border rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 flex-wrap text-sm">
                    <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">ETA Was</div>
                            <div className="text-foreground font-semibold line-through opacity-70">{originalEta}</div>
                        </div>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-warning" aria-hidden="true" />
                    <div className="flex items-center gap-2">
                        <BellAlertIcon className="w-4 h-4 text-warning" aria-hidden="true" />
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-warning font-semibold">New ETA</div>
                            <div className="text-foreground font-bold">{newEta}</div>
                        </div>
                    </div>
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 bg-warning/10 text-warning text-[10px] font-bold uppercase rounded-full tracking-wider border border-warning/30">
                        +{delayDays} days
                    </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Reason:</span> {reason}
                </p>
            </div>

            {/* Affected items */}
            {affectedItems.length > 0 && (
                <div className="mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Affected line items</div>
                    <div className="flex flex-wrap gap-2">
                        {affectedItems.map((item) => (
                            <span
                                key={item.sku}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 border border-border text-[11px]"
                                title={item.name}
                            >
                                <CubeIcon className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
                                <span className="font-mono text-foreground">{item.sku}</span>
                                <span className="text-muted-foreground truncate max-w-[180px]">{item.name}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-border">
                <button
                    onClick={onNotifyDealer}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-xs font-bold bg-warning text-primary-foreground hover:bg-warning/90 transition-colors"
                    type="button"
                >
                    <BellAlertIcon className="w-4 h-4" aria-hidden="true" /> Notify Dealer
                </button>
                <button
                    onClick={onViewTracking}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors"
                    type="button"
                >
                    <MapPinIcon className="w-4 h-4" aria-hidden="true" /> View Tracking
                </button>
            </div>
        </div>
    )
}
