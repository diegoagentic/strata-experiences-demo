// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Project Context Panel
// v8 Paso B · Persistent iconographic card showing the site + logistics
// factors that actually drive the labor estimate (Section F multipliers,
// Section G transport charges, crew composition, scope limits…).
//
// Shows up across w1.1, w1.2, w2.1, w2.2, w2.3 so every role sees the same
// context. Each row is editable (click the pencil) and flagged rows carry
// an AI suggestion that can be accepted inline.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react'
import { clsx } from 'clsx'
import {
    AlertTriangle,
    Building2,
    Check,
    ChevronDown,
    ClipboardList,
    Clock,
    DoorOpen,
    HardHat,
    Hammer,
    MapPin,
    Move,
    Pencil,
    Ruler,
    Sparkles,
    Stethoscope,
    Truck,
    Wrench,
} from 'lucide-react'

type IconKey =
    | 'location'
    | 'venue'
    | 'floor'
    | 'access'
    | 'push'
    | 'hours'
    | 'transport'
    | 'area'
    | 'crew'
    | 'equipment'
    | 'tools'
    | 'flags'

const ICON_MAP: Record<IconKey, typeof MapPin> = {
    location:  MapPin,
    venue:     Stethoscope,
    floor:     Building2,
    access:    DoorOpen,
    push:      Move,
    hours:     Clock,
    transport: Truck,
    area:      Ruler,
    crew:      HardHat,
    equipment: Hammer,
    tools:     Wrench,
    flags:     AlertTriangle,
}

interface ContextFact {
    id: string
    icon: IconKey
    label: string
    value: string
    detail?: string
    aiFlagged?: boolean
    aiSuggestion?: string
    options?: string[]
}

const INITIAL_FACTS: ContextFact[] = [
    {
        id: 'location',
        icon: 'location',
        label: 'Location',
        value: 'Downtown Fort Worth, TX',
        detail: '+$57 downtown surcharge (Section G)',
        aiFlagged: true,
        options: [
            'Downtown Fort Worth, TX',
            'Fort Worth suburbs, TX',
            'Dallas, TX',
            'Arlington, TX',
            'Houston, TX',
        ],
    },
    {
        id: 'venue',
        icon: 'venue',
        label: 'Venue type',
        value: 'Hospital campus',
        detail: '+$114 hospital surcharge (Section G)',
        aiFlagged: true,
        options: [
            'Hospital campus',
            'Medical office building',
            'Corporate HQ',
            'Education / campus',
            'Retail / showroom',
            'Warehouse / industrial',
        ],
    },
    {
        id: 'floor',
        icon: 'floor',
        label: 'Floor',
        value: '2nd floor',
        detail: '+5% multiplier (Section F · above 2nd floor)',
        options: [
            'Ground floor',
            '2nd floor',
            '3rd floor',
            '4th-6th floor',
            '7th floor or higher',
        ],
    },
    {
        id: 'access',
        icon: 'access',
        label: 'Loading access',
        value: 'No dock · elevator only',
        detail: '+15% multiplier (Section F · no dock)',
        aiFlagged: true,
        options: [
            'Dock + freight elevator',
            'Dock only · stairs',
            'No dock · elevator only',
            'No dock · stairs only',
            'Ground level drive-up',
        ],
    },
    {
        id: 'push',
        icon: 'push',
        label: 'Push distance',
        value: '~180 ft',
        detail: 'Truck → install zone',
        aiSuggestion: '~220 ft (re-measured on floor plan)',
        options: [
            '~50 ft',
            '~100 ft',
            '~180 ft',
            '~220 ft',
            '~300 ft',
            '~500 ft',
        ],
    },
    {
        id: 'hours',
        icon: 'hours',
        label: 'Hours',
        value: 'Standard business hours',
        detail: 'No overtime flag from sales',
        options: [
            'Standard business hours',
            'After hours (+50%)',
            'Overnight (+50%)',
            'Weekend (+50%)',
        ],
    },
    {
        id: 'transport',
        icon: 'transport',
        label: 'Transport',
        value: 'Dallas → Fort Worth · 32 mi',
        detail: 'Under 50 mi threshold, no long-haul charge',
        options: [
            'Local Dallas (<10 mi)',
            'Dallas → Fort Worth · 32 mi',
            'Dallas → Arlington · 20 mi',
            'Dallas → Austin · 195 mi (+$200)',
            'Dallas → Houston · 240 mi (+$200)',
        ],
    },
    {
        id: 'area',
        icon: 'area',
        label: 'Floor area',
        value: '12,400 sq ft · 48 rooms',
        detail: 'Per JPS architectural drawings',
        options: [
            '~5,000 sq ft',
            '~8,000 sq ft',
            '12,400 sq ft · 48 rooms',
            '~20,000 sq ft',
            '~30,000 sq ft',
        ],
    },
    {
        id: 'crew',
        icon: 'crew',
        label: 'Crew needed',
        value: '4 installers · 3 days',
        detail: '185 hrs ÷ 3 days ÷ 8 h ≈ 4-person team',
        aiFlagged: true,
        options: [
            '2 installers · 1 day',
            '3 installers · 2 days',
            '4 installers · 3 days',
            '6 installers · 4 days',
            '8 installers · 5 days',
        ],
    },
    {
        id: 'equipment',
        icon: 'equipment',
        label: 'Equipment',
        value: 'Dollies, 2-wheelers, lift gate',
        detail: 'PPE kit included',
        options: [
            'Basic install kit',
            'Dollies + 2-wheelers',
            'Dollies, 2-wheelers, lift gate',
            'Full kit + floor protection',
            'Heavy equipment + crane',
        ],
    },
    {
        id: 'tools',
        icon: 'tools',
        label: 'Tools',
        value: 'Allen wrench set, cordless drills',
        detail: 'Plus alignment spacers for the OFS serpentine',
        options: [
            'Standard Allen wrench set',
            'Allen wrench set, cordless drills',
            'Full mechanical kit',
            'Allen + drills + alignment spacers',
            'Specialty tools (custom)',
        ],
    },
    {
        id: 'flags',
        icon: 'flags',
        label: 'Scope flags',
        value: '119 KD chairs exceed Pricer limit (50)',
        detail: 'Delivery Pricer override required',
        aiFlagged: true,
        options: [
            'No scope flags',
            '119 KD chairs exceed Pricer limit (50)',
            'Custom OFS Serpentine flagged',
            'Multiple overrides required',
            'Spec vs drawing mismatch caught',
        ],
    },
]

