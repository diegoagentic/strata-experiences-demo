/**
 * COMPONENT: MBIAccountingPage
 * PURPOSE: Container for Flow 1 (Accounting AI) + Flow 2 (Collections AI).
 *          Both flows live under the same "Accounting AI" navbar tab and are
 *          exposed via two internal tabs: Accounting | Collections.
 *
 *          Accounting tab  → 2-step wizard: AP queue + Bill Review
 *          Collections tab → 2-step wizard: AR aging + Collection emails
 *
 * DEMO TOUR sync:
 *   m2.1 / m2.3 → Accounting tab, wizard steps 0 / 1
 *   m2.4 / m2.5 → Collections tab, wizard steps 0 / 1
 */

import { useEffect, useState } from 'react'
import { Receipt, GitCompare, DollarSign, Flag, UserCheck, MailOpen } from 'lucide-react'
import { ReasonDialog as MBIReasonModal } from '../shared'
import MBIPageShell from './MBIPageShell'
import MBIModuleHeader from './MBIModuleHeader'
import MBIWizardShell, { type WizardStepSpec } from './MBIWizardShell'
import MBIPersonaBadge from './MBIPersonaBadge'
import AccountingMorningQueue from './AccountingMorningQueue'
import NonEDIReconcilerScene from './NonEDIReconcilerScene'
import ARAgingReviewScene from './ARAgingReviewScene'
import ARAgingWrapScene from './ARAgingWrapScene'
import { useDemo } from '../../context/DemoContext'

// ── Accounting wizard (Flow 1) ────────────────────────────────────────────────
const ACCOUNTING_STEPS: WizardStepSpec[] = [
    { id: 'morning',  label: 'AP · Pending Review',      shortLabel: '1. AP Queue' },
    { id: 'non-edi',  label: 'Bill Review — line-by-line', shortLabel: '2. Bill Review' },
]

const ACCT_STEP_TO_IDX: Record<string, number> = { 'm2.1': 0, 'm2.3': 1 }
const ACCT_IDX_TO_STEP: Record<number, string>  = { 0: 'm2.1', 1: 'm2.3' }
const ACCT_NEXT_LABELS: Record<number, string>   = { 0: 'Review', 1: 'Resolve and Post' }

// ── Collections wizard (Flow 2) ───────────────────────────────────────────────
const COLLECTIONS_STEPS: WizardStepSpec[] = [
    { id: 'ar-aging', label: 'AR aging · open accounts to collect', shortLabel: '1. AR Aging' },
    { id: 'ar-close', label: 'Collection emails + wrap up',          shortLabel: '2. Close' },
]

const COLL_STEP_TO_IDX: Record<string, number> = { 'm2.4': 0, 'm2.5': 1 }
const COLL_IDX_TO_STEP: Record<number, string>  = { 0: 'm2.4', 1: 'm2.5' }
const COLL_NEXT_LABELS: Record<number, string>   = { 0: 'Review collection drafts', 1: 'Wrap up' }

type AccountingTab = 'accounting' | 'collections'

const STEP_TO_TAB: Record<string, AccountingTab> = {
    'm2.1': 'accounting', 'm2.3': 'accounting',
    'm2.4': 'collections', 'm2.5': 'collections',
}

