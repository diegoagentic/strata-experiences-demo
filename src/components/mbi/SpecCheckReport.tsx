/**
 * COMPONENT: SpecCheckReport
 * PURPOSE: AI Spec Check Engine output — scans CET BOM for finish
 *          inconsistencies, quantity outliers, missing options, and
 *          non-catalog items. Q10 #1 team priority at 9.08/10.
 *
 *          Used in BOTH Quotes AI (pre-handoff validation) and Design AI
 *          (in-CET spec check via Teams bot). Same component, same data shape.
 *
 * PROPS:
 *   - reportId?: string   — defaults to 'SC-002' (Enterprise HQ hero)
 *
 * STATES: static (shows mock report with 3 flags)
 *
 * DS TOKENS: bg-card · red/amber/info by severity · ai accent for AI label
 *
 * USED BY: MBIQuotesPage, MBIDesignPage
 */

import { Sparkles, AlertTriangle, AlertCircle, Info, Scan, CheckCircle2, UserCheck } from 'lucide-react'
import { StatusBadge } from '../shared'
import { MBI_SPEC_CHECKS } from '../../config/profiles/mbi-data'
import type { SpecCheckDecisions } from './AISpecCheckSimulation'

interface SpecCheckReportProps {
    reportId?: string
    decisions?: SpecCheckDecisions
}

const FLAG_TYPE_META = {
    finish: { label: 'Finish', icon: '🎨' },
    quantity: { label: 'Quantity', icon: '#' },
    option: { label: 'Option', icon: '⚙' },
    'non-catalog': { label: 'Non-catalog', icon: '📋' },
}

export default function SpecCheckReport({ reportId = 'SC-002', decisions }: SpecCheckReportProps) {
    const report = MBI_SPEC_CHECKS.find(r => r.id === reportId) ?? MBI_SPEC_CHECKS[1]

    const resolvedTypes = decisions ? new Set<string>(['quantity', 'finish']) : new Set<string>()

    const criticalCount = Math.max(0, report.flags.filter(f => f.severity === 'critical').length - (resolvedTypes.has('quantity') ? 1 : 0))
    const warningCount = Math.max(0, report.flags.filter(f => f.severity === 'warning').length - (resolvedTypes.has('finish') ? 1 : 0))
    const allResolved = decisions !== undefined && criticalCount === 0 && warningCount === 0

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-ai/10 text-ai flex items-center justify-center">
                        <Scan className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">AI Spec Check · {report.projectId}</div>
                        <div className="text-[10px] text-muted-foreground">
                            Q10 priority #1 (9.08/10) · {report.lineItemsScanned} line items scanned in &lt; 5 min
                        </div>
                    </div>
                </div>
                <StatusBadge
                    label={allResolved ? 'Reviewed' : report.status === 'clean' ? 'Clean' : 'Needs review'}
                    tone={allResolved ? 'success' : report.status === 'clean' ? 'success' : 'warning'}
                    size="sm"
                />
            </div>

            {/* Summary counts */}
            <div className="px-4 py-3 border-b border-border grid grid-cols-3 gap-2">
                <SummaryCell label="Scanned" value={report.lineItemsScanned} className="text-foreground" />
                <SummaryCell label="Critical" value={criticalCount} className="text-red-600 dark:text-red-400" />
                <SummaryCell label="Warnings" value={warningCount} className="text-amber-600 dark:text-amber-400" />
            </div>

            {/* Flags list */}
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
                {report.flags.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                        No flags — all line items passed spec check.
                    </div>
                ) : (
                    report.flags.map((flag, i) => {
                        const resolution: 'ai' | 'expert' | null = (() => {
                            if (!decisions) return null
                            if (flag.type === 'quantity') return 'ai'
                            if (flag.type === 'finish') return 'expert'
                            return null
                        })()

                        const theme = (() => {
                            if (resolution) return {
                                icon: <CheckCircle2 className="h-4 w-4 text-success" />,
                                pill: 'bg-success/10 text-success',
                                bg: 'bg-success/5 dark:bg-success/10',
                            }
                            if (flag.severity === 'critical') return {
                                icon: <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
                                pill: 'bg-red-500/10 text-red-700 dark:text-red-400',
                                bg: 'bg-red-50/40 dark:bg-red-500/5',
                            }
                            if (flag.severity === 'warning') return {
                                icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
                                pill: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
                                bg: 'bg-amber-50/30 dark:bg-amber-500/5',
                            }
                            return {
                                icon: <Info className="h-4 w-4 text-info" />,
                                pill: 'bg-info/10 text-info',
                                bg: '',
                            }
                        })()
                        const typeMeta = FLAG_TYPE_META[flag.type]
                        return (
                            <div key={i} className={`px-4 py-2.5 flex items-start gap-3 ${theme.bg}`}>
                                <div className="shrink-0 mt-0.5">{theme.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${theme.pill}`}>
                                            {typeMeta.label}
                                        </span>
                                        {flag.lineRef && (
                                            <span className="text-[9px] font-mono text-muted-foreground">{flag.lineRef}</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-foreground">{flag.description}</div>
                                </div>
                                <div className="shrink-0">
                                    {resolution === 'ai' && (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-success/10 text-success uppercase tracking-wider">
                                            <Sparkles className="h-2.5 w-2.5" />
                                            Resolved by AI
                                        </span>
                                    )}
                                    {resolution === 'expert' && (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-success/10 text-success uppercase tracking-wider">
                                            <UserCheck className="h-2.5 w-2.5" />
                                            Resolved by expert
                                        </span>
                                    )}
                                    {!resolution && (
                                        <div className="flex items-center gap-1 text-[10px] text-ai font-bold">
                                            <Sparkles className="h-3 w-3" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

        </div>
    )
}

function SummaryCell({ label, value, className }: { label: string; value: number; className: string }) {
    return (
        <div className="text-center">
            <div className={`text-lg font-bold tabular-nums ${className}`}>{value}</div>
            <div className="text-[10px] text-muted-foreground">{label}</div>
        </div>
    )
}
