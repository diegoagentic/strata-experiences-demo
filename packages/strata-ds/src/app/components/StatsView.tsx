import { TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart, Activity, Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { CodeViewer } from './CodeViewer';

export function StatsView() {
  const statCardReact = `import { TrendingUp, Users } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function StatCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        <TrendingUp className="h-4 w-4 text-emerald-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">$45,231.89</div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          +20.1% from last month
        </p>
      </CardContent>
    </Card>
  )
}`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Stats & Metrics
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          High-density statistical displays for dashboards and reports.
        </p>
      </div>

      {/* Grid Example */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Metric Cards
        </h2>

        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-950 dark:text-white">$45,231.89</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <TrendingUp className="h-3 w-3" /> +20.1%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Subscriptions</CardTitle>
                <Users className="h-4 w-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-950 dark:text-white">+2,350</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <TrendingUp className="h-3 w-3" /> +180.1%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Sales</CardTitle>
                <ShoppingCart className="h-4 w-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-950 dark:text-white">+12,234</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <TrendingUp className="h-3 w-3" /> +19%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Active Now</CardTitle>
                <Activity className="h-4 w-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-950 dark:text-white">+573</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <TrendingUp className="h-3 w-3" /> +201 since last hour
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <CodeViewer
          title="Metric Card"
          react={statCardReact}
          html={`<!-- Stat Card HTML -->`}
          css={`.stat-card { border: 1px solid var(--zinc-200); }`}
          prompt="Generate a set of dashboard metric cards with titles, primary values, and trend indicators."
        />
      </section>

      {/* Guidelines */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Do's</h3>
          </div>
          <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
            <li>• Use clear headings and secondary context.</li>
            <li>• Highlight growth or changes with colors and icons.</li>
            <li>• Ensure numbers are properly formatted (commas, currency).</li>
          </ul>
        </div>
      </section>
    </div>
  );
}