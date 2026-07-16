/**
 * SampleRequestWorkflow · interactive multi-phase fabric/finish sample request
 * (W6 · Wendy item 9 — replaces the old linear SampleRequestStub stub).
 *
 * Phases:
 *   select   · pick material swatches (visual grid)
 *   compose  · draft the request email (reuses EmailMetadataBlock)
 *   sending  · send animation
 *   sent     · confirmation → modal closes, Action Center round-trips
 *   response · manufacturer reply thread + a graded-equivalent revision to accept
 *   done     · receipt confirmed · sample linked to the quote
 *
 * Round-trip: on send it dispatches `sample-textile:sent`; the Action Center
 * later surfaces the manufacturer reply whose CTA dispatches
 * `sample-textile:reopen`, reopening this modal at the `response` phase.
 */

import { Fragment, useState, useEffect, useMemo } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, Package, Send, Truck, CheckCircle2, ArrowRight, Link2, RefreshCw, Mail, Paperclip } from 'lucide-react'
import EmailMetadataBlock from '../bfi/EmailMetadataBlock'
import MaterialSwatch from './MaterialSwatch'
import { MATERIAL_SWATCHES, swatchFor } from './textileRef'
import { getSampleFlow, markSampleFlowDone, useSampleFlowVersion } from './sampleFlowSignal'

type Phase = 'select' | 'compose' | 'sending' | 'sent' | 'response' | 'done'

interface SampleRequestWorkflowProps {
    sku: string
    productName?: string
    finish?: string
    linkedTo?: string
}

const PHASE_LABEL: Record<Phase, string> = {
    select: 'Select materials',
    compose: 'Draft request',
    sending: 'Sending',
    sent: 'Sent',
    response: 'Manufacturer response',
    done: 'Confirmed',
}

