/**
 * COMPONENT: ContinuaHealthAnalysis
 * PURPOSE: Continua step 1.1 · Inventory Health Analysis · Warehouse Capacity
 *          + AI Relocation Recommendations. Scene stateless que recibe
 *          phase + data + handlers como props. State machine local (hlthPhase)
 *          y timers viven en el parent (Inventory.tsx) por ahora · F42.d
 *          incremental · extraer solo el JSX del scene.
 *
 * PROPS:
 *   - hlthPhase: 'processing' | 'breathing' | 'revealed' | 'results' (el
 *     'notification' phase ya migró al ActionCenter · F42.a).
 *   - hlthProgress: number (0-100) · progress bar de InventoryIntelAgent.
 *   - hlthAgents: {name, detail, visible, done}[] · cascade de agent lines.
 *   - warehouses: WarehouseDatum[] · para el gauge grid.
 *   - relocationRecs: {items,type,from,to,savings}[] · para la lista.
 *   - onApplyRecommendations: () => void · CTA "Apply Recommendations".
 *
 * USED BY: Inventory.tsx · isContinua && stepId === '1.1' branch.
 *
 * Extracted from Inventory.tsx L1165-1288 en F42.d.1 (2026-07-27).
 */

import { CheckCircleIcon, ExclamationTriangleIcon, LightBulbIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { AIAgentAvatar } from '../simulations/DemoAvatars';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface AgentLine {
    name: string;
    detail: string;
    visible: boolean;
    done: boolean;
}

interface WarehouseDatum {
    name: string;
    items: number;
    current: number;
    forecast: number;
    alert: boolean;
    alertText: string;
}

interface RelocationRec {
    items: number;
    type: string;
    from: string;
    to: string;
    savings: string;
}

interface Props {
    hlthPhase: 'processing' | 'breathing' | 'revealed' | 'results';
    hlthProgress: number;
    hlthAgents: AgentLine[];
    warehouses: WarehouseDatum[];
    relocationRecs: RelocationRec[];
    onApplyRecommendations: () => void;
}

export default function ContinuaHealthAnalysis({
    hlthPhase,
    hlthProgress,
    hlthAgents,
    warehouses,
    relocationRecs,
    onApplyRecommendations,
}: Props) {
    return (
        <div data-demo-target="inventory-health-forecast" className="space-y-4 mb-6">
            {/* F42.a · Notification "Inventory Health Analysis" migrado al ActionCenter
                (CONTINUA_STEP_NOTIFICATIONS · continua-1.1-inventory-health).
                El listener de continua:advance-phase en Inventory.tsx avanza a
                processing al click Review analysis. */}

            {/* Processing */}
            {hlthPhase === 'processing' && (
                <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-3">
                        <AIAgentAvatar size="sm" />
                        <span className="text-xs font-bold text-foreground">InventoryIntelAgent Analyzing Warehouses...</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                        <div className="h-full rounded-full bg-primary transition-all duration-[3500ms] ease-linear" style={{ width: `${hlthProgress}%` }} />
                    </div>
                    <div className="space-y-1.5">
                        {hlthAgents.map(agent => (
                            <div key={agent.name} className={cn("flex items-center gap-2 text-[10px] transition-all duration-300", agent.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")}>
                                {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-success shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-ai animate-spin shrink-0" />}
                                <span className={cn("font-medium", agent.done ? "text-foreground" : "text-ai")}>{agent.name}</span>
                                <span className="text-muted-foreground">{agent.detail}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Breathing */}
            {hlthPhase === 'breathing' && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success/10 animate-pulse" />
                    <span className="text-xs font-semibold text-muted-foreground">Processing complete — syncing external systems...</span>
                </div>
            )}

            {/* Confirmed */}
            {(hlthPhase === 'revealed' || hlthPhase === 'results') && (
                <div className="p-4 rounded-xl bg-success/10 border-2 border-success/30 dark:border-success/30 animate-in fade-in duration-300">
                    <div className="flex items-start gap-2">
                        <AIAgentAvatar size="sm" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-success"><span className="font-bold">InventoryIntelAgent:</span> Analysis complete — <span className="font-semibold">Chicago at 68%</span>, forecast 85% in 2 weeks. 120 items recommended for relocation — <span className="font-semibold">$4,200/mo savings</span>.</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[9px] font-bold text-success uppercase tracking-wider">External Systems · Synced</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                {['WMS', 'Capacity Planner', 'Cost Engine', 'Logistics API', 'Forecast Model'].map(sys => (
                                    <span key={sys} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-success/10 text-success text-[10px] font-medium border border-success/50 dark:border-success/20">
                                        <CheckCircleIcon className="h-3 w-3" />{sys}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {hlthPhase === 'results' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        {/* Header */}
                        <div className="p-4 border-b border-border/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Warehouse Capacity Overview</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">2,400 items · 3 locations · Forecast: 2-week horizon</p>
                            </div>
                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-warning/10 text-warning font-bold">1 Alert</span>
                        </div>

                        {/* Warehouse Gauges */}
                        <div className="p-4 grid grid-cols-3 gap-3">
                            {warehouses.map(wh => (
                                <div key={wh.name} className={cn("p-3 rounded-xl border", wh.alert ? "border-warning/30 dark:border-warning/20 bg-warning/50 dark:bg-warning/5" : "border-border bg-muted/20")}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold text-foreground">{wh.name}</span>
                                        <span className="text-[10px] text-muted-foreground">{wh.items} items</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden mb-1.5">
                                        <div className={cn("h-full rounded-full transition-all duration-700", wh.current > 70 ? "bg-warning/10" : wh.current > 50 ? "bg-primary" : "bg-success/10")} style={{ width: `${wh.current}%` }} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={cn("text-xs font-bold", wh.current > 70 ? "text-warning" : "text-foreground")}>{wh.current}%</span>
                                        {wh.alert && <span className="text-[9px] text-warning font-medium">→ {wh.forecast}% in 2wk</span>}
                                    </div>
                                    {wh.alert && <p className="text-[10px] text-warning mt-1.5 flex items-center gap-1"><ExclamationTriangleIcon className="h-3 w-3 shrink-0" />{wh.alertText}</p>}
                                </div>
                            ))}
                        </div>

                        {/* Relocation Recommendations */}
                        <div className="mx-4 mb-4 p-4 rounded-xl bg-ai/10 dark:bg-ai/5 border border-ai/30 dark:border-ai/20">
                            <h4 className="text-xs font-bold text-ai mb-3 flex items-center gap-1.5"><LightBulbIcon className="h-4 w-4" />AI Relocation Recommendations</h4>
                            <div className="space-y-2">
                                {relocationRecs.map((rec, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-ai/30 dark:border-ai/10">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-medium text-foreground">{rec.items} items · {rec.type}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">{rec.from} → {rec.to}</p>
                                        </div>
                                        <span className="text-[10px] px-2 py-1 rounded-full bg-success/10 text-success font-bold shrink-0 ml-2">{rec.savings}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 flex items-center justify-between p-2.5 rounded-lg bg-success/10 border border-success/30 dark:border-success/20">
                                <span className="text-[11px] font-bold text-success">Total Monthly Savings</span>
                                <span className="text-sm font-bold text-success">$4,200/mo</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between bg-muted/20">
                            <p className="text-[10px] text-muted-foreground">Relocating 120 items optimizes capacity and reduces storage costs.</p>
                            <button onClick={onApplyRecommendations} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm text-[11px] font-bold shadow-sm transition-all hover:scale-[1.02]">
                                <CheckCircleIcon className="h-3.5 w-3.5" />Apply Recommendations<ArrowRightIcon className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
