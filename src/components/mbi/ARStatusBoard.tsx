/**
 * COMPONENT: ARStatusBoard
 * PURPOSE: AR Status Taxonomy dashboard — structured status for every AR record
 *          (pending approval / no response / committed-to-pay / escalated) instead
 *          of today's Outlook-dependent tracking. Live live AR view replaces the
 *          bi-weekly manual process for Kathy.
 *
 * PROPS:
 *   - records: ARRecord[]
 *
 * STATES per card:
 *   - escalated — red accent
 *   - no-response — amber accent
 *   - pending-approval — info accent (blue)
 *   - committed-to-pay — success accent (green)
 *
 * DS TOKENS: bg-card · border-border · red/amber/info/success
 *
 * USED BY: MBIAccountingPage (Phase 3.C)
 */

import { useState } from 'react'
import { User, Calendar, AlertTriangle, Clock, Check, TrendingUp, Mail, Phone, ExternalLink, ChevronDown, PauseCircle, Wrench, ClipboardCheck, MessageSquare, Send, Sparkles } from 'lucide-react'
import type { ARRecord } from '../../config/profiles/mbi-data'
import ARHoldReviewModal from './ARHoldReviewModal'

// F33.a H3 · era raw red-*/amber-* · reemplazado por tokens semánticos.
// F38 · Diego 2026-07-27 · simplificado uso de color · el pattern anterior
// aplicaba color en 5 elementos simultáneos (bg column · border column ·
// accent header · pillBg · leftBar de cada card) · exceso visual. Ahora
// el color queda solo en el label uppercase del header + un dot pequeño
// por card. Las cards individuales son neutrales (bg-card border-border) ·
// consistentes con Leland POs · CLC calendar jobs · Officeworks Funnel.
const STATUS_META = {
    'escalated': {
        label: 'Escalated',
        accent: 'text-destructive',
        dot: 'bg-destructive',
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
    'no-response': {
        label: 'No response',
        accent: 'text-warning',
        dot: 'bg-warning',
        icon: <Clock className="h-3.5 w-3.5" />,
    },
    'pending-approval': {
        label: 'Pending approval',
        accent: 'text-info',
        dot: 'bg-info',
        icon: <Clock className="h-3.5 w-3.5" />,
    },
    'committed-to-pay': {
        label: 'Committed to pay',
        accent: 'text-success',
        dot: 'bg-success',
        icon: <Check className="h-3.5 w-3.5" />,
    },
} as const

interface ARStatusBoardProps {
    records: ARRecord[]
    /** IDs of records that already have an AI-drafted email queued for the
     *  next step. Marked with a "Draft ready" badge + amber ring so the
     *  audience can see the continuity between the aging board (this scene)
     *  and the drafts panel (next scene). */
    highlightedIds?: string[]
}

export default function ARStatusBoard({ records, highlightedIds }: ARStatusBoardProps) {
    const highlightSet = new Set(highlightedIds ?? [])
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [actionToast, setActionToast] = useState<string | null>(null)
    const [reviewRecord, setReviewRecord] = useState<ARRecord | null>(null)
    const [resolvedHolds, setResolvedHolds] = useState<Set<string>>(new Set())
    const [holdComments, setHoldComments] = useState<Map<string, string>>(new Map())

    const grouped: Record<keyof typeof STATUS_META, ARRecord[]> = {
        'escalated': records.filter(r => r.status === 'escalated'),
        'no-response': records.filter(r => r.status === 'no-response'),
        'pending-approval': records.filter(r => r.status === 'pending-approval'),
        'committed-to-pay': records.filter(r => r.status === 'committed-to-pay'),
    }

    const totalAR = records.reduce((acc, r) => acc + r.amount, 0)
    const committedTotal = grouped['committed-to-pay'].reduce((acc, r) => acc + r.amount, 0)

    const flashAction = (label: string) => {
        setActionToast(label)
        setExpandedId(null)
        setTimeout(() => setActionToast(null), 2200)
    }

    const handleSendToCollections = (id: string, clientName: string) => {
        setResolvedHolds(prev => new Set([...prev, id]))
        setReviewRecord(null)
        setActionToast(`${clientName} released from hold · sent to collections queue`)
        setTimeout(() => setActionToast(null), 3000)
    }

    const handleKeepOnHold = (id: string, comment: string) => {
        setHoldComments(prev => new Map([...prev, [id, comment]]))
        setReviewRecord(null)
        setActionToast(`Comment logged · ${id} remains on hold`)
        setTimeout(() => setActionToast(null), 2500)
    }

    return (
        <div className="space-y-3">
            {/* Helper inline component declaration above */}
            {/* Summary banner */}
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
                <div>
                    <div className="text-xs font-bold text-foreground">AR Status Taxonomy</div>
                    <div className="text-[10px] text-muted-foreground">
                        Replaces Outlook-dependent tracking · live status across {records.length} open records
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total AR</div>
                    <div className="text-lg font-bold text-foreground tabular-nums">${totalAR.toLocaleString()}</div>
                    <div className="text-[10px] text-success">
                        <TrendingUp className="inline h-2.5 w-2.5 mr-0.5" />
                        ${committedTotal.toLocaleString()} committed
                    </div>
                </div>
            </div>

            {/* Quick action toast */}
            {actionToast && (
                <div className="bg-success/10 dark:bg-success/15 border border-success/30 rounded-xl p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    <span className="text-xs text-foreground"><strong>Done:</strong> {actionToast}</span>
                </div>
            )}

            {/* 4 status columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map(statusKey => {
                    const meta = STATUS_META[statusKey]
                    const items = grouped[statusKey]
                    return (
                        // F38 · Column shell · bg-card neutral · border-border neutral.
                        // Antes usaba meta.bg (bg-*/5) + meta.border (border-*/30) que
                        // sumaba con las cards internas colored.
                        <div key={statusKey} className="border border-border rounded-2xl overflow-hidden bg-card">
                            <div className="px-3 py-2.5 border-b border-border">
                                <div className="flex items-center justify-between">
                                    <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${meta.accent}`}>
                                        {meta.icon}
                                        <span>{meta.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {statusKey === 'pending-approval' && items.filter(r => r.collectionsHold).length > 0 && (
                                            // F38.b · pill neutralizado · dot warning + text muted (era bg-warning/15 text-warning saturado)
                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                <span className="h-1 w-1 rounded-full bg-warning" aria-hidden />
                                                {items.filter(r => r.collectionsHold).length} on hold
                                            </span>
                                        )}
                                        <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
                                            {items.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-card p-2 space-y-1.5 max-h-80 overflow-y-auto">
                                {items.length === 0 ? (
                                    <div className="text-center text-[10px] text-muted-foreground py-4">—</div>
                                ) : (
                                    items.map(r => {
                                        const isOpen = expandedId === r.id
                                        const hasDraft = highlightSet.has(r.id)
                                        return (
                                            // F38.b · Card fully neutral · border-border · sin border-l-4 · sin border-2 · sin ring warning.
                                            // Color code UNICO = dot pequeño izquierdo (h-1.5 w-1.5) + status pills neutralizados
                                            // (bg-muted + text-muted-foreground + icon warning small como signal secundaria).
                                            <div key={r.id} className={`relative bg-card border border-border rounded-lg text-xs transition-all ${
                                                isOpen ? 'border-border/70' : 'hover:border-border/70'
                                            }`}>
                                                {r.collectionsHold && !resolvedHolds.has(r.id) && (
                                                    // F38.b · pill Collections hold neutralizado (era bg-warning/10 + text-warning saturado)
                                                    <div className="px-2.5 py-1.5 bg-muted/50 border-b border-border flex items-center gap-1.5">
                                                        <PauseCircle className="h-2.5 w-2.5 text-warning shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                                                Collections hold
                                                            </span>
                                                            <span className="text-[9px] text-muted-foreground ml-1">
                                                                {r.holdReason === 'installation-pending'
                                                                    ? `· Installation ${r.installationDate ? new Date(r.installationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'pending'}`
                                                                    : `· ${r.punchListOpen} punch list items open`}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={e => { e.stopPropagation(); setReviewRecord(r) }}
                                                            className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-card border border-border text-foreground hover:bg-muted transition-colors"
                                                        >
                                                            <ClipboardCheck className="h-2.5 w-2.5" />
                                                            Review hold
                                                        </button>
                                                    </div>
                                                )}
                                                {r.collectionsHold && resolvedHolds.has(r.id) && (
                                                    <div className="px-2.5 py-1.5 bg-muted/50 border-b border-border flex items-center gap-1.5">
                                                        <Check className="h-2.5 w-2.5 text-success shrink-0" />
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                                            Released · sent to collections
                                                        </span>
                                                    </div>
                                                )}
                                                {hasDraft && !r.collectionsHold && (
                                                    // F38.b · Draft ready pill neutralizado
                                                    <div className="px-2.5 py-1 bg-muted/50 border-b border-border flex items-center gap-1.5">
                                                        <Mail className="h-2.5 w-2.5 text-warning" />
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                                            Draft ready · review next
                                                        </span>
                                                    </div>
                                                )}
                                                {holdComments.has(r.id) && (
                                                    <div className="px-2.5 py-1.5 bg-muted/40 border-b border-border flex items-start gap-1.5">
                                                        <MessageSquare className="h-2.5 w-2.5 text-muted-foreground shrink-0 mt-0.5" />
                                                        <span className="text-[9px] text-muted-foreground italic">"{holdComments.get(r.id)}"</span>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => setExpandedId(isOpen ? null : r.id)}
                                                    className="w-full text-left px-2.5 py-2"
                                                    aria-expanded={isOpen}
                                                >
                                                    <div className="flex items-center justify-between mb-0.5 gap-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            {/* F38 · Dot pequeño de color · el único indicador
                                                                de status en la card. Reemplaza el border-l-4
                                                                colored anterior. */}
                                                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${meta.dot}`} aria-hidden />
                                                            <span className="font-bold text-foreground truncate">{r.client}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <span className="font-bold text-foreground tabular-nums">${(r.amount / 1000).toFixed(0)}K</span>
                                                            <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                        <span className="font-mono truncate">{r.poNumber}</span>
                                                        <span className="shrink-0 ml-1">{r.daysPastDue}d past due</span>
                                                    </div>
                                                    {r.salesperson && (
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                                            <User className="h-2.5 w-2.5" />
                                                            <span className="truncate">{r.salesperson}</span>
                                                            {r.lastContact && (
                                                                <>
                                                                    <Calendar className="h-2.5 w-2.5 ml-1" />
                                                                    <span>{r.lastContact}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                    {r.replyIntent && (
                                                        <div className="flex items-start gap-1 mt-1.5 px-1.5 py-1 bg-ai/10 rounded text-[9px] text-ai font-semibold leading-tight">
                                                            <Sparkles className="h-2.5 w-2.5 shrink-0 mt-px" />
                                                            <span>{r.replyIntent}</span>
                                                        </div>
                                                    )}
                                                </button>
                                                {isOpen && (
                                                    <ARQuickActions
                                                        record={r}
                                                        onAction={flashAction}
                                                        holdResolved={resolvedHolds.has(r.id)}
                                                    />
                                                )}
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Hold review modal */}
            <ARHoldReviewModal
                record={reviewRecord}
                onClose={() => setReviewRecord(null)}
                onRelease={() => reviewRecord && handleSendToCollections(reviewRecord.id, reviewRecord.client)}
                onComment={(text) => reviewRecord && handleKeepOnHold(reviewRecord.id, text)}
            />
        </div>
    )
}

// ─── Quick actions (inline expand) ──────────────────────────────────────────
function ARQuickActions({
    record,
    onAction,
    holdResolved,
}: {
    record: ARRecord
    onAction: (label: string) => void
    holdResolved?: boolean
}) {
    type Action = { icon: React.ReactNode; label: string; tone: 'primary' | 'neutral' | 'danger' }
    const actions: Action[] = (() => {
        switch (record.status) {
            case 'escalated':
                return [
                    { icon: <Phone className="h-3 w-3" />, label: `Log call attempt with ${record.client}`, tone: 'primary' },
                    { icon: <Mail className="h-3 w-3" />, label: `Send escalation reminder to ${record.client}`, tone: 'neutral' },
                    { icon: <ExternalLink className="h-3 w-3" />, label: `Open ${record.poNumber} in CORE`, tone: 'neutral' },
                ]
            case 'no-response':
                return [
                    { icon: <Mail className="h-3 w-3" />, label: `Send 2nd reminder to ${record.client}`, tone: 'primary' },
                    { icon: <AlertTriangle className="h-3 w-3" />, label: `Escalate ${record.poNumber} to Account Manager`, tone: 'danger' },
                    { icon: <ExternalLink className="h-3 w-3" />, label: `Open ${record.poNumber} in CORE`, tone: 'neutral' },
                ]
            case 'pending-approval':
                if (record.collectionsHold && !holdResolved) {
                    return [
                        { icon: <PauseCircle className="h-3 w-3" />, label: record.holdReason === 'installation-pending'
                            ? `Held — installation scheduled ${record.installationDate ? new Date(record.installationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''} · Strata will auto-release`
                            : `Held — ${record.punchListOpen} punch list items open · Strata will auto-release when closed`, tone: 'neutral' },
                        { icon: <Wrench className="h-3 w-3" />, label: record.holdReason === 'punch-list-open' ? `View open punch list for ${record.client}` : `View installation schedule`, tone: 'neutral' },
                        { icon: <ExternalLink className="h-3 w-3" />, label: `Open ${record.poNumber} in CORE`, tone: 'neutral' },
                    ]
                }
                if (record.collectionsHold && holdResolved) {
                    return [
                        { icon: <Send className="h-3 w-3" />, label: `${record.client} added to collections queue`, tone: 'primary' },
                        { icon: <ExternalLink className="h-3 w-3" />, label: `Open ${record.poNumber} in CORE`, tone: 'neutral' },
                    ]
                }
                return [
                    { icon: <Mail className="h-3 w-3" />, label: `Ping ${record.client} for status update`, tone: 'primary' },
                    { icon: <ExternalLink className="h-3 w-3" />, label: `Open ${record.poNumber} in CORE`, tone: 'neutral' },
                ]
            case 'committed-to-pay':
                return [
                    { icon: <Check className="h-3 w-3" />, label: `Mark ${record.poNumber} as paid`, tone: 'primary' },
                    { icon: <ExternalLink className="h-3 w-3" />, label: `Open ${record.poNumber} in CORE`, tone: 'neutral' },
                ]
        }
    })()

    return (
        <div className="border-t border-border bg-background/60 dark:bg-zinc-900/40 px-2.5 py-2 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Quick actions</div>
            {actions.map(a => (
                <button
                    key={a.label}
                    onClick={() => onAction(a.label)}
                    className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-bold transition-colors text-left ${
                        a.tone === 'primary' ? 'bg-primary text-primary-foreground hover:bg-primary/90' :
                        a.tone === 'danger' ? 'bg-destructive/10 text-destructive hover:bg-destructive/15' :
                        'bg-card text-foreground hover:bg-muted border border-border'
                    }`}
                >
                    {a.icon}
                    <span className="truncate">{a.label}</span>
                </button>
            ))}
        </div>
    )
}
