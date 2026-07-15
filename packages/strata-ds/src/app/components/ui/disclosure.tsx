import * as React from "react"
import { Disclosure as HeadlessDisclosure, DisclosureButton as HeadlessDisclosureButton, DisclosurePanel as HeadlessDisclosurePanel } from "@headlessui/react"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "./utils"

export interface DisclosureProps extends React.ComponentPropsWithoutRef<typeof HeadlessDisclosure> {
    children: React.ReactNode
}

export function Disclosure({ children, ...props }: DisclosureProps) {
    return (
        <HeadlessDisclosure {...props}>
            {children}
        </HeadlessDisclosure>
    )
}

export interface DisclosureButtonProps extends React.ComponentPropsWithoutRef<typeof HeadlessDisclosureButton> {
    children: React.ReactNode
}

export function DisclosureButton({ className, children, ...props }: DisclosureButtonProps) {
    return (
        <HeadlessDisclosureButton
            {...props}
            className={cn(
                "flex w-full items-center justify-between py-4 text-left text-sm font-medium text-zinc-900 focus:outline-none focus-visible:ring focus-visible:ring-zinc-500 focus-visible:ring-opacity-75 dark:text-zinc-100",
                className
            )}
        >
            {({ open }) => (
                <>
                    {children}
                    <ChevronDownIcon
                        className={cn("h-4 w-4 text-zinc-500 transition-transform duration-200", open && "rotate-180")}
                    />
                </>
            )}
        </HeadlessDisclosureButton>
    )
}

export interface DisclosurePanelProps extends React.ComponentPropsWithoutRef<typeof HeadlessDisclosurePanel> {
    children: React.ReactNode
}

export function DisclosurePanel({ className, children, ...props }: DisclosurePanelProps) {
    return (
        <HeadlessDisclosurePanel
            {...props}
            className={cn("pb-4 text-sm text-zinc-600 dark:text-zinc-400", className)}
        >
            {children}
        </HeadlessDisclosurePanel>
    )
}
