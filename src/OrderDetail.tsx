import {
    ChevronRightIcon, MagnifyingGlassIcon, ArrowDownTrayIcon,
    PlusIcon, CheckCircleIcon, DocumentTextIcon, CubeIcon,
    ExclamationTriangleIcon, ChevronDownIcon, EllipsisHorizontalIcon, SunIcon, MoonIcon,
    XMarkIcon, HomeIcon, Squares2X2Icon, ArrowTrendingUpIcon, ClipboardDocumentListIcon,
    UserIcon, CalendarIcon, ChartBarIcon, ExclamationCircleIcon, ArrowRightOnRectangleIcon, PencilSquareIcon, EnvelopeIcon, SparklesIcon, ArrowPathIcon,
    PaperAirplaneIcon, ChatBubbleLeftRightIcon, PhotoIcon, PaperClipIcon, ClockIcon, CheckIcon, PencilIcon, DocumentChartBarIcon, BanknotesIcon, ArrowsRightLeftIcon, TruckIcon, EyeIcon,
    BellAlertIcon
} from '@heroicons/react/24/outline'
import { Transition, TransitionChild, Popover, PopoverButton, PopoverPanel, Tab, TabGroup, TabList, TabPanel, TabPanels, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { Fragment } from 'react'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useTheme, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Checkbox, Card, Input } from 'strata-design-system'
import { useTenant } from './TenantContext'
import Navbar from './components/Navbar'
import Breadcrumbs from './components/Breadcrumbs'
import { useDemo } from './context/DemoContext'
import { useDemoProfile } from './context/useDemoProfile'
import SourceBadge, { type TransactionSource } from './components/inbound-outbound/SourceBadge'
import DocumentConversionModal from './components/DocumentConversionModal'
import BackorderTraceCard from './components/widgets/BackorderTraceCard'
import type { BackorderLine } from './components/widgets/BackorderTraceCard'
import DelayAlertCard from './components/widgets/DelayAlertCard'
import ProformaInvoiceModal from './components/manufacturer/ProformaInvoiceModal'
import AgentPipelineStrip from './components/simulations/AgentPipelineStrip'
import { AIAgentAvatar } from './components/simulations/DemoAvatars'
import ConfidenceScoreBadge from './components/widgets/ConfidenceScoreBadge'
import SalesRepChip from './components/manufacturer/SalesRepChip'
import OrderActionsBar from './components/manufacturer/OrderActionsBar'
import OrderStagePipeline from './components/manufacturer/OrderStagePipeline'
import ItemDetailsDrawer from './components/manufacturer/ItemDetailsDrawer'
import ARDepositsModal from './components/manufacturer/ARDepositsModal'
import ManufacturerTrackingModal from './components/manufacturer/TrackingModal'
import EmailDraftModal from './components/manufacturer/EmailDraftModal'
import TransactionStickyHeader from './components/transactions/TransactionStickyHeader'
import TransactionInfoCard from './components/transactions/TransactionInfoCard'
import TextileGradedInBadge from './components/manufacturer/TextileGradedInBadge'
import MaterialSwatch from './components/manufacturer/MaterialSwatch'
import { sizeForCategory, formatSize, formatSizeLong } from './components/manufacturer/itemSpecs'
import { useViewAs } from './components/manufacturer/viewAsSignal'
import { resolveTextile, hasFabric, fabricLabel, swatchFor } from './components/manufacturer/textileRef'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

// Parent order ORD-2055 source = 'Email' (per recentOrders in Transactions.tsx).
// Items inherit the parent source — only visible in inbound-outbound profile.
const ORDER_SOURCE: TransactionSource = 'Email'

// Manufacturer-relevant metadata for ORD-2055 (synced with recentOrders in Transactions.tsx · P32)
const ORDER_META = {
    dealer: 'NorthPoint Furniture Group',
    dealerPO: 'PO-NP-2025-001605',
    endCustomer: 'Helix Technologies',
    manufacturerNo: 'MFG-2-10468963',
    contract: 'GSA-28F-0015W',
    linkedQuote: 'QT-1025',
}
// Item statuses use the official 10-stage lifecycle (see src/lib/orderLifecycle.ts).
// `flag` is an operational exception that coexists with stage (e.g. "Shipped" + "partial").
// Delay fields are optional · only populated when flag === 'delayed' (ORD-2056 scenario).
type OrderDetailItem = { id: string; name: string; category: string; tag: string; qtyOrd: number; qtyShip: number; qtyBO: number; listPrice: number; discPct: number; netPrice: number; amount: number; configs: string[]; status: string; flag?: 'partial' | 'backorder' | 'exception' | 'delayed'; statusColor: string; aiStatus?: string; source: TransactionSource; sourceLabel?: string; stock: number; originalEta?: string; newEta?: string; delayDays?: number; delayReason?: string }

const items: Array<OrderDetailItem> = [
    { id: "T-RCR306029HLG2", name: "TBL, REC, 30Dx60Wx29H", category: "Tables", tag: "A", qtyOrd: 4, qtyShip: 4, qtyBO: 0, listPrice: 1261.00, discPct: 62.0, netPrice: 479.18, amount: 1916.72, configs: ["Finish: LG2-Loft Gray", "Edge: SE-Straight Edge"], status: "Shipped", statusColor: "bg-zinc-100 text-muted-foreground", source: "Email", stock: 285 },
    { id: "X-BBFPFS182812", name: "CBX Full Depth BBF Ped", category: "Storage", tag: "A", qtyOrd: 4, qtyShip: 4, qtyBO: 0, listPrice: 1048.00, discPct: 62.0, netPrice: 398.24, amount: 1592.96, configs: ["Finish: LG2-Loft Gray", "Lock: KA-Keyed Alike"], status: "Shipped", statusColor: "bg-zinc-100 text-muted-foreground", source: "Email", stock: 520 },
    { id: "W-WS3072", name: "WORKSURFACE RECT 30Dx72W", category: "Worksurfaces", tag: "B", qtyOrd: 6, qtyShip: 6, qtyBO: 0, listPrice: 656.00, discPct: 62.0, netPrice: 249.28, amount: 1495.68, configs: ["Finish: LG2-Loft Gray", "Edge: SE-Straight Edge"], status: "Shipped", statusColor: "bg-zinc-100 text-muted-foreground", source: "Email", stock: 340 },
    { id: "S-LATJJ2D36", name: 'LATERAL FILE 2 DRAWER 36"', category: "Storage", tag: "C", qtyOrd: 3, qtyShip: 3, qtyBO: 0, listPrice: 1492.00, discPct: 62.0, netPrice: 566.96, amount: 1700.88, configs: ["Finish: LG2-Loft Gray", "Lock: KA-Keyed Alike"], status: "Shipped", statusColor: "bg-zinc-100 text-muted-foreground", source: "Email", stock: 180 },
    { id: "F-SSC346030C", name: 'LB LOUNGE 2 SEAT 34"H', category: "Seating", tag: "D", qtyOrd: 2, qtyShip: 0, qtyBO: 2, listPrice: 4836.00, discPct: 58.0, netPrice: 2031.12, amount: 4062.24, configs: ["Fabric: CF-6036 Ocean Blue", "Finish: LG2-Loft Gray"], status: "Scheduled for production", flag: "backorder", statusColor: "bg-amber-50 text-amber-700 ring-amber-600/20", aiStatus: "warning", source: "Email", stock: 0 },
    { id: "7730", name: "AUBURN GRAY CONFERENCE CHAIR", category: "Seating", tag: "D", qtyOrd: 12, qtyShip: 12, qtyBO: 0, listPrice: 1048.00, discPct: 55.0, netPrice: 471.60, amount: 5659.20, configs: ["Fabric: GR-5505 Charcoal", "Arms: ADJ-Adjustable"], status: "Shipped", statusColor: "bg-zinc-100 text-muted-foreground", source: "Email", stock: 95 },
    { id: "X-LTD661218L", name: "CBX Triple Door Locker", category: "Storage", tag: "E", qtyOrd: 8, qtyShip: 6, qtyBO: 2, listPrice: 1836.00, discPct: 62.0, netPrice: 697.68, amount: 5581.44, configs: ["Finish: LG2-Loft Gray", "Lock: KA-Keyed Alike", "Shelf: 1-One Adjustable"], status: "Shipped", flag: "partial", statusColor: "bg-amber-50 text-amber-700 ring-amber-600/20", aiStatus: "warning", source: "Email", stock: 42 },
    { id: "P-PN60HBF", name: "PANEL 60Hx48W FABRIC BOTH", category: "Panels", tag: "F", qtyOrd: 10, qtyShip: 10, qtyBO: 0, listPrice: 892.00, discPct: 62.0, netPrice: 338.96, amount: 3389.60, configs: ["Fabric: CF-6036 Ocean Blue", "Frame: LG2-Loft Gray"], status: "Shipped", statusColor: "bg-zinc-100 text-muted-foreground", source: "Email", stock: 28 },
]

const demoItems = [
    { id: "AER-REM-2025-BLK", name: "Aeron Remastered", category: "Task Seating", tag: "A", qtyOrd: 3, qtyShip: 3, qtyBO: 0, listPrice: 1895.00, discPct: 40.0, netPrice: 1137.00, amount: 3411.00, configs: ["Finish: Graphite", "Size: B-Medium"], status: "Ready to ship", statusColor: "bg-green-50 text-green-700", aiStatus: "check", source: ORDER_SOURCE, stock: 120 },
    { id: "EMB-CHR-2025-GRY", name: "Embody Chair", category: "Performance", tag: "A", qtyOrd: 2, qtyShip: 1, qtyBO: 1, listPrice: 1895.00, discPct: 35.0, netPrice: 1231.75, amount: 2463.50, configs: ["Sync: Gray", "Arms: Fully Adjustable"], status: "Shipped", flag: "partial", statusColor: "bg-amber-50 text-amber-700", source: ORDER_SOURCE, stock: 45 },
    { id: "NVI-DSK-2025-WAL", name: "Nevi Sit-Stand Desk", category: "Desking", tag: "B", qtyOrd: 4, qtyShip: 4, qtyBO: 0, listPrice: 1295.00, discPct: 30.0, netPrice: 906.50, amount: 3626.00, configs: ["Top: Walnut", "Base: White"], status: "Shipped", statusColor: "bg-zinc-100 text-muted-foreground", source: ORDER_SOURCE, stock: 200 },
];

