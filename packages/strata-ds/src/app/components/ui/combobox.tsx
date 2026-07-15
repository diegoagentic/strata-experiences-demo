import * as React from "react"
import { Combobox as HeadlessCombobox, ComboboxButton as HeadlessComboboxButton, ComboboxInput as HeadlessComboboxInput, ComboboxOption as HeadlessComboboxOption, ComboboxOptions as HeadlessComboboxOptions } from "@headlessui/react"
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid"
import { cn } from "./utils"

export function Combobox({ className, ...props }: React.ComponentPropsWithoutRef<typeof HeadlessCombobox>) {
    return <HeadlessCombobox {...props} />
}

export function ComboboxInput({ className, ...props }: React.ComponentPropsWithoutRef<typeof HeadlessComboboxInput>) {
    return (
        <HeadlessComboboxInput
            {...props}
            className={cn(
                "w-full rounded-lg border border-zinc-200 bg-white py-2 pl-3 pr-10 text-left text-sm/6 text-zinc-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:shadow-none",
                className
            )}
        />
    )
}

export function ComboboxButton({ className, ...props }: React.ComponentPropsWithoutRef<typeof HeadlessComboboxButton>) {
    return (
        <HeadlessComboboxButton
            {...props}
            className={cn("absolute inset-y-0 right-0 flex items-center pr-2", className)}
        >
            <ChevronUpDownIcon className="h-5 w-5 text-zinc-400" aria-hidden="true" />
        </HeadlessComboboxButton>
    )
}

export function ComboboxOptions({ className, ...props }: React.ComponentPropsWithoutRef<typeof HeadlessComboboxOptions>) {
    return (
        <HeadlessComboboxOptions
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

export function ComboboxOption({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof HeadlessComboboxOption>) {
    return (
        <HeadlessComboboxOption
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
        </HeadlessComboboxOption>
    )
}
