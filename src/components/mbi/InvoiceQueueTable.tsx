/**
 * COMPONENT: InvoiceQueueTable (Kanban)
 * PURPOSE: Kathy's morning AP queue rendered as a 3-column kanban
 *          (Pending · In Progress · Done). Apr 23 transcript commitment from
 *          Christian to Matt: the queue must show in-progress, not just
 *          pending+done — Kathy needs to see what the agents are working on
 *          right now.
 *
 *          File name kept (`InvoiceQueueTable`) so existing imports keep
 *          working; the implementation is now a kanban.
 *
 * PROPS:
 *   - invoices: Invoice[]
 *   - selectedId?: string           — sync with detail panel
 *   - onSelect: (id: string) => void
 *
 * COLUMN STATES per invoice:
 *   - pending      → red/amber accent, exception or HealthTrust rebate needs review
 *   - in-progress  → ai accent + spinner-like dot, agent reconciling
 *   - done         → success accent, auto-posted to CORE
 *
 * USED BY: AccountingMorningQueue (Flow 2 Scene 1)
 */

import { AlertTriangle, Zap, CheckCircle2, Loader2, RefreshCw, Clock } from 'lucide-react'
import type { Invoice, InvoiceStatus } from '../../config/profiles/mbi-data'

interface InvoiceQueueTableProps {
    invoices: Invoice[]
    selectedId?: string
    onSelect: (id: string) => void
}

const COLUMN_ORDER: InvoiceStatus[] = ['pending', 'in-progress', 'done']

const COLUMN_META: Record<InvoiceStatus, { label: string; sub: string; tone: string; chip: string }> = {
    'pending': {
        label: 'Pending Review',
        sub: 'Needs your eyes',
        tone: 'border-amber-500/40 bg-amber-50/40 dark:bg-amber-500/5',
        chip: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    },
    'in-progress': {
        label: 'In Progress',
        sub: 'Agents working now',
        tone: 'border-ai/40 bg-ai/5 dark:bg-ai/10',
        chip: 'bg-ai/15 text-ai',
    },
    'done': {
        label: 'Done',
        sub: 'Auto-posted to CORE',
        tone: 'border-success/40 bg-success/5 dark:bg-success/10',
        chip: 'bg-success/15 text-success',
    },
}

