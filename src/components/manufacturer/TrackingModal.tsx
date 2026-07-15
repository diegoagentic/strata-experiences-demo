/**
 * TrackingModal · Order/shipment tracking with timeline (Asly N1, Wendy #1)
 *
 * Lifted from UI-Manufacturer with full Strata DS token-remap:
 * blue → info · green → success · amber → warning · indigo/purple → ai
 * bg-blue-600 + text-white → bg-primary + text-primary-foreground (LAW 3)
 * zinc → muted / muted-foreground · dark pair classes stripped.
 *
 * Modal normalization per docs/inbound-outbound-platform-features.md:
 * Headless UI Dialog (catalyst/dialog.tsx not yet in local DS).
 * Header: title 16/600 + close X + optional confidence badge.
 * Body: rounded-xl sections with bg-card border-border.
 * Footer: gone (status modal, no commit action).
 */

import { Fragment, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react'
import {
    X,
    CheckCircle2,
    Truck,
    Wrench,
    MapPin,
    Camera,
    FileText,
    User,
    Clock,
    Sparkles,
    MessageSquare,
    Phone,
    ArrowLeft,
} from 'lucide-react'

export interface TrackingStep {
    id: string
    title: string
    description?: string
    status: 'completed' | 'current' | 'upcoming'
    timestamp?: string
    location?: string
    actor?: string
    evidence?: Array<{
        type: 'photo' | 'signature' | 'note'
        url?: string
        content?: string
        label: string
    }>
}

interface TrackingModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    trackingId?: string
    type: 'movement' | 'maintenance'
    steps: TrackingStep[]
    /** Optional carrier name to surface in header (Asly N1). */
    carrier?: string
    /** Optional ETA to surface in header (Asly N1). */
    eta?: string
    /** Optional customer-experience contact line (e.g. "hello@lelandfurniture.com · 616-975-9260"). */
    contact?: string
    /** Optional note (e.g. dedicated-truck driver-phone disclaimer). */
    note?: string
    /** Optional: when present, renders a Back button in the header that returns to the previous modal. */
    onBack?: () => void
}

function stepBorderClass(status: TrackingStep['status']): string {
    if (status === 'completed') return 'border-success text-success'
    if (status === 'current') return 'border-info text-info animate-pulse'
    return 'border-border text-muted-foreground'
}

function stepTitleClass(status: TrackingStep['status']): string {
    if (status === 'completed') return 'text-foreground'
    if (status === 'current') return 'text-info'
    return 'text-muted-foreground'
}

function evidenceIcon(type: 'photo' | 'signature' | 'note'): JSX.Element {
    if (type === 'photo') return <Camera className="w-4 h-4 text-ai" aria-hidden="true" />
    if (type === 'signature') return <FileText className="w-4 h-4 text-info" aria-hidden="true" />
    return <FileText className="w-4 h-4 text-warning" aria-hidden="true" />
}

