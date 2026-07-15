import { LayoutDashboard, Clock, DollarSign, Users, FileCheck2, AlertTriangle, Database, Sparkles, Calendar, FolderTree, ClipboardCheck } from 'lucide-react'
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
    KPI_CARDS, CYCLE_TIME_TREND, PUNCH_AGEING, VENDOR_MIX, REGIONAL_LOAD, ACTIVITY_FEED, AT_RISK,
    type KpiCardData,
} from './shared/clcDashboardData'

/**
 * Flow 4 — Data Lake Dashboard scene.
 *
 * Persistent tab · no step gating. Layout:
 *   Row 1 · 4 KPI cards
 *   Row 2 · 4 chart panels (line · bar · pie · stacked bar)
 *   Row 3 · at-risk summary (left) + recent activity feed (right)
 *
 * Source chips on every panel telegraph the data-lake foundation.
 */
export default function CLCDashboardScene() {
    return (
        <div className="p-5 max-w-7xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-brand-300/40 dark:bg-brand-500/20 flex items-center justify-center">
                        <LayoutDashboard className="h-5 w-5 text-zinc-800 dark:text-zinc-200" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Data Lake Dashboard</h1>
                        <p className="text-xs text-muted-foreground">KPIs pulling from IQ + QuickBooks + Outlook + SharePoint + CET</p>
                    </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground px-2 py-1 rounded-md bg-muted">
                    <Database className="h-3.5 w-3.5" />
                    Data lake online · refreshed 2 min ago
                </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {KPI_CARDS.map(kpi => (
                    <KpiCard key={kpi.id} kpi={kpi} />
                ))}
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <ChartPanel title="Install cycle time" subtitle="Days · 6-month trend" source="IQ" icon={<Clock className="h-4 w-4" />}>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={CYCLE_TIME_TREND}>
                            <CartesianGrid stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="currentColor" />
                            <YAxis tick={{ fontSize: 11 }} stroke="currentColor" />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 12 }} />
                            <Line type="monotone" dataKey="days" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel title="Punch-order ageing" subtitle="Open · grouped by age bucket" source="QuickBooks" icon={<DollarSign className="h-4 w-4" />}>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={PUNCH_AGEING}>
                            <CartesianGrid stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                            <XAxis dataKey="bucket" tick={{ fontSize: 11 }} stroke="currentColor" />
                            <YAxis tick={{ fontSize: 11 }} stroke="currentColor" tickFormatter={(v) => `$${v / 1000}K`} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Open']} />
                            <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartPanel>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <ChartPanel title="Project mix · 12 months" subtitle="Share of jobs by vendor" source="IQ" icon={<Users className="h-4 w-4" />}>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={VENDOR_MIX} dataKey="value" nameKey="vendor" cx="40%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                                {VENDOR_MIX.map((d, i) => <Cell key={i} fill={d.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 12 }} formatter={(v: number) => [`${v}%`, 'Share']} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel title="Regional load · 6-week look-ahead" subtitle="Jobs per week by region" source="Outlook" icon={<Calendar className="h-4 w-4" />}>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={REGIONAL_LOAD}>
                            <CartesianGrid stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                            <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="currentColor" />
                            <YAxis tick={{ fontSize: 11 }} stroke="currentColor" />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 12 }} />
                            <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="ny" stackId="a" fill="#3b82f6" name="NY" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="nj" stackId="a" fill="#f59e0b" name="NJ" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="pa" stackId="a" fill="#10b981" name="PA" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartPanel>
            </div>

            {/* At-risk + activity feed */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-3">
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-bold text-foreground">At-risk projects</h3>
                        <span className="ml-auto text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{AT_RISK.length}</span>
                    </div>
                    <div className="divide-y divide-border">
                        {AT_RISK.map(item => {
                            const borderColor = item.severity === 'red'
                                ? 'border-l-4 border-l-red-500'
                                : 'border-l-4 border-l-amber-500'
                            return (
                                <div key={item.id} className={`p-4 ${borderColor}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-bold text-foreground">{item.title}</span>
                                        <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                            item.severity === 'red' ? 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                                        }`}>
                                            {item.flow}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-1">{item.when}</div>
                                    <p className="text-sm text-foreground leading-snug">{item.risk}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                        <h3 className="text-sm font-bold text-foreground">Recent activity · last 8 events</h3>
                        <span className="ml-auto text-[10px] font-bold text-muted-foreground uppercase tracking-wider">All flows</span>
                    </div>
                    <div className="divide-y divide-border max-h-[360px] overflow-y-auto">
                        {ACTIVITY_FEED.map((event, idx) => (
                            <div key={idx} className="px-4 py-2.5 flex items-start gap-3">
                                <FlowChip flow={event.flow} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-foreground leading-snug">{event.text}</p>
                                </div>
                                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{event.ts}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Bits ────────────────────────────────────────────────────────────────────

function KpiCard({ kpi }: { kpi: KpiCardData }) {
    const deltaColor = kpi.deltaTone === 'good'
        ? 'text-green-700 dark:text-green-300'
        : kpi.deltaTone === 'bad'
            ? 'text-red-700 dark:text-red-300'
            : 'text-muted-foreground'
    const icon = kpi.id === 'cycle' ? <Clock className="h-3.5 w-3.5" />
        : kpi.id === 'backlog' ? <DollarSign className="h-3.5 w-3.5" />
        : kpi.id === 'load' ? <Users className="h-3.5 w-3.5" />
        : kpi.id === 'intake' ? <FileCheck2 className="h-3.5 w-3.5" />
        : null
    return (
        <div className="rounded-2xl border border-border bg-card p-4 relative">
            <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{kpi.label}</span>
                {kpi.aiDerived && <Sparkles className="h-3 w-3 text-zinc-800 dark:text-zinc-200 ml-auto" />}
            </div>
            <div className="text-2xl font-bold text-foreground tabular-nums">{kpi.value}</div>
            {kpi.delta && <div className={`text-xs font-semibold ${deltaColor} mt-0.5`}>{kpi.delta}</div>}
            <div className="text-[11px] text-muted-foreground mt-1">{kpi.sublabel}</div>
            <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <Database className="h-3 w-3" />
                Source · {kpi.source}
            </div>
        </div>
    )
}

interface ChartPanelProps {
    title: string
    subtitle: string
    source: string
    icon: React.ReactNode
    children: React.ReactNode
}
function ChartPanel({ title, subtitle, source, icon, children }: ChartPanelProps) {
    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                <span className="text-muted-foreground">{icon}</span>
                <div>
                    <h3 className="text-sm font-bold text-foreground">{title}</h3>
                    <p className="text-[11px] text-muted-foreground">{subtitle}</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <Database className="h-3 w-3" />
                    {source}
                </span>
            </div>
            <div className="p-3">{children}</div>
        </div>
    )
}

function FlowChip({ flow }: { flow: string }) {
    const meta: Record<string, { icon: React.ReactNode; classes: string }> = {
        'Calendar':   { icon: <Calendar className="h-3 w-3" />, classes: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
        'SharePoint': { icon: <FolderTree className="h-3 w-3" />, classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
        'Intake':     { icon: <ClipboardCheck className="h-3 w-3" />, classes: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
    }
    const m = meta[flow] ?? { icon: null, classes: 'bg-muted text-muted-foreground' }
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap mt-0.5 ${m.classes}`}>
            {m.icon}
            {flow}
        </span>
    )
}
