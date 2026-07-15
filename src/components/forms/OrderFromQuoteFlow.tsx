import { useState, useEffect } from 'react'
import {
    DocumentTextIcon,
    MagnifyingGlassIcon,
    ArrowRightIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    PencilSquareIcon,
    BanknotesIcon,
    BuildingOfficeIcon,
    CalendarIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { type OrderFormData } from './OrderCreationForm'
import OrderAdaptationArtifact from '../gen-ui/artifacts/OrderAdaptationArtifact'

interface OrderFromQuoteFlowProps {
    onOrderCreate: (data: OrderFormData) => void;
    onEditDetails: (data: OrderFormData) => void;
    onCancel: () => void;
}

// Mock Approved Quotes
const MOCK_QUOTES = [
    {
        id: 'Q-2024-089',
        customer: 'City Builders Inc.',
        customerId: 'CUST-002',
        project: 'Downtown Lofts',
        value: 14250.00,
        formattedValue: '$14,250.00',
        date: '2024-02-04',
        status: 'Approved',
        shippingAddress: '123 Warehouse Dr, Industrial Park, NY 10001',
        items: [
            { id: 'q1-1', description: 'Hardwood Flooring (Oak)', qty: 1500, unitPrice: 8.50, total: 12750.00 },
            { id: 'q1-2', description: 'Underlayment Roll', qty: 30, unitPrice: 50.00, total: 1500.00 }
        ]
    },
    {
        id: 'Q-2024-092',
        customer: 'Apex Furniture',
        customerId: 'CUST-004',
        project: 'Office Expansion',
        value: 8400.00,
        formattedValue: '$8,400.00',
        date: '2024-02-05',
        status: 'Approved',
        shippingAddress: '456 Retail Blvd, Shopping Center, TX 75001',
        items: [
            { id: 'q2-1', description: 'Glass Partition Wall', qty: 10, unitPrice: 800.00, total: 8000.00 },
            { id: 'q2-2', description: 'Install Kit', qty: 4, unitPrice: 100.00, total: 400.00 }
        ]
    },
    {
        id: 'Q-2024-085',
        customer: 'Metro Construction',
        customerId: 'CUST-001',
        project: 'Repair Material',
        value: 2100.00,
        formattedValue: '$2,100.00',
        date: '2024-01-30',
        status: 'Approved',
        shippingAddress: '789 Construction Way, Site B, NJ 07001',
        items: [
            { id: 'q3-1', description: 'Industrial Adhesive', qty: 50, unitPrice: 42.00, total: 2100.00 }
        ]
    }
]

export default function OrderFromQuoteFlow({ onOrderCreate, onEditDetails, onCancel }: OrderFromQuoteFlowProps) {
    const [step, setStep] = useState<'selection' | 'processing' | 'review' | 'editing'>('selection');
    const [selectedQuote, setSelectedQuote] = useState<typeof MOCK_QUOTES[0] | null>(null);
    const [progress, setProgress] = useState(0);

    // Simulate Processing
    useEffect(() => {
        if (step === 'processing') {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setStep('review');
                        return 100;
                    }
                    return prev + 10; // Faster than import
                });
            }, 80);
            return () => clearInterval(interval);
        }
    }, [step]);

    const handleSelectQuote = (quote: typeof MOCK_QUOTES[0]) => {
        setSelectedQuote(quote);
        setStep('processing');
        setProgress(0);
    };

    const getOrderData = (): OrderFormData => {
        if (!selectedQuote) {
            throw new Error("No quote selected");
        }
        return {
            customerId: selectedQuote.customerId,
            poNumber: `PO-FROM-${selectedQuote.id}`,
            projectRef: selectedQuote.project,
            shippingAddress: selectedQuote.shippingAddress,
            billingAddress: 'Same as Shipping',
            requestedDate: new Date().toISOString().split('T')[0],
            notes: `Converted from Quote ${selectedQuote.id}`,
            items: selectedQuote.items
        };
    };

    return (
        <div className="h-[600px] flex flex-col bg-muted/30">
            {/* Header */}
            <div className="px-8 py-6 border-b border-border bg-background flex items-center gap-4">
                <button
                    onClick={() => {
                        if (step === 'selection') onCancel();
                        else setStep('selection');
                    }}
                    className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
                >
                    <ArrowPathIcon className={clsx("w-5 h-5 text-muted-foreground", step === 'selection' ? "rotate-90" : "")} />
                    {step !== 'selection' && <span className="sr-only">Back</span>}
                </button>
                <div>
                    <h2 className="text-xl font-brand font-bold text-foreground">
                        {step === 'selection' ? 'Select Approved Quote' :
                            step === 'processing' ? 'Processing Quote...' : 'Review & Confirm Order'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {step === 'selection' ? 'Choose an approved quote to convert into a purchase order.' :
                            step === 'processing' ? 'Validating quote details and checking stock levels.' :
                                'Review the order details derived from the quote.'}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">

                {/* 1. Selection Step */}
                {step === 'selection' && (
                    <div className="h-full overflow-y-auto p-8 animate-in slide-in-from-left duration-300">
                        <div className="max-w-4xl mx-auto space-y-4">
                            {/* Search Mock */}
                            <div className="relative mb-6">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search by Quote ID, Customer, or Project..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                />
                            </div>

                            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold border-b border-border">
                                        <tr>
                                            <th className="px-6 py-3">Quote Details</th>
                                            <th className="px-6 py-3">Customer & Project</th>
                                            <th className="px-6 py-3 text-right">Value</th>
                                            <th className="px-6 py-3 text-center">Status</th>
                                            <th className="px-6 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {MOCK_QUOTES.map((quote) => (
                                            <tr key={quote.id} className="group hover:bg-muted dark:hover:bg-zinc-800/30 transition-colors">
                                                <div className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{quote.id}</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">{quote.date}</div>
                                                </div>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{quote.customer}</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">{quote.project}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-foreground">
                                                    {quote.formattedValue}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900">
                                                        {quote.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleSelectQuote(quote)}
                                                        className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 transform translate-x-2 group-hover:translate-x-0 duration-200"
                                                    >
                                                        Convert to Order
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Processing Step */}
                {step === 'processing' && (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                        <div className="w-full max-w-sm space-y-6">
                            <div className="relative w-20 h-20 mx-auto">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-zinc-200 dark:text-zinc-800" />
                                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={226.2} strokeDashoffset={226.2 - (226.2 * progress / 100)} className="text-primary transition-all duration-100 ease-linear" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
                                    {progress}%
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Converting Quote...</h3>
                                <p className="text-sm text-muted-foreground mt-2">Transferring items, validating pricing, and checking inventory availability.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Review Step */}
                {step === 'review' && selectedQuote && (
                    <div className="h-full overflow-y-auto p-8 animate-in slide-in-from-right duration-300">
                        <div className="max-w-4xl mx-auto">

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                                            <BuildingOfficeIcon className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-semibold text-muted-foreground uppercase">Customer</span>
                                    </div>
                                    <div className="font-semibold text-foreground">{selectedQuote.customer}</div>
                                    <div className="text-sm text-muted-foreground truncate">{selectedQuote.project}</div>
                                </div>
                                <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                                            <BanknotesIcon className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-semibold text-muted-foreground uppercase">Total Value</span>
                                    </div>
                                    <div className="font-semibold text-foreground">{selectedQuote.formattedValue}</div>
                                    <div className="text-sm text-muted-foreground">PO-FROM-{selectedQuote.id}</div>
                                </div>
                                <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                                            <CalendarIcon className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-semibold text-muted-foreground uppercase">Requested Date</span>
                                    </div>
                                    <div className="font-semibold text-foreground">{new Date().toLocaleDateString()}</div>
                                    <div className="text-sm text-muted-foreground">Standard Delivery</div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-8">
                                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/50 dark:bg-zinc-800/20">
                                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                                        <DocumentTextIcon className="w-5 h-5 text-muted-foreground" />
                                        Order Items
                                    </h3>
                                    <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full border border-green-100 dark:border-green-800">
                                        All items in stock
                                    </span>
                                    '</div>
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted dark:bg-zinc-800/50 text-xs text-muted-foreground font-semibold border-b border-border">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Description</th>
                                            <th className="px-6 py-3 font-medium text-center">Qty</th>
                                            <th className="px-6 py-3 font-medium text-right">Unit Price</th>
                                            <th className="px-6 py-3 font-medium text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {selectedQuote.items.map((item) => (
                                            <tr key={item.id} className="hover:bg-muted dark:hover:bg-zinc-800/30">
                                                <td className="px-6 py-3 font-medium text-foreground">{item.description}</td>
                                                <td className="px-6 py-3 text-center text-muted-foreground">{item.qty}</td>
                                                <td className="px-6 py-3 text-right text-muted-foreground">${item.unitPrice.toFixed(2)}</td>
                                                <td className="px-6 py-3 text-right font-medium text-foreground">${item.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-muted/50 dark:bg-zinc-800/20 font-semibold text-foreground border-t border-border">
                                        <tr>
                                            <td colSpan={3} className="px-6 py-3 text-right text-muted-foreground">Total</td>
                                            <td className="px-6 py-3 text-right">{selectedQuote.formattedValue}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setStep('editing')}
                                    className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted dark:hover:bg-zinc-800 transition-colors font-medium text-sm flex items-center gap-2"
                                >
                                    <PencilSquareIcon className="w-4 h-4" />
                                    Review & Adapt Details
                                </button>
                                <button
                                    onClick={() => onOrderCreate(getOrderData())}
                                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm shadow-lg shadow-primary/20 flex items-center gap-2"
                                >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Confirm & Create Order
                                </button>
                            </div>

                        </div>
                    </div>
                )}

                {/* 4. Adaptation Logic (Advanced Edit) */}
                {step === 'editing' && selectedQuote && (
                    <OrderAdaptationArtifact
                        initialData={getOrderData()}
                        onConfirm={onOrderCreate}
                        onCancel={() => setStep('review')}
                    />
                )}

            </div>
        </div>
    )
}
