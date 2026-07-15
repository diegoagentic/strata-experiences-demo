/**
 * ARDepositsPanel · AR aging + email drafts (Asly N2 narrative)
 *
 * Standalone manufacturer-side AR panel that mirrors the UX of
 * mbi/AIEmailDraftsPanel without coupling to MBI_AR_RECORDS demo data.
 *
 * Surfaces:
 *   - AR aging table (deposits + invoices outstanding)
 *   - 2 AI-drafted emails (deposit request + 2nd follow-up) with tone polish
 *   - Send + Edit + Save state per draft
 *
 * Per modal normalization spec: Card + Badge primitives + semantic tokens only.
 * Per LAW 3: bg-primary always paired with text-primary-foreground.
 */

import { Fragment, useState } from 'react'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/react'
import {
    Sparkles,
    Send,
    Pencil,
    CheckCircle2,
    AlertTriangle,
    Mail,
    Wand2,
    X,
    Clock,
    RotateCcw,
} from 'lucide-react'
import { useViewAs } from './viewAsSignal'

type AgingTone = 'current' | 'due-soon' | 'past-due' | 'escalated'

interface ARRecord {
    id: string
    dealer: string
    project: string
    poNumber: string
    docType: 'Deposit' | 'Invoice'
    amount: number
    daysPastDue: number
    daysToDeposit?: number
    tone: AgingTone
}

interface EmailDraft {
    id: string
    recordId: string
    purpose: 'deposit-request' | 'second-follow-up'
    to: string
    subject: string
    body: string
}

const AR_RECORDS: ARRecord[] = [
    {
        id: 'AR-001',
        dealer: 'NorthPoint Furniture Group',
        project: 'Tech HQ Buildout',
        poNumber: '#ORD-2055',
        docType: 'Deposit',
        amount: 115500,
        daysPastDue: 0,
        daysToDeposit: 3,
        tone: 'current',
    },
    {
        id: 'AR-002',
        dealer: 'Cascade Workplace Co',
        project: 'HQ Upgrade · Floor 18',
        poNumber: '#ORD-2054',
        docType: 'Invoice',
        amount: 18750,
        daysPastDue: 12,
        tone: 'due-soon',
    },
    {
        id: 'AR-003',
        dealer: 'Pacific Workspaces',
        project: 'Lobby Refresh',
        poNumber: '#ORD-2053',
        docType: 'Invoice',
        amount: 33600,
        daysPastDue: 34,
        tone: 'past-due',
    },
    {
        id: 'AR-004',
        dealer: 'Heritage Office Group',
        project: 'Residential A',
        poNumber: '#ORD-2050',
        docType: 'Deposit',
        amount: 25500,
        daysPastDue: 47,
        tone: 'escalated',
    },
]

const DRAFTS: EmailDraft[] = [
    {
        id: 'DRAFT-001',
        recordId: 'AR-001',
        purpose: 'deposit-request',
        to: 'ap@northpoint-furniture.com · david.park@strata-mfg.com',
        subject: 'PO #ORD-2055 · proforma issued · 30% deposit required to release production',
        body: `Hi,

The proforma invoice for PO #ORD-2055 (Tech HQ Buildout · $385,000) has been issued. Production is scheduled to start on receipt of the 30% deposit ($115,500).

Wire instructions and the proforma PDF are attached. Once the deposit lands, our coordinator will lock the production slot and you will receive a confirmation with the ship date.

If you have any questions about the line items or the proforma terms, reply to this thread and we will route to the right team.

Best,
Strata · AR`,
    },
    {
        id: 'DRAFT-002',
        recordId: 'AR-003',
        purpose: 'second-follow-up',
        to: 'ap@pacific-workspaces.com',
        subject: 'Second follow-up · #ORD-2053 · $33.6K · 34 days past due',
        body: `Hi,

We have not received a response to our reminder on #ORD-2053 (Lobby Refresh · Urban Civic Group). The balance of $33,600 is now 34 days past due.

Can you confirm receipt of the invoice and the expected payment date? If there is an open dispute on any line item, let us know and we will route it for review.

If payment is already in flight, please reply with the reference number so we can close on our side.

Thanks,
Strata · AR`,
    },
]

