/**
 * COMPONENT: ReceivingProcessBar
 * PURPOSE: Shared 6-step process bar for Product Receiving flow (r1.1–r1.6).
 *          Active step is derived from the current stepId.
 */

import { CheckCircle2 } from 'lucide-react'

const STEPS = ['WIG Bingo Check', 'AI Analysis', 'Alert & Claim', 'Core Entry', 'Notify Walter']

const STEP_INDEX: Record<string, number> = {
    'r1.2': 0, 'r1.3': 1, 'r1.4': 2, 'r1.5': 3, 'r1.6': 4,
}

interface ReceivingProcessBarProps {
    stepId: string
}

export default function ReceivingProcessBar({ stepId }: ReceivingProcessBarProps) {
    const activeIndex = STEP_INDEX[stepId] ?? 0

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="flex items-stretch divide-x divide-border">
                {STEPS.map((label, i) => {
                    const isDone   = i < activeIndex
                    const isActive = i === activeIndex

                    return (
                        <div
                            key={label}
                            className={`flex-1 flex flex-col items-center gap-1 px-1 py-2.5 transition-colors ${
                                isActive
                                    ? 'bg-primary/10'
                                    : isDone
                                    ? 'bg-success/5'
                                    : 'bg-card'
                            }`}
                        >
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : isDone
                                    ? 'bg-success/15 text-success'
                                    : 'bg-muted text-muted-foreground'
                            }`}>
                                {isDone
                                    ? <CheckCircle2 className="h-3 w-3" />
                                    : <span className="text-[9px] font-bold leading-none">{i + 1}</span>
                                }
                            </div>
                            <span className={`text-[9px] font-medium text-center leading-tight ${
                                isActive
                                    ? 'text-foreground'
                                    : isDone
                                    ? 'text-success'
                                    : 'text-muted-foreground'
                            }`}>
                                {label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
