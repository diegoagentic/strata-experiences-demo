
import WidgetCard from './WidgetCard'
import { ChartBarIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon, ShoppingBagIcon, SparklesIcon } from '@heroicons/react/24/outline'

const inventoryItems = [
    {
        id: 'AER-B-001',
        name: 'Aeron Chair (Graphite/B)',
        stock: 42,
        velocity: 'high', // high, medium, low
        runoutDate: '4 days',
        aiSuggestion: 'Order 50 units',
        health: 'critical' // healthy, warning, critical
    },
    {
        id: 'EMB-BLK-002',
        name: 'Embody Gaming (Black)',
        stock: 12,
        velocity: 'high',
        runoutDate: '2 weeks',
        aiSuggestion: 'Order 20 units',
        health: 'warning'
    },
    {
        id: 'LNO-DSK-005',
        name: 'Lino Task Chair',
        stock: 85,
        velocity: 'medium',
        runoutDate: '> 1 month',
        aiSuggestion: 'Stock optimal',
        health: 'healthy'
    },
    {
        id: 'DSK-SIT-009',
        name: 'Nevi Sit-Stand Desk',
        stock: 110,
        velocity: 'low',
        runoutDate: '> 2 months',
        aiSuggestion: 'Monitor trends',
        health: 'healthy'
    }
]

export default function InventoryForecastWidget() {
    return (
        <WidgetCard
            title="Inventory Forecast"
            description="AI-driven stock predictions & health."
            icon={ChartBarIcon}
            action={
                <button className="text-xs font-medium text-foreground hover:text-muted-foreground dark:hover:text-zinc-300 transition-colors flex items-center gap-1">
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                    Full Report
                </button>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
                    <div className="col-span-2">Item / SKU</div>
                    <div className="text-right">Stock</div>
                    <div className="text-right">Health</div>
                </div>

                {inventoryItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-4 gap-2 items-center group">
                        <div className="col-span-2">
                            <h4 className="text-sm font-medium text-foreground truncate" title={item.name}>{item.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1 rounded">{item.id}</span>
                                {item.velocity === 'high' && (
                                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 px-1 rounded flex items-center gap-0.5">
                                        <ArrowTrendingUpIcon className="w-2.5 h-2.5" /> FAST MOVER
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                            <span className="text-sm font-semibold text-foreground">{item.stock}</span>
                            <span className="text-[10px] text-muted-foreground">Runout: {item.runoutDate}</span>
                        </div>

                        <div className="text-right flex justify-end">
                            <div className={`px-2 py-1 rounded-md text-[10px] font-bold border flex flex-col items-end w-fit ${item.health === 'critical' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' :
                                item.health === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30' :
                                    'bg-muted/50 text-muted-foreground border-border'
                                }`}>
                                <span className="uppercase tracking-wide">{item.health}</span>
                                {(item.health === 'critical' || item.health === 'warning') && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <SparklesIcon className="w-2.5 h-2.5" />
                                        <span>{item.aiSuggestion}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hover Action for Reorder (Only visible on hover for desktop, or consistent action) */}
                        {/* For simplicity in this widget view, we keep it clean. Ideally a hover action could appear. */}
                    </div>
                ))}

                {/* AI Insight Footer */}
                <div className="mt-4 pt-3 border-t border-border flex items-start gap-3 bg-indigo-50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                    <SparklesIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs text-indigo-900 dark:text-indigo-200 font-medium">AI Insight</p>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
                            High demand predicted for "Aeron Chair" next week due to 3 pending bulk quotes. Recommend increasing safety stock.
                        </p>
                    </div>
                    <button className="ml-auto text-xs font-bold text-foreground hover:text-muted-foreground whitespace-nowrap bg-card border border-border px-2 py-1 rounded shadow-sm">
                        Auto-Order
                    </button>
                </div>
            </div>
        </WidgetCard>
    )
}
