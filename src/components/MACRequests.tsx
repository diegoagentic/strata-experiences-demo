import React, { useState } from 'react';
import {
    ChatBubbleLeftEllipsisIcon,
    EnvelopeIcon,
    DevicePhoneMobileIcon,
    CheckCircleIcon,
    XCircleIcon,
    WrenchIcon,
    TruckIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Types
type RequestOrigin = 'Slack' | 'Email' | 'MobileApp';
type RequestUrgency = 'High' | 'Medium' | 'Low';
type RequestStatus = 'New' | 'Reviewing' | 'Converted' | 'Rejected';

interface MACRequest {
    id: string;
    description: string;
    requester: string;
    department: string;
    origin: RequestOrigin;
    receivedAt: string;
    urgency: RequestUrgency;
    status: RequestStatus;
}

// Mock Data
const MOCK_REQUESTS: MACRequest[] = [
    {
        id: 'REQ-001',
        description: "Need a new ergonomic chair, current one is broken.",
        requester: "Alice Smith",
        department: "Sales",
        origin: "Slack",
        receivedAt: "10 mins ago",
        urgency: "High",
        status: "New"
    },
    {
        id: 'REQ-002',
        description: "Meeting room A needs projector maintenance.",
        requester: "Bob Jones",
        department: "IT",
        origin: "MobileApp",
        receivedAt: "1 hour ago",
        urgency: "Medium",
        status: "New"
    },
    {
        id: 'REQ-003',
        description: "Relocate 3 desks to the new wing.",
        requester: "Charlie Day",
        department: "Operations",
        origin: "Email",
        receivedAt: "Yesterday",
        urgency: "Low",
        status: "Reviewing"
    },
    {
        id: 'REQ-004',
        description: "My standing desk is stuck in the down position.",
        requester: "Sarah Connor",
        department: "Engineering",
        origin: "Slack",
        receivedAt: "2 hours ago",
        urgency: "High",
        status: "New"
    },
    {
        id: 'REQ-005',
        description: "Requesting a whiteboard for the breakout area.",
        requester: "David Miller",
        department: "Marketing",
        origin: "Email",
        receivedAt: "3 days ago",
        urgency: "Low",
        status: "New"
    },
    {
        id: 'REQ-006',
        description: "Missing hardware for 3 workstations installed yesterday.",
        requester: "Installer Team Beta",
        department: "Installation",
        origin: "MobileApp",
        receivedAt: "4 hours ago",
        urgency: "High",
        status: "New"
    },
    {
        id: 'REQ-007',
        description: "Scratched glass partitions on floor 3, needs replacement.",
        requester: "Site Supervisor",
        department: "Operations",
        origin: "Email",
        receivedAt: "1 day ago",
        urgency: "High",
        status: "New"
    }
];

export default function MACRequests() {
    const [requests, setRequests] = useState<MACRequest[]>(MOCK_REQUESTS);

    const handleAction = (id: string, action: 'move' | 'maintenance' | 'reject' | 'punchlist') => {
        // In a real app, this would trigger a conversion flow or API call
        console.log(`Action ${action} on request ${id}`);
        // For demo, just remove or change status
        setRequests(prev => prev.filter(r => r.id !== id));
    };

    const getOriginIcon = (origin: RequestOrigin) => {
        switch (origin) {
            case 'Slack': return <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-indigo-500" />;
            case 'Email': return <EnvelopeIcon className="w-5 h-5 text-blue-500" />;
            case 'MobileApp': return <DevicePhoneMobileIcon className="w-5 h-5 text-green-500" />;
        }
    };

    const getUrgencyStyle = (urgency: RequestUrgency) => {
        switch (urgency) {
            case 'High': return 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30';
            case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30';
            case 'Low': return 'text-green-600 bg-green-50 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Context */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Incoming Requests</h2>
                    <p className="text-sm text-muted-foreground">Triage requests from various channels and convert them to work orders.</p>
                </div>
                <div className="flex gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                        {requests.length} Pending
                    </span>
                </div>
            </div>

            {/* List */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="divide-y divide-border">
                    {requests.length === 0 ? (
                        <div className="p-12 text-center">
                            <CheckCircleIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-foreground">All caught up!</h3>
                            <p className="text-muted-foreground">No pending requests in the queue.</p>
                        </div>
                    ) : (
                        requests.map((req) => (
                            <div key={req.id} className="group p-4 hover:bg-accent/50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center">
                                {/* Icon / Origin */}
                                <div className="shrink-0 pt-1 md:pt-0">
                                    <div className="w-10 h-10 rounded-full bg-muted/50 border border-border flex items-center justify-center shadow-sm">
                                        {getOriginIcon(req.origin)}
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-foreground text-sm truncate">{req.requester}</h4>
                                        <span className="text-muted-foreground text-xs">•</span>
                                        <span className="text-muted-foreground text-xs">{req.department}</span>
                                        <span className="text-muted-foreground text-xs">•</span>
                                        <span className="text-muted-foreground text-xs flex items-center gap-1">
                                            <ClockIcon className="w-3 h-3" /> {req.receivedAt}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground/80 line-clamp-1 group-hover:line-clamp-none transition-all">
                                        {req.description}
                                    </p>
                                </div>

                                {/* Meta & Actions */}
                                <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0">
                                    {/* Urgency Badge */}
                                    <span className={cn("px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider border", getUrgencyStyle(req.urgency))}>
                                        {req.urgency}
                                    </span>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleAction(req.id, 'punchlist')}
                                            title="Convert to Punch List"
                                            className="p-2 text-ai hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-colors"
                                        >
                                            <ExclamationTriangleIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.id, 'move')}
                                            title="Convert to Move"
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                        >
                                            <TruckIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.id, 'maintenance')}
                                            title="Convert to Maintenance"
                                            className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-colors"
                                        >
                                            <WrenchIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.id, 'reject')}
                                            title="Reject Request"
                                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                        >
                                            <XCircleIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
