import { DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useGenUI } from '../../../context/GenUIContext';

export default function QuoteProposalArtifact({ data }: { data: any }) {
    const [generated, setGenerated] = useState(false);
    const { sendMessage } = useGenUI();

    const handlePreview = () => {
        setGenerated(true);
        setTimeout(() => {
            sendMessage(`System: Proposal PDF for ${data.client} generated. Opening preview...`);
        }, 500);
    };

    if (generated) {
        return (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                <div className="p-1 bg-indigo-100 dark:bg-indigo-900/40 rounded-full text-indigo-600 dark:text-indigo-400">
                    <DocumentTextIcon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 text-sm">Proposal Ready</h4>
                    <p className="text-xs text-indigo-800 dark:text-indigo-200 mt-1">PDF downloaded. Sent copy to your email.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden group">
            {/* Header */}
            <div className="relative bg-indigo-600 px-4 py-8 flex flex-col items-center justify-center text-white overflow-hidden">
                {/* Abstract Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 text-center">
                    <SparklesIcon className="w-8 h-8 mx-auto mb-2 text-indigo-200" />
                    <h4 className="font-brand font-bold text-xl tracking-tight">{data.client}</h4>
                    <p className="text-indigo-200 text-xs uppercase tracking-widest mt-1">Strategic Proposal</p>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex justify-between items-end border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Vibe / Style</p>
                        <p className="text-sm font-medium text-foreground">{data.style}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Est. Total</p>
                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{data.total}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-800 rounded md:group-hover:opacity-100 transition-opacity"></div>
                    ))}
                </div>
                <p className="text-[10px] text-center text-muted-foreground">Includes moodboard, product list, and sustainability specs.</p>

                <button
                    onClick={handlePreview}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                    <DocumentTextIcon className="w-4 h-4" />
                    Preview & Export PDF
                </button>
            </div>
        </div>
    );
}
