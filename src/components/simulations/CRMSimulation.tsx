import { useState, useEffect, useMemo, useCallback, useRef, Fragment } from 'react'
import {
    CheckCircleIcon, ExclamationTriangleIcon, ArrowTrendingUpIcon,
    ClockIcon, SparklesIcon, ArrowPathIcon,
    BuildingOfficeIcon, DocumentTextIcon, ChartBarSquareIcon,
    BellAlertIcon, ArrowRightIcon, UserGroupIcon, CalendarDaysIcon,
    MapPinIcon, CubeIcon, LightBulbIcon, BoltIcon,
    ClipboardDocumentListIcon, CurrencyDollarIcon, ReceiptPercentIcon,
    ChevronDownIcon, ChevronUpIcon, PlusIcon, ArrowsRightLeftIcon
} from '@heroicons/react/24/outline'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import { useDemo } from '../../context/DemoContext'
import { useDemoProfile } from '../../context/useDemoProfile'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Bot, Package, FileText, Truck, Wrench, Mail } from 'lucide-react'
import { AIAgentAvatar } from './DemoAvatars'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

// ═══════════════════════════════════════════════════
// MOCK DATA — Connected to Flows 1-3
// ═══════════════════════════════════════════════════

interface Project {
    id: string; name: string; customer: string; contact: string;
    quote: string; po: string; value: number;
    stage: 'Planning' | 'Procurement' | 'Delivery' | 'Installation' | 'Complete';
    items: number; zones: number;
    status: 'Active' | 'On Track' | 'At Risk' | 'Complete';
    created: string; deliveryRate: number; openClaims: number;
}

const MOCK_PROJECTS: Project[] = [
    {
        id: 'PRJ-001', name: 'Apex HQ Office Renovation', customer: 'Apex Furniture',
        contact: 'Jennifer Martinez (VP Operations)',
        quote: 'QT-1025', po: 'ORD-2055', value: 43750,
        stage: 'Procurement', items: 200, zones: 4,
        status: 'Active', created: 'Just now', deliveryRate: 0, openClaims: 0
    },
    {
        id: 'PRJ-002', name: 'Urban Living Lobby Refresh', customer: 'Urban Living Inc.',
        contact: 'Marcus Chen (Facilities Director)',
        quote: 'QT-1019', po: 'ORD-2053', value: 112000,
        stage: 'Installation', items: 45, zones: 1,
        status: 'On Track', created: '2 months ago', deliveryRate: 96, openClaims: 0
    },
    {
        id: 'PRJ-003', name: 'Summit Health Clinic Fit-Out', customer: 'Summit Health Group',
        contact: 'Karen Park (Procurement Lead)',
        quote: 'QT-1012', po: 'ORD-2048', value: 87500,
        stage: 'Complete', items: 120, zones: 2,
        status: 'Complete', created: '4 months ago', deliveryRate: 100, openClaims: 0
    },
    {
        id: 'PRJ-004', name: 'Meridian Tower Floor 12', customer: 'Meridian Financial',
        contact: 'David Torres (COO)',
        quote: 'QT-1008', po: 'ORD-2044', value: 198000,
        stage: 'Delivery', items: 310, zones: 3,
        status: 'At Risk', created: '3 months ago', deliveryRate: 72, openClaims: 2
    },
    {
        id: 'PRJ-005', name: 'Greenfield Campus Expansion', customer: 'Greenfield Properties',
        contact: 'Amanda Foster (Design Director)',
        quote: 'QT-0998', po: 'ORD-2039', value: 245000,
        stage: 'Complete', items: 480, zones: 6,
        status: 'Complete', created: '6 months ago', deliveryRate: 100, openClaims: 0
    },
]

const CUSTOMER_PROFILE = {
    name: 'Apex Furniture',
    contact: 'Jennifer Martinez',
    title: 'VP Operations',
    email: 'j.martinez@apexfurniture.com',
    phone: '(512) 555-0147',
    lifetimeValue: 1200000,
    totalProjects: 5,
    activeProjects: 2,
    avgProjectSize: 137250,
    recentOrders: [
        { po: 'ORD-2055', value: 43750, date: 'Today', status: 'Active' },
        { po: 'ORD-1987', value: 62500, date: '3 months ago', status: 'Complete' },
        { po: 'ORD-1834', value: 112000, date: '8 months ago', status: 'Complete' },
        { po: 'ORD-1722', value: 198000, date: '14 months ago', status: 'Complete' },
    ],
    tags: ['Preferred', 'Volume Buyer', '10+ Years'],
    systems: [
        { name: 'Dealer Experience', synced: true, records: 12 },
        { name: 'Expert Hub', synced: true, records: 8 },
        { name: 'Email / RFQ', synced: true, records: 15 },
        { name: 'Service Center', synced: true, records: 3 },
    ],
}

interface TimelineEvent {
    event: string; step: string; system: string;
    status: 'complete' | 'active' | 'pending';
    detail?: string;
    icon: 'email' | 'ai' | 'quote' | 'po' | 'ack' | 'service';
    newlySynced?: boolean;
    expandedDetail?: { label: string; value: string }[];
}

const PROJECT_TIMELINE: TimelineEvent[] = [
    { event: 'RFQ Email Received', step: '1.1', system: 'Email', status: 'complete', detail: 'PDF spec + CSV from vendor', icon: 'email' },
    { event: 'AI Extraction — 200 items', step: '1.2', system: 'Expert Hub', status: 'complete', detail: '5 AI agents, 4 delivery zones', icon: 'ai' },
    { event: 'Data Normalized — 94% confidence', step: '1.3', system: 'Expert Hub', status: 'complete', detail: '4 AI agents, low-confidence flagged', icon: 'ai' },
    { event: 'Quote #QT-1025 Drafted', step: '1.4', system: 'Expert Hub', status: 'complete', detail: 'Volume discounts applied', icon: 'quote' },
    { event: 'Expert Review — 8 items validated', step: '1.5', system: 'Expert Hub', status: 'complete', detail: 'Freight $2,450 Austin TX corrected', icon: 'ai' },
    { event: 'Quote Approved — $43,750', step: '1.7', system: 'Dealer Exp.', status: 'complete', detail: '35.4% margin, 3-level chain', icon: 'quote' },
    { event: 'PO #ORD-2055 Generated', step: '1.9', system: 'Dealer Exp.', status: 'complete', detail: '5 SKUs mapped, transmitted to supplier', icon: 'po' },
    { event: 'AIS Ack — 3 exceptions resolved', step: '2.4', system: 'Expert Hub', status: 'complete', detail: '50 lines, $65K, +14d delivery adj.', icon: 'ack', newlySynced: true, expandedDetail: [
        { label: 'Vendor', value: 'AIS (Adaptive Interior Solutions)' },
        { label: 'Lines processed', value: '50 lines · $65,000' },
        { label: 'Grommet fix', value: 'Line 41 auto-corrected — No Grommet spec' },
        { label: 'Date shifts', value: 'Lines 12 & 34 accepted (+14d / +11d)' },
        { label: 'Qty shortfall', value: 'Backorder BO-1064B created for 6 units' },
        { label: 'Synced by', value: 'OrderSyncAgent · Just now' },
    ]},
    { event: 'HAT Ack — Confirmed', step: '2.6', system: 'Expert Hub', status: 'complete', detail: '5 lines, $8K, on schedule', icon: 'ack', newlySynced: true, expandedDetail: [
        { label: 'Vendor', value: 'HAT (Haworth)' },
        { label: 'Lines processed', value: '5 lines · $8,000' },
        { label: 'AI Vendor Rule', value: 'Part number match sufficient per client directive' },
        { label: 'Color/desc variations', value: 'Accepted — no discrepancies' },
        { label: 'Delivery schedule', value: 'On schedule, no date shifts' },
        { label: 'Synced by', value: 'OrderSyncAgent · Just now' },
    ]},
    { event: 'Warranty Claim — SKU mismatch', step: '3.4', system: 'Service Ctr.', status: 'active', detail: 'CC-AZ-2024 vs 2025, carrier review', icon: 'service' },
]

const projectValueByStage = [
    { stage: 'Planning', value: 0, count: 0 },
    { stage: 'Procurement', value: 43750, count: 1 },
    { stage: 'Delivery', value: 198000, count: 1 },
    { stage: 'Installation', value: 112000, count: 1 },
    { stage: 'Complete', value: 332500, count: 2 },
]

const systemSyncData = [
    { name: 'Dealer Exp.', value: 35, color: '#E6F993' },
    { name: 'Expert Hub', value: 30, color: '#a3e635' },
    { name: 'Email/RFQ', value: 20, color: '#65a30d' },
    { name: 'Service Ctr.', value: 15, color: '#3f6212' },
]

// ═══════════════════════════════════════════════════
// PROJECT DETAIL CARD — Expanded with AI suggestions
// ═══════════════════════════════════════════════════

const PROJECT_DETAIL_SECTIONS = {
    overview: [
        { label: 'Customer', value: 'Apex Furniture', icon: <BuildingOfficeIcon className="h-3 w-3" /> },
        { label: 'Contact', value: 'Jennifer Martinez, VP Operations', icon: <UserGroupIcon className="h-3 w-3" /> },
        { label: 'PO Number', value: 'ORD-2055', icon: <DocumentTextIcon className="h-3 w-3" /> },
        { label: 'Quote Ref', value: 'QT-1025', icon: <FileText className="h-3 w-3" /> },
        { label: 'Total Value', value: '$43,750', icon: <ArrowTrendingUpIcon className="h-3 w-3" /> },
        { label: 'Line Items', value: '200 items across 4 zones', icon: <CubeIcon className="h-3 w-3" /> },
    ],
    deliveryZones: [
        { zone: 'Zone A — Main Office (Floor 2)', items: 82, value: '$18,200', eta: 'Mar 28' },
        { zone: 'Zone B — Executive Suite (Floor 5)', items: 35, value: '$12,400', eta: 'Apr 4' },
        { zone: 'Zone C — Lounge & Common Areas', items: 48, value: '$8,150', eta: 'Apr 11' },
        { zone: 'Zone D — Austin TX Satellite', items: 35, value: '$5,000', eta: 'Apr 18' },
    ],
    aiSuggestions: [
        {
            type: 'optimization' as const,
            title: 'Consolidate Zone A & B Shipments',
            detail: 'Both zones ship from same warehouse. Combining saves ~$1,200 in freight costs and reduces delivery windows by 3 days.',
            confidence: 94,
            impact: 'Save $1,200',
        },
        {
            type: 'risk' as const,
            title: 'Zone D — LTL Freight Rate Review',
            detail: 'Austin TX freight at $2,450 was manually adjusted in Expert Review (Step 1.5). Market rates dropped 8% since quote — recommend re-negotiation.',
            confidence: 87,
            impact: 'Save ~$196',
        },
        {
            type: 'upsell' as const,
            title: 'Cross-sell: Installation Services',
            detail: 'Apex Furniture ordered installation for 3 of 4 previous projects. Estimated add-on: $6,500–$8,200 based on 200 items.',
            confidence: 91,
            impact: '+$6.5K–$8.2K',
        },
    ],
    quickActions: [
        { label: 'Schedule Delivery', icon: <CalendarDaysIcon className="h-3.5 w-3.5" /> },
        { label: 'Email Customer', icon: <Mail className="h-3.5 w-3.5" /> },
        { label: 'View Full Quote', icon: <DocumentTextIcon className="h-3.5 w-3.5" /> },
        { label: 'Assign Team', icon: <UserGroupIcon className="h-3.5 w-3.5" /> },
    ],
}

type DetailTab = 'overview' | 'zones' | 'insights'

const DETAIL_TABS: { key: DetailTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <DocumentTextIcon className="h-3.5 w-3.5" /> },
    { key: 'zones', label: 'Delivery Zones', icon: <MapPinIcon className="h-3.5 w-3.5" /> },
    { key: 'insights', label: 'AI Insights', icon: <SparklesIcon className="h-3.5 w-3.5" /> },
]

