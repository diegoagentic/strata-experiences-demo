/**
 * COMPONENT: GlossaryTooltip
 * PURPOSE: Wraps any MBI domain term with an accessible hover tooltip that
 *          shows a plain-language definition. Uses @radix-ui/react-tooltip
 *          so keyboard + screen-reader users also get the content.
 *
 *          Usage:
 *            <GlossaryTooltip term="EDI_CORE">
 *              <span>EDI · CORE native</span>
 *            </GlossaryTooltip>
 *
 *          Or with the built-in trigger chip:
 *            <GlossaryChip term="HealthTrust" className="..." />
 *
 * DS TOKENS: bg-zinc-900/foreground-inverted · text-xs · rounded-lg
 */

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { HelpCircle } from 'lucide-react'
import { GLOSSARY } from './glossary'

interface GlossaryTooltipProps {
    /** Key from GLOSSARY map */
    term: string
    children: React.ReactNode
    /** Tooltip side — defaults to 'top' */
    side?: 'top' | 'bottom' | 'left' | 'right'
}

export function GlossaryTooltip({ term, children, side = 'top' }: GlossaryTooltipProps) {
    const entry = GLOSSARY[term]
    if (!entry) return <>{children}</>

    return (
        <TooltipPrimitive.Provider delayDuration={200}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    <span className="cursor-help">{children}</span>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        side={side}
                        sideOffset={6}
                        className="z-50 max-w-[280px] rounded-lg bg-zinc-900 px-3 py-2 text-[11px] leading-snug text-zinc-100 shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                    >
                        <div className="font-bold text-zinc-300 mb-0.5">{entry.label}</div>
                        <div>{entry.definition}</div>
                        <TooltipPrimitive.Arrow className="fill-zinc-900" />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    )
}

/** Standalone chip that renders the label + a help icon, with tooltip on hover.
 *  Pass className to control colors/shape (the chip styles come from outside). */
interface GlossaryChipProps {
    term: string
    className?: string
    iconClassName?: string
    side?: 'top' | 'bottom' | 'left' | 'right'
}

export function GlossaryChip({ term, className = '', iconClassName = '', side }: GlossaryChipProps) {
    const entry = GLOSSARY[term]
    if (!entry) return null

    return (
        <GlossaryTooltip term={term} side={side}>
            <span className={`inline-flex items-center gap-1 ${className}`}>
                {entry.label}
                <HelpCircle className={`h-2.5 w-2.5 opacity-50 ${iconClassName}`} />
            </span>
        </GlossaryTooltip>
    )
}
