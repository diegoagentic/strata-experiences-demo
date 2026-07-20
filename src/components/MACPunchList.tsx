import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    CameraIcon,
    Bars4Icon,
    PhoneIcon,
    ChatBubbleLeftRightIcon,
    PencilIcon,
    XMarkIcon,
    CubeIcon,
    PhotoIcon,
    MapPinIcon,
    SparklesIcon,
    EyeIcon,
    EnvelopeIcon,
    QrCodeIcon,
    ArrowUpTrayIcon,
    PaperClipIcon,
    ArrowRightIcon,
    ArrowPathIcon,
    CalendarIcon,
    UserGroupIcon,
    TruckIcon,
    ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { useDemo } from '../context/DemoContext';
import { useDemoProfile } from '../context/useDemoProfile';
import { CONTINUA_STEP_TIMING } from '../config/profiles/continua-demo';
import LiabilityAnalysisPanel from './widgets/LiabilityAnalysisPanel';
import ConfidenceScoreBadge from './widgets/ConfidenceScoreBadge';
import DemoAvatar, { AIAgentAvatar } from './simulations/DemoAvatars';

// ─── Types ────────────────────────────────────────────────────────────────────
type ValidationStatus = 'present' | 'needs_clarification' | 'missing';

interface ValidationItem {
    id: string;
    label: string;
    status: ValidationStatus;
    confidence: number;
    detail?: string;
    aiSuggestion?: string;
}

interface BusinessRule {
    id: string;
    label: string;
    status: 'pass' | 'warning' | 'fail';
    detail: string;
    editable?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const VALIDATION_ITEMS: ValidationItem[] = [
    { id: 'order-number', label: 'Original Order Number', status: 'present', confidence: 98, detail: 'ORD-2055 — verified against order database' },
    { id: 'line-number', label: 'Line Number from Acknowledgement', status: 'present', confidence: 96, detail: 'Line 3 — matched to Acknowledgement #ACK-7842' },
    { id: 'issue-photo', label: 'Picture of Issue', status: 'present', confidence: 94, detail: '2 photos attached — upholstery damage clearly visible' },
    { id: 'label-photo', label: 'Picture of Label', status: 'needs_clarification', confidence: 62, detail: 'Label partially obscured — AI detects potential SKU mismatch', aiSuggestion: 'Label shows CC-AZ-2024 but order references CC-AZ-2025. This may be a model year variant. Recommend confirming with requester or checking product catalog for cross-reference.' },
    { id: 'box-photo', label: 'Picture of Box', status: 'missing', confidence: 0, detail: 'No box photo provided — required for freight damage claims', aiSuggestion: 'Box condition is critical for carrier liability assessment. Contact requester to provide a photo of the original shipping box and packaging materials.' },
];

const BUSINESS_RULES: BusinessRule[] = [
    { id: 'repair-threshold', label: 'Repair quote within $500 threshold', status: 'warning', detail: '$510 exceeds threshold by $10 (2% over)', editable: true },
    { id: 'trip-zone', label: 'Trip charge matches standard rate', status: 'pass', detail: '$175 matches standard rate' },
    { id: 'certified-vendor', label: 'Installer is certified vendor', status: 'pass', detail: 'ProInstall LLC — Certified since 2019' },
    { id: 'labor-hours', label: 'Labor hours within standard range', status: 'warning', detail: '6 hrs quoted vs. 4 hrs typical for this repair type', editable: true },
    { id: 'warranty-coverage', label: 'Warranty coverage confirmed', status: 'pass', detail: 'Active warranty until 2027-03 (SN-2025-88712)' },
    { id: 'duplicate-check', label: 'No duplicate claims', status: 'pass', detail: 'No prior claims for this order line' },
];

const AI_RULE_SUGGESTIONS: Record<string, { label: string; value: string }[]> = {
    'repair-threshold': [
        { label: 'Adjust to $495', value: '495' },
        { label: 'Exception for $510', value: '510' },
        { label: 'Split: 2× $255', value: '255' },
    ],
    'labor-hours': [
        { label: '4 hrs (standard)', value: '4' },
        { label: '5 hrs (partial)', value: '5' },
        { label: '6 hrs (justified)', value: '6' },
    ],
};

const EXTRACTION_FIELDS: { label: string; value: string; status: 'ok' | 'warning' | 'missing' }[] = [
    { label: 'Order Number', value: 'ORD-2055', status: 'ok' },
    { label: 'Product Description', value: '2x Conference Room Chairs (Azure)', status: 'ok' },
    { label: 'Issue Type', value: 'Freight Damage — Upholstery Tear', status: 'ok' },
    { label: 'Label / SKU', value: 'CC-AZ-2024 (mismatch with CC-AZ-2025)', status: 'warning' },
    { label: 'Box / Packaging Photo', value: 'Not provided', status: 'missing' },
];

const CLAIM_LOG_ENTRIES = [
    'ClaimSubmissionAgent: Initializing claim package CLM-2026-114...',
    'ClaimSubmissionAgent: Forwarding 2 evidence photos to manufacturer portal...',
    'ClaimSubmissionAgent: Photos uploaded — SHA256 hashes recorded for audit trail.',
    'ClaimSubmissionAgent: Compiling issue description with AI damage taxonomy...',
    'ClaimSubmissionAgent: Ship-to address verified: 742 Evergreen Terrace, Suite 200, Springfield, IL 62704',
    'ClaimSubmissionAgent: Claim package submitted to manufacturer (AIS Furniture Corp).',
    'ClaimSubmissionAgent: Acknowledgement received — replacement unit in production queue.',
    'ClaimSubmissionAgent: Dashboard updated. Stakeholders notified via digest.',
];

// ─── Continua Step 1.5: Installation Schedule Constants ───────────────────────
const INSTALL_AGENTS = [
    { name: 'ScheduleBuilder', detail: 'Generating schedule for floors 4-6 (phase 2)...' },
    { name: 'ResourcePlanner', detail: 'Allocating 8 installers + 2 AV techs...' },
    { name: 'ConflictDetector', detail: 'HM delivery delayed 3 days for floor 5...' },
    { name: 'Resequencer', detail: 'Re-sequencing: start with floor 6 — notifying GC...' },
    { name: 'ChecklistGenerator', detail: 'Field verification checklist — 120 items...' },
]

const FLOOR_SCHEDULE = [
    { floor: 'Floor 6', status: 'Rescheduled First' as const, dates: 'Mar 28 - Apr 4', installers: 4, items: 180, conflict: false },
    { floor: 'Floor 5', status: 'Delayed → Apr 7' as const, dates: 'Apr 7 - Apr 14', installers: 4, items: 210, conflict: true, reason: 'Herman Miller delivery delayed 3 days' },
    { floor: 'Floor 4', status: 'On Schedule' as const, dates: 'Apr 14 - Apr 21', installers: 4, items: 160, conflict: false },
]

type InstallPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results'

// ─── FM Flow: Service Request Intake (F.1) ───────────────────────────────────
type FMIntakePhase = 'idle' | 'email' | 'extracting' | 'classified' | 'submitted'

const FM_INTAKE_FIELDS = [
    { label: 'Asset ID', value: 'AER-2024-3214-07 (Aeron Remastered)', status: 'ok' as const },
    { label: 'Location', value: 'Office 3-214, Building A', status: 'ok' as const },
    { label: 'Issue', value: 'Broken gas cylinder — chair sinks, safety hazard', status: 'warning' as const },
    { label: 'Warranty', value: 'Active until 2027-06 (Herman Miller)', status: 'ok' as const },
    { label: 'Photos', value: '2 photos attached — cylinder damage visible', status: 'ok' as const },
]

// ─── FM Flow: AI Triage & Cross-Reference (F.2) ─────────────────────────────
type FMTriagePhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results'

const FM_TRIAGE_AGENTS = [
    { name: 'WarrantyCheck', detail: 'Active warranty until 2027 — Herman Miller coverage confirmed...' },
    { name: 'InventorySearch', detail: '3 Aeron Remastered in Warehouse Zone A (consignment)...' },
    { name: 'ContractMatch', detail: 'ProInstall LLC — certified installer, available tomorrow...' },
    { name: 'ScheduleOptimizer', detail: 'Slot available: tomorrow 9:00–12:00 AM...' },
    { name: 'ResolutionPlanner', detail: 'Generating 3 resolution options — warranty + consignment + relocation...' },
]

const FM_TRIAGE_RESULTS = [
    { title: 'Warranty Claim', detail: 'Auto-generated claim CLM-FM-2026-018 — Herman Miller will replace gas cylinder', cost: '$0', badge: 'AUTO-FILED' as const },
    { title: 'Consignment Swap', detail: 'Aeron Remastered available in Warehouse Zone A — 98% match, consignment stock', cost: '$0', badge: 'RECOMMENDED' as const },
    { title: 'Temp Relocation', detail: 'Office 3-216 vacant — relocate Carlos\'s workstation assets during repair', cost: '$0', badge: 'QUICK ACTION' as const },
]

// ─── FM Flow: Resolution & Installer Report (F.5) ───────────────────────────
type FMResolutionPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results'

const FM_RESOLUTION_AGENTS = [
    { name: 'InstallerReport', detail: 'ProInstall: Aeron swap completed — QC checklist passed...' },
    { name: 'AssetSwap', detail: 'Old AER-2024-3214-07 removed → warranty return initiated...' },
    { name: 'WarrantyClaim', detail: 'Claim CLM-FM-2026-018 auto-filed with Herman Miller...' },
    { name: 'InventorySync', detail: 'Consignment Aeron assigned to Office 3-214 — inventory updated...' },
    { name: 'StakeholderNotify', detail: 'Notifying Facilities Coord Cardo, Account Manager Kai, Regional Sales Manager Reyes...' },
]

const FM_RESOLUTION_NOTIFICATIONS = [
    { initials: 'CR', name: 'Facilities Coord Cardo', role: 'End User', message: 'Your chair has been replaced — you can return to Office 3-214', color: 'from-blue-500 to-blue-700' },
    { initials: 'SC', name: 'Account Manager Kai', role: 'Dealer', message: 'Consignment swap completed — inventory updated, warranty claim filed', color: 'from-emerald-500 to-emerald-700' },
    { initials: 'DP', name: 'Regional Sales Manager Reyes', role: 'Expert', message: 'Service request REQ-FM-2026-018 resolved — $0 cost, 26h total', color: 'from-violet-500 to-violet-700' },
]

// ─── Per-punchlist-item detail records ───────────────────────────────────────
// Drives the right-column panel so clicking a different left-column item
// swaps request context + email + attachments + completeness. Item-1 keeps
// the original tour copy so the demo tour behavior is unchanged.
interface PunchlistDetail {
    requestId: string;
    product: string;
    requester: string;
    orderRef: string;
    emailFrom: string;
    emailSubject: string;
    emailBody: string;
    attachments: string[];
    completeness: number;
}

const PUNCHLIST_DETAILS: Record<string, PunchlistDetail> = {
    'item-1': {
        requestId: 'REQ-PL-2026-047',
        product: '2x Conf. Room Chairs Azure',
        requester: 'Site Supervisor — Floor 2',
        orderRef: 'ORD-2055, Line 3',
        emailFrom: 'carlos.rivera@acmecorp.com',
        emailSubject: 'Service Request — Damaged Conference Chairs (ORD-2055)',
        emailBody: 'We received 2 Azure conference chairs from order ORD-2055 with visible upholstery damage on both units. The damage appears to have occurred during shipping — the packaging was partially crushed. Attached are photos of the damage, the product label, and relevant documentation. Please process a warranty claim.',
        attachments: ['damage-photo-1.jpg', 'damage-photo-2.jpg', 'product-label.jpg'],
        completeness: 72,
    },
    'item-2': {
        requestId: 'REQ-PL-2026-052',
        product: '1x Acoustic Panel (Frosted)',
        requester: 'Facilities Coord — Floor 3',
        orderRef: 'ORD-2061, Line 1',
        emailFrom: 'ana.tobar@acmecorp.com',
        emailSubject: 'Service Request — Scratched Glass Partition (ORD-2061)',
        emailBody: 'The acoustic panel installed on Floor 3 has a visible scratch on the frosted glass, easily seen under normal office lighting. Attached is a photo of the damaged partition. Please advise on repair or replacement timeline.',
        attachments: ['scratch-detail.jpg'],
        completeness: 88,
    },
    'item-3': {
        requestId: 'REQ-PL-2026-055',
        product: '1x Workstation Desk',
        requester: 'IT Coordinator — Floor 1',
        orderRef: 'ORD-2071, Line 5',
        emailFrom: 'j.paredes@acmecorp.com',
        emailSubject: 'Missing Hardware — Workstation Desk (ORD-2071)',
        emailBody: 'The workstation desk arrived without the mounting hardware packet. The installer left a note requesting the missing parts (M6 bolts, cable trays, cross-bars). Attached is the installer note.',
        attachments: ['installer-note.pdf'],
        completeness: 65,
    },
};

// ─── Component ────────────────────────────────────────────────────────────────
interface MACPunchListProps {
    /** When true (shared-block preview) treats the panel as if step 3.1 were
     *  active so clicks on left-column items show the right-column detail. */
    previewMode?: boolean;
}

export default function MACPunchList({ previewMode = false }: MACPunchListProps = {}) {
    const { currentStep, nextStep, isPaused } = useDemo();
    const { activeProfile } = useDemoProfile();
    const isContinua = activeProfile.id === 'continua';
    const stepId = currentStep?.id || '';
    // Preview pre-selects the first item so users see the right-column
    // detail immediately without needing a click.
    const [selectedItem, setSelectedItem] = useState<string | null>(previewMode ? 'item-1' : null);
    // Data record that drives the right-column panel · updates when the user
    // clicks a different left-column item. Falls back to item-1 outside of
    // preview so tour content stays byte-identical to before.
    const activeDetail = PUNCHLIST_DETAILS[selectedItem ?? 'item-1'] ?? PUNCHLIST_DETAILS['item-1'];

    // ── Pause-aware timer support ──
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

    // ─── Continua Step 1.5: Installation Schedule state ─────────────────────
    const [instPhase, setInstPhase] = useState<InstallPhase>('idle')
    const instPhaseRef = useRef(instPhase)
    useEffect(() => { instPhaseRef.current = instPhase }, [instPhase])
    const [instAgents, setInstAgents] = useState(INSTALL_AGENTS.map(a => ({ ...a, visible: false, done: false })))
    const [instProgress, setInstProgress] = useState(0)

    // Step 3.1 state · in preview jump straight to 'review' so the fully
    // resolved intake panel renders without waiting for the animated flow.
    const [extractionPhase, setExtractionPhase] = useState<'email' | 'extracting' | 'review'>(previewMode ? 'review' : 'email');
    const [extractedCount, setExtractedCount] = useState(0);
    const [expandedValidation, setExpandedValidation] = useState<string | null>(null);
    const [resolvedItems, setResolvedItems] = useState<Set<string>>(new Set());
    const [qrScanning, setQrScanning] = useState(false);
    const [qrDone, setQrDone] = useState(false);
    const [uploadingLabel, setUploadingLabel] = useState(false);
    const [labelUploaded, setLabelUploaded] = useState(false);
    const [uploadingEvidence, setUploadingEvidence] = useState(false);
    const [uploadedPhotos, setUploadedPhotos] = useState(0);
    const [uploadDone, setUploadDone] = useState(false);

    // Step 3.2 state
    const [approvedLabor, setApprovedLabor] = useState(false);
    const [editingRule, setEditingRule] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Record<string, string>>({
        'repair-threshold': '510',
        'labor-hours': '6',
    });
    const [validatedRules, setValidatedRules] = useState<Set<string>>(new Set());

    // Step 3.3 state
    const [claimLogs, setClaimLogs] = useState<string[]>([]);
    const [claimProgress, setClaimProgress] = useState(0);
    const [claimPhase, setClaimPhase] = useState<'processing' | 'acknowledged' | 'complete'>('processing');
    const [showLiability, setShowLiability] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showDealerRequest, setShowDealerRequest] = useState(false);
    const [dealerMessage, setDealerMessage] = useState('');
    const [dealerPhotos, setDealerPhotos] = useState<string[]>([]);
    const [dealerRequestSent, setDealerRequestSent] = useState(false);

