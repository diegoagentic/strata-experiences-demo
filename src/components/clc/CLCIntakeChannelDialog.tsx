import { Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, Sparkles, AlertTriangle, ShieldCheck, Mail, Layers } from 'lucide-react'

interface Props {
    isOpen: boolean
    onClose: () => void
    onPick: (channel: 'email' | 'platform') => void
}

/**
 * Channel selector dialog (clc3.1).
 * Strata flags the phishing risk of direct email links and recommends
 * delivery via the customer's existing platform (Procore / Teams / OneDrive).
 */
export default function CLCIntakeChannelDialog({ isOpen, onClose, onPick }: Props) {
    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[200]">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" />
                </TransitionChild>
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                            <div className="p-5 border-b border-border flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-9 w-9 rounded-xl bg-brand-300/40 dark:bg-brand-500/20 flex items-center justify-center">
                                        <Sparkles className="h-5 w-5 text-zinc-800 dark:text-zinc-200" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-foreground">Pick delivery channel</h2>
                                        <p className="text-[11px] text-muted-foreground">Strata AI · Fairport Public Library · 10-question survey ready</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    aria-label="Close"
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-4 space-y-2">
                                {/* Email — flagged warning */}
                                <button
                                    onClick={() => onPick('email')}
                                    className="w-full text-left p-4 border border-yellow-200 bg-yellow-50/60 hover:bg-yellow-50 dark:border-yellow-500/30 dark:bg-yellow-500/10 rounded-xl transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-5 w-5 text-yellow-700 dark:text-yellow-300 mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-sm font-bold text-foreground">Direct email link</span>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 uppercase tracking-wider">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Phishing risk
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">External links via email commonly trip spam filters. Project leads at large institutions often treat unknown-sender links as suspect — survey response rate drops.</p>
                                        </div>
                                    </div>
                                </button>

                                {/* Platform — recommended */}
                                <button
                                    onClick={() => onPick('platform')}
                                    className="w-full text-left p-4 border border-green-200 bg-green-50/60 hover:bg-green-50 dark:border-green-500/30 dark:bg-green-500/10 rounded-xl transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <Layers className="h-5 w-5 text-green-700 dark:text-green-300 mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-sm font-bold text-foreground">Procore project channel</span>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 uppercase tracking-wider">
                                                    <ShieldCheck className="h-3 w-3" />
                                                    Recommended
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">Customer is already authenticated to Procore for this project · the survey arrives from a trusted source · response rate ~3× the email path in CLC's prior projects.</p>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <div className="px-4 pb-4 pt-1 flex items-center justify-between">
                                <p className="text-[11px] text-muted-foreground">Strata never auto-sends · operator confirms each send.</p>
                                <button
                                    onClick={onClose}
                                    className="text-[11px] font-medium text-muted-foreground hover:text-foreground underline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
