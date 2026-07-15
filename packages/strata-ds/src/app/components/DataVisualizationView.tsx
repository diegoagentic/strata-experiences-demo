import * as React from "react";
import { TrendingUp, Activity, ArrowUp, ArrowDown, Check, X } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Heading } from './ui/heading';
import { Text } from './ui/text';
import { CodeViewer } from './CodeViewer';

export function DataVisualizationView() {
  const timeSeriesData = [
    { name: 'Jan', revenue: 4200, users: 2400 },
    { name: 'Feb', revenue: 5100, users: 3200 },
    { name: 'Mar', revenue: 4800, users: 2800 },
    { name: 'Apr', revenue: 6200, users: 4200 },
    { name: 'May', revenue: 7100, users: 5100 },
    { name: 'Jun', revenue: 6800, users: 4800 },
  ];

  const chartReactExample = `import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ChartDemo({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="name" fontSize={12} tickLine={false} />
        <YAxis fontSize={12} tickLine={false} />
        <Tooltip />
        <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12">
        <Heading level={1} className="text-4xl font-bold mb-2">Data Visualization</Heading>
        <Text className="text-zinc-500 dark:text-zinc-400">
          Chart components and patterns for dashboards, metrics, and business intelligence.
        </Text>
      </div>

      {/* KPI Stats */}
      <section className="mb-16">
        <Heading level={2} className="text-2xl font-bold mb-6">Key Metrics</Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Text className="text-sm font-medium text-zinc-500">Total Revenue</Text>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 rounded-full">
                <ArrowUp className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-700">+12.5%</span>
              </div>
            </div>
            <Heading level={3} className="text-3xl font-bold">$45,231</Heading>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Text className="text-sm font-medium text-zinc-500">Active Users</Text>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-950/40 rounded-full">
                <ArrowDown className="w-3 h-3 text-red-600" />
                <span className="text-[10px] font-bold text-red-700">-5.2%</span>
              </div>
            </div>
            <Heading level={3} className="text-3xl font-bold">8,242</Heading>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Text className="text-sm font-medium text-zinc-500">Conversion Rate</Text>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                <Activity className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] font-bold text-zinc-600">Stable</span>
              </div>
            </div>
            <Heading level={3} className="text-3xl font-bold">3.24%</Heading>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="mb-16">
        <Heading level={2} className="text-2xl font-bold mb-6">Area Charts</Heading>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 mb-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <CodeViewer
          title="Area Chart Integration"
          react={chartReactExample}
          html={`<div class="chart-container">...svg output...</div>`}
          css={`.recharts-area { transition: all 0.3s ease; }`}
          prompt="Generate a responsive area chart using Recharts with a Zinc-compatible color palette."
        />
      </section>

      {/* Usage Guidelines */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Do's</h3>
          </div>
          <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
            <li>• Use consistent colors for the same data types across multiple charts.</li>
            <li>• Provide clear labels and tooltips for exact data point values.</li>
            <li>• Ensure sufficient contrast for line and area fills.</li>
          </ul>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <X className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Don'ts</h3>
          </div>
          <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
            <li>• Don't use too many categories in a single pie chart or stacked area.</li>
            <li>• Avoid 3D effects or excessive grid lines that clutter the view.</li>
            <li>• Don't omit the zero baseline for bar charts.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
