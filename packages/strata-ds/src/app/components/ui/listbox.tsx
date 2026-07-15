import * as React from "react"
import { Listbox as HeadlessListbox, ListboxButton as HeadlessListboxButton, ListboxOption as HeadlessListboxOption, ListboxOptions as HeadlessListboxOptions, ListboxSelectedIcon as HeadlessListboxSelectedIcon } from "@headlessui/react"
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid"
import { cn } from "./utils"

export function Listbox({ className, ...props }: React.ComponentPropsWithoutRef<typeof HeadlessListbox>) {
    return <HeadlessListbox {...props} />
}

export function ListboxButton({ className, ...props }: React.ComponentPropsWithoutRef<typeof HeadlessListboxButton>) {
    return (
        <HeadlessListboxButton
            {...props}
            className={cn(
                "relative block w-full appearance-none rounded-lg border border-zinc-200 bg-white py-[calc(theme(spacing[2.5])-1px)] px-[calc(theme(spacing[3.5])-1px)] text-left text-sm/6 text-zinc-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:shadow-none",
                "aria-expanded:border-zinc-300 dark:aria-expanded:border-zinc-700",
                className
            )}
        />
    )
}

export function ListboxOptions({ className, ...props }: React.ComponentPropsWithoutRef<typeof HeadlessListboxOptions>) {
    return (
        <HeadlessListboxOptions
            {...props}
            transition
            className={cn(
                "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-zinc-200 bg-white p-1 text-sm shadow-lg ring-1 ring-zinc-900/5 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10 dark:shadow-none",
                "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0",
                className
            )}
        />
    )
}

export function ListboxOption({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof HeadlessListboxOption>) {
    return (
        <HeadlessListboxOption
            {...props}
            className={cn(
                "group relative cursor-default select-none rounded-lg py-2 pl-3 pr-9 text-zinc-900 transition-colors data-[focus]:bg-zinc-100 dark:text-white dark:data-[focus]:bg-zinc-800",
                className
            )}
        >
            {(bag) => (
                <>
                    <div className={cn("flex items-center gap-3")}>
                        {typeof children === 'function' ? children(bag) : children}
                    </div>
                    {bag.selected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-600 dark:text-zinc-400">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                    )}
                </>
            )}
        </HeadlessListboxOption>
    )
}

export function ListboxLabel({ className, ...props }: React.ComponentPropsWithoutRef<"span">) {
    return <span {...props} className={cn("block truncate font-medium", className)} />
}

export function ListboxDescription({ className, ...props }: React.ComponentPropsWithoutRef<"span">) {
    return <span {...props} className={cn("block truncate text-zinc-500 dark:text-zinc-400 px-2 text-xs", className)} />
}
