/**
 * COMPONENT: ParsingDiscrepanciesPanel
 * PURPOSE: Compact summary of parse-time issues with a "Review" CTA that
 *          opens a side sheet containing the full discrepancy cards. Keeps
 *          the wizard surface focused on the hero (extracted items + CTA)
 *          while triage detail stays one click away.
 *
 *          Two discrepancies supported for the hero demo:
 *            1. FIELD — declared SIF ceiling vs CAP override total.
 *            2. INVENTORY — cheaper in-stock match for a vendor-new line.
 *
 * PROPS:
 *   - discrepancies: ParsingDiscrepancy[]
 *   - statusById: Record<id, DiscrepancyStatus>
 *   - onStatusChange: (id, status) => void
 *
 * USED BY: ParsingStep (wizard step 1)
 */

import { useState } from 'react'
import {
    AlertTriangle, Sparkles, CheckCircle2, Check, X, PackageSearch,
    Eye, Scale, TrendingDown, TrendingUp, ChevronRight, Send, Brain,
    ArrowRight, Package, Truck, Warehouse,
} from 'lucide-react'
import MBIDetailSheet from './MBIDetailSheet'
import { ReasonDialog as MBIReasonModal, StatusBadge, type StatusTone } from '../shared'

export type DiscrepancyStatus = 'pending' | 'accepted' | 'dismissed'

interface DiscrepancyMeta {
    reasonCategory?: string
    notes?: string
    notifyAI?: boolean
    appliedAt: Date
}

const DISMISS_CATEGORIES = [
    { id: 'false-positive', label: 'False positive · Strata misread the SIF' },
    { id: 'addressed-elsewhere', label: 'Already addressed outside the parse' },
    { id: 'not-applicable', label: 'Not applicable to this project' },
    { id: 'other', label: 'Other (describe below)' },
]

export interface ParsingDiscrepancy {
    id: string
    kind: 'field' | 'inventory'
    title: string
    context: string
    confidence: number
    current: { label: string; value: string }
    suggestion: { label: string; value: string }
    impact?: { label: string; amount: number; tone: 'positive' | 'neutral' | 'negative' }
    actionLabel: string
    reviewLabel?: string
}

export const DEFAULT_PARSING_DISCREPANCIES: ParsingDiscrepancy[] = [
    {
        id: 'field-budget-ceiling',
        kind: 'field',
        title: 'Budget ceiling mismatch',
        context: 'CAP worksheet total is $7,450 above the declared ceiling in the SIF header.',
        confidence: 96,
        current: { label: 'SIF header (declared)', value: '$385,000 · budget ceiling' },
        suggestion: { label: 'CAP worksheet (derived)', value: '$392,450 · sum of overrides' },
        impact: { label: 'Deviation', amount: 7450, tone: 'negative' },
        actionLabel: 'Use CAP total',
        reviewLabel: 'Open reconciler',
    },
    {
        id: 'inventory-knoll-propeller',
        kind: 'inventory',
        title: 'Cheaper match in inventory',
        context: 'Pinnacle Orbit 84" is in Strata warehouse at a lower price.',
        confidence: 92,
        current: { label: 'SIF line (KNOLL-PROP-84)', value: '2 × $8,400 · new from vendor' },
        suggestion: { label: 'Strata inventory match', value: '2 × $6,900 · in-stock · Birmingham DC' },
        impact: { label: 'Potential savings', amount: 3000, tone: 'positive' },
        actionLabel: 'Apply swap',
        reviewLabel: 'Compare inventory',
    },
]

interface ParsingDiscrepanciesPanelProps {
    discrepancies: ParsingDiscrepancy[]
    statusById: Record<string, DiscrepancyStatus>
    onStatusChange: (id: string, status: DiscrepancyStatus) => void
}

