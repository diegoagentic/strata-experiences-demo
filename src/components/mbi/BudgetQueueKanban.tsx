/**
 * COMPONENT: BudgetQueueKanban
 * PURPOSE: 5-column kanban view of Budget Queue matching the pipeline states
 *          defined in the MBI HTML reference flow (Intake → Parsing → Validation
 *          → Review → Approved). Cards show MBI budget requests + metadata.
 *
 * PROPS:
 *   - onCardClick?: (id: string) => void  — navigate to budget detail
 *
 * STATES:
 *   - default — cards distributed across 5 columns by status
 *   - hover   — card elevates with shadow
 *   - hero    — hero budget highlighted with primary border/ring
 *   - empty   — column shows "—" when no cards
 *
 * DS TOKENS:
 *   - bg-card / bg-muted/30 · border-border · rounded-2xl
 *   - Status colors: info (intake), ai (parsing), warning (validation),
 *     primary (review), success (approved)
 *
 * USED BY: MBIBudgetPage (default QueueView)
 * REUSED PATTERN: OCRTracking kanban from smart-comparator (adapted columns + card fields)
 */

import { Upload, Sparkles, AlertTriangle, Eye, CheckCircle2, FileText, User, DollarSign, Calendar } from 'lucide-react'
import type { BudgetRequest, BudgetStatus } from '../../config/profiles/mbi-data'
import { MBI_BUDGET_REQUESTS, getStakeholder } from '../../config/profiles/mbi-data'

interface ColumnSpec {
    id: BudgetStatus
    label: string
    icon: React.ReactNode
    accentClass: string        // text + bg accent for the column header
    borderClass: string        // column border color
}

const COLUMNS: ColumnSpec[] = [
    {
        id: 'intake',
        label: 'Intake',
        icon: <Upload className="h-3.5 w-3.5" />,
        accentClass: 'text-info',
        borderClass: 'border-info/30',
    },
    {
        id: 'parsing',
        label: 'AI Parsing',
        icon: <Sparkles className="h-3.5 w-3.5" />,
        accentClass: 'text-ai',
        borderClass: 'border-ai/30',
    },
    {
        id: 'validation',
        label: 'Validation',
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
        accentClass: 'text-warning',
        borderClass: 'border-warning/30',
    },
    {
        id: 'review',
        label: 'Human Review',
        icon: <Eye className="h-3.5 w-3.5" />,
        accentClass: 'text-primary',
        borderClass: 'border-primary/30',
    },
    {
        id: 'approved',
        label: 'Approved',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        accentClass: 'text-success',
        borderClass: 'border-success/30',
    },
]

interface BudgetQueueKanbanProps {
    onCardClick?: (id: string) => void
}

export default function BudgetQueueKanban({ onCardClick }: BudgetQueueKanbanProps) {
    const byStatus = COLUMNS.reduce<Record<BudgetStatus, BudgetRequest[]>>((acc, col) => {
        acc[col.id] = MBI_BUDGET_REQUESTS.filter(b => b.status === col.id)
        return acc
    }, { intake: [], parsing: [], validation: [], review: [], approved: [] })

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {COLUMNS.map(col => (
                <div key={col.id} className="space-y-3">
                    {/* Column header */}
                    <div className={`bg-card border ${col.borderClass} rounded-xl p-3`}>
                        <div className="flex items-center justify-between">
                            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${col.accentClass}`}>
                                {col.icon}
                                <span>{col.label}</span>
                            </div>
                            <span className="text-xs font-bold text-muted-foreground">
                                {byStatus[col.id].length}
                            </span>
                        </div>
                    </div>

                    {/* Column cards */}
                    <div className="space-y-2 min-h-[120px]">
                        {byStatus[col.id].length === 0 ? (
                            <div className="text-center text-xs text-muted-foreground py-4 border border-dashed border-border rounded-xl">
                                —
                            </div>
                        ) : (
                            byStatus[col.id].map(b => (
                                <BudgetCard key={b.id} budget={b} onClick={() => onCardClick?.(b.id)} />
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── Single Budget Card ────────────────────────────────────────────────────
function BudgetCard({ budget, onClick }: { budget: BudgetRequest; onClick?: () => void }) {
    const owner = getStakeholder(budget.createdBy)
    const isHero = !!budget.isHero

    return (
        <button
            onClick={onClick}
            className={`
                w-full text-left bg-card border rounded-2xl p-3 transition-all hover:shadow-md
                ${isHero ? 'border-primary ring-2 ring-primary/20 shadow-sm' : 'border-border hover:border-muted-foreground/40'}
            `}
        >
            {/* Top: ID + path badge */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                    {budget.id}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${budget.path === 'design-assisted' ? 'bg-ai/10 text-ai' : 'bg-muted text-muted-foreground'}`}>
                    {budget.path === 'design-assisted' ? 'SIF' : 'QUICK'}
                </span>
            </div>

            {/* Middle: client + project */}
            <h4 className="text-sm font-bold text-foreground leading-tight mb-0.5">{budget.client.name}</h4>
            <p className="text-[11px] text-muted-foreground leading-tight mb-3 line-clamp-2">{budget.client.project}</p>

            {/* Bottom: owner + total */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="truncate max-w-[80px]">{owner?.name.split(' ')[0] ?? '—'}</span>
                </div>
                <div className="flex items-center gap-1 text-foreground font-bold">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span>{((budget.total ?? budget.budgetCeiling ?? 0) / 1000).toFixed(0)}K</span>
                </div>
            </div>

            {/* Hero flag */}
            {isHero && (
                <div className="mt-2 pt-2 border-t border-primary/20 flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                    <span>⭐</span>
                    <span>Hero · $18K catch</span>
                </div>
            )}

            {/* Vertical indicator */}
            {budget.client.vertical && (
                <div className="mt-1.5 text-[9px] font-medium text-muted-foreground capitalize">
                    {budget.client.vertical}
                </div>
            )}
        </button>
    )
}
