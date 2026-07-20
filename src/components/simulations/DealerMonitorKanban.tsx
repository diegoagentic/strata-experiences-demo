import {
    Settings,
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Sparkles,
    Zap,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    Bot,
    BrainCircuit,
    FileText,
    Cpu,
    LayoutGrid,
    List as ListIcon,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircleIcon, ArrowPathIcon, ArrowRightIcon, ExclamationTriangleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useDemo } from '../../context/DemoContext';
import { useDemoProfile } from '../../context/useDemoProfile';
import { CONTINUA_STEP_TIMING } from '../../config/profiles/continua-demo';
import { useTheme } from 'strata-design-system';
import { AIAgentAvatar } from './DemoAvatars';
import ThreeWayMatchView, { type MatchLine } from '../widgets/ThreeWayMatchView';

// ─── Continua Step 2.3: Price Verification Engine Constants ─────────────────
const PRICE_VERIFY_AGENTS = [
    { name: 'PriceListScanner', detail: 'Scanning 200+ manufacturer price lists (Q1 updates)...' },
    { name: 'CostBasisChecker', detail: 'Detecting 14 items with outdated cost basis...' },
    { name: 'ConsignmentReviewer', detail: '3 HM consignment items — 90-day review approaching...' },
    { name: 'MarginCalculator', detail: 'Recalculating margins — avg 34%, flagging 6 below 25%...' },
    { name: 'ReportSender', detail: 'Generating price update report for expert review...' },
]
const PRICE_DISCREPANCIES = [
    { item: 'Aeron Chair (Graphite)', manufacturer: 'MillerKnoll', oldCost: 895, newCost: 945, change: '+5.6%', margin: '28.1%', flag: false },
    { item: 'DIRTT Wall Panel 8×10', manufacturer: 'DIRTT', oldCost: 1200, newCost: 1280, change: '+6.7%', margin: '22.4%', flag: true },
    { item: 'Standing Desk Frame', manufacturer: 'Steelcase', oldCost: 425, newCost: 445, change: '+4.7%', margin: '31.2%', flag: false },
    { item: 'Task Light LED Pro', manufacturer: 'Humanscale', oldCost: 185, newCost: 198, change: '+7.0%', margin: '19.8%', flag: true },
    { item: 'Monitor Arm Dual', manufacturer: 'Ergotron', oldCost: 142, newCost: 149, change: '+4.9%', margin: '24.3%', flag: true },
    { item: 'Conference Table Base', manufacturer: 'Knoll', oldCost: 680, newCost: 715, change: '+5.1%', margin: '26.7%', flag: false },
]
const CONSIGNMENT_ALERTS = [
    { item: 'Aeron Chair (Mineral)', manufacturer: 'MillerKnoll', daysLeft: 12, qty: 8, value: '$7,160' },
    { item: 'Embody Chair (Black)', manufacturer: 'MillerKnoll', daysLeft: 18, qty: 3, value: '$4,785' },
    { item: 'Cosm Chair (Glacier)', manufacturer: 'MillerKnoll', daysLeft: 25, qty: 4, value: '$5,180' },
]
type PricePhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results'

// ─── Continua Step 4.3: Financial Reconciliation Constants ──────────────────
const RECON_AGENTS = [
    { name: 'ReconciliationEngine', detail: 'Matching 47 POs → 42 invoices → 38 payments...' },
    { name: 'PaymentTracker', detail: 'Identifying 4 invoices pending >30 days...' },
    { name: 'AgingCategorizer', detail: 'Categorizing aging: 2 ACK, 1 partial delivery, 1 client...' },
    { name: 'MarginAnalyzer', detail: 'Margin analysis: 33.2% realized vs 34% quoted...' },
    { name: 'ReportGenerator', detail: 'Generating aging report with recommended actions...' },
]
const AGING_INVOICES = [
    { id: 'INV-3042', vendor: 'MillerKnoll', amount: '$42,500', days: 45, reason: 'ACK resolution — Knoll pricing dispute', action: 'Escalate to vendor' },
    { id: 'INV-3056', vendor: 'Steelcase', amount: '$18,200', days: 38, reason: 'ACK resolution — qty mismatch on task chairs', action: 'Request revised ACK' },
    { id: 'INV-3061', vendor: 'DIRTT', amount: '$28,400', days: 33, reason: 'Partial delivery — wall panels pending', action: 'Hold until complete' },
    { id: 'INV-3068', vendor: 'UAL Corp (Client)', amount: '$156,000', days: 31, reason: 'Client approval needed — change order pending', action: 'Follow up with PM' },
]
type ReconPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results'

// Mini preview config for each lupa step — matches DemoProcessPanel titles/content
const STEP_CARD_PREVIEW: Record<string, {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    detail: string;
    accentClass: string;
}> = {
    '1.2': {
        icon: <CheckCircle2 size={12} className="text-success dark:text-success" />,
        title: 'Extraction Complete',
        subtitle: '5 agents — 200 items extracted',
        detail: 'OCR + Parser processed 2 PDF attachments. 4 delivery zones mapped.',
        accentClass: 'border-emerald-500/20 bg-success/5',
    },
    '1.3': {
        icon: <BrainCircuit size={12} className="text-green-600 dark:text-green-400" />,
        title: 'Normalization Pipeline',
        subtitle: '4 agents — Parser + Normalizer',
        detail: 'Mapping 200 line items to catalog schema. Generating confidence scores.',
        accentClass: 'border-green-500/20 bg-green-500/5',
    },
    '1.4': {
        icon: <FileText size={12} className="text-amber-600 dark:text-amber-400" />,
        title: 'QuoteBuilder Agent',
        subtitle: '4 agents — Building quote draft',
        detail: 'Applying pricing rules and discounts. Multi-zone freight routing required.',
        accentClass: 'border-amber-500/20 bg-amber-500/5',
    },
    '2.2': {
        icon: <Cpu size={12} className="text-blue-600 dark:text-blue-400" />,
        title: 'ERP Normalization',
        subtitle: '8 agents — EDI/855 from eManage ONE',
        detail: 'Mapping raw EDI fields to standard schema. Linking PO ↔ Acknowledgement entities.',
        accentClass: 'border-blue-500/20 bg-blue-500/5',
    },
    '2.3': {
        icon: <Cpu size={12} className="text-red-600 dark:text-red-400" />,
        title: 'Delta Engine',
        subtitle: '8 agents — PO vs Acknowledgement comparison',
        detail: 'Line-by-line comparison in progress. Checking for substitutions and price deltas.',
        accentClass: 'border-red-500/20 bg-red-500/5',
    },
    '3.2': {
        icon: <Cpu size={12} className="text-blue-600 dark:text-blue-400" />,
        title: 'ERP Normalization',
        subtitle: '8 agents — EDI/855 from eManage ONE',
        detail: 'Mapping raw EDI fields to standard schema. Linking PO ↔ Acknowledgement entities.',
        accentClass: 'border-blue-500/20 bg-blue-500/5',
    },
    '3.3': {
        icon: <Cpu size={12} className="text-red-600 dark:text-red-400" />,
        title: 'Delta Engine',
        subtitle: '8 agents — PO vs Acknowledgement comparison',
        detail: 'Line-by-line comparison in progress. Checking for substitutions and price deltas.',
        accentClass: 'border-red-500/20 bg-red-500/5',
    },
};

