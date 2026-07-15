/**
 * COMPONENT: BFIDocViewer
 * Renders an actual PDF from /public/docs/bfi/ inside an iframe.
 * Falls back to a "file not yet uploaded" placeholder if the file is missing.
 * Supports sampleLabel (Sample badge), extractedFields (AI extraction card),
 * rotate90 (for landscape PDFs scanned as portrait), and a fullscreen modal preview.
 */

import { FileText, AlertTriangle, Sparkles, CheckCircle2, Download, Expand, X, Edit2, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ExtractedField {
    label: string
    value: string
    highlight?: boolean
}

interface BFIDocViewerProps {
    src: string
    label: string
    height?: number
    badge?: string
    badgeColor?: 'warning' | 'destructive' | 'success' | 'muted'
    sampleLabel?: string
    extractedFields?: readonly ExtractedField[]
    rotate90?: boolean
}

const BADGE_STYLES: Record<string, string> = {
    warning:     'bg-warning/10 text-warning border-warning/30',
    destructive: 'bg-destructive/10 text-destructive border-destructive/30',
    success:     'bg-success/10 text-success border-success/30',
    muted:       'bg-muted/60 text-muted-foreground border-border',
}

export default function BFIDocViewer({
    src,
    label,
    height = 420,
    badge,
    badgeColor = 'muted',
    sampleLabel,
    extractedFields,
    rotate90 = false,
}: BFIDocViewerProps) {
    const [loaded, setLoaded]       = useState(false)
    const [error, setError]         = useState(false)
    const [modalOpen, setModalOpen] = useState(false)

    // Editable extracted fields
    const [editingFields, setEditingFields]   = useState(false)
    const [fieldValues, setFieldValues]       = useState<Record<string, string>>({})
    const [originalValues, setOriginalValues] = useState<Record<string, string>>({})
    const [fieldsSaved, setFieldsSaved]       = useState(false)

    useEffect(() => {
        if (!extractedFields) return
        const init: Record<string, string> = {}
        extractedFields.forEach(f => { init[f.label] = f.value })
        setFieldValues(init)
        setOriginalValues(init)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSaveFields = () => {
        setEditingFields(false)
        setFieldsSaved(true)
    }

    const filename = src.split('/').pop() ?? 'document.pdf'

    const iframeEl = (w: string | number, h: number) => (
        <iframe
            src={`${src}#toolbar=0&navpanes=0&scrollbar=1`}
            width={w}
            height={h}
            className="block border-0"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            title={label}
        />
    )

    return (
        <>
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                {/* Header */}
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-muted/40 border-b border-border">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex-1 truncate">
                        {label}
                    </span>
                    {badge && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide shrink-0 ${BADGE_STYLES[badgeColor]}`}>
                            {badge}
                        </span>
                    )}
                    {sampleLabel && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded border bg-warning/10 text-amber-600 dark:text-amber-400 border-warning/30 font-mono shrink-0">
                            Sample · {sampleLabel}
                        </span>
                    )}
                    {/* Preview button */}
                    <button
                        onClick={() => setModalOpen(true)}
                        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        title="Preview PDF"
                    >
                        <Expand className="h-3 w-3" />
                    </button>
                    {/* Download button */}
                    <a
                        href={src}
                        download={filename}
                        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        title="Download PDF"
                    >
                        <Download className="h-3 w-3" />
                    </a>
                </div>

                {/* PDF iframe or error */}
                {!error ? (
                    <div className="relative" style={{ height }}>
                        {!loaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                                <div className="h-5 w-5 border-2 border-ai border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                        {rotate90 ? (
                            <div className="overflow-hidden" style={{ height }}>
                                <div style={{
                                    transform: 'rotate(90deg)',
                                    transformOrigin: 'center center',
                                    width: height,
                                    height: '100%',
                                    marginLeft: `calc(50% - ${height / 2}px)`,
                                }}>
                                    {iframeEl('100%', height)}
                                </div>
                            </div>
                        ) : (
                            iframeEl('100%', height)
                        )}
                    </div>
                ) : (
                    <div
                        className="flex flex-col items-center justify-center gap-2 bg-muted/10 text-muted-foreground"
                        style={{ height }}
                    >
                        <AlertTriangle className="h-6 w-6 text-warning" />
                        <p className="text-[11px] font-medium text-center px-4">
                            File not found · Copy PDF to <span className="font-mono text-foreground">public{src}</span>
                        </p>
                    </div>
                )}

                {/* AI extraction card */}
                {extractedFields && extractedFields.length > 0 && (
                    <div className="border-t border-ai/20 bg-ai/5">
                        <div className="flex items-center gap-2 px-3.5 py-2 border-b border-ai/20 bg-ai/10">
                            <Sparkles className="h-3 w-3 text-ai shrink-0" />
                            <span className="text-[10px] font-bold text-ai uppercase tracking-wide">
                                Strata AI · Extracted Fields
                            </span>
                            <div className="ml-auto flex items-center gap-2">
                                {fieldsSaved ? (
                                    <span className="text-[9px] text-warning font-bold flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Edited · AI verified
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-1 text-[9px] text-success font-bold">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Digitized
                                    </div>
                                )}
                                {!fieldsSaved && (
                                    editingFields ? (
                                        <button
                                            onClick={handleSaveFields}
                                            className="flex items-center gap-1 text-[9px] font-bold text-ai hover:text-ai/80 transition-colors"
                                        >
                                            <Save className="h-3 w-3" />
                                            Save
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setEditingFields(true)}
                                            className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                            Edit
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                        <div className="divide-y divide-ai/10">
                            {extractedFields.map(f => {
                                const currentVal = fieldValues[f.label] ?? f.value
                                const changed = fieldsSaved && currentVal !== originalValues[f.label]
                                return (
                                    <div
                                        key={f.label}
                                        className={`flex items-start justify-between gap-3 px-3.5 py-1.5 ${
                                            f.highlight && !editingFields ? 'bg-destructive/5' : ''
                                        } ${changed ? 'bg-warning/5' : ''}`}
                                    >
                                        <span className="text-[10px] text-muted-foreground shrink-0">{f.label}</span>
                                        {editingFields ? (
                                            <input
                                                value={currentVal}
                                                onChange={e => setFieldValues(prev => ({ ...prev, [f.label]: e.target.value }))}
                                                className="text-[10px] font-medium font-mono text-right bg-transparent border-b border-ai/40 text-foreground outline-none w-40 focus:border-ai"
                                            />
                                        ) : (
                                            <span className={`text-[10px] font-medium font-mono text-right ${
                                                changed ? 'text-warning' : f.highlight ? 'text-destructive' : 'text-foreground'
                                            }`}>
                                                {currentVal}
                                                {changed && <span className="ml-1 text-[8px] opacity-70">(edited)</span>}
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Fullscreen modal */}
            {modalOpen && createPortal(
                <div className="fixed inset-0 z-50 bg-black/70 flex flex-col" onClick={() => setModalOpen(false)}>
                    <div
                        className="flex items-center gap-3 px-4 py-3 bg-zinc-950 border-b border-zinc-800 shrink-0"
                        onClick={e => e.stopPropagation()}
                    >
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-zinc-200 font-medium flex-1 truncate">{label}</span>
                        {sampleLabel && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono shrink-0">
                                Sample · {sampleLabel}
                            </span>
                        )}
                        <a
                            href={src}
                            download={filename}
                            className="text-muted-foreground hover:text-white transition-colors shrink-0"
                            title="Download PDF"
                        >
                            <Download className="h-4 w-4" />
                        </a>
                        <button
                            onClick={() => setModalOpen(false)}
                            className="text-muted-foreground hover:text-white transition-colors shrink-0"
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <iframe
                        src={`${src}#toolbar=1&navpanes=0`}
                        className="flex-1 w-full border-0"
                        title={label}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    />
                </div>,
                document.body
            )}
        </>
    )
}

/**
 * Pre-configured document shortcuts used across BFI scenes.
 * Import { BFI_DOCS } and spread into BFIDocViewer: <BFIDocViewer {...BFI_DOCS.RR_37577_MISSING} height={380} />
 */
export const BFI_DOCS = {
    RR_37577_MISSING: {
        src:        '/docs/bfi/receiving/RR-37577-missing.pdf',
        label:      'RR-37577 · DA Bronx County · GD2574 · 04/28/26',
        badge:      'Missing carton #34',
        badgeColor: 'warning' as const,
        sampleLabel: 'DA Bronx County',
        extractedFields: [
            { label: 'RR #',             value: '37577' },
            { label: 'Date',             value: '04/28/2026' },
            { label: 'Client',           value: 'DA Bronx County' },
            { label: 'Manufacturer',     value: 'Herman Miller' },
            { label: 'PO #',             value: '18082-27619' },
            { label: 'SO #',             value: 'GD2574' },
            { label: 'Carrier',          value: 'ALTL' },
            { label: 'Cartons shipped',  value: '36' },
            { label: 'Cartons received', value: '35' },
            { label: 'Missing carton',   value: '#34', highlight: true },
            { label: 'Product',          value: 'Lock & Key, Flip Door, Tack Board, Meridian Pull' },
        ],
    },
    RR_37578_NORMAL: {
        src:        '/docs/bfi/receiving/RR-37578-normal.pdf',
        label:      'RR-37578 · NY Public Library · GF2380 · 04/28/26',
        badge:      'Complete',
        badgeColor: 'success' as const,
        sampleLabel: 'NY Public Library',
        extractedFields: [
            { label: 'RR #',             value: '37578' },
            { label: 'Date',             value: '04/28/2026' },
            { label: 'Client',           value: 'NY Public Library' },
            { label: 'Manufacturer',     value: 'Herman Miller' },
            { label: 'PO #',             value: '17564-27927' },
            { label: 'SO #',             value: 'GF2380' },
            { label: 'Carrier',          value: 'ALTL' },
            { label: 'Cartons received', value: '19 / 19 ✓' },
            { label: 'Damage',           value: 'None' },
            { label: 'Product',          value: 'Stacking Chair · Caper Cart' },
        ],
    },
    INVOICE_030923: {
        src:        '/docs/bfi/invoices/invoice-030923-NYPL.pdf',
        label:      'Invoice 030923 · WIG → BFI · NYPL Q27216',
        badge:      '$1,210',
        badgeColor: 'muted' as const,
        sampleLabel: 'NYPL · Workplace Installation Group',
        extractedFields: [
            { label: 'Invoice #',        value: '030923' },
            { label: 'Date',             value: '05/11/2026' },
            { label: 'From',             value: 'Workplace Installation Group' },
            { label: 'Bill to',          value: 'BFI — 133 Rahway Ave, Elizabeth NJ' },
            { label: 'Ship to',          value: 'NY Public Library · Bronx, NY' },
            { label: 'PO #',             value: '17706-27340' },
            { label: 'Inside delivery',  value: '$510.00 (1 × $510)' },
            { label: 'Installation',     value: '$700.00 (4 hrs × $175)' },
            { label: 'Total',            value: '$1,210.00', highlight: true },
            { label: 'Terms',            value: 'Due on receipt' },
        ],
    },
    INVOICE_EMAIL_17706: {
        src:        '/docs/bfi/invoices/invoice-email-17706.pdf',
        label:      'Invoice Package Email · Thomas Conroy → Michael Boyle',
        badgeColor: 'muted' as const,
        sampleLabel: 'NYPL Q27216 (17706)',
        extractedFields: [
            { label: 'Subject',      value: 'Invoice Package for NYPL Q27216 (17706)' },
            { label: 'From',         value: 'Thomas Conroy · Workplace Installation Group' },
            { label: 'To',           value: 'Michael Boyle · BFI' },
            { label: 'Date',         value: '05/11/2026 · 3:03 PM' },
            { label: 'Attachments',  value: '3 files (729 KB)', highlight: true },
            { label: 'File 1',       value: 'Invoice (17706-27340) NYPL 27216.pdf' },
            { label: 'File 2',       value: 'Sign In Sheet NYPL 27216 (17706).pdf' },
            { label: 'File 3',       value: 'Signed CPR NYPL 27216 (17706).pdf' },
        ],
    },
    CPR_DOT_25271: {
        src:        '/docs/bfi/cpr/CPR-DOT-25271.pdf',
        label:      'CPR · DOT 25271 · 7 payrolls · Mar–Apr 2026',
        badgeColor: 'muted' as const,
        sampleLabel: 'NYC DOT · 7 payrolls',
        extractedFields: [
            { label: 'Contractor',  value: 'Workplace Installation Group LLC' },
            { label: 'Project',     value: 'NYC Dept of Transportation' },
            { label: 'Address',     value: '101 Varick Ave, Brooklyn, NY 11237' },
            { label: 'Payrolls',    value: '7 (001–007)' },
            { label: 'Period',      value: '03/21/2026 – 04/25/2026' },
            { label: 'Workers',     value: '10 (T. Holcombe, E. Britton, D. Vaz, +7)' },
            { label: 'Roles',       value: 'Carpenter/Foreman Local 254, Journeyperson Local 157/253' },
            { label: 'Signed by',   value: 'Thomas Conroy, President' },
        ],
    },
    CPR_NYPL_17706: {
        src:        '/docs/bfi/cpr/CPR-NYPL-17706.pdf',
        label:      'Signed CPR · NYPL 27216 · Mark Mross · Apr 11 2026',
        badge:      'Signed',
        badgeColor: 'success' as const,
        sampleLabel: 'NYPL · Payroll #001',
        extractedFields: [
            { label: 'Contractor',    value: 'Workplace Installation Group LLC' },
            { label: 'Project',       value: 'NY Public Library · 1866 Washington Ave, Bronx' },
            { label: 'Payroll #',     value: '001' },
            { label: 'Week ending',   value: '04/11/2026' },
            { label: 'Employee',      value: 'Mark Mross' },
            { label: 'Classification',value: 'Carpenter · General Foreman · Local 157' },
            { label: 'Hours worked',  value: '4 hrs (4/6–4/11)' },
            { label: 'Rate',          value: '$65.05 / hr' },
            { label: 'Gross Pay',     value: '$260.20' },
            { label: 'Net Pay',       value: '$170.32' },
            { label: 'Signed by',     value: 'Thomas Conroy, President · Apr 17' },
        ],
    },
    SIGNIN_NYPL_17706: {
        src:        '/docs/bfi/signin/signin-NYPL-17706.pdf',
        label:      'Sign In Sheet · NYPL · Mark Mross · 4-9-26',
        badge:      'Signed',
        badgeColor: 'success' as const,
        sampleLabel: 'NYPL · Bronx, NY',
        extractedFields: [
            { label: 'Prime contractor',   value: 'Miller Knoll' },
            { label: 'Subcontractor',      value: 'BFI / WIG' },
            { label: 'Project',            value: 'NY Public Library · 1866 Washington Ave' },
            { label: 'Date',               value: '04/09/2026' },
            { label: 'Employee',           value: 'Mark Mross' },
            { label: 'Classification',     value: 'Carpenter' },
            { label: 'Time in',            value: '1:00 PM' },
            { label: 'Time out',           value: '3:30 PM' },
            { label: 'Employee signature', value: 'Mark Mross ✓' },
            { label: 'Supervisor',         value: 'Thomas Conroy, President · 4-9-26' },
        ],
    },
} as const
