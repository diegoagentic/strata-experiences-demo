// ═══════════════════════════════════════════════════════════════════════════════
// Dupler — Flow 2: Warehouse & Inventory Intelligence
// Steps: d2.1 (Health), d2.2 (Receiving), d2.3 (Price), d2.4 (Sync),
//        d2.5 (In-Transit), d2.6 (Claims), d2.7 (Dealer Review in Dashboard.tsx)
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDemo } from '../../context/DemoContext';
import { AIAgentAvatar } from './DemoAvatars';
import {
    QrCodeIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    TruckIcon,
    ChartBarIcon,
    MapPinIcon,
    CurrencyDollarIcon,
    ExclamationCircleIcon,
    ClipboardDocumentCheckIcon,
    XCircleIcon,
    CubeIcon,
    ShieldCheckIcon,
    MapIcon,
    LinkIcon,
    MagnifyingGlassIcon,
    BellAlertIcon,
    ClockIcon,
    ArrowUturnLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { DUPLER_STEP_TIMING, type DuplerStepTiming } from '../../config/profiles/dupler';

// ─── Types ───────────────────────────────────────────────────────────────────

type HealthPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results';
type ReceivingPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results';
type PricePhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results';
type SyncPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results';
type TransitPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results';
type ClaimsPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results';

interface AgentVis { name: string; detail: string; visible: boolean; done: boolean; }

// ─── Mock Data ───────────────────────────────────────────────────────────────

// d2.1 — Warehouse Health
const WAREHOUSE_DATA = [
    { name: 'Columbus Main', current: 72, forecast: 89, items: 1080, alert: true, alertText: 'Mercy Health Phase 2 arriving next week — projected overflow' },
    { name: 'Cincinnati Overflow', current: 45, forecast: 48, items: 480, alert: false, alertText: '' },
    { name: 'Dayton Storage', current: 38, forecast: 38, items: 280, alert: false, alertText: '' },
];

const RELOCATION_RECS = [
    { from: 'Columbus — Staging Bay C', to: 'Cincinnati — Overflow Bay 2', items: 55, type: 'General Stock (non-project)', savings: '$2,200/mo' },
    { from: 'Columbus — Rack 8-10', to: 'Dayton — Bay 4', items: 30, type: 'Archived fixtures (60+ days)', savings: '$1,400/mo' },
];

// d2.2 — Receiving
interface ReceivingItem {
    line: number; sku: string; description: string; poQty: number; receivedQty: number;
    status: 'matched' | 'missing' | 'wrong'; condition: 'pristine' | 'inspect' | 'damaged' | null;
    poRef: string; note?: string;
}

const RECEIVING_ITEMS: ReceivingItem[] = [
    { line: 1, sku: 'AS-AC-7100', description: 'Allsteel Acuity Task Chair', poQty: 8, receivedQty: 8, status: 'matched', condition: 'pristine', poRef: 'PO-2026-0389' },
    { line: 2, sku: 'AS-ST-2200', description: 'Allsteel Stride Bench 60"', poQty: 4, receivedQty: 4, status: 'matched', condition: 'pristine', poRef: 'PO-2026-0389' },
    { line: 3, sku: 'AS-TL-3300', description: 'Allsteel Terrace Lounge', poQty: 6, receivedQty: 6, status: 'matched', condition: 'inspect', poRef: 'PO-2026-0389', note: 'Minor packaging damage — needs QC inspection' },
    { line: 4, sku: 'AS-BD-4400', description: 'Allsteel Beyond Open Desk', poQty: 10, receivedQty: 10, status: 'matched', condition: 'pristine', poRef: 'PO-2026-0389' },
    { line: 5, sku: 'AS-PC-5500', description: 'Allsteel Park Collaborative Table', poQty: 2, receivedQty: 0, status: 'missing', condition: null, poRef: 'PO-2026-0389', note: 'Backorder — ETA 2 weeks' },
    { line: 6, sku: 'AS-AC-7100-F', description: 'Acuity Chair — Fog Finish', poQty: 2, receivedQty: 2, status: 'wrong', condition: 'inspect', poRef: 'PO-2026-0389', note: 'Ordered Graphite, received Fog — Claim CLM-2026-052' },
];

const MATCHED_RECEIVING = RECEIVING_ITEMS.filter(i => i.status === 'matched');
const EXCEPTIONS_RECEIVING = RECEIVING_ITEMS.filter(i => i.status !== 'matched');

// d2.3 — Price Verification
const PO_PRICE_CHECKS = [
    // Page 1
    { item: 'Acuity Task Chair (×8)', mfr: 'Allsteel', poPrice: 685, currentPrice: 715, change: '+4.4%', margin: '29.2%', flag: false },
    { item: 'Stride Bench 60" (×4)', mfr: 'Allsteel', poPrice: 920, currentPrice: 920, change: '0%', margin: '34.1%', flag: false },
    { item: 'Terrace Lounge (×6)', mfr: 'Allsteel', poPrice: 1450, currentPrice: 1520, change: '+4.8%', margin: '23.8%', flag: true },
    { item: 'Beyond Open Desk (×10)', mfr: 'Allsteel', poPrice: 780, currentPrice: 780, change: '0%', margin: '32.5%', flag: false },
    { item: 'Park Table (×2)', mfr: 'Allsteel', poPrice: 2100, currentPrice: 2240, change: '+6.7%', margin: '21.4%', flag: true },
    // Page 2
    { item: 'Involve Workstation 66" (×12)', mfr: 'Allsteel', poPrice: 2450, currentPrice: 2525, change: '+3.1%', margin: '31.0%', flag: false },
    { item: 'Executive Credenza 72" (×4)', mfr: 'Gunlock', poPrice: 3200, currentPrice: 3200, change: '0%', margin: '38.2%', flag: false },
    { item: 'Conference Table 96" (×2)', mfr: 'Gunlock', poPrice: 4500, currentPrice: 4500, change: '0%', margin: '36.5%', flag: false },
    { item: 'Waveworks Desk 60" (×10)', mfr: 'National', poPrice: 2080, currentPrice: 2180, change: '+4.8%', margin: '28.4%', flag: false },
    { item: 'Realize Desk 60" (×4)', mfr: 'National', poPrice: 1500, currentPrice: 1580, change: '+5.3%', margin: '27.1%', flag: false },
    // Page 3
    { item: 'Exhibit Collab Table (×4)', mfr: 'National', poPrice: 1180, currentPrice: 1240, change: '+5.1%', margin: '30.6%', flag: false },
    { item: 'Lobby Lounge Table (×3)', mfr: 'National', poPrice: 840, currentPrice: 890, change: '+6.0%', margin: '26.8%', flag: false },
    { item: 'Filing Cabinet 3-Drawer (×16)', mfr: 'Allsteel', poPrice: 420, currentPrice: 420, change: '0%', margin: '35.8%', flag: false },
    { item: 'Monitor Arm Dual (×24)', mfr: 'Allsteel', poPrice: 185, currentPrice: 195, change: '+5.4%', margin: '42.1%', flag: false },
    { item: 'Task Light LED (×24)', mfr: 'Allsteel', poPrice: 125, currentPrice: 125, change: '0%', margin: '48.3%', flag: false },
];
const PO_PRICE_PAGE_SIZE = 5;

const MARGIN_ALERTS = [
    {
        id: 'ma1', item: 'Terrace Lounge (×6)', mfr: 'Allsteel', margin: '23.8%', threshold: '25%',
        poPrice: 1450, currentPrice: 1520, change: '+4.8%',
        reason: 'Q1 2026 price increase not reflected in PO — margin dropped below 25% dealer minimum.',
        aiNote: 'Allsteel published +4.8% effective Jan 15, 2026. PO was issued Dec 2025 at prior pricing.',
    },
    {
        id: 'ma2', item: 'Park Table (×2)', mfr: 'Allsteel', margin: '21.4%', threshold: '25%',
        poPrice: 2100, currentPrice: 2240, change: '+6.7%',
        reason: 'Material surcharge added — raw steel cost adjustment pushed margin below threshold.',
        aiNote: 'Allsteel Bulletin #2026-03: +6.7% material surcharge on Park series. Recommend renegotiating PO or applying client markup.',
    },
];

const TAX_COMPLIANCE = [
    { region: 'Hamilton County, OH', rate: '7.8%', applies: 'Mercy Health campus delivery', status: 'verified' as const },
    { region: 'Cook County, IL', rate: '6.7%', applies: 'Cross-dock items from National', status: 'requires-review' as const },
];

// d2.4 — Multi-Warehouse Sync
const LOCATION_STATUS = [
    { name: 'Columbus Main', type: 'Warehouse' as const, items: 1080, inTransit: 22, status: 'Active', utilization: 72 },
    { name: 'Cincinnati Overflow', type: 'Warehouse' as const, items: 480, pendingQC: 6, status: 'Active', utilization: 45 },
    { name: 'Dayton Storage', type: 'Warehouse' as const, items: 280, status: 'Active', utilization: 38 },
    { name: 'Mercy Health — Phase 2 Site', type: 'Job Site' as const, items: 0, receiving: true, status: 'Receiving' },
    { name: 'Mercy Health — Phase 1 (Complete)', type: 'Job Site' as const, items: 120, status: 'Installed' },
];

const SHIPMENTS = [
    { id: 'SH-001', carrier: 'FedEx Freight', manufacturer: 'Allsteel', itemCount: 14, eta: 'Today, 10:00 AM', status: 'arriving-today' as const, dock: 'Dock 1', hasConflict: true },
    { id: 'SH-002', carrier: 'XPO Logistics', manufacturer: 'Kimball', itemCount: 8, eta: 'Today, 10:00 AM', status: 'arriving-today' as const, dock: 'Dock 1', hasConflict: true },
    { id: 'SH-003', carrier: 'Old Dominion', manufacturer: 'National', itemCount: 6, eta: 'Tomorrow, 2 PM', status: 'on-time' as const },
    { id: 'SH-004', carrier: 'SAIA', manufacturer: 'Indiana Furniture', itemCount: 9, eta: 'Thu, 11 AM', status: 'delayed' as const, delayReason: 'Weather hold — Memphis hub (+2 days)' },
    { id: 'SH-005', carrier: 'Estes Express', manufacturer: 'HNI (Gunlocke)', itemCount: 5, eta: 'Fri, 9 AM', status: 'on-time' as const },
];

// d2.5 — Vendor Claims
const VENDOR_CLAIMS = [
    { id: 'CLM-2026-052', item: 'Acuity Chair — Fog (×2)', mfr: 'Allsteel', type: 'wrong-finish' as const, status: 'RMA Approved', credit: '$1,370', action: 'Return & Replace',
      aiNote: 'RMA #RMA-2026-1184 approved by Allsteel on Mar 20. Replacement ETA: 5 business days. Original Graphite finish confirmed in PO.' },
    { id: 'CLM-2026-048', item: 'Terrace Lounge (×1)', mfr: 'Allsteel', type: 'packaging-damage' as const, status: 'Under Review', credit: '$480', action: 'Inspect & Decide',
      aiNote: 'Damage photos uploaded Mar 18. Allsteel reviewing — typical resolution: 3-5 days. Item is functional but cosmetically impaired (corner dent).' },
    { id: 'CLM-2026-045', item: 'Stride Bench (×1)', mfr: 'Allsteel', type: 'warranty-claim' as const, status: 'Warranty Valid', credit: '$920', action: 'Repair in Place',
      aiNote: 'Warranty expires Apr 28 — 35 days remaining. Height mechanism issue reported. Allsteel offers on-site repair for this model.' },
];

const WARRANTY_ALERTS = [
    { item: 'Beyond Desk (×4)', mfr: 'Allsteel', daysLeft: 15, value: '$3,120', action: 'Extend' },
    { item: 'Acuity Chair (×6)', mfr: 'Allsteel', daysLeft: 30, value: '$4,110', action: 'Review' },
    { item: 'Park Table (×1)', mfr: 'Allsteel', daysLeft: 45, value: '$2,100', action: 'Monitor' },
    { item: 'National Credenza (×2)', mfr: 'National', daysLeft: 60, value: '$3,360', action: 'Monitor' },
];

// d2.1 — Consignment Aging ("Wall of Shame")
const CONSIGNMENT_AGING = [
    { item: 'Executive Desk', client: 'Mercy Health Phase 1', daysOnSite: 180, value: 4200, status: 'overdue' as const, action: 'Return to warehouse or bill client' },
    { item: 'Conference Table Set', client: 'Downtown Office Group', daysOnSite: 120, value: 6800, status: 'overdue' as const, action: 'Schedule pickup — lease expired' },
    { item: 'Lounge Chairs (×4)', client: 'Regional Medical Center', daysOnSite: 90, value: 3400, status: 'at-risk' as const, action: 'Contact client — billing starts day 91' },
];

// d2.1 — Allocation Conflicts
const ALLOCATION_CONFLICTS = [
    { item: 'Acuity Task Chairs', projects: ['Mercy Health Phase 2', 'Downtown Office'], needed: 14, available: 12, gap: 2 },
    { item: 'Stride Bench 60"', projects: ['Mercy Health Phase 2', 'Regional Medical'], needed: 8, available: 6, gap: 2 },
];

// d2.5 — In-Transit Intelligence
const FREIGHT_AUDIT = [
    { carrier: 'SAIA', shipmentId: 'SH-004', quotedCost: 1200, billedCost: 1540, overcharge: 340, reason: 'Accessorial charge not in BOL' },
];

const SPLIT_SHIPMENT = [
    { poId: 'PO-2026-0389', totalItems: 30, received: 28, backordered: 2, backorderItems: [{ name: 'Park Collaborative Table', qty: 2, eta: 'Apr 7' }] },
];

const PREDICTIVE_ALERTS = [
    { shipmentId: 'SH-004', carrier: 'SAIA', manufacturer: 'Indiana Furniture', prediction: 'weather-delay' as const, delayDays: 2, confidence: 87, impact: '9 items for Mercy Health Phase 2' },
];

// ─── Agents ──────────────────────────────────────────────────────────────────

const HEALTH_AGENTS: AgentVis[] = [
    { name: 'WarehouseScanner', detail: 'Scanning 1,840 items across 3 warehouses...', visible: false, done: false },
    { name: 'CapacityForecaster', detail: 'Columbus → 89% in 2 weeks (Mercy Health Phase 2)...', visible: false, done: false },
    { name: 'OverflowOptimizer', detail: 'Identifying 85 items for relocation to Cincinnati...', visible: false, done: false },
    { name: 'CostAnalyzer', detail: 'Calculating storage savings — $3,600/month...', visible: false, done: false },
    { name: 'ReportGenerator', detail: 'Generating warehouse health report...', visible: false, done: false },
];

const RECEIVING_AGENTS: AgentVis[] = [
    { name: 'QRScanner', detail: 'Scanning 30 items from PO-2026-0389...', visible: false, done: false },
    { name: 'POMatchEngine', detail: 'Cross-referencing — 28/30 matched...', visible: false, done: false },
    { name: 'ConditionScanner', detail: '26 pristine, 3 inspect, 1 damaged...', visible: false, done: false },
    { name: 'ExceptionHandler', detail: '1 missing + 1 wrong finish — claims drafted...', visible: false, done: false },
    { name: 'CatalogUpdater', detail: 'Updating warehouse catalog — 28 items logged...', visible: false, done: false },
];

const PRICE_AGENTS: AgentVis[] = [
    { name: 'PriceListScanner', detail: 'Scanning Allsteel, Kimball, National Q1 2026...', visible: false, done: false },
    { name: 'CostBasisChecker', detail: '3 items with cost changes detected...', visible: false, done: false },
    { name: 'MarginCalculator', detail: '2 items below 25% margin — flagged...', visible: false, done: false },
    { name: 'ComplianceReporter', detail: 'Generating price verification report...', visible: false, done: false },
];

const SYNC_AGENTS: AgentVis[] = [
    { name: 'WarehouseSync', detail: 'Synchronizing Columbus + Cincinnati + Dayton...', visible: false, done: false },
    { name: 'DockScheduler', detail: 'Dock 1 conflict resolved — SH-002 → Dock 3...', visible: false, done: false },
    { name: 'RouteOptimizer', detail: '2 Allsteel deliveries consolidated — $1,200 savings...', visible: false, done: false },
    { name: 'MapUpdater', detail: 'Updating real-time tracking for all assets...', visible: false, done: false },
];

const CLAIMS_AGENTS: AgentVis[] = [
    { name: 'ClaimTracker', detail: '3 active claims across Allsteel, National...', visible: false, done: false },
    { name: 'ReturnAnalyzer', detail: 'CLM-2026-052 RMA approved — replacement shipping...', visible: false, done: false },
    { name: 'ReplacementFinder', detail: 'Graphite replacement ETA 3 days...', visible: false, done: false },
    { name: 'CreditProcessor', detail: '$2,770 total credits processing...', visible: false, done: false },
    { name: 'WarrantyChecker', detail: '4 items approaching warranty expiry...', visible: false, done: false },
];

const TRANSIT_AGENTS: AgentVis[] = [
    { name: 'TransitTracker', detail: '5 active shipments across 3 carriers...', visible: false, done: false },
    { name: 'PredictiveAlertEngine', detail: 'Weather delay predicted — SH-004 +2 days...', visible: false, done: false },
    { name: 'FreightAuditor', detail: 'SH-004 overcharge detected — $340...', visible: false, done: false },
    { name: 'SplitReconciler', detail: 'PO-2026-0389: 28/30 received, 2 backordered...', visible: false, done: false },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface DuplerWarehouseProps {
    onNavigate: (page: string) => void;
}

export default function DuplerWarehouse({ onNavigate }: DuplerWarehouseProps) {
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

    // ── d2.1 State: Warehouse Health ──
    const [hlthPhase, setHlthPhase] = useState<HealthPhase>('idle');
    const hlthRef = useRef(hlthPhase);
    useEffect(() => { hlthRef.current = hlthPhase; }, [hlthPhase]);
    const [hlthAgents, setHlthAgents] = useState(HEALTH_AGENTS.map(a => ({ ...a })));
    const [hlthProgress, setHlthProgress] = useState(0);

    // ── d2.2 State: Receiving ──
    const [recPhase, setRecPhase] = useState<ReceivingPhase>('idle');
    const recRef = useRef(recPhase);
    useEffect(() => { recRef.current = recPhase; }, [recPhase]);
    const [recAgents, setRecAgents] = useState(RECEIVING_AGENTS.map(a => ({ ...a })));
    const [recProgress, setRecProgress] = useState(0);
    const [exceptionActions, setExceptionActions] = useState<Record<number, string>>({});

    // ── d2.3 State: Price Verification ──
    const [pricePhase, setPricePhase] = useState<PricePhase>('idle');
    const priceRef = useRef(pricePhase);
    useEffect(() => { priceRef.current = pricePhase; }, [pricePhase]);
    const [priceAgents, setPriceAgents] = useState(PRICE_AGENTS.map(a => ({ ...a })));
    const [priceProgress, setPriceProgress] = useState(0);
    const [pricePage, setPricePage] = useState(0);
    const priceTotalPages = Math.ceil(PO_PRICE_CHECKS.length / PO_PRICE_PAGE_SIZE);
    const pricePageItems = PO_PRICE_CHECKS.slice(pricePage * PO_PRICE_PAGE_SIZE, (pricePage + 1) * PO_PRICE_PAGE_SIZE);
    const [marginActions, setMarginActions] = useState<Record<string, string>>({});
    const allMarginResolved = Object.keys(marginActions).length >= MARGIN_ALERTS.length;

    // ── d2.4 State: Multi-Warehouse Sync ──
    const [syncPhase, setSyncPhase] = useState<SyncPhase>('idle');
    const syncRef = useRef(syncPhase);
    useEffect(() => { syncRef.current = syncPhase; }, [syncPhase]);
    const [syncAgents, setSyncAgents] = useState(SYNC_AGENTS.map(a => ({ ...a })));
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncCardsAnimated, setSyncCardsAnimated] = useState(false);

    // ── d2.5 State: In-Transit Intelligence ──
    const [transitPhase, setTransitPhase] = useState<TransitPhase>('idle');
    const transitRef = useRef(transitPhase);
    useEffect(() => { transitRef.current = transitPhase; }, [transitPhase]);
    const [transitAgents, setTransitAgents] = useState(TRANSIT_AGENTS.map(a => ({ ...a })));
    const [transitProgress, setTransitProgress] = useState(0);
    const [alertAction, setAlertAction] = useState<string | null>(null);
    const [freightAction, setFreightAction] = useState<string | null>(null);

    // ── d2.6 State: Vendor Claims ──
    const [claimsPhase, setClaimsPhase] = useState<ClaimsPhase>('idle');
    const claimsRef = useRef(claimsPhase);
    useEffect(() => { claimsRef.current = claimsPhase; }, [claimsPhase]);
    const [claimsAgents, setClaimsAgents] = useState(CLAIMS_AGENTS.map(a => ({ ...a })));
    const [claimsProgress, setClaimsProgress] = useState(0);
    const [claimActions, setClaimActions] = useState<Record<string, string>>({});
    const [warrantyActions, setWarrantyActions] = useState<Record<number, string>>({});
    const allClaimsResolved = Object.keys(claimActions).length >= VENDOR_CLAIMS.length && Object.keys(warrantyActions).length >= WARRANTY_ALERTS.length;

    // ── Timing helpers ──
    const tp = (id: string): DuplerStepTiming => DUPLER_STEP_TIMING[id] || DUPLER_STEP_TIMING['d2.1'];

    // ═══════════════════════════════════════════════════════════════════════════
    // Standard phase orchestration helper
    // ═══════════════════════════════════════════════════════════════════════════

    const runAgentPipeline = (
        agents: AgentVis[],
        setAgents: React.Dispatch<React.SetStateAction<AgentVis[]>>,
        setProgress: React.Dispatch<React.SetStateAction<number>>,
        timing: DuplerStepTiming,
        onDone: () => void,
    ) => {
        setAgents(agents.map(a => ({ ...a })));
        setProgress(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setProgress(100), 50));
        agents.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * timing.agentStagger));
            timers.push(setTimeout(pauseAware(() => setAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * timing.agentStagger + timing.agentDone));
        });
        const total = agents.length * timing.agentStagger + timing.agentDone;
        timers.push(setTimeout(pauseAware(onDone), total));
        return timers;
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // d2.1: Warehouse Health & Capacity Forecast (Expert, interactive)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd2.1') { setHlthPhase('idle'); return; }
        setHlthPhase('idle');
        setHlthAgents(HEALTH_AGENTS.map(a => ({ ...a })));
        setHlthProgress(0);
        const t = tp('d2.1');
        const timer = setTimeout(pauseAware(() => setHlthPhase('notification')), t.notifDelay);
        return () => clearTimeout(timer);
    }, [stepId]);

    const handleHlthStart = () => setHlthPhase('processing');

    useEffect(() => {
        if (hlthPhase !== 'processing') return;
        const timers = runAgentPipeline(HEALTH_AGENTS, setHlthAgents, setHlthProgress, tp('d2.1'), () => setHlthPhase('breathing'));
        return () => timers.forEach(clearTimeout);
    }, [hlthPhase]);

    useEffect(() => {
        if (hlthPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setHlthPhase('revealed')), tp('d2.1').breathing);
        return () => clearTimeout(t);
    }, [hlthPhase]);

    useEffect(() => {
        if (hlthPhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setHlthPhase('results')), 800);
        return () => clearTimeout(t);
    }, [hlthPhase]);

    // ═══════════════════════════════════════════════════════════════════════════
    // d2.2: Receiving & Condition Assessment (Expert, interactive)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd2.2') { setRecPhase('idle'); return; }
        setRecPhase('idle');
        setRecAgents(RECEIVING_AGENTS.map(a => ({ ...a })));
        setRecProgress(0);
        const t = tp('d2.2');
        const timer = setTimeout(pauseAware(() => setRecPhase('notification')), t.notifDelay);
        return () => clearTimeout(timer);
    }, [stepId]);

    const handleRecStart = () => setRecPhase('processing');

    useEffect(() => {
        if (recPhase !== 'processing') return;
        const timers = runAgentPipeline(RECEIVING_AGENTS, setRecAgents, setRecProgress, tp('d2.2'), () => setRecPhase('breathing'));
        return () => timers.forEach(clearTimeout);
    }, [recPhase]);

    useEffect(() => {
        if (recPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setRecPhase('revealed')), tp('d2.2').breathing);
        return () => clearTimeout(t);
    }, [recPhase]);

    useEffect(() => {
        if (recPhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setRecPhase('results')), 800);
        return () => clearTimeout(t);
    }, [recPhase]);

    // ═══════════════════════════════════════════════════════════════════════════
    // d2.3: PO Price Verification & Tax Compliance (Expert, interactive)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd2.3') { setPricePhase('idle'); return; }
        setPricePhase('idle');
        setPriceAgents(PRICE_AGENTS.map(a => ({ ...a })));
        setPriceProgress(0);
        const t = tp('d2.3');
        const timer = setTimeout(pauseAware(() => setPricePhase('notification')), t.notifDelay);
        return () => clearTimeout(timer);
    }, [stepId]);

    const handlePriceStart = () => setPricePhase('processing');

    useEffect(() => {
        if (pricePhase !== 'processing') return;
        const timers = runAgentPipeline(PRICE_AGENTS, setPriceAgents, setPriceProgress, tp('d2.3'), () => setPricePhase('breathing'));
        return () => timers.forEach(clearTimeout);
    }, [pricePhase]);

    useEffect(() => {
        if (pricePhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setPricePhase('revealed')), tp('d2.3').breathing);
        return () => clearTimeout(t);
    }, [pricePhase]);

    useEffect(() => {
        if (pricePhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setPricePhase('results')), 800);
        return () => clearTimeout(t);
    }, [pricePhase]);

    // ═══════════════════════════════════════════════════════════════════════════
    // d2.4: Multi-Warehouse Sync (System, auto 10s)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd2.4') { setSyncPhase('idle'); return; }
        setSyncPhase('idle');
        setSyncAgents(SYNC_AGENTS.map(a => ({ ...a })));
        setSyncProgress(0);
        setSyncCardsAnimated(false);
        const t = tp('d2.4');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setSyncPhase('notification')), t.notifDelay));
        timers.push(setTimeout(pauseAware(() => { if (syncRef.current === 'notification') setSyncPhase('processing'); }), t.notifDelay + t.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    useEffect(() => {
        if (syncPhase !== 'processing') return;
        const timers = runAgentPipeline(SYNC_AGENTS, setSyncAgents, setSyncProgress, tp('d2.4'), () => setSyncPhase('breathing'));
        return () => timers.forEach(clearTimeout);
    }, [syncPhase]);

    useEffect(() => {
        if (syncPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setSyncPhase('revealed')), tp('d2.4').breathing);
        return () => clearTimeout(t);
    }, [syncPhase]);

    useEffect(() => {
        if (syncPhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setSyncPhase('results')), 2000);
        return () => clearTimeout(t);
    }, [syncPhase]);

    // Animate location cards
    useEffect(() => {
        if (syncPhase !== 'results') return;
        const t1 = setTimeout(pauseAware(() => setSyncCardsAnimated(true)), 2000);
        return () => { clearTimeout(t1); };
    }, [syncPhase]);

    // ═══════════════════════════════════════════════════════════════════════════
    // d2.5: In-Transit Intelligence & Freight Audit (Expert, interactive)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd2.5') { setTransitPhase('idle'); setAlertAction(null); setFreightAction(null); return; }
        setTransitPhase('idle');
        setTransitAgents(TRANSIT_AGENTS.map(a => ({ ...a })));
        setTransitProgress(0);
        setAlertAction(null);
        setFreightAction(null);
        const t = tp('d2.5');
        const timer = setTimeout(pauseAware(() => setTransitPhase('notification')), t.notifDelay);
        return () => clearTimeout(timer);
    }, [stepId]);

    const handleTransitStart = () => setTransitPhase('processing');

    useEffect(() => {
        if (transitPhase !== 'processing') return;
        const timers = runAgentPipeline(TRANSIT_AGENTS, setTransitAgents, setTransitProgress, tp('d2.5'), () => setTransitPhase('breathing'));
        return () => timers.forEach(clearTimeout);
    }, [transitPhase]);

    useEffect(() => {
        if (transitPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setTransitPhase('revealed')), tp('d2.5').breathing);
        return () => clearTimeout(t);
    }, [transitPhase]);

    useEffect(() => {
        if (transitPhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setTransitPhase('results')), 800);
        return () => clearTimeout(t);
    }, [transitPhase]);

    // ═══════════════════════════════════════════════════════════════════════════
    // d2.6: Vendor Claims & Returns (Expert, interactive)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd2.6') { setClaimsPhase('idle'); return; }
        setClaimsPhase('idle');
        setClaimsAgents(CLAIMS_AGENTS.map(a => ({ ...a })));
        setClaimsProgress(0);
        const t = tp('d2.6');
        const timer = setTimeout(pauseAware(() => setClaimsPhase('notification')), t.notifDelay);
        return () => clearTimeout(timer);
    }, [stepId]);

    const handleClaimsStart = () => setClaimsPhase('processing');

    useEffect(() => {
        if (claimsPhase !== 'processing') return;
        const timers = runAgentPipeline(CLAIMS_AGENTS, setClaimsAgents, setClaimsProgress, tp('d2.6'), () => setClaimsPhase('breathing'));
        return () => timers.forEach(clearTimeout);
    }, [claimsPhase]);

    useEffect(() => {
        if (claimsPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setClaimsPhase('revealed')), tp('d2.6').breathing);
        return () => clearTimeout(t);
    }, [claimsPhase]);

    useEffect(() => {
        if (claimsPhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setClaimsPhase('results')), 800);
        return () => clearTimeout(t);
    }, [claimsPhase]);

    // ═══════════════════════════════════════════════════════════════════════════
    // Render Helpers
    // ═══════════════════════════════════════════════════════════════════════════

    const renderAgentPipeline = (agents: AgentVis[], progress: number, label: string, color = 'bg-brand-400') => (
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-3">
                <AIAgentAvatar />
                <span className="text-xs font-bold text-foreground">{label}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                <div className={`h-full rounded-full ${color} transition-all duration-[3500ms] ease-linear`} style={{ width: `${progress}%` }} />
            </div>
            <div className="space-y-1.5">
                {agents.map(agent => (
                    <div key={agent.name} className={`flex items-center gap-2 text-[10px] transition-all duration-300 ${agent.visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                        {agent.done ?
                            <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> :
                            <ArrowPathIcon className="h-3.5 w-3.5 text-indigo-500 animate-spin shrink-0" />
                        }
                        <span className={agent.done ? 'text-foreground' : 'text-indigo-600 dark:text-indigo-400'}>{agent.name}</span>
                        <span className="text-muted-foreground">{agent.detail}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderNotification = (icon: React.ReactNode, title: string, detail: React.ReactNode, onClick: () => void, badge?: string) => (
        <button onClick={onClick} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-brand-500 text-zinc-900">{icon}</div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{title}</span>
                            {badge && <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">{badge}</span>}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">{detail}</div>
                        <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to start <ArrowRightIcon className="h-3 w-3" /></p>
                    </div>
                </div>
            </div>
        </button>
    );

    const renderBreathing = (message: string) => (
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-muted-foreground">{message}</span>
        </div>
    );

    const renderRevealed = (icon: React.ReactNode, summary: React.ReactNode, systems: string[]) => (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30 animate-in fade-in duration-500">
            <div className="flex items-start gap-2 mb-3">
                <AIAgentAvatar />
                <p className="text-xs text-green-800 dark:text-green-200">{summary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {systems.map(s => (
                    <span key={s} className="flex items-center gap-1 text-[9px] text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/10 px-2 py-0.5 rounded-full">
                        <CheckCircleIcon className="h-3 w-3" />{s}
                    </span>
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

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════

    if (!stepId.startsWith('d2.') || stepId === 'd2.7') return null;

    return (
        <div className="p-6 space-y-4 max-w-5xl mx-auto">
            {/* ── d2.1: Warehouse Health & Capacity Forecast ── */}
            {stepId === 'd2.1' && (
                <>
                    {hlthPhase === 'notification' && renderNotification(
                        <ChartBarIcon className="h-4 w-4" />,
                        'Warehouse Health Analysis',
                        <div className="space-y-2">
                            <SystemChips systems={[{ label: 'WMS', color: 'blue' }, { label: 'CAPACITY PLANNER', color: 'teal' }, { label: 'COST ENGINE', color: 'purple' }]} />
                            <p>WarehouseScanner: Scanning 1,840 items across 3 warehouses. Columbus capacity forecast indicates overflow risk ahead of Mercy Health Phase 2.</p>
                        </div>,
                        handleHlthStart,
                        '3 WAREHOUSES'
                    )}
                    {hlthPhase === 'processing' && renderAgentPipeline(hlthAgents, hlthProgress, 'Health Analysis Pipeline — Forecasting capacity...')}
                    {hlthPhase === 'breathing' && renderBreathing('Analysis complete — generating recommendations...')}
                    {(hlthPhase === 'revealed' || hlthPhase === 'results') && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {renderRevealed(
                                <ChartBarIcon className="h-4 w-4" />,
                                <><span className="font-bold">WarehouseScanner:</span> 3 warehouses analyzed — Columbus at <span className="font-semibold">72% (forecast 89%)</span> with Mercy Health Phase 2. Recommending <span className="font-semibold">85 items</span> for relocation. Projected savings: <span className="font-semibold">$3,600/month</span>.</>,
                                ['Capacity Planner', 'Cost Engine', 'Logistics API', 'Forecast Model']
                            )}
                            <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                                <SystemChips systems={[{ label: 'WMS', color: 'blue' }, { label: 'CAPACITY PLANNER', color: 'teal' }, { label: 'COST ENGINE', color: 'purple' }]} />
                            </div>

                            {/* Warehouse gauges */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">Warehouse Capacity Overview</span>
                                    <span className="text-[10px] font-semibold text-muted-foreground">1,840 total items</span>
                                </div>
                                <div className="p-4 space-y-4">
                                    {WAREHOUSE_DATA.map(wh => (
                                        <div key={wh.name}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${wh.alert ? 'bg-red-500' : 'bg-green-500'}`} />
                                                    <span className="text-[11px] font-bold text-foreground">{wh.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                                    <span>{wh.items} items</span>
                                                    <span className="font-semibold text-foreground">{wh.current}%</span>
                                                    {wh.forecast !== wh.current && (
                                                        <span className="text-red-600 dark:text-red-400 font-semibold">→ {wh.forecast}%</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="h-3 rounded-full bg-muted overflow-hidden relative">
                                                <div className={`h-full rounded-full ${wh.current >= 70 ? 'bg-amber-500' : 'bg-green-500'} transition-all duration-700 ease-out`} style={{ width: `${wh.current}%` }} />
                                                {wh.forecast !== wh.current && (
                                                    <div className="absolute top-0 h-full rounded-full bg-red-300/40 dark:bg-red-500/20 transition-all duration-700" style={{ width: `${wh.forecast}%` }} />
                                                )}
                                            </div>
                                            {wh.alert && <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"><ExclamationTriangleIcon className="h-3 w-3" />{wh.alertText}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Wall of Shame — Consignment Aging */}
                            <div className="rounded-xl border-2 border-red-200 dark:border-red-500/20 overflow-hidden">
                                <div className="bg-red-50 dark:bg-red-500/5 px-4 py-2 border-b border-red-200 dark:border-red-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ExclamationTriangleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                                        <span className="text-xs font-bold text-red-800 dark:text-red-200">Consignment Aging — "Wall of Shame"</span>
                                    </div>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-700 dark:text-red-400 font-bold">{CONSIGNMENT_AGING.length} ITEMS</span>
                                </div>
                                <div className="divide-y divide-red-100 dark:divide-red-500/10">
                                    {CONSIGNMENT_AGING.map((ca, i) => (
                                        <div key={i} className="px-4 py-3 flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${ca.status === 'overdue' ? 'bg-red-500/20 text-red-700 dark:text-red-400' : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'}`}>{ca.status === 'overdue' ? 'Overdue' : 'At Risk'}</span>
                                                    <span className="text-[11px] font-bold text-foreground">{ca.item}</span>
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">{ca.client} — {ca.daysOnSite} days on site</div>
                                                <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1"><AIAgentAvatar /><span className="italic">{ca.action}</span></div>
                                            </div>
                                            <span className="text-sm font-bold text-foreground">${ca.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Allocation Dashboard */}
                            <div className="rounded-xl border-2 border-amber-200 dark:border-amber-500/20 overflow-hidden">
                                <div className="bg-amber-50 dark:bg-amber-500/5 px-4 py-2 border-b border-amber-200 dark:border-amber-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ExclamationCircleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        <span className="text-xs font-bold text-amber-800 dark:text-amber-200">Allocation Conflicts</span>
                                    </div>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold">{ALLOCATION_CONFLICTS.length} CONFLICTS</span>
                                </div>
                                <div className="divide-y divide-amber-100 dark:divide-amber-500/10">
                                    {ALLOCATION_CONFLICTS.map((ac, i) => (
                                        <div key={i} className="px-4 py-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[11px] font-bold text-foreground">{ac.item}</span>
                                                <span className="text-[10px] font-bold text-red-600 dark:text-red-400">{ac.needed} needed, {ac.available} available (gap: {ac.gap})</span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {ac.projects.map((p, j) => (
                                                    <span key={j} className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">{p}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Relocation Recommendations */}
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <AIAgentAvatar />
                                    <span className="text-xs font-bold text-green-800 dark:text-green-200">AI Relocation Recommendations</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 font-semibold ml-auto">$3,600/mo savings</span>
                                </div>
                                <div className="space-y-2">
                                    {RELOCATION_RECS.map((rec, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-green-500/5 border border-green-200/50 dark:border-green-500/10 text-[10px]">
                                            <ArrowRightIcon className="h-3 w-3 text-green-600 dark:text-green-400 shrink-0" />
                                            <div className="flex-1">
                                                <span className="font-semibold text-foreground">{rec.items} items</span>
                                                <span className="text-muted-foreground"> — {rec.from} → {rec.to}</span>
                                                <span className="text-muted-foreground"> ({rec.type})</span>
                                            </div>
                                            <span className="text-green-700 dark:text-green-400 font-bold">{rec.savings}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}
                            <button onClick={() => nextStep()} className="w-full py-3 rounded-xl text-xs font-bold bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-500/20 transition-all">
                                <span className="flex items-center justify-center gap-2"><CheckCircleIcon className="h-4 w-4" /> Apply Recommendations</span>
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── d2.2: Receiving & Condition Assessment ── */}
            {stepId === 'd2.2' && (
                <>
                    {recPhase === 'notification' && renderNotification(
                        <QrCodeIcon className="h-4 w-4" />,
                        'Receiving & Condition Assessment — PO-2026-0389',
                        <div className="space-y-2">
                            <SystemChips systems={[{ label: 'QR SCANNER', color: 'teal' }, { label: 'PO SYSTEM', color: 'blue' }, { label: 'CONDITION DB', color: 'amber' }]} />
                            <p>QRScanner: Allsteel shipment detected at Columbus warehouse. 30 items expected. Ready for QR scan, PO matching, and condition assessment.</p>
                        </div>,
                        handleRecStart,
                        '30 ITEMS'
                    )}
                    {recPhase === 'processing' && renderAgentPipeline(recAgents, recProgress, 'Receiving Pipeline — Scanning & Assessing...', 'bg-success')}
                    {recPhase === 'breathing' && renderBreathing('Scan complete — compiling results...')}
                    {(recPhase === 'revealed' || recPhase === 'results') && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {renderRevealed(
                                <QrCodeIcon className="h-4 w-4" />,
                                <><span className="font-bold">QRScanner:</span> Scan complete — <span className="font-semibold">28/30 items matched</span>. Condition: 26 pristine, 3 inspect, 1 damaged. 1 missing (backorder), 1 wrong finish (claim CLM-2026-052 drafted).</>,
                                ['QR Scanner', 'PO Match', 'Condition DB', 'Exception Handler']
                            )}
                            <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                                <SystemChips systems={[{ label: 'QR SCANNER', color: 'teal' }, { label: 'PO SYSTEM', color: 'blue' }, { label: 'CONDITION DB', color: 'amber' }]} />
                            </div>

                            {/* Status badges */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border flex-wrap">
                                {[
                                    { color: 'bg-green-500', label: '28 Matched' },
                                    { color: 'bg-amber-500', label: '1 Missing' },
                                    { color: 'bg-red-500', label: '1 Wrong' },
                                    { color: 'bg-success', label: '26 Pristine' },
                                    { color: 'bg-yellow-500', label: '3 Inspect' },
                                ].map(b => (
                                    <div key={b.label} className="flex items-center gap-1.5 text-[10px]">
                                        <span className={`inline-block w-2 h-2 rounded-full ${b.color}`} />
                                        <span className="text-foreground font-semibold">{b.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Matched items table */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">Matched Items</span>
                                    <span className="text-[10px] text-green-600 dark:text-green-400 font-semibold">28 items verified</span>
                                </div>
                                <div className="divide-y divide-border">
                                    {MATCHED_RECEIVING.map(item => (
                                        <div key={item.line} className="px-4 py-2 flex items-center gap-4 text-[11px]">
                                            <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                            <span className="font-mono text-foreground w-24">{item.sku}</span>
                                            <span className="text-foreground flex-1 truncate">{item.description}</span>
                                            <span className="text-muted-foreground w-16 text-right">×{item.receivedQty}/{item.poQty}</span>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                                item.condition === 'pristine' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                                item.condition === 'inspect' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                                'bg-red-500/10 text-red-600 dark:text-red-400'
                                            }`}>{item.condition}</span>
                                        </div>
                                    ))}
                                    <div className="px-4 py-2 text-[10px] text-muted-foreground bg-muted/30">+ 24 more matched items...</div>
                                </div>
                            </div>

                            {/* Exceptions */}
                            <div className="space-y-3">
                                {EXCEPTIONS_RECEIVING.map(item => {
                                    const resolved = exceptionActions[item.line];
                                    const actions = item.status === 'missing'
                                        ? [
                                            { key: 'source-alt', label: 'Source Alternative', icon: <MagnifyingGlassIcon className="h-3 w-3" /> },
                                            { key: 'notify-client', label: 'Notify Client', icon: <BellAlertIcon className="h-3 w-3" /> },
                                            { key: 'accept-backorder', label: 'Accept Backorder', icon: <ClockIcon className="h-3 w-3" /> },
                                        ]
                                        : [
                                            { key: 'initiate-return', label: 'Initiate Return', icon: <ArrowUturnLeftIcon className="h-3 w-3" /> },
                                            { key: 'accept-substitute', label: 'Accept as Substitute', icon: <CheckCircleIcon className="h-3 w-3" /> },
                                            { key: 'escalate-vendor', label: 'Escalate to Vendor', icon: <ExclamationTriangleIcon className="h-3 w-3" /> },
                                        ];
                                    return (
                                        <div key={item.line} className={`p-4 rounded-xl border-2 transition-colors duration-300 ${
                                            resolved
                                                ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5'
                                                : item.status === 'missing'
                                                    ? 'border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5'
                                                    : 'border-red-300 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5'
                                        }`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                            resolved ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                                                            : item.status === 'missing' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-red-500/20 text-red-700 dark:text-red-400'
                                                        }`}>{resolved ? 'Resolved' : item.status === 'missing' ? 'Missing' : 'Wrong Item'}</span>
                                                        <span className="text-[10px] text-muted-foreground">Line #{item.line}</span>
                                                    </div>
                                                    <div className="text-[11px] mt-1">
                                                        <span className="font-mono text-foreground">{item.sku}</span>
                                                        <span className="text-muted-foreground ml-2">{item.description}</span>
                                                    </div>
                                                    {item.note && (
                                                        <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                                                            <AIAgentAvatar /><span className="italic">{item.note}</span>
                                                        </p>
                                                    )}
                                                </div>
                                                {resolved ? (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-green-600 dark:text-green-400 shrink-0">
                                                        <CheckCircleIcon className="h-3.5 w-3.5" /><span className="font-semibold">{resolved}</span>
                                                    </div>
                                                ) : (
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                                        item.status === 'missing' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                    }`}>ACTION NEEDED</span>
                                                )}
                                            </div>
                                            {!resolved && (
                                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                                                    <span className="text-[9px] text-muted-foreground mr-1">AI Suggested Actions:</span>
                                                    {actions.map(action => (
                                                        <button
                                                            key={action.key}
                                                            onClick={() => setExceptionActions(prev => ({ ...prev, [item.line]: action.label }))}
                                                            className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                                                                item.status === 'missing'
                                                                    ? 'border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/10'
                                                                    : 'border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/10'
                                                            }`}
                                                        >
                                                            {action.icon}{action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* CTA */}
                            <button
                                onClick={() => nextStep()}
                                disabled={Object.keys(exceptionActions).length < EXCEPTIONS_RECEIVING.length}
                                className={`w-full py-3 rounded-xl text-xs font-bold shadow-lg transition-all ${
                                    Object.keys(exceptionActions).length >= EXCEPTIONS_RECEIVING.length
                                        ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-brand-500/20'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
                                }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <ClipboardDocumentCheckIcon className="h-4 w-4" />
                                    {Object.keys(exceptionActions).length >= EXCEPTIONS_RECEIVING.length
                                        ? 'Confirm Receiving — 28 Matched, 2 Exceptions Resolved'
                                        : `Resolve Exceptions (${Object.keys(exceptionActions).length}/${EXCEPTIONS_RECEIVING.length})`
                                    }
                                </span>
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── d2.3: PO Price Verification & Tax Compliance ── */}
            {stepId === 'd2.3' && (
                <>
                    {pricePhase === 'notification' && renderNotification(
                        <CurrencyDollarIcon className="h-4 w-4" />,
                        'PO Price Verification',
                        <div className="space-y-2">
                            <SystemChips systems={[{ label: 'PRICE LISTS', color: 'blue' }, { label: 'CONTRACT DB', color: 'teal' }, { label: 'MARGIN CALC', color: 'purple' }]} />
                            <p>PriceListScanner: Scanning Allsteel, Kimball, National price lists against PO-2026-0389. Verifying regional tax compliance for OH and IL delivery addresses.</p>
                        </div>,
                        handlePriceStart,
                        '15 ITEMS CHECKED'
                    )}
                    {pricePhase === 'processing' && renderAgentPipeline(priceAgents, priceProgress, 'Price Verification Pipeline — Checking margins...')}
                    {pricePhase === 'breathing' && renderBreathing('Verification complete — compiling report...')}
                    {(pricePhase === 'revealed' || pricePhase === 'results') && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {renderRevealed(
                                <CurrencyDollarIcon className="h-4 w-4" />,
                                <><span className="font-bold">PriceListScanner:</span> {PO_PRICE_CHECKS.length} items verified — <span className="font-semibold">2 with margin below 25%</span> flagged. Tax compliance auto-verified.</>,
                                ['Price Lists', 'Contract DB', 'Margin Calculator', 'Compliance Reporter']
                            )}
                            <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                                <SystemChips systems={[{ label: 'PRICE LISTS', color: 'blue' }, { label: 'CONTRACT DB', color: 'teal' }, { label: 'MARGIN CALC', color: 'purple' }]} />
                            </div>

                            {/* Price checks table with pagination */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">Price Verification Results</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-muted-foreground font-medium">{PO_PRICE_CHECKS.length} items across PO-2026-0389</span>
                                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">2 flagged</span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[11px]">
                                        <thead>
                                            <tr className="bg-muted/30 text-muted-foreground">
                                                <th className="px-4 py-2 text-left font-semibold">Item</th>
                                                <th className="px-3 py-2 text-left font-semibold">Mfr</th>
                                                <th className="px-3 py-2 text-right font-semibold">PO Price</th>
                                                <th className="px-3 py-2 text-right font-semibold">Current</th>
                                                <th className="px-3 py-2 text-right font-semibold">Change</th>
                                                <th className="px-3 py-2 text-right font-semibold">Margin</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {pricePageItems.map((pc, i) => (
                                                <tr key={pricePage * PO_PRICE_PAGE_SIZE + i} className={pc.flag ? 'bg-amber-50/50 dark:bg-amber-500/5' : ''}>
                                                    <td className="px-4 py-2 text-foreground font-medium">{pc.item}</td>
                                                    <td className="px-3 py-2 text-muted-foreground">{pc.mfr}</td>
                                                    <td className="px-3 py-2 text-right text-foreground">${pc.poPrice.toLocaleString()}</td>
                                                    <td className="px-3 py-2 text-right text-foreground">${pc.currentPrice.toLocaleString()}</td>
                                                    <td className={`px-3 py-2 text-right font-semibold ${pc.change !== '0%' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{pc.change}</td>
                                                    <td className={`px-3 py-2 text-right font-semibold ${pc.flag ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                                                        {pc.margin}
                                                        {pc.flag && <ExclamationTriangleIcon className="h-3 w-3 inline ml-1" />}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination */}
                                <div className="bg-muted/30 px-4 py-2 border-t border-border flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground">
                                        Showing {pricePage * PO_PRICE_PAGE_SIZE + 1}–{Math.min((pricePage + 1) * PO_PRICE_PAGE_SIZE, PO_PRICE_CHECKS.length)} of {PO_PRICE_CHECKS.length} items
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setPricePage(p => Math.max(0, p - 1))}
                                            disabled={pricePage === 0}
                                            className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeftIcon className="h-3.5 w-3.5 text-foreground" />
                                        </button>
                                        {Array.from({ length: priceTotalPages }, (_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPricePage(i)}
                                                className={`text-[10px] font-semibold w-6 h-6 rounded transition-colors ${
                                                    pricePage === i
                                                        ? 'bg-brand-400 text-zinc-900'
                                                        : 'text-muted-foreground hover:bg-muted'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setPricePage(p => Math.min(priceTotalPages - 1, p + 1))}
                                            disabled={pricePage >= priceTotalPages - 1}
                                            className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRightIcon className="h-3.5 w-3.5 text-foreground" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Summary bar */}
                            <div className="grid grid-cols-4 gap-3">
                                <div className="p-3 rounded-xl bg-muted/30 border border-border text-center">
                                    <div className="text-[10px] text-muted-foreground mb-1">Total Items</div>
                                    <div className="text-sm font-bold text-foreground">{PO_PRICE_CHECKS.length}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-muted/30 border border-border text-center">
                                    <div className="text-[10px] text-muted-foreground mb-1">PO Value</div>
                                    <div className="text-sm font-bold text-foreground">${PO_PRICE_CHECKS.reduce((s, p) => s + p.poPrice, 0).toLocaleString()}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-muted/30 border border-border text-center">
                                    <div className="text-[10px] text-muted-foreground mb-1">Current Value</div>
                                    <div className="text-sm font-bold text-foreground">${PO_PRICE_CHECKS.reduce((s, p) => s + p.currentPrice, 0).toLocaleString()}</div>
                                </div>
                                <div className={`p-3 rounded-xl border text-center transition-colors duration-300 ${
                                    allMarginResolved
                                        ? 'bg-green-50/50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20'
                                        : 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20'
                                }`}>
                                    <div className={`text-[10px] mb-1 ${allMarginResolved ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>Margin Alerts</div>
                                    <div className={`text-sm font-bold ${allMarginResolved ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                                        {allMarginResolved ? `${MARGIN_ALERTS.length} Resolved` : `${Object.keys(marginActions).length}/${MARGIN_ALERTS.length}`}
                                    </div>
                                </div>
                            </div>

                            {/* Margin alert cards */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground flex items-center gap-2">
                                        <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" /> Margin Alerts — Below 25% Threshold
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">{Object.keys(marginActions).length}/{MARGIN_ALERTS.length} resolved</span>
                                </div>
                                {MARGIN_ALERTS.map(alert => {
                                    const resolved = marginActions[alert.id];
                                    return (
                                        <div key={alert.id} className={`p-4 rounded-xl border-2 transition-colors duration-300 ${
                                            resolved
                                                ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5'
                                                : 'border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5'
                                        }`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                            resolved ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                                        }`}>{resolved ? 'Resolved' : 'LOW MARGIN'}</span>
                                                        <span className="text-[10px] text-muted-foreground">{alert.mfr}</span>
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                                            resolved ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                        }`}>{alert.margin} (min {alert.threshold})</span>
                                                    </div>
                                                    <div className="text-[11px] font-semibold text-foreground mt-1">{alert.item}</div>
                                                    <div className="text-[10px] text-muted-foreground mt-1 grid grid-cols-3 gap-3">
                                                        <span>PO: <span className="text-foreground font-medium">${alert.poPrice.toLocaleString()}</span></span>
                                                        <span>Current: <span className="text-foreground font-medium">${alert.currentPrice.toLocaleString()}</span></span>
                                                        <span>Change: <span className="text-red-600 dark:text-red-400 font-semibold">{alert.change}</span></span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground mt-2 italic">{alert.reason}</p>
                                                    <p className="text-[10px] text-muted-foreground mt-1.5 flex items-start gap-1">
                                                        <AIAgentAvatar /><span className="italic">{alert.aiNote}</span>
                                                    </p>
                                                </div>
                                                {resolved && (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-green-600 dark:text-green-400 shrink-0">
                                                        <CheckCircleIcon className="h-3.5 w-3.5" /><span className="font-semibold">{resolved}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {!resolved && (
                                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                                                    <span className="text-[9px] text-muted-foreground mr-1">Actions:</span>
                                                    <button
                                                        onClick={() => setMarginActions(prev => ({ ...prev, [alert.id]: 'Price Updated to Current' }))}
                                                        className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-brand-300 dark:border-brand-500/30 text-zinc-900 dark:text-brand-300 bg-brand-400/80 hover:bg-brand-400 transition-all"
                                                    >
                                                        <CurrencyDollarIcon className="h-3 w-3" />Update PO Price
                                                    </button>
                                                    <button
                                                        onClick={() => setMarginActions(prev => ({ ...prev, [alert.id]: 'Margin Override Approved' }))}
                                                        className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/10 transition-all"
                                                    >
                                                        <ShieldCheckIcon className="h-3 w-3" />Override Margin
                                                    </button>
                                                    <button
                                                        onClick={() => setMarginActions(prev => ({ ...prev, [alert.id]: 'Escalated to SC' }))}
                                                        className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-all"
                                                    >
                                                        <ExclamationCircleIcon className="h-3 w-3" />Escalate to SC
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Tax compliance — minimized informative note */}
                            <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center gap-3">
                                <ShieldCheckIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-[10px] text-muted-foreground">Tax compliance: OH 7.8% verified, IL 6.7% auto-applied — handled by SC during pricing.</span>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={() => nextStep()}
                                disabled={!allMarginResolved}
                                className={`w-full py-3 rounded-xl text-xs font-bold shadow-lg transition-all ${
                                    allMarginResolved
                                        ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-brand-500/20'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
                                }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4" />
                                    {allMarginResolved
                                        ? 'Approve Pricing — 2 Margin Alerts Resolved'
                                        : `Resolve Margin Alerts (${Object.keys(marginActions).length}/${MARGIN_ALERTS.length})`
                                    }
                                </span>
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── d2.4: Multi-Warehouse Sync (Auto) ── */}
            {stepId === 'd2.4' && (
                <>
                    {syncPhase === 'notification' && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-brand-500 text-zinc-900"><MapPinIcon className="h-4 w-4" /></div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-foreground">Multi-Warehouse Sync</span>
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">Auto</span>
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">5 LOCATIONS</span>
                                        </div>
                                        <div className="mt-1.5">
                                            <SystemChips systems={[{ label: 'WMS SYNC', color: 'blue' }, { label: 'DOCK SCHEDULER', color: 'teal' }, { label: 'ROUTE ENGINE', color: 'purple' }]} />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-1">WarehouseSync: Synchronizing 3 warehouses + 2 job sites. Resolving dock conflicts and optimizing delivery routes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {syncPhase === 'processing' && renderAgentPipeline(syncAgents, syncProgress, 'Sync Pipeline — Synchronizing locations...')}
                    {syncPhase === 'breathing' && renderBreathing('Sync complete — updating location map...')}
                    {(syncPhase === 'revealed' || syncPhase === 'results') && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {renderRevealed(
                                <MapPinIcon className="h-4 w-4" />,
                                <><span className="font-bold">WarehouseSync:</span> 3 warehouses + 2 job sites synchronized. Dock conflict auto-resolved (SH-002 → Dock 3). Route optimization: <span className="font-semibold">$1,200 savings</span>.</>,
                                ['Warehouse Sync', 'Dock Scheduler', 'Route Optimizer', 'Map Updater']
                            )}
                            <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                                <SystemChips systems={[{ label: 'WMS SYNC', color: 'blue' }, { label: 'DOCK SCHEDULER', color: 'teal' }, { label: 'ROUTE ENGINE', color: 'purple' }]} />
                            </div>

                            {/* Location cards */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">Location Sync Status</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-semibold">All Synced</span>
                                </div>
                                <div className="divide-y divide-border">
                                    {LOCATION_STATUS.map((loc, i) => (
                                        <div key={i} className="px-4 py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {loc.type === 'Warehouse' ? (
                                                    <CubeIcon className="h-4 w-4 text-blue-500 shrink-0" />
                                                ) : (
                                                    <MapIcon className="h-4 w-4 text-success shrink-0" />
                                                )}
                                                <div>
                                                    <div className="text-[11px] font-bold text-foreground">{loc.name}</div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {loc.items} items
                                                        {'inTransit' in loc && loc.inTransit && !syncCardsAnimated && <> · {loc.inTransit} in transit</>}
                                                        {'inTransit' in loc && loc.inTransit && syncCardsAnimated && <> · <span className="text-green-600 dark:text-green-400 font-semibold">Delivered</span></>}
                                                        {'pendingQC' in loc && loc.pendingQC && !syncCardsAnimated && <> · {loc.pendingQC} pending QC</>}
                                                        {'pendingQC' in loc && loc.pendingQC && syncCardsAnimated && <> · <span className="text-green-600 dark:text-green-400 font-semibold">QC Cleared</span></>}
                                                        {'receiving' in loc && loc.receiving && !syncCardsAnimated && <> · Receiving</>}
                                                        {'receiving' in loc && loc.receiving && syncCardsAnimated && <> · <span className="text-green-600 dark:text-green-400 font-semibold">Received</span></>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {'utilization' in loc && loc.utilization && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                                            <div className={`h-full rounded-full ${(loc.utilization ?? 0) >= 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${loc.utilization}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-semibold text-foreground w-8 text-right">{loc.utilization}%</span>
                                                    </div>
                                                )}
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                                    loc.status === 'Active' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                                    loc.status === 'Receiving' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                                    'bg-muted0/10 text-muted-foreground'
                                                }`}>{loc.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Route optimization */}
                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 flex items-center gap-3">
                                <TruckIcon className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                                <span className="text-[11px] text-green-800 dark:text-green-200 flex-1">Route Optimization: 2 Allsteel deliveries consolidated</span>
                                <span className="text-[11px] font-bold text-green-700 dark:text-green-400">-$1,200</span>
                            </div>

                            {/* Pending transit — narrative bridge to d2.5 */}
                            <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <TruckIcon className="h-3.5 w-3.5 text-blue-500" />
                                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">Pending Transit Intelligence</span>
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 ml-auto">SYNC DETECTED</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[10px]">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        <span>3 shipments on-time</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        <span>1 potential delay</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <span>1 billing discrepancy</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2 italic flex items-center gap-1">
                                    <AIAgentAvatar />Sync complete — routing to transit analysis for detailed tracking...
                                </p>
                            </div>

                            {/* CTA */}
                            <button onClick={() => nextStep()} className="w-full py-3 rounded-xl text-xs font-bold bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-500/20 transition-all">
                                <span className="flex items-center justify-center gap-2"><TruckIcon className="h-4 w-4" /> Analyze Transit & Freight — 5 Shipments Detected</span>
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── d2.5: In-Transit Intelligence & Freight Audit ── */}
            {stepId === 'd2.5' && (
                <>
                    {transitPhase === 'notification' && renderNotification(
                        <TruckIcon className="h-4 w-4" />,
                        'In-Transit Intelligence',
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">FROM WAREHOUSE SYNC</span>
                                <span className="text-[10px] text-muted-foreground">5 shipments identified during sync</span>
                            </div>
                            <SystemChips systems={[{ label: 'CARRIER API', color: 'blue' }, { label: 'PREDICTIVE ENGINE', color: 'purple' }, { label: 'FREIGHT AUDITOR', color: 'red' }]} />
                            <p>TransitTracker: Analyzing 5 active shipments from synced data — 1 delay predicted (weather), 1 freight billing discrepancy. Split-shipment reconciliation pending.</p>
                        </div>,
                        handleTransitStart,
                        '5 SHIPMENTS'
                    )}
                    {transitPhase === 'processing' && renderAgentPipeline(transitAgents, transitProgress, 'Transit Intelligence Pipeline — Analyzing shipments...', 'bg-blue-500')}
                    {transitPhase === 'breathing' && renderBreathing('Analysis complete — compiling transit report...')}
                    {(transitPhase === 'revealed' || transitPhase === 'results') && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {renderRevealed(
                                <TruckIcon className="h-4 w-4" />,
                                <><span className="font-bold">TransitTracker:</span> 5 shipments tracked — <span className="font-semibold">1 weather delay predicted (+2 days)</span>. Freight audit: $340 overcharge on SH-004. Split-shipment: 28/30 received, 2 backordered.</>,
                                ['Transit Tracker', 'Predictive Engine', 'Freight Auditor', 'Split Reconciler']
                            )}
                            <div className="p-2 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-between">
                                <SystemChips systems={[{ label: 'CARRIER API', color: 'blue' }, { label: 'PREDICTIVE ENGINE', color: 'purple' }, { label: 'FREIGHT AUDITOR', color: 'red' }]} />
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">FROM WAREHOUSE SYNC</span>
                            </div>

                            {/* Section A: Shipment Tracker */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">Active Shipments</span>
                                    <span className="text-[10px] text-muted-foreground font-semibold">5 shipments from 3 carriers</span>
                                </div>
                                <div className="divide-y divide-border">
                                    {SHIPMENTS.map(sh => (
                                        <div key={sh.id} className={`px-4 py-2.5 flex items-center justify-between text-[11px] ${sh.status === 'delayed' ? 'bg-red-50/50 dark:bg-red-500/5' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-muted-foreground w-14">{sh.id}</span>
                                                <div>
                                                    <span className="font-semibold text-foreground">{sh.manufacturer}</span>
                                                    <span className="text-muted-foreground ml-2">via {sh.carrier}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">{sh.itemCount} items</span>
                                                <span className="text-[10px] text-muted-foreground">{sh.eta}</span>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                                    sh.status === 'arriving-today' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                                    sh.status === 'on-time' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                                    'bg-red-500/10 text-red-600 dark:text-red-400'
                                                }`}>
                                                    {sh.status === 'arriving-today' ? 'Today' : sh.status === 'on-time' ? 'On Time' : 'Delayed'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section B: Predictive Alert */}
                            {PREDICTIVE_ALERTS.map(alert => (
                                <div key={alert.shipmentId} className={`p-4 rounded-xl border-2 transition-all duration-300 ${alertAction ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' : 'border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${alertAction ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'}`}>{alertAction ? 'Resolved' : 'Predictive Alert'}</span>
                                        <span className="text-[10px] font-mono text-muted-foreground">{alert.shipmentId}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-ai/10 text-ai dark:text-purple-400 font-semibold ml-auto">{alert.confidence}% confidence</span>
                                    </div>
                                    <p className="text-[11px] text-foreground">
                                        <span className="font-bold">{alert.manufacturer}</span> — {alert.prediction === 'weather-delay' ? 'Weather delay' : 'Delay'} predicted <span className="font-semibold text-amber-700 dark:text-amber-400">+{alert.delayDays} days</span>.
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-1">Impact: {alert.impact}.</p>
                                    <p className="text-[10px] text-muted-foreground mt-1 flex items-start gap-1">
                                        <AIAgentAvatar /><span className="italic">Recommended: notify Mercy Health PM of revised ETA and stage available inventory at Columbus Main as contingency.</span>
                                    </p>
                                    {alertAction ? (
                                        <div className="flex items-center gap-1.5 mt-3">
                                            <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />
                                            <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">{alertAction}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                                            <span className="text-[9px] text-muted-foreground mr-1">Actions:</span>
                                            <button onClick={() => setAlertAction('Client notified — revised ETA sent')} className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-brand-300 dark:border-brand-500/30 text-zinc-900 dark:text-brand-300 bg-brand-400/80 hover:bg-brand-400 transition-all">
                                                <BellAlertIcon className="h-3 w-3" />Notify Client
                                            </button>
                                            <button onClick={() => setAlertAction('Staging rerouted to Columbus Main')} className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/10 transition-all">
                                                <ArrowPathIcon className="h-3 w-3" />Reroute Staging
                                            </button>
                                            <button onClick={() => setAlertAction('Expedited shipping requested to carrier')} className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-all">
                                                <TruckIcon className="h-3 w-3" />Request Expedite
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Section C: Freight Audit */}
                            {FREIGHT_AUDIT.map(fa => (
                                <div key={fa.shipmentId} className={`p-4 rounded-xl border-2 transition-all duration-300 ${freightAction ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' : 'border-red-300 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${freightAction ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-500/20 text-red-700 dark:text-red-400'}`}>{freightAction ? 'Resolved' : 'Freight Discrepancy'}</span>
                                        <span className="text-[10px] font-mono text-muted-foreground">{fa.shipmentId}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-[11px] mb-2">
                                        <div><span className="text-muted-foreground">Quoted:</span> <span className="font-semibold text-foreground">${fa.quotedCost.toLocaleString()}</span></div>
                                        <div><span className="text-muted-foreground">Billed:</span> <span className="font-semibold text-red-600 dark:text-red-400">${fa.billedCost.toLocaleString()}</span></div>
                                        <div><span className="text-muted-foreground">Overcharge:</span> <span className="font-bold text-red-700 dark:text-red-400">${fa.overcharge}</span></div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">{fa.carrier} — {fa.reason}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1 flex items-start gap-1">
                                        <AIAgentAvatar /><span className="italic">BOL #SAIA-44821 does not include accessorial. Carrier invoice ref: INV-2026-8847. Recommend filing formal claim with supporting docs.</span>
                                    </p>
                                    {freightAction ? (
                                        <div className="flex items-center gap-1.5 mt-3">
                                            <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />
                                            <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">{freightAction}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                                            <span className="text-[9px] text-muted-foreground mr-1">Actions:</span>
                                            <button onClick={() => setFreightAction(`Claim filed — $${fa.overcharge} recovery initiated`)} className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/10 transition-all">
                                                <ExclamationCircleIcon className="h-3 w-3" />File Freight Claim
                                            </button>
                                            <button onClick={() => setFreightAction('Dispute sent to SAIA — awaiting response')} className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/10 transition-all">
                                                <ExclamationTriangleIcon className="h-3 w-3" />Dispute with Carrier
                                            </button>
                                            <button onClick={() => setFreightAction('Charge accepted — no further action')} className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-all">
                                                <CheckCircleIcon className="h-3 w-3" />Accept Charge
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Section D: Split-Shipment Reconciliation */}
                            {SPLIT_SHIPMENT.map(ss => (
                                <div key={ss.poId} className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-400">Split Shipment</span>
                                        <span className="text-[10px] font-mono text-muted-foreground">{ss.poId}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex-1 h-2 rounded-full bg-blue-100 dark:bg-blue-500/10 overflow-hidden">
                                            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${(ss.received / ss.totalItems) * 100}%` }} />
                                        </div>
                                        <span className="text-[10px] font-bold text-foreground">{ss.received}/{ss.totalItems}</span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        {ss.backordered} items backordered:
                                        {ss.backorderItems.map((bi, j) => (
                                            <span key={j} className="ml-1 font-semibold text-foreground">{bi.name} (×{bi.qty}) — ETA {bi.eta}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Trigger notification for d2.6 — appears when both actions resolved */}
                            {alertAction && freightAction ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border-2 border-amber-300 dark:border-amber-500/30 shadow-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-amber-500/20 shrink-0">
                                            <ExclamationCircleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-foreground">Vendor Claims Detected</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-bold">3 ACTIVE CLAIMS</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                Freight audit triggered CLM-2026-055. Combined with 2 existing claims (CLM-2026-052 wrong finish, CLM-2026-048 backorder), total pending credits: <span className="font-semibold text-foreground">$2,770</span>.
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-1 flex items-start gap-1">
                                                <AIAgentAvatar /><span className="italic">Claims pipeline ready — 1 RMA approved, 4 warranty items approaching expiry.</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => nextStep()} className="w-full mt-3 py-2.5 rounded-lg text-[11px] font-bold bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-md shadow-brand-500/20 transition-all">
                                        <span className="flex items-center justify-center gap-2"><ExclamationCircleIcon className="h-3.5 w-3.5" /> Review Claims & Returns — $2,770 Pending</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="p-3 rounded-xl bg-muted/30 border border-border text-center">
                                    <span className="text-[10px] text-muted-foreground">Resolve transit issues above to continue ({(alertAction ? 1 : 0) + (freightAction ? 1 : 0)}/2)</span>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ── d2.6: Vendor Claims & Returns ── */}
            {stepId === 'd2.6' && (
                <>
                    {claimsPhase === 'notification' && renderNotification(
                        <ExclamationCircleIcon className="h-4 w-4" />,
                        'Vendor Claims & Returns',
                        <div className="space-y-2">
                            <SystemChips systems={[{ label: 'CLAIM TRACKER', color: 'amber' }, { label: 'RMA SYSTEM', color: 'red' }, { label: 'CREDIT PROC', color: 'green' }]} />
                            <p>ClaimTracker: 3 active claims across Allsteel and National. CLM-2026-052 (wrong finish) RMA approved. 4 items approaching warranty expiry.</p>
                        </div>,
                        handleClaimsStart,
                        '3 ACTIVE CLAIMS'
                    )}
                    {claimsPhase === 'processing' && renderAgentPipeline(claimsAgents, claimsProgress, 'Claims Pipeline — Processing returns...', 'bg-rose-500')}
                    {claimsPhase === 'breathing' && renderBreathing('Claims processed — generating report...')}
                    {(claimsPhase === 'revealed' || claimsPhase === 'results') && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {renderRevealed(
                                <ExclamationCircleIcon className="h-4 w-4" />,
                                <><span className="font-bold">ClaimTracker:</span> 3 claims processed — <span className="font-semibold">$2,770 total credits</span>. CLM-2026-052 RMA approved, replacement shipping. 4 warranty alerts require attention.</>,
                                ['Claim Tracker', 'RMA System', 'Credit Processor', 'Warranty DB']
                            )}
                            <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                                <SystemChips systems={[{ label: 'CLAIM TRACKER', color: 'amber' }, { label: 'RMA SYSTEM', color: 'red' }, { label: 'CREDIT PROC', color: 'green' }]} />
                            </div>

                            {/* Claim cards */}
                            <div className="space-y-3">
                                {VENDOR_CLAIMS.map(claim => {
                                    const resolved = claimActions[claim.id];
                                    const actions = claim.type === 'wrong-finish'
                                        ? [
                                            { key: 'Process RMA return', icon: <ArrowUturnLeftIcon className="h-3 w-3" />, label: 'Process Return', style: 'brand' as const },
                                            { key: 'Accept credit — keep units', icon: <CurrencyDollarIcon className="h-3 w-3" />, label: 'Credit Only', style: 'amber' as const },
                                            { key: 'Escalated — quality review requested', icon: <ExclamationTriangleIcon className="h-3 w-3" />, label: 'Quality Escalation', style: 'neutral' as const },
                                        ]
                                        : claim.type === 'packaging-damage'
                                        ? [
                                            { key: 'Inspection scheduled — field tech assigned', icon: <MagnifyingGlassIcon className="h-3 w-3" />, label: 'Schedule Inspection', style: 'brand' as const },
                                            { key: 'Accepted as-is — credit applied', icon: <CheckCircleIcon className="h-3 w-3" />, label: 'Accept As-Is', style: 'amber' as const },
                                            { key: 'Full replacement requested from vendor', icon: <ArrowPathIcon className="h-3 w-3" />, label: 'Request Replacement', style: 'neutral' as const },
                                        ]
                                        : [
                                            { key: 'On-site repair scheduled', icon: <ShieldCheckIcon className="h-3 w-3" />, label: 'Schedule Repair', style: 'brand' as const },
                                            { key: 'Warranty replacement requested', icon: <ArrowUturnLeftIcon className="h-3 w-3" />, label: 'Warranty Replace', style: 'amber' as const },
                                            { key: 'Extended warranty purchased', icon: <ClockIcon className="h-3 w-3" />, label: 'Extend Warranty', style: 'neutral' as const },
                                        ];
                                    return (
                                        <div key={claim.id} className={`p-4 rounded-xl border-2 transition-colors duration-300 ${
                                            resolved ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5'
                                            : claim.type === 'wrong-finish' ? 'border-red-300 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5'
                                            : claim.type === 'packaging-damage' ? 'border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5'
                                            : 'border-blue-300 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5'
                                        }`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                            resolved ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                                                            : claim.type === 'wrong-finish' ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                                                            : claim.type === 'packaging-damage' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                                            : 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                                                        }`}>{resolved ? 'Resolved' : claim.action}</span>
                                                        <span className="text-[10px] font-mono text-muted-foreground">{claim.id}</span>
                                                    </div>
                                                    <div className="text-[11px] font-semibold text-foreground">{claim.item}</div>
                                                    <div className="text-[10px] text-muted-foreground mt-0.5">{claim.mfr} — {claim.status}</div>
                                                    <p className="text-[10px] text-muted-foreground mt-1.5 flex items-start gap-1">
                                                        <AIAgentAvatar /><span className="italic">{claim.aiNote}</span>
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-sm font-bold text-foreground">{claim.credit}</span>
                                                    {resolved && (
                                                        <div className="flex items-center gap-1 mt-1 text-[10px] text-green-600 dark:text-green-400">
                                                            <CheckCircleIcon className="h-3 w-3" /><span className="font-semibold">{resolved}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {!resolved && (
                                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                                                    <span className="text-[9px] text-muted-foreground mr-1">Actions:</span>
                                                    {actions.map(a => (
                                                        <button
                                                            key={a.key}
                                                            onClick={() => setClaimActions(prev => ({ ...prev, [claim.id]: a.key }))}
                                                            className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                                                                a.style === 'brand' ? 'border-brand-300 dark:border-brand-500/30 text-zinc-900 dark:text-brand-300 bg-brand-400/80 hover:bg-brand-400'
                                                                : a.style === 'amber' ? 'border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/10'
                                                                : 'border-border text-muted-foreground hover:bg-muted'
                                                            }`}
                                                        >
                                                            {a.icon}{a.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Warranty alerts */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">Warranty Alerts</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-muted-foreground">{Object.keys(warrantyActions).length}/{WARRANTY_ALERTS.length} actioned</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">4 items</span>
                                    </div>
                                </div>
                                <div className="divide-y divide-border">
                                    {WARRANTY_ALERTS.map((wa, i) => {
                                        const resolved = warrantyActions[i];
                                        return (
                                            <div key={i} className={`px-4 py-3 transition-colors duration-300 ${resolved ? 'bg-green-50/30 dark:bg-green-500/[0.03]' : ''}`}>
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <div>
                                                        <span className="font-semibold text-foreground">{wa.item}</span>
                                                        <span className="text-muted-foreground ml-2">({wa.mfr})</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-muted-foreground">{wa.value}</span>
                                                        <span className={`text-[10px] font-semibold ${wa.daysLeft <= 15 ? 'text-red-600 dark:text-red-400' : wa.daysLeft <= 30 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                                                            {wa.daysLeft}d left
                                                        </span>
                                                        {resolved ? (
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400">{resolved}</span>
                                                        ) : (
                                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                                                wa.action === 'Extend' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                                                                wa.action === 'Review' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                                                'bg-muted0/10 text-muted-foreground'
                                                            }`}>{wa.action}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {!resolved && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {wa.action === 'Extend' && (
                                                            <>
                                                                <button onClick={() => setWarrantyActions(p => ({ ...p, [i]: 'Extended' }))} className="text-[9px] font-semibold px-2 py-1 rounded-md border border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/10 transition-all">Extend Warranty</button>
                                                                <button onClick={() => setWarrantyActions(p => ({ ...p, [i]: 'Claim Filed' }))} className="text-[9px] font-semibold px-2 py-1 rounded-md border border-border text-muted-foreground hover:bg-muted transition-all">File Claim Now</button>
                                                            </>
                                                        )}
                                                        {wa.action === 'Review' && (
                                                            <>
                                                                <button onClick={() => setWarrantyActions(p => ({ ...p, [i]: 'Inspection Set' }))} className="text-[9px] font-semibold px-2 py-1 rounded-md border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/10 transition-all">Schedule Inspection</button>
                                                                <button onClick={() => setWarrantyActions(p => ({ ...p, [i]: 'Extended' }))} className="text-[9px] font-semibold px-2 py-1 rounded-md border border-border text-muted-foreground hover:bg-muted transition-all">Extend Warranty</button>
                                                            </>
                                                        )}
                                                        {wa.action === 'Monitor' && (
                                                            <>
                                                                <button onClick={() => setWarrantyActions(p => ({ ...p, [i]: 'Monitoring' }))} className="text-[9px] font-semibold px-2 py-1 rounded-md border border-border text-muted-foreground hover:bg-muted transition-all">Acknowledge</button>
                                                                <button onClick={() => setWarrantyActions(p => ({ ...p, [i]: 'Alert Set' }))} className="text-[9px] font-semibold px-2 py-1 rounded-md border border-border text-muted-foreground hover:bg-muted transition-all">Set Reminder</button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Expert note */}
                            <div className="p-4 rounded-xl bg-muted/30 border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <AIAgentAvatar />
                                    <span className="text-[10px] font-bold text-foreground">Expert Note to Dealer</span>
                                </div>
                                <textarea
                                    className="w-full text-[11px] p-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-brand-400"
                                    rows={2}
                                    placeholder="Add notes for the dealer review — e.g., 'CLM-052 urgent: client waiting on replacements. Recommend expediting RMA pickup.'"
                                    defaultValue="CLM-052: Acuity chairs RMA pickup scheduled for Mar 28. CLM-048: cosmetic damage — recommend accepting credit + keeping unit on floor. Warranty on Beyond Desk expires in 15d — extend before Phase 2 install."
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border text-[10px]">
                                <span className="text-muted-foreground">Total credits: <span className="font-bold text-foreground">$2,770</span></span>
                                <span className="text-muted-foreground">Claims: <span className="font-bold text-foreground">{Object.keys(claimActions).length}/{VENDOR_CLAIMS.length}</span></span>
                                <span className="text-muted-foreground">Warranty: <span className="font-bold text-foreground">{Object.keys(warrantyActions).length}/{WARRANTY_ALERTS.length}</span></span>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={() => nextStep()}
                                disabled={!allClaimsResolved}
                                className={`w-full py-3 rounded-xl text-xs font-bold shadow-lg transition-all ${
                                    allClaimsResolved
                                        ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-brand-500/20'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
                                }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4" />
                                    {allClaimsResolved
                                        ? 'Submit Claims Report — $2,770 Credits + Expert Notes'
                                        : `Action all items (${Object.keys(claimActions).length + Object.keys(warrantyActions).length}/${VENDOR_CLAIMS.length + WARRANTY_ALERTS.length})`
                                    }
                                </span>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
