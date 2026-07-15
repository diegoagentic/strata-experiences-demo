/**
 * OrderStagePipeline · 10-stage Asly N8 pipeline grouped in 3 phases (C6 + D5b)
 *
 * Per UX consensus: 10 horizontal steps overflow at 1280px and shrink labels
 * below readable size. Group into 3 collapsible phases with progressive
 * disclosure — matches Asly's mental model "intake · make · fulfill".
 *
 * Phases:
 *   1. Pre-Production: PO revised · preview · peer review · order entered · order approved
 *   🚪 Deposit-received gate (per Asly N2: production cannot start until deposit)
 *   2. Production: scheduled · in production · quality control
 *   3. Post-Production: ready to ship · shipped · delivered
 *
 * Default view: 3 phase chips inline with current sub-step. Click expands the
 * full stage strip for the active phase.
 */

import { useState } from 'react'
import {
    Check,
    ChevronDown,
    Lock,
    DollarSign,
    Factory,
    PackageCheck,
    Edit3,
    Eye,
    FileInput,
    ClipboardCheck,
    CalendarClock,
    Wrench,
    ShieldCheck,
    PackageOpen,
    Truck,
    MapPin,
} from 'lucide-react'
import {
    type OrderStageId,
    ORDER_STAGE_LABELS,
    ORDER_STAGE_PHASES,
    getStageIndex as sotGetStageIndex,
} from '../../lib/orderLifecycle'

// Re-export for backward compat with consumers that imported StageId from here.
export type StageId = OrderStageId

interface Stage {
    id: OrderStageId
    label: string
    icon: typeof Check
}

interface Phase {
    id: 'pre-production' | 'production' | 'post-production'
    label: string
    icon: typeof Check
    stages: Stage[]
}

// Icon-only local map · labels + ordering come from SOT.
const STAGE_ICONS: Record<OrderStageId, typeof Check> = {
    'po-received': FileInput,
    'po-reviewed': Eye,
    'order-entered': Edit3,
    'order-approved': ClipboardCheck,
    'scheduled': CalendarClock,
    'in-production': Wrench,
    'quality-control': ShieldCheck,
    'ready-to-ship': PackageOpen,
    'shipped': Truck,
    'delivered': MapPin,
}

const PHASE_META: Array<{ id: Phase['id']; label: string; icon: typeof Check; stageIds: readonly OrderStageId[] }> = [
    { id: 'pre-production', label: 'Pre-Production', icon: FileInput, stageIds: ORDER_STAGE_PHASES.preProduction },
    { id: 'production', label: 'Production', icon: Factory, stageIds: ORDER_STAGE_PHASES.production },
    { id: 'post-production', label: 'Post-Production', icon: PackageCheck, stageIds: ORDER_STAGE_PHASES.postProduction },
]

const PHASES: Phase[] = PHASE_META.map(meta => ({
    id: meta.id,
    label: meta.label,
    icon: meta.icon,
    stages: meta.stageIds.map(id => ({ id, label: ORDER_STAGE_LABELS[id], icon: STAGE_ICONS[id] })),
}))

interface OrderStagePipelineProps {
    /** Stage ID the order is currently at. */
    currentStage: OrderStageId
    /** Whether deposit has been received (controls gate between pre-prod and prod). */
    depositReceived?: boolean
    /** Optional: number of days delayed (renders an amber overlay chip on the affected stage). */
    delayDays?: number
    /** Optional: stage ID where the delay surfaces (defaults to currentStage when delayDays > 0). */
    delayedStageId?: OrderStageId
}

function getPhaseOfStage(stageId: OrderStageId): Phase['id'] {
    for (const phase of PHASES) {
        if (phase.stages.some(s => s.id === stageId)) return phase.id
    }
    return 'pre-production'
}

function stageStatus(stageId: OrderStageId, currentStage: OrderStageId): 'completed' | 'current' | 'upcoming' {
    const cur = sotGetStageIndex(currentStage)
    const idx = sotGetStageIndex(stageId)
    if (idx < cur) return 'completed'
    if (idx === cur) return 'current'
    return 'upcoming'
}

function phaseStatus(phaseId: Phase['id'], currentStage: OrderStageId): 'completed' | 'current' | 'upcoming' {
    const currentPhase = getPhaseOfStage(currentStage)
    if (currentPhase === phaseId) return 'current'
    const phaseOrder: Phase['id'][] = ['pre-production', 'production', 'post-production']
    const phaseIdx = phaseOrder.indexOf(phaseId)
    const curIdx = phaseOrder.indexOf(currentPhase)
    return phaseIdx < curIdx ? 'completed' : 'upcoming'
}

