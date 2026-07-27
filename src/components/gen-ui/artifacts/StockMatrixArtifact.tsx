import { MapPinIcon, ShoppingCartIcon, TruckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useGenUI } from '../../../context/GenUIContext';

export default function StockMatrixArtifact({ data }: { data: any }) {
    const [reserved, setReserved] = useState(false);
    const { sendMessage, pushSystemArtifact } = useGenUI();

    const handleReserve = () => {
        setReserved(true);
        setTimeout(() => {
            sendMessage("System: Fast-Track Checkout initiated. Creating Purchase Order for immediate pickup.", "system");
            pushSystemArtifact("Purchase Order automatically generated based on your account terms.", {
                id: 'art_urgent_po_' + Date.now(),
                type: 'order_placed',
                title: 'Purchase Order #URG-992',
                data: { orderId: 'URG-992', client: 'Internal Procurement', total: '$4,250.00', status: 'Ready for Pickup' },
                source: 'System'
            });
        }, 800);
    };

    if (reserved) {
        return (
            <div className="p-4 bg-info/10 dark:bg-info/15 rounded-lg border border-info/30 dark:border-info/40 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                <div className="p-1 bg-info/15 dark:bg-info/20 rounded-full text-info">
                    <TruckIcon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-semibold text-info dark:text-info text-sm">Stock Reserved</h4>
                    <p className="text-xs text-info dark:text-info mt-1">Pickup scheduled for tomorrow at Chicago Warehouse.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-info/10 dark:bg-info/15 px-4 py-3 border-b border-info/20 dark:border-info/40 flex items-center gap-2">
                <TruckIcon className="w-4 h-4 text-info dark:text-info" />
                <h4 className="font-semibold text-info dark:text-info text-sm">Urgent Stock Locator</h4>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-lg">
                            📦
                        </div>
                        <div>
                            <h4 className="font-medium text-foreground text-sm">{data.item}</h4>
                            <p className="text-xs text-muted-foreground">SKU: HD-2992-BLK</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-success">{data.qty} Available</div>
                        <div className="text-xs text-muted-foreground">Total Stock</div>
                    </div>
                </div>

                {/* Location Match */}
                <div className="bg-muted dark:bg-zinc-800/50 rounded-lg p-3 flex items-start gap-3 border border-zinc-100 dark:border-zinc-700">
                    <MapPinIcon className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-foreground">{data.location}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">25 mins away • Open until 8 PM</p>
                        {data.canPickup && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-success/15 text-success text-[10px] font-bold rounded">
                                Available for Tomorrow Pickup
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleReserve}
                    className="w-full py-2.5 bg-info hover:bg-info/90 text-white rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                    <ShoppingCartIcon className="w-4 h-4" />
                    Fast-Track Checkout
                </button>
            </div>
        </div>
    );
}
