import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashMetricsPeriod } from '../DashboardMetricsGrid';

const dataByPeriod: Record<DashMetricsPeriod, { name: string; revenue: number; margin: number }[]> = {
    Day: [
        { name: "8AM", revenue: 120, margin: 62 }, { name: "10AM", revenue: 210, margin: 70 },
        { name: "12PM", revenue: 340, margin: 75 }, { name: "2PM", revenue: 280, margin: 68 },
        { name: "4PM", revenue: 190, margin: 58 }, { name: "6PM", revenue: 95, margin: 50 },
    ],
    Week: [
        { name: "Mon", revenue: 590, margin: 72 }, { name: "Tue", revenue: 720, margin: 78 },
        { name: "Wed", revenue: 680, margin: 80 }, { name: "Thu", revenue: 850, margin: 85 },
        { name: "Fri", revenue: 640, margin: 74 },
    ],
    Month: [
        { name: "Week 1", revenue: 590, margin: 80 }, { name: "Week 2", revenue: 868, margin: 96 },
        { name: "Week 3", revenue: 1397, margin: 109 }, { name: "Week 4", revenue: 1480, margin: 120 },
        { name: "Week 5", revenue: 1520, margin: 110 }, { name: "Week 6", revenue: 1400, margin: 68 },
    ],
    Quarter: [
        { name: "Jan", revenue: 3200, margin: 88 }, { name: "Feb", revenue: 3800, margin: 92 },
        { name: "Mar", revenue: 4100, margin: 95 },
    ],
};

export function MarginTrendChart({ period = 'Month' }: { period?: DashMetricsPeriod }) {
    const data = dataByPeriod[period];
    return (
        <div className="h-[300px] w-full bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Margin Trends</h3>
                    <p className="text-sm text-muted-foreground">Revenue vs Profit Margin (%)</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                        <XAxis dataKey="name" scale="band" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" orientation="left" stroke="#6366f1" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="revenue" barSize={20} fill="#6366f1" radius={[4, 4, 0, 0]} animationDuration={600} />
                        <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} animationDuration={600} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
