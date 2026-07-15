/**
 * ViewAsToggle · UI control for the dealer mirror (W11)
 *
 * Dropdown "View as" role switch (manufacturer / dealer). The trigger is a
 * NEUTRAL bordered button (icon + role + chevron) — visually distinct from the
 * navbar's lime "active page" pill, removing the redundancy of two identical
 * active controls. Switching dispatches the viewAs signal; a transient
 * RoleSwitchToast confirms the change (no persistent banner).
 */

import { Fragment } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { Factory, Store, ChevronDown, Check } from 'lucide-react'
import { useViewAs, writeViewAs, type ViewAs } from './viewAsSignal'

const OPTIONS: { id: ViewAs; label: string; Icon: typeof Factory }[] = [
    { id: 'manufacturer', label: 'Manufacturer', Icon: Factory },
    { id: 'dealer', label: 'Dealer', Icon: Store },
]

export default function ViewAsToggle() {
    const viewAs = useViewAs()
    const current = OPTIONS.find((o) => o.id === viewAs) ?? OPTIONS[0]
    const CurrentIcon = current.Icon

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
                    <MenuItems className="absolute right-0 mt-1.5 w-44 origin-top-right rounded-lg border border-border bg-popover p-1 shadow-lg z-[70] focus:outline-none">
                        {OPTIONS.map(({ id, label, Icon }) => (
                            <MenuItem key={id}>
                                {({ active }) => (
                                    <button
                                        type="button"
                                        onClick={() => writeViewAs(id)}
                                        className={`flex w-full items-center gap-2 h-8 px-2.5 rounded-md text-xs font-medium text-foreground transition-colors ${active ? 'bg-muted' : ''}`}
                                    >
                                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                        <span className="flex-1 text-left">{label}</span>
                                        {viewAs === id && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
                                    </button>
                                )}
                            </MenuItem>
                        ))}
                    </MenuItems>
                </Transition>
            </Menu>
        </div>
    )
}
