// F43.b · Wrapper híbrido sobre `DiscrepancyList` canónico (expert-hub prod).
// Preserva el public API legacy (`issues`, `onResolve`, `onClose`, `title?`)
// que consumen AssetReviewArtifact (Quick Quote flow) y AckHeroMatchPanel
// (Ack Reconciliation hero). El interior por-issue se reemplazó por el
// canonical 3-col PO / ACK / AI Analysis con severity pills + AI Recommended.
//
// F43.b.1 (Diego 2026-07-28 · smoke fix) · agregar `embedded` prop porque
// AckHeroMatchPanel monta su propio Dialog chrome (header + close + scrollable
// body). Sin `embedded=true`, el wrapper duplicaba el chrome y rompía clicks
// + scroll nesting. En modo embedded solo renderea `DiscrepancyList` + footer
// batch commit; el host provee la ventana/scroll.
//
// UX contract:
// - Cada row queda decidible con los inline buttons de DiscrepancyList
//   (ACCEPT / FLAG / REJECT). Esa decisión es visual/informativa en este
//   wrapper — DiscrepancyList es uncontrolled upstream.
// - El batch commit (Apply) es el único punto donde el parent recibe
//   onResolve(). Semántica de demo: accept-all aplica cada AI suggestion;
//   cancel/close cierra sin resolver nada.
import { Sparkles, X, Check } from 'lucide-react';
import DiscrepancyList from '../../../blocks/prod-imports/deps/comparison/DiscrepancyList';
import type {
    Discrepancy,
    DiscrepancyCategory,
    BusinessSeverity,
} from '../../../blocks/prod-imports/deps/comparison/comparisonTypes';

// Legacy shape — exported para no romper imports de consumidores.
export interface DiscrepancyItem {
    id: string;
    type: 'header' | 'rule' | 'line_item';
    title: string;
    description?: string;
    severity: 'high' | 'medium' | 'low';
    original: {
        label: string;
        value: string | number;
        subText?: string;
    };
    suggestion: {
        label: string;
        value: string | number;
        subText?: string;
        reason: string;
        confidence: number;
    };
    metadata?: any;
}

interface DiscrepancyResolverProps {
    issues: DiscrepancyItem[];
    onResolve: (id: string, action: 'accept' | 'keep' | 'manual', data?: any) => void;
    onClose: () => void;
    title?: string;
    /** When true, skip outer card + header + own scroll container. The host
        (e.g. AckHeroMatchPanel Dialog) already provides those. */
    embedded?: boolean;
}

function mapCategory(t: DiscrepancyItem['type']): DiscrepancyCategory {
    switch (t) {
        case 'header':    return 'header';
        case 'rule':      return 'terms';
        case 'line_item': return 'line_item';
    }
}

function mapSeverity(s: DiscrepancyItem['severity']): BusinessSeverity {
    switch (s) {
        case 'high':   return 'HIGH';
        case 'medium': return 'MEDIUM';
        case 'low':    return 'LOW';
    }
}

function toDiscrepancy(item: DiscrepancyItem): Discrepancy {
    const originalLabel = String(item.original.value);
    const suggestionLabel = String(item.suggestion.value);
    return {
        id: item.id,
        field_path: `${item.type}.${item.id}`,
        field_label: item.title,
        category: mapCategory(item.type),
        po_value: item.original.subText
            ? `${originalLabel} · ${item.original.subText}`
            : originalLabel,
        ack_value: item.suggestion.subText
            ? `${suggestionLabel} · ${item.suggestion.subText}`
            : suggestionLabel,
        business_severity: mapSeverity(item.severity),
        llm_analysis: item.suggestion.reason,
        what_changed: item.description,
        recommendation: item.suggestion.reason,
        recommended_action: 'ACCEPT',
        analysis_status: 'COMPLETED',
        analysis_confidence: item.suggestion.confidence,
    };
}

export default function DiscrepancyResolverArtifact({
    issues,
    onResolve,
    onClose,
    title,
    embedded = false,
}: DiscrepancyResolverProps) {
    const isSubstitution = title === 'Review Substitutions';
    const discrepancies = issues.map(toDiscrepancy);

    const applyAll = () => {
        for (const item of issues) {
            const hasOptions = item.metadata?.options?.length > 0;
            const data = hasOptions ? item.metadata.options[0].sku : undefined;
            onResolve(item.id, 'accept', data);
        }
        onClose();
    };

    if (issues.length === 0) return null;

    const footer = (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground italic">
                Review each row above · commit applies every AI recommendation at once.
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-border text-muted-foreground font-medium hover:bg-muted transition-colors text-sm"
                >
                    Cancel
                </button>
                <button
                    onClick={applyAll}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                    <Check className="h-4 w-4" />
                    Apply AI recommendations ({issues.length})
                </button>
            </div>
        </div>
    );

    if (embedded) {
        return (
            <div className="space-y-4">
                <DiscrepancyList discrepancies={discrepancies} />
                <div className="pt-4 border-t border-border">{footer}</div>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-4xl bg-card rounded-2xl shadow-sm border border-border flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in duration-300 my-auto">
            <div className="shrink-0 px-6 py-4 border-b border-border flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className={`h-4 w-4 ${isSubstitution ? 'text-ai' : 'text-warning'}`} />
                        {title || 'Review Discrepancies'}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {issues.length} item{issues.length === 1 ? '' : 's'} pending
                        {' · '}
                        <span className={isSubstitution ? 'text-ai font-medium' : 'text-warning font-medium'}>
                            Resolution required
                        </span>
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="inline-flex items-center justify-center size-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close"
                    title="Close without applying"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 scrollbar-micro bg-muted/30">
                <DiscrepancyList discrepancies={discrepancies} />
            </div>

            <div className="shrink-0 px-6 py-4 border-t border-border bg-card">
                {footer}
            </div>
        </div>
    );
}
