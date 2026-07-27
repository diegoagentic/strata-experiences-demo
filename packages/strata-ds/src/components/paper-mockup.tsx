import * as React from 'react'
import { cn } from '../utils/cn'

/**
 * PaperMockup — DS EXCEPTION SURFACE.
 *
 * Encapsulates the "paper" look (white background + dark text) used to
 * simulate printed documents · PDF invoices · vendor quotes · receipts.
 *
 * The paper look is INTENTIONALLY LOCKED to the LIGHT palette in both
 * theme modes because a printed document doesn't have a dark theme. This
 * is the ONLY sanctioned use of `bg-white` + `text-zinc-*` in the demo ·
 * everywhere else must use semantic tokens.
 *
 * Anyone reaching for `bg-white text-zinc-900` outside this primitive
 * should be redirected here. If a new paper-style surface is needed,
 * extend this component (add a `variant`) rather than duplicating raw
 * classes.
 *
 * ─── Consumers ────────────────────────────────────────────────────────
 * - src/components/mbi/InvoiceDetailPanel.tsx · InvoicePDFFull +
 *   InvoiceMockup (Back-Office AI · Kathy invoice trust moment).
 * - src/components/mbi/NonCatalogVendorQuoteDemo.tsx · vendor quote paper.
 *
 * ─── Relation to the canonical DS ─────────────────────────────────────
 * Not present in the canonical DS · this is a demo-specific need to
 * render printed-document look inside app UI. Candidate to promote if
 * production apps end up rendering PDFs/receipts inline.
 */

export type PaperMockupSize = 'preview' | 'full'

export interface PaperMockupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    /** Visual density. `preview` for compact thumbnails inside cards ·
        `full` for lightbox / detail sheet full-width paper. */
    size?: PaperMockupSize
}

const SIZE: Record<PaperMockupSize, { padding: string; radius: string; text: string }> = {
    preview: { padding: '',       radius: 'rounded-xl',  text: 'text-[8px]' },
    full:    { padding: '',       radius: 'rounded-2xl', text: 'text-[11px]' },
}

export function PaperMockup({
    size = 'full',
    className,
    children,
    ...rest
}: PaperMockupProps) {
    const s = SIZE[size]
    return (
        <div
            className={cn(
                // DS-exception paper surface · locked light palette (see docstring).
                'bg-white text-zinc-900 dark:bg-white dark:text-zinc-900',
                'border border-zinc-200 shadow-sm overflow-hidden font-mono leading-snug',
                s.radius,
                s.text,
                s.padding,
                className,
            )}
            {...rest}
        >
            {children}
        </div>
    )
}
