import { PlusIcon, DocumentDuplicateIcon, DocumentTextIcon, EnvelopeIcon, DocumentMagnifyingGlassIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'

export function ProjectButtonsDemo() {
    return (
        <div className="space-y-8">
            {/* Quick Actions Pattern */}
            <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Quick Action Buttons (Dashboard)</h4>
                <div className="flex flex-wrap items-center gap-4 p-6 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-white/10">
                    {[
                        { icon: <PlusIcon className="w-5 h-5" />, label: "New Order" },
                        { icon: <DocumentDuplicateIcon className="w-5 h-5" />, label: "Duplicate" },
                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF" },
                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Send Email" },
                    ].map((action, i) => (
                        <button key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary dark:hover:border-primary hover:bg-primary dark:hover:bg-primary hover:text-zinc-900 dark:hover:text-zinc-900 text-gray-500 dark:text-gray-400 transition-all text-xs font-medium shadow-sm">
                            {action.icon}
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                    Used in the Dashboard for high-frequency actions. Features a rounded-full shape, subtle border, and primary color hover state.
                </p>
            </div>

            {/* Table Icon Actions Pattern */}
            <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Table Icon Actions</h4>
                <div className="flex items-center gap-6 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/10">
                    <div className="flex items-center gap-1">
                        <button className="p-1 rounded-full hover:bg-primary hover:text-zinc-900 dark:hover:bg-primary text-gray-400 hover:text-zinc-900 dark:hover:text-zinc-900 transition-colors" title="View Details">
                            <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                        <button className="p-1 rounded-full hover:bg-primary hover:text-zinc-900 dark:hover:bg-primary text-gray-400 hover:text-zinc-900 dark:hover:text-zinc-900 transition-colors" title="Edit">
                            <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button className="p-1 rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 text-gray-400 transition-colors" title="Delete">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                    Minimalist icon-only buttons used within data tables or cards. Hover effects provide immediate feedback without clutter.
                </p>
            </div>
        </div>
    )
}
