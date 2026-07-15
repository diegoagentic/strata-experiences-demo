// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Pricing Waterfall
// Phase 13 + Refinement Phase 3 of WRG Demo v6 implementation
//
// Modal that animates the final-proposal price breakdown one row at a time:
//   Product List → JPS Contract -x% → Product Net → Labor → Freight → Total
// Numbers are derived from the live estimate + contract constants instead
// of being hard-coded, so the user can see w2.1 edits ripple through.
//
// After the total lands, a dealer selector + 'Send for Review' CTA is
// revealed. Picking a dealer and clicking Send calls onSendForReview(id).
// ═══════════════════════════════════════════════════════════════════════════════

import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    Transition,
    TransitionChild,
} from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { ArrowRight, Check, ChevronDown, ChevronRight, Receipt, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useDemo } from '../../context/DemoContext'
import type { DealerOption } from './mockData'

interface PricingWaterfallProps {
    isOpen: boolean
    onClose: () => void
    onSendForReview: (dealerId: string) => void
    productList: number
    discount: number
    labor: number
    freight: number
    dealers: DealerOption[]
}

type RowType = 'base' | 'discount' | 'subtotal' | 'addon' | 'total'

interface WaterfallRow {
    label: string
    value: number
    display: string
    type: RowType
}

interface BreakdownLine {
    label: string
    detail?: string
    display: string
    emphasis?: boolean
}

const ROW_STEP_MS = 700

const ROW_STYLES: Record<RowType, string> = {
    base:     'bg-muted/40',
    discount: 'bg-green-500/5 dark:bg-green-500/10 border border-green-500/20',
    subtotal: 'bg-green-500/10 dark:bg-green-500/15 border border-green-500/30',
    addon:    'bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20',
    total:    'bg-primary/5 dark:bg-primary/10 border-2 border-primary/40',
}

const TEXT_STYLES: Record<RowType, string> = {
    base:     'text-foreground',
    discount: 'text-green-700 dark:text-green-400',
    subtotal: 'text-green-700 dark:text-green-400',
    addon:    'text-blue-700 dark:text-blue-400',
    total:    'text-foreground',
}

function formatMoney(n: number, { signed = false } = {}): string {
    const abs = Math.abs(Math.round(n))
    const body = abs.toLocaleString('en-US')
    if (signed && n < 0) return `-$${body}`
    if (signed && n > 0) return `+$${body}`
    return `$${body}`
}

