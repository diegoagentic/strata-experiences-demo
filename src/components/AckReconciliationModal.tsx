import { Fragment, useState, useEffect, useMemo } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
    XMarkIcon, ArrowRightIcon, ArrowLeftIcon, CheckCircleIcon, XCircleIcon,
    ExclamationTriangleIcon, SparklesIcon, DocumentMagnifyingGlassIcon,
    ClipboardDocumentCheckIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { StatusBadge } from './shared'

// ── Types ──────────────────────────────────────────────────────

interface AckReconciliationModalProps {
    isOpen: boolean;
    onClose: () => void;
    triggerToast: (title: string, description: string, type: 'success' | 'error' | 'info') => void;
    /** When provided, the modal skips the 'select' step and opens directly at 'compare' with that PO/Ack pair preselected. */
    preselectedAckId?: string;
}

type ReconcileStep = 'select' | 'compare' | 'review' | 'confirm';

interface AckPair {
    id: string;
    poId: string;
    customer: string;
    project: string;
    poAmount: string;
    ackAmount: string;
    status: 'Pending Review' | 'Matched' | 'In production' | 'Shipped' | 'Completed';
    date: string;
    initials: string;
    vendor: string;
}

interface ComparisonField {
    field: string;
    category: 'header' | 'line-item' | 'pricing' | 'logistics' | 'terms';
    poValue: string;
    ackValue: string;
    status: 'match' | 'mismatch' | 'partial';
    autoFixSuggestion?: string;
    confidence?: number;
    severity?: 'low' | 'medium' | 'high';
}

// ── Mock Data ──────────────────────────────────────────────────

const ACK_PAIRS: AckPair[] = [
    { id: 'ACK-8840', poId: '#ORD-2055', customer: 'AutoManfacture Co.', project: 'Office Renovation', poAmount: '$385,000', ackAmount: '$382,450', status: 'Pending Review', date: 'Jan 08, 2026', initials: 'AC', vendor: 'Steelcase' },
    { id: 'ACK-8838', poId: '#ORD-2051', customer: 'City Builders', project: 'City Center Phase 2', poAmount: '$120,000', ackAmount: '$120,000', status: 'Matched', date: 'Jan 12, 2026', initials: 'CB', vendor: 'Haworth' },
    { id: 'ACK-8835', poId: '#ORD-2054', customer: 'TechDealer Solutions', project: 'HQ Upgrade', poAmount: '$62,500', ackAmount: '$61,200', status: 'Pending Review', date: 'Dec 22, 2025', initials: 'TS', vendor: 'Herman Miller' },
    { id: 'ACK-8832', poId: '#ORD-2049', customer: 'Meridian Group', project: 'Regional Office', poAmount: '$98,400', ackAmount: '$98,400', status: 'In production', date: 'Feb 15, 2026', initials: 'MG', vendor: 'Knoll' },
    { id: 'ACK-8830', poId: '#ORD-2053', customer: 'Urban Living Inc.', project: 'Lobby Refresh', poAmount: '$112,000', ackAmount: '$109,800', status: 'Pending Review', date: 'Nov 05, 2025', initials: 'UL', vendor: 'National Office' },
    { id: 'ACK-8828', poId: '#ORD-2048', customer: 'Summit Healthcare', project: 'Clinic Furniture', poAmount: '$68,200', ackAmount: '$68,200', status: 'Completed', date: 'Oct 20, 2025', initials: 'SH', vendor: 'Kimball' },
];

