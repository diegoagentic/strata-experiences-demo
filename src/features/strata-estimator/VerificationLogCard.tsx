// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Verification Log Card
// Refinement Phase 7.5 (w2.3 preamble — Expert took over after Designer)
//
// Tiny 3-row checklist that appears above the Bill of Materials when the
// demo lands on w2.3. Bridges the handoff transition (w2.2 → w2.3) and the
// PricingWaterfall auto-open, so the user visibly sees "Alex verified
// these three things" before the finalization animation plays.
//
// The card auto-dismisses from the DOM when it leaves (handled via the
// parent conditional) — this component has no timers of its own.
// ═══════════════════════════════════════════════════════════════════════════════

import { Check, Clock } from 'lucide-react'

interface VerificationLogCardProps {
    verifiedByName: string
    verifiedByPhoto: string
    verifiedAt: number
}

interface VerificationRow {
    label: string
    detail: string
}

const ROWS: VerificationRow[] = [
    {
        label: 'Cost summary',
        detail: 'Base cost + margin confirmed',
    },
    {
        label: 'OFS Serpentine',
        detail: '14 h install (standard brackets, modular assembly)',
    },
    {
        label: 'Applied rate',
        detail: '$57/hr · JPS contract line',
    },
]

function formatElapsed(ts: number): string {
    const seconds = Math.max(0, Math.round((Date.now() - ts) / 1000))
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.round(seconds / 60)
    return `${minutes}m ago`
}

export default function VerificationLogCard({
    verifiedByName,
    verifiedByPhoto,
    verifiedAt,
}: VerificationLogCardProps) {
    return (
        <div
            className="rounded-2xl bg-green-500/5 dark:bg-green-500/10 border border-green-500/30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-400"
            role="status"
        >
            <div className="flex items-center gap-3 px-5 py-3 border-b border-green-500/20">
                <img
                    src={verifiedByPhoto}
                    alt={verifiedByName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-green-500/40 shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider leading-none">
                        Verified by {verifiedByName}
                    </p>
                    <p className="text-xs text-foreground font-semibold leading-tight">
                        All modules approved — draft ready to assemble
                    </p>
                </div>
                <span className="shrink-0 flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatElapsed(verifiedAt)}
                </span>
            </div>

            <ul className="px-5 py-3 space-y-1.5">
                {ROWS.map((row) => (
                    <li
                        key={row.label}
                        className="flex items-start gap-2 text-xs"
                    >
                        <Check
                            className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0 mt-0.5"
                            strokeWidth={3}
                        />
                        <span className="text-foreground font-semibold">
                            {row.label}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground truncate">
                            {row.detail}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
