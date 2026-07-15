/**
 * COMPONENT: QuoteAutoImportScene
 * PURPOSE: Flow 3 · Scene 1 — the SIF→CORE auto-import moment. Shows Strata
 *          pulling 24 structured fields from Amanda's signed SIF directly
 *          into a CORE proposal draft. No typing, no re-keying.
 *
 *          Hero = SIFToCOREPreview (existing 3-column animation). Framed
 *          with before/after savings callout and forward cue.
 *
 * DS TOKENS: bg-card · ai / primary accents
 *
 * USED BY: MBIQuotesPage (wizard scene 1)
 */

import { Keyboard, ArrowRight, Clock, Sparkles, CheckCircle2 } from 'lucide-react'
import SIFToCOREPreview from './SIFToCOREPreview'
import DataSourcesBar, { SOURCES } from './DataSourcesBar'

export default function QuoteAutoImportScene() {
    return (
        <div className="space-y-4">
            {/* Before / After contrast strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-red-50/60 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 rounded-xl p-3 flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0">
                        <Keyboard className="h-4 w-4" />
                    </div>
                    <div className="text-xs min-w-0">
                        <div className="font-bold text-foreground">Before · 2 hours per proposal</div>
                        <div className="text-muted-foreground mt-0.5">
                            PC manually keyed 24 fields from SIF into CORE · line items re-typed · freight + install re-calculated · 4 audit loops to catch typos.
                        </div>
                    </div>
                </div>
                <div className="bg-success/10 dark:bg-success/15 border border-success/30 rounded-xl p-3 flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-success/15 text-success flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="text-xs min-w-0">
                        <div className="font-bold text-foreground">Now · zero keystrokes</div>
                        <div className="text-muted-foreground mt-0.5">
                            The signed SIF flows directly into CORE — no re-entry, no copy-paste. Strata applies contract pricing and builds the proposal draft in <strong className="text-foreground">under 90 seconds.</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero — existing 3-column SIF → CORE visualization */}
            <SIFToCOREPreview />

            {/* What just happened */}
            <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl p-4">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    What Strata just did · no PC intervention
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <AutoImportCheck label="CET export → CORE · zero re-entry" caption="24 fields · 7 line items" />
                    <AutoImportCheck label="Matched contract pricing" caption="HNI Corporate · 55%" />
                    <AutoImportCheck label="Built CORE proposal draft" caption="PROP-2026-003 · v1" />
                    <AutoImportCheck label="Customer context added" caption="Enterprise · corporate · floor 12" />
                </div>
            </div>

            {/* Time saved callout */}
            <div className="bg-gradient-to-br from-success/5 to-primary/5 dark:from-success/10 dark:to-primary/10 border border-success/30 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground">2 hours saved · 0 typos introduced</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            Auto-import ran in 87 seconds. CORE proposal draft PROP-2026-003 is ready for the AI validation pass.
                        </div>
                    </div>
                </div>
                <ArrowRight className="h-5 w-5 text-success shrink-0" />
            </div>

            {/* Forward cue */}
            <div className="flex items-center gap-3 text-xs bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3">
                <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0" />
                <span className="flex-1 text-foreground">
                    Next: Strata runs <strong>Spec Check</strong> against CORE constraints, vendor availability, and non-catalog pricing — the 4-loop audit collapses into 1 AI pass + 1 PC review.
                </span>
            </div>

            <DataSourcesBar groups={[
                { sources: [SOURCES.SIF_FILE] },
                { sources: [SOURCES.STRATA_AI] },
                { sources: [SOURCES.CORE_RPA] },
            ]} />
        </div>
    )
}

function AutoImportCheck({ label, caption }: { label: string; caption: string }) {
    return (
        <div className="bg-muted/60 dark:bg-zinc-900/40 border border-border rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                <span className="truncate">{label}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{caption}</div>
        </div>
    )
}