export default function SampleRequestWorkflow({ sku, productName, finish, linkedTo = 'QT-1025' }: SampleRequestWorkflowProps) {
    // Re-render when the flow store changes + read any persisted completion.
    useSampleFlowVersion()
    const persisted = getSampleFlow(linkedTo, sku)

    const [open, setOpen] = useState(false)
    // If the flow was already confirmed this session, resume at the done state.
    const [phase, setPhase] = useState<Phase>(persisted ? 'done' : 'select')
    const [sentByMe, setSentByMe] = useState(false)
    const [tracking] = useState(persisted?.tracking ?? 'SMP-2026-' + Math.floor(Math.random() * 9000 + 1000))

    // Pre-select the item's own fabric swatch.
    const itemSwatch = swatchFor(finish)
    const initialCode = itemSwatch?.code
    const [selected, setSelected] = useState<string[]>(initialCode ? [initialCode] : [])

    // Compose fields
    const [fromEmail, setFromEmail] = useState('sara.chen@northpointfurniture.com')
    const [toEmail, setToEmail] = useState('orders@strata-manufacturing.com')
    const [subject, setSubject] = useState(`Sample request · ${sku} · ${linkedTo}`)
    const [body, setBody] = useState('')

    // Response phase
    const [resolution, setResolution] = useState<'original' | 'substitute' | null>(
        persisted ? (persisted.substituted ? 'substitute' : 'original') : null,
    )

    const selectedSwatches = useMemo(
        () => MATERIAL_SWATCHES.filter(s => selected.includes(s.code)),
        [selected],
    )

    // Reopen at the response phase when the Action Center reply CTA fires (only for the sender).
    useEffect(() => {
        const onReopen = () => { if (sentByMe) { setPhase('response'); setOpen(true); window.dispatchEvent(new CustomEvent('sample-textile:focus', { detail: { sku } })) } }
        window.addEventListener('sample-textile:reopen', onReopen)
        return () => window.removeEventListener('sample-textile:reopen', onReopen)
    }, [sentByMe])

    const toggle = (code: string) =>
        setSelected(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code])

    const goCompose = () => {
        const lines = selectedSwatches.map(s => `· ${s.code} ${s.name}${s.vendor ? ` (${s.vendor}${s.grade ? `, ${s.grade}` : ''})` : ''}`).join('\n')
        setBody(`Hi,\n\nWe'd like to request physical swatches for ${productName ?? sku} before approving ${linkedTo}:\n${lines}\n\nPlease confirm availability and ship to our showroom.\n\nThanks,\nAccount Manager Kai · Northline Furniture Group`)
        setPhase('compose')
    }

    const send = () => {
        setPhase('sending')
        setTimeout(() => {
            setPhase('sent')
            setSentByMe(true)
            window.dispatchEvent(new CustomEvent('sample-textile:sent', { detail: { sku, tracking } }))
            setTimeout(() => setOpen(false), 1300)
        }, 1100)
    }

    const confirmReceipt = () => {
        setPhase('done')
        markSampleFlowDone(linkedTo, sku, {
            finalMaterial: resolution === 'substitute' ? 'CF-6021 Navy' : 'CF-6036 Ocean Blue',
            substituted: resolution === 'substitute',
            tracking,
        })
        window.dispatchEvent(new CustomEvent('sample-textile:confirmed', { detail: { sku } }))
    }

    const reset = () => {
        setOpen(false)
        setPhase('select')
        setResolution(null)
        setSentByMe(false)
        setSelected(initialCode ? [initialCode] : [])
    }

    const phaseOrder: Phase[] = ['select', 'compose', 'sent', 'response', 'done']
    const activeIdx = phase === 'sending' ? 1 : phaseOrder.indexOf(phase)

    return (
        <>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(true); window.dispatchEvent(new CustomEvent('sample-textile:focus', { detail: { sku } })) }}
                aria-label={persisted ? 'Sample confirmed · view workflow' : 'Request finish/fabric sample'}
                title={persisted ? 'Sample confirmed · view workflow' : 'Request finish/fabric sample'}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary ${persisted ? 'border-success/20 bg-success/10 text-success hover:bg-success/20' : 'border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary'}`}
            >
                {persisted ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Package className="h-3.5 w-3.5" aria-hidden="true" />}
                {persisted ? 'Sample confirmed' : 'Request sample'}
            </button>

            <Transition appear show={open} as={Fragment}>
                <Dialog as="div" className="relative z-[200]" onClose={() => setOpen(false)}>
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 z-[190] bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-[200] overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="w-full max-w-3xl rounded-xl border border-border bg-card shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
                                    {/* Header */}
                                    <div className="px-5 py-4 border-b border-border flex items-start gap-3 shrink-0">
                                        <div className="h-9 w-9 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
                                            <Package className="h-4 w-4 text-info" aria-hidden="true" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 flex-wrap">
                                                Sample request workflow
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-info/10 text-info border border-info/20">
                                                    <Link2 className="h-2.5 w-2.5" aria-hidden="true" /> Linked to {linkedTo}
                                                </span>
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                {itemSwatch && <MaterialSwatch swatch={itemSwatch} size="md" />}
                                                <span className="text-[11px] text-muted-foreground">
                                                    Requesting sample for <span className="font-semibold text-foreground">{sku}</span>{productName ? ` · ${productName}` : ''} · tracking {tracking}
                                                </span>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => setOpen(false)} aria-label="Close workflow" className="shrink-0 h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                            <X className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    </div>

                                    {/* Phase progress */}
                                    <div className="px-5 py-2.5 border-b border-border bg-muted/20 flex flex-wrap items-center gap-1.5 shrink-0">
                                        {phaseOrder.map((p, i) => (
                                            <Fragment key={p}>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded whitespace-nowrap ${i < activeIdx ? 'bg-success/10 text-success' : i === activeIdx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                    {PHASE_LABEL[p]}
                                                </span>
                                                {i < phaseOrder.length - 1 && <span className={`h-px w-3 ${i < activeIdx ? 'bg-success/40' : 'bg-border'}`} />}
                                            </Fragment>
                                        ))}
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
                                        {/* ── SELECT ─────────────────────────────────── */}
                                        {phase === 'select' && (
                                            <>
                                                <p className="text-[11px] text-muted-foreground">Pick the fabric / finish swatches to request for client review.</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {MATERIAL_SWATCHES.map(s => {
                                                        const on = selected.includes(s.code)
                                                        return (
                                                            <button key={s.code} type="button" onClick={() => toggle(s.code)} aria-pressed={on}
                                                                aria-label={`${on ? 'Deselect' : 'Select'} ${s.code} ${s.name}${s.vendor ? `, ${s.vendor}` : ''}`}
                                                                className={`flex items-center gap-2 rounded-lg border-2 p-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card ${on ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted/40'}`}>
                                                                <span className="h-7 w-7 rounded ring-1 ring-border shrink-0" style={{ backgroundColor: s.hex }} aria-hidden="true" />
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="text-xs font-semibold text-foreground truncate">{s.name}</div>
                                                                    <div className="text-[10px] text-muted-foreground truncate">
                                                                        <span className="font-mono">{s.code}</span>{s.vendor ? ` · ${s.vendor}` : ''}{s.grade ? ` · ${s.grade}` : ''}
                                                                    </div>
                                                                </div>
                                                                {on && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </>
                                        )}

                                        {/* ── COMPOSE ────────────────────────────────── */}
                                        {phase === 'compose' && (
                                            <>
                                                <EmailMetadataBlock
                                                    subject={{ value: subject, onChange: setSubject }}
                                                    fields={[
                                                        { label: 'From', value: fromEmail, onChange: setFromEmail },
                                                        { label: 'To', value: toEmail, onChange: setToEmail },
                                                    ]}
                                                    variant="stacked"
                                                />
                                                <textarea
                                                    value={body}
                                                    onChange={(e) => setBody(e.target.value)}
                                                    rows={8}
                                                    className="w-full rounded-lg border border-border bg-background p-3 text-[12px] text-foreground leading-relaxed outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                                                />
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/40 border border-border text-[10px] text-muted-foreground">
                                                        <Paperclip className="h-3 w-3" /> {sku}-spec-sheet.pdf
                                                    </span>
                                                    {selectedSwatches.map(s => <MaterialSwatch key={s.code} swatch={s} size="sm" showLabel />)}
                                                </div>
                                            </>
                                        )}

                                        {/* ── SENDING / SENT ─────────────────────────── */}
                                        {(phase === 'sending' || phase === 'sent') && (
                                            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                                                {phase === 'sending' ? (
                                                    <>
                                                        <Send className="h-8 w-8 text-info animate-pulse" aria-hidden="true" />
                                                        <p className="text-sm font-medium text-foreground">Sending request to manufacturer…</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
                                                        <p className="text-sm font-semibold text-foreground">Request sent · awaiting manufacturer reply</p>
                                                        <p className="text-[11px] text-muted-foreground">Strata will notify you when they respond.</p>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {/* ── RESPONSE ───────────────────────────────── */}
                                        {phase === 'response' && (
                                            <>
                                                <div className="space-y-2">
                                                    {[
                                                        { who: 'Order Entry · Manufacturer', icon: Mail, text: 'Swatch request approved. Catalog match confirmed and ship-to verified.' },
                                                        { who: 'Logistics', icon: Truck, text: `Sample kit shipped via FedEx · tracking ${tracking} · est. 3 business days.` },
                                                    ].map((m, i) => {
                                                        const Icon = m.icon
                                                        return (
                                                            <div key={i} className="rounded-lg border border-border bg-muted/20 px-3 py-2 flex items-start gap-2">
                                                                <Icon className="h-3.5 w-3.5 text-foreground shrink-0 mt-0.5" aria-hidden="true" />
                                                                <div className="min-w-0">
                                                                    <div className="text-[11px] font-semibold text-foreground">{m.who}</div>
                                                                    <div className="text-[11px] text-muted-foreground">{m.text}</div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                {/* Graded-equivalent revision to resolve */}
                                                <div className={`rounded-lg border px-3 py-3 ${resolution ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <RefreshCw className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
                                                        <span className="text-[11px] font-bold text-foreground">Revision · graded-equivalent proposed</span>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground mb-2">
                                                        CF-6036 Ocean Blue is on backorder. Manufacturer proposes <strong className="text-foreground">CF-6021 Navy</strong> — same tier B · same price · 0-day lead time.
                                                    </p>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {(() => { const a = swatchFor('CF-6036'); const b = swatchFor('CF-6021'); return (
                                                            <>
                                                                {a && <MaterialSwatch swatch={a} size="md" showLabel />}
                                                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                                                                {b && <MaterialSwatch swatch={b} size="md" showLabel />}
                                                            </>
                                                        ) })()}
                                                    </div>
                                                    {resolution ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success bg-success/10 border border-success/20 px-2 py-1 rounded">
                                                            <CheckCircle2 className="h-3 w-3" /> {resolution === 'substitute' ? 'Substitution accepted · CF-6021' : 'Keeping CF-6036 · backorder noted'}
                                                        </span>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <button type="button" onClick={() => setResolution('substitute')} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors">
                                                                Accept substitution
                                                            </button>
                                                            <button type="button" onClick={() => setResolution('original')} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-card text-foreground border border-border hover:bg-muted transition-colors">
                                                                Keep original
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {/* ── DONE ───────────────────────────────────── */}
                                        {phase === 'done' && (
                                            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                                                <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
                                                <p className="text-sm font-semibold text-foreground">Receipt confirmed · sample linked to {linkedTo}</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Final material: <strong className="text-foreground">{resolution === 'substitute' ? 'CF-6021 Navy' : 'CF-6036 Ocean Blue'}</strong> · full audit logged to the opportunity activity feed.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="px-5 py-3 border-t border-border bg-card flex items-center justify-between gap-2 shrink-0">
                                        <button type="button" onClick={reset} className="inline-flex items-center justify-center h-9 px-4 rounded-md text-[12px] font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors">
                                            Reset
                                        </button>
                                        {phase === 'select' && (
                                            <button type="button" onClick={goCompose} disabled={selected.length === 0} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-[12px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                                {selected.length === 0 ? 'Select a swatch' : `Draft request · ${selected.length} swatch${selected.length > 1 ? 'es' : ''}`} <ArrowRight className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        {phase === 'compose' && (
                                            <button type="button" onClick={send} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-[12px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                                                <Send className="h-3.5 w-3.5" /> Send request
                                            </button>
                                        )}
                                        {phase === 'response' && (
                                            <button type="button" onClick={confirmReceipt} disabled={!resolution} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-[12px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                                Confirm receipt <CheckCircle2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        {phase === 'done' && (
                                            <button type="button" onClick={() => setOpen(false)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-[12px] font-bold bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Close
                                            </button>
                                        )}
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}
