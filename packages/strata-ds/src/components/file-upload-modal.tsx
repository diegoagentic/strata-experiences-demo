/**
 * FileUploadModal — Headless UI port of the canonical DS FileUploadModal.
 *
 * Same prop API as `Strata Design System/strata-ds/src/components/overlays/file-upload-modal.tsx`.
 * Implementation uses @headlessui/react (Dialog + Transition) because this is
 * the catalyst-vendored DS for inbound-outbound (which does not ship Radix).
 *
 * Call sites stay portable: when the consumer eventually swaps to the
 * canonical DS, only the import path changes — the JSX is identical.
 *
 * Source pattern: this file replaces the duplicated UploadModal subtree in:
 *   src/QuoteConverter.tsx              (lines 478-720, ~240 LOC)
 *   src/components/inbound-outbound/ManualUploadModal.tsx (~200 LOC)
 *   src/components/AcknowledgementUploadModal.tsx (similar pattern)
 */

import { Fragment, useCallback, useMemo, useRef, useState } from 'react'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Upload, FileText, Plus, X, CheckCircle2 } from 'lucide-react'

const cn = (...parts: (string | false | null | undefined)[]) =>
    parts.filter(Boolean).join(' ')

export type FileUploadStep = 'select' | 'selected' | 'uploading' | 'complete'

export interface FileUploadModalProps {
    open: boolean
    step: FileUploadStep
    files: File[]
    validate?: (file: File) => string | null
    accept?: string
    multiple?: boolean
    selectTitle?: string
    selectSubtitle?: string
    itemNoun?: string

    onClose: () => void
    onAddFiles: (files: File[]) => void
    onRemoveFile: (index: number) => void
    onStartUpload: () => void
    onFinish: () => void
    onUploadMore?: () => void
}

export function FileUploadModal({
    open,
    step,
    files,
    validate,
    accept = '.pdf,application/pdf',
    multiple = true,
    selectTitle = 'Upload Documents',
    selectSubtitle = 'PDF files up to 10MB each',
    itemNoun = 'Document',
    onClose,
    onAddFiles,
    onRemoveFile,
    onStartUpload,
    onFinish,
    onUploadMore,
}: FileUploadModalProps) {
    const fileError = useCallback(
        (f: File) => (validate ? validate(f) : null),
        [validate],
    )
    const validFiles = useMemo(
        () => files.filter((f) => fileError(f) === null),
        [files, fileError],
    )
    const validCount = validFiles.length

    return (
        <Transition show={open} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[200]">
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
                                {step === 'select' && (
                                    <SelectStep
                                        accept={accept}
                                        multiple={multiple}
                                        title={selectTitle}
                                        subtitle={selectSubtitle}
                                        onClose={onClose}
                                        onAddFiles={onAddFiles}
                                    />
                                )}

                                {step === 'selected' && (
                                    <SelectedStep
                                        files={files}
                                        validCount={validCount}
                                        accept={accept}
                                        multiple={multiple}
                                        itemNoun={itemNoun}
                                        fileError={fileError}
                                        onClose={onClose}
                                        onAddFiles={onAddFiles}
                                        onRemoveFile={onRemoveFile}
                                        onStartUpload={onStartUpload}
                                    />
                                )}

                                {step === 'uploading' && (
                                    <UploadingStep files={validFiles} itemNoun={itemNoun} />
                                )}

                                {step === 'complete' && (
                                    <CompleteStep
                                        files={validFiles}
                                        validCount={validCount}
                                        itemNoun={itemNoun}
                                        onUploadMore={onUploadMore}
                                        onFinish={onFinish}
                                    />
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

// ── Sub-components ────────────────────────────────────────────────────────

function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle: string; onClose?: () => void }) {
    return (
        <div className="px-5 py-3 border-b border-border bg-card flex items-start justify-between gap-3 shrink-0">
            <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground">{title}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="shrink-0 h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            )}
        </div>
    )
}

function SelectStep({
    accept, multiple, title, subtitle, onClose, onAddFiles,
}: {
    accept: string; multiple: boolean; title: string; subtitle: string
    onClose: () => void; onAddFiles: (files: File[]) => void
}) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false)
    return (
        <>
            <ModalHeader title={title} subtitle={subtitle} onClose={onClose} />
            <div className="p-5">
                <div
                    onDragEnter={e => { e.preventDefault(); setDragging(true) }}
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => {
                        e.preventDefault()
                        setDragging(false)
                        if (e.dataTransfer?.files) onAddFiles([...e.dataTransfer.files])
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-12 cursor-pointer transition-colors select-none',
                        dragging
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/40 hover:bg-muted/40',
                    )}
                >
                    <Upload className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
                    <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                            Drop files here or <span className="underline decoration-dotted">click to select</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        multiple={multiple}
                        className="hidden"
                        onChange={e => e.target.files && onAddFiles([...e.target.files])}
                    />
                </div>
            </div>
        </>
    )
}

