import type { NotificationTab } from './types';
import { clsx } from 'clsx';

interface FilterTabsProps {
    tabs: NotificationTab[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export default function FilterTabs({ tabs, activeTab, onTabChange }: FilterTabsProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none px-1">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={clsx(
                            "relative flex items-center justify-center rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                            isActive
                                ? clsx(
                                    "px-3 py-2 border",
                                    tab.colorTheme.activeBg,
                                    tab.colorTheme.activeBorder
                                )
                                : "p-2 hover:bg-black/5 dark:hover:bg-white/5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <tab.icon className={clsx(
                                "w-5 h-5 transition-colors",
                                isActive ? tab.colorTheme.activeText : "currentColor"
                            )} />

                            <div
                                className={clsx(
                                    "overflow-hidden transition-all duration-300 ease-in-out",
                                    isActive ? "w-auto opacity-100" : "w-0 opacity-0"
                                )}
                            >
                                <span className={clsx("text-sm font-medium whitespace-nowrap px-1", tab.colorTheme.activeText)}>
                                    {tab.label}
                                </span>
                            </div>

                            {isActive && tab.count > 0 && (
                                <span className={clsx(
                                    "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold animate-in zoom-in duration-200",
                                    tab.colorTheme.badgeBg,
                                    tab.colorTheme.badgeText
                                )}>
                                    {tab.count}
                                </span>
                            )}
                        </div>

                        {/* Collapsed Badge (Notification Dot) */}
                        {!isActive && tab.count > 0 && (
                            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold border-2 border-white dark:border-zinc-900">
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
