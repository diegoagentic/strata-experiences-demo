/**
 * COMPONENT: QuoteIncomingBudget
 * PURPOSE: Flow 3 · Scene 0 — The approved Enterprise Holdings budget from
 *          Flow 1 lands in the PC team's queue. This is the narrative bridge
 *          that shows downstream continuity: Amanda's output = Marcia's input.
 *
 *          Hero = budget handoff card with Amanda→PC context + the Quote
 *          Readiness Gate (all 4 checks ✓ so PC can actually pick it up).
 *
 * DS TOKENS: bg-card · success/primary accents
 *
 * USED BY: MBIQuotesPage (wizard scene 0)
 */

import {
    FileSignature, ArrowRight, Clock, DollarSign,
    Building2, Layers, ShieldCheck,
} from 'lucide-react'
import QuoteReadinessGate from './QuoteReadinessGate'
import DataSourcesBar, { SOURCES } from './DataSourcesBar'

const PC_QUEUE = [
    { id: 'BDG-2026-001', client: 'Mosaic Creative', project: 'Studio Renovation · Floor 3', amount: '$84.2K', status: 'done', statusLabel: 'Proposal sent' },
    { id: 'BDG-2026-002', client: 'Enterprise Holdings', project: 'New HQ Floor 12', amount: '$372.5K', status: 'active', statusLabel: 'In progress' },
    { id: 'BDG-2026-003', client: 'Gateway Financial', project: 'Executive Suite Refresh', amount: '$127.0K', status: 'queued', statusLabel: 'Queued' },
    { id: 'BDG-2026-004', client: 'Nexus Health', project: 'Lobby + Reception', amount: '$58.8K', status: 'queued', statusLabel: 'Queued' },
]

export default function QuoteIncomingBudget() {
    return (
        <div className="space-y-4">
            {/* PC morning queue — list first, then drill into the active project */}
            <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-foreground">PC quote queue · 4 projects</div>
                        <div className="text-[10px] text-muted-foreground">Signed budgets ready for CORE proposal conversion</div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-zinc-900 dark:text-primary uppercase tracking-wider">Marcia's view</span>
                </div>
                <div className="divide-y divide-border">
                    {PC_QUEUE.map(item => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-3 px-4 py-2.5 text-xs ${item.status === 'active' ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                        >
                            <div className="min-w-0 flex-1">
                                <div className={`font-bold truncate ${item.status === 'active' ? 'text-foreground' : 'text-muted-foreground'}`}>{item.client}</div>
                                <div className="text-[10px] text-muted-foreground truncate">{item.project} · {item.id}</div>
                            </div>
                            <div className={`tabular-nums font-bold shrink-0 ${item.status === 'active' ? 'text-foreground' : 'text-muted-foreground'}`}>{item.amount}</div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                item.status === 'active' ? 'bg-primary/15 text-zinc-900 dark:text-primary' :
                                item.status === 'done' ? 'bg-success/15 text-success' :
                                'bg-muted text-muted-foreground'
                            }`}>{item.statusLabel}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Handoff card — continuity with Flow 1 output */}
            <div className="bg-gradient-to-br from-success/5 to-primary/5 dark:from-success/10 dark:to-primary/10 border border-success/30 rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0">
                        <FileSignature className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-success uppercase tracking-wider">
                            Signed by client · ready for PC conversion
                        </div>
                        <div className="text-base font-bold text-foreground mt-0.5">
                            Enterprise Holdings · New HQ Floor 12
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            Budget BDG-2026-002 · approved by Amanda Renshaw · signed by client last week
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <HandoffStat icon={<DollarSign className="h-4 w-4" />} value="$372.5K" sub="mid-range scenario · 35% markup" />
                    <HandoffStat icon={<Layers className="h-4 w-4" />} value="7" sub="line items from SIF" />
                    <HandoffStat icon={<ShieldCheck className="h-4 w-4" />} value="$18.5K" sub="prevented by validation" accent="text-success" />
                    <HandoffStat icon={<Clock className="h-4 w-4" />} value="4 min" sub="Amanda → signed delivery" />
                </div>
            </div>

            {/* Before / After contrast strip */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50/60 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 rounded-xl p-3 flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0">
                        <Building2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-xs min-w-0">
                        <div className="font-bold text-foreground">Before · ~2h per proposal</div>
                        <div className="text-muted-foreground mt-0.5 leading-relaxed">
                            PC manually keyed 24 SIF fields into CORE, entered GP per vendor by hand, ran 4 sequential audit loops, validated specs manually, line by line.
                        </div>
                    </div>
                </div>
                <div className="bg-success/10 dark:bg-success/15 border border-success/30 rounded-xl p-3 flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-success/15 text-success flex items-center justify-center shrink-0">
                        <Layers className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-xs min-w-0">
                        <div className="font-bold text-foreground">Now · ~12 min total</div>
                        <div className="text-muted-foreground mt-0.5 leading-relaxed">
                            AI reads the SIF in seconds. PC reviews GP once, confirms. CORE Quote created automatically. Audit loops collapse to 1 AI pass.
                        </div>
                    </div>
                </div>
            </div>

            {/* Readiness gate — existing component, all checks pass */}
            <QuoteReadinessGate />

            {/* Forward cue */}
            <div className="flex items-center gap-3 text-xs bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3">
                <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0" />
                <span className="flex-1 text-foreground">
                    All 4 readiness checks passed. Next: Strata validates the quote — non-catalog pricing, BOM completeness, duplicates — 4 audit loops collapse to 1 review.
                </span>
            </div>

            <DataSourcesBar groups={[
                { sources: [SOURCES.CRM] },
                { sources: [SOURCES.SIF_FILE] },
                { sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] },
            ]} />
        </div>
    )
}

function HandoffStat({
    icon,
    value,
    sub,
    accent = 'text-foreground',
}: {
    icon: React.ReactNode
    value: string
    sub: string
    accent?: string
}) {
    return (
        <div className="bg-muted/60 dark:bg-zinc-900/40 border border-border rounded-xl p-3">
            <div className={`flex items-center gap-1.5 ${accent}`}>
                {icon}
                <span className="text-lg font-bold tabular-nums leading-none">{value}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1.5">{sub}</div>
        </div>
    )
}
