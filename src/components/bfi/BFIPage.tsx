/**
 * COMPONENT: BFIPage
 * PURPOSE: Container for BFI demo — Agency Fee flow (a1.1–a1.4), 11 steps.
 *
 * BFIDashboardPage: standalone export for the persistent Dashboard navbar tab.
 */

import { useCallback, useState } from 'react'
import { Building2, LayoutDashboard, RotateCcw } from 'lucide-react'
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

export default function BFIPage() {
    const { currentStep, nextStep, goToStep, isDemoActive } = useDemo()
    // F30 · idle fallback ahora es 'a1.1' (CoNYMorningQueue · queue-style
    // landing-friendly · match con el nav tab Agency Fee AI hero). Antes
    // era 'r1.2' que no matcheaba ningún case del switch → empty div fuera
    // de tour. Diego 2026-07-23.
    const stepId = currentStep?.id ?? 'a1.1'

    // F30 · Reset counter · cada increment forza remount del scene child
    // via el key wrapper. Limpia state interno de los scenes children sin
    // tener que editarlos individualmente. Pattern F26 CLC + F29.f Officeworks.
    const [resetTick, setResetTick] = useState(0)
    const handleResetClick = useCallback(() => {
        setResetTick(t => t + 1)
        if (isDemoActive) goToStep(0)
    }, [isDemoActive, goToStep])

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

    // Mobile email views — break out of MBIPageShell (full-screen phone frame)
    if (stepId === 'a1.0') {
        return (
            <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center py-6 animate-in fade-in duration-500">
                <MobileDeviceFrame size="lg">
                    <DesignerRFQScene key="a1.0" onSend={nextStep} />
                </MobileDeviceFrame>
            </div>
        )
    }

    if (stepId === 'a1.2') {
        return (
            <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center py-6 animate-in fade-in duration-500">
                <MobileDeviceFrame size="lg">
                    <DesignerResponseScene key="a1.2" onAcknowledge={nextStep} />
                </MobileDeviceFrame>
            </div>
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
                {stepId === 'a1.1' && <CoNYMorningQueue onSelectOrder={nextStep} />}
                {stepId === 'a1.2b'  && <QuoteIntakePricingScene />}
                {stepId === 'a1.2b3' && <SendProposalScene />}
                {stepId === 'a1.2c'  && <POLaborScene />}
                {stepId === 'a1.2d' && (
                    <WIGBingoCheckScene
                        onAnalyze={nextStep}
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
                {stepId === 'a1.3' && <CPRScene onSend={nextStep} />}
                {stepId === 'a1.3b' && <MichaelApprovalScene />}
                {stepId === 'a1.3c' && <LaurenInvoiceScene />}
                {stepId === 'a1.4' && <AgencyFeeVerifyScene />}
            </div>
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