// OPS profile card previews (overrides STEP_CARD_PREVIEW when isOps)
const OPS_STEP_CARD_PREVIEW: typeof STEP_CARD_PREVIEW = {
    '1.3': {
        icon: <Sparkles size={12} className="text-teal-600 dark:text-teal-400" />,
        title: 'Three-Way Match Engine',
        subtitle: '5 agents — PO · ACK · Invoice',
        detail: 'Verifying PO #ORD-2055 against ACK-2055 and delivery receipt DL-004.',
        accentClass: 'border-teal-500/20 bg-teal-500/5',
    },
    '2.2': {
        icon: <Cpu size={12} className="text-ai dark:text-purple-400" />,
        title: 'CO Delta Engine',
        subtitle: '4 agents — Change Order CO-007',
        detail: 'Recalculating impact on QB-4421 and QB-4424. Supplier verification in progress.',
        accentClass: 'border-purple-500/20 bg-ai/5',
    },
};

// OPS 3-Way Match line items for ThreeWayMatchView
const OPS_MATCH_LINES: MatchLine[] = [
    { lineItem: 'Task Chair ERG-5100', sku: 'ERG-5100', poValue: '200 units', ackValue: '200 units', invoiceValue: '200 units', status: 'match' },
    { lineItem: 'Installation Svc', sku: 'SVC-INST', poValue: '$1,200', ackValue: '$1,200', invoiceValue: '$1,200', status: 'match' },
    { lineItem: 'Project Management', sku: 'SVC-PM', poValue: '$955', ackValue: '$955', invoiceValue: '$955', status: 'match' },
    { lineItem: 'Extended Warranty', sku: 'SVC-EW', poValue: '$1,000', ackValue: '$1,000', invoiceValue: '$1,000', status: 'match' },
    { lineItem: 'Disposal Svc', sku: 'SVC-DISP', poValue: '$300', ackValue: '$300', invoiceValue: '$300', status: 'match' },
    { lineItem: 'Freight — Zone A/B', sku: 'FRT-001', poValue: '$45', ackValue: '$45', invoiceValue: '$58', status: 'partial', delta: '+$13' },
    { lineItem: 'White Glove Delivery', sku: 'SVC-WG', poValue: '—', ackValue: '—', invoiceValue: '$300', status: 'mismatch', delta: '+$300' },
];

const COLUMNS = [
    { id: 'awaiting', title: 'Awaiting Validation', count: 12 },
    { id: 'active', title: 'Active Processing', count: 5 },
    { id: 'completed', title: 'Recently Completed', count: 28 },
];

const CARDS = [
    { id: 1, title: 'Apex Furniture RFQ #1029', dealer: 'Apex Furniture', status: 'Requires Expert Review', column: 'awaiting', priority: 'high', aiInsight: 'Extracted 200 Task Chairs from attachments. Freight calculation for multiple delivery zones requires manual routing approval.' },
    { id: 2, title: 'Herman Miller Q1 Proj', dealer: 'HM Partners', status: 'Paused', column: 'active', priority: 'medium', aiInsight: 'Inventory check suggests substitution for SKU-X99 to avoid 2-week delay' },
    { id: 3, title: 'Retailer Group Sync', dealer: 'Multiple', status: 'Normal', column: 'awaiting', priority: 'low' },
    { id: 4, title: 'Workspace Group Reconcile', dealer: 'Workspace Group', status: 'Auto-Processing', column: 'active', priority: 'high', aiInsight: 'Agent #29 is resolving 14 duplicate line items' },
    { id: 5, title: 'PO #ORD-2055 vs Acknowledgement', dealer: 'Global Workspace', status: 'Delta Match Exception', column: 'awaiting', priority: 'critical', aiInsight: 'Delta Engine flagged 2 exceptions: Freight cost mismatch and Line 2 item substitution.' },
    { id: 6, title: 'Invoice #INV-9001', dealer: 'ModernOffice Inc.', status: 'Document Processing', column: 'active', priority: 'high', aiInsight: 'AI classified as INVOICE. Routed to 3-Way Match Engine for PO/Acknowledgement/Invoice reconciliation.' },
    { id: 7, title: 'Change Order CO-007', dealer: 'Apex Furniture', status: 'CO Delta Analysis', column: 'active', priority: 'critical', aiInsight: 'CO Delta Engine analyzing 22 ergonomic upgrade lines. Recalculating cost/sell impact on INV-2055 and QB-4421.' }
];

// Steps where each card gets a minimal "processing" indicator (detail is in DemoProcessPanel)
const CARD1_PANEL_STEPS = ['1.2', '1.3', '1.4'];
const CARD5_PANEL_STEPS = ['2.2', '2.3', '3.2', '3.3'];

