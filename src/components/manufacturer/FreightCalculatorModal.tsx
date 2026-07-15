/**
 * FreightCalculatorModal · Wraps FreightCalculator inside a Dialog so freight
 * can live as a quick action at the tab-bar level (consistent with Proforma,
 * Compare, Revision quick actions) instead of a saturating panel below the table.
 *
 * Wendy item 4 · auto-calc on mount still applies via FreightCalculator's useEffect.
 * Per Modal Normalization Spec.
 */

import { Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X } from 'lucide-react'
import FreightCalculator from './FreightCalculator'

interface FreightCalculatorModalProps {
    isOpen: boolean
    onClose: () => void
    onApply?: (total: number) => void
    quoteId?: string
}

export default function FreightCalculatorModal({ isOpen, onClose, onApply, quoteId }: FreightCalculatorModalProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                            <DialogPanel className="w-full max-w-3xl rounded-xl border border-border bg-card shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
                                {/* Header */}
                                <div className="px-5 py-3 border-b border-border bg-card flex items-center justify-between shrink-0">
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-bold text-foreground">Freight calculator</h3>
                                        {quoteId && (
                                            <p className="text-[11px] text-muted-foreground mt-0.5">{quoteId} · auto-calc applied to quote</p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        aria-label="Close freight calculator"
                                        className="shrink-0 h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Body · embed FreightCalculator (its own border is removed via wrapper) */}
                                <div className="flex-1 overflow-y-auto p-5">
                                    <div className="freight-modal-wrapper">
                                        <FreightCalculator onApply={onApply} />
                                    </div>
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
