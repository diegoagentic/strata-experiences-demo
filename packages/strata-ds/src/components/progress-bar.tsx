import * as React from 'react';
import { cn } from '../utils/cn';

/**
 * ProgressBar — thin horizontal progress atom with semantic tone.
 *
 * Used for OCR / extraction progress, upload state, background jobs.
 * Replaces inline instances like Leland `PoExtractionPreview.tsx:104-109`
 * ("PO PDF parser · 12 fields detected · 100%").
 *
 * When `indeterminate` is true, an animated pulse is rendered instead of
 * a value fill.
 */

export type ProgressTone = 'brand' | 'success' | 'warning' | 'ai' | 'info' | 'danger';
export type ProgressHeight = 'xs' | 'sm' | 'md';

export interface ProgressBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    /** 0–100 · clamped. Ignored when `indeterminate`. */
    value?: number;
    tone?: ProgressTone;
    height?: ProgressHeight;
    /** Renders an animated pulse fill regardless of value. */
    indeterminate?: boolean;
    /** Accessible label for the progress bar. */
    'aria-label'?: string;
}

const TONE: Record<ProgressTone, string> = {
    brand:   'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    ai:      'bg-ai',
    info:    'bg-info',
    danger:  'bg-destructive',
};

const HEIGHT: Record<ProgressHeight, string> = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
};

export function ProgressBar({
    value = 0,
    tone = 'brand',
    height = 'sm',
    indeterminate = false,
    className,
    'aria-label': ariaLabel = 'Progress',
    ...rest
}: ProgressBarProps) {
    const pct = Math.max(0, Math.min(100, value));
    return (
        <div
            role="progressbar"
            aria-label={ariaLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={indeterminate ? undefined : pct}
            className={cn('w-full bg-muted rounded-full overflow-hidden', HEIGHT[height], className)}
            {...rest}
        >
            <div
                className={cn(
                    'h-full transition-[width] duration-500 ease-out rounded-full',
                    TONE[tone],
                    indeterminate && 'animate-pulse w-full',
                )}
                style={indeterminate ? undefined : { width: `${pct}%` }}
            />
        </div>
    );
}
