/**
 * COMPONENT: AccountingMorningQueue
 * PURPOSE: Flow 2 · Scene 1 — Kathy opens Strata and sees the morning queue
 *          already pre-processed overnight. Exception-centric: highlights that
 *          10/12 invoices were auto-posted and only 2 need her review.
 *
 *          Hero surface = invoice queue + detail panel. Footer cue invites
 *          Kathy to review the HealthTrust rebate exception first.
 *
 * DS TOKENS: bg-card · bg-ai/5 · success / amber accents
 *
 * USED BY: MBIAccountingPage (wizard scene 0)
 */

import { useState } from 'react'
import { Zap, Loader2, AlertTriangle, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react'
import InvoiceQueueTable from './InvoiceQueueTable'
import { InvoiceDocPreview, InvoiceExtractedFields } from './InvoiceDetailPanel'
import { MBI_INVOICES } from '../../config/profiles/mbi-data'
import DataSourcesBar, { SOURCES } from './DataSourcesBar'

const RECHECK_STEPS = [
    'Detecting PO change in CORE',
    'Re-running reconciliation · Apex Workspace INV-0484',
    'Mismatch cleared · auto-posting to CORE',
]

function POAutoRecheckDemo({ onAutoResolved }: { onAutoResolved: (id: string) => void }) {
    const [stage, setStage] = useState<'idle' | 'processing' | 'done'>('idle')
    const [stepIdx, setStepIdx] = useState(0)

    const handleSimulate = () => {
        if (stage !== 'idle') return
        setStage('processing')
        setStepIdx(0)
        let i = 0
        const tick = () => {
            i++
            setStepIdx(i)
            if (i < RECHECK_STEPS.length) {
                setTimeout(tick, 800)
            } else {
                setStage('done')
                onAutoResolved('INV-0484')
            }
        }
        setTimeout(tick, 600)
    }

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-muted/20 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-ai" />
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground">CORE PO sync · Strata re-evaluates exceptions every 15 min</div>
                    <div className="text-[10px] text-muted-foreground">When a PO changes in CORE and now matches the bill, the exception clears — no action needed from Kathy</div>
                </div>
            </div>
            <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-foreground">Apex Workspace · INV-0484 · $12.9K</div>
                    <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                        {stage === 'done'
                            ? 'Quantity resolved: PO updated 5 → 6 in CORE · match confirmed'
                            : 'Quantity mismatch: PO 6, bill 5 · short-shipped Jarvis desks'}
                    </div>
                </div>
                {stage === 'idle' && (
                    <button
                        onClick={handleSimulate}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Simulate PO update in CORE
                    </button>
                )}
                {stage === 'processing' && (
                    <div className="shrink-0 inline-flex items-center gap-1.5 text-[11px] text-ai font-bold">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {RECHECK_STEPS[Math.min(stepIdx, RECHECK_STEPS.length - 1)]}…
                    </div>
                )}
                {stage === 'done' && (
                    <div className="shrink-0 inline-flex items-center gap-1.5 text-[11px] text-success font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Auto-resolved · moved to Done
                    </div>
                )}
            </div>
        </div>
    )
}

const TODAY = new Date('2026-04-29')
function isDueSoon(inv: { dueDate?: string }) {
    if (!inv.dueDate) return false
    const days = Math.ceil((new Date(inv.dueDate).getTime() - TODAY.getTime()) / 86400000)
    return days >= 0 && days <= 20
}

export default function AccountingMorningQueue() {
    const [autoResolved, setAutoResolved] = useState<Set<string>>(new Set())

    const allInvoices = MBI_INVOICES.map(inv =>
        autoResolved.has(inv.id) ? { ...inv, status: 'done' as const } : inv
    )

    const total = allInvoices.length
    const pending = allInvoices.filter(i => i.status === 'pending').length
    const inProgress = allInvoices.filter(i => i.status === 'in-progress').length
    const done = allInvoices.filter(i => i.status === 'done').length

    const defaultId = MBI_INVOICES.find(i => i.status === 'pending')?.id ?? MBI_INVOICES[0].id
    const [selectedId, setSelectedId] = useState(defaultId)
    const selected = allInvoices.find(i => i.id === selectedId) ?? allInvoices[0]

    const handleAutoResolved = (id: string) => {
        setAutoResolved(prev => new Set([...prev, id]))
    }

    return (
        <div className="space-y-4">
            {/* Continuous processing summary — 3-column workflow story (Apr 23 commitment) */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-2xl p-4 flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-ai/15 text-ai flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <div className="text-sm font-bold text-foreground">Strata monitors the AP mailbox · {total} vendor bills processed</div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">Kathy · AP Accountant</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Strata identifies non-EDI vendor bills and extracts key data using <strong className="text-foreground">Document AI</strong>. It matches bills to open POs in CORE at the line or total level and processes those that meet criteria.
                        Exceptions are <strong className="text-foreground">flagged for review</strong> and assigned to the appropriate PO agent.
                    </div>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="h-3 w-3" />
                            {pending} pending · your eyes
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ai">
                            <Loader2 className="h-3 w-3" />
                            {inProgress} in progress · agents
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-success">
                            <CheckCircle2 className="h-3 w-3" />
                            {done} done · auto-posted
                        </span>
                    </div>
                </div>
            </div>

            {/* PO auto-recheck demo */}
            <POAutoRecheckDemo onAutoResolved={handleAutoResolved} />

            {/* Queue + document preview + extracted fields — 3-panel grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.7fr_1.1fr] gap-4 items-start">
                <InvoiceQueueTable
                    invoices={allInvoices}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                />
                <InvoiceDocPreview invoice={selected} />
                <InvoiceExtractedFields invoice={selected} />
            </div>

            {/* Data sources */}
            <DataSourcesBar groups={[
                { sources: [SOURCES.VENDOR_EMAIL] },
                { sources: [SOURCES.DOC_AI] },
                { sources: [SOURCES.CORE_PO, SOURCES.HT_DB, SOURCES.CORE_RPA] },
            ]} />
        </div>
    )
}
