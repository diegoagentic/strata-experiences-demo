/**
 * COMPONENT: ReasonDialog
 * PURPOSE: Shared centered dialog for 'act with a reason' flows — override,
 *          reject, dismiss, escalate, etc. Captures category + notes +
 *          optional AI-notify checkbox in a consistent form.
 *
 *          Extracted from MBIReasonModal so any demo/flow can use this
 *          pattern. Tone-aware (danger/info/warning/neutral) drives the
 *          icon tint, category chip active state, and CTA color via the
 *          semantic DS tokens (bg-danger/info/warning/primary).
 *
 * PROPS:
 *   - isOpen / onClose / onSubmit
 *   - tone: 'danger' | 'info' | 'warning' | 'neutral'
 *     drives icon tint, CTA color, category chip active state
 *   - title / subtitle
 *   - icon?: ReactNode                 — header icon (defaults by tone)
 *   - contextBanner?: { icon, title, body }
 *     optional info banner above the form (AI learning blurb, impact
 *     warning, etc.)
 *   - categories: { id, label }[]
 *   - defaultCategoryId?: string
 *   - categoryPrompt?: string          — label above the picker
 *   - notesPlaceholder?: string
 *   - notesLabel?: string
 *   - notesRequiredForCategoryId?: string   — enforces notes when 'other' etc.
 *   - notifyToggle?: {
 *       defaultOn?: boolean
 *       title: string
 *       description: string
 *     }
 *   - confirmLabel: string
 *   - confirmLabelWhenNotifying?: string
 *   - cancelLabel?: string
 *
 * USED BY: ValidationStep, ParsingDiscrepanciesPanel (and future flows).
 */

import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { X, Brain, AlertTriangle, Pencil, Ban, Check } from 'lucide-react'

export type ReasonTone = 'danger' | 'info' | 'warning' | 'neutral'

export interface ReasonPayload {
    categoryId: string
    notes: string
    notifyAI: boolean
}

interface ReasonDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (payload: ReasonPayload) => void
    tone: ReasonTone
    title: string
    subtitle?: string
    icon?: ReactNode
    contextBanner?: {
        icon?: ReactNode
        title: string
        body: ReactNode
        tone?: ReasonTone
    }
    categories: { id: string; label: string }[]
    defaultCategoryId?: string
    categoryPrompt?: string
    notesPlaceholder?: string
    notesLabel?: string
    notesRequiredForCategoryId?: string
    notifyToggle?: {
        defaultOn?: boolean
        title: string
        description: string
    }
    confirmLabel: string
    confirmLabelWhenNotifying?: string
    cancelLabel?: string
}

const TONE_CONFIG: Record<ReasonTone, {
    headerIconBg: string
    headerIconColor: string
    defaultIcon: ReactNode
    categoryActiveBg: string
    categoryActiveBorder: string
    categoryActiveText: string
    categoryActiveDot: string
    confirmClass: string
}> = {
    danger: {
        headerIconBg: 'bg-danger/15',
        headerIconColor: 'text-danger',
        defaultIcon: <Ban className="h-5 w-5" />,
        categoryActiveBg: 'bg-danger/10',
        categoryActiveBorder: 'border-danger/40',
        categoryActiveText: 'text-danger',
        categoryActiveDot: 'bg-danger',
        confirmClass: 'text-white bg-danger hover:opacity-90',
    },
    info: {
        headerIconBg: 'bg-info/15',
        headerIconColor: 'text-info',
        defaultIcon: <Pencil className="h-5 w-5" />,
        categoryActiveBg: 'bg-info/10',
        categoryActiveBorder: 'border-info/40',
        categoryActiveText: 'text-info',
        categoryActiveDot: 'bg-info',
        confirmClass: 'text-white bg-info hover:opacity-90',
    },
    warning: {
        headerIconBg: 'bg-warning/15',
        headerIconColor: 'text-warning',
        defaultIcon: <AlertTriangle className="h-5 w-5" />,
        categoryActiveBg: 'bg-warning/10',
        categoryActiveBorder: 'border-warning/40',
        categoryActiveText: 'text-warning',
        categoryActiveDot: 'bg-warning',
        confirmClass: 'text-primary-foreground bg-primary hover:opacity-90',
    },
    neutral: {
        headerIconBg: 'bg-muted',
        headerIconColor: 'text-muted-foreground',
        defaultIcon: <X className="h-5 w-5" />,
        categoryActiveBg: 'bg-muted',
        categoryActiveBorder: 'border-muted-foreground/40',
        categoryActiveText: 'text-foreground',
        categoryActiveDot: 'bg-muted-foreground',
        confirmClass: 'text-primary-foreground bg-primary hover:opacity-90',
    },
}

