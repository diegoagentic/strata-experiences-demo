/**
 * EmailDraftModal · reusable AI email-draft send modal.
 *
 * Wraps the email-draft card pattern (To / Subject / Body + Edit / Send) used in
 * ARDepositsPanel's DraftCard, so the detail pages' "Contact Vendor" / "Send to
 * Dealer" suggested actions open a real, context-aware draft instead of a stub.
 * Drafts only · the user reviews and sends · Strata never auto-sends.
 */

import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { Sparkles, Send, Pencil, CheckCircle2, X, Wand2, ArrowLeft } from 'lucide-react'

export interface EmailDraft {
    label: string      // e.g. "Backorder follow-up" / "Quote for approval"
    to: string
    subject: string
    body: string
}

interface EmailDraftModalProps {
    isOpen: boolean
    onClose: () => void
    draft: EmailDraft
    onSent?: () => void
    /** Optional: when present, renders a Back button in the header that returns to the previous modal. */
    onBack?: () => void
}

function polish(body: string, dir: 'friendlier' | 'firmer' | 'shorter'): string {
    if (dir === 'friendlier') return body.replace(/^Hi,/i, 'Hi there,').replace(/Best,/i, 'Warm regards,').replace(/Thanks,/i, 'Thanks so much,')
    if (dir === 'firmer') return body.replace(/^Hi,/i, 'To whom it may concern,').replace(/Best,/i, 'Regards,')
    return body.split('\n').filter(l => l.length < 220).slice(0, 5).join('\n')
}

export default function EmailDraftModal({ isOpen, onClose, draft, onSent, onBack }: EmailDraftModalProps) {
    const [state, setState] = useState<'pending' | 'editing' | 'edited' | 'sent'>('pending')
    const [subject, setSubject] = useState(draft.subject)
    const [body, setBody] = useState(draft.body)

    // Reset when a new draft is opened
    useEffect(() => {
        if (isOpen) { setState('pending'); setSubject(draft.subject); setBody(draft.body) }
    }, [isOpen, draft.subject, draft.body])

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-lg rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                                {/* Header */}
                                <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                                    <Sparkles className="h-3.5 w-3.5 text-ai" aria-hidden="true" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">{draft.label} draft</span>
                                    <div className="ml-auto flex items-center gap-1">
                                        {onBack && (
                                            <button onClick={onBack} aria-label="Back to delay alert" title="Back to delay alert" className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><ArrowLeft className="h-3.5 w-3.5" />Back</button>
                                        )}
                                        <button onClick={onClose} aria-label="Close" className="h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><X className="h-4 w-4" /></button>
                                    </div>
                                </div>

                                {state === 'sent' ? (
                                    <div className="px-5 py-8 flex flex-col items-center text-center gap-2">
                                        <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
                                        <div className="text-sm font-bold text-foreground">Email sent</div>
                                        <div className="text-xs text-muted-foreground">Logged to the Activity Stream · {draft.to.split(' · ')[0]}</div>
                                        <button onClick={onClose} className="mt-3 inline-flex items-center justify-center h-9 px-4 rounded-md text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors">Done</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="px-5 py-3 space-y-2 text-xs">
                                            <div><span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">To: </span><span className="text-foreground">{draft.to}</span></div>
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Subject: </span>
                                                {state === 'editing'
                                                    ? <input value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                                                    : <span className="text-foreground font-medium">{subject}</span>}
                                            </div>
                                            <div className="pt-1 border-t border-border">
                                                {state === 'editing'
                                                    ? <textarea value={body} onChange={e => setBody(e.target.value)} rows={8} className="w-full bg-background border border-border rounded p-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none whitespace-pre-wrap font-sans" />
                                                    : <pre className="whitespace-pre-wrap font-sans text-[11px] text-muted-foreground leading-relaxed">{body}</pre>}
                                            </div>
                                            {state === 'editing' && (
                                                <div className="flex items-center gap-2 pt-2 border-t border-border">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Polish:</span>
                                                    {(['friendlier', 'firmer', 'shorter'] as const).map(dir => (
                                                        <button key={dir} onClick={() => setBody(b => polish(b, dir))} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-ai/10 text-ai border border-ai/20 hover:bg-ai/20 transition-colors">
                                                            <Wand2 className="h-2.5 w-2.5" aria-hidden="true" /> {dir}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between gap-2">
                                            <span className="text-[10px] text-muted-foreground italic">Draft only · you review and send</span>
                                            <div className="flex items-center gap-2">
                                                {state === 'editing' ? (
                                                    <button onClick={() => setState('edited')} className="inline-flex items-center gap-1 h-8 px-3 rounded-md text-[11px] font-bold bg-card border border-border text-foreground hover:bg-muted transition-colors"><CheckCircle2 className="h-3 w-3" /> Save</button>
                                                ) : (
                                                    <button onClick={() => setState('editing')} className="inline-flex items-center gap-1 h-8 px-3 rounded-md text-[11px] font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors"><Pencil className="h-3 w-3" /> Edit</button>
                                                )}
                                                <button onClick={() => { setState('sent'); onSent?.() }} className="inline-flex items-center gap-1.5 h-8 px-4 rounded-md text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"><Send className="h-3 w-3" /> Send</button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
