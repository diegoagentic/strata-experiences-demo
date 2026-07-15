import { Bar, BarChart, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashMetricsPeriod } from '../DashboardMetricsGrid';

const dataByPeriod: Record<DashMetricsPeriod, { name: string; value: number; fill: string }[]> = {
    Day: [
        { name: "Impressions", value: 620, fill: "#6366f1" }, { name: "Clicks", value: 410, fill: "#818cf8" },
        { name: "Leads", value: 180, fill: "#a5b4fc" }, { name: "Quotes", value: 85, fill: "#c7d2fe" },
        { name: "Closed", value: 32, fill: "#e0e7ff" },
    ],
    Week: [
        { name: "Impressions", value: 2800, fill: "#6366f1" }, { name: "Clicks", value: 1900, fill: "#818cf8" },
        { name: "Leads", value: 1100, fill: "#a5b4fc" }, { name: "Quotes", value: 620, fill: "#c7d2fe" },
        { name: "Closed", value: 380, fill: "#e0e7ff" },
    ],
    Month: [
        { name: "Impressions", value: 4000, fill: "#6366f1" }, { name: "Clicks", value: 3000, fill: "#818cf8" },
        { name: "Leads", value: 2000, fill: "#a5b4fc" }, { name: "Quotes", value: 1200, fill: "#c7d2fe" },
        { name: "Closed", value: 800, fill: "#e0e7ff" },
    ],
    Quarter: [
        { name: "Impressions", value: 12400, fill: "#6366f1" }, { name: "Clicks", value: 8900, fill: "#818cf8" },
        { name: "Leads", value: 5600, fill: "#a5b4fc" }, { name: "Quotes", value: 3400, fill: "#c7d2fe" },
        { name: "Closed", value: 2100, fill: "#e0e7ff" },
    ],
};

export function FunnelBarChart({ period = 'Month' }: { period?: DashMetricsPeriod }) {
    const data = dataByPeriod[period];
    return (
        <div className="h-[300px] w-full bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Conversion Funnel</h3>
                    <p className="text-sm text-muted-foreground">Marketing to Sales Performance</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} width={80} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#1F2937' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} activeBar={<Rectangle fill="#4f46e5" stroke="#4338ca" />} animationDuration={600} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
