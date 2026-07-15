/**
 * COMPONENT: NonCatalogValidatorTable
 * PURPOSE: Cross-checks manually-entered (non-catalog) items against manufacturer
 *          price books + historical project data. MBI spec sheets are 80-90%
 *          non-catalog today — items have no product code, no catalog validation,
 *          invisible to CORE's EDI comparison.
 *
 *          Strata validates these items after extraction and flags mismatches.
 *
 * PROPS: none — mock data inline
 *
 * STATES: static
 *
 * DS TOKENS: bg-card · border-border · success/amber/red accents
 *
 * USED BY: MBIQuotesPage (Phase 4.B · shared with Design AI)
 */

import { Search, AlertTriangle, CheckCircle2, DollarSign, FileText } from 'lucide-react'

interface NonCatalogItem {
    id: string
    description: string
    manufacturer: string
    qty: number
    priceQuoted: number
    priceBook: number
    match: 'exact' | 'close' | 'mismatch'
    confidence: number
}

const MOCK_ITEMS: NonCatalogItem[] = [
    { id: 'NC-001', description: 'Custom walnut laminate credenza 84×24', manufacturer: 'HNI', qty: 3, priceQuoted: 2800, priceBook: 2800, match: 'exact', confidence: 100 },
    { id: 'NC-002', description: 'COM fabric upgrade · marine blue', manufacturer: 'Apex Workspace', qty: 8, priceQuoted: 450, priceBook: 425, match: 'close', confidence: 92 },
    { id: 'NC-003', description: 'BluDot Alto lounge chair · oatmeal', manufacturer: 'BluDot', qty: 4, priceQuoted: 1450, priceBook: 0, match: 'exact', confidence: 87 },
    { id: 'NC-004', description: 'BluDot Frame side table · walnut', manufacturer: 'BluDot', qty: 8, priceQuoted: 380, priceBook: 445, match: 'mismatch', confidence: 88 },
    { id: 'NC-005', description: 'Custom finish · teal powdercoat', manufacturer: 'CaseWorks', qty: 12, priceQuoted: 65, priceBook: 65, match: 'exact', confidence: 99 },
]

interface Props {
    resolvedIds?: Set<string>
}

export default function NonCatalogValidatorTable({ resolvedIds = new Set() }: Props) {
    const exactCount = MOCK_ITEMS.filter(i => i.match === 'exact' || resolvedIds.has(i.id)).length
    const mismatchCount = MOCK_ITEMS.filter(i => i.match === 'mismatch' && !resolvedIds.has(i.id)).length

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                            <Search className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-foreground">Non-catalog item validator</div>
                            <div className="text-[10px] text-muted-foreground">
                                80-90% of MBI spec sheets have manual items · Strata cross-checks against mfg price books
                            </div>
                        </div>
                    </div>
                    <div className="text-right text-[10px]">
                        <div>
                            <span className="text-success font-bold tabular-nums">{exactCount} exact</span>
                            <span className="text-muted-foreground"> · </span>
                            <span className="text-amber-600 dark:text-amber-400 font-bold tabular-nums">{mismatchCount} flagged</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-2 border-b border-border grid grid-cols-[1.5fr_0.8fr_0.5fr_0.8fr_0.8fr_0.6fr] gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <div>Item</div>
                <div>Manufacturer</div>
                <div className="text-right">Qty</div>
                <div className="text-right">Quoted</div>
                <div className="text-right">Price book</div>
                <div className="text-center">Match</div>
            </div>

            <div className="divide-y divide-border">
                {MOCK_ITEMS.map(item => {
                    const isResolved = resolvedIds.has(item.id)
                    const effectiveMatch = isResolved ? 'exact' : item.match
                    const deltaPct = item.priceBook > 0 ? Math.round(((item.priceQuoted - item.priceBook) / item.priceBook) * 100) : 0
                    const rowAccent = isResolved
                        ? 'bg-success/5 dark:bg-success/10 border-l-4 border-l-success/60'
                        : effectiveMatch === 'mismatch'
                            ? 'bg-amber-50/40 dark:bg-amber-500/5 border-l-4 border-l-amber-500/70'
                            : effectiveMatch === 'close'
                                ? 'border-l-4 border-l-info/40'
                                : 'border-l-4 border-l-transparent hover:bg-muted/20'
                    return (
                        <div key={item.id} className={`px-4 py-2 grid grid-cols-[1.5fr_0.8fr_0.5fr_0.8fr_0.8fr_0.6fr] gap-3 items-center text-xs transition-colors ${rowAccent}`}>
                            <div className="min-w-0">
                                <div className="text-foreground truncate">{item.description}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">{item.id}</div>
                                {isResolved && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <FileText className="h-2.5 w-2.5 text-success" />
                                        <span className="text-[9px] text-success font-bold">Quote-resolved · $215/u confirmed</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-muted-foreground truncate">{item.manufacturer}</div>
                            <div className="text-right tabular-nums text-muted-foreground">{item.qty}</div>
                            <div className={`text-right tabular-nums font-bold ${isResolved ? 'text-success' : 'text-foreground'}`}>
                                ${isResolved ? '215' : item.priceQuoted.toLocaleString()}
                            </div>
                            <div className="text-right tabular-nums">
                                {item.priceBook > 0 ? (
                                    <>
                                        <div className="text-foreground">${item.priceBook.toLocaleString()}</div>
                                        {deltaPct !== 0 && !isResolved && (
                                            <div className={`text-[9px] font-semibold ${deltaPct > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-success'}`}>
                                                {deltaPct > 0 ? '+' : ''}{deltaPct}%
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-[10px] text-muted-foreground italic">Custom</span>
                                )}
                            </div>
                            <div className="flex justify-center">
                                <MatchPill match={isResolved ? 'exact' : item.match} confidence={isResolved ? 100 : item.confidence} quoteResolved={isResolved} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function MatchPill({ match, confidence, quoteResolved }: { match: 'exact' | 'close' | 'mismatch'; confidence: number; quoteResolved?: boolean }) {
    if (quoteResolved) return (
        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-success/10 text-success" title="Resolved via vendor quote">
            <FileText className="h-2.5 w-2.5" />
            Resolved
        </span>
    )
    if (match === 'exact') return (
        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-success/10 text-success" title={`${confidence}% confidence`}>
            <CheckCircle2 className="h-2.5 w-2.5" />
            Exact
        </span>
    )
    if (match === 'close') return (
        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-info/10 text-info" title={`${confidence}% confidence`}>
            <DollarSign className="h-2.5 w-2.5" />
            Close
        </span>
    )
    return (
        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400" title={`${confidence}% confidence`}>
            <AlertTriangle className="h-2.5 w-2.5" />
            Fix
        </span>
    )
}
