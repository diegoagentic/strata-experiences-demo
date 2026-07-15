/**
 * COMPONENT: DesignSpecCheckScan
 * PURPOSE: Flow 4 · Scene 1 — Animated Spec Check running across the 47
 *          line items of Beth's Lakeside ICU project. 4 checks run sequentially
 *          with live progress, then a "Reading drawing" phase compares
 *          architectural quantities against the SIF, then a complete state
 *          invites Beth to review the findings.
 *
 * USED BY: MBIDesignPage (wizard scene 1)
 */

import { useEffect, useState } from 'react'
import {
    CheckCircle2, Loader2, ShieldCheck, ArrowRight, Ruler, Palette,
    Droplet, Package, AlertTriangle, FileText, Zap,
} from 'lucide-react'
import { StatusBadge } from '../shared'
import { usePauseAware } from '../../context/usePauseAware'

interface SpecCheck {
    id: string
    label: string
    detail: string
    icon: React.ReactNode
    findings: number
}

interface DrawingLine {
    id: string
    area: string
    sku: string
    description: string
    drawingQty: number
    sifQty: number
    match: 'ok' | 'qty-short' | 'qty-over'
}

const CHECKS: SpecCheck[] = [
    {
        id: 'drawing',
        label: 'Drawing quantities vs SIF',
        detail: 'Architectural drawing quantities cross-checked against CET/SIF line items per room',
        icon: <Ruler className="h-4 w-4" />,
        findings: 1,
    },
    {
        id: 'finish',
        label: 'Finish consistency',
        detail: 'Every upholstery + laminate + powder-coat matches its spec sheet',
        icon: <Droplet className="h-4 w-4" />,
        findings: 1,
    },
    {
        id: 'palette',
        label: 'Palette match',
        detail: 'All items align with Marine Blue project palette',
        icon: <Palette className="h-4 w-4" />,
        findings: 0,
    },
    {
        id: 'availability',
        label: 'Vendor availability',
        detail: 'Every SKU in stock or lead-time compatible with install date',
        icon: <Package className="h-4 w-4" />,
        findings: 0,
    },
]

const DRAWING_STEPS = [
    'Parsing architectural drawing · rooms and furniture placement',
    'Extracting furniture quantities per room · 3 areas identified',
    'Comparing against SIF · 6 line items cross-checked',
]

const DRAWING_LINES: DrawingLine[] = [
    { id: 'D-01', area: 'Conf. Room 204', sku: 'AS-PANEL-72', description: 'Panel system 72"', drawingQty: 24, sifQty: 24, match: 'ok' },
    { id: 'D-02', area: 'Conf. Room 204', sku: 'AS-DSK-6030', description: 'Sit-stand desk 60×30', drawingQty: 8, sifQty: 6, match: 'qty-short' },
    { id: 'D-03', area: 'Conf. Room 204', sku: 'HON-IGN-CHR', description: 'Ignition task chair', drawingQty: 8, sifQty: 8, match: 'ok' },
    { id: 'D-04', area: 'Open Office Bay A', sku: 'AS-DSK-7236', description: 'Desk 72×36', drawingQty: 20, sifQty: 20, match: 'ok' },
    { id: 'D-05', area: 'Open Office Bay A', sku: 'HON-IGN-CHR', description: 'Ignition task chair', drawingQty: 42, sifQty: 42, match: 'ok' },
    { id: 'D-06', area: 'Reception', sku: 'APX-LNG-CHR', description: 'Lounge seating', drawingQty: 6, sifQty: 6, match: 'ok' },
]

