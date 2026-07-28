import { ArrowLongRightIcon, CheckCircleIcon, XCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { AssetType } from '../AssetReviewArtifact';

interface AISuggestionPanelProps {
    originalAsset: AssetType;
    suggestion: NonNullable<AssetType['suggestion']>;
    onAccept: () => void;
    onReject: () => void;
}

export default function AISuggestionPanel({ originalAsset, suggestion, onAccept, onReject }: AISuggestionPanelProps) {
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    const savings = (originalAsset.unitPrice - suggestion.price) * originalAsset.qty;

    return (
        <div className="bg-gradient-to-br from-info/10 to-ai/10 dark:from-info/20 dark:to-ai/20 border border-info/20 dark:border-info/40 rounded-xl p-4 shadow-sm my-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-info/15 dark:bg-info/20 rounded-lg text-info">
                    <SparklesIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-info dark:text-info text-sm">Optimization Suggestion</h4>
                    <p className="text-xs text-info dark:text-info mt-1">{suggestion.reason}</p>

                    <div className="mt-3 flex items-center justify-between bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-info/30/50 dark:border-info/30">
                        {/* Original */}
                        <div className="text-center">
                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Original SKU</div>
                            <div className="font-mono text-xs font-medium mt-0.5">{originalAsset.sku}</div>
                            <div className="text-sm font-semibold line-through opacity-70 mt-1">{formatCurrency(originalAsset.unitPrice)}</div>
                        </div>

                        <ArrowLongRightIcon className="w-5 h-5 text-info" />

                        {/* Suggestion */}
                        <div className="text-center">
                            <div className="text-[10px] text-info uppercase font-bold tracking-wider">Proposed SKU</div>
                            <div className="font-mono text-xs font-medium mt-0.5 text-info dark:text-info">{suggestion.sku}</div>
                            <div className="text-sm font-bold text-success mt-1">{formatCurrency(suggestion.price)}</div>
                        </div>
                    </div>

                    <div className="mt-2 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-success/15 text-success text-xs font-bold border border-success/30 dark:border-success/40/50">
                            Potential Savings: {formatCurrency(savings)}
                        </span>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={onAccept}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-info hover:bg-info/90 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                        >
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            Accept Change
                        </button>
                        <button
                            onClick={onReject}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-card hover:bg-muted dark:hover:bg-muted text-muted-foreground dark:text-muted-foreground border border-border text-xs font-medium rounded-lg transition-colors"
                        >
                            <XCircleIcon className="w-3.5 h-3.5" />
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
