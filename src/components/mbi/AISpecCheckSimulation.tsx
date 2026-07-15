/**
 * COMPONENT: AISpecCheckSimulation
 * PURPOSE: Step 2.3 (Quotes AI · AI validation) used to jump straight to
 *          the audit-loop diagram + the finished Spec Check report. The
 *          audience didn't see Strata actually working — and never saw the
 *          model pause to ask the PM the kind of judgment call a human
 *          would catch in a 5-second hallway conversation.
 *
 *          This component shows that work in three visible phases:
 *            1. Processing — 5 spec-check steps animate (dimensions, finish,
 *               palette, availability, non-catalog cross-check).
 *            2. Questions — 2 real ambiguities surface · the PM picks
 *               an answer per question · each is rationalized against
 *               history so the audience reads it as informed assistance.
 *            3. Finalizing — quick re-pass applying the answers · then
 *               handoff via onComplete to render the audit-loop +
 *               SpecCheckReport scene with the decisions reflected.
 *
 *          The decisions returned via onComplete are real — the parent
 *          scene shows them as applied so the demo earns the trust
 *          moment instead of just animating one.
 *
 * USED BY: QuoteValidationScene (Flow 2 · Scene 3 · m3.3)
 *
 * DS TOKENS: bg-card · ai/5 bg · ai accents · primary CTA on confirm
 */

import { useEffect, useState } from 'react'
import {
    Sparkles, Loader2, CheckCircle2, HelpCircle, ArrowRight, Wand2, MessageCircle, Search, RotateCcw,
} from 'lucide-react'
import { StatusBadge } from '../shared'

export interface SpecCheckDecisions {
    /** How to handle the 6 chairs with finish that's close-but-not-exact to palette. */
    finishAmbiguity: 'accept-as-compatible' | 'flag-for-designer'
    /** How to handle the custom walnut conference table with unconfirmed lead time. */
    nonCatalogLeadTime: 'use-estimate' | 'hold-for-confirmation'
}

export const DEFAULT_DECISIONS: SpecCheckDecisions = {
    finishAmbiguity: 'flag-for-designer',
    nonCatalogLeadTime: 'use-estimate',
}

type Phase = 'processing' | 'questions' | 'finalizing'

interface Step {
    label: string
    detail: string
    durationMs: number
}

const PROCESSING_STEPS: Step[] = [
    { label: 'Loading BOM', detail: '143 items · ENT-HQ-F12 · Enterprise Holdings HQ Floor 12', durationMs: 600 },
    { label: 'Scanning for duplicate line items', detail: '143 lines checked · 0 duplicates found', durationMs: 700 },
    { label: 'Checking non-catalog pricing vs price books', detail: '9 non-catalog items · 8 confirmed · 1 price mismatch flagged', durationMs: 700 },
    { label: 'Validating quantity consistency (SIF vs quote)', detail: 'All quantities consistent across SIF and quote', durationMs: 700 },
    { label: 'Checking SKU completeness', detail: '141 complete · 2 items need your call', durationMs: 700 },
    { label: 'BOM validation complete', detail: '1 flagged item ready for PC review · vendor quote needed', durationMs: 500 },
]

const FINALIZING_STEPS: Step[] = [
    { label: 'Applying your guidance', detail: 'Updating findings list with your decisions', durationMs: 600 },
    { label: 'Re-scoring severity per item', detail: '2 items adjusted', durationMs: 600 },
    { label: 'BOM validation report ready', detail: '1 AI pass complete · 1 human review remaining', durationMs: 500 },
]

interface AISpecCheckSimulationProps {
    onComplete: (decisions: SpecCheckDecisions) => void
    onDecisionChange?: (decisions: SpecCheckDecisions) => void
}

