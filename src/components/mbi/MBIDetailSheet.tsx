/**
 * COMPONENT: MBIDetailSheet
 * PURPOSE: Reusable right-side floating sheet for deep-dive content that would
 *          otherwise clutter a wizard step (XML source, line items tables,
 *          AI reasoning, activity logs). Keeps step surfaces focused on the
 *          primary action while deep context stays one click away.
 *
 * PROPS:
 *   - isOpen: boolean
 *   - onClose: () => void
 *   - title: string
 *   - subtitle?: string
 *   - icon?: ReactNode               — optional lucide icon for the header
 *   - width?: 'sm' | 'md' | 'lg'     — max-w-md | max-w-2xl | max-w-4xl
 *   - children: ReactNode
 *
 * DS TOKENS: bg-card · border-border · rounded-l-2xl · shadow-2xl
 *
 * USED BY: Budget wizard steps (ParsingStep XML viewer, ReviewStep line items,
 *          ValidationStep AI reasoning, OutputStep document preview)
 */

import { Fragment, type ReactNode } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { X } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'

interface MBIDetailSheetProps {
    isOpen: boolean
    onClose: () => void
    title: string
    subtitle?: string
    icon?: ReactNode
    width?: 'sm' | 'md' | 'lg'
    children: ReactNode
}

const WIDTH_MAP = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
}

export default function MBIDetailSheet({
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    width = 'md',
    children,
}: MBIDetailSheetProps) {
    const { isDemoActive, isSidebarCollapsed } = useDemo()
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed
    const offsetClass = sidebarExpanded ? 'lg:pl-80' : ''

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[100]">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className={`fixed inset-0 bg-background/70 backdrop-blur-sm ${offsetClass}`} />
                </TransitionChild>

                <div className={`fixed inset-0 overflow-hidden ${offsetClass}`}>
                    <div className="flex min-h-full items-stretch justify-end">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-250"
                            enterFrom="translate-x-full"
                            enterTo="translate-x-0"
                            leave="ease-in duration-200"
                            leaveFrom="translate-x-0"
                            leaveTo="translate-x-full"
                        >
                            <DialogPanel
                                className={`w-full ${WIDTH_MAP[width]} bg-card dark:bg-zinc-900 border-l border-border shadow-2xl flex flex-col h-screen`}
                            >
                                <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border bg-muted/30 dark:bg-zinc-800 shrink-0">
                                    <div className="flex items-start gap-3 min-w-0">
                                        {icon && (
                                            <div className="h-9 w-9 rounded-xl bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                                                {icon}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <DialogTitle className="text-sm font-bold text-foreground truncate">{title}</DialogTitle>
                                            {subtitle && (
                                                <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                                        aria-label="Close"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-5">
                                    {children}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
