/**
 * QuoteRevisionsHistory · Version history + diff for a quote (W8 · Wendy item 3)
 *
 * Inline panel (not modal) shown when "Revisions" tab is active in QuoteDetail.
 * Each revision lists: number, date, author, reason, key changes.
 */

import { History, ChevronDown, ChevronUp, User, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

interface RevisionChange {
    field: string
    from: string
    to: string
}

interface QuoteRevision {
    number: number
    date: string
    author: string
    reason: string
    netValue: number
    netDelta: number
    changes: RevisionChange[]
    status: 'current' | 'superseded' | 'rejected'
}

const REVISIONS: QuoteRevision[] = [
    {
        number: 3,
        date: '2026-01-18 11:42',
        author: 'Regional Sales Manager Reyes · Sales Rep',
        reason: 'Client requested CF-6036 → CF-6021 fabric swap on lounge (item F-SSC346030C)',
        netValue: 25398,
        netDelta: -376,
        status: 'current',
        changes: [
            { field: 'F-SSC346030C · Fabric', from: 'CF-6036 Ocean Blue', to: 'CF-6021 Navy' },
            { field: 'F-SSC346030C · Unit price', from: '$2,031.12', to: '$1,843.50' },
            { field: 'Net total', from: '$25,774', to: '$25,398' },
        ],
    },
    {
        number: 2,
        date: '2026-01-15 09:14',
        author: 'Regional Sales Manager Reyes · Sales Rep',
        reason: 'Added 2 additional Triple Door Lockers per client expansion',
        netValue: 25774,
        netDelta: 1395,
        status: 'superseded',
        changes: [
            { field: 'X-LTD661218L · Qty', from: '6', to: '8' },
            { field: 'X-LTD661218L · Ext', from: '$4,186.08', to: '$5,581.44' },
            { field: 'Net total', from: '$24,379', to: '$25,774' },
        ],
    },
    {
        number: 1,
        date: '2026-01-09 16:32',
        author: 'Regional Sales Manager Reyes · Sales Rep',
        reason: 'Initial quote from RFQ-2026-001',
        netValue: 24379,
        netDelta: 0,
        status: 'superseded',
        changes: [
            { field: 'Created from', from: '—', to: 'RFQ-2026-001' },
            { field: 'Line items', from: '0', to: '7' },
            { field: 'Net total', from: '—', to: '$24,379' },
        ],
    },
]

function statusClass(status: QuoteRevision['status']): string {
    if (status === 'current') return 'bg-success/10 text-success border-success/20'
    if (status === 'rejected') return 'bg-destructive/10 text-destructive border-destructive/20'
    return 'bg-muted/40 text-muted-foreground border-border'
}

function statusLabel(status: QuoteRevision['status']): string {
    if (status === 'current') return 'Current'
    if (status === 'rejected') return 'Rejected'
    return 'Superseded'
}

function RevisionRow({ revision, defaultOpen }: { revision: QuoteRevision; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen ?? revision.status === 'current')
    return (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                aria-expanded={open}
                aria-label={`${open ? 'Collapse' : 'Expand'} revision ${revision.number}`}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-muted/20 transition-colors"
            >
                <div className="h-7 w-7 rounded-md bg-muted/40 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-foreground tabular-nums">v{revision.number}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground">Revision #&nbsp;{revision.number}</span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusClass(revision.status)}`}>
                            {revision.status === 'current' && <CheckCircle2 className="h-2.5 w-2.5 mr-1" aria-hidden="true" />}
                            {statusLabel(revision.status)}
                        </span>
                        <span className="text-[10px] text-muted-foreground tabular-nums">{revision.date}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <User className="h-3 w-3" aria-hidden="true" />
                        {revision.author}
                    </div>
                    <div className="text-[11px] text-foreground mt-1 italic line-clamp-2">{revision.reason}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-bold text-foreground tabular-nums">${revision.netValue.toLocaleString()}</span>
                    {revision.netDelta !== 0 && (
                        <span className={`text-[10px] font-bold tabular-nums ${revision.netDelta > 0 ? 'text-warning' : 'text-success'}`}>
                            {revision.netDelta > 0 ? '+' : ''}${revision.netDelta.toLocaleString()}
                        </span>
                    )}
                    {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />}
                </div>
            </button>
            {open && (
                <div className="border-t border-border bg-muted/10 px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                        <FileText className="h-3 w-3" aria-hidden="true" />
                        Changes ({revision.changes.length})
                    </div>
                    <ul className="space-y-1.5">
                        {revision.changes.map((c, i) => (
                            <li key={i} className="grid grid-cols-[140px_1fr_1fr] gap-2 text-[11px] items-baseline">
                                <span className="text-muted-foreground font-medium">{c.field}</span>
                                <span className="text-muted-foreground line-through truncate">{c.from}</span>
                                <span className="text-foreground font-medium truncate">→ {c.to}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default function QuoteRevisionsHistory() {
    return (
        <section aria-labelledby="quote-revisions-heading" className="rounded-xl border border-border bg-card overflow-hidden">
            <header className="px-5 py-3 border-b border-border bg-card flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                    <History className="h-4 w-4 text-foreground" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 id="quote-revisions-heading" className="text-sm font-bold text-foreground">Revision history</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{REVISIONS.length} revisions · expand to see field-level changes</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    Current: v{REVISIONS[0].number}
                </span>
            </header>
            <div className="p-4 space-y-2">
                {REVISIONS.map(r => (
                    <RevisionRow key={r.number} revision={r} />
                ))}
            </div>
            <div className="px-5 py-2 border-t border-border bg-muted/10 text-[10px] text-muted-foreground italic">
                Audit trail · every revision logged with author + reason + diff · Wendy item 3
            </div>
        </section>
    )
}
