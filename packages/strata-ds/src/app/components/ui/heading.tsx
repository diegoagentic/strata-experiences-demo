import * as React from "react"
import { cn } from "./utils"

type HeadingProps = { level?: 1 | 2 | 3 | 4 | 5 | 6 } & React.ComponentPropsWithoutRef<
    "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
>

export function Heading({ level = 1, className, ...props }: HeadingProps) {
    const Element: `h${typeof level}` = `h${level}`

    return (
        <Element
            {...props}
            className={cn(
                "text-zinc-950 dark:text-white",
                level === 1 && "text-2xl/8 font-semibold sm:text-xl/8",
                level === 2 && "text-base/7 font-semibold sm:text-sm/6",
                level === 3 && "text-base/7 font-semibold sm:text-sm/6",
                className
            )}
        />
    )
}

export function Subheading({ level = 2, className, ...props }: HeadingProps) {
    const Element: `h${typeof level}` = `h${level}`

    return (
        <Element
            {...props}
            className={cn(
                "text-base/7 font-semibold text-zinc-950 sm:text-sm/6 dark:text-white",
                className
            )}
        />
    )
}
