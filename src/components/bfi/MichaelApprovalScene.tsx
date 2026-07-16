/**
 * COMPONENT: MichaelApprovalScene (a1.3b)
 * PURPOSE: Manager Boyle (Lauren's manager, BFI) sees the Agency Fee CPR funnel,
 *          receives Lauren's CPR approval notification, reviews the same CPR detail
 *          as step 1.8 (pre-approved), and sends the final quote to Nancy Bos
 *          (Herman Miller invoice processor) requesting the invoice.
 *
 * FLOW:
 *   Notification slides in after 900ms above the CPR kanban
 *   Click notification → BFIDocumentReviewModal (cpr, michaelMode=true)
 *   Lines pre-approved → "Send Final Quote to Nancy →" → NancyDialog → nextStep()
 */

import { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import {
    CheckCircle2, Mail, Send, X,
} from 'lucide-react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import EmailMetadataBlock from './EmailMetadataBlock'
import BFIProcessKanban from './BFIProcessKanban'

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTIF = {
    title: 'CPR approved · Final quote ready · DOE-2847',
    desc: 'Account Manager DeMar completed CPR reconciliation — Carpenters −5h, OT −2h · Total −$2,340 · Pending: send final quote to Herman Miller',
    cta: 'Review & send final quote to Nancy →',
}

const QUOTE_TOTAL  = '$6,920'

const NANCY_MESSAGE =
`Hi Nancy,

Please find the final labor quote for DOE-2847 (NYC Department of Education — CoNY contract).

Following CPR reconciliation, the labor hours have been adjusted and approved:

  · Teamsters:       24h × $75/h  = $1,800
  · Carpenters:      45h × $90/h  = $4,050  (revised from 50h)
  · OT Carpenters:    6h × $135/h = $810    (revised from 8h)
  · Inside Delivery:  4h × $65/h  = $260

  Total labor:  $6,920  (adjusted from $7,640 · saving: −$720)

Please issue the final invoice for $6,920 and send it to ar@bfifurniture.com at your earliest convenience.

Thank you,
Manager Boyle
BFI Furniture · Account Manager`

// ─── Nancy Send Dialog ────────────────────────────────────────────────────────

function NancyDialog({ isOpen, onSent, onClose }: { isOpen: boolean; onSent: () => void; onClose?: () => void }) {
    const [fromEmail, setFromEmail] = useState('michael.boyle@bfifurniture.com')
    const [toEmail,   setToEmail]   = useState('lauren.demarco@bfifurniture.com · Account Manager')
    const [ccEmail,   setCcEmail]   = useState('nancy.bos@hermanmiller.com · walter@conyny.gov')
    const [subject,   setSubject]   = useState('Final Labor Quote · DOE-2847 · Invoice Request')
    const [message,   setMessage]   = useState(NANCY_MESSAGE)
    const [sending,   setSending]   = useState(false)
    const [sent,      setSent]      = useState(false)

    const handleSend = () => {
        setSending(true)
        setTimeout(() => {
            setSending(false)
            setSent(true)
            setTimeout(() => onSent(), 900)
        }, 800)
    }

    const META_FIELDS = [
        { label: 'From', value: fromEmail, onChange: setFromEmail },
        { label: 'To',   value: toEmail,   onChange: setToEmail },
        { label: 'CC',   value: ccEmail,   onChange: setCcEmail, muted: true },
        { label: 'Subj', value: subject,   onChange: setSubject },
    ]

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={() => {}} className="relative z-[400]">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-6">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95 translate-y-2" enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg bg-card rounded-2xl shadow-2xl flex flex-col max-h-[88vh] border border-border overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
                                <div className="h-8 w-8 rounded-full bg-ai/10 flex items-center justify-center shrink-0">
                                    <span className="text-[11px] font-black text-ai">ST</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-foreground">Invoice Request · Herman Miller</p>
                                    <p className="text-[10px] text-muted-foreground">Strata AI pre-drafted · final quote {QUOTE_TOTAL}</p>
                                </div>
                                <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0" aria-label="Close">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                                {/* Email metadata — read-only by default · click Edit to modify */}
                                <EmailMetadataBlock variant="bordered" fields={META_FIELDS} disabled={sent} />

                                {/* Editable message */}
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    rows={14}
                                    disabled={sent}
                                    className="w-full rounded-xl border border-border bg-card px-3 py-3 text-[11px] text-foreground leading-relaxed resize-none focus:outline-none focus:border-primary/50 transition-colors font-mono disabled:opacity-60"
                                />

                                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-4 border-t border-border shrink-0">
                                {sent ? (
                                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success/10 border border-success/20">
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                        <span className="text-[12px] font-bold text-success">Sent to Nancy · Invoice requested</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleSend}
                                        disabled={sending}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ai text-white text-[12px] font-bold hover:opacity-90 transition-all disabled:opacity-60"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                        {sending ? 'Sending…' : 'Send →'}
                                    </button>
                                )}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

// ─── Main scene ───────────────────────────────────────────────────────────────

const ACTIVE_COL = 3

export default function MichaelApprovalScene() {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const [isModalOpen,  setIsModalOpen]  = useState(false)
    const [showNancy,    setShowNancy]    = useState(false)

    useEffect(() => {
        const handler = () => setIsModalOpen(true)
        window.addEventListener('bfi:michael-open', handler)
        return () => window.removeEventListener('bfi:michael-open', handler)
    }, [])

    const handleOpenModal = () => setIsModalOpen(true)

    const handleModalValidate = () => {
        setIsModalOpen(false)
        setShowNancy(true)
    }

    const handleNancySent = () => {
        setShowNancy(false)
        setTimeout(pauseAware(() => nextStep?.()), 600)
    }

    return (
        <div className="space-y-3">
            {/* CPR kanban — same as step 1.8 */}
            <BFIProcessKanban
                activeCol={ACTIVE_COL}
                showDoe={true}
                onReviewDoe={handleOpenModal}
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · reconciling CPR hours…
            </p>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />

            {/* CPR modal — michaelMode: lines pre-approved, button → Nancy */}
            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="cpr"
                onValidate={handleModalValidate}
                michaelMode
            />

            {/* Nancy invoice request dialog */}
            <NancyDialog isOpen={showNancy} onSent={handleNancySent} onClose={() => setShowNancy(false)} />
        </div>
    )
}
