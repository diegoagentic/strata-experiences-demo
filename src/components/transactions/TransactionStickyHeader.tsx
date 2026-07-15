/**
 * TransactionStickyHeader · primary identity bar for transaction detail views
 *
 * Minimal, always-visible bar that sticks below the floating navbar as the
 * reviewer scrolls through line items. Carries only PRIMARY context:
 * transaction id + dealer + status + current phase. Everything secondary
 * lives in <TransactionInfoCard /> before the items list.
 *
 * Reusable across OrderDetail / AckDetail / QuoteDetail (data-driven props).
 */

import { ChevronRightIcon } from '@heroicons/react/24/outline'

export type StatusTone = 'default' | 'warning' | 'info' | 'success'

const TONE: Record<StatusTone, string> = {
    default: 'bg-muted text-foreground border-border',
    warning: 'bg-warning/10 text-warning border-warning/30',
    info: 'bg-info/10 text-info border-info/30',
    success: 'bg-success/10 text-success border-success/30',
}

interface TransactionStickyHeaderProps {
    /** Transaction number, e.g. "#ORD-2055" */
    transactionId: string
    /** Counterparty, e.g. the dealer name */
    dealer: string
    /** Headline status / fulfillment state */
    status: { label: string; tone?: StatusTone }
    /** Current workflow phase, e.g. "Processing" */
    currentPhase?: string
    /** Optional back handler — renders a leading chevron */
    onBack?: () => void
}

export default function TransactionStickyHeader({
    transactionId,
    dealer,
    status,
    currentPhase,
    onBack,
}: TransactionStickyHeaderProps) {
    return (
        <div className="sticky top-24 z-40">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card/95 backdrop-blur-xl px-4 py-2 shadow-sm">
                {onBack && (
                    <button
                        type="button"
                        onClick={onBack}
                        aria-label="Back"
                        className="p-1 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <ChevronRightIcon className="h-4 w-4 rotate-180" />
                    </button>
                )}

                {/* Identity: transaction id + dealer */}
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-foreground whitespace-nowrap">{transactionId}</span>
                    <span className="h-4 w-px bg-border shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">{dealer}</span>
                </div>

                {/* Status + current phase */}
                <div className="ml-auto flex items-center gap-3 shrink-0">
                    <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE[status.tone ?? 'default']}`}
                    >
                        {status.label}
                    </span>
                    {currentPhase && (
                        <span className="hidden md:inline text-xs text-muted-foreground">
                            Current Phase ·{' '}
                            <span className="font-medium text-foreground">{currentPhase}</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
