/**
 * COMPONENT: BudgetIntakeStep
 * PURPOSE: Wizard Step 1 — Intake. Dual-path selector:
 *          - Design-Assisted (SIF/CAP upload)
 *          - Quick Budget    (salesperson form)
 *
 * The demo tour locks this to Design-Assisted (the hero scenario), but the
 * Quick Budget path is fully functional for out-of-tour exploration.
 *
 * PROPS:
 *   - path: 'design-assisted' | 'quick-budget' | null
 *   - onPathChange: (p) => void
 *   - uploadedSIF?: SIFSample | null
 *   - quickForm: QuickFormState
 *   - onQuickFormChange: (form) => void
 *
 * STATES:
 *   - path = null             → show 2 big path cards
 *   - path = design-assisted  → show SIF preview card + CAP upload
 *   - path = quick-budget     → show full form
 *
 * DS TOKENS: bg-card · border-border · rounded-2xl · text-foreground · primary ring
 * USED BY: MBIBudgetPage (Step 1 view)
 */

import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Upload, FileSpreadsheet, FileCode2, ClipboardList, Briefcase, Building2, GraduationCap, Landmark, Heart, CheckCircle2, Eye, RefreshCw, Trash2, Loader2, Plus, ShieldCheck, FileText, XCircle, Send, Ban, Undo2, AlertTriangle, X } from 'lucide-react'
import MBIDetailSheet from './MBIDetailSheet'
import BudgetRequestFormPreview from './BudgetRequestFormPreview'
import { StatusBadge } from '../shared'
import type { BudgetPath, Vertical, ContractType } from '../../config/profiles/mbi-data'
import { MBI_CONTRACTS, getSIFSample } from '../../config/profiles/mbi-data'
import { usePauseAware } from '../../context/usePauseAware'

export interface QuickFormState {
    clientName: string
    projectName: string
    vertical: Vertical
    contract: ContractType
    budgetCeiling: string
    workstations: string
    privateOffices: string
    conferenceRooms: string
    lounge: string
}

export const INITIAL_QUICK_FORM: QuickFormState = {
    clientName: 'Commerce Bank',
    projectName: 'Branch Remodel — Clayton',
    vertical: 'corporate',
    contract: 'HNI',
    budgetCeiling: '124000',
    workstations: '12',
    privateOffices: '6',
    conferenceRooms: '0',
    lounge: '0',
}

interface BudgetIntakeStepProps {
    path: BudgetPath | null
    onPathChange: (p: BudgetPath) => void
    quickForm: QuickFormState
    onQuickFormChange: (f: QuickFormState) => void
    lockedToDemoPath?: boolean           // when true, path switch disabled (demo tour mode)
    intakeApproved?: boolean             // gates the wizard Next button via parent
    onIntakeApprove?: () => void
}

export default function BudgetIntakeStep({
    path,
    onPathChange,
    quickForm,
    onQuickFormChange,
    lockedToDemoPath = false,
    intakeApproved = false,
    onIntakeApprove,
}: BudgetIntakeStepProps) {
    // If no path selected yet, show the Budget Request Form trigger preview
    // (future state — to validate with MBI per Apr 23 Matt feedback) followed
    // by the current MVP path selector. The form is presentational only; its
    // CTA hands off to the existing Design-Assisted flow so the demo continues
    // without a parallel implementation.
    if (!path) {
        return (
            <>
                <BudgetRequestFormPreview onUse={() => onPathChange('design-assisted')} />

                <div className="mt-6 mb-2 flex items-center gap-2 pb-2 border-b border-border">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">Or · today's MVP</span>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-muted-foreground">Path selector available now</span>
                </div>

                <div className="mb-2">
                    <p className="text-sm text-muted-foreground">
                        How do you want to start the budget? Strata routes you to the correct engine based on the inputs you have.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PathCard
                        icon={<FileCode2 className="h-6 w-6" />}
                        title="Design-Assisted"
                        subtitle="I have CET exports (SIF + CAP)"
                        description="Upload the CET SIF export and CAP worksheet. Strata parses 24 fields, applies contract pricing, and generates scenarios automatically."
                        bullets={['~2 min to scenarios', 'Uses real CET data', 'Highest accuracy']}
                        onClick={() => onPathChange('design-assisted')}
                        emphasis
                    />
                    <PathCard
                        icon={<ClipboardList className="h-6 w-6" />}
                        title="Quick Budget"
                        subtitle="Salesperson-only · no design yet"
                        description="Fill a short form (space type, scope, contract, ceiling). Strata uses historical CORE data + pricing reference table to estimate."
                        bullets={['~5 min', 'No CET required', 'Marked budget-grade']}
                        onClick={() => onPathChange('quick-budget')}
                        optional
                        optionalNote="Value depends on whether your sales team uses CORE directly — CORE can copy an existing order fast. Validate with sales in Phase 1."
                    />
                </div>
            </>
        )
    }

    if (path === 'design-assisted') {
        return (
            <DesignAssistedIntake
                locked={lockedToDemoPath}
                onBack={() => !lockedToDemoPath && onPathChange('quick-budget' as BudgetPath)}
                approved={intakeApproved}
                onApprove={onIntakeApprove}
            />
        )
    }

    return (
        <QuickBudgetIntake
            form={quickForm}
            onChange={onQuickFormChange}
            locked={lockedToDemoPath}
            onSwitchToDesign={() => !lockedToDemoPath && onPathChange('design-assisted')}
        />
    )
}