export default function TrackingModal({
    isOpen,
    onClose,
    title,
    trackingId,
    type,
    steps,
    carrier,
    eta,
    contact,
    note,
    onBack,
}: TrackingModalProps) {
    const [activeCommentStep, setActiveCommentStep] = useState<string | null>(null)
    const TypeIcon = type === 'movement' ? Truck : Wrench
    const typeIconTone = type === 'movement' ? 'text-info' : 'text-warning'

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
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
                            <DialogPanel className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-lg overflow-hidden flex flex-col max-h-[85vh]">
                                {/* Header */}
                                <div className="px-5 py-4 border-b border-border bg-card flex items-start gap-3 shrink-0">
                                    <div className="h-9 w-9 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                                        <TypeIcon className={`h-4 w-4 ${typeIconTone}`} aria-hidden="true" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <DialogTitle as="h3" className="text-sm font-bold text-foreground">
                                            Tracking Progress
                                        </DialogTitle>
                                        <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-foreground">{title}</span>
                                            {trackingId && (
                                                <>
                                                    <span>·</span>
                                                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{trackingId}</span>
                                                </>
                                            )}
                                            {carrier && (
                                                <>
                                                    <span>·</span>
                                                    <span className="text-muted-foreground">{carrier}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {onBack && (
                                        <button
                                            type="button"
                                            onClick={onBack}
                                            aria-label="Back to delay alert"
                                            title="Back to delay alert"
                                            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                        >
                                            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                                            Back
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors"
                                    >
                                        <Phone className="h-3 w-3" aria-hidden="true" />
                                        Contact Team
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        aria-label="Close tracking"
                                        className="shrink-0 h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                    {/* AI Smart Forecast */}
                                    <div className="rounded-xl border border-ai/30 bg-ai/5 overflow-hidden">
                                        <div className="px-4 py-3 flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-ai/10 flex items-center justify-center shrink-0">
                                                <Sparkles className="h-4 w-4 text-ai" aria-hidden="true" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-ai mb-1">
                                                    Strata AI · Smart Forecast
                                                </div>
                                                <p className="text-xs text-foreground">
                                                    Based on current traffic and workflow velocity, the team is expected to arrive{' '}
                                                    <span className="font-bold">15 minutes early</span>.
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 flex-wrap">
                                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-success">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                                                        98% Probability
                                                    </span>
                                                    {eta && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ai">
                                                            <Clock className="h-3 w-3" aria-hidden="true" />
                                                            ETA: {eta}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="relative pl-4 sm:pl-8 py-2">
                                        <div className="absolute left-[27px] sm:left-[43px] top-6 bottom-6 w-0.5 bg-border" aria-hidden="true" />

                                        <div className="space-y-8 relative">
                                            {steps.map((step) => (
                                                <div key={step.id} className="relative flex items-start group">
                                                    <div className={`absolute left-0 sm:left-4 -ml-px h-8 w-8 rounded-full flex items-center justify-center border-2 z-10 bg-card ${stepBorderClass(step.status)}`}>
                                                        {step.status === 'completed' ? (
                                                            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                                                        ) : step.status === 'current' ? (
                                                            <div className="w-2.5 h-2.5 rounded-full bg-info" />
                                                        ) : (
                                                            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
                                                        )}
                                                    </div>

                                                    <div className="ml-12 sm:ml-20 flex-1">
                                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                                            <div>
                                                                <h4 className={`text-sm font-bold ${stepTitleClass(step.status)}`}>
                                                                    {step.title}
                                                                </h4>
                                                                {step.description && (
                                                                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                                                                )}
                                                            </div>
                                                            {step.timestamp && (
                                                                <div className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground whitespace-nowrap bg-muted/50 px-2 py-1 rounded border border-border">
                                                                    <Clock className="w-3 h-3" aria-hidden="true" />
                                                                    {step.timestamp}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {(step.location || step.actor) && (
                                                            <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-muted-foreground">
                                                                {step.actor && (
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <User className="w-3 h-3" aria-hidden="true" />
                                                                        {step.actor}
                                                                    </span>
                                                                )}
                                                                {step.location && (
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <MapPin className="w-3 h-3" aria-hidden="true" />
                                                                        {step.location}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {step.evidence && step.evidence.length > 0 && (
                                                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {step.evidence.map((ev, idx) => (
                                                                    <div key={idx} className="bg-muted/40 rounded-lg p-2.5 border border-border flex items-start gap-2">
                                                                        <div className="shrink-0 mt-0.5">{evidenceIcon(ev.type)}</div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-[11px] font-medium text-foreground mb-1">{ev.label}</p>
                                                                            {ev.type === 'photo' && ev.url ? (
                                                                                <div className="relative aspect-video rounded overflow-hidden bg-muted mt-1">
                                                                                    <img
                                                                                        src={ev.url}
                                                                                        alt={ev.label}
                                                                                        className="object-cover w-full h-full hover:scale-105 transition-transform cursor-pointer"
                                                                                    />
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-[11px] text-muted-foreground italic line-clamp-2">"{ev.content}"</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {step.status === 'current' && (
                                                            <div className="mt-3">
                                                                {activeCommentStep === step.id ? (
                                                                    <div className="bg-card p-3 rounded-lg border border-border shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                                                        <textarea
                                                                            className="w-full text-xs bg-transparent border-none focus:ring-0 p-0 placeholder:text-muted-foreground text-foreground resize-none"
                                                                            placeholder="Add a comment or note..."
                                                                            rows={2}
                                                                            autoFocus
                                                                        />
                                                                        <div className="flex justify-end gap-2 mt-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setActiveCommentStep(null)}
                                                                                className="text-[11px] px-2 py-1 text-muted-foreground hover:text-foreground transition-colors"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setActiveCommentStep(null)}
                                                                                className="text-[11px] px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-semibold"
                                                                            >
                                                                                Post
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setActiveCommentStep(step.id)}
                                                                        className="inline-flex items-center gap-1.5 text-[11px] text-info font-medium hover:underline"
                                                                    >
                                                                        <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                                                                        Add Comment
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {(contact || note) && (
                                    <div className="px-6 py-3 border-t border-border bg-muted/20 shrink-0 space-y-1">
                                        {note && <p className="text-[11px] text-muted-foreground italic">{note}</p>}
                                        {contact && <p className="text-[11px] text-muted-foreground">Questions about this order? Contact <span className="font-medium text-foreground">{contact}</span></p>}
                                    </div>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
