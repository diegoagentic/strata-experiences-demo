import { CheckCircle2, Circle, Loader2, XCircle, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export interface AgentStep {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'done' | 'error';
    detail?: string;
}

interface AgentPipelineStripProps {
    agents: AgentStep[];
    accentColor?: 'purple' | 'blue' | 'green' | 'amber' | 'red';
}

const colorMap = {
    purple: {
        running: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5',
        glow: 'shadow-indigo-500/20',
    },
    blue: {
        running: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
        glow: 'shadow-blue-500/20',
    },
    green: {
        running: 'text-green-400 border-green-500/30 bg-green-500/5',
        glow: 'shadow-green-500/20',
    },
    amber: {
        running: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
        glow: 'shadow-amber-500/20',
    },
    red: {
        running: 'text-red-400 border-red-500/30 bg-red-500/5',
        glow: 'shadow-red-500/20',
    },
};

function StatusIcon({ status, accent }: { status: AgentStep['status']; accent: string }) {
    switch (status) {
        case 'done':
            return <CheckCircle2 size={14} className="text-green-500 shrink-0" />;
        case 'running':
            return <Loader2 size={14} className={clsx('animate-spin shrink-0', colorMap[accent as keyof typeof colorMap]?.running?.split(' ')[0] || 'text-blue-400')} />;
        case 'error':
            return <XCircle size={14} className="text-red-500 shrink-0" />;
        default:
            return <Circle size={14} className="text-muted-foreground/30 shrink-0" />;
    }
}

// Convert PascalCase/camelCase to spaced words (e.g. "EmailIntake" → "Email Intake")
// Preserves uppercase acronyms (e.g. "ACKIngestion" → "ACK Ingestion", "POvsACK" → "PO vs ACK")
function spaceName(name: string): string {
    return name
        .replace(/([a-z])([A-Z])/g, '$1 $2')         // camelCase boundary
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')   // ACRONYMWord boundary
        .replace(/\//g, ' / ');                        // "OCR/Parser" → "OCR / Parser"
}

export default function AgentPipelineStrip({ agents, accentColor = 'blue' }: AgentPipelineStripProps) {
    const colors = colorMap[accentColor];

    return (
        <div className="flex items-center gap-1.5 overflow-x-auto p-2.5 rounded-xl border border-border/30 bg-muted/20 scrollbar-micro">
            {agents.map((agent, i) => (
                <div key={agent.id} className="flex items-center gap-1.5">
                    <div className={clsx(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border min-w-fit transition-all duration-300',
                        agent.status === 'running' && clsx(colors.running, 'shadow-sm', colors.glow),
                        agent.status === 'done' && 'border-green-500/30 bg-green-500/5',
                        agent.status === 'error' && 'border-red-500/30 bg-red-500/5',
                        agent.status === 'pending' && 'border-border/20 bg-card',
                    )}>
                        <StatusIcon status={agent.status} accent={accentColor} />
                        <div className="flex flex-col">
                            <span className={clsx(
                                'text-[10px] font-medium uppercase tracking-wider leading-tight',
                                agent.status === 'done' && 'text-green-500',
                                agent.status === 'running' && colorMap[accentColor].running.split(' ')[0],
                                agent.status === 'error' && 'text-red-500',
                                agent.status === 'pending' && 'text-muted-foreground/50',
                            )}>
                                {spaceName(agent.name)}
                            </span>
                            {agent.detail && (
                                <span className="text-[8px] text-muted-foreground leading-tight">{agent.detail}</span>
                            )}
                        </div>
                    </div>
                    {i < agents.length - 1 && (
                        <ChevronRight size={12} className="text-muted-foreground/30 shrink-0" />
                    )}
                </div>
            ))}
        </div>
    );
}
