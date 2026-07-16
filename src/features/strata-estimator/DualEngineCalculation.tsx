// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Dual-Engine Calculation
// v8 Paso D · Visualises the two private Excel files that estimators use
// today in isolation (Delivery Pricer + Labor Worksheet) and the moment
// Strata merges them into a single combined total. Surfaces pain point #2
// from the consolidated reference ("two disconnected tools") and gives the
// audience a clear reason-why for each charge.
//
// Data is mocked from the real JPS_116719 extraction and the Delivery
// Pricer 2026 reference document. Progress drives count-up and the merge
// reveal beat.
// ═══════════════════════════════════════════════════════════════════════════════

import { clsx } from 'clsx'
import {
    ArrowRight,
    Brain,
    Clock,
    DollarSign,
    FileSpreadsheet,
    Hammer,
    Lock,
    MapPin,
    Sparkles,
    Truck,
    Zap,
} from 'lucide-react'

interface DualEngineCalculationProps {
    progress: number // 0 -> 1 drives count-up + merge reveal
}

// Delivery Pricer (Section A-E items, real JPS rates from wrg-read)
const DELIVERY_LINES = [
    { label: '119 KD task chairs',    section: 'A · Seating',       qtyMin: 119 * 30, display: '119 × 30 min' },
    { label: '40 guest chairs',       section: 'A · Seating',       qtyMin: 40 * 15,  display: '40 × 15 min' },
    { label: '17 healthcare lounges', section: 'A · Seating',       qtyMin: 17 * 30,  display: '17 × 30 min' },
    { label: '12 glassboards',        section: 'E · Misc',          qtyMin: 12 * 90,  display: '12 × 90 min' },
    { label: '4 conference tables',   section: 'D · Tables',        qtyMin: 4 * 180,  display: '4 × 180 min' },
]
// minutes × $0.95/min (Delivery Pricer rate)
const DELIVERY_RAW_MIN = DELIVERY_LINES.reduce((a, l) => a + l.qtyMin, 0)
const DELIVERY_RAW = DELIVERY_RAW_MIN * 0.95 // ~5,614
const SECTION_F = [
    { label: 'No loading dock',    pct: 15 },
    { label: 'Above 2nd floor',    pct: 5 },
]
const SECTION_F_PCT = SECTION_F.reduce((a, m) => a + m.pct, 0) / 100
const DELIVERY_AFTER_F = DELIVERY_RAW * (1 + SECTION_F_PCT)
const SECTION_G = [
    { label: 'Downtown',  amount: 57 },
    { label: 'Hospital',  amount: 114 },
    { label: 'Trip',      amount: 171 },
]
const SECTION_G_TOTAL = SECTION_G.reduce((a, c) => a + c.amount, 0)
const DELIVERY_TOTAL = DELIVERY_AFTER_F + SECTION_G_TOTAL

// Labor Worksheet (real JPS_116719 extracts)
const LABOR_LINES = [
    { label: '119 KD Amplify task chairs', hours: 35.7 },
    { label: '40 healthcare guest chairs', hours: 8.0 },
    { label: '17 healthcare lounges',      hours: 8.5 },
    { label: '12 glassboards 36×48',       hours: 30.0 },
    { label: '1 OFS Serpentine (custom)',  hours: 12.0 },
    { label: '+19 remaining line items',   hours: 90.84 },
]
const LABOR_RATE = 57
const LABOR_HOURS = 185.04
const LABOR_TOTAL = LABOR_HOURS * LABOR_RATE

const COMBINED_TOTAL = DELIVERY_TOTAL + LABOR_TOTAL

// v8 Paso E · Gap E · Totals by area or floor (BPMN stage 14)
// Split of the 185.04 labor hrs across the JPS Health Center for
// Women zones, matching the real architectural layout.
interface AreaTotal {
    name: string
    hours: number
    headline: string
}
const AREA_TOTALS: AreaTotal[] = [
    { name: 'Nursing stations',     hours: 48.00, headline: '119 KD task chairs · staff seating' },
    { name: 'Family waiting area',  hours: 32.00, headline: 'OFS Serpentine + 17 lounge chairs' },
    { name: 'Exam rooms',           hours: 28.00, headline: '48 rooms · guest chairs + side tables' },
    { name: 'Common / corridor',    hours: 30.00, headline: 'Glassboards + pre-install walk' },
    { name: 'Staff break room',     hours: 18.00, headline: 'Café tables + stools' },
    { name: 'Admin offices',        hours: 29.04, headline: 'Conference tables + recliners' },
]

