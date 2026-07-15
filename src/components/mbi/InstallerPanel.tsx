/**
 * COMPONENT: InstallerPanel
 * PURPOSE: Installer Invoice vs PO Agent — compares installer invoices against
 *          CORE POs to detect undocumented scope changes (change orders that
 *          went verbal). Captures change-order trail for the audit log.
 *
 *          Mock data: 3 installer invoices, 1 with unflagged scope creep.
 *
 * STATES: each row shows clean / change-order / mismatch
 *
 * DS TOKENS: bg-card · border-border · success/amber/info accents
 *
 * USED BY: MBIAccountingPage (Phase 3.B section · compact)
 */

import { Wrench, AlertTriangle, CheckCircle2, MessageSquare } from 'lucide-react'
import { StatusBadge, type StatusTone } from '../shared'

interface InstallerInvoice {
    id: string
    installer: string
    poId: string
    poAmount: number
    invoiceAmount: number
    delta: number
    status: 'clean' | 'change-order' | 'over'
    note?: string
}

const MOCK_INSTALLER_INVOICES: InstallerInvoice[] = [
    {
        id: 'INST-2026-0042',
        installer: 'St. Charles Install Crew',
        poId: 'PO-2026-0050',
        poAmount: 8400,
        invoiceAmount: 8400,
        delta: 0,
        status: 'clean',
    },
    {
        id: 'INST-2026-0043',
        installer: 'KC Crew Partners',
        poId: 'PO-2026-0053',
        poAmount: 12400,
        invoiceAmount: 14200,
        delta: 1800,
        status: 'change-order',
        note: '8 additional workstation installs requested by client onsite',
    },
    {
        id: 'INST-2026-0044',
        installer: 'Riverside In-House',
        poId: 'PO-2026-0061',
        poAmount: 6200,
        invoiceAmount: 7800,
        delta: 1600,
        status: 'over',
        note: 'No documented scope change — flagged for clarification',
    },
]

export default function InstallerPanel() {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                        <Wrench className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Installer invoice vs PO</div>
                        <div className="text-[10px] text-muted-foreground">Captures verbal change-orders into the audit log via Teams</div>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-border">
                {MOCK_INSTALLER_INVOICES.map(inv => (
                    <Row key={inv.id} invoice={inv} />
                ))}
            </div>
        </div>
    )
}

// ─── Row ─────────────────────────────────────────────────────────────────────
function Row({ invoice }: { invoice: InstallerInvoice }) {
    const theme: {
        icon: React.ReactNode
        iconBg: string
        label: string
        tone: StatusTone
        deltaClass: string
    } = (() => {
        if (invoice.status === 'clean') return {
            icon: <CheckCircle2 className="h-4 w-4" />,
            iconBg: 'bg-success/10 text-success',
            label: 'Clean match',
            tone: 'success',
            deltaClass: 'text-muted-foreground',
        }
        if (invoice.status === 'change-order') return {
            icon: <MessageSquare className="h-4 w-4" />,
            iconBg: 'bg-info/10 text-info',
            label: 'Change-order documented',
            tone: 'info',
            deltaClass: 'text-info',
        }
        return {
            icon: <AlertTriangle className="h-4 w-4" />,
            iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            label: 'Needs clarification',
            tone: 'warning',
            deltaClass: 'text-amber-600 dark:text-amber-400',
        }
    })()

    return (
        <div className="px-4 py-3 flex items-center gap-3 text-xs">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                {theme.icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground truncate">{invoice.installer}</span>
                    <StatusBadge label={theme.label} tone={theme.tone} size="xs" />
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">{invoice.id} · linked to {invoice.poId}</div>
                {invoice.note && (
                    <div className="text-[10px] text-muted-foreground italic mt-1">{invoice.note}</div>
                )}
            </div>
            <div className="text-right shrink-0">
                <div className="text-[10px] text-muted-foreground">PO ${invoice.poAmount.toLocaleString()} → Inv ${invoice.invoiceAmount.toLocaleString()}</div>
                <div className={`text-sm font-bold tabular-nums ${theme.deltaClass}`}>
                    {invoice.delta > 0 ? '+' : ''}${invoice.delta.toLocaleString()}
                </div>
            </div>
        </div>
    )
}
