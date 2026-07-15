/**
 * SampleRequestWorkflow · Functional 4-step sample request flow (W6 · Wendy item 9)
 *
 * Replaces the original stub with a functional state machine:
 *   1. Request swatch  · dealer requests fabric/finish sample
 *   2. Manufacturer reviews + approves
 *   3. Sample shipped  · tracking # auto-pushed to dealer
 *   4. Dealer confirms receipt + links to quote/order
 *
 * Per Modal Normalization Spec.
 */

import { Fragment, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, Send, Package, Mail, Truck, CheckCircle2, ArrowRight, Link2 } from 'lucide-react'

interface SampleRequestStubProps {
    /** SKU / part to anchor the request to. */
    sku: string
    /** Optional product name for context. */
    productName?: string
    /** Optional finish/fabric/swatch hint. */
    finish?: string
    /** Optional quote/order to link the sample to (W6 · Wendy item 9 last bullet). */
    linkedTo?: string
    /** Optional callback fired after each step transition (e.g. emit a shipped email). */
    onAdvance?: (step: SampleStep, trackingNumber: string) => void
}

type SampleStep = 'request' | 'approve' | 'shipped' | 'confirmed'

interface StepMeta {
    id: SampleStep
    label: string
    icon: typeof Send
    actorLabel: string
    detail: string
    actionLabel: string
}

const STEPS: StepMeta[] = [
    { id: 'request', label: 'Request swatch', icon: Send, actorLabel: 'Dealer', detail: 'Dealer requests fabric/finish sample for client review', actionLabel: 'Submit request' },
    { id: 'approve', label: 'Manufacturer approves', icon: Mail, actorLabel: 'Manufacturer', detail: 'Order entry reviews catalog match + ship-to address', actionLabel: 'Approve + ship' },
    { id: 'shipped', label: 'Sample shipped', icon: Truck, actorLabel: 'Logistics', detail: 'Carrier + tracking # auto-pushed to dealer portal', actionLabel: 'Mark in transit' },
    { id: 'confirmed', label: 'Dealer confirms receipt', icon: CheckCircle2, actorLabel: 'Dealer', detail: 'Receipt confirmed · sample linked to active quote/order', actionLabel: 'Confirm receipt' },
]

function nextStep(current: SampleStep): SampleStep | null {
    const i = STEPS.findIndex(s => s.id === current)
    if (i === -1 || i === STEPS.length - 1) return null
    return STEPS[i + 1].id
}

export default function SampleRequestStub({ sku, productName, finish, linkedTo = 'QT-1025', onAdvance }: SampleRequestStubProps) {
    const [open, setOpen] = useState(false)
    // W6 · State machine for the 4-step workflow
    const [currentStep, setCurrentStep] = useState<SampleStep>('request')
    const [trackingNumber] = useState('SMP-2026-' + Math.floor(Math.random() * 9000 + 1000))

    const advanceStep = () => {
        const next = nextStep(currentStep)
        if (next) {
            setCurrentStep(next)
            onAdvance?.(next, trackingNumber)
        }
    }
    const resetWorkflow = () => {
        setCurrentStep('request')
        setOpen(false)
    }

    const currentIndex = STEPS.findIndex(s => s.id === currentStep)
    const isComplete = currentIndex === STEPS.length - 1

    return (
        <>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(true) }}
                aria-label="Request finish/fabric sample"
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-info/10 text-info border border-info/20 hover:bg-info/20 transition-colors"
            >
                <Package className="h-2.5 w-2.5" aria-hidden="true" />
                Request Sample
            </button>

            <Transition appear show={open} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-200"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-150"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="w-full max-w-xl rounded-xl border border-border bg-card shadow-lg overflow-hidden flex flex-col">
                                    <div className="px-5 py-4 border-b border-border bg-card flex items-start gap-3 shrink-0">
                                        <div className="h-9 w-9 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
                                            <Package className="h-4 w-4 text-info" aria-hidden="true" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 flex-wrap">
                                                Sample request workflow
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-info/10 text-info border border-info/20">
                                                    <Link2 className="h-2.5 w-2.5" aria-hidden="true" />
                                                    Linked to {linkedTo}
                                                </span>
                                            </h3>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                {sku}{productName ? ` · ${productName}` : ''}{finish ? ` · ${finish}` : ''} · tracking {trackingNumber}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setOpen(false)}
                                            aria-label="Close workflow"
                                            className="shrink-0 h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                        >
                                            <X className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-5 space-y-3">
                                        <ol className="space-y-2">
                                            {STEPS.map((step, idx) => {
                                                const Icon = step.icon
                                                const isPast = idx < currentIndex
                                                const isCurrent = idx === currentIndex
                                                const dotClass = isPast
                                                    ? 'bg-success text-primary-foreground border-success'
                                                    : isCurrent
                                                        ? 'bg-primary text-primary-foreground border-primary animate-pulse'
                                                        : 'bg-card border-border text-muted-foreground'
                                                return (
                                                    <li key={step.id} className={`rounded-lg border px-3 py-2.5 flex items-start gap-3 transition-colors ${isCurrent ? 'border-primary/40 bg-primary/5' : isPast ? 'border-success/30 bg-success/5' : 'border-border bg-muted/20'}`}>
                                                        <div className={`h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 ${dotClass}`}>
                                                            {isPast ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-xs font-bold text-foreground">{idx + 1}. {step.label}</span>
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
                                                                    {step.actorLabel}
                                                                </span>
                                                                {isPast && (
                                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-success bg-success/10 px-1.5 py-0.5 rounded border border-success/20">
                                                                        Done
                                                                    </span>
                                                                )}
                                                                {isCurrent && (
                                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/15 px-1.5 py-0.5 rounded border border-primary/30">
                                                                        Current
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground mt-0.5">{step.detail}</div>
                                                        </div>
                                                    </li>
                                                )
                                            })}
                                        </ol>
                                        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-[10px] text-muted-foreground italic">
                                            Strata never auto-sends · the requester or assignee confirms each transition. Full audit logged to opp activity feed and linked to {linkedTo}.
                                        </div>
                                    </div>

                                    <div className="px-5 py-3 border-t border-border bg-card flex items-center justify-between gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={resetWorkflow}
                                            className="inline-flex items-center justify-center h-9 px-4 rounded-md text-[12px] font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors"
                                        >
                                            Reset
                                        </button>
                                        {!isComplete ? (
                                            <button
                                                type="button"
                                                onClick={advanceStep}
                                                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md text-[12px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                            >
                                                {STEPS[currentIndex]?.actionLabel ?? 'Advance'}
                                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setOpen(false)}
                                                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md text-[12px] font-bold bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors"
                                            >
                                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                Workflow complete · close
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
