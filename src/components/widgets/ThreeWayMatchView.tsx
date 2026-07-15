import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

export interface MatchLine {
    lineItem: string;
    sku: string;
    poValue: string;
    ackValue: string;
    invoiceValue: string;
    status: 'match' | 'mismatch' | 'partial';
    delta?: string;
}

interface ThreeWayMatchViewProps {
    orderId: string;
    lines: MatchLine[];
    onAutoFix?: () => void;
    onResolve?: () => void;
}

export default function ThreeWayMatchView({ orderId, lines, onAutoFix, onResolve }: ThreeWayMatchViewProps) {
    const matchCount = lines.filter(l => l.status === 'match').length;
    const mismatchCount = lines.filter(l => l.status === 'mismatch').length;
    const partialCount = lines.filter(l => l.status === 'partial').length;

    const statusIcon = (status: MatchLine['status']) => {
        if (status === 'match') return <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />;
        if (status === 'mismatch') return <XCircleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />;
        return <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    };

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header — Post-Neocon-review (2026-06-05): renamed from "3-Way Match" to "PO vs Acknowledgement"
                because the Invoice column belongs to the Orders/Invoiced stage (PDF #7 + L.8 + L.19). */}
            <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-foreground">PO vs Acknowledgement — {orderId}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">PO vs Acknowledgement reconciliation</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-green-600 dark:text-green-400">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            {matchCount} Match
                        </span>
                        {mismatchCount > 0 && (
                            <span className="flex items-center gap-1.5 text-[10px] font-medium text-red-600 dark:text-red-400">
                                <XCircleIcon className="w-3.5 h-3.5" />
                                {mismatchCount} Mismatch
                            </span>
                        )}
                        {partialCount > 0 && (
                            <span className="flex items-center gap-1.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                {partialCount} Partial
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Column Headers — Invoice column removed per PDF #18 (manufacturer doesn't issue invoice at Ack stage). */}
            <div className="grid grid-cols-4 gap-0 border-b border-border">
                <div className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Line Item</div>
                <div className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Purchase Order</div>
                <div className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Acknowledgement</div>
                <div className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">Status</div>
            </div>

            {/* Rows */}
            {lines.map((line, idx) => (
                <div
                    key={idx}
                    className="grid grid-cols-4 gap-0 border-b border-border/50 last:border-0"
                >
                    <div className="px-4 py-3">
                        <p className="text-xs font-medium text-foreground">{line.lineItem}</p>
                        <p className="text-[10px] text-muted-foreground">{line.sku}</p>
                    </div>
                    <div className="px-4 py-3">
                        <p className="text-xs font-medium text-foreground">{line.poValue}</p>
                    </div>
                    <div className="px-4 py-3">
                        <p className="text-xs font-medium text-foreground">{line.ackValue}</p>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-center gap-2">
                        {statusIcon(line.status)}
                        {line.delta && (
                            <span className={clsx(
                                "text-[10px] font-medium",
                                line.status === 'mismatch' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                            )}>
                                {line.delta}
                            </span>
                        )}
                    </div>
                </div>
            ))}

            {/* Footer — Post-Neocon-review: Resolve & Approve / Auto-Fix replaced by Notify dealer.
                Manufacturer DETECTS, doesn't RESOLVE (L.16.b + L.19 + Christian 38:01). */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">
                        {matchCount}/{lines.length} lines matched
                    </span>
                    {mismatchCount > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                            {mismatchCount} exception{mismatchCount !== 1 ? 's' : ''} require dealer notification
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onResolve}
                        className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm"
                    >
                        {mismatchCount > 0 ? 'Notify dealer of exceptions' : 'Send acknowledgement'}
                    </button>
                </div>
            </div>
        </div>
    );
}
