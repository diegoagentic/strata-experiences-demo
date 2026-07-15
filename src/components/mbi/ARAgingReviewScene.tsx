/**
 * COMPONENT: ARAgingReviewScene
 * PURPOSE: Flow 1 · Scene 4 — first half of the AR cycle. Kathy moves from
 *          AP closure into AR by reviewing the live aging board: status
 *          taxonomy, totals, escalations, committed-to-pay. The drafts +
 *          send + close happen in the next scene (ARAgingWrapScene).
 *
 *          Apr 23 stakeholder ask (Matt): "keep AP, add AR". Originally AR
 *          was a single wrap-up scene. Splitting it gives AR parity with
 *          AP (3 scenes) and lets the audience see the analytics moment
 *          separately from the action moment.
 *
 * USED BY: MBIAccountingPage (wizard scene 3 · demo step m2.4)
 *
 * DS TOKENS: bg-card · success/info/destructive accents
 */

import { useState } from 'react'
import { ArrowRight, Mail, Sparkles, AlertTriangle, TrendingUp, PauseCircle, Clock } from 'lucide-react'
import ARStatusBoard from './ARStatusBoard'
import { MBI_AR_RECORDS } from '../../config/profiles/mbi-data'
import DataSourcesBar, { SOURCES } from './DataSourcesBar'

type ARFilter = 'all' | 'sent' | 'no-response' | 'escalated' | 'on-hold'

interface ARAgingReviewSceneProps {
    /** When provided, the "review collection emails" cue at the bottom
     *  becomes a real button that advances the wizard to the next scene. */
    onContinue?: () => void
}

