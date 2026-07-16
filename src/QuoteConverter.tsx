/**
 * QuoteConverter · SIF Generator (list-first) + Upload modal (4 steps)
 *
 * The full-page wizard was replaced by a list-first view that matches the
 * production app (Leland). Documents live in a table/grid with a status
 * funnel; "Upload Document" opens a 4-step modal (select → review →
 * uploading → complete). When the upload completes, the new document
 * lands in the list as "Ingesting · Unknown Vendor ·
 * Ingesting…" and resolves to "Ready to Review" (e.g. SO2604102 ·
 * Leland Furniture · Pending For Review) after ~4 seconds.
 *
 * Built with Headless UI + tokens + lucide.
 */

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import {
    FileText, Upload, X, Check, AlertCircle, AlertTriangle,
    ChevronRight, CheckCircle2, Search, Trash2, List, LayoutGrid, Plus,
    Sparkles, ExternalLink, Package, GripVertical, Pencil, Save, ChevronDown,
    Download, Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
// F26.E — replace the inline 4-step upload subtree (~233 LOC) with the DS
// FileUploadModal. Same flow exactly; impl moved to packages/strata-ds.
// F26.E.5 — replace the DocumentReviewModal shell + LineItemsView/LineRow
// with DS DocumentReviewModal + EditableLineTable.
import {
    FileUploadModal,
    type FileUploadStep,
    DocumentReviewModal as DSDocumentReviewModal,
    ConfidenceIndicator,
    EditableLineTable,
    type EditableLineColumn,
} from 'strata-design-system'

// ── Types ───────────────────────────────────────────────────────────────────
type FieldSection = 'SIF Configuration' | 'Quote Info' | 'Vendor' | 'Terms'

const FIELD_SECTIONS: { key: FieldSection; label: string; Icon: LucideIcon }[] = [
    { key: 'SIF Configuration', label: 'SIF Configuration', Icon: Settings },
    { key: 'Quote Info',        label: 'Quote Info',        Icon: Package  },
    { key: 'Vendor',            label: 'Vendor',            Icon: Package  },
    { key: 'Terms',             label: 'Terms',             Icon: Package  },
]

interface Field {
    id: string
    section: FieldSection
    label: string
    extracted: string
    suggestion: string
    confidence: number
    userValue: string
}

interface LineItem {
    id: string
    line: number
    partNumber: string
    description: string
    optionCode: string
    optionDescription: string
    qty: number
    unitPrice: number
    extended: number
    confidence: number
    suggestion: string
    userValue: string
    sku?: string
    listPrice?: number
    weight?: number
    tag?: string
}

// ── Mock data (grounded in Leland Order SO2604102) ──────────────────────────
const FIELD_TEMPLATES: { section: FieldSection; label: string; suggestion: (n: number) => string; conf: number; wrong?: (n: number) => string }[] = [
    // SIF Configuration
    { section: 'SIF Configuration', label: 'Catalog Code',      conf: 0,  suggestion: _ => '' },
    { section: 'SIF Configuration', label: 'Manufacturer Code', conf: 0,  suggestion: _ => '' },
    // Quote Info
    { section: 'Quote Info', label: 'Quote Number',     conf: 97, suggestion: n => `SO${2604102 + n}` },
    { section: 'Quote Info', label: 'Quote Date',       conf: 96, suggestion: _ => 'Mar 28, 2025' },
    { section: 'Quote Info', label: 'Linked PO Number', conf: 71, suggestion: _ => '4522 - 7162', wrong: _ => '4522 - 716' },
    // Vendor
    { section: 'Vendor', label: 'Dealer',        conf: 98, suggestion: _ => 'Leland Furniture' },
    { section: 'Vendor', label: 'Ship-to',       conf: 88, suggestion: _ => 'Continua IL Warehouse, Lincolnshire IL 60069' },
    { section: 'Vendor', label: 'Sales Rep',     conf: 52, suggestion: _ => 'David Park', wrong: _ => '' },
    { section: 'Vendor', label: 'Contact Email', conf: 49, suggestion: _ => 'orders@leland.com', wrong: _ => 'orders@leLand.com' },
    // Terms
    { section: 'Terms', label: 'Discount Terms', conf: 95, suggestion: _ => 'Contract · 60.8% avg' },
    { section: 'Terms', label: 'Freight Terms',  conf: 90, suggestion: _ => 'LTL · prepaid & add' },
    { section: 'Terms', label: 'Quoted Total',   conf: 93, suggestion: _ => '$4,159.12' },
]

const LINE_TEMPLATES: { partNumber: string; description: string; optionCode: string; optionDescription: string; qty: number; unitPrice: number; conf: number; suggestion?: string }[] = [
    { partNumber: 'T-RCR306029HLG2', description: 'TBL, REC, 30Dx60Wx29H', optionCode: 'LG2', optionDescription: 'Loft Gray finish', qty: 4, unitPrice: 479.18, conf: 96 },
    { partNumber: 'F-SSC346030C', description: 'LB LOUNGE 2 SEAT 34"H', optionCode: 'CF-6036', optionDescription: 'Ocean Blue fabric', qty: 2, unitPrice: 2031.12, conf: 63, suggestion: 'CF-6036 Ocean Blue (Tier B · CF Stinson)' },
    { partNumber: '7730', description: 'AUBURN GRAY CONFERENCE CHAIR', optionCode: 'GR-5505', optionDescription: 'Charcoal fabric', qty: 12, unitPrice: 471.60, conf: 58, suggestion: 'GR-5505 Charcoal (Tier C · Maharam · verify approval)' },
    { partNumber: 'P-PN60HBF', description: 'PANEL 60Hx48W FABRIC BOTH', optionCode: 'CF-6036', optionDescription: 'Ocean Blue fabric', qty: 10, unitPrice: 338.96, conf: 92 },
    { partNumber: 'X-LTD661218L', description: 'CBX Triple Door Locker', optionCode: 'KA', optionDescription: 'Keyed Alike', qty: 8, unitPrice: 697.68, conf: 94 },
    { partNumber: 'W-WS3072', description: 'WORKSURFACE RECT 30Dx72W', optionCode: 'SE', optionDescription: 'Straight Edge', qty: 6, unitPrice: 249.28, conf: 90 },
]

function buildExtract(index: number): { fields: Field[]; lineItems: LineItem[] } {
    const fields: Field[] = FIELD_TEMPLATES.map((t, i) => {
        const suggestion = t.suggestion(index)
        const extracted = t.conf >= 85 ? suggestion : (t.conf >= 60 && t.wrong ? t.wrong(index) : '')
        return { id: `f-${index}-${i}`, section: t.section, label: t.label, extracted, suggestion, confidence: t.conf, userValue: suggestion }
    })
    const lineItems: LineItem[] = LINE_TEMPLATES.map((t, i) => ({
        id: `l-${index}-${i}`, line: i + 1, partNumber: t.partNumber, description: t.description,
        optionCode: t.optionCode, optionDescription: t.optionDescription, qty: t.qty, unitPrice: t.unitPrice,
        extended: Math.round(t.qty * t.unitPrice * 100) / 100, confidence: t.conf,
        suggestion: t.suggestion ?? `${t.optionCode} ${t.optionDescription}`, userValue: `${t.optionCode} ${t.optionDescription}`,
        sku: t.partNumber, listPrice: 0, weight: 0, tag: '',
    }))
    return { fields, lineItems }
}

// ── SIF Generator list ──────────────────────────────────────────────────────
type DocKind = 'RFQ' | 'Quote' | 'Order' | 'Acknowledgement' | 'Proforma'
type ListStatus = 'ingesting' | 'ready' | 'completed' | 'deprecated'
type ReviewStatus = 'reviewed' | 'pending'

interface ListDoc {
    id: string
    name: string
    vendor: string
    kind: DocKind
    status: ListStatus
    reviewStatus: ReviewStatus
    dateLabel: string
    assignee: string
    fields: Field[]
    lineItems: LineItem[]
}

const LIST_SEED: { id: string; name: string; vendor: string; kind: DocKind; status: ListStatus; reviewStatus: ReviewStatus; dateLabel: string; assignee: string }[] = [
    { id: 'D-001', name: 'NorthPoint RFQ-2026-001', vendor: 'Northline Furniture Group', kind: 'RFQ', status: 'ready', reviewStatus: 'pending', dateLabel: '2 days ago', assignee: 'SC' },
    { id: 'D-002', name: 'Quote QT-1025', vendor: 'Northline Furniture Group', kind: 'Quote', status: 'ready', reviewStatus: 'reviewed', dateLabel: '2 days ago', assignee: 'SC' },
    { id: 'D-003', name: 'Leland Order SO2604102', vendor: 'Leland Furniture', kind: 'Order', status: 'completed', reviewStatus: 'reviewed', dateLabel: '3 days ago', assignee: 'DP' },
    { id: 'D-004', name: 'Acknowledgement ORD-2055', vendor: 'AIS · Affordable Interior Systems', kind: 'Acknowledgement', status: 'ready', reviewStatus: 'pending', dateLabel: '1 day ago', assignee: 'SC' },
    // Post-Neocon-review (2026-06-05): was status 'ingesting' (stuck spinner forever)
    // because nothing resolved the seed entry. The Ingesting state should ONLY appear
    // when the user just uploaded a file (resolved by finishUpload after ~4s).
    { id: 'D-005', name: 'Cascade PO ORD-2054', vendor: 'Cascade Workplace Co', kind: 'Order', status: 'ready', reviewStatus: 'pending', dateLabel: 'Just now', assignee: 'DP' },
    { id: 'D-006', name: 'Pacific Quote QT-1024', vendor: 'Pacific Workspaces', kind: 'Quote', status: 'completed', reviewStatus: 'reviewed', dateLabel: '5 days ago', assignee: 'SC' },
    { id: 'D-007', name: 'Heritage Ack ORD-2050', vendor: 'Legacy Office Group', kind: 'Acknowledgement', status: 'ready', reviewStatus: 'pending', dateLabel: '4 days ago', assignee: 'DP' },
    { id: 'D-008', name: 'Summit RFQ-2026-009', vendor: 'Summit Office Solutions', kind: 'RFQ', status: 'deprecated', reviewStatus: 'pending', dateLabel: '2 weeks ago', assignee: 'SC' },
    { id: 'D-009', name: 'Gunlocke Ack ORD-2048', vendor: 'The Gunlocke Company', kind: 'Acknowledgement', status: 'ready', reviewStatus: 'pending', dateLabel: '6 days ago', assignee: 'DP' },
]

function makeListDocs(): ListDoc[] {
    return LIST_SEED.map((s, i) => {
        const ex = buildExtract(i)
        return { ...s, fields: ex.fields, lineItems: ex.lineItems }
    })
}

const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10MB

function isPdf(f: File): boolean {
    return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
}

function fileError(f: File): string | null {
    if (!isPdf(f)) return 'Only PDF files are allowed'
    if (f.size > MAX_FILE_BYTES) return 'File exceeds 10MB'
    return null
}

// ── Page ────────────────────────────────────────────────────────────────────
interface PageProps {
    onLogout?: () => void
    onNavigateToWorkspace?: () => void
    onNavigate?: (page: string) => void
}

export default function QuoteConverter(_props: PageProps) {
    const [listDocs, setListDocs] = useState<ListDoc[]>(makeListDocs)
    const [funnel, setFunnel] = useState<'all' | ListStatus>('all')
    const [search, setSearch] = useState('')
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
    const [myDocs, setMyDocs] = useState(false)
    const [reviewDoc, setReviewDoc] = useState<ListDoc | null>(null)
    const [listToast, setListToast] = useState<string | null>(null)

    // F26.E — Upload modal state. The DS FileUploadModal is open whenever
    // `uploadStep !== null`; closed when null.
    const [uploadStep, setUploadStep] = useState<FileUploadStep | null>(null)
    const [files, setFiles] = useState<File[]>([])

    const fireToast = (msg: string) => { setListToast(msg); window.setTimeout(() => setListToast(null), 2500) }

    const openUpload = () => { setUploadStep('select'); setFiles([]) }
    const closeUpload = () => { setUploadStep(null); setFiles([]) }

    const addFiles = useCallback((incoming: File[]) => {
        setFiles(prev => [...prev, ...incoming])
        setUploadStep('selected')
    }, [])
    const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i))

    const validFiles = files.filter(f => fileError(f) === null)

    const startUpload = () => {
        if (validFiles.length === 0) return
        setUploadStep('uploading')
        window.setTimeout(() => setUploadStep('complete'), 1500)
    }

    const finishUpload = () => {
        const newDocs: ListDoc[] = validFiles.map((file, i) => {
            const now = new Date()
            const hh = String(now.getHours()).padStart(2, '0')
            const mm = String(now.getMinutes()).padStart(2, '0')
            return {
                id: `upload-${Date.now()}-${i}`,
                name: 'Ingesting…',
                vendor: 'Unknown Vendor',
                kind: 'Quote',
                status: 'ingesting',
                reviewStatus: 'pending',
                dateLabel: `Today, ${hh}:${mm}`,
                assignee: 'DP',
                fields: [],
                lineItems: [],
            }
        })

        setListDocs(prev => [...newDocs, ...prev])
        closeUpload()
        fireToast(`${newDocs.length} quote${newDocs.length === 1 ? '' : 's'} uploaded · OCR running`)

        // Mimic OCR resolution after ~4s · doc becomes Ready to Review (Leland fixture).
        newDocs.forEach((doc, i) => {
            window.setTimeout(() => {
                const ex = buildExtract(listDocs.length + i)
                setListDocs(prev => prev.map(d => d.id === doc.id
                    ? { ...d, status: 'ready' as const, kind: 'Order' as const, name: 'SO2604102', vendor: 'Leland Furniture', fields: ex.fields, lineItems: ex.lineItems }
                    : d))
            }, 4000)
            // Suppress unused-warning · i is used as base for buildExtract index
            void i
        })
    }

    // ── List helpers ────────────────────────────────────────────────────────
    const approve = (d: ListDoc) => { setListDocs(prev => prev.map(x => x.id === d.id ? { ...x, reviewStatus: 'reviewed' } : x)); fireToast(`${d.name} · marked reviewed`) }
    const saveReview = (id: string, fields: Field[], lineItems: LineItem[], markReviewed: boolean) => {
        const target = listDocs.find(d => d.id === id)
        setListDocs(prev => prev.map(d => d.id === id ? {
            ...d,
            fields,
            lineItems,
            reviewStatus: markReviewed ? 'reviewed' as const : d.reviewStatus,
        } : d))
        setReviewDoc(null)
        fireToast(markReviewed && target ? `${target.name} · saved & marked reviewed` : target ? `${target.name} · saved` : 'Saved')
    }
    const deprecate = (d: ListDoc) => { setListDocs(prev => prev.map(x => x.id === d.id ? { ...x, status: 'deprecated' } : x)); fireToast(`${d.name} · moved to Deprecated`) }
    const FUNNEL: { key: 'all' | ListStatus; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'ingesting', label: 'Ingesting' },
        { key: 'ready', label: 'Ready to Review' },
        { key: 'completed', label: 'Completed' },
        { key: 'deprecated', label: 'Deprecated' },
    ]
    const nonDeprecated = listDocs.filter(d => d.status !== 'deprecated')
    const funnelCount = (k: 'all' | ListStatus) => k === 'all' ? nonDeprecated.length : listDocs.filter(d => d.status === k).length
    const base = funnel === 'all' ? nonDeprecated : listDocs.filter(d => d.status === funnel)
    const filtered = base.filter(d => (!search || `${d.name} ${d.vendor}`.toLowerCase().includes(search.toLowerCase())) && (!myDocs || d.assignee === 'SC'))
    const STATUS_META: Record<ListStatus, { label: string; cls: string }> = {
        'ingesting': { label: 'Ingesting', cls: 'bg-info/10 text-info border-info/20' },
        'ready': { label: 'Ready to Review', cls: 'bg-info/10 text-info border-info/20' },
        'completed': { label: 'Completed', cls: 'bg-success/10 text-success border-success/20' },
        'deprecated': { label: 'Deprecated', cls: 'bg-muted text-muted-foreground border-border' },
    }
    const ReviewPill = ({ r }: { r: ReviewStatus }) => r === 'reviewed'
        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-success/10 text-success border border-success/20"><CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Reviewed</span>
        : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-warning/10 text-warning border border-warning/20"><AlertCircle className="h-3 w-3" aria-hidden="true" /> Pending For Review</span>
    const Avatar = ({ initials }: { initials: string }) => <span title={initials} className="h-7 w-7 rounded-full bg-success text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">{initials}</span>

    const RowActions = ({ d }: { d: ListDoc }) => {
        // Ingesting rows have no actionable buttons yet · show an Ingesting… placeholder + avatar
        if (d.status === 'ingesting') {
            return (
                <div className="flex items-center justify-end gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-3 h-3 rounded-full border-2 border-muted-foreground/40 border-t-muted-foreground animate-spin" />
                        Ingesting…
                    </span>
                    <Avatar initials={d.assignee} />
                </div>
            )
        }
        return (
            <div className="flex items-center justify-end gap-1.5">
                <button onClick={(e) => { e.stopPropagation(); setReviewDoc(d) }} title="View / review" className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><FileText className="h-4 w-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); approve(d) }} title="Approve" disabled={d.reviewStatus === 'reviewed'} className="h-7 w-7 inline-flex items-center justify-center rounded-md text-success hover:bg-success/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"><CheckCircle2 className="h-4 w-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); deprecate(d) }} title="Deprecate" className="h-7 w-7 inline-flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
                <Avatar initials={d.assignee} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-[1400px] mx-auto px-6 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-4">
                    <span className="hover:text-foreground cursor-default">SIF Generator</span>
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="text-foreground font-medium">OCR Tracking</span>
                </div>

                <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
                    {/* Title + funnel */}
                    <div className="flex items-center gap-4 flex-wrap mb-4">
                        <h1 className="text-lg font-bold text-foreground">SIF Generator</h1>
                        <div className="flex items-center gap-1 flex-wrap">
                            {FUNNEL.map(f => {
                                const active = funnel === f.key
                                return (
                                    <button key={f.key} onClick={() => setFunnel(f.key)} className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                                        {f.label}
                                        <span className={`inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[10px] font-bold ${active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{funnelCount(f.key)}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center gap-3 flex-wrap mb-4">
                        <div className="relative flex-1 min-w-[220px] max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…" className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                        </div>
                        <div className="inline-flex items-center rounded-lg border border-border overflow-hidden">
                            <button onClick={() => setViewMode('list')} title="List view" className={`h-9 w-9 inline-flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}><List className="h-4 w-4" /></button>
                            <button onClick={() => setViewMode('grid')} title="Grid view" className={`h-9 w-9 inline-flex items-center justify-center border-l border-border transition-colors ${viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}><LayoutGrid className="h-4 w-4" /></button>
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                            <input type="checkbox" checked={myDocs} onChange={e => setMyDocs(e.target.checked)} className="h-4 w-4 rounded border-border accent-primary" />
                            My Documents
                        </label>
                        <button onClick={openUpload} className="ml-auto inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                            <Upload className="h-4 w-4" aria-hidden="true" /> Upload Document
                        </button>
                    </div>

                    {/* LIST (table) */}
                    {viewMode === 'list' ? (
                        <div className="overflow-x-auto rounded-xl border border-border">
                            <table className="min-w-full">
                                <thead className="bg-muted/30">
                                    <tr>
                                        {['Document', 'Vendor', 'Status', 'Review Status', 'Date', ''].map((h, i) => (
                                            <th key={i} className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground ${i >= 5 ? 'text-right' : 'text-left'}`}>{h || 'Actions'}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.map(d => {
                                        const isIngesting = d.status === 'ingesting'
                                        return (
                                            <tr key={d.id} onClick={() => !isIngesting && setReviewDoc(d)} className={`transition-colors ${isIngesting ? 'cursor-default' : 'hover:bg-muted/20 cursor-pointer'}`}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                                                        <div className="min-w-0">
                                                            <div className={`text-sm font-semibold truncate ${isIngesting ? 'text-muted-foreground italic' : 'text-foreground'}`}>{d.name}</div>
                                                            <div className="text-[11px] text-muted-foreground">{isIngesting ? '0 line items' : `${d.lineItems.length} line items`}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className={`text-sm truncate max-w-[220px] ${isIngesting ? 'text-muted-foreground italic' : 'text-foreground'}`}>{d.vendor}</div>
                                                    <span className="inline-flex items-center px-1.5 py-0.5 mt-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border">{d.kind}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_META[d.status].cls}`}>{STATUS_META[d.status].label}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {isIngesting
                                                        ? <span className="text-[11px] text-muted-foreground italic">Ingesting…</span>
                                                        : <ReviewPill r={d.reviewStatus} />
                                                    }
                                                </td>
                                                <td className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">{d.dateLabel}</td>
                                                <td className="px-4 py-3"><RowActions d={d} /></td>
                                            </tr>
                                        )
                                    })}
                                    {filtered.length === 0 && (
                                        <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No documents in this view.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* GRID (cards) */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {filtered.map(d => {
                                const isIngesting = d.status === 'ingesting'
                                return (
                                    <div key={d.id} onClick={() => !isIngesting && setReviewDoc(d)} className={`rounded-xl border border-border bg-card p-4 transition-all flex flex-col gap-3 ${isIngesting ? 'cursor-default opacity-90' : 'hover:border-primary/40 hover:shadow-sm cursor-pointer'}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <FileText className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                                                <span className={`text-sm font-semibold truncate ${isIngesting ? 'text-muted-foreground italic' : 'text-foreground'}`}>{d.vendor}</span>
                                            </div>
                                            <Avatar initials={d.assignee} />
                                        </div>
                                        <div className="space-y-1.5 text-[11px]">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-muted-foreground">Filename</span>
                                                <span className={`truncate max-w-[140px] ${isIngesting ? 'text-muted-foreground italic' : 'text-foreground'}`}>{d.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-muted-foreground">Line Items</span>
                                                <span className="text-foreground">{isIngesting ? '0 line items' : `${d.lineItems.length} line items`}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_META[d.status].cls}`}>{STATUS_META[d.status].label}</span>
                                            {isIngesting ? <span className="text-[11px] text-muted-foreground italic">Ingesting…</span> : <ReviewPill r={d.reviewStatus} />}
                                        </div>
                                        <div onClick={e => e.stopPropagation()}><RowActions d={d} /></div>
                                    </div>
                                )
                            })}
                            {filtered.length === 0 && <div className="col-span-full py-10 text-center text-sm text-muted-foreground">No documents in this view.</div>}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Upload modal · 4 steps (F26.E: DS FileUploadModal) ───────── */}
            <FileUploadModal
                open={uploadStep !== null}
                step={uploadStep ?? 'select'}
                files={files}
                validate={fileError}
                itemNoun="Quote"
                onClose={closeUpload}
                onAddFiles={addFiles}
                onRemoveFile={removeFile}
                onStartUpload={startUpload}
                onFinish={finishUpload}
                onUploadMore={() => { setUploadStep('select'); setFiles([]) }}
            />

            {/* ── Document Review modal (centered · tabs Header / Lines) ────── */}
            <DocumentReviewModal
                doc={reviewDoc}
                onClose={() => setReviewDoc(null)}
                onSave={saveReview}
                fireToast={fireToast}
                ReviewPill={ReviewPill}
            />

            {/* Toast · solid bg-card to remain legible over any page background */}
            {listToast && (
                <div className="fixed bottom-6 right-6 z-[400] animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="flex items-center gap-3 rounded-xl shadow-2xl border border-border bg-card pl-3 pr-5 py-3 max-w-sm">
                        <span className="h-7 w-7 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                        </span>
                        <p className="text-sm font-semibold text-foreground">{listToast}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Document Review modal · centered wide · Header / Lines tabs ────────────
interface DocumentReviewModalProps {
    doc: ListDoc | null
    onClose: () => void
    onSave: (id: string, fields: Field[], lineItems: LineItem[], markReviewed: boolean) => void
    fireToast: (msg: string) => void
    ReviewPill: React.FC<{ r: ReviewStatus }>
}

const EXPORT_OPTIONS: { key: 'sif' | 'pdf'; label: string; Icon: LucideIcon; msg: string }[] = [
    { key: 'sif', label: 'Export to SIF',         Icon: Download, msg: 'Exporting as SIF…' },
    { key: 'pdf', label: 'Download Original PDF', Icon: FileText, msg: 'Downloading original PDF…' },
]

function DocumentReviewModal({ doc, onClose, onSave, fireToast, ReviewPill }: DocumentReviewModalProps) {
    const [tab, setTab] = useState<'header' | 'lines'>('header')
    const [draftFields, setDraftFields] = useState<Field[]>(doc?.fields ?? [])
    const [draftLines, setDraftLines] = useState<LineItem[]>(doc?.lineItems ?? [])
    const [editingCell, setEditingCell] = useState<{ rowId: string; col: string } | null>(null)
    const [exportOpen, setExportOpen] = useState(false)
    const [previewOpen, setPreviewOpen] = useState(false)

    useEffect(() => {
        if (!doc) return
        setDraftFields(doc.fields)
        setDraftLines(doc.lineItems)
        setTab('header')
        setEditingCell(null)
        setExportOpen(false)
        setPreviewOpen(false)
    }, [doc?.id])

    const dirty = useMemo(() => {
        if (!doc) return false
        return JSON.stringify(draftFields) !== JSON.stringify(doc.fields) ||
            JSON.stringify(draftLines) !== JSON.stringify(doc.lineItems)
    }, [doc, draftFields, draftLines])

    const avgConfidence = doc && doc.fields.length > 0
        ? Math.round(doc.fields.reduce((a, f) => a + f.confidence, 0) / doc.fields.length)
        : 0

    const patchField = (id: string, value: string) =>
        setDraftFields(prev => prev.map(f => f.id === id ? { ...f, userValue: value } : f))

    const patchLine = (id: string, patch: Partial<LineItem>) => {
        setDraftLines(prev => prev.map(l => {
            if (l.id !== id) return l
            const next: LineItem = { ...l, ...patch }
            next.extended = Math.round((next.unitPrice || 0) * (next.qty || 0) * 100) / 100
            return next
        }))
    }
    const removeLine = (id: string) => setDraftLines(prev => prev.filter(l => l.id !== id))
    const addLine = () => setDraftLines(prev => [...prev, {
        id: `l-new-${Date.now()}`,
        line: prev.length + 1,
        partNumber: '', description: '', optionCode: '', optionDescription: '',
        qty: 0, unitPrice: 0, extended: 0, confidence: 0, suggestion: '', userValue: '',
        sku: '', listPrice: 0, weight: 0, tag: '',
    }])

    const handleSave = () => {
        if (!doc) return
        const markReviewed = doc.reviewStatus !== 'reviewed'
        onSave(doc.id, draftFields, draftLines, markReviewed)
    }

    const handleExport = (key: 'sif' | 'pdf') => {
        setExportOpen(false)
        const opt = EXPORT_OPTIONS.find(o => o.key === key)
        if (opt) fireToast(opt.msg)
    }

    const sumQty = draftLines.reduce((a, l) => a + (l.qty || 0), 0)
    const sumList = draftLines.reduce((a, l) => a + ((l.listPrice ?? 0) * (l.qty || 0)), 0)
    const sumSell = draftLines.reduce((a, l) => a + (l.unitPrice || 0) * (l.qty || 0), 0)
    const sumWeight = draftLines.reduce((a, l) => a + ((l.weight ?? 0) * (l.qty || 0)), 0)
    const sumExtended = draftLines.reduce((a, l) => a + (l.extended || 0), 0)

    if (!doc) return <PdfPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} doc={doc} />

    // F26.E.5 — Line Items columns config for DS EditableLineTable.
    const lineColumns: EditableLineColumn<LineItem>[] = [
        {
            key: 'sku', header: 'SKU', width: 'min-w-[160px]',
            cell: (l) => (
                <span className="font-mono text-xs">
                    {(l.sku ?? l.partNumber) || <span className="text-muted-foreground italic">—</span>}
                </span>
            ),
            onCommit: (row, value) => patchLine(row.id, { sku: value, partNumber: value }),
            getEditValue: (row) => row.sku ?? row.partNumber ?? '',
        },
        {
            key: 'description', header: 'Description', width: 'min-w-[280px]',
            cell: (l) => l.description || <span className="text-muted-foreground italic">—</span>,
            onCommit: (row, value) => patchLine(row.id, { description: value }),
        },
        {
            key: 'tag', header: 'Tag', width: 'min-w-[80px]',
            cell: (l) => l.tag || <span className="text-muted-foreground italic">(no tags)</span>,
            onCommit: (row, value) => patchLine(row.id, { tag: value }),
        },
        {
            key: 'qty', header: 'Qty', align: 'right', inputType: 'number', width: 'min-w-[60px]',
            cell: (l) => <span className="tabular-nums">{l.qty}</span>,
            onCommit: (row, value) => patchLine(row.id, { qty: Number(value) || 0 }),
            getEditValue: (row) => String(row.qty),
        },
        {
            key: 'listPrice', header: 'List Price', align: 'right', inputType: 'number', width: 'min-w-[90px]',
            cell: (l) => <span className="tabular-nums">{money(l.listPrice ?? 0)}</span>,
            onCommit: (row, value) => patchLine(row.id, { listPrice: Number(value) || 0 }),
            getEditValue: (row) => String(row.listPrice ?? 0),
        },
        {
            key: 'unitPrice', header: 'Sell Price', align: 'right', inputType: 'number', width: 'min-w-[90px]',
            cell: (l) => <span className="tabular-nums">{money(l.unitPrice)}</span>,
            onCommit: (row, value) => patchLine(row.id, { unitPrice: Number(value) || 0 }),
            getEditValue: (row) => String(row.unitPrice),
        },
        {
            key: 'weight', header: 'Weight', align: 'right', inputType: 'number', width: 'min-w-[70px]',
            cell: (l) => <span className="tabular-nums">{(l.weight ?? 0).toFixed(2)}</span>,
            onCommit: (row, value) => patchLine(row.id, { weight: Number(value) || 0 }),
            getEditValue: (row) => String(row.weight ?? 0),
        },
        {
            key: 'extended', header: 'Extended', align: 'right', width: 'min-w-[100px]',
            cell: (l) => <span className="tabular-nums font-semibold">{money(l.extended)}</span>,
        },
    ]

    return (
        <>
            <DSDocumentReviewModal
                open={doc !== null}
                onClose={onClose}
                title="Document Review"
                subtitle={`${doc.vendor} · ${doc.name}`}
                headerActions={
                    <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors"
                    >
                        <ExternalLink className="h-3.5 w-3.5" /> View Original PDF
                    </button>
                }
                status={<ReviewPill r={doc.reviewStatus} />}
                tabs={[
                    { key: 'header', label: 'Header Fields', count: draftFields.length },
                    { key: 'lines', label: 'Line Items', count: draftLines.length },
                ]}
                activeTab={tab}
                onTabChange={setTab}
                tabBarActions={
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setExportOpen(o => !o)}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors"
                            aria-haspopup="menu"
                            aria-expanded={exportOpen}
                        >
                            Export <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        {exportOpen && (
                            <>
                                <button aria-hidden="true" tabIndex={-1} onClick={() => setExportOpen(false)} className="fixed inset-0 z-[210] cursor-default bg-transparent" />
                                <div role="menu" className="absolute right-0 mt-1 w-56 rounded-md border border-border bg-card shadow-lg z-[220] py-1">
                                    {EXPORT_OPTIONS.map(opt => {
                                        const Icon = opt.Icon
                                        return (
                                            <button
                                                key={opt.key}
                                                role="menuitem"
                                                onClick={() => handleExport(opt.key)}
                                                className="w-full flex items-center gap-2 text-left px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                                            >
                                                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                {opt.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                }
                footer={
                    <>
                        <div className="mr-auto text-xs text-muted-foreground">
                            <ConfidenceIndicator value={avgConfidence} />
                            {dirty && <span className="text-warning ml-2">· Unsaved changes</span>}
                        </div>
                        <button onClick={onClose} className="inline-flex items-center justify-center h-9 px-4 rounded-md text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors">
                            Cancel
                        </button>
                        <button
                            disabled={!dirty && doc.reviewStatus === 'reviewed'}
                            onClick={handleSave}
                            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Save className="h-3.5 w-3.5" /> Save
                        </button>
                    </>
                }
            >
                {/* Sub-header chip */}
                <div className="px-6 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    {tab === 'lines'
                        ? <><Package className="h-4 w-4" /> {draftLines.length} LINE ITEM{draftLines.length === 1 ? '' : 'S'}</>
                        : <><FileText className="h-4 w-4" /> {draftFields.length} FIELD{draftFields.length === 1 ? '' : 'S'}</>
                    }
                </div>
                <div className="px-6 py-4">
                    {tab === 'header' ? (
                        <HeaderFieldsView
                            fields={draftFields}
                            editingCell={editingCell}
                            setEditingCell={setEditingCell}
                            onPatch={patchField}
                        />
                    ) : (
                        <EditableLineTable<LineItem>
                            rows={draftLines}
                            columns={lineColumns}
                            getRowKey={(l) => l.id}
                            onAdd={addLine}
                            addLabel="Add Line Item"
                            onRemove={(l) => removeLine(l.id)}
                            showDragHandle
                            emptyState="No line items."
                            footer={
                                <tr>
                                    <td className="w-8 px-2 py-3" />
                                    <td colSpan={4} className="px-3 py-3 text-right text-sm font-bold text-foreground">Totals:</td>
                                    <td className="px-3 py-3 text-right text-sm font-bold text-foreground tabular-nums">{sumQty}</td>
                                    <td className="px-3 py-3 text-right text-sm font-bold text-foreground tabular-nums">{money(sumList)}</td>
                                    <td className="px-3 py-3 text-right text-sm font-bold text-foreground tabular-nums">{money(sumSell)}</td>
                                    <td className="px-3 py-3 text-right text-sm font-bold text-foreground tabular-nums">{sumWeight.toFixed(2)}</td>
                                    <td className="px-3 py-3 text-right text-sm font-bold text-foreground tabular-nums">{money(sumExtended)}</td>
                                    <td className="w-8 px-2 py-3" />
                                </tr>
                            }
                        />
                    )}
                </div>
            </DSDocumentReviewModal>
            <PdfPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} doc={doc} />
        </>
    )
}

// ── Header Fields tab view (sub-section cards) ──────────────────────────────
function HeaderFieldsView({ fields, editingCell, setEditingCell, onPatch }: {
    fields: Field[]
    editingCell: { rowId: string; col: string } | null
    setEditingCell: (c: { rowId: string; col: string } | null) => void
    onPatch: (id: string, value: string) => void
}) {
    return (
        <div className="space-y-5">
            {FIELD_SECTIONS.map(sec => {
                const secFields = fields.filter(f => f.section === sec.key)
                if (secFields.length === 0) return null
                const Icon = sec.Icon
                return (
                    <div key={sec.key} className="space-y-2">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold px-1">
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {sec.label}
                        </div>
                        <div className="rounded-lg border border-border overflow-hidden bg-card">
                            <table className="min-w-full">
                                <thead className="bg-muted/20 border-b border-border">
                                    <tr>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-1/4">Field</th>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Value</th>
                                        <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-32">Confidence</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {secFields.map(f => (
                                        <FieldRow
                                            key={f.id}
                                            field={f}
                                            editing={editingCell?.rowId === f.id && editingCell?.col === 'value'}
                                            setEditingCell={setEditingCell}
                                            onPatch={onPatch}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function FieldRow({ field, editing, setEditingCell, onPatch }: {
    field: Field
    editing: boolean
    setEditingCell: (c: { rowId: string; col: string } | null) => void
    onPatch: (id: string, value: string) => void
}) {
    const f = field
    const hasConfidence = f.confidence > 0
    const confTone = f.confidence >= 85 ? 'text-success' : f.confidence >= 60 ? 'text-warning' : 'text-destructive'
    const Icon = f.confidence >= 85 ? Check : AlertTriangle
    return (
        <tr className="hover:bg-muted/10 transition-colors">
            <td className="px-4 py-3 align-middle">
                <div className="text-sm font-semibold text-foreground">{f.label}</div>
            </td>
            <td className="px-4 py-3">
                {editing ? (
                    <input
                        autoFocus
                        defaultValue={f.userValue}
                        onBlur={(e) => { onPatch(f.id, e.target.value); setEditingCell(null) }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                            if (e.key === 'Escape') setEditingCell(null)
                        }}
                        className="w-full h-8 px-2 rounded border border-primary bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                ) : (
                    <button
                        onClick={() => setEditingCell({ rowId: f.id, col: 'value' })}
                        className="inline-flex items-center gap-2 text-sm text-foreground hover:bg-muted/40 rounded px-2 py-1 -mx-2 -my-1 transition-colors group max-w-full"
                    >
                        <span className="truncate">{f.userValue || <span className="text-muted-foreground italic">—</span>}</span>
                        <Pencil className="h-3 w-3 text-muted-foreground opacity-60 group-hover:opacity-100 shrink-0" />
                    </button>
                )}
            </td>
            <td className="px-4 py-3 text-right">
                {hasConfidence ? (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${confTone}`}>
                        <Icon className="h-3 w-3" />
                        {f.confidence}%
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                )}
            </td>
        </tr>
    )
}

// ── PDF mapping · doc.kind → bundled sample PDF in /public/sample-docs/ ────
function getPdfUrlForDoc(doc: ListDoc | null): { url: string; filename: string } | null {
    if (!doc) return null
    // RFQ becomes a Quote downstream, so map both to the Quote PDF.
    if (doc.kind === 'Quote' || doc.kind === 'RFQ') {
        return { url: '/sample-docs/Q18533-01.pdf', filename: 'Q18533-01.pdf' }
    }
    // Order or Proforma → the SO confirmation PDF.
    if (doc.kind === 'Order' || doc.kind === 'Proforma') {
        return { url: '/sample-docs/SO2604102.pdf', filename: 'SO2604102.pdf' }
    }
    // Acknowledgement → ACK variant of the SO.
    if (doc.kind === 'Acknowledgement') {
        return { url: '/sample-docs/SO2604102-ACK.pdf', filename: 'SO2604102-ACK.pdf' }
    }
    return null
}

// ── PDF Preview modal (stacked over Document Review) ───────────────────────
function PdfPreviewModal({ open, onClose, doc }: { open: boolean; onClose: () => void; doc: ListDoc | null }) {
    const mapping = getPdfUrlForDoc(doc)
    return (
        <Transition show={open} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[300]">
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-foreground/80 z-[300]" aria-hidden="true" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto z-[300]">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-[min(900px,95vw)] max-h-[92vh] rounded-xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden">
                                <div className="px-4 py-2 border-b border-border bg-muted/40 flex items-center justify-between shrink-0">
                                    <div className="text-xs text-muted-foreground font-mono truncate">{mapping?.filename ?? `${doc?.name ?? 'document'}.pdf`}</div>
                                    <button onClick={onClose} aria-label="Close" className="h-6 w-6 rounded inline-flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                {mapping ? (
                                    <div className="flex-1 flex flex-col bg-muted/20 p-3 gap-3 min-h-0">
                                        {/* Demo disclaimer · highlighted pill so reviewers know these are sample documents */}
                                        <div className="inline-flex items-center self-center gap-2 px-3 py-1.5 rounded-md bg-warning/15 border border-warning/30 text-warning text-xs font-semibold">
                                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                            Example document · for demo purposes only · not real customer data
                                        </div>
                                        <iframe
                                            src={mapping.url}
                                            title={`${doc?.name ?? 'Document'} preview`}
                                            className="w-full flex-1 rounded-md border border-border bg-card min-h-[600px]"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto bg-muted/20 p-6 sm:p-10">
                                        <GenericPdfFallback doc={doc} />
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

function GenericPdfFallback({ doc }: { doc: ListDoc | null }) {
    return (
        <div className="mx-auto max-w-2xl bg-card border border-border rounded-md shadow-sm p-12 flex flex-col items-center justify-center gap-4 min-h-[400px]">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="text-center space-y-1">
                <p className="text-sm font-bold text-foreground">{doc?.name ?? 'Document'}.pdf</p>
                <p className="text-xs text-muted-foreground">Preview not available in this demo · open externally to view the original document.</p>
            </div>
        </div>
    )
}
