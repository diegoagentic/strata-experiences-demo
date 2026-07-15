/**
 * QuoteRevisionRequestModal · Create/request a new quote revision (Wendy item 3 button)
 *
 * Dual mode per viewAs (W11):
 *  - manufacturer · "Create new revision" · author + reason + line changes → adds to history
 *  - dealer       · "Request revision"    · change summary + reason → sent to manufacturer
 *
 * Per Modal Normalization Spec.
 */

import { Fragment, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    X,
    Send,
    Pencil,
    Sparkles,
    CheckCircle2,
    Plus,
    Trash2,
    History,
} from 'lucide-react'
import { useViewAs } from './viewAsSignal'

interface ChangeRow {
    id: string
    field: string
    fromValue: string
    toValue: string
}

interface QuoteRevisionRequestModalProps {
    isOpen: boolean
    onClose: () => void
    quoteId: string
    /** Current revision number (used to compute the next one) */
    currentRevision?: number
}

const REASON_PRESETS: Record<'manufacturer' | 'dealer', string[]> = {
    manufacturer: [
        'Client requested fabric swap',
        'Pricing correction · vendor catalog update',
        'Scope expansion · added line items',
        'Lead time adjustment',
        'Other (specify)',
    ],
    dealer: [
        'Client wants different finish/fabric',
        'Need quantity adjustment',
        'Client adds/removes line items',
        'Price negotiation',
        'Other (specify)',
    ],
}

export default function QuoteRevisionRequestModal({
    isOpen,
    onClose,
    quoteId,
    currentRevision = 3,
}: QuoteRevisionRequestModalProps) {
    const viewAs = useViewAs()
    const isDealer = viewAs === 'dealer'

    const [reason, setReason] = useState(REASON_PRESETS[viewAs][0])
    const [customReason, setCustomReason] = useState('')
    const [changes, setChanges] = useState<ChangeRow[]>([
        { id: 'c1', field: '', fromValue: '', toValue: '' },
    ])
    const [submitted, setSubmitted] = useState(false)

    const nextRevision = currentRevision + 1
    const finalReason = reason === 'Other (specify)' ? (customReason || '(unspecified)') : reason

    const addChange = () => {
        setChanges(prev => [...prev, { id: `c${Date.now()}`, field: '', fromValue: '', toValue: '' }])
    }
    const removeChange = (id: string) => {
        setChanges(prev => prev.filter(c => c.id !== id))
    }
    const updateChange = (id: string, field: keyof ChangeRow, value: string) => {
        setChanges(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)))
    }

    const handleSubmit = () => {
        setSubmitted(true)
        setTimeout(() => {
            onClose()
            setSubmitted(false)
            // reset form
            setReason(REASON_PRESETS[viewAs][0])
            setCustomReason('')
            setChanges([{ id: 'c1', field: '', fromValue: '', toValue: '' }])
        }, 1600)
    }

    const validChangeCount = changes.filter(c => c.field.trim().length > 0).length

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                            <DialogPanel className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
                                {/* Header */}
                                <div className="px-5 py-4 border-b border-border bg-card flex items-start gap-3 shrink-0">
                                    <div className="h-9 w-9 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
                                        {isDealer ? <Send className="h-4 w-4 text-info" aria-hidden="true" /> : <Pencil className="h-4 w-4 text-info" aria-hidden="true" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 flex-wrap">
                                            {isDealer ? 'Request quote revision' : 'Create new revision'}
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-info/10 text-info border border-info/20">
                                                <History className="h-2.5 w-2.5" aria-hidden="true" />
                                                Will become Revision # {nextRevision}
                                            </span>
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            {quoteId} · current Revision # {currentRevision} {isDealer ? '· will notify Sales Rep' : '· will add to revision history'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        aria-label="Close revision dialog"
                                        className="shrink-0 h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                    {/* Reason selector */}
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                            Reason
                                        </label>
                                        <select
                                            value={reason}
                                            onChange={e => setReason(e.target.value)}
                                            className="w-full h-9 rounded-md border border-border bg-background text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                        >
                                            {REASON_PRESETS[viewAs].map(r => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                        {reason === 'Other (specify)' && (
                                            <input
                                                type="text"
                                                value={customReason}
                                                onChange={e => setCustomReason(e.target.value)}
                                                placeholder="Briefly describe the reason"
                                                className="mt-2 w-full h-9 rounded-md border border-border bg-background text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                            />
                                        )}
                                    </div>

                                    {/* Change rows */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                {isDealer ? 'What needs to change?' : 'Field-level changes'}
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addChange}
                                                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-info hover:underline"
                                            >
                                                <Plus className="h-3 w-3" aria-hidden="true" />
                                                Add row
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {changes.map(c => (
                                                <div key={c.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        value={c.field}
                                                        onChange={e => updateChange(c.id, 'field', e.target.value)}
                                                        placeholder="Field (e.g. Fabric · F-SSC346030C)"
                                                        className="h-8 rounded-md border border-border bg-background text-foreground text-[11px] px-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={c.fromValue}
                                                        onChange={e => updateChange(c.id, 'fromValue', e.target.value)}
                                                        placeholder="From"
                                                        className="h-8 rounded-md border border-border bg-background text-muted-foreground text-[11px] px-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={c.toValue}
                                                        onChange={e => updateChange(c.id, 'toValue', e.target.value)}
                                                        placeholder="To"
                                                        className="h-8 rounded-md border border-border bg-background text-foreground text-[11px] px-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeChange(c.id)}
                                                        disabled={changes.length === 1}
                                                        aria-label="Remove change"
                                                        className="h-8 w-8 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-destructive transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* AI assist hint */}
                                    <div className="rounded-lg border border-ai/30 bg-ai/5 px-3 py-2 flex items-start gap-2">
                                        <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" aria-hidden="true" />
                                        <div className="text-[11px] text-foreground">
                                            <strong>Strata AI</strong> will draft the revision summary email · review and send · {isDealer ? 'manufacturer typically responds within 24h.' : 'dealer is notified on save.'}
                                        </div>
                                    </div>

                                    {/* Preview summary */}
                                    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-[11px] text-foreground">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Summary</div>
                                        <div>Revision # {nextRevision} · {finalReason} · {validChangeCount} change{validChangeCount === 1 ? '' : 's'}</div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-3 border-t border-border bg-card flex items-center justify-end gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="inline-flex items-center justify-center h-9 px-4 rounded-md text-[12px] font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={submitted}
                                        className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md text-[12px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
                                    >
                                        {submitted ? (
                                            <>
                                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                {isDealer ? 'Request sent · awaiting reply' : `Revision # ${nextRevision} created`}
                                            </>
                                        ) : (
                                            <>
                                                {isDealer ? <Send className="h-3.5 w-3.5" aria-hidden="true" /> : <Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
                                                {isDealer ? 'Send request to manufacturer' : `Create Revision # ${nextRevision}`}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
