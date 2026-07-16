/**
 * COMPONENT: DesignerDetailModal
 * PURPOSE: Per-designer drill-in modal opened from Dashboard CapacityHeatmap or
 *          from IntakeAssignPanel. Shows profile + active projects + KPIs +
 *          areas + optional "Assign to MANATT" CTA when in intake step.
 *
 * Sidebar-aware: respects DemoSidebar `pl-80` like the main review modal.
 *
 * DS TOKENS: bg-card · bg-muted · bg-success/X · bg-warning/X · text-foreground ·
 *            text-muted-foreground · text-primary
 */

import { Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    X, Briefcase, Clock, AlertTriangle, TrendingUp, MapPin, Award, UserCheck, CheckCircle2,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { type DesignerProfile, regionLabel, seniorityClass, computeCapacity } from './designerProfiles'

interface Props {
    isOpen: boolean
    onClose: () => void
    designer: DesignerProfile | null
    /** When set, shows "Assign to MANATT" CTA (passed from Dashboard during intake) */
    canAssignToMANATT?: boolean
    onAssignToMANATT?: () => void
}

const STAGE_BADGE: Record<string, string> = {
    'Intake':         'bg-ai/10 text-ai border-ai/20',
    'Design':         'bg-info/10 text-info border-info/20',
    'Spec Check':     'bg-warning/10 text-warning border-warning/20',
    'Submission':     'bg-primary/10 text-primary border-primary/20',
    'Acknowledgment': 'bg-success/10 text-success border-success/20',
}

export default function DesignerDetailModal({
    isOpen, onClose, designer, canAssignToMANATT = false, onAssignToMANATT,
}: Props) {
    const { isSidebarCollapsed, isDemoActive } = useDemo()
    const leftOffset = isDemoActive && !isSidebarCollapsed ? 'left-80' : 'left-0'

    if (!designer) return null

    const { name, region, seniority, yearsAtOW, utilization, projects, areas, kpis, priorMANATT, isLead } = designer
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    const totalProjects = projects.largeProjects + projects.mediumProjects + projects.smallProjects
    const utilizationColor = utilization >= 85 ? 'text-destructive' : utilization >= 60 ? 'text-warning' : 'text-success'

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[210]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-200"  leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className={`fixed top-0 ${leftOffset} right-0 bottom-0 bg-black/50 backdrop-blur-sm`} />
                </TransitionChild>

                <div className={`fixed top-0 ${leftOffset} right-0 bottom-0 overflow-y-auto`}>
                    <div className="flex min-h-full items-center justify-center p-3">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-card text-left shadow-2xl border border-border flex flex-col max-h-[calc(100vh-1.5rem)]">
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-4 shrink-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 text-lg font-bold">
                                            {initials}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-lg font-semibold text-foreground">{name}</h3>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${seniorityClass(seniority)}`}>
                                                    {seniority}
                                                </span>
                                                {isLead && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary text-primary-foreground">
                                                        Region Lead
                                                    </span>
                                                )}
                                                {priorMANATT && (
                                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-success/10 text-success border border-success/20">
                                                        Prior MANATT
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {regionLabel(region)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {yearsAtOW} years at OW
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        aria-label="Close"
                                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5 bg-muted/10">
                                    {/* Top row: utilization + project totals */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <div className="bg-card border border-border rounded-xl p-3">
                                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Utilization</div>
                                            <div className={`text-2xl font-semibold tabular-nums ${utilizationColor}`}>{utilization}%</div>
                                            <div className="text-[10px] text-muted-foreground mt-0.5">
                                                {(() => {
                                                    const c = computeCapacity(designer)
                                                    return `${c.committedHours}h committed · ${c.availableHours}h available · ${c.freeHours}h free`
                                                })()}
                                            </div>
                                        </div>
                                        <div className="bg-card border border-border rounded-xl p-3">
                                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Active</div>
                                            <div className="text-2xl font-semibold text-foreground tabular-nums">{projects.active.length}</div>
                                            <div className="text-[10px] text-muted-foreground mt-0.5">in-flight projects</div>
                                        </div>
                                        <div className="bg-card border border-border rounded-xl p-3">
                                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">YTD Completed</div>
                                            <div className="text-2xl font-semibold text-foreground tabular-nums">{projects.completedYTD}</div>
                                            <div className="text-[10px] text-muted-foreground mt-0.5">{totalProjects} all-time</div>
                                        </div>
                                        <div className="bg-card border border-border rounded-xl p-3">
                                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">YTD Value</div>
                                            <div className="text-2xl font-semibold text-foreground tabular-nums">${(projects.totalValueYTD / 1_000_000).toFixed(1)}M</div>
                                            <div className="text-[10px] text-muted-foreground mt-0.5">List total</div>
                                        </div>
                                    </div>

                                    {/* Two-column body */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                        {/* LEFT: Active projects */}
                                        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                Active projects
                                            </h4>
                                            {projects.active.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic">No active projects · available for new assignment</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {projects.active.map(p => (
                                                        <div key={p.code} className="border border-border rounded-lg p-3 space-y-1.5">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-bold text-foreground">{p.code}</span>
                                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STAGE_BADGE[p.stage] ?? 'bg-muted text-muted-foreground'}`}>
                                                                    {p.stage}
                                                                </span>
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground truncate">{p.client}</div>
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-muted-foreground">${p.value.toLocaleString()}</span>
                                                                <span className="tabular-nums text-muted-foreground">{p.progress}%</span>
                                                            </div>
                                                            <div className="h-1 rounded-full bg-muted overflow-hidden">
                                                                <div className="h-full bg-primary" style={{ width: `${p.progress}%` }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* RIGHT: Project mix + KPIs + Areas */}
                                        <div className="space-y-3">
                                            {/* Project mix */}
                                            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                                    Project mix (all-time)
                                                </h4>
                                                <div className="space-y-2.5">
                                                    {([
                                                        { label: 'Large (>$500K)', count: projects.largeProjects, color: 'bg-primary' },
                                                        { label: 'Medium ($50–500K)', count: projects.mediumProjects, color: 'bg-info' },
                                                        { label: 'Small (<$50K)', count: projects.smallProjects, color: 'bg-success' },
                                                    ] as const).map(row => {
                                                        const pct = totalProjects > 0 ? (row.count / totalProjects) * 100 : 0
                                                        return (
                                                            <div key={row.label}>
                                                                <div className="flex items-center justify-between text-xs mb-1">
                                                                    <span className="text-foreground">{row.label}</span>
                                                                    <span className="font-mono tabular-nums text-muted-foreground">{row.count}</span>
                                                                </div>
                                                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                                    <div className={`h-full ${row.color}`} style={{ width: `${pct}%` }} />
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            {/* KPIs */}
                                            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                    <Award className="h-4 w-4 text-muted-foreground" />
                                                    Performance KPIs
                                                </h4>
                                                <dl className="grid grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <dt className="text-muted-foreground">Avg cycle time</dt>
                                                        <dd className="font-semibold text-foreground tabular-nums">{kpis.avgCycleTime}w</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-muted-foreground flex items-center gap-1">
                                                            Error rate
                                                            {kpis.errorRate <= 0.025 ? (
                                                                <CheckCircle2 className="h-3 w-3 text-success" />
                                                            ) : (
                                                                <AlertTriangle className="h-3 w-3 text-warning" />
                                                            )}
                                                        </dt>
                                                        <dd className={`font-semibold tabular-nums ${kpis.errorRate <= 0.025 ? 'text-success' : 'text-warning'}`}>
                                                            {(kpis.errorRate * 100).toFixed(3)}%
                                                        </dd>
                                                        <div className="text-[10px] text-muted-foreground">Industry 0.025%</div>
                                                    </div>
                                                    <div>
                                                        <dt className="text-muted-foreground">Revisions / project</dt>
                                                        <dd className="font-semibold text-foreground tabular-nums">{kpis.revisionsPerProject}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-muted-foreground">Peer reviews YTD</dt>
                                                        <dd className="font-semibold text-foreground tabular-nums">{kpis.peerReviewsCompletedYTD}</dd>
                                                    </div>
                                                </dl>
                                            </div>

                                            {/* Areas */}
                                            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    Areas covered
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {areas.map(a => (
                                                        <span key={a} className="text-[10px] font-medium px-2 py-1 rounded-md bg-muted text-foreground border border-border">
                                                            {a}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer (optional Assign to MANATT) */}
                                {canAssignToMANATT && (
                                    <div className="border-t border-border px-6 py-3 shrink-0 bg-card flex items-center justify-between gap-3">
                                        <div className="text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground">{name}</span> can take on MANATT 4th Floor (~30 stations · DC GSA)
                                        </div>
                                        <button
                                            type="button"
                                            onClick={onAssignToMANATT}
                                            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                                        >
                                            <UserCheck className="h-4 w-4" />
                                            Assign to MANATT
                                        </button>
                                    </div>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
