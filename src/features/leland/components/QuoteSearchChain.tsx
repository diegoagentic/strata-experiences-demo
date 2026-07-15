/**
 * COMPONENT: QuoteSearchChain
 * PURPOSE: Quote search panel for step l1.2. Top = 4 search strategies that
 *          run sequentially (pending → running → done). Bottom = top 3 quote
 *          candidates revealed once strategies complete, with score bars and
 *          a clear top match.
 *
 *          Adapted from MBI's PreflightScanChain pattern. Uses usePauseAware.
 *
 * PROPS:
 *   - autoplay?: boolean
 *   - perStrategyDuration?: number   — ms per strategy (default 900)
 *
 * USED BY: LelandStrataShell when currentStep.id === 'l1.2'
 */

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Search, FileSearch, ChevronRight } from 'lucide-react';
import { Callout } from 'strata-design-system';
import StatusBadge from '../../../components/shared/StatusBadge';
import StepCompletionCta from './StepCompletionCta';
import { usePauseAware } from '../../../context/usePauseAware';
import { HERO_PO_HAPPY } from '../../../config/profiles/leland-data';

interface SearchStrategy {
    id: string;
    label: string;
    detail: string;
}

const STRATEGIES: SearchStrategy[] = [
    { id: 'quote-ref',   label: 'Quote # reference in PO',   detail: `Looking for "${HERO_PO_HAPPY.quoteRef}" in instructions and references` },
    { id: 'project',     label: 'Project name match',         detail: `"${HERO_PO_HAPPY.project}"` },
    { id: 'customer',    label: 'Customer + line items',     detail: `Dealer ${HERO_PO_HAPPY.dealer} · ${HERO_PO_HAPPY.lineItems.length} SKUs` },
    { id: 'date-range',  label: 'Date range scan',            detail: 'Quotes within 90 days of PO date' },
];

interface QuoteCandidate {
    quoteNumber: string;
    score: number;        // 0-100
    matchReasons: string[];
    summary: string;
}

const CANDIDATES: QuoteCandidate[] = [
    {
        quoteNumber: 'Q18533-01',
        score: 98,
        matchReasons: ['Quote # exact match', 'Customer match', 'All line items match'],
        summary: '3 lines · government contract · freight approved',
    },
    {
        quoteNumber: 'Q18234',
        score: 64,
        matchReasons: ['Customer match', '1 of 3 lines match'],
        summary: '6 lines · government contract',
    },
    {
        quoteNumber: 'Q17985',
        score: 41,
        matchReasons: ['Project name partial', 'Date range match'],
        summary: '2 lines · co-op contract',
    },
];

type CheckState = 'pending' | 'running' | 'done';

interface QuoteSearchChainProps {
    autoplay?: boolean;
    perStrategyDuration?: number;
}