// W5 · Credit status board (Wendy item 7)
type CreditStatus = 'good-standing' | 'watch' | 'hold'

interface CreditRecord {
    dealer: string
    creditLimit: number
    used: number
    available: number
    status: CreditStatus
    lastReview: string
}

const CREDIT_RECORDS: CreditRecord[] = [
    { dealer: 'NorthPoint Furniture Group', creditLimit: 500000, used: 385000, available: 115000, status: 'good-standing', lastReview: '2025-11-12' },
    { dealer: 'Cascade Workplace Co', creditLimit: 250000, used: 81250, available: 168750, status: 'good-standing', lastReview: '2026-01-08' },
    { dealer: 'Pacific Workspaces', creditLimit: 200000, used: 145600, available: 54400, status: 'watch', lastReview: '2026-01-15' },
    { dealer: 'Heritage Office Group', creditLimit: 150000, used: 175500, available: -25500, status: 'hold', lastReview: '2026-01-18' },
]

// W5 · Payment history (Wendy item 7)
interface PaymentRecord {
    id: string
    dealer: string
    poNumber: string
    amount: number
    method: 'Wire' | 'ACH' | 'Check' | 'Credit Card'
    receivedAt: string
    appliedTo: 'Deposit' | 'Invoice' | 'Final balance'
}

const PAYMENT_HISTORY: PaymentRecord[] = [
    { id: 'PAY-2026-018', dealer: 'NorthPoint Furniture Group', poNumber: '#ORD-2055', amount: 115500, method: 'Wire', receivedAt: '2026-01-22 09:14', appliedTo: 'Deposit' },
    { id: 'PAY-2026-017', dealer: 'Summit Office Solutions', poNumber: '#ORD-2051', amount: 36000, method: 'ACH', receivedAt: '2026-01-20 14:28', appliedTo: 'Deposit' },
    { id: 'PAY-2026-016', dealer: 'Cascade Workplace Co', poNumber: '#ORD-2054', amount: 18750, method: 'Check', receivedAt: '2026-01-18 11:02', appliedTo: 'Invoice' },
    { id: 'PAY-2026-015', dealer: 'Apex Office Design', poNumber: '#ORD-2047', amount: 450000, method: 'Wire', receivedAt: '2026-01-15 16:45', appliedTo: 'Final balance' },
    { id: 'PAY-2026-014', dealer: 'Beacon Hill Furnishings', poNumber: '#ORD-2049', amount: 63000, method: 'ACH', receivedAt: '2026-01-14 10:33', appliedTo: 'Deposit' },
]

const CREDIT_STATUS_LABEL: Record<CreditStatus, string> = {
    'good-standing': 'Good standing',
    'watch': 'Watch',
    'hold': 'Hold',
}

function creditStatusClass(status: CreditStatus): string {
    if (status === 'good-standing') return 'bg-success/10 text-success border-success/20'
    if (status === 'watch') return 'bg-warning/10 text-warning border-warning/20'
    return 'bg-destructive/10 text-destructive border-destructive/20'
}

const TONE_LABEL: Record<AgingTone, string> = {
    current: 'On track',
    'due-soon': 'Due soon',
    'past-due': 'Past due',
    escalated: 'Escalated',
}

function toneClass(tone: AgingTone): string {
    if (tone === 'current') return 'bg-success/10 text-success border-success/20'
    if (tone === 'due-soon') return 'bg-info/10 text-info border-info/20'
    if (tone === 'past-due') return 'bg-warning/10 text-warning border-warning/20'
    return 'bg-destructive/10 text-destructive border-destructive/20'
}

function polish(body: string, direction: 'friendlier' | 'firmer' | 'shorter'): string {
    if (direction === 'friendlier') {
        return body
            .replace(/^Hi,/i, 'Hi there,')
            .replace(/Can you confirm/i, 'Could you confirm')
            .replace(/Best,/i, 'Warm regards,')
            .replace(/Thanks,/i, 'Thanks so much,')
    }
    if (direction === 'firmer') {
        return body
            .replace(/^Hi,/i, 'To whom it may concern,')
            .replace(/Can you confirm/i, 'Please confirm by end of week')
            .replace(/let us know/i, 'open the dispute in the portal so we can route it for review')
            .replace(/Best,/i, 'Regards,')
    }
    return body
        .split('\n')
        .filter(line => line.length < 220)
        .slice(0, 5)
        .join('\n')
}

