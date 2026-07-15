import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    CheckCircle2,
    ArrowUpRight,
    Bot,
    FileText,
    Cpu,
    Sparkles,
    Users,
    SearchIcon,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { useDemoProfile } from '../../context/useDemoProfile';
import AgentPipelineStrip from '../simulations/AgentPipelineStrip';
import type { AgentStep } from '../simulations/AgentPipelineStrip';
import ConfidenceScoreBadge from '../widgets/ConfidenceScoreBadge';

// Steps that show the floating lupa panel (per profile)
const COI_PANEL_STEPS = ['1.2', '1.3', '1.4'];
const CONTINUA_PANEL_STEPS = ['1.3', '3.2', '3.5'];

// Simplified procurement phases for Continua 2.2 (human-friendly labels instead of technical agent names)
const CONTINUA_PROC_PHASES = [
    { name: 'Analyzing specifications', detail: '1,500 line items from project spec' },
    { name: 'Comparing prices', detail: 'Contract vs list across 4 sources — $110K savings found' },
    { name: 'Applying business rules', detail: '5 rules · consolidation · volume discounts' },
    { name: 'Generating orders', detail: '3 consolidated POs · $3.2M · 12 manufacturers' },
];
const OPS_PANEL_STEPS_IDS = ['1.1', '1.3', '2.2', '2.4'];

interface DemoProcessPanelProps {
    onNavigate?: (page: string) => void;
}

// Delay before the lupa panel appears (audience sees the normal page first)
const PANEL_REVEAL_DELAY = 2025;

