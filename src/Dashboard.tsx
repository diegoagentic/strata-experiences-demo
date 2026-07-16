import { Menu, MenuButton, MenuItem, MenuItems, Dialog, DialogPanel, Transition, TransitionChild, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { Fragment } from 'react'
import {
    HomeIcon, CubeIcon, ClipboardDocumentListIcon, TruckIcon,
    ArrowRightOnRectangleIcon, MagnifyingGlassIcon, BellIcon, CalendarIcon,
    CurrencyDollarIcon, ChartBarIcon, ArrowTrendingUpIcon, ExclamationCircleIcon,
    PlusIcon, DocumentDuplicateIcon, DocumentTextIcon, EnvelopeIcon, Squares2X2Icon,
    EllipsisHorizontalIcon, ListBulletIcon, SunIcon, MoonIcon,
    ChevronDownIcon, ChevronUpIcon, EyeIcon, PencilIcon, TrashIcon,
    CheckIcon, MapPinIcon, UserIcon, ClockIcon, ShoppingBagIcon, ExclamationTriangleIcon, PencilSquareIcon,
    BookOpenIcon, UsersIcon, TagIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    SparklesIcon,
    ArrowRightIcon,
    BanknotesIcon,
    WrenchScrewdriverIcon,
    ArrowDownTrayIcon,

    ChatBubbleLeftRightIcon,
    ChatBubbleLeftEllipsisIcon,
    CloudArrowUpIcon,
    LinkIcon,
    BuildingStorefrontIcon,
    ComputerDesktopIcon,
    DocumentPlusIcon,
    ChevronLeftIcon,
    ChevronRightIcon,

    LightBulbIcon,
    Bars3BottomLeftIcon,
    Bars3Icon,
    CheckBadgeIcon,
    ClipboardDocumentCheckIcon,
    BuildingOffice2Icon,
    RocketLaunchIcon,
} from '@heroicons/react/24/outline'
import { Reorder } from 'framer-motion'
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'

import { useTenant } from './TenantContext'
import Select from './components/Select'
import FeatureManager, { type Feature } from './components/FeatureManager'
import ERPSyncModal from './components/modals/ERPSyncModal'
import ProjectTrackerWidget from './components/widgets/ProjectTrackerWidget'
import InventoryForecastWidget from './components/widgets/InventoryForecastWidget'
import InstallationSchedulerWidget from './components/widgets/InstallationSchedulerWidget'
import WarrantyClaimsWidget from './components/widgets/WarrantyClaimsWidget'
import POVerificationWidget from './components/widgets/POVerificationWidget'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import GenUIContainer from './components/gen-ui/GenUIContainer'
import SmartQuoteHub from './components/widgets/SmartQuoteHub';
import QuoteGenerationFlow from './components/QuoteGenerationFlow';
import { useGenUI } from './context/GenUIContext'
import DashboardMetricsGrid from './components/DashboardMetricsGrid';
import DashboardPerformanceGrid from './components/manufacturer/DashboardPerformanceGrid';
import DashboardReport from './components/manufacturer/DashboardReport';
import { Card } from 'strata-design-system';
import { useDemo } from './context/DemoContext'
import { useDemoProfile } from './context/useDemoProfile'
import AgentPipelineStrip from './components/simulations/AgentPipelineStrip'
import DemoAvatar, { AIAgentAvatar } from './components/simulations/DemoAvatars'
import MobileDeviceFrame from './components/simulations/MobileDeviceFrame'
import ConfidenceScoreBadge from './components/widgets/ConfidenceScoreBadge'
import DuplerReporting, { DuplerReportingNotification } from './components/simulations/DuplerReporting'
import { DuplerScReview } from './components/simulations/DuplerPdfProcessor'
import { WrgEstimatorReview } from './components/simulations/WrgLaborEstimation'
import { WrgIntakeReview } from './components/simulations/WrgIntake'

// Urgent Actions Data (Dealer Persona)
const urgentActions = [
    {
        id: 4,
        title: 'Acknowledgement Received - 2 Exceptions Require Review',
        description: 'Smart Acknowledgement Engine detected anomalies vs PO #ORD-2055',
        time: 'Under 10 mins',
        type: 'critical',
        action: 'Review Exceptions',
        icon: SparklesIcon,
        details: {
            fields: [
                { label: 'Vendor', value: 'AIS (American Industrial Systems)' },
                { label: 'Sales Order', value: '1151064-B' },
                { label: 'PO Reference', value: '#ORD-2055' },
                { label: 'Line Items', value: '40 items · $127,880.17' },
                { label: 'Match Rate', value: '95%' },
            ],
            exceptions: [
                { item: 'F-SSC346030C', issue: 'Finish backordered — substitution proposed', confidence: 91 },
                { item: 'X-LTD661218L', issue: '2 units backordered — ETA Nov 27', confidence: 76 },
            ],
        }
    },
    {
        id: 1,
        title: 'Quote #QT-2941 Expiring',
        description: 'Quote for "Office Images" expires in 2 hours.',
        time: '2h remaining',
        type: 'critical',
        action: 'Renew Quote',
        icon: ClockIcon,
        details: {
            fields: [
                { label: 'Client', value: 'Office Images Inc.' },
                { label: 'Quote Value', value: '$18,450.00 (Net after 55% disc.)' },
                { label: 'Items', value: '12 line items · 3 categories' },
                { label: 'Created', value: 'Mar 8, 2026 by Regional Sales Manager Reyes' },
                { label: 'Expiration Date', value: 'Mar 10, 2026 at 4:00 PM' },
            ],
            topItems: ['6× Ergonomic Task Chair ($471.60 ea)', '4× WORKSURFACE 30Dx72W ($249.28 ea)', '2× LATERAL FILE 36" ($566.96 ea)'],
        }
    },
    {
        id: 2,
        title: 'Low Stock Alert',
        description: 'Ergonomic Chair (Black) is below threshold (5 units).',
        time: 'Urgent',
        type: 'warning',
        action: 'Restock',
        icon: ExclamationTriangleIcon,
        details: {
            fields: [
                { label: 'Product', value: 'Ergonomic Task Chair — Mesh / Black' },
                { label: 'SKU', value: 'SKU-OFF-2025-002' },
                { label: 'Current Stock', value: '5 units', highlight: true },
                { label: 'Reorder Point', value: '20 units' },
                { label: 'Avg. Monthly Usage', value: '38 units (last 90 days)' },
                { label: 'Preferred Vendor', value: 'AIS · Lead time: 12 business days' },
            ],
            stockHistory: [42, 38, 30, 22, 15, 5],
        }
    },
    {
        id: 3,
        title: 'Pending Approval',
        description: 'Bulk Order #OR-999 requires manager approval.',
        time: '14m ago',
        type: 'info',
        action: 'Approve',
        icon: CheckCircleIcon,
        details: {
            fields: [
                { label: 'Order', value: '#OR-999 · Apex Furniture' },
                { label: 'Total Value', value: '$43,750.00' },
                { label: 'Items', value: '125 × Ergonomic Task Chair' },
                { label: 'Requested By', value: 'Regional Sales Manager Reyes · Regional Sales Mgr' },
                { label: 'Cost Center', value: 'Marketing-101' },
                { label: 'Ship To', value: 'Austin, TX Distribution Center' },
            ],
            approvalChain: [
                { name: 'Regional Sales Manager Reyes', role: 'Requester', status: 'done' },
                { name: 'Account Manager Kai', role: 'Account Mgr', status: 'current' },
                { name: 'Finance', role: 'Final Approval', status: 'pending' },
            ],
        }
    }
]

// Recent Activity Data (Dealer Persona)
const recentActivity = [
    {
        id: 1,
        title: 'Quote converted to PO',
        related: '#QT-2841',
        time: '2 hours ago',
        type: 'success',
        icon: CheckCircleIcon,
        actions: [
            { label: 'View PO', icon: EyeIcon, primary: true },
            { label: 'Download PDF', icon: ArrowDownTrayIcon, primary: false }
        ],
        details: {
            fields: [
                { label: 'CLIENT', value: 'Office Images Inc.' },
                { label: 'QUOTE VALUE', value: '$4,500.00' },
                { label: 'PO NUMBER', value: '#PO-8841' },
                { label: 'LINE ITEMS', value: '12 items' },
                { label: 'DISCOUNT', value: '8% volume' },
                { label: 'CONVERTED BY', value: 'Account Manager Kai' },
            ],
            timeline: [
                { step: 'Quote Created', date: 'Mar 5', done: true },
                { step: 'Client Approved', date: 'Mar 7', done: true },
                { step: 'PO Generated', date: 'Mar 10', done: true },
                { step: 'In production', date: 'Pending', done: false },
            ]
        }
    },
    {
        id: 2,
        title: 'Payment received',
        related: '#INV-7828',
        meta: 'Payment for USD 245.00 was received',
        time: '3 hours ago',
        type: 'info',
        icon: BanknotesIcon,
        actions: [
            { label: 'View Invoice', icon: EyeIcon, primary: true },
            { label: 'Email Receipt', icon: EnvelopeIcon, primary: false }
        ],
        details: {
            fields: [
                { label: 'CLIENT', value: 'TechDealer Solutions' },
                { label: 'INVOICE TOTAL', value: '$245.00' },
                { label: 'PAYMENT METHOD', value: 'ACH Transfer' },
                { label: 'REFERENCE', value: 'TRX-99281' },
                { label: 'TERMS', value: 'Net 30' },
                { label: 'DAYS TO PAY', value: '18 days (early)' },
            ],
            breakdown: [
                { item: 'Ergonomic Task Chair x2', amount: '$190.00' },
                { item: 'Shipping & Handling', amount: '$35.00' },
                { item: 'Tax (8.25%)', amount: '$20.00' },
            ]
        }
    },
    {
        id: 3,
        title: 'Discrepancy detected',
        related: '#OR-9823',
        time: '4 hours ago',
        type: 'warning',
        icon: ExclamationTriangleIcon,
        aiSuggestion: 'AI Suggests: Review shipping logs for weight mismatch.',
        actions: [
            { label: 'Review Issue', icon: WrenchScrewdriverIcon, primary: true },
            { label: 'Contact Support', icon: ChatBubbleLeftRightIcon, primary: false }
        ],
        details: {
            fields: [
                { label: 'ORDER', value: '#OR-9823' },
                { label: 'VENDOR', value: 'AIS — Affordable Interior Systems' },
                { label: 'TYPE', value: 'Weight mismatch' },
                { label: 'SEVERITY', value: 'Medium' },
            ],
            discrepancies: [
                { field: 'Shipped Weight', expected: '485 lbs', actual: '512 lbs', diff: '+27 lbs' },
                { field: 'Box Count', expected: '12 boxes', actual: '14 boxes', diff: '+2 boxes' },
            ]
        }
    },
    {
        id: 4,
        title: 'Shipment delayed',
        related: '#ORD-2056',
        meta: 'Carrier reports +8d delay due to weather. New ETA Mar 28 (was Mar 20).',
        time: '5 hours ago',
        type: 'error',
        icon: TruckIcon,
        actions: [
            { label: 'Track Shipment', icon: MapPinIcon, primary: true },
            { label: 'Notify Client', icon: ChatBubbleLeftRightIcon, primary: false }
        ],
        details: {
            fields: [
                { label: 'CARRIER', value: 'FedEx Freight LTL — Pro #FF884712' },
                { label: 'DEALER', value: 'Northline Furniture Group' },
                { label: 'ORIGIN', value: 'Leland Furniture · Grand Rapids, MI' },
                { label: 'DESTINATION', value: 'Continua IL Warehouse · Lincolnshire, IL' },
                { label: 'ORIGINAL ETA', value: 'Mar 20, 2026' },
                { label: 'NEW ETA', value: 'Mar 28, 2026 (+8 days)' },
            ],
            trackingSteps: [
                { location: 'Grand Rapids, MI — Picked up', date: 'Mar 12', status: 'done' },
                { location: 'Chicago, IL — In transit', date: 'Mar 17', status: 'done' },
                { location: 'Iowa City, IA — Weather hold (I-80 corridor)', date: 'Mar 19', status: 'current' },
                { location: 'Lincolnshire, IL — Delivery (CBD 24hrs)', date: 'Mar 28 (est)', status: 'pending' },
            ]
        }
    }
]

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



const trackingSteps = [
    { status: 'Order Entered', date: 'Dec 20, 9:00 AM', location: 'System', completed: true },
    { status: 'In production', date: 'Dec 21, 10:30 AM', location: 'Warehouse A', completed: true },
    { status: 'Shipped', date: 'Dec 22, 4:15 PM', location: 'Logistics Center', completed: true },
    { status: 'Delivered', date: 'Dec 24, 11:00 AM', location: 'Port of Entry', completed: false, alert: true },
]

// Mock Data for Recent Quotes
// Post-Neocon-review (2026-06-05) · status taxonomy aligned with E.1.i:
// Draft → In Progress · Approved (no longer a status · becomes a PO) · Pending + Sent + Expired stay.
const recentQuotes = [
    { id: 'QT-2942', date: 'Oct 24, 2023', amount: '$1,200.00', status: 'Pending' },
    { id: 'QT-2941', date: 'Oct 22, 2023', amount: '$4,500.00', status: 'Sent' },
    { id: 'QT-2940', date: 'Oct 20, 2023', amount: '$850.00', status: 'In Progress' },
    { id: 'QT-2939', date: 'Oct 15, 2023', amount: '$2,100.00', status: 'Expired' },
]

const recentOrders = [
    { id: "#ORD-2055", customer: "AutoManfacture Co.", client: "AutoManfacture Co.", project: "Office Renovation", amount: "$385,000", status: "PO received", date: "Dec 20, 2025", initials: "AC", statusColor: "bg-zinc-100 text-muted-foreground" },
    { id: "#ORD-2054", customer: "TechDealer Solutions", client: "TechDealer Solutions", project: "HQ Upgrade", amount: "$62,500", status: "In production", date: "Nov 15, 2025", initials: "TS", statusColor: "bg-brand-50 text-brand-700 ring-brand-600/20" },
    { id: "#ORD-2053", customer: "Urban Living Inc.", client: "Urban Living Inc.", project: "Lobby Refresh", amount: "$112,000", status: "Shipped", date: "Oct 30, 2025", initials: "UL", statusColor: "bg-green-50 text-green-700 ring-green-600/20" },
    { id: "#ORD-2052", customer: "Global Logistics", client: "Global Logistics", project: "Warehouse Expansion", amount: "$45,000", status: "Delivered", date: "Oct 15, 2025", initials: "GL", statusColor: "bg-gray-100 text-foreground" },
]



// Mock Data for Performance Metrics by Period
const performanceMetricsByPeriod: Record<string, { label: string; value: number; target: number; color: string; trend: string; trendUp: boolean }[]> = {
    Day:   [
        { label: 'Quote win rate', value: 72, target: 65, color: 'bg-brand-400', trend: '+4%', trendUp: true },
        { label: 'On-time delivery', value: 95, target: 90, color: 'bg-brand-400', trend: '+3%', trendUp: true },
        { label: 'Discrepancy resolution', value: 50, target: 80, color: 'bg-amber-500', trend: '+5%', trendUp: true },
        { label: 'Payment speed', value: 80, target: 75, color: 'bg-brand-400', trend: '+2%', trendUp: true },
        { label: 'Inventory accuracy', value: 99, target: 98, color: 'bg-brand-400', trend: '0%', trendUp: true },
    ],
    Month: [
        { label: 'Quote win rate', value: 68, target: 65, color: 'bg-brand-400', trend: '+3%', trendUp: true },
        { label: 'On-time delivery', value: 92, target: 90, color: 'bg-brand-400', trend: '+2%', trendUp: true },
        { label: 'Discrepancy resolution', value: 45, target: 80, color: 'bg-amber-500', trend: '-8%', trendUp: false },
        { label: 'Payment speed', value: 78, target: 75, color: 'bg-brand-400', trend: '+5%', trendUp: true },
        { label: 'Inventory accuracy', value: 99, target: 98, color: 'bg-brand-400', trend: '+1%', trendUp: true },
    ],
    Sem: [
        { label: 'Quote win rate', value: 64, target: 65, color: 'bg-amber-500', trend: '-2%', trendUp: false },
        { label: 'On-time delivery', value: 89, target: 90, color: 'bg-amber-500', trend: '-1%', trendUp: false },
        { label: 'Discrepancy resolution', value: 52, target: 80, color: 'bg-amber-500', trend: '+12%', trendUp: true },
        { label: 'Payment speed', value: 74, target: 75, color: 'bg-amber-500', trend: '-3%', trendUp: false },
        { label: 'Inventory accuracy', value: 97, target: 98, color: 'bg-amber-500', trend: '-1%', trendUp: false },
    ],
    Year: [
        { label: 'Quote win rate', value: 61, target: 65, color: 'bg-amber-500', trend: '-4%', trendUp: false },
        { label: 'On-time delivery', value: 88, target: 90, color: 'bg-amber-500', trend: '-3%', trendUp: false },
        { label: 'Discrepancy resolution', value: 38, target: 80, color: 'bg-amber-500', trend: '-15%', trendUp: false },
        { label: 'Payment speed', value: 71, target: 75, color: 'bg-amber-500', trend: '-6%', trendUp: false },
        { label: 'Inventory accuracy', value: 96, target: 98, color: 'bg-amber-500', trend: '-2%', trendUp: false },
    ],
}

// Mock Data for AI Suggestions
const aiSuggestions = [
    {
        id: 1,
        title: 'Consolidate Shipments',
        description: 'Combine 3 pending orders for "TechDealer" to save 12% on shipping.',
        impact: 'Save $450',
        icon: TruckIcon,
        type: 'savings',
        details: {
            fields: [
                { label: 'CLIENT', value: 'TechDealer Solutions' },
                { label: 'ORDERS', value: '#OR-9820, #OR-9821, #OR-9823' },
                { label: 'CURRENT SHIPPING', value: '$3,750 (3 separate)' },
                { label: 'CONSOLIDATED', value: '$3,300 (1 combined)' },
            ],
            reasoning: 'All 3 orders ship to the same destination (Chicago, IL) from the same vendor (AIS, Lodi CA). Consolidating into a single LTL shipment reduces per-order freight by 12%.',
            confidence: 94
        }
    },
    {
        id: 2,
        title: 'Bulk Discount Available',
        description: 'Order 5 more "ErgoChairs" to unlock tier-2 pricing (-5%).',
        impact: 'Margin +2%',
        icon: TagIcon,
        type: 'opportunity',
        details: {
            fields: [
                { label: 'PRODUCT', value: 'ErgoChair Pro — Mesh / Black' },
                { label: 'CURRENT QTY', value: '20 units (Tier 1)' },
                { label: 'TIER 2 THRESHOLD', value: '25 units' },
                { label: 'PRICE DROP', value: '$285 → $270.75 per unit' },
            ],
            reasoning: 'Your Q1 demand forecast shows 32 ErgoChairs needed. Ordering 5 additional now at tier-2 pricing saves $713.75 across the full order and improves margin from 18% to 20%.',
            confidence: 87
        }
    },
    {
        id: 3,
        title: 'Renew Service Agreement',
        description: 'Tenant "Global Logistics" contract expires in 15 days.',
        impact: 'Retention',
        icon: DocumentTextIcon,
        type: 'action',
        details: {
            fields: [
                { label: 'TENANT', value: 'Global Logistics Corp.' },
                { label: 'CONTRACT VALUE', value: '$45,000/yr' },
                { label: 'EXPIRES', value: 'Mar 25, 2026' },
                { label: 'TENURE', value: '3 years (since 2023)' },
            ],
            reasoning: 'Global Logistics has been a consistent client with 98% on-time payments. Their order volume grew 15% YoY. Early renewal with a 2-year lock could secure a 5% rate increase.',
            confidence: 91
        }
    }
]

// Color Mapping for Status Icons - Optimized for Dark Mode Contrast
const colorStyles: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/30',
    purple: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30',
    orange: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30',
    green: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30',
    pink: 'bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300 ring-1 ring-inset ring-pink-600/20 dark:ring-pink-400/30',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30',
}

// Solid Color Mapping for Action Buttons (High Contrast)
const solidColorStyles: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 border-blue-500',
    purple: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-purple-500/20 border-indigo-500',
    orange: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-orange-500/20 border-amber-500',
    green: 'bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-500/20 border-green-500',
    pink: 'bg-pink-600 hover:bg-pink-700 text-white shadow-sm shadow-pink-500/20 border-pink-500',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 border-indigo-500',
}

