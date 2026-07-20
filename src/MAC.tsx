import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { useTenant } from './TenantContext';
import { useDemo } from './context/DemoContext';
import InventoryMovements from './components/InventoryMovements';
import InventoryMaintenance from './components/InventoryMaintenance';
import MACRequests from './components/MACRequests';
import MACPunchList from './components/MACPunchList';
import {
    Squares2X2Icon,
    WrenchScrewdriverIcon,
    ArrowPathRoundedSquareIcon,
    ClipboardDocumentCheckIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    ClockIcon,
    CheckCircleIcon,
    ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

// Mock Utils if cn is not available globally
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface PageProps {
    onLogout: () => void;
    onNavigateToDetail: () => void;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: string) => void;
    /** When true (shared-block preview) unlocks idle-state richness that
     *  is normally gated on a demo tour step landing on this page. */
    previewMode?: boolean;
}

type MacTimePeriod = 'Day' | 'Week' | 'Month' | 'Quarter';

// --- Metrics Data by Period ---

const metricCardsByPeriod: Record<MacTimePeriod, { label: string; value: string; sub: string; trend: string; trendUp: boolean; color: string }[]> = {
    Day: [
        { label: 'Open Requests', value: '5', sub: 'Pending action', trend: '+2', trendUp: true, color: 'blue' },
        { label: 'Completed Today', value: '8', sub: 'Resolved items', trend: '+3', trendUp: true, color: 'green' },
        { label: 'Avg Response Time', value: '1.2h', sub: 'From submission', trend: '-0.3h', trendUp: true, color: 'purple' },
        { label: 'Cost Estimate', value: '$12K', sub: 'Active requests', trend: '+$2K', trendUp: false, color: 'amber' },
    ],
    Week: [
        { label: 'Open Requests', value: '14', sub: 'Pending action', trend: '+4', trendUp: true, color: 'blue' },
        { label: 'Completed', value: '28', sub: 'This week', trend: '+6', trendUp: true, color: 'green' },
        { label: 'Avg Response Time', value: '2.4h', sub: 'From submission', trend: '-0.8h', trendUp: true, color: 'purple' },
        { label: 'Cost Estimate', value: '$45K', sub: 'Active requests', trend: '+$8K', trendUp: false, color: 'amber' },
    ],
    Month: [
        { label: 'Open Requests', value: '22', sub: 'Pending action', trend: '-3', trendUp: true, color: 'blue' },
        { label: 'Completed', value: '89', sub: 'This month', trend: '+18', trendUp: true, color: 'green' },
        { label: 'Avg Response Time', value: '3.1h', sub: 'From submission', trend: '+0.2h', trendUp: false, color: 'purple' },
        { label: 'Cost Estimate', value: '$180K', sub: 'Active requests', trend: '+$22K', trendUp: false, color: 'amber' },
    ],
    Quarter: [
        { label: 'Open Requests', value: '18', sub: 'Pending action', trend: '-8', trendUp: true, color: 'blue' },
        { label: 'Completed', value: '312', sub: 'This quarter', trend: '+65', trendUp: true, color: 'green' },
        { label: 'Avg Response Time', value: '2.8h', sub: 'From submission', trend: '-0.5h', trendUp: true, color: 'purple' },
        { label: 'Cost Estimate', value: '$520K', sub: 'Active requests', trend: '+$45K', trendUp: false, color: 'amber' },
    ],
};

const requestVolumeByPeriod: Record<MacTimePeriod, { name: string; requests: number; completed: number }[]> = {
    Day: [
        { name: '8AM', requests: 2, completed: 1 }, { name: '10AM', requests: 5, completed: 3 },
        { name: '12PM', requests: 3, completed: 4 }, { name: '2PM', requests: 6, completed: 5 },
        { name: '4PM', requests: 4, completed: 6 }, { name: '6PM', requests: 1, completed: 2 },
    ],
    Week: [
        { name: 'Mon', requests: 8, completed: 5 }, { name: 'Tue', requests: 12, completed: 9 },
        { name: 'Wed', requests: 6, completed: 8 }, { name: 'Thu', requests: 10, completed: 7 },
        { name: 'Fri', requests: 5, completed: 4 },
    ],
    Month: [
        { name: 'W1', requests: 28, completed: 22 }, { name: 'W2', requests: 35, completed: 30 },
        { name: 'W3', requests: 22, completed: 25 }, { name: 'W4', requests: 30, completed: 28 },
    ],
    Quarter: [
        { name: 'Jan', requests: 95, completed: 88 }, { name: 'Feb', requests: 110, completed: 102 },
        { name: 'Mar', requests: 105, completed: 98 },
    ],
};

