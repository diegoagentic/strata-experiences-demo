/**
 * COMPONENT: OutputStep
 * PURPOSE: Wizard step 6 — Output / Client Delivery. Shown after user approves
 *          the budget in Review step. Displays the generated artifacts (Excel
 *          breakdown + MBI-branded client PDF) with send/download CTAs.
 *
 *          After Send is clicked, the step transitions into a delivered state
 *          that renders FlowHandoff — the narrative bridge to Flow 2
 *          (Accounting AI) with a recap, downstream timeline, and jump CTAs.
 *
 * PROPS:
 *   - client: { name, project }
 *   - scenarioLabel: string
 *   - total: number
 *   - markup: number
 *   - preventedImpact: number
 *
 * STATES:
 *   - default  — artifacts visible, Send CTA active
 *   - delivered — Send disabled, FlowHandoff rendered with bridge to Flow 2
 *
 * DS TOKENS: bg-card · bg-success/5 · border-success/30 · primary accents
 *
 * USED BY: MBIBudgetPage (wizard step 5 · demo tour m1.5 after approve)
 */

import { useState } from 'react'
import {
    CheckCircle2, Download, Send, FileSpreadsheet, FileText, Sparkles,
    Clock, ShieldCheck, FileSignature, Package, Receipt, Palette, Calculator,
} from 'lucide-react'
import FlowHandoff from './FlowHandoff'

interface OutputStepProps {
    client: { name: string; project: string }
    scenarioLabel: string
    total: number
    markup: number
    preventedImpact: number
}