// Shared-block preview · 5-stage column layout matching Expert Hub /
// Smart Comparator production kanbans (compact cards, more stages,
// no expanded AI Insight or bottom overlay so everything fits on one
// viewport). Cards are re-bucketed via CARD_PREVIEW_COLUMN below.
const COLUMNS_PREVIEW = [
    { id: 'intake',     title: 'Intake',              count: 4  },
    { id: 'extracting', title: 'Extracting',          count: 8  },
    { id: 'awaiting',   title: 'Awaiting Validation', count: 12 },
    { id: 'active',     title: 'Active Processing',   count: 5  },
    { id: 'completed',  title: 'Recently Completed',  count: 28 },
] as const;

// Map each canonical card to a preview stage so all 5 columns render
// meaningful content (mirrors the density of the prod kanbans).
const CARD_PREVIEW_COLUMN: Record<number, string> = {
    1: 'awaiting',    // Apex Furniture RFQ — needs human validation
    2: 'active',      // Herman Miller Q1 — auto-processing
    3: 'intake',      // Retailer Group Sync — just landed
    4: 'active',      // Workspace Group Reconcile — auto-processing
    5: 'extracting',  // Delta Match — AI parsing PO vs Ack
    6: 'intake',      // Invoice INV-9001 — just classified
    7: 'extracting',  // Change Order CO-007 — CO Delta engine
};

interface DealerMonitorKanbanProps {
    onNavigate?: (page: string) => void;
    /** When true (shared-block preview) unlocks all condition-gated rich
     *  panels + the bottom Three-Way Match overlay so the viewer sees the
     *  maximal production look without an active demo tour. */
    previewMode?: boolean;
}

