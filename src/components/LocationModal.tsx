import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, BuildingOfficeIcon, MapPinIcon, UserIcon, CubeIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: any) => void;
    location?: any; // If provided, we are in Edit mode
    type?: 'Warehouse' | 'Project' | 'Location' | 'Consignment'; // Default type if adding
}

export default function LocationModal({ isOpen, onClose, onConfirm, location, type = 'Warehouse' }: LocationModalProps) {
    const isEdit = !!location;
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        manager: '',
        capacity: '',
        type: type
    });

    useEffect(() => {
        if (isOpen) {
            if (location) {
                setFormData({
                    name: location.name,
                    description: location.description || '',
                    address: location.address || location.location || '',
                    manager: location.manager || '',
                    capacity: location.capacity || '',
                    type: location.type || type
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    address: '',
                    manager: '',
                    capacity: '',
                    type: type
                });
            }
        }
    }, [isOpen, location, type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({
            ...formData,
            id: location?.id // Preserve ID if editing
        });
        onClose();
    };

    return (
        <Transition show={isOpen} as={React.Fragment}>
            <Dialog onClose={onClose} className="relative z-50">
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <Dialog.Title className="text-lg font-semibold text-foreground">
                                    {isEdit ? 'Edit Location' : 'Create Location'}
                                </Dialog.Title>
                                <button onClick={onClose} className="p-1 rounded-full hover:bg-accent text-muted-foreground transition-colors">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all pl-9"
                                                placeholder="e.g. Tech Storage Hub"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                            <BuildingOfficeIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                                        <textarea
                                            className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all min-h-[80px]"
                                            placeholder="Enter description..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Address / Location</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all pl-9"
                                                placeholder="e.g. Innovation Park - Level B2"
                                                value={formData.address}
                                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            />
                                            <MapPinIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1">Manager</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all pl-9"
                                                    placeholder="John Doe"
                                                    value={formData.manager}
                                                    onChange={e => setFormData({ ...formData, manager: e.target.value })}
                                                />
                                                <UserIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1">Capacity</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all pl-9"
                                                    placeholder="e.g. 600"
                                                    value={formData.capacity}
                                                    onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                                />
                                                <CubeIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-border">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm shadow-primary/25"
                                    >
                                        {isEdit ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
