/**
 * COMPONENT: CapacityHeatmap
 * PURPOSE: Display ~30 designers grouped by 3 manager regions with
 *          color-coded utilization (CEO #2 SC5 pain point dramatization)
 *
 * Regions:
 *   - DC + Southern    (Felicia Miano-Poles · ~10 designers)
 *   - MA / NY / NJ     (Rebecca Warren · ~10 designers)
 *   - PA / Pittsburgh / Ancillary  (Kimberly Tucker · ~10 designers)
 *
 * Utilization color:
 *   - text-success (green): available (< 60%)
 *   - text-warning (yellow): limited (60-85%)
 *   - text-destructive (red): at-capacity (> 85%)
 *
 * DS TOKENS: bg-card · bg-success/10 · bg-warning/10 · bg-destructive/10 ·
 *            text-foreground · text-muted-foreground · border-border
 */

import { Users, CheckCircle2 } from 'lucide-react'

interface Designer {
    name: string
    region: 'dc' | 'ma' | 'pa'
    utilization: number
    priorMANATT?: boolean
    isLead?: boolean
}

const DESIGNERS: Designer[] = [
    // DC + Southern (Felicia)
    { name: 'Felicia Miano-Poles', region: 'dc', utilization: 95, isLead: true, priorMANATT: true },
    { name: 'Sandra Park',         region: 'dc', utilization: 72 },
    { name: 'James O\'Brien',      region: 'dc', utilization: 88 },
    { name: 'Maya Patel',          region: 'dc', utilization: 45, priorMANATT: true },
    { name: 'Tom Hartford',        region: 'dc', utilization: 67 },
    { name: 'Lisa Cheng',          region: 'dc', utilization: 82 },
    { name: 'David Ruiz',          region: 'dc', utilization: 59 },
    { name: 'Ana Sokolov',         region: 'dc', utilization: 91 },
    { name: 'Mike Davis',          region: 'dc', utilization: 38 },
    { name: 'Priya Iyer',          region: 'dc', utilization: 75 },
    // MA / NY / NJ (Rebecca)
    { name: 'Rebecca Warren',      region: 'ma', utilization: 89, isLead: true },
    { name: 'John Chen',           region: 'ma', utilization: 64 },
    { name: 'Sara Bennett',        region: 'ma', utilization: 55 },
    { name: 'Marco Russo',         region: 'ma', utilization: 78 },
    { name: 'Emily Stone',         region: 'ma', utilization: 92 },
    { name: 'Raj Kumar',           region: 'ma', utilization: 41 },
    { name: 'Hannah Liu',          region: 'ma', utilization: 70 },
    { name: 'Pete Falco',          region: 'ma', utilization: 83 },
    { name: 'Nora Singh',          region: 'ma', utilization: 49 },
    { name: 'Devin Hayes',         region: 'ma', utilization: 66 },
    // PA + Pittsburgh + Ancillary (Kimberly)
    { name: 'Kimberly Tucker',     region: 'pa', utilization: 65, isLead: true },
    { name: 'Olivia Berg',         region: 'pa', utilization: 71 },
    { name: 'Connor Walsh',        region: 'pa', utilization: 84 },
    { name: 'Yasmin El-Sayed',     region: 'pa', utilization: 47 },
    { name: 'Tyler Brooks',        region: 'pa', utilization: 90 },
    { name: 'Grace Park',          region: 'pa', utilization: 58 },
    { name: 'Eli Johnson',         region: 'pa', utilization: 76 },
    { name: 'Megan Reed',          region: 'pa', utilization: 39 },
    { name: 'Vincent Lo',          region: 'pa', utilization: 68 },
    { name: 'Sofia Marini',        region: 'pa', utilization: 87 },
]

const REGION_LABELS = {
    dc: { label: 'DC + Southern', manager: 'Felicia Miano-Poles' },
    ma: { label: 'MA / NY / NJ', manager: 'Rebecca Warren' },
    pa: { label: 'PA / Pittsburgh / Ancillary', manager: 'Kimberly Tucker' },
} as const

function utilizationClass(u: number): string {
    if (u >= 85) return 'bg-destructive/10 text-destructive border-destructive/30'
    if (u >= 60) return 'bg-warning/10 text-warning border-warning/30'
    return 'bg-success/10 text-success border-success/30'
}

function utilizationLabel(u: number): string {
    if (u >= 85) return 'At capacity'
    if (u >= 60) return 'Limited'
    return 'Available'
}

interface Props {
    /** Highlight a specific designer (used by sc1.0 for Kimberly's assignment recommendation) */
    highlightName?: string
    /** When set, designer cards become clickable; calls back with selected name */
    onSelect?: (name: string) => void
    /** Name currently selected (highlighted with check icon + ring) */
    selectedName?: string | null
}

export default function CapacityHeatmap({ highlightName, onSelect, selectedName }: Props) {
    const regions: Array<'dc' | 'ma' | 'pa'> = ['dc', 'ma', 'pa']

    return (
        <div className="space-y-6">
            {regions.map(region => {
                const regionDesigners = DESIGNERS.filter(d => d.region === region)
                return (
                    <div key={region} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold text-foreground">
                                    {REGION_LABELS[region].label}
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                    · {REGION_LABELS[region].manager} · {regionDesigners.length} designers
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                            {regionDesigners.map(d => {
                                const isHighlighted = highlightName === d.name
                                const isSelected = selectedName === d.name
                                const isInteractive = !!onSelect
                                return (
                                    <button
                                        key={d.name}
                                        type="button"
                                        disabled={!isInteractive}
                                        onClick={isInteractive ? () => onSelect!(d.name) : undefined}
                                        className={`relative text-left rounded-md border p-2.5 text-xs transition-all w-full ${utilizationClass(d.utilization)} ${
                                            isHighlighted ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                                        } ${
                                            isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md' : ''
                                        } ${
                                            isInteractive ? 'cursor-pointer hover:shadow-md hover:-translate-y-px' : 'cursor-default'
                                        }`}
                                    >
                                        {isSelected && (
                                            <CheckCircle2 className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-primary" />
                                        )}
                                        <div className="font-medium text-foreground truncate flex items-center gap-1 pr-4">
                                            {d.name}
                                            {d.isLead && <span className="text-[9px] uppercase tracking-wide font-bold opacity-70">Lead</span>}
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="font-mono tabular-nums">{d.utilization}%</span>
                                            <span className="opacity-70 text-[10px]">{utilizationLabel(d.utilization)}</span>
                                        </div>
                                        {d.priorMANATT && (
                                            <div className="text-[10px] mt-1 opacity-80 italic">prior MANATT</div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )
            })}

            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-success/40 border border-success/60" /> Available (&lt; 60%)
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-warning/40 border border-warning/60" /> Limited (60–85%)
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-destructive/40 border border-destructive/60" /> At capacity (&gt; 85%)
                </div>
            </div>
        </div>
    )
}
