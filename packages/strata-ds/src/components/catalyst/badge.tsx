import { clsx } from 'clsx'
import React from 'react'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'outline'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
    default: 'bg-badge-default-background text-badge-default-text',
    success: 'bg-badge-success-background text-badge-success-text border border-badge-success-border',
    warning: 'bg-badge-warning-background text-badge-warning-text border border-badge-warning-border',
    error: 'bg-badge-error-background text-badge-error-text border border-badge-error-border',
    outline: 'bg-badge-outline-background text-badge-outline-text border border-badge-outline-border'
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
    return (
        <span
            className={clsx(
                'inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ring-transparent',
                variants[variant],
                className
            )}
            {...props}
        />
    )
}
