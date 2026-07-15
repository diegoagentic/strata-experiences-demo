import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    BookOpenIcon,
    WrenchScrewdriverIcon,
    CubeTransparentIcon
} from '@heroicons/react/24/outline';
import CatalogLibrary from './components/catalogs/CatalogLibrary';
import ClientPolicyManager from './components/catalogs/ClientPolicyManager';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface PageProps {
    onLogout: () => void;
    onNavigateToDetail: () => void;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: string) => void;
}

export default function Catalogs({ onNavigate }: PageProps) {
    const [activeTab, setActiveTab] = useState<'library' | 'rules'>('library');
    const [highlightedTab, setHighlightedTab] = useState<string | null>(null);

    useEffect(() => {
        const handleHighlight = (e: CustomEvent) => {
            if (e.detail === 'catalog-search') {
                setActiveTab('library');
                setHighlightedTab('library');
                setTimeout(() => setHighlightedTab(null), 4000);
            }
        };
        window.addEventListener('demo-highlight', handleHighlight as EventListener);
        return () => window.removeEventListener('demo-highlight', handleHighlight as EventListener);
    }, []);

    const tabs = [
        { id: 'library', label: 'Catalog Library', icon: BookOpenIcon },
        { id: 'rules', label: 'Client Rules & Pricing', icon: WrenchScrewdriverIcon },
    ];

    return (
        <div className="min-h-screen bg-muted dark:bg-black text-foreground font-sans selection:bg-primary/20">
            {/* Header */}
            <div className="bg-muted/80 dark:bg-black/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-muted rounded-lg">
                                <CubeTransparentIcon className="w-5 h-5 text-foreground" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground">Catalog Management</h1>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-4 pb-4">
                    <div className="inline-flex p-1 bg-muted rounded-lg">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                                        isActive
                                            ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50",
                                        highlightedTab === tab.id && "ring-4 ring-brand-500 shadow-[0_0_30px_rgba(var(--brand-500),0.6)] animate-pulse"
                                    )}
                                >
                                    {/* Icons removed/hidden as per user example preference for cleaner look, or kept subtle if needed. 
                                        User said icons are hard to see, and example had none. I will remove them for now to match the "clean" example. */}
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {activeTab === 'library' ? (
                        <CatalogLibrary />
                    ) : (
                        <ClientPolicyManager />
                    )}
                </div>
            </main>
        </div>
    );
}
