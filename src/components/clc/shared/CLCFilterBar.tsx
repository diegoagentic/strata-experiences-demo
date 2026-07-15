import type { ReactNode } from 'react'
import { Search, X, Filter as FilterIcon } from 'lucide-react'
import type { InstallJob, Region } from './installScheduleData'
import { REGION_LABEL } from './installScheduleData'

export type StatusKey = InstallJob['status']

const STATUS_LABELS: Record<StatusKey, string> = {
    pending:    'Pulled',
    scheduled:  'Scheduled',
    'in-flight': 'In-flight',
    complete:   'Complete',
}

export type StatusOption = {
    key: string
    label: string
}

interface CLCFilterBarProps {
    /** Date range filter — null means no date filter active */
    dateRange?: { from: string; to: string } | null
    onDateRange?: (r: { from: string; to: string } | null) => void
    showDateRange?: boolean

    /** Multi-select status filter (empty array = all statuses) */
    statuses?: string[]
    onStatuses?: (s: string[]) => void
    /** Override status options (used by Flow 3 with match/mismatch/etc.) */
    statusOptions?: StatusOption[]
    showStatuses?: boolean

    /** Customer search-as-you-type (empty string = no filter) */
    customerQuery?: string
    onCustomerQuery?: (q: string) => void
    showCustomer?: boolean
    customerPlaceholder?: string

    /** Region filter (all = no filter) */
    regionFilter?: Region | 'all'
    onRegionFilter?: (r: Region | 'all') => void
    showRegion?: boolean

    /** Optional right-aligned slot rendered after the Reset button. Used for
        data-action buttons (Sync pill, Resync, Publish-all, etc.) that
        conceptually belong alongside the filters. */
    rightSlot?: ReactNode
}

const INPUT_CLASS = 'px-2.5 py-1.5 text-xs font-medium bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30'

/**
 * Multi-filter bar — date range + status pills + customer search + region.
 * Pattern adapted from CapacityModal (officeworks). Each filter is independent
 * and can be hidden via show* props so the bar works in any flow.
 */
export default function CLCFilterBar({
    dateRange,
    onDateRange,
    showDateRange = true,
    statuses = [],
    onStatuses,
    statusOptions,
    showStatuses = true,
    customerQuery = '',
    onCustomerQuery,
    showCustomer = true,
    customerPlaceholder = 'Search customer…',
    regionFilter = 'all',
    onRegionFilter,
    showRegion = true,
    rightSlot,
}: CLCFilterBarProps) {
    const options: StatusOption[] = statusOptions ?? (Object.keys(STATUS_LABELS) as StatusKey[]).map(k => ({ key: k, label: STATUS_LABELS[k] }))

    const hasAnyFilter = (
        (dateRange !== null && dateRange !== undefined) ||
        statuses.length > 0 ||
        customerQuery.length > 0 ||
        (regionFilter !== undefined && regionFilter !== 'all')
    )

    const toggleStatus = (key: string) => {
        if (!onStatuses) return
        if (statuses.includes(key)) onStatuses(statuses.filter(s => s !== key))
        else onStatuses([...statuses, key])
    }

    const resetAll = () => {
        onDateRange?.(null)
        onStatuses?.([])
        onCustomerQuery?.('')
        onRegionFilter?.('all')
    }

    return (
        // Two-group layout · filters on the left · actions on the right.
        // Each group wraps internally if needed, but they never wrap as a
        // whole · the actions stay aligned with the filters on the same row.
        <div className="flex items-center justify-between gap-3 px-5 py-2.5 border-b border-border bg-muted/10 flex-wrap">
            {/* LEFT · filter inputs */}
            <div className="inline-flex items-center gap-2 flex-wrap min-w-0">
                <FilterIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />

                {showDateRange && onDateRange && (
                    <div className="inline-flex items-center gap-1.5">
                        <input
                            type="date"
                            value={dateRange?.from ?? ''}
                            onChange={e => onDateRange(e.target.value ? { from: e.target.value, to: dateRange?.to ?? e.target.value } : null)}
                            className={INPUT_CLASS}
                            aria-label="From date"
                        />
                        <span className="text-xs text-muted-foreground">→</span>
                        <input
                            type="date"
                            value={dateRange?.to ?? ''}
                            onChange={e => onDateRange(dateRange?.from && e.target.value ? { from: dateRange.from, to: e.target.value } : (e.target.value ? { from: e.target.value, to: e.target.value } : null))}
                            className={INPUT_CLASS}
                            aria-label="To date"
                        />
                    </div>
                )}

                {showStatuses && onStatuses && (
                    <div className="inline-flex items-center gap-1 flex-wrap">
                        {options.map(opt => {
                            const isOn = statuses.includes(opt.key)
                            return (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => toggleStatus(opt.key)}
                                    aria-pressed={isOn}
                                    className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                                        isOn
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-background border border-border text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            )
                        })}
                    </div>
                )}

                {showRegion && onRegionFilter && (
                    <select
                        value={regionFilter}
                        onChange={e => onRegionFilter(e.target.value as Region | 'all')}
                        className={INPUT_CLASS}
                        aria-label="Filter by region"
                    >
                        <option value="all">All regions</option>
                        <option value="ny">{REGION_LABEL.ny} · New York</option>
                        <option value="nj">{REGION_LABEL.nj} · New Jersey</option>
                        <option value="pa">{REGION_LABEL.pa} · Pennsylvania</option>
                    </select>
                )}

                {showCustomer && onCustomerQuery && (
                    <div className="relative">
                        <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={customerQuery}
                            onChange={e => onCustomerQuery(e.target.value)}
                            placeholder={customerPlaceholder}
                            className={`${INPUT_CLASS} pl-7 w-[180px]`}
                            aria-label="Search customer"
                        />
                    </div>
                )}

                {hasAnyFilter && (
                    <button
                        type="button"
                        onClick={resetAll}
                        title="Clear all filters"
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-3 w-3" />
                        Reset
                    </button>
                )}
            </div>

            {/* RIGHT · action cluster · stays right-aligned via outer justify-between */}
            {rightSlot && (
                <div className="inline-flex items-center gap-2 flex-wrap shrink-0">
                    {rightSlot}
                </div>
            )}
        </div>
    )
}
