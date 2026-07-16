/**
 * COMPONENT: ClaimResolvedScene (a1.2f)
 * PURPOSE: Lauren receives claim-resolved notification, reviews floor plan + CORE work order,
 *          downloads/prints documents, then notifies Walter (BFI PM) to approve scheduling.
 *
 * FLOW:
 *   dashboard → notification "Claim resolved · HM confirmed"
 *   → detail: resolved banner + floor plan card + work order card
 *   → Notify Walter → Dialog (editable From, CC procurement) → send → nextStep()
 */

import { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import {
    CheckCircle2, FileText, Mail, Send, Download, Printer, Loader2, X,
} from 'lucide-react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDashboardScene from './BFIDashboardScene'
import { FloorPlanSVG } from './BFIDocumentReviewModal'
import EmailMetadataBlock from './EmailMetadataBlock'

// ─── Constants ────────────────────────────────────────────────────────────────

const DASHBOARD_NOTIFICATION = {
    title: 'Claim resolved · Herman Miller confirmed',
    desc: 'Monitor Arm Dual Adjustable · Replacement carton ETA May 18 · Work order updated in CORE',
    cta: 'Review floor plan & work order →',
}

const WALTER_MESSAGE =
`Hi Walter,

The shortage claim for DOE-2847 has been resolved. Herman Miller confirmed a replacement shipment for Carton #34 (Monitor Arm Dual Adjustable) — ETA May 18, 2026.

The CORE work order (WO-2026-0089) has been updated. All items are now cleared for the May 19–21 delivery window. The install crew is confirmed for the three areas (Open Area, Lounge, Storage Room).

Please approve the scheduling so we can coordinate with the Workplace labor team.

— Account Manager DeMar
  BFI Furniture · CoNY Account Manager`

const WO_LINES = [
    { abbr: 'FU-2',  desc: 'Filing Unit Lateral 2-Drawer 36"',   qty: 8, cartons: '1–8',    status: 'received' },
    { abbr: 'FU-4',  desc: 'Filing Unit Vertical 4-Drawer 26"',  qty: 4, cartons: '9–12',   status: 'received' },
    { abbr: 'WS-60', desc: 'Work Surface 60" × 30"',             qty: 6, cartons: '13–18',  status: 'received' },
    { abbr: 'WS-72', desc: 'Work Surface 72" × 30"',             qty: 4, cartons: '19–22',  status: 'received' },
    { abbr: 'SC',    desc: 'Storage Cabinet Overhead 72"',        qty: 3, cartons: '23–25',  status: 'received' },
    { abbr: 'CHAIR', desc: 'Ergonomic Chair · Aeron B · HM',     qty: 8, cartons: '26–33',  status: 'received' },
    { abbr: 'M-ARM', desc: 'Monitor Arm Dual Adjustable',         qty: 2, cartons: '34–35',  status: 'confirmed' },
]

// ─── Download toast (fixed, shared via module-level signal) ──────────────────

let _setToast: ((msg: string | null) => void) | null = null

function DownloadToast() {
    const [msg, setMsg] = useState<string | null>(null)
    _setToast = setMsg
    if (!msg) return null
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[600] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-2xl text-[12px] font-semibold">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                {msg}
            </div>
        </div>
    )
}

function showToast(msg: string) {
    _setToast?.(msg)
    setTimeout(() => _setToast?.(null), 2800)
}

// ─── Download / Print bar ─────────────────────────────────────────────────────

type ActionState = 'idle' | 'loading'

