import type { OcrDocType } from './OcrDocCard'

interface DocTypeChipProps {
    type: OcrDocType
    /** Visual size. md is the default for cards/lists, sm fits inline next
        to a title. */
    size?: 'sm' | 'md'
    className?: string
}

/**
 * Distinct color per document category so users can scan a list and
 * instantly tell PO / ACK / Quote / Invoice apart. The labels render
 * the full name (no PO/ACK abbreviations) and use title case rather
 * than uppercase so the chip reads as a category, not a shout.
 */
function chipClasses(type: OcrDocType): string {
    switch (type) {
        case 'Purchase Order':
            return 'bg-info/10 text-info dark:bg-info/15 dark:text-info'
        case 'Acknowledgment':
            return 'bg-warning/10 text-warning dark:bg-warning/15 dark:text-warning'
        case 'Quote':
            return 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300'
        case 'Invoice':
            return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
        default:
            return 'bg-muted text-muted-foreground'
    }
}

/** Full human label — never abbreviated. Note we render "Acknowledgement"
    (British spelling) even though the internal type is "Acknowledgment" —
    matches the customer-facing copy. */
export function docTypeLabel(type: OcrDocType): string {
    switch (type) {
        case 'Purchase Order': return 'Purchase Order'
        case 'Acknowledgment': return 'Acknowledgement'
        case 'Quote':          return 'Quote'
        case 'Invoice':        return 'Invoice'
        default:               return String(type)
    }
}

export default function DocTypeChip({ type, size = 'md', className = '' }: DocTypeChipProps) {
    const sizeClasses = size === 'sm'
        ? 'text-[10px] px-1.5 py-0.5'
        : 'text-[11px] px-2 py-0.5'
    return (
        <span
            className={`inline-flex items-center font-bold rounded-md tracking-tight whitespace-nowrap ${sizeClasses} ${chipClasses(type)} ${className}`}
        >
            {docTypeLabel(type)}
        </span>
    )
}
