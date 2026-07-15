import * as React from 'react';
import { cn } from '../utils/cn';

/**
 * Callout — tinted alert / banner used across demo canvases for status
 * messages, AI recommendations, action-required prompts. Two visual
 * strengths: `soft` (default · light tint) and `strong` (solid tone,
 * higher contrast used for critical prompts).
 *
 * Extracted from the 9+ inline instances in Leland canvases (BriefingCanvas
 * "ACTION REQUIRED", PoExtractionPreview success completion, JoshuaReviewCard
 * "Recommendation", CommentsRebateCanvas rebate warning, etc.) plus mirror
 * patterns in BFI / MBI / Officeworks banners.
 *
 * ─── Relation to the canonical DS ─────────────────────────────────────
 * The canonical Strata DS has three overlapping surfaces (`InfoBanner`,
 * `Alert`, `Banner`) but none exposes {eyebrow + title + body + icon +
 * actions + tone-`ai` + variant-`strong`} together. Candidate to promote
 * to `Strata Design System/src/components/application-ui/callout.tsx` and
 * deprecate the overlap — see plan file for rollout notes.
 */

export type CalloutTone = 'brand' | 'success' | 'warning' | 'ai' | 'info' | 'danger';
export type CalloutVariant = 'soft' | 'strong';

export interface CalloutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    tone?: CalloutTone;
    variant?: CalloutVariant;
    /** Uppercase eyebrow label (ex: "ACTION REQUIRED"). */
    eyebrow?: React.ReactNode;
    /** Prominent title (ex: "Every order goes through the Reviewer"). */
    title?: React.ReactNode;
    /** Body copy · either title or body must be provided. */
    body?: React.ReactNode;
    /** Optional Lucide icon rendered top-left. */
    icon?: React.ReactNode;
    /** Optional right-aligned actions (ex: single Button). */
    actions?: React.ReactNode;
}

const TONE_SOFT: Record<CalloutTone, string> = {
    brand:   'border-primary/25 bg-primary/5 text-foreground',
    success: 'border-success/25 bg-success/5 text-foreground',
    warning: 'border-warning/25 bg-warning/5 text-foreground',
    ai:      'border-ai/25 bg-ai/5 text-foreground',
    info:    'border-info/25 bg-info/5 text-foreground',
    danger:  'border-destructive/25 bg-destructive/5 text-foreground',
};

const TONE_STRONG: Record<CalloutTone, string> = {
    brand:   'border-primary bg-primary/15 text-foreground',
    success: 'border-success bg-success/15 text-foreground',
    warning: 'border-warning bg-warning/15 text-foreground',
    ai:      'border-ai bg-ai/15 text-foreground',
    info:    'border-info bg-info/15 text-foreground',
    danger:  'border-destructive bg-destructive/15 text-foreground',
};

const ACCENT_FG: Record<CalloutTone, string> = {
    brand:   'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    ai:      'text-ai',
    info:    'text-info',
    danger:  'text-destructive',
};

const ACCENT_BG: Record<CalloutTone, string> = {
    brand:   'bg-primary/10',
    success: 'bg-success/10',
    warning: 'bg-warning/10',
    ai:      'bg-ai/10',
    info:    'bg-info/10',
    danger:  'bg-destructive/10',
};

export function Callout({
    tone = 'info',
    variant = 'soft',
    eyebrow,
    title,
    body,
    icon,
    actions,
    className,
    ...rest
}: CalloutProps) {
    const surface = variant === 'strong' ? TONE_STRONG[tone] : TONE_SOFT[tone];
    return (
        <div
            role="status"
            className={cn(
                'rounded-xl border px-3 py-2.5 flex items-start gap-3',
                surface,
                className,
            )}
            {...rest}
        >
            {icon && (
                <div className={cn('size-7 rounded-lg flex items-center justify-center shrink-0', ACCENT_BG[tone], ACCENT_FG[tone])}>
                    {icon}
                </div>
            )}
            <div className="flex-1 min-w-0 space-y-1">
                {eyebrow && (
                    <p className={cn('text-[10px] font-bold uppercase tracking-wider', ACCENT_FG[tone])}>
                        {eyebrow}
                    </p>
                )}
                {title && (
                    <p className="text-sm font-semibold text-foreground leading-snug">
                        {title}
                    </p>
                )}
                {body && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {body}
                    </p>
                )}
            </div>
            {actions && (
                <div className="shrink-0 flex items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}
