/**
 * COMPONENT: LaborQuoteParserScene
 * PURPOSE: Flow 1 · Scene 4 — Michael (Director of Strategic Accounts) receives
 *          Lauren's parsed labor quote for approval. He can edit Carpenters hours
 *          inline before approving and pushing to CORE.
 *
 *          States: 'queue' → click Review → 'reviewing' → approve → 'approved'
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, CheckCircle2, FileText, Edit3, Save, Inbox } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface LaborQuoteParserSceneProps {
    onApprove?: () => void
    onRoleChange?: (role: string) => void
}

const RAW_QUOTE = `Inside delivery 4 hrs / Teamsters Local 807 — 24 hrs reg, 0 OT / Carpenters 50 hrs reg, 8 hrs OT / Strike truck: N/A (480 cubes, under 600 limit)`

type SceneState = 'queue' | 'reviewing' | 'approved'

export default function LaborQuoteParserScene({ onApprove, onRoleChange }: LaborQuoteParserSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [sceneState, setSceneState] = useState<SceneState>('queue')
    const [carpHours, setCarpHours]   = useState(50)
    const [carpOT, setCarpOT]         = useState(8)
    const [editingCarps, setEditingCarps] = useState(false)
    const [draftHours, setDraftHours]    = useState('50')
    const [carpEdited, setCarpEdited]    = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const carpTotal   = carpHours * 125 + carpOT * 125
    const grandTotal  = 340 + 2640 + carpTotal

    const handleReview  = () => setSceneState('reviewing')

    const handleEditStart = () => {
        setDraftHours(String(carpHours))
        setEditingCarps(true)
    }

    const handleEditSave = () => {
        const h = Math.max(1, Math.min(99, parseInt(draftHours) || carpHours))
        setCarpHours(h)
        setCarpEdited(true)
        setEditingCarps(false)
    }

    const handleApprove = () => {
        setSceneState('approved')
        setTimeout(pauseAware(() => {
            onApprove?.()
            nextStep()
        }), 900)
    }

    // ── Queue state ───────────────────────────────────────────────────────────
    if (sceneState === 'queue') {
        return (
            <div className="space-y-4">
                <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                    <Inbox className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                    <div className="text-xs flex-1">
                        <div className="font-bold text-foreground">Pending Approvals · Michael B.</div>
                        <div className="text-muted-foreground mt-0.5">1 item waiting for your review</div>
                    </div>
                    <span className="h-5 w-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                </div>

                <div className="border border-amber-200 dark:border-amber-500/30 rounded-xl bg-amber-50 dark:bg-amber-500/5 overflow-hidden">
                    <div className="px-3.5 py-3 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <div className="text-xs font-bold text-foreground">Labor Quote · DOE-2847</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">NYC Dept. of Education · WIG free-text → parsed</div>
                                <div className="text-[11px] text-muted-foreground">Sent by Lauren G. · 8:12 AM</div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                                Needs review
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[11px]">
                            <div>
                                <div className="text-muted-foreground text-[10px]">Carpenters</div>
                                <div className="font-medium text-foreground">50h reg · 8h OT</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-[10px]">Teamsters</div>
                                <div className="font-medium text-foreground">24h reg</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-[10px]">Total</div>
                                <div className="font-bold text-foreground">$10,230</div>
                            </div>
                        </div>
                        <button
                            onClick={handleReview}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                        >
                            <FileText className="h-3.5 w-3.5" />
                            Review labor quote →
                        </button>
                    </div>
                </div>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
            </div>
        )
    }

    // ── Approved state ────────────────────────────────────────────────────────
    if (sceneState === 'approved') {
        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-success/5 border border-success/30 rounded-xl p-3.5 flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">Labor quote approved · DOE-2847</div>
                        <div className="text-muted-foreground mt-0.5">
                            ${grandTotal.toLocaleString()} pushed to CORE · Lauren notified automatically
                        </div>
                        {carpEdited && (
                            <div className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                                Carpenters adjusted {carpHours}h → CORE updated
                            </div>
                        )}
                    </div>
                </div>
                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
            </div>
        )
    }

    // ── Reviewing state ───────────────────────────────────────────────────────
    return (
        <div className="space-y-4">
            {/* Context banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Labor Quote Parser · DOE-2847</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Strata parsed the WIG free-text quote into a structured table by union category. Edit any line before approving.
                    </div>
                </div>
            </div>

            {/* Raw quote */}
            <div className="border border-border rounded-xl p-3 bg-muted/30">
                <div className="flex items-center gap-1.5 mb-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">WIG Quote · Raw Text</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed italic">{RAW_QUOTE}</p>
            </div>

            {/* Parsed table */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="grid grid-cols-5 gap-2 px-3.5 py-2 border-b border-border bg-muted/40">
                    {['Category', 'Hours', 'OT', 'Rate', 'Total'].map(h => (
                        <div key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-right first:text-left">{h}</div>
                    ))}
                </div>

                {/* Inside Delivery */}
                <div className="border-b border-border">
                    <div className="grid grid-cols-5 gap-2 px-3.5 py-2.5 items-center">
                        <div className="text-xs font-medium text-foreground">Inside Delivery</div>
                        <div className="text-xs text-right tabular-nums text-foreground">4h</div>
                        <div className="text-xs text-right tabular-nums text-foreground">—</div>
                        <div className="text-xs text-muted-foreground text-right tabular-nums">$85</div>
                        <div className="text-xs font-bold text-right tabular-nums text-foreground">$340</div>
                    </div>
                </div>

                {/* Teamsters */}
                <div className="border-b border-border">
                    <div className="grid grid-cols-5 gap-2 px-3.5 py-2.5 items-center">
                        <div className="text-xs font-medium text-foreground">Teamsters</div>
                        <div className="text-xs text-right tabular-nums text-foreground">24h</div>
                        <div className="text-xs text-right tabular-nums text-foreground">—</div>
                        <div className="text-xs text-muted-foreground text-right tabular-nums">$110</div>
                        <div className="text-xs font-bold text-right tabular-nums text-foreground">$2,640</div>
                    </div>
                </div>

                {/* Carpenters — editable */}
                <div className={`border-b border-border transition-colors ${carpEdited ? 'bg-amber-50 dark:bg-amber-500/5' : ''}`}>
                    {editingCarps ? (
                        <div className="px-3.5 py-2.5 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-foreground w-28 shrink-0">Carpenters</span>
                                <div className="flex items-center gap-1.5 flex-1">
                                    <input
                                        type="number"
                                        value={draftHours}
                                        onChange={e => setDraftHours(e.target.value)}
                                        className="w-16 text-xs text-right tabular-nums border border-primary rounded-lg px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                        min={1}
                                        max={99}
                                        autoFocus
                                    />
                                    <span className="text-[11px] text-muted-foreground">h reg · {carpOT}h OT · $125/h</span>
                                </div>
                                <button
                                    onClick={handleEditSave}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all shrink-0"
                                >
                                    <Save className="h-3 w-3" />
                                    Save
                                </button>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                Preview total: ${(parseInt(draftHours) || 0) * 125 + carpOT * 125 > 0 ? ((parseInt(draftHours) || 0) * 125 + carpOT * 125).toLocaleString() : '0'}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-5 gap-2 px-3.5 py-2.5 items-center">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-foreground">Carpenters</span>
                                {carpEdited && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">Edited</span>
                                )}
                            </div>
                            <div className="text-xs text-right tabular-nums text-foreground">{carpHours}h</div>
                            <div className="text-xs text-right tabular-nums text-foreground">{carpOT}h</div>
                            <div className="text-xs text-muted-foreground text-right tabular-nums">$125</div>
                            <div className="flex items-center justify-end gap-1.5">
                                <span className="text-xs font-bold tabular-nums text-foreground">${carpTotal.toLocaleString()}</span>
                                <button
                                    onClick={handleEditStart}
                                    className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                    title="Edit hours"
                                >
                                    <Edit3 className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Strike Truck */}
                <div className="border-b border-border bg-muted/20">
                    <div className="grid grid-cols-5 gap-2 px-3.5 py-2.5 items-center">
                        <div className="text-xs font-medium text-muted-foreground">Strike Truck</div>
                        <div className="text-xs text-right tabular-nums text-muted-foreground">N/A</div>
                        <div className="text-xs text-right tabular-nums text-muted-foreground">—</div>
                        <div className="text-xs text-muted-foreground text-right tabular-nums">—</div>
                        <div className="text-xs font-bold text-right tabular-nums text-muted-foreground">$0</div>
                    </div>
                    <div className="px-3.5 pb-2 text-[10px] text-success font-medium flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-success inline-block" />
                        480 cubes · under 600 threshold → N/A
                    </div>
                </div>

                {/* Total */}
                <div className="px-3.5 py-2.5 bg-muted/20 flex justify-between items-center">
                    <span className="text-[11px] font-bold text-muted-foreground">Total Labor</span>
                    <span className="text-xs font-bold text-foreground tabular-nums">${grandTotal.toLocaleString()}</span>
                </div>
            </div>

            {/* Approve */}
            <div className="flex items-center justify-end">
                <button
                    onClick={handleApprove}
                    disabled={editingCarps}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm disabled:opacity-40"
                >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve & push to CORE
                </button>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
