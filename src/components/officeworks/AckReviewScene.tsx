/**
 * COMPONENT: AckReviewScene
 * STEP: sc1.9 — Acknowledgment review (HERO #3)
 * PAIN: Gemini supercharge (Gemini already in use today for this exact cross-ref)
 *
 * Side-by-side: original BOM vs Teknion acknowledgment (real PO-DC-0009642)
 * Diff scan across 71 lines + 13 CRs. Three terminal states:
 *   - Order Acknowledged and Confirmed (None type · success)
 *   - Order Confirmed (post-resolve · None type · success)
 *   - Order Held/Canceled (Terminate type · destructive)
 *
 * DS TOKENS: bg-card · bg-muted · bg-success/X · bg-warning/X · bg-destructive/X ·
 *            text-foreground · text-muted-foreground · text-primary
 */

import { useState } from 'react'
import {
    FileCheck, Sparkles, FileText, CheckCircle2, AlertTriangle, XCircle, ArrowRight,
    GitCompare, Send,
} from 'lucide-react'
import { HeroMetric } from 'strata-design-system'
import PDFPreviewModal, { OFFICEWORKS_PDFS } from './shared/PDFPreviewModal'
import { Metro Legal_ORDER_META } from './shared/manattOrderData'
import { CHANGE_ORDER_REASONS } from './shared/auditChecklistSteps'

interface Props { onContinue: () => void }

type AckStep = 'compare' | 'resolve' | 'terminal'
type DiffStatus = 'match' | 'mismatch' | 'partial'
type TerminalState = 'confirmed' | 'resolved' | 'held' | null

interface DiffField {
    field: string
    category: 'header' | 'shipment' | 'line-item' | 'pricing' | 'cr' | 'logistics'
    bomValue: string
    ackValue: string
    status: DiffStatus
    autoFixSuggestion?: string
    severity?: 'low' | 'medium' | 'high'
}

const DIFF_FIELDS: DiffField[] = [
    { field: 'PO Number', category: 'header', bomValue: 'PO-DC-0009642', ackValue: 'PO-DC-0009642', status: 'match' },
    { field: 'Universal #', category: 'header', bomValue: '2-10468963', ackValue: '2-10468963', status: 'match' },
    { field: 'Special Quote #', category: 'header', bomValue: '436533', ackValue: '436533', status: 'match' },
    { field: 'SQ Name', category: 'header', bomValue: 'Metro Legal Firm LLC', ackValue: 'Metro Legal Firm LLC', status: 'match' },
    { field: 'PO Amount', category: 'pricing', bomValue: '$58,711.68', ackValue: '$58,711.68', status: 'match' },
    { field: 'List Total', category: 'pricing', bomValue: '$296,228.13', ackValue: '$296,228.13', status: 'match' },
    { field: 'Net Total', category: 'pricing', bomValue: '$61,464.80', ackValue: '$61,464.80', status: 'match' },
    { field: 'Ship-To Address', category: 'logistics', bomValue: 'Turn Key · Nottingham MD', ackValue: 'Turn Key Office Installations · 10001 Franklin Square Dr · Nottingham MD 21236', status: 'partial', autoFixSuggestion: 'Ack expanded address — verify same physical destination. No action needed.', severity: 'low' },
    { field: 'Sched Ship Date', category: 'shipment', bomValue: '2026/03/20', ackValue: '2026/03/20', status: 'match' },
    { field: 'No change requests after', category: 'shipment', bomValue: '—', ackValue: '2026/01/12', status: 'partial', autoFixSuggestion: 'Teknion added cutoff date. Already past · no changes accepted.', severity: 'medium' },
    { field: 'Line 6 — Part Code (LH HAT)', category: 'line-item', bomValue: 'YSKB9E23586NN__8__83DNV', ackValue: 'YSKB9E23606NN__8__83DNV\\S154K4', status: 'mismatch', autoFixSuggestion: 'Width changed 58→60 per CR 2087977 pricer comment: "follow standard UZWA2460LHD (23" actual depth)". Per PRICER: No radius on corner. Intentional spec match — verify with Kimberly.', severity: 'high' },
    { field: 'CR 2087977 — Leadtime', category: 'cr', bomValue: '35 Days', ackValue: '35 Days', status: 'match' },
    { field: 'CR 2046138 — Leadtime', category: 'cr', bomValue: '40 Days', ackValue: '40 Days', status: 'match' },
    { field: 'CR 2075919 — BIFMA advisory', category: 'cr', bomValue: 'noted', ackValue: 'noted in ack (mock-up strongly recommended)', status: 'match' },
    { field: 'Freight Terms', category: 'logistics', bomValue: '—', ackValue: 'PNS · BEST WAY', status: 'partial', autoFixSuggestion: 'Teknion default freight applied. Aligns with OW standard.', severity: 'low' },
    { field: 'Total line items', category: 'line-item', bomValue: '71', ackValue: '71', status: 'match' },
    { field: 'Tag Legend', category: 'shipment', bomValue: 'WS-01(10), WS-02(6)×2, WS-02.A(8)', ackValue: 'WS-01(10), WS-02(6)×2, WS-02.A(8)', status: 'match' },
    { field: 'Discount Total', category: 'pricing', bomValue: '$234,763.33', ackValue: '$234,763.33', status: 'match' },
]

