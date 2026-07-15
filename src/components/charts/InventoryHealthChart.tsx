import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashMetricsPeriod } from '../DashboardMetricsGrid';

const dataByPeriod: Record<DashMetricsPeriod, { name: string; available: number; reserved: number; backordered: number }[]> = {
    Day: [
        { name: "Seating", available: 45, reserved: 22, backordered: 8 }, { name: "Desks", available: 32, reserved: 15, backordered: 5 },
        { name: "Storage", available: 20, reserved: 85, backordered: 18 }, { name: "Tables", available: 28, reserved: 38, backordered: 7 },
        { name: "Access.", available: 18, reserved: 42, backordered: 2 },
    ],
    Week: [
        { name: "Seating", available: 210, reserved: 120, backordered: 45 }, { name: "Desks", available: 160, reserved: 72, backordered: 25 },
        { name: "Storage", available: 105, reserved: 490, backordered: 98 }, { name: "Tables", available: 140, reserved: 195, backordered: 40 },
        { name: "Access.", available: 95, reserved: 240, backordered: 10 },
    ],
    Month: [
        { name: "Seating", available: 400, reserved: 240, backordered: 100 }, { name: "Desks", available: 300, reserved: 139, backordered: 50 },
        { name: "Storage", available: 200, reserved: 980, backordered: 200 }, { name: "Tables", available: 278, reserved: 390, backordered: 80 },
        { name: "Access.", available: 189, reserved: 480, backordered: 20 },
    ],
    Quarter: [
        { name: "Seating", available: 1200, reserved: 720, backordered: 300 }, { name: "Desks", available: 900, reserved: 420, backordered: 150 },
        { name: "Storage", available: 600, reserved: 2940, backordered: 600 }, { name: "Tables", available: 834, reserved: 1170, backordered: 240 },
        { name: "Access.", available: 567, reserved: 1440, backordered: 60 },
    ],
};

export function InventoryHealthChart({ period = 'Month' }: { period?: DashMetricsPeriod }) {
    const data = dataByPeriod[period];
    return (
        <div className="h-[350px] w-full bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Inventory Health</h3>
                    <p className="text-sm text-muted-foreground">Stock availability by Category</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#1F2937' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="available" stackId="a" fill="#10b981" name="Available" radius={[0, 0, 4, 4]} animationDuration={600} />
                        <Bar dataKey="reserved" stackId="a" fill="#f59e0b" name="Reserved" animationDuration={600} />
                        <Bar dataKey="backordered" stackId="a" fill="#ef4444" name="Backordered" radius={[4, 4, 0, 0]} animationDuration={600} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
