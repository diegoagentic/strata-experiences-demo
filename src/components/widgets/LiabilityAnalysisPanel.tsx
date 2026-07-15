import { SparklesIcon } from '@heroicons/react/24/outline'

interface LiabilityAnalysisPanelProps {
    carrierLiability: number;
    mfgLiability: number;
    reasoning: string;
}

export default function LiabilityAnalysisPanel({ carrierLiability, mfgLiability, reasoning }: LiabilityAnalysisPanelProps) {
    const total = carrierLiability + mfgLiability;
    const carrierPct = Math.round((carrierLiability / total) * 100);
    const mfgPct = 100 - carrierPct;

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                    <SparklesIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-sm font-medium text-foreground">AI Liability Analysis</h3>
            </div>

            {/* Split Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-[10px] font-medium mb-1.5">
                    <span className="text-red-600 dark:text-red-400">Carrier ({carrierPct}%)</span>
                    <span className="text-amber-600 dark:text-amber-400">Manufacturer ({mfgPct}%)</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                    <div
                        className="bg-red-500 dark:bg-red-400 h-full transition-all duration-700 ease-out"
                        style={{ width: `${carrierPct}%` }}
                    />
                    <div
                        className="bg-amber-500 dark:bg-amber-400 h-full transition-all duration-700 ease-out"
                        style={{ width: `${mfgPct}%` }}
                    />
                </div>
            </div>

            {/* Liability Details */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted/30 border border-border rounded-xl p-3">
                    <p className="text-[10px] font-medium text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Carrier Liability</p>
                    <p className="text-lg font-semibold text-foreground">{carrierPct}%</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Transit damage, handling</p>
                </div>
                <div className="bg-muted/30 border border-border rounded-xl p-3">
                    <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Manufacturer Liability</p>
                    <p className="text-lg font-semibold text-foreground">{mfgPct}%</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Defect, packaging</p>
                </div>
            </div>

            {/* AI Reasoning */}
            <div className="bg-muted/30 border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">AI Reasoning</span>
                </div>
                <p className="text-xs leading-relaxed text-foreground">
                    {reasoning}
                </p>
            </div>
        </div>
    );
}