function formatMoney(n: number): string {
    return `$${Math.round(n).toLocaleString('en-US')}`
}

export default function DualEngineCalculation({
    progress,
}: DualEngineCalculationProps) {
    const p = Math.max(0, Math.min(1, progress))
    const engineReveal = Math.min(1, p / 0.6) // 0 → 0.6 fills both engines
    const mergeReveal = p >= 0.75 ? Math.min(1, (p - 0.75) / 0.25) : 0
    const showCombined = p >= 0.9
    const isRunning = p < 0.999

    return (
        <div className="space-y-3">
            {/* Title strip */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <Zap className="w-3 h-3 text-foreground dark:text-primary" />
                <span>Dual-engine calculation</span>
                <span className="text-muted-foreground/60">·</span>
                <span>
                    Strata is running both engines Strata is merging what used to live
                    in two separate Excel files
                </span>
            </div>

            {/* Two engines side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

                {/* ═══ DELIVERY PRICER ═══════════════════════════════════ */}
                <div className="rounded-2xl bg-card dark:bg-zinc-800 border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                            <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                                Engine 1 · Delivery Pricer
                            </p>
                            <p className="text-xs font-bold text-foreground leading-tight mt-0.5">
                                Sections A-E + F multipliers + G charges
                            </p>
                        </div>
                        <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                            <Lock className="w-2.5 h-2.5" />
                            Private Excel
                        </span>
                    </div>

                    <div className="p-4 space-y-2.5">
                        {/* Line items */}
                        <div className="space-y-1.5">
                            {DELIVERY_LINES.map((line, i) => {
                                const visible = engineReveal > i / DELIVERY_LINES.length
                                return (
                                    <div
                                        key={line.label}
                                        className={clsx(
                                            'flex items-center justify-between gap-2 text-[11px] px-2.5 py-1.5 rounded-md bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/15 transition-all duration-300',
                                            visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
                                        )}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-foreground font-semibold truncate">
                                                {line.label}
                                            </p>
                                            <p className="text-[9px] text-muted-foreground">
                                                {line.section} · {line.display}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-blue-700 dark:text-blue-400 font-semibold tabular-nums">
                                            {formatMoney(line.qtyMin * 0.95)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Raw subtotal */}
                        <div
                            className={clsx(
                                'flex items-baseline justify-between gap-2 pt-2 border-t border-border text-[11px] transition-opacity duration-300',
                                engineReveal > 0.8 ? 'opacity-100' : 'opacity-0'
                            )}
                        >
                            <span className="text-muted-foreground">Raw minutes × $0.95</span>
                            <span className="font-semibold text-foreground tabular-nums">
                                {formatMoney(DELIVERY_RAW)}
                            </span>
                        </div>

                        {/* Section F */}
                        <div
                            className={clsx(
                                'transition-opacity duration-300',
                                engineReveal > 0.85 ? 'opacity-100' : 'opacity-0'
                            )}
                        >
                            <p className="text-[9px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                                Section F · Multipliers
                            </p>
                            {SECTION_F.map((m) => (
                                <div
                                    key={m.label}
                                    className="flex items-baseline justify-between gap-2 text-[10px] pl-2"
                                >
                                    <span className="text-muted-foreground">· {m.label}</span>
                                    <span className="text-blue-700 dark:text-blue-400 font-semibold">
                                        +{m.pct}%
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Section G */}
                        <div
                            className={clsx(
                                'transition-opacity duration-300',
                                engineReveal > 0.9 ? 'opacity-100' : 'opacity-0'
                            )}
                        >
                            <p className="text-[9px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                                Section G · Transport charges
                            </p>
                            {SECTION_G.map((c) => (
                                <div
                                    key={c.label}
                                    className="flex items-baseline justify-between gap-2 text-[10px] pl-2"
                                >
                                    <span className="text-muted-foreground">· {c.label}</span>
                                    <span className="text-blue-700 dark:text-blue-400 font-semibold tabular-nums">
                                        +${c.amount}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Engine total */}
                        <div
                            className={clsx(
                                'flex items-baseline justify-between gap-2 pt-2 border-t-2 border-blue-500/30 transition-opacity duration-300',
                                engineReveal > 0.95 ? 'opacity-100' : 'opacity-0'
                            )}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                                Delivery total
                            </span>
                            <span className="text-lg font-black text-blue-700 dark:text-blue-400 tabular-nums">
                                {formatMoney(DELIVERY_TOTAL * engineReveal)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ═══ LABOR WORKSHEET ════════════════════════════════════ */}
                <div className="rounded-2xl bg-card dark:bg-zinc-800 border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border flex-wrap">
                        <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                            <Hammer className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                                Engine 2 · Labor Worksheet
                            </p>
                            <p className="text-xs font-bold text-foreground leading-tight mt-0.5">
                                Line items × man-hours × $57/hr
                            </p>
                        </div>
                        <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                            <Lock className="w-2.5 h-2.5" />
                            Private Excel
                        </span>
                        <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full bg-ai/10 border border-purple-500/30">
                            <Brain className="w-2.5 h-2.5" />
                            Tribal knowledge
                        </span>
                    </div>

                    <div className="p-4 space-y-2.5">
                        {/* v8 Paso E · Gap C · TK annotation row */}
                        <div
                            className={clsx(
                                'flex items-start gap-2 px-2.5 py-2 rounded-lg bg-ai/5 dark:bg-ai/10 border border-purple-500/20 transition-opacity duration-300',
                                engineReveal > 0.1 ? 'opacity-100' : 'opacity-0'
                            )}
                        >
                            <Brain className="shrink-0 w-3 h-3 text-purple-700 dark:text-purple-400 mt-0.5" />
                            <p className="text-[10px] leading-snug text-muted-foreground">
                                <span className="font-bold text-purple-700 dark:text-purple-400">
                                    From memory today:
                                </span>{' '}
                                Estimator Wells · "Nothing documented · all based on my
                                100 years of experience." Strata now captures every
                                rate as structured data.
                            </p>
                        </div>

                        {/* Line items */}
                        <div className="space-y-1.5">
                            {LABOR_LINES.map((line, i) => {
                                const visible = engineReveal > i / LABOR_LINES.length
                                return (
                                    <div
                                        key={line.label}
                                        className={clsx(
                                            'flex items-center justify-between gap-2 text-[11px] px-2.5 py-1.5 rounded-md bg-green-500/5 dark:bg-green-500/10 border border-green-500/15 transition-all duration-300',
                                            visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
                                        )}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-foreground font-semibold truncate">
                                                {line.label}
                                            </p>
                                            <p className="text-[9px] text-muted-foreground tabular-nums">
                                                {line.hours.toFixed(2)} hrs × ${LABOR_RATE}/hr
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-green-700 dark:text-green-400 font-semibold tabular-nums">
                                            {formatMoney(line.hours * LABOR_RATE)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Rate applied */}
                        <div
                            className={clsx(
                                'flex items-baseline justify-between gap-2 pt-2 border-t border-border text-[11px] transition-opacity duration-300',
                                engineReveal > 0.85 ? 'opacity-100' : 'opacity-0'
                            )}
                        >
                            <span className="text-muted-foreground flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                Rate applied · JPS MSA
                            </span>
                            <span className="font-semibold text-green-700 dark:text-green-400 tabular-nums">
                                ${LABOR_RATE}/hr fixed
                            </span>
                        </div>

                        {/* Total hours */}
                        <div
                            className={clsx(
                                'flex items-baseline justify-between gap-2 text-[11px] transition-opacity duration-300',
                                engineReveal > 0.9 ? 'opacity-100' : 'opacity-0'
                            )}
                        >
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Total man-hours
                            </span>
                            <span className="font-semibold text-foreground tabular-nums">
                                {LABOR_HOURS.toFixed(2)} hrs
                            </span>
                        </div>

                        {/* Engine total */}
                        <div
                            className={clsx(
                                'flex items-baseline justify-between gap-2 pt-2 border-t-2 border-green-500/30 transition-opacity duration-300',
                                engineReveal > 0.95 ? 'opacity-100' : 'opacity-0'
                            )}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                                Labor total
                            </span>
                            <span className="text-lg font-black text-green-700 dark:text-green-400 tabular-nums">
                                {formatMoney(LABOR_TOTAL * engineReveal)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Merge line + combined total */}
            <div className="relative">
                {/* Vertical merge line (only while revealing) */}
                <div
                    className={clsx(
                        'absolute left-1/2 -translate-x-1/2 w-px bg-primary transition-all duration-500 origin-top',
                        mergeReveal > 0 ? 'h-6 opacity-100' : 'h-0 opacity-0'
                    )}
                    style={{ top: 0 }}
                    aria-hidden
                />
                <div className="pt-6">
                    <div
                        className={clsx(
                            'rounded-2xl border-2 border-primary/40 bg-primary/5 dark:bg-primary/10 overflow-hidden transition-all duration-500',
                            showCombined
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-2 pointer-events-none'
                        )}
                    >
                        <div className="flex items-center gap-3 px-5 py-4">
                            <div className="shrink-0 w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                                    Strata merges both engines
                                </p>
                                <p className="text-sm font-bold text-foreground leading-tight mt-1">
                                    First time combined · full audit trail preserved
                                </p>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="hidden md:inline text-[10px] text-muted-foreground">
                                    {formatMoney(DELIVERY_TOTAL)}
                                </span>
                                <span className="hidden md:inline text-muted-foreground">+</span>
                                <span className="hidden md:inline text-[10px] text-muted-foreground">
                                    {formatMoney(LABOR_TOTAL)}
                                </span>
                                <ArrowRight className="hidden md:inline w-3 h-3 text-muted-foreground" />
                                <span className="text-2xl font-black text-foreground tabular-nums">
                                    {formatMoney(COMBINED_TOTAL)}
                                </span>
                            </div>
                        </div>
                        <div className="px-5 py-2.5 border-t border-primary/20 bg-primary/5 flex items-center gap-2 text-[10px] text-muted-foreground">
                            <FileSpreadsheet className="w-3 h-3" />
                            <span>
                                Both engines now live inside Strata · no more private
                                Excel silos · every line is queryable and auditable.
                            </span>
                        </div>
                        {/* v8 Paso E · Gap A · Bid scenario gateway call-out */}
                        <div className="px-5 py-2.5 border-t border-primary/20 bg-amber-500/5 dark:bg-amber-500/10 flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                                Legacy
                            </span>
                            <span>
                                WRG used to ship ~85% of quotes as lump-sum only and
                                only ~15% as per-piece breakdowns. Strata always
                                produces a full breakdown.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* v8 Paso E · Gap E · Totals by area or floor (BPMN stage 14) */}
            {showCombined && (
                <div className="rounded-2xl bg-card dark:bg-zinc-800 border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-2 px-5 py-3 bg-muted/30 border-b border-border">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-foreground dark:text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                                Totals by area
                            </p>
                            <p className="text-xs font-bold text-foreground leading-tight mt-0.5">
                                JPS Health Center for Women · 6 zones · 185.04 hrs
                            </p>
                        </div>
                        <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-foreground dark:text-primary px-2 py-1 rounded-full bg-primary/10 border border-primary/30">
                            <Sparkles className="w-2.5 h-2.5" />
                            AI drilled
                        </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
                        {AREA_TOTALS.map((area) => (
                            <div
                                key={area.name}
                                className="bg-card dark:bg-zinc-800 px-4 py-3"
                            >
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                                    {area.name}
                                </p>
                                <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className="text-base font-black text-foreground tabular-nums">
                                        {area.hours.toFixed(1)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">hrs</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground tabular-nums">
                                    {formatMoney(area.hours * LABOR_RATE)}
                                </p>
                                <p className="text-[9px] text-muted-foreground leading-tight mt-1 truncate">
                                    {area.headline}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="px-5 py-2.5 border-t border-border bg-muted/20 text-[10px] text-muted-foreground italic">
                        BPMN stage 14 · WRG's legacy workflow ends with "totals by
                        area or floor" written by hand into the labor worksheet.
                        Strata generates this drill-down automatically from the
                        architectural layout.
                    </div>
                </div>
            )}

            {/* Calculating status */}
            {isRunning && (
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Calculating dual-engine estimate…</span>
                </div>
            )}
        </div>
    )
}
