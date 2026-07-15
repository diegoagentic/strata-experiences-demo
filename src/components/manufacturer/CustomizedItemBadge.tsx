/**
 * CustomizedItemBadge · Inline Description-cell badge (Asly N9 + Kenya K3)
 *
 * Surfaces items that are NOT in the standard catalog and need a manual price.
 * Click reveals the "Need price · call Leland" hint per Kenya's narrative.
 *
 * Lives inside the line-item row (Description cell), not as a separate column,
 * so the table stays readable.
 */

import { AlertTriangle } from 'lucide-react'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'

interface CustomizedItemBadgeProps {
    /** Optional vendor hint to surface on click. Defaults to Leland. */
    vendor?: string
    /** Optional context like SKU prefix for the alert. */
    sku?: string
}

export default function CustomizedItemBadge({ vendor = 'Leland', sku }: CustomizedItemBadgeProps) {
    return (
        <Popover className="relative inline-block">
            <PopoverButton
                aria-label={`Customized item · price needs ${vendor} confirmation`}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-colors focus:outline-none focus:ring-2 focus:ring-warning/40"
            >
                <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
                Custom
            </PopoverButton>
            <PopoverPanel
                anchor={{ to: 'bottom start', gap: 6 }}
                className="z-50 w-64 rounded-lg border border-warning/30 bg-card shadow-lg p-3"
            >
                <div className="flex items-start gap-2">
                    <div className="h-7 w-7 rounded-md bg-warning/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs font-bold text-foreground">Custom item · price needed</div>
                        <div className="text-[11px] text-muted-foreground mt-1">
                            Not in standard catalog. Call <strong className="text-foreground">{vendor}</strong> for a quote before sending to client.
                        </div>
                        {sku && (
                            <div className="text-[10px] font-mono text-muted-foreground mt-2 pt-2 border-t border-border">
                                SKU: {sku}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverPanel>
        </Popover>
    )
}
