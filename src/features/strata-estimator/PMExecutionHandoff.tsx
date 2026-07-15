// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — PM Execution Handoff
// v8 · w2.3 · Senior Project Manager receives the approved quote and builds
// the internal execution plan (crews, delivery windows, tools, logistics,
// hospital-campus protocol). Replaces the v7 ClientProposalDelivery — this
// view is fully INTERNAL, no client rep, no client-facing PDF.
//
// Beat timeline:
//   email-received  → approved quote + project context land on James's desk
//   planning        → execution planning card reveals with crew/tool/logistics
//   accepting       → James "accepts for execution" (cursor simulated)
//   queued          → final state · "Execution queued · crews assigned"
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import {
    ArrowRight,
    Building2,
    Check,
    CheckCircle2,
    ClipboardList,
    Clock,
    HardHat,
    Hammer,
    Mail,
    RotateCcw,
    ShieldCheck,
    Sparkles,
    Truck,
    Users,
    Wrench,
} from 'lucide-react'

type HandoffPhase = 'email-received' | 'planning' | 'accepting' | 'queued'

interface PMExecutionHandoffProps {
    proposalPrice: string
    clientName: string
    approvedBy: string
    approvedAt: number
    onRestart: () => void
    onAccepted?: () => void
}

interface PlanningRow {
    icon: typeof Users
    label: string
    value: string
    detail?: string
    aiHighlight?: boolean
}

function formatElapsed(ts: number): string {
    const seconds = Math.max(0, Math.round((Date.now() - ts) / 1000))
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.round(seconds / 60)
    return `${minutes}m ago`
}