export default function AISpecCheckSimulation({ onComplete, onDecisionChange }: AISpecCheckSimulationProps) {
    const [phase, setPhase] = useState<Phase>('questions')
    const [stepIdx, setStepIdx] = useState(0)
    const [decisions, setDecisions] = useState<SpecCheckDecisions>(DEFAULT_DECISIONS)

    const updateDecisions = (d: SpecCheckDecisions) => {
        setDecisions(d)
        onDecisionChange?.(d)
    }

    useEffect(() => {
        if (phase !== 'processing' && phase !== 'finalizing') return
        const steps = phase === 'processing' ? PROCESSING_STEPS : FINALIZING_STEPS
        if (stepIdx >= steps.length) {
            if (phase === 'processing') {
                const t = setTimeout(() => { setPhase('questions'); setStepIdx(0) }, 350)
                return () => clearTimeout(t)
            }
            const t = setTimeout(() => onComplete(decisions), 450)
            return () => clearTimeout(t)
        }
        const t = setTimeout(() => setStepIdx(i => i + 1), steps[stepIdx].durationMs)
        return () => clearTimeout(t)
    }, [phase, stepIdx, decisions, onComplete])

    if (phase === 'questions') {
        return (
            <QuestionsView
                decisions={decisions}
                onChange={updateDecisions}
                onConfirm={() => { setPhase('finalizing'); setStepIdx(0) }}
            />
        )
    }

    const steps = phase === 'processing' ? PROCESSING_STEPS : FINALIZING_STEPS
    const headerLabel = phase === 'processing' ? 'Strata is validating the quote BOM…' : 'Applying your guidance…'

    return (
        <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-ai/15 text-ai flex items-center justify-center">
                    <Search className="h-4 w-4" />
                </div>
                <div className="flex-1">
                    <div className="text-sm font-bold text-foreground">{headerLabel}</div>
                    <div className="text-[10px] text-muted-foreground">
                        {phase === 'processing'
                            ? 'Duplicates · non-catalog pricing · qty match · SKU completeness · pauses for human calls'
                            : 'Re-running the affected checks · this is fast'}
                    </div>
                </div>
                <StatusBadge label={phase === 'processing' ? 'Processing' : 'Finalizing'} tone="ai" size="xs" />
            </div>

            <ol className="space-y-1.5">
                {steps.map((step, i) => {
                    const done = i < stepIdx
                    const active = i === stepIdx
                    return (
                        <li key={step.label} className={`flex items-start gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                            active ? 'bg-ai/10 dark:bg-ai/15' : ''
                        }`}>
                            <div className="mt-0.5 shrink-0">
                                {done ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                ) : active ? (
                                    <Loader2 className="h-3.5 w-3.5 text-ai animate-spin" />
                                ) : (
                                    <div className="h-3.5 w-3.5 rounded-full border border-border" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className={`text-xs ${done || active ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{step.label}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">{step.detail}</div>
                            </div>
                        </li>
                    )
                })}
            </ol>

            <div className="h-1 bg-background dark:bg-zinc-900 rounded-full overflow-hidden">
                <div
                    className="h-full bg-ai transition-all duration-500"
                    style={{ width: `${(Math.min(stepIdx, steps.length) / steps.length) * 100}%` }}
                />
            </div>
        </div>
    )
}

// ─── QuestionsView · the human-in-the-loop pause ────────────────────────────
function QuestionsView({
    decisions,
    onChange,
    onConfirm,
}: {
    decisions: SpecCheckDecisions
    onChange: (d: SpecCheckDecisions) => void
    onConfirm: () => void
}) {
    return (
        <div className="bg-ai/5 dark:bg-ai/10 border-2 border-ai/40 rounded-2xl p-4 space-y-4">
            <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-ai/15 text-ai flex items-center justify-center shrink-0 mt-0.5">
                    <HelpCircle className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge label="Needs your call" tone="ai" size="xs" icon={<Wand2 className="h-2.5 w-2.5" />} />
                        <span className="text-[10px] text-muted-foreground">2 questions before the report finalizes</span>
                    </div>
                    <div className="text-sm font-bold text-foreground mt-1">
                        Two judgment calls Strata won't make on its own
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        These are the kinds of calls a PC makes based on context the model can't fully see — vendor history, client preferences, install timeline. Pick once · Strata applies it across the report.
                    </div>
                </div>
            </div>

            {/* Q1 · Finish ambiguity */}
            <QuestionCard
                index={1}
                context="Item 12 of 143 · Pacific Fabrics Aspire lounge chair · qty 6 · finish 'Charcoal Heather'"
                question={`"This chair finish is visually within the project palette but differs from the other chairs in the BOM."`}
                rationale='History: Enterprise Holdings has accepted "close enough" finishes 7 of last 9 times — but their last project rejected one. Risk is real but small.'
                options={[
                    { value: 'accept', label: 'Accept as compatible', detail: 'Faster · matches recent pattern (7 of 9)', selected: decisions.finishAmbiguity === 'accept-as-compatible' },
                    { value: 'flag', label: 'Flag for designer sign-off', detail: 'Safer · 1-day delay · zero risk of rejection', selected: decisions.finishAmbiguity === 'flag-for-designer' },
                ]}
                onSelect={(v) => onChange({ ...decisions, finishAmbiguity: v === 'accept' ? 'accept-as-compatible' : 'flag-for-designer' })}
            />

            {/* Q2 · Non-catalog lead time */}
            <QuestionCard
                index={2}
                context="Item 41 of 143 · Custom 84&quot; walnut conference table · Pinnacle · non-catalog"
                question={`"Vendor confirmed pricing but their AP rep is on PTO and lead time isn't locked in. Past 3 similar custom tables shipped in 8 weeks ± 1. Use the 8-week estimate so we can send the proposal today, or hold the proposal until vendor confirms?"`}
                rationale='Install date is 14 weeks out. 8-week estimate has 6-week buffer · low risk. Holding the proposal would slip 2-3 days waiting for vendor.'
                options={[
                    { value: 'estimate', label: 'Use the 8-week estimate', detail: '6-week buffer · proposal goes today', selected: decisions.nonCatalogLeadTime === 'use-estimate' },
                    { value: 'hold', label: 'Hold for vendor confirmation', detail: 'Locked-in date · 2-3 day delay', selected: decisions.nonCatalogLeadTime === 'hold-for-confirmation' },
                ]}
                onSelect={(v) => onChange({ ...decisions, nonCatalogLeadTime: v === 'estimate' ? 'use-estimate' : 'hold-for-confirmation' })}
            />

            {/* Confirm */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-ai/20">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <MessageCircle className="h-3 w-3" />
                    Each answer is logged · Strata learns the pattern for next time
                </div>
                <button
                    onClick={onConfirm}
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                >
                    Continue with these decisions
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}

function QuestionCard({
    index,
    context,
    question,
    rationale,
    options,
    onSelect,
}: {
    index: number
    context: string
    question: string
    rationale: string
    options: { value: string; label: string; detail: string; selected: boolean }[]
    onSelect: (value: string) => void
}) {
    return (
        <div className="bg-card dark:bg-zinc-900 border border-border rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-ai/15 text-ai text-[10px] font-bold flex items-center justify-center">{index}</span>
                <span className="text-[10px] text-muted-foreground font-mono truncate" dangerouslySetInnerHTML={{ __html: context }} />
            </div>
            <p className="text-xs text-foreground leading-relaxed italic">{question}</p>
            <p className="text-[10px] text-muted-foreground leading-snug">— {rationale}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {options.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => onSelect(opt.value)}
                        className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                            opt.selected
                                ? 'bg-ai/15 border-ai/60 text-foreground'
                                : 'bg-background dark:bg-zinc-800 border-border hover:border-ai/40 hover:bg-ai/5'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className={`h-3 w-3 rounded-full border-2 shrink-0 ${
                                opt.selected ? 'border-ai bg-ai/40' : 'border-muted-foreground/40'
                            }`} />
                            <span className="text-xs font-bold text-foreground">{opt.label}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 leading-snug pl-5">{opt.detail}</div>
                    </button>
                ))}
            </div>
        </div>
    )
}

// ─── Decisions recap badge · rendered by parent after onComplete ────────────
// Helper exported for parents to render a small "applied decisions" recap
// next to the spec check report. Keeps the trust moment visible after the
// simulation hands off the scene.
export function SpecCheckDecisionsApplied({
    decisions,
    onRerun,
}: {
    decisions: SpecCheckDecisions
    onRerun?: () => void
}) {
    return (
        <div className="bg-success/5 dark:bg-success/10 border border-success/30 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                <span className="text-[10px] font-bold text-success uppercase tracking-wider flex-1">Your guidance applied</span>
                {onRerun && (
                    <button
                        onClick={onRerun}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider"
                        title="Re-run the Spec Check simulation"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Re-run
                    </button>
                )}
            </div>
            <ul className="text-[11px] text-foreground space-y-1">
                <li className="flex items-start gap-1.5">
                    <Sparkles className="h-3 w-3 text-ai shrink-0 mt-0.5" />
                    <span>
                        <strong>Finish ambiguity (Pacific Fabrics Aspire chairs):</strong>{' '}
                        {decisions.finishAmbiguity === 'accept-as-compatible'
                            ? 'accepted as compatible swap · no designer sign-off needed'
                            : 'flagged for designer sign-off · 1-day delay added to schedule'}
                    </span>
                </li>
                <li className="flex items-start gap-1.5">
                    <Sparkles className="h-3 w-3 text-ai shrink-0 mt-0.5" />
                    <span>
                        <strong>Custom walnut table lead time:</strong>{' '}
                        {decisions.nonCatalogLeadTime === 'use-estimate'
                            ? 'using 8-week estimate · proposal goes today'
                            : 'holding proposal until vendor confirms · 2-3 day delay'}
                    </span>
                </li>
            </ul>
        </div>
    )
}
