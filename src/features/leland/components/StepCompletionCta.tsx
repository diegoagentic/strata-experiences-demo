/**
 * COMPONENT: StepCompletionCta
 * PURPOSE: The organic-continuity primitive of the Leland demo. Every step's
 *          canvas ends with a contextual CTA that — clicked — advances the
 *          demo to the next step. The CTA's verb mirrors the next step's
 *          intent, so the demo flows like a person driving a real tool, not
 *          a slideshow needing a "Next" button.
 *
 *          The CTA only appears once the canvas signals completion (via the
 *          `visible` prop), so the user never sees it before the per-step
 *          process has finished its before → during → after arc.
 *
 * PROPS:
 *   - visible: boolean        — appears after the canvas's main animation
 *   - label: string           — contextual verb for the next step
 *   - onClick?: () => void    — defaults to useDemo().nextStep
 *   - intent?: 'primary'|'restart' — visual tone (default primary)
 *   - hint?: string           — optional one-liner above the button
 *
 * USED BY: every Leland canvas (PoExtractionPreview, QuoteSearchChain, …)
 */

import { ArrowRight, RefreshCw } from 'lucide-react';
import { useDemo } from '../../../context/DemoContext';

interface StepCompletionCtaProps {
    visible: boolean;
    label: string;
    onClick?: () => void;
    intent?: 'primary' | 'restart';
    hint?: string;
}

export default function StepCompletionCta({
    visible,
    label,
    onClick,
    intent = 'primary',
    hint,
}: StepCompletionCtaProps) {
    const { nextStep } = useDemo();
    if (!visible) return null;

    const baseClasses = 'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold transition-all shadow-sm';
    const intentClasses = intent === 'primary'
        ? 'bg-brand-300 dark:bg-brand-500 text-zinc-900 hover:bg-brand-400 dark:hover:bg-brand-600/80 hover:shadow-[0_8px_22px_-8px_rgba(198,228,51,0.7)]'
        : 'bg-card border border-border text-foreground hover:bg-muted';

    return (
        <div className="mt-1 flex items-center justify-end gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
            {hint && (
                <span className="text-[11.5px] text-muted-foreground italic">
                    {hint}
                </span>
            )}
            <button type="button" onClick={onClick ?? nextStep} className={`${baseClasses} ${intentClasses}`}>
                {intent === 'restart' && <RefreshCw className="h-3.5 w-3.5" />}
                <span>{label}</span>
                {intent === 'primary' && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
        </div>
    );
}
