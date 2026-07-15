import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashMetricsPeriod } from '../DashboardMetricsGrid';

const dataByPeriod: Record<DashMetricsPeriod, { name: string; active: number; completed: number }[]> = {
    Day: [
        { name: "Sarah J.", active: 3, completed: 2 }, { name: "Mike T.", active: 4, completed: 1 },
        { name: "Emma W.", active: 2, completed: 5 }, { name: "James L.", active: 3, completed: 1 },
        { name: "Olivia R.", active: 1, completed: 3 },
    ],
    Week: [
        { name: "Sarah J.", active: 8, completed: 5 }, { name: "Mike T.", active: 10, completed: 7 },
        { name: "Emma W.", active: 5, completed: 11 }, { name: "James L.", active: 7, completed: 3 },
        { name: "Olivia R.", active: 4, completed: 9 },
    ],
    Month: [
        { name: "Sarah J.", active: 12, completed: 8 }, { name: "Mike T.", active: 15, completed: 10 },
        { name: "Emma W.", active: 8, completed: 15 }, { name: "James L.", active: 10, completed: 5 },
        { name: "Olivia R.", active: 6, completed: 12 },
    ],
    Quarter: [
        { name: "Sarah J.", active: 35, completed: 28 }, { name: "Mike T.", active: 42, completed: 31 },
        { name: "Emma W.", active: 22, completed: 48 }, { name: "James L.", active: 30, completed: 18 },
        { name: "Olivia R.", active: 18, completed: 38 },
    ],
};

export function TeamWorkloadChart({ period = 'Month' }: { period?: DashMetricsPeriod }) {
    const data = dataByPeriod[period];
    return (
        <div className="h-[300px] w-full bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Team Workload</h3>
                    <p className="text-sm text-muted-foreground">Tasks per team member</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} width={80} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#1F2937' }} />
                        <Legend />
                        <Bar dataKey="active" fill="#f43f5e" name="Active Tasks" radius={[0, 4, 4, 0]} barSize={10} animationDuration={600} />
                        <Bar dataKey="completed" fill="#14b8a6" name="Completed" radius={[0, 4, 4, 0]} barSize={10} animationDuration={600} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
