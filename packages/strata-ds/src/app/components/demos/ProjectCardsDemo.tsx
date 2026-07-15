import { ArrowTrendingUpIcon, CurrencyDollarIcon, ChartBarIcon, ClipboardDocumentListIcon, ExclamationCircleIcon, PlusIcon, DocumentDuplicateIcon, DocumentTextIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export function ProjectCardsDemo() {
    return (
        <div className="space-y-8">
            <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">KPI Cards (Dashboard)</h4>
                <div className="p-6 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-white/10">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Total Inventory */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Inventory</p>
                                    <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-white group-hover:scale-105 transition-transform origin-left">$1.2M</p>
                                </div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                                    <CurrencyDollarIcon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-green-600">
                                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                                <span className="font-medium">+0.2%</span> <span className="text-zinc-500 dark:text-zinc-400 ml-1">vs last month</span>
                            </div>
                        </div>

                        {/* Efficiency */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Efficiency</p>
                                    <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-white group-hover:scale-105 transition-transform origin-left">88%</p>
                                </div>
                                <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                                    <ChartBarIcon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-green-600">
                                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                                <span className="font-medium">+3.5%</span> <span className="text-zinc-500 dark:text-zinc-400 ml-1">vs last month</span>
                            </div>
                        </div>

                        {/* Pending Orders */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Pending Orders</p>
                                    <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-white group-hover:scale-105 transition-transform origin-left">142</p>
                                </div>
                                <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-orange-600 dark:text-orange-400">
                                    <ClipboardDocumentListIcon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-zinc-500 dark:text-zinc-400">
                                <span className="font-medium">-12</span> <span className="ml-1">vs yesterday</span>
                            </div>
                        </div>

                        {/* Low Stock */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Low Stock</p>
                                    <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-white group-hover:scale-105 transition-transform origin-left">15</p>
                                </div>
                                <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-600 dark:text-red-400">
                                    <ExclamationCircleIcon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-red-500">
                                <span className="font-medium">Requires attention</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
