/**
 * COMPONENT: CommentsRebateCanvas
 * PURPOSE: Step l1.7 canvas — 5 SO comment templates fill in cascade,
 *          UDF list populates, then commission rebate banner appears with
 *          the -$831.02 line. The "Strata knows your specific rules" beat.
 *
 * USED BY: LelandStrataShell when currentStep.id === 'l1.7'
 */

import { useEffect, useState } from 'react';
import { CheckCircle2, MessageSquare, FileBadge, DollarSign } from 'lucide-react';
import StatusBadge from '../../../components/shared/StatusBadge';
import StepCompletionCta from './StepCompletionCta';
import { usePauseAware } from '../../../context/usePauseAware';
import { HERO_PO_HAPPY } from '../../../config/profiles/leland-data';

interface CommentTemplate {
    id: string;
    type: string;
    body: string;
}

const COMMENTS: CommentTemplate[] = [
    { id: 'po-tag',    type: 'PO# TAG',           body: `MARK CARTONS AND INVOICES ${HERO_PO_HAPPY.poNumber}` },
    { id: 'cbd',       type: 'Call Before Delivery 24hr', body: 'Required · contact ndiaks@northeast.example before truck dispatch' },
    { id: 'ship-date', type: 'Ship Date',         body: 'SHIP TO ARRIVE WEEK OF 07-20-2026' },
    { id: 'shipping',  type: 'Shipping',          body: 'Common carrier · Zone 2 · packing list required' },
    { id: 'in-house',  type: 'In-house · Work Order', body: 'Standard configuration · no engineering required' },
];

interface UdfField {
    label: string;
    value: string;
}

const UDFS: UdfField[] = [
    { label: 'Project Name', value: HERO_PO_HAPPY.project },
    { label: 'Bill To Contact', value: 'ndiaks@northeast.example' },
    { label: 'Industry', value: 'Higher Education' },
    { label: 'Specifier', value: 'Northeast Office Group' },
];

const STAGGER_MS = 350;

export default function CommentsRebateCanvas({ autoplay = true }: { autoplay?: boolean }) {
    const totalSteps = COMMENTS.length + UDFS.length + 1; // +1 for rebate banner
    const [step, setStep] = useState(autoplay ? 0 : totalSteps);
    const { pauseAwareTimeout } = usePauseAware();

    useEffect(() => {
        if (!autoplay || step >= totalSteps) return;
        return pauseAwareTimeout(() => setStep(s => s + 1), STAGGER_MS);
    }, [autoplay, step, totalSteps, pauseAwareTimeout]);

    const commentsRevealed = Math.min(step, COMMENTS.length);
    const udfsRevealed = Math.max(0, Math.min(step - COMMENTS.length, UDFS.length));
    const showRebate = step > COMMENTS.length + UDFS.length;

    return (
        <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Comments column (2 cols on lg) */}
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-ai/10 text-ai flex items-center justify-center">
                            <MessageSquare className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-foreground">SO Comments · 5 templates</div>
                            <div className="text-[10px] text-muted-foreground">Auto-populated from PO body + email + ship instructions</div>
                        </div>
                    </div>
                    <StatusBadge label={`${commentsRevealed}/${COMMENTS.length}`} tone="ai" size="sm" />
                </div>
                <div className="p-3 space-y-2">
                    {COMMENTS.slice(0, commentsRevealed).map((c, i) => (
                        <div
                            key={c.id}
                            className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/20 px-3 py-2 animate-in fade-in slide-in-from-left-2 duration-200"
                            style={{ animationDelay: `${i * 80}ms` }}
                        >
                            <div className="size-6 rounded bg-success/15 text-success flex items-center justify-center shrink-0">
                                <CheckCircle2 className="h-3 w-3" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-[11px] font-bold text-foreground">{c.type}</div>
                                <div className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">{c.body}</div>
                            </div>
                        </div>
                    ))}
                    {Array.from({ length: COMMENTS.length - commentsRevealed }).map((_, i) => (
                        <div key={`ph-${i}`} className="rounded-lg border border-dashed border-border/40 bg-muted/10 px-3 py-2 opacity-50">
                            <div className="h-2 bg-muted rounded w-32" />
                            <div className="h-2 bg-muted rounded w-48 mt-1.5" />
                        </div>
                    ))}
                </div>
            </div>

            {/* UDFs + Rebate column */}
            <div className="space-y-3">
                {/* UDFs */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="size-7 rounded-lg bg-info/10 text-info flex items-center justify-center">
                                <FileBadge className="h-3.5 w-3.5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-foreground">User-defined fields</div>
                                <div className="text-[10px] text-muted-foreground">{UDFS.length} fields</div>
                            </div>
                        </div>
                    </div>
                    <div className="p-3 space-y-1.5">
                        {UDFS.slice(0, udfsRevealed).map((u, i) => (
                            <div
                                key={u.label}
                                className="flex items-baseline justify-between gap-2 text-[11.5px] animate-in fade-in slide-in-from-right-2 duration-200"
                                style={{ animationDelay: `${i * 80}ms` }}
                            >
                                <span className="text-muted-foreground shrink-0">{u.label}</span>
                                <span className="text-foreground font-semibold truncate text-right">{u.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Commission rebate banner */}
                {showRebate && (
                    <div className="rounded-2xl border-2 border-warning/40 bg-warning/5 dark:bg-warning/10 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="size-7 rounded-lg bg-warning/15 text-warning flex items-center justify-center">
                                <DollarSign className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-warning">Contract rebate detected</span>
                        </div>
                        <div className="text-[13px] text-foreground font-semibold mt-1">
                            Rebate line added automatically
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
                            Required by the contract · this is a detail that's easy to miss when typed by hand.
                        </div>
                    </div>
                )}
            </div>
        </div>

        <StepCompletionCta
            visible={showRebate}
            label="Log the order · close the ticket"
            hint="HubSpot ticket → Closed · tracker → Completed"
        />
        </div>
    );
}
