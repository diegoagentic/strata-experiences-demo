/**
 * COMPONENT: DesignFindingsReview
 * PURPOSE: Flow 4 · Scene 2 — Beth reviews the 1 palette finding from the
 *          Spec Check scan, applies the swap, then the demo closes with a
 *          multi-flow recap that reframes the 4 AIs as one chain and invites
 *          the user to restart or jump to any flow.
 *
 *          Uses the ValidationCard grammar (Accept/Override/Reject) for the
 *          finding itself. Once resolved, renders FlowHandoff configured as
 *          a final recap (no downstream flow — primary CTA restarts).
 *
 * USED BY: MBIDesignPage (wizard scene 2)
 */

import { useState } from 'react'
import {
    AlertTriangle, Palette, Sparkles, Check, Pencil, X, CheckCircle2,
    Clock, ShieldCheck, TrendingDown, Award, Receipt, FileText,
    Calculator, Send, ArrowRight, Brain, Flag,
} from 'lucide-react'
import { ReasonDialog as MBIReasonModal, StatusBadge } from '../shared'
import FlowHandoff from './FlowHandoff'

const OVERRIDE_CATEGORIES = [
    { id: 'client-requested', label: 'Client specifically asked for this finish' },
    { id: 'accent-piece', label: 'Intentional accent · palette exception' },
    { id: 'vendor-stock', label: 'Only finish in stock for install date' },
    { id: 'other', label: 'Other (describe below)' },
]

const REJECT_CATEGORIES = [
    { id: 'false-positive', label: 'False positive · finish actually matches' },
    { id: 'palette-changed', label: 'Palette changed · update project defaults' },
    { id: 'not-applicable', label: 'Not applicable to this line' },
    { id: 'other', label: 'Other (describe below)' },
]

type FindingStatus = 'pending' | 'accepted' | 'overridden' | 'rejected'

