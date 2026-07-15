import React, { useState } from 'react';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    BuildingOfficeIcon,
    MapPinIcon,
    UserIcon,
    CubeIcon,
    PencilSquareIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import LocationModal from './LocationModal';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface Location {
    id: string;
    name: string;
    description?: string;
    type: 'Warehouse' | 'Project' | 'Location' | 'Consignment';
    address: string;
    manager: string;
    capacity: string; // e.g., "600", "N/A"
    stats?: {
        items: number;
        value: string;
    };
}

const MOCK_LOCATIONS: Location[] = [
    {
        id: '1',
        name: 'Tech Storage Hub',
        description: 'Main storage for high-value electronics and IT equipment.',
        type: 'Warehouse',
        address: 'Innovation Park - Level B2',
        manager: 'Jennifer Lee',
        capacity: '600',
        stats: { items: 142, value: '$120.5k' }
    },
    {
        id: '2',
        name: 'Office Renovation Project',
        description: 'Temporary holding for renovation materials.',
        type: 'Project',
        address: 'Downtown Office - Floor 4',
        manager: 'Mike Chen',
        capacity: 'Project Site',
        stats: { items: 45, value: '$32.1k' }
    },
    {
        id: '3',
        name: 'Westside Logisitics',
        description: 'Overflow storage for furniture.',
        type: 'Warehouse',
        address: 'West Distri-park, Unit 4A',
        manager: 'Sarah Jones',
        capacity: '1200',
        stats: { items: 89, value: '$56.0k' }
    },
    {
        id: '4',
        name: 'Recception Area',
        description: 'Front desk and waiting area assets.',
        type: 'Location',
        address: 'Main Entrance',
        manager: 'Lisa Reception',
        capacity: 'N/A',
        stats: { items: 12, value: '$5.4k' }
    }
];

export default function InventoryLocations() {
    const [locations, setLocations] = useState<Location[]>(MOCK_LOCATIONS);
    const [activeTab, setActiveTab] = useState<'Warehouse' | 'Project' | 'Location' | 'Consignment'>('Warehouse');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);

    const filteredLocations = locations.filter(loc => {
        const matchesTab = loc.type === activeTab;
        const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loc.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loc.address.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const handleAddClick = () => {
        setSelectedLocation(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (loc: Location) => {
        setSelectedLocation(loc);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        if (confirm('Are you sure you want to delete this location?')) {
            setLocations(prev => prev.filter(l => l.id !== id));
        }
    };

    const handleConfirm = (data: any) => {
        if (data.id) {
            // Update
            setLocations(prev => prev.map(l => l.id === data.id ? { ...l, ...data } : l));
        } else {
            // Create
            const newLocation = {
                ...data,
                id: `loc-${Math.random().toString(36).substr(2, 9)}`,
                stats: { items: 0, value: '$0.00' } // Default stats
            };
            setLocations(prev => [newLocation, ...prev]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                {/* Tabs */}
                <div className="bg-muted p-1 rounded-lg inline-flex overflow-x-auto border border-border">
                    {(['Warehouse', 'Project', 'Location', 'Consignment'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                                activeTab === tab
                                    ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-zinc-700/50"
                            )}
                        >
                            {tab}s <span className="ml-1 text-xs opacity-60">
                                {locations.filter(l => l.type === tab).length}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:w-64">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab.toLowerCase()}s...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        />
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={handleAddClick}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add {activeTab}
                    </button>
                </div>
            </div>

            {/* Content Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredLocations.map((loc) => (
                    <div key={loc.id} className="bg-card rounded-xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow group relative">

                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{loc.name}</h3>
                                {loc.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{loc.description}</p>}
                            </div>
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEditClick(loc)}
                                    className="p-1.5 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                >
                                    <PencilSquareIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(loc.id)}
                                    className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <MapPinIcon className="w-4 h-4 shrink-0" />
                                <span className="text-foreground">{loc.address}</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <UserIcon className="w-4 h-4 shrink-0" />
                                <span>{loc.manager}</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <CubeIcon className="w-4 h-4 shrink-0" />
                                <span>Capacity: <span className="font-medium text-foreground">{loc.capacity}</span></span>
                            </div>
                        </div>

                        {/* Footer / Stats */}
                        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <div className="text-sm">
                                <span className="text-muted-foreground mr-2">Items:</span>
                                <span className="font-semibold text-foreground">{loc.stats?.items || 0}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground mr-2">Value:</span>
                                <span className="font-semibold text-foreground">{loc.stats?.value || '$0'}</span>
                            </div>
                        </div>

                    </div>
                ))}

                {/* Empty State */}
                {filteredLocations.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
                        <BuildingOfficeIcon className="w-12 h-12 text-zinc-300 mb-3" />
                        <h3 className="text-lg font-medium text-foreground">No {activeTab}s found</h3>
                        <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                            Try adjusting your search or add a new {activeTab.toLowerCase()} to get started.
                        </p>
                        <button
                            onClick={handleAddClick}
                            className="mt-4 px-4 py-2 text-primary font-medium hover:underline text-sm"
                        >
                            Add New {activeTab}
                        </button>
                    </div>
                )}
            </div>

            <LocationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                location={selectedLocation}
                type={activeTab}
            />
        </div>
    );
}
