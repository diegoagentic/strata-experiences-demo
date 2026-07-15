/**
 * COMPONENT: LaurenClaimScene (a1.2e)
 * PURPOSE: Lauren receives Lena's missing-carton notification, reviews the order
 *          + missing item, attaches proof of shipment, and sends a claim to Herman Miller.
 *
 * FLOW:
 *   dashboard → notification from Lena slides in → click → review order + missing item
 *   → attach proof → compose claim dialog → send → nextStep()
 */

import { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import {
    AlertTriangle, CheckCircle2, FileText, Mail, Send, X,
    Package, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocViewer, { BFI_DOCS } from './BFIDocViewer'
import BFIDashboardScene from './BFIDashboardScene'
import EmailMetadataBlock from './EmailMetadataBlock'

const LAUREN_NOTIFICATION = {
    title: 'DOE-2847 · Carton #34 missing · Receiving complete',
    desc: 'Lena C. · 34/35 cartons received · carton #34 missing · CORE updated',
    cta: 'Review report & file claim →',
}

// ─── Claim message template ───────────────────────────────────────────────────

const CLAIM_MESSAGE = `Hi Herman Miller team,

We are filing a missing carton claim for PO DOE-2847 (CoNY · NYC Dept. of Education), delivered to WIG Group NJ Warehouse on May 11, 2026.

Shipment summary:
  · Cartons received: 34 of 35
  · Missing item: Monitor Arm Dual Adjustable · carton #34

Please review the attached receiving report (RR-37577) and confirm receipt of this claim. We request a replacement unit within 5 business days.

— Lauren DeMarco
  BFI Furniture · CoNY Account Manager
  lauren.demarco@bfifurniture.com`

// ─── Order Detail Card ────────────────────────────────────────────────────────

function OrderDetailCard({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
    const LINES = [
        { abbr: 'FU-2',  desc: 'Filing Unit Lateral 2-Drawer 36"',  qty: 8,  status: 'ok' },
        { abbr: 'FU-4',  desc: 'Filing Unit Vertical 4-Drawer 26"', qty: 4,  status: 'ok' },
        { abbr: 'WS-60', desc: 'Work Surface 60" × 30"',            qty: 6,  status: 'ok' },
        { abbr: 'WS-72', desc: 'Work Surface 72" × 30"',            qty: 4,  status: 'ok' },
        { abbr: 'SC',    desc: 'Storage Cabinet Overhead 72"',       qty: 3,  status: 'ok' },
        { abbr: 'CHAIR', desc: 'Ergonomic Chair · Aeron B · HM',    qty: 8,  status: 'ok' },
        { abbr: 'M-ARM', desc: 'Monitor Arm Dual Adjustable',        qty: 2,  status: 'missing' },
    ]

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-muted/30 transition-colors"
            >
                <div className="h-7 w-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 text-left">
                    <div className="text-[11px] font-bold text-foreground">DOE-2847</div>
                    <div className="text-[9px] text-muted-foreground">NYC Dept. of Education · 35 cartons · 1 carton missing</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                        1 missing
                    </span>
                    {expanded
                        ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    }
                </div>
            </button>

            {expanded && (
                <div className="border-t border-border px-3.5 py-3 space-y-1 animate-in fade-in duration-200">
                    <div className="grid grid-cols-[2.5rem_1fr_2rem_4rem] gap-1 pb-1 border-b border-border/60 text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                        <span>Ref</span><span>Description</span><span className="text-right">Qty</span><span className="text-right">Status</span>
                    </div>
                    {LINES.map(l => (
                        <div key={l.abbr} className={`grid grid-cols-[2.5rem_1fr_2rem_4rem] gap-1 py-0.5 text-[10px] ${l.status === 'missing' ? 'font-bold text-destructive' : 'text-foreground'}`}>
                            <span className={`text-[8px] font-bold px-1 rounded text-center self-center ${l.status === 'missing' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                                {l.abbr}
                            </span>
                            <span className="truncate self-center">{l.desc}</span>
                            <span className="text-right self-center">{l.qty}</span>
                            <span className={`text-right self-center text-[9px] font-bold ${l.status === 'missing' ? 'text-destructive' : 'text-success'}`}>
                                {l.status === 'missing' ? '✗ missing' : '✓ rcv\'d'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Claim Dialog ─────────────────────────────────────────────────────────────

function ClaimDialog({ isOpen, onSent, onClose }: { isOpen: boolean; onSent: () => void; onClose?: () => void }) {
    const [sent,      setSent]      = useState(false)
    const [message,   setMessage]   = useState(CLAIM_MESSAGE)
    const [fromEmail, setFromEmail] = useState('lauren.demarco@bfifurniture.com')
    const [toEmail,   setToEmail]   = useState('claims@hermanmiller.com')
    const [ccEmail,   setCcEmail]   = useState('walter.goley@conyny.gov · CoNY PM')
    const [dateText,  setDateText]  = useState('May 11, 2026 · 9:05 AM')
    const [subject,   setSubject]   = useState('Missing Carton · DOE-2847 · Monitor Arm')
    const [attachments, setAttachments] = useState([
        { name: 'RR-37577_BingoSheet_May11.pdf', meta: '2 pages' },
    ])

    const handleSend = () => { setSent(true); setTimeout(() => onSent(), 900) }
    const removeAttachment = (name: string) => setAttachments(prev => prev.filter(a => a.name !== name))


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
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <span className="text-[9px] font-black text-muted-foreground">HM</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[12px] font-bold text-foreground">Herman Miller · Customer Service</div>
                                    <div className="text-[10px] text-muted-foreground">claims@hermanmiller.com · Missing Carton Claim</div>
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
                                    {/* Missing item summary */}
                                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 space-y-1 text-[11px]">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                                            <span className="text-[10px] font-bold text-foreground uppercase tracking-wide">Missing Item</span>
                                        </div>
                                        {[
                                            { label: 'Order',    value: 'DOE-2847' },
                                            { label: 'Item',     value: 'Monitor Arm Dual Adjustable' },
                                            { label: 'PO line',  value: 'L7 · 1 of 2 units' },
                                            { label: 'Carton',   value: '#34 of 35 · Storage Room' },
                                        ].map(r => (
                                            <div key={r.label} className="flex items-start gap-2">
                                                <span className="text-muted-foreground w-14 shrink-0">{r.label}:</span>
                                                <span className="font-medium text-foreground">{r.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Editable message */}
                                    <div className="space-y-1.5">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Message</span>
                                        <textarea
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            rows={9}
                                            disabled={sent}
                                            className="w-full text-[11px] text-foreground bg-muted/30 border border-border rounded-xl px-3.5 py-2.5 leading-relaxed resize-none outline-none focus:border-primary/50 transition-colors disabled:opacity-60"
                                        />
                                    </div>

                                    {/* Attachments — removable */}
                                    <div className="flex flex-col gap-1.5">
                                        {attachments.map(a => (
                                            <div key={a.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border text-[11px] text-foreground font-medium">
                                                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                <span className="flex-1 truncate">{a.name}</span>
                                                <span className="text-[9px] text-muted-foreground">· {a.meta}</span>
                                                {!sent && (
                                                    <button onClick={() => removeAttachment(a.name)} className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0" aria-label={`Remove ${a.name}`}>
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {sent && (
                                        <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                            <div className="text-xs">
                                                <div className="font-bold text-foreground">Claim sent to Herman Miller · May 11 · 9:05 AM</div>
                                                <div className="text-muted-foreground mt-0.5">Receiving report attached · Awaiting replacement unit</div>
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
                                        Send →
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

export default function LaurenClaimScene() {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const [phase,         setPhase]         = useState<'dashboard' | 'detail'>('dashboard')

    useEffect(() => {
        const handler = () => setPhase('detail')
        window.addEventListener('bfi:claim-open', handler)
        return () => window.removeEventListener('bfi:claim-open', handler)
    }, [])

    const [orderExpanded, setOrderExpanded] = useState(true)
    const [showClaim,      setShowClaim]      = useState(false)

    if (phase === 'dashboard') {
        return (
            <BFIDashboardScene
                staticMode
                onNavigate={() => setPhase('detail')}
            />
        )
    }

    return (
        <div className="space-y-3">

            {/* ── Notification header from Lena ── */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-muted/30 border-b border-border">
                    <div className="h-6 w-6 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-foreground">DOE-2847 · Carton #34 Missing · Receiving complete</div>
                        <div className="text-[9px] text-muted-foreground">From: lena.c@bfifurniture.com · May 11 · 8:42 AM</div>
                    </div>
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </div>
                <div className="px-4 py-3 space-y-1.5 text-[11px] text-foreground leading-relaxed">
                    <p>Hi Lauren,</p>
                    <p>Received DOE-2847 at WIG — <span className="font-semibold">34 of 35 cartons received.</span></p>
                    <p className="text-destructive font-medium">
                        Monitor Arm Dual Adjustable · carton #34 is missing.
                    </p>
                    <p className="text-muted-foreground text-[10px]">— Lena C. · Receiving Coordinator</p>
                </div>
            </div>

            {/* ── 2-column: Receiving Report | Order Detail + Proof + CTA ── */}
            <div className="grid grid-cols-2 gap-3">

                {/* Left: Receiving Report document */}
                <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-border bg-muted/30">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Receiving Report · RR-37577</span>
                    </div>
                    <div className="p-3 space-y-3">
                        <BFIDocViewer {...BFI_DOCS.RR_37577_MISSING} height={200} extractedFields={[]} />
                        {/* Bingo grid */}
                        <div className="space-y-2">
                            <div className="grid grid-cols-7 gap-0.5">
                                {Array.from({ length: 35 }, (_, i) => i + 1).map(n => {
                                    const missing = n === 34
                                    return (
                                        <div key={n} className={`flex items-center justify-center rounded p-1 text-center min-h-[28px] ${
                                            missing ? 'bg-destructive/10 border border-destructive/30' : 'bg-success/5 border border-success/20'
                                        }`}>
                                            <span className={`text-[9px] font-bold leading-tight ${missing ? 'text-destructive' : 'text-muted-foreground/70'}`}>
                                                {missing ? '✗' : `#${n}`}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="bg-destructive/5 border border-destructive/20 rounded-lg px-2.5 py-2 flex items-center gap-2">
                                <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                                <span className="text-[10px] font-bold text-foreground">Monitor Arm Dual Adjustable · carton #34 is missing</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Order detail + CTA */}
                <div className="space-y-3 flex flex-col">
                    <OrderDetailCard expanded={orderExpanded} onToggle={() => setOrderExpanded(v => !v)} />
                    <button
                        onClick={() => setShowClaim(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-destructive text-white hover:opacity-90 transition-all shadow-sm mt-auto"
                    >
                        <AlertTriangle className="h-4 w-4" />
                        Claim →
                    </button>
                </div>
            </div>

            <ClaimDialog isOpen={showClaim} onSent={() => { setShowClaim(false); pauseAware(() => nextStep())() }} onClose={() => setShowClaim(false)} />

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