const RECONCILIATION_COMPARISON_1: ComparisonField[] = [
    { field: 'Vendor Name', category: 'header', poValue: 'AutoManfacture Co.', ackValue: 'AutoManfacture Co.', status: 'match' },
    { field: 'PO Number', category: 'header', poValue: '#ORD-2055', ackValue: '#ORD-2055', status: 'match' },
    { field: 'Ship-To Address', category: 'logistics', poValue: '450 Commerce Blvd, Suite 300, Austin TX', ackValue: '450 Commerce Blvd, Suite 300, Austin TX', status: 'match' },
    { field: 'Line 1: Qty (Ergonomic Task Chair)', category: 'line-item', poValue: '20', ackValue: '18', status: 'mismatch', autoFixSuggestion: 'Vendor acknowledged 18 units. 2 units on backorder — separate shipment ETA Apr 10, 2026. Recommend splitting order.', confidence: 94, severity: 'high' },
    { field: 'Line 1: Unit Price', category: 'pricing', poValue: '$89.00', ackValue: '$92.50', status: 'mismatch', autoFixSuggestion: 'Price increased $3.50/unit vs PO. Vendor applied 2026 price list. Verify against SPA contract #SPA-2025-112.', confidence: 91, severity: 'high' },
    { field: 'Line 2: Qty (Standing Desk 60x30)', category: 'line-item', poValue: '15', ackValue: '15', status: 'match' },
    { field: 'Line 2: Unit Price', category: 'pricing', poValue: '$245.00', ackValue: '$245.00', status: 'match' },
    { field: 'Line 3: Finish (Monitor Arm)', category: 'line-item', poValue: 'Matte Black', ackValue: 'Black Matte', status: 'partial', autoFixSuggestion: 'Naming convention difference. Same manufacturer finish code MB-01. No action needed.', confidence: 97, severity: 'low' },
    { field: 'Line 3: Qty (Monitor Arm)', category: 'line-item', poValue: '8', ackValue: '6', status: 'mismatch', autoFixSuggestion: 'Vendor confirmed only 6 available. Remaining 2 units on allocation — ETA +3 weeks. Suggest partial acceptance.', confidence: 92, severity: 'high' },
    { field: 'Estimated Ship Date', category: 'logistics', poValue: 'Mar 10, 2026', ackValue: 'Mar 22, 2026', status: 'partial', autoFixSuggestion: 'Ship date pushed 12 days. Within 21-day tolerance. Vendor cited material sourcing delay.', confidence: 88, severity: 'medium' },
    { field: 'Freight Terms', category: 'terms', poValue: 'FOB Destination', ackValue: 'FOB Destination', status: 'match' },
    { field: 'Payment Terms', category: 'terms', poValue: 'Net 30', ackValue: 'Net 30', status: 'match' },
    { field: 'Total Acknowledged', category: 'pricing', poValue: '$41,150.00', ackValue: '$40,110.00', status: 'mismatch', autoFixSuggestion: 'Delta of -$1,040. Driven by qty shortfall (chairs -2, monitors -2) offset by unit price increase on chairs. Net impact requires review.', confidence: 96, severity: 'high' },
];

const RECONCILIATION_COMPARISON_2: ComparisonField[] = [
    { field: 'Vendor Name', category: 'header', poValue: 'TechDealer Solutions', ackValue: 'TechDealer Solutions', status: 'match' },
    { field: 'PO Number', category: 'header', poValue: '#ORD-2054', ackValue: '#ORD-2054', status: 'match' },
    { field: 'Ship-To Address', category: 'logistics', poValue: '2100 Innovation Way, San Jose, CA', ackValue: '2100 Innovation Way, San Jose, CA', status: 'match' },
    { field: 'Line 1: Qty (Executive Desk)', category: 'line-item', poValue: '6', ackValue: '6', status: 'match' },
    { field: 'Line 1: Unit Price', category: 'pricing', poValue: '$3,200.00', ackValue: '$3,200.00', status: 'match' },
    { field: 'Line 2: Finish (Conference Table)', category: 'line-item', poValue: 'Natural Oak', ackValue: 'White Oak - Natural', status: 'partial', autoFixSuggestion: 'Finish name maps to same SKU CT-NOK-2400. Manufacturer naming variant.', confidence: 95, severity: 'low' },
    { field: 'Line 2: Qty (Conference Table 96")', category: 'line-item', poValue: '2', ackValue: '2', status: 'match' },
    { field: 'Line 2: Unit Price', category: 'pricing', poValue: '$8,500.00', ackValue: '$8,150.00', status: 'mismatch', autoFixSuggestion: 'Vendor applied volume discount not in PO. Lower price benefits buyer — recommend accepting.', confidence: 98, severity: 'medium' },
    { field: 'Line 3: Qty (Visitor Chair)', category: 'line-item', poValue: '12', ackValue: '10', status: 'mismatch', autoFixSuggestion: 'Vendor can fulfill 10 immediately. Remaining 2 available in 4 weeks. Suggest accepting partial with backorder.', confidence: 90, severity: 'high' },
    { field: 'Estimated Ship Date', category: 'logistics', poValue: 'Feb 28, 2026', ackValue: 'Mar 05, 2026', status: 'partial', autoFixSuggestion: 'Slight delay of 5 days. Well within tolerance. Production on schedule.', confidence: 93, severity: 'low' },
    { field: 'Freight Terms', category: 'terms', poValue: 'FOB Origin', ackValue: 'FOB Origin', status: 'match' },
    { field: 'Total Acknowledged', category: 'pricing', poValue: '$62,500.00', ackValue: '$61,200.00', status: 'mismatch', autoFixSuggestion: 'Delta -$1,300. Due to conference table discount (-$700) and visitor chair qty reduction (-$600). Net favorable if partial accepted.', confidence: 95, severity: 'high' },
];

