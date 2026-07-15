// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Verification PDF Preview Modal
// v7 · w1.2 preview · adapted from WrgLaborEstimation.tsx L1294-1339
//
// Simple centred modal that previews the Design Verification Report the
// Designer would send back to the Expert. Reused pattern from the older
// WrgLaborEstimation demo — same styling (headless white / zinc-900 card,
// zinc header strip, muted footer with Close / Download) so the visual
// language matches what the rest of the demo family has been using.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect } from 'react'
import { clsx } from 'clsx'
import { CheckCircle2, Clock, Download, X } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'

export interface VerificationModuleSummary {
    id: string
    title: string
    subtitle: string
    required: boolean
    status: 'approved' | 'pending'
    selectedLabel?: string
}

interface VerificationPdfPreviewModalProps {
    isOpen: boolean
    modules: VerificationModuleSummary[]
    designerName: string
    projectName: string
    onClose: () => void
    onDownload?: () => void
}

export default function VerificationPdfPreviewModal({
    isOpen,
    modules,
    designerName,
    projectName,
    onClose,
    onDownload,
}: VerificationPdfPreviewModalProps) {
    const { isDemoActive, isSidebarCollapsed } = useDemo()
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed
    const offsetClass = sidebarExpanded ? 'lg:left-80' : ''

    // Close on Escape
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
    const approvedCount = modules.filter((m) => m.status === 'approved').length

    return (
        <div
            className={clsx(
                'fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200 p-4',
                offsetClass
            )}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-pdf-title"
        >
            <div
                className="w-full max-w-2xl max-h-[85vh] bg-card dark:bg-zinc-900 rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Paper header */}
                <div className="px-6 py-4 bg-muted/40 border-b border-border flex items-center justify-between shrink-0">
                    <div>
                        <p
                            id="verification-pdf-title"
                            className="text-sm font-bold text-foreground uppercase tracking-wider"
                        >
                            Design Verification Report
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            {projectName} · {today}
                        </p>
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
                    {/* Summary line */}
                    <div className="rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 px-4 py-3 flex items-center gap-3">
                        <span className="shrink-0 w-9 h-9 rounded-full bg-primary/15 text-foreground dark:text-primary flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                                Verification summary
                            </p>
                            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
                                {approvedCount} of {modules.length} modules
                                approved
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Verified by {designerName} · Designer
                            </p>
                        </div>
                    </div>

                    {/* Modules list */}
                    <div className="space-y-3">
                        {modules.map((mod) => {
                            const ok = mod.status === 'approved'
                            return (
                                <section
                                    key={mod.id}
                                    className="space-y-1.5 pb-3 border-b border-border last:border-b-0"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <p className="text-[11px] font-bold text-foreground uppercase tracking-wider truncate">
                                                {mod.title}
                                            </p>
                                            {mod.required && (
                                                <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                                    Required
                                                </span>
                                            )}
                                        </div>
                                        <span
                                            className={clsx(
                                                'shrink-0 flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border',
                                                ok
                                                    ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30'
                                                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                            )}
                                        >
                                            {ok ? (
                                                <CheckCircle2 className="w-2.5 h-2.5" />
                                            ) : (
                                                <Clock className="w-2.5 h-2.5" />
                                            )}
                                            {ok ? 'Validated' : 'Pending'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-snug">
                                        {mod.subtitle}
                                    </p>
                                    {mod.selectedLabel && (
                                        <div className="mt-1 px-3 py-2 rounded-lg bg-indigo-500/5 dark:bg-indigo-500/10 border-l-2 border-indigo-500/60">
                                            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 leading-none">
                                                Designer decision
                                            </p>
                                            <p className="text-[11px] text-foreground mt-0.5 leading-snug">
                                                {mod.selectedLabel}
                                            </p>
                                        </div>
                                    )}
                                </section>
                            )
                        })}
                    </div>

                    {/* Audit note */}
                    <p className="text-[10px] text-muted-foreground italic text-center">
                        This document is part of the Strata audit trail and
                        will be written back to CORE on release.
                    </p>
                </div>

                {/* Paper footer */}
                <div className="px-6 py-3 bg-muted/30 border-t border-border flex items-center justify-between shrink-0">
                    <p className="text-[9px] text-muted-foreground">
                        Signed by {designerName} · {today}
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