function DownloadPrintBar({ filename }: { filename: string }) {
    const [dlState,    setDlState]    = useState<ActionState>('idle')
    const [printState, setPrintState] = useState<ActionState>('idle')

    const handleDownload = () => {
        setDlState('loading')
        setTimeout(() => { setDlState('idle'); showToast(`${filename} downloaded`) }, 1400)
    }
    const handlePrint = () => {
        setPrintState('loading')
        setTimeout(() => { setPrintState('idle'); showToast(`${filename} sent to printer`) }, 1400)
    }

    return (
        <div className="flex items-center gap-2 justify-end mt-2">
            <button onClick={handleDownload} disabled={dlState === 'loading'}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-50">
                {dlState === 'loading' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                {dlState === 'loading' ? 'Downloading…' : 'Download PDF'}
            </button>
            <button onClick={handlePrint} disabled={printState === 'loading'}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-50">
                {printState === 'loading' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Printer className="h-3 w-3" />}
                {printState === 'loading' ? 'Sending…' : 'Print'}
            </button>
        </div>
    )
}

// ─── CORE Work Order (inline JSX) ────────────────────────────────────────────

function CoreWorkOrder() {
    return (
        <div className="text-[10px] space-y-3 bg-background rounded-xl border border-border p-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[13px] font-black text-foreground">WORK ORDER</div>
                    <div className="text-muted-foreground mt-0.5">WO-2026-0089 · DOE-2847</div>
                </div>
                <div className="text-right space-y-0.5">
                    <div className="font-bold text-foreground">NYC Dept. of Education</div>
                    <div className="text-muted-foreground">Procurement Office</div>
                    <div className="text-muted-foreground">May 11, 2026</div>
                </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                <span className="text-[10px] font-bold text-success">Replacement confirmed — all items cleared for delivery</span>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-border pt-2">
                {[
                    { label: 'Vendor',    value: 'BFI Furniture · Herman Miller' },
                    { label: 'Contract',  value: 'CoNY · City of New York' },
                    { label: 'Ship to',   value: 'WIG Group · NJ Warehouse' },
                    { label: 'Delivery',  value: 'May 19–21 · Replacement arrives May 18' },
                ].map(r => (
                    <div key={r.label}>
                        <span className="text-muted-foreground">{r.label}: </span>
                        <span className="font-medium text-foreground">{r.value}</span>
                    </div>
                ))}
            </div>

            {/* Line items */}
            <div className="border-t border-border pt-2 space-y-0.5">
                <div className="grid grid-cols-[2rem_1fr_2rem_3rem_4.5rem] gap-1 pb-1 border-b border-border/60 text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                    <span>Ref</span><span>Description</span><span className="text-right">Qty</span>
                    <span className="text-right">Ctn</span><span className="text-right">Status</span>
                </div>
                {WO_LINES.map(l => (
                    <div key={l.abbr} className="grid grid-cols-[2rem_1fr_2rem_3rem_4.5rem] gap-1 py-0.5 text-foreground">
                        <span className="text-[8px] font-bold px-1 rounded text-center self-center bg-muted text-muted-foreground">
                            {l.abbr}
                        </span>
                        <span className="truncate self-center">{l.desc}</span>
                        <span className="text-right self-center">{l.qty}</span>
                        <span className="text-right self-center text-muted-foreground">{l.cartons}</span>
                        <span className="text-right self-center text-[9px] font-bold text-success">
                            {l.status === 'confirmed' ? '✓ Confirmed' : '✓ Rcv\'d'}
                        </span>
                    </div>
                ))}
            </div>

            <div className="text-[9px] text-muted-foreground border-t border-border pt-2">
                Zones A·B·C · Install crew: 3 technicians · Labor: Carpenters 45h + OT 6h · CPR on file
            </div>
        </div>
    )
}

// ─── Walter Notify Dialog ─────────────────────────────────────────────────────

function WalterNotifyDialog({ isOpen, onSent, onClose }: { isOpen: boolean; onSent: () => void; onClose?: () => void }) {
    const [sent,      setSent]      = useState(false)
    const [message,   setMessage]   = useState(WALTER_MESSAGE)
    const [fromEmail, setFromEmail] = useState('lauren.demarco@bfifurniture.com')
    const [toEmail,   setToEmail]   = useState('walter.goley@bfifurniture.com · BFI PM')
    const [ccEmail,   setCcEmail]   = useState('nycdoe-procurement@schools.nyc.gov')
    const [dateText,  setDateText]  = useState('May 11, 2026 · 10:15 AM')
    const [subject,   setSubject]   = useState('DOE-2847 · Claim resolved · Ready for install scheduling')
    const [attachments, setAttachments] = useState(['DOE-2847-WorkOrder.pdf', 'DOE-2847-FloorPlan.pdf'])

    const handleSend = () => { setSent(true); setTimeout(() => onSent(), 900) }
    const removeAttachment = (name: string) => setAttachments(prev => prev.filter(a => a !== name))


    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[400]" onClose={() => {}}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-6">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg transform rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">

                            {/* Header */}
                            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-muted/30 shrink-0">
                                <div className="h-8 w-8 rounded-full bg-info/20 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-black text-info">WM</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[12px] font-bold text-foreground">Walter · BFI PM</div>
                                    <div className="text-[10px] text-muted-foreground">walter@bfifurniture.com · Scheduling approval</div>
                                </div>
                                <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0" aria-label="Close">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Scrollable body */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="px-5 pt-4 pb-3 border-b border-border/60">
                                    <EmailMetadataBlock
                                        subject={{ value: subject, onChange: setSubject }}
                                        fields={[
                                            { label: 'From', value: fromEmail, onChange: setFromEmail },
                                            { label: 'To',   value: toEmail,   onChange: setToEmail },
                                            { label: 'CC',   value: ccEmail,   onChange: setCcEmail, muted: true },
                                            { label: 'Date', value: dateText,  onChange: setDateText },
                                        ]}
                                        disabled={sent}
                                    />
                                </div>

                                <div className="px-5 py-4 space-y-3">
                                    {/* Resolved summary */}
                                    <div className="rounded-xl border border-success/20 bg-success/5 p-3 space-y-1 text-[11px]">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                                            <span className="text-[10px] font-bold text-foreground uppercase tracking-wide">Claim Resolved</span>
                                        </div>
                                        {[
                                            { label: 'Order',      value: 'DOE-2847 · Q-2026-0089' },
                                            { label: 'Item',       value: 'Monitor Arm Dual Adjustable (1 unit)' },
                                            { label: 'Resolution', value: 'Replacement shipment confirmed by HM' },
                                            { label: 'ETA',        value: 'May 18, 2026 · WIG NJ Warehouse' },
                                        ].map(r => (
                                            <div key={r.label} className="flex items-start gap-2">
                                                <span className="text-muted-foreground w-20 shrink-0">{r.label}:</span>
                                                <span className="font-medium text-foreground">{r.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Editable message */}
                                    <div className="space-y-1.5">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Message</span>
                                        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={8} disabled={sent}
                                            className="w-full text-[11px] text-foreground bg-muted/30 border border-border rounded-xl px-3.5 py-2.5 leading-relaxed resize-none outline-none focus:border-primary/50 transition-colors disabled:opacity-60" />
                                    </div>

                                    {/* Attachments — removable */}
                                    <div className="space-y-1.5">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Attachments</span>
                                        <div className="flex flex-wrap gap-2">
                                            {attachments.map(f => (
                                                <div key={f} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border text-[10px] text-foreground font-medium">
                                                    <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                                                    {f}
                                                    {!sent && (
                                                        <button onClick={() => removeAttachment(f)} className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0" aria-label={`Remove ${f}`}>
                                                            <X className="h-2.5 w-2.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {sent && (
                                        <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                            <div className="text-xs">
                                                <div className="font-bold text-foreground">Sent to Walter · May 11 · 10:15 AM</div>
                                                <div className="text-muted-foreground mt-0.5">Scheduling approval requested · Work order attached</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="px-5 pb-4">
                                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
                                </div>
                            </div>

                            {!sent && (
                                <div className="px-5 py-3.5 border-t border-border bg-card shrink-0">
                                    <button onClick={handleSend}
                                        className="w-full flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm">
                                        <Send className="h-3.5 w-3.5" />
                                        Notify →
                                    </button>
                                </div>
                            )}
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

// ─── Main Scene ───────────────────────────────────────────────────────────────

export default function ClaimResolvedScene() {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const [phase,       setPhase]       = useState<'dashboard' | 'detail'>('dashboard')

    useEffect(() => {
        const handler = () => setPhase('detail')
        window.addEventListener('bfi:resolved-open', handler)
        return () => window.removeEventListener('bfi:resolved-open', handler)
    }, [])

    const [showDialog,  setShowDialog]  = useState(false)

    if (phase === 'dashboard') {
        return (
            <BFIDashboardScene
                staticMode
                onNavigate={() => setPhase('detail')}
            />
        )
    }

    return (
        <div className="space-y-3 animate-in fade-in duration-300">

            {/* ── Resolved banner ── */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-success/30 bg-success/5">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <div>
                    <div className="text-[12px] font-bold text-foreground">Shortage claim resolved · Herman Miller</div>
                    <div className="text-[10px] text-muted-foreground">Monitor Arm Dual Adjustable · Replacement carton #34 · ETA May 18 · WIG NJ Warehouse</div>
                </div>
            </div>

            {/* ── 2-column: Floor Plan | Work Order + CTA ── */}
            <div className="grid grid-cols-2 gap-3">

                {/* Left: Floor Plan */}
                <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-foreground truncate">DOE-2847 · Floor 12 Layout</div>
                            <div className="text-[9px] text-muted-foreground">Floor plan · 3 areas · May 19–21</div>
                        </div>
                        <span className="text-[9px] font-bold bg-success/10 text-success border border-success/20 px-1.5 py-0.5 rounded-full shrink-0">Confirmed</span>
                    </div>
                    <div className="px-3.5 py-3 space-y-2">
                        <div className="rounded-lg border border-border overflow-hidden bg-background p-2">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">52 Chambers St · Floor 12</span>
                                <span className="ml-auto text-[9px] text-success font-medium">OCR ✓</span>
                            </div>
                            <FloorPlanSVG />
                            <div className="flex gap-3 mt-2 px-1 flex-wrap">
                                {[
                                    { color: 'bg-[#e4e4e7]', label: 'Open Area' },
                                    { color: 'bg-[#e4e4e7]', label: 'Lounge' },
                                    { color: 'bg-[#e4e4e7]', label: 'Storage Room' },
                                ].map(l => (
                                    <div key={l.label} className="flex items-center gap-1 text-[8px] text-muted-foreground">
                                        <div className={`h-2 w-2 rounded-sm ${l.color} border border-zinc-400`} />
                                        {l.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <DownloadPrintBar filename="DOE-2847-ZoneLayout.pdf" />
                    </div>
                </div>

                {/* Right: CORE Work Order + CTA */}
                <div className="flex flex-col gap-3">
                    <div className="border border-border rounded-xl bg-card overflow-hidden">
                        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold text-foreground truncate">CORE Work Order · WO-2026-0089</div>
                                <div className="text-[9px] text-muted-foreground">DOE-2847 · replacement ETA May 18</div>
                            </div>
                            <span className="text-[9px] font-bold bg-success/10 text-success border border-success/20 px-1.5 py-0.5 rounded-full shrink-0">Updated</span>
                        </div>
                        <div className="px-3.5 py-3">
                            <CoreWorkOrder />
                            <DownloadPrintBar filename="DOE-2847-WorkOrder.pdf" />
                        </div>
                    </div>

                    {/* Notify CoNY PM CTA */}
                    <button
                        onClick={() => setShowDialog(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-foreground text-background hover:opacity-80 transition-all shadow-sm mt-auto"
                    >
                        <Send className="h-4 w-4" />
                        Notify Walter (BFI PM) →
                    </button>
                </div>
            </div>

            <WalterNotifyDialog
                isOpen={showDialog}
                onSent={() => { setShowDialog(false); pauseAware(() => nextStep())() }}
                onClose={() => setShowDialog(false)}
            />

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
            <DownloadToast />
        </div>
    )
}
