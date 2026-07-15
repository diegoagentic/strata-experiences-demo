import * as React from "react"
import { cn } from "./utils"
import { Label } from "./label"

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode
}

export function Field({ className, children, ...props }: FieldProps) {
    return (
        <div className={cn("flex flex-col gap-2", className)} {...props}>
            {children}
        </div>
    )
}

export interface FieldLabelProps extends React.ComponentProps<typeof Label> {
    optional?: boolean
}

export function FieldLabel({ className, optional, children, ...props }: FieldLabelProps) {
    return (
        <Label className={cn("flex w-full items-center justify-between", className)} {...props}>
            <span>{children}</span>
            {optional && <span className="text-zinc-500 font-normal">Optional</span>}
        </Label>
    )
}

export interface FieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> { }

export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
    return (
        <p
            className={cn("text-[0.8rem] text-zinc-500 dark:text-zinc-400", className)}
            {...props}
        />
    )
}

export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> { }

export function FieldError({ className, ...props }: FieldErrorProps) {
    return (
        <p
            className={cn("text-[0.8rem] font-medium text-red-500 dark:text-red-400", className)}
            {...props}
        />
    )
}