function fmt(n: number): string {
    if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`
    return `$${n}`
}

interface DraftCardProps {
    draft: EmailDraft
    record?: ARRecord
}

function DraftCard({ draft, record }: DraftCardProps) {
    const [state, setState] = useState<'pending' | 'editing' | 'edited' | 'sent'>('pending')
    const [subject, setSubject] = useState(draft.subject)
    const [body, setBody] = useState(draft.body)
    const [polishedAs, setPolishedAs] = useState<'friendlier' | 'firmer' | 'shorter' | null>(null)

    if (state === 'sent') {
        return (
            <div className="rounded-xl border border-success/30 bg-success/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                    <div>
                        <div className="text-xs font-bold text-foreground">Sent · {draft.purpose === 'deposit-request' ? 'Deposit request' : 'Follow-up'}</div>
                        <div className="text-[11px] text-muted-foreground">{draft.to.split(' · ')[0]}</div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setState('pending')}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    Undo
                </button>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2 flex-wrap">
                <Sparkles className="h-3.5 w-3.5 text-ai" aria-hidden="true" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                    {draft.purpose === 'deposit-request' ? 'Deposit request draft' : '2nd follow-up draft'}
                </span>
                {record && (
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${toneClass(record.tone)}`}>
                        {TONE_LABEL[record.tone]}
                    </span>
                )}
                {state === 'edited' && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-warning">
                        <Pencil className="h-2.5 w-2.5" aria-hidden="true" />
                        Edited{polishedAs ? ` · ${polishedAs}` : ''}
                    </span>
                )}
            </div>
            <div className="px-4 py-3 space-y-2 text-xs">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">To: </span>
                    <span className="text-foreground">{draft.to}</span>
                </div>
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Subject: </span>
                    {state === 'editing' ? (
                        <input
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            className="ml-1 inline-block w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    ) : (
                        <span className="text-foreground font-medium">{subject}</span>
                    )}
                </div>
                <div className="pt-1 border-t border-border">
                    {state === 'editing' ? (
                        <textarea
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            rows={6}
                            className="w-full bg-background border border-border rounded p-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none whitespace-pre-wrap font-sans"
                        />
                    ) : (
                        <pre className="whitespace-pre-wrap font-sans text-[11px] text-muted-foreground leading-relaxed line-clamp-6">{body}</pre>
                    )}
                </div>

                {state === 'editing' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Polish:</span>
                        {(['friendlier', 'firmer', 'shorter'] as const).map(dir => (
                            <button
                                key={dir}
                                type="button"
                                onClick={() => { setBody(polish(body, dir)); setPolishedAs(dir) }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-ai/10 text-ai border border-ai/20 hover:bg-ai/20 transition-colors"
                            >
                                <Wand2 className="h-2.5 w-2.5" aria-hidden="true" />
                                {dir}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="px-4 py-2.5 bg-muted/20 border-t border-border flex items-center justify-end gap-2">
                {state === 'editing' ? (
                    <>
                        <button
                            type="button"
                            onClick={() => { setSubject(draft.subject); setBody(draft.body); setState('pending'); setPolishedAs(null) }}
                            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors"
                        >
                            <X className="h-3 w-3" aria-hidden="true" />
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => setState('edited')}
                            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                            Save
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => setState('editing')}
                            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors"
                        >
                            <Pencil className="h-3 w-3" aria-hidden="true" />
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => setState('sent')}
                            className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <Send className="h-3 w-3" aria-hidden="true" />
                            Send
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default function ARDepositsPanel() {
    const viewAs = useViewAs()
    // W11 · Dealer mirror · hide AR panel entirely in dealer view (manufacturer-internal)
    if (viewAs === 'dealer') return null

    // ── KPIs (computed from AR_RECORDS) ───────────────────────────────────
    const outstanding = AR_RECORDS.reduce((s, r) => s + r.amount, 0)
    const awaitingDeposit = AR_RECORDS.filter(r => r.docType === 'Deposit')
    const awaitingDepositTotal = awaitingDeposit.reduce((s, r) => s + r.amount, 0)
    const pastDue = AR_RECORDS.filter(r => r.daysPastDue > 0)
    const pastDueTotal = pastDue.reduce((s, r) => s + r.amount, 0)
    const escalated = AR_RECORDS.filter(r => r.tone === 'escalated')
    const escalatedTotal = escalated.reduce((s, r) => s + r.amount, 0)

    const kpis: { label: string; value: string; sub?: string; tone: string }[] = [
        { label: 'Total outstanding', value: fmt(outstanding), sub: `${AR_RECORDS.length} records`, tone: 'text-foreground' },
        { label: 'Awaiting deposit', value: fmt(awaitingDepositTotal), sub: `${awaitingDeposit.length} deposits`, tone: 'text-foreground' },
        { label: 'Past due', value: fmt(pastDueTotal), sub: `${pastDue.length} accounts`, tone: 'text-warning' },
        { label: 'Escalated', value: fmt(escalatedTotal), sub: `${escalated.length} account${escalated.length === 1 ? '' : 's'}`, tone: 'text-destructive' },
    ]

    // ── Outstanding · grouped by urgency ──────────────────────────────────
    const GROUP_ORDER: AgingTone[] = ['escalated', 'past-due', 'due-soon', 'current']
    const groups = GROUP_ORDER
        .map(tone => ({ tone, rows: AR_RECORDS.filter(r => r.tone === tone) }))
        .filter(g => g.rows.length)

    const tabs = [
        { key: 'outstanding', label: 'Outstanding', count: AR_RECORDS.length },
        { key: 'credit', label: 'Credit', count: CREDIT_RECORDS.length },
        { key: 'payments', label: 'Payments', count: PAYMENT_HISTORY.length },
        { key: 'drafts', label: 'Drafts', count: DRAFTS.length },
    ]

    return (
        <div className="space-y-4" aria-labelledby="ar-deposits-heading">
            {/* KPI strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {kpis.map(k => (
                    <div key={k.label} className="rounded-lg border border-border bg-card px-3 py-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{k.label}</div>
                        <div className={`text-lg font-bold tabular-nums ${k.tone}`}>{k.value}</div>
                        {k.sub && <div className="text-[10px] text-muted-foreground">{k.sub}</div>}
                    </div>
                ))}
            </div>

            {/* Tabs by category */}
            <TabGroup>
                <TabList className="flex items-center gap-1 border-b border-border overflow-x-auto">
                    {tabs.map(t => (
                        <Tab key={t.key} className="outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                            {({ selected }: { selected: boolean }) => (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors ${selected ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                                    {t.label}
                                    <span className={`inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded text-[10px] font-bold ${selected ? 'bg-primary/15 text-foreground' : 'bg-muted text-muted-foreground'}`}>{t.count}</span>
                                </span>
                            )}
                        </Tab>
                    ))}
                </TabList>

                <TabPanels className="mt-3">
                    {/* ── Outstanding · grouped by urgency ── */}
                    <TabPanel className="outline-none">
                        <div className="overflow-x-auto rounded-lg border border-border">
                            <table className="min-w-full">
                                <thead className="bg-muted/30">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dealer / Project</th>
                                        <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">PO</th>
                                        <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Doc</th>
                                        <th className="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                                        <th className="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Aging</th>
                                        <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {groups.map(g => {
                                        const subtotal = g.rows.reduce((s, r) => s + r.amount, 0)
                                        return (
                                            <Fragment key={g.tone}>
                                                <tr className="bg-muted/20">
                                                    <td colSpan={6} className="px-4 py-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${toneClass(g.tone)}`}>
                                                                {g.tone === 'escalated' && <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />}
                                                                {TONE_LABEL[g.tone]}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">{g.rows.length} {g.rows.length === 1 ? 'account' : 'accounts'}</span>
                                                            <span className="ml-auto text-[11px] font-bold tabular-nums text-foreground">{fmt(subtotal)}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {g.rows.map(r => (
                                                    <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                                                        <td className="px-4 py-2.5">
                                                            <div className="text-xs font-medium text-foreground">{r.dealer}</div>
                                                            <div className="text-[10px] text-muted-foreground">{r.project}</div>
                                                        </td>
                                                        <td className="px-4 py-2.5">
                                                            <span className="text-[11px] font-mono text-foreground">{r.poNumber}</span>
                                                        </td>
                                                        <td className="px-4 py-2.5">
                                                            <span className="text-[11px] text-foreground">{r.docType}</span>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right">
                                                            <span className="text-xs font-bold text-foreground tabular-nums">{fmt(r.amount)}</span>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right">
                                                            {r.daysPastDue > 0 ? (
                                                                <span className="inline-flex items-center gap-1 text-[11px] text-foreground tabular-nums">
                                                                    <Clock className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                                                                    {r.daysPastDue}d past due
                                                                </span>
                                                            ) : r.daysToDeposit ? (
                                                                <span className="text-[11px] text-muted-foreground tabular-nums">{r.daysToDeposit}d to deposit</span>
                                                            ) : (
                                                                <span className="text-[11px] text-muted-foreground">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2.5">
                                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${toneClass(r.tone)}`}>
                                                                {r.tone === 'escalated' && <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />}
                                                                {TONE_LABEL[r.tone]}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </Fragment>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </TabPanel>

                    {/* ── Credit status by dealer ── */}
                    <TabPanel className="outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {CREDIT_RECORDS.map(c => {
                                const utilizationPct = Math.min(100, Math.round((c.used / c.creditLimit) * 100))
                                return (
                                    <div key={c.dealer} className="rounded-lg border border-border bg-card p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-foreground truncate">{c.dealer}</div>
                                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                                    Limit {fmt(c.creditLimit)} · Used {fmt(c.used)} · Avail {c.available < 0 ? `-${fmt(Math.abs(c.available))}` : fmt(c.available)}
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${creditStatusClass(c.status)}`}>
                                                {CREDIT_STATUS_LABEL[c.status]}
                                            </span>
                                        </div>
                                        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={`h-full ${c.status === 'good-standing' ? 'bg-success' : c.status === 'watch' ? 'bg-warning' : 'bg-destructive'}`}
                                                style={{ width: `${utilizationPct}%` }}
                                                aria-label={`Credit utilization ${utilizationPct}%`}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] text-muted-foreground italic mt-1">
                                            <span>{utilizationPct}% utilization</span>
                                            <span>Last review {c.lastReview}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </TabPanel>

                    {/* ── Payment history ── */}
                    <TabPanel className="outline-none">
                        <div className="overflow-x-auto rounded-lg border border-border">
                            <table className="min-w-full">
                                <thead className="bg-muted/30">
                                    <tr>
                                        <th className="px-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment</th>
                                        <th className="px-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dealer / PO</th>
                                        <th className="px-3 py-1.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                                        <th className="px-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Method</th>
                                        <th className="px-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Applied to</th>
                                        <th className="px-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Received</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {PAYMENT_HISTORY.map(p => (
                                        <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-3 py-2">
                                                <span className="text-[11px] font-mono text-foreground">{p.id}</span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="text-[11px] font-medium text-foreground truncate max-w-[180px]">{p.dealer}</div>
                                                <div className="text-[10px] font-mono text-muted-foreground">{p.poNumber}</div>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <span className="text-xs font-bold text-success tabular-nums">+{fmt(p.amount)}</span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="text-[10px] font-medium text-foreground">{p.method}</span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="text-[10px] text-muted-foreground">{p.appliedTo}</span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="text-[10px] text-muted-foreground tabular-nums">{p.receivedAt}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabPanel>

                    {/* ── AI-drafted emails ── */}
                    <TabPanel className="outline-none">
                        <div className="flex items-center gap-2 mb-3">
                            <Mail className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">AI-drafted emails · review and send</span>
                        </div>
                        <div className="space-y-3">
                            {DRAFTS.map(d => (
                                <DraftCard key={d.id} draft={d} record={AR_RECORDS.find(r => r.id === d.recordId)} />
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground italic mt-3">
                            Drafts only · you review and send · Strata never auto-sends to clients
                        </p>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    )
}
