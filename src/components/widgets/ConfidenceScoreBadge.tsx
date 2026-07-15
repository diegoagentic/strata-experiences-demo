import { clsx } from 'clsx';

interface ConfidenceScoreBadgeProps {
    score: number;
    label?: string;
    size?: 'sm' | 'md';
}

export default function ConfidenceScoreBadge({ score, label, size = 'sm' }: ConfidenceScoreBadgeProps) {
    const color = score >= 90
        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
        : score >= 70
            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';

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
