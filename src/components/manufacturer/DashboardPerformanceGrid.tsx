/**
 * DashboardPerformanceGrid · KPI dashboard (Wendy item 11)
 *
 * Tracks Sales · Operations & Accounting · Customer Experience (incl. financial)
 * KPIs as a metrics-vs-target grid (value + target + status + progress bar +
 * period sub-stats), plus a row of charts (sales trend · quote pipeline · AR
 * aging). Data is grounded in the project's existing KPI numbers.
 */

import { useState, useEffect, useMemo, Fragment } from 'react'
import { Menu, MenuButton, MenuItems, MenuItem, Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { Eye, EyeOff, ArrowUp, ArrowDown, Filter, LayoutList, ChevronDown } from 'lucide-react'
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
    BarChart, Bar, Cell,
} from 'recharts'
import StatusBadge from '../shared/StatusBadge'

export type KpiStatus = 'on' | 'below' | 'watch'

export interface KpiMetric {
    label: string
    value: string
    delta?: string
    deltaUp?: boolean
    /** 0-100 normalized fill + target for the progress bar */
    barValue: number
    barTarget: number
    /** lower-is-better metrics (AR>30d, DSO, response time) fill toward the target */
    status: KpiStatus
    sub: { label: string; value: string }[]
}

export interface KpiGroup {
    id: string
    label: string
    hint: string
    metrics: KpiMetric[]
}

// ── Grounded KPI data (from KPIDashboardGrid + performanceMetricsByPeriod + AR) ──
export const KPI_GROUPS: KpiGroup[] = [
    {
        id: 'sales', label: 'Sales', hint: 'Top-line + pipeline',
        metrics: [
            { label: 'Dollars sold', value: '$2.84M', delta: '+12.4%', deltaUp: true, barValue: 95, barTarget: 100, status: 'watch', sub: [{ label: 'Target', value: '$3.0M' }, { label: 'Prior wk', value: '$2.53M' }, { label: 'MTD', value: '$11.4M' }] },
            { label: 'Quotes', value: '47', delta: '+9', deltaUp: true, barValue: 100, barTarget: 85, status: 'on', sub: [{ label: 'Target', value: '40' }, { label: 'Prior wk', value: '38' }, { label: 'RFQ pend', value: '12' }] },
            { label: 'Quote → Order', value: '38%', delta: '+3pp', deltaUp: true, barValue: 38, barTarget: 35, status: 'on', sub: [{ label: 'Target', value: '35%' }, { label: 'Prior wk', value: '35%' }, { label: 'Conv', value: 'PO' }] },
            { label: 'Backlog', value: '$1.62M', delta: '+8.1%', deltaUp: true, barValue: 92, barTarget: 100, status: 'watch', sub: [{ label: 'Open', value: '34 ord' }, { label: 'Prior wk', value: '$1.50M' }, { label: 'Avg/ord', value: '$48K' }] },
        ],
    },
    {
        id: 'ops', label: 'Operations & Accounting', hint: 'Fulfillment + working capital',
        metrics: [
            { label: 'On-time delivery', value: '91.5%', delta: '+1.8pp', deltaUp: true, barValue: 91.5, barTarget: 90, status: 'on', sub: [{ label: 'Target', value: '90%' }, { label: 'Prior wk', value: '89.7%' }, { label: '7-day', value: 'rolling' }] },
            { label: 'Dollars shipped / day', value: '$148K', delta: '+5.2%', deltaUp: true, barValue: 99, barTarget: 100, status: 'watch', sub: [{ label: 'Target', value: '$150K' }, { label: 'Prior wk', value: '$141K' }, { label: 'WTD', value: '$3.1M' }] },
            { label: 'AR > 30 days', value: '$84K', delta: '-12.4%', deltaUp: false, barValue: 84, barTarget: 100, status: 'on', sub: [{ label: 'Ceiling', value: '$100K' }, { label: 'Prior wk', value: '$96K' }, { label: 'Accts', value: '3 past due' }] },
            { label: 'DSO', value: '38d', delta: '-3d', deltaUp: false, barValue: 95, barTarget: 100, status: 'on', sub: [{ label: 'Target', value: '≤40d' }, { label: 'Prior', value: '41d' }, { label: 'Days', value: 'sales out' }] },
        ],
    },
    {
        id: 'cx', label: 'Customer Experience', hint: 'Accuracy + responsiveness',
        metrics: [
            { label: 'Order accuracy', value: '94.7%', delta: '-0.3pp', deltaUp: false, barValue: 94.7, barTarget: 95, status: 'watch', sub: [{ label: 'Target', value: '95%' }, { label: 'Prior wk', value: '95.0%' }, { label: 'Match', value: 'PO-vs-Ack' }] },
            { label: 'Response time', value: '4.2h', delta: '-0.8h', deltaUp: false, barValue: 84, barTarget: 100, status: 'on', sub: [{ label: 'Target', value: '≤5.0h' }, { label: 'Prior', value: '5.0h' }, { label: 'RFQ', value: '→ quote' }] },
            { label: 'Discrepancy resolution', value: '45%', delta: '+5pp', deltaUp: true, barValue: 45, barTarget: 80, status: 'below', sub: [{ label: 'Target', value: '80%' }, { label: 'Prior', value: '40%' }, { label: 'Auto', value: 'cleared' }] },
            { label: 'NPS (proxy)', value: '+42', delta: '+6', deltaUp: true, barValue: 71, barTarget: 70, status: 'on', sub: [{ label: 'Target', value: '+40' }, { label: 'Prior', value: '+36' }, { label: 'Dealer', value: 'sat.' }] },
        ],
    },
]

