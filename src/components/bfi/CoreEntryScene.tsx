/**
 * COMPONENT: CoreEntryScene  (r1.5)
 * PURPOSE: Product Receiving step 5 — Lauren confirms 34/35 cartons in CORE.
 *          Line 24 excluded pending Omni claim resolution.
 *
 * States: 'review' → 'confirming' → 'confirmed'
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { CheckCircle2, Package, AlertTriangle, ChevronRight, ArrowDown, Send, Bell, RotateCcw } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import ReceivingProcessBar from './ReceivingProcessBar'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface CoreEntrySceneProps {
    onConfirm?: () => void
}

type CoreState = 'review' | 'confirming' | 'confirmed'

const SYNC_LINES = [
    'PMO-2026-0412 · 34/35 cartons',
    'Line 24 flagged EXCLUDED',
    'Claim #OM-2026-0412 attached',
    'Entry timestamped · Account Manager DeMar · May 11 · 2:30 PM',
]

export default function CoreEntryScene({ onConfirm }: CoreEntrySceneProps) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [coreState, setCoreState] = useState<CoreState>('review')
    const [syncLines, setSyncLines] = useState(0)
    const [flagging, setFlagging] = useState(false)
    const [flagNote, setFlagNote] = useState('')
    const [flagSent, setFlagSent] = useState(false)
    const [flagChips, setFlagChips] = useState<string[]>([])
    const FLAG_CHIPS = ['Carton count mismatch', 'Claim not attached', 'Wrong exclusion', 'Other']
    const [walterPreview, setWalterPreview] = useState(false)
    const [walterDraft, setWalterDraft] = useState(
        'PMO-2026-0412 · 34 of 35 cartons confirmed at WIG\n\nDelivery window: May 14–21. Carton #34 (Line 24) short-shipped — Omni claim #OM-2026-0412 filed. Physical work order in transit — pre-coordination can begin now.'
    )

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleConfirm = () => {
        setCoreState('confirming')
        SYNC_LINES.forEach((_, i) => {
            setTimeout(pauseAware(() => setSyncLines(i + 1)), 300 + i * 400)
        })
        setTimeout(pauseAware(() => setCoreState('confirmed')), 300 + SYNC_LINES.length * 400 + 300)
    }

    return (
        <div className="space-y-4">
            <ReceivingProcessBar stepId="r1.5" />

            {/* Contrast card: Lena's entry vs Strata's entry */}
            <div className="space-y-2">
                {/* Lena's entry (before) */}
                <div className="bg-muted/60 border border-border rounded-xl overflow-hidden">
                    <div className="px-3.5 py-2 border-b border-border flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Lena's CORE entry</span>
                        </div>
                        <span className="text-[9px] bg-muted border border-border rounded px-1.5 py-0.5 text-muted-foreground font-medium">No partial flag</span>
                    </div>
                    <div className="divide-y divide-border/60">
                        {[
                            { label: 'PMO Number', value: 'PMO-2026-0412' },
                            { label: 'Cartons', value: '35 · Status: RECEIVED ✓' },
                            { label: 'Exclusion', value: '—' },
                            { label: 'Claim', value: '—' },
                        ].map(r => (
                            <div key={r.label} className="flex items-center justify-between gap-3 px-3.5 py-2">
                                <span className="text-[10px] text-muted-foreground">{r.label}</span>
                                <span className="text-[10px] font-medium text-muted-foreground">{r.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="px-3.5 py-2 border-t border-border/60">
                        <p className="text-[9px] text-muted-foreground italic">CORE shows 35 cartons received — no way to tell the order is incomplete from the system alone.</p>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                    <ArrowDown className="h-3 w-3" />
                    Strata changes this
                </div>

                {/* Strata's pre-filled entry */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-3.5 py-2 border-b border-border bg-success/5 flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-success" />
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-wide">CORE entry — ready to confirm</span>
                    </div>
                    <div className="divide-y divide-border">
                        {[
                            { label: 'PMO Number', value: 'PMO-2026-0412' },
                            { label: 'Cartons received', value: '34/35' },
                            { label: 'Short-shipped', value: 'Carton #34 · Line 24' },
                            { label: 'Line 24 status', value: 'EXCLUDED' },
                            { label: 'Reason', value: 'Short-ship · Carton #34' },
                            { label: 'Claim', value: 'Omni #OM-2026-0412' },
                        ].map(r => (
                            <div key={r.label} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                                <span className="text-[11px] text-muted-foreground">{r.label}</span>
                                <span className="text-xs font-semibold text-foreground">{r.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Short-ship warning */}
            <div className="bg-warning/5 border border-warning/30 rounded-xl px-3.5 py-3 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Line 24 excluded from this entry</div>
                    <div className="text-muted-foreground mt-0.5">
                        Chair Frame Assembly ×1 — excluded until Omni claim #OM-2026-0412 resolves.
                        34 of 35 cartons confirmed received.
                    </div>
                </div>
            </div>

            {/* CORE sync animation while confirming */}
            {coreState === 'confirming' && (
                <div className="bg-ai/5 border border-ai/20 rounded-xl px-3.5 py-3 space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-xs">
                        <div className="h-3.5 w-3.5 border-2 border-ai border-t-transparent rounded-full animate-spin shrink-0" />
                        <span className="font-bold text-foreground">Submitting to CORE…</span>
                    </div>
                    {Array.from({ length: syncLines }, (_, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground animate-in fade-in duration-300">
                            <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                            <span>{SYNC_LINES[i]}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* CTA / confirmed state */}
            {coreState === 'review' && (
                <div className="space-y-2">
                    {/* Flag issue panel */}
                    {flagging && !flagSent && (
                        <div className="border border-warning/20 bg-warning/5 rounded-xl overflow-hidden animate-in fade-in duration-300">
                            <div className="flex flex-wrap gap-1.5 px-3 pt-3 pb-2">
                                {FLAG_CHIPS.map(chip => (
                                    <button key={chip}
                                        onClick={() => setFlagChips(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip])}
                                        className={`px-2 py-1 text-[10px] font-medium rounded-full border transition-colors ${flagChips.includes(chip) ? 'bg-warning/20 border-warning/40 text-warning' : 'border-border text-muted-foreground hover:border-warning/30'}`}>
                                        {chip}
                                    </button>
                                ))}
                            </div>
                            <div className="px-3 pb-2">
                                <textarea rows={2} value={flagNote} onChange={e => setFlagNote(e.target.value)}
                                    placeholder="Describe the issue for Lauren / Lena…"
                                    className="w-full text-[10px] bg-transparent text-foreground placeholder:text-muted-foreground outline-none resize-none" />
                            </div>
                            <div className="flex items-center justify-end gap-2 px-3 pb-3">
                                <button onClick={() => setFlagging(false)} className="px-2.5 py-1 text-[10px] text-muted-foreground border border-border rounded hover:bg-muted/30">Cancel</button>
                                <button onClick={() => { setFlagSent(true); setFlagging(false) }}
                                    className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold rounded bg-warning text-zinc-900 hover:opacity-90">
                                    <Send className="h-3 w-3" /> Send flag →
                                </button>
                            </div>
                        </div>
                    )}

                    {flagSent && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-warning/5 border border-warning/20 rounded-xl text-[10px] text-warning animate-in fade-in duration-300">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            Issue flagged · sent to Lena / Lauren · CORE entry on hold
                        </div>
                    )}

                    {/* Flag trigger + confirm row */}
                    <div className="flex items-center gap-2">
                        {!flagSent && !flagging && (
                            <button onClick={() => setFlagging(true)}
                                className="flex items-center gap-1.5 px-3 py-3 text-sm font-medium rounded-xl border border-border text-muted-foreground hover:bg-muted/30 transition-colors">
                                <RotateCcw className="h-3.5 w-3.5" /> Flag issue
                            </button>
                        )}
                        <button onClick={handleConfirm} disabled={flagSent}
                            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-all shadow-sm">
                            <CheckCircle2 className="h-4 w-4" />
                            Confirm Receiving in CORE
                        </button>
                    </div>
                </div>
            )}

            {coreState === 'confirmed' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <div className="font-bold text-foreground">34/35 cartons confirmed in CORE</div>
                            <div className="text-muted-foreground mt-0.5">
                                PMO-2026-0412 · Line 24 flagged short-shipped · claim #OM-2026-0412 attached
                            </div>
                        </div>
                    </div>

                    {/* Walter notification preview */}
                    {!walterPreview && (
                        <button onClick={() => setWalterPreview(true)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm">
                            <Bell className="h-4 w-4" /> Preview &amp; notify Walter →
                        </button>
                    )}

                    {walterPreview && (
                        <div className="border border-ai/20 bg-ai/5 rounded-xl overflow-hidden animate-in fade-in duration-300">
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-ai/10">
                                <Bell className="h-3 w-3 text-ai shrink-0" />
                                <span className="text-[10px] font-bold text-ai">Push notification · Operations Manager Bly (CoNY PM)</span>
                            </div>
                            <div className="px-3 py-2 space-y-1 border-b border-ai/10 text-[10px]">
                                <div className="flex gap-2"><span className="text-muted-foreground w-8 shrink-0">To:</span><span className="font-medium text-foreground">Operations Manager Bly · CoNY Project Manager</span></div>
                                <div className="flex gap-2"><span className="text-muted-foreground w-8 shrink-0">Via:</span><span className="text-muted-foreground">Strata mobile push notification</span></div>
                            </div>
                            <div className="px-3 py-2">
                                <textarea rows={4} value={walterDraft} onChange={e => setWalterDraft(e.target.value)}
                                    className="w-full text-[10px] bg-transparent text-foreground outline-none resize-none" />
                            </div>
                            <div className="flex items-center justify-end gap-2 px-3 pb-3">
                                <button onClick={() => setWalterPreview(false)} className="px-2.5 py-1 text-[10px] text-muted-foreground border border-border rounded hover:bg-muted/30">Cancel</button>
                                <button onClick={() => onConfirm?.()}
                                    className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold rounded bg-primary text-primary-foreground hover:opacity-90">
                                    <ChevronRight className="h-3 w-3" /> Confirm &amp; send →
                                </button>
                            </div>
                        </div>
                    )}

                    <p className="text-[10px] text-muted-foreground text-center">Walter (CoNY Project Manager) will receive a Strata notification instead of a printed copy.</p>
                </div>
            )}

            {/* Before Strata */}
            <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Before Strata:</span> Lena's CORE entry showed 35 cartons with no partial flag, no exclusion, no claim reference. Lauren couldn't tell from CORE alone that an item was missing — she had to find out by printing documents and checking manually.
                </p>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
