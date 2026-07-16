import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { Fragment, useState, useMemo, useEffect, useRef } from 'react'
import {
    ClipboardDocumentListIcon, TruckIcon,
    CurrencyDollarIcon, ChartBarIcon, ArrowTrendingUpIcon, ExclamationCircleIcon,
    PlusIcon, DocumentDuplicateIcon, DocumentTextIcon, EnvelopeIcon, Squares2X2Icon,
    EllipsisHorizontalIcon, ListBulletIcon,
    ChevronDownIcon, ChevronRightIcon, ChevronUpIcon, PencilSquareIcon, TrashIcon,
    CheckIcon, MapPinIcon, UserIcon, ShoppingBagIcon, ExclamationTriangleIcon,
    CubeIcon, ClockIcon, WrenchScrewdriverIcon, ChevronLeftIcon, CloudArrowUpIcon, DocumentPlusIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useTenant } from './TenantContext'
import Navbar from './components/Navbar'
import Breadcrumbs from './components/Breadcrumbs'
import Select from './components/Select'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

const salesData = [
    { name: 'Jan', sales: 4000, costs: 2400 },
    { name: 'Feb', sales: 3000, costs: 1398 },
    { name: 'Mar', sales: 2000, costs: 9800 },
    { name: 'Apr', sales: 2780, costs: 3908 },
    { name: 'May', sales: 1890, costs: 4800 },
    { name: 'Jun', sales: 2390, costs: 3800 },
]

const recentOrders = [
    { id: "#ORD-2055", customer: "AutoManfacture Co.", client: "AutoManfacture Co.", project: "Office Renovation", amount: "$385,000", status: "PO received", date: "Dec 20, 2025", initials: "AC", statusColor: "bg-zinc-100 text-muted-foreground" },
    { id: "#ORD-2054", customer: "TechDealer Solutions", client: "TechDealer Solutions", project: "HQ Upgrade", amount: "$62,500", status: "In production", date: "Nov 15, 2025", initials: "TS", statusColor: "bg-brand-50 text-brand-700 ring-brand-600/20" },
    { id: "#ORD-2053", customer: "Urban Living Inc.", client: "Urban Living Inc.", project: "Lobby Refresh", amount: "$112,000", status: "Shipped", date: "Oct 30, 2025", initials: "UL", statusColor: "bg-green-50 text-green-700 ring-green-600/20" },
    { id: "#ORD-2052", customer: "Global Logistics", client: "Global Logistics", project: "Warehouse Expansion", amount: "$45,000", status: "Delivered", date: "Oct 15, 2025", initials: "GL", statusColor: "bg-gray-100 text-foreground" },
]

// Color Mapping for Status Icons
const colorStyles: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/30',
    purple: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30',
    orange: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30',
    green: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30',
    pink: 'bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300 ring-1 ring-inset ring-pink-600/20 dark:ring-pink-400/30',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30',
}

const solidColorStyles: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 border-blue-500',
    purple: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-purple-500/20 border-indigo-500',
    orange: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-orange-500/20 border-amber-500',
    green: 'bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-500/20 border-green-500',
    pink: 'bg-pink-600 hover:bg-pink-700 text-white shadow-sm shadow-pink-500/20 border-pink-500',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 border-indigo-500',
}

// Summary Data matching Wireframe
const ordersSummary = {
    active_orders: { label: 'Active Orders', value: '89', sub: 'In production/transit', icon: <CubeIcon className="w-5 h-5" />, color: 'blue' },
    pending_approval: { label: 'Pending Approval', value: '12', sub: 'Awaiting authorization', icon: <ClockIcon className="w-5 h-5" />, color: 'orange' },
    in_production: { label: 'In production', value: '34', sub: 'Manufacturing stage', icon: <WrenchScrewdriverIcon className="w-5 h-5" />, color: 'purple' },
    ready_to_ship: { label: 'Ready to ship', value: '23', sub: 'Awaiting dispatch', icon: <TruckIcon className="w-5 h-5" />, color: 'indigo' },
    total_value: { label: 'Total Value', value: '$3.8M', sub: 'Active orders value', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'green' },
}

interface PageProps {
    onLogout: () => void;
    onNavigateToDetail: () => void;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: string) => void;
}

