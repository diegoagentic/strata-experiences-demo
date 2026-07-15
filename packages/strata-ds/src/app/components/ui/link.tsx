import * as React from "react"
import { cn } from "./utils"

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children?: React.ReactNode
}

export function Link({ className, ...props }: LinkProps) {
    return (
        <a
            {...props}
            className={cn(
                "text-zinc-950 underline decoration-zinc-950/20 underline-offset-4 hover:decoration-zinc-950/50 dark:text-white dark:decoration-white/20 dark:hover:decoration-white/50",
                className
            )}
        />
    )
}
