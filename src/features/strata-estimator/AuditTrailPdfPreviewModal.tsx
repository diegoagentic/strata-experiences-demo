// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Audit Trail PDF Preview Modal
// v7 · opened from the ReleaseSuccessModal's "Audit trail PDF" secondary button
//
// Paper-styled preview that lists every event logged by the Shell during
// the current session, grouped by category. Same visual pattern as
// VerificationPdfPreviewModal / ProposalPdfPreviewModal for consistency.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect } from 'react'
import { clsx } from 'clsx'
import {
    Activity,
    Download,
    ShieldCheck,
    Sparkles,
    User,
    UserCheck,
    X,
} from 'lucide-react'
import type { AuditCategory, AuditEvent } from './AuditTrailPanel'
import { useDemo } from '../../context/DemoContext'

interface AuditTrailPdfPreviewModalProps {
    isOpen: boolean
    events: AuditEvent[]
    clientName: string
    onClose: () => void
    onDownload?: () => void
}

const CATEGORY_META: Record<
    AuditCategory,
    { icon: typeof Sparkles; label: string; tone: string }
> = {
    system: {
        icon: Activity,
        label: 'System',
        tone: 'text-muted-foreground',
    },
    ai: {
        icon: Sparkles,
        label: 'AI Agent',
        tone: 'text-indigo-600 dark:text-indigo-400',
    },
    edit: {
        icon: User,
        label: 'User Edit',
        tone: 'text-blue-600 dark:text-blue-400',
    },
    approval: {
        icon: UserCheck,
        label: 'Approval',
        tone: 'text-green-600 dark:text-green-400',
    },
    release: {
        icon: ShieldCheck,
        label: 'Release',
        tone: 'text-foreground dark:text-primary',
    },
}

function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

export default function AuditTrailPdfPreviewModal({
    isOpen,
    events,
    clientName,
    onClose,
    onDownload,
}: AuditTrailPdfPreviewModalProps) {
    const { isDemoActive, isSidebarCollapsed } = useDemo()
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed
    const offsetClass = sidebarExpanded ? 'lg:left-80' : ''

    useEffect(() => {
        if (!isOpen) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const today = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })

    // Count events per category for the summary line
    const counts = events.reduce<Record<AuditCategory, number>>(
        (acc, ev) => ({ ...acc, [ev.category]: (acc[ev.category] ?? 0) + 1 }),
        { system: 0, ai: 0, edit: 0, approval: 0, release: 0 }
    )

    return (
        <div
            className={clsx(
                'fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200 p-4',
                offsetClass
            )}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-pdf-title"
        >
            <div
                className="w-full max-w-2xl max-h-[85vh] bg-card dark:bg-zinc-900 rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Paper header */}
                <div className="px-6 py-4 bg-muted/40 border-b border-border flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-foreground dark:text-primary flex items-center justify-center">
                            <Activity className="w-5 h-5" />
                        </span>
                        <div>
                            <p
                                id="audit-pdf-title"
                                className="text-sm font-bold text-foreground uppercase tracking-wider"
                            >
                                Audit Trail Report
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                {clientName} · {today}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Close preview"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Paper body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-minimal">

                    {/* Summary card */}
                    <div className="rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 px-4 py-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                            Session summary
                        </p>
                        <p className="text-sm font-bold text-foreground leading-tight mt-1">
                            {events.length} events logged
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            From session open to proposal release · every AI
                            decision, user edit and approval is signed and
                            timestamped.
                        </p>

                        {/* Category counts */}
                        <div className="flex items-center gap-2 flex-wrap mt-3">
                            {(Object.keys(CATEGORY_META) as AuditCategory[]).map(
                                (cat) => {
                                    const meta = CATEGORY_META[cat]
                                    const Icon = meta.icon
                                    if (counts[cat] === 0) return null
                                    return (
                                        <span
                                            key={cat}
                                            className={clsx(
                                                'flex items-center gap-1 px-2 py-1 rounded-full bg-card dark:bg-zinc-800 border border-border text-[10px] font-bold uppercase tracking-wider',
                                                meta.tone
                                            )}
                                        >
                                            <Icon className="w-2.5 h-2.5" />
                                            {counts[cat]} {meta.label}
                                        </span>
                                    )
                                }
                            )}
                        </div>
                    </div>

                    {/* Event timeline */}
                    <section className="space-y-2">
                        <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                            Full event log
                        </p>
                        {events.length === 0 ? (
                            <p className="px-3 py-4 text-center text-[11px] text-muted-foreground">
                                No events logged yet.
                            </p>
                        ) : (
                            <ol className="relative border-l-2 border-border ml-1.5 space-y-3 pl-4">
                                {events.map((event) => {
                                    const meta = CATEGORY_META[event.category]
                                    const Icon = meta.icon
                                    return (
                                        <li
                                            key={event.id}
                                            className="relative"
                                        >
                                            {/* Dot on the timeline */}
                                            <span
                                                className={clsx(
                                                    'absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full bg-card dark:bg-zinc-900 border-2 flex items-center justify-center',
                                                    meta.tone,
                                                    event.category === 'release'
                                                        ? 'border-primary'
                                                        : 'border-border'
                                                )}
                                            />
                                            <div className="flex items-start gap-2">
                                                <span
                                                    className={clsx(
                                                        'shrink-0 w-5 h-5 rounded-md bg-muted/60 flex items-center justify-center mt-0.5',
                                                        meta.tone
                                                    )}
                                                >
                                                    <Icon className="w-3 h-3" />
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline justify-between gap-2">
                                                        <p className="text-[11px] text-foreground font-semibold leading-tight">
                                                            {event.action}
                                                        </p>
                                                        <span className="shrink-0 text-[9px] font-mono text-muted-foreground">
                                                            {formatTime(event.timestamp)}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                                                        <span
                                                            className={clsx(
                                                                'font-bold uppercase tracking-wider',
                                                                meta.tone
                                                            )}
                                                        >
                                                            {meta.label}
                                                        </span>
                                                        <span> · {event.actor}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ol>
                        )}
                    </section>

                    <p className="text-[10px] text-muted-foreground italic text-center">
                        This report is written back to CORE with the released
                        proposal and preserved for compliance reviews.
                    </p>
                </div>

                {/* Paper footer */}
                <div className="px-6 py-3 bg-muted/30 border-t border-border flex items-center justify-between shrink-0">
                    <p className="text-[9px] text-muted-foreground">
                        Generated by Strata Estimator · {today}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onDownload?.()
                                onClose()
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                            <Download className="w-3 h-3" />
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
