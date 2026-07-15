import { useState } from 'react';
import { X } from 'lucide-react';

const EXISTING_SYSTEMS = [
    { name: 'RCP Core', icon: '🏢', desc: 'ERP / System of Record' },
    { name: 'eManage ONE', icon: '📦', desc: 'EDI / Acknowledgments' },
    { name: 'QuickBooks', icon: '💰', desc: 'Accounting / Invoicing' },
    { name: 'Email / Outlook', icon: '📧', desc: 'RFQs / Communications' },
];

const AI_AGENTS = [
    { name: 'Extraction', color: 'bg-success' },
    { name: 'Normalizer', color: 'bg-green-500' },
    { name: 'Validator', color: 'bg-blue-500' },
    { name: 'QuoteBuilder', color: 'bg-ai' },
    { name: 'DeltaEngine', color: 'bg-red-500' },
    { name: 'ApprovalAgent', color: 'bg-amber-500' },
    { name: 'ERPConnector', color: 'bg-cyan-500' },
    { name: 'ServiceRecord', color: 'bg-pink-500' },
    { name: 'ProjectCreation', color: 'bg-indigo-500' },
];

const OUTCOMES = [
    { label: 'Better Quotes', icon: '📋', detail: '35% margin accuracy' },
    { label: 'Faster Acks', icon: '⚡', detail: '50→2 items in seconds' },
    { label: 'Consistent Reports', icon: '📊', detail: '100% format guarantee' },
    { label: 'Zero Re-Entry', icon: '🎯', detail: '847 entries eliminated' },
];

const COPILOT_MOCKUPS = [
    {
        platform: 'Outlook',
        icon: '📧',
        color: 'bg-blue-600',
        title: 'Copilot for Outlook',
        message: 'I found 3 vendor quotes attached. Extract and normalize to SIF?',
        actions: ['Extract All', 'Preview First'],
    },
    {
        platform: 'Teams',
        icon: '💬',
        color: 'bg-purple-600',
        title: 'Copilot for Teams',
        message: 'ACK AIS-2055: 47/50 matched, 3 need review → Open Expert Hub',
        actions: ['Open Expert Hub', 'View Summary'],
    },
    {
        platform: 'Excel',
        icon: '📊',
        color: 'bg-green-600',
        title: 'Copilot for Excel',
        message: 'Weekly backlog auto-generated from SIF. 5 suppliers, $113K total.',
        actions: ['Download Report', 'View Trends'],
    },
];

interface StrataArchitectureSlideProps {
    open: boolean;
    onClose: () => void;
}

export default function StrataArchitectureSlide({ open, onClose }: StrataArchitectureSlideProps) {
    const [activeTab, setActiveTab] = useState<'architecture' | 'copilot'>('architecture');

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
            <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-5 sm:p-6" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                    <X size={16} />
                </button>

                {/* Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border w-fit mb-5">
                    <button
                        onClick={() => setActiveTab('architecture')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'architecture' ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Architecture
                    </button>
                    <button
                        onClick={() => setActiveTab('copilot')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'copilot' ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Copilot Integration
                    </button>
                </div>

                {activeTab === 'architecture' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {/* Title */}
                        <div className="text-center">
                            <h2 className="text-base font-bold text-foreground">Strata AI Layer</h2>
                            <p className="text-xs text-muted-foreground">Your systems stay. Strata accelerates.</p>
                        </div>

                        {/* Tier 1: Existing Systems */}
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 text-center">Your Existing Systems</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {EXISTING_SYSTEMS.map(sys => (
                                    <div key={sys.name} className="p-2.5 rounded-xl border border-border bg-muted/30 text-center">
                                        <span className="text-xl">{sys.icon}</span>
                                        <p className="text-[11px] font-bold text-foreground mt-0.5">{sys.name}</p>
                                        <p className="text-[9px] text-muted-foreground">{sys.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Arrows down */}
                        <div className="flex items-center justify-center gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <svg key={i} className="w-4 h-4 text-muted-foreground/40 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
                            ))}
                        </div>

                        {/* Tier 2: Strata AI Layer */}
                        <div className="relative p-3 rounded-xl border-2 border-primary/30 bg-primary/5">
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                                STRATA AI LAYER
                            </div>
                            <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5 mt-1">
                                {AI_AGENTS.map(agent => (
                                    <div key={agent.name} className="flex flex-col items-center gap-0.5">
                                        <div className={`w-7 h-7 rounded-lg ${agent.color} flex items-center justify-center`}>
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
                                        </div>
                                        <span className="text-[7px] font-medium text-muted-foreground text-center leading-tight">{agent.name}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[9px] text-center text-muted-foreground mt-2">9 specialized agents · Deterministic pipelines · Zero data re-entry</p>
                        </div>

                        {/* Arrows down */}
                        <div className="flex items-center justify-center gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <svg key={i} className="w-4 h-4 text-primary/40 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
                            ))}
                        </div>

                        {/* Tier 3: Enhanced Outcomes */}
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 text-center">Enhanced Outcomes</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {OUTCOMES.map(out => (
                                    <div key={out.label} className="p-2.5 rounded-xl border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10 text-center">
                                        <span className="text-xl">{out.icon}</span>
                                        <p className="text-[11px] font-bold text-foreground mt-0.5">{out.label}</p>
                                        <p className="text-[9px] text-green-600 dark:text-green-400 font-medium">{out.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tagline */}
                        <div className="text-center pt-2 border-t border-border">
                            <p className="text-xs font-bold text-foreground">Core stays. Strata accelerates.</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">No system replacement · No data migration · Immediate value</p>
                        </div>
                    </div>
                )}

                {activeTab === 'copilot' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="text-center">
                            <h2 className="text-base font-bold text-foreground">Microsoft Copilot Integration</h2>
                            <p className="text-xs text-muted-foreground">Strata lives inside your existing tools — no new software to learn</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {COPILOT_MOCKUPS.map((mock, i) => (
                                <div key={mock.platform} className="rounded-xl border border-border bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: `${i * 200}ms` }}>
                                    <div className={`${mock.color} px-3 py-1.5 flex items-center gap-2`}>
                                        <span className="text-white text-sm">{mock.icon}</span>
                                        <span className="text-white text-[10px] font-bold">{mock.title}</span>
                                    </div>
                                    <div className="p-3">
                                        <div className="flex items-start gap-2 mb-2">
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                                <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                                            </div>
                                            <p className="text-[10px] text-foreground leading-relaxed">{mock.message}</p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {mock.actions.map((action, j) => (
                                                <button key={action} disabled className={`px-2 py-0.5 text-[9px] font-medium rounded-md ${j === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border border-border'}`}>
                                                    {action}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center pt-2 border-t border-border">
                            <p className="text-xs font-bold text-foreground">Not another tool — a layer inside your tools</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">Outlook · Teams · Excel · Edge — Strata works where you already work</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