// Simulate Platform Summary Data
const platformSummary = {
    inventory: { label: 'Inventory', value: '$1.2M', sub1: '4.5x Turnover', sub2: '15 Low Stock', icon: <CubeIcon className="w-5 h-5" />, color: 'blue', change: '+0.2%', positive: true },
    catalogs: { label: 'Catalogs', value: '12 Active', sub1: '450 New Items', sub2: '8.5k Views', icon: <BookOpenIcon className="w-5 h-5" />, color: 'purple', change: '+15%', positive: true },
    mac: { label: 'Service Center', value: '8 Pending', sub1: '12 Scheduled', sub2: '45 Completed', icon: <TruckIcon className="w-5 h-5" />, color: 'orange', change: '-2%', positive: false },
    transactions: { label: 'Transactions', value: '$385k Rev', sub1: '12 Pending', sub2: '$4.2k Avg Order', icon: <ClipboardDocumentListIcon className="w-5 h-5" />, color: 'green', change: '+3.5%', positive: true },
    crm: { label: 'CRM', value: '45 Leads', sub1: '22% Conv. Rate', sub2: '4.8/5 CSAT', icon: <UsersIcon className="w-5 h-5" />, color: 'pink', change: '+1.2%', positive: true },
    pricing: { label: 'Pricing', value: '24% Margin', sub1: '3 Discounts', sub2: '150 Updates', icon: <TagIcon className="w-5 h-5" />, color: 'indigo', change: '0%', positive: true },
}

// Define props interface if not heavily inferred or complex
interface DashboardProps {
    onLogout: () => void;
    onNavigateToDetail: () => void;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: string) => void;
}

