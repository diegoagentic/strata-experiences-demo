import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
    active?: boolean;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    return (
        <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    {index > 0 && (
                        <ChevronRightIcon className="h-4 w-4 text-muted-foreground/50" />
                    )}
                    <button
                        onClick={item.onClick}
                        disabled={!item.onClick}
                        className={cn(
                            "transition-colors",
                            item.active
                                ? "font-medium text-foreground cursor-default"
                                : item.onClick
                                    ? "hover:text-foreground hover:underline decoration-border/50 underline-offset-4 cursor-pointer"
                                    : "cursor-default"
                        )}
                    >
                        {item.label}
                    </button>
                </div>
            ))}
        </div>
    );
}