function SelectedStep({
    files, validCount, accept, multiple, itemNoun, fileError,
    onClose, onAddFiles, onRemoveFile, onStartUpload,
}: {
    files: File[]; validCount: number; accept: string; multiple: boolean; itemNoun: string
    fileError: (f: File) => string | null
    onClose: () => void; onAddFiles: (files: File[]) => void
    onRemoveFile: (i: number) => void; onStartUpload: () => void
}) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    return (
        <>
            <ModalHeader
                title={`${files.length} File${files.length === 1 ? '' : 's'} Selected`}
                subtitle="Review files before processing"
                onClose={onClose}
            />
            <div className="p-5 space-y-3">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md text-xs font-semibold bg-card border border-dashed border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> Add more files
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    className="hidden"
                    onChange={e => e.target.files && onAddFiles([...e.target.files])}
                />
                <ul className="space-y-2 max-h-[260px] overflow-y-auto">
                    {files.map((file, i) => {
                        const err = fileError(file)
                        return (
                            <li
                                key={`${file.name}-${i}`}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg border px-3 py-2',
                                    err
                                        ? 'bg-destructive/5 border-destructive/20'
                                        : 'bg-card border-border',
                                )}
                            >
                                <FileText
                                    className={cn('w-4 h-4 shrink-0', err ? 'text-destructive' : 'text-muted-foreground')}
                                    aria-hidden="true"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className={cn('text-sm truncate', err ? 'text-destructive' : 'text-foreground')}>
                                        {file.name}
                                    </div>
                                    {err && <div className="text-[11px] text-destructive">{err}</div>}
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                                <button
                                    type="button"
                                    onClick={() => onRemoveFile(i)}
                                    className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <div className="px-5 py-3 border-t border-border bg-card flex items-center justify-end gap-2 shrink-0">
                <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center justify-center h-9 px-4 rounded-md text-[12px] font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onStartUpload}
                    disabled={validCount === 0}
                    className="inline-flex items-center justify-center h-9 px-4 rounded-md text-[12px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Process {validCount} {itemNoun}{validCount === 1 ? '' : 's'}
                </button>
            </div>
        </>
    )
}

function UploadingStep({ files, itemNoun }: { files: File[]; itemNoun: string }) {
    return (
        <>
            <div className="px-5 py-3 border-b border-border bg-card shrink-0">
                <h3 className="text-sm font-bold text-foreground">
                    Uploading {files.length} {itemNoun}{files.length === 1 ? '' : 's'}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Uploading files…</p>
            </div>
            <div className="p-5">
                <ul className="space-y-2">
                    {files.map((file, i) => (
                        <li key={`${file.name}-${i}`} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                            <span className="flex-1 text-sm text-foreground truncate">{file.name}</span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                                <span className="w-3 h-3 rounded-full border-2 border-muted-foreground/40 border-t-muted-foreground animate-spin" />
                                Uploading…
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}

function CompleteStep({
    files, validCount, itemNoun, onUploadMore, onFinish,
}: {
    files: File[]; validCount: number; itemNoun: string
    onUploadMore?: () => void; onFinish: () => void
}) {
    return (
        <>
            <div className="px-5 py-3 border-b border-border bg-card shrink-0">
                <h3 className="text-sm font-bold text-foreground">Upload Complete</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Files have been processed</p>
            </div>
            <div className="p-5 space-y-4">
                <div className="flex flex-col items-center gap-3 py-4">
                    <div className="h-14 w-14 rounded-full bg-success/15 flex items-center justify-center">
                        <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" />
                    </div>
                    <p className="text-sm font-bold text-foreground">
                        {validCount} {itemNoun}{validCount === 1 ? '' : 's'} uploaded successfully
                    </p>
                </div>
                <ul className="space-y-2 max-h-[180px] overflow-y-auto">
                    {files.map((file, i) => (
                        <li
                            key={`${file.name}-${i}`}
                            className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/5 px-3 py-2"
                        >
                            <CheckCircle2 className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                            <span className="flex-1 text-sm text-foreground truncate">{file.name}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="px-5 py-3 border-t border-border bg-card flex items-center justify-end gap-2 shrink-0">
                {onUploadMore && (
                    <button
                        type="button"
                        onClick={onUploadMore}
                        className="inline-flex items-center justify-center h-9 px-4 rounded-md text-[12px] font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors"
                    >
                        Upload More
                    </button>
                )}
                <button
                    type="button"
                    onClick={onFinish}
                    className="inline-flex items-center justify-center h-9 px-4 rounded-md text-[12px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    Done
                </button>
            </div>
        </>
    )
}
