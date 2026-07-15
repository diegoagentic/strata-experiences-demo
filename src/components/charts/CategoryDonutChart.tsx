import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DashMetricsPeriod } from '../DashboardMetricsGrid';

const dataByPeriod: Record<DashMetricsPeriod, { name: string; value: number }[]> = {
    Day: [
        { name: "Seating", value: 85 }, { name: "Desks", value: 62 }, { name: "Storage", value: 45 }, { name: "Accessories", value: 30 },
    ],
    Week: [
        { name: "Seating", value: 220 }, { name: "Desks", value: 180 }, { name: "Storage", value: 150 }, { name: "Accessories", value: 95 },
    ],
    Month: [
        { name: "Seating", value: 400 }, { name: "Desks", value: 300 }, { name: "Storage", value: 300 }, { name: "Accessories", value: 200 },
    ],
    Quarter: [
        { name: "Seating", value: 1200 }, { name: "Desks", value: 950 }, { name: "Storage", value: 870 }, { name: "Accessories", value: 580 },
    ],
};

const COLORS = ["var(--chart-brand-fill)", "#E4E4E7", "#71717A", "#3F3F46"];

export function CategoryDonutChart({ period = 'Month' }: { period?: DashMetricsPeriod }) {
    const data = dataByPeriod[period];
    return (
        <div className="h-[400px] w-full bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Top Categories</h3>
                    <p className="text-sm text-muted-foreground">Revenue distribution by category</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none" animationDuration={600}>
                            {data.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="stroke-white dark:stroke-zinc-900 stroke-2" />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#1F2937' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} formatter={(value) => <span className="text-muted-foreground dark:text-zinc-300">{value}</span>} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
