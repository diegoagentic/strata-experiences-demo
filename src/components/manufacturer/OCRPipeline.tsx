/**
 * OCRPipeline · 5-column Kanban for RFQ intake (D1' · Beat 2)
 *
 * Rebuilt from smart-comparator/OCRTracking.tsx as targeted ~150 LOC
 * (skipping Navbar/Breadcrumbs/AuthToast/AssignPopover/teamMembers deps).
 *
 * Default RFQ view for inbound-outbound profile per UX consensus:
 * "Making it default (not alternate) tells the dual-mode story at-a-glance.
 * Sara sees requests-being-processed by columns instead of rows."
 *
 * Column model collapses 6 smart-comparator source colors to 4 semantic
 * tokens we ship (success / warning / destructive / info).
 *
 * 5 columns:
 *   1. Ingesting        (info)         — just arrived, OCR running
 *   2. Needs Attention  (warning)      — fields flagged, low confidence
 *   3. Awaiting Expert  (destructive)  — rules failed, human routing
 *   4. In-progress      (info)         — Strata Quote in flight
 *   5. Reconciled       (success)      — quote sent
 */

import { useMemo } from 'react'
import {
    Inbox,
    AlertTriangle,
    UserCheck,
    Sparkles,
    CheckCircle2,
    Clock,
    Mail,
    Globe,
    Database,
    Pencil,
} from 'lucide-react'

export type OCRColumnId = 'ingesting' | 'needs-attention' | 'awaiting-expert' | 'in-progress' | 'reconciled'

type ColumnTone = 'info' | 'warning' | 'destructive' | 'success'

interface OCRColumn {
    id: OCRColumnId
    label: string
    tone: ColumnTone
    icon: typeof Inbox
    hint: string
}

const COLUMNS: OCRColumn[] = [
    { id: 'ingesting', label: 'Ingesting', tone: 'info', icon: Inbox, hint: 'OCR + extraction running' },
    { id: 'needs-attention', label: 'Needs Attention', tone: 'warning', icon: AlertTriangle, hint: 'Low confidence fields' },
    { id: 'awaiting-expert', label: 'Awaiting Expert', tone: 'destructive', icon: UserCheck, hint: 'Manual routing required' },
    { id: 'in-progress', label: 'In-progress', tone: 'info', icon: Sparkles, hint: 'Strata Quote in flight' },
    { id: 'reconciled', label: 'Reconciled', tone: 'success', icon: CheckCircle2, hint: 'Quote sent · ready' },
]

function columnHeaderClass(tone: ColumnTone): string {
    if (tone === 'info') return 'bg-info/5 border-info/20 text-info'
    if (tone === 'warning') return 'bg-warning/5 border-warning/20 text-warning'
    if (tone === 'destructive') return 'bg-destructive/5 border-destructive/20 text-destructive'
    return 'bg-success/5 border-success/20 text-success'
}

function columnAccentBar(tone: ColumnTone): string {
    if (tone === 'info') return 'bg-info'
    if (tone === 'warning') return 'bg-warning'
    if (tone === 'destructive') return 'bg-destructive'
    return 'bg-success'
}

export interface OCRCard {
    id: string
    customer: string
    project: string
    amount: string
    source: 'Email' | 'Dealer Portal' | 'NetSuite' | 'Manual'
    sourceLabel?: string
    confidence?: number
    sla?: string
    contract?: string
    onClick?: () => void
}

function sourceIcon(source: OCRCard['source']) {
    if (source === 'Email') return Mail
    if (source === 'Dealer Portal') return Globe
    if (source === 'NetSuite') return Database
    return Pencil
}

interface OCRPipelineProps {
    cards: OCRCard[]
    /** Map RFQ status → column. Defaults a manufacturer-friendly mapping. */
    columnForCard?: (card: OCRCard, status?: string) => OCRColumnId
    /** Status field per card · used by the default mapper. */
    statusByCard?: Record<string, string>
}

function defaultColumnFor(card: OCRCard, status?: string): OCRColumnId {
    const s = (status ?? '').toLowerCase()
    if (s.includes('sent') || s.includes('reconcil')) return 'reconciled'
    if (s.includes('progress') || s.includes('drafting')) return 'in-progress'
    if (s.includes('pending')) {
        // Low confidence → needs attention; NetSuite (structured) → in-progress; rest → ingesting
        if (card.confidence !== undefined && card.confidence < 80) return 'needs-attention'
        if (card.source === 'NetSuite') return 'in-progress'
        return 'ingesting'
    }
    if (s.includes('review')) {
        if (card.confidence !== undefined && card.confidence < 80) return 'needs-attention'
        return 'in-progress'
    }
    return 'ingesting'
}

