/**
 * ARDepositsModal · Quick-action wrapper around <ARDepositsPanel>.
 *
 * Previously the AR & Deposits panel was rendered always-visible at the
 * bottom of the Order/Quote/Ack detail Tab 1, adding a heavy zone to an
 * already saturated screen. It now opens from a quick-action button at the
 * tab-bar level (BanknotesIcon) and only appears on demand.
 *
 * Per Modal Normalization Spec.
 */

import { Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, Banknote } from 'lucide-react'
import ARDepositsPanel from './ARDepositsPanel'

interface ARDepositsModalProps {
    isOpen: boolean
    onClose: () => void
    documentId?: string
}

export default function ARDepositsModal({ isOpen, onClose, documentId }: ARDepositsModalProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-4xl rounded-xl border border-border bg-card shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
                                {/* Header */}
                                <div className="px-5 py-3 border-b border-border bg-card flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                                            <Banknote className="h-4 w-4 text-success" aria-hidden="true" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-bold text-foreground">AR &amp; Deposits</h3>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                {documentId ? `${documentId} · ` : ''}Production gated on deposit · AI drafts the follow-up
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        aria-label="Close AR &amp; Deposits"
                                        className="shrink-0 h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Body · embed existing ARDepositsPanel */}
                                <div className="flex-1 overflow-y-auto p-5">
                                    <ARDepositsPanel />
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-3 border-t border-border bg-card flex items-center justify-end gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="inline-flex items-center justify-center h-9 px-4 rounded-md text-[12px] font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
