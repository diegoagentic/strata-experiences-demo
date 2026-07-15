import { useEffect, useRef, useState, type ReactNode } from 'react'
import CLCFloatingPanel from './CLCFloatingPanel'

export type ChipTone = 'neutral' | 'warning' | 'success' | 'info'

export interface SummaryChip {
    id: string
    label: string
    count: number
    tone: ChipTone
    /** Pulse animation (used to draw attention as state changes) */
    pulse?: boolean
    /** Content of the floating popover when the chip is clicked */
    panel: ReactNode
    /** Title for the popover (a11y) */
    panelTitle?: string
}

interface CLCSummaryChipsBarProps {
    chips: SummaryChip[]
    /** When set, the matching chip auto-opens its popover. Pass `null` to
        close any auto-opened chip. Updates re-trigger the auto-open. */
    autoOpenChipId?: string | null
}

const TONE_CLASSES: Record<ChipTone, { active: string; pulse: string }> = {
    neutral: {
        active: 'bg-muted text-foreground border-border hover:bg-muted/80',
        pulse:  '',
    },
    warning: {
        active: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-500/15 dark:text-yellow-300 dark:border-yellow-500/30',
        pulse:  'ring-2 ring-yellow-400/60 animate-pulse',
    },
    success: {
        active: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/30',
        pulse:  'ring-2 ring-green-400/60 animate-pulse',
    },
    info: {
        active: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
        pulse:  'ring-2 ring-blue-400/60 animate-pulse',
    },
}

/**
 * Top summary chips — each chip doubles as a popover trigger.
 * Pattern: count badges + popover triggers in one element. Auto-open
 * works as the "alert" mechanic during step transitions.
 */
export default function CLCSummaryChipsBar({ chips, autoOpenChipId }: CLCSummaryChipsBarProps) {
    return (
        <div className="flex items-center gap-2 flex-wrap px-5 py-2.5">
            {chips.map(chip => (
                <ChipWithPanel key={chip.id} chip={chip} autoOpen={autoOpenChipId === chip.id} />
            ))}
        </div>
    )
}

function ChipWithPanel({ chip, autoOpen }: { chip: SummaryChip; autoOpen: boolean }) {
    const [open, setOpen] = useState(false)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const tone = TONE_CLASSES[chip.tone]

    // Auto-open when the parent flips the autoOpen flag (mount-time hook).
    useEffect(() => {
        if (autoOpen) setOpen(true)
    }, [autoOpen])

    // Imperative open · listens for `clc:open-chip` events with the matching
    // chip id. Used by the Action Center CTA in clc1.4 and the AI-flag
    // quick action on Fairport · either path opens this panel programmatically.
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail as { chipId?: string } | undefined
            if (detail?.chipId === chip.id) setOpen(true)
        }
        window.addEventListener('clc:open-chip', handler)
        return () => window.removeEventListener('clc:open-chip', handler)
    }, [chip.id])

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen(v => !v)}
                aria-label={`${chip.label} · click for details`}
                aria-expanded={open}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border rounded-full transition-colors ${tone.active} ${chip.pulse && !open ? tone.pulse : ''} ${open ? 'ring-2 ring-primary/30' : ''}`}
            >
                <span className="tabular-nums">{chip.label}</span>
            </button>
            <CLCFloatingPanel
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={triggerRef}
                title={chip.panelTitle ?? chip.label}
                width={400}
            >
                {chip.panel}
            </CLCFloatingPanel>
        </>
    )
}
