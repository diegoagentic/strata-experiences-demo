/**
 * COMPONENT: CapacityHeatmap (P51 refactor)
 * PURPOSE: Display ~30 designers grouped by 3 manager regions as a
 *          list with accordion expansion (replacing the previous card grid).
 *
 * Why list/accordion (over card grid):
 *   - Scales to any modal width (the previous grid broke at ~600px,
 *     truncating names and overlapping chips inside IntakeAssignPanel)
 *   - Row click opens a rich profile in-place: seniority, capacity bar,
 *     active projects, YTD totals, areas, KPIs — no need to open a
 *     separate profile modal
 *   - When highlightName is set (Strata's recommended designer), that
 *     row auto-expands so the recommendation arrives with its rationale
 *     already visible
 *
 * Two modes:
 *   - Browse  (no onSelect)        — accordion shows info only
 *   - Assign  (onSelect provided)  — accordion shows info + "Assign"
 *                                    button that fires onSelect(name)
 *
 * EXPORTS:
 *   - default: CapacityHeatmap component
 *   - DESIGNERS, type Designer, REGION_LABELS
 *   - utilizationStatus / utilizationLabel helpers
 *   - UtilizationStatus type
 */

import { Fragment, useState } from 'react'
import {
    Users, CheckCircle2, ChevronRight, ChevronDown, ArrowRight,
    Briefcase, Award, TrendingUp, Star,
} from 'lucide-react'
import { findDesigner, regionLabel, computeCapacity } from './designerProfiles'

export type UtilizationStatus = 'available' | 'limited' | 'at-capacity'

export interface Designer {
    name: string
    region: 'dc' | 'ma' | 'pa'
    utilization: number
    priorMetroLegal?: boolean
    isLead?: boolean
}

