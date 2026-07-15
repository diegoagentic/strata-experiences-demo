import { useState, useEffect } from 'react'
import { useDemo } from '../../context/DemoContext'
import { Sparkles, ShieldCheck, AlertTriangle, MessageSquare, User, Bot, ArrowRight } from 'lucide-react'
import { INTAKE_QUESTIONS, SURVEY_DELIVERY_PLATFORMS } from './shared/intakeData'

interface Props {
    /** Channel picked in clc3.1 · null = waiting for pick */
    channel: 'email' | 'platform' | null
    onOpenChannelDialog: () => void
}

/**
 * Flow 3 — Survey scene (clc3.1 and clc3.2).
 *
 * clc3.1 · channel picker is open (rendered by parent CLCPage)
 * clc3.2 · conversational survey plays through · all 10 answers stream in
 */
export default function CLCIntakeSurveyScene({ channel, onOpenChannelDialog }: Props) {
    const { currentStep } = useDemo()
    const stepId = currentStep?.id

    // Reveal questions one-by-one as a conversational stream when clc3.2 fires.
    const [revealedCount, setRevealedCount] = useState(0)
    useEffect(() => {
        if (stepId !== 'clc3.2') {
            // On other steps, fully revealed (so clc3.3 shows the complete record)
            setRevealedCount(INTAKE_QUESTIONS.length)
            return
        }
        setRevealedCount(0)
        const interval = setInterval(() => {
            setRevealedCount(prev => {
                if (prev >= INTAKE_QUESTIONS.length) {
                    clearInterval(interval)
                    return prev
                }
                return prev + 1
            })
        }, 700)
        return () => clearInterval(interval)
    }, [stepId])

    const platformMeta = channel === 'platform' ? SURVEY_DELIVERY_PLATFORMS.procore : channel === 'email' ? SURVEY_DELIVERY_PLATFORMS.email : null
    const isAwaitingChannel = !channel && stepId === 'clc3.1'

    return (
        <div className="p-5 max-w-5xl mx-auto space-y-4">
            {/* Top context bar */}
            <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-brand-300/40 dark:bg-brand-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-bold text-foreground">Project intake · Fairport Public Library</div>
                    <p className="text-xs text-muted-foreground">Award received · ready to send the 10-question site-conditions survey.</p>
                </div>
                <div className="ml-auto shrink-0">
                    {channel ? (
                        <ChannelBadge channel={channel} onChange={onOpenChannelDialog} />
                    ) : (
                        <button onClick={onOpenChannelDialog} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                            <ArrowRight className="h-3.5 w-3.5" />
                            Pick channel
                        </button>
                    )}
                </div>
            </div>

            {isAwaitingChannel && (
                <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">Waiting for channel selection</p>
                    <p className="text-xs text-muted-foreground mt-1">Strata recommends platform delivery to avoid the phishing-risk path.</p>
                </div>
            )}

            {!isAwaitingChannel && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
                    {/* Conversational survey thread */}
                    <div className="rounded-2xl border border-border bg-card overflow-hidden">
                        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-bold text-foreground">Customer responses</h3>
                            <span className="ml-auto text-xs text-muted-foreground">{Math.min(revealedCount, INTAKE_QUESTIONS.length)} of {INTAKE_QUESTIONS.length}</span>
                        </div>
                        <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto">
                            {INTAKE_QUESTIONS.slice(0, revealedCount).map((q, idx) => (
                                <div key={q.id} className="space-y-2">
                                    {/* AI question */}
                                    <div className="flex items-start gap-2">
                                        <div className="h-7 w-7 rounded-lg bg-brand-300/40 dark:bg-brand-500/20 flex items-center justify-center shrink-0">
                                            <Bot className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="rounded-lg bg-muted/40 p-2.5 inline-block max-w-full">
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Q{idx + 1}</div>
                                                <div className="text-sm font-semibold text-foreground">{q.label}</div>
                                                {q.helper && <div className="text-xs text-muted-foreground mt-0.5">{q.helper}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Customer answer */}
                                    <div className="flex items-start gap-2 justify-end">
                                        <div className="flex-1 min-w-0 flex justify-end">
                                            <div className="rounded-lg bg-blue-50 dark:bg-blue-500/15 p-2.5 inline-block max-w-[80%]">
                                                <div className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">{q.customerAnswer}</div>
                                            </div>
                                        </div>
                                        <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                                            <User className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {revealedCount < INTAKE_QUESTIONS.length && stepId === 'clc3.2' && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    Customer typing…
                                </div>
                            )}
                            {revealedCount >= INTAKE_QUESTIONS.length && (
                                <div className="rounded-lg border border-green-200 bg-green-50/60 dark:border-green-500/30 dark:bg-green-500/10 p-3 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-green-700 dark:text-green-300" />
                                    <span className="text-sm font-semibold text-foreground">All 10 answers received</span>
                                    <span className="text-xs text-muted-foreground ml-auto">Ready for reconciliation vs IQ</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right rail — delivery + progress */}
                    <aside className="space-y-3">
                        {platformMeta && (
                            <div className="rounded-2xl border border-border bg-card p-4">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Delivery</div>
                                <div className="text-sm font-bold text-foreground">{platformMeta.sourceLabel}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{platformMeta.recipient}</div>
                                <div className="mt-2 text-[11px] text-muted-foreground">
                                    Response rate · {platformMeta.responseRateLabel}
                                </div>
                                {channel === 'email' && (
                                    <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50/60 dark:border-yellow-500/30 dark:bg-yellow-500/10 p-2.5 flex items-start gap-2">
                                        <AlertTriangle className="h-3.5 w-3.5 text-yellow-700 dark:text-yellow-300 mt-0.5" />
                                        <div className="text-[11px] text-foreground leading-relaxed">
                                            Email delivery may trip spam filters · consider re-sending via Procore if no reply in 4h.
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="rounded-2xl border border-border bg-card p-4">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Question pack</div>
                            <ul className="space-y-1 text-xs">
                                {INTAKE_QUESTIONS.map((q, idx) => {
                                    const isAnswered = idx < revealedCount
                                    return (
                                        <li key={q.id} className={`flex items-center gap-1.5 ${isAnswered ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${isAnswered ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
                                            <span className="truncate">{q.label}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    )
}

// ─── Channel badge ───────────────────────────────────────────────────────────

function ChannelBadge({ channel, onChange }: { channel: 'email' | 'platform'; onChange: () => void }) {
    const isPlatform = channel === 'platform'
    return (
        <button
            onClick={onChange}
            title="Change channel"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                isPlatform
                    ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-300'
                    : 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-500/30 dark:bg-yellow-500/15 dark:text-yellow-300'
            }`}
        >
            {isPlatform ? <ShieldCheck className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
            {isPlatform ? 'Procore' : 'Email · phishing risk'}
        </button>
    )
}
