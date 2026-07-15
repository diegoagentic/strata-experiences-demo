/**
 * COMPONENT: StatusBadge
 * PURPOSE: Shared status pill that replaces dozens of inline
 *          `text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5
 *          rounded-md bg-{tone}/15 text-{tone}` instances across MBI and
 *          the rest of UI-Dealer. Semantic tones backed by the DS tokens
 *          registered in variables.css.
 *
 * USAGE:
 *   <StatusBadge label="Critical" tone="danger" icon={<AlertCircle />} />
 *   <StatusBadge label="Phase 1 Pilot" tone="ai" size="xs" />
 *   <StatusBadge label="HealthTrust" tone="warning" />
 *
 * PROPS:
 *   - label: string
 *   - tone?: 'success' | 'warning' | 'danger' | 'info' | 'ai' | 'neutral' | 'primary'
 *   - icon?: ReactNode              — optional inline icon
 *   - size?: 'xs' | 'sm' | 'md'     — xs is the tightest (8px text)
 *   - uppercase?: boolean           — default true (tracking-wider applied)
 */

import type { ReactNode } from 'react'

export type StatusTone =
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'ai'
    | 'neutral'
    | 'primary'

interface StatusBadgeProps {
    label: string
    tone?: StatusTone
    icon?: ReactNode
    size?: 'xs' | 'sm' | 'md'
    uppercase?: boolean
    className?: string
}

const TONE_MAP: Record<StatusTone, string> = {
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
    danger:  'bg-danger/15 text-danger',
    info:    'bg-info/15 text-info',
    ai:      'bg-ai/15 text-ai',
    neutral: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/15 text-zinc-900 dark:text-primary',
}

const SIZE_MAP = {
    xs: { text: 'text-[9px]', pad: 'px-1.5 py-0.5', icon: 'h-2.5 w-2.5' },
    sm: { text: 'text-[10px]', pad: 'px-1.5 py-0.5', icon: 'h-3 w-3' },
    md: { text: 'text-[11px]', pad: 'px-2 py-0.5', icon: 'h-3 w-3' },
}

export default function StatusBadge({
    label,
    tone = 'neutral',
    icon,
    size = 'sm',
    uppercase = true,
    className = '',
}: StatusBadgeProps) {
    const sizeCfg = SIZE_MAP[size]
    return (
        <span
            className={`
                inline-flex items-center gap-1 font-bold rounded-md shrink-0
                ${sizeCfg.text} ${sizeCfg.pad} ${TONE_MAP[tone]}
                ${uppercase ? 'uppercase tracking-wider' : ''}
                ${className}
            `}
        >
            {icon && <span className="inline-flex items-center shrink-0">{icon}</span>}
            {label}
        </span>
    )
}
