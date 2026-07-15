/**
 * COMPONENT: RevealMetrics
 * PURPOSE: Step l2.1 canvas — the closing "before / after" reveal. Hero
 *          metrics with red strikethrough → green target, the $87.75 →
 *          $456,300/year projection card, and a 4-phase roadmap reveal.
 *
 * USED BY: LelandStrataShell when currentStep.id === 'l2.1'
 */

import { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp, ShieldCheck, Sparkles, Clock, Cpu, Zap } from 'lucide-react';
import StatusBadge from '../../../components/shared/StatusBadge';
import StepCompletionCta from './StepCompletionCta';
import { usePauseAware } from '../../../context/usePauseAware';
import { useDemo } from '../../../context/DemoContext';
import { HERO_VALIDATION } from '../../../config/profiles/leland-data';

interface Metric {
    icon: React.ReactNode;
    label: string;
    before: string;
    after: string;
}

const METRICS: Metric[] = [
    { icon: <Clock className="h-3.5 w-3.5" />,      label: 'Time per order',       before: 'Half an hour',         after: 'A few minutes' },
    { icon: <ShieldCheck className="h-3.5 w-3.5" />,label: "Reviewer's load",      before: 'Every order',          after: 'Only what matters' },
    { icon: <Cpu className="h-3.5 w-3.5" />,        label: 'How orders get built', before: 'By hand',              after: 'Automatically' },
    { icon: <Zap className="h-3.5 w-3.5" />,        label: 'Price checking',       before: 'Manual line check',    after: 'Automatic per line' },
];

interface Phase {
    id: number;
    label: string;
    weeks: string;
    detail: string;
    state: 'done' | 'next' | 'later';
}

const PHASES: Phase[] = [
    { id: 1, label: 'PO-to-Order Core + Textiles',   weeks: 'Weeks 1-5',   detail: 'What you saw today',                state: 'done' },
    { id: 2, label: 'API Integration · Price Engine', weeks: 'Weeks 5-10',  detail: 'Direct integration · contract registry', state: 'next' },
    { id: 3, label: 'Exception Automation',           weeks: 'Weeks 10-14', detail: 'Auto-approval · decision trees',    state: 'later' },
    { id: 4, label: 'Knowledge Graph · Predictive',   weeks: 'Weeks 14-18', detail: 'Living KB · ML pricing',            state: 'later' },
];

const STAGGER_MS = 250;

export default function RevealMetrics({ autoplay = true }: { autoplay?: boolean }) {
    const totalSteps = METRICS.length + 1 + PHASES.length; // +1 for hero card
    const [step, setStep] = useState(autoplay ? 0 : totalSteps);
    const { pauseAwareTimeout } = usePauseAware();
    const { goToStep } = useDemo();
    const allRevealed = step >= totalSteps;

    useEffect(() => {
        if (!autoplay || step >= totalSteps) return;
        return pauseAwareTimeout(() => setStep(s => s + 1), STAGGER_MS);
    }, [autoplay, step, totalSteps, pauseAwareTimeout]);

    const metricsRevealed = Math.min(step, METRICS.length);
    const showHero = step > METRICS.length;
    const phasesRevealed = Math.max(0, Math.min(step - METRICS.length - 1, PHASES.length));

    return (
        <div className="space-y-5">
            {/* Before / after metrics grid */}
            <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-3">
                    Before Strata · After Strata
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {METRICS.slice(0, metricsRevealed).map((m, i) => (
                        <div
                            key={m.label}
                            className="rounded-xl border border-border bg-card p-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {m.icon}
                                <span>{m.label}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-3">
                                <span className="text-sm text-danger line-through tabular-nums opacity-70">{m.before}</span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <span className="text-base font-bold text-success tabular-nums">{m.after}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hero $456K card */}
            {showHero && (
                <div className="rounded-2xl border-2 border-brand-400 dark:border-brand-500 bg-gradient-to-br from-brand-300/10 to-card dark:from-brand-500/10 dark:to-zinc-800 p-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="size-7 rounded-lg bg-brand-300 dark:bg-brand-500 text-zinc-900 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground">Hero validation · projection</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div>
                            <div className="text-[11px] text-muted-foreground">Per PO catch</div>
                            <div className="text-2xl font-mono font-bold text-foreground tabular-nums">${HERO_VALIDATION.lineImpactUsd.toFixed(2)}</div>
                            <div className="text-[10.5px] text-muted-foreground mt-1">line 1 mismatch caught today</div>
                        </div>
                        <div className="text-center">
                            <ArrowRight className="h-6 w-6 text-muted-foreground mx-auto" />
                            <div className="text-[10px] text-muted-foreground mt-1">at {HERO_VALIDATION.assumedWeeklyPoVolume} POs/week</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[11px] text-muted-foreground">Annual projection</div>
                            <div className="text-3xl font-mono font-bold text-success tabular-nums">
                                ${HERO_VALIDATION.annualProjectionUsd.toLocaleString()}
                            </div>
                            <div className="text-[10.5px] text-muted-foreground mt-1">recovered per year</div>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border text-[10.5px] italic text-muted-foreground">
                        {HERO_VALIDATION.disclaimer}
                    </div>
                </div>
            )}

            {/* Roadmap reveal */}
            {phasesRevealed > 0 && (
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-3 flex items-center gap-2">
                        <Sparkles className="h-3 w-3" />
                        18-week roadmap · what you saw today is Phase 1
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {PHASES.slice(0, phasesRevealed).map((p, i) => {
                            const toneClass =
                                p.state === 'done'  ? 'border-success/40 bg-success/5' :
                                p.state === 'next'  ? 'border-ai/40 bg-ai/5' :
                                                      'border-border bg-muted/20';
                            const badgeTone =
                                p.state === 'done'  ? 'success' :
                                p.state === 'next'  ? 'ai' :
                                                      'neutral';
                            const badgeLabel =
                                p.state === 'done'  ? 'Done · today' :
                                p.state === 'next'  ? 'Next' :
                                                      'Later';
                            return (
                                <div
                                    key={p.id}
                                    className={`rounded-xl border-2 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${toneClass}`}
                                    style={{ animationDelay: `${i * 80}ms` }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phase {p.id}</span>
                                        <StatusBadge label={badgeLabel} tone={badgeTone} size="xs" />
                                    </div>
                                    <div className="text-[13px] font-bold text-foreground leading-tight">{p.label}</div>
                                    <div className="text-[10.5px] text-muted-foreground mt-1">{p.weeks}</div>
                                    <div className="text-[11px] text-muted-foreground mt-2 leading-snug">{p.detail}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <StepCompletionCta
                visible={allRevealed}
                label="Restart the demo"
                intent="restart"
                onClick={() => goToStep(0)}
                hint="Run it again from the briefing"
            />
        </div>
    );
}
