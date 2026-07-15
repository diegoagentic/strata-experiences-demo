/**
 * COMPONENT: PipelineRail
 * PURPOSE: Vertical 10-step pipeline indicator for the LelandStrataShell.
 *          Shows the active flow's steps with state per step (pending / active /
 *          done) and a left-side connector line. Step state is derived from
 *          DemoContext.currentStep so the rail stays in sync as the demo runs.
 *
 *          Adapts the step-state visual language of MBIWizardShell (chip + dot
 *          + check icon · pending/running/done colors) but rotated to vertical
 *          and tied to the active demo group, not a wizard.
 *
 * PROPS:
 *   - groupId: number          — only steps with this groupId are rendered
 *   - groupTitle?: string      — optional caption above the rail
 *   - onStepClick?: (id) => …  — optional click-to-jump (interactive demos)
 *
 * USED BY: LelandStrataShell (left rail of the PO Workspace layout)
 */

import { Check, Loader2 } from 'lucide-react';
import { useDemo } from '../../../context/DemoContext';
import { useDemoProfile } from '../../../context/useDemoProfile';

interface PipelineRailProps {
    groupId: number;
    groupTitle?: string;
    onStepClick?: (stepId: string) => void;
}

type StepState = 'pending' | 'active' | 'done';

export default function PipelineRail({ groupId, groupTitle, onStepClick }: PipelineRailProps) {
    const { currentStep, isDemoActive, steps, goToStep } = useDemo();
    const { activeProfile } = useDemoProfile();

    // Filter steps belonging to this group only
    const groupSteps = activeProfile.steps.filter(s => s.groupId === groupId);
    const currentIdx = isDemoActive
        ? groupSteps.findIndex(s => s.id === currentStep?.id)
        : -1;

    const stateOf = (i: number): StepState => {
        if (currentIdx < 0) return 'pending';
        if (i < currentIdx) return 'done';
        if (i === currentIdx) return 'active';
        return 'pending';
    };

    const handleClick = (stepId: string) => {
        if (onStepClick) {
            onStepClick(stepId);
            return;
        }
        // Default: jump to the step in the global steps array
        const globalIdx = steps.findIndex(s => s.id === stepId);
        if (globalIdx >= 0) goToStep(globalIdx);
    };

    return (
        <aside className="w-[260px] shrink-0 border-r border-border bg-muted/20 dark:bg-zinc-900/40 px-4 py-5">
            {groupTitle && (
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-4">
                    {groupTitle}
                </div>
            )}

            <div className="relative">
                {/* Vertical connector line */}
                <div className="absolute left-[15px] top-3 bottom-3 w-px bg-border" />

                <ol className="space-y-2 relative">
                    {groupSteps.map((step, i) => {
                        const state = stateOf(i);
                        const isClickable = state !== 'pending' || onStepClick !== undefined;
                        return (
                            <li key={step.id}>
                                <button
                                    type="button"
                                    onClick={() => isClickable && handleClick(step.id)}
                                    disabled={!isClickable}
                                    className={`
                                        relative w-full flex items-start gap-3 px-2 py-1.5 rounded-lg text-left transition-colors
                                        ${state === 'active' ? 'bg-card border border-border shadow-sm' : 'hover:bg-card/60'}
                                        ${!isClickable ? 'cursor-default opacity-70' : 'cursor-pointer'}
                                    `}
                                >
                                    {/* State dot */}
                                    <div
                                        className={`
                                            shrink-0 size-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 z-10
                                            ${state === 'done' ? 'bg-green-500 border-green-500 text-white' : ''}
                                            ${state === 'active' ? 'bg-brand-300 dark:bg-brand-500 border-brand-400 dark:border-brand-500 text-zinc-900' : ''}
                                            ${state === 'pending' ? 'bg-card border-border text-muted-foreground' : ''}
                                        `}
                                    >
                                        {state === 'done' && <Check className="size-3.5" strokeWidth={3} />}
                                        {state === 'active' && <Loader2 className="size-3.5 animate-spin" />}
                                        {state === 'pending' && <span>{i + 1}</span>}
                                    </div>

                                    {/* Step label + role */}
                                    <div className="min-w-0 flex-1">
                                        <div
                                            className={`
                                                text-[12px] font-semibold leading-snug
                                                ${state === 'active' ? 'text-foreground' : ''}
                                                ${state === 'done' ? 'text-foreground/80' : ''}
                                                ${state === 'pending' ? 'text-muted-foreground' : ''}
                                            `}
                                        >
                                            {step.title}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                            {step.id} · {step.role}
                                        </div>
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
