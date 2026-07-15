// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Proposal Action Bar
// Refinement Phase 1 · v8 · scripted w2.2 flow
//
// Floating bottom pill that appears when the Shell is in 'proposal-review'
// state (w2.2 · SAC role). Four CTAs, each with cursor + pulse props so
// the Shell can script the Riley flow visibly:
//   · Assemble quote       (opens PricingWaterfall)
//   · Request Clarification (opens RequestClarificationModal · manual)
//   · Preview PDF          (opens ProposalPdfPreviewModal)
//   · Approve & Release    (triggers the release checklist + David detour)
// ═══════════════════════════════════════════════════════════════════════════════

import { CheckCircle2, FileText, MessageSquare, MousePointer2, Receipt } from 'lucide-react'
import { clsx } from 'clsx'

export type ProposalActionTarget =
    | 'assemble'
    | 'clarify'
    | 'preview'
    | 'approve'
    | null

interface ProposalActionBarProps {
    salesPrice: string
    onAssemble: () => void
    onRequestClarification: () => void
    onPreviewPdf: () => void
    onApproveRelease: () => void
    pulseAssemble?: boolean
    pulseClarify?: boolean
    pulsePreview?: boolean
    pulseApprove?: boolean
    cursorTarget?: ProposalActionTarget
    cursorClicked?: boolean
}

export default function ProposalActionBar({
    salesPrice,
    onAssemble,
    onRequestClarification,
    onPreviewPdf,
    onApproveRelease,
    pulseAssemble = false,
    pulseClarify = false,
    pulsePreview = false,
    pulseApprove = false,
    cursorTarget = null,
    cursorClicked = false,
}: ProposalActionBarProps) {
    const assembleActive = cursorTarget === 'assemble'
    const clarifyActive = cursorTarget === 'clarify'
    const previewActive = cursorTarget === 'preview'
    const approveActive = cursorTarget === 'approve'

    return (
        <div
            className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-6 lg:px-10 animate-in fade-in slide-in-from-bottom-4 duration-300"
            role="toolbar"
            aria-label="Proposal review actions"
        >
            <div className="w-full max-w-4xl flex items-center gap-3 px-5 py-3 rounded-full bg-card/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-border shadow-lg">
                <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                            Release package
                        </span>
                        <span className="text-sm font-bold text-foreground leading-tight">
                            ${salesPrice}
                        </span>
                    </div>
                </div>

                {/* Assemble quote (opens the pricing waterfall) */}
                <div className="relative">
                    <button
                        onClick={onAssemble}
                        className={clsx(
                            'flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200',
                            pulseAssemble
                                ? 'bg-primary/20 text-foreground ring-4 ring-primary/40 scale-95 animate-pulse'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                            assembleActive && cursorClicked && 'scale-95'
                        )}
                    >
                        <Receipt className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Assemble quote</span>
                    </button>
                    {assembleActive && (
                        <MousePointer2
                            className={clsx(
                                'absolute -right-2 -bottom-3 w-5 h-5 text-foreground drop-shadow-lg pointer-events-none transition-all duration-300',
                                cursorClicked
                                    ? 'translate-x-0 translate-y-0 scale-90'
                                    : 'translate-x-1 translate-y-1 animate-bounce'
                            )}
                            aria-hidden
                        />
                    )}
                </div>

                {/* Request Clarification */}
                <div className="relative">
                    <button
                        onClick={onRequestClarification}
                        className={clsx(
                            'flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200',
                            pulseClarify
                                ? 'bg-primary/20 text-foreground ring-4 ring-primary/40 scale-95 animate-pulse'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                            clarifyActive && cursorClicked && 'scale-95'
                        )}
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Request Clarification</span>
                    </button>
                    {clarifyActive && (
                        <MousePointer2
                            className={clsx(
                                'absolute -right-2 -bottom-3 w-5 h-5 text-foreground drop-shadow-lg pointer-events-none transition-all duration-300',
                                cursorClicked
                                    ? 'translate-x-0 translate-y-0 scale-90'
                                    : 'translate-x-1 translate-y-1 animate-bounce'
                            )}
                            aria-hidden
                        />
                    )}
                </div>

                {/* Preview PDF */}
                <div className="relative">
                    <button
                        onClick={onPreviewPdf}
                        className={clsx(
                            'flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200',
                            pulsePreview
                                ? 'bg-primary/20 text-foreground ring-4 ring-primary/40 scale-95 animate-pulse'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                            previewActive && cursorClicked && 'scale-95'
                        )}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Preview PDF</span>
                    </button>
                    {previewActive && (
                        <MousePointer2
                            className={clsx(
                                'absolute -right-2 -bottom-3 w-5 h-5 text-foreground drop-shadow-lg pointer-events-none transition-all duration-300',
                                cursorClicked
                                    ? 'translate-x-0 translate-y-0 scale-90'
                                    : 'translate-x-1 translate-y-1 animate-bounce'
                            )}
                            aria-hidden
                        />
                    )}
                </div>

                {/* Approve & Release */}
                <div className="relative">
                    <button
                        onClick={onApproveRelease}
                        className={clsx(
                            'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-all',
                            pulseApprove &&
                                'scale-95 ring-4 ring-primary/50 shadow-lg shadow-primary/40 animate-pulse',
                            approveActive && cursorClicked && 'scale-95'
                        )}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve &amp; Release
                    </button>
                    {approveActive && (
                        <MousePointer2
                            className={clsx(
                                'absolute -right-2 -bottom-3 w-5 h-5 text-foreground drop-shadow-lg pointer-events-none transition-all duration-300',
                                cursorClicked
                                    ? 'translate-x-0 translate-y-0 scale-90'
                                    : 'translate-x-1 translate-y-1 animate-bounce'
                            )}
                            aria-hidden
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
