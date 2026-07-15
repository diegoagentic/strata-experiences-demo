// ═══════════════════════════════════════════════════════════════════════════════
// Dupler — Flow 3: Observability & Client Reporting
// Steps: d3.1 (Data Bridge), d3.2 (Reconciliation + Data Sync),
//        d3.3 (Report & Alerts), d3.4 (Distribution + Client Portal)
// Renders INSIDE Dashboard.tsx — notification in Follow Up, processing in Metrics tab
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDemo } from '../../context/DemoContext';
import { AIAgentAvatar } from './DemoAvatars';
import ConfidenceScoreBadge from '../widgets/ConfidenceScoreBadge';
import {
    ArrowRightIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    DocumentArrowDownIcon,
    ArrowsRightLeftIcon,
    DocumentChartBarIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    PaperAirplaneIcon,
    LightBulbIcon,
    CubeIcon,
    ArchiveBoxIcon,
    MapPinIcon,
    TruckIcon,
    LinkIcon,
    XMarkIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';
import { DUPLER_STEP_TIMING, type DuplerStepTiming } from '../../config/profiles/dupler';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, CartesianGrid, Tooltip, Legend } from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type SyncPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results';
type ReconPhase = 'idle' | 'continuity' | 'notification' | 'processing' | 'revealed';
type AssemblyPhase = 'idle' | 'continuity' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results';
type ReportPhase = 'idle' | 'notification' | 'revealed';

interface AgentVis { name: string; detail: string; visible: boolean; done: boolean; }

// ─── Mock Data — Inventory-Oriented ─────────────────────────────────────────

// d3.1 — Inventory Health KPIs
interface KPIMetric { label: string; value: string; trend: string; trendUp: boolean; }

const INVENTORY_KPIS: KPIMetric[] = [
    { label: 'Total Stock Value', value: '$1.2M', trend: '+8% vs Q1', trendUp: true },
    { label: 'Fill Rate', value: '89%', trend: '+3% vs Q1', trendUp: true },
    { label: 'Backorder Items', value: '42', trend: '-12 vs Q1', trendUp: true },
    { label: 'Warehouse Utilization', value: '68%', trend: '+5% vs Q1', trendUp: false },
];

const INVENTORY_BY_CATEGORY = [
    { name: 'Seating', available: 400, reserved: 240, backordered: 100, color: '#10b981' },
    { name: 'Desks', available: 300, reserved: 139, backordered: 50, color: '#6366f1' },
    { name: 'Storage', available: 200, reserved: 980, backordered: 200, color: '#f59e0b' },
    { name: 'Tables', available: 278, reserved: 390, backordered: 80, color: '#8b5cf6' },
    { name: 'Access.', available: 189, reserved: 480, backordered: 20, color: '#ec4899' },
];

// d3.2 — Cross-System Data Update & Sync
const SYNC_UPDATE_KPIS: KPIMetric[] = [
    { label: 'Stock Accuracy', value: '97.2%', trend: '+0.8% vs Q1', trendUp: true },
    { label: 'Turnover Rate', value: '4.8×', trend: '+0.3 vs Q1', trendUp: true },
    { label: 'Fill Rate', value: '89%', trend: '+3% vs Q1', trendUp: true },
    { label: 'Backorder Rate', value: '3.2%', trend: '-0.5% vs Q1', trendUp: true },
];

// Updates already resolved in Flow 2 — shown as read-only summary
const RESOLVED_UPDATES = [
    { id: 'upd-1', label: 'Count Adjusted', item: 'Acuity Task Chairs', detail: '48 → 45 units (SH-003 deducted)', source: 'Flow 2 — Receiving' },
    { id: 'upd-2', label: 'Location Corrected', item: 'Stride Bench 60"', detail: 'Bay A, Rack 3 → Bay C, Rack 7', source: 'Flow 2 — Warehouse Sync' },
    { id: 'upd-3', label: 'Item Tracked', item: 'Park Collaborative Table', detail: 'Located at Cincinnati Overflow (TRF-2026-018)', source: 'Flow 2 — Transit Intelligence' },
];

// d3.3 — Report Sections
interface ReportSection {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
}

const REPORT_SECTIONS: ReportSection[] = [
    { id: 'availability', title: 'Stock Availability by Category', subtitle: 'Inventory health across 5 categories — 1,840 items total', icon: <ChartBarIcon className="h-4 w-4" /> },
    { id: 'capacity', title: 'Warehouse Capacity & Forecast', subtitle: 'Columbus 72%→89%, Cincinnati 45%, Dayton 38% — Mercy Health Phase 2 impact', icon: <ArchiveBoxIcon className="h-4 w-4" /> },
    { id: 'backorder', title: 'Backorder & Supply Chain Status', subtitle: '42 items backordered — 3 critical (ETA > 2 weeks)', icon: <TruckIcon className="h-4 w-4" /> },
    { id: 'recommendations', title: 'AI Recommendations', subtitle: '3 actionable insights from inventory analysis', icon: <LightBulbIcon className="h-4 w-4" /> },
];

// d3.4 — AI Insights
interface AIInsight {
    id: string;
    title: string;
    detail: string;
    impact: string;
    confidence: number;
}

const AI_INSIGHTS: AIInsight[] = [
    {
        id: 'ins-1',
        title: 'Reorder Allsteel Acuity Chairs',
        detail: 'Current stock: 15 units. Safety level: 20. Mercy Health Phase 2 requires 8 more. Lead time: 10 business days. Reorder now to avoid stockout.',
        impact: 'Prevent $6,850 backorder',
        confidence: 94,
    },
    {
        id: 'ins-2',
        title: 'Relocate 85 Items: Columbus → Cincinnati',
        detail: 'Columbus at 72% (projected 89% with Mercy Health). 55 general stock + 30 archived fixtures can move to Cincinnati (45%). Saves $3,600/month in overflow storage fees.',
        impact: '$3,600/mo savings',
        confidence: 91,
    },
    {
        id: 'ins-3',
        title: '5 SKUs Approaching End-of-Life',
        detail: 'Xsede Panel System, Priority Panel (2019), Triumph Conf Table (2019), Solve Shelf 36" (disc.), Narrate Desk — all discontinued or being phased out. Combined value: $8,450. Mark for clearance.',
        impact: 'Recover $8,450 value',
        confidence: 88,
    },
];

// ─── Agents ─────────────────────────────────────────────────────────────────

const SYNC_AGENTS: AgentVis[] = [
    { name: 'DataBridge', detail: 'CET ↔ SPEC ↔ Compass ↔ Warehouse ↔ Carrier synced', visible: false, done: false },
    { name: 'POTracker', detail: '9 active POs tracked', visible: false, done: false },
    { name: 'StockAnalyzer', detail: 'availability computed', visible: false, done: false },
    { name: 'HealthScorer', detail: 'score: 78/100', visible: false, done: false },
];

const SYNC_UPDATE_AGENTS: AgentVis[] = [
    { name: 'UpdateVerifier', detail: '3 updates from warehouse ops confirmed', visible: false, done: false },
    { name: 'CrossSystemSync', detail: 'Propagating to CET · SPEC · Compass', visible: false, done: false },
    { name: 'ConsistencyCheck', detail: '1,840 records — 100% consistent', visible: false, done: false },
];

const REPORT_AGENTS: AgentVis[] = [
    { name: 'HealthReporter', detail: '4 sections built', visible: false, done: false },
    { name: 'TrendAnalyzer', detail: '6-month trends', visible: false, done: false },
    { name: 'AlertEngine', detail: '3 push notifications queued', visible: false, done: false },
    { name: 'InsightEngine', detail: '3 recommendations', visible: false, done: false },
];


// ─── Dashboard Metrics (available for report inclusion) ─────────────────────

interface DashboardMetric {
    id: string;
    label: string;
    description: string;
    source: string;
    default: boolean;
}

const DASHBOARD_METRICS: DashboardMetric[] = [
    { id: 'stock-availability', label: 'Stock Availability by Category', description: '1,840 items across 5 categories', source: 'Inventory', default: true },
    { id: 'warehouse-capacity', label: 'Warehouse Capacity & Forecast', description: '3 warehouses — Columbus 72%→89%', source: 'Warehouse', default: true },
    { id: 'backorder-status', label: 'Backorder & Supply Chain', description: '42 items backordered, 3 critical', source: 'Supply Chain', default: true },
    { id: 'ai-recommendations', label: 'AI Recommendations', description: '3 actionable insights', source: 'AI Engine', default: true },
    { id: 'financial-summary', label: 'Financial Summary', description: 'Stock value $1.2M, margins, cost trends', source: 'Finance', default: false },
    { id: 'vendor-performance', label: 'Vendor Performance', description: 'Lead times, claim rates, fill accuracy', source: 'Procurement', default: false },
    { id: 'project-timeline', label: 'Project Timeline — Mercy Health', description: 'Phase 2 at 68%, 5 delivery milestones', source: 'Projects', default: false },
    { id: 'consignment-aging', label: 'Consignment Aging', description: 'Wall of Shame — 12 items > 90 days at site', source: 'Warehouse', default: false },
];

// ─── Notification Component (rendered in Follow Up tab) ─────────────────────

interface DuplerReportingNotificationProps {
    onSwitchToMetrics: () => void;
}