const STATUS_META: Record<KpiStatus, { label: string; tone: 'success' | 'warning' | 'danger'; bar: string }> = {
    on: { label: 'On Target', tone: 'success', bar: 'bg-success' },
    watch: { label: 'Watch', tone: 'warning', bar: 'bg-warning' },
    below: { label: 'Below Target', tone: 'danger', bar: 'bg-destructive' },
}

// ── North-star hero · the week's story at a glance (one KPI per strategic lens) ──
const HERO: { label: string; value: string; delta: string; deltaUp: boolean; status: KpiStatus; sub: string }[] = [
    { label: 'Dollars sold', value: '$2.84M', delta: '+12.4%', deltaUp: true, status: 'watch', sub: 'Revenue · vs $3.0M target' },
    { label: 'On-time delivery', value: '91.5%', delta: '+1.8pp', deltaUp: true, status: 'on', sub: 'Fulfillment · target 90%' },
    { label: 'Order accuracy', value: '94.7%', delta: '-0.3pp', deltaUp: false, status: 'watch', sub: 'Quality · target 95%' },
    { label: 'Backlog', value: '$1.62M', delta: '+8.1%', deltaUp: true, status: 'watch', sub: 'Working capital · 34 open' },
]

function HeroStat({ h }: { h: typeof HERO[number] }) {
    const s = STATUS_META[h.status]
    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">{h.label}</span>
                <span className={`h-2 w-2 rounded-full shrink-0 ${s.bar}`} title={s.label} aria-label={s.label} />
            </div>
            <div className="flex items-end justify-between gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{h.value}</span>
                <span className={`text-[11px] font-bold ${h.deltaUp ? 'text-success' : 'text-destructive'}`}>{h.deltaUp ? '↑' : '↓'} {h.delta}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 truncate">{h.sub}</div>
        </div>
    )
}

// ── Chart data (grounded) ──────────────────────────────────────────────────
const SALES_TREND = [
    { wk: 'W1', sold: 2.31 }, { wk: 'W2', sold: 2.45 }, { wk: 'W3', sold: 2.28 }, { wk: 'W4', sold: 2.6 },
    { wk: 'W5', sold: 2.53 }, { wk: 'W6', sold: 2.71 }, { wk: 'W7', sold: 2.66 }, { wk: 'W8', sold: 2.84 },
]
// Post-Neocon-review (2026-06-05) · Quote pipeline aligned with E.1.i taxonomy.
const PIPELINE = [
    { stage: 'In Progress', n: 8 }, { stage: 'Pending', n: 3 }, { stage: 'Sent', n: 14 }, { stage: 'Expired', n: 11 },
]
const AR_AGING = [
    { bucket: 'Current', amt: 115.5, color: 'var(--color-success)' },
    { bucket: 'Due ≤30d', amt: 18.75, color: 'var(--color-info)' },
    { bucket: 'Past due', amt: 33.6, color: 'var(--color-warning)' },
    { bucket: 'Escalated', amt: 25.5, color: 'var(--color-destructive)' },
]

