// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Audit Trail Panel
// Refinement Phase 6d (Pain #4 — no structured data layer) · v7 inline variant
//
// Compact inline trigger (icon + count badge + chevron) that slots into the
// ProjectDossier card's rightSlot. When clicked, drops a floating card
// anchored to the trigger with the full event timeline. No more fixed
// positioning — the parent decides where the trigger lives.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import {
    Activity,
    ChevronDown,
    ShieldCheck,
    Sparkles,
    User,
    UserCheck,
    X,
} from 'lucide-react'

export type AuditCategory = 'system' | 'ai' | 'edit' | 'approval' | 'release'

export interface AuditEvent {
    id: string
    timestamp: number
    actor: string
    action: string
    category: AuditCategory
}

interface AuditTrailPanelProps {
    events: AuditEvent[]
    hidden?: boolean
}

const CATEGORY_META: Record<
    AuditCategory,
    { icon: typeof Sparkles; tone: string }
> = {
    system:   { icon: Activity,    tone: 'text-muted-foreground' },
    ai:       { icon: Sparkles,    tone: 'text-indigo-500 dark:text-indigo-400' },
    edit:     { icon: User,        tone: 'text-blue-500 dark:text-blue-400' },
    approval: { icon: UserCheck,   tone: 'text-green-500 dark:text-green-400' },
    release:  { icon: ShieldCheck, tone: 'text-foreground dark:text-primary' },
}

function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

export default function AuditTrailPanel({ events, hidden = false }: AuditTrailPanelProps) {
    const [expanded, setExpanded] = useState(false)
    const listRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const prevCountRef = useRef(events.length)

    // Auto-scroll the list to the bottom when a new event is appended
    useEffect(() => {
        if (!expanded) return
        if (events.length <= prevCountRef.current) {
            prevCountRef.current = events.length
            return
        }
        prevCountRef.current = events.length
        const el = listRef.current
        if (el) el.scrollTop = el.scrollHeight
    }, [events, expanded])

    // Click outside → collapse
    useEffect(() => {
        if (!expanded) return
        const handle = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setExpanded(false)
            }
        }
        document.addEventListener('mousedown', handle)
        return () => document.removeEventListener('mousedown', handle)
    }, [expanded])

    if (hidden) return null

    const count = events.length

    return (
        <div
            ref={containerRef}
            className="relative shrink-0"
            role="region"
            aria-label="Audit trail"
        >
            {/* Compact trigger — fits inside the dossier row */}
            <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="group flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
                aria-expanded={expanded}
                title={`Audit trail · ${count} event${count === 1 ? '' : 's'}`}
            >
                <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                    <Activity className="w-3 h-3 text-foreground dark:text-primary" />
                    {count > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center tabular-nums">
                            {count}
                        </span>
                    )}
                </span>
                <ChevronDown
                    className={clsx(
                        'w-3 h-3 transition-transform',
                        expanded && 'rotate-180'
                    )}
                />
            </button>

            {/* Expanded panel — absolutely anchored to the trigger */}
            {expanded && (
                <div className="absolute top-full right-0 mt-2 w-80 max-h-[60vh] rounded-2xl bg-card/95 dark:bg-zinc-800/95 backdrop-blur-xl border border-border shadow-2xl overflow-hidden z-40 flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-2 min-w-0">
                            <Activity className="w-3.5 h-3.5 text-foreground dark:text-primary shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                                    Audit Trail
                                </p>
                                <p className="text-xs text-foreground font-semibold leading-tight">
                                    {count} event{count === 1 ? '' : 's'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setExpanded(false)}
                            className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                            aria-label="Collapse audit trail"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Event list */}
                    <div
                        ref={listRef}
                        className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-minimal"
                    >
                        {events.length === 0 && (
                            <p className="px-3 py-4 text-center text-[11px] text-muted-foreground">
                                No events yet.
                            </p>
                        )}
                        {events.map((event) => {
                            const meta = CATEGORY_META[event.category]
                            const Icon = meta.icon
                            return (
                                <div
                                    key={event.id}
                                    className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/40 transition-colors"
                                >
                                    <span
                                        className={clsx(
                                            'shrink-0 mt-0.5 w-5 h-5 rounded-md bg-muted/60 flex items-center justify-center',
                                            meta.tone
                                        )}
                                    >
                                        <Icon className="w-3 h-3" />
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] text-foreground leading-tight">
                                            {event.action}
                                        </p>
                                        <p className="text-[9px] text-muted-foreground leading-tight mt-0.5 font-mono">
                                            {formatTime(event.timestamp)} · {event.actor}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-border bg-muted/20">
                        <p className="text-[9px] text-muted-foreground leading-tight">
                            Every event is written to CORE on release, with full signatures.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
