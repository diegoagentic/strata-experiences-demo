import { useEffect, useState, useRef } from 'react';
import { Loader2, MousePointerClick, Sparkles, CheckCircle2 } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { useDemoProfile } from '../../context/useDemoProfile';

// ─── Component ────────────────────────────────────────────────────────────────

export default function DemoAIIndicator() {
    const { currentStep, isDemoActive, isPaused } = useDemo();
    const { activeProfile } = useDemoProfile();
    const [elapsed, setElapsed] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);
    const [visible, setVisible] = useState(false);
    const [completed, setCompleted] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
    const messageIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
    const isPausedRef = useRef(isPaused);

    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

    const behavior = activeProfile.stepBehavior[currentStep.id];
    const messages = activeProfile.stepMessages[currentStep.id] || [];

    // ── Visibility with entrance delay ──
    useEffect(() => {
        if (!isDemoActive) { setVisible(false); return; }
        setElapsed(0);
        setMessageIndex(0);
        setCompleted(false);
        setVisible(false);
        const t = setTimeout(() => setVisible(true), 500);
        return () => { clearTimeout(t); setVisible(false); };
    }, [isDemoActive, currentStep.id]);

    // ── Progress timer for auto steps ──
    useEffect(() => {
        if (!isDemoActive || !behavior || behavior.mode !== 'auto' || !behavior.duration) return;
        setElapsed(0);
        setCompleted(false);

        intervalRef.current = setInterval(() => {
            if (!isPausedRef.current) {
                setElapsed(prev => {
                    const next = Math.min(prev + 0.1, behavior.duration!);
                    if (next >= behavior.duration!) setCompleted(true);
                    return next;
                });
            }
        }, 100);

        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isDemoActive, currentStep.id, behavior]);

    // ── Rotate messages ──
    useEffect(() => {
        if (!isDemoActive || messages.length <= 1) return;
        setMessageIndex(0);

        const interval = behavior?.duration
            ? Math.max((behavior.duration * 1000) / messages.length, 2500)
            : 4000;

        messageIntervalRef.current = setInterval(() => {
            if (!isPausedRef.current) {
                setMessageIndex(prev => Math.min(prev + 1, messages.length - 1));
            }
        }, interval);

        return () => { if (messageIntervalRef.current) clearInterval(messageIntervalRef.current); };
    }, [isDemoActive, currentStep.id, messages.length, behavior]);

    // ── Guard: don't render when inactive, hidden, or panel is handling it ──
    if (!isDemoActive || !behavior || !visible || activeProfile.selfIndicatedSteps.includes(currentStep.id)) return null;

    const isAuto = behavior.mode === 'auto';
    const progress = isAuto && behavior.duration ? (elapsed / behavior.duration) * 100 : 0;
    const currentMessage = messages[messageIndex] || (isAuto ? behavior.aiSummary : behavior.userAction) || '';

    // ── Accent colors by mode ──
    const accent = isAuto
        ? {
            bg: 'bg-indigo-500/[0.05] dark:bg-indigo-500/[0.08]',
            border: completed ? 'border-green-500/25 dark:border-green-400/25' : 'border-indigo-500/20 dark:border-indigo-400/20',
            iconBox: completed ? 'bg-green-500/10 dark:bg-green-400/15' : 'bg-indigo-500/10 dark:bg-indigo-400/15',
            iconColor: completed ? 'text-green-500 dark:text-green-400' : 'text-indigo-500 dark:text-indigo-400',
            label: completed ? 'text-green-600 dark:text-green-400' : 'text-indigo-600 dark:text-indigo-400',
            badgeBg: completed ? 'bg-green-500/10' : 'bg-indigo-500/10',
            badgeText: completed ? 'text-green-600 dark:text-green-400' : 'text-indigo-600 dark:text-indigo-400',
            badgeDot: completed ? 'bg-green-500' : 'bg-indigo-500 animate-pulse',
            barBg: 'bg-indigo-500/10',
            barFill: completed
                ? 'bg-gradient-to-r from-green-500/70 to-emerald-500/70'
                : 'bg-gradient-to-r from-indigo-500/60 to-purple-500/60',
        }
        : {
            bg: 'bg-amber-500/[0.05] dark:bg-amber-500/[0.08]',
            border: 'border-amber-500/20 dark:border-amber-400/20',
            iconBox: 'bg-amber-500/10 dark:bg-amber-400/15',
            iconColor: 'text-amber-500 dark:text-amber-400',
            label: 'text-amber-600 dark:text-amber-400',
            badgeBg: 'bg-amber-500/10',
            badgeText: 'text-amber-600 dark:text-amber-400',
            badgeDot: 'bg-amber-500',
            barBg: '',
            barFill: '',
        };

    return (
        <div className="sticky top-[72px] z-40 px-4 sm:px-6 pt-2 pb-1 mt-4">
            <div className={`relative overflow-hidden rounded-xl backdrop-blur-sm border transition-all duration-500 ${accent.bg} ${accent.border}`}>

                {/* ── Main Row ── */}
                <div className="flex items-center gap-3 px-4 py-2">

                    {/* Icon container */}
                    <div className="relative shrink-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-500 ${accent.iconBox}`}>
                            {isAuto ? (
                                completed
                                    ? <CheckCircle2 size={16} className={accent.iconColor} />
                                    : <Sparkles size={16} className={accent.iconColor} />
                            ) : (
                                <MousePointerClick size={16} className={accent.iconColor} />
                            )}
                        </div>
                        {isAuto && !completed && (
                            <Loader2 size={10} className={`absolute -bottom-0.5 -right-0.5 animate-spin ${accent.iconColor}`} />
                        )}
                    </div>

                    {/* Label + rotating message */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-500 ${accent.label}`}>
                                {isAuto ? (completed ? 'Complete' : 'Strata AI') : 'Action Required'}
                            </span>
                            {isAuto && behavior.duration && (
                                <span className="text-[10px] text-muted-foreground dark:text-muted-foreground tabular-nums font-medium">
                                    {completed ? '100%' : `${Math.round(progress)}%`}
                                </span>
                            )}
                        </div>
                        <p key={messageIndex} className="text-[11px] text-muted-foreground dark:text-zinc-300 truncate animate-in fade-in slide-in-from-bottom-1 duration-300">
                            {currentMessage}
                        </p>
                    </div>

                    {/* Mode badge */}
                    <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${accent.badgeBg} ${accent.badgeText}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${accent.badgeDot}`} />
                        {isAuto ? (completed ? 'DONE' : 'AUTO') : 'CLICK'}
                    </div>
                </div>

                {/* ── Progress bar (auto steps only) ── */}
                {isAuto && behavior.duration && (
                    <div className={`h-[2px] w-full ${accent.barBg}`}>
                        <div
                            className={`h-full transition-all ease-linear ${accent.barFill}`}
                            style={{
                                width: `${Math.min(progress, 100)}%`,
                                transitionDuration: completed ? '500ms' : '100ms',
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