function ConfidencePill({ value }: { value: number }) {
    const tone = value >= 90 ? 'text-success bg-success/10 border-success/20' : value >= 70 ? 'text-warning bg-warning/10 border-warning/20' : 'text-destructive bg-destructive/10 border-destructive/20'
    return (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums border ${tone}`}>
            {value}%
        </span>
    )
}

function SourcePill({ source, label }: { source: OCRCard['source']; label?: string }) {
    const Icon = sourceIcon(source)
    return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-muted/50 text-muted-foreground border border-border">
            <Icon className="h-2.5 w-2.5" aria-hidden="true" />
            {label ?? source}
        </span>
    )
}

function RFQCard({ card }: { card: OCRCard }) {
    return (
        <button
            type="button"
            onClick={card.onClick}
            className="w-full text-left rounded-lg border border-border bg-card p-3 hover:border-primary/40 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 space-y-2"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="text-[11px] font-mono text-muted-foreground">{card.id}</div>
                    <div className="text-xs font-bold text-foreground truncate">{card.customer}</div>
                </div>
                {card.confidence !== undefined && <ConfidencePill value={card.confidence} />}
            </div>
            <div className="text-[11px] text-muted-foreground line-clamp-2">{card.project}</div>
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                <span className="text-xs font-bold text-foreground tabular-nums">{card.amount}</span>
                <SourcePill source={card.source} label={card.sourceLabel} />
            </div>
            {(card.sla || card.contract) && (
                <div className="flex items-center justify-between text-[10px] text-muted-foreground italic">
                    {card.sla && (
                        <span className="inline-flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                            {card.sla}
                        </span>
                    )}
                    {card.contract && <span className="font-mono">{card.contract}</span>}
                </div>
            )}
        </button>
    )
}

export default function OCRPipeline({ cards, columnForCard, statusByCard }: OCRPipelineProps) {
    const mapper = columnForCard ?? defaultColumnFor

    const grouped = useMemo(() => {
        const out: Record<OCRColumnId, OCRCard[]> = {
            'ingesting': [],
            'needs-attention': [],
            'awaiting-expert': [],
            'in-progress': [],
            'reconciled': [],
        }
        for (const c of cards) {
            const status = statusByCard?.[c.id]
            const col = mapper(c, status)
            out[col].push(c)
        }
        return out
    }, [cards, mapper, statusByCard])

    return (
        <section aria-label="RFQ intake pipeline" className="rounded-xl border border-border bg-card overflow-hidden">
            <header className="px-5 py-3 border-b border-border bg-card flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-ai/10 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-ai" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">RFQ intake pipeline</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        3 channels · OCR + extraction · self-organize by readiness
                    </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {cards.length} RFQ{cards.length === 1 ? '' : 's'}
                </span>
            </header>

            <div className="overflow-x-auto p-4">
                <div className="grid grid-cols-5 gap-3 min-w-[1000px]">
                    {COLUMNS.map(col => {
                        const items = grouped[col.id]
                        const ColIcon = col.icon
                        return (
                            <div key={col.id} className="flex flex-col rounded-lg bg-muted/20 border border-border overflow-hidden min-h-[280px]">
                                <div className={`h-0.5 w-full ${columnAccentBar(col.tone)}`} aria-hidden="true" />
                                <div className={`px-3 py-2 border-b border-border flex items-start gap-2 ${columnHeaderClass(col.tone)}`}>
                                    <ColIcon className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[11px] font-bold uppercase tracking-wider">{col.label}</div>
                                        <div className="text-[10px] opacity-80 italic">{col.hint}</div>
                                    </div>
                                    <span className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded bg-card/60">
                                        {items.length}
                                    </span>
                                </div>
                                <div className="flex-1 p-2 space-y-2">
                                    {items.length === 0 ? (
                                        <div className="text-[10px] text-muted-foreground italic text-center py-6">No RFQs</div>
                                    ) : (
                                        items.map(c => <RFQCard key={c.id} card={c} />)
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
