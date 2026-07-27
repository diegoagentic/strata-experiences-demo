import * as React from 'react'
import { cn } from '../utils/cn'

/**
 * LegacyErpSurface — DS EXCEPTION SURFACE.
 *
 * Encapsulates the "legacy ERP look" (white/zinc-100 background,
 * zinc-900 text, boxy border) used to simulate applications like
 * Seradex · Sage · QuickBooks Enterprise · SAP GUI — systems that
 * the modern Strata UI replaces or bridges.
 *
 * The look is INTENTIONALLY LOCKED to a light-mode palette in both
 * theme modes because those legacy apps don't have a dark theme.
 * This is the ONLY sanctioned use of `bg-white` + `text-zinc-*` for
 * "ERP simulation" in the demo · everywhere else must use semantic
 * tokens.
 *
 * If a scene needs a paper document instead (invoice · quote ·
 * receipt), use `<PaperMockup>` — same rationale, different chrome.
 *
 * ─── Consumers ────────────────────────────────────────────────────────
 * - src/features/leland/components/RpaBotCanvas.tsx · Seradex Sales
 *   Order Entry form (PO-to-Order Automation · step l1.6).
 * - src/features/leland/components/PoExtractionPreview.tsx · HubSpot
 *   deal card mockup (step l1.1).
 *
 * ─── Relation to the canonical DS ─────────────────────────────────────
 * Not present in the canonical DS · this is a demo-specific need to
 * render legacy-ERP look inside app UI. Candidate to promote if
 * production apps end up embedding third-party UI mockups.
 *
 * ─── Interior fields ─────────────────────────────────────────────────
 * Sub-primitives (PreFilledCell · FormField · header bars) inside a
 * consumer scene may keep raw `bg-white border-zinc-200` because those
 * classes together compose the legacy look. Document this locally in
 * the consumer scene with a JSDoc note that references this primitive.
 */

export type LegacyErpSurfaceSize = 'sm' | 'md'

export interface LegacyErpSurfaceProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    /** Visual density. `sm` for inline previews · `md` for canvas-level
        ERP form mockups (default). */
    size?: LegacyErpSurfaceSize
}

const SIZE: Record<LegacyErpSurfaceSize, { radius: string; border: string; shadow: string }> = {
    sm: { radius: 'rounded-lg',  border: 'border',    shadow: 'shadow-xs' },
    md: { radius: 'rounded-xl',  border: 'border-2',  shadow: 'shadow-sm' },
}

export function LegacyErpSurface({
    size = 'md',
    className,
    children,
    ...rest
}: LegacyErpSurfaceProps) {
    const s = SIZE[size]
    return (
        <div
            className={cn(
                // DS-exception legacy-ERP surface · locked light palette (see docstring).
                'bg-white text-zinc-900 dark:bg-zinc-100 dark:text-zinc-900',
                'border-border overflow-hidden',
                s.radius,
                s.border,
                s.shadow,
                className,
            )}
            {...rest}
        >
            {children}
        </div>
    )
}
