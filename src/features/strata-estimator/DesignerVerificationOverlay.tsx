// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Designer Verification Overlay
// Phase 14 + v7 · w1.2 side panel
//
// 5 verification modules, mixed required / optional. Each module stays
// collapsed until the designer ticks its checkbox. When activated it
// expands to show concrete data + an AI suggestion. The designer can
// accept the AI suggestion, pick one of the preset alternatives, or type
// a custom value. Send Back to Expert is gated on all REQUIRED modules
// being approved (optional modules can be ignored).
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import type { LucideIcon } from 'lucide-react'
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    DollarSign,
    FileText,
    Package,
    Sparkles,
    X,
} from 'lucide-react'
import VerificationPdfPreviewModal, {
    type VerificationModuleSummary,
} from './VerificationPdfPreviewModal'

// ─── Module data model ──────────────────────────────────────────────────────

interface DataRow {
    label: string
    value: string
    highlight?: 'primary' | 'amber' | 'green'
}

interface AiSuggestion {
    summary: string
    detail: string
    acceptLabel: string
}

interface ModifyOption {
    value: string
    label: string
    hint?: string
}

interface VerificationModule {
    id: string
    icon: LucideIcon
    title: string
    subtitle: string
    required: boolean
    data: DataRow[]
    ai: AiSuggestion
    modifyOptions: ModifyOption[]
}

const MODULES: VerificationModule[] = [
    {
        id: 'cost-summary',
        icon: DollarSign,
        title: 'Cost Summary',
        subtitle: 'Base cost · margin · sales price',
        required: true,
        data: [
            { label: 'Base cost', value: '$14,336' },
            { label: 'Margin (35%)', value: '$7,719', highlight: 'primary' },
            { label: 'Sales price', value: '$22,055' },
            { label: 'Rate', value: '$57/hr · non-union' },
        ],
        ai: {
            summary: 'Margin aligned with JPS Master Services Agreement',
            detail: '35% is the default tier for healthcare — no override required.',
            acceptLabel: 'Accept 35% margin',
        },
        modifyOptions: [
            { value: '25', label: '25% margin', hint: 'Thin · volume deal' },
            { value: '30', label: '30% margin', hint: 'Discount tier' },
            { value: '35', label: '35% margin', hint: 'AI suggestion · healthcare default' },
            { value: '40', label: '40% margin', hint: 'Premium tier' },
            { value: '45', label: '45% margin', hint: 'Custom / high risk' },
        ],
    },
    {
        id: 'project-scope',
        icon: Calendar,
        title: 'Project Scope',
        subtitle: 'Operational constraints check',
        required: false,
        data: [
            { label: 'Planned days', value: '4 days' },
            { label: 'Union force', value: 'Off' },
            { label: 'Stair carry', value: 'Off' },
            { label: 'Site protection', value: 'Off', highlight: 'amber' },
            { label: 'After hours', value: 'Off', highlight: 'amber' },
        ],
        ai: {
            summary: 'Recommend enabling Site Protection + After Hours',
            detail: 'JPS is an active hospital — nights reduce floor disruption and protection prevents damage to installed flooring.',
            acceptLabel: 'Apply both recommendations',
        },
        modifyOptions: [
            { value: 'both', label: 'Enable both', hint: 'AI suggestion' },
            { value: 'protection', label: 'Enable Site Protection only', hint: 'Flooring risk only' },
            { value: 'after-hours', label: 'Enable After Hours only', hint: 'Reduce hospital disruption' },
            { value: 'none', label: 'Leave as-is', hint: 'Override — document reason' },
        ],
    },
    {
        id: 'escalated-item',
        icon: Package,
        title: 'Escalated item',
        subtitle: 'OFS Serpentine 12-seat curved lounge',
        required: true,
        data: [
            { label: 'Product code', value: 'OFS-SRP-12' },
            { label: 'Category', value: 'Ancillary / Lounge' },
            { label: 'Qty', value: '1' },
            { label: 'Configuration', value: '12 seats · ganged · custom fabric' },
            { label: 'Current estimate', value: '1.5 h (stock rate)', highlight: 'amber' },
        ],
        ai: {
            summary: 'Proposed install time: 14 h',
            detail: '12 seats × 1.0 h per module + 2.0 h alignment. Standard brackets compatible, modular assembly confirmed against vendor spec.',
            acceptLabel: 'Accept 14 h',
        },
        modifyOptions: [
            { value: '10', label: '10 hours', hint: 'Aggressive · skilled crew' },
            { value: '12', label: '12 hours', hint: 'Standard gang rate' },
            { value: '14', label: '14 hours', hint: 'AI suggestion' },
            { value: '16', label: '16 hours', hint: 'Add buffer for alignment' },
            { value: '20', label: '20 hours', hint: 'Custom fabric + site prep' },
        ],
    },
    {
        id: 'assembly-verification',
        icon: ClipboardCheck,
        title: 'Assembly verification',
        subtitle: 'Components & hardware check',
        required: false,
        data: [
            { label: 'Gang connectors', value: '11 included' },
            { label: 'Mounting brackets', value: 'Standard · compatible' },
            { label: 'Fasteners', value: 'Shipped with product' },
            { label: 'Missing parts', value: 'None detected', highlight: 'green' },
        ],
        ai: {
            summary: 'No missing parts detected',
            detail: 'Bill of materials cross-checked against vendor spec sheet — all hardware accounted for, no site-sourced components needed.',
            acceptLabel: 'Confirm no gaps',
        },
        modifyOptions: [
            { value: 'ok', label: 'Confirm no gaps', hint: 'AI suggestion' },
            { value: 'site-sourced', label: 'Flag site-sourced parts', hint: 'Brackets sourced on site' },
            { value: 'missing', label: 'Flag missing parts', hint: 'Requires expert review' },
        ],
    },
    {
        id: 'applied-rate',
        icon: FileText,
        title: 'Applied rate',
        subtitle: 'Labor rate vs contract line',
        required: true,
        data: [
            { label: 'Contract rate', value: '$57 / hr' },
            { label: 'Contract line', value: 'JPS MSA · healthcare' },
            { label: 'Override needed?', value: 'No', highlight: 'green' },
        ],
        ai: {
            summary: 'Standard rate applies',
            detail: 'JPS MSA locks $57/hr for healthcare projects under 300 h. This estimate is 185.04 h — well below threshold.',
            acceptLabel: 'Confirm $57/hr',
        },
        modifyOptions: [
            { value: '57', label: '$57 / hr', hint: 'AI suggestion · JPS standard' },
            { value: '65', label: '$65 / hr', hint: 'Non-union premium tier' },
            { value: '95', label: '$95 / hr', hint: 'Union labor' },
            { value: '120', label: '$120 / hr', hint: 'Overtime surcharge' },
        ],
    },
]

