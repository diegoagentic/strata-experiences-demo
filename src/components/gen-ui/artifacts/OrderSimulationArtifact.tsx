import { useState } from 'react'
import {
    BuildingOffice2Icon,
    UserIcon,
    TruckIcon,
    CheckCircleIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    ArrowLeftIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline'

interface OrderSimulationArtifactProps {
    onBack?: () => void;
    onGeneratePO?: () => void;
}

type Role = 'manufacturer' | 'dealer' | 'end_user';

export default function OrderSimulationArtifact({ onBack, onGeneratePO }: OrderSimulationArtifactProps) {
    const [activeRole, setActiveRole] = useState<Role>('dealer');
    const [isGenerated, setIsGenerated] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const orderData = {
        id: "ORD-7829",
        items: [
            { name: "Executive Ergonomic Chair", quantity: 15, unitCost: 450, unitPrice: 850 },
            { name: "Standing Desk Pro", quantity: 15, unitCost: 600, unitPrice: 1200 },
            { name: "Conference Table (Modular)", quantity: 2, unitCost: 1500, unitPrice: 3500 }
        ],
        shipping: 1250,
        taxRate: 0.08,
        manufacturerFee: 2500 // Platform fee for manufacturer view
    };

    const calculateTotals = (role: Role) => {
        const subtotal = orderData.items.reduce((acc, item) => {
            if (role === 'manufacturer') return acc + (item.unitCost * item.quantity);
            return acc + (item.unitPrice * item.quantity);
        }, 0);

        let total = subtotal;
        let margin = 0;

        if (role === 'end_user') {
            total += orderData.shipping + (subtotal * orderData.taxRate);
        } else if (role === 'dealer') {
            const cost = orderData.items.reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
            margin = subtotal - cost;
            // Dealer sees revenue as total items price (simplified)
        } else if (role === 'manufacturer') {
            // Manufacturer sees cost + fee
            total += orderData.manufacturerFee;
        }

        return { subtotal, total, margin };
    };

    const totals = calculateTotals(activeRole);

    if (isCollapsed) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted dark:bg-zinc-800/50 animate-in fade-in zoom-in duration-300 h-full">
                <div className="bg-white/90 dark:bg-zinc-900/90 p-4 rounded-xl border border-border shadow-sm flex items-center justify-between w-full text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                            <ChartBarIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-foreground">Order Simulation</h4>
                            <p className="text-xs text-muted-foreground">Simulation view collapsed</p>
                        </div>
                    </div>
                    <button onClick={() => setIsCollapsed(false)} className="text-sm font-medium text-primary hover:underline px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                        Re-open
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex-shrink-0 p-6 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack || (() => setIsCollapsed(true))}
                        className="p-2 -ml-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors group"
                        title={onBack ? "Go Back" : "Collapse Simulation"}
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    </button>
                    <div>
                        <h3 className="text-xl font-brand font-bold text-foreground">Order Simulation</h3>
                        <p className="text-sm text-muted-foreground">Preview how this order appears to different stakeholders</p>
                    </div>
                </div>
                <div className="flex bg-muted p-1 rounded-lg">
                    <button
                        onClick={() => setActiveRole('manufacturer')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeRole === 'manufacturer'
                            ? 'bg-white dark:bg-zinc-700 text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <BuildingOffice2Icon className="w-4 h-4" /> Manufacturer
                    </button>
                    <button
                        onClick={() => setActiveRole('dealer')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeRole === 'dealer'
                            ? 'bg-white dark:bg-zinc-700 text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <UserIcon className="w-4 h-4" /> Dealer
                    </button>
                    <button
                        onClick={() => setActiveRole('end_user')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeRole === 'end_user'
                            ? 'bg-white dark:bg-zinc-700 text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <UserIcon className="w-4 h-4" /> End User
                    </button>
                </div>
            </div>

            {/* Content area: Split View Grid */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto scrollbar-micro">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">

                    {/* Left Column: Document Preview */}
                    <div className="flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden min-h-[500px]">
                        <div className="bg-muted p-3 border-b border-border font-mono text-xs flex justify-between items-center text-muted-foreground">
                            <span>
                                {activeRole === 'manufacturer' && 'preview: production_order_ORD-7829.pdf'}
                                {activeRole === 'dealer' && 'preview: purchase_order_client_ORD-7829.pdf'}
                                {activeRole === 'end_user' && 'preview: invoice_final_ORD-7829.pdf'}
                            </span>
                            <div className="flex gap-2">
                                <DocumentTextIcon className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Interactive Visual Document Layout */}
                        <div className="flex-1 p-8 overflow-y-auto bg-muted dark:bg-zinc-950/50 flex flex-col items-center">
                            <div className="w-full max-w-md bg-white border border-zinc-200 shadow-md transform transition-all hover:-translate-y-1 hover:shadow-lg p-8 rounded-sm">
                                {activeRole === 'manufacturer' && (
                                    <div className="text-zinc-900 text-[10px] space-y-4">
                                        <div className="flex justify-between items-start border-b border-zinc-300 pb-4 mb-4">
                                            <div>
                                                <h1 className="text-xl font-black uppercase tracking-widest text-zinc-800">Manufacturing Plan</h1>
                                                <p className="text-muted-foreground mt-1">Order Ref: #{orderData.id}-MFG</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold border border-zinc-300 px-2 py-1">SCHEDULED</div>
                                                <p className="mt-2 text-muted-foreground">Est. Ship: 14 Days</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="font-bold text-muted-foreground mb-1">PRODUCE FOR (DEALER)</div>
                                                <div className="font-medium">Acme Office Solutions</div>
                                                <div>Region: East Coast US</div>
                                                <div>ID: DLR-3920</div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-muted-foreground mb-1">BILL OF MATERIALS</div>
                                                <div className="p-2 bg-zinc-100 rounded">
                                                    <div>• 30x Ergonomic Frame Assy</div>
                                                    <div>• 15x Standing Desk Actuator</div>
                                                    <div>• 2x Mod-Table Core Module</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-6">
                                            <div className="font-bold mb-2">PRODUCTION QUEUE</div>
                                            {orderData.items.map((item, i) => (
                                                <div key={i} className="flex justify-between border-b border-zinc-100 py-1">
                                                    <div>{item.name}</div>
                                                    <div className="font-mono">Qty: {item.quantity}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {activeRole === 'dealer' && (
                                    <div className="text-zinc-900 text-[10px] space-y-4">
                                        <div className="flex justify-between items-start border-b-2 border-primary pb-4 mb-4">
                                            <div>
                                                <h1 className="text-xl font-black uppercase tracking-widest text-primary">Purchase Order</h1>
                                                <p className="text-muted-foreground mt-1">From: Enterprise Client LLC</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg">PO-2026-991</div>
                                                <p className="mt-1 text-muted-foreground">Date: Feb 20, 2026</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="font-bold text-muted-foreground mb-1">VENDOR</div>
                                                <div className="font-medium">Acme Office Solutions</div>
                                                <div>100 Dealer Way</div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-muted-foreground mb-1">SHIP TO</div>
                                                <div className="font-medium">Enterprise Client</div>
                                                <div>10948 Willow Court</div>
                                            </div>
                                        </div>
                                        <div className="pt-6">
                                            <div className="grid grid-cols-12 font-bold mb-2 border-b border-zinc-200 pb-1">
                                                <div className="col-span-8">Description</div>
                                                <div className="col-span-2 text-center">Qty</div>
                                                <div className="col-span-2 text-right">Price</div>
                                            </div>
                                            {orderData.items.map((item, i) => (
                                                <div key={i} className="grid grid-cols-12 border-b border-zinc-100 py-2 items-center">
                                                    <div className="col-span-8 pr-2">{item.name}</div>
                                                    <div className="col-span-2 text-center">{item.quantity}</div>
                                                    <div className="col-span-2 text-right">${item.unitPrice.toLocaleString()}</div>
                                                </div>
                                            ))}
                                            <div className="mt-4 text-right">
                                                <div className="text-lg font-bold">Total: ${totals.subtotal.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeRole === 'end_user' && (
                                    <div className="text-zinc-900 text-[10px] space-y-4 font-sans">
                                        <div className="text-center mb-6">
                                            <h1 className="text-2xl font-light tracking-wide text-zinc-800">INVOICE</h1>
                                            <p className="text-muted-foreground mt-1">Invoice #INV-7829-EU</p>
                                        </div>
                                        <div className="flex justify-between border-t border-b border-zinc-200 py-4 mb-4">
                                            <div>
                                                <div className="font-bold text-muted-foreground mb-1">BILLED TO</div>
                                                <div className="text-sm">Enterprise Client LLC</div>
                                                <div>10948 Willow Court</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-muted-foreground mb-1">AMOUNT DUE</div>
                                                <div className="text-xl font-medium text-zinc-800">${totals.total.toLocaleString()}</div>
                                                <div className="mt-1 font-bold text-green-600 bg-green-50 px-2 py-1 rounded inline-block">PAID NET-30</div>
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            {orderData.items.map((item, i) => (
                                                <div key={i} className="flex justify-between py-2 border-b border-dotted border-zinc-300">
                                                    <div>
                                                        <span className="font-medium mr-2">{item.quantity}x</span>
                                                        {item.name}
                                                    </div>
                                                    <div>${(item.unitPrice * item.quantity).toLocaleString()}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-1 mt-4 text-right pr-4">
                                            <div className="flex justify-end gap-8 text-muted-foreground">
                                                <span>Subtotal</span>
                                                <span className="w-16">${totals.subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-end gap-8 text-muted-foreground">
                                                <span>Shipping</span>
                                                <span className="w-16">${orderData.shipping.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-end gap-8 text-muted-foreground">
                                                <span>Tax</span>
                                                <span className="w-16">${(totals.subtotal * orderData.taxRate).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Pricing & Margins Panel */}
                    <div className={`flex flex-col rounded-xl border p-6 lg:p-8 shadow-sm transition-colors duration-500 ${activeRole === 'manufacturer' ? 'bg-slate-50 border-slate-200 dark:bg-slate-900/20 dark:border-slate-800' :
                        activeRole === 'dealer' ? 'bg-white border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800' :
                            'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30'
                        }`}>
                        {/* Role Specific Badge */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${activeRole === 'manufacturer' ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                                    activeRole === 'dealer' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                    {activeRole === 'manufacturer' ? 'Production Metrics' : activeRole === 'dealer' ? 'Margin Analysis' : 'Customer Cost Center'}
                                </span>
                                <h2 className="text-2xl font-bold mt-4 text-foreground text-balance">Financial Breakdown view for {activeRole.replace('_', ' ')}</h2>
                            </div>
                            <div className="text-right shrink-0">
                                {activeRole === 'dealer' && (
                                    <div className="bg-green-100 dark:bg-green-900/20 px-4 py-3 rounded-xl border border-green-200 dark:border-green-900/30">
                                        <p className="text-xs text-green-700 dark:text-green-400 font-bold uppercase">Estimated Margin</p>
                                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                            ${totals.margin.toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Line Items Detail table */}
                        <div className="space-y-4 mb-8 flex-1">
                            <div className="grid grid-cols-12 text-xs font-semibold text-muted-foreground uppercase pb-2 border-b border-border">
                                <div className="col-span-6 text-left">Line Item</div>
                                <div className="col-span-2 text-center">Qty</div>
                                <div className="col-span-2 text-right">{activeRole === 'manufacturer' ? 'Cost' : 'Price'}</div>
                                <div className="col-span-2 text-right">Total</div>
                            </div>
                            {orderData.items.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 text-sm py-3 border-b border-border/50 items-center">
                                    <div className="col-span-6 font-medium text-foreground pr-2">{item.name}</div>
                                    <div className="col-span-2 text-center text-muted-foreground">{item.quantity}</div>
                                    <div className="col-span-2 text-right text-muted-foreground">
                                        ${(activeRole === 'manufacturer' ? item.unitCost : item.unitPrice).toLocaleString()}
                                    </div>
                                    <div className="col-span-2 text-right font-medium text-foreground">
                                        ${((activeRole === 'manufacturer' ? item.unitCost : item.unitPrice) * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Footer */}
                        <div className="flex justify-end pt-4 bg-white/50 dark:bg-black/10 rounded-xl p-4 border border-black/5 dark:border-white/5">
                            <div className="w-full sm:w-64 space-y-3">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span className="font-medium">${totals.subtotal.toLocaleString()}</span>
                                </div>

                                {activeRole === 'end_user' && (
                                    <>
                                        <div className="flex justify-between text-sm text-muted-foreground border-t border-border/50 pt-2">
                                            <span>Shipping</span>
                                            <span>${orderData.shipping.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Tax (8%)</span>
                                            <span>${(totals.subtotal * orderData.taxRate).toLocaleString()}</span>
                                        </div>
                                    </>
                                )}

                                {activeRole === 'manufacturer' && (
                                    <div className="flex justify-between text-sm text-muted-foreground border-t border-border/50 pt-2">
                                        <span>Platform Fee</span>
                                        <span className="text-amber-600 dark:text-amber-500">${orderData.manufacturerFee.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="pt-2 border-t border-border flex justify-between items-baseline">
                                    <span className="font-bold text-foreground">Total</span>
                                    <span className="text-2xl font-bold text-primary">${totals.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Area */}
            {onGeneratePO && !isGenerated && (
                <div className="p-4 border-t border-border flex justify-end bg-muted dark:bg-zinc-800/50">
                    <button
                        onClick={() => {
                            setIsGenerated(true)
                            onGeneratePO()
                        }}
                        className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
                    >
                        <DocumentTextIcon className="w-5 h-5" />
                        Generate Purchase Order
                    </button>
                </div>
            )}
            {onGeneratePO && isGenerated && (
                <div className="p-4 border-t border-border flex justify-end bg-muted dark:bg-zinc-800/50">
                    <div className="px-6 py-2.5 bg-green-100 dark:bg-green-900/10 text-green-700 dark:text-green-400 font-bold rounded-xl flex items-center gap-2 border border-green-200 dark:border-green-800/50">
                        <CheckCircleIcon className="w-5 h-5" />
                        PO Generation Started
                    </div>
                </div>
            )}
        </div>
    )
}