function MetricTile({ m }: { m: KpiMetric }) {
    const s = STATUS_META[m.status]
    return (
        <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</span>
                <StatusBadge label={s.label} tone={s.tone} size="xs" />
            </div>
            <div className="flex items-end justify-between gap-2">
                <span className="text-xl font-bold tracking-tight text-foreground tabular-nums">{m.value}</span>
                {m.delta && (
                    <span className={`text-[10px] font-bold ${m.deltaUp ? 'text-success' : 'text-destructive'}`}>
                        {m.deltaUp ? '↑' : '↓'} {m.delta}
                    </span>
                )}
            </div>
            {/* progress vs target */}
            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                <div className={`absolute top-0 left-0 h-full ${s.bar} rounded-full`} style={{ width: `${Math.min(100, m.barValue)}%` }} />
                <div className="absolute top-0 h-full w-0.5 bg-foreground/40" style={{ left: `${Math.min(100, m.barTarget)}%` }} />
            </div>
            {/* sub-stats */}
            <div className="grid grid-cols-3 gap-1 mt-2">
                {m.sub.map((x, i) => (
                    <div key={i} className="min-w-0">
                        <div className="text-[8px] uppercase tracking-wider text-muted-foreground truncate">{x.label}</div>
                        <div className="text-[10px] font-semibold text-foreground truncate">{x.value}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
    return (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col">
            <div className="mb-2">
                <h4 className="text-sm font-semibold text-foreground">{title}</h4>
                <p className="text-[11px] text-muted-foreground">{subtitle}</p>
            </div>
            <div className="h-[180px] w-full">{children}</div>
        </div>
    )
}

// ─── Module registry · drives filter · hide/show · reorder ─────────────────
// Each entry describes one logically-hideable chunk of the dashboard so the
// viewer can customize the layout without editing code. Keep the ids stable ·
// they're persisted to sessionStorage.
const MODULES = [
    { id: 'hero',           label: 'North-star KPIs',       hint: '4 flagship metrics · Dollars sold · On-time · Order accuracy · Backlog' },
    { id: 'group-sales',    label: 'Sales cluster',         hint: 'Top-line + pipeline detail' },
    { id: 'group-ops',      label: 'Operations & Accounting', hint: 'Fulfillment + working capital' },
    { id: 'group-cx',       label: 'Customer Experience',   hint: 'Accuracy + responsiveness' },
    { id: 'chart-sales',    label: 'Sales trend chart',     hint: '8-week area chart' },
    { id: 'chart-pipeline', label: 'Quote pipeline chart',  hint: 'Bar chart by stage' },
    { id: 'chart-ar',       label: 'AR aging chart',        hint: 'Bar chart by bucket ($K)' },
] as const
type ModuleId = typeof MODULES[number]['id']

const STORAGE_KEY = 'dashboardPerformanceGrid:layout'
type StoredLayout = { order: ModuleId[]; hidden: ModuleId[]; statusFilter: 'all' | KpiStatus }

function loadLayout(): StoredLayout {
    if (typeof window === 'undefined') return { order: MODULES.map(m => m.id), hidden: [], statusFilter: 'all' }
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY)
        if (!raw) throw new Error('miss')
        const parsed = JSON.parse(raw) as StoredLayout
        // Preserve unknown modules that were added after last save
        const knownIds = new Set(MODULES.map(m => m.id))
        const savedIds = new Set(parsed.order)
        const merged = parsed.order.filter(id => knownIds.has(id))
            .concat(MODULES.map(m => m.id).filter(id => !savedIds.has(id)))
        return { order: merged, hidden: parsed.hidden.filter(id => knownIds.has(id)), statusFilter: parsed.statusFilter ?? 'all' }
    } catch {
        return { order: MODULES.map(m => m.id), hidden: [], statusFilter: 'all' }
    }
}

const STATUS_FILTER_OPTIONS: Array<{ id: 'all' | KpiStatus; label: string }> = [
    { id: 'all',   label: 'All statuses' },
    { id: 'on',    label: 'On target only' },
    { id: 'watch', label: 'Watch only' },
    { id: 'below', label: 'Below target only' },
]

function DashboardToolbar({
    order, hidden, statusFilter, onMoveUp, onMoveDown, onToggleHidden, onSetStatusFilter, onReset,
}: {
    order: ModuleId[]
    hidden: Set<ModuleId>
    statusFilter: 'all' | KpiStatus
    onMoveUp: (id: ModuleId) => void
    onMoveDown: (id: ModuleId) => void
    onToggleHidden: (id: ModuleId) => void
    onSetStatusFilter: (v: 'all' | KpiStatus) => void
    onReset: () => void
}) {
    const currentStatus = STATUS_FILTER_OPTIONS.find(o => o.id === statusFilter) ?? STATUS_FILTER_OPTIONS[0]
    const visibleCount = order.length - hidden.size
    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Status filter menu */}
            <Menu as="div" className="relative">
                <MenuButton className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors">
                    <Filter size={14} />
                    {currentStatus.label}
                    <ChevronDown size={14} className="text-muted-foreground" />
                </MenuButton>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <MenuItems className="absolute left-0 mt-1.5 w-52 origin-top-left rounded-lg border border-border bg-popover p-1 shadow-lg z-40 focus:outline-none">
                        {STATUS_FILTER_OPTIONS.map(opt => (
                            <MenuItem key={opt.id}>
                                {({ active }) => (
                                    <button
                                        type="button"
                                        onClick={() => onSetStatusFilter(opt.id)}
                                        className={`w-full flex items-center gap-2 h-8 px-2.5 rounded-md text-xs font-medium text-foreground transition-colors ${active ? 'bg-muted' : ''}`}
                                    >
                                        {opt.id !== 'all' && (
                                            <span className={`h-2 w-2 rounded-full ${STATUS_META[opt.id as KpiStatus].bar}`} />
                                        )}
                                        <span className="flex-1 text-left">{opt.label}</span>
                                        {statusFilter === opt.id && <span className="text-primary text-xs">✓</span>}
                                    </button>
                                )}
                            </MenuItem>
                        ))}
                    </MenuItems>
                </Transition>
            </Menu>

            {/* Manage modules popover · reorder + hide/show */}
            <Popover className="relative">
                <PopoverButton className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors">
                    <LayoutList size={14} />
                    Manage modules
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                        {visibleCount}/{order.length}
                    </span>
                    <ChevronDown size={14} className="text-muted-foreground" />
                </PopoverButton>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-75"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                >
                    <PopoverPanel className="absolute right-0 mt-1.5 w-80 rounded-xl border border-border bg-popover shadow-2xl z-40 overflow-hidden">
                        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-foreground">Layout</p>
                                <p className="text-[10px] text-muted-foreground">Reorder with arrows · toggle eye to hide</p>
                            </div>
                            <button
                                type="button"
                                onClick={onReset}
                                className="text-[10px] font-semibold text-muted-foreground hover:text-foreground underline underline-offset-2"
                            >
                                Reset
                            </button>
                        </div>
                        <ul className="max-h-[380px] overflow-y-auto p-2">
                            {order.map((id, idx) => {
                                const mod = MODULES.find(m => m.id === id)
                                if (!mod) return null
                                const isHidden = hidden.has(id)
                                return (
                                    <li key={id} className={`flex items-center gap-2 p-2 rounded-lg ${isHidden ? 'opacity-50' : ''} hover:bg-muted transition-colors`}>
                                        <div className="flex flex-col gap-0.5">
                                            <button
                                                type="button"
                                                onClick={() => onMoveUp(id)}
                                                disabled={idx === 0}
                                                aria-label={`Move ${mod.label} up`}
                                                className="h-5 w-5 flex items-center justify-center rounded hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ArrowUp size={12} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onMoveDown(id)}
                                                disabled={idx === order.length - 1}
                                                aria-label={`Move ${mod.label} down`}
                                                className="h-5 w-5 flex items-center justify-center rounded hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ArrowDown size={12} />
                                            </button>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-foreground truncate">{mod.label}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{mod.hint}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onToggleHidden(id)}
                                            aria-label={isHidden ? `Show ${mod.label}` : `Hide ${mod.label}`}
                                            aria-pressed={!isHidden}
                                            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
                                        >
                                            {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </PopoverPanel>
                </Transition>
            </Popover>

            {statusFilter !== 'all' && (
                <button
                    type="button"
                    onClick={() => onSetStatusFilter('all')}
                    className="text-[10px] font-semibold text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                    Clear filter
                </button>
            )}
        </div>
    )
}

export default function DashboardPerformanceGrid() {
    const [layout, setLayout] = useState<StoredLayout>(loadLayout)
    useEffect(() => {
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(layout)) } catch { /* quota · noop */ }
    }, [layout])

    const hiddenSet = useMemo(() => new Set(layout.hidden), [layout.hidden])
    const statusFilter = layout.statusFilter

    const moveUp = (id: ModuleId) => setLayout(prev => {
        const i = prev.order.indexOf(id)
        if (i <= 0) return prev
        const next = [...prev.order]
        ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
        return { ...prev, order: next }
    })
    const moveDown = (id: ModuleId) => setLayout(prev => {
        const i = prev.order.indexOf(id)
        if (i < 0 || i >= prev.order.length - 1) return prev
        const next = [...prev.order]
        ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
        return { ...prev, order: next }
    })
    const toggleHidden = (id: ModuleId) => setLayout(prev => ({
        ...prev,
        hidden: prev.hidden.includes(id) ? prev.hidden.filter(x => x !== id) : [...prev.hidden, id],
    }))
    const setStatusFilter = (v: 'all' | KpiStatus) => setLayout(prev => ({ ...prev, statusFilter: v }))
    const reset = () => setLayout({ order: MODULES.map(m => m.id), hidden: [], statusFilter: 'all' })

    // Status-filter helpers · dim non-matching metrics/heroes instead of removing
    // so the layout doesn't shift when the user toggles filters.
    const passesFilter = (status: KpiStatus) => statusFilter === 'all' || status === statusFilter

    const renderModule = (id: ModuleId) => {
        switch (id) {
            case 'hero':
                return (
                    <div key={id} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {HERO.map(h => (
                            <div key={h.label} className={passesFilter(h.status) ? '' : 'opacity-30'}>
                                <HeroStat h={h} />
                            </div>
                        ))}
                    </div>
                )
            case 'group-sales':
            case 'group-ops':
            case 'group-cx': {
                const groupId = id.replace('group-', '')
                const g = KPI_GROUPS.find(x => x.id === groupId)
                if (!g) return null
                return (
                    <div key={id} className="rounded-xl border border-border bg-card/40 p-4">
                        <div className="mb-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{g.label}</h3>
                            <p className="text-[10px] text-muted-foreground">{g.hint}</p>
                        </div>
                        <div className="space-y-2.5">
                            {g.metrics.map((m, i) => (
                                <div key={i} className={passesFilter(m.status) ? '' : 'opacity-30'}>
                                    <MetricTile m={m} />
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
            case 'chart-sales':
                return (
                    <ChartCard key={id} title="Dollars sold" subtitle="8-week trend ($M)">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={SALES_TREND} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="soldGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-info)" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="var(--color-info)" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="wk" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} width={36} />
                                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-popover)' }} />
                                <Area type="monotone" dataKey="sold" stroke="var(--color-info)" strokeWidth={2} fill="url(#soldGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )
            case 'chart-pipeline':
                return (
                    <ChartCard key={id} title="Quote pipeline" subtitle="Open quotes by stage">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={PIPELINE} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="stage" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} width={78} />
                                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-popover)' }} />
                                <Bar dataKey="n" radius={[0, 4, 4, 0]} fill="var(--color-info)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )
            case 'chart-ar':
                return (
                    <ChartCard key={id} title="AR aging" subtitle="Outstanding by bucket ($K)">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={AR_AGING} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis dataKey="bucket" tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} interval={0} />
                                <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} width={36} />
                                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-popover)' }} />
                                <Bar dataKey="amt" radius={[4, 4, 0, 0]}>
                                    {AR_AGING.map((d, i) => <Cell key={i} fill={d.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )
        }
    }

    // Group the ordered list into three "bands" so we keep the visual layout
    // logic (hero = 4-col grid · groups = 3-col grid · charts = 3-col grid)
    // regardless of the user's chosen order. Within each band the user's order
    // is preserved.
    const visibleOrder = layout.order.filter(id => !hiddenSet.has(id))
    const heroModules     = visibleOrder.filter(id => id === 'hero')
    const groupModules    = visibleOrder.filter(id => id === 'group-sales' || id === 'group-ops' || id === 'group-cx')
    const chartModules    = visibleOrder.filter(id => id === 'chart-sales' || id === 'chart-pipeline' || id === 'chart-ar')

    return (
        <section aria-labelledby="kpi-performance" className="space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h2 id="kpi-performance" className="text-base font-bold text-foreground">Performance · this week vs target</h2>
                    <span className="text-[11px] text-muted-foreground italic">North-star → by category → trends</span>
                </div>
                <DashboardToolbar
                    order={layout.order}
                    hidden={hiddenSet}
                    statusFilter={statusFilter}
                    onMoveUp={moveUp}
                    onMoveDown={moveDown}
                    onToggleHidden={toggleHidden}
                    onSetStatusFilter={setStatusFilter}
                    onReset={reset}
                />
            </div>

            {heroModules.map(renderModule)}

            {groupModules.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {groupModules.map(renderModule)}
                </div>
            )}

            {chartModules.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {chartModules.map(renderModule)}
                </div>
            )}

            {visibleOrder.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
                    <p className="text-sm text-muted-foreground">All modules hidden · use <strong>Manage modules</strong> above to bring some back.</p>
                </div>
            )}
        </section>
    )
}
