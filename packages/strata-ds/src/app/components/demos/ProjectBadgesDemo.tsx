export function ProjectBadgesDemo() {
    return (
        <div className="space-y-8">
            {/* Status Pills */}
            <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Status Pills (Data Table)</h4>
                <div className="flex flex-wrap items-center gap-4 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/10">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                        Shipped
                    </span>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        In Production
                    </span>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-600/10">
                        Pending Review
                    </span>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10">
                        Overdue
                    </span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                    Compact status indicators used in high-density data tables. Uses Tailwind's `ring` utility for subtle borders.
                </p>
            </div>

            {/* Notification Badge */}
            <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Notification Counters</h4>
                <div className="flex items-center gap-8 p-6 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-white/10">
                    <div className="relative inline-block">
                        <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
                        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-zinc-900">
                            3
                        </span>
                    </div>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                    Used in Action Center triggers to indicate unread count. Positioned absolutely with a border to separate from the background.
                </p>
            </div>
        </div>
    )
}
