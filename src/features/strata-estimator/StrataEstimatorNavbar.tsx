// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Top Navbar
// Phase 3 + Phase 15 (visual alignment with main Strata Navbar)
//
// Floating pill navbar that mirrors `src/components/Navbar.tsx`:
//  · Strata logo (light/dark) · DEALER EXPERIENCE / WRG label
//  · Center: 3 tabs (ESTIMATOR / PROJECTS / CONFIG) with expand-on-hover
//  · Right: sync status · backup icons · dark-mode toggle · connected user
// ═══════════════════════════════════════════════════════════════════════════════

import { clsx } from 'clsx'
import {
    Archive,
    CheckCircle2,
    Download,
    LayoutDashboard,
    MoonIcon,
    RefreshCw,
    Save,
    SunIcon,
    UploadCloud,
} from 'lucide-react'
// @ts-ignore — strata-design-system doesn't ship .d.ts; matches src/components/Navbar.tsx
import { useTheme } from 'strata-design-system'
import { useDemo } from '../../context/DemoContext'
import logoLightBrand from '../../assets/logo-light-brand.png'
import logoDarkBrand from '../../assets/logo-dark-brand.png'
import type { EstimatorTab, SyncStatus } from './types'

export interface ConnectedUser {
    name: string
    role: string
    photo: string
}

interface StrataEstimatorNavbarProps {
    activeTab: EstimatorTab
    onTabChange: (tab: EstimatorTab) => void
    syncStatus: SyncStatus
    onSave: () => void
    onExportBackup?: () => void
    onImportBackup?: () => void
    connectedUser?: ConnectedUser
    highlightImport?: boolean
}

const TABS: Array<{ id: EstimatorTab; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'ESTIMATOR', label: 'Estimator', icon: LayoutDashboard },
    { id: 'PROJECTS', label: 'Projects', icon: Archive },
]

// Expand-on-hover nav item (mirrors NavItem in src/components/Navbar.tsx)
function NavItem({
    icon,
    label,
    active,
    onClick,
}: {
    icon: React.ReactNode
    label: string
    active: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                'relative flex items-center justify-center h-9 px-2 rounded-full transition-all duration-300 group overflow-hidden',
                active
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
            )}
        >
            <span className="relative z-10">{icon}</span>
            <span
                className={clsx(
                    'ml-2 text-sm font-medium whitespace-nowrap max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out',
                    active && 'max-w-xs opacity-100'
                )}
            >
                {label}
            </span>
        </button>
    )
}

export default function StrataEstimatorNavbar({
    activeTab,
    onTabChange,
    syncStatus,
    onSave,
    onExportBackup,
    onImportBackup,
    connectedUser,
    highlightImport = false,
}: StrataEstimatorNavbarProps) {
    const { theme, toggleTheme } = useTheme()
    const { isDemoActive, isSidebarCollapsed } = useDemo()
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed

    return (
        <div
            className={clsx(
                'fixed top-6 z-50 flex justify-center px-6 lg:px-10 transition-all duration-300',
                sidebarExpanded ? 'left-80 right-0' : 'left-0 right-0'
            )}
        >
            <div
                className={clsx(
                    'relative flex items-center lg:justify-between px-3 py-2 rounded-full gap-1 bg-card/80 backdrop-blur-xl border border-border shadow-lg dark:shadow-glow-md w-full transition-all duration-300',
                    sidebarExpanded ? 'max-w-5xl' : 'max-w-7xl'
                )}
            >

                {/* ── Left: Logo + DEALER EXPERIENCE / WRG ────────────────── */}
                <div className="flex items-center gap-1">
                    <div className="px-2 shrink-0">
                        <img
                            src={logoLightBrand}
                            alt="Strata"
                            className="h-8 w-20 object-contain block dark:hidden"
                        />
                        <img
                            src={logoDarkBrand}
                            alt="Strata"
                            className="h-8 w-20 object-contain hidden dark:block"
                        />
                    </div>

                    <div className="h-6 w-px bg-border mx-1 hidden lg:block" />

                    <div className="hidden lg:flex flex-col items-start px-2 py-1.5">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none">
                            Estimator
                        </span>
                        <span className="text-sm font-bold text-foreground leading-tight">
                            WRG
                        </span>
                    </div>

                    {/* Sync status — icon only, label expands on hover */}
                    <button
                        type="button"
                        title={syncStatus === 'synced' ? 'Recovery Active' : 'Auto-Saving'}
                        className={clsx(
                            'group hidden md:flex items-center h-7 px-1.5 rounded-full overflow-hidden transition-all duration-300 cursor-default',
                            syncStatus === 'synced'
                                ? 'hover:bg-green-500/10'
                                : 'hover:bg-blue-500/10'
                        )}
                    >
                        {syncStatus === 'synced' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        ) : (
                            <RefreshCw className="h-3.5 w-3.5 text-blue-500 animate-spin shrink-0" />
                        )}
                        <span
                            className={clsx(
                                'ml-1.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out',
                                syncStatus === 'synced'
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-blue-600 dark:text-blue-400'
                            )}
                        >
                            {syncStatus === 'synced' ? 'Recovery Active' : 'Auto-Saving'}
                        </span>
                    </button>
                </div>

                {/* ── Center: 3 tabs (expand on hover) ────────────────────── */}
                <div className="hidden lg:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    {TABS.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <NavItem
                                key={tab.id}
                                icon={<Icon className="w-4 h-4" />}
                                label={tab.label}
                                active={activeTab === tab.id}
                                onClick={() => onTabChange(tab.id)}
                            />
                        )
                    })}
                </div>

                {/* ── Right: backup · save · theme · user ────────────────── */}
                <div className="flex items-center gap-1">
                    {/* Backup icon buttons */}
                    <button
                        onClick={onExportBackup}
                        title="Export Project Data"
                        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <Download className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onImportBackup}
                        title="Import Project Data"
                        className={clsx(
                            'p-2 rounded-full transition-all duration-300',
                            highlightImport
                                ? 'bg-primary text-primary-foreground ring-4 ring-primary/40 shadow-lg shadow-primary/30 scale-110 animate-pulse'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                    >
                        <UploadCloud className="h-4 w-4" />
                    </button>

                    {/* Save Project CTA */}
                    <button
                        onClick={onSave}
                        className="ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                        <Save className="h-3.5 w-3.5" />
                        <span className="hidden xl:inline">Save</span>
                    </button>

                    <div className="h-4 w-px bg-border mx-1" />

                    {/* Dark mode toggle */}
                    <button
                        onClick={toggleTheme}
                        className="hidden lg:flex p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <SunIcon className="w-4 h-4" />
                        ) : (
                            <MoonIcon className="w-4 h-4" />
                        )}
                    </button>

                    {/* Connected user (role indicator for WRG demo) */}
                    {connectedUser && (
                        <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-muted transition-colors text-left outline-none">
                            <img
                                src={connectedUser.photo}
                                alt={connectedUser.name}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/40 shrink-0"
                            />
                            <div className="hidden sm:flex flex-col items-start max-w-[140px]">
                                <span className="text-xs font-semibold text-foreground leading-tight truncate w-full">
                                    {connectedUser.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground leading-none">
                                    {connectedUser.role}
                                </span>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
