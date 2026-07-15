// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Request Clarification Modal
// v7 · w2.2 Dealer (Sara) asks the expert (David) for context on a line item
//
// Opens from ProposalActionBar's "Request Clarification" secondary CTA.
// Keeps the experience inside Strata — the dealer picks a topic, writes the
// question, and sends it straight back to the expert. The Shell stamps an
// audit-trail event when the request is sent so w2.2 stays coherent with the
// rest of the demo.
// ═══════════════════════════════════════════════════════════════════════════════

import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    Transition,
    TransitionChild,
} from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import {
    Check,
    CheckCircle2,
    ChevronDown,
    MessageSquare,
    Send,
    X,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useDemo } from '../../context/DemoContext'

interface RequestClarificationModalProps {
    isOpen: boolean
    onClose: () => void
    onSent: (topic: string, message: string) => void
    /**
     * If set, the modal waits this many ms on the compose phase and then
     * auto-fires the send. Used by w2.1 where Sara's clarification is
     * part of the scripted demo timeline.
     */
    autoSendAfter?: number
    /** Preselects a topic by id on open. */
    initialTopicId?: string
    /** Sender name shown in the "sent" state copy (default: "David Park"). */
    senderName?: string
}

interface ClarificationTopic {
    id: string
    label: string
    summary: string
    template: string
}

const TOPICS: ClarificationTopic[] = [
    {
        id: 'ofs-serpentine',
        label: 'OFS Serpentine assembly hours',
        summary: '12-seat lounge · 14 h install · designer verified',
        template:
            "Hi David — before I release the proposal, can you walk me through the 14 h install estimate on the OFS Serpentine? I want to make sure the assembly alignment time is defensible if JPS asks. Thanks!",
    },
    {
        id: 'millerknoll-count',
        label: 'MillerKnoll Canvas unit count',
        summary: '38 seats · open plan + private offices · $178K net',
        template:
            "Hey David — quick check on the Canvas workstation count. We're at 38 seats on the BoM but the floor plan I have shows 40. Is that a scope adjustment or a CORE mismatch?",
    },
    {
        id: 'freight-allocation',
        label: 'Freight allocation ($6.2K)',
        summary: 'MillerKnoll + OFS + consolidated LTL',
        template:
            "David — I'd like to double-check the $6,234 freight line. Is the OFS Serpentine coming on its own LTL or consolidated? JPS usually wants that broken out.",
    },
    {
        id: 'labor-rate',
        label: 'Labor rate assumptions',
        summary: '$95/h crew · $160/h PM · JPS MSA rates',
        template:
            "Hi David — can you confirm the $95/h crew rate is the updated JPS MSA number? I want to avoid any end-of-year surprise when finance reconciles the labor line.",
    },
    {
        id: 'custom',
        label: 'Other…',
        summary: 'Write your own question',
        template: '',
    },
]

type Phase = 'compose' | 'sending' | 'sent'

