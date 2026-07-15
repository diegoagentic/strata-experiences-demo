import { Sparkles, X, ArrowRight, Calendar as CalendarIcon, Send } from 'lucide-react'
import type { InstallJob } from './installScheduleData'

interface CLCRescheduleConfirmModalProps {
    job: InstallJob
    /** The date the user proposes to move the job to (ISO). */
    newStart: string
    /** When true, the proposed date matches the AI suggestion · header swaps
        to the Strata-AI framing + the suggestion reason is shown. */
    isAiSuggested: boolean
    onConfirm: () => void
    onCancel: () => void
}

/**
 * Confirmation modal shown before committing a reschedule in clc1.3.
 * Two visual modes:
 *   isAiSuggested · Sparkles header · "Strata's suggestion · accept?"
 *   manual override · neutral header · "Confirm reschedule"
 *
 * Confirm fires the parent's onConfirm (which commits handleJobDrop +
 * advances to clc1.4). Cancel reverts to clc1.3 without mutating state.
 */
export default function CLCRescheduleConfirmModal({
    job,
    newStart,
    isAiSuggested,
    onConfirm,
    onCancel,
}: CLCRescheduleConfirmModalProps) {
    return (
        <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reschedule-confirm-title"
        >
            <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                <header className="p-4 border-b border-border flex items-start justify-between gap-3">
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                            {isAiSuggested ? 'Strata AI suggestion' : 'Reschedule'}
                        </div>
                        <h2 id="reschedule-confirm-title" className="text-base font-bold text-foreground leading-tight inline-flex items-center gap-2">
                            {isAiSuggested && <Sparkles className="h-4 w-4 text-ai" />}
                            {isAiSuggested ? 'Accept the suggested slot?' : 'Confirm reschedule'}
                        </h2>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            {job.customer} · {job.iqJobIds.length} IQ job{job.iqJobIds.length > 1 ? 's' : ''} · {job.crewSize}-crew · {job.durationDays} day{job.durationDays !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        aria-label="Cancel"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-muted/30 border border-border">
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">From</div>
                            <div className="text-sm font-mono text-foreground tabular-nums">{job.startDate}</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">To</div>
                            <div className={`text-sm font-mono tabular-nums ${isAiSuggested ? 'text-ai font-bold' : 'text-foreground'}`}>{newStart}</div>
                        </div>
                    </div>

                    {isAiSuggested && job.aiSuggestionReason && (
                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-ai/30 bg-ai/5">
                            <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                            <p className="text-[11px] text-foreground leading-relaxed">
                                {job.aiSuggestionReason}
                            </p>
                        </div>
                    )}

                    <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-yellow-50/60 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30">
                        <CalendarIcon className="h-3.5 w-3.5 text-yellow-700 dark:text-yellow-300 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-foreground leading-relaxed">
                            Change queues for the <strong>nightly IQ batch sync · 2am ET</strong>. Operator can revert from the source list until then.
                        </p>
                    </div>
                </div>

                <footer className="p-3 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-foreground text-background hover:opacity-90 transition-opacity"
                    >
                        <Send className="h-3 w-3" />
                        {isAiSuggested ? 'Accept · queue for IQ' : 'Confirm · queue for IQ'}
                    </button>
                </footer>
            </div>
        </div>
    )
}
