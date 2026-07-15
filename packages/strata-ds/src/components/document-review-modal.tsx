/**
 * DocumentReviewModal — Headless UI port of the canonical DS DocumentReviewModal.
 *
 * Same prop API as the canonical version (Strata Design System/strata-ds/src/
 * components/overlays/document-review-modal.tsx). Impl uses @headlessui/react
 * Dialog + Transition because this catalyst-vendored DS does not ship Radix.
 *
 * Companions exported alongside: FieldSection, FieldValueRow, ConfidenceIndicator.
 *
 * Source pattern this consolidates (each was its own 600-3500+ LOC duplicate):
 *   - src/QuoteConverter.tsx               (DocumentReviewModal + tabs + sections)
 *   - src/components/bfi/BFIDocumentReviewModal.tsx           (3,458 LOC)
 *   - src/components/officeworks/OfficeworksDocumentReviewModal.tsx
 *   - src/components/AcknowledgementUploadModal.tsx (review subtree)
 */

import { Fragment, type ReactNode } from 'react'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Sparkles, X } from 'lucide-react'

const cn = (...parts: (string | false | null | undefined)[]) =>
    parts.filter(Boolean).join(' ')

// ── DocumentReviewModal ──────────────────────────────────────────────────

export interface DocumentReviewTab<TKey extends string = string> {
    key: TKey
    label: string
    count?: number
}

export interface DocumentReviewModalProps<TKey extends string = string> {
    open: boolean
    onClose: () => void

    title: string
    subtitle?: string
    /** Right-aligned header actions (View PDF button, kebab menu, etc). */
    headerActions?: ReactNode
    /** Status badge / pill rendered between actions and close. */
    status?: ReactNode

    tabs?: DocumentReviewTab<TKey>[]
    activeTab?: TKey
    onTabChange?: (key: TKey) => void
    /** Action slot rendered to the right of the tab strip (e.g. Export menu). */
    tabBarActions?: ReactNode

    /** Footer content (confidence indicator, Cancel + Save, etc). */
    footer?: ReactNode

    children: ReactNode
}

export function DocumentReviewModal<TKey extends string = string>({
    open,
    onClose,
    title,
    subtitle,
    headerActions,
    status,
    tabs,
    activeTab,
    onTabChange,
    tabBarActions,
    footer,
    children,
}: DocumentReviewModalProps<TKey>) {
    return (
        <Transition show={open} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[200]">
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-foreground/70 backdrop-blur-sm z-[200]" aria-hidden="true" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto z-[200]">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-[min(1400px,95vw)] max-h-[90vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
                                {/* Header */}
                                <header className="flex items-center justify-between gap-3 px-6 py-5 border-b border-border shrink-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Sparkles className="h-5 w-5 text-foreground shrink-0" aria-hidden="true" />
                                        <div className="min-w-0">
                                            <div className="text-lg font-bold text-foreground truncate">{title}</div>
                                            {subtitle && (
                                                <div className="text-xs text-muted-foreground truncate">{subtitle}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {headerActions}
                                        {status}
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            aria-label="Close"
                                            className="h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                        >
                                            <X className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    </div>
                                </header>

                                {/* Tab bar */}
                                {tabs && tabs.length > 0 && (
                                    <div className="flex items-center justify-between gap-3 px-6 border-b border-border shrink-0">
                                        <div role="tablist" className="flex items-center gap-6">
                                            {tabs.map((t) => {
                                                const isActive = t.key === activeTab
                                                return (
                                                    <button
                                                        key={t.key}
                                                        role="tab"
                                                        aria-selected={isActive}
                                                        type="button"
                                                        onClick={() => onTabChange?.(t.key)}
                                                        className={cn(
                                                            'h-12 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors border-b-2',
                                                            isActive
                                                                ? 'border-success text-foreground'
                                                                : 'border-transparent text-muted-foreground hover:text-foreground',
                                                        )}
                                                    >
                                                        {t.label}
                                                        {typeof t.count === 'number' && (
                                                            <span
                                                                className={cn(
                                                                    'inline-flex items-center justify-center min-w-[18px] h-5 px-1.5 rounded-full text-[10px] font-bold',
                                                                    isActive
                                                                        ? 'bg-success/15 text-success'
                                                                        : 'bg-muted text-muted-foreground',
                                                                )}
                                                            >
                                                                {t.count}
                                                            </span>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        {tabBarActions && <div className="shrink-0">{tabBarActions}</div>}
                                    </div>
                                )}

                                {/* Body */}
                                <div className="flex-1 overflow-y-auto bg-background">{children}</div>

                                {/* Footer */}
                                {footer && (
                                    <footer className="px-6 py-4 border-t border-border bg-card flex items-center justify-end gap-3 shrink-0">
                                        {footer}
                                    </footer>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

// ── Companion primitives ─────────────────────────────────────────────────

export interface FieldSectionProps {
    icon?: ReactNode
    label: string
    children: ReactNode
    className?: string
}

export function FieldSection({ icon, label, children, className }: FieldSectionProps) {
    return (
        <section
            className={cn(
                'rounded-xl border border-border bg-card overflow-hidden',
                className,
            )}
        >
            <header className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border">
                {icon && (
                    <span className="text-muted-foreground shrink-0" aria-hidden="true">
                        {icon}
                    </span>
                )}
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                </h4>
            </header>
            <div>{children}</div>
        </section>
    )
}

export interface FieldValueRowProps {
    field: string
    value: ReactNode
    placeholder?: string
    className?: string
}

export function FieldValueRow({
    field,
    value,
    placeholder = '—',
    className,
}: FieldValueRowProps) {
    const isEmpty =
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
    return (
        <div
            className={cn(
                'grid grid-cols-[160px_1fr] gap-4 px-4 py-3 border-b border-border last:border-b-0',
                className,
            )}
        >
            <div className="text-xs text-muted-foreground">{field}</div>
            <div className="text-sm text-foreground">
                {isEmpty ? (
                    <span className="text-muted-foreground">{placeholder}</span>
                ) : (
                    value
                )}
            </div>
        </div>
    )
}

export interface ConfidenceIndicatorProps {
    value: number
    className?: string
}

export function ConfidenceIndicator({ value, className }: ConfidenceIndicatorProps) {
    const tone =
        value >= 80
            ? 'text-success'
            : value >= 60
                ? 'text-warning'
                : 'text-destructive'
    return (
        <span className={cn('text-xs font-medium tabular-nums', tone, className)}>
            {value}% confidence
        </span>
    )
}
