import React, { useState } from 'react';
import AssignTeamModal from './AssignTeamModal';
import TrackingModal, { type TrackingStep } from './TrackingModal';
import {
    MapPinIcon,
    ArrowRightIcon,
    CalendarIcon,
    UserIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    TruckIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Chart Colors
const COLORS = ['#84cc16', '#3b82f6', 'bg-amber-500', '#ef4444']; // Lime, Blue, Amber, Red

export interface MovementRequest {
    id: string;
    assetName: string;
    assetType: string;
    fromLocation: string;
    toLocation: string;
    status: 'Ordered' | 'Assigned' | 'Scheduled' | 'In-Progress' | 'Completed';
    priority: 'Low' | 'Medium' | 'High';
    requestDate: string;
    scheduledDate?: string;
    assignedTeam?: string;
    requestedBy: string;
    notes?: string;
    trackingId?: string;
    // Mock Data for Viz
    costData?: { name: string; value: number }[];
    slaData?: { name: string; actual: number; target: number }[];
    historyData?: { month: string; moves: number }[];
    trackingSteps?: TrackingStep[];
}

const INITIAL_MOVEMENTS: MovementRequest[] = [
    {
        id: '1',
        assetName: 'Executive Desk',
        assetType: 'Furniture',
        fromLocation: 'Main Office - Floor 2',
        toLocation: 'Office Renovation',
        status: 'Ordered',
        priority: 'High',
        requestDate: '2/2/2026',
        requestedBy: 'Employee Alpha',
        notes: 'Asset relocation from inventory - Executive Desk (Furniture)',
        trackingId: 'TRK-2026-001',
        costData: [
            { name: 'Labor', value: 450 },
            { name: 'Logistics', value: 150 },
            { name: 'Downtime', value: 300 },
        ],
        slaData: [
            { name: 'Response', actual: 2, target: 4 },
            { name: 'Approval', actual: 5, target: 24 },
            { name: 'Execution', actual: 0, target: 48 },
        ],
        historyData: [
            { month: 'Jan', moves: 0 }, { month: 'Feb', moves: 1 }, { month: 'Mar', moves: 0 },
            { month: 'Apr', moves: 0 }, { month: 'May', moves: 0 }, { month: 'Jun', moves: 1 }
        ],
        trackingSteps: [
            {
                id: 's1',
                title: 'PO received',
                status: 'completed',
                timestamp: '2/2/2026 09:30 AM',
                actor: 'System',
                description: 'Order created and logged.',
                evidence: [
                    { type: 'photo', url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=200', label: 'Initial Request Photo' }
                ]
            },
            {
                id: 's2',
                title: 'Team Assigned',
                status: 'current',
                timestamp: '2/2/2026 10:15 AM',
                actor: 'Dispatch',
                description: 'Waiting for team acceptance.'
            },
            { id: 's3', title: 'Pickup', status: 'upcoming', description: 'Schedule pickup from Floor 2.' },
            { id: 's4', title: 'Delivery', status: 'upcoming', description: 'Transport to Renovation zone.' }
        ]
    },
    {
        id: '4', // Using ID 4 as example for In-Progress
        assetName: 'Executive Office Chair',
        assetType: 'Furniture',
        fromLocation: 'Main Warehouse',
        toLocation: 'Floor 4 Office',
        status: 'In-Progress',
        priority: 'Medium',
        requestDate: '30/1/2026',
        scheduledDate: '5/2/2026 at 13:52:13',
        assignedTeam: 'Team Delta',
        requestedBy: 'Lisa Davis',
        notes: 'Asset relocation from inventory - Executive Office Chair (Furniture)',
        trackingId: 'TRK-2026-004',
        costData: [
            { name: 'Labor', value: 180 },
            { name: 'Logistics', value: 100 },
            { name: 'Downtime', value: 100 },
        ],
        slaData: [
            { name: 'Response', actual: 5, target: 4 }, // Late
            { name: 'Approval', actual: 20, target: 24 },
            { name: 'Execution', actual: 36, target: 48 },
        ],
        historyData: [
            { month: 'Jan', moves: 0 }, { month: 'Feb', moves: 1 }, { month: 'Mar', moves: 0 },
            { month: 'Apr', moves: 0 }, { month: 'May', moves: 0 }, { month: 'Jun', moves: 0 }
        ],
        trackingSteps: [
            { id: 't1', title: 'PO received', status: 'completed', timestamp: '30/1/2026 08:00 AM', actor: 'System' },
            { id: 't2', title: 'Team Assigned', status: 'completed', timestamp: '30/1/2026 09:15 AM', actor: 'Dispatch' },
            {
                id: 't3',
                title: 'Item Picked Up',
                status: 'completed',
                timestamp: '05/2/2026 01:30 PM',
                location: 'Main Warehouse',
                actor: 'Team Delta',
                evidence: [
                    { type: 'photo', url: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=200', label: 'Item Condition Pre-Move' },
                    { type: 'note', label: 'Notes', content: 'Item has minor scratch on left armrest.' }
                ]
            },
            {
                id: 't4',
                title: 'In Transit',
                status: 'current',
                timestamp: '05/2/2026 01:45 PM',
                description: 'Vehicle en route to Floor 4.'
            },
            { id: 't5', title: 'Delivery & Setup', status: 'upcoming' }
        ]
    }
];

export default function InventoryMovements() {
    const [movements, setMovements] = useState<MovementRequest[]>(INITIAL_MOVEMENTS);
    const [selectedMovement, setSelectedMovement] = useState<MovementRequest | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Tracking Modal State
    const [trackingItem, setTrackingItem] = useState<MovementRequest | null>(null);
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    const handleAssignClick = (movement: MovementRequest, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedMovement(movement);
        setIsAssignModalOpen(true);
    };

    const handleTrackClick = (movement: MovementRequest) => {
        setTrackingItem(movement);
        setIsTrackingModalOpen(true);
    }

    const handleAssignConfirm = (updatedData: any) => {
        setMovements(prev => prev.map(m => m.id === updatedData.id ? updatedData : m));
        setIsAssignModalOpen(false);
    };

    // Helper for Status Look & Feel
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Ordered': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50';
            case 'Assigned': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50';
            case 'Scheduled': return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700/50';
            case 'In-Progress': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700/50';
            case 'Completed': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50';
            default: return 'bg-zinc-100 text-muted-foreground border-zinc-200';
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'High': return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30';
            case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30';
            case 'Low': return 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Ordered': return <ClockIcon className="w-3 h-3" />;
            case 'Assigned': return <UserIcon className="w-3 h-3" />;
            case 'Scheduled': return <CalendarIcon className="w-3 h-3" />;
            case 'In-Progress': return <TruckIcon className="w-3 h-3" />;
            case 'Completed': return <CheckCircleIcon className="w-3 h-3" />;
            default: return <ClockIcon className="w-3 h-3" />;
        }
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Legend */}
            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-3 flex items-start gap-3">
                <ExclamationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    Click on any movement card to view detailed analytics, cost breakdown, and SLA tracking for Product Owners.
                </p>
            </div>

            <div className="space-y-4">
                {movements.map((move) => (
                    <div
                        key={move.id}
                        onClick={() => toggleExpand(move.id)}
                        className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                                {/* Left Content */}
                                <div className="space-y-4 flex-1">
                                    {/* Title Row */}
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-lg text-foreground">{move.assetName}</h3>
                                        {move.trackingId && (
                                            <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                                                {move.trackingId}
                                            </span>
                                        )}
                                        <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", getStatusStyle(move.status))}>
                                            {getStatusIcon(move.status)}
                                            {move.status}
                                        </span>
                                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", getPriorityStyle(move.priority))}>
                                            {move.priority}
                                        </span>
                                    </div>

                                    {/* From -> To Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">From</p>
                                            <div className="flex items-center gap-2 text-sm text-foreground">
                                                <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">{move.fromLocation}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">To</p>
                                            <div className="flex items-center gap-2 text-sm text-foreground">
                                                <ArrowRightIcon className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">{move.toLocation}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Row */}
                                    <div className="space-y-2">
                                        {move.assignedTeam && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted-foreground">Assigned Team:</span>
                                                <span className="font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">{move.assignedTeam}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Meta & Actions */}
                                <div className="flex flex-col items-end justify-between gap-4 border-l border-zinc-100 dark:border-zinc-800/50 lg:pl-6 pl-0 border-l-0 lg:border-l">
                                    <div className="text-right space-y-1">
                                        <p className="text-xs text-muted-foreground">Order Date: <span className="font-medium text-foreground">{move.requestDate}</span></p>
                                        <p className="text-xs text-muted-foreground">By: <span className="font-medium text-foreground">{move.requestedBy}</span></p>
                                    </div>

                                    <div className="flex items-center gap-2 w-full lg:w-auto">
                                        <button
                                            onClick={(e) => handleAssignClick(move, e)}
                                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
                                            <UserIcon className="w-4 h-4" />
                                            {move.assignedTeam ? 'Reassign' : 'Assign'}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleTrackClick(move); }}
                                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-background border border-border text-foreground rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                                            Track Progress
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Analytics View */}
                        {expandedIds.has(move.id) && (
                            <div className="border-t border-border bg-muted/30 p-6 animate-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                    {/* Cost Breakdown */}
                                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                                                <CurrencyDollarIcon className="w-4 h-4" />
                                            </div>
                                            <h4 className="text-sm font-semibold text-foreground">Est. Cost Breakdown</h4>
                                        </div>
                                        <div className="h-48">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={move.costData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={40}
                                                        outerRadius={60}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {move.costData?.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex justify-center gap-4 text-xs mt-2">
                                            {move.costData?.map((entry, index) => (
                                                <div key={index} className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                    <span className="text-muted-foreground">{entry.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* SLA Performance */}
                                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                                <ClockIcon className="w-4 h-4" />
                                            </div>
                                            <h4 className="text-sm font-semibold text-foreground">SLA Performance (Hrs)</h4>
                                        </div>
                                        <div className="h-48 text-xs">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={move.slaData} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                                                    <XAxis type="number" hide />
                                                    <YAxis dataKey="name" type="category" width={60} axisLine={false} tickLine={false} />
                                                    <Tooltip
                                                        cursor={{ fill: 'transparent' }}
                                                        contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                                    />
                                                    <Bar dataKey="actual" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Actual Time" barSize={12} />
                                                    <Bar dataKey="target" fill="#e4e4e7" radius={[0, 4, 4, 0]} name="Target SLA" barSize={12} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="text-center mt-2">
                                            <span className="text-xs text-muted-foreground">Target vs Actual Hours</span>
                                        </div>
                                    </div>

                                    {/* Asset History */}
                                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                                <PresentationChartLineIcon className="w-4 h-4" />
                                            </div>
                                            <h4 className="text-sm font-semibold text-foreground">Movement History (6 Mo)</h4>
                                        </div>
                                        <div className="h-48 text-xs">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={move.historyData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                                    <YAxis axisLine={false} tickLine={false} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                                    />
                                                    <Line type="monotone" dataKey="moves" stroke="bg-indigo-500" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="text-center mt-2">
                                            <span className="text-xs text-muted-foreground">Frequency of relocations</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <AssignTeamModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onConfirm={handleAssignConfirm}
                item={selectedMovement}
                type="movement"
            />

            {trackingItem && (
                <TrackingModal
                    isOpen={isTrackingModalOpen}
                    onClose={() => setIsTrackingModalOpen(false)}
                    title={trackingItem.assetName}
                    trackingId={trackingItem.trackingId}
                    type="movement"
                    steps={trackingItem.trackingSteps || []}
                />
            )}
        </div>
    );
}
