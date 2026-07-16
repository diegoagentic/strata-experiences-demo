import {
    HomeIcon,
    BanknotesIcon,
    ArrowPathRoundedSquareIcon,
    PlayCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext'
import { useDemo } from '../context/DemoContext'
import { useDemoProfile } from '../context/useDemoProfile'

import ActionCenter from './notifications/ActionCenter';
import RoleSwitcher from './RoleSwitcher';
import { useViewAs } from './manufacturer/viewAsSignal';

import NavbarPill from './navbar/NavbarPill';
import ExperienceSwitcher from './navbar/ExperienceSwitcher';
import ThemeToggleButton from './navbar/ThemeToggleButton';
import UserAvatarMenu from './navbar/UserAvatarMenu';

import logoLightBrand from '../assets/logo-light-brand.png';
import logoDarkBrand from '../assets/logo-dark-brand.png';

// --- Demo Role Profiles ---
const DEMO_PROFILES: Record<string, { name: string; role: string; photo: string }> = {
    Dealer: {
        name: 'Account Manager Kai',
        role: 'Account Manager',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    },
    Expert: {
        name: 'Regional Sales Manager Reyes',
        role: 'Regional Sales Manager',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    },
    'End User': {
        name: 'Facilities Coord Cardo',
        role: 'Facilities Coordinator',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
    },
    'Sales Rep': {
        name: 'Sales Rep Marín',
        role: 'Sales Rep',
        photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face',
    },
    Designer: {
        name: 'Designer Alden',
        role: 'Designer',
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face',
    },
    SC: {
        name: 'Sales Coordinator Marks',
        role: 'Sales Coordinator',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    },
    Estimator: {
        name: 'Estimator Wells',
        role: 'Senior Estimator',
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face',
    },
    // Workspaces demo personas
    Employee: {
        name: 'Employee Alpha',
        role: 'Sales Rep',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    },
    'Operations Manager': {
        name: 'Operations Manager Solano',
        role: 'Operations Manager',
        photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face',
    },
    'AP Coordinator': {
        name: 'AP Coordinator Bell',
        role: 'AP Coordinator',
        photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face',
    },
    CFO: {
        name: 'CFO Yale',
        role: 'CFO',
        photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face',
    },
    'BFI Account Manager': {
        name: 'Account Manager DeMar',
        role: 'CoNY Account Manager',
        photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face',
    },
    'BFI Manager': {
        name: 'Manager Boyle',
        role: 'Director of Strategic Accounts · BFI',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    },
    'BFI Project Manager': {
        name: 'Operations Manager Bly',
        role: 'CoNY Project Manager',
        photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face',
    },
    'BFI Finance': {
        name: 'Finance Lead Halbert',
        role: 'Finance / AR',
        photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face',
    },
    'BFI Designer': {
        name: 'Account Manager Bly',
        role: 'Miller Knoll Rep · Designer',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    },
    'BFI Receiving': {
        name: 'Receiving Coordinator Lynn',
        role: 'Receiving Coordinator',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
    },
    // Officeworks demo personas
    'Officeworks Design Manager': {
        name: 'EVP Design',
        role: 'EVP Design & PM',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face',
    },
    'Officeworks Designer': {
        name: 'Design Manager Ellis',
        role: 'Design Manager · PA',
        photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face',
    },
    'Officeworks Sales Coordinator': {
        name: 'Sales Coordinator Marks',
        role: 'Sales Coordinator',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    },
};

// Apps that belong to Expert Hub — everything else is Dealer Experience
const EXPERT_HUB_APPS = ['expert-hub', 'ack-detail', 'transactions', 'mac', 'quote-detail'];

function resolveProfileKey(role: string | undefined, app: string | undefined): string {
    if (app?.startsWith('bfi-')) {
        if (role === 'Project Manager')      return 'BFI Project Manager';
        if (role === 'Finance / AR')         return 'BFI Finance';
        if (role === 'Designer')             return 'BFI Designer';
        if (role === 'Receiving Coordinator') return 'BFI Receiving';
        if (role === 'BFI Manager')          return 'BFI Manager';
        return 'BFI Account Manager';
    }
    if (app?.startsWith('officeworks-')) {
        if (role === 'Design Manager')    return 'Officeworks Design Manager';
        if (role === 'Designer')          return 'Officeworks Designer';
        if (role === 'Sales Coordinator') return 'Officeworks Sales Coordinator';
        return 'Officeworks Design Manager';
    }
    if (role === 'Expert') return 'Expert';
    if (role === 'Estimator') return 'Estimator';
    if (role === 'End User') return 'End User';
    if (role === 'Sales Rep') return 'Sales Rep';
    if (role === 'Designer') return 'Designer';
    if (role === 'SC') return 'SC';
    if (role === 'Employee') return 'Employee';
    if (role === 'Operations Manager') return 'Operations Manager';
    if (role === 'AP Coordinator') return 'AP Coordinator';
    if (role === 'Accountant') return 'AP Coordinator';
    if (role === 'CFO') return 'CFO';
    if (role === 'System') {
        // System steps inherit the human profile of their parent app
        if (app === 'crm') return 'Sales Rep';
        if (app?.startsWith('dupler-')) return 'Expert';
        return EXPERT_HUB_APPS.includes(app || '') ? 'Expert' : 'Dealer';
    }
    return 'Dealer';
}

// Update supported tabs
export type NavTab = 'Overview' | 'Inventory' | 'Catalogs' | 'Service Center' | 'Transactions' | 'CRM' | 'Pricing';

function NavItem({ icon, label, active = false, badge, onClick }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`relative flex items-center justify-center h-9 px-2 rounded-full transition-all duration-300 group overflow-hidden ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
        >
            <span className="relative z-10">{icon}</span>
            <span className={`ml-2 text-sm font-medium whitespace-nowrap max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out ${active ? 'max-w-xs opacity-100' : ''}`}>
                {label}
            </span>
            {badge && (
                <span className={`ml-1 text-[7px] px-1.5 py-0.5 rounded font-bold uppercase border whitespace-nowrap max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out ${active ? 'max-w-xs opacity-100 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20' : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'}`}>
                    {badge}
                </span>
            )}
        </button>
    )
}

