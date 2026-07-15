import { Fragment, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import {
    X, PauseCircle, DollarSign, Clock, User, FileText,
    Send, MessageSquare, Check, ArrowRight, Calendar, Wrench,
} from 'lucide-react'
import type { ARRecord } from '../../config/profiles/mbi-data'

interface ARHoldReviewModalProps {
    record: ARRecord | null
    onClose: () => void
    onRelease: () => void
    onComment: (text: string) => void
}

export default function ARHoldReviewModal({ record, onClose, onRelease, onComment }: ARHoldReviewModalProps) {
    return (
        <Transition show={record !== null} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[110]">
                {/* Backdrop */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-background/70 backdrop-blur-sm" />
                </TransitionChild>

                {/* Panel */}
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
                        <DialogPanel className="w-full max-w-lg bg-card dark:bg-zinc-900 border border-border rounded-2xl shadow-2xl overflow-hidden">
                            {record && <ModalContent record={record} onClose={onClose} onRelease={onRelease} onComment={onComment} />}
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

function ModalContent({ record, onClose, onRelease, onComment }: {
    record: ARRecord
    onClose: () => void
    onRelease: () => void
    onComment: (text: string) => void
}) {
    const [mode, setMode] = useState<'choose' | 'comment'>('choose')
    const [comment, setComment] = useState('')

    const installDate = record.installationDate
        ? new Date(record.installationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : null

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border bg-muted/40 dark:bg-zinc-800">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                        <PauseCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                        <DialogTitle className="text-sm font-bold text-foreground truncate">
                            Hold Review
                        </DialogTitle>
                        <p className="text-[11px] text-muted-foreground truncate">{record.client}</p>
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

            <div className="p-5 space-y-4">
                {/* Account summary */}
                <div className="bg-background dark:bg-zinc-800/60 border border-border rounded-xl p-4">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Account summary</div>
                    <div className="grid grid-cols-2 gap-3">
                        <SummaryRow icon={<FileText className="h-3.5 w-3.5" />} label="PO Number" value={record.poNumber} mono />
                        <SummaryRow icon={<DollarSign className="h-3.5 w-3.5" />} label="Amount due" value={`$${record.amount.toLocaleString()}`} accent="text-foreground font-bold" />
                        <SummaryRow icon={<Clock className="h-3.5 w-3.5" />} label="Days past due" value={`${record.daysPastDue} days`} accent={record.daysPastDue > 20 ? 'text-red-600 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'} />
                        {record.salesperson && (
                            <SummaryRow icon={<User className="h-3.5 w-3.5" />} label="Salesperson" value={record.salesperson} />
                        )}
                        {record.lastContact && (
                            <SummaryRow icon={<Calendar className="h-3.5 w-3.5" />} label="Last contact" value={record.lastContact} />
                        )}
                    </div>
                </div>

                {/* Hold reason */}
                <div className="bg-amber-50/60 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-amber-200 dark:border-amber-500/20 flex items-center gap-2">
                        {record.holdReason === 'punch-list-open'
                            ? <Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            : <PauseCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        }
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                            Collections hold · {record.holdReason === 'installation-pending' ? 'Installation pending' : 'Punch list open'}
                        </span>
                    </div>
                    <div className="px-4 py-3 space-y-1">
                        {record.holdReason === 'installation-pending' ? (
                            <>
                                <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                    Scheduled installation: {installDate}
                                </div>
                                <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                                    Collections are blocked until the installation is complete and signed off. Strata will auto-release once the project milestone is marked done.
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                    {record.punchListOpen} punch list item{record.punchListOpen !== 1 ? 's' : ''} still open
                                </div>
                                <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                                    All punch list items must be resolved and approved before collections begin. Strata will auto-release once the punch list is fully closed.
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Decision */}
                <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Your decision</div>

                    {mode === 'choose' && (
                        <div className="space-y-2">
                            <button
                                onClick={onRelease}
                                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold bg-success/10 text-success hover:bg-success/15 border border-success/25 transition-colors text-left"
                            >
                                <Send className="h-4 w-4 shrink-0" />
                                <span className="flex-1">Project complete · release to collections</span>
                                <ArrowRight className="h-4 w-4 shrink-0" />
                            </button>
                            <button
                                onClick={() => setMode('comment')}
                                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold bg-card dark:bg-zinc-800 text-foreground hover:bg-muted border border-border transition-colors text-left"
                            >
                                <MessageSquare className="h-4 w-4 shrink-0" />
                                <span>Keep on hold · add a comment</span>
                            </button>
                        </div>
                    )}

                    {mode === 'comment' && (
                        <div className="space-y-2">
                            <textarea
                                autoFocus
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder={record.holdReason === 'installation-pending'
                                    ? `e.g. Installation rescheduled to May 22 — PM confirmed. Revisit then.`
                                    : `e.g. Items 2–4 still blocked by client sign-off. PM following up this week.`
                                }
                                rows={3}
                                className="w-full text-sm rounded-xl border border-border bg-background px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => comment.trim() && onComment(comment.trim())}
                                    disabled={!comment.trim()}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold bg-primary text-zinc-900 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                                >
                                    <Check className="h-4 w-4" />
                                    Log comment
                                </button>
                                <button
                                    onClick={() => { setMode('choose'); setComment('') }}
                                    className="px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground bg-card dark:bg-zinc-800 border border-border transition-colors"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cancel */}
                <button
                    onClick={onClose}
                    className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                    Cancel · keep hold as-is
                </button>
            </div>
        </>
    )
}

function SummaryRow({ icon, label, value, mono, accent }: {
    icon: React.ReactNode
    label: string
    value: string
    mono?: boolean
    accent?: string
}) {
    return (
        <div className="flex items-start gap-2 min-w-0">
            <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
            <div className="min-w-0">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
                <div className={`text-xs mt-0.5 truncate ${mono ? 'font-mono' : ''} ${accent ?? 'text-foreground'}`}>{value}</div>
            </div>
        </div>
    )
}
