/**
 * COMPONENT: LiveBudgetProgressBar
 * PURPOSE: Real-time budget tracker for designers — shows allocated vs. spent
 *          per active project. Replaces today's post-hoc surprise where designers
 *          discover overruns only after handoff.
 *
 *          Pulled from MBI_DESIGN_PROJECTS budgetTracked field.
 *
 * PROPS: none
 *
 * STATES: static (per-project bars)
 *
 * DS TOKENS: bg-card · primary/success/amber by utilization
 *
 * USED BY: MBIDesignPage (Phase 5.B)
 */

import { Wallet, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { MBI_DESIGN_PROJECTS, getStakeholder } from '../../config/profiles/mbi-data'

export default function LiveBudgetProgressBar() {
    const tracked = MBI_DESIGN_PROJECTS.filter(p => p.budgetTracked)

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                    <Wallet className="h-3.5 w-3.5" />
                </div>
                <div>
                    <div className="text-xs font-bold text-foreground">Live budget tracker</div>
                    <div className="text-[10px] text-muted-foreground">
                        Allocated vs spent · per active design project · no more post-hoc surprises
                    </div>
                </div>
            </div>

            <div className="divide-y divide-border">
                {tracked.map(project => {
                    if (!project.budgetTracked) return null
                    const designer = getStakeholder(project.designerId)
                    const pct = Math.round((project.budgetTracked.spent / project.budgetTracked.allocated) * 100)
                    const remaining = project.budgetTracked.allocated - project.budgetTracked.spent
                    const overBudget = pct > 100
                    const tight = pct > 95

                    const barColor = overBudget ? 'bg-red-500' : tight ? 'bg-amber-500' : pct > 80 ? 'bg-primary' : 'bg-success'
                    const statusIcon = overBudget ? <AlertTriangle className="h-3 w-3 text-red-600" /> :
                        tight ? <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" /> :
                            <CheckCircle2 className="h-3 w-3 text-success" />

                    return (
                        <div key={project.id} className="px-4 py-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="min-w-0">
                                    <div className="text-xs font-bold text-foreground truncate">{project.name}</div>
                                    <div className="text-[10px] text-muted-foreground truncate">
                                        {project.client} · {designer?.name ?? 'Unassigned'}
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="flex items-center gap-1.5">
                                        {statusIcon}
                                        <span className="text-sm font-bold text-foreground tabular-nums">{pct}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${barColor} transition-all`}
                                    style={{ width: `${Math.min(100, pct)}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1 tabular-nums">
                                <span>
                                    Spent: <span className="font-bold text-foreground">${project.budgetTracked.spent.toLocaleString()}</span>
                                </span>
                                <span>
                                    Remaining: <span className={`font-bold ${remaining < 0 ? 'text-red-600' : 'text-foreground'}`}>
                                        ${Math.abs(remaining).toLocaleString()}{remaining < 0 ? ' over' : ''}
                                    </span>
                                </span>
                                <span>
                                    Total: <span className="font-bold text-foreground">${project.budgetTracked.allocated.toLocaleString()}</span>
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="px-4 py-2 bg-muted/20 border-t border-border flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-success" />
                Updates in real time as design changes propagate to budget engine
            </div>
        </div>
    )
}
