import {
    ChevronRightIcon, MagnifyingGlassIcon, ArrowDownTrayIcon,
    PlusIcon, CheckCircleIcon, DocumentTextIcon, CubeIcon,
    ExclamationTriangleIcon, ChevronDownIcon, EllipsisHorizontalIcon, SunIcon, MoonIcon,
    XMarkIcon, HomeIcon, Squares2X2Icon, ArrowTrendingUpIcon, ClipboardDocumentListIcon,
    UserIcon, CalendarIcon, ChartBarIcon, ExclamationCircleIcon, ArrowRightOnRectangleIcon, PencilSquareIcon, EnvelopeIcon, SparklesIcon, ArrowPathIcon,
    PaperAirplaneIcon, ChatBubbleLeftRightIcon, PhotoIcon, PaperClipIcon, ClockIcon, CheckIcon, PencilIcon, DocumentChartBarIcon, ScaleIcon, TruckIcon, EyeIcon
} from '@heroicons/react/24/outline'
import { Transition, TransitionChild, Popover, PopoverButton, PopoverPanel, Tab, TabGroup, TabList, TabPanel, TabPanels, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { Fragment } from 'react'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useTheme } from 'strata-design-system'
import { useTenant } from './TenantContext'
import Navbar from './components/Navbar'
import Breadcrumbs from './components/Breadcrumbs'
import { useDemo } from '../src/context/DemoContext'
import ConfidenceScoreBadge from './components/widgets/ConfidenceScoreBadge'
import { useDemoProfile } from './context/useDemoProfile'
import SourceBadge, { type TransactionSource } from './components/inbound-outbound/SourceBadge'
import DocumentConversionModal from './components/DocumentConversionModal'
import SalesRepChip from './components/manufacturer/SalesRepChip'
import { useViewAs } from './components/manufacturer/viewAsSignal'
import CustomizedItemBadge from './components/manufacturer/CustomizedItemBadge'
import SpecsExpandRow from './components/manufacturer/SpecsExpandRow'
import QuoteComparisonModal from './components/manufacturer/QuoteComparisonModal'
import QuoteRevisionsHistory from './components/manufacturer/QuoteRevisionsHistory'
import QuoteRevisionRequestModal from './components/manufacturer/QuoteRevisionRequestModal'
import EmailDraftModal from './components/manufacturer/EmailDraftModal'
import FreightCalculatorModal from './components/manufacturer/FreightCalculatorModal'
// SampleRequestWorkflow removed from Quote per Wendy 37:45 "get rid of this" (Neocon-review 2026-06-05).
// Sample is a separate workflow (Christian 38:01) · re-introduce in V2 with passive wording "Sample Requested".
// import SampleRequestWorkflow from './components/manufacturer/SampleRequestWorkflow'
import TextileGradedInBadge from './components/manufacturer/TextileGradedInBadge'
import MaterialSwatch from './components/manufacturer/MaterialSwatch'
import { resolveTextile, hasFabric, fabricLabel, swatchFor } from './components/manufacturer/textileRef'
import { getSampleFlow, useSampleFlowVersion } from './components/manufacturer/sampleFlowSignal'
import { sizeForCategory, formatSize, formatSizeLong } from './components/manufacturer/itemSpecs'
import ItemDetailsDrawer from './components/manufacturer/ItemDetailsDrawer'
import TransactionStickyHeader from './components/transactions/TransactionStickyHeader'
import TransactionInfoCard from './components/transactions/TransactionInfoCard'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

// Parent quote QT-1025 source = 'Email' (per recentQuotes in Transactions.tsx).
// Per-item sources vary to show that a single quote can be assembled from multiple intake channels.
const QUOTE_SOURCE: TransactionSource = 'Email'

// Manufacturer-relevant metadata for QT-1025 (synced with recentQuotes in Transactions.tsx · P32)
const QUOTE_META = {
    dealer: 'Northline Furniture Group',
    endCustomer: 'Vertex Technologies',
    contract: 'GSA-28F-0015W',
    linkedPO: '#ORD-2055',
    salesRep: 'Regional Sales Manager Reyes',
    salesRepRole: 'Sales Rep',
    // W3 · Revision Number (Wendy item 2d)
    revisionNumber: 3,
    revisionDate: '2026-01-18',
    revisionReason: 'Client requested CF-6036 → CF-6021 fabric swap on lounge',
    // W4 · Discount ownership (Wendy item 2e)
    discountOwner: 'Regional Sales Manager Reyes · Sales Rep',
    discountApprovedBy: 'EVP Design · Sales Mgr',
    discountApprovedAt: '2026-01-18 11:42',
}

// Manufacturer helpers (Asly N9 + N12 + N14 narratives)
function deriveModelNumber(itemId: string, category: string): string {
    // Real catalogs use a model family code; derive a believable one from category + SKU root.
    const root = itemId.split('-')[0] || itemId.slice(0, 4)
    const fam = category.slice(0, 3).toUpperCase()
    return `${fam}-${root}`
}

function isCustomLineItem(item: { custom?: boolean }): boolean {
    // Per Kenya/Daniela: a non-standard item not in the catalog · price pending Leland.
    // Driven by the explicit `custom` flag so the chip, the hidden price and the
    // "Customized" filter all agree on the same line.
    return item.custom === true
}

