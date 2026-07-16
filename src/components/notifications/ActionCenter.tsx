import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { BellIcon, MagnifyingGlassIcon, XMarkIcon, Squares2X2Icon, ExclamationTriangleIcon, CreditCardIcon, ClipboardDocumentCheckIcon, TruckIcon, DocumentTextIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Fragment, useState, useMemo, useEffect } from 'react';
import { clsx } from 'clsx';
import { mockNotifications } from './data';
import FilterTabs from './FilterTabs';
import NotificationItem from './NotificationItem';
import type { Notification, NotificationTab } from './types';
import { useDemo } from '../../context/DemoContext';
import { usePauseAware } from '../../context/usePauseAware';

// Flow 2 notifications for Step 2.6
const FLOW2_NOTIFICATIONS: Notification[] = [
    // ORD-2056 · Delayed shipment scenario (Kenya feedback 2026-06-04) — pinned at top as high priority unread.
    {
        id: 'shipment-delayed-ord-2056', type: 'shipment', priority: 'high',
        title: 'Shipment Delayed — ORD-2056',
        message: 'Carrier weather hold on I-80 · +8d delay. New ETA Mar 28 (was Mar 20). Dealer notification recommended · 24hr call-before-delivery required.',
        meta: 'CarrierTrackingAgent', timestamp: 'Just now', unread: true,
        actions: [{ label: 'View Order', primary: true }, { label: 'Notify Dealer', primary: false }], persona: 'dealer',
    },
    {
        id: 'f2-hat-confirmed', type: 'ack_received', priority: 'low',
        title: 'Acknowledgement-7841 (HAT) — Confirmed',
        message: '5 lines confirmed. AI vendor rule applied: part number match is sufficient per client directive.',
        meta: 'ACKIngestionAgent', timestamp: 'Just now', unread: true,
        actions: [{ label: 'View Acknowledgement', primary: true }], persona: 'dealer',
    },
    {
        id: 'f2-ais-resolved', type: 'ack_received', priority: 'high',
        title: 'Acknowledgement-7842 (AIS) — 3 Exceptions Resolved',
        message: '50 lines processed. Grommet corrected (Line 41), dates accepted (+14/+11 days), backorder BO-1064B created for 6 units.',
        meta: 'DiscrepResolverAgent', timestamp: 'Just now', unread: true,
        actions: [{ label: 'View Details', primary: true }], persona: 'dealer',
    },
    {
        id: 'f2-expert-queue', type: 'system', priority: 'medium',
        title: 'Expert Queue Update',
        message: 'Acknowledgement-7842 grommet auto-corrected (Line 41, X-DS6030 CB). Next queue: 2 pending Acknowledgements.',
        meta: 'NotificationAgent', timestamp: '2 min ago', unread: true,
        actions: [{ label: 'View Queue', primary: true }], persona: 'expert',
    },
    {
        id: 'f2-crm-sync', type: 'system', priority: 'medium',
        title: 'CRM Order Lifecycle — Ready to Sync',
        message: 'ACK-7841 and ACK-7842 fully processed. Delivery dates, backorder status, and resolution data ready to sync to Premier Underground Design project timeline.',
        meta: 'OrderSyncAgent', timestamp: 'Just now', unread: true,
        actions: [{ label: 'Sync to CRM', primary: true }], persona: 'dealer',
    },
];

// Flow 3 · Sample & Textile — email-style notifications (Wendy items 9 & 10)
const SAMPLE_REQUEST_NOTIF: Notification = {
    id: 'st-sample-request', type: 'approval', priority: 'high',
    title: 'Sample request · QT-1025',
    message: 'NorthPoint requested a CF Stinson "Ocean Blue" swatch for the LB Lounge (F-SSC346030C) before approving the quote. Textile grading + Excel approval pending validation.',
    meta: 'procurement@northpointfurniture.com',
    timestamp: 'Just now', unread: true,
    actions: [{ label: 'Review in quote', primary: true }], persona: 'dealer',
};
// Manufacturer reply after the dealer sends the request (round-trip).
const sampleResponseNotif = (tracking: string): Notification => ({
    id: 'st-sample-response', type: 'shipment', priority: 'high',
    title: 'Manufacturer responded · sample shipped',
    message: `Order entry approved the swatch request. CF Stinson kit shipped via FedEx · tracking ${tracking} · est. 3 business days. One swatch proposed as graded-equivalent (CF-6021 Navy) — review needed.`,
    meta: 'orders@strata-manufacturing.com',
    timestamp: 'Just now', unread: true,
    actions: [{ label: 'View response', primary: true }], persona: 'dealer',
});

// BFI steps generic incoming-event notifications
interface BfiStepNotif {
    badge: string
    badgeColor: 'ai' | 'warning' | 'success'
    title: string
    desc: string
    sender: string
    re?: string
    attachment?: string
    cta: string
    event: string
    footerText: string
}