export default function PricingWaterfall({
    isOpen,
    onClose,
    onSendForReview,
    productList,
    discount,
    labor,
    freight,
    dealers,
}: PricingWaterfallProps) {
    const [visibleRows, setVisibleRows] = useState(0)
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const [selectedDealerId, setSelectedDealerId] = useState<string>(
        dealers[0]?.id ?? ''
    )

    const toggleRow = (label: string) => {
        setExpandedRows((prev) => {
            const next = new Set(prev)
            if (next.has(label)) next.delete(label)
            else next.add(label)
            return next
        })
    }

    // Derived waterfall rows (live from props)
    const discountAmount = productList * discount
    const productNet = productList - discountAmount
    const total = productNet + labor + freight
    const discountPct = Math.round(discount * 100)

    const rows: WaterfallRow[] = [
        { label: 'Product List',          value: productList,        display: formatMoney(productList),                       type: 'base' },
        { label: `JPS Contract -${discountPct}%`, value: -discountAmount,    display: formatMoney(-discountAmount, { signed: true }), type: 'discount' },
        { label: 'Product Net',           value: productNet,         display: formatMoney(productNet),                        type: 'subtotal' },
        { label: 'Labor',                 value: labor,              display: formatMoney(labor, { signed: true }),           type: 'addon' },
        { label: 'Freight',               value: freight,            display: formatMoney(freight, { signed: true }),         type: 'addon' },
        { label: 'Total Proposal',        value: total,              display: formatMoney(total),                             type: 'total' },
    ]

    // Breakdown details for each waterfall row. Numbers derived from props
    // (proportional splits) so the sub-totals always reconcile to the row value.
    const getBreakdown = (row: WaterfallRow): BreakdownLine[] | null => {
        if (row.type === 'base') {
            return [
                { label: 'MillerKnoll Canvas workstations', detail: '38 seats · private offices + open plan', display: formatMoney(productList * 0.495) },
                { label: 'OFS Serpentine 12-seat lounge',  detail: 'Family waiting · custom configuration',     display: formatMoney(productList * 0.135) },
                { label: 'HON Ignition 2.0 task chairs',   detail: '119 KD chairs · nursing + staff stations',  display: formatMoney(productList * 0.189) },
                { label: 'Steelcase conference tables',    detail: '4 rooms · height-adjustable',                display: formatMoney(productList * 0.097) },
                { label: 'Accessories + storage',          detail: 'Filing, mobile pedestals, task lighting',    display: formatMoney(productList * 0.084) },
                { label: 'MillerKnoll list total',         display: formatMoney(productList), emphasis: true },
            ]
        }
        if (row.type === 'discount') {
            return [
                { label: 'JPS Master Services Agreement', detail: 'Contract signed Oct 2023 · 38 % standing' },
                { label: 'Applied to MillerKnoll list',    detail: `${formatMoney(productList)} × ${discountPct} %`, display: formatMoney(-discountAmount, { signed: true }) },
                { label: 'Contract discount total',        display: formatMoney(-discountAmount, { signed: true }), emphasis: true },
            ] as BreakdownLine[]
        }
        if (row.type === 'subtotal') {
            return [
                { label: 'List price',          display: formatMoney(productList) },
                { label: 'Contract discount',   display: formatMoney(-discountAmount, { signed: true }) },
                { label: 'Net to client',       display: formatMoney(productNet), emphasis: true },
            ]
        }
        if (row.type === 'addon' && row.label === 'Labor') {
            return [
                { label: 'Installation crew',  detail: '150 h × $95/h · 3 installers over 10 days', display: formatMoney(labor * 0.646) },
                { label: 'Project manager',    detail: '20 h × $160/h · on-site coordination + QA', display: formatMoney(labor * 0.145) },
                { label: 'Site survey',        detail: '8 h × $125/h · pre-install measurements',   display: formatMoney(labor * 0.045) },
                { label: 'Equipment + tools',  detail: 'Dollies, lifts, PPE, consumables',           display: formatMoney(labor * 0.164) },
                { label: 'Labor total',        display: formatMoney(labor, { signed: true }), emphasis: true },
            ]
        }
        if (row.type === 'addon' && row.label === 'Freight') {
            return [
                { label: 'MillerKnoll · Michigan → Texas', detail: 'Full truckload · 2 days transit',    display: formatMoney(freight * 0.553) },
                { label: 'OFS · Indiana → Texas',           detail: 'LTL · Serpentine lounge',            display: formatMoney(freight * 0.269) },
                { label: 'HON + Steelcase + misc',         detail: 'Consolidated LTL · 1 day transit',   display: formatMoney(freight * 0.178) },
                { label: 'Freight total',                  display: formatMoney(freight, { signed: true }), emphasis: true },
            ]
        }
        if (row.type === 'total') {
            return [
                { label: 'Product net',  display: formatMoney(productNet) },
                { label: 'Labor',        display: formatMoney(labor, { signed: true }) },
                { label: 'Freight',      display: formatMoney(freight, { signed: true }) },
                { label: 'Total proposal', display: formatMoney(total), emphasis: true },
            ]
        }
        return null
    }

    // Replay the animation every time the modal opens
    useEffect(() => {
        if (!isOpen) {
            setVisibleRows(0)
            setExpandedRows(new Set())
            setSelectedDealerId(dealers[0]?.id ?? '')
            return
        }

        const timers: ReturnType<typeof setTimeout>[] = []
        for (let i = 0; i < rows.length; i++) {
            timers.push(setTimeout(() => setVisibleRows(i + 1), (i + 1) * ROW_STEP_MS))
        }
        return () => timers.forEach(clearTimeout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    const done = visibleRows >= rows.length
    const selectedDealer =
        dealers.find((d) => d.id === selectedDealerId) ?? dealers[0]
    const { isDemoActive, isSidebarCollapsed } = useDemo()
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed
    const offsetClass = sidebarExpanded ? 'lg:left-80' : ''

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className={clsx('fixed inset-0 bg-zinc-950/70 backdrop-blur-sm', offsetClass)} />
                </TransitionChild>

                <div className={clsx('fixed inset-0 flex items-center justify-center p-4', offsetClass)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-xl bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="flex items-start gap-4 px-6 py-5 border-b border-border">
                                <div className="p-3 rounded-xl bg-primary text-primary-foreground shrink-0">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-base font-bold text-foreground">
                                        Quote Assembly
                                    </DialogTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        MillerKnoll quote · JPS contract discount · labor · freight
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Waterfall rows */}
                            <div className="p-6 space-y-2 max-h-[55vh] overflow-y-auto scrollbar-minimal">
                                {rows.map((row, i) => {
                                    const visible = i < visibleRows
                                    const isTotal = row.type === 'total'
                                    const expanded = expandedRows.has(row.label)
                                    const breakdown = getBreakdown(row)
                                    return (
                                        <div
                                            key={row.label}
                                            className={clsx(
                                                'transition-all duration-500',
                                                visible
                                                    ? 'opacity-100 translate-y-0'
                                                    : 'opacity-0 translate-y-2'
                                            )}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleRow(row.label)}
                                                disabled={!breakdown || !visible}
                                                className={clsx(
                                                    ROW_STYLES[row.type],
                                                    'w-full flex items-center justify-between rounded-xl text-left transition-colors',
                                                    isTotal ? 'px-5 py-4 mt-3' : 'px-4 py-3',
                                                    breakdown && visible
                                                        ? 'hover:brightness-110 cursor-pointer'
                                                        : 'cursor-default',
                                                )}
                                                aria-expanded={expanded}
                                            >
                                                <span className="flex items-center gap-2 min-w-0">
                                                    {breakdown && (
                                                        <ChevronRight
                                                            className={clsx(
                                                                'w-3.5 h-3.5 shrink-0 transition-transform duration-200',
                                                                TEXT_STYLES[row.type],
                                                                expanded && 'rotate-90'
                                                            )}
                                                            aria-hidden
                                                        />
                                                    )}
                                                    <span
                                                        className={clsx(
                                                            TEXT_STYLES[row.type],
                                                            isTotal
                                                                ? 'text-xs font-bold uppercase tracking-wider'
                                                                : 'text-xs font-medium'
                                                        )}
                                                    >
                                                        {row.label}
                                                    </span>
                                                </span>
                                                <span
                                                    className={clsx(
                                                        TEXT_STYLES[row.type],
                                                        isTotal
                                                            ? 'text-2xl font-black tabular-nums'
                                                            : 'text-sm font-bold tabular-nums'
                                                    )}
                                                >
                                                    {row.display}
                                                </span>
                                            </button>

                                            {/* Expanded breakdown */}
                                            {breakdown && expanded && (
                                                <div className="mt-1.5 ml-4 pl-4 border-l-2 border-border space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    {breakdown.map((line, li) => (
                                                        <div
                                                            key={`${row.label}-${li}-${line.label}`}
                                                            className={clsx(
                                                                'flex items-baseline justify-between gap-3 rounded-md px-3 py-1.5',
                                                                line.emphasis
                                                                    ? 'bg-muted/40 border-t border-border mt-1'
                                                                    : 'bg-transparent'
                                                            )}
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <p
                                                                    className={clsx(
                                                                        'text-[11px] leading-tight truncate',
                                                                        line.emphasis
                                                                            ? 'font-bold text-foreground'
                                                                            : 'font-semibold text-foreground'
                                                                    )}
                                                                >
                                                                    {line.label}
                                                                </p>
                                                                {line.detail && (
                                                                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">
                                                                        {line.detail}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {line.display && (
                                                                <span
                                                                    className={clsx(
                                                                        'shrink-0 text-[11px] tabular-nums',
                                                                        line.emphasis
                                                                            ? 'font-black text-foreground'
                                                                            : 'font-semibold text-muted-foreground'
                                                                    )}
                                                                >
                                                                    {line.display}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Footer — dealer picker + Send CTA (revealed after the total lands) */}
                            <div
                                className={clsx(
                                    'flex items-center gap-3 px-6 py-4 border-t border-border bg-muted/20 transition-all duration-500',
                                    done
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-2 pointer-events-none'
                                )}
                            >
                                {/* Dealer picker */}
                                <Listbox
                                    value={selectedDealerId}
                                    onChange={setSelectedDealerId}
                                    disabled={!done}
                                >
                                    <div className="relative flex-1 min-w-0">
                                        <ListboxButton className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-card dark:bg-zinc-900 border border-border hover:border-primary/60 transition-colors text-left focus:outline-none focus:ring-1 focus:ring-primary">
                                            {selectedDealer && (
                                                <>
                                                    <img
                                                        src={selectedDealer.photo}
                                                        alt={selectedDealer.name}
                                                        className="w-7 h-7 rounded-full object-cover shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-foreground leading-tight truncate">
                                                            {selectedDealer.name}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground leading-tight truncate">
                                                            {selectedDealer.role}
                                                        </p>
                                                    </div>
                                                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden />
                                                </>
                                            )}
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
                                            <ListboxOptions className="absolute bottom-full left-0 right-0 mb-2 z-20 overflow-hidden rounded-xl bg-card dark:bg-zinc-800 border border-border shadow-xl py-1 focus:outline-none">
                                                {dealers.map((dealer) => (
                                                    <ListboxOption
                                                        key={dealer.id}
                                                        value={dealer.id}
                                                        className={({ focus }) =>
                                                            clsx(
                                                                'relative cursor-pointer select-none px-3 py-2 transition-colors flex items-center gap-2',
                                                                focus && 'bg-zinc-100 dark:bg-zinc-900'
                                                            )
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <img
                                                                    src={dealer.photo}
                                                                    alt={dealer.name}
                                                                    className="w-7 h-7 rounded-full object-cover shrink-0"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-semibold text-foreground leading-tight truncate">
                                                                        {dealer.name}
                                                                    </p>
                                                                    <p className="text-[10px] text-muted-foreground leading-tight truncate">
                                                                        {dealer.role}
                                                                    </p>
                                                                </div>
                                                                {dealer.badge && !selected && (
                                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                                                                        {dealer.badge}
                                                                    </span>
                                                                )}
                                                                {selected && (
                                                                    <Check className="w-3.5 h-3.5 text-foreground dark:text-primary shrink-0" aria-hidden />
                                                                )}
                                                            </>
                                                        )}
                                                    </ListboxOption>
                                                ))}
                                            </ListboxOptions>
                                        </Transition>
                                    </div>
                                </Listbox>

                                {/* Send CTA */}
                                <button
                                    onClick={() => onSendForReview(selectedDealerId)}
                                    disabled={!done || !selectedDealerId}
                                    className="shrink-0 flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Send for Review
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
