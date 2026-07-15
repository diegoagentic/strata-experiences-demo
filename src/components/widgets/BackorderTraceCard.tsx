import { ExclamationTriangleIcon, ClockIcon, CubeIcon } from '@heroicons/react/24/outline'

export interface BackorderLine {
    sku: string;
    name: string;
    originalQty: number;
    fulfilledQty: number;
    backorderedQty: number;
    eta: string;
    impact: string;
}

interface BackorderTraceCardProps {
    lines: BackorderLine[];
    orderId: string;
}

export default function BackorderTraceCard({ lines, orderId }: BackorderTraceCardProps) {
    const totalBackordered = lines.reduce((sum, l) => sum + l.backorderedQty, 0);

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-foreground">Backorder Alert — {orderId}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {totalBackordered} unit{totalBackordered !== 1 ? 's' : ''} backordered across {lines.length} line{lines.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-medium uppercase rounded-full tracking-wider ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30">
                    Partial Fulfillment
                </span>
            </div>

            <div className="space-y-3">
                {lines.map((line) => (
                    <div key={line.sku} className="bg-muted/30 border border-border rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-muted">
                                    <CubeIcon className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-foreground">{line.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{line.sku}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                <ClockIcon className="w-3.5 h-3.5" />
                                ETA: {line.eta}
                            </div>
                        </div>

                        {/* Quantity Bar */}
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div className="flex h-full">
                                    <div
                                        className="bg-green-500 dark:bg-green-400 h-full"
                                        style={{ width: `${(line.fulfilledQty / line.originalQty) * 100}%` }}
                                    />
                                    <div
                                        className="bg-amber-500 dark:bg-amber-400 h-full"
                                        style={{ width: `${(line.backorderedQty / line.originalQty) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-[10px] font-medium">
                            <span className="text-muted-foreground">Ordered: {line.originalQty}</span>
                            <span className="text-green-600 dark:text-green-400">Fulfilled: {line.fulfilledQty}</span>
                            <span className="text-amber-600 dark:text-amber-400">Backordered: {line.backorderedQty}</span>
                        </div>

                        <p className="mt-2 text-[11px] text-muted-foreground italic">
                            {line.impact}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