// ─── Escalation context ─────────────────────────────────────────────────────

interface EscalationContext {
    fromName: string
    fromRole: string
    fromPhoto: string
    reason: string
    receivedAt: number
    itemRef?: string
}

interface DesignerVerificationOverlayProps {
    isOpen: boolean
    onSendBack: () => void
    onPreviewPdf: () => void
    escalationContext?: EscalationContext
    onScrollToItem?: (rowId: string) => void
}

function formatElapsed(ts: number): string {
    const seconds = Math.max(0, Math.round((Date.now() - ts) / 1000))
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.round(seconds / 60)
    return `${minutes}m ago`
}

const HIGHLIGHT_STYLES: Record<NonNullable<DataRow['highlight']>, string> = {
    primary: 'text-foreground dark:text-primary font-bold',
    amber:   'text-amber-700 dark:text-amber-400 font-semibold',
    green:   'text-green-700 dark:text-green-400 font-semibold',
}

type ModuleView = 'pending' | 'expanded' | 'modify' | 'approved'

interface ModuleResult {
    option: string        // option value OR 'ai' OR 'custom'
    displayValue?: string // shown as the approved label
}

export default function DesignerVerificationOverlay({
    isOpen,
    onSendBack,
    onPreviewPdf,
    escalationContext,
    onScrollToItem,
}: DesignerVerificationOverlayProps) {
    const [checkedModules, setCheckedModules] = useState<Record<string, boolean>>({})
    const [view, setView] = useState<Record<string, ModuleView>>({})
    const [result, setResult] = useState<Record<string, ModuleResult>>({})
    const [customValue, setCustomValue] = useState<Record<string, string>>({})
    const [leaving, setLeaving] = useState(false)
    const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)

    // Reset when the overlay opens fresh
    useEffect(() => {
        if (!isOpen) return
        setLeaving(false)
        setCheckedModules({})
        setView({})
        setResult({})
        setCustomValue({})
        setPdfPreviewOpen(false)
    }, [isOpen])

    const handleSendBackClick = () => {
        setLeaving(true)
        setTimeout(onSendBack, 400)
    }

    const handleCheck = (id: string, checked: boolean) => {
        setCheckedModules((prev) => ({ ...prev, [id]: checked }))
        if (checked) {
            setView((prev) => ({ ...prev, [id]: 'expanded' }))
        } else {
            setView((prev) => {
                const next = { ...prev }
                delete next[id]
                return next
            })
            setResult((prev) => {
                const next = { ...prev }
                delete next[id]
                return next
            })
        }
    }

    const handleAccept = (module: VerificationModule) => {
        setResult((prev) => ({
            ...prev,
            [module.id]: { option: 'ai', displayValue: module.ai.acceptLabel },
        }))
        setView((prev) => ({ ...prev, [module.id]: 'approved' }))
    }

    const handlePickOption = (module: VerificationModule, opt: ModifyOption) => {
        setResult((prev) => ({
            ...prev,
            [module.id]: { option: opt.value, displayValue: opt.label },
        }))
        setView((prev) => ({ ...prev, [module.id]: 'approved' }))
    }

    const handleCustom = (module: VerificationModule) => {
        const raw = customValue[module.id]?.trim()
        if (!raw) return
        setResult((prev) => ({
            ...prev,
            [module.id]: { option: 'custom', displayValue: raw },
        }))
        setView((prev) => ({ ...prev, [module.id]: 'approved' }))
    }

    const handleModify = (id: string) => {
        setView((prev) => ({ ...prev, [id]: 'modify' }))
    }

    const handleCancelModify = (id: string) => {
        setView((prev) => ({ ...prev, [id]: 'expanded' }))
    }

    if (!isOpen) return null

    const requiredModules = MODULES.filter((m) => m.required)
    const requiredApproved = requiredModules.filter(
        (m) => view[m.id] === 'approved'
    ).length
    const allRequiredDone = requiredApproved === requiredModules.length
    const totalApproved = MODULES.filter((m) => view[m.id] === 'approved').length

    // Summaries for the PDF preview modal
    const moduleSummaries: VerificationModuleSummary[] = MODULES.map((m) => ({
        id: m.id,
        title: m.title,
        subtitle: m.subtitle,
        required: m.required,
        status: view[m.id] === 'approved' ? 'approved' : 'pending',
        selectedLabel: result[m.id]?.displayValue,
    }))

    return (
        <>
        <div
            className={clsx(
                'fixed inset-y-0 right-0 w-[28rem] bg-card dark:bg-zinc-900 border-l border-border shadow-2xl flex flex-col z-40 transition-all duration-300 ease-out',
                leaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
            )}
        >
            {/* Header */}
            <div className="p-5 border-b border-border bg-muted/20">
                <h2 className="text-base font-bold flex items-center gap-2">
                    <span className="bg-primary/10 text-foreground dark:text-primary p-1.5 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                    </span>
                    Designer Verification
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                    Tick each module you want to review. Required modules must be
                    approved before sending back.
                </p>

                {/* Required progress */}
                <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{
                                width: `${(requiredApproved / requiredModules.length) * 100}%`,
                            }}
                        />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider tabular-nums shrink-0">
                        {requiredApproved} / {requiredModules.length} required
                    </span>
                </div>
                {totalApproved > requiredApproved && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                        +{totalApproved - requiredApproved} optional approved
                    </p>
                )}

                {/* Provenance */}
                {escalationContext && (
                    <div className="mt-4 p-3 rounded-xl bg-card dark:bg-zinc-800 border border-border">
                        <div className="flex items-center gap-2.5">
                            <img
                                src={escalationContext.fromPhoto}
                                alt={escalationContext.fromName}
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/40 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                                    From
                                </p>
                                <p className="text-xs font-semibold text-foreground leading-tight truncate">
                                    {escalationContext.fromName}
                                </p>
                                <p className="text-[10px] text-muted-foreground leading-tight truncate">
                                    {escalationContext.fromRole}
                                </p>
                            </div>
                            <span className="text-[9px] text-muted-foreground font-mono shrink-0">
                                {formatElapsed(escalationContext.receivedAt)}
                            </span>
                        </div>

                        <p className="text-[11px] text-foreground mt-3 leading-snug">
                            <span className="font-semibold">Reason:</span>{' '}
                            {escalationContext.reason}
                        </p>

                        {onScrollToItem && escalationContext.itemRef && (
                            <button
                                type="button"
                                onClick={() => onScrollToItem(escalationContext.itemRef!)}
                                className="mt-2 text-[10px] font-semibold text-foreground dark:text-primary hover:underline uppercase tracking-wider"
                            >
                                See row in the BoM →
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-minimal">
                {MODULES.map((module) => {
                    const Icon = module.icon
                    const isChecked = !!checkedModules[module.id]
                    const currentView = view[module.id] ?? 'pending'
                    const moduleResult = result[module.id]
                    const isApproved = currentView === 'approved'

                    return (
                        <div
                            key={module.id}
                            className={clsx(
                                'rounded-xl border overflow-hidden transition-all duration-300',
                                isApproved
                                    ? 'bg-green-500/5 dark:bg-green-500/10 border-green-500/30'
                                    : isChecked
                                        ? 'bg-card dark:bg-zinc-800 border-primary/30'
                                        : 'bg-card dark:bg-zinc-800 border-border'
                            )}
                        >
                            {/* Module header — always visible */}
                            <label
                                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer shrink-0"
                                    checked={isChecked}
                                    onChange={(e) => handleCheck(module.id, e.target.checked)}
                                />
                                <span
                                    className={clsx(
                                        'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                                        isApproved
                                            ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                                            : 'bg-primary/10 text-foreground dark:text-primary'
                                    )}
                                >
                                    {isApproved ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-foreground leading-tight truncate">
                                            {module.title}
                                        </p>
                                        {module.required && (
                                            <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                                Required
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-tight truncate mt-0.5">
                                        {isApproved && moduleResult
                                            ? `✓ ${moduleResult.displayValue}`
                                            : module.subtitle}
                                    </p>
                                </div>
                            </label>

                            {/* Expanded body (only when checked) */}
                            {isChecked && currentView !== 'approved' && (
                                <div className="px-4 pb-3 border-t border-border/60 pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {/* Data grid */}
                                    <dl className="space-y-1.5 mb-3">
                                        {module.data.map((row) => (
                                            <div
                                                key={row.label}
                                                className="flex items-baseline justify-between gap-3 text-[11px]"
                                            >
                                                <dt className="text-muted-foreground shrink-0">
                                                    {row.label}
                                                </dt>
                                                <dd
                                                    className={clsx(
                                                        'text-right tabular-nums truncate',
                                                        row.highlight
                                                            ? HIGHLIGHT_STYLES[row.highlight]
                                                            : 'text-foreground font-semibold'
                                                    )}
                                                >
                                                    {row.value}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>

                                    {currentView === 'expanded' && (
                                        <>
                                            {/* AI suggestion */}
                                            <div className="rounded-lg bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 px-3 py-2.5 mb-3">
                                                <div className="flex items-start gap-2">
                                                    <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 leading-none">
                                                            AI suggestion
                                                        </p>
                                                        <p className="text-[11px] text-foreground font-semibold leading-tight mt-1">
                                                            {module.ai.summary}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground leading-snug mt-1">
                                                            {module.ai.detail}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAccept(module)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                                >
                                                    {module.ai.acceptLabel}
                                                    <ArrowRight className="w-3 h-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleModify(module.id)}
                                                    className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border"
                                                >
                                                    Modify
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {currentView === 'modify' && (
                                        <>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                    Pick an alternative
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancelModify(module.id)}
                                                    className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                                                    aria-label="Cancel modify"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {/* Preset options */}
                                            <div className="space-y-1.5 mb-2">
                                                {module.modifyOptions.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => handlePickOption(module, opt)}
                                                        className="group w-full text-left px-3 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-border hover:border-primary/50 hover:bg-zinc-200/60 dark:hover:bg-zinc-950 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[11px] font-semibold text-foreground truncate">
                                                                    {opt.label}
                                                                </span>
                                                                {opt.hint?.includes('AI') && (
                                                                    <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30">
                                                                        <Sparkles className="w-2.5 h-2.5" />
                                                                        AI
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {opt.hint && (
                                                                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                                                    {opt.hint}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-50 group-hover:opacity-100 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Manual custom input */}
                                            <div className="rounded-lg bg-muted/30 border border-dashed border-border px-3 py-2">
                                                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                                    Manual override
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={customValue[module.id] ?? ''}
                                                        onChange={(e) =>
                                                            setCustomValue((prev) => ({
                                                                ...prev,
                                                                [module.id]: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="Type a custom value…"
                                                        className="flex-1 min-w-0 bg-transparent text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded px-1.5 py-1"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCustom(module)}
                                                        disabled={!customValue[module.id]?.trim()}
                                                        className="shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-border bg-muted/20 space-y-2.5">
                <button
                    onClick={() => {
                        setPdfPreviewOpen(true)
                        onPreviewPdf()
                    }}
                    className="w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                    <FileText className="w-3.5 h-3.5" />
                    Preview Verification PDF
                </button>
                <button
                    onClick={handleSendBackClick}
                    disabled={!allRequiredDone || leaving}
                    className={clsx(
                        'w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-opacity',
                        allRequiredDone
                            ? 'bg-primary text-primary-foreground hover:opacity-90'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                    )}
                >
                    Send for Approval
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>

        {/* Verification PDF preview modal (sibling of the side panel so it
            overlays the whole viewport, not just the w-[28rem] panel) */}
        <VerificationPdfPreviewModal
            isOpen={pdfPreviewOpen}
            modules={moduleSummaries}
            designerName="Alex Rivera"
            projectName="JPS Health Center for Women"
            onClose={() => setPdfPreviewOpen(false)}
        />
        </>
    )
}
