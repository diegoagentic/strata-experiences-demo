// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Salesperson Action Bar
// v8 · w2.1 · Floating bottom pill for Sara (Salesperson). Mirrors the
// ProposalActionBar pattern from w2.2 but with only the two CTAs that
// matter for her step:
//   · Request Clarification  (asks the estimator a question)
//   · Forward to SAC         (approve + send to Riley for quote assembly)
//
// The Shell drives the scripted beats via pulseRequestClarification and
// pulseForward + simulated cursor props.
// ═══════════════════════════════════════════════════════════════════════════════

import { ArrowRight, MessageSquare, MousePointer2 } from 'lucide-react'
import { clsx } from 'clsx'

interface SalespersonActionBarProps {
    salesPrice: string
    onRequestClarification: () => void
    onForwardToSac: () => void
    /** When true the Request Clarification button pulses (simulated press). */
    pulseRequestClarification?: boolean
    /** When true the Forward to SAC button pulses (simulated press). */
    pulseForward?: boolean
    /** Which button the simulated cursor is hovering, if any. */
    cursorTarget?: 'request-clarification' | 'forward' | null
    /** True when the cursor has finished its click animation. */
    cursorClicked?: boolean
}

export default function SalespersonActionBar({
    salesPrice,
    onRequestClarification,
    onForwardToSac,
    pulseRequestClarification = false,
    pulseForward = false,
    cursorTarget = null,
    cursorClicked = false,
}: SalespersonActionBarProps) {
    const clarifyActive = cursorTarget === 'request-clarification'
    const forwardActive = cursorTarget === 'forward'

    return (
        <div
            className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-6 lg:px-10 animate-in fade-in slide-in-from-bottom-4 duration-300"
            role="toolbar"
            aria-label="Salesperson review actions"
        >
            <div className="w-full max-w-3xl flex items-center gap-3 px-5 py-3 rounded-full bg-card/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-border shadow-lg">
                <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                            Labor estimate
                        </span>
                        <span className="text-sm font-bold text-foreground leading-tight">
                            ${salesPrice}
                        </span>
                    </div>
                </div>

                {/* Request Clarification CTA */}
                <div className="relative">
                    <button
                        onClick={onRequestClarification}
                        id="salesperson-request-clarification-btn"
                        className={clsx(
                            'flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200',
                            pulseRequestClarification
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

                {/* Forward to SAC CTA */}
                <div className="relative">
                    <button
                        onClick={onForwardToSac}
                        id="salesperson-forward-btn"
                        className={clsx(
                            'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200',
                            pulseForward &&
                                'scale-95 ring-4 ring-primary/50 shadow-lg shadow-primary/40 animate-pulse',
                            forwardActive && cursorClicked && 'scale-95'
                        )}
                    >
                        Forward to SAC
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    {forwardActive && (
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
