/**
 * COMPONENT: CETConfigHelperPanel
 * PURPOSE: Chat-style AI assistant for CET configuration questions. Replaces
 *          today's Teams-channel-pinging that interrupts senior designers
 *          (Lisa, Amy) every time someone needs config help.
 *
 *          Mock conversation: junior designer asks Strata about Allsteel
 *          panel + worksurface compatibility (the same class of issue caught
 *          in the $18K Budget Builder validation).
 *
 * PROPS: none
 *
 * STATES: static conversation
 *
 * DS TOKENS: bg-card · ai accent · primary (user message)
 *
 * USED BY: MBIDesignPage (Phase 5.B)
 */

import { Bot, User, Sparkles } from 'lucide-react'

interface Message {
    role: 'user' | 'assistant'
    text: string
    timestamp: string
}

const CONVERSATION: Message[] = [
    { role: 'user', text: "I'm specifying Vertex Modular panels (60\" spine) for Enterprise. Will a 72×36 worksurface fit?", timestamp: '10:14 AM' },
    {
        role: 'assistant',
        text: "Heads up — 72×36 won't fit Vertex Modular 60\" spine. Recommended swaps:\n\n1. **Vertex Profile 72×36** — designed for the same panel system, $1,485/ea\n2. Reduce to **Vertex Modular 60×30** — fits the spine, $1,180/ea\n\nContext: 20 of these mismatched once cost MBI ~$18K to retrofit. Tagging this in the spec check report so PC catches it if it slips.",
        timestamp: '10:14 AM',
    },
    { role: 'user', text: 'Use option 1 for 20 units — keep the bigger surface.', timestamp: '10:15 AM' },
    {
        role: 'assistant',
        text: "Done. Updated CET config:\n\n• 20 × Vertex Profile 72×36 ($29,700)\n• Logged compatibility check in spec audit\n• Notified PC team in #handoff channel\n\nNothing else to do — you can keep working.",
        timestamp: '10:15 AM',
    },
]

export default function CETConfigHelperPanel() {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-ai/10 text-ai flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5" />
                </div>
                <div>
                    <div className="text-xs font-bold text-foreground">CET config assistant</div>
                    <div className="text-[10px] text-muted-foreground">
                        Chat-based help · stops senior designers from being interrupted
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {CONVERSATION.map((m, i) => (
                    <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${m.role === 'assistant' ? 'bg-ai/10 text-ai' : 'bg-primary/10 text-zinc-900 dark:text-primary'}`}>
                            {m.role === 'assistant' ? <Sparkles className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                        </div>
                        <div className={`flex-1 max-w-[80%] ${m.role === 'user' ? 'text-right' : ''}`}>
                            <div className={`inline-block text-left px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                                m.role === 'assistant'
                                    ? 'bg-ai/5 border border-ai/10 text-foreground'
                                    : 'bg-primary/10 border border-primary/20 text-foreground'
                            }`}>
                                {m.text.split('\n').map((line, idx) => {
                                    // Bold support for **text**
                                    const parts = line.split(/\*\*(.+?)\*\*/g)
                                    return (
                                        <div key={idx}>
                                            {parts.map((part, j) =>
                                                j % 2 === 0 ? part : <strong key={j} className="font-bold text-foreground">{part}</strong>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="text-[9px] text-muted-foreground mt-0.5 px-1">{m.timestamp}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="px-4 py-2 border-t border-border bg-muted/10">
                <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
                    <input
                        type="text"
                        placeholder="Ask about CET config, swaps, compatibility..."
                        className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <button className="h-6 w-6 rounded-md bg-ai/10 text-ai flex items-center justify-center hover:bg-ai/20 transition-colors">
                        <Sparkles className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    )
}
