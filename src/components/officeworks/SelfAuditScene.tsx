/**
 * COMPONENT: SelfAuditScene
 * STEP: sc1.6 — Self-audit: BOM × 6 attributes (HERO #1)
 * PAIN: SC2 (CEO #1 · Manual BOM spec check) + SC3 (CR Lookup context switch)
 *
 * Designer-led, Strata-assisted:
 *   · Kimberly Tucker (designer) is the principal actor · she navigates the 5
 *     audit steps and toggles each item Verified / Flagged / Pending.
 *   · Strata pre-flags items that need attention (grounded in Metro Legal_AUDIT_ISSUES)
 *     so Kimberly knows where to look first · she still decides.
 *   · Per-item Metro Legal project values (71 lines, 30 stations, SQ #436533, ...)
 *     materialize SC2 as concrete data to compare, not generic checklist text.
 *   · Optional supporting file upload mirrors the sc1.5b upload pattern.
 *   · At the end Kimberly picks the peer reviewer via PeerAssignPopover and
 *     sends to sc1.7.
 *
 * Renders inside the modal split-pane (right-panel dispatch) so the BOM /
 * Validation Doc / Floor Plan tabs stay visible on the left.
 *
 * Reuses the panel pattern of SQCheckPanel / TeknionPreviewPanel / SpecGapResolvePanel:
 *   container = flex-1 overflow-y-auto p-5 space-y-4 text-sm
 *   card      = rounded-xl border border-border bg-card overflow-hidden
 *   header    = px-4 py-3 bg-muted/30 border-b border-border
 *   footer    = border-t border-border px-5 py-3 bg-card shrink-0
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import {
    ClipboardCheck, FileText, Sparkles, ArrowRight, CheckCircle2,
    AlertTriangle, Circle, Eye, Search, Layers, Paperclip, Loader2,
} from 'lucide-react'
import PDFPreviewModal, { OFFICEWORKS_PDFS } from './shared/PDFPreviewModal'
import PeerAssignPopover from './shared/PeerAssignPopover'
import { AUDIT_CHECKLIST_STEPS } from './shared/auditChecklistSteps'

interface Props {
    onValidate: () => void
    /** Peer reviewer picked by Kimberly · lifted to OfficeworksPage so sc1.7 sees the same person */
    peerName: string | null
    /** Setter forwarded from OfficeworksPage state */
    onAssignPeerReviewer: (name: string | null) => void
}

type ItemState = 'pending' | 'verified' | 'flagged'
type StepNum = 1 | 2 | 3 | 4 | 5

/**
 * Strata's pre-analysis · which checklist items Strata flagged for Kimberly's
 * attention. Keys are `step-{stepNumber}-{itemIndex}`. The label and source
 * surface as a tooltip next to the badge.
 *
 * Counts match Metro Legal_AUDIT_ISSUES (2 critical · 3 advisory = 5 flags).
 */
const STRATA_FLAGS: Record<string, { severity: 'critical' | 'advisory'; reason: string }> = {
    'step-1-1': {
        severity: 'critical',
        reason: 'Metro Legal is a DC market project · Strata confirmed Washington D.C. electrical code requirements apply. Cross-reference the validation doc page 21.',
    },
    'step-2-3': {
        severity: 'advisory',
        reason: 'CR 2046138 grain direction was resolved in sc1.5b · spot-check the other 4 Flintwood CRs match.',
    },
    'step-4-3': {
        severity: 'critical',
        reason: 'CR 2075919 (Rolling Pedestal Box/File) · BIFMA stability advisory · mock-up strongly recommended before submission. Escape risk.',
    },
    'step-5-3': {
        severity: 'advisory',
        reason: 'SQ #436533 locks the 2025 catalog effective May 26, 2025 · ensure no rows show old PZ.',
    },
    'step-5-4': {
        severity: 'advisory',
        reason: 'Washington D.C. aisle dimension code · double-check the floor plan against Metro Legal 4th Floor layout.',
    },
}

const TOTAL_FLAGS_CRITICAL = Object.values(STRATA_FLAGS).filter(f => f.severity === 'critical').length
const TOTAL_FLAGS_ADVISORY = Object.values(STRATA_FLAGS).filter(f => f.severity === 'advisory').length

/**
 * Concrete Metro Legal values for selected checklist items · materializes SC2 as
 * "designer compares specific numbers" instead of "designer reads generic
 * checklist text". Items without a value just show the checklist label.
 */
