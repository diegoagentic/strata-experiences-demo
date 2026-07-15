import React, { Fragment } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import QuoteGenerationFlow from './QuoteGenerationFlow';

interface CreateQuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (path: string) => void;
}

export default function CreateQuoteModal({ isOpen, onClose, onNavigate }: CreateQuoteModalProps) {
    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
                </TransitionChild>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <DialogPanel className="relative transform overflow-hidden rounded-2xl bg-background text-left shadow-2xl transition-all w-full max-w-5xl h-[85vh] flex flex-col border border-border">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
                                    <h2 className="text-xl font-brand font-semibold text-foreground">Create New Quote</h2>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 bg-muted/50 dark:bg-zinc-900/50">
                                    <QuoteGenerationFlow onNavigate={onNavigate} onComplete={onClose} />
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
