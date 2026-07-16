/**
 * COMPONENT: QuoteReadinessGate
 * PURPOSE: Checklist enforced before the quote workflow starts. Today MBI has
 *          no trigger or readiness criteria — premature quotes waste PC time.
 *          Strata gates the handoff: budget confirmed, contract identified,
 *          scope locked, design sign-off. All must be ✓ before PC picks it up.
 *
 *          (Teams-bot-driven in production — for demo shown as a 4-item checklist)
 *
 * PROPS:
 *   - items: optional overrides; defaults to hero scenario readiness
 *
 * STATES: idle → running (sequential check-off animation) → passed
 *
 * DS TOKENS: bg-card · border-success · text-success
 *
 * USED BY: MBIQuotesPage
 */

import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, Shield, Users, Loader2, Play } from 'lucide-react'
import { StatusBadge } from '../shared'

const DEFAULT_CHECKS = [
    { label: 'Budget confirmed', detail: 'BDG-2026-002 · Enterprise Holdings · $372,500 · approved' },
    { label: 'Contract identified', detail: 'HNI Corporate · 55% discount confirmed' },
    { label: 'Scope locked', detail: '45 workstations · 8 offices · 1 lounge · no pending changes' },
    { label: 'Design sign-off', detail: 'Design Manager Fane · SIF v5 validated · no open spec flags' },
]

const CHECK_DELAY_MS = 520

export default function QuoteReadinessGate() {
    const [phase, setPhase] = useState<'idle' | 'running' | 'passed'>('idle')
    const [checked, setChecked] = useState(0)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const runGate = () => {
        if (phase !== 'idle') return
        setPhase('running')
        setChecked(0)
    }

    useEffect(() => {
        if (phase !== 'running') return
        if (checked < DEFAULT_CHECKS.length) {
            timerRef.current = setTimeout(() => setChecked(c => c + 1), CHECK_DELAY_MS)
        } else {
            timerRef.current = setTimeout(() => setPhase('passed'), 300)
        }
        return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [phase, checked])

    const isPassed = phase === 'passed'
    const isRunning = phase === 'running'

    return (
        <div className={`border rounded-2xl p-4 transition-colors duration-500 ${isPassed ? 'bg-success/5 border-success/30' : 'bg-card dark:bg-zinc-800 border-border'}`}>
            <div className="flex items-start gap-3 mb-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${isPassed ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {isRunning
                        ? <Loader2 className="h-5 w-5 animate-spin" />
                        : <Shield className="h-5 w-5" />
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                            <div className="text-sm font-bold text-foreground">
                                {isPassed ? 'Quote readiness gate passed' : 'Quote readiness gate'}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                                {isPassed
                                    ? 'Enforced by Teams bot · all 4 criteria met before PC picks up'
                                    : 'Run to verify all 4 criteria before the PC picks up this project'}
                            </div>
                        </div>
                        {isPassed
                            ? <StatusBadge label="PC bottleneck avoided" tone="success" size="sm" icon={<Users className="h-3 w-3" />} />
                            : phase === 'idle' && (
                                <button
                                    onClick={runGate}
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                                >
                                    <Play className="h-3 w-3" />
                                    Run gate check
                                </button>
                            )
                        }
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {DEFAULT_CHECKS.map((c, i) => {
                    const isChecked = phase === 'passed' || (phase === 'running' && i < checked)
                    const isCurrent = phase === 'running' && i === checked
                    return (
                        <div
                            key={i}
                            className={`flex items-start gap-2 rounded-lg px-3 py-2 border transition-all duration-300 ${
                                isChecked
                                    ? 'bg-success/5 border-success/30 dark:bg-success/10'
                                    : isCurrent
                                        ? 'bg-ai/5 border-ai/30 dark:bg-ai/10'
                                        : 'bg-card dark:bg-zinc-800/60 border-border'
                            }`}
                        >
                            {isChecked
                                ? <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                : isCurrent
                                    ? <Loader2 className="h-4 w-4 text-ai shrink-0 mt-0.5 animate-spin" />
                                    : <div className="h-4 w-4 rounded-full border-2 border-border shrink-0 mt-0.5" />
                            }
                            <div className="flex-1 min-w-0">
                                <div className={`text-xs font-bold transition-colors ${isChecked ? 'text-success' : isCurrent ? 'text-ai' : 'text-muted-foreground'}`}>
                                    {c.label}
                                </div>
                                <div className="text-[10px] text-muted-foreground truncate">{c.detail}</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
