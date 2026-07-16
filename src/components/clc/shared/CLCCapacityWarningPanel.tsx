import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight, Sparkles, Mail, Send } from 'lucide-react'
import type { RegionCapacity } from './installScheduleData'
import { CAPACITY_BY_REGION, THIRD_PARTY_INSTALLER, WEEKS } from './installScheduleData'
import AIEmailComposer from '../../shared/AIEmailComposer'

interface Props {
    /** Step that triggered the panel · controls default-open behavior */
    stepId?: string
}

type ComposerMode = 'outreach' | 'dispatcher' | null

/** Outreach to the vetted third-party · Albany Install Co. */
const OUTREACH_DRAFT = {
    to: 'dispatch@install-partner.example · Pat Reilly',
    subject: 'Subcontract request · CLC NY install support · week of Jun 1',
    body: [
        'Hi Pat,',
        '',
        'Strata flagged 3 stacked NY library installs the week of Jun 1 (Jamestown · Fairport · Brockport · all anchor jobs). In-house crew is at 100% Mon-Thu.',
        '',
        'Looking at your availability window, would Albany Install Co. be able to take Fairport (Tue Jun 2 / Wed Jun 3 · 4-crew · 5 IQ jobs queued)? Standard CLC rate card applies · same terms as the 7 prior jobs we ran together.',
        '',
        'Please confirm by Thu end-of-day so we can lock the schedule.',
        '',
        'Thanks,',
        'Account Manager Kai · Account Manager',
        'Creative Library Concepts',
    ].join('\n'),
}

/** Internal escalation to the NY regional dispatcher. */
const DISPATCHER_DRAFT = {
    to: 'Marcus Reed · NY Regional Dispatcher · mreed@clc.example.com',
    subject: 'NY capacity escalation · week of Jun 1 · Albany Install Co recommended',
    body: [
        'Hi Marcus,',
        '',
        'Strata flagged an NY capacity conflict for the week of Jun 1 · 3 anchor installs back-to-back (Jamestown / Fairport / Brockport) and in-house crew at 100%.',
        '',
        'Recommendation: subcontract Fairport (Tue/Wed Jun 2-3) to Albany Install Co. They have 7 prior jobs with us and COI is on file. Outreach draft is queued · ready for your sign-off before we send.',
        '',
        'Can you confirm the subcontract path or surface an alternative crew?',
        '',
        'Thanks,',
        'Account Manager Kai · Account Manager',
    ].join('\n'),
}

/**
 * Adapter of the CapacityHeatmap accordion pattern (Officeworks) for CLC.
 * 3 region accordions (NY/NJ/PA) instead of 3 manager regions.
 * Default-expands NY when clc1.4 fires (the capacity warning step).
 */
