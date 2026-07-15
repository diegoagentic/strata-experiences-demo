import React, { useState } from 'react';
import { ShieldCheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useGenUI } from '../../../context/GenUIContext';
import DiscountStructureWidget from './AssetReview/DiscountStructureWidget';

export default function PricingConfigurationArtifact({ data, onConfirm }: { data: any, onConfirm?: () => void }) {
    const { sendMessage } = useGenUI();
    const [selectedWarranty, setSelectedWarranty] = useState<string>('Standard Warranty');
    const totalValue = data?.totalValue || 134250;

    return (
        <div className="bg-card rounded-2xl border border-border w-[800px] overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-muted border-b border-border p-6 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold font-brand text-foreground">Pricing Configuration</h2>
                    <p className="text-sm text-muted-foreground">Apply warranties and discount rules before final review.</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Estimated Base</div>
                    <div className="text-xl font-bold text-foreground">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-2 gap-6">
                {/* Warranties */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                            <ShieldCheckIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-foreground">Warranty Coverage</h3>
                    </div>

                    <div className="space-y-3">
                        {['Standard Warranty', 'Extended Protection (+50/ea)', 'Premium Care (+120/ea)'].map((plan) => {
                            const isSelected = selectedWarranty === plan;
                            return (
                                <button
                                    key={plan}
                                    onClick={() => setSelectedWarranty(plan)}
                                    className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between ${isSelected
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10'
                                        : 'border-zinc-100 dark:border-zinc-700 hover:border-indigo-200'
                                        }`}
                                >
                                    <div>
                                        <div className={`font-bold text-sm ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-foreground'}`}>
                                            {plan}
                                        </div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-300'}`}>
                                        {isSelected && <CheckCircleIcon className="w-3 h-3" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Discounts */}
                <div className="h-full">
                    <DiscountStructureWidget
                        subtotal={totalValue}
                        onApply={() => { }}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-muted border-t border-border flex justify-end">
                <button
                    onClick={() => {
                        if (onConfirm) {
                            onConfirm();
                        } else {
                            sendMessage("Confirm Pricing", 'user');
                        }
                    }}
                    className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg shadow-sm hover:scale-[1.02] transition-transform flex items-center gap-2"
                >
                    <CheckCircleIcon className="w-5 h-5" />
                    Confirm & Review Assets
                </button>
            </div>
        </div>
    );
}
