import { Menu, MenuButton, MenuItem, MenuItems, Transition, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { Fragment, useState } from 'react'
import {
    HomeIcon, CubeIcon, ClipboardDocumentListIcon, ArrowTrendingUpIcon,
    Squares2X2Icon, SunIcon, MoonIcon, ChevronDownIcon,
    UserIcon, DocumentTextIcon, ChartBarIcon, ExclamationCircleIcon,
    CalendarIcon, EllipsisHorizontalIcon, ArrowRightOnRectangleIcon, BriefcaseIcon, CheckIcon
} from '@heroicons/react/24/outline'
import { ActionCenter } from '../../../components/catalyst/action-center';

// Mocks for documentation
const logoLightBrand = "https://placehold.co/120x40/transparent/18181b?text=STRATA"; // Placeholder or use real asset if path known
// Assuming assets might not resolve correctly in demo file without moving them, using text or placeholder for now would be safer, 
// OR simpler: we create a mock Logo component.

function Logo({ className }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 font-bold text-xl tracking-tight ${className}`}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                S
            </div>
            <span>Strata</span>
        </div>
    )
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <button className={`relative flex items-center justify-center h-9 px-2 rounded-full transition-all duration-300 group overflow-hidden ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}>
            <span className="relative z-10">{icon}</span>
            <span className={`ml-2 text-sm font-medium whitespace-nowrap max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out ${active ? 'max-w-xs opacity-100' : ''}`}>
                {label}
            </span>
        </button>
    )
}

export function CatalystNavbarDemo() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [currentTenant, setTenant] = useState('Acme Corp');
    const [activeTab, setActiveTab] = useState('Overview');

    const tenants = ['Acme Corp', 'Globex', 'Soylent Corp'];

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    // Simulate "onNavigateToWorkspace"
    const onNavigateToWorkspace = () => console.log("Navigating to workspace");
    const onLogout = () => console.log("Logging out");

    return (
        <div className={`w-full relative min-h-[120px] ${theme === 'dark' ? 'dark' : ''}`}>
            {/* Background simulation for context */}
            <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                {/* Navbar Container */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 min-w-[60%] max-w-fit lg:min-w-0 lg:max-w-5xl w-full">
                    <div className="relative flex items-center lg:justify-between px-3 py-2 rounded-full gap-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border shadow-lg dark:shadow-glow-md">

                        {/* Left Group (Logo + Tenant) */}
                        <div className="flex items-center gap-1">
                            {/* Logo */}
                            <div className="px-2 shrink-0">
                                <Logo className="text-zinc-900 dark:text-white" />
                            </div>

                            <div className="h-6 w-px bg-border mx-1 hidden lg:block"></div>

                            {/* Tenant Selector - Desktop Only */}
                            <Menu as="div" className="relative hidden lg:block">
                                <MenuButton className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors outline-none">
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none">Tenant</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-bold text-foreground leading-tight">{currentTenant}</span>
                                            <ChevronDownIcon className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                    </div>
                                </MenuButton>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <MenuItems className="absolute left-0 top-full mt-2 w-48 origin-top-left rounded-xl bg-popover shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-border p-1 z-50">
                                        {tenants.map((tenant) => (
                                            <MenuItem key={tenant}>
                                                {({ focus }) => (
                                                    <button
                                                        onClick={() => setTenant(tenant)}
                                                        className={`${focus ? 'bg-zinc-200 dark:bg-zinc-800' : ''} group flex w-full items-center px-4 py-2 text-sm text-foreground rounded-lg transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800`}
                                                    >
                                                        {tenant}
                                                        {currentTenant === tenant && <CheckIcon className="ml-auto w-4 h-4 text-foreground" />}
                                                    </button>
                                                )}
                                            </MenuItem>
                                        ))}
                                    </MenuItems>
                                </Transition>
                            </Menu>
                        </div>

                        {/* Center Group (Nav Items) - Absolutely Centered on Desktop */}
                        <div className="hidden lg:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <NavItem icon={<HomeIcon className="w-4 h-4" />} label="Overview" active={activeTab === 'Overview'} />
                            <div onClick={() => setActiveTab('Inventory')}><NavItem icon={<CubeIcon className="w-4 h-4" />} label="Inventory" active={activeTab === 'Inventory'} /></div>
                            <div onClick={() => setActiveTab('Production')}><NavItem icon={<ArrowTrendingUpIcon className="w-4 h-4" />} label="Production" active={activeTab === 'Production'} /></div>
                            <div onClick={() => setActiveTab('Orders')}><NavItem icon={<ClipboardDocumentListIcon className="w-4 h-4" />} label="Orders" active={activeTab === 'Orders'} /></div>
                        </div>

                        {/* Right Group (Actions) */}
                        <div className="flex items-center gap-1">
                            <div className="h-6 w-px bg-border mx-1 hidden lg:block"></div>

                            {/* Action Center - New Feature */}
                            <ActionCenter />

                            <div className="h-4 w-px bg-border mx-1"></div>

                            <Popover className="relative">
                                <PopoverButton className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors outline-none">
                                    <Squares2X2Icon className="w-5 h-5" />
                                </PopoverButton>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-200"
                                    enterFrom="opacity-0 translate-y-1"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition ease-in duration-150"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 translate-y-1"
                                >
                                    <PopoverPanel className="absolute top-full right-0 mt-4 w-[320px] max-h-[80vh] overflow-y-auto p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-border shadow-2xl rounded-3xl z-[100] scrollbar-minimal">
                                        <div className="space-y-4">
                                            {/* App Grid Mock */}
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="p-2 border rounded-lg text-center text-xs">CRM</div>
                                                <div className="p-2 border rounded-lg text-center text-xs">Invoice</div>
                                                <div className="p-2 border rounded-lg text-center text-xs">Docs</div>
                                            </div>
                                        </div>
                                    </PopoverPanel>
                                </Transition>
                            </Popover>

                            <button onClick={toggleTheme} className="hidden lg:flex p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                            </button>

                            <div className="relative group">
                                <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-muted transition-colors text-left outline-none">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                                        JD
                                    </div>
                                    <ChevronDownIcon className="w-3 h-3 text-muted-foreground" />
                                </button>
                                {/* User Dropdown */}
                                <div className="absolute top-full right-0 mt-2 w-56 py-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                                    <div className="px-4 py-2 border-b border-border mb-1">
                                        <p className="text-sm font-medium">John Doe</p>
                                        <p className="text-xs text-muted-foreground">Admin</p>
                                    </div>
                                    <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-muted flex items-center gap-2">
                                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
