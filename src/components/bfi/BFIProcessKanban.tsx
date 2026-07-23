/**
 * BFIProcessKanban
 * 5-column kanban representing the BFI Agency Fee business process.
 * DOE-2847 moves through columns as the demo advances.
 * Other orders appear as dimmed context cards.
 *
 * Also exports BFI_PROCESS_FUNNEL — shared funnel steps for all a1.x scenes.
 */

import { useState, Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { Plus, FileText, Upload, CheckCircle2, X, Loader2, Search, LayoutGrid, List, MoreHorizontal } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'

// ─── Shared funnel steps (5-stage process) ───────────────────────────────────

export const BFI_PROCESS_FUNNEL = [
    { id: 'intake',    label: 'Intake'     },
    { id: 'quote',     label: 'Quote'      },
    { id: 'po-labor',  label: 'PO & Labor' },
    { id: 'cpr',       label: 'CPR'        },
    { id: 'fee-verify',label: 'Fee Verify' },
]

// ─── Kanban columns ───────────────────────────────────────────────────────────

const PROCESS_COLUMNS = [
    { id: 'intake',    label: 'Intake',     color: 'text-ai',      border: 'border-ai/30'      },
    { id: 'quote',     label: 'Quote',      color: 'text-info',    border: 'border-info/30'    },
    { id: 'po-labor',  label: 'PO & Labor', color: 'text-warning', border: 'border-warning/30' },
    { id: 'cpr',       label: 'CPR Review', color: 'text-warning', border: 'border-warning/30' },
    { id: 'fee-verify',label: 'Fee Verify', color: 'text-success', border: 'border-success/30' },
]

// ─── Context cards (other orders — static background) ─────────────────────────

const BASE_CONTEXT_CARDS: ContextCard[] = [
    { orderId: 'NYPD-0394', initials: 'NYPD', agency: 'NYPD Precinct 40',    value: '$31,750',  colIdx: 1, avatarBg: 'bg-info/20',    avatarColor: 'text-info'    },
    { orderId: 'DCAS-1182', initials: 'DCAS', agency: 'NYC DCAS',            value: '$127,400', colIdx: 2, avatarBg: 'bg-warning/20', avatarColor: 'text-warning' },
    { orderId: 'DOH-0671',  initials: 'DOH',  agency: 'NYC Dept. of Health', value: '$22,100',  colIdx: 4, avatarBg: 'bg-ai/20',      avatarColor: 'text-ai'      },
]

interface ContextCard {
    orderId: string
    initials: string
    agency: string
    value: string
    colIdx: number
    avatarBg: string
    avatarColor: string
    desc?: string
    isNew?: boolean
}

function getNewCardColors(name: string): { avatarBg: string; avatarColor: string } {
    const palette = [
        { avatarBg: 'bg-info/20',    avatarColor: 'text-info'    },
        { avatarBg: 'bg-ai/20',      avatarColor: 'text-ai'      },
        { avatarBg: 'bg-success/20', avatarColor: 'text-success' },
        { avatarBg: 'bg-warning/20', avatarColor: 'text-warning' },
    ]
    return palette[name.charCodeAt(0) % palette.length]
}

// ─── DOE-2847 contextual content per column ───────────────────────────────────

const DOE_BADGE: Record<number, { label: string; className: string }> = {
    0: { label: 'New SIF',     className: 'bg-ai/10 text-ai border border-ai/20'                },
    1: { label: 'Quote Tool',  className: 'bg-info/10 text-info border border-info/20'          },
    2: { label: 'PO received', className: 'bg-warning/10 text-warning border border-warning/20' },
    3: { label: '2 pending',   className: 'bg-warning/10 text-warning border border-warning/20' },
    4: { label: 'Verified',    className: 'bg-success/10 text-success border border-success/20' },
}

const DOE_SUBTITLE: Record<number, string> = {
    0: 'SIF received · Intake processing',
    1: 'Quote Tool validation · 1 price corrected',
    2: 'PO received · WIG labor quote compiled',
    3: 'CPR reconciliation · 2 lines to approve',
    4: 'Agency fee verification · Finance Lead Halbert',
}

// ─── New Order Modal ──────────────────────────────────────────────────────────

type UploadState = 'idle' | 'uploading' | 'done'

interface FileZone {
    label: string
    accept: string
    placeholder: string
    filename: string
}

const FILE_ZONES: FileZone[] = [
    { label: 'SIF File',    accept: '.sif',  placeholder: 'Drag & drop or browse .sif',  filename: 'order.sif'         },
    { label: 'PDF Specs',   accept: '.pdf',  placeholder: 'Drag & drop or browse .pdf',  filename: 'specs.pdf'         },
    { label: 'Floor Plan',  accept: '.pdf',  placeholder: 'Drag & drop or browse .pdf',  filename: 'floorplan.pdf'     },
]

function NewOrderModal({
    isOpen,
    onClose,
    onCreate,
}: {
    isOpen: boolean
    onClose: () => void
    onCreate: (card: ContextCard) => void
}) {
    // F30.b · leftOffset dinámico · respeta el sidebar del demo cuando
    // está expandido. Fuera de tour (isDemoActive=false) o con sidebar
    // colapsado el modal cubre todo el viewport (left-0). Antes usaba
    // 'left-80' hardcoded que dejaba 320px de gap innecesario en la
    // izquierda + top-16 hardcoded que dejaba el navbar visible arriba.
    // Pattern replicado del OfficeworksDocumentReviewModal L338-339.
    // Diego 2026-07-23.
    const { isSidebarCollapsed, isDemoActive } = useDemo()
    const leftOffset = isDemoActive && !isSidebarCollapsed ? 'left-80' : 'left-0'

    const [agencyName, setAgencyName] = useState('NYC Dept. of Education')
    const [orderId,    setOrderId]    = useState('DOE-2847')
    const [uploads,    setUploads]    = useState<UploadState[]>(['idle', 'idle', 'idle'])
    const [creating,   setCreating]   = useState(false)
    const [created,    setCreated]    = useState(false)

    const handleBrowse = (idx: number) => {
        setUploads(prev => { const n = [...prev]; n[idx] = 'uploading'; return n })
        setTimeout(() => {
            setUploads(prev => { const n = [...prev]; n[idx] = 'done'; return n })
        }, 1100)
    }

    const handleReplace = (idx: number) => {
        setUploads(prev => { const n = [...prev]; n[idx] = 'idle'; return n })
    }

    const allUploaded = uploads.every(u => u === 'done')
    const canCreate   = allUploaded && agencyName.trim().length > 0

    const handleCreate = () => {
        if (!canCreate) return
        setCreating(true)
        setTimeout(() => {
            setCreated(true)
            const initials = agencyName.trim().slice(0, 4).toUpperCase()
            const id = orderId.trim() || `${initials}-${Math.floor(1000 + Math.random() * 9000)}`
            const colors = getNewCardColors(agencyName.trim())
            setTimeout(() => {
                onCreate({
                    orderId: id,
                    initials: initials.slice(0, 4),
                    agency: agencyName.trim(),
                    value: '$—',
                    colIdx: 0,
                    avatarBg: colors.avatarBg,
                    avatarColor: colors.avatarColor,
                    desc: 'SIF received · Intake processing',
                    isNew: true,
                })
                onClose()
                setAgencyName(''); setOrderId(''); setUploads(['idle','idle','idle']); setCreating(false); setCreated(false)
            }, 800)
        }, 1200)
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[400]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className={`fixed top-0 ${leftOffset} right-0 bottom-0 bg-black/40 backdrop-blur-sm`} />
                </TransitionChild>

                <div className={`fixed top-0 ${leftOffset} right-0 bottom-0 flex items-center justify-center p-6`}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg transform rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-xl bg-foreground/10 flex items-center justify-center">
                                        <Plus className="h-4 w-4 text-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-foreground">New Agency Fee Order</p>
                                        <p className="text-[11px] text-muted-foreground">Strata will extract and validate documents automatically</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

                                {/* Order details */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Agency Name *</label>
                                        <input
                                            type="text"
                                            value={agencyName}
                                            onChange={e => setAgencyName(e.target.value)}
                                            placeholder="e.g. NYC Parks Dept."
                                            className="w-full rounded-lg border border-border px-3 py-2 text-[12px] text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Order ID <span className="text-muted-foreground/50 normal-case font-normal">(auto if blank)</span></label>
                                        <input
                                            type="text"
                                            value={orderId}
                                            onChange={e => setOrderId(e.target.value)}
                                            placeholder="e.g. PARK-1043"
                                            className="w-full rounded-lg border border-border px-3 py-2 text-[12px] text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/50"
                                        />
                                    </div>
                                </div>

                                {/* File upload zones */}
                                <div className="space-y-2.5">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Documents</p>
                                    {FILE_ZONES.map((zone, idx) => {
                                        const state = uploads[idx]
                                        return (
                                            <div key={zone.label} className={`rounded-xl border transition-colors ${
                                                state === 'done' ? 'border-success/30 bg-success/5'
                                                : state === 'uploading' ? 'border-primary/30 bg-primary/5'
                                                : 'border-border bg-muted/20'
                                            }`}>
                                                <div className="flex items-center gap-3 px-3.5 py-3">
                                                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                                                        state === 'done' ? 'bg-success/10' : 'bg-muted/40'
                                                    }`}>
                                                        {state === 'uploading'
                                                            ? <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                                            : state === 'done'
                                                            ? <CheckCircle2 className="h-4 w-4 text-success" />
                                                            : <FileText className="h-4 w-4 text-muted-foreground" />
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-bold text-foreground">{zone.label}</p>
                                                        <p className="text-[10px] text-muted-foreground truncate">
                                                            {state === 'idle'      ? zone.placeholder
                                                            : state === 'uploading' ? 'Uploading…'
                                                            : zone.filename}
                                                        </p>
                                                    </div>
                                                    {state === 'idle' && (
                                                        <button
                                                            onClick={() => handleBrowse(idx)}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-foreground text-background hover:opacity-80 transition-all shrink-0"
                                                        >
                                                            <Upload className="h-3 w-3" /> Browse
                                                        </button>
                                                    )}
                                                    {state === 'done' && (
                                                        <button
                                                            onClick={() => handleReplace(idx)}
                                                            className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors shrink-0 underline underline-offset-2"
                                                        >
                                                            Replace
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {created && (
                                    <div className="flex items-center gap-2 p-3 bg-success/5 border border-success/20 rounded-xl animate-in fade-in duration-300">
                                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                        <p className="text-[12px] font-bold text-success">Order created · appearing in Intake queue…</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-4 border-t border-border flex items-center gap-3">
                                <button
                                    onClick={onClose}
                                    className="text-[12px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!canCreate || creating}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-black rounded-xl transition-all uppercase tracking-widest ${
                                        canCreate && !creating
                                            ? 'bg-primary text-primary-foreground hover:opacity-90'
                                            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                                    }`}
                                >
                                    {creating
                                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating…</>
                                        : 'Create Order →'
                                    }
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BFIProcessKanbanProps {
    activeCol: 0 | 1 | 2 | 3 | 4
    showDoe?: boolean
    doeSubtitle?: string
    onReviewDoe?: () => void
    onSendDoe?: () => void
    animateDoe?: boolean
    /** Label for the Review/Continue button inside the DOE card. Default: "Review" */
    reviewLabel?: string
    /** Show the "+ New Fee" button. Default: true */
    showNewFee?: boolean
    /** When set, only context cards in these column indices are visible. DOE card is unaffected. */
    filterColIdxs?: number[]
    /** Adds a pulsing highlight to the Review button to guide the user. */
    highlightReview?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BFIProcessKanban({
    activeCol,
    showDoe = true,
    doeSubtitle,
    onReviewDoe,
    onSendDoe,
    animateDoe = false,
    reviewLabel = 'Review',
    showNewFee  = true,
    filterColIdxs,
    highlightReview = false,
}: BFIProcessKanbanProps) {
    const badge    = DOE_BADGE[activeCol]
    const subtitle = doeSubtitle ?? DOE_SUBTITLE[activeCol]
    const col      = PROCESS_COLUMNS[activeCol]

    const [contextCards, setContextCards] = useState<ContextCard[]>(BASE_CONTEXT_CARDS)
    const [isNewFeeOpen, setIsNewFeeOpen] = useState(false)
    const [activeTab,    setActiveTab]    = useState<string>('all')
    const [searchQuery,  setSearchQuery]  = useState('')
    const [viewMode,     setViewMode]     = useState<'kanban' | 'list'>('kanban')

    const handleCreate = (card: ContextCard) => {
        setContextCards(prev => [...prev, card])
    }

    // Counts per column for tab badges
    const colCounts = PROCESS_COLUMNS.map((_, i) => {
        const doeHere = showDoe && i === activeCol ? 1 : 0
        const ctxHere = contextCards.filter(c => c.colIdx === i).length
        return doeHere + ctxHere
    })
    const totalCount = (showDoe ? 1 : 0) + contextCards.length

    // Filter context cards by tab + search
    const filteredCards = contextCards.filter(card => {
        const colId = PROCESS_COLUMNS[card.colIdx]?.id
        const matchesTab    = activeTab === 'all' || colId === activeTab
        const matchesSearch = card.agency.toLowerCase().includes(searchQuery.toLowerCase()) || card.orderId.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesProp   = filterColIdxs === undefined || filterColIdxs.includes(card.colIdx)
        return matchesTab && matchesSearch && matchesProp
    })

    // All cards for list view (DOE + context)
    const allListItems = [
        ...(showDoe ? [{
            orderId: 'DOE-2847',
            initials: 'DOE',
            agency: 'NYC Dept. of Education',
            value: '$236,100',
            colIdx: activeCol,
            avatarBg: 'bg-success/15',
            avatarColor: 'text-success',
            desc: subtitle,
            isDoe: true,
        }] : []),
        ...filteredCards.map(c => ({ ...c, isDoe: false })),
    ]

    return (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

            {/* ── Card Header ── */}
            <div className="px-5 py-4 border-b border-border">
                <div className="flex flex-col gap-3">

                    {/* Top row: Title + divider + Tabs + New Fee */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground whitespace-nowrap">Agency Fee AI</h3>
                        <div className="hidden sm:block w-px h-5 bg-border" />

                        {/* Status tabs */}
                        <div className="flex gap-1 bg-muted p-1 rounded-lg overflow-x-auto">
                            {[
                                { id: 'all', label: 'All', count: totalCount },
                                ...PROCESS_COLUMNS.map((c, i) => ({ id: c.id, label: c.label, count: colCounts[i] })),
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap outline-none ${
                                        activeTab === tab.id
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                                    }`}
                                >
                                    {tab.label}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-primary-foreground/15 text-primary-foreground'
                                            : 'bg-background text-muted-foreground'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* New Fee button — pushed to the right */}
                        {showNewFee && (
                            <button
                                onClick={() => setIsNewFeeOpen(true)}
                                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black bg-primary text-primary-foreground hover:opacity-90 transition-all uppercase tracking-widest shadow-sm shrink-0"
                            >
                                <Plus className="h-3 w-3" />
                                New Fee
                            </button>
                        )}
                    </div>

                    {/* Bottom row: Search + view toggle */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-[11px] bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                            />
                        </div>
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('list')}
                                title="List view"
                                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
                            >
                                <List className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => setViewMode('kanban')}
                                title="Board view"
                                className={`p-2 transition-colors ${viewMode === 'kanban' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
                            >
                                <LayoutGrid className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="p-5">

                {/* Kanban view */}
                {viewMode === 'kanban' && (
                    <div className="grid grid-cols-5 gap-3">
                        {PROCESS_COLUMNS.map((c, colIdx) => {
                            const isDoeCol  = colIdx === activeCol
                            const colCards  = filteredCards.filter(card => card.colIdx === colIdx)
                            const doeVisible = showDoe && isDoeCol && (activeTab === 'all' || activeTab === c.id)
                            const count     = (doeVisible ? 1 : 0) + colCards.length

                            return (
                                <div key={c.id} className="space-y-3">
                                    {/* Column header */}
                                    <div className="flex items-center justify-between mb-1 px-1">
                                        <h4 className="font-medium text-foreground flex items-center gap-2">
                                            {c.label}
                                            <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{count}</span>
                                        </h4>
                                        <button className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Column options">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* DOE-2847 card — highlighted */}
                                    {doeVisible && (
                                        <div className={`rounded-2xl border ${col.border} bg-card p-4 space-y-3 shadow-sm ${
                                            animateDoe ? 'animate-in fade-in slide-in-from-top-2 duration-500' : ''
                                        }`}>
                                            <div className="flex items-start gap-2.5">
                                                <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center shrink-0 ring-2 ring-background">
                                                    <span className="text-[10px] font-black text-success">DOE</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1 mb-0.5">
                                                        <span className="text-sm font-bold text-foreground">DOE-2847</span>
                                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}>
                                                            {badge.label}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground block">NYC Dept. of Education</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Document</span>
                                                    <span className="font-medium text-foreground truncate ml-2">DOE-2847-SIF.pdf</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Amount</span>
                                                    <span className="font-semibold text-foreground">$236,100</span>
                                                </div>
                                            </div>

                                            <p className="text-[11px] text-muted-foreground leading-relaxed">{subtitle}</p>

                                            <div className="pt-2 border-t border-border flex items-center justify-between">
                                                <span className="text-[11px] text-muted-foreground">May 6</span>
                                                <div className="flex gap-2">
                                                    {onSendDoe && (
                                                        <button
                                                            onClick={onSendDoe}
                                                            className="py-1.5 px-3 text-[11px] font-bold rounded-xl bg-foreground text-background hover:opacity-80 transition-all"
                                                        >
                                                            Send →
                                                        </button>
                                                    )}
                                                    {onReviewDoe && (
                                                        <div className={`relative ${onSendDoe ? '' : 'flex-1 min-w-[80px]'}`}>
                                                            {highlightReview && (
                                                                <span className="absolute -inset-1 rounded-xl bg-ai/20 animate-pulse pointer-events-none" />
                                                            )}
                                                            <button
                                                                onClick={onReviewDoe}
                                                                className={`w-full py-1.5 px-3 text-[11px] font-bold rounded-xl transition-all ${
                                                                    onSendDoe
                                                                        ? 'border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                                                        : `bg-foreground text-background hover:opacity-80${highlightReview ? ' ring-2 ring-ai ring-offset-1' : ''}`
                                                                }`}
                                                            >
                                                                {reviewLabel}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Context cards */}
                                    {colCards.map(card => (
                                        <div
                                            key={card.orderId}
                                            className={`rounded-2xl border bg-card p-4 space-y-3 shadow-sm ${
                                                card.isNew
                                                    ? 'border-border animate-in fade-in slide-in-from-top-2 duration-500'
                                                    : 'border-border opacity-60 pointer-events-none'
                                            }`}
                                        >
                                            {card.isNew ? (
                                                /* Rich template for new cards — matches DOE card style */
                                                <>
                                                    <div className="flex items-start gap-2.5">
                                                        <div className={`h-8 w-8 rounded-full ${card.avatarBg} flex items-center justify-center shrink-0 ring-2 ring-background`}>
                                                            <span className={`text-[10px] font-black ${card.avatarColor}`}>{card.initials}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                                <span className="text-sm font-bold text-foreground">{card.orderId}</span>
                                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 bg-info/10 text-info border border-info/20">Intake</span>
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground font-mono block">{card.agency}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">Document</span>
                                                            <span className="font-medium text-foreground truncate ml-2">{card.orderId}-SIF.pdf</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">Amount</span>
                                                            <span className="font-semibold text-foreground">{card.value}</span>
                                                        </div>
                                                    </div>
                                                    {card.desc && <p className="text-[11px] text-muted-foreground leading-relaxed">{card.desc}</p>}
                                                    <div className="pt-2 border-t border-border flex items-center justify-between">
                                                        <span className="text-[11px] text-muted-foreground">Just now</span>
                                                        {onReviewDoe && (
                                                            <button
                                                                onClick={onReviewDoe}
                                                                className="py-1.5 px-3 text-[11px] font-bold rounded-xl bg-foreground text-background hover:opacity-80 transition-all"
                                                            >
                                                                {reviewLabel}
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                /* Simple template for context-only cards */
                                                <>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`h-8 w-8 rounded-full ${card.avatarBg} flex items-center justify-center shrink-0 ring-2 ring-background`}>
                                                            <span className={`text-[10px] font-black ${card.avatarColor}`}>{card.initials}</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-semibold text-foreground">{card.orderId}</div>
                                                            <div className="text-[10px] text-muted-foreground truncate font-mono">{card.agency}</div>
                                                        </div>
                                                    </div>
                                                    {card.desc && (
                                                        <p className="text-[11px] text-muted-foreground leading-relaxed">{card.desc}</p>
                                                    )}
                                                    <div className="h-px bg-border" />
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] text-muted-foreground">Amount</span>
                                                        <span className="text-xs font-semibold text-foreground">{card.value}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}

                                    {/* Empty state */}
                                    {count === 0 && (
                                        <div className="border-2 border-dashed border-border rounded-xl p-5 text-center">
                                            <p className="text-xs text-muted-foreground">No orders</p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* List view */}
                {viewMode === 'list' && (
                    <div className="overflow-hidden rounded-xl border border-border">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Order</th>
                                    <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Agency</th>
                                    <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Stage</th>
                                    <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Amount</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {allListItems.map(item => {
                                    const stageCol = PROCESS_COLUMNS[item.colIdx]
                                    return (
                                        <tr key={item.orderId} className="border-b border-border hover:bg-muted/20 transition-colors last:border-0">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`h-8 w-8 rounded-full ${item.avatarBg} flex items-center justify-center shrink-0 ring-2 ring-background`}>
                                                        <span className={`text-[9px] font-bold ${item.avatarColor}`}>{item.initials}</span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-foreground">{item.orderId}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-foreground">{item.agency}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-md bg-muted ${stageCol?.color ?? 'text-muted-foreground'}`}>
                                                    {stageCol?.label ?? '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-foreground">{item.value}</td>
                                            <td className="px-4 py-3 text-right">
                                                {(item.isDoe || item.isNew) && onReviewDoe && (
                                                    <div className="relative inline-block">
                                                        {item.isDoe && highlightReview && (
                                                            <span className="absolute -inset-1 rounded-xl bg-ai/20 animate-pulse pointer-events-none" />
                                                        )}
                                                        <button
                                                            onClick={onReviewDoe}
                                                            className={`py-1.5 px-3 text-[11px] font-bold rounded-xl bg-foreground text-background hover:opacity-80 transition-all${item.isDoe && highlightReview ? ' ring-2 ring-ai ring-offset-1' : ''}`}
                                                        >
                                                            {reviewLabel}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <NewOrderModal
                isOpen={isNewFeeOpen}
                onClose={() => setIsNewFeeOpen(false)}
                onCreate={handleCreate}
            />
        </div>
    )
}