export default function QuoteSearchChain({
    autoplay = true,
    perStrategyDuration = 900,
}: QuoteSearchChainProps) {
    const [phase, setPhase] = useState(autoplay ? -1 : STRATEGIES.length);
    const [showResults, setShowResults] = useState(!autoplay);
    const { pauseAwareTimeout } = usePauseAware();

    // Kick off after a small delay
    useEffect(() => {
        if (!autoplay) return;
        return pauseAwareTimeout(() => setPhase(0), 400);
    }, [autoplay, pauseAwareTimeout]);

    // Advance through strategies
    useEffect(() => {
        if (phase < 0 || phase >= STRATEGIES.length) {
            if (phase >= STRATEGIES.length && !showResults) {
                return pauseAwareTimeout(() => setShowResults(true), 300);
            }
            return;
        }
        return pauseAwareTimeout(() => setPhase(p => p + 1), perStrategyDuration);
    }, [phase, perStrategyDuration, pauseAwareTimeout, showResults]);

    const stateOf = (i: number): CheckState => {
        if (i < phase) return 'done';
        if (i === phase) return 'running';
        return 'pending';
    };
    const completedCount = Math.min(phase, STRATEGIES.length);
    const allDone = phase >= STRATEGIES.length;

    return (
        <div className="space-y-4">
            {/* Strategies card */}
            <div className="bg-card border border-border rounded-2xl">
                <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${allDone ? 'bg-success/10 text-success' : 'bg-ai/10 text-ai'}`}>
                            <Search className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-foreground">Multi-strategy quote search</div>
                            <div className="text-[10px] text-muted-foreground">
                                {allDone
                                    ? `${STRATEGIES.length} strategies complete · ranking candidates`
                                    : `${completedCount}/${STRATEGIES.length} strategies · searching Seradex`}
                            </div>
                        </div>
                    </div>
                    <StatusBadge label={allDone ? 'Done' : 'Searching'} tone={allDone ? 'success' : 'ai'} size="sm" />
                </div>

                <div className="p-4 space-y-2">
                    {STRATEGIES.map((s, i) => {
                        const state = stateOf(i);
                        return (
                            <div
                                key={s.id}
                                className={`
                                    flex items-start gap-3 px-3 py-2 rounded-lg border transition-colors
                                    ${state === 'done' ? 'border-success/30 bg-success/10 dark:bg-success/15 border-l-4 border-l-success' : ''}
                                    ${state === 'running' ? 'border-ai/40 bg-ai/10 dark:bg-ai/15 border-l-4 border-l-ai' : ''}
                                    ${state === 'pending' ? 'border-border bg-muted/50 opacity-60' : ''}
                                `}
                            >
                                {state === 'done' && <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />}
                                {state === 'running' && <Loader2 className="h-4 w-4 text-ai shrink-0 mt-0.5 animate-spin" />}
                                {state === 'pending' && <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5" />}
                                <div className="flex-1 min-w-0">
                                    <div className={`text-xs font-semibold ${state === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                                        {s.label}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground leading-snug">{s.detail}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Candidates panel — appears after all strategies done */}
            {showResults && (
                <div className="bg-card border border-border rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-success/10 text-success flex items-center justify-center">
                                <FileSearch className="h-3.5 w-3.5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-foreground">Top 3 candidates</div>
                                <div className="text-[10px] text-muted-foreground">Ranked by composite match score</div>
                            </div>
                        </div>
                        <StatusBadge label="Top match selected" tone="success" size="sm" />
                    </div>

                    <div className="p-4 space-y-2">
                        {CANDIDATES.map((c, i) => {
                            const isTop = i === 0;
                            return (
                                <div
                                    key={c.quoteNumber}
                                    className={`
                                        rounded-xl border p-3 transition-colors animate-in fade-in slide-in-from-left-2
                                        ${isTop ? 'border-brand-400 bg-brand-300/10 dark:border-brand-500 dark:bg-brand-500/10' : 'border-border bg-muted/20'}
                                    `}
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Score donut */}
                                        <ScoreDonut value={c.score} highlight={isTop} />

                                        {/* Quote info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-foreground">{c.quoteNumber}</span>
                                                {isTop && <StatusBadge label="Selected · auto-fill" tone="primary" size="xs" />}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">{c.summary}</div>
                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                                {c.matchReasons.map(reason => (
                                                    <span key={reason} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                        {reason}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {isTop && <ChevronRight className="h-4 w-4 text-brand-400 dark:text-brand-300 shrink-0" />}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="mt-2">
                            <Callout
                                tone="success"
                                variant="soft"
                                icon={<CheckCircle2 className="h-4 w-4" />}
                                body={<>Pulling pricing, configuration and freight from <strong>{CANDIDATES[0].quoteNumber}</strong></>}
                            />
                        </div>
                    </div>
                </div>
            )}

            <StepCompletionCta
                visible={showResults}
                label="Validate prices against the matched quote"
                hint="Each line compared side by side"
            />
        </div>
    );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ScoreDonut({ value, highlight }: { value: number; highlight?: boolean }) {
    const r = 18;
    const c = 2 * Math.PI * r;
    const offset = c - (value / 100) * c;
    const colorClass = value >= 90
        ? 'text-success'
        : value >= 60
        ? 'text-ai'
        : 'text-muted-foreground';

    return (
        <div className={`relative size-12 ${highlight ? colorClass : 'text-muted-foreground'}`}>
            <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
                <circle cx="24" cy="24" r={r} stroke="currentColor" strokeWidth="4" fill="none" className="text-muted/40" />
                <circle
                    cx="24"
                    cy="24"
                    r={r}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={c}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`transition-[stroke-dashoffset] duration-500 ${colorClass}`}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-bold tabular-nums text-foreground">{value}</span>
            </div>
        </div>
    );
}
