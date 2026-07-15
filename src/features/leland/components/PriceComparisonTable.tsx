/**
 * COMPONENT: PriceComparisonTable
 * PURPOSE: Side-by-side line-item price comparison (PO vs Seradex quote)
 *          for step l1.3 — the hero "$87.75 caught" moment of the demo.
 *          Rows reveal in cascade. Line 1 lands as a red mismatch with the
 *          delta visible. A contract chip + flag-for-Joshua banner close the
 *          panel.
 *
 *          Uses usePauseAware so the cascade respects global demo pause.
 *
 * USED BY: LelandStrataShell when currentStep.id === 'l1.3'
 */

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, ScaleIcon, Sparkles } from 'lucide-react';
import StatusBadge from '../../../components/shared/StatusBadge';
import StepCompletionCta from './StepCompletionCta';
import { usePauseAware } from '../../../context/usePauseAware';
import { HERO_PO_HAPPY, HERO_VALIDATION } from '../../../config/profiles/leland-data';

interface PriceRow {
    line: number;
    sku: string;
    description: string;
    qty: number;
    poPrice: number;
    quotePrice: number;
    deltaPerUnit: number;
    totalImpact: number;
    status: 'match' | 'mismatch';
}

function buildRows(): PriceRow[] {
    const po = HERO_PO_HAPPY;
    return po.lineItems.map((li, i) => {
        // Line 1 carries the mismatch hero — bake the $695 vs $712.55 diff in.
        if (i === 0) {
            const poPrice = li.unitPrice - 17.55;
            const deltaPerUnit = poPrice - li.unitPrice;
            return {
                line: li.line,
                sku: li.sku,
                description: li.description,
                qty: li.qty,
                poPrice,
                quotePrice: li.unitPrice,
                deltaPerUnit,
                totalImpact: deltaPerUnit * li.qty,
                status: 'mismatch',
            };
        }
        return {
            line: li.line,
            sku: li.sku,
            description: li.description,
            qty: li.qty,
            poPrice: li.unitPrice,
            quotePrice: li.unitPrice,
            deltaPerUnit: 0,
            totalImpact: 0,
            status: 'match',
        };
    });
}

interface PriceComparisonTableProps {
    animate?: boolean;
    perRowDelay?: number;
}

