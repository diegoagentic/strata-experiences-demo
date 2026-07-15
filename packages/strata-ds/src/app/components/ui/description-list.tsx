import * as React from "react"
import { cn } from "./utils"

export function DescriptionList({ className, ...props }: React.ComponentPropsWithoutRef<"dl">) {
    return (
        <dl
            {...props}
            className={cn("grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3", className)}
        />
    )
}

export function DescriptionTerm({ className, ...props }: React.ComponentPropsWithoutRef<"dt">) {
    return (
        <dt
            {...props}
            className={cn("col-start-1 border-t border-zinc-950/5 pt-4 text-sm/6 font-medium text-zinc-500 sm:border-none sm:pt-0 dark:border-white/5 dark:text-zinc-400", className)}
        />
    )
}

export function DescriptionDetails({ className, ...props }: React.ComponentPropsWithoutRef<"dd">) {
    return (
        <dd
            {...props}
            className={cn("pb-4 pt-1 text-sm/6 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-4 dark:text-white dark:sm:border-white/5", className)}
        />
    )
}
