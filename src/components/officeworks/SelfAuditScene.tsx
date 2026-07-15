/**
 * COMPONENT: SelfAuditScene
 * STEP: sc1.6 — Self-audit: BOM × 6 attributes (HERO #1)
 * PAIN: SC2 (CEO #1 · Manual BOM spec check) + SC3 (CR Lookup context switch)
 *
 * Structure literal del PDF audit checklist 2026 (5-step):
 *   1. Big Picture
 *   2. Validation Document
 *   3. BOM & Drawing (HERO STEP · 8 sub-categories)
 *   4. Review CRs (Task 8A NESTED in Task 8)
 *   5. One Last Check
 *
 * Opens with toggle "Today (paper)" → "With Strata (digital)" to dramatize shift.
 *
 * DS TOKENS: bg-card · bg-muted · bg-success/X · bg-warning/X · bg-destructive/X ·
 *            text-foreground · text-muted-foreground · text-primary
 */

import { useState } from 'react'
import {
    ClipboardCheck, FileText, Printer, Sparkles, ArrowRight, CheckCircle2,
    AlertTriangle, AlertCircle, Eye, Search,
} from 'lucide-react'
import BOMTable from './shared/BOMTable'
import PDFPreviewModal, { OFFICEWORKS_PDFS } from './shared/PDFPreviewModal'
import { AUDIT_CHECKLIST_STEPS, AUDITOR_GOLDEN_RULE, PRINT_STATE_QUOTE } from './shared/auditChecklistSteps'
import { MANATT_BOM_LINES, MANATT_AUDIT_ISSUES, type BOMLine } from './shared/manattOrderData'

interface Props { onContinue: () => void }

type AuditStepNum = 1 | 2 | 3 | 4 | 5

