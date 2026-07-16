// ═══════════════════════════════════════════════════════════════════════════════
// WR — Flow 1, Step w1.3: Designer Field Review
// Designer receives expert's flagged item with full context and resolves it
// Pattern: notification → revealed (no processing — direct handoff from expert)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDemo } from '../../context/DemoContext';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowRightIcon,
    PencilSquareIcon,
    SparklesIcon,
    PaperAirplaneIcon,
    ClipboardDocumentCheckIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import { WRG_STEP_TIMING, type WrgStepTiming } from '../../config/profiles/wrg-demo';

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'notification' | 'revealed';

type Resolution = 'pending' | 'accepted' | 'overridden' | 'flagged';

// ─── Color Styles (DS pattern) ───────────────────────────────────────────────

const colorStyles: Record<string, string> = {
    green: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/30',
};

const resolutionStyles: Record<Resolution, string> = {
    pending: 'bg-zinc-100 text-muted-foreground dark:bg-zinc-800 dark:text-muted-foreground ring-1 ring-inset ring-border',
    accepted: colorStyles.green,
    overridden: colorStyles.blue,
    flagged: colorStyles.amber,
};

// ═════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT: WrgDesigner (step w1.3)
// ═════════════════════════════════════════════════════════════════════════════

export default function WrgDesigner({ onNavigate }: { onNavigate?: (page: string) => void }) {
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

    const tp = (): WrgStepTiming => WRG_STEP_TIMING['w1.3'] || WRG_STEP_TIMING['w2.1'];

    // ── State ──────────────────────────────────────────────────────────────
    const [phase, setPhase] = useState<Phase>('idle');
    const [resolution, setResolution] = useState<Resolution>('pending');
    const [actionToast, setActionToast] = useState<string | null>(null);
    const [editingOverride, setEditingOverride] = useState(false);

    // ── Step init → notification ────────────────────────────────────────────
    useEffect(() => {
        if (stepId !== 'w1.3') return;
        setPhase('idle');
        setResolution('pending');
        setActionToast(null);
        setEditingOverride(false);

        const t = tp();
        const timer = setTimeout(pauseAware(() => setPhase('notification')), t.notifDelay);
        return () => clearTimeout(timer);
    }, [stepId, pauseAware]);

    // ── Notification → revealed (skip processing) ──────────────────────────
    useEffect(() => {
        if (phase !== 'notification') return;
        const t = tp();
        const timer = setTimeout(pauseAware(() => setPhase('revealed')), t.notifDuration);
        return () => clearTimeout(timer);
    }, [phase, pauseAware]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleResolve = (res: Resolution) => {
        setResolution(res);
        setEditingOverride(false);
        const labels: Record<Resolution, string> = {
            pending: '',
            accepted: 'Configuration accepted — lead time confirmed',
            overridden: 'Configuration overridden — correction applied',
            flagged: 'Item flagged for further review',
        };
        setActionToast(labels[res]);
        setTimeout(pauseAware(() => setActionToast(null)), 3100);
    };

    // ═════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═════════════════════════════════════════════════════════════════════════

    if (stepId !== 'w1.3') return null;

    return (
        <div className="p-6 space-y-4 max-w-5xl mx-auto">

            {/* Notification */}
            {phase === 'notification' && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-brand-500 text-zinc-900">
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-foreground">Expert Request — JPS Health Center</span>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">Just now</span>
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-1">
                                    Regional Sales Manager Reyes sent 1 item for your review — custom configuration requires designer verification.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Revealed: Context + Resolution */}
            {phase === 'revealed' && (
                <div className="animate-in fade-in duration-500 space-y-3">

                    {/* Expert request context card */}
                    <div className="p-4 rounded-xl bg-card border border-border">
                        <div className="flex items-center gap-2 mb-3">
                            <PaperAirplaneIcon className="h-4 w-4 text-sky-500 shrink-0" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Request from Expert</span>
                        </div>

                        {/* Sender info */}
                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border mb-3">
                            <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
                                alt=""
                                className="w-8 h-8 rounded-full ring-2 ring-sky-400 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-bold text-foreground">Regional Sales Manager Reyes</div>
                                <div className="text-[10px] text-muted-foreground">Strata Expert — Mismatch Detection (Step 1.2)</div>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0 ${colorStyles.blue}`}>SENT TO YOU</span>
                        </div>

                        {/* Project context */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="p-2 rounded-lg bg-muted/20 border border-border">
                                <div className="text-[9px] text-muted-foreground font-bold uppercase mb-0.5">Project</div>
                                <div className="text-[11px] text-foreground font-bold">JPS Health Center</div>
                            </div>
                            <div className="p-2 rounded-lg bg-muted/20 border border-border">
                                <div className="text-[9px] text-muted-foreground font-bold uppercase mb-0.5">Comparison</div>
                                <div className="text-[11px] text-foreground font-bold">24 items — 21 match</div>
                            </div>
                            <div className="p-2 rounded-lg bg-muted/20 border border-border">
                                <div className="text-[9px] text-muted-foreground font-bold uppercase mb-0.5">Flagged</div>
                                <div className="text-[11px] text-foreground font-bold">3 items — 2 resolved</div>
                            </div>
                        </div>

                        {/* What the expert already resolved */}
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Resolved by Expert</div>
                        <div className="space-y-1.5 mb-3">
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50/50 dark:bg-green-500/5 border border-green-200/50 dark:border-green-500/15">
                                <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                <span className="text-[10px] text-foreground font-medium">Plastic Stacking Chair</span>
                                <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${colorStyles.green}`}>QTY — AI RESOLVED</span>
                                <span className="text-[10px] text-muted-foreground ml-auto">Spec: 19 → Sel: 20</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50/50 dark:bg-green-500/5 border border-green-200/50 dark:border-green-500/15">
                                <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                <span className="text-[10px] text-foreground font-medium">Nemschoff NC-2240 Recliner</span>
                                <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${colorStyles.green}`}>DISCONTINUED — MANUAL</span>
                                <span className="text-[10px] text-muted-foreground ml-auto">→ NC-2250 (+$85/unit)</span>
                            </div>
                        </div>

                        {/* What was sent to designer */}
                        <div className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1.5">Requires Your Review</div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                            <ExclamationTriangleIcon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span className="text-[10px] text-foreground font-medium">OFS Coact Serpentine Lounge</span>
                            <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${colorStyles.amber}`}>CUSTOM CONFIG</span>
                            <span className="text-[10px] text-muted-foreground ml-auto">12-week lead time</span>
                        </div>
                    </div>

                    {/* Designer header */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                        <div className="flex items-center gap-2">
                            <img
                                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face"
                                alt=""
                                className="w-8 h-8 rounded-full ring-2 ring-brand-400"
                            />
                            <div>
                                <span className="text-[11px] font-bold text-foreground">Alex Rivera</span>
                                <span className="text-[10px] text-muted-foreground ml-2">Designer — Field Review</span>
                            </div>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${resolution !== 'pending' ? colorStyles.green : colorStyles.amber}`}>
                            {resolution !== 'pending' ? 'RESOLVED' : 'PENDING'}
                        </span>
                    </div>

                    {/* Resolution card */}
                    <div className={`p-4 rounded-xl border transition-all duration-300 ${
                        resolution === 'pending'
                            ? 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-300 dark:border-amber-500/30'
                            : 'bg-card border-border'
                    }`}>
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-foreground">OFS Coact Serpentine Lounge</span>
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${colorStyles.amber}`}>CUSTOM CONFIG</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground">OFS</span>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${resolutionStyles[resolution]}`}>
                                {resolution.toUpperCase()}
                            </span>
                        </div>

                        {/* Detail */}
                        <div className="p-2.5 rounded-lg bg-muted/30 border border-border mb-3">
                            <div className="flex items-start gap-2">
                                <ExclamationTriangleIcon className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <div className="text-[10px] text-foreground leading-relaxed">
                                    <div className="font-medium mb-1">Custom configuration — 12-week lead time</div>
                                    <div className="text-muted-foreground">
                                        Non-standard configuration selected. Lead time extends standard 6-week to 12-week delivery.
                                        Verify fabric selection, arm configuration, and power module specs match the dealer's order intent.
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border">
                                        <span className="text-muted-foreground">Qty: <span className="font-mono font-bold text-foreground">2</span></span>
                                        <span className="text-muted-foreground">Lead: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">12 weeks</span></span>
                                        <span className="text-muted-foreground">Config: <span className="font-mono font-bold text-foreground">Custom</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resolution actions */}
                        {resolution === 'pending' && !editingOverride && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleResolve('accepted')}
                                    className="flex-1 py-2 rounded-lg text-[10px] font-bold border border-green-300 dark:border-green-500/30 bg-green-50 dark:bg-green-500/5 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/10 transition-all"
                                >
                                    Accept Config
                                </button>
                                <button
                                    onClick={() => setEditingOverride(true)}
                                    className="flex-1 py-2 rounded-lg text-[10px] font-bold border border-blue-300 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/10 transition-all"
                                >
                                    Override
                                </button>
                                <button
                                    onClick={() => handleResolve('flagged')}
                                    className="flex-1 py-2 rounded-lg text-[10px] font-bold border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/10 transition-all"
                                >
                                    Flag
                                </button>
                            </div>
                        )}

                        {/* Override edit panel */}
                        {resolution === 'pending' && editingOverride && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
                                <div className="flex items-center gap-1.5 text-[9px] text-indigo-600 dark:text-indigo-400 font-bold">
                                    <SparklesIcon className="h-3 w-3" />
                                    AI-suggested correction
                                </div>
                                <div
                                    contentEditable
                                    suppressContentEditableWarning
                                    className="w-full p-3 rounded-lg text-[11px] text-foreground bg-blue-50/50 dark:bg-blue-500/5 border border-blue-300 dark:border-blue-500/30 leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-400 min-h-[60px]"
                                >
                                    Accept custom configuration with 12-week lead. Add timeline note: delivery window shifts to Week 38. Notify client of adjusted schedule.
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingOverride(false)}
                                        className="flex-1 py-2 rounded-lg text-[10px] font-bold border border-border bg-card text-foreground hover:bg-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleResolve('overridden')}
                                        className="flex-1 py-2 rounded-lg text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <CheckCircleIcon className="h-3 w-3" />
                                        Apply Override
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Resolved indicator */}
                        {resolution !== 'pending' && (
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                <span>Resolution recorded — {resolution === 'accepted' ? 'configuration accepted, lead time confirmed' : resolution === 'overridden' ? 'correction applied' : 'flagged for review'}</span>
                            </div>
                        )}
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

                    {/* Submit */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => nextStep()}
                            disabled={resolution === 'pending'}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                resolution !== 'pending'
                                    ? 'bg-brand-400 text-zinc-900 hover:bg-brand-300 shadow-lg shadow-brand-500/20'
                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                            }`}
                        >
                            {resolution !== 'pending' ? 'Submit to Expert' : 'Resolve Item to Continue'}
                            {resolution !== 'pending' && <ArrowRightIcon className="h-3.5 w-3.5" />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
