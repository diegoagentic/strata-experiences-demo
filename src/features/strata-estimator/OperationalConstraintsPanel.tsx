// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Operational Constraints Panel
// Phase 7 of WRG Demo v6 implementation
//
// Left: planned install days + 4 constraint toggles (Union Force, Stair
// Carry, After Hours, Protection). Right: dark crew-capacity card driven
// by the hero's derived crewSize. Flipping any toggle recomputes the hero.
// ═══════════════════════════════════════════════════════════════════════════════

import { clsx } from 'clsx'
import { Calendar, HardHat, Moon, Shield, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { OperationalVariables } from './types'

interface OperationalConstraintsPanelProps {
    variables: OperationalVariables
    onVariablesChange: (variables: OperationalVariables) => void
    crewSize: number
    readOnly?: boolean
}

interface Toggle {
    key: keyof Omit<OperationalVariables, 'duration'>
    label: string
    description: string
    icon: LucideIcon
}

const TOGGLES: Toggle[] = [
    {
        key: 'isUnion',
        label: 'Union Force',
        description: 'Union labor rate',
        icon: Users,
    },
    {
        key: 'noElevator',
        label: 'Stair Carry',
        description: '+30% hours multiplier',
        icon: HardHat,
    },
    {
        key: 'afterHours',
        label: 'After Hours',
        description: '+50% hours multiplier',
        icon: Moon,
    },
    {
        key: 'siteProtection',
        label: 'Site Protection',
        description: '+5% hours multiplier',
        icon: Shield,
    },
]

export default function OperationalConstraintsPanel({
    variables,
    onVariablesChange,
    crewSize,
    readOnly = false,
}: OperationalConstraintsPanelProps) {
    const setField = <K extends keyof OperationalVariables>(
        key: K,
        value: OperationalVariables[K]
    ) => {
        onVariablesChange({ ...variables, [key]: value })
    }

    return (
        <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
                <HardHat className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Operational Constraints
                </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Left column: duration + toggles */}
                <div className="space-y-4">
                    {/* Planned Install Days */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-foreground dark:text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-foreground">
                                    Planned Install Days
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    Drives crew capacity
                                </p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <input
                                type="number"
                                min={1}
                                value={variables.duration}
                                onChange={(e) =>
                                    setField('duration', Math.max(1, parseFloat(e.target.value) || 1))
                                }
                                readOnly={readOnly}
                                className="w-14 bg-transparent text-xl font-semibold text-foreground dark:text-primary text-right focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5"
                            />
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Days
                            </span>
                        </div>
                    </div>

                    {/* 2x2 toggle grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {TOGGLES.map((t) => {
                            const Icon = t.icon
                            const active = variables[t.key]
                            return (
                                <label
                                    key={t.key}
                                    className={clsx(
                                        'flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors',
                                        active
                                            ? 'bg-primary/10 ring-1 ring-primary/40'
                                            : 'bg-muted/40 hover:bg-muted/60'
                                    )}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Icon
                                            className={clsx(
                                                'w-4 h-4 shrink-0',
                                                active ? 'text-foreground dark:text-primary' : 'text-muted-foreground'
                                            )}
                                        />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-foreground truncate">
                                                {t.label}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground truncate">
                                                {t.description}
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={active}
                                        onChange={(e) => setField(t.key, e.target.checked)}
                                        disabled={readOnly}
                                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary shrink-0 disabled:opacity-60 disabled:cursor-default"
                                    />
                                </label>
                            )
                        })}
                    </div>
                </div>

                {/* Right column: crew capacity card · follows the button brand
                    treatment (bg-brand-300 + dark text in light mode, dark card
                    with primary text in dark mode) so contrast matches the
                    Estimator CTA. */}
                <div className="bg-brand-300 dark:bg-zinc-950 rounded-2xl p-6 flex items-start justify-between overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-zinc-900 dark:text-brand-400 uppercase tracking-widest mb-2">
                            Target Crew Capacity
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold tracking-tight text-foreground">
                                {crewSize}
                            </span>
                            <span className="text-sm font-medium text-zinc-900/70 dark:text-muted-foreground">
                                installers
                            </span>
                        </div>
                        <p className="text-[11px] text-zinc-900/70 dark:text-muted-foreground mt-3 max-w-[16rem] leading-relaxed">
                            Based on total adjusted hours, the selected install
                            duration, and an 8-hour working day.
                        </p>
                    </div>
                    <HardHat
                        className="w-24 h-24 text-zinc-800 dark:text-primary shrink-0"
                        strokeWidth={1.5}
                        aria-hidden
                    />
                </div>
            </div>
        </div>
    )
}
