/**
 * COMPONENT: InboxMonitor (Chip + Modal)
 *
 * PURPOSE: Demonstrates Matt's CEO-level ask (Neocon-review 2026-06-05 transcript 0:30):
 *          "input can be received like in volume... an Inbox that's being monitored...
 *           capturing from that Inbox the requests that are coming in."
 *
 *          User feedback (2026-06-05 browser smoke): the persistent panel duplicated
 *          ActionCenter and consumed too much vertical space above the actual transactions
 *          list. Refactored into a compact chip-with-modal:
 *            - Chip stays in the tab row, shows "📥 N today · Xm ago" (live counter)
 *            - Click opens a modal with the full event list
 *            - Auto-spawn keeps incrementing the counter in the background so the
 *              "volume arriving" sense is still visible without owning the page
 *
 * USAGE:
 *   <InboxMonitor /> (default export · self-contained chip + modal)
 */

import { Fragment, useState, useEffect, useMemo, useRef } from 'react'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Inbox, Mail, Database, X, ListChecks } from 'lucide-react'
import { DocumentTextIcon, ShoppingCartIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'

// Post-Neocon-review (2026-06-06) · PDF #11: sources reduced to Email + Manual.
type EventSource = 'Email' | 'Manual'
type EventType = 'RFQ' | 'PO' | 'Ack'

interface IngestionEvent {
    id: string
    type: EventType
    vendor: string
    source: EventSource
    /** Minutes-ago for relative time render. Bumped by the tick interval. */
    minutesAgo: number
}

// Seed of recent events — what "just arrived" via the monitored Inbox.
const INITIAL_EVENTS: IngestionEvent[] = [
    { id: 'INB-001', type: 'RFQ', vendor: 'Northline Furniture Group', source: 'Email', minutesAgo: 2 },
    { id: 'INB-002', type: 'PO',  vendor: 'Cascade Workplace Co',        source: 'Email', minutesAgo: 5 },
    { id: 'INB-003', type: 'RFQ', vendor: 'Pacific Workspaces',          source: 'Email', minutesAgo: 9 },
    { id: 'INB-004', type: 'Ack', vendor: 'Legacy Office Group',       source: 'Email', minutesAgo: 14 },
    { id: 'INB-005', type: 'PO',  vendor: 'Summit Office Solutions',     source: 'Email', minutesAgo: 22 },
    { id: 'INB-006', type: 'RFQ', vendor: 'Bayline Furnishings',     source: 'Email', minutesAgo: 31 },
]

// Pool used by auto-spawn — cycle so the feed feels alive during the demo.
const SPAWN_POOL: Omit<IngestionEvent, 'id' | 'minutesAgo'>[] = [
    { type: 'RFQ', vendor: 'Apex Office Design',         source: 'Email' },
    { type: 'PO',  vendor: 'Midwest Contract Furniture', source: 'Email' },
    { type: 'Ack', vendor: 'Northline Furniture Group', source: 'Email' },
    { type: 'RFQ', vendor: 'Waterside Hospitality Group',  source: 'Email' },
    { type: 'PO',  vendor: 'Legacy Office Group',      source: 'Email' },
    { type: 'RFQ', vendor: 'Global Furniture Partners',  source: 'Email' },
    { type: 'Ack', vendor: 'Pacific Workspaces',         source: 'Email' },
]

function relativeTime(minutesAgo: number, tick: number): string {
    const adjusted = minutesAgo + Math.floor(tick / 2)
    if (adjusted < 1) return 'just now'
    if (adjusted < 60) return `${adjusted}m ago`
    const hours = Math.floor(adjusted / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
}

function typeIcon(type: EventType) {
    if (type === 'RFQ') return DocumentTextIcon
    if (type === 'PO') return ShoppingCartIcon
    return ClipboardDocumentCheckIcon
}

function sourceIcon(source: EventSource) {
    if (source === 'Email') return Mail
    return Database // Manual
}

export default function InboxMonitor() {
    const [tick, setTick] = useState(0)
    const [events, setEvents] = useState<IngestionEvent[]>(INITIAL_EVENTS)
    const [spawnCount, setSpawnCount] = useState(0)
    const [open, setOpen] = useState(false)

    // Roll-the-clock: bump relative timestamps every 30s.
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 30_000)
        return () => clearInterval(interval)
    }, [])

    // Auto-spawn tied to the modal open state (browser smoke 2026-06-06).
    // When the modal opens, restart a fresh sequence so the demo audience sees the
    // animation immediately, then a more realistic cadence:
    //   1st arrival  →  2s after open
    //   2nd arrival  →  5s
    //   3rd arrival  → 20s
    //   4th arrival  → 30s
    //   thereafter   → every 60s
    // Modal close clears all pending timers; next open resets the sequence from zero.
    const counterRef = useRef(0)
    useEffect(() => {
        if (!open) return

        // Reset to a known state so every demo run looks identical.
        counterRef.current = 0
        setEvents(INITIAL_EVENTS)
        setSpawnCount(0)

        function spawnOne() {
            counterRef.current += 1
            const n = counterRef.current
            const seedIndex = (n - 1) % SPAWN_POOL.length
            const next = SPAWN_POOL[seedIndex]
            const nextEvent: IngestionEvent = {
                ...next,
                id: `INB-AUTO-${n}`,
                minutesAgo: 0,
            }
            setEvents(prev => [nextEvent, ...prev].slice(0, 8))
            setSpawnCount(n)
        }

        // Pre-scheduled arrivals at absolute times measured from modal open.
        const initialDelays = [2_000, 5_000, 20_000, 30_000]
        const timers: ReturnType<typeof setTimeout>[] = initialDelays.map(ms => setTimeout(spawnOne, ms))

        // After the last scheduled arrival, settle into a steady 60s cadence.
        let intervalId: ReturnType<typeof setInterval> | null = null
        const intervalKickoff = setTimeout(() => {
            intervalId = setInterval(spawnOne, 60_000)
        }, 30_000 + 60_000) // first interval tick lands at 90s from open
        timers.push(intervalKickoff)

        return () => {
            timers.forEach(clearTimeout)
            if (intervalId !== null) clearInterval(intervalId)
        }
    }, [open])

    const counters = useMemo(() => {
        const byType = events.reduce<Record<string, number>>((acc, e) => {
            acc[e.source] = (acc[e.source] ?? 0) + 1
            return acc
        }, {})
        // Scale the recent-events list by a factor so the headline ("29 today")
        // reflects all-day volume, not just the 8 visible rows.
        const todayTotal = events.length + 18 + spawnCount
        return { byType, todayTotal }
    }, [events, spawnCount])

    const lastEvent = events[0]
    const lastEventRelative = lastEvent ? relativeTime(lastEvent.minutesAgo, tick) : '—'

    return (
        <>
            {/* Compact chip · lives next to the Upload button in the tab row.
                Icon is a list (ListChecks) since the chip surfaces a feed of ingested docs;
                using Inbox icon both here and inside the modal felt repetitive (user feedback 2026-06-05). */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                title={`Inbox Monitor · ${counters.todayTotal} documents ingested today · last arrived ${lastEventRelative} · click to view full feed`}
                aria-label="Open Inbox Monitor"
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-md border border-border bg-card text-foreground hover:bg-muted/50 hover:border-info/40 transition-colors"
            >
                <ListChecks className="w-4 h-4 text-info" aria-hidden="true" />
                <span>Inbox Monitor</span>
                <span className="text-muted-foreground/60" aria-hidden="true">·</span>
                <span className="tabular-nums">{counters.todayTotal}</span>
                <span className="text-muted-foreground font-medium">today</span>
                <span className="hidden md:inline text-[10px] text-muted-foreground font-normal">· {lastEventRelative}</span>
            </button>

            {/* Modal · full feed on-demand (does not consume page space when closed) */}
            <Transition show={open} as={Fragment}>
                <Dialog onClose={() => setOpen(false)} className="relative z-[200]">
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-start justify-center p-4 pt-16">
                            <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                                    {/* Header layout (post-Neocon-review browser-smoke 2026-06-05):
                                        Close button anchored absolute top-right (standard modal pattern); the headline
                                        counter "N today" sits inline with the title group so it never wraps onto its
                                        own row next to the X. */}
                                    <header className="relative px-5 py-4 pr-12 border-b border-border flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-info/10 text-info shrink-0">
                                            <Inbox className="w-5 h-5" aria-hidden="true" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-foreground">Inbox Monitor</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">Documents arriving via monitored channels · auto-ingested every minute</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-2xl font-bold text-foreground tabular-nums leading-none">{counters.todayTotal}</div>
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mt-1">today</div>
                                        </div>
                                        <button
                                            onClick={() => setOpen(false)}
                                            className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                            aria-label="Close Inbox Monitor"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </header>

                                    <div className="px-5 py-3 border-b border-border bg-muted/30 flex flex-wrap items-center gap-3 text-xs">
                                        {(['Email', 'Manual'] as const).map(src => {
                                            const Icon = sourceIcon(src)
                                            const count = counters.byType[src] ?? 0
                                            return (
                                                <span key={src} className="inline-flex items-center gap-1.5 text-muted-foreground">
                                                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                                                    <span className="font-semibold text-foreground tabular-nums">{count + (src === 'Email' ? 16 : 2)}</span>
                                                    <span>via {src}</span>
                                                </span>
                                            )
                                        })}
                                    </div>

                                    <ul className="divide-y divide-border max-h-[60vh] overflow-y-auto">
                                        {events.map(event => {
                                            const TypeIcon = typeIcon(event.type)
                                            const SourceIcon = sourceIcon(event.source)
                                            return (
                                                <li key={event.id} className="px-5 py-2.5 flex items-center gap-3 text-xs hover:bg-muted/20 transition-colors">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md ${
                                                        event.type === 'RFQ' ? 'bg-info/10 text-info' :
                                                        event.type === 'PO' ? 'bg-warning/10 text-warning' :
                                                        'bg-success/10 text-success'
                                                    }`} aria-hidden="true">
                                                        <TypeIcon className="w-3.5 h-3.5" />
                                                    </span>
                                                    <span className="font-semibold text-foreground min-w-[44px]">{event.type}</span>
                                                    <span className="text-foreground flex-1 truncate">from <span className="font-medium">{event.vendor}</span></span>
                                                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                                                        <SourceIcon className="w-3 h-3" aria-hidden="true" />
                                                        {event.source}
                                                    </span>
                                                    <span className="text-muted-foreground tabular-nums text-right min-w-[60px]">{relativeTime(event.minutesAgo, tick)}</span>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}
