/**
 * COMPONENT: EscalationRuleBuilder
 * PURPOSE: Visualizes Strata's AR escalation rules engine — the automatic
 *          triggers (days past due × $ threshold × follow-up count) that
 *          route escalations to salesperson with SLA tracking. Replaces
 *          informal periodic follow-ups.
 *
 *          Per Notion assessment data:
 *          - ~10% of invoices need 1st reminder
 *          - 20-25% need 2nd follow-up
 *          - 10-15% escalate to salesperson
 *
 *          Each tier has defined SLA + auto-escalation threshold + Teams routing.
 *
 * STATES: static visualization (no props needed for demo)
 *
 * DS TOKENS: bg-card · border-border · tier-specific accents
 *
 * USED BY: MBIAccountingPage (Phase 3.C)
 */

import { Fragment } from 'react'
import { ArrowRight, Bell, Mail, AlertTriangle, Shield } from 'lucide-react'

interface TierSpec {
    id: string
    title: string
    trigger: string
    action: string
    icon: React.ReactNode
    accent: string
    border: string
    bg: string
    pillBg: string
    assignee: string
    sla: string
    distribution: string
}

const TIERS: TierSpec[] = [
    {
        id: 'reminder',
        title: '1st reminder',
        trigger: '> 7 days past due',
        action: 'AI-drafted email to client AP contact',
        icon: <Bell className="h-4 w-4" />,
        accent: 'text-info',
        border: 'border-info/30',
        bg: 'bg-info/5',
        pillBg: 'bg-info/10 text-info',
        assignee: 'Controller reviews draft',
        sla: '24h response target',
        distribution: '~10% of invoices',
    },
    {
        id: 'followup',
        title: '2nd follow-up',
        trigger: '> 14 days · no response',
        action: 'Escalated email + CC salesperson',
        icon: <Mail className="h-4 w-4" />,
        accent: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-300 dark:border-amber-500/30',
        bg: 'bg-amber-50 dark:bg-amber-500/5',
        pillBg: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
        assignee: 'Salesperson notified',
        sla: '48h response target',
        distribution: '20-25% of invoices',
    },
    {
        id: 'escalate',
        title: 'Salesperson escalation',
        trigger: '> 30 days · no commitment',
        action: 'Teams alert to sales + owner + controller',
        icon: <AlertTriangle className="h-4 w-4" />,
        accent: 'text-red-700 dark:text-red-400',
        border: 'border-red-300 dark:border-red-500/30',
        bg: 'bg-red-50 dark:bg-red-500/10',
        pillBg: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
        assignee: 'Salesperson owns',
        sla: '72h commitment required',
        distribution: '10-15% of invoices',
    },
]

export default function EscalationRuleBuilder() {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                    <Shield className="h-3.5 w-3.5" />
                </div>
                <div>
                    <div className="text-xs font-bold text-foreground">Escalation rules engine</div>
                    <div className="text-[10px] text-muted-foreground">
                        Auto-triggered by Strata · replaces informal periodic follow-ups · logged in audit trail
                    </div>
                </div>
            </div>

            {/* 3-tier pipeline */}
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 items-stretch">
                    {TIERS.map((tier, i) => (
                        <Fragment key={tier.id}>
                            <div className={`border rounded-xl p-3 ${tier.border} ${tier.bg}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${tier.pillBg}`}>
                                        {tier.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs font-bold ${tier.accent}`}>{tier.title}</div>
                                        <div className="text-[10px] text-muted-foreground">{tier.distribution}</div>
                                    </div>
                                </div>
                                <div className="space-y-1.5 mt-2">
                                    <div>
                                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Trigger</div>
                                        <div className="text-xs text-foreground">{tier.trigger}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Auto action</div>
                                        <div className="text-xs text-foreground">{tier.action}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Owner · SLA</div>
                                        <div className="text-xs text-foreground">
                                            {tier.assignee} · <span className="font-semibold">{tier.sla}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {i < TIERS.length - 1 && (
                                <div className="hidden md:flex items-center justify-center">
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            )}
                        </Fragment>
                    ))}
                </div>
            </div>
        </div>
    )
}
