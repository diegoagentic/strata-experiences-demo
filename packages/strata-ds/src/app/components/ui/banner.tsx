import * as React from "react"
import { cn } from "./utils"
import { XMarkIcon } from "@heroicons/react/20/solid"

export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'info' | 'success' | 'warning' | 'error'
    dismissible?: boolean
    onDismiss?: () => void
}

export function Banner({
    variant = 'info',
    dismissible,
    onDismiss,
    className,
    children,
    ...props
}: BannerProps) {
    const [isVisible, setIsVisible] = React.useState(true)

    if (!isVisible) return null

    const handleDismiss = () => {
        setIsVisible(false)
        onDismiss?.()
    }

    const variants = {
        info: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
        success: "bg-zinc-100 text-zinc-900 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800",
        warning: "bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900/50",
        error: "bg-red-50 text-red-900 border border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-900/50"
    }

    return (
        <div
            className={cn(
                "relative flex items-center gap-x-6 px-6 py-2.5 sm:px-3.5 sm:before:flex-1",
                variants[variant],
                className
            )}
            {...props}
        >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="text-sm/6">
                    {children}
                </div>
            </div>
            <div className="flex flex-1 justify-end">
                {dismissible && (
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
                    >
                        <span className="sr-only">Dismiss</span>
                        <XMarkIcon className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity" aria-hidden="true" />
                    </button>
                )}
            </div>
        </div>
    )
}