function inferredExtraSpecs(category: string): Array<{ label: string; value: string }> {
    // Asly N12: specs beyond materials (size + frame + shelf + etc).
    const base: Record<string, Array<{ label: string; value: string }>> = {
        Tables: [{ label: 'Size', value: '30Dx60Wx29H' }, { label: 'Frame', value: 'Powder-coat steel' }],
        Storage: [{ label: 'Size', value: '15Wx18Dx28H' }, { label: 'Shelf', value: '1 adjustable' }],
        Worksurfaces: [{ label: 'Size', value: '30Dx72W' }, { label: 'Frame', value: 'C-leg steel' }],
        Seating: [{ label: 'Size', value: 'W34xD33xH36' }, { label: 'Frame', value: 'Hardwood' }, { label: 'Arms', value: 'Fixed' }],
        Panels: [{ label: 'Size', value: '60Hx48W' }, { label: 'Mount', value: 'Floor-to-ceiling' }],
    }
    return base[category] ?? [{ label: 'Size', value: 'see drawing' }]
}
const items: Array<{ id: string; name: string; category: string; tag: string; qtyQuoted: number; listPrice: number; discPct: number; netPrice: number; amount: number; configs: string[]; status: string; statusColor: string; aiStatus?: string; source: TransactionSource; sourceLabel?: string; custom?: boolean }> = [
    { id: "T-RCR306029HLG2", name: "TBL, REC, 30Dx60Wx29H", category: "Tables", tag: "A", qtyQuoted: 4, listPrice: 1261.00, discPct: 62.0, netPrice: 479.18, amount: 1916.72, configs: ["Finish: LG2-Loft Gray", "Edge: SE-Straight Edge"], status: "Priced", statusColor: "bg-zinc-100 text-muted-foreground", source: "Email" },
    { id: "X-BBFPFS182812", name: "CBX Full Depth BBF Ped", category: "Storage", tag: "A", qtyQuoted: 4, listPrice: 1048.00, discPct: 62.0, netPrice: 398.24, amount: 1592.96, configs: ["Finish: LG2-Loft Gray", "Lock: KA-Keyed Alike"], status: "Priced", statusColor: "bg-zinc-100 text-muted-foreground", source: "Email" },
    { id: "W-WS3072", name: "WORKSURFACE RECT 30Dx72W", category: "Worksurfaces", tag: "B", qtyQuoted: 6, listPrice: 656.00, discPct: 62.0, netPrice: 249.28, amount: 1495.68, configs: ["Finish: LG2-Loft Gray", "Edge: SE-Straight Edge"], status: "Priced", statusColor: "bg-zinc-100 text-muted-foreground", source: "Email" },
    { id: "F-SSC346030C", name: 'LB LOUNGE 2 SEAT 34"H', category: "Seating", tag: "D", qtyQuoted: 2, listPrice: 4836.00, discPct: 58.0, netPrice: 2031.12, amount: 4062.24, configs: ["Fabric: CF-6036 Ocean Blue", "Finish: LG2-Loft Gray"], status: "Needs Review", statusColor: "bg-amber-50 text-amber-700 ring-amber-600/20", aiStatus: "warning", source: "Email" },
    { id: "7730", name: "AUBURN GRAY CONFERENCE CHAIR", category: "Seating", tag: "D", qtyQuoted: 12, listPrice: 1048.00, discPct: 55.0, netPrice: 471.60, amount: 5659.20, configs: ["Fabric: GR-5505 Charcoal", "Arms: ADJ-Adjustable"], status: "Priced", statusColor: "bg-zinc-100 text-muted-foreground", source: "Email" },
    { id: "X-LTD661218L", name: "CBX Triple Door Locker", category: "Storage", tag: "E", qtyQuoted: 8, listPrice: 1836.00, discPct: 62.0, netPrice: 697.68, amount: 5581.44, configs: ["Finish: LG2-Loft Gray", "Lock: KA-Keyed Alike", "Shelf: 1-One Adjustable"], status: "Priced", statusColor: "bg-zinc-100 text-muted-foreground", source: "Email" },
    { id: "P-PN60HBF", name: "PANEL 60Hx48W FABRIC BOTH", category: "Panels", tag: "F", qtyQuoted: 10, listPrice: 892.00, discPct: 62.0, netPrice: 338.96, amount: 3389.60, configs: ["Fabric: CF-6036 Ocean Blue", "Frame: LG2-Loft Gray"], status: "Priced", statusColor: "bg-zinc-100 text-muted-foreground", source: "Email" },
    { id: "S-LATJJ2D36", name: 'LATERAL FILE 2 DRAWER 36"', category: "Storage", tag: "C", qtyQuoted: 3, listPrice: 1492.00, discPct: 62.0, netPrice: 566.96, amount: 1700.88, configs: ["Finish: LG2-Loft Gray", "Lock: KA-Keyed Alike"], status: "Priced", statusColor: "bg-zinc-100 text-muted-foreground", source: "Email" },
    // Kenya/Daniela · non-standard custom item · price needs Leland · hidden + excluded from total
    { id: "CUSTOM-RD01", name: "CUSTOM RECEPTION DESK · per client drawing", category: "Casegoods", tag: "X", qtyQuoted: 1, listPrice: 0, discPct: 0, netPrice: 0, amount: 0, configs: ["Finish: LG2-Loft Gray", "Spec: per client drawing"], status: "Needs Review", statusColor: "bg-amber-50 text-amber-700 ring-amber-600/20", custom: true, source: "Email" },
]

// Post-Neocon-review (2026-06-05) · Wendy 35:00 + 38:40 + 39:30:
// Quote shows LIST values (no discount) — "manufacturer does not state the discount".
// List subtotal = sum of (listPrice × qty) per item. Textile upcharges + freight stay
// as explicit add-ons (Wendy 36:18 endorsed textile · freight always separate).
const LIST_SUBTOTAL = items.reduce((sum, i) => sum + (i.custom ? 0 : i.listPrice * i.qtyQuoted), 0)
const textileUpchargeTotal = items
    .filter(i => hasFabric(i.configs))
    .reduce((sum, i) => sum + (resolveTextile(i.configs, i.category, i.qtyQuoted).upchargeTotal ?? 0), 0)

interface Message {
    id: number | string;
    sender: string;
    avatar: string;
    content: React.ReactNode;
    time: string;
    type: 'system' | 'ai' | 'user' | 'action_processing' | 'action_success';
}





