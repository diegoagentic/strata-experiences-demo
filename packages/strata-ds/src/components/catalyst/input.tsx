import { Input as HeadlessInput, type InputProps as HeadlessInputProps } from '@headlessui/react'
import { clsx } from 'clsx'
import React from 'react'

export interface InputProps extends HeadlessInputProps {
    className?: string
}

export function Input({ className, ...props }: InputProps) {
    return (
        <HeadlessInput
            className={clsx(
                'block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
                // Use our tokens override
                'bg-input-background text-input-text placeholder:text-input-placeholder',
                'ring-input-border focus:ring-input-border-focus',
                'disabled:cursor-not-allowed disabled:bg-input-background-disabled disabled:text-gray-500 disabled:ring-gray-200',
                className
            )}
            {...props}
        />
    )
}
