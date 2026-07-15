/**
 * TransactionInfoCard · secondary information card for transaction detail views
 *
 * Holds the SECONDARY data that used to saturate the detail header: KPI
 * metrics, a prominent current status, the full workflow stepper, reference
 * IDs, and custom chips (source traceability, sales rep, revision).
 *
 * Progressive disclosure: metrics + current status are always visible; the
 * heavier detail (workflow, references, chips) sits behind a "Show more"
 * toggle so the user isn't overwhelmed on open. Pairs with
 * <TransactionStickyHeader /> (primary). Reusable across Order/Ack/Quote.
 */

import { useState } from 'react'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, ClockIcon } from '@heroicons/react/24/outline'
import type { ReactNode } from 'react'

export type MetricTone = 'default' | 'warning' | 'info' | 'success' | 'brand'

const METRIC_TEXT: Record<MetricTone, string> = {
    default: 'text-foreground',
    warning: 'text-warning',
    info: 'text-info',
    success: 'text-success',
    brand: 'text-brand',
}

// Subtle tinted surface for the prominent Status cell, by tone.
const STATUS_TINT: Record<MetricTone, string> = {
    default: 'bg-muted/40 border-border',
    warning: 'bg-warning/5 border-warning/30',
    info: 'bg-info/5 border-info/30',
    success: 'bg-success/5 border-success/30',
    brand: 'bg-brand/5 border-brand/30',
}

export type StepStatus = 'completed' | 'current' | 'pending'

interface TransactionInfoCardProps {
    title?: string
    metrics: { label: string; value: ReactNode; tone?: MetricTone }[]
    /** Prominent current status shown beside the metrics (always visible) */
    currentStatus?: { label: ReactNode; tone?: MetricTone }
    references?: { label: string; value: ReactNode; mono?: boolean }[]
    /** Cross-document workflow stepper. `meta` adds a tooltip with date/id so the same row
     *  doubles as a cross-document trace (Post-Neocon-review 2026-06-05 · replaces the
     *  separate Transactions Timeline card to avoid duplicating the lifecycle in two places). */
    workflow?: { label?: string; steps: { name: string; status: StepStatus; meta?: string }[] }
    /** Render the card already expanded. Useful when the page also surfaces a primary CTA
     *  (e.g. Generate Proforma on PO detail) — the workflow/history makes sense up-front
     *  there so the user has full context before clicking. */
    defaultExpanded?: boolean
    /** Slot for custom chips: source traceability, sales rep, revision, etc. */
    children?: ReactNode
}

export default function TransactionInfoCard({
    title = 'Order Information',
    metrics,
    currentStatus,
    references,
    workflow,
    defaultExpanded = false,
    children,
}: TransactionInfoCardProps) {
    const [expanded, setExpanded] = useState(defaultExpanded)
    // children (Source/SalesRep/Rev) are now always visible — only workflow + references gate "Show more".
    const hasMore = Boolean(workflow || (references && references.length > 0))

    return (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            {title && (
                <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
            )}

            {/* Always visible: metrics + prominent current status — one even row, no gaps */}
            <div className="flex flex-wrap gap-2.5">
                {metrics.map((m, i) => (
                    <div key={i} className="flex-1 min-w-[130px] bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                            {m.label}
                        </p>
                        <p className={`text-base font-semibold tracking-tight ${METRIC_TEXT[m.tone ?? 'default']}`}>
                            {m.value}
                        </p>
                    </div>
                ))}
                {currentStatus && (
                    <div className={`flex-1 min-w-[150px] rounded-xl border px-3 py-2.5 ${STATUS_TINT[currentStatus.tone ?? 'default']}`}>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                            Status
                        </p>
                        <p className={`text-base font-semibold tracking-tight ${METRIC_TEXT[currentStatus.tone ?? 'default']}`}>
                            {currentStatus.label}
                        </p>
                    </div>
                )}
            </div>

            {/* Priority identity (Source · Sales Rep · Rev) — always visible, at the metrics level */}
            {children && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                    {children}
                </div>
            )}

            {/* Show history — collapsed only.
                Neutral outline styling (Neocon-review browser-smoke 2026-06-05): same visual treatment
                as Hide history below, so the toggle reads as a single control and doesn't compete with
                primary CTAs (Generate Proforma) sitting just above it on the right edge. */}
            {hasMore && !expanded && (
                <div className="mt-2 flex justify-end">
                    <button
                        type="button"
                        onClick={() => setExpanded(true)}
                        aria-expanded={false}
                        title="View workflow + cross-document history"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted/50 hover:border-foreground/30 transition-colors"
                    >
                        <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                        Show history
                        <ChevronDownIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    </button>
                </div>
            )}

            {/* Expandable detail · compact horizontal workflow + dense inline chips */}
            {expanded && (
                <>
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                        {/* Workflow · compact horizontal, packed left (wraps if needed) */}
                        {workflow && (
                            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                                    {workflow.label ?? 'Workflow'}
                                </span>
                                {workflow.steps.map((step, i) => {
                                    const active = step.status === 'completed' || step.status === 'current'
                                    // Tooltip surfaces the cross-document trace (date + linked id) on hover (post-Neocon).
                                    const tooltip = step.meta ? `${step.name} · ${step.meta}` : step.name
                                    return (
                                        <span key={i} className="inline-flex items-center gap-1.5">
                                            <span className="inline-flex items-center gap-1 cursor-help" title={tooltip}>
                                                <span className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                    {step.status === 'completed' ? (
                                                        <CheckIcon className="w-2.5 h-2.5" />
                                                    ) : step.status === 'current' ? (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                                    ) : (
                                                        <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                                    )}
                                                </span>
                                                <span className={`text-xs ${step.status === 'current' ? 'font-semibold text-foreground' : active ? 'font-medium text-foreground' : 'font-medium text-muted-foreground'}`}>{step.name}</span>
                                                {step.meta && (
                                                    <span className="text-[10px] text-muted-foreground/80 font-normal tabular-nums">· {step.meta}</span>
                                                )}
                                            </span>
                                            {i < workflow.steps.length - 1 && <span className="w-3 h-px bg-border shrink-0" aria-hidden="true" />}
                                        </span>
                                    )
                                })}
                            </div>
                        )}

                        {/* Reference IDs · dense inline row, no whitespace gaps */}
                        {references && references.length > 0 && (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-3 border-t border-border">
                                {references.map((ref, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 text-xs">
                                        <span className="text-muted-foreground">{ref.label}</span>
                                        {ref.mono ? (
                                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground border border-border">{ref.value}</span>
                                        ) : (
                                            <span className="font-medium text-foreground">{ref.value}</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Hide history — symmetric styling with Show history above so the open/close pair feels
                        like one control, not two. */}
                    {hasMore && (
                        <div className="mt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setExpanded(false)}
                                aria-expanded={true}
                                title="Hide workflow + cross-document history"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted/50 hover:border-foreground/30 transition-colors"
                            >
                                <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                                Hide history
                                <ChevronUpIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
