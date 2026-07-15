/**
 * COMPONENT: OfficeworksFunnel
 * PURPOSE: Manager-centric kanban view (Felicia's POV) — 5-stage funnel
 *          for Spec Check & Design process. MANATT (active) moves between
 *          columns as demo advances. 3 context projects sit in fixed columns.
 *
 * CLONE OF: src/components/bfi/BFIProcessKanban.tsx (simplified · kanban-only)
 *
 * 5 STAGES: Intake → Design → Spec Check → Submission → Acknowledgment
 * MAPPING: see stepIdToColIdx() · maps currentStep.id → MANATT column index
 *
 * DS TOKENS: bg-card · bg-muted · bg-ai/10 · bg-info/10 · bg-warning/10 ·
 *            bg-primary/10 · bg-success/10 · text-foreground · text-muted-foreground
 */

import { Search, LayoutGrid, MoreHorizontal } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import CapacityHeatmap from './shared/CapacityHeatmap'
import { MANATT_ORDER_META } from './shared/manattOrderData'
import { stepIdToColIdx } from './shared/funnelStages'

// ─── Funnel columns (kanban-specific styling) ────────────────────────────────

const PROCESS_COLUMNS = [
    { id: 'intake',     label: 'Intake',         color: 'text-ai',      border: 'border-ai/30',      pill: 'bg-ai/10 text-ai border border-ai/20' },
    { id: 'design',     label: 'Design',         color: 'text-info',    border: 'border-info/30',    pill: 'bg-info/10 text-info border border-info/20' },
    { id: 'spec-check', label: 'Spec Check',     color: 'text-warning', border: 'border-warning/30', pill: 'bg-warning/10 text-warning border border-warning/20' },
    { id: 'submission', label: 'Submission',     color: 'text-primary', border: 'border-primary/30', pill: 'bg-primary/10 text-primary border border-primary/20' },
    { id: 'ack',        label: 'Acknowledgment', color: 'text-success', border: 'border-success/30', pill: 'bg-success/10 text-success border border-success/20' },
] as const

// ─── MANATT contextual content per column ─────────────────────────────────────

const MANATT_BADGE: Record<number, { label: string; className: string }> = {
    0: { label: 'New Form',        className: 'bg-ai/10 text-ai border border-ai/20' },
    1: { label: 'In Design',       className: 'bg-info/10 text-info border border-info/20' },
    2: { label: 'Self + Peer',     className: 'bg-warning/10 text-warning border border-warning/20' },
    3: { label: 'SP4 sent',        className: 'bg-primary/10 text-primary border border-primary/20' },
    4: { label: 'Ack received',    className: 'bg-success/10 text-success border border-success/20' },
}

const MANATT_SUBTITLE: Record<number, string> = {
    0: 'Form received · CAD missing · GSA SQ blank',
    1: 'CET layout · 71 lines · 13 CRs · Flintwood 5N',
    2: 'Kimberly self-audit · Rebecca peer review · Felicia oversight',
    3: 'SP4 uploaded to NetSuite · 79% discount applied · PO released',
    4: 'Teknion ack PO-DC-0009642 · diff scan in progress',
}

// ─── Context projects (3 fixed cards in other columns) ────────────────────────

interface ContextCard {
    code: string
    initials: string
    client: string
    value: string
    colIdx: number
    avatarBg: string
    avatarColor: string
    desc: string
    designer: string
}

const CONTEXT_CARDS: ContextCard[] = [
    {
        code: 'NYC-DOH-2847', initials: 'DOH', client: 'NYC Dept. of Health · Brooklyn',
        value: '$148,200', colIdx: 0,
        avatarBg: 'bg-ai/20', avatarColor: 'text-ai',
        desc: 'Form received · 18 stations · awaiting designer assignment',
        designer: 'Unassigned',
    },
    {
        code: 'JPM-ATL-4471', initials: 'JPM', client: 'JPMorgan · Atlanta HQ',
        value: '$892,400', colIdx: 2,
        avatarBg: 'bg-warning/20', avatarColor: 'text-warning',
        desc: 'Full floor · 200+ stations · 3-day burst week',
        designer: 'James O\'Brien (DC)',
    },
    {
        code: 'GSA-DC2-0892', initials: 'GSA', client: 'GSA · DC2 (price-protected)',
        value: '$76,500', colIdx: 3,
        avatarBg: 'bg-primary/20', avatarColor: 'text-primary',
        desc: 'SP4 in NetSuite · awaiting Caitlin to release PO',
        designer: 'Sandra Park (DC)',
    },
]

// ─── MANATT designer per current step ─────────────────────────────────────────

function getMANATTDesigner(stepId: string | undefined): string {
    // sc1.0 is the manager-review + assign moment · designer not yet committed
    if (!stepId || stepId === 'sc1.0') return 'Pending assignment'
    return 'Kimberly Tucker (PA · cross-market)'
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    onOpenReview: () => void
    /** Optional: hide the "Review" CTA on the MANATT card (used when modal already open) */
    hideReviewCta?: boolean
    /** Currently assigned designer for MANATT · overrides the default getMANATTDesigner() inference */
    assignedDesigner?: string | null
}

