// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — SIF Export Modal
// Simulates the processing and conversion of the current project into a
// SIF (Strata Interchange Format) file. Shows a multi-phase progress
// animation, then a success toast with preview + download actions.
//
// Phases:
//   preparing   → gathering project data (dossier, BoM, constraints)
//   converting  → converting to SIF schema
//   validating  → running integrity checks
//   packaging   → compressing + signing
//   done        → success with preview + download CTAs
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState, Fragment } from 'react'
import { clsx } from 'clsx'
import {
    Check,
    CheckCircle2,
    Download,
    Eye,
    FileCode2,
    Loader2,
    Package,
    ShieldCheck,
    X,
} from 'lucide-react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { useDemo } from '../../context/DemoContext'

export type SifPhase = 'preparing' | 'converting' | 'validating' | 'packaging' | 'done'

interface SifExportModalProps {
    isOpen: boolean
    projectName: string
    itemCount: number
    onClose: () => void
    onPreview: () => void
}

const PHASES: Array<{ id: SifPhase; label: string; detail: string }> = [
    { id: 'preparing', label: 'Gathering project data', detail: 'Dossier, Bill of Materials, constraints, calculations' },
    { id: 'converting', label: 'Converting to SIF schema', detail: 'Mapping line items, financials, and metadata to Strata Interchange Format' },
    { id: 'validating', label: 'Running integrity checks', detail: 'Verifying totals, scope limits, and audit trail completeness' },
    { id: 'packaging', label: 'Compressing + signing', detail: 'Creating signed .sif package with embedded checksums' },
    { id: 'done', label: 'Export complete', detail: 'JPS_Health_Network.sif ready for download' },
]

export default function SifExportModal({
    isOpen,
    projectName,
    itemCount,
    onClose,
    onPreview,
}: SifExportModalProps) {
    const [phase, setPhase] = useState<SifPhase>('preparing')
    const [progress, setProgress] = useState(0)

    const { isDemoActive, isSidebarCollapsed } = useDemo()
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed
    const offsetClass = sidebarExpanded ? 'lg:left-80' : ''

    useEffect(() => {
        if (!isOpen) {
            setPhase('preparing')
            setProgress(0)
            return
        }

        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(() => { setPhase('preparing'); setProgress(10) }, 200))
        timers.push(setTimeout(() => { setProgress(25) }, 600))
        timers.push(setTimeout(() => { setPhase('converting'); setProgress(40) }, 1200))
        timers.push(setTimeout(() => { setProgress(55) }, 1800))
        timers.push(setTimeout(() => { setPhase('validating'); setProgress(70) }, 2400))
        timers.push(setTimeout(() => { setProgress(85) }, 3000))
        timers.push(setTimeout(() => { setPhase('packaging'); setProgress(92) }, 3400))
        timers.push(setTimeout(() => { setPhase('done'); setProgress(100) }, 4200))
        return () => timers.forEach(clearTimeout)
    }, [isOpen])

    const isDone = phase === 'done'
    const currentPhaseIndex = PHASES.findIndex((p) => p.id === phase)

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={isDone ? onClose : () => {}}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className={clsx('fixed inset-0 bg-zinc-950/70 backdrop-blur-sm', offsetClass)} />
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
                        <DialogPanel className="w-full max-w-lg bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="flex items-start gap-4 px-6 py-5 border-b border-border">
                                <div className={clsx(
                                    'p-3 rounded-xl shrink-0',
                                    isDone ? 'bg-green-500/10' : 'bg-primary/10'
                                )}>
                                    {isDone ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <FileCode2 className="w-5 h-5 text-foreground dark:text-primary" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-base font-bold text-foreground">
                                        {isDone ? 'SIF Export Complete' : 'Exporting to SIF'}
                                    </DialogTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {projectName} · {itemCount} line items
                                    </p>
                                </div>
                                {isDone && (
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Progress bar */}
                            <div className="px-6 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        Progress
                                    </span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider tabular-nums">
                                        {Math.round(progress)}%
                                    </span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={clsx(
                                            'h-full transition-all duration-500 ease-out',
                                            isDone ? 'bg-green-500' : 'bg-primary'
                                        )}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Phase steps */}
                            <div className="px-6 py-5 space-y-3">
                                {PHASES.map((p, i) => {
                                    const isActive = i === currentPhaseIndex
                                    const isComplete = i < currentPhaseIndex || isDone
                                    return (
                                        <div
                                            key={p.id}
                                            className={clsx(
                                                'flex items-start gap-3 transition-opacity duration-300',
                                                !isActive && !isComplete && 'opacity-40'
                                            )}
                                        >
                                            <div className="shrink-0 mt-0.5">
                                                {isComplete ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                ) : isActive ? (
                                                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full border-2 border-border" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={clsx(
                                                    'text-xs font-semibold leading-tight',
                                                    isActive ? 'text-foreground' : isComplete ? 'text-muted-foreground' : 'text-muted-foreground/60'
                                                )}>
                                                    {p.label}
                                                </p>
                                                {(isActive || isComplete) && (
                                                    <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                                                        {p.detail}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Success footer with file info + actions */}
                            {isDone && (
                                <div className="px-6 py-4 border-t border-border bg-muted/20 space-y-3 animate-in fade-in duration-300">
                                    {/* File card */}
                                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card dark:bg-zinc-900 border border-border">
                                        <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <FileCode2 className="w-5 h-5 text-foreground dark:text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-foreground truncate">
                                                {projectName.replace(/\s+/g, '_')}.sif
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                SIF v2.1 · {itemCount} items · signed · {(Math.random() * 200 + 50).toFixed(0)} KB
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <ShieldCheck className="w-3 h-3 text-green-600 dark:text-green-400" />
                                            <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                                                Verified
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={onPreview}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Preview SIF
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Download .sif
                                        </button>
                                    </div>
                                </div>
                            )}
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
