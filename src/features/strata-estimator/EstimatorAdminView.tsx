// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Config / Admin View
// Phase 11 of WRG Demo v6 implementation
//
// Admin panel for rates, default margin, and category / subcategory rates.
// Top row: default margin slider + labor hourly costs (non-union / union).
// Below: grid of category cards, each showing editable subcategory rates.
// Changes flow up to the Shell's ConfigState and propagate to the calc loop.
// ═══════════════════════════════════════════════════════════════════════════════

import { Plus, Settings2, Trash2 } from 'lucide-react'
import type { Category, ConfigState } from './types'

interface EstimatorAdminViewProps {
    config: ConfigState
    onConfigChange: (config: ConfigState) => void
}

export default function EstimatorAdminView({
    config,
    onConfigChange,
}: EstimatorAdminViewProps) {
    const marginPct = Math.round((config.defaultMargin ?? 0) * 100)

    const setMargin = (value: number) => {
        onConfigChange({ ...config, defaultMargin: value })
    }

    const setRate = (key: 'NON_UNION' | 'UNION', value: number) => {
        onConfigChange({
            ...config,
            rates: { ...config.rates, [key]: value },
        })
    }

    const updateCategory = (categoryId: string, updated: Category) => {
        onConfigChange({
            ...config,
            categories: { ...config.categories, [categoryId]: updated },
        })
    }

    return (
        <div className="pt-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Administrative Logic
                </h2>
            </div>

            {/* Top row: margin + hourly costs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Margin slider */}
                <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Default Margin
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Applied to cost → sales price
                            </p>
                        </div>
                        <span className="text-3xl font-bold text-foreground dark:text-primary tabular-nums">
                            {marginPct}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min={10}
                        max={60}
                        step={1}
                        value={marginPct}
                        onChange={(e) => setMargin(parseFloat(e.target.value) / 100)}
                        className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>10%</span>
                        <span>35%</span>
                        <span>60%</span>
                    </div>
                </div>

                {/* Hourly costs */}
                <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm p-6">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4">
                        Base Labor Hourly Costs
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Non-Union
                            </label>
                            <div className="mt-1.5 flex items-baseline gap-1 border-b border-border focus-within:border-primary pb-1">
                                <span className="text-sm text-muted-foreground">$</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={config.rates.NON_UNION}
                                    onChange={(e) =>
                                        setRate('NON_UNION', parseFloat(e.target.value) || 0)
                                    }
                                    className="flex-1 bg-transparent text-2xl font-bold text-foreground focus:outline-none"
                                />
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                                    /hr
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Union
                            </label>
                            <div className="mt-1.5 flex items-baseline gap-1 border-b border-border focus-within:border-primary pb-1">
                                <span className="text-sm text-muted-foreground">$</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={config.rates.UNION}
                                    onChange={(e) =>
                                        setRate('UNION', parseFloat(e.target.value) || 0)
                                    }
                                    className="flex-1 bg-transparent text-2xl font-bold text-foreground focus:outline-none"
                                />
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                                    /hr
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.values(config.categories).map((category) => (
                    <CategoryConfigCard
                        key={category.id}
                        category={category}
                        onChange={(c) => updateCategory(category.id, c)}
                    />
                ))}
            </div>
        </div>
    )
}

// ── CategoryConfigCard (inline sub-component) ────────────────────────────────

interface CategoryConfigCardProps {
    category: Category
    onChange: (category: Category) => void
}

function CategoryConfigCard({ category, onChange }: CategoryConfigCardProps) {
    const subcategories = Object.values(category.subcategories ?? {})

    const setBaseRate = (rate: number) => {
        onChange({ ...category, rate })
    }

    const setSubRate = (subId: string, rate: number) => {
        const sub = category.subcategories[subId]
        if (!sub) return
        onChange({
            ...category,
            subcategories: {
                ...category.subcategories,
                [subId]: { ...sub, rate },
            },
        })
    }

    const setSubLabel = (subId: string, label: string) => {
        const sub = category.subcategories[subId]
        if (!sub) return
        onChange({
            ...category,
            subcategories: {
                ...category.subcategories,
                [subId]: { ...sub, label },
            },
        })
    }

    const addSubcategory = () => {
        const id = `SUB_${Date.now()}`
        onChange({
            ...category,
            subcategories: {
                ...category.subcategories,
                [id]: { id, label: 'New subcategory', rate: category.rate },
            },
        })
    }

    const removeSubcategory = (subId: string) => {
        const next = { ...category.subcategories }
        delete next[subId]
        onChange({ ...category, subcategories: next })
    }

    return (
        <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-foreground truncate">
                        {category.label}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                        {subcategories.length} product lines
                    </p>
                </div>
                <div className="flex items-baseline gap-0.5 shrink-0">
                    <input
                        type="number"
                        step={0.05}
                        min={0}
                        value={category.rate}
                        onChange={(e) => setBaseRate(parseFloat(e.target.value) || 0)}
                        className="w-14 bg-transparent text-sm font-semibold text-foreground dark:text-primary text-right focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                    />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        hrs
                    </span>
                </div>
            </div>

            <div className="space-y-1.5">
                {subcategories.map((sub) => (
                    <div
                        key={sub.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/40 transition-colors"
                    >
                        <input
                            type="text"
                            value={sub.label}
                            onChange={(e) => setSubLabel(sub.id, e.target.value)}
                            className="flex-1 min-w-0 bg-transparent text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5"
                        />
                        <input
                            type="number"
                            step={0.05}
                            min={0}
                            value={sub.rate}
                            onChange={(e) => setSubRate(sub.id, parseFloat(e.target.value) || 0)}
                            className="w-14 bg-transparent text-xs font-semibold text-foreground text-right focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5"
                        />
                        <button
                            onClick={() => removeSubcategory(sub.id)}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                            title="Remove subcategory"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addSubcategory}
                className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60 transition-colors"
            >
                <Plus className="w-3 h-3" />
                Add Subcategory
            </button>
        </div>
    )
}