const BFI_STEP_NOTIFICATIONS: Record<string, BfiStepNotif> = {
    'a1.2c': {
        badge: '1 new', badgeColor: 'success',
        title: 'PO Received · DOE-2847 ready for review',
        desc: 'Q-2026-0089 has been approved and converted to PO DOE-2847 ($235,560). Please review PO and labor figures before confirming and sending to CORE.',
        sender: 'nycdoe-procurement@schools.nyc.gov',
        re: 'Purchase Order DOE-2847 · NYC Dept. of Education · $235,560',
        attachment: 'DOE-2847-PurchaseOrder.pdf',
        cta: 'Review PO →',
        event: 'bfi:po-review-open',
        footerText: 'PO review pending',
    },
    'a1.2d': {
        badge: '1 new', badgeColor: 'ai',
        title: 'Purchase Order confirmed · NYC Dept. of Education',
        desc: 'DOE-2847 · Q-2026-0089 · Delivery May 14–21 · 35 cartons · warehouse receiving',
        sender: 'NYC Dept. of Education · Procurement',
        cta: 'Review receiving documents →',
        event: 'bfi:wig-open',
        footerText: 'WIG receiving ready',
    },
    'a1.2e': {
        badge: '1 urgent', badgeColor: 'warning',
        title: 'Missing Carton · DOE-2847',
        desc: 'Carton #34 not received at WIG NJ — Monitor Arm Dual Adjustable. Receiving complete: 34/35 cartons.',
        sender: 'Lena C. · Receiving Coordinator',
        cta: 'Review & file claim →',
        event: 'bfi:claim-open',
        footerText: 'Awaiting claim',
    },
    'a1.2f': {
        badge: '1 new', badgeColor: 'success',
        title: 'Shortage claim resolved · Herman Miller',
        desc: 'Monitor Arm Dual Adjustable · Replacement carton ETA May 18 · Cleared for work order scheduling.',
        sender: 'Herman Miller · Customer Service',
        cta: 'Review & notify →',
        event: 'bfi:resolved-open',
        footerText: 'Work order ready',
    },
    'a1.3b': {
        badge: '1 new', badgeColor: 'ai',
        title: 'CPR approved · Final quote ready · DOE-2847',
        desc: 'Lauren DeMarco completed CPR reconciliation — Carpenters −5h, OT −2h · Total −$2,340 · Pending: send final quote to Herman Miller.',
        sender: 'Lauren DeMarco · Account Manager',
        cta: 'Review & send quote to Nancy →',
        event: 'bfi:michael-open',
        footerText: 'Quote pending',
    },
    'a1.3c': {
        badge: '1 new', badgeColor: 'ai',
        title: 'Final Labor Quote ready · DOE-2847 · Invoice upload requested',
        desc: 'CPR-adjusted quote ($6,920) has been approved. Please upload the Quote Tool approved invoice to complete the fee verification process.',
        sender: 'Michael Boyle · Director of Strategic Accounts',
        cta: 'Upload invoice →',
        event: 'bfi:invoice-open',
        footerText: 'Invoice upload pending',
    },
    'a1.4': {
        badge: '1 new', badgeColor: 'success',
        title: 'Quote Tool invoice forwarded · DOE-2847 · Fee verification requested',
        desc: 'The Quote Tool approved invoice ($6,920) for Purchase Order DOE-2847 is attached. CPR reconciliation is complete — please review and confirm the agency fee.',
        sender: 'Lauren DeMarco · Account Manager · BFI',
        cta: 'Review fee →',
        event: 'bfi:fee-open',
        footerText: 'Fee verification pending',
    },
}

// BFI Step a1.1 — Miller Knoll quote request notification
const BFI_A11_NOTIFICATIONS: Notification[] = [
    {
        id: 'bfi-a11-miller-knoll',
        type: 'quote_update',
        priority: 'high',
        title: 'New quote request · Miller Knoll',
        message: 'Account Manager Bly sent SIF + PDF specs for DOE-2847 · NYC Dept. of Education · Q-2026-0089',
        meta: 'robert.chen@millerknoll.com · May 6 · 8:14 AM',
        timestamp: 'May 6 · 8:14 AM',
        unread: true,
        actions: [{ label: 'Ingest with Strata', primary: true }],
    },
];

// Flow 1 notification for Step 1.10 — single focused notification
const FLOW1_NOTIFICATIONS: Notification[] = [
    {
        id: 'f1-po', type: 'po_created', priority: 'high',
        title: 'PO Created from RFQ',
        message: 'Order #PO-1029 generated for Home Exteriors — $134,250. Quote QT-1025 approved (2/2). Ready for pipeline.',
        meta: 'POBuilderAgent', timestamp: 'Just now', unread: true,
        actions: [{ label: 'View PO', primary: true }], persona: 'dealer',
    },
];