export default function InvoiceQueueTable({ invoices, selectedId, onSelect }: InvoiceQueueTableProps) {
    const pendingItems = invoices.filter(i => i.status === 'pending')
    const meta = COLUMN_META['pending']

    return (
        <div className={`flex flex-col rounded-xl border ${meta.tone}`}>
            {/* Column header */}
            <div className="px-2.5 py-2 border-b border-border/60 flex items-center justify-between">
                <div className="min-w-0">
                    <div className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${meta.chip}`}>
                        {meta.label}
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-1 truncate">{meta.sub}</div>
                </div>
                <span className="text-[10px] font-bold text-foreground tabular-nums shrink-0">{pendingItems.length}</span>
            </div>

            {/* Cards */}
            <div className="p-1.5 space-y-1.5 max-h-[520px] overflow-y-auto">
                {pendingItems.map(inv => (
                    <InvoiceCard
                        key={inv.id}
                        invoice={inv}
                        selected={inv.id === selectedId}
                        onClick={() => onSelect(inv.id)}
                    />
                ))}
                {pendingItems.length === 0 && (
                    <div className="text-[10px] text-muted-foreground italic text-center py-4">
                        Empty
                    </div>
                )}
            </div>

            <div className="px-2.5 py-1.5 border-t border-border/40 flex items-center gap-1.5">
                <RefreshCw className="h-2.5 w-2.5 text-muted-foreground/50 shrink-0" />
                <span className="text-[9px] text-muted-foreground/70 leading-tight">
                    Strata re-checks CORE every 15 min · resolved mismatches move to Done automatically
                </span>
            </div>
        </div>
    )
}

function dueDateUrgency(dueDate?: string): { days: number; label: string; tone: 'urgent' | 'soon' | null } | null {
    if (!dueDate) return null
    const today = new Date('2026-04-29')
    const due = new Date(dueDate)
    const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const label = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (days < 0) return { days, label, tone: 'urgent' }
    if (days <= 10) return { days, label, tone: 'urgent' }
    if (days <= 20) return { days, label, tone: 'soon' }
    return null
}

function InvoiceCard({ invoice, selected, onClick }: { invoice: Invoice; selected: boolean; onClick: () => void }) {
    const due = dueDateUrgency(invoice.dueDate)
    return (
        <button
            onClick={onClick}
            className={`
                w-full text-left bg-card dark:bg-zinc-800 border rounded-lg p-2 transition-all hover:shadow-sm
                ${selected
                    ? 'border-primary ring-1 ring-primary/40'
                    : invoice.hasException
                        ? 'border-red-500/40 hover:border-red-500/60'
                        : 'border-border hover:border-zinc-300 dark:hover:border-zinc-600'
                }
            `}
        >
            <div className="flex items-start justify-between gap-1 mb-1">
                <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-foreground truncate leading-tight">{invoice.vendor}</div>
                    <div className="text-[9px] text-muted-foreground truncate">
                        {invoice.id}
                        {invoice.invoiceDate && (
                            <span className="ml-1 text-[8.5px] opacity-70">· {new Date(invoice.invoiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        )}
                    </div>
                    {invoice.paymentTerms && !due && (
                        <div className="text-[8.5px] text-muted-foreground/70 truncate">{invoice.paymentTerms}{invoice.dueDate ? ` · due ${new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}</div>
                    )}
                </div>
                <div className="text-[11px] font-bold text-foreground tabular-nums shrink-0">
                    ${(invoice.amount / 1000).toFixed(1)}K
                </div>
            </div>

            <div className="flex items-center gap-0.5 flex-wrap">
                {invoice.isEDI && (
                    <CardFlag tone="blue" icon={<Zap className="h-2 w-2" />} label="EDI" />
                )}
                {invoice.hasException && (
                    <CardFlag tone="red" icon={<AlertTriangle className="h-2 w-2" />} label="Fix" />
                )}
                <span className={`ml-auto text-[9px] font-bold tabular-nums ${invoice.ocrConfidence >= 95 ? 'text-success' : invoice.ocrConfidence >= 90 ? 'text-zinc-900 dark:text-primary' : 'text-amber-700 dark:text-amber-400'}`}>
                    {invoice.ocrConfidence}%
                </span>
            </div>

            {due && (
                <div className={`flex items-center gap-1 mt-1.5 px-1.5 py-1 rounded text-[9px] font-bold ${
                    due.tone === 'urgent'
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                }`}>
                    <Clock className="h-2.5 w-2.5 shrink-0" />
                    <span>Due {due.label} · {due.days < 0 ? 'overdue' : `${due.days}d`}</span>
                    {invoice.paymentTerms && <span className="ml-auto opacity-60">{invoice.paymentTerms}</span>}
                </div>
            )}
            {invoice.status === 'in-progress' && invoice.inProgressReason && (
                <div className="text-[9.5px] text-muted-foreground italic mt-1 leading-tight line-clamp-2">
                    {invoice.inProgressReason}
                </div>
            )}
            {invoice.status === 'pending' && invoice.exceptionReason && (
                <div className="text-[9.5px] text-red-600 dark:text-red-400 mt-1 leading-tight line-clamp-2">
                    {invoice.exceptionReason}
                </div>
            )}
        </button>
    )
}

function CardFlag({ tone, icon, label }: { tone: 'blue' | 'amber' | 'red'; icon: React.ReactNode; label: string }) {
    const cls =
        tone === 'blue' ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400' :
        tone === 'amber' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400' :
        'bg-red-500/15 text-red-700 dark:text-red-400'
    return (
        <span className={`text-[8.5px] font-bold px-1 py-0.5 rounded inline-flex items-center gap-0.5 ${cls}`}>
            {icon}
            {label}
        </span>
    )
}

function Legend({ color, label }: { color: string; label: string }) {
    return (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${color}`}>{label}</span>
    )
}