export default function DemoProcessPanel({ onNavigate }: DemoProcessPanelProps) {
    const { currentStep, nextStep, isDemoActive, isPaused, setProcCompleteStep, lupaStep } = useDemo();
    const { activeProfile } = useDemoProfile();
    const isOps = activeProfile.id === 'ops';
    const isContinua = activeProfile.id === 'continua';

    const [panelVisible, setPanelVisible] = useState(false);
    const [agentProgress, setAgentProgress] = useState(0);
    const [agentLogs, setAgentLogs] = useState<string[]>([]);
    const [pipelineAgents, setPipelineAgents] = useState<AgentStep[]>([]);
    const [confidenceFields, setConfidenceFields] = useState<{ field: string; score: number }[]>([]);

    // Continua 2.2 — expert question + summary states
    const [procPhases, setProcPhases] = useState<{ name: string; detail: string; visible: boolean; done: boolean }[]>([]);
    const [summaryVisible, setSummaryVisible] = useState(false);

    // Ref tracks pause state so timer callbacks can check it without re-triggering effects
    const isPausedRef = useRef(isPaused);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

    // Helper: wraps a callback so it waits while paused before executing
    const pauseAware = useCallback((fn: () => void) => {
        return () => {
            if (!isPausedRef.current) { fn(); return; }
            const poll = setInterval(() => {
                if (!isPausedRef.current) { clearInterval(poll); fn(); }
            }, 300);
        };
    }, []);

    // Delayed panel reveal — audience sees the kanban first, then the lupa zooms in
    // For Continua 2.2: panel is signal-driven (lupaStep), not auto-delayed
    useEffect(() => {
        const panelSteps = isOps ? OPS_PANEL_STEPS_IDS : isContinua ? CONTINUA_PANEL_STEPS : COI_PANEL_STEPS;
        if (!isDemoActive || !panelSteps.includes(currentStep?.id)) {
            setPanelVisible(false);
            return;
        }
        // Continua 2.2: wait for lupaStep signal from Transactions
        if (isContinua && currentStep?.id === '3.2') {
            setPanelVisible(lupaStep === '3.2');
            return;
        }
        const revealTimer = setTimeout(() => setPanelVisible(true), PANEL_REVEAL_DELAY);
        return () => { clearTimeout(revealTimer); setPanelVisible(false); };
    }, [isDemoActive, currentStep?.id, isOps, isContinua, lupaStep]);

    // Reset + run timeline for each step (timelines shifted by PANEL_REVEAL_DELAY)
    useEffect(() => {
        const panelSteps = isOps ? OPS_PANEL_STEPS_IDS : isContinua ? CONTINUA_PANEL_STEPS : COI_PANEL_STEPS;
        if (!isDemoActive || !panelSteps.includes(currentStep?.id)) return;

        // Reset
        setAgentProgress(0);
        setAgentLogs([]);
        setPipelineAgents([]);
        setConfidenceFields([]);

        const timers: ReturnType<typeof setTimeout>[] = [];
        // All timeline delays are offset so animations start after the panel appears
        const D = PANEL_REVEAL_DELAY;

        if (currentStep?.id === '3.2' && isContinua) {
            // Continua 3.2: Simplified procurement phases → summary verde
            // Expert question is handled inline in Transactions — panel appears AFTER expert answer via lupaStep
            if (lupaStep !== '3.2') return; // Don't start timeline until signal received
            setProcPhases(CONTINUA_PROC_PHASES.map(p => ({ ...p, visible: false, done: false })));
            setSummaryVisible(false);

            const stagger = 1800;
            const phaseDone = 1200;

            CONTINUA_PROC_PHASES.forEach((_, i) => {
                timers.push(setTimeout(pauseAware(() => {
                    setProcPhases(prev => prev.map((p, j) => j === i ? { ...p, visible: true } : p));
                    setAgentProgress(Math.round(((i + 0.5) / CONTINUA_PROC_PHASES.length) * 100));
                }), i * stagger));

                timers.push(setTimeout(pauseAware(() => {
                    setProcPhases(prev => prev.map((p, j) => j === i ? { ...p, done: true } : p));
                    setAgentProgress(Math.round(((i + 1) / CONTINUA_PROC_PHASES.length) * 100));
                }), i * stagger + phaseDone));
            });

            // After all phases complete → show summary verde → signal completion
            const totalPhaseTime = CONTINUA_PROC_PHASES.length * stagger + 800;
            timers.push(setTimeout(pauseAware(() => {
                setSummaryVisible(true);
            }), totalPhaseTime));
            timers.push(setTimeout(pauseAware(() => {
                setProcCompleteStep('3.2');
                setPanelVisible(false);
            }), totalPhaseTime + 2500));

        } else if (currentStep?.id === '1.2' && !isContinua) {
            // COI profile: Show completed extraction state
            timers.push(setTimeout(pauseAware(() => {
                setAgentProgress(100);
                setPipelineAgents([
                    { id: 'intake', name: 'EmailIntake', status: 'done' },
                    { id: 'ocr', name: 'OCR/TextExtract', status: 'done', detail: '2 files' },
                    { id: 'parser', name: 'DataParser', status: 'done', detail: '200 items' },
                    { id: 'normalizer', name: 'Normalizer', status: 'done' },
                    { id: 'validator', name: 'Validator', status: 'done', detail: '82% confidence' },
                ]);
                setConfidenceFields([
                    { field: 'Product', score: 95 },
                    { field: 'Quantity', score: 88 },
                    { field: 'Ship-To', score: 92 },
                    { field: 'Freight', score: 42 },
                ]);
            }), D));
            timers.push(setTimeout(pauseAware(() => nextStep()), D + 27000));

        } else if (currentStep?.id === '1.3' && isContinua) {
            // Continua 1.3: Price Verification Engine — UAL HQ Floor 7 context (interactive, waits for button)
            timers.push(setTimeout(pauseAware(() => {
                setAgentLogs(['PriceVerificationEngine: UAL HQ — Scanning 200+ manufacturer price lists...']);
                setPipelineAgents([
                    { id: 'scan', name: 'PriceScanner', status: 'running' },
                    { id: 'compare', name: 'MarginAnalyzer', status: 'pending' },
                    { id: 'flag', name: 'ExceptionFlagger', status: 'pending' },
                    { id: 'update', name: 'PriceUpdater', status: 'pending' },
                ]);
            }), D));

            const continuaPriceTimeline = [
                { delay: D + 3500, log: 'PriceScanner: UAL HQ project — scanning Q1 updates across Herman Miller, Steelcase, DIRTT...' },
                { delay: D + 7000, log: 'PriceScanner: 14 items with outdated cost basis detected (avg +3.2% increase).' },
                { delay: D + 10000, log: 'MarginAnalyzer: UAL Floor 7 spec — recalculating margins. Average 34% → 6 items below 25% threshold.' },
                { delay: D + 13000, log: 'ExceptionFlagger: 3 consignment items from Herman Miller — 90-day review pending.' },
                { delay: D + 15500, log: 'PriceUpdater: Suggested price updates generated — $110K savings identified. Report sent to expert.' },
            ];

            continuaPriceTimeline.forEach(({ delay, log }, index) => {
                timers.push(setTimeout(pauseAware(() => {
                    setAgentProgress(Math.round(((index + 1) / continuaPriceTimeline.length) * 100));
                    setAgentLogs(prev => [...prev, log]);

                    if (index === 1) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'scan' ? { ...a, status: 'done' as const } :
                            a.id === 'compare' ? { ...a, status: 'running' as const } : a
                        ));
                    }
                    if (index === 2) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'compare' ? { ...a, status: 'done' as const } :
                            a.id === 'flag' ? { ...a, status: 'running' as const } : a
                        ));
                    }
                    if (index === 3) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'flag' ? { ...a, status: 'done' as const } :
                            a.id === 'update' ? { ...a, status: 'running' as const } : a
                        ));
                    }
                    if (index === 4) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'update' ? { ...a, status: 'done' as const } : a
                        ));
                        setConfidenceFields([
                            { field: 'Contract Prices', score: 100 },
                            { field: 'Margin Analysis', score: 96 },
                            { field: 'Consignment Review', score: 88 },
                            { field: 'Price Updates', score: 94 },
                        ]);
                    }
                }), delay));
            });

            // No auto-advance — waits for "Continue to Quote Draft" button click

        } else if (currentStep?.id === '1.3' && !isOps) {
            timers.push(setTimeout(pauseAware(() => {
                setAgentLogs(['Initializing Normalization Pipeline...']);
                setPipelineAgents([
                    { id: 'email', name: 'EmailIntake', status: 'done' },
                    { id: 'ocr', name: 'OCR Extract', status: 'done' },
                    { id: 'parser', name: 'Parser', status: 'running' },
                    { id: 'normalizer', name: 'Normalizer', status: 'pending' },
                ]);
            }), D));

            const timeline = [
                { delay: D + 5400, log: 'Parser: Tokenizing extracted text fields...' },
                { delay: D + 12150, log: 'Parser: Mapped 200 line items to catalog schema.' },
                { delay: D + 20250, log: 'Normalizer: Resolving product codes against master catalog...' },
                { delay: D + 27000, log: 'Normalizer: Complete. Field confidence scores generated.' },
            ];

            timeline.forEach(({ delay, log }, index) => {
                timers.push(setTimeout(pauseAware(() => {
                    setAgentProgress((index + 1) * 25);
                    setAgentLogs(prev => [...prev, log]);

                    if (index === 1) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'parser' ? { ...a, status: 'done' as const } :
                            a.id === 'normalizer' ? { ...a, status: 'running' as const } : a
                        ));
                    }
                    if (index === 3) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'normalizer' ? { ...a, status: 'done' as const } : a
                        ));
                        setConfidenceFields([
                            { field: 'Product', score: 95 },
                            { field: 'Quantity', score: 88 },
                            { field: 'Ship-To', score: 92 },
                            { field: 'Freight', score: 42 },
                        ]);
                    }
                }), delay));
            });

        } else if (currentStep?.id === '1.4') {
            timers.push(setTimeout(pauseAware(() => {
                setAgentLogs(['Initializing QuoteBuilder Agent...']);
                setPipelineAgents([
                    { id: 'email', name: 'EmailIntake', status: 'done' },
                    { id: 'ocr', name: 'OCR Extract', status: 'done' },
                    { id: 'normalizer', name: 'Normalizer', status: 'done' },
                    { id: 'quotebuilder', name: 'QuoteBuilder', status: 'running' },
                ]);
            }), D));

            const timeline = [
                { delay: D + 5400, log: 'QuoteBuilder: Loading normalized line items...' },
                { delay: D + 12150, log: 'QuoteBuilder: Applying pricing rules and discounts...' },
                { delay: D + 20250, log: 'QuoteBuilder: Freight zone routing failed — multi-zone delivery.' },
                { delay: D + 27000, log: 'QuoteBuilder: Draft complete. Flagged for Expert Attention.' },
            ];

            timeline.forEach(({ delay, log }, index) => {
                timers.push(setTimeout(pauseAware(() => {
                    setAgentProgress((index + 1) * 25);
                    setAgentLogs(prev => [...prev, log]);

                    if (index === 3) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'quotebuilder' ? { ...a, status: 'done' as const, detail: 'Needs Attention' } : a
                        ));
                    }
                }), delay));
            });

        } else if (currentStep?.id === '2.2' && !isOps) {
            timers.push(setTimeout(pauseAware(() => {
                setAgentLogs(['Initializing ERP Normalization Pipeline...']);
                setPipelineAgents([
                    { id: 'erp', name: 'ERPConnector', status: 'done', detail: 'EDI/855' },
                    { id: 'norm', name: 'DataNorm', status: 'running' },
                    { id: 'ack', name: 'ACKIngest', status: 'pending' },
                    { id: 'comp', name: 'POvsACK', status: 'pending' },
                    { id: 'discrep', name: 'DiscrepResolver', status: 'pending' },
                    { id: 'bo', name: 'Backorder', status: 'pending' },
                    { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                    { id: 'notif', name: 'Notification', status: 'pending' },
                ]);
            }), D));

            const timeline = [
                { delay: D + 3375, log: 'ERPConnectorAgent: Acknowledgement data received from eManage ONE (EDI/855).' },
                { delay: D + 8100, log: 'DataNormalizationAgent: Mapping raw EDI fields to standard schema...' },
                { delay: D + 13500, log: 'AcknowledgementIngestAgent: Parsing 4 acknowledgement line items.' },
                { delay: D + 18900, log: 'DataNormalizationAgent: Unified 4 raw fields to standard model.' },
                { delay: D + 24300, log: 'EntityLinker: Linked PO #ORD-2055 ↔ Acknowledgement #ACK-2055. Ready for Delta Engine.' },
            ];

            timeline.forEach(({ delay, log }, index) => {
                timers.push(setTimeout(pauseAware(() => {
                    setAgentProgress((index + 1) * 20);
                    setAgentLogs(prev => [...prev, log]);

                    if (index === 0) {
                        setPipelineAgents([
                            { id: 'erp', name: 'ERPConnector', status: 'done', detail: 'EDI/855' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'ack', name: 'ACKIngest', status: 'running' },
                            { id: 'comp', name: 'POvsACK', status: 'pending' },
                            { id: 'discrep', name: 'DiscrepResolver', status: 'pending' },
                            { id: 'bo', name: 'Backorder', status: 'pending' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]);
                    }
                    if (index === 2) {
                        setPipelineAgents([
                            { id: 'erp', name: 'ERPConnector', status: 'done', detail: 'EDI/855' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'ack', name: 'ACKIngest', status: 'done' },
                            { id: 'comp', name: 'POvsACK', status: 'pending' },
                            { id: 'discrep', name: 'DiscrepResolver', status: 'pending' },
                            { id: 'bo', name: 'Backorder', status: 'pending' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]);
                    }
                    if (index === 4) {
                        setPipelineAgents([
                            { id: 'erp', name: 'ERPConnector', status: 'done', detail: 'EDI/855' },
                            { id: 'norm', name: 'DataNorm', status: 'done', detail: '4 fields mapped' },
                            { id: 'ack', name: 'ACKIngest', status: 'done' },
                            { id: 'comp', name: 'POvsACK', status: 'pending' },
                            { id: 'discrep', name: 'DiscrepResolver', status: 'pending' },
                            { id: 'bo', name: 'Backorder', status: 'pending' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]);
                        setConfidenceFields([
                            { field: 'Product SKU', score: 96 },
                            { field: 'Quantity', score: 100 },
                            { field: 'Unit Price', score: 94 },
                            { field: 'Freight', score: 72 },
                        ]);
                    }
                }), delay));
            });

        } else if (currentStep?.id === '2.3') {
            timers.push(setTimeout(pauseAware(() => {
                setAgentLogs(['Initializing Delta Engine...']);
                setPipelineAgents([
                    { id: 'erp', name: 'ERPConnector', status: 'done' },
                    { id: 'norm', name: 'DataNorm', status: 'done' },
                    { id: 'ack', name: 'ACKIngest', status: 'done' },
                    { id: 'comp', name: 'POvsACK', status: 'running' },
                    { id: 'discrep', name: 'DiscrepResolver', status: 'pending' },
                    { id: 'bo', name: 'Backorder', status: 'pending' },
                    { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                    { id: 'notif', name: 'Notification', status: 'pending' },
                ]);
            }), D));

            const timeline = [
                { delay: D + 2700, log: 'POvsACKAgent: Loading PO #ORD-2055 (4 lines).' },
                { delay: D + 6750, log: 'POvsACKAgent: Loading Acknowledgement #ACK-2055 (4 lines).' },
                { delay: D + 11475, log: 'POvsACKAgent: Line-by-line comparison in progress...' },
                { delay: D + 16200, log: 'POvsACKAgent: EXCEPTION — Line 2 substitution SKU-B→SKU-C.' },
                { delay: D + 20925, log: 'POvsACKAgent: EXCEPTION — Freight $45→$150 (+233%).' },
                { delay: D + 25650, log: 'DiscrepancyDetector: 2 exceptions flagged. Notifying dealer for review.' },
            ];

            timeline.forEach(({ delay, log }, index) => {
                timers.push(setTimeout(pauseAware(() => {
                    setAgentProgress((index + 1) * 16.6);
                    setAgentLogs(prev => [...prev, log]);

                    if (index === 3) {
                        setPipelineAgents([
                            { id: 'erp', name: 'ERPConnector', status: 'done' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'ack', name: 'ACKIngest', status: 'done' },
                            { id: 'comp', name: 'POvsACK', status: 'done', detail: '2 exceptions' },
                            { id: 'discrep', name: 'DiscrepResolver', status: 'running' },
                            { id: 'bo', name: 'Backorder', status: 'pending' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]);
                    }
                }), delay));
            });

        } else if (currentStep?.id === '1.1') {
            // OPS: Receiving Verification (14s)
            timers.push(setTimeout(pauseAware(() => {
                setAgentLogs(['ReceivingAgent: Loading incoming shipment PO #ORD-2055...']);
                setPipelineAgents([
                    { id: 'receive', name: 'ReceivingAgent', status: 'running' },
                    { id: 'asn', name: 'ASNMatcher', status: 'pending' },
                    { id: 'qty', name: 'QtyVerifier', status: 'pending' },
                ]);
            }), D));

            const opsReceiveTimeline = [
                { delay: D + 4000, log: 'ReceivingAgent: Shipment PO #ORD-2055 received from Apex Furniture. 6 line items.' },
                { delay: D + 8000, log: 'ASNMatcher: Cross-referencing with supplier ASN #ASN-2055. All SKUs confirmed.' },
                { delay: D + 12000, log: 'QtyVerifier: All quantities match. No discrepancies. Ready for 3-way match.' },
            ];

            opsReceiveTimeline.forEach(({ delay, log }, index) => {
                timers.push(setTimeout(pauseAware(() => {
                    setAgentProgress((index + 1) * 33.3);
                    setAgentLogs(prev => [...prev, log]);

                    if (index === 0) {
                        setPipelineAgents([
                            { id: 'receive', name: 'ReceivingAgent', status: 'done', detail: '6 lines' },
                            { id: 'asn', name: 'ASNMatcher', status: 'running' },
                            { id: 'qty', name: 'QtyVerifier', status: 'pending' },
                        ]);
                    }
                    if (index === 2) {
                        setPipelineAgents([
                            { id: 'receive', name: 'ReceivingAgent', status: 'done', detail: '6 lines' },
                            { id: 'asn', name: 'ASNMatcher', status: 'done', detail: 'Matched' },
                            { id: 'qty', name: 'QtyVerifier', status: 'done', detail: '100%' },
                        ]);
                        setAgentProgress(100);
                        setConfidenceFields([
                            { field: 'Items Received', score: 100 },
                            { field: 'Qty Match', score: 100 },
                            { field: 'ASN Match', score: 98 },
                            { field: 'Condition', score: 96 },
                        ]);
                    }
                }), delay));
            });

            timers.push(setTimeout(pauseAware(() => nextStep()), D + 14000));

        } else if (currentStep?.id === '1.3' && isOps) {
            // OPS: 3-Way Match Engine (28s)
            timers.push(setTimeout(pauseAware(() => {
                setAgentLogs(['MatchEngine: Loading PO #ORD-2055 for 3-way verification...']);
                setPipelineAgents([
                    { id: 'po', name: 'POLoader', status: 'running' },
                    { id: 'ack', name: 'ACKMatcher', status: 'pending' },
                    { id: 'del', name: 'DeliveryMatcher', status: 'pending' },
                    { id: 'match', name: 'MatchEngine', status: 'pending' },
                    { id: 'inv', name: 'InvoiceDraft', status: 'pending' },
                ]);
            }), D));

            const opsMatchTimeline = [
                { delay: D + 5000, log: 'POLoader: PO #ORD-2055 loaded. 6 lines, $41,150 product total.' },
                { delay: D + 10000, log: 'ACKMatcher: Acknowledgement #ACK-2055 matched — 6/6 lines confirmed.' },
                { delay: D + 16000, log: 'DeliveryMatcher: Delivery #DL-004 linked. All items confirmed received.' },
                { delay: D + 22000, log: 'MatchEngine: 3-way match complete. 5 matches, 1 partial (Freight $45→$58).' },
                { delay: D + 27000, log: 'InvoiceDraft: INV-2055 auto-generated. $41,150 + $3,455 services = $44,605.' },
            ];

            opsMatchTimeline.forEach(({ delay, log }, index) => {
                timers.push(setTimeout(pauseAware(() => {
                    setAgentProgress((index + 1) * 20);
                    setAgentLogs(prev => [...prev, log]);

                    if (index === 0) {
                        setPipelineAgents([
                            { id: 'po', name: 'POLoader', status: 'done', detail: '6 lines' },
                            { id: 'ack', name: 'ACKMatcher', status: 'running' },
                            { id: 'del', name: 'DeliveryMatcher', status: 'pending' },
                            { id: 'match', name: 'MatchEngine', status: 'pending' },
                            { id: 'inv', name: 'InvoiceDraft', status: 'pending' },
                        ]);
                    }
                    if (index === 1) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'ack' ? { ...a, status: 'done' as const } :
                            a.id === 'del' ? { ...a, status: 'running' as const } : a
                        ));
                    }
                    if (index === 2) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'del' ? { ...a, status: 'done' as const } :
                            a.id === 'match' ? { ...a, status: 'running' as const } : a
                        ));
                    }
                    if (index === 3) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'match' ? { ...a, status: 'done' as const, detail: '5+1 partial' } :
                            a.id === 'inv' ? { ...a, status: 'running' as const } : a
                        ));
                    }
                    if (index === 4) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'inv' ? { ...a, status: 'done' as const, detail: '$44,605' } : a
                        ));
                        setConfidenceFields([
                            { field: 'PO Match', score: 100 },
                            { field: 'ACK Match', score: 100 },
                            { field: 'Delivery', score: 98 },
                            { field: 'Freight', score: 78 },
                        ]);
                    }
                }), delay));
            });

            timers.push(setTimeout(pauseAware(() => nextStep()), D + 28000));

        } else if (currentStep?.id === '2.2' && isOps) {
            // OPS: CO Delta Engine (22s)
            timers.push(setTimeout(pauseAware(() => {
                setAgentLogs(['COParser: Loading Change Order #CO-007...']);
                setPipelineAgents([
                    { id: 'coparser', name: 'COParser', status: 'running' },
                    { id: 'cost', name: 'CostCalc', status: 'pending' },
                    { id: 'supplier', name: 'SupplierVerify', status: 'pending' },
                    { id: 'impact', name: 'ImpactReport', status: 'pending' },
                ]);
            }), D));

            const opsCOTimeline = [
                { delay: D + 5000, log: 'COParser: CO-007 parsed. 2 affected quotes: QB-4421, QB-4424.' },
                { delay: D + 10000, log: 'CostCalc: Recalculating with updated spec (ERG-5100R → ERG-6200R). +$4,550 delta.' },
                { delay: D + 16000, log: 'SupplierVerify: Supplier confirmed availability. Lead time +3 days.' },
                { delay: D + 21000, log: 'ImpactReport: Total impact +$4,550. QB-4421 +$2,800, QB-4424 +$1,750.' },
            ];

            opsCOTimeline.forEach(({ delay, log }, index) => {
                timers.push(setTimeout(pauseAware(() => {
                    setAgentProgress((index + 1) * 25);
                    setAgentLogs(prev => [...prev, log]);

                    if (index === 0) {
                        setPipelineAgents([
                            { id: 'coparser', name: 'COParser', status: 'done', detail: '2 quotes' },
                            { id: 'cost', name: 'CostCalc', status: 'running' },
                            { id: 'supplier', name: 'SupplierVerify', status: 'pending' },
                            { id: 'impact', name: 'ImpactReport', status: 'pending' },
                        ]);
                    }
                    if (index === 1) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'cost' ? { ...a, status: 'done' as const } :
                            a.id === 'supplier' ? { ...a, status: 'running' as const } : a
                        ));
                    }
                    if (index === 3) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'supplier' ? { ...a, status: 'done' as const } :
                            a.id === 'impact' ? { ...a, status: 'done' as const, detail: '+$4,550' } : a
                        ));
                        setConfidenceFields([
                            { field: 'CO Parsed', score: 99 },
                            { field: 'Cost Delta', score: 97 },
                            { field: 'Availability', score: 92 },
                            { field: 'Lead Time', score: 88 },
                        ]);
                    }
                }), delay));
            });

            timers.push(setTimeout(pauseAware(() => nextStep()), D + 22000));

        } else if (currentStep?.id === '3.5' && isContinua) {
            // Continua 3.5: Warehouse Receiving — QC inspection pipeline (20s)
            timers.push(setTimeout(pauseAware(() => {
                setAgentLogs(['ReceivingAgent: Processing inbound shipments for Project Meridian...']);
                setPipelineAgents([
                    { id: 'scan', name: 'ScanVerify', status: 'running' },
                    { id: 'qc', name: 'QCInspect', status: 'pending' },
                    { id: 'catalog', name: 'CatalogMatch', status: 'pending' },
                    { id: 'stage', name: 'StageRouter', status: 'pending' },
                ]);
            }), D));

            const continuaWhTimeline = [
                { delay: D + 4000, log: 'ScanVerify: Scanned 1,320 items across 3 pallets. All barcodes matched.' },
                { delay: D + 8000, log: 'QCInspect: Visual + spec inspection complete. 1,318/1,320 passed.' },
                { delay: D + 13000, log: 'CatalogMatch: Items matched to PO lines. 2 damaged flagged for RMA.' },
                { delay: D + 18000, log: 'StageRouter: Routed to 8 floors per installation schedule. Ready for dispatch.' },
            ];

            continuaWhTimeline.forEach(({ delay, log }, index) => {
                timers.push(setTimeout(pauseAware(() => {
                    setAgentProgress((index + 1) * 25);
                    setAgentLogs(prev => [...prev, log]);

                    if (index === 0) {
                        setPipelineAgents([
                            { id: 'scan', name: 'ScanVerify', status: 'done', detail: '1,320 items' },
                            { id: 'qc', name: 'QCInspect', status: 'running' },
                            { id: 'catalog', name: 'CatalogMatch', status: 'pending' },
                            { id: 'stage', name: 'StageRouter', status: 'pending' },
                        ]);
                    }
                    if (index === 1) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'qc' ? { ...a, status: 'done' as const, detail: '99.8%' } :
                            a.id === 'catalog' ? { ...a, status: 'running' as const } : a
                        ));
                    }
                    if (index === 3) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'catalog' ? { ...a, status: 'done' as const, detail: '2 RMA' } :
                            a.id === 'stage' ? { ...a, status: 'done' as const, detail: '8 floors' } : a
                        ));
                        setAgentProgress(100);
                        setConfidenceFields([
                            { field: 'Barcode Match', score: 100 },
                            { field: 'QC Pass Rate', score: 99 },
                            { field: 'PO Match', score: 98 },
                            { field: 'Staging', score: 100 },
                        ]);
                    }
                }), delay));
            });

            timers.push(setTimeout(pauseAware(() => nextStep()), D + 20000));

        } else if (currentStep?.id === '2.4') {
            // OPS: Invoice Reconciliation (18s)
            timers.push(setTimeout(pauseAware(() => {
                setAgentLogs(['InvoiceDelta: Reconciling INV-2055 against PO #ORD-2055...']);
                setPipelineAgents([
                    { id: 'invdelta', name: 'InvoiceDelta', status: 'running' },
                    { id: 'qb', name: 'QuickBooksAgent', status: 'pending' },
                    { id: 'log', name: 'DailyLogAgent', status: 'pending' },
                ]);
            }), D));

            const opsInvTimeline = [
                { delay: D + 5000, log: 'InvoiceDelta: INV-2055 vs PO #ORD-2055 — $44,605 match confirmed.' },
                { delay: D + 10000, log: 'QuickBooksAgent: Pushing to QuickBooks. Voucher VCH-2055 created.' },
                { delay: D + 16000, log: 'DailyLogAgent: DL-004 updated. Receiving → Invoice link established.' },
            ];

            opsInvTimeline.forEach(({ delay, log }, index) => {
                timers.push(setTimeout(pauseAware(() => {
                    setAgentProgress((index + 1) * 33.3);
                    setAgentLogs(prev => [...prev, log]);

                    if (index === 0) {
                        setPipelineAgents([
                            { id: 'invdelta', name: 'InvoiceDelta', status: 'done', detail: 'Matched' },
                            { id: 'qb', name: 'QuickBooksAgent', status: 'running' },
                            { id: 'log', name: 'DailyLogAgent', status: 'pending' },
                        ]);
                    }
                    if (index === 1) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'qb' ? { ...a, status: 'done' as const, detail: 'VCH-2055' } :
                            a.id === 'log' ? { ...a, status: 'running' as const } : a
                        ));
                    }
                    if (index === 2) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'log' ? { ...a, status: 'done' as const, detail: 'DL-004' } : a
                        ));
                        setAgentProgress(100);
                        setConfidenceFields([
                            { field: 'Invoice Match', score: 100 },
                            { field: 'QB Sync', score: 99 },
                            { field: 'Daily Log', score: 100 },
                            { field: 'Reconciled', score: 98 },
                        ]);
                    }
                }), delay));
            });

            timers.push(setTimeout(pauseAware(() => nextStep()), D + 18000));
        }

        return () => timers.forEach(clearTimeout);
    }, [isDemoActive, currentStep?.id, nextStep, pauseAware, isOps, isContinua, lupaStep]);


    // Don't render at all if not in a panel step
    const panelSteps = isOps ? OPS_PANEL_STEPS_IDS : isContinua ? CONTINUA_PANEL_STEPS : COI_PANEL_STEPS;
    if (!isDemoActive || !panelSteps.includes(currentStep?.id)) return null;
    // Don't render until the reveal delay has passed — audience sees normal page first
    if (!panelVisible) return null;

    // ─── Step-specific config ───
    const stepConfig: Record<string, {
        icon: React.ReactNode;
        title: string;
        titleDone: string;
        accentColor: 'green' | 'amber' | 'blue' | 'purple' | 'red';
        progressColor: string;
    }> = {
        'continua-3.2': {
            icon: <Cpu className="text-indigo-600 dark:text-indigo-400" size={18} />,
            title: 'PO Package Generation',
            titleDone: 'Procurement Complete',
            accentColor: 'blue',
            progressColor: 'bg-indigo-500',
        },
        'continua-1.3': {
            icon: <Sparkles className="text-amber-600 dark:text-amber-400 animate-pulse" size={18} />,
            title: 'UAL HQ — Price Verification Engine',
            titleDone: 'Prices Verified — $110K Savings',
            accentColor: 'amber',
            progressColor: 'bg-amber-500',
        },
        'continua-3.5': {
            icon: <Cpu className="text-teal-600 dark:text-teal-400" size={18} />,
            title: 'Warehouse Receiving Agent',
            titleDone: 'Receiving Complete',
            accentColor: 'green',
            progressColor: 'bg-teal-500',
        },
        '1.2': {
            icon: <Sparkles className="text-success dark:text-success animate-pulse" size={18} />,
            title: 'Extraction Complete',
            titleDone: 'Extraction Complete',
            accentColor: 'green',
            progressColor: 'bg-success',
        },
        '1.3': {
            icon: <Sparkles className="text-green-600 dark:text-green-400" size={18} />,
            title: 'Normalization Pipeline',
            titleDone: 'Normalization Complete',
            accentColor: 'green',
            progressColor: 'bg-green-500',
        },
        '1.4': {
            icon: <Sparkles className="text-amber-600 dark:text-amber-400 animate-pulse" size={18} />,
            title: 'QuoteBuilder Agent',
            titleDone: 'Quote Draft Ready',
            accentColor: 'amber',
            progressColor: 'bg-amber-500',
        },
        '2.2': {
            icon: <Cpu className="text-blue-600 dark:text-blue-400" size={18} />,
            title: 'ERP Normalization',
            titleDone: 'Normalization Complete',
            accentColor: 'blue',
            progressColor: 'bg-blue-500',
        },
        '2.3': {
            icon: <Cpu className="text-red-600 dark:text-red-400" size={18} />,
            title: 'Delta Engine Processing',
            titleDone: 'Comparison Complete — 2 Exceptions',
            accentColor: 'red',
            progressColor: 'bg-red-500',
        },
        // OPS profile entries
        'ops-1.1': {
            icon: <CheckCircle2 className="text-blue-600 dark:text-blue-400" size={18} />,
            title: 'Receiving Verification',
            titleDone: 'Shipment Verified',
            accentColor: 'blue',
            progressColor: 'bg-blue-500',
        },
        'ops-1.3': {
            icon: <Sparkles className="text-teal-600 dark:text-teal-400 animate-pulse" size={18} />,
            title: 'Three-Way Match Engine',
            titleDone: 'Match Complete — Invoice Ready',
            accentColor: 'blue',
            progressColor: 'bg-teal-500',
        },
        'ops-2.2': {
            icon: <Cpu className="text-ai dark:text-purple-400" size={18} />,
            title: 'CO Delta Engine',
            titleDone: 'Change Order Processed',
            accentColor: 'purple',
            progressColor: 'bg-ai',
        },
        'ops-2.4': {
            icon: <CheckCircle2 className="text-green-600 dark:text-green-400" size={18} />,
            title: 'Invoice Reconciliation',
            titleDone: 'Invoice Reconciled',
            accentColor: 'green',
            progressColor: 'bg-green-500',
        },
    };

    const configKey = isContinua && ['1.3', '3.2', '3.5'].includes(currentStep?.id)
        ? `continua-${currentStep?.id}`
        : isOps && ['1.1', '1.3', '2.2', '2.4'].includes(currentStep?.id)
        ? `ops-${currentStep?.id}`
        : currentStep?.id;
    const config = stepConfig[configKey];
    const isDone = agentProgress >= 99;

    return (
        <div className="fixed inset-0 z-[101] flex items-center justify-end pointer-events-none">
            {/* Backdrop — fades in */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-auto animate-in fade-in duration-500" />

            {/* Floating Panel — Lupa zoom-in effect (no slide — feels like zoom, not modal) */}
            <div className="relative w-full max-w-2xl mx-4 mr-8 bg-card border border-indigo-500/30 ring-2 ring-indigo-500/50 rounded-2xl shadow-2xl shadow-indigo-500/15 pointer-events-auto animate-in zoom-in-95 fade-in duration-1000 overflow-hidden max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-micro" style={{ transformOrigin: 'center center' }}>
                {/* Top glow bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${isDone ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500'}`} />

                {/* Lupa badge */}
                <div className="absolute top-3 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100/80 dark:bg-zinc-800/80 border border-gray-200/50 dark:border-zinc-700/50 backdrop-blur-sm">
                    <SearchIcon size={12} className="text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Detail View</span>
                </div>

                {/* Header */}
                <div className="flex items-center gap-3 px-6 pt-5 pb-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-card border border-gray-200 dark:border-zinc-700 flex items-center justify-center">
                            {config.icon}
                        </div>
                        {!isDone && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
                        )}
                        {isDone && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">
                            {isDone ? config.titleDone : config.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                            Step {currentStep?.id} — {currentStep?.title}
                        </p>
                    </div>
                </div>

                {/* Source Badge */}
                {currentStep?.id === '2.2' && !isOps && (
                    <div className="px-6 pb-2">
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[8px] font-bold text-success dark:text-success uppercase tracking-wider">External Systems · Synced</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ai/10 border border-purple-500/20 text-[10px] font-bold text-ai dark:text-purple-400">
                                <Cpu size={10} />
                                eManage ONE → PO Original
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                <FileText size={10} />
                                MillerKnoll → EDI/855 ACK
                            </span>
                        </div>
                    </div>
                )}
                {currentStep?.id === '1.3' && isOps && (
                    <div className="px-6 pb-2 flex gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] font-bold text-teal-600 dark:text-teal-400">
                            <CheckCircle2 size={10} />
                            PO · ACK · Invoice
                        </span>
                    </div>
                )}
                {/* Source badges for Flow 1 extraction steps (COI) */}
                {['1.2', '1.3', '1.4'].includes(currentStep?.id) && !isOps && !isContinua && (
                    <div className="px-6 pb-2">
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[8px] font-bold text-success dark:text-success uppercase tracking-wider">External Systems · Synced</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                <FileText size={10} />
                                MillerKnoll → Vendor Email (PDF + CSV)
                            </span>
                            {currentStep?.id !== '1.2' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ai/10 border border-purple-500/20 text-[10px] font-bold text-ai dark:text-purple-400">
                                    <Cpu size={10} />
                                    MillerKnoll Product Catalog (API)
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Pipeline Strip */}
                {pipelineAgents.length > 0 && (
                    <div className="px-6 pb-3">
                        <AgentPipelineStrip agents={pipelineAgents} accentColor={config.accentColor} />
                    </div>
                )}

                {/* Progress Bar */}
                <div className="px-6 pb-4">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                            {isDone ? 'All agents completed' : 'Processing...'}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">{Math.min(Math.round(agentProgress), 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${isDone ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : config.progressColor}`}
                            style={{ width: `${Math.min(agentProgress, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Agent Logs */}
                {agentLogs.length > 0 && (
                    <div className="px-6 pb-4">
                        <div className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 max-h-[200px] overflow-y-auto scrollbar-micro">
                            <div className="space-y-2">
                                {agentLogs.map((log, i) => (
                                    <div key={i} className="flex items-start gap-2 animate-in slide-in-from-left-4 fade-in duration-300">
                                        <span className="text-muted-foreground font-mono text-[11px] mt-0.5 select-none">{'>'}</span>
                                        <span className={`text-[12px] font-mono ${i === agentLogs.length - 1 && !isDone ? 'text-zinc-800 dark:text-zinc-200 animate-pulse' : 'text-muted-foreground dark:text-muted-foreground'}`}>
                                            {log}
                                        </span>
                                    </div>
                                ))}
                                {!isDone && (
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="text-muted-foreground font-mono text-[11px]">{'>'}</span>
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Step-specific completion content ─── */}

                {/* Step 3.2 Continua: Simplified procurement phases + summary verde */}
                {currentStep?.id === '3.2' && isContinua && (
                    <div className="px-6 pb-5 space-y-4">
                        {/* Simplified procurement phases */}
                        {procPhases.some(p => p.visible) && !summaryVisible && (
                            <div className="space-y-1.5">
                                {procPhases.map((phase, i) => (
                                    <div key={i} className={`flex items-center gap-2 text-[11px] transition-all duration-300 ${phase.visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                                        {phase.done ? (
                                            <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                                        ) : phase.visible ? (
                                            <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0" />
                                        ) : null}
                                        <span className={`font-medium ${phase.done ? 'text-zinc-800 dark:text-zinc-200' : 'text-indigo-600 dark:text-indigo-400'}`}>{phase.name}</span>
                                        <span className="text-muted-foreground dark:text-muted-foreground flex-1">{phase.detail}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Summary verde */}
                        {summaryVisible && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="rounded-xl p-4 bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                                    <p className="text-xs text-green-800 dark:text-green-200">
                                        <span className="font-bold">ProcurementAgent:</span> PO package generated — 3 consolidated POs, $3.2M, 12 manufacturers. Expert decision applied.
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                                        {['MillerKnoll Portal', 'DIRTT Configurator', 'AV Partners API', 'Contract Pricing DB'].map(sys => (
                                            <span key={sys} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-300 text-[9px] font-medium border border-green-200/50 dark:border-green-500/20">
                                                <CheckCircle2 size={10} />{sys}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 1.2 COI: Extraction Summary */}
                {currentStep?.id === '1.2' && !isContinua && (
                    <div className="px-6 pb-5 space-y-4">
                        {/* PDF ↔ SIF Side-by-Side */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Left: PDF Mockup */}
                            <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-card overflow-hidden">
                                <div className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 flex items-center gap-2">
                                    <FileText size={12} className="text-red-500" />
                                    <span className="text-[10px] font-bold text-muted-foreground">Apex_RFQ_2025.pdf</span>
                                </div>
                                <div className="p-3 space-y-2 text-[10px] font-mono text-muted-foreground">
                                    <div className="bg-amber-100/50 dark:bg-amber-500/10 border-l-2 border-amber-400 px-2 py-1 rounded-r">
                                        <span className="text-zinc-800 dark:text-zinc-200">Qty: 200 | Executive Task Chairs</span>
                                    </div>
                                    <div className="px-2 py-1 opacity-40">APEX CONSTRUCTION INC.</div>
                                    <div className="bg-amber-100/50 dark:bg-amber-500/10 border-l-2 border-amber-400 px-2 py-1 rounded-r">
                                        <span className="text-zinc-800 dark:text-zinc-200">Model: CC-AZ-2024 (Azure)</span>
                                    </div>
                                    <div className="px-2 py-1 opacity-40">Ship-To: Austin, TX 78701</div>
                                    <div className="bg-amber-100/50 dark:bg-amber-500/10 border-l-2 border-amber-400 px-2 py-1 rounded-r">
                                        <span className="text-zinc-800 dark:text-zinc-200">Delivery: 4 zones (A-D)</span>
                                    </div>
                                    <div className="px-2 py-1 opacity-40">Terms: Net 30</div>
                                    <div className="bg-amber-100/50 dark:bg-amber-500/10 border-l-2 border-amber-400 px-2 py-1 rounded-r">
                                        <span className="text-zinc-800 dark:text-zinc-200">Ergonomic: Lumbar, Adj. Arms</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: SIF Normalized */}
                            <div className="rounded-xl border border-emerald-300/30 dark:border-emerald-700/30 bg-emerald-50/30 dark:bg-emerald-900/5 overflow-hidden">
                                <div className="px-3 py-1.5 bg-emerald-100/50 dark:bg-emerald-900/20 border-b border-emerald-200/50 dark:border-emerald-700/30 flex items-center gap-2">
                                    <Sparkles size={12} className="text-success" />
                                    <span className="text-[10px] font-bold text-success dark:text-success dark:text-success">SIF — Normalized</span>
                                </div>
                                <div className="p-3 space-y-1.5">
                                    {[
                                        { field: 'product.qty', value: '200' },
                                        { field: 'product.name', value: 'Executive Task Chair' },
                                        { field: 'product.sku', value: 'CC-AZ-2024' },
                                        { field: 'delivery.zones', value: '4 (A, B, C, D)' },
                                        { field: 'delivery.address', value: 'Austin, TX 78701' },
                                        { field: 'specs.ergonomic', value: 'Lumbar + Adj. Arms' },
                                    ].map(f => (
                                        <div key={f.field} className="flex items-center gap-2 text-[10px] font-mono">
                                            <span className="text-success/60 dark:text-success/50 w-[105px] shrink-0 truncate">{f.field}</span>
                                            <span className="text-zinc-800 dark:text-zinc-200 font-medium">{f.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Extracted Data Table */}
                        <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="text-muted-foreground" size={14} />
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Extracted Data</span>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { label: 'Products', value: '200 Executive Task Chairs', badge: '200 items' },
                                    { label: 'Specs', value: 'Ergonomic features from PDF', badge: 'Parsed' },
                                    { label: 'Ship-To', value: '4 delivery zones mapped', badge: '4 zones' },
                                    { label: 'Freight', value: 'Multi-zone routing required', badge: 'Needs Review' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between bg-gray-100/60 dark:bg-zinc-800/60 rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-[11px] font-bold text-muted-foreground dark:text-muted-foreground w-16 shrink-0">{item.label}</span>
                                            <span className="text-[12px] text-muted-foreground dark:text-zinc-300 truncate">{item.value}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                                            item.badge === 'Needs Review'
                                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                                : 'bg-gray-200 dark:bg-zinc-700 text-muted-foreground'
                                        }`}>{item.badge}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Field Confidence Grid */}
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {confidenceFields.map(f => (
                                    <div key={f.field} className="flex items-center justify-between bg-card rounded-lg px-3 py-1.5">
                                        <span className="text-[11px] text-muted-foreground">{f.field}</span>
                                        <ConfidenceScoreBadge score={f.score} size="sm" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Automation Flow Diagram */}
                        <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="text-indigo-600 dark:text-indigo-400 animate-pulse" size={14} />
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Automation Flow</span>
                            </div>
                            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-micro">
                                {[
                                    { icon: '📧', label: 'Email RFQ', sub: 'Detected', color: 'border-blue-500/30 bg-blue-500/5' },
                                    { icon: '📄', label: 'OCR Extract', sub: '2 files', color: 'border-purple-500/30 bg-ai/5' },
                                    { icon: '🔍', label: 'Data Parse', sub: '200 items', color: 'border-indigo-500/30 bg-indigo-500/5' },
                                    { icon: '🔗', label: 'Normalize', sub: 'Mapped', color: 'border-cyan-500/30 bg-cyan-500/5' },
                                    { icon: '⚡', label: 'Validate', sub: '82%', color: 'border-amber-500/30 bg-amber-500/5' },
                                ].map((step, i, arr) => (
                                    <React.Fragment key={i}>
                                        <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border ${step.color} min-w-[72px] shrink-0`}>
                                            <span className="text-base">{step.icon}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground dark:text-zinc-300 text-center leading-tight">{step.label}</span>
                                            <span className="text-[9px] text-muted-foreground dark:text-muted-foreground">{step.sub}</span>
                                        </div>
                                        {i < arr.length - 1 && (
                                            <div className="flex items-center shrink-0 px-0.5">
                                                <div className="w-4 h-px bg-zinc-300 dark:bg-zinc-600" />
                                                <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[4px] border-l-zinc-300 dark:border-l-zinc-600" />
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* AI Attribution */}
                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
                            <Sparkles size={12} className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0 animate-pulse" />
                            <p className="text-[11px] text-indigo-600/80 dark:text-indigo-300/80 leading-relaxed">
                                5 AI agents processed this RFQ in 8.2s. Freight routing flagged for Expert review due to multi-zone complexity.
                            </p>
                        </div>

                        {/* Auto-advance indicator */}
                        <div className="flex items-center justify-center gap-2 text-[11px] text-indigo-600 dark:text-indigo-400 animate-pulse">
                            <span>Auto-advancing to normalization...</span>
                            <ArrowUpRight size={14} />
                        </div>
                    </div>
                )}

                {/* Step 1.3: Confidence + Continue */}
                {currentStep?.id === '1.3' && isDone && (
                    <div className="px-6 pb-5 space-y-4 animate-in fade-in duration-300">
                        {/* Field Confidence Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            {confidenceFields.map(f => (
                                <div key={f.field} className="flex items-center justify-between bg-card rounded-lg px-3 py-2">
                                    <span className="text-[12px] text-muted-foreground">{f.field}</span>
                                    <ConfidenceScoreBadge score={f.score} size="sm" />
                                </div>
                            ))}
                        </div>

                        {/* Handoff Indicator */}
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-card border border-gray-200/50 dark:border-zinc-700/50">
                            <div className="flex items-center -space-x-1.5">
                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                                    <Bot size={12} className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                                    <Users size={12} className="text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                            <span className="text-[11px] text-muted-foreground">AI Agent + Expert will draft the quote</span>
                        </div>

                        <button
                            onClick={nextStep}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm hover:opacity-90"
                        >
                            Continue to Quote Draft
                            <ArrowUpRight size={14} />
                        </button>
                    </div>
                )}

                {/* Step 1.4: Branching Result + Route to Expert */}
                {currentStep?.id === '1.4' && isDone && (
                    <div className="px-6 pb-5 space-y-4 animate-in fade-in duration-300">
                        {/* Branching Result */}
                        <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-card p-4">
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Needs Attention</span>
                            </div>
                            <p className="text-[12px] text-muted-foreground">Multi-zone freight routing requires manual approval</p>
                        </div>

                        {/* Handoff */}
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-card border border-gray-200/50 dark:border-zinc-700/50">
                            <div className="flex items-center -space-x-1.5">
                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                                    <Bot size={12} className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                                    <Users size={12} className="text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                            <span className="text-[11px] text-muted-foreground">Expert + AI Agent will resolve discrepancies</span>
                        </div>

                        <button
                            onClick={nextStep}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm hover:opacity-90"
                        >
                            Route to Expert Hub (HITL)
                            <ArrowUpRight size={14} />
                        </button>
                    </div>
                )}

                {/* Step 2.2: Schema Mapping + Run Delta */}
                {(currentStep?.id === '2.2' || currentStep?.id === '3.2') && isDone && (
                    <div className="px-6 pb-5 space-y-4 animate-in fade-in duration-300">
                        {/* Entity Link */}
                        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-card border border-gray-200 dark:border-zinc-700">
                            <span className="text-muted-foreground dark:text-muted-foreground">Entity Link:</span>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">PO #ORD-2055 ↔ Acknowledgement #ACK-2055</span>
                        </div>

                        {/* Schema Mapping Table */}
                        <div className="rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
                            <div className="px-4 py-2 bg-card border-b border-gray-200 dark:border-zinc-700">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Schema Mapping (Raw → Normalized)</span>
                            </div>
                            <table className="w-full text-[12px]">
                                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                    {[
                                        { raw: 'PO1*VP*ERG-5100', normalized: 'product_sku: ERG-5100' },
                                        { raw: 'PO1*25*EA', normalized: 'quantity: 25' },
                                        { raw: 'PO1*89.00', normalized: 'unit_price: $89.00' },
                                        { raw: 'PO1*FRT-0001*150', normalized: 'freight_charge: $150.00' },
                                    ].map((row, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-2 font-mono text-muted-foreground dark:text-muted-foreground">{row.raw}</td>
                                            <td className="px-2 text-muted-foreground">→</td>
                                            <td className="px-4 py-2 font-mono text-blue-600 dark:text-blue-400">{row.normalized}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Confidence + AI */}
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-card border border-gray-200 dark:border-zinc-700">
                            <div className="flex items-center gap-1.5">
                                <Sparkles size={12} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">DataNormalizationAgent unified 4 raw fields to standard schema</span>
                            </div>
                            <ConfidenceScoreBadge score={94} label="Norm" />
                        </div>

                        <button
                            onClick={nextStep}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm hover:opacity-90"
                        >
                            Run Delta Engine
                            <ArrowUpRight size={14} />
                        </button>
                    </div>
                )}

                {/* Step 2.3: Comparison Table + Escalate */}
                {(currentStep?.id === '2.3' || currentStep?.id === '3.3') && isDone && (
                    <div className="px-6 pb-5 space-y-4 animate-in fade-in duration-300">
                        {/* Line-by-Line Comparison Table */}
                        <div className="rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
                            <div className="px-4 py-2 bg-card border-b border-gray-200 dark:border-zinc-700">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Line-by-Line Comparison</span>
                            </div>
                            <table className="w-full text-[12px]">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-zinc-800">
                                        <th className="text-left px-4 py-1.5 text-muted-foreground dark:text-muted-foreground font-medium">Line</th>
                                        <th className="text-left px-4 py-1.5 text-muted-foreground dark:text-muted-foreground font-medium">Item</th>
                                        <th className="text-left px-4 py-1.5 text-muted-foreground dark:text-muted-foreground font-medium">PO</th>
                                        <th className="text-left px-4 py-1.5 text-muted-foreground dark:text-muted-foreground font-medium">Acknowledgement</th>
                                        <th className="text-left px-4 py-1.5 text-muted-foreground dark:text-muted-foreground font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                    <tr>
                                        <td className="px-4 py-2 text-muted-foreground">1</td>
                                        <td className="px-4 py-2 text-muted-foreground dark:text-zinc-300">Task Chair</td>
                                        <td className="px-4 py-2 font-mono text-muted-foreground">ERG-5100</td>
                                        <td className="px-4 py-2 font-mono text-muted-foreground">ERG-5100</td>
                                        <td className="px-4 py-2"><span className="flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle2 size={12} /> Match</span></td>
                                    </tr>
                                    <tr className="bg-amber-500/5">
                                        <td className="px-4 py-2 text-muted-foreground">2</td>
                                        <td className="px-4 py-2 text-amber-700 dark:text-amber-300 font-medium">Desk</td>
                                        <td className="px-4 py-2 font-mono text-muted-foreground">DSK-B</td>
                                        <td className="px-4 py-2 font-mono text-amber-600 dark:text-amber-400">DSK-C</td>
                                        <td className="px-4 py-2"><span className="text-amber-600 dark:text-amber-400 font-medium">Substitution</span></td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 text-muted-foreground">3</td>
                                        <td className="px-4 py-2 text-muted-foreground dark:text-zinc-300">Armrest</td>
                                        <td className="px-4 py-2 font-mono text-muted-foreground">ARM-4D10</td>
                                        <td className="px-4 py-2 font-mono text-muted-foreground">ARM-4D10</td>
                                        <td className="px-4 py-2"><span className="flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle2 size={12} /> Match</span></td>
                                    </tr>
                                    <tr className="bg-red-500/5">
                                        <td className="px-4 py-2 text-muted-foreground">4</td>
                                        <td className="px-4 py-2 text-red-700 dark:text-red-300 font-medium">Freight</td>
                                        <td className="px-4 py-2 font-mono text-muted-foreground">$45</td>
                                        <td className="px-4 py-2 font-mono text-red-600 dark:text-red-400">$150</td>
                                        <td className="px-4 py-2"><span className="text-red-600 dark:text-red-400 font-medium">+233%</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Delta Summary */}
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-card border border-gray-200 dark:border-zinc-700">
                            <span className="text-[11px] text-muted-foreground">4 lines compared: <span className="text-green-600 dark:text-green-400 font-medium">2 matches</span>, <span className="text-red-600 dark:text-red-400 font-medium">2 exceptions</span></span>
                            <ConfidenceScoreBadge score={50} label="Match Rate" />
                        </div>

                        {/* AI Recommendation */}
                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <Sparkles size={12} className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0 animate-pulse" />
                            <span className="text-[11px] text-indigo-600 dark:text-indigo-400">Substitution within catalog equivalents. Freight exceeds $50 guardrail — escalating to Expert Hub.</span>
                        </div>

                        <button
                            onClick={() => {
                                nextStep();
                                onNavigate?.('ack-detail');
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm hover:opacity-90"
                        >
                            Escalate 2 Exceptions to Expert Hub
                            <ArrowUpRight size={14} />
                        </button>
                    </div>
                )}

                {/* OPS Step 1.1: Receiving Summary */}
                {currentStep?.id === '1.1' && isOps && (
                    <div className="px-6 pb-5 space-y-4">
                        {!isDone && (
                            <div className="flex items-center justify-center gap-2 text-[11px] text-indigo-600 dark:text-indigo-400 animate-pulse">
                                <span>Verifying shipment against ASN...</span>
                                <ArrowUpRight size={14} />
                            </div>
                        )}
                        {isDone && confidenceFields.length > 0 && (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    {confidenceFields.map(f => (
                                        <div key={f.field} className="flex items-center justify-between bg-card rounded-lg px-3 py-2">
                                            <span className="text-[12px] text-muted-foreground">{f.field}</span>
                                            <ConfidenceScoreBadge score={f.score} size="sm" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
                                    <Sparkles size={12} className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0 animate-pulse" />
                                    <p className="text-[11px] text-indigo-600/80 dark:text-indigo-300/80 leading-relaxed">
                                        3 agents verified shipment in real-time. All 6 line items confirmed against ASN #ASN-2055.
                                    </p>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-[11px] text-indigo-600 dark:text-indigo-400 animate-pulse">
                                    <span>Auto-advancing to 3-Way Match...</span>
                                    <ArrowUpRight size={14} />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* OPS Step 1.3: 3-Way Match Summary */}
                {currentStep?.id === '1.3' && isOps && isDone && (
                    <div className="px-6 pb-5 space-y-4 animate-in fade-in duration-300">
                        <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-card p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-success" />
                                <span className="text-[11px] font-medium text-success dark:text-success uppercase tracking-wider">3-Way Match Complete</span>
                            </div>
                            <div className="space-y-1.5 text-[12px]">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">PO #ORD-2055</span>
                                    <span className="text-muted-foreground font-medium">$41,150 · 6 lines</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">INV-2055 (auto-generated)</span>
                                    <span className="text-success dark:text-success font-medium">$44,605 ready</span>
                                </div>
                            </div>
                        </div>
                        {confidenceFields.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                                {confidenceFields.map(f => (
                                    <div key={f.field} className="flex items-center justify-between bg-card rounded-lg px-3 py-2">
                                        <span className="text-[12px] text-muted-foreground">{f.field}</span>
                                        <ConfidenceScoreBadge score={f.score} size="sm" />
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-2 text-[11px] text-indigo-600 dark:text-indigo-400 animate-pulse">
                            <span>Auto-advancing to invoice review...</span>
                            <ArrowUpRight size={14} />
                        </div>
                    </div>
                )}

                {/* OPS Step 2.2: CO Delta Summary */}
                {currentStep?.id === '2.2' && isOps && isDone && (
                    <div className="px-6 pb-5 space-y-4 animate-in fade-in duration-300">
                        <div className="rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
                            <div className="px-4 py-2 bg-card border-b border-gray-200 dark:border-zinc-700">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Change Order Impact — CO-007</span>
                            </div>
                            <table className="w-full text-[12px]">
                                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                    {[
                                        { quote: 'QB-4421', item: 'ERG-5100R → ERG-6200R', delta: '+$2,800' },
                                        { quote: 'QB-4424', item: 'ERG-5100R → ERG-6200R', delta: '+$1,750' },
                                    ].map((row, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-2 font-mono text-ai dark:text-purple-400">{row.quote}</td>
                                            <td className="px-4 py-2 text-muted-foreground">{row.item}</td>
                                            <td className="px-4 py-2 font-medium text-amber-600 dark:text-amber-400">{row.delta}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {confidenceFields.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                                {confidenceFields.map(f => (
                                    <div key={f.field} className="flex items-center justify-between bg-card rounded-lg px-3 py-2">
                                        <span className="text-[12px] text-muted-foreground">{f.field}</span>
                                        <ConfidenceScoreBadge score={f.score} size="sm" />
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-2 text-[11px] text-indigo-600 dark:text-indigo-400 animate-pulse">
                            <span>Auto-advancing to quote update...</span>
                            <ArrowUpRight size={14} />
                        </div>
                    </div>
                )}

                {/* OPS Step 2.4: Invoice Reconciliation Summary */}
                {(currentStep?.id === '2.4' || currentStep?.id === '3.4') && isDone && (
                    <div className="px-6 pb-5 space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-card border border-gray-200 dark:border-zinc-700">
                            <span className="text-muted-foreground dark:text-muted-foreground">Final Invoice:</span>
                            <span className="text-success dark:text-success font-medium">INV-2055 · $44,605 · Reconciled ✓</span>
                        </div>
                        {confidenceFields.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                                {confidenceFields.map(f => (
                                    <div key={f.field} className="flex items-center justify-between bg-card rounded-lg px-3 py-2">
                                        <span className="text-[12px] text-muted-foreground">{f.field}</span>
                                        <ConfidenceScoreBadge score={f.score} size="sm" />
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
                            <Sparkles size={12} className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0 animate-pulse" />
                            <p className="text-[11px] text-indigo-600/80 dark:text-indigo-300/80 leading-relaxed">
                                3 agents reconciled invoice, synced to QuickBooks, and updated the daily log in 18s.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-[11px] text-indigo-600 dark:text-indigo-400 animate-pulse">
                            <span>Auto-advancing to Flow 3...</span>
                            <ArrowUpRight size={14} />
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground dark:text-muted-foreground">
                        <Cpu size={14} />
                        <span>Strata Intelligence Engine v2.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