const RECONCILIATION_COMPARISON_3: ComparisonField[] = [
    { field: 'Vendor Name', category: 'header', poValue: 'Urban Living Inc.', ackValue: 'Urban Living Inc.', status: 'match' },
    { field: 'PO Number', category: 'header', poValue: '#ORD-2053', ackValue: '#ORD-2053', status: 'match' },
    { field: 'Ship-To Address', category: 'logistics', poValue: '1800 Broadway, Floor 12, New York, NY', ackValue: '1800 Broadway, Floor 12, New York, NY', status: 'match' },
    { field: 'Line 1: Qty (Lounge Sofa)', category: 'line-item', poValue: '8', ackValue: '8', status: 'match' },
    { field: 'Line 1: Unit Price', category: 'pricing', poValue: '$4,800.00', ackValue: '$4,800.00', status: 'match' },
    { field: 'Line 1: Fabric (Lounge Sofa)', category: 'line-item', poValue: 'Marine Blue - Grade A', ackValue: 'Marine Blue - Grade B', status: 'mismatch', autoFixSuggestion: 'Fabric grade downgraded from A to B. Vendor cited Grade A discontinued. Grade B same appearance, different backing. Price should decrease $120/unit.', confidence: 89, severity: 'high' },
    { field: 'Line 2: Qty (Accent Table)', category: 'line-item', poValue: '16', ackValue: '16', status: 'match' },
    { field: 'Line 2: Unit Price', category: 'pricing', poValue: '$680.00', ackValue: '$680.00', status: 'match' },
    { field: 'Line 3: Qty (Floor Lamp)', category: 'line-item', poValue: '12', ackValue: '12', status: 'match' },
    { field: 'Delivery Date', category: 'logistics', poValue: 'Jan 20, 2026', ackValue: 'Feb 02, 2026', status: 'partial', autoFixSuggestion: 'Delivery pushed 13 days. Vendor cited shipping backlog. Within project timeline tolerance.', confidence: 85, severity: 'medium' },
    { field: 'Installation Included', category: 'terms', poValue: 'Yes', ackValue: 'Yes — 2 days', status: 'match' },
    { field: 'Total Acknowledged', category: 'pricing', poValue: '$112,000.00', ackValue: '$109,800.00', status: 'mismatch', autoFixSuggestion: 'Delta -$2,200. Driven by fabric grade change (-$960 on sofas) and unspecified vendor adjustment. Requires clarification.', confidence: 92, severity: 'high' },
];

