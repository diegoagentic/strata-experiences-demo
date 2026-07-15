import * as React from "react"
import { cn } from "./utils"
import { CheckIcon } from "lucide-react"

export interface TrackingStep {
    id: string
    name: string
    description?: string
    status: 'complete' | 'current' | 'upcoming'
    date?: string
}

export interface OrderTrackingProps extends React.HTMLAttributes<HTMLDivElement> {
    steps: TrackingStep[]
}

export function OrderTracking({ steps, className, ...props }: OrderTrackingProps) {
    return (
        <div className={cn("flow-root", className)} {...props}>
            <ul role="list" className="-mb-8">
                {steps.map((step, stepIdx) => (
                    <li key={step.id}>
                        <div className="relative pb-8">
                            {stepIdx !== steps.length - 1 ? (
                                <span
                                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-zinc-200 dark:bg-zinc-800"
                                    aria-hidden="true"
                                />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    {step.status === 'complete' ? (
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 ring-8 ring-white dark:bg-zinc-100 dark:ring-zinc-900">
                                            <CheckIcon className="h-5 w-5 text-white dark:text-zinc-900" aria-hidden="true" />
                                        </span>
                                    ) : step.status === 'current' ? (
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-900 bg-white ring-8 ring-white dark:border-zinc-100 dark:bg-zinc-950 dark:ring-zinc-900">
                                            <span className="h-2.5 w-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                                        </span>
                                    ) : (
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-200 bg-white ring-8 ring-white dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-900">
                                            <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                                        </span>
                                    )}
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                            {step.name} {step.description && <span className="font-normal text-zinc-500 dark:text-zinc-400">— {step.description}</span>}
                                        </p>
                                    </div>
                                    {step.date && (
                                        <div className="whitespace-nowrap text-right text-sm text-zinc-500 dark:text-zinc-400">
                                            <time dateTime={step.date}>{step.date}</time>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export interface ProgressTrackerProps extends React.HTMLAttributes<HTMLDivElement> {
    currentStep: number
    totalSteps: number
}

export function ProgressTracker({ currentStep, totalSteps, className, ...props }: ProgressTrackerProps) {
    const progress = (currentStep / (totalSteps - 1)) * 100

    return (
        <div className={cn("w-full", className)} {...props}>
            <div className="relative h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                    className="absolute h-2 rounded-full bg-zinc-900 transition-all duration-500 ease-in-out dark:bg-zinc-100"
                    style={{ width: `${progress}%` }}
                />
                <div className="mt-4 flex justify-between">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-zinc-900",
                                i <= currentStep ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-800"
                            )}
                            style={{ position: 'absolute', left: `${(i / (totalSteps - 1)) * 100}%`, transform: 'translateX(-50%)', top: '-1px' }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
