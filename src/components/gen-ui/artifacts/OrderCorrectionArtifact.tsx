import { ArrowRightIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useGenUI } from '../../../context/GenUIContext';

export default function OrderCorrectionArtifact({ data }: { data: any }) {
    const [applied, setApplied] = useState(false);
    const { sendMessage } = useGenUI();

    const handleApply = () => {
        setApplied(true);
        // Simulate system response after action
        setTimeout(() => {
            sendMessage("System: Order #402 updated successfully. Notification sent to logistics.");
        }, 500);
    };

    if (applied) {
        return (
            <div className="p-4 bg-success/10 dark:bg-success/15 rounded-lg border border-success/30 dark:border-success/40 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                <div className="p-1 bg-success/15 dark:bg-success/20 rounded-full text-success">
                    <CheckCircleIcon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-semibold text-success dark:text-success text-sm">Correction Applied</h4>
                    <p className="text-xs text-success dark:text-success mt-1">Order #{data.orderId} updated to "{data.suggestion}".</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-warning/10 dark:bg-warning/15 px-4 py-3 border-b border-warning/20 dark:border-warning/40 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-warning dark:text-warning" />
                <h4 className="font-semibold text-warning dark:text-warning text-sm">Potential Error Detected</h4>
            </div>

            <div className="p-4 space-y-4">
                {/* Context Info */}
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Order <strong>#{data.orderId}</strong></span>
                    <span>Client: Herman Miller Dealer</span>
                </div>

                {/* Diff View */}
                <div className="bg-muted/50 rounded-lg p-3 grid grid-cols-[1fr,auto,1fr] gap-2 items-center text-sm border border-border">
                    <div className="space-y-1 opacity-50">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Original</p>
                        <div className="font-medium text-muted-foreground line-through decoration-red-500 decoration-2">{data.issue}</div>
                        <div className="text-xs text-muted-foreground">Standard Carpet</div>
                    </div>

                    <ArrowRightIcon className="w-4 h-4 text-zinc-300" />

                    <div className="space-y-1">
                        <p className="text-xs text-success uppercase tracking-wider font-semibold">Correction</p>
                        <div className="font-bold text-success">{data.suggestion}</div>
                        <div className="text-xs text-muted-foreground">Hard Floor (C7)</div>
                    </div>
                </div>

                {/* AI Reasoning */}
                <p className="text-xs text-muted-foreground italic">
                    "Project scope specifies 'Polished Concrete' floors throughout the office. Standard casters will slip."
                </p>

                <button
                    onClick={handleApply}
                    className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                    <CheckCircleIcon className="w-4 h-4" />
                    Apply Correction
                </button>
            </div>
        </div>
    );
}
