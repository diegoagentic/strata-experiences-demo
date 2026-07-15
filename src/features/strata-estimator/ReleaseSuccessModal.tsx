// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Release Success Modal
// Refinement Phase 1 (w2.2 closure) · v7 re-scoped
//
// Fires after the internal release checklist completes in w2.2 (SAC).
// Sober celebration:
//   · An SVG checkmark that strokes itself over 600 ms
//   · A single ring pulse (no confetti)
//   · Three metrics fade in staggered (8 hrs → 12 min, 4 tools → 1 app,
//     100 % audit trail)
//   · Primary CTA: "Hand off to Project Manager" → advances the demo
//     profile from w2.2 into w2.3 (Flow 2 · PM execution handoff)
//   · Secondary: Download PDF (internal audit trail)
// ═══════════════════════════════════════════════════════════════════════════════

import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { ArrowRight, Download } from 'lucide-react'
import { clsx } from 'clsx'
import AuditTrailPdfPreviewModal from './AuditTrailPdfPreviewModal'
import type { AuditEvent } from './AuditTrailPanel'
import { useDemo } from '../../context/DemoContext'

interface ReleaseSuccessModalProps {
    isOpen: boolean
    salesPrice: string
    clientName: string
    auditLog: AuditEvent[]
    onDownloadPdf: () => void
    onContinueToDelivery: () => void
}

interface MetricCard {
    before: string
    after: string
    label: string
}

const METRICS: MetricCard[] = [
    { before: '8 hrs', after: '12 min', label: 'Estimator time' },
    { before: '4 tools', after: '1 app',  label: 'Tools to build the estimate' },
    { before: '15 %',   after: '100 %',  label: 'Audit trail coverage' },
]

export default function ReleaseSuccessModal({
    isOpen,
    salesPrice,
    clientName,
    auditLog,
    onDownloadPdf,
    onContinueToDelivery,
}: ReleaseSuccessModalProps) {
    const [visibleMetrics, setVisibleMetrics] = useState(0)
    const [checkDrawn, setCheckDrawn] = useState(false)
    const [auditPdfOpen, setAuditPdfOpen] = useState(false)
    const { isDemoActive, isSidebarCollapsed } = useDemo()
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed
    const offsetClass = sidebarExpanded ? 'lg:left-80' : ''

    useEffect(() => {
        if (!isOpen) {
            setVisibleMetrics(0)
            setCheckDrawn(false)
            return
        }

        // Beat timeline:
        //   0 ms    → open
        //   100 ms  → start check stroke animation (CSS)
        //   800 ms  → metric 1
        //   1100 ms → metric 2
        //   1400 ms → metric 3
        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(() => setCheckDrawn(true), 100))
        timers.push(setTimeout(() => setVisibleMetrics(1), 800))
        timers.push(setTimeout(() => setVisibleMetrics(2), 1100))
        timers.push(setTimeout(() => setVisibleMetrics(3), 1400))
        return () => timers.forEach(clearTimeout)
    }, [isOpen])

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={() => {}}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className={clsx('fixed inset-0 bg-zinc-950/80 backdrop-blur-md', offsetClass)} />
                </TransitionChild>

                <div className={clsx('fixed inset-0 flex items-center justify-center p-4', offsetClass)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-xl bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-2xl overflow-hidden">

                            {/* Hero: SVG check + ring pulse */}
                            <div className="relative px-6 pt-10 pb-6 text-center overflow-hidden">
                                {/* Single ring pulse (sober, no confetti) */}
                                <div className="absolute inset-x-0 top-10 flex justify-center pointer-events-none">
                                    <div
                                        className="w-24 h-24 rounded-full bg-green-500/10 animate-ping"
                                        style={{ animationIterationCount: 1, animationDuration: '1.2s' }}
                                    />
                                </div>

                                {/* SVG checkmark — stroke-dashoffset animation */}
                                <div className="relative mx-auto w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
                                    <svg
                                        viewBox="0 0 52 52"
                                        className="w-10 h-10"
                                        aria-hidden
                                    >
                                        <path
                                            d="M14 27 L22 35 L38 18"
                                            fill="none"
                                            stroke="rgb(34 197 94)"
                                            strokeWidth={4}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            style={{
                                                strokeDasharray: 48,
                                                strokeDashoffset: checkDrawn ? 0 : 48,
                                                transition: 'stroke-dashoffset 600ms ease-out',
                                            }}
                                        />
                                    </svg>
                                </div>

                                <h2 className="mt-5 text-2xl font-bold text-foreground">
                                    Labor estimate released
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    ${salesPrice} labor estimate released into CORE · {clientName} queued for execution
                                </p>
                                <p className="text-[11px] text-muted-foreground/80 mt-1 font-mono">
                                    JPS_labor_estimate.pdf · full audit trail preserved
                                </p>
                            </div>

                            {/* Metrics — stagger fade-in */}
                            <div className="px-6 pb-6">
                                <div className="grid grid-cols-3 gap-3">
                                    {METRICS.map((m, i) => (
                                        <div
                                            key={m.label}
                                            className={[
                                                'rounded-xl bg-muted/40 px-3 py-3 text-center transition-all duration-500',
                                                i < visibleMetrics
                                                    ? 'opacity-100 translate-y-0'
                                                    : 'opacity-0 translate-y-2',
                                            ].join(' ')}
                                        >
                                            <div className="flex items-baseline justify-center gap-1.5">
                                                <span className="text-[11px] text-muted-foreground line-through tabular-nums">
                                                    {m.before}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">→</span>
                                                <span className="text-sm font-bold text-foreground tabular-nums">
                                                    {m.after}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                                                {m.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div className="flex items-center gap-2 px-6 py-4 border-t border-border bg-muted/20">
                                <button
                                    onClick={() => setAuditPdfOpen(true)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-auto"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Audit trail PDF
                                </button>
                                <button
                                    onClick={onContinueToDelivery}
                                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                >
                                    Hand off to Project Manager
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>

            {/* Audit trail PDF preview — opened from the secondary footer button */}
            <AuditTrailPdfPreviewModal
                isOpen={auditPdfOpen}
                events={auditLog}
                clientName={clientName}
                onClose={() => setAuditPdfOpen(false)}
                onDownload={onDownloadPdf}
            />
        </Transition>
    )
}
