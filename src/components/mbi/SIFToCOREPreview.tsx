/**
 * COMPONENT: SIFToCOREPreview
 * PURPOSE: 3-column visualization of the auto-import that eliminates MBI's
 *          largest manual step — SIF re-entry into CORE by the PC team.
 *          Left: SIF source · Middle: AI extraction · Right: CORE proposal draft.
 *
 *          Idle: SIF column shown, AI + CORE columns greyed out.
 *          Running: extraction steps appear one-by-one in column 2, then
 *          CORE column reveals with a success flash (column 3).
 *
 * DS TOKENS: bg-card · border-border · ai (AI column) · primary (CORE output)
 *
 * USED BY: MBIQuotesPage
 */

import { useState, useEffect, useRef } from 'react'
import { FileCode2, Sparkles, FileText, ArrowRight, Check, Play, Loader2 } from 'lucide-react'
import { StatusBadge } from '../shared'
import { getSIFSample, MBI_PROPOSALS } from '../../config/profiles/mbi-data'

const EXTRACTION_STEPS = [
    'CET export validated · 24 fields confirmed',
    'Contract matched · HNI Corporate 55%',
    'Customer context added',
    'Shipping params applied',
    'CORE Quote QUOT-2026-003 has been created · ready for GP review',
]

const STEP_DELAY_MS = 600

export default function SIFToCOREPreview() {
    const sif = getSIFSample('SIF-ENTERPRISE-001')
    const proposal = MBI_PROPOSALS.find(p => p.budgetId === 'BDG-2026-002') ?? MBI_PROPOSALS[0]

    const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')
    const [stepsVisible, setStepsVisible] = useState(0)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const runImport = () => {
        if (phase !== 'idle') return
        setPhase('running')
        setStepsVisible(0)
    }

    useEffect(() => {
        if (phase !== 'running') return
        if (stepsVisible < EXTRACTION_STEPS.length) {
            timerRef.current = setTimeout(() => setStepsVisible(s => s + 1), STEP_DELAY_MS)
        } else {
            timerRef.current = setTimeout(() => setPhase('done'), 400)
        }
        return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [phase, stepsVisible])

    if (!sif) return null

    const isDone = phase === 'done'
    const isRunning = phase === 'running'

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-ai/10 text-ai flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">SIF → CORE Quote · AI extraction</div>
                        <div className="text-[10px] text-muted-foreground">
                            Eliminates largest manual step · PC shifts from builder to reviewer
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isDone && <StatusBadge label="Auto-built" tone="success" size="sm" icon={<Check className="h-3 w-3" />} />}
                    {phase === 'idle' && (
                        <button
                            onClick={runImport}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <Play className="h-3 w-3" />
                            Run import
                        </button>
                    )}
                    {isRunning && (
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ai">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Importing…
                        </span>
                    )}
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-3">
                    {/* Column 1: SIF source — always visible */}
                    <div className="bg-muted/40 dark:bg-zinc-900/40 border border-border rounded-xl p-3 flex flex-col">
                        <div className="flex items-center gap-1.5 mb-2">
                            <FileCode2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">SIF source</span>
                        </div>
                        <div className="text-xs font-bold text-foreground truncate">{sif.fileName}</div>
                        <div className="text-[10px] text-muted-foreground">CET v{sif.cetVersion}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{sif.fieldCount} fields · {sif.lineItems.length} line items</div>
                        <div className="mt-auto pt-2 border-t border-border text-[10px]">
                            <div className="font-semibold text-foreground">Gross value</div>
                            <div className="text-sm font-bold text-foreground tabular-nums">${sif.totals.grossValue.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Arrow 1 */}
                    <div className="hidden md:flex items-center justify-center">
                        <div className="flex flex-col items-center gap-1">
                            <ArrowRight className={`h-4 w-4 transition-colors duration-300 ${phase !== 'idle' ? 'text-ai' : 'text-border'}`} />
                            <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors duration-300 ${phase !== 'idle' ? 'text-ai' : 'text-border'}`}>Auto</span>
                        </div>
                    </div>

                    {/* Column 2: AI extraction */}
                    <div className={`border rounded-xl p-3 flex flex-col transition-colors duration-300 ${phase !== 'idle' ? 'bg-ai/10 dark:bg-ai/15 border-ai/30' : 'bg-muted/20 border-border opacity-50'}`}>
                        <div className="flex items-center gap-1.5 mb-2">
                            {isRunning
                                ? <Loader2 className="h-3.5 w-3.5 text-ai animate-spin" />
                                : <Sparkles className="h-3.5 w-3.5 text-ai" />
                            }
                            <span className="text-[10px] font-bold text-ai uppercase tracking-wider">AI extraction</span>
                        </div>
                        <div className="space-y-1 flex-1">
                            {EXTRACTION_STEPS.map((step, i) => {
                                const visible = phase === 'done' || (phase === 'running' && i < stepsVisible)
                                const current = phase === 'running' && i === stepsVisible
                                return (
                                    <div
                                        key={i}
                                        className={`flex items-center gap-1.5 text-[11px] transition-opacity duration-200 ${visible || current ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        {visible
                                            ? <Check className="h-3 w-3 text-ai shrink-0" />
                                            : <Loader2 className="h-3 w-3 text-ai shrink-0 animate-spin" />
                                        }
                                        <span className="text-foreground">{step}</span>
                                    </div>
                                )
                            })}
                        </div>
                        <div className={`mt-2 pt-2 border-t border-ai/20 text-[10px] transition-opacity duration-300 ${isDone ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="font-semibold text-foreground">Confidence</div>
                            <div className="text-sm font-bold text-ai tabular-nums">96%</div>
                        </div>
                    </div>

                    {/* Arrow 2 */}
                    <div className="hidden md:flex items-center justify-center">
                        <div className="flex flex-col items-center gap-1">
                            <ArrowRight className={`h-4 w-4 transition-colors duration-300 ${isDone ? 'text-zinc-900 dark:text-primary' : 'text-border'}`} />
                            <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors duration-300 ${isDone ? 'text-zinc-900 dark:text-primary' : 'text-border'}`}>Build</span>
                        </div>
                    </div>

                    {/* Column 3: CORE output — reveals on done */}
                    <div className={`border rounded-xl p-3 flex flex-col transition-all duration-500 ${isDone ? 'bg-primary/10 dark:bg-primary/15 border-primary/30 opacity-100' : 'bg-muted/20 border-border opacity-40'}`}>
                        <div className="flex items-center gap-1.5 mb-2">
                            <FileText className="h-3.5 w-3.5 text-zinc-900 dark:text-primary" />
                            <span className="text-[10px] font-bold text-zinc-900 dark:text-primary uppercase tracking-wider">CORE Quote</span>
                        </div>
                        <div className="text-xs font-bold text-foreground font-mono">{proposal.id}</div>
                        <div className="text-[10px] text-muted-foreground">Pending GP review</div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                            {proposal.lineItemCount} line items · {proposal.manufacturers.length} vendors
                        </div>
                        <div className="mt-auto pt-2 border-t border-primary/20 text-[10px]">
                            <div className="font-semibold text-foreground">Ready for review</div>
                            <div className="text-[10px] text-muted-foreground">
                                Was: manual re-entry · Now: AI extraction + GP entry
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
