/**
 * COMPONENT: BFIPage
 * PURPOSE: Container for BFI demo — Agency Fee flow (a1.1–a1.4), 11 steps.
 *
 * BFIDashboardPage: standalone export for the persistent Dashboard navbar tab.
 */

import { useCallback, useEffect, useState } from 'react'
import { Building2, LayoutDashboard, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import MBIPageShell from '../mbi/MBIPageShell'
import MobileDeviceFrame from '../simulations/MobileDeviceFrame'
import { useDemo } from '../../context/DemoContext'

import BFIDashboardScene from './BFIDashboardScene'
import WIGBingoCheckScene from './WIGBingoCheckScene'
import CoNYMorningQueue from './CoNYMorningQueue'
import QuoteIntakePricingScene from './QuoteIntakePricingScene'
import SendProposalScene from './SendProposalScene'
import CPRScene from './CPRScene'
import AgencyFeeVerifyScene from './AgencyFeeVerifyScene'
import DesignerResponseScene from './DesignerResponseScene'
import DesignerRFQScene from './DesignerRFQScene'
import POLaborScene from './POLaborScene'
import LaurenClaimScene from './LaurenClaimScene'
import ClaimResolvedScene from './ClaimResolvedScene'
import MichaelApprovalScene from './MichaelApprovalScene'
import LaurenInvoiceScene from './LaurenInvoiceScene'

const STEP_TITLES: Record<string, string> = {
    'a1.1': 'Agency Fee',
    'a1.2': 'Agency Fee',
    'a1.2b':  'Agency Fee',
    'a1.2b3': 'Agency Fee',
    'a1.2c':  'Agency Fee',
    'a1.2d': 'Product Receiving',
    'a1.2e': 'Product Receiving',
    'a1.2f': 'Product Receiving',
    'a1.3': 'Agency Fee',
    'a1.3b': 'Agency Fee',
    'a1.3c': 'Agency Fee',
    'a1.4': 'Agency Fee',
}

// F30.c · Diego 2026-07-23 · Stepper inline flotante para navegar los 13
// steps del flow BFI fuera de tour. Pattern F29 Officeworks · el stepper
// aparece como pill flotante encima del content cuando !isDemoActive ·
// el user hace click Prev/Next para recorrer manualmente el flow completo.
const BFI_STEP_ORDER: string[] = [
    'a1.0',    // Designer RFQ (phone frame)
    'a1.1',    // CoNY morning queue
    'a1.2',    // Designer response (phone frame)
    'a1.2b',   // Quote intake · pricing
    'a1.2b3',  // Send proposal
    'a1.2c',   // PO & Labor
    'a1.2d',   // WIG bingo check · receiving
    'a1.2e',   // Lauren claim
    'a1.2f',   // Claim resolved
    'a1.3',    // CPR review
    'a1.3b',   // Michael approval
    'a1.3c',   // Lauren invoice
    'a1.4',    // Agency Fee verify
]

const STEP_LABELS: Record<string, string> = {
    'a1.0':   'Designer RFQ · mobile intake',
    'a1.1':   'Morning queue · Co-NY PM triage',
    'a1.2':   'Designer response · quote ack',
    'a1.2b':  'Quote intake · pricing extraction',
    'a1.2b3': 'Send proposal · client review',
    'a1.2c':  'PO & Labor · vendor confirm',
    'a1.2d':  'Product receiving · WIG bingo check',
    'a1.2e':  'Damage claim · Lauren opens ticket',
    'a1.2f':  'Claim resolved · vendor credit',
    'a1.3':   'CPR review · agency fee compile',
    'a1.3b':  'Michael approval · CFO sign-off',
    'a1.3c':  'Lauren invoice · NYC portal',
    'a1.4':   'Agency Fee verify · reconciled',
}

export default function BFIPage() {
    const { currentStep, nextStep, goToStep, isDemoActive } = useDemo()

    // F30.c · Manual step index para navegación fuera de tour. Default 1
    // = 'a1.1' (CoNYMorningQueue). Cuando isDemoActive, sync con currentStep.
    const [manualStepIdx, setManualStepIdx] = useState(1)

    // F30.c · Sync manualStepIdx cuando el tour avanza · así al terminar
    // el tour el user retoma navegación desde el último step visto.
    useEffect(() => {
        if (!isDemoActive || !currentStep) return
        const idx = BFI_STEP_ORDER.indexOf(currentStep.id)
        if (idx >= 0) setManualStepIdx(idx)
    }, [isDemoActive, currentStep])

    // F30 · idle fallback ahora es 'a1.1'. F30.c · dual · si tour activo
    // deriva de currentStep; si no, deriva del manualStepIdx.
    const stepId = isDemoActive
        ? (currentStep?.id ?? 'a1.1')
        : (BFI_STEP_ORDER[manualStepIdx] ?? 'a1.1')

    // F30 · Reset counter · cada increment forza remount del scene child
    // via el key wrapper. Limpia state interno de los scenes children sin
    // tener que editarlos individualmente. Pattern F26 CLC + F29.f Officeworks.
    const [resetTick, setResetTick] = useState(0)
    const handleResetClick = useCallback(() => {
        setResetTick(t => t + 1)
        setManualStepIdx(1) // vuelve a 'a1.1'
        if (isDemoActive) goToStep(0)
    }, [isDemoActive, goToStep])

    // F30.c · Handlers dual · si tour activo delegan a nextStep del context.
    // Fuera de tour navegan el manualStepIdx en el array BFI_STEP_ORDER.
    const handleManualNext = useCallback(() => {
        if (isDemoActive) { nextStep(); return }
        setManualStepIdx(i => Math.min(i + 1, BFI_STEP_ORDER.length - 1))
    }, [isDemoActive, nextStep])
    const handleManualPrev = useCallback(() => {
        if (isDemoActive) return // en tour la sidebar controla nav
        setManualStepIdx(i => Math.max(i - 1, 0))
    }, [isDemoActive])

    // F30.c · `advance` es el handler que se pasa a los scenes children.
    // Fuera de tour usa handleManualNext · en tour usa nextStep del context
    // (comportamiento actual · scenes children llaman este handler cuando
    // el user hace la acción principal del step · Send / Acknowledge /
    // Analyze / etc).
    const advance = isDemoActive ? nextStep : handleManualNext

    // Botón Reset visible en el header del MBIPageShell (pass via actions).
    // No aparece en los phone frames (a1.0 / a1.2) porque esos casos
    // usan MobileDeviceFrame en vez del shell.
    const resetButton = (
        <button
            type="button"
            onClick={handleResetClick}
            className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
            aria-label="Reset the Agency Fee flow to the initial state"
            title="Reset the flow to the initial state · clears scene interaction state"
        >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset flow
        </button>
    )

    // F30.c · Stepper inline flotante · visible solo fuera de tour.
    // Pattern F29 Officeworks · fixed top-24 · z-[60] · pill flotante encima
    // del content del scene. Prev · badge · Reset · Next primary CTA.
    const totalSteps = BFI_STEP_ORDER.length
    const stepperInline = !isDemoActive ? (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/95 backdrop-blur-xl shadow-lg">
            <button
                type="button"
                onClick={handleManualPrev}
                disabled={manualStepIdx === 0}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-foreground bg-muted hover:bg-muted/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Previous step"
            >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Prev
            </button>
            <div className="flex flex-col items-center px-3 min-w-0 max-w-xs">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Agency Fee · Step {manualStepIdx + 1} of {totalSteps}
                </p>
                <p className="text-xs font-semibold text-foreground truncate max-w-full">
                    {STEP_LABELS[stepId] ?? stepId}
                </p>
            </div>
            <button
                type="button"
                onClick={handleResetClick}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                aria-label="Reset to first step"
                title="Reset the Agency Fee flow to the first step"
            >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset
            </button>
            <button
                type="button"
                onClick={handleManualNext}
                disabled={manualStepIdx >= totalSteps - 1}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Next step"
            >
                Next
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
        </div>
    ) : null

    // Mobile email views — break out of MBIPageShell (full-screen phone frame)
    if (stepId === 'a1.0') {
        return (
            <>
                <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center py-6 animate-in fade-in duration-500">
                    <MobileDeviceFrame size="lg">
                        <DesignerRFQScene key={`a1.0-${resetTick}`} onSend={advance} />
                    </MobileDeviceFrame>
                </div>
                {stepperInline}
            </>
        )
    }

    if (stepId === 'a1.2') {
        return (
            <>
                <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center py-6 animate-in fade-in duration-500">
                    <MobileDeviceFrame size="lg">
                        <DesignerResponseScene key={`a1.2-${resetTick}`} onAcknowledge={advance} />
                    </MobileDeviceFrame>
                </div>
                {stepperInline}
            </>
        )
    }

    const icon = stepId.startsWith('a')
        ? <Building2 className="h-5 w-5" />
        : <LayoutDashboard className="h-5 w-5" />

    return (
        <MBIPageShell
            title={STEP_TITLES[stepId] ?? 'BFI Demo'}
            tenantLabel="Dealer Copper"
            productLabel="Strata for Dealer Copper"
            icon={icon}
            actions={resetButton}
        >
            <div key={`${stepId}-${resetTick}`} className="space-y-4 animate-in fade-in duration-500">
                {stepId === 'a1.1' && <CoNYMorningQueue onSelectOrder={advance} />}
                {stepId === 'a1.2b'  && <QuoteIntakePricingScene />}
                {stepId === 'a1.2b3' && <SendProposalScene />}
                {stepId === 'a1.2c'  && <POLaborScene />}
                {stepId === 'a1.2d' && (
                    <WIGBingoCheckScene
                        onAnalyze={advance}
                        uploadMode
                        notificationConfig={{
                            title: 'Purchase Order confirmed · NYC Dept. of Education',
                            desc: 'DOE-2847 · Q-2026-0089 · Delivery May 14–21 · 35 cartons · warehouse receiving',
                            cta: 'Review receiving documents →',
                        }}
                    />
                )}
                {stepId === 'a1.2e' && <LaurenClaimScene />}
                {stepId === 'a1.2f' && <ClaimResolvedScene />}
                {stepId === 'a1.3' && <CPRScene onSend={advance} />}
                {stepId === 'a1.3b' && <MichaelApprovalScene />}
                {stepId === 'a1.3c' && <LaurenInvoiceScene />}
                {stepId === 'a1.4' && <AgencyFeeVerifyScene />}
            </div>
            {stepperInline}
        </MBIPageShell>
    )
}

/** Standalone dashboard page — rendered when user clicks the "Dashboard" navbar tab. */
export function BFIDashboardPage() {
    return (
        <MBIPageShell
            title="Operations Dashboard"
            tenantLabel="Dealer Copper"
            productLabel="Strata for Dealer Copper"
            icon={<LayoutDashboard className="h-5 w-5" />}
        >
            <BFIDashboardScene staticMode />
        </MBIPageShell>
    )
}