export default function OutputStep({ client, scenarioLabel, total, markup, preventedImpact }: OutputStepProps) {
    const [delivered, setDelivered] = useState(false)
    const [deliveredAt, setDeliveredAt] = useState<Date | null>(null)

    const handleSend = () => {
        setDelivered(true)
        setDeliveredAt(new Date())
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Success banner — pre/post delivery */}
            <div className={`
                border rounded-2xl p-5 flex items-start gap-4 transition-colors
                ${delivered ? 'bg-success/10 dark:bg-success/15 border-success/40' : 'bg-success/5 border-success/30'}
            `}>
                <div className="h-12 w-12 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <div className="text-base font-bold text-foreground">
                        {delivered
                            ? `Delivered to ${client.name}`
                            : 'Budget approved · artifacts ready for client delivery'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        {client.name} · {client.project} · Scenario: <span className="font-semibold text-foreground">{scenarioLabel}</span> · Total: <span className="font-bold text-foreground tabular-nums">${total.toLocaleString()}</span> · Markup <span className="font-bold text-foreground tabular-nums">{Math.round(markup * 100)}%</span>
                    </div>
                    {delivered && deliveredAt && (
                        <div className="text-[11px] text-success font-semibold mt-1 inline-flex items-center gap-1">
                            <Send className="h-3 w-3" />
                            Sent {deliveredAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · confirmation logged in SharePoint
                        </div>
                    )}
                </div>
                <div className="text-right shrink-0">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total time</div>
                    <div className="text-xl font-bold text-success">~4 min</div>
                    <div className="text-[10px] text-muted-foreground">was 1 week</div>
                </div>
            </div>

            {/* Artifact previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ArtifactCard
                    icon={<FileSpreadsheet className="h-5 w-5" />}
                    label="Excel breakdown"
                    filename={`Budget_${client.name.replace(/\s+/g, '')}_v1.xlsx`}
                    description="Line-item detail with markup, freight, install, contingency. Internal audit log attached."
                    ctaLabel="Download .xlsx"
                    ctaIcon={<Download className="h-4 w-4" />}
                    mockStyle="excel"
                />
                <ArtifactCard
                    icon={<FileText className="h-5 w-5" />}
                    label="Client summary PDF"
                    filename={`${client.name}_BudgetSummary.pdf`}
                    description="MBI-branded executive summary. Good/Better/Best scenarios · selected tier highlighted · locked for client."
                    ctaLabel={delivered ? 'Sent' : `Send to ${client.name}`}
                    ctaIcon={delivered ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                    ctaPrimary
                    ctaDisabled={delivered}
                    onCtaClick={delivered ? undefined : handleSend}
                    mockStyle="pdf"
                />
            </div>

            {/* Error prevention reminder — only pre-delivery */}
            {!delivered && preventedImpact > 0 && (
                <div className="bg-muted/20 dark:bg-zinc-800 border border-border rounded-2xl p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-ai/10 text-ai flex items-center justify-center">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-xs">
                        <div className="font-semibold text-foreground">Error prevention captured in audit log</div>
                        <div className="text-muted-foreground">
                            Strata caught and prevented <span className="font-bold text-success tabular-nums">${preventedImpact.toLocaleString()}</span> in potential errors before client delivery. Logged in SharePoint version trail.
                        </div>
                    </div>
                </div>
            )}

            {/* Post-delivery — narrative bridge to Flow 2 */}
            {delivered && (
                <FlowHandoff
                    eyebrow="Flow 1 complete"
                    recapHeading="Amanda's work here is done"
                    recapSubheading={`Budget delivered to ${client.name}. Here's what Strata did for her on this deal.`}
                    recapStats={[
                        { icon: <Clock className="h-4 w-4" />, value: '4 min', sub: 'vs 1 week before', accent: 'text-success' },
                        { icon: <ShieldCheck className="h-4 w-4" />, value: preventedImpact > 0 ? `$${preventedImpact.toLocaleString()}` : '—', sub: 'caught by AI', accent: 'text-success' },
                        { icon: <CheckCircle2 className="h-4 w-4" />, value: '2', sub: 'artifacts delivered' },
                        { icon: <FileText className="h-4 w-4" />, value: 'v1.0', sub: 'logged in SharePoint' },
                    ]}
                    timeline={[
                        { status: 'done', icon: <Send className="h-3.5 w-3.5" />, label: 'Budget sent', caption: 'just now', flow: 'Flow 1 · Budget Builder' },
                        { status: 'next', icon: <FileSignature className="h-3.5 w-3.5" />, label: 'Client approves', caption: '1–2 weeks', flow: '—' },
                        { status: 'future', icon: <FileText className="h-3.5 w-3.5" />, label: 'PO cut in CORE', caption: 'Quotes AI auto-builds', flow: 'Flow 3 · Quotes AI' },
                        { status: 'future', icon: <Package className="h-3.5 w-3.5" />, label: 'Orders placed', caption: 'weeks of execution', flow: '—' },
                        { status: 'future', icon: <Receipt className="h-3.5 w-3.5" />, label: 'Invoices arrive', caption: 'Kathy takes over', flow: 'Flow 2 · Accounting AI', highlight: true },
                    ]}
                    narrative={{
                        eyebrow: 'Fast forward · 3 weeks later',
                        icon: <Receipt className="h-5 w-5" />,
                        title: `Construction is underway at ${client.name}. Vendor invoices start flowing in.`,
                        body: (
                            <>
                                HealthTrust contracts trigger rebate logic, non-EDI manufacturers need line-by-line reconciliation, and the AR aging report needs to stay live for leadership. That's where <strong className="text-foreground">Operations Manager Rowe</strong>, MBI's Controller, takes over.
                            </>
                        ),
                    }}
                    primaryCTA={{
                        label: "Continue to Accounting AI · Controller's queue",
                        icon: <Receipt className="h-4 w-4" />,
                        targetStepId: 'm2.1',
                    }}
                    secondaryCTAs={[
                        { label: 'Quotes AI', icon: <Calculator className="h-3 w-3" />, targetStepId: 'm3.1' },
                        { label: 'Design AI', icon: <Palette className="h-3 w-3" />, targetStepId: 'm4.1' },
                    ]}
                />
            )}
        </div>
    )
}

// ─── Artifact preview card (internal) ────────────────────────────────────────
function ArtifactCard({
    icon,
    label,
    filename,
    description,
    ctaLabel,
    ctaIcon,
    ctaPrimary,
    ctaDisabled,
    onCtaClick,
    mockStyle,
}: {
    icon: React.ReactNode
    label: string
    filename: string
    description: string
    ctaLabel: string
    ctaIcon: React.ReactNode
    ctaPrimary?: boolean
    ctaDisabled?: boolean
    onCtaClick?: () => void
    mockStyle: 'excel' | 'pdf'
}) {
    return (
        <div className="bg-muted/20 dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${mockStyle === 'excel' ? 'bg-success/10 text-success' : 'bg-primary/10 text-zinc-900 dark:text-primary'}`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">{label}</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">{filename}</div>
                </div>
            </div>

            {/* Mock preview */}
            <div className={`aspect-[4/3] m-3 rounded-xl border border-border overflow-hidden ${mockStyle === 'excel' ? 'bg-muted/40' : 'bg-card'}`}>
                {mockStyle === 'excel' ? <ExcelMockup /> : <PDFMockup />}
            </div>

            {/* Description + CTA */}
            <div className="px-4 pb-4 space-y-3">
                <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
                <button
                    onClick={onCtaClick}
                    disabled={ctaDisabled}
                    className={`
                        w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-default
                        ${ctaPrimary
                            ? (ctaDisabled
                                ? 'bg-success/15 text-success border border-success/30'
                                : 'bg-primary text-zinc-900 hover:opacity-90 shadow-sm')
                            : 'bg-background dark:bg-zinc-800 border border-border text-foreground hover:bg-muted'
                        }
                    `}
                >
                    {ctaIcon}
                    {ctaLabel}
                </button>
            </div>
        </div>
    )
}

// ─── Mini Excel grid mockup ──────────────────────────────────────────────────
function ExcelMockup() {
    const rows = [
        { sku: 'ALS-FUR-PNL-60', qty: 45, price: '$920', total: '$41,400' },
        { sku: 'ALS-FUR-DSK-60', qty: 25, price: '$1,180', total: '$29,500' },
        { sku: 'ALS-SHA-DSK-72', qty: 20, price: '$1,485', total: '$29,700' },
        { sku: 'HON-IGN-TASK', qty: 42, price: '$425', total: '$17,850' },
        { sku: 'KNOLL-PROP-84', qty: 2, price: '$4,200', total: '$8,400' },
    ]
    return (
        <div className="h-full w-full text-[8px] font-mono p-2 overflow-hidden">
            <div className="grid grid-cols-[1fr_30px_40px_50px] gap-0 bg-success/20 text-foreground font-bold px-1 py-0.5 border-b border-success/40">
                <div>SKU</div><div className="text-right">Qty</div><div className="text-right">$/ea</div><div className="text-right">Total</div>
            </div>
            {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_30px_40px_50px] gap-0 px-1 py-0.5 border-b border-border/30 text-muted-foreground">
                    <div className="truncate">{r.sku}</div>
                    <div className="text-right tabular-nums">{r.qty}</div>
                    <div className="text-right tabular-nums">{r.price}</div>
                    <div className="text-right tabular-nums font-bold text-foreground">{r.total}</div>
                </div>
            ))}
            <div className="grid grid-cols-[1fr_80px_50px] gap-0 px-1 py-0.5 mt-1 border-t-2 border-border font-bold text-foreground">
                <div>Total</div><div></div><div className="text-right tabular-nums">$372,500</div>
            </div>
        </div>
    )
}

// ─── Mini PDF mockup ─────────────────────────────────────────────────────────
function PDFMockup() {
    return (
        <div className="h-full w-full p-3 text-[8px] text-foreground flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-1">
                <div className="font-bold text-[9px]">MBI · Budget Summary</div>
                <div className="text-muted-foreground">v1.0</div>
            </div>
            <div className="mt-2">
                <div className="font-bold text-[10px]">Enterprise Holdings</div>
                <div className="text-muted-foreground text-[7px]">New HQ Floor 12 · Corporate</div>
            </div>
            <div className="mt-2 space-y-1">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Good</span>
                    <span className="tabular-nums">$322K</span>
                </div>
                <div className="flex justify-between bg-primary/20 text-zinc-900 dark:text-zinc-900 font-bold px-1 rounded">
                    <span>⭐ Mid-Range</span>
                    <span className="tabular-nums">$372K</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Premium</span>
                    <span className="tabular-nums">$418K</span>
                </div>
            </div>
            <div className="mt-auto text-[7px] text-muted-foreground italic">
                Prepared by Strata for MBI
            </div>
        </div>
    )
}
