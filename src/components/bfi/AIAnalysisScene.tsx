/**
 * COMPONENT: AIAnalysisScene  (r1.3)
 * PURPOSE: Product Receiving step 3 — Strata cross-references packing list
 *          vs bingo sheet. Progress bar → BingoGrid 35 cells → #34 missing.
 *
 * States: 'analyzing' | 'results'
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import ReceivingProcessBar from './ReceivingProcessBar'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface AIAnalysisSceneProps {
    onComplete?: () => void
}

type SceneState = 'analyzing' | 'results'

const MESSAGES = [
    'Parsing packing list PDF',
    'Reading bingo sheet — Page 1',
    'Reading line item sequence — Page 2',
    'Cross-referencing bingo numbers — Page 3',
    'Detecting discrepancies',
    '✓ Analysis complete — 1 issue found · Carton #34 missing',
]

const MSG_DELAYS = [400, 900, 1400, 1900, 2400, 2900]

function BingoGrid35({ highlightMissing }: { highlightMissing: boolean }) {
    return (
        <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => {
                const num = i + 1
                const isMissing = num === 34
                return (
                    <div
                        key={num}
                        className={`h-7 rounded border flex items-center justify-center text-[10px] font-bold animate-in fade-in duration-150 ${
                            isMissing && highlightMissing
                                ? 'bg-destructive/20 border-destructive/50 text-destructive animate-pulse'
                                : 'bg-success/15 border-success/30 text-success'
                        }`}
                    >
                        {num}
                    </div>
                )
            })}
        </div>
    )
}

export default function AIAnalysisScene({ onComplete }: AIAnalysisSceneProps) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [sceneState, setSceneState] = useState<SceneState>('analyzing')
    const [visibleMessages, setVisibleMessages] = useState(0)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    // Start analysis on mount
    useEffect(() => {
        MSG_DELAYS.forEach((delay, i) => {
            setTimeout(pauseAware(() => setVisibleMessages(i + 1)), delay)
        })
        setTimeout(pauseAware(() => setSceneState('results')), 3600)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Analyzing ─────────────────────────────────────────────────────────────
    if (sceneState === 'analyzing') {
        return (
            <div className="space-y-4">
                <ReceivingProcessBar stepId="r1.3" />

                <div className="bg-ai/5 border border-ai/20 rounded-xl p-3 flex items-start gap-2.5">
                    <div className="h-4 w-4 border-2 border-ai border-t-transparent rounded-full animate-spin shrink-0 mt-0.5" />
                    <div className="text-xs flex-1">
                        <div className="font-bold text-foreground">AI Analysis running · PMO-2026-0412</div>
                        <div className="text-muted-foreground mt-0.5">Cross-referencing packing list vs bingo sheet — 35 cartons</div>
                    </div>
                </div>

                {/* Progress messages */}
                <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <div className="px-3.5 py-2 border-b border-border bg-muted/40">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Analysis Progress</span>
                    </div>
                    <div className="divide-y divide-border/50">
                        {MESSAGES.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-2.5 px-3.5 py-2.5 transition-all duration-300 ${
                                    i < visibleMessages ? 'opacity-100' : 'opacity-0'
                                }`}
                            >
                                {i < visibleMessages - 1 ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                ) : i === visibleMessages - 1 ? (
                                    <div className="h-3.5 w-3.5 border-2 border-ai border-t-transparent rounded-full animate-spin shrink-0" />
                                ) : (
                                    <div className="h-3.5 w-3.5 rounded-full border border-border/40 shrink-0" />
                                )}
                                <span className={`text-xs ${
                                    i === MESSAGES.length - 1 && i < visibleMessages
                                        ? 'text-destructive font-semibold'
                                        : i < visibleMessages
                                        ? 'text-foreground'
                                        : 'text-muted-foreground/40'
                                }`}>
                                    {msg}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
            </div>
        )
    }

    // ── Results ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <ReceivingProcessBar stepId="r1.3" />

            {/* Summary */}
            <div className="bg-ai/5 border border-ai/20 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Analysis complete · PMO-2026-0412 · in under 10 seconds</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        35 cartons cross-referenced against bingo sheet. <span className="font-semibold text-destructive">1 discrepancy found</span> — Carton #34 is missing.
                    </div>
                </div>
            </div>

            {/* Bingo grid */}
            <div className="border border-border rounded-xl p-3.5 bg-card space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Bingo Sheet · BD-2026-0412 · 35 cartons</span>
                    <div className="flex items-center gap-2.5">
                        <span className="text-[11px] text-success font-medium">34 ✓</span>
                        <span className="text-[11px] text-destructive font-medium">1 missing</span>
                    </div>
                </div>
                <BingoGrid35 highlightMissing />
                <div className="text-[10px] text-muted-foreground">
                    Before Strata: Lauren and Lena cross-referenced pages manually — no automatic detection, up to 1 week delay
                </div>
            </div>

            {/* Missing alert */}
            <div className="bg-destructive/5 border border-destructive/30 rounded-xl px-3.5 py-3 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-destructive">Carton #34 missing</div>
                    <div className="text-muted-foreground mt-0.5">Line 24 · Chair Frame Assembly ×1 · short-shipped at origin</div>
                    <div className="text-muted-foreground mt-1 text-[10px] italic">
                        The bingo sheet has no "missing" checkbox — Workplace wrote manually. Strata detects what the paper form can't flag.
                    </div>
                </div>
            </div>

            <button
                onClick={() => onComplete?.()}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
            >
                View alert & file claim
                <ChevronRight className="h-4 w-4" />
            </button>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
        </div>
    )
}