export default function RequestClarificationModal({
    isOpen,
    onClose,
    onSent,
    autoSendAfter,
    initialTopicId,
    senderName,
}: RequestClarificationModalProps) {
    const [selectedTopicId, setSelectedTopicId] = useState<string>(
        initialTopicId ?? TOPICS[0].id
    )
    const [message, setMessage] = useState<string>(TOPICS[0].template)
    const [phase, setPhase] = useState<Phase>('compose')

    const selectedTopic = TOPICS.find((t) => t.id === selectedTopicId) ?? TOPICS[0]

    // Reset + hydrate template when the modal opens / topic changes
    useEffect(() => {
        if (!isOpen) {
            setPhase('compose')
            setSelectedTopicId(initialTopicId ?? TOPICS[0].id)
            setMessage(
                (TOPICS.find((t) => t.id === initialTopicId) ?? TOPICS[0]).template
            )
            return
        }
    }, [isOpen, initialTopicId])

    // Auto-send driver (used by w2.1 Sara scripted flow)
    useEffect(() => {
        if (!isOpen || phase !== 'compose' || !autoSendAfter) return
        const timer = setTimeout(() => setPhase('sending'), autoSendAfter)
        return () => clearTimeout(timer)
    }, [isOpen, phase, autoSendAfter])

    useEffect(() => {
        if (phase !== 'compose') return
        setMessage(selectedTopic.template)
    }, [selectedTopicId, phase, selectedTopic.template])

    // Sending → sent → auto-close
    useEffect(() => {
        if (phase !== 'sending') return
        const t1 = setTimeout(() => setPhase('sent'), 1100)
        return () => clearTimeout(t1)
    }, [phase])

    useEffect(() => {
        if (phase !== 'sent') return
        // Shorter hold when auto-sending (scripted flow) so the inline
        // reply card takes over quickly instead of lingering on the
        // success screen.
        const holdMs = autoSendAfter ? 600 : 1400
        const t2 = setTimeout(() => {
            onSent(selectedTopic.label, message.trim())
            onClose()
        }, holdMs)
        return () => clearTimeout(t2)
    }, [phase, onSent, selectedTopic.label, message, onClose, autoSendAfter])

    const canSend = phase === 'compose' && message.trim().length > 0
    const { isDemoActive, isSidebarCollapsed } = useDemo()
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed
    const offsetClass = sidebarExpanded ? 'lg:left-80' : ''

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-[100]"
                onClose={phase === 'compose' ? onClose : () => {}}
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
                        <DialogPanel className="w-full max-w-xl bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="flex items-start gap-4 px-6 py-5 border-b border-border">
                                <div className="p-3 rounded-xl bg-primary/10 text-foreground dark:text-primary shrink-0">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-base font-bold text-foreground">
                                        Request Clarification
                                    </DialogTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Ask David Park (Regional Sales Manager) to walk you through a line item before release.
                                    </p>
                                </div>
                                {phase === 'compose' && (
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Body */}
                            {phase === 'compose' && (
                                <div className="p-6 space-y-4">
                                    {/* Recipient card (fixed to David for the demo) */}
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border">
                                        <img
                                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
                                            alt="David Park"
                                            className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/40"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-foreground leading-tight">
                                                David Park
                                            </p>
                                            <p className="text-[10px] text-muted-foreground leading-tight">
                                                Regional Sales Manager · author of this proposal
                                            </p>
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Recipient
                                        </span>
                                    </div>

                                    {/* Topic picker */}
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                            Topic
                                        </label>
                                        <Listbox
                                            value={selectedTopicId}
                                            onChange={setSelectedTopicId}
                                        >
                                            <div className="relative mt-1.5">
                                                <ListboxButton className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-card dark:bg-zinc-900 border border-border hover:border-primary/60 transition-colors text-left focus:outline-none focus:ring-1 focus:ring-primary">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-foreground leading-tight truncate">
                                                            {selectedTopic.label}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground leading-tight truncate">
                                                            {selectedTopic.summary}
                                                        </p>
                                                    </div>
                                                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden />
                                                </ListboxButton>
                                                <Transition
                                                    as={Fragment}
                                                    enter="transition ease-out duration-150"
                                                    enterFrom="opacity-0 -translate-y-1"
                                                    enterTo="opacity-100 translate-y-0"
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <ListboxOptions className="absolute top-full left-0 right-0 mt-2 z-20 overflow-hidden rounded-xl bg-card dark:bg-zinc-800 border border-border shadow-xl py-1 focus:outline-none max-h-60 overflow-y-auto">
                                                        {TOPICS.map((topic) => (
                                                            <ListboxOption
                                                                key={topic.id}
                                                                value={topic.id}
                                                                className={({ focus }) =>
                                                                    clsx(
                                                                        'relative cursor-pointer select-none px-3 py-2 transition-colors flex items-center gap-2',
                                                                        focus && 'bg-zinc-100 dark:bg-zinc-900'
                                                                    )
                                                                }
                                                            >
                                                                {({ selected }) => (
                                                                    <>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-semibold text-foreground leading-tight truncate">
                                                                                {topic.label}
                                                                            </p>
                                                                            <p className="text-[10px] text-muted-foreground leading-tight truncate">
                                                                                {topic.summary}
                                                                            </p>
                                                                        </div>
                                                                        {selected && (
                                                                            <Check className="w-3.5 h-3.5 text-foreground dark:text-primary shrink-0" aria-hidden />
                                                                        )}
                                                                    </>
                                                                )}
                                                            </ListboxOption>
                                                        ))}
                                                    </ListboxOptions>
                                                </Transition>
                                            </div>
                                        </Listbox>
                                    </div>

                                    {/* Message textarea */}
                                    <div>
                                        <label
                                            htmlFor="clarification-message"
                                            className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
                                        >
                                            Message
                                        </label>
                                        <textarea
                                            id="clarification-message"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={5}
                                            className="mt-1.5 w-full resize-none rounded-lg bg-card dark:bg-zinc-900 border border-border px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="Write the question you need David to answer…"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1.5">
                                            Strata stamps this request into the audit trail and
                                            routes it to David's queue.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Sending state */}
                            {phase === 'sending' && (
                                <div className="px-6 py-10 flex flex-col items-center justify-center gap-3">
                                    <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <p className="text-xs font-semibold text-foreground">
                                        Routing question to David Park…
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Logging request into the audit trail
                                    </p>
                                </div>
                            )}

                            {/* Sent state */}
                            {phase === 'sent' && (
                                <div className="px-6 py-10 flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="w-14 h-14 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
                                        <CheckCircle2
                                            className="w-7 h-7 text-green-600 dark:text-green-400"
                                            strokeWidth={2.5}
                                        />
                                    </div>
                                    <p className="text-sm font-bold text-foreground">
                                        Request sent
                                    </p>
                                    <p className="text-[11px] text-muted-foreground text-center max-w-xs">
                                        David will see this in his Strata queue.{' '}
                                        {senderName
                                            ? `${senderName} can continue once he replies.`
                                            : 'You can release the proposal once he replies.'}
                                    </p>
                                </div>
                            )}

                            {/* Footer */}
                            {phase === 'compose' && (
                                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPhase('sending')}
                                        disabled={!canSend}
                                        className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-3 h-3" />
                                        Send to David
                                    </button>
                                </div>
                            )}
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
