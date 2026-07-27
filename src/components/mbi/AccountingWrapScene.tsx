/**
 * COMPONENT: AccountingWrapScene
 * PURPOSE: Step 3 wrap for the Accounting AI wizard. Instances FlowHandoff
 *          with recap tiles + downstream timeline + narrative bridging to
 *          Collections AI. Adds a scene-local "Start over" affordance.
 *
 * PROPS:
 *   - onContinueToCollections: switches the parent tab to 'collections'
 *     and resets collStep to 0. Fired from the FlowHandoff primary CTA
 *     via the F39 onOverride bypass (works in and out of tour).
 *   - onRestart: resets acctStep to 0 so the user can replay the flow.
 *
 * USED BY: MBIAccountingPage · Accounting tab · step index 2.
 *
 * Introduced in F39 · 2026-07-27. The 3 sibling MBI projects
 * (strata-experiences-demo · demo-2026-strata · inbound-outbound) never
 * modeled flow completion for Accounting AI · this component fills the
 * gap without cross-repo imports.
 */

import FlowHandoff from './FlowHandoff'
import {
    Clock, ShieldCheck, CheckCircle2, Receipt, Mail,
    MailOpen, TrendingUp, RotateCcw,
} from 'lucide-react'

interface Props {
    onContinueToCollections: () => void
    onRestart: () => void
}

export default function AccountingWrapScene({
    onContinueToCollections,
    onRestart,
}: Props) {
    return (
        <div className="space-y-4">
            <FlowHandoff
                eyebrow="Flow 1 · Accounting AI complete"
                recapHeading="Kathy's morning queue is clean"
                recapSubheading="12 bills processed · 2 exceptions resolved · vouchers posted to CORE"
                recapStats={[
                    { icon: <Clock className="h-4 w-4" />,        value: '18 min', sub: 'vs 4 h before',       accent: 'text-success' },
                    { icon: <CheckCircle2 className="h-4 w-4" />, value: '12',     sub: 'bills posted' },
                    { icon: <ShieldCheck className="h-4 w-4" />,  value: '2',      sub: 'variances logged',    accent: 'text-warning' },
                    { icon: <TrendingUp className="h-4 w-4" />,   value: '96 %',   sub: 'auto-post rate',      accent: 'text-success' },
                ]}
                timeline={[
                    { status: 'done',   icon: <Receipt className="h-3.5 w-3.5" />,    label: 'Bills posted',      caption: 'just now',                flow: 'Flow 1 · Accounting AI' },
                    { status: 'next',   icon: <Mail className="h-3.5 w-3.5" />,       label: 'AR aging live',     caption: 'ready for follow-ups',    flow: 'Flow 2 · Collections AI', highlight: true },
                    { status: 'future', icon: <MailOpen className="h-3.5 w-3.5" />,   label: 'Collection emails', caption: 'drafts routed by status', flow: 'Flow 2 · Collections AI' },
                    { status: 'future', icon: <TrendingUp className="h-3.5 w-3.5" />, label: 'Forecast updated',  caption: 'live for leadership',     flow: '—' },
                ]}
                narrative={{
                    eyebrow: 'Next up',
                    icon: <MailOpen className="h-5 w-5" />,
                    title: '$240K AR is open and aging. Kathy shifts from posting to collecting.',
                    body: (
                        <>
                            Strata routes accounts by status · drafts follow-ups in the client's tone · protects on-hold accounts. <strong className="text-foreground">Same Kathy · same session · different queue.</strong>
                        </>
                    ),
                }}
                primaryCTA={{
                    label: 'Continue to Collections AI',
                    icon: <MailOpen className="h-4 w-4" />,
                    // F39 · onOverride bypasses the isDemoActive gate in FlowHandoff
                    // so the CTA works in and out of tour. Tab switch is local to
                    // MBIAccountingPage · no goToStep involved.
                    onOverride: onContinueToCollections,
                }}
                secondaryCTAs={[]}
            />

            {/* Start over · scene-local affordance · siempre visible */}
            <div className="flex items-center justify-between gap-3 bg-muted/40 border border-border rounded-2xl px-4 py-3">
                <div className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Want to see the flow again?</strong> Reset to the morning queue.
                </div>
                <button
                    onClick={onRestart}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-card border border-border text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Start over
                </button>
            </div>
        </div>
    )
}