export default function OfficeworksFunnel({ onOpenReview, hideReviewCta = false, assignedDesigner }: Props) {
    const { currentStep } = useDemo()
    const activeCol = stepIdToColIdx(currentStep?.id)
    const col = PROCESS_COLUMNS[activeCol]
    const badge = MANATT_BADGE[activeCol]
    const subtitle = MANATT_SUBTITLE[activeCol]
    const designer = assignedDesigner ?? getMANATTDesigner(currentStep?.id)
    const isJustArrived = currentStep?.id === 'sc1.0'

    return (
        <div className="bg-card border border-border rounded-2xl">
            {/* Header */}
            <div className="border-b border-border px-5 py-4 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-foreground">Spec Check & Design · Pipeline</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Felicia Miano-Poles · EVP Design & PM · ~30 designers across 3 regions
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        title="Search projects"
                    >
                        <Search className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border bg-muted text-xs text-foreground transition-colors"
                        title="Board view"
                    >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        Board
                    </button>
                </div>
            </div>

            {/* Kanban content */}
            <div className="p-5">
                <div className="grid grid-cols-5 gap-3">
                    {PROCESS_COLUMNS.map((c, colIdx) => {
                        const isManattCol = colIdx === activeCol
                        const colCards = CONTEXT_CARDS.filter(card => card.colIdx === colIdx)
                        const count = (isManattCol ? 1 : 0) + colCards.length

                        return (
                            <div key={c.id} className="space-y-3 min-h-[200px]">
                                {/* Column header */}
                                <div className="flex items-center justify-between mb-1 px-1">
                                    <h4 className={`font-medium text-sm flex items-center gap-2 ${isManattCol ? c.color : 'text-foreground'}`}>
                                        {c.label}
                                        <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums">{count}</span>
                                    </h4>
                                    <button className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Column options">
                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {/* MANATT card — highlighted (moves between columns) */}
                                {isManattCol && (
                                    <div className={`relative rounded-2xl border-2 ${col.border} bg-card p-3.5 space-y-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-700 ${
                                        isJustArrived ? 'ring-2 ring-ai/40 ring-offset-2 ring-offset-background' : ''
                                    }`}>
                                        {isJustArrived && (
                                            <div className="absolute -top-2 -right-2 text-[9px] font-bold uppercase tracking-wider bg-ai text-background px-2 py-0.5 rounded-full shadow-md animate-pulse">
                                                Just arrived
                                            </div>
                                        )}
                                        <div className="flex items-start gap-2.5">
                                            <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center shrink-0 ring-2 ring-background">
                                                <span className="text-[10px] font-black text-success">MAN</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                                    <span className="text-sm font-bold text-foreground">MANATT</span>
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-muted-foreground block truncate">Manatt Phelps & Phillips LLP · DC</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">PO</span>
                                                <span className="font-medium text-foreground font-mono">{MANATT_ORDER_META.poNumber}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Net</span>
                                                <span className="font-semibold text-foreground">${MANATT_ORDER_META.netTotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Designer</span>
                                                <span className="font-medium text-foreground truncate ml-1">{designer}</span>
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-muted-foreground leading-relaxed">{subtitle}</p>

                                        {!hideReviewCta && (
                                            <div className="pt-2 border-t border-border flex items-center justify-between">
                                                <span className="text-[10px] text-muted-foreground">SQ #{MANATT_ORDER_META.specialQuote}</span>
                                                <div className="relative">
                                                    <span className="absolute -inset-1 rounded-xl bg-ai/20 animate-pulse pointer-events-none" />
                                                    <button
                                                        type="button"
                                                        onClick={onOpenReview}
                                                        className="relative py-1.5 px-3 text-[11px] font-bold rounded-xl bg-foreground text-background hover:opacity-80 transition-all ring-2 ring-ai ring-offset-1"
                                                    >
                                                        Review →
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Context cards (other projects in this column) */}
                                {colCards.map(card => (
                                    <div
                                        key={card.code}
                                        className="rounded-2xl border border-border bg-card p-3.5 space-y-2.5 shadow-sm opacity-60 pointer-events-none"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`h-8 w-8 rounded-full ${card.avatarBg} flex items-center justify-center shrink-0 ring-2 ring-background`}>
                                                <span className={`text-[10px] font-black ${card.avatarColor}`}>{card.initials}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-semibold text-foreground truncate">{card.code}</div>
                                                <div className="text-[10px] text-muted-foreground truncate">{card.client}</div>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">{card.desc}</p>
                                        <div className="h-px bg-border" />
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-muted-foreground truncate">{card.designer}</span>
                                            <span className="font-semibold text-foreground tabular-nums">{card.value}</span>
                                        </div>
                                    </div>
                                ))}

                                {/* Empty state */}
                                {count === 0 && (
                                    <div className="border-2 border-dashed border-border rounded-xl p-5 text-center">
                                        <p className="text-xs text-muted-foreground">No projects</p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Capacity panel below kanban (sidebar in larger viewports could be future) */}
                <div className="mt-6 pt-5 border-t border-border space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Designer Capacity</h3>
                        <span className="text-[10px] text-muted-foreground">~30 designers · 3 regions · live</span>
                    </div>
                    <CapacityHeatmap highlightName={currentStep?.id === 'sc1.0' ? 'Kimberly Tucker' : undefined} />
                </div>
            </div>
        </div>
    )
}
