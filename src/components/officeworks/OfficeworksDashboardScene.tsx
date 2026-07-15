/**
 * COMPONENT: OfficeworksDashboardScene
 * PURPOSE: Persistent Dashboard navbar tab (NOT a demo step).
 *          Dramatizes CEO #2 SC5 (capacity self-reported) + CEO #4 SC6 (no KPIs).
 *
 * Enrichments (Iter 2.5):
 *   - 4 KPI cards (cycle time / revisions / error rate / spec checks)
 *   - 4 chart panels (cycle time trend · error rate trend · project mix by region · activity)
 *   - CapacityHeatmap is clickable → opens DesignerDetailModal
 *
 * DS TOKENS: bg-card · bg-background · border-border · text-foreground ·
 *            text-muted-foreground · text-success · text-warning · text-destructive
 */

import { useState } from 'react'
import {
    LayoutDashboard, Activity, Clock, Target, TrendingUp, AlertTriangle, BarChart3,
    LineChart as LineChartIcon, PieChart as PieChartIcon, History,
} from 'lucide-react'
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid,
} from 'recharts'
import CapacityHeatmap from './shared/CapacityHeatmap'
import DesignerDetailModal from './shared/DesignerDetailModal'
import {
    CYCLE_TIME_TREND, ERROR_RATE_BY_MONTH, RECENT_ACTIVITY,
    projectMixByRegion, findDesigner, type DesignerProfile, regionLabel,
} from './shared/designerProfiles'

export default function OfficeworksDashboardScene() {
    const [selectedDesignerName, setSelectedDesignerName] = useState<string | null>(null)
    const selectedDesigner: DesignerProfile | null = selectedDesignerName ? (findDesigner(selectedDesignerName) ?? null) : null

    const regionMix = projectMixByRegion()
    const regionMixData = (['dc', 'ma', 'pa'] as const).map(r => ({
        region: regionLabel(r),
        Large: regionMix[r].large,
        Medium: regionMix[r].medium,
        Small: regionMix[r].small,
    }))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <LayoutDashboard className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-foreground">Design Dashboard · Officeworks Inc.</h2>
                    <p className="text-sm text-muted-foreground">
                        Capacity (CEO #2 · SC5) + KPIs (CEO #4 · SC6) · ~30 designers across 3 manager regions
                    </p>
                </div>
            </div>

            {/* KPI cards row (4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={Clock} label="Avg cycle time" value="3.4w" change="+12% vs Q1 target" tone="warning" />
                <KPICard icon={TrendingUp} label="Revisions / project" value="2.7" change="range 2–4 typical" tone="muted" />
                <KPICard icon={Target} label="Error escape rate" value="0.018%" change="below industry 0.025%" tone="success" />
                <KPICard icon={Activity} label="Spec checks / week" value="~20" change="+10 new designs/week" tone="muted" />
            </div>

            {/* Charts row 1: trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Cycle time trend · LineChart */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <LineChartIcon className="h-4 w-4 text-muted-foreground" />
                                Cycle time trend
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Last 8 weeks · weeks per project · trending down</p>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-success/10 text-success border border-success/20 rounded-md px-2 py-1">
                            -17% vs W-7
                        </span>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={CYCLE_TIME_TREND} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
                                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
                                <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" domain={[3, 4.5]} />
                                <Tooltip
                                    contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
                                    formatter={(value: number) => [`${value}w`, 'Cycle time']}
                                />
                                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Error rate by month · BarChart */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                Error rate by month
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Last 6 months · % escape rate vs industry benchmark</p>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-success/10 text-success border border-success/20 rounded-md px-2 py-1">
                            Below 0.025%
                        </span>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ERROR_RATE_BY_MONTH} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
                                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
                                <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
                                <Tooltip
                                    contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
                                    formatter={(value: number) => [`${(value * 100).toFixed(3)}%`, 'Error rate']}
                                />
                                <ReferenceLine y={0.025} stroke="hsl(var(--warning))" strokeDasharray="3 3" label={{ value: 'Industry 0.025%', position: 'top', fontSize: 10, fill: 'currentColor' }} />
                                <Bar dataKey="value" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts row 2: distribution + activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Project size distribution by region · stacked BarChart */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                                Project mix by region
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Large (&gt;$500K) · Medium ($50-500K) · Small (&lt;$50K)</p>
                        </div>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionMixData} layout="vertical" margin={{ top: 8, right: 8, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
                                <XAxis type="number" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
                                <YAxis dataKey="region" type="category" tick={{ fontSize: 9 }} stroke="currentColor" className="text-muted-foreground" width={120} />
                                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                                <Bar dataKey="Large"  stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Medium" stackId="a" fill="hsl(var(--info))"    radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Small"  stackId="a" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent activity timeline */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <History className="h-4 w-4 text-muted-foreground" />
                                Recent activity
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Last 7 days · assignments · completions · escapes</p>
                        </div>
                    </div>
                    <ul className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                        {RECENT_ACTIVITY.map((a, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs">
                                <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${
                                    a.kind === 'arrive' ? 'bg-ai' :
                                    a.kind === 'success' ? 'bg-success' :
                                    'bg-info'
                                }`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-foreground">{a.text}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{a.when}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* CapacityHeatmap card · clickable */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-base font-semibold text-foreground">Designer Capacity</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Self-reported every Thursday · click any designer to see detail
                        </p>
                    </div>
                    <div className="text-xs bg-warning/10 text-warning border border-warning/20 rounded-md px-2.5 py-1.5">
                        <div className="flex items-center gap-1.5">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="font-medium">SC5: stale data</span>
                        </div>
                    </div>
                </div>
                <CapacityHeatmap onSelect={(name) => setSelectedDesignerName(name)} />
            </div>

            {/* SC6 callout */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-base font-semibold text-foreground">SC6 (CEO #4): No formal KPIs or SLAs today</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Officeworks measures only the NetSuite error report (post-order, reactive). The charts above are the
                            first centralized view of cycle time, error trend, and project mix · enabling proactive resource decisions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Designer detail modal */}
            <DesignerDetailModal
                isOpen={!!selectedDesigner}
                onClose={() => setSelectedDesignerName(null)}
                designer={selectedDesigner}
            />
        </div>
    )
}

// ─── KPI card sub-component ───────────────────────────────────────────────────

interface KPICardProps {
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string
    change: string
    tone: 'success' | 'warning' | 'destructive' | 'muted'
}

function KPICard({ icon: Icon, label, value, change, tone }: KPICardProps) {
    const changeClass = tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : tone === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
    return (
        <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
            </div>
            <div className="text-2xl font-semibold text-foreground tabular-nums">{value}</div>
            <div className={`text-xs mt-1 ${changeClass}`}>{change}</div>
        </div>
    )
}
