import { Description as HeadlessDescription, Field as HeadlessField, Fieldset as HeadlessFieldset, Label as HeadlessLabel, Legend as HeadlessLegend } from '@headlessui/react'
import clsx from 'clsx'
import type { ComponentPropsWithoutRef } from 'react'

export function Fieldset({ className, ...props }: ComponentPropsWithoutRef<typeof HeadlessFieldset>) {
    return (
        <HeadlessFieldset
            {...props}
            className={clsx(className, '[&>*+[data-slot=control]]:mt-6 [&>[data-slot=text]]:mt-1')}
        />
    )
}

export function Legend({ className, ...props }: ComponentPropsWithoutRef<typeof HeadlessLegend>) {
    return (
        <HeadlessLegend
            data-slot="legend"
            {...props}
            className={clsx(
                className,
                'text-base/6 font-semibold text-zinc-950 data-[disabled]:opacity-50 sm:text-sm/6 dark:text-white'
            )}
        />
    )
}

export function FieldGroup({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
    return <div data-slot="control" {...props} className={clsx(className, 'space-y-8')} />
}

export function Field({ className, ...props }: ComponentPropsWithoutRef<typeof HeadlessField>) {
    return (
        <HeadlessField
            {...props}
            className={clsx(
                className,
                '[&>[data-slot=label]+[data-slot=control]]:mt-3',
                '[&>[data-slot=label]+[data-slot=description]]:mt-1',
                '[&>[data-slot=description]+[data-slot=control]]:mt-3',
                '[&>[data-slot=control]+[data-slot=description]]:mt-3',
                '[&>[data-slot=control]+[data-slot=error]]:mt-3',
                '[&>[data-slot=label]]:font-medium'
            )}
        />
    )
}

export function Label({ className, ...props }: ComponentPropsWithoutRef<typeof HeadlessLabel>) {
    return (
        <HeadlessLabel
            data-slot="label"
            {...props}
            className={clsx(
                className,
                'select-none text-base/6 text-zinc-950 data-[disabled]:opacity-50 sm:text-sm/6 dark:text-white'
            )}
        />
    )
}

export function Description({ className, ...props }: ComponentPropsWithoutRef<typeof HeadlessDescription>) {
    return (
        <HeadlessDescription
            data-slot="description"
            {...props}
            className={clsx(
                className,
                'text-base/6 text-zinc-500 data-[disabled]:opacity-50 sm:text-sm/6 dark:text-zinc-400'
            )}
        />
    )
}

export function ErrorMessage({ className, ...props }: ComponentPropsWithoutRef<typeof HeadlessDescription>) {
    return (
        <HeadlessDescription
            data-slot="error"
            {...props}
            className={clsx(
                className,
                'text-base/6 text-red-600 data-[disabled]:opacity-50 sm:text-sm/6 dark:text-red-500'
            )}
        />
    )
}