// ─── Path selector card ──────────────────────────────────────────────────────
function PathCard({
    icon,
    title,
    subtitle,
    description,
    bullets,
    onClick,
    emphasis,
    optional,
    optionalNote,
}: {
    icon: React.ReactNode
    title: string
    subtitle: string
    description: string
    bullets: string[]
    onClick: () => void
    emphasis?: boolean
    optional?: boolean
    optionalNote?: string
}) {
    return (
        <button
            onClick={onClick}
            className={`
                text-left bg-card rounded-2xl p-5 transition-all hover:shadow-md
                ${emphasis ? 'border border-primary/40 hover:border-primary' : ''}
                ${optional ? 'border border-dashed border-amber-400/60 dark:border-amber-500/40 hover:border-amber-400 dark:hover:border-amber-500/70' : ''}
                ${!emphasis && !optional ? 'border border-border hover:border-muted-foreground/40' : ''}
            `}
        >
            <div className="flex items-start gap-3 mb-3">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${emphasis ? 'bg-primary/10 text-zinc-900 dark:text-primary' : optional ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-muted text-foreground'}`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-foreground">{title}</h3>
                        {optional && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 uppercase tracking-wider border border-amber-400/30">
                                Optional · validate Phase 1
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{description}</p>
            <ul className="space-y-1 mb-3">
                {bullets.map((b, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                        {b}
                    </li>
                ))}
            </ul>
            {optional && optionalNote && (
                <div className="mt-2 pt-2.5 border-t border-amber-400/20 flex items-start gap-1.5">
                    <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 leading-snug">{optionalNote}</span>
                </div>
            )}
        </button>
    )
}

// ─── Design-Assisted intake (files uploaded with processing) ─────────────────
type FileStatus = 'processing' | 'ready' | 'error'

interface IntakeFile {
    id: string
    name: string
    kind: 'sif' | 'cap' | 'other'
    icon: React.ReactNode
    statusLabel: string
    description: string
    /** Base seconds for the simulated processing pass. */
    processingMs: number
    /** Person who uploaded — used to notify them on rejection. */
    author?: { name: string; role: string; channel: string }
}

const INITIAL_FILES: IntakeFile[] = [
    {
        id: 'sif',
        name: 'EnterpriseHoldings_HQF12_SIF_v5.xml',
        kind: 'sif',
        icon: <FileCode2 className="h-5 w-5" />,
        statusLabel: 'CET export',
        description: '24 fields · 7 line items · CET v16.5.2',
        processingMs: 2200,
        author: { name: 'Design Manager Fane', role: 'Designer', channel: 'Teams · #design-handoffs' },
    },
    {
        id: 'cap',
        name: 'EnterpriseHoldings_CAP.xlsx',
        kind: 'cap',
        icon: <FileSpreadsheet className="h-5 w-5" />,
        statusLabel: 'Pricing worksheet',
        description: '7 discount overrides · 3 custom-pricing lines',
        processingMs: 1700,
        author: { name: 'AP Lead', role: 'Senior Designer', channel: 'Teams · #design-handoffs' },
    },
]

interface RejectionState {
    reason: string
    category: string
    notifyAuthors: boolean
    submittedAt: Date
    notifiedAuthors: string[]
}

const REJECTION_CATEGORIES = [
    { id: 'missing-fields', label: 'Missing required fields' },
    { id: 'stale-export', label: 'SIF export is out of date' },
    { id: 'pricing-mismatch', label: 'CAP pricing does not match contract' },
    { id: 'wrong-file', label: 'Wrong file attached' },
    { id: 'other', label: 'Other (describe below)' },
]

function DesignAssistedIntake({
    locked,
    onBack,
    approved,
    onApprove,
}: {
    locked: boolean
    onBack: () => void
    approved: boolean
    onApprove?: () => void
}) {
    const sif = getSIFSample('SIF-ENTERPRISE-001')!
    const [files, setFiles] = useState<IntakeFile[]>(INITIAL_FILES)
    const [status, setStatus] = useState<Record<string, FileStatus>>(() =>
        Object.fromEntries(INITIAL_FILES.map(f => [f.id, 'processing' as FileStatus])),
    )
    const [progress, setProgress] = useState<Record<string, number>>(() =>
        Object.fromEntries(INITIAL_FILES.map(f => [f.id, 0])),
    )
    const [previewId, setPreviewId] = useState<string | null>(null)
    const replaceInputRef = useRef<HTMLInputElement>(null)
    const addInputRef = useRef<HTMLInputElement>(null)
    const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null)

    // Rejection flow
    const [rejectOpen, setRejectOpen] = useState(false)
    const [rejection, setRejection] = useState<RejectionState | null>(null)
    const [notificationToast, setNotificationToast] = useState<string | null>(null)

    const submitRejection = (payload: Omit<RejectionState, 'submittedAt' | 'notifiedAuthors'>) => {
        const authorsToNotify = payload.notifyAuthors
            ? Array.from(new Set(files.map(f => f.author?.name).filter(Boolean) as string[]))
            : []
        setRejection({
            ...payload,
            submittedAt: new Date(),
            notifiedAuthors: authorsToNotify,
        })
        setRejectOpen(false)
        if (authorsToNotify.length > 0) {
            setNotificationToast(
                `Notification sent to ${authorsToNotify.join(' + ')} via Teams · #design-handoffs`,
            )
            setTimeout(() => setNotificationToast(null), 4500)
        }
    }

    const undoRejection = () => setRejection(null)

    // Drive the per-file processing animation. Holds position when the demo
    // guide is paused so the user can read the in-flight state.
    const { pausedRef } = usePauseAware()
    useEffect(() => {
        const intervals = files.map(f => {
            if (status[f.id] !== 'processing') return null
            const stepMs = 80
            const totalSteps = Math.max(8, Math.round(f.processingMs / stepMs))
            let i = 0
            return setInterval(() => {
                if (pausedRef.current) return
                i++
                const pct = Math.min(100, Math.round((i / totalSteps) * 100))
                setProgress(prev => ({ ...prev, [f.id]: pct }))
                if (pct >= 100) {
                    setStatus(prev => ({ ...prev, [f.id]: 'ready' }))
                }
            }, stepMs)
        })
        return () => intervals.forEach(t => t && clearInterval(t))
    }, [files, status, pausedRef])

    const allReady = files.every(f => status[f.id] === 'ready')
    const processingCount = files.filter(f => status[f.id] === 'processing').length

    const triggerReplace = (id: string) => {
        setReplaceTargetId(id)
        replaceInputRef.current?.click()
    }

    const handleReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !replaceTargetId) return
        setFiles(prev => prev.map(f => f.id === replaceTargetId ? { ...f, name: file.name } : f))
        setStatus(prev => ({ ...prev, [replaceTargetId]: 'processing' }))
        setProgress(prev => ({ ...prev, [replaceTargetId]: 0 }))
        setReplaceTargetId(null)
        e.target.value = ''
    }

    const handleRemove = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id))
        setStatus(prev => { const { [id]: _, ...rest } = prev; return rest })
        setProgress(prev => { const { [id]: _, ...rest } = prev; return rest })
    }

    const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const id = `extra-${Date.now()}`
        const newFile: IntakeFile = {
            id,
            name: file.name,
            kind: 'other',
            icon: <FileText className="h-5 w-5" />,
            statusLabel: 'Supplemental document',
            description: `${(file.size / 1024).toFixed(1)} KB · uploaded just now`,
            processingMs: 1400,
        }
        setFiles(prev => [...prev, newFile])
        setStatus(prev => ({ ...prev, [id]: 'processing' }))
        setProgress(prev => ({ ...prev, [id]: 0 }))
        e.target.value = ''
    }

    const previewFile = previewId ? files.find(f => f.id === previewId) : null

    return (
        <div className="space-y-4">
            {/* Header with path badge */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                        <FileCode2 className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Design-Assisted path</div>
                        <div className="text-[10px] text-muted-foreground">Upload CET exports · Strata processes each file before approval</div>
                    </div>
                </div>
                {!locked && (
                    <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground underline">
                        Switch path
                    </button>
                )}
            </div>

            {/* File rows */}
            <div className="space-y-2">
                {files.map(f => (
                    <FileRow
                        key={f.id}
                        file={f}
                        status={status[f.id]}
                        progress={progress[f.id]}
                        onPreview={() => setPreviewId(f.id)}
                        onReplace={() => triggerReplace(f.id)}
                        onRemove={f.kind === 'other' ? () => handleRemove(f.id) : undefined}
                    />
                ))}

                {/* Add another document */}
                <button
                    onClick={() => addInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-border rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/20 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add another document (PDF, image, spec sheet)
                </button>
                <input ref={addInputRef} type="file" className="hidden" onChange={handleAdd} />
                <input ref={replaceInputRef} type="file" className="hidden" onChange={handleReplace} />
            </div>

            {/* Intake summary — only after files ready */}
            {allReady && (
                <div className="bg-muted/30 dark:bg-zinc-800 border border-border rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Intake summary — detected by AI</h4>
                    <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div><dt className="text-muted-foreground">Client</dt><dd className="font-bold text-foreground mt-0.5">Enterprise Holdings</dd></div>
                        <div><dt className="text-muted-foreground">Project</dt><dd className="font-bold text-foreground mt-0.5">New HQ Floor 12</dd></div>
                        <div><dt className="text-muted-foreground">Contract</dt><dd className="font-bold text-foreground mt-0.5">HNI Corporate · 55%</dd></div>
                        <div><dt className="text-muted-foreground">Budget ceiling</dt><dd className="font-bold text-foreground mt-0.5">$385,000</dd></div>
                    </dl>
                </div>
            )}

            {/* Approve / Reject CTA — gates the wizard's Next button */}
            {rejection ? (
                <RejectedCard
                    rejection={rejection}
                    categoryLabel={REJECTION_CATEGORIES.find(c => c.id === rejection.category)?.label ?? rejection.category}
                    onUndo={undoRejection}
                    onReplace={() => addInputRef.current?.click()}
                />
            ) : (
                <div
                    className={`
                        rounded-xl border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4
                        ${approved
                            ? 'bg-success/10 border-success/30'
                            : allReady
                                ? 'bg-primary/5 dark:bg-primary/10 border-primary/30'
                                : 'bg-muted/30 dark:bg-zinc-800 border-border'
                        }
                    `}
                >
                    <div className="min-w-0">
                        <div className={`text-sm font-bold ${approved ? 'text-success' : 'text-foreground'}`}>
                            {approved
                                ? 'Documents approved'
                                : allReady
                                    ? 'Ready to approve documents'
                                    : `Processing ${processingCount} document${processingCount > 1 ? 's' : ''}…`}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            {approved
                                ? 'Strata will parse the SIF + CAP and generate scenarios in the next step.'
                                : allReady
                                    ? 'Approve to unlock AI Parsing · or reject with feedback for the uploader.'
                                    : 'You can preview, replace, or add files at any time during processing.'}
                        </div>
                    </div>
                    {!approved ? (
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setRejectOpen(true)}
                                disabled={!allReady}
                                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Ban className="h-4 w-4" />
                                Reject
                            </button>
                            <button
                                onClick={onApprove}
                                disabled={!allReady || !onApprove}
                                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                Approve documents
                            </button>
                        </div>
                    ) : (
                        <div className="shrink-0 flex items-center gap-2 text-sm font-bold text-success px-4 py-2.5 bg-success/15 rounded-xl border border-success/30">
                            <CheckCircle2 className="h-4 w-4" />
                            Approved
                        </div>
                    )}
                </div>
            )}

            {/* Notification toast — simulates Teams message after rejection */}
            {notificationToast && (
                <div className="bg-info/10 dark:bg-info/15 border border-info/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Send className="h-4 w-4 text-info shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                        <div className="font-bold text-foreground">Feedback delivered</div>
                        <div className="text-muted-foreground mt-0.5">{notificationToast}</div>
                    </div>
                    <button
                        onClick={() => setNotificationToast(null)}
                        className="text-muted-foreground hover:text-foreground shrink-0"
                        aria-label="Dismiss"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {/* Reject modal */}
            <RejectDocumentsModal
                isOpen={rejectOpen}
                onClose={() => setRejectOpen(false)}
                onSubmit={submitRejection}
                files={files}
            />

            {/* Preview sheet */}
            {previewFile && (
                <MBIDetailSheet
                    isOpen={!!previewId}
                    onClose={() => setPreviewId(null)}
                    title={previewFile.name}
                    subtitle={`${previewFile.statusLabel} · ${previewFile.description}`}
                    icon={previewFile.icon}
                    width={previewFile.kind === 'cap' ? 'lg' : 'md'}
                >
                    {previewFile.kind === 'sif' ? (
                        <pre className="font-mono text-[11px] text-foreground bg-muted/30 dark:bg-zinc-900/40 border border-border rounded-xl p-4 overflow-x-auto leading-relaxed">
{`<sif-export>
  <header>
    <cet-version>${sif.cetVersion}</cet-version>
    <field-count>${sif.fieldCount}</field-count>
    <client>Enterprise Holdings</client>
    <project>New HQ Floor 12</project>
  </header>
  <line-items>
${sif.lineItems.map(i => `    <item sku="${i.sku}" qty="${i.quantity}" desc="${i.description}" unit="${i.unitPrice}" total="${i.total}" />`).join('\n')}
  </line-items>
</sif-export>`}
                        </pre>
                    ) : previewFile.kind === 'cap' ? (
                        <CapPreviewTable />
                    ) : (
                        <div className="bg-muted/30 dark:bg-zinc-900/40 border border-dashed border-border rounded-xl p-8 text-center">
                            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                            <div className="text-sm font-bold text-foreground">{previewFile.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">Inline preview not available · processed and indexed by Strata</div>
                        </div>
                    )}
                </MBIDetailSheet>
            )}
        </div>
    )
}

// ─── Rejected card (replaces approve CTA after submission) ───────────────────
function RejectedCard({
    rejection,
    categoryLabel,
    onUndo,
    onReplace,
}: {
    rejection: RejectionState
    categoryLabel: string
    onUndo: () => void
    onReplace: () => void
}) {
    return (
        <div className="rounded-xl border border-red-300 dark:border-red-500/40 bg-red-50/60 dark:bg-red-500/10 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                    <XCircle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge label="Rejected" tone="danger" size="sm" />
                        <span className="text-[10px] text-muted-foreground">
                            {rejection.submittedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <div className="text-sm font-bold text-foreground mt-1">Documents sent back to uploader</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                        Intake is blocked until the files are replaced or the rejection is undone.
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-card dark:bg-zinc-900/40 border border-border rounded-lg p-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Category</div>
                    <div className="text-xs font-semibold text-foreground">{categoryLabel}</div>
                </div>
                <div className="bg-card dark:bg-zinc-900/40 border border-border rounded-lg p-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Notified</div>
                    {rejection.notifiedAuthors.length > 0 ? (
                        <div className="text-xs text-foreground">
                            {rejection.notifiedAuthors.join(' + ')}
                            <span className="text-muted-foreground"> · Teams</span>
                        </div>
                    ) : (
                        <div className="text-xs italic text-muted-foreground">No one notified — reason kept in audit log</div>
                    )}
                </div>
            </div>

            {rejection.reason && (
                <div className="bg-card dark:bg-zinc-900/40 border border-border rounded-lg p-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Reason</div>
                    <div className="text-xs text-foreground whitespace-pre-wrap">{rejection.reason}</div>
                </div>
            )}

            <div className="flex items-center gap-2 pt-1">
                <button
                    onClick={onReplace}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                >
                    <Upload className="h-3.5 w-3.5" />
                    Replace documents
                </button>
                <button
                    onClick={onUndo}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                    <Undo2 className="h-3.5 w-3.5" />
                    Undo rejection
                </button>
            </div>
        </div>
    )
}

// ─── Reject documents modal ──────────────────────────────────────────────────
function RejectDocumentsModal({
    isOpen,
    onClose,
    onSubmit,
    files,
}: {
    isOpen: boolean
    onClose: () => void
    onSubmit: (payload: Omit<RejectionState, 'submittedAt' | 'notifiedAuthors'>) => void
    files: IntakeFile[]
}) {
    const [category, setCategory] = useState('missing-fields')
    const [reason, setReason] = useState('')
    const [notifyAuthors, setNotifyAuthors] = useState(true)

    // Reset form when the dialog opens
    useEffect(() => {
        if (isOpen) {
            setCategory('missing-fields')
            setReason('')
            setNotifyAuthors(true)
        }
    }, [isOpen])

    const authors = Array.from(
        new Map(
            files
                .map(f => f.author)
                .filter((a): a is NonNullable<IntakeFile['author']> => !!a)
                .map(a => [a.name, a]),
        ).values(),
    )
    const canSubmit = reason.trim().length > 0 || category !== 'other'

    const handleSubmit = () => {
        if (!canSubmit) return
        onSubmit({ category, reason: reason.trim(), notifyAuthors })
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[100]">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-background/70 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 translate-y-2"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-xl bg-card dark:bg-zinc-900 border border-border rounded-2xl shadow-2xl">
                                <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                            <Ban className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-base font-bold text-foreground">Reject documents</DialogTitle>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Send the files back with feedback so the uploader can improve the next export.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                        aria-label="Close"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Category */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                            Reason category
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {REJECTION_CATEGORIES.map(c => {
                                                const active = category === c.id
                                                return (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => setCategory(c.id)}
                                                        className={`
                                                            flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold text-left transition-colors
                                                            ${active
                                                                ? 'bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-400'
                                                                : 'bg-background dark:bg-zinc-800 border-border text-foreground hover:border-zinc-300 dark:hover:border-zinc-700'
                                                            }
                                                        `}
                                                    >
                                                        <span className={`h-2 w-2 rounded-full shrink-0 ${active ? 'bg-red-500' : 'bg-muted-foreground/40'}`} />
                                                        {c.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Reason */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                            Notes for the uploader
                                            {category === 'other' && <span className="text-red-600 dark:text-red-400 ml-1">· required</span>}
                                        </label>
                                        <textarea
                                            value={reason}
                                            onChange={e => setReason(e.target.value)}
                                            rows={4}
                                            placeholder="e.g. The SIF export is missing the contract discount field — please re-export from CET v16.5.2 with the Enterprise Holdings template."
                                            className="w-full bg-background dark:bg-zinc-800 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                                        />
                                        <div className="text-[10px] text-muted-foreground mt-1">
                                            {reason.length} / 500 characters
                                        </div>
                                    </div>

                                    {/* Notify authors */}
                                    <label className="flex items-start gap-3 bg-muted/30 dark:bg-zinc-900/40 border border-border rounded-lg p-3 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={notifyAuthors}
                                            onChange={e => setNotifyAuthors(e.target.checked)}
                                            className="h-4 w-4 mt-0.5 accent-primary"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-foreground">Notify the uploader(s)</div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                {authors.length > 0 ? (
                                                    <>
                                                        Send to{' '}
                                                        {authors.map((a, i) => (
                                                            <span key={a.name}>
                                                                <strong className="text-foreground">{a.name}</strong>
                                                                <span className="text-muted-foreground"> ({a.role})</span>
                                                                {i < authors.length - 1 && ', '}
                                                            </span>
                                                        ))}
                                                        <span> via {authors[0].channel}. The message includes the category, your notes, and a link to re-upload.</span>
                                                    </>
                                                ) : (
                                                    <>No uploaders detected on these files — feedback will be kept in the audit log only.</>
                                                )}
                                            </div>
                                            {notifyAuthors && authors.length > 0 && (
                                                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-info">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    <span>They will see the first name of the reviewer (you) and can reply in-thread.</span>
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                </div>

                                <div className="px-5 py-3 border-t border-border bg-muted/20 dark:bg-zinc-900/40 flex items-center justify-between gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!canSubmit}
                                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        <Send className="h-4 w-4" />
                                        {notifyAuthors && authors.length > 0 ? 'Reject & notify uploader' : 'Reject documents'}
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

function FileRow({
    file,
    status,
    progress,
    onPreview,
    onReplace,
    onRemove,
}: {
    file: IntakeFile
    status: FileStatus
    progress: number
    onPreview: () => void
    onReplace: () => void
    onRemove?: () => void
}) {
    const isProcessing = status === 'processing'
    const isReady = status === 'ready'

    return (
        <div
            className={`
                rounded-xl border p-3 transition-colors
                ${isReady ? 'bg-muted/60 dark:bg-zinc-900/40 border-border' : ''}
                ${isProcessing ? 'bg-ai/5 dark:bg-ai/10 border-ai/30' : ''}
            `}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`
                        h-10 w-10 rounded-lg flex items-center justify-center shrink-0
                        ${isReady ? 'bg-primary/10 text-zinc-900 dark:text-primary' : 'bg-ai/15 text-ai'}
                    `}
                >
                    {file.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground truncate">{file.name}</span>
                        {isReady && (
                            <StatusBadge label="Ready" tone="success" size="sm" icon={<CheckCircle2 className="h-2.5 w-2.5" />} />
                        )}
                        {isProcessing && (
                            <StatusBadge label="Processing" tone="ai" size="sm" icon={<Loader2 className="h-2.5 w-2.5 animate-spin" />} />
                        )}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{file.statusLabel} · {file.description}</div>
                </div>

                {isReady && (
                    <div className="flex items-center gap-1 shrink-0">
                        <RowAction icon={<Eye className="h-3.5 w-3.5" />} label="Preview" onClick={onPreview} />
                        <RowAction icon={<RefreshCw className="h-3.5 w-3.5" />} label="Replace" onClick={onReplace} />
                        {onRemove && (
                            <RowAction
                                icon={<Trash2 className="h-3.5 w-3.5" />}
                                label="Remove"
                                onClick={onRemove}
                                tone="danger"
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Processing progress bar */}
            {isProcessing && (
                <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Extracting structure · validating schema</span>
                        <span className="font-bold tabular-nums text-ai">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-background dark:bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-ai rounded-full transition-all duration-150" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}
        </div>
    )
}

function RowAction({
    icon,
    label,
    onClick,
    tone = 'neutral',
}: {
    icon: React.ReactNode
    label: string
    onClick: () => void
    tone?: 'neutral' | 'danger'
}) {
    const toneClasses = tone === 'danger'
        ? 'text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:border-red-500/40'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-zinc-300 dark:hover:border-zinc-700'
    return (
        <button
            onClick={onClick}
            title={label}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-md border border-transparent text-[10px] font-bold uppercase tracking-wider transition-colors ${toneClasses}`}
        >
            {icon}
            <span className="hidden md:inline">{label}</span>
        </button>
    )
}

// Inline tabular preview for the CAP worksheet
function CapPreviewTable() {
    const rows = [
        { line: 'L-12', sku: 'ALS-FUR-PNL-60', desc: 'Vertex Modular panel system', list: 1245, override: 920, type: 'Override' },
        { line: 'L-15', sku: 'ALS-FUR-DSK-60', desc: 'Vertex Modular desk 60×30', list: 1490, override: 1180, type: 'Override' },
        { line: 'L-18', sku: 'HON-IGN-TASK',    desc: 'Meridian Sync task chair',     list: 612,  override: 425,  type: 'Override' },
        { line: 'L-22', sku: 'KNOLL-PROP-84',   desc: 'Pinnacle Orbit table 84"',   list: 4900, override: 4200, type: 'Custom' },
        { line: 'L-25', sku: 'HM-EMB-LNG',      desc: 'Apex Embody lounge', list: 2480, override: 2150, type: 'Override' },
    ]
    return (
        <div className="border border-border rounded-xl overflow-hidden">
            <div className="px-3 py-2 bg-muted/30 dark:bg-zinc-800 border-b border-border grid grid-cols-[3rem_7rem_1fr_5rem_5rem_5rem] gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <div>Line</div>
                <div>SKU</div>
                <div>Description</div>
                <div className="text-right">List</div>
                <div className="text-right">Override</div>
                <div>Type</div>
            </div>
            <div className="divide-y divide-border">
                {rows.map(r => (
                    <div key={r.line} className="px-3 py-2 grid grid-cols-[3rem_7rem_1fr_5rem_5rem_5rem] gap-3 items-center text-xs hover:bg-muted/30 dark:hover:bg-zinc-800/30">
                        <div className="font-mono text-muted-foreground">{r.line}</div>
                        <div className="font-mono text-muted-foreground truncate">{r.sku}</div>
                        <div className="text-foreground truncate">{r.desc}</div>
                        <div className="text-right tabular-nums text-muted-foreground line-through">${r.list.toLocaleString()}</div>
                        <div className="text-right tabular-nums font-bold text-foreground">${r.override.toLocaleString()}</div>
                        <div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${r.type === 'Custom' ? 'bg-info/10 text-info' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>{r.type}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="px-3 py-2 border-t border-border bg-muted/20 dark:bg-zinc-900/40 text-[10px] text-muted-foreground">
                Pricing worksheet · 7 discount overrides + 3 custom-pricing lines · sourced from Enterprise Holdings CAP
            </div>
        </div>
    )
}

// ─── Quick Budget intake form ────────────────────────────────────────────────
const VERTICALS: { id: Vertical; label: string; icon: React.ReactNode }[] = [
    { id: 'corporate', label: 'Corporate', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'healthcare', label: 'Healthcare', icon: <Heart className="h-4 w-4" /> },
    { id: 'education', label: 'Education', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'government', label: 'Government', icon: <Landmark className="h-4 w-4" /> },
]

function QuickBudgetIntake({
    form,
    onChange,
    locked,
    onSwitchToDesign,
}: {
    form: QuickFormState
    onChange: (f: QuickFormState) => void
    locked: boolean
    onSwitchToDesign: () => void
}) {
    const update = <K extends keyof QuickFormState>(key: K, value: QuickFormState[K]) =>
        onChange({ ...form, [key]: value })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-muted text-foreground flex items-center justify-center">
                        <ClipboardList className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Quick Budget path</div>
                        <div className="text-[10px] text-muted-foreground">Salesperson form · uses historical CORE data</div>
                    </div>
                </div>
                {!locked && (
                    <button onClick={onSwitchToDesign} className="text-xs text-muted-foreground hover:text-foreground underline">
                        Switch to Design-Assisted
                    </button>
                )}
            </div>

            {/* Client + project */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField label="Client">
                    <input
                        type="text"
                        value={form.clientName}
                        onChange={e => update('clientName', e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </FormField>
                <FormField label="Project">
                    <input
                        type="text"
                        value={form.projectName}
                        onChange={e => update('projectName', e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </FormField>
            </div>

            {/* Vertical */}
            <FormField label="Vertical">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {VERTICALS.map(v => {
                        const active = form.vertical === v.id
                        return (
                            <button
                                key={v.id}
                                type="button"
                                onClick={() => update('vertical', v.id)}
                                className={`
                                    flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-colors
                                    ${active ? 'bg-primary/10 text-zinc-900 dark:text-primary border-primary' : 'bg-background text-muted-foreground border-border hover:text-foreground'}
                                `}
                            >
                                {v.icon}
                                {v.label}
                            </button>
                        )
                    })}
                </div>
            </FormField>

            {/* Scope */}
            <FormField label="Scope">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <ScopeInput label="Workstations" value={form.workstations} onChange={v => update('workstations', v)} icon={<Building2 className="h-4 w-4" />} />
                    <ScopeInput label="Offices" value={form.privateOffices} onChange={v => update('privateOffices', v)} icon={<Briefcase className="h-4 w-4" />} />
                    <ScopeInput label="Conference" value={form.conferenceRooms} onChange={v => update('conferenceRooms', v)} icon={<ClipboardList className="h-4 w-4" />} />
                    <ScopeInput label="Lounge" value={form.lounge} onChange={v => update('lounge', v)} icon={<Heart className="h-4 w-4" />} />
                </div>
            </FormField>

            {/* Contract + budget ceiling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField label="Contract">
                    <select
                        value={form.contract}
                        onChange={e => update('contract', e.target.value as ContractType)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    >
                        {MBI_CONTRACTS.map(c => (
                            <option key={c.id} value={c.type}>{c.name} · {Math.round(c.discount * 100)}%</option>
                        ))}
                        <option value="none">No contract</option>
                    </select>
                </FormField>
                <FormField label="Budget ceiling (USD)">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">$</span>
                        <input
                            type="text"
                            value={form.budgetCeiling}
                            onChange={e => update('budgetCeiling', e.target.value)}
                            className="w-full bg-background border border-border rounded-lg pl-6 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                    </div>
                </FormField>
            </div>
        </div>
    )
}

// ─── Small helpers ───────────────────────────────────────────────────────────
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
            {children}
        </div>
    )
}

function ScopeInput({ label, value, onChange, icon }: { label: string; value: string; onChange: (v: string) => void; icon: React.ReactNode }) {
    return (
        <div className="bg-muted/20 border border-border rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground mb-1">
                {icon}
                <span>{label}</span>
            </div>
            <input
                type="number"
                min={0}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-transparent text-lg font-bold text-foreground focus:outline-none"
            />
        </div>
    )
}
