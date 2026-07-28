/**
 * COMPONENT: ContinuaLocationSync
 * PURPOSE: Continua step 1.4 · Multi-Location Sync · Warehouses + Job Sites +
 *          Route Optimization. Stateless · state y timers en Inventory.
 *
 * USED BY: Inventory.tsx · isContinua && stepId === '1.4' branch.
 * Extracted from Inventory.tsx L1072-1227 en F42.d.2 (2026-07-27).
 */

import { CheckCircleIcon, ArrowPathIcon, MapPinIcon, TruckIcon } from '@heroicons/react/24/outline';
import { AIAgentAvatar } from '../simulations/DemoAvatars';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i: (string | undefined | null | false)[]) { return twMerge(clsx(i)); }

interface AgentLine { name: string; detail: string; visible: boolean; done: boolean; }
interface LocationStatus {
    name: string;
    type: string;
    items: number;
    utilization?: number;
    inTransit?: number;
    pendingQC?: number;
    allocated?: number;
    receiving?: boolean;
    status: string;
}

interface Props {
    syncPhase: 'processing' | 'breathing' | 'revealed' | 'results';
    syncProgress: number;
    syncAgents: AgentLine[];
    locationStatus: LocationStatus[];
    syncCardsAnimated: boolean;
}

export default function ContinuaLocationSync({ syncPhase, syncProgress, syncAgents, locationStatus, syncCardsAnimated }: Props) {
    return (
        <div data-demo-target="multi-location-sync" className="space-y-4 mb-6">
            {syncPhase === 'processing' && (
                <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-3">
                        <AIAgentAvatar size="sm" />
                        <span className="text-xs font-bold text-foreground">LocationSyncAgent Synchronizing...</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                        <div className="h-full rounded-full bg-info/10 transition-all duration-[3500ms] ease-linear" style={{ width: `${syncProgress}%` }} />
                    </div>
                    <div className="space-y-1.5">
                        {syncAgents.map(agent => (
                            <div key={agent.name} className={cn("flex items-center gap-2 text-[10px] transition-all duration-300", agent.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")}>
                                {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-success shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-info animate-spin shrink-0" />}
                                <span className={cn("font-medium", agent.done ? "text-foreground" : "text-info")}>{agent.name}</span>
                                <span className="text-muted-foreground">{agent.detail}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {syncPhase === 'breathing' && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success/10 animate-pulse" />
                    <span className="text-xs font-semibold text-muted-foreground">Processing complete — syncing external systems...</span>
                </div>
            )}
            {(syncPhase === 'revealed' || syncPhase === 'results') && (
                <div className="p-4 rounded-xl bg-success/10 border-2 border-success/30 dark:border-success/30 animate-in fade-in duration-300">
                    <div className="flex items-start gap-2">
                        <AIAgentAvatar size="sm" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-success"><span className="font-bold">LocationSyncAgent:</span> All locations synced — <span className="font-semibold">45 in-transit</span>, 12 pending QC, 8 allocated. Route optimization: <span className="font-semibold">$1,800 freight savings</span>.</p>
                            <div className="flex items-center gap-2 mt-2"><span className="text-[9px] font-bold text-success uppercase tracking-wider">External Systems · Synced</span></div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                {['WMS', 'GPS Tracker', 'QC System', 'Route Engine', 'Map Service'].map(sys => (
                                    <span key={sys} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-success/10 text-success text-[10px] font-medium border border-success/50 dark:border-success/20">
                                        <CheckCircleIcon className="h-3 w-3" />{sys}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {syncPhase === 'results' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-border/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Location Sync Status</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">5 locations · 2,580 total items · Real-time tracking</p>
                            </div>
                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-success/10 text-success font-bold">All Synced</span>
                        </div>
                        <div className="p-4 space-y-2">
                            {locationStatus.map(loc => {
                                const animatedStatus = syncCardsAnimated ? (
                                    loc.inTransit ? 'Delivered' :
                                    loc.pendingQC ? 'QC Cleared' :
                                    loc.allocated ? 'Shipped' :
                                    loc.receiving ? 'Received' :
                                    null
                                ) : null;
                                return (
                                <div key={loc.name} className={cn("flex items-center justify-between p-3 rounded-xl border transition-all duration-500",
                                    syncCardsAnimated && animatedStatus ? "border-success/30 dark:border-success/30 bg-success/30 dark:bg-success/5" :
                                    loc.type === 'Job Site' ? "border-info/30 dark:border-info/20 bg-info/30 dark:bg-info/5" : "border-border bg-muted/20"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <MapPinIcon className={cn("h-4 w-4 shrink-0 transition-colors duration-500",
                                            syncCardsAnimated && animatedStatus ? "text-success" :
                                            loc.type === 'Job Site' ? "text-info" : "text-muted-foreground"
                                        )} />
                                        <div>
                                            <p className="text-[11px] font-medium text-foreground">{loc.name}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {syncCardsAnimated && loc.inTransit ? <>{loc.items + loc.inTransit} items · <span className="text-success font-semibold">{loc.inTransit} delivered</span></> :
                                                 syncCardsAnimated && loc.pendingQC ? <>{loc.items} items · <span className="text-success font-semibold">{loc.pendingQC} QC cleared</span></> :
                                                 syncCardsAnimated && loc.allocated ? <>{loc.items} items · <span className="text-success font-semibold">{loc.allocated} shipped</span></> :
                                                 syncCardsAnimated && loc.receiving ? <>{loc.items} items · <span className="text-success font-semibold">Delivery received</span></> :
                                                 <>{loc.items} items
                                                {loc.inTransit ? ` · ${loc.inTransit} in-transit` : ''}
                                                {loc.pendingQC ? ` · ${loc.pendingQC} pending QC` : ''}
                                                {loc.allocated ? ` · ${loc.allocated} allocated` : ''}
                                                {loc.receiving ? ' · Receiving active' : ''}</>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {loc.utilization && (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                                    <div className={cn("h-full rounded-full", loc.utilization > 60 ? "bg-warning/10" : "bg-success/10")} style={{ width: `${loc.utilization}%` }} />
                                                </div>
                                                <span className="text-[10px] font-medium text-foreground">{loc.utilization}%</span>
                                            </div>
                                        )}
                                        {animatedStatus ? (
                                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-success/10 text-success animate-in fade-in zoom-in-95 duration-500 flex items-center gap-1">
                                                <CheckCircleIcon className="h-3 w-3" />{animatedStatus}
                                            </span>
                                        ) : (
                                            <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold",
                                                loc.status === 'Active' ? "bg-success/10 text-success" :
                                                loc.status === 'Receiving' ? "bg-info/10 dark:bg-info/10 text-info" :
                                                "bg-muted text-muted-foreground"
                                            )}>{loc.status}</span>
                                        )}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                        <div className="mx-4 mb-4 p-3 rounded-xl bg-success/10 border border-success/30 dark:border-success/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TruckIcon className="h-4 w-4 text-success" />
                                    <div>
                                        <p className="text-[11px] font-bold text-success">Route Optimization Applied</p>
                                        <p className="text-[10px] text-success">2 deliveries consolidated to UAL HQ — same-day schedule</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-success">-$1,800</span>
                            </div>
                        </div>
                        <div className="px-4 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between">
                            <p className="text-[10px] text-muted-foreground">All 5 locations synchronized · Transit and QC status updated in real-time</p>
                            <span className="text-[10px] px-3 py-1.5 rounded-lg bg-muted text-muted-foreground font-medium">Auto-advancing...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
