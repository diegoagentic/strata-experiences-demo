/**
 * COMPONENT: CapacityModal
 * PURPOSE: Browse Designer Capacity (forward planning) as a modal,
 *          decoupled from the funnel main view. Opened via "View capacity"
 *          button in OfficeworksFunnel header.
 *
 * P49 refinement:
 *   - Filter bar: region pills + status pills + sort dropdown + summary
 *   - CapacityHeatmap renders the filtered subset of designers
 *   - Card visuals use the new chip pattern (neutral cards + colored chips)
 *
 * Independent of the Review modal, which has its own embedded
 * CapacityHeatmap inside IntakeAssignPanel for in-context designer
 * assignment (now also benefits from the chip pattern).
 */

import { Fragment, useMemo, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { X, Users, Info } from 'lucide-react'
import CapacityHeatmap, {
    DESIGNERS,
    REGION_LABELS,
    utilizationStatus,
    type Designer,
    type UtilizationStatus,
} from './shared/CapacityHeatmap'

interface CapacityModalProps {
    isOpen: boolean
    onClose: () => void
}

type RegionFilter = 'all' | 'dc' | 'ma' | 'pa'
type StatusFilter = 'all' | UtilizationStatus
type SortBy = 'available' | 'utilized' | 'name'
type PriorClientFilter = 'all' | 'manatt' | 'no-manatt'

const REGION_OPTIONS: Array<{ value: RegionFilter; label: string }> = [
    { value: 'all', label: 'All regions' },
    { value: 'dc', label: REGION_LABELS.dc.label },
    { value: 'ma', label: REGION_LABELS.ma.label },
    { value: 'pa', label: REGION_LABELS.pa.label },
]

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
    { value: 'all', label: 'All statuses' },
    { value: 'available', label: 'Available' },
    { value: 'limited', label: 'Limited' },
    { value: 'at-capacity', label: 'At capacity' },
]

const SORT_OPTIONS: Array<{ value: SortBy; label: string }> = [
    { value: 'available', label: 'Most available first' },
    { value: 'utilized', label: 'Most utilized first' },
    { value: 'name', label: 'Name A–Z' },
]

const PRIOR_CLIENT_OPTIONS: Array<{ value: PriorClientFilter; label: string }> = [
    { value: 'all', label: 'All clients' },
    { value: 'manatt', label: 'Worked with MANATT' },
    { value: 'no-manatt', label: 'No MANATT history' },
]

// Shared className for all 3 dropdowns — consistent visual language
const SELECT_CLASS = 'text-[11px] font-semibold bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer hover:bg-muted/30 transition-colors'

