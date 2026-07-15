import { ResponsiveContainer, Tooltip, Treemap } from "recharts";
import type { DashMetricsPeriod } from '../DashboardMetricsGrid';

const dataByPeriod: Record<DashMetricsPeriod, { name: string; size: number; fill: string }[]> = {
    Day: [
        { name: "TechDealer", size: 520, fill: "#6366f1" }, { name: "Global Logistics", size: 380, fill: "#8b5cf6" },
        { name: "Urban Living", size: 210, fill: "#d946ef" }, { name: "ModernOffice", size: 340, fill: "#0ea5e9" },
        { name: "Retail Corp", size: 150, fill: "#10b981" }, { name: "Startup Inc", size: 280, fill: "#f59e0b" },
    ],
    Week: [
        { name: "TechDealer", size: 2200, fill: "#6366f1" }, { name: "Global Logistics", size: 1800, fill: "#8b5cf6" },
        { name: "Urban Living", size: 1100, fill: "#d946ef" }, { name: "ModernOffice", size: 1600, fill: "#0ea5e9" },
        { name: "Retail Corp", size: 900, fill: "#10b981" }, { name: "Startup Inc", size: 1400, fill: "#f59e0b" },
    ],
    Month: [
        { name: "TechDealer", size: 4000, fill: "#6366f1" }, { name: "Global Logistics", size: 3000, fill: "#8b5cf6" },
        { name: "Urban Living", size: 2000, fill: "#d946ef" }, { name: "ModernOffice", size: 2780, fill: "#0ea5e9" },
        { name: "Retail Corp", size: 1890, fill: "#10b981" }, { name: "Startup Inc", size: 2390, fill: "#f59e0b" },
    ],
    Quarter: [
        { name: "TechDealer", size: 12000, fill: "#6366f1" }, { name: "Global Logistics", size: 9500, fill: "#8b5cf6" },
        { name: "Urban Living", size: 6200, fill: "#d946ef" }, { name: "ModernOffice", size: 8400, fill: "#0ea5e9" },
        { name: "Retail Corp", size: 5800, fill: "#10b981" }, { name: "Startup Inc", size: 7100, fill: "#f59e0b" },
    ],
};

const CustomizeContent = (props: any) => {
    const { depth, x, y, width, height, payload, name } = props;
    return (
        <g>
            <rect x={x} y={y} width={width} height={height}
                style={{ fill: (payload && payload.fill) || '#8884d8', stroke: '#fff', strokeWidth: 2 / (depth + 1e-10), strokeOpacity: 1 / (depth + 1e-10) }}
            />
            {width > 50 && height > 50 ? (
                <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={14}>{name}</text>
            ) : null}
        </g>
    );
};

export function ClientTreemapChart({ period = 'Month' }: { period?: DashMetricsPeriod }) {
    const data = dataByPeriod[period];
    return (
        <div className="h-[300px] w-full bg-card rounded-xl p-4 border border-border shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Client Value</h3>
                    <p className="text-sm text-muted-foreground">Revenue concentration</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <Treemap data={data} dataKey="size" aspectRatio={4 / 3} stroke="#fff" fill="#8884d8" content={<CustomizeContent />} animationDuration={600}>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </Treemap>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
