/**
 * COMPONENT: PoExtractionPreview
 * PURPOSE: Animated PO extraction panel for step l1.1. Left = stylised
 *          PDF preview of the PO with field zones that highlight as they
 *          are extracted. Right = structured fields appearing line-by-line
 *          with confidence pills. Progress bar at top + completion banner.
 *
 *          Adapted from MBI's SIFParserPreview pattern, but for a PO PDF
 *          (not an XML SIF file). Uses usePauseAware so the cascade respects
 *          global demo pause/resume.
 *
 * PROPS:
 *   - animate?: boolean              — autoplay on mount (default true)
 *   - stagger?: number               — ms between each extracted field (default 220)
 *
 * STATES per field: pending → highlighting → extracted
 *
 * USED BY: LelandStrataShell when currentStep.id === 'l1.1' (or 'l2.1')
 */

import { useEffect, useMemo, useState } from 'react';
import { FileText, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../../../components/shared/StatusBadge';
import StepCompletionCta from './StepCompletionCta';
import { usePauseAware } from '../../../context/usePauseAware';
import { HERO_PO_HAPPY } from '../../../config/profiles/leland-data';

// Field key identifies which zone in the left PDF mock to highlight.
type FieldKey = 'poNumber' | 'poDate' | 'project' | 'dealer' | 'shipTo' | 'quoteRef'
    | 'line1' | 'line2' | 'line3' | 'total' | 'commission' | 'instructions';

interface ExtractedField {
    key: FieldKey;
    label: string;
    value: string;
    confidence: number;       // 0-100
}

function buildFields(): ExtractedField[] {
    const po = HERO_PO_HAPPY;
    return [
        { key: 'poNumber',     label: 'PO Number',           value: po.poNumber,                                  confidence: 99 },
        { key: 'poDate',       label: 'PO Date',             value: po.poDate,                                    confidence: 100 },
        { key: 'project',      label: 'Project',             value: po.project,                                   confidence: 95 },
        { key: 'dealer',       label: 'Dealer',              value: po.dealer,                                    confidence: 98 },
        { key: 'shipTo',       label: 'Ship To',             value: `${po.shipTo.name} · ${po.shipTo.city}`,      confidence: 96 },
        { key: 'quoteRef',     label: 'Quote reference',     value: po.quoteRef,                                  confidence: 99 },
        { key: 'line1',        label: 'Line 1 · SKU',        value: `${po.lineItems[0].sku} × ${po.lineItems[0].qty}`, confidence: 100 },
        { key: 'line2',        label: 'Line 2 · SKU',        value: `${po.lineItems[1].sku} × ${po.lineItems[1].qty}`, confidence: 100 },
        { key: 'line3',        label: 'Line 3 · SKU',        value: `${po.lineItems[2].sku} × ${po.lineItems[2].qty}`, confidence: 100 },
        { key: 'total',        label: 'Total',               value: `$${po.total.toLocaleString()}`,               confidence: 100 },
        { key: 'commission',   label: 'Commission deduct',   value: `$${po.commissionDeduct.toLocaleString()}`,    confidence: 97 },
        { key: 'instructions', label: 'Special instructions', value: po.poInstructions.join(' · '),                confidence: 92 },
    ];
}

interface PoExtractionPreviewProps {
    animate?: boolean;
    stagger?: number;
}

export default function PoExtractionPreview({ animate = true, stagger = 220 }: PoExtractionPreviewProps) {
    const fields = useMemo(buildFields, []);
    const [extractedCount, setExtractedCount] = useState(animate ? 0 : fields.length);
    const { pausedRef } = usePauseAware();

    useEffect(() => {
        if (!animate) return;
        setExtractedCount(0);
        let i = 0;
        const id = setInterval(() => {
            if (pausedRef.current) return;
            i++;
            setExtractedCount(i);
            if (i >= fields.length) clearInterval(id);
        }, stagger);
        return () => clearInterval(id);
    }, [animate, stagger, fields.length, pausedRef]);

    const progress = Math.round((extractedCount / fields.length) * 100);
    const isComplete = extractedCount >= fields.length;
    const activeField = extractedCount > 0 ? fields[extractedCount - 1] : null;

    return (
        <div className="space-y-4">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Header with progress */}
            <div className="px-4 py-3 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-ai/10 text-ai flex items-center justify-center">
                            <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-foreground">PO PDF parser · {HERO_PO_HAPPY.poNumber}.pdf</div>
                            <div className="text-[10px] text-muted-foreground">{fields.length} fields detected · NLP + layout extraction</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge label={isComplete ? 'Done' : 'Extracting'} tone={isComplete ? 'success' : 'ai'} size="sm" />
                        <div className="text-xs font-bold text-foreground tabular-nums">{progress}%</div>
                    </div>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-200 ${isComplete ? 'bg-success' : 'bg-ai'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Two-column body */}
            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border">
                {/* Left — PDF preview (2/5) */}
                <div className="md:col-span-2 p-4 bg-muted/10">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <FileText className="h-3 w-3" /> PDF source
                    </div>
                    <PdfPreviewCard activeKey={activeField?.key ?? null} />
                </div>

                {/* Right — extracted fields (3/5) */}
                <div className="md:col-span-3 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Extracted structured fields</div>
                        <div className="text-[10px] font-bold text-muted-foreground tabular-nums">{extractedCount}/{fields.length}</div>
                    </div>

                    <div className="space-y-1.5">
                        {fields.slice(0, extractedCount).map((f) => (
                            <div
                                key={f.key}
                                className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs animate-in fade-in slide-in-from-left-2 duration-300"
                            >
                                <span className="font-mono text-muted-foreground truncate w-32 shrink-0">{f.label}</span>
                                <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="text-foreground truncate flex-1">{f.value}</span>
                                <ConfidencePill value={f.confidence} />
                            </div>
                        ))}

                        {/* Placeholder rows for not-yet-extracted */}
                        {Array.from({ length: Math.max(0, fields.length - extractedCount) }).map((_, i) => (
                            <div
                                key={`ph-${i}`}
                                className="flex items-center gap-2 bg-muted/30 border border-dashed border-border/50 rounded-lg px-3 py-2 text-xs opacity-60"
                            >
                                <div className="h-2 bg-muted rounded w-32" />
                                <div className="h-3 w-3 rounded-sm bg-muted shrink-0" />
                                <div className="h-2 bg-muted rounded flex-1" />
                                <div className="h-2 bg-muted rounded w-10 shrink-0" />
                            </div>
                        ))}
                    </div>

                    {isComplete && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-success bg-success/5 border border-success/20 rounded-lg px-3 py-2 animate-in fade-in duration-300">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            <span>
                                Order details captured · 3 line items · contract reference detected
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <StepCompletionCta
            visible={isComplete}
            label="Search for the matching quote"
            hint="A quote reference was spotted in the order"
        />
        </div>
    );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ConfidencePill({ value }: { value: number }) {
    const tone = value >= 95 ? 'success' : value >= 85 ? 'ai' : 'warning';
    return <StatusBadge label={`${value}%`} tone={tone} size="xs" uppercase={false} />;
}

/** Stylized PDF mock — highlights the zone matching the active field key. */
function PdfPreviewCard({ activeKey }: { activeKey: FieldKey | null }) {
    const po = HERO_PO_HAPPY;
    const isActive = (key: FieldKey) => activeKey === key;
    const ring = (key: FieldKey) =>
        isActive(key) ? 'ring-2 ring-ai/70 bg-ai/10 transition-all' : 'transition-all';

    return (
        <div className="bg-white dark:bg-zinc-100 text-zinc-900 rounded-lg p-3 text-[10px] font-mono leading-relaxed shadow-sm">
            {/* PDF header: vendor logo + remit-to */}
            <div className="flex justify-between mb-2 border-b border-zinc-200 pb-2">
                <div className="text-muted-foreground font-bold text-[11px]">{po.dealer}</div>
                <div className="text-muted-foreground text-[9px]">PURCHASE ORDER</div>
            </div>

            {/* Top-right block: PO #, Date, Project */}
            <div className="grid grid-cols-3 gap-1 mb-2 text-[9px]">
                <div className={`px-1 py-0.5 rounded ${ring('poNumber')}`}>
                    <div className="text-muted-foreground">PO #</div>
                    <div className="font-bold">{po.poNumber}</div>
                </div>
                <div className={`px-1 py-0.5 rounded ${ring('poDate')}`}>
                    <div className="text-muted-foreground">DATE</div>
                    <div className="font-bold">{po.poDate}</div>
                </div>
                <div className={`px-1 py-0.5 rounded ${ring('project')}`}>
                    <div className="text-muted-foreground">PROJECT</div>
                    <div className="font-bold truncate">{po.project.split('·')[0]}</div>
                </div>
            </div>

            {/* Ship-to */}
            <div className={`mb-2 px-1 py-0.5 rounded ${ring('shipTo')}`}>
                <div className="text-muted-foreground text-[9px]">SHIP TO</div>
                <div>{po.shipTo.name}</div>
                <div>{po.shipTo.city}, {po.shipTo.state} {po.shipTo.zip}</div>
            </div>

            {/* Special instructions */}
            <div className={`mb-2 px-1 py-0.5 rounded ${ring('instructions')}`}>
                <div className="text-muted-foreground text-[9px]">INSTRUCTIONS</div>
                <div className={`px-1 py-0.5 rounded ${ring('quoteRef')}`}>{po.poInstructions[1]}</div>
                <div>{po.poInstructions[2]}</div>
            </div>

            {/* Line items table */}
            <div className="border-t border-zinc-200 pt-1.5">
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-[9px] text-muted-foreground font-bold mb-1">
                    <div>SKU / DESCRIPTION</div>
                    <div className="text-right">QTY</div>
                    <div className="text-right">AMOUNT</div>
                </div>
                {po.lineItems.map((li, i) => {
                    const key: FieldKey = (`line${i + 1}`) as FieldKey;
                    return (
                        <div key={li.sku} className={`grid grid-cols-[1fr_auto_auto] gap-2 px-1 py-0.5 rounded text-[9px] ${ring(key)}`}>
                            <div className="truncate">{li.sku}</div>
                            <div className="text-right">{li.qty}</div>
                            <div className="text-right font-bold">${(li.unitPrice * li.qty).toLocaleString()}</div>
                        </div>
                    );
                })}
            </div>

            {/* Totals */}
            <div className="mt-1.5 border-t border-zinc-200 pt-1 grid grid-cols-2 gap-1">
                <div className={`px-1 py-0.5 rounded col-span-2 flex justify-between ${ring('commission')}`}>
                    <span className="text-muted-foreground">Commission deduct</span>
                    <span className="font-bold">${po.commissionDeduct.toLocaleString()}</span>
                </div>
                <div className={`px-1 py-0.5 rounded col-span-2 flex justify-between ${ring('total')}`}>
                    <span className="text-muted-foreground font-bold">TOTAL</span>
                    <span className="font-bold">${po.total.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}
