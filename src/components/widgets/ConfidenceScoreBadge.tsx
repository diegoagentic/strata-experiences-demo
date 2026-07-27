import { clsx } from 'clsx';

interface ConfidenceScoreBadgeProps {
    score: number;
    label?: string;
    size?: 'sm' | 'md';
}

export default function ConfidenceScoreBadge({ score, label, size = 'sm' }: ConfidenceScoreBadgeProps) {
    const color = score >= 90
        ? 'bg-success/10 text-success border-success/30 dark:bg-success/15 dark:text-success dark:border-success/40'
        : score >= 70
            ? 'bg-warning/10 text-warning border-warning/30 dark:bg-warning/15 dark:text-warning dark:border-warning/40'
            : 'bg-destructive/10 text-destructive border-destructive/30 dark:bg-destructive/15 dark:text-destructive dark:border-destructive/40';

    return (
        <span className={clsx(
            'inline-flex items-center gap-1 rounded-full border font-bold',
            size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs',
            color
        )}>
            {label && <span className="font-medium">{label}:</span>}
            {score}%
        </span>
    );
}
