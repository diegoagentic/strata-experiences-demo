import { clsx } from 'clsx'
import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={clsx(
                'bg-card-background border border-card-border rounded-[var(--card-border-radius)] shadow-[var(--card-shadow)]',
                'p-[var(--card-padding)]',
                className
            )}
            {...props}
        />
    )
}
