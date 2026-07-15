import * as React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * PipelineRail — vertical stepper / sidebar rail for guided flows.
 *
 * Extracted from `src/features/leland/components/PipelineRail.tsx` and
 * decoupled from DemoContext so any caller can drive it with explicit
 * props (steps + currentId). Complements the existing horizontal
 * `FunnelStepper` (both surfaces represent stages of the same pipeline).
 *
 * Step state is derived from the step index vs the current step:
 *   · done    — before the active index
 *   · active  — the current step (Loader2 spinning)
 *   · pending — after the active index
 *
 * ─── Relation to the canonical DS ─────────────────────────────────────
 * The canonical DS has `StageProgress` (vertical mode via
 * `verticalDirection: asc | desc`) and `OrderTracking` (timeline flow-root
 * with dates). Neither offers the sidebar envelope (`aside border-r
 * bg-muted/20`), the click-driven `onStepClick`, the `Loader2`-spinning
 * active state, or a sub-label per step. Candidate to promote as a new
 * sidebar-rail variant of `StageProgress` — or as its own primitive.
 */

export interface PipelineRailStep {
    id: string;
    /** Primary label (ex: "Matching quote found"). */
    label: string;
    /** Optional secondary label under the primary (ex: role, "Auto"). */
    sub?: React.ReactNode;
}

export interface PipelineRailProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
    steps: PipelineRailStep[];
    /** ID of the step currently active. If missing, everything renders pending. */
    currentId?: string;
    /** Optional group title rendered as an uppercase eyebrow above the rail. */
    groupTitle?: React.ReactNode;
    /** Optional click handler — receives the clicked step id. */
    onStepClick?: (id: string) => void;
    /** Optional width override — defaults to 260px. */
    widthClass?: string;
}

type RailState = 'done' | 'active' | 'pending';

export function PipelineRail({
    steps,
    currentId,
    groupTitle,
    onStepClick,
    widthClass = 'w-[260px]',
    className,
    ...rest
}: PipelineRailProps) {
    const currentIdx = currentId ? steps.findIndex(s => s.id === currentId) : -1;

    const stateOf = (i: number): RailState =>
        currentIdx < 0 ? 'pending'
        : i < currentIdx ? 'done'
        : i === currentIdx ? 'active'
        : 'pending';

    return (
        <aside
            className={cn(widthClass, 'shrink-0 border-r border-border bg-muted/20 px-4 py-5', className)}
            {...rest}
        >
            {groupTitle && (
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-4">
                    {groupTitle}
                </div>
            )}

            <div className="relative">
                <div className="absolute left-[15px] top-3 bottom-3 w-px bg-border" />

                <ol className="space-y-2 relative">
                    {steps.map((step, i) => {
                        const state = stateOf(i);
                        const clickable = onStepClick !== undefined;
                        return (
                            <li key={step.id}>
                                <button
                                    type="button"
                                    onClick={() => clickable && onStepClick?.(step.id)}
                                    disabled={!clickable}
                                    className={cn(
                                        'relative w-full flex items-start gap-3 px-2 py-1.5 rounded-lg text-left transition-colors',
                                        state === 'active' ? 'bg-card border border-border shadow-sm' : 'hover:bg-card/60',
                                        !clickable && 'cursor-default opacity-70',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'shrink-0 size-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 z-10',
                                            state === 'done' && 'bg-success border-success text-success-foreground',
                                            state === 'active' && 'bg-primary border-primary text-primary-foreground',
                                            state === 'pending' && 'bg-card border-border text-muted-foreground',
                                        )}
                                    >
                                        {state === 'done' && <Check className="size-3.5" strokeWidth={3} />}
                                        {state === 'active' && <Loader2 className="size-3.5 animate-spin" />}
                                        {state === 'pending' && <span>{i + 1}</span>}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div
                                            className={cn(
                                                'text-[12.5px] font-semibold leading-snug',
                                                state === 'active' ? 'text-foreground' : 'text-muted-foreground',
                                            )}
                                        >
                                            {step.label}
                                        </div>
                                        {step.sub && (
                                            <div className="text-[10.5px] text-muted-foreground/80 mt-0.5">
                                                {step.sub}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </aside>
    );
}