export const DESIGNERS: Designer[] = [
    // DC + Southern (Felicia)
    { name: 'Felicia Miano-Poles', region: 'dc', utilization: 95, isLead: true, priorMetroLegal: true },
    { name: 'Sandra Park',         region: 'dc', utilization: 72 },
    { name: 'James O\'Brien',      region: 'dc', utilization: 88 },
    { name: 'Maya Patel',          region: 'dc', utilization: 45, priorMetroLegal: true },
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
    { name: 'Kimberly Tucker',     region: 'pa', utilization: 45, isLead: true, priorMetroLegal: true },
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

export const REGION_LABELS = {
    dc: { label: 'DC + Southern', manager: 'Felicia Miano-Poles' },
    ma: { label: 'MA / NY / NJ', manager: 'Rebecca Warren' },
    pa: { label: 'PA / Pittsburgh / Ancillary', manager: 'Kimberly Tucker' },
} as const

export function utilizationStatus(u: number): UtilizationStatus {
    if (u >= 85) return 'at-capacity'
    if (u >= 60) return 'limited'
    return 'available'
}

export function utilizationLabel(s: UtilizationStatus): string {
    if (s === 'at-capacity') return 'At capacity'
    if (s === 'limited') return 'Limited'
    return 'Available'
}

function chipClass(s: UtilizationStatus): string {
    if (s === 'at-capacity') return 'bg-destructive/15 text-destructive border-destructive/30'
    if (s === 'limited') return 'bg-warning/15 text-warning border-warning/30'
    return 'bg-success/15 text-success border-success/30'
}

function dotClass(s: UtilizationStatus): string {
    if (s === 'at-capacity') return 'bg-destructive'
    if (s === 'limited') return 'bg-warning'
    return 'bg-success'
}

function barClass(s: UtilizationStatus): string {
    if (s === 'at-capacity') return 'bg-destructive'
    if (s === 'limited') return 'bg-warning'
    return 'bg-success'
}

function formatMoney(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
    return `$${n}`
}

function estimatedFreeHours(util: number): number {
    return Math.max(0, Math.round(40 * (1 - util / 100)))
}

const HOURS = (n: number) => `${n}h`

interface Props {
    /** Optional subset of designers · falls back to full DESIGNERS roster when undefined */
    designers?: Designer[]
    /** Highlight (and auto-expand) a specific designer */
    highlightName?: string
    /** When set, expansion shows an "Assign" button that fires onSelect(name) */
    onSelect?: (name: string) => void
    /** Name currently selected (highlighted with primary ring on row) */
    selectedName?: string | null
    /** Render an extra group at the top showing designers matching a client-history predicate.
     *  When set, matching designers are removed from their regional sections (exclusive),
     *  and the per-row Prior Metro Legal chip is suppressed. */
    priorClientHighlight?: {
        label: string
        predicate: (d: Designer) => boolean
    }
    /** Tighter rows + smaller chips + hidden Lead badge, for narrow contexts (≤ ~600px) */
    compact?: boolean
}

export default function CapacityHeatmap({
    designers,
    highlightName,
    onSelect,
    selectedName,
    priorClientHighlight,
    compact = false,
}: Props) {
    const source = designers ?? DESIGNERS
    const regions: Array<'dc' | 'ma' | 'pa'> = ['dc', 'ma', 'pa']
    const isInteractive = !!onSelect

    // Split source when a client-history section is requested (exclusive grouping).
    // Sort: highlightName (recommended) first, then by utilization ascending
    // (most available first) so the recommended designer leads the list visually.
    const highlightedDesigners = priorClientHighlight
        ? source
            .filter(priorClientHighlight.predicate)
            .sort((a, b) => {
                if (a.name === highlightName) return -1
                if (b.name === highlightName) return 1
                return a.utilization - b.utilization
            })
        : []
    const regionalSource = priorClientHighlight
        ? source.filter(d => !priorClientHighlight.predicate(d))
        : source

    // Compact mode style overrides
    const rowPadY     = compact ? 'py-2' : 'py-2.5'
    const rowGap      = compact ? 'gap-2' : 'gap-3'
    const utilWidth   = compact ? 'w-10' : 'w-12'
    const statusChip  = compact
        ? 'text-[9px] px-1.5 py-0'
        : 'text-[10px] px-2 py-0.5'
    const statusDot   = compact ? 'h-1 w-1' : 'h-1.5 w-1.5'
    const showChipPriorMetro Legal = !priorClientHighlight
    const showLeadBadge = !compact

    // Auto-expand the highlighted (recommended) designer on mount
    const [expandedNames, setExpandedNames] = useState<Set<string>>(() => {
        return highlightName ? new Set([highlightName]) : new Set()
    })

    const toggleExpand = (name: string) => {
        setExpandedNames(prev => {
            const next = new Set(prev)
            if (next.has(name)) next.delete(name)
            else next.add(name)
            return next
        })
    }

    const renderRow = (d: Designer, idx: number) => {
        const status = utilizationStatus(d.utilization)
        const isExpanded = expandedNames.has(d.name)
        const isHighlighted = highlightName === d.name
        const isSelected = selectedName === d.name
        const profile = findDesigner(d.name)

        return (
            <Fragment key={d.name}>
                {/* Collapsed/header row · click toggles expansion */}
                <button
                    type="button"
                    onClick={() => toggleExpand(d.name)}
                    aria-expanded={isExpanded}
                    className={`w-full flex items-center ${rowGap} px-3 ${rowPadY} text-left transition-colors ${
                        idx > 0 ? 'border-t border-border/60' : ''
                    } ${
                        isHighlighted ? 'bg-primary/5' : 'hover:bg-muted/30'
                    } ${
                        isSelected ? 'ring-2 ring-inset ring-primary' : ''
                    }`}
                >
                    <span className="text-muted-foreground shrink-0">
                        {isExpanded
                            ? <ChevronDown className="h-4 w-4" />
                            : <ChevronRight className="h-4 w-4" />
                        }
                    </span>
                    <span className="flex-1 min-w-0 flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-foreground truncate">{d.name}</span>
                        {isSelected && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                    </span>
                    <span className={`text-sm font-mono tabular-nums text-foreground shrink-0 ${utilWidth} text-right`}>{d.utilization}%</span>
                    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold shrink-0 ${statusChip} ${chipClass(status)}`}>
                        <span className={`rounded-full ${statusDot} ${dotClass(status)}`} />
                        {utilizationLabel(status)}
                    </span>
                    <span className="hidden sm:flex items-center gap-1 shrink-0">
                        {showLeadBadge && d.isLead && (
                            <span className="text-[8px] uppercase tracking-wide font-bold bg-foreground/10 text-foreground/70 rounded px-1 py-0.5">
                                Lead
                            </span>
                        )}
                        {showChipPriorMetro Legal && d.priorMetroLegal && (
                            <span className="text-[8px] uppercase tracking-wide font-bold bg-info/10 text-info border border-info/20 rounded px-1 py-0.5">
                                Prior Metro Legal
                            </span>
                        )}
                    </span>
                </button>

                {/* Expanded panel · rich profile detail */}
                {isExpanded && (
                    <div className="border-t border-border/60 bg-muted/15 px-4 py-3 space-y-3 animate-in fade-in duration-200">
                        {profile ? (
                            <>
                                {/* Header strip · seniority + tenure + region */}
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-bold uppercase tracking-wider rounded px-2 py-0.5 bg-foreground text-background">
                                            {profile.seniority}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {profile.yearsAtOW} {profile.yearsAtOW === 1 ? 'yr' : 'yrs'} at Officeworks
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">
                                        {regionLabel(profile.region)} · {REGION_LABELS[profile.region].manager}
                                    </span>
                                </div>

                                {/* Capacity breakdown · committed / available / free · derived from SUMIF formula */}
                                {(() => {
                                    const cap = computeCapacity(profile)
                                    return (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                <span>Capacity · this week</span>
                                                <span className="font-mono tabular-nums text-foreground normal-case font-normal tracking-normal">
                                                    {cap.utilization}% utilization
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${barClass(status)}`}
                                                    style={{ width: `${Math.min(100, cap.utilization)}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] tabular-nums flex-wrap">
                                                <span><strong className="text-foreground">{HOURS(cap.committedHours)}</strong> <span className="text-muted-foreground">committed</span></span>
                                                <span className="text-muted-foreground/40">/</span>
                                                <span><strong className="text-foreground">{HOURS(cap.availableHours)}</strong> <span className="text-muted-foreground">available</span></span>
                                                <span className="text-muted-foreground/40">·</span>
                                                <span className={cap.freeHours === 0 ? 'text-destructive font-semibold' : 'text-success font-semibold'}>
                                                    {HOURS(cap.freeHours)} free
                                                </span>
                                            </div>
                                            {cap.obligations.length > 0 && (
                                                <div className="pt-1 text-[10px] text-muted-foreground">
                                                    <span className="font-bold uppercase tracking-wider">Obligations</span>
                                                    <span className="ml-1">({HOURS(cap.obligationHours)} reducing availability) ·</span>
                                                    <span className="ml-1">
                                                        {cap.obligations.map(o => `${o.label} · ${HOURS(o.hoursPerWeek)}`).join(' · ')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })()}

                                {/* Active projects · with per-project committed hours (the SUMIF source) */}
                                {profile.projects.active.length > 0 && (
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <Briefcase className="h-3 w-3" />
                                            Active projects · {profile.projects.active.length}
                                        </div>
                                        <ul className="space-y-1">
                                            {profile.projects.active.map(p => (
                                                <li key={p.code} className="flex items-center gap-2 text-[11px]">
                                                    <span className="font-mono text-foreground/80 shrink-0">{p.code}</span>
                                                    <span className="text-muted-foreground/50">·</span>
                                                    <span className="text-foreground truncate flex-1">{p.client}</span>
                                                    <span className="font-semibold text-foreground tabular-nums shrink-0">{formatMoney(p.value)}</span>
                                                    <span className="text-muted-foreground shrink-0">·</span>
                                                    <span className="text-muted-foreground shrink-0">{p.stage} ({p.progress}%)</span>
                                                    {p.weeklyHours !== undefined && (
                                                        <>
                                                            <span className="text-muted-foreground/40 shrink-0">·</span>
                                                            <span className="font-mono tabular-nums text-foreground shrink-0">{HOURS(p.weeklyHours)}/wk</span>
                                                        </>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* 3-col grid · YTD · Areas · KPIs */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <Award className="h-3 w-3" />
                                            YTD
                                        </div>
                                        <ul className="text-[11px] space-y-0.5">
                                            <li><strong className="text-foreground tabular-nums">{profile.projects.completedYTD}</strong> <span className="text-muted-foreground">completed</span></li>
                                            <li><strong className="text-foreground tabular-nums">{formatMoney(profile.projects.totalValueYTD)}</strong> <span className="text-muted-foreground">total value</span></li>
                                            <li className="text-muted-foreground"><span className="text-foreground tabular-nums">{profile.projects.largeProjects}</span>L · <span className="text-foreground tabular-nums">{profile.projects.mediumProjects}</span>M · <span className="text-foreground tabular-nums">{profile.projects.smallProjects}</span>S</li>
                                        </ul>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Areas</div>
                                        <div className="flex items-center gap-1 flex-wrap">
                                            {profile.areas.slice(0, 5).map(a => (
                                                <span key={a} className="text-[10px] bg-muted/60 text-foreground rounded px-1.5 py-0.5">
                                                    {a}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <TrendingUp className="h-3 w-3" />
                                            Performance
                                        </div>
                                        <ul className="text-[11px] space-y-0.5">
                                            <li><strong className="text-foreground tabular-nums">{profile.kpis.avgCycleTime}</strong> <span className="text-muted-foreground">wk avg cycle</span></li>
                                            <li><strong className="text-foreground tabular-nums">{profile.kpis.errorRate}%</strong> <span className="text-muted-foreground">errors</span></li>
                                            <li><strong className="text-foreground tabular-nums">{profile.kpis.revisionsPerProject}</strong> <span className="text-muted-foreground">revisions/proj</span></li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Assign button (assign mode only) */}
                                {isInteractive && (
                                    <div className="flex justify-end pt-1">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onSelect!(d.name) }}
                                            className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-colors text-[11px] font-bold px-3 py-1.5"
                                        >
                                            {isSelected ? 'Assigned' : `Assign ${d.name.split(' ')[0]}`}
                                            {!isSelected && <ArrowRight className="h-3 w-3" />}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            // Fallback when no profile exists · use Designer fields only
                            <div className="text-xs text-muted-foreground py-1">
                                <p>Region: {regionLabel(d.region)}</p>
                                <p>Utilization: {d.utilization}% · ~{estimatedFreeHours(d.utilization)} hrs/week available</p>
                                {isInteractive && (
                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onSelect!(d.name) }}
                                            className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-colors text-[11px] font-bold px-3 py-1.5"
                                        >
                                            {isSelected ? 'Assigned' : `Assign ${d.name.split(' ')[0]}`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Fragment>
        )
    }

    return (
        <div className="space-y-5">
            {/* Client-history highlighted section (e.g., "Worked with Metro Legal") */}
            {priorClientHighlight && highlightedDesigners.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold text-foreground">
                            {priorClientHighlight.label}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                            · {highlightedDesigners.length} {highlightedDesigners.length === 1 ? 'designer' : 'designers'}
                        </span>
                    </div>
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        {highlightedDesigners.map((d, idx) => renderRow(d, idx))}
                    </div>
                </div>
            )}

            {regions.map(region => {
                const regionDesigners = regionalSource.filter(d => d.region === region)
                if (regionDesigners.length === 0) return null

                const regionTotal = DESIGNERS.filter(d => d.region === region).length
                const showingCount = regionDesigners.length
                const showingNote = showingCount === regionTotal
                    ? `${regionTotal} designers`
                    : `${showingCount} of ${regionTotal}`

                return (
                    <div key={region} className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold text-foreground">
                                {REGION_LABELS[region].label}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                                · {REGION_LABELS[region].manager} · {showingNote}
                            </span>
                        </div>

                        <div className="rounded-xl border border-border bg-card overflow-hidden">
                            {regionDesigners.map((d, idx) => renderRow(d, idx))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
