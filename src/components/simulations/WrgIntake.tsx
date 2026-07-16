// ═══════════════════════════════════════════════════════════════════════════════
// WR — Flow 1: Project Intake
// Steps: w1.4 (WrgIntake — automated pipeline overlay on Transactions)
//        w1.5 (WrgIntakeReview — HITL in Dashboard)
//
// w1.1 is handled by EmailSimulation.tsx (profile-aware, reused from COI/OPS)
// Data: JPS Health Center for Women — 14,200 sqft, 6 floors, healthcare vertical
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDemo } from '../../context/DemoContext';
import { AIAgentAvatar } from './DemoAvatars';
import {
    CheckCircleIcon,
    ArrowPathIcon,
    ArrowRightIcon,
    UserGroupIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    InboxIcon,
    PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { WRG_STEP_TIMING, type WrgStepTiming } from '../../config/profiles/wrg-demo';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AgentVis { name: string; detail: string; visible: boolean; done: boolean }

type PipelinePhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed';
type IntakeReviewPhase = 'idle' | 'notification' | 'reviewing';

// ─── Comparison data (same as WrgHandoff w1.2 — shown as read-only summary) ─

const COMPARISON_SUMMARY = [
    { product: 'Plastic Stacking Chair', type: 'QTY MISMATCH', resolution: 'Qty updated to 20' },
    { product: 'OFS Coact Serpentine Lounge', type: 'CUSTOM CONFIG', resolution: '12-week lead accepted' },
    { product: 'Nemschoff NC-2240 Recliner', type: 'DISCONTINUED', resolution: 'Replaced with NC-2250' },
];

// ─── Color Styles (DS pattern) ──────────────────────────────────────────────

const colorStyles: Record<string, string> = {
    green: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/30',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30',
    purple: 'bg-purple-50 text-purple-700 dark:bg-ai/15 dark:text-purple-300 ring-1 ring-inset ring-purple-600/20 dark:ring-purple-400/30',
};

// ─── Render helpers ─────────────────────────────────────────────────────────

function renderAgentPipeline(agents: AgentVis[], progress: number, label: string) {
    return (
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-3">
                <AIAgentAvatar />
                <span className="text-xs font-bold text-foreground">{label}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                <div className="h-full rounded-full bg-brand-400 transition-all duration-[3500ms] ease-linear" style={{ width: `${progress}%` }} />
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
}

function renderNotification(icon: React.ReactNode, title: string, detail: string) {
    return (
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
}

// ═════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT: WrgIntake (step w1.4 only)
// Rendered as overlay on Transactions
// ═════════════════════════════════════════════════════════════════════════════

export default function WrgIntake({ onNavigate }: { onNavigate?: (page: string) => void }) {
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

    // ── State ─────────────────────────────────────────────────────────────────
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [sendingToast, setSendingToast] = useState(false);
    const [toastDone, setToastDone] = useState(false);

    // ── Step init ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (stepId !== 'w1.4') return;
        setSelectedUser(null);
        setSendingToast(false);
        setToastDone(false);
    }, [stepId]);

    const handleSendToUser = (userName: string) => {
        setSelectedUser(userName);
        setSendingToast(true);
        const t1 = setTimeout(pauseAware(() => setToastDone(true)), 2500);
        const t2 = setTimeout(pauseAware(() => nextStep()), 5100);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    };

    // ═════════════════════════════════════════════════════════════════════════
    // RENDER — No processing animation. Content appears immediately.
    // ═════════════════════════════════════════════════════════════════════════

    if (stepId !== 'w1.4') return null;

    return (
        <div className="p-6 space-y-4 max-w-5xl mx-auto animate-in fade-in duration-500">

            {/* ── Resolved Discrepancies (from w1.2) ── */}
            <div className="rounded-xl border border-border overflow-hidden">
                <div className="p-3 bg-card border-b border-border flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mismatch Review — Resolved</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${colorStyles.green} font-bold`}>3/3 RESOLVED</span>
                </div>
                <div className="divide-y divide-border/50">
                    {COMPARISON_SUMMARY.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 bg-card">
                            <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            <span className="text-[10px] font-bold text-foreground">{item.product}</span>
                            <span className={`text-[8px] px-1 py-0.5 rounded ${colorStyles.green} font-bold`}>{item.type}</span>
                            <span className="text-[9px] text-muted-foreground ml-auto">{item.resolution}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Client Request (from email) ── */}
            <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Client Request</div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${colorStyles.blue} font-bold`}>FROM CLIENT EMAIL</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Project', value: 'JPS Health Center for Women' },
                        { label: 'Vertical', value: 'Healthcare', badge: { text: 'HC', color: 'green' } },
                        { label: 'Area', value: '14,200 sqft' },
                        { label: 'Floors', value: '6' },
                        { label: 'Primary Mfr', value: 'MillerKnoll' },
                        { label: 'Site', value: 'Hospital delivery', badge: { text: 'HOSP', color: 'amber' } },
                    ].map(p => (
                        <div key={p.label} className="p-2.5 rounded-lg bg-muted/30 border border-border">
                            <div className="text-[9px] text-muted-foreground uppercase">{p.label}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] font-bold text-foreground">{p.value}</span>
                                {p.badge && <span className={`text-[8px] px-1.5 py-0.5 rounded ${colorStyles[p.badge.color]} font-bold`}>{p.badge.text}</span>}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-3 flex items-center gap-2 text-[9px] text-muted-foreground">
                    <DocumentTextIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>Documents: Spec Narrative, Selection Document, Site Requirements</span>
                </div>
            </div>

            {/* ── Strata Registration ── */}
            <div className="p-4 rounded-xl bg-card border border-border">
                <div className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">Strata Registration</div>
                <div className="space-y-2">
                    {[
                        { label: 'Smartsheet Row', value: '#2026-JPS-HCW', color: 'blue' },
                        { label: 'Estimation Template', value: 'Complex Sheet (>50 items)', color: 'purple' },
                        { label: 'Quote Type', value: 'Product + Installation Labor + Delivery', color: 'green' },
                    ].map(r => (
                        <div key={r.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20 border border-border">
                            <span className="text-[10px] text-foreground">{r.label}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${colorStyles[r.color]} font-bold`}>{r.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Strata Expert — Assigned ── */}
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Strata Expert — Assigned</div>
            <div className="grid grid-cols-2 gap-3">
                {/* Regional Sales Manager Reyes — ASSIGNED */}
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-500/20 flex items-center justify-center text-sm font-black text-green-700 dark:text-green-400 ring-2 ring-green-400">DP</div>
                        <div>
                            <div className="text-[11px] font-bold text-foreground">Regional Sales Manager Reyes</div>
                            <div className="text-[10px] text-muted-foreground">Strata Expert — Dallas, 32 mi</div>
                        </div>
                        <CheckCircleIcon className="h-5 w-5 text-green-500 ml-auto" />
                    </div>
                    <div className="space-y-2">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] text-muted-foreground">Workload: 3 active</span>
                                <span className="text-[9px] font-bold text-green-700 dark:text-green-400">60%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-green-100 dark:bg-green-500/10 overflow-hidden">
                                <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: '60%' }} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] text-muted-foreground">Healthcare Accuracy</span>
                            <span className="text-[10px] font-bold text-green-700 dark:text-green-400">96.3%</span>
                        </div>
                    </div>
                    <div className="mt-2 text-center">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full ${colorStyles.green} font-bold`}>ASSIGNED</span>
                    </div>
                </div>

                {/* Jaime Gonzalez — not selected */}
                <div className="p-4 rounded-xl bg-card border border-border opacity-50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-black text-muted-foreground">JG</div>
                        <div>
                            <div className="text-[11px] font-bold text-foreground">Jaime Gonzalez</div>
                            <div className="text-[10px] text-muted-foreground">Strata Expert — Houston, 264 mi</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] text-muted-foreground">Workload: 5 active</span>
                                <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400">100%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-amber-100 dark:bg-amber-500/10 overflow-hidden">
                                <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: '100%' }} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] text-muted-foreground">Healthcare Accuracy</span>
                            <span className="text-[10px] font-bold text-muted-foreground">91.1%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Designer — Send for Review ── */}
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Send to Designer for Review</div>

            {!sendingToast && (
                <div>
                    {/* Designer card */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-brand-300 dark:border-brand-500/30 mb-3">
                        <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face" alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-foreground">Designer Alden</div>
                            <div className="text-[10px] text-muted-foreground">Designer — External</div>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full ${colorStyles.green} font-bold`}>ASSIGNED</span>
                    </div>

                    <button
                        onClick={() => handleSendToUser('Designer Alden')}
                        className="w-full py-3 rounded-xl text-xs font-bold bg-brand-400 text-zinc-900 hover:bg-brand-300 shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <EnvelopeIcon className="h-4 w-4" />
                        Send to Designer
                    </button>
                </div>
            )}

            {/* Sending toast */}
            {sendingToast && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className={`flex items-center gap-3 p-4 rounded-xl border ${toastDone ? 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20' : 'bg-card border-border'} transition-colors duration-500`}>
                        {toastDone ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500 shrink-0" />
                        ) : (
                            <ArrowPathIcon className="h-5 w-5 text-indigo-500 animate-spin shrink-0" />
                        )}
                        <div className="flex-1">
                            <span className="text-[11px] font-bold text-foreground">
                                {toastDone ? `Sent to ${selectedUser}` : `Sending to ${selectedUser}...`}
                            </span>
                            <p className="text-[10px] text-muted-foreground">
                                {toastDone ? 'Intake summary and Smartsheet shared — ready for designer review' : 'Sharing intake summary and Smartsheet registration...'}
                            </p>
                        </div>
                        {toastDone && <span className={`text-[9px] px-2 py-0.5 rounded-full ${colorStyles.green} font-bold`}>SENT</span>}
                    </div>
                </div>
            )}
        </div>
    );
}


