/**
 * COMPONENT: ContinuaReuseAssessment
 * PURPOSE: Continua step 1.2 · Reuse Assessment & Cataloging · SustainabilityAgent
 *          classifies floor teardown items into reuse/recycle/EOL buckets.
 *
 * USED BY: Inventory.tsx · isContinua && stepId === '1.2' branch.
 * Extracted from Inventory.tsx L1253-1352 en F42.d.2 (2026-07-27).
 */

import { CheckCircleIcon, ArrowPathIcon, CubeIcon } from '@heroicons/react/24/outline';
import { AIAgentAvatar } from '../simulations/DemoAvatars';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i: (string | undefined | null | false)[]) { return twMerge(clsx(i)); }

interface AgentLine { name: string; detail: string; visible: boolean; done: boolean; }
interface ReuseItem { category: string; condition: number; value: string; reusable: number; recyclable: number; eol: number; }

interface Props {
    reusePhase: 'processing' | 'breathing' | 'revealed' | 'results';
    reuseProgress: number;
    reuseAgents: AgentLine[];
    reuseItems: ReuseItem[];
    onCatalog: () => void;
}

export default function ContinuaReuseAssessment({ reusePhase, reuseProgress, reuseAgents, reuseItems, onCatalog }: Props) {
    return (
        <div className="space-y-4 mb-6">
            {reusePhase === 'processing' && (
                <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-3">
                        <AIAgentAvatar size="sm" />
                        <span className="text-xs font-bold text-foreground">SustainabilityAgent Assessing...</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                        <div className="h-full rounded-full bg-success transition-all duration-[3500ms] ease-linear" style={{ width: `${reuseProgress}%` }} />
                    </div>
                    <div className="space-y-1.5">
                        {reuseAgents.map(agent => (
                            <div key={agent.name} className={cn("flex items-center gap-2 text-[10px] transition-all duration-300", agent.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")}>
                                {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-success shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-success animate-spin shrink-0" />}
                                <span className={cn("font-medium", agent.done ? "text-foreground" : "text-success dark:text-success")}>{agent.name}</span>
                                <span className="text-muted-foreground">{agent.detail}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {reusePhase === 'breathing' && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success/10 animate-pulse" />
                    <span className="text-xs font-semibold text-muted-foreground">Assessment complete — cataloging items...</span>
                </div>
            )}
            {(reusePhase === 'revealed' || reusePhase === 'results') && (
                <div className="p-4 rounded-xl bg-success/10 border-2 border-success/30 dark:border-success/30 animate-in fade-in duration-300">
                    <div className="flex items-start gap-2">
                        <AIAgentAvatar size="sm" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-success"><span className="font-bold">SustainabilityAgent:</span> 340 items classified — <span className="font-semibold">180 reusable</span>, 95 recyclable, 65 EOL. Savings: <span className="font-semibold">$89,000</span> vs new procurement.</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {['Condition Scanner', 'Reuse Catalog', 'Value Engine', 'Sustainability'].map(sys => (
                                    <span key={sys} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-success/10 text-success text-[10px] font-medium border border-success/50 dark:border-success/20">
                                        <CheckCircleIcon className="h-3 w-3" />{sys}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {reusePhase === 'results' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-border/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Reuse Assessment — Floor 7 Teardown</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">340 items evaluated · 180 reusable · $89K savings</p>
                            </div>
                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-success/10 dark:bg-success/10 text-success dark:text-success font-bold">ASSESSED</span>
                        </div>
                        <div className="p-4 space-y-2">
                            {reuseItems.map(item => (
                                <div key={item.category} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                                    <div className="flex items-center gap-3">
                                        <CubeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <div>
                                            <p className="text-[11px] font-medium text-foreground">{item.category}</p>
                                            <p className="text-[10px] text-muted-foreground">Condition: {item.condition}/5 · Value: {item.value}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-success/10 dark:bg-success/10 text-success dark:text-success font-bold">{item.reusable} reuse</span>
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-info/10 dark:bg-info/10 text-info font-medium">{item.recyclable} recycle</span>
                                        {item.eol > 0 && <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{item.eol} EOL</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-4 py-3 border-t border-border/50 bg-success/10 dark:bg-success/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-muted-foreground">Savings vs new: <span className="font-bold text-success dark:text-success">$89,000</span></span>
                                    <span className="text-[10px] text-muted-foreground">Carbon offset: <span className="font-bold text-success dark:text-success">2.4 tons</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={onCatalog} className="w-full mt-4 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2">
                        <CheckCircleIcon className="h-5 w-5" />
                        Catalog Reusable Items
                    </button>
                </div>
            )}
        </div>
    );
}
