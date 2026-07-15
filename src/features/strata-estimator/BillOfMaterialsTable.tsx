// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Bill of Materials Table
// Phase 6 of WRG Demo v6 implementation
//
// Editable table of LineItems. Inline selects for category / subcategory,
// textarea for description, number for qty. AI Import + AI Refine buttons
// in the header trigger the Vision Engine modal (Phase 8).
// ═══════════════════════════════════════════════════════════════════════════════

import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    Transition,
} from '@headlessui/react'
import { Fragment } from 'react'
import {
    AlertTriangle,
    Check,
    ChevronDown,
    FileText,
    Plus,
    Sparkles,
    Trash2,
    Wand2,
} from 'lucide-react'
import { clsx } from 'clsx'
import type { AiConfidence } from './mockData'
import type { ConfigState, LineItem } from './types'

// ── Inline listbox: accessible select that lives inside a table cell ─────────

interface InlineOption {
    id: string
    label: string
}

interface InlineListboxProps {
    value: string
    onChange: (value: string) => void
    options: InlineOption[]
    placeholder?: string
    valueClassName?: string
    disabled?: boolean
}

function InlineListbox({
    value,
    onChange,
    options,
    placeholder = '—',
    valueClassName = 'text-foreground font-medium',
    disabled = false,
}: InlineListboxProps) {
    const selected = options.find((o) => o.id === value)
    return (
        <Listbox value={value} onChange={onChange} disabled={disabled}>
            <div className="relative">
                <ListboxButton
                    className={clsx(
                        'group w-full flex items-center justify-between gap-1 px-1.5 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary',
                        !disabled && 'cursor-pointer hover:bg-muted/50',
                        disabled && 'cursor-default',
                        valueClassName
                    )}
                >
                    <span className="block truncate text-left">
                        {selected ? selected.label : placeholder}
                    </span>
                    {!disabled && (
                        <ChevronDown
                            className="w-3 h-3 text-muted-foreground shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                            aria-hidden
                        />
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
                    <ListboxOptions className="absolute z-30 mt-1 max-h-60 w-max min-w-full overflow-auto rounded-xl bg-card dark:bg-zinc-800 border border-border shadow-xl py-1 text-xs focus:outline-none">
                        {options.map((option) => (
                            <ListboxOption
                                key={option.id}
                                value={option.id}
                                className={({ focus, selected }) =>
                                    clsx(
                                        'relative cursor-pointer select-none py-1.5 pl-8 pr-3 transition-colors',
                                        focus && 'bg-zinc-100 dark:bg-zinc-900',
                                        selected
                                            ? 'text-foreground font-semibold'
                                            : 'text-muted-foreground'
                                    )
                                }
                            >
                                {({ selected }) => (
                                    <>
                                        <span className="block truncate">{option.label}</span>
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
    )
}

interface BillOfMaterialsTableProps {
    lineItems: LineItem[]
    config: ConfigState
    onUpdateItem: (id: string, field: keyof LineItem, value: string | number) => void
    onAddItem: () => void
    onRemoveItem: (id: string) => void
    onAiImport: () => void
    onAiRefine: () => void
    hasLastFile: boolean
    readOnly?: boolean
    /** When true, new rows fade + slide in with a staggered delay — used by the w2.1 AI-import beat */
    staggerImport?: boolean
    /** Row ids that should render with an amber warning ring + badge */
    flaggedRowIds?: string[]
    /** Inline hint shown in the header while the AI is importing */
    importStatus?: string | null
    /** When set, every other row is dimmed to draw attention to this one (used by w2.2) */
    focusedRowId?: string | null
    /** Optional map of item id → AI confidence (HIGH / LOW) */
    confidenceMap?: Record<string, AiConfidence>
    /** Sticky scope-breach badge displayed in the header after the transient alert fades */
    scopeBreachBadge?: { category: string; count: number; limit: number } | null
    /**
     * Number of rows that have finished the Map-to-Category beat. Rows with
     * index ≥ this value show a TEMPLATE / FALLBACK chip instead of the real
     * category listbox. Defaults to Infinity (all rows considered resolved).
     */
    mappingResolvedCount?: number
}

export default function BillOfMaterialsTable({
    lineItems,
    config,
    onUpdateItem,
    onAddItem,
    onRemoveItem,
    onAiImport,
    onAiRefine,
    hasLastFile,
    readOnly = false,
    staggerImport = false,
    flaggedRowIds = [],
    importStatus = null,
    focusedRowId = null,
    confidenceMap,
    scopeBreachBadge = null,
    mappingResolvedCount = Infinity,
}: BillOfMaterialsTableProps) {
    const categories = Object.values(config.categories)

    return (
        <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider whitespace-nowrap">
                        Bill of Materials
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        · {lineItems.length} items
                    </span>
                    {scopeBreachBadge && (
                        <span
                            className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider whitespace-nowrap"
                            title={`Scope breach · ${scopeBreachBadge.count} ${scopeBreachBadge.category} exceeds the ${scopeBreachBadge.limit}-unit Delivery Pricer limit (override logged)`}
                        >
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            {scopeBreachBadge.count} / {scopeBreachBadge.limit}
                        </span>
                    )}
                    {importStatus && (
                        <span className="ml-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 truncate">
                            <Sparkles className="w-3 h-3 animate-pulse shrink-0" />
                            {importStatus}
                        </span>
                    )}
                </div>

                {!readOnly && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={onAiImport}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Import
                    </button>

                    {hasLastFile && (
                        <button
                            onClick={onAiRefine}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                        >
                            <Wand2 className="w-3.5 h-3.5" />
                            AI Refine
                        </button>
                    )}

                    <button
                        onClick={onAddItem}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Line
                    </button>
                </div>
                )}
            </div>

            {/* Table · constrained height with internal scroll, sticky header */}
            <div className="max-h-[420px] overflow-y-auto overflow-x-auto scrollbar-minimal">
                <table className="w-full">
                    <thead className="sticky top-0 z-10 bg-card dark:bg-zinc-800 shadow-[0_1px_0_0] shadow-border">
                        <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/40">
                            <th className="text-left px-6 py-3 w-[18%]">Group</th>
                            <th className="text-left px-4 py-3 w-[22%]">Product Line</th>
                            <th className="text-left px-4 py-3">Description</th>
                            <th className="text-right px-4 py-3 w-[80px]">QTY</th>
                            <th className="text-right px-6 py-3 w-[48px]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {lineItems.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-xs text-muted-foreground">
                                    No line items yet. Use AI Import or Add Line to get started.
                                </td>
                            </tr>
                        )}
                        {lineItems.map((item, index) => {
                            const category = config.categories[item.categoryId]
                            const subcategories = category
                                ? Object.values(category.subcategories ?? {})
                                : []
                            const isFlagged = flaggedRowIds.includes(item.id)
                            const isFocused = focusedRowId === item.id
                            const isDimmed = focusedRowId !== null && !isFocused
                            const isMapping = index >= mappingResolvedCount
                            const rowConfidence = confidenceMap?.[item.id]
                            const chipIsFallback = rowConfidence === 'LOW'
                            const staggerStyle = staggerImport
                                ? {
                                      animationDelay: `${index * 80}ms`,
                                      animationFillMode: 'both' as const,
                                  }
                                : undefined

                            return (
                                <tr
                                    key={item.id}
                                    data-row-id={item.id}
                                    className={clsx(
                                        'transition-all duration-500',
                                        !isFlagged && !isDimmed && 'hover:bg-muted/30',
                                        isFlagged && 'bg-amber-500/5 dark:bg-amber-500/10 ring-1 ring-inset ring-amber-500/40',
                                        isDimmed && 'opacity-30',
                                        isFocused && !isFlagged && 'bg-primary/5 ring-1 ring-inset ring-primary/40',
                                        staggerImport && 'animate-in fade-in slide-in-from-left-1 duration-300'
                                    )}
                                    style={staggerStyle}
                                >
                                    {/* Group (category) — TEMPLATE/FALLBACK chip during the mapping beat */}
                                    <td className="px-6 py-3">
                                        {isMapping ? (
                                            <div
                                                className={clsx(
                                                    'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider animate-pulse',
                                                    chipIsFallback
                                                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                                        : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30'
                                                )}
                                                title={
                                                    chipIsFallback
                                                        ? 'LLM fallback in progress — product code didn\'t match template'
                                                        : 'Template lookup in progress — matched product code to category'
                                                }
                                            >
                                                <Sparkles className="w-3 h-3 shrink-0" />
                                                {chipIsFallback ? 'Fallback' : 'Template'}
                                            </div>
                                        ) : (
                                            <InlineListbox
                                                value={item.categoryId}
                                                onChange={(v) =>
                                                    onUpdateItem(item.id, 'categoryId', v)
                                                }
                                                options={categories.map((c) => ({
                                                    id: c.id,
                                                    label: c.label,
                                                }))}
                                                disabled={readOnly}
                                            />
                                        )}
                                    </td>

                                    {/* Product Line (subcategory) */}
                                    <td className="px-4 py-3">
                                        <InlineListbox
                                            value={item.subCategoryId}
                                            onChange={(v) =>
                                                onUpdateItem(item.id, 'subCategoryId', v)
                                            }
                                            placeholder="— default rate —"
                                            valueClassName="text-muted-foreground"
                                            options={[
                                                { id: '', label: '— default rate —' },
                                                ...subcategories.map((s) => ({
                                                    id: s.id,
                                                    label: s.label,
                                                })),
                                            ]}
                                            disabled={readOnly}
                                        />
                                    </td>

                                    {/* Description */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-start gap-2">
                                            {confidenceMap?.[item.id] && !isMapping && (
                                                <span
                                                    className="shrink-0 mt-1.5 flex items-center gap-1"
                                                    title={
                                                        confidenceMap[item.id] === 'HIGH'
                                                            ? 'High confidence — template-parsed'
                                                            : 'Low confidence — LLM fallback, review recommended'
                                                    }
                                                >
                                                    <span
                                                        className={clsx(
                                                            'block w-1.5 h-1.5 rounded-full',
                                                            confidenceMap[item.id] === 'HIGH'
                                                                ? 'bg-green-500'
                                                                : 'bg-amber-500'
                                                        )}
                                                        aria-hidden
                                                    />
                                                    {confidenceMap[item.id] === 'LOW' && (
                                                        <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                                            Low
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                            <textarea
                                                value={item.description}
                                                onChange={(e) =>
                                                    onUpdateItem(item.id, 'description', e.target.value)
                                                }
                                                rows={1}
                                                readOnly={readOnly}
                                                className="flex-1 min-w-0 bg-transparent text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5"
                                            />
                                        </div>
                                    </td>

                                    {/* QTY */}
                                    <td className="px-4 py-3 text-right">
                                        <input
                                            type="number"
                                            min={0}
                                            value={item.quantity}
                                            onChange={(e) =>
                                                onUpdateItem(
                                                    item.id,
                                                    'quantity',
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                            readOnly={readOnly}
                                            className="w-16 bg-transparent text-xs text-foreground font-semibold text-right focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5"
                                        />
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-3 text-right">
                                        {!readOnly && (
                                            <button
                                                onClick={() => onRemoveItem(item.id)}
                                                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                                title="Remove line"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
