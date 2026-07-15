/**
 * COMPONENT: CPRRelayScene
 * PURPOSE: Flow 1 · Scene 7 — Michael (Director of Strategic Accounts) reviews
 *          the pre-drafted labor revision message to Nancy Bos (MK Invoice
 *          Processor). Michael can edit, then sends with one click.
 *
 * DS TOKENS: bg-card · bg-ai/5 · text-foreground · border-border
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, CheckCircle2, Send, Edit3 } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface CPRRelaySceneProps {
    onSend?: () => void
    onRoleChange?: (role: string) => void
}

const ADJUSTMENTS = [
    { category: 'Carpenters',    change: '50h → 45h (−5h)',  impact: '−$1,800' },
    { category: 'OT Carpenters', change: '8h → 6h (−2h)',    impact: '−$540'   },
]

const DRAFT_DEFAULT = `Lauren has reconciled the CPR for order DOE-2847. Adjusted amounts:\n• Carpenters: 50h → 45h (−5h, −$1,800)\n• OT Carpenters: 8h → 6h (−2h, −$540)\n• Total adjustment: −$2,340\n\nPlease update the Miller Knoll invoice accordingly.\n\n— Michael Boyle, Director of Strategic Accounts`

export default function CPRRelayScene({ onSend, onRoleChange }: CPRRelaySceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [sent, setSent]         = useState(false)
    const [editing, setEditing]   = useState(false)
    const [draftText, setDraftText] = useState(DRAFT_DEFAULT)
    const [nancyReply, setNancyReply] = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleSend = () => {
        setSent(true)
        setEditing(false)
        // Nancy replies after 1.8s
        setTimeout(() => setNancyReply(true), 1800)
        setTimeout(pauseAware(() => {
            onSend?.()
            nextStep()
        }), 2600)
    }

    return (
        <div className="space-y-4">
            {/* Context banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">CPR Relay · DOE-2847</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Strata pre-drafted the labor revision message to Nancy Bos at Miller Knoll. Review, edit if needed, then send — replacing the 1–3 day manual relay.
                    </div>
                </div>
            </div>

            {/* CPR diff summary */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="px-3.5 py-2 border-b border-border bg-muted/40">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Lauren's approved adjustments</div>
                </div>
                {ADJUSTMENTS.map((adj) => (
                    <div key={adj.category} className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-border last:border-b-0">
                        <div>
                            <div className="text-xs font-medium text-foreground">{adj.category}</div>
                            <div className="text-[11px] text-muted-foreground">{adj.change}</div>
                        </div>
                        <div className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">{adj.impact}</div>
                    </div>
                ))}
                <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-border bg-muted/20">
                    <span className="text-[11px] font-bold text-muted-foreground">Total adjustment</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">−$2,340</span>
                </div>
            </div>

            {/* Pre-drafted message — editable */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-border bg-muted/40">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Draft · to Nancy Bos (MK Invoice Processor)</div>
                    {!sent && (
                        <button
                            onClick={() => setEditing(v => !v)}
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Edit3 className="h-3 w-3" />
                            {editing ? 'Done' : 'Edit'}
                        </button>
                    )}
                </div>
                <div className="px-3.5 py-3 space-y-1 text-[11px] text-muted-foreground">
                    <div>To: Nancy Bos [MK Invoice Processor]</div>
                    <div>Re: DOE-2847 — Labor Revision Required</div>
                </div>
                <div className="px-3.5 pb-3 border-t border-border pt-2">
                    {editing ? (
                        <textarea
                            value={draftText}
                            onChange={e => setDraftText(e.target.value)}
                            rows={7}
                            className="w-full text-[11px] text-foreground bg-background border border-border rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                        />
                    ) : (
                        <pre className="text-[11px] text-foreground leading-relaxed whitespace-pre-wrap font-sans">{draftText}</pre>
                    )}
                </div>
            </div>

            {/* Actions + Nancy reply */}
            {!sent ? (
                <div className="flex justify-end">
                    <button
                        onClick={handleSend}
                        disabled={editing}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm disabled:opacity-40"
                    >
                        <Send className="h-3.5 w-3.5" />
                        Send to Nancy
                    </button>
                </div>
            ) : (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <div className="font-bold text-foreground">Sent · Nancy Bos · May 6 · 8:06 AM</div>
                            <div className="text-muted-foreground mt-0.5">DOE-2847 labor revision · MK invoice update requested</div>
                        </div>
                    </div>

                    {nancyReply && (
                        <div className="border border-border rounded-xl p-3 bg-card flex items-start gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[9px] font-bold text-muted-foreground">NB</span>
                            </div>
                            <div className="text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-foreground">Nancy Bos replied</span>
                                    <span className="text-muted-foreground text-[10px]">8:47 AM</span>
                                </div>
                                <div className="text-muted-foreground mt-0.5 italic">"Received — updating Miller Knoll invoice for DOE-2847."</div>
                                <div className="text-[10px] text-success mt-1 font-medium">Loop closed · no phone call needed</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <DataSourcesBar groups={[
                { sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] },
            ]} />
        </div>
    )
}