export default function PriceComparisonTable({ animate = true, perRowDelay = 700 }: PriceComparisonTableProps) {
    const rows = buildRows();
    const [revealedCount, setRevealedCount] = useState(animate ? 0 : rows.length);
    const [showFinalBanner, setShowFinalBanner] = useState(!animate);
    const { pauseAwareTimeout } = usePauseAware();

    // Reveal rows one by one
    useEffect(() => {
        if (!animate) return;
        if (revealedCount >= rows.length) {
            return pauseAwareTimeout(() => setShowFinalBanner(true), 400);
        }
        return pauseAwareTimeout(() => setRevealedCount(c => c + 1), perRowDelay);
    }, [animate, revealedCount, rows.length, perRowDelay, pauseAwareTimeout]);

    const totalImpact = rows.reduce((sum, r) => sum + r.totalImpact, 0);
    const mismatchCount = rows.filter(r => r.status === 'mismatch').length;
    const allDone = revealedCount >= rows.length;

    return (
        <div className="space-y-4">
            {/* Comparison table card */}
            <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${allDone && mismatchCount > 0 ? 'bg-danger/10 text-danger' : 'bg-ai/10 text-ai'}`}>
                            <ScaleIcon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-foreground">Line-by-line price check · PO vs the matched quote</div>
                            <div className="text-[10px] text-muted-foreground">
                                {allDone
                                    ? `${rows.length} lines compared · ${mismatchCount} mismatch caught`
                                    : `Comparing ${revealedCount}/${rows.length} lines`}
                            </div>
                        </div>
                    </div>
                    <StatusBadge
                        label={allDone ? (mismatchCount > 0 ? 'Mismatch caught' : 'All match') : 'Comparing'}
                        tone={allDone ? (mismatchCount > 0 ? 'danger' : 'success') : 'ai'}
                        size="sm"
                    />
                </div>

                {/* Table */}
                <div className="px-2 py-2">
                    <div className="grid grid-cols-[40px_minmax(180px,1fr)_80px_90px_90px_120px_auto] gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                        <div>Line</div>
                        <div>SKU · Description</div>
                        <div className="text-right">Qty</div>
                        <div className="text-right">PO Price</div>
                        <div className="text-right">Quote</div>
                        <div className="text-right">Δ × Qty</div>
                        <div className="text-right">Status</div>
                    </div>

                    {rows.slice(0, revealedCount).map((row, i) => {
                        const isMismatch = row.status === 'mismatch';
                        const highlightId = isMismatch ? 'price-mismatch-row-1' : undefined;
                        return (
                            <div
                                key={row.line}
                                id={highlightId}
                                data-demo-target={highlightId}
                                className={`
                                    grid grid-cols-[40px_minmax(180px,1fr)_80px_90px_90px_120px_auto] gap-2 px-3 py-2.5 items-center
                                    border-b border-border/40 last:border-b-0 text-[12.5px]
                                    animate-in fade-in slide-in-from-left-2 duration-300
                                    ${isMismatch ? 'bg-danger/5 border-l-4 border-l-danger -mx-2 pl-5' : ''}
                                `}
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="text-muted-foreground tabular-nums font-mono">{row.line}</div>
                                <div className="min-w-0">
                                    <div className="font-mono text-[11.5px] font-bold text-foreground truncate">{row.sku}</div>
                                    <div className="text-[10.5px] text-muted-foreground truncate">{row.description}</div>
                                </div>
                                <div className="text-right tabular-nums text-muted-foreground">×{row.qty}</div>
                                <div className={`text-right tabular-nums font-mono ${isMismatch ? 'text-danger font-bold' : 'text-foreground'}`}>
                                    ${row.poPrice.toFixed(2)}
                                </div>
                                <div className="text-right tabular-nums font-mono text-foreground">
                                    ${row.quotePrice.toFixed(2)}
                                </div>
                                <div className={`text-right tabular-nums font-mono ${isMismatch ? 'text-danger font-bold' : 'text-muted-foreground'}`}>
                                    {row.totalImpact === 0
                                        ? '—'
                                        : `${row.totalImpact > 0 ? '+' : ''}$${row.totalImpact.toFixed(2)}`}
                                </div>
                                <div className="text-right">
                                    {isMismatch ? (
                                        <StatusBadge label="Mismatch" tone="danger" size="xs" icon={<AlertTriangle className="h-2.5 w-2.5" />} />
                                    ) : (
                                        <StatusBadge label="Match" tone="success" size="xs" icon={<CheckCircle2 className="h-2.5 w-2.5" />} />
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Placeholder rows */}
                    {Array.from({ length: Math.max(0, rows.length - revealedCount) }).map((_, i) => (
                        <div
                            key={`ph-${i}`}
                            className="grid grid-cols-[40px_minmax(180px,1fr)_80px_90px_90px_120px_auto] gap-2 px-3 py-2.5 items-center border-b border-border/40 last:border-b-0 opacity-40"
                        >
                            <div className="h-2 bg-muted rounded w-3" />
                            <div className="h-2 bg-muted rounded w-32" />
                            <div className="h-2 bg-muted rounded w-6 ml-auto" />
                            <div className="h-2 bg-muted rounded w-12 ml-auto" />
                            <div className="h-2 bg-muted rounded w-12 ml-auto" />
                            <div className="h-2 bg-muted rounded w-10 ml-auto" />
                            <div className="h-4 bg-muted rounded-full w-14 ml-auto" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Hero impact card — appears after rows revealed */}
            {showFinalBanner && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* The hero catch */}
                    <div className="rounded-2xl border-2 border-danger/40 bg-danger/5 dark:bg-danger/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-danger" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-danger">What was caught</span>
                        </div>
                        <div className="text-2xl font-bold text-danger tabular-nums">
                            ${Math.abs(totalImpact).toFixed(2)}
                        </div>
                        <div className="text-[12px] text-muted-foreground mt-1">
                            on a single line · would have silently slipped through
                        </div>
                        <div className="mt-3 pt-3 border-t border-danger/20 text-[11px] text-muted-foreground">
                            Multiplied across the year, catches like this add up to material savings · see the impact at the end
                        </div>
                    </div>

                    {/* Contract + reviewer flag */}
                    <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
                        <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Contract detected</div>
                            <div className="flex items-center gap-2">
                                <StatusBadge label="Government contract · standard discount" tone="primary" size="md" icon={<Sparkles className="h-3 w-3" />} />
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-2">
                                Cross-checked against the supplier site · verified
                            </div>
                        </div>
                        <div className="border-t border-border pt-3">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Next</div>
                            <div className="flex items-start gap-2 text-[12px]">
                                <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                                <span className="text-foreground">
                                    Auto-approval paused · the catch needs a Reviewer's call
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <StepCompletionCta
                visible={showFinalBanner && mismatchCount > 0}
                label="Route the catch to the Reviewer"
                hint="Full context packed · just one decision needed"
            />
        </div>
    );
}