export default function CapacityModal({ isOpen, onClose }: CapacityModalProps) {
    const [regionFilter, setRegionFilter] = useState<RegionFilter>('all')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [sortBy, setSortBy] = useState<SortBy>('available')
    const [priorClientFilter, setPriorClientFilter] = useState<PriorClientFilter>('all')

    const filtered: Designer[] = useMemo(() => {
        const byRegion = regionFilter === 'all'
            ? DESIGNERS
            : DESIGNERS.filter(d => d.region === regionFilter)
        const byStatus = statusFilter === 'all'
            ? byRegion
            : byRegion.filter(d => utilizationStatus(d.utilization) === statusFilter)
        const byPriorClient = priorClientFilter === 'all'
            ? byStatus
            : priorClientFilter === 'manatt'
                ? byStatus.filter(d => d.priorMANATT === true)
                : byStatus.filter(d => d.priorMANATT !== true)
        const sorted = [...byPriorClient]
        if (sortBy === 'available')      sorted.sort((a, b) => a.utilization - b.utilization)
        else if (sortBy === 'utilized')  sorted.sort((a, b) => b.utilization - a.utilization)
        else /* name */                  sorted.sort((a, b) => a.name.localeCompare(b.name))
        return sorted
    }, [regionFilter, statusFilter, sortBy, priorClientFilter])

    const hasFilters = regionFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'available' || priorClientFilter !== 'all'
    const resetFilters = () => {
        setRegionFilter('all')
        setStatusFilter('all')
        setSortBy('available')
        setPriorClientFilter('all')
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[400]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-6">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-4xl transform rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">

                            {/* Header */}
                            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-muted/30 shrink-0">
                                <div className="h-8 w-8 rounded-full bg-info/15 flex items-center justify-center shrink-0">
                                    <Users className="h-4 w-4 text-info" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-bold text-foreground">Designer Capacity</div>
                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                        <span>{DESIGNERS.length} designers · 3 regions · live utilization</span>
                                        <Popover className="relative inline-flex">
                                            <PopoverButton
                                                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 rounded"
                                                aria-label="How capacity is computed"
                                                title="How capacity is computed"
                                            >
                                                <Info className="h-3.5 w-3.5" />
                                            </PopoverButton>
                                            <PopoverPanel
                                                anchor="bottom start"
                                                className="z-[500] bg-popover border border-border rounded-lg shadow-xl p-3 mt-1.5 w-[320px]"
                                            >
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">How capacity is computed</p>
                                                <div className="space-y-2 text-[11px] text-foreground">
                                                    <div className="font-mono bg-muted/40 border border-border rounded px-2 py-1.5 text-[10px]">
                                                        Utilization = Committed ÷ Available
                                                    </div>
                                                    <ul className="space-y-1 text-muted-foreground">
                                                        <li><strong className="text-foreground">Available</strong> = 40h − PTO / training / obligations</li>
                                                        <li><strong className="text-foreground">Committed</strong> = Σ project hours this week</li>
                                                    </ul>
                                                    <div className="pt-2 border-t border-border">
                                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Source</div>
                                                        <div className="font-mono text-[10px] text-foreground bg-muted/40 border border-border rounded px-2 py-1.5 break-all">
                                                            =SUMIF('Form Responses 1'!O:O, designer, 'Form Responses 1'!P:P)
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground mt-1.5">
                                                            Refreshed nightly · last sync 2026-04-15 22:00
                                                        </div>
                                                    </div>
                                                </div>
                                            </PopoverPanel>
                                        </Popover>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
                                    aria-label="Close"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Filter bar — 3 dropdowns in one row + summary */}
                            <div className="px-5 py-3 border-b border-border bg-muted/15 shrink-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <select
                                        value={regionFilter}
                                        onChange={e => setRegionFilter(e.target.value as RegionFilter)}
                                        aria-label="Filter by region"
                                        className={SELECT_CLASS}
                                    >
                                        {REGION_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={statusFilter}
                                        onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                                        aria-label="Filter by status"
                                        className={SELECT_CLASS}
                                    >
                                        {STATUS_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value as SortBy)}
                                        aria-label="Sort designers"
                                        className={SELECT_CLASS}
                                    >
                                        {SORT_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={priorClientFilter}
                                        onChange={e => setPriorClientFilter(e.target.value as PriorClientFilter)}
                                        aria-label="Filter by client history"
                                        className={SELECT_CLASS}
                                    >
                                        {PRIOR_CLIENT_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>

                                    <div className="ml-auto flex items-center gap-3">
                                        <span className="text-[11px] text-muted-foreground">
                                            Showing <strong className="text-foreground tabular-nums">{filtered.length}</strong> of {DESIGNERS.length}
                                        </span>
                                        {hasFilters && (
                                            <button
                                                type="button"
                                                onClick={resetFilters}
                                                className="text-[11px] font-semibold text-primary hover:underline"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable body — filtered heatmap */}
                            <div className="flex-1 overflow-y-auto px-5 py-4">
                                {filtered.length === 0 ? (
                                    <div className="text-center py-12 text-sm text-muted-foreground">
                                        No designers match the current filters.
                                        <button onClick={resetFilters} className="block mx-auto mt-2 text-primary font-semibold hover:underline">
                                            Reset filters
                                        </button>
                                    </div>
                                ) : (
                                    <CapacityHeatmap designers={filtered} />
                                )}
                            </div>

                            {/* Footer · close action */}
                            <div className="px-5 py-3.5 border-t border-border bg-card shrink-0 flex items-center justify-between gap-3">
                                <p className="text-[11px] text-muted-foreground">
                                    Click a designer card in the assignment flow to assign them to a project.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all"
                                >
                                    Close
                                </button>
                            </div>

                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