export default function DesignSpecCheckScan() {
    const [phase, setPhase] = useState(-1)
    const [scanning, setScanning] = useState(false)
    const [drawingStep, setDrawingStep] = useState(-1)

    const handleStart = () => {
        setScanning(true)
        setPhase(0)
    }

    const { pauseAwareTimeout } = usePauseAware()

    // Spec check phase sequencing
    useEffect(() => {
        if (phase < 0 || phase >= CHECKS.length) return
        return pauseAwareTimeout(() => setPhase(p => p + 1), 1400)
    }, [phase, pauseAwareTimeout])

    // When spec checks complete, start drawing steps
    useEffect(() => {
        if (phase !== CHECKS.length) return
        return pauseAwareTimeout(() => setDrawingStep(0), 600)
    }, [phase, pauseAwareTimeout])

    // Drawing step sequencing
    useEffect(() => {
        if (drawingStep < 0 || drawingStep >= DRAWING_STEPS.length) return
        return pauseAwareTimeout(() => setDrawingStep(s => s + 1), 900)
    }, [drawingStep, pauseAwareTimeout])

    const specsDone = phase >= CHECKS.length
    const drawingDone = drawingStep >= DRAWING_STEPS.length
    const done = specsDone && drawingDone
    const runningCheck = phase >= 0 && !specsDone ? CHECKS[phase] : null
    const totalFindings = CHECKS.reduce((acc, c) => acc + c.findings, 0)
    const progressPct = Math.round((Math.min(phase, CHECKS.length) / CHECKS.length) * 100)
    const criticalLine = DRAWING_LINES.find(l => l.match !== 'ok')

    const statusLabel = done
        ? `Spec Check complete · ${totalFindings} finding${totalFindings !== 1 ? 's' : ''} ready for review`
        : specsDone
            ? 'Reading architectural drawing…'
            : scanning
                ? `Scanning · ${runningCheck?.label ?? 'Running'}…`
                : 'Ready to run Spec Check on Lakeside ICU Expansion'

    const statusDetail = done
        ? `Scanned 47 line items · ${totalFindings} finding${totalFindings !== 1 ? 's' : ''} surfaced · drawing vs SIF verified`
        : specsDone
            ? DRAWING_STEPS[drawingStep] ?? 'Comparing…'
            : scanning
                ? runningCheck?.detail
                : '4 AI checks · dimensions, finish, palette, availability · under 5 minutes'

    return (
        <div className="space-y-4">
            {/* Start / Status card */}
            <div className={`
                border rounded-2xl p-5 flex items-start gap-4 transition-colors
                ${done
                    ? 'bg-success/10 dark:bg-success/15 border-success/40'
                    : scanning
                        ? 'bg-ai/5 dark:bg-ai/10 border-ai/40'
                        : 'bg-card dark:bg-zinc-800 border-border'
                }
            `}>
                <div className={`
                    h-12 w-12 rounded-full flex items-center justify-center shrink-0
                    ${done ? 'bg-success/15 text-success' : scanning ? 'bg-ai/15 text-ai' : 'bg-ai/15 text-ai'}
                `}>
                    {done
                        ? <CheckCircle2 className="h-6 w-6" />
                        : scanning
                            ? <Loader2 className="h-6 w-6 animate-spin" />
                            : <ShieldCheck className="h-6 w-6" />
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-foreground">{statusLabel}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{statusDetail}</div>
                    {scanning && !specsDone && (
                        <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                <span>{progressPct}% complete</span>
                                <span>{Math.min(phase, CHECKS.length)} / {CHECKS.length} checks</span>
                            </div>
                            <div className="h-1.5 bg-background dark:bg-zinc-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-ai transition-all duration-300"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        </div>
                    )}
                    {specsDone && !drawingDone && (
                        <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                <span>Reading drawing…</span>
                                <span>{Math.min(drawingStep, DRAWING_STEPS.length)} / {DRAWING_STEPS.length} steps</span>
                            </div>
                            <div className="h-1.5 bg-background dark:bg-zinc-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-ai transition-all duration-300"
                                    style={{ width: `${Math.round((Math.min(drawingStep, DRAWING_STEPS.length) / DRAWING_STEPS.length) * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
                {!scanning && (
                    <button
                        onClick={handleStart}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <ShieldCheck className="h-4 w-4" />
                        Run Spec Check
                    </button>
                )}
            </div>

            {/* Check-by-check list */}
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CHECKS.map((check, i) => {
                    const isDone = specsDone || i < phase
                    const isRunning = scanning && !specsDone && i === phase
                    const isPending = !scanning || (!isDone && !isRunning)
                    const hasFindings = isDone && check.findings > 0

                    return (
                        <li
                            key={check.id}
                            className={`
                                rounded-xl border border-l-4 p-3 transition-colors
                                ${isDone && hasFindings ? 'bg-amber-50/60 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40 border-l-amber-500' : ''}
                                ${isDone && !hasFindings ? 'bg-success/5 dark:bg-success/10 border-success/30 border-l-success' : ''}
                                ${isRunning ? 'bg-ai/10 dark:bg-ai/15 border-ai/40 border-l-ai' : ''}
                                ${isPending ? 'bg-muted/50 dark:bg-zinc-800 border-border border-l-muted-foreground/30 opacity-60' : ''}
                            `}
                        >
                            <div className="flex items-start gap-2.5">
                                <div className={`
                                    h-8 w-8 rounded-lg flex items-center justify-center shrink-0
                                    ${isDone && hasFindings ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' : ''}
                                    ${isDone && !hasFindings ? 'bg-success/15 text-success' : ''}
                                    ${isRunning ? 'bg-ai/15 text-ai' : ''}
                                    ${isPending ? 'bg-muted text-muted-foreground' : ''}
                                `}>
                                    {isDone && hasFindings && <AlertTriangle className="h-4 w-4" />}
                                    {isDone && !hasFindings && <CheckCircle2 className="h-4 w-4" />}
                                    {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isPending && check.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-bold text-foreground">{check.label}</span>
                                        {isDone && (
                                            <StatusBadge
                                                label={hasFindings ? `${check.findings} finding${check.findings !== 1 ? 's' : ''}` : 'Clean'}
                                                tone={hasFindings ? 'warning' : 'success'}
                                                size="xs"
                                            />
                                        )}
                                        {isRunning && (
                                            <StatusBadge label="Scanning" tone="ai" size="xs" />
                                        )}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{check.detail}</div>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ol>

            {/* Drawing comparison panel — appears after spec checks complete */}
            {specsDone && (
                <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Header */}
                    <div className={`px-4 py-3 border-b border-border flex items-center gap-2 ${drawingDone ? 'bg-amber-50/40 dark:bg-amber-500/5' : 'bg-ai/5 dark:bg-ai/10'}`}>
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${drawingDone ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-ai/15 text-ai'}`}>
                            {drawingDone
                                ? <FileText className="h-3.5 w-3.5" />
                                : <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-foreground">
                                {drawingDone ? 'Drawing vs SIF · 1 critical quantity mismatch' : 'Reading architectural drawing · Lakeside ICU Floor 2'}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                {drawingDone
                                    ? '6 line items verified · 5 match · 1 critical (Conf. Room 204 desks)'
                                    : 'Extracting room quantities and comparing against CET/SIF…'
                                }
                            </div>
                        </div>
                        {drawingDone && (
                            <StatusBadge label="1 critical" tone="warning" size="sm" icon={<AlertTriangle className="h-3 w-3" />} />
                        )}
                    </div>

                    {/* Reading steps — visible while running */}
                    {!drawingDone && (
                        <div className="p-4 space-y-2">
                            {DRAWING_STEPS.map((step, i) => {
                                const stepDone = i < drawingStep
                                const stepRunning = i === drawingStep
                                return (
                                    <div
                                        key={i}
                                        className={`flex items-center gap-2.5 text-[11px] transition-opacity duration-300 ${stepDone || stepRunning ? 'opacity-100' : 'opacity-20'}`}
                                    >
                                        {stepDone
                                            ? <CheckCircle2 className="h-3.5 w-3.5 text-ai shrink-0" />
                                            : <Loader2 className="h-3.5 w-3.5 text-ai shrink-0 animate-spin" />
                                        }
                                        <span className={stepDone ? 'text-foreground' : 'text-muted-foreground'}>{step}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Comparison table — revealed when drawing read is done */}
                    {drawingDone && (
                        <div className="animate-in fade-in duration-300">
                            {/* Column headers */}
                            <div className="px-4 py-2 border-b border-border bg-muted/20 dark:bg-zinc-900/40 grid grid-cols-[1fr_6rem_3.5rem_3.5rem_4rem_5.5rem] gap-3 items-center">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Area · Item · SKU</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">Drawing qty</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">SIF qty</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">Delta</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Status</div>
                                <div></div>
                            </div>

                            <div className="divide-y divide-border">
                                {DRAWING_LINES.map(line => {
                                    const isCritical = line.match === 'qty-short'
                                    const delta = line.sifQty - line.drawingQty
                                    return (
                                        <div
                                            key={line.id}
                                            className={`
                                                grid grid-cols-[1fr_6rem_3.5rem_3.5rem_4rem_5.5rem] gap-3 px-4 py-2.5 items-center text-xs border-l-4 transition-colors
                                                ${isCritical ? 'border-l-red-500 bg-red-50/40 dark:bg-red-500/5' : 'border-l-success/50 bg-success/5 dark:bg-success/10'}
                                            `}
                                        >
                                            <div className="min-w-0">
                                                <div className="text-foreground font-medium truncate">{line.description}</div>
                                                <div className="text-[10px] text-muted-foreground font-mono truncate">{line.sku}</div>
                                                <div className="text-[10px] text-muted-foreground/70 truncate">{line.area}</div>
                                            </div>
                                            <div className="text-center tabular-nums font-bold text-[13px] text-foreground">
                                                {line.drawingQty}
                                            </div>
                                            <div className={`text-center tabular-nums font-bold text-[13px] ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                                {line.sifQty}
                                            </div>
                                            <div className={`text-center tabular-nums font-bold text-[12px] ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                                                {delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${delta}`}
                                            </div>
                                            <div className="flex justify-end">
                                                {isCritical
                                                    ? <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-700 dark:text-red-400 uppercase tracking-wider">
                                                        <AlertTriangle className="h-2.5 w-2.5" />
                                                        Short
                                                    </span>
                                                    : <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-success/15 text-success uppercase tracking-wider">
                                                        <CheckCircle2 className="h-2.5 w-2.5" />
                                                        Match
                                                    </span>
                                                }
                                            </div>
                                            <div>
                                                {isCritical && (
                                                    <div className="text-[9px] font-bold text-red-600 dark:text-red-400 leading-tight">
                                                        Drawing: {line.drawingQty}<br />
                                                        SIF: {line.sifQty} · −{line.drawingQty - line.sifQty} unit
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* AI conclusion banner */}
                            {criticalLine && (
                                <div className="border-t border-border p-3 bg-ai/5 dark:bg-ai/10 flex items-start gap-2.5">
                                    <div className="h-7 w-7 rounded-lg bg-ai/15 text-ai flex items-center justify-center shrink-0">
                                        <Zap className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="text-[11px] text-muted-foreground leading-relaxed flex-1">
                                        <span className="font-bold text-foreground">1 critical quantity mismatch.</span>{' '}
                                        Drawing shows <strong className="text-foreground">{criticalLine.drawingQty} Allsteel desks</strong> in Conf. Room 204 — SIF specifies {criticalLine.sifQty}.
                                        Strata flagging <strong className="text-foreground">−{criticalLine.drawingQty - criticalLine.sifQty} unit</strong> for Beth's review.
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Forward cue once done */}
            {done && (
                <div className="flex items-center gap-3 text-xs bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3 animate-in fade-in duration-300">
                    <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0" />
                    <span className="flex-1 text-foreground">
                        Next: Beth reviews <strong>2 findings</strong> — 1 quantity mismatch (Allsteel desk · Conf. Room 204 · −2 units) and 1 finish inconsistency. One click to resolve each — the exact class of mistake that used to slip to the client.
                    </span>
                </div>
            )}
        </div>
    )
}
