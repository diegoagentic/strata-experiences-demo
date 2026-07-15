import React, { useState, useMemo, useRef, useEffect } from 'react';
// Imports removed
import RelocateAssetModal from './components/RelocateAssetModal';
import MaintenanceModal from './components/MaintenanceModal';
import SmartAddAssetModal from './components/SmartAddAssetModal';
import InventoryLocations from './components/InventoryLocations';
import ChangeStatusModal from './components/ChangeStatusModal';
import QuickMovementsModal from './components/QuickMovementsModal';
import { useTenant } from './TenantContext';
import { useDemo } from './context/DemoContext';
import { useDemoProfile } from './context/useDemoProfile';
import { CONTINUA_STEP_TIMING } from './config/profiles/continua-demo';
import { AIAgentAvatar } from './components/simulations/DemoAvatars';
import Breadcrumbs from './components/Breadcrumbs';
import {
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    Squares2X2Icon,
    ListBulletIcon,
    PlusIcon,
    EllipsisHorizontalIcon,
    MapPinIcon,
    WrenchScrewdriverIcon,
    TrashIcon,
    ArrowPathRoundedSquareIcon,
    TagIcon,
    BuildingOfficeIcon,
    CubeIcon,
    BoltIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    FunnelIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    QrCodeIcon,
    ClipboardDocumentCheckIcon,
    TruckIcon,
    ChartBarIcon,
    CurrencyDollarIcon, // Keep only one
    PhotoIcon,
    LightBulbIcon,
    ComputerDesktopIcon,
    TableCellsIcon,
    ArchiveBoxIcon,
    ArrowRightIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// --- Mock Data ---

interface InventoryItem {
    id: string;
    assetName: string;
    description: string;
    category: string;
    location: string;
    locationType: 'Project' | 'Warehouse' | 'Office' | 'Consignment';
    status: 'Available' | 'Under Maintenance' | 'In Use' | 'Reserved' | 'In Consignment' | 'Sold' | 'Write-off';
    value: number;
    carbonImpact: 'Low Impact' | 'Medium Impact' | 'High Impact';
    image?: string;
}

const BASE_INVENTORY_ITEMS = [
    {
        assetName: 'LED Desk Lamp',
        description: 'Lighting • Desk Lamp',
        category: 'Lighting',
        location: 'Office Renovation Project',
        locationType: 'Project',
        status: 'Under Maintenance',
        value: 85.00,
        carbonImpact: 'Low Impact',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800'
    },
    {
        assetName: 'Executive Office Chair',
        description: 'Furniture • Chair',
        category: 'Furniture',
        location: 'Reception Area',
        locationType: 'Office',
        status: 'Available',
        value: 450.00,
        carbonImpact: 'Low Impact',
        image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=800'
    },
    {
        assetName: 'LED Ceiling Panel 40W #2',
        description: 'Lighting • LED Panel',
        category: 'Lighting',
        location: 'Main Warehouse',
        locationType: 'Warehouse',
        status: 'Available',
        value: 192.00,
        carbonImpact: 'Low Impact',
        image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=800'
    },
    {
        assetName: 'Glass Office Partition',
        description: 'Partitions • Partition',
        category: 'Partitions',
        location: 'Main Warehouse',
        locationType: 'Warehouse',
        status: 'Available',
        value: 689.00,
        carbonImpact: 'Low Impact',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'
    },
    {
        assetName: 'LED Ceiling Panel 40W #1',
        description: 'Lighting • LED Panel',
        category: 'Lighting',
        location: 'Main Warehouse',
        locationType: 'Warehouse',
        status: 'Available',
        value: 192.00,
        carbonImpact: 'Low Impact',
        image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800'
    },
    {
        assetName: 'Standing Desk (Motorized)',
        description: 'Furniture • Desk',
        category: 'Furniture',
        location: 'Floor 3 Open Plan',
        locationType: 'Office',
        status: 'In Use',
        value: 850.00,
        carbonImpact: 'Medium Impact',
        image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&q=80&w=800'
    },
    {
        assetName: 'Conference Table (Oak)',
        description: 'Furniture • Table',
        category: 'Furniture',
        location: 'Main Warehouse',
        locationType: 'Warehouse',
        status: 'Reserved',
        value: 1200.00,
        carbonImpact: 'Medium Impact',
        image: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=800'
    }
];

const MOCK_INVENTORY: InventoryItem[] = Array.from({ length: 50 }, (_, i) => {
    const template = BASE_INVENTORY_ITEMS[i % BASE_INVENTORY_ITEMS.length];
    return {
        ...template,
        id: `${i + 1}`,
        assetName: `${template.assetName} ${Math.floor(i / BASE_INVENTORY_ITEMS.length) + 1}`, // Add number to differentiate
        status: i % 5 === 0 ? 'Under Maintenance' : i % 3 === 0 ? 'In Use' : 'Available',
    } as InventoryItem;
});

// Summary Data adapted for Inventory by Time Period
type InvTimePeriod = 'Day' | 'Week' | 'Month' | 'Quarter';
type InvSummaryItem = { label: string; value: string; sub: string; icon: JSX.Element; color: string; trend: string; trendUp: boolean };

const inventorySummaryByPeriod: Record<InvTimePeriod, Record<string, InvSummaryItem>> = {
    Day: {
        total_assets: { label: 'Total Assets', value: '1,248', sub: '+3 today', icon: <CubeIcon className="w-5 h-5" />, color: 'blue', trend: '+3', trendUp: true },
        total_value: { label: 'Total Value', value: '$482.5k', sub: 'Current inventory', icon: <TagIcon className="w-5 h-5" />, color: 'green', trend: '+0.2%', trendUp: true },
        low_stock: { label: 'Low Stock', value: '14', sub: 'Action required', icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'orange', trend: '0', trendUp: true },
        utilization: { label: 'Utilization', value: '89%', sub: 'Assets in use', icon: <BoltIcon className="w-5 h-5" />, color: 'purple', trend: '+2%', trendUp: true },
        pending_moves: { label: 'Pending Moves', value: '5', sub: 'In transit', icon: <TruckIcon className="w-5 h-5" />, color: 'indigo', trend: '+2', trendUp: true },
    },
    Week: {
        total_assets: { label: 'Total Assets', value: '1,248', sub: '+12 this week', icon: <CubeIcon className="w-5 h-5" />, color: 'blue', trend: '+12', trendUp: true },
        total_value: { label: 'Total Value', value: '$482.5k', sub: 'Current inventory', icon: <TagIcon className="w-5 h-5" />, color: 'green', trend: '+1.5%', trendUp: true },
        low_stock: { label: 'Low Stock', value: '14', sub: 'Action required', icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'orange', trend: '-2', trendUp: false },
        utilization: { label: 'Utilization', value: '87%', sub: 'Assets in use', icon: <BoltIcon className="w-5 h-5" />, color: 'purple', trend: '+1%', trendUp: true },
        pending_moves: { label: 'Pending Moves', value: '23', sub: 'In transit', icon: <TruckIcon className="w-5 h-5" />, color: 'indigo', trend: '+8', trendUp: true },
    },
    Month: {
        total_assets: { label: 'Total Assets', value: '1,248', sub: '+48 this month', icon: <CubeIcon className="w-5 h-5" />, color: 'blue', trend: '+48', trendUp: true },
        total_value: { label: 'Total Value', value: '$482.5k', sub: 'Current inventory', icon: <TagIcon className="w-5 h-5" />, color: 'green', trend: '+5.3%', trendUp: true },
        low_stock: { label: 'Low Stock', value: '14', sub: 'Action required', icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'orange', trend: '+3', trendUp: true },
        utilization: { label: 'Utilization', value: '87%', sub: 'Assets in use', icon: <BoltIcon className="w-5 h-5" />, color: 'purple', trend: '+4%', trendUp: true },
        pending_moves: { label: 'Pending Moves', value: '23', sub: 'In transit', icon: <TruckIcon className="w-5 h-5" />, color: 'indigo', trend: '+5', trendUp: true },
    },
    Quarter: {
        total_assets: { label: 'Total Assets', value: '1,248', sub: '+142 this quarter', icon: <CubeIcon className="w-5 h-5" />, color: 'blue', trend: '+142', trendUp: true },
        total_value: { label: 'Total Value', value: '$482.5k', sub: 'Current inventory', icon: <TagIcon className="w-5 h-5" />, color: 'green', trend: '+12.8%', trendUp: true },
        low_stock: { label: 'Low Stock', value: '14', sub: 'Action required', icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'orange', trend: '+6', trendUp: true },
        utilization: { label: 'Utilization', value: '82%', sub: 'Assets in use', icon: <BoltIcon className="w-5 h-5" />, color: 'purple', trend: '-3%', trendUp: false },
        pending_moves: { label: 'Pending Moves', value: '67', sub: 'In transit', icon: <TruckIcon className="w-5 h-5" />, color: 'indigo', trend: '+22', trendUp: true },
    },
};

// Color Mapping for Status Icons (from Transactions)
const colorStyles: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/30',
    purple: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30',
    orange: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30',
    green: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30',
    pink: 'bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300 ring-1 ring-inset ring-pink-600/20 dark:ring-pink-400/30',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30',
};

// ─── Continua Step 1.4: Warehouse Receiving Constants ──────────────────────────
const RECEIVING_AGENTS = [
    { name: 'ShipmentScanner', detail: 'Processing 3 shipments at Chicago warehouse...' },
    { name: 'QRMatcher', detail: 'Auto-matching QR scans vs PO line items — 47/50...' },
    { name: 'QCInspector', detail: 'Quality check: 2 task chairs flagged — fabric defect...' },
    { name: 'LocationAssigner', detail: 'Assigning Zone B, Rack 14 — utilization 72%...' },
    { name: 'WarrantyReporter', detail: 'Auto-reporting defects to manufacturer...' },
]

