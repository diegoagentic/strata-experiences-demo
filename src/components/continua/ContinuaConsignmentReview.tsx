/**
 * COMPONENT: ContinuaConsignmentReview
 * PURPOSE: Continua step 1.5 · Consignment & Vendor Returns · ConsignmentAgent
 *          analyzes 90-day window items and recommends RMA or convert-to-purchase.
 *
 * USED BY: Inventory.tsx · isContinua && stepId === '1.5' branch.
 * Extracted from Inventory.tsx L1355-1446 en F42.d.2 (2026-07-27).
 */

import { CheckCircleIcon, ArrowPathIcon, CubeIcon } from '@heroicons/react/24/outline';
import { AIAgentAvatar } from '../simulations/DemoAvatars';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i: (string | undefined | null | false)[]) { return twMerge(clsx(i)); }

interface AgentLine { name: string; detail: string; visible: boolean; done: boolean; }
interface ConsignmentItem { name: string; mfr: string; daysLeft: number; value: string; action: 'RMA' | 'Convert'; }

interface Props {
    consignPhase: 'processing' | 'breathing' | 'revealed' | 'results';
    consignProgress: number;
    consignAgents: AgentLine[];
    consignmentItems: ConsignmentItem[];
    onProcess: () => void;
}

export default function ContinuaConsignmentReview({ consignPhase, consignProgress, consignAgents, consignmentItems, onProcess }: Props) {
    return (
        <div className="space-y-4 mb-6">
            {consignPhase === 'processing' && (
                <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-3">
                        <AIAgentAvatar size="sm" />
                        <span className="text-xs font-bold text-foreground">ConsignmentAgent Analyzing...</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                        <div className="h-full rounded-full bg-destructive/10 transition-all duration-[3500ms] ease-linear" style={{ width: `${consignProgress}%` }} />
                    </div>
                    <div className="space-y-1.5">
                        {consignAgents.map(agent => (
                            <div key={agent.name} className={cn("flex items-center gap-2 text-[10px] transition-all duration-300", agent.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")}>
                                {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-success shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-destructive animate-spin shrink-0" />}
                                <span className={cn("font-medium", agent.done ? "text-foreground" : "text-destructive")}>{agent.name}</span>
                                <span className="text-muted-foreground">{agent.detail}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {consignPhase === 'breathing' && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success/10 animate-pulse" />
                    <span className="text-xs font-semibold text-muted-foreground">Analysis complete — preparing decisions...</span>
                </div>
            )}
            {(consignPhase === 'revealed' || consignPhase === 'results') && (
                <div className="p-4 rounded-xl bg-success/10 border-2 border-success/30 dark:border-success/30 animate-in fade-in duration-300">
                    <div className="flex items-start gap-2">
                        <AIAgentAvatar size="sm" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-success"><span className="font-bold">ConsignmentAgent:</span> 12 items analyzed — <span className="font-semibold">4 RMA auto-generated</span> ($8,200), <span className="font-semibold">4 convert-to-purchase</span> recommended (demand +12%).</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {['Consignment DB', 'RMA System', 'Demand Forecast', 'Manufacturer Portal'].map(sys => (
                                    <span key={sys} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-success/10 text-success text-[10px] font-medium border border-success/50 dark:border-success/20">
                                        <CheckCircleIcon className="h-3 w-3" />{sys}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {consignPhase === 'results' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-border/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Consignment Decisions</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">8 items · 4 RMA returns · 4 convert-to-purchase</p>
                            </div>
                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-destructive/10 dark:bg-destructive/10 text-destructive font-bold">ACTION REQ</span>
                        </div>
                        <div className="p-4 space-y-2">
                            {consignmentItems.map(item => (
                                <div key={item.name} className={cn("flex items-center justify-between p-3 rounded-xl border", item.action === 'RMA' ? "border-destructive/30 dark:border-destructive/20 bg-destructive/30 dark:bg-destructive/5" : "border-info/30 dark:border-info/20 bg-info/30 dark:bg-info/5")}>
                                    <div className="flex items-center gap-3">
                                        <CubeIcon className={cn("h-4 w-4 shrink-0", item.action === 'RMA' ? "text-destructive" : "text-info")} />
                                        <div>
                                            <p className="text-[11px] font-medium text-foreground">{item.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{item.mfr} · {item.daysLeft} days left · {item.value}</p>
                                        </div>
                                    </div>
                                    <span className={cn("text-[9px] px-2.5 py-1 rounded-full font-bold", item.action === 'RMA' ? "bg-destructive/10 text-destructive" : "bg-info/10 dark:bg-info/10 text-info")}>{item.action === 'RMA' ? 'Return (RMA)' : 'Convert to Purchase'}</span>
                                </div>
                            ))}
                        </div>
                        <div className="px-4 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">RMA value: <span className="font-bold text-foreground">$8,200</span></span>
                            <span className="text-[10px] text-muted-foreground">Conversion savings: <span className="font-bold text-foreground">$3,400</span></span>
                        </div>
                    </div>
                    <button onClick={onProcess} className="w-full mt-4 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2">
                        <CheckCircleIcon className="h-5 w-5" />
                        Process Decisions
                    </button>
                </div>
            )}
        </div>
    );
}
