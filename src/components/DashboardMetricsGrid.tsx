import { useState } from 'react';
import { SalesAreaChart } from './charts/SalesAreaChart';
import { CategoryDonutChart } from './charts/CategoryDonutChart';
import { FunnelBarChart } from './charts/FunnelBarChart';
import { InventoryHealthChart } from './charts/InventoryHealthChart';
import { QuotePipelineChart } from './charts/QuotePipelineChart';
import { LogisticsStatusChart } from './charts/LogisticsStatusChart';
import { MarginTrendChart } from './charts/MarginTrendChart';
import { TeamWorkloadChart } from './charts/TeamWorkloadChart';
import { ClientTreemapChart } from './charts/ClientTreemapChart';

export type DashMetricsPeriod = 'Day' | 'Week' | 'Month' | 'Quarter';

interface DashboardMetricsGridProps {
    selectedClient: string;
}

export default function DashboardMetricsGrid({ selectedClient }: DashboardMetricsGridProps) {
    const [period, setPeriod] = useState<DashMetricsPeriod>('Month');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Performance Command Center</h3>
                    <p className="text-sm text-muted-foreground">
                        {selectedClient === 'All Clients' ? 'Overview across all clients' : `Showing analytics for ${selectedClient}`}
                    </p>
                </div>
                {/* Period Selector */}
                <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 border border-border/50">
                    {(['Day', 'Week', 'Month', 'Quarter'] as DashMetricsPeriod[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${
                                p === period
                                    ? 'bg-white dark:bg-brand-400 text-foreground dark:text-zinc-900 shadow-sm border border-border dark:border-transparent'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-700'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Primary Metrics - Row 1: Inventory Health (hero) + Category Donut */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="xl:col-span-3">
                    <InventoryHealthChart period={period} />
                </div>
                <div className="xl:col-span-1">
                    <CategoryDonutChart period={period} />
                </div>
            </div>

            {/* Complementary Metrics - Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300 delay-100">
                <div className="xl:col-span-2">
                    <SalesAreaChart period={period} />
                </div>
                <div className="xl:col-span-1">
                    <FunnelBarChart period={period} />
                </div>
                <div className="xl:col-span-1">
                    <LogisticsStatusChart period={period} />
                </div>
                <div className="xl:col-span-1">
                    <TeamWorkloadChart period={period} />
                </div>
                <div className="xl:col-span-1">
                    <QuotePipelineChart period={period} />
                </div>
                <div className="xl:col-span-2">
                    <MarginTrendChart period={period} />
                </div>
                <div className="xl:col-span-1">
                    <ClientTreemapChart period={period} />
                </div>
            </div>
        </div>
    );
}
