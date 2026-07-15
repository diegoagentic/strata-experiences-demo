import React from 'react';
import { ShieldCheckIcon, BoltIcon } from '@heroicons/react/24/outline';
import { useGenUI } from '../../../context/GenUIContext';

export default function AnalysisReportArtifact({ data }: { data: any }) {
    const { sendMessage } = useGenUI();

    // Fallback safely if data is incomplete. Simulating 40 total items (35 validated + 5 attention)
    const stats = data?.stats || { validated: 35, attention: 5, totalValue: 275000 };
    const issues = data?.issues || { header: 1, rules: 1 };
    const totalIssues = issues.header + issues.rules + stats.attention;

    return (
        <div className="bg-muted dark:bg-zinc-800 p-6 rounded-2xl border border-border w-[600px] animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-brand text-foreground mb-2">Analysis Complete</h2>
                <p className="text-sm text-muted-foreground">The AI has analyzed your document and found items requiring attention.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Context & Rules Card */}
                <div className="bg-card p-4 rounded-xl border border-border relative overflow-hidden group hover:border-amber-200 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl -mr-8 -mt-8"></div>
                    <h3 className="font-bold flex items-center gap-2 mb-3 relative z-10 text-sm">
                        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                            <ShieldCheckIcon className="w-4 h-4" />
                        </div>
                        Context & Rules
                    </h3>
                    <div className="space-y-2 relative z-10">
                        <div className="flex justify-between items-center bg-muted dark:bg-zinc-800/50 p-2 rounded-lg text-xs">
                            <span className="font-medium">Header Discrepancies</span>
                            <span className={`px-2 py-0.5 rounded-full font-bold ${issues.header > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {issues.header} Issues
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-muted dark:bg-zinc-800/50 p-2 rounded-lg text-xs">
                            <span className="font-medium">Business Alerts</span>
                            <span className={`px-2 py-0.5 rounded-full font-bold ${issues.rules > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                {issues.rules} Alerts
                            </span>
                        </div>
                    </div>
                </div>

                {/* Line Items Card */}
                <div className="bg-card p-4 rounded-xl border border-border relative overflow-hidden group hover:border-blue-200 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -mr-8 -mt-8"></div>
                    <h3 className="font-bold flex items-center gap-2 mb-3 relative z-10 text-sm">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <BoltIcon className="w-4 h-4" />
                        </div>
                        Line Items
                    </h3>
                    <div className="space-y-2 relative z-10">
                        <div className="flex justify-between items-center bg-muted dark:bg-zinc-800/50 p-2 rounded-lg text-xs">
                            <span className="font-medium">Matches</span>
                            <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full font-bold">
                                {stats.validated} Formatted
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-muted dark:bg-zinc-800/50 p-2 rounded-lg text-xs">
                            <span className="font-medium">Verify</span>
                            <span className={`px-2 py-0.5 rounded-full font-bold ${stats.attention > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                {stats.attention} Review
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={() => {
                        sendMessage("Resolve Issues", 'user');
                    }}
                    className="w-full py-3 bg-amber-500 text-amber-950 font-bold rounded-xl shadow-sm hover:bg-amber-400 transition-colors"
                >
                    Resolve {totalIssues} Issues to Proceed
                </button>
            </div>
        </div>
    );
}
