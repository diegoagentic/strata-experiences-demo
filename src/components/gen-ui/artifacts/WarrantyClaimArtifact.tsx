import { ClipboardDocumentCheckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useGenUI } from '../../../context/GenUIContext';

export default function WarrantyClaimArtifact({ data }: { data: any }) {
    const [submitted, setSubmitted] = useState(false);
    const { sendMessage, navigate, setStreamOpen } = useGenUI();

    const handleDraft = () => {
        setSubmitted(true);
        setTimeout(() => {
            sendMessage(`System: Warranty Claim #CLM-2092 initialized for ${data.client}. Form sent to inbox.`);
        }, 500);
    };

    if (submitted) {
        return (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex flex-col gap-3 animate-in fade-in zoom-in duration-300">
                <div className="flex items-start gap-3">
                    <div className="p-1 bg-green-100 dark:bg-green-900/40 rounded-full text-green-600 dark:text-green-400">
                        <ClipboardDocumentCheckIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm">Claim Initialized</h4>
                        <p className="text-xs text-green-800 dark:text-green-200 mt-1">Check your inbox to finalize details for {data.client}.</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setStreamOpen(false);
                        navigate('/mac');
                    }}
                    className="mt-2 w-full py-2 bg-card hover:bg-muted dark:hover:bg-zinc-700 text-foreground border border-border rounded-lg text-sm font-semibold transition-colors shadow-sm text-center"
                >
                    View in Service Center
                </button>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 border-b border-green-100 dark:border-green-800 flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-green-600 dark:text-green-500" />
                <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm">Warranty Intelligence</h4>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h4 className="font-bold text-foreground text-sm">{data.issue}</h4>
                        <p className="text-xs text-muted-foreground">{data.client}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded uppercase">
                        Covered
                    </span>
                </div>

                <div className="bg-muted dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-700 text-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Policy</span>
                        <span className="font-medium text-foreground">{data.policy}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Coverage Type</span>
                        <span className="font-medium text-foreground">{data.coverage}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Deductible</span>
                        <span className="font-medium text-green-600 dark:text-green-400">$0.00</span>
                    </div>
                </div>

                <button
                    onClick={handleDraft}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                    <ClipboardDocumentCheckIcon className="w-4 h-4" />
                    Draft Claim Form
                </button>
            </div>
        </div>
    );
}