function formatTimestamp(ts: number): string {
    return new Date(ts).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function PMExecutionHandoff({
    proposalPrice,
    clientName,
    approvedBy,
    approvedAt,
    onRestart,
    onAccepted,
}: PMExecutionHandoffProps) {
    const [phase, setPhase] = useState<HandoffPhase>('email-received')
    const [acceptedAt, setAcceptedAt] = useState<number | null>(null)

    // Build the execution plan rows from the project context. In v8 these
    // values will be driven by the ProjectContextPanel; for Paso C we hard-code
    // the JPS-specific plan.
    const planningRows: PlanningRow[] = [
        {
            icon: Clock,
            label: 'Delivery window',
            value: 'Weeks 8-10 · 3-day install',
            detail: 'Aligned with JPS facilities opening schedule',
        },
        {
            icon: Users,
            label: 'Crew assignment',
            value: 'Lead installer + 3 assistants',
            detail: '185 hrs ÷ 3 days ÷ 8h = 4-person team',
            aiHighlight: true,
        },
        {
            icon: Wrench,
            label: 'Tools & equipment',
            value: 'Full install kit + lift gate',
            detail: 'Dollies, 2-wheelers, cordless drills, Allen wrench set, PPE',
        },
        {
            icon: Truck,
            label: 'Transport',
            value: 'Dallas → Fort Worth · 32 mi',
            detail: '1 truck, no mileage surcharge (under 50 mi)',
        },
        {
            icon: Building2,
            label: 'Site protocol',
            value: 'Hospital campus · no loading dock',
            detail: 'Badge approval + security briefing required before dock workaround',
            aiHighlight: true,
        },
        {
            icon: HardHat,
            label: 'Special assembly',
            value: 'OFS Serpentine 12-seat lounge',
            detail: '2-person assembly team · 14 hrs aligned with designer validation',
            aiHighlight: true,
        },
    ]

    // Beat timeline · email-received → planning (auto)
    useEffect(() => {
        if (phase !== 'email-received') return
        const timer = setTimeout(() => setPhase('planning'), 1400)
        return () => clearTimeout(timer)
    }, [phase])

    // Beat timeline · accepting → queued (auto)
    useEffect(() => {
        if (phase !== 'accepting') return
        const timer = setTimeout(() => {
            setAcceptedAt(Date.now())
            setPhase('queued')
            onAccepted?.()
        }, 1600)
        return () => clearTimeout(timer)
    }, [phase, onAccepted])

    const handleAcceptClick = () => {
        if (phase !== 'planning') return
        setPhase('accepting')
    }

    return (
        <div className="space-y-6">
            {/* ═══ CORE EMAIL NOTIFICATION ══════════════════════════════════ */}
            <div
                className={clsx(
                    'rounded-2xl border overflow-hidden transition-all duration-500',
                    phase === 'email-received'
                        ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/30 animate-in fade-in slide-in-from-top-2'
                        : 'bg-card dark:bg-zinc-800 border-border'
                )}
            >
                <div className="flex items-start gap-3 px-5 py-4">
                    <div
                        className={clsx(
                            'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                            phase === 'email-received'
                                ? 'bg-indigo-500/15'
                                : 'bg-muted/60'
                        )}
                    >
                        <Mail
                            className={clsx(
                                'w-5 h-5',
                                phase === 'email-received'
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-muted-foreground'
                            )}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider leading-none text-indigo-600 dark:text-indigo-400">
                            CORE · Execution handoff
                        </p>
                        <p className="text-sm font-bold text-foreground leading-tight mt-1 truncate">
                            {clientName} — ${proposalPrice}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                            Released by {approvedBy} · {formatElapsed(approvedAt)} ·{' '}
                            {formatTimestamp(approvedAt)}
                        </p>
                    </div>
                    <div className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Inbox
                    </div>
                </div>
                <div className="px-5 py-3 bg-muted/30 border-t border-border text-[11px] text-muted-foreground italic">
                    James, the JPS Health Network quote just cleared the internal
                    release checklist. 185 budgeted man-hours, hospital campus, 119
                    KD chairs plus the custom OFS Serpentine. Please build the
                    execution plan and confirm crew availability for weeks 8–10.
                </div>
            </div>

            {/* ═══ EXECUTION PLANNING CARD ══════════════════════════════════ */}
            {(phase === 'planning' ||
                phase === 'accepting' ||
                phase === 'queued') && (
                <div
                    className={clsx(
                        'bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-500',
                        phase === 'planning'
                            ? 'animate-in fade-in slide-in-from-bottom-2'
                            : ''
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/30">
                        <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <ClipboardList className="w-4 h-4 text-foreground dark:text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                                Execution plan · JPS Health Network
                            </p>
                            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
                                Generated from approved quote + project context
                            </p>
                        </div>
                        <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            <Sparkles className="w-3 h-3" />
                            AI drafted
                        </span>
                    </div>

                    {/* Planning rows · 3-column card grid · shaded cells */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-3 bg-muted/10 dark:bg-zinc-900/40 auto-rows-fr">
                        {planningRows.map((row) => {
                            const Icon = row.icon
                            return (
                                <div
                                    key={row.label}
                                    className={clsx(
                                        'flex flex-col h-full rounded-xl border p-3 transition-all',
                                        row.aiHighlight
                                            ? 'bg-primary/5 dark:bg-primary/10 border-primary/30 ring-1 ring-primary/20'
                                            : 'bg-card dark:bg-zinc-800 border-border'
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={clsx(
                                                'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
                                                row.aiHighlight
                                                    ? 'bg-primary/20 text-foreground dark:text-primary'
                                                    : 'bg-muted/60 text-muted-foreground'
                                            )}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <p className="flex-1 min-w-0 text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">
                                            {row.label}
                                        </p>
                                        {row.aiHighlight && (
                                            <span className="shrink-0 flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wider text-foreground dark:text-primary">
                                                <Sparkles className="w-2 h-2" />
                                                AI
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[13px] font-bold text-foreground leading-snug mt-2">
                                        {row.value}
                                    </p>
                                    {row.detail && (
                                        <p className="text-[10px] text-muted-foreground leading-snug mt-1">
                                            {row.detail}
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Footer actions */}
                    {phase === 'planning' && (
                        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
                            <button
                                type="button"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <Hammer className="w-3.5 h-3.5" />
                                Flag for review
                            </button>
                            <button
                                type="button"
                                onClick={handleAcceptClick}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Accept for execution
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {/* Accepting state */}
                    {phase === 'accepting' && (
                        <div className="flex items-center justify-center gap-3 px-6 py-5 border-t border-border bg-muted/20">
                            <span className="inline-flex w-5 h-5 items-center justify-center">
                                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </span>
                            <p className="text-xs font-semibold text-foreground">
                                Queuing JPS for execution · assigning crews…
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ QUEUED SUCCESS STATE ═════════════════════════════════════ */}
            {phase === 'queued' && (
                <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    <div className="px-6 py-6 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
                            <Check
                                className="w-8 h-8 text-green-600 dark:text-green-400"
                                strokeWidth={3}
                            />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mt-4">
                            Project queued for execution
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            ${proposalPrice} · JPS Health Center for Women · crews
                            assigned
                        </p>
                        {acceptedAt && (
                            <p className="text-[10px] text-muted-foreground/80 mt-1 font-mono">
                                {formatTimestamp(acceptedAt)} · tracking #WRG-
                                {acceptedAt.toString().slice(-6)}
                            </p>
                        )}
                    </div>

                    {/* Tracking bar */}
                    <div className="px-6 pb-5">
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'Queued', state: 'done' as const },
                                { label: 'Crews notified', state: 'done' as const },
                                { label: 'Kickoff call', state: 'pending' as const },
                            ].map((step) => (
                                <div
                                    key={step.label}
                                    className="rounded-xl bg-muted/40 px-3 py-2.5 flex items-center gap-2"
                                >
                                    {step.state === 'done' ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                                    ) : (
                                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
                                            {step.label}
                                        </p>
                                        <p className="text-[10px] text-foreground leading-tight mt-0.5 truncate">
                                            {step.state === 'done'
                                                ? 'Just now'
                                                : 'Scheduled'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Restart */}
                    <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-border bg-muted/20">
                        <button
                            type="button"
                            onClick={onRestart}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Start new estimate
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