const collaborators = [
    { name: "Regional Sales Manager Reyes", role: "Regional Sales Mgr", status: "online", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    { name: "Mike Ross", role: "Warehouse Lead", status: "offline", avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    { name: "AI Agent", role: "System Bot", status: "online", avatar: "AI" },
]

const documents = [
    { name: "Quote_Specifications_QT-1025.pdf", size: "682 KB", uploaded: "Jan 12, 2026" },
    { name: "RFQ_Source_RFQ-2026-001.pdf", size: "1.2 MB", uploaded: "Jan 09, 2026" },
]

interface DetailProps {
    onBack: () => void;
    onLogout: () => void;
    onNavigateToWorkspace: () => void;
    onNavigate?: (page: string) => void;
    /** When true, render this detail as an RFQ (Request for Quote) — inbound view. */
    isRFQ?: boolean;
}

export default function QuoteDetail({ onBack, onLogout, onNavigateToWorkspace, onNavigate, isRFQ = false }: DetailProps) {
    // RFQ vs Quote labels
    const docId = isRFQ ? 'RFQ-2026-001' : 'QT-1025'
    const docLabel = isRFQ ? 'RFQ' : 'Quote'
    const breadcrumbLabel = isRFQ ? `RFQ #${docId}` : `Quote #${docId}`
    const idBadge = isRFQ ? `#${docId}` : `#${docId}`
    // Canonical header data — single source of truth (reconciles the prior expanded/collapsed mismatch).
    const quoteSummary = {
        grossValue: '$67,240',
        netValue: '$25,398',
        avgDiscount: '60.8%',
        lineItems: '8',
        status: isRFQ ? 'Awaiting Pricing' : 'Awaiting Client',
        currentPhase: isRFQ ? 'Pricing in Progress' : 'Negotiating',
    }
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            sender: "System",
            avatar: "",
            content: isRFQ
                ? "RFQ-2026-001 received from Northline Furniture Group · 8 line items requested · Awaiting manufacturer pricing."
                : "Quote #QT-1025 created from NorthPoint RFQ #2026-001. 8 line items, Gross Value: $67,240.00, Net Value: $25,398.72.",
            time: "10 mins ago",
            type: "system",
        },
        {
            id: 3,
            sender: "System AI",
            avatar: "AI",
            content: isRFQ
                ? "PricingAgent reviewing 8 requested items against catalog · 7 items have current pricing · 1 item (F-SSC346030C lounge seating) needs custom quote. ETA for full pricing: 2 hours."
                : "QuotePricingAgent validated all 8 items. Average discount: 60.8%. Item F-SSC346030C flagged for review — lounge seating discount (58%) below standard tier (62%). Freight calculation pending Expert Review.",
            time: "9 mins ago",
            type: "ai",
        },
        {
            id: 4,
            sender: "System",
            avatar: "",
            content: isRFQ
                ? "Estimated freight: LTL rate $2,450 (Austin, TX). Pricing complete — ready to convert to outbound Quote for dealer."
                : "Freight calculated and validated by Expert Hub. LTL rate $2,450 applied (Austin, TX). Quote ready for client review.",
            time: "1 min ago",
            type: "system",
        }
    ])
    const [selectedItem, setSelectedItem] = useState(items[0])
    const [sections, setSections] = useState({
        quickActions: true,
        productOverview: true,
        lifecycle: true,
        aiSuggestions: true
    })
    const [isPOModalOpen, setIsPOModalOpen] = useState(false)
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
    const [isConversionOpen, setIsConversionOpen] = useState(false)
    const [conversionMode, setConversionMode] = useState<'quote-to-order' | 'rfq-to-quote'>(isRFQ ? 'rfq-to-quote' : 'quote-to-order')
    const [toast, setToast] = useState<{ title: string; description: string; type: 'success' | 'error' | 'info' } | null>(null)
    const triggerToast = (title: string, description: string, type: 'success' | 'error' | 'info') => {
        setToast({ title, description, type })
        setTimeout(() => setToast(null), 4000)
        if (type === 'success') {
            setTimeout(() => onBack(), 1800)
        }
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
    const { currentStep, nextStep } = useDemo()
    const { activeProfile } = useDemoProfile()
    const showSource = activeProfile.id === 'inbound-outbound'
    const isInboundOutbound = activeProfile.id === 'inbound-outbound'
    const [freightResolved, setFreightResolved] = useState(false)
    // B6 · Filter custom/standard (Asly N9) + B5 pagination state
    const [customFilter, setCustomFilter] = useState<'all' | 'custom' | 'standard'>('all')
    const [currentPage, setCurrentPage] = useState(1)
    // W11 · Dealer mirror · hide manufacturer-only actions in dealer view
    const viewAs = useViewAs()
    const isDealerView = viewAs === 'dealer'
    // W9 · Quote comparison modal (Wendy item 3 · especially dealer-relevant)
    const [compareOpen, setCompareOpen] = useState(false)
    // Wendy item 3 · "Quote Revision button" (create new revision / request revision)
    const [revisionRequestOpen, setRevisionRequestOpen] = useState(false)
    // Revisions history modal · surfaces the read-only audit so Asly can find "what changed" without hunting the Revisions tab.
    const [revisionsHistoryOpen, setRevisionsHistoryOpen] = useState(false)
    const [sendToDealerOpen, setSendToDealerOpen] = useState(false)

    // Flow 3 · Sample & Textile (Wendy items 9 & 10)
    const [highlightItemId, setHighlightItemId] = useState<string | null>(null)
    useSampleFlowVersion() // re-render when a sample flow is confirmed (reflect material changes)
    // On entering the QT-1025 quote, let the Action Center "receive" the sample-request email.
    useEffect(() => {
        if (isRFQ || !isInboundOutbound) return
        const t = setTimeout(() => window.dispatchEvent(new CustomEvent('sample-textile:arrive')), 1500)
        return () => clearTimeout(t)
    }, [isRFQ, isInboundOutbound])
    // Notification CTA focuses + highlights the fabric line item.
    useEffect(() => {
        const onFocus = (e: Event) => {
            const id = (e as CustomEvent).detail?.sku ?? 'F-SSC346030C'
            setHighlightItemId(id)
            requestAnimationFrame(() => {
                document.querySelector(`[data-quote-item="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            })
            setTimeout(() => setHighlightItemId(null), 4000)
        }
        window.addEventListener('sample-textile:focus', onFocus)
        return () => window.removeEventListener('sample-textile:focus', onFocus)
    }, [])
    // Wendy item 4 · freight line item value · initial = LTL $2,450 + surcharges (lift-gate $95 + inside-delivery $175) + fuel 24.5% ($600) = $3,320
    // Modal opens FreightCalculator to recalculate / adjust surcharges · onApply updates this state.
    const [appliedFreight, setAppliedFreight] = useState<number>(3320)
    const [freightOpen, setFreightOpen] = useState(false)
    // Item details drawer (replaces col-span-4 right panel)
    const [itemDrawerOpen, setItemDrawerOpen] = useState(false)
    const PAGE_SIZE = 6
    // Apply filter (only when isInboundOutbound) before pagination
    const filteredItems = isInboundOutbound && customFilter !== 'all'
        ? items.filter(it => customFilter === 'custom' ? isCustomLineItem(it) : !isCustomLineItem(it))
        : items
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
    const pageItems = isInboundOutbound
        ? filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
        : items

    return (
        <div className="flex flex-col min-h-screen bg-background font-sans text-foreground transition-colors duration-200">
            {/* Floating Info Navbar */}
            <Navbar onLogout={onLogout} activeTab="Inventory" onNavigateToWorkspace={onNavigateToWorkspace} onNavigate={onNavigate || (() => { })} />

            {/* Page Header (moved from original header, adjusted for floating nav) */}
            <div className={`pt-24 ${isInboundOutbound ? 'px-4' : 'px-6'} pb-4 max-w-[1600px] mx-auto w-full flex items-center justify-between border-b border-border bg-transparent transition-colors duration-200`}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <button onClick={onBack} className="p-1 hover:bg-primary hover:text-primary-foreground dark:hover:text-primary-foreground rounded-md transition-colors">
                        <ChevronRightIcon className="h-4 w-4 rotate-180" />
                    </button>
                    <Breadcrumbs
                        items={[
                            { label: 'Dashboard', onClick: onBack },
                            { label: 'Transactions', onClick: onBack },
                            { label: breadcrumbLabel, active: true }
                        ]}
                    />
                </div>
                <div className="flex items-center gap-3">
                    {!isInboundOutbound && (
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:opacity-90">
                            <PlusIcon className="h-4 w-4" /> Add New Item
                        </button>
                    )}
                </div>
            </div>

            <div className={`flex flex-col gap-6 ${isInboundOutbound ? 'p-4' : 'p-6'} max-w-[1600px] mx-auto w-full`}>
                {/* Primary sticky header — transaction id + dealer + status + phase */}
                {showSource && (
                    <TransactionStickyHeader
                        transactionId={idBadge}
                        dealer={QUOTE_META.dealer}
                        status={{ label: quoteSummary.status, tone: 'info' }}
                        currentPhase={quoteSummary.currentPhase}
                    />
                )}

                {/* AI Review Required Block */}
                {currentStep?.id === '1.5' && !freightResolved && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-500/20 rounded-xl">
                                <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-amber-800 dark:text-amber-400">Expert Action Required: Missing Freight Calculation</h3>
                                <p className="text-sm font-medium text-amber-700/80 dark:text-amber-500/80 max-w-2xl mt-1">
                                    AI extracted 125 Task Chairs from RFQ but could not calculate freight rules for delivery to Austin, TX due to non-standard building restrictions. Please input the manual LTL freight rate.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">$</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="pl-7 pr-4 py-2.5 w-full sm:w-32 text-sm font-bold bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setFreightResolved(true);
                                    setTimeout(() => nextStep(), 1500);
                                }}
                                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap"
                            >
                                Approve Corrections
                            </button>
                        </div>
                    </div>
                )}

                {freightResolved && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 flex items-center gap-4 animate-in fade-in zoom-in">
                        <div className="p-2 bg-green-500/20 rounded-full">
                            <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-green-800 dark:text-green-400">Freight Calculation Approved</h3>
                            <p className="text-xs font-medium text-green-700/80 dark:text-green-500/80 mt-0.5">Automated workflow has resumed.</p>
                        </div>
                    </div>
                )}

                {/* Secondary information card — metrics, workflow & references (before items list) */}
                {showSource && (
                    <TransactionInfoCard
                        title={isRFQ ? 'RFQ Information' : 'Quote Information'}
                        metrics={[
                            { label: 'Gross Value', value: quoteSummary.grossValue },
                            { label: 'Net Value', value: quoteSummary.netValue, tone: 'success' },
                            { label: 'Avg Discount', value: quoteSummary.avgDiscount },
                            { label: 'Line Items', value: quoteSummary.lineItems },
                        ]}
                        currentStatus={{ label: quoteSummary.status, tone: 'warning' }}
                        workflow={{
                            label: 'History',
                            // Post-Neocon-review (2026-06-05): steps + meta double as a cross-document trace.
                            // RFQ taxonomy: New → In Review → Additional Info → Sent (D.1).
                            // Quote taxonomy: In Progress → Pending → Sent → Expired (E.1.i).
                            steps: (isRFQ ? [
                                { name: 'New',                            status: 'completed', meta: 'Jan 18, 2026 · from NorthPoint' },
                                { name: 'In Review',                      status: 'completed', meta: 'Jan 18 · DP Regional Sales Manager Reyes' },
                                { name: 'Additional Information Required', status: 'completed', meta: 'Jan 19 · waiting on dealer' },
                                { name: 'Sent',                            status: 'current',   meta: `Jan 22 · QT-1025` },
                            ] : [
                                { name: 'In Progress', status: 'completed', meta: 'Jan 10 · pricing items' },
                                { name: 'Pending',     status: 'completed', meta: 'Jan 12 · textile review' },
                                { name: 'Sent',        status: 'current',   meta: 'Jan 14 · to NorthPoint' },
                                { name: 'Expired',     status: 'pending',   meta: 'Feb 12, 2026' },
                            ]) as { name: string; status: 'completed' | 'current' | 'pending'; meta?: string }[],
                        }}
                        references={[
                            { label: 'Contract', value: QUOTE_META.contract, mono: true },
                            ...(QUOTE_META.linkedPO ? [{ label: 'Linked PO', value: QUOTE_META.linkedPO, mono: true }] : []),
                            { label: 'Discount', value: `${quoteSummary.avgDiscount} · approved by ${QUOTE_META.discountApprovedBy}` },
                        ]}
                    >
                        {/* Source + traceability */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Source</span>
                            <SourceBadge source={QUOTE_SOURCE} />
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
                                            <p className="text-[9px] text-muted-foreground mt-2 pt-2 border-t border-border">Primary intake: <strong className="text-foreground">{QUOTE_SOURCE}</strong></p>
                                        </PopoverPanel>
                                    </Popover>
                                )
                            })()}
                        </div>
                        <SalesRepChip name={QUOTE_META.salesRep} role={QUOTE_META.salesRepRole} />
                        {/* Rev #N chip · clickable so Asly can review the full revision history without hunting the tab. */}
                        <button
                            type="button"
                            onClick={() => setRevisionsHistoryOpen(true)}
                            title={`Revision ${QUOTE_META.revisionNumber} · ${QUOTE_META.revisionDate} · ${QUOTE_META.revisionReason} · click to view full history`}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-info/10 border border-info/30 text-info hover:bg-info/20 transition-colors cursor-pointer"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider">Revision</span>
                            <span className="text-xs font-bold tabular-nums">#&nbsp;{QUOTE_META.revisionNumber}</span>
                        </button>
                    </TransactionInfoCard>
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
                                    {isRFQ ? 'RFQ Items' : 'Quote Items'}
                                </Tab>
                                {/* W8 · Revisions tab · Wendy item 3 · only inbound-outbound */}
                                {isInboundOutbound && (
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
                                        Revisions
                                    </Tab>
                                )}
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
                                    Activity Stream
                                </Tab>
                            </TabList>
                            {/* Quick actions at tab-bar level · icon + text · specific per transaction type */}
                            {/* Proforma moved to AckDetail per Asly feedback (proforma should follow the acknowledgment, not the quote). */}
                            {isInboundOutbound && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCompareOpen(true)}
                                        title="Compare this quote with another"
                                        aria-label="Compare quotes"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                                    >
                                        <ScaleIcon className="h-4 w-4" />
                                        Compare
                                    </button>
                                    {!isRFQ && (
                                        <button
                                            type="button"
                                            onClick={() => setRevisionRequestOpen(true)}
                                            title={isDealerView ? 'Request a quote revision' : 'Create new revision'}
                                            aria-label={isDealerView ? 'Request quote revision' : 'Create new revision'}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                                        >
                                            <PencilSquareIcon className="h-4 w-4" />
                                            {isDealerView ? 'Request Revision' : 'New Revision'}
                                        </button>
                                    )}
                                    {!isRFQ && !isDealerView && (
                                        <button
                                            type="button"
                                            onClick={() => setFreightOpen(true)}
                                            title={`Freight · auto LTL calc · current $${appliedFreight.toLocaleString()}`}
                                            aria-label="Open freight calculator"
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                                        >
                                            <TruckIcon className="h-4 w-4" />
                                            Freight
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <TabPanels className="">
                            <TabPanel className="flex flex-col focus:outline-none">
                                <div className="grid grid-cols-12 gap-6 p-6">
                                    {/* Items table · full width (right panel migrated to ItemDetailsDrawer) */}
                                    <div className="col-span-12 flex flex-col bg-card border border-border rounded-lg shadow-sm">
                                        {/* Search and Filter Bar */}
                                        <div className="flex items-center justify-between p-4 border-b border-border">
                                            <div className="flex-1 max-w-lg relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Search SKU, Product Name..."
                                                    className="block w-full pl-10 pr-3 py-2 border border-input rounded-md leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                                />
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                {/* B6 · Filter custom/standard · Asly N9 narrative */}
                                                {isInboundOutbound && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setCustomFilter(f => f === 'all' ? 'custom' : f === 'custom' ? 'standard' : 'all')}
                                                        aria-label={`Filter: ${customFilter === 'all' ? 'showing all items' : customFilter === 'custom' ? 'showing customized only' : 'showing standard only'}`}
                                                        className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md transition-colors focus:outline-none ${
                                                            customFilter === 'custom'
                                                                ? 'bg-warning/10 text-warning border-warning/40 hover:bg-warning/20'
                                                                : customFilter === 'standard'
                                                                    ? 'bg-success/10 text-success border-success/40 hover:bg-success/20'
                                                                    : 'text-foreground bg-background border-input hover:bg-muted'
                                                        }`}
                                                    >
                                                        {customFilter === 'all' ? 'All items' : customFilter === 'custom' ? 'Customized' : 'Standard'}
                                                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                                                    </button>
                                                )}
                                                <button className="inline-flex items-center px-3 py-2 border border-input shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-background hover:bg-muted focus:outline-none">
                                                    All Materials
                                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                                </button>
                                                <button className="inline-flex items-center px-3 py-2 border border-input shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-background hover:bg-muted focus:outline-none">
                                                    Price Status
                                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Table */}
                                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                                            <table className="min-w-full divide-y divide-border">
                                                <thead className="bg-muted/50">
                                                    <tr>
                                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" title={isInboundOutbound ? 'Manufacturer Part # · their catalog SKU' : 'Internal Item # · used in dealer catalog'}>{isInboundOutbound ? 'Part #' : 'Item #'}</th>
                                                        {isInboundOutbound && (
                                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" title="Manufacturer Model · family or series code (Asly N14)">Model</th>
                                                        )}
                                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" title="Product name + customer tag">Description</th>
                                                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider" title={isRFQ ? "Quantity requested on this line" : "Quantity quoted on this line"}>Qty</th>
                                                        {/* Post-Neocon-review (2026-06-05) · Wendy 27:33 + 30:56 "RFQ doesn't have pricing · very basic, don't need any of the elements".
                                                            Per-line pricing/status/source columns only on Quote view, not RFQ. */}
                                                        {!isRFQ && (
                                                            <>
                                                                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider" title="Manufacturer's published list price per unit (no discount applied at Quote stage)">List Price</th>
                                                                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider" title="Extended = List Price × Qty (line total before any dealer-side discount)">Extended</th>
                                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" title="Pricing status of this quote line (Priced, Needs Review, Awaiting Pricing)">Status</th>
                                                                {/* SOURCE column removed per Christian 28:31 "source is doc-level, not per-line" (Neocon-review 2026-06-05).
                                                                    Doc-level source still surfaces in the Quote header sub-chips. */}
                                                            </>
                                                        )}
                                                        {currentStep?.id === '1.5' && (
                                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider" title="AI confidence score · how sure the extraction agent is about this line">AI Confidence</th>
                                                        )}
                                                        <th scope="col" className="px-4 py-3 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-card divide-y divide-border">
                                                    {pageItems.map((item) => (
                                                        <tr
                                                            key={item.id}
                                                            data-quote-item={item.id}
                                                            onClick={() => { setSelectedItem(item); setItemDrawerOpen(true) }}
                                                            className={cn(
                                                                "cursor-pointer transition-colors hover:bg-muted/50",
                                                                selectedItem.id === item.id ? "bg-muted/80" : "",
                                                                highlightItemId === item.id ? "ring-2 ring-inset ring-ai bg-ai/5" : ""
                                                            )}
                                                        >
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className="text-sm font-mono font-medium text-foreground">{item.id}</span>
                                                            </td>
                                                            {/* B2 · Model column (Asly N14) */}
                                                            {isInboundOutbound && (
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <span className="text-xs font-mono text-muted-foreground">{deriveModelNumber(item.id, item.category)}</span>
                                                                </td>
                                                            )}
                                                            <td className="px-4 py-3">
                                                                {/* Single-line row · all detail moved to ItemDetailsDrawer (opens on row click) */}
                                                                <div className="text-sm font-medium text-foreground flex items-center gap-2 flex-wrap">
                                                                    {item.name}
                                                                    {item.aiStatus && (
                                                                        <div className={cn(
                                                                            "h-2 w-2 rounded-full",
                                                                            item.aiStatus === 'warning' ? "bg-warning shadow-[0_0_0_2px_rgba(245,158,11,0.2)]" : "bg-primary shadow-[0_0_0_2px_rgba(var(--primary),0.2)]"
                                                                        )} />
                                                                    )}
                                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">Tag {item.tag}</span>
                                                                    {isInboundOutbound && sizeForCategory(item.category) && (
                                                                        <span title={`Product size · ${formatSizeLong(sizeForCategory(item.category))}`} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border whitespace-nowrap">Size · {formatSize(sizeForCategory(item.category))}</span>
                                                                    )}
                                                                    {/* Kenya/Daniela · non-standard custom item · price needs Leland */}
                                                                    {isInboundOutbound && item.custom && <CustomizedItemBadge sku={item.id} />}
                                                                </div>
                                                                {/* Flow 3 · Textile validation + sample request (Wendy items 9 & 10) */}
                                                                {isInboundOutbound && hasFabric(item.configs) && (() => {
                                                                    const flow = getSampleFlow('QT-1025', item.id)
                                                                    const effLabel = flow?.substituted ? 'CF-6021 Navy' : fabricLabel(item.configs)
                                                                    const sw = swatchFor(effLabel)
                                                                    const tx = resolveTextile(flow?.substituted ? ['Fabric: CF-6021 Navy'] : item.configs, item.category, item.qtyQuoted)
                                                                    return (
                                                                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                                                            {sw && <MaterialSwatch swatch={sw} size="sm" showLabel />}
                                                                            {tx.tier !== '—' && (
                                                                                <span title={`Fabric grade · ${tx.vendor} ${tx.tier}`} className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">{tx.tier}</span>
                                                                            )}
                                                                            <TextileGradedInBadge
                                                                                state={tx.state}
                                                                                vendor={tx.vendor}
                                                                                tier={tx.tier}
                                                                                pricePerYard={tx.pricePerYard}
                                                                                url={tx.url}
                                                                                excelApproved={tx.excelApproved}
                                                                                baseTierPrice={tx.baseTierPrice}
                                                                                yardsRequired={tx.yards}
                                                                            />
                                                                            {!tx.excelApproved && (
                                                                                <span title="Textile not on the approved Excel list (v3) · route to Leland for approval before sending" className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">
                                                                                    <ExclamationTriangleIcon className="h-2.5 w-2.5" aria-hidden="true" /> Not in approved list · escalate
                                                                                </span>
                                                                            )}
                                                                            {/* Post-Neocon-review (2026-06-05) · Wendy 37:32 "totally not even related" on sample workflow.
                                                                                "Sample confirmed" chip removed; substitution still surfaces with textile-review framing. */}
                                                                            {flow?.substituted && (
                                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-info/10 text-info border border-info/20">
                                                                                    Substituted · CF-6021
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                })()}
                                                                {!isInboundOutbound && (
                                                                    <div className="text-xs text-muted-foreground mt-0.5">{item.configs.join(' · ')}</div>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 whitespace-nowrap text-center">
                                                                <div className="text-sm font-medium text-foreground">{item.qtyQuoted}</div>
                                                            </td>
                                                            {/* Per-line pricing/status/source cells only on Quote view (Wendy 27:33). */}
                                                            {!isRFQ && (<>
                                                            <td className="px-3 py-3 whitespace-nowrap text-right" title={item.custom ? 'Non-standard item · price pending Leland · excluded from total' : 'List Price · manufacturer published unit price (no discount at Quote stage).'}>
                                                                {item.custom ? (
                                                                    <>
                                                                        <div className="text-sm font-medium text-warning">Quote on request</div>
                                                                        <div className="text-[10px] text-muted-foreground">call Leland</div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {/* Post-Neocon-review (2026-06-05) · Wendy 39:30 "the manufacturer does not state the discount".
                                                                            Quote shows LIST PRICE only; discount + ✓ Approved chip removed (those live on PO/Ack/Order
                                                                            where the dealer's contract discount is already applied per F.15.l). */}
                                                                        <div className="text-sm text-foreground">${item.listPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                                                        {/* Wendy item 10 · textile upcharge surfaced on the line (was popover-only) */}
                                                                        {isInboundOutbound && hasFabric(item.configs) && (() => {
                                                                            const tx = resolveTextile(item.configs, item.category, item.qtyQuoted)
                                                                            if (!tx.upchargeTotal) return null
                                                                            return (
                                                                                <div
                                                                                    title={`Textile upcharge · ${tx.tier} · ${tx.yards} yd × +$${tx.upchargePerYd?.toFixed(2)}/yd over base $${tx.baseTierPrice.toFixed(2)}/yd`}
                                                                                    className="text-[10px] font-medium text-warning mt-0.5 cursor-help"
                                                                                >
                                                                                    + Textile upcharge · {tx.yards} yd · +${tx.upchargeTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                                                </div>
                                                                            )
                                                                        })()}
                                                                    </>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium text-foreground" title={item.custom ? 'Pending price · excluded from total' : 'Extended = List Price × Qty (pre-discount)'}>
                                                                {/* Extended = List × Qty (Wendy 38:40 "this could be extended list"). Was item.amount which was net × qty. */}
                                                                {item.custom ? <span className="text-muted-foreground">—</span> : `$${(item.listPrice * item.qtyQuoted).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span
                                                                    title={item.status === 'Priced' ? 'Line priced and ready to send' : 'Line needs review before quote can be sent'}
                                                                    className={cn(
                                                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-help",
                                                                        item.status === 'Priced' ? "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-card dark:text-zinc-200 dark:border-zinc-700" :
                                                                            "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800"
                                                                    )}>
                                                                    {item.status}
                                                                </span>
                                                            </td>
                                                            {/* Source cell removed per Christian 28:31 (doc-level only). */}
                                                            </>)}
                                                            {currentStep?.id === '1.5' && (
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <ConfidenceScoreBadge score={95} label="Product" size="sm" />
                                                                </td>
                                                            )}
                                                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    {/* Post-Neocon-review (2026-06-05) · Wendy 37:45 "get rid of this" on Quote details.
                                                                        Sample workflow OUT of V1 demo (separate workflow per Christian 38:01 + Wendy 38:31 "100% agree").
                                                                        Re-introduce in V2 with passive wording "Sample Requested" per Christian 38:01. */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setItemDrawerOpen(true) }}
                                                                        aria-label="View item details"
                                                                        title="View details"
                                                                        className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                                                    >
                                                                        <EyeIcon className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {/* W10 · Wendy item 4 · Freight line item · only on last page · auto-applied by FreightCalculator below */}
                                                    {isInboundOutbound && appliedFreight > 0 && currentPage === totalPages && (
                                                        <tr className="bg-info/5 border-t-2 border-info/20">
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <TruckIcon className="h-4 w-4 text-info" aria-hidden="true" />
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className="text-sm font-mono font-medium text-foreground">FREIGHT-LTL</span>
                                                            </td>
                                                            {isInboundOutbound && (
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <span className="text-xs font-mono text-muted-foreground">Zone 4 · TX</span>
                                                                </td>
                                                            )}
                                                            <td className="px-4 py-3">
                                                                <div>
                                                                    <div className="text-sm font-medium text-foreground flex items-center gap-2 flex-wrap">
                                                                        Freight (LTL)
                                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-info/10 text-info border border-info/20">
                                                                            Auto-calc
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground mt-0.5">Austin, TX 78701 · 1,820 lbs · 6 pallets · fuel 24.5%</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-3 whitespace-nowrap text-center">
                                                                <div className="text-sm font-medium text-foreground">1</div>
                                                            </td>
                                                            <td className="px-3 py-3 whitespace-nowrap text-right">
                                                                <div className="text-sm text-foreground">${appliedFreight.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                                                <div className="text-[10px] text-muted-foreground">no discount</div>
                                                            </td>
                                                            <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium text-foreground">
                                                                ${appliedFreight.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-info/10 text-info border-info/20">
                                                                    Applied
                                                                </span>
                                                            </td>
                                                            {showSource && (
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <span className="text-[10px] text-muted-foreground italic">Carrier API</span>
                                                                </td>
                                                            )}
                                                            {currentStep?.id === '1.5' && (
                                                                <td className="px-4 py-3 whitespace-nowrap" />
                                                            )}
                                                            <td className="px-4 py-3 whitespace-nowrap" />
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* B5 · Pagination · Asly N12 narrative (large line-item lists) */}
                                        {isInboundOutbound && (
                                            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                                                <div className="text-[11px] text-muted-foreground">
                                                    Showing <span className="font-medium text-foreground">{(currentPage - 1) * PAGE_SIZE + 1}</span>
                                                    {'–'}
                                                    <span className="font-medium text-foreground">{Math.min(currentPage * PAGE_SIZE, filteredItems.length)}</span>
                                                    {' of '}
                                                    <span className="font-medium text-foreground">{filteredItems.length}</span>
                                                    {customFilter !== 'all' && (
                                                        <span className="ml-1 italic">({customFilter})</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage === 1}
                                                        aria-label="Previous page"
                                                        className="h-7 px-2.5 rounded-md border border-border bg-card text-foreground text-[11px] font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        Prev
                                                    </button>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        Page <span className="font-medium text-foreground">{currentPage}</span> of <span className="font-medium text-foreground">{totalPages}</span>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                        disabled={currentPage === totalPages}
                                                        aria-label="Next page"
                                                        className="h-7 px-2.5 rounded-md border border-border bg-card text-foreground text-[11px] font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* W10 · Freight calculator · Wendy item 4 · moved to quick action at tab-bar level · row above shows applied freight */}

                                        {/* Wendy item 10 · Pricing breakdown — reconciles textile upcharges + freight end-to-end */}
                                        {isInboundOutbound && (
                                            <div className="px-4 py-3 border-t border-border bg-muted/10">
                                                <div className="ml-auto w-full max-w-xs">
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Pricing breakdown</div>
                                                    <dl className="space-y-1 text-xs">
                                                        <div className="flex items-center justify-between">
                                                            <dt className="text-muted-foreground">List subtotal</dt>
                                                            <dd className="tabular-nums text-foreground">${LIST_SUBTOTAL.toLocaleString('en-US', { minimumFractionDigits: 2 })}</dd>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <dt className="text-muted-foreground">Textile upcharges</dt>
                                                            <dd className="tabular-nums text-warning">+${textileUpchargeTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</dd>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <dt className="text-muted-foreground">Freight (LTL)</dt>
                                                            <dd className="tabular-nums text-foreground">+${appliedFreight.toLocaleString('en-US', { minimumFractionDigits: 2 })}</dd>
                                                        </div>
                                                        <div className="flex items-center justify-between border-t border-border pt-1 mt-1">
                                                            <dt className="font-bold text-foreground">Quote total</dt>
                                                            <dd className="tabular-nums font-bold text-foreground">${(LIST_SUBTOTAL + textileUpchargeTotal + appliedFreight).toLocaleString('en-US', { minimumFractionDigits: 2 })}</dd>
                                                        </div>
                                                    </dl>
                                                    {items.filter(i => i.custom).length > 0 && (
                                                        <div className="flex items-center justify-between mt-1.5 text-[11px] text-warning">
                                                            <span className="inline-flex items-center gap-1">
                                                                <ExclamationTriangleIcon className="h-3 w-3" aria-hidden="true" />
                                                                {items.filter(i => i.custom).length} custom item{items.filter(i => i.custom).length === 1 ? '' : 's'} pending price
                                                            </span>
                                                            <span className="text-muted-foreground">excluded · call Leland</span>
                                                        </div>
                                                    )}
                                                    <p className="text-[10px] text-muted-foreground italic mt-1.5">List Subtotal reflects manufacturer list price (no discount at Quote stage · Wendy 39:30); textile upcharges &amp; freight are add-ons · custom items are quoted separately.</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* AI Correction Cards — Step 1.5 */}
                                        {currentStep?.id === '1.5' && (
                                            <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">AI Suggested Corrections</h4>

                                                {/* Correction 1: Freight */}
                                                <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                                                            <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-foreground">Freight Rate</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-muted-foreground line-through">$0.00</span>
                                                                <ChevronRightIcon className="w-3 h-3 text-muted-foreground" />
                                                                <span className="text-xs font-medium text-foreground">$2,450.00 (LTL Austin)</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <ConfidenceScoreBadge score={42} label="Freight" size="sm" />
                                                        <button className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-lg transition-colors">Accept</button>
                                                        <button className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-[10px] font-medium rounded-lg transition-colors">Reject</button>
                                                    </div>
                                                </div>

                                                {/* Correction 2: Quantity */}
                                                <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                                                            <SparklesIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-foreground">Quantity (Task Chair)</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-muted-foreground">200 (RFQ stated)</span>
                                                                <ChevronRightIcon className="w-3 h-3 text-muted-foreground" />
                                                                <span className="text-xs font-medium text-foreground">125 (AI verified from attachment)</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <ConfidenceScoreBadge score={88} label="Qty" size="sm" />
                                                        <button className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-lg transition-colors">Accept</button>
                                                        <button className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-[10px] font-medium rounded-lg transition-colors">Reject</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </TabPanel>
                            {/* W8 · Revisions tab content · Wendy item 3 */}
                            {isInboundOutbound && (
                                <TabPanel className="flex flex-col focus:outline-none">
                                    <div className="p-6">
                                        <QuoteRevisionsHistory />
                                    </div>
                                </TabPanel>
                            )}
                            <TabPanel className="flex focus:outline-none min-h-[800px]">
                                <div className="flex flex-col min-w-0 bg-muted/10 w-full">
                                    {/* Chat Header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-foreground">Activity Stream</h3>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">{idBadge}</span>
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
                                            <button className="h-8 w-8 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                                <PlusIcon className="h-4 w-4" />
                                            </button>
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
                                                        <div className="p-4 rounded-2xl text-sm leading-relaxed shadow-sm bg-green-50 text-green-700 border border-green-200">
                                                            {msg.content}
                                                        </div>
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
                                                <input
                                                    type="text"
                                                    placeholder="Type a message or use @ to mention..."
                                                    className="w-full pl-4 pr-12 py-3 bg-muted/50 border-0 rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary transition-shadow"
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                    <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted">
                                                        <PaperClipIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <button className="p-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm">
                                                <PaperAirplaneIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Contextual Quick Actions Sidebar */}
                                <div className="w-80 border-l border-border bg-muted/30 flex flex-col h-full animate-in slide-in-from-right duration-500">
                                    <div className="p-5 border-b border-border bg-background/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Context</h3>
                                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center border border-green-200 dark:border-green-500/30">
                                                <DocumentTextIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{isRFQ ? 'RFQ Review' : 'Quote Preparation'}</p>
                                                <p className="text-xs text-muted-foreground">{isRFQ ? 'Awaiting Pricing' : 'Awaiting Client'} · $25,398.72</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-5 space-y-6 overflow-y-auto">
                                        <div>
                                            <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Suggested Actions</h4>
                                            <div className="space-y-3">
                                                <button onClick={() => {
                                                    setConversionMode(isRFQ ? 'rfq-to-quote' : 'quote-to-order')
                                                    setIsConversionOpen(true)
                                                }} className="w-full group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all text-left">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-zinc-900 dark:text-primary">
                                                        <DocumentChartBarIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-zinc-900 dark:group-hover:text-primary transition-colors">{isRFQ ? 'Convert to Quote' : 'Generate PO'}</p>
                                                        <p className="text-[10px] text-muted-foreground">{isRFQ ? 'Transform RFQ into a priced quote' : 'Convert quote to purchase order'}</p>
                                                    </div>
                                                </button>

                                                <button onClick={() => setRevisionRequestOpen(true)} className="w-full group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-amber-500/50 hover:shadow-md transition-all text-left">
                                                    <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors text-amber-600 dark:text-amber-400">
                                                        <PencilIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Revise Pricing</p>
                                                        <p className="text-[10px] text-muted-foreground">Adjust discounts & margins</p>
                                                    </div>
                                                </button>

                                                <button onClick={() => setSendToDealerOpen(true)} className="w-full group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-green-500/50 hover:shadow-md transition-all text-left">
                                                    <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors text-green-600 dark:text-green-400">
                                                        <EnvelopeIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{isRFQ ? 'Acknowledge to Dealer' : 'Send to Dealer'}</p>
                                                        <p className="text-[10px] text-muted-foreground">{isRFQ ? 'Email RFQ acknowledgement to dealer' : 'Email quote for approval'}</p>
                                                    </div>
                                                </button>

                                                <button onClick={() => setIsDocumentModalOpen(true)} className="w-full group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-indigo-500/50 hover:shadow-md transition-all text-left">
                                                    <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors text-indigo-600 dark:text-indigo-400">
                                                        <ArrowDownTrayIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Export PDF</p>
                                                        <p className="text-[10px] text-muted-foreground">Download industry-format PDF</p>
                                                    </div>
                                                </button>
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
                                                        <p className="text-xs font-medium text-zinc-900 dark:text-primary">{isRFQ ? 'PricingAgent computing list-price estimates...' : 'QuotePricingAgent validating margins...'}</p>
                                                        <p className="text-[10px] text-muted-foreground dark:text-primary/80 mt-1">Gross $67,240 → Net $25,398 (avg 60.8% disc)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border-t border-border bg-muted/50">
                                        <button className="w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1">
                                            View Activity Log <ArrowRightOnRectangleIcon className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </TabPanel >
                        </TabPanels >
                    </TabGroup >
                </div >
            </div >

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
                                                Previewing Purchase Order #PO-1029
                                            </p>
                                        </div>
                                        <button onClick={() => setIsDocumentModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="bg-white text-black p-10 rounded-lg border border-zinc-200 h-[600px] overflow-auto shadow-sm">
                                        <div className="flex justify-between items-end mb-6 pb-4 border-b-2 border-black">
                                            <h2 className="text-2xl font-bold uppercase">Purchase Order</h2>
                                            <div className="text-right">
                                                <div className="font-bold text-lg">APEX FURNITURE</div>
                                                <div className="text-sm">PROCUREMENT DIVISION</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between mb-8">
                                            <div>
                                                <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">VENDOR</div>
                                                <div className="font-bold">Strata Inc.</div>
                                                <div className="text-sm">123 Innovation Dr., Tech City</div>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <div className="flex justify-between w-48">
                                                    <span className="text-sm font-bold text-muted-foreground">PO #:</span>
                                                    <span className="text-sm font-bold">PO-1029</span>
                                                </div>
                                                <div className="flex justify-between w-48">
                                                    <span className="text-sm font-bold text-muted-foreground">DATE:</span>
                                                    <span className="text-sm">Oct 24, 2024</span>
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
                                                <div className="flex-1 text-right text-sm">125</div>
                                                <div className="flex-1 text-right text-sm">$350.00</div>
                                                <div className="flex-1 text-right text-sm">$43,750.00</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <div className="w-64">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm text-muted-foreground">Subtotal:</span>
                                                    <span className="text-sm font-bold">$43,750.00</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-100">
                                                    <span className="text-lg font-bold">TOTAL:</span>
                                                    <span className="text-xl font-bold text-foreground">$43,750.00</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-lg border border-transparent bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 focus:outline-none"
                                            onClick={() => setIsDocumentModalOpen(false)}
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-lg border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 focus:outline-none"
                                            onClick={() => { }}
                                        >
                                            Download PDF
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Document conversion modal (RFQ → Quote · Quote → PO) — wired from Action Required + Suggested Actions */}
            <DocumentConversionModal
                isOpen={isConversionOpen}
                onClose={() => setIsConversionOpen(false)}
                mode={conversionMode}
                triggerToast={triggerToast}
                preselectedDocId={docId}
            />

            {/* Proforma modal moved to AckDetail (Asly feedback 2026-06-05). */}

            {/* Revisions history modal · opened from the Rev #N chip in the Acknowledgement Information row. */}
            <Transition appear show={revisionsHistoryOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={() => setRevisionsHistoryOpen(false)}>
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="w-full max-w-3xl rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                                    <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-foreground">Quote Revisions · {docId}</h3>
                                        <button onClick={() => setRevisionsHistoryOpen(false)} aria-label="Close" className="h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><XMarkIcon className="h-4 w-4" /></button>
                                    </div>
                                    <div className="p-5 max-h-[80vh] overflow-y-auto">
                                        <QuoteRevisionsHistory />
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* W9 · Quote comparison modal (Wendy item 3 · especially dealer-relevant) */}
            {isInboundOutbound && (
                <QuoteComparisonModal
                    isOpen={compareOpen}
                    onClose={() => setCompareOpen(false)}
                />
            )}

            {/* Wendy item 3 · Quote Revision Request modal (manufacturer creates · dealer requests) */}
            {isInboundOutbound && (
                <QuoteRevisionRequestModal
                    isOpen={revisionRequestOpen}
                    onClose={() => setRevisionRequestOpen(false)}
                    quoteId={docId}
                    currentRevision={QUOTE_META.revisionNumber}
                />
            )}

            {/* Suggested actions · Send to Dealer → email draft */}
            <EmailDraftModal
                isOpen={sendToDealerOpen}
                onClose={() => setSendToDealerOpen(false)}
                draft={{
                    label: isRFQ ? 'RFQ acknowledgement' : 'Quote for approval',
                    to: 'orders@northpoint-furniture.com · david.park@strata-mfg.com',
                    subject: `${docId} · ${isRFQ ? 'RFQ received — pricing in progress' : 'Quote ready for your approval'}`,
                    body: isRFQ
                        ? `Hi,\n\nWe received RFQ ${docId} (Northline Furniture Group). Our team is pricing the line items now and you will have the quote shortly.\n\nReply here with any spec changes in the meantime.\n\nBest,\nStrata · Sales`
                        // Post-Neocon-review (2026-06-05) · Wendy PDF item 6: removed "Approve here and we will convert it
                        // to a PO and request the production deposit" line — the manufacturer doesn't issue the PO; the
                        // dealer sends the PO upon acceptance. Proforma + deposit live on PO detail (per Wendy 41:16).
                        : `Hi,\n\nQuote ${docId} for Northline Furniture Group is ready for your review (List $67,240.00, contract GSA-28F-0015W). The PDF is attached.\n\nLet us know if you have any questions before ${'expiration'}.\n\nBest,\nStrata · Sales`,
                }}
            />

            {/* Wendy item 4 · Freight calculator modal (quick action · auto-applies to freight row in table) */}
            {isInboundOutbound && (
                <FreightCalculatorModal
                    isOpen={freightOpen}
                    onClose={() => setFreightOpen(false)}
                    onApply={setAppliedFreight}
                    quoteId={docId}
                />
            )}

            {/* Item Details · centered modal (replaces col-span-4 right panel) */}
            {isInboundOutbound && (
                <ItemDetailsDrawer
                    isOpen={itemDrawerOpen}
                    onClose={() => setItemDrawerOpen(false)}
                    item={selectedItem}
                    salesRep={{ name: 'Regional Sales Manager Reyes', initials: 'DP', role: 'Sales Rep' }}
                    revisionNumber={QUOTE_META.revisionNumber}
                    quickActions={[
                        // Generate Proforma moved to AckDetail (Asly feedback 2026-06-05).
                        { icon: ScaleIcon, label: 'Compare quotes', onClick: () => setCompareOpen(true) },
                        ...(!isRFQ ? [{ icon: PencilSquareIcon, label: isDealerView ? 'Request revision' : 'New revision', onClick: () => setRevisionRequestOpen(true) }] : []),
                        ...(!isRFQ && !isDealerView ? [{ icon: TruckIcon, label: 'Freight calc', onClick: () => setFreightOpen(true) }] : []),
                    ]}
                />
            )}

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
