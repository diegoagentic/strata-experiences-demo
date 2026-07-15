import { useCallback, useEffect, useRef, useState, type RefObject, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface CLCFloatingPanelProps {
    open: boolean
    onClose: () => void
    anchorRef: RefObject<HTMLElement | null>
    children: ReactNode
    width?: number
    /** Anchor edge for horizontal alignment.
        - 'bottom-start' (default) → panel's LEFT edge aligns with trigger's
          left edge · panel extends to the right (safe for triggers near the
          left side of the viewport, which is typical for top summary chips)
        - 'bottom-end' → panel's RIGHT edge aligns with trigger's right edge ·
          panel extends to the left (use for triggers in the top-right corner)
        Both modes auto-clamp to keep the panel inside the viewport. */
    anchor?: 'bottom-end' | 'bottom-start'
    title?: string
}

interface AnchorPos {
    top: number
    /** Distance from viewport right edge (used when anchor='bottom-end') */
    right?: number
    /** Distance from viewport left edge (used when anchor='bottom-start') */
    left?: number
}

const GAP = 8
const EDGE_MARGIN = 8

/**
 * Portal-based floating popover with smart positioning.
 *
 * Pattern lifted from PreflightSummaryPopover (smart-comparator). Used by
 * CLCSummaryChipsBar to attach popovers to chip triggers without coupling
 * to Headless UI's Popover positioning (which clips inside scroll containers).
 *
 * Behavior:
 *  - createPortal to document.body so the panel escapes any overflow ancestor
 *  - recompute anchor on scroll (capture) + resize
 *  - click-outside (anchor + panel both excluded) closes
 *  - Escape closes
 */
export default function CLCFloatingPanel({ open, onClose, anchorRef, children, width = 360, anchor = 'bottom-start', title }: CLCFloatingPanelProps) {
    const [pos, setPos] = useState<AnchorPos | null>(null)
    const panelRef = useRef<HTMLDivElement>(null)

    const recompute = useCallback(() => {
        const el = anchorRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const vpW = window.innerWidth
        const top = r.bottom + GAP

        if (anchor === 'bottom-start') {
            // Panel's left edge aligns with trigger's left edge.
            // Clamp so the panel never overflows the right edge of the viewport.
            const maxLeft = Math.max(EDGE_MARGIN, vpW - width - EDGE_MARGIN)
            const left = Math.min(maxLeft, Math.max(EDGE_MARGIN, r.left))
            setPos({ top, left })
        } else {
            // Panel's right edge aligns with trigger's right edge.
            // Clamp so the panel never overflows the left edge.
            const maxRight = Math.max(EDGE_MARGIN, vpW - width - EDGE_MARGIN)
            const right = Math.min(maxRight, Math.max(EDGE_MARGIN, vpW - r.right))
            setPos({ top, right })
        }
    }, [anchorRef, anchor, width])

    useEffect(() => {
        if (!open) return
        recompute()
        window.addEventListener('scroll', recompute, true)
        window.addEventListener('resize', recompute)
        return () => {
            window.removeEventListener('scroll', recompute, true)
            window.removeEventListener('resize', recompute)
        }
    }, [open, recompute])

    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            const t = e.target as Node
            if (anchorRef.current?.contains(t)) return
            if (panelRef.current?.contains(t)) return
            onClose()
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open, anchorRef, onClose])

    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open, onClose])

    if (!open || !pos) return null

    return createPortal(
        <div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label={title}
            className="rounded-xl border border-border bg-card shadow-xl"
            style={{
                position: 'fixed',
                top: pos.top,
                ...(pos.right !== undefined ? { right: pos.right } : {}),
                ...(pos.left !== undefined ? { left: pos.left } : {}),
                width,
                maxHeight: '80vh',
                overflowY: 'auto',
                zIndex: 9999,
            }}
        >
            {children}
        </div>,
        document.body
    )
}