const SHIPMENT_DATA = [
    { id: 'SHP-001', manufacturer: 'MillerKnoll', items: 25, matched: 24, status: 'partial' as const, defects: 1 },
    { id: 'SHP-002', manufacturer: 'DIRTT Environmental', items: 15, matched: 15, status: 'complete' as const, defects: 0 },
    { id: 'SHP-003', manufacturer: 'Steelcase', items: 10, matched: 8, status: 'partial' as const, defects: 1 },
]

const QC_FLAGS = [
    { item: 'Aeron Task Chair (Graphite)', sku: 'HM-AER-GR-001', defect: 'Fabric tear on left armrest', severity: 'Major' as const },
    { item: 'Aeron Task Chair (Graphite)', sku: 'HM-AER-GR-002', defect: 'Seat mesh discoloration', severity: 'Minor' as const },
]

type ReceivingPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results'

// ─── Continua Step 3.1: Inventory Health & Forecasting Constants ───────────
const INVENTORY_HEALTH_AGENTS = [
    { name: 'InventoryScanner', detail: 'Scanning 2,400 items across 3 warehouses...' },
    { name: 'CapacityForecaster', detail: 'Projecting Chicago warehouse → 85% in 2 weeks (UAL phase 3)...' },
    { name: 'OverflowOptimizer', detail: 'Identifying 120 items for relocation to overflow...' },
    { name: 'CostAnalyzer', detail: 'Calculating storage savings — $4,200/month if relocated...' },
    { name: 'ReportGenerator', detail: 'Generating executive summary with recommendations...' },
]
const WAREHOUSE_DATA = [
    { name: 'Chicago', current: 68, forecast: 85, items: 1420, alert: true, alertText: 'Reaches 85% in 2 weeks with UAL phase 3 deliveries' },
    { name: 'Minneapolis', current: 52, items: 640, alert: false, forecast: 52 },
    { name: 'Madison', current: 41, items: 340, alert: false, forecast: 41 },
]
const RELOCATION_RECS = [
    { from: 'Chicago — Staging Area B', to: 'Minneapolis — Overflow Bay 3', items: 80, type: 'Furniture (staging)', savings: '$2,800/mo' },
    { from: 'Chicago — Rack 12-14', to: 'Madison — Bay 7', items: 40, type: 'AV Equipment (allocated)', savings: '$1,400/mo' },
]
type HealthPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results'

// ─── Continua Step 1.4: Multi-Location Sync Constants ──────────────────────
const LOCATION_SYNC_AGENTS = [
    { name: 'LocationSync', detail: 'Synchronizing 3 warehouses + 2 active job sites...' },
    { name: 'TransitTracker', detail: '45 items in-transit Chicago → project site...' },
    { name: 'QCMonitor', detail: '12 items pending QC at Minneapolis...' },
    { name: 'RouteOptimizer', detail: 'Consolidating 2 deliveries to same site — $1,800 savings...' },
    { name: 'MapUpdater', detail: 'Updating real-time location map for all assets...' },
]
const LOCATION_STATUS = [
    { name: 'Chicago Warehouse', type: 'Warehouse' as const, items: 1420, inTransit: 45, status: 'Active' as const, utilization: 68 },
    { name: 'Minneapolis Warehouse', type: 'Warehouse' as const, items: 640, pendingQC: 12, status: 'Active' as const, utilization: 52 },
    { name: 'Madison Warehouse', type: 'Warehouse' as const, items: 340, allocated: 8, status: 'Active' as const, utilization: 41 },
    { name: 'UAL HQ — Floors 4-6', type: 'Job Site' as const, items: 180, receiving: true, status: 'Receiving' as const },
    { name: 'UAL HQ — Floor 7', type: 'Job Site' as const, items: 0, status: 'Teardown' as const },
]
type SyncPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results'

// ─── Continua Step 1.2: Reuse Assessment & Cataloging Constants ──────────────
const REUSE_AGENTS = [
    { name: 'ConditionScanner', detail: 'Scanning 340 items from floor 7 teardown...' },
    { name: 'ReuseClassifier', detail: 'Classifying: 180 reusable, 95 recyclable, 65 EOL...' },
    { name: 'ValueEstimator', detail: 'Estimating refurbishment value — $89K savings...' },
    { name: 'CatalogWriter', detail: 'Auto-listing 180 items with "Refurbished" tag...' },
    { name: 'SustainabilityCalc', detail: 'Carbon offset: 2.4 tons CO₂ diverted from landfill...' },
]
const REUSE_ITEMS = [
    { category: 'Task Chairs', reusable: 8, recyclable: 3, eol: 2, value: '$12,400', condition: 4.2 },
    { category: 'Sit-Stand Desks', reusable: 4, recyclable: 2, eol: 1, value: '$8,600', condition: 3.8 },
    { category: 'Conference Tables', reusable: 3, recyclable: 1, eol: 0, value: '$6,200', condition: 4.5 },
    { category: 'Storage/Filing', reusable: 5, recyclable: 4, eol: 3, value: '$4,800', condition: 3.1 },
]
type ReusePhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results'

// ─── Continua Step 1.5: Consignment & Vendor Returns Constants ──────────────
const CONSIGN_AGENTS = [
    { name: 'ConsignmentTracker', detail: 'Tracking 35 items across 4 manufacturers...' },
    { name: 'ReturnAnalyzer', detail: '12 items approaching 90-day window — 8 high-value...' },
    { name: 'DemandPredictor', detail: 'Demand trending up 12% — 4 items worth converting...' },
    { name: 'RMAGenerator', detail: 'Auto-generating 4 RMA requests ($8,200 total)...' },
    { name: 'DecisionOptimizer', detail: 'Recommending 4 convert-to-purchase ($3,400 savings)...' },
]
const CONSIGNMENT_ITEMS = [
    { name: 'Aeron Chairs (4)', mfr: 'Herman Miller', daysLeft: 8, value: '$4,800', action: 'RMA' as const },
    { name: 'Leap V2 Chairs (4)', mfr: 'Steelcase', daysLeft: 12, value: '$3,400', action: 'RMA' as const },
    { name: 'Migration Desks (2)', mfr: 'Steelcase', daysLeft: 22, value: '$2,400', action: 'Convert' as const },
    { name: 'Resolve Panels (2)', mfr: 'Herman Miller', daysLeft: 35, value: '$1,000', action: 'Convert' as const },
]
type ConsignPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results'

// ─── FM Flow: Quick Action Relocation (2.4) ──────────────────────────────────
type FMRelocPhase = 'idle' | 'notification' | 'modal-open' | 'committed'

// --- Components ---

interface PageProps {
    onLogout: () => void;
    onNavigateToDetail: () => void;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: string) => void;
}

