/**
 * MaterialSwatch · small color-swatch chip for fabric/finish materials.
 *
 * Visualizes the chosen material as a colored square + optional label, used in
 * the item detail drawer, the line-item rows, and the sample-request workflow.
 */

import type { MaterialSwatch as Swatch } from './textileRef'

interface MaterialSwatchProps {
    swatch: Swatch
    /** Show the "code · name" label next to the square. */
    showLabel?: boolean
    size?: 'sm' | 'md'
    /** Selected ring (for the picker grid). */
    selected?: boolean
    onClick?: () => void
    className?: string
}

const SQUARE: Record<'sm' | 'md', string> = {
    sm: 'h-3.5 w-3.5',
    md: 'h-5 w-5',
}

export default function MaterialSwatch({
    swatch,
    showLabel = false,
    size = 'sm',
    selected = false,
    onClick,
    className = '',
}: MaterialSwatchProps) {
    const interactive = typeof onClick === 'function'
    const Tag = interactive ? 'button' : 'span'
    return (
        <Tag
            {...(interactive ? { type: 'button' as const, onClick } : {})}
            aria-label={`${swatch.code} ${swatch.name}${swatch.vendor ? ` · ${swatch.vendor}` : ''}`}
            className={`inline-flex items-center gap-1.5 ${interactive ? 'cursor-pointer hover:bg-muted/60 px-1.5 py-1 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary' : ''} ${selected ? 'ring-2 ring-primary rounded-lg px-1.5 py-1' : ''} ${className}`}
        >
            <span
                className={`${SQUARE[size]} rounded ring-1 ring-border shrink-0`}
                style={{ backgroundColor: swatch.hex }}
                aria-hidden="true"
            />
            {showLabel && (
                <span className="text-[11px] text-foreground whitespace-nowrap">
                    <span className="font-mono text-muted-foreground">{swatch.code}</span> {swatch.name}
                </span>
            )}
        </Tag>
    )
}
