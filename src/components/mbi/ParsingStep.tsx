/**
 * COMPONENT: ParsingStep
 * PURPOSE: Simplified Step 2 (AI Parsing) for the Budget wizard — presents the
 *          AI parsing outcome as a focused hero surface instead of stacking the
 *          raw SIF XML, the extraction feed, the 5-check pre-flight chain, and
 *          the scenario grid all at once.
 *
 *          Hero zone = extracted items + confidence badge.
 *          Pre-flight = 1-line summary strip with "View log" sheet.
 *          SIF source XML = "View source" button → DetailSheet.
 *
 *          Once the animation completes (or the user skips), a clear CTA
 *          leads into scenarios.
 *
 * PROPS: (same contract as the old ParsingView — preserved so MBIBudgetPage
 *        wiring doesn't change)
 *   - selectedTier, onSelectTier, markupOverrides, onMarkupChange
 *
 * DS TOKENS: bg-card · bg-ai/5 · border-border · rounded-2xl · primary/success
 *
 * USED BY: MBIBudgetPage (wizard index 1)
 */

import { useEffect, useState } from 'react'
import { Sparkles, FileCode2, ShieldCheck, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
import MBIDetailSheet from './MBIDetailSheet'
import ParsingDiscrepanciesPanel, { DEFAULT_PARSING_DISCREPANCIES, type DiscrepancyStatus } from './ParsingDiscrepanciesPanel'
import { getSIFSample } from '../../config/profiles/mbi-data'
import type { ScenarioTier } from '../../config/profiles/mbi-data'
import { usePauseAware } from '../../context/usePauseAware'

interface ParsingStepProps {
    selectedTier: ScenarioTier | null
    onSelectTier: (tier: ScenarioTier) => void
    markupOverrides: Partial<Record<ScenarioTier, number>>
    onMarkupChange: (tier: ScenarioTier, v: number) => void
}

const PREFLIGHT_CHECKS = [
    { id: 'parse-schema', label: 'CET export validated · 24 fields confirmed', detail: 'CET export read · field count verified · ready for enrichment' },
    { id: 'match-contract', label: 'Match contract pricing', detail: 'Detected: HNI Corporate · 55% discount' },
    { id: 'apply-markup', label: 'Apply markup', detail: 'Default 35% applied — adjustable per scenario' },
    { id: 'calc-freight', label: 'Calculate freight + install', detail: 'Freight 10% net · Install 12% (non-union)' },
    { id: 'validate-qty', label: 'Validate quantities + dimensions', detail: 'Cross-checks SIF qty against CET config' },
]

export default function ParsingStep(_props: ParsingStepProps) {
    const sif = getSIFSample('SIF-ENTERPRISE-001')
    const [sourceOpen, setSourceOpen] = useState(false)
    const [logOpen, setLogOpen] = useState(false)
    const [preflightPhase, setPreflightPhase] = useState(-1)
    const [discrepancyStatus, setDiscrepancyStatus] = useState<Record<string, DiscrepancyStatus>>({})
    const handleDiscrepancy = (id: string, s: DiscrepancyStatus) =>
        setDiscrepancyStatus(prev => ({ ...prev, [id]: s }))

    // Preflight auto-plays shortly after mount — no parser to wait for
    const { pauseAwareTimeout } = usePauseAware()
    useEffect(() => {
        return pauseAwareTimeout(() => setPreflightPhase(0), 400)
    }, [pauseAwareTimeout])

    useEffect(() => {
        if (preflightPhase < 0 || preflightPhase >= PREFLIGHT_CHECKS.length) return
        return pauseAwareTimeout(() => setPreflightPhase(p => p + 1), 900)
    }, [preflightPhase, pauseAwareTimeout])

    const preflightDone = preflightPhase >= PREFLIGHT_CHECKS.length
    const preflightRunningLabel = preflightPhase >= 0 && !preflightDone
        ? PREFLIGHT_CHECKS[preflightPhase]?.label ?? 'Scanning'
        : 'Scanning'

    if (!sif) return null

    return (
        <>
            {/* CET import context banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3.5 flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-ai/15 text-ai flex items-center justify-center shrink-0">
                    <FileCode2 className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground">CET export received · Strata applying contract pricing and validation</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                        {sif.fileName} · {sif.fieldCount} fields · {sif.lineItems.length} line items · ${sif.totals.grossValue.toLocaleString()} gross value
                    </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider shrink-0">Budget · Quotes</span>
            </div>

            {/* Hero — pre-flight checks running inline */}
            <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
                    {preflightDone
                        ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        : <Loader2 className="h-4 w-4 text-ai animate-spin shrink-0" />}
                    <div className="flex-1 min-w-0">
                        <div className={`text-xs font-bold ${preflightDone ? 'text-success' : 'text-foreground'}`}>
                            {preflightDone ? 'Pre-flight complete · 5/5 checks passed' : `Running · ${preflightRunningLabel}`}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Contract · markup · freight · quantities</div>
                    </div>
                    <button
                        onClick={() => setLogOpen(true)}
                        className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        View log
                    </button>
                </div>
                <ol className="divide-y divide-border/60">
                    {PREFLIGHT_CHECKS.map((check, i) => {
                        const done = preflightDone || i < preflightPhase
                        const running = !preflightDone && i === preflightPhase
                        return (
                            <li key={check.id} className={`
                                flex items-start gap-3 px-4 py-2.5 border-l-4 transition-colors
                                ${done ? 'border-l-success bg-success/5 dark:bg-success/10' : ''}
                                ${running ? 'border-l-ai bg-ai/5 dark:bg-ai/10' : ''}
                                ${!done && !running ? 'border-l-transparent opacity-50' : ''}
                            `}>
                                {done && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />}
                                {running && <Loader2 className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5 animate-spin" />}
                                {!done && !running && <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5" />}
                                <div className="flex-1 min-w-0">
                                    <div className={`text-[11px] font-bold ${done ? 'text-foreground' : running ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {check.label}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground leading-snug">{check.detail}</div>
                                </div>
                            </li>
                        )
                    })}
                </ol>
            </div>

            {/* Source link */}
            <button
                onClick={() => setSourceOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/20 dark:bg-zinc-900/40 hover:border-primary/40 transition-colors text-left w-full md:w-auto"
            >
                <FileCode2 className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">View CET export source</div>
                    <div className="text-[10px] text-muted-foreground">{sif.fileName} · {sif.fieldCount} fields · imported directly — no re-mapping needed</div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
            </button>

            {/* Parse-time discrepancies — shown once pre-flight is done */}
            {preflightDone && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <ParsingDiscrepanciesPanel
                        discrepancies={DEFAULT_PARSING_DISCREPANCIES}
                        statusById={discrepancyStatus}
                        onStatusChange={handleDiscrepancy}
                    />
                </div>
            )}

            {/* Next-step cue — once pre-flight is done, invite to scenarios */}
            {preflightDone && (
                <div className="flex items-center gap-3 text-xs bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3 animate-in fade-in duration-300">
                    <Sparkles className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0" />
                    <span className="flex-1 text-foreground">
                        Structured data ready · <strong>3 scenarios</strong> generated. Triage discrepancies above, then continue to <strong>Scenarios</strong>.
                    </span>
                </div>
            )}

            {/* ─── Floating sheets ─────────────────────────────────────── */}
            <MBIDetailSheet
                isOpen={sourceOpen}
                onClose={() => setSourceOpen(false)}
                title="SIF source file"
                subtitle={`${sif.fileName} · CET v${sif.cetVersion} · ${sif.fieldCount} fields`}
                icon={<FileCode2 className="h-4 w-4" />}
                width="md"
            >
                <pre className="font-mono text-[11px] text-foreground bg-muted/30 dark:bg-zinc-900/40 border border-border rounded-xl p-4 overflow-x-auto leading-relaxed">
{`<sif-export>
  <header>
    <cet-version>${sif.cetVersion}</cet-version>
    <field-count>${sif.fieldCount}</field-count>
    <client>Enterprise Holdings</client>
    <project>New HQ Floor 12</project>
  </header>
  <line-items>
${sif.lineItems.map(i => `    <item sku="${i.sku}" qty="${i.quantity}" desc="${i.description}" unit="${i.unitPrice}" total="${i.total}" />`).join('\n')}
  </line-items>
  <totals>
    <gross>${sif.totals.grossValue}</gross>
    <net>${sif.totals.netValue}</net>
  </totals>
</sif-export>`}
                </pre>
                <div className="mt-4 text-xs text-muted-foreground">
                    Raw SIF payload exported from CET. Strata parses this into the structured list you see in the hero view — no manual re-keying.
                </div>
            </MBIDetailSheet>

            <MBIDetailSheet
                isOpen={logOpen}
                onClose={() => setLogOpen(false)}
                title="Pre-flight scan log"
                subtitle="5 sequential AI checks · runs on every SIF import"
                icon={<ShieldCheck className="h-4 w-4" />}
                width="sm"
            >
                <ol className="space-y-2">
                    {PREFLIGHT_CHECKS.map((check, i) => {
                        const done = preflightDone || i < preflightPhase
                        const running = !preflightDone && i === preflightPhase
                        return (
                            <li
                                key={check.id}
                                className={`
                                    flex items-start gap-3 px-3 py-2.5 rounded-lg border border-l-4
                                    ${done ? 'bg-success/10 dark:bg-success/15 border-success/30 border-l-success' : ''}
                                    ${running ? 'bg-ai/10 dark:bg-ai/15 border-ai/30 border-l-ai' : ''}
                                    ${!done && !running ? 'bg-muted/50 dark:bg-zinc-800 border-border border-l-muted-foreground/30 opacity-60' : ''}
                                `}
                            >
                                {done && <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />}
                                {running && <Loader2 className="h-4 w-4 text-ai shrink-0 mt-0.5 animate-spin" />}
                                {!done && !running && <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5" />}
                                <div className="flex-1 min-w-0">
                                    <div className={`text-xs font-bold ${done || running ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {check.label}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground leading-snug">{check.detail}</div>
                                </div>
                            </li>
                        )
                    })}
                </ol>
            </MBIDetailSheet>
        </>
    )
}