export default function DesignFindingsReview() {
    const [status, setStatus] = useState<FindingStatus>('pending')
    const [meta, setMeta] = useState<{ categoryId?: string; notes?: string; notifyAI?: boolean } | null>(null)
    const [toast, setToast] = useState<string | null>(null)
    const [modalKind, setModalKind] = useState<'override' | 'reject' | null>(null)

    const pushToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 4200)
    }

    const handleAccept = () => {
        setStatus('accepted')
        setMeta(null)
        pushToast('Swap applied · Line 23 now Onyx Black · palette 100% match')
    }

    const handleOverrideSubmit = (payload: { categoryId: string; notes: string }) => {
        setStatus('overridden')
        setMeta(payload)
        setModalKind(null)
        pushToast('Kept Forest Green · palette exception logged in CET')
    }

    const handleRejectSubmit = (payload: { categoryId: string; notes: string; notifyAI: boolean }) => {
        setStatus('rejected')
        setMeta(payload)
        setModalKind(null)
        pushToast(payload.notifyAI ? 'Flag rejected · feedback sent to Strata AI' : 'Flag rejected · logged locally')
    }

    const handleReopen = () => {
        setStatus('pending')
        setMeta(null)
    }

    const resolved = status !== 'pending'

    return (
        <div className="space-y-4">
            {/* Finding hero card (Expected vs Actual grammar) */}
            <div className={`
                border-2 border-l-4 rounded-2xl p-4 transition-all
                ${status === 'accepted' ? 'border-success/40 bg-success/5 dark:bg-success/10 border-l-success' : ''}
                ${status === 'overridden' ? 'border-info/40 bg-info/5 dark:bg-info/10 border-l-info' : ''}
                ${status === 'rejected' ? 'border-border bg-muted/30 dark:bg-zinc-800 border-l-muted-foreground/40' : ''}
                ${status === 'pending' ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/70 dark:bg-amber-500/10 border-l-amber-500' : ''}
            `}>
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    <div className={`
                        h-10 w-10 rounded-full flex items-center justify-center shrink-0
                        ${status === 'accepted' ? 'bg-success/15 text-success' : ''}
                        ${status === 'overridden' ? 'bg-info/15 text-info' : ''}
                        ${status === 'rejected' ? 'bg-muted text-muted-foreground' : ''}
                        ${status === 'pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' : ''}
                    `}>
                        {status === 'accepted' && <CheckCircle2 className="h-5 w-5" />}
                        {status === 'overridden' && <Pencil className="h-5 w-5" />}
                        {status === 'rejected' && <X className="h-5 w-5" />}
                        {status === 'pending' && <Palette className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <StatusBadge label="Palette mismatch" tone="warning" size="sm" />
                            <span className="text-[10px] text-muted-foreground">AI 92%</span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground leading-tight mt-1">
                            Finish inconsistency <span className="text-muted-foreground font-normal text-sm">on Meridian Sync chair</span>
                        </h3>
                        <div className="text-[11px] text-muted-foreground">
                            <span className="font-mono text-foreground">Line 23</span> · Meridian Sync task chair · Lakeside ICU
                        </div>
                    </div>
                </div>

                {/* Expected vs Actual with palette chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    <div className="bg-muted/70 dark:bg-zinc-900/40 border border-border rounded-lg p-3">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Expected</div>
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-md border border-border shrink-0" style={{ backgroundColor: '#1F2937' }} />
                            <div className="text-xs text-foreground">Onyx Black · project palette</div>
                        </div>
                    </div>
                    <div className="bg-muted/70 dark:bg-zinc-900/40 border border-amber-200 dark:border-amber-500/30 rounded-lg p-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-amber-700 dark:text-amber-400">Actual</div>
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-md border border-border shrink-0" style={{ backgroundColor: '#228B22' }} />
                            <div className="text-xs text-foreground">Forest Green · outside palette</div>
                        </div>
                    </div>
                </div>

                {/* AI suggestion */}
                <div className="bg-muted/70 dark:bg-zinc-900/40 border border-border rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="h-3 w-3 text-ai" />
                        <div className="text-[10px] font-bold uppercase tracking-wider text-ai">AI suggestion</div>
                    </div>
                    <div className="text-xs text-foreground leading-relaxed">
                        Finish inconsistent with the project's Marine Blue palette (5 colors, no green). Recommend swap to <strong>Onyx Black</strong> to match. Alternative: tag as intentional accent + update palette.
                    </div>
                </div>

                {/* Actions */}
                {status === 'pending' ? (
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => setModalKind('reject')}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-muted-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted hover:border-muted-foreground/40 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                            Reject
                        </button>
                        <button
                            onClick={() => setModalKind('override')}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted hover:border-info/40 transition-colors"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            Override
                        </button>
                        <button
                            onClick={handleAccept}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <Check className="h-3.5 w-3.5" />
                            Accept swap
                        </button>
                    </div>
                ) : (
                    <div className="pt-3 border-t border-current/10 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 text-xs min-w-0">
                                {status === 'accepted' && <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />}
                                {status === 'overridden' && <Pencil className="h-4 w-4 text-info shrink-0 mt-0.5" />}
                                {status === 'rejected' && <X className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
                                <div className="min-w-0">
                                    <div className="text-foreground font-semibold">
                                        {status === 'accepted' && <>Swap applied · <span className="text-success">BOM clean · palette 100% match</span></>}
                                        {status === 'overridden' && <>Kept Forest Green · palette exception logged</>}
                                        {status === 'rejected' && <>Flag rejected{meta?.notifyAI ? ' · AI notified' : ' · logged locally'}</>}
                                    </div>
                                    {meta?.categoryId && (
                                        <div className="text-[10px] text-muted-foreground mt-0.5">
                                            Reason: <span className="text-foreground font-medium">
                                                {(status === 'overridden' ? OVERRIDE_CATEGORIES : REJECT_CATEGORIES)
                                                    .find(c => c.id === meta.categoryId)?.label ?? meta.categoryId}
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
                                ${status === 'accepted' ? 'bg-success/15 text-success border border-success/30' : ''}
                                ${status === 'overridden' ? 'bg-info/15 text-info border border-info/30' : ''}
                                ${status === 'rejected' ? 'bg-muted text-foreground border border-border' : ''}
                            `}>
                                {status === 'rejected' && meta?.notifyAI
                                    ? <Brain className="h-3.5 w-3.5 shrink-0" />
                                    : <Check className="h-3.5 w-3.5 shrink-0" />}
                                <span className="truncate">{toast}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Resolved → adoption proof point */}
            {resolved && status === 'accepted' && (
                <div className="bg-success/5 dark:bg-success/10 border border-success/30 rounded-xl p-3 flex items-start gap-2.5 animate-in fade-in duration-300">
                    <Award className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">Proof point unlocked</div>
                        <div className="text-muted-foreground mt-0.5">
                            Beth caught it, Strata suggested the swap, she approved in one click. This is the story Lisa needs to roll the tool out to AP Lead (4/10) and Operations Lead (1/10) next.
                        </div>
                    </div>
                </div>
            )}

            {/* Final multi-flow recap — only after finding is resolved */}
            {resolved && (
                <FlowHandoff
                    eyebrow="Demo complete · full arc"
                    recapHeading="MBI's 4 AIs · one platform · one story"
                    recapSubheading="From Beth catching a $18K-class mistake at the design source, to Amanda delivering in 4 min, to Kathy closing the queue in 18 min, to the PC team sending a proposal in 12 min. The loop closes upstream."
                    recapStats={[
                        { icon: <Clock className="h-4 w-4" />, value: '4 min', sub: 'Amanda · Flow 1', accent: 'text-success' },
                        { icon: <Clock className="h-4 w-4" />, value: '18 min', sub: 'Kathy · Flow 1', accent: 'text-success' },
                        { icon: <Clock className="h-4 w-4" />, value: '12 min', sub: 'PC team · Flow 2', accent: 'text-success' },
                        { icon: <Clock className="h-4 w-4" />, value: '< 5 min', sub: 'Beth · Flow 3', accent: 'text-success' },
                    ]}
                    timeline={[
                        { status: 'done', icon: <Palette className="h-3.5 w-3.5" />, label: 'Design caught at source', caption: 'Beth · Flow 3', flow: 'Flow 3 · Design AI' },
                        { status: 'done', icon: <Calculator className="h-3.5 w-3.5" />, label: 'Budget delivered fast', caption: 'Amanda · Flow 1', flow: 'Flow 1 · Budget Builder' },
                        { status: 'done', icon: <FileText className="h-3.5 w-3.5" />, label: 'PC queue unblocked', caption: 'Marcia · Flow 2', flow: 'Flow 2 · Quotes AI' },
                        { status: 'done', icon: <Receipt className="h-3.5 w-3.5" />, label: 'Queue in 18 min', caption: 'Kathy · Flow 1', flow: 'Flow 1 · Accounting AI' },
                        { status: 'future', icon: <Send className="h-3.5 w-3.5" />, label: 'Run it again', caption: 'restart the loop', flow: '—', highlight: true },
                    ]}
                    narrative={{
                        eyebrow: 'The loop closes upstream',
                        icon: <ShieldCheck className="h-5 w-5" />,
                        title: "Catching issues at the source — Design — is more leverage than catching them downstream. One palette finding here prevents days of rework once the SIF reaches Quotes.",
                        body: (
                            <>
                                MBI's AI story is not 4 point solutions — it's <strong className="text-foreground">one chain that prevents work from piling up</strong>.
                                Design catches it at the source. Budget Builder formalizes the spec. Quotes AI converts it without re-keying. Accounting
                                processes the invoices that come back. Every step reduces the work of the next. <strong className="text-foreground">That's the pitch.</strong>
                            </>
                        ),
                    }}
                    primaryCTA={{
                        label: "Restart from Accounting AI",
                        icon: <ArrowRight className="h-4 w-4" />,
                        targetStepId: 'm2.1',
                    }}
                    secondaryCTAs={[
                        { label: 'Flow 1 · Accounting', icon: <Receipt className="h-3 w-3" />, targetStepId: 'm2.1' },
                        { label: 'Flow 2 · PC team', icon: <FileText className="h-3 w-3" />, targetStepId: 'm3.1' },
                        { label: 'Re-run Spec Check', icon: <Palette className="h-3 w-3" />, targetStepId: 'm4.1' },
                    ]}
                />
            )}

            {/* Override modal */}
            <MBIReasonModal
                isOpen={modalKind === 'override'}
                onClose={() => setModalKind(null)}
                onSubmit={payload => handleOverrideSubmit({ categoryId: payload.categoryId, notes: payload.notes })}
                tone="info"
                icon={<Pencil className="h-5 w-5" />}
                title="Keep Forest Green?"
                subtitle="Line 23 · Meridian Sync · Lakeside ICU"
                contextBanner={{
                    tone: 'warning',
                    icon: <AlertTriangle className="h-4 w-4" />,
                    title: "Palette exception will be logged in CET.",
                    body: "The line item stays as Forest Green and an exception note attaches to the BOM so the PC team sees it wasn't a miss.",
                }}
                categories={OVERRIDE_CATEGORIES}
                defaultCategoryId="client-requested"
                categoryPrompt="Why keep this finish?"
                notesPlaceholder="e.g. Client requested Forest Green as an accent in the waiting area — confirmed in design review 04/15."
                notesRequiredForCategoryId="other"
                confirmLabel="Keep finish · log exception"
            />

            {/* Reject modal */}
            <MBIReasonModal
                isOpen={modalKind === 'reject'}
                onClose={() => setModalKind(null)}
                onSubmit={payload => handleRejectSubmit({
                    categoryId: payload.categoryId,
                    notes: payload.notes,
                    notifyAI: payload.notifyAI,
                })}
                tone="danger"
                icon={<Flag className="h-5 w-5" />}
                title="Reject the flag"
                subtitle="Strata was wrong?"
                contextBanner={{
                    tone: 'info',
                    icon: <Brain className="h-4 w-4" />,
                    title: 'Your feedback trains Spec Check.',
                    body: "Design AI's accuracy depends on pilot feedback. Tell Strata why this flag doesn't apply.",
                }}
                categories={REJECT_CATEGORIES}
                defaultCategoryId="false-positive"
                categoryPrompt="Why reject?"
                notesPlaceholder="e.g. Palette was updated last week to include Forest Green — CET palette library hasn't synced yet."
                notesRequiredForCategoryId="other"
                notifyToggle={{
                    defaultOn: true,
                    title: 'Send feedback to Strata AI',
                    description: "Your rejection + reason is logged to the Spec Check training pipeline. Helps the model catch Beth's real concerns.",
                }}
                confirmLabel="Reject flag"
                confirmLabelWhenNotifying="Reject & notify AI"
            />
        </div>
    )
}
