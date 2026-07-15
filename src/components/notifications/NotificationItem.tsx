import { ArrowRightIcon, ExclamationTriangleIcon, ExclamationCircleIcon, InformationCircleIcon, CheckCircleIcon, DocumentTextIcon, CreditCardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { Notification } from './types';
import { clsx } from 'clsx';

const PriorityIcon = ({ priority, type }: { priority: Notification['priority'], type: Notification['type'] }) => {
    if (type === 'discrepancy') return <ExclamationTriangleIcon className="w-4 h-4" />;
    if (type === 'payment') return <CreditCardIcon className="w-4 h-4" />;
    if (type === 'invoice') return <DocumentTextIcon className="w-4 h-4" />;
    if (type === 'approval') return <ClipboardDocumentCheckIcon className="w-4 h-4" />;

    return <InformationCircleIcon className="w-4 h-4" />;
};

const PriorityBadge = ({ priority, type }: { priority: Notification['priority'], type: Notification['type'] }) => {
    const colors = {
        high: 'text-red-500 bg-red-500/10 border-red-500/20',
        medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        low: 'text-muted-foreground bg-muted/50 border-border',
    };

    const labels = {
        discrepancy: 'Discrepancy',
        invoice: 'Invoice',
        payment: 'Payment',
        approval: 'Approval',
        system: 'System',
        announcement: 'Announcement',
        live_chat: 'Live Chat'
    };

    return (
        <span className={clsx(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border",
            colors[priority]
        )}>
            <PriorityIcon priority={priority} type={type} />
            {labels[type]}
        </span>
    );
};

export default function NotificationItem({ notification, onActionClick }: { notification: Notification, onActionClick?: (actionLabel: string) => void }) {
    const priorityColors = {
        high: 'text-red-500 bg-red-500/10 border-red-500/20',
        medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        low: 'text-muted-foreground bg-zinc-100 dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600',
    };

    const [actionState, setActionState] = useState<Record<number, string>>({});

    const handleActionClick = (actionLabel: string, index: number) => {
        if (onActionClick) {
            onActionClick(actionLabel);
            return;
        }

        if (actionLabel === 'Reply') {
            setActionState(prev => ({ ...prev, [index]: 'Sent!' }));
        }
    };

    return (
        <div className="group relative p-4 rounded-2xl bg-muted dark:bg-zinc-800 border border-transparent hover:border-border hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start gap-4">

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <PriorityBadge priority={notification.priority} type={notification.type} />
                        {notification.priority === 'high' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                                High
                            </span>
                        )}
                        {notification.priority === 'medium' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                                Medium
                            </span>
                        )}
                        {notification.priority === 'low' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-muted-foreground dark:bg-zinc-700 dark:text-zinc-300">
                                Low
                            </span>
                        )}
                    </div>

                    <h4 className="text-sm font-semibold text-foreground truncate">
                        {notification.title}
                    </h4>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {notification.message}
                    </p>

                    <div className="mt-2 text-[10px] flex items-center gap-2 text-muted-foreground font-mono">
                        <span>{notification.meta}</span>
                        <span>•</span>
                        <span>{notification.timestamp}</span>
                    </div>
                </div>

                {/* Action Button */}
                {notification.actions.map((action, i) => (
                    <button
                        key={i}
                        className={clsx(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm",
                            action.primary
                                ? "bg-brand-300 hover:bg-brand-400 dark:bg-brand-400 dark:hover:bg-brand-300 text-zinc-900 shadow-sm"
                                : "bg-muted text-zinc-900 dark:text-gray-200 hover:bg-accent",
                            actionState[i] === 'Sent!' && "!bg-green-500 !text-white"
                        )}
                        onClick={() => handleActionClick(action.label, i)}
                    >
                        {actionState[i] || action.label}
                        {actionState[i] === 'Sent!' ? <CheckCircleIcon className="w-3 h-3" /> : <ArrowRightIcon className="w-3 h-3" />}
                    </button>
                ))}

            </div>

            {/* Absolute priority indicator on left */}
            <div className={clsx(
                "absolute left-0 top-4 bottom-4 w-1 rounded-r-full",
                notification.priority === 'high' ? 'bg-red-500' :
                    notification.priority === 'medium' ? 'bg-amber-500' : 'bg-transparent'
            )} />

        </div>
    );
}
