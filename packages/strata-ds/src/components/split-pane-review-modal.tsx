/**
 * SplitPaneReviewModal — Headless UI port of the canonical DS
 * SplitPaneReviewModal.
 *
 * Same prop API as the canonical version (Strata Design System/strata-ds/src/
 * components/overlays/split-pane-review-modal.tsx). Impl uses @headlessui/react
 * Dialog + Transition because this catalyst-vendored DS does not ship Radix.
 *
 * Captures the sidebar-aware workflow review shell duplicated in
 * BFIDocumentReviewModal and OfficeworksDocumentReviewModal:
 *   - Sidebar-aware backdrop + content offset (left-80 / left-0)
 *   - Fixed top-0 / bottom-0 positioning (not centered)
 *   - 3/5 + 2/5 split-pane body by default
 *   - AI context banner row between header and body
 *   - Funnel/stepper slot in the header center
 *   - Optional fullContent mode that bypasses the split
 */

import { Fragment, type ReactNode } from 'react'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Sparkles, X } from 'lucide-react'

const cn = (...parts: (string | false | null | undefined)[]) =>
    parts.filter(Boolean).join(' ')

export interface SplitPaneReviewModalProps {
    open: boolean
    onClose: () => void

    title: ReactNode
    subtitle?: ReactNode

    /** Slot rendered between subtitle area and close button (e.g. funnel stepper). */
    headerCenter?: ReactNode
    /** Extra header actions to the left of the close button. */
    headerActions?: ReactNode

    /** AI context banner row rendered below the header. */
    aiBanner?: ReactNode

    /** Left pane content (3/5 width). Ignored when fullContent is set. */
    leftPane?: ReactNode
    /** Right pane content (2/5 width). Ignored when fullContent is set. */
    rightPane?: ReactNode
    /** When set, replaces the split-pane layout with a full-width body. */
    fullContent?: ReactNode

    /** Footer slot rendered at the bottom (typically a primary CTA). */
    footer?: ReactNode

    /**
     * Tailwind class applied to overlay + content wrapper to leave room for a
     * sidebar (e.g. 'left-80'). Defaults to 'left-0'.
     */
    sidebarOffsetClass?: string

    /** Override the icon shown in the header (defaults to Sparkles). */
    headerIcon?: ReactNode

    className?: string
}

export function SplitPaneReviewModal({
    open,
    onClose,
    title,
    subtitle,
    headerCenter,
    headerActions,
    aiBanner,
    leftPane,
    rightPane,
    fullContent,
    footer,
    sidebarOffsetClass = 'left-0',
    headerIcon,
    className,
}: SplitPaneReviewModalProps) {
    return (
        <Transition show={open} as={Fragment}>
            <Dialog as="div" className="relative z-[200]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-200"  leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className={cn('fixed top-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm', sidebarOffsetClass)} />
                </TransitionChild>

                <div className={cn('fixed top-0 right-0 bottom-0 overflow-y-auto', sidebarOffsetClass)}>
                    <div className="flex min-h-full items-center justify-center p-3">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel
                                className={cn(
                                    'w-full max-w-6xl h-[calc(100vh-1.5rem)] transform overflow-hidden rounded-2xl bg-card text-left shadow-2xl border border-border flex flex-col transition-all',
                                    className,
                                )}
                            >
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4 shrink-0">
                                    <div className="flex items-center gap-3 min-w-0 shrink-0">
                                        <div className="h-9 w-9 rounded-xl bg-ai/10 text-ai flex items-center justify-center shrink-0">
                                            {headerIcon ?? <Sparkles className="h-5 w-5" aria-hidden="true" />}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-[15px] font-bold text-foreground leading-tight truncate">
                                                {title}
                                            </h3>
                                            {subtitle && (
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    {subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {headerCenter && (
                                        <div className="flex-1 flex justify-center min-w-0 overflow-hidden">
                                            {headerCenter}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1 shrink-0">
                                        {headerActions}
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            aria-label="Close"
                                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                        >
                                            <X className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>

                                {/* AI banner row */}
                                {aiBanner && (
                                    <div className="px-6 py-2 bg-ai/5 border-b border-ai/20 flex items-center gap-2 shrink-0">
                                        <Sparkles className="h-3.5 w-3.5 text-ai shrink-0" aria-hidden="true" />
                                        <div className="text-[11px] text-ai font-medium truncate">
                                            {aiBanner}
                                        </div>
                                    </div>
                                )}

                                {/* Body */}
                                {fullContent ? (
                                    <div className="flex-1 min-h-0 overflow-y-auto bg-muted/10">
                                        {fullContent}
                                    </div>
                                ) : (
                                    <div className="flex-1 grid grid-cols-5 min-h-0">
                                        <div className="col-span-3 border-r border-border flex flex-col min-h-0">
                                            {leftPane}
                                        </div>
                                        <div className="col-span-2 flex flex-col min-h-0 overflow-hidden">
                                            {rightPane}
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                {footer && (
                                    <div className="border-t border-border px-5 py-3 bg-card shrink-0">
                                        {footer}
                                    </div>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
