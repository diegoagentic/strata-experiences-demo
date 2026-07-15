import {
    AlertTriangle,
    CreditCard,
    FileText,
    ClipboardCheck,
    Megaphone,
    MessageSquare,
    Info,
    CheckCircle,
    ArrowRight
} from 'lucide-react';
import { useState } from 'react';
import type { Notification } from './types';
import { clsx } from 'clsx';

const PriorityIcon = ({ priority, type }: { priority: Notification['priority'], type: Notification['type'] }) => {
    if (type === 'discrepancy') return <AlertTriangle className="w-4 h-4" />;
    if (type === 'payment') return <CreditCard className="w-4 h-4" />;
    if (type === 'invoice') return <FileText className="w-4 h-4" />;
    if (type === 'approval') return <ClipboardCheck className="w-4 h-4" />;
    if (type === 'announcement') return <Megaphone className="w-4 h-4" />;
    if (type === 'live_chat') return <MessageSquare className="w-4 h-4" />;

    return <Info className="w-4 h-4" />;
};

const PriorityBadge = ({ priority, type }: { priority: Notification['priority'], type: Notification['type'] }) => {
    // Strata Design: High Priority uses Brand Colors (red/orange) but aligned with zinc-900 text where possible
    // or keep semantic meaning (Red = Error/High)
    const colors = {
        high: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        medium: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
        low: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
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
    const [actionState, setActionState] = useState<Record<number, string>>({});

    const handleActionClick = (actionLabel: string, index: number) => {
        if (actionLabel === 'Reply' && onActionClick) {
            onActionClick(actionLabel);
            return;
        }

        setActionState(prev => ({ ...prev, [index]: 'Processing...' }));

        // Simulate async action
        setTimeout(() => {
            setActionState(prev => ({ ...prev, [index]: 'Sent!' }));
        }, 800);
    };

    return (
        <div className="group relative p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all duration-200">
            <div className="flex justify-between items-start gap-4">

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <PriorityBadge priority={notification.priority} type={notification.type} />
                        {notification.priority === 'high' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                                High
                            </span>
                        )}
                        {notification.unread && (
                            <span className="w-2 h-2 rounded-full bg-brand-500" title="Unread" />
                        )}
                    </div>

                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate font-sans">
                        {notification.title}
                    </h4>

                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                        {notification.message}
                    </p>

                    <div className="mt-3 text-[10px] flex items-center gap-2 text-zinc-400 dark:text-zinc-500 font-mono">
                        <span>{notification.meta}</span>
                        <span>•</span>
                        <span>{notification.timestamp}</span>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex flex-col gap-2">
                    {notification.actions.map((action, i) => (
                        <button
                            key={i}
                            className={clsx(
                                "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm",
                                action.primary
                                    ? "bg-brand-200 text-zinc-900 hover:bg-brand-300 dark:bg-brand-400 dark:hover:bg-brand-300" // Strata Brand Primary
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                                actionState[i] === 'Sent!' && "!bg-emerald-500 !text-white"
                            )}
                            onClick={() => handleActionClick(action.label, i)}
                        >
                            {actionState[i] || action.label}
                            {actionState[i] === 'Sent!' ? <CheckCircle className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                        </button>
                    ))}
                </div>

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
