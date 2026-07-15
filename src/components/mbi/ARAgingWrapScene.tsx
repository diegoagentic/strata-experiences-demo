/**
 * COMPONENT: ARAgingWrapScene
 * PURPOSE: Flow 1 · Scene 5 — second half of the AR cycle. Drafts, send,
 *          close the morning. The aging board + analytics moved to
 *          ARAgingReviewScene (scene 4) so the audience reads the analytics
 *          moment and the action moment as two distinct beats — gives AR
 *          parity with the 3 AP scenes (Fase H, Apr 23 Matt's "add the AR
 *          flow").
 *
 *          Two zones on this scene:
 *            1. AI email drafts panel (review · edit · send each)
 *            2. Close morning CTA → FlowHandoff (recap + handoff to Quotes AI)
 *
 * USED BY: MBIAccountingPage (wizard scene 4 · demo step m2.5)
 *
 * DS TOKENS: bg-card · brand-300 CTA in handoff
 */

import { useState } from 'react'
import { Mail, CheckCircle2, PauseCircle } from 'lucide-react'
import AIEmailDraftsPanel from './AIEmailDraftsPanel'
import { MBI_AR_RECORDS } from '../../config/profiles/mbi-data'
import DataSourcesBar, { SOURCES } from './DataSourcesBar'

export default function ARAgingWrapScene() {
    const [morningClosed, setMorningClosed] = useState(false)

    const heldAccounts = MBI_AR_RECORDS.filter(r => r.collectionsHold)

    return (
        <div className="space-y-4">
            {/* Auto-sent summary strip */}
            <div className="bg-success/5 border border-success/20 rounded-xl px-3 py-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <div className="text-xs flex-1">
                    <span className="font-bold text-foreground">6 standard follow-ups auto-sent today</span>
                    <span className="text-muted-foreground"> · per payment terms · </span>
                    <span className="font-semibold text-amber-700 dark:text-amber-400">2 held back by Strata</span>
                </div>
            </div>

            {/* Collections hold context */}
            <div className="bg-amber-50/60 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-xl overflow-hidden">
                <div className="px-3 py-2 border-b border-amber-200 dark:border-amber-500/20 flex items-center gap-2">
                    <PauseCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                        {heldAccounts.length} accounts excluded from auto-collections
                    </span>
                </div>
                <div className="divide-y divide-amber-200/60 dark:divide-amber-500/20">
                    {heldAccounts.map(r => (
                        <div key={r.id} className="px-3 py-2 flex items-center gap-2.5 text-[11px]">
                            <div className="flex-1 min-w-0">
                                <span className="font-semibold text-foreground">{r.client}</span>
                                <span className="text-muted-foreground ml-1.5">
                                    {r.holdReason === 'installation-pending'
                                        ? `· Installation pending ${r.installationDate ? new Date(r.installationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}`
                                        : `· ${r.punchListOpen} punch list items open`}
                                </span>
                            </div>
                            <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                {r.holdReason === 'installation-pending' ? 'Install pending' : 'Punch list'}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="px-3 py-2 bg-amber-50/40 dark:bg-amber-500/5 text-[10px] text-amber-700/80 dark:text-amber-400/80">
                    Strata holds these from collections until the project is complete.
                </div>
            </div>

            {/* Drafts intro — escalation cases only */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">2 escalation cases need your review</div>
                    <div className="text-muted-foreground mt-0.5">
                        Strata drafted each follow-up in the client's tone history. These are the accounts where auto-send wasn't enough — review, edit if needed, send.
                    </div>
                </div>
            </div>

            {/* AI email drafts */}
            <AIEmailDraftsPanel />

            {/* Data sources */}
            <DataSourcesBar groups={[
                { sources: [SOURCES.CORE_AR] },
                { sources: [SOURCES.STRATA_NLP] },
                { sources: [SOURCES.OUTLOOK] },
            ]} />

            {/* Close morning CTA · gates FlowHandoff */}
            {!morningClosed ? (
                <div className="bg-card dark:bg-zinc-800 border border-primary/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground">Ready to wrap up the queue?</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            Vouchers posted · reconciliations logged · collection emails sent · forecast refreshed. Everything's in leadership's live dashboard.
                        </div>
                    </div>
                    <button
                        onClick={() => setMorningClosed(true)}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Close queue
                    </button>
                </div>
            ) : (
                <div className="border border-success/30 bg-success/5 dark:bg-success/10 rounded-2xl p-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-foreground">Queue closed · Collections AI complete</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            Vouchers posted · reconciliations cleared · 3 collection emails out · forecast updated.
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