const categoryBreakdownByPeriod: Record<MacTimePeriod, { name: string; moves: number; adds: number; changes: number }[]> = {
    Day: [
        { name: 'Floor 1', moves: 1, adds: 0, changes: 2 }, { name: 'Floor 2', moves: 2, adds: 1, changes: 1 },
        { name: 'Floor 3', moves: 0, adds: 1, changes: 3 },
    ],
    Week: [
        { name: 'Floor 1', moves: 4, adds: 2, changes: 6 }, { name: 'Floor 2', moves: 6, adds: 3, changes: 4 },
        { name: 'Floor 3', moves: 3, adds: 4, changes: 8 }, { name: 'Floor 4', moves: 5, adds: 1, changes: 3 },
    ],
    Month: [
        { name: 'Floor 1', moves: 15, adds: 8, changes: 22 }, { name: 'Floor 2', moves: 22, adds: 12, changes: 18 },
        { name: 'Floor 3', moves: 10, adds: 15, changes: 28 }, { name: 'Floor 4', moves: 18, adds: 6, changes: 14 },
    ],
    Quarter: [
        { name: 'Floor 1', moves: 45, adds: 24, changes: 68 }, { name: 'Floor 2', moves: 62, adds: 35, changes: 52 },
        { name: 'Floor 3', moves: 30, adds: 42, changes: 85 }, { name: 'Floor 4', moves: 55, adds: 18, changes: 40 },
    ],
};

const trendLabels: Record<MacTimePeriod, string> = {
    Day: 'Today', Week: 'This Week', Month: 'This Month', Quarter: 'This Quarter',
};

const cardIcons = [
    <ClipboardDocumentCheckIcon className="w-5 h-5" />,
    <CheckCircleIcon className="w-5 h-5" />,
    <ClockIcon className="w-5 h-5" />,
    <CurrencyDollarIcon className="w-5 h-5" />,
];

const cardColorMap: Record<string, { bg: string; icon: string; text: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/10', icon: 'text-blue-600 dark:text-blue-400', text: 'text-blue-700 dark:text-blue-300' },
    green: { bg: 'bg-green-50 dark:bg-green-900/10', icon: 'text-green-600 dark:text-green-400', text: 'text-green-700 dark:text-green-300' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/10', icon: 'text-ai dark:text-purple-400', text: 'text-purple-700 dark:text-purple-300' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/10', icon: 'text-amber-600 dark:text-amber-400', text: 'text-amber-700 dark:text-amber-300' },
};

