/**
 * COMPONENT: COMWorkflowTimeline
 * PURPOSE: Structured workflow for COM (Customer's Own Material) fabric approvals
 *          + special product tracking. Replaces today's completely informal
 *          process (verbal approvals, forgotten receipt confirmation).
 *
 * PROPS: none — mock inline timeline
 *
 * DS TOKENS: bg-card · border-border · primary/success/info
 *
 * USED BY: MBIQuotesPage (Phase 4.B)
 */

import { Palette, CheckCircle2, Clock, Package, MessageSquare } from 'lucide-react'
import { StatusBadge } from '../shared'

interface TimelineStep {
    id: string
    label: string
    detail: string
    timestamp: string
    status: 'done' | 'in-progress' | 'pending'
    icon: React.ReactNode
}

const STEPS: TimelineStep[] = [
    { id: '1', label: 'COM sample requested', detail: 'Designer spec · marine blue for Enterprise lounge', timestamp: 'Apr 15, 10:20 AM', status: 'done', icon: <Palette className="h-3.5 w-3.5" /> },
    { id: '2', label: 'Client approval via Teams', detail: 'Jordan Hart · approved with note "match throughout palette"', timestamp: 'Apr 15, 3:45 PM', status: 'done', icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { id: '3', label: 'PO to fabric vendor', detail: 'Pacific Fabrics · 45 yards · ETA April 28', timestamp: 'Apr 15, 4:10 PM', status: 'done', icon: <Package className="h-3.5 w-3.5" /> },
    { id: '4', label: 'Fabric receipt confirmation', detail: 'Expected April 28 · warehouse notification will auto-fire', timestamp: 'Pending · ETA Apr 28', status: 'in-progress', icon: <Clock className="h-3.5 w-3.5" /> },
    { id: '5', label: 'Route to manufacturer for application', detail: 'CaseWorks · ship to Birmingham plant', timestamp: 'Pending · after receipt', status: 'pending', icon: <Package className="h-3.5 w-3.5" /> },
]

export default function COMWorkflowTimeline() {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                        <Palette className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">COM + Special product tracker</div>
                        <div className="text-[10px] text-muted-foreground">
                            Structured workflow via Teams · replaces verbal approvals + forgotten confirmations
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <ol className="space-y-2">
                    {STEPS.map((step, i) => {
                        const theme = step.status === 'done'
                            ? { dot: 'bg-success text-white', line: 'bg-success', card: 'bg-muted/50 dark:bg-zinc-800 border-border border-l-success/60' }
                            : step.status === 'in-progress'
                                ? { dot: 'bg-ai/15 text-ai ring-4 ring-ai/20 animate-pulse', line: 'bg-border', card: 'bg-ai/5 border-ai/20 border-l-ai' }
                                : { dot: 'bg-muted text-muted-foreground', line: 'bg-border', card: 'bg-muted/50 dark:bg-zinc-800 border-border border-l-muted-foreground/30' }
                        return (
                            <li key={step.id} className="flex gap-3">
                                <div className="flex flex-col items-center shrink-0">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${theme.dot}`}>
                                        {step.status === 'done' ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
                                    </div>
                                    {i < STEPS.length - 1 && <div className={`w-0.5 flex-1 mt-1 ${theme.line}`} style={{ minHeight: 20 }} />}
                                </div>
                                <div className={`flex-1 border border-l-4 rounded-lg px-3 py-2 ${theme.card}`}>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-xs font-bold text-foreground">{step.label}</div>
                                        {step.status === 'in-progress' && (
                                            <StatusBadge label="In progress" tone="ai" size="xs" />
                                        )}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">{step.detail}</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5 italic">{step.timestamp}</div>
                                </div>
                            </li>
                        )
                    })}
                </ol>
            </div>
        </div>
    )
}
