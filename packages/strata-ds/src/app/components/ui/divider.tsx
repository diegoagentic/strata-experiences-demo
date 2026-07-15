import * as React from "react"
import { cn } from "./utils"

export function Divider({ className, soft = false, ...props }: React.ComponentPropsWithoutRef<"hr"> & { soft?: boolean }) {
    return (
        <hr
            {...props}
            className={cn(
                "w-full border-t",
                soft ? "border-zinc-950/5 dark:border-white/5" : "border-zinc-950/10 dark:border-white/10",
                className
            )}
        />
    )
}