export default function Inventory({ onLogout, onNavigateToDetail, onNavigateToWorkspace, onNavigate }: PageProps) {
    const { currentTenant } = useTenant();
    const { currentStep, nextStep, isPaused } = useDemo();
    const { activeProfile } = useDemoProfile();
    const isContinua = activeProfile.id === 'continua';
    const stepId = currentStep?.id || '';

    // Pause-aware timer helper
    const isPausedRef = useRef(isPaused);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    const pauseAware = React.useCallback((fn: () => void) => {
        return () => {
            if (!isPausedRef.current) { fn(); return; }
            const poll = setInterval(() => {
                if (!isPausedRef.current) { clearInterval(poll); fn(); }
            }, 200);
        };
    }, []);

    // ─── Continua Step 1.4: Warehouse Receiving ───────────────────────────────
    const [rcvPhase, setRcvPhase] = useState<ReceivingPhase>('idle');
    const rcvPhaseRef = useRef(rcvPhase);
    useEffect(() => { rcvPhaseRef.current = rcvPhase; }, [rcvPhase]);
    const [rcvAgents, setRcvAgents] = useState(RECEIVING_AGENTS.map(a => ({ ...a, visible: false, done: false })));
    const [rcvProgress, setRcvProgress] = useState(0);

    // Continua 3.5: orchestration
    const tp14 = CONTINUA_STEP_TIMING['1.4'];
    useEffect(() => {
        if (!isContinua || stepId !== '3.5') { setRcvPhase('idle'); return; }
        setRcvPhase('idle');
        setRcvAgents(RECEIVING_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setRcvPhase('notification')), tp14.notifDelay));
        timers.push(setTimeout(pauseAware(() => {
            if (rcvPhaseRef.current === 'notification') setRcvPhase('processing');
        }), tp14.notifDelay + tp14.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [isContinua, stepId]);

    // Continua 1.4: processing → breathing
    useEffect(() => {
        if (rcvPhase !== 'processing') return;
        setRcvAgents(RECEIVING_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        setRcvProgress(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setRcvProgress(100), 50));
        RECEIVING_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setRcvAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * tp14.agentStagger));
            timers.push(setTimeout(pauseAware(() => setRcvAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * tp14.agentStagger + tp14.agentDone));
        });
        timers.push(setTimeout(pauseAware(() => setRcvPhase('breathing')), RECEIVING_AGENTS.length * tp14.agentStagger + tp14.agentDone + 300));
        return () => timers.forEach(clearTimeout);
    }, [rcvPhase]);

    // Continua 1.4: breathing → revealed
    useEffect(() => {
        if (rcvPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setRcvPhase('revealed')), tp14.breathing);
        return () => clearTimeout(t);
    }, [rcvPhase]);

    // Continua 1.4: revealed → results
    useEffect(() => {
        if (rcvPhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setRcvPhase('results')), 1500);
        return () => clearTimeout(t);
    }, [rcvPhase]);

    // ─── Continua Step 3.1: Inventory Health & Forecasting ──────────────────────
    const [hlthPhase, setHlthPhase] = useState<HealthPhase>('idle');
    const hlthPhaseRef = useRef(hlthPhase);
    useEffect(() => { hlthPhaseRef.current = hlthPhase; }, [hlthPhase]);
    const [hlthAgents, setHlthAgents] = useState(INVENTORY_HEALTH_AGENTS.map(a => ({ ...a, visible: false, done: false })));
    const [hlthProgress, setHlthProgress] = useState(0);

    // Continua 3.1: orchestration
    const tp31 = CONTINUA_STEP_TIMING['3.1'];
    useEffect(() => {
        if (!isContinua || stepId !== '1.1') { setHlthPhase('idle'); return; }
        setHlthPhase('idle');
        setHlthAgents(INVENTORY_HEALTH_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        setActiveTab('inventory');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setHlthPhase('notification')), tp31.notifDelay));
        timers.push(setTimeout(pauseAware(() => {
            if (hlthPhaseRef.current === 'notification') setHlthPhase('processing');
        }), tp31.notifDelay + tp31.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [isContinua, stepId]);

    // Continua 3.1: processing → breathing
    useEffect(() => {
        if (hlthPhase !== 'processing') return;
        setHlthAgents(INVENTORY_HEALTH_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        setHlthProgress(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setHlthProgress(100), 50));
        INVENTORY_HEALTH_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setHlthAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * tp31.agentStagger));
            timers.push(setTimeout(pauseAware(() => setHlthAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * tp31.agentStagger + tp31.agentDone));
        });
        timers.push(setTimeout(pauseAware(() => setHlthPhase('breathing')), INVENTORY_HEALTH_AGENTS.length * tp31.agentStagger + tp31.agentDone + 300));
        return () => timers.forEach(clearTimeout);
    }, [hlthPhase]);

    // Continua 3.1: breathing → revealed
    useEffect(() => {
        if (hlthPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setHlthPhase('revealed')), tp31.breathing);
        return () => clearTimeout(t);
    }, [hlthPhase]);

    // Continua 3.1: revealed → results
    useEffect(() => {
        if (hlthPhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setHlthPhase('results')), 1500);
        return () => clearTimeout(t);
    }, [hlthPhase]);

    // ─── Continua Step 1.4: Multi-Location Sync ─────────────────────────────────
    const [syncPhase, setSyncPhase] = useState<SyncPhase>('idle');
    const syncPhaseRef = useRef(syncPhase);
    useEffect(() => { syncPhaseRef.current = syncPhase; }, [syncPhase]);
    const [syncAgents, setSyncAgents] = useState(LOCATION_SYNC_AGENTS.map(a => ({ ...a, visible: false, done: false })));
    const [syncProgress, setSyncProgress] = useState(0);

    // Continua 1.4: orchestration (uses timing profile '3.5')
    const tp34 = CONTINUA_STEP_TIMING['3.5'];
    useEffect(() => {
        if (!isContinua || stepId !== '1.4') { setSyncPhase('idle'); return; }
        setSyncPhase('idle');
        setSyncAgents(LOCATION_SYNC_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        setActiveTab('locations');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setSyncPhase('notification')), tp34.notifDelay));
        timers.push(setTimeout(pauseAware(() => {
            if (syncPhaseRef.current === 'notification') setSyncPhase('processing');
        }), tp34.notifDelay + tp34.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [isContinua, stepId]);

    // Continua 1.4: processing → breathing
    useEffect(() => {
        if (syncPhase !== 'processing') return;
        setSyncAgents(LOCATION_SYNC_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        setSyncProgress(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setSyncProgress(100), 50));
        LOCATION_SYNC_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setSyncAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * tp34.agentStagger));
            timers.push(setTimeout(pauseAware(() => setSyncAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * tp34.agentStagger + tp34.agentDone));
        });
        timers.push(setTimeout(pauseAware(() => setSyncPhase('breathing')), LOCATION_SYNC_AGENTS.length * tp34.agentStagger + tp34.agentDone + 300));
        return () => timers.forEach(clearTimeout);
    }, [syncPhase]);

    // Continua 1.4: breathing → revealed
    useEffect(() => {
        if (syncPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setSyncPhase('revealed')), tp34.breathing);
        return () => clearTimeout(t);
    }, [syncPhase]);

    // Continua 1.4: revealed → results
    useEffect(() => {
        if (syncPhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setSyncPhase('results')), 1500);
        return () => clearTimeout(t);
    }, [syncPhase]);

    // Continua 1.4: card animation — animate status chips after results render
    const [syncCardsAnimated, setSyncCardsAnimated] = useState(false);
    useEffect(() => {
        if (syncPhase !== 'results') { setSyncCardsAnimated(false); return; }
        const t = setTimeout(pauseAware(() => setSyncCardsAnimated(true)), 2000);
        return () => clearTimeout(t);
    }, [syncPhase]);

    // Continua 1.4: auto-advance (System role, from results)
    useEffect(() => {
        if (syncPhase !== 'results') return;
        const t = setTimeout(pauseAware(() => nextStep()), tp34.resultsDur);
        return () => clearTimeout(t);
    }, [syncPhase]);

    // ─── Continua Step 1.2: Reuse Assessment state ─────────────────────────
    const [reusePhase, setReusePhase] = useState<ReusePhase>('idle')
    const reusePhaseRef = useRef(reusePhase)
    useEffect(() => { reusePhaseRef.current = reusePhase }, [reusePhase])
    const [reuseAgents, setReuseAgents] = useState(REUSE_AGENTS.map(a => ({ ...a, visible: false, done: false })))
    const [reuseProgress, setReuseProgress] = useState(0)

    const tp12 = CONTINUA_STEP_TIMING['1.2'];
    useEffect(() => {
        if (!isContinua || stepId !== '1.2') { setReusePhase('idle'); return; }
        setReusePhase('idle');
        setReuseAgents(REUSE_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setReusePhase('notification')), tp12.notifDelay));
        timers.push(setTimeout(pauseAware(() => {
            if (reusePhaseRef.current === 'notification') setReusePhase('processing');
        }), tp12.notifDelay + tp12.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [isContinua, stepId]);

    useEffect(() => {
        if (reusePhase !== 'processing') return;
        setReuseAgents(REUSE_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        setReuseProgress(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setReuseProgress(100), 50));
        REUSE_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setReuseAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * tp12.agentStagger));
            timers.push(setTimeout(pauseAware(() => setReuseAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * tp12.agentStagger + tp12.agentDone));
        });
        timers.push(setTimeout(pauseAware(() => setReusePhase('breathing')), REUSE_AGENTS.length * tp12.agentStagger + tp12.agentDone + 300));
        return () => timers.forEach(clearTimeout);
    }, [reusePhase]);

    useEffect(() => {
        if (reusePhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setReusePhase('revealed')), tp12.breathing);
        return () => clearTimeout(t);
    }, [reusePhase]);

    useEffect(() => {
        if (reusePhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setReusePhase('results')), 1500);
        return () => clearTimeout(t);
    }, [reusePhase]);

    // ─── Continua Step 1.5: Consignment & Vendor Returns state ───────────
    const [consignPhase, setConsignPhase] = useState<ConsignPhase>('idle')
    const consignPhaseRef = useRef(consignPhase)
    useEffect(() => { consignPhaseRef.current = consignPhase }, [consignPhase])
    const [consignAgents, setConsignAgents] = useState(CONSIGN_AGENTS.map(a => ({ ...a, visible: false, done: false })))
    const [consignProgress, setConsignProgress] = useState(0)

    const tp15 = CONTINUA_STEP_TIMING['1.5'];
    useEffect(() => {
        if (!isContinua || stepId !== '1.5') { setConsignPhase('idle'); return; }
        setConsignPhase('idle');
        setConsignAgents(CONSIGN_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setConsignPhase('notification')), tp15.notifDelay));
        timers.push(setTimeout(pauseAware(() => {
            if (consignPhaseRef.current === 'notification') setConsignPhase('processing');
        }), tp15.notifDelay + tp15.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [isContinua, stepId]);

    useEffect(() => {
        if (consignPhase !== 'processing') return;
        setConsignAgents(CONSIGN_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        setConsignProgress(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setConsignProgress(100), 50));
        CONSIGN_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setConsignAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * tp15.agentStagger));
            timers.push(setTimeout(pauseAware(() => setConsignAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * tp15.agentStagger + tp15.agentDone));
        });
        timers.push(setTimeout(pauseAware(() => setConsignPhase('breathing')), CONSIGN_AGENTS.length * tp15.agentStagger + tp15.agentDone + 300));
        return () => timers.forEach(clearTimeout);
    }, [consignPhase]);

    useEffect(() => {
        if (consignPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setConsignPhase('revealed')), tp15.breathing);
        return () => clearTimeout(t);
    }, [consignPhase]);

    useEffect(() => {
        if (consignPhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setConsignPhase('results')), 1500);
        return () => clearTimeout(t);
    }, [consignPhase]);

    // ─── FM Step 2.4: Quick Action Relocation state ──────────────────────────
    const [fmRelocPhase, setFmRelocPhase] = useState<FMRelocPhase>('idle')

    // 2.4 orchestration — notification after delay
    const tp24 = CONTINUA_STEP_TIMING['2.4'];
    useEffect(() => {
        if (!isContinua || stepId !== '2.4') { setFmRelocPhase('idle'); return; }
        setFmRelocPhase('idle');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setFmRelocPhase('notification')), tp24.notifDelay));
        return () => timers.forEach(clearTimeout);
    }, [isContinua, stepId]);

    // 2.4: modal-open → open the QuickMovementsModal
    useEffect(() => {
        if (fmRelocPhase !== 'modal-open') return;
        setIsQuickMovementsModalOpen(true);
    }, [fmRelocPhase]);

    // 2.4: committed → auto-advance after delay
    useEffect(() => {
        if (fmRelocPhase !== 'committed') return;
        const t = setTimeout(pauseAware(() => nextStep()), 2000);
        return () => clearTimeout(t);
    }, [fmRelocPhase]);

    // State
    const [inventoryData, setInventoryData] = useState<InventoryItem[]>(MOCK_INVENTORY);
    const [invTimePeriod, setInvTimePeriod] = useState<InvTimePeriod>('Month');
    const [activeTab, setActiveTab] = useState<'inventory' | 'locations'>('inventory');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showMetrics, setShowMetrics] = useState(false); // Collapsible status

    // Toast State
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ title: '', description: '', action: '' });

    // Toast Timer Ref
    const toastTimerRef = useRef<any>(null);

    const triggerToast = (title: string, description: string, action: string) => {
        setToastMessage({ title, description, action });
        setShowToast(true);

        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setShowToast(false), 5000);
    };

    // Modal State
    const [isRelocateModalOpen, setIsRelocateModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isQuickMovementsModalOpen, setIsQuickMovementsModalOpen] = useState(false);

    // Refs for scrolling
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
        if (ref.current) {
            const scrollAmount = 300;
            ref.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Filters
    const [filterStatus, setFilterStatus] = useState('All Statuses');
    const [filterLocation, setFilterLocation] = useState('All Locations');
    const [filterType, setFilterType] = useState('All Types');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = viewMode === 'grid' ? 12 : 10;

    // Derived Data
    const uniqueLocations = useMemo(() => Array.from(new Set(inventoryData.map(i => i.location))), [inventoryData]);
    const uniqueTypes = useMemo(() => Array.from(new Set(inventoryData.map(i => i.locationType))), [inventoryData]);

    const filteredData = useMemo(() => {
        return inventoryData.filter(item => {
            const matchesSearch = item.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === 'All Statuses' || item.status === filterStatus;
            const matchesLocation = filterLocation === 'All Locations' || item.location === filterLocation;
            const matchesType = filterType === 'All Types' || item.locationType === filterType;

            return matchesSearch && matchesStatus && matchesLocation && matchesType;
        });
    }, [inventoryData, searchQuery, filterStatus, filterLocation, filterType]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus, filterLocation, filterType, viewMode]);

    // Handlers
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === filteredData.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredData.map(i => i.id)));
        }
    };

    // Action Handlers
    const handleRelocateConfirm = (data: any) => {
        if (data.targetLocation) {
            setInventoryData(prev => prev.map(item => {
                if (selectedIds.has(item.id)) {
                    return {
                        ...item,
                        location: data.targetLocation,
                        // Optionally update locationType if we had a mapping, but for now just location.
                    };
                }
                return item;
            }));

            setSelectedIds(new Set());
        }

        console.log('Relocation Requested:', data);
        triggerToast('Asset Move Requested', `Asset #${Array.from(selectedIds)[0] || 'Unknown'} moved to new location.`, 'Movements');
    };

    const handleMaintenanceConfirm = (data: any) => {
        console.log('Maintenance Scheduled:', data);
        triggerToast('Maintenance Scheduled', 'Maintenance request has been created successfully.', 'Maintenance');
    };

    const handleAddAssetConfirm = (newData: any) => {
        const newItems = Array.isArray(newData) ? newData : [newData];

        // Transform form data to InventoryItem type
        const formattedItems = newItems.map((item: any) => ({
            id: item.id || `new-${Math.random().toString(36).substr(2, 9)}`,
            assetName: item.assetName,
            description: `${item.category} • ${item.subCategory || item.category}`,
            category: item.category,
            location: item.location || 'Unassigned',
            locationType: 'Warehouse' as 'Project' | 'Warehouse' | 'Office' | 'Consignment',
            status: item.status || 'Available',
            value: parseFloat(item.value) || 0,
            carbonImpact: 'Low Impact' as 'Low Impact' | 'Medium Impact' | 'High Impact',
            image: item.image // Pass through custom image if any
        }));

        setInventoryData(prev => [...formattedItems, ...prev]);
        console.log('Assets Added:', formattedItems);
    };

    const handleStatusConfirm = (data: any) => {
        setInventoryData(prev => prev.map(item => {
            if (selectedIds.has(item.id)) {
                const updates: any = { status: data.status };

                // Handle Consignment Logic
                if (data.status === 'In Consignment' && data.consignmentLocation) {
                    updates.location = data.consignmentLocation;
                    updates.locationType = 'Consignment';
                } else if (data.status === 'Available' && item.status === 'In Consignment') {
                    updates.location = 'Main Warehouse';
                    updates.locationType = 'Warehouse';
                }

                return { ...item, ...updates };
            }
            return item;
        }));
        setSelectedIds(new Set());
        console.log('Status Updated:', data);
    };

    // Helper for Status Badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Available': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Under Maintenance': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'In Use': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Reserved': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'In Consignment': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Sold': return 'bg-zinc-100 text-muted-foreground dark:bg-card dark:text-muted-foreground line-through opacity-75';
            case 'Write-off': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-zinc-100 text-muted-foreground dark:bg-card dark:text-muted-foreground';
        }
    };

    const getImpactBadge = (impact: string) => {
        return impact === 'Low Impact'
            ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10'
            : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10';
    };

    const getCategoryIcon = (category: string, className: string = "w-12 h-12 mb-2 text-zinc-300 dark:text-muted-foreground") => {
        switch (category) {
            case 'Lighting': return <LightBulbIcon className={className} />;
            case 'Furniture': return <TableCellsIcon className={className} />; // TableCells as generic furniture/desk
            case 'Partitions': return <Squares2X2Icon className={className} />;
            default: return <ArchiveBoxIcon className={className} />;
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-24 relative">
            <div className="pt-24 px-4 max-w-7xl mx-auto space-y-6">

                {/* Breadcrumbs */}
                <div className="mb-4">
                    <Breadcrumbs
                        items={[
                            { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
                            { label: 'Inventory' }
                        ]}
                    />
                </div>

                {/* Header Container */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        {/* Pill-style Tabs (Matching Transactions) */}
                        <div className="flex gap-1 bg-zinc-100 dark:bg-card/50 p-1 rounded-lg w-fit overflow-x-auto max-w-full border border-border">
                            {[
                                { id: 'inventory', label: 'Inventory', count: MOCK_INVENTORY.length },
                                { id: 'locations', label: 'Locations', count: 4 }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 outline-none whitespace-nowrap",
                                        activeTab === tab.id
                                            ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"

                                            : "hover:text-zinc-900 hover:bg-brand-300 dark:hover:bg-brand-600/50 dark:hover:text-white"
                                    )}
                                >
                                    {tab.label}
                                    {tab.count !== null && (
                                        <span className={cn(
                                            "text-xs px-1.5 py-0.5 rounded-full transition-colors",
                                            activeTab === tab.id
                                                ? "bg-primary-foreground/20 text-primary-foreground"
                                                : "bg-background text-muted-foreground group-hover:bg-muted font-medium"
                                        )}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Collapsible Summary Section */}
                {showMetrics ? (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between mb-4">
                            {/* Period Selector inside expanded metrics */}
                            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 border border-border/50">
                                {(['Day', 'Week', 'Month', 'Quarter'] as InvTimePeriod[]).map((period) => (
                                    <button key={period} onClick={() => setInvTimePeriod(period)} className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${period === invTimePeriod ? 'bg-white dark:bg-brand-400 text-foreground dark:text-zinc-900 shadow-sm border border-border dark:border-transparent' : 'text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-700'}`}>
                                        {period}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setShowMetrics(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Hide Details <ChevronUpIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 overflow-x-auto pb-4">
                            {Object.entries(inventorySummaryByPeriod[invTimePeriod]).map(([key, data]) => (
                                <div key={key} className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all group min-w-[200px]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{data.label}</p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <p className="text-3xl font-semibold text-foreground group-hover:scale-105 transition-transform origin-left">{data.value}</p>
                                                <span className={`text-xs font-semibold ${data.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                    {data.trendUp ? '\u2191' : '\u2193'}{data.trend}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className={cn("p-3 rounded-xl relative group", colorStyles[data.color] || 'bg-muted text-muted-foreground')}
                                            title={data.label}
                                        >
                                            {data.icon}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                        <span className="font-medium">{data.sub}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Expanded Quick Actions Row */}
                        <div className="flex flex-wrap items-center gap-4 mt-2 animate-in fade-in slide-in-from-top-3 duration-500 delay-100">
                            <span className="text-sm font-medium text-muted-foreground">Quick Actions:</span>
                            {[
                                { icon: <PlusIcon className="w-4 h-4" />, label: "Add Stock", onClick: () => setIsAddAssetModalOpen(true) },
                                { icon: <ArrowPathRoundedSquareIcon className="w-4 h-4" />, label: "Transfer", onClick: () => setIsRelocateModalOpen(true) },
                                { icon: <WrenchScrewdriverIcon className="w-4 h-4" />, label: "Maintenance", onClick: () => setIsMaintenanceModalOpen(true) },
                                { icon: <ChartBarIcon className="w-4 h-4" />, label: "Export Report", onClick: () => { } },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={action.onClick}
                                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:border-brand-400 dark:hover:border-zinc-700 hover:text-zinc-900 transition-all shadow-sm"
                                >
                                    {action.icon}
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/60 dark:bg-zinc-800 backdrop-blur-md rounded-2xl p-4 border border-border shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        {/* Period Selector inside collapsed ticker */}
                        <div className="flex items-center gap-0.5 bg-muted/50 rounded-lg p-0.5 shrink-0">
                            {(['Day', 'Week', 'Month', 'Quarter'] as InvTimePeriod[]).map((period) => (
                                <button key={period} onClick={() => setInvTimePeriod(period)} className={`px-2 py-0.5 text-[9px] font-medium rounded transition-all ${period === invTimePeriod ? 'bg-white dark:bg-brand-400 text-foreground dark:text-zinc-900 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                                    {period}
                                </button>
                            ))}
                        </div>
                        {/* Collapsed Ticker View - Carousel */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <button
                                onClick={() => scroll(scrollContainerRef, 'left')}
                                className="p-1.5 rounded-full hover:bg-brand-50 dark:hover:bg-brand-500/15 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>

                            <div
                                ref={scrollContainerRef}
                                className="flex items-center gap-8 overflow-x-auto w-full scrollbar-hide px-2 scroll-smooth"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {Object.entries(inventorySummaryByPeriod[invTimePeriod]).map(([key, data]) => (
                                    <div key={key} className="flex items-center gap-3 min-w-fit group cursor-default">
                                        <div
                                            className={cn("relative flex items-center justify-center w-10 h-10 rounded-full transition-colors", colorStyles[data.color])}
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
                                        {/* Divider (except last) */}
                                        <div className="h-8 w-px bg-border/50 ml-4 hidden md:block lg:hidden xl:block opacity-50"></div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => scroll(scrollContainerRef, 'right')}
                                className="p-1.5 rounded-full hover:bg-brand-50 dark:hover:bg-brand-500/15 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>

                        {/* Quick Actions (Product Owner Context) */}
                        <div className="flex items-center gap-1 overflow-x-auto min-w-max pl-4 border-l border-border xl:border-none xl:pl-0">
                            {[
                                { icon: <QrCodeIcon className="w-5 h-5" />, label: "Scan Item" },
                                { icon: <ArrowPathRoundedSquareIcon className="w-5 h-5" />, label: "Quick Transfer", onClick: () => setIsQuickMovementsModalOpen(true) },
                                { icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />, label: "Start Audit" },
                                { icon: <PlusIcon className="w-5 h-5" />, label: "Add Stock", onClick: () => setIsAddAssetModalOpen(true) },
                            ].map((action, i) => (
                                <button key={i} onClick={action.onClick} className="p-2 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/15 text-muted-foreground hover:text-foreground transition-colors relative group" title={action.label}>
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
                    </div >
                )
                }


                {/* ═══ Continua Step 1.4 — Warehouse Receiving & QC ═══ */}
                {isContinua && stepId === '3.5' && rcvPhase !== 'idle' && (
                    <div className="space-y-4 mb-6">
                        {/* Notification */}
                        {rcvPhase === 'notification' && (
                            <button onClick={() => setRcvPhase('processing')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-brand-500 text-white"><TruckIcon className="h-4 w-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-foreground">Shipment Receiving Initiated</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-white font-bold">3 shipments</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1">ReceivingAgent: Processing <span className="font-semibold text-foreground">3 incoming shipments</span> at Chicago warehouse — QR scan, PO matching, QC inspection.</p>
                                            <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to start receiving <ArrowRightIcon className="h-3 w-3" /></p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Processing */}
                        {rcvPhase === 'processing' && (
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <AIAgentAvatar size="sm" />
                                    <span className="text-xs font-bold text-foreground">ReceivingAgent Processing Shipments...</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                    <div className="h-full rounded-full bg-brand-400 transition-all duration-[3500ms] ease-linear" style={{ width: `${rcvProgress}%` }} />
                                </div>
                                <div className="space-y-1.5">
                                    {rcvAgents.map(agent => (
                                        <div key={agent.name} className={cn("flex items-center gap-2 text-[10px] transition-all duration-300", agent.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")}>
                                            {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-indigo-500 animate-spin shrink-0" />}
                                            <span className={cn("font-medium", agent.done ? "text-foreground" : "text-indigo-600 dark:text-indigo-400")}>{agent.name}</span>
                                            <span className="text-muted-foreground">{agent.detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Breathing */}
                        {rcvPhase === 'breathing' && (
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-semibold text-muted-foreground">Processing complete — syncing external systems...</span>
                            </div>
                        )}

                        {/* Confirmed */}
                        {(rcvPhase === 'revealed' || rcvPhase === 'results') && (
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30 animate-in fade-in duration-300">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-green-800 dark:text-green-200"><span className="font-bold">ReceivingAgent:</span> 3 shipments processed — <span className="font-semibold">47/50 items matched</span>. 2 QC flags raised, warranty claims auto-filed.</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">External Systems · Synced</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                            {['QR Scanner', 'PO Match Engine', 'QC Database', 'Warranty Portal', 'WMS'].map(sys => (
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
                        {rcvPhase === 'results' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                    {/* Header */}
                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Receiving Summary — Chicago Warehouse</h3>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">3 shipments processed · 47/50 matched · Utilization 72%</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold">47 Matched</span>
                                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-bold">2 QC Flags</span>
                                        </div>
                                    </div>

                                    {/* Shipment Cards */}
                                    <div className="p-4 grid grid-cols-3 gap-3">
                                        {SHIPMENT_DATA.map(s => (
                                            <div key={s.id} className={cn("p-3 rounded-xl border", s.defects > 0 ? "border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5" : "border-border bg-muted/20")}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-bold text-foreground">{s.id}</span>
                                                    <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold", s.status === 'complete' ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400")}>{s.status === 'complete' ? 'Complete' : 'Partial'}</span>
                                                </div>
                                                <p className="text-[11px] font-medium text-foreground">{s.manufacturer}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">{s.matched}/{s.items} items matched</p>
                                                {s.defects > 0 && <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1"><ExclamationTriangleIcon className="h-3 w-3" />{s.defects} defect{s.defects > 1 ? 's' : ''} flagged</p>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* QC Flags */}
                                    <div className="mx-4 mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20">
                                        <h4 className="text-xs font-bold text-red-800 dark:text-red-300 mb-2 flex items-center gap-1.5"><ExclamationTriangleIcon className="h-4 w-4" />QC Flags — Auto-Reported to Manufacturer</h4>
                                        <div className="space-y-2">
                                            {QC_FLAGS.map((qc, i) => (
                                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/60 dark:bg-zinc-900/40 border border-red-100 dark:border-red-500/10">
                                                    <div>
                                                        <p className="text-[11px] font-medium text-foreground">{qc.item}</p>
                                                        <p className="text-[10px] text-muted-foreground">{qc.sku} · {qc.defect}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold", qc.severity === 'Major' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>{qc.severity}</span>
                                                        <PhotoIcon className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Location & CTA */}
                                    <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between bg-muted/20">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><MapPinIcon className="h-3.5 w-3.5" /><span className="font-medium text-foreground">Zone B, Rack 14</span></div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><ChartBarIcon className="h-3.5 w-3.5" />Utilization: <span className="font-medium text-foreground">72%</span></div>
                                        </div>
                                        <button onClick={nextStep} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-300 hover:bg-brand-400 dark:bg-brand-400 dark:hover:bg-brand-300 text-zinc-900 text-[11px] font-bold shadow-sm transition-all hover:scale-[1.02]">
                                            <ClipboardDocumentCheckIcon className="h-3.5 w-3.5" />Confirm Receiving<ArrowRightIcon className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ Continua Step 3.1 — Inventory Health & Forecasting ═══ */}
                {isContinua && stepId === '1.1' && hlthPhase !== 'idle' && (
                    <div data-demo-target="inventory-health-forecast" className="space-y-4 mb-6">
                        {/* Notification */}
                        {hlthPhase === 'notification' && (
                            <button onClick={() => setHlthPhase('processing')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-brand-500 text-white"><ChartBarIcon className="h-4 w-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-foreground">Inventory Health Analysis</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold">Capacity Alert</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1">InventoryIntelAgent: <span className="font-semibold text-foreground">2,400 items</span> across 3 warehouses — Chicago warehouse forecast to reach <span className="font-semibold text-amber-600 dark:text-amber-400">85% capacity</span> in 2 weeks.</p>
                                            <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to review analysis <ArrowRightIcon className="h-3 w-3" /></p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Processing */}
                        {hlthPhase === 'processing' && (
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <AIAgentAvatar size="sm" />
                                    <span className="text-xs font-bold text-foreground">InventoryIntelAgent Analyzing Warehouses...</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                    <div className="h-full rounded-full bg-brand-400 transition-all duration-[3500ms] ease-linear" style={{ width: `${hlthProgress}%` }} />
                                </div>
                                <div className="space-y-1.5">
                                    {hlthAgents.map(agent => (
                                        <div key={agent.name} className={cn("flex items-center gap-2 text-[10px] transition-all duration-300", agent.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")}>
                                            {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-indigo-500 animate-spin shrink-0" />}
                                            <span className={cn("font-medium", agent.done ? "text-foreground" : "text-indigo-600 dark:text-indigo-400")}>{agent.name}</span>
                                            <span className="text-muted-foreground">{agent.detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Breathing */}
                        {hlthPhase === 'breathing' && (
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-semibold text-muted-foreground">Processing complete — syncing external systems...</span>
                            </div>
                        )}

                        {/* Confirmed */}
                        {(hlthPhase === 'revealed' || hlthPhase === 'results') && (
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30 animate-in fade-in duration-300">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-green-800 dark:text-green-200"><span className="font-bold">InventoryIntelAgent:</span> Analysis complete — <span className="font-semibold">Chicago at 68%</span>, forecast 85% in 2 weeks. 120 items recommended for relocation — <span className="font-semibold">$4,200/mo savings</span>.</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">External Systems · Synced</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                            {['WMS', 'Capacity Planner', 'Cost Engine', 'Logistics API', 'Forecast Model'].map(sys => (
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
                        {hlthPhase === 'results' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                    {/* Header */}
                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Warehouse Capacity Overview</h3>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">2,400 items · 3 locations · Forecast: 2-week horizon</p>
                                        </div>
                                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">1 Alert</span>
                                    </div>

                                    {/* Warehouse Gauges */}
                                    <div className="p-4 grid grid-cols-3 gap-3">
                                        {WAREHOUSE_DATA.map(wh => (
                                            <div key={wh.name} className={cn("p-3 rounded-xl border", wh.alert ? "border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5" : "border-border bg-muted/20")}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[11px] font-bold text-foreground">{wh.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{wh.items} items</span>
                                                </div>
                                                {/* Gauge bar */}
                                                <div className="h-2 rounded-full bg-muted overflow-hidden mb-1.5">
                                                    <div className={cn("h-full rounded-full transition-all duration-700", wh.current > 70 ? "bg-amber-500" : wh.current > 50 ? "bg-brand-400" : "bg-green-500")} style={{ width: `${wh.current}%` }} />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className={cn("text-xs font-bold", wh.current > 70 ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>{wh.current}%</span>
                                                    {wh.alert && <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">→ {wh.forecast}% in 2wk</span>}
                                                </div>
                                                {wh.alert && <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1"><ExclamationTriangleIcon className="h-3 w-3 shrink-0" />{wh.alertText}</p>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Relocation Recommendations */}
                                    <div className="mx-4 mb-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20">
                                        <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-1.5"><LightBulbIcon className="h-4 w-4" />AI Relocation Recommendations</h4>
                                        <div className="space-y-2">
                                            {RELOCATION_RECS.map((rec, i) => (
                                                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/60 dark:bg-zinc-900/40 border border-indigo-100 dark:border-indigo-500/10">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-medium text-foreground">{rec.items} items · {rec.type}</p>
                                                        <p className="text-[10px] text-muted-foreground mt-0.5">{rec.from} → {rec.to}</p>
                                                    </div>
                                                    <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold shrink-0 ml-2">{rec.savings}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 flex items-center justify-between p-2.5 rounded-lg bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                                            <span className="text-[11px] font-bold text-green-800 dark:text-green-300">Total Monthly Savings</span>
                                            <span className="text-sm font-bold text-green-700 dark:text-green-400">$4,200/mo</span>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between bg-muted/20">
                                        <p className="text-[10px] text-muted-foreground">Relocating 120 items optimizes capacity and reduces storage costs.</p>
                                        <button onClick={nextStep} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-300 hover:bg-brand-400 dark:bg-brand-400 dark:hover:bg-brand-300 text-zinc-900 text-[11px] font-bold shadow-sm transition-all hover:scale-[1.02]">
                                            <CheckCircleIcon className="h-3.5 w-3.5" />Apply Recommendations<ArrowRightIcon className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ Continua Step 1.4 — Multi-Location Sync (auto 8s) ═══ */}
                {isContinua && stepId === '1.4' && syncPhase !== 'idle' && (
                    <div data-demo-target="multi-location-sync" className="space-y-4 mb-6">
                        {/* Notification */}
                        {syncPhase === 'notification' && (
                            <button onClick={() => setSyncPhase('processing')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-blue-600 text-white"><MapPinIcon className="h-4 w-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-foreground">Multi-Location Sync</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">5 locations</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1">LocationSyncAgent: Synchronizing <span className="font-semibold text-foreground">3 warehouses + 2 job sites</span> — tracking in-transit items, pending QC, optimizing delivery routes.</p>
                                            <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to start sync <ArrowRightIcon className="h-3 w-3" /></p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Processing */}
                        {syncPhase === 'processing' && (
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <AIAgentAvatar size="sm" />
                                    <span className="text-xs font-bold text-foreground">LocationSyncAgent Synchronizing...</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                    <div className="h-full rounded-full bg-blue-500 transition-all duration-[3500ms] ease-linear" style={{ width: `${syncProgress}%` }} />
                                </div>
                                <div className="space-y-1.5">
                                    {syncAgents.map(agent => (
                                        <div key={agent.name} className={cn("flex items-center gap-2 text-[10px] transition-all duration-300", agent.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")}>
                                            {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-blue-500 animate-spin shrink-0" />}
                                            <span className={cn("font-medium", agent.done ? "text-foreground" : "text-blue-600 dark:text-blue-400")}>{agent.name}</span>
                                            <span className="text-muted-foreground">{agent.detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Breathing */}
                        {syncPhase === 'breathing' && (
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-semibold text-muted-foreground">Processing complete — syncing external systems...</span>
                            </div>
                        )}

                        {/* Confirmed */}
                        {(syncPhase === 'revealed' || syncPhase === 'results') && (
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30 animate-in fade-in duration-300">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-green-800 dark:text-green-200"><span className="font-bold">LocationSyncAgent:</span> All locations synced — <span className="font-semibold">45 in-transit</span>, 12 pending QC, 8 allocated. Route optimization: <span className="font-semibold">$1,800 freight savings</span>.</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">External Systems · Synced</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                            {['WMS', 'GPS Tracker', 'QC System', 'Route Engine', 'Map Service'].map(sys => (
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
                        {syncPhase === 'results' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                    {/* Header */}
                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Location Sync Status</h3>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">5 locations · 2,580 total items · Real-time tracking</p>
                                        </div>
                                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold">All Synced</span>
                                    </div>

                                    {/* Location Cards */}
                                    <div className="p-4 space-y-2">
                                        {LOCATION_STATUS.map(loc => {
                                            // Animated status after sync completes
                                            const animatedStatus = syncCardsAnimated ? (
                                                loc.inTransit ? 'Delivered' :
                                                loc.pendingQC ? 'QC Cleared' :
                                                loc.allocated ? 'Shipped' :
                                                loc.receiving ? 'Received' :
                                                null
                                            ) : null;
                                            return (
                                            <div key={loc.name} className={cn("flex items-center justify-between p-3 rounded-xl border transition-all duration-500",
                                                syncCardsAnimated && animatedStatus ? "border-green-300 dark:border-green-500/30 bg-green-50/30 dark:bg-green-500/5" :
                                                loc.type === 'Job Site' ? "border-blue-200 dark:border-blue-500/20 bg-blue-50/30 dark:bg-blue-500/5" : "border-border bg-muted/20"
                                            )}>
                                                <div className="flex items-center gap-3">
                                                    <MapPinIcon className={cn("h-4 w-4 shrink-0 transition-colors duration-500",
                                                        syncCardsAnimated && animatedStatus ? "text-green-500" :
                                                        loc.type === 'Job Site' ? "text-blue-500" : "text-muted-foreground"
                                                    )} />
                                                    <div>
                                                        <p className="text-[11px] font-medium text-foreground">{loc.name}</p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {syncCardsAnimated && loc.inTransit ? <>{loc.items + loc.inTransit} items · <span className="text-green-600 dark:text-green-400 font-semibold">{loc.inTransit} delivered</span></> :
                                                             syncCardsAnimated && loc.pendingQC ? <>{loc.items} items · <span className="text-green-600 dark:text-green-400 font-semibold">{loc.pendingQC} QC cleared</span></> :
                                                             syncCardsAnimated && loc.allocated ? <>{loc.items} items · <span className="text-green-600 dark:text-green-400 font-semibold">{loc.allocated} shipped</span></> :
                                                             syncCardsAnimated && loc.receiving ? <>{loc.items} items · <span className="text-green-600 dark:text-green-400 font-semibold">Delivery received</span></> :
                                                             <>{loc.items} items
                                                            {loc.inTransit ? ` · ${loc.inTransit} in-transit` : ''}
                                                            {loc.pendingQC ? ` · ${loc.pendingQC} pending QC` : ''}
                                                            {loc.allocated ? ` · ${loc.allocated} allocated` : ''}
                                                            {loc.receiving ? ' · Receiving active' : ''}</>}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {loc.utilization && (
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                                                <div className={cn("h-full rounded-full", loc.utilization > 60 ? "bg-amber-500" : "bg-green-500")} style={{ width: `${loc.utilization}%` }} />
                                                            </div>
                                                            <span className="text-[10px] font-medium text-foreground">{loc.utilization}%</span>
                                                        </div>
                                                    )}
                                                    {animatedStatus ? (
                                                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 animate-in fade-in zoom-in-95 duration-500 flex items-center gap-1">
                                                            <CheckCircleIcon className="h-3 w-3" />{animatedStatus}
                                                        </span>
                                                    ) : (
                                                        <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold",
                                                            loc.status === 'Active' ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400" :
                                                            loc.status === 'Receiving' ? "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" :
                                                            "bg-zinc-200 dark:bg-zinc-700 text-muted-foreground"
                                                        )}>{loc.status}</span>
                                                    )}
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>

                                    {/* Route Optimization */}
                                    <div className="mx-4 mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <TruckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                <div>
                                                    <p className="text-[11px] font-bold text-green-800 dark:text-green-300">Route Optimization Applied</p>
                                                    <p className="text-[10px] text-green-700 dark:text-green-400">2 deliveries consolidated to UAL HQ — same-day schedule</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-green-600 dark:text-green-400">-$1,800</span>
                                        </div>
                                    </div>

                                    {/* Auto-advance footer */}
                                    <div className="px-4 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between">
                                        <p className="text-[10px] text-muted-foreground">All 5 locations synchronized · Transit and QC status updated in real-time</p>
                                        <span className="text-[10px] px-3 py-1.5 rounded-lg bg-muted text-muted-foreground font-medium">Auto-advancing...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ FM Step 2.4 — Quick Action Office Relocation ═══ */}
                {isContinua && stepId === '2.4' && fmRelocPhase !== 'idle' && (
                    <div className="space-y-4 mb-6">
                        {/* Notification Banner */}
                        {fmRelocPhase === 'notification' && (
                            <button onClick={() => setFmRelocPhase('modal-open')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-300 dark:border-blue-500/30 shadow-lg hover:shadow-blue-500/20 transition-shadow cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-blue-500 text-white"><ArrowPathRoundedSquareIcon className="h-4 w-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-foreground">Quick Action — Office Relocation</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold">TEMPORARY</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1">While Carlos's chair is being replaced, relocate his workstation assets from <span className="font-semibold text-foreground">Office 3-214 → Office 3-216</span> (vacant).</p>
                                            <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">Click to start relocation <ArrowRightIcon className="h-3 w-3" /></p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Committed confirmation */}
                        {fmRelocPhase === 'committed' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-3">
                                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-300 dark:border-green-500/30">
                                    <div className="flex items-start gap-2">
                                        <CheckCircleIcon className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-green-800 dark:text-green-200">Assets Relocated Successfully</p>
                                            <p className="text-[10px] text-green-700 dark:text-green-300 mt-1">Office 3-214 → Office 3-216. Inventory updated.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ Continua Step 1.2 — Reuse Assessment & Cataloging (interactive) ═══ */}
                {isContinua && stepId === '1.2' && reusePhase !== 'idle' && (
                    <div className="space-y-4 mb-6">
                        {/* Notification */}
                        {reusePhase === 'notification' && (
                            <button onClick={() => setReusePhase('processing')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-success/10 border-2 border-emerald-300 dark:border-emerald-500/30 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-shadow cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-success text-white"><ArchiveBoxIcon className="h-4 w-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-foreground">Reuse Assessment — Floor 7 Teardown</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-success text-white font-bold">340 items</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1">SustainabilityAgent: Evaluating <span className="font-semibold text-foreground">340 items</span> from floor 7 pre-renovation teardown — classifying reuse, recycle, EOL.</p>
                                            <p className="text-[10px] text-success dark:text-success mt-2 flex items-center gap-1">Click to start assessment <ArrowRightIcon className="h-3 w-3" /></p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Processing */}
                        {reusePhase === 'processing' && (
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <AIAgentAvatar size="sm" />
                                    <span className="text-xs font-bold text-foreground">SustainabilityAgent Assessing...</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                    <div className="h-full rounded-full bg-success transition-all duration-[3500ms] ease-linear" style={{ width: `${reuseProgress}%` }} />
                                </div>
                                <div className="space-y-1.5">
                                    {reuseAgents.map(agent => (
                                        <div key={agent.name} className={cn("flex items-center gap-2 text-[10px] transition-all duration-300", agent.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")}>
                                            {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-success animate-spin shrink-0" />}
                                            <span className={cn("font-medium", agent.done ? "text-foreground" : "text-success dark:text-success")}>{agent.name}</span>
                                            <span className="text-muted-foreground">{agent.detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Breathing */}
                        {reusePhase === 'breathing' && (
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-semibold text-muted-foreground">Assessment complete — cataloging items...</span>
                            </div>
                        )}

                        {/* Revealed */}
                        {(reusePhase === 'revealed' || reusePhase === 'results') && (
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30 animate-in fade-in duration-300">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-green-800 dark:text-green-200"><span className="font-bold">SustainabilityAgent:</span> 340 items classified — <span className="font-semibold">180 reusable</span>, 95 recyclable, 65 EOL. Savings: <span className="font-semibold">$89,000</span> vs new procurement.</p>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                            {['Condition Scanner', 'Reuse Catalog', 'Value Engine', 'Sustainability'].map(sys => (
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
                        {reusePhase === 'results' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Reuse Assessment — Floor 7 Teardown</h3>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">340 items evaluated · 180 reusable · $89K savings</p>
                                        </div>
                                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-success/10 text-emerald-700 dark:text-success font-bold">ASSESSED</span>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {REUSE_ITEMS.map(item => (
                                            <div key={item.category} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                                                <div className="flex items-center gap-3">
                                                    <CubeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <div>
                                                        <p className="text-[11px] font-medium text-foreground">{item.category}</p>
                                                        <p className="text-[10px] text-muted-foreground">Condition: {item.condition}/5 · Value: {item.value}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-success/10 text-emerald-700 dark:text-success font-bold">{item.reusable} reuse</span>
                                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium">{item.recyclable} recycle</span>
                                                    {item.eol > 0 && <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-muted0/10 text-muted-foreground font-medium">{item.eol} EOL</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-3 border-t border-border/50 bg-emerald-50 dark:bg-success/5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-muted-foreground">Savings vs new: <span className="font-bold text-emerald-700 dark:text-success">$89,000</span></span>
                                                <span className="text-[10px] text-muted-foreground">Carbon offset: <span className="font-bold text-emerald-700 dark:text-success">2.4 tons</span></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => nextStep()} className="w-full mt-4 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="h-5 w-5" />
                                    Catalog Reusable Items
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ Continua Step 1.5 — Consignment & Vendor Returns (interactive) ═══ */}
                {isContinua && stepId === '1.5' && consignPhase !== 'idle' && (
                    <div className="space-y-4 mb-6">
                        {/* Notification */}
                        {consignPhase === 'notification' && (
                            <button onClick={() => setConsignPhase('processing')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-300 dark:border-rose-500/30 shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 transition-shadow cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-rose-500 text-white"><ClockIcon className="h-4 w-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-foreground">Consignment Review — 90-Day Window</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">12 ITEMS</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1">ConsignmentAgent: <span className="font-semibold text-foreground">12 items</span> approaching 90-day return window. 8 high-value chairs ($24K) need decision this week.</p>
                                            <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">Click to review decisions <ArrowRightIcon className="h-3 w-3" /></p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Processing */}
                        {consignPhase === 'processing' && (
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <AIAgentAvatar size="sm" />
                                    <span className="text-xs font-bold text-foreground">ConsignmentAgent Analyzing...</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                    <div className="h-full rounded-full bg-rose-500 transition-all duration-[3500ms] ease-linear" style={{ width: `${consignProgress}%` }} />
                                </div>
                                <div className="space-y-1.5">
                                    {consignAgents.map(agent => (
                                        <div key={agent.name} className={cn("flex items-center gap-2 text-[10px] transition-all duration-300", agent.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")}>
                                            {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-rose-500 animate-spin shrink-0" />}
                                            <span className={cn("font-medium", agent.done ? "text-foreground" : "text-rose-600 dark:text-rose-400")}>{agent.name}</span>
                                            <span className="text-muted-foreground">{agent.detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Breathing */}
                        {consignPhase === 'breathing' && (
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-semibold text-muted-foreground">Analysis complete — preparing decisions...</span>
                            </div>
                        )}

                        {/* Revealed */}
                        {(consignPhase === 'revealed' || consignPhase === 'results') && (
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30 animate-in fade-in duration-300">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-green-800 dark:text-green-200"><span className="font-bold">ConsignmentAgent:</span> 12 items analyzed — <span className="font-semibold">4 RMA auto-generated</span> ($8,200), <span className="font-semibold">4 convert-to-purchase</span> recommended (demand +12%).</p>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                            {['Consignment DB', 'RMA System', 'Demand Forecast', 'Manufacturer Portal'].map(sys => (
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
                        {consignPhase === 'results' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Consignment Decisions</h3>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">8 items · 4 RMA returns · 4 convert-to-purchase</p>
                                        </div>
                                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold">ACTION REQ</span>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {CONSIGNMENT_ITEMS.map(item => (
                                            <div key={item.name} className={cn("flex items-center justify-between p-3 rounded-xl border", item.action === 'RMA' ? "border-red-200 dark:border-red-500/20 bg-red-50/30 dark:bg-red-500/5" : "border-blue-200 dark:border-blue-500/20 bg-blue-50/30 dark:bg-blue-500/5")}>
                                                <div className="flex items-center gap-3">
                                                    <CubeIcon className={cn("h-4 w-4 shrink-0", item.action === 'RMA' ? "text-red-500" : "text-blue-500")} />
                                                    <div>
                                                        <p className="text-[11px] font-medium text-foreground">{item.name}</p>
                                                        <p className="text-[10px] text-muted-foreground">{item.mfr} · {item.daysLeft} days left · {item.value}</p>
                                                    </div>
                                                </div>
                                                <span className={cn("text-[9px] px-2.5 py-1 rounded-full font-bold", item.action === 'RMA' ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400" : "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400")}>{item.action === 'RMA' ? 'Return (RMA)' : 'Convert to Purchase'}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between">
                                        <span className="text-[10px] text-muted-foreground">RMA value: <span className="font-bold text-foreground">$8,200</span></span>
                                        <span className="text-[10px] text-muted-foreground">Conversion savings: <span className="font-bold text-foreground">$3,400</span></span>
                                    </div>
                                </div>
                                <button onClick={() => nextStep()} className="w-full mt-4 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="h-5 w-5" />
                                    Process Decisions
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Content (Tabs Logic) */}
                {
                    activeTab === 'inventory' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                            {/* Filters & View Toggle Bar */}
                            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">

                                {/* Left: Search & Filters */}
                                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search assets..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-muted dark:bg-card/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <div className="relative">
                                            <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                            <select
                                                value={filterType}
                                                onChange={(e) => setFilterType(e.target.value)}
                                                className="pl-9 pr-8 py-2 bg-muted/50 border border-border rounded-lg text-sm font-medium hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:border-brand-400 dark:hover:border-brand-800 transition-colors appearance-none cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none"
                                            >
                                                <option value="All Types">All Types</option>
                                                {uniqueTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                                        </div>

                                        <div className="relative">
                                            <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                            <select
                                                value={filterLocation}
                                                onChange={(e) => setFilterLocation(e.target.value)}
                                                className="pl-9 pr-8 py-2 bg-muted/50 border border-border rounded-lg text-sm font-medium hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:border-brand-400 dark:hover:border-brand-800 transition-colors appearance-none cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none max-w-[200px] truncate"
                                            >
                                                <option value="All Locations">All Locations</option>
                                                {uniqueLocations.map(loc => (
                                                    <option key={loc} value={loc}>{loc}</option>
                                                ))}
                                            </select>
                                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Right: View Toggle */}
                                <div className="flex bg-zinc-100 dark:bg-card p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white dark:bg-zinc-700 shadow-sm text-foreground" : "text-muted-foreground hover:text-zinc-900 hover:bg-brand-300 dark:hover:bg-brand-600/50")}
                                    >
                                        <ListBulletIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white dark:bg-zinc-700 shadow-sm text-foreground" : "text-muted-foreground hover:text-zinc-900 hover:bg-brand-300 dark:hover:bg-brand-600/50")}
                                    >
                                        <Squares2X2Icon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* List View */}
                            {viewMode === 'list' && (
                                <div className="bg-card dark:bg-zinc-800 rounded-xl border border-border shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-muted dark:bg-card/50 border-b border-border">
                                                <tr>
                                                    <th className="p-4 w-12">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-zinc-300 text-primary focus:ring-primary"
                                                            checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                                                            onChange={toggleAll}
                                                        />
                                                    </th>
                                                    <th className="p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Asset</th>
                                                    <th className="p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Category</th>
                                                    <th className="p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Location</th>
                                                    <th className="p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Status</th>
                                                    <th className="p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Value</th>
                                                    <th className="p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Carbon Impact</th>
                                                    <th className="p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                                {filteredData.map((item) => (
                                                    <tr key={item.id} className={cn("group hover:bg-muted/50 transition-colors", selectedIds.has(item.id) ? "bg-primary/5 hover:bg-primary/10" : "")}>
                                                        <td className="p-4">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-zinc-300 text-primary focus:ring-primary"
                                                                checked={selectedIds.has(item.id)}
                                                                onChange={() => toggleSelection(item.id)}
                                                            />
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                {item.image ? (
                                                                    <>
                                                                        <img
                                                                            src={item.image}
                                                                            alt={item.assetName}
                                                                            className="w-10 h-10 rounded-lg object-cover border border-border"
                                                                            onError={(e) => {
                                                                                e.currentTarget.style.display = 'none';
                                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                                e.currentTarget.nextElementSibling?.classList.add('flex');
                                                                            }}
                                                                        />
                                                                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-card hidden items-center justify-center border border-border">
                                                                            {getCategoryIcon(item.category, "w-6 h-6 text-muted-foreground")}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-card flex items-center justify-center border border-border">
                                                                        {getCategoryIcon(item.category, "w-6 h-6 text-muted-foreground")}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="font-semibold text-foreground">{item.assetName}</p>
                                                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-muted-foreground">{item.category}</td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                <MapPinIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                                                <span>{item.location}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", getStatusBadge(item.status), "border-transparent")}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 font-medium">${item.value.toFixed(2)}</td>
                                                        <td className="p-4">
                                                            <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getImpactBadge(item.carbonImpact))}>
                                                                {item.carbonImpact}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                                                <EllipsisHorizontalIcon className="w-5 h-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Grid View */}
                            {viewMode === 'grid' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {paginatedData.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleSelection(item.id)}
                                            className={cn(
                                                "group bg-card dark:bg-zinc-800 rounded-2xl border shadow-sm hover:shadow-lg transition-all cursor-pointer relative overflow-hidden flex flex-col h-[340px]",
                                                selectedIds.has(item.id) ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"
                                            )}
                                        >
                                            {/* Image Section */}
                                            <div className="h-44 w-full relative bg-zinc-100 dark:bg-zinc-900">
                                                {item.image ? (
                                                    <>
                                                        <img
                                                            src={item.image}
                                                            alt={item.assetName}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                e.currentTarget.nextElementSibling?.classList.add('flex');
                                                            }}
                                                        />
                                                        <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 hidden flex-col items-center justify-center text-zinc-300 dark:text-muted-foreground">
                                                            {getCategoryIcon(item.category)}
                                                            <span className="text-xs font-medium">{item.category}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 dark:text-muted-foreground">
                                                        {getCategoryIcon(item.category)}
                                                        <span className="text-xs font-medium">{item.category}</span>
                                                    </div>
                                                )}

                                                {/* Overlay Gradient */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                {/* Selection Checkbox */}
                                                <div className="absolute top-3 left-3 z-10">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(item.id)}
                                                        readOnly
                                                        className="rounded border-zinc-300 text-primary focus:ring-primary shadow-sm w-5 h-5 cursor-pointer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={() => toggleSelection(item.id)}
                                                    />
                                                </div>

                                                {/* Kebab Menu */}
                                                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 bg-background/90 backdrop-blur rounded-lg text-foreground hover:bg-background shadow-sm" onClick={(e) => e.stopPropagation()}>
                                                        <EllipsisHorizontalIcon className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Status Badge (On Image) */}
                                                <div className="absolute bottom-3 right-3 z-10">
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-md border border-white/10",
                                                        getStatusBadge(item.status)
                                                    )}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content Section */}
                                            <div className="p-4 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start gap-2 mb-1.5">
                                                        <h3 className="font-semibold text-foreground truncate text-base" title={item.assetName}>{item.assetName}</h3>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mb-3 truncate">{item.description}</p>

                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                                                        <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="truncate">{item.location}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-700 flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Value</p>
                                                        <p className="text-sm font-bold text-foreground">${item.value.toLocaleString()}</p>
                                                    </div>
                                                    <span className={cn("px-2 py-1 rounded text-[10px] font-medium border border-transparent", getImpactBadge(item.carbonImpact))}>
                                                        {item.carbonImpact === 'Low Impact' ? '🌿 ' : '⚠️ '} {item.carbonImpact.split(' ')[0]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Pagination Footer */}
                            {filteredData.length > 0 && (
                                <div className="flex items-center justify-between border-t border-border pt-4 mt-8">
                                    <div className="text-sm text-muted-foreground">
                                        Showing <span className="font-medium text-foreground">{startIndex + 1}</span> to <span className="font-medium text-foreground">{Math.min(endIndex, filteredData.length)}</span> of <span className="font-medium text-foreground">{filteredData.length}</span> results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1.5 text-sm font-medium rounded-md border border-border text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let p = i + 1;
                                                if (totalPages > 5 && currentPage > 3) {
                                                    p = currentPage - 2 + i;
                                                    if (p > totalPages) p = totalPages - (4 - i);
                                                }
                                                // Ensure p is valid
                                                if (p < 1) p = 1;

                                                return (
                                                    <button
                                                        key={p}
                                                        onClick={() => setCurrentPage(p)}
                                                        className={cn(
                                                            "w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                                                            currentPage === p
                                                                ? "bg-primary text-primary-foreground"
                                                                : "text-foreground hover:bg-accent"
                                                        )}
                                                    >
                                                        {p}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1.5 text-sm font-medium rounded-md border border-border text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }

                {/* Locations Tab */}
                {activeTab === 'locations' && <InventoryLocations />}

            </div >

            {/* Sticky Bulk Actions Footer */}
            {
                selectedIds.size > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border shadow-xl rounded-full px-6 py-3 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                        <div className="flex items-center gap-2 border-r border-border pr-6">
                            <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                                {selectedIds.size}
                            </div>
                            <span className="text-sm font-medium text-foreground">Selected</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsStatusModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent rounded-lg text-sm font-medium text-foreground transition-colors group"
                            >
                                <div className="p-0.5 rounded-md transition-colors group-hover:bg-brand-300 dark:group-hover:bg-transparent">
                                    <ArrowPathRoundedSquareIcon className="w-4 h-4 text-muted-foreground group-hover:text-muted-foreground dark:group-hover:text-primary transition-colors" />
                                </div>
                                Change Status
                            </button>
                            <button
                                onClick={() => setIsRelocateModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent rounded-lg text-sm font-medium text-foreground transition-colors group"
                            >
                                <MapPinIcon className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                                Move
                            </button>
                            <button
                                onClick={() => setIsMaintenanceModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent rounded-lg text-sm font-medium text-foreground transition-colors group"
                            >
                                <WrenchScrewdriverIcon className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                                Maintenance
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 transition-colors group">
                                <TrashIcon className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Toast Notification */}
            {
                showToast && (
                    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
                        <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg shadow-2xl p-4 flex items-start gap-4 max-w-md border border-zinc-800 dark:border-zinc-200">
                            <div className="bg-green-500/20 text-green-500 p-2 rounded-full shrink-0">
                                <CheckCircleIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm">{toastMessage.title}</h4>
                                <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">{toastMessage.description}</p>
                                <div className="mt-3 flex gap-3">
                                    <button
                                        onClick={() => onNavigate('mac')}
                                        className="text-xs font-semibold text-primary hover:underline"
                                    >
                                        View in Service Center
                                    </button>
                                    <button
                                        onClick={() => setShowToast(false)}
                                        className="text-xs font-medium text-muted-foreground hover:text-zinc-300 dark:hover:text-muted-foreground"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modals */}
            <RelocateAssetModal
                isOpen={isRelocateModalOpen}
                onClose={() => setIsRelocateModalOpen(false)}
                selectedCount={selectedIds.size || 1}
                onConfirm={handleRelocateConfirm}
            />

            <MaintenanceModal
                isOpen={isMaintenanceModalOpen}
                onClose={() => setIsMaintenanceModalOpen(false)}
                selectedCount={selectedIds.size || 1}
                onConfirm={handleMaintenanceConfirm}
            />

            <SmartAddAssetModal
                isOpen={isAddAssetModalOpen}
                onClose={() => setIsAddAssetModalOpen(false)}
                onConfirm={handleAddAssetConfirm}
            />

            <ChangeStatusModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                selectedCount={selectedIds.size || 1}
                onConfirm={handleStatusConfirm}
            />

            <QuickMovementsModal
                isOpen={isQuickMovementsModalOpen}
                onClose={() => {
                    setIsQuickMovementsModalOpen(false);
                    if (fmRelocPhase === 'modal-open') setFmRelocPhase('committed');
                }}
            />
        </div >
    );
}
