import { ArrowRightIcon, ExclamationTriangleIcon, ExclamationCircleIcon, InformationCircleIcon, CheckCircleIcon, DocumentTextIcon, CreditCardIcon, ClipboardDocumentCheckIcon, MegaphoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { Notification } from './types';
import { clsx } from 'clsx';

const PriorityIcon = ({ priority, type }: { priority: Notification['priority'], type: Notification['type'] }) => {
    if (type === 'discrepancy') return <ExclamationTriangleIcon className="w-4 h-4" />;
    if (type === 'payment') return <CreditCardIcon className="w-4 h-4" />;
    if (type === 'invoice') return <DocumentTextIcon className="w-4 h-4" />;
    if (type === 'approval') return <ClipboardDocumentCheckIcon className="w-4 h-4" />;
    if (type === 'announcement') return <MegaphoneIcon className="w-4 h-4" />;
    if (type === 'live_chat') return <ChatBubbleLeftRightIcon className="w-4 h-4" />;

    return <InformationCircleIcon className="w-4 h-4" />;
};

const PriorityBadge = ({ priority, type }: { priority: Notification['priority'], type: Notification['type'] }) => {
    const colors = {
        high: 'text-red-500 bg-red-500/10 border-red-500/20',
        medium: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        low: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
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
        medium: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        low: 'text-primary bg-primary/10 border-primary/20',
    };

    const [actionState, setActionState] = useState<Record<number, string>>({});

    const handleActionClick = (actionLabel: string, index: number) => {
        // Fix: Use callback for Reply action if available
        if (actionLabel === 'Reply' && onActionClick) {
            onActionClick(actionLabel);
            return;
        }

        if (actionLabel === 'Reply') {
            setActionState(prev => ({ ...prev, [index]: 'Sent!' }));
        }
    };

    return (
        <div className="group relative p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-transparent hover:border-gray-200 dark:hover:border-white/10 hover:shadow-md transition-all duration-200">
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
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
                                Medium
                            </span>
                        )}
                        {notification.priority === 'low' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                                Low
                            </span>
                        )}
                    </div>

                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {notification.title}
                    </h4>

                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {notification.message}
                    </p>

                    <div className="mt-2 text-[10px] flex items-center gap-2 text-gray-400 dark:text-gray-500 font-mono">
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
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                : "bg-gray-100 dark:bg-white/10 text-zinc-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20",
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
                    notification.priority === 'medium' ? 'bg-orange-500' : 'bg-transparent'
            )} />

        </div>
    );
}
