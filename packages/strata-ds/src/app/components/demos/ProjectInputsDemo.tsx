import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export function ProjectInputsDemo() {
    return (
        <div className="space-y-8">
            {/* Search Bar Pattern */}
            <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Search Bar (Dashboard)</h4>
                <div className="p-6 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-white/10">
                    <div className="relative group max-w-sm">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white w-full focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder:text-zinc-400 shadow-sm transition-all"
                        />
                    </div>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                    Standard search input pattern used in lists and dashboards. Features an absolute positioned icon and focus ring formatting.
                </p>
            </div>
        </div>
    )
}