export default function Pricing({ onLogout, onNavigateToDetail, onNavigateToWorkspace, onNavigate }: PageProps) {
    const { currentTenant } = useTenant()
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showMetrics, setShowMetrics] = useState(false);

    // Refs for scrolling
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const expandedScrollRef = useRef<HTMLDivElement>(null)

    const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
        if (ref.current) {
            const scrollAmount = 320;
            ref.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    }
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedClient, setSelectedClient] = useState('All Clients')
    const [selectedProject, setSelectedProject] = useState('All Projects')

    const [activeTab, setActiveTab] = useState<'metrics' | 'active' | 'completed' | 'all'>('active')
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
    const [trackingOrder, setTrackingOrder] = useState<any>(null)

    const clients = ['All Clients', ...Array.from(new Set(recentOrders.map(o => o.client)))]

    const availableProjects = useMemo(() => {
        if (selectedClient === 'All Clients') {
            return ['All Projects', ...Array.from(new Set(recentOrders.map(o => o.project)))]
        }
        return ['All Projects', ...Array.from(new Set(recentOrders.filter(o => o.client === selectedClient).map(o => o.project)))]
    }, [selectedClient])

    useEffect(() => {
        if (selectedClient !== 'All Clients' && availableProjects.length > 1) {
            setSelectedProject(availableProjects[1])
        } else {
            setSelectedProject('All Projects')
        }
    }, [selectedClient, availableProjects])

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedIds(newExpanded)
    }

    const metricsData = useMemo(() => {
        const dataToAnalyze = recentOrders.filter(order => {
            const matchesProject = selectedProject === 'All Projects' || order.project === selectedProject
            const matchesClient = selectedClient === 'All Clients' || order.client === selectedClient
            return matchesProject && matchesClient
        })

        const totalValue = dataToAnalyze.reduce((sum, order) => {
            return sum + parseInt(order.amount.replace(/[^0-9]/g, ''))
        }, 0)

        const activeCount = dataToAnalyze.filter(o => !['Delivered', 'Completed'].includes(o.status)).length
        const completedCount = dataToAnalyze.filter(o => ['Delivered', 'Completed'].includes(o.status)).length

        return {
            revenue: totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }),
            activeOrders: activeCount,
            completedOrders: completedCount,
            efficiency: dataToAnalyze.length > 0 ? Math.round((completedCount / dataToAnalyze.length) * 100) : 0
        }
    }, [selectedProject, selectedClient])

    const filteredOrders = useMemo(() => {
        return recentOrders.filter(order => {
            const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesProject = selectedProject === 'All Projects' || order.project === selectedProject
            const matchesClient = selectedClient === 'All Clients' || order.client === selectedClient

            let matchesTab = true;
            if (activeTab === 'active') {
                matchesTab = !['Delivered', 'Completed'].includes(order.status)
            } else if (activeTab === 'completed') {
                matchesTab = ['Delivered', 'Completed'].includes(order.status)
            } else if (activeTab === 'metrics') {
                matchesTab = true
            }

            return matchesSearch && matchesProject && matchesClient && matchesTab
        })
    }, [searchQuery, selectedProject, selectedClient, activeTab])

    const counts = useMemo(() => {
        return {
            active: recentOrders.filter(o => !['Delivered', 'Completed'].includes(o.status)).length,
            completed: recentOrders.filter(o => ['Delivered', 'Completed'].includes(o.status)).length,
            all: recentOrders.length
        }
    }, [])

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-10">
            <Navbar onLogout={onLogout} activeTab="Pricing" onNavigateToWorkspace={onNavigateToWorkspace} onNavigate={onNavigate} />
            <div className="pt-24 px-4 max-w-7xl mx-auto space-y-6">

                {/* Breadcrumbs */}
                <div className="mb-4">
                    <Breadcrumbs
                        items={[
                            { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
                            { label: 'Pricing' }
                        ]}
                    />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-brand font-bold tracking-tight text-foreground">
                            {currentTenant} Pricing
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage pricing lists and discounts.</p>
                    </div>
                </div>

                {/* KPI Cards */}
                {showMetrics ? (
                    <>
                        <div className="flex justify-end mb-2">
                            <button onClick={() => setShowMetrics(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Hide Details <ChevronUpIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in zoom-in duration-300">
                            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Inventory</p>
                                        <p className="mt-1 text-3xl font-semibold text-foreground group-hover:scale-105 transition-transform origin-left">$1.2M</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                                        <CurrencyDollarIcon className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm text-green-600">
                                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                                    <span className="font-medium">+0.2%</span> <span className="text-muted-foreground ml-1">vs last month</span>
                                </div>
                            </div>

                            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Efficiency</p>
                                        <p className="mt-1 text-3xl font-semibold text-foreground group-hover:scale-105 transition-transform origin-left">88%</p>
                                    </div>
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                                        <ChartBarIcon className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm text-green-600">
                                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                                    <span className="font-medium">+3.5%</span> <span className="text-muted-foreground ml-1">vs last month</span>
                                </div>
                            </div>

                            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Orders</p>
                                        <p className="mt-1 text-3xl font-semibold text-foreground group-hover:scale-105 transition-transform origin-left">142</p>
                                    </div>
                                    <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                                        <ClipboardDocumentListIcon className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                    <span className="font-medium">-12</span> <span className="ml-1">vs yesterday</span>
                                </div>
                            </div>

                            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Low Stock</p>
                                        <p className="mt-1 text-3xl font-semibold text-foreground group-hover:scale-105 transition-transform origin-left">15</p>
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
                        {/* Quick Actions below grid when expanded */}
                        <div className="flex items-center gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
                            <span className="text-sm font-medium text-muted-foreground">Quick Actions:</span>
                            {[
                                { icon: <PlusIcon className="w-5 h-5" />, label: "New Order" },
                                { icon: <DocumentDuplicateIcon className="w-5 h-5" />, label: "Duplicate" },
                                { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF" },
                                { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Send Email" },
                            ].map((action, i) => (
                                <button key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all text-xs font-medium">
                                    {action.icon}
                                    <span>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="bg-card/60 backdrop-blur-md rounded-2xl p-4 border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-6 overflow-x-auto w-full scrollbar-minimal">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="text-sm text-muted-foreground">Inventory:</span>
                                <span className="text-lg font-semibold text-foreground">$1.2M</span>
                                <span className="text-xs text-green-500 font-medium bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-md self-center">+0.2%</span>
                            </div>
                            <div className="w-px h-8 bg-border hidden sm:block"></div>
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="text-sm text-muted-foreground">Efficiency:</span>
                                <span className="text-lg font-semibold text-foreground">88%</span>
                                <span className="text-xs text-green-500 font-medium bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-md self-center">+3.5%</span>
                            </div>
                            <div className="w-px h-8 bg-border hidden sm:block"></div>
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="text-sm text-muted-foreground">Pending:</span>
                                <span className="text-lg font-semibold text-foreground">142</span>
                            </div>
                            <div className="w-px h-8 bg-border hidden sm:block"></div>
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="text-sm text-muted-foreground">Low Stock:</span>
                                <span className="text-lg font-semibold text-foreground">15</span>
                                <span className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md self-center">Alert</span>
                            </div>
                        </div>
                        <div className="w-px h-12 bg-border hidden xl:block mx-2"></div>
                        {/* Quick Actions Integrated */}
                        <div className="flex items-center gap-3 overflow-x-auto min-w-max pl-4 border-l border-gray-200 dark:border-white/10 xl:border-none xl:pl-0">
                            {[
                                { icon: <PlusIcon className="w-4 h-4" />, label: "New" },
                                { icon: <DocumentDuplicateIcon className="w-4 h-4" />, label: "Copy" },
                                { icon: <DocumentTextIcon className="w-4 h-4" />, label: "PDF" },
                                { icon: <EnvelopeIcon className="w-4 h-4" />, label: "Email" },
                            ].map((action, i) => (
                                <button key={i} className="flex flex-col items-center justify-center gap-1 group p-2 hover:bg-primary dark:hover:bg-primary rounded-lg transition-colors">
                                    <div className="text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-zinc-900 transition-colors">
                                        {action.icon}
                                    </div>
                                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-zinc-900 transition-colors">{action.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="w-px h-12 bg-border hidden xl:block mx-2"></div>
                        <button
                            onClick={() => setShowMetrics(true)}
                            className="flex flex-col items-center justify-center gap-1 group p-2 hover:bg-primary dark:hover:bg-primary rounded-lg transition-colors"
                        >
                            <div className="text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-zinc-900 transition-colors">
                                <ChevronDownIcon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-zinc-900 transition-colors">Details</span>
                        </button>
                    </div>
                )}


                {/* Recent Orders Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-3">
                        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                            {/* Header for Orders */}
                            <div className="p-6 border-b border-border">
                                <h3 className="text-lg font-brand font-semibold text-foreground flex items-center gap-2 mb-4">
                                    Recent Orders
                                </h3>
                                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                    {/* Tabs */}
                                    <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
                                        {[
                                            { id: 'active', label: 'Active', count: counts.active },
                                            { id: 'completed', label: 'Completed', count: counts.completed },
                                            { id: 'all', label: 'All', count: counts.all },
                                            { id: 'metrics', label: 'Metrics', count: null }
                                        ].map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as any)}
                                                className={cn(
                                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 outline-none",
                                                    activeTab === tab.id
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {tab.id === 'metrics' && <ChartBarIcon className="w-4 h-4" />}
                                                {tab.label}
                                                {tab.count !== null && (
                                                    <span className={cn(
                                                        "text-xs px-1.5 py-0.5 rounded-full transition-colors",
                                                        activeTab === tab.id
                                                            ? "bg-primary-foreground/10 text-primary-foreground"
                                                            : "bg-background text-muted-foreground group-hover:bg-muted"
                                                    )}>
                                                        {tab.count}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* Client Filter */}
                                        <div className="w-48">
                                            <Select
                                                value={selectedClient}
                                                onChange={setSelectedClient}
                                                options={clients}
                                            />
                                        </div>

                                        {/* Project Filter */}
                                        <div className="w-48">
                                            <Select
                                                value={selectedProject}
                                                onChange={setSelectedProject}
                                                options={availableProjects}
                                            />
                                        </div>

                                        <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>

                                        <div className="flex bg-muted p-1 rounded-lg">
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                <ListBulletIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('grid')}
                                                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                <Squares2X2Icon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 bg-muted/30 min-h-[300px]">
                                {activeTab === 'metrics' ? (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground">Performance Metrics</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedClient === 'All Clients' ? 'Overview across all clients' : `Showing analytics for ${selectedClient}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-300">
                                            {/* Revenue Card */}
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-6 border border-green-200 dark:border-green-800/20 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm font-medium text-green-700 dark:text-green-400">Total Revenue</p>
                                                    <CurrencyDollarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{metricsData.revenue}</p>
                                                    <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">Based on visible orders</p>
                                                </div>
                                            </div>

                                            {/* Active Orders Card */}
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/20 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Active Orders</p>
                                                    <ShoppingBagIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{metricsData.activeOrders}</p>
                                                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">In production or pending</p>
                                                </div>
                                            </div>

                                            {/* Completion Rate Card */}
                                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800/20 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400">Completion Rate</p>
                                                    <ChartBarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{metricsData.efficiency}%</p>
                                                    <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-1">Orders delivered successfully</p>
                                                </div>
                                            </div>

                                            {/* Project Count Card */}
                                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-2xl p-6 border border-amber-200 dark:border-amber-800/20 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Project Count</p>
                                                    <ClipboardDocumentListIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                                                        {availableProjects.length > 0 && availableProjects[0] === 'All Projects' ? availableProjects.length - 1 : availableProjects.length}
                                                    </p>
                                                    <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">Active projects</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-[300px] w-full bg-card rounded-2xl p-6 border border-border shadow-sm">
                                            <h4 className="text-md font-medium text-foreground mb-4">Monthly Trends</h4>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={salesData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                                                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                ) : viewMode === 'list' ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-border">
                                            <thead>
                                                <tr>
                                                    <th className="px-3 py-3.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                                                    <th className="px-3 py-3.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                                                    <th className="px-3 py-3.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                                                    <th className="px-3 py-3.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                                    <th className="px-3 py-3.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                                                    <th className="relative px-3 py-3.5"><span className="sr-only">Actions</span></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border bg-transparent">
                                                {filteredOrders.map((order) => (
                                                    <Fragment key={order.id}>
                                                        <tr
                                                            className={`hover:bg-muted/50 transition-colors cursor-pointer ${expandedIds.has(order.id) ? 'bg-primary/5' : ''}`}
                                                            onClick={() => toggleExpand(order.id)}
                                                        >
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-foreground flex items-center gap-2">
                                                                {expandedIds.has(order.id) ? <ChevronDownIcon className="h-4 w-4 text-foreground" /> : <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />}
                                                                {order.id}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-foreground/80">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">{order.initials}</div>
                                                                    {order.customer}
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-foreground/80">{order.amount}</td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                                <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset", order.statusColor)}>
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-foreground/80">{order.date}</td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium">
                                                                <Menu as="div" className="relative inline-block text-left">
                                                                    <MenuButton onClick={(e) => e.stopPropagation()} className="bg-transparent p-1 rounded-full text-muted-foreground hover:text-foreground">
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
                                                                        <MenuItems className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-border">
                                                                            <div className="py-1">
                                                                                <MenuItem>
                                                                                    {({ active }) => (
                                                                                        <button onClick={(e) => { e.stopPropagation(); onNavigateToDetail(); }} className={`${active ? 'bg-muted' : ''} group flex w-full items-center px-4 py-2 text-sm text-foreground`}>
                                                                                            <span className="w-4 h-4 mr-2" ><DocumentTextIcon /></span> View Details
                                                                                        </button>
                                                                                    )}
                                                                                </MenuItem>
                                                                                <MenuItem>
                                                                                    {({ active }) => (
                                                                                        <button onClick={(e) => e.stopPropagation()} className={`${active ? 'bg-accent' : ''} group flex w-full items-center px-4 py-2 text-sm text-foreground`}>
                                                                                            <span className="w-4 h-4 mr-2" ><PencilSquareIcon /></span> Edit
                                                                                        </button>
                                                                                    )}
                                                                                </MenuItem>
                                                                                <MenuItem>
                                                                                    {({ active }) => (
                                                                                        <button onClick={(e) => e.stopPropagation()} className={`${active ? 'bg-accent' : ''} group flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}>
                                                                                            <span className="w-4 h-4 mr-2" ><TrashIcon /></span> Delete
                                                                                        </button>
                                                                                    )}
                                                                                </MenuItem>
                                                                                <MenuItem>
                                                                                    {({ active }) => (
                                                                                        <button onClick={(e) => e.stopPropagation()} className={`${active ? 'bg-accent' : ''} group flex w-full items-center px-4 py-2 text-sm text-foreground`}>
                                                                                            <span className="w-4 h-4 mr-2" ><EnvelopeIcon /></span> Contact
                                                                                        </button>
                                                                                    )}
                                                                                </MenuItem>
                                                                            </div>
                                                                        </MenuItems>
                                                                    </Transition>
                                                                </Menu>
                                                            </td>
                                                        </tr>
                                                        {/* Details Row */}
                                                        {expandedIds.has(order.id) && (
                                                            <tr>
                                                                <td colSpan={6} className="px-0 py-0 border-b border-gray-200 dark:border-white/10">
                                                                    <div className="p-4 bg-muted/50 pl-12">
                                                                        <div className="flex items-start gap-4">
                                                                            <div className="flex-1 space-y-4">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><UserIcon className="w-6 h-6 text-muted-foreground" /></div>
                                                                                    <div>
                                                                                        <p className="text-sm font-medium text-foreground">Operations Manager Solano</p>
                                                                                        <p className="text-xs text-muted-foreground">Project Manager</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="h-px bg-border w-full"></div>
                                                                                {/* Progress Bar Simple */}
                                                                                <div className="relative">
                                                                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
                                                                                    <div className="relative flex justify-between">
                                                                                        {['Placed', 'Mfg', 'Qual', 'Ship'].map((step, i) => (
                                                                                            <div key={i} className={`flex flex-col items-center gap-2 ${i < 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                                                                <div className={`w-3 h-3 rounded-full ${i < 2 ? 'bg-primary ring-4 ring-brand-100 dark:ring-brand-900/30' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                                                                                <span className="text-xs font-medium">{step}</span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="w-64">
                                                                                <div className="p-3 bg-card rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                                                                                    <p className="text-xs font-medium text-muted-foreground uppercase">Alert</p>
                                                                                    <div className="mt-2 flex items-start gap-2">
                                                                                        <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                                                                        <div>
                                                                                            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Customs Delay</p>
                                                                                            <p className="text-xs text-muted-foreground mt-1">Shipment held at port. ETA +24h.</p>
                                                                                            <button onClick={() => setTrackingOrder(order)} className="mt-2 text-xs font-medium text-zinc-900 dark:text-primary decoration-primary underline-offset-2 hover:underline">Track Shipment</button>
                                                                                        </div>
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
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredOrders.map((order) => (
                                            <div
                                                key={order.id}
                                                className={`group relative bg-card rounded-2xl border ${expandedIds.has(order.id) ? 'border-border ring-1 ring-border' : 'border-gray-200 dark:border-white/10'} shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col`}
                                                onClick={() => toggleExpand(order.id)}
                                            >
                                                <div className="p-5">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                                                                {order.initials}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-bold text-foreground">{order.customer}</h4>
                                                                <p className="text-xs text-muted-foreground">{order.id}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={(e) => { e.stopPropagation(); onNavigateToDetail(); }} className="p-1 rounded-full hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary text-muted-foreground hover:text-zinc-900 dark:hover:text-primary-foreground transition-colors">
                                                                <DocumentTextIcon className="h-5 w-5" />
                                                            </button>
                                                            <button onClick={(e) => e.stopPropagation()} className="p-1 rounded-full hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary text-muted-foreground hover:text-zinc-900 dark:hover:text-primary-foreground transition-colors">
                                                                <PencilSquareIcon className="h-5 w-5" />
                                                            </button>
                                                            <Menu as="div" className="relative inline-block text-left">
                                                                <MenuButton onClick={(e) => e.stopPropagation()} className="p-1 rounded-full hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary text-muted-foreground dark:hover:text-primary-foreground">
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
                                                                    <MenuItems className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-white/10">
                                                                        <div className="py-1">
                                                                            <MenuItem>
                                                                                {({ active }) => (
                                                                                    <button onClick={(e) => e.stopPropagation()} className={`${active ? 'bg-accent' : ''} group flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}>
                                                                                        <span className="w-4 h-4 mr-2" ><TrashIcon /></span> Delete
                                                                                    </button>
                                                                                )}
                                                                            </MenuItem>
                                                                        </div>
                                                                    </MenuItems>
                                                                </Transition>
                                                            </Menu>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center py-2 border-b border-border">
                                                            <span className="text-xs text-muted-foreground">Amount</span>
                                                            <span className="text-sm font-semibold text-foreground">{order.amount}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center py-2 border-b border-border">
                                                            <span className="text-xs text-muted-foreground">Date</span>
                                                            <span className="text-sm text-muted-foreground">{order.date}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2">
                                                            <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset", order.statusColor)}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {expandedIds.has(order.id) && (
                                                    <div className="mt-4 pt-4 px-5 border-t border-border">
                                                        <div className="flex flex-col md:flex-row gap-8">
                                                            <div className="flex-1 space-y-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-card flex items-center justify-center text-muted-foreground">
                                                                        <UserIcon className="h-4 w-4" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-foreground">Operations Manager Solano</p>
                                                                        <p className="text-xs text-muted-foreground">Project Manager</p>
                                                                    </div>
                                                                </div>

                                                                <div className="relative py-2">
                                                                    <div className="absolute top-3 left-0 w-full h-0.5 bg-gray-200 dark:bg-zinc-700" />
                                                                    <div className="relative z-10 flex justify-between">
                                                                        {['Placed', 'Mfg', 'Qual', 'Ship'].map((step, i) => (
                                                                            <div key={i} className="flex flex-col items-center bg-card px-1">
                                                                                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${i <= 1 ? 'bg-primary text-primary-foreground' : 'bg-gray-200 dark:bg-zinc-700 text-muted-foreground'}`}>
                                                                                    {i < 1 ? <CheckIcon className="h-4 w-4" /> : <div className={`h-2 w-2 rounded-full ${i <= 1 ? 'bg-primary-foreground' : 'bg-white/50'}`} />}
                                                                                </div>
                                                                                <span className={`mt-2 text-xs font-medium ${i <= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="w-full md:w-[280px]">
                                                                <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4">
                                                                    <div className="flex gap-3">
                                                                        <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                                                        <div>
                                                                            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">Action Required</p>
                                                                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                                                                Customs documentation pending approval.
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 flex justify-end pb-4">
                                                            <button onClick={(e) => { e.stopPropagation(); onNavigateToDetail(); }} className="text-sm font-medium text-primary hover:underline">
                                                                View Full Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