// ═════════════════════════════════════════════════════════════════════════════
// NAMED EXPORT: WrgIntakeReview (step w1.5)
// Rendered inside Dashboard.tsx — simplified: summary + assignment + CTA
// ═════════════════════════════════════════════════════════════════════════════

export function WrgIntakeReview({ onNavigate }: { onNavigate?: (page: string) => void }) {
    const { currentStep, nextStep, isPaused } = useDemo();

    if (currentStep.id !== 'w1.5') return null;

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

    // ── Phase state ──────────────────────────────────────────────────────────
    const [reviewPhase, setReviewPhase] = useState<IntakeReviewPhase>('idle');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['facility', 'products', 'assignment', 'sheets']));
    const [showReturnRequest, setShowReturnRequest] = useState(false);
    const [returnSent, setReturnSent] = useState(false);
    const [reviewingRecord, setReviewingRecord] = useState<string | null>(null);
    const [confirmSending, setConfirmSending] = useState(false);
    const [confirmDone, setConfirmDone] = useState(false);

    const toggleSection = (key: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    // ── Init effect ──────────────────────────────────────────────────────────
    useEffect(() => {
        setReviewPhase('idle');
        setExpandedSections(new Set(['facility', 'products', 'assignment', 'sheets']));
        setShowReturnRequest(false);
        setReturnSent(false);
        setReviewingRecord(null);
        setConfirmSending(false);
        setConfirmDone(false);
        const timer = setTimeout(pauseAware(() => setReviewPhase('notification')), 3400);
        return () => clearTimeout(timer);
    }, [pauseAware]);

    const handleReturnForReview = () => {
        setShowReturnRequest(true);
    };

    const handleSendReturn = () => {
        setReturnSent(true);
        setTimeout(pauseAware(() => setShowReturnRequest(false)), 4300);
    };

    // ─── Expandable scope sections data ──────────────────────────────────────
    const scopeSections = [
        {
            key: 'facility', label: 'Facility Details', badge: 'HC', badgeColor: 'green',
            summary: 'JPS Health Center for Women — 14,200 sqft, 6 floors',
            details: [
                { k: 'Building Type', v: 'Healthcare — Women\'s Health Center' },
                { k: 'Total Area', v: '14,200 sqft across 6 floors' },
                { k: 'Location', v: 'Fort Worth, TX (JPS campus)' },
                { k: 'Delivery Site', v: 'Hospital — restricted hours, freight elevator required' },
                { k: 'Timeline', v: 'Furniture installation Q3 2026' },
            ],
        },
        {
            key: 'products', label: 'Product Scope', badge: '24 items', badgeColor: 'blue',
            summary: 'MillerKnoll healthcare furniture — exam, waiting, office',
            details: [
                { k: 'Primary Manufacturer', v: 'MillerKnoll (Herman Miller Healthcare)' },
                { k: 'Categories', v: 'Exam room, waiting area, nursing station, office' },
                { k: 'Key Products', v: 'Exam chairs, modular seating, height-adj desks' },
                { k: 'Special Items', v: '2 custom configurations flagged' },
                { k: 'Spec Documents', v: '3 PDFs parsed (Spec Narrative, Selection Doc, Site Reqs)' },
            ],
        },
        {
            key: 'assignment', label: 'Expert Assignment', badge: 'ASSIGNED', badgeColor: 'green',
            summary: 'Regional Sales Manager Reyes — Dallas, 96.3% accuracy, 60% workload',
            details: [
                { k: 'Assigned To', v: 'Regional Sales Manager Reyes — Strata Expert' },
                { k: 'Location', v: 'Dallas, TX — 32 miles from site' },
                { k: 'Healthcare Accuracy', v: '96.3% on similar projects' },
                { k: 'Current Workload', v: '3 active projects (60% capacity)' },
                { k: 'Selection Reason', v: 'Closest available expert with highest HC accuracy' },
            ],
        },
        {
            key: 'sheets', label: 'Estimation Sheet', badge: 'COMPLEX', badgeColor: 'purple',
            summary: '>50 items — Complex estimation template selected',
            details: [
                { k: 'Template', v: 'Complex Estimation Sheet (>50 line items)' },
                { k: 'Alternative', v: 'Standard Sheet (≤50 items) — not applicable' },
                { k: 'Documents', v: 'Spec Narrative, Selection Document, Site Requirements' },
                { k: 'Line Items', v: '24 products across 4 categories' },
                { k: 'Smartsheet Row', v: '#2026-JPS-HCW — populated with extracted data' },
            ],
        },
    ];

    // ─── Records data with review content ────────────────────────────────────
    const records = [
        {
            key: 'smartsheet', label: 'Smartsheet Row', value: '#2026-JPS-HCW', color: 'blue',
            reviewTitle: 'Smartsheet Row — #2026-JPS-HCW',
            reviewFields: [
                { k: 'Row ID', v: '#2026-JPS-HCW' },
                { k: 'Project', v: 'JPS Health Center for Women' },
                { k: 'Client', v: 'JPS Health Network' },
                { k: 'Vertical', v: 'Healthcare' },
                { k: 'Total Area', v: '14,200 sqft' },
                { k: 'Status', v: 'Intake Complete — Pending Dealer Approval' },
                { k: 'Created', v: 'Mar 27, 2026 at 10:14 AM' },
            ],
        },
        {
            key: 'template', label: 'Estimation Template', value: 'COMPLEX (>50 items)', color: 'purple',
            reviewTitle: 'Estimation Template — Complex Sheet',
            reviewFields: [
                { k: 'Template Type', v: 'Complex Estimation Sheet' },
                { k: 'Threshold', v: '>50 line items' },
                { k: 'Line Items', v: '24 products across 4 categories' },
                { k: 'Categories', v: 'Seating, Casework, Workstations, Accessories' },
                { k: 'Linked Sheet', v: '#2026-JPS-HCW' },
                { k: 'Labor Sections', v: 'Installation, Delivery, Site Prep' },
            ],
        },
        {
            key: 'expert', label: 'Expert Assignment', value: 'Regional Sales Manager Reyes — HIGH priority', color: 'green',
            reviewTitle: 'Expert Assignment — Regional Sales Manager Reyes',
            reviewFields: [
                { k: 'Expert', v: 'Regional Sales Manager Reyes — Strata Expert' },
                { k: 'Priority', v: 'HIGH' },
                { k: 'Location', v: 'Dallas, TX — 32 mi from site' },
                { k: 'HC Accuracy', v: '96.3%' },
                { k: 'Workload', v: '3 active (60% capacity)' },
                { k: 'ETA', v: 'Review within 24 hrs' },
            ],
        },
    ];

    return (
        <div className="space-y-4">
            {/* Notification */}
            {reviewPhase === 'notification' && (
                <button onClick={() => setReviewPhase('reviewing')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="p-5 bg-brand-50 dark:bg-brand-500/10 border-l-4 border-brand-400 rounded-r-xl">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-brand-500 text-zinc-900">
                                <InboxIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-foreground">Intake Summary Ready — JPS Health Center</span>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500 text-white font-bold">ACTION REQUIRED</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    AI-generated intake — assigned to Regional Sales Manager Reyes (Dallas), Smartsheet #2026-JPS-HCW populated
                                </p>
                                <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to review <ArrowRightIcon className="h-3 w-3" /></p>
                            </div>
                        </div>
                    </div>
                </button>
            )}

            {/* Full review */}
            {reviewPhase === 'reviewing' && (
                <div className="animate-in fade-in duration-500 space-y-4">
                    {/* Summary grid — 2x2 */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Project', value: 'JPS Health Center', detail: '14,200 sqft · 6 floors', icon: '🏥' },
                            { label: 'Vertical', value: 'Healthcare', detail: 'Hospital delivery site', color: 'amber' as const, icon: '⚕️' },
                            { label: 'Expert', value: 'Regional Sales Manager Reyes', detail: 'Dallas · 96.3% accuracy', color: 'green' as const, icon: '👤' },
                            { label: 'Estimation', value: 'Complex Sheet', detail: '24 items · >50 threshold', color: 'purple' as const, icon: '📋' },
                        ].map(c => (
                            <div key={c.label} className={`p-3 rounded-lg border ${
                                c.color === 'green' ? 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20'
                                    : c.color === 'amber' ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20'
                                    : c.color === 'purple' ? 'bg-purple-50 dark:bg-ai/5 border-purple-200 dark:border-purple-500/20'
                                    : 'bg-card border-border'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <div className="text-[9px] text-muted-foreground uppercase">{c.label}</div>
                                </div>
                                <div className={`text-sm font-bold mt-0.5 ${
                                    c.color === 'green' ? 'text-green-700 dark:text-green-400'
                                        : c.color === 'amber' ? 'text-amber-700 dark:text-amber-400'
                                        : c.color === 'purple' ? 'text-purple-700 dark:text-purple-400'
                                        : 'text-foreground'
                                }`}>{c.value}</div>
                                <div className="text-[10px] text-muted-foreground">{c.detail}</div>
                            </div>
                        ))}
                    </div>

                    {/* Expandable scope report */}
                    <div className="p-4 rounded-xl bg-card border border-border">
                        <div className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">Intake Report — Click to expand</div>
                        <div className="grid grid-cols-2 gap-2">
                            {scopeSections.map(section => (
                                <div key={section.key} className="rounded-lg border border-border overflow-hidden">
                                    <button
                                        onClick={() => toggleSection(section.key)}
                                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className="text-[10px] font-bold text-foreground">{section.label}</span>
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded ${colorStyles[section.badgeColor]} font-bold shrink-0`}>{section.badge}</span>
                                        </div>
                                        <svg className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ${expandedSections.has(section.key) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                                    </button>
                                    {expandedSections.has(section.key) && (
                                        <div className="px-3 pb-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="space-y-1.5 pt-1 border-t border-border">
                                                {section.details.map(d => (
                                                    <div key={d.k} className="flex items-start justify-between gap-3 py-1">
                                                        <span className="text-[9px] text-muted-foreground uppercase shrink-0">{d.k}</span>
                                                        <span className="text-[10px] text-foreground font-medium text-right">{d.v}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Registration records with review buttons */}
                    <div className="relative p-4 rounded-xl bg-card border border-border">
                        <div className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">Records Created</div>
                        <div className="space-y-1.5">
                            {records.map(r => (
                                <div key={r.key} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20 border border-border">
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                        <span className="text-[10px] text-foreground">{r.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${colorStyles[r.color]} font-bold`}>{r.value}</span>
                                        <button
                                            onClick={() => setReviewingRecord(reviewingRecord === r.key ? null : r.key)}
                                            className="text-[9px] px-2 py-1 rounded-md border border-border bg-card hover:bg-muted text-foreground font-bold transition-colors"
                                        >
                                            Review
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Floating review window */}
                        {reviewingRecord && (() => {
                            const record = records.find(r => r.key === reviewingRecord);
                            if (!record) return null;
                            return (
                                <div className="absolute bottom-full mb-2 left-0 right-0 p-4 rounded-xl bg-card border border-border shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 z-10">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{record.reviewTitle}</span>
                                        <button onClick={() => setReviewingRecord(null)} className="p-1 rounded-md hover:bg-muted transition-colors">
                                            <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    <div className="space-y-1.5">
                                        {record.reviewFields.map(f => (
                                            <div key={f.k} className="flex items-center justify-between px-2 py-1.5 rounded-md bg-muted/30">
                                                <span className="text-[9px] text-muted-foreground uppercase">{f.k}</span>
                                                <span className="text-[10px] text-foreground font-medium">{f.v}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-[9px] text-green-600 dark:text-green-400">
                                        <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" />
                                        <span className="font-bold">Record verified — auto-generated by Strata AI</span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Return for Review — floating request message */}
                    {showReturnRequest && (
                        <div className="p-4 rounded-xl bg-card border border-border shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-2 mb-3">
                                <EnvelopeIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Request Review — Send to Expert</span>
                            </div>
                            {!returnSent ? (
                                <>
                                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 mb-3">
                                        <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 mb-1">To: Regional Sales Manager Reyes — Strata Expert</div>
                                        <div className="text-[10px] text-foreground leading-relaxed">
                                            Hi David, I've reviewed the intake summary for JPS Health Center and have some questions before approving.
                                            Could you verify the delivery logistics for the hospital site? Restricted hours and freight elevator access
                                            need confirmation from the JPS facilities team. Also, please double-check the 2 custom configurations flagged
                                            in the product scope. Thanks — Sara
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setShowReturnRequest(false); setReturnSent(false); }}
                                            className="flex-1 py-2 rounded-lg text-[10px] font-bold border border-border bg-card text-foreground hover:bg-muted transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSendReturn}
                                            className="flex-1 py-2 rounded-lg text-[10px] font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <EnvelopeIcon className="h-3.5 w-3.5" />
                                            Send to Expert
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                                    <CheckCircleIcon className="h-4 w-4 text-green-500 shrink-0" />
                                    <span className="text-[11px] font-bold text-green-700 dark:text-green-400">Review request sent to Regional Sales Manager Reyes — returned to Expert Hub</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Confirm toast */}
                    {confirmSending && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className={`flex items-center gap-3 p-4 rounded-xl border ${confirmDone ? 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20' : 'bg-card border-border'} transition-colors duration-500`}>
                                {confirmDone ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-500 shrink-0" />
                                ) : (
                                    <ArrowPathIcon className="h-5 w-5 text-indigo-500 animate-spin shrink-0" />
                                )}
                                <div className="flex-1">
                                    <span className="text-[11px] font-bold text-foreground">
                                        {confirmDone ? 'Revisado con éxito — listo para estimaciones' : 'Enviando confirmación...'}
                                    </span>
                                    <p className="text-[10px] text-muted-foreground">
                                        {confirmDone ? 'Intake approved — estimation phase authorized for Regional Sales Manager Reyes' : 'Validating intake summary and notifying expert...'}
                                    </p>
                                </div>
                                {confirmDone && <span className={`text-[9px] px-2 py-0.5 rounded-full ${colorStyles.green} font-bold`}>SENT</span>}
                            </div>
                        </div>
                    )}

                    {/* Two actions: Feedback + Send */}
                    {!showReturnRequest && !confirmSending && (
                        <div className="flex gap-3">
                            <button
                                onClick={handleReturnForReview}
                                className="flex-1 py-3 rounded-xl text-xs font-bold border border-border bg-card text-foreground hover:bg-muted transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
                                Return for Review
                            </button>
                            <button
                                onClick={() => {
                                    setConfirmSending(true);
                                    setTimeout(pauseAware(() => setConfirmDone(true)), 2500);
                                    setTimeout(pauseAware(() => nextStep()), 5100);
                                }}
                                className="flex-1 py-3 rounded-xl text-xs font-bold bg-brand-400 text-zinc-900 hover:bg-brand-300 shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <PaperAirplaneIcon className="h-3.5 w-3.5" />
                                Approve & Send to Expert
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
