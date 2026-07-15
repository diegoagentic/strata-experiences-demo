import { Filter, List, Calendar } from 'lucide-react'

export type ViewMode = 'funnel' | 'list' | 'calendar'

interface CLCViewToggleProps {
    value: ViewMode
    onChange: (v: ViewMode) => void
    /** Modes to surface. Defaults to all three. When fewer than 2 modes are
        available, the toggle renders nothing (no point in a single-button
        toggle). */
    available?: ViewMode[]
    /** Mode to pulse — used as the visual bridge during step transitions
        (e.g. clc1.2 pulses Calendar before auto-switching). */
    pulse?: ViewMode | null
}

const MODE_META: Record<ViewMode, { label: string; icon: typeof Filter }> = {
    funnel:   { label: 'Funnel',   icon: Filter },
    list:     { label: 'List',     icon: List },
    calendar: { label: 'Calendar', icon: Calendar },
}

const ALL: ViewMode[] = ['funnel', 'list', 'calendar']

/**
 * Segmented control for switching between Funnel / List / Calendar views.
 * Pattern lifted from OCRTracking (smart-comparator). The `pulse` prop adds
 * a ring animation to a mode button without changing the active value —
 * used to signal incoming view transitions.
 */
export default function CLCViewToggle({ value, onChange, available = ALL, pulse }: CLCViewToggleProps) {
    if (available.length < 2) return null
    return (
        <div className="inline-flex items-center border border-border rounded-lg overflow-hidden">
            {available.map((m, idx) => {
                const meta = MODE_META[m]
                const Icon = meta.icon
                const isActive = m === value
                const isPulsing = pulse === m && !isActive
                return (
                    <button
                        key={m}
                        type="button"
                        onClick={() => onChange(m)}
                        aria-pressed={isActive}
                        aria-label={`Switch to ${meta.label} view`}
                        title={`${meta.label} view`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${idx > 0 ? 'border-l border-border' : ''} ${
                            isActive
                                ? 'bg-muted text-foreground'
                                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                        } ${isPulsing ? 'ring-2 ring-blue-400/60 animate-pulse' : ''}`}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{meta.label}</span>
                    </button>
                )
            })}
        </div>
    )
}