export default function ReasonDialog({
    isOpen,
    onClose,
    onSubmit,
    tone,
    title,
    subtitle,
    icon,
    contextBanner,
    categories,
    defaultCategoryId,
    categoryPrompt = 'Reason',
    notesPlaceholder,
    notesLabel = 'Notes',
    notesRequiredForCategoryId,
    notifyToggle,
    confirmLabel,
    confirmLabelWhenNotifying,
    cancelLabel = 'Cancel',
}: ReasonDialogProps) {
    const toneCfg = TONE_CONFIG[tone]
    const initialCategory = defaultCategoryId ?? categories[0]?.id ?? ''

    const [categoryId, setCategoryId] = useState(initialCategory)
    const [notes, setNotes] = useState('')
    const [notifyAI, setNotifyAI] = useState(notifyToggle?.defaultOn ?? true)

    // Reset form when the dialog opens
    useEffect(() => {
        if (isOpen) {
            setCategoryId(initialCategory)
            setNotes('')
            setNotifyAI(notifyToggle?.defaultOn ?? true)
        }
    }, [isOpen, initialCategory, notifyToggle?.defaultOn])

    const notesRequired = notesRequiredForCategoryId && categoryId === notesRequiredForCategoryId
    const canSubmit = !notesRequired || notes.trim().length > 0

    const handleSubmit = () => {
        if (!canSubmit) return
        onSubmit({ categoryId, notes: notes.trim(), notifyAI: notifyToggle ? notifyAI : false })
    }

    const bannerToneCfg = contextBanner?.tone ? TONE_CONFIG[contextBanner.tone] : toneCfg
    const bannerBg = contextBanner?.tone === 'info'
        ? 'bg-info/10 border-info/30'
        : contextBanner?.tone === 'warning'
            ? 'bg-warning/10 border-warning/30'
            : contextBanner?.tone === 'danger'
                ? 'bg-danger/10 border-danger/30'
                : 'bg-ai/10 border-ai/30'

    const resolvedConfirmLabel = notifyToggle && notifyAI && confirmLabelWhenNotifying
        ? confirmLabelWhenNotifying
        : confirmLabel

    return (
        <Transition show={isOpen} as={Fragment} appear>
            <Dialog onClose={onClose} className="relative z-[100]">
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-background/70 backdrop-blur-sm" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95 translate-y-2" enterTo="opacity-100 scale-100 translate-y-0" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-xl bg-card dark:bg-zinc-900 border border-border rounded-2xl shadow-2xl">
                                <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className={`h-10 w-10 rounded-xl ${toneCfg.headerIconBg} ${toneCfg.headerIconColor} flex items-center justify-center shrink-0`}>
                                            {icon ?? toneCfg.defaultIcon}
                                        </div>
                                        <div>
                                            <DialogTitle className="text-base font-bold text-foreground">{title}</DialogTitle>
                                            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Close">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Context banner (optional) */}
                                    {contextBanner && (
                                        <div className={`border rounded-xl p-3 flex items-start gap-2.5 ${bannerBg}`}>
                                            <span className={`shrink-0 mt-0.5 ${bannerToneCfg.headerIconColor}`}>
                                                {contextBanner.icon ?? bannerToneCfg.defaultIcon}
                                            </span>
                                            <div className="text-xs">
                                                <div className="font-bold text-foreground">{contextBanner.title}</div>
                                                <div className="text-muted-foreground mt-0.5">{contextBanner.body}</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Category picker */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                            {categoryPrompt}
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {categories.map(c => {
                                                const active = categoryId === c.id
                                                return (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => setCategoryId(c.id)}
                                                        className={`
                                                            flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold text-left transition-colors
                                                            ${active
                                                                ? `${toneCfg.categoryActiveBg} ${toneCfg.categoryActiveBorder} ${toneCfg.categoryActiveText}`
                                                                : 'bg-background dark:bg-zinc-800 border-border text-foreground hover:border-zinc-300 dark:hover:border-zinc-700'
                                                            }
                                                        `}
                                                    >
                                                        <span className={`h-2 w-2 rounded-full shrink-0 ${active ? toneCfg.categoryActiveDot : 'bg-muted-foreground/30'}`} />
                                                        {c.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                            {notesLabel}
                                            {notesRequired && <span className={`ml-1 ${toneCfg.categoryActiveText}`}>· required</span>}
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            rows={3}
                                            placeholder={notesPlaceholder}
                                            className="w-full bg-background dark:bg-zinc-800 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                                        />
                                    </div>

                                    {/* Notify AI toggle (optional) */}
                                    {notifyToggle && (
                                        <label className="flex items-start gap-3 bg-muted/30 dark:bg-zinc-800/60 border border-border rounded-lg p-3 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={notifyAI}
                                                onChange={e => setNotifyAI(e.target.checked)}
                                                className="h-4 w-4 mt-0.5 accent-primary"
                                            />
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-foreground">{notifyToggle.title}</div>
                                                <div className="text-[11px] text-muted-foreground mt-0.5">{notifyToggle.description}</div>
                                            </div>
                                        </label>
                                    )}
                                </div>

                                <div className="px-5 py-3 border-t border-border bg-muted/20 dark:bg-zinc-900/40 flex items-center justify-between gap-3">
                                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors">
                                        {cancelLabel}
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!canSubmit}
                                        className={`
                                            flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm
                                            ${toneCfg.confirmClass}
                                        `}
                                    >
                                        {notifyToggle && notifyAI ? <Brain className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                        {resolvedConfirmLabel}
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
