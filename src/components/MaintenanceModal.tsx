import React, { useState, useEffect } from 'react';
import {
    XMarkIcon,
    WrenchScrewdriverIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface MaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCount: number;
    onConfirm: (data: any) => void;
}

const SERVICE_PROVIDERS = [
    'Internal Maintenance Team',
    'BrightLights Services',
    'OfficeFix Pro',
    'CoolAir Systems',
    'TechSupport Squad'
];

export default function MaintenanceModal({ isOpen, onClose, selectedCount, onConfirm }: MaintenanceModalProps) {
    const [issueType, setIssueType] = useState('repair');
    const [provider, setProvider] = useState('');
    const [date, setDate] = useState('');

    // Reset
    useEffect(() => {
        if (isOpen) {
            setIssueType('repair');
            setProvider('');
            setDate('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({ issueType, provider, date });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            ></div>

            <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                            <WrenchScrewdriverIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Schedule Maintenance</h2>
                            <p className="text-sm text-muted-foreground">For {selectedCount} item{selectedCount !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Maintenance Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Repair', 'Inspection', 'Cleaning', 'Upgrade'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setIssueType(type)}
                                    className={cn(
                                        "py-2 px-3 text-sm font-medium rounded-lg border transition-all",
                                        issueType === type
                                            ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                                            : "bg-card border-input text-muted-foreground hover:bg-accent"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Service Provider</label>
                        <select
                            required
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="w-full p-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                        >
                            <option value="" disabled>Select provider...</option>
                            {SERVICE_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Scheduled Date</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm text-foreground"
                        />
                    </div>
                </form>

                <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!issueType || !provider || !date}
                        className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Schedule
                    </button>
                </div>
            </div>
        </div>
    );
}