export default function SelfAuditScene({ onContinue }: Props) {
    const [mode, setMode] = useState<'paper' | 'strata'>('paper')
    const [activeStep, setActiveStep] = useState<AuditStepNum>(1)
    const [showPDF, setShowPDF] = useState(false)
    const [selectedCR, setSelectedCR] = useState<BOMLine | null>(null)

    const linesChecked = mode === 'strata' ? MANATT_BOM_LINES.length - MANATT_AUDIT_ISSUES.critical : 0

    if (mode === 'paper') {
        return (
            <div className="bg-card border border-border rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                        <Printer className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold text-foreground">Self-audit · Today's reality</h2>
                        <p className="text-sm text-muted-foreground">
                            How spec checks happen at Officeworks today — 100% paper, pen, highlighter. No laptop screens allowed.
                        </p>
                    </div>
                </div>

                <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 text-sm space-y-3">
                    <div className="font-medium text-foreground">From the OW Audit Checklist 2026 (real document):</div>
                    <blockquote className="border-l-2 border-warning pl-3 italic text-muted-foreground">
                        "{PRINT_STATE_QUOTE}"
                    </blockquote>
                    <div className="font-medium text-foreground mt-3">Auditor's golden rule:</div>
                    <blockquote className="border-l-2 border-warning pl-3 italic text-muted-foreground">
                        "{AUDITOR_GOLDEN_RULE}"
                    </blockquote>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/40 rounded-lg p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Today</div>
                        <div className="text-2xl font-semibold text-foreground tabular-nums">~6h</div>
                        <div className="text-xs text-muted-foreground mt-1">per spec check · paper + highlighter</div>
                    </div>
                    <div className="bg-success/5 border border-success/20 rounded-lg p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">With Strata</div>
                        <div className="text-2xl font-semibold text-success tabular-nums">~25min</div>
                        <div className="text-xs text-success mt-1">14× faster · AI-assisted</div>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">CEO Priority</div>
                        <div className="text-2xl font-semibold text-foreground tabular-nums">#1</div>
                        <div className="text-xs text-muted-foreground mt-1">SC2 (Chris Hanes confirmed)</div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={() => setMode('strata')}
                        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                    >
                        <Sparkles className="h-4 w-4" />
                        Run audit with Strata
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowPDF(true)}
                        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md border border-border bg-card hover:bg-muted text-sm font-medium text-foreground transition-colors"
                    >
                        <FileText className="h-4 w-4" />
                        View Audit Checklist used today
                    </button>
                </div>

                <PDFPreviewModal
                    isOpen={showPDF}
                    onClose={() => setShowPDF(false)}
                    pdfSrc={OFFICEWORKS_PDFS.auditChecklist}
                    title="OW Audit Checklist 2026"
                    subtitle="Used during self audit + peer audit · 5 steps · real document"
                    badge="Real document"
                />
            </div>
        )
    }

    // === STRATA mode ===
    const stepData = AUDIT_CHECKLIST_STEPS.find(s => s.stepNumber === activeStep)!

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-card border border-border rounded-xl p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Self-audit · MANATT 4th Floor</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            5-step audit · 71 lines · 13 CRs · Kimberly Tucker (DC cross-market)
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <div className="bg-success/10 text-success border border-success/20 rounded-md px-2.5 py-1 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="font-medium tabular-nums">Lines: {linesChecked}/{MANATT_BOM_LINES.length}</span>
                    </div>
                    <div className="bg-warning/10 text-warning border border-warning/20 rounded-md px-2.5 py-1 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span className="font-medium tabular-nums">Issues: {MANATT_AUDIT_ISSUES.critical + MANATT_AUDIT_ISSUES.advisory}</span>
                    </div>
                </div>
            </div>

            {/* Step tabs */}
            <div className="bg-card border border-border rounded-xl p-2 flex gap-1 overflow-x-auto">
                {AUDIT_CHECKLIST_STEPS.map(step => (
                    <button
                        key={step.stepNumber}
                        type="button"
                        onClick={() => setActiveStep(step.stepNumber)}
                        className={`flex-shrink-0 inline-flex items-center gap-2 h-9 px-3 rounded-md text-sm transition-colors ${
                            activeStep === step.stepNumber
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <span className="font-mono text-xs tabular-nums">{step.stepNumber}</span>
                        <span className="font-medium">{step.title}</span>
                        {activeStep === step.stepNumber && step.stepNumber === 3 && (
                            <span className="text-[10px] uppercase tracking-wider bg-primary-foreground/20 px-1.5 py-0.5 rounded">Hero</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Step body */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">Step {stepData.stepNumber}</span>
                        <span>{stepData.title}</span>
                    </h3>
                    {activeStep === 3 && (
                        <div className="text-xs text-primary bg-primary/10 border border-primary/20 rounded px-2 py-1">
                            <Sparkles className="h-3 w-3 inline mr-1" />
                            AI cross-ref: Floor Plan + Validation Doc + Create CR DB
                        </div>
                    )}
                </div>

                {activeStep === 3 ? (
                    <>
                        <BOMTable
                            onCRClick={(line) => setSelectedCR(line)}
                        />
                        {/* CR lookup inline panel (Task 8A NESTED) */}
                        {selectedCR && (
                            <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 space-y-2 animate-in fade-in slide-in-from-right-2 duration-400">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Search className="h-4 w-4 text-warning" />
                                        Create platform · CR {selectedCR.crNumber}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCR(null)}
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Close
                                    </button>
                                </div>
                                <div className="text-xs text-muted-foreground italic">
                                    No context switch — Create platform embedded inline (SC3 dramatized)
                                </div>
                                <dl className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <dt className="text-muted-foreground">Leadtime:</dt>
                                        <dd className="font-mono text-foreground">{selectedCR.crLeadDays} days</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">Unit list:</dt>
                                        <dd className="font-mono text-foreground">${selectedCR.unitList.toLocaleString()}</dd>
                                    </div>
                                </dl>
                                {selectedCR.crNotes && (
                                    <div className="text-xs text-foreground bg-card border border-border rounded p-2 mt-2">
                                        {selectedCR.crNotes}
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCR(null)}
                                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-success/10 hover:bg-success/20 text-success text-xs font-medium border border-success/20"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Verify · matches BOM
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCR(null)}
                                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-warning/10 hover:bg-warning/20 text-warning text-xs font-medium border border-warning/20"
                                    >
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        Flag for revision
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Sub-categories list (collapsed) */}
                        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                            <div className="font-medium text-foreground mb-2">8 sub-categories verified per the Audit Checklist:</div>
                            <ul className="grid grid-cols-2 md:grid-cols-4 gap-1">
                                {stepData.subCategories?.map(cat => (
                                    <li key={cat.name} className="bg-muted/40 rounded px-2 py-1 text-foreground">
                                        ✓ {cat.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                ) : (
                    <ul className="space-y-2 text-sm">
                        {stepData.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${item.critical ? 'text-warning' : 'text-success'}`} />
                                <span className="text-foreground">
                                    {item.label}
                                    {item.critical && <span className="ml-2 text-[10px] uppercase tracking-wider font-bold text-warning">Critical</span>}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Footer CTAs */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
                <div className="text-xs text-muted-foreground">
                    Estimated time saved: <span className="text-success font-semibold">6h → 25min</span> · 14× faster vs paper audit
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setShowPDF(true)}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-card hover:bg-muted text-xs font-medium text-foreground"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        View Audit Checklist
                    </button>
                    <button
                        type="button"
                        onClick={onContinue}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
                    >
                        Send to peer review
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <PDFPreviewModal
                isOpen={showPDF}
                onClose={() => setShowPDF(false)}
                pdfSrc={OFFICEWORKS_PDFS.auditChecklist}
                title="OW Audit Checklist 2026"
                subtitle="Used during self audit + peer audit · 5 steps · real document"
                badge="Real document"
            />
        </div>
    )
}
