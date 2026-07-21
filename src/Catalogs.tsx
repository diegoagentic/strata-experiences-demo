import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import ClientPolicyManager from './components/catalogs/ClientPolicyManager';

interface PageProps {
    onLogout: () => void;
    onNavigateToDetail: () => void;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: string) => void;
}

// Catalog Library tab removed 2026-07-21 · that surface belongs to the
// standalone catalog project and will be re-integrated when the catalog
// project ships. This shared block now focuses solely on Client Rules &
// Pricing (ClientPolicyManager).
export default function Catalogs({}: PageProps) {
    return (
        <div className="min-h-screen bg-muted dark:bg-black text-foreground font-sans selection:bg-primary/20">
            {/* Header */}
            <div className="bg-muted/80 dark:bg-black/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-muted rounded-lg">
                                <WrenchScrewdriverIcon className="w-5 h-5 text-foreground" aria-hidden="true" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground">Rule Builder</h1>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <ClientPolicyManager />
                </div>
            </main>
        </div>
    );
}