export default function ARAgingReviewScene({ onContinue }: ARAgingReviewSceneProps = {}) {
    const [arFilter, setArFilter] = useState<ARFilter>('all')

    const filteredRecords = arFilter === 'all' ? MBI_AR_RECORDS
        : arFilter === 'sent' ? MBI_AR_RECORDS.filter(r => !r.collectionsHold && r.status !== 'escalated')
        : arFilter === 'no-response' ? MBI_AR_RECORDS.filter(r => r.status === 'no-response')
        : arFilter === 'escalated' ? MBI_AR_RECORDS.filter(r => r.status === 'escalated')
        : MBI_AR_RECORDS.filter(r => r.collectionsHold === true)

    const totalAR = MBI_AR_RECORDS.reduce((acc, r) => acc + r.amount, 0)
    const escalated = MBI_AR_RECORDS.filter(r => r.status === 'escalated').length
    const committed = MBI_AR_RECORDS
        .filter(r => r.status === 'committed-to-pay')
        .reduce((acc, r) => acc + r.amount, 0)
    const escalatedAmount = MBI_AR_RECORDS
        .filter(r => r.status === 'escalated')
        .reduce((acc, r) => acc + r.amount, 0)

    // The next scene (ARAgingWrapScene) renders 2 AI-drafted emails: one
    // for the first escalated account and one for the first no-response
    // account. Mark THOSE specific records on the board so the audience
    // sees the funnel narrowing — many open accounts here, the 2 with
    // drafts highlighted, and only those 2 surface for action next.
    const holdCount = MBI_AR_RECORDS.filter(r => r.collectionsHold).length
    const firstEscalated = MBI_AR_RECORDS.find(r => r.status === 'escalated')
    const firstNoResponse = MBI_AR_RECORDS.find(r => r.status === 'no-response')
    const draftReadyIds = [firstEscalated?.id, firstNoResponse?.id].filter(Boolean) as string[]

    return (
        <div className="space-y-4">
            {/* Strata AI insights — 3 quick signals before the full board */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-ai" />
                    <span className="text-[10px] font-bold text-ai uppercase tracking-wider">Strata AR signals · today</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <InsightChip
                        icon={<AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />}
                        text={`${escalated} accounts 30+ days past due — escalation recommended`}
                        tone="red"
                    />
                    <InsightChip
                        icon={<TrendingUp className="h-3 w-3 text-success" />}
                        text={`$${(committed / 1000).toFixed(0)}K committed to pay this week — cash flow on track`}
                        tone="green"
                    />
                    <InsightChip
                        icon={<Mail className="h-3 w-3 text-ai" />}
                        text="2 AI follow-up emails drafted · ready for your review next"
                        tone="ai"
                    />
                    <InsightChip
                        icon={<PauseCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />}
                        text={`${holdCount} invoices on collections hold · installation or punch list pending`}
                        tone="amber"
                    />
                </div>
            </div>

            {/* Aging stats — 4 buckets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryTile
                    label="Total AR open"
                    value={`$${(totalAR / 1000).toFixed(0)}K`}
                    sub={`${MBI_AR_RECORDS.length} accounts`}
                    accent="text-foreground"
                />
                <SummaryTile
                    label="Committed to pay"
                    value={`$${(committed / 1000).toFixed(0)}K`}
                    sub="will close this week"
                    accent="text-success"
                />
                <SummaryTile
                    label="Escalated"
                    value={`${escalated}`}
                    sub={`$${(escalatedAmount / 1000).toFixed(0)}K at risk`}
                    accent="text-red-600 dark:text-red-400"
                />
                <SummaryTile
                    label="Forecast"
                    value="live"
                    sub="vs bi-weekly Excel"
                    accent="text-ai"
                />
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap gap-2">
                {([
                    { key: 'all', label: 'All', count: MBI_AR_RECORDS.length, icon: null },
                    { key: 'sent', label: 'Emails sent', count: 8, icon: <Mail className="h-3 w-3" /> },
                    { key: 'no-response', label: 'No response', count: 2, icon: <Clock className="h-3 w-3" /> },
                    { key: 'escalated', label: 'Escalated', count: 2, icon: <AlertTriangle className="h-3 w-3" /> },
                    { key: 'on-hold', label: 'On hold', count: 2, icon: <PauseCircle className="h-3 w-3" /> },
                ] as { key: ARFilter; label: string; count: number; icon: React.ReactNode }[]).map(chip => (
                    <button
                        key={chip.key}
                        onClick={() => setArFilter(chip.key)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            arFilter === chip.key
                                ? 'bg-primary text-zinc-900 border-primary/50'
                                : 'bg-card dark:bg-zinc-800 border-border text-muted-foreground hover:text-foreground hover:border-zinc-300 dark:hover:border-zinc-600'
                        }`}
                    >
                        {chip.icon}
                        {chip.label}
                        <span className={`tabular-nums ${arFilter === chip.key ? 'opacity-70' : 'opacity-60'}`}>{chip.count}</span>
                    </button>
                ))}
            </div>

            {/* AR status board · highlights the records that have drafts queued next */}
            <ARStatusBoard records={filteredRecords} highlightedIds={draftReadyIds} />

            {/* Forward cue · now a real button so the funnel from list → action
                is one click instead of "next" copy without a control */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 text-xs bg-primary/5 dark:bg-primary/10 border border-primary/30 rounded-xl p-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <div className="font-bold text-foreground">
                            Next · review the {draftReadyIds.length} AI-drafted follow-up{draftReadyIds.length === 1 ? '' : 's'}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            Strata pre-drafted emails for the highlighted accounts above using each client's tone history. You review, edit if needed, send.
                        </div>
                    </div>
                </div>
                {onContinue && (
                    <button
                        onClick={onContinue}
                        className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Mail className="h-4 w-4" />
                        Review {draftReadyIds.length} draft{draftReadyIds.length === 1 ? '' : 's'}
                        <ArrowRight className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Data sources */}
            <DataSourcesBar groups={[
                { sources: [SOURCES.CORE_AR] },
                { sources: [SOURCES.STRATA_AI] },
                { sources: [SOURCES.STRATA_NLP] },
            ]} />
        </div>
    )
}

function InsightChip({ icon, text, tone }: { icon: React.ReactNode; text: string; tone: 'red' | 'green' | 'ai' | 'amber' }) {
    const cls = tone === 'red'
        ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
        : tone === 'green'
            ? 'bg-success/5 border-success/20'
            : tone === 'amber'
                ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
                : 'bg-ai/5 border-ai/20'
    return (
        <div className={`flex items-start gap-1.5 rounded-lg px-2.5 py-2 border text-[10px] text-foreground ${cls}`}>
            <span className="shrink-0 mt-0.5">{icon}</span>
            <span>{text}</span>
        </div>
    )
}

function SummaryTile({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-xl p-3">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
            <div className={`text-xl font-bold tabular-nums mt-0.5 ${accent}`}>{value}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{sub}</div>
        </div>
    )
}
