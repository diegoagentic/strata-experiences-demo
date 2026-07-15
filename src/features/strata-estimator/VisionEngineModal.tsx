// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Vision Engine Modal (AI Import / Refine)
// Phase 8 of WRG Demo v6 implementation
//
// Two entry modes:
//   · Initial scan  — no prior file, user picks a spec document
//   · Refinement    — re-runs the Vision Engine on the last file + corrections
//
// On submit, simulates a 2-second analysis and returns 5 mock line items.
// ═══════════════════════════════════════════════════════════════════════════════

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { Loader2, Sparkles, Upload, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useDemo } from '../../context/DemoContext'
import type { LineItem } from './types'

interface VisionEngineModalProps {
    isOpen: boolean
    onClose: () => void
    onItemsExtracted: (items: LineItem[], fileName: string) => void
    lastFile: { name: string } | null
}

type ModalState = 'idle' | 'analyzing'

// ── Mock extraction payload (simulates AI output) ────────────────────────────
const MOCK_EXTRACTED: LineItem[] = [
    {
        id: 'ai-1',
        categoryId: 'SYSTEMS',
        subCategoryId: 'SYS_TYP',
        description: 'MillerKnoll Canvas — 6x6 standard workstation, Level 1',
        quantity: 42,
    },
    {
        id: 'ai-2',
        categoryId: 'PRIVATE_OFFICE',
        subCategoryId: 'PO_LAM',
        description: 'Geiger Foley casegoods — laminate L-shape desk',
        quantity: 14,
    },
    {
        id: 'ai-3',
        categoryId: 'TASK_SEATING',
        subCategoryId: 'SEAT_TASK',
        description: 'Herman Miller Aeron — size B, fully adjustable',
        quantity: 119,
    },
    {
        id: 'ai-4',
        categoryId: 'CONFERENCE',
        subCategoryId: 'TAB_LG',
        description: 'Geiger Axon — 14ft multi-section conference table',
        quantity: 3,
    },
    {
        id: 'ai-5',
        categoryId: 'ANCILLARY',
        subCategoryId: 'LOUNGE_SOFA',
        description: 'OFS Serpentine — 12-seat modular lounge (custom)',
        quantity: 1,
    },
]

export default function VisionEngineModal({
    isOpen,
    onClose,
    onItemsExtracted,
    lastFile,
}: VisionEngineModalProps) {
    const isRefinement = !!lastFile
    const [state, setState] = useState<ModalState>('idle')
    const [corrections, setCorrections] = useState('')
    const [selectedFile, setSelectedFile] = useState<{ name: string } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Reset internal state whenever the modal opens
    useEffect(() => {
        if (!isOpen) return
        setState('idle')
        setCorrections('')
        setSelectedFile(null)
    }, [isOpen])

    const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) setSelectedFile({ name: file.name })
    }

    const handleSubmit = () => {
        const fileName = isRefinement
            ? lastFile!.name
            : selectedFile?.name ?? 'spec-document.pdf'

        setState('analyzing')
        setTimeout(() => {
            onItemsExtracted(MOCK_EXTRACTED, fileName)
            onClose()
        }, 2000)
    }

    const canSubmit =
        state === 'idle' && (isRefinement ? corrections.trim().length > 0 : !!selectedFile)

    const subtitle = isRefinement ? 'Refinement Mode' : 'Deep Spec Scan'

    const { isDemoActive, isSidebarCollapsed } = useDemo()
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed
    const offsetClass = sidebarExpanded ? 'lg:left-80' : ''

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={state === 'analyzing' ? () => {} : onClose}>
                {/* Backdrop */}
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

                {/* Panel container */}
                <div className={clsx('fixed inset-0 flex items-center justify-center p-4', offsetClass)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-2xl bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="flex items-start gap-4 px-6 py-5 border-b border-border">
                                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-base font-bold text-foreground">
                                        Strata Vision Engine
                                    </DialogTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {subtitle}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    disabled={state === 'analyzing'}
                                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors disabled:opacity-30"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                {state === 'analyzing' ? (
                                    <div className="flex flex-col items-center justify-center py-10">
                                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                                        <p className="text-sm font-semibold text-foreground">
                                            Analyzing spec document…
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Extracting line items, quantities, and categories
                                        </p>
                                    </div>
                                ) : isRefinement ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border">
                                            <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    Last File
                                                </p>
                                                <p className="text-xs font-medium text-foreground truncate">
                                                    {lastFile!.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                Corrections / additional context
                                            </label>
                                            <textarea
                                                value={corrections}
                                                onChange={(e) => setCorrections(e.target.value)}
                                                rows={4}
                                                placeholder="e.g. Row 19 should be classified as Ancillary / Lounge, not Conference…"
                                                className="mt-2 w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block border-2 border-dashed border-border rounded-2xl px-6 py-10 text-center cursor-pointer hover:border-primary/60 transition-colors">
                                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                                            <p className="text-sm font-semibold text-foreground">
                                                {selectedFile ? selectedFile.name : 'Select Spec Document'}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                PDF or image · AI will extract line items
                                            </p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf,image/*"
                                                className="hidden"
                                                onChange={handleFilePick}
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
                                <button
                                    onClick={onClose}
                                    disabled={state === 'analyzing'}
                                    className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit}
                                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {isRefinement ? 'Refine' : 'Analyze'}
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
