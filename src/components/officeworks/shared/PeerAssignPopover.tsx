/**
 * COMPONENT: PeerAssignPopover
 *
 * Quick action used by SelfAuditScene (sc1.6) so Kimberly (designer) picks her
 * peer reviewer explicitly before sending the audit to sc1.7. Strata surfaces a
 * recommended peer at the top of the list, scored from designerProfiles.ts:
 *   · seniority (Lead > Senior > Mid > Junior)
 *   · peer reviews YTD
 *   · utilization headroom (< 95% preferred)
 *   · cross-region acceptable for Leads (Rebecca Warren is MA Lead, MANATT is DC)
 *
 * Pattern cloned from smart-comparator/app/src/components/team/AssignPopover.tsx
 * (portal-based popover · avatar gradient · click-to-reassign chip) and adapted
 * to OW data: DesignerProfile instead of TeamMember.
 *
 * DS TOKENS only: bg-card · bg-muted · text-foreground · text-muted-foreground ·
 *                 bg-ai/X · text-ai · border-border · border-ai/X etc.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { UserPlus, Check, Sparkles, UserMinus } from 'lucide-react'
import { DESIGNER_PROFILES, regionLabel, seniorityClass, type DesignerProfile } from './designerProfiles'

interface PeerAssignPopoverProps {
    /** Currently picked peer reviewer (designer name, since names are unique) */
    assigneeName: string | null
    /** Designer currently running the audit · excluded from the list */
    currentDesignerName: string
    /** Optional · manager name to exclude from the pool (manager shouldn't peer-review) */
    excludeManagerName?: string
    onAssign: (name: string | null) => void
    triggerLabel?: string
}

const POPOVER_WIDTH = 280
const POPOVER_MAX_HEIGHT = 420 // matches the max-height we render below
const GAP = 6

// Deterministic gradient per designer · keeps the chip visually identifiable.
const AVATAR_HUES = [
    'from-indigo-500 to-indigo-700',
    'from-emerald-500 to-emerald-700',
    'from-rose-500 to-rose-700',
    'from-amber-500 to-amber-700',
    'from-purple-500 to-purple-700',
    'from-cyan-500 to-cyan-700',
    'from-orange-500 to-orange-700',
    'from-blue-500 to-blue-700',
]

function avatarGradient(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
    return AVATAR_HUES[hash % AVATAR_HUES.length]
}