function statusBadge(s: DiffStatus): { icon: React.ReactElement; cls: string; label: string } {
    if (s === 'match') return { icon: <CheckCircle2 className="h-3.5 w-3.5" />, cls: 'bg-success/10 text-success border-success/20', label: 'Match' }
    if (s === 'partial') return { icon: <AlertTriangle className="h-3.5 w-3.5" />, cls: 'bg-warning/10 text-warning border-warning/20', label: 'Partial' }
    return { icon: <XCircle className="h-3.5 w-3.5" />, cls: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Mismatch' }
}

const categoryLabel: Record<DiffField['category'], string> = {
    header: 'Header',
    shipment: 'Shipment',
    'line-item': 'Line Items',
    pricing: 'Pricing',
    cr: 'CRs',
    logistics: 'Logistics',
}

export default function AckReviewScene({ onContinue }: Props) {
    const [step, setStep] = useState<AckStep>('compare')
    const [terminal, setTerminal] = useState<TerminalState>(null)
    const [showPDF, setShowPDF] = useState(false)
    const [selectedReason, setSelectedReason] = useState<string>('')

    const matchCount = DIFF_FIELDS.filter(d => d.status === 'match').length
    const partialCount = DIFF_FIELDS.filter(d => d.status === 'partial').length
    const mismatchCount = DIFF_FIELDS.filter(d => d.status === 'mismatch').length

    const goToTerminal = (state: TerminalState) => {
        setTerminal(state)
        setStep('terminal')
    }

    if (step === 'terminal') {
        const isHeld = terminal === 'held'
        const Icon = isHeld ? XCircle : CheckCircle2
        const ctaLabel = isHeld ? 'Order Held / Canceled' : terminal === 'resolved' ? 'Order Confirmed (post-resolve)' : 'Order Acknowledged and Confirmed'
        const descLabel = isHeld
            ? 'Discrepancy could not be resolved with Teknion. Order on hold pending action outside this process. (BPMN: End Event Terminate)'
            : terminal === 'resolved'
                ? 'Change Order submitted to ack@teknion.example · Teknion resolved discrepancy. (BPMN: End Event None)'
                : 'Acknowledgment matches BOM · order ready for fulfillment. (BPMN: End Event None)'
        return (
            <div className="bg-card border border-border rounded-xl p-8 space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`h-20 w-20 rounded-full flex items-center justify-center ${isHeld ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                        <Icon className="h-10 w-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground">{ctaLabel}</h2>
                        <p className="text-sm text-muted-foreground mt-2">{descLabel}</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="bg-muted/40 rounded-lg p-3">
                        <div className="text-muted-foreground">Match</div>
                        <div className="text-xl font-semibold text-success tabular-nums">{matchCount}</div>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-3">
                        <div className="text-muted-foreground">Partial</div>
                        <div className="text-xl font-semibold text-warning tabular-nums">{partialCount}</div>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-3">
                        <div className="text-muted-foreground">Mismatch</div>
                        <div className="text-xl font-semibold text-destructive tabular-nums">{mismatchCount}</div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onContinue}
                    className="w-full inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
                >
                    Complete demo flow
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        )
    }

    if (step === 'resolve') {
        return (
            <div className="space-y-4 animate-in fade-in duration-500">
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Resolve discrepancy with Teknion</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Task 12A · draft Change Order to ack@teknion.example · select Change Order Reason from real Design Checklist 2026 list
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                    <label className="block text-sm font-medium text-foreground">
                        Change Order Reason (per OW Design Checklist 2026)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-auto">
                        {CHANGE_ORDER_REASONS.map(reason => (
                            <button
                                key={reason}
                                type="button"
                                onClick={() => setSelectedReason(reason)}
                                className={`text-left rounded-md border p-3 text-xs transition-all ${
                                    selectedReason === reason
                                        ? 'bg-primary/10 text-primary border-primary/40'
                                        : 'bg-card text-foreground border-border hover:bg-muted'
                                }`}
                            >
                                {reason}
                            </button>
                        ))}
                    </div>
                    {selectedReason && (
                        <div className="bg-muted/40 rounded-lg p-3 text-xs space-y-1">
                            <div className="font-medium text-foreground">Selected reason:</div>
                            <div className="text-muted-foreground italic">{selectedReason}</div>
                        </div>
                    )}
                </div>

                <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
                    <div className="text-xs text-muted-foreground">
                        GW6B: Was the discrepancy resolved?
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => goToTerminal('resolved')}
                            disabled={!selectedReason}
                            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-success/10 hover:bg-success/20 text-success border border-success/20 text-sm font-medium disabled:opacity-50"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Resolved · Order Confirmed
                        </button>
                        <button
                            type="button"
                            onClick={() => goToTerminal('held')}
                            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 text-sm font-medium"
                        >
                            <XCircle className="h-3.5 w-3.5" />
                            Unresolvable · Order Held
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // === COMPARE step (default) ===
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Acknowledgment review · {Metro Legal_ORDER_META.poNumber}</h2>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3 text-primary" />
                                Gemini already in use today at Officeworks — Strata supercharges the diff
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowPDF(true)}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-card hover:bg-muted text-xs font-medium text-foreground"
                    >
                        <FileText className="h-3.5 w-3.5" />
                        View Original Ack PDF
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
                <HeroMetric tone="success" label="Match"    value={matchCount}    sub="fields aligned"  icon={<CheckCircle2 className="h-4 w-4" />} />
                <HeroMetric tone="warning" label="Partial"  value={partialCount}  sub="auto-resolvable" icon={<AlertTriangle className="h-4 w-4" />} />
                <HeroMetric tone="danger"  label="Mismatch" value={mismatchCount} sub="requires review" icon={<XCircle className="h-4 w-4" />} />
            </div>

            {/* Diff table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2 text-sm text-foreground bg-muted/40">
                    <GitCompare className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Field-by-field comparison · BOM vs Teknion Acknowledgment</span>
                </div>
                <div className="divide-y divide-border max-h-[500px] overflow-auto">
                    {DIFF_FIELDS.map((d, i) => {
                        const b = statusBadge(d.status)
                        return (
                            <div key={i} className="px-4 py-3 grid grid-cols-12 gap-3 items-start text-sm hover:bg-muted/20 transition-colors">
                                <div className="col-span-3">
                                    <div className="text-foreground font-medium">{d.field}</div>
                                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">{categoryLabel[d.category]}</div>
                                </div>
                                <div className="col-span-3 text-muted-foreground font-mono text-xs">
                                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground block">BOM</span>
                                    <span className="text-foreground">{d.bomValue}</span>
                                </div>
                                <div className="col-span-4 text-muted-foreground font-mono text-xs">
                                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground block">Acknowledgment</span>
                                    <span className="text-foreground">{d.ackValue}</span>
                                </div>
                                <div className="col-span-2 text-right">
                                    <div className={`inline-flex items-center gap-1 text-xs border rounded-md px-2 py-1 ${b.cls}`}>
                                        {b.icon}
                                        <span className="font-medium">{b.label}</span>
                                    </div>
                                    {d.autoFixSuggestion && (
                                        <div className="text-[10px] text-muted-foreground italic mt-1 max-w-[200px]">
                                            {d.autoFixSuggestion}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Footer CTAs (GW6) */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
                <div className="text-xs text-muted-foreground">
                    GW6: Does acknowledgment match BOM? {mismatchCount > 0 ? `· ${mismatchCount} mismatch needs review` : '· all aligned'}
                </div>
                <div className="flex gap-2">
                    {mismatchCount === 0 ? (
                        <button
                            type="button"
                            onClick={() => goToTerminal('confirmed')}
                            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Confirm match
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setStep('resolve')}
                            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-warning/10 hover:bg-warning/20 text-warning border border-warning/20 text-sm font-medium"
                        >
                            <Send className="h-3.5 w-3.5" />
                            Open discrepancy resolution
                        </button>
                    )}
                </div>
            </div>

            <PDFPreviewModal
                isOpen={showPDF}
                onClose={() => setShowPDF(false)}
                pdfSrc={OFFICEWORKS_PDFS.poAcknowledgment}
                title={`Order Acknowledgment · ${Metro Legal_ORDER_META.poNumber}`}
                subtitle={`Metro Legal Firm LLC · 4th Floor · 71 line items · Net $${Metro Legal_ORDER_META.netTotal.toLocaleString()}`}
                badge="Real document"
            />
        </div>
    )
}