interface NavbarProps {
    onLogout: () => void;
    activeTab?: NavTab | string;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: any) => void;
    onOpenDemoGuide?: () => void;
    appName?: string;
    companyName?: string;
    customNavigation?: { name: string, page: string, icon: any, badge?: string }[];
}

export default function Navbar({
    onLogout,
    activeTab = 'Overview',
    onNavigate,
    onOpenDemoGuide,
    appName,
    companyName,
    customNavigation
}: NavbarProps) {
    const { user } = useAuth()
    const { isDemoActive, currentStep } = useDemo()
    const { activeProfile } = useDemoProfile()
    // W11 · Dealer mirror toggle — manufacturer/dealer view, only for inbound-outbound profile
    const isInboundOutbound = activeProfile.id === 'inbound-outbound'
    const viewAs = useViewAs()

    // Demo profile — always show a profile (default to Dealer for initial screen)
    const demoProfile = isDemoActive ? DEMO_PROFILES[resolveProfileKey(currentStep?.role, currentStep?.app)] : DEMO_PROFILES['Dealer'];

    const displayName = demoProfile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
    const userInitials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

    const allNavigation = customNavigation || [
        { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
        { name: 'Service Center', page: 'mac', icon: ArrowPathRoundedSquareIcon },
        { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
    ];

    // Use the full custom navigation provided by each simulation app.
    // W11 · Service Center (page 'mac') is a dealer-side surface — hide it in Manufacturer view.
    const navigation = allNavigation.filter(
        item => !(isInboundOutbound && viewAs === 'manufacturer' && item.page === 'mac')
    );

    const leading = (
        <>
            <div className="px-2 shrink-0">
                <img src={logoLightBrand} alt="Strata" className="h-8 w-20 object-contain block dark:hidden" />
                <img src={logoDarkBrand} alt="Strata" className="h-8 w-20 object-contain hidden dark:block" />
            </div>
            <div className="h-6 w-px bg-border mx-1 hidden lg:block"></div>
            <ExperienceSwitcher appName={appName} companyName={companyName} />
        </>
    );

    const center = navigation.map(item => (
        <NavItem
            key={item.name}
            icon={<item.icon className="w-4 h-4" />}
            label={item.name}
            active={activeTab === item.page}
            badge={(item as any).badge}
            onClick={() => onNavigate(item.page)}
        />
    ));

    const trailing = (
        <>
            {/* Demo Guide - Hidden for demo build */}
            {false && onOpenDemoGuide && (
                <button
                    onClick={onOpenDemoGuide}
                    className="flex p-2 rounded-full bg-purple-100 dark:bg-ai/20 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-ai/30 transition-colors animate-pulse ring-2 ring-purple-500/60 ring-offset-2 ring-offset-background shadow-sm"
                    title="Demo Guide"
                >
                    <PlayCircleIcon className="w-5 h-5" />
                </button>
            )}

            {/* Role switcher · auto-renders when profile declares hasRoleSwitcher: true + roles[]. */}
            <div className="hidden lg:block">
                <RoleSwitcher />
            </div>

            <ThemeToggleButton />

            {/* Action Center — placed between theme toggle and profile avatar */}
            <ActionCenter />

            <UserAvatarMenu
                onLogout={onLogout}
                demoProfile={demoProfile}
                displayName={displayName}
                userInitials={userInitials}
            />
        </>
    );

    return <NavbarPill leading={leading} center={center} trailing={trailing} />;
}