function PhaseChip({
    phase,
    status,
    expanded,
    onClick,
    locked,
}: {
    phase: Phase
    status: 'completed' | 'current' | 'upcoming'
    expanded: boolean
    onClick: () => void
    locked?: boolean
}) {
    const PhaseIcon = phase.icon
    const toneClass =
        locked
            ? 'border-border bg-muted/40 text-muted-foreground'
            : status === 'completed'
                ? 'border-success/30 bg-success/5 text-success'
                : status === 'current'
                    ? 'border-primary bg-primary/15 text-foreground'
                    : 'border-border bg-card text-muted-foreground'

    return (
        <button
            type="button"
            onClick={onClick}
            aria-expanded={expanded}
            disabled={locked}
            className={`flex-1 inline-flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-70 hover:bg-muted/60 ${toneClass}`}
        >
            <div className="flex items-center gap-2 min-w-0">
                {locked ? (
                    <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                ) : status === 'completed' ? (
                    <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                ) : (
                    <PhaseIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider">{phase.label}</span>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
    )
}

export default function OrderStagePipeline({ currentStage, depositReceived = true, delayDays, delayedStageId }: OrderStagePipelineProps) {
    const resolvedDelayStage: OrderStageId | undefined = delayDays && delayDays > 0 ? (delayedStageId ?? currentStage) : undefined
    const currentPhase = getPhaseOfStage(currentStage)
    const [expanded, setExpanded] = useState<Phase['id'] | null>(currentPhase)

    const productionLocked = !depositReceived

    return (
        <section aria-label="Order pipeline" className="rounded-xl border border-border bg-card overflow-hidden">
            <header className="px-5 py-3 border-b border-border bg-card flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                    <Factory className="h-4 w-4 text-foreground" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">Order pipeline</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Intake · make · fulfill · 10 stages grouped by phase
                    </p>
                </div>
                {!depositReceived && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/30">
                        <Lock className="h-3 w-3" aria-hidden="true" />
                        Deposit pending · production gated
                    </span>
                )}
            </header>

            <div className="p-4 space-y-3">
                {/* Phase chips · row */}
                <div className="flex items-stretch gap-2 flex-wrap">
                    <PhaseChip
                        phase={PHASES[0]}
                        status={phaseStatus('pre-production', currentStage)}
                        expanded={expanded === 'pre-production'}
                        onClick={() => setExpanded(e => (e === 'pre-production' ? null : 'pre-production'))}
                    />

                    {/* Deposit gate between Pre-Prod and Production */}
                    <div
                        aria-hidden={depositReceived ? undefined : 'true'}
                        className={`flex items-center gap-1 px-2 rounded-lg border ${depositReceived ? 'border-success/30 bg-success/5 text-success' : 'border-warning/40 bg-warning/10 text-warning'}`}
                    >
                        <DollarSign className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                            {depositReceived ? 'Deposit ✓' : 'Deposit gate'}
                        </span>
                    </div>

                    <PhaseChip
                        phase={PHASES[1]}
                        status={phaseStatus('production', currentStage)}
                        expanded={expanded === 'production'}
                        onClick={() => setExpanded(e => (e === 'production' ? null : 'production'))}
                        locked={productionLocked}
                    />

                    <PhaseChip
                        phase={PHASES[2]}
                        status={phaseStatus('post-production', currentStage)}
                        expanded={expanded === 'post-production'}
                        onClick={() => setExpanded(e => (e === 'post-production' ? null : 'post-production'))}
                    />
                </div>

                {/* Expanded phase · stage strip */}
                {expanded && (
                    <div className="rounded-lg border border-border bg-muted/20 p-3 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            {PHASES.find(p => p.id === expanded)!.stages.map((stage, idx, arr) => {
                                const status = stageStatus(stage.id, currentStage)
                                const StageIcon = stage.icon
                                const isDelayed = resolvedDelayStage === stage.id
                                const dotClass = isDelayed
                                    ? 'bg-warning/15 text-warning border-warning'
                                    : status === 'completed'
                                        ? 'bg-success text-primary-foreground border-success'
                                        : status === 'current'
                                            ? 'bg-primary text-primary-foreground border-primary animate-pulse'
                                            : 'bg-card text-muted-foreground border-border'
                                const lineClass =
                                    status === 'completed' ? 'bg-success' : status === 'current' ? 'bg-primary/50' : 'bg-border'
                                return (
                                    <div key={stage.id} className="flex items-center gap-2 flex-1 min-w-[110px]">
                                        <div className="flex flex-col items-center gap-1.5 min-w-[88px]">
                                            <div className="relative">
                                                <div className={`h-7 w-7 rounded-full border-2 flex items-center justify-center ${dotClass}`}>
                                                    {status === 'completed' && !isDelayed ? (
                                                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                                    ) : (
                                                        <StageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                                    )}
                                                </div>
                                                {isDelayed && (
                                                    <span
                                                        title={`Delayed +${delayDays} days`}
                                                        className="absolute -top-1.5 -right-2 inline-flex items-center px-1 py-px rounded-full text-[8px] font-bold bg-warning text-primary-foreground border border-warning"
                                                    >
                                                        +{delayDays}d
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${isDelayed ? 'text-warning' : status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                {stage.label}
                                            </span>
                                        </div>
                                        {idx < arr.length - 1 && (
                                            <div className={`h-0.5 flex-1 ${lineClass}`} aria-hidden="true" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
