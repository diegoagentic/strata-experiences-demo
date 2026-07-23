import * as React from 'react';
import { cn } from '../utils/cn';

/**
 * HeroMetric — hero stat card with uppercase eyebrow, large tabular
 * value, optional icon + sub-caption, and a tone-tinted envelope
 * (`border-${tone}/30 bg-${tone}/5 text-${tone}`).
 *
 * ─── Relation to the canonical DS ─────────────────────────────────────
 * The canonical Strata DS (`Strata Design System/src/components/
 * application-ui/kpi-card.tsx`) ships `KPICard`, which follows a
 * *different* philosophy: neutral card surface + coloured icon pill,
 * `value: number` (formatted via Intl), densities compact/default/
 * comfortable/summary, trends/subMetrics/detailRows/primaryAction.
 *
 * `HeroMetric` is the tinted hero variant that Leland/BFI/OPS canvases
 * use (accepts `value: React.ReactNode` for strings like "Half an hour",
 * "18d"). It complements KPICard, not replaces it. Candidate to promote
 * as a variant/mode of `KPICard` in the canonical DS.
 */

export type HeroMetricTone = 'brand' | 'success' | 'warning' | 'ai' | 'info' | 'danger' | 'neutral';
export type HeroMetricSize = 'sm' | 'md' | 'lg';

export interface HeroMetricProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    /** Uppercase eyebrow label (ex: "Orders waiting for action"). */
    label: string;
    /** Big value ("Half an hour", "$142,300", "18d"). */
    value: React.ReactNode;
    /** Optional sub-caption below the value. */
    sub?: React.ReactNode;
    /** Optional Lucide icon rendered as a pill in the top-right. */
    icon?: React.ReactNode;
    /** Semantic tone driving border/fill/text color. */
    tone?: HeroMetricTone;
    /** Visual density. */
    size?: HeroMetricSize;
}

// LAW 2 · brand (lime) NEVER as text on light bg · the value uses
// text-foreground so it stays legible; brand identity comes from the
// border + fill + icon pill only. Other tones keep their tinted text
// because they're already high-contrast (dark green/amber/blue/red/
// purple over a very light tinted background).
const TONE: Record<HeroMetricTone, { border: string; fill: string; text: string; iconBg: string; iconFg: string }> = {
    brand:   { border: 'border-primary/30',    fill: 'bg-primary/5',    text: 'text-foreground', iconBg: 'bg-primary/10',    iconFg: 'text-primary' },
    success: { border: 'border-success/30',    fill: 'bg-success/5',    text: 'text-success',    iconBg: 'bg-success/10',    iconFg: 'text-success' },
    warning: { border: 'border-warning/30',    fill: 'bg-warning/5',    text: 'text-warning',    iconBg: 'bg-warning/10',    iconFg: 'text-warning' },
    ai:      { border: 'border-ai/30',         fill: 'bg-ai/5',         text: 'text-ai',         iconBg: 'bg-ai/10',         iconFg: 'text-ai' },
    info:    { border: 'border-info/30',       fill: 'bg-info/5',       text: 'text-info',       iconBg: 'bg-info/10',       iconFg: 'text-info' },
    danger:  { border: 'border-destructive/30',fill: 'bg-destructive/5',text: 'text-destructive',iconBg: 'bg-destructive/10', iconFg: 'text-destructive' },
    neutral: { border: 'border-border',        fill: 'bg-card',         text: 'text-foreground', iconBg: 'bg-muted',          iconFg: 'text-muted-foreground' },
};

const SIZE: Record<HeroMetricSize, { padding: string; label: string; value: string; sub: string; iconBox: string; iconEl: string }> = {
    sm: { padding: 'p-3',   label: 'text-[10px]', value: 'text-xl',     sub: 'text-[11px]', iconBox: 'size-7',  iconEl: 'size-3.5' },
    md: { padding: 'p-4',   label: 'text-[11px]', value: 'text-2xl',    sub: 'text-xs',     iconBox: 'size-8',  iconEl: 'size-4' },
    lg: { padding: 'p-5',   label: 'text-xs',     value: 'text-3xl',    sub: 'text-sm',     iconBox: 'size-9',  iconEl: 'size-4.5' },
};

export function HeroMetric({
    label,
    value,
    sub,
    icon,
    tone = 'neutral',
    size = 'md',
    className,
    ...rest
}: HeroMetricProps) {
    const t = TONE[tone];
    const s = SIZE[size];
    return (
        <div
            className={cn(
                'rounded-2xl border flex flex-col gap-2',
                t.border,
                t.fill,
                s.padding,
                className,
            )}
            {...rest}
        >
            <div className="flex items-start justify-between gap-2">
                <p className={cn('font-bold uppercase tracking-wider text-muted-foreground leading-none', s.label)}>
                    {label}
                </p>
                {icon && (
                    <div className={cn('rounded-lg flex items-center justify-center shrink-0', s.iconBox, t.iconBg, t.iconFg)}>
                        <span className={cn('flex items-center justify-center', s.iconEl)}>{icon}</span>
                    </div>
                )}
            </div>
            <p className={cn('font-bold tabular-nums leading-tight', s.value, t.text)}>
                {value}
            </p>
            {sub && (
                <p className={cn('text-muted-foreground leading-snug', s.sub)}>
                    {sub}
                </p>
            )}
        </div>
    );
}
