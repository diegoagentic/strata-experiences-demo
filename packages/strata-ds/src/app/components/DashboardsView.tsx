import { KPICardsDemo, RecentOrdersTableDemo } from "./demos/DashboardWidgetsDemo";
import { CodeViewer } from './CodeViewer';

export function DashboardsView() {
    return (
        <section className="space-y-12 max-w-6xl mx-auto pb-20">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Dashboards</h1>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Common dashboard patterns extracted from the Catalyst application.
                    These components demonstrate how to compose primitives into complex data visualizations.
                </p>
            </div>

            {/* KPI Cards */}
            <section className="space-y-6">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">KPI Cards</h2>
                <div className="p-6 bg-zinc-50 dark:bg-black/10 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <KPICardsDemo />
                </div>
                <CodeViewer
                    title="KPI Cards Grid"
                    react={`import { CurrencyDollarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';\n\nfunction KPICard() {\n  return (\n    <div className="bg-white rounded-2xl p-6 border shadow-sm">\n      {/* ... see DashboardWidgetsDemo.tsx for full code */}\n    </div>\n  )\n}`}
                    html="<!-- Standard Tailwind Grid -->"
                    css=".card { @apply bg-white rounded-2xl p-6 border; }"
                    prompt="Create a grid of 4 KPI cards with icons, values, and trend indicators."
                />
            </section>

            {/* Data Table */}
            <section className="space-y-6">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Data Tables</h2>
                <p className="text-sm text-zinc-500">
                    A complex table with expandable rows, status badges, and action menus.
                </p>
                <div className="p-6 bg-zinc-50 dark:bg-black/10 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <RecentOrdersTableDemo />
                </div>
                <CodeViewer
                    title="Expandable Data Table"
                    react={`import { Menu, Transition } from '@headlessui/react';\n\nfunction OrdersTable() {\n  // State for expanded rows\n  const [expandedIds, setExpandedIds] = useState(new Set());\n\n  return (\n    <table className="min-w-full divide-y divide-zinc-200">\n      {/* ... see DashboardWidgetsDemo.tsx for full code */}\n    </table>\n  )\n}`}
                    html="<!-- Table with nested rows -->"
                    css=".table-row { @apply hover:bg-zinc-50 transition-colors; }"
                    prompt="Create a responsive data table with expandable rows showing detailed shipment tracking."
                />
            </section>
        </section>
    )
}