export function DuplerReportingNotification({ onSwitchToMetrics }: DuplerReportingNotificationProps) {
    const { currentStep, isPaused } = useDemo();
    const [visible, setVisible] = useState(false);
    const [autoSwitching, setAutoSwitching] = useState(false);
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

    // Only show for d3.1 notification phase
    useEffect(() => {
        if (!currentStep.id.startsWith('d3.')) return;
        const t = setTimeout(pauseAware(() => setVisible(true)), 1500);
        return () => clearTimeout(t);
    }, [currentStep.id, pauseAware]);

    // Auto-switch to Metrics after 4 seconds
    useEffect(() => {
        if (!visible) return;
        const t = setTimeout(pauseAware(() => {
            setAutoSwitching(true);
            setTimeout(pauseAware(() => onSwitchToMetrics()), 800);
        }), 4000);
        return () => clearTimeout(t);
    }, [visible, pauseAware, onSwitchToMetrics]);

    if (!visible || !currentStep.id.startsWith('d3.')) return null;

    return (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500 mb-6">
            <div
                onClick={() => { setAutoSwitching(true); setTimeout(onSwitchToMetrics, 300); }}
                className={`p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 cursor-pointer hover:shadow-brand-500/20 transition-all ${autoSwitching ? 'opacity-60 scale-[0.98]' : ''}`}
            >
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-brand-500 text-zinc-900">
                        <ChartBarIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">Inventory Intelligence Report</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">NEW</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Analyzing <span className="font-semibold text-foreground">1,840 items</span> across 3 warehouses — stock availability, reconciliation, and AI recommendations.
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-brand-600 dark:text-brand-400">
                            <span className="text-xs font-semibold">View in Metrics</span>
                            <ArrowRightIcon className="h-3.5 w-3.5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component (rendered in Metrics tab) ───────────────────────────────

interface DuplerReportingProps {
    onNavigate: (page: string) => void;
}

export default function DuplerReporting({ onNavigate }: DuplerReportingProps) {
    const { currentStep, nextStep, isPaused } = useDemo();
    const stepId = currentStep.id;

    // ── pauseAware ──
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

    // ── d3.1 State: Inventory Sync ──
    const [syncPhase, setSyncPhase] = useState<SyncPhase>('idle');
    const syncRef = useRef(syncPhase);
    useEffect(() => { syncRef.current = syncPhase; }, [syncPhase]);
    const [syncAgents, setSyncAgents] = useState(SYNC_AGENTS.map(a => ({ ...a })));
    const [syncProgress, setSyncProgress] = useState(0);

    // ── d3.2 State: Cross-System Data Update & Sync ──
    const [reconPhase, setReconPhase] = useState<ReconPhase>('idle');
    const [reconAgents, setReconAgents] = useState(SYNC_UPDATE_AGENTS.map(a => ({ ...a })));
    const [dataSyncPhase, setDataSyncPhase] = useState<'idle' | 'syncing' | 'done'>('idle');
    const [dataSyncProgress, setDataSyncProgress] = useState(0);
    const [dataSyncChecks, setDataSyncChecks] = useState(0);
    const [showMetricSelector, setShowMetricSelector] = useState(false);
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
        DASHBOARD_METRICS.filter(m => m.default).map(m => m.id)
    );

    // ── d3.3 State: Report Assembly ──
    const [assemblyPhase, setAssemblyPhase] = useState<AssemblyPhase>('idle');
    const assemblyRef = useRef(assemblyPhase);
    useEffect(() => { assemblyRef.current = assemblyPhase; }, [assemblyPhase]);
    const [reportAgents, setReportAgents] = useState(REPORT_AGENTS.map(a => ({ ...a })));
    const [reportProgress, setReportProgress] = useState(0);
    const [sectionsRevealed, setSectionsRevealed] = useState(0);
    const [showReportPreview, setShowReportPreview] = useState(false);
    const [reportDownloaded, setReportDownloaded] = useState(false);
    const [reportActionToast, setReportActionToast] = useState<string | null>(null);
    const [showReportSendPopover, setShowReportSendPopover] = useState(false);
    const [reportSendRecipients, setReportSendRecipients] = useState<string[]>(['randy']);
    const [reportSent, setReportSent] = useState(false);

    // ── d3.4 State: Distribution ──
    const [reportPhase, setReportPhase] = useState<ReportPhase>('idle');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [exported, setExported] = useState(false);
    const [showSendPopover, setShowSendPopover] = useState(false);
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [sendToast, setSendToast] = useState<string | null>(null);
    const [downloaded, setDownloaded] = useState(false);
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    // ── d3.5 merged into d3.4 — portal shown inline ──
    const [showClientPortal, setShowClientPortal] = useState(false);

    // ── Helpers ──
    const toggleSection = (id: string) => setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));

    const getTiming = (id: string): DuplerStepTiming => DUPLER_STEP_TIMING[id] || { notifDelay: 2000, notifDuration: 6000, agentStagger: 800, agentDone: 500, breathing: 1500, resultsDur: 0 };

    // ── Agent pipeline runner ──
    function runAgentPipeline(agents: AgentVis[], setAgents: React.Dispatch<React.SetStateAction<AgentVis[]>>, setProgress: React.Dispatch<React.SetStateAction<number>>, timing: DuplerStepTiming, onDone: () => void) {
        const timers: ReturnType<typeof setTimeout>[] = [];
        agents.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => {
                setAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a));
                setProgress(((i + 0.5) / agents.length) * 100);
                timers.push(setTimeout(pauseAware(() => {
                    setAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a));
                    setProgress(((i + 1) / agents.length) * 100);
                }), timing.agentDone));
            }), i * timing.agentStagger));
        });
        timers.push(setTimeout(pauseAware(onDone), agents.length * timing.agentStagger + timing.agentDone + 300));
        return timers;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // d3.1 — Inventory Data Sync (auto)
    // ═══════════════════════════════════════════════════════════════════════════
    useEffect(() => {
        if (stepId !== 'd3.1' || syncRef.current !== 'idle') return;
        const timing = getTiming('d3.1');
        const t = setTimeout(pauseAware(() => setSyncPhase('notification')), timing.notifDelay);
        return () => clearTimeout(t);
    }, [stepId, pauseAware]);

    useEffect(() => {
        if (stepId !== 'd3.1' || syncPhase !== 'processing') return;
        const timing = getTiming('d3.1');
        const timers = runAgentPipeline(SYNC_AGENTS, setSyncAgents, setSyncProgress, timing, () => setSyncPhase('breathing'));
        return () => timers.forEach(clearTimeout);
    }, [stepId, syncPhase, pauseAware]);

    useEffect(() => {
        if (stepId !== 'd3.1' || syncPhase !== 'breathing') return;
        const timing = getTiming('d3.1');
        const t = setTimeout(pauseAware(() => setSyncPhase('revealed')), timing.breathing);
        return () => clearTimeout(t);
    }, [stepId, syncPhase, pauseAware]);

    useEffect(() => {
        if (stepId !== 'd3.1' || syncPhase !== 'revealed') return;
        const timing = getTiming('d3.1');
        if (timing.resultsDur > 0) {
            const t = setTimeout(pauseAware(() => setSyncPhase('results')), 2000);
            return () => clearTimeout(t);
        }
    }, [stepId, syncPhase, pauseAware]);

    useEffect(() => {
        if (stepId !== 'd3.1' || syncPhase !== 'results') return;
        const timing = getTiming('d3.1');
        const t = setTimeout(pauseAware(() => nextStep()), timing.resultsDur - 2000);
        return () => clearTimeout(t);
    }, [stepId, syncPhase, pauseAware, nextStep]);

    // ═══════════════════════════════════════════════════════════════════════════
    // d3.2 — Cross-System Data Update & Sync (interactive)
    // ═══════════════════════════════════════════════════════════════════════════
    useEffect(() => {
        if (stepId !== 'd3.2' || reconPhase !== 'idle') return;
        const t = setTimeout(pauseAware(() => setReconPhase('continuity')), 300);
        return () => clearTimeout(t);
    }, [stepId, reconPhase, pauseAware]);

    const handleReconStart = () => {
        setReconPhase('processing');
        const timing = getTiming('d3.2');
        const timers = runAgentPipeline(SYNC_UPDATE_AGENTS, setReconAgents, () => { }, timing, () => setReconPhase('revealed'));
    };

    // Data Sync effect — triggered after all discrepancies resolved
    useEffect(() => {
        if (dataSyncPhase !== 'syncing') return;
        setDataSyncProgress(0);
        setDataSyncChecks(0);
        const duration = 2000;
        const steps = 20;
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 1; i <= steps; i++) {
            timers.push(setTimeout(
                pauseAware(() => setDataSyncProgress(Math.min(100, Math.round((i / steps) * 100)))),
                (duration / steps) * i
            ));
        }
        // Stagger checklist items
        const checkItems = 4;
        for (let i = 1; i <= checkItems; i++) {
            timers.push(setTimeout(pauseAware(() => setDataSyncChecks(i)), (duration / checkItems) * i));
        }
        timers.push(setTimeout(pauseAware(() => setDataSyncPhase('done')), duration + 300));
        return () => timers.forEach(clearTimeout);
    }, [dataSyncPhase, pauseAware]);

    // ═══════════════════════════════════════════════════════════════════════════
    // d3.3 — Report Assembly (auto)
    // ═══════════════════════════════════════════════════════════════════════════
    useEffect(() => {
        if (stepId !== 'd3.3' || assemblyRef.current !== 'idle') return;
        const t = setTimeout(pauseAware(() => setAssemblyPhase('continuity')), 300);
        return () => clearTimeout(t);
    }, [stepId, pauseAware]);

    useEffect(() => {
        if (stepId !== 'd3.3' || assemblyPhase !== 'processing') return;
        const timing = getTiming('d3.3');
        const timers = runAgentPipeline(REPORT_AGENTS, setReportAgents, setReportProgress, timing, () => setAssemblyPhase('breathing'));
        return () => timers.forEach(clearTimeout);
    }, [stepId, assemblyPhase, pauseAware]);

    useEffect(() => {
        if (stepId !== 'd3.3' || assemblyPhase !== 'breathing') return;
        const timing = getTiming('d3.3');
        const t = setTimeout(pauseAware(() => {
            setAssemblyPhase('revealed');
            // Stagger section reveals
            REPORT_SECTIONS.forEach((_, i) => {
                setTimeout(pauseAware(() => setSectionsRevealed(i + 1)), (i + 1) * 400);
            });
        }), timing.breathing);
        return () => clearTimeout(t);
    }, [stepId, assemblyPhase, pauseAware]);

    // d3.3 revealed: no auto-advance — user previews PDF and clicks Continue

    // ═══════════════════════════════════════════════════════════════════════════
    // d3.4 — Report Review & Distribution (interactive)
    // ═══════════════════════════════════════════════════════════════════════════
    useEffect(() => {
        if (stepId !== 'd3.4' || reportPhase !== 'idle') return;
        const timing = getTiming('d3.4');
        const t = setTimeout(pauseAware(() => setReportPhase('notification')), timing.notifDelay);
        return () => clearTimeout(t);
    }, [stepId, reportPhase, pauseAware]);

    const handleReportStart = () => setReportPhase('revealed');

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    const renderAgentPipeline = (agents: AgentVis[], progress: number, label: string) => (
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
                <span className="text-[10px] font-bold text-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-brand-400 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="space-y-1.5">
                {agents.map(agent => agent.visible && (
                    <div key={agent.name} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <AIAgentAvatar />
                        <span className="text-[11px] font-semibold text-foreground">{agent.name}</span>
                        <span className="text-[10px] text-muted-foreground">— {agent.detail}</span>
                        {agent.done && <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 ml-auto shrink-0" />}
                    </div>
                ))}
            </div>
        </div>
    );

    const SystemChips = ({ systems, status = 'CONNECTED' }: { systems: { label: string; color: 'blue' | 'teal' | 'amber' | 'purple' | 'green' | 'red' }[]; status?: string }) => (
        <div className="flex items-center gap-1.5 flex-wrap">
            {systems.map((sys, i) => (
                <span key={sys.label} className="contents">
                    <span className={`text-[8px] font-bold px-2 py-1 rounded-md border flex items-center gap-1 ${
                        sys.color === 'blue' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 ring-2 ring-blue-300 dark:ring-blue-500/30 shadow-sm shadow-blue-200 dark:shadow-blue-500/10' :
                        sys.color === 'teal' ? 'bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20' :
                        sys.color === 'amber' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                        sys.color === 'purple' ? 'bg-purple-100 dark:bg-ai/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' :
                        sys.color === 'red' ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20' :
                        'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20'
                    }`}>
                        <LinkIcon className="h-3 w-3" />{sys.label}
                    </span>
                    {i < systems.length - 1 && <span className="text-muted-foreground text-[10px]">↔</span>}
                </span>
            ))}
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-semibold">{status}</span>
        </div>
    );

    const renderNotification = (icon: React.ReactNode, title: string, subtitle: React.ReactNode, onClick: () => void) => (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div
                onClick={onClick}
                className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 cursor-pointer hover:shadow-brand-500/20 transition-all"
            >
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-brand-500 text-zinc-900">{icon}</div>
                    <div className="flex-1">
                        <span className="text-xs font-bold text-foreground">{title}</span>
                        <div className="text-[11px] text-muted-foreground mt-1">{subtitle}</div>
                        <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 mt-1 inline-block">Click to start →</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderKPIGrid = (kpis: KPIMetric[]) => (
        <div className="grid grid-cols-2 gap-2">
            {kpis.map(kpi => (
                <div key={kpi.label} className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
                    <div className="text-sm font-bold text-foreground mt-0.5">{kpi.value}</div>
                    <div className={`text-[10px] font-semibold mt-0.5 ${kpi.trendUp ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {kpi.trend}
                    </div>
                </div>
            ))}
        </div>
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════

    if (!stepId.startsWith('d3.')) return null;

    return (
        <div className="space-y-4 mb-6">
            {/* ── d3.1: Inventory Data Sync ── */}
            {stepId === 'd3.1' && (
                <>
                    {syncPhase === 'notification' && renderNotification(
                        <LinkIcon className="h-4 w-4" />,
                        'Cross-System Data Bridge',
                        <div className="space-y-2">
                            <SystemChips systems={[{ label: 'CET', color: 'teal' }, { label: 'SPEC', color: 'blue' }, { label: 'COMPASS', color: 'purple' }, { label: 'WMS', color: 'amber' }, { label: 'CARRIER', color: 'green' }]} />
                            <p>DataBridge: Connecting 5 systems — syncing 1,840 items across 3 warehouses. Stock availability, health scoring, and category breakdown.</p>
                        </div>,
                        () => setSyncPhase('processing')
                    )}
                    {syncPhase === 'processing' && renderAgentPipeline(syncAgents, syncProgress, 'Inventory Sync — 3 warehouses + 9 POs...')}
                    {syncPhase === 'breathing' && (
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-muted-foreground">Sync complete — computing inventory health...</span>
                        </div>
                    )}
                    {(syncPhase === 'revealed' || syncPhase === 'results') && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* AI Summary */}
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar />
                                    <p className="text-xs text-green-800 dark:text-green-200">
                                        <span className="font-bold">DataBridge + StockAnalyzer:</span> <span className="font-semibold">5 systems</span> connected — <span className="font-semibold">1,840 items</span> synced.
                                        Health score: <span className="font-semibold">78/100</span>. Fill rate: <span className="font-semibold">89%</span>.
                                    </p>
                                </div>
                            </div>
                            {/* Data Bridge Diagram */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">Cross-System Data Bridge</span>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-bold">ALL CONNECTED</span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-center gap-2 flex-wrap">
                                        {[
                                            { name: 'CET', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20' },
                                            { name: 'SPEC', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
                                            { name: 'Compass', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' },
                                            { name: 'Warehouse', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
                                            { name: 'Carrier', color: 'bg-ai/10 text-ai dark:text-purple-400 border-purple-200 dark:border-purple-500/20' },
                                        ].map((sys, i, arr) => (
                                            <div key={sys.name} className="flex items-center gap-2">
                                                <div className={`px-3 py-2 rounded-lg border text-[11px] font-bold ${sys.color}`}>{sys.name}</div>
                                                {i < arr.length - 1 && <ArrowsRightLeftIcon className="h-4 w-4 text-muted-foreground shrink-0" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Mini inventory chart */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">Stock by Category</span>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-400 font-bold">LIVE DATA</span>
                                </div>
                                <div className="p-4">
                                    <ResponsiveContainer width="100%" height={160}>
                                        <BarChart data={INVENTORY_BY_CATEGORY} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                                            <Bar dataKey="available" stackId="a" fill="#10b981" name="Available" radius={[0, 0, 4, 4]} />
                                            <Bar dataKey="reserved" stackId="a" fill="#f59e0b" name="Reserved" />
                                            <Bar dataKey="backordered" stackId="a" fill="#ef4444" name="Backordered" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* KPI cards */}
                            {renderKPIGrid(INVENTORY_KPIS)}

                            {/* CTA button */}
                            <button
                                onClick={() => nextStep()}
                                className="w-full py-3 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors"
                            >
                                Continue to Data Sync
                                <ArrowRightIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── d3.2: Cross-System Data Update & Sync ── */}
            {stepId === 'd3.2' && (
                <>
                    {reconPhase === 'continuity' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* d3.1 end state: AI Summary */}
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar />
                                    <p className="text-xs text-green-800 dark:text-green-200">
                                        <span className="font-bold">DataBridge + StockAnalyzer:</span> <span className="font-semibold">5 systems</span> connected — <span className="font-semibold">1,840 items</span> synced.
                                        Health score: <span className="font-semibold">78/100</span>. Fill rate: <span className="font-semibold">89%</span>.
                                    </p>
                                </div>
                            </div>
                            {/* Bridge Diagram */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">Cross-System Data Bridge</span>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-bold">ALL CONNECTED</span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-center gap-2 flex-wrap">
                                        {[
                                            { name: 'CET', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20' },
                                            { name: 'SPEC', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
                                            { name: 'Compass', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' },
                                            { name: 'Warehouse', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
                                            { name: 'Carrier', color: 'bg-ai/10 text-ai dark:text-purple-400 border-purple-200 dark:border-purple-500/20' },
                                        ].map((sys, i, arr) => (
                                            <div key={sys.name} className="flex items-center gap-2">
                                                <div className={`px-3 py-2 rounded-lg border text-[11px] font-bold ${sys.color}`}>{sys.name}</div>
                                                {i < arr.length - 1 && <ArrowsRightLeftIcon className="h-4 w-4 text-muted-foreground shrink-0" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* KPIs */}
                            {renderKPIGrid(INVENTORY_KPIS)}
                            {/* Transition info + CTA */}
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-300 dark:border-amber-500/30 flex items-center gap-3">
                                <ExclamationTriangleIcon className="h-4 w-4 text-amber-500 shrink-0" />
                                <p className="text-[11px] text-amber-800 dark:text-amber-300 flex-1">
                                    <span className="font-bold">3 warehouse updates</span> detected — need to verify and propagate across all connected systems before reporting.
                                </p>
                            </div>
                            <button
                                onClick={handleReconStart}
                                className="w-full py-3 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors"
                            >
                                <ArrowPathIcon className="h-4 w-4" />
                                Verify & Propagate Updates
                            </button>
                        </div>
                    )}
                    {reconPhase === 'processing' && renderAgentPipeline(reconAgents, 100, 'Verifying updates across systems...')}
                    {reconPhase === 'revealed' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* AI Summary */}
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar />
                                    <p className="text-xs text-green-800 dark:text-green-200">
                                        <span className="font-bold">UpdateVerifier:</span> <span className="font-semibold">3 updates</span> from warehouse operations confirmed —
                                        all corrections already applied in Flow 2. Ready to synchronize across <span className="font-semibold">5 systems</span>.
                                    </p>
                                </div>
                            </div>

                            <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                                <SystemChips systems={[{ label: 'WAREHOUSE OPS', color: 'teal' }, { label: 'ALL SYSTEMS', color: 'blue' }, { label: 'SYNC ENGINE', color: 'purple' }]} />
                            </div>

                            {/* Two-column layout: KPIs + Resolved Updates */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Left: KPIs */}
                                <div className="space-y-3">
                                    <span className="text-xs font-bold text-foreground">Inventory KPIs</span>
                                    {renderKPIGrid(SYNC_UPDATE_KPIS)}
                                </div>

                                {/* Right: Resolved updates from Flow 2 (read-only) */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-foreground">Updates from Warehouse Ops</span>
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-bold">3/3 RESOLVED</span>
                                    </div>
                                    {RESOLVED_UPDATES.map(upd => (
                                        <div key={upd.id} className="p-3 rounded-xl border border-green-200 dark:border-green-500/20 bg-green-50/50 dark:bg-green-500/5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-green-500/20 text-green-700 dark:text-green-400">{upd.label}</span>
                                                <span className="text-[10px] font-semibold text-foreground">{upd.item}</span>
                                            </div>
                                            <p className="text-[10px] text-foreground ml-5">{upd.detail}</p>
                                            <p className="text-[9px] text-muted-foreground ml-5 mt-0.5">Source: {upd.source}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sync trigger button */}
                            {dataSyncPhase === 'idle' && (
                                <button
                                    onClick={() => setDataSyncPhase('syncing')}
                                    className="w-full py-3 rounded-xl text-xs font-bold bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-500/20 animate-pulse transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <ArrowPathIcon className="h-4 w-4" />
                                    Synchronize Across All Systems
                                </button>
                            )}

                            {/* Data Sync Animation */}
                            {dataSyncPhase !== 'idle' && (
                                <div className="space-y-3 animate-in fade-in duration-500">
                                    <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <ArrowPathIcon className={`h-4 w-4 text-brand-600 dark:text-brand-400 ${dataSyncPhase === 'syncing' ? 'animate-spin' : ''}`} />
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    {dataSyncPhase === 'syncing' ? 'Synchronizing across 5 systems...' : 'Data Synchronized'}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-bold text-foreground">{dataSyncProgress}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-300 ${dataSyncPhase === 'done' ? 'bg-green-500' : 'bg-brand-400'}`} style={{ width: `${dataSyncProgress}%` }} />
                                        </div>
                                        <div className="space-y-1.5">
                                            {[
                                                { label: 'Count adjustments propagated', detail: 'Acuity Chairs 48 → 45 across all systems' },
                                                { label: 'Location records updated', detail: 'Stride Bench → Bay C, Rack 7' },
                                                { label: 'Transfer confirmed', detail: 'Park Table at Cincinnati (TRF-2026-018)' },
                                                { label: 'All 5 systems in sync', detail: 'CET · SPEC · Compass · WMS · Carrier' },
                                            ].map((check, i) => i < dataSyncChecks && (
                                                <div key={check.label} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                                    <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                                    <span className="text-[11px] font-semibold text-foreground">{check.label}</span>
                                                    <span className="text-[10px] text-muted-foreground">— {check.detail}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {dataSyncPhase === 'done' && (
                                        <div className="space-y-3 animate-in fade-in duration-300">
                                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                    <span className="text-xs font-bold text-green-800 dark:text-green-200">DATA SYNCHRONIZED — 1,840/1,840 verified</span>
                                                </div>
                                            </div>

                                            {/* Metric Selector CTA */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowMetricSelector(!showMetricSelector)}
                                                    className="w-full py-3 rounded-xl text-xs font-bold bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-500/20 animate-pulse transition-all flex items-center justify-center gap-2"
                                                >
                                                    <DocumentChartBarIcon className="h-4 w-4" />
                                                    Configure & Generate Report
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-900/20 font-bold">{selectedMetrics.length} metrics</span>
                                                </button>

                                                {/* Metric Selector Popover */}
                                                {showMetricSelector && (
                                                    <div className="absolute bottom-full mb-2 left-0 right-0 bg-card border border-border rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 overflow-hidden">
                                                        <div className="px-4 py-2.5 border-b border-border bg-muted/50">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-xs font-bold text-foreground">Report Metrics</p>
                                                                    <p className="text-[9px] text-muted-foreground">Select which dashboard metrics to include in the report</p>
                                                                </div>
                                                                <button onClick={() => setShowMetricSelector(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                                                                    <XMarkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="p-2 space-y-0.5 max-h-[280px] overflow-y-auto">
                                                            {/* Default metrics header */}
                                                            <div className="px-2 pt-1 pb-1.5">
                                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Included by Default</span>
                                                            </div>
                                                            {DASHBOARD_METRICS.filter(m => m.default).map(metric => {
                                                                const isSelected = selectedMetrics.includes(metric.id);
                                                                return (
                                                                    <button key={metric.id}
                                                                        onClick={() => setSelectedMetrics(prev =>
                                                                            prev.includes(metric.id) ? prev.filter(id => id !== metric.id) : [...prev, metric.id]
                                                                        )}
                                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                                                                            isSelected
                                                                                ? 'bg-brand-100 dark:bg-brand-500/10 ring-1 ring-brand-300 dark:ring-brand-500/30'
                                                                                : 'hover:bg-muted/50'
                                                                        }`}>
                                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                                            isSelected ? 'bg-brand-400 border-brand-400' : 'border-border'
                                                                        }`}>
                                                                            {isSelected && <CheckCircleIcon className="h-3 w-3 text-zinc-900" />}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-[11px] font-bold text-foreground">{metric.label}</p>
                                                                            <p className="text-[9px] text-muted-foreground">{metric.description}</p>
                                                                        </div>
                                                                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold shrink-0">{metric.source}</span>
                                                                    </button>
                                                                );
                                                            })}

                                                            {/* Additional metrics header */}
                                                            <div className="px-2 pt-3 pb-1.5 border-t border-border mt-1">
                                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Additional Dashboard Metrics</span>
                                                            </div>
                                                            {DASHBOARD_METRICS.filter(m => !m.default).map(metric => {
                                                                const isSelected = selectedMetrics.includes(metric.id);
                                                                return (
                                                                    <button key={metric.id}
                                                                        onClick={() => setSelectedMetrics(prev =>
                                                                            prev.includes(metric.id) ? prev.filter(id => id !== metric.id) : [...prev, metric.id]
                                                                        )}
                                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                                                                            isSelected
                                                                                ? 'bg-brand-100 dark:bg-brand-500/10 ring-1 ring-brand-300 dark:ring-brand-500/30'
                                                                                : 'hover:bg-muted/50'
                                                                        }`}>
                                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                                            isSelected ? 'bg-brand-400 border-brand-400' : 'border-border'
                                                                        }`}>
                                                                            {isSelected && <CheckCircleIcon className="h-3 w-3 text-zinc-900" />}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-[11px] font-bold text-foreground">{metric.label}</p>
                                                                            <p className="text-[9px] text-muted-foreground">{metric.description}</p>
                                                                        </div>
                                                                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold shrink-0">{metric.source}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>

                                                        <div className="px-3 pb-3 pt-1 border-t border-border">
                                                            <button
                                                                onClick={() => {
                                                                    setShowMetricSelector(false);
                                                                    nextStep();
                                                                }}
                                                                disabled={selectedMetrics.length === 0}
                                                                className={`w-full py-2.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${
                                                                    selectedMetrics.length > 0
                                                                        ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-md'
                                                                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                                                                }`}
                                                            >
                                                                <DocumentChartBarIcon className="h-3.5 w-3.5" />
                                                                Generate Report with {selectedMetrics.length} Metric{selectedMetrics.length !== 1 ? 's' : ''}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ── d3.3: Inventory Health Report Assembly ── */}
            {stepId === 'd3.3' && (
                <>
                    {assemblyPhase === 'continuity' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* d3.2 end state: Sync complete banner */}
                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                                <div className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <span className="text-xs font-bold text-green-800 dark:text-green-200">DATA SYNCHRONIZED — 1,840/1,840 verified</span>
                                </div>
                            </div>

                            {/* Resolved updates summary */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Updates Propagated Across 5 Systems</span>
                                {RESOLVED_UPDATES.map(upd => (
                                    <div key={upd.id} className="p-2.5 rounded-xl border border-green-200 dark:border-green-500/20 bg-green-50/50 dark:bg-green-500/5 flex items-center gap-2">
                                        <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-green-500/20 text-green-700 dark:text-green-400">{upd.label}</span>
                                        <span className="text-[10px] font-semibold text-foreground">{upd.item}</span>
                                        <span className="text-[9px] text-muted-foreground ml-auto">— {upd.detail}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Metrics configured */}
                            <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center gap-3">
                                <DocumentChartBarIcon className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[11px] font-bold text-foreground">{selectedMetrics.length} metrics configured</p>
                                    <p className="text-[9px] text-muted-foreground">
                                        {DASHBOARD_METRICS.filter(m => selectedMetrics.includes(m.id)).map(m => m.label).join(' · ')}
                                    </p>
                                </div>
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-400 font-bold">READY</span>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={() => setAssemblyPhase('processing')}
                                className="w-full py-3 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors"
                            >
                                <DocumentChartBarIcon className="h-4 w-4" />
                                Assemble Report
                            </button>
                        </div>
                    )}
                    {assemblyPhase === 'processing' && renderAgentPipeline(reportAgents, reportProgress, 'Report Assembly — 4 sections...')}
                    {assemblyPhase === 'breathing' && (
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-muted-foreground">Assembly complete — formatting report...</span>
                        </div>
                    )}
                    {(assemblyPhase === 'revealed' || assemblyPhase === 'results') && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* AI Summary */}
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar />
                                    <p className="text-xs text-green-800 dark:text-green-200">
                                        <span className="font-bold">HealthReporter:</span> Report built from synchronized data (<span className="font-semibold">3 updates propagated</span>) —
                                        <span className="font-semibold"> 4 sections</span> covering stock availability, warehouse capacity, backorder status, and <span className="font-semibold">3 AI recommendations</span>.
                                    </p>
                                </div>
                            </div>
                            <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                                <SystemChips systems={[{ label: 'REPORT ENGINE', color: 'blue' }, { label: 'TEAMS / EMAIL / SMS', color: 'purple' }, { label: 'INSIGHT AI', color: 'teal' }]} />
                            </div>

                            {/* Report sections preview */}
                            <div className="space-y-2">
                                {REPORT_SECTIONS.slice(0, sectionsRevealed).map((section, idx) => (
                                    <div key={section.id} className="p-4 rounded-xl bg-card border border-border animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-muted text-foreground">{section.icon}</div>
                                            <div className="flex-1">
                                                <span className="text-xs font-bold text-foreground">{section.title}</span>
                                                <p className="text-[10px] text-muted-foreground">{section.subtitle}</p>
                                            </div>
                                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Push Notification Mocks */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Proactive Alerts Queued</span>
                                {[
                                    { channel: 'Teams', icon: '💬', recipient: '@Randy', message: 'Acuity Chairs below safety stock — reorder recommended', color: 'bg-indigo-50 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-500/20' },
                                    { channel: 'Email', icon: '📧', recipient: 'mercy-health-team@dupler.com', message: 'Mercy Health Phase 2 — 68% inventory staged, on track', color: 'bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20' },
                                    { channel: 'SMS', icon: '📱', recipient: 'Randy Martinez', message: 'URGENT: Park Table backorder — ETA Apr 7', color: 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20' },
                                ].map(notif => (
                                    <div key={notif.channel} className={`p-3 rounded-xl border ${notif.color} flex items-start gap-3`}>
                                        <span className="text-lg">{notif.icon}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-foreground">{notif.channel}</span>
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">{notif.recipient}</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">{notif.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {assemblyPhase === 'revealed' && sectionsRevealed >= REPORT_SECTIONS.length && (
                                <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-2">
                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2">
                                        {/* Preview PDF */}
                                        <button
                                            onClick={() => setShowReportPreview(true)}
                                            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground border border-border transition-all flex items-center justify-center gap-2"
                                        >
                                            <DocumentChartBarIcon className="h-4 w-4 text-red-500" /> Preview
                                        </button>

                                        {/* Download */}
                                        <button
                                            onClick={() => {
                                                if (!reportDownloaded) {
                                                    setReportDownloaded(true);
                                                    setReportActionToast('PDF downloaded — Inventory_Report_MercyHealth_Mar2026.pdf');
                                                    setTimeout(() => setReportActionToast(null), 4000);
                                                }
                                            }}
                                            disabled={reportDownloaded}
                                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                                reportDownloaded
                                                    ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-500/30'
                                                    : 'bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground border border-border'
                                            }`}
                                        >
                                            {reportDownloaded ? <CheckCircleIcon className="h-4 w-4" /> : <DocumentArrowDownIcon className="h-4 w-4" />}
                                            {reportDownloaded ? 'Downloaded' : 'Download'}
                                        </button>

                                        {/* Send */}
                                        <button
                                            onClick={() => setShowReportSendPopover(!showReportSendPopover)}
                                            disabled={reportSent}
                                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                                reportSent
                                                    ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-500/30'
                                                    : 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-500/20 animate-pulse'
                                            }`}
                                        >
                                            {reportSent ? <CheckCircleIcon className="h-4 w-4" /> : <PaperAirplaneIcon className="h-4 w-4" />}
                                            {reportSent ? `Sent (${reportSendRecipients.length})` : 'Send'}
                                        </button>
                                    </div>

                                    {/* Send Popover */}
                                    {showReportSendPopover && (
                                        <div className="absolute bottom-full mb-2 right-0 left-0 bg-card border border-border rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 overflow-hidden">
                                            <div className="px-4 py-2.5 border-b border-border bg-muted/50 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-foreground">Send Report to SC Team</p>
                                                    <p className="text-[9px] text-muted-foreground">Select recipients for the intelligence report</p>
                                                </div>
                                                <button onClick={() => setShowReportSendPopover(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                                                    <XMarkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                </button>
                                            </div>
                                            <div className="p-2 space-y-0.5">
                                                {[
                                                    { id: 'randy', name: 'Randy Martinez', role: 'Sales Coordinator', initials: 'RM', recommended: true },
                                                    { id: 'tara', name: 'Tara Collins', role: 'Project Manager', initials: 'TC', recommended: true },
                                                    { id: 'james', name: 'James Mitchell', role: 'Account Executive', initials: 'JM', recommended: false },
                                                    { id: 'sarah', name: 'Sarah Chen', role: 'Dealer Principal', initials: 'SC', recommended: false },
                                                ].map(user => {
                                                    const isSelected = reportSendRecipients.includes(user.id);
                                                    return (
                                                        <button key={user.id}
                                                            onClick={() => setReportSendRecipients(prev =>
                                                                prev.includes(user.id) ? prev.filter(r => r !== user.id) : [...prev, user.id]
                                                            )}
                                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                                                                isSelected
                                                                    ? 'bg-brand-100 dark:bg-brand-500/10 ring-1 ring-brand-300 dark:ring-brand-500/30'
                                                                    : 'hover:bg-muted/50'
                                                            }`}>
                                                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                                isSelected ? 'bg-brand-400 border-brand-400' : 'border-border'
                                                            }`}>
                                                                {isSelected && <CheckCircleIcon className="h-3 w-3 text-zinc-900" />}
                                                            </div>
                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                                                                isSelected ? 'bg-brand-300 text-zinc-900' : 'bg-muted text-muted-foreground'
                                                            }`}>{user.initials}</div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[11px] font-bold text-foreground">{user.name}</p>
                                                                <p className="text-[9px] text-muted-foreground">{user.role}</p>
                                                            </div>
                                                            {user.recommended && (
                                                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-brand-300/50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 font-bold shrink-0">REC</span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="px-3 pb-3 pt-1">
                                                <button
                                                    onClick={() => {
                                                        if (reportSendRecipients.length === 0) return;
                                                        setShowReportSendPopover(false);
                                                        setReportSent(true);
                                                        setReportActionToast(`Report sent to ${reportSendRecipients.length} team member${reportSendRecipients.length !== 1 ? 's' : ''}`);
                                                        setTimeout(() => setReportActionToast(null), 4000);
                                                        setTimeout(() => nextStep(), 2500);
                                                    }}
                                                    disabled={reportSendRecipients.length === 0}
                                                    className={`w-full py-2 rounded-lg text-[11px] font-bold transition-all ${
                                                        reportSendRecipients.length > 0
                                                            ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-md'
                                                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                                                    }`}
                                                >
                                                    {reportSendRecipients.length > 0
                                                        ? `Send to ${reportSendRecipients.length} Recipient${reportSendRecipients.length > 1 ? 's' : ''}`
                                                        : 'Select at least one recipient'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ── d3.4: Report Review & Distribution ── */}
            {stepId === 'd3.4' && (
                <>
                    {reportPhase === 'notification' && renderNotification(
                        <DocumentArrowDownIcon className="h-4 w-4" />,
                        'Inventory Intelligence Report — Ready for Review',
                        <div className="space-y-2">
                            <SystemChips systems={[{ label: 'REPORT ENGINE', color: 'blue' }, { label: 'DISTRIBUTION', color: 'teal' }, { label: 'PDF EXPORT', color: 'purple' }]} />
                            <p>Complete report with stock availability, capacity forecast, backorder analysis, and 3 AI recommendations. Ready for export.</p>
                        </div>,
                        handleReportStart
                    )}
                    {reportPhase === 'revealed' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                                <SystemChips systems={[{ label: 'REPORT ENGINE', color: 'blue' }, { label: 'DISTRIBUTION', color: 'teal' }, { label: 'PDF EXPORT', color: 'purple' }]} />
                            </div>
                            {/* Collapsible report sections */}
                            <div className="space-y-2">
                                {REPORT_SECTIONS.map(section => (
                                    <div key={section.id} className="rounded-xl border border-border overflow-hidden">
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full px-4 py-3 flex items-center gap-3 bg-card hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="p-1.5 rounded-lg bg-muted text-foreground">{section.icon}</div>
                                            <div className="flex-1 text-left">
                                                <span className="text-xs font-bold text-foreground">{section.title}</span>
                                                <p className="text-[10px] text-muted-foreground">{section.subtitle}</p>
                                            </div>
                                            {expandedSections[section.id]
                                                ? <ChevronUpIcon className="h-4 w-4 text-muted-foreground" />
                                                : <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                                            }
                                        </button>
                                        {expandedSections[section.id] && (
                                            <div className="px-4 py-3 border-t border-border bg-muted/20 animate-in fade-in duration-200">
                                                {section.id === 'availability' && (
                                                    <div className="space-y-3">
                                                        <ResponsiveContainer width="100%" height={140}>
                                                            <BarChart data={INVENTORY_BY_CATEGORY} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                                <Bar dataKey="available" stackId="a" fill="#10b981" name="Available" radius={[0, 0, 4, 4]} />
                                                                <Bar dataKey="reserved" stackId="a" fill="#f59e0b" name="Reserved" />
                                                                <Bar dataKey="backordered" stackId="a" fill="#ef4444" name="Backordered" radius={[4, 4, 0, 0]} />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                        {renderKPIGrid(INVENTORY_KPIS)}
                                                    </div>
                                                )}
                                                {section.id === 'capacity' && (
                                                    <div className="space-y-2">
                                                        {[
                                                            { name: 'Columbus Main', current: 72, forecast: 89, alert: true },
                                                            { name: 'Cincinnati Overflow', current: 45, forecast: 48, alert: false },
                                                            { name: 'Dayton Storage', current: 38, forecast: 38, alert: false },
                                                        ].map(wh => (
                                                            <div key={wh.name} className="p-3 rounded-lg bg-card border border-border">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-[11px] font-bold text-foreground">{wh.name}</span>
                                                                    {wh.alert && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold">ALERT</span>}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                                                        <div className={`h-full rounded-full transition-all ${wh.current > 80 ? 'bg-red-500' : wh.current > 60 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${wh.current}%` }} />
                                                                    </div>
                                                                    <span className="text-[10px] font-semibold text-foreground">{wh.current}%</span>
                                                                    {wh.forecast !== wh.current && (
                                                                        <span className="text-[10px] text-amber-600 dark:text-amber-400">→ {wh.forecast}%</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {section.id === 'backorder' && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-[11px]">
                                                            <span className="text-foreground font-semibold">42 items backordered across 5 categories</span>
                                                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">3 critical (ETA &gt; 2 weeks)</span>
                                                        </div>
                                                        {[
                                                            { cat: 'Storage', count: 200, pct: '47%', critical: true },
                                                            { cat: 'Seating', count: 100, pct: '24%', critical: false },
                                                            { cat: 'Tables', count: 80, pct: '19%', critical: true },
                                                            { cat: 'Desks', count: 50, pct: '12%', critical: false },
                                                        ].map(bo => (
                                                            <div key={bo.cat} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border">
                                                                <span className="text-[10px] font-semibold text-foreground">{bo.cat}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] text-muted-foreground">{bo.count} items ({bo.pct})</span>
                                                                    {bo.critical && <ExclamationTriangleIcon className="h-3 w-3 text-amber-500" />}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {section.id === 'recommendations' && (
                                                    <div className="space-y-3">
                                                        {AI_INSIGHTS.map(insight => (
                                                            <div key={insight.id} className="p-3 rounded-lg bg-card border border-border">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-[11px] font-bold text-foreground">{insight.title}</span>
                                                                    <ConfidenceScoreBadge score={insight.confidence} size="sm" />
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground">{insight.detail}</p>
                                                                <div className="mt-1.5">
                                                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-400">
                                                                        {insight.impact}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* ── Action Buttons ── */}
                            <div className="relative space-y-2">
                                <div className="flex items-center gap-2">
                                    {/* Preview PDF */}
                                    <button
                                        onClick={() => setShowPdfPreview(true)}
                                        className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-zinc-400 dark:hover:border-zinc-500"
                                    >
                                        <EyeIcon className="h-4 w-4" /> Preview
                                    </button>

                                    {/* Download PDF */}
                                    <button
                                        onClick={() => {
                                            setDownloaded(true);
                                            setSendToast('PDF downloaded — Inventory_Report_MercyHealth_Mar2026.pdf');
                                            setTimeout(() => setSendToast(null), 4000);
                                        }}
                                        disabled={downloaded}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                            downloaded
                                                ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-500/30'
                                                : 'bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-zinc-400 dark:hover:border-zinc-500'
                                        }`}
                                    >
                                        {downloaded ? <CheckCircleIcon className="h-4 w-4" /> : <DocumentArrowDownIcon className="h-4 w-4" />}
                                        {downloaded ? 'Downloaded' : 'Download'}
                                    </button>

                                    {/* Send to Team */}
                                    <button
                                        onClick={() => setShowSendPopover(!showSendPopover)}
                                        disabled={exported}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                            exported
                                                ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-500/30'
                                                : 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-500/20'
                                        }`}
                                    >
                                        {exported ? <CheckCircleIcon className="h-4 w-4" /> : <PaperAirplaneIcon className="h-4 w-4" />}
                                        {exported ? `Sent (${selectedRecipients.length})` : 'Send'}
                                    </button>
                                </div>

                                {/* Recipient Popover */}
                                {showSendPopover && (
                                    <div className="absolute bottom-full mb-2 right-0 left-0 bg-card border border-border rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 overflow-hidden">
                                        <div className="px-4 py-2.5 border-b border-border bg-muted/50 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-foreground">Send Report To...</p>
                                                <p className="text-[9px] text-muted-foreground">Select recipients for the inventory report</p>
                                            </div>
                                            <button onClick={() => setShowSendPopover(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                                                <XMarkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                            </button>
                                        </div>
                                        <div className="p-2 space-y-0.5">
                                            {[
                                                { id: 'randy', name: 'Randy Martinez', role: 'Sales Coordinator', initials: 'RM', recommended: true },
                                                { id: 'tara', name: 'Tara Collins', role: 'Project Manager', initials: 'TC', recommended: true },
                                                { id: 'james', name: 'James Mitchell', role: 'Account Executive', initials: 'JM', recommended: false },
                                                { id: 'sarah', name: 'Sarah Chen', role: 'Dealer Principal', initials: 'SC', recommended: false },
                                            ].map(user => {
                                                const isSelected = selectedRecipients.includes(user.id);
                                                return (
                                                    <button key={user.id}
                                                        onClick={() => setSelectedRecipients(prev =>
                                                            prev.includes(user.id) ? prev.filter(r => r !== user.id) : [...prev, user.id]
                                                        )}
                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                                                            isSelected
                                                                ? 'bg-brand-100 dark:bg-brand-500/10 ring-1 ring-brand-300 dark:ring-brand-500/30'
                                                                : 'hover:bg-muted/50'
                                                        }`}>
                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                            isSelected ? 'bg-brand-400 border-brand-400' : 'border-border'
                                                        }`}>
                                                            {isSelected && <CheckCircleIcon className="h-3 w-3 text-zinc-900" />}
                                                        </div>
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                                                            isSelected ? 'bg-brand-300 text-zinc-900' : 'bg-muted text-muted-foreground'
                                                        }`}>{user.initials}</div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-bold text-foreground">{user.name}</p>
                                                            <p className="text-[9px] text-muted-foreground">{user.role}</p>
                                                        </div>
                                                        {user.recommended && (
                                                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-brand-300/50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 font-bold shrink-0">REC</span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="px-3 pb-3 pt-1">
                                            <button
                                                onClick={() => {
                                                    if (selectedRecipients.length === 0) return;
                                                    setShowSendPopover(false);
                                                    setExported(true);
                                                    setSendToast(`Report sent to ${selectedRecipients.length} team member${selectedRecipients.length !== 1 ? 's' : ''}`);
                                                    setTimeout(() => setSendToast(null), 4000);
                                                }}
                                                disabled={selectedRecipients.length === 0}
                                                className={`w-full py-2 rounded-lg text-[11px] font-bold transition-all ${
                                                    selectedRecipients.length > 0
                                                        ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-md'
                                                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                                                }`}
                                            >
                                                {selectedRecipients.length > 0
                                                    ? `Send to ${selectedRecipients.length} Recipient${selectedRecipients.length > 1 ? 's' : ''}`
                                                    : 'Select at least one recipient'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Toast Notification */}
                            {sendToast && (
                                <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-600 dark:bg-green-500 text-white shadow-2xl shadow-green-500/30">
                                        <CheckCircleIcon className="h-5 w-5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold">{sendToast}</p>
                                        </div>
                                        <button onClick={() => setSendToast(null)} className="p-1 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors ml-2">
                                            <XMarkIcon className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Client Portal — inline */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowClientPortal(!showClientPortal)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400"><MapPinIcon className="h-4 w-4" /></div>
                                    <div className="flex-1 text-left">
                                        <span className="text-xs font-bold text-foreground">Client Portal — Mercy Health</span>
                                        <p className="text-[10px] text-muted-foreground">Real-time project status & delivery timeline</p>
                                    </div>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold shrink-0">LIVE</span>
                                    {showClientPortal
                                        ? <ChevronUpIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                        : <ChevronDownIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                    }
                                </button>

                                {showClientPortal && (
                                    <div className="rounded-xl border-2 border-brand-300 dark:border-brand-500/30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="bg-brand-50 dark:bg-brand-500/10 px-4 py-3 border-b border-brand-200 dark:border-brand-500/20 flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-bold text-foreground">Mercy Health Phase 2</span>
                                                <span className="text-[10px] text-muted-foreground ml-2">Client Portal View</span>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {/* Progress */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[11px] font-bold text-foreground">Overall Progress</span>
                                                    <span className="text-sm font-bold text-brand-700 dark:text-brand-400">68%</span>
                                                </div>
                                                <div className="h-3 rounded-full bg-muted overflow-hidden">
                                                    <div className="h-full rounded-full bg-brand-400 transition-all duration-700" style={{ width: '68%' }} />
                                                </div>
                                            </div>

                                            {/* Milestones */}
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Delivery Timeline</span>
                                                {[
                                                    { milestone: 'Procurement Complete', date: 'Mar 15', status: 'done' as const },
                                                    { milestone: 'Warehouse Staging', date: 'Mar 20', status: 'done' as const },
                                                    { milestone: 'Quality Inspection', date: 'Mar 24', status: 'active' as const },
                                                    { milestone: 'Delivery & Install', date: 'Apr 2', status: 'pending' as const },
                                                    { milestone: 'Final Walkthrough', date: 'Apr 5', status: 'pending' as const },
                                                ].map(ms => (
                                                    <div key={ms.milestone} className="flex items-center gap-3 text-[11px]">
                                                        <div className={`w-3 h-3 rounded-full shrink-0 ${
                                                            ms.status === 'done' ? 'bg-green-500' :
                                                            ms.status === 'active' ? 'bg-brand-400 animate-pulse' :
                                                            'bg-muted border border-border'
                                                        }`} />
                                                        <span className={`flex-1 ${ms.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground font-semibold'}`}>{ms.milestone}</span>
                                                        <span className="text-[10px] text-muted-foreground">{ms.date}</span>
                                                        {ms.status === 'done' && <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { label: 'Items Staged', value: '22/32' },
                                                    { label: 'On Schedule', value: 'Yes' },
                                                    { label: 'Est. Completion', value: 'Apr 5' },
                                                ].map(stat => (
                                                    <div key={stat.label} className="p-2 rounded-lg bg-muted/50 border border-border text-center">
                                                        <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                                                        <div className="text-[11px] font-bold text-foreground">{stat.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="px-4 py-2.5 border-t border-brand-200 dark:border-brand-500/20 bg-brand-50/50 dark:bg-brand-500/5">
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                                <CubeIcon className="h-3.5 w-3.5 shrink-0" />
                                                Client's read-only portal view — track progress without calls or emails.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── d3.3 Report Preview Modal ── */}
            {showReportPreview && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowReportPreview(false)}>
                    <div className="w-full max-w-lg max-h-[85vh] bg-card rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="px-5 py-3 border-b border-border bg-muted dark:bg-zinc-800/50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-red-500/10">
                                    <DocumentChartBarIcon className="h-4 w-4 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-foreground">Inventory_Report_MercyHealth_Mar2026.pdf</p>
                                    <p className="text-[9px] text-muted-foreground">Generated Mar 25, 2026 — 4 pages — 2.3 MB</p>
                                </div>
                            </div>
                            <button onClick={() => setShowReportPreview(false)} className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                <XMarkIcon className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>

                        {/* PDF Pages */}
                        <div className="overflow-y-auto flex-1 p-6 bg-card space-y-5">
                            {/* Page 1 — Cover */}
                            <div className="border border-border rounded-lg p-6 space-y-4 bg-card/30">
                                <div className="text-center space-y-1 pb-4 border-b border-zinc-100 dark:border-zinc-700">
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Strata Experience</p>
                                    <p className="text-lg font-bold text-foreground">Inventory Intelligence Report</p>
                                    <p className="text-[11px] text-muted-foreground">Mercy Health Phase 2 — Q1 2026</p>
                                    <p className="text-[10px] text-muted-foreground">Prepared by Dupler Office Furniture — March 25, 2026</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Executive Summary</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: 'Total Stock Value', value: '$1.2M' },
                                            { label: 'Fill Rate', value: '89%' },
                                            { label: 'Backorder Items', value: '42' },
                                            { label: 'Warehouse Util.', value: '68%' },
                                            { label: 'Stock Accuracy', value: '97.2%' },
                                            { label: 'Health Score', value: '78/100' },
                                        ].map(kpi => (
                                            <div key={kpi.label} className="p-2 rounded bg-muted dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                                                <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
                                                <p className="text-[12px] font-bold text-foreground">{kpi.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-[8px] text-zinc-300 dark:text-muted-foreground text-right">Page 1 of 4</p>
                            </div>

                            {/* Page 2 — Warehouse Breakdown */}
                            <div className="border border-border rounded-lg p-6 space-y-4 bg-card/30">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Warehouse Capacity & Forecast</p>
                                <div className="space-y-2">
                                    {[
                                        { name: 'Columbus Main', current: 72, forecast: 89 },
                                        { name: 'Cincinnati Overflow', current: 45, forecast: 48 },
                                        { name: 'Dayton Storage', current: 38, forecast: 38 },
                                    ].map(wh => (
                                        <div key={wh.name} className="flex items-center gap-3">
                                            <span className="text-[10px] text-muted-foreground w-28 shrink-0">{wh.name}</span>
                                            <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
                                                <div className={`h-full rounded-full ${wh.current > 60 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${wh.current}%` }} />
                                            </div>
                                            <span className="text-[10px] font-semibold text-muted-foreground w-8 text-right">{wh.current}%</span>
                                            <span className="text-[9px] text-muted-foreground">→ {wh.forecast}%</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-2">Stock by Category</p>
                                <div className="space-y-1.5">
                                    {[
                                        { cat: 'Seating', available: 400, reserved: 240, backordered: 100 },
                                        { cat: 'Desks', available: 300, reserved: 139, backordered: 50 },
                                        { cat: 'Storage', available: 200, reserved: 980, backordered: 200 },
                                        { cat: 'Tables', available: 278, reserved: 390, backordered: 80 },
                                        { cat: 'Accessories', available: 189, reserved: 480, backordered: 20 },
                                    ].map(c => (
                                        <div key={c.cat} className="flex items-center justify-between text-[10px] py-1 border-b border-zinc-50 dark:border-zinc-800">
                                            <span className="text-muted-foreground w-20">{c.cat}</span>
                                            <span className="text-green-600 dark:text-green-400">{c.available} avail</span>
                                            <span className="text-amber-600 dark:text-amber-400">{c.reserved} resv</span>
                                            <span className="text-red-600 dark:text-red-400">{c.backordered} bo</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[8px] text-zinc-300 dark:text-muted-foreground text-right">Page 2 of 4</p>
                            </div>

                            {/* Page 3 — AI Recommendations */}
                            <div className="border border-border rounded-lg p-6 space-y-4 bg-card/30">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Recommendations</p>
                                {AI_INSIGHTS.map((insight, i) => (
                                    <div key={insight.id} className="p-3 rounded bg-muted dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">{i + 1}. {insight.title}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground">{insight.confidence}%</span>
                                        </div>
                                        <p className="text-[9px] text-muted-foreground">{insight.detail}</p>
                                        <p className="text-[9px] font-semibold text-green-600 dark:text-green-400 mt-1">{insight.impact}</p>
                                    </div>
                                ))}
                                <p className="text-[8px] text-zinc-300 dark:text-muted-foreground text-right">Page 3 of 4</p>
                            </div>

                            {/* Page 4 — Project Status */}
                            <div className="border border-border rounded-lg p-6 space-y-4 bg-card/30">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Project Status — Mercy Health Phase 2</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: 'Items Staged', value: '22/32' },
                                        { label: 'On Schedule', value: 'Yes' },
                                        { label: 'Est. Completion', value: 'Apr 5' },
                                    ].map(stat => (
                                        <div key={stat.label} className="p-2 rounded bg-muted dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-center">
                                            <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                                            <p className="text-[12px] font-bold text-foreground">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-1.5">
                                    {[
                                        { milestone: 'Procurement Complete', date: 'Mar 15', status: 'done' as const },
                                        { milestone: 'Warehouse Staging', date: 'Mar 20', status: 'done' as const },
                                        { milestone: 'Quality Inspection', date: 'Mar 24', status: 'active' as const },
                                        { milestone: 'Delivery & Install', date: 'Apr 2', status: 'pending' as const },
                                        { milestone: 'Final Walkthrough', date: 'Apr 5', status: 'pending' as const },
                                    ].map(ms => (
                                        <div key={ms.milestone} className="flex items-center gap-3 text-[10px]">
                                            <div className={`w-3 h-3 rounded-full shrink-0 ${
                                                ms.status === 'done' ? 'bg-green-500' :
                                                ms.status === 'active' ? 'bg-brand-400 animate-pulse' :
                                                'bg-muted border border-border'
                                            }`} />
                                            <span className={`flex-1 ${ms.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground font-semibold'}`}>{ms.milestone}</span>
                                            <span className="text-[10px] text-muted-foreground">{ms.date}</span>
                                            {ms.status === 'done' && <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />}
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-700 text-center">
                                    <p className="text-[8px] text-muted-foreground">Confidential — Dupler Office Furniture © 2026</p>
                                    <p className="text-[8px] text-muted-foreground">Generated by Strata Experience Platform</p>
                                </div>
                                <p className="text-[8px] text-zinc-300 dark:text-muted-foreground text-right">Page 4 of 4</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-border bg-muted dark:bg-zinc-800/50 flex items-center justify-between shrink-0">
                            <span className="text-[10px] text-muted-foreground">4 pages</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        if (!reportDownloaded) {
                                            setReportDownloaded(true);
                                            setReportActionToast('PDF downloaded — Inventory_Report_MercyHealth_Mar2026.pdf');
                                            setTimeout(() => setReportActionToast(null), 4000);
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1.5 ${
                                        reportDownloaded
                                            ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30'
                                            : 'bg-zinc-200 dark:bg-zinc-700 text-muted-foreground hover:bg-zinc-300 dark:hover:bg-zinc-600'
                                    }`}
                                >
                                    {reportDownloaded ? <CheckCircleIcon className="h-3.5 w-3.5" /> : <DocumentArrowDownIcon className="h-3.5 w-3.5" />}
                                    {reportDownloaded ? 'Downloaded' : 'Download PDF'}
                                </button>
                                <button onClick={() => setShowReportPreview(false)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-brand-400 hover:bg-brand-500 text-zinc-900 transition-colors">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── d3.3 Action Toast ── */}
            {reportActionToast && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[210] animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="px-4 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold shadow-lg flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4" />
                        {reportActionToast}
                    </div>
                </div>
            )}

            {/* ── PDF Preview Modal ── */}
            {showPdfPreview && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowPdfPreview(false)}>
                    <div className="w-full max-w-lg max-h-[85vh] bg-card rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col" onClick={e => e.stopPropagation()}>
                        {/* PDF Header */}
                        <div className="px-5 py-3 border-b border-border bg-muted dark:bg-zinc-800/50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-red-500/10">
                                    <DocumentChartBarIcon className="h-4 w-4 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-foreground">Inventory_Report_MercyHealth_Mar2026.pdf</p>
                                    <p className="text-[9px] text-muted-foreground">Generated Mar 25, 2026 — 4 pages — 2.3 MB</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPdfPreview(false)} className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                <XMarkIcon className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>

                        {/* PDF Content */}
                        <div className="overflow-y-auto flex-1 p-6 bg-card space-y-5">
                            {/* Page 1 — Cover */}
                            <div className="border border-border rounded-lg p-6 space-y-4 bg-card/30">
                                <div className="text-center space-y-1 pb-4 border-b border-zinc-100 dark:border-zinc-700">
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Strata Experience</p>
                                    <p className="text-lg font-bold text-foreground">Inventory Intelligence Report</p>
                                    <p className="text-[11px] text-muted-foreground">Mercy Health Phase 2 — Q1 2026</p>
                                    <p className="text-[10px] text-muted-foreground">Prepared by Dupler Office Furniture — March 25, 2026</p>
                                </div>

                                {/* Summary KPIs */}
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Executive Summary</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: 'Total Stock Value', value: '$1.2M' },
                                            { label: 'Fill Rate', value: '89%' },
                                            { label: 'Backorder Items', value: '42' },
                                            { label: 'Warehouse Util.', value: '68%' },
                                            { label: 'Stock Accuracy', value: '97.2%' },
                                            { label: 'Health Score', value: '78/100' },
                                        ].map(kpi => (
                                            <div key={kpi.label} className="p-2 rounded bg-muted dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                                                <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
                                                <p className="text-[12px] font-bold text-foreground">{kpi.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-[8px] text-zinc-300 dark:text-muted-foreground text-right">Page 1 of 4</p>
                            </div>

                            {/* Page 2 — Warehouse Breakdown */}
                            <div className="border border-border rounded-lg p-6 space-y-4 bg-card/30">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Warehouse Capacity & Forecast</p>
                                <div className="space-y-2">
                                    {[
                                        { name: 'Columbus Main', current: 72, forecast: 89 },
                                        { name: 'Cincinnati Overflow', current: 45, forecast: 48 },
                                        { name: 'Dayton Storage', current: 38, forecast: 38 },
                                    ].map(wh => (
                                        <div key={wh.name} className="flex items-center gap-3">
                                            <span className="text-[10px] text-muted-foreground w-28 shrink-0">{wh.name}</span>
                                            <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
                                                <div className={`h-full rounded-full ${wh.current > 60 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${wh.current}%` }} />
                                            </div>
                                            <span className="text-[10px] font-semibold text-muted-foreground w-8 text-right">{wh.current}%</span>
                                            <span className="text-[9px] text-muted-foreground">→ {wh.forecast}%</span>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-2">Stock by Category</p>
                                <div className="space-y-1.5">
                                    {[
                                        { cat: 'Seating', available: 400, reserved: 240, backordered: 100 },
                                        { cat: 'Desks', available: 300, reserved: 139, backordered: 50 },
                                        { cat: 'Storage', available: 200, reserved: 980, backordered: 200 },
                                        { cat: 'Tables', available: 278, reserved: 390, backordered: 80 },
                                        { cat: 'Accessories', available: 189, reserved: 480, backordered: 20 },
                                    ].map(c => (
                                        <div key={c.cat} className="flex items-center justify-between text-[10px] py-1 border-b border-zinc-50 dark:border-zinc-800">
                                            <span className="text-muted-foreground w-20">{c.cat}</span>
                                            <span className="text-green-600 dark:text-green-400">{c.available} avail</span>
                                            <span className="text-amber-600 dark:text-amber-400">{c.reserved} resv</span>
                                            <span className="text-red-600 dark:text-red-400">{c.backordered} bo</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[8px] text-zinc-300 dark:text-muted-foreground text-right">Page 2 of 4</p>
                            </div>

                            {/* Page 3 — AI Recommendations */}
                            <div className="border border-border rounded-lg p-6 space-y-4 bg-card/30">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Recommendations</p>
                                {AI_INSIGHTS.map((insight, i) => (
                                    <div key={insight.id} className="p-3 rounded bg-muted dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">{i + 1}. {insight.title}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground">{insight.confidence}%</span>
                                        </div>
                                        <p className="text-[9px] text-muted-foreground">{insight.detail}</p>
                                        <p className="text-[9px] font-semibold text-green-600 dark:text-green-400 mt-1">{insight.impact}</p>
                                    </div>
                                ))}
                                <p className="text-[8px] text-zinc-300 dark:text-muted-foreground text-right">Page 3 of 4</p>
                            </div>

                            {/* Page 4 — Project Status */}
                            <div className="border border-border rounded-lg p-6 space-y-4 bg-card/30">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Project Status — Mercy Health Phase 2</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="p-2 rounded bg-muted dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-center">
                                        <p className="text-[9px] text-muted-foreground">Items Staged</p>
                                        <p className="text-[12px] font-bold text-foreground">22/32</p>
                                    </div>
                                    <div className="p-2 rounded bg-muted dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-center">
                                        <p className="text-[9px] text-muted-foreground">On Schedule</p>
                                        <p className="text-[12px] font-bold text-green-600 dark:text-green-400">Yes</p>
                                    </div>
                                    <div className="p-2 rounded bg-muted dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-center">
                                        <p className="text-[9px] text-muted-foreground">Est. Completion</p>
                                        <p className="text-[12px] font-bold text-foreground">Apr 5</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    {[
                                        { milestone: 'Procurement Complete', date: 'Mar 15', done: true },
                                        { milestone: 'Warehouse Staging', date: 'Mar 20', done: true },
                                        { milestone: 'Quality Inspection', date: 'Mar 24', done: false },
                                        { milestone: 'Delivery & Install', date: 'Apr 2', done: false },
                                        { milestone: 'Final Walkthrough', date: 'Apr 5', done: false },
                                    ].map(ms => (
                                        <div key={ms.milestone} className="flex items-center gap-2 text-[10px]">
                                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${ms.done ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-600'}`} />
                                            <span className={`flex-1 ${ms.done ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>{ms.milestone}</span>
                                            <span className="text-muted-foreground">{ms.date}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-700 text-center">
                                    <p className="text-[8px] text-muted-foreground">Confidential — Dupler Office Furniture © 2026</p>
                                    <p className="text-[8px] text-muted-foreground">Generated by Strata Experience Platform</p>
                                </div>
                                <p className="text-[8px] text-zinc-300 dark:text-muted-foreground text-right">Page 4 of 4</p>
                            </div>
                        </div>

                        {/* PDF Footer */}
                        <div className="px-5 py-3 border-t border-border bg-muted dark:bg-zinc-800/50 flex items-center justify-between shrink-0">
                            <span className="text-[10px] text-muted-foreground">4 pages</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setShowPdfPreview(false);
                                        if (!downloaded) {
                                            setDownloaded(true);
                                            setSendToast('PDF downloaded — Inventory_Report_MercyHealth_Mar2026.pdf');
                                            setTimeout(() => setSendToast(null), 4000);
                                        }
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-zinc-200 dark:bg-zinc-700 text-muted-foreground hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors flex items-center gap-1.5"
                                >
                                    <DocumentArrowDownIcon className="h-3.5 w-3.5" /> Download PDF
                                </button>
                                <button onClick={() => setShowPdfPreview(false)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-brand-400 hover:bg-brand-500 text-zinc-900 transition-colors">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