export default function CLCCapacityWarningPanel({ stepId }: Props) {
    const [expandedRegion, setExpandedRegion] = useState<string | null>(
        stepId === 'clc1.4' ? 'ny' : null
    )
    const [composerMode, setComposerMode] = useState<ComposerMode>(null)

    const handleSendEmail = (kind: 'outreach' | 'dispatcher') => (subject: string, _body: string) => {
        // Demo · we don't actually send. Fire a success toast event and
        // close the composer. CLCToastStack picks this up.
        const customer = kind === 'outreach'
            ? 'Albany Install Co.'
            : 'Marcus Reed · NY Dispatcher'
        window.dispatchEvent(new CustomEvent('clc:job-published', {
            detail: { jobId: `email-${kind}`, customer: `${customer} · ${subject}` },
        }))
        setComposerMode(null)
        // Signal "Flow 1 capacity issue handled" · CLCCalendarScene listens
        // for this and bridges to clc2.1 (SharePoint seeding) after a beat.
        // Either send (outreach or dispatcher) counts as resolved.
        window.dispatchEvent(new CustomEvent('clc:flow1-handled', { detail: { kind } }))
    }

    const activeDraft = composerMode === 'outreach'
        ? OUTREACH_DRAFT
        : composerMode === 'dispatcher'
            ? DISPATCHER_DRAFT
            : null

    const statusBadge = (status: RegionCapacity['status']) => {
        switch (status) {
            case 'red':   return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30'
            case 'amber': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-300 dark:border-yellow-500/30'
            case 'green': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/30'
        }
    }
    const statusLabel = (status: RegionCapacity['status']) => {
        switch (status) {
            case 'red':   return 'Over capacity'
            case 'amber': return 'Tight'
            case 'green': return 'Healthy'
        }
    }

    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold text-foreground">Capacity by region</h3>
                    <span className="text-[11px] text-muted-foreground ml-auto">In-house crews · weekly load</span>
                </div>
            </div>

            <div className="divide-y divide-border">
                {CAPACITY_BY_REGION.map(region => {
                    const isOpen = expandedRegion === region.region
                    const isOver = region.status === 'red'
                    return (
                        <div key={region.region}>
                            <button
                                onClick={() => setExpandedRegion(isOpen ? null : region.region)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
                            >
                                {isOpen
                                    ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                                    : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                                <span className="text-sm font-bold text-foreground w-32 shrink-0">{region.label}</span>
                                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${statusBadge(region.status)}`}>
                                    {statusLabel(region.status)}
                                </span>
                                <span className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                                    <span><span className="font-bold text-foreground">{region.inHouseCrews}</span> crew{region.inHouseCrews !== 1 ? 's' : ''}</span>
                                    <span><span className="font-bold text-foreground">{region.activeJobs}</span> active</span>
                                </span>
                            </button>

                            {isOpen && (
                                <div className="px-3 pb-4 pt-1 space-y-3 border-t border-border bg-muted/10">
                                    {/* Weekly load mini-bars */}
                                    <div className="pt-3">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Weekly load · 6 weeks ahead</div>
                                        <div className="grid grid-cols-6 gap-1.5">
                                            {WEEKS.map(week => {
                                                const load = region.weeklyLoad[week.monday] ?? 0
                                                const isOverLoad = load > region.inHouseCrews
                                                return (
                                                    <div key={week.monday} className="text-center">
                                                        <div className="h-12 flex items-end mb-1">
                                                            <div
                                                                className={`w-full rounded-t ${
                                                                    isOverLoad ? 'bg-red-500' :
                                                                    load === region.inHouseCrews ? 'bg-yellow-500' :
                                                                    load > 0 ? 'bg-green-500/70' :
                                                                    'bg-muted'
                                                                }`}
                                                                style={{ height: `${Math.min(100, (load / Math.max(region.inHouseCrews + 2, 3)) * 100)}%` }}
                                                            />
                                                        </div>
                                                        <div className="text-[9px] text-muted-foreground">{week.label}</div>
                                                        <div className={`text-[10px] font-bold ${isOverLoad ? 'text-red-700 dark:text-red-300' : 'text-foreground'}`}>{load}/{region.inHouseCrews}</div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Third-party suggestion (only on red regions) */}
                                    {isOver && (
                                        <div className="rounded-lg border border-red-200 bg-red-50/40 dark:border-red-500/30 dark:bg-red-500/10 p-3">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <Sparkles className="h-3.5 w-3.5 text-zinc-800 dark:text-zinc-200" />
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Strata AI suggests</span>
                                            </div>
                                            <div className="text-sm font-semibold text-foreground">
                                                {THIRD_PARTY_INSTALLER.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {THIRD_PARTY_INSTALLER.distance} · {THIRD_PARTY_INSTALLER.history}
                                            </div>
                                            <div className="text-xs text-foreground mt-1.5 leading-snug">
                                                {THIRD_PARTY_INSTALLER.note}
                                            </div>
                                            <div className="mt-3 flex items-center gap-2">
                                                <button
                                                    onClick={() => setComposerMode('outreach')}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                                    title="Strata never auto-sends · operator reviews the draft and confirms"
                                                >
                                                    <Mail className="h-3.5 w-3.5" />
                                                    Open outreach draft
                                                </button>
                                                <button
                                                    onClick={() => setComposerMode('dispatcher')}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-foreground border border-border rounded-md hover:bg-muted transition-colors"
                                                >
                                                    <Mail className="h-3.5 w-3.5" />
                                                    Contact dispatcher
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Shared AI email composer · same one used in MBI's AR collection
                flow. Two contexts (outreach to third-party / internal escalation)
                share the editor shell · only the seed draft differs. */}
            <AIEmailComposer
                isOpen={activeDraft !== null}
                onClose={() => setComposerMode(null)}
                title={composerMode === 'outreach' ? 'Outreach · Albany Install Co.' : 'Contact NY dispatcher'}
                subtitle={composerMode === 'outreach'
                    ? 'Strata-drafted subcontract request · operator reviews and sends'
                    : 'Internal escalation · operator confirms the subcontract path'}
                icon={<Mail className="h-4 w-4" />}
                to={activeDraft?.to ?? ''}
                initialSubject={activeDraft?.subject ?? ''}
                initialBody={activeDraft?.body ?? ''}
                badge={composerMode === 'outreach'
                    ? { label: 'Vetted 3rd-party outreach', tone: 'ai', icon: <Sparkles className="h-3 w-3" /> }
                    : { label: 'Internal escalation', tone: 'warning', icon: <AlertTriangle className="h-3 w-3" /> }}
                actionLabel={composerMode === 'outreach' ? 'Send to Albany' : 'Send to dispatcher'}
                actionIcon={<Send className="h-3.5 w-3.5" />}
                onAction={composerMode === 'outreach' ? handleSendEmail('outreach') : handleSendEmail('dispatcher')}
            />
        </div>
    )
}
