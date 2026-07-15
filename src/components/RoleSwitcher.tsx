/**
 * RoleSwitcher · registry-driven role toggle.
 *
 * Auto-renders when the active profile declares `roles[]` +
 * `hasRoleSwitcher: true`. Reads/writes via roleSignal so any component
 * gating features by role stays in sync without prop-drilling.
 *
 * Visual pattern kept from ViewAsToggle (neutral bordered trigger + small
 * uppercase "View as" label · Headless UI Menu with check marks). This
 * replaces the inbound-outbound-specific toggle for every profile that
 * opts in.
 */

import { Fragment } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import {
    Factory, Store, ChevronDown, Check,
    Building2, User, Users, Wrench, Truck, Palette, ClipboardCheck,
    Calculator, Sparkles, Receipt, ShieldCheck, Mail, Calendar, Folder,
} from 'lucide-react'
import { useDemoProfile } from '../context/useDemoProfile'
import { useCurrentRole, writeRole } from '../lib/roleSignal'

// Registry of icon aliases — profiles reference roles by string alias
// (declarative config stays free of React imports).
const ICON_MAP = {
    factory: Factory,
    store: Store,
    building: Building2,
    user: User,
    users: Users,
    wrench: Wrench,
    truck: Truck,
    palette: Palette,
    'clipboard-check': ClipboardCheck,
    calculator: Calculator,
    sparkles: Sparkles,
    receipt: Receipt,
    shield: ShieldCheck,
    mail: Mail,
    calendar: Calendar,
    folder: Folder,
} as const

export type RoleIconAlias = keyof typeof ICON_MAP

export default function RoleSwitcher() {
    const { activeProfile } = useDemoProfile()

    if (!activeProfile.hasRoleSwitcher || !activeProfile.roles || activeProfile.roles.length === 0) {
        return null
    }

    const roles = activeProfile.roles
    const defaultRoleId = activeProfile.defaultRoleId ?? roles[0].id
    const currentId = useCurrentRole(activeProfile.id, defaultRoleId) ?? defaultRoleId
    const current = roles.find(r => r.id === currentId) ?? roles[0]
    const CurrentIcon = current.icon ? ICON_MAP[current.icon as RoleIconAlias] ?? User : User

    return (
        <div className="inline-flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">View as</span>
            <Menu as="div" className="relative inline-block text-left">
                <MenuButton className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs font-medium hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <CurrentIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {current.label}
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
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
                    <MenuItems className="absolute right-0 mt-1.5 w-52 origin-top-right rounded-lg border border-border bg-popover p-1 shadow-lg z-[70] focus:outline-none">
                        {roles.map((role) => {
                            const Icon = role.icon ? ICON_MAP[role.icon as RoleIconAlias] ?? User : User
                            return (
                                <MenuItem key={role.id}>
                                    {({ active }) => (
                                        <button
                                            type="button"
                                            onClick={() => writeRole(activeProfile.id, role.id)}
                                            className={`flex w-full items-center gap-2 h-8 px-2.5 rounded-md text-xs font-medium text-foreground transition-colors ${active ? 'bg-muted' : ''}`}
                                        >
                                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                            <span className="flex-1 text-left">{role.label}</span>
                                            {currentId === role.id && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
                                        </button>
                                    )}
                                </MenuItem>
                            )
                        })}
                    </MenuItems>
                </Transition>
            </Menu>
        </div>
    )
}