export default function DealerMonitorKanban({ previewMode = false }: DealerMonitorKanbanProps = {}) {
    const { theme } = useTheme();
    const { currentStep, nextStep, isPaused } = useDemo();
    const { activeProfile } = useDemoProfile();
    const isOps = activeProfile.id === 'ops';
    const isContinua = activeProfile.id === 'continua';
    const stepId = currentStep?.id || '';

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

    // ─── Continua Step 2.3: Price Verification Engine ───────────────────────────
    const [pricePhase, setPricePhase] = useState<PricePhase>('idle');
    const pricePhaseRef = useRef(pricePhase);
    useEffect(() => { pricePhaseRef.current = pricePhase; }, [pricePhase]);
    const [priceAgents, setPriceAgents] = useState(PRICE_VERIFY_AGENTS.map(a => ({ ...a, visible: false, done: false })));
    const [priceProgress, setPriceProgress] = useState(0);

    // Continua 1.3: orchestration (uses timing profile '3.3')
    const tp33 = CONTINUA_STEP_TIMING['3.3'];
    useEffect(() => {
        if (!isContinua || stepId !== '1.3') { setPricePhase('idle'); return; }
        setPricePhase('idle');
        setPriceAgents(PRICE_VERIFY_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setPricePhase('notification')), tp33.notifDelay));
        timers.push(setTimeout(pauseAware(() => {
            if (pricePhaseRef.current === 'notification') setPricePhase('processing');
        }), tp33.notifDelay + tp33.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [isContinua, stepId]);

    // Continua 3.3: processing → breathing
    useEffect(() => {
        if (pricePhase !== 'processing') return;
        setPriceAgents(PRICE_VERIFY_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        setPriceProgress(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setPriceProgress(100), 50));
        PRICE_VERIFY_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setPriceAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * tp33.agentStagger));
            timers.push(setTimeout(pauseAware(() => setPriceAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * tp33.agentStagger + tp33.agentDone));
        });
        timers.push(setTimeout(pauseAware(() => setPricePhase('breathing')), PRICE_VERIFY_AGENTS.length * tp33.agentStagger + tp33.agentDone + 300));
        return () => timers.forEach(clearTimeout);
    }, [pricePhase]);

    // Continua 3.3: breathing → revealed
    useEffect(() => {
        if (pricePhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setPricePhase('revealed')), tp33.breathing);
        return () => clearTimeout(t);
    }, [pricePhase]);

    // Continua 3.3: revealed → results
    useEffect(() => {
        if (pricePhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setPricePhase('results')), 1500);
        return () => clearTimeout(t);
    }, [pricePhase]);

    // Continua 1.3: no auto-advance — waits for "Continue to Quote Draft" in DemoProcessPanel

    // ─── Continua Step 4.3: Financial Reconciliation ────────────────────────────
    const tp43 = CONTINUA_STEP_TIMING['4.3'];
    const [reconPhase, setReconPhase] = useState<ReconPhase>('idle');
    const reconPhaseRef = useRef(reconPhase);
    useEffect(() => { reconPhaseRef.current = reconPhase; }, [reconPhase]);
    const [reconAgents, setReconAgents] = useState(RECON_AGENTS.map(a => ({ ...a, visible: false, done: false })));
    const [reconProgress, setReconProgress] = useState(0);

    useEffect(() => {
        if (!isContinua || stepId !== '4.3') { setReconPhase('idle'); return; }
        setReconPhase('idle');
        setReconAgents(RECON_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setReconPhase('notification')), tp43.notifDelay));
        timers.push(setTimeout(pauseAware(() => { if (reconPhaseRef.current === 'notification') setReconPhase('processing'); }), tp43.notifDelay + tp43.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [isContinua, stepId]);

    useEffect(() => {
        if (reconPhase !== 'processing') return;
        setReconAgents(RECON_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        setReconProgress(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setReconProgress(100), 50));
        RECON_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setReconAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * tp43.agentStagger));
            timers.push(setTimeout(pauseAware(() => setReconAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * tp43.agentStagger + tp43.agentDone));
        });
        timers.push(setTimeout(pauseAware(() => setReconPhase('breathing')), RECON_AGENTS.length * tp43.agentStagger + tp43.agentDone + 300));
        return () => timers.forEach(clearTimeout);
    }, [reconPhase]);

    // Continua 4.3: breathing → revealed
    useEffect(() => {
        if (reconPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setReconPhase('revealed')), tp43.breathing);
        return () => clearTimeout(t);
    }, [reconPhase]);

    useEffect(() => {
        if (reconPhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setReconPhase('results')), 1500);
        return () => clearTimeout(t);
    }, [reconPhase]);

    // ─── Shared-block preview toolbar state ─────────────────────────────────
    const [previewViewMode, setPreviewViewMode] = useState<'kanban' | 'list'>('kanban');
    const [previewSearchQuery, setPreviewSearchQuery] = useState('');
    const [previewActiveStage, setPreviewActiveStage] = useState<string>('all');

    const displayCards = CARDS.filter(c => {
        if (previewMode) return true; // shared-block preview · show every card
        if (c.id === 5 && !['2.2', '2.3', '3.2', '3.3'].includes(currentStep.id) && !(isOps && currentStep.id === '1.3')) return false;
        if (c.id === 6 && !(isOps && currentStep.id === '1.3')) return false;
        if (c.id === 7 && !(isOps && currentStep.id === '2.2')) return false;
        return true;
    });

    return (
        <div className="bg-gray-50 dark:bg-zinc-950 text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
            <main className="p-6 space-y-6 flex flex-col">
                {/* Summary Bar — hidden for demo build */}
                {false && (
                <div className="bg-zinc-900 backdrop-blur-md rounded-2xl p-4 border border-zinc-800 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-8 overflow-x-auto w-full scrollbar-hide px-2 scroll-smooth">
                        {[
                            { icon: <Clock size={18} />, value: '12', label: 'Awaiting Review', color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
                            { icon: <Bot size={18} />, value: '4', label: 'Active Agents', color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10' },
                            { icon: <CheckCircle2 size={18} />, value: '28', label: 'Completed Today', color: 'text-green-600 dark:text-green-400 bg-green-500/10' },
                            { icon: <Zap size={18} />, value: '$892K', label: 'Queue Value', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' },
                        ].map((kpi, i) => (
                            <div key={i} className="flex items-center gap-3 min-w-fit">
                                <div className={`flex items-center justify-center w-9 h-9 rounded-full ${kpi.color}`}>
                                    {kpi.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-semibold text-zinc-100 leading-none">{kpi.value}</span>
                                    <span className="text-[10px] text-muted-foreground mt-1 font-medium">{kpi.label}</span>
                                </div>
                                {i < 3 && <div className="h-8 w-px bg-zinc-800 ml-4 hidden xl:block opacity-50" />}
                            </div>
                        ))}
                    </div>
                    <div className="w-px h-12 bg-zinc-800 hidden xl:block mx-2" />
                    {/* Quick Actions */}
                    <div className="flex items-center gap-1 min-w-max pl-4 border-l border-zinc-800 xl:border-none xl:pl-0">
                        <button className="p-2 rounded-lg hover:bg-zinc-800 text-muted-foreground hover:text-zinc-200 transition-colors" title="Filter">
                            <Filter size={18} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-zinc-800 text-muted-foreground hover:text-zinc-200 transition-colors" title="Search">
                            <Search size={18} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-zinc-800 text-muted-foreground hover:text-zinc-200 transition-colors" title="Settings">
                            <Settings size={18} />
                        </button>
                        <div className="w-px h-8 bg-zinc-800 mx-1" />
                        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-sm">
                            <Plus size={14} />
                            New Batch
                        </button>
                    </div>
                </div>
                )}

                {/* Preview toolbar · filter tabs + search + view toggle. Matches
                    the Smart Comparator prod chrome (all counts · stage tabs · search
                    · avatar chips · list/grid toggle). Only renders in shared-block
                    preview so the demo tour stays unchanged. */}
                {previewMode && (
                    <PreviewToolbar
                        stages={COLUMNS_PREVIEW}
                        activeStage={previewActiveStage}
                        onStageChange={setPreviewActiveStage}
                        searchQuery={previewSearchQuery}
                        onSearchChange={setPreviewSearchQuery}
                        viewMode={previewViewMode}
                        onViewModeChange={setPreviewViewMode}
                        totalCount={displayCards.length}
                    />
                )}

                {/* Content · list mode replaces the kanban grid entirely in preview */}
                {previewMode && previewViewMode === 'list' ? (
                    <PreviewListView
                        cards={filterPreviewCards(displayCards, previewSearchQuery, previewActiveStage)}
                        stages={COLUMNS_PREVIEW}
                    />
                ) : (
                /* Kanban Grid · 5 columns in shared-block preview (matches prod
                    Expert Hub / Smart Comparator density), 3 in demo tour. */
                <div className={previewMode
                    ? "flex-1 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 overflow-hidden"
                    : "flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 overflow-hidden"
                }>
                    {(previewMode ? COLUMNS_PREVIEW : COLUMNS).map(column => (
                        <div key={column.id} className="flex flex-col gap-4 overflow-hidden">
                            <div className="flex items-center justify-between mb-1 px-2">
                                <h4 className="font-medium text-foreground flex items-center gap-2">
                                    {column.title}
                                    <span className="bg-gray-200 dark:bg-zinc-800 text-muted-foreground text-xs px-2 py-0.5 rounded-full">{column.count}</span>
                                </h4>
                                <MoreHorizontal size={16} className="text-muted-foreground dark:text-muted-foreground cursor-pointer hover:text-muted-foreground dark:hover:text-zinc-300 transition-colors" />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-micro bg-gray-100/50 dark:bg-zinc-800/50 rounded-2xl p-3 border border-gray-200/50 dark:border-zinc-800/50">
                                {(previewMode
                                    ? filterPreviewCards(displayCards, previewSearchQuery, previewActiveStage)
                                    : displayCards
                                ).filter(card => {
                                    // In preview, re-bucket cards into the 5-stage layout so
                                    // every column gets meaningful content (matches prod density).
                                    const targetCol = previewMode ? (CARD_PREVIEW_COLUMN[card.id] ?? card.column) : card.column;
                                    return targetCol === column.id;
                                }).map(card => {
                                    // Determine data-demo-target for spotlight (tour only ·
                                    // never in preview so cards stay compact).
                                    const demoTarget = previewMode ? undefined :
                                        card.id === 1 && CARD1_PANEL_STEPS.includes(currentStep.id) ? 'kanban-ai-extraction' :
                                        card.id === 5 && (CARD5_PANEL_STEPS.includes(currentStep.id) || (isOps && currentStep.id === '1.3')) ? 'kanban-ack-normalize' :
                                        card.id === 6 && isOps && currentStep.id === '1.3' ? 'three-way-match-engine' :
                                        card.id === 7 && isOps && currentStep.id === '2.2' ? 'co-delta-analysis' :
                                        undefined;

                                    // Panels never expand in preview · they'd blow up the height
                                    // and Diego wants compact prod-style cards.
                                    const hasPanel = !previewMode && Boolean(
                                        (card.id === 1 && CARD1_PANEL_STEPS.includes(currentStep.id)) ||
                                        (card.id === 5 && (CARD5_PANEL_STEPS.includes(currentStep.id) || (isOps && currentStep.id === '1.3'))) ||
                                        (card.id === 6 && isOps && currentStep.id === '1.3') ||
                                        (card.id === 7 && isOps && currentStep.id === '2.2')
                                    );

                                    return (
                                        <div
                                            key={card.id}
                                            data-demo-target={demoTarget}
                                            className={`bg-card border ${previewMode ? 'p-3' : 'p-4'} rounded-2xl transition-all cursor-pointer group shadow-sm ${hasPanel ? 'ring-2 ring-indigo-500/50 border-indigo-500/30 shadow-lg shadow-indigo-500/10 scale-[1.02]' : `border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 ${card.priority === 'critical' ? 'ring-1 ring-red-500/20' : ''}`}`}
                                        >
                                            <div className={`flex flex-col ${previewMode ? 'gap-2' : 'gap-3'}`}>
                                                <div className="flex items-start justify-between">
                                                    <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full ring-1 ring-inset ${card.priority === 'critical' ? 'bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/30' :
                                                        card.priority === 'high' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/30' :
                                                            'bg-gray-200 dark:bg-zinc-700 text-muted-foreground ring-gray-300 dark:ring-zinc-600'
                                                        }`}>
                                                        {card.priority}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={12} className="text-muted-foreground" />
                                                        <span className="text-[10px] text-muted-foreground font-medium">4h ago</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-semibold text-foreground group-hover:text-muted-foreground dark:group-hover:text-zinc-200 transition-colors">{card.title}</h4>
                                                    <p className="text-xs text-muted-foreground font-medium">{card.dealer}</p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex -space-x-2">
                                                        {[1, 2].map(i => (
                                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-800 bg-gray-300 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-medium text-muted-foreground dark:text-zinc-300">
                                                                {i === 1 ? 'AI' : 'JD'}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex-1" />
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                                        <CheckCircle2 size={12} className="text-green-600 dark:text-green-400" />
                                                        <span>4 items ready</span>
                                                    </div>
                                                </div>

                                                {/* Step-specific preview (matches lupa content) during panel steps */}
                                                {hasPanel && (isOps ? OPS_STEP_CARD_PREVIEW : STEP_CARD_PREVIEW)[currentStep.id] && (() => {
                                                    const preview = (isOps ? OPS_STEP_CARD_PREVIEW : STEP_CARD_PREVIEW)[currentStep.id];
                                                    return (
                                                        <div className={`mt-2 pt-3 border-t border-gray-200/50 dark:border-zinc-700/50 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                                                            <div className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border ${preview.accentClass}`}>
                                                                {preview.icon}
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">{preview.title}</span>
                                                                    <span className="text-[10px] text-muted-foreground font-medium">{preview.subtitle}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-[10px] leading-relaxed text-muted-foreground px-1">
                                                                {preview.detail}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-[10px] text-indigo-600/70 dark:text-indigo-300/70 font-medium py-0.5 px-1">
                                                                <Bot size={10} className="animate-pulse" />
                                                                <span>Agent processing...</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* AI Takeoff Summary — only on step 1.2 for card 1 */}
                                                {card.id === 1 && currentStep.id === '1.2' && (
                                                    <div className="mt-2 pt-3 border-t border-purple-300/30 dark:border-purple-500/20 space-y-2.5 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-300">
                                                        <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-purple-400/20 bg-ai/5">
                                                            <Sparkles size={12} className="text-ai dark:text-purple-400" />
                                                            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 leading-tight">AI Takeoff Summary</span>
                                                        </div>

                                                        <div className="px-2 space-y-2">
                                                            <p className="text-[10px] font-medium text-muted-foreground">
                                                                Floor plan analyzed: <span className="text-purple-700 dark:text-purple-400 font-semibold">4 floors, 125 workstations</span>
                                                            </p>

                                                            {/* Zone breakdown */}
                                                            <div className="grid grid-cols-4 gap-1">
                                                                {[
                                                                    { zone: 'A', count: 32 },
                                                                    { zone: 'B', count: 31 },
                                                                    { zone: 'C', count: 31 },
                                                                    { zone: 'D', count: 31 },
                                                                ].map(z => (
                                                                    <div key={z.zone} className="text-center py-1 rounded bg-purple-100/60 dark:bg-purple-900/20 border border-purple-200/40 dark:border-purple-700/30">
                                                                        <p className="text-[9px] font-semibold text-purple-700 dark:text-purple-400">Zone {z.zone}</p>
                                                                        <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">{z.count}</p>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Product grouping */}
                                                            <div className="flex flex-wrap gap-1">
                                                                {[
                                                                    { label: 'Task Chairs', qty: 125 },
                                                                    { label: 'Monitor Arms', qty: 125 },
                                                                    { label: 'Storage', qty: 50 },
                                                                    { label: 'Lounge', qty: 25 },
                                                                ].map(p => (
                                                                    <span key={p.label} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                                                                        {p.qty} {p.label}
                                                                    </span>
                                                                ))}
                                                            </div>

                                                            {/* Structural validation */}
                                                            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200/50 dark:border-emerald-700/30">
                                                                <CheckCircle2 size={10} className="text-success shrink-0" />
                                                                <p className="text-[9px] text-emerald-700 dark:text-success font-medium leading-snug">
                                                                    Cross-referenced against building specs: all items within structural limits
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* AI Insight — normal cards only · skipped in preview to keep cards compact */}
                                                {!previewMode && !hasPanel && card.aiInsight && (
                                                    <div className="mt-2 pt-3 border-t border-gray-200/50 dark:border-zinc-700/50 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                                            <Sparkles size={12} />
                                                            <span className="text-[10px] font-medium uppercase tracking-wider">AI Insight</span>
                                                        </div>
                                                        <p className="text-[11px] leading-relaxed text-muted-foreground italic bg-gray-50 dark:bg-zinc-800 p-3 rounded-xl border border-gray-200/50 dark:border-zinc-700/50">
                                                            "{card.aiInsight}"
                                                        </p>
                                                        <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline group/btn">
                                                            {card.id === 1 ? 'Route to Expert Hub' : 'Apply Recommendation'}
                                                            <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                <button className="w-full py-3 border border-dashed border-gray-300 dark:border-zinc-700 rounded-2xl text-muted-foreground dark:text-muted-foreground hover:border-gray-400 dark:hover:border-zinc-600 hover:text-muted-foreground dark:hover:text-muted-foreground transition-all text-xs font-medium">
                                    + Add Item
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                )}

                {/* ═══ Continua Step 2.3 — Price Verification Engine (auto 10s) ═══ */}
                {isContinua && stepId === '1.3' && pricePhase !== 'idle' && (
                    <div data-demo-target="price-verification-engine" className="space-y-4">
                        {/* Notification */}
                        {pricePhase === 'notification' && (
                            <button onClick={() => setPricePhase('processing')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-indigo-600 text-white"><CurrencyDollarIcon className="h-4 w-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-foreground">Price Verification Scan</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold">200+ lists</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1">PriceVerificationAgent: Scanning <span className="font-semibold text-foreground">200+ manufacturer price lists</span> for Q1 updates — detecting cost changes, recalculating margins, flagging items below threshold.</p>
                                            <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to start scan <ArrowRightIcon className="h-3 w-3" /></p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Processing */}
                        {pricePhase === 'processing' && (
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <AIAgentAvatar size="sm" />
                                    <span className="text-xs font-bold text-foreground">PriceVerificationAgent Scanning Price Lists...</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                    <div className="h-full rounded-full bg-indigo-500 transition-all duration-[3500ms] ease-linear" style={{ width: `${priceProgress}%` }} />
                                </div>
                                <div className="space-y-1.5">
                                    {priceAgents.map(agent => (
                                        <div key={agent.name} className={`flex items-center gap-2 text-[10px] transition-all duration-300 ${agent.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
                                            {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-indigo-500 animate-spin shrink-0" />}
                                            <span className={`font-medium ${agent.done ? "text-foreground" : "text-indigo-600 dark:text-indigo-400"}`}>{agent.name}</span>
                                            <span className="text-muted-foreground">{agent.detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Breathing */}
                        {pricePhase === 'breathing' && (
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-semibold text-muted-foreground">Processing complete — syncing external systems...</span>
                            </div>
                        )}

                        {/* Confirmed */}
                        {(pricePhase === 'revealed' || pricePhase === 'results') && (
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30 animate-in fade-in duration-300">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-green-800 dark:text-green-200"><span className="font-bold">PriceVerificationAgent:</span> Scan complete — <span className="font-semibold">14 items with outdated cost basis</span>. 6 flagged below 25% margin. 3 consignment items approaching 90-day review.</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">External Systems · Synced</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                            {['Price List API', 'Cost Engine', 'Margin Calculator', 'Consignment DB', 'Report Service'].map(sys => (
                                                <span key={sys} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-300 text-[10px] font-medium border border-green-200/50 dark:border-green-500/20">
                                                    <CheckCircleIcon className="h-3 w-3" />{sys}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Results */}
                        {pricePhase === 'results' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                    {/* Header */}
                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Price Verification Report — Q1 2026</h3>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">200+ price lists scanned · 14 discrepancies · Avg margin 34%</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">6 Below 25%</span>
                                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold">Avg 34%</span>
                                        </div>
                                    </div>

                                    {/* Discrepancy Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/50">
                                                    <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Item</th>
                                                    <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Manufacturer</th>
                                                    <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Old Cost</th>
                                                    <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">New Cost</th>
                                                    <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Change</th>
                                                    <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Margin</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {PRICE_DISCREPANCIES.map((row, i) => (
                                                    <tr key={i} className={`border-b border-border/50 ${row.flag ? "bg-red-50/50 dark:bg-red-500/5" : "hover:bg-muted/30"}`}>
                                                        <td className="px-4 py-2.5 text-[11px] font-medium text-foreground">{row.item}</td>
                                                        <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{row.manufacturer}</td>
                                                        <td className="px-4 py-2.5 text-[11px] text-right text-muted-foreground">${row.oldCost}</td>
                                                        <td className="px-4 py-2.5 text-[11px] text-right font-bold text-foreground">${row.newCost}</td>
                                                        <td className="px-4 py-2.5 text-[11px] text-right text-red-600 dark:text-red-400 font-medium">{row.change}</td>
                                                        <td className="px-4 py-2.5 text-right">
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${row.flag ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400" : "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400"}`}>{row.margin}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Consignment Alerts */}
                                    <div className="mx-4 my-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                                        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5"><ExclamationTriangleIcon className="h-4 w-4" />Consignment Review — 90-Day Window</h4>
                                        <div className="space-y-2">
                                            {CONSIGNMENT_ALERTS.map((ca, i) => (
                                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/60 dark:bg-zinc-900/40 border border-amber-100 dark:border-amber-500/10">
                                                    <div>
                                                        <p className="text-[11px] font-medium text-foreground">{ca.item}</p>
                                                        <p className="text-[10px] text-muted-foreground">{ca.manufacturer} · Qty: {ca.qty}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ca.daysLeft <= 14 ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400" : "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>{ca.daysLeft}d left</span>
                                                        <span className="text-[10px] font-bold text-foreground">{ca.value}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Summary Footer */}
                                    <div className="px-4 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between">
                                        <p className="text-[10px] text-muted-foreground">Report auto-sent to expert · 6 items need price adjustment · 3 consignment decisions pending</p>
                                        <span className="text-[10px] px-3 py-1.5 rounded-lg bg-muted text-muted-foreground font-medium">Auto-advancing...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ Continua Step 4.3 — Financial Reconciliation (Expert interactive) ═══ */}
                {isContinua && stepId === '4.3' && reconPhase !== 'idle' && (
                    <div data-demo-target="financial-reconciliation" className="space-y-4">
                        {/* Notification */}
                        {reconPhase === 'notification' && (
                            <button onClick={() => setReconPhase('processing')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-amber-600 text-white"><CurrencyDollarIcon className="h-4 w-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-foreground">Financial Reconciliation — UAL Project</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-600 text-white font-bold">4 aging</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1">FinancialAgent: Reconciling <span className="font-semibold text-foreground">47 POs → 42 invoices → 38 payments</span>. 4 invoices aging &gt;30 days — AI-categorized with actions.</p>
                                            <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to review reconciliation <ArrowRightIcon className="h-3 w-3" /></p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Processing */}
                        {reconPhase === 'processing' && (
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <AIAgentAvatar size="sm" />
                                    <span className="text-xs font-bold text-foreground">FinancialAgent Reconciling...</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                    <div className="h-full rounded-full bg-amber-500 transition-all duration-[3500ms] ease-linear" style={{ width: `${reconProgress}%` }} />
                                </div>
                                <div className="space-y-1.5">
                                    {reconAgents.map(agent => (
                                        <div key={agent.name} className={`flex items-center gap-2 text-[10px] transition-all duration-300 ${agent.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
                                            {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-amber-500 animate-spin shrink-0" />}
                                            <span className={`font-medium ${agent.done ? "text-foreground" : "text-amber-600 dark:text-amber-400"}`}>{agent.name}</span>
                                            <span className="text-muted-foreground">{agent.detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Breathing */}
                        {reconPhase === 'breathing' && (
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-semibold text-muted-foreground">Processing complete — syncing external systems...</span>
                            </div>
                        )}

                        {/* Confirmed */}
                        {(reconPhase === 'revealed' || reconPhase === 'results') && (
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30 animate-in fade-in duration-300">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-green-800 dark:text-green-200"><span className="font-bold">FinancialAgent:</span> Reconciliation complete — <span className="font-semibold">47 POs, 42 invoices, 38 payments</span>. 4 aging invoices categorized. Margin: 33.2% vs 34% quoted.</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">External Systems · Synced</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                            {['ERP System', 'Payment Gateway', 'Aging Engine', 'Margin Calculator', 'Report Service'].map(sys => (
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
                        {reconPhase === 'results' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                    {/* Header */}
                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Financial Reconciliation — UAL HQ</h3>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">47 POs · 42 invoices · 38 payments received</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">4 Aging</span>
                                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold">33.2% Margin</span>
                                        </div>
                                    </div>

                                    {/* Reconciliation Summary */}
                                    <div className="p-4 grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'Purchase Orders', value: '47', sub: 'All tracked', color: 'text-blue-600 dark:text-blue-400' },
                                            { label: 'Invoices', value: '42', sub: '5 pending', color: 'text-indigo-600 dark:text-indigo-400' },
                                            { label: 'Payments', value: '38', sub: '$2.45M received', color: 'text-green-600 dark:text-green-400' },
                                        ].map(m => (
                                            <div key={m.label} className="text-center p-3 rounded-xl bg-muted/30 border border-border">
                                                <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                                                <p className="text-[11px] font-medium text-foreground">{m.label}</p>
                                                <p className="text-[10px] text-muted-foreground">{m.sub}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Aging Invoices */}
                                    <div className="mx-4 mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                                        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-1.5"><ExclamationTriangleIcon className="h-4 w-4" />Aging Invoices — &gt;30 Days</h4>
                                        <div className="space-y-2">
                                            {AGING_INVOICES.map(inv => (
                                                <div key={inv.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/60 dark:bg-zinc-900/40 border border-amber-100 dark:border-amber-500/10">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-mono font-bold text-foreground">{inv.id}</span>
                                                            <span className="text-[10px] text-muted-foreground">{inv.vendor}</span>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground mt-0.5">{inv.reason}</p>
                                                        <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">Action: {inv.action}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-bold">{inv.days}d</span>
                                                        <span className="text-[11px] font-bold text-foreground">{inv.amount}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Margin Analysis */}
                                    <div className="mx-4 mb-4 p-3 rounded-xl bg-muted/30 border border-border">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-foreground">Margin Analysis</p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">Realized 33.2% vs quoted 34% — variance from Q1 price increases on 6 items</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">33.2%</p>
                                                <p className="text-[9px] text-muted-foreground">quoted 34%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <div className="px-4 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between">
                                        <p className="text-[10px] text-muted-foreground">Aging report ready with AI-recommended actions for each invoice</p>
                                        <button onClick={nextStep} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-300 hover:bg-brand-400 dark:bg-brand-400 dark:hover:bg-brand-300 text-zinc-900 text-[11px] font-bold shadow-sm transition-all hover:scale-[1.02]">
                                            <CheckCircleIcon className="h-3.5 w-3.5" />Export Aging Report<ArrowRightIcon className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* OPS: Three-Way Match View — shows during OPS step 1.3 only.
                    Intentionally NOT shown in shared-block preview · Diego wants
                    everything to fit in one viewport, and this bottom overlay
                    pushes the kanban above the fold. */}
                {isOps && currentStep.id === '1.3' && (
                    <div
                        data-demo-target="three-way-match-engine"
                        className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                    >
                        <ThreeWayMatchView
                            orderId="ORD-2055"
                            lines={OPS_MATCH_LINES}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}

// ─── Shared-block preview · toolbar + filters + list view ────────────────────
// Match the Smart Comparator / Expert Hub prod chrome: filter tabs across the
// top with counts + search input + avatar chips + kanban/list view toggle.
// Only rendered when previewMode=true so demo tour behavior is unchanged.

type StageDef = { id: string; title: string; count: number };
type CardDef = typeof CARDS[number];

function filterPreviewCards(cards: CardDef[], query: string, activeStage: string): CardDef[] {
    const q = query.trim().toLowerCase();
    return cards.filter(c => {
        if (activeStage !== 'all') {
            const bucket = CARD_PREVIEW_COLUMN[c.id] ?? c.column;
            if (bucket !== activeStage) return false;
        }
        if (!q) return true;
        return (
            c.title.toLowerCase().includes(q) ||
            c.dealer.toLowerCase().includes(q) ||
            (c.aiInsight?.toLowerCase().includes(q) ?? false)
        );
    });
}

interface PreviewToolbarProps {
    stages: readonly StageDef[];
    activeStage: string;
    onStageChange: (id: string) => void;
    searchQuery: string;
    onSearchChange: (q: string) => void;
    viewMode: 'kanban' | 'list';
    onViewModeChange: (m: 'kanban' | 'list') => void;
    totalCount: number;
}

function PreviewToolbar({
    stages, activeStage, onStageChange,
    searchQuery, onSearchChange,
    viewMode, onViewModeChange,
    totalCount,
}: PreviewToolbarProps) {
    // Mock avatar pool · decorative only, matches the "+2" chip pattern from prod.
    const avatars = [
        { initials: 'DU', bg: 'bg-blue-500' },
        { initials: 'SJ', bg: 'bg-amber-500' },
        { initials: 'MW', bg: 'bg-teal-500' },
        { initials: 'PS', bg: 'bg-indigo-500' },
        { initials: 'DO', bg: 'bg-red-500' },
        { initials: 'EM', bg: 'bg-emerald-500' },
    ];
    const tabs: Array<{ id: string; title: string; count: number }> = [
        { id: 'all', title: 'All', count: totalCount },
        ...stages.map(s => ({ id: s.id, title: s.title, count: s.count })),
    ];
    return (
        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm">
            {/* Row 1 · section label + filter tabs · matches Smart Comparator prod */}
            <div className="flex items-center gap-4 px-4 py-3 border-b border-border overflow-x-auto scrollbar-hide">
                <h2 className="shrink-0 text-sm font-bold text-foreground">Documents</h2>
                <div className="flex items-center gap-1">
                    {tabs.map(tab => {
                        const active = tab.id === activeStage;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => onStageChange(tab.id)}
                                className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                    active
                                        ? 'bg-primary/15 text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                aria-pressed={active}
                            >
                                {tab.title}
                                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-semibold ${
                                    active ? 'bg-primary/25 text-foreground' : 'bg-muted text-muted-foreground'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Row 2 · search + filter · avatars · view toggle · Upload Document CTA */}
            <div className="flex items-center gap-3 px-4 py-3">
                <div className="relative flex-1 max-w-md">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder="Search documents..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                </div>

                <button
                    type="button"
                    className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                    <Filter size={14} />
                    All
                </button>

                <div className="hidden lg:flex items-center -space-x-2">
                    {avatars.map(a => (
                        <div
                            key={a.initials}
                            className={`w-7 h-7 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold text-white ${a.bg}`}
                            title={a.initials}
                        >
                            {a.initials}
                        </div>
                    ))}
                    <div className="w-7 h-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        +2
                    </div>
                </div>

                <div className="flex-1" />

                {/* Kanban / List toggle · standalone icon buttons pinned right */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onViewModeChange('list')}
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border transition-colors ${
                            viewMode === 'list'
                                ? 'bg-muted text-foreground'
                                : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        aria-label="List view"
                        aria-pressed={viewMode === 'list'}
                    >
                        <ListIcon size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewModeChange('kanban')}
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border transition-colors ${
                            viewMode === 'kanban'
                                ? 'bg-muted text-foreground'
                                : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        aria-label="Kanban view"
                        aria-pressed={viewMode === 'kanban'}
                    >
                        <LayoutGrid size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

interface PreviewListViewProps {
    cards: CardDef[];
    stages: readonly StageDef[];
}

function PreviewListView({ cards, stages }: PreviewListViewProps) {
    const stageTitle = (id: string) => stages.find(s => s.id === id)?.title ?? id;
    if (cards.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
                <p className="text-sm text-muted-foreground">No documents match the current filters.</p>
            </div>
        );
    }
    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 bg-muted/40 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <div className="col-span-4">Document</div>
                <div className="col-span-2">Dealer</div>
                <div className="col-span-2">Stage</div>
                <div className="col-span-1">Priority</div>
                <div className="col-span-2">Assigned</div>
                <div className="col-span-1 text-right">Age</div>
            </div>
            {/* Rows */}
            <ul className="divide-y divide-border">
                {cards.map(card => {
                    const bucket = CARD_PREVIEW_COLUMN[card.id] ?? card.column;
                    const priorityClass =
                        card.priority === 'critical' ? 'bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/30' :
                        card.priority === 'high'     ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/30' :
                        card.priority === 'medium'   ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/30' :
                                                       'bg-muted text-muted-foreground ring-border';
                    return (
                        <li
                            key={card.id}
                            className="grid grid-cols-1 md:grid-cols-12 gap-3 px-4 py-3 hover:bg-muted/40 transition-colors items-center"
                        >
                            <div className="md:col-span-4 flex items-center gap-3 min-w-0">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <FileText size={14} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">{card.title}</p>
                                    <p className="text-[11px] text-muted-foreground truncate md:hidden">
                                        {card.dealer} · {stageTitle(bucket)}
                                    </p>
                                </div>
                            </div>
                            <div className="hidden md:block md:col-span-2 text-xs text-foreground truncate">{card.dealer}</div>
                            <div className="hidden md:block md:col-span-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                                    {stageTitle(bucket)}
                                </span>
                            </div>
                            <div className="hidden md:block md:col-span-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ring-1 ring-inset ${priorityClass}`}>
                                    {card.priority}
                                </span>
                            </div>
                            <div className="hidden md:flex md:col-span-2 items-center -space-x-1.5">
                                {['AI', 'JD'].map((ini, i) => (
                                    <div
                                        key={i}
                                        className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground"
                                    >
                                        {ini}
                                    </div>
                                ))}
                            </div>
                            <div className="hidden md:flex md:col-span-1 items-center justify-end gap-1 text-[11px] text-muted-foreground">
                                <Clock size={11} />
                                4h
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