function ProjectDetailCard({ isNewProject, isProjectIntake, inline }: { isNewProject: boolean; isProjectIntake?: boolean; inline?: boolean }) {
    const { nextStep } = useDemo()
    const [activeTab, setActiveTab] = useState<DetailTab>('overview')
    const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null)
    const [selectedTeam, setSelectedTeam] = useState<string[]>([])

    const suggestionStyles = {
        optimization: { bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20', text: 'text-blue-600 dark:text-blue-400', icon: <BoltIcon className="h-3.5 w-3.5" /> },
        risk: { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', icon: <ExclamationTriangleIcon className="h-3.5 w-3.5" /> },
        upsell: { bg: 'bg-emerald-50 dark:bg-success/10', border: 'border-emerald-200 dark:border-emerald-500/20', text: 'text-success dark:text-success', icon: <LightBulbIcon className="h-3.5 w-3.5" /> },
    }

    // Continua HQ project content
    const CONTINUA_OVERVIEW = [
        { label: 'Estimate', value: '$3.2M', icon: <CurrencyDollarIcon className="h-3 w-3" /> },
        { label: 'Floors', value: '8', icon: <BuildingOfficeIcon className="h-3 w-3" /> },
        { label: 'Workstations', value: '1,200', icon: <CubeIcon className="h-3 w-3" /> },
        { label: 'Conf. Rooms', value: '40', icon: <UserGroupIcon className="h-3 w-3" /> },
        { label: 'Manufacturers', value: '3 matched', icon: <Package className="h-3 w-3" /> },
        { label: 'Client', value: 'Corporate HQ', icon: <BuildingOfficeIcon className="h-3 w-3" /> },
    ]
    const CONTINUA_SCOPE = [
        { label: 'Workstations (Herman Miller)', qty: 1200, pct: 60 },
        { label: 'Conference Tables (Knoll)', qty: 120, pct: 16 },
        { label: 'Architectural Walls (DIRTT)', qty: 80, pct: 11 },
        { label: 'AV Integration', qty: 56, pct: 7 },
        { label: 'Soft Seating & Lounge', qty: 44, pct: 6 },
    ]
    const CONTINUA_MILESTONES = [
        { milestone: 'RFP Received & Parsed', status: 'done' as const, date: 'Today' },
        { milestone: 'Requirements Extracted (AI)', status: 'done' as const, date: 'Today' },
        { milestone: 'Manufacturers Identified', status: 'done' as const, date: 'Today' },
        { milestone: 'Estimate Calculated ($3.2M)', status: 'done' as const, date: 'Today' },
        { milestone: 'Multi-Manufacturer POs', status: 'pending' as const, date: 'Next step' },
        { milestone: 'Installation Complete', status: 'pending' as const, date: 'Est. 16 weeks' },
    ]
    const CONTINUA_TEAM = [
        { id: 'pm', name: 'Sarah Chen', role: 'Project Manager', capacity: 72, recommended: true },
        { id: 'de', name: 'Marcus Webb', role: 'Design Engineer', capacity: 85, recommended: true },
        { id: 'av', name: 'Lisa Park', role: 'AV Specialist', capacity: 60, recommended: true },
        { id: 'inst', name: 'James Rodriguez', role: 'Install Lead', capacity: 90, recommended: false },
        { id: 'proc', name: 'Diana Osei', role: 'Procurement Analyst', capacity: 45, recommended: true },
    ]
    const CONTINUA_AI_SUGGESTIONS = [
        {
            type: 'optimization' as const,
            title: 'Consolidate Herman Miller & Knoll POs',
            detail: 'Both under MillerKnoll umbrella — combined order qualifies for Platinum tier pricing. Estimated savings: $84,000 (2.6%).',
            confidence: 94,
            impact: 'Save $84K',
        },
        {
            type: 'risk' as const,
            title: 'DIRTT Lead Time Alert',
            detail: 'Architectural walls have 12-week lead time vs 8-week furniture. Recommend ordering DIRTT first to avoid installation delays on floors 5-8.',
            confidence: 88,
            impact: 'Avoid 4-week delay',
        },
        {
            type: 'upsell' as const,
            title: 'Reuse Assessment: Floor 3 Teardown',
            detail: 'Client is vacating existing floor 3. AI identified 180 workstations compatible with project spec. Potential savings: $127,000 if refurbished.',
            confidence: 82,
            impact: '+$127K savings',
        },
    ]

    const overviewFields = isProjectIntake ? CONTINUA_OVERVIEW : PROJECT_DETAIL_SECTIONS.overview
    const scopeItems = isProjectIntake ? CONTINUA_SCOPE : [
        { label: 'Workstations & Desks', qty: 82, pct: 41 },
        { label: 'Executive Seating', qty: 35, pct: 17.5 },
        { label: 'Lounge & Soft Seating', qty: 48, pct: 24 },
        { label: 'Conference Tables & AV', qty: 20, pct: 10 },
        { label: 'Filing & Storage', qty: 15, pct: 7.5 },
    ]
    const milestones = isProjectIntake ? CONTINUA_MILESTONES : [
        { milestone: 'RFQ Received & Processed', status: 'done' as const, date: 'Today' },
        { milestone: 'Quote Approved ($43,750)', status: 'done' as const, date: 'Today' },
        { milestone: 'PO Generated & Transmitted', status: 'done' as const, date: 'Today' },
        { milestone: 'Supplier Acknowledgements', status: 'pending' as const, date: 'Est. 3–5 days' },
        { milestone: 'Delivery Starts (Zone A)', status: 'pending' as const, date: 'Est. Mar 28' },
        { milestone: 'Installation Complete', status: 'pending' as const, date: 'Est. Apr 25' },
    ]
    const aiSuggestions = isProjectIntake ? CONTINUA_AI_SUGGESTIONS : PROJECT_DETAIL_SECTIONS.aiSuggestions

    return (
        <div className={cn(
            "bg-card overflow-hidden",
            inline
                ? "border-t border-brand-400/20"
                : cn("border border-border rounded-xl", isNewProject && "animate-in fade-in slide-in-from-bottom-4 duration-500 border-brand-400/30")
        )}>
            {/* Header with project info + quick actions */}
            <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <BuildingOfficeIcon className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs font-semibold text-foreground">
                                    {isProjectIntake ? 'Corporate HQ — 8-Floor Fit-Out' : 'Apex HQ Office Renovation'}
                                </h4>
                                {isNewProject && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">New Project</span>}
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
                                    {isProjectIntake ? 'Scoping' : 'Procurement'}
                                </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                {isProjectIntake
                                    ? 'PRJ-001 · RFP Intake · $3.2M estimate · Herman Miller, Knoll, DIRTT'
                                    : 'PRJ-001 · Quote #QT-1025 · PO #ORD-2055 · $43,750'
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {PROJECT_DETAIL_SECTIONS.quickActions.map(action => (
                            <button key={action.label} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border transition-all" title={action.label}>
                                {action.icon}
                                <span className="hidden xl:inline">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detail Tabs */}
                <div className="flex items-center gap-0.5 mt-3 -mb-[1px]">
                    {DETAIL_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-[10px] font-medium transition-all border border-transparent",
                                activeTab === tab.key
                                    ? "bg-card border-border border-b-card text-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.key === 'insights' && (
                                <span className="px-1 py-0.5 rounded-full bg-brand-300 dark:bg-brand-400 text-zinc-900 text-[8px] font-bold leading-none">{aiSuggestions.length}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-4">
                {activeTab === 'overview' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        {/* Key metrics grid */}
                        <div className="grid grid-cols-6 gap-2.5">
                            {overviewFields.map(f => (
                                <div key={f.label} className="p-2 rounded-lg bg-muted/30 border border-border">
                                    <div className="flex items-center gap-1 text-muted-foreground mb-0.5">{f.icon}<span className="text-[9px]">{f.label}</span></div>
                                    <p className="text-[11px] font-medium text-foreground leading-tight">{f.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Project scope summary */}
                        <div className={cn("grid gap-4", isProjectIntake ? "grid-cols-3" : "grid-cols-2")}>
                            <div className="space-y-2">
                                <h5 className="text-[11px] font-semibold text-foreground">Project Scope</h5>
                                <div className="space-y-1.5">
                                    {scopeItems.map(cat => (
                                        <div key={cat.label} className="flex items-center gap-2">
                                            <span className="text-[10px] text-foreground w-[160px] truncate">{cat.label}</span>
                                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                                <div className="h-full rounded-full bg-success dark:bg-emerald-400" style={{ width: `${cat.pct}%` }} />
                                            </div>
                                            <span className="text-[9px] text-muted-foreground tabular-nums w-10 text-right">{cat.qty.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Team Selection — Continua only */}
                            {isProjectIntake && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h5 className="text-[11px] font-semibold text-foreground">Suggested Team</h5>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium">AI Recommended</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {CONTINUA_TEAM.map(member => {
                                            const isSelected = member.recommended || selectedTeam.includes(member.id)
                                            return (
                                                <div
                                                    key={member.id}
                                                    className={cn(
                                                        "flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all",
                                                        isSelected
                                                            ? "border-brand-400/40 bg-brand-50/30 dark:bg-brand-500/5"
                                                            : "border-border"
                                                    )}
                                                >
                                                    <button
                                                        onClick={() => setSelectedTeam(prev =>
                                                            prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id]
                                                        )}
                                                        className={cn(
                                                            "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                                                            isSelected ? "bg-brand-400 border-brand-400" : "border-border"
                                                        )}
                                                    >
                                                        {isSelected && <CheckCircleIcon className="h-3 w-3 text-zinc-900" />}
                                                    </button>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-medium text-foreground truncate">{member.name}</p>
                                                        <p className="text-[9px] text-muted-foreground">{member.role}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <p className={cn("text-[9px] font-medium tabular-nums mr-1",
                                                            member.capacity < 50 ? "text-green-600 dark:text-green-400" :
                                                            member.capacity < 80 ? "text-amber-600 dark:text-amber-400" :
                                                            "text-red-600 dark:text-red-400"
                                                        )}>{member.capacity}%</p>
                                                        <button className="p-0.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors" title="Replace member">
                                                            <ArrowsRightLeftIcon className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <button className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border border-dashed border-border text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-brand-400/40 hover:bg-muted/30 transition-all">
                                        <PlusIcon className="h-3 w-3" />
                                        Add Team Member
                                    </button>
                                </div>
                            )}

                            <div className="space-y-2">
                                <h5 className="text-[11px] font-semibold text-foreground">Key Milestones</h5>
                                <div className="space-y-1.5">
                                    {milestones.map(m => (
                                        <div key={m.milestone} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border">
                                            {m.status === 'done' ? (
                                                <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                            ) : (
                                                <ClockIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            )}
                                            <span className={cn("text-[10px] flex-1", m.status === 'done' ? 'text-foreground' : 'text-muted-foreground')}>{m.milestone}</span>
                                            <span className="text-[9px] text-muted-foreground tabular-nums shrink-0">{m.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'zones' && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] text-muted-foreground">4 delivery zones · 200 total items · Estimated completion: Apr 25</p>
                            <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-zinc-900 bg-brand-300 hover:bg-brand-400 dark:bg-brand-400 dark:hover:bg-brand-300 transition-colors">
                                <CalendarDaysIcon className="h-3 w-3" />
                                Schedule All
                            </button>
                        </div>
                        <div className="space-y-2">
                            {PROJECT_DETAIL_SECTIONS.deliveryZones.map((z, i) => (
                                <div key={i} className="px-3 py-2.5 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">{String.fromCharCode(65 + i)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-medium text-foreground">{z.zone}</p>
                                            <p className="text-[9px] text-muted-foreground">{z.items} items · {z.value}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] font-medium text-foreground tabular-nums">ETA {z.eta}</p>
                                            <p className="text-[9px] text-muted-foreground">
                                                {i === 0 ? 'LTL — Standard' : i === 3 ? 'LTL — $2,450 (reviewed)' : 'LTL — Standard'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 ml-2">
                                            <span className={cn(
                                                "text-[8px] px-1.5 py-0.5 rounded-full font-medium",
                                                i === 3 ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                                            )}>
                                                {i === 3 ? 'Rate Flagged' : 'On Track'}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Zone line items preview */}
                                    <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-3 text-[9px] text-muted-foreground">
                                        <span>Top items: {['Workstations', 'Exec Chairs', 'Lounge Sofas', 'Conf. Tables'][i]}</span>
                                        <span>·</span>
                                        <span>Supplier: {['Herman Miller', 'Steelcase', 'Haworth', 'Knoll'][i]}</span>
                                        <span className="ml-auto text-[9px] text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer hover:underline">View items →</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Zone summary bar */}
                        <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-muted">
                            {PROJECT_DETAIL_SECTIONS.deliveryZones.map((z, i) => (
                                <div key={i} className={cn("h-full rounded-full", ['bg-success', 'bg-success', 'bg-emerald-400', 'bg-emerald-300'][i])} style={{ width: `${(z.items / 200) * 100}%` }} title={`Zone ${String.fromCharCode(65 + i)}: ${z.items} items`} />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'insights' && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                        {/* AI agent header */}
                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-brand-50 dark:bg-brand-500/5 border border-brand-200/50 dark:border-brand-500/20">
                            <AIAgentAvatar size="sm" />
                            <div className="flex-1">
                                <p className="text-[10px] font-medium text-foreground">
                                    {isProjectIntake ? 'IntakeAgent analyzed project scope & procurement options' : 'ProjectIntelligenceAgent analyzed this project'}
                                </p>
                                <p className="text-[9px] text-muted-foreground">
                                    {isProjectIntake
                                        ? `${aiSuggestions.length} suggestions based on RFP analysis, manufacturer data, and inventory`
                                        : '3 suggestions based on quote data, customer history, and market rates'
                                    }
                                </p>
                            </div>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">
                                {isProjectIntake ? 'Potential: +$211K savings' : 'Potential: +$7.9K savings'}
                            </span>
                        </div>

                        {/* Suggestion cards */}
                        <div className="space-y-2">
                            {aiSuggestions.map((s, i) => {
                                const style = suggestionStyles[s.type]
                                const isExpanded = expandedSuggestion === i
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setExpandedSuggestion(isExpanded ? null : i)}
                                        className={cn(
                                            "w-full text-left px-3 py-2.5 rounded-lg border transition-all",
                                            style.bg, style.border,
                                            isExpanded && "ring-1 ring-offset-1 ring-offset-card",
                                            isExpanded ? `ring-current ${style.text}` : ""
                                        )}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <span className={cn("mt-0.5 shrink-0", style.text)}>{style.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-semibold text-foreground">{s.title}</span>
                                                    <span className={cn("text-[9px] font-bold ml-auto shrink-0", style.text)}>{s.impact}</span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{s.detail}</p>
                                                {isExpanded && (
                                                    <div className="mt-2 pt-2 border-t border-current/10 animate-in fade-in slide-in-from-top-1 duration-200">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[9px] text-muted-foreground">Confidence:</span>
                                                                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                                                    <div className={cn("h-full rounded-full", s.confidence >= 90 ? 'bg-green-500' : 'bg-amber-500')} style={{ width: `${s.confidence}%` }} />
                                                                </div>
                                                                <span className="text-[9px] font-medium text-foreground tabular-nums">{s.confidence}%</span>
                                                            </div>
                                                            <div className="flex gap-1.5 ml-auto">
                                                                <span className="text-[10px] px-3 py-1 rounded-lg bg-primary text-primary-foreground font-bold cursor-pointer hover:bg-brand-400 transition-colors">Apply</span>
                                                                <span className="text-[10px] px-3 py-1 rounded-lg bg-muted text-muted-foreground font-medium cursor-pointer hover:bg-muted/80 transition-colors">Dismiss</span>
                                                                <span className="text-[10px] px-3 py-1 rounded-lg border border-border text-foreground font-medium cursor-pointer hover:bg-muted/50 transition-colors">Review Details</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Quick actions row */}
                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                            <span className="text-[9px] text-muted-foreground">Quick Actions:</span>
                            {[
                                { label: 'Apply All Optimizations', primary: true },
                                { label: 'Generate Report', primary: false },
                                { label: 'Share with Team', primary: false },
                            ].map(a => (
                                <button key={a.label} className={cn(
                                    "text-[10px] px-2.5 py-1 rounded-lg font-medium transition-colors",
                                    a.primary ? 'bg-primary text-primary-foreground hover:bg-brand-400' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                                )}>
                                    {a.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CTA footer — always visible regardless of active tab */}
            <div className="px-4 py-3 border-t border-border flex items-center gap-3">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-1">
                    <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span>
                        {isProjectIntake
                            ? <>RFP parsed → Requirements extracted → Manufacturers matched → Estimate calculated — <strong className="text-foreground">zero manual entry</strong></>
                            : <>Data sourced from: Email Ingestion → AI Extraction → Expert Review → Dealer Approval — <strong className="text-foreground">zero manual entry</strong></>
                        }
                    </span>
                </div>
                {isNewProject && (
                    <button
                        onClick={nextStep}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-300 hover:bg-brand-400 dark:bg-brand-400 dark:hover:bg-brand-300 text-zinc-900 text-[11px] font-bold shadow-sm transition-all hover:scale-[1.02]"
                    >
                        <UserGroupIcon className="h-3.5 w-3.5" />
                        {isProjectIntake ? 'Confirm Team & Notify Expert' : 'Review Customer Profile'}
                        <ArrowRightIcon className="h-3 w-3" />
                    </button>
                )}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════
// PROJECTS VIEW (Step 1.12 + Continua Step 1.1)
// Phased animation: notification → processing → project reveal → detail card
// ═══════════════════════════════════════════════════

type ProjectPhase = 'idle' | 'notification' | 'processing' | 'revealed' | 'detail'

const INTAKE_AGENTS = [
    { name: 'IntakeAgent', detail: 'Parsing RFP document...' },
    { name: 'SpecAnalyzer', detail: 'Extracting 1,200 workstations, 40 conf. rooms...' },
    { name: 'ManufacturerMatcher', detail: 'Matching Herman Miller, Knoll, DIRTT...' },
    { name: 'EstimationEngine', detail: 'Calculating $3.2M preliminary estimate...' },
    { name: 'CRMProjectCreator', detail: 'Creating project PRJ-001...' },
]

function ProjectsView({ stepId, skipNotification, isProjectIntake }: { stepId: string; skipNotification?: boolean; isProjectIntake?: boolean }) {
    const isNewProject = stepId === '1.12' || !!isProjectIntake
    // If notification was already shown on Dashboard, skip straight to revealed
    const initialPhase: ProjectPhase = !isNewProject ? 'revealed' : skipNotification ? 'revealed' : 'idle'
    const [phase, setPhase] = useState<ProjectPhase>(initialPhase)

    // Processing agents state (for Continua intake)
    const [processingAgents, setProcessingAgents] = useState(
        INTAKE_AGENTS.map(a => ({ ...a, visible: false, done: false }))
    )
    const [progressWidth, setProgressWidth] = useState(0)

    // Track phase in ref for setTimeout access
    const phaseRef = useRef(phase)
    useEffect(() => { phaseRef.current = phase }, [phase])

    // Phased animation for step 1.12 (COI) or Continua intake
    useEffect(() => {
        if (!isNewProject) { setPhase('revealed'); return }
        if (skipNotification) {
            setPhase('revealed')
            const timer = setTimeout(() => setPhase('detail'), 1500)
            return () => clearTimeout(timer)
        }
        setPhase('idle')
        setProcessingAgents(INTAKE_AGENTS.map(a => ({ ...a, visible: false, done: false })))
        const timers: ReturnType<typeof setTimeout>[] = []

        if (isProjectIntake) {
            // Continua: notification → click/auto → processing → revealed → detail
            timers.push(setTimeout(() => setPhase('notification'), 1500))
            // Auto-advance from notification after 4s if user doesn't click
            timers.push(setTimeout(() => {
                if (phaseRef.current === 'notification') setPhase('processing')
            }, 5500))
        } else {
            // COI step 1.12: notification → revealed → detail (no processing)
            timers.push(setTimeout(() => setPhase('notification'), 2000))
            timers.push(setTimeout(() => setPhase('revealed'), 5000))
            timers.push(setTimeout(() => setPhase('detail'), 7000))
        }
        return () => timers.forEach(clearTimeout)
    }, [isNewProject, skipNotification, isProjectIntake])

    // Processing phase: animate agents sequentially + progress bar
    useEffect(() => {
        if (phase !== 'processing' || !isProjectIntake) return
        setProcessingAgents(INTAKE_AGENTS.map(a => ({ ...a, visible: false, done: false })))
        setProgressWidth(0)
        const timers: ReturnType<typeof setTimeout>[] = []
        // Start progress bar after a brief delay
        timers.push(setTimeout(() => setProgressWidth(100), 50))
        INTAKE_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(() => {
                setProcessingAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))
            }, i * 600))
            timers.push(setTimeout(() => {
                setProcessingAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))
            }, i * 600 + 450))
        })
        // After all agents done → revealed
        const totalTime = INTAKE_AGENTS.length * 600 + 800
        timers.push(setTimeout(() => setPhase('revealed'), totalTime))
        return () => timers.forEach(clearTimeout)
    }, [phase, isProjectIntake])

    // Simulated hover + click on Apex row before expanding (Continua)
    const [rowHovered, setRowHovered] = useState(false)
    const [rowClicked, setRowClicked] = useState(false)

    // Transition revealed → detail with simulated hover+click (Continua)
    useEffect(() => {
        if (phase !== 'revealed' || !isProjectIntake) return
        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(() => setRowHovered(true), 800))
        timers.push(setTimeout(() => setRowClicked(true), 1500))
        timers.push(setTimeout(() => { setRowClicked(false); setRowHovered(false); setPhase('detail') }, 1900))
        return () => timers.forEach(clearTimeout)
    }, [phase, isProjectIntake])

    // Allow clicking notification to skip to processing (Continua) or detail (COI)
    const handleNotificationClick = useCallback(() => {
        if (phase === 'notification') setPhase(isProjectIntake ? 'processing' : 'detail')
    }, [phase, isProjectIntake])

    const showApexRow = !isNewProject || phase === 'revealed' || phase === 'detail'
    const showDetailCard = !isNewProject || phase === 'detail'
    const projectCount = showApexRow ? MOCK_PROJECTS.length : MOCK_PROJECTS.length - 1
    const detailRef = useRef<HTMLDivElement>(null)
    const [rowExpanded, setRowExpanded] = useState(true)

    // Auto-scroll to detail card when it appears
    useEffect(() => {
        if (showDetailCard && isNewProject && detailRef.current) {
            setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 200)
        }
    }, [showDetailCard, isNewProject])

    return (
        <div className="space-y-4">
            {/* Notification Toast — slides in, clickable */}
            {isNewProject && (phase === 'notification') && (
                <button
                    onClick={handleNotificationClick}
                    className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500"
                >
                    <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                        <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
                                <BellAlertIcon className="h-5 w-5 text-zinc-900" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-foreground">
                                        {isProjectIntake ? 'Incoming RFP Detected' : 'New Project Auto-Created'}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">Just now</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    {isProjectIntake ? (
                                        <>
                                            <strong className="text-foreground">IntakeAgent</strong> received RFP from corporate client — <strong className="text-foreground">new HQ, 8 floors</strong>. 1,200 workstations, 40 conference rooms, AV integration. Click to process.
                                        </>
                                    ) : (
                                        <>
                                            <strong className="text-foreground">ProjectCreationAgent</strong> created project from Quote #QT-1025 — <strong className="text-foreground">Apex Furniture</strong>, $43,750, 200 line items.
                                        </>
                                    )}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-[10px] text-brand-700 dark:text-brand-400 font-medium">
                                    <span>{isProjectIntake ? 'Click to start AI processing' : 'Click to view project'}</span>
                                    <ArrowRightIcon className="h-3 w-3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </button>
            )}

            {/* AI Processing Phase — Continua intake pipeline */}
            {isProjectIntake && phase === 'processing' && (
                <div className="bg-card border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-4 animate-in fade-in duration-300">
                    <div className="flex items-start gap-3">
                        <AIAgentAvatar size="sm" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-xs">
                                <span className="font-semibold text-foreground">IntakeAgent</span>
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Processing RFP...</span>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-2.5 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all duration-[3000ms] ease-out" style={{ width: `${progressWidth}%` }} />
                            </div>
                            {/* Agent pipeline */}
                            <div className="mt-3 space-y-1.5">
                                {processingAgents.map((agent) => (
                                    <div key={agent.name} className={cn(
                                        "flex items-center gap-2 text-[10px] transition-all duration-300",
                                        agent.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                                    )}>
                                        {agent.done ? (
                                            <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                        ) : (
                                            <ArrowPathIcon className="h-3.5 w-3.5 text-indigo-500 animate-spin shrink-0" />
                                        )}
                                        <span className={cn("font-medium", agent.done ? "text-foreground" : "text-indigo-600 dark:text-indigo-400")}>{agent.name}</span>
                                        <span className="text-muted-foreground">{agent.detail}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Agent Confirmation — after reveal */}
            {isNewProject && (phase === 'revealed' || phase === 'detail') && (
                <div className={cn(
                    "rounded-xl p-4 animate-in fade-in duration-300",
                    isProjectIntake
                        ? "bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30"
                        : "bg-card border border-green-200 dark:border-green-800/30"
                )}>
                    <div className="flex items-start gap-3">
                        <AIAgentAvatar size="sm" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-xs">
                                <span className="font-semibold text-foreground">{isProjectIntake ? 'IntakeAgent' : 'ProjectCreationAgent'}:</span>
                                <span className="text-[11px] text-foreground">
                                    {isProjectIntake
                                        ? 'RFP processing complete — project created with full scope, manufacturers matched, estimate calculated. Zero manual entry.'
                                        : 'Project created from Quote #QT-1025 — Apex Furniture, $43,750, zero manual CRM entry.'
                                    }
                                </span>
                            </div>
                            {isProjectIntake && (
                                <>
                                    <div className="flex items-center gap-2 mt-2.5">
                                        <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">External Systems · Synced</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                        {[
                                            { icon: <FileText className="h-3 w-3" />, label: 'RFP Document Parser' },
                                            { icon: <Package className="h-3 w-3" />, label: 'Herman Miller (API)' },
                                            { icon: <Package className="h-3 w-3" />, label: 'Knoll Catalog' },
                                            { icon: <Package className="h-3 w-3" />, label: 'DIRTT Configurator' },
                                            { icon: <CurrencyDollarIcon className="h-3 w-3" />, label: 'Estimation Engine' },
                                            { icon: <UserGroupIcon className="h-3 w-3" />, label: 'Team Capacity DB' },
                                        ].map(sys => (
                                            <span key={sys.label} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-300 text-[10px] font-medium border border-green-200/50 dark:border-green-500/20">
                                                {sys.icon}
                                                {sys.label}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                            {!isProjectIntake && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Apex Furniture · Quote #QT-1025 · PO #ORD-2055 · $43,750 — zero manual CRM entry
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Projects Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <h3 className="text-xs font-medium text-foreground">Active & Recent Projects</h3>
                    <span className="text-[10px] text-muted-foreground">{projectCount} projects</span>
                </div>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="text-left px-4 py-2 text-[10px] font-medium text-muted-foreground">Project</th>
                            <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Customer</th>
                            <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Quote / PO</th>
                            <th className="text-right px-3 py-2 text-[10px] font-medium text-muted-foreground">Value</th>
                            <th className="text-center px-3 py-2 text-[10px] font-medium text-muted-foreground">Stage</th>
                            <th className="text-center px-3 py-2 text-[10px] font-medium text-muted-foreground">Status</th>
                            <th className="text-right px-4 py-2 text-[10px] font-medium text-muted-foreground">Delivery</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_PROJECTS.map(project => {
                            const isApex = project.id === 'PRJ-001'
                            if (isApex && isNewProject && !showApexRow) return null
                            const isApexExpanded = isApex && isNewProject && isProjectIntake && showDetailCard && rowExpanded
                            return (
                                <Fragment key={project.id}>
                                    <tr
                                        className={cn(
                                            'border-b border-border last:border-0 transition-all',
                                            isApex && isNewProject
                                                ? cn(
                                                    'bg-brand-50/50 dark:bg-brand-500/5 animate-in fade-in slide-in-from-top-2 duration-500',
                                                    !isApexExpanded && 'ring-2 ring-inset ring-brand-400/30',
                                                    rowHovered && 'bg-brand-100 dark:bg-brand-500/10 cursor-pointer shadow-sm',
                                                    rowClicked && 'bg-brand-200/60 dark:bg-brand-500/15 scale-[0.998] shadow-inner'
                                                )
                                                : 'bg-card hover:bg-muted/20',
                                            isApexExpanded && 'border-b-0 bg-brand-50/80 dark:bg-brand-500/8'
                                        )}
                                        onClick={isApex && isNewProject && isProjectIntake && showDetailCard ? () => setRowExpanded(prev => !prev) : undefined}
                                        style={isApex && isNewProject && isProjectIntake && showDetailCard ? { cursor: 'pointer' } : undefined}
                                    >
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                                {isApex && isNewProject && (
                                                    <span className="px-1.5 py-0.5 rounded bg-brand-500 text-zinc-900 text-[8px] font-bold uppercase shrink-0">New</span>
                                                )}
                                                <div>
                                                    <p className="font-medium text-foreground text-[11px]">{project.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{project.id} · {project.items} items · {project.zones} zones</p>
                                                </div>
                                                {isApex && isNewProject && isProjectIntake && showDetailCard && (
                                                    rowExpanded
                                                        ? <ChevronUpIcon className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                                                        : <ChevronDownIcon className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-[11px] text-foreground">{project.customer}</td>
                                        <td className="px-3 py-2.5">
                                            <p className="text-[11px] text-foreground">{project.quote}</p>
                                            <p className="text-[10px] text-muted-foreground">{project.po}</p>
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                            <span className="text-[11px] font-medium text-foreground tabular-nums">${project.value.toLocaleString()}</span>
                                        </td>
                                        <td className="px-3 py-2.5 text-center">
                                            <StageBadge stage={project.stage} />
                                        </td>
                                        <td className="px-3 py-2.5 text-center">
                                            <ProjectStatusBadge status={project.status} />
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            {project.stage === 'Complete' ? (
                                                <span className="text-[10px] text-green-600 font-medium">100%</span>
                                            ) : project.deliveryRate > 0 ? (
                                                <span className="text-[10px] text-foreground tabular-nums">{project.deliveryRate}%</span>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground">—</span>
                                            )}
                                        </td>
                                    </tr>
                                    {/* Inline expandable detail — Continua intake */}
                                    {isApexExpanded && (
                                        <tr>
                                            <td colSpan={7} className="p-0 border-b border-brand-400/30 bg-card">
                                                <div ref={detailRef} className="animate-in fade-in slide-in-from-top-2 duration-400">
                                                    <ProjectDetailCard isNewProject={isNewProject} isProjectIntake={isProjectIntake} inline />
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Project Detail Card — separate card for COI (non-intake) */}
            {showDetailCard && !isProjectIntake && (
                <div ref={detailRef}>
                    <ProjectDetailCard isNewProject={isNewProject} />
                </div>
            )}
        </div>
    )
}

// ═══════════════════════════════════════════════════
// CUSTOMER 360 VIEW (Step 1.13)
// ═══════════════════════════════════════════════════

function Customer360View({ stepId }: { stepId: string }) {
    const c = CUSTOMER_PROFILE

    return (
        <div className="space-y-4">
            {/* AI Agent Banner */}
            {stepId === '1.13' && (
                <div className="bg-card border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                    <AIAgentAvatar size="sm" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-foreground">CustomerIntelligenceAgent</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Updated</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Cross-system data aggregated: Dealer Experience + Expert Hub + Email/RFQ + Service Center. Profile completeness: <strong className="text-foreground">96%</strong>.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                {/* Customer Info */}
                <div className="col-span-2 bg-card border border-border rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">AF</div>
                        <div>
                            <h3 className="text-sm font-medium text-foreground">{c.name}</h3>
                            <p className="text-xs text-muted-foreground">{c.contact} · {c.title}</p>
                            <p className="text-[10px] text-muted-foreground">{c.email} · {c.phone}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1.5">
                            {c.tags.map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-muted-foreground font-medium">{tag}</span>
                            ))}
                        </div>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: 'Lifetime Value', value: `$${(c.lifetimeValue / 1000000).toFixed(1)}M`, icon: <ArrowTrendingUpIcon className="h-3.5 w-3.5" /> },
                            { label: 'Total Projects', value: c.totalProjects.toString(), icon: <DocumentTextIcon className="h-3.5 w-3.5" /> },
                            { label: 'Active Projects', value: c.activeProjects.toString(), icon: <BuildingOfficeIcon className="h-3.5 w-3.5" /> },
                            { label: 'Avg Project Size', value: `$${(c.avgProjectSize / 1000).toFixed(0)}K`, icon: <ChartBarSquareIcon className="h-3.5 w-3.5" /> },
                        ].map(m => (
                            <div key={m.label} className="p-2.5 rounded-lg bg-muted/30 border border-border">
                                <div className="flex items-center gap-1 text-muted-foreground mb-1">{m.icon}<span className="text-[10px]">{m.label}</span></div>
                                <p className="text-sm font-bold text-foreground">{m.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Recent Orders */}
                    <div>
                        <h4 className="text-[11px] font-medium text-foreground mb-2">Recent Orders</h4>
                        <div className="space-y-1.5">
                            {c.recentOrders.map(order => (
                                <div key={order.po} className={cn(
                                    'flex items-center justify-between px-3 py-2 rounded-lg border border-border',
                                    order.po === 'ORD-2055' ? 'bg-primary/5 dark:bg-primary/10 border-primary/20' : 'bg-card'
                                )}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-medium text-foreground">{order.po}</span>
                                        {order.po === 'ORD-2055' && <span className="text-[9px] px-1 py-0.5 rounded bg-primary/10 text-foreground">New</span>}
                                    </div>
                                    <span className="text-[11px] text-foreground tabular-nums">${order.value.toLocaleString()}</span>
                                    <span className="text-[10px] text-muted-foreground">{order.date}</span>
                                    <ProjectStatusBadge status={order.status as Project['status']} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cross-System Data Sources */}
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-xl p-4">
                        <h4 className="text-[11px] font-medium text-foreground mb-3">Cross-System Data Sources</h4>
                        <div className="space-y-2">
                            {c.systems.map(sys => (
                                <div key={sys.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border">
                                    <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-medium text-foreground">{sys.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{sys.records} records synced</p>
                                    </div>
                                    <ArrowPathIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border">
                            All data aggregated automatically — zero duplicate entry across platforms
                        </p>
                    </div>

                    {/* Data Sources Pie */}
                    <div className="bg-card border border-border rounded-xl p-4">
                        <h4 className="text-[11px] font-medium text-foreground mb-2">Records by Source</h4>
                        <div className="h-[140px] flex items-center">
                            <div className="w-1/2 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={systemSyncData} dataKey="value" cx="50%" cy="50%" outerRadius={50} innerRadius={28}>
                                            {systemSyncData.map((entry, idx) => (
                                                <Cell key={idx} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-1/2 space-y-1.5">
                                {systemSyncData.map(s => (
                                    <div key={s.name} className="flex items-center gap-2 text-[10px]">
                                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                                        <span className="text-muted-foreground">{s.name}</span>
                                        <span className="ml-auto font-medium text-foreground">{s.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════
// ORDER TIMELINE VIEW (Step 2.8)
// ═══════════════════════════════════════════════════

function OrderTimelineView({ stepId }: { stepId: string }) {
    type SyncPhase = 'hidden' | 'syncing' | 'synced';
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [syncPhases, setSyncPhases] = useState<[SyncPhase, SyncPhase]>(['hidden', 'hidden']);
    const [visibleOthers, setVisibleOthers] = useState<boolean[]>([]);
    const isStep28 = stepId === '2.8';

    // Build display order: newly synced items first when step 2.8
    const displayTimeline = isStep28
        ? [...PROJECT_TIMELINE.filter(e => e.newlySynced), ...PROJECT_TIMELINE.filter(e => !e.newlySynced)]
        : PROJECT_TIMELINE;

    // 3-phase sync animation: hidden → syncing (amber/spinner) → synced (sky-blue)
    useEffect(() => {
        if (!isStep28) {
            setSyncPhases(['hidden', 'hidden']);
            setVisibleOthers([]);
            return;
        }
        const otherCount = displayTimeline.filter(e => !e.newlySynced).length;
        setSyncPhases(['hidden', 'hidden']);
        setVisibleOthers(new Array(otherCount).fill(false));
        const t: ReturnType<typeof setTimeout>[] = [];
        // AIS: syncing at 300ms, synced at 1800ms
        t.push(setTimeout(() => setSyncPhases(p => ['syncing', p[1]]), 300));
        t.push(setTimeout(() => setSyncPhases(p => ['synced', p[1]]), 1800));
        // HAT: syncing at 800ms, synced at 2300ms
        t.push(setTimeout(() => setSyncPhases(p => [p[0], 'syncing']), 800));
        t.push(setTimeout(() => setSyncPhases(p => [p[0], 'synced']), 2300));
        // Other items cascade from 2600ms
        for (let i = 0; i < otherCount; i++) {
            const idx = i;
            t.push(setTimeout(() => setVisibleOthers(prev => prev.map((v, j) => j === idx ? true : v)), 2600 + idx * 100));
        }
        return () => t.forEach(clearTimeout);
    }, [isStep28]);

    // Pre-compute per-item animation state
    let nsCount = 0;
    let otCount = 0;
    const itemStates = displayTimeline.map((event) => {
        if (event.newlySynced && isStep28) {
            const phase = syncPhases[nsCount < 2 ? nsCount : 1];
            nsCount++;
            return { isNew: true as const, phase };
        } else {
            const visible = !isStep28 || (visibleOthers[otCount] ?? false);
            otCount++;
            return { isNew: false as const, visible };
        }
    });

    const timelineIcons: Record<string, React.ReactNode> = {
        email: <Mail size={14} className="text-blue-500" />,
        ai: <Bot size={14} className="text-ai" />,
        quote: <FileText size={14} className="text-amber-500" />,
        po: <Package size={14} className="text-green-500" />,
        ack: <Truck size={14} className="text-sky-500" />,
        service: <Wrench size={14} className="text-red-500" />,
    }

    return (
        <div className="space-y-4">
            {/* AI Agent Banner */}
            {stepId === '2.8' && (
                <div className="bg-card border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                    <AIAgentAvatar size="sm" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-foreground">OrderSyncAgent</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Synced</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            AIS acknowledgment (50 lines, $65K) — 3 exceptions resolved, dates +14d. HAT (5 lines, $8K) — confirmed. Project timeline auto-updated.
                        </p>
                    </div>
                </div>
            )}

            {/* Project Header */}
            <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <BuildingOfficeIcon className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="text-xs font-medium text-foreground">Apex HQ Office Renovation</h3>
                            <p className="text-[10px] text-muted-foreground">PRJ-001 · Apex Furniture · $43,750</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StageBadge stage="Procurement" />
                        <ProjectStatusBadge status="Active" />
                    </div>
                </div>

                {/* Delivery Milestones */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { supplier: 'AIS (American Industrial)', lines: 50, value: '$65,000', status: 'Partial', detail: '3 exceptions resolved, +14d adj.', color: 'amber' as const },
                        { supplier: 'HAT (Haworth)', lines: 5, value: '$8,000', status: 'Confirmed', detail: 'On schedule, no discrepancies', color: 'green' as const },
                        { supplier: 'Other Suppliers', lines: 145, value: '$TBD', status: 'Pending', detail: 'Awaiting acknowledgements', color: 'zinc' as const },
                    ].map(s => (
                        <div key={s.supplier} className={cn(
                            'p-3 rounded-lg border',
                            s.color === 'green' && 'border-green-200 bg-green-50/30 dark:border-green-800/30 dark:bg-green-900/10',
                            s.color === 'amber' && 'border-amber-200 bg-amber-50/30 dark:border-amber-800/30 dark:bg-amber-900/10',
                            s.color === 'zinc' && 'border-border bg-card',
                        )}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-medium text-foreground">{s.supplier}</span>
                                <span className={cn(
                                    'text-[9px] px-1.5 py-0.5 rounded font-medium',
                                    s.color === 'green' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                                    s.color === 'amber' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                                    s.color === 'zinc' && 'bg-muted text-muted-foreground',
                                )}>{s.status}</span>
                            </div>
                            <p className="text-[11px] text-foreground">{s.lines} lines · {s.value}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{s.detail}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Full Timeline */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <h3 className="text-xs font-medium text-foreground">Complete Order Lifecycle</h3>
                    <p className="text-[10px] text-muted-foreground">Every event auto-recorded from source system — zero manual entry</p>
                </div>
                <div className="divide-y divide-border">
                    {displayTimeline.map((event, idx) => {
                        const meta = itemStates[idx];
                        const isNS = meta.isNew;
                        const phase: SyncPhase = isNS ? meta.phase : 'synced';
                        const isVisible = isNS ? meta.phase !== 'hidden' : meta.visible;
                        const isExpanded = expandedIdx === idx;
                        return (
                        <div
                            key={event.step + event.event}
                            className={cn('transition-opacity duration-500', isVisible ? 'opacity-100' : 'opacity-0')}
                        >
                            <div
                                onClick={() => isNS && phase === 'synced' && event.expandedDetail ? setExpandedIdx(isExpanded ? null : idx) : undefined}
                                className={cn(
                                    'flex items-start gap-3 px-4 py-3 transition-colors duration-700',
                                    isNS && phase === 'synced' && event.expandedDetail && 'cursor-pointer',
                                    isNS && phase === 'syncing' && 'bg-amber-50/60 dark:bg-amber-500/10',
                                    isNS && phase === 'synced' && isExpanded && 'bg-sky-50/60 dark:bg-sky-500/10',
                                    isNS && phase === 'synced' && !isExpanded && 'bg-sky-50/40 dark:bg-sky-500/5 hover:bg-sky-50/70 dark:hover:bg-sky-500/10',
                                    !isNS && event.status === 'active' && 'bg-amber-50/30 dark:bg-amber-900/10',
                                    !isNS && event.status !== 'active' && 'bg-card hover:bg-muted dark:hover:bg-zinc-700/60',
                                )}
                            >
                                <div className="relative">
                                    <div className={cn(
                                        'h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-700',
                                        isNS && phase === 'syncing' && 'ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-zinc-800 bg-amber-100 dark:bg-amber-900/30',
                                        isNS && phase === 'synced' && 'ring-2 ring-sky-400 dark:ring-sky-500 ring-offset-1 dark:ring-offset-zinc-800 bg-green-100 dark:bg-green-900/30',
                                        !isNS && event.status === 'complete' && 'bg-green-100 dark:bg-green-900/30',
                                        !isNS && event.status === 'active' && 'bg-amber-100 dark:bg-amber-900/30',
                                        !isNS && event.status === 'pending' && 'bg-muted',
                                    )}>
                                        {isNS && phase === 'syncing'
                                            ? <ArrowPathIcon className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                                            : timelineIcons[event.icon]
                                        }
                                    </div>
                                    {idx < displayTimeline.length - 1 && (
                                        <div className="absolute top-7 left-1/2 -translate-x-1/2 w-px h-[calc(100%+4px)] bg-border" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pb-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={cn('text-[11px] font-medium transition-colors duration-700',
                                            isNS && phase === 'syncing' ? 'text-amber-700 dark:text-amber-300' :
                                            isNS && phase === 'synced' ? 'text-sky-700 dark:text-sky-300' :
                                            'text-foreground'
                                        )}>{event.event}</span>
                                        {isNS && phase === 'syncing' && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1">
                                                <ArrowPathIcon className="w-2.5 h-2.5 animate-spin" /> Syncing...
                                            </span>
                                        )}
                                        {isNS && phase === 'synced' && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold flex items-center gap-1 animate-in fade-in duration-500">
                                                <SparklesIcon className="w-2.5 h-2.5" /> Just synced
                                            </span>
                                        )}
                                        {!isNS && event.status === 'active' && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-medium">Active</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {isNS && phase === 'syncing' ? 'OrderSyncAgent processing...' : event.detail}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="text-right">
                                        <span className="text-[10px] text-muted-foreground">Step {event.step}</span>
                                        <p className="text-[10px] text-muted-foreground">{event.system}</p>
                                    </div>
                                    {isNS && phase === 'synced' && event.expandedDetail && (
                                        <span className={cn('text-muted-foreground transition-transform duration-200', isExpanded && 'rotate-180')}>
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Expanded detail panel — only in synced phase */}
                            {isExpanded && isNS && phase === 'synced' && event.expandedDetail && (
                                <div className="px-4 pb-3 bg-sky-50/60 dark:bg-sky-500/10 border-t border-sky-100 dark:border-sky-500/20 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="ml-10 grid grid-cols-2 gap-x-6 gap-y-1.5 pt-2">
                                        {event.expandedDetail.map((d, di) => (
                                            <div key={di} className="flex flex-col">
                                                <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{d.label}</span>
                                                <span className="text-[11px] text-foreground font-medium">{d.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════
// REPORTS VIEW (Step 3.6)
// ═══════════════════════════════════════════════════

function ReportsView({ stepId }: { stepId: string }) {
    const [reportTab, setReportTab] = useState<'health' | 'backlog' | 'bookings'>('health');
    return (
        <div className="space-y-4">
            {/* AI Agent Banner */}
            {stepId === '3.6' && (
                <div className="bg-card border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                    <AIAgentAvatar size="sm" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-foreground">ServiceRecordAgent</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Logged</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Warranty claim linked to project. Full lifecycle: email (1.1) → AI extraction (1.2) → quote (1.7) → PO (1.9) → ack (2.4) → service (3.4). <strong className="text-foreground">Zero data re-entered.</strong>
                        </p>
                    </div>
                </div>
            )}

            {/* Report Sub-tabs */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border w-fit">
                {([
                    { id: 'health' as const, label: 'Project Health' },
                    { id: 'backlog' as const, label: 'Backlog' },
                    { id: 'bookings' as const, label: 'Bookings' },
                ]).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setReportTab(tab.id)}
                        className={cn(
                            'px-3 py-1.5 text-[11px] font-medium rounded-md transition-all',
                            reportTab === tab.id
                                ? 'bg-card text-foreground shadow-sm border border-border'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* === Backlog Tab === */}
            {reportTab === 'backlog' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="bg-card border border-border rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xs font-medium text-foreground">Pending Orders by Supplier</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                                    Rule-Based · Deterministic
                                </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">Week of Mar 10, 2025</span>
                        </div>
                        <table className="w-full text-[11px]">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 font-medium text-muted-foreground">Supplier</th>
                                    <th className="text-center py-2 font-medium text-muted-foreground">0–30d</th>
                                    <th className="text-center py-2 font-medium text-muted-foreground">30–60d</th>
                                    <th className="text-center py-2 font-medium text-amber-600 dark:text-amber-400">60+d</th>
                                    <th className="text-right py-2 font-medium text-muted-foreground">Total $</th>
                                    <th className="text-center py-2 font-medium text-muted-foreground">Risk</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { supplier: 'AIS Office', d30: 12, d60: 3, d90: 0, total: '$18,400', risk: 'low' },
                                    { supplier: 'Herman Miller', d30: 8, d60: 5, d90: 2, total: '$31,200', risk: 'medium' },
                                    { supplier: 'Haworth', d30: 6, d60: 1, d90: 0, total: '$12,750', risk: 'low' },
                                    { supplier: 'Knoll', d30: 4, d60: 2, d90: 3, total: '$22,100', risk: 'high' },
                                    { supplier: 'Steelcase', d30: 15, d60: 0, d90: 0, total: '$28,600', risk: 'low' },
                                ].map(row => (
                                    <tr key={row.supplier} className="border-b border-border/50 bg-card">
                                        <td className="py-2 font-medium text-foreground">{row.supplier}</td>
                                        <td className="py-2 text-center text-muted-foreground">{row.d30}</td>
                                        <td className="py-2 text-center text-muted-foreground">{row.d60}</td>
                                        <td className={cn("py-2 text-center font-medium", row.d90 > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>{row.d90}</td>
                                        <td className="py-2 text-right font-medium text-foreground">{row.total}</td>
                                        <td className="py-2 text-center">
                                            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                                                row.risk === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                row.risk === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                                                'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            )}>{row.risk}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>Total backlog: <strong className="text-foreground">$113,050</strong> across 5 suppliers</span>
                            <span>5 orders aging 60+ days — action recommended</span>
                        </div>
                    </div>
                </div>
            )}

            {/* === Bookings Tab === */}
            {reportTab === 'bookings' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="bg-card border border-border rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xs font-medium text-foreground">Weekly Bookings vs. Target</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                                    Rule-Based · Deterministic
                                </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">Q1 2025</span>
                        </div>
                        <table className="w-full text-[11px]">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 font-medium text-muted-foreground">Week</th>
                                    <th className="text-right py-2 font-medium text-muted-foreground">Booked</th>
                                    <th className="text-right py-2 font-medium text-muted-foreground">Target</th>
                                    <th className="text-right py-2 font-medium text-muted-foreground">Variance</th>
                                    <th className="text-center py-2 font-medium text-muted-foreground">Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { week: 'Jan 6–10', booked: '$42,300', target: '$40,000', variance: '+$2,300', trend: '↑', positive: true },
                                    { week: 'Jan 13–17', booked: '$38,100', target: '$40,000', variance: '-$1,900', trend: '↓', positive: false },
                                    { week: 'Jan 20–24', booked: '$45,600', target: '$40,000', variance: '+$5,600', trend: '↑', positive: true },
                                    { week: 'Feb 3–7', booked: '$41,200', target: '$42,000', variance: '-$800', trend: '→', positive: false },
                                    { week: 'Feb 10–14', booked: '$48,900', target: '$42,000', variance: '+$6,900', trend: '↑', positive: true },
                                    { week: 'Mar 3–7', booked: '$43,750', target: '$42,000', variance: '+$1,750', trend: '↑', positive: true },
                                ].map(row => (
                                    <tr key={row.week} className="border-b border-border/50 bg-card">
                                        <td className="py-2 font-medium text-foreground">{row.week}</td>
                                        <td className="py-2 text-right text-foreground">{row.booked}</td>
                                        <td className="py-2 text-right text-muted-foreground">{row.target}</td>
                                        <td className={cn("py-2 text-right font-medium", row.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>{row.variance}</td>
                                        <td className="py-2 text-center">{row.trend}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-3">
                            {[
                                { label: 'YTD Bookings', value: '$259,850', sub: 'vs. $246,000 target' },
                                { label: 'Win Rate', value: '68%', sub: '+4% from last quarter' },
                                { label: 'Avg. Deal Size', value: '$38,200', sub: '↑ 12% QoQ' },
                            ].map(s => (
                                <div key={s.label} className="text-center p-2 rounded-lg bg-muted/30 border border-border">
                                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                                    <p className="text-sm font-bold text-foreground mt-0.5">{s.value}</p>
                                    <p className="text-[9px] text-muted-foreground">{s.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* === Project Health Tab (default) === */}
            {reportTab === 'health' && <>
            {/* Project Health Card */}
            <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <ChartBarSquareIcon className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="text-xs font-medium text-foreground">Project Health Report</h3>
                            <p className="text-[10px] text-muted-foreground">Apex HQ Office Renovation · PRJ-001</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-1 rounded bg-primary/10 text-foreground font-medium">AI Generated</span>
                        <span className="text-[10px] px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                            Rule-Based · Deterministic
                        </span>
                    </div>
                </div>

                {/* Scheduling + Excel Replacement */}
                <div className="mb-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Auto-generated every <strong className="text-foreground">Monday 7:00 AM</strong> · Recipients: Annie, Martin, Leadership (4)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                        <span>Previously: <span className="line-through opacity-60">4hrs/week manual Excel</span> → Now: Auto-generated from 5 synced systems</span>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                        { label: 'Project Value', value: '$43,750', sub: 'Quote #QT-1025', color: '' },
                        { label: 'Delivery Rate', value: '98%', sub: 'On track', color: 'text-green-600' },
                        { label: 'Open Claims', value: '1', sub: 'SKU mismatch (3.4)', color: 'text-amber-600' },
                        { label: 'Systems Synced', value: '5', sub: 'Zero re-entry', color: 'text-green-600' },
                    ].map(m => (
                        <div key={m.label} className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                            <p className="text-[10px] text-muted-foreground">{m.label}</p>
                            <p className={cn('text-lg font-bold text-foreground mt-0.5', m.color)}>{m.value}</p>
                            <p className="text-[10px] text-muted-foreground">{m.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Full Traceability */}
                <div className="border border-border rounded-lg p-3">
                    <h4 className="text-[11px] font-medium text-foreground mb-2">End-to-End Traceability</h4>
                    <div className="flex items-center gap-1 flex-wrap">
                        {[
                            { label: 'Email RFQ', step: '1.1', icon: '📧' },
                            { label: 'AI Extract', step: '1.2', icon: '🤖' },
                            { label: 'Normalize', step: '1.3', icon: '📊' },
                            { label: 'Quote', step: '1.7', icon: '📋' },
                            { label: 'PO', step: '1.9', icon: '📦' },
                            { label: 'Ack (AIS)', step: '2.4', icon: '✅' },
                            { label: 'Ack (HAT)', step: '2.6', icon: '✅' },
                            { label: 'Service', step: '3.4', icon: '🔧' },
                            { label: 'CRM', step: '3.6', icon: '💼' },
                        ].map((item, i) => (
                            <div key={item.step} className="flex items-center gap-1">
                                <div className={cn(
                                    'px-2 py-1 rounded text-[10px] border',
                                    item.step === '3.6' ? 'border-primary/30 bg-primary/10 font-medium text-foreground' : 'border-border bg-card text-muted-foreground'
                                )}>
                                    <span className="mr-1">{item.icon}</span>{item.label}
                                    <span className="ml-1 text-[9px] opacity-60">{item.step}</span>
                                </div>
                                {i < 8 && <span className="text-muted-foreground text-[10px]">→</span>}
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">Every data point traced from source to CRM — complete audit trail across 5 systems.</p>
                </div>
            </div>

            {/* AI Impact KPIs — Spec Errors + Manual Entries */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <svg className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                        </div>
                        <h4 className="text-xs font-medium text-foreground">Spec Errors Caught by AI</h4>
                    </div>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">7</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Review time saved: <strong className="text-foreground">3.2 hours</strong></p>
                    <div className="mt-2 space-y-1">
                        {[
                            { label: 'Configuration errors', count: 3 },
                            { label: 'Sizing conflicts', count: 2 },
                            { label: 'Discontinued product', count: 1 },
                            { label: 'Structural limit', count: 1 },
                        ].map(e => (
                            <div key={e.label} className="flex items-center justify-between text-[10px]">
                                <span className="text-muted-foreground">{e.label}</span>
                                <span className="font-medium text-foreground">{e.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-card border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-7 w-7 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <svg className="h-3.5 w-3.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h4 className="text-xs font-medium text-foreground">Manual Entries Eliminated</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">847</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Time saved: <strong className="text-foreground">12.4 hours</strong></p>
                    <div className="mt-2 space-y-1">
                        {[
                            { label: 'Quote → 5 systems', from: '1,000', to: '200' },
                            { label: 'Ack → CRM sync', from: '150', to: '0' },
                            { label: 'Invoice → QuickBooks', from: '47', to: '0' },
                        ].map(e => (
                            <div key={e.label} className="flex items-center justify-between text-[10px]">
                                <span className="text-muted-foreground">{e.label}</span>
                                <span className="font-medium text-foreground"><span className="line-through opacity-50">{e.from}</span> → {e.to}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-4">
                {/* Portfolio by Stage */}
                <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="text-xs font-medium text-foreground mb-3">Portfolio Value by Stage</h3>
                    <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={projectValueByStage}>
                                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}K`} />
                                <Tooltip
                                    formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`, 'Value']}
                                    contentStyle={{ fontSize: 11, borderRadius: 8, backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#f4f4f5' }}
                                    labelStyle={{ color: '#a1a1aa', marginBottom: 2 }}
                                    itemStyle={{ color: '#E6F993' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="value" fill="#E6F993" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Cross-Platform Sync Status */}
                <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="text-xs font-medium text-foreground mb-3">Cross-Platform Sync Status</h3>
                    <div className="space-y-2.5">
                        {[
                            { app: 'Dealer Experience', records: 12, status: 'Synced', icon: '🏪' },
                            { app: 'Expert Hub', records: 8, status: 'Synced', icon: '🧠' },
                            { app: 'Email / RFQ Pipeline', records: 15, status: 'Synced', icon: '📧' },
                            { app: 'Service Center (MAC)', records: 3, status: 'Synced', icon: '🔧' },
                            { app: 'Strata CRM', records: 38, status: 'Source', icon: '💼' },
                        ].map(app => (
                            <div key={app.app} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border">
                                <span className="text-sm">{app.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-medium text-foreground">{app.app}</p>
                                </div>
                                <span className="text-[10px] text-muted-foreground tabular-nums">{app.records} records</span>
                                <span className={cn(
                                    'text-[9px] px-1.5 py-0.5 rounded font-medium',
                                    app.status === 'Source'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                )}>{app.status}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border">
                        Zero duplicate data entry — all platforms share unified data source.
                    </p>
                </div>
            </div>

            {/* Report Consistency Guarantee */}
            <details className="bg-card border border-border rounded-xl overflow-hidden group">
                <summary className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors list-none">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                        <span className="text-xs font-medium text-foreground">Report Consistency Guarantee</span>
                    </div>
                    <svg className="w-3.5 h-3.5 text-muted-foreground transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </summary>
                <div className="px-4 pb-4 pt-1 border-t border-border space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Report Version', value: 'v2.4' },
                            { label: 'Business Rules Applied', value: '6' },
                        ].map(item => (
                            <div key={item.label} className="p-2 rounded-lg bg-muted/30 border border-border">
                                <p className="text-[9px] text-muted-foreground">{item.label}</p>
                                <p className="text-xs font-bold text-foreground">{item.value}</p>
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-foreground mb-1.5">Thresholds Enforced</p>
                        <div className="space-y-1">
                            {[
                                'Margin > 30%',
                                'Lead time < 8 weeks',
                                'Confidence > 85%',
                            ].map(t => (
                                <div key={t} className="flex items-center gap-2 text-[10px]">
                                    <svg className="w-3 h-3 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                    <span className="text-muted-foreground">{t}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                        <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-[10px] text-green-700 dark:text-green-400 font-medium">Last 52 weekly runs: <strong>100% identical format</strong> — no LLM variation</p>
                    </div>
                </div>
            </details>
            </>}
        </div>
    )
}

// ═══════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════

function StageBadge({ stage }: { stage: Project['stage'] }) {
    const styles: Record<string, string> = {
        Planning: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        Procurement: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        Delivery: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
        Installation: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        Complete: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    }
    return <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', styles[stage])}>{stage}</span>
}

function ProjectStatusBadge({ status }: { status: Project['status'] }) {
    const styles: Record<string, string> = {
        Active: 'bg-primary/10 text-foreground',
        'On Track': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        'At Risk': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        Complete: 'bg-zinc-100 text-muted-foreground dark:bg-zinc-800 dark:text-muted-foreground',
    }
    return <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', styles[status])}>{status}</span>
}

// ═══════════════════════════════════════════════════
// DAILY LOG VIEW
// ═══════════════════════════════════════════════════

const DAILY_LOG_ENTRIES = [
    {
        id: 'DL-006',
        type: 'change_order' as const,
        title: 'Change Order CO-001: Labor Adjustment',
        detail: 'Labor rate adjusted $510→$495 (6hrs→5hrs). Approved by Expert Hub — auto-applied to invoice.',
        source: 'Step 3.3 — Expert Hub',
        timestamp: 'Today, 2:15 PM',
        highlight: true,
        expandedDetail: {
            original: { rate: '$85/hr', hours: 6, total: '$510' },
            adjusted: { rate: '$99/hr', hours: 5, total: '$495' },
            reason: 'Technician completed installation ahead of schedule',
            approvedBy: 'David Park (Expert)',
        },
    },
    {
        id: 'DL-005',
        type: 'claim' as const,
        title: 'Warranty Claim #WC-001 Submitted',
        detail: 'SKU mismatch CC-AZ-2024 vs 2025 — carrier review initiated. Expected resolution: 5 business days.',
        source: 'Step 3.4 — Service Center',
        timestamp: 'Today, 11:30 AM',
        highlight: false,
    },
    {
        id: 'DL-004',
        type: 'delivery' as const,
        title: 'Zone A Shipment Confirmed',
        detail: 'Carrier: FastFreight Logistics — 82 items, ETA Mar 28. Tracking #FF-2055-A available.',
        source: 'Supplier Portal',
        timestamp: 'Yesterday, 4:45 PM',
        highlight: false,
        invoiceLink: 'Auto-linked to Invoice line #3',
    },
    {
        id: 'DL-003',
        type: 'ack' as const,
        title: 'AIS Acknowledgment Processed — 50 Lines',
        detail: '3 exceptions resolved: lead time +14 days on 12 items, price variance on 2 SKUs, substitution on 1 SKU.',
        source: 'Step 2.4 — Expert Hub',
        timestamp: 'Mar 10, 9:20 AM',
        highlight: false,
    },
    {
        id: 'DL-002',
        type: 'po' as const,
        title: 'PO #ORD-2055 Generated & Transmitted',
        detail: '200 line items, 5 suppliers, 4 delivery zones. Auto-transmitted via EDI.',
        source: 'Step 1.9 — Dealer Experience',
        timestamp: 'Mar 8, 3:10 PM',
        highlight: false,
    },
    {
        id: 'DL-001',
        type: 'quote' as const,
        title: 'Quote #QT-1025 Approved — $43,750',
        detail: '35.4% margin, volume discounts applied. 3-level approval chain completed.',
        source: 'Step 1.7 — Dealer Experience',
        timestamp: 'Mar 7, 10:00 AM',
        highlight: false,
    },
]

// ═══════════════════════════════════════════════════
// CRM DASHBOARD VIEW — Daily Log + Summary
// ═══════════════════════════════════════════════════

function CRMDashboardView({ stepId, onGoToCRM }: { stepId: string; onGoToCRM: () => void }) {
    const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
    const [showNotification, setShowNotification] = useState(false)
    const isNewProject = stepId === '1.12'

    // Step 1.12: auto-show notification and auto-expand new entry (user clicks "View Full Project" to navigate)
    useEffect(() => {
        if (!isNewProject) return
        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(() => setShowNotification(true), 1200))
        timers.push(setTimeout(() => setExpandedEntry('DL-NEW'), 2500))
        return () => timers.forEach(clearTimeout)
    }, [isNewProject])

    const typeIcons: Record<string, { icon: React.ReactNode; color: string }> = {
        change_order: { icon: <ReceiptPercentIcon className="h-3.5 w-3.5" />, color: 'text-ai bg-purple-50 dark:bg-ai/10' },
        claim: { icon: <ExclamationTriangleIcon className="h-3.5 w-3.5" />, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
        delivery: { icon: <Truck className="h-3.5 w-3.5" />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' },
        ack: { icon: <CheckCircleIcon className="h-3.5 w-3.5" />, color: 'text-green-500 bg-green-50 dark:bg-green-500/10' },
        po: { icon: <DocumentTextIcon className="h-3.5 w-3.5" />, color: 'text-foreground bg-muted/50' },
        quote: { icon: <FileText className="h-3.5 w-3.5" />, color: 'text-foreground bg-muted/50' },
        project_created: { icon: <BuildingOfficeIcon className="h-3.5 w-3.5" />, color: 'text-zinc-900 bg-brand-400 dark:text-zinc-900 dark:bg-brand-400' },
    }

    const newEntry = {
        id: 'DL-NEW',
        type: 'project_created' as const,
        title: 'New Project Created — Apex HQ Office Renovation',
        detail: 'Auto-created from Quote #QT-1025 · PO #ORD-2055 · $43,750 · 200 items · 4 delivery zones',
        source: 'ProjectCreationAgent',
        timestamp: 'Just now',
        highlight: false,
    }

    const entries = showNotification ? [newEntry, ...DAILY_LOG_ENTRIES] : DAILY_LOG_ENTRIES

    return (
        <div className="space-y-4">
            {/* Notification Toast — step 1.12 */}
            {isNewProject && showNotification && (
                <button
                    onClick={onGoToCRM}
                    className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500"
                >
                    <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                        <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
                                <BellAlertIcon className="h-5 w-5 text-zinc-900" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-foreground">New Project Auto-Created</span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">Just now</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    <strong className="text-foreground">ProjectCreationAgent</strong> created project from Quote #QT-1025 — <strong className="text-foreground">Apex Furniture</strong>, $43,750, 200 line items across 4 delivery zones.
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-[10px] text-brand-700 dark:text-brand-400 font-medium">
                                    <span>Click to view project details</span>
                                    <ArrowRightIcon className="h-3 w-3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </button>
            )}

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'Active Projects', value: '5', sub: '+1 today', icon: <BuildingOfficeIcon className="h-4 w-4" /> },
                    { label: 'Open Change Orders', value: '1', sub: 'CO-001 pending', icon: <ReceiptPercentIcon className="h-4 w-4" /> },
                    { label: 'Pending Invoices', value: '1', sub: '$44,210 ready', icon: <CurrencyDollarIcon className="h-4 w-4" /> },
                    { label: 'Active Shipments', value: '2', sub: 'Zone A in transit', icon: <Truck className="h-4 w-4" /> },
                ].map(card => (
                    <div key={card.label} className="rounded-xl border border-border bg-card p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">{card.icon}<span className="text-[10px]">{card.label}</span></div>
                        <p className="text-lg font-bold text-foreground">{card.value}</p>
                        <p className="text-[10px] text-muted-foreground">{card.sub}</p>
                    </div>
                ))}
            </div>

            {/* Daily Log */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ClipboardDocumentListIcon className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-xs font-medium text-foreground">Project Daily Log</h3>
                        <span className="text-[9px] text-muted-foreground">— Apex HQ Office Renovation</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <AIAgentAvatar agentName="LogAgent" size="xs" />
                        <span className="text-[9px] text-muted-foreground">Auto-recorded · {entries.length} entries</span>
                    </div>
                </div>

                <div className="divide-y divide-border">
                    {entries.map((entry) => {
                        const config = typeIcons[entry.type]
                        const isExpanded = expandedEntry === entry.id
                        const isNew = entry.id === 'DL-NEW'
                        const isExpandable = entry.highlight || isNew

                        return (
                            <div
                                key={entry.id}
                                className={cn(
                                    'px-4 py-2.5 transition-all',
                                    !isNew && !entry.highlight && 'bg-card',
                                    isNew && 'bg-primary/5 animate-in fade-in slide-in-from-top-1 duration-700',
                                    entry.highlight && 'bg-purple-50/30 dark:bg-ai/5',
                                    isExpandable && 'cursor-pointer hover:bg-muted/30'
                                )}
                                onClick={() => isExpandable ? setExpandedEntry(isExpanded ? null : entry.id) : undefined}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn('p-1.5 rounded-lg shrink-0', config.color)}>
                                        {config.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={cn('text-[11px] font-medium text-foreground', isNew && 'font-bold')}>{entry.title}</p>
                                            {entry.highlight && (
                                                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-ai/20 text-ai dark:text-purple-400 font-medium">
                                                    Feeds into Invoice
                                                </span>
                                            )}
                                            {isNew && (
                                                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-brand-300 dark:bg-brand-400 text-zinc-900 font-bold">
                                                    New
                                                </span>
                                            )}
                                            {('invoiceLink' in entry) && (entry as any).invoiceLink && (
                                                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                                                    → {(entry as any).invoiceLink}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{entry.detail}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] text-muted-foreground">{entry.timestamp}</p>
                                        <p className="text-[9px] text-muted-foreground/60">{entry.source}</p>
                                    </div>
                                </div>

                                {entry.highlight && isExpanded && entry.expandedDetail && (
                                    <div className="mt-2 pt-2 ml-10 border-t border-purple-200/50 dark:border-purple-500/20">
                                        <div className="grid grid-cols-4 gap-3">
                                            <div className="rounded-md bg-card border border-border p-2">
                                                <p className="text-[9px] text-muted-foreground font-medium mb-0.5">ORIGINAL</p>
                                                <p className="text-[10px] text-foreground">{entry.expandedDetail.original.rate} × {entry.expandedDetail.original.hours}hrs</p>
                                                <p className="text-xs font-semibold text-foreground">{entry.expandedDetail.original.total}</p>
                                            </div>
                                            <div className="rounded-md bg-card border border-purple-200 dark:border-purple-500/20 p-2">
                                                <p className="text-[9px] text-ai dark:text-purple-400 font-medium mb-0.5">ADJUSTED</p>
                                                <p className="text-[10px] text-foreground">{entry.expandedDetail.adjusted.rate} × {entry.expandedDetail.adjusted.hours}hrs</p>
                                                <p className="text-xs font-semibold text-ai dark:text-purple-400">{entry.expandedDetail.adjusted.total}</p>
                                            </div>
                                            <div className="col-span-2 rounded-md bg-muted/30 border border-border p-2">
                                                <p className="text-[9px] text-muted-foreground font-medium mb-0.5">DETAILS</p>
                                                <p className="text-[10px] text-foreground">{entry.expandedDetail.reason}</p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">Approved by: {entry.expandedDetail.approvedBy}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* New project expanded detail */}
                                {isNew && isExpanded && (
                                    <div className="mt-3 pt-3 ml-10 border-t border-primary/20 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <div className="flex items-center gap-2 mb-2.5">
                                            <BuildingOfficeIcon className="h-4 w-4 text-muted-foreground dark:text-zinc-300" />
                                            <p className="text-xs font-bold text-foreground">Apex HQ Office Renovation</p>
                                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-brand-300 dark:bg-brand-400 text-zinc-900 font-bold">PRJ-001</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-3">
                                            <div className="rounded-md bg-card border border-border p-2">
                                                <p className="text-[9px] text-muted-foreground font-medium mb-0.5">CUSTOMER</p>
                                                <p className="text-[10px] font-semibold text-foreground">Apex Furniture</p>
                                                <p className="text-[9px] text-muted-foreground">Jennifer Martinez, VP Ops</p>
                                            </div>
                                            <div className="rounded-md bg-card border border-border p-2">
                                                <p className="text-[9px] text-muted-foreground font-medium mb-0.5">VALUE</p>
                                                <p className="text-sm font-bold text-foreground">$43,750</p>
                                                <p className="text-[9px] text-muted-foreground">35.4% margin</p>
                                            </div>
                                            <div className="rounded-md bg-card border border-border p-2">
                                                <p className="text-[9px] text-muted-foreground font-medium mb-0.5">SCOPE</p>
                                                <p className="text-[10px] font-semibold text-foreground">200 line items</p>
                                                <p className="text-[9px] text-muted-foreground">4 delivery zones · 5 suppliers</p>
                                            </div>
                                            <div className="rounded-md bg-card border border-border p-2">
                                                <p className="text-[9px] text-muted-foreground font-medium mb-0.5">REFERENCES</p>
                                                <p className="text-[10px] text-foreground">QT-1025 · ORD-2055</p>
                                                <p className="text-[9px] text-muted-foreground">Stage: Procurement</p>
                                            </div>
                                        </div>
                                        <div className="mt-2.5 flex items-center gap-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onGoToCRM() }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-300 hover:bg-brand-400 dark:bg-brand-400 dark:hover:bg-brand-300 text-zinc-900 text-[10px] font-bold transition-colors"
                                            >
                                                View Full Project <ArrowRightIcon className="h-3 w-3" />
                                            </button>
                                            <span className="text-[9px] text-muted-foreground">Zero manual CRM entry — all data synced from source systems</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Customer Communications — Auto-sent (step 1.12) */}
            {isNewProject && showNotification && (
                <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-700 delay-300">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                            <h3 className="text-xs font-medium text-foreground">Customer Communications</h3>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">Auto-sent</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">4 sent · 0 manual drafts</span>
                    </div>
                    <div className="divide-y divide-border">
                        {[
                            { label: 'Order Confirmation', recipient: 'Apex Furniture', date: 'Mar 15', status: 'sent' },
                            { label: 'Shipment Update Zone A', recipient: 'Apex Furniture', date: 'Mar 18', status: 'sent' },
                            { label: 'Acknowledgment Summary', recipient: 'Apex Furniture', date: 'Mar 19', status: 'sent' },
                            { label: 'Delivery Schedule', recipient: 'Apex Furniture', date: 'Mar 27', status: 'scheduled' },
                        ].map((comm, i) => (
                            <div key={i} className={`px-4 py-2 flex items-center gap-3 animate-in fade-in duration-300`} style={{ animationDelay: `${(i + 1) * 150}ms` }}>
                                <svg className={cn("w-3.5 h-3.5 shrink-0", comm.status === 'sent' ? 'text-green-500' : 'text-blue-500')} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    {comm.status === 'sent'
                                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        : <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    }
                                </svg>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-medium text-foreground">{comm.label}</p>
                                    <p className="text-[9px] text-muted-foreground">{comm.recipient}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                                        comm.status === 'sent' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                    )}>{comm.status === 'sent' ? 'Sent' : 'Scheduled'}</span>
                                    <p className="text-[9px] text-muted-foreground mt-0.5">{comm.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Before/After Split Card — Zero Re-Entry (step 1.12) */}
            {isNewProject && showNotification && (
                <div className="bg-card border border-border rounded-xl p-4 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-500">
                    <h4 className="text-[11px] font-semibold text-foreground mb-3 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
                        Data Entry: Before vs. After Strata
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-muted border border-border opacity-60">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Before</p>
                            <p className="text-sm font-bold text-foreground line-through">200 items × 5 systems</p>
                            <p className="text-2xl font-black text-red-500 mt-1 line-through">1,000</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-through">manual entries required</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                            <p className="text-[9px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">After — Strata</p>
                            <p className="text-sm font-bold text-foreground">200 items × 1 entry</p>
                            <p className="text-2xl font-black text-green-600 dark:text-green-400 mt-1">0</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">re-entries needed</p>
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3 pt-3 border-t border-border text-center">
                        Data entered once at email intake → flows to <strong className="text-foreground">Quote, PO, CRM, Invoice, ERP</strong>
                    </p>
                </div>
            )}
        </div>
    )
}

// ═══════════════════════════════════════════════════
// INVOICING VIEW
// ═══════════════════════════════════════════════════

function InvoicingView() {
    const [synced, setSynced] = useState(false)

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Invoice #INV-2055 — Auto-Generated</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Built from PO, change orders, and service labor — zero manual line items</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">Rule-Based</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-medium">
                        Ready for Review
                    </span>
                </div>
            </div>

            {/* 3-Way Match Visual */}
            <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
                    <h4 className="text-[11px] font-medium text-foreground">3-Way Match — PO / Acknowledgment / Invoice</h4>
                </div>
                <div className="flex items-center justify-between gap-2">
                    {[
                        { id: 'PO #ORD-2055', amount: '$43,750', items: '200 items', color: 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10' },
                        { id: 'ACK #ACK-2055', amount: '$43,750', items: '200 items', color: 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' },
                        { id: 'INV #INV-2055', amount: '$44,210', items: '202 items (+CO)', color: 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10' },
                    ].map((doc, i) => (
                        <div key={doc.id} className="flex items-center gap-2 flex-1">
                            <div className={cn("flex-1 p-2.5 rounded-lg border text-center", doc.color)}>
                                <p className="text-[10px] font-bold text-foreground">{doc.id}</p>
                                <p className="text-xs font-black text-foreground mt-0.5">{doc.amount}</p>
                                <p className="text-[9px] text-muted-foreground">{doc.items}</p>
                            </div>
                            {i < 2 && (
                                <div className="flex flex-col items-center gap-0.5 shrink-0">
                                    <span className="text-[8px] text-muted-foreground">↔</span>
                                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-[8px] text-green-600 dark:text-green-400 font-medium">{i === 0 ? 'Match' : 'Reconciled'}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
                {/* Invoice Detail — 3 cols */}
                <div className="col-span-3 rounded-lg border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                        <div>
                            <p className="text-xs font-semibold text-foreground">Apex Furniture</p>
                            <p className="text-[10px] text-muted-foreground">Jennifer Martinez, VP Operations</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-muted-foreground">Invoice Date</p>
                            <p className="text-xs font-medium text-foreground">Mar 13, 2026</p>
                        </div>
                    </div>

                    {/* Line items */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                <div>
                                    <p className="text-[11px] font-medium text-foreground">Original PO #ORD-2055</p>
                                    <p className="text-[9px] text-muted-foreground">200 line items · 4 delivery zones · 5 suppliers</p>
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-foreground">$43,750.00</p>
                        </div>

                        <div className="flex items-center justify-between py-1.5 px-2 rounded bg-purple-50/50 dark:bg-ai/5 border border-purple-100 dark:border-purple-500/10">
                            <div className="flex items-center gap-2">
                                <ReceiptPercentIcon className="h-3.5 w-3.5 text-ai" />
                                <div>
                                    <p className="text-[11px] font-medium text-foreground">Change Order CO-001</p>
                                    <p className="text-[9px] text-muted-foreground">Labor adjustment: 6hrs→5hrs ($510→$495)</p>
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-ai dark:text-purple-400">-$15.00</p>
                        </div>

                        <div className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                                <div>
                                    <p className="text-[11px] font-medium text-foreground">Service Labor</p>
                                    <p className="text-[9px] text-muted-foreground">5 hours × $95/hr · Installation & adjustment</p>
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-foreground">$475.00</p>
                        </div>
                    </div>

                        <div className="flex items-center justify-between py-1.5 px-2 rounded bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                            <div className="flex items-center gap-2">
                                <Truck className="h-3.5 w-3.5 text-blue-500" />
                                <div>
                                    <p className="text-[11px] font-medium text-foreground">Freight — Zone A delivery confirmed</p>
                                    <p className="text-[9px] text-muted-foreground">Source: <span className="text-blue-600 dark:text-blue-400 font-medium">Daily Log DL-004</span> · FastFreight Logistics</p>
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-foreground">$1,200.00</p>
                        </div>

                    {/* Total */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div>
                            <p className="text-xs font-semibold text-foreground">Invoice Total</p>
                            <p className="text-[9px] text-muted-foreground">Terms: Net 30</p>
                        </div>
                        <p className="text-lg font-bold text-foreground">$44,210.00</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                        <button
                            onClick={() => setSynced(true)}
                            disabled={synced}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors',
                                synced
                                    ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            )}
                        >
                            {synced ? (
                                <><CheckCircleIcon className="h-3.5 w-3.5" /> Synced to QuickBooks</>
                            ) : (
                                <><CurrencyDollarIcon className="h-3.5 w-3.5" /> Approve & Sync to QuickBooks</>
                            )}
                        </button>
                        <button className="px-3 py-2 rounded-md text-xs font-medium border border-border text-foreground hover:bg-muted/50 transition-colors">
                            Download PDF
                        </button>
                    </div>
                </div>

                {/* QuickBooks Sync Panel — 2 cols */}
                <div className="col-span-2 space-y-3">
                    {/* QB Connection Card */}
                    <div className="rounded-lg border border-border bg-card p-3 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-md bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                                <CurrencyDollarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-foreground">QuickBooks Online</p>
                                <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">Connected ✓</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            {[
                                { label: 'Invoice', status: synced ? 'Synced' : 'Ready', synced },
                                { label: 'Customer', status: 'Matched', synced: true },
                                { label: 'GL Codes', status: 'Auto-mapped (5)', synced: true },
                                { label: 'Tax Rates', status: 'Applied', synced: true },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between px-2 py-1 rounded bg-muted/30">
                                    <span className="text-[10px] text-muted-foreground">{item.label}</span>
                                    <span className={cn(
                                        'text-[10px] font-medium',
                                        item.synced ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                                    )}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Agent Note */}
                    <div className="rounded-lg border border-border bg-card p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <AIAgentAvatar agentName="InvoicingAgent" size="xs" />
                            <p className="text-[10px] font-medium text-foreground">InvoicingAgent</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Auto-mapped 5 GL codes by product category. Invoice generated from: PO (Step 1.9) + Change Orders (Step 3.3) + Service Labor (Step 3.3). All line items reconciled — zero manual entries required.
                        </p>
                    </div>

                    {/* Source traceability */}
                    <div className="rounded-lg border border-dashed border-border p-3">
                        <p className="text-[9px] font-medium text-muted-foreground mb-2">DATA SOURCES</p>
                        <div className="space-y-1">
                            {[
                                { step: '1.7', label: 'Quote Approved', value: '$43,750' },
                                { step: '1.9', label: 'PO Generated', value: '200 items' },
                                { step: '3.3', label: 'Change Order CO-001', value: '-$15' },
                                { step: '3.3', label: 'Service Labor', value: '$475' },
                            ].map((src, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px]">
                                    <span className="text-muted-foreground/50 font-mono">Step {src.step}</span>
                                    <span className="text-muted-foreground">{src.label}</span>
                                    <span className="ml-auto font-medium text-foreground">{src.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════

type CRMTab = 'projects' | 'customer360' | 'timeline' | 'invoicing' | 'reports'

const STEP_TO_TAB: Record<string, CRMTab> = {
    '1.8': 'timeline',
    '1.12': 'projects',
    '1.13': 'customer360',
    '2.8': 'timeline',
    '3.6': 'reports',
}

const TAB_LABELS: { id: CRMTab; label: string }[] = [
    { id: 'projects', label: 'Projects' },
    { id: 'customer360', label: 'Customer 360' },
    { id: 'timeline', label: 'Order Timeline' },
    { id: 'invoicing', label: 'Invoicing' },
    { id: 'reports', label: 'Reports' },
]

interface CRMSimulationProps {
    onNavigate?: (page: string) => void
    activePage?: string
}

type CRMPage = 'dashboard' | 'crm'

export default function CRMSimulation({ onNavigate, activePage }: CRMSimulationProps) {
    const { currentStep, nextStep, isPaused } = useDemo()
    const { activeProfile } = useDemoProfile();
    const isOps = activeProfile.id === 'ops';
    const isContinua = activeProfile.id === 'continua';
    const stepId = currentStep?.id || '1.12'

    // Pause-aware timer helper
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

    // Step 1.12 starts on dashboard page, others go straight to CRM
    const [crmPage, setCrmPage] = useState<CRMPage>(stepId === '1.12' ? 'dashboard' : 'crm')
    const [notificationShown, setNotificationShown] = useState(false)

    // Determine active tab from step
    const defaultTab = STEP_TO_TAB[stepId] || 'projects'
    const [activeTab, setActiveTab] = useState<CRMTab>(defaultTab)

    // Sync tab and page when step changes
    useMemo(() => {
        const mapped = STEP_TO_TAB[stepId]
        if (mapped) setActiveTab(mapped)
        // Continua step 3.1 goes straight to CRM projects (no dashboard phase)
        if (isContinua && stepId === '3.1') {
            setCrmPage('crm')
            setActiveTab('projects')
        } else {
            setCrmPage(stepId === '1.12' ? 'dashboard' : 'crm')
        }
        setNotificationShown(false)
    }, [stepId, isContinua])

    // React to navbar clicks (Dashboard / CRM toggle)
    useEffect(() => {
        if (activePage === 'dashboard') setCrmPage('dashboard')
        else if (activePage === 'crm') setCrmPage('crm')
    }, [activePage])

    // Navigate to CRM page (used by Daily Log notification in step 1.12)
    const goToCRM = useCallback(() => {
        setNotificationShown(true)
        setCrmPage('crm')
        setActiveTab('projects')
        onNavigate?.('crm')
    }, [onNavigate])

    // OPS Step 1.8 — CRM: Receiving Milestone (auto 10s)
    const [milestoneVisible18, setMilestoneVisible18] = useState(false);
    useEffect(() => {
        if (!isOps || stepId !== '1.8') { setMilestoneVisible18(false); return; }
        const t1 = setTimeout(pauseAware(() => setMilestoneVisible18(true)), 2000);
        const t2 = setTimeout(pauseAware(() => nextStep()), 10000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [isOps, stepId, nextStep, pauseAware]);

    if (isOps && stepId === '1.8') {
        return (
            <div className="h-full flex flex-col bg-background">
                <div className="border-b border-border bg-card px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">CRM — Receiving Milestone</h2>
                            <p className="text-[10px] text-muted-foreground">Apex Furniture project — delivery confirmation auto-recorded</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">AI-powered · Auto-updating</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4" data-demo-target="crm-receiving-milestone">
                    {/* Agent Context */}
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                        <AIAgentAvatar className="mt-0.5" />
                        <div className="flex-1 text-xs text-indigo-700 dark:text-indigo-300">
                            <span className="font-bold">ReceivingMilestoneAgent:</span> Updating CRM project timeline — delivery confirmed for Apex Furniture. All data synced from receiving system automatically.
                        </div>
                    </div>

                    {/* Timeline Entry */}
                    {milestoneVisible18 && (
                        <div className="bg-card glass border border-emerald-300 dark:border-emerald-700 rounded-2xl overflow-hidden shadow-xl shadow-emerald-500/10 animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className="p-4 border-b border-border/50 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
                                    <CheckCircleIcon className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">Delivery Confirmed — March 2026</h3>
                                    <p className="text-[10px] text-muted-foreground">Milestone auto-recorded from receiving system</p>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        { label: 'SKUs Received', value: '47/50' },
                                        { label: 'Product Value', value: '$41,150' },
                                        { label: 'Services', value: '$3,455' },
                                        { label: 'QB Bills', value: 'QB-4421 + QB-4424' },
                                    ].map(stat => (
                                        <div key={stat.label} className="text-center p-2 rounded-lg bg-muted/30">
                                            <p className="text-xs font-bold text-foreground">{stat.value}</p>
                                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Daily Log Entry */}
                                <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ClipboardDocumentListIcon className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">Daily Log DL-004</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">"Receiving complete — partial delivery noted. 2 Task Chairs pending backorder."</p>
                                </div>

                                {/* Source badges */}
                                <div className="mt-3">
                                    <span className="text-[8px] font-bold text-success dark:text-success uppercase tracking-wider">External Systems · Synced</span>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold">📦 Receiving System</span>
                                        <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold">💰 QuickBooks</span>
                                        <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold">📋 Daily Log</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!milestoneVisible18 && (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                <span className="text-sm">Updating CRM project timeline...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // OPS Step 3.3 — Budget vs. Actual Analysis
    if (isOps && stepId === '3.3') {
        return (
            <div className="h-full flex flex-col bg-background">
                <div className="border-b border-border bg-card px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">Budget vs. Actual Analysis</h2>
                            <p className="text-[10px] text-muted-foreground">Apex Furniture — complete financial variance analysis</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">AI-powered · Every dollar documented</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4" data-demo-target="budget-vs-actual-chart">
                    {/* Agent Context */}
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                        <AIAgentAvatar className="mt-0.5" />
                        <div className="flex-1 text-xs text-indigo-700 dark:text-indigo-300">
                            <span className="font-bold">BudgetAnalysisAgent:</span> Complete variance analysis for Apex Furniture — all changes documented with approval chain. Total actual: $50,205 (+14.7% vs. base quote).
                        </div>
                    </div>

                    {/* Waterfall Breakdown */}
                    <div className="bg-card glass border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/5">
                        <div className="p-4 border-b border-border/50">
                            <h3 className="text-sm font-bold text-foreground">Budget vs. Actual — Apex Furniture</h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Waterfall breakdown with documented justification</p>
                        </div>

                        <div className="p-4 space-y-3">
                            {[
                                { label: 'Base Quote', amount: '$43,750', pct: '100%', type: 'base' as const, note: 'Original approved quote QT-1025' },
                                { label: 'CO-007: Ergonomic Upgrade', amount: '+$3,200', pct: '+7.3%', type: 'add' as const, note: 'Customer portal request, approved by approval chain' },
                                { label: 'Services March 2026', amount: '+$3,455', pct: '+7.9%', type: 'add' as const, note: 'Daily Log sourced — 24h labor + 3 delivery trips' },
                                { label: 'Backorder Adjustment', amount: '-$200', pct: '-0.5%', type: 'subtract' as const, note: 'Partial delivery credit for 2 Task Chairs' },
                            ].map((item, i) => (
                                <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border ${
                                    item.type === 'base' ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20' :
                                    item.type === 'add' ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20' :
                                    'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                                }`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-foreground">{item.label}</span>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                                item.type === 'base' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                                item.type === 'add' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                                'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                            }`}>{item.pct}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.note}</p>
                                    </div>
                                    <span className={`text-sm font-bold ${
                                        item.type === 'base' ? 'text-foreground' :
                                        item.type === 'add' ? 'text-amber-600 dark:text-amber-400' :
                                        'text-success dark:text-success'
                                    }`}>{item.amount}</span>
                                </div>
                            ))}

                            {/* Total */}
                            <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-foreground/20 bg-muted/30 mt-2">
                                <div className="flex-1">
                                    <span className="text-sm font-bold text-foreground">Total Actual</span>
                                </div>
                                <span className="text-xl font-bold text-foreground">$50,205</span>
                            </div>
                        </div>

                        {/* Variance summary */}
                        <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400">+$6,455</p>
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Variance</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400">+14.7%</p>
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">vs. Base</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-success dark:text-success">3/3</p>
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Documented</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-success dark:text-success">0</p>
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Unexplained</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Zero surprises callout */}
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="w-4 h-4 text-success" />
                            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">Zero surprises — every dollar documented with approval trail</span>
                        </div>
                    </div>

                    {/* Download Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => nextStep()}
                            className="px-5 py-2.5 rounded-xl bg-brand-300 dark:bg-brand-400 text-zinc-900 font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            <CheckCircleIcon className="w-4 h-4" />
                            Download Report
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Dashboard page — shows Daily Log + summary
    if (crmPage === 'dashboard') {
        return (
            <div className="h-full flex flex-col bg-background">
                <div className="border-b border-border bg-card px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">CRM — Dashboard</h2>
                            <p className="text-[10px] text-muted-foreground">Project activity overview — all events auto-recorded from source systems</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">AI-powered · Cross-platform sync active</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <CRMDashboardView stepId={stepId} onGoToCRM={goToCRM} />
                </div>
            </div>
        )
    }

    // CRM page — tabs (Projects, Customer 360, etc.)
    const metrics = [
        { label: 'Active Projects', value: '5', change: '+1 today' },
        { label: 'Lifetime Value', value: '$1.2M', change: 'Apex Furniture' },
        { label: 'Delivery Rate', value: '98%', change: 'On track' },
        { label: 'Open Claims', value: '1', change: 'SKU mismatch' },
    ]

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card px-6 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">CRM — Project Intelligence</h2>
                        <p className="text-[10px] text-muted-foreground">Data flows automatically from every workflow — zero manual entry</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">AI-powered · Cross-platform sync active</span>
                    </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-4 gap-3 mt-3">
                    {metrics.map(m => (
                        <div key={m.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border">
                            <div>
                                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                                <p className="text-sm font-bold text-foreground">{m.value}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground ml-auto">{m.change}</span>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 mt-3 -mb-3">
                    {TAB_LABELS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'px-3 py-2 text-xs font-medium border-b-2 transition-colors',
                                activeTab === tab.id
                                    ? 'border-foreground text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'projects' && <ProjectsView stepId={stepId} skipNotification={notificationShown} isProjectIntake={isContinua && stepId === '3.1'} />}
                {activeTab === 'customer360' && <Customer360View stepId={stepId} />}
                {activeTab === 'timeline' && <OrderTimelineView stepId={stepId} />}
                {activeTab === 'invoicing' && <InvoicingView />}
                {activeTab === 'reports' && <ReportsView stepId={stepId} />}
            </div>
        </div>
    )
}