export default function ParsingDiscrepanciesPanel({
    discrepancies,
    statusById,
    onStatusChange,
}: ParsingDiscrepanciesPanelProps) {
    const [sheetOpen, setSheetOpen] = useState(false)

    // Per-card action state
    const [reviewTarget, setReviewTarget] = useState<ParsingDiscrepancy | null>(null)
    const [dismissTarget, setDismissTarget] = useState<ParsingDiscrepancy | null>(null)
    const [metaById, setMetaById] = useState<Record<string, DiscrepancyMeta>>({})
    const [toast, setToast] = useState<{ id: string; message: string; tone: 'success' | 'info' | 'neutral' } | null>(null)

    const pushToast = (id: string, tone: 'success' | 'info' | 'neutral', message: string) => {
        setToast({ id, tone, message })
        setTimeout(() => setToast(prev => (prev?.id === id ? null : prev)), 4200)
    }

    const handleAccept = (d: ParsingDiscrepancy) => {
        onStatusChange(d.id, 'accepted')
        setMetaById(prev => ({ ...prev, [d.id]: { appliedAt: new Date() } }))
        const impact = d.impact ? ` · $${d.impact.amount.toLocaleString()} ${d.impact.tone === 'positive' ? 'saved' : 'reconciled'}` : ''
        pushToast(d.id, 'success', `${d.actionLabel}${impact}`)
    }

    const handleAcceptFromSheet = (d: ParsingDiscrepancy) => {
        handleAccept(d)
        setReviewTarget(null)
    }

    const handleDismissSubmit = (d: ParsingDiscrepancy, payload: { reasonCategory: string; notes: string; notifyAI: boolean }) => {
        onStatusChange(d.id, 'dismissed')
        setMetaById(prev => ({ ...prev, [d.id]: { ...payload, appliedAt: new Date() } }))
        setDismissTarget(null)
        const suffix = payload.notifyAI ? ' · feedback sent to Strata AI' : ' · logged locally'
        pushToast(d.id, 'neutral', `Dismissed${suffix}`)
    }

    const handleReopen = (d: ParsingDiscrepancy) => {
        onStatusChange(d.id, 'pending')
        setMetaById(prev => { const { [d.id]: _, ...rest } = prev; return rest })
        if (toast?.id === d.id) setToast(null)
    }

    const total = discrepancies.length
    const resolved = discrepancies.filter(d => (statusById[d.id] ?? 'pending') !== 'pending').length
    const pending = total - resolved
    const savings = discrepancies
        .filter(d => statusById[d.id] === 'accepted' && d.impact?.tone === 'positive')
        .reduce((acc, d) => acc + (d.impact?.amount ?? 0), 0)
    const deviation = discrepancies
        .filter(d => (statusById[d.id] ?? 'pending') === 'pending' && d.impact?.tone === 'negative')
        .reduce((acc, d) => acc + (d.impact?.amount ?? 0), 0)

    const fieldCount = discrepancies.filter(d => d.kind === 'field').length
    const inventoryCount = discrepancies.filter(d => d.kind === 'inventory').length

    return (
        <>
            {/* Compact summary strip */}
            <div
                className={`
                    bg-card dark:bg-zinc-800 border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3
                    ${pending > 0 ? 'border-amber-300 dark:border-amber-500/30' : 'border-success/30'}
                `}
            >
                <div className="flex items-start gap-3 min-w-0">
                    <div
                        className={`
                            h-9 w-9 rounded-xl flex items-center justify-center shrink-0
                            ${pending > 0
                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                : 'bg-success/15 text-success'
                            }
                        `}
                    >
                        {pending > 0 ? <Scale className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground">
                            {pending > 0
                                ? `${pending} item${pending !== 1 ? 's' : ''} to review before scenarios`
                                : 'All discrepancies resolved'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                            {fieldCount} field mismatch · {inventoryCount} inventory suggestion · neither blocks advancement
                        </div>
                        {(savings > 0 || deviation > 0) && (
                            <div className="flex items-center gap-3 mt-1.5 text-[10px]">
                                {deviation > 0 && (
                                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                                        <TrendingUp className="h-3 w-3" />
                                        +${deviation.toLocaleString()} pending
                                    </span>
                                )}
                                {savings > 0 && (
                                    <span className="inline-flex items-center gap-1 text-success font-semibold">
                                        <TrendingDown className="h-3 w-3" />
                                        −${savings.toLocaleString()} saved
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                        <div className="flex items-baseline gap-0.5 justify-end">
                            <span className="text-xl font-bold text-foreground tabular-nums">{resolved}</span>
                            <span className="text-xs text-muted-foreground tabular-nums">/ {total}</span>
                        </div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">resolved</div>
                    </div>
                    <button
                        onClick={() => setSheetOpen(true)}
                        className={`
                            flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors
                            ${pending > 0
                                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
                                : 'bg-background dark:bg-zinc-800 text-foreground border border-border hover:bg-muted'
                            }
                        `}
                    >
                        {pending > 0 ? 'Review items' : 'View details'}
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Sheet with the discrepancy cards */}
            <MBIDetailSheet
                isOpen={sheetOpen}
                onClose={() => setSheetOpen(false)}
                title="Parse discrepancies"
                subtitle={`${pending} of ${total} pending · neither blocks advancement`}
                icon={<Scale className="h-4 w-4" />}
                width="md"
            >
                <div className="space-y-3">
                    {discrepancies.map(d => (
                        <DiscrepancyCard
                            key={d.id}
                            discrepancy={d}
                            status={statusById[d.id] ?? 'pending'}
                            meta={metaById[d.id]}
                            activeToast={toast?.id === d.id ? toast : null}
                            onAccept={() => handleAccept(d)}
                            onReview={() => setReviewTarget(d)}
                            onDismiss={() => setDismissTarget(d)}
                            onReopen={() => handleReopen(d)}
                        />
                    ))}
                </div>
            </MBIDetailSheet>

            {/* Deep-dive review sheet (opens on Open reconciler / Compare inventory) */}
            {reviewTarget && (
                <ReviewDiscrepancySheet
                    discrepancy={reviewTarget}
                    onClose={() => setReviewTarget(null)}
                    onApply={() => handleAcceptFromSheet(reviewTarget)}
                    onDismiss={() => {
                        setReviewTarget(null)
                        setDismissTarget(reviewTarget)
                    }}
                />
            )}

            {/* Dismiss modal — feedback loop for AI training */}
            {dismissTarget && (
                <MBIReasonModal
                    isOpen
                    onClose={() => setDismissTarget(null)}
                    onSubmit={payload => handleDismissSubmit(dismissTarget, {
                        reasonCategory: payload.categoryId,
                        notes: payload.notes,
                        notifyAI: payload.notifyAI,
                    })}
                    tone="danger"
                    icon={<X className="h-5 w-5" />}
                    title="Dismiss this discrepancy"
                    subtitle={dismissTarget.title}
                    contextBanner={{
                        tone: 'info',
                        icon: <Brain className="h-4 w-4" />,
                        title: 'Your feedback trains the parser.',
                        body: 'Tell Strata why this flag was noise so it stops raising it on future imports.',
                    }}
                    categories={DISMISS_CATEGORIES}
                    defaultCategoryId="false-positive"
                    categoryPrompt="Why dismiss?"
                    notesPlaceholder="e.g. CAP total is correct — the SIF header was stale from an earlier revision."
                    notesRequiredForCategoryId="other"
                    notifyToggle={{
                        defaultOn: true,
                        title: 'Send feedback to Strata AI',
                        description: 'Dismissal + reason logged to the parser-improvement pipeline. No client data shared.',
                    }}
                    confirmLabel="Dismiss flag"
                    confirmLabelWhenNotifying="Dismiss & notify AI"
                />
            )}
        </>
    )
}

// ─── Single discrepancy card (compact) ───────────────────────────────────────
function DiscrepancyCard({
    discrepancy,
    status,
    meta,
    activeToast,
    onAccept,
    onReview,
    onDismiss,
    onReopen,
}: {
    discrepancy: ParsingDiscrepancy
    status: DiscrepancyStatus
    meta?: DiscrepancyMeta
    activeToast: { id: string; tone: 'success' | 'info' | 'neutral'; message: string } | null
    onAccept: () => void
    onReview: () => void
    onDismiss: () => void
    onReopen: () => void
}) {
    const isField = discrepancy.kind === 'field'
    const theme: {
        border: string
        bg: string
        leftBar: string
        iconBg: string
        icon: React.ReactNode
        label: string
        tone: StatusTone
    } = (() => {
        if (status === 'accepted') {
            return {
                border: 'border-success/40',
                bg: 'bg-success/5 dark:bg-success/10',
                leftBar: 'border-l-success',
                iconBg: 'bg-success/15 text-success',
                icon: <CheckCircle2 className="h-4 w-4" />,
                label: 'Applied',
                tone: 'success',
            }
        }
        if (status === 'dismissed') {
            return {
                border: 'border-border',
                bg: 'bg-muted/30 dark:bg-zinc-800',
                leftBar: 'border-l-muted-foreground/40',
                iconBg: 'bg-muted text-muted-foreground',
                icon: <X className="h-4 w-4" />,
                label: 'Dismissed',
                tone: 'neutral',
            }
        }
        if (isField) {
            return {
                border: 'border-amber-300 dark:border-amber-500/40',
                bg: 'bg-amber-50/70 dark:bg-amber-500/10',
                leftBar: 'border-l-amber-500',
                iconBg: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
                icon: <AlertTriangle className="h-4 w-4" />,
                label: 'Field mismatch',
                tone: 'warning',
            }
        }
        return {
            border: 'border-info/40',
            bg: 'bg-info/5 dark:bg-info/10',
            leftBar: 'border-l-info',
            iconBg: 'bg-info/15 text-info',
            icon: <PackageSearch className="h-4 w-4" />,
            label: 'Inventory suggestion',
            tone: 'info',
        }
    })()

    const innerPanel = 'bg-muted/70 dark:bg-zinc-900/40 border border-border rounded-lg p-2.5 min-w-0'

    return (
        <div className={`border border-l-4 rounded-xl p-3 ${theme.border} ${theme.bg} ${theme.leftBar}`}>
            {/* Header */}
            <div className="flex items-start gap-2.5 mb-2">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                    {theme.icon}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <StatusBadge label={theme.label} tone={theme.tone} size="xs" />
                        <span className="text-[9px] text-muted-foreground">AI {discrepancy.confidence}%</span>
                    </div>
                    <div className="text-sm font-bold text-foreground leading-tight mt-0.5">{discrepancy.title}</div>
                    <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{discrepancy.context}</div>
                </div>
                {discrepancy.impact && (
                    <div className="text-right shrink-0">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            {discrepancy.impact.label}
                        </div>
                        <div
                            className={`text-lg font-bold tabular-nums leading-none mt-0.5 ${
                                discrepancy.impact.tone === 'positive' ? 'text-success'
                                : discrepancy.impact.tone === 'negative' ? 'text-amber-600 dark:text-amber-400'
                                : 'text-foreground'
                            }`}
                        >
                            {discrepancy.impact.tone === 'positive' ? '−' : discrepancy.impact.tone === 'negative' ? '+' : ''}
                            ${discrepancy.impact.amount.toLocaleString()}
                        </div>
                    </div>
                )}
            </div>

            {/* Current | Suggested — side-by-side for width efficiency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className={innerPanel}>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{discrepancy.current.label}</div>
                    <div className="text-xs text-foreground">{discrepancy.current.value}</div>
                </div>
                <div className={`${innerPanel} ${isField ? 'border-amber-200 dark:border-amber-500/30' : 'border-info/30'}`}>
                    <div className="flex items-center gap-1 mb-0.5">
                        <Sparkles className={`h-2.5 w-2.5 ${isField ? 'text-amber-600 dark:text-amber-400' : 'text-info'}`} />
                        <div className={`text-[9px] font-bold uppercase tracking-wider ${isField ? 'text-amber-700 dark:text-amber-400' : 'text-info'}`}>
                            {discrepancy.suggestion.label}
                        </div>
                    </div>
                    <div className="text-xs text-foreground">{discrepancy.suggestion.value}</div>
                </div>
            </div>

            {/* Actions */}
            {status === 'pending' ? (
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                    <button
                        onClick={onDismiss}
                        title="Dismiss the flag · send feedback to Strata AI"
                        className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground bg-background dark:bg-zinc-800 border border-border rounded-md hover:bg-muted hover:border-muted-foreground/40 transition-colors"
                    >
                        Dismiss
                    </button>
                    <button
                        onClick={onReview}
                        title={`Open a detailed comparison before deciding`}
                        className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold text-foreground bg-background dark:bg-zinc-800 border border-border rounded-md hover:bg-muted hover:border-info/40 transition-colors"
                    >
                        <Eye className="h-3 w-3" />
                        {discrepancy.reviewLabel ?? 'Review'}
                    </button>
                    <button
                        onClick={onAccept}
                        title="Apply the AI suggestion"
                        className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold text-primary-foreground bg-primary rounded-md hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Check className="h-3 w-3" />
                        {discrepancy.actionLabel}
                    </button>
                </div>
            ) : (
                <div className="mt-2 pt-2 border-t border-current/10 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-1.5 text-[11px] min-w-0">
                            {status === 'accepted'
                                ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                                : <X className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />}
                            <div className="min-w-0">
                                <div className="text-foreground font-semibold">
                                    {status === 'accepted'
                                        ? (isField
                                            ? <>CAP total adopted{discrepancy.impact && <> · <span className="text-amber-600 dark:text-amber-400 tabular-nums">${discrepancy.impact.amount.toLocaleString()} reconciled</span></>}</>
                                            : <>Inventory swap applied{discrepancy.impact && <> · <span className="text-success tabular-nums">${discrepancy.impact.amount.toLocaleString()} saved</span></>}</>
                                        )
                                        : <>Dismissed{meta?.notifyAI ? ' · AI notified' : ' · logged locally'}</>
                                    }
                                </div>
                                {meta?.reasonCategory && status === 'dismissed' && (
                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                        Reason: <span className="text-foreground font-medium">
                                            {DISMISS_CATEGORIES.find(c => c.id === meta.reasonCategory)?.label ?? meta.reasonCategory}
                                        </span>
                                    </div>
                                )}
                                {meta?.notes && (
                                    <div className="text-[10px] text-muted-foreground italic mt-0.5 line-clamp-2">"{meta.notes}"</div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onReopen}
                            className="text-[10px] text-muted-foreground hover:text-foreground underline shrink-0"
                        >
                            Reopen
                        </button>
                    </div>

                    {/* Transient toast confirmation */}
                    {activeToast && (
                        <div
                            className={`
                                flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300
                                ${activeToast.tone === 'success' ? 'bg-success/15 text-success border border-success/30' : ''}
                                ${activeToast.tone === 'info' ? 'bg-info/15 text-info border border-info/30' : ''}
                                ${activeToast.tone === 'neutral' ? 'bg-muted text-foreground border border-border' : ''}
                            `}
                        >
                            {status === 'dismissed' && meta?.notifyAI
                                ? <Brain className="h-3.5 w-3.5 shrink-0" />
                                : <Send className="h-3.5 w-3.5 shrink-0" />}
                            <span className="truncate">{activeToast.message}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Review sheet (Open reconciler / Compare inventory) ──────────────────────
function ReviewDiscrepancySheet({
    discrepancy,
    onClose,
    onApply,
    onDismiss,
}: {
    discrepancy: ParsingDiscrepancy
    onClose: () => void
    onApply: () => void
    onDismiss: () => void
}) {
    const isField = discrepancy.kind === 'field'

    return (
        <MBIDetailSheet
            isOpen={true}
            onClose={onClose}
            title={discrepancy.reviewLabel ?? 'Review discrepancy'}
            subtitle={discrepancy.title}
            icon={isField ? <Scale className="h-4 w-4" /> : <PackageSearch className="h-4 w-4" />}
            width="md"
        >
            <div className="space-y-4">
                {/* Context banner */}
                <div
                    className={`
                        border rounded-xl p-3 flex items-start gap-2.5
                        ${isField
                            ? 'bg-amber-50/70 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40'
                            : 'bg-info/5 dark:bg-info/10 border-info/30'
                        }
                    `}
                >
                    {isField
                        ? <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        : <PackageSearch className="h-4 w-4 text-info shrink-0 mt-0.5" />
                    }
                    <div className="text-xs">
                        <div className="font-bold text-foreground">
                            {isField ? 'Reconcile the budget ceiling' : 'Compare vendor vs inventory'}
                        </div>
                        <div className="text-muted-foreground mt-0.5">{discrepancy.context}</div>
                    </div>
                </div>

                {/* Kind-specific detail */}
                {isField ? <FieldReconcilerDetail /> : <InventoryCompareDetail />}

                {/* Decision footer */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
                    <button
                        onClick={onDismiss}
                        className="px-3 py-2 text-xs font-bold text-muted-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                        Dismiss with feedback
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-3 py-2 text-xs font-medium text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                            Keep reviewing
                        </button>
                        <button
                            onClick={onApply}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <Check className="h-3.5 w-3.5" />
                            {discrepancy.actionLabel}
                        </button>
                    </div>
                </div>
            </div>
        </MBIDetailSheet>
    )
}

function FieldReconcilerDetail() {
    const deltaRows = [
        { line: 'L-12', desc: 'Vertex Modular panel override', delta: 1250 },
        { line: 'L-15', desc: 'Vertex Modular desk override', delta: 2100 },
        { line: 'L-18', desc: 'Meridian Sync chair override', delta: 820 },
        { line: 'L-22', desc: 'Pinnacle Orbit custom pricing', delta: 2400 },
        { line: 'L-25', desc: 'Apex Embody override', delta: 780 },
    ]
    const total = deltaRows.reduce((acc, r) => acc + r.delta, 0)

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-muted/30 dark:bg-zinc-900/40 border border-border rounded-xl p-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">SIF header</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Declared ceiling</div>
                    <div className="text-xl font-bold text-foreground tabular-nums mt-1">$385,000</div>
                </div>
                <div className="bg-amber-50/60 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/40 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">CAP worksheet</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Sum of overrides</div>
                    <div className="text-xl font-bold text-foreground tabular-nums mt-1">$392,450</div>
                </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
                <div className="px-3 py-2 bg-muted/40 dark:bg-zinc-900/40 border-b border-border grid grid-cols-[3rem_1fr_5rem] gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <div>Line</div>
                    <div>Override</div>
                    <div className="text-right">Delta</div>
                </div>
                <div className="divide-y divide-border">
                    {deltaRows.map(r => (
                        <div key={r.line} className="px-3 py-2 grid grid-cols-[3rem_1fr_5rem] gap-3 items-center text-xs">
                            <div className="font-mono text-muted-foreground">{r.line}</div>
                            <div className="text-foreground truncate">{r.desc}</div>
                            <div className="text-right tabular-nums font-bold text-amber-600 dark:text-amber-400">+${r.delta.toLocaleString()}</div>
                        </div>
                    ))}
                </div>
                <div className="px-3 py-2 bg-amber-50/40 dark:bg-amber-500/10 border-t border-border grid grid-cols-[3rem_1fr_5rem] gap-3 items-center text-xs">
                    <div />
                    <div className="font-bold text-foreground">Total deviation</div>
                    <div className="text-right tabular-nums font-bold text-amber-700 dark:text-amber-400 text-base">+${total.toLocaleString()}</div>
                </div>
            </div>

            <div className="text-[11px] text-muted-foreground bg-muted/20 dark:bg-zinc-800 border border-border rounded-lg p-2.5">
                Adopting the CAP total updates the budget ceiling to <strong className="text-foreground">$392,450</strong> before scenarios compute. The SIF header is kept in the audit log with a reconciliation note.
            </div>
        </div>
    )
}

function InventoryCompareDetail() {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
                <div className="bg-muted/30 dark:bg-zinc-900/40 border border-border rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Vendor new</span>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Pinnacle Orbit 84"</div>
                        <div className="text-[10px] text-muted-foreground">SKU KNOLL-PROP-84 · SIF line</div>
                    </div>
                    <div className="mt-auto pt-2 border-t border-border space-y-0.5 text-[11px]">
                        <div className="flex justify-between"><span className="text-muted-foreground">Unit price</span><span className="text-foreground tabular-nums">$8,400</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Qty</span><span className="text-foreground tabular-nums">2</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Lead time</span><span className="text-foreground">6–8 weeks</span></div>
                        <div className="flex justify-between pt-1 border-t border-border"><span className="font-bold text-foreground">Subtotal</span><span className="font-bold text-foreground tabular-nums">$16,800</span></div>
                    </div>
                </div>

                <div className="flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-info" />
                </div>

                <div className="bg-info/5 dark:bg-info/10 border border-info/30 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                        <Warehouse className="h-3.5 w-3.5 text-info" />
                        <span className="text-[10px] font-bold text-info uppercase tracking-wider">Strata inventory</span>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Pinnacle Orbit 84" · refurb'd</div>
                        <div className="text-[10px] text-muted-foreground">Birmingham DC · stock #INV-04521</div>
                    </div>
                    <div className="mt-auto pt-2 border-t border-info/20 space-y-0.5 text-[11px]">
                        <div className="flex justify-between"><span className="text-muted-foreground">Unit price</span><span className="text-foreground tabular-nums">$6,900</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">In stock</span><span className="text-success font-semibold tabular-nums">4 units</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Lead time</span><span className="text-success font-semibold inline-flex items-center gap-1"><Truck className="h-3 w-3" />2 days</span></div>
                        <div className="flex justify-between pt-1 border-t border-info/20"><span className="font-bold text-foreground">Subtotal</span><span className="font-bold text-foreground tabular-nums">$13,800</span></div>
                    </div>
                </div>
            </div>

            <div className="bg-success/5 dark:bg-success/10 border border-success/30 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="text-xs">
                    <div className="font-bold text-foreground">Swap applies $3,000 in savings</div>
                    <div className="text-muted-foreground mt-0.5">Dimensions, finish (Black Oak), and base match — verified by Strata inventory AI.</div>
                </div>
                <span className="text-xl font-bold text-success tabular-nums shrink-0">−$3,000</span>
            </div>
        </div>
    )
}