export default function MBIAccountingPage() {
    const { currentStep, isDemoActive, steps: tourSteps, goToStep } = useDemo()
    const demoStepId = isDemoActive ? currentStep?.id : null

    const [activeTab, setActiveTab]     = useState<AccountingTab>('accounting')
    const [acctStep, setAcctStep]       = useState(0)
    const [collStep, setCollStep]       = useState(0)

    // Sync tab + wizard index when the demo tour navigates
    useEffect(() => {
        if (!demoStepId) return
        const tab = STEP_TO_TAB[demoStepId]
        if (!tab) return
        setActiveTab(tab)
        if (tab === 'accounting' && demoStepId in ACCT_STEP_TO_IDX) {
            setAcctStep(ACCT_STEP_TO_IDX[demoStepId])
        } else if (tab === 'collections' && demoStepId in COLL_STEP_TO_IDX) {
            setCollStep(COLL_STEP_TO_IDX[demoStepId])
        }
    }, [demoStepId])

    const navigateAccounting = (idx: number) => {
        setAcctStep(idx)
        if (!isDemoActive) return
        const targetId = ACCT_IDX_TO_STEP[idx]
        if (!targetId || currentStep?.id === targetId) return
        const tourIdx = tourSteps.findIndex(s => s.id === targetId)
        if (tourIdx >= 0) goToStep(tourIdx)
    }

    const navigateCollections = (idx: number) => {
        setCollStep(idx)
        if (!isDemoActive) return
        const targetId = COLL_IDX_TO_STEP[idx]
        if (!targetId || currentStep?.id === targetId) return
        const tourIdx = tourSteps.findIndex(s => s.id === targetId)
        if (tourIdx >= 0) goToStep(tourIdx)
    }

    const persona = (
        <MBIPersonaBadge
            name="Operations Manager Rowe"
            role="Controller · Accounting"
            isPilot
            tone="ai"
        />
    )

    const tabSwitcher = (
        <div className="flex gap-1 bg-muted/40 dark:bg-zinc-800/60 border border-border rounded-xl p-1 w-fit">
            <TabButton
                active={activeTab === 'accounting'}
                onClick={() => setActiveTab('accounting')}
                icon={<Receipt className="h-3.5 w-3.5" />}
                label="AP Exceptions"
            />
            <TabButton
                active={activeTab === 'collections'}
                onClick={() => setActiveTab('collections')}
                icon={<MailOpen className="h-3.5 w-3.5" />}
                label="Collections"
            />
        </div>
    )

    return (
        <MBIPageShell
            preHeader={tabSwitcher}
            title={activeTab === 'accounting' ? 'Accounting AI' : 'Collections AI'}
            subtitle={activeTab === 'accounting'
                ? 'Prototype · Phase 1 (Mark\'s pick) · Operations Manager Rowe (Controller) · daily accounting queue · 4h → 18 min'
                : 'Flow 2 · AR aging + collection follow-ups · Operations Manager Rowe (Controller)'}
            icon={<Receipt className="h-5 w-5" />}
            activeApp="mbi-accounting"
        >
            <MBIModuleHeader
                module="accounting"
                tint="ai"
                outcome={activeTab === 'accounting'
                    ? 'Kathy gets her time back — exception-only review, AR collected on time, billing forecast live for leadership.'
                    : '$240K AR open · Strata routes accounts by status, drafts follow-ups in the client\'s tone, and protects on-hold accounts — Kathy reviews and sends.'}
            />

            {/* Accounting tab — Flow 1 (m2.1 + m2.3) */}
            {activeTab === 'accounting' && (
                <MBIWizardShell
                    steps={ACCOUNTING_STEPS}
                    activeStep={acctStep}
                    onStepClick={navigateAccounting}
                    onPrev={() => navigateAccounting(Math.max(0, acctStep - 1))}
                    onNext={() => acctStep === ACCOUNTING_STEPS.length - 1
                        ? navigateAccounting(0)
                        : navigateAccounting(acctStep + 1)}
                    canAdvance
                    nextLabel={ACCT_NEXT_LABELS[acctStep]}
                    secondaryAction={acctStep === 1 ? <EscalateAllButton /> : undefined}
                    persona={persona}
                >
                    {acctStep === 0 && <AccountingMorningQueue />}
                    {acctStep === 1 && <NonEDIReconcilerScene />}
                </MBIWizardShell>
            )}

            {/* Collections tab — Flow 2 (m2.4 + m2.5) */}
            {activeTab === 'collections' && (
                <MBIWizardShell
                    steps={COLLECTIONS_STEPS}
                    activeStep={collStep}
                    onStepClick={navigateCollections}
                    onPrev={() => navigateCollections(Math.max(0, collStep - 1))}
                    onNext={() => navigateCollections(Math.min(COLLECTIONS_STEPS.length - 1, collStep + 1))}
                    canAdvance
                    nextLabel={COLL_NEXT_LABELS[collStep]}
                    persona={persona}
                >
                    {collStep === 0 && <ARAgingReviewScene onContinue={() => navigateCollections(1)} />}
                    {collStep === 1 && <ARAgingWrapScene />}
                </MBIWizardShell>
            )}
        </MBIPageShell>
    )
}

function TabButton({ active, onClick, icon, label }: {
    active: boolean
    onClick: () => void
    icon: React.ReactNode
    label: string
}) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                active
                    ? 'bg-card dark:bg-zinc-700 text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
            }`}
        >
            {icon}
            {label}
        </button>
    )
}

const ESCALATE_ALL_CATEGORIES = [
    { id: 'vendor-dispute', label: 'Vendor disputing the variances' },
    { id: 'manager-review', label: 'Needs manager approval' },
    { id: 'contract-issue', label: 'Potential contract discrepancy' },
    { id: 'other', label: 'Other (describe below)' },
]

function EscalateAllButton() {
    const [open, setOpen] = useState(false)
    const [done, setDone] = useState(false)

    if (done) return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 px-3 py-2 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
            <Flag className="h-3.5 w-3.5" />
            Escalated
        </span>
    )

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-background dark:bg-zinc-800 border border-red-200 dark:border-red-500/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
                <Flag className="h-3.5 w-3.5" />
                Escalate
            </button>
            <MBIReasonModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onSubmit={() => { setOpen(false); setDone(true) }}
                tone="danger"
                icon={<Flag className="h-5 w-5" />}
                title="Escalate flagged line items"
                subtitle="Apex Workspace · INV-0484 · 2 exceptions pending"
                contextBanner={{
                    tone: 'info',
                    icon: <UserCheck className="h-4 w-4" />,
                    title: 'Manager will be notified.',
                    body: 'All pending exceptions will be held for manager review. The bill won\'t auto-post until resolved.',
                }}
                categories={ESCALATE_ALL_CATEGORIES}
                defaultCategoryId="vendor-dispute"
                categoryPrompt="Why escalate?"
                notesPlaceholder="e.g. Apex confirmed short ship by email — need manager to approve the PO amendment before posting."
                notesRequiredForCategoryId="other"
                confirmLabel="Escalate to manager"
            />
        </>
    )
}

function OverviewStub() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard icon={<Receipt className="h-4 w-4" />} value="12" label="Bills processed · live queue" accent="text-foreground" />
            <StatCard icon={<GitCompare className="h-4 w-4" />} value="2" label="Non-EDI exceptions" accent="text-amber-600 dark:text-amber-400" />
            <StatCard icon={<DollarSign className="h-4 w-4" />} value="$240K" label="AR live · forecast refreshed" accent="text-success" />
        </div>
    )
}

function StatCard({ icon, value, label, accent }: { icon: React.ReactNode; value: string; label: string; accent: string }) {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl p-4">
            <div className={`flex items-center gap-2 ${accent}`}>
                {icon}
                <span className="text-2xl font-bold leading-none">{value}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">{label}</div>
        </div>
    )
}
