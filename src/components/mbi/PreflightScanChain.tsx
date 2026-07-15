/**
 * COMPONENT: PreflightScanChain
 * PURPOSE: 5-check sequential validation chain for the parsing step.
 *          Each check transitions: pending → running (spinner) → done (check).
 *          Mimics the trust-building pre-flight pattern from QuoteDetail
 *          but expanded from 3 to 5 checks per the MBI implementation plan.
 *
 * PROPS:
 *   - autoplay?: boolean       — start the chain immediately on mount (default true)
 *   - startDelay?: number      — ms before the first check starts (default 600)
 *   - perCheckDuration?: number — ms each check takes (default 1100)
 *   - onComplete?: () => void  — fires when all 5 checks done
 *
 * STATES:
 *   - phase: index of currently-running check (0-4) or 5 when done
 *   - per check: 'pending' | 'running' | 'done'
 *
 * DS TOKENS: bg-card · border-border · rounded-2xl · text-success/text-ai
 *
 * USED BY: ParsingStep — now rendered inside the MBIDetailSheet "Pre-flight log" popup (wizard step 1 · demo tour m1.2)
 */

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { StatusBadge } from '../shared'
import { usePauseAware } from '../../context/usePauseAware'

interface CheckSpec {
    id: string
    label: string
    detail: string
}

const CHECKS: CheckSpec[] = [
    { id: 'parse-schema', label: 'Parse SIF schema', detail: 'Validates XML structure + CET version compatibility' },
    { id: 'match-contract', label: 'Match contract pricing', detail: 'Detected: HNI Corporate · 55% discount' },
    { id: 'apply-markup', label: 'Apply markup', detail: 'Default 35% applied — adjustable per scenario' },
    { id: 'calc-freight', label: 'Calculate freight + install', detail: 'Freight 10% net · Install 12% (non-union)' },
    { id: 'validate-qty', label: 'Validate quantities + dimensions', detail: 'Cross-checks SIF qty against CET config' },
]

interface PreflightScanChainProps {
    autoplay?: boolean
    startDelay?: number
    perCheckDuration?: number
    onComplete?: () => void
}

type CheckState = 'pending' | 'running' | 'done'

export default function PreflightScanChain({
    autoplay = true,
    startDelay = 600,
    perCheckDuration = 1100,
    onComplete,
}: PreflightScanChainProps) {
    const [phase, setPhase] = useState(autoplay ? -1 : CHECKS.length)
    const { pauseAwareTimeout } = usePauseAware()

    useEffect(() => {
        if (!autoplay) return
        return pauseAwareTimeout(() => setPhase(0), startDelay)
    }, [autoplay, startDelay, pauseAwareTimeout])

    useEffect(() => {
        if (phase < 0 || phase >= CHECKS.length) {
            if (phase >= CHECKS.length) onComplete?.()
            return
        }
        return pauseAwareTimeout(() => setPhase(p => p + 1), perCheckDuration)
    }, [phase, perCheckDuration, onComplete, pauseAwareTimeout])

    const stateOf = (i: number): CheckState => {
        if (i < phase) return 'done'
        if (i === phase) return 'running'
        return 'pending'
    }

    const completedCount = Math.min(phase, CHECKS.length)
    const allDone = phase >= CHECKS.length

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl">
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${allDone ? 'bg-success/10 text-success' : 'bg-ai/10 text-ai'}`}>
                        <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Pre-flight scan</div>
                        <div className="text-[10px] text-muted-foreground">
                            {allDone ? 'All checks passed · ready for scenario generation' : `${completedCount}/${CHECKS.length} checks completed`}
                        </div>
                    </div>
                </div>
                <StatusBadge label={allDone ? 'Done' : 'Scanning'} tone={allDone ? 'success' : 'ai'} size="sm" />
            </div>

            <div className="p-4 space-y-2">
                {CHECKS.map((check, i) => {
                    const state = stateOf(i)
                    return (
                        <div
                            key={check.id}
                            className={`
                                flex items-start gap-3 px-3 py-2 rounded-lg border transition-colors
                                ${state === 'done' ? 'border-success/30 bg-success/10 dark:bg-success/15 border-l-4 border-l-success' : ''}
                                ${state === 'running' ? 'border-ai/40 bg-ai/10 dark:bg-ai/15 border-l-4 border-l-ai' : ''}
                                ${state === 'pending' ? 'border-border bg-muted/50 dark:bg-zinc-800 opacity-60' : ''}
                            `}
                        >
                            {state === 'done' && <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />}
                            {state === 'running' && <Loader2 className="h-4 w-4 text-ai shrink-0 mt-0.5 animate-spin" />}
                            {state === 'pending' && <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5" />}
                            <div className="flex-1 min-w-0">
                                <div className={`text-xs font-semibold ${state === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                                    {check.label}
                                </div>
                                <div className="text-[10px] text-muted-foreground leading-snug">{check.detail}</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
