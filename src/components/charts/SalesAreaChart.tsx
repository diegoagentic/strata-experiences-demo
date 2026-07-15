import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashMetricsPeriod } from '../DashboardMetricsGrid';

const dataByPeriod: Record<DashMetricsPeriod, { name: string; revenue: number }[]> = {
    Day: [
        { name: "8AM", revenue: 420 }, { name: "10AM", revenue: 680 }, { name: "12PM", revenue: 950 },
        { name: "2PM", revenue: 1100 }, { name: "4PM", revenue: 870 }, { name: "6PM", revenue: 540 },
    ],
    Week: [
        { name: "Mon", revenue: 2800 }, { name: "Tue", revenue: 3200 }, { name: "Wed", revenue: 2500 },
        { name: "Thu", revenue: 3900 }, { name: "Fri", revenue: 3100 },
    ],
    Month: [
        { name: "Jan", revenue: 4000 }, { name: "Feb", revenue: 3000 }, { name: "Mar", revenue: 2000 },
        { name: "Apr", revenue: 2780 }, { name: "May", revenue: 1890 }, { name: "Jun", revenue: 2390 },
        { name: "Jul", revenue: 3490 },
    ],
    Quarter: [
        { name: "Q1 '25", revenue: 9000 }, { name: "Q2 '25", revenue: 7070 },
        { name: "Q3 '25", revenue: 8200 }, { name: "Q4 '25", revenue: 11400 },
    ],
};

const subtitles: Record<DashMetricsPeriod, string> = {
    Day: 'Hourly revenue today',
    Week: 'Daily revenue this week',
    Month: 'Revenue trends over the last 7 months',
    Quarter: 'Quarterly revenue performance',
};

export function SalesAreaChart({ period = 'Month' }: { period?: DashMetricsPeriod }) {
    const data = dataByPeriod[period];
    return (
        <div className="h-[400px] w-full bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Sales Performance</h3>
                    <p className="text-sm text-muted-foreground">{subtitles[period]}</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-brand-fill)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--chart-brand-fill)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', borderRadius: '8px', border: '1px solid #27272a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#F4F4F5' }}
                            itemStyle={{ color: 'bg-brand-400' }}
                            formatter={(value) => [`$${value}`, 'Revenue']}
                        />
                        <Area
                            type="monotone" dataKey="revenue" stroke="var(--chart-brand-fill)" strokeWidth={3}
                            fillOpacity={1} fill="url(#colorRevenue)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-brand-300)' }}
                            animationDuration={600}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
