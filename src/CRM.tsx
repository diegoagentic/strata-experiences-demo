import Navbar from './components/Navbar'
import { useTenant } from './TenantContext'

interface PageProps {
    onLogout: () => void;
    onNavigateToDetail: () => void;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: string) => void;
}

export default function CRM({ onLogout, onNavigateToDetail, onNavigateToWorkspace, onNavigate }: PageProps) {
    const { currentTenant } = useTenant()

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-10">
            <Navbar onLogout={onLogout} activeTab="CRM" onNavigateToWorkspace={onNavigateToWorkspace} onNavigate={onNavigate} />
            <div className="pt-24 px-4 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-brand font-bold tracking-tight text-foreground">
                            {currentTenant} CRM
                        </h1>
                        <p className="text-muted-foreground mt-1">Customer Relationship Management.</p>
                    </div>
                </div>
                <div className="p-10 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
                    CRM Content Placeholder
                </div>
            </div>
        </div>
    )
}
