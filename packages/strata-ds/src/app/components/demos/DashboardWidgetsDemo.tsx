import {
    ArrowTrendingUpIcon, CurrencyDollarIcon, ChartBarIcon, ClipboardDocumentListIcon, ExclamationCircleIcon,
    PlusIcon, DocumentDuplicateIcon, DocumentTextIcon, EnvelopeIcon, ChevronUpIcon, ChevronDownIcon,
    ChevronRightIcon, EllipsisHorizontalIcon, PencilSquareIcon, TrashIcon, UserIcon, CheckIcon, ExclamationTriangleIcon,
    MapPinIcon, ShoppingBagIcon
} from '@heroicons/react/24/outline'
import { useState, useMemo, Fragment } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

const recentOrders = [
    { id: "#ORD-2055", customer: "AutoManfacture Co.", client: "AutoManfacture Co.", project: "Office Renovation", amount: "$385,000", status: "Pending Review", date: "Dec 20, 2025", initials: "AC", statusColor: "bg-zinc-100 text-zinc-700" },
    { id: "#ORD-2054", customer: "TechDealer Solutions", client: "TechDealer Solutions", project: "HQ Upgrade", amount: "$62,500", status: "In Production", date: "Nov 15, 2025", initials: "TS", statusColor: "bg-blue-50 text-blue-700 ring-blue-600/20" },
    { id: "#ORD-2053", customer: "Urban Living Inc.", client: "Urban Living Inc.", project: "Lobby Refresh", amount: "$112,000", status: "Shipped", date: "Oct 30, 2025", initials: "UL", statusColor: "bg-green-50 text-green-700 ring-green-600/20" },
    { id: "#ORD-2052", customer: "Global Logistics", client: "Global Logistics", project: "Warehouse Expansion", amount: "$45,000", status: "Delivered", date: "Oct 15, 2025", initials: "GL", statusColor: "bg-gray-100 text-gray-700" },
]

export function KPICardsDemo() {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Inventory</p>
                        <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-white group-hover:scale-105 transition-transform origin-left">$1.2M</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                        <CurrencyDollarIcon className="w-6 h-6" />
                    </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                    <span className="font-medium">+0.2%</span> <span className="text-zinc-500 ml-1">vs last month</span>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Efficiency</p>
                        <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-white group-hover:scale-105 transition-transform origin-left">88%</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                        <ChartBarIcon className="w-6 h-6" />
                    </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                    <span className="font-medium">+3.5%</span> <span className="text-zinc-500 ml-1">vs last month</span>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Pending Orders</p>
                        <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-white group-hover:scale-105 transition-transform origin-left">142</p>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-orange-600 dark:text-orange-400">
                        <ClipboardDocumentListIcon className="w-6 h-6" />
                    </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-zinc-500">
                    <span className="font-medium">-12</span> <span className="ml-1">vs yesterday</span>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Low Stock</p>
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
    )
}

export function RecentOrdersTableDemo() {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedIds(newExpanded)
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Recent Orders</h3>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-white/10">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-white/10 bg-transparent">
                        {recentOrders.map((order) => (
                            <Fragment key={order.id}>
                                <tr
                                    className={`hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${expandedIds.has(order.id) ? 'bg-zinc-50 dark:bg-white/5' : ''}`}
                                    onClick={() => toggleExpand(order.id)}
                                >
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                                        {expandedIds.has(order.id) ? <ChevronDownIcon className="h-4 w-4 text-zinc-500" /> : <ChevronRightIcon className="h-4 w-4 text-zinc-500" />}
                                        {order.id}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300">{order.initials}</div>
                                            {order.customer}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">{order.amount}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", order.statusColor)}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">{order.date}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <Menu as="div" className="relative inline-block text-left">
                                            <MenuButton onClick={(e) => e.stopPropagation()} className="bg-transparent p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-white">
                                                <EllipsisHorizontalIcon className="h-5 w-5" />
                                            </MenuButton>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-100"
                                                enterFrom="transform opacity-0 scale-95"
                                                enterTo="transform opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="transform opacity-100 scale-100"
                                                leaveTo="transform opacity-0 scale-95"
                                            >
                                                <MenuItems className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-zinc-200 dark:border-white/10">
                                                    <div className="py-1">
                                                        <MenuItem>
                                                            {({ active }) => (
                                                                <button onClick={(e) => e.stopPropagation()} className={`${active ? 'bg-zinc-100 dark:bg-white/5' : ''} group flex w-full items-center px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200`}>
                                                                    <DocumentTextIcon className="w-4 h-4 mr-2" /> View Details
                                                                </button>
                                                            )}
                                                        </MenuItem>
                                                        <MenuItem>
                                                            {({ active }) => (
                                                                <button onClick={(e) => e.stopPropagation()} className={`${active ? 'bg-zinc-100 dark:bg-white/5' : ''} group flex w-full items-center px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200`}>
                                                                    <PencilSquareIcon className="w-4 h-4 mr-2" /> Edit
                                                                </button>
                                                            )}
                                                        </MenuItem>
                                                        <MenuItem>
                                                            {({ active }) => (
                                                                <button onClick={(e) => e.stopPropagation()} className={`${active ? 'bg-zinc-100 dark:bg-white/5' : ''} group flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}>
                                                                    <TrashIcon className="w-4 h-4 mr-2" /> Delete
                                                                </button>
                                                            )}
                                                        </MenuItem>
                                                    </div>
                                                </MenuItems>
                                            </Transition>
                                        </Menu>
                                    </td>
                                </tr>
                                {/* Expanded Details */}
                                {expandedIds.has(order.id) && (
                                    <tr>
                                        <td colSpan={6} className="px-0 py-0 border-b border-zinc-200 dark:border-white/10">
                                            <div className="p-4 bg-zinc-50 dark:bg-black/20 pl-12">
                                                <div className="flex flex-col md:flex-row gap-8">
                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                                                                <UserIcon className="w-6 h-6 text-zinc-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-zinc-900 dark:text-white">Sarah Johnson</p>
                                                                <p className="text-xs text-zinc-500">Project Manager</p>
                                                            </div>
                                                        </div>
                                                        {/* Stepper */}
                                                        <div className="relative py-2 max-w-md">
                                                            <div className="absolute top-3 left-0 w-full h-0.5 bg-zinc-200 dark:bg-zinc-700" />
                                                            <div className="relative z-10 flex justify-between">
                                                                {['Placed', 'Mfg', 'Qual', 'Ship'].map((step, i) => (
                                                                    <div key={i} className="flex flex-col items-center gap-2">
                                                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${i <= 1 ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'}`}>
                                                                            {i < 1 ? <CheckIcon className="h-4 w-4" /> : <div className={`h-2 w-2 rounded-full ${i <= 1 ? 'bg-white' : 'bg-zinc-400/50'}`} />}
                                                                        </div>
                                                                        <span className="text-xs font-medium text-zinc-500">{step}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