export default function Dashboard({ onLogout, onNavigateToDetail, onNavigateToWorkspace, onNavigate }: DashboardProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showMetrics, setShowMetrics] = useState(false);
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
    // const { theme, toggleTheme } = useTheme() // Removed - useTheme not available
    const { currentTenant } = useTenant()
    const { sendMessage, setStreamOpen, setShowTriggers } = useGenUI()
    const { currentStep, nextStep, isDemoActive, isPaused } = useDemo()
    const { activeProfile } = useDemoProfile();
    const isOps = activeProfile.id === 'ops';
    const isContinua = activeProfile.id === 'continua';
    const isInboundOutbound = activeProfile.id === 'inbound-outbound';
    const stepId = currentStep?.id || '';

    // Pause-aware timer helper (same pattern as DemoProcessPanel)
    const isPausedRef = useRef(isPaused);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    const pauseAware = useCallback((fn: () => void) => {
        return () => {
            if (!isPausedRef.current) { fn(); return; }
            const poll = setInterval(() => {
                if (!isPausedRef.current) { clearInterval(poll); fn(); }
            }, 200);
        };
    }, []);

    // ─── Continua Step 3.1: Sustainability Dashboard ──────────────────────────
    type SustPhase = 'idle' | 'notification' | 'processing' | 'revealed' | 'results'
    const SUST_AGENTS = [
        { name: 'MetricsCompiler', detail: 'Compiling UAL project impact metrics...' },
        { name: 'CarbonCalculator', detail: 'Calculating embodied carbon reduction — 78%...' },
        { name: 'NarrativeGenerator', detail: 'Generating Metropolis Award submission narrative...' },
        { name: 'BenchmarkEngine', detail: 'Benchmarking against industry standards...' },
        { name: 'ReportPublisher', detail: 'Publishing sustainability dashboard...' },
    ]
    const SUST_CATEGORIES = [
        { label: 'Seating', diverted: 82, carbon: 45, savings: '$142K' },
        { label: 'Workstations', diverted: 48, carbon: 18, savings: '$98K' },
        { label: 'Storage', diverted: 32, carbon: 8, savings: '$45K' },
        { label: 'Architectural', diverted: 20, carbon: 5, savings: '$38K' },
        { label: 'AV Equipment', diverted: 12, carbon: 2, savings: '$17K' },
    ]
    const [sustPhase, setSustPhase] = useState<SustPhase>('idle')
    const sustPhaseRef = useRef(sustPhase)
    useEffect(() => { sustPhaseRef.current = sustPhase }, [sustPhase])
    const [sustAgents, setSustAgents] = useState(SUST_AGENTS.map(a => ({ ...a, visible: false, done: false })))
    const [sustProgress, setSustProgress] = useState(0)

    useEffect(() => {
        if (!isContinua || stepId !== '4.1') { setSustPhase('idle'); return }
        setSustPhase('idle')
        setSustAgents(SUST_AGENTS.map(a => ({ ...a, visible: false, done: false })))
        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(pauseAware(() => setSustPhase('notification')), 1500))
        timers.push(setTimeout(pauseAware(() => { if (sustPhaseRef.current === 'notification') setSustPhase('processing') }), 5500))
        return () => timers.forEach(clearTimeout)
    }, [isContinua, stepId])

    useEffect(() => {
        if (sustPhase !== 'processing') return
        setSustAgents(SUST_AGENTS.map(a => ({ ...a, visible: false, done: false })))
        setSustProgress(0)
        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(() => setSustProgress(100), 50))
        SUST_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setSustAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * 600))
            timers.push(setTimeout(pauseAware(() => setSustAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * 600 + 450))
        })
        timers.push(setTimeout(pauseAware(() => setSustPhase('revealed')), SUST_AGENTS.length * 600 + 800))
        return () => timers.forEach(clearTimeout)
    }, [sustPhase])

    useEffect(() => {
        if (sustPhase !== 'revealed') return
        const t = setTimeout(pauseAware(() => setSustPhase('results')), 1500)
        return () => clearTimeout(t)
    }, [sustPhase])

    useEffect(() => {
        if (sustPhase !== 'results') return
        const t = setTimeout(pauseAware(() => nextStep()), 8000)
        return () => clearTimeout(t)
    }, [sustPhase])

    // Step 3.4: End User mobile report state
    const [punchComment, setPunchComment] = useState('')
    const [punchCommentSent, setPunchCommentSent] = useState(false)
    const [showAckModal, setShowAckModal] = useState(false)
    const [portalTab, setPortalTab] = useState<'orders' | 'claims' | 'messages'>('orders')
    const [deliveryConfirmed, setDeliveryConfirmed] = useState(false)
    useEffect(() => {
        if (currentStep?.id !== '3.5') { setPunchComment(''); setPunchCommentSent(false); setShowAckModal(false); setPortalTab('orders'); setDeliveryConfirmed(false); }
    }, [currentStep?.id])

    // Step 1.6: Client Review & Approval (Continua — End User mobile)
    const [clientApproved, setClientApproved] = useState(false)
    useEffect(() => {
        if (currentStep?.id !== '1.6') { setClientApproved(false); }
    }, [currentStep?.id])

    // Step d2.7: Dealer Review & Dispatch Approval (Dupler — Dealer mobile)
    const [dealerDispatchApproved, setDealerDispatchApproved] = useState(false)
    const [dealerReviewPhase, setDealerReviewPhase] = useState<'notification' | 'review'>('notification')
    useEffect(() => {
        if (currentStep?.id !== 'd2.7') { setDealerDispatchApproved(false); setDealerReviewPhase('notification'); }
    }, [currentStep?.id])

    // Step 2.1: Service Request (Continua — End User mobile)
    const [serviceSubmitted, setServiceSubmitted] = useState(false)
    useEffect(() => {
        if (currentStep?.id !== '2.1') { setServiceSubmitted(false); }
    }, [currentStep?.id])

    const handleGenUIAction = (prompt: string) => {
        setStreamOpen(true);
        setShowTriggers(false);
        sendMessage(prompt);
    };

    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const expandedScrollRef = useRef<HTMLDivElement>(null)

    const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
        if (ref.current) {
            const scrollAmount = 320; // Adjusted for card width + gap
            ref.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    }

    // Demo Flow 1 Types
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedClient, setSelectedClient] = useState('All Clients')
    const [selectedProject, setSelectedProject] = useState('All Projects')

    const [activeTab, setActiveTab] = useState<'metrics' | 'active' | 'completed' | 'all'>('active')
    const [mainTab, setMainTab] = useState<'follow_up' | 'your_tools' | 'metrics'>('follow_up')
    const [reportOpen, setReportOpen] = useState(false)
    const [expandedActionId, setExpandedActionId] = useState<number | null>(null)
    const [highlightedAction, setHighlightedAction] = useState<number | null>(null)
    const [isCustomizeHighlighted, setIsCustomizeHighlighted] = useState(false)

    // Listen for Demo Guide Highlights
    useEffect(() => {
        const handleHighlight = (e: CustomEvent) => {
            if (e.detail === 'ack-urgent-action') {
                // Assuming 'follow_up' tab is already active default, set highlight to ID 4 (ACK Received)
                setMainTab('follow_up');
                setHighlightedAction(4);
                setTimeout(() => setHighlightedAction(null), 4000);
            } else if (e.detail === 'dashboard-customize-tools') {
                setMainTab('your_tools');
                setIsCustomizeHighlighted(true);
                setTimeout(() => setIsCustomizeHighlighted(false), 4000);
            } else if (e.detail === 'dupler-switch-to-metrics') {
                setMainTab('metrics');
            }
        };
        window.addEventListener('demo-highlight', handleHighlight as EventListener);
        return () => window.removeEventListener('demo-highlight', handleHighlight as EventListener);
    }, []);

    // Step 1.7 — Manager Approval (Sara's dashboard view)
    const [managerApproved17, setManagerApproved17] = useState(false)
    const [notifArrived17, setNotifArrived17] = useState(false)
    const [contentVisible17, setContentVisible17] = useState(false)
    const [lineItemPage17, setLineItemPage17] = useState(0)
    const [requestChangesOpen17, setRequestChangesOpen17] = useState(false)
    useEffect(() => {
        if (currentStep?.id !== '1.7' || isOps) { setManagerApproved17(false); setNotifArrived17(false); setContentVisible17(false); setLineItemPage17(0); setRequestChangesOpen17(false); return; }
        const t: ReturnType<typeof setTimeout>[] = [];
        t.push(setTimeout(pauseAware(() => setNotifArrived17(true)), 1080));
        t.push(setTimeout(pauseAware(() => setContentVisible17(true)), 2700));
        return () => t.forEach(clearTimeout);
    }, [currentStep?.id, pauseAware, isOps]);

    // Step 1.6 — Quote Approval Chain (2 approvers: System Policy auto → Regional Sales Manager Reyes → auto-advance) — COI only
    const [approvalStates16, setApprovalStates16] = useState<('pending' | 'approved')[]>(['pending', 'pending'])
    useEffect(() => {
        if (currentStep?.id !== '1.6' || isOps) {
            setApprovalStates16(['pending', 'pending']);
            return;
        }
        const timeouts: ReturnType<typeof setTimeout>[] = [];
        timeouts.push(setTimeout(pauseAware(() => setApprovalStates16(['approved', 'pending'])), 6750));
        timeouts.push(setTimeout(pauseAware(() => setApprovalStates16(['approved', 'approved'])), 13500));
        timeouts.push(setTimeout(pauseAware(() => nextStep()), 18900));
        return () => timeouts.forEach(clearTimeout);
    }, [currentStep?.id, pauseAware, isOps]);
    const approvedCount16 = approvalStates16.filter(s => s === 'approved').length;

    // Step 1.9 — PO Generation + Order Approval Chain (fully automated) — COI only
    const [phase18, setPhase18] = useState<'showing-approvals' | 'po-generating' | 'po-complete' | 'order-chain' | 'order-complete' | 'done'>('showing-approvals')
    const [poGenPhase18, setPoGenPhase18] = useState<'building' | 'mapping' | 'validating' | 'complete'>('building')
    const [orderApprovalStates18, setOrderApprovalStates18] = useState<('pending' | 'approved')[]>(['pending', 'pending', 'pending'])
    useEffect(() => {
        if (currentStep?.id !== '1.9' || isOps) {
            setPhase18('showing-approvals');
            setPoGenPhase18('building');
            setOrderApprovalStates18(['pending', 'pending', 'pending']);
            return;
        }
        const t: ReturnType<typeof setTimeout>[] = [];
        t.push(setTimeout(pauseAware(() => setPhase18('po-generating')), 2700));
        t.push(setTimeout(pauseAware(() => setPoGenPhase18('mapping')), 5400));
        t.push(setTimeout(pauseAware(() => setPoGenPhase18('validating')), 8100));
        t.push(setTimeout(pauseAware(() => { setPoGenPhase18('complete'); setPhase18('po-complete'); }), 10800));
        t.push(setTimeout(pauseAware(() => setPhase18('order-chain')), 13500));
        t.push(setTimeout(pauseAware(() => setOrderApprovalStates18(['approved', 'pending', 'pending'])), 20250));
        t.push(setTimeout(pauseAware(() => setOrderApprovalStates18(['approved', 'approved', 'pending'])), 27000));
        t.push(setTimeout(pauseAware(() => setOrderApprovalStates18(['approved', 'approved', 'approved'])), 33750));
        t.push(setTimeout(pauseAware(() => setPhase18('order-complete')), 39150));
        t.push(setTimeout(pauseAware(() => { setPhase18('done'); nextStep(); }), 49950));
        return () => t.forEach(clearTimeout);
    }, [currentStep?.id, pauseAware]);
    const orderApprovedCount18 = orderApprovalStates18.filter(s => s === 'approved').length;

    // Step 1.10 — Smart Notifications (Action Center shows the notification)

    // OPS state variables
    const [qbSynced16, setQbSynced16] = useState(false);
    const [qbConfirmed17, setQbConfirmed17] = useState(false);
    const [coDone21, setCoDone21] = useState(false);
    // OPS Step 2.4 — auto step animation states
    const [opsAmendCards, setOpsAmendCards] = useState<number>(0);

    const [exportedReport32, setExportedReport32] = useState(false);

    // Reset OPS states when step changes
    useEffect(() => {
        if (!isOps) return;
        setQbSynced16(false);
        setQbConfirmed17(false);
        setCoDone21(false);
        setOpsAmendCards(0);
        setExportedReport32(false);
    }, [currentStep?.id, isOps]);

    // OPS Step 2.4 — staggered card animation (auto 18s)
    useEffect(() => {
        if (currentStep?.id !== '2.4' || !isOps) return;
        const t: ReturnType<typeof setTimeout>[] = [];
        t.push(setTimeout(pauseAware(() => setOpsAmendCards(1)), 3000));
        t.push(setTimeout(pauseAware(() => setOpsAmendCards(2)), 6000));
        t.push(setTimeout(pauseAware(() => setOpsAmendCards(3)), 9000));
        return () => t.forEach(clearTimeout);
    }, [currentStep?.id, isOps, pauseAware]);

    const [expandedActivityId, setExpandedActivityId] = useState<number | null>(null)
    const [expandedSuggestionId, setExpandedSuggestionId] = useState<number | null>(null)
    const [performanceTimePeriod, setPerformanceTimePeriod] = useState<'Day' | 'Month' | 'Sem' | 'Year'>('Month')
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const [isERPSyncModalOpen, setIsERPSyncModalOpen] = useState(false);
    const [isFeatureManagerOpen, setIsFeatureManagerOpen] = useState(false);

    // Mock dashboard customization
    const [activeFeatures, setActiveFeatures] = useState([
        'smart_quote',
        'follow_up_assistant',
        'inventory_forecast'
    ])
    const [features, setFeatures] = useState<Feature[]>([
        // Core (Existing)
        { id: 'recent_orders', title: 'Recent Orders', description: 'Track active, completed, and pending orders at a glance.', enabled: true, category: 'core' },
        { id: 'quick_quote', title: 'Quick Quote', description: 'Start quotes manually or via ERP upload.', enabled: true, category: 'core', required: true },
        // ... other features
        { id: 'project_tracker', title: 'Project Tracker', description: 'Monitor progress across all active installations.', enabled: true, category: 'core' },
        { id: 'inventory_forecast', title: 'Inventory Forecast', description: 'Predict stock needs based on seasonal trends.', enabled: false, category: 'analytics' },
        { id: 'installation_scheduler', title: 'Installation Scheduler', description: 'Manage field teams and site visits.', enabled: false, category: 'operations' },
        { id: 'warranty_claims', title: 'Warranty Claims', description: 'Process and track product issues.', enabled: true, category: 'support' },
        { id: 'po_verification', title: 'PO Verification', description: 'Automated 3-way matching for purchases.', enabled: false, category: 'finance' },
    ])

    // Tools Ordering State
    const [toolsOrder, setToolsOrder] = useState<string[]>([
        'recent_orders',
        'quick_quote',
        'project_tracker',
        'warranty_claims'
    ])

    // Effect to ensure toolsOrder stays in sync with enabled features (optional auto-cleanup)
    // For now, the loop below just checks `features.find(f => f.id === toolId)?.enabled`

    const handleToggleFeature = (id: string, enabled: boolean) => {
        setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled } : f))

        // If enabling a feature not in order, add it to top (or bottom)
        if (enabled && !toolsOrder.includes(id)) {
            setToolsOrder(prev => [id, ...prev])
        }
    }

    const clients = ['All Clients', ...Array.from(new Set(recentOrders.map(o => o.client)))]

    // Filter projects based on selected client
    const availableProjects = useMemo(() => {
        if (selectedClient === 'All Clients') {
            return ['All Projects', ...Array.from(new Set(recentOrders.map(o => o.project)))]
        }
        return ['All Projects', ...Array.from(new Set(recentOrders.filter(o => o.client === selectedClient).map(o => o.project)))]
    }, [selectedClient])

    // Update selectedProject when selectedClient changes
    useEffect(() => {
        if (selectedClient !== 'All Clients' && availableProjects.length > 1) {
            // Auto-select first specific project as requested
            setSelectedProject(availableProjects[1])
        } else {
            setSelectedProject('All Projects')
        }
    }, [selectedClient, availableProjects])
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
    const [trackingOrder, setTrackingOrder] = useState<any>(null)

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedIds(newExpanded)
    }

    // Dynamic Metrics Data based on current filters (Client/Project)


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
                matchesTab = true // Metrics view handles its own data, this filter is for the table if shown
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
        <div className={`font-sans text-foreground ${!isOps && ['1.8', '1.6', '2.1', '3.5'].includes(currentStep?.id) ? 'min-h-[200vh] bg-zinc-950 -mt-16 pt-16' : 'min-h-screen bg-background pb-10'}`}>
            {/* AI command bar hidden for the inbound-outbound demo (per user) */}
            {!isInboundOutbound && !(!isOps && ['1.8', '1.6', '2.1', '3.5'].includes(currentStep?.id)) && <GenUIContainer />}

            {/* ===== Step 1.6: Client Review & Approval — Mobile device (Continua) ===== */}
            {currentStep?.id === '1.6' && (
                <div data-demo-target="mobile-client-review" className="flex items-start justify-center pt-6 min-h-[calc(100vh-4rem)] animate-in fade-in duration-500">
                    <MobileDeviceFrame>
                        {/* Mobile Navbar */}
                        <div className="flex items-center justify-between px-4 pt-10 pb-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                                    <span className="text-[10px] font-black text-primary-foreground">S</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-medium leading-none">Project Manager</p>
                                    <p className="text-xs font-bold text-foreground leading-tight">Emily Chen</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <BellIcon className="w-5 h-5 text-foreground" />
                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">1</div>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">EC</span>
                                </div>
                            </div>
                        </div>

                        {/* Push Notification */}
                        <div className="mx-3 mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 animate-in slide-in-from-top-2 duration-500">
                            <div className="flex items-start gap-2.5">
                                <div className="p-1.5 bg-blue-500/20 rounded-lg shrink-0">
                                    <DocumentTextIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-blue-500 font-medium">Just now</p>
                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Inventory Intelligence Report</p>
                                    <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">UAL HQ — 5 modules analyzed, ready for your approval.</p>
                                </div>
                            </div>
                        </div>

                        {/* Report Card */}
                        <div className="mx-3 mt-3 rounded-xl bg-card border border-border overflow-hidden shadow-sm">
                            {/* Visual Header */}
                            <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 px-4 py-5 text-white overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full blur-3xl"></div>
                                </div>
                                <div className="relative z-10 text-center">
                                    <SparklesIcon className="w-5 h-5 mx-auto mb-1.5 text-indigo-200" />
                                    <p className="font-bold text-sm tracking-tight">UAL HQ — Chicago</p>
                                    <p className="text-indigo-200 text-[9px] uppercase tracking-widest mt-0.5">Inventory Intelligence Report</p>
                                </div>
                            </div>

                            {/* Summary Sections */}
                            <div className="p-3 space-y-2">
                                {[
                                    { step: '1.1', title: 'Asset Health', summary: 'Score: 87% — 3 alerts flagged', color: 'blue' },
                                    { step: '1.2', title: 'Reuse Assessment', summary: '12 items cataloged — $45K savings', color: 'emerald' },
                                    { step: '1.3', title: 'Price Verified', summary: '$110K savings across 3 categories', color: 'amber' },
                                    { step: '1.4', title: 'Locations Synced', summary: '4 locations — deliveries confirmed', color: 'violet' },
                                    { step: '1.5', title: 'Consignment', summary: '4 RMA + 4 convert-to-purchase', color: 'rose' },
                                ].map((section, i) => (
                                    <div key={section.step} className={`p-2.5 rounded-lg border ${clientApproved ? 'border-green-300 dark:border-green-500/30 bg-green-50/30 dark:bg-green-500/5' : 'border-border bg-muted/20'} transition-all duration-300`} style={{ animationDelay: `${i * 80}ms` }}>
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-[9px] font-bold shrink-0 ${
                                                section.color === 'blue' ? 'bg-blue-500' :
                                                section.color === 'emerald' ? 'bg-success' :
                                                section.color === 'amber' ? 'bg-amber-500' :
                                                section.color === 'violet' ? 'bg-ai' : 'bg-rose-500'
                                            }`}>{section.step}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-bold text-foreground">{section.title}</p>
                                                <p className="text-[9px] text-muted-foreground">{section.summary}</p>
                                            </div>
                                            {clientApproved && <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Key Metrics */}
                            <div className="px-3 pb-3">
                                <div className="grid grid-cols-3 gap-1.5">
                                    {[
                                        { label: 'Savings', value: '$166,600' },
                                        { label: 'Assets', value: '1,247' },
                                        { label: 'Locations', value: '4' },
                                    ].map(item => (
                                        <div key={item.label} className="p-1.5 rounded-lg bg-muted/50 text-center">
                                            <p className="text-[8px] text-muted-foreground">{item.label}</p>
                                            <p className="text-[11px] font-bold text-foreground">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* AI Verified badge */}
                        <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                            <p className="text-[9px] text-indigo-700 dark:text-indigo-300 text-center leading-relaxed">
                                <span className="font-semibold">AI Verified</span> — All 5 modules analyzed by Strata Intelligence Engine
                            </p>
                        </div>

                        {/* Action Button */}
                        <div className="mx-3 mt-4 mb-4">
                            {!clientApproved ? (
                                <button
                                    onClick={() => setClientApproved(true)}
                                    className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Approve All Changes
                                </button>
                            ) : (
                                <div className="space-y-3 animate-in fade-in duration-300">
                                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                                        <div className="flex items-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                            <div>
                                                <p className="text-xs font-bold text-green-700 dark:text-green-300">All Changes Approved</p>
                                                <p className="text-[10px] text-green-600/80 dark:text-green-400/70">Emily Chen · $166,600 savings confirmed</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => nextStep()}
                                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98]"
                                    >
                                        Continue
                                    </button>
                                </div>
                            )}
                        </div>
                    </MobileDeviceFrame>
                </div>
            )}

            {/* d2.7 now renders inside Follow Up tab below */}

            {/* ===== Step 2.1: Service Request — Mobile device (Continua End User) ===== */}
            {currentStep?.id === '2.1' && !isOps && (
                <div data-demo-target="mobile-service-request" className="flex items-start justify-center pt-6 min-h-[calc(100vh-4rem)] animate-in fade-in duration-500">
                    <MobileDeviceFrame>
                        {/* Mobile Navbar */}
                        <div className="flex items-center justify-between px-4 pt-10 pb-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                                    <span className="text-[10px] font-black text-primary-foreground">S</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-medium leading-none">Facilities Coordinator</p>
                                    <p className="text-xs font-bold text-foreground leading-tight">Carlos Rivera</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <BellIcon className="w-5 h-5 text-foreground" />
                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">2</div>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">CR</span>
                                </div>
                            </div>
                        </div>

                        {/* Service Request Banner */}
                        <div className="mx-3 mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 animate-in slide-in-from-top-2 duration-500">
                            <div className="flex items-start gap-2.5">
                                <div className="p-1.5 bg-amber-500/20 rounded-lg shrink-0">
                                    <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-amber-500 font-medium">Service Request</p>
                                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Report a Facility Issue</p>
                                    <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">Submit details to the Strata service center.</p>
                                </div>
                            </div>
                        </div>

                        {/* Service Request Card */}
                        <div className="mx-3 mt-3 rounded-xl bg-card border border-border overflow-hidden shadow-sm">
                            {/* Visual Header */}
                            <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 px-4 py-5 text-white overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full blur-3xl"></div>
                                </div>
                                <div className="relative z-10 text-center">
                                    <WrenchScrewdriverIcon className="w-5 h-5 mx-auto mb-1.5 text-amber-200" />
                                    <p className="font-bold text-sm tracking-tight">Office 3-214 — Issue Report</p>
                                    <p className="text-amber-200 text-[9px] uppercase tracking-widest mt-0.5">Facility Service Request</p>
                                </div>
                            </div>

                            {/* Issue Items */}
                            <div className="p-3 space-y-2">
                                {[
                                    { icon: ExclamationTriangleIcon, label: 'Issue #1 — SAFETY', value: 'Aeron Chair — Gas cylinder failure', asset: 'AST-1847', color: 'red', priority: true },
                                    { icon: LightBulbIcon, label: 'Issue #2', value: 'Desk Lamp — Flickering / intermittent', asset: 'AST-2103', color: 'amber', priority: false },
                                ].map((item, i) => (
                                    <div key={item.label} className={`p-2.5 rounded-lg border ${serviceSubmitted ? 'border-green-300 dark:border-green-500/30 bg-green-50/30 dark:bg-green-500/5' : item.priority ? 'border-red-300 dark:border-red-500/30 bg-red-50/30 dark:bg-red-500/5' : 'border-border bg-muted/20'} transition-all duration-300 animate-in fade-in slide-in-from-bottom-1`} style={{ animationDelay: `${i * 80}ms` }}>
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0 ${item.color === 'red' ? 'bg-red-500' : 'bg-amber-500'}`}>
                                                <item.icon className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-[9px] text-muted-foreground">{item.label}</p>
                                                    {item.priority && <span className="text-[7px] px-1 py-0.5 rounded bg-red-500 text-white font-bold">SAFETY</span>}
                                                </div>
                                                <p className="text-[11px] font-bold text-foreground">{item.value}</p>
                                                <p className="text-[9px] text-muted-foreground">Asset: {item.asset}</p>
                                            </div>
                                            {serviceSubmitted && <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Location & Priority */}
                            <div className="px-3 pb-3">
                                <div className="grid grid-cols-3 gap-1.5">
                                    {[
                                        { label: 'Location', value: 'Office 3-214' },
                                        { label: 'Priority', value: 'HIGH' },
                                        { label: 'Department', value: 'Facilities' },
                                    ].map(item => (
                                        <div key={item.label} className={`p-1.5 rounded-lg text-center ${item.label === 'Priority' ? 'bg-red-50 dark:bg-red-500/10' : 'bg-muted/50'}`}>
                                            <p className="text-[8px] text-muted-foreground">{item.label}</p>
                                            <p className={`text-[11px] font-bold ${item.label === 'Priority' ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Safety Flag Notice */}
                        <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                            <p className="text-[9px] text-red-700 dark:text-red-300 text-center leading-relaxed">
                                <span className="font-semibold">⚠ Safety Flag:</span> Gas cylinder failure requires immediate attention
                            </p>
                        </div>

                        {/* Action Button */}
                        <div className="mx-3 mt-4 mb-4">
                            {!serviceSubmitted ? (
                                <button
                                    onClick={() => setServiceSubmitted(true)}
                                    className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <WrenchScrewdriverIcon className="w-4 h-4" />
                                    Submit Service Request
                                </button>
                            ) : (
                                <div className="space-y-3 animate-in fade-in duration-300">
                                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                                        <div className="flex items-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                            <div>
                                                <p className="text-xs font-bold text-green-700 dark:text-green-300">REQ-FM-2026-018 Created</p>
                                                <p className="text-[10px] text-green-600/80 dark:text-green-400/70">Carlos Rivera · Routed to Service Center</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => nextStep()}
                                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98]"
                                    >
                                        Continue
                                    </button>
                                </div>
                            )}
                        </div>
                    </MobileDeviceFrame>
                </div>
            )}

            {/* ===== Step 1.8: Sales Approval — Mobile device inline (COI only) ===== */}
            {currentStep?.id === '1.8' && !isOps && (
                <div data-demo-target="mobile-dealer-approval" className="flex items-start justify-center pt-6 min-h-[calc(100vh-4rem)] animate-in fade-in duration-500">
                    {/* Mobile Device Frame — centered, nothing else */}
                    <MobileDeviceFrame>
                        {/* Mobile Navbar */}
                        <div className="flex items-center justify-between px-4 pt-10 pb-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                                    <span className="text-[10px] font-black text-primary-foreground">S</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-medium leading-none">Sales Analyst</p>
                                    <p className="text-xs font-bold text-foreground leading-tight">Strata PM Alpha</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <BellIcon className="w-5 h-5 text-foreground" />
                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">1</div>
                                </div>
                                <img
                                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face"
                                    alt="Carlos Rivera"
                                    className="w-7 h-7 rounded-full object-cover ring-1 ring-border"
                                />
                            </div>
                        </div>

                        {/* Push Notification Banner */}
                        <div className="mx-3 mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 animate-in slide-in-from-top-2 duration-500">
                            <div className="flex items-start gap-2.5">
                                <div className="p-1.5 bg-blue-500/20 rounded-lg shrink-0">
                                    <BellIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-blue-500 font-medium">Just now</p>
                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Quote Approved</p>
                                    <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">QT-1025 for Apex Furniture has been fully approved and transmitted.</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Quote — Visual Presentation */}
                        <div className="mx-3 mt-3 rounded-xl bg-card border border-border overflow-hidden shadow-sm">
                            {/* Visual Header — gradient with client branding */}
                            <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 px-4 py-5 text-white overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full blur-3xl"></div>
                                </div>
                                <div className="relative z-10 text-center">
                                    <SparklesIcon className="w-5 h-5 mx-auto mb-1.5 text-indigo-200" />
                                    <p className="font-bold text-sm tracking-tight">Apex Furniture</p>
                                    <p className="text-indigo-200 text-[9px] uppercase tracking-widest mt-0.5">Customer Proposal</p>
                                </div>
                            </div>

                            <div className="p-3 space-y-3">
                                {/* Style + Total */}
                                <div className="flex justify-between items-end border-b border-border pb-2.5">
                                    <div>
                                        <p className="text-[9px] text-muted-foreground uppercase font-semibold">Style</p>
                                        <p className="text-xs font-medium text-foreground">Modern Workspace — Open Plan</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-muted-foreground uppercase font-semibold">Total</p>
                                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">$43,750</p>
                                    </div>
                                </div>

                                {/* Moodboard — product imagery placeholders */}
                                <div className="grid grid-cols-3 gap-1.5">
                                    {['Workstations', 'Task Chairs', 'Lounge'].map(label => (
                                        <div key={label} className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
                                            <p className="text-[7px] text-muted-foreground font-medium">{label}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[8px] text-center text-muted-foreground">Products, delivery timeline & sustainability specs included.</p>

                                {/* Key Details */}
                                <div className="grid grid-cols-3 gap-1.5">
                                    {[
                                        { label: 'Items', value: '200' },
                                        { label: 'Delivery', value: '6-8 wks' },
                                        { label: 'Zones', value: '4' },
                                    ].map(item => (
                                        <div key={item.label} className="p-1.5 rounded-lg bg-muted/50 text-center">
                                            <p className="text-[8px] text-muted-foreground">{item.label}</p>
                                            <p className="text-[11px] font-bold text-foreground">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Narrative footer — what the customer sees vs doesn't */}
                        <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                            <p className="text-[9px] text-indigo-700 dark:text-indigo-300 text-center leading-relaxed">
                                <span className="font-semibold">Customer sees</span>: products, style & timeline — <span className="font-semibold">not</span> part numbers, unit costs or line items.
                            </p>
                        </div>

                        {/* Action Button */}
                        <div className="mx-3 mt-4 mb-4">
                            <button
                                onClick={() => nextStep()}
                                className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98]"
                            >
                                Approve
                            </button>
                        </div>
                    </MobileDeviceFrame>
                </div>
            )}

            {/* ===== Step 3.5: End User Punch List Report — Mobile device inline (COI only) ===== */}
            {currentStep?.id === '3.5' && !isOps && (
                <div data-demo-target="mobile-enduser-report" className="flex items-start justify-center pt-6 min-h-[calc(100vh-4rem)] animate-in fade-in duration-500">
                    <MobileDeviceFrame>
                        {/* Mobile Navbar */}
                        <div className="flex items-center justify-between px-4 pt-10 pb-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                                    <span className="text-[10px] font-black text-primary-foreground">S</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-medium leading-none">End User</p>
                                    <p className="text-xs font-bold text-foreground leading-tight">Strata PM Alpha</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <BellIcon className="w-5 h-5 text-foreground" />
                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">1</div>
                                </div>
                                <img
                                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face"
                                    alt="Strata PM Alpha"
                                    className="w-7 h-7 rounded-full object-cover ring-1 ring-border"
                                />
                            </div>
                        </div>

                        {/* Portal Tab Bar */}
                        <div className="flex items-center gap-0.5 mx-3 mt-3 p-0.5 rounded-lg bg-muted/60 border border-border">
                            {([
                                { id: 'orders' as const, label: 'My Orders', count: 4 },
                                { id: 'claims' as const, label: 'My Claims', count: 1 },
                                { id: 'messages' as const, label: 'Messages', count: 4 },
                            ]).map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setPortalTab(tab.id)}
                                    className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded-md transition-all flex items-center justify-center gap-1 ${
                                        portalTab === tab.id
                                            ? 'bg-card text-foreground shadow-sm border border-border'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    {tab.label}
                                    <span className={`text-[8px] px-1 py-0.5 rounded-full ${portalTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{tab.count}</span>
                                </button>
                            ))}
                        </div>

                        {/* ═══ ORDERS TAB ═══ */}
                        {portalTab === 'orders' && <>
                        {/* Push Notification — Shipment */}
                        <div className="mx-3 mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-start gap-2.5">
                                <div className="p-1.5 bg-blue-500/20 rounded-lg shrink-0">
                                    <TruckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-blue-500 font-medium">2 min ago</p>
                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Zone A Shipment Out for Delivery</p>
                                    <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">82 items · FastFreight #FF-2055-A · ETA today</p>
                                </div>
                            </div>
                        </div>


                        {/* ═══ Amazon-Style Shipment Tracking ═══ */}
                        <div className="mx-3 mt-3 p-3 rounded-xl bg-card border border-border space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Order Shipment Tracking</p>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium">Live</span>
                            </div>

                            {/* Progress Bar — Amazon style */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    {['PO received', 'PO Reviewed', 'Order Approved', 'In production', 'Shipped', 'Delivered'].map((label, i) => {
                                        const completed = i <= 3
                                        const active = i === 4
                                        return (
                                            <div key={label} className="flex flex-col items-center" style={{ width: '16.66%' }}>
                                                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                                                    completed ? 'bg-green-500' : active ? 'bg-blue-500' : 'bg-zinc-200 dark:bg-zinc-700'
                                                }`}>
                                                    {completed && <CheckCircleIcon className="w-3.5 h-3.5 text-white" />}
                                                    {active && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                                </div>
                                                <span className={`text-[7px] mt-0.5 text-center leading-tight ${
                                                    completed ? 'text-green-600 dark:text-green-400 font-medium' : active ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-muted-foreground'
                                                }`}>{label}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                                {/* Progress bar line */}
                                <div className="relative h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-4 -mt-[26px] mb-5">
                                    <div className="absolute inset-y-0 left-0 bg-green-500 rounded-full" style={{ width: '75%' }} />
                                </div>
                            </div>

                            {/* Shipment Cards by Zone */}
                            <div className="space-y-2">
                                {[
                                    { zone: 'Zone A', desc: 'Main Office (Floor 2)', items: 82, status: 'Shipped', eta: 'Mar 28', carrier: 'FastFreight', tracking: 'FF-2055-A', color: 'blue', active: true },
                                    { zone: 'Zone B', desc: 'Executive Suite', items: 35, status: 'Ready to ship', eta: 'Apr 4', carrier: 'NationWide', tracking: 'NW-2055-B', color: 'green', active: false },
                                    { zone: 'Zone C', desc: 'Lounge & Common', items: 48, status: 'In production', eta: 'Apr 11', carrier: 'Pending', tracking: '—', color: 'amber', active: false },
                                    { zone: 'Zone D', desc: 'Austin TX Satellite', items: 35, status: 'PO Reviewed', eta: 'Apr 18', carrier: 'Pending', tracking: '—', color: 'zinc', active: false },
                                ].map((shipment) => (
                                    <div key={shipment.zone} className={`p-2.5 rounded-lg border ${
                                        shipment.active
                                            ? 'border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5'
                                            : 'border-border bg-muted/30'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                                                    shipment.active ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-muted/50'
                                                }`}>
                                                    <TruckIcon className={`w-3.5 h-3.5 ${shipment.active ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-foreground">{shipment.zone} — {shipment.desc}</p>
                                                    <p className="text-[9px] text-muted-foreground">{shipment.items} items · {shipment.carrier} · {shipment.tracking}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                                                    shipment.status === 'Shipped' || shipment.status === 'Delivered' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                                                    shipment.status === 'Ready to ship' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                                                    shipment.status === 'In production' || shipment.status === 'Scheduled for production' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                                                    'bg-zinc-100 dark:bg-muted0/20 text-muted-foreground'
                                                }`}>{shipment.status}</span>
                                                <p className="text-[9px] text-muted-foreground mt-0.5">ETA {shipment.eta}</p>
                                            </div>
                                        </div>
                                        {shipment.active && (
                                            <div className="mt-2 flex items-center justify-between pt-2 border-t border-blue-200 dark:border-blue-500/20">
                                                <span className="text-[9px] text-blue-600 dark:text-blue-400">Last update: Today, 8:42 AM — Departed Austin hub</span>
                                                <button className="text-[9px] font-bold text-blue-600 dark:text-blue-400 hover:underline">Track →</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Confirmation — Zone A */}
                        <div className="mx-3 mt-3 mb-3">
                            {!deliveryConfirmed ? (
                                <button
                                    onClick={() => setDeliveryConfirmed(true)}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Confirm Zone A Delivery
                                </button>
                            ) : (
                                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="text-xs font-bold text-green-700 dark:text-green-300">Delivery Confirmed</p>
                                            <p className="text-[10px] text-green-600/80 dark:text-green-400/70">Zone A · 82 items received in good condition</p>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-green-600/60 dark:text-green-400/50 mt-1.5">Confirmation sent to dealer. Invoice updated.</p>
                                </div>
                            )}
                        </div>
                        </>}

                        {/* ═══ CLAIMS TAB ═══ */}
                        {portalTab === 'claims' && <>
                        {/* Punch List Notification */}
                        <div className="mx-3 mt-3 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 animate-in slide-in-from-top-2 duration-500">
                            <div className="flex items-start gap-2.5">
                                <div className="p-1.5 bg-green-500/20 rounded-lg shrink-0">
                                    <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-green-500 font-medium">Just now</p>
                                    <p className="text-xs font-bold text-green-700 dark:text-green-300">Punch List Report Ready</p>
                                    <p className="text-[11px] text-green-600/80 dark:text-green-400/80 mt-0.5">REQ-PL-2026-047 has been resolved. Review details below.</p>
                                </div>
                            </div>
                        </div>

                        {/* Claim Detail Card */}
                        <div className="mx-3 mt-3 p-4 rounded-xl bg-card border border-border space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Service Request</p>
                                    <p className="text-base font-bold text-foreground">REQ-PL-2026-047</p>
                                </div>
                                <span className="px-2 py-0.5 bg-green-500/15 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-full">Resolved</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'Product', value: '2x Conf. Chairs (Azure)' },
                                    { label: 'Claim ID', value: 'CLM-2026-114' },
                                    { label: 'Resolution', value: 'Replacement Unit' },
                                    { label: 'Delivery ETA', value: '8 business days' },
                                ].map(item => (
                                    <div key={item.label} className="p-2 rounded-lg bg-muted/50">
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                                        <p className="text-xs font-bold text-foreground">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-2 border-t border-border">
                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Process Timeline</p>
                                <div className="space-y-1.5">
                                    {[
                                        { label: 'Request Received', status: 'done' },
                                        { label: 'AI Validation Complete', status: 'done' },
                                        { label: 'Expert Review & Labor Approved', status: 'done' },
                                        { label: 'Claim Submitted to Manufacturer', status: 'done' },
                                        { label: 'Replacement In Production', status: 'active' },
                                    ].map((step, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            {step.status === 'done' ? (
                                                <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center shrink-0">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                </div>
                                            )}
                                            <span className={`text-[11px] font-medium ${step.status === 'done' ? 'text-muted-foreground' : 'text-blue-600 dark:text-blue-400'}`}>{step.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Evidence Summary */}
                        <div className="mx-3 mt-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Evidence Summary</p>
                            <div className="flex items-center gap-3 text-[11px] text-foreground">
                                <span className="flex items-center gap-1"><CheckCircleIcon className="w-3.5 h-3.5 text-green-500" /> 5 photos verified</span>
                                <span className="flex items-center gap-1"><CheckCircleIcon className="w-3.5 h-3.5 text-green-500" /> QR confirmed</span>
                            </div>
                            <div className="mt-1.5 text-[11px] text-muted-foreground">
                                Liability: <span className="font-bold text-foreground">Carrier 65%</span> / <span className="font-bold text-foreground">Manufacturer 35%</span>
                            </div>
                        </div>

                        {/* Comment Section */}
                        <div className="mx-3 mt-3 p-3 rounded-xl bg-card border border-border">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Leave a Comment</p>
                            {punchCommentSent && (
                                <div className="mb-2 flex items-start gap-2 p-2 bg-muted/50 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <img
                                        src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face"
                                        alt="Diego"
                                        className="w-6 h-6 rounded-full object-cover shrink-0"
                                    />
                                    <div>
                                        <p className="text-[10px] font-bold text-foreground">Strata PM Alpha</p>
                                        <p className="text-[11px] text-muted-foreground">Thank you for the quick resolution. Please notify me when the replacement ships.</p>
                                    </div>
                                </div>
                            )}
                            {!punchCommentSent && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={punchComment}
                                        onChange={(e) => setPunchComment(e.target.value)}
                                        placeholder="Type your comment..."
                                        className="flex-1 px-3 py-2 text-xs border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                                    />
                                    <button
                                        onClick={() => setPunchCommentSent(true)}
                                        className="px-3 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg transition-colors"
                                    >
                                        Send
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Acknowledge Button */}
                        <div className="mx-3 mt-4 mb-4">
                            <button
                                onClick={() => setShowAckModal(true)}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98]"
                            >
                                Acknowledge Report
                            </button>
                        </div>
                        </>}

                        {/* ═══ MESSAGES TAB ═══ */}
                        {portalTab === 'messages' && <>
                        <div className="mx-3 mt-3 space-y-2">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider px-1">Recent Communications</p>
                            {[
                                { label: 'Order Confirmation', preview: 'Your order #ORD-2055 has been confirmed. 200 items across 4 delivery zones.', date: 'Mar 15', read: true },
                                { label: 'Shipment Update — Zone A', preview: '82 items shipped via FastFreight. Tracking: FF-2055-A. ETA: Mar 28.', date: 'Mar 18', read: true },
                                { label: 'Acknowledgment Summary', preview: '47/50 items matched from supplier AIS. 3 items require design review.', date: 'Mar 19', read: true },
                                { label: 'Delivery Schedule', preview: 'Your complete delivery schedule for all 4 zones is ready to review.', date: 'Mar 27', read: false },
                            ].map((msg, i) => (
                                <div key={i} className={`p-3 rounded-xl border ${msg.read ? 'bg-card border-border' : 'bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20'} animate-in fade-in duration-300`} style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="flex items-start gap-2.5">
                                        <div className={`p-1.5 rounded-lg shrink-0 ${msg.read ? 'bg-muted/50' : 'bg-blue-100 dark:bg-blue-500/20'}`}>
                                            <svg className={`w-3.5 h-3.5 ${msg.read ? 'text-muted-foreground' : 'text-blue-600 dark:text-blue-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-[11px] font-medium ${msg.read ? 'text-foreground' : 'text-blue-700 dark:text-blue-300 font-bold'}`}>{msg.label}</p>
                                                <span className="text-[9px] text-muted-foreground">{msg.date}</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{msg.preview}</p>
                                        </div>
                                        {!msg.read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chat placeholder */}
                        <div className="mx-3 mt-3 mb-4 p-3 rounded-xl bg-muted/30 border border-dashed border-border text-center">
                            <p className="text-[10px] text-muted-foreground">Need help? <span className="font-medium text-foreground">Chat with your dealer</span></p>
                        </div>
                        </>}

                        {/* Acknowledgement Confirmation Modal */}
                        {showAckModal && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 px-4">
                                <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-h-[85%] overflow-y-auto scrollbar-micro animate-in zoom-in-95 slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
                                    {/* Modal Header */}
                                    <div className="px-4 pt-4 pb-3 border-b border-border">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-green-500/15 rounded-lg">
                                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-foreground">Punch List Summary</p>
                                                <p className="text-[10px] text-muted-foreground">REQ-PL-2026-047</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3">
                                        {/* Service Details */}
                                        <div>
                                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1.5">Service Details</p>
                                            <div className="space-y-1">
                                                {[
                                                    { label: 'Product', value: '2x Conference Chairs (Azure)' },
                                                    { label: 'Claim ID', value: 'CLM-2026-114' },
                                                    { label: 'Requester', value: 'Carlos Rivera — Apex Furniture' },
                                                    { label: 'Resolution', value: 'Replacement Unit' },
                                                ].map(item => (
                                                    <div key={item.label} className="flex items-center justify-between">
                                                        <span className="text-[10px] text-muted-foreground">{item.label}</span>
                                                        <span className="text-[10px] font-bold text-foreground">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Validation & Evidence */}
                                        <div className="pt-2 border-t border-border">
                                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1.5">Validation & Evidence</p>
                                            <div className="space-y-1">
                                                {[
                                                    'AI extracted 5 fields from email — all verified',
                                                    'QR code scanned — SKU CC-AZ-2025 confirmed',
                                                    '5 evidence photos validated',
                                                    'Serial SN-2025-88712 within warranty',
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center gap-1.5">
                                                        <CheckCircleIcon className="w-3 h-3 text-green-500 shrink-0" />
                                                        <span className="text-[10px] text-foreground">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Labor & Cost */}
                                        <div className="pt-2 border-t border-border">
                                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1.5">Labor & Cost Approval</p>
                                            <div className="space-y-1">
                                                {[
                                                    { label: 'Repair Threshold', value: '$495 (adjusted)' },
                                                    { label: 'Labor Hours', value: '4 hrs (standard)' },
                                                    { label: 'Expert Review', value: 'Approved by Claims Specialist' },
                                                ].map(item => (
                                                    <div key={item.label} className="flex items-center justify-between">
                                                        <span className="text-[10px] text-muted-foreground">{item.label}</span>
                                                        <span className="text-[10px] font-bold text-foreground">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Liability Split */}
                                        <div className="pt-2 border-t border-border">
                                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1.5">Liability Split</p>
                                            <div className="flex gap-2">
                                                <div className="flex-1 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                                                    <p className="text-[10px] text-red-400 font-medium">Carrier</p>
                                                    <p className="text-sm font-bold text-red-500">65%</p>
                                                </div>
                                                <div className="flex-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                                                    <p className="text-[10px] text-amber-400 font-medium">Manufacturer</p>
                                                    <p className="text-sm font-bold text-amber-500">35%</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delivery */}
                                        <div className="pt-2 border-t border-border">
                                            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                                <span className="text-[10px] text-blue-400 font-medium">Estimated Delivery</span>
                                                <span className="text-xs font-bold text-blue-500">8 business days</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Actions */}
                                    <div className="px-4 pb-4 pt-1 flex gap-2">
                                        <button
                                            onClick={() => setShowAckModal(false)}
                                            className="flex-1 py-2.5 border border-border text-foreground text-xs font-bold rounded-xl transition-colors hover:bg-muted/50"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => nextStep()}
                                            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98]"
                                        >
                                            Confirm Acknowledgement
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </MobileDeviceFrame>
                </div>
            )}

            {/* Main Content — hidden during mobile-only steps (fullscreen mobile overlay) */}
            <div className={`pt-24 px-4 max-w-[1600px] mx-auto space-y-6 ${!isOps && ['1.6', '1.8', '2.1', '3.5'].includes(currentStep?.id) ? 'hidden' : ''}`}>
                {/* Page Title & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-baseline gap-4">
                            <h1 className="text-3xl font-brand font-bold tracking-tight text-foreground">
                                {currentTenant} Overview
                            </h1>
                            {false && (
                            <button
                                onClick={() => onNavigate('tenant-settings')}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline transition-colors"
                            >
                                View Full Profile
                            </button>
                            )}
                        </div>
                    </div>


                </div>

                {/* ===== Step 1.6: Quote Approval Chain (COI only) ===== */}
                {currentStep?.id === '1.6' && !isOps && (
                    <div data-demo-target="approval-chain-progress" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-card glass border border-border rounded-2xl overflow-hidden shadow-lg">
                            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">Quote Approval Chain</h3>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">Quote QT-1025 ($134,250) triggered policy-based approval workflow</p>
                                    </div>
                                </div>
                                <ConfidenceScoreBadge score={94} label="Policy Match" />
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                                    <AIAgentAvatar className="mt-0.5" />
                                    <div className="text-xs text-indigo-700 dark:text-indigo-300">
                                        <span className="font-bold">ApprovalOrchestratorAgent:</span> Routing to 2-level approval chain — automated compliance check first, then manager sign-off for quote value bracket ($100k-$250k).
                                    </div>
                                </div>

                                <div className="space-y-0">
                                    {[
                                        { name: 'System Policy Engine', role: 'Automated Compliance Check', reason: 'Pricing + discount + policy validation', level: 'Level 1' },
                                        { name: 'Regional Sales Manager Reyes', role: 'Regional Sales Manager', reason: 'Quote value > $100k', level: 'Level 2' },
                                    ].map((approver, i) => (
                                        <div key={i}>
                                            {i > 0 && <div className="ml-5 h-6 border-l-2 border-dashed border-border" />}
                                            <div className={cn(
                                                "flex items-center gap-4 p-3 rounded-xl transition-all duration-500",
                                                approvalStates16[i] === 'approved'
                                                    ? 'bg-emerald-50 dark:bg-success/10 border border-emerald-200 dark:border-emerald-500/20'
                                                    : i === approvedCount16
                                                        ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 animate-pulse'
                                                        : 'bg-muted/30 border border-border/50'
                                            )}>
                                                <div className="relative shrink-0">
                                                    <DemoAvatar name={approver.name} size="lg" />
                                                    {approvalStates16[i] === 'approved' && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success text-white flex items-center justify-center ring-2 ring-background"><CheckIcon className="w-2.5 h-2.5" /></div>
                                                    )}
                                                    {approvalStates16[i] !== 'approved' && i === approvedCount16 && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center ring-2 ring-background"><ArrowPathIcon className="w-2.5 h-2.5 animate-spin" /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-foreground">{approver.name}</span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{approver.level}</span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">{approver.role}</p>
                                                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">Trigger: {approver.reason}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    {approvalStates16[i] === 'approved' ? (
                                                        <span className="text-[10px] font-bold text-success dark:text-success">Auto-Approved</span>
                                                    ) : i === approvedCount16 ? (
                                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Reviewing...</span>
                                                    ) : (
                                                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Pending Approval</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold text-muted-foreground">Approval Progress</span>
                                        <span className="text-[10px] font-bold text-foreground">{approvedCount16}/2</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all duration-700", approvedCount16 === 2 ? 'bg-success' : 'bg-blue-500')} style={{ width: `${(approvedCount16 / 2) * 100}%` }} />
                                    </div>
                                </div>

                                {approvedCount16 === 2 ? (
                                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-success/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2 animate-in fade-in duration-500">
                                        <CheckCircleIcon className="w-4 h-4 text-success shrink-0" />
                                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">All approvals complete — advancing to PO generation</span>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center gap-2">
                                        <ClockIcon className="w-4 h-4 text-amber-500 shrink-0" />
                                        <span className="text-[10px] text-amber-700 dark:text-amber-300">
                                            {approvedCount16 === 0 ? 'System Policy Engine running compliance check...' : 'Awaiting manager approval — notification sent to Regional Sales Manager Reyes'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== Step 1.9: PO Generation & Order Approval (COI only) ===== */}
                {currentStep?.id === '1.9' && !isOps && (
                    <div data-demo-target="po-order-approval" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* AI Context */}
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                            <AIAgentAvatar className="mt-0.5" />
                            <div className="text-xs text-indigo-700 dark:text-indigo-300">
                                <span className="font-bold">POBuilderAgent:</span> Auto-generating purchase order PO-1029 from approved quote QT-1025, then routing to automated order approval chain.
                            </div>
                        </div>

                        {/* Quote Approval Complete */}
                        <div className="bg-card border border-emerald-200 dark:border-emerald-500/20 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-5 py-3 bg-emerald-50 dark:bg-success/10 flex items-center gap-3">
                                <CheckCircleIcon className="w-5 h-5 text-success shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Quote Approval Chain — Complete</p>
                                    <p className="text-[10px] text-success dark:text-success">QT-1025 approved by System Policy Engine + Regional Sales Manager Reyes</p>
                                </div>
                            </div>
                            <div className="p-4 flex items-center gap-6">
                                {[
                                    { name: 'System Policy Engine', status: 'Auto-Approved' },
                                    { name: 'Regional Sales Manager Reyes', status: 'Approved' },
                                ].map((a, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="relative">
                                            <DemoAvatar name={a.name} size="sm" />
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success text-white flex items-center justify-center ring-1 ring-background"><CheckIcon className="w-2 h-2" /></div>
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-medium text-foreground">{a.name}</span>
                                            <span className="text-[10px] text-success dark:text-success ml-1.5">· {a.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PO Generation (compact) */}
                        {['po-generating', 'po-complete', 'order-chain', 'order-complete', 'done'].includes(phase18) && (
                            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                                        <DocumentPlusIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-foreground">PO Generation</h3>
                                        <p className="text-[10px] text-muted-foreground">POBuilderAgent generating purchase order from QT-1025</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {poGenPhase18 === 'complete' && <span className="text-[10px] font-bold text-success dark:text-success flex items-center gap-1"><CheckCircleIcon className="w-3.5 h-3.5" /> PO-1029</span>}
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">⚡ Supplier Portal</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { label: 'Extracting quote', phase: 'building' },
                                        { label: 'Mapping to PO format', phase: 'mapping' },
                                        { label: 'Validating catalog', phase: 'validating' },
                                        { label: 'PO finalized', phase: 'complete' },
                                    ].map((step) => {
                                        const phases = ['building', 'mapping', 'validating', 'complete'];
                                        const stepIdx = phases.indexOf(step.phase);
                                        const currentIdx = phases.indexOf(poGenPhase18);
                                        const isDone = currentIdx > stepIdx || (currentIdx === stepIdx && poGenPhase18 === 'complete' && step.phase === 'complete');
                                        const isActive = currentIdx === stepIdx && poGenPhase18 !== 'complete';
                                        return (
                                            <div key={step.phase} className={cn("p-2.5 rounded-lg border text-center transition-all", isDone ? 'border-emerald-500/30 bg-emerald-50 dark:bg-success/5' : isActive ? 'border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 animate-pulse' : 'border-border bg-muted/20')}>
                                                <div className={cn("w-5 h-5 rounded-full mx-auto mb-1 flex items-center justify-center", isDone ? 'bg-success text-white' : isActive ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground')}>
                                                    {isDone ? <CheckIcon className="w-3 h-3" /> : isActive ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <ClockIcon className="w-3 h-3" />}
                                                </div>
                                                <p className={cn("text-[9px] font-medium", isDone ? 'text-success dark:text-success' : isActive ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground')}>{step.label}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Order Approval Chain (automated) */}
                        {['order-chain', 'order-complete', 'done'].includes(phase18) && (
                            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-purple-50 dark:bg-ai/10">
                                            <ClipboardDocumentCheckIcon className="w-5 h-5 text-ai dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Order Approval Chain</h3>
                                            <p className="text-[10px] text-muted-foreground">Automated approval for PO-1029 ($134,256)</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-foreground">{orderApprovedCount18}/3</span>
                                </div>
                                <div className="p-5 space-y-0">
                                    {[
                                        { name: 'Operations Manager', role: 'Automated Order Validation', level: 'Level 1' },
                                        { name: 'Finance System', role: 'Budget & Payment Terms', level: 'Level 2' },
                                        { name: 'Compliance Engine', role: 'Regulatory Check', level: 'Level 3' },
                                    ].map((approver, i) => (
                                        <div key={i}>
                                            {i > 0 && <div className="ml-5 h-4 border-l-2 border-dashed border-border" />}
                                            <div className={cn(
                                                "flex items-center gap-3 p-2.5 rounded-lg transition-all duration-500",
                                                orderApprovalStates18[i] === 'approved'
                                                    ? 'bg-emerald-50 dark:bg-success/10 border border-emerald-200 dark:border-emerald-500/20'
                                                    : i === orderApprovedCount18
                                                        ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 animate-pulse'
                                                        : 'bg-muted/30 border border-border/50'
                                            )}>
                                                <div className="relative shrink-0">
                                                    <DemoAvatar name={approver.name} size="md" />
                                                    {orderApprovalStates18[i] === 'approved' && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success text-white flex items-center justify-center ring-1 ring-background"><CheckIcon className="w-2 h-2" /></div>
                                                    )}
                                                    {orderApprovalStates18[i] !== 'approved' && i === orderApprovedCount18 && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center ring-1 ring-background"><ArrowPathIcon className="w-2 h-2 animate-spin" /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[11px] font-bold text-foreground">{approver.name}</span>
                                                    <span className="text-[10px] text-muted-foreground ml-1.5">· {approver.role}</span>
                                                </div>
                                                <span className={cn("text-[10px] font-bold", orderApprovalStates18[i] === 'approved' ? 'text-success dark:text-success' : i === orderApprovedCount18 ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground')}>
                                                    {orderApprovalStates18[i] === 'approved' ? 'Approved' : i === orderApprovedCount18 ? 'Reviewing...' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {(phase18 === 'order-complete' || phase18 === 'done') && (
                                    <div className="px-5 pb-4">
                                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-success/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-3">
                                            <CheckCircleIcon className="w-5 h-5 text-success shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Order PO-1029 Fully Approved</p>
                                                <p className="text-[10px] text-success dark:text-success">All 3 approval levels complete — order entering production pipeline</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== Step 1.7: Manager Approval (Sara's Dashboard) (COI only) ===== */}
                {currentStep?.id === '1.7' && !isOps && (
                    <div data-demo-target="manager-approval-view" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Notification arrival toast */}
                        {notifArrived17 && (
                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-300 dark:border-blue-500/30 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-full bg-blue-500 text-white shrink-0 animate-bounce">
                                        <BellIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-bold text-blue-700 dark:text-blue-300">Quote Ready for Review</p>
                                            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">NEW</span>
                                        </div>
                                        <p className="text-xs text-blue-600 dark:text-blue-400">Quote <span className="font-bold">QT-1025</span> for your RFQ — <span className="font-bold">$134,250</span> · 5 SKUs</p>
                                        <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-1">AI-generated from your RFQ submission · Ready for your approval</p>
                                    </div>
                                    <span className="text-[10px] text-blue-500 dark:text-blue-400 font-medium shrink-0">Just now</span>
                                </div>
                            </div>
                        )}

                        {/* Main quote review card — appears after notification */}
                        {contentVisible17 && (
                            <div className="bg-card glass border border-border rounded-2xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-green-50/50 dark:bg-green-500/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center text-sm font-bold">AF</div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Quote Review — Apex Furniture</h3>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">New HQ RFQ · Austin, TX · Dealer Approval Required</p>
                                        </div>
                                    </div>
                                    <ConfidenceScoreBadge score={94} label="AI Accuracy" />
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Quote summary */}
                                    <div>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                                            {[
                                                { label: 'Quote ID', value: 'QT-1025' },
                                                { label: 'Total Value', value: '$687,430' },
                                                { label: 'Line Items', value: '50 SKUs' },
                                                { label: 'Delivery Est.', value: 'Mar 15, 2026' },
                                            ].map(item => (
                                                <div key={item.label} className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{item.label}</p>
                                                    <p className="text-sm font-bold text-foreground mt-1">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50">
                                                <p className="text-[10px] text-muted-foreground">Project</p>
                                                <p className="text-xs font-bold text-foreground">New HQ RFQ — Austin, TX</p>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50">
                                                <p className="text-[10px] text-muted-foreground">Payment Terms</p>
                                                <p className="text-xs font-bold text-foreground">Net 30 (2% early pay)</p>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50">
                                                <p className="text-[10px] text-muted-foreground">Discount Applied</p>
                                                <p className="text-xs font-bold text-foreground">4% combined ($5,370)</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Line item breakdown — 50 SKUs with pagination */}
                                    {(() => {
                                        const allLineItems = [
                                            { sku: 'ERG-5100', name: 'Ergonomic Task Chair', qty: 125, subtotal: '$43,750' },
                                            { sku: 'DSK-2200', name: 'Height-Adjustable Desk', qty: 80, subtotal: '$46,400' },
                                            { sku: 'ARM-4D10', name: '4D Adjustable Armrest', qty: 125, subtotal: '$2,250' },
                                            { sku: 'MON-3400', name: 'Monitor Arm Dual', qty: 60, subtotal: '$8,700' },
                                            { sku: 'CAB-1100', name: 'Mobile Pedestal Cabinet', qty: 40, subtotal: '$8,800' },
                                            { sku: 'CHP-6200', name: 'Conference Chair Pro', qty: 48, subtotal: '$19,200' },
                                            { sku: 'TBL-3300', name: 'Conference Table 8ft', qty: 12, subtotal: '$14,400' },
                                            { sku: 'FIL-2100', name: 'Lateral File Cabinet 4-Drawer', qty: 30, subtotal: '$8,100' },
                                            { sku: 'WBD-1500', name: 'Whiteboard Mobile 72"', qty: 15, subtotal: '$6,750' },
                                            { sku: 'LMP-0800', name: 'LED Desk Lamp Adjustable', qty: 200, subtotal: '$9,800' },
                                            { sku: 'PNL-4400', name: 'Acoustic Privacy Panel', qty: 60, subtotal: '$12,600' },
                                            { sku: 'SHF-7700', name: 'Bookshelf Unit Modular', qty: 24, subtotal: '$7,200' },
                                            { sku: 'STL-9900', name: 'Standing Mat Anti-Fatigue', qty: 80, subtotal: '$3,200' },
                                            { sku: 'KBT-0100', name: 'Keyboard Tray Sliding', qty: 80, subtotal: '$4,800' },
                                            { sku: 'PWR-5500', name: 'Power Hub Desktop 6-Port', qty: 200, subtotal: '$11,800' },
                                            { sku: 'HDR-6600', name: 'Cable Management Tray', qty: 200, subtotal: '$5,000' },
                                            { sku: 'SCR-2100', name: 'Monitor Privacy Screen 27"', qty: 80, subtotal: '$7,920' },
                                            { sku: 'FTP-3200', name: 'Footrest Ergonomic Tilt', qty: 80, subtotal: '$4,000' },
                                            { sku: 'DRW-1100', name: 'Desk Drawer Organizer', qty: 125, subtotal: '$3,125' },
                                            { sku: 'WPC-8800', name: 'Wireless Charging Pad', qty: 200, subtotal: '$7,800' },
                                            { sku: 'PHN-4100', name: 'Phone Stand Adjustable', qty: 200, subtotal: '$3,400' },
                                            { sku: 'CPH-5200', name: 'CPU Holder Under-Desk', qty: 80, subtotal: '$4,720' },
                                            { sku: 'DSK-2201', name: 'L-Shaped Corner Desk', qty: 20, subtotal: '$15,800' },
                                            { sku: 'CHP-6300', name: 'Guest Chair Stacking', qty: 60, subtotal: '$8,400' },
                                            { sku: 'RCK-9100', name: 'Coat Rack Freestanding', qty: 20, subtotal: '$2,600' },
                                            { sku: 'TBL-3301', name: 'Round Meeting Table 48"', qty: 8, subtotal: '$5,600' },
                                            { sku: 'LCK-7100', name: 'Locker Unit Personal 4-Door', qty: 10, subtotal: '$7,500' },
                                            { sku: 'SOF-8200', name: 'Lounge Sofa 2-Seat', qty: 6, subtotal: '$10,800' },
                                            { sku: 'OTM-8300', name: 'Ottoman Round Fabric', qty: 12, subtotal: '$3,600' },
                                            { sku: 'PLT-0200', name: 'Indoor Planter Large', qty: 20, subtotal: '$3,400' },
                                            { sku: 'BIN-1300', name: 'Recycling Bin Triple Sort', qty: 30, subtotal: '$4,350' },
                                            { sku: 'SGN-2400', name: 'Wayfinding Sign Set', qty: 5, subtotal: '$2,250' },
                                            { sku: 'CRT-3500', name: 'AV Cart Mobile', qty: 4, subtotal: '$3,200' },
                                            { sku: 'PRJ-4600', name: 'Projector Ceiling Mount', qty: 8, subtotal: '$2,400' },
                                            { sku: 'SPK-5700', name: 'Conference Speaker System', qty: 8, subtotal: '$6,400' },
                                            { sku: 'CAM-6800', name: 'Video Conference Camera', qty: 8, subtotal: '$7,200' },
                                            { sku: 'MIC-7900', name: 'Ceiling Microphone Array', qty: 8, subtotal: '$4,800' },
                                            { sku: 'DSP-8000', name: 'Digital Display 55" Wall', qty: 6, subtotal: '$10,200' },
                                            { sku: 'KSK-9200', name: 'Kiosk Stand Interactive', qty: 2, subtotal: '$5,400' },
                                            { sku: 'UMB-0300', name: 'Umbrella Stand Entry', qty: 4, subtotal: '$480' },
                                            { sku: 'MAT-1400', name: 'Entry Mat Commercial', qty: 6, subtotal: '$900' },
                                            { sku: 'CLK-2500', name: 'Wall Clock Analog 14"', qty: 20, subtotal: '$1,400' },
                                            { sku: 'FRM-3600', name: 'Art Frame 24×36"', qty: 20, subtotal: '$2,000' },
                                            { sku: 'CUR-4700', name: 'Window Shade Motorized', qty: 40, subtotal: '$18,000' },
                                            { sku: 'RUG-5800', name: 'Area Rug 8×10 Commercial', qty: 10, subtotal: '$8,500' },
                                            { sku: 'TRH-6900', name: 'Trash Can Sensor Lid', qty: 30, subtotal: '$4,050' },
                                            { sku: 'SAN-7000', name: 'Hand Sanitizer Station', qty: 10, subtotal: '$2,500' },
                                            { sku: 'FAN-8100', name: 'Desk Fan USB Quiet', qty: 80, subtotal: '$2,400' },
                                            { sku: 'HTR-9300', name: 'Space Heater Under-Desk', qty: 40, subtotal: '$3,600' },
                                            { sku: 'AIR-0400', name: 'Air Purifier HEPA Room', qty: 12, subtotal: '$5,880' },
                                        ];
                                        const perPage = 10;
                                        const totalPages = Math.ceil(allLineItems.length / perPage);
                                        const pageItems = allLineItems.slice(lineItemPage17 * perPage, (lineItemPage17 + 1) * perPage);
                                        const startIdx = lineItemPage17 * perPage + 1;
                                        const endIdx = Math.min((lineItemPage17 + 1) * perPage, allLineItems.length);

                                        return (
                                            <div className="rounded-xl border border-border overflow-hidden">
                                                <div className="px-3 py-2 bg-muted/50 border-b border-border flex items-center justify-between">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Line Item Summary — 50 SKUs</p>
                                                    <p className="text-[10px] text-muted-foreground">Showing {startIdx}–{endIdx} of {allLineItems.length}</p>
                                                </div>
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="border-b border-border/50 bg-muted/20">
                                                            <th className="px-3 py-1.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-20">SKU</th>
                                                            <th className="px-3 py-1.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                                                            <th className="px-3 py-1.5 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-16">Qty</th>
                                                            <th className="px-3 py-1.5 text-right text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-24">Subtotal</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border">
                                                        {pageItems.map(ln => (
                                                            <tr key={ln.sku} className="hover:bg-muted/30 transition-colors">
                                                                <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{ln.sku}</td>
                                                                <td className="px-3 py-2 text-foreground">{ln.name}</td>
                                                                <td className="px-3 py-2 text-center text-muted-foreground">×{ln.qty}</td>
                                                                <td className="px-3 py-2 text-right font-bold text-foreground">{ln.subtotal}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                {/* Pagination */}
                                                <div className="px-3 py-2 bg-muted/30 border-t border-border flex items-center justify-between">
                                                    <p className="text-[10px] text-muted-foreground">Page {lineItemPage17 + 1} of {totalPages}</p>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => setLineItemPage17(p => Math.max(0, p - 1))}
                                                            disabled={lineItemPage17 === 0}
                                                            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                                                        >
                                                            <ChevronLeftIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                                        </button>
                                                        {Array.from({ length: totalPages }, (_, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => setLineItemPage17(i)}
                                                                className={cn(
                                                                    'w-5 h-5 rounded text-[10px] font-bold transition-colors',
                                                                    i === lineItemPage17
                                                                        ? 'bg-primary text-primary-foreground'
                                                                        : 'text-muted-foreground hover:bg-muted'
                                                                )}
                                                            >
                                                                {i + 1}
                                                            </button>
                                                        ))}
                                                        <button
                                                            onClick={() => setLineItemPage17(p => Math.min(totalPages - 1, p + 1))}
                                                            disabled={lineItemPage17 === totalPages - 1}
                                                            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                                                        >
                                                            <ChevronRightIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* External Connections — Data Sources */}
                                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-500/5 dark:to-blue-500/5 border border-purple-200/50 dark:border-purple-500/20">
                                        <div className="flex items-center gap-2 mb-2.5">
                                            <LinkIcon className="w-3.5 h-3.5 text-ai dark:text-purple-400" />
                                            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">External Systems — Synced</span>
                                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 font-bold uppercase">Live</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/60 dark:bg-zinc-900/40 border border-blue-200/50 dark:border-blue-500/20">
                                                <EnvelopeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300">MillerKnoll</p>
                                                        <span className="text-[7px] px-1 py-px rounded bg-blue-200/60 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold">EXTERNAL</span>
                                                    </div>
                                                    <p className="text-[8px] text-blue-500 dark:text-blue-400">Vendor Email (PDF + CSV)</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/60 dark:bg-zinc-900/40 border border-purple-200/50 dark:border-purple-500/20">
                                                <ComputerDesktopIcon className="w-4 h-4 text-ai dark:text-purple-400 shrink-0" />
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300">MillerKnoll</p>
                                                        <span className="text-[7px] px-1 py-px rounded bg-purple-200/60 dark:bg-ai/20 text-ai dark:text-purple-400 font-bold">EXTERNAL</span>
                                                    </div>
                                                    <p className="text-[8px] text-ai dark:text-purple-400">Product Catalog (API) — Synced</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/60 dark:bg-zinc-900/40 border border-amber-200/50 dark:border-amber-500/20">
                                                <TruckIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300">ShipCalc</p>
                                                        <span className="text-[7px] px-1 py-px rounded bg-amber-200/60 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">EXTERNAL</span>
                                                    </div>
                                                    <p className="text-[8px] text-amber-500 dark:text-amber-400">Freight Calculator (API) — Synced</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Processing Pipeline — Full Agent Chain */}
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Processing Pipeline — 6 Agents</p>
                                        <AgentPipelineStrip agents={[
                                            { id: 'email', name: 'EmailIntake', status: 'done' as const, detail: 'RFQ detected' },
                                            { id: 'ocr', name: 'OCR Extract', status: 'done' as const, detail: '2 attachments' },
                                            { id: 'parser', name: 'DataParser', status: 'done' as const, detail: '200 items' },
                                            { id: 'norm', name: 'Normalizer', status: 'done' as const, detail: 'Catalog matched' },
                                            { id: 'quote', name: 'QuoteBuilder', status: 'done' as const, detail: 'QT-1025' },
                                            { id: 'policy', name: 'PolicyEngine', status: 'done' as const, detail: '94% confidence' },
                                        ]} accentColor="green" />
                                    </div>

                                    {/* AI Summary for dealer */}
                                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                                        <AIAgentAvatar className="mt-0.5" />
                                        <div className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
                                            <p><span className="font-bold">QuoteSummaryAgent:</span> Quote generated from MillerKnoll vendor email + attachments. All 200 SKUs matched to MillerKnoll catalog across 8 product categories. Pricing cross-validated against manufacturer API. Early payment discount (2%) + volume discount (2%) applied automatically.</p>
                                            <p>Estimated savings vs. list price: <span className="font-bold text-green-600 dark:text-green-400">$27,497 (4%)</span></p>
                                        </div>
                                    </div>

                                    {/* What was resolved */}
                                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-success/10 border border-emerald-200 dark:border-emerald-500/20">
                                        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 mb-2">Automatically Resolved</p>
                                        <div className="space-y-1">
                                            {[
                                                'Freight calculated via ShipCalc API: $12,850 (multi-zone LTL to Austin, TX)',
                                                'All 200 quantities cross-validated: Vendor PDF ↔ MillerKnoll Catalog',
                                                'Armrest upgraded per MillerKnoll availability: 4D Adjustable (+$750)',
                                                '8 substitutions from MillerKnoll Catalog (equivalent or better specs)',
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-success dark:text-success">
                                                    <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-3 pt-1">
                                        <button
                                            onClick={() => { setManagerApproved17(true); setTimeout(() => nextStep(), 1000); }}
                                            disabled={managerApproved17 || requestChangesOpen17}
                                            className={cn(
                                                'px-6 py-3 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2',
                                                managerApproved17 ? 'bg-success text-white' : 'bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.02] disabled:opacity-50'
                                            )}
                                        >
                                            {managerApproved17 ? <><CheckIcon className="w-4 h-4" /> Quote Approved</> : <><CheckBadgeIcon className="w-4 h-4" /> Approve Quote</>}
                                        </button>
                                        <button
                                            onClick={() => setRequestChangesOpen17(!requestChangesOpen17)}
                                            disabled={managerApproved17}
                                            className={cn(
                                                'px-5 py-3 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 border',
                                                requestChangesOpen17
                                                    ? 'bg-amber-500 text-white border-amber-500'
                                                    : 'bg-card text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-500/10 disabled:opacity-50'
                                            )}
                                        >
                                            <PencilSquareIcon className="w-4 h-4" /> Request Changes
                                        </button>
                                        {managerApproved17 && (
                                            <span className="text-[10px] text-success dark:text-success font-medium animate-pulse">Generating PO...</span>
                                        )}
                                    </div>

                                    {/* Request Changes panel */}
                                    {requestChangesOpen17 && (
                                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="flex items-center gap-2">
                                                <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Request Changes to Expert</p>
                                            </div>
                                            <p className="text-[11px] text-amber-600 dark:text-amber-400">Describe any inconsistencies found in the 50 line items. The quote will be sent back to the Expert for revision.</p>
                                            <textarea
                                                placeholder="e.g. Line items 12-15 show incorrect unit pricing for Acoustic Panels. Also, SKU-PLT-0200 quantity should be 30 not 20..."
                                                className="w-full h-20 px-3 py-2 text-xs rounded-lg bg-card border border-amber-200 dark:border-amber-500/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                            />
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setRequestChangesOpen17(false)}
                                                    className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center gap-1.5"
                                                >
                                                    <EnvelopeIcon className="w-3.5 h-3.5" /> Send to Expert
                                                </button>
                                                <button
                                                    onClick={() => setRequestChangesOpen17(false)}
                                                    className="px-4 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== Step 2.7: Smart Notifications (Action Center opens in Navbar) (COI only) ===== */}
                {currentStep?.id === '2.7' && !isOps && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* AI Attribution */}
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                            <AIAgentAvatar className="mt-0.5" />
                            <div className="flex-1 text-xs text-indigo-700 dark:text-indigo-300">
                                <span className="font-bold">NotificationAgent:</span> Generated 4 persona-specific notifications from 8-agent Acknowledgement pipeline. Dealer receives full lifecycle summary. Expert receives only actionable items — reducing noise by 60%.
                            </div>
                        </div>

                        {/* Completion Summary */}
                        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 space-y-2">
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <h3 className="text-sm font-bold text-green-700 dark:text-green-400">Flow 2 Complete — Acknowledgement Processing</h3>
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-500 ml-7">2 Acknowledgements processed for Premier Underground Design. HAT: 5 lines confirmed (AI vendor rule). AIS: 50 lines, 3 exceptions resolved, sent to client.</p>
                        </div>
                    </div>
                )}

                {/* Step 1.8 renders as fullscreen mobile overlay — see portal above */}

                {/* ===== Step 1.10: Smart Notifications (Action Center opens in Navbar) (COI only) ===== */}
                {currentStep?.id === '1.10' && !isOps && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* AI Attribution */}
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                            <AIAgentAvatar className="mt-0.5" />
                            <div className="flex-1 text-xs text-indigo-700 dark:text-indigo-300">
                                <span className="font-bold">NotificationAgent:</span> PO-1029 notification delivered to Dealer portal. Click "View PO" in Action Center to continue to pipeline.
                            </div>
                            <ConfidenceScoreBadge score={97} label="Relevance" />
                        </div>

                        {/* Completion Summary */}
                        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 space-y-3 animate-in fade-in duration-500">
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                <span className="text-sm font-bold text-green-700 dark:text-green-300">Flow 1 Complete — RFQ to PO Processing</span>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { label: 'Total Time', value: '4m 12s' },
                                    { label: 'Agents Used', value: '8/8' },
                                    { label: 'Human Touchpoints', value: '2' },
                                    { label: 'Auto-Resolved', value: '94%' },
                                ].map(stat => (
                                    <div key={stat.label} className="text-center">
                                        <p className="text-[10px] text-green-600 dark:text-green-400">{stat.label}</p>
                                        <p className="text-sm font-bold text-green-700 dark:text-green-300">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* OPS DEMO: QuickBooks Hero Moment */}
                {/* ═══════════════════════════════════════════ */}

                {/* OPS Step 1.6 — QuickBooks Sync Batch (interactive) */}
                {currentStep?.id === '1.6' && isOps && (
                    <div data-demo-target="qb-sync-batch-panel" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Agent Context */}
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                            <AIAgentAvatar className="mt-0.5" />
                            <div className="flex-1 text-xs text-indigo-700 dark:text-indigo-300">
                                <span className="font-bold">QuickBooksAgent:</span> Sync batch ready — 2 invoices totaling $44,605 mapped to GL codes. Customer "Apex Furniture" matched in QuickBooks.
                            </div>
                        </div>

                        {/* QB Sync Panel */}
                        <div className="bg-card glass border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/5">
                            <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
                                        <CloudArrowUpIcon className="w-5 h-5 text-success" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">QuickBooks Sync Batch</h3>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">2 invoices ready for sync · Customer matched</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-foreground">$44,605</span>
                            </div>

                            {/* Invoice Cards */}
                            <div className="p-4 grid grid-cols-2 gap-3">
                                {[
                                    { id: 'INV-2055', type: 'Product', amount: '$41,150', lines: 6, icon: CubeIcon },
                                    { id: 'SVC-03-2026', type: 'Services', amount: '$3,455', lines: 3, icon: WrenchScrewdriverIcon },
                                ].map(inv => (
                                    <div key={inv.id} className="rounded-xl border border-border p-3 bg-muted/20">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <inv.icon className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-xs font-bold text-foreground">{inv.id}</span>
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold">{inv.type}</span>
                                        </div>
                                        <p className="text-lg font-bold text-foreground">{inv.amount}</p>
                                        <p className="text-[10px] text-muted-foreground">{inv.lines} line items</p>
                                    </div>
                                ))}
                            </div>

                            {/* GL Code Mapping */}
                            <div className="px-4 pb-3">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">GL Code Mapping</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-border/50">
                                                <th className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase">Category</th>
                                                <th className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase">GL Code</th>
                                                <th className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { category: 'Furniture', gl: 'COGS-F01', amount: '$38,150' },
                                                { category: 'Freight', gl: 'SHIP-EXP', amount: '$3,000' },
                                                { category: 'Services', gl: 'SVC-REV', amount: '$3,455' },
                                            ].map((row, i) => (
                                                <tr key={i} className="border-b border-border/30">
                                                    <td className="px-3 py-2 text-xs text-foreground">{row.category}</td>
                                                    <td className="px-3 py-2 text-[11px] font-mono text-muted-foreground">{row.gl}</td>
                                                    <td className="px-3 py-2 text-xs text-right font-bold text-foreground">{row.amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Customer match + Tax */}
                            <div className="px-4 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircleIcon className="w-4 h-4 text-success" />
                                    <span className="text-[11px] text-foreground font-medium">Customer: Apex Furniture (matched in QB)</span>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold">Tax Applied</span>
                            </div>
                        </div>

                        {/* Sync Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => { setQbSynced16(true); nextStep(); }}
                                disabled={qbSynced16}
                                className="px-5 py-2.5 rounded-xl bg-brand-300 dark:bg-brand-400 text-zinc-900 font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                            >
                                <CloudArrowUpIcon className="w-4 h-4" />
                                Sync to QuickBooks
                            </button>
                        </div>
                    </div>
                )}

                {/* OPS Step 1.7 — Sync Confirmation (interactive) */}
                {currentStep?.id === '1.7' && isOps && (
                    <div data-demo-target="qb-sync-confirmation" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Success Banner */}
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-success/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-3">
                            <CheckCircleIcon className="w-6 h-6 text-success" />
                            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">QuickBooks Sync Complete</span>
                        </div>

                        {/* Confirmation Cards */}
                        <div className="bg-card glass border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/5">
                            <div className="p-4 space-y-3">
                                {[
                                    { invoice: 'INV-2055', qbBill: 'QB-4421', amount: '$41,150', type: 'Product' },
                                    { invoice: 'SVC-03-2026', qbBill: 'QB-4424', amount: '$3,455', type: 'Services' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                                        <CheckCircleIcon className="w-5 h-5 text-success flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-foreground">{item.invoice}</span>
                                                <ArrowRightIcon className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-xs font-bold text-success dark:text-success">{item.qbBill}</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold">{item.type}</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-foreground">{item.amount}</span>
                                    </div>
                                ))}
                            </div>

                            {/* GL Breakdown with status */}
                            <div className="px-4 pb-3">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">GL Breakdown</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-border/50">
                                                <th className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase">Category</th>
                                                <th className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase text-right">Amount</th>
                                                <th className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { category: 'Furniture (COGS-F01)', amount: '$38,150' },
                                                { category: 'Freight (SHIP-EXP)', amount: '$3,000' },
                                                { category: 'Services (SVC-REV)', amount: '$3,455' },
                                            ].map((row, i) => (
                                                <tr key={i} className="border-b border-border/30">
                                                    <td className="px-3 py-2 text-xs text-foreground">{row.category}</td>
                                                    <td className="px-3 py-2 text-xs text-right font-bold text-foreground">{row.amount}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold">Posted</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Timestamp + zero re-entry */}
                            <div className="px-4 py-3 border-t border-border/50 bg-muted/20 space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-[11px] text-muted-foreground">Synced March 15, 2026 at 2:45 PM</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="w-3.5 h-3.5 text-success" />
                                    <span className="text-[11px] text-success dark:text-success font-medium">Zero re-entry into QuickBooks</span>
                                </div>
                            </div>
                        </div>

                        {/* Done Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => { setQbConfirmed17(true); nextStep(); }}
                                disabled={qbConfirmed17}
                                className="px-5 py-2.5 rounded-xl bg-brand-300 dark:bg-brand-400 text-zinc-900 font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                            >
                                <CheckCircleIcon className="w-4 h-4" />
                                Done
                            </button>
                        </div>
                    </div>
                )}

                {/* OPS Step 2.1 — CO Request Received (interactive) */}
                {currentStep?.id === '2.1' && isOps && (
                    <div data-demo-target="co-request-incoming" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Agent Context */}
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                            <AIAgentAvatar className="mt-0.5" />
                            <div className="flex-1 text-xs text-indigo-700 dark:text-indigo-300">
                                <span className="font-bold">CostAnalysisAgent:</span> Change Order CO-007 received via Customer Portal — 22 line items, ergonomic upgrade request for Apex Furniture. No emails, no phone calls required to initiate.
                            </div>
                        </div>

                        {/* CO Request Card */}
                        <div className="bg-card glass border-2 border-amber-300 dark:border-amber-600 rounded-2xl overflow-hidden shadow-xl shadow-amber-500/10">
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                            <DocumentPlusIcon className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Change Order CO-007</h3>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">From: Apex Furniture Customer Portal</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold">Under Review</span>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mt-4">
                                    <div className="text-center p-3 rounded-lg bg-muted/30">
                                        <p className="text-lg font-bold text-foreground">22</p>
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Line Items</p>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-muted/30">
                                        <p className="text-lg font-bold text-foreground">ERG</p>
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Upgrade Type</p>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-muted/30">
                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">Portal</p>
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Source</p>
                                    </div>
                                </div>

                                {/* Source badges */}
                                <div className="mt-4">
                                    <span className="text-[8px] font-bold text-success dark:text-success uppercase tracking-wider">External Systems · Synced</span>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1">🌐 Customer Portal</span>
                                        <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold flex items-center gap-1">📋 PO ORD-2055</span>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center gap-2">
                                        <SparklesIcon className="w-4 h-4 text-success" />
                                        <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">No emails, no phone calls to initiate — received automatically via portal</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Begin Analysis Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => { setCoDone21(true); nextStep(); }}
                                disabled={coDone21}
                                className="px-5 py-2.5 rounded-xl bg-brand-300 dark:bg-brand-400 text-zinc-900 font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                            >
                                <ArrowRightIcon className="w-4 h-4" />
                                Begin CO Analysis
                            </button>
                        </div>
                    </div>
                )}

                {/* OPS Step 2.4 — Invoice + QB Amendment (auto 18s) */}
                {currentStep?.id === '2.4' && isOps && (
                    <div data-demo-target="invoice-amendment-parallel" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Agent Context */}
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                            <AIAgentAvatar className="mt-0.5" />
                            <div className="flex-1 text-xs text-indigo-700 dark:text-indigo-300">
                                <span className="font-bold">ParallelSyncAgent:</span> Applying CO-007 amendments across all systems in parallel — invoice, QuickBooks, and Daily Log updated simultaneously.
                            </div>
                        </div>

                        {/* Staggered Amendment Cards */}
                        <div className="space-y-3">
                            {[
                                { agent: 'InvoiceDeltaAgent', title: 'Invoice INV-2055 Amended', detail: '$46,950 (+$3,200)', icon: DocumentTextIcon, color: 'blue' },
                                { agent: 'QuickBooksAgent', title: 'QB Bill QB-4421 Amended', detail: 'GL codes updated', icon: CloudArrowUpIcon, color: 'emerald' },
                                { agent: 'DailyLogAgent', title: 'Daily Log DL-007 Recorded', detail: 'CO-007 activity logged', icon: ClipboardDocumentListIcon, color: 'purple' },
                            ].map((card, i) => (
                                <div
                                    key={i}
                                    className={`bg-card glass border rounded-2xl p-4 shadow-lg transition-all duration-700 ${
                                        i < opsAmendCards
                                            ? 'border-emerald-300 dark:border-emerald-700 opacity-100 translate-y-0'
                                            : 'border-border opacity-30 translate-y-2'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                            i < opsAmendCards
                                                ? 'bg-success/10'
                                                : 'bg-muted/30'
                                        }`}>
                                            {i < opsAmendCards
                                                ? <CheckCircleIcon className="w-5 h-5 text-success" />
                                                : <card.icon className="w-5 h-5 text-muted-foreground" />
                                            }
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-foreground">{card.title}</span>
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                                    card.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                                    card.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                                    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                                }`}>{card.agent}</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">{card.detail}</p>
                                        </div>
                                        {i < opsAmendCards && (
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold">Synced</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer note */}
                        {opsAmendCards >= 3 && (
                            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 animate-in fade-in duration-500">
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="w-4 h-4 text-success" />
                                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">All systems updated in parallel — zero re-entry</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* OPS DEMO: Financial Command Center (Flow 3) */}
                {/* ═══════════════════════════════════════════ */}

                {/* ═══ Continua Step 4.1 — Sustainability Dashboard (auto 10s) ═══ */}
                {isContinua && stepId === '4.1' && sustPhase !== 'idle' && (
                    <div data-demo-target="sustainability-dashboard" className="space-y-4 mb-6">
                        {/* Notification */}
                        {sustPhase === 'notification' && (
                            <button onClick={() => setSustPhase('processing')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-green-600 text-white"><ChartBarIcon className="h-4 w-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-foreground">Sustainability Impact Report</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-600 text-white font-bold">UAL Project</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1">SustainabilityMetricsAgent: Compiling <span className="font-semibold text-foreground">194 tons diverted</span> from landfill, <span className="font-semibold text-green-600 dark:text-green-400">78% carbon reduction</span>, 2,000 items refurbished.</p>
                                            <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to view metrics <ArrowRightIcon className="h-3 w-3" /></p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Processing */}
                        {sustPhase === 'processing' && (
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <AIAgentAvatar size="sm" />
                                    <span className="text-xs font-bold text-foreground">SustainabilityMetricsAgent Compiling...</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                    <div className="h-full rounded-full bg-green-500 transition-all duration-[3500ms] ease-linear" style={{ width: `${sustProgress}%` }} />
                                </div>
                                <div className="space-y-1.5">
                                    {sustAgents.map(agent => (
                                        <div key={agent.name} className={`flex items-center gap-2 text-[10px] transition-all duration-300 ${agent.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
                                            {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-green-600 animate-spin shrink-0" />}
                                            <span className={`font-medium ${agent.done ? "text-foreground" : "text-green-600 dark:text-green-400"}`}>{agent.name}</span>
                                            <span className="text-muted-foreground">{agent.detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Confirmed */}
                        {(sustPhase === 'revealed' || sustPhase === 'results') && (
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30 animate-in fade-in duration-300">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-green-800 dark:text-green-200"><span className="font-bold">SustainabilityMetricsAgent:</span> Report complete — <span className="font-semibold">194 tons diverted</span>, 78% carbon reduction, <span className="font-semibold">$340K savings</span> from reuse program. Award submission narrative ready.</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">External Systems · Synced</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                            {['Carbon Engine', 'Waste Tracker', 'Award Portal', 'Benchmark DB', 'Report Service'].map(sys => (
                                                <span key={sys} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-300 text-[10px] font-medium border border-green-200/50 dark:border-green-500/20">
                                                    <CheckCircleIcon className="h-3 w-3" />{sys}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Results */}
                        {sustPhase === 'results' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                    {/* Header */}
                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Sustainability Impact — UAL HQ Project</h3>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">Full lifecycle impact · Metropolis Award eligible</p>
                                        </div>
                                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold">78% Carbon Reduction</span>
                                    </div>

                                    {/* Big Metrics */}
                                    <div className="p-4 grid grid-cols-4 gap-3">
                                        {[
                                            { label: 'Tons Diverted', value: '194', sub: 'from landfill', color: 'text-green-600 dark:text-green-400' },
                                            { label: 'Carbon Reduction', value: '78%', sub: 'embodied carbon', color: 'text-success dark:text-success' },
                                            { label: 'Items Refurbished', value: '2,000', sub: 'reuse program', color: 'text-blue-600 dark:text-blue-400' },
                                            { label: 'Cost Savings', value: '$340K', sub: 'vs new procurement', color: 'text-amber-600 dark:text-amber-400' },
                                        ].map(m => (
                                            <div key={m.label} className="text-center p-3 rounded-xl bg-muted/20 border border-border">
                                                <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                                                <p className="text-[11px] font-medium text-foreground mt-0.5">{m.label}</p>
                                                <p className="text-[10px] text-muted-foreground">{m.sub}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Category Breakdown */}
                                    <div className="mx-4 mb-4 p-4 rounded-xl bg-muted/20 border border-border">
                                        <h4 className="text-xs font-bold text-foreground mb-3">Impact by Category</h4>
                                        <div className="space-y-2">
                                            {SUST_CATEGORIES.map(cat => (
                                                <div key={cat.label} className="flex items-center gap-3">
                                                    <span className="text-[10px] text-muted-foreground w-20 shrink-0">{cat.label}</span>
                                                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                                        <div className="h-full rounded-full bg-green-500 transition-all duration-700" style={{ width: `${(cat.diverted / 82) * 100}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-foreground w-10 text-right">{cat.diverted}t</span>
                                                    <span className="text-[10px] text-green-600 dark:text-green-400 w-14 text-right">{cat.savings}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Award Narrative */}
                                    <div className="mx-4 mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                                        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1.5 flex items-center gap-1.5"><SparklesIcon className="h-3.5 w-3.5" />AI-Generated Award Narrative</h4>
                                        <p className="text-[10px] text-amber-700 dark:text-amber-400 italic leading-relaxed">"Continua's UAL HQ project exemplifies circular economy principles in commercial interiors. Through systematic reuse, refurbishment, and material recovery, the project diverted 194 tons from landfill while achieving a 78% reduction in embodied carbon — setting a new benchmark for sustainable workplace transformation."</p>
                                    </div>

                                    {/* Auto-advance footer */}
                                    <div className="px-4 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between">
                                        <p className="text-[10px] text-muted-foreground">Dashboard auto-published · Award narrative ready for submission</p>
                                        <span className="text-[10px] px-3 py-1.5 rounded-lg bg-muted text-muted-foreground font-medium">Auto-advancing...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* OPS Step 3.1 — Multi-Project Financial Dashboard (interactive) */}
                {currentStep?.id === '3.1' && isOps && (
                    <div data-demo-target="financial-command-center" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Agent Context */}
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                            <AIAgentAvatar className="mt-0.5" />
                            <div className="flex-1 text-xs text-indigo-700 dark:text-indigo-300">
                                <span className="font-bold">FinancialCommandAgent:</span> Multi-project financial overview ready — 3 active projects, $157,650 total pipeline. All data synced from QuickBooks and project management systems.
                            </div>
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-foreground">Financial Command Center</h2>
                            <span className="text-sm px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold">$157,650</span>
                        </div>

                        {/* Project Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { name: 'Apex Furniture', amount: '$46,950', delivery: '82%', qb: true, cos: 1, status: 'Delivering', color: 'emerald' },
                                { name: 'Workspace Group', amount: '$12,300', delivery: '100%', qb: true, cos: 0, status: 'Invoiced', color: 'blue' },
                                { name: 'Meridian Group', amount: '$98,400', delivery: '0%', qb: false, cos: 0, status: 'Quote Approved', color: 'amber' },
                            ].map((project, i) => (
                                <div key={i} className="bg-card glass border border-border rounded-2xl p-4 shadow-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-bold text-foreground">{project.name}</h3>
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                            project.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                            project.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                            'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                        }`}>{project.status}</span>
                                    </div>
                                    <p className="text-xl font-bold text-foreground mb-2">{project.amount}</p>
                                    <div className="space-y-1.5 text-[10px] text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>Delivered</span>
                                            <span className="font-bold text-foreground">{project.delivery}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>QB Synced</span>
                                            <span className={`font-bold ${project.qb ? 'text-success dark:text-success' : 'text-muted-foreground'}`}>{project.qb ? 'Yes' : 'Pending'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Change Orders</span>
                                            <span className="font-bold text-foreground">{project.cos}</span>
                                        </div>
                                        {i === 2 && (
                                            <div className="flex justify-between">
                                                <span>Win Probability</span>
                                                <span className="font-bold text-amber-600 dark:text-amber-400">68%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pipeline Summary */}
                        <div className="bg-card glass border border-border rounded-2xl p-4 shadow-lg">
                            <div className="flex items-center gap-6">
                                {[
                                    { label: 'Total Pipeline', value: '$157,650', color: 'text-foreground' },
                                    { label: 'QB-Synced', value: '2', color: 'text-success dark:text-success' },
                                    { label: 'Open COs', value: '1', color: 'text-amber-600 dark:text-amber-400' },
                                    { label: 'Overdue', value: '0', color: 'text-success dark:text-success' },
                                ].map(kpi => (
                                    <div key={kpi.label} className="text-center">
                                        <p className={`text-sm font-bold ${kpi.color}`}>{kpi.value}</p>
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Zero re-entry callout */}
                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4 text-success" />
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">No Excel, no QB login, no calls — real-time financial visibility</span>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => nextStep()}
                                className="px-5 py-2.5 rounded-xl bg-brand-300 dark:bg-brand-400 text-zinc-900 font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                            >
                                <ArrowRightIcon className="w-4 h-4" />
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* OPS Step 3.2 — QuickBooks Reconciliation (interactive) */}
                {currentStep?.id === '3.2' && isOps && (
                    <div data-demo-target="qb-reconciliation-report" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Agent Context */}
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                            <AIAgentAvatar className="mt-0.5" />
                            <div className="flex-1 text-xs text-indigo-700 dark:text-indigo-300">
                                <span className="font-bold">ReconciliationAgent:</span> QuickBooks reconciliation complete — all invoices match QB bills with zero discrepancies. Total posted: $60,250.
                            </div>
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-foreground">QB Reconciliation</h2>
                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold">0 Discrepancies</span>
                        </div>

                        {/* Reconciliation Table */}
                        <div className="bg-card glass border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/5">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border/50 bg-muted/50 dark:bg-zinc-800/50">
                                            <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Invoice</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">QB Bill</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { invoice: 'INV-2055', amount: '$46,950', qb: 'QB-4421' },
                                            { invoice: 'SVC-03-2026', amount: '$3,455', qb: 'QB-4424' },
                                            { invoice: 'INV-2048', amount: '$12,300', qb: 'QB-4422' },
                                        ].map((row, i) => (
                                            <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3 text-xs font-bold text-foreground">{row.invoice}</td>
                                                <td className="px-4 py-3 text-xs text-right font-bold text-foreground">{row.amount}</td>
                                                <td className="px-4 py-3 text-xs text-success dark:text-success font-bold">{row.qb}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1 justify-center w-fit mx-auto">
                                                        <CheckCircleIcon className="w-3 h-3" /> Matched
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Total + GL Breakdown */}
                            <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-foreground">Total Posted</span>
                                    <span className="text-lg font-bold text-foreground">$60,250</span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px]">
                                    {[
                                        { label: 'Furniture', value: '$41,150' },
                                        { label: 'Services', value: '$3,455' },
                                        { label: 'Freight', value: '$2,345' },
                                    ].map(gl => (
                                        <div key={gl.label} className="flex items-center gap-1.5">
                                            <span className="text-muted-foreground">{gl.label}:</span>
                                            <span className="font-bold text-foreground">{gl.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground">Aging AP:</span>
                                    <span className="text-[10px] font-bold text-success dark:text-success">0 overdue</span>
                                </div>
                            </div>
                        </div>

                        {/* Export Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => { setExportedReport32(true); nextStep(); }}
                                disabled={exportedReport32}
                                className="px-5 py-2.5 rounded-xl bg-brand-300 dark:bg-brand-400 text-zinc-900 font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4" />
                                Export to Controller
                            </button>
                        </div>
                    </div>
                )}

                {/* KPI Cards / Executive Summary — hidden for demo build */}
                {false && (showMetrics ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-foreground">Platform Executive Summary</h2>
                            <button onClick={() => setShowMetrics(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Collapse Summary <ChevronUpIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-col xl:flex-row gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                            {/* Left Column: Carousel */}
                            <div className="relative group/expanded flex-1 min-w-0">
                                {/* Left Scroll Button (Expanded) */}
                                <button
                                    onClick={() => scroll(expandedScrollRef, 'left')}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full bg-card shadow-lg border border-gray-200 dark:border-white/10 text-muted-foreground hover:text-foreground opacity-0 group-hover/expanded:opacity-100 transition-all disabled:opacity-0"
                                >
                                    <ChevronLeftIcon className="w-5 h-5" />
                                </button>

                                <div
                                    ref={expandedScrollRef}
                                    className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide scroll-smooth"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {Object.entries(platformSummary).map(([key, data]) => (
                                        <div
                                            key={key}
                                            className={`min-w-[230px] max-w-[230px] h-[200px] flex flex-col justify-between bg-card backdrop-blur-sm rounded-xl p-3 border border-border transition-all duration-300 group/card ${expandedCardId === key ? 'ring-1 ring-primary/20 shadow-md' : 'shadow-sm hover:shadow-md'}`}
                                        >
                                            <div className="flex-1 flex flex-col">
                                                {/* Header: Label + Icon */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{data.label}</span>
                                                    <div
                                                        className={`p-1 rounded-md ${colorStyles[data.color]?.replace('ring-1', '') || 'bg-gray-100 dark:bg-zinc-800'} bg-opacity-50 relative group`}
                                                        title={data.label}
                                                    >
                                                        <div className="w-3.5 h-3.5 child-svg:w-full child-svg:h-full">
                                                            {data.icon}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Main Value */}
                                                <div className="flex items-baseline gap-2 mb-2">
                                                    <span className="text-xl font-bold text-foreground tracking-tight">{data.value}</span>
                                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${data.positive ? 'bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                                                        {data.change}
                                                    </span>
                                                </div>

                                                {/* Footer: Sub Metrics (Visible by default) */}
                                                <div className={`space-y-0.5 mb-2 ${expandedCardId === key ? 'hidden' : 'block'}`}>
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                        <div className={`w-1 h-1 rounded-full bg-${data.color}-500 shrink-0`}></div>
                                                        <span className="truncate">{data.sub1}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                        <div className={`w-1 h-1 rounded-full bg-${data.color}-500 shrink-0`}></div>
                                                        <span className="truncate">{data.sub2}</span>
                                                    </div>
                                                </div>

                                                {/* Expanded Details (Conditional) */}
                                                {expandedCardId === key && (
                                                    <div className="mt-auto animate-in fade-in slide-in-from-top-1 flex-1 flex flex-col justify-end">
                                                        <div className="space-y-1.5 mb-2">
                                                            <div className="flex justify-between text-[10px]">
                                                                <span className="text-muted-foreground">Trend (30d)</span>
                                                                <span className="font-medium text-foreground">+12%</span>
                                                            </div>
                                                            <div className="flex justify-between text-[10px]">
                                                                <span className="text-muted-foreground">Projection</span>
                                                                <span className="font-medium text-foreground">On Track</span>
                                                            </div>
                                                        </div>
                                                        <button className={`w-full py-1.5 text-[10px] font-semibold rounded-lg transition-all text-center border ${solidColorStyles[data.color]}`}>
                                                            View Report
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons Row */}
                                            <div className="flex items-center justify-between mt-1 pt-2 border-t border-transparent group-hover/card:border-border/50 transition-colors">
                                                <button
                                                    onClick={() => setExpandedCardId(expandedCardId === key ? null : key)}
                                                    className="p-1 -ml-1 hover:text-zinc-900 hover:bg-brand-300 dark:hover:bg-brand-600/50 dark:hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[10px] font-medium"
                                                >
                                                    <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${expandedCardId === key ? 'rotate-180' : ''}`} />
                                                    {expandedCardId === key ? 'Less' : 'Details'}
                                                </button>

                                                <button className={`p-1.5 rounded-full transition-all hover:scale-105 border ${solidColorStyles[data.color]}`} title={`Go to ${data.label}`}>
                                                    <ArrowRightIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Right Scroll Button (Expanded) */}
                                <button
                                    onClick={() => scroll(expandedScrollRef, 'right')}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full bg-card shadow-lg border border-gray-200 dark:border-white/10 text-muted-foreground hover:text-foreground opacity-0 group-hover/expanded:opacity-100 transition-all"
                                >
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Right Column: Quick Actions Grid */}
                            <div className="w-full xl:w-[400px] shrink-0 flex flex-col h-[200px] xl:h-[200px]">
                                <h3 className="text-sm font-semibold text-foreground mb-3 px-1">Quick Actions</h3>
                                <div className="grid grid-cols-2 gap-3 h-full">
                                    {[
                                        { icon: <DocumentPlusIcon className="w-6 h-6" />, label: "New Quote", desc: "Create a new quote" },
                                        { icon: <CubeIcon className="w-6 h-6" />, label: "Check Stock", desc: "View inventory" },
                                        { icon: <ChartBarIcon className="w-6 h-6" />, label: "Gen. Report", desc: "Analytics summary" },
                                        { icon: <CloudArrowUpIcon className="w-6 h-6" />, label: "ERP Sync", desc: "Sync with ERP", action: () => setIsERPSyncModalOpen(true) },
                                    ].map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={action.action}
                                            className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border bg-white/50 dark:bg-zinc-800/50 hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:border-brand-400 hover:text-zinc-900 transition-all group"
                                        >
                                            <div className="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-muted-foreground group-hover:text-zinc-900 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/20 transition-colors">
                                                {action.icon}
                                            </div>
                                            <div className="text-center">
                                                <span className="text-xs font-semibold text-foreground group-hover:text-zinc-900 block">{action.label}</span>
                                                <span className="text-[10px] text-muted-foreground hidden sm:block">{action.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-white/60 dark:bg-zinc-800 backdrop-blur-md rounded-2xl p-4 border border-border shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        {/* Collapsed Ticker View - Carousel */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {/* Left Scroll Button */}
                            <button
                                onClick={() => scroll(scrollContainerRef, 'left')}
                                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>

                            <div
                                ref={scrollContainerRef}
                                className="flex items-center gap-8 overflow-x-auto w-full scrollbar-hide px-2 scroll-smooth"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Ensure scrollbar is hidden
                            >
                                {Object.entries(platformSummary).map(([key, data]) => (
                                    <div key={key} className="flex items-center gap-3 min-w-fit group cursor-default">
                                        {/* Icon with Floating Tooltip */}
                                        <div
                                            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${colorStyles[data.color] || 'bg-gray-100 dark:bg-zinc-800'}`}
                                            title={data.label}
                                        >
                                            {data.icon}
                                        </div>

                                        {/* Stacked Value & Change */}
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-foreground leading-none">{data.value}</span>
                                            <span className={`text-[10px] font-bold mt-1 ${data.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {data.change}
                                            </span>
                                        </div>

                                        {/* Divider (except last) */}
                                        <div className="h-8 w-px bg-border/50 ml-4 hidden md:block lg:hidden xl:block opacity-50"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Right Scroll Button */}
                            <button
                                onClick={() => scroll(scrollContainerRef, 'right')}
                                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>

                        {/* Quick Actions Integrated - Compact */}
                        <div className="flex items-center gap-1 overflow-x-auto min-w-max pl-4 border-l border-border xl:border-none xl:pl-0">
                            {[
                                { icon: <DocumentPlusIcon className="w-5 h-5" />, label: "New Quote" },
                                { icon: <CubeIcon className="w-5 h-5" />, label: "Check Stock" },
                                { icon: <ChartBarIcon className="w-5 h-5" />, label: "Gen. Report" },
                                { icon: <CloudArrowUpIcon className="w-5 h-5" />, label: "ERP Sync", action: () => setIsERPSyncModalOpen(true) },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={action.action}
                                    className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-foreground transition-colors relative group"
                                    title={action.label}
                                >
                                    {action.icon}
                                </button>
                            ))}
                            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
                            <button className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-foreground transition-colors relative group" title="View All & Manage">
                                <Squares2X2Icon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>

                        <button
                            onClick={() => setShowMetrics(true)}
                            className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-foreground transition-colors"
                            title="Expand Summary"
                        >
                            <ChevronDownIcon className="w-5 h-5" />
                        </button>
                    </div>
                )
                )}

                {/* Main Tabs Navigation */}
                <div className="flex items-center mt-8 mb-6">
                    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl border border-border">
                        <button
                            onClick={() => setMainTab('follow_up')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                mainTab === 'follow_up'
                                    ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"

                                    : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-foreground"
                            )}
                        >
                            <ListBulletIcon className="w-4 h-4" />
                            Follow Up
                        </button>
                    </div>
                </div>


                {/* Follow Up Tab Content */}
                {
                    mainTab === 'follow_up' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Unified KPI experience · north-star hero + by-category grid + trends + printable report (Wendy item 11) · "This week" cards merged into DashboardPerformanceGrid to remove redundancy */}
                            {isInboundOutbound && (
                                <>
                                    <div className="flex items-center justify-end -mb-2">
                                        <button
                                            type="button"
                                            onClick={() => setReportOpen(true)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                                        >
                                            <ChartBarIcon className="h-4 w-4" />
                                            Generate report
                                        </button>
                                    </div>
                                    <DashboardPerformanceGrid />
                                    <DashboardReport isOpen={reportOpen} onClose={() => setReportOpen(false)} />
                                </>
                            )}

                            {/* Dupler d1.4-d1.5: SC Price Validation & Priced SIF */}
                            {(currentStep?.id === 'd1.4' || currentStep?.id === 'd1.5') && (
                                <DuplerScReview onNavigate={onNavigate} />
                            )}
                            {/* WRG w2.4: Dealer Review & Approval */}
                            {currentStep?.id === 'w2.4' && (
                                <WrgEstimatorReview onNavigate={onNavigate} />
                            )}
                            {/* WRG w1.5: Design Review */}
                            {currentStep?.id === 'w1.5' && (
                                <WrgIntakeReview onNavigate={onNavigate} />
                            )}
                            {/* Dupler Flow 3: Notification card → switch to Metrics */}
                            {currentStep?.id.startsWith('d3.') && (
                                <DuplerReportingNotification onSwitchToMetrics={() => setMainTab('metrics')} />
                            )}

                            {/* Dupler d2.7: Dealer Review & Dispatch Approval */}
                            {currentStep?.id === 'd2.7' && dealerReviewPhase === 'notification' && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-brand-500 text-zinc-900 shrink-0">
                                                <ClipboardDocumentCheckIcon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-foreground">Warehouse Intelligence Report Ready</span>
                                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">PENDING REVIEW</span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Mercy Health Phase 2 — 5 agents completed 6 checkpoints. 24/26 items staged, 2 pending (Park Table backorder). $2,770 vendor credits processed. Dispatch scheduled: Interior Installations, Thursday 8AM.
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                        <span className="text-[10px] text-muted-foreground">28/30 received</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                        <span className="text-[10px] text-muted-foreground">5 shipments tracked</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        <span className="text-[10px] text-muted-foreground">3 claims resolved</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setDealerReviewPhase('review')}
                                            className="w-full mt-3 py-2.5 rounded-lg text-[11px] font-bold bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-md shadow-brand-500/20 transition-all"
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                <ClipboardDocumentCheckIcon className="h-3.5 w-3.5" /> Open Report & Review
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {currentStep?.id === 'd2.7' && dealerReviewPhase === 'review' && (
                                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Header */}
                                    <div className="px-6 py-4 border-b border-border">
                                        <div className="flex items-center gap-3">
                                            <SparklesIcon className="h-5 w-5 text-brand-500" />
                                            <div>
                                                <h3 className="text-base font-bold text-foreground">Warehouse Intelligence Report</h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">Mercy Health Phase 2 — Columbus Warehouse</p>
                                            </div>
                                            <span className={`ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                dealerDispatchApproved
                                                    ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                                                    : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                            }`}>{dealerDispatchApproved ? 'APPROVED' : 'PENDING REVIEW'}</span>
                                        </div>
                                    </div>

                                    {/* Summary Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-border">
                                        {[
                                            { label: 'Warehouse Health', value: '3 warehouses', detail: 'Columbus 72%→89% forecast', color: 'text-blue-600 dark:text-blue-400' },
                                            { label: 'Receiving', value: '28/30 matched', detail: '26 pristine, 2 exceptions', color: 'text-success dark:text-success' },
                                            { label: 'Price Verified', value: '15 items', detail: '2 margin alerts resolved', color: 'text-ai dark:text-purple-400' },
                                            { label: 'Transit Synced', value: '5 shipments', detail: 'Dock resolved, -$1,200', color: 'text-indigo-600 dark:text-indigo-400' },
                                            { label: 'Claims', value: '3 processed', detail: '$2,770 credits approved', color: 'text-rose-600 dark:text-rose-400' },
                                        ].map(section => (
                                            <div key={section.label} className="px-4 py-3 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-1">
                                                <div>
                                                    <span className="text-xs font-semibold text-foreground">{section.label}</span>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">{section.detail}</p>
                                                </div>
                                                <span className={`text-xs font-bold ${section.color} mt-1`}>{section.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Expert Notes from d2.6 */}
                                    <div className="border-t border-border px-6 py-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <SparklesIcon className="h-3.5 w-3.5 text-brand-500" />
                                            <span className="text-xs font-bold text-foreground">Expert Notes</span>
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">from Warehouse Team</span>
                                        </div>
                                        <div className="p-3 rounded-lg bg-muted/30 border border-border text-[11px] text-muted-foreground italic">
                                            CLM-052: Acuity chairs RMA pickup scheduled for Mar 28. CLM-048: cosmetic damage — recommend accepting credit + keeping unit on floor. Warranty on Beyond Desk expires in 15d — extend before Phase 2 install.
                                        </div>
                                    </div>

                                    {/* Staging Checklist + AI Verified */}
                                    <div className="border-t border-border px-6 py-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-foreground">Staging Checklist</span>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-semibold">24/26 ready</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="px-3 py-1 rounded-lg bg-green-50 dark:bg-green-500/10 text-center">
                                                        <span className="text-sm font-bold text-green-700 dark:text-green-400">24</span>
                                                        <span className="text-[10px] text-green-600 dark:text-green-400 ml-1">Staged</span>
                                                    </div>
                                                    <div className="px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-center">
                                                        <span className="text-sm font-bold text-amber-700 dark:text-amber-400">2</span>
                                                        <span className="text-[10px] text-amber-600 dark:text-amber-400 ml-1">Pending</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                                                <SparklesIcon className="h-3.5 w-3.5 text-indigo-500" />
                                                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">AI Verified</span>
                                                <span className="text-[9px] text-indigo-600/70 dark:text-indigo-400/70">5 agents · 6 checkpoints</span>
                                            </div>

                                            <p className="text-xs text-muted-foreground sm:ml-auto">Interior Installations — Thursday 8AM, 3 crew</p>
                                        </div>
                                    </div>

                                    {/* Dealer Comment */}
                                    <div className="border-t border-border px-6 py-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ChatBubbleLeftEllipsisIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-xs font-bold text-foreground">Dealer Comments</span>
                                        </div>
                                        <textarea
                                            className="w-full text-[11px] p-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-brand-400"
                                            rows={2}
                                            placeholder="Add comments for the dispatch team — e.g., 'Confirm loading dock access with Mercy Health facilities by Wed 5PM.'"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="border-t border-border px-6 py-4">
                                        {!dealerDispatchApproved ? (
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setDealerDispatchApproved(true)}
                                                    className="flex-1 py-2.5 bg-brand-400 hover:bg-brand-500 text-zinc-900 text-xs font-bold rounded-xl shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
                                                >
                                                    <span className="flex items-center justify-center gap-2"><CheckCircleIcon className="h-4 w-4" /> Approve All & Dispatch</span>
                                                </button>
                                                <button className="px-4 py-2.5 border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-xl hover:bg-amber-100 dark:hover:bg-amber-500/10 transition-all">
                                                    Request Changes
                                                </button>
                                                <button className="px-4 py-2.5 border border-border text-muted-foreground text-xs font-bold rounded-xl hover:bg-muted transition-all">
                                                    Hold for Review
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4 animate-in fade-in duration-300">
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 flex-1">
                                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                                    <div>
                                                        <p className="text-sm font-bold text-green-700 dark:text-green-300">Dispatch Approved</p>
                                                        <p className="text-[10px] text-green-600/80 dark:text-green-400/70">Sarah Chen · Interior Installations Thu 8AM confirmed</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => nextStep()}
                                                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98]"
                                                >
                                                    Continue to Flow 3
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Removed per dashboard cleanup: Urgent Actions · Recent Activity · AI Suggestions · Performance */}
                            {false && (<>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Left Column: Urgent Actions */}
                                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-brand font-semibold text-foreground flex items-center gap-2">
                                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                                            Urgent Actions
                                        </h3>
                                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold">
                                            3 Pending
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {urgentActions.filter(action => action.id !== 4 || currentStep?.id === '2.1').map((action) => (
                                            <div key={action.id} className={`group border rounded-xl hover:border-zinc-400 transition-all duration-700 bg-muted/50 dark:bg-zinc-800/50 ${(highlightedAction === action.id || (action.id === 4 && currentStep?.id === '2.1'))
                                                ? 'ring-4 ring-brand-500 shadow-[0_0_30px_rgba(var(--brand-500),0.6)] animate-pulse border-brand-500'
                                                : 'border-border'
                                                }`}>
                                                <div
                                                    className="p-4 cursor-pointer"
                                                    onClick={() => setExpandedActionId(expandedActionId === action.id ? null : action.id)}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex gap-3">
                                                            <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${action.type === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                                action.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                                                    'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                                }`}>
                                                                <action.icon className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-foreground">{action.title}</h4>
                                                                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${action.type === 'critical' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                action.type === 'warning' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                    'bg-zinc-100 text-muted-foreground dark:bg-zinc-800 dark:text-muted-foreground'
                                                                }`}>
                                                                {action.time}
                                                            </span>
                                                            <ChevronDownIcon className={`w-4 h-4 text-muted-foreground transition-transform ${expandedActionId === action.id ? 'rotate-180' : ''}`} />
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Expandable Details + Quick Action */}
                                                <div className={`overflow-hidden transition-all duration-300 ${expandedActionId === action.id ? 'max-h-[500px] opacity-100 border-t border-border' : 'max-h-0 opacity-0'}`}>
                                                    <div className="p-4 bg-muted/20 space-y-3">
                                                        {/* Detail Fields */}
                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                            {action.details.fields.map((f, i) => (
                                                                <div key={i} className="flex flex-col">
                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{f.label}</span>
                                                                    <span className={`text-xs font-medium mt-0.5 ${(f as any).highlight ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-foreground'}`}>{f.value}</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Exceptions list (ACK item) */}
                                                        {(action.details as any).exceptions && (
                                                            <div className="space-y-1.5">
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Exceptions</p>
                                                                {(action.details as any).exceptions.map((exc: any, i: number) => (
                                                                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30">
                                                                        <div>
                                                                            <span className="text-xs font-mono font-medium text-foreground">{exc.item}</span>
                                                                            <span className="text-xs text-muted-foreground ml-2">{exc.issue}</span>
                                                                        </div>
                                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${exc.confidence >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>{exc.confidence}%</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Top Items (Quote item) */}
                                                        {(action.details as any).topItems && (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Top Items</p>
                                                                <div className="space-y-1">
                                                                    {(action.details as any).topItems.map((item: string, i: number) => (
                                                                        <p key={i} className="text-xs text-muted-foreground pl-2 border-l-2 border-border">{item}</p>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Stock History (Low Stock item) */}
                                                        {(action.details as any).stockHistory && (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Stock Trend (6 weeks)</p>
                                                                <div className="flex items-end gap-1 h-8">
                                                                    {(action.details as any).stockHistory.map((v: number, i: number) => (
                                                                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                                                                            <div
                                                                                className={`w-full rounded-sm transition-all ${i === 5 ? 'bg-red-500' : i >= 4 ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                                                                                style={{ height: `${(v / 42) * 100}%`, minHeight: '2px' }}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="flex justify-between mt-1">
                                                                    <span className="text-[9px] text-muted-foreground">6w ago</span>
                                                                    <span className="text-[9px] text-red-500 font-bold">Now: 5</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Approval Chain (Pending Approval item) */}
                                                        {(action.details as any).approvalChain && (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Approval Chain</p>
                                                                <div className="flex items-center gap-2">
                                                                    {(action.details as any).approvalChain.map((step: any, i: number) => (
                                                                        <div key={i} className="flex items-center gap-2">
                                                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium border ${step.status === 'done' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                                                                                step.status === 'current' ? 'bg-primary/10 text-zinc-900 dark:text-primary border-primary/30 ring-1 ring-primary/20' :
                                                                                    'bg-muted text-muted-foreground border-zinc-200 dark:bg-zinc-800 dark:text-muted-foreground dark:border-zinc-700'
                                                                                }`}>
                                                                                {step.status === 'done' && <CheckCircleIcon className="w-3 h-3" />}
                                                                                {step.status === 'current' && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                                                                                {step.name}
                                                                            </div>
                                                                            {i < (action.details as any).approvalChain.length - 1 && (
                                                                                <ArrowRightIcon className="w-3 h-3 text-muted-foreground" />
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Action Buttons */}
                                                        <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                                                            <button className="text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors">
                                                                Dismiss
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (action.id === 4) {
                                                                        nextStep()
                                                                    } else {
                                                                        handleGenUIAction(`${action.action} ${action.title}`)
                                                                    }
                                                                }}
                                                                className="text-xs font-bold bg-primary text-zinc-900 px-4 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
                                                            >
                                                                {action.action}
                                                                <ArrowRightIcon className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column: Recent Activity Feed */}
                                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-brand font-semibold text-foreground flex items-center gap-2">
                                            {/* Changed from text-primary (lime) to text-muted-foreground for better visibility in light mode */}
                                            <ClockIcon className="w-5 h-5 text-muted-foreground" />
                                            Recent Activity
                                        </h3>
                                        <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg px-2 py-1 transition-colors">
                                            Related to You
                                            <ChevronDownIcon className="w-3 h-3" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {recentActivity.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${expandedActivityId === item.id
                                                    ? 'bg-muted/30 border-zinc-400 shadow-sm'
                                                    : 'bg-secondary border-border hover:border-zinc-400 hover:bg-muted/10'
                                                    }`}
                                            >
                                                <div
                                                    className="p-4 cursor-pointer"
                                                    onClick={() => setExpandedActivityId(expandedActivityId === item.id ? null : item.id)}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                                                            item.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                                                item.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                                    'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                            }`}>
                                                            <item.icon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    {/* Removed group-hover:text-primary for better legibility, added decoration instead */}
                                                                    <p className="text-sm font-medium text-foreground group-hover:underline decoration-zinc-300 dark:decoration-zinc-600 underline-offset-4 transition-all truncate">
                                                                        {item.title}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                                                                        <span>{item.time}</span>
                                                                        <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                                                                        <span className="font-mono">{item.related}</span>
                                                                    </p>
                                                                </div>
                                                                <ChevronDownIcon className={`w-4 h-4 text-muted-foreground transition-transform duration-300 shrink-0 ${expandedActivityId === item.id ? 'rotate-180' : ''}`} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expandable Details & Actions */}
                                                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedActivityId === item.id ? 'max-h-[500px] opacity-100 border-t border-border/50' : 'max-h-0 opacity-0'
                                                    }`}>
                                                    <div className="p-4 bg-muted/20 space-y-3">
                                                        {item.meta && (
                                                            <div className="text-xs text-muted-foreground flex items-center gap-2 pl-2 border-l-2 border-border">
                                                                {item.meta}
                                                            </div>
                                                        )}

                                                        {/* Detail Fields Grid */}
                                                        {item.details?.fields && (
                                                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                                                {item.details.fields.map((f: { label: string; value: string }, idx: number) => (
                                                                    <div key={idx}>
                                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{f.label}</p>
                                                                        <p className="text-xs font-medium text-foreground">{f.value}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Timeline (Quote converted to PO) */}
                                                        {item.details?.timeline && (
                                                            <div className="flex items-center gap-0 mt-1">
                                                                {item.details.timeline.map((step: { step: string; date: string; done: boolean }, idx: number) => (
                                                                    <div key={idx} className="flex items-center">
                                                                        <div className="flex flex-col items-center">
                                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${step.done ? 'bg-green-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-muted-foreground'}`}>
                                                                                {step.done ? '\u2713' : idx + 1}
                                                                            </div>
                                                                            <p className="text-[9px] font-medium text-foreground mt-0.5 whitespace-nowrap">{step.step}</p>
                                                                            <p className="text-[9px] text-muted-foreground">{step.date}</p>
                                                                        </div>
                                                                        {idx < item.details.timeline.length - 1 && (
                                                                            <div className={`w-8 h-0.5 mx-0.5 mt-[-18px] ${step.done ? 'bg-green-400' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Payment Breakdown */}
                                                        {item.details?.breakdown && (
                                                            <div className="rounded-lg border border-border bg-card/50 p-2.5 space-y-1.5">
                                                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Breakdown</p>
                                                                {item.details.breakdown.map((b: { item: string; amount: string }, idx: number) => (
                                                                    <div key={idx} className="flex justify-between text-xs">
                                                                        <span className="text-muted-foreground">{b.item}</span>
                                                                        <span className="font-medium text-foreground">{b.amount}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Discrepancy Table */}
                                                        {item.details?.discrepancies && (
                                                            <div className="rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-900/10 p-2.5">
                                                                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1.5">Discrepancies Found</p>
                                                                <div className="space-y-1.5">
                                                                    {item.details.discrepancies.map((d: { field: string; expected: string; actual: string; diff: string }, idx: number) => (
                                                                        <div key={idx} className="flex items-center justify-between text-xs">
                                                                            <span className="font-medium text-foreground">{d.field}</span>
                                                                            <div className="flex items-center gap-3">
                                                                                <span className="text-muted-foreground">Expected: {d.expected}</span>
                                                                                <span className="text-amber-600 dark:text-amber-400 font-semibold">Actual: {d.actual}</span>
                                                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">{d.diff}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Tracking Steps (Shipment delayed) */}
                                                        {item.details?.trackingSteps && (
                                                            <div className="space-y-0">
                                                                {item.details.trackingSteps.map((ts: { location: string; date: string; status: string }, idx: number) => (
                                                                    <div key={idx} className="flex items-start gap-2.5">
                                                                        <div className="flex flex-col items-center">
                                                                            <div className={`w-2.5 h-2.5 rounded-full mt-0.5 ${ts.status === 'done' ? 'bg-green-500' : ts.status === 'current' ? 'bg-amber-500 ring-2 ring-amber-200 dark:ring-amber-500/30' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                                                                            {idx < item.details.trackingSteps.length - 1 && (
                                                                                <div className={`w-0.5 h-5 ${ts.status === 'done' ? 'bg-green-300 dark:bg-green-700' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                                                                            )}
                                                                        </div>
                                                                        <div className="pb-2">
                                                                            <p className={`text-xs font-medium ${ts.status === 'current' ? 'text-amber-600 dark:text-amber-400' : ts.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>{ts.location}</p>
                                                                            <p className="text-[10px] text-muted-foreground">{ts.date}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Quick Actions Integration */}
                                                        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                                                            {item.actions && item.actions.map((action, idx) => {
                                                                // Wire the Shipment Delayed (#ORD-2056) "Track Shipment" CTA to navigate to OrderDetail with the delay scenario loaded.
                                                                const isDelayedTrack = item.related === '#ORD-2056' && action.primary
                                                                return (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            if (isDelayedTrack) {
                                                                                try { sessionStorage.setItem('demo:selectedOrderId', '#ORD-2056') } catch { /* ignore */ }
                                                                                if (onNavigate) onNavigate('order-detail')
                                                                            }
                                                                        }}
                                                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${action.primary
                                                                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent hover:bg-zinc-700 dark:hover:bg-zinc-200'
                                                                            : 'bg-white dark:bg-transparent text-foreground border-border hover:bg-muted'
                                                                            }`}
                                                                    >
                                                                        <action.icon className="w-3.5 h-3.5" />
                                                                        {action.label}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>

                                                        {item.aiSuggestion && (
                                                            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/10 p-3">
                                                                <div className="flex items-start gap-3">
                                                                    <AIAgentAvatar className="mt-0.5" />
                                                                    <div className="flex-1">
                                                                        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                                                                            AI Insight
                                                                        </p>
                                                                        <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 leading-relaxed mb-2">
                                                                            {item.aiSuggestion}
                                                                        </p>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setDemoPhase('ORDERED');
                                                                                setShowConfetti(true);
                                                                                localStorage.setItem('demo_flow_complete', 'true');
                                                                                localStorage.setItem('demo_view_order_id', 'ORD-7829');
                                                                                if (onNavigate) {
                                                                                    setTimeout(() => {
                                                                                        onNavigate('transactions');
                                                                                    }, 2500);
                                                                                }
                                                                            }}
                                                                            className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors flex items-center gap-1"
                                                                        >
                                                                            Resolve Issue <SparklesIcon className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button className="w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-muted/50">
                                            View All Activity
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* New Section: Performance & AI Suggestions */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Left Column: AI Suggestions */}
                                <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-brand font-semibold text-foreground flex items-center gap-2">
                                            <SparklesIcon className="w-5 h-5 text-indigo-500" />
                                            AI Suggestions
                                        </h3>
                                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                                            3 New
                                        </span>
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        {aiSuggestions.map((suggestion) => (
                                            <div key={suggestion.id} className={`rounded-xl border overflow-hidden transition-all duration-300 ${expandedSuggestionId === suggestion.id
                                                ? 'bg-muted/30 border-indigo-300 dark:border-indigo-500/30 shadow-sm'
                                                : 'bg-muted dark:bg-secondary/50 border-border hover:border-indigo-200 dark:hover:border-indigo-900/50'
                                                }`}>
                                                <div
                                                    className="p-4 cursor-pointer group"
                                                    onClick={() => setExpandedSuggestionId(expandedSuggestionId === suggestion.id ? null : suggestion.id)}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-card dark:bg-secondary border border-zinc-100 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                                            <suggestion.icon className="w-5 h-5 text-muted-foreground" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="text-sm font-semibold text-foreground">{suggestion.title}</h4>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                                                                        {suggestion.impact}
                                                                    </span>
                                                                    <ChevronDownIcon className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${expandedSuggestionId === suggestion.id ? 'rotate-180' : ''}`} />
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                                {suggestion.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expandable Details */}
                                                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedSuggestionId === suggestion.id ? 'max-h-[400px] opacity-100 border-t border-border/50' : 'max-h-0 opacity-0'}`}>
                                                    <div className="p-4 bg-muted/20 space-y-3">
                                                        {/* Detail Fields */}
                                                        {suggestion.details?.fields && (
                                                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                                                {suggestion.details.fields.map((f: { label: string; value: string }, idx: number) => (
                                                                    <div key={idx}>
                                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{f.label}</p>
                                                                        <p className="text-xs font-medium text-foreground">{f.value}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* AI Reasoning */}
                                                        {suggestion.details?.reasoning && (
                                                            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/10 p-3">
                                                                <div className="flex items-start gap-2.5">
                                                                    <AIAgentAvatar className="mt-0.5" />
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">AI Reasoning</p>
                                                                            {suggestion.details.confidence && (
                                                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                                                                                    {suggestion.details.confidence}% confidence
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 leading-relaxed">
                                                                            {suggestion.details.reasoning}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Action Button */}
                                                        <div className="pt-2 border-t border-border/50">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleGenUIAction(`Apply Suggestion: ${suggestion.title}`); }}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors"
                                                            >
                                                                <SparklesIcon className="w-3.5 h-3.5" />
                                                                Apply Suggestion
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column: Performance Tracking (Adaptive) */}
                                <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col h-full relative overflow-hidden group">
                                    {/* Background glow effect - Adaptive */}
                                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-brand-500/10 dark:bg-brand-500/20 blur-3xl rounded-full pointer-events-none opacity-50 dark:opacity-100"></div>

                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                        <div>
                                            <h3 className="text-lg font-brand font-semibold text-foreground">Performance</h3>
                                            <p className="text-xs text-muted-foreground mt-1">Operational metrics vs Targets</p>
                                        </div>
                                        <div className="flex bg-muted/50 rounded-lg p-0.5 border border-border/50">
                                            {['Day', 'Month', 'Sem', 'Year'].map((period) => (
                                                <button key={period} onClick={() => setPerformanceTimePeriod(period as typeof performanceTimePeriod)} className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${period === performanceTimePeriod ? 'bg-white dark:bg-brand-400 text-foreground dark:text-zinc-900 shadow-sm border border-border dark:border-transparent' : 'text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-700'}`}>
                                                    {period}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6 flex-1 relative z-10">
                                        {(performanceMetricsByPeriod[performanceTimePeriod] ?? performanceMetricsByPeriod.Month).map((metric, idx) => (
                                            <div key={idx}>
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-sm font-medium text-foreground">{metric.label}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-medium ${metric.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                            {metric.trendUp ? '\u2191' : '\u2193'} {metric.trend}
                                                        </span>
                                                        <span className="text-lg font-bold text-foreground">{metric.value}%</span>
                                                    </div>
                                                </div>
                                                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={`absolute top-0 left-0 h-full ${metric.color} rounded-full transition-all duration-500`}
                                                        style={{ width: `${metric.value}%` }}
                                                    ></div>
                                                    <div
                                                        className="absolute top-0 w-0.5 h-full bg-zinc-400 dark:bg-white/50 z-10"
                                                        style={{ left: `${metric.target}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between mt-1">
                                                    <span className="text-[10px] text-muted-foreground">vs prev. period</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono tracking-tight">{metric.target}% TARGET</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            </>)}
                        </div>
                    )
                }

                {/* Your Tools Tab Content */}
                {
                    mainTab === 'your_tools' && (
                        <div className="lg:col-span-3 space-y-6">
                            {/* Config Bar - Optimized for Contrast */}
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-zinc-900/10 border border-gray-200/50 dark:border-white/5 rounded-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">Tools configured for you</span>
                                </div>
                                <button
                                    onClick={() => setIsFeatureManagerOpen(true)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 bg-card border border-gray-200 dark:border-white/10 rounded-md shadow-sm text-xs font-medium text-muted-foreground hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all",
                                        isCustomizeHighlighted && "ring-2 ring-purple-500 animate-pulse relative z-50"
                                    )}
                                >
                                    <PencilSquareIcon className="w-3.5 h-3.5" />
                                    Customize
                                </button>
                            </div>

                            <FeatureManager
                                isOpen={isFeatureManagerOpen}
                                onClose={() => setIsFeatureManagerOpen(false)}
                                features={features}
                                onToggleFeature={handleToggleFeature}
                            />

                            <Reorder.Group axis="y" values={toolsOrder} onReorder={setToolsOrder} className="space-y-6">
                                {toolsOrder.map((toolId) => {
                                    const feature = features.find(f => f.id === toolId)
                                    // Only render if feature exists and is enabled
                                    if (!feature || !feature.enabled) return null;
                                    // Hide Quick Quote entirely during demo mode
                                    if (toolId === 'quick_quote' && isDemoActive) return null;

                                    return (
                                        <Reorder.Item
                                            key={toolId}
                                            value={toolId}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            whileDrag={{ scale: 1.02, zIndex: 50, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                                            className="mb-8 rounded-2xl bg-card overflow-hidden relative"
                                        >
                                            {/* Drag Handle Overlay - Optional if using specific handle, but Reorder.Item defaults to whole item draggable unless dragListener={false} */}
                                            {/* We want smooth reordering, so we'll let the user drag from anywhere or just handle? User asked for guidance, usually handle is explicit. */}
                                            {/* Let's try explicit handle for better control as requested "guide" */}

                                            {toolId === 'recent_orders' ? (
                                                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    {/* Header for Orders */}
                                                    <div className="p-6 border-b border-border">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h3 className="text-lg font-brand font-semibold text-foreground flex items-center gap-2 cursor-grab active:cursor-grabbing">
                                                                <Bars3Icon className="w-5 h-5 text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-muted-foreground transition-colors" />
                                                                Recent Orders
                                                            </h3>
                                                        </div>
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
                                                                <div className="relative group">
                                                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Search orders..."
                                                                        className="pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm text-foreground w-full sm:w-64 focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground"
                                                                        value={searchQuery}
                                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                                    />
                                                                </div>

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
                                                            <DashboardMetricsGrid selectedClient={selectedClient} />
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
                                                                                                                <button onClick={(e) => e.stopPropagation()} className={`${active ? 'bg-gray-50 dark:bg-white/5' : ''} group flex w-full items-center px-4 py-2 text-sm text-foreground dark:text-gray-200`}>
                                                                                                                    <span className="w-4 h-4 mr-2" ><PencilSquareIcon /></span> Edit
                                                                                                                </button>
                                                                                                            )}
                                                                                                        </MenuItem>
                                                                                                        <MenuItem>
                                                                                                            {({ active }) => (
                                                                                                                <button onClick={(e) => e.stopPropagation()} className={`${active ? 'bg-gray-50 dark:bg-white/5' : ''} group flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}>
                                                                                                                    <span className="w-4 h-4 mr-2" ><TrashIcon /></span> Delete
                                                                                                                </button>
                                                                                                            )}
                                                                                                        </MenuItem>
                                                                                                        <MenuItem>
                                                                                                            {({ active }) => (
                                                                                                                <button onClick={(e) => e.stopPropagation()} className={`${active ? 'bg-gray-50 dark:bg-white/5' : ''} group flex w-full items-center px-4 py-2 text-sm text-foreground dark:text-gray-200`}>
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
                                                                                            <div className="p-4 bg-muted dark:bg-secondary pl-12">
                                                                                                <div className="flex items-start gap-4">
                                                                                                    <div className="flex-1 space-y-4">
                                                                                                        <div className="flex items-center gap-3">
                                                                                                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><UserIcon className="w-6 h-6 text-muted-foreground" /></div>
                                                                                                            <div>
                                                                                                                <p className="text-sm font-medium text-foreground">Sarah Johnson</p>
                                                                                                                <p className="text-xs text-muted-foreground">Project Manager</p>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className="h-px bg-gray-200 dark:bg-white/10 w-full"></div>
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
                                                                        className={`group relative bg-secondary rounded-2xl border ${expandedIds.has(order.id) ? 'border-border ring-1 ring-border' : 'border-gray-200 dark:border-white/10'} shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col`}
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
                                                                                                            <button onClick={(e) => e.stopPropagation()} className={`${active ? 'bg-gray-50 dark:bg-white/5' : ''} group flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}>
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
                                                                                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-muted-foreground">
                                                                                                <UserIcon className="h-4 w-4" />
                                                                                            </div>
                                                                                            <div>
                                                                                                <p className="text-sm font-bold text-foreground">Sarah Johnson</p>
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
                                                                                                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 shrink-0" />
                                                                                                <div>
                                                                                                    <h5 className="text-sm font-bold text-amber-700 dark:text-amber-400">Alert: Customs Delay</h5>
                                                                                                    <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/70">Held at port. ETA +24h.</p>
                                                                                                    <button onClick={(e) => { e.stopPropagation(); setTrackingOrder(order); }} className="mt-2 text-xs font-medium text-zinc-900 dark:text-primary decoration-primary underline-offset-2 hover:underline">
                                                                                                        Track Shipment
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {expandedIds.has(order.id) && (
                                                                            <div className="mt-6 bg-gray-50 dark:bg-white/5 p-4 border-t border-gray-200 dark:border-white/10">
                                                                                <div className="flex items-center gap-2 mb-3">
                                                                                    <ShoppingBagIcon className="h-4 w-4 text-muted-foreground" />
                                                                                    <span className="text-xs font-medium text-muted-foreground dark:text-gray-300">Order Items (3)</span>
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    {['Office Chair Ergonomic', 'Standing Desk Motorized'].map((item, i) => (
                                                                                        <div key={i} className="flex justify-between text-xs">
                                                                                            <span className="text-muted-foreground">{item}</span>
                                                                                            <span className="text-foreground font-medium">x1</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        <div className="p-4 pt-0 mt-auto">
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); setTrackingOrder(order); }}
                                                                                className="w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-medium shadow-sm transition-all flex items-center justify-center gap-2"
                                                                            >
                                                                                <MapPinIcon className="h-3 w-3" /> Track Shipment
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : toolId === 'quick_quote' ? (
                                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                                    <div className="xl:col-span-2 min-h-[500px]">
                                                        <QuoteGenerationFlow onNavigate={onNavigate} />
                                                    </div>

                                                    {/* Right Column: Recent Quotes List (1/3 width) */}
                                                    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col h-full">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h3 className="text-lg font-brand font-semibold text-foreground">Recent Quotes</h3>
                                                            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">View All</button>
                                                        </div>

                                                        <div className="flex-1 overflow-auto">
                                                            <div className="space-y-4">
                                                                {recentQuotes.map((quote) => (
                                                                    <div key={quote.id} className="flex items-center justify-between p-3 rounded-xl bg-muted dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-primary/30 transition-colors cursor-pointer group">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                                                                                <DocumentTextIcon className="w-5 h-5 text-muted-foreground group-hover:text-muted-foreground dark:text-muted-foreground dark:group-hover:text-zinc-300 transition-colors" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-foreground">{quote.id}</p>
                                                                                <p className="text-xs text-muted-foreground">{quote.date}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-sm font-bold text-foreground">{quote.amount}</p>
                                                                            {/* Color map aligned with E.1.i taxonomy (Sent/Pending/In Progress/Expired). */}
                                                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${quote.status === 'Sent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                                quote.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                                quote.status === 'In Progress' ? 'bg-zinc-100 text-foreground dark:bg-zinc-800 dark:text-zinc-200' :
                                                                                    'bg-zinc-100 text-muted-foreground dark:bg-zinc-800 dark:text-muted-foreground'
                                                                                }`}>
                                                                                {quote.status}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <button className="w-full mt-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted dark:hover:bg-zinc-800 transition-colors">
                                                            Create New Quote
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : toolId === 'project_tracker' ? (
                                                <ProjectTrackerWidget />
                                            ) : toolId === 'inventory_forecast' ? (
                                                <InventoryForecastWidget />
                                            ) : toolId === 'installation_scheduler' ? (
                                                <InstallationSchedulerWidget />
                                            ) : toolId === 'warranty_claims' ? (
                                                <WarrantyClaimsWidget />
                                            ) : toolId === 'po_verification' ? (
                                                <POVerificationWidget />
                                            ) : (
                                                /* Placeholder for New B2B Widgets */
                                                <div className="bg-card rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <div className="w-12 h-12 rounded-full bg-muted dark:bg-secondary flex items-center justify-center mb-4">
                                                        <CubeIcon className="w-6 h-6 text-muted-foreground" />
                                                    </div>
                                                    <h3 className="text-lg font-brand font-semibold text-foreground">{feature?.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1 max-w-md">{feature?.description}</p>
                                                    <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                                                        Launch Preview
                                                    </button>
                                                </div>
                                            )}
                                        </Reorder.Item>
                                    )
                                })}
                            </Reorder.Group>
                        </div>
                    )
                }

                {/* Charts Area */}
                {
                    mainTab === 'metrics' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Dupler Flow 3: Processing renders inside Metrics tab */}
                            {currentStep?.id.startsWith('d3.') && (
                                <DuplerReporting onNavigate={onNavigate} />
                            )}
                            <DashboardMetricsGrid selectedClient={selectedClient} />
                        </div>
                    )
                }
            </div >

            <Transition appear show={!!trackingOrder} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setTrackingOrder(null)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25 dark:bg-black/80 backdrop-blur-sm" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-card p-6 text-left align-middle shadow-xl transition-all border border-border">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-foreground flex justify-between items-center mb-6"
                                    >
                                        <span>Tracking Details - {trackingOrder?.id}</span>
                                        <button
                                            onClick={() => setTrackingOrder(null)}
                                            className="rounded-full p-1 hover:bg-muted transition-colors"
                                        >
                                            <span className="sr-only">Close</span>
                                            <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </Dialog.Title>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Left Col: Timeline */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Shipment Progress</h4>
                                            <div className="space-y-6 relative pl-2 border-l border-border ml-2">
                                                {trackingSteps.map((step, idx) => (
                                                    <div key={idx} className="relative pl-6">
                                                        <div className={cn(
                                                            "absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background",
                                                            step.completed ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-700",
                                                            step.alert && "bg-red-500 dark:bg-red-500"
                                                        )} />
                                                        <p className="text-sm font-medium text-foreground">{step.status}</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">{step.date} · {step.location}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right Col: Georefence & Actions */}
                                        <div className="flex flex-col h-full">
                                            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Delivery Location</h4>

                                            {/* Map Placeholder */}
                                            <div className="bg-muted rounded-lg h-40 w-full mb-4 flex items-center justify-center border border-border">
                                                <div className="text-center">
                                                    <MapPinIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                                    <span className="text-xs text-muted-foreground block">Map Preview Unavailable</span>
                                                </div>
                                            </div>

                                            <div className="bg-muted dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 mb-6">
                                                <p className="text-xs font-medium text-foreground">Distribution Center NY-05</p>
                                                <p className="text-xs text-muted-foreground mt-1">45 Industrial Park Dr, Brooklyn, NY 11201</p>
                                            </div>

                                            <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                                <button
                                                    type="button"
                                                    className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-brand-300 dark:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                                                    onClick={() => console.log('Contacting support...')}
                                                >
                                                    <EnvelopeIcon className="h-4 w-4" />
                                                    Contact Support
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* ERP Sync Modal */}
            <ERPSyncModal
                isOpen={isERPSyncModalOpen}
                onClose={() => setIsERPSyncModalOpen(false)}
            />

        </div >
    )
}


