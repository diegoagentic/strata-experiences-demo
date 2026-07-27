/**
 * COMPONENT: ContinuaReceiving
 * PURPOSE: Continua step 3.5 · Warehouse Receiving & QC · Shipment cards +
 *          QC flags auto-reported. Stateless · state y timers en Inventory.
 *
 * USED BY: Inventory.tsx · isContinua && stepId === '3.5' branch.
 * Extracted from Inventory.tsx L1041-1163 en F42.d.2 (2026-07-27).
 */

import { CheckCircleIcon, ExclamationTriangleIcon, ArrowRightIcon, ArrowPathIcon, MapPinIcon, ChartBarIcon, ClipboardDocumentCheckIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { AIAgentAvatar } from '../simulations/DemoAvatars';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i: (string | undefined | null | false)[]) { return twMerge(clsx(i)); }

interface AgentLine { name: string; detail: string; visible: boolean; done: boolean; }
interface Shipment { id: string; manufacturer: string; items: number; matched: number; defects: number; status: 'complete' | 'partial'; }
interface QCFlag { item: string; sku: string; defect: string; severity: 'Major' | 'Minor'; }

interface Props {
    rcvPhase: 'processing' | 'breathing' | 'revealed' | 'results';
    rcvProgress: number;
    rcvAgents: AgentLine[];
    shipments: Shipment[];
    qcFlags: QCFlag[];
    onConfirm: () => void;
}

export default function ContinuaReceiving({ rcvPhase, rcvProgress, rcvAgents, shipments, qcFlags, onConfirm }: Props) {
    return (
        <div className="space-y-4 mb-6">
            {rcvPhase === 'processing' && (
                <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-3">
                        <AIAgentAvatar size="sm" />
                        <span className="text-xs font-bold text-foreground">ReceivingAgent Processing Shipments...</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                        <div className="h-full rounded-full bg-primary transition-all duration-[3500ms] ease-linear" style={{ width: `${rcvProgress}%` }} />
                    </div>
                    <div className="space-y-1.5">
                        {rcvAgents.map(agent => (
                            <div key={agent.name} className={cn("flex items-center gap-2 text-[10px] transition-all duration-300", agent.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")}>
                                {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-success shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-ai animate-spin shrink-0" />}
                                <span className={cn("font-medium", agent.done ? "text-foreground" : "text-ai")}>{agent.name}</span>
                                <span className="text-muted-foreground">{agent.detail}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {rcvPhase === 'breathing' && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success/10 animate-pulse" />
                    <span className="text-xs font-semibold text-muted-foreground">Processing complete — syncing external systems...</span>
                </div>
            )}
            {(rcvPhase === 'revealed' || rcvPhase === 'results') && (
                <div className="p-4 rounded-xl bg-success/10 border-2 border-success/30 dark:border-success/30 animate-in fade-in duration-300">
                    <div className="flex items-start gap-2">
                        <AIAgentAvatar size="sm" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-success"><span className="font-bold">ReceivingAgent:</span> 3 shipments processed — <span className="font-semibold">47/50 items matched</span>. 2 QC flags raised, warranty claims auto-filed.</p>
                            <div className="flex items-center gap-2 mt-2"><span className="text-[9px] font-bold text-success uppercase tracking-wider">External Systems · Synced</span></div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                {['QR Scanner', 'PO Match Engine', 'QC Database', 'Warranty Portal', 'WMS'].map(sys => (
                                    <span key={sys} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-success/10 text-success text-[10px] font-medium border border-success/50 dark:border-success/20">
                                        <CheckCircleIcon className="h-3 w-3" />{sys}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {rcvPhase === 'results' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-border/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Receiving Summary — Chicago Warehouse</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">3 shipments processed · 47/50 matched · Utilization 72%</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] px-2.5 py-1 rounded-full bg-success/10 text-success font-bold">47 Matched</span>
                                <span className="text-[10px] px-2.5 py-1 rounded-full bg-destructive/10 text-destructive font-bold">2 QC Flags</span>
                            </div>
                        </div>
                        <div className="p-4 grid grid-cols-3 gap-3">
                            {shipments.map(s => (
                                <div key={s.id} className={cn("p-3 rounded-xl border", s.defects > 0 ? "border-warning/30 dark:border-warning/20 bg-warning/50 dark:bg-warning/5" : "border-border bg-muted/20")}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold text-foreground">{s.id}</span>
                                        <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold", s.status === 'complete' ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>{s.status === 'complete' ? 'Complete' : 'Partial'}</span>
                                    </div>
                                    <p className="text-[11px] font-medium text-foreground">{s.manufacturer}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">{s.matched}/{s.items} items matched</p>
                                    {s.defects > 0 && <p className="text-[10px] text-warning mt-1 flex items-center gap-1"><ExclamationTriangleIcon className="h-3 w-3" />{s.defects} defect{s.defects > 1 ? 's' : ''} flagged</p>}
                                </div>
                            ))}
                        </div>
                        <div className="mx-4 mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 dark:border-destructive/20">
                            <h4 className="text-xs font-bold text-destructive mb-2 flex items-center gap-1.5"><ExclamationTriangleIcon className="h-4 w-4" />QC Flags — Auto-Reported to Manufacturer</h4>
                            <div className="space-y-2">
                                {qcFlags.map((qc, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-destructive/30 dark:border-destructive/10">
                                        <div>
                                            <p className="text-[11px] font-medium text-foreground">{qc.item}</p>
                                            <p className="text-[10px] text-muted-foreground">{qc.sku} · {qc.defect}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold", qc.severity === 'Major' ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning")}>{qc.severity}</span>
                                            <PhotoIcon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between bg-muted/20">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><MapPinIcon className="h-3.5 w-3.5" /><span className="font-medium text-foreground">Zone B, Rack 14</span></div>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><ChartBarIcon className="h-3.5 w-3.5" />Utilization: <span className="font-medium text-foreground">72%</span></div>
                            </div>
                            <button onClick={onConfirm} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm text-[11px] font-bold shadow-sm transition-all hover:scale-[1.02]">
                                <ClipboardDocumentCheckIcon className="h-3.5 w-3.5" />Confirm Receiving<ArrowRightIcon className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
