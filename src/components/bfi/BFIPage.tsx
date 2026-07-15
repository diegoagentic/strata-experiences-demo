/**
 * COMPONENT: BFIPage
 * PURPOSE: Container for BFI demo — Agency Fee flow (a1.1–a1.4), 11 steps.
 *
 * BFIDashboardPage: standalone export for the persistent Dashboard navbar tab.
 */

import { Building2, LayoutDashboard } from 'lucide-react'
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
    const { currentStep, nextStep } = useDemo()
    const stepId = currentStep?.id ?? 'r1.2'

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
            tenantLabel="BFI"
            productLabel="Strata for BFI"
            icon={icon}
        >
            <div key={stepId} className="space-y-4 animate-in fade-in duration-500">
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
            tenantLabel="BFI"
            productLabel="Strata for BFI"
            icon={<LayoutDashboard className="h-5 w-5" />}
        >
            <BFIDashboardScene staticMode />
        </MBIPageShell>
    )
}