const flow1Items = [
    { id: "SKU-OFF-2025-002", name: "Ergonomic Task Chair", category: "Standard Series", tag: "A", qtyOrd: 125, qtyShip: 125, qtyBO: 0, listPrice: 685.00, discPct: 45.0, netPrice: 376.75, amount: 47093.75, configs: ["Mesh: Gray", "Arms: Adjustable"], status: "Ready to ship", statusColor: "bg-brand/10 text-brand ring-brand/20", aiStatus: "check", source: ORDER_SOURCE, stock: 125 }
];

// ORD-2056 · Delayed shipment scenario (Kenya feedback 2026-06-04) · Leland Proforma · Continua Interiors
// Item 1 ships on time · Items 2 & 3 carry flag: 'delayed' with ETA Mar 20 -> Mar 28 (+8d, carrier weather hold).
const ord2056Items: Array<OrderDetailItem> = [
    { id: "T-RCR306029HLG2", name: "TBL, REC, 30Dx60Wx29H", category: "Tables", tag: "A", qtyOrd: 6, qtyShip: 6, qtyBO: 0, listPrice: 1261.00, discPct: 62.0, netPrice: 479.18, amount: 2875.08, configs: ["Finish: LG2-Loft Gray", "Edge: SE-Straight Edge"], status: "Shipped", statusColor: "bg-zinc-100 text-muted-foreground", source: "Email", stock: 285 },
    { id: "F-SSC346030C", name: 'LB LOUNGE 2 SEAT 34"H', category: "Seating", tag: "B", qtyOrd: 4, qtyShip: 4, qtyBO: 0, listPrice: 4836.00, discPct: 58.0, netPrice: 2031.12, amount: 8124.48, configs: ["Fabric: CF-6036 Ocean Blue", "Finish: LG2-Loft Gray"], status: "Shipped", flag: "delayed", statusColor: "bg-warning/10 text-warning ring-warning/30", aiStatus: "warning", source: "Email", stock: 12, originalEta: "Mar 20, 2026", newEta: "Mar 28, 2026", delayDays: 8, delayReason: "Carrier weather hold · I-80 corridor closure" },
    { id: "X-LTD661218L", name: "CBX Triple Door Locker", category: "Storage", tag: "C", qtyOrd: 2, qtyShip: 2, qtyBO: 0, listPrice: 1836.00, discPct: 62.0, netPrice: 697.68, amount: 1395.36, configs: ["Finish: LG2-Loft Gray", "Lock: KA-Keyed Alike"], status: "Shipped", flag: "delayed", statusColor: "bg-warning/10 text-warning ring-warning/30", aiStatus: "warning", source: "Email", stock: 42, originalEta: "Mar 20, 2026", newEta: "Mar 28, 2026", delayDays: 8, delayReason: "Carrier weather hold · I-80 corridor closure" },
];


interface Message {
    id: number | string;
    sender: string;
    avatar: string;
    content: React.ReactNode;
    time: string;
    type: 'system' | 'ai' | 'user' | 'action_processing' | 'action_success';
}

const DiscrepancyResolutionFlow = () => {
    const [status, setStatus] = useState<'initial' | 'requesting' | 'pending' | 'approved'>('initial')
    const [requestText, setRequestText] = useState('')

    const handleRequest = () => {
        setStatus('pending')
        setTimeout(() => setStatus('approved'), 3000)
    }

    if (status === 'initial') {
        return (
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    Found 3 discrepancies in recent shipments.
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground dark:text-zinc-300">
                    <li>Order #ORD-2054: Weight mismatch (Logs: 50kg vs Gateway: 48kg)</li>
                    <li>Order #ORD-2051: Timestamp sync error</li>
                    <li>Order #ORD-2048: Missing carrier update</li>
                </ul>
                <div className="flex gap-2 mt-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-zinc-900 dark:text-primary hover:bg-primary/20 text-xs font-medium rounded-lg transition-colors">
                        <ArrowPathIcon className="w-3.5 h-3.5" /> Sync & Report
                    </button>
                    <button
                        onClick={() => setStatus('requesting')}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-muted-foreground dark:text-zinc-300 text-xs font-medium rounded-lg hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground transition-colors"
                    >
                        <PencilIcon className="w-3.5 h-3.5" /> Request Changes
                    </button>
                </div>
            </div>
        )
    }

    if (status === 'requesting') {
        return (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-sm font-medium text-foreground">Describe required changes:</p>
                <textarea
                    className="w-full text-sm p-3 rounded-lg border border-border bg-card text-foreground focus:ring-2 ring-primary outline-none transition-all placeholder:text-muted-foreground"
                    rows={3}
                    placeholder="E.g., Update weight for ORD-2054 to 48kg..."
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                />
                <div className="flex justify-between items-center">
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <PaperClipIcon className="w-4 h-4" /> Attach File
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStatus('initial')}
                            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-zinc-900 dark:text-muted-foreground dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRequest}
                            className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-sm transition-colors"
                        >
                            Submit Request
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (status === 'pending') {
        return (
            <div className="flex flex-col gap-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-primary">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Requesting approval from Logistics Manager...</span>
                </div>
            </div>
        )
    }

    if (status === 'approved') {
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                    <CheckCircleIcon className="h-5 w-5" />
                    <p>Changes approved. PO updated.</p>
                </div>
                <div className="bg-muted dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 p-3 flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                        <DocumentTextIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">PO_Revised_Final.pdf</p>
                        <p className="text-xs text-muted-foreground">Updated just now</p>
                    </div>
                    <button className="p-2 hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground rounded-lg transition-colors group">
                        <ArrowDownTrayIcon className="h-5 w-5 text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-zinc-900" />
                    </button>
                </div>
            </div>
        )
    }

    return null
}

