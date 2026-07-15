import { Fragment, useState } from 'react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'

const people = [
    { id: 1, name: 'Google Inc.', avatar: 'bg-red-500' },
    { id: 2, name: 'Microsoft Corp', avatar: 'bg-blue-500' },
    { id: 3, name: 'Apple Inc.', avatar: 'bg-zinc-800' },
]

function classNames(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}

export function ProjectSelectsDemo() {
    const [selected, setSelected] = useState(people[0])

    return (
        <div className="space-y-8">
            {/* Custom Filter Dropdown */}
            <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Filter Dropdown (Listbox)</h4>
                <div className="p-6 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-white/10 min-h-[200px]">
                    <div className="max-w-xs">
                        <Listbox value={selected} onChange={setSelected}>
                            <div className="relative">
                                <ListboxButton className="relative w-full cursor-default rounded-lg bg-white dark:bg-zinc-900 py-2 pl-3 pr-10 text-left text-zinc-900 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                                    <span className="flex items-center">
                                        <span className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${selected.avatar}`} aria-hidden="true" />
                                        <span className="ml-3 block truncate">{selected.name}</span>
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                        <ChevronUpDownIcon className="h-5 w-5 text-zinc-400" aria-hidden="true" />
                                    </span>
                                </ListboxButton>

                                <ListboxOptions
                                    transition
                                    className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white dark:bg-zinc-800 py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm shadow-lg"
                                >
                                    {people.map((person) => (
                                        <ListboxOption
                                            key={person.id}
                                            className={({ focus }) =>
                                                classNames(
                                                    focus ? 'bg-indigo-600 text-white' : 'text-zinc-900 dark:text-zinc-200',
                                                    'relative cursor-default select-none py-2 pl-3 pr-9'
                                                )
                                            }
                                            value={person}
                                        >
                                            {({ selected, focus }) => (
                                                <>
                                                    <div className="flex items-center">
                                                        <span className={classNames(person.avatar, 'inline-block h-2 w-2 flex-shrink-0 rounded-full')} aria-hidden="true" />
                                                        <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}>
                                                            {person.name}
                                                        </span>
                                                    </div>

                                                    {selected && (
                                                        <span
                                                            className={classNames(
                                                                focus ? 'text-white' : 'text-indigo-600',
                                                                'absolute inset-y-0 right-0 flex items-center pr-4'
                                                            )}
                                                        >
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </ListboxOption>
                                    ))}
                                </ListboxOptions>
                            </div>
                        </Listbox>
                    </div>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                    Used for Client and Project filtering in the Dashboard. Uses Headless UI 'Listbox' for full customizability, distinct from the native 'Select'.
                </p>
            </div>
        </div>
    )
}
