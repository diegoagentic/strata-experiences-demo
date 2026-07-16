/**
 * COMPONENT: HealthTrustExceptionScene
 * PURPOSE: Flow 2 · Scene 2 — the HealthTrust GPO 3% rebate moment. Strata
 *          detects a healthcare invoice against an MBI HealthTrust contract
 *          and auto-calculates the rebate line. Kathy approves, overrides,
 *          or escalates to Designer Quinn (Director of Healthcare).
 *
 *          Reuses the ValidationCard grammar: Expected vs Actual (with AI
 *          suggestion), Accept / Override / Flag actions wired through
 *          MBIReasonModal. Approving posts the voucher; override requires
 *          a reason; flag escalates to Lynda with a Teams ping simulation.
 *
 * DS TOKENS: bg-amber-50 (HealthTrust signal) · success / info / danger
 *
 * USED BY: MBIAccountingPage (wizard scene 1)
 */

import { useState } from 'react'
import {
    Heart, Sparkles, CheckCircle2, Check, Pencil, Send,
    AlertTriangle, FileText, UserCheck, Flag, ChevronDown, ChevronUp,
    ShieldCheck, Users, FileCheck, Calculator,
} from 'lucide-react'
import { ReasonDialog as MBIReasonModal, StatusBadge } from '../shared'
import { MBI_INVOICES } from '../../config/profiles/mbi-data'

import DataSourcesBar, { SOURCES } from './DataSourcesBar'

type ExceptionStatus = 'pending' | 'approved' | 'overridden' | 'escalated'

const OVERRIDE_CATEGORIES = [
    { id: 'contract-ambiguous', label: 'GPO contract clause ambiguous' },
    { id: 'different-rate', label: 'Different rebate rate applies' },
    { id: 'exempt-line', label: 'Line items are exempt from rebate' },
    { id: 'other', label: 'Other (describe below)' },
]

const ESCALATE_CATEGORIES = [
    { id: 'director-review', label: 'Needs the Healthcare Director\'s GPO expertise' },
    { id: 'client-dispute', label: 'Client disputing rebate' },
    { id: 'audit-trigger', label: 'Potential audit trigger' },
    { id: 'other', label: 'Other (describe below)' },
]

