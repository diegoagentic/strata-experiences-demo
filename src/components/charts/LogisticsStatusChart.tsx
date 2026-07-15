import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashMetricsPeriod } from '../DashboardMetricsGrid';

const dataByPeriod: Record<DashMetricsPeriod, { name: string; processing: number; transit: number; delivered: number }[]> = {
    Day: [
        { name: "8AM", processing: 3, transit: 5, delivered: 1 }, { name: "10AM", processing: 5, transit: 8, delivered: 2 },
        { name: "12PM", processing: 4, transit: 10, delivered: 4 }, { name: "2PM", processing: 6, transit: 12, delivered: 5 },
        { name: "4PM", processing: 8, transit: 9, delivered: 7 },
    ],
    Week: [
        { name: "Mon", processing: 10, transit: 15, delivered: 5 }, { name: "Tue", processing: 12, transit: 18, delivered: 8 },
        { name: "Wed", processing: 8, transit: 20, delivered: 12 }, { name: "Thu", processing: 15, transit: 25, delivered: 10 },
        { name: "Fri", processing: 20, transit: 22, delivered: 18 },
    ],
    Month: [
        { name: "W1", processing: 42, transit: 65, delivered: 28 }, { name: "W2", processing: 38, transit: 72, delivered: 35 },
        { name: "W3", processing: 50, transit: 58, delivered: 42 }, { name: "W4", processing: 45, transit: 80, delivered: 50 },
    ],
    Quarter: [
        { name: "Jan", processing: 150, transit: 240, delivered: 120 }, { name: "Feb", processing: 180, transit: 260, delivered: 145 },
        { name: "Mar", processing: 160, transit: 280, delivered: 170 },
    ],
};

const subtitles: Record<DashMetricsPeriod, string> = {
    Day: 'Hourly Shipping Flows', Week: 'Weekly Shipping Flows', Month: 'Monthly Shipping Flows', Quarter: 'Quarterly Shipping Flows',
};

export function LogisticsStatusChart({ period = 'Month' }: { period?: DashMetricsPeriod }) {
    const data = dataByPeriod[period];
    return (
        <div className="h-[300px] w-full bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Logistics Pulse</h3>
                    <p className="text-sm text-muted-foreground">{subtitles[period]}</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#1F2937' }} />
                        <Legend />
                        <Bar dataKey="processing" stackId="a" fill="#f59e0b" name="Processing" radius={[0, 0, 0, 4]} animationDuration={600} />
                        <Bar dataKey="transit" stackId="a" fill="#3b82f6" name="In Transit" animationDuration={600} />
                        <Bar dataKey="delivered" stackId="a" fill="#10b981" name="Delivered" radius={[0, 4, 4, 0]} animationDuration={600} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