const Metro Legal_AUDIT_VALUES: Record<string, string> = {
    'step-1-0': '71 lines · 30 stations · 4 workstation groups · $1,541,392 list',
    'step-1-1': 'Washington D.C. · DC market · OWDC electrical code',
    'step-1-2': 'New build · no reconfigure scope',
    'step-2-0': '4 workstation groups confirmed · CAD-aligned (validation page 1)',
    'step-2-3': 'vertical · 5 Flintwood CRs (resolved sc1.5b)',
    'step-2-4': 'clamped 24" · 8 HAT units · validation page 4',
    'step-2-9': 'Power Spine 120 · base feed visible · DC code',
    'step-4-0': '13 CRs · 71 lines · all parts match',
    'step-4-3': 'CR 2075919 unit list $1,927 · BIFMA advisory',
    'step-5-3': 'SQ #436533 · catalog effective May 26, 2025',
    'step-5-4': 'floor plan checked against Metro Legal 4th Floor',
}

function stepIcon(n: StepNum) {
    if (n === 1) return <Eye className="h-4 w-4 text-foreground" aria-hidden="true" />
    if (n === 2) return <FileText className="h-4 w-4 text-foreground" aria-hidden="true" />
    if (n === 3) return <Layers className="h-4 w-4 text-foreground" aria-hidden="true" />
    if (n === 4) return <Search className="h-4 w-4 text-foreground" aria-hidden="true" />
    return <ClipboardCheck className="h-4 w-4 text-foreground" aria-hidden="true" />
}

const STEP_SHORT_TITLE: Record<StepNum, string> = {
    1: 'Big Picture',
    2: 'Validation Doc',
    3: 'BOM & Drawing',
    4: 'Review CRs',
    5: 'Last Check',
}

/** Parse a flag key like 'step-1-1' → step number. */
function flagKeyToStep(key: string): StepNum {
    const m = key.match(/^step-(\d)-/)
    return (m ? Number(m[1]) : 1) as StepNum
}

