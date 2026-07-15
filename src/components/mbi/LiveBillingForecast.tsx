/**
 * COMPONENT: LiveBillingForecast
 * PURPOSE: Real-time billing forecast chart — replaces MBI's bi-weekly static
 *          Excel (75-80% accuracy, 8 manual steps) with continuous visibility
 *          powered by automated CORE data pull (90%+ target accuracy).
 *
 *          Uses recharts (already in UI-Dealer) for the bar + line combination:
 *          projected bars + actual line overlay per week.
 *
 * PROPS: none — reads MBI_BILLING_FORECAST from mock data
 *
 * STATES: static (chart is built from mock weekly data)
 *
 * DS TOKENS: bg-card · border-border · primary (projected) · success (actual)
 *
 * USED BY: MBIAccountingPage (Phase 3.C)
 */

import { BarChart, Bar, ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { TrendingUp, BarChart3, CheckCircle2 } from 'lucide-react'
import { MBI_BILLING_FORECAST, FORECAST_ACCURACY } from '../../config/profiles/mbi-data'

export default function LiveBillingForecast() {
    const data = MBI_BILLING_FORECAST.map(p => ({
        week: p.week.replace('2026-', ''),
        projected: p.projected,
        actual: p.actual ?? null,
        confidence: p.confidence,
    }))

    const currentWeek = data[data.length - 1]
    const lastComplete = data.filter(d => d.actual !== null).slice(-1)[0]
    const lastDelta = lastComplete && lastComplete.actual
        ? lastComplete.actual - lastComplete.projected
        : 0
    const lastDeltaPct = lastComplete && lastComplete.actual
        ? Math.round((lastDelta / lastComplete.projected) * 100)
        : 0

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                        <BarChart3 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Live billing forecast</div>
                        <div className="text-[10px] text-muted-foreground">
                            Replaces bi-weekly Excel ({FORECAST_ACCURACY.manualSteps.legacy} manual steps · {FORECAST_ACCURACY.legacy})
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold text-success uppercase tracking-wider flex items-center gap-1 justify-end">
                        <CheckCircle2 className="h-3 w-3" />
                        Live
                    </div>
                    <div className="text-lg font-bold text-success tabular-nums">{FORECAST_ACCURACY.strata}</div>
                    <div className="text-[10px] text-muted-foreground">target accuracy</div>
                </div>
            </div>

            {/* Chart */}
            <div className="p-4">
                <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border opacity-30" />
                            <XAxis
                                dataKey="week"
                                stroke="currentColor"
                                className="text-muted-foreground text-[10px]"
                                tickLine={false}
                            />
                            <YAxis
                                stroke="currentColor"
                                className="text-muted-foreground text-[10px]"
                                tickLine={false}
                                tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgb(var(--color-card))',
                                    border: '1px solid rgb(var(--color-border))',
                                    borderRadius: 8,
                                    fontSize: 12,
                                }}
                                formatter={(value: number, name: string) => {
                                    if (typeof value !== 'number') return [value, name]
                                    return [`$${value.toLocaleString()}`, name === 'projected' ? 'Projected' : 'Actual']
                                }}
                            />
                            <Legend
                                wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
                                iconType="circle"
                            />
                            <Bar
                                dataKey="projected"
                                fill="#C3E433"
                                radius={[4, 4, 0, 0]}
                                name="Projected"
                            />
                            <Line
                                type="monotone"
                                dataKey="actual"
                                stroke="#098400"
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#098400' }}
                                name="Actual"
                                connectNulls
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Last-week summary */}
                {lastComplete && (
                    <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-3 text-center">
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Last completed</div>
                            <div className="text-sm font-bold text-foreground tabular-nums">{lastComplete.week}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Delta</div>
                            <div className={`text-sm font-bold tabular-nums ${lastDelta >= 0 ? 'text-success' : 'text-amber-600 dark:text-amber-400'}`}>
                                {lastDelta >= 0 ? '+' : ''}${lastDelta.toLocaleString()}
                                <span className="text-[10px] ml-1">({lastDeltaPct >= 0 ? '+' : ''}{lastDeltaPct}%)</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">This week</div>
                            <div className="text-sm font-bold text-foreground tabular-nums">
                                ${(currentWeek.projected / 1000).toFixed(0)}K
                            </div>
                            <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                                <TrendingUp className="h-2.5 w-2.5" />
                                {currentWeek.confidence}% confidence
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
