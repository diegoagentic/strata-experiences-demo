// ═══════════════════════════════════════════════════════════════════════════════
// WR — Mismatch Detection
// Step: w1.2 (Mismatch Detection — Flow 1)
//
// w1.2: Line-by-line Spec vs Selection comparison — hero mismatch table
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDemo } from '../../context/DemoContext';
import { AIAgentAvatar } from './DemoAvatars';
import {
    CheckCircleIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    ClipboardDocumentCheckIcon,
    PaperAirplaneIcon,
    EyeIcon,
    ArrowRightIcon,
    PencilSquareIcon,
    ArrowUpTrayIcon,
    SparklesIcon,
    XMarkIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import { WRG_STEP_TIMING, type WrgStepTiming } from '../../config/profiles/wrg-demo';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AgentVis { name: string; detail: string; visible: boolean; done: boolean }

type PipelinePhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed';

// ─── Agent Pipelines ─────────────────────────────────────────────────────────

const MISMATCH_AGENTS: AgentVis[] = [
    { name: 'SpecParser', detail: 'Extracting Spec Sheet — 24 line items', visible: false, done: false },
    { name: 'SelectionParser', detail: 'Extracting Selection Sheet — 24 line items', visible: false, done: false },
    { name: 'ComparisonEngine', detail: '23/24 match, 1 qty discrepancy', visible: false, done: false },
    { name: 'CatalogVerifier', detail: '2 catalog flags: custom + discontinued', visible: false, done: false },
];

// ─── Mismatch Comparison Data ────────────────────────────────────────────────

const COMPARISON_ITEMS = [
    { id: 1,  product: 'Healthcare Guest Chair - Small',  mfr: 'Nemschoff', specQty: 12, selQty: 12, match: true },
    { id: 2,  product: 'KD SOI Amplify Task Chair',       mfr: 'Herman Miller', specQty: 119, selQty: 119, match: true },
    { id: 3,  product: 'Plastic Stacking Chair',           mfr: 'Herman Miller', specQty: 19, selQty: 20, match: false },
    { id: 4,  product: 'Healthcare Lounge Chair',          mfr: 'Nemschoff', specQty: 8, selQty: 8, match: true },
    { id: 5,  product: 'OFS Coact Serpentine Lounge',      mfr: 'OFS', specQty: 2, selQty: 2, match: true, flag: 'CUSTOM CONFIG', flagDetail: '12-week lead' },
    { id: 6,  product: 'Nemschoff NC-2240 Recliner',       mfr: 'Nemschoff', specQty: 6, selQty: 6, match: true, flag: 'DISCONTINUED', flagDetail: '→ NC-2250 (+$85)' },
    { id: 7,  product: 'Glassboard 36x48',                 mfr: 'Clarus', specQty: 18, selQty: 18, match: true },
    { id: 8,  product: '24x72 Training Table',             mfr: 'Herman Miller', specQty: 14, selQty: 14, match: true },
];

// ─── Flagged Items (inline resolution in comparison table) ───────────────────

const FLAGGED_ITEMS: Record<number, { type: string; detail: string; aiSuggestion: string }> = {
    3: { type: 'QTY MISMATCH', detail: 'Spec: 19, Selection: 20', aiSuggestion: 'Use selection value: 20 units — matches site plan room count' },
    5: { type: 'CUSTOM CONFIG', detail: '12-week lead time', aiSuggestion: 'Accept 12-week lead time — add note to client timeline' },
    6: { type: 'DISCONTINUED', detail: '→ NC-2250 (+$85/unit)', aiSuggestion: 'Replace with NC-2250 — same form factor, updated mechanism (+$85/unit)' },
};
const FLAGGED_COUNT = Object.keys(FLAGGED_ITEMS).length;

// ─── Color Styles (DS pattern) ──────────────────────────────────────────────

const colorStyles: Record<string, string> = {
    green: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/30',
};

// ═════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT: WrgHandoff (step w1.2)
// ═════════════════════════════════════════════════════════════════════════════

export default function WrgHandoff({ onNavigate }: { onNavigate?: (page: string) => void }) {
    const { currentStep, nextStep, isPaused } = useDemo();
    const stepId = currentStep.id;

    // pauseAware
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

    // runChain: builds a sorted event list and chains them one by one so that
    // pause correctly halts the entire sequence, not just the current callback.
    const runChain = useCallback((
        events: Array<[number, () => void]>,
        timers: ReturnType<typeof setTimeout>[]
    ) => {
        const sorted = [...events].sort((a, b) => a[0] - b[0]);
        const step = (i: number) => {
            if (i >= sorted.length) return;
            const prevTime = i === 0 ? 0 : sorted[i - 1][0];
            const delay = Math.max(1, sorted[i][0] - prevTime);
            timers.push(setTimeout(pauseAware(() => { sorted[i][1](); step(i + 1); }), delay));
        };
        step(0);
    }, [pauseAware]);

    const tp = (id: string): WrgStepTiming => WRG_STEP_TIMING[id] || WRG_STEP_TIMING['w1.2'];

    // ── Phase state ──────────────────────────────────────────────────────────
    const [phase, setPhase] = useState<PipelinePhase>('idle');
    const [agents, setAgents] = useState<AgentVis[]>([]);
    const [progress, setProgress] = useState(0);
    const [rowsRevealed, setRowsRevealed] = useState(0);
    const [actionToast, setActionToast] = useState<string | null>(null);
    // w1.2: resolution state per discrepancy item
    const [resolutions, setResolutions] = useState<Record<number, 'ai' | 'manual' | 'requested'>>({});
    const [requestModal, setRequestModal] = useState<number | null>(null);
    const [expandedAction, setExpandedAction] = useState<{ id: number; type: 'ai' | 'manual' } | null>(null);
    const [manualValue, setManualValue] = useState('');

    // ── Step init effect ─────────────────────────────────────────────────────
    useEffect(() => {
        if (stepId !== 'w1.2') return;
        setPhase('idle');
        setProgress(0);
        setRowsRevealed(0);
        setActionToast(null);
        setResolutions({});
        setRequestModal(null);
        setExpandedAction(null);
        setManualValue('');
        setAgents(MISMATCH_AGENTS.map(a => ({ ...a, visible: false, done: false })));

        const t = tp(stepId);
        const timer = setTimeout(pauseAware(() => setPhase('notification')), t.notifDelay);
        return () => clearTimeout(timer);
    }, [stepId, pauseAware]);

    // ── Notification → processing ────────────────────────────────────────────
    useEffect(() => {
        if (phase !== 'notification') return;
        const t = tp(stepId);
        const timer = setTimeout(pauseAware(() => setPhase('processing')), t.notifDuration);
        return () => clearTimeout(timer);
    }, [phase, stepId, pauseAware]);

    // ── Processing: stagger agents + progress bar ────────────────────────────
    useEffect(() => {
        if (phase !== 'processing') return;
        const t = tp(stepId);
        const timers: ReturnType<typeof setTimeout>[] = [];
        setAgents(prev => prev.map(a => ({ ...a, visible: false, done: false })));
        setProgress(0);

        const totalAgents = agents.length || 4;
        const totalTime = t.agentStagger * totalAgents + t.agentDone;

        // Build sorted event list and chain — each event schedules the next,
        // so pausing correctly halts the entire sequence (not just one callback).
        const events: Array<[number, () => void]> = [];
        for (let i = 0; i < totalAgents; i++) {
            const idx = i;
            events.push([t.agentStagger * idx, () => setAgents(prev => prev.map((a, j) => j === idx ? { ...a, visible: true } : a))]);
            events.push([t.agentStagger * idx + t.agentDone, () => setAgents(prev => prev.map((a, j) => j === idx ? { ...a, done: true } : a))]);
        }
        for (let i = 1; i <= 20; i++) {
            const pct = i * 5;
            events.push([(totalTime / 20) * i, () => setProgress(pct)]);
        }
        events.push([totalTime + 200, () => setPhase('breathing')]);
        runChain(events, timers);

        return () => timers.forEach(clearTimeout);
    }, [phase, stepId, pauseAware, runChain]);

    // ── Breathing → revealed ─────────────────────────────────────────────────
    useEffect(() => {
        if (phase !== 'breathing') return;
        const timer = setTimeout(pauseAware(() => setPhase('revealed')), tp(stepId).breathing);
        return () => clearTimeout(timer);
    }, [phase, stepId, pauseAware]);

    // ── Revealed effects ─────────────────────────────────────────────────────
    useEffect(() => {
        if (phase !== 'revealed') return;
        const timers: ReturnType<typeof setTimeout>[] = [];

        // w1.2: stagger comparison table rows (chained for correct pause behavior)
        if (stepId === 'w1.2') {
            const run = (i: number) => {
                if (i >= COMPARISON_ITEMS.length) return;
                timers.push(setTimeout(pauseAware(() => { setRowsRevealed(i + 1); run(i + 1); }), 125));
            };
            run(0);
        }

        return () => timers.forEach(clearTimeout);
    }, [phase, stepId, pauseAware]);

    // ── Render helpers ───────────────────────────────────────────────────────

    const renderAgentPipeline = (agts: AgentVis[], prog: number, label: string) => (
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-3">
                <AIAgentAvatar />
                <span className="text-xs font-bold text-foreground">{label}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                <div className="h-full rounded-full bg-brand-400 transition-all duration-[3500ms] ease-linear" style={{ width: `${prog}%` }} />
            </div>
            <div className="space-y-1.5">
                {agts.map(agent => (
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

    const renderNotification = (icon: React.ReactNode, title: string, detail: string) => (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-brand-500 text-zinc-900">{icon}</div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{title}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">Just now</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">{detail}</div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ═════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═════════════════════════════════════════════════════════════════════════

    if (stepId !== 'w1.2') return null;

    return (
        <div className="p-6 space-y-4 max-w-5xl mx-auto">

            {/* ── w1.2: Mismatch Detection (Product Master Spec Sheet vs Selection) ── */}
            {stepId === 'w1.2' && (
                <>
                    {phase === 'notification' && renderNotification(
                        <ClipboardDocumentCheckIcon className="h-5 w-5" />,
                        'Running Product Master Spec Sheet vs Selection Comparison',
                        'Line-by-line check: quantities, product codes, and categories across both sheets — 24 items.'
                    )}

                    {phase === 'processing' && renderAgentPipeline(agents, progress, 'Product Master Spec Sheet vs Selection Check')}

                    {(phase === 'breathing' || phase === 'revealed') && (
                        <div className="animate-in fade-in duration-500 space-y-3">
                            {/* Comparison table with inline resolution */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="p-3 bg-card border-b border-border flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Product Master Spec Sheet vs Selection — Line Comparison</span>
                                        <span className="text-[9px] text-muted-foreground font-medium">8 of 24 items shown</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${colorStyles.green} font-bold`}>21 MATCH</span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${colorStyles.amber} font-bold`}>3 FLAGGED</span>
                                    </div>
                                </div>
                                <table className="w-full text-[10px]">
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border">
                                            <th className="px-3 py-2 text-left font-bold text-muted-foreground w-8">#</th>
                                            <th className="px-3 py-2 text-left font-bold text-muted-foreground">Product</th>
                                            <th className="px-3 py-2 text-left font-bold text-muted-foreground w-24">Manufacturer</th>
                                            <th className="px-3 py-2 text-center font-bold text-muted-foreground w-14">Spec</th>
                                            <th className="px-3 py-2 text-center font-bold text-muted-foreground w-14">Sel.</th>
                                            <th className="px-3 py-2 text-center font-bold text-muted-foreground w-16">Status</th>
                                            <th className="px-3 py-2 text-left font-bold text-muted-foreground w-32">Flag</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {COMPARISON_ITEMS.map((item, idx) => {
                                            const flagInfo = FLAGGED_ITEMS[item.id];
                                            const resolved = resolutions[item.id];
                                            return (
                                                <React.Fragment key={item.id}>
                                                    {/* Main row */}
                                                    <tr className={`border-b border-border/50 transition-all duration-200 ${
                                                        phase === 'revealed' && idx < rowsRevealed ? 'opacity-100' : phase === 'breathing' ? 'opacity-100' : 'opacity-0'
                                                    } ${flagInfo && !resolved ? 'bg-amber-50/50 dark:bg-amber-500/5 border-l-2 border-l-amber-400' : ''} ${resolved === 'requested' ? 'bg-sky-50/50 dark:bg-sky-500/5 border-l-2 !border-l-sky-400' : ''} ${resolved && resolved !== 'requested' ? 'bg-green-50/50 dark:bg-green-500/5 border-l-2 !border-l-green-400' : ''}`}
                                                    >
                                                        <td className="px-3 py-2 text-muted-foreground">{item.id}</td>
                                                        <td className="px-3 py-2 text-foreground">{item.product}</td>
                                                        <td className="px-3 py-2 text-muted-foreground">{item.mfr}</td>
                                                        <td className={`px-3 py-2 text-center font-mono font-bold ${!item.match && !resolved ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'}`}>{item.specQty}</td>
                                                        <td className={`px-3 py-2 text-center font-mono font-bold ${!item.match && !resolved ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'}`}>{item.selQty}</td>
                                                        <td className="px-3 py-2 text-center">
                                                            {resolved && resolved !== 'requested' ? (
                                                                <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 mx-auto" />
                                                            ) : resolved === 'requested' ? (
                                                                <PaperAirplaneIcon className="h-3.5 w-3.5 text-sky-500 mx-auto" />
                                                            ) : !flagInfo ? (
                                                                <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 mx-auto" />
                                                            ) : (
                                                                <ExclamationTriangleIcon className="h-3.5 w-3.5 text-amber-500 mx-auto" />
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {item.flag && (
                                                                <div className="flex items-center gap-1.5">
                                                                    {resolved === 'requested' ? (
                                                                        <span className={`text-[8px] px-1 py-0.5 rounded ${colorStyles.blue} font-bold`}>SENT TO DESIGNER</span>
                                                                    ) : resolved ? (
                                                                        <span className={`text-[8px] px-1 py-0.5 rounded ${colorStyles.green} font-bold`}>{resolved === 'ai' ? 'AI RESOLVED' : 'MANUAL'}</span>
                                                                    ) : (
                                                                        <>
                                                                            <span className={`text-[8px] px-1 py-0.5 rounded ${colorStyles.amber} font-bold`}>{item.flag}</span>
                                                                            <span className="text-[9px] text-muted-foreground">{item.flagDetail}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>

                                                    {/* Inline resolution sub-row for unresolved flagged items */}
                                                    {flagInfo && phase === 'revealed' && idx < rowsRevealed && !resolved && (
                                                        <tr className="border-b border-border/50">
                                                            <td colSpan={7} className="px-3 py-2.5 bg-amber-50/30 dark:bg-amber-500/5">
                                                                {/* Buttons row */}
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                        <ExclamationTriangleIcon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                                                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold shrink-0 ${colorStyles.amber}`}>{flagInfo.type}</span>
                                                                        <span className="text-[10px] text-muted-foreground truncate">{flagInfo.detail}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                                        <button
                                                                            onClick={() => {
                                                                                setExpandedAction(expandedAction?.id === item.id && expandedAction.type === 'ai' ? null : { id: item.id, type: 'ai' });
                                                                            }}
                                                                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold border transition-colors ${
                                                                                expandedAction?.id === item.id && expandedAction.type === 'ai'
                                                                                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-500/40 ring-1 ring-indigo-400/30'
                                                                                    : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'
                                                                            }`}
                                                                        >
                                                                            <SparklesIcon className="h-3 w-3" />
                                                                            AI Suggestion
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                if (expandedAction?.id === item.id && expandedAction.type === 'manual') {
                                                                                    setExpandedAction(null);
                                                                                } else {
                                                                                    setExpandedAction({ id: item.id, type: 'manual' });
                                                                                    setManualValue(flagInfo.aiSuggestion);
                                                                                }
                                                                            }}
                                                                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold border transition-colors ${
                                                                                expandedAction?.id === item.id && expandedAction.type === 'manual'
                                                                                    ? 'bg-muted text-foreground border-border ring-1 ring-border'
                                                                                    : 'bg-card text-foreground border-border hover:bg-muted'
                                                                            }`}
                                                                        >
                                                                            <PencilSquareIcon className="h-3 w-3" />
                                                                            Manual
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setRequestModal(item.id)}
                                                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors"
                                                                        >
                                                                            <UserGroupIcon className="h-3 w-3" />
                                                                            Request
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* AI Suggestion preview */}
                                                                {expandedAction?.id === item.id && expandedAction.type === 'ai' && (
                                                                    <div className="mt-2 p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                        <div className="flex items-start gap-2 mb-2">
                                                                            <SparklesIcon className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                                                            <p className="text-[10px] text-indigo-700 dark:text-indigo-300 leading-relaxed">{flagInfo.aiSuggestion}</p>
                                                                        </div>
                                                                        <div className="flex justify-end">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setResolutions(prev => ({ ...prev, [item.id]: 'ai' }));
                                                                                    setExpandedAction(null);
                                                                                }}
                                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                                                                            >
                                                                                <CheckCircleIcon className="h-3 w-3" />
                                                                                Apply Suggestion
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Manual edit */}
                                                                {expandedAction?.id === item.id && expandedAction.type === 'manual' && (
                                                                    <div className="mt-2 p-2.5 rounded-lg bg-muted/30 border border-border animate-in fade-in slide-in-from-top-1 duration-200">
                                                                        <textarea
                                                                            value={manualValue}
                                                                            onChange={e => setManualValue(e.target.value)}
                                                                            rows={2}
                                                                            className="w-full p-2 rounded-lg text-[10px] bg-card border border-border text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-brand-400"
                                                                        />
                                                                        <div className="flex justify-end mt-2">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setResolutions(prev => ({ ...prev, [item.id]: 'manual' }));
                                                                                    setExpandedAction(null);
                                                                                }}
                                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-foreground text-background hover:opacity-90 transition-colors"
                                                                            >
                                                                                <CheckCircleIcon className="h-3 w-3" />
                                                                                Save Override
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )}

                                                    {/* Resolved sub-row */}
                                                    {flagInfo && resolved && (
                                                        <tr className={`border-b border-border/50 ${resolved === 'requested' ? 'bg-sky-50/30 dark:bg-sky-500/5' : 'bg-green-50/30 dark:bg-green-500/5'}`}>
                                                            <td colSpan={7} className="px-3 py-2">
                                                                <div className="flex items-center gap-2">
                                                                    {resolved === 'requested' ? (
                                                                        <>
                                                                            <PaperAirplaneIcon className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                                                                            <span className="text-[10px] text-sky-700 dark:text-sky-400">Sent to Alex Rivera (Designer) for verification</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                                                            <span className="text-[10px] text-green-700 dark:text-green-400">{flagInfo.aiSuggestion}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Request stakeholder modal (fixed overlay — outside table) */}
                            {requestModal !== null && (() => {
                                const reqItem = COMPARISON_ITEMS.find(i => i.id === requestModal);
                                const reqFlag = FLAGGED_ITEMS[requestModal];
                                if (!reqItem || !reqFlag) return null;
                                return (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setRequestModal(null)}>
                                        <div className="w-80 p-4 rounded-xl bg-card border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Send to Stakeholder</span>
                                                <button onClick={() => setRequestModal(null)} className="p-1 rounded hover:bg-muted transition-colors">
                                                    <XMarkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                </button>
                                            </div>

                                            {/* Item being sent */}
                                            <div className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 mb-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[11px] font-bold text-foreground">{reqItem.product}</span>
                                                    <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${colorStyles.amber}`}>{reqFlag.type}</span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">{reqFlag.detail}</span>
                                            </div>

                                            {/* Designer card */}
                                            <div className="flex items-center gap-3 p-2.5 rounded-lg border border-brand-300 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-500/5 mb-3">
                                                <img
                                                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face"
                                                    alt=""
                                                    className="w-8 h-8 rounded-full ring-2 ring-brand-400 shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[11px] font-bold text-foreground">Alex Rivera</div>
                                                    <div className="text-[10px] text-muted-foreground">Designer — External</div>
                                                </div>
                                                <CheckCircleIcon className="h-4 w-4 text-brand-500 shrink-0" />
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setResolutions(prev => ({ ...prev, [requestModal]: 'requested' }));
                                                    setRequestModal(null);
                                                    setExpandedAction(null);
                                                    setActionToast(`Discrepancy sent to Alex Rivera for review`);
                                                    setTimeout(() => setActionToast(null), 2500);
                                                }}
                                                className="w-full py-2.5 rounded-lg text-[10px] font-bold bg-brand-400 text-zinc-900 hover:bg-brand-300 transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <PaperAirplaneIcon className="h-3.5 w-3.5" />
                                                Send to Designer
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Summary footer */}
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border text-[10px] text-muted-foreground">
                                <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                <span>21 items match</span>
                                <span className="text-border">|</span>
                                <span className={resolutions[3] ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>1 qty mismatch</span>
                                <span className="text-border">|</span>
                                <span className={resolutions[5] === 'requested' ? 'text-sky-600 dark:text-sky-400' : resolutions[5] ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>
                                    1 custom config{resolutions[5] === 'requested' ? ' → designer' : ''}
                                </span>
                                <span className="text-border">|</span>
                                <span className={resolutions[6] ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>1 SKU update</span>
                            </div>

                            {/* Action toast */}
                            {actionToast && (
                                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                                        <span className="text-[11px] font-bold text-green-700 dark:text-green-400">{actionToast}</span>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            {phase === 'revealed' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setActionToast('Mismatch report exported as PDF')}
                                        className="flex-1 py-3 rounded-xl text-xs font-bold border border-border bg-card text-foreground hover:bg-muted transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowUpTrayIcon className="h-3.5 w-3.5" />
                                        Export Report
                                    </button>
                                    <button
                                        onClick={() => nextStep()}
                                        disabled={Object.keys(resolutions).length < FLAGGED_COUNT}
                                        className="flex-1 py-3 rounded-xl text-xs font-bold bg-brand-400 text-zinc-900 hover:bg-brand-300 shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Continue
                                        <ArrowRightIcon className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

        </div>
    );
}