interface ProjectContextPanelProps {
    defaultCollapsed?: boolean
}

export default function ProjectContextPanel({
    defaultCollapsed = false,
}: ProjectContextPanelProps) {
    const [facts, setFacts] = useState<ContextFact[]>(INITIAL_FACTS)
    const [collapsed, setCollapsed] = useState(defaultCollapsed)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [draftValue, setDraftValue] = useState<string>('')

    const startEdit = (fact: ContextFact) => {
        setEditingId(fact.id)
        setDraftValue(fact.value)
    }

    const saveEdit = () => {
        if (editingId) {
            setFacts((prev) =>
                prev.map((f) =>
                    f.id === editingId ? { ...f, value: draftValue.trim() || f.value } : f
                )
            )
        }
        setEditingId(null)
    }

    const cancelEdit = () => setEditingId(null)

    const selectOption = (id: string, option: string) => {
        setFacts((prev) =>
            prev.map((f) => (f.id === id ? { ...f, value: option } : f))
        )
        setEditingId(null)
    }

    const acceptSuggestion = (id: string) => {
        setFacts((prev) =>
            prev.map((f) =>
                f.id === id && f.aiSuggestion
                    ? { ...f, value: f.aiSuggestion, aiSuggestion: undefined }
                    : f
            )
        )
    }

    const flaggedCount = facts.filter((f) => f.aiFlagged).length

    return (
        <div className="rounded-2xl bg-card dark:bg-zinc-800 border border-border overflow-hidden">
            {/* Header */}
            <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                className="w-full flex items-center gap-3 px-5 py-3 bg-muted/30 border-b border-border text-left hover:bg-muted/50 transition-colors"
            >
                <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ClipboardList className="w-4 h-4 text-foreground dark:text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                        Project context
                    </p>
                    <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
                        JPS Health Network · Health Center for Women
                    </p>
                </div>
                {flaggedCount > 0 && (
                    <span className="hidden md:flex shrink-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-foreground dark:text-primary px-2 py-1 rounded-full bg-primary/10 border border-primary/30">
                        <Sparkles className="w-2.5 h-2.5" />
                        {flaggedCount} AI flagged
                    </span>
                )}
                <ChevronDown
                    className={clsx(
                        'shrink-0 w-4 h-4 text-muted-foreground transition-transform duration-200',
                        collapsed && '-rotate-90'
                    )}
                />
            </button>

            {/* Body · uniform card grid */}
            {!collapsed && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 bg-muted/10 dark:bg-zinc-900/40 auto-rows-fr">
                    {facts.map((fact) => {
                        const Icon = ICON_MAP[fact.icon]
                        const isEditing = editingId === fact.id
                        return (
                            <div
                                key={fact.id}
                                className={clsx(
                                    'group relative flex flex-col h-full rounded-xl border p-3 transition-all',
                                    fact.aiFlagged
                                        ? 'bg-primary/5 dark:bg-primary/10 border-primary/30 ring-1 ring-primary/20 hover:ring-primary/40'
                                        : 'bg-card dark:bg-zinc-800 border-border hover:border-border/60'
                                )}
                            >
                                {/* Header row · icon + label + AI chip + edit */}
                                <div className="flex items-center gap-2">
                                    <div
                                        className={clsx(
                                            'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
                                            fact.aiFlagged
                                                ? 'bg-primary/20 text-foreground dark:text-primary'
                                                : 'bg-muted/60 text-muted-foreground'
                                        )}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="flex-1 min-w-0 text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-none truncate">
                                        {fact.label}
                                    </p>
                                    {fact.aiFlagged && (
                                        <span className="shrink-0 flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wider text-foreground dark:text-primary">
                                            <Sparkles className="w-2 h-2" />
                                            AI
                                        </span>
                                    )}
                                    {!isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => startEdit(fact)}
                                            className="shrink-0 p-1 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted opacity-60 group-hover:opacity-100 transition-all"
                                            aria-label={`Edit ${fact.label}`}
                                        >
                                            <Pencil className="w-2.5 h-2.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Value · always on its own line, wraps cleanly */}
                                <div className="mt-2">
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            {fact.options && fact.options.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {fact.options.map((opt) => {
                                                        const isCurrent = opt === fact.value
                                                        return (
                                                            <button
                                                                key={opt}
                                                                type="button"
                                                                onClick={() => selectOption(fact.id, opt)}
                                                                className={clsx(
                                                                    'text-[10px] px-2 py-1 rounded-md border font-semibold leading-tight transition-colors text-left',
                                                                    isCurrent
                                                                        ? 'bg-primary/20 border-primary/50 text-foreground dark:text-primary'
                                                                        : 'bg-muted/40 dark:bg-zinc-900 border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-foreground'
                                                                )}
                                                            >
                                                                {opt}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={draftValue}
                                                    onChange={(e) => setDraftValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEdit()
                                                        if (e.key === 'Escape') cancelEdit()
                                                    }}
                                                    placeholder="Custom value…"
                                                    className="flex-1 min-w-0 text-[11px] font-semibold text-foreground bg-card dark:bg-zinc-900 border border-border rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={saveEdit}
                                                    className="shrink-0 px-2 py-1.5 rounded-md bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelEdit}
                                                    className="shrink-0 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground text-[9px] font-bold uppercase tracking-wider"
                                                >
                                                    Esc
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-[13px] font-bold text-foreground leading-snug">
                                            {fact.value}
                                        </p>
                                    )}
                                </div>

                                {/* Detail */}
                                {fact.detail && !isEditing && (
                                    <p className="text-[10px] text-muted-foreground leading-snug mt-1">
                                        {fact.detail}
                                    </p>
                                )}

                                {/* Spacer pushes AI suggestion to the bottom */}
                                <div className="flex-1" />

                                {/* AI suggestion · bottom-pinned pill button */}
                                {fact.aiSuggestion && !isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => acceptSuggestion(fact.id)}
                                        className="mt-2 flex items-center justify-between gap-1.5 text-[9px] font-bold uppercase tracking-wider text-foreground dark:text-primary px-2 py-1.5 rounded-md bg-primary/15 border border-primary/40 hover:bg-primary/25 transition-colors"
                                        title={`AI suggests: ${fact.aiSuggestion}`}
                                    >
                                        <span className="flex items-center gap-1 min-w-0 truncate">
                                            <Sparkles className="w-2.5 h-2.5 shrink-0" />
                                            <span className="truncate">
                                                AI: {fact.aiSuggestion}
                                            </span>
                                        </span>
                                        <Check className="w-2.5 h-2.5 shrink-0" />
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