const CLEAN_RECONCILIATION: ComparisonField[] = [
    { field: 'Vendor Name', category: 'header', poValue: 'City Builders', ackValue: 'City Builders', status: 'match' },
    { field: 'PO Number', category: 'header', poValue: '#ORD-2051', ackValue: '#ORD-2051', status: 'match' },
    { field: 'Ship-To Address', category: 'logistics', poValue: '500 Main St, Chicago, IL', ackValue: '500 Main St, Chicago, IL', status: 'match' },
    { field: 'Line 1: Qty (Office Workstation)', category: 'line-item', poValue: '30', ackValue: '30', status: 'match' },
    { field: 'Line 1: Unit Price', category: 'pricing', poValue: '$2,400.00', ackValue: '$2,400.00', status: 'match' },
    { field: 'Line 2: Qty (Task Chair)', category: 'line-item', poValue: '30', ackValue: '30', status: 'match' },
    { field: 'Line 2: Unit Price', category: 'pricing', poValue: '$650.00', ackValue: '$650.00', status: 'match' },
    { field: 'Estimated Ship Date', category: 'logistics', poValue: 'Feb 15, 2026', ackValue: 'Feb 15, 2026', status: 'match' },
    { field: 'Freight Terms', category: 'terms', poValue: 'FOB Destination', ackValue: 'FOB Destination', status: 'match' },
    { field: 'Payment Terms', category: 'terms', poValue: 'Net 30', ackValue: 'Net 30', status: 'match' },
    { field: 'Total Acknowledged', category: 'pricing', poValue: '$120,000.00', ackValue: '$120,000.00', status: 'match' },
];

// ── Comparison data map ────────────────────────────────────────

const COMPARISON_MAP: Record<string, ComparisonField[]> = {
    'ACK-8840': RECONCILIATION_COMPARISON_1,
    'ACK-8835': RECONCILIATION_COMPARISON_2,
    'ACK-8830': RECONCILIATION_COMPARISON_3,
};

// ── Status helpers ─────────────────────────────────────────────

const statusIcon = (s: 'match' | 'mismatch' | 'partial') => {
    if (s === 'match') return <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400" />;
    if (s === 'mismatch') return <XCircleIcon className="w-5 h-5 text-red-500 dark:text-red-400" />;
    return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
};

const statusRowBg = (s: 'match' | 'mismatch' | 'partial') => {
    if (s === 'match') return '';
    if (s === 'mismatch') return 'bg-red-50/40 dark:bg-red-500/5';
    return 'bg-amber-50/40 dark:bg-amber-500/5';
};

const severityColor = (sev?: 'low' | 'medium' | 'high') => {
    if (sev === 'high') return 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-500/5';
    if (sev === 'medium') return 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-500/5';
    return 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-500/5';
};

const severityBadge = (sev?: 'low' | 'medium' | 'high') => {
    if (sev === 'high') return <StatusBadge label="High" tone="danger" size="xs" uppercase={false} />;
    if (sev === 'medium') return <StatusBadge label="Medium" tone="warning" size="xs" uppercase={false} />;
    return <StatusBadge label="Low" tone="info" size="xs" uppercase={false} />;
};

