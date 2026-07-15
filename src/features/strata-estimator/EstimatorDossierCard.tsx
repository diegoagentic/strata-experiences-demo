// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Project Dossier (compact filter bar)
//
// Single-row strip with three combobox filters: Client, ZIP, Site. Each
// field filters the saved-estimates list as the user types and shows the
// full list when the chevron is clicked. Picking a row loads that estimate
// into the active project (via onLoadPreset → Shell.handleLoadEstimate).
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, Search, User } from 'lucide-react'
import { clsx } from 'clsx'
import type { Customer, SavedEstimate } from './types'

interface EstimatorDossierCardProps {
    customer: Customer
    onCustomerChange: (customer: Customer) => void
    onRateLookup: () => void
    isSearchingRates?: boolean
    presets?: SavedEstimate[]
    onLoadPreset?: (estimate: SavedEstimate) => void
    readOnly?: boolean
    /** Optional slot rendered at the far right of the dossier row (audit trail trigger, etc.) */
    rightSlot?: ReactNode
}

type Field = 'client' | 'zip' | 'site'

interface FilterFieldProps {
    label: string
    value: string
    placeholder: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onChange: (value: string) => void
    onPick: (estimate: SavedEstimate) => void
    presets: SavedEstimate[]
    getOptionLabel: (e: SavedEstimate) => string
    getOptionSub: (e: SavedEstimate) => string
    readOnly?: boolean
    valueClassName?: string
    inputClassName?: string
    width?: string
}

function FilterField({
    label,
    value,
    placeholder,
    isOpen,
    onOpenChange,
    onChange,
    onPick,
    presets,
    getOptionLabel,
    getOptionSub,
    valueClassName,
    inputClassName,
    width = 'flex-1 min-w-[160px]',
    readOnly = false,
}: FilterFieldProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    // Filter the presets by current value (substring match on the option label)
    const filtered = useMemo(() => {
        const q = value.trim().toLowerCase()
        if (!q) return presets
        return presets.filter((e) => getOptionLabel(e).toLowerCase().includes(q))
    }, [presets, value, getOptionLabel])

    // Click outside → close
    useEffect(() => {
        if (!isOpen) return
        const handle = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                onOpenChange(false)
            }
        }
        document.addEventListener('mousedown', handle)
        return () => document.removeEventListener('mousedown', handle)
    }, [isOpen, onOpenChange])

    return (
        <div ref={containerRef} className={clsx('relative flex items-baseline gap-2', width)}>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                {label}
            </label>
            <input
                type="text"
                value={value}
                readOnly={readOnly}
                onChange={(e) => {
                    if (readOnly) return
                    onChange(e.target.value)
                    if (!isOpen) onOpenChange(true)
                }}
                onFocus={() => {
                    if (!readOnly) onOpenChange(true)
                }}
                placeholder={placeholder}
                className={clsx(
                    'flex-1 min-w-0 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded px-1',
                    valueClassName ?? 'font-semibold text-foreground',
                    inputClassName,
                    readOnly && 'cursor-default'
                )}
            />
            {!readOnly && (
                <button
                    type="button"
                    onClick={() => onOpenChange(!isOpen)}
                    className="shrink-0 p-1 -ml-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                    title={`Show all ${label.toLowerCase()} presets`}
                >
                    <ChevronDown
                        className={clsx(
                            'w-3.5 h-3.5 transition-transform',
                            isOpen && 'rotate-180'
                        )}
                    />
                </button>
            )}

            {/* Dropdown */}
            {!readOnly && isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-card dark:bg-zinc-800 rounded-xl border border-border shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-2 border-b border-border">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            {filtered.length} preset{filtered.length === 1 ? '' : 's'}
                        </p>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                                No matches
                            </div>
                        ) : (
                            filtered.map((est) => (
                                <button
                                    key={est.id}
                                    type="button"
                                    onClick={() => {
                                        onPick(est)
                                        onOpenChange(false)
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors flex flex-col gap-0.5"
                                >
                                    <span className="text-xs font-semibold text-foreground truncate">
                                        {getOptionLabel(est)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground truncate">
                                        {getOptionSub(est)}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function EstimatorDossierCard({
    customer,
    onCustomerChange,
    onRateLookup,
    isSearchingRates = false,
    presets = [],
    onLoadPreset,
    readOnly = false,
    rightSlot,
}: EstimatorDossierCardProps) {
    const [openField, setOpenField] = useState<Field | null>(null)

    const setField = (field: Field) => (open: boolean) => {
        setOpenField(open ? field : null)
    }

    const handlePick = (est: SavedEstimate) => {
        if (onLoadPreset) {
            onLoadPreset(est)
        } else {
            // Fallback: just update the customer fields
            onCustomerChange(est.customer)
        }
    }

    return (
        <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm px-5 py-3 relative">
            <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap">

                {/* Title */}
                <div className="flex items-center gap-2 shrink-0 pr-4 border-r border-border">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        Project Dossier
                    </h2>
                </div>

                {/* Client filter */}
                <FilterField
                    label="Client"
                    value={customer.name}
                    placeholder="Client name…"
                    isOpen={openField === 'client'}
                    onOpenChange={setField('client')}
                    onChange={(v) => onCustomerChange({ ...customer, name: v })}
                    onPick={handlePick}
                    presets={presets}
                    getOptionLabel={(e) => e.customer.name}
                    getOptionSub={(e) =>
                        `${e.customer.zipCode} · ${e.customer.address}`
                    }
                    readOnly={readOnly}
                />

                {/* ZIP filter */}
                <FilterField
                    label="ZIP"
                    value={customer.zipCode}
                    placeholder="00000"
                    isOpen={openField === 'zip'}
                    onOpenChange={setField('zip')}
                    onChange={(v) =>
                        onCustomerChange({ ...customer, zipCode: v.slice(0, 5) })
                    }
                    onPick={handlePick}
                    presets={presets}
                    getOptionLabel={(e) => e.customer.zipCode}
                    getOptionSub={(e) => e.customer.name}
                    valueClassName="font-semibold text-foreground dark:text-primary"
                    width="w-[140px]"
                    readOnly={readOnly}
                />

                {/* Rate lookup button (hidden in read-only mode) */}
                {!readOnly && (
                    <button
                        onClick={onRateLookup}
                        disabled={isSearchingRates}
                        className="shrink-0 p-1.5 -ml-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                        title="Lookup labor rates for this ZIP"
                    >
                        <Search className="w-3.5 h-3.5" />
                    </button>
                )}

                {/* Site filter */}
                <FilterField
                    label="Site"
                    value={customer.address}
                    placeholder="Address…"
                    isOpen={openField === 'site'}
                    onOpenChange={setField('site')}
                    onChange={(v) => onCustomerChange({ ...customer, address: v })}
                    onPick={handlePick}
                    presets={presets}
                    getOptionLabel={(e) => e.customer.address}
                    getOptionSub={(e) =>
                        `${e.customer.name} · ${e.customer.zipCode}`
                    }
                    valueClassName="text-muted-foreground"
                    width="flex-1 min-w-[200px]"
                    readOnly={readOnly}
                />

                {/* Right slot — audit trail trigger, etc. */}
                {rightSlot && (
                    <div className="shrink-0 pl-3 ml-1 border-l border-border">
                        {rightSlot}
                    </div>
                )}
            </div>
        </div>
    )
}
