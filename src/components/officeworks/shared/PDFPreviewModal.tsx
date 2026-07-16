/**
 * COMPONENT: PDFPreviewModal
 * PURPOSE: Preview PDF assets inline (Officeworks docs: Audit Checklist,
 *          Design Checklist, Order Acknowledgment)
 *
 * Uses native <iframe> for PDF rendering — no new dependencies required.
 * Browser uses built-in PDF viewer.
 *
 * DS TOKENS: bg-background · bg-card · border-border · text-foreground
 */

import { Fragment } from 'react'
import { Dialog, Transition, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react'
import { X, Download, FileText, Maximize2 } from 'lucide-react'

interface PDFPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    pdfSrc: string
    title: string
    subtitle?: string
    /** Optional badge label (e.g. "Real document") */
    badge?: string
}

export default function PDFPreviewModal({ isOpen, onClose, pdfSrc, title, subtitle, badge }: PDFPreviewModalProps) {
    const handleOpenInNewTab = () => window.open(pdfSrc, '_blank', 'noopener,noreferrer')

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-5xl h-[90vh] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border bg-background">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <DialogTitle className="text-base font-semibold text-foreground truncate flex items-center gap-2">
                                            {title}
                                            {badge && (
                                                <span className="text-[10px] uppercase tracking-wider font-medium bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded">
                                                    {badge}
                                                </span>
                                            )}
                                        </DialogTitle>
                                        {subtitle && (
                                            <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleOpenInNewTab}
                                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-card hover:bg-muted text-sm text-foreground transition-colors"
                                        aria-label="Open in new tab"
                                    >
                                        <Maximize2 className="h-4 w-4" />
                                        <span className="hidden sm:inline">Open</span>
                                    </button>
                                    <a
                                        href={pdfSrc}
                                        download
                                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-card hover:bg-muted text-sm text-foreground transition-colors"
                                        aria-label="Download PDF"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span className="hidden sm:inline">Download</span>
                                    </a>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-border bg-card hover:bg-muted text-foreground transition-colors"
                                        aria-label="Close"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* PDF iframe */}
                            <div className="flex-1 bg-muted min-h-0">
                                <iframe
                                    src={pdfSrc}
                                    title={title}
                                    className="w-full h-full border-0"
                                    aria-label={`PDF preview: ${title}`}
                                />
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

/** Convenience helper: PDF asset paths (served from public/officeworks-pdfs/) */
export const OFFICEWORKS_PDFS = {
    poAcknowledgment: '/officeworks-pdfs/PO-DC-0009642.pdf',
    manattBOM:        '/officeworks-pdfs/MANATT-4F_BOM_v1.pdf',
    designChecklist:  '/officeworks-pdfs/OW_Design_Checklist_-_2026.pdf',
    auditChecklist:   '/officeworks-pdfs/OW_Audit_Checklist_-_2026.pdf',
} as const
