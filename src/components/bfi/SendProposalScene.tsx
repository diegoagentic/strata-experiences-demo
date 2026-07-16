/**
 * COMPONENT: SendProposalScene  (a1.2b3)
 * PURPOSE: After Quote Tool product pricing and WIG labor quote, Lauren has
 *          everything she needs. The scene renders the BFI process kanban
 *          (with DOE-2847 in the PO & Labor column) and auto-opens a Dialog
 *          overlay where Lauren reviews and sends the formal proposal to
 *          NYC Dept. of Education. Patrón: Dialog overlay sobre kanban
 *          (consistente con NancyDialog, WalterNotifyDialog, PatriciaDialog).
 */

import { useState, useEffect, Fragment } from 'react'
import { CheckCircle2, FileText, Send, X } from 'lucide-react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIProcessKanban from './BFIProcessKanban'
import EmailMetadataBlock from './EmailMetadataBlock'

const ACTIVE_COL = 2  // PO & Labor

// ─── Send Proposal Dialog ─────────────────────────────────────────────────────

function SendProposalDialog({ isOpen, onSent, onClose }: { isOpen: boolean; onSent: () => void; onClose?: () => void }) {
    const [sent,      setSent]      = useState(false)
    const [fromEmail, setFromEmail] = useState('lauren.demarco@bfifurniture.com')
    const [toEmail,   setToEmail]   = useState('nycdoe-procurement@schools.nyc.gov')
    const [dateText,  setDateText]  = useState('May 6, 2026 · 10:45 AM')
    const [subject, setSubject] = useState('Quote DOE-2847')
    const [body,    setBody]    = useState(
`Good morning,

Please find attached the quote for DOE-2847.

Please let me know if you have any questions.

— Account Manager DeMar
BFI Furniture · CoNY Account Manager`
    )
    const [attachments, setAttachments] = useState([
        { name: 'DOE-2847-Quote.pdf', label: 'Quote' },
    ])

    const removeAttachment = (name: string) =>
        setAttachments(prev => prev.filter(a => a.name !== name))

    const handleSend = () => {
        setSent(true)
        setTimeout(() => onSent(), 1200)
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[400]" onClose={() => {}}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-6">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg transform rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

                            {/* Header */}
                            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-muted/30 shrink-0">
                                <div className="h-8 w-8 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                                    <span className="text-[9px] font-black text-success">DOE</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[12px] font-bold text-foreground truncate">NYC Dept. of Education</div>
                                    <div className="text-[10px] text-muted-foreground">Procurement Office</div>
                                </div>
                                <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0" aria-label="Close">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Scrollable body */}
                            <div className="flex-1 overflow-y-auto">

                                {/* Metadata · read-only by default · Edit button reveals inputs */}
                                <div className="px-5 pt-4 pb-3 border-b border-border/60">
                                    <EmailMetadataBlock
                                        subject={{ value: subject, onChange: setSubject }}
                                        fields={[
                                            { label: 'From', value: fromEmail, onChange: setFromEmail },
                                            { label: 'To',   value: toEmail,   onChange: setToEmail },
                                            { label: 'Date', value: dateText,  onChange: setDateText },
                                        ]}
                                        disabled={sent}
                                    />
                                </div>

                                {/* Body — single unified textarea */}
                                <div className="px-5 py-4 space-y-3">
                                    <textarea value={body} onChange={e => setBody(e.target.value)} disabled={sent}
                                        rows={8}
                                        className="w-full text-[12px] text-foreground leading-relaxed bg-transparent outline-none border border-transparent hover:border-border/60 focus:border-primary/50 rounded-lg px-2 py-1.5 -mx-2 transition-colors disabled:opacity-60 resize-y" />

                                    {/* Attachment chips — removable */}
                                    <div className="flex flex-col gap-1.5">
                                        {attachments.map(a => (
                                            <div key={a.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border text-[11px] text-foreground font-medium">
                                                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                <span className="flex-1 truncate">{a.name}</span>
                                                <span className="text-[9px] text-muted-foreground">· {a.label}</span>
                                                {!sent && (
                                                    <button onClick={() => removeAttachment(a.name)} className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0" aria-label={`Remove ${a.name}`}>
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Sent confirmation */}
                                    {sent && (
                                        <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                            <div className="text-xs">
                                                <div className="font-bold text-foreground">Proposal sent · NYC DOE · May 6 · 10:45 AM</div>
                                                <div className="text-muted-foreground mt-0.5">Awaiting client review and Purchase Order issuance</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="px-5 pb-4">
                                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
                                </div>
                            </div>

                            {/* Footer CTA */}
                            {!sent && (
                                <div className="px-5 py-3.5 border-t border-border bg-card shrink-0">
                                    <button
                                        onClick={handleSend}
                                        className="w-full flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                        Send Proposal to NYC DOE →
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

// ─── Main Scene ───────────────────────────────────────────────────────────────

export default function SendProposalScene() {
    const { nextStep } = useDemo()
    const [showDialog, setShowDialog] = useState(false)

    // Auto-open the proposal dialog shortly after the kanban renders, so the
    // user lands on a familiar context (kanban with DOE-2847 in PO & Labor)
    // and the email surfaces as an overlay — matching the rest of the demo.
    useEffect(() => {
        const t = setTimeout(() => setShowDialog(true), 500)
        return () => clearTimeout(t)
    }, [])

    const handleSent = () => {
        setShowDialog(false)
        nextStep()
    }

    return (
        <div className="space-y-3">

            {/* ── Process Kanban — PO & Labor active ── */}
            <BFIProcessKanban
                activeCol={ACTIVE_COL}
                showDoe={true}
                doeSubtitle="Proposal ready · product (Quote Tool) + labor (WIG) compiled"
                onReviewDoe={() => setShowDialog(true)}
                reviewLabel="Open Proposal"
                highlightReview={!showDialog}
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · proposal ready to send to NYC DOE…
            </p>

            <SendProposalDialog
                isOpen={showDialog}
                onSent={handleSent}
                onClose={() => setShowDialog(false)}
            />

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