const DiscrepancyActionCard = ({ msg }: { msg: Message }) => {
    const [isRequesting, setIsRequesting] = useState(false)
    const [requestText, setRequestText] = useState('')
    const [status, setStatus] = useState<'initial' | 'pending' | 'approved'>('initial')

    const handleSubmit = () => {
        setStatus('pending')
        setTimeout(() => {
            setStatus('approved')
            setIsRequesting(false)
        }, 2000)
    }

    if (status === 'pending') {
        return (
            <div className={cn(
                "rounded-2xl p-4 shadow-sm bg-green-50 dark:bg-green-900/20 text-foreground border border-green-100 dark:border-green-800"
            )}>
                <div className="flex items-center gap-2">
                    <ArrowPathIcon className="h-5 w-5 text-green-600 dark:text-green-400 animate-spin" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Requesting approval from Logistics Manager...</span>
                </div>
            </div>
        )
    }

    if (status === 'approved') {
        return (
            <div className={cn(
                "rounded-2xl p-4 shadow-sm bg-green-50 dark:bg-green-900/20 text-foreground border border-green-100 dark:border-green-800"
            )}>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Action Updated</span>
                </div>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium mb-3">
                    <CheckCircleIcon className="h-5 w-5" />
                    <p>Changes approved. PO updated.</p>
                </div>
                <div className="flex items-center gap-3 bg-card/50 p-3 rounded-xl border border-green-200 dark:border-green-800/50 shadow-sm">
                    <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center border border-red-100 dark:border-red-800/30">
                        <DocumentTextIcon className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">PO_Revised_Final.pdf</p>
                        <p className="text-xs text-muted-foreground">2.4 MB • Generated just now</p>
                    </div>
                    <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "rounded-2xl p-4 shadow-sm transition-all duration-300",
            isRequesting ? "ring-2 ring-indigo-500/20 bg-card" : "bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800"
        )}>
            {!isRequesting ? (
                <>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">{msg.sender}</span>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Action Completed</span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{msg.content}</p>

                    <div className="mt-3 space-y-3">
                        {/* PDF File */}
                        <div className="flex items-center gap-3 bg-card/50 p-3 rounded-xl border border-green-200 dark:border-green-800/50 shadow-sm">
                            <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center border border-red-100 dark:border-red-800/30">
                                <DocumentTextIcon className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">PO_ORD-2055_Final.pdf</p>
                                <p className="text-xs text-muted-foreground">2.4 MB • Generated just now</p>
                            </div>
                            <button className="p-2 hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground rounded-lg text-muted-foreground transition-colors group">
                                <ArrowDownTrayIcon className="h-5 w-5 group-hover:text-zinc-900" />
                            </button>
                        </div>

                        {/* Attention Selection */}
                        <div className="pl-4 border-l-4 border-amber-500 py-2 my-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
                                        Attention Needed
                                    </p>
                                    <p className="text-sm text-zinc-900 dark:text-zinc-300 mt-1">
                                        Discrepancy detected for <span className="font-semibold text-foreground">SKU-OFF-2025-003</span>:
                                    </p>
                                    <div className="mt-2 flex items-center gap-4 text-xs font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Warehouse</span>
                                            <span className="text-foreground font-mono text-sm bg-zinc-100 dark:bg-card px-1.5 py-0.5 rounded">42</span>
                                        </div>
                                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700"></div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Local</span>
                                            <span className="text-foreground font-mono text-sm bg-zinc-100 dark:bg-card px-1.5 py-0.5 rounded">35</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                            <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg shadow-sm transition-colors">
                                Sync Database
                            </button>
                            <button className="px-4 py-2 bg-white dark:bg-transparent border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground text-xs font-medium rounded-lg transition-colors">
                                Resolve Manually
                            </button>
                            <button
                                onClick={() => setIsRequesting(true)}
                                className="px-3 py-2 text-muted-foreground hover:text-zinc-900 dark:hover:text-primary-foreground hover:bg-primary dark:hover:bg-primary rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ml-auto group"
                            >
                                <PencilIcon className="w-3.5 h-3.5" />
                                Request Changes
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">Describe required changes:</h4>
                        <button onClick={() => setIsRequesting(false)} className="text-muted-foreground hover:text-muted-foreground dark:hover:text-zinc-200">
                            <span className="sr-only">Close</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <textarea
                        className="w-full text-sm bg-muted dark:bg-card border-0 rounded-lg p-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="E.g., Update weight for ORD-2054 to 48kg..."
                        rows={3}
                        autoFocus
                        value={requestText}
                        onChange={(e) => setRequestText(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                        <button className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-muted transition-colors">
                            <PaperClipIcon className="w-3.5 h-3.5" />
                            Attach File
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsRequesting(false)}
                                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-lg shadow-sm transition-colors"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const collaborators = [
    { name: "David Park", role: "Regional Sales Mgr", status: "online", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    { name: "Mike Ross", role: "Warehouse Lead", status: "offline", avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    { name: "AI Agent", role: "System Bot", status: "online", avatar: "AI" },
]

const documents = [
    { name: "PO_Confirmation_ORD-2055.pdf", size: "245 KB", uploaded: "Dec 21, 2025" },
    { name: "Contract_Reference_GSA-28F-0015W.pdf", size: "1.2 MB", uploaded: "Dec 21, 2025" },
]

interface DetailProps {
    onBack: () => void;
    onLogout: () => void;
    onNavigateToWorkspace: () => void;
    onNavigate?: (page: string) => void;
}

const BACKORDER_LINES: BackorderLine[] = [
    { sku: 'SKU-OFF-2025-003', name: 'Conference Room Chair', originalQty: 50, fulfilledQty: 35, backorderedQty: 15, eta: 'Mar 15, 2026', impact: 'Delayed delivery for 2nd floor conference rooms. Manufacturer backlog on Navy fabric.' },
    { sku: 'SKU-OFF-2025-008', name: 'Bench Seating 3-Seat', originalQty: 20, fulfilledQty: 12, backorderedQty: 8, eta: 'Mar 22, 2026', impact: 'Lobby installation delayed. Chrome finish supplier capacity constraint.' },
];

export default function OrderDetail({ onBack, onLogout, onNavigateToWorkspace, onNavigate }: DetailProps) {
    const { currentStep, nextStep, isDemoActive, procCompleteStep } = useDemo();
    const { activeProfile } = useDemoProfile();
    const isContinua = activeProfile.id === 'continua';
    const showSource = activeProfile.id === 'inbound-outbound';
    const isInboundOutbound = activeProfile.id === 'inbound-outbound';
    // W11 · dealer mirror — hide financial/write quick actions in dealer (read-only) view.
    const isDealerView = useViewAs() === 'dealer';
    const showPOSummary = isContinua && procCompleteStep === '2.2';
    const [isDemoOrder, setIsDemoOrder] = useState(false);
    const [isFlow1Order, setIsFlow1Order] = useState(false);
    // ORD-2056 · Kenya delay scenario · selected when a Transactions row sets the sessionStorage handoff key.
    const [isDelayedOrder, setIsDelayedOrder] = useState(false);
    useEffect(() => {
        const demoId = localStorage.getItem('demo_view_order_id');
        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get('id');
        let selectedSessionId: string | null = null;
        try { selectedSessionId = sessionStorage.getItem('demo:selectedOrderId') } catch { /* ignore */ }

        if ((demoId === 'ORD-7829') || (urlId === 'ORD-7829')) {
            setIsDemoOrder(true);
            setSelectedItem(demoItems[0]);
        } else if ((demoId === 'PO-1029') || (urlId === 'PO-1029')) {
            setIsFlow1Order(true);
            setSelectedItem(flow1Items[0]);
        } else if (selectedSessionId === '#ORD-2056') {
            setIsDelayedOrder(true);
        }
    }, []);

    const currentItems = isFlow1Order ? flow1Items : (isDemoOrder ? demoItems : (isDelayedOrder ? ord2056Items : items));
    const orderId = isFlow1Order ? '#PO-1029' : (isDemoOrder ? '#ORD-7829' : (isDelayedOrder ? '#ORD-2056' : '#ORD-2055'));
    // Canonical header data — single source of truth (reconciles the prior expanded/collapsed mismatch).
    const orderSummary = isDelayedOrder ? {
        orderValue: '$142,800.00',
        lineItems: '3',
        shipped: '12 of 12',
        fulfillment: 'Shipped · Delayed',
        status: 'Shipped',
        shipVia: 'LTL',
        carrier: 'FedEx Freight',
        currentPhase: 'Delivery',
    } : {
        orderValue: isFlow1Order ? '$47,093.75' : '$25,398.72',
        lineItems: isFlow1Order ? '1' : '8',
        shipped: isFlow1Order ? '125' : '45 of 49',
        fulfillment: isFlow1Order ? 'Ready to ship' : 'Shipped · Partial',
        status: isFlow1Order ? 'Ready to ship' : 'In production',
        shipVia: 'Best Way',
        carrier: 'FedEx',
        currentPhase: 'Processing',
    };
    // Delay metadata · only populated when isDelayedOrder is true.
    const delayInfo = isDelayedOrder ? {
        originalEta: 'Mar 20, 2026',
        newEta: 'Mar 28, 2026',
        delayDays: 8,
        reason: 'Carrier weather hold · I-80 corridor closure',
        callBeforeDelivery: '24hrs · 480-640-2818',
        affectedItems: ord2056Items
            .filter(i => i.flag === 'delayed')
            .map(i => ({ sku: i.id, name: i.name })),
    } : null;

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            sender: "System",
            avatar: "",
            content: isInboundOutbound
                ? `Purchase Order ${orderId} received from NorthPoint Furniture Group · 8 line items · $25,398.72 · Ship Via: Best Way. Awaiting acknowledgement preparation.`
                : `Order ${orderId} placed — 8 line items, $25,398.72 total. Ship Via: Best Way.`,
            time: "Just now",
            type: "system",
        },
    ]);

    // If it's the demo order, we might want cleaner messages
    useEffect(() => {
        if (isDemoOrder) {
            setMessages([
                {
                    id: 1,
                    sender: "System",
                    avatar: "",
                    content: `Order ${orderId} generated from Quote #QT-9921.`,
                    time: "2 mins ago",
                    type: "system",
                },
                {
                    id: 2,
                    sender: "AI Assistant",
                    avatar: "AI",
                    content: "I've verified the stock for replaced item 'Aeron Remastered'. 120 units available at NY-05 Distribution Center.",
                    time: "1 min ago",
                    type: "ai",
                },
                {
                    id: 3,
                    sender: "System",
                    avatar: "",
                    content: `Cost Center 'Marketing-101' applied successfully.`,
                    time: "Just now",
                    type: "system",
                }
            ]);
        } else if (isFlow1Order) {
            setMessages([
                {
                    id: 1,
                    sender: "System",
                    avatar: "",
                    content: isInboundOutbound
                        ? `Purchase Order ${orderId} received · linked to quoted RFQ #QT-1025 · 125 units of Ergonomic Task Chairs.`
                        : `Purchase Order ${orderId} auto-generated from approved Quote #QT-1025.`,
                    time: "Just now",
                    type: "system",
                },
                {
                    id: 2,
                    sender: "AI Assistant",
                    avatar: "AI",
                    content: "I've successfully received and allocated 125 units of Ergonomic Task Chairs for Apex Furniture. Total value confirmed at $43,750.",
                    time: "Just now",
                    type: "ai",
                }
            ]);
        }
    }, [isDemoOrder, isFlow1Order, orderId]);

    const [selectedItem, setSelectedItem] = useState(items[0])
    // Item details drawer (replaces the col-span-4 right panel)
    const [itemDrawerOpen, setItemDrawerOpen] = useState(false)
    // AR & Deposits modal (replaces the always-visible panel below the items table)
    const [arModalOpen, setArModalOpen] = useState(false)
    const [sections, setSections] = useState({
        quickActions: true,
        productOverview: true,
        lifecycle: true,
        aiSuggestions: true
    })
    const [isPOModalOpen, setIsPOModalOpen] = useState(false)
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
    // Generate Proforma · moved from Ack to PO detail per Wendy 41:16 (Neocon-review 2026-06-05).
    const [proformaOpen, setProformaOpen] = useState(false)
    // Planned Delivery helper · used by the Order Information metric and by the workflow step meta.
    const plannedDelivery = isDelayedOrder ? 'Mar 28, 2026' : 'Mar 20, 2026'
    // Suggested-actions wiring (Track Shipment / Check Backorders / Contact Vendor / Delay Alert)
    const [trackingOpen, setTrackingOpen] = useState(false)
    const [backordersOpen, setBackordersOpen] = useState(false)
    const [contactVendorOpen, setContactVendorOpen] = useState(false)
    const [delayAlertOpen, setDelayAlertOpen] = useState(false)
    const [isConversionOpen, setIsConversionOpen] = useState(false)
    const [toast, setToast] = useState<{ title: string; description: string; type: 'success' | 'error' | 'info' } | null>(null)
    const triggerToast = (title: string, description: string, type: 'success' | 'error' | 'info') => {
        setToast({ title, description, type })
        setTimeout(() => setToast(null), 4000)
        if (type === 'success') setTimeout(() => onBack(), 1800)
    }
    const [isAiDiagnosisOpen, setIsAiDiagnosisOpen] = useState(false)
    const [isManualFixMode, setIsManualFixMode] = useState(false)
    const [resolutionMethod, setResolutionMethod] = useState<'local' | 'remote' | 'custom'>('remote')
    const [customValue, setCustomValue] = useState('')

    const toggleSection = (key: keyof typeof sections) => {
        setSections(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const { theme, toggleTheme } = useTheme()
    const { currentTenant } = useTenant()

    return (
        <div className="flex flex-col min-h-screen bg-background font-sans text-foreground transition-colors duration-200">
            {/* Floating Info Navbar */}
            <Navbar onLogout={onLogout} activeTab="Inventory" onNavigateToWorkspace={onNavigateToWorkspace} onNavigate={onNavigate || (() => { })} />

            {/* Page Header (moved from original header, adjusted for floating nav) */}
            <div className={`pt-24 ${isInboundOutbound ? 'px-4' : 'px-6'} pb-4 max-w-[1600px] mx-auto w-full flex items-center justify-between border-b border-border bg-transparent transition-colors duration-200`}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Button variant="ghost" onClick={onBack} className="p-1 h-auto text-muted-foreground hover:text-zinc-900 dark:hover:text-primary-foreground">
                        <ChevronRightIcon className="h-4 w-4 rotate-180" />
                    </Button>
                    <Breadcrumbs
                        items={[
                            { label: 'Dashboard', onClick: onBack },
                            { label: 'Transactions', onClick: onBack },
                            { label: `Order ${orderId}`, active: true }
                        ]}
                    />
                </div>
                <div className="flex items-center gap-3">
                    {!isInboundOutbound && (
                        <Button variant="primary" className="gap-2 px-3 py-1.5 text-sm font-medium">
                            <PlusIcon className="h-4 w-4" /> Add New Item
                        </Button>
                    )}
                </div>
            </div>

            <div className={`flex flex-col gap-6 ${isInboundOutbound ? 'p-4' : 'p-6'} max-w-[1600px] mx-auto w-full`}>
                {/* Primary sticky header — transaction id + dealer + status + phase */}
                {showSource && (
                    <TransactionStickyHeader
                        transactionId={orderId}
                        dealer={ORDER_META.dealer}
                        status={{ label: orderSummary.fulfillment, tone: isFlow1Order ? 'success' : 'warning' }}
                        currentPhase={orderSummary.currentPhase}
                    />
                )}

                {/* Delay Alert (ORD-2056 scenario) — surfaced via a chip in Order Information that opens the floating DelayAlertCard modal below. */}

                {/* Step 2.6: Backorder Trace Panel + Agent Attribution */}
                {currentStep?.id === '2.6' && (
                    <div data-demo-target="backorder-split" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* AI Attribution Header */}
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                            <div className="flex items-center gap-2">
                                <AIAgentAvatar />
                                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">BackorderAgent split order into fulfilled/backordered from Acknowledgement data</span>
                            </div>
                            <ConfidenceScoreBadge score={98} label="Accuracy" size="md" />
                        </div>

                        {/* Backorder Trace Card */}
                        <BackorderTraceCard lines={BACKORDER_LINES} orderId="#ORD-2055" />

                        {/* Impact Summary Card */}
                        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                            <h4 className="text-sm font-bold text-foreground mb-3">Impact Summary</h4>
                            <div className="space-y-3">
                                {/* Fulfillment Bar */}
                                <div>
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span className="text-muted-foreground">Fulfilled vs Backordered</span>
                                        <span className="font-bold text-foreground">47/70 units (67%)</span>
                                    </div>
                                    <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                                        <div className="bg-green-500 transition-all" style={{ width: '67%' }} />
                                        <div className="bg-amber-500 transition-all" style={{ width: '33%' }} />
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Fulfilled (47)</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Backordered (23)</span>
                                    </div>
                                </div>

                                {/* Timeline Impact */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-1">Zone A — HQ</span>
                                        <span className="text-sm font-bold text-green-600 dark:text-green-400">On Schedule</span>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">25 chairs ready Feb 15</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-1">Zone B — Annex</span>
                                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">Delayed +5 weeks</span>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">23 units ETA Mar 28</p>
                                    </div>
                                </div>

                                {/* AI Suggestion */}
                                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                                    <SparklesIcon className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                                    <span className="text-[10px] text-indigo-700 dark:text-indigo-400">Consider alternative vendor for 15 chairs (2-week vs 5-week lead). Estimated savings: $1,200 in expedite fees.</span>
                                </div>
                            </div>

                            <button
                                onClick={nextStep}
                                className="mt-4 w-full px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg transition-all shadow-sm hover:scale-[1.01] flex items-center justify-center gap-2"
                            >
                                Proceed to Approval Chain
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 1.7 PO Generation removed — now handled in ExpertHubTransactions step 1.8 */}
                {false && (
                    <div data-demo-target="po-generation" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* AI Attribution */}
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                            <div className="flex items-center gap-2">
                                <AIAgentAvatar />
                                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">POBuilderAgent generating Purchase Order from approved Quote QT-1025</span>
                            </div>
                            <ConfidenceScoreBadge score={99} label="Mapping" size="md" />
                        </div>

                        {/* PO Generation Progress Card */}
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
                            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                                        <DocumentTextIcon className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">Purchase Order Generation</h3>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">Auto-converting Quote QT-1025 → PO-1029</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                    poGenPhase === 'complete'
                                        ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                                        : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                                }`}>
                                    {poGenPhase === 'building' && 'Building PO...'}
                                    {poGenPhase === 'mapping' && 'Mapping Line Items...'}
                                    {poGenPhase === 'validating' && 'Validating...'}
                                    {poGenPhase === 'complete' && 'PO Generated'}
                                </span>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Generation Steps */}
                                <div className="space-y-2">
                                    {[
                                        { phase: 'building' as const, label: 'Extracting approved quote structure', detail: '5 line items, 3 warranty options, 2 discounts' },
                                        { phase: 'mapping' as const, label: 'Mapping quote fields to PO format', detail: 'SKUs, quantities, unit prices, shipping terms' },
                                        { phase: 'validating' as const, label: 'Validating against vendor catalog & inventory', detail: 'Stock confirmed at distribution centers' },
                                        { phase: 'complete' as const, label: 'PO finalized with compliance stamps', detail: 'Approval chain signatures embedded' },
                                    ].map((step, i) => {
                                        const phases = ['building', 'mapping', 'validating', 'complete'] as const;
                                        const currentIdx = phases.indexOf(poGenPhase);
                                        const stepIdx = phases.indexOf(step.phase);
                                        const isDone = stepIdx < currentIdx || poGenPhase === 'complete';
                                        const isActive = stepIdx === currentIdx && poGenPhase !== 'complete';

                                        return (
                                            <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-500 ${
                                                isDone ? 'bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20' :
                                                isActive ? 'bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20' :
                                                'bg-muted/20 border border-transparent'
                                            }`}>
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                                                    isDone ? 'bg-green-500 text-white' :
                                                    isActive ? 'bg-blue-500 text-white' :
                                                    'bg-muted text-muted-foreground'
                                                }`}>
                                                    {isDone ? <CheckIcon className="w-3.5 h-3.5" /> :
                                                     isActive ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> :
                                                     <span className="text-[9px] font-bold">{i + 1}</span>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-medium ${isDone || isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                                                    <p className="text-[10px] text-muted-foreground">{step.detail}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* PO Line Items Table (visible after mapping phase) */}
                                {(poGenPhase === 'validating' || poGenPhase === 'complete') && (
                                    <div className="rounded-xl border border-border overflow-hidden animate-in fade-in duration-500">
                                        <div className="px-4 py-2.5 bg-muted/30 border-b border-border">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PO-1029 Line Items (from QT-1025)</span>
                                        </div>
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-border/50 bg-muted/20">
                                                    <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground">Line</th>
                                                    <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground">SKU</th>
                                                    <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground">Description</th>
                                                    <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground text-right">Qty</th>
                                                    <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground text-right">Unit Price</th>
                                                    <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground text-right">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/50">
                                                {[
                                                    { line: 1, sku: 'ERG-5100', desc: 'Ergonomic Task Chair', qty: 125, price: 350, warranty: '+5yr Extended' },
                                                    { line: 2, sku: 'DSK-2200', desc: 'Height-Adjustable Desk', qty: 80, price: 580, warranty: '+3yr Standard' },
                                                    { line: 3, sku: 'ARM-4D10', desc: 'Adjustable 4D Armrest', qty: 125, price: 18, warranty: null },
                                                    { line: 4, sku: 'MON-3400', desc: 'Monitor Arm Dual', qty: 60, price: 145, warranty: '+2yr Extended' },
                                                    { line: 5, sku: 'CAB-1100', desc: 'Mobile Pedestal Cabinet', qty: 40, price: 220, warranty: null },
                                                ].map(item => (
                                                    <tr key={item.line} className="text-xs">
                                                        <td className="px-4 py-2 text-muted-foreground">{item.line}</td>
                                                        <td className="px-4 py-2 font-mono text-foreground font-medium">{item.sku}</td>
                                                        <td className="px-4 py-2 text-foreground">
                                                            {item.desc}
                                                            {item.warranty && (
                                                                <span className="ml-1.5 text-[9px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded font-medium">{item.warranty}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 text-foreground text-right">{item.qty}</td>
                                                        <td className="px-4 py-2 text-foreground text-right">${item.price.toLocaleString()}</td>
                                                        <td className="px-4 py-2 text-foreground text-right font-bold">${(item.qty * item.price).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="border-t border-border bg-muted/30">
                                                    <td colSpan={4} className="px-4 py-2 text-[10px] text-muted-foreground">Discounts: Early Payment (2%) + Mixed Category (2%)</td>
                                                    <td className="px-4 py-2 text-[10px] text-muted-foreground text-right">Subtotal</td>
                                                    <td className="px-4 py-2 text-xs font-bold text-foreground text-right">$139,850</td>
                                                </tr>
                                                <tr className="border-t border-border">
                                                    <td colSpan={4} />
                                                    <td className="px-4 py-2 text-[10px] text-muted-foreground text-right">After Discounts (4%)</td>
                                                    <td className="px-4 py-2 text-sm font-bold text-foreground text-right">$134,256</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}

                                {/* PO Summary (visible on complete) */}
                                {poGenPhase === 'complete' && (
                                    <div className="space-y-4 animate-in fade-in duration-500">
                                        {/* Summary Grid */}
                                        <div className="grid grid-cols-4 gap-3">
                                            {[
                                                { label: 'PO Number', value: 'PO-1029', color: 'text-foreground' },
                                                { label: 'Source Quote', value: 'QT-1025', color: 'text-blue-600 dark:text-blue-400' },
                                                { label: 'Vendor', value: 'Apex Furniture', color: 'text-foreground' },
                                                { label: 'Total Value', value: '$134,256', color: 'text-green-600 dark:text-green-400' },
                                            ].map(item => (
                                                <div key={item.label} className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{item.label}</p>
                                                    <p className={`text-sm font-bold mt-1 ${item.color}`}>{item.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Compliance Stamps */}
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {['Approval Chain ✓', 'Pricing Policy ✓', 'Inventory Reserved ✓', 'Compliance Validated ✓'].map(stamp => (
                                                <span key={stamp} className="text-[10px] px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 font-medium">
                                                    {stamp}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Success */}
                                        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 flex items-center gap-3">
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-green-700 dark:text-green-300">Purchase Order PO-1029 Generated Successfully</p>
                                                <p className="text-[10px] text-green-600 dark:text-green-400 mt-0.5">5 line items mapped, 3 warranties applied, 2 discounts calculated. Ready for vendor submission.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CTA */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={nextStep}
                                        disabled={poGenPhase !== 'complete'}
                                        className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 ${
                                            poGenPhase === 'complete'
                                                ? 'bg-primary text-primary-foreground hover:opacity-90'
                                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                                        }`}
                                    >
                                        Send Notifications
                                        <ChevronRightIcon className="w-3.5 h-3.5" />
                                    </button>
                                    {poGenPhase === 'complete' && (
                                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                                            <SparklesIcon className="w-3 h-3" />
                                            NotificationAgent will deliver persona-aware digests
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transactions Timeline was a separate card here; merged into the Order Information workflow
                    (Neocon-review browser-smoke 2026-06-05). Single source of truth, less vertical space. */}

                {/* Secondary information card — metrics, workflow & references (before items list).
                    `defaultExpanded` mirrors the Generate Proforma visibility (isInboundOutbound && !isDelayedOrder)
                    so when the primary CTA is available the workflow/history is already in context. */}
                {showSource && (
                    <TransactionInfoCard
                        title="Order Information"
                        defaultExpanded={isInboundOutbound && !isDelayedOrder}
                        metrics={[
                            { label: 'Order Value', value: orderSummary.orderValue },
                            { label: 'Planned Delivery', value: plannedDelivery ?? 'Mar 20, 2026', tone: 'info' },
                            { label: 'Shipped', value: orderSummary.shipped, tone: isFlow1Order ? 'brand' : 'warning' },
                            { label: 'Line Items', value: orderSummary.lineItems },
                        ]}
                        currentStatus={{ label: orderSummary.status, tone: 'info' }}
                        workflow={{
                            label: 'History',
                            // Cross-document trace per F.11.f (Neocon-review 2026-06-05). Steps follow the actual
                            // lifecycle (PO → Ack → Production → Shipped → Delivered → Invoiced); `meta` doubles
                            // each step as a clickable cross-doc reference (date + linked id) on hover.
                            steps: [
                                { name: 'PO Received',  status: 'completed', meta: `Dec 20, 2025 · ${orderId}` },
                                { name: 'Ack Sent',     status: 'completed', meta: `Dec 21, 2025 · Planned ${plannedDelivery ?? 'Mar 20, 2026'}` },
                                { name: 'In Production', status: 'current',  meta: 'Dec 21 · Warehouse A' },
                                { name: 'Shipped',      status: 'pending',   meta: isDelayedOrder ? `Mar 12 · Delayed +${(delayInfo?.delayDays ?? 8)}d` : 'expected Dec 22' },
                                { name: 'Delivered',    status: 'pending',   meta: isDelayedOrder ? `ETA ${(delayInfo?.newEta ?? 'Mar 28, 2026')}` : 'expected Dec 24' },
                                { name: 'Invoiced',     status: 'pending',   meta: 'post-delivery' },
                            ],
                        }}
                        references={[
                            { label: 'Ship Via', value: orderSummary.shipVia },
                            { label: 'Carrier', value: orderSummary.carrier },
                            { label: 'Dealer PO', value: ORDER_META.dealerPO, mono: true },
                            { label: 'Mfr #', value: ORDER_META.manufacturerNo, mono: true },
                            { label: 'Linked Quote', value: ORDER_META.linkedQuote, mono: true },
                        ]}
                    >
                        {/* Source + traceability */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Source</span>
                            <SourceBadge source={ORDER_SOURCE} />
                            {(() => {
                                const breakdown = items.reduce<Record<string, { source: TransactionSource; count: number }>>((acc, item) => {
                                    const key = item.sourceLabel || item.source
                                    if (!acc[key]) acc[key] = { source: item.source, count: 0 }
                                    acc[key].count += 1
                                    return acc
                                }, {})
                                const entries = Object.entries(breakdown)
                                if (entries.length <= 1) return null
                                return (
                                    <Popover className="relative">
                                        <PopoverButton
                                            title="View source traceability"
                                            aria-label="View source traceability"
                                            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 rounded"
                                        >
                                            <ClockIcon className="w-3.5 h-3.5" />
                                        </PopoverButton>
                                        <PopoverPanel
                                            anchor={{ to: "bottom end", gap: 8 }}
                                            className="z-[100] bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[240px]"
                                        >
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Source Traceability</p>
                                            <ul className="space-y-1.5">
                                                {entries.map(([label, { source, count }]) => (
                                                    <li key={label} className="flex items-center justify-between gap-3 text-xs">
                                                        <SourceBadge source={source} label={label === source ? undefined : label} size="xs" />
                                                        <span className="text-muted-foreground text-[10px]">{count} {count === 1 ? 'item' : 'items'}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <p className="text-[9px] text-muted-foreground mt-2 pt-2 border-t border-border">Primary intake: <strong className="text-foreground">{ORDER_SOURCE}</strong></p>
                                        </PopoverPanel>
                                    </Popover>
                                )
                            })()}
                        </div>
                        <SalesRepChip name="David Park" role="Sales Rep" />
                        {/* CBD chip · Kenya symmetry · only when delay info carries a call-before-delivery line. */}
                        {isDelayedOrder && delayInfo?.callBeforeDelivery && (
                            <span
                                title={`Call Before Delivery · ${delayInfo.callBeforeDelivery}`}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-warning/10 border border-warning/30 text-warning text-xs font-semibold"
                            >
                                <BellAlertIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                Call Before Delivery · {delayInfo.callBeforeDelivery}
                            </span>
                        )}
                        <span
                            title={`PO revision 2 · 2026-01-20 · Cascade requested ship-date adjustment`}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-info/10 border border-info/30 text-info"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider">Revision</span>
                            <span className="text-xs font-bold tabular-nums">#&nbsp;2</span>
                        </span>
                        {/* Generate Proforma CTA · moved from Ack to PO detail per Wendy 41:16 (Neocon-review 2026-06-05).
                            Workflow: PO arrives → manufacturer issues Proforma → deposit clears → Ack is sent.
                            Lives in the header chip row so the dealer can request payment before production starts. */}
                        {isInboundOutbound && !isDelayedOrder && (
                            <button
                                type="button"
                                onClick={() => setProformaOpen(true)}
                                title="Generate Proforma · request deposit before production starts"
                                className="ml-auto inline-flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                <DocumentTextIcon className="h-4 w-4" aria-hidden="true" />
                                Generate Proforma
                            </button>
                        )}
                        {/* Delay alert CTA · primary brand button pushed to the far right of the row (rendered last + ml-auto) so it reads as a top-level action, not a chip. */}
                        {isDelayedOrder && delayInfo && (
                            <button
                                type="button"
                                onClick={() => setDelayAlertOpen(true)}
                                title={`Shipment delayed +${delayInfo.delayDays}d · ETA was ${delayInfo.originalEta}, now ${delayInfo.newEta}`}
                                className="ml-auto inline-flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                <BellAlertIcon className="h-4 w-4" aria-hidden="true" />
                                Review shipment delay alert
                            </button>
                        )}
                    </TransactionInfoCard>
                )}



                {/* Continua 1.2 — PO Generation Summary */}
                {showPOSummary && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* AI Attribution */}
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                            <div className="flex items-center gap-2">
                                <AIAgentAvatar />
                                <span className="text-xs font-bold text-green-700 dark:text-green-400">ProcurementAgent — PO Package Generated Successfully</span>
                            </div>
                            <ConfidenceScoreBadge score={98} label="Accuracy" size="md" />
                        </div>

                        {/* PO Summary Card */}
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
                            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                                        <ClipboardDocumentListIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">Purchase Order Package</h3>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">3 consolidated POs · 12 manufacturers · $3.2M total</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                                    Complete
                                </span>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Processing Steps — all complete */}
                                <div className="space-y-2">
                                    {[
                                        { label: 'Specifications analyzed', detail: '1,500 line items from project spec' },
                                        { label: 'Prices compared', detail: 'Contract vs list across 4 sources — $110K savings found' },
                                        { label: 'Business rules applied', detail: '5 rules · consolidation · volume discounts' },
                                        { label: 'Orders generated', detail: '3 consolidated POs · $3.2M · 12 manufacturers' },
                                    ].map((step, i) => (
                                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                                            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                                                <CheckIcon className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-foreground">{step.label}</p>
                                                <p className="text-[10px] text-muted-foreground">{step.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* PO Grid Summary */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { po: 'PO-2055-A', vendor: 'DIRTT Environmental', value: '$1.4M', items: 580 },
                                        { po: 'PO-2055-B', vendor: 'Steelcase', value: '$1.1M', items: 620 },
                                        { po: 'PO-2055-C', vendor: 'Herman Miller', value: '$0.7M', items: 300 },
                                    ].map((po, i) => (
                                        <div key={i} className="p-3 rounded-xl bg-muted/50 border border-border">
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block">{po.po}</span>
                                            <span className="text-sm font-bold text-foreground block mt-1">{po.vendor}</span>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs font-bold text-green-600 dark:text-green-400">{po.value}</span>
                                                <span className="text-[10px] text-muted-foreground">{po.items} items</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Expert Decision Applied */}
                                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                                    <SparklesIcon className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                                    <span className="text-[10px] text-indigo-700 dark:text-indigo-400">Expert decision applied: DIRTT 12-week lead time accepted — phased delivery schedule configured. Volume discount of $110K secured across all POs.</span>
                                </div>

                                {/* Synced Systems Badges */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] text-muted-foreground font-medium">Synced:</span>
                                    {['ERP', 'Warehouse', 'Logistics', 'Finance'].map(sys => (
                                        <span key={sys} className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] font-bold flex items-center gap-1">
                                            <CheckCircleIcon className="w-3 h-3" /> {sys}
                                        </span>
                                    ))}
                                </div>

                                {/* Next Step CTA */}
                                <button
                                    onClick={() => { nextStep(); onBack(); }}
                                    className="w-full px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg transition-all shadow-sm hover:scale-[1.01] flex items-center justify-center gap-2"
                                >
                                    Continue to Next Step
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex flex-col">
                    <TabGroup className="flex flex-col">
                        <div className="px-4 border-b border-border flex items-center justify-between bg-background">
                            <TabList className="flex gap-6">
                                <Tab
                                    className={({ selected }) =>
                                        cn(
                                            "py-4 text-sm font-medium border-b-2 outline-none transition-colors",
                                            selected
                                                ? "border-zinc-500 text-zinc-900 dark:border-primary dark:text-foreground"
                                                : "border-transparent text-muted-foreground hover:text-foreground"
                                        )
                                    }
                                >
                                    Order Items
                                </Tab>
                                <Tab
                                    className={({ selected }) =>
                                        cn(
                                            "py-4 text-sm font-medium border-b-2 outline-none transition-colors",
                                            selected
                                                ? "border-zinc-500 text-zinc-900 dark:border-primary dark:text-foreground"
                                                : "border-transparent text-muted-foreground hover:text-foreground"
                                        )
                                    }
                                >
                                    Tracking & Activity
                                </Tab>
                            </TabList>
                            {/* Quick actions cluster · icon + text · specific per transaction type */}
                            {isInboundOutbound && (
                                <div className="flex items-center gap-2">
                                    {/* W11 · write/financial actions hidden in dealer (read-only) view */}
                                    {!isDealerView && (
                                        <button
                                            type="button"
                                            onClick={() => setIsConversionOpen(true)}
                                            title="Convert order to acknowledgement"
                                            aria-label="Convert order"
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                                        >
                                            <ArrowsRightLeftIcon className="h-4 w-4" />
                                            Convert to ACK
                                        </button>
                                    )}
                                    {!isDealerView && (
                                        <button
                                            type="button"
                                            onClick={() => setArModalOpen(true)}
                                            title="AR and Deposits · production gated on deposit"
                                            aria-label="Open AR and Deposits"
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                                        >
                                            <BanknotesIcon className="h-4 w-4" />
                                            AR &amp; Deposits
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        title="Tracking timeline"
                                        aria-label="Open tracking"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                                    >
                                        <TruckIcon className="h-4 w-4" />
                                        Tracking
                                    </button>
                                </div>
                            )}
                        </div>
                        <TabPanels className="">
                            <TabPanel className="flex flex-col focus:outline-none">
                                <div className="grid grid-cols-12 gap-6 p-6">
                                    {/* Items table · full width (right panel migrated to ItemDetailsDrawer) */}
                                    <Card className="col-span-12 flex flex-col bg-card border border-border shadow-sm">
                                        {/* Search and Filter Bar */}
                                        <div className="flex items-center justify-between p-4 border-b border-border">
                                            <div className="flex-1 max-w-lg relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <Input
                                                    type="text"
                                                    placeholder="Search SKU, Product Name..."
                                                    className="w-full pl-10 pr-3 py-2 border-input rounded-md leading-5 bg-background text-foreground placeholder-muted-foreground focus:ring-primary sm:text-sm"
                                                />
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button variant="outline" className="gap-2 px-3 py-2 border-input text-sm leading-4 font-medium text-foreground bg-background hover:bg-muted">
                                                    All Materials
                                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" className="gap-2 px-3 py-2 border-input text-sm leading-4 font-medium text-foreground bg-background hover:bg-muted">
                                                    Ship Status
                                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Table */}
                                        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-0.5 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-track]:bg-transparent pb-2">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead title="Manufacturer SKU for this line">Item #</TableHead>
                                                        <TableHead title="Product name + customer tag">Description</TableHead>
                                                        <TableHead className="text-center" title="Quantity ordered on this line">Qty</TableHead>
                                                        <TableHead className="text-right" title="Unit Price (post-Neocon-review · Wendy 53:48 + 'becomes unit price'). Reflects dealer's contract discount already applied in the PO.">Unit Price</TableHead>
                                                        <TableHead className="text-right" title="Line total = Unit Price × Qty">Amount</TableHead>
                                                        <TableHead title="Current lifecycle stage of this line (10 official stages: PO received → Delivered)">Status</TableHead>
                                                        {showSource && <TableHead title="Channel Strata received this line through (Email, OCR, API, Dealer Portal, Manual, RPA)">Source</TableHead>}
                                                        <TableHead className="w-10"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {currentItems.map((item) => (
                                                        <TableRow
                                                            key={item.id}
                                                            onClick={() => { setSelectedItem(item); setItemDrawerOpen(true) }}
                                                            className={cn(
                                                                "cursor-pointer",
                                                                selectedItem.id === item.id ? "bg-muted/80" : ""
                                                            )}
                                                        >
                                                            <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-mono font-medium text-foreground">
                                                                {item.id}
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3">
                                                                {/* Single-line row · all detail moved to ItemDetailsDrawer (opens on row click) */}
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-sm text-foreground font-medium">{item.name}</span>
                                                                    {item.aiStatus && (
                                                                        <div className={cn(
                                                                            "h-2 w-2 rounded-full",
                                                                            item.aiStatus === 'warning' ? "bg-amber-500 shadow-[0_0_0_2px_rgba(245,158,11,0.2)]" : "bg-primary shadow-[0_0_0_2px_rgba(var(--primary),0.2)]"
                                                                        )} />
                                                                    )}
                                                                    {item.tag && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-muted-foreground dark:text-zinc-300 border border-zinc-200 dark:border-zinc-600">Tag {item.tag}</span>}
                                                                    {showSource && sizeForCategory(item.category) && (
                                                                        <span title={`Product size · ${formatSizeLong(sizeForCategory(item.category))}`} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border whitespace-nowrap">Size · {formatSize(sizeForCategory(item.category))}</span>
                                                                    )}
                                                                </div>
                                                                {/* Flow 3 · Chosen material (read-only · Wendy items 9 & 10) */}
                                                                {showSource && hasFabric(item.configs) && (
                                                                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                                                        {(() => { const tx = resolveTextile(item.configs, item.category, item.qtyOrd ?? item.stock ?? 1); return <TextileGradedInBadge state={tx.state} vendor={tx.vendor} tier={tx.tier} pricePerYard={tx.pricePerYard} url={tx.url} excelApproved={tx.excelApproved} baseTierPrice={tx.baseTierPrice} yardsRequired={tx.yards} /> })()}
                                                                        {(() => { const sw = swatchFor(fabricLabel(item.configs)); return sw ? <MaterialSwatch swatch={sw} size="sm" showLabel /> : <span className="text-[11px] text-muted-foreground">{fabricLabel(item.configs)}</span> })()}
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="px-3 py-3 whitespace-nowrap text-center">
                                                                <div className="text-sm font-medium text-foreground">{item.qtyOrd ?? item.stock}</div>
                                                                {(item.qtyBO ?? 0) > 0 && (
                                                                    <div
                                                                        title={`Backordered · ${item.qtyBO} unit${item.qtyBO === 1 ? '' : 's'} ordered but not yet shippable (awaiting stock/production)`}
                                                                        aria-label={`Backordered: ${item.qtyBO} units`}
                                                                        className="text-[10px] text-amber-600 dark:text-amber-400 font-medium cursor-help"
                                                                    >BO: {item.qtyBO}</div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="px-3 py-3 whitespace-nowrap text-right">
                                                                <div className="text-sm text-foreground">${(item.netPrice ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                                                {item.discPct && <div className="text-[10px] text-muted-foreground" title={`Discount applied vs list price (per dealer contract)`}>-{item.discPct}%</div>}
                                                            </TableCell>
                                                            <TableCell className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium text-foreground" title="Line total = Unit Price × Qty">
                                                                ${(item.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                            </TableCell>
                                                            <TableCell className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center gap-1 flex-wrap">
                                                                    <span title={`Lifecycle stage · ${item.status}`}>
                                                                        <Badge
                                                                            variant={
                                                                                item.status === 'Shipped' || item.status === 'Delivered' || item.status === 'Ready to ship' ? 'success' :
                                                                                    item.flag ? 'warning' :
                                                                                        'outline'
                                                                            }
                                                                        >
                                                                            {item.status}
                                                                        </Badge>
                                                                    </span>
                                                                    {item.flag && (
                                                                        <span title={
                                                                            item.flag === 'partial' ? 'Partial shipment · not all units shipped yet'
                                                                            : item.flag === 'backorder' ? 'Backorder · awaiting material'
                                                                            : item.flag === 'delayed' && item.originalEta && item.newEta && item.delayDays
                                                                                ? `Delayed · ETA was ${item.originalEta}, now ${item.newEta} (+${item.delayDays}d) · ${item.delayReason ?? ''}`
                                                                            : 'Exception · ack mismatch'
                                                                        }>
                                                                            <Badge variant="warning">
                                                                                {item.flag === 'partial' ? 'Partial'
                                                                                    : item.flag === 'backorder' ? 'Backorder'
                                                                                    : item.flag === 'delayed' ? `Delayed · ${item.delayDays ?? ''}d`
                                                                                    : 'Exception'}
                                                                            </Badge>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            {showSource && (
                                                                <TableCell className="px-4 py-4 whitespace-nowrap">
                                                                    {item.source && <SourceBadge source={item.source} size="xs" />}
                                                                </TableCell>
                                                            )}
                                                            <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setItemDrawerOpen(true) }}
                                                                    aria-label="View item details"
                                                                    title="View details"
                                                                    className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                                                >
                                                                    <EyeIcon className="h-4 w-4" />
                                                                </button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </Card>

                                </div>
                                {/* C2 · AR & Deposits moved to ARDepositsModal (open from quick action BanknotesIcon) */}
                            </TabPanel>
                            <TabPanel className="flex focus:outline-none min-h-[800px]">
                                <div className="flex flex-col min-w-0 bg-muted/10 w-full">
                                    {/* C6+D5b · 10-stage 3-phase pipeline + deposit gate (Asly N8) at the top of Tracking & Activity */}
                                    {isInboundOutbound && (
                                        <div className="px-6 pt-6 pb-4 space-y-4 border-b border-border bg-background">
                                            <OrderStagePipeline currentStage={isDelayedOrder ? 'shipped' : 'in-production'} depositReceived={true} delayDays={isDelayedOrder ? delayInfo?.delayDays : undefined} delayedStageId={isDelayedOrder ? 'shipped' : undefined} />
                                            {/* C5 · Order outbound actions · Asly N1 narrative (Send Ack + Send Shipping) */}
                                            <OrderActionsBar
                                                orderId="#ORD-2055"
                                                dealer="NorthPoint Furniture Group"
                                                project="Tech HQ Buildout"
                                                status="In production"
                                                eta="Mar 20, 2026"
                                                carrier="FedEx Freight LTL"
                                                trackingNumber="129483-AB-2055"
                                            />
                                        </div>
                                    )}
                                    {/* Chat Header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-foreground">Activity Stream</h3>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">{orderId}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Real-time updates and collaboration</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {collaborators.map((c, i) => (
                                                    <div key={i} className="relative inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                                        {c.avatar === 'AI' ? (
                                                            <div className="h-full w-full rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">AI</div>
                                                        ) : (
                                                            <img className="h-full w-full rounded-full object-cover" src={c.avatar} alt={c.name} />
                                                        )}
                                                        <span className={cn(
                                                            "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background",
                                                            c.status === 'online' ? "bg-green-400" : "bg-zinc-300"
                                                        )} />
                                                    </div>
                                                ))}
                                            </div>
                                            <Button variant="ghost" className="h-8 w-8 p-0 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                                <PlusIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Messages Area */}
                                    <div className="p-6 space-y-6">
                                        {messages.map((msg) => (
                                            <div key={msg.id} className={cn("flex gap-4 max-w-3xl", msg.type === 'user' ? "ml-auto flex-row-reverse" : "")}>
                                                <div className="flex-shrink-0">
                                                    {msg.type === 'action_processing' ? (
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
                                                            <DocumentTextIcon className="h-5 w-5 text-zinc-900 dark:text-primary" />
                                                        </div>
                                                    ) : msg.type === 'action_success' ? (
                                                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center border border-green-200 dark:border-green-800">
                                                            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                        </div>
                                                    ) : msg.avatar === 'AI' ? (
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                                                            <SparklesIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                    ) : msg.avatar ? (
                                                        <img className="h-10 w-10 rounded-full object-cover" src={msg.avatar} alt={msg.sender} />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                                            <ExclamationTriangleIcon className="h-5 w-5 text-zinc-900 dark:text-primary" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-baseline justify-between">
                                                        <span className="text-sm font-semibold text-foreground">{msg.sender}</span>
                                                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                                                    </div>

                                                    {msg.type === 'action_success' ? (
                                                        <DiscrepancyActionCard msg={msg} />
                                                    ) : (
                                                        <div className={cn(
                                                            "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                                            msg.type === 'user'
                                                                ? "bg-brand-400 text-primary-foreground rounded-tr-sm"
                                                                : "bg-card border border-border rounded-tl-sm text-foreground"
                                                        )}>
                                                            {msg.content}
                                                            {msg.type === 'action_processing' && (
                                                                <div className="mt-3 flex items-center gap-2 text-zinc-900 dark:text-primary font-medium">
                                                                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                                                    <span>Processing request...</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="sticky bottom-4 mx-4 p-4 bg-background border border-border rounded-2xl shadow-lg z-10 transition-all duration-200">
                                        <div className="flex gap-4">
                                            <div className="flex-1 relative">
                                                <Input
                                                    type="text"
                                                    placeholder="Type a message or use @ to mention..."
                                                    className="w-full pl-4 pr-12 py-3 bg-muted/50 border-0 rounded-xl text-foreground placeholder-muted-foreground focus:ring-primary transition-shadow shadow-none focus:shadow-md"
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                    <Button variant="ghost" className="h-auto w-auto p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted">
                                                        <PaperClipIcon className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button variant="primary" className="h-auto w-auto p-3 rounded-xl hover:opacity-90 transition-opacity shadow-sm bg-primary text-primary-foreground">
                                                <PaperAirplaneIcon className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Contextual Quick Actions Sidebar */}
                                <div className="w-80 border-l border-border bg-muted/30 flex flex-col h-full animate-in slide-in-from-right duration-500">
                                    <div className="p-5 border-b border-border bg-background/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Context</h3>
                                            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center border border-blue-200 dark:border-blue-500/30">
                                                <CubeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">Order Tracking</p>
                                                <p className="text-xs text-muted-foreground">4 items backordered · $25,398.72</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-5 space-y-6 overflow-y-auto">
                                        <div>
                                            <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Suggested Actions</h4>
                                            <div className="space-y-3">
                                                <Button
                                                    onClick={() => setTrackingOpen(true)}
                                                    variant="ghost"
                                                    className="w-full h-auto justify-start group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all text-left"
                                                >
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-zinc-900 dark:text-primary">
                                                        <ClipboardDocumentListIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-zinc-900 dark:group-hover:text-primary transition-colors">Track Shipment</p>
                                                        <p className="text-[10px] text-muted-foreground font-normal normal-case">View carrier tracking & ETA</p>
                                                    </div>
                                                </Button>

                                                <Button
                                                    onClick={() => setBackordersOpen(true)}
                                                    variant="ghost"
                                                    className="w-full h-auto justify-start group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-amber-500/50 hover:shadow-md transition-all text-left"
                                                >
                                                    <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors text-amber-600 dark:text-amber-400">
                                                        <ExclamationTriangleIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Check Backorders</p>
                                                        <p className="text-[10px] text-muted-foreground font-normal normal-case">4 items pending fulfillment</p>
                                                    </div>
                                                </Button>

                                                <Button
                                                    onClick={() => setIsDocumentModalOpen(true)}
                                                    variant="ghost"
                                                    className="w-full h-auto justify-start group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-indigo-500/50 hover:shadow-md transition-all text-left"
                                                >
                                                    <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors text-indigo-600 dark:text-indigo-400">
                                                        <ArrowDownTrayIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Export PDF</p>
                                                        <p className="text-[10px] text-muted-foreground font-normal normal-case">Download industry-format PDF</p>
                                                    </div>
                                                </Button>

                                                <Button
                                                    onClick={() => setContactVendorOpen(true)}
                                                    variant="ghost"
                                                    className="w-full h-auto justify-start group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-green-500/50 hover:shadow-md transition-all text-left"
                                                >
                                                    <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors text-green-600 dark:text-green-400">
                                                        <EnvelopeIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Contact Vendor</p>
                                                        <p className="text-[10px] text-muted-foreground font-normal normal-case">Email AIS about backorders</p>
                                                    </div>
                                                </Button>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Live Updates</h4>
                                            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                                                <div className="flex gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75"></span>
                                                        <div className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-zinc-900 dark:text-primary">BackorderAgent monitoring fulfillment...</p>
                                                        <p className="text-[10px] text-muted-foreground dark:text-primary/80 mt-1">Tracking 4 backordered items across 2 lines</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border-t border-border bg-muted/50">
                                        <Button variant="ghost" className="w-full h-auto py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1">
                                            View Activity Log <ArrowRightOnRectangleIcon className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </div>
            </div>

            <Transition show={isDocumentModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={setIsDocumentModalOpen}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
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
                                <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-card p-6 text-left align-middle shadow-xl transition-all border border-border">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <DialogTitle as="h3" className="text-lg font-bold leading-6 text-foreground">
                                                Order Document Preview
                                            </DialogTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Previewing Purchase Order #PO-2025-001
                                            </p>
                                        </div>
                                        <Button variant="ghost" onClick={() => setIsDocumentModalOpen(false)} className="h-auto p-1 text-muted-foreground hover:text-foreground">
                                            <XMarkIcon className="h-6 w-6" />
                                        </Button>
                                    </div>

                                    <div className="bg-white text-black p-10 rounded-lg border border-zinc-200 h-[600px] overflow-auto shadow-sm">
                                        <div className="flex justify-between items-end mb-6 pb-4 border-b-2 border-black">
                                            <h2 className="text-2xl font-bold uppercase">Purchase Order</h2>
                                            <div className="text-right">
                                                <div className="font-bold text-lg">STRATA INC.</div>
                                                <div className="text-sm">123 Innovation Dr., Tech City</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between mb-8">
                                            <div>
                                                <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">VENDOR</div>
                                                <div className="font-bold">OfficeSupplies Co.</div>
                                                <div className="text-sm">555 Supplier Lane</div>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <div className="flex justify-between w-48">
                                                    <span className="text-sm font-bold text-muted-foreground">PO #:</span>
                                                    <span className="text-sm font-bold">PO-2025-001</span>
                                                </div>
                                                <div className="flex justify-between w-48">
                                                    <span className="text-sm font-bold text-muted-foreground">DATE:</span>
                                                    <span className="text-sm">Jan 12, 2026</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <div className="flex bg-zinc-100 p-2 font-bold text-sm mb-2">
                                                <div className="flex-grow-[2]">ITEM</div>
                                                <div className="flex-1 text-right">QTY</div>
                                                <div className="flex-1 text-right">UNIT PRICE</div>
                                                <div className="flex-1 text-right">TOTAL</div>
                                            </div>
                                            <div className="flex p-2 border-b border-zinc-100">
                                                <div className="flex-grow-[2]">
                                                    <div className="font-bold text-sm">{selectedItem.name}</div>
                                                    <div className="text-xs text-muted-foreground">{selectedItem.id}</div>
                                                </div>
                                                <div className="flex-1 text-right text-sm">50</div>
                                                <div className="flex-1 text-right text-sm">$45.00</div>
                                                <div className="flex-1 text-right text-sm">$2,250.00</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <div className="w-64">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm text-muted-foreground">Subtotal:</span>
                                                    <span className="text-sm font-bold">$2,250.00</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-100">
                                                    <span className="text-lg font-bold">TOTAL:</span>
                                                    <span className="text-xl font-bold text-foreground">$2,250.00</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <Button
                                            variant="outline"
                                            className="px-4 py-2 border-transparent bg-muted hover:bg-muted/80"
                                            onClick={() => setIsDocumentModalOpen(false)}
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="px-4 py-2 border-transparent"
                                            onClick={() => { }}
                                        >
                                            Download PDF
                                        </Button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* PO → Acknowledgement conversion modal (manufacturer responds to received PO) */}
            <DocumentConversionModal
                isOpen={isConversionOpen}
                onClose={() => setIsConversionOpen(false)}
                mode="order-to-ack"
                triggerToast={triggerToast}
                preselectedDocId={orderId}
            />

            {/* Item Details · centered modal (replaces col-span-4 right panel) */}
            {isInboundOutbound && (
                <ItemDetailsDrawer
                    isOpen={itemDrawerOpen}
                    onClose={() => setItemDrawerOpen(false)}
                    item={selectedItem}
                    salesRep={{ name: 'David Park', initials: 'DP', role: 'Sales Rep' }}
                    revisionNumber={2}
                    quickActions={[
                        { icon: ArrowsRightLeftIcon, label: 'Convert to ACK', onClick: () => setIsConversionOpen(true), tone: 'primary' },
                        { icon: BanknotesIcon, label: 'AR & Deposits', onClick: () => setArModalOpen(true) },
                        { icon: TruckIcon, label: 'Tracking', onClick: () => setTrackingOpen(true) },
                    ]}
                />
            )}

            {/* AR & Deposits modal (replaces always-visible panel · quick action BanknotesIcon) */}
            {isInboundOutbound && !isDealerView && (
                <ARDepositsModal
                    isOpen={arModalOpen}
                    onClose={() => setArModalOpen(false)}
                    documentId={orderId}
                />
            )}

            {/* Suggested actions · Track Shipment → lifecycle tracking (swaps content for the delay scenario so View Tracking reuses this modal). */}
            <ManufacturerTrackingModal
                isOpen={trackingOpen}
                onClose={() => setTrackingOpen(false)}
                onBack={isDelayedOrder ? () => { setTrackingOpen(false); setDelayAlertOpen(true) } : undefined}
                title={`${orderId} · NorthPoint Furniture Group`}
                type="movement"
                {...(isDelayedOrder && delayInfo ? {
                    trackingId: 'FF884712',
                    carrier: 'FedEx Freight LTL',
                    eta: delayInfo.newEta,
                    contact: `24hr Call Before Delivery · ${delayInfo.callBeforeDelivery ?? '480-640-2818'}`,
                    note: `Original ETA was ${delayInfo.originalEta}. Shipment delayed +${delayInfo.delayDays} days due to weather hold.`,
                    steps: [
                        { id: 's1', title: 'Picked up', description: 'Grand Rapids, MI · Leland Furniture', status: 'completed' as const, timestamp: 'Mar 12, 9:00 AM', location: 'Grand Rapids, MI' },
                        { id: 's2', title: 'In transit', description: 'Heading east on I-80', status: 'completed' as const, timestamp: 'Mar 17, 11:30 AM', location: 'Chicago, IL' },
                        { id: 's3', title: 'Weather hold', description: 'I-80 corridor closure · awaiting clearance', status: 'current' as const, timestamp: 'Mar 19, 7:45 AM', location: 'Iowa City, IA' },
                        { id: 's4', title: 'Delivery', description: 'Continua IL Warehouse · CBD 24hrs', status: 'upcoming' as const, timestamp: `${delayInfo.newEta} (est.)` },
                    ],
                } : {
                    trackingId: '231125600',
                    carrier: 'Central Transport',
                    eta: 'May 28, 2025',
                    contact: 'hello@lelandfurniture.com · 616-975-9260',
                    note: "If shipped with a dedicated truck, the driver's phone number is given in place of the tracking number.",
                    steps: [
                        { id: 's1', title: 'Order Approved', status: 'completed' as const, timestamp: 'Mar 28, 9:00 AM', location: 'System' },
                        { id: 's2', title: 'In production', status: 'completed' as const, timestamp: 'May 19, 10:30 AM', location: 'Grand Rapids, MI' },
                        { id: 's3', title: 'Shipped', status: 'current' as const, timestamp: 'May 23, 4:15 PM', location: 'Central Transport · 231125600' },
                        { id: 's4', title: 'Delivered', status: 'upcoming' as const },
                    ],
                })}
            />

            {/* Suggested actions · Check Backorders → BackorderTraceCard in a modal */}
            <Transition appear show={backordersOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={() => setBackordersOpen(false)}>
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                                    <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-foreground">Backorders · {orderId}</h3>
                                        <button onClick={() => setBackordersOpen(false)} aria-label="Close" className="h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><XMarkIcon className="h-4 w-4" /></button>
                                    </div>
                                    <div className="p-5 max-h-[80vh] overflow-y-auto">
                                        <BackorderTraceCard lines={BACKORDER_LINES} orderId={orderId} />
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Suggested actions · Contact Vendor → email draft (swaps content for the delay scenario so Notify Dealer reuses this modal). */}
            <EmailDraftModal
                isOpen={contactVendorOpen}
                onClose={() => setContactVendorOpen(false)}
                onBack={isDelayedOrder ? () => { setContactVendorOpen(false); setDelayAlertOpen(true) } : undefined}
                onSent={() => triggerToast(
                    'Email sent',
                    isDelayedOrder
                        ? 'Shipment delay notice sent to NorthPoint · logged to Activity.'
                        : 'Backorder follow-up sent to AIS · logged to Activity.',
                    'success'
                )}
                draft={isDelayedOrder && delayInfo ? {
                    label: 'Shipment delay notice',
                    to: 'orders@northpoint-furniture.com · david.park@strata-mfg.com',
                    subject: `${orderId} · shipment delay notice — new ETA ${delayInfo.newEta}`,
                    body: `Hi,\n\nHeads-up that ${orderId} (NorthPoint Furniture Group · Tech HQ Buildout Phase 2) has been delayed by ${delayInfo.delayDays} days. Original ETA was ${delayInfo.originalEta}; the new ETA is ${delayInfo.newEta}.\n\nReason: ${delayInfo.reason}\n\n${delayInfo.affectedItems.length} line items are affected. Carrier (FedEx Freight LTL) is monitoring the I-80 corridor for clearance. We'll send a follow-up when the shipment resumes movement.\n\nThanks,\nStrata · Order Management`,
                } : {
                    label: 'Backorder follow-up',
                    to: 'fulfillment@ais-furniture.com · david.park@strata-mfg.com',
                    subject: `${orderId} · backorder status — 4 items pending fulfillment`,
                    body: `Hi,\n\nWe have 4 items backordered on ${orderId} (NorthPoint Furniture Group · Tech HQ Buildout). Could you confirm the current ETA per SKU and whether any can be expedited?\n\nIf there are substitutions at the same grade/price, send them over and we will route for approval.\n\nThanks,\nStrata · Order Management`,
                }}
            />

            {/* Generate Proforma modal · moved from Ack to PO detail per Wendy 41:16 (Neocon-review 2026-06-05). */}
            {isInboundOutbound && (
                <ProformaInvoiceModal
                    isOpen={proformaOpen}
                    onClose={() => setProformaOpen(false)}
                    quoteId={orderId}
                />
            )}

            {/* Floating Delay Alert modal (ORD-2056 scenario) · clones the BackorderTraceCard modal pattern. */}
            <Transition appear show={delayAlertOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={() => setDelayAlertOpen(false)}>
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                                    <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-foreground">Shipment Delay · {orderId}</h3>
                                        <button onClick={() => setDelayAlertOpen(false)} aria-label="Close" className="h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><XMarkIcon className="h-4 w-4" /></button>
                                    </div>
                                    <div className="p-5 max-h-[80vh] overflow-y-auto">
                                        {isDelayedOrder && delayInfo && (
                                            <DelayAlertCard
                                                orderId={orderId}
                                                originalEta={delayInfo.originalEta}
                                                newEta={delayInfo.newEta}
                                                delayDays={delayInfo.delayDays}
                                                reason={delayInfo.reason}
                                                affectedItems={delayInfo.affectedItems}
                                                onNotifyDealer={() => { setDelayAlertOpen(false); setContactVendorOpen(true) }}
                                                onViewTracking={() => { setDelayAlertOpen(false); setTrackingOpen(true) }}
                                            />
                                        )}
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Floating toast (success returns user to Transactions list) */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-[300] animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className={cn(
                        "rounded-xl shadow-2xl border px-4 py-3 max-w-sm",
                        toast.type === 'success' && "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-300",
                        toast.type === 'error' && "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-300",
                        toast.type === 'info' && "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-300",
                    )}>
                        <p className="text-sm font-bold">{toast.title}</p>
                        <p className="text-xs mt-1">{toast.description}</p>
                    </div>
                </div>
            )}
        </div >
    )
}




function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <button className={cn(
            "relative flex items-center justify-center h-9 px-3 rounded-full transition-all duration-300 group overflow-hidden",
            active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}>
            <span className="relative z-10">{icon}</span>
            <span className={cn(
                "ml-2 text-sm font-medium whitespace-nowrap max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out",
                active ? "max-w-xs opacity-100" : ""
            )}>
                {label}
            </span>
        </button>
    )
}
