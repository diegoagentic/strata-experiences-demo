import React, { useState, useEffect } from 'react';
import {
    XMarkIcon,
    MapPinIcon,
    CalendarIcon,
    TruckIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Consistent with Inventory page filters
const LOCATION_OPTIONS = [
    'Main Warehouse',
    'Office Renovation Project',
    'Reception Area',
    'Floor 2 Office',
    'Floor 3 Open Plan',
    'Floor 4 Office'
];

interface RelocateAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    // For simplicity, receiving just IDs or basic details
    selectedCount: number;
    onConfirm: (data: any) => void;
}

export default function RelocateAssetModal({ isOpen, onClose, selectedCount, onConfirm }: RelocateAssetModalProps) {
    const [targetLocation, setTargetLocation] = useState('');
    const [moveDate, setMoveDate] = useState('');
    const [notes, setNotes] = useState('');

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setTargetLocation('');
            setMoveDate('');
            setNotes('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({
            targetLocation,
            moveDate,
            notes,
            count: selectedCount
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <TruckIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Relocate Assets</h2>
                            <p className="text-sm text-muted-foreground">Moving {selectedCount} item{selectedCount !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Location Select */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">New Location</label>
                        <div className="relative">
                            <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                            <select
                                required
                                value={targetLocation}
                                onChange={(e) => setTargetLocation(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:outline-none appearance-none text-sm"
                            >
                                <option value="" disabled>Select destination...</option>
                                {LOCATION_OPTIONS.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Moving items to a different project or warehouse will create a movement request.
                        </p>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Scheduled Date</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                            <input
                                type="date"
                                required
                                value={moveDate}
                                onChange={(e) => setMoveDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm text-foreground"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Notes / Instructions</label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add handling instructions or specific details..."
                            className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm resize-none"
                        ></textarea>
                    </div>

                </form>

                {/* Footer */}
                <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit} // Trigger form submit via button click
                        disabled={!targetLocation || !moveDate}
                        className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        <TruckIcon className="w-4 h-4" />
                        Create Movement
                    </button>
                </div>
            </div>
        </div>
    );
}
