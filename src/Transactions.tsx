import { Menu, MenuButton, MenuItem, MenuItems, Dialog, DialogPanel, Transition, TransitionChild, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { Fragment } from 'react'
import {
    HomeIcon, CubeIcon, ClipboardDocumentListIcon, TruckIcon,
    ArrowRightOnRectangleIcon, MagnifyingGlassIcon, BellIcon, CalendarIcon,
    CurrencyDollarIcon, ChartBarIcon, ArrowTrendingUpIcon, ExclamationCircleIcon,
    PlusIcon, DocumentDuplicateIcon, DocumentTextIcon, EnvelopeIcon, Squares2X2Icon,
    EllipsisHorizontalIcon, ListBulletIcon, SunIcon, MoonIcon,
    ChevronDownIcon, ChevronRightIcon, ChevronUpIcon, EyeIcon, PencilIcon, TrashIcon,
    CheckIcon, MapPinIcon, UserIcon, ClockIcon, ShoppingBagIcon, ExclamationTriangleIcon, PencilSquareIcon, CheckCircleIcon,
    ShoppingCartIcon, ClipboardDocumentCheckIcon, WrenchScrewdriverIcon, ChevronLeftIcon, CloudArrowUpIcon, DocumentPlusIcon,
    FunnelIcon, ArrowRightIcon, SparklesIcon, CheckBadgeIcon, ArrowDownTrayIcon, ArrowsRightLeftIcon, DocumentMagnifyingGlassIcon,
    ArrowPathIcon, ShieldCheckIcon, BellAlertIcon
} from '@heroicons/react/24/outline'
import { useState, useMemo, useEffect, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

import { useTheme } from 'strata-design-system'
import { useTenant } from './TenantContext'
import Select from './components/Select'
import CreateOrderModal from './components/CreateOrderModal'
import SmartQuoteHub from './components/widgets/SmartQuoteHub'
import BatchAckModal from './components/BatchAckModal'
import Breadcrumbs from './components/Breadcrumbs'
import PEDExportModal, { getMockPEDData, type PEDData, type PEDDocumentType } from './components/PEDExportModal'
import DocumentConversionModal from './components/DocumentConversionModal'
import AckReconciliationModal from './components/AckReconciliationModal'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useDemo } from './context/DemoContext'
import { useDemoProfile } from './context/useDemoProfile'
import { AIAgentAvatar } from './components/simulations/DemoAvatars'
import { CONTINUA_STEP_TIMING } from './config/profiles/continua-demo'
import SourceBadge from './components/inbound-outbound/SourceBadge'
import InboxMonitor from './components/inbound-outbound/InboxMonitorWidget'
import ManualUploadModal from './components/inbound-outbound/ManualUploadModal'
import { ShippingContent } from './Shipping'
import EmailDraftModal, { type EmailDraft } from './components/manufacturer/EmailDraftModal'
import { Mail } from 'lucide-react'
import ManufacturerTrackingModal, { type TrackingStep as ManufacturerTrackingStep } from './components/manufacturer/TrackingModal'
import OCRPipeline, { type OCRCard } from './components/manufacturer/OCRPipeline'
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

// ═══════════════════════════════════════════════════
// CONTINUA STEP 2.2 — Purchase Order Generation
// ═══════════════════════════════════════════════════


type ProcurementPhase = 'idle' | 'notification' | 'expert-question' | 'highlight' | 'lupa-active' | 'po-generated'

// ─── Step 3.3: PO→ACK Conversion ──────────────────────────────────────────────
type ConversionPhase = 'idle' | 'notification' | 'review' | 'price-check' | 'ready' | 'converted'

const CONVERSION_CHECKLIST = [
    { label: 'Contract Compliance', detail: '12/12 manufacturers verified against master agreements', status: 'pass' as const },
    { label: 'Quantity Matching', detail: 'All line items match PO quantities — 1,500 items confirmed', status: 'pass' as const },
    { label: 'Delivery Schedule', detail: '9 on-time, 3 with lead time adjustments (DIRTT: 12 weeks)', status: 'warning' as const },
    { label: 'Pricing Reconciliation', detail: 'Pending price verification against manufacturer catalogs...', status: 'pending' as const },
]

// ─── Step 3.4: Approval Chain ─────────────────────────────────────────────────
type ApprovalChainPhase = 'idle' | 'notification' | 'chain' | 'done'

const CONVERSION_APPROVAL_STEPS = [
    { id: 'ai' as const, role: 'AI Compliance Agent', detail: 'Validating PO-ACK data integrity, pricing compliance, contract terms...', status: 'pending' as const },
    { id: 'expert' as const, role: 'Expert — Regional Sales Manager Reyes', detail: 'Reviewing manufacturer confirmations, lead times, volume discounts...', status: 'pending' as const },
    { id: 'dealer' as const, role: 'Dealer — Account Manager Kai', detail: 'Final approval: PO-to-ACK conversion for $3.2M project package', status: 'pending' as const },
]

// ─── PO Review Data (Step 3.2 sub-phases) ─────────────────────────────────────
const PO_LINE_ITEMS = [
    { manufacturer: 'MillerKnoll', items: '680 task chairs, 45 conference tables', poAmount: '$2.8M', catalogPrice: '$3.1M', contractPrice: '$2.8M', savings: '$300K', status: 'verified' as const },
    { manufacturer: 'DIRTT Environmental', items: 'Architectural walls — Floor 5', poAmount: '$120K', catalogPrice: '$142K', contractPrice: '$120K', savings: '$22K', status: 'lead-time' as const },
    { manufacturer: 'AV Integration Partners', items: 'AV systems, 40 conference rooms', poAmount: '$280K', catalogPrice: '$310K', contractPrice: '$280K', savings: '$30K', status: 'verified' as const },
]

const PRICE_CHECKS = [
    { source: 'Contract Database', match: 12, mismatch: 0, status: 'pass' as const },
    { source: 'Manufacturer List Price', match: 10, mismatch: 2, status: 'warning' as const },
    { source: 'Volume Discount Engine', match: 11, mismatch: 1, status: 'pass' as const },
    { source: 'Historical Purchase Data', match: 12, mismatch: 0, status: 'pass' as const },
]

// ─── Continua Step 1.5: Consignment & Vendor Returns Constants ──────────────
const CONSIGNMENT_AGENTS = [
    { name: 'ConsignmentTracker', detail: 'Reviewing 35 consignment items across 4 manufacturers...' },
    { name: 'WindowAnalyzer', detail: '12 items approaching 90-day return window...' },
    { name: 'RMAGenerator', detail: 'Auto-generating RMA for 4 confirmed returns...' },
    { name: 'DemandAnalyzer', detail: 'Analyzing demand trends — 4 items trending up 12%...' },
    { name: 'DecisionRouter', detail: 'Routing recommendations: return vs convert-to-purchase...' },
]
const CONSIGNMENT_ITEMS = [
    { name: 'Aeron Chair (Mineral)', manufacturer: 'MillerKnoll', daysLeft: 8, qty: 4, value: '$3,580', decision: 'return' as const, reason: 'Low demand, surplus stock' },
    { name: 'Embody Chair (Black)', manufacturer: 'MillerKnoll', daysLeft: 12, qty: 2, value: '$3,190', decision: 'return' as const, reason: 'Duplicate allocation' },
    { name: 'Cosm Chair (Glacier)', manufacturer: 'MillerKnoll', daysLeft: 18, qty: 1, value: '$1,295', decision: 'return' as const, reason: 'Color mismatch for project' },
    { name: 'Sayl Chair (Fog)', manufacturer: 'MillerKnoll', daysLeft: 22, qty: 1, value: '$695', decision: 'return' as const, reason: 'Superseded by spec change' },
    { name: 'Gesture Chair (Graphite)', manufacturer: 'Steelcase', daysLeft: 15, qty: 2, value: '$2,190', decision: 'purchase' as const, reason: 'Demand trending up 18%' },
    { name: 'Think Chair (Licorice)', manufacturer: 'Steelcase', daysLeft: 25, qty: 1, value: '$1,095', decision: 'purchase' as const, reason: 'Spec match for UAL phase 3' },
    { name: 'Diffrient World', manufacturer: 'Humanscale', daysLeft: 30, qty: 3, value: '$2,685', decision: 'purchase' as const, reason: 'Demand up 12%, pipeline match' },
    { name: 'Freedom Chair (Graphite)', manufacturer: 'Humanscale', daysLeft: 45, qty: 1, value: '$1,295', decision: 'purchase' as const, reason: 'Client request — UAL exec suite' },
]
type ConsignmentPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results'

// ─── Projects Tab: Orders nested by project ────────────────────────────────────
const DEMO_PROJECTS = [
    {
        id: 'PRJ-2026-001',
        name: 'United Airlines HQ — 8 Floor Buildout',
        client: 'United Airlines',
        pm: 'Sarah Mitchell',
        fm: 'Facilities Coord Cardo',
        status: 'In Progress' as const,
        totalBudget: '$3.2M',
        spent: '$2.1M',
        completion: 65,
        orders: [
            { id: 'PO-HQ-001', supplier: 'MillerKnoll', amount: '$2.8M', status: 'In production', deliveryDate: 'Mar 15', progress: 70 },
            { id: 'PO-HQ-002', supplier: 'DIRTT Environmental', amount: '$120K', status: 'PO received', deliveryDate: 'Apr 20', progress: 15 },
            { id: 'PO-HQ-003', supplier: 'AV Integration Partners', amount: '$280K', status: 'Shipped', deliveryDate: 'Feb 28', progress: 90 },
        ],
        milestones: [
            { name: 'Floors 1-2 Furniture', date: 'Mar 1', status: 'completed' as const },
            { name: 'Floors 3-4 Delivery', date: 'Mar 15', status: 'in-progress' as const },
            { name: 'AV Integration', date: 'Apr 1', status: 'pending' as const },
            { name: 'Final Punch List', date: 'Apr 15', status: 'pending' as const },
        ],
        fmActions: [
            { action: 'Approve furniture relocation — Floor 3', priority: 'high' as const },
            { action: 'Review space allocation changes', priority: 'medium' as const },
            { action: 'Schedule existing AV maintenance', priority: 'low' as const },
        ]
    },
    {
        id: 'PRJ-2026-002',
        name: 'Apex Furniture — New HQ Fitout',
        client: 'Apex Furniture',
        pm: 'Strata PM Beta',
        fm: 'Facilities Coord Cardo',
        status: 'Planning' as const,
        totalBudget: '$540K',
        spent: '$43K',
        completion: 8,
        orders: [
            { id: 'QT-1025', supplier: 'Multiple', amount: '$43.7K', status: 'Quote Pending', deliveryDate: 'TBD', progress: 0 },
        ],
        milestones: [
            { name: 'Design Approval', date: 'Feb 15', status: 'completed' as const },
            { name: 'Quote Finalization', date: 'Feb 28', status: 'in-progress' as const },
        ],
        fmActions: []
    },
    {
        id: 'PRJ-2026-003',
        name: 'BioLife Inc — Lab Expansion',
        client: 'BioLife Inc',
        pm: 'Sarah Mitchell',
        fm: 'Facilities Coord Cardo',
        status: 'In Progress' as const,
        totalBudget: '$890K',
        spent: '$210K',
        completion: 24,
        orders: [
            { id: 'PO-BL-001', supplier: 'Steelcase', amount: '$340K', status: 'In production', deliveryDate: 'Mar 20', progress: 45 },
            { id: 'PO-BL-002', supplier: 'Humanscale', amount: '$95K', status: 'Ready to ship', deliveryDate: 'Mar 5', progress: 85 },
        ],
        milestones: [
            { name: 'Lab Furniture Order', date: 'Feb 1', status: 'completed' as const },
            { name: 'Office Furniture Delivery', date: 'Mar 20', status: 'in-progress' as const },
            { name: 'Installation', date: 'Apr 10', status: 'pending' as const },
        ],
        fmActions: [
            { action: 'Coordinate lab equipment relocation', priority: 'high' as const },
        ]
    }
]


const salesDataByPeriod: Record<string, { name: string; sales: number }[]> = {
    Day: [
        { name: '8AM', sales: 800 }, { name: '10AM', sales: 1200 }, { name: '12PM', sales: 950 },
        { name: '2PM', sales: 1800 }, { name: '4PM', sales: 1400 }, { name: '6PM', sales: 600 },
    ],
    Week: [
        { name: 'Mon', sales: 3200 }, { name: 'Tue', sales: 2800 }, { name: 'Wed', sales: 4100 },
        { name: 'Thu', sales: 3600 }, { name: 'Fri', sales: 2900 },
    ],
    Month: [
        { name: 'Jan', sales: 4000 }, { name: 'Feb', sales: 3000 }, { name: 'Mar', sales: 2000 },
        { name: 'Apr', sales: 2780 }, { name: 'May', sales: 1890 }, { name: 'Jun', sales: 2390 },
    ],
    Quarter: [
        { name: 'Q1 2025', sales: 9000 }, { name: 'Q2 2025', sales: 7070 },
        { name: 'Q3 2025', sales: 8200 }, { name: 'Q4 2025', sales: 11400 },
    ],
};
const salesData = salesDataByPeriod.Month;

const metricsByPeriod: Record<string, { revenueTrend: string; revenueTrendUp: boolean; activeTrend: string; activeTrendUp: boolean; efficiencyTrend: string; efficiencyTrendUp: boolean; projectTrend: string; projectTrendUp: boolean }> = {
    Day:     { revenueTrend: '+$42K', revenueTrendUp: true, activeTrend: '+2', activeTrendUp: true, efficiencyTrend: '+5%', efficiencyTrendUp: true, projectTrend: '0', projectTrendUp: true },
    Week:    { revenueTrend: '+$180K', revenueTrendUp: true, activeTrend: '+5', activeTrendUp: true, efficiencyTrend: '+3%', efficiencyTrendUp: true, projectTrend: '+1', projectTrendUp: true },
    Month:   { revenueTrend: '+$320K', revenueTrendUp: true, activeTrend: '-2', activeTrendUp: false, efficiencyTrend: '+8%', efficiencyTrendUp: true, projectTrend: '+2', projectTrendUp: true },
    Quarter: { revenueTrend: '-$85K', revenueTrendUp: false, activeTrend: '+12', activeTrendUp: true, efficiencyTrend: '-4%', efficiencyTrendUp: false, projectTrend: '+3', projectTrendUp: true },
};

const trendLabels: Record<string, string> = {
    Day: 'Daily Trends', Week: 'Weekly Trends', Month: 'Monthly Trends', Quarter: 'Quarterly Trends',
};

// Post-Neocon-review (2026-06-05) · L.20 Pattern B event-based timeline aligned with Hybrid C statuses.
// Each step is tagged with its primary status + sub-phase chip so timeline reads the order lifecycle as
// it actually progresses: Acknowledged → (In Production · Ready to Ship sub-phases) → Shipped → (In Transit ·
// Delivered sub-phases) → Invoiced. Was: Order Entered / In production / Shipped / Delivered (mixed levels).
const trackingSteps = [
    { status: 'Acknowledgement Sent', primary: 'Acknowledged', subPhase: undefined as string | undefined, date: 'Dec 20, 9:00 AM',  location: 'System',          completed: true,  alert: false },
    { status: 'Production Started',   primary: 'Acknowledged', subPhase: 'In Production' as string | undefined, date: 'Dec 21, 10:30 AM', location: 'Warehouse A',     completed: true,  alert: false },
    { status: 'Ready to Ship',        primary: 'Acknowledged', subPhase: 'Ready to Ship' as string | undefined, date: 'Dec 22, 9:00 AM',  location: 'Warehouse A',     completed: true,  alert: false },
    { status: 'Shipped',              primary: 'Shipped',      subPhase: undefined as string | undefined, date: 'Dec 22, 4:15 PM', location: 'Logistics Center', completed: true,  alert: false },
    { status: 'In Transit',           primary: 'Shipped',      subPhase: 'In Transit' as string | undefined,    date: 'Dec 23, 8:30 AM', location: 'Carrier hub',     completed: true,  alert: false },
    { status: 'Delivered',            primary: 'Shipped',      subPhase: 'Delivered' as string | undefined,     date: 'Dec 24, 11:00 AM', location: 'Port of Entry',  completed: false, alert: true  },
    { status: 'Invoiced',             primary: 'Invoiced',     subPhase: undefined as string | undefined, date: 'Dec 27, expected', location: 'Finance',         completed: false, alert: false },
]

// Sources distributed across 4 channels (only rendered in inbound-outbound profile)
// OCR · RPA · Dealer Portal · Email — mix realistic across order/quote/ack types
// Manufacturer-relevant fields (P32):
//   dealer        — who sends the PO / requests the quote (invented names)
//   endCustomer   — dealer's end-customer (also invented · the real project owner)
//   contract      — bid contract reference (GSA, CoNY, OMNIA, etc.)
//   dealerPO      — dealer's PO # (for orders) · linkedQuote · linkedPO · manufacturerNo
// Post-Neocon-review (2026-06-05) seed transformation per plan F.00.b + F.2 Hybrid C:
//   PO tab statuses (3): PO Received / More Information Required / Pending Deposit
//   Orders tab statuses (5 Hybrid C): Acknowledged / Shipped / Invoiced / Cancelled / CancelledWithFee
//   Sub-phase chips bundle Acknowledged with In Production / Ready to Ship,
//   and Shipped with In Transit / Delivered (chip modifiers, not statuses).
// Entries flagged with stage "po" or "orders" to drive tab filtering.
const recentOrders = [
    // ORD-2058 NEW · Pending Deposit example (PO tab) · demonstrates 3rd PO status
    { id: "#ORD-2058", stage: "po" as const, customer: "Ridgeview Workspaces", client: "Atlas Mutual Holdings", project: "Regional HQ Refresh", amount: "$215,000", status: "Pending Deposit", date: "Jan 22, 2026", initials: "RW", statusColor: "bg-amber-50 text-amber-700", location: "Chicago", source: "Email" as const, dealer: "Ridgeview Workspaces", dealerPO: "PO-RW-2026-3001", endCustomer: "Atlas Mutual Holdings", manufacturerNo: "MFG-2-10475002", shipDate: "May 1, 2026", contract: "OMNIA-2024-FP", depositRequired: true, depositPct: 30, depositAmount: 64500 },
    // ORD-2046 NEW · derived from QT-1022 Beacon Hill (Approved) → PO Received (Wendy 33:22)
    { id: "#ORD-2046", stage: "po" as const, customer: "Bayline Furnishings", client: "Waterside Hospitality", project: "Beach Hotel · Renovation", amount: "$150,000", status: "PO Received", date: "Jan 18, 2026", initials: "BH", statusColor: "bg-zinc-100 text-muted-foreground", location: "Portland", source: "Email" as const, dealer: "Bayline Furnishings", dealerPO: "PO-BH-2026-0044", endCustomer: "Waterside Hospitality", manufacturerNo: "MFG-2-10474008", shipDate: "Apr 25, 2026", contract: "OMNIA-2024-FP", linkedQuote: "QT-1022" },
    // ORD-2056 · Delayed shipment scenario (Kenya feedback 2026-06-04) · Leland · NorthPoint · Continua
    { id: "#ORD-2056", stage: "orders" as const, customer: "Northline Furniture Group", client: "Continua Interiors of Illinois", project: "Tech HQ Buildout · Phase 2", amount: "$142,800", status: "Shipped", subPhase: "In Transit", flag: "delayed" as const, date: "Mar 12, 2026", initials: "NP", statusColor: "bg-amber-50 text-amber-700 ring-amber-600/20", location: "Lincolnshire", source: "Email" as const, dealer: "Northline Furniture Group", dealerPO: "PO-NP-2026-002112", endCustomer: "Continua Interiors of Illinois", manufacturerNo: "MFG-2-10470215", shipDate: "Mar 28, 2026", originalShipDate: "Mar 20, 2026", delayDays: 8, delayReason: "Carrier weather hold · I-80 corridor closure", callBeforeDelivery: "24hrs · 480-640-2818", contract: "GSA-28F-0015W", linkedQuote: "QT-1027" },
    { id: "#ORD-2055", stage: "po" as const, customer: "Northline Furniture Group", client: "Vertex Technologies", project: "Tech HQ Buildout", amount: "$385,000", status: "PO Received", date: "Dec 20, 2025", initials: "NP", statusColor: "bg-zinc-100 text-muted-foreground", location: "Austin", source: "Email" as const, dealer: "Northline Furniture Group", dealerPO: "PO-NP-2025-001605", endCustomer: "Vertex Technologies", manufacturerNo: "MFG-2-10468963", shipDate: "Mar 20, 2026", contract: "GSA-28F-0015W", linkedQuote: "QT-1025" },
    { id: "#ORD-2054", stage: "orders" as const, customer: "Cascade Workplace Co", client: "Greenleaf Holdings", project: "HQ Upgrade · Floor 18", amount: "$62,500", status: "Acknowledged", subPhase: "In Production", date: "Nov 15, 2025", initials: "CW", statusColor: "bg-brand-50 text-brand-700 ring-brand-600/20", location: "London", source: "Email" as const, dealer: "Cascade Workplace Co", dealerPO: "PO-CW-2026-0042", endCustomer: "Greenleaf Holdings", manufacturerNo: "MFG-2-10472501", shipDate: "Feb 15, 2026", contract: "GSA-28F-0015W" },
    { id: "#ORD-2053", stage: "orders" as const, customer: "Pacific Workspaces", client: "Urban Civic Group", project: "Lobby Refresh", amount: "$112,000", status: "Acknowledged", subPhase: "Ready to Ship", date: "Oct 30, 2025", initials: "PW", statusColor: "bg-green-50 text-green-700 ring-green-600/20", location: "Austin", source: "Email" as const, dealer: "Pacific Workspaces", dealerPO: "PO-PW-2025-1188", endCustomer: "Urban Civic Group", manufacturerNo: "MFG-2-10468100", shipDate: "Jan 30, 2026", contract: "CoNY-ANT122" },
    { id: "#ORD-2052", stage: "orders" as const, customer: "Global Furniture Partners", client: "Pioneer Logistics", project: "Warehouse Office", amount: "$45,000", status: "Shipped", subPhase: "Delivered", date: "Oct 15, 2025", initials: "GF", statusColor: "bg-gray-100 text-foreground", location: "Berlin", source: "Email" as const, dealer: "Global Furniture Partners", dealerPO: "PO-GFP-2025-0788", endCustomer: "Pioneer Logistics", manufacturerNo: "MFG-2-10465412", shipDate: "Dec 15, 2025", contract: "OMNIA-2024-FP" },
    { id: "#ORD-2051", stage: "po" as const, customer: "Summit Office Solutions", client: "Civic Builders LLC", project: "City Center · Tower B", amount: "$120,000", status: "PO Received", date: "Jan 05, 2026", initials: "SO", statusColor: "bg-zinc-100 text-muted-foreground", location: "New York", source: "Email" as const, dealer: "Summit Office Solutions", dealerPO: "PO-SO-2026-005", endCustomer: "Civic Builders LLC", manufacturerNo: "MFG-2-10473120", shipDate: "Apr 5, 2026", contract: "CoNY-ANT122" },
    // ORD-2050 · was 'PO Reviewed' (Wendy 42:23 "I don't see our need") → reassigned to More Information Required
    { id: "#ORD-2050", stage: "po" as const, customer: "Legacy Office Group", client: "Skyline Residences Co", project: "Residential A", amount: "$85,000", status: "More Information Required", date: "Jan 02, 2026", initials: "HO", statusColor: "bg-blue-50 text-blue-700", location: "Austin", source: "Email" as const, dealer: "Legacy Office Group", dealerPO: "PO-HOG-2025-2210", endCustomer: "Skyline Residences Co", manufacturerNo: "MFG-2-10468904", shipDate: "Apr 2, 2026", contract: "GSA-28F-0015W" },
    { id: "#ORD-2049", stage: "orders" as const, customer: "Bayline Furnishings", client: "Waterside Hospitality", project: "Beach Hotel · Renovation", amount: "$210,000", status: "Acknowledged", subPhase: "In Production", date: "Dec 10, 2025", initials: "BH", statusColor: "bg-indigo-50 text-indigo-700", location: "London", source: "Email" as const, dealer: "Bayline Furnishings", dealerPO: "PO-BH-2025-1156", endCustomer: "Waterside Hospitality", manufacturerNo: "MFG-2-10466050", shipDate: "Mar 10, 2026", contract: "GSA-28F-0015W" },
    { id: "#ORD-2048", stage: "orders" as const, customer: "Midwest Contract Furniture", client: "Valley Residences", project: "Mountain Retreat Lodge", amount: "$95,000", status: "Acknowledged", subPhase: "Ready to Ship", date: "Nov 20, 2025", initials: "MC", statusColor: "bg-indigo-50 text-indigo-700", location: "Berlin", source: "Manual" as const, dealer: "Midwest Contract Furniture", dealerPO: "PO-MCF-2025-0934", endCustomer: "Valley Residences", manufacturerNo: "MFG-2-10470088", shipDate: "Feb 20, 2026", contract: "OMNIA-2024-FP" },
    { id: "#ORD-2047", stage: "orders" as const, customer: "Apex Office Design", client: "Skyline Builders Co", project: "Sky Vista · Tower 3", amount: "$450,000", status: "Shipped", subPhase: "In Transit", date: "Nov 05, 2025", initials: "AO", statusColor: "bg-amber-50 text-amber-700", location: "New York", source: "Email" as const, dealer: "Apex Office Design", dealerPO: "PO-AOD-2025-1801", endCustomer: "Skyline Builders Co", manufacturerNo: "MFG-2-10464777", shipDate: "Feb 5, 2026", contract: "CoNY-ANT122" },
]

// Post-Neocon-review (2026-06-05) seed alignment:
// - QT-1025 status Negotiating → Pending + subFlag 'textile review' (Wendy 36:18)
// - QT-1024 status Draft → In Progress (Magda 33:44 + Wendy 33:51 "I like that better")
// - QT-1023 status Sent → KEEP
// - QT-1022 (was Approved) → moved to recentOrders as PO Received in Phase 4 (Wendy 33:22 "becomes a PO")
// - QT-1026 NEW · status Expired (demonstrates Wendy 34:24 add request · validUntil < today)
// Revision numbers mixed per Wendy 34:36 ("I would not reflect every single one is revision #3").
const recentQuotes = [
    { id: "QT-1025", customer: "Northline Furniture Group", project: "Tech HQ Buildout", amount: "$43,750", status: "Pending", date: "Jan 12, 2026", validUntil: "Feb 12, 2026", probability: "High", initials: "NP", statusColor: "bg-amber-50 text-amber-700", location: "Austin", source: "Email" as const, dealer: "Northline Furniture Group", endCustomer: "Vertex Technologies", contract: "GSA-28F-0015W", linkedPO: "#ORD-2055", stageFlag: "textile review", revisionNumber: 3 },
    { id: "QT-1024", customer: "Pacific Workspaces", project: "Lab Expansion · Phase 2", amount: "$540,000", status: "In Progress", date: "Jan 10, 2026", validUntil: "Feb 10, 2026", probability: "N/A", initials: "PW", statusColor: "bg-zinc-100 text-muted-foreground", location: "Boston", source: "Email" as const, dealer: "Pacific Workspaces", endCustomer: "Northstar Biolabs", contract: "CoNY-ANT122", revisionNumber: 1 },
    { id: "QT-1023", customer: "Summit Office Solutions", project: "NYC Branch Rollout", amount: "$890,000", status: "Sent", date: "Jan 08, 2026", validUntil: "Feb 08, 2026", probability: "Medium", initials: "SO", statusColor: "bg-blue-50 text-blue-700", location: "New York", source: "Email" as const, dealer: "Summit Office Solutions", endCustomer: "Heritage Financial", contract: "GSA-28F-0015W", revisionNumber: 2 },
    { id: "QT-1026", customer: "Cascade Workplace Co", project: "Floor 22 Refresh", amount: "$45,300", status: "Expired", date: "Nov 15, 2025", validUntil: "Dec 15, 2025", probability: "Closed", initials: "CW", statusColor: "bg-zinc-100 text-muted-foreground", location: "London", source: "Email" as const, dealer: "Cascade Workplace Co", endCustomer: "Greenleaf Holdings", contract: "GSA-28F-0015W", revisionNumber: 1 },
]

// Post-Neocon-review (2026-06-05) seed alignment:
// - Discrepancy as STATUS removed (L.1); detection info surfaces as `subFlag` chip on Pending (L.2).
// - Ack-8840 status Discrepancy → Pending + subFlag 'price mismatch detected'.
// - Ack-8841 status Partial KEEP + subFlag 'backorder detected' (drives item-level L.17 workflow).
const recentAcknowledgments = [
    // Amount column inherited from the linked PO per L.4 + L.6 (Wendy 2026-06-05 "Ack inherits from PO").
    { id: "Ack-8839", relatedPo: "#ORD-2055", vendor: "Vertex Manufacturing", amount: "$385,000", status: "Confirmed", date: "Jan 14, 2026", expShipDate: "Mar 20, 2026", discrepancy: "None", initials: "NP", statusColor: "bg-green-50 text-green-700", location: "Austin", source: "Email" as const, dealer: "Northline Furniture Group", endCustomer: "Vertex Technologies", shipmentNo: "SHP-7437123", linkedOrder: "#ORD-2055", revisionNumber: 2 },
    { id: "Ack-8840", relatedPo: "#ORD-2049", vendor: "Vertex Manufacturing", amount: "$210,000", status: "Pending", subFlag: "price mismatch detected", date: "Jan 13, 2026", expShipDate: "Mar 10, 2026", discrepancy: "Price Mismatch ($500)", initials: "BH", statusColor: "bg-amber-50 text-amber-700", location: "London", source: "Email" as const, dealer: "Bayline Furnishings", endCustomer: "Waterside Hospitality", shipmentNo: "SHP-7438250", linkedOrder: "#ORD-2049", revisionNumber: 1 },
    { id: "Ack-8841", relatedPo: "#ORD-2053", vendor: "Vertex Manufacturing", amount: "$112,000", status: "Partial", subFlag: "backorder detected", date: "Jan 12, 2026", expShipDate: "Jan 30, 2026", discrepancy: "Backordered Items", initials: "PW", statusColor: "bg-amber-50 text-amber-700", location: "Austin", source: "Email" as const, dealer: "Pacific Workspaces", endCustomer: "Urban Civic Group", shipmentNo: "SHP-7440188", linkedOrder: "#ORD-2053", revisionNumber: 1 },
]

// RFQs (Request for Quote) — INBOUND transactions per Neocon-review (2026-06-05).
// Manufacturer receives RFQs from dealers via channels Email · Dealer Portal · NetSuite (Manual = edge-case upload).
// Lifecycle: New → In Review → (optional Additional Information Required) → Sent (becomes a Quote in outbound side).
const recentRFQs = [
    { id: "RFQ-2026-001", customer: "Northline Furniture Group", project: "Tech HQ Buildout · West Wing", amount: "$67,240", status: "Sent", date: "Jan 18, 2026", validUntil: "Feb 18, 2026", initials: "NP", statusColor: "bg-green-50 text-green-700", location: "Austin", source: "Email" as const, dealer: "Northline Furniture Group", endCustomer: "Vertex Technologies", contract: "GSA-28F-0015W", linkedQuote: "QT-1025", revisionNumber: 3 },
    { id: "RFQ-2026-002", customer: "Pacific Workspaces", project: "Lab Expansion · Phase 3", amount: "$120,800", status: "In Review", date: "Jan 16, 2026", validUntil: "Feb 16, 2026", initials: "PW", statusColor: "bg-blue-50 text-blue-700", location: "Boston", source: "Email" as const, dealer: "Pacific Workspaces", endCustomer: "Northstar Biolabs", contract: "CoNY-ANT122", revisionNumber: 1 },
    { id: "RFQ-2026-003", customer: "Cascade Workplace Co", project: "Floor 22 Refresh", amount: "$45,300", status: "Additional Information Required", date: "Jan 14, 2026", validUntil: "Feb 14, 2026", initials: "CW", statusColor: "bg-amber-50 text-amber-700", location: "London", source: "Email" as const, dealer: "Cascade Workplace Co", endCustomer: "Greenleaf Holdings", contract: "GSA-28F-0015W", revisionNumber: 1 },
    { id: "RFQ-2026-004", customer: "Summit Office Solutions", project: "Branch Office · Phoenix", amount: "$89,500", status: "New", date: "Jan 13, 2026", validUntil: "Feb 13, 2026", initials: "SO", statusColor: "bg-amber-50 text-amber-700", location: "Phoenix", source: "Manual" as const, dealer: "Summit Office Solutions", endCustomer: "Heritage Financial", revisionNumber: 1 },
    { id: "RFQ-2026-005", customer: "Legacy Office Group", project: "Executive Suite", amount: "$210,000", status: "In Review", date: "Jan 10, 2026", validUntil: "Feb 10, 2026", initials: "HO", statusColor: "bg-blue-50 text-blue-700", location: "Chicago", source: "Email" as const, dealer: "Legacy Office Group", endCustomer: "Skyline Residences Co", contract: "OMNIA-2024-FP", revisionNumber: 2 },
    { id: "RFQ-2026-006", customer: "Apex Office Design", project: "Sky Vista · Tower 5", amount: "$320,400", status: "New", date: "Jan 08, 2026", validUntil: "Feb 08, 2026", initials: "AO", statusColor: "bg-amber-50 text-amber-700", location: "New York", source: "Email" as const, dealer: "Apex Office Design", endCustomer: "Skyline Builders Co", contract: "CoNY-ANT122", revisionNumber: 1 },
]

// Pipeline stages
// Post-Neocon-review taxonomies (2026-06-05). Authority: Strata Sales Director > PDF > others.
// Purchase Orders tab · 3 statuses (Wendy 40:53 / 41:34 / 43:03). Removed: PO Reviewed, In Production, Ready to ship, Shipped, Delivered (moved to Orders tab).
const pipelineStages = ['PO Received', 'More Information Required', 'Pending Deposit']
// Quotes tab · 4 statuses (Wendy 31:39 / 32:11 / 33:51 / 34:24). Removed: Draft (→ In Progress), Negotiating ("you don't negotiate a quote"), Approved ("becomes a PO"), Lost.
const quoteStages = ['In Progress', 'Pending', 'Sent', 'Expired']
// Acknowledgements tab · 3 statuses (L.1). Discrepancy removed as status — surfaces as sub-flag on Pending.
const ackStages = ['Pending', 'Partial', 'Confirmed']
// RFQ stages · 4 statuses (D.1 · Christian 13:04 / Asly 14:53 / Wendy 18:45). Was ['Pending Review', 'In Review', 'Quote Sent'] before Neocon review.
const rfqStages = ['New', 'In Review', 'Additional Information Required', 'Sent']
// Orders tab (NEW · Hybrid C per F.11.d). 5 primary statuses match HermanMiller portal + Wendy 50:28.
// Sub-phase chips (In Production / Ready to Ship under Acknowledged · In Transit / Delivered under Shipped) live as chip modifiers.
const orderStages = ['Acknowledged', 'Shipped', 'Invoiced', 'Cancelled', 'CancelledWithFee']


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

// Summary Data by Time Period
type TimePeriod = 'Day' | 'Week' | 'Month' | 'Quarter';
type SummaryItem = { label: string; value: string; sub: string; icon: JSX.Element; color: string; trend: string; trendUp: boolean };

const ordersSummaryByPeriod: Record<TimePeriod, Record<string, SummaryItem>> = {
    Day: {
        active_orders: { label: 'Active Orders', value: '12', sub: 'In production/transit', icon: <CubeIcon className="w-5 h-5" />, color: 'blue', trend: '+2', trendUp: true },
        pending_approval: { label: 'Pending Approval', value: '3', sub: 'Awaiting authorization', icon: <ClockIcon className="w-5 h-5" />, color: 'orange', trend: '+1', trendUp: true },
        in_production: { label: 'In production', value: '5', sub: 'Manufacturing stage', icon: <WrenchScrewdriverIcon className="w-5 h-5" />, color: 'purple', trend: '0', trendUp: true },
        ready_to_ship: { label: 'Ready to ship', value: '4', sub: 'Awaiting dispatch', icon: <TruckIcon className="w-5 h-5" />, color: 'indigo', trend: '+1', trendUp: true },
        total_value: { label: 'Total Value', value: '$420K', sub: 'Active orders value', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'green', trend: '+8%', trendUp: true },
    },
    Week: {
        active_orders: { label: 'Active Orders', value: '47', sub: 'In production/transit', icon: <CubeIcon className="w-5 h-5" />, color: 'blue', trend: '+5', trendUp: true },
        pending_approval: { label: 'Pending Approval', value: '8', sub: 'Awaiting authorization', icon: <ClockIcon className="w-5 h-5" />, color: 'orange', trend: '-2', trendUp: false },
        in_production: { label: 'In production', value: '19', sub: 'Manufacturing stage', icon: <WrenchScrewdriverIcon className="w-5 h-5" />, color: 'purple', trend: '+3', trendUp: true },
        ready_to_ship: { label: 'Ready to ship', value: '12', sub: 'Awaiting dispatch', icon: <TruckIcon className="w-5 h-5" />, color: 'indigo', trend: '+4', trendUp: true },
        total_value: { label: 'Total Value', value: '$1.9M', sub: 'Active orders value', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'green', trend: '+12%', trendUp: true },
    },
    Month: {
        active_orders: { label: 'Active Orders', value: '89', sub: 'In production/transit', icon: <CubeIcon className="w-5 h-5" />, color: 'blue', trend: '+14', trendUp: true },
        pending_approval: { label: 'Pending Approval', value: '12', sub: 'Awaiting authorization', icon: <ClockIcon className="w-5 h-5" />, color: 'orange', trend: '-3', trendUp: false },
        in_production: { label: 'In production', value: '34', sub: 'Manufacturing stage', icon: <WrenchScrewdriverIcon className="w-5 h-5" />, color: 'purple', trend: '+8', trendUp: true },
        ready_to_ship: { label: 'Ready to ship', value: '23', sub: 'Awaiting dispatch', icon: <TruckIcon className="w-5 h-5" />, color: 'indigo', trend: '+6', trendUp: true },
        total_value: { label: 'Total Value', value: '$3.8M', sub: 'Active orders value', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'green', trend: '+15%', trendUp: true },
    },
    Quarter: {
        active_orders: { label: 'Active Orders', value: '234', sub: 'In production/transit', icon: <CubeIcon className="w-5 h-5" />, color: 'blue', trend: '+28', trendUp: true },
        pending_approval: { label: 'Pending Approval', value: '31', sub: 'Awaiting authorization', icon: <ClockIcon className="w-5 h-5" />, color: 'orange', trend: '+5', trendUp: true },
        in_production: { label: 'In production', value: '87', sub: 'Manufacturing stage', icon: <WrenchScrewdriverIcon className="w-5 h-5" />, color: 'purple', trend: '-4', trendUp: false },
        ready_to_ship: { label: 'Ready to ship', value: '58', sub: 'Awaiting dispatch', icon: <TruckIcon className="w-5 h-5" />, color: 'indigo', trend: '+12', trendUp: true },
        total_value: { label: 'Total Value', value: '$11.2M', sub: 'Active orders value', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'green', trend: '+22%', trendUp: true },
    },
};

const quotesSummaryByPeriod: Record<TimePeriod, Record<string, SummaryItem>> = {
    Day: {
        open_quotes: { label: 'Open Quotes', value: '3', sub: 'In Progress or Pending', icon: <DocumentTextIcon className="w-5 h-5" />, color: 'blue', trend: '+1', trendUp: true },
        pending: { label: 'Pending', value: '1', sub: 'Client review', icon: <UserIcon className="w-5 h-5" />, color: 'orange', trend: '0', trendUp: true },
        converted_ytd: { label: 'Converted to PO', value: '2', sub: 'Today', icon: <CheckIcon className="w-5 h-5" />, color: 'green', trend: '+2', trendUp: true },
        win_rate: { label: 'Win Rate', value: '75%', sub: 'vs yesterday', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple', trend: '+7%', trendUp: true },
        pipeline_val: { label: 'Pipeline Val', value: '$180K', sub: 'Potential revenue', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'indigo', trend: '+5%', trendUp: true },
    },
    Week: {
        open_quotes: { label: 'Open Quotes', value: '8', sub: 'In Progress or Pending', icon: <DocumentTextIcon className="w-5 h-5" />, color: 'blue', trend: '+3', trendUp: true },
        pending: { label: 'Pending', value: '3', sub: 'Client review', icon: <UserIcon className="w-5 h-5" />, color: 'orange', trend: '+1', trendUp: true },
        converted_ytd: { label: 'Converted to PO', value: '11', sub: 'This week', icon: <CheckIcon className="w-5 h-5" />, color: 'green', trend: '+4', trendUp: true },
        win_rate: { label: 'Win Rate', value: '71%', sub: 'vs last week', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple', trend: '+3%', trendUp: true },
        pipeline_val: { label: 'Pipeline Val', value: '$890K', sub: 'Potential revenue', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'indigo', trend: '+11%', trendUp: true },
    },
    Month: {
        open_quotes: { label: 'Open Quotes', value: '14', sub: 'In Progress or Pending', icon: <DocumentTextIcon className="w-5 h-5" />, color: 'blue', trend: '+6', trendUp: true },
        pending: { label: 'Pending', value: '5', sub: 'Client review', icon: <UserIcon className="w-5 h-5" />, color: 'orange', trend: '-1', trendUp: false },
        converted_ytd: { label: 'Converted to PO', value: '42', sub: 'This month', icon: <CheckIcon className="w-5 h-5" />, color: 'green', trend: '+9', trendUp: true },
        win_rate: { label: 'Win Rate', value: '68%', sub: 'vs last month', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple', trend: '+3%', trendUp: true },
        pipeline_val: { label: 'Pipeline Val', value: '$2.1M', sub: 'Potential revenue', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'indigo', trend: '+18%', trendUp: true },
    },
    Quarter: {
        open_quotes: { label: 'Open Quotes', value: '38', sub: 'In Progress or Pending', icon: <DocumentTextIcon className="w-5 h-5" />, color: 'blue', trend: '-2', trendUp: false },
        pending: { label: 'Pending', value: '12', sub: 'Client review', icon: <UserIcon className="w-5 h-5" />, color: 'orange', trend: '+4', trendUp: true },
        converted_ytd: { label: 'Converted to PO', value: '124', sub: 'This quarter', icon: <CheckIcon className="w-5 h-5" />, color: 'green', trend: '+31', trendUp: true },
        win_rate: { label: 'Win Rate', value: '62%', sub: 'vs last quarter', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple', trend: '-4%', trendUp: false },
        pipeline_val: { label: 'Pipeline Val', value: '$6.4M', sub: 'Potential revenue', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'indigo', trend: '+25%', trendUp: true },
    },
};

const acksSummaryByPeriod: Record<TimePeriod, Record<string, SummaryItem>> = {
    Day: {
        pending_acks: { label: 'Pending Acks', value: '2', sub: 'Awaiting vendor', icon: <ClockIcon className="w-5 h-5" />, color: 'orange', trend: '+1', trendUp: true },
        discrepancies: { label: 'Discrepancies', value: '1', sub: 'Action required', icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'red', trend: '0', trendUp: true },
        confirmed: { label: 'Confirmed', value: '8', sub: 'On track', icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />, color: 'green', trend: '+3', trendUp: true },
        avg_lead: { label: 'Avg Lead Time', value: '3.8w', sub: 'Weeks to ship', icon: <CalendarIcon className="w-5 h-5" />, color: 'blue', trend: '-0.4w', trendUp: true },
        on_time: { label: 'On Time Rate', value: '96%', sub: 'Vendor perf.', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple', trend: '+2%', trendUp: true },
    },
    Week: {
        pending_acks: { label: 'Pending Acks', value: '5', sub: 'Awaiting vendor', icon: <ClockIcon className="w-5 h-5" />, color: 'orange', trend: '-1', trendUp: false },
        discrepancies: { label: 'Discrepancies', value: '2', sub: 'Action required', icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'red', trend: '+1', trendUp: true },
        confirmed: { label: 'Confirmed', value: '34', sub: 'On track', icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />, color: 'green', trend: '+8', trendUp: true },
        avg_lead: { label: 'Avg Lead Time', value: '4.0w', sub: 'Weeks to ship', icon: <CalendarIcon className="w-5 h-5" />, color: 'blue', trend: '-0.2w', trendUp: true },
        on_time: { label: 'On Time Rate', value: '95%', sub: 'Vendor perf.', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple', trend: '+1%', trendUp: true },
    },
    Month: {
        pending_acks: { label: 'Pending Acks', value: '8', sub: 'Awaiting vendor', icon: <ClockIcon className="w-5 h-5" />, color: 'orange', trend: '-2', trendUp: false },
        discrepancies: { label: 'Discrepancies', value: '3', sub: 'Action required', icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'red', trend: '+1', trendUp: true },
        confirmed: { label: 'Confirmed', value: '156', sub: 'On track', icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />, color: 'green', trend: '+42', trendUp: true },
        avg_lead: { label: 'Avg Lead Time', value: '4.2w', sub: 'Weeks to ship', icon: <CalendarIcon className="w-5 h-5" />, color: 'blue', trend: '+0.1w', trendUp: false },
        on_time: { label: 'On Time Rate', value: '94%', sub: 'Vendor perf.', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple', trend: '+2%', trendUp: true },
    },
    Quarter: {
        pending_acks: { label: 'Pending Acks', value: '18', sub: 'Awaiting vendor', icon: <ClockIcon className="w-5 h-5" />, color: 'orange', trend: '+6', trendUp: true },
        discrepancies: { label: 'Discrepancies', value: '9', sub: 'Action required', icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'red', trend: '+4', trendUp: true },
        confirmed: { label: 'Confirmed', value: '478', sub: 'On track', icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />, color: 'green', trend: '+112', trendUp: true },
        avg_lead: { label: 'Avg Lead Time', value: '4.5w', sub: 'Weeks to ship', icon: <CalendarIcon className="w-5 h-5" />, color: 'blue', trend: '+0.3w', trendUp: false },
        on_time: { label: 'On Time Rate', value: '91%', sub: 'Vendor perf.', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple', trend: '-3%', trendUp: false },
    },
};

import AcknowledgementUploadModal from './components/AcknowledgementUploadModal'
import CreateQuoteModal from './components/CreateQuoteModal'

interface TransactionsProps {
    onLogout: () => void;
    onNavigateToDetail: (type: string) => void;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: string) => void;
}

export default function Transactions({ onLogout, onNavigateToDetail, onNavigateToWorkspace, onNavigate }: TransactionsProps) {
    const { currentStep, nextStep, isDemoActive, setLupaStep, procCompleteStep } = useDemo();
    const { activeProfile } = useDemoProfile()
    const isContinua = activeProfile.id === 'continua'
    const isInboundOutbound = activeProfile.id === 'inbound-outbound'
    const stepId = currentStep?.id || ''

    // ── Dupler d1.1: Simulate hover + auto-click on "Convert to SIF" ──
    const [sifHoverSim, setSifHoverSim] = useState(false);
    const [sifClicked, setSifClicked] = useState(false);
    const sifBtnRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (stepId !== 'd1.1') { setSifHoverSim(false); setSifClicked(false); return; }
        setSifHoverSim(false);
        setSifClicked(false);
        // Phase 1: simulate hover after 1.5s
        const t1 = setTimeout(() => setSifHoverSim(true), 1500);
        // Phase 2: simulate click after 3s
        const t2 = setTimeout(() => {
            setSifClicked(true);
            window.dispatchEvent(new CustomEvent('dupler-vendor-upload'));
        }, 3000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [stepId]);

    // ── Continua Step 2.2 Procurement state ──
    const [procPhase, setProcPhase] = useState<ProcurementPhase>('idle')
    const [expertAnswer, setExpertAnswer] = useState<string | null>(null)
    const procPhaseRef = useRef(procPhase)
    useEffect(() => { procPhaseRef.current = procPhase }, [procPhase])

    // Phase orchestration: idle → notification → expert-question → (answer triggers lupa) → highlight → done
    const tp22 = CONTINUA_STEP_TIMING['3.2']
    useEffect(() => {
        if (!isContinua || stepId !== '3.2') { setProcPhase('idle'); return }
        setProcPhase('idle')
        setExpertAnswer(null)
        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(() => setProcPhase('notification'), tp22.notifDelay))
        timers.push(setTimeout(() => {
            if (procPhaseRef.current === 'notification') setProcPhase('expert-question')
        }, tp22.notifDelay + tp22.notifDuration))
        return () => timers.forEach(clearTimeout)
    }, [isContinua, stepId])

    // Expert answer → highlight card first, then trigger lupa
    useEffect(() => {
        if (procPhase !== 'expert-question' || !expertAnswer) return
        const t = setTimeout(() => setProcPhase('highlight'), 1200)
        return () => clearTimeout(t)
    }, [procPhase, expertAnswer])

    // Highlight card → after 1.5s trigger lupa (DemoProcessPanel)
    useEffect(() => {
        if (procPhase !== 'highlight') return
        const t = setTimeout(() => {
            setProcPhase('lupa-active')
            setLupaStep('3.2')
        }, 1500)
        return () => clearTimeout(t)
    }, [procPhase, setLupaStep])

    // procCompleteStep signal from DemoProcessPanel → show PO generated summary
    useEffect(() => {
        if (procCompleteStep !== '3.2' || procPhase === 'po-generated') return
        setProcPhase('po-generated')
    }, [procCompleteStep, procPhase])

    // po-generated → after 2s → chain to AckPhase
    useEffect(() => {
        if (procPhase !== 'po-generated') return
        const t = setTimeout(() => setAckPhase('notification'), 2000)
        return () => clearTimeout(t)
    }, [procPhase])

    // ─── Continua Step 3.2 (continued): ACK Tracking — chained from ProcurementPhase ──
    type AckPhase = 'idle' | 'notification' | 'tab-switch' | 'validating' | 'alert' | 'done'
    const [ackPhase, setAckPhase] = useState<AckPhase>('idle')
    const ackPhaseRef = useRef(ackPhase)
    useEffect(() => { ackPhaseRef.current = ackPhase }, [ackPhase])
    const [ackValidatedCount, setAckValidatedCount] = useState(0)
    const [ackKnollAlert, setAckKnollAlert] = useState(false)

    // Reset AckPhase when leaving step 3.2
    useEffect(() => {
        if (!isContinua || stepId !== '3.2') {
            setAckPhase('idle'); setAckValidatedCount(0); setAckKnollAlert(false)
        }
    }, [isContinua, stepId])

    // AckPhase notification auto-advance → tab-switch
    useEffect(() => {
        if (ackPhase !== 'notification') return
        const t = setTimeout(() => {
            if (ackPhaseRef.current === 'notification') setAckPhase('tab-switch')
        }, 3000)
        return () => clearTimeout(t)
    }, [ackPhase])

    // tab-switch → auto-switch to ACK tab, then → validating
    useEffect(() => {
        if (ackPhase !== 'tab-switch') return
        setLifecycleTab('acknowledgments')
        setViewMode('pipeline')
        const t = setTimeout(() => setAckPhase('validating'), 800)
        return () => clearTimeout(t)
    }, [ackPhase])

    // validating → stagger validated badges, then → alert (Knoll)
    useEffect(() => {
        if (ackPhase !== 'validating') return
        setAckValidatedCount(0)
        const timers: ReturnType<typeof setTimeout>[] = []
        for (let i = 0; i < 2; i++) {
            timers.push(setTimeout(() => setAckValidatedCount(i + 1), (i + 1) * 900))
        }
        const alertDelay = 3 * 900 + 1500
        timers.push(setTimeout(() => {
            setAckKnollAlert(true)
            setAckPhase('alert')
        }, alertDelay))
        return () => timers.forEach(clearTimeout)
    }, [ackPhase])

    // alert → hold 2.5s → done
    useEffect(() => {
        if (ackPhase !== 'alert') return
        const t = setTimeout(() => setAckPhase('done'), 2500)
        return () => clearTimeout(t)
    }, [ackPhase])

    // ─── Continua Step 3.3: PO→ACK Conversion ────────────────────────────────────
    const [convPhase, setConvPhase] = useState<ConversionPhase>('idle')
    const convPhaseRef = useRef(convPhase)
    useEffect(() => { convPhaseRef.current = convPhase }, [convPhase])
    const [convChecklistVisible, setConvChecklistVisible] = useState(0)
    const [priceChecksVisible, setPriceChecksVisible] = useState(0)

    const tp33 = CONTINUA_STEP_TIMING['3.3']
    useEffect(() => {
        if (!isContinua || stepId !== '3.3') { setConvPhase('idle'); setConvChecklistVisible(0); setPriceChecksVisible(0); return }
        setConvPhase('idle'); setConvChecklistVisible(0); setPriceChecksVisible(0)
        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(() => setConvPhase('notification'), tp33.notifDelay))
        timers.push(setTimeout(() => {
            if (convPhaseRef.current === 'notification') setConvPhase('review')
        }, tp33.notifDelay + tp33.notifDuration))
        return () => timers.forEach(clearTimeout)
    }, [isContinua, stepId])

    // review → stagger checklist items → price-check
    useEffect(() => {
        if (convPhase !== 'review') return
        setConvChecklistVisible(0)
        const timers: ReturnType<typeof setTimeout>[] = []
        CONVERSION_CHECKLIST.forEach((_, i) => {
            timers.push(setTimeout(() => setConvChecklistVisible(i + 1), (i + 1) * 600))
        })
        timers.push(setTimeout(() => setConvPhase('price-check'), CONVERSION_CHECKLIST.length * 600 + 800))
        return () => timers.forEach(clearTimeout)
    }, [convPhase])

    // price-check → stagger price checks → ready
    useEffect(() => {
        if (convPhase !== 'price-check') return
        setPriceChecksVisible(0)
        const timers: ReturnType<typeof setTimeout>[] = []
        PRICE_CHECKS.forEach((_, i) => {
            timers.push(setTimeout(() => setPriceChecksVisible(i + 1), (i + 1) * 600))
        })
        timers.push(setTimeout(() => setConvPhase('ready'), PRICE_CHECKS.length * 600 + 800))
        return () => timers.forEach(clearTimeout)
    }, [convPhase])

    // ─── Continua Step 3.4: Approval Chain ────────────────────────────────────────
    const [approvalPhase, setApprovalPhase] = useState<ApprovalChainPhase>('idle')
    const approvalPhaseRef = useRef(approvalPhase)
    useEffect(() => { approvalPhaseRef.current = approvalPhase }, [approvalPhase])
    const [approvalSteps, setApprovalSteps] = useState(CONVERSION_APPROVAL_STEPS.map(s => ({ ...s })))

    const tp34 = CONTINUA_STEP_TIMING['3.4']
    useEffect(() => {
        if (!isContinua || stepId !== '3.4') { setApprovalPhase('idle'); return }
        setApprovalPhase('idle')
        setApprovalSteps(CONVERSION_APPROVAL_STEPS.map(s => ({ ...s })))
        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(() => setApprovalPhase('notification'), tp34.notifDelay))
        timers.push(setTimeout(() => {
            if (approvalPhaseRef.current === 'notification') setApprovalPhase('chain')
        }, tp34.notifDelay + tp34.notifDuration))
        return () => timers.forEach(clearTimeout)
    }, [isContinua, stepId])

    // chain → sequential approvals
    useEffect(() => {
        if (approvalPhase !== 'chain') return
        setApprovalSteps(CONVERSION_APPROVAL_STEPS.map(s => ({ ...s })))
        const timers: ReturnType<typeof setTimeout>[] = []
        // AI auto-approves after 1.5s
        timers.push(setTimeout(() =>
            setApprovalSteps(prev => prev.map(s => s.id === 'ai' ? { ...s, status: 'approved' as const } : s))
        , 1500))
        // Expert auto-approves after 3s
        timers.push(setTimeout(() =>
            setApprovalSteps(prev => prev.map(s => s.id === 'expert' ? { ...s, status: 'approved' as const } : s))
        , 3000))
        // Dealer becomes pending-action after 4s
        timers.push(setTimeout(() =>
            setApprovalSteps(prev => prev.map(s => s.id === 'dealer' ? { ...s, status: 'pending-action' as const } : s))
        , 4000))
        return () => timers.forEach(clearTimeout)
    }, [approvalPhase])

    // ─── Continua Step 1.5: Consignment & Vendor Returns ────────────────────────
    const [csgnPhase, setCsgnPhase] = useState<ConsignmentPhase>('idle')
    const csgnPhaseRef = useRef(csgnPhase)
    useEffect(() => { csgnPhaseRef.current = csgnPhase }, [csgnPhase])
    const [csgnAgents, setCsgnAgents] = useState(CONSIGNMENT_AGENTS.map(a => ({ ...a, visible: false, done: false })))
    const [csgnProgress, setCsgnProgress] = useState(0)

    // Continua 2.5: orchestration
    const tp15 = CONTINUA_STEP_TIMING['1.5']
    useEffect(() => {
        if (!isContinua || stepId !== '1.5') { setCsgnPhase('idle'); return }
        setCsgnPhase('idle')
        setCsgnAgents(CONSIGNMENT_AGENTS.map(a => ({ ...a, visible: false, done: false })))
        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(() => setCsgnPhase('notification'), tp15.notifDelay))
        timers.push(setTimeout(() => {
            if (csgnPhaseRef.current === 'notification') setCsgnPhase('processing')
        }, tp15.notifDelay + tp15.notifDuration))
        return () => timers.forEach(clearTimeout)
    }, [isContinua, stepId])

    // Continua 2.5: processing → breathing
    useEffect(() => {
        if (csgnPhase !== 'processing') return
        setCsgnAgents(CONSIGNMENT_AGENTS.map(a => ({ ...a, visible: false, done: false })))
        setCsgnProgress(0)
        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(() => setCsgnProgress(100), 50))
        CONSIGNMENT_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(() => setCsgnAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a)), i * tp15.agentStagger))
            timers.push(setTimeout(() => setCsgnAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a)), i * tp15.agentStagger + tp15.agentDone))
        })
        timers.push(setTimeout(() => setCsgnPhase('breathing'), CONSIGNMENT_AGENTS.length * tp15.agentStagger + 800))
        return () => timers.forEach(clearTimeout)
    }, [csgnPhase])

    // Continua 2.5: breathing → revealed
    useEffect(() => {
        if (csgnPhase !== 'breathing') return
        const t = setTimeout(() => setCsgnPhase('revealed'), tp15.breathing)
        return () => clearTimeout(t)
    }, [csgnPhase])

    // Continua 2.5: revealed → results
    useEffect(() => {
        if (csgnPhase !== 'revealed') return
        const t = setTimeout(() => setCsgnPhase('results'), 1500)
        return () => clearTimeout(t)
    }, [csgnPhase])

    const [viewMode, setViewMode] = useState<'list' | 'pipeline'>(
        activeProfile.id === 'inbound-outbound' ? 'list' : 'pipeline'
    );
    const [showMetrics, setShowMetrics] = useState(false);
    const [txTimePeriod, setTxTimePeriod] = useState<TimePeriod>('Month');
    const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
    const [isAckModalOpen, setIsAckModalOpen] = useState(false);
    const [isBatchAckOpen, setIsBatchAckOpen] = useState(false);
    const [isQuoteWidgetOpen, setIsQuoteWidgetOpen] = useState(false);
    const [isPEDOpen, setIsPEDOpen] = useState(false);
    const [pedData, setPedData] = useState<PEDData | null>(null);
    const [isConversionOpen, setIsConversionOpen] = useState(false);
    const [conversionMode, setConversionMode] = useState<'quote-to-order' | 'order-to-ack' | 'rfq-to-quote'>('quote-to-order');
    const [isReconciliationOpen, setIsReconciliationOpen] = useState(false);

    const openPEDPreview = (type: PEDDocumentType, id?: string) => {
        setPedData(getMockPEDData(type, id));
        setIsPEDOpen(true);
    };

    // Duplicate transaction · reuses the PEDExportModal visualization (purpose="duplicate")
    const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
    const [duplicateData, setDuplicateData] = useState<PEDData | null>(null);
    const openDuplicate = (type: PEDDocumentType) => {
        setDuplicateData(getMockPEDData(type));
        setIsDuplicateOpen(true);
    };

    // Toast State
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ title: '', description: '', type: 'success' }); // success | error | info
    const toastTimerRef = useRef<any>(null);

    const triggerToast = (title: string, description: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToastMessage({ title, description, type });
        setShowToast(true);

        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setShowToast(false), 3000);
    };

    const handleExportSIF = (type: string) => {
        triggerToast(`Exporting ${type} SIF...`, 'Generating SIF file. Please wait.', 'info');

        setTimeout(() => {
            triggerToast(`${type} SIF Exported`, 'The SIF file has been successfully generated and downloaded.', 'success');
            // Simulate download
            // const element = document.createElement("a");
            // const file = new Blob(["Simulated SIF Content"], {type: 'text/plain'});
            // element.href = URL.createObjectURL(file);
            // element.download = `${type}_Export_${new Date().toISOString().split('T')[0]}.sif`;
            // document.body.appendChild(element); // Required for this to work in FireFox
            // element.click(); 
        }, 1500);
    };
    const { theme, toggleTheme } = useTheme()
    const { currentTenant } = useTenant()

    // Refs for scrolling
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const expandedScrollRef = useRef<HTMLDivElement>(null)

    // Manual upload edge-case (Wendy 6:07 + Christian 8:11) — only on RFQ + PO tabs.
    // Volume ingestion ask (Matt CEO · 0:30) is covered by InboxMonitorWidget + auto-spawn; this affordance handles docs that arrived outside the standard channels (WhatsApp, scanned fax, etc.).
    const [uploadModalOpen, setUploadModalOpen] = useState(false)
    const [uploadDocType, setUploadDocType] = useState<'RFQ' | 'PO'>('RFQ')
    const [uploadToast, setUploadToast] = useState<{ count: number; docType: 'RFQ' | 'PO' } | null>(null)
    const openUploadModal = (docType: 'RFQ' | 'PO') => { setUploadDocType(docType); setUploadModalOpen(true) }
    const handleUploadSuccess = (count: number) => {
        setUploadToast({ count, docType: uploadDocType })
        setTimeout(() => setUploadToast(null), 5_000)
    }

    // Quick Message CTA · Christian 27:01 "in actions put a reply" + Wendy 25:40 + 26:39 (Neocon-review 2026-06-05).
    // Plan D.2.b: each transaction tab gets templates contextual to its type + current status.
    // Reuses EmailDraftModal so responses go through the dealer's channel (Email / Dealer Portal / NetSuite).
    const [quickMessageDraft, setQuickMessageDraft] = useState<EmailDraft | null>(null)
    const openQuickMessage = (row: any) => {
        const dealer = row.dealer || row.customer || row.vendor || 'Dealer'
        const dealerSlug = String(dealer).toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')
        const to = `${dealerSlug || 'contact'}@example.com`
        const project = row.project ? ` for ${row.project}` : ''
        const signature = `\n\nBest,\nAccount Manager Kai\nAccount Manager`

        // Template selection branches on tab + status so the prefilled draft matches
        // the moment in the workflow (e.g. backorder vs delivery confirmation).
        let draft: EmailDraft
        if (lifecycleTab === 'rfqs') {
            if (row.status === 'Additional Information Required') {
                draft = {
                    label: 'Request more information',
                    to,
                    subject: `${row.id} · need clarification`,
                    body: `Hi ${dealer},\n\nThanks for sending ${row.id}${project}. To finalize the quote we need a bit more detail on a few line items (qty, finish, or part #). Could you please confirm so we can send back pricing this week?${signature}`,
                }
            } else {
                draft = {
                    label: 'Acknowledge receipt',
                    to,
                    subject: `${row.id} · received, reviewing`,
                    body: `Hi ${dealer},\n\nWe received your RFQ ${row.id}${project} and are reviewing the line items now. Expect a quote within 2 business days.${signature}`,
                }
            }
        } else if (lifecycleTab === 'quotes') {
            if (row.status === 'Expired') {
                draft = {
                    label: 'Quote expired · re-issue?',
                    to,
                    subject: `${row.id} · expired ${row.validUntil ?? ''} · re-issue?`,
                    body: `Hi ${dealer},\n\nQuote ${row.id}${project} has expired. Let me know if you'd like us to re-issue with current pricing.${signature}`,
                }
            } else if (row.status === 'Sent') {
                draft = {
                    label: 'Quote follow-up',
                    to,
                    subject: `${row.id} · checking in`,
                    body: `Hi ${dealer},\n\nFollowing up on quote ${row.id}${project} — let me know if you have any questions or need an updated revision before ${row.validUntil ?? 'expiration'}.${signature}`,
                }
            } else {
                draft = {
                    label: 'Quote update',
                    to,
                    subject: `${row.id} · update`,
                    body: `Hi ${dealer},\n\nQuick update on quote ${row.id}${project}. ${signature}`,
                }
            }
        } else if (lifecycleTab === 'orders') {
            // PO tab
            if (row.status === 'Pending Deposit') {
                draft = {
                    label: 'Deposit reminder',
                    to,
                    subject: `${row.id} · deposit required to start production`,
                    body: `Hi ${dealer},\n\nPO ${row.id}${project} is on hold pending the production deposit. A proforma is attached for processing — production will start as soon as the deposit clears.${signature}`,
                }
            } else if (row.status === 'More Information Required') {
                draft = {
                    label: 'Discrepancy detected',
                    to,
                    subject: `${row.id} · PO vs Quote mismatch`,
                    body: `Hi ${dealer},\n\nWe noticed PO ${row.id}${project} differs from the linked quote on a few items. Could you confirm the intended qty/finish so we can acknowledge correctly?${signature}`,
                }
            } else {
                draft = {
                    label: 'PO acknowledgment',
                    to,
                    subject: `${row.id} · acknowledged`,
                    body: `Hi ${dealer},\n\nPO ${row.id}${project} has been received and is being prepared for acknowledgment. We'll send the formal Ack with planned delivery shortly.${signature}`,
                }
            }
        } else if (lifecycleTab === 'acknowledgments') {
            const subFlag = row.subFlag
            if (subFlag === 'backorder detected' || row.discrepancy === 'Backordered Items') {
                draft = {
                    label: 'Backorder notification',
                    to,
                    subject: `${row.id} · items backordered`,
                    body: `Hi ${dealer},\n\nOn ack ${row.id}${project} we have items on backorder. Detail is in the line table — please review the ETA and confirm whether to ship partial or hold.${signature}`,
                }
            } else if (subFlag === 'price mismatch detected') {
                draft = {
                    label: 'Price adjustment notice',
                    to,
                    subject: `${row.id} · price update on selected lines`,
                    body: `Hi ${dealer},\n\nDuring acknowledgment of ${row.id}${project} we detected a price change on some lines vs the originating quote. Please review and confirm before we proceed.${signature}`,
                }
            } else {
                draft = {
                    label: 'Acknowledgement issued',
                    to,
                    subject: `${row.id} · order acknowledged`,
                    body: `Hi ${dealer},\n\nAck ${row.id}${project} has been issued. Production is scheduled and we'll notify you when shipping is ready.${signature}`,
                }
            }
        } else if (lifecycleTab === 'order-lifecycle' || lifecycleTab === 'shipping') {
            draft = {
                label: lifecycleTab === 'shipping' ? 'Tracking info' : 'Shipment update',
                to,
                subject: `${row.id} · shipment update`,
                body: `Hi ${dealer},\n\nQuick shipment update on ${row.id}${project}. Tracking and ETA are visible in your portal.${signature}`,
            }
        } else {
            draft = {
                label: 'Custom message',
                to,
                subject: `${row.id} · message from Sara`,
                body: `Hi ${dealer},\n\n${signature}`,
            }
        }
        setQuickMessageDraft(draft)
    }

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
    const [selectedStatus, setSelectedStatus] = useState('All Statuses')
    const [selectedLocation, setSelectedLocation] = useState('All Locations')

    const [activeTab, setActiveTab] = useState<'metrics' | 'active' | 'completed' | 'all'>('active')
    const [lifecycleTab, setLifecycleTab] = useState<'quotes' | 'orders' | 'acknowledgments' | 'order-lifecycle' | 'shipping' | 'rfqs'>('orders')
    const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

    useEffect(() => {
        const handleHighlight = (e: CustomEvent) => {
            if (e.detail === 'transactions-orders') {
                setLifecycleTab('orders');
                setActiveTab('active');
                setHighlightedSection('orders');
                setTimeout(() => setHighlightedSection(null), 4000);
            }
        };
        window.addEventListener('demo-highlight', handleHighlight as EventListener);
        return () => window.removeEventListener('demo-highlight', handleHighlight as EventListener);
    }, []);

    const currentDataSet = useMemo(() => {
        if (lifecycleTab === 'rfqs') return recentRFQs;
        if (lifecycleTab === 'quotes') return recentQuotes;
        if (lifecycleTab === 'acknowledgments') return recentAcknowledgments;

        let orders: any[] = [...recentOrders];
        const isDemoComplete = localStorage.getItem('demo_flow_complete') === 'true';
        if (isDemoComplete) {
            orders.unshift({
                id: "#ORD-7829",
                stage: "po",
                customer: currentTenant,
                client: currentTenant,
                project: "HQ Refresh",
                amount: "$124,500",
                status: "PO Received",
                date: "Just Now",
                initials: currentTenant.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
                statusColor: "bg-green-50 text-green-700 ring-green-600/20",
                location: "New York"
            });
        }
        // Post-Neocon-review (2026-06-05) · F.00 split:
        //   'orders' (PO tab)  → entries with stage 'po'  (PO Received / More Info Required / Pending Deposit)
        //   'order-lifecycle'  → entries with stage 'orders' (Acknowledged / Shipped / Invoiced / ...)
        //   'shipping'         → mirrors order-lifecycle for now; richer logic comes in Phase 6.
        if (lifecycleTab === 'orders') return orders.filter(o => o.stage === 'po')
        if (lifecycleTab === 'order-lifecycle') return orders.filter(o => o.stage === 'orders')
        if (lifecycleTab === 'shipping') return orders.filter(o => o.stage === 'orders' && (o.status === 'Shipped' || o.subPhase === 'In Transit' || o.subPhase === 'Delivered'))
        return orders;
    }, [lifecycleTab, currentTenant]);

    const statuses = useMemo(() => ['All Statuses', ...Array.from(new Set(currentDataSet.map(o => o.status)))], [currentDataSet]);
    const locations = useMemo(() => ['All Locations', ...Array.from(new Set(currentDataSet.map(o => o.location || ''))).filter(Boolean)], [currentDataSet]);
    const availableProjects = useMemo(() => ['All Projects', ...Array.from(new Set(currentDataSet.map(o => (o as any).project || ''))).filter(Boolean)], [currentDataSet]);

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

    // Dynamic URL Param Handling
    useEffect(() => {
        const handleUrlParams = () => {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            const id = params.get('id');

            if (tab === 'quotes') setLifecycleTab('quotes');
            if (tab === 'orders') setLifecycleTab('orders');
            if (tab === 'acknowledgments') setLifecycleTab('acknowledgments');

            if (id) {
                setSearchQuery(id);
                setExpandedIds(prev => {
                    const newSet = new Set(prev);
                    newSet.add(id);
                    return newSet;
                });
            }
        };

        handleUrlParams(); // Run on mount

        // Listen for internal navigation events
        window.addEventListener('popstate', handleUrlParams);
        return () => window.removeEventListener('popstate', handleUrlParams);
    }, []);

    // Dynamic Metrics Data based on current filters (Status/Location)
    const metricsData = useMemo(() => {
        const dataToAnalyze = currentDataSet.filter(order => {
            const matchesStatus = selectedStatus === 'All Statuses' || order.status === selectedStatus
            const matchesLocation = selectedLocation === 'All Locations' || (order.location || 'Unknown') === selectedLocation
            return matchesStatus && matchesLocation
        })

        const totalValue = dataToAnalyze.reduce((sum, order) => {
            const amount = (order as any).amount || '0'
            return sum + parseInt(amount.replace(/[^0-9]/g, ''))
        }, 0)

        // Active = work-in-progress · Completed = terminal states per Neocon-review taxonomies.
        // Quotes: Sent + Expired are terminal (Wendy 33:40 + 34:24); In Progress + Pending are active.
        // RFQ: Sent is terminal (Wendy 15:09 "go into quote bucket"); New + In Review + Additional Info Required are active.
        const activeCount = dataToAnalyze.filter(o => {
            if (lifecycleTab === 'quotes') return !['Sent', 'Expired'].includes((o as any).status);
            if (lifecycleTab === 'rfqs') return !['Sent'].includes((o as any).status);
            if (lifecycleTab === 'acknowledgments') return !['Confirmed'].includes((o as any).status);
            return !['Delivered', 'Completed', 'Invoiced', 'Cancelled', 'CancelledWithFee'].includes(o.status);
        }).length

        const completedCount = dataToAnalyze.filter(o => {
            if (lifecycleTab === 'quotes') return ['Sent', 'Expired'].includes((o as any).status);
            if (lifecycleTab === 'rfqs') return ['Sent'].includes((o as any).status);
            if (lifecycleTab === 'acknowledgments') return ['Confirmed'].includes((o as any).status);
            return ['Delivered', 'Completed', 'Invoiced', 'Cancelled', 'CancelledWithFee'].includes(o.status);
        }).length

        return {
            revenue: totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }),
            activeOrders: activeCount,
            completedOrders: completedCount,
            efficiency: dataToAnalyze.length > 0 ? Math.round((completedCount / dataToAnalyze.length) * 100) : 0
        }
    }, [selectedStatus, selectedLocation, currentDataSet, lifecycleTab])

    const filteredData = useMemo(() => {
        let currentData = [];
        if (lifecycleTab === 'quotes') currentData = recentQuotes;
        else if (lifecycleTab === 'acknowledgments') currentData = recentAcknowledgments;
        else currentData = recentOrders;

        return currentData.filter(item => {
            const searchString = JSON.stringify(item).toLowerCase();
            const matchesSearch = searchString.includes(searchQuery.toLowerCase());

            // Specific field checks if needed, but JSON dump is easier for generic search
            // const matchesSearch = item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            //     (item.customer || item.vendor || '').toLowerCase().includes(searchQuery.toLowerCase())

            const matchesStatus = selectedStatus === 'All Statuses' || item.status === selectedStatus
            const matchesLocation = selectedLocation === 'All Locations' || (item.location || 'Unknown') === selectedLocation

            let matchesTab = true;
            if (activeTab === 'active') {
                matchesTab = !['Delivered', 'Completed', 'Closed', 'Combined', 'Confirmed'].includes(item.status)
            } else if (activeTab === 'completed') {
                matchesTab = ['Delivered', 'Completed', 'Closed', 'Combined', 'Confirmed'].includes(item.status)
            } else if (activeTab === 'metrics') {
                matchesTab = true // Metrics view handles its own data
            }

            return matchesSearch && matchesStatus && matchesLocation && matchesTab
        })
    }, [searchQuery, selectedStatus, selectedLocation, activeTab, lifecycleTab])

    const counts = useMemo(() => {
        return {
            active: currentDataSet.filter(item => !['Delivered', 'Completed', 'Closed', 'Combined', 'Confirmed'].includes(item.status)).length,
            completed: currentDataSet.filter(item => ['Delivered', 'Completed', 'Closed', 'Combined', 'Confirmed'].includes(item.status)).length,
            all: currentDataSet.length
        }
    }, [currentDataSet])

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-10">

            {/* Main Content Content - Padded top to account for floating nav */}
            <div className={`pt-24 ${isInboundOutbound ? 'px-6 max-w-[1600px]' : 'px-4 max-w-7xl'} mx-auto space-y-6`}>

                {/* Breadcrumbs */}
                <div className="mb-4">
                    <Breadcrumbs
                        items={[
                            { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
                            { label: 'Transactions' }
                        ]}
                    />
                </div>

                {/* Lifecycle Tabs Navigation
                    Inbox Monitor + Upload chip live INSIDE the tab row (right side) — was a
                    standalone panel above but user feedback (2026-06-05 browser smoke) flagged
                    it as duplicating ActionCenter and consuming too much vertical space. */}
                {(() => {
                    const isInbound = activeProfile.id === 'inbound-outbound'
                    const inChip = (
                        <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 uppercase tracking-wider">IN</span>
                    )
                    const outChip = (
                        <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300 uppercase tracking-wider">OUT</span>
                    )
                    // New RFQ sub-counter — surfaces 'how many are waiting on us' at the tab level so it isn't missed.
                    // Post-Neocon (2026-06-05) status renamed 'Pending Review' → 'New' (Wendy 18:45 + Asly 19:01).
                    const pendingRfqCount = recentRFQs.filter(r => r.status === 'New').length
                    const pendingRfqChip = pendingRfqCount > 0 ? (
                        <span
                            title={`${pendingRfqCount} new RFQ${pendingRfqCount === 1 ? '' : 's'} awaiting review`}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30 uppercase tracking-wider"
                        >
                            {pendingRfqCount} new
                        </span>
                    ) : null
                    const showUploadAction = activeProfile.id === 'inbound-outbound' && (lifecycleTab === 'rfqs' || lifecycleTab === 'orders')
                    const uploadDocType = lifecycleTab === 'rfqs' ? 'RFQ' : 'PO'
                    return (
                <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                    <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-card/50 rounded-xl border border-border">
                        {isInbound && (
                            <button
                                onClick={() => setLifecycleTab('rfqs')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                    lifecycleTab === 'rfqs'
                                        ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"
                                        : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-foreground"
                                )}
                            >
                                <DocumentTextIcon className="w-4 h-4" />
                                Request for Quote
                                {inChip}
                                {pendingRfqChip}
                            </button>
                        )}
                        <button
                            onClick={() => setLifecycleTab('quotes')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                lifecycleTab === 'quotes'
                                    ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"

                                    : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-foreground"
                            )}
                        >
                            <DocumentTextIcon className="w-4 h-4" />
                            Quotes
                            {isInbound && outChip}
                        </button>
                        <button
                            onClick={() => setLifecycleTab('orders')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                lifecycleTab === 'orders'
                                    ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"

                                    : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-foreground"
                            )}
                        >
                            <ShoppingCartIcon className="w-4 h-4" />
                            Purchase Orders
                            {isInbound && inChip}
                        </button>
                        <button
                            onClick={() => setLifecycleTab('acknowledgments')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                lifecycleTab === 'acknowledgments'
                                    ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"

                                    : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-foreground"
                            )}
                        >
                            <ClipboardDocumentCheckIcon className="w-4 h-4" />
                            Acknowledgements
                            {isInbound && outChip}
                        </button>
                        <button
                            onClick={() => setLifecycleTab('order-lifecycle')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                lifecycleTab === 'order-lifecycle'
                                    ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"
                                    : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-foreground"
                            )}
                        >
                            <ClipboardDocumentListIcon className="w-4 h-4" />
                            Orders
                        </button>
                        <button
                            onClick={() => setLifecycleTab('shipping')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                lifecycleTab === 'shipping'
                                    ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"
                                    : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-foreground"
                            )}
                        >
                            <TruckIcon className="w-4 h-4" />
                            Shipping
                        </button>
                    </div>

                    {/* Right-side actions · Inbox Monitor chip (always for inbound-outbound) +
                        Upload PO/RFQ button (only on PO + RFQ tabs).
                        Compact placement keeps the page focused on the transactions list. */}
                    {isInbound && (
                        <div className="flex items-center gap-2">
                            <InboxMonitor />
                            {showUploadAction && (
                                <button
                                    type="button"
                                    onClick={() => openUploadModal(uploadDocType)}
                                    title={`Upload ${uploadDocType} · for documents not received via Inbox`}
                                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
                                >
                                    <CloudArrowUpIcon className="w-4 h-4" />
                                    Upload {uploadDocType}
                                </button>
                            )}
                        </div>
                    )}
                </div>
                    )
                })()}

                {/* Quotes Tab Content */}
                {lifecycleTab === 'quotes' && (
                    <>
                        {/* KPI Cards for Quotes — hidden during demo */}
                        {false && (showMetrics ? (
                            <>
                                <div className="flex justify-end mb-2">
                                    <button onClick={() => setShowMetrics(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Hide Details <ChevronUpIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 overflow-x-auto pb-4">
                                        {Object.entries(quotesSummaryByPeriod[txTimePeriod]).map(([key, data]) => (
                                            <div key={key} className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all group min-w-[200px]">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{data.label}</p>
                                                        <p className="mt-1 text-3xl font-semibold text-foreground group-hover:scale-105 transition-transform origin-left">{data.value}</p>
                                                    </div>
                                                    <div className={`p-3 rounded-xl ${data.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                                        data.color === 'orange' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                                            data.color === 'purple' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' :
                                                                data.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' :
                                                                    'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                                        }`}>
                                                        {data.icon}
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                                    <span className="font-medium">{data.sub}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Quick Actions for Quotes */}
                                <div className="flex items-center gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <span className="text-sm font-medium text-muted-foreground">Quick Actions:</span>
                                    {[
                                        { icon: <PlusIcon className="w-5 h-5" />, label: "New Quote", action: () => setIsQuoteWidgetOpen(true) },
                                        { icon: <DocumentDuplicateIcon className="w-5 h-5" />, label: "Duplicate", action: () => triggerToast('Duplicate Quote', 'Select a quote to duplicate from the list.', 'info') },
                                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF", action: () => openPEDPreview('quote') },
                                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Send to Client", action: () => triggerToast('Send to Client', 'Email prepared with quote summary. Ready to review and send.', 'info') },
                                    ].map((action, i) => (
                                        <button key={i} onClick={() => action.action && action.action()} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all text-xs font-medium">
                                            {action.icon}
                                            <span>{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            /* Collapsed Quotes Metrics */
                            <>
                                <div className="bg-white/60 dark:bg-zinc-800 backdrop-blur-md rounded-2xl p-4 border border-border shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-8 overflow-x-auto w-full scrollbar-hide px-2 scroll-smooth">
                                            {Object.entries(quotesSummaryByPeriod[txTimePeriod]).map(([key, data]) => (
                                                <div key={key} className="flex items-center gap-3 min-w-fit group cursor-default">
                                                    <div
                                                        className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${colorStyles[data.color] || 'bg-gray-100 dark:bg-card'}`}
                                                        title={data.label}
                                                    >
                                                        {data.icon}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-lg font-bold text-foreground leading-none">{data.value}</span>
                                                            <span className={`text-[10px] font-semibold ${data.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                                {data.trendUp ? '\u2191' : '\u2193'}{data.trend}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground mt-1 font-medium">{data.label}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>
                                    {/* Quick Actions Integrated - Compact */}
                                    <div className="flex items-center gap-1 overflow-x-auto min-w-max pl-4 border-l border-border xl:border-none xl:pl-0">
                                        {[
                                            { icon: <PlusIcon className="w-5 h-5" />, label: "New Quote", action: () => setIsQuoteWidgetOpen(true) },
                                            { icon: <DocumentDuplicateIcon className="w-5 h-5" />, label: "Duplicate", action: () => triggerToast('Duplicate Quote', 'Select a quote to duplicate from the list.', 'info') },
                                            { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF", action: () => openPEDPreview('quote') },
                                            { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Send to Client", action: () => triggerToast('Send to Client', 'Email prepared with quote summary.', 'info') },
                                        ].map((action, i) => (
                                            <button key={i} onClick={() => action.action && action.action()} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-foreground transition-colors relative group" title={action.label}>
                                                {action.icon}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>
                                    <button
                                        onClick={() => setShowMetrics(true)}
                                        className="flex flex-col items-center justify-center gap-1 group p-2 hover:bg-brand-300 dark:hover:bg-brand-600/50 rounded-lg transition-colors"
                                    >
                                        <ChevronDownIcon className="w-4 h-4 text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-white" />
                                        <span className="text-[10px] font-medium text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-white">Details</span>
                                    </button>
                                </div>
                            </>
                        ))}
                        <div className="mt-6"></div> {/* Spacer */}
                    </>
                )}

                {/* Acknowledgements Tab Content */}
                {lifecycleTab === 'acknowledgments' && (
                    <>
                        {/* KPI Cards for Acks — hidden during demo */}
                        {false && (showMetrics ? (
                            <>
                                <div className="flex justify-end mb-2">
                                    <button onClick={() => setShowMetrics(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Hide Details <ChevronUpIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 overflow-x-auto pb-4">
                                        {Object.entries(acksSummaryByPeriod[txTimePeriod]).map(([key, data]) => (
                                            <div key={key} className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all group min-w-[200px]">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{data.label}</p>
                                                        <p className="mt-1 text-3xl font-semibold text-foreground group-hover:scale-105 transition-transform origin-left">{data.value}</p>
                                                    </div>
                                                    <div className={`p-3 rounded-xl ${data.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                                        data.color === 'orange' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                                            data.color === 'purple' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' :
                                                                data.color === 'red' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                                                                    'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                                        }`}>
                                                        {data.icon}
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                                    <span className="font-medium">{data.sub}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Quick Actions for Acks */}
                                <div className="flex items-center gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <span className="text-sm font-medium text-muted-foreground">Quick Actions:</span>
                                    {[
                                        { icon: <CloudArrowUpIcon className="w-5 h-5" />, label: "Upload Acknowledgement", action: () => setIsAckModalOpen(true) },
                                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF", action: () => openPEDPreview('acknowledgment') },
                                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: isInboundOutbound ? "Email Dealer" : "Email Vendor", action: () => triggerToast(isInboundOutbound ? 'Email Dealer' : 'Email Vendor', isInboundOutbound ? 'Drafting dealer communication with acknowledgement details.' : 'Drafting vendor communication with acknowledgement details.', 'info') },
                                        { icon: <CheckBadgeIcon className="w-5 h-5" />, label: "Batch Approve", action: () => setIsBatchAckOpen(true) },
                                    ].map((action, i) => (
                                        <button key={i} onClick={() => action.action ? action.action() : null} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all text-xs font-medium">
                                            {action.icon}
                                            <span>{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            /* Collapsed Acks Metrics */
                            <>
                                <div className="bg-white/60 dark:bg-zinc-800 backdrop-blur-md rounded-2xl p-4 border border-border shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-8 overflow-x-auto w-full scrollbar-hide px-2 scroll-smooth">
                                            {Object.entries(acksSummaryByPeriod[txTimePeriod]).map(([key, data]) => (
                                                <div key={key} className="flex items-center gap-3 min-w-fit group cursor-default">
                                                    <div
                                                        className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${colorStyles[data.color] || 'bg-gray-100 dark:bg-card'}`}
                                                        title={data.label}
                                                    >
                                                        {data.icon}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-lg font-bold text-foreground leading-none">{data.value}</span>
                                                            <span className={`text-[10px] font-semibold ${data.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                                {data.trendUp ? '\u2191' : '\u2193'}{data.trend}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground mt-1 font-medium">{data.label}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>
                                    {/* Quick Actions Integrated - Compact */}
                                    <div className="flex items-center gap-1 overflow-x-auto min-w-max pl-4 border-l border-border xl:border-none xl:pl-0">
                                        {[
                                            { icon: <CloudArrowUpIcon className="w-5 h-5" />, label: "Upload Acknowledgement", action: () => setIsAckModalOpen(true) },
                                            { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF", action: () => openPEDPreview('acknowledgment') },
                                            { icon: <EnvelopeIcon className="w-5 h-5" />, label: isInboundOutbound ? "Email Dealer" : "Email Vendor", action: () => triggerToast(isInboundOutbound ? 'Email Dealer' : 'Email Vendor', isInboundOutbound ? 'Drafting dealer communication.' : 'Drafting vendor communication.', 'info') },
                                            { icon: <CheckBadgeIcon className="w-5 h-5" />, label: "Batch Approve", action: () => setIsBatchAckOpen(true) },
                                        ].map((action, i) => (
                                            <button key={i} onClick={() => action.action()} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-foreground transition-colors relative group" title={action.label}>
                                                {action.icon}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>
                                    <button
                                        onClick={() => setShowMetrics(true)}
                                        className="flex flex-col items-center justify-center gap-1 group p-2 hover:bg-brand-300 dark:hover:bg-brand-600/50 rounded-lg transition-colors"
                                    >
                                        <ChevronDownIcon className="w-4 h-4 text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-white" />
                                        <span className="text-[10px] font-medium text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-white">Details</span>
                                    </button>
                                </div>
                            </>
                        ))}
                        <div className="mt-6"></div> {/* Spacer */}
                    </>
                )}

                {/* Orders Content (Existing) */}
                {lifecycleTab === 'orders' && (
                    <>
                        {/* KPI Cards / Summary Panel — hidden during demo */}
                        {false && (showMetrics ? (
                            <>
                                <div className="flex justify-end mb-2">
                                    <button onClick={() => setShowMetrics(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Hide Details <ChevronUpIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="relative">
                                    <div
                                        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 overflow-x-auto pb-4"
                                        ref={expandedScrollRef}
                                    >
                                        {Object.entries(ordersSummaryByPeriod[txTimePeriod]).map(([key, data]) => (
                                            <div key={key} className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all group min-w-[200px]">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{data.label}</p>
                                                        <p className="mt-1 text-3xl font-semibold text-foreground group-hover:scale-105 transition-transform origin-left">{data.value}</p>
                                                    </div>
                                                    <div className={`p-3 rounded-xl ${data.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                                        data.color === 'orange' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                                            data.color === 'purple' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' :
                                                                data.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' :
                                                                    'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                                        }`}>
                                                        {data.icon}
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                                    <span className="font-medium">{data.sub}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Quick Actions below grid when expanded */}
                                <div className="flex items-center gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <span className="text-sm font-medium text-muted-foreground">Quick Actions:</span>
                                    {[
                                        { icon: <PlusIcon className="w-5 h-5" />, label: "New Order", action: () => setIsCreateOrderOpen(true) },
                                        { icon: <DocumentDuplicateIcon className="w-5 h-5" />, label: "Duplicate", action: () => triggerToast('Duplicate Order', 'Select an order to duplicate from the list.', 'info') },
                                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF", action: () => openPEDPreview('order') },
                                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Send Email", action: () => triggerToast('Send Email', 'Email drafted with order confirmation details.', 'info') },
                                    ].map((action, i) => (
                                        <button key={i} onClick={() => action.action && action.action()} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all text-xs font-medium">
                                            {action.icon}
                                            <span>{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="bg-white/60 dark:bg-zinc-800 backdrop-blur-md rounded-2xl p-4 border border-border shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                {/* Collapsed Ticker View - Carousel */}
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {/* Left Scroll Button */}
                                    <button
                                        onClick={() => scroll(scrollContainerRef, 'left')}
                                        className="p-1.5 rounded-full hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                    </button>

                                    <div
                                        ref={scrollContainerRef}
                                        className="flex items-center gap-8 overflow-x-auto w-full scrollbar-hide px-2 scroll-smooth"
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                        {Object.entries(ordersSummaryByPeriod[txTimePeriod]).map(([key, data]) => (
                                            <div key={key} className="flex items-center gap-3 min-w-fit group cursor-default">
                                                <div
                                                    className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${colorStyles[data.color] || 'bg-gray-100 dark:bg-card'}`}
                                                    title={data.label}
                                                >
                                                    {data.icon}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-lg font-bold text-foreground leading-none">{data.value}</span>
                                                        <span className={`text-[10px] font-semibold ${data.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                            {data.trendUp ? '\u2191' : '\u2193'}{data.trend}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground mt-1 font-medium">{data.label}</span>
                                                </div>
                                                <div className="h-8 w-px bg-border/50 ml-4 hidden md:block lg:hidden xl:block opacity-50"></div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Right Scroll Button */}
                                    <button
                                        onClick={() => scroll(scrollContainerRef, 'right')}
                                        className="p-1.5 rounded-full hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                    >
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>

                                {/* Quick Actions Integrated - Compact */}
                                <div className="flex items-center gap-1 overflow-x-auto min-w-max pl-4 border-l border-border xl:border-none xl:pl-0">
                                    {[
                                        { icon: <PlusIcon className="w-5 h-5" />, label: "New Order", action: () => setIsCreateOrderOpen(true) },
                                        { icon: <DocumentPlusIcon className="w-5 h-5" />, label: "New Quote", action: () => setIsQuoteWidgetOpen(true) },
                                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF", action: () => openPEDPreview('order') },
                                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Send Email", action: () => triggerToast('Send Email', 'Email drafted with order details.', 'info') },
                                    ].map((action, i) => (
                                        <button key={i} onClick={() => action.action()} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-foreground transition-colors relative group" title={action.label}>
                                            {action.icon}
                                        </button>
                                    ))}
                                </div>

                                <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>
                                <button
                                    onClick={() => setShowMetrics(true)}
                                    className="flex flex-col items-center justify-center gap-1 group p-2 hover:bg-brand-300 dark:hover:bg-brand-600/50 rounded-lg transition-colors"
                                >
                                    <div className="text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                        <ChevronDownIcon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Details</span>
                                </button>
                            </div>
                        ))}



                    </>
                )}

                {/* Orders (NEW · Hybrid C lifecycle) — Phase 4 implementation */}
                {lifecycleTab === 'order-lifecycle' && (
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <ClipboardDocumentListIcon className="w-5 h-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                            <div>
                                <h3 className="text-sm font-semibold text-foreground mb-1">Orders · post-Acknowledgement lifecycle</h3>
                                <p className="text-xs text-muted-foreground">Tracks orders through Acknowledged → Shipped → Invoiced → Cancelled · sub-phases In Production / Ready to Ship / In Transit / Delivered.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Shipping tab content · Phase 6.1 (Neocon-review 2026-06-05 · Wendy 51:59 "inside transactions").
                    Renders the same body as the standalone /shipping page via the shared ShippingContent component,
                    so the data + filters + drafts are one source of truth. The standalone route stays for back-compat. */}
                {lifecycleTab === 'shipping' && activeProfile.id === 'inbound-outbound' && (
                    <div className="mb-6">
                        <ShippingContent />
                    </div>
                )}

                {/* The Grid/List view handled here · skips Shipping tab since it owns its own table above. */}
                {lifecycleTab !== 'shipping' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-3">
                        <div className={cn(
                            "bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-700",
                            highlightedSection === 'orders' && "ring-4 ring-brand-500 shadow-[0_0_30px_rgba(var(--brand-500),0.6)] animate-pulse"
                        )}>
                            {/* Header for Orders */}
                            <div className={`${isInboundOutbound ? 'p-4' : 'p-6'} border-b border-border`}>
                                <div className="flex flex-col gap-6">
                                    {/* Top Row: Title + Tabs */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <h3 className="text-lg font-brand font-semibold text-foreground flex items-center gap-2 whitespace-nowrap">
                                            {/* Tab-aware header (F.00.e) so users always read the right noun. */}
                                            {lifecycleTab === 'quotes' ? 'Recent Quotes'
                                                : lifecycleTab === 'acknowledgments' ? 'Recent Acknowledgements'
                                                : lifecycleTab === 'rfqs' ? 'Recent RFQs'
                                                : lifecycleTab === 'orders' ? 'Recent Purchase Orders'
                                                : lifecycleTab === 'order-lifecycle' ? 'Recent Orders'
                                                : lifecycleTab === 'shipping' ? 'Recent Shipments'
                                                : 'Recent Orders'}
                                        </h3>
                                        <div className="hidden sm:block w-px h-6 bg-border mx-2"></div>
                                        {/* Tabs */}
                                        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit overflow-x-auto max-w-full">
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
                                                        "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 outline-none whitespace-nowrap",
                                                        activeTab === tab.id
                                                            ? "bg-primary text-primary-foreground shadow-sm"
                                                            : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-foreground"
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
                                    </div>

                                    {/* Bottom Row: Filters + Actions */}
                                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 w-full">
                                        {/* Filters Container */}
                                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full xl:w-auto">
                                            <div className="relative group w-full sm:w-auto">
                                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    placeholder={lifecycleTab === 'quotes' ? "Search quotes..." : lifecycleTab === 'acknowledgments' ? "Search acknowledgements..." : "Search orders..."}
                                                    className="pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm text-foreground w-full sm:w-48 lg:w-64 focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground transition-all"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>

                                            {/* Status Filter */}
                                            <div className="w-full sm:w-40">
                                                <Select
                                                    value={selectedStatus}
                                                    onChange={setSelectedStatus}
                                                    options={statuses}
                                                />
                                            </div>

                                            {/* Location Filter */}
                                            <div className="w-full sm:w-40">
                                                <Select
                                                    value={selectedLocation}
                                                    onChange={setSelectedLocation}
                                                    options={locations}
                                                />
                                            </div>
                                        </div>

                                        {/* Actions Group: View Mode + Create Button */}
                                        <div className="flex items-center gap-4 self-start xl:self-auto">
                                            {/* View Mode Toggle */}
                                            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                                                <button
                                                    onClick={() => setViewMode('list')}
                                                    className={cn(
                                                        "p-1.5 rounded-md transition-all",
                                                        viewMode === 'list' ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                                    )}
                                                    title="List View"
                                                >
                                                    <ListBulletIcon className="w-5 h-5" />
                                                </button>
                                                <div className="w-px h-4 bg-border mx-1"></div>
                                                <button
                                                    onClick={() => setViewMode('pipeline')}
                                                    className={cn(
                                                        "p-1.5 rounded-md transition-all",
                                                        viewMode === 'pipeline' ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                                    )}
                                                    title="Pipeline View"
                                                >
                                                    <FunnelIcon className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="w-px h-8 bg-border hidden xl:block mx-1"></div>

                                            {/* Quick Actions — icon-only with hover tooltip */}
                                            {activeTab !== 'metrics' && (
                                                <div className="flex items-center gap-1">
                                                    {lifecycleTab === 'rfqs' && (<>
                                                        <button onClick={() => openPEDPreview('quote')} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-foreground transition-colors" title="Export PDF">
                                                            <DocumentTextIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => { setConversionMode('rfq-to-quote'); setIsConversionOpen(true); }} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-foreground transition-colors" title="Convert to Quote">
                                                            <ArrowsRightLeftIcon className="w-5 h-5" />
                                                        </button>
                                                    </>)}
                                                    {lifecycleTab === 'quotes' && (<>
                                                        <button onClick={() => openDuplicate('quote')} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-foreground transition-colors" title="Duplicate">
                                                            <DocumentDuplicateIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => openPEDPreview('quote')} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-foreground transition-colors" title="Export PDF">
                                                            <DocumentTextIcon className="w-5 h-5" />
                                                        </button>
                                                        {activeProfile.id !== 'inbound-outbound' && (
                                                            <button onClick={() => { setConversionMode('quote-to-order'); setIsConversionOpen(true); }} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-foreground transition-colors" title="Convert to Order">
                                                                <ArrowsRightLeftIcon className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </>)}
                                                    {lifecycleTab === 'acknowledgments' && (<>
                                                        <button onClick={() => openPEDPreview('acknowledgment')} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-foreground transition-colors" title="Export PDF">
                                                            <DocumentTextIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => setIsBatchAckOpen(true)} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-foreground transition-colors" title="Batch Approve">
                                                            <CheckBadgeIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => setIsReconciliationOpen(true)} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-foreground transition-colors" title="Reconcile PO vs ACK">
                                                            <DocumentMagnifyingGlassIcon className="w-5 h-5" />
                                                        </button>
                                                    </>)}
                                                    {lifecycleTab === 'orders' && (<>
                                                        {/* Upload Vendor Data — Dupler d1.1: simulated hover + auto-click */}
                                                        {currentStep?.id === 'd1.1' && (
                                                            <div className="relative">
                                                                <button
                                                                    ref={sifBtnRef}
                                                                    onClick={() => { setSifClicked(true); window.dispatchEvent(new CustomEvent('dupler-vendor-upload')); }}
                                                                    className={cn(
                                                                        "p-2 rounded-lg transition-all relative",
                                                                        sifHoverSim && !sifClicked
                                                                            ? "bg-brand-300 text-zinc-900 scale-110 shadow-lg shadow-brand-400/30"
                                                                            : sifClicked
                                                                                ? "bg-brand-400 text-zinc-900 scale-95"
                                                                                : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-foreground"
                                                                    )}
                                                                    title="Upload Vendor Data"
                                                                >
                                                                    <DocumentPlusIcon className="w-5 h-5" />
                                                                </button>
                                                                {/* Simulated tooltip on hover */}
                                                                {sifHoverSim && !sifClicked && (
                                                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-medium rounded whitespace-nowrap animate-in fade-in duration-200 z-50">
                                                                        Upload Vendor Data
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <button onClick={() => openDuplicate('order')} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-foreground transition-colors" title="Duplicate">
                                                            <DocumentDuplicateIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => openPEDPreview('order')} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-foreground transition-colors" title="Export PDF">
                                                            <DocumentTextIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => { setConversionMode('order-to-ack'); setIsConversionOpen(true); }} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-foreground transition-colors" title="Convert to Acknowledgment">
                                                            <ArrowsRightLeftIcon className="w-5 h-5" />
                                                        </button>
                                                    </>)}
                                                </div>
                                            )}

                                            {/* Create/Upload buttons hidden for inbound-outbound profile · manufacturer receives, doesn't create */}
                                            {activeProfile.id !== 'inbound-outbound' && (
                                                <>
                                                    <div className="w-px h-8 bg-border hidden xl:block mx-1"></div>
                                                    <button
                                                        onClick={() => {
                                                            if (lifecycleTab === 'quotes') {
                                                                setIsQuoteWidgetOpen(true);
                                                            } else if (lifecycleTab === 'acknowledgments') {
                                                                setIsAckModalOpen(true);
                                                                /* @ts-ignore */
                                                                if (onNavigate) onNavigate('order-detail');
                                                            } else {
                                                                setIsCreateOrderOpen(true);
                                                            }
                                                        }}
                                                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
                                                    >
                                                        <PlusIcon className="w-4 h-4" />
                                                        <span>
                                                            {lifecycleTab === 'quotes' ? 'Create Quote' : lifecycleTab === 'acknowledgments' ? 'Upload Acknowledgement' : 'Create Order'}
                                                        </span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <CreateOrderModal isOpen={isCreateOrderOpen} onClose={() => setIsCreateOrderOpen(false)} />

                            {/* Smart Quote Hub Modal */}
                            <Transition appear show={isQuoteWidgetOpen} as={Fragment}>
                                <Dialog as="div" className="relative z-50" onClose={() => setIsQuoteWidgetOpen(false)}>
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
                                                <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-card shadow-xl transition-all">
                                                    <div className="relative">
                                                        {/* Close X Button - Floating */}
                                                        <button
                                                            onClick={() => setIsQuoteWidgetOpen(false)}
                                                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 hover:bg-Card backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                        <SmartQuoteHub onNavigate={(page: string) => { setIsQuoteWidgetOpen(false); onNavigate(page); }} />
                                                    </div>
                                                </DialogPanel>
                                            </TransitionChild>
                                        </div>
                                    </div>
                                </Dialog>
                            </Transition>

                            {/* Main Content Area */}
                            <div className={`${isInboundOutbound ? 'p-4' : 'p-6'} bg-muted/50 dark:bg-black/20 min-h-[500px]`}>

                                {/* ═══ CONTINUA STEP 2.2 — Procurement: Notification + Expert Question (inline) ═══ */}
                                {isContinua && stepId === '3.2' && (procPhase === 'notification' || procPhase === 'expert-question') && (
                                    <div className="space-y-4 mb-6">
                                        {/* Notification */}
                                        {procPhase === 'notification' && (
                                            <button onClick={() => setProcPhase('expert-question')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-9 w-9 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
                                                            <ClipboardDocumentListIcon className="h-5 w-5 text-zinc-900" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-xs font-bold text-foreground">PO Package Generation — Corporate HQ Project</span>
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">12 manufacturers</span>
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">$3.2M project</span>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                                <strong className="text-foreground">ProcurementAgent</strong> will parse 1,500 line items, compare contract vs list pricing across <strong className="text-foreground">4 price sources</strong>, apply 5 business rules, and generate consolidated POs.
                                                            </p>
                                                            <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                                                                <span>Orders: <strong className="text-foreground">3 consolidated POs</strong> from 12 manufacturers</span>
                                                                <span>·</span>
                                                                <span>Part of: <strong className="text-foreground">Corporate HQ — Phase 2</strong></span>
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-2 text-[10px] text-brand-700 dark:text-brand-400 font-medium">
                                                                <span>Click to review procurement decisions</span>
                                                                <ArrowRightIcon className="h-3 w-3" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        )}

                                        {/* Expert Question — inline before lupa */}
                                        {procPhase === 'expert-question' && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                {/* Expert question card */}
                                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 border-2 border-amber-300 dark:border-amber-500/30">
                                                    <div className="flex items-start gap-3">
                                                        <AIAgentAvatar size="sm" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Expert Review Required</span>
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">Decision needed</span>
                                                            </div>
                                                            <p className="text-[11px] text-amber-800 dark:text-amber-200">
                                                                DIRTT architectural walls have a <strong>12-week lead time</strong> (exceeds 8-week threshold). This impacts floor 5 installation schedule. Should we:
                                                            </p>
                                                            <div className="mt-3 space-y-2">
                                                                <button
                                                                    onClick={() => setExpertAnswer('priority')}
                                                                    className={cn("w-full text-left p-2.5 rounded-lg border transition-all text-[11px]",
                                                                        expertAnswer === 'priority'
                                                                            ? "border-green-400 bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-200 ring-2 ring-green-400/30"
                                                                            : "border-amber-200 dark:border-amber-500/20 bg-white/60 dark:bg-zinc-900/40 text-foreground hover:border-amber-300 hover:bg-amber-50/50"
                                                                    )}
                                                                >
                                                                    <span className="font-bold">A. Priority order DIRTT now</span> — Submit PO-HQ-002 immediately, before the full package. Prevents further delays.
                                                                </button>
                                                                <button
                                                                    onClick={() => setExpertAnswer('resequence')}
                                                                    className={cn("w-full text-left p-2.5 rounded-lg border transition-all text-[11px]",
                                                                        expertAnswer === 'resequence'
                                                                            ? "border-green-400 bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-200 ring-2 ring-green-400/30"
                                                                            : "border-amber-200 dark:border-amber-500/20 bg-white/60 dark:bg-zinc-900/40 text-foreground hover:border-amber-300 hover:bg-amber-50/50"
                                                                    )}
                                                                >
                                                                    <span className="font-bold">B. Resequence installation</span> — Start with floors 4 & 6, push floor 5 to week 12+. Notify GC of schedule change.
                                                                </button>
                                                            </div>
                                                            {expertAnswer && (
                                                                <div className="mt-3 p-2 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 animate-in fade-in duration-300">
                                                                    <p className="text-[10px] text-green-700 dark:text-green-300 flex items-center gap-1.5">
                                                                        <CheckCircleIcon className="h-3.5 w-3.5" />
                                                                        <span><strong>Expert decision recorded.</strong> {expertAnswer === 'priority' ? 'PO-HQ-002 flagged for priority submission.' : 'Installation re-sequence initiated — GC notification queued.'} Processing PO package...</span>
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ═══ CONTINUA STEP 3.2 — PO Generated Summary ═══ */}
                                {isContinua && stepId === '3.2' && procPhase === 'po-generated' && ackPhase === 'idle' && (
                                    <div className="space-y-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                            <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-indigo-600 text-white">
                                                        <ClipboardDocumentCheckIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-foreground">PO Package Generated — Corporate HQ</h3>
                                                        <p className="text-[11px] text-muted-foreground mt-0.5">3 consolidated POs · 12 manufacturers · $3.2M total</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold">Generated</span>
                                            </div>
                                            <div className="p-4">
                                                <div className="space-y-2">
                                                    {PO_LINE_ITEMS.map((po, i) => (
                                                        <div key={i} className={cn("p-3 rounded-xl border flex items-center justify-between gap-4",
                                                            po.status === 'lead-time' ? "border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5" : "border-border bg-muted/20"
                                                        )}>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-xs font-bold text-foreground">{po.manufacturer}</p>
                                                                    {po.status === 'lead-time' && (
                                                                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">12wk Lead Time</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground mt-0.5">{po.items}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-right shrink-0">
                                                                <div>
                                                                    <p className="text-[10px] text-muted-foreground">Amount</p>
                                                                    <p className="text-xs font-bold text-foreground">{po.poAmount}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-muted-foreground">Savings</p>
                                                                    <p className="text-xs font-bold text-green-600 dark:text-green-400">{po.savings}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="px-4 py-2 border-t border-border/50 bg-muted/20">
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                                    <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                                                    Initiating ACK tracking for 12 purchase orders...
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ═══ CONTINUA STEP 3.2 — ACK Tracking (chained from PO Generation) ═══ */}
                                {isContinua && stepId === '3.2' && ackPhase !== 'idle' && (
                                    <div data-demo-target="ack-tracking-dashboard" className="space-y-4 mb-6">
                                        {/* Notification banner */}
                                        {ackPhase === 'notification' && (
                                            <button onClick={() => setAckPhase('tab-switch')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 rounded-lg bg-indigo-600 text-white">
                                                            <DocumentMagnifyingGlassIcon className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-xs font-bold text-foreground">TrackingAgent — ACK Validation</span>
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold">12 POs</span>
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 font-bold">9 ACKs received</span>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                                Monitoring <strong className="text-foreground">12 active purchase orders</strong>. 9 ACKs received — auto-validating qty, price, and delivery dates against POs.
                                                            </p>
                                                            <div className="flex items-center gap-1 mt-2 text-[10px] text-brand-700 dark:text-brand-400 font-medium">
                                                                <span>Click to view validation</span>
                                                                <ArrowRightIcon className="h-3 w-3" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        )}

                                        {/* Validation progress + Knoll alert */}
                                        {(ackPhase === 'validating' || ackPhase === 'alert') && (
                                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <AIAgentAvatar size="sm" />
                                                    <span className="text-xs font-bold text-foreground">
                                                        {ackKnollAlert
                                                            ? 'Discrepancy Detected — Knoll ACK'
                                                            : `TrackingAgent Validating ACKs... (${ackValidatedCount}/9)`
                                                        }
                                                    </span>
                                                    {ackKnollAlert && (
                                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-600 text-white font-bold animate-pulse">Price +4%</span>
                                                    )}
                                                </div>
                                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                                    <div className={cn("h-full rounded-full transition-all duration-700 ease-linear", ackKnollAlert ? "bg-red-500" : "bg-indigo-500")}
                                                        style={{ width: `${ackKnollAlert ? 100 : Math.round((ackValidatedCount / 9) * 100)}%` }} />
                                                </div>
                                                {ackKnollAlert && (
                                                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 animate-in fade-in duration-300">
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <ExclamationTriangleIcon className="h-4 w-4 text-red-600 shrink-0" />
                                                            <span className="font-bold text-red-700 dark:text-red-400">Knoll ACK: +4% price increase</span>
                                                            <span className="text-red-600/70 dark:text-red-400/70">on task chairs vs contract</span>
                                                        </div>
                                                        <p className="text-[10px] text-red-600/80 dark:text-red-400/70 mt-1 ml-6">Auto-generating dispute draft with contractual evidence...</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Done — PO Package Validated + Next Step */}
                                        {ackPhase === 'done' && (
                                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                                        <div>
                                                            <p className="text-xs font-bold text-foreground">PO Package Validated — Ready for ACK Conversion</p>
                                                            <p className="text-[10px] text-muted-foreground mt-0.5">9/12 ACKs validated · Knoll dispute draft generated · 3 pending with aging alerts</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={nextStep} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-300 hover:bg-brand-400 dark:bg-brand-400 dark:hover:bg-brand-300 text-zinc-900 text-[11px] font-bold shadow-sm transition-all hover:scale-[1.02]">
                                                        Next Step
                                                        <ArrowRightIcon className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ═══ CONTINUA STEP 3.3 — PO to ACK Conversion ═══ */}
                                {isContinua && stepId === '3.3' && convPhase !== 'idle' && (
                                    <div data-demo-target="po-ack-conversion" className="space-y-4 mb-6">
                                        {/* Notification */}
                                        {convPhase === 'notification' && (
                                            <button onClick={() => setConvPhase('review')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 rounded-lg bg-indigo-600 text-white">
                                                            <ArrowsRightLeftIcon className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-xs font-bold text-foreground">Quick Action — PO to ACK Conversion</span>
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold">$3.2M</span>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                                Review conversion checklist: contract compliance, quantities, delivery schedule, and price verification before converting PO package to Acknowledgement.
                                                            </p>
                                                            <div className="flex items-center gap-1 mt-2 text-[10px] text-brand-700 dark:text-brand-400 font-medium">
                                                                <span>Click to start conversion review</span>
                                                                <ArrowRightIcon className="h-3 w-3" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        )}

                                        {/* Review + Price Check + Convert */}
                                        {(convPhase === 'review' || convPhase === 'price-check' || convPhase === 'ready' || convPhase === 'converted') && (
                                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-indigo-600 text-white">
                                                                <ArrowsRightLeftIcon className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-bold text-foreground">PO to ACK Conversion Review</h3>
                                                                <p className="text-[11px] text-muted-foreground mt-0.5">Quick Action — Corporate HQ Project · $3.2M</p>
                                                            </div>
                                                        </div>
                                                        <span className={cn("text-[10px] px-2.5 py-1 rounded-full font-bold",
                                                            convPhase === 'converted' ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                                                                : convPhase === 'ready' ? "bg-brand-100 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 animate-pulse"
                                                                    : "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                                                        )}>
                                                            {convPhase === 'converted' ? 'Converted' : convPhase === 'ready' ? 'Ready' : 'Reviewing'}
                                                        </span>
                                                    </div>

                                                    {/* Conversion Checklist */}
                                                    <div className="p-4">
                                                        <h4 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Conversion Checklist</h4>
                                                        <div className="space-y-2">
                                                            {CONVERSION_CHECKLIST.map((item, i) => (
                                                                <div key={i} className={cn(
                                                                    "p-3 rounded-xl border flex items-center gap-3 transition-all duration-300",
                                                                    i < convChecklistVisible
                                                                        ? item.status === 'pass' ? "border-green-200 dark:border-green-500/20 bg-green-50/50 dark:bg-green-500/5"
                                                                            : item.status === 'warning' ? "border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5"
                                                                                : "border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5"
                                                                        : "border-border bg-muted/20 opacity-40"
                                                                )}>
                                                                    {i < convChecklistVisible ? (
                                                                        item.status === 'pass' ? <CheckCircleIcon className="h-4 w-4 text-green-600 shrink-0" />
                                                                            : item.status === 'warning' ? <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 shrink-0" />
                                                                                : <ArrowPathIcon className="h-4 w-4 text-indigo-600 animate-spin shrink-0" />
                                                                    ) : (
                                                                        <div className="h-4 w-4 rounded-full border-2 border-border shrink-0" />
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-bold text-foreground">{item.label}</p>
                                                                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.detail}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Price Verification */}
                                                    {(convPhase === 'price-check' || convPhase === 'ready' || convPhase === 'converted') && (
                                                        <div className="mx-4 mb-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 animate-in fade-in duration-300">
                                                            <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-1.5">
                                                                <DocumentMagnifyingGlassIcon className="h-4 w-4" />
                                                                Price Verification — Manufacturer Catalogs
                                                            </h4>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {PRICE_CHECKS.map((check, i) => (
                                                                    <div key={i} className={cn(
                                                                        "p-2.5 rounded-lg border flex items-center justify-between transition-all duration-300",
                                                                        i < priceChecksVisible
                                                                            ? check.status === 'pass'
                                                                                ? "border-green-200 dark:border-green-500/20 bg-green-50/50 dark:bg-green-500/5"
                                                                                : "border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5"
                                                                            : "border-border bg-muted/20 opacity-40"
                                                                    )}>
                                                                        <div className="flex items-center gap-2">
                                                                            {i < priceChecksVisible ? (
                                                                                check.status === 'pass'
                                                                                    ? <CheckCircleIcon className="h-4 w-4 text-green-600 shrink-0" />
                                                                                    : <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 shrink-0" />
                                                                            ) : (
                                                                                <div className="h-4 w-4 rounded-full border-2 border-border shrink-0" />
                                                                            )}
                                                                            <span className="text-[11px] font-medium text-foreground">{check.source}</span>
                                                                        </div>
                                                                        {i < priceChecksVisible && (
                                                                            <span className={cn("text-[10px] font-bold",
                                                                                check.status === 'pass' ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"
                                                                            )}>
                                                                                {check.match}/{check.match + check.mismatch} matched
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {priceChecksVisible >= PRICE_CHECKS.length && (
                                                                <div className="mt-3 p-2 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 animate-in fade-in duration-300">
                                                                    <p className="text-[10px] text-green-700 dark:text-green-300 flex items-center gap-1.5">
                                                                        <CheckCircleIcon className="h-3.5 w-3.5" />
                                                                        <span><strong>Price verification complete.</strong> 45/46 items match contract pricing. 1 volume discount adjustment applied.</span>
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Footer: Convert button / Confirmation */}
                                                    <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between bg-muted/20">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                                <CurrencyDollarIcon className="h-3.5 w-3.5" />
                                                                Total: <span className="font-bold text-foreground">$3.2M</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                                <ClipboardDocumentListIcon className="h-3.5 w-3.5" />
                                                                <span className="font-medium text-foreground">12 manufacturers</span>
                                                            </div>
                                                        </div>
                                                        {convPhase === 'converted' ? (
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center gap-1.5 text-[10px] text-green-700 dark:text-green-400 font-bold animate-in fade-in duration-300">
                                                                    <CheckCircleIcon className="h-3.5 w-3.5" />
                                                                    PO Converted to Acknowledgement
                                                                </div>
                                                                <button onClick={nextStep} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-300 hover:bg-brand-400 dark:bg-brand-400 dark:hover:bg-brand-300 text-zinc-900 text-[11px] font-bold shadow-sm transition-all hover:scale-[1.02]">
                                                                    Next Step
                                                                    <ArrowRightIcon className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ) : convPhase === 'ready' ? (
                                                            <button onClick={() => setConvPhase('converted')}
                                                                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] animate-pulse ring-2 ring-indigo-400 ring-offset-2 ring-offset-card">
                                                                <ArrowsRightLeftIcon className="h-4 w-4" />
                                                                Convert PO to Acknowledgement
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                                                                Verifying...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ═══ CONTINUA STEP 3.4 — Approval Chain ═══ */}
                                {isContinua && stepId === '3.4' && approvalPhase !== 'idle' && (
                                    <div data-demo-target="approval-chain-progress" className="space-y-4 mb-6">
                                        {/* Notification */}
                                        {approvalPhase === 'notification' && (
                                            <button onClick={() => setApprovalPhase('chain')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 rounded-lg bg-indigo-600 text-white">
                                                            <ShieldCheckIcon className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-xs font-bold text-foreground">Approval Chain — PO to ACK Conversion</span>
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold">3-Level</span>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                                Sequential approval required: AI Compliance Agent, Expert Regional Sales Manager Reyes, and Dealer Account Manager Kai must approve the $3.2M conversion.
                                                            </p>
                                                            <div className="flex items-center gap-1 mt-2 text-[10px] text-brand-700 dark:text-brand-400 font-medium">
                                                                <span>Click to start approval chain</span>
                                                                <ArrowRightIcon className="h-3 w-3" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        )}

                                        {/* Approval chain */}
                                        {(approvalPhase === 'chain' || approvalPhase === 'done') && (
                                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-indigo-600 text-white">
                                                                <ShieldCheckIcon className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-bold text-foreground">Approval Chain</h3>
                                                                <p className="text-[11px] text-muted-foreground mt-0.5">Sequential approval: AI → Expert → Dealer</p>
                                                            </div>
                                                        </div>
                                                        <span className={cn("text-[10px] px-2.5 py-1 rounded-full font-bold",
                                                            approvalSteps.every(s => s.status === 'approved')
                                                                ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                                                                : "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                                                        )}>
                                                            {approvalSteps.filter(s => s.status === 'approved').length}/{approvalSteps.length} Approved
                                                        </span>
                                                    </div>

                                                    <div className="p-4 space-y-3">
                                                        {approvalSteps.map((step, i) => (
                                                            <div key={step.id} className={cn(
                                                                "p-3 rounded-xl border flex items-center gap-4 transition-all duration-500",
                                                                step.status === 'approved'
                                                                    ? "border-green-200 dark:border-green-500/20 bg-green-50/50 dark:bg-green-500/5"
                                                                    : step.status === 'pending-action'
                                                                        ? "border-brand-400 dark:border-brand-500/40 bg-brand-50 dark:bg-brand-500/5 ring-2 ring-brand-400/30 animate-pulse"
                                                                        : "border-border bg-muted/20 opacity-60"
                                                            )}>
                                                                {step.status === 'approved' ? (
                                                                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center shrink-0">
                                                                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                                                    </div>
                                                                ) : step.status === 'pending-action' ? (
                                                                    <div className="h-8 w-8 rounded-full bg-brand-200 dark:bg-brand-500/20 flex items-center justify-center shrink-0">
                                                                        <span className="text-xs font-bold text-zinc-900">{i + 1}</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                                        <ClockIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-bold text-foreground">{step.role}</p>
                                                                    <p className="text-[10px] text-muted-foreground mt-0.5">{step.detail}</p>
                                                                </div>
                                                                {step.status === 'approved' ? (
                                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 font-bold shrink-0">Approved</span>
                                                                ) : step.status === 'pending-action' ? (
                                                                    <button onClick={() => {
                                                                        setApprovalSteps(prev => prev.map(s => s.id === step.id ? { ...s, status: 'approved' as const } : s))
                                                                        setApprovalPhase('done')
                                                                    }}
                                                                        className="px-3 py-1.5 rounded-lg bg-brand-300 hover:bg-brand-400 dark:bg-brand-400 dark:hover:bg-brand-300 text-zinc-900 text-[10px] font-bold shadow-sm transition-all hover:scale-[1.02] shrink-0">
                                                                        Approve
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium shrink-0">Waiting</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between bg-muted/20">
                                                        {approvalSteps.every(s => s.status === 'approved') ? (
                                                            <>
                                                                <div className="flex items-center gap-2 text-[10px] text-green-700 dark:text-green-400 font-bold">
                                                                    <CheckCircleIcon className="h-4 w-4" />
                                                                    PO-to-ACK Conversion Approved — All levels cleared
                                                                </div>
                                                                <button onClick={nextStep} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-300 hover:bg-brand-400 dark:bg-brand-400 dark:hover:bg-brand-300 text-zinc-900 text-[11px] font-bold shadow-sm transition-all hover:scale-[1.02]">
                                                                    Next Step
                                                                    <ArrowRightIcon className="h-3 w-3" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground w-full">
                                                                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                                                                Awaiting approval chain completion...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ═══ Continua Step 1.5 — Consignment & Vendor Returns (interactive) ═══ */}
                                {isContinua && stepId === '1.5' && csgnPhase !== 'idle' && (
                                    <div data-demo-target="consignment-decisions" className="space-y-4 mb-6">
                                        {/* Notification */}
                                        {csgnPhase === 'notification' && (
                                            <button onClick={() => setCsgnPhase('processing')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 rounded-lg bg-amber-600 text-white"><ClockIcon className="h-4 w-4" /></div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-foreground">Consignment Review — 90-Day Window</span>
                                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-600 text-white font-bold">12 urgent</span>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground mt-1">ConsignmentAgent: <span className="font-semibold text-foreground">35 items on consignment</span> from 4 manufacturers. 12 approaching 90-day return window — decisions needed this week.</p>
                                                            <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to review decisions <ArrowRightIcon className="h-3 w-3" /></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        )}

                                        {/* Processing */}
                                        {csgnPhase === 'processing' && (
                                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <AIAgentAvatar size="sm" />
                                                    <span className="text-xs font-bold text-foreground">ConsignmentAgent Analyzing Items...</span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                                    <div className="h-full rounded-full bg-amber-500 transition-all duration-[3500ms] ease-linear" style={{ width: `${csgnProgress}%` }} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    {csgnAgents.map(agent => (
                                                        <div key={agent.name} className={cn("flex items-center gap-2 text-[10px] transition-all duration-300", agent.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")}>
                                                            {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-amber-500 animate-spin shrink-0" />}
                                                            <span className={cn("font-medium", agent.done ? "text-foreground" : "text-amber-600 dark:text-amber-400")}>{agent.name}</span>
                                                            <span className="text-muted-foreground">{agent.detail}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Breathing */}
                                        {csgnPhase === 'breathing' && (
                                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-xs font-semibold text-muted-foreground">Processing complete — syncing external systems...</span>
                                            </div>
                                        )}

                                        {/* Confirmed */}
                                        {(csgnPhase === 'revealed' || csgnPhase === 'results') && (
                                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30 animate-in fade-in duration-300">
                                                <div className="flex items-start gap-2">
                                                    <AIAgentAvatar size="sm" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-green-800 dark:text-green-200"><span className="font-bold">ConsignmentAgent:</span> 35 items reviewed — <span className="font-semibold">4 RMA auto-generated</span> ($8,760). AI recommends converting 4 items to purchase (demand up 12%).</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">External Systems · Synced</span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                            {['Consignment DB', 'RMA Portal', 'Demand Forecast', 'Inventory WMS', 'Vendor Portal'].map(sys => (
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
                                        {csgnPhase === 'results' && (
                                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                                    {/* Header */}
                                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                                        <div>
                                                            <h3 className="text-sm font-bold text-foreground">Consignment Decisions — 4 Manufacturers</h3>
                                                            <p className="text-[11px] text-muted-foreground mt-0.5">35 items total · 12 approaching window · 4 RMA generated · 4 convert-to-purchase</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-bold">4 Return</span>
                                                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold">4 Purchase</span>
                                                        </div>
                                                    </div>

                                                    {/* Items */}
                                                    <div className="p-4 space-y-2">
                                                        {CONSIGNMENT_ITEMS.map((item, i) => (
                                                            <div key={i} className={cn("flex items-center justify-between p-3 rounded-xl border",
                                                                item.decision === 'return' ? "border-red-200 dark:border-red-500/20 bg-red-50/30 dark:bg-red-500/5" :
                                                                "border-green-200 dark:border-green-500/20 bg-green-50/30 dark:bg-green-500/5"
                                                            )}>
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0",
                                                                        item.decision === 'return' ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400" :
                                                                        "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                                                                    )}>{item.decision === 'return' ? 'RMA' : 'Purchase'}</span>
                                                                    <div className="min-w-0">
                                                                        <p className="text-[11px] font-medium text-foreground truncate">{item.name}</p>
                                                                        <p className="text-[10px] text-muted-foreground">{item.manufacturer} · Qty: {item.qty} · {item.reason}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                                                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold",
                                                                        item.daysLeft <= 14 ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400" :
                                                                        item.daysLeft <= 30 ? "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400" :
                                                                        "bg-zinc-200 dark:bg-zinc-700 text-muted-foreground"
                                                                    )}>{item.daysLeft}d left</span>
                                                                    <span className="text-[11px] font-bold text-foreground">{item.value}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Summary + CTA */}
                                                    <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between bg-muted/20">
                                                        <div>
                                                            <p className="text-[10px] text-muted-foreground">4 RMA auto-generated · 4 items recommended for purchase (demand up 12%)</p>
                                                            <p className="text-[11px] font-bold text-foreground mt-0.5">Return value: $8,760 · Purchase value: $7,265</p>
                                                        </div>
                                                        <button onClick={nextStep} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-300 hover:bg-brand-400 dark:bg-brand-400 dark:hover:bg-brand-300 text-zinc-900 text-[11px] font-bold shadow-sm transition-all hover:scale-[1.02]">
                                                            <CheckCircleIcon className="h-3.5 w-3.5" />Process Decisions<ArrowRightIcon className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* D1' · OCR Kanban for RFQ tab · only when viewMode is pipeline (default is list per inbound-outbound) */}
                                {isInboundOutbound && lifecycleTab === 'rfqs' && activeTab !== 'metrics' && viewMode === 'pipeline' ? (
                                    <OCRPipeline
                                        cards={recentRFQs.map<OCRCard>(r => ({
                                            id: r.id,
                                            customer: r.customer,
                                            project: r.project,
                                            amount: r.amount,
                                            source: r.source as OCRCard['source'],
                                            confidence: r.source === 'Email' ? 92 : r.source === 'NetSuite' ? 98 : r.source === 'Dealer Portal' ? 95 : 100,
                                            sla: `valid until ${r.validUntil}`,
                                            contract: r.contract,
                                            onClick: () => onNavigateToDetail('rfq-detail'),
                                        }))}
                                        statusByCard={Object.fromEntries(recentRFQs.map(r => [r.id, r.status]))}
                                    />
                                ) : activeTab === 'metrics' ? (
                                    <div className="space-y-8">
                                        {/* Period Selector */}
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-brand font-semibold text-foreground">{trendLabels[txTimePeriod]}</h3>
                                            <div className="flex items-center gap-1 bg-muted/60 dark:bg-zinc-800/60 rounded-lg p-0.5">
                                                {(['Day', 'Week', 'Month', 'Quarter'] as TimePeriod[]).map((p) => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setTxTimePeriod(p)}
                                                        className={cn(
                                                            'px-3 py-1 text-xs font-medium rounded-md transition-all',
                                                            txTimePeriod === p
                                                                ? 'bg-card dark:bg-zinc-700 text-foreground shadow-sm'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                        )}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-300">
                                            {/* Revenue Card */}
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-6 border border-green-200 dark:border-green-800/20 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                                        {lifecycleTab === 'quotes' ? 'Quote Value' : lifecycleTab === 'acknowledgments' ? 'Pending Value' : 'Total Revenue'}
                                                    </p>
                                                    <CurrencyDollarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{metricsData.revenue}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn('text-xs font-semibold', metricsByPeriod[txTimePeriod].revenueTrendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
                                                            {metricsByPeriod[txTimePeriod].revenueTrendUp ? '↑' : '↓'} {metricsByPeriod[txTimePeriod].revenueTrend}
                                                        </span>
                                                        <span className="text-[10px] text-green-600/60 dark:text-green-400/60">vs prev.</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Active Orders Card */}
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/20 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                                        {lifecycleTab === 'quotes' ? 'Active Quotes' : lifecycleTab === 'acknowledgments' ? 'Pending Acknowledgements' : 'Active Orders'}
                                                    </p>
                                                    <ShoppingBagIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{metricsData.activeOrders}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn('text-xs font-semibold', metricsByPeriod[txTimePeriod].activeTrendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
                                                            {metricsByPeriod[txTimePeriod].activeTrendUp ? '↑' : '↓'} {metricsByPeriod[txTimePeriod].activeTrend}
                                                        </span>
                                                        <span className="text-[10px] text-blue-600/60 dark:text-blue-400/60">vs prev.</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Completion Rate Card */}
                                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800/20 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                                                        {lifecycleTab === 'quotes' ? 'Win Rate' : lifecycleTab === 'acknowledgments' ? 'Conf. Rate' : 'Completion Rate'}
                                                    </p>
                                                    <ChartBarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{metricsData.efficiency}%</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn('text-xs font-semibold', metricsByPeriod[txTimePeriod].efficiencyTrendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
                                                            {metricsByPeriod[txTimePeriod].efficiencyTrendUp ? '↑' : '↓'} {metricsByPeriod[txTimePeriod].efficiencyTrend}
                                                        </span>
                                                        <span className="text-[10px] text-indigo-600/60 dark:text-indigo-400/60">vs prev.</span>
                                                    </div>
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
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn('text-xs font-semibold', metricsByPeriod[txTimePeriod].projectTrendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
                                                            {metricsByPeriod[txTimePeriod].projectTrendUp ? '↑' : '↓'} {metricsByPeriod[txTimePeriod].projectTrend}
                                                        </span>
                                                        <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60">vs prev.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-[300px] w-full bg-card rounded-2xl p-6 border border-border shadow-sm">
                                            <h4 className="text-md font-medium text-foreground mb-4">{lifecycleTab === 'orders' ? 'Sales' : lifecycleTab === 'quotes' ? 'Pipeline' : 'Acknowledgements'} — {trendLabels[txTimePeriod]}</h4>
                                            <ResponsiveContainer width="100%" height="85%">
                                                <BarChart data={salesDataByPeriod[txTimePeriod]}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                                                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} animationDuration={600} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                ) : viewMode === 'list' ? (
                                    /* List View */
                                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-muted/50 border-b border-border">
                                                    <tr>
                                                        {/* Post-Neocon-review (2026-06-05) · L.16.f: VENDOR column renamed DEALER in manufacturer view
                                                            (the user IS the manufacturer; showing "Vertex Manufacturing" as Vendor is redundant). */}
                                                        <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider" title={lifecycleTab === 'acknowledgments' ? 'Dealer the ack was sent to and their location' : 'Dealer / customer + transaction ID + sales rep'}>{lifecycleTab === 'acknowledgments' ? 'Dealer' : 'Details'}</th>
                                                        <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider" title={lifecycleTab === 'acknowledgments' ? 'Linked PO number and project location' : 'End customer + project + city'}>{lifecycleTab === 'acknowledgments' ? 'PO & Location' : 'Project & Location'}</th>
                                                        {/* L.16.d: DISCREPANCY column removed (info now surfaces as subFlag chip on the STATUS column). */}
                                                        <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider" title="Document net amount in USD">Amount</th>
                                                        <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider" title="Current lifecycle stage of the document">Status</th>
                                                        {/* L.4: SOURCE column hidden on Acks (outbound · manufacturer is sender, not receiver). */}
                                                        {activeProfile.id === 'inbound-outbound' && lifecycleTab !== 'acknowledgments' && (
                                                            <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider" title="Channel Strata received this document through (Email, Dealer Portal, NetSuite, Manual)">Source</th>
                                                        )}
                                                        {activeProfile.id === 'inbound-outbound' && lifecycleTab === 'quotes' && (
                                                            <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider" title="Bid contract reference (GSA, CoNY, OMNIA, etc.) used to price this quote">Contract</th>
                                                        )}
                                                        {activeProfile.id === 'inbound-outbound' && lifecycleTab === 'orders' && (
                                                            <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider" title="Promised ship date for this order">Ship Date</th>
                                                        )}
                                                        {/* Shipment # column removed per L.4 (Neocon-review 2026-06-05) — Wendy: shipment number
                                                            isn't available yet at the moment the Ack is sent. Surfaces later on Orders/Shipping tabs. */}
                                                        <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider" title={lifecycleTab === 'quotes' ? 'Expiration date — when this quote stops being valid' : lifecycleTab === 'rfqs' || lifecycleTab === 'orders' ? 'Received date — when this document arrived at the manufacturer' : 'Sent date — when this document went out to the dealer'}>{lifecycleTab === 'quotes' ? 'Expiration Date' : lifecycleTab === 'rfqs' || lifecycleTab === 'orders' ? 'Received Date' : 'Sent Date'}</th>
                                                        <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right" title="Quick actions for this row (view, edit, convert, etc.)">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {filteredData.map((order: any) => (
                                                        <Fragment key={order.id}>
                                                            <tr
                                                                className={cn(
                                                                    "group hover:bg-muted/50 transition-all cursor-pointer",
                                                                    (procPhase === 'highlight' || procPhase === 'lupa-active') && order.id === '#ORD-2055' && "ring-2 ring-brand-400 ring-offset-2 ring-offset-background bg-brand-50/30 dark:bg-brand-500/5 shadow-lg animate-pulse"
                                                                )}
                                                                onClick={() => toggleExpand(order.id)}
                                                            >
                                                                <td className="p-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                                                            {order.initials}
                                                                        </div>
                                                                        <div>
                                                                            {/* L.16.f: in Ack tab show the DEALER (recipient of the Ack), not the Vendor (= us, the manufacturer). */}
                                                                            <div className={cn("font-medium text-foreground", isInboundOutbound && "whitespace-nowrap")}>{lifecycleTab === 'acknowledgments' ? ((order as any).dealer || order.customer) : order.customer}</div>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="text-xs text-muted-foreground">{order.id}</div>
                                                                                {order.id === '#ORD-7829' && (
                                                                                    <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                                                                                        New
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {/* Wendy item 2a + 2d · Sales Rep + Rev # surfaced on every row */}
                                                                            {isInboundOutbound && (
                                                                                <div className="flex items-center gap-2 mt-1">
                                                                                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                                                                        <span className="h-3.5 w-3.5 rounded-full bg-primary/20 text-foreground text-[7px] font-bold uppercase tracking-wider flex items-center justify-center">DP</span>
                                                                                        Rep · <strong className="text-foreground font-medium not-italic">Regional Sales Manager Reyes</strong>
                                                                                    </span>
                                                                                    {(lifecycleTab === 'quotes' || lifecycleTab === 'orders' || lifecycleTab === 'acknowledgments') && (
                                                                                        <span className="inline-flex items-center gap-0.5 px-1 py-0 rounded text-[9px] font-bold uppercase tracking-wider bg-info/10 text-info border border-info/20">
                                                                                            Revision # {(order as any).revisionNumber ?? (lifecycleTab === 'quotes' ? 3 : lifecycleTab === 'orders' ? 2 : 1)}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4">
                                                                    <div className="flex flex-col">
                                                                        {activeProfile.id === 'inbound-outbound' && order.endCustomer && (
                                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{order.endCustomer}</span>
                                                                        )}
                                                                        <span className={cn("text-sm text-foreground", isInboundOutbound && "whitespace-nowrap")}>{lifecycleTab === 'acknowledgments' ? order.relatedPo : order.project}</span>
                                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                            <MapPinIcon className="w-3 h-3" /> {order.location}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4">
                                                                    {/* L.16.d: Discrepancy now lives as subFlag chip on STATUS — Amount shown for all tabs including Ack. */}
                                                                    <span className="font-semibold text-foreground">
                                                                        {order.amount}
                                                                    </span>
                                                                </td>
                                                                <td className="p-4">
                                                                    <div className="flex flex-col gap-1 items-start">
                                                                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", order.statusColor)}>
                                                                            {order.status}
                                                                        </span>
                                                                        {/* Sub-flag chip (L.2 / L.16.d) — surfaces detected exceptions (price mismatch,
                                                                            backorder, substitution) without polluting the status taxonomy. Ack tab only. */}
                                                                        {(order as any).subFlag && lifecycleTab === 'acknowledgments' && (
                                                                            <span
                                                                                title={`${order.status} · ${(order as any).subFlag}`}
                                                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/30 whitespace-nowrap"
                                                                            >
                                                                                <span aria-hidden="true">⚠</span>
                                                                                {(order as any).subFlag}
                                                                            </span>
                                                                        )}
                                                                        {/* Sub-phase chip (Hybrid C · F.11.d) — modifies the primary status with the
                                                                            current sub-phase (In Production / Ready to Ship under Acknowledged;
                                                                            In Transit / Delivered under Shipped). Renders only on the Orders tab. */}
                                                                        {(order as any).subPhase && (lifecycleTab === 'order-lifecycle' || lifecycleTab === 'shipping') && (
                                                                            <span
                                                                                title={`${order.status} · ${(order as any).subPhase}`}
                                                                                className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-info/10 text-info border border-info/30 whitespace-nowrap"
                                                                            >
                                                                                {(order as any).subPhase}
                                                                            </span>
                                                                        )}
                                                                        {/* Delay flag (ORD-2056 scenario · Kenya feedback) — highlight delayed shipments in the list view. */}
                                                                        {(order as any).flag === 'delayed' && (
                                                                            <span
                                                                                title={(order as any).delayReason ? `Delayed +${(order as any).delayDays}d · ${(order as any).delayReason}` : 'Shipment delayed'}
                                                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/30 text-[10px] font-bold whitespace-nowrap"
                                                                            >
                                                                                <BellAlertIcon className="w-2.5 h-2.5" aria-hidden="true" />
                                                                                Delayed{(order as any).delayDays ? ` +${(order as any).delayDays}d` : ''}
                                                                            </span>
                                                                        )}
                                                                        {/* Flow 3 · stage marker (Wendy items 9 & 10) */}
                                                                        {(order as any).stageFlag && (
                                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-ai/10 text-ai border border-ai/30 text-[10px] font-bold whitespace-nowrap">
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-ai animate-pulse" />
                                                                                {(order as any).stageFlag}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                {/* L.4: Source column hidden on Ack tab (outbound). */}
                                                                {activeProfile.id === 'inbound-outbound' && lifecycleTab !== 'acknowledgments' && (
                                                                    <td className="p-4">
                                                                        {order.source && <SourceBadge source={order.source} label={(order as any).sourceLabel} />}
                                                                    </td>
                                                                )}
                                                                {activeProfile.id === 'inbound-outbound' && lifecycleTab === 'quotes' && (
                                                                    <td className="p-4">
                                                                        {order.contract && (
                                                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-foreground border border-border">{order.contract}</span>
                                                                        )}
                                                                    </td>
                                                                )}
                                                                {activeProfile.id === 'inbound-outbound' && lifecycleTab === 'orders' && (
                                                                    <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                                                                        {order.shipDate || '—'}
                                                                    </td>
                                                                )}
                                                                {/* Shipment # cell removed per L.4 (Neocon-review 2026-06-05) — not available at Ack issue time. */}
                                                                <td className={cn("p-4 text-sm text-muted-foreground", isInboundOutbound && "whitespace-nowrap")}>
                                                                    {lifecycleTab === 'quotes' ? (order.validUntil || order.date) : order.date}
                                                                </td>
                                                                <td className="p-4 text-right">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); try { sessionStorage.setItem('demo:selectedOrderId', order.id || '') } catch {} ; onNavigateToDetail(lifecycleTab === 'quotes' ? 'quote-detail' : lifecycleTab === 'acknowledgments' ? 'ack-detail' : lifecycleTab === 'rfqs' ? 'rfq-detail' : 'order-detail'); }}
                                                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                                            title="View details"
                                                                        >
                                                                            <EyeIcon className="h-4 w-4" />
                                                                        </button>
                                                                        {/* Quick Message CTA · Christian 27:01 + Wendy 25:40 + L.17.h (Neocon-review 2026-06-05).
                                                                            Lives on all 6 inbound-outbound transaction tabs; opens EmailDraftModal with a
                                                                            template chosen by tab + status (see openQuickMessage in component state). */}
                                                                        {isInboundOutbound && (
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); openQuickMessage(order); }}
                                                                                className="p-1.5 rounded-lg text-muted-foreground hover:text-info hover:bg-info/10 transition-colors"
                                                                                title={`Quick message · ${lifecycleTab === 'acknowledgments' || lifecycleTab === 'order-lifecycle' || lifecycleTab === 'shipping' ? 'notify' : 'reply to'} ${(order as any).dealer || order.customer}`}
                                                                                aria-label="Quick message to dealer"
                                                                            >
                                                                                <Mail className="h-4 w-4" />
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setTrackingOrder(order); }}
                                                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-50/50 transition-colors"
                                                                            title="Track"
                                                                        >
                                                                            <MapPinIcon className="h-4 w-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); toggleExpand(order.id); }}
                                                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                                                        >
                                                                            {expandedIds.has(order.id) ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {expandedIds.has(order.id) && (
                                                                <tr className="bg-muted/30">
                                                                    <td colSpan={activeProfile.id === 'inbound-outbound' ? 8 : 6} className="p-4">
                                                                        <div className="grid grid-cols-3 gap-6 text-sm">
                                                                            {isInboundOutbound ? (
                                                                                <>
                                                                                    <div>
                                                                                        <p className="font-medium text-muted-foreground mb-1">
                                                                                            {lifecycleTab === 'acknowledgments' ? 'Vendor' : lifecycleTab === 'quotes' ? 'Recipient' : 'From'}
                                                                                        </p>
                                                                                        <p className="text-foreground">{order.dealer || order.vendor || order.customer}</p>
                                                                                        {order.endCustomer && (
                                                                                            <p className="text-muted-foreground text-xs">End customer: {order.endCustomer}</p>
                                                                                        )}
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="font-medium text-muted-foreground mb-1">References</p>
                                                                                        <ul className="text-muted-foreground text-xs space-y-0.5">
                                                                                            {order.dealerPO && <li>Dealer PO: <span className="font-mono text-foreground">{order.dealerPO}</span></li>}
                                                                                            {order.manufacturerNo && <li>Mfg #: <span className="font-mono text-foreground">{order.manufacturerNo}</span></li>}
                                                                                            {order.contract && <li>Contract: <span className="font-mono text-foreground">{order.contract}</span></li>}
                                                                                            {order.linkedQuote && <li>Linked Quote: <span className="font-mono text-foreground">{order.linkedQuote}</span></li>}
                                                                                            {order.linkedPO && <li>Linked PO: <span className="font-mono text-foreground">{order.linkedPO}</span></li>}
                                                                                            {order.linkedOrder && <li>Linked Order: <span className="font-mono text-foreground">{order.linkedOrder}</span></li>}
                                                                                            {order.shipmentNo && <li>Shipment #: <span className="font-mono text-foreground">{order.shipmentNo}</span></li>}
                                                                                        </ul>
                                                                                    </div>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <div>
                                                                                        <p className="font-medium text-muted-foreground mb-1">Contact Details</p>
                                                                                        <p className="text-foreground">Operations Manager Solano</p>
                                                                                        <p className="text-muted-foreground text-xs">sarah.j@example.com</p>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="font-medium text-muted-foreground mb-1">Items</p>
                                                                                        <ul className="list-disc list-inside text-muted-foreground text-xs space-y-1">
                                                                                            <li>Office Chair Ergonomic x12</li>
                                                                                            <li>Standing Desk Motorized x5</li>
                                                                                        </ul>
                                                                                    </div>
                                                                                </>
                                                                            )}
                                                                            <div className="flex items-center gap-2 justify-end">
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); try { sessionStorage.setItem('demo:selectedOrderId', order.id || '') } catch {} ; onNavigateToDetail(lifecycleTab === 'quotes' ? 'quote-detail' : lifecycleTab === 'acknowledgments' ? 'ack-detail' : lifecycleTab === 'rfqs' ? 'rfq-detail' : 'order-detail'); }}
                                                                                    className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                                                                                >
                                                                                    {lifecycleTab === 'quotes' ? 'View Quote Details' : lifecycleTab === 'acknowledgments' ? 'View Ack Details' : lifecycleTab === 'rfqs' ? 'View RFQ Details' : 'View Full Order'}
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); openPEDPreview(lifecycleTab === 'quotes' ? 'quote' : lifecycleTab === 'acknowledgments' ? 'acknowledgment' : 'order', order.id); }}
                                                                                    className="px-3 py-1.5 border border-border text-foreground text-xs font-medium rounded-lg hover:bg-muted transition-colors"
                                                                                >
                                                                                    Download {lifecycleTab === 'quotes' ? 'Quote' : lifecycleTab === 'acknowledgments' ? 'Ack' : lifecycleTab === 'rfqs' ? 'RFQ' : 'PO'}
                                                                                </button>
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
                                ) : (
                                    /* Pipeline View · items-start keeps columns top-aligned when
                                        card counts differ (previous scale-y-[-1] trick pushed short
                                        columns down · reported by Diego 2026-07-21). */
                                    <div className="flex items-start gap-6 overflow-x-auto pb-4 pt-4 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted/50 hover:[&::-webkit-scrollbar-thumb]:bg-muted dark:[&::-webkit-scrollbar-thumb]:bg-muted/50 dark:hover:[&::-webkit-scrollbar-thumb]:bg-muted">
                                        {(lifecycleTab === 'quotes' ? quoteStages : lifecycleTab === 'acknowledgments' ? ackStages : lifecycleTab === 'rfqs' ? rfqStages : pipelineStages).map((stage) => {
                                            const stageOrders = filteredData.filter((o: any) => o.status === stage);
                                            return (
                                                <div key={stage} className="min-w-[320px] max-w-[320px] flex-shrink-0 flex flex-col">
                                                    <div className="flex items-center justify-between mb-4 px-2">
                                                        <h4 className="font-medium text-foreground flex items-center gap-2">
                                                            {stage}
                                                            <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{stageOrders.length}</span>
                                                        </h4>
                                                        <button className="text-muted-foreground hover:text-foreground">
                                                            <EllipsisHorizontalIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>

                                                    <div className="bg-muted/30 rounded-2xl p-3 h-full min-h-[500px] border border-border/50 space-y-3">
                                                        {stageOrders.map(order => (
                                                            <div
                                                                key={order.id}
                                                                className={cn(
                                                                    "group relative bg-card dark:bg-zinc-800 rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col",
                                                                    expandedIds.has(order.id) ? 'border-brand-400/50 ring-1 ring-brand-400/20 shadow-lg' : 'border-border shadow-sm hover:shadow-md',
                                                                    (procPhase === 'highlight' || procPhase === 'lupa-active') && order.id === '#ORD-2055' && isContinua && "ring-2 ring-brand-400 ring-offset-2 ring-offset-background shadow-xl shadow-brand-400/20 animate-pulse scale-[1.02]",
                                                                    // Step 3.2: Knoll ACK card highlighting
                                                                    ackPhase === 'alert' && order.id === 'Acknowledgement-8841' && isContinua && "ring-2 ring-red-500 ring-offset-2 ring-offset-background shadow-xl shadow-red-500/20 animate-pulse scale-[1.02]"
                                                                )}
                                                            >
                                                                <div className="p-4">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-background">
                                                                                {order.initials}
                                                                            </div>
                                                                            <div className="space-y-0.5">
                                                                                <h4 className="text-sm font-semibold text-foreground transition-colors">
                                                                                    {lifecycleTab === 'acknowledgments' ? (order as any).vendor : (order as any).customer}
                                                                                </h4>
                                                                                <div className="flex items-center gap-1">
                                                                                    <p className="text-[10px] text-muted-foreground font-mono">{order.id}</p>
                                                                                    {order.id === '#ORD-7829' && (
                                                                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                                                                                            New
                                                                                        </span>
                                                                                    )}
                                                                                    {/* Step 1.3: Validated badges on ACK cards */}
                                                                                    {isContinua && lifecycleTab === 'acknowledgments' && (ackPhase === 'validating' || ackPhase === 'alert') && (
                                                                                        <>
                                                                                            {order.id === 'Acknowledgement-8839' && ackValidatedCount >= 1 && (
                                                                                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px] font-bold uppercase tracking-wider animate-in fade-in duration-300">
                                                                                                    Validated ✓
                                                                                                </span>
                                                                                            )}
                                                                                            {order.id === 'Acknowledgement-8840' && ackValidatedCount >= 2 && (
                                                                                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px] font-bold uppercase tracking-wider animate-in fade-in duration-300">
                                                                                                    Validated ✓
                                                                                                </span>
                                                                                            )}
                                                                                            {order.id === 'Acknowledgement-8841' && ackKnollAlert && (
                                                                                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-[10px] font-bold uppercase tracking-wider animate-in fade-in duration-300">
                                                                                                    Dispute ⚠
                                                                                                </span>
                                                                                            )}
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <div className="flex justify-between items-center text-xs">
                                                                            <span className="text-muted-foreground">Amount</span>
                                                                            <span className="font-semibold text-foreground">
                                                                                {(order as any).amount}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center text-xs">
                                                                            <span className="text-muted-foreground">Date</span>
                                                                            <span className="text-foreground">{order.date}</span>
                                                                        </div>

                                                                        {/* Use a simple divider */}
                                                                        <div className="h-px bg-border w-full my-2" />

                                                                        {/* Inline Actions Row */}
                                                                        <div className="flex items-center justify-between">
                                                                            {/* Status Badge + Source (for inbound-outbound) */}
                                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border shadow-sm",
                                                                                    colorStyles[order.statusColor?.split('-')[1]?.replace('text', '').trim()] || "bg-muted text-muted-foreground border-border"
                                                                                )}>
                                                                                    {order.status}
                                                                                </span>
                                                                                {/* Delay flag chip (ORD-2056 scenario) — mirrors the table view. */}
                                                                                {(order as any).flag === 'delayed' && (
                                                                                    <span
                                                                                        title={(order as any).delayReason ? `Delayed +${(order as any).delayDays}d · ${(order as any).delayReason}` : 'Shipment delayed'}
                                                                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/30 text-[10px] font-bold whitespace-nowrap"
                                                                                    >
                                                                                        <BellAlertIcon className="w-2.5 h-2.5" aria-hidden="true" />
                                                                                        Delayed{(order as any).delayDays ? ` +${(order as any).delayDays}d` : ''}
                                                                                    </span>
                                                                                )}
                                                                                {activeProfile.id === 'inbound-outbound' && order.source && (
                                                                                    <SourceBadge source={order.source} label={(order as any).sourceLabel} size="xs" />
                                                                                )}
                                                                            </div>

                                                                            <div className="flex items-center gap-1">
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); toggleExpand(order.id); }}
                                                                                    className="text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-md transition-shadow shadow-sm"
                                                                                >
                                                                                    {expandedIds.has(order.id) ? 'Close' : 'Details'}
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); try { sessionStorage.setItem('demo:selectedOrderId', order.id || '') } catch {} ; onNavigateToDetail(lifecycleTab === 'quotes' ? 'quote-detail' : lifecycleTab === 'acknowledgments' ? 'ack-detail' : lifecycleTab === 'rfqs' ? 'rfq-detail' : 'order-detail'); }}
                                                                                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                                                                    title="View Full Details"
                                                                                >
                                                                                    <ArrowRightIcon className="h-4 w-4" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Internal Accordion Content */}
                                                                {expandedIds.has(order.id) && (
                                                                    <div className="bg-card border-t border-border animate-in slide-in-from-top-2 duration-200">
                                                                        <div className="p-5 space-y-5">
                                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                                                                <div className="space-y-1.5">
                                                                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{lifecycleTab === 'acknowledgments' ? 'PO Number' : 'Project'}</p>
                                                                                    <p className="text-sm font-semibold text-foreground truncate">{lifecycleTab === 'acknowledgments' ? (order as any).relatedPo : (order as any).project}</p>
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Location</p>
                                                                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                                                                        <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                                                                                        <span className="truncate">{order.location}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{lifecycleTab === 'quotes' ? 'Expiration Date' : lifecycleTab === 'acknowledgments' ? 'Planned Delivery' : 'Date Placed'}</p>
                                                                                    <p className="text-sm font-semibold text-foreground font-mono">{lifecycleTab === 'quotes' ? (order as any).validUntil : lifecycleTab === 'acknowledgments' ? (order as any).expShipDate : order.date}</p>
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Items</p>
                                                                                    <p className="text-sm font-semibold text-foreground">12 Units</p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex flex-col gap-3 pt-2">
                                                                                <button className="w-full py-2.5 text-xs font-bold text-foreground bg-card border border-border rounded-lg hover:bg-accent hover:text-foreground transition-colors shadow-sm">
                                                                                    {lifecycleTab === 'quotes' ? 'View Quote Details' : lifecycleTab === 'acknowledgments' ? 'View PO Details' : 'View Full Order Details'}
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); setTrackingOrder(order); }}
                                                                                    className="w-full py-3 text-sm font-bold text-zinc-950 bg-brand-400 hover:bg-brand-300 rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                                                                                >
                                                                                    <MapPinIcon className="h-4 w-4" />
                                                                                    {lifecycleTab === 'quotes' ? 'Analyze Quote' : lifecycleTab === 'acknowledgments' ? 'Resolve Discrepancy' : 'Track Shipment'}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {stageOrders.length === 0 && (
                                                            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground opacity-50 border-2 border-dashed border-border rounded-xl">
                                                                <span className="text-xs">No orders</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                )}{/* end shipping-tab guard for the generic list view (Phase 6.1) */}



                {/* Charts Area removed · Revenue Trend + Inventory Breakdown retired per user (redundant at page bottom) */}
                {/* Recent Orders - The Grid/List view handled here */}

            </div>

            {/* C1 · Manufacturer TrackingModal · unified lifecycle tracking for ALL inbound-outbound tabs */}
            {isInboundOutbound && (() => {
                const order = trackingOrder
                if (!order) return null
                // Per L.20 sub-phase chip surfaces inline next to each step's primary status badge.
                const manufacturerSteps: ManufacturerTrackingStep[] = trackingSteps.map((s, idx) => ({
                    id: `step-${idx}`,
                    title: s.status,
                    description: s.subPhase ? `${s.primary} · ${s.subPhase}` : s.primary,
                    status: s.completed ? 'completed' : (s.alert ? 'current' : 'upcoming'),
                    timestamp: s.date,
                    location: s.location,
                    actor: undefined,
                }))
                return (
                    <ManufacturerTrackingModal
                        isOpen={!!order}
                        onClose={() => setTrackingOrder(null)}
                        title={`${order.id} · ${order.customer ?? order.dealer ?? 'Order'}`}
                        trackingId={order.manufacturerNo ?? order.dealerPO ?? order.id}
                        type="movement"
                        steps={manufacturerSteps}
                        carrier={order.source === 'Email' ? 'FedEx Freight LTL' : 'Carrier TBD'}
                        eta={order.shipDate}
                    />
                )
            })()}

            {/* Generic analysis/tracking modal · non-inbound-outbound profiles only (inbound-outbound uses the unified tracking modal above) */}
            <Transition appear show={!!trackingOrder && !isInboundOutbound} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={() => setTrackingOrder(null)}>
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
                                        <span>
                                            {lifecycleTab === 'quotes' ? 'Quote Analysis' :
                                                lifecycleTab === 'acknowledgments' ? 'Discrepancy Resolver' :
                                                    `Tracking Details - ${trackingOrder?.id}`}
                                        </span>
                                        <button
                                            onClick={() => setTrackingOrder(null)}
                                            className="rounded-full p-1 hover:bg-accent transition-colors"
                                        >
                                            <span className="sr-only">Close</span>
                                            <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </Dialog.Title>

                                    {lifecycleTab === 'quotes' ? (
                                        /* Quote Details View */
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Margin Analysis</h4>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                                        <span className="text-sm text-muted-foreground">Total Cost</span>
                                                        <span className="font-mono text-foreground">$850,000</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                                        <span className="text-sm text-muted-foreground">List Price</span>
                                                        <span className="font-mono text-foreground">$1,200,000</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
                                                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Net Margin</span>
                                                        <span className="font-bold text-green-700 dark:text-green-400">29.2%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col h-full bg-primary/5 p-5 rounded-xl border border-primary/10">
                                                <div className="flex items-center gap-2 mb-3 text-brand-700 dark:text-brand-300">
                                                    <SparklesIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                                    <span className="font-semibold text-sm">AI Pricing Insight</span>
                                                </div>
                                                <p className="text-sm text-brand-900/80 dark:text-zinc-300 leading-relaxed mb-4">
                                                    Based on recent wins with <strong className="text-brand-950 dark:text-white">Apex Furniture</strong>, you could increase margin to <strong className="text-brand-950 dark:text-white">32%</strong> without impacting win probability.
                                                </p>
                                                <button className="mt-auto w-full py-2 bg-brand-600 hover:bg-brand-700 text-white dark:text-brand-950 dark:bg-brand-400 dark:hover:bg-brand-300 rounded-lg text-sm font-medium transition-colors">
                                                    Apply Suggested Pricing
                                                </button>
                                            </div>
                                        </div>
                                    ) : lifecycleTab === 'acknowledgments' ? (
                                        /* Ack Details View */
                                        <div className="space-y-6">
                                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-4 flex gap-3">
                                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                                                <div>
                                                    <h4 className="text-sm font-semibold text-red-700 dark:text-red-400">Price Discrepancy Detected</h4>
                                                    <p className="text-sm text-red-600/90 dark:text-red-400/90 mt-1">Vendor acknowledgement is <span className="font-bold">$500 higher</span> than the Purchase Order.</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="p-4 border border-border rounded-lg">
                                                    <span className="block text-xs uppercase text-muted-foreground mb-1">Your PO</span>
                                                    <div className="font-semibold text-lg">$12,500.00</div>
                                                    <div className="text-xs text-muted-foreground mt-2">Unit Price: $250.00</div>
                                                </div>
                                                <div className="p-4 border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/5 rounded-lg">
                                                    <span className="block text-xs uppercase text-red-600 dark:text-red-400 mb-1">Vendor Acknowledgement</span>
                                                    <div className="font-semibold text-lg text-red-700 dark:text-red-400">$13,000.00</div>
                                                    <div className="text-xs text-red-600/80 mt-2">Unit Price: $260.00</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 justify-end pt-4 border-t border-border">
                                                <button className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-accent">
                                                    Contact Rep
                                                </button>
                                                <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
                                                    Update PO to Match
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
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

                                                <div className="bg-muted/30 p-3 rounded-lg border border-border mb-6">
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
                                    )}
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* ═══ PROJECTS TAB CONTENT ═══ */}
            {lifecycleTab === 'projects' && (
                <div className="space-y-6">
                    {/* Project Summary Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Active Projects</h2>
                            <p className="text-sm text-muted-foreground">{DEMO_PROJECTS.length} projects · Orders grouped by project</p>
                        </div>
                    </div>

                    {/* Project Cards */}
                    {DEMO_PROJECTS.map(project => (
                        <div key={project.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                            {/* Project Header */}
                            <div className="p-6 border-b border-border">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-base font-bold text-foreground truncate">{project.name}</h3>
                                            <span className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap",
                                                project.status === 'In Progress' ? "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300" :
                                                project.status === 'Planning' ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300" :
                                                "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300"
                                            )}>
                                                {project.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> Client: <strong className="text-foreground">{project.client}</strong></span>
                                            <span className="flex items-center gap-1"><ClipboardDocumentListIcon className="w-3 h-3" /> PM: {project.pm}</span>
                                            <span className="flex items-center gap-1"><WrenchScrewdriverIcon className="w-3 h-3" /> FM: {project.fm}</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-xs text-muted-foreground">Budget</div>
                                        <div className="text-sm font-bold text-foreground">{project.spent} <span className="text-muted-foreground font-normal">/ {project.totalBudget}</span></div>
                                    </div>
                                </div>
                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-muted-foreground">Overall Progress</span>
                                        <span className="font-bold text-foreground">{project.completion}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${project.completion}%` }} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">
                                {/* Orders Column */}
                                <div className="p-5">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Orders ({project.orders.length})</h4>
                                    <div className="space-y-3">
                                        {project.orders.map(order => (
                                            <div key={order.id} className="p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-border transition-colors">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-xs font-bold text-foreground">{order.id}</span>
                                                    <span className={cn(
                                                        "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                                                        order.status === 'Shipped' || order.status === 'Ready to ship' || order.status === 'Delivered' ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300" :
                                                        order.status === 'In production' || order.status === 'Scheduled for production' || order.status === 'Quality control' ? "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300" :
                                                        order.status === 'PO Received' || order.status === 'Quote Pending' ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300" :
                                                        "bg-zinc-100 dark:bg-zinc-700 text-muted-foreground dark:text-zinc-300"
                                                    )}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                    <span>{order.supplier}</span>
                                                    <span className="font-semibold text-foreground">{order.amount}</span>
                                                </div>
                                                <div className="mt-2">
                                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary/70 rounded-full transition-all" style={{ width: `${order.progress}%` }} />
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1 text-[9px] text-muted-foreground">
                                                        <span>Delivery: {order.deliveryDate}</span>
                                                        <span>{order.progress}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Milestones Column */}
                                <div className="p-5">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Milestones</h4>
                                    <div className="space-y-3 relative">
                                        {project.milestones.map((ms, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div className={cn(
                                                        "w-3 h-3 rounded-full border-2 shrink-0",
                                                        ms.status === 'completed' ? "bg-green-500 border-green-500" :
                                                        ms.status === 'in-progress' ? "bg-blue-500 border-blue-500 animate-pulse" :
                                                        "bg-background border-muted-foreground/30"
                                                    )} />
                                                    {idx < project.milestones.length - 1 && (
                                                        <div className={cn(
                                                            "w-0.5 h-6 mt-1",
                                                            ms.status === 'completed' ? "bg-green-300 dark:bg-green-700" : "bg-border"
                                                        )} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 -mt-0.5">
                                                    <p className={cn("text-xs font-medium truncate", ms.status === 'completed' ? "text-muted-foreground line-through" : "text-foreground")}>{ms.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{ms.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* FM Actions Column */}
                                <div className="p-5">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <WrenchScrewdriverIcon className="w-3 h-3" />
                                        FM Actions
                                    </h4>
                                    {project.fmActions.length > 0 ? (
                                        <div className="space-y-2">
                                            {project.fmActions.map((fm, idx) => (
                                                <div key={idx} className={cn(
                                                    "p-3 rounded-xl border text-xs",
                                                    fm.priority === 'high' ? "bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20" :
                                                    fm.priority === 'medium' ? "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20" :
                                                    "bg-muted/30 border-border/50"
                                                )}>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-foreground font-medium">{fm.action}</p>
                                                        <span className={cn(
                                                            "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0",
                                                            fm.priority === 'high' ? "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400" :
                                                            fm.priority === 'medium' ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400" :
                                                            "bg-zinc-100 dark:bg-zinc-700 text-muted-foreground"
                                                        )}>
                                                            {fm.priority}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        <button onClick={() => triggerToast('Action Approved', `"${fm.action}" has been approved and assigned.`, 'success')} className="text-[9px] px-2 py-1 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-colors">
                                                            Approve
                                                        </button>
                                                        <button onClick={() => triggerToast('Details Requested', 'Request sent to facilities team for more information.', 'info')} className="text-[9px] px-2 py-1 rounded-lg border border-border text-muted-foreground font-bold hover:bg-muted transition-colors">
                                                            Details
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-muted-foreground">
                                            <CheckCircleIcon className="w-6 h-6 mx-auto mb-2 text-green-500" />
                                            <p className="text-xs">No pending FM actions</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateOrderModal isOpen={isCreateOrderOpen} onClose={() => setIsCreateOrderOpen(false)} />
            <AcknowledgementUploadModal isOpen={isAckModalOpen} onClose={() => setIsAckModalOpen(false)} />
            <BatchAckModal isOpen={isBatchAckOpen} onClose={() => setIsBatchAckOpen(false)} />
            <CreateQuoteModal isOpen={isQuoteWidgetOpen} onClose={() => setIsQuoteWidgetOpen(false)} onNavigate={onNavigate} />
            <PEDExportModal isOpen={isPEDOpen} onClose={() => setIsPEDOpen(false)} data={pedData} />
            <PEDExportModal
                isOpen={isDuplicateOpen}
                onClose={() => setIsDuplicateOpen(false)}
                data={duplicateData}
                purpose="duplicate"
                onDuplicate={() => {
                    setIsDuplicateOpen(false);
                    triggerToast('Transaction duplicated', `Draft ${duplicateData?.salesOrderNumber ?? ''}-COPY created · ready to edit.`, 'success');
                }}
            />
            <DocumentConversionModal isOpen={isConversionOpen} onClose={() => setIsConversionOpen(false)} mode={conversionMode} triggerToast={triggerToast} />
            <AckReconciliationModal isOpen={isReconciliationOpen} onClose={() => setIsReconciliationOpen(false)} triggerToast={triggerToast} />

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
                    <div className="bg-popover rounded-xl shadow-2xl shadow-black/10 border border-border p-4 flex items-start gap-4 max-w-sm">
                        <div className={`mt-0.5 p-1 rounded-full ${toastMessage.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : toastMessage.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                            {toastMessage.type === 'success' ? (
                                <CheckCircleIcon className="w-5 h-5" />
                            ) : toastMessage.type === 'info' ? (
                                <DocumentTextIcon className="w-5 h-5" />
                            ) : (
                                <ExclamationCircleIcon className="w-5 h-5" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-foreground">{toastMessage.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{toastMessage.description}</p>
                        </div>
                        <button onClick={() => setShowToast(false)} className="text-muted-foreground hover:text-muted-foreground dark:hover:text-zinc-300 transition-colors">
                            <span className="sr-only">Close</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Manual upload modal · Wendy 6:07 + Christian 8:11 (Neocon-review 2026-06-05) */}
            <ManualUploadModal
                isOpen={uploadModalOpen}
                docType={uploadDocType}
                onClose={() => setUploadModalOpen(false)}
                onSuccess={handleUploadSuccess}
            />

            {/* Quick Message modal · Christian 27:01 + L.17.h (Neocon-review 2026-06-05)
                Available on all 6 transaction tabs · template adapts per tab + status. */}
            {quickMessageDraft && (
                <EmailDraftModal
                    isOpen={quickMessageDraft !== null}
                    onClose={() => setQuickMessageDraft(null)}
                    draft={quickMessageDraft}
                    onSent={() => setQuickMessageDraft(null)}
                />
            )}

            {/* Upload success toast */}
            {uploadToast && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed bottom-6 right-6 z-[150] bg-card border border-success/40 rounded-lg shadow-2xl px-4 py-3 flex items-center gap-3 max-w-sm"
                >
                    <div className="p-1.5 rounded-md bg-success/10">
                        <CloudArrowUpIcon className="w-4 h-4 text-success" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-foreground">{uploadToast.count} {uploadToast.docType} uploaded · Ingesting</p>
                        <p className="text-[11px] text-muted-foreground">Source: <span className="font-semibold">Manual</span> · appearing in {uploadToast.docType} list</p>
                    </div>
                </div>
            )}

        </div >
    )
}
