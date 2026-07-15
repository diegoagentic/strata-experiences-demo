// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Projects Archive View
// Phase 10 of WRG Demo v6 implementation
//
// Grid of saved project cards. Each card shows customer + status, zip/date,
// 3 inline metrics (Est. Labor / Actual Labor / Yield Variance), and Load /
// Delete actions. Actual Labor is an inline editable number; variance auto
// computes from (estimated − actual) / estimated.
// ═══════════════════════════════════════════════════════════════════════════════

import { Fragment, useMemo, useState } from 'react'
import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    Transition,
} from '@headlessui/react'
import { clsx } from 'clsx'
import {
    Check,
    ChevronDown,
    FolderOpen,
    Search,
    Trash2,
    TrendingDown,
    TrendingUp,
    Upload,
} from 'lucide-react'
import type { EstimateStatus, SavedEstimate } from './types'

interface ProjectsArchiveViewProps {
    savedEstimates: SavedEstimate[]
    onLoadEstimate: (estimate: SavedEstimate) => void
    onDeleteEstimate: (id: string) => void
    onUpdateStatus: (id: string, status: EstimateStatus) => void
    onUpdateActualCost: (id: string, cost: number) => void
}

// ── Status badge palette ─────────────────────────────────────────────────────
const STATUS_STYLES: Record<EstimateStatus, string> = {
    DRAFT:     'bg-muted text-muted-foreground border-border',
    PENDING:   'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    APPROVED:  'bg-brand-300/10 text-brand-600 dark:text-brand-400 border-brand-300/30',
    COMPLETED: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
}

const STATUS_ORDER: EstimateStatus[] = ['DRAFT', 'PENDING', 'APPROVED', 'COMPLETED']

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

function parseMoney(raw: string): number {
    return parseFloat(raw.replace(/,/g, '')) || 0
}

export default function ProjectsArchiveView({
    savedEstimates,
    onLoadEstimate,
    onDeleteEstimate,
    onUpdateStatus,
    onUpdateActualCost,
}: ProjectsArchiveViewProps) {
    const [query, setQuery] = useState('')

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return savedEstimates
        return savedEstimates.filter((e) =>
            e.customer.name.toLowerCase().includes(q) ||
            e.customer.zipCode.includes(q)
        )
    }, [savedEstimates, query])

    return (
        <div className="pt-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        Project History
                    </h2>
                    <span className="text-xs text-muted-foreground">
                        · {filtered.length} of {savedEstimates.length}
                    </span>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by client or ZIP…"
                        className="pl-9 pr-3 py-2 w-72 bg-card dark:bg-zinc-800 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
                <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm p-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        No saved estimates match &quot;{query}&quot;.
                    </p>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((est) => {
                    const estimatedCost = parseMoney(est.estimate.totalCost)
                    const actualCost = est.actualCost
                    const variance = estimatedCost > 0 && actualCost > 0
                        ? ((estimatedCost - actualCost) / estimatedCost) * 100
                        : null
                    const variancePositive = variance !== null && variance >= 0

                    return (
                        <div
                            key={est.id}
                            className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm p-5 hover:border-primary/40 transition-colors flex flex-col gap-4"
                        >
                            {/* Top: client + status */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-foreground truncate">
                                        {est.customer.name}
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {est.customer.zipCode} · {formatDate(est.timestamp)}
                                    </p>
                                </div>
                                <Listbox
                                    value={est.status}
                                    onChange={(s) => onUpdateStatus(est.id, s)}
                                >
                                    <div className="relative">
                                        <ListboxButton
                                            className={clsx(
                                                'flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary transition-colors',
                                                STATUS_STYLES[est.status]
                                            )}
                                        >
                                            {est.status}
                                            <ChevronDown className="w-3 h-3 opacity-70" aria-hidden />
                                        </ListboxButton>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-150"
                                            enterFrom="opacity-0 -translate-y-1"
                                            enterTo="opacity-100 translate-y-0"
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <ListboxOptions className="absolute right-0 z-30 mt-1 w-36 overflow-hidden rounded-xl bg-card dark:bg-zinc-800 border border-border shadow-xl py-1 focus:outline-none">
                                                {STATUS_ORDER.map((s) => (
                                                    <ListboxOption
                                                        key={s}
                                                        value={s}
                                                        className={({ focus }) =>
                                                            clsx(
                                                                'relative cursor-pointer select-none py-1.5 pl-8 pr-3 text-[10px] font-bold uppercase tracking-wider transition-colors',
                                                                focus && 'bg-zinc-100 dark:bg-zinc-900'
                                                            )
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span
                                                                    className={clsx(
                                                                        'inline-block px-2 py-0.5 rounded-full border',
                                                                        STATUS_STYLES[s]
                                                                    )}
                                                                >
                                                                    {s}
                                                                </span>
                                                                {selected && (
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-foreground dark:text-primary">
                                                                        <Check className="h-3.5 w-3.5" aria-hidden />
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </ListboxOption>
                                                ))}
                                            </ListboxOptions>
                                        </Transition>
                                    </div>
                                </Listbox>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="rounded-xl bg-muted/40 py-2">
                                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        Est. Labor
                                    </p>
                                    <p className="text-sm font-semibold text-foreground mt-0.5">
                                        ${estimatedCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-muted/40 py-2">
                                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        Actual
                                    </p>
                                    <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                                        <span className="text-sm font-semibold text-foreground">$</span>
                                        <input
                                            type="number"
                                            min={0}
                                            value={est.actualCost || ''}
                                            onChange={(e) =>
                                                onUpdateActualCost(
                                                    est.id,
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                            placeholder="0"
                                            className="w-16 bg-transparent text-sm font-semibold text-foreground text-center focus:outline-none focus:ring-1 focus:ring-primary rounded px-0.5"
                                        />
                                    </div>
                                </div>
                                <div className="rounded-xl bg-muted/40 py-2">
                                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        Variance
                                    </p>
                                    {variance !== null ? (
                                        <p
                                            className={clsx(
                                                'text-sm font-semibold mt-0.5 flex items-center justify-center gap-0.5',
                                                variancePositive
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-destructive'
                                            )}
                                        >
                                            {variancePositive ? (
                                                <TrendingUp className="w-3 h-3" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3" />
                                            )}
                                            {Math.abs(variance).toFixed(1)}%
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground mt-0.5">—</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    onClick={() => onLoadEstimate(est)}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    Load
                                </button>
                                <button
                                    onClick={() => onDeleteEstimate(est.id)}
                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                    title="Delete estimate"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
