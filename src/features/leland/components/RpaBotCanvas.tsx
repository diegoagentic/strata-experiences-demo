/**
 * COMPONENT: RpaBotCanvas
 * PURPOSE: Step l1.6 canvas — mock Seradex SO form being filled by an RPA
 *          bot. Shows a stylised form with header pre-filled from the matched
 *          quote, then a sequence of fields that fill one-by-one with a
 *          virtual lime cursor "hopping" between them. Closes with a
 *          generated SO number reveal.
 *
 *          This is the most cinematic step of the demo — the "watch the bot
 *          fill the form" moment that visually sells RPA → API automation.
 *
 *          Self-indicated step (DemoAIIndicator returns null for l1.6).
 *
 * USED BY: LelandStrataShell when currentStep.id === 'l1.6'
 */

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Cpu, MousePointer2, Database } from 'lucide-react';
import StatusBadge from '../../../components/shared/StatusBadge';
import StepCompletionCta from './StepCompletionCta';
import { usePauseAware } from '../../../context/usePauseAware';
import { HERO_PO_HAPPY } from '../../../config/profiles/leland-data';

interface FillField {
    id: string;
    label: string;
    value: string;
    /** grid column span on the form */
    colSpan?: 1 | 2 | 3;
}

const FIELDS: FillField[] = [
    { id: 'so-number',     label: 'SO Number',          value: 'auto-assigned',     colSpan: 1 },
    { id: 'so-date',       label: 'SO Date',            value: '2026-04-17',        colSpan: 1 },
    { id: 'order-status',  label: 'Order Status',       value: 'Processing',        colSpan: 1 },
    { id: 'commission',    label: 'Commission deduct',  value: '-$831.02',          colSpan: 1 },
    { id: 'project-udf',   label: 'UDF · Project',      value: 'State University',  colSpan: 2 },
    { id: 'industry-udf',  label: 'UDF · Industry',     value: 'Higher Education',  colSpan: 1 },
    { id: 'specifier-udf', label: 'UDF · Specifier',    value: 'Northeast Office',  colSpan: 2 },
    { id: 'comment-tag',   label: 'Comment · PO# TAG',  value: 'A173125-2',         colSpan: 1 },
    { id: 'cbd-comment',   label: 'Comment · CBD 24hr', value: 'Required',          colSpan: 1 },
];

const FILL_INTERVAL_MS = 380;

interface RpaBotCanvasProps {
    autoplay?: boolean;
}

