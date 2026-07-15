/**
 * COMPONENT: MBIDesignPage
 * PURPOSE: Flow 4 — Design AI. 3-scene wizard following Beth Gianino's
 *          Spec Check pilot: project pick → animated scan → findings review
 *          + final multi-flow recap that closes the demo arc.
 *
 *          Last flow of the tour. Instead of handing off to another flow,
 *          the final scene surfaces a recap of all 4 AIs and invites
 *          restart / jump-to-any-flow.
 *
 * DEMO TOUR: m4.1 → m4.3 map 1:1 to wizard scenes 0–2.
 */

import { useEffect, useState } from 'react'
import { Palette } from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import MBIModuleHeader from './MBIModuleHeader'
import MBIWizardShell, { type WizardStepSpec } from './MBIWizardShell'
import MBIPersonaBadge from './MBIPersonaBadge'
import DesignProjectPick from './DesignProjectPick'
import DesignSpecCheckScan from './DesignSpecCheckScan'
import DesignFindingsReview from './DesignFindingsReview'
import { useDemo } from '../../context/DemoContext'

const DESIGN_STEPS: WizardStepSpec[] = [
    { id: 'project', label: 'Pick project', shortLabel: '1. Project' },
    { id: 'scan', label: 'Spec Check scan', shortLabel: '2. Scan' },
    { id: 'findings', label: 'Findings + recap', shortLabel: '3. Findings' },
]

const STEP_TO_WIZARD_INDEX: Record<string, number> = {
    'm4.1': 0,
    'm4.2': 1,
    'm4.3': 2,
}

const WIZARD_INDEX_TO_STEP: Record<number, string> = {
    0: 'm4.1',
    1: 'm4.2',
    2: 'm4.3',
}

const STEP_HINTS: Record<number, { hint: string; nextLabel: string }> = {
    0: { hint: 'Phase 1 Pilot — Beth alone runs Spec Check · visible win unlocks team rollout.', nextLabel: 'Run Spec Check' },
    1: { hint: '4 AI checks run in parallel · 47 line items scanned in under 5 minutes.', nextLabel: 'Review findings' },
    2: { hint: 'One finding on Line 23 · accept the swap to catch the "everything blue, this is green" class of mistake.', nextLabel: 'Done' },
}

export default function MBIDesignPage() {
    const { currentStep, isDemoActive, steps: tourSteps, goToStep } = useDemo()
    const demoStepId = isDemoActive ? currentStep?.id : null
    const demoWizardIdx = demoStepId && demoStepId in STEP_TO_WIZARD_INDEX
        ? STEP_TO_WIZARD_INDEX[demoStepId]
        : null

    const [activeStep, setActiveStep] = useState(0)
    const inWizard = demoWizardIdx !== null || !isDemoActive

    useEffect(() => {
        if (demoWizardIdx !== null) setActiveStep(demoWizardIdx)
    }, [demoWizardIdx])

    const navigateWizard = (idx: number) => {
        setActiveStep(idx)
        if (!isDemoActive) return
        const targetId = WIZARD_INDEX_TO_STEP[idx]
        if (!targetId || currentStep?.id === targetId) return
        const tourIdx = tourSteps.findIndex(s => s.id === targetId)
        if (tourIdx >= 0) goToStep(tourIdx)
    }

    const stepMeta = STEP_HINTS[activeStep] ?? { hint: '', nextLabel: undefined }

    return (
        <MBIPageShell
            title="Design AI"
            subtitle="Phase 4 · Pilot with Beth Gianino · 8/10 trust · design team Q4 avg 3.3/10 · sequenced rollout"
            icon={<Palette className="h-5 w-5" />}
            activeApp="mbi-design"
        >
            <MBIModuleHeader
                module="design"
                tint="success"
                outcome="Beth's spec checks land in 5 minutes — finishes match, dimensions cleared, palette consistent before the client ever sees the proposal."
            />

            {inWizard ? (
                <MBIWizardShell
                    steps={DESIGN_STEPS}
                    activeStep={activeStep}
                    onStepClick={navigateWizard}
                    onPrev={() => navigateWizard(Math.max(0, activeStep - 1))}
                    onNext={() => navigateWizard(Math.min(DESIGN_STEPS.length - 1, activeStep + 1))}
                    canAdvance
                    actionHint={stepMeta.hint}
                    nextLabel={stepMeta.nextLabel}
                    persona={
                        <MBIPersonaBadge
                            name="Beth Gianino"
                            role="Designer · Phase 1 Pilot · 8/10 trust"
                            isPilot
                            tone="ai"
                        />
                    }
                >
                    {activeStep === 0 && <DesignProjectPick />}
                    {activeStep === 1 && <DesignSpecCheckScan />}
                    {activeStep === 2 && <DesignFindingsReview />}
                </MBIWizardShell>
            ) : (
                <OverviewStub />
            )}
        </MBIPageShell>
    )
}

function OverviewStub() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard value="Phase 1" label="Pilot · Beth only" accent="text-ai" />
            <StatCard value="9.08/10" label="Q10 spec check priority" accent="text-zinc-900 dark:text-primary" />
            <StatCard value="< 5 min" label="Spec check turnaround" accent="text-success" />
            <StatCard value="3.3/10" label="Design team Q4 avg · sequenced rollout" accent="text-amber-600 dark:text-amber-400" />
        </div>
    )
}

function StatCard({ value, label, accent }: { value: string; label: string; accent: string }) {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl p-4">
            <div className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
        </div>
    )
}
