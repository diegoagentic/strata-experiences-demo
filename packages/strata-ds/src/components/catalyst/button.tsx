import { Button as HeadlessButton, type ButtonProps as HeadlessButtonProps } from '@headlessui/react'
import { clsx } from 'clsx'
import React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'brand-glow'

export interface ButtonProps extends HeadlessButtonProps {
    variant?: ButtonVariant
    className?: string
}

const variants: Record<ButtonVariant, string> = {
    primary: 'bg-button-primary-background hover:bg-button-primary-background-hover text-button-primary-text data-[disabled]:bg-button-primary-background-disabled data-[disabled]:text-button-primary-text-disabled',
    secondary: 'bg-button-secondary-background hover:bg-button-secondary-background-hover text-button-secondary-text border border-button-secondary-border',
    outline: 'bg-button-outline-background hover:bg-button-outline-background-hover text-button-outline-text border border-button-outline-border hover:border-button-outline-border-hover',
    ghost: 'bg-button-ghost-background hover:bg-button-ghost-background-hover text-button-ghost-text',
    destructive: 'bg-button-destructive-background hover:bg-button-destructive-background-hover text-button-destructive-text',
    // brand-glow · primary CTA con la lime-shadow que Leland (StepCompletionCta,
    // JoshuaReviewCard ActionButton) usaba inline con rgba(198,228,51,…). Kept
    // as a Tailwind arbitrary shadow so no new token is needed.
    'brand-glow': 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_8px_22px_-8px_rgba(198,228,51,0.7)]',
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
    return (
        <HeadlessButton
            className={clsx(
                // Base styles
                'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                'disabled:cursor-not-allowed disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
                variants[variant],
                className
            )}
            {...props}
        />
    )
}
