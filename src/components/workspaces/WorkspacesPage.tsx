/**
 * COMPONENT: WorkspacesPage
 * PURPOSE: Container for the Workscapes, Inc. expense management demo.
 *
 * 1 UNIFIED FLOW — 8 steps, 4 roles, 2 platforms:
 *   w1.1  Employee (John)    📱 Mobile  — Submit + OCR
 *   w1.2  Ops Manager (Sarah) 🖥 Desktop — Approval Queue
 *   w1.3  Ops Manager (Sarah) 🖥 Desktop — Approve with Receipt
 *   w1.4  Employee (John)    📱 Mobile  — Expense Status
 *   w2.1  AP Coord (Letza)   🖥 Desktop — AP Review Queue
 *   w2.2  AP Coord (Letza)   🖥 Desktop — GL + CORE Sync
 *   w2.3  AP Coord (Letza)   🖥 Desktop — Admin Self-Service
 *   w2.4  CFO/CAO            🖥 Desktop — Dashboard
 *
 * PLATFORM PRINCIPLE:
 *   Mobile steps (w1.1, w1.4): bypass MBIPageShell — dark bg fills the
 *   viewport, phone is the only UI. No titles, no breadcrumbs.
 *   Desktop steps: MBIPageShell with title + userAction subtitle.
 *   key={stepId} forces a fresh mount + fade-in on every step change,
 *   making each role/platform transition feel intentional.
 *
 * NAVIGATION: driven by DemoContext.nextStep() — no manual tab switching.
 *
 * SOT: src/config/profiles/workspaces-data/workspaces-sot.md
 */

import { Receipt, BarChart2 } from 'lucide-react'
import MBIPageShell from '../mbi/MBIPageShell'
import { WORKSPACES_STEP_BEHAVIOR } from '../../config/profiles/workspaces'
import ExpenseSubmitScene from './ExpenseSubmitScene'
import ApprovalQueueScene from './ApprovalQueueScene'
import ApproveWithReceiptScene from './ApproveWithReceiptScene'
import ExpenseStatusScene from './ExpenseStatusScene'
import APReviewQueueScene from './APReviewQueueScene'
import GLCoreSyncScene from './GLCoreSyncScene'
import AdminScene from './AdminScene'
import CFODashboardScene from './CFODashboardScene'
import { useDemo } from '../../context/DemoContext'

// ─────────────────────────────────────────────────────────────────────────────

export default function WorkspacesPage() {
    const { currentStep, nextStep, prevStep } = useDemo()
    const stepId = currentStep?.id ?? 'w1.1'

    // ── Mobile steps — dark viewport, phone is the only UI ───────────────────
    if (stepId === 'w1.1' || stepId === 'w1.4') {
        return (
            <div className="min-h-screen bg-zinc-950 dark:bg-zinc-900 flex flex-col items-center justify-center py-8 gap-6 animate-in fade-in duration-500">
                {stepId === 'w1.1' && (
                    <ExpenseSubmitScene key="w1.1" onSubmit={nextStep} />
                )}
                {stepId === 'w1.4' && (
                    <ExpenseStatusScene key="w1.4" />
                )}
            </div>
        )
    }

    // ── Desktop steps — MBIPageShell, title + subtitle derived from step ─────
    const isManagerStep = stepId === 'w1.2' || stepId === 'w1.3'
    const title = isManagerStep
        ? 'Expense Submission & Approval'
        : stepId === 'w2.4'
        ? 'CFO / CAO Dashboard'
        : 'AP Processing & Reporting'
    const subtitle = WORKSPACES_STEP_BEHAVIOR[stepId]?.userAction ?? ''
    const icon = isManagerStep
        ? <Receipt className="h-5 w-5" />
        : <BarChart2 className="h-5 w-5" />
    const activeApp = isManagerStep
        ? 'workspaces-approval'
        : stepId === 'w2.4'
        ? 'workspaces-reporting'
        : 'workspaces-ap'

    return (
        <MBIPageShell
            preHeader={null}
            title={title}
            subtitle={subtitle}
            icon={icon}
            activeApp={activeApp}
            tenantLabel="Workscapes"
            productLabel="Strata for Workscapes"
        >
            <div key={stepId} className="space-y-4 animate-in fade-in duration-500">
                {stepId === 'w1.2' && <ApprovalQueueScene  onReview={nextStep} />}
                {stepId === 'w1.3' && <ApproveWithReceiptScene onApprove={nextStep} />}
                {stepId === 'w2.1' && <APReviewQueueScene  onReview={nextStep} />}
                {stepId === 'w2.2' && <GLCoreSyncScene     onPost={nextStep} onBack={prevStep} />}
                {stepId === 'w2.3' && <AdminScene          onSave={nextStep} />}
                {stepId === 'w2.4' && <CFODashboardScene />}
            </div>
        </MBIPageShell>
    )
}
