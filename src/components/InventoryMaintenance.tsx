import React, { useState } from 'react';
import AssignTeamModal from './AssignTeamModal';
import TrackingModal, { type TrackingStep } from './TrackingModal';
import {
    WrenchScrewdriverIcon,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ClipboardDocumentCheckIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    UserCircleIcon,
    CurrencyDollarIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export interface MaintenanceHistoryEvent {
    id: string;
    date: string;
    action: string;
    technician: string;
    cost: string;
    notes: string;
    type: 'Repair' | 'Replacement' | 'Inspection';
}

export interface MaintenanceTask {
    id: string;
    assetName: string;
    issueType: string;
    description: string;
    status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Overdue';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    provider: string;
    scheduledDate: string;
    costEstimate?: string;
    trackingId?: string;
    assignedTeam?: string;
    history?: MaintenanceHistoryEvent[];
    trackingSteps?: TrackingStep[];
}

const INITIAL_MAINTENANCE: MaintenanceTask[] = [
    {
        id: '1',
        assetName: 'LED Desk Lamp',
        issueType: 'Electrical Repair',
        description: 'Flickering light, needs ballast replacement',
        status: 'In-Progress',
        priority: 'Medium',
        provider: 'BrightLights Services',
        scheduledDate: '2/2/2026',
        costEstimate: '$45.00',
        trackingId: 'MNT-2026-001',
        history: [
            { id: 'h1', date: '2/2/2026', action: 'Diagnostics run', technician: 'Mike T.', cost: '$0.00', notes: 'Confirmed ballast failure.', type: 'Inspection' },
            { id: 'h2', date: '15/1/2025', action: 'Bulb Replacement', technician: 'Sarah L.', cost: '$12.00', notes: 'Routine replacement.', type: 'Replacement' }
        ],
        trackingSteps: [
            { id: 'm1', title: 'Ticket Created', status: 'completed', timestamp: '1/2/2026 10:00 AM', actor: 'Portal' },
            { id: 'm2', title: 'Assigned to Tech', status: 'completed', timestamp: '1/2/2026 11:30 AM', actor: 'Dispatch', description: 'Assigned to Mike T.' },
            {
                id: 'm3', title: 'On-Site Diagnostics',
                status: 'completed',
                timestamp: '2/2/2026 09:00 AM',
                actor: 'Mike T.',
                evidence: [
                    { type: 'photo', url: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?auto=format&fit=crop&q=80&w=200', label: 'Faulty Ballast' },
                    { type: 'note', label: 'Tech Notes', content: 'Ballast is overheating. Needs replacement.' }
                ]
            },
            { id: 'm4', title: 'Parts Ordered', status: 'current', timestamp: '2/2/2026 10:00 AM', description: 'Waiting for Ballast Model X-200' },
            { id: 'm5', title: 'Repair Completion', status: 'upcoming' }
        ]
    },
    {
        id: '2',
        assetName: 'Standing Desk (Motorized)',
        issueType: 'Mechanical Inspection',
        description: 'Motor making grinding noise when lifting',
        status: 'Overdue',
        priority: 'High',
        provider: 'OfficeFix Pro',
        scheduledDate: '28/1/2026',
        costEstimate: '$120.00',
        trackingId: 'MNT-2026-002',
        history: [
            { id: 'h3', date: '20/1/2026', action: 'User Report', technician: 'System', cost: '$0.00', notes: 'Ticket created via portal.', type: 'Inspection' },
            { id: 'h4', date: '10/6/2024', action: 'Assembly', technician: 'Vendor', cost: '$0.00', notes: 'Initial installation.', type: 'Inspection' }
        ],
        trackingSteps: [
            { id: 'd1', title: 'Ticket Created', status: 'completed', timestamp: '20/1/2026', actor: 'User' },
            { id: 'd2', title: 'Scheduled', status: 'completed', timestamp: '21/1/2026', actor: 'Dispatch' },
            { id: 'd3', title: 'Pending Vendor', status: 'current', description: 'Vendor is delayed.' }
        ]
    },
    {
        id: '3',
        assetName: 'HVAC Unit #4',
        issueType: 'Preventative Maintenance',
        description: 'Quarterly filter change and system check',
        status: 'Scheduled',
        priority: 'Low',
        provider: 'CoolAir Systems',
        scheduledDate: '10/2/2026',
        costEstimate: '$250.00',
        trackingId: 'MNT-2026-003',
        history: [
            { id: 'h5', date: '10/11/2025', action: 'Filter Change', technician: 'CoolAir', cost: '$200.00', notes: 'Q3 Maintenance completed.', type: 'Replacement' },
            { id: 'h6', date: '10/8/2025', action: 'Filter Change', technician: 'CoolAir', cost: '$200.00', notes: 'Q2 Maintenance completed.', type: 'Replacement' }
        ]
    }
];

export default function InventoryMaintenance() {
    const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(INITIAL_MAINTENANCE);
    const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Tracking State
    const [trackingItem, setTrackingItem] = useState<MaintenanceTask | null>(null);
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

    const handleAssignClick = (task: MaintenanceTask, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedTask(task);
        setIsAssignModalOpen(true);
    };

    const handleTrackClick = (task: MaintenanceTask) => {
        setTrackingItem(task);
        setIsTrackingModalOpen(true);
    }

    const handleAssignConfirm = (updatedData: any) => {
        setMaintenanceTasks(prev => prev.map(t => t.id === updatedData.id ? updatedData : t));
        setIsAssignModalOpen(false);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
            case 'In-Progress': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Completed': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400';
            case 'Overdue': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-muted text-muted-foreground border-zinc-200';
        }
    };

    const getPriorityIcon = (priority: string) => {
        if (priority === 'High' || priority === 'Critical') return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
        return <WrenchScrewdriverIcon className="w-4 h-4 text-muted-foreground" />;
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Legend/Info (Optional) */}
            <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-lg p-3 flex items-start gap-3">
                <WrenchScrewdriverIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                    Track asset repairs and maintenance costs. Expand any card to view the full service history and audit trail.
                </p>
            </div>

            {maintenanceTasks.map((task) => (
                <div
                    key={task.id}
                    onClick={() => toggleExpand(task.id)}
                    className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-lg text-foreground">{task.assetName}</h3>
                                    {task.trackingId && (
                                        <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                                            {task.trackingId}
                                        </span>
                                    )}
                                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border", getStatusStyle(task.status))}>
                                        {task.status}
                                    </span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        {getPriorityIcon(task.priority)}
                                        {task.issueType}
                                    </span>
                                </div>

                                <p className="text-sm text-foreground">{task.description}</p>

                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>{task.scheduledDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <WrenchScrewdriverIcon className="w-4 h-4" />
                                        <span>{task.provider}</span>
                                        {task.assignedTeam && <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded ml-1">Assigned: {task.assignedTeam}</span>}
                                    </div>
                                    {task.costEstimate && (
                                        <div className="font-medium text-foreground">
                                            Est: {task.costEstimate}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    className="px-4 py-2 bg-background border border-border text-foreground rounded-lg text-sm font-medium hover:bg-accent transition-colors flex items-center gap-2"
                                >
                                    View History
                                    {expandedIds.has(task.id) ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleTrackClick(task); }}
                                    className="px-4 py-2 bg-background border border-border text-foreground rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                                    Track Progress
                                </button>
                                <button
                                    onClick={(e) => handleAssignClick(task, e)}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                                    {task.assignedTeam ? 'Reassign Team' : 'Assign Team'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Expanded History View */}
                    {expandedIds.has(task.id) && (
                        <div className="border-t border-border bg-muted/30 p-6 animate-in slide-in-from-top-2 duration-300">
                            <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                                <ClipboardDocumentCheckIcon className="w-4 h-4 text-primary" />
                                Service History & Audit Trail
                            </h4>

                            <div className="relative pl-4 border-l border-border space-y-6">
                                {task.history?.map((event, index) => (
                                    <div key={event.id} className="relative">
                                        {/* Timeline Dot */}
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-600 border-2 border-white dark:border-zinc-900" />

                                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                                            <div className="min-w-[100px]">
                                                <span className="text-xs font-mono text-muted-foreground">{event.date}</span>
                                            </div>

                                            <div className="flex-1 bg-card p-3 rounded-lg border border-border text-sm shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="font-medium text-foreground block">{event.action}</span>
                                                        <span className="text-xs text-muted-foreground">{event.type} • {event.technician}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-mono text-xs font-medium text-foreground bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
                                                            {event.cost}
                                                        </span>
                                                    </div>
                                                </div>
                                                {event.notes && (
                                                    <p className="text-muted-foreground text-xs italic border-t border-zinc-100 dark:border-zinc-800 pt-2 mt-2">
                                                        "{event.notes}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!task.history || task.history.length === 0) && (
                                    <div className="text-sm text-muted-foreground italic pl-2">No history records found.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <AssignTeamModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onConfirm={handleAssignConfirm}
                item={selectedTask}
                type="maintenance"
            />

            {trackingItem && (
                <TrackingModal
                    isOpen={isTrackingModalOpen}
                    onClose={() => setIsTrackingModalOpen(false)}
                    title={trackingItem.assetName}
                    trackingId={trackingItem.trackingId}
                    type="maintenance"
                    steps={trackingItem.trackingSteps || []}
                />
            )}
        </div>
    );
}
