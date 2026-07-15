import {
    Bell,
    Search,
    X,
    LayoutGrid,
    AlertTriangle,
    CreditCard,
    ClipboardCheck,
    Truck,
    Megaphone,
    MessageSquare,
    MoreHorizontal
} from 'lucide-react';
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { Fragment, useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { mockNotifications } from './data';
import FilterTabs from './FilterTabs';
import NotificationItem from './NotificationItem';
import ChatView from './ChatView';
import type { NotificationTab } from './types';

export default function ActionCenter() {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentView, setCurrentView] = useState<'list' | 'chat'>('list');

    const tabs: NotificationTab[] = [
        {
            id: 'all',
            label: 'All',
            count: mockNotifications.filter(n => n.unread).length,
            icon: LayoutGrid,
            colorTheme: {
                activeBg: 'bg-zinc-900 dark:bg-zinc-50',
                activeText: 'text-zinc-50 dark:text-zinc-900',
                activeBorder: 'border-zinc-900 dark:border-zinc-50',
                badgeBg: 'bg-zinc-700 dark:bg-zinc-300',
                badgeText: 'text-zinc-50 dark:text-zinc-900'
            },
            filter: () => true
        },
        {
            id: 'discrepancy',
            label: 'Discrepancies',
            count: mockNotifications.filter(n => n.type === 'discrepancy' && n.unread).length,
            icon: AlertTriangle,
            colorTheme: {
                activeBg: 'bg-red-500/10',
                activeText: 'text-red-600 dark:text-red-400',
                activeBorder: 'border-red-500/20',
                badgeBg: 'bg-red-100 dark:bg-red-900/40',
                badgeText: 'text-red-700 dark:text-red-300'
            },
            filter: (n) => n.type === 'discrepancy'
        },
        {
            id: 'payment',
            label: 'Payments',
            count: mockNotifications.filter(n => n.type === 'payment' && n.unread).length,
            icon: CreditCard,
            colorTheme: {
                activeBg: 'bg-orange-500/10',
                activeText: 'text-orange-600 dark:text-orange-400',
                activeBorder: 'border-orange-500/20',
                badgeBg: 'bg-orange-100 dark:bg-orange-900/40',
                badgeText: 'text-orange-700 dark:text-orange-300'
            },
            filter: (n) => n.type === 'payment'
        },
        {
            id: 'approval',
            label: 'Approvals',
            count: mockNotifications.filter(n => n.type === 'approval' && n.unread).length,
            icon: ClipboardCheck,
            colorTheme: {
                activeBg: 'bg-cyan-500/10',
                activeText: 'text-cyan-600 dark:text-cyan-400',
                activeBorder: 'border-cyan-500/20',
                badgeBg: 'bg-cyan-100 dark:bg-cyan-900/40',
                badgeText: 'text-cyan-700 dark:text-cyan-300'
            },
            filter: (n) => n.type === 'approval'
        },
        {
            id: 'shipping',
            label: 'Shipping',
            count: 3, // Mock count for demo
            icon: Truck,
            colorTheme: {
                activeBg: 'bg-emerald-500/10',
                activeText: 'text-emerald-600 dark:text-emerald-400',
                activeBorder: 'border-emerald-500/20',
                badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40',
                badgeText: 'text-emerald-700 dark:text-emerald-300'
            },
            filter: (n) => n.type === 'system' // Placeholder filter
        },
        {
            id: 'announcement',
            label: 'News',
            count: mockNotifications.filter(n => n.type === 'announcement' && n.unread).length,
            icon: Megaphone,
            colorTheme: {
                activeBg: 'bg-purple-500/10',
                activeText: 'text-purple-600 dark:text-purple-400',
                activeBorder: 'border-purple-500/20',
                badgeBg: 'bg-purple-100 dark:bg-purple-900/40',
                badgeText: 'text-purple-700 dark:text-purple-300'
            },
            filter: (n) => n.type === 'announcement'
        },
        {
            id: 'live_chat',
            label: 'Chat',
            count: mockNotifications.filter(n => n.type === 'live_chat' && n.unread).length,
            icon: MessageSquare,
            colorTheme: {
                activeBg: 'bg-brand-500/10',
                activeText: 'text-brand-700 dark:text-brand-400',
                activeBorder: 'border-brand-500/20',
                badgeBg: 'bg-brand-50 dark:bg-brand-900/20',
                badgeText: 'text-brand-800 dark:text-brand-300'
            },
            filter: (n) => n.type === 'live_chat'
        },
    ];

    const filteredNotifications = useMemo(() => {
        const currentTab = tabs.find(t => t.id === activeTab);
        return mockNotifications
            .filter(n => currentTab?.filter(n))
            .filter(n =>
                n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.meta.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [activeTab, searchQuery]);

    const urgentCount = mockNotifications.filter(n => n.priority === 'high').length;
    const totalCount = mockNotifications.filter(n => n.unread).length;

    return (
        <Popover className="relative font-sans">
            {({ open }) => (
                <>
                    <PopoverButton className={clsx(
                        "relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors outline-none",
                        open ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                    )}>
                        <Bell className="w-5 h-5" />
                        {totalCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950" />
                        )}
                    </PopoverButton>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-2 scale-95"
                        enterTo="opacity-100 translate-y-0 scale-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0 scale-100"
                        leaveTo="opacity-0 translate-y-2 scale-95"
                    >
                        <PopoverPanel className="fixed top-[90px] right-4 md:right-8 w-[90vw] md:w-[600px] p-0 z-50 focus:outline-none">
                            <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">

                                {currentView === 'chat' ? (
                                    <ChatView onBack={() => setCurrentView('list')} />
                                ) : (
                                    <>
                                        {/* Header */}
                                        <div className="px-5 pt-5 pb-3 shrink-0">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 font-brand tracking-tight">Action Center</h3>
                                                <div className="flex items-center gap-2">
                                                    <button className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors">
                                                        <Search className="w-5 h-5" />
                                                    </button>
                                                    <button className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Tabs */}
                                            <FilterTabs
                                                tabs={tabs}
                                                activeTab={activeTab}
                                                onTabChange={setActiveTab}
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-4 space-y-3 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                                            {filteredNotifications.length > 0 ? (
                                                filteredNotifications.map(notification => (
                                                    <NotificationItem
                                                        key={notification.id}
                                                        notification={notification}
                                                        onActionClick={notification.type === 'live_chat'
                                                            ? (action) => {
                                                                if (action === 'Reply') setCurrentView('chat');
                                                            }
                                                            : undefined
                                                        }
                                                    />
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 dark:text-zinc-400">
                                                    <Bell className="w-12 h-12 mb-3 text-zinc-200 dark:text-zinc-800" />
                                                    <p className="text-sm font-medium">No updates found</p>
                                                    <p className="text-xs mt-1">You're all caught up!</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md flex items-center justify-between shrink-0">
                                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                                {filteredNotifications.length} actions pending
                                            </p>
                                            <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                {urgentCount} urgent attention needed
                                            </p>
                                        </div>
                                    </>
                                )}

                            </div>
                        </PopoverPanel>
                    </Transition>
                </>
            )}
        </Popover>
    );
}
