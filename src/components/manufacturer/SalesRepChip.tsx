/**
 * SalesRepChip · Quote header chip (Asly N13)
 *
 * Shows who owns the quote and earns commission. Lives in QuoteDetail header
 * metadata row (Z1 zone) so Sara can see project ownership at a glance.
 */

import { User } from 'lucide-react'

interface SalesRepChipProps {
    name: string
    role?: string
    initials?: string
    /** Hide the inline avatar bubble (compact mode). */
    compact?: boolean
}

function deriveInitials(name: string): string {
    return name
        .split(' ')
        .map(part => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
}

export default function SalesRepChip({ name, role = 'Sales Rep', initials, compact = false }: SalesRepChipProps) {
    const display = initials ?? deriveInitials(name)
    return (
        <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-muted/40 border border-border hover:bg-muted/60 transition-colors">
            {!compact && (
                <span
                    aria-hidden="true"
                    className="h-5 w-5 rounded-full bg-primary/20 text-foreground text-[9px] font-bold uppercase tracking-wider flex items-center justify-center shrink-0"
                >
                    {display || <User className="h-3 w-3" />}
                </span>
            )}
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {role}
            </span>
            <span className="text-xs font-semibold text-foreground">
                {name}
            </span>
        </span>
    )
}