    // Auto-select first item when entering Flow 3
    useEffect(() => {
        if (['3.1', '3.2', '3.3', '3.4'].includes(currentStep?.id)) {
            setSelectedItem('item-1');
        }
    }, [currentStep?.id]);

    // ─── Continua Step 1.5: Installation orchestration ────────────────────────
    const tp15 = CONTINUA_STEP_TIMING['1.5'];
    useEffect(() => {
        if (!isContinua || stepId !== '3.6') { setInstPhase('idle'); return; }
        setInstPhase('idle');
        setInstAgents(INSTALL_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setInstPhase('notification')), tp15.notifDelay));
        timers.push(setTimeout(pauseAware(() => {
            if (instPhaseRef.current === 'notification') setInstPhase('processing');
        }), tp15.notifDelay + tp15.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [isContinua, stepId]);

    // Continua 1.5: processing → breathing
    useEffect(() => {
        if (instPhase !== 'processing') return;
        setInstAgents(INSTALL_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        setInstProgress(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setInstProgress(100), 50));
        INSTALL_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setInstAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * tp15.agentStagger));
            timers.push(setTimeout(pauseAware(() => setInstAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * tp15.agentStagger + tp15.agentDone));
        });
        timers.push(setTimeout(pauseAware(() => setInstPhase('breathing')), INSTALL_AGENTS.length * tp15.agentStagger + tp15.agentDone + 300));
        return () => timers.forEach(clearTimeout);
    }, [instPhase]);

    // Continua 1.5: breathing → revealed
    useEffect(() => {
        if (instPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setInstPhase('revealed')), tp15.breathing);
        return () => clearTimeout(t);
    }, [instPhase]);

    // Continua 1.5: revealed → results
    useEffect(() => {
        if (instPhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setInstPhase('results')), 1500);
        return () => clearTimeout(t);
    }, [instPhase]);

    // Continua 1.5: auto-advance (System role)
    useEffect(() => {
        if (instPhase !== 'results') return;
        const t = setTimeout(pauseAware(() => nextStep()), tp15.resultsDur);
        return () => clearTimeout(t);
    }, [instPhase]);

    // ─── FM Step F.1: Service Request Intake state ───────────────────────────
    const [fmIntakePhase, setFmIntakePhase] = useState<FMIntakePhase>('idle')
    const [fmIntakeFieldCount, setFmIntakeFieldCount] = useState(0)

    // F.1 orchestration — email arrives, AI extracts fields, user submits
    const tpF1 = CONTINUA_STEP_TIMING['2.1'];
    useEffect(() => {
        if (!isContinua || stepId !== '2.1') { setFmIntakePhase('idle'); return; }
        setFmIntakePhase('idle');
        setFmIntakeFieldCount(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        // Show email notification after delay
        timers.push(setTimeout(pauseAware(() => setFmIntakePhase('email')), tpF1.notifDelay));
        // Start extraction after notification duration
        timers.push(setTimeout(pauseAware(() => {
            setFmIntakePhase('extracting');
        }), tpF1.notifDelay + tpF1.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [isContinua, stepId]);

    // F.1: extracting → fields appear one by one → classified
    useEffect(() => {
        if (fmIntakePhase !== 'extracting') return;
        setFmIntakeFieldCount(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        FM_INTAKE_FIELDS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setFmIntakeFieldCount(i + 1)), (i + 1) * tpF1.agentStagger));
        });
        timers.push(setTimeout(pauseAware(() => setFmIntakePhase('classified')), FM_INTAKE_FIELDS.length * tpF1.agentStagger + tpF1.breathing));
        return () => timers.forEach(clearTimeout);
    }, [fmIntakePhase]);

    // F.1: submitted → next step
    useEffect(() => {
        if (fmIntakePhase !== 'submitted') return;
        const t = setTimeout(pauseAware(() => nextStep()), 1500);
        return () => clearTimeout(t);
    }, [fmIntakePhase]);

    // ─── FM Step F.2: AI Triage state ────────────────────────────────────────
    const [fmTriagePhase, setFmTriagePhase] = useState<FMTriagePhase>('idle')
    const fmTriagePhaseRef = useRef(fmTriagePhase)
    useEffect(() => { fmTriagePhaseRef.current = fmTriagePhase }, [fmTriagePhase])
    const [fmTriageAgents, setFmTriageAgents] = useState(FM_TRIAGE_AGENTS.map(a => ({ ...a, visible: false, done: false })))
    const [fmTriageProgress, setFmTriageProgress] = useState(0)

    // F.2 orchestration
    const tpF2 = CONTINUA_STEP_TIMING['2.2'];
    useEffect(() => {
        if (!isContinua || stepId !== '2.2') { setFmTriagePhase('idle'); return; }
        setFmTriagePhase('idle');
        setFmTriageAgents(FM_TRIAGE_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setFmTriagePhase('notification')), tpF2.notifDelay));
        timers.push(setTimeout(pauseAware(() => {
            if (fmTriagePhaseRef.current === 'notification') setFmTriagePhase('processing');
        }), tpF2.notifDelay + tpF2.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [isContinua, stepId]);

    // F.2: processing → breathing
    useEffect(() => {
        if (fmTriagePhase !== 'processing') return;
        setFmTriageAgents(FM_TRIAGE_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        setFmTriageProgress(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setFmTriageProgress(100), 50));
        FM_TRIAGE_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setFmTriageAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * tpF2.agentStagger));
            timers.push(setTimeout(pauseAware(() => setFmTriageAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * tpF2.agentStagger + tpF2.agentDone));
        });
        timers.push(setTimeout(pauseAware(() => setFmTriagePhase('breathing')), FM_TRIAGE_AGENTS.length * tpF2.agentStagger + tpF2.agentDone + 300));
        return () => timers.forEach(clearTimeout);
    }, [fmTriagePhase]);

    useEffect(() => {
        if (fmTriagePhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setFmTriagePhase('revealed')), tpF2.breathing);
        return () => clearTimeout(t);
    }, [fmTriagePhase]);

    useEffect(() => {
        if (fmTriagePhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setFmTriagePhase('results')), 1500);
        return () => clearTimeout(t);
    }, [fmTriagePhase]);

    // 2.2: results — wait for manual "Approve Plan" click (no auto-advance)

    // ─── FM Step F.5: Resolution & Installer Report state ────────────────────
    const [fmResPhase, setFmResPhase] = useState<FMResolutionPhase>('idle')
    const fmResPhaseRef = useRef(fmResPhase)
    useEffect(() => { fmResPhaseRef.current = fmResPhase }, [fmResPhase])
    const [fmResAgents, setFmResAgents] = useState(FM_RESOLUTION_AGENTS.map(a => ({ ...a, visible: false, done: false })))
    const [fmResProgress, setFmResProgress] = useState(0)

    // F.5 orchestration
    const tpF5 = CONTINUA_STEP_TIMING['2.5'];
    useEffect(() => {
        if (!isContinua || stepId !== '2.5') { setFmResPhase('idle'); return; }
        setFmResPhase('idle');
        setFmResAgents(FM_RESOLUTION_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setFmResPhase('notification')), tpF5.notifDelay));
        timers.push(setTimeout(pauseAware(() => {
            if (fmResPhaseRef.current === 'notification') setFmResPhase('processing');
        }), tpF5.notifDelay + tpF5.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [isContinua, stepId]);

    // F.5: processing → breathing
    useEffect(() => {
        if (fmResPhase !== 'processing') return;
        setFmResAgents(FM_RESOLUTION_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        setFmResProgress(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setFmResProgress(100), 50));
        FM_RESOLUTION_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setFmResAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * tpF5.agentStagger));
            timers.push(setTimeout(pauseAware(() => setFmResAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * tpF5.agentStagger + tpF5.agentDone));
        });
        timers.push(setTimeout(pauseAware(() => setFmResPhase('breathing')), FM_RESOLUTION_AGENTS.length * tpF5.agentStagger + tpF5.agentDone + 300));
        return () => timers.forEach(clearTimeout);
    }, [fmResPhase]);

    useEffect(() => {
        if (fmResPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setFmResPhase('revealed')), tpF5.breathing);
        return () => clearTimeout(t);
    }, [fmResPhase]);

    useEffect(() => {
        if (fmResPhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setFmResPhase('results')), 1500);
        return () => clearTimeout(t);
    }, [fmResPhase]);

    // 2.5: results — wait for manual "Complete Flow" click (no auto-advance)

    // Step 3.1: Email extraction animation → then validation checklist
    useEffect(() => {
        if (currentStep?.id !== '3.1') return;
        setExtractionPhase('email');
        setExtractedCount(0);
        setExpandedValidation(null);
        setResolvedItems(new Set());
        setQrScanning(false);
        setQrDone(false);
        setUploadingLabel(false);
        setLabelUploaded(false);
        setUploadingEvidence(false);
        setUploadedPhotos(0);
        setUploadDone(false);

        const timeouts: ReturnType<typeof setTimeout>[] = [];
        // 2s: Start extracting
        timeouts.push(setTimeout(pauseAware(() => setExtractionPhase('extracting')), 2000));
        // 2.5s–6.5s: Fields appear one-by-one
        EXTRACTION_FIELDS.forEach((_, i) => {
            timeouts.push(setTimeout(pauseAware(() => setExtractedCount(i + 1)), 2500 + i * 1000));
        });
        // 8s: Transition to review (validation checklist)
        timeouts.push(setTimeout(pauseAware(() => setExtractionPhase('review')), 8000));
        // 10s: Auto-expand label-photo
        timeouts.push(setTimeout(pauseAware(() => setExpandedValidation('label-photo')), 10000));

        return () => timeouts.forEach(clearTimeout);
    }, [currentStep?.id]);

    // Step 3.3: Reset on enter
    useEffect(() => {
        if (currentStep?.id !== '3.3') return;
        setApprovedLabor(false);
        setEditingRule(null);
        setValidatedRules(new Set());
    }, [currentStep?.id]);

    // Step 3.4: Auto-animated claim submission
    useEffect(() => {
        if (currentStep?.id !== '3.4') {
            setClaimLogs([]);
            setClaimProgress(0);
            setClaimPhase('processing');
            setShowLiability(false);
            setShowReviewModal(false);
            setShowDealerRequest(false);
            setDealerMessage('');
            setDealerPhotos([]);
            setDealerRequestSent(false);
            return;
        }
        setClaimLogs([]);
        setClaimProgress(0);
        setClaimPhase('processing');
        setShowLiability(false);
        setShowReviewModal(false);
        setShowDealerRequest(false);
        setDealerMessage('');
        setDealerPhotos([]);
        setDealerRequestSent(false);

        const timeouts: ReturnType<typeof setTimeout>[] = [];
        CLAIM_LOG_ENTRIES.forEach((entry, i) => {
            timeouts.push(setTimeout(pauseAware(() => {
                setClaimLogs(prev => [...prev, entry]);
                setClaimProgress(Math.round(((i + 1) / CLAIM_LOG_ENTRIES.length) * 100));
            }), (i + 1) * 2000));
        });
        // Acknowledged
        timeouts.push(setTimeout(pauseAware(() => setClaimPhase('acknowledged')), CLAIM_LOG_ENTRIES.length * 2000 + 1000));
        // Show liability
        timeouts.push(setTimeout(pauseAware(() => setShowLiability(true)), CLAIM_LOG_ENTRIES.length * 2000 + 2500));

        return () => timeouts.forEach(clearTimeout);
    }, [currentStep?.id]);

    const handleResolveItem = (itemId: string) => {
        setResolvedItems(prev => new Set(prev).add(itemId));
        setExpandedValidation(null);
    };

    const statusIcon = (status: ValidationStatus, resolved: boolean) => {
        if (resolved) return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        if (status === 'present') return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        if (status === 'needs_clarification') return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />;
        return <XMarkIcon className="w-5 h-5 text-red-500" />;
    };

    const statusBg = (status: ValidationStatus, resolved: boolean) => {
        if (resolved) return 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20';
        if (status === 'present') return 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20';
        if (status === 'needs_clarification') return 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20';
        return 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20';
    };

    const effectiveRuleStatus = (rule: BusinessRule): 'pass' | 'warning' | 'fail' => {
        if (validatedRules.has(rule.id)) return 'pass';
        return rule.status;
    };

    const ruleStatusIcon = (status: 'pass' | 'warning' | 'fail') => {
        if (status === 'pass') return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        if (status === 'warning') return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />;
        return <XMarkIcon className="w-5 h-5 text-red-500" />;
    };

    const ruleStatusBg = (status: 'pass' | 'warning' | 'fail') => {
        if (status === 'pass') return 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20';
        if (status === 'warning') return 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20';
        return 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20';
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Punch List Items */}
            <div className="w-full lg:w-1/3 space-y-4">
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-lg text-foreground mb-4">Active Punch List</h3>

                    {[
                        { id: 'item-1', priority: 'High', priorityColor: 'red', title: 'Damaged Upholstery on Delivery', product: '2x Conference Room Chairs (Azure)', time: '2 hours ago', evidence: [{ icon: CameraIcon, text: '2 Photos' }, { icon: Bars4Icon, text: 'Barcode Scanned' }] },
                        { id: 'item-2', priority: 'Medium', priorityColor: 'amber', title: 'Scratched glass partition', product: '1x Acoustic Panel (Frosted)', time: '4 hours ago', evidence: [{ icon: CameraIcon, text: '1 Photo' }] },
                        { id: 'item-3', priority: 'Low', priorityColor: 'green', title: 'Missing hardware packet', product: '1x Workstation Desk', time: '1 day ago', evidence: [{ icon: DocumentTextIcon, text: 'Installer Note' }] },
                    ].map((item, idx) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item.id)}
                            className={`${idx > 0 ? 'mt-3' : ''} p-3 rounded-lg border cursor-pointer transition-all ${selectedItem === item.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10' : 'bg-muted dark:bg-zinc-800 border-border hover:border-brand-300'}`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold bg-${item.priorityColor}-100 text-${item.priorityColor}-700 dark:bg-${item.priorityColor}-900/30 dark:text-${item.priorityColor}-400`}>
                                    <ExclamationTriangleIcon className="w-3.5 h-3.5" /> {item.priority} Priority
                                </span>
                                <span className="text-xs text-muted-foreground">{item.time}</span>
                            </div>
                            <h4 className="font-bold text-foreground text-sm">{item.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{item.product}</p>
                            <div className="flex items-center gap-3 mt-3 text-xs font-medium text-muted-foreground">
                                {item.evidence.map((ev, i) => (
                                    <span key={i} className="flex items-center gap-1"><ev.icon className="w-4 h-4" /> {ev.text}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Step-conditional content */}
            <div className="w-full lg:w-2/3">
                {/* ═══ STEP 3.1: Request Intake & AI Validation (OPS only) ═══
                    Also unlocked in shared-block preview so the right-column
                    detail responds to left-column item clicks. */}
                {(previewMode || currentStep?.id === '3.1') && !isContinua && (
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                        {/* AI Context Header */}
                        <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 border-b border-indigo-200 dark:border-indigo-500/20 flex items-center gap-2">
                            <AIAgentAvatar />
                            <div>
                                <span className="font-bold text-sm text-indigo-900 dark:text-indigo-300">IntakeValidationAgent</span>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 ml-2">
                                    {extractionPhase === 'email' ? 'Incoming service request detected' : extractionPhase === 'extracting' ? 'Extracting and evaluating fields...' : `Reviewing request ${activeDetail.requestId}`}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 space-y-4 overflow-y-auto max-h-[700px] scrollbar-micro">

                            {/* ── Email Extraction Phase ── */}
                            {extractionPhase !== 'review' && (
                                <div className="animate-in fade-in duration-500">
                                    {/* Email Card */}
                                    <div className="p-4 bg-card border border-border rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center gap-2 mb-3">
                                            <EnvelopeIcon className="w-5 h-5 text-blue-500" />
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Incoming Email</span>
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex gap-2"><span className="font-bold text-muted-foreground w-14 shrink-0">From:</span><span className="text-foreground">{activeDetail.emailFrom}</span></div>
                                            <div className="flex gap-2"><span className="font-bold text-muted-foreground w-14 shrink-0">Subject:</span><span className="font-bold text-foreground">{activeDetail.emailSubject}</span></div>
                                            <div className="flex gap-2 mt-2"><span className="font-bold text-muted-foreground w-14 shrink-0">Body:</span><span className="text-muted-foreground leading-relaxed">{activeDetail.emailBody}</span></div>
                                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                                                <PaperClipIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                                <span className="text-muted-foreground font-medium">{activeDetail.attachments.length} attachment{activeDetail.attachments.length === 1 ? '' : 's'}:</span>
                                                {activeDetail.attachments.map((f, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-muted rounded text-[10px] font-medium text-foreground">{f}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Extraction Progress */}
                                    {extractionPhase === 'extracting' && (
                                        <div className="mt-4 space-y-2 animate-in fade-in duration-300">
                                            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <SparklesIcon className="w-3.5 h-3.5" />
                                                AI Extraction in Progress
                                            </p>
                                            {EXTRACTION_FIELDS.map((field, i) => (
                                                i < extractedCount && (
                                                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted dark:bg-zinc-800/50 border border-border animate-in fade-in slide-in-from-left-4 duration-300">
                                                        {field.status === 'ok' ? <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" /> : field.status === 'warning' ? <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 shrink-0" /> : <XMarkIcon className="w-4 h-4 text-red-500 shrink-0" />}
                                                        <span className="text-xs font-medium text-muted-foreground w-36 shrink-0">{field.label}</span>
                                                        <span className={`text-xs font-semibold ${field.status === 'ok' ? 'text-foreground' : field.status === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{field.value}</span>
                                                    </div>
                                                )
                                            ))}
                                            {extractedCount < EXTRACTION_FIELDS.length && (
                                                <div className="flex items-center gap-2 px-3 py-2">
                                                    <div className="flex gap-1">
                                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground">Scanning...</span>
                                                </div>
                                            )}
                                            {extractedCount >= EXTRACTION_FIELDS.length && (
                                                <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg animate-in fade-in duration-300">
                                                    <div className="flex items-start gap-2">
                                                        <AIAgentAvatar />
                                                        <p className="text-xs text-indigo-900 dark:text-indigo-300">
                                                            Extraction complete — <span className="font-bold">2 items need expert attention</span>. Label shows potential SKU mismatch and no box photo was provided. Transitioning to validation checklist...
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Validation Checklist Phase ── */}
                            {extractionPhase === 'review' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Request Context Card */}
                                    <div className="p-4 bg-card border border-border rounded-xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Request Context</p>
                                            <ConfidenceScoreBadge score={activeDetail.completeness} label="Completeness" size="sm" />
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {[
                                                { label: 'Request ID', value: activeDetail.requestId },
                                                { label: 'Product', value: activeDetail.product },
                                                { label: 'Requester', value: activeDetail.requester },
                                                { label: 'Order Ref', value: activeDetail.orderRef },
                                            ].map((item, i) => (
                                                <div key={i} className="bg-muted dark:bg-zinc-800 rounded-lg p-2.5">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{item.label}</p>
                                                    <p className="text-xs font-bold text-foreground">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* AI Validation Checklist */}
                                    <div className="mt-4">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">AI Validation Checklist — Required Documentation</p>
                                        <div className="space-y-2">
                                            {VALIDATION_ITEMS.map((item) => {
                                                const resolved = resolvedItems.has(item.id);
                                                const isExpanded = expandedValidation === item.id;
                                                return (
                                                    <div key={item.id}>
                                                        <button
                                                            onClick={() => setExpandedValidation(isExpanded ? null : item.id)}
                                                            className={`w-full p-3 rounded-lg border transition-all text-left flex items-center gap-3 ${statusBg(item.status, resolved)} ${isExpanded ? 'ring-2 ring-brand-500/30' : ''}`}
                                                        >
                                                            {statusIcon(item.status, resolved)}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-semibold text-foreground">{item.label}</span>
                                                                    {resolved && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold">Resolved</span>}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                                                            </div>
                                                            <ConfidenceScoreBadge score={item.confidence} size="sm" />
                                                        </button>

                                                        {/* ── Label Photo: QR Scan ── */}
                                                        {isExpanded && item.id === 'label-photo' && !resolved && (
                                                            <div className="ml-8 mt-2 p-3 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded-lg animate-in slide-in-from-top-2 fade-in duration-300">
                                                                <div className="flex items-start gap-2 mb-3">
                                                                    <AIAgentAvatar />
                                                                    <p className="text-xs text-indigo-900 dark:text-indigo-300">{item.aiSuggestion}</p>
                                                                </div>

                                                                {!qrScanning && !qrDone && !uploadingLabel && !labelUploaded && (
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <button
                                                                            onClick={() => {
                                                                                setQrScanning(true);
                                                                                setTimeout(pauseAware(() => { setQrScanning(false); setQrDone(true); }), 2500);
                                                                            }}
                                                                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md transition-colors flex items-center gap-1.5"
                                                                        >
                                                                            <QrCodeIcon className="w-3.5 h-3.5" />
                                                                            Scan QR Code
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setUploadingLabel(true);
                                                                                setTimeout(pauseAware(() => { setUploadingLabel(false); setLabelUploaded(true); }), 2000);
                                                                            }}
                                                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md transition-colors flex items-center gap-1.5"
                                                                        >
                                                                            <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                                                                            Upload Label
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleResolveItem(item.id)}
                                                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md transition-colors"
                                                                        >
                                                                            Accept As-Is
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {/* QR Scanning Animation */}
                                                                {qrScanning && (
                                                                    <div className="mt-3 animate-in fade-in duration-300">
                                                                        <div className="relative w-full max-w-[280px] aspect-square rounded-lg overflow-hidden border-2 border-indigo-300 dark:border-indigo-500/40 bg-card flex items-center justify-center">
                                                                            <div className="flex flex-col items-center gap-2 p-4 w-full h-full">
                                                                                <p className="text-[9px] font-bold text-muted-foreground tracking-widest uppercase">STRATA · ORDER VERIFICATION</p>
                                                                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STRATA-ORD-2055-ACK7841-CC-AZ-2024&margin=8&color=1a1a2e&bgcolor=FFFFFF" alt="QR code for order verification" className="w-[180px] h-[180px]" />
                                                                                <div className="text-center">
                                                                                    <p className="text-[9px] font-mono text-muted-foreground">ORD-2055 · Line 3</p>
                                                                                    <p className="text-[8px] text-muted-foreground">2x Conf. Room Chairs — Azure</p>
                                                                                </div>
                                                                            </div>
                                                                            {/* Scanning overlay */}
                                                                            <div className="absolute inset-0 bg-indigo-500/10">
                                                                                <div className="absolute left-0 right-0 h-0.5 bg-indigo-500 animate-[scan_2s_ease-in-out_infinite]" style={{ animation: 'scan 2s ease-in-out infinite' }} />
                                                                            </div>
                                                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-3 py-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="flex gap-1">
                                                                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                                                    </div>
                                                                                    <span className="text-[11px] text-white font-medium">Scanning QR code...</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* QR Done */}
                                                                {qrDone && (
                                                                    <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                                        <div className="p-3 bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-lg">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                                                <span className="text-xs font-bold text-green-700 dark:text-green-400">QR Decoded: CC-AZ-2025 — SKU verified</span>
                                                                            </div>
                                                                            <p className="text-[11px] text-green-600 dark:text-green-400/80 ml-6">Product label matches order reference. Model year variant confirmed.</p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleResolveItem(item.id)}
                                                                            className="mt-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md transition-colors"
                                                                        >
                                                                            Accept
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {/* Upload Label Animation */}
                                                                {uploadingLabel && (
                                                                    <div className="mt-3 animate-in fade-in duration-300">
                                                                        <div className="relative w-full max-w-[280px] h-[180px] rounded-lg overflow-hidden border-2 border-blue-300 dark:border-blue-500/40 bg-muted">
                                                                            <img src="https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=300&h=200&fit=crop" alt="Furniture product label" className="w-full h-full object-cover opacity-60" />
                                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px]">
                                                                                <ArrowUpTrayIcon className="w-8 h-8 text-white mb-2 animate-bounce" />
                                                                                <span className="text-[11px] text-white font-medium">Uploading label image...</span>
                                                                                <div className="mt-2 w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                                                                    <div className="h-full bg-blue-400 rounded-full animate-[upload_2s_ease-in-out_forwards]" style={{ animation: 'upload 2s ease-in-out forwards' }} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Upload Label Done */}
                                                                {labelUploaded && (
                                                                    <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                                        <div className="flex items-start gap-3">
                                                                            <div className="relative w-[100px] h-[100px] rounded-lg overflow-hidden border border-green-300 dark:border-green-500/30 shrink-0">
                                                                                <img src="https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=100&h=100&fit=crop" alt="Uploaded label" className="w-full h-full object-cover" />
                                                                                <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                                                    <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <div className="p-2.5 bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-lg">
                                                                                    <div className="flex items-center gap-2 mb-1">
                                                                                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                                                        <span className="text-xs font-bold text-green-700 dark:text-green-400">Label uploaded — CC-AZ-2025 identified</span>
                                                                                    </div>
                                                                                    <p className="text-[11px] text-green-600 dark:text-green-400/80 ml-6">Product label image attached to request. SKU cross-referenced with order.</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleResolveItem(item.id)}
                                                                            className="mt-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md transition-colors"
                                                                        >
                                                                            Accept
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* ── Box Photo: Multi-File Upload ── */}
                                                        {isExpanded && item.id === 'box-photo' && !resolved && (
                                                            <div className="ml-8 mt-2 p-3 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded-lg animate-in slide-in-from-top-2 fade-in duration-300">
                                                                <div className="flex items-start gap-2 mb-3">
                                                                    <AIAgentAvatar />
                                                                    <p className="text-xs text-indigo-900 dark:text-indigo-300">{item.aiSuggestion}</p>
                                                                </div>

                                                                {!uploadingEvidence && !uploadDone && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setUploadingEvidence(true);
                                                                            setUploadedPhotos(0);
                                                                            setTimeout(pauseAware(() => setUploadedPhotos(1)), 800);
                                                                            setTimeout(pauseAware(() => setUploadedPhotos(2)), 1600);
                                                                            setTimeout(pauseAware(() => setUploadedPhotos(3)), 2400);
                                                                            setTimeout(pauseAware(() => { setUploadingEvidence(false); setUploadDone(true); }), 3000);
                                                                        }}
                                                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md transition-colors flex items-center gap-1.5"
                                                                    >
                                                                        <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                                                                        Upload Evidence
                                                                    </button>
                                                                )}

                                                                {/* Upload Progress */}
                                                                {(uploadingEvidence || uploadDone) && (
                                                                    <div className="mt-3 space-y-2">
                                                                        <div className="flex items-center gap-3">
                                                                            {[
                                                                                { src: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=100&h=100&fit=crop', alt: 'Office chair packaging 1' },
                                                                                { src: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=100&h=100&fit=crop', alt: 'Office chair packaging 2' },
                                                                                { src: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=100&h=100&fit=crop', alt: 'Office chair packaging 3' },
                                                                            ].map((img, i) => (
                                                                                i < uploadedPhotos && (
                                                                                    <div key={i} className="relative w-[80px] h-[80px] rounded-lg overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-300">
                                                                                        <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                                                                                        <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                                                            <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                                                                                        </div>
                                                                                    </div>
                                                                                )
                                                                            ))}
                                                                            {uploadingEvidence && uploadedPhotos < 3 && (
                                                                                <div className="w-[80px] h-[80px] rounded-lg border-2 border-dashed border-indigo-300 dark:border-indigo-500/40 flex items-center justify-center">
                                                                                    <div className="flex gap-1">
                                                                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {uploadDone && (
                                                                            <div className="animate-in fade-in duration-300">
                                                                                <div className="p-2.5 bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-lg flex items-center gap-2">
                                                                                    <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
                                                                                    <span className="text-xs font-bold text-green-700 dark:text-green-400">3 evidence photos uploaded</span>
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => handleResolveItem(item.id)}
                                                                                    className="mt-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md transition-colors"
                                                                                >
                                                                                    Accept
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* ── Generic Items (order-number, line-number, issue-photo) ── */}
                                                        {isExpanded && item.aiSuggestion && !resolved && item.id !== 'label-photo' && item.id !== 'box-photo' && (
                                                            <div className="ml-8 mt-2 p-3 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded-lg animate-in slide-in-from-top-2 fade-in duration-300">
                                                                <div className="flex items-start gap-2 mb-3">
                                                                    <AIAgentAvatar />
                                                                    <p className="text-xs text-indigo-900 dark:text-indigo-300">{item.aiSuggestion}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleResolveItem(item.id)}
                                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md transition-colors"
                                                                >
                                                                    Accept
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Contact Requester Card */}
                                    <div className="mt-4 p-4 bg-card border border-border rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <DemoAvatar name="Facilities Coord Cardo" size="md" />
                                            <div>
                                                <p className="text-sm font-bold text-foreground">Facilities Coord Cardo</p>
                                                <p className="text-xs text-muted-foreground">Site Supervisor — Facilities</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors text-muted-foreground">
                                                <PhoneIcon className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors text-muted-foreground">
                                                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={() => nextStep()}
                                            className="px-5 py-2.5 bg-brand-300 hover:bg-brand-400 dark:bg-brand-400 dark:hover:bg-brand-300 text-zinc-900 text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                                        >
                                            <CheckCircleIcon className="w-4 h-4" />
                                            Validate & Continue
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══ STEP 3.2: Labor Quote Requested (OPS only) ═══ */}
                {currentStep?.id === '3.2' && !isContinua && (
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                        {/* AI Context Header */}
                        <div className="px-4 py-3 bg-green-50 dark:bg-green-500/10 border-b border-green-200 dark:border-green-500/20 flex items-center gap-2">
                            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <div>
                                <span className="font-bold text-sm text-green-900 dark:text-green-300">IntakeValidationAgent</span>
                                <span className="text-xs text-green-600 dark:text-green-400 ml-2">Validation complete — REQ-PL-2026-047</span>
                            </div>
                        </div>

                        <div className="p-4 space-y-4 overflow-y-auto max-h-[700px] scrollbar-micro">
                            {/* Request Context Card */}
                            <div className="p-4 bg-card border border-border rounded-xl">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Request Context</p>
                                    <ConfidenceScoreBadge score={100} label="Completeness" size="sm" />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Request ID', value: 'REQ-PL-2026-047' },
                                        { label: 'Product', value: '2x Conf. Room Chairs Azure' },
                                        { label: 'Requester', value: 'Site Supervisor — Floor 2' },
                                        { label: 'Order Ref', value: 'ORD-2055, Line 3' },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-muted dark:bg-zinc-800 rounded-lg p-2.5">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{item.label}</p>
                                            <p className="text-xs font-bold text-foreground">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Completed Validation Checklist */}
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">AI Validation Checklist — All Items Verified</p>
                                <div className="space-y-2">
                                    {VALIDATION_ITEMS.map((item) => (
                                        <div key={item.id} className="w-full p-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-500/5 flex items-center gap-3">
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-foreground">{item.label}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold">Verified</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                                            </div>
                                            <ConfidenceScoreBadge score={item.id === 'label-photo' ? 95 : item.id === 'box-photo' ? 92 : item.confidence} size="sm" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-800 flex items-center gap-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-green-700 dark:text-green-400">All Documentation Verified — Request Ready for Labor Quote</p>
                                    <p className="text-[10px] text-green-600 dark:text-green-500">5/5 items validated · Label resolved via QR scan · Box photo uploaded</p>
                                </div>
                            </div>

                            {/* Contact Requester Card */}
                            <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <DemoAvatar name="Facilities Coord Cardo" size="md" />
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Facilities Coord Cardo</p>
                                        <p className="text-xs text-muted-foreground">Site Supervisor — Facilities</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors text-muted-foreground">
                                        <PhoneIcon className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors text-muted-foreground">
                                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ STEP 3.3: Labor Reimbursement Review (OPS only) ═══ */}
                {currentStep?.id === '3.3' && !isContinua && (
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                        {/* AI Context Header */}
                        <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 border-b border-indigo-200 dark:border-indigo-500/20 flex items-center gap-2">
                            <AIAgentAvatar />
                            <div>
                                <span className="font-bold text-sm text-indigo-900 dark:text-indigo-300">LaborReimbursementAgent</span>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 ml-2">Validating installer quote for REQ-PL-2026-047</span>
                            </div>
                        </div>

                        <div className="p-4 space-y-4 overflow-y-auto max-h-[700px] scrollbar-micro">
                            {/* Labor Header Card */}
                            <div className="p-4 bg-card border border-border rounded-xl">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                            Labor Reimbursement Requested: Yes
                                        </span>
                                    </div>
                                    <ConfidenceScoreBadge score={87} label="Validation" size="sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-muted dark:bg-zinc-800 rounded-lg p-2.5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Installer</p>
                                        <p className="text-xs font-bold text-foreground">ProInstall LLC</p>
                                    </div>
                                    <div className="bg-muted dark:bg-zinc-800 rounded-lg p-2.5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Certification</p>
                                        <p className="text-xs font-bold text-green-600 dark:text-green-400">Verified — Since 2019</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quote Breakdown */}
                            <div className="p-4 bg-card border border-border rounded-xl">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Quote Breakdown</p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-muted dark:bg-zinc-800 rounded-lg">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Repair</p>
                                            <p className="text-xs text-muted-foreground">6 hrs @ $85/hr</p>
                                        </div>
                                        <p className="text-sm font-bold text-foreground">$510.00</p>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted dark:bg-zinc-800 rounded-lg">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Trip Charge</p>
                                            <p className="text-xs text-muted-foreground">Standard rate</p>
                                        </div>
                                        <p className="text-sm font-bold text-foreground">$175.00</p>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-brand-50 dark:bg-brand-900/10 border-2 border-brand-200 dark:border-brand-500/30 rounded-lg">
                                        <p className="text-sm font-bold text-brand-700 dark:text-brand-400">Grand Total</p>
                                        <p className="text-lg font-bold text-brand-700 dark:text-brand-400">$685.00</p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Business Rules Checklist */}
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">AI Business Rules Validation</p>
                                <div className="space-y-2">
                                    {BUSINESS_RULES.map((rule) => {
                                        const eff = effectiveRuleStatus(rule);
                                        const isValidated = validatedRules.has(rule.id);
                                        const suggestions = AI_RULE_SUGGESTIONS[rule.id] || [];
                                        return (
                                        <div key={rule.id} className={`p-3 rounded-lg border transition-all duration-500 ${ruleStatusBg(eff)}`}>
                                            <div className="flex items-center gap-3">
                                                {ruleStatusIcon(eff)}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-foreground">{rule.label}</span>
                                                        {isValidated ? (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold">Validated</span>
                                                        ) : rule.status === 'warning' && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold">Warning</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {isValidated ? `Adjusted to ${editValues[rule.id]} — expert validated` : rule.detail}
                                                    </p>
                                                </div>
                                                {rule.editable && !isValidated && editingRule !== rule.id && (
                                                    <button
                                                        onClick={() => setEditingRule(rule.id)}
                                                        className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-muted-foreground"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {/* Inline Edit Form + AI Suggestions */}
                                            {editingRule === rule.id && (
                                                <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-500/20 animate-in slide-in-from-top-2 fade-in duration-200">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs font-medium text-muted-foreground">
                                                            {rule.id === 'repair-threshold' ? 'Adjusted Amount ($)' : 'Adjusted Hours'}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={editValues[rule.id] || ''}
                                                            onChange={(e) => setEditValues(prev => ({ ...prev, [rule.id]: e.target.value }))}
                                                            className="w-24 px-2 py-1 text-sm border border-border rounded-md bg-card text-foreground focus:ring-1 focus:ring-brand-500 focus:outline-none"
                                                        />
                                                        <button
                                                            onClick={() => { setValidatedRules(prev => new Set(prev).add(rule.id)); setEditingRule(null); }}
                                                            className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-md transition-colors"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingRule(null)}
                                                            className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-foreground text-xs font-bold rounded-md transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                    {/* AI Suggestion Chips */}
                                                    {suggestions.length > 0 && (
                                                        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                                                <SparklesIcon className="w-3.5 h-3.5" />
                                                                AI Suggestions
                                                            </span>
                                                            {suggestions.map((s) => (
                                                                <button
                                                                    key={s.value}
                                                                    onClick={() => setEditValues(prev => ({ ...prev, [rule.id]: s.value }))}
                                                                    className="px-2.5 py-1 text-[11px] font-semibold rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors cursor-pointer"
                                                                >
                                                                    {s.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Reviewed and Continue */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => nextStep()}
                                    className="px-5 py-2.5 bg-brand-300 hover:bg-brand-400 dark:bg-brand-400 dark:hover:bg-brand-300 text-zinc-900 text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Reviewed and Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ STEP 3.4: Claim Submission & Tracking (OPS only) ═══ */}
                {currentStep?.id === '3.4' && !isContinua && (
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                        {/* AI Context Header */}
                        <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 border-b border-indigo-200 dark:border-indigo-500/20 flex items-center gap-2">
                            <AIAgentAvatar />
                            <div>
                                <span className="font-bold text-sm text-indigo-900 dark:text-indigo-300">ClaimSubmissionAgent</span>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 ml-2">Assembling claim CLM-2026-114</span>
                            </div>
                        </div>

                        <div className="p-4 space-y-4 overflow-y-auto max-h-[700px] scrollbar-micro">
                            {/* Progress Bar */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-muted-foreground">Claim Assembly Progress</p>
                                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{claimProgress}%</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-brand-500 transition-all duration-700 ease-out"
                                        style={{ width: `${claimProgress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Agent Log Terminal */}
                            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 max-h-[220px] overflow-y-auto scrollbar-micro">
                                <div className="space-y-1.5">
                                    {claimLogs.map((log, i) => (
                                        <div key={i} className="flex items-start gap-2 animate-in slide-in-from-left-4 fade-in duration-300">
                                            <span className="text-muted-foreground font-mono text-[10px] mt-0.5 select-none shrink-0">[{String(i + 1).padStart(2, '0')}]</span>
                                            <span className={`text-[11px] font-mono ${i === claimLogs.length - 1 ? 'text-green-400 animate-pulse' : 'text-muted-foreground'}`}>
                                                {log}
                                            </span>
                                        </div>
                                    ))}
                                    {claimProgress < 100 && (
                                        <div className="flex items-center gap-2 pt-1">
                                            <span className="text-muted-foreground font-mono text-[10px]">[..]</span>
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Claim Package Summary — 3-col grid */}
                            {claimProgress >= 60 && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Claim Package Summary</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="p-3 bg-card border border-border rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <PhotoIcon className="w-4 h-4 text-blue-500" />
                                                <p className="text-xs font-bold text-foreground">Photos Forwarded</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">2 evidence photos + 1 label photo uploaded with SHA256 verification</p>
                                        </div>
                                        <div className="p-3 bg-card border border-border rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <DocumentTextIcon className="w-4 h-4 text-amber-500" />
                                                <p className="text-xs font-bold text-foreground">Issue Description</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Freight handling damage — upholstery tear on 2x Conference Room Chairs (Azure)</p>
                                        </div>
                                        <div className="p-3 bg-card border border-border rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPinIcon className="w-4 h-4 text-green-500" />
                                                <p className="text-xs font-bold text-foreground">Ship-To Address</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">742 Evergreen Terrace, Suite 200, Springfield, IL 62704</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Acknowledgement Card */}
                            {claimPhase === 'acknowledged' && (
                                <div className="p-4 bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-start gap-3">
                                        <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-green-800 dark:text-green-300">Claim Acknowledged</p>
                                            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                                Replacement unit in production — <span className="font-bold">estimated delivery 8 business days</span>. Claim reference: CLM-2026-114.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tracking Timeline */}
                            {claimPhase === 'acknowledged' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Shipment Tracking</p>
                                    <div className="flex items-center gap-0">
                                        {[
                                            { label: 'PO received', done: true },
                                            { label: 'PO Reviewed', done: true },
                                            { label: 'In production', active: true },
                                            { label: 'Shipped', done: false },
                                            { label: 'Delivered', done: false },
                                        ].map((node, i, arr) => (
                                            <React.Fragment key={i}>
                                                <div className="flex flex-col items-center gap-1.5 flex-1">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${node.done ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : node.active ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-500/30' : 'bg-zinc-100 text-muted-foreground dark:bg-zinc-800 dark:text-muted-foreground'}`}>
                                                        {node.done ? <CheckCircleIcon className="w-4 h-4" /> : node.active ? <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> : <div className="w-2 h-2 rounded-full bg-zinc-400" />}
                                                    </div>
                                                    <span className={`text-[10px] font-medium text-center ${node.done ? 'text-green-600 dark:text-green-400' : node.active ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>{node.label}</span>
                                                </div>
                                                {i < arr.length - 1 && (
                                                    <div className={`h-0.5 flex-1 -mt-5 ${node.done ? 'bg-green-300 dark:bg-green-600/50' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Liability Analysis */}
                            {showLiability && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <LiabilityAnalysisPanel
                                        carrierLiability={65}
                                        mfgLiability={35}
                                        reasoning="Based on photo evidence: upholstery damage pattern consistent with impact during transit (65% carrier). Packaging analysis shows insufficient protective wrapping around chair arms, suggesting partial manufacturer responsibility (35%). Serial SN-2025-88712 confirmed within warranty period."
                                    />
                                </div>
                            )}

                            {/* Dashboard integration note */}
                            {claimPhase === 'acknowledged' && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-muted dark:bg-zinc-800 rounded-lg border border-border animate-in fade-in duration-300">
                                    <CubeIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <span className="text-xs text-muted-foreground">Claim visible on Warranty dashboard. Sales rep, PM, and facilities coordinator have been notified via digest.</span>
                                </div>
                            )}

                            {/* CTA */}
                            {showLiability && (
                                <div className="flex justify-end gap-3 pt-2 animate-in fade-in duration-300">
                                    <button
                                        onClick={() => setShowReviewModal(true)}
                                        className="px-5 py-2.5 bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2 border border-border"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                        Review Changes
                                    </button>
                                    <button
                                        onClick={() => nextStep()}
                                        className="px-5 py-2.5 bg-brand-300 hover:bg-brand-400 dark:bg-brand-400 dark:hover:bg-brand-300 text-zinc-900 text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        <CheckCircleIcon className="w-4 h-4" />
                                        Finish
                                    </button>
                                </div>
                            )}

                            {/* Review Changes Modal */}
                            {showReviewModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowReviewModal(false)}>
                                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto scrollbar-micro mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
                                        {/* Modal Header */}
                                        <div className="px-5 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-card rounded-t-2xl z-10">
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">Expert Submission Review</h3>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">REQ-PL-2026-047 — CLM-2026-114</p>
                                            </div>
                                            <button onClick={() => setShowReviewModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                                                <XMarkIcon className="w-5 h-5 text-muted-foreground" />
                                            </button>
                                        </div>

                                        <div className="p-5 space-y-5">
                                            {/* Section 1: Validation Results */}
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Validation Results</p>
                                                <div className="space-y-1.5">
                                                    {VALIDATION_ITEMS.map((item) => {
                                                        const resolved = resolvedItems.has(item.id);
                                                        return (
                                                            <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted dark:bg-zinc-800/50">
                                                                {resolved || item.status === 'present'
                                                                    ? <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
                                                                    : item.status === 'needs_clarification'
                                                                        ? <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 shrink-0" />
                                                                        : <XMarkIcon className="w-4 h-4 text-red-500 shrink-0" />
                                                                }
                                                                <span className="text-xs font-medium text-foreground flex-1">{item.label}</span>
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${resolved || item.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : item.status === 'needs_clarification' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                                    {resolved ? 'Resolved' : item.status === 'present' ? 'Present' : item.status === 'needs_clarification' ? 'Clarified' : 'Missing'}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Section 2: Labor Decision */}
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Labor Decision</p>
                                                <div className="p-3 bg-muted dark:bg-zinc-800/50 rounded-lg space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Installer</span>
                                                        <span className="text-xs font-bold text-foreground">ProInstall LLC (Certified)</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Repair Amount</span>
                                                        <span className="text-xs font-bold text-foreground">${editValues['repair-threshold'] || '510'}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Labor Hours</span>
                                                        <span className="text-xs font-bold text-foreground">{editValues['labor-hours'] || '6'} hrs</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Trip Charge</span>
                                                        <span className="text-xs font-bold text-foreground">$175.00</span>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                                        <span className="text-xs font-bold text-foreground">Status</span>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Approved</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Section 3: Claim Package */}
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Claim Package</p>
                                                <div className="p-3 bg-muted dark:bg-zinc-800/50 rounded-lg space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Claim ID</span>
                                                        <span className="text-xs font-bold text-foreground">CLM-2026-114</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Evidence</span>
                                                        <span className="text-xs font-bold text-foreground">2 photos + 1 label + SHA256</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Ship-To</span>
                                                        <span className="text-xs font-bold text-foreground">742 Evergreen Terrace, Springfield</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Liability Split</span>
                                                        <span className="text-xs font-bold text-foreground">Carrier 65% / Manufacturer 35%</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Manufacturer</span>
                                                        <span className="text-xs font-bold text-foreground">AIS Furniture Corp</span>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                                        <span className="text-xs font-bold text-foreground">Status</span>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Acknowledged — 8 days ETA</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Request to Dealer Section */}
                                        {showDealerRequest && !dealerRequestSent && (
                                            <div className="mx-5 mb-3 p-3 border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 rounded-xl space-y-2.5 animate-in slide-in-from-bottom-2 fade-in duration-300">
                                                <div className="flex items-center gap-2">
                                                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Request Additional Info from Dealer</p>
                                                </div>
                                                <textarea
                                                    value={dealerMessage}
                                                    onChange={(e) => setDealerMessage(e.target.value)}
                                                    placeholder="Describe what additional information or evidence you need from the dealer..."
                                                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none resize-none"
                                                    rows={3}
                                                />
                                                <div className="flex items-center justify-between">
                                                    <button
                                                        onClick={() => {
                                                            if (dealerPhotos.length < 3) {
                                                                const photoUrls = [
                                                                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop',
                                                                    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop',
                                                                    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=100&h=100&fit=crop',
                                                                ];
                                                                setDealerPhotos(prev => [...prev, photoUrls[prev.length]]);
                                                            }
                                                        }}
                                                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                                    >
                                                        <PaperClipIcon className="w-3.5 h-3.5" />
                                                        Attach Photo {dealerPhotos.length > 0 && `(${dealerPhotos.length})`}
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => { setShowDealerRequest(false); setDealerMessage(''); setDealerPhotos([]); }}
                                                            className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => setDealerRequestSent(true)}
                                                            disabled={!dealerMessage.trim()}
                                                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10px] font-bold rounded-lg transition-colors"
                                                        >
                                                            Send Request
                                                        </button>
                                                    </div>
                                                </div>
                                                {dealerPhotos.length > 0 && (
                                                    <div className="flex gap-2 pt-1">
                                                        {dealerPhotos.map((url, i) => (
                                                            <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-border animate-in fade-in zoom-in-90 duration-300">
                                                                <img src={url} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover" />
                                                                <button
                                                                    onClick={() => setDealerPhotos(prev => prev.filter((_, idx) => idx !== i))}
                                                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                                                                >
                                                                    <XMarkIcon className="w-2.5 h-2.5 text-white" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Sent Confirmation */}
                                        {dealerRequestSent && (
                                            <div className="mx-5 mb-3 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                    <p className="text-xs font-bold text-green-700 dark:text-green-400">Request sent to dealer</p>
                                                </div>
                                                <p className="text-[11px] text-green-600/80 dark:text-green-400/70 mt-1 ml-6">The dealer will be notified and can respond with additional evidence or clarifications.</p>
                                            </div>
                                        )}

                                        {/* Modal Footer */}
                                        <div className="px-5 py-3 border-t border-border flex justify-between sticky bottom-0 bg-card rounded-b-2xl">
                                            {!showDealerRequest && !dealerRequestSent && (
                                                <button
                                                    onClick={() => setShowDealerRequest(true)}
                                                    className="flex items-center gap-1.5 px-3 py-2 border border-amber-300 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                                                >
                                                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                                    Request to Dealer
                                                </button>
                                            )}
                                            {(showDealerRequest || dealerRequestSent) && <div />}
                                            <button
                                                onClick={() => setShowReviewModal(false)}
                                                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══ Continua Step 1.5 — Installation Schedule & Dispatch (auto 10s) ═══ */}
                {isContinua && stepId === '3.6' && instPhase !== 'idle' && (
                    <div className="space-y-4">
                        {/* Notification */}
                        {instPhase === 'notification' && (
                            <button onClick={() => setInstPhase('processing')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-brand-500 text-white"><CalendarIcon className="h-4 w-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-foreground">Installation Schedule Generation</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-white font-bold">Phase 2</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1">InstallationAgent: Generating schedule for <span className="font-semibold text-foreground">floors 4-6</span> — coordinating installers, AV techs, delivery trucks.</p>
                                            <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to generate schedule <ArrowRightIcon className="h-3 w-3" /></p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Processing */}
                        {instPhase === 'processing' && (
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <AIAgentAvatar size="sm" />
                                    <span className="text-xs font-bold text-foreground">InstallationAgent Generating Schedule...</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                    <div className="h-full rounded-full bg-brand-400 transition-all duration-[3500ms] ease-linear" style={{ width: `${instProgress}%` }} />
                                </div>
                                <div className="space-y-1.5">
                                    {instAgents.map(agent => (
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
                        {instPhase === 'breathing' && (
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-semibold text-muted-foreground">Processing complete — syncing external systems...</span>
                            </div>
                        )}

                        {/* Confirmed */}
                        {(instPhase === 'revealed' || instPhase === 'results') && (
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30 animate-in fade-in duration-300">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-green-800 dark:text-green-200"><span className="font-bold">InstallationAgent:</span> Schedule generated for floors 4-6. <span className="font-semibold text-amber-700 dark:text-amber-400">Conflict resolved</span> — floor 5 re-sequenced after floor 6 due to HM delay.</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">External Systems · Synced</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                            {['Install Scheduler', 'GC Notifier', 'Fleet Tracker', 'Checklist Engine'].map(sys => (
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
                        {instPhase === 'results' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                    {/* Header */}
                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Installation Schedule — Phase 2 (Floors 4-6)</h3>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">8 installers · 2 AV techs · 550 items · Conflict resolved</p>
                                        </div>
                                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">1 Re-sequenced</span>
                                    </div>

                                    {/* Floor Schedule Cards */}
                                    <div className="p-4 space-y-3">
                                        {FLOOR_SCHEDULE.map(f => (
                                            <div key={f.floor} className={`p-3 rounded-xl border ${f.conflict ? "border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5" : "border-border bg-muted/20"}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-foreground">{f.floor}</span>
                                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${f.conflict ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" : f.status === 'Rescheduled First' ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"}`}>{f.status}</span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground">{f.dates}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                                                    <span className="flex items-center gap-1"><UserGroupIcon className="h-3 w-3" />{f.installers} installers</span>
                                                    <span className="flex items-center gap-1"><CubeIcon className="h-3 w-3" />{f.items} items</span>
                                                </div>
                                                {f.conflict && f.reason && (
                                                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1"><ExclamationTriangleIcon className="h-3 w-3" />{f.reason}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Resource Summary */}
                                    <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                                                <span><span className="font-semibold text-foreground">8</span> in-house installers</span>
                                                <span><span className="font-semibold text-foreground">2</span> AV techs</span>
                                                <span><span className="font-semibold text-foreground">3</span> delivery trucks</span>
                                                <span className="flex items-center gap-1"><ClipboardDocumentCheckIcon className="h-3 w-3" /><span className="font-semibold text-foreground">120</span> checklist items</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ FM Step F.1 — Service Request Intake (interactive) ═══ */}
                {isContinua && stepId === '2.1' && fmIntakePhase !== 'idle' && (
                    <div className="space-y-4">
                        {/* Email notification */}
                        {fmIntakePhase === 'email' && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-300 dark:border-blue-500/30 shadow-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-blue-500 text-white"><EnvelopeIcon className="h-4 w-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-foreground">New Service Request — Email Received</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500 text-white font-bold">SAFETY</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1">From: <span className="font-semibold text-foreground">Facilities Coord Cardo</span> (Facilities Coordinator)</p>
                                            <div className="mt-3 p-3 rounded-lg bg-card border border-border text-[11px] text-foreground/80 space-y-1">
                                                <p className="font-semibold">Subject: Broken chair + damaged lamp — Office 3-214</p>
                                                <p>Hi, the Aeron chair in my office has a broken gas cylinder — it keeps sinking and I can't work safely. Also the desk lamp stopped working. Can someone look at this ASAP?</p>
                                                <p className="text-muted-foreground italic">2 photos attached</p>
                                            </div>
                                            <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1"><SparklesIcon className="h-3 w-3" /> IntakeAgent analyzing email...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* AI Extraction */}
                        {(fmIntakePhase === 'extracting' || fmIntakePhase === 'classified' || fmIntakePhase === 'submitted') && (
                            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
                                <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 border-b border-indigo-200 dark:border-indigo-500/20 flex items-center gap-2">
                                    <AIAgentAvatar size="sm" />
                                    <div>
                                        <span className="font-bold text-sm text-indigo-900 dark:text-indigo-300">IntakeAgent</span>
                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 ml-2">
                                            {fmIntakePhase === 'extracting' ? 'Extracting fields from email...' : fmIntakePhase === 'classified' ? 'Request classified — ready for submission' : 'Request submitted'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {/* Extracted fields */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <SparklesIcon className="w-3.5 h-3.5" />
                                            {fmIntakePhase === 'extracting' ? 'EXTRACTING FIELDS...' : 'EXTRACTED FIELDS'}
                                        </p>
                                        {FM_INTAKE_FIELDS.slice(0, fmIntakePhase === 'extracting' ? fmIntakeFieldCount : FM_INTAKE_FIELDS.length).map((field, i) => (
                                            <div key={i} className="flex items-center gap-2 text-[11px] animate-in fade-in slide-in-from-left-2 duration-300">
                                                {field.status === 'ok' ? <CheckCircleIcon className="h-4 w-4 text-green-500 shrink-0" /> : <ExclamationTriangleIcon className="h-4 w-4 text-amber-500 shrink-0" />}
                                                <span className="font-semibold text-foreground w-20">{field.label}</span>
                                                <span className={field.status === 'warning' ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground"}>{field.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Classification */}
                                    {(fmIntakePhase === 'classified' || fmIntakePhase === 'submitted') && (
                                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                                                    <span className="text-xs font-bold text-red-700 dark:text-red-400">Priority: HIGH — Safety Flag</span>
                                                </div>
                                                <p className="text-[10px] text-red-600 dark:text-red-300">Broken gas cylinder presents ergonomic/safety risk. Immediate triage recommended.</p>
                                            </div>
                                            {fmIntakePhase === 'classified' && (
                                                <button onClick={() => setFmIntakePhase('submitted')} className="mt-3 w-full px-4 py-2.5 text-sm font-bold rounded-xl bg-brand-300 text-zinc-900 hover:bg-brand-400 transition-colors flex items-center justify-center gap-2">
                                                    <ArrowRightIcon className="h-4 w-4" /> Submit Service Request
                                                </button>
                                            )}
                                            {fmIntakePhase === 'submitted' && (
                                                <div className="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-300 dark:border-green-500/20 flex items-center gap-2 animate-in fade-in duration-300">
                                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                                    <span className="text-xs font-bold text-green-700 dark:text-green-300">REQ-FM-2026-018 submitted — routing to TriageAgent...</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ FM Step F.2 — AI Triage & Cross-Reference (auto 14s) ═══ */}
                {isContinua && stepId === '2.2' && fmTriagePhase !== 'idle' && (
                    <div className="space-y-4">
                        {/* Notification */}
                        {fmTriagePhase === 'notification' && (
                            <button onClick={() => setFmTriagePhase('processing')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-brand-500 text-white"><SparklesIcon className="h-4 w-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-foreground">AI Triage — Cross-Referencing 4 Databases</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500 text-white font-bold">SAFETY</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1">TriageAgent: Analyzing <span className="font-semibold text-foreground">REQ-FM-2026-018</span> — checking warranty, inventory, contracts, scheduling.</p>
                                            <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to run triage <ArrowRightIcon className="h-3 w-3" /></p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Processing */}
                        {fmTriagePhase === 'processing' && (
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <AIAgentAvatar size="sm" />
                                    <span className="text-xs font-bold text-foreground">TriageAgent Cross-Referencing...</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                    <div className="h-full rounded-full bg-brand-400 transition-all duration-[3500ms] ease-linear" style={{ width: `${fmTriageProgress}%` }} />
                                </div>
                                <div className="space-y-1.5">
                                    {fmTriageAgents.map(agent => (
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
                        {fmTriagePhase === 'breathing' && (
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-semibold text-muted-foreground">Triage complete — compiling resolution plan...</span>
                            </div>
                        )}

                        {/* Confirmed */}
                        {(fmTriagePhase === 'revealed' || fmTriagePhase === 'results') && (
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30 animate-in fade-in duration-300">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-green-800 dark:text-green-200"><span className="font-bold">TriageAgent:</span> 4 databases cross-referenced. <span className="font-semibold">Resolution plan ready</span> — warranty active, consignment available, installer dispatched.</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Systems Queried · Complete</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                            {['Warranty DB', 'Inventory', 'Contracts', 'Scheduling'].map(sys => (
                                                <span key={sys} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-300 text-[10px] font-medium border border-green-200/50 dark:border-green-500/20">
                                                    <CheckCircleIcon className="h-3 w-3" />{sys}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Results: Resolution Plan */}
                        {fmTriagePhase === 'results' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Resolution Plan — REQ-FM-2026-018</h3>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">3 recommended actions · Total cost: $0 · ETA: 26 hours</p>
                                        </div>
                                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold">$0 Cost</span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {FM_TRIAGE_RESULTS.map((r, i) => (
                                            <div key={i} className={`p-3 rounded-xl border ${r.badge === 'RECOMMENDED' ? "border-brand-300 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-500/5" : "border-border bg-muted/20"}`}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-foreground">{r.title}</span>
                                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${r.badge === 'RECOMMENDED' ? "bg-brand-200 text-brand-800 dark:bg-brand-500/10 dark:text-brand-400" : r.badge === 'AUTO-FILED' ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"}`}>{r.badge}</span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">{r.detail}</p>
                                                <div className="flex items-center justify-between mt-2 text-[10px]">
                                                    <span className="font-semibold text-green-600 dark:text-green-400">Cost: {r.cost}</span>
                                                    <button className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors text-[10px] font-medium">
                                                        <ChatBubbleLeftRightIcon className="h-3 w-3" />
                                                        Comment
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Approve Plan button */}
                                <button
                                    onClick={() => nextStep()}
                                    className="w-full py-2.5 bg-brand-300 hover:bg-brand-400 text-zinc-900 text-xs font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <CheckCircleIcon className="h-4 w-4" />
                                    Approve Plan
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ FM Step F.5 — Resolution & Installer Report (auto 10s) ═══ */}
                {isContinua && stepId === '2.5' && fmResPhase !== 'idle' && (
                    <div className="space-y-4">
                        {/* Notification */}
                        {fmResPhase === 'notification' && (
                            <button onClick={() => setFmResPhase('processing')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-brand-500 text-white"><ClipboardDocumentCheckIcon className="h-4 w-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-foreground">Installer Report — Service Complete</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500 text-white font-bold">RESOLVED</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1">ResolutionAgent: ProInstall completed Aeron swap — processing <span className="font-semibold text-foreground">installer report, inventory sync, notifications</span>.</p>
                                            <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to process resolution <ArrowRightIcon className="h-3 w-3" /></p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Processing */}
                        {fmResPhase === 'processing' && (
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <AIAgentAvatar size="sm" />
                                    <span className="text-xs font-bold text-foreground">ResolutionAgent Processing Report...</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                    <div className="h-full rounded-full bg-brand-400 transition-all duration-[3500ms] ease-linear" style={{ width: `${fmResProgress}%` }} />
                                </div>
                                <div className="space-y-1.5">
                                    {fmResAgents.map(agent => (
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
                        {fmResPhase === 'breathing' && (
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-semibold text-muted-foreground">Resolution verified — notifying stakeholders...</span>
                            </div>
                        )}

                        {/* Confirmed */}
                        {(fmResPhase === 'revealed' || fmResPhase === 'results') && (
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30 animate-in fade-in duration-300">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-green-800 dark:text-green-200"><span className="font-bold">ResolutionAgent:</span> Service request <span className="font-semibold">REQ-FM-2026-018 RESOLVED</span>. Aeron replaced, Carlos relocated back to 3-214, all stakeholders notified.</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">All Systems · Updated</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                            {['Inventory', 'Warranty Claims', 'Service Desk', 'Notifications'].map(sys => (
                                                <span key={sys} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-300 text-[10px] font-medium border border-green-200/50 dark:border-green-500/20">
                                                    <CheckCircleIcon className="h-3 w-3" />{sys}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Results: Installer Report + Relocation Tracking + Notifications */}
                        {fmResPhase === 'results' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                                {/* Installer Report Card */}
                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Installer Report — ProInstall LLC</h3>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">Technician: James Mercer · Duration: 1.5 hrs · QC: Passed</p>
                                        </div>
                                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold">COMPLETE</span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {[
                                            { task: 'Removed defective Aeron (SN: AER-2024-3214-07)', status: 'Done' },
                                            { task: 'Installed consignment Aeron Remastered (SN: AER-CON-WH-003)', status: 'Done' },
                                            { task: 'QC: Height adjustment, tilt, lumbar — all functional', status: 'Passed' },
                                            { task: 'Old unit packaged for warranty return', status: 'Ready' },
                                            { task: 'Desk lamp replaced (maintenance stock)', status: 'Done' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-[11px]">
                                                <CheckCircleIcon className="h-4 w-4 text-green-500 shrink-0" />
                                                <span className="text-foreground flex-1">{item.task}</span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold">{item.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ─── Relocation Tracking & Evidence ─── */}
                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <TruckIcon className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">Relocation Tracking</h3>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">Office 3-214 → 3-216 → 3-214 · REQ-FM-2026-018</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold">TRACKED</span>
                                    </div>
                                    <div className="p-4">
                                        {/* Timeline */}
                                        <div className="relative pl-6">
                                            {/* Timeline Line */}
                                            <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-zinc-200 dark:bg-zinc-700" />

                                            <div className="space-y-5">
                                                {[
                                                    { title: 'Service Request Filed', desc: 'Facilities Coord Cardo reported broken Aeron chair + flickering desk lamp', time: 'Mar 17, 9:14 AM', actor: 'Facilities Coord Cardo', location: 'Office 3-214', status: 'completed' as const },
                                                    { title: 'AI Triage Completed', desc: 'TriageAgent cross-referenced 4 databases — resolution plan generated', time: 'Mar 17, 9:15 AM', actor: 'TriageAgent', location: 'System', status: 'completed' as const },
                                                    { title: 'Temp Relocation Executed', desc: 'Workstation assets moved: Laptop Dock, 2× Monitor, Keyboard + Mouse, Desk Lamp', time: 'Mar 17, 10:30 AM', actor: 'Account Manager Kai', location: 'Office 3-214 → 3-216', status: 'completed' as const,
                                                      evidence: [
                                                          { type: 'photo' as const, label: 'Office 3-216 — Setup complete' },
                                                          { type: 'note' as const, label: 'Carlos confirmed workspace functional' },
                                                      ]
                                                    },
                                                    { title: 'Installer Dispatched', desc: 'ProInstall LLC — James Mercer scheduled for Aeron swap', time: 'Mar 18, 9:00 AM', actor: 'ProInstall LLC', location: 'En route → Office 3-214', status: 'completed' as const },
                                                    { title: 'Chair Swap Completed', desc: 'Defective Aeron removed, consignment Aeron Remastered installed. QC passed.', time: 'Mar 18, 10:32 AM', actor: 'James Mercer', location: 'Office 3-214', status: 'completed' as const,
                                                      evidence: [
                                                          { type: 'photo' as const, label: 'New Aeron installed — SN: AER-CON-WH-003' },
                                                          { type: 'photo' as const, label: 'Old unit packaged for warranty return' },
                                                          { type: 'signature' as const, label: 'QC sign-off — James Mercer' },
                                                      ]
                                                    },
                                                    { title: 'Return Relocation', desc: "Carlos's assets returned from Office 3-216 to 3-214. Temp workspace released.", time: 'Mar 18, 11:15 AM', actor: 'Account Manager Kai', location: 'Office 3-216 to 3-214', status: 'completed' as const },
                                                ].map((step, i) => (
                                                    <div key={i} className="relative flex items-start">
                                                        {/* Dot */}
                                                        <div className={`absolute -left-6 h-5 w-5 rounded-full flex items-center justify-center border-2 z-10 bg-card ${
                                                            step.status === 'completed' ? 'border-green-500 text-green-500' : 'border-blue-500 text-blue-500 animate-pulse'
                                                        }`}>
                                                            {step.status === 'completed' ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                                        </div>

                                                        <div className="flex-1 ml-2">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <h4 className="text-[11px] font-bold text-foreground">{step.title}</h4>
                                                                <span className="text-[9px] text-muted-foreground whitespace-nowrap bg-muted/50 px-1.5 py-0.5 rounded shrink-0">{step.time}</span>
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground mt-0.5">{step.desc}</p>

                                                            {/* Meta */}
                                                            <div className="flex flex-wrap gap-2 mt-1.5 text-[9px] text-muted-foreground">
                                                                <span className="flex items-center gap-0.5"><UserGroupIcon className="w-3 h-3" />{step.actor}</span>
                                                                <span className="flex items-center gap-0.5"><MapPinIcon className="w-3 h-3" />{step.location}</span>
                                                            </div>

                                                            {/* Evidence */}
                                                            {step.evidence && (
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    {step.evidence.map((ev, j) => (
                                                                        <div key={j} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50 border border-border text-[9px] font-medium text-muted-foreground">
                                                                            {ev.type === 'photo' && <CameraIcon className="w-3 h-3 text-indigo-500" />}
                                                                            {ev.type === 'signature' && <PencilIcon className="w-3 h-3 text-blue-500" />}
                                                                            {ev.type === 'note' && <DocumentTextIcon className="w-3 h-3 text-amber-500" />}
                                                                            {ev.label}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stakeholder Notifications */}
                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                    <div className="p-4 border-b border-border/50">
                                        <h3 className="text-sm font-bold text-foreground">Stakeholder Notifications</h3>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">3 parties notified of resolution</p>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {FM_RESOLUTION_NOTIFICATIONS.map((n, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/20">
                                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${n.color} text-white flex items-center justify-center text-xs font-bold shrink-0`}>{n.initials}</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-foreground">{n.name}</span>
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{n.role}</span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">{n.message}</p>
                                                </div>
                                                <CheckCircleIcon className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-green-50 dark:bg-green-500/5 border border-green-300 dark:border-green-500/30 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-green-800 dark:text-green-200">RESOLVED — $0 Total Cost · 26 Hours</p>
                                            <p className="text-[10px] text-green-700 dark:text-green-300 mt-0.5">Warranty claim filed · Consignment swap ($0) · Office relocation + return · All stakeholders notified</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Next Step button */}
                                <button
                                    onClick={() => nextStep()}
                                    className="w-full py-2.5 bg-brand-300 hover:bg-brand-400 text-zinc-900 text-xs font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <CheckCircleIcon className="h-4 w-4" />
                                    Complete Flow
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Default: No step active — show empty state */}
                {!['3.1', '3.2', '3.3', '3.4', '3.5'].includes(currentStep?.id) && !(isContinua && stepId === '3.6' && instPhase !== 'idle') && !(isContinua && stepId === '2.1' && fmIntakePhase !== 'idle') && !(isContinua && stepId === '2.2' && fmTriagePhase !== 'idle') && !(isContinua && stepId === '2.5' && fmResPhase !== 'idle') && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/50 dark:bg-zinc-900/20 border border-border border-dashed rounded-xl min-h-[400px]">
                        <ExclamationTriangleIcon className="w-12 h-12 text-zinc-300 dark:text-muted-foreground mb-4" />
                        <h4 className="text-lg font-medium text-foreground">Select a Punch List Item</h4>
                        <p className="text-sm text-muted-foreground max-w-sm mt-2">Choose an item from the left to view installer reports, photos, and AI-suggested warranty actions.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