const pairStatusBadge = (status: AckPair['status']) => {
    const styles: Record<AckPair['status'], string> = {
        'Pending Review': 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
        'Matched': 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
        'In production': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
        'Shipped': 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400',
        'Completed': 'bg-zinc-100 dark:bg-zinc-700/40 text-muted-foreground',
    };
    return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${styles[status]}`}>{status}</span>;
};

// ── Component ──────────────────────────────────────────────────

export default function AckReconciliationModal({ isOpen, onClose, triggerToast, preselectedAckId }: AckReconciliationModalProps) {
    const preselectedPair = useMemo(
        () => preselectedAckId ? ACK_PAIRS.find(p => p.id === preselectedAckId) ?? null : null,
        [preselectedAckId]
    );
    const [step, setStep] = useState<ReconcileStep>(preselectedPair ? 'compare' : 'select');
    const [selectedPair, setSelectedPair] = useState<AckPair | null>(preselectedPair);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanComplete, setScanComplete] = useState(false);
    const [discrepancyFixes, setDiscrepancyFixes] = useState<Record<number, 'accept' | 'reject'>>({});

    const eligibleStatuses: AckPair['status'][] = ['Pending Review', 'Matched'];

    // Determine comparison data
    const isCleanPair = selectedPair?.status === 'Matched';
    const activeComparison = useMemo(() => {
        if (!selectedPair) return CLEAN_RECONCILIATION;
        if (isCleanPair) return CLEAN_RECONCILIATION;
        return COMPARISON_MAP[selectedPair.id] || RECONCILIATION_COMPARISON_1;
    }, [selectedPair, isCleanPair]);

    // Reset on close — respect preselected pair so reopening from a detail page jumps back to compare
    useEffect(() => {
        if (!isOpen) {
            const t = setTimeout(() => {
                setStep(preselectedPair ? 'compare' : 'select');
                setSelectedPair(preselectedPair);
                setScanProgress(0);
                setScanComplete(false);
                setDiscrepancyFixes({});
            }, 300);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    // Scanning animation
    useEffect(() => {
        if (step !== 'compare') return;
        setScanProgress(0);
        setScanComplete(false);
        const interval = setInterval(() => {
            setScanProgress(prev => {
                const next = prev + Math.random() * 12 + 6;
                if (next >= 100) {
                    clearInterval(interval);
                    setScanComplete(true);
                    return 100;
                }
                return next;
            });
        }, 180);
        return () => clearInterval(interval);
    }, [step]);

    // Auto-advance for clean pairs (no discrepancies)
    useEffect(() => {
        if (step === 'compare' && scanComplete && isCleanPair) {
            const t = setTimeout(() => setStep('confirm'), 1200);
            return () => clearTimeout(t);
        }
    }, [step, scanComplete, isCleanPair]);

    // Derived data
    const discrepancies = useMemo(() =>
        activeComparison.filter(f => f.status !== 'match'),
        [activeComparison]
    );

    const matchedCount = activeComparison.filter(f => f.status === 'match').length;
    const allDecided = discrepancies.every((_, i) => discrepancyFixes[i] !== undefined);
    const acceptedCount = Object.values(discrepancyFixes).filter(v => v === 'accept').length;

    const handleComplete = () => {
        onClose();
        triggerToast(
            'Reconciliation Complete',
            `${selectedPair?.id} ↔ ${selectedPair?.poId} reconciled successfully`,
            'success'
        );
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[200]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto scrollbar-minimal">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-background text-left shadow-2xl transition-all border border-border w-full sm:max-w-4xl">
                                {/* ──── Step 1: Select PO/ACK Pair ──── */}
                                {step === 'select' && (
                                    <div className="p-6 sm:p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <Dialog.Title as="h3" className="text-xl font-brand font-bold text-foreground mb-1 flex items-center gap-2.5">
                                                    <DocumentMagnifyingGlassIcon className="w-6 h-6 text-indigo-500" />
                                                    PO vs Acknowledgment Reconciliation
                                                </Dialog.Title>
                                                <p className="text-sm text-muted-foreground">
                                                    Select a PO–ACK pair to review. "Pending Review" pairs require full validation. "Matched" pairs are pre-verified.
                                                </p>
                                            </div>
                                            <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="space-y-3 max-h-[420px] overflow-y-auto scrollbar-minimal pr-1">
                                            {ACK_PAIRS.map(pair => {
                                                const eligible = eligibleStatuses.includes(pair.status);
                                                const selected = selectedPair?.id === pair.id;
                                                return (
                                                    <button
                                                        key={pair.id}
                                                        onClick={() => eligible && setSelectedPair(pair)}
                                                        disabled={!eligible}
                                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                                            selected
                                                                ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20'
                                                                : eligible
                                                                    ? 'border-border hover:border-primary/40 hover:shadow-sm bg-card cursor-pointer'
                                                                    : 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                                                selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                                            }`}>
                                                                {pair.initials}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <span className="text-sm font-bold text-foreground">{pair.id}</span>
                                                                    <span className="text-[10px] text-muted-foreground/60">↔</span>
                                                                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{pair.poId}</span>
                                                                    <span className="text-[10px] text-muted-foreground">—</span>
                                                                    <span className="text-sm text-foreground truncate">{pair.customer}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                                                    <span>{pair.project}</span>
                                                                    <span className="text-muted-foreground/50">|</span>
                                                                    <span className="font-medium text-foreground">PO: {pair.poAmount}</span>
                                                                    <span className="text-muted-foreground/50">→</span>
                                                                    <span className={`font-semibold ${pair.poAmount !== pair.ackAmount ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                                                                        ACK: {pair.ackAmount}
                                                                    </span>
                                                                    <span className="text-muted-foreground/50">|</span>
                                                                    <span>{pair.vendor}</span>
                                                                </div>
                                                            </div>
                                                            {pairStatusBadge(pair.status)}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => setStep('compare')}
                                            disabled={!selectedPair}
                                            className={`w-full mt-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                                selectedPair
                                                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                                            }`}
                                        >
                                            Start Reconciliation
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* ──── Step 2: Compare PO vs ACK ──── */}
                                {step === 'compare' && (
                                    <div className="p-6 sm:p-8">
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="flex items-center gap-3">
                                                {!preselectedPair && (
                                                    <button onClick={() => setStep('select')} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                                        <ArrowLeftIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <div>
                                                    <h3 className="text-lg font-brand font-bold text-foreground">
                                                        Reconciling {selectedPair?.poId} ↔ {selectedPair?.id}
                                                    </h3>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        Comparing Purchase Order against vendor Acknowledgment — {selectedPair?.vendor}
                                                    </p>
                                                </div>
                                            </div>
                                            <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* AI Agent Banner */}
                                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 mb-5 flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                                                <SparklesIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-indigo-900 dark:text-indigo-200">ReconciliationAgent</span>
                                                <span className="text-sm text-indigo-700 dark:text-indigo-300">
                                                    {scanComplete
                                                        ? isCleanPair
                                                            ? ` — All ${matchedCount} fields matched. PO and ACK are fully aligned.`
                                                            : ` — Scan complete. ${matchedCount}/${activeComparison.length} fields matched, ${discrepancies.length} discrepancies found.`
                                                        : ` — Cross-referencing ${selectedPair?.poId} against ${selectedPair?.id} from ${selectedPair?.vendor}...`
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {!scanComplete && (
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[11px] text-muted-foreground">Validating fields...</span>
                                                    <span className="text-[11px] font-bold text-foreground">{Math.min(100, Math.round(scanProgress))}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-200"
                                                        style={{ width: `${Math.min(100, scanProgress)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Comparison Table */}
                                        {scanComplete && (
                                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                {/* Summary badges */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    <StatusBadge label={`${matchedCount} Matched`} tone="success" size="md" uppercase={false} />
                                                    <StatusBadge label={`${discrepancies.filter(d => d.status === 'mismatch').length} Mismatch`} tone="danger" size="md" uppercase={false} />
                                                    <StatusBadge label={`${discrepancies.filter(d => d.status === 'partial').length} Partial`} tone="warning" size="md" uppercase={false} />
                                                </div>

                                                <div className="border border-border rounded-xl overflow-hidden max-h-[340px] overflow-y-auto scrollbar-minimal">
                                                    <table className="w-full text-sm">
                                                        <thead className="sticky top-0 z-10">
                                                            <tr className="bg-muted/80 backdrop-blur-sm">
                                                                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Field</th>
                                                                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">PO Value</th>
                                                                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">ACK Value</th>
                                                                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-16">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border">
                                                            {activeComparison.map((row, i) => (
                                                                <tr key={i} className={statusRowBg(row.status)}>
                                                                    <td className="px-4 py-2.5 text-[12px] text-foreground font-medium">{row.field}</td>
                                                                    <td className={`px-4 py-2.5 text-[12px] ${row.status === 'mismatch' ? 'text-foreground font-medium' : 'text-foreground'}`}>
                                                                        {row.poValue}
                                                                    </td>
                                                                    <td className={`px-4 py-2.5 text-[12px] ${row.status === 'mismatch' ? 'text-red-600 dark:text-red-400 font-semibold' : row.status === 'partial' ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                                                                        {row.ackValue}
                                                                    </td>
                                                                    <td className="px-4 py-2.5 text-center">{statusIcon(row.status)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <button
                                                    onClick={() => setStep('review')}
                                                    className="w-full mt-5 py-3 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all flex items-center justify-center gap-2"
                                                >
                                                    Review Discrepancies ({discrepancies.length})
                                                    <ArrowRightIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ──── Step 3: Review Discrepancies ──── */}
                                {step === 'review' && (
                                    <div className="p-6 sm:p-8">
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => setStep('compare')} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                                    <ArrowLeftIcon className="w-4 h-4" />
                                                </button>
                                                <div>
                                                    <h3 className="text-lg font-brand font-bold text-foreground">Review Discrepancies</h3>
                                                    <p className="text-[11px] text-muted-foreground">{discrepancies.length} items require your decision — {selectedPair?.poId} ↔ {selectedPair?.id}</p>
                                                </div>
                                            </div>
                                            <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* KPI Strip */}
                                        <div className="grid grid-cols-4 gap-3 mb-5">
                                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-800 text-center">
                                                <span className="text-lg font-bold text-green-700 dark:text-green-400">{matchedCount}</span>
                                                <span className="text-[10px] text-green-600 dark:text-green-300 block font-medium">Matched</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 text-center">
                                                <span className="text-lg font-bold text-red-700 dark:text-red-400">{discrepancies.length}</span>
                                                <span className="text-[10px] text-red-600 dark:text-red-300 block font-medium">Discrepancies</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-800 text-center">
                                                <span className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{acceptedCount}</span>
                                                <span className="text-[10px] text-indigo-600 dark:text-indigo-300 block font-medium">Accepted</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-800 text-center">
                                                <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                                                    {discrepancies.length > 0 ? Math.round(discrepancies.reduce((sum, d) => sum + (d.confidence || 90), 0) / discrepancies.length) : 0}%
                                                </span>
                                                <span className="text-[10px] text-blue-600 dark:text-blue-300 block font-medium">Avg Confidence</span>
                                            </div>
                                        </div>

                                        {/* Discrepancy Cards */}
                                        <div className="space-y-3 max-h-[380px] overflow-y-auto scrollbar-minimal pr-1">
                                            {discrepancies.map((disc, i) => {
                                                const fixed = discrepancyFixes[i];
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`p-4 rounded-xl border-2 transition-all ${
                                                            fixed === 'accept'
                                                                ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-500/5'
                                                                : fixed === 'reject'
                                                                    ? 'border-border bg-muted/30'
                                                                    : severityColor(disc.severity)
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                {fixed === 'accept'
                                                                    ? <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400" />
                                                                    : fixed === 'reject'
                                                                        ? <XCircleIcon className="w-5 h-5 text-muted-foreground" />
                                                                        : statusIcon(disc.status)
                                                                }
                                                                <span className="text-sm font-bold text-foreground">{disc.field}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {severityBadge(disc.severity)}
                                                                {disc.confidence && (
                                                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400">
                                                                        {disc.confidence}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Values comparison */}
                                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                                            <div className="p-2.5 rounded-lg bg-card border border-border">
                                                                <span className="text-[9px] font-semibold text-muted-foreground uppercase block mb-1">Purchase Order</span>
                                                                <span className={`text-sm font-medium ${fixed === 'accept' ? 'text-foreground' : 'text-foreground'}`}>
                                                                    {disc.poValue}
                                                                </span>
                                                            </div>
                                                            <div className="p-2.5 rounded-lg bg-card border border-border">
                                                                <span className="text-[9px] font-semibold text-muted-foreground uppercase block mb-1">Acknowledgment</span>
                                                                <span className={`text-sm font-medium ${fixed === 'accept' ? 'text-green-600 dark:text-green-400 font-bold' : disc.status === 'mismatch' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                                    {disc.ackValue}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* AI Suggestion */}
                                                        {disc.autoFixSuggestion && (
                                                            <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 mb-3 flex items-start gap-2">
                                                                <SparklesIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
                                                                <span className="text-[11px] text-indigo-700 dark:text-indigo-300">{disc.autoFixSuggestion}</span>
                                                            </div>
                                                        )}

                                                        {/* Action buttons */}
                                                        {fixed === undefined && (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => setDiscrepancyFixes(prev => ({ ...prev, [i]: 'accept' }))}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors"
                                                                >
                                                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                                                    Accept ACK Value
                                                                </button>
                                                                <button
                                                                    onClick={() => setDiscrepancyFixes(prev => ({ ...prev, [i]: 'reject' }))}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                                                                >
                                                                    Keep PO Value
                                                                </button>
                                                            </div>
                                                        )}
                                                        {fixed !== undefined && (
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[11px] font-semibold ${fixed === 'accept' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                                                    {fixed === 'accept' ? 'ACK value accepted' : 'PO value kept'}
                                                                </span>
                                                                <button
                                                                    onClick={() => setDiscrepancyFixes(prev => {
                                                                        const next = { ...prev };
                                                                        delete next[i];
                                                                        return next;
                                                                    })}
                                                                    className="text-[10px] text-muted-foreground hover:text-foreground underline transition-colors"
                                                                >
                                                                    Undo
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => setStep('confirm')}
                                            disabled={!allDecided}
                                            className={`w-full mt-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                                allDecided
                                                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                                            }`}
                                        >
                                            Confirm Reconciliation
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* ──── Step 4: Confirmation ──── */}
                                {step === 'confirm' && (
                                    <div className="p-6 sm:p-8 text-center">
                                        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>

                                        {/* Success icon */}
                                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                            <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                                        </div>

                                        <h3 className="text-xl font-brand font-bold text-foreground mb-1">Reconciliation Complete</h3>
                                        <p className="text-sm text-muted-foreground mb-6">
                                            {selectedPair?.poId} and {selectedPair?.id} have been successfully reconciled
                                        </p>

                                        {/* Summary Card */}
                                        <div className="bg-card border border-border rounded-xl p-5 mb-5 text-left max-w-md mx-auto">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <DocumentTextIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold text-foreground">{selectedPair?.poId}</span>
                                                    <span className="text-muted-foreground">↔</span>
                                                    <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-500" />
                                                    <span className="text-sm font-bold text-green-600 dark:text-green-400">{selectedPair?.id}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-[12px]">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Customer</span>
                                                    <span className="font-semibold text-foreground">{selectedPair?.customer}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Vendor</span>
                                                    <span className="font-semibold text-foreground">{selectedPair?.vendor}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Project</span>
                                                    <span className="font-semibold text-foreground">{selectedPair?.project}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">PO Amount</span>
                                                    <span className="font-semibold text-foreground">{selectedPair?.poAmount}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">ACK Amount</span>
                                                    <span className="font-semibold text-foreground">{selectedPair?.ackAmount}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Status</span>
                                                    <span className="font-semibold text-green-600 dark:text-green-400">Reconciled</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Reconciled On</span>
                                                    <span className="font-semibold text-foreground">Mar 17, 2026</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Summary */}
                                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 mb-6 flex items-start gap-3 text-left max-w-md mx-auto">
                                            <SparklesIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
                                            <span className="text-[11px] text-indigo-700 dark:text-indigo-300">
                                                {isCleanPair
                                                    ? `All ${matchedCount} fields validated — PO and ACK fully aligned. No discrepancies detected. Status updated in eManage ecosystem.`
                                                    : `${discrepancies.length} discrepancies resolved. ${acceptedCount} ACK values accepted, ${discrepancies.length - acceptedCount} PO values kept. Changes synced to eManage and vendor portal.`
                                                }
                                            </span>
                                        </div>

                                        <button
                                            onClick={handleComplete}
                                            className="w-full max-w-md py-3 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
                                        >
                                            Done
                                        </button>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
