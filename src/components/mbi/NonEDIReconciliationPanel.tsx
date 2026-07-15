/**
 * COMPONENT: NonEDIReconciliationPanel
 * PURPOSE: Non-EDI PO vs Invoice reconciliation view. For the ~50% of MBI's
 *          manufacturers without EDI (Apex Workspace, CaseWorks, Pinnacle, etc.),
 *          Strata compares PO to invoice line-by-line and routes clean matches
 *          automatically. Only exceptions surface for Kathy.
 *
 *          Shows: summary stats (N invoices · X clean · Y mismatches) plus
 *          expanded mismatch cards with side-by-side PO vs Invoice fields.
 *
 * PROPS:
 *   - invoices: Invoice[]          — filtered to non-EDI upstream
 *
 * STATES:
 *   - each mismatch card: pending (action buttons) or resolved (collapsed badge)
 *
 * DS TOKENS: bg-card · border-border · red (mismatch) · success (clean) · ai
 *
 * USED BY: MBIAccountingPage (Phase 3.B section of m2.2)
 */

import { useState } from 'react'
import { FileText, AlertTriangle, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import { StatusBadge } from '../shared'
import type { Invoice } from '../../config/profiles/mbi-data'

interface NonEDIReconciliationPanelProps {
    invoices: Invoice[]
}

type ResolutionState = 'pending' | 'accepted' | 'overridden'

export default function NonEDIReconciliationPanel({ invoices }: NonEDIReconciliationPanelProps) {
    const nonEDI = invoices.filter(i => !i.isEDI)
    const mismatches = nonEDI.filter(i => i.hasException)
    const clean = nonEDI.filter(i => !i.hasException)

    const [states, setStates] = useState<Record<string, ResolutionState>>({})
    const setState = (id: string, s: ResolutionState) =>
        setStates(prev => ({ ...prev, [id]: s }))

    const resolvedCount = Object.values(states).filter(s => s !== 'pending').length

    return (
        <div className="space-y-3">
            {/* Summary */}
            <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl p-4 grid grid-cols-3 gap-4">
                <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Non-EDI invoices</div>
                    <div className="text-2xl font-bold text-foreground tabular-nums mt-0.5">{nonEDI.length}</div>
                </div>
                <div>
                    <div className="text-[10px] font-bold text-success uppercase tracking-wider">Auto-posted</div>
                    <div className="text-2xl font-bold text-success tabular-nums mt-0.5">{clean.length}</div>
                    <div className="text-[10px] text-muted-foreground">clean · no review needed</div>
                </div>
                <div>
                    <div className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Mismatches</div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums mt-0.5">
                        {mismatches.length - resolvedCount}
                    </div>
                    <div className="text-[10px] text-muted-foreground">pending approval</div>
                </div>
            </div>

            {/* Mismatch cards */}
            {mismatches.length === 0 ? (
                <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                    All non-EDI invoices reconciled automatically.
                </div>
            ) : (
                <div className="space-y-3">
                    {mismatches.map(inv => (
                        <MismatchCard
                            key={inv.id}
                            invoice={inv}
                            state={states[inv.id] ?? 'pending'}
                            onState={s => setState(inv.id, s)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Single mismatch card ────────────────────────────────────────────────────
function MismatchCard({
    invoice,
    state,
    onState,
}: {
    invoice: Invoice
    state: ResolutionState
    onState: (s: ResolutionState) => void
}) {
    // Derive PO vs Invoice comparison fields from the exception reason
    // For demo realism: parse the reason to extract expected vs actual values
    // Keep the mock simple — real delta numbers shown below
    const parseDelta = () => {
        if (invoice.exceptionReason?.includes('Quantity')) {
            return { field: 'Quantity', expected: 'PO: 6 units', actual: 'Invoice: 5 units', delta: '-1 unit' }
        }
        if (invoice.exceptionReason?.includes('freight')) {
            return { field: 'Freight line', expected: 'PO: freight included', actual: 'Invoice: no freight line', delta: 'missing' }
        }
        return { field: 'Field mismatch', expected: invoice.exceptionReason ?? 'PO value', actual: 'Invoice value differs', delta: 'review' }
    }
    const d = parseDelta()
    const isResolved = state !== 'pending'

    if (isResolved) {
        return (
            <div className="bg-success/5 border border-success/30 rounded-2xl p-3 flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <div className="flex-1 text-xs">
                    <div className="font-semibold text-foreground">{invoice.vendor} · {invoice.id}</div>
                    <div className="text-muted-foreground">
                        {state === 'accepted' ? 'Accepted vendor value · PO updated' : 'Kept PO · vendor notified'}
                    </div>
                </div>
                <button onClick={() => onState('pending')} className="text-[10px] text-muted-foreground hover:text-foreground underline shrink-0">
                    Reopen
                </button>
            </div>
        )
    }

    return (
        <div className="bg-red-50/40 dark:bg-red-500/5 border-2 border-red-300 dark:border-red-500/30 rounded-2xl p-4">
            <div className="flex items-start gap-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge label="Non-EDI mismatch" tone="danger" size="sm" />
                        <span className="text-[10px] text-muted-foreground">{invoice.vendor} · {invoice.poNumber}</span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground mt-1">{d.field}</h4>
                </div>
            </div>

            {/* Side-by-side PO vs Invoice */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="bg-background border border-border rounded-xl p-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">PO (Strata)</div>
                    <div className="text-xs text-foreground">{d.expected}</div>
                </div>
                <div className="hidden md:flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="bg-background border border-red-300 dark:border-red-500/30 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Invoice (vendor)</div>
                    <div className="text-xs text-foreground">{d.actual}</div>
                </div>
            </div>

            {/* AI-suggestion + actions */}
            <div className="mt-3 bg-background border border-border rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-3 w-3 text-ai" />
                    <div className="text-[10px] font-bold text-ai uppercase tracking-wider">Strata suggests</div>
                </div>
                <div className="text-xs text-foreground">
                    Partial shipment likely — vendor billed the units shipped, remainder expected next week. Accept vendor value + trigger backorder alert, or keep PO and email vendor.
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3">
                <button
                    onClick={() => onState('overridden')}
                    className="px-3 py-1.5 text-xs font-bold text-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors"
                >
                    Keep PO
                </button>
                <button
                    onClick={() => onState('accepted')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
                >
                    <FileText className="h-3 w-3" />
                    Accept vendor value
                </button>
            </div>
        </div>
    )
}
