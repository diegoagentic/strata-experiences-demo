/**
 * COMPONENT: OrderExecutionPanel
 * PURPOSE: Phase 4.C output — EDI transmission preview for the 5 EDI-enabled
 *          MBI manufacturers (HNI, Allsteel, Gunlocke, HON, Kimball) plus
 *          non-EDI PO email generation.
 *
 * PROPS: none — uses MBI_MANUFACTURERS
 *
 * STATES: static
 *
 * DS TOKENS: bg-card · success/info/primary
 *
 * USED BY: MBIQuotesPage (Phase 4.C)
 */

import { Zap, Mail, Send, CheckCircle2 } from 'lucide-react'
import { MBI_MANUFACTURERS } from '../../config/profiles/mbi-data'

export default function OrderExecutionPanel() {
    const ediMfrs = MBI_MANUFACTURERS.filter(m => m.isEDI)
    const nonEDIMfrs = MBI_MANUFACTURERS.filter(m => !m.isEDI)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* EDI Transmission */}
            <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-info/10 text-info flex items-center justify-center">
                        <Zap className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">EDI transmission</div>
                        <div className="text-[10px] text-muted-foreground">
                            {ediMfrs.length} EDI-enabled mfrs · POs auto-routed
                        </div>
                    </div>
                </div>
                <div className="divide-y divide-border">
                    {ediMfrs.map(m => (
                        <div key={m.id} className="px-4 py-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <Zap className="h-3 w-3 text-info" />
                                <span className="font-semibold text-foreground">{m.name}</span>
                            </div>
                            <span className="text-[10px] font-bold text-success uppercase tracking-wider inline-flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Routed
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Non-EDI Email PO */}
            <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                        <Mail className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Non-EDI PO agent</div>
                        <div className="text-[10px] text-muted-foreground">
                            {nonEDIMfrs.length} non-EDI mfrs · Strata generates + emails PO docs
                        </div>
                    </div>
                </div>
                <div className="divide-y divide-border">
                    {nonEDIMfrs.map(m => (
                        <div key={m.id} className="px-4 py-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                <span className="font-semibold text-foreground">{m.name}</span>
                            </div>
                            <button className="text-[10px] font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded hover:opacity-90 transition-opacity inline-flex items-center gap-1">
                                <Send className="h-2.5 w-2.5" />
                                Generate
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
