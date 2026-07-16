/**
 * COMPONENT: MBIQuotesPage
 * PURPOSE: Flow 2 — Quotes AI. 4-scene wizard following the PC team's
 *          proposal creation: incoming budget → GP review + CORE Quote →
 *          AI validation (4→1+1 audit loop collapse) → send + handoff.
 *
 *          Mirrors Flow 1 wizard pattern. Design Coordinator (Director of PM)
 *          renders as persona — though the 'doers' are Estimator Nova + Mario +
 *          Erin (hybrid PC/designer). For the demo, Marcia owns the flow.
 *
 * DEMO TOUR: m3.3 / m3.2 / m3.4 map 1:1 to wizard scenes 0–2.
 */

import { useEffect, useState } from 'react'
import { FileSearch, Building2, FolderOpen } from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import MBIModuleHeader from './MBIModuleHeader'
import MBIWizardShell, { type WizardStepSpec } from './MBIWizardShell'
import MBIPersonaBadge from './MBIPersonaBadge'
import QuoteGPReviewScene from './QuoteGPReviewScene'
import QuoteProposalReviewScene from './QuoteProposalReviewScene'
import QuoteValidationScene from './QuoteValidationScene'
import QuoteVendorUploadScene from './QuoteVendorUploadScene'
import QuoteSendProposalScene from './QuoteSendProposalScene'
import { useDemo } from '../../context/DemoContext'

const QUOTES_STEPS: WizardStepSpec[] = [
    { id: 'validation',       label: 'AI validation',        shortLabel: '1. Validation' },
    { id: 'vendor-upload',    label: 'Vendor quote upload',  shortLabel: '2. Vendor quotes' },
    { id: 'gp-review',        label: 'GP review',            shortLabel: '3. GP Review' },
    { id: 'proposal-review',  label: 'Proposal review',      shortLabel: '4. Review' },
    { id: 'send',             label: 'Proposal creation',    shortLabel: '5. Proposal' },
]

const STEP_TO_WIZARD_INDEX: Record<string, number> = {
    'm3.3': 0,
    'm3.5': 1,
    'm3.2': 2,
    'm3.6': 3,
    'm3.4': 4,
}

const WIZARD_INDEX_TO_STEP: Record<number, string> = {
    0: 'm3.3',
    1: 'm3.5',
    2: 'm3.2',
    3: 'm3.6',
    4: 'm3.4',
}

const STEP_HINTS: Record<number, { hint: string; nextLabel: string }> = {
    0: { hint: '4 audit loops → 1 AI pass + 1 human review · BOM validation catches duplicates, pricing gaps, and SKU issues before the proposal goes out.', nextLabel: 'Vendor quotes' },
    1: { hint: 'Upload vendor quote PDFs · Strata reads SKU, unit price, lead time, and MOQ — no manual re-entry needed.', nextLabel: 'Review GP' },
    2: { hint: 'PC enters GP per vendor · contract lines auto-locked · Strata creates CORE Quote QUOT-2026-003.', nextLabel: 'Proposal review' },
    3: { hint: 'Review CORE Quote line items · adjust GP if needed · then create the proposal.', nextLabel: 'Create proposal' },
    4: { hint: 'Approve + send · proposal delivered to client · awaiting sign-off.', nextLabel: 'Done' },
}

export default function MBIQuotesPage() {
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
            title="Quotes AI"
            subtitle="Phase 4 · PC bottleneck (3.5 PCs / 29 staff) → reviewers, not builders · 2h per proposal → 12 min"
            icon={<FileSearch className="h-5 w-5" />}
            activeApp="mbi-quotes"
        >
            <MBIModuleHeader
                module="quotes"
                tint="info"
                outcome="Marcia's team stops re-typing SIF into CORE — the PC role shifts from builder to reviewer, and 4 audit loops collapse into 1 AI + 1 human review."
            />

            {inWizard ? (
                <MBIWizardShell
                    steps={QUOTES_STEPS}
                    activeStep={activeStep}
                    onStepClick={navigateWizard}
                    onPrev={() => navigateWizard(Math.max(0, activeStep - 1))}
                    onNext={() => navigateWizard(Math.min(QUOTES_STEPS.length - 1, activeStep + 1))}
                    canAdvance
                    actionHint={stepMeta.hint}
                    nextLabel={stepMeta.nextLabel}
                    persona={
                        <div className="flex flex-col gap-1.5">
                            <MBIPersonaBadge
                                name="Design Coordinator"
                                role="Director of PM · 3.5 PCs for 29 staff"
                                tone="neutral"
                            />
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted border border-border text-foreground">
                                    <Building2 className="h-2.5 w-2.5 text-muted-foreground" />
                                    Enterprise Holdings
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted border border-border text-foreground">
                                    <FolderOpen className="h-2.5 w-2.5 text-muted-foreground" />
                                    New HQ Floor 12
                                </span>
                            </div>
                        </div>
                    }
                >
                    {activeStep === 0 && <QuoteValidationScene />}
                    {activeStep === 1 && <QuoteVendorUploadScene />}
                    {activeStep === 2 && <QuoteGPReviewScene />}
                    {activeStep === 3 && <QuoteProposalReviewScene />}
                    {activeStep === 4 && <QuoteSendProposalScene />}
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
            <StatCard value="3.5 / 29" label="PCs / staff (bottleneck)" accent="text-foreground" />
            <StatCard value="4 → 1+1" label="Audit loops (collapsed)" accent="text-success" />
            <StatCard value="< 5 min" label="Quote validation turnaround" accent="text-zinc-900 dark:text-primary" />
            <StatCard value="2h → 12m" label="Per proposal PC effort" accent="text-success" />
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
