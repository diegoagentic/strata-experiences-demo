import { Fragment, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

export function ProjectModalsDemo() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="space-y-8">
            {/* Document Preview Modal */}
            <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Document Preview (Dialog)</h4>
                <div className="p-6 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-white/10">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors font-medium text-sm"
                    >
                        Open Order Preview
                    </button>
                    <p className="mt-4 text-xs text-zinc-500">
                        A focused, centered modal used for previewing documents (e.g., Purchase Orders). Features a backdrop blur and a paper-like internal layout.
                    </p>
                </div>

                <Transition show={isOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-zinc-950/25 dark:bg-zinc-950/50 backdrop-blur-sm" />
                        </TransitionChild>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <TransitionChild
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 text-left align-middle shadow-xl transition-all ring-1 ring-zinc-950/5 dark:ring-white/10">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <DialogTitle as="h3" className="text-lg font-bold leading-6 text-zinc-900 dark:text-white">
                                                    Order Document Preview
                                                </DialogTitle>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                                    Previewing Purchase Order #PO-2025-001
                                                </p>
                                            </div>
                                            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300">
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>

                                        <div className="bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 text-sm">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="h-10 w-10 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center shrink-0">
                                                    <DocumentTextIcon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Purchase_Order_Final.pdf</h4>
                                                    <p className="text-zinc-500">2.4 MB • Generated Jan 12, 2026</p>
                                                </div>
                                            </div>
                                            <div className="h-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded flex items-center justify-center text-zinc-400 font-mono text-xs">
                                                [Document Preview Placeholder]
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Download PDF
                                            </button>
                                        </div>
                                    </DialogPanel>
                                </TransitionChild>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </div>
    )
}