export default function MAC({ onLogout, onNavigateToDetail, onNavigateToWorkspace, onNavigate, previewMode = false }: PageProps) {
    const { currentTenant } = useTenant();
    const { currentStep, nextStep } = useDemo();
    // Preview default lands on Punch List so the richest step-3.x flow is
    // immediately visible; tour default stays on Requests as before.
    const [activeTab, setActiveTab] = useState<'movements' | 'maintenance' | 'requests' | 'punchlist' | 'metrics'>(
        previewMode ? 'punchlist' : 'requests'
    );
    const [highlightedTab, setHighlightedTab] = useState<string | null>(null);
    const [macTimePeriod, setMacTimePeriod] = useState<MacTimePeriod>('Month');

    // Auto-select tab based on step
    useEffect(() => {
        if (['1.5', '2.2', '2.5', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '4.1', '4.2', '4.3', '4.4'].includes(currentStep?.id)) {
            setActiveTab('punchlist');
        }
    }, [currentStep?.id]);

    useEffect(() => {
        const handleHighlight = (e: CustomEvent) => {
            if (e.detail === 'mac-punch-list') {
                setActiveTab('punchlist');
                setHighlightedTab('punchlist');
                setTimeout(() => setHighlightedTab(null), 4000);
            }
        };
        window.addEventListener('demo-highlight', handleHighlight as EventListener);
        return () => window.removeEventListener('demo-highlight', handleHighlight as EventListener);
    }, []);

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-10">
            <div className="pt-24 px-4 max-w-7xl mx-auto space-y-6">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-brand font-bold tracking-tight text-foreground">
                            {currentTenant} Service Center
                        </h1>
                        <p className="text-muted-foreground mt-1">Moves, Adds, Changes, and service request management.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl w-fit overflow-x-auto max-w-full border border-border">
                    {[
                        { id: 'requests', label: 'Requests', icon: ClipboardDocumentCheckIcon },
                        { id: 'movements', label: 'Movements', icon: ArrowPathRoundedSquareIcon },
                        { id: 'maintenance', label: 'Maintenance', icon: WrenchScrewdriverIcon },
                        { id: 'punchlist', label: 'Punch List', icon: ExclamationTriangleIcon },
                        { id: 'metrics', label: 'Metrics', icon: ChartBarIcon },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"
                                    : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-foreground",
                                highlightedTab === tab.id && "ring-4 ring-brand-500 shadow-[0_0_30px_rgba(var(--brand-500),0.6)] animate-pulse"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'punchlist' && <MACPunchList previewMode={previewMode} />}
                    {activeTab === 'movements' && <InventoryMovements />}
                    {activeTab === 'maintenance' && <InventoryMaintenance />}
                    {activeTab === 'requests' && <MACRequests />}

                    {/* Metrics Tab */}
                    {activeTab === 'metrics' && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            {/* Header + Period Selector */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-brand font-semibold text-foreground">Service Center Analytics — {trendLabels[macTimePeriod]}</h3>
                                    <p className="text-sm text-muted-foreground">Track request volume, response times, and costs</p>
                                </div>
                                <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 border border-border/50">
                                    {(['Day', 'Week', 'Month', 'Quarter'] as MacTimePeriod[]).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setMacTimePeriod(p)}
                                            className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${
                                                p === macTimePeriod
                                                    ? 'bg-white dark:bg-brand-400 text-foreground dark:text-zinc-900 shadow-sm border border-border dark:border-transparent'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-700'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {metricCardsByPeriod[macTimePeriod].map((card, idx) => {
                                    const colors = cardColorMap[card.color] || cardColorMap.blue;
                                    return (
                                        <div key={idx} className={`rounded-2xl p-6 border shadow-sm ${colors.bg} border-border/30`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <p className={`text-sm font-medium ${colors.icon}`}>{card.label}</p>
                                                <div className={colors.icon}>{cardIcons[idx]}</div>
                                            </div>
                                            <p className={`text-2xl font-bold ${colors.text}`}>{card.value}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={cn('text-xs font-semibold', card.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
                                                    {card.trendUp ? '↑' : '↓'} {card.trend}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">vs prev.</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">{card.sub}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Request Volume Chart */}
                                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                                    <h4 className="text-md font-medium text-foreground mb-4">Request Volume — {trendLabels[macTimePeriod]}</h4>
                                    <div className="h-[280px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={requestVolumeByPeriod[macTimePeriod]}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Legend />
                                                <Bar dataKey="requests" fill="#3B82F6" name="New Requests" radius={[4, 4, 0, 0]} animationDuration={600} />
                                                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} animationDuration={600} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Category Breakdown Chart */}
                                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                                    <h4 className="text-md font-medium text-foreground mb-4">MAC Category Breakdown — {trendLabels[macTimePeriod]}</h4>
                                    <div className="h-[280px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={categoryBreakdownByPeriod[macTimePeriod]}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Legend />
                                                <Bar dataKey="moves" stackId="a" fill="#6366f1" name="Moves" radius={[0, 0, 4, 4]} animationDuration={600} />
                                                <Bar dataKey="adds" stackId="a" fill="#f59e0b" name="Adds" animationDuration={600} />
                                                <Bar dataKey="changes" stackId="a" fill="#14b8a6" name="Changes" radius={[4, 4, 0, 0]} animationDuration={600} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
