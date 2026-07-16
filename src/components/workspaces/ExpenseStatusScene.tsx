/**
 * w1.4 — ExpenseStatusScene
 * Employee mobile view: status timeline → notification arrives → tap → data updates
 *
 * State machine (shared across both scenario modes):
 *   'watching'    — timeline in progress, waiting for next event
 *   'notified'    — notification slides in (Strata AI or Operations Manager Solano rejection)
 *   'updated'     — tap notification → timeline updated + mode-specific content
 *   'fixing'      — (rejected mode only) Fix and Resubmit → re-attachment form (Screen 6)
 *   'resubmitted' — (rejected mode only) Resubmit → success + new timeline
 *
 * Scenario modes (toggle):
 *   'approved' — happy path: CORE posting notification → all steps complete → Paid ✓
 *   'rejected' — return path: rejection notification → rejection card → Fix and Resubmit
 *
 * Pain points resolved: PP9 (no status visibility) · PP10 (one by one report opening)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle2, Clock, Circle, Sparkles, ChevronDown, ChevronLeft, ChevronRight, AlertCircle, Camera, Send } from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import MobileDeviceFrame from '../simulations/MobileDeviceFrame'
import { useDemo } from '../../context/DemoContext'

type SceneState    = 'watching' | 'notified' | 'updated' | 'fixing' | 'resubmitted'
type ScenarioMode  = 'approved' | 'rejected'

// ── Timeline data ─────────────────────────────────────────────────────────────

const TIMELINE_BASE = [
    { label: 'Submitted',        time: 'May 5, 10:32 AM', note: 'Form submitted via mobile',             done: true,  isRejection: false },
    { label: 'Manager Notified', time: 'May 5, 10:33 AM', note: 'Push sent to Operations Manager Solano',            done: true,  isRejection: false },
    { label: 'Approved',         time: 'May 6, 9:15 AM',  note: 'Operations Manager Solano · 1 day · on time ✓',  done: true,  isRejection: false },
    { label: 'In AP Review',     time: 'May 6, 9:16 AM',  note: "Routed to Letza's queue",               done: true,  isRejection: false },
    { label: 'Posted to CORE',   time: 'Pending',          note: '',                                       done: false, isRejection: false },
    { label: 'Payment Issued',   time: 'Pending',          note: '',                                       done: false, isRejection: false },
]

const TIMELINE_UPDATED = [
    { label: 'Submitted',        time: 'May 5, 10:32 AM', note: 'Form submitted via mobile',             done: true, isRejection: false },
    { label: 'Manager Notified', time: 'May 5, 10:33 AM', note: 'Push sent to Operations Manager Solano',            done: true, isRejection: false },
    { label: 'Approved',         time: 'May 6, 9:15 AM',  note: 'Operations Manager Solano · 1 day · on time ✓',  done: true, isRejection: false },
    { label: 'In AP Review',     time: 'May 6, 9:16 AM',  note: "Letza confirmed · GL 6200 + 6210 · auto-posted to CORE", done: true, isRejection: false },
    { label: 'Posted to CORE',   time: 'May 6, 2:48 PM',  note: 'Entry #CR-2847 · no manual re-entry',  done: true, isRejection: false },
    { label: 'Payment Issued',   time: 'May 8, 9:00 AM',  note: 'Check #44821 · 3 days total · within avg ✓', done: true, isRejection: false },
]

const TIMELINE_REJECTED_BASE = [
    { label: 'Submitted',        time: 'May 5, 10:32 AM', note: 'Form submitted via mobile',  done: true,  isRejection: false },
    { label: 'Manager Notified', time: 'May 5, 10:33 AM', note: 'Push sent to Operations Manager Solano', done: true,  isRejection: false },
    { label: 'In Review',        time: 'May 6, 9:15 AM',  note: 'Operations Manager Solano reviewing',    done: true,  isRejection: false },
    { label: 'Returned',         time: 'Pending',          note: 'Receipt unclear — see note', done: false, isRejection: true  },
    { label: 'Posted to CORE',   time: 'Pending',          note: '',                           done: false, isRejection: false },
    { label: 'Payment Issued',   time: 'Pending',          note: '',                           done: false, isRejection: false },
]

const TIMELINE_REJECTED_UPDATED = [
    { label: 'Submitted',        time: 'May 5, 10:32 AM', note: 'Form submitted via mobile',                done: true, isRejection: false },
    { label: 'Manager Notified', time: 'May 5, 10:33 AM', note: 'Push sent to Operations Manager Solano',              done: true, isRejection: false },
    { label: 'In Review',        time: 'May 6, 9:15 AM',  note: 'Operations Manager Solano reviewing',                 done: true, isRejection: false },
    { label: 'Returned',         time: 'May 6, 9:22 AM',  note: 'Receipt unclear — reattach fuel receipt', done: true, isRejection: true  },
    { label: 'Posted to CORE',   time: 'Pending',          note: '',                                        done: false, isRejection: false },
    { label: 'Payment Issued',   time: 'Pending',          note: '',                                        done: false, isRejection: false },
]

const TIMELINE_RESUBMITTED = [
    { label: 'Resubmitted',      time: 'May 6, 9:45 AM', note: 'Corrected fuel receipt attached', done: true,  isRejection: false },
    { label: 'Manager Notified', time: 'May 6, 9:45 AM', note: 'Push sent to Operations Manager Solano',      done: true,  isRejection: false },
    { label: 'Approved',         time: 'Pending',          note: '',                               done: false, isRejection: false },
    { label: 'Posted to CORE',   time: 'Pending',          note: '',                               done: false, isRejection: false },
    { label: 'Payment Issued',   time: 'Pending',          note: '',                               done: false, isRejection: false },
]

const HISTORY = [
    { description: 'Parking',         amount: '$47.00', date: 'Apr 28', status: 'Paid ✓', days: '2.8 days' },
    { description: 'Office Supplies', amount: '$23.00', date: 'Apr 15', status: 'Paid ✓', days: '3.1 days' },
]

// ── Main component ────────────────────────────────────────────────────────────

export default function ExpenseStatusScene({ onBack }: { onBack?: () => void }) {
    const { isPaused, nextStep } = useDemo()
    const isPausedRef = useRef(isPaused)
    isPausedRef.current = isPaused

    const [scene,        setScene]        = useState<SceneState>('watching')
    const [scenarioMode, setScenarioMode] = useState<ScenarioMode>('approved')
    const [expanded,     setExpanded]     = useState<Set<string>>(new Set(['Approved']))
    const [photoState,   setPhotoState]   = useState<'idle' | 'capturing' | 'captured'>('idle')

    const toggleStep = (label: string) => {
        setExpanded(prev => {
            const next = new Set(prev)
            next.has(label) ? next.delete(label) : next.add(label)
            return next
        })
    }

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const tick = () => {
            if (isPausedRef.current) { setTimeout(tick, 100); return }
            if (Date.now() - start >= delay) fn()
            else setTimeout(tick, 100)
        }
        setTimeout(tick, 0)
    }, [])

    useEffect(() => {
        pauseAware(() => setScene('notified'), 1800)
    }, [pauseAware, scenarioMode])

    useEffect(() => {
        if (scene !== 'notified') return
        pauseAware(() => setScene('updated'), 1600)
    }, [scene, pauseAware])

    // Derive the active timeline from mode + scene
    const timeline =
        scenarioMode === 'rejected'
            ? scene === 'resubmitted'           ? TIMELINE_RESUBMITTED
              : scene === 'fixing'              ? TIMELINE_REJECTED_UPDATED
              : scene === 'updated'             ? TIMELINE_REJECTED_UPDATED
              : TIMELINE_REJECTED_BASE
            : scene === 'updated'               ? TIMELINE_UPDATED
            : TIMELINE_BASE

    // Badge label + class derived from mode + scene
    const badgeClass =
        scenarioMode === 'rejected'
            ? scene === 'resubmitted'           ? 'bg-ai/10 text-ai border-ai/20'
              : scene === 'fixing'              ? 'bg-destructive/10 text-destructive border-destructive/20'
              : scene === 'updated'             ? 'bg-destructive/10 text-destructive border-destructive/20'
              : 'bg-warning/10 text-warning border-warning/20'
            : scene === 'updated'               ? 'bg-success/10 text-success border-success/20'
            : 'bg-warning/10 text-warning border-warning/20'

    const badgeLabel =
        scenarioMode === 'rejected'
            ? scene === 'resubmitted'           ? 'Resubmitted ✓'
              : scene === 'fixing'              ? 'Needs Correction'
              : scene === 'updated'             ? 'Returned'
              : 'In Review'
            : scene === 'updated'               ? 'Paid ✓'
            : 'In AP Review'

    return (
        <MobileDeviceFrame>
            {/* Navbar with back button */}
            <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-border bg-background">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-xs font-medium text-ai hover:opacity-80 transition-opacity"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Expenses
                </button>
                <p className="text-xs font-bold text-foreground">Expense Detail</p>
                <div className="w-14" />
            </div>

            <div className="px-4 py-4 space-y-4">
                {/* User context — avatar + name */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-foreground">My Expenses</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Employee Alpha · Sales Rep</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full overflow-hidden border border-border shrink-0">
                            <img
                                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face"
                                alt="Employee Alpha"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Scenario toggle — presenter control */}
                <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Presenter: show both paths</p>
                    <div className="flex gap-1 bg-muted/40 border border-border rounded-xl p-0.5 w-fit">
                        {(['approved', 'rejected'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => { setScenarioMode(m); setScene('watching'); setSelectedRole(null); setPhotoState('idle') }}
                                className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                                    scenarioMode === m
                                        ? m === 'approved'
                                            ? 'bg-success/15 text-success'
                                            : 'bg-destructive/15 text-destructive'
                                        : m === 'rejected'
                                            ? 'text-destructive/50 hover:text-destructive hover:bg-destructive/5'
                                            : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {m === 'approved' ? '✓ Approved path' : '↩ Returned path'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Push notification — slides in after delay */}

                {/* Approved path notification */}
                {scenarioMode === 'approved' && scene === 'notified' && (
                    <div className="animate-in slide-in-from-top duration-500">
                        <div className="flex items-start gap-2.5 bg-card border border-ai/40 rounded-2xl px-3 py-3 shadow-lg">
                            <div className="relative shrink-0 mt-0.5">
                                <div className="h-8 w-8 rounded-xl bg-ai/10 flex items-center justify-center">
                                    <Sparkles className="h-3.5 w-3.5 text-ai" />
                                </div>
                                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-ai border-2 border-card animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-ai uppercase tracking-wide mb-0.5">Strata · Expense update</p>
                                <p className="text-xs font-semibold text-foreground leading-snug">Your expense was posted to the accounting system</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Payment scheduled · full status updated</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rejected path notification */}
                {scenarioMode === 'rejected' && scene === 'notified' && (
                    <div className="animate-in slide-in-from-top duration-500 flex items-start gap-2.5 bg-card border border-destructive/40 rounded-2xl px-3 py-3 shadow-lg">
                        <div className="relative shrink-0 mt-0.5">
                            <div className="h-8 w-8 rounded-xl bg-destructive/10 flex items-center justify-center">
                                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                            </div>
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive border-2 border-card animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-destructive uppercase tracking-wide mb-0.5">Operations Manager Solano · Returned</p>
                            <p className="text-xs font-semibold text-foreground leading-snug">
                                Receipt is unclear — correction needed
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                $95.00 · Mileage · Tolls / Cab / Parking · updating your timeline
                            </p>
                        </div>
                    </div>
                )}

                {/* Rejection card — appears when rejected + updated */}
                {scenarioMode === 'rejected' && scene === 'updated' && (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-3 space-y-2 animate-in fade-in duration-300">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-destructive">Returned by Operations Manager Solano</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Receipt is unclear — please reattach the Fuel receipt with the full amount visible.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setScene('fixing')}
                            className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Fix and Resubmit
                        </button>
                    </div>
                )}

                {/* Screen 6 — Re-attachment form (brief spec) */}
                {scenarioMode === 'rejected' && scene === 'fixing' && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                        {/* Header */}
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                            <p className="text-[10px] font-bold text-destructive uppercase tracking-wide">Your expense — needs correction</p>
                        </div>

                        {/* Rejection note */}
                        <div className="bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2.5">
                            <p className="text-[10px] font-semibold text-destructive mb-0.5">Operations Manager Solano wrote:</p>
                            <p className="text-[10px] text-muted-foreground italic">
                                "Receipt is unclear — please reattach the Fuel receipt with the full amount visible."
                            </p>
                        </div>

                        {/* Line that needs correction */}
                        <div className="bg-destructive/8 border border-destructive/30 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-destructive/15 flex items-center justify-center shrink-0">
                                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-destructive">Fuel · $95.00</p>
                                <p className="text-[10px] text-destructive/70">Receipt unclear — reattach required</p>
                            </div>
                            <span className="text-[9px] bg-destructive/10 text-destructive border border-destructive/20 px-1.5 py-0.5 rounded-full font-bold shrink-0">Action needed</span>
                        </div>

                        {/* Re-attach camera — 3 states: idle → capturing → captured */}
                        {photoState === 'idle' && (
                            <button
                                onClick={() => {
                                    setPhotoState('capturing')
                                    setTimeout(() => setPhotoState('captured'), 1800)
                                }}
                                className="w-full border-2 border-dashed border-destructive/30 rounded-xl p-4 flex flex-col items-center gap-2 bg-destructive/5 hover:border-destructive/50 hover:bg-destructive/8 transition-all"
                            >
                                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <Camera className="h-5 w-5 text-destructive/70" />
                                </div>
                                <p className="text-xs font-semibold text-foreground">Tap to re-attach corrected receipt</p>
                                <p className="text-[10px] text-muted-foreground">Camera · Gallery · JPG, PNG, PDF</p>
                            </button>
                        )}

                        {photoState === 'capturing' && (
                            <div className="border-2 border-foreground/20 rounded-xl overflow-hidden animate-in fade-in duration-200">
                                <div className="bg-zinc-900 h-32 flex flex-col items-center justify-center gap-2 relative">
                                    <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-white/60 rounded-tl-sm" />
                                    <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-white/60 rounded-tr-sm" />
                                    <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-white/60 rounded-bl-sm" />
                                    <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-white/60 rounded-br-sm" />
                                    <div className="absolute inset-x-6 h-0.5 bg-primary/80 animate-bounce" style={{ top: '50%' }} />
                                    <Camera className="h-5 w-5 text-white/30" />
                                </div>
                                <div className="bg-zinc-950 px-3 py-2 flex items-center justify-center gap-2">
                                    <Sparkles className="h-3 w-3 text-ai animate-pulse" />
                                    <p className="text-[10px] text-white/70 font-medium">Scanning receipt — hold steady</p>
                                </div>
                            </div>
                        )}

                        {photoState === 'captured' && (
                            <div className="space-y-2 animate-in fade-in duration-300">
                                {/* Compact receipt preview */}
                                <div className="border border-success/30 bg-card rounded-xl overflow-hidden shadow-sm">
                                    <div className="bg-zinc-800 px-3 py-2 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-white tracking-tight">SUNCOAST FUEL SERVICES</p>
                                            <p className="text-[9px] text-muted-foreground">Fuel Receipt · May 5, 2026 · #TX-2847</p>
                                        </div>
                                        <p className="text-[12px] font-bold text-white font-mono">$95.00</p>
                                    </div>
                                    <div className="px-3 py-2 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-foreground font-medium">Premium Unleaded · 11.8 gal</p>
                                            <p className="text-[9px] text-muted-foreground font-mono">Auth: 029441 · Visa ···· 4892</p>
                                        </div>
                                        <span className="text-[9px] font-bold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded-full shrink-0">APPROVED ✓</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between px-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                        <p className="text-[11px] font-semibold text-success">Receipt captured · image quality: good</p>
                                    </div>
                                    <button
                                        onClick={() => setPhotoState('idle')}
                                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                                    >
                                        Retake
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Note to manager */}
                        <div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Note to manager <span className="normal-case font-normal">(optional)</span></p>
                            <textarea
                                key={photoState}
                                defaultValue={photoState === 'captured' ? "Here's the corrected receipt — full amount visible this time. Sorry for the trouble." : ''}
                                placeholder="Add context for Sarah (e.g. 'Attached cleaner scan of the fuel receipt')"
                                className="w-full border border-border rounded-xl px-3 py-2.5 text-xs text-foreground bg-background resize-none h-16 focus:outline-none focus:ring-1 focus:ring-destructive/40 placeholder:text-muted-foreground/60"
                            />
                        </div>

                        {/* Resubmit button — enabled only after photo captured */}
                        <button
                            onClick={() => setScene('resubmitted')}
                            disabled={photoState !== 'captured'}
                            className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                        >
                            <Send className="h-3.5 w-3.5" />
                            {photoState === 'captured' ? 'Resubmit for Approval' : 'Attach receipt to resubmit'}
                        </button>
                    </div>
                )}

                {/* Resubmitted confirmation — appears after Fix and Resubmit */}
                {scenarioMode === 'rejected' && scene === 'resubmitted' && (
                    <div className="bg-success/5 border border-success/20 rounded-xl px-3 py-3 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-success">Resubmitted ✓</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Corrected receipt attached · Operations Manager Solano notified
                                </p>
                            </div>
                        </div>
                    </div>
                )}


                {/* Continue demo — rejected + resubmitted: presenter control to advance */}
                {scenarioMode === 'rejected' && scene === 'resubmitted' && (
                    <button
                        onClick={nextStep}
                        className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground py-2 hover:text-foreground transition-colors"
                    >
                        Continue demo <ChevronRight className="h-3 w-3" />
                    </button>
                )}

                {/* Current expense — status timeline */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="text-sm font-bold text-foreground">Mileage · Tolls / Cab / Parking</p>
                            <p className="text-[11px] text-muted-foreground">$95.00 · May 5 · 1 receipt</p>
                        </div>
                        <span className={`text-[10px] border px-2 py-0.5 rounded-full font-medium shrink-0 transition-all duration-500 ${badgeClass}`}>
                            {badgeLabel}
                        </span>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-0">
                        {timeline.map((step, i) => {
                            const isOpen = expanded.has(step.label)
                            const hasNote = !!step.note
                            return (
                                <div key={step.label} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        {step.done && !step.isRejection && (
                                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5 animate-in zoom-in duration-300" />
                                        )}
                                        {step.done && step.isRejection && (
                                            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5 animate-in zoom-in duration-300" />
                                        )}
                                        {!step.done && !step.isRejection && (
                                            <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                                        )}
                                        {!step.done && step.isRejection && (
                                            <AlertCircle className="h-4 w-4 text-destructive/40 shrink-0 mt-0.5" />
                                        )}
                                        {i < timeline.length - 1 && (
                                            <div className={`w-px flex-1 mt-1 mb-1 min-h-[16px] transition-colors duration-500 ${
                                                step.done && !step.isRejection ? 'bg-success/30'
                                                : step.done && step.isRejection ? 'bg-destructive/30'
                                                : 'bg-border'
                                            }`} />
                                        )}
                                    </div>
                                    <div className="pb-3 flex-1 min-w-0">
                                        <button
                                            onClick={() => hasNote && toggleStep(step.label)}
                                            className={`w-full flex items-center justify-between gap-2 text-left ${hasNote ? 'cursor-pointer' : 'cursor-default'}`}
                                        >
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className={`text-xs font-semibold transition-colors duration-300 ${
                                                    step.done && step.isRejection ? 'text-destructive'
                                                    : step.done ? 'text-foreground'
                                                    : 'text-muted-foreground/50'
                                                }`}>
                                                    {step.label}
                                                </p>
                                                <span className={`text-[10px] transition-colors duration-300 ${step.done ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
                                                    {step.time}
                                                </span>
                                            </div>
                                            {hasNote && (
                                                <ChevronDown className={`h-3 w-3 shrink-0 text-muted-foreground/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                            )}
                                        </button>
                                        {isOpen && hasNote && (
                                            <p className="text-[10px] text-muted-foreground mt-1 animate-in fade-in duration-200">
                                                {step.note}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-border">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-[11px] text-muted-foreground">
                            {scenarioMode === 'approved' && scene === 'updated'
                                ? <>Total: <span className="text-foreground font-medium">3 days</span> · within avg · <span className="text-success font-medium">On time ✓</span></>
                                : <>Avg payment: <span className="text-foreground font-medium">3.2 days</span> · 3-day turnaround</>
                            }
                        </p>
                    </div>
                </div>

                {/* Watching state — subtle live indicator */}
                {scene === 'watching' && (
                    <div className="flex items-center justify-center gap-2 py-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-ai animate-pulse" />
                        <p className="text-[10px] text-muted-foreground/60">Live · updating in real time</p>
                    </div>
                )}

                {/* Expense history */}
                <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Previous</p>
                    {HISTORY.map(h => (
                        <div key={h.description} className="bg-card border border-border rounded-xl px-3 py-2.5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-foreground">{h.description}</p>
                                <p className="text-[10px] text-muted-foreground">{h.date} · {h.days}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-foreground">{h.amount}</p>
                                <p className="text-[10px] text-success font-medium">{h.status}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* AS-IS contrast */}
                <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground">
                        <span className="font-medium text-foreground">Before Strata:</span> employees called AP to ask where their expense stood. No tracker, no timestamps, no payment ETA.
                    </p>
                </div>
            </div>

            <div className="px-4 pb-2 pt-2 space-y-3">
                <button
                    onClick={nextStep}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                </button>
                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
            </div>
        </MobileDeviceFrame>
    )
}
