// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Designer Task Notification
// v7 · w1.2 preamble · Dupler-style inline card
//
// Adapted from src/components/simulations/DuplerPdfProcessor.tsx lines
// 1999-2040 ("PMX Specification Ready for Pricing" notification) so the
// visual language matches the rest of the Strata demos.
//
// Renders inline at the top of the ESTIMATOR tab in w1.2 (before the user
// acknowledges the task). Once clicked, the parent Shell flips a gate and
// DesignerVerificationOverlay slides in from the right.
// ═══════════════════════════════════════════════════════════════════════════════

import { ArrowRight, CheckCircle, Send, ShieldCheck } from 'lucide-react'
import type { HandoffPerson } from './RoleHandoffTransition'

interface DesignerTaskNotificationProps {
    fromUser: HandoffPerson
    taskTitle: string
    taskSummary: string
    onOpen: () => void
}

export default function DesignerTaskNotification({
    fromUser,
    taskTitle,
    taskSummary,
    onOpen,
}: DesignerTaskNotificationProps) {
    return (
        <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-5 bg-primary/5 dark:bg-primary/10 border-l-4 border-primary ring-1 ring-primary/20 rounded-r-2xl">
                <div className="flex items-start gap-4">

                    {/* Sender avatar with send-badge (Dupler pattern) */}
                    <div className="relative shrink-0">
                        <img
                            src={fromUser.photo}
                            alt={fromUser.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/40"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center ring-2 ring-card dark:ring-zinc-800">
                            <Send className="h-2.5 w-2.5 text-primary-foreground" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Title + "Just now" pulse pill */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-foreground">
                                {taskTitle}
                            </span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold animate-pulse">
                                Just now
                            </span>
                        </div>

                        {/* Sender line */}
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="font-bold text-foreground">
                                {fromUser.name}
                            </span>{' '}
                            ({fromUser.role}) · {taskSummary}
                        </p>

                        {/* Status chip row */}
                        <div className="flex items-center gap-2 flex-wrap mt-3 mb-2">
                            <span className="text-[8px] font-bold px-2 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 ring-2 ring-amber-500/20 shadow-sm shadow-amber-500/10">
                                <CheckCircle className="h-3 w-3" />
                                CUSTOM ITEM FLAGGED
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                                →
                            </span>
                            <span className="text-[8px] font-bold px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                DESIGNER VERIFICATION
                            </span>
                        </div>

                        {/* Secondary chip */}
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-700 dark:text-green-400 font-bold border border-green-500/30">
                                ROUTED BY EXPERT
                            </span>
                        </div>
                    </div>

                    {/* Primary CTA — prominent pill, right-aligned on lg+, stacks on mobile */}
                    <button
                        type="button"
                        onClick={onOpen}
                        className="shrink-0 self-center flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 ring-2 ring-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/50"
                    >
                        Click to review
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
