/**
 * COMPONENT: JoshuaReviewCard
 * PURPOSE: Reviewer's exception queue + packed review detail for step l1.4 —
 *          the single interactive moment of the demo. Shows:
 *          - Top stats: today's auto-approved count vs exceptions count
 *          - Queue list with the single packed exception (price catch)
 *          - Detail panel with PO line vs quote line side-by-side, delta,
 *            Strata's recommendation, and 3 action buttons
 *          - Approve auto-advances the demo to the next step
 *
 * USED BY: LelandReviewQueueApp when currentStep.id === 'l1.4'
 */

import { useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, ChevronRight, X, ArrowUpRight, ScaleIcon } from 'lucide-react';
import { HeroMetric } from 'strata-design-system';
import StatusBadge from '../../../components/shared/StatusBadge';
import { useDemo } from '../../../context/DemoContext';
import { HERO_PO_HAPPY, HERO_VALIDATION } from '../../../config/profiles/leland-data';

export default function JoshuaReviewCard() {
    const { nextStep } = useDemo();
    const po = HERO_PO_HAPPY;
    const [expanded, setExpanded] = useState(false);
    const [resolved, setResolved] = useState<'approved' | 'overridden' | 'escalated' | null>(null);

    // Hero line values (line 1 mismatch)
    const line1 = po.lineItems[0];
    const poPrice = line1.unitPrice - 17.55;
    const quotePrice = line1.unitPrice;
    const deltaPerUnit = -17.55;
    const totalImpact = HERO_VALIDATION.lineImpactUsd;

    function handleApprove() {
        setResolved('approved');
        // Advance demo after a brief reveal beat
        setTimeout(() => nextStep(), 1100);
    }

    return (
        <div className="space-y-4">
            {/* Top stats — today's review queue */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <HeroMetric
                    label="Approved automatically today"
                    value="Most"
                    sub="Standard orders never reach the queue"
                    tone="success"
                    icon={<CheckCircle2 className="h-4 w-4" />}
                />
                <HeroMetric
                    label="In the Reviewer's queue"
                    value="Only what matters"
                    sub="A fraction of yesterday's load"
                    tone="warning"
                    icon={<AlertTriangle className="h-4 w-4" />}
                />
                <HeroMetric
                    label="Time per review"
                    value="Seconds"
                    sub="Strata packs the full context"
                    tone="ai"
                    icon={<ShieldCheck className="h-4 w-4" />}
                />
            </div>

            {/* Queue list */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-foreground">Today's queue</div>
                        <div className="text-[10px] text-muted-foreground">
                            Only what needs a human decision shows up here
                        </div>
                    </div>
                    <StatusBadge label={resolved ? 'Resolved' : 'Action needed'} tone={resolved ? 'success' : 'warning'} size="sm" />
                </div>

                {/* Single exception card */}
                <div className="p-3">
                    <button
                        type="button"
                        id="joshua-exception-detail"
                        data-demo-target="joshua-exception-detail"
                        onClick={() => setExpanded(e => !e)}
                        className={`
                            w-full text-left rounded-xl border transition-colors p-4
                            ${expanded ? 'border-warning/50 bg-warning/5' : 'border-border bg-muted/20 hover:bg-muted/40'}
                        `}
                    >
                        <div className="flex items-start gap-3">
                            <div className="size-9 rounded-lg bg-warning/10 text-warning flex items-center justify-center shrink-0">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono font-bold text-foreground">PO {po.poNumber}</span>
                                    <StatusBadge label="Price difference · 1 line" tone="danger" size="xs" />
                                    <span className="text-[11px] text-muted-foreground">·</span>
                                    <span className="text-[11px] text-muted-foreground truncate">{po.dealer}</span>
                                </div>
                                <div className="text-[12px] text-muted-foreground mt-0.5">
                                    Line 1 · <span className="font-mono">{line1.sku}</span> · PO price below the approved quote ·
                                    <span className="text-danger font-bold"> ${totalImpact.toFixed(2)}</span> at risk
                                </div>
                            </div>
                            <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                        </div>
                    </button>

                    {expanded && (
                        <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Side-by-side comparison */}
                            <div className="rounded-xl border border-border bg-muted/40 p-4">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                                    <ScaleIcon className="h-3 w-3" /> Line 1 · side by side
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <DiffPanel
                                        label="On the PO"
                                        value={`$${poPrice.toFixed(2)}`}
                                        tone="danger"
                                        sub={`${line1.qty} units`}
                                    />
                                    <DiffPanel
                                        label="On the approved quote"
                                        value={`$${quotePrice.toFixed(2)}`}
                                        tone="success"
                                        sub={`${line1.qty} units`}
                                    />
                                </div>
                                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[12px]">
                                    <span className="text-muted-foreground">Total at risk on this line</span>
                                    <span className="font-mono font-bold text-danger tabular-nums">
                                        ${totalImpact.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Strata recommendation */}
                            <div className="rounded-xl border border-ai/30 bg-ai/5 dark:bg-ai/10 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="size-6 rounded-md bg-ai/15 text-ai flex items-center justify-center">
                                        <ShieldCheck className="h-3 w-3" />
                                    </div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-ai">Recommendation</span>
                                </div>
                                <div className="text-[13px] text-foreground leading-snug">
                                    Use the approved quote price · flag the dealer for the next 30 days for follow-up pricing checks.
                                </div>
                            </div>

                            {/* Action buttons OR resolved state */}
                            {!resolved ? (
                                <div className="flex flex-wrap items-center gap-2 justify-end">
                                    <ActionButton
                                        label="Escalate"
                                        icon={<ArrowUpRight className="h-3.5 w-3.5" />}
                                        tone="neutral"
                                        onClick={() => setResolved('escalated')}
                                    />
                                    <ActionButton
                                        label="Use PO price"
                                        icon={<X className="h-3.5 w-3.5" />}
                                        tone="neutral"
                                        onClick={() => setResolved('overridden')}
                                    />
                                    <ActionButton
                                        label="Approve · use quote price"
                                        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                                        tone="primary"
                                        onClick={handleApprove}
                                    />
                                </div>
                            ) : (
                                <div className={`
                                    flex items-center gap-2 rounded-lg border p-3 text-[12px] animate-in fade-in duration-200
                                    ${resolved === 'approved' ? 'border-success/40 bg-success/5 text-success' : ''}
                                    ${resolved === 'overridden' ? 'border-warning/40 bg-warning/5 text-warning' : ''}
                                    ${resolved === 'escalated' ? 'border-info/40 bg-info/5 text-info' : ''}
                                `}>
                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                                    <span className="font-semibold">
                                        {resolved === 'approved' && `Approved · Strata is resuming the order with the quote price`}
                                        {resolved === 'overridden' && `Override recorded · order will use the PO price`}
                                        {resolved === 'escalated' && `Escalated · awaiting reply`}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Sub-text — the Reviewer's perspective */}
            <div className="text-[11.5px] text-muted-foreground italic px-1">
                The Reviewer: "Before Strata, every order came through me. Now I only see {' '}
                <span className="text-foreground font-semibold">what truly needs me</span> — and the context is already there."
            </div>
        </div>
    );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function DiffPanel({ label, value, tone, sub }: { label: string; value: string; tone: 'danger' | 'success'; sub: string }) {
    const toneClass = tone === 'danger' ? 'border-danger/30 bg-danger/5' : 'border-success/30 bg-success/5';
    const valueClass = tone === 'danger' ? 'text-danger' : 'text-success';
    return (
        <div className={`rounded-lg border ${toneClass} p-3`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className={`mt-1 text-xl font-mono font-bold tabular-nums ${valueClass}`}>{value}</div>
            <div className="mt-0.5 text-[10.5px] text-muted-foreground">{sub}</div>
        </div>
    );
}

function ActionButton({
    label,
    icon,
    tone,
    onClick,
}: {
    label: string;
    icon: React.ReactNode;
    tone: 'neutral' | 'primary';
    onClick: () => void;
}) {
    const baseClasses = 'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors';
    const toneClasses = tone === 'primary'
        ? 'bg-brand-300 dark:bg-brand-500 text-zinc-900 hover:bg-brand-400 dark:hover:bg-brand-600/80 shadow-[0_4px_14px_-4px_rgba(198,228,51,0.55)]'
        : 'border border-border bg-card hover:bg-muted text-foreground';
    return (
        <button type="button" onClick={onClick} className={`${baseClasses} ${toneClasses}`}>
            {icon}
            {label}
        </button>
    );
}
