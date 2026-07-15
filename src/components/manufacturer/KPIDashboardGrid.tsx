/**
 * KPIDashboardGrid · Manufacturer Dashboard KPIs (Asly N10 narrative)
 *
 * 6 metrics grouped into 3 semantic clusters per UX/DS Manager consensus:
 *   - Revenue:    dollars sold + backlog dollars (currency · primary scale)
 *   - Throughput: shipped/day + quote count + order count (counts · muted scale)
 *   - Quality:    accuracy (full-height card with sparkline · trust-moment close)
 *
 * Built from Card + Badge primitives per LAWS (not lifted from PerformanceMetrics
 * which has wrong-shade bg-lime-400 ≠ real brand #E6F993).
 *
 * Stakeholder: Asly Olarte (Liliana team SME). Definition of "accuracy" is the
 * PO-vs-Ack match rate · 7-day rolling (placeholder pending Asly confirmation).
 */

import {
    DollarSign,
    Package,
    Truck,
    FileText,
    ShoppingCart,
    Target,
    TrendingUp,
    TrendingDown,
    Sparkles,
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

interface KPIMetric {
    id: string
    icon: ComponentType<SVGProps<SVGSVGElement>>
    label: string
    value: string
    delta: string
    direction: 'up' | 'down'
    detail: string
}

// 4 clusters per Wendy item 11: Sales · Operations · Customer Experience · Financial
// 3 metrics per cluster · 2x2 grid layout

const SALES_METRICS: KPIMetric[] = [
    {
        id: 'dollars-sold',
        icon: DollarSign,
        label: 'Dollars sold',
        value: '$2.84M',
        delta: '+12.4%',
        direction: 'up',
        detail: 'vs prior week',
    },
    {
        id: 'quote-count',
        icon: FileText,
        label: 'Quotes this week',
        value: '47',
        delta: '+9',
        direction: 'up',
        detail: '12 RFQ pending',
    },
    {
        id: 'win-rate',
        icon: Target,
        label: 'Win rate',
        value: '38%',
        delta: '+3pp',
        direction: 'up',
        detail: 'Quote → PO conversion',
    },
]

const OPERATIONS_METRICS: KPIMetric[] = [
    {
        id: 'shipped-day',
        icon: Truck,
        label: 'Shipped per day',
        value: '$148K',
        delta: '+5.2%',
        direction: 'up',
        detail: '7-day rolling',
    },
    {
        id: 'order-count',
        icon: ShoppingCart,
        label: 'Orders this week',
        value: '23',
        delta: '+4',
        direction: 'up',
        detail: '$3.1M total',
    },
    {
        id: 'on-time',
        icon: Package,
        label: 'On-time delivery',
        value: '91.5%',
        delta: '+1.8pp',
        direction: 'up',
        detail: 'vs target 90%',
    },
]

const CUSTOMER_METRICS: KPIMetric[] = [
    {
        id: 'order-accuracy',
        icon: Target,
        label: 'Order accuracy',
        value: '94.7%',
        delta: '-0.3pp',
        direction: 'down',
        detail: 'PO-vs-Ack match · target 95%',
    },
    {
        id: 'response-time',
        icon: FileText,
        label: 'Response time',
        value: '4.2h',
        delta: '-0.8h',
        direction: 'up',
        detail: 'RFQ → quote avg',
    },
    {
        id: 'nps',
        icon: Sparkles,
        label: 'NPS (proxy)',
        value: '+42',
        delta: '+6',
        direction: 'up',
        detail: 'Dealer satisfaction score',
    },
]

const FINANCIAL_METRICS: KPIMetric[] = [
    {
        id: 'backlog',
        icon: Package,
        label: 'Backlog',
        value: '$1.62M',
        delta: '+8.1%',
        direction: 'up',
        detail: '34 orders open',
    },
    {
        id: 'ar-aging',
        icon: DollarSign,
        label: 'AR > 30d',
        value: '$84K',
        delta: '-12.4%',
        direction: 'up',
        detail: '3 accounts past due',
    },
    {
        id: 'dso',
        icon: Sparkles,
        label: 'DSO',
        value: '38d',
        delta: '-3d',
        direction: 'up',
        detail: 'Days Sales Outstanding',
    },
]

const CLUSTERS = [
    { id: 'sales', label: 'Sales', hint: 'Top-line + pipeline health', metrics: SALES_METRICS },
    { id: 'operations', label: 'Operations', hint: 'Throughput + fulfillment', metrics: OPERATIONS_METRICS },
    { id: 'customer', label: 'Customer Experience', hint: 'Accuracy + responsiveness', metrics: CUSTOMER_METRICS },
    { id: 'financial', label: 'Financial', hint: 'Working capital + AR health', metrics: FINANCIAL_METRICS },
] as const

function DeltaBadge({ direction, label }: { direction: 'up' | 'down'; label: string }) {
    const Icon = direction === 'up' ? TrendingUp : TrendingDown
    const tone = direction === 'up' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${tone}`}>
            <Icon className="h-3 w-3" aria-hidden="true" />
            {label}
        </span>
    )
}

function MetricCard({ metric }: { metric: KPIMetric }) {
    const Icon = metric.icon
    return (
        <div className="rounded-lg border border-border bg-card p-2.5 hover:border-primary/40 hover:shadow-sm transition-all min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
                <div className="h-6 w-6 rounded bg-muted/40 flex items-center justify-center shrink-0">
                    <Icon className="h-3 w-3 text-foreground" aria-hidden="true" />
                </div>
                <DeltaBadge direction={metric.direction} label={metric.delta} />
            </div>
            <div className="text-lg font-bold text-foreground tabular-nums leading-tight truncate">{metric.value}</div>
            <div className="text-[10px] font-medium text-muted-foreground mt-0.5 truncate">{metric.label}</div>
            <div className="text-[9px] text-muted-foreground italic mt-1 line-clamp-2">{metric.detail}</div>
        </div>
    )
}

function ColumnHeader({ label, hint }: { label: string; hint: string }) {
    return (
        <div className="px-1 mb-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-foreground">{label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>
        </div>
    )
}

export default function KPIDashboardGrid() {
    return (
        <section aria-labelledby="kpi-this-week" className="mb-6">
            <header className="flex items-baseline justify-between mb-3 px-1">
                <h2 id="kpi-this-week" className="text-base font-bold text-foreground">This week</h2>
                <span className="text-[11px] text-muted-foreground italic">Sales · operations · customer experience · financial</span>
            </header>

            {/* 4 clusters · 2x2 grid per Wendy item 11 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {CLUSTERS.map(cluster => (
                    <div key={cluster.id} className="rounded-xl border border-border bg-card/40 p-4">
                        <ColumnHeader label={cluster.label} hint={cluster.hint} />
                        <div className="grid grid-cols-3 gap-2.5">
                            {cluster.metrics.map(m => (
                                <MetricCard key={m.id} metric={m} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