export default function RpaBotCanvas({ autoplay = true }: RpaBotCanvasProps) {
    const po = HERO_PO_HAPPY;
    const [filledCount, setFilledCount] = useState(autoplay ? 0 : FIELDS.length);
    const [showFinalSpinner, setShowFinalSpinner] = useState(false);
    const [soNumber, setSoNumber] = useState<string | null>(null);
    const { pauseAwareTimeout } = usePauseAware();

    // Fill fields one by one
    useEffect(() => {
        if (!autoplay) return;
        if (filledCount < FIELDS.length) {
            return pauseAwareTimeout(() => setFilledCount(c => c + 1), FILL_INTERVAL_MS);
        }
        // After all fields filled → spinner → SO# reveal
        if (!showFinalSpinner) {
            return pauseAwareTimeout(() => setShowFinalSpinner(true), 400);
        }
        if (showFinalSpinner && !soNumber) {
            return pauseAwareTimeout(() => setSoNumber('SO 2604102'), 800);
        }
    }, [autoplay, filledCount, showFinalSpinner, soNumber, pauseAwareTimeout]);

    const isComplete = !!soNumber;
    const activeFieldId = filledCount > 0 && filledCount <= FIELDS.length ? FIELDS[filledCount - 1].id : null;

    return (
        <div className="space-y-3">
            {/* Status header */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-ai/10 text-ai flex items-center justify-center">
                        <Cpu className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Building the order from the matched quote</div>
                        <div className="text-[10px] text-muted-foreground">
                            {isComplete
                                ? `All fields written · order number assigned`
                                : `Filling fields one by one`}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <StatusBadge
                        label={isComplete ? 'Done' : showFinalSpinner ? 'Submitting' : 'Filling'}
                        tone={isComplete ? 'success' : 'ai'}
                        size="sm"
                        icon={isComplete ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                    />
                </div>
            </div>

            {/* Mock order system form */}
            <div className="bg-white dark:bg-zinc-100 text-zinc-900 rounded-xl border-2 border-border shadow-sm overflow-hidden">
                {/* Form chrome — looks like a generic ERP */}
                <div className="px-4 py-2 border-b border-zinc-200 bg-muted flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-bold text-muted-foreground">Order System · Sales Order Entry</span>
                    <span className="text-[10px] text-muted-foreground">· From the matched quote</span>
                </div>

                {/* Pre-filled header (from quote — instant) */}
                <div className="px-4 py-3 border-b border-zinc-200 bg-muted/40">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Pre-filled from quote</div>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <PreFilledCell label="Customer" value={po.dealer} />
                        <PreFilledCell label="Ship To" value={po.shipTo.name} />
                        <PreFilledCell label="Contract" value="Government" />
                    </div>
                </div>

                {/* Fields being filled automatically */}
                <div className="p-4">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <MousePointer2 className="h-2.5 w-2.5" /> Filling automatically
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {FIELDS.map((f, i) => {
                            const filled = i < filledCount;
                            const active = activeFieldId === f.id && filled;
                            const colClass = f.colSpan === 2 ? 'col-span-2' : f.colSpan === 3 ? 'col-span-3' : 'col-span-1';
                            return (
                                <FormField
                                    key={f.id}
                                    label={f.label}
                                    value={filled ? f.value : ''}
                                    active={active}
                                    colClass={colClass}
                                />
                            );
                        })}
                    </div>

                    {/* Submit row */}
                    <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">All fields locked · ready to commit</span>
                        <div
                            className={`
                                inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-bold
                                ${showFinalSpinner ? 'bg-zinc-700 text-white' : 'bg-zinc-200 text-muted-foreground'}
                                transition-colors
                            `}
                        >
                            {showFinalSpinner && <Loader2 className="h-3 w-3 animate-spin" />}
                            <span>{soNumber ? 'Generated' : showFinalSpinner ? 'Generating…' : 'Generate'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SO# reveal */}
            {soNumber && (
                <div className="rounded-2xl border-2 border-success/40 bg-success/5 dark:bg-success/10 p-5 text-center animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-success mb-2">Sales order created</div>
                    <div className="text-3xl font-mono font-bold text-foreground tabular-nums">{soNumber}</div>
                    <div className="mt-2 text-[12px] text-muted-foreground">
                        Ready to add comments and the contract rebate
                    </div>
                </div>
            )}

            <StepCompletionCta
                visible={isComplete}
                label="Add comments and metadata"
                hint="Standard templates plus the contract rebate"
            />
        </div>
    );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function PreFilledCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded border border-zinc-200 bg-white px-2 py-1.5">
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="text-[12px] font-semibold text-zinc-900 truncate">{value}</div>
        </div>
    );
}

function FormField({ label, value, active, colClass }: { label: string; value: string; active: boolean; colClass: string }) {
    const filled = !!value;
    return (
        <div
            className={`
                ${colClass} rounded border px-2 py-1.5 transition-all relative
                ${filled ? 'bg-white border-zinc-300' : 'bg-zinc-100 border-dashed border-zinc-200'}
                ${active ? 'ring-2 ring-brand-400 dark:ring-brand-500' : ''}
            `}
        >
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="text-[12px] text-zinc-900 mt-0.5 min-h-[16px] truncate">
                {filled ? (
                    <span className={active ? 'animate-in fade-in duration-150' : ''}>{value}</span>
                ) : (
                    <span className="text-zinc-300">—</span>
                )}
            </div>
            {/* Virtual cursor indicator */}
            {active && (
                <div className="absolute -right-1 -top-1 size-3 rounded-full bg-brand-400 dark:bg-brand-500 animate-pulse shadow-md" />
            )}
        </div>
    );
}
