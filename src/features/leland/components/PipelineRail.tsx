/**
 * PipelineRail (Leland adapter) · glue between the demo context and the
 * DS-level PipelineRail primitive.
 *
 * The DS `PipelineRail` is context-free (takes steps + currentId + optional
 * onStepClick). This adapter reads DemoContext + useDemoProfile, filters the
 * active profile's steps by `groupId`, and wires clicks to `goToStep`.
 *
 * Migrated in F5 · the vertical stepper visuals now live in
 * `packages/strata-ds/src/components/pipeline-rail.tsx`.
 */

import { PipelineRail as DSPipelineRail } from 'strata-design-system';
import { useDemo } from '../../../context/DemoContext';
import { useDemoProfile } from '../../../context/useDemoProfile';

interface PipelineRailProps {
    groupId: number;
    groupTitle?: string;
    onStepClick?: (stepId: string) => void;
}

export default function PipelineRail({ groupId, groupTitle, onStepClick }: PipelineRailProps) {
    const { currentStep, isDemoActive, steps, goToStep } = useDemo();
    const { activeProfile } = useDemoProfile();

    const groupSteps = activeProfile.steps
        .filter(s => s.groupId === groupId)
        .map(s => ({ id: s.id, label: s.title, sub: s.role }));

    const currentId = isDemoActive ? currentStep?.id : undefined;

    const handleClick = (stepId: string) => {
        if (onStepClick) {
            onStepClick(stepId);
            return;
        }
        const globalIdx = steps.findIndex(s => s.id === stepId);
        if (globalIdx >= 0) goToStep(globalIdx);
    };

    return (
        <DSPipelineRail
            steps={groupSteps}
            currentId={currentId}
            groupTitle={groupTitle}
            onStepClick={handleClick}
        />
    );
}
