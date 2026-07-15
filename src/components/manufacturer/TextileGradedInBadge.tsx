/**
 * TextileGradedInBadge · 3-state textile reference badge (E1c stub · Asly N5 + Kenya K1)
 *
 * Surfaces the textile-reference workflow Kenya described:
 *   - price-OK              · CF Stinson (vendor website lists price + grade)
 *   - price-missing         · vendor website incomplete · "call vendor" alert
 *   - vendor-tier-unknown   · graded-in tier not yet classified
 *
 * Click opens a popover with the vendor name + grade + a call-to-action.
 * Real vendor library wires in P3 with Kenya's URL list.
 */

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { Sparkles, AlertTriangle, PhoneCall, ExternalLink, Layers, CheckCircle2, FileSpreadsheet, Calculator } from 'lucide-react'

export type TextileState = 'price-ok' | 'price-missing' | 'vendor-tier-unknown'

interface TextileGradedInBadgeProps {
    state: TextileState
    /** Vendor name (e.g. "CF Stinson", "Maharam", "Knoll Textiles"). */
    vendor: string
    /** Optional graded-in tier (A/B/C/D/E). */
    tier?: string
    /** Optional displayed price hint when known. */
    pricePerYard?: string
    /** Optional vendor URL · placeholder until P3. */
    url?: string
    /** W7 · Excel approval status (Wendy item 10). */
    excelApproved?: boolean
    /** W7 · Base tier price for upcharge calc. */
    baseTierPrice?: number
    /** W7 · Yards required (drives the upcharge total). */
    yardsRequired?: number
}

const STATE_META: Record<TextileState, { label: string; bgClass: string; icon: typeof Sparkles }> = {
    'price-ok': {
        label: 'Verified',
        bgClass: 'bg-success/10 text-success border-success/20',
        icon: Sparkles,
    },
    'price-missing': {
        label: 'Call vendor',
        bgClass: 'bg-warning/10 text-warning border-warning/20',
        icon: PhoneCall,
    },
    'vendor-tier-unknown': {
        label: 'Tier unknown',
        bgClass: 'bg-muted/40 text-muted-foreground border-border',
        icon: AlertTriangle,
    },
}

function parsePricePerYard(s?: string): number | null {
    if (!s) return null
    const m = s.match(/\$?(\d+(?:\.\d+)?)/)
    return m ? parseFloat(m[1]) : null
}

export default function TextileGradedInBadge({
    state,
    vendor,
    tier,
    pricePerYard,
    url,
    excelApproved = true,
    baseTierPrice = 35,
    yardsRequired = 80,
}: TextileGradedInBadgeProps) {
    const meta = STATE_META[state]
    const Icon = meta.icon
    // W7 · Upcharge calc (Wendy item 10)
    const tierPrice = parsePricePerYard(pricePerYard)
    const upchargePerYd = tierPrice !== null ? tierPrice - baseTierPrice : null
    const upchargeTotal = upchargePerYd !== null ? upchargePerYd * yardsRequired : null
    return (
        <Popover className="relative inline-block">
            <PopoverButton
                aria-label={`Textile reference · ${vendor} · ${meta.label}`}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border hover:opacity-80 transition-opacity ${meta.bgClass}`}
            >
                <Icon className="h-2.5 w-2.5" aria-hidden="true" />
                {meta.label}
            </PopoverButton>
            <PopoverPanel
                anchor={{ to: 'bottom start', gap: 6 }}
                className="z-50 w-64 rounded-lg border border-border bg-card shadow-lg p-3"
            >
                <div className="flex items-start gap-2">
                    <div className="h-7 w-7 rounded-md bg-muted/40 flex items-center justify-center shrink-0">
                        <Layers className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-foreground">{vendor}</div>
                        {tier && (
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                Graded-in tier <strong className="text-foreground">{tier}</strong>{pricePerYard ? ` · ${pricePerYard}` : ''}
                            </div>
                        )}
                        <div className="mt-2 pt-2 border-t border-border text-[11px] text-muted-foreground">
                            {state === 'price-ok' && (
                                <>
                                    Vendor website lists price + grade. Verified by Strata against {vendor} catalog.
                                </>
                            )}
                            {state === 'price-missing' && (
                                <>
                                    Website lacks price for this tier. <strong className="text-warning">Call {vendor}</strong> to confirm before sending the quote.
                                </>
                            )}
                            {state === 'vendor-tier-unknown' && (
                                <>
                                    Graded-in tier not in our reference table. Ask Leland for the classification.
                                </>
                            )}
                        </div>
                        {url && (
                            <a
                                href={url}
                                onClick={(e) => e.stopPropagation()}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-info hover:underline"
                            >
                                Open vendor site
                                <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                            </a>
                        )}

                        {/* W7 · Excel approval check (Wendy item 10) */}
                        <div className="mt-2 pt-2 border-t border-border flex items-center justify-between gap-2 text-[10px]">
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <FileSpreadsheet className="h-2.5 w-2.5" aria-hidden="true" />
                                Excel approved
                            </span>
                            <span className={`inline-flex items-center gap-1 font-bold ${excelApproved ? 'text-success' : 'text-destructive'}`}>
                                {excelApproved ? (
                                    <>
                                        <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
                                        Yes · v3 textile list
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
                                        Not in approved list · escalate
                                    </>
                                )}
                            </span>
                        </div>

                        {/* W7 · Upcharge calculation (Wendy item 10) */}
                        {upchargePerYd !== null && upchargeTotal !== null && (
                            <div className="mt-2 pt-2 border-t border-border space-y-1 text-[10px]">
                                <div className="inline-flex items-center gap-1 text-muted-foreground">
                                    <Calculator className="h-2.5 w-2.5" aria-hidden="true" />
                                    <span className="font-bold uppercase tracking-wider">Upcharge calc</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                                    <span className="text-muted-foreground">Base tier</span>
                                    <span className="text-foreground tabular-nums text-right">${baseTierPrice.toFixed(2)}/yd</span>
                                    <span className="text-muted-foreground">This tier</span>
                                    <span className="text-foreground tabular-nums text-right">${tierPrice?.toFixed(2)}/yd</span>
                                    <span className="text-muted-foreground">Upcharge</span>
                                    <span className={`tabular-nums text-right font-bold ${upchargePerYd > 0 ? 'text-warning' : 'text-success'}`}>
                                        {upchargePerYd > 0 ? '+' : ''}${upchargePerYd.toFixed(2)}/yd
                                    </span>
                                    <span className="text-muted-foreground">{yardsRequired} yds total</span>
                                    <span className={`tabular-nums text-right font-bold ${upchargeTotal > 0 ? 'text-warning' : 'text-success'}`}>
                                        {upchargeTotal > 0 ? '+' : ''}${upchargeTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground italic">
                            Pricing updates in real time · Strata cross-checks Excel + vendor catalog · Wendy item 10
                        </div>
                    </div>
                </div>
            </PopoverPanel>
        </Popover>
    )
}
