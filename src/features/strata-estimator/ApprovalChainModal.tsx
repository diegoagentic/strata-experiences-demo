// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Approval Chain Modal
// v7 · Two-phase modal for the w2.2 approval flow:
//
//   1st open (davidSigned=false): renders the chain with everyone pending
//     and DOES NOT auto-advance. The Shell keeps it open for ~2 s, then
//     closes it to redirect the audience to David Park's real workspace.
//
//   2nd open (davidSigned=true): David is pre-checked and the modal
//     auto-chains through Alex → Sara → Jordan → fires onComplete.
// ═══════════════════════════════════════════════════════════════════════════════

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { Check, CheckCircle2, ShieldCheck, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useDemo } from '../../context/DemoContext'

interface ApprovalRole {
    name: string
    role: string
    photo: string
}

// Alex, Sara and Jordan sign off first in the real WRG process (design,
// sales and VP reviews happen before the senior estimator gets pinged for
// the final sign-off). David is listed last so when the modal opens
// Alex / Sara / Jordan render as already approved and only David is
// pending — matching the stakeholder feedback for a more realistic demo.
const CHAIN: ApprovalRole[] = [
    {
        name: 'Alex Rivera',
        role: 'Designer',
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face',
    },
    {
        name: 'Sara Chen',
        role: 'Salesperson',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    },
    {
        name: 'Jordan Park',
        role: 'VP Sales',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    },
    {
        name: 'David Park',
        role: 'Senior Estimator',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    },
]
const DAVID_INDEX = CHAIN.length - 1 // David is always last in the chain

const STEP_MS = 800

interface ApprovalChainModalProps {
    isOpen: boolean
    davidSigned: boolean
    onClose: () => void
    onComplete: () => void
}

export default function ApprovalChainModal({
    isOpen,
    davidSigned,
    onClose,
    onComplete,
}: ApprovalChainModalProps) {
    const [approvedCount, setApprovedCount] = useState(0)

    // Phase-aware timeline.
    //   · davidSigned=false → show all pending, do not advance. The Shell
    //     will close this modal in a couple of seconds to redirect the
    //     audience to David's workspace.
    //   · davidSigned=true  → David auto-checks on open, then Alex / Sara /
    //     Jordan auto-chain with the usual cadence and we fire onComplete.
    useEffect(() => {
        if (!isOpen) {
            setApprovedCount(0)
            return
        }

        if (!davidSigned) {
            setApprovedCount(0)
            return
        }

        const timers: ReturnType<typeof setTimeout>[] = []
        // David signs first (reflecting the workspace approval).
        timers.push(setTimeout(() => setApprovedCount(1), 300))
        // Alex / Sara / Jordan follow.
        for (let i = 1; i < CHAIN.length; i++) {
            timers.push(
                setTimeout(
                    () => setApprovedCount(i + 1),
                    300 + i * STEP_MS
                )
            )
        }
        timers.push(
            setTimeout(onComplete, 300 + CHAIN.length * STEP_MS + 400)
        )
        return () => timers.forEach(clearTimeout)
    }, [isOpen, davidSigned, onComplete])

    const progressPct = (approvedCount / CHAIN.length) * 100
    const done = approvedCount >= CHAIN.length
    const { isDemoActive, isSidebarCollapsed } = useDemo()
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed
    const offsetClass = sidebarExpanded ? 'lg:left-80' : ''

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-[100]"
                onClose={done ? onClose : () => {}}
            >
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className={clsx('fixed inset-0 bg-zinc-950/70 backdrop-blur-sm', offsetClass)} />
                </TransitionChild>

                <div className={clsx('fixed inset-0 flex items-center justify-center p-4', offsetClass)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="flex items-start gap-4 px-6 py-5 border-b border-border">
                                <div className="p-3 rounded-xl bg-primary/10 text-foreground dark:text-primary shrink-0">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-base font-bold text-foreground">
                                        Internal Release Checklist
                                    </DialogTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Four internal sign-offs required before releasing the JPS quote
                                    </p>
                                </div>
                                {done && (
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Progress bar */}
                            <div className="px-6 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        Signatures
                                    </span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider tabular-nums">
                                        {approvedCount} / {CHAIN.length}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500 ease-out"
                                        style={{ width: `${progressPct}%` }}
                                    />
                                </div>
                            </div>

                            {/* Chain rows */}
                            <div className="p-6 space-y-3">
                                {CHAIN.map((person, i) => {
                                    const approved = i < approvedCount
                                    const pending = i === approvedCount && !done
                                    return (
                                        <div
                                            key={person.name}
                                            className={clsx(
                                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                                                approved && 'bg-green-500/5 dark:bg-green-500/10',
                                                !approved && 'bg-muted/40'
                                            )}
                                        >
                                            <img
                                                src={person.photo}
                                                alt={person.name}
                                                className={clsx(
                                                    'w-10 h-10 rounded-full object-cover shrink-0 transition-all',
                                                    approved && 'ring-2 ring-green-500',
                                                    pending && 'ring-2 ring-primary animate-pulse'
                                                )}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground leading-tight truncate">
                                                    {person.name}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground leading-tight">
                                                    {person.role}
                                                </p>
                                            </div>
                                            <div
                                                className={clsx(
                                                    'shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                                                    approved
                                                        ? 'bg-green-500 text-white scale-100'
                                                        : 'bg-muted text-muted-foreground scale-95'
                                                )}
                                            >
                                                {approved ? (
                                                    <Check className="w-4 h-4" strokeWidth={3} />
                                                ) : pending ? (
                                                    <span className="text-[10px] font-bold">...</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold">{i + 1}</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Footer status */}
                            <div className="px-6 py-4 border-t border-border bg-muted/20">
                                {done ? (
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="font-semibold">All internal sign-offs collected.</span>
                                        <span className="text-muted-foreground">
                                            Publishing quote through CORE…
                                        </span>
                                    </div>
                                ) : !davidSigned ? (
                                    <p className="text-xs text-muted-foreground">
                                        Strata is routing the quote to David Park's (Senior
                                        Estimator) workspace for the first sign-off…
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Strata is routing the quote through the internal release
                                        checklist. This normally takes a few seconds.
                                    </p>
                                )}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