function initials(name: string): string {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Strata's recommended peer · highest seniority + most peer reviews + utilization < 95%. */
function strataRecommendation(
    pool: DesignerProfile[],
): DesignerProfile | null {
    const seniorityRank: Record<DesignerProfile['seniority'], number> = { Lead: 4, Senior: 3, Mid: 2, Junior: 1 }
    const scored = pool
        .filter(d => d.utilization < 95)
        .map(d => ({
            d,
            score:
                seniorityRank[d.seniority] * 100 +
                d.kpis.peerReviewsCompletedYTD * 0.5 +
                (100 - d.utilization) * 0.3,
        }))
        .sort((a, b) => b.score - a.score)
    return scored[0]?.d ?? null
}

/**
 * Resolved popover position. Two axes resolved independently:
 *   · horizontal: prefer left-align to trigger (popover grows right) · flip to
 *     right-align (popover grows left) if it would overflow viewport right.
 *   · vertical:   prefer below trigger (popover grows down) · flip above if it
 *     would overflow viewport bottom.
 */
interface AnchorPos {
    horizontal: { side: 'left'; left: number } | { side: 'right'; right: number }
    vertical:   { side: 'top';  top:  number } | { side: 'bottom'; bottom: number }
}

export default function PeerAssignPopover({
    assigneeName,
    currentDesignerName,
    excludeManagerName,
    onAssign,
    triggerLabel = 'Assign peer reviewer',
}: PeerAssignPopoverProps) {
    const [open, setOpen] = useState(false)
    const [anchor, setAnchor] = useState<AnchorPos | null>(null)
    const triggerWrapRef = useRef<HTMLDivElement>(null)
    const popoverRef = useRef<HTMLDivElement>(null)

    const eligible = DESIGNER_PROFILES.filter(
        d => d.name !== currentDesignerName
            && d.name !== excludeManagerName
            && (d.seniority === 'Lead' || d.seniority === 'Senior'),
    )
    const assignee = assigneeName ? DESIGNER_PROFILES.find(d => d.name === assigneeName) ?? null : null
    const recommended = strataRecommendation(eligible)
    const others = eligible.filter(d => d.name !== recommended?.name)

    const recomputeAnchor = useCallback(() => {
        const el = triggerWrapRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        // Horizontal · prefer left-align (popover grows right) · flip if it
        // would overflow the viewport's right edge.
        const fitsRight = r.left + POPOVER_WIDTH <= window.innerWidth - 8
        const horizontal: AnchorPos['horizontal'] = fitsRight
            ? { side: 'left',  left:  r.left }
            : { side: 'right', right: Math.max(8, window.innerWidth - r.right) }
        // Vertical · prefer below the trigger · flip above if it would overflow.
        const fitsBelow = r.bottom + GAP + POPOVER_MAX_HEIGHT <= window.innerHeight - 8
        const vertical: AnchorPos['vertical'] = fitsBelow
            ? { side: 'top',    top:    r.bottom + GAP }
            : { side: 'bottom', bottom: Math.max(8, window.innerHeight - r.top + GAP) }
        setAnchor({ horizontal, vertical })
    }, [])

    useEffect(() => {
        if (!open) return
        // Defer the initial position calc to next frame · keeps the setState
        // out of the synchronous effect body (eslint react-hooks/set-state-in-effect).
        const rafId = window.requestAnimationFrame(() => recomputeAnchor())
        window.addEventListener('scroll', recomputeAnchor, true)
        window.addEventListener('resize', recomputeAnchor)
        return () => {
            window.cancelAnimationFrame(rafId)
            window.removeEventListener('scroll', recomputeAnchor, true)
            window.removeEventListener('resize', recomputeAnchor)
        }
    }, [open, recomputeAnchor])

    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            const t = e.target as Node
            if (triggerWrapRef.current?.contains(t)) return
            if (popoverRef.current?.contains(t)) return
            setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open])

    const pick = (name: string | null) => {
        onAssign(name)
        setOpen(false)
    }

    const portalStyle = (a: AnchorPos): React.CSSProperties => ({
        position: 'fixed',
        ...(a.horizontal.side === 'left'
            ? { left: a.horizontal.left }
            : { right: a.horizontal.right }),
        ...(a.vertical.side === 'top'
            ? { top: a.vertical.top }
            : { bottom: a.vertical.bottom }),
        width: POPOVER_WIDTH,
        maxHeight: POPOVER_MAX_HEIGHT,
        zIndex: 300,
    })

    return (
        <div ref={triggerWrapRef} className="relative inline-flex">
            {assignee ? (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
                    aria-label={`Assigned to ${assignee.name} · click to reassign`}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card hover:bg-muted px-1.5 py-1 pr-2.5 transition-colors"
                >
                    <span className={`h-6 w-6 rounded-full bg-gradient-to-br ${avatarGradient(assignee.name)} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>
                        {initials(assignee.name)}
                    </span>
                    <span className="text-xs font-medium text-foreground truncate max-w-[140px]">
                        {assignee.name}
                    </span>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
                    aria-label={triggerLabel}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-dashed border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors"
                >
                    <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                    {triggerLabel}
                </button>
            )}

            {open && anchor && createPortal(
                <div
                    ref={popoverRef}
                    style={portalStyle(anchor)}
                    className="rounded-xl border border-border bg-card shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
                >
                    <div className="px-3 py-2 border-b border-border">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {assignee ? 'Reassign peer reviewer' : 'Pick a peer reviewer'}
                        </div>
                    </div>

                    {/* Strata's recommendation · highlighted at top */}
                    {recommended && (
                        <div className="p-1.5 border-b border-border">
                            <button
                                type="button"
                                onClick={() => pick(recommended.name)}
                                title={`Strata suggests ${recommended.name}`}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                                    assigneeName === recommended.name
                                        ? 'bg-ai/15'
                                        : 'bg-ai/5 hover:bg-ai/10'
                                }`}
                            >
                                <span className={`h-8 w-8 rounded-full bg-gradient-to-br ${avatarGradient(recommended.name)} text-white text-[11px] font-bold flex items-center justify-center shrink-0`}>
                                    {initials(recommended.name)}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[12.5px] font-semibold text-foreground truncate">
                                            {recommended.name}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-ai/10 text-ai border border-ai/20 rounded px-1.5 py-0.5">
                                            <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                                            Strata suggests
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                        {recommended.seniority} · {regionLabel(recommended.region)} · {recommended.kpis.peerReviewsCompletedYTD} peer reviews YTD · {recommended.utilization}% util
                                    </div>
                                </div>
                                {assigneeName === recommended.name && (
                                    <Check className="h-3.5 w-3.5 text-ai shrink-0" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    )}

                    {/* Other peers */}
                    <div className="py-1 max-h-[280px] overflow-y-auto">
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Other available designers
                        </div>
                        {others.map(d => {
                            const active = assigneeName === d.name
                            return (
                                <button
                                    key={d.name}
                                    type="button"
                                    onClick={() => pick(d.name)}
                                    title={`Assign to ${d.name}`}
                                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors ${
                                        active ? 'bg-muted' : 'hover:bg-muted/60'
                                    }`}
                                >
                                    <span className={`h-7 w-7 rounded-full bg-gradient-to-br ${avatarGradient(d.name)} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>
                                        {initials(d.name)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[12px] font-medium text-foreground truncate">
                                                {d.name}
                                            </span>
                                            <span className={`text-[8.5px] font-bold uppercase tracking-wider rounded px-1 py-0.5 border ${seniorityClass(d.seniority)}`}>
                                                {d.seniority}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground truncate">
                                            {regionLabel(d.region)} · {d.utilization}% util · {d.kpis.peerReviewsCompletedYTD} reviews YTD
                                        </div>
                                    </div>
                                    {active && <Check className="h-3.5 w-3.5 text-foreground shrink-0" aria-hidden="true" />}
                                </button>
                            )
                        })}
                    </div>

                    {assignee && (
                        <div className="border-t border-border p-1.5">
                            <button
                                type="button"
                                onClick={() => pick(null)}
                                title="Remove peer reviewer"
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                                <UserMinus className="h-3.5 w-3.5" aria-hidden="true" />
                                Clear selection
                            </button>
                        </div>
                    )}
                </div>,
                document.body,
            )}
        </div>
    )
}
