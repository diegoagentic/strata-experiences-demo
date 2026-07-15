import clsx from 'clsx'
import type { ComponentPropsWithoutRef } from 'react'

export function StackedList({ className, ...props }: ComponentPropsWithoutRef<'ul'>) {
    return (
        <ul
            {...props}
            role="list"
            className={clsx(className, 'divide-y divide-zinc-100 dark:divide-zinc-800')}
        />
    )
}

export function StackedListItem({ className, ...props }: ComponentPropsWithoutRef<'li'>) {
    return (
        <li
            {...props}
            className={clsx(className, "flex justify-between gap-x-6 py-5")}
        />
    )
}
