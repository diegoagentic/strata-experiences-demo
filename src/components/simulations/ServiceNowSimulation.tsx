import React from 'react';
import {
    Columns,
    Plus,
    Search,
    Settings,
    Bell,
    User,
    Home,
    FileText,
    Clock,
    Briefcase,
    HelpCircle,
    ChevronRight,
    Shield,
    Activity,
    Filter,
    Globe,
    Inbox,
    LayoutDashboard,
    Zap,
    Camera,
    ScanLine
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useDemo } from '../../context/DemoContext';
import LiabilityAnalysisPanel from '../widgets/LiabilityAnalysisPanel';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function ServiceNowSimulation() {
    const { currentStep } = useDemo();
    const incidents = [
        { id: 'INC-1102', description: 'New Moving Request: Regional Office West', priority: '1 - Critical', state: 'New', category: 'Facilities', caller: 'Marketplace AI', updated: '2m ago' },
        { id: 'INC-1098', description: 'VPN Connectivity Issues - Dallas Site', priority: '2 - High', state: 'Assigned', category: 'Network', caller: 'Jane Smith', updated: '1h ago' },
        { id: 'INC-1085', description: 'Email Sync Failure on Mobile', priority: '3 - Moderate', state: 'Work in Progress', category: 'Software', caller: 'Bob Wilson', updated: '3h ago' },
    ];

    return (
        <div className="flex flex-col bg-[#f3f4f5] text-[#1a1c1d] font-sans h-full overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
                {/* Polaris Sidebar */}
                <aside className="w-60 bg-[#1a1c1d] flex flex-col pt-4 shrink-0">
                    <div className="px-4 mb-6">
                        <div className="flex items-center gap-2 text-white/90">
                            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                                <Zap size={14} className="text-white" />
                            </div>
                            <span className="text-sm font-bold tracking-tight">ServiceNow</span>
                        </div>
                    </div>

                    <div className="px-4 space-y-4 mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                            <input
                                type="text"
                                placeholder="Filter navigator"
                                className="w-full bg-[#1e2f30] border-none rounded py-1.5 pl-9 pr-3 text-xs focus:outline-none placeholder:text-muted-foreground italic text-white"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 border border-white/10 rounded hover:bg-white/5 transition-colors text-white/70">
                                <Columns size={16} />
                            </button>
                            <button className="flex-1 bg-primary text-white px-3 py-2 rounded font-bold text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                                <Plus size={14} /> New Incident
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 space-y-1">
                        {[
                            { icon: Home, label: 'Service Portal' },
                            { icon: Activity, label: 'Dashboards' },
                            { icon: Inbox, label: 'My Work', count: '12' },
                            { icon: Shield, label: 'Security Workspace' },
                            { icon: LayoutDashboard, label: 'CMDB View' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded text-white/60 hover:bg-white/5 cursor-pointer text-xs">
                                <item.icon size={14} />
                                <span className="flex-1">{item.label}</span>
                                {item.count && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white">{item.count}</span>}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-2 text-xs">
                        <Filter size={12} className="text-[#278efc]" />
                        <span className="font-bold text-[#278efc]">All</span>
                        <ChevronRight size={12} className="text-muted-foreground" />
                        <span className="text-muted-foreground">Active is true</span>
                    </div>

                    <div className="flex-1 overflow-auto p-4 bg-gray-50/50">
                        {/* Data List container */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-w-fit">
                            <div className="h-10 border-b border-gray-100 flex items-center px-4 justify-between bg-gray-50/30">
                                <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-muted-foreground">
                                        <div className="w-3.5 h-3.5 border border-gray-300 rounded-[2px]" />
                                        Select All
                                    </div>
                                    <span className="cursor-pointer hover:text-muted-foreground">Column Actions</span>
                                </div>
                                <div className="text-[10px] font-medium text-muted-foreground tabular-nums">1 - 3 of 152</div>
                            </div>

                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="p-3 w-12 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <div className="w-4 h-4 mx-auto border border-gray-300 rounded-[2px]" />
                                        </th>
                                        <th className="p-3 w-32 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-r border-gray-100">Number</th>
                                        <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-r border-gray-100">Short Description</th>
                                        <th className="p-3 w-32 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-r border-gray-100">Priority</th>
                                        <th className="p-3 w-32 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-r border-gray-100">State</th>
                                        <th className="p-3 w-32 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-r border-gray-100">Category</th>
                                        <th className="p-3 w-40 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Caller</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {incidents.map((inc) => (
                                        <tr key={inc.id} id={inc.id === 'INC-1102' ? "sn-request-detail" : ""} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                                            <td className="p-3 text-center">
                                                <div className="w-4 h-4 mx-auto border border-gray-300 rounded-[2px] group-hover:border-[#278efc]" />
                                            </td>
                                            <td className="p-3">
                                                <span className="text-sm font-bold text-[#278efc] hover:underline">{inc.id}</span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-medium text-foreground truncate">{inc.description}</span>
                                                    <span className="text-[10px] text-muted-foreground">Updated {inc.updated}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        inc.priority.includes('1') ? 'bg-red-500 animate-pulse' : inc.priority.includes('2') ? 'bg-orange-500' : 'bg-green-500'
                                                    )} />
                                                    <span className="text-[11px] font-bold text-foreground">{inc.priority}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                    inc.state === 'New' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                )}>
                                                    {inc.state}
                                                </span>
                                            </td>
                                            <td className="p-3 text-[11px] font-medium text-muted-foreground uppercase">{inc.category}</td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                        {inc.caller[0]}
                                                    </div>
                                                    <span className="text-xs font-bold text-foreground truncate">{inc.caller}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Placeholder rows */}
                                    {[...Array(8)].map((_, i) => (
                                        <tr key={i} className="border-b border-gray-50 opacity-20">
                                            <td className="p-3" colSpan={7}>&nbsp;</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Step 3.5: Warranty Claim Section */}
                    {currentStep?.id === '3.5' && (
                        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-foreground">Warranty Claim — WC-2026-0042</h3>
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded">Pending Review</span>
                                </div>

                                {/* Evidence Photos */}
                                <div className="mb-4">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Evidence Photos</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Front panel crack', 'Serial label', 'Packaging damage'].map((label, i) => (
                                            <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col items-center gap-2">
                                                <Camera size={24} className="text-muted-foreground" />
                                                <span className="text-[10px] font-medium text-muted-foreground text-center">{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* OCR Extraction Results */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ScanLine size={14} className="text-blue-500" />
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">OCR Extraction Results</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'Serial Number', value: 'SN-2025-88712' },
                                            { label: 'Model', value: 'Aeron Remastered Size B' },
                                            { label: 'Damage Type', value: 'Structural — Front Panel Crack' },
                                        ].map((item, i) => (
                                            <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">{item.label}</p>
                                                <p className="text-xs font-bold text-foreground">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Liability Analysis */}
                                <LiabilityAnalysisPanel
                                    carrierLiability={65}
                                    mfgLiability={35}
                                    reasoning="Based on photo evidence analysis: front panel crack pattern is consistent with impact damage during transit (65% carrier). However, packaging analysis shows insufficient foam padding around front panel area, suggesting partial manufacturer responsibility (35%). Serial number SN-2025-88712 confirms unit is within 2-year warranty period."
                                />

                                {/* Submit */}
                                <div className="mt-4 flex justify-end">
                                    <button className="px-6 py-2.5 bg-[#293e40] hover:bg-[#1a2e30] text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                                        Submit Warranty Claim
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* ServiceNow Bottom Bar */}
            <footer className="h-6 bg-[#293e40] text-muted-foreground text-[9px] flex items-center px-4 justify-between border-t border-white/5 font-medium uppercase tracking-widest shrink-0">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> wellsfargo.service-now.com</span>
                    <span className="opacity-40">|</span>
                    <span>Node: app121.sea1</span>
                </div>
                <div className="flex gap-4 items-center">
                    <span>v.VANCOUVER-08-2025</span>
                    <div className="h-3 w-px bg-white/10"></div>
                    <span className="text-green-400 font-black">Sync: 100% Functional</span>
                </div>
            </footer>
        </div>
    );
}

