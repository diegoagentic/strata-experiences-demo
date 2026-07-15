// Post-Neocon-review (2026-06-05):
//   Round 1: OCR / RPA / API removed per Christian 7:42/8:11/10:07.
//   Round 2 (PDF #11 + user 2026-06-06): reduced further to just Email + Manual
//     per Wendy verbatim ("Source, just MANUAL and EMAIL, eliminate the other ones").
//     PDF authority overrides the transcript on this one — user decision.
export type TransactionSource = 'Email' | 'Manual'

const SOURCE_STYLES: Record<TransactionSource, string> = {
    'Email':  'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30',
    'Manual': 'bg-gray-50 text-foreground border-gray-200 dark:bg-gray-500/10 dark:text-gray-300 dark:border-gray-500/30',
}

interface Props {
    source: TransactionSource
    /** Override displayed text while keeping the source-type styling. */
    label?: string
    size?: 'sm' | 'xs'
    className?: string
}

export default function SourceBadge({ source, label, size = 'sm', className = '' }: Props) {
    const sizing = size === 'xs'
        ? 'text-[9px] px-1.5 py-0.5'
        : 'text-[10px] px-2 py-0.5'
    return (
        <span className={`inline-flex items-center rounded-full border font-medium uppercase tracking-wider whitespace-nowrap ${sizing} ${SOURCE_STYLES[source]} ${className}`}>
            {label ?? source}
        </span>
    )
}