export default function SelfAuditScene({ onValidate, peerName, onAssignPeerReviewer }: Props) {
    const [mode, setMode] = useState<'manual' | 'strata'>('manual')
    const [itemStates, setItemStates] = useState<Record<string, ItemState>>({})
    const [activeStep, setActiveStep] = useState<StepNum>(1)
    const [showPDF, setShowPDF] = useState(false)
    const [uploadPhase, setUploadPhase] = useState<'idle' | 'uploading' | 'uploaded'>('idle')
    const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null)
    const uploadTimeoutRef = useRef<number | null>(null)

    useEffect(() => {
        return () => {
            if (uploadTimeoutRef.current !== null) window.clearTimeout(uploadTimeoutRef.current)
        }
    }, [])

    // Cycle pending → verified → flagged → pending
    const toggleItem = (key: string) => {
        setItemStates(prev => {
            const current = prev[key] ?? 'pending'
            const next: ItemState = current === 'pending' ? 'verified' : current === 'verified' ? 'flagged' : 'pending'
            return { ...prev, [key]: next }
        })
    }

    // Aggregate counters across all steps · drives the header banner
    const totalItems = useMemo(
        () => AUDIT_CHECKLIST_STEPS.reduce((sum, s) => sum + s.items.length, 0),
        [],
    )
    const verifiedCount = useMemo(
        () => Object.values(itemStates).filter(s => s === 'verified').length,
        [itemStates],
    )
    const flaggedCount = useMemo(
        () => Object.values(itemStates).filter(s => s === 'flagged').length,
        [itemStates],
    )

    // Per-step counters (for the pill badges)
    const stepCounts = useMemo(() => {
        return AUDIT_CHECKLIST_STEPS.map(step => {
            let v = 0, f = 0
            step.items.forEach((_, i) => {
                const s = itemStates[`step-${step.stepNumber}-${i}`]
                if (s === 'verified') v++
                else if (s === 'flagged') f++
            })
            return { stepNumber: step.stepNumber, total: step.items.length, verified: v, flagged: f }
        })
    }, [itemStates])

    const activeStepData = AUDIT_CHECKLIST_STEPS.find(s => s.stepNumber === activeStep)!

    const handleUploadClick = () => {
        setUploadPhase('uploading')
        if (uploadTimeoutRef.current !== null) window.clearTimeout(uploadTimeoutRef.current)
        uploadTimeoutRef.current = window.setTimeout(() => {
            setUploadedFile({ name: 'Metro Legal-4F_audit-notes-v1.pdf', size: '180 KB' })
            setUploadPhase('uploaded')
        }, 1200)
    }

    // In manual mode the upload is the audit deliverable · required before send.
    // In strata mode the upload is optional · the interactive verify/flag is the deliverable.
    const uploadRequirementMet = mode === 'manual' ? uploadPhase === 'uploaded' : true
    const canSend = uploadRequirementMet && peerName !== null

    return (
        <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
                {/* Mode selector · Manual (offline + attach) vs Strata (interactive) */}
                <section
                    aria-label="Audit mode"
                    className="rounded-xl border border-border bg-card overflow-hidden"
                >
                    <div className="px-4 py-3 bg-muted/30 border-b border-border">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">How do you want to run the audit?</span>
                    </div>
                    <fieldset className="px-4 py-3 grid grid-cols-2 gap-2">
                        <legend className="sr-only">Audit mode</legend>
                        <label className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                            mode === 'manual' ? 'border-primary/40 bg-primary/5' : 'border-border bg-card hover:bg-muted/30'
                        }`}>
                            <input
                                type="radio"
                                name="audit-mode"
                                value="manual"
                                checked={mode === 'manual'}
                                onChange={() => setMode('manual')}
                                className="mt-0.5 h-3.5 w-3.5 accent-primary shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold text-foreground">Manual audit</span>
                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                    Review BOM offline · attach your audit notes or a corrected file when ready
                                </div>
                            </div>
                        </label>
                        <label className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                            mode === 'strata' ? 'border-ai/40 bg-ai/5' : 'border-border bg-card hover:bg-muted/30'
                        }`}>
                            <input
                                type="radio"
                                name="audit-mode"
                                value="strata"
                                checked={mode === 'strata'}
                                onChange={() => setMode('strata')}
                                className="mt-0.5 h-3.5 w-3.5 accent-primary shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-semibold text-foreground">Audit with Strata</span>
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-ai/10 text-ai border border-ai/20 rounded px-1.5 py-0.5">
                                        <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                                        Recommends
                                    </span>
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                    5-step interactive audit · verify/flag each item inline · Strata pre-flags issues
                                </div>
                            </div>
                        </label>
                    </fieldset>
                </section>

                {/* Strata mode · pre-check banner · context, no decisions */}
                {mode === 'strata' && (
                    <div className="rounded-xl border border-ai/30 bg-ai/5 px-4 py-3 flex items-start gap-2.5">
                        <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="flex-1 min-w-0 text-xs">
                            <div className="font-semibold text-foreground">
                                Strata pre-checked 71 lines × 6 attributes · {TOTAL_FLAGS_CRITICAL} critical · {TOTAL_FLAGS_ADVISORY} advisory
                            </div>
                            <div className="text-muted-foreground mt-0.5">
                                Kimberly Tucker · 5-step audit · cross-referenced with floor plan + validation doc + Create CR DB.
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 rounded px-1.5 py-0.5 tabular-nums">
                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                {verifiedCount}/{totalItems}
                            </span>
                            {flaggedCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20 rounded px-1.5 py-0.5 tabular-nums">
                                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                                    {flaggedCount} flagged
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Step navigator + body of active step · only rendered in Strata mode */}
                {mode === 'strata' && (
                <section
                    aria-label="Audit step navigator"
                    className="rounded-xl border border-border bg-card overflow-hidden"
                >
                    <div className="px-3 py-2.5 bg-muted/30 border-b border-border flex items-center gap-1.5 overflow-x-auto">
                        {stepCounts.map(({ stepNumber, total, verified, flagged }) => {
                            const isActive = stepNumber === activeStep
                            const allVerified = verified === total && total > 0
                            return (
                                <button
                                    key={stepNumber}
                                    type="button"
                                    onClick={() => setActiveStep(stepNumber as StepNum)}
                                    aria-label={`Step ${stepNumber}: ${STEP_SHORT_TITLE[stepNumber as StepNum]} · ${verified} of ${total} verified${flagged > 0 ? ` · ${flagged} flagged` : ''}`}
                                    aria-current={isActive ? 'step' : undefined}
                                    className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[11px] font-medium border transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-card ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground border-primary font-bold shadow-sm'
                                            : 'bg-card text-foreground/70 border-border hover:bg-muted/60 hover:text-foreground'
                                    }`}
                                >
                                    <span className="font-mono tabular-nums">{stepNumber}</span>
                                    <span>{STEP_SHORT_TITLE[stepNumber as StepNum]}</span>
                                    {allVerified && (
                                        <CheckCircle2
                                            className={`h-3 w-3 ${isActive ? 'text-primary-foreground' : 'text-success'}`}
                                            aria-hidden="true"
                                        />
                                    )}
                                    {flagged > 0 && (
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-primary-foreground' : 'bg-warning'}`}
                                            aria-hidden="true"
                                        />
                                    )}
                                    <span className={`text-[9px] tabular-nums ${isActive ? 'text-primary-foreground/85' : 'text-muted-foreground'}`}>
                                        {verified}/{total}
                                    </span>
                                </button>
                            )
                        })}
                        <button
                            type="button"
                            onClick={() => setShowPDF(true)}
                            aria-label="Open OW Audit Checklist 2026 PDF"
                            className="ml-auto inline-flex items-center justify-center h-8 w-8 rounded-md border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Active step body · header + items + (step 3 sub-categories ref) */}
                    <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-2">
                        {stepIcon(activeStep)}
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Step {activeStep} · {activeStepData.title}
                        </span>
                    </div>
                    <ul className="divide-y divide-border">
                        {activeStepData.items.map((item, i) => {
                            const key = `step-${activeStep}-${i}`
                            const state = itemStates[key] ?? 'pending'
                            const flag = STRATA_FLAGS[key]
                            const projectValue = Metro Legal_AUDIT_VALUES[key]
                            return (
                                <li key={i}>
                                    <button
                                        type="button"
                                        onClick={() => toggleItem(key)}
                                        aria-label={`Toggle ${item.label} (currently ${state})`}
                                        className="w-full flex items-start gap-2.5 px-4 py-2.5 text-left hover:bg-muted/30 transition-colors"
                                    >
                                        {state === 'verified' && <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" aria-hidden="true" />}
                                        {state === 'flagged' && <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />}
                                        {state === 'pending' && <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-foreground">
                                                {item.label}
                                                {item.critical && (
                                                    <span className="ml-2 text-[9px] font-bold uppercase tracking-wider text-warning">Checklist critical</span>
                                                )}
                                            </div>
                                            {projectValue && (
                                                <div className="text-[10px] text-foreground tabular-nums mt-0.5">
                                                    <span className="font-bold uppercase tracking-wider text-muted-foreground mr-1">Metro Legal:</span>
                                                    {projectValue}
                                                </div>
                                            )}
                                            {flag && (
                                                <div className="mt-1 inline-flex items-start gap-1.5 text-[10px]">
                                                    <span className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider rounded px-1.5 py-0.5 border ${
                                                        flag.severity === 'critical'
                                                            ? 'bg-warning/10 text-warning border-warning/20'
                                                            : 'bg-ai/10 text-ai border-ai/20'
                                                    }`}>
                                                        <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                                                        Strata flagged · {flag.severity}
                                                    </span>
                                                    <span className="text-muted-foreground italic flex-1">{flag.reason}</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                    {/* Step 3 · sub-categories reference (only when step 3 is active) */}
                    {activeStep === 3 && activeStepData.subCategories && (
                        <div className="px-4 py-2.5 bg-muted/20 border-t border-border">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                8 sub-categories verified per the Audit Checklist
                            </div>
                            <ul className="grid grid-cols-2 md:grid-cols-4 gap-1 text-[10px]">
                                {activeStepData.subCategories.map(cat => (
                                    <li key={cat.name} className="bg-card border border-border rounded px-2 py-1 text-foreground">
                                        · {cat.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
                )}

                {/* Supporting file upload · required in manual mode · optional in strata mode */}
                <section
                    aria-label="Supporting file upload"
                    className="rounded-xl border border-border bg-card overflow-hidden"
                >
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-foreground" aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                            {mode === 'manual' ? 'Upload audit results · required' : 'Supporting file (optional)'}
                        </span>
                    </div>
                    <div className="px-4 py-3 space-y-2.5">
                        <p className="text-[11px] text-muted-foreground">
                            {mode === 'manual'
                                ? 'Attach a corrected BOM, validation deck, or audit notes PDF — this is your audit deliverable for the peer reviewer.'
                                : 'Upload a corrected file if you found discrepancies that need a new version. The peer reviewer will see it alongside your verified items.'}
                        </p>
                        {uploadPhase === 'idle' && (
                            <button
                                type="button"
                                onClick={handleUploadClick}
                                aria-label="Attach supporting file (simulated)"
                                className="w-full border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-colors"
                            >
                                <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center" aria-hidden="true">
                                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="text-[11px] font-semibold text-foreground">Drop supporting file here · or click to attach</div>
                                <div className="text-[10px] text-muted-foreground italic">Demo · click to simulate the upload of Metro Legal-4F_audit-notes-v1.pdf (180 KB)</div>
                            </button>
                        )}
                        {uploadPhase === 'uploading' && (
                            <div
                                role="status"
                                aria-busy="true"
                                className="rounded-lg border border-border bg-muted/30 px-3 py-3 flex items-center gap-2 animate-in fade-in duration-200"
                            >
                                <Loader2 className="h-4 w-4 text-foreground animate-spin" aria-hidden="true" />
                                <span className="text-xs text-foreground">Strata reading the file…</span>
                            </div>
                        )}
                        {uploadPhase === 'uploaded' && uploadedFile && (
                            <div className="rounded-lg border border-success/30 bg-success/5 px-3 py-2.5 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                                <div className="h-9 w-9 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0" aria-hidden="true">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-semibold text-foreground truncate">{uploadedFile.name}</span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 rounded px-1.5 py-0.5">Uploaded</span>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground mt-0.5">{uploadedFile.size} · attached for peer reviewer</div>
                                    <div className="text-[10px] italic text-muted-foreground mt-1">
                                        Strata detected: spec note attached for peer reviewer.
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Manual mode · issues list as a sub-section of the same card */}
                    {mode === 'manual' && (
                        <>
                            <div className="px-4 py-2.5 bg-muted/30 border-t border-border flex items-center gap-2">
                                <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                                    Things to fix · per Strata&apos;s pre-check · {TOTAL_FLAGS_CRITICAL + TOTAL_FLAGS_ADVISORY} items
                                </span>
                            </div>
                            <ul className="divide-y divide-border">
                                {Object.entries(STRATA_FLAGS).map(([key, flag]) => {
                                    const stepNum = flagKeyToStep(key)
                                    return (
                                        <li key={key} className="px-4 py-2.5 flex items-start gap-2.5">
                                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 border shrink-0 mt-0.5 ${
                                                flag.severity === 'critical'
                                                    ? 'bg-warning/10 text-warning border-warning/20'
                                                    : 'bg-ai/10 text-ai border-ai/20'
                                            }`}>
                                                <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                                                {flag.severity}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                    Step {stepNum} · {STEP_SHORT_TITLE[stepNum]}
                                                </div>
                                                <div className="text-xs text-foreground mt-0.5">{flag.reason}</div>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                            <div className="px-4 py-2.5 bg-muted/20 border-t border-border text-[11px] text-foreground/70">
                                Resolve these before sending.
                            </div>
                        </>
                    )}
                </section>

                {/* Peer reviewer assignment · designer picks before send */}
                <section
                    aria-label="Peer reviewer assignment"
                    className="rounded-xl border border-border bg-card overflow-hidden"
                >
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-foreground" aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">Peer reviewer</span>
                    </div>
                    <div className="px-4 py-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0 text-xs">
                            <div className="text-foreground">
                                {peerName ? `Sending to ${peerName} for peer review` : 'Pick a peer reviewer before sending'}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                Strata suggests the highest-seniority designer with peer-review track record + utilization headroom.
                            </div>
                        </div>
                        <PeerAssignPopover
                            assigneeName={peerName}
                            currentDesignerName="Kimberly Tucker"
                            excludeManagerName="Felicia Miano-Poles"
                            onAssign={onAssignPeerReviewer}
                        />
                    </div>
                </section>
            </div>

            {/* Footer CTA · gated by upload (manual only) + peer reviewer (always) */}
            <div className="border-t border-border px-5 py-3 bg-card shrink-0">
                {mode === 'manual' && uploadPhase === 'uploading' && (
                    <button
                        type="button"
                        disabled
                        aria-busy="true"
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed"
                    >
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Reading file…
                    </button>
                )}
                {mode === 'manual' && uploadPhase !== 'uploading' && !uploadRequirementMet && (
                    <button
                        type="button"
                        disabled
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed"
                    >
                        Upload audit results to continue
                    </button>
                )}
                {uploadRequirementMet && peerName === null && (
                    <button
                        type="button"
                        disabled
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed"
                    >
                        Assign peer reviewer to continue
                    </button>
                )}
                {canSend && (
                    <button
                        type="button"
                        onClick={onValidate}
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-brand-400 hover:bg-brand-300 text-zinc-900 text-sm font-bold transition-colors"
                    >
                        Send to {peerName} →
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                )}
            </div>

            <PDFPreviewModal
                isOpen={showPDF}
                onClose={() => setShowPDF(false)}
                pdfSrc={OFFICEWORKS_PDFS.auditChecklist}
                title="OW Audit Checklist 2026"
                subtitle="Used during self audit + peer audit · 5 steps · real document"
                badge="Real document"
            />
        </>
    )
}
