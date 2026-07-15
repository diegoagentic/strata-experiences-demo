import { Checkbox as HeadlessCheckbox, Field as HeadlessField, Fieldset as HeadlessFieldset, Label as HeadlessLabel } from '@headlessui/react'
import clsx from 'clsx'
import type { ComponentPropsWithoutRef } from 'react'

export function CheckboxGroup({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
    return (
        <div
            data-slot="control"
            {...props}
            className={clsx(
                className,
                'space-y-3',
            )}
        />
    )
}

export function CheckboxField({ className, ...props }: ComponentPropsWithoutRef<typeof HeadlessField>) {
    return (
        <HeadlessField
            data-slot="field"
            {...props}
            className={clsx(
                className,
                'flex items-center gap-3',
            )}
        />
    )
}

export function Checkbox({ className, ...props }: ComponentPropsWithoutRef<typeof HeadlessCheckbox>) {
    return (
        <HeadlessCheckbox
            data-slot="control"
            {...props}
            className={clsx(
                className,
                'group flex h-5 w-5 items-center justify-center rounded border border-zinc-200 bg-white ring-offset-zinc-950 dark:border-zinc-800 dark:bg-zinc-900',
                'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-blue-500',
                'data-[checked]:bg-blue-500 data-[checked]:border-blue-500',
                'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
            )}
        >
            <svg
                className="h-3.5 w-3.5 stroke-white opacity-0 group-data-[checked]:opacity-100"
                viewBox="0 0 14 14"
                fill="none"
            >
                <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </HeadlessCheckbox>
    )
}
