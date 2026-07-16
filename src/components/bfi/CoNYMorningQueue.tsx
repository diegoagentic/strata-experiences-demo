/**
 * COMPONENT: CoNYMorningQueue (a1.1)
 * PURPOSE: Flow 1 · Scene 1 — BFI Agency Fee order queue.
 *
 * FLOW (driven by Action Center):
 *   bfi:ingest event → DOE card appears in Intake kanban column
 *   bfi:review event → BFIDocumentReviewModal opens (extract step)
 *   modal validate   → "Notify designer?" send dialog → nextStep()
 */

import { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import { CheckCircle2, Send, User, X } from 'lucide-react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

interface CoNYMorningQueueProps {
    onSelectOrder?: () => void
}

const NOTIFY_MESSAGE = `Hi Robert — SIF for DOE-2847 has been ingested and validated. Quote Q-2026-0089 is being processed. We'll follow up shortly with confirmation.

— Lauren DeMarco, BFI Furniture`

export default function CoNYMorningQueue({ onSelectOrder }: CoNYMorningQueueProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const [showDoe,    setShowDoe]    = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSendOpen, setIsSendOpen] = useState(false)
    const [sendStep,   setSendStep]   = useState<'compose' | 'sent'>('compose')

    // DOE card appears in kanban when ingest starts
    useEffect(() => {
        const handler = () => setShowDoe(true)
        window.addEventListener('bfi:ingest', handler)
        return () => window.removeEventListener('bfi:ingest', handler)
    }, [])


    const handleModalValidate = () => {
        setIsModalOpen(false)
        onSelectOrder?.()
        setSendStep('compose')
        setIsSendOpen(true)
    }

    const handleSend = () => {
        setSendStep('sent')
        setTimeout(pauseAware(() => {
            setIsSendOpen(false)
            nextStep()
        }), 1200)
    }

    const handleSkip = () => {
        setIsSendOpen(false)
        nextStep()
    }

    return (
        <div className="space-y-4">

            {/* ── Process Kanban — DOE card appears after ingest ── */}
            <BFIProcessKanban
                activeCol={0}
                showDoe={showDoe}
                animateDoe={true}
                onReviewDoe={() => setIsModalOpen(true)}
                highlightReview={showDoe}
            />

            <p className="text-[11px] text-muted-foreground text-center">
                {showDoe
                    ? '4 active orders · DOE-2847 received · ready for review'
                    : '3 active orders · monitoring CoNY pipeline…'
                }
            </p>

            {/* ── Document Review Modal ── */}
            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="extract"
                onValidate={handleModalValidate}
            />

            {/* ── Send designer notification dialog ── */}
            <Transition show={isSendOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[400]" onClose={() => {}}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                        leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
                    >
                        <div className="fixed top-16 left-80 right-0 bottom-0 bg-black/40 backdrop-blur-sm" />
                    </TransitionChild>

                    <div className="fixed top-16 left-80 right-0 bottom-0 flex items-center justify-center p-6">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">

                                {/* Header */}
                                <div className="px-5 py-4 border-b border-border bg-muted/30">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-8 w-8 rounded-xl bg-ai/10 flex items-center justify-center shrink-0">
                                            <Send className="h-4 w-4 text-ai" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-bold text-foreground">Notify designer · DOE-2847</p>
                                            <p className="text-[11px] text-muted-foreground">Strata AI pre-drafted the message</p>
                                        </div>
                                        <button onClick={() => setIsSendOpen(false)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0" aria-label="Close">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Contact */}
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                                        <div className="h-8 w-8 rounded-full bg-info/20 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-black text-info">RC</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-bold text-foreground">Account Manager Bly</p>
                                            <p className="text-[10px] text-muted-foreground">Miller Knoll Rep · robert.chen@millerknoll.com</p>
                                        </div>
                                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <User className="h-3 w-3 text-muted-foreground" />
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Message</p>
                                        </div>
                                        <div className="rounded-xl border border-border bg-background px-3.5 py-3 text-[11px] text-foreground leading-relaxed whitespace-pre-line">
                                            {NOTIFY_MESSAGE}
                                        </div>
                                    </div>

                                    {sendStep === 'sent' && (
                                        <div className="flex items-center gap-2 p-3 bg-success/5 border border-success/20 rounded-xl animate-in fade-in duration-300">
                                            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                            <p className="text-[12px] font-bold text-success">Sent to Account Manager Bly · May 6 · 8:21 AM</p>
                                        </div>
                                    )}
                                </div>

                                {sendStep === 'compose' && (
                                    <div className="px-5 pb-5 flex items-center gap-3">
                                        <button
                                            onClick={handleSkip}
                                            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Skip
                                        </button>
                                        <button
                                            onClick={handleSend}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-black rounded-xl bg-foreground text-background hover:opacity-80 transition-all uppercase tracking-widest"
                                        >
                                            <Send className="h-3.5 w-3.5" />
                                            Send notification →
                                        </button>
                                    </div>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
