import * as React from "react"
import { cn } from "../../utils/cn"

export function Table({ className, striped, dense, ...props }: React.ComponentPropsWithoutRef<"table"> & { striped?: boolean; dense?: boolean }) {
    return (
        <div className="relative w-full overflow-x-auto">
            <table
                {...props}
                className={cn(
                    "w-full text-left text-sm",
                    striped && "[&_tbody_tr:nth-child(even)]:bg-zinc-950/[2.5%] dark:[&_tbody_tr:nth-child(even)]:bg-white/[2.5%]",
                    dense ? "[&_td]:py-2 [&_th]:py-2" : "[&_td]:py-4 [&_th]:py-4",
                    className
                )}
            />
        </div>
    )
}

export function TableHeader({ className, ...props }: React.ComponentPropsWithoutRef<"thead">) {
    return <thead {...props} className={cn("text-zinc-500 dark:text-zinc-400 border-b border-zinc-950/10 dark:border-white/10", className)} />
}

export function TableBody({ className, ...props }: React.ComponentPropsWithoutRef<"tbody">) {
    return <tbody {...props} className={cn(className)} />
}

export function TableRow({ className, ...props }: React.ComponentPropsWithoutRef<"tr">) {
    return (
        <tr
            {...props}
            className={cn(
                "border-b border-zinc-950/5 dark:border-white/5 last:border-none hover:bg-zinc-950/[2.5%] dark:hover:bg-white/[2.5%] transition-colors",
                className
            )}
        />
    )
}

export function TableHead({ className, ...props }: React.ComponentPropsWithoutRef<"th">) {
    return (
        <th
            {...props}
            className={cn(
                "px-4 font-medium text-zinc-500 dark:text-zinc-400",
                className
            )}
        />
    )
}

export function TableCell({ className, ...props }: React.ComponentPropsWithoutRef<"td">) {
    return (
        <td
            {...props}
            className={cn(
                "px-4 text-zinc-950 dark:text-white",
                className
            )}
        />
    )
}
