/**
 * COMPONENT: QuoteSendProposalScene
 * PURPOSE: Flow 3 · Scene 3 — Proposal creation.
 *          Format selector (Formal vs Budget) at top; selected option
 *          renders full-width with document preview + send CTA.
 *
 * USED BY: MBIQuotesPage (wizard scene 3)
 */

import { useState } from 'react'
import {
    Send, FileText, Clock, Palette,
    Receipt, Sparkles, Download, Mail, BarChart3,
    ChevronRight,
} from 'lucide-react'

// ─── Tab button — same pattern as MBIAccountingPage ──────────────────────────
function TabButton({ active, onClick, icon, label }: {
    active: boolean
    onClick: () => void
    icon: React.ReactNode
    label: string
}) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                active
                    ? 'bg-card dark:bg-zinc-700 text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
            }`}
        >
            {icon}
            {label}
        </button>
    )
}
import FlowHandoff from './FlowHandoff'
import DataSourcesBar, { SOURCES } from './DataSourcesBar'
import { StatusBadge } from '../shared'

type Format = 'formal' | 'budget'

export default function QuoteSendProposalScene() {
    const [format, setFormat] = useState<Format>('budget')
    const [sent, setSent] = useState(false)
    const [sentAt, setSentAt] = useState<Date | null>(null)

    const handleSend = () => {
        setSent(true)
        setSentAt(new Date())
    }

    return (
        <div className="space-y-4">

            {/* ── Format selector — same pill-tab pattern as Accounting AI ── */}
            <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground font-medium">Choose proposal format</span>
            <div className="flex gap-1 bg-muted/40 dark:bg-zinc-800/60 border border-border rounded-xl p-1 w-fit">
                <TabButton
                    active={format === 'formal'}
                    onClick={() => setFormat('formal')}
                    icon={<Mail className="h-3.5 w-3.5" />}
                    label="Formal proposal"
                />
                <TabButton
                    active={format === 'budget'}
                    onClick={() => setFormat('budget')}
                    icon={<BarChart3 className="h-3.5 w-3.5" />}
                    label="Budget proposal"
                />
            </div>
            </div>

            {/* ── Post-send handoff ── */}
            {sent && (
                <FlowHandoff
                    eyebrow="Flow 2 complete"
                    recapHeading="PC bottleneck · collapsed"
                    recapSubheading="4 audit loops → 1 AI pass + 1 human review. What used to take 2 hours per proposal takes 12 minutes."
                    recapStats={[
                        { icon: <Clock className="h-4 w-4" />, value: '12 min', sub: 'vs 2h per proposal', accent: 'text-success' },
                        { icon: <Sparkles className="h-4 w-4" />, value: '4 → 1+1', sub: 'audit loops collapsed', accent: 'text-success' },
                        { icon: <Send className="h-4 w-4" />, value: '1 proposal', sub: 'delivered · awaiting sign-off' },
                    ]}
                    timeline={[
                        { status: 'done', icon: <FileText className="h-3.5 w-3.5" />, label: 'Budget → PC queue', caption: 'signed last week', flow: 'Flow 2 · Quotes AI' },
                        { status: 'done', icon: <Sparkles className="h-3.5 w-3.5" />, label: 'Quote QUOT-2026-003 confirmed · GP reviewed', caption: 'PC reviewed GP · Strata calculated sell prices', flow: '—' },
                        { status: 'done', icon: <Send className="h-3.5 w-3.5" />, label: 'Proposal delivered to client', caption: 'just now', flow: '—' },
                        { status: 'future', icon: <Palette className="h-3.5 w-3.5" />, label: 'Phase 4 · Design AI', caption: 'available via the Design AI tab', flow: 'Phase 4 directional', highlight: false },
                    ]}
                    narrative={{
                        eyebrow: 'Tour complete · what comes next',
                        icon: <Palette className="h-5 w-5" />,
                        title: "Phase 1 (Accounting) + Phase 3 (Quotes) are the active demo. Phase 4 is directional.",
                        body: (
                            <>
                                The active tour ends here — <strong className="text-foreground">Phase 1 ships
                                Accounting AI</strong> and the <strong className="text-foreground">Quotes
                                AI</strong> module is the natural next step (Phase 4 of the roadmap). Spec
                                Check (Q10 #1 priority for the design team) is built and available via the
                                <strong className="text-foreground"> Design AI</strong> tab in the navbar
                                if the conversation goes there — but it's not part of the Phase 1 demo focus.
                            </>
                        ),
                    }}
                    primaryCTA={{
                        label: "Restart from Accounting",
                        icon: <Receipt className="h-4 w-4" />,
                        targetStepId: 'm2.1',
                    }}
                />
            )}

            {/* ── Selected format content ── */}
            {format === 'formal'
                ? <FormalProposalPanel sent={sent} sentAt={sentAt} onSend={handleSend} />
                : <BudgetProposalPanel sent={sent} sentAt={sentAt} onSend={handleSend} />
            }
        </div>
    )
}

// ─── Shared send bar ──────────────────────────────────────────────────────────

function SendBar({
    sent, sentAt, onSend,
}: {
    sent: boolean
    sentAt: Date | null
    onSend: () => void
}) {
    return (
        <div className={`px-4 py-3 border-t border-border flex items-center gap-3 ${
            sent ? 'bg-success/5 dark:bg-success/10' : 'bg-muted/10'
        }`}>
            <div className="flex-1 min-w-0">
                {sent && sentAt ? (
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-[11px] text-success font-semibold inline-flex items-center gap-1">
                            <Send className="h-3 w-3" />
                            Sent {sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · copy to Amanda + sales rep
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            Pending Client Approval
                        </span>
                    </div>
                ) : (
                    <div className="text-[11px] text-muted-foreground">
                        Notifies Amanda and the sales rep · marks project awaiting sign-off.
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI] }, { sources: [SOURCES.OUTLOOK] }]} />
                {!sent && (
                    <button
                        onClick={onSend}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
                    >
                        <Send className="h-3.5 w-3.5" />
                        Send to Enterprise
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </div>
    )
}

// ─── Formal proposal panel ────────────────────────────────────────────────────

function FormalProposalPanel({ sent, sentAt, onSend }: { sent: boolean; sentAt: Date | null; onSend: () => void }) {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                        <Mail className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Formal Proposal · QUOT-2026-003</div>
                        <div className="text-[10px] text-muted-foreground">Enterprise Holdings · New HQ Floor 12 · {today}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <div className="text-right shrink-0">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PC effort</div>
                            <div className="text-sm font-bold text-success">~12 min <span className="text-muted-foreground font-normal text-[10px]">was 2h</span></div>
                        </div>
                    </div>
                    {sent
                        ? <StatusBadge label="Sent" tone="success" size="sm" />
                        : <StatusBadge label="Draft" tone="warning" size="sm" />
                    }
                    <button className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted" title="Download PDF">
                        <Download className="h-3 w-3" />
                        PDF
                    </button>
                </div>
            </div>

            {/* Document body — formal letter style */}
            <div className="p-6 max-h-[480px] overflow-y-auto space-y-5 font-serif text-sm text-foreground leading-relaxed">
                <div className="text-right text-[11px] text-muted-foreground not-italic font-sans">{today}</div>

                <div className="space-y-0.5 text-[12px]">
                    <div className="font-bold">Enterprise Holdings</div>
                    <div className="text-muted-foreground">New Headquarters · Floor 12</div>
                    <div className="text-muted-foreground">Attn: Procurement &amp; Facilities</div>
                </div>

                <p>
                    Dear Enterprise Holdings team,
                </p>
                <p>
                    We are pleased to present our proposal for the complete interior furnishing of your new headquarters, Floor 12.
                </p>

                <div className="not-italic font-sans border border-border rounded-xl p-4 space-y-2 bg-primary/5 dark:bg-primary/10">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Project summary</div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div><span className="text-muted-foreground">Client</span><br /><strong>Enterprise Holdings</strong></div>
                        <div><span className="text-muted-foreground">Project</span><br /><strong>New HQ · Floor 12</strong></div>
                        <div><span className="text-muted-foreground">Total investment</span><br /><strong className="text-lg text-foreground">$372,500</strong></div>
                        <div><span className="text-muted-foreground">Contract</span><br /><strong>HNI Corporate 55%</strong></div>
                        <div><span className="text-muted-foreground">Line items</span><br /><strong>7 items · 3 vendors</strong></div>
                        <div><span className="text-muted-foreground">Est. completion</span><br /><strong>Week 11 from sign</strong></div>
                    </div>
                </div>

                <p>
                    The scope includes workstations, storage, seating, and lounge furnishings sourced from HNI, Allsteel, and BluDot. Delivery, installation, and freight are included in the total investment.
                </p>
                <p>
                    Upon your approval, we will place orders immediately and coordinate with your facilities team on delivery scheduling (Weeks 8–10) and final walk-through (Week 11).
                </p>
                <p>
                    We look forward to your sign-off and are available to discuss any adjustments at your convenience.
                </p>

                <div className="space-y-1 text-[12px]">
                    <div className="font-bold">Marcia Ludwig</div>
                    <div className="text-muted-foreground">Director of Project Management</div>
                    <div className="text-muted-foreground">Modern Business Interiors</div>
                </div>

                <p className="text-[10px] text-muted-foreground italic text-center font-sans">
                    Prepared by Strata AI · {today}
                </p>
            </div>

            <SendBar sent={sent} sentAt={sentAt} onSend={onSend} />
        </div>
    )
}

// ─── Budget proposal panel ────────────────────────────────────────────────────

function BudgetProposalPanel({ sent, sentAt, onSend }: { sent: boolean; sentAt: Date | null; onSend: () => void }) {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                        <BarChart3 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Budget Proposal · QUOT-2026-003</div>
                        <div className="text-[10px] text-muted-foreground">Enterprise Holdings · New HQ Floor 12 · {today}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right shrink-0">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PC effort</div>
                        <div className="text-sm font-bold text-success">~12 min <span className="text-muted-foreground font-normal text-[10px]">was 2h</span></div>
                    </div>
                    {sent
                        ? <StatusBadge label="Sent" tone="success" size="sm" />
                        : <StatusBadge label="Draft" tone="warning" size="sm" />
                    }
                    <button className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted" title="Download PDF">
                        <Download className="h-3 w-3" />
                        PDF
                    </button>
                </div>
            </div>

            {/* Document body */}
            <div className="p-4 max-h-[480px] overflow-y-auto space-y-4">

                {/* Total investment */}
                <div className="rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 px-4 py-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total investment</div>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-lg text-muted-foreground">$</span>
                        <span className="text-3xl font-bold text-foreground tabular-nums">372,500</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                        HNI Corporate contract · 7 line items · labor + freight included
                    </div>
                </div>

                {/* Financial breakdown */}
                <section className="space-y-2">
                    <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">Financial breakdown</div>
                    <dl className="space-y-1.5 px-1">
                        <BudgetRow label="Product subtotal" value="$349,500" />
                        <BudgetRow label="HNI Corporate contract (applied)" value="Included" note="55% contract locked" tone="success" />
                        <div className="border-t border-border pt-1.5">
                            <BudgetRow label="Product net" value="$349,500" bold />
                        </div>
                        <BudgetRow label="Labor (delivery + installation)" value="+$14,200" tone="info" />
                        <BudgetRow label="Freight" value="+$8,800" tone="info" />
                        <div className="border-t-2 border-primary/40 pt-2">
                            <BudgetRow label="Total proposal" value="$372,500" bold large />
                        </div>
                    </dl>
                </section>

                <p className="text-[10px] text-muted-foreground italic text-center">
                    Prepared by Strata AI · {today}
                </p>
            </div>

            <SendBar sent={sent} sentAt={sentAt} onSend={onSend} />
        </div>
    )
}

function BudgetRow({
    label, value, note, tone, bold, large,
}: {
    label: string
    value: string
    note?: string
    tone?: 'success' | 'info'
    bold?: boolean
    large?: boolean
}) {
    const valueColor = tone === 'success' ? 'text-success' : tone === 'info' ? 'text-info' : 'text-foreground'
    return (
        <div className="flex items-baseline justify-between gap-3 text-xs">
            <dt className={`${bold ? 'font-bold text-foreground' : 'text-muted-foreground'} flex items-center gap-1.5`}>
                {label}
                {note && <span className="text-[9px] text-muted-foreground italic">· {note}</span>}
            </dt>
            <dd className={`tabular-nums font-semibold ${valueColor} ${large ? 'text-base font-black' : ''}`}>{value}</dd>
        </div>
    )
}
