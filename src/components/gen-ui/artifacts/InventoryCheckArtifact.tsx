import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useGenUI } from '../../../context/GenUIContext';

export default function InventoryCheckArtifact({ data }: { data: any }) {
    const { sendMessage } = useGenUI();

    const warehouses = [
        { id: 'w1', name: 'Main Distribution Center', location: 'Chicago, IL', available: 142, status: 'In Stock', leadTime: '1-3 days' },
        { id: 'w2', name: 'East Coast Hub', location: 'Newark, NJ', available: 20, status: 'Low Stock', leadTime: '2-4 days' },
        { id: 'w3', name: 'West Coast Hub', location: 'Los Angeles, CA', available: 85, status: 'In Stock', leadTime: '1-3 days' }
    ];

    return (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-blue-100 dark:border-blue-800 flex items-center gap-2">
                <GlobeAltIcon className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Global Inventory Check</h4>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-700 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-lg">
                            🪑
                        </div>
                        <div>
                            <h4 className="font-medium text-foreground text-sm">{data.item}</h4>
                            <p className="text-xs text-muted-foreground">SKU: {data.sku}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">247 Total</div>
                        <div className="text-xs text-muted-foreground">Global Available</div>
                    </div>
                </div>

                {/* Warehouse List */}
                <div className="space-y-2">
                    {warehouses.map((wh) => (
                        <div key={wh.id} className="bg-muted dark:bg-zinc-800/50 rounded-lg p-3 flex items-start justify-between border border-zinc-100 dark:border-zinc-700">
                            <div>
                                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                    {wh.name}
                                    {wh.status === 'Low Stock' && <span className="flex w-2 h-2 rounded-full bg-amber-500"></span>}
                                    {wh.status === 'In Stock' && <span className="flex w-2 h-2 rounded-full bg-green-500"></span>}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">{wh.location} • Lead time: {wh.leadTime}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-bold text-foreground">{wh.available}</span>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Units</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
