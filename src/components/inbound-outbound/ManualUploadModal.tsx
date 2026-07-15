/**
 * COMPONENT: ManualUploadModal
 * PURPOSE: Edge-case manual upload for RFQ + PO tabs (Wendy decision Neocon-review 2026-06-05).
 *          The primary ingestion channel is the monitored Inbox (Email/Dealer Portal/NetSuite),
 *          but Christian (8:11) clarified Manual is valid when a doc arrived outside the standard
 *          channels (e.g. WhatsApp, scanned fax). Wendy approved this for RFQ + PO specifically
 *          (transcript 6:07): "in request for quote as well as purchase orders we should show
 *          an upload document".
 *
 * SCOPE: Only RFQ tab + PO tab (NOT Quotes, NOT Acks · those are outbound, manufacturer creates
 *        them internally rather than uploading).
 *
 * FLOW: 4-step state machine (Drop → Review → Uploading → Complete).
 *       Reuses the QuoteConverter pattern but contextual to RFQ or PO.
 *
 * ROLE-AWARE COPY (TBD #8 closed): manufacturer view shows "for documents not received via Inbox"
 *        whereas dealer view (via useViewAs) would show "send to manufacturer".
 *
 * USAGE: <ManualUploadModal isOpen={...} docType="RFQ" onClose={...} onSuccess={...} />
 */

import { Fragment, useState, useRef, useCallback } from 'react'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Upload, X, FileText, CheckCircle2, Loader2 } from 'lucide-react'

type DocType = 'RFQ' | 'PO'
type UploadStep = 'select' | 'review' | 'uploading' | 'complete'

interface ManualUploadModalProps {
    isOpen: boolean
    docType: DocType
    /** If true, copy framing is "send to manufacturer" (dealer view). Otherwise "for documents not received via Inbox" (manufacturer edge-case). */
    isDealerView?: boolean
    onClose: () => void
    /** Called when the user clicks Done after a successful upload. Receives the doc count for downstream toasts/state updates. */
    onSuccess?: (count: number) => void
}

function isValidPdf(file: File): boolean {
    return file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
}

export default function ManualUploadModal({ isOpen, docType, isDealerView = false, onClose, onSuccess }: ManualUploadModalProps) {
    const [step, setStep] = useState<UploadStep>('select')
    const [files, setFiles] = useState<File[]>([])
    const [dragging, setDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const validCount = files.filter(isValidPdf).length

    const resetAndClose = useCallback(() => {
        setStep('select')
        setFiles([])
        setDragging(false)
        onClose()
    }, [onClose])

    const handleAddFiles = useCallback((incoming: FileList | File[]) => {
        const list = Array.from(incoming)
        setFiles(prev => [...prev, ...list])
        if (list.some(isValidPdf)) setStep('review')
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        if (e.dataTransfer.files.length > 0) {
            handleAddFiles(e.dataTransfer.files)
        }
    }, [handleAddFiles])

    const handleRemove = useCallback((index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }, [])

    const startUpload = useCallback(() => {
        setStep('uploading')
        // Simulate 4s upload pipeline then resolve to "Ingesting" terminal.
        setTimeout(() => setStep('complete'), 4_000)
    }, [])

    const finishAndClose = useCallback(() => {
        onSuccess?.(validCount)
        resetAndClose()
    }, [onSuccess, validCount, resetAndClose])

    const subLabel = isDealerView ? 'send to manufacturer' : 'for documents not received via Inbox'
    const title = `Upload ${docType}`

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={resetAndClose} className="relative z-[200]">
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
                                <header className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-sm font-bold text-foreground">{title}</h2>
                                        <p className="text-xs text-muted-foreground mt-0.5">{subLabel}</p>
                                    </div>
                                    <button onClick={resetAndClose} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground" aria-label="Close upload modal">
                                        <X className="w-4 h-4" />
                                    </button>
                                </header>

                                {step === 'select' && (
                                    <div className="p-5">
                                        <div
                                            onDragOver={e => { e.preventDefault(); setDragging(true) }}
                                            onDragLeave={() => setDragging(false)}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-info bg-info/5' : 'border-border hover:border-info/50 hover:bg-muted/30'}`}
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`Drop ${docType} PDF files here or click to select`}
                                        >
                                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
                                            <p className="text-sm font-semibold text-foreground">Drop {docType} PDF files here</p>
                                            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                accept="application/pdf,.pdf"
                                                className="hidden"
                                                onChange={e => e.target.files && handleAddFiles(e.target.files)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {step === 'review' && (
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-foreground">{validCount} {docType} file{validCount === 1 ? '' : 's'} selected</h3>
                                            <button onClick={() => fileInputRef.current?.click()} className="text-xs text-info hover:underline">Add more</button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                accept="application/pdf,.pdf"
                                                className="hidden"
                                                onChange={e => e.target.files && handleAddFiles(e.target.files)}
                                            />
                                        </div>
                                        <ul className="border border-border rounded-lg divide-y divide-border max-h-60 overflow-y-auto">
                                            {files.map((f, i) => (
                                                <li key={`${f.name}-${i}`} className="px-3 py-2 flex items-center gap-2 text-xs">
                                                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                                                    <span className="flex-1 truncate text-foreground">{f.name}</span>
                                                    {!isValidPdf(f) && <span className="text-destructive text-[10px] font-bold uppercase">not PDF</span>}
                                                    <button onClick={() => handleRemove(i)} className="p-0.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground" aria-label={`Remove ${f.name}`}>
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex items-center justify-end gap-2 mt-4">
                                            <button onClick={resetAndClose} className="px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground">Cancel</button>
                                            <button
                                                onClick={startUpload}
                                                disabled={validCount === 0}
                                                className="px-4 py-2 text-xs font-bold rounded-md bg-brand-500 text-zinc-900 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Upload {validCount} {docType} file{validCount === 1 ? '' : 's'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 'uploading' && (
                                    <div className="p-8 text-center">
                                        <Loader2 className="w-10 h-10 text-info animate-spin mx-auto mb-3" aria-hidden="true" />
                                        <p className="text-sm font-semibold text-foreground">Uploading {validCount} {docType} file{validCount === 1 ? '' : 's'}…</p>
                                        <p className="text-xs text-muted-foreground mt-1">Processing PDF{validCount === 1 ? '' : 's'} for ingestion</p>
                                    </div>
                                )}

                                {step === 'complete' && (
                                    <div className="p-8 text-center">
                                        <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" aria-hidden="true" />
                                        <p className="text-sm font-semibold text-foreground">{validCount} {docType} uploaded successfully</p>
                                        <p className="text-xs text-muted-foreground mt-1">Status: <span className="font-semibold text-info">Ingesting</span></p>
                                        <p className="text-[11px] text-muted-foreground mt-3">Documents will appear in the {docType} tab with source <span className="font-semibold">Manual</span>.</p>
                                        <div className="flex items-center justify-center gap-2 mt-4">
                                            <button onClick={() => { setStep('select'); setFiles([]) }} className="px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground">Upload more</button>
                                            <button onClick={finishAndClose} className="px-4 py-2 text-xs font-bold rounded-md bg-brand-500 text-zinc-900 hover:bg-brand-400">Done</button>
                                        </div>
                                    </div>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