export default function HealthTrustExceptionScene() {
    const invoice = MBI_INVOICES.find(i => i.id === 'INV-0486')!  // Riverside HealthTrust hero
    const rebate = Math.round(invoice.amount * 0.03)
    const totalDue = invoice.amount + rebate

    const [status, setStatus] = useState<ExceptionStatus>('pending')
    const [meta, setMeta] = useState<{ reasonCategory?: string; notes?: string; notifyAI?: boolean } | null>(null)
    const [toast, setToast] = useState<string | null>(null)
    const [modalKind, setModalKind] = useState<'override' | 'escalate' | null>(null)
    const [criteriaOpen, setCriteriaOpen] = useState(true)

    const pushToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 4200)
    }

    const handleApprove = () => {
        setStatus('approved')
        setMeta(null)
        pushToast(`Rebate approved · $${rebate.toLocaleString()} posted to GPO payable`)
    }

    const handleOverrideSubmit = (payload: { reasonCategory: string; notes: string }) => {
        setStatus('overridden')
        setMeta({ ...payload, notifyAI: false })
        setModalKind(null)
        pushToast(`Rebate overridden · reason logged to audit trail`)
    }

    const handleEscalateSubmit = (payload: { reasonCategory: string; notes: string; notifyAI: boolean }) => {
        setStatus('escalated')
        setMeta(payload)
        setModalKind(null)
        pushToast(`Escalated to Designer Quinn · Teams ping sent to #healthcare-gpo`)
    }

    const handleReopen = () => {
        setStatus('pending')
        setMeta(null)
    }

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                <FileText className="h-3 w-3 shrink-0" />
                <span>Bill Queue</span>
                <span className="text-border">›</span>
                <span className="font-bold text-foreground">{invoice.id} · {invoice.vendor} · HealthTrust rebate review</span>
            </div>

            {/* Invoice summary card */}
            <div className={`
                bg-card dark:bg-zinc-800 border-2 border-l-4 rounded-2xl overflow-hidden transition-all
                ${status === 'approved' ? 'border-success/30 border-l-success' : ''}
                ${status === 'overridden' ? 'border-info/30 border-l-info' : ''}
                ${status === 'escalated' ? 'border-red-300 dark:border-red-500/40 border-l-red-500' : ''}
                ${status === 'pending' ? 'border-border border-l-amber-400' : ''}
            `}>
                {/* Invoice header */}
                <div className="px-4 py-3 flex items-center gap-3">
                    <div className={`
                        h-9 w-9 rounded-xl flex items-center justify-center shrink-0
                        ${status === 'approved' ? 'bg-success/15 text-success' : ''}
                        ${status === 'overridden' ? 'bg-info/15 text-info' : ''}
                        ${status === 'escalated' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : ''}
                        ${status === 'pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' : ''}
                    `}>
                        {status === 'approved' && <CheckCircle2 className="h-4.5 w-4.5" />}
                        {status === 'overridden' && <Pencil className="h-4.5 w-4.5" />}
                        {status === 'escalated' && <Flag className="h-4.5 w-4.5" />}
                        {status === 'pending' && <Heart className="h-4.5 w-4.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <StatusBadge label="HealthTrust GPO" tone="warning" size="xs" />
                            <span className="text-[10px] font-mono text-muted-foreground">{invoice.id}</span>
                            <span className="text-[10px] text-border">·</span>
                            <span className="text-[10px] font-mono text-muted-foreground">{invoice.poNumber}</span>
                        </div>
                        <div className="mt-0.5 text-sm font-bold text-foreground leading-tight">
                            {invoice.vendor} <span className="font-normal text-muted-foreground">· {invoice.clientName ?? 'Riverside Medical Center'}</span>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-[10px] text-muted-foreground">Bill subtotal</div>
                        <div className="text-base font-bold text-foreground tabular-nums">${invoice.amount.toLocaleString()}</div>
                    </div>
                </div>

                {/* AI insight strip — collapsed by default */}
                <div className="border-t border-border">
                    <button
                        onClick={() => setCriteriaOpen(o => !o)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 dark:hover:bg-zinc-700/30 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-ai shrink-0" />
                            <span className="text-[11px] font-semibold text-foreground">
                                Strata found 1 consideration
                            </span>
                            <span className="text-[9px] bg-ai/10 text-ai font-bold px-1.5 py-0.5 rounded-full">97%</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                            <span>{criteriaOpen ? 'Hide' : 'View detail'}</span>
                            {criteriaOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </div>
                    </button>

                    {criteriaOpen && (
                        <div className="border-t border-border">
                            {/* Detection criteria */}
                            <div className="divide-y divide-ai/10">
                                <DetectionCriterion
                                    icon={<Users className="h-3 w-3" />}
                                    label="Client membership"
                                    value={invoice.clientName ?? 'Riverside Medical Center'}
                                    detail="HealthTrust GPO member · verified against contract DB"
                                    confidence={99}
                                />
                                <DetectionCriterion
                                    icon={<FileCheck className="h-3 w-3" />}
                                    label="Contract match"
                                    value="Master Agreement · Feb 2024"
                                    detail="Active contract · §4.2 Rebate Schedule · 3% on all GPO member orders"
                                    confidence={99}
                                />
                                <DetectionCriterion
                                    icon={<ShieldCheck className="h-3 w-3" />}
                                    label="Vendor eligibility"
                                    value={invoice.vendor}
                                    detail="HNI brand · covered under HealthTrust GPO purchasing terms"
                                    confidence={97}
                                />
                                <DetectionCriterion
                                    icon={<Calculator className="h-3 w-3" />}
                                    label="Rate applied"
                                    value="3% × $62,400"
                                    detail={`Rebate = $${rebate.toLocaleString()} · posts to GPO payable, not CORE`}
                                    confidence={97}
                                />
                            </div>

                            {/* Calculation */}
                            <div className="divide-y divide-border text-xs border-t border-border bg-muted/10 dark:bg-zinc-900/30">
                                <div className="px-4 py-2 flex justify-between">
                                    <span className="text-muted-foreground">Bill subtotal</span>
                                    <span className="text-foreground tabular-nums">${invoice.amount.toLocaleString()}</span>
                                </div>
                                <div className="px-4 py-2 flex justify-between bg-muted/20 dark:bg-zinc-900/40">
                                    <span className="font-bold text-foreground">Total due</span>
                                    <span className="text-foreground font-bold tabular-nums">${totalDue.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="px-4 py-3 border-t border-border">
                    {status === 'pending' ? (
                        <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setModalKind('escalate')}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-red-700 dark:text-red-400 bg-background dark:bg-zinc-800 border border-red-300 dark:border-red-500/40 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                >
                                    <Flag className="h-3.5 w-3.5" />
                                    Escalate
                                </button>
                                <button
                                    onClick={() => setModalKind('override')}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted hover:border-info/40 transition-colors"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Override
                                </button>
                                <button
                                    onClick={handleApprove}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    Approve & post
                                </button>
                            </div>
                            <div className="text-[10px] text-muted-foreground text-center">
                                Posts to GPO payable · handled outside CORE · not a bank payment
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 text-xs min-w-0">
                                    {status === 'approved' && <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />}
                                    {status === 'overridden' && <Pencil className="h-4 w-4 text-info shrink-0 mt-0.5" />}
                                    {status === 'escalated' && <Flag className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />}
                                    <div className="min-w-0">
                                        <div className="text-foreground font-semibold">
                                            {status === 'approved' && <>Rebate posted · <span className="text-success tabular-nums">${rebate.toLocaleString()}</span> to GPO payable</>}
                                            {status === 'overridden' && <>Rebate overridden · audit trail logged</>}
                                            {status === 'escalated' && <>Escalated to Designer Quinn · awaiting GPO review</>}
                                        </div>
                                        {meta?.reasonCategory && (
                                            <div className="text-[10px] text-muted-foreground mt-0.5">
                                                Reason: <span className="text-foreground font-medium">
                                                    {(status === 'overridden' ? OVERRIDE_CATEGORIES : ESCALATE_CATEGORIES)
                                                        .find(c => c.id === meta.reasonCategory)?.label ?? meta.reasonCategory}
                                                </span>
                                            </div>
                                        )}
                                        {meta?.notes && (
                                            <div className="text-[10px] text-muted-foreground italic mt-0.5 line-clamp-2">"{meta.notes}"</div>
                                        )}
                                    </div>
                                </div>
                                <button onClick={handleReopen} className="text-[10px] text-muted-foreground hover:text-foreground underline shrink-0">
                                    Reopen
                                </button>
                            </div>
                            {toast && (
                                <div className={`
                                    flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300
                                    ${status === 'approved' ? 'bg-success/15 text-success border border-success/30' : ''}
                                    ${status === 'overridden' ? 'bg-info/15 text-info border border-info/30' : ''}
                                    ${status === 'escalated' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30' : ''}
                                `}>
                                    {status === 'escalated' ? <Send className="h-3.5 w-3.5 shrink-0" /> : <Check className="h-3.5 w-3.5 shrink-0" />}
                                    <span className="truncate">{toast}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Context cards — who is Lynda, what contract */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-card dark:bg-zinc-800 border border-border rounded-xl p-3 flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-info/15 text-info flex items-center justify-center shrink-0">
                        <UserCheck className="h-4 w-4" />
                    </div>
                    <div className="text-xs min-w-0">
                        <div className="font-bold text-foreground">Designer Quinn</div>
                        <div className="text-[10px] text-muted-foreground">Director of Healthcare · owns HealthTrust contract</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Teams · #healthcare-gpo · responds ~1h</div>
                    </div>
                </div>
                <div className="bg-card dark:bg-zinc-800 border border-border rounded-xl p-3 flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                    </div>
                    <div className="text-xs min-w-0">
                        <div className="font-bold text-foreground">HealthTrust Master Agreement</div>
                        <div className="text-[10px] text-muted-foreground">Signed Feb 2024 · 3% rebate on all GPO member orders</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Covers Riverside, Lakeside, 14 other hospitals</div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <MBIReasonModal
                isOpen={modalKind === 'override'}
                onClose={() => setModalKind(null)}
                onSubmit={payload => handleOverrideSubmit({ reasonCategory: payload.categoryId, notes: payload.notes })}
                tone="info"
                icon={<Pencil className="h-5 w-5" />}
                title="Override the 3% rebate"
                subtitle={`${invoice.vendor} · ${invoice.id}`}
                contextBanner={{
                    tone: 'warning',
                    icon: <AlertTriangle className="h-4 w-4" />,
                    title: 'Rebate won\'t be applied to this bill.',
                    body: (
                        <>
                            The <strong className="tabular-nums">${rebate.toLocaleString()}</strong> stays off the GPO payable. Audit trail captures your reason so finance can trace it later.
                        </>
                    ),
                }}
                categories={OVERRIDE_CATEGORIES}
                defaultCategoryId="contract-ambiguous"
                categoryPrompt="Why override the rebate?"
                notesPlaceholder="e.g. Per HealthTrust amendment dated 03/04, this line item is exempt from rebate..."
                notesRequiredForCategoryId="other"
                confirmLabel="Skip rebate · log override"
            />
            <MBIReasonModal
                isOpen={modalKind === 'escalate'}
                onClose={() => setModalKind(null)}
                onSubmit={payload => handleEscalateSubmit({
                    reasonCategory: payload.categoryId,
                    notes: payload.notes,
                    notifyAI: payload.notifyAI,
                })}
                tone="danger"
                icon={<Flag className="h-5 w-5" />}
                title="Escalate to the Healthcare Director"
                subtitle={`Owns GPO contracts · ~1 hour response in Teams`}
                contextBanner={{
                    tone: 'info',
                    icon: <UserCheck className="h-4 w-4" />,
                    title: 'The Healthcare Director will see this in Teams within the hour.',
                    body: 'Posts to #healthcare-gpo with bill context + your reason. The rebate stays on hold until they respond.',
                }}
                categories={ESCALATE_CATEGORIES}
                defaultCategoryId="director-review"
                categoryPrompt="Why escalate?"
                notesPlaceholder="e.g. Riverside CFO emailed questioning the 3% — need the Healthcare Director to confirm whether the May addendum changes it."
                notesRequiredForCategoryId="other"
                notifyToggle={{
                    defaultOn: true,
                    title: 'Also ping Strata AI',
                    description: 'Escalation pattern trains the router · helps Strata catch this class of issue earlier next time.',
                }}
                confirmLabel="Escalate to Director"
                confirmLabelWhenNotifying="Escalate & notify AI"
            />

            {/* Data sources */}
            <DataSourcesBar groups={[
                { sources: [SOURCES.HT_DB] },
                { sources: [SOURCES.STRATA_AI] },
                { sources: [SOURCES.CORE_RPA, SOURCES.TEAMS] },
            ]} />
        </div>
    )
}

function DetectionCriterion({
    icon, label, value, detail, confidence,
}: {
    icon: React.ReactNode
    label: string
    value: string
    detail: string
    confidence: number
}) {
    return (
        <div className="px-4 py-2 flex items-start gap-2.5 bg-background/40 dark:bg-zinc-900/20">
            <div className="h-6 w-6 rounded-md bg-ai/10 text-ai flex items-center justify-center shrink-0 mt-0.5">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
                    <div className="text-[9px] font-bold text-success tabular-nums shrink-0">{confidence}%</div>
                </div>
                <div className="text-[11px] font-semibold text-foreground truncate">{value}</div>
                <div className="text-[10px] text-muted-foreground leading-snug">{detail}</div>
            </div>
            <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-1" />
        </div>
    )
}