export default function ActionCenter() {
    const { isDemoActive, isSidebarCollapsed, currentStep, nextStep } = useDemo();
    const { pauseAwareTimeout } = usePauseAware();
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed;
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // BFI Step a1.1: Auto-open with Miller Knoll quote request
    const isStepA11 = isDemoActive && currentStep?.id === 'a1.1';
    const [a11PanelClosed,  setA11PanelClosed]  = useState(false);
    const [a11IngestState,  setA11IngestState]  = useState<'idle' | 'ingesting' | 'ready'>('idle');
    const [a11IngestCount,  setA11IngestCount]  = useState(0);
    // BFI generic step panel (a1.2d / a1.2e / a1.2f / a1.3b)
    const [bfiPanelClosed, setBfiPanelClosed] = useState(false);
    // Delay before any BFI notification panel appears (2s after step loads)
    const [notifDelayReady, setNotifDelayReady] = useState(false);
    // Reset all BFI panels when step changes, then reveal after 2s (pause-aware)
    useEffect(() => {
        setA11PanelClosed(false);
        setA11IngestState('idle');
        setA11IngestCount(0);
        setBfiPanelClosed(false);
        setNotifDelayReady(false);
        const cancel = pauseAwareTimeout(() => setNotifDelayReady(true), 2000);
        return () => cancel?.();
    }, [currentStep?.id, pauseAwareTimeout]);

    // Step 1.10: Auto-open with single notification
    const isStep19 = isDemoActive && currentStep?.id === '1.10';

    // Step 2.7: Auto-open with animated delivery for Flow 2 Acknowledgement notifications
    const isStep27 = isDemoActive && currentStep?.id === '2.7';
    const [notifDelivered27, setNotifDelivered27] = useState<number[]>([]);

    useEffect(() => {
        if (!isStep27) { setNotifDelivered27([]); return; }
        const cancels = [
            pauseAwareTimeout(() => setNotifDelivered27([0]),          1500),
            pauseAwareTimeout(() => setNotifDelivered27([0, 1]),       3000),
            pauseAwareTimeout(() => setNotifDelivered27([0, 1, 2]),    4500),
            pauseAwareTimeout(() => setNotifDelivered27([0, 1, 2, 3]),6000),
        ];
        return () => cancels.forEach(c => c?.());
    }, [isStep27, pauseAwareTimeout]);

    // Flow 3 · Sample & Textile — event-driven panel (arrives on entering QT-1025)
    const [sampleTextileActive, setSampleTextileActive] = useState(false);
    const [samplePhase, setSamplePhase] = useState<'request' | 'response'>('request');
    const [sampleTracking, setSampleTracking] = useState<string | null>(null);
    useEffect(() => {
        // Initial: dealer's sample request "arrives" on entering the quote.
        const onArrive = () => { setSamplePhase('request'); setSampleTextileActive(true); };
        // Round-trip: after the dealer sends, the manufacturer reply arrives ~2.5s later.
        const onSent = (e: Event) => {
            const tracking = (e as CustomEvent).detail?.tracking ?? 'SMP-2026';
            setSampleTracking(tracking);
            setTimeout(() => { setSamplePhase('response'); setSampleTextileActive(true); }, 2500);
        };
        window.addEventListener('sample-textile:arrive', onArrive);
        window.addEventListener('sample-textile:sent', onSent);
        return () => {
            window.removeEventListener('sample-textile:arrive', onArrive);
            window.removeEventListener('sample-textile:sent', onSent);
        };
    }, []);
    // Auto-dismiss the panel after a max of 3s on screen (per user · was 9s).
    useEffect(() => {
        if (!sampleTextileActive) return;
        const t = setTimeout(() => setSampleTextileActive(false), 3000);
        return () => clearTimeout(t);
    }, [sampleTextileActive, samplePhase, sampleTracking]);

    const tabs: NotificationTab[] = [
        {
            id: 'all', label: 'All',
            count: mockNotifications.filter(n => n.unread).length,
            icon: Squares2X2Icon,
            colorTheme: { activeBg: 'bg-gray-200 dark:bg-white/10', activeText: 'text-foreground', activeBorder: 'border-gray-300 dark:border-white/10', badgeBg: 'bg-muted0/20 dark:bg-white/20', badgeText: 'text-foreground' },
            filter: () => true
        },
        {
            id: 'discrepancy', label: 'Discrepancies',
            count: mockNotifications.filter(n => n.type === 'discrepancy' && n.unread).length,
            icon: ExclamationTriangleIcon,
            colorTheme: { activeBg: 'bg-red-500/15', activeText: 'text-red-500', activeBorder: 'border-red-500/20', badgeBg: 'bg-red-500/20', badgeText: 'text-red-500' },
            filter: (n) => n.type === 'discrepancy'
        },
        {
            id: 'quotes', label: 'Quotes & POs',
            count: mockNotifications.filter(n => (n.type === 'quote_update' || n.type === 'po_created' || n.type === 'ack_received' || n.type === 'approval') && n.unread).length,
            icon: DocumentTextIcon,
            colorTheme: { activeBg: 'bg-blue-500/15', activeText: 'text-blue-500', activeBorder: 'border-blue-500/20', badgeBg: 'bg-blue-500/20', badgeText: 'text-blue-500' },
            filter: (n) => n.type === 'quote_update' || n.type === 'po_created' || n.type === 'ack_received' || n.type === 'approval'
        },
        {
            id: 'pricing', label: 'Pricing',
            count: mockNotifications.filter(n => (n.type === 'payment' || n.type === 'invoice') && n.unread).length,
            icon: CreditCardIcon,
            colorTheme: { activeBg: 'bg-amber-500/15', activeText: 'text-amber-500', activeBorder: 'border-amber-500/20', badgeBg: 'bg-amber-500/20', badgeText: 'text-amber-500' },
            filter: (n) => n.type === 'payment' || n.type === 'invoice'
        },
        {
            id: 'shipping', label: 'Shipping',
            count: mockNotifications.filter(n => (n.type === 'shipment' || n.type === 'backorder') && n.unread).length,
            icon: TruckIcon,
            colorTheme: { activeBg: 'bg-green-500/15', activeText: 'text-green-500', activeBorder: 'border-green-500/20', badgeBg: 'bg-green-500/20', badgeText: 'text-green-500' },
            filter: (n) => n.type === 'shipment' || n.type === 'backorder'
        },
    ];

    const filteredNotifications = useMemo(() => {
        const currentTab = tabs.find(t => t.id === activeTab);
        return mockNotifications
            .filter(n => currentTab?.filter(n))
            .filter(n =>
                n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.meta.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [activeTab, searchQuery]);

    const urgentCount = mockNotifications.filter(n => n.priority === 'high').length;
    const totalCount = mockNotifications.filter(n => n.unread).length;

    // Flow 1 tabs for step 1.10 — single tab since only 1 notification
    const flow1Tabs: NotificationTab[] = [
        { id: 'all', label: 'All', count: FLOW1_NOTIFICATIONS.length, icon: Squares2X2Icon, colorTheme: { activeBg: 'bg-gray-200 dark:bg-white/10', activeText: 'text-foreground', activeBorder: 'border-gray-300 dark:border-white/10', badgeBg: 'bg-muted0/20 dark:bg-white/20', badgeText: 'text-foreground' }, filter: () => true },
        { id: 'quotes', label: 'Quotes & POs', count: FLOW1_NOTIFICATIONS.length, icon: DocumentTextIcon, colorTheme: { activeBg: 'bg-blue-500/15', activeText: 'text-blue-500', activeBorder: 'border-blue-500/20', badgeBg: 'bg-blue-500/20', badgeText: 'text-blue-500' }, filter: (n) => n.type === 'po_created' || n.type === 'quote_update' },
    ];

    // Flow 2 tabs for step 2.6
    const flow2Tabs: NotificationTab[] = [
        { id: 'all', label: 'All', count: FLOW2_NOTIFICATIONS.length, icon: Squares2X2Icon, colorTheme: { activeBg: 'bg-gray-200 dark:bg-white/10', activeText: 'text-foreground', activeBorder: 'border-gray-300 dark:border-white/10', badgeBg: 'bg-muted0/20 dark:bg-white/20', badgeText: 'text-foreground' }, filter: () => true },
        { id: 'acks', label: 'Acknowledgements', count: FLOW2_NOTIFICATIONS.filter(n => n.type === 'ack_received').length, icon: DocumentTextIcon, colorTheme: { activeBg: 'bg-blue-500/15', activeText: 'text-blue-500', activeBorder: 'border-blue-500/20', badgeBg: 'bg-blue-500/20', badgeText: 'text-blue-500' }, filter: (n) => n.type === 'ack_received' },
        { id: 'system', label: 'System', count: FLOW2_NOTIFICATIONS.filter(n => n.type === 'system').length, icon: SparklesIcon, colorTheme: { activeBg: 'bg-success/15', activeText: 'text-success', activeBorder: 'border-emerald-500/20', badgeBg: 'bg-success/20', badgeText: 'text-success' }, filter: (n) => n.type === 'system' },
    ];

    const A11_INGEST_LINES = [
        { text: 'DOE-2847.sif parsed · 6 line items extracted', isWarning: false },
        { text: 'NYC-DOE-2847-specs.pdf parsed',                 isWarning: false },
        { text: 'Floor plan detected',                           isWarning: false },
    ];

    const handleA11Ingest = () => {
        setA11IngestState('ingesting');
        pauseAwareTimeout(() => setA11IngestCount(1), 600);
        pauseAwareTimeout(() => setA11IngestCount(2), 1200);
        pauseAwareTimeout(() => setA11IngestCount(3), 1800);
        pauseAwareTimeout(() => {
            setA11IngestState('ready');
            window.dispatchEvent(new CustomEvent('bfi:ingest'));
            pauseAwareTimeout(() => setA11PanelClosed(true), 800);
        }, 2300);
    };

    const bfiStepConfig = isDemoActive ? BFI_STEP_NOTIFICATIONS[currentStep?.id ?? ''] : undefined;
    const isBfiStepActive = !!bfiStepConfig && !bfiPanelClosed && notifDelayReady;

    const isStepAutoOpen = isStep19 || isStep27 || (isStepA11 && !a11PanelClosed && notifDelayReady) || isBfiStepActive;

    return (
        <>
        <Popover className="relative">
            {({ open }) => (
                <>
                    <PopoverButton className={clsx(
                        "relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors outline-none",
                        (open || isStepAutoOpen || sampleTextileActive) ? "bg-black/5 dark:bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground dark:hover:text-white"
                    )}>
                        <BellIcon className="w-5 h-5" />
                        {(isStepAutoOpen || sampleTextileActive) && (
                            <span className="absolute inset-0 rounded-full ring-2 ring-green-500 animate-pulse" />
                        )}
                        {totalCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400 dark:bg-red-500 ring-2 ring-background" />
                        )}
                    </PopoverButton>

                    {/* Normal popover - hidden when auto-open steps to avoid duplication */}
                    {!isStepAutoOpen && !sampleTextileActive && <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-2 scale-95"
                        enterTo="opacity-100 translate-y-0 scale-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0 scale-100"
                        leaveTo="opacity-0 translate-y-2 scale-95"
                    >
                        <PopoverPanel className={clsx("fixed top-[90px] -translate-x-1/2 w-[95vw] max-h-[85vh] lg:w-[600px] p-0 z-50 focus:outline-none transition-all duration-300", sidebarExpanded ? 'left-[calc(50%+10rem)]' : 'left-1/2')}>
                            <div className="bg-zinc-100 dark:bg-zinc-900/85 backdrop-blur-xl border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">

                                <>
                                    {/* Header */}
                                    <div className="px-5 pt-5 pb-3 shrink-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-foreground">Action Center</h3>
                                            <div className="flex items-center gap-2">
                                                <button className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors">
                                                    <MagnifyingGlassIcon className="w-5 h-5" />
                                                </button>
                                                <button className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors">
                                                    <XMarkIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-4 space-y-3 scrollbar-minimal">
                                        {filteredNotifications.length > 0 ? (
                                            filteredNotifications.map(notification => (
                                                <NotificationItem
                                                    key={notification.id}
                                                    notification={notification}
                                                    onActionClick={(action) => {
                                                        // ORD-2056 delay scenario · View Order CTA navigates to the OrderDetail page with the delay items loaded.
                                                        if (notification.id === 'shipment-delayed-ord-2056' && action === 'View Order') {
                                                            try { sessionStorage.setItem('demo:selectedOrderId', '#ORD-2056') } catch { /* ignore */ }
                                                            window.dispatchEvent(new CustomEvent('demo:navigate', { detail: { page: 'order-detail' } }))
                                                        }
                                                    }}
                                                />
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                                <BellIcon className="w-12 h-12 mb-3 text-gray-300 dark:text-muted-foreground" />
                                                <p className="text-sm font-medium">No updates found</p>
                                                <p className="text-xs mt-1">You're all caught up!</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="px-5 py-3 border-t border-border bg-gray-50/50 dark:bg-black/20 backdrop-blur-md flex items-center justify-between shrink-0">
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {filteredNotifications.length} actions
                                        </p>
                                        <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                            {urgentCount} urgent
                                        </p>
                                    </div>
                                </>

                            </div>
                        </PopoverPanel>
                    </Transition>}
                </>
            )}
        </Popover>

        {/* Flow 3 · Sample & Textile — email-style notifications (Wendy items 9 & 10) */}
        {sampleTextileActive && (
            <>
                {/* No backdrop — a notification must not block the page. Panel sits above the navbar via z-[200]. */}
                <div className={clsx("fixed top-[90px] -translate-x-1/2 w-[95vw] max-h-[85vh] lg:w-[600px] p-0 z-[200] animate-in fade-in slide-in-from-top-2 duration-300", sidebarExpanded ? 'left-[calc(50%+10rem)]' : 'left-1/2')}>
                    <div className="bg-zinc-100 dark:bg-zinc-900/85 backdrop-blur-xl border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">
                        {/* Header */}
                        <div className="px-5 pt-5 pb-3 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-foreground">Action Center</h3>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-ai/15 text-ai font-bold">Sample &amp; Textile</span>
                                </div>
                                <button
                                    onClick={() => setSampleTextileActive(false)}
                                    aria-label="Close"
                                    className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Email-style notification (phase-dependent) */}
                        <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-4 space-y-3 scrollbar-minimal">
                            <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                                {samplePhase === 'request' ? (
                                    <NotificationItem
                                        notification={SAMPLE_REQUEST_NOTIF}
                                        onActionClick={(action) => {
                                            if (action === 'Review in quote') {
                                                window.dispatchEvent(new CustomEvent('sample-textile:focus', { detail: { sku: 'F-SSC346030C' } }));
                                                setSampleTextileActive(false);
                                            }
                                        }}
                                    />
                                ) : (
                                    <NotificationItem
                                        notification={sampleResponseNotif(sampleTracking ?? 'SMP-2026')}
                                        onActionClick={(action) => {
                                            if (action === 'View response') {
                                                window.dispatchEvent(new CustomEvent('sample-textile:reopen'));
                                                setSampleTextileActive(false);
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-border bg-gray-50/50 dark:bg-black/20 backdrop-blur-md flex items-center justify-between shrink-0">
                            <p className="text-xs font-medium text-muted-foreground">1 action</p>
                            <p className="text-xs font-bold text-ai flex items-center gap-1.5">
                                <SparklesIcon className="w-3.5 h-3.5" />
                                Sample &amp; textile flow
                            </p>
                        </div>
                    </div>
                </div>
            </>
        )}

        {/* Step 1.10: Always-visible Action Center with Flow 1 notifications */}
        {isStep19 && (
            <div className={clsx("fixed top-[90px] -translate-x-1/2 w-[95vw] max-h-[85vh] lg:w-[600px] p-0 z-50 animate-in fade-in slide-in-from-top-2 duration-300", sidebarExpanded ? 'left-[calc(50%+10rem)]' : 'left-1/2')}>
                <div className="bg-zinc-100 dark:bg-zinc-900/85 backdrop-blur-xl border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">
                    {/* Header */}
                    <div className="px-5 pt-5 pb-3 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-foreground">Action Center</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 font-bold">Flow 1</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors">
                                    <MagnifyingGlassIcon className="w-5 h-5" />
                                </button>
                                <button className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <FilterTabs tabs={flow1Tabs} activeTab="all" onTabChange={() => {}} />
                    </div>

                    {/* Flow 1 — Single focused notification */}
                    <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-4 space-y-3 scrollbar-minimal">
                        {FLOW1_NOTIFICATIONS.map((notification) => (
                            <div key={notification.id} className="animate-in fade-in slide-in-from-top-2 duration-500">
                                <NotificationItem
                                    notification={notification}
                                    onActionClick={(action) => {
                                        if (action === 'View PO') nextStep();
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-border bg-gray-50/50 dark:bg-black/20 backdrop-blur-md flex items-center justify-between shrink-0">
                        <p className="text-xs font-medium text-muted-foreground">
                            1 action
                        </p>
                        <p className="text-xs font-bold text-green-500 flex items-center gap-1.5">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            PO generated
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* BFI Step a1.1: Always-visible Action Center — Miller Knoll quote request */}
        {isStepA11 && !a11PanelClosed && notifDelayReady && (
            <div className={clsx("fixed top-[90px] -translate-x-1/2 w-[95vw] max-h-[85vh] lg:w-[600px] p-0 z-50 animate-in fade-in slide-in-from-top-2 duration-300", sidebarExpanded ? 'left-[calc(50%+10rem)]' : 'left-1/2')}>
                <div className="bg-zinc-100 dark:bg-zinc-900/85 backdrop-blur-xl border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">

                    {/* Header */}
                    <div className="px-5 pt-5 pb-3 shrink-0">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-foreground">Action Center</h3>
                                {a11IngestState === 'idle' && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/10 text-foreground font-bold">1 new</span>
                                )}
                                {a11IngestState === 'ingesting' && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-ai/15 text-ai font-bold animate-pulse">Ingesting…</span>
                                )}
                                {a11IngestState === 'ready' && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success font-bold">Ready</span>
                                )}
                            </div>
                            {a11IngestState === 'idle' && (
                                <button onClick={() => setA11PanelClosed(true)} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Body — depends on ingest state */}
                    <div className="px-5 pb-5 space-y-3">

                        {/* idle: original notification card */}
                        {a11IngestState === 'idle' && (
                            <div className="relative rounded-2xl ring-2 ring-primary shadow-lg shadow-primary/20 animate-in fade-in duration-500">
                                <span className="absolute -top-2 right-4 text-[9px] font-black text-primary-foreground bg-primary px-2 py-0.5 rounded-full shadow-sm z-10">
                                    INCOMING
                                </span>
                                <NotificationItem
                                    notification={BFI_A11_NOTIFICATIONS[0]}
                                    onActionClick={(action) => {
                                        if (action === 'Ingest with Strata') handleA11Ingest()
                                    }}
                                />
                            </div>
                        )}

                        {/* ingesting: processing animation */}
                        {a11IngestState === 'ingesting' && (
                            <div className="rounded-2xl bg-muted dark:bg-zinc-800 border border-border p-5 space-y-4 animate-in fade-in duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-ai/10 flex items-center justify-center shrink-0">
                                        <SparklesIcon className="w-4 h-4 text-ai animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Ingesting with Strata AI…</p>
                                        <p className="text-[11px] text-muted-foreground">DOE-2847 · Miller Knoll quote</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {A11_INGEST_LINES.slice(0, a11IngestCount).map((line, i) => (
                                        <div key={i} className={`flex items-center gap-2 text-[11px] animate-in fade-in duration-300 ${line.isWarning ? 'text-warning' : 'text-success'}`}>
                                            {line.isWarning
                                                ? <ExclamationTriangleIcon className="w-3.5 h-3.5 shrink-0" />
                                                : <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                                            }
                                            {line.text}
                                        </div>
                                    ))}
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-ai rounded-full transition-all duration-700"
                                        style={{ width: `${Math.round((a11IngestCount / A11_INGEST_LINES.length) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ready: email detail + all lines + Review Order button */}
                        {a11IngestState === 'ready' && (
                            <div className="rounded-2xl bg-muted dark:bg-zinc-800 border border-border overflow-hidden animate-in fade-in duration-400">
                                {/* Email header */}
                                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                                    <SparklesIcon className="w-4 h-4 text-ai shrink-0" />
                                    <span className="text-sm font-semibold text-foreground flex-1">New quote request · Miller Knoll</span>
                                    <span className="text-[10px] text-muted-foreground shrink-0">May 6 · 8:14 AM</span>
                                </div>
                                {/* Email meta */}
                                <div className="px-4 py-3 space-y-1 border-b border-border">
                                    {[
                                        { label: 'From', value: 'Account Manager Bly · Miller Knoll Rep' },
                                        { label: 'Re',   value: 'DOE-2847 · NYC Dept. of Education · quote request' },
                                    ].map(f => (
                                        <div key={f.label} className="flex gap-2 text-[11px]">
                                            <span className="text-muted-foreground w-8 shrink-0">{f.label}</span>
                                            <span className="text-foreground font-medium">{f.value}</span>
                                        </div>
                                    ))}
                                </div>
                                {/* Attachments */}
                                <div className="px-4 py-2.5 border-b border-border flex items-center gap-2 flex-wrap">
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Attachments:</span>
                                    <span className="flex items-center gap-1 text-[10px] text-ai font-medium px-2 py-0.5 rounded bg-ai/10 border border-ai/20">
                                        <DocumentTextIcon className="w-3 h-3" /> DOE-2847.sif
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-muted/40 border border-border">
                                        <DocumentTextIcon className="w-3 h-3" /> NYC-DOE-2847-specs.pdf
                                    </span>
                                </div>
                                {/* AI results */}
                                <div className="px-4 py-3 border-b border-border space-y-2">
                                    {A11_INGEST_LINES.map((line, i) => (
                                        <div key={i} className={`flex items-center gap-2 text-[11px] ${line.isWarning ? 'text-warning' : 'text-success'}`}>
                                            {line.isWarning
                                                ? <ExclamationTriangleIcon className="w-3.5 h-3.5 shrink-0" />
                                                : <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                                            }
                                            {line.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {a11IngestState === 'idle' && (
                        <div className="px-5 py-3 border-t border-border bg-gray-50/50 dark:bg-black/20 backdrop-blur-md flex items-center justify-between shrink-0">
                            <p className="text-xs font-medium text-muted-foreground">1 action</p>
                            <p className="text-xs font-bold text-ai flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-ai animate-pulse" />
                                Awaiting ingest
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* BFI Steps a1.2d / a1.2e / a1.2f / a1.3b: Generic incoming-event notification panel */}
        {isBfiStepActive && bfiStepConfig && (
            <div className={clsx("fixed top-[90px] -translate-x-1/2 w-[95vw] lg:w-[520px] z-50 animate-in fade-in slide-in-from-top-2 duration-300", sidebarExpanded ? 'left-[calc(50%+10rem)]' : 'left-1/2')}>
                <div className="bg-zinc-100 dark:bg-zinc-900/85 backdrop-blur-xl border border-border shadow-2xl rounded-3xl overflow-hidden">

                    {/* Header */}
                    <div className="px-5 pt-5 pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-foreground">Action Center</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                bfiStepConfig.badgeColor === 'warning' ? 'bg-warning/15 text-warning' :
                                bfiStepConfig.badgeColor === 'success' ? 'bg-success/15 text-success' :
                                'bg-foreground/10 text-foreground'
                            }`}>{bfiStepConfig.badge}</span>
                        </div>
                        <button onClick={() => setBfiPanelClosed(true)} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-5 pb-5">
                        <div className="rounded-2xl bg-muted dark:bg-zinc-800 border border-border overflow-hidden">
                            {/* Email subject line */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                                <SparklesIcon className="w-4 h-4 text-ai shrink-0" />
                                <span className="text-sm font-semibold text-foreground flex-1">{bfiStepConfig.title}</span>
                                <span className="text-[10px] text-muted-foreground shrink-0">May 6 · 9:30 AM</span>
                            </div>
                            {/* Email meta */}
                            <div className="px-4 py-3 border-b border-border space-y-1">
                                <div className="flex gap-2 text-[11px]">
                                    <span className="text-muted-foreground w-10 shrink-0">From</span>
                                    <span className="text-foreground font-medium">{bfiStepConfig.sender}</span>
                                </div>
                                {bfiStepConfig.re ? (
                                    <div className="flex gap-2 text-[11px]">
                                        <span className="text-muted-foreground w-10 shrink-0">Re</span>
                                        <span className="text-foreground">{bfiStepConfig.re}</span>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 text-[11px]">
                                        <span className="text-muted-foreground w-10 shrink-0">Info</span>
                                        <span className="text-foreground">{bfiStepConfig.desc}</span>
                                    </div>
                                )}
                            </div>
                            {/* Attachment chip — only when present */}
                            {bfiStepConfig.attachment && (
                                <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide shrink-0">Attachment:</span>
                                    <span className="flex items-center gap-1 text-[10px] text-success font-medium px-2 py-0.5 rounded bg-success/10 border border-success/20">
                                        <DocumentTextIcon className="w-3 h-3" /> {bfiStepConfig.attachment}
                                    </span>
                                </div>
                            )}
                            {/* Body excerpt — shown only when re is present (full email style) */}
                            {bfiStepConfig.re && (
                                <div className="px-4 py-3 border-b border-border">
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">{bfiStepConfig.desc}</p>
                                </div>
                            )}
                            <div className="px-4 py-4">
                                <button
                                    onClick={() => {
                                        setBfiPanelClosed(true);
                                        window.dispatchEvent(new CustomEvent(bfiStepConfig.event));
                                    }}
                                    className="w-full py-2.5 text-[12px] font-black rounded-xl bg-foreground text-background hover:opacity-80 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                                >
                                    {bfiStepConfig.cta}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-border bg-gray-50/50 dark:bg-black/20 backdrop-blur-md flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">1 action</p>
                        <p className="text-xs font-bold text-ai flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-ai animate-pulse" />
                            {bfiStepConfig.footerText}
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* Step 2.6: Always-visible Action Center with Flow 2 Acknowledgement notifications */}
        {isStep27 && (
            <div className={clsx("fixed top-[90px] -translate-x-1/2 w-[95vw] max-h-[85vh] lg:w-[600px] p-0 z-50 animate-in fade-in slide-in-from-top-2 duration-300", sidebarExpanded ? 'left-[calc(50%+10rem)]' : 'left-1/2')}>
                <div className="bg-zinc-100 dark:bg-zinc-900/85 backdrop-blur-xl border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">
                    {/* Header */}
                    <div className="px-5 pt-5 pb-3 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-foreground">Action Center</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold">Flow 2</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors">
                                    <MagnifyingGlassIcon className="w-5 h-5" />
                                </button>
                                <button className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <FilterTabs tabs={flow2Tabs} activeTab="all" onTabChange={() => {}} />
                    </div>

                    {/* Flow 2 Notifications */}
                    <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-4 space-y-3 scrollbar-minimal">
                        {FLOW2_NOTIFICATIONS.map((notification, i) => {
                            const isCRMSync = notification.id === 'f2-crm-sync';
                            const isDelivered = notifDelivered27.includes(i);
                            return (
                                <div
                                    key={notification.id}
                                    className={clsx(
                                        "transition-all duration-700",
                                        isDelivered
                                            ? 'opacity-100 translate-y-0'
                                            : 'opacity-0 translate-y-4 h-0 overflow-hidden'
                                    )}
                                >
                                    <div className={clsx(
                                        "relative rounded-2xl transition-all duration-500",
                                        isCRMSync && isDelivered && "ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-zinc-900 shadow-lg shadow-brand-500/20"
                                    )}>
                                        <NotificationItem
                                            notification={notification}
                                            onActionClick={isCRMSync ? () => nextStep() : undefined}
                                        />
                                        {isDelivered && !isCRMSync && (
                                            <span className="absolute top-3 right-3 text-[9px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full">
                                                <CheckCircleIcon className="w-3 h-3" /> Delivered
                                            </span>
                                        )}
                                        {isCRMSync && isDelivered && (
                                            <span className="absolute top-3 right-3 text-[9px] font-bold text-brand-700 dark:text-brand-400 flex items-center gap-1 bg-brand-50 dark:bg-brand-500/15 px-2 py-0.5 rounded-full animate-pulse">
                                                Next Step →
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-border bg-gray-50/50 dark:bg-black/20 backdrop-blur-md flex items-center justify-between shrink-0">
                        <p className="text-xs font-medium text-muted-foreground">
                            {notifDelivered27.length} actions
                        </p>
                        {notifDelivered27.includes(3) ? (
                            <p className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                                CRM sync ready
                            </p>
                        ) : (
                            <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                {FLOW2_NOTIFICATIONS.filter(n => n.priority === 'high').length} urgent
                            </p>
                        )}
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
