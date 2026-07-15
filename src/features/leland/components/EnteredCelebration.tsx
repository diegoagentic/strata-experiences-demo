/**
 * COMPONENT: EnteredCelebration
 * PURPOSE: Step l1.8 canvas — the "ENTERED" success state. Big SO# reveal,
 *          chrono summary, status transitions timeline, ticket closure peek.
 *
 * USED BY: LelandStrataShell when currentStep.id === 'l1.8'
 */

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Bell, MailCheck, Activity, Clock } from 'lucide-react';
import StatusBadge from '../../../components/shared/StatusBadge';
import StepCompletionCta from './StepCompletionCta';
import { usePauseAware } from '../../../context/usePauseAware';
import { HERO_PO_HAPPY } from '../../../config/profiles/leland-data';

interface Transition {
    id: string;
    label: string;
    icon: React.ReactNode;
    detail: string;
}

const TRANSITIONS: Transition[] = [
    { id: 'logged',   label: 'Order Logged',          icon: <Activity className="h-3.5 w-3.5" />, detail: 'Internal trigger fired' },
    { id: 'notified', label: 'Notification Sent',     icon: <Bell className="h-3.5 w-3.5" />,     detail: 'Customer email + Slack #orders' },
    { id: 'closed',   label: 'Support ticket closed', icon: <MailCheck className="h-3.5 w-3.5" />,detail: 'Category = new order · status = closed' },
    { id: 'tracker',  label: 'Tracker Updated',       icon: <CheckCircle2 className="h-3.5 w-3.5" />, detail: 'Project status = Completed' },
];

const STAGGER_MS = 380;

export default function EnteredCelebration({ autoplay = true }: { autoplay?: boolean }) {
    const [phase, setPhase] = useState(autoplay ? 0 : TRANSITIONS.length);
    const { pauseAwareTimeout } = usePauseAware();

    useEffect(() => {
        if (!autoplay || phase >= TRANSITIONS.length) return;
        return pauseAwareTimeout(() => setPhase(p => p + 1), STAGGER_MS);
    }, [autoplay, phase, pauseAwareTimeout]);

    const stateOf = (i: number): 'pending' | 'running' | 'done' => {
        if (i < phase) return 'done';
        if (i === phase) return 'running';
        return 'pending';
    };
    const allDone = phase >= TRANSITIONS.length;

    return (
        <div className="space-y-4">
            {/* Hero ENTERED card */}
            <div className="rounded-2xl border-2 border-success/40 bg-gradient-to-br from-success/5 via-card to-brand-300/10 dark:from-success/10 dark:via-zinc-800 dark:to-brand-500/10 p-6 text-center">
                <div className="mx-auto size-14 rounded-2xl bg-success/15 text-success flex items-center justify-center mb-3">
                    <CheckCircle2 className="h-7 w-7" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-success mb-1">Order entered</div>
                <div className="text-3xl font-mono font-bold text-foreground tabular-nums">SO 2604102</div>
                <div className="mt-2 text-[12px] text-muted-foreground">
                    From PO <span className="font-mono text-foreground">{HERO_PO_HAPPY.poNumber}</span> · {HERO_PO_HAPPY.dealer}
                </div>

                {/* Chrono row */}
                <div className="mt-4 flex items-center justify-center gap-4 text-[12px]">
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">End to end</span>
                        <span className="font-mono font-bold text-foreground">A few minutes</span>
                    </div>
                    <span className="text-muted-foreground/50">·</span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Reviewer touch time</span>
                        <span className="font-mono font-bold text-foreground">Seconds</span>
                    </div>
                </div>
            </div>

            {/* Transitions timeline */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-foreground">Status transitions</div>
                        <div className="text-[10px] text-muted-foreground">
                            {allDone ? 'All systems updated' : `Cascading ${phase}/${TRANSITIONS.length}`}
                        </div>
                    </div>
                    <StatusBadge label={allDone ? 'Synchronized' : 'Cascading'} tone={allDone ? 'success' : 'ai'} size="sm" />
                </div>
                <div className="p-3">
                    <ol className="relative space-y-2 pl-4">
                        <div className="absolute left-[15px] top-3 bottom-3 w-px bg-border" />
                        {TRANSITIONS.map((t, i) => {
                            const state = stateOf(i);
                            return (
                                <li key={t.id} className="relative flex items-start gap-3">
                                    <div
                                        className={`
                                            shrink-0 size-6 rounded-full flex items-center justify-center text-[10px] -ml-4 z-10
                                            ${state === 'done' ? 'bg-success text-white border-2 border-success' : ''}
                                            ${state === 'running' ? 'bg-ai/20 text-ai border-2 border-ai animate-pulse' : ''}
                                            ${state === 'pending' ? 'bg-card border-2 border-border text-muted-foreground' : ''}
                                        `}
                                    >
                                        {state === 'done' && <CheckCircle2 className="h-3 w-3" strokeWidth={3} />}
                                        {state === 'running' && <Loader2 className="h-3 w-3 animate-spin" />}
                                    </div>
                                    <div className="min-w-0 flex-1 pb-1">
                                        <div className={`text-[12px] font-semibold ${state === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                                            <span className="inline-flex items-center gap-1.5">{t.icon} {t.label}</span>
                                        </div>
                                        <div className="text-[10.5px] text-muted-foreground mt-0.5">{t.detail}</div>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </div>

            <StepCompletionCta
                visible={allDone}
                label="See the impact"
                hint="Before / after metrics + 18-week roadmap"
            />
        </div>
    );
}
