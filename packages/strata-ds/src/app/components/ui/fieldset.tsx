import * as React from "react"
import { cn } from "./utils"

export interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
    children?: React.ReactNode
}

export function Fieldset({ className, children, ...props }: FieldsetProps) {
    return (
        <fieldset
            {...props}
            className={cn("space-y-6", className)}
        >
            {children}
        </fieldset>
    )
}

export interface LegendProps extends React.HTMLAttributes<HTMLLegendElement> {
    children?: React.ReactNode
}

export function Legend({ className, children, ...props }: LegendProps) {
    return (
        <legend
            {...props}
            className={cn(
                "text-base font-semibold text-zinc-900 dark:text-zinc-100",
                className
            )}
        >
            {children}
        </legend>
    )
}

export interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode
}

export function FieldGroup({ className, children, ...props }: FieldGroupProps) {
    return (
        <div
            {...props}
            className={cn("space-y-8", className)}
        >
            {children}
        </div>
    )
}

export interface FieldHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode
}

export function FieldHeader({ className, children, ...props }: FieldHeaderProps) {
    return (
        <div
            {...props}
            className={cn("space-y-1 mb-6", className)}
        >
            {children}
        </div>
    )
}
