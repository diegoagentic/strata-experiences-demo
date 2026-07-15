/**
 * COMPONENT: WIGDocParserScene
 * PURPOSE: Flow 2 · Scene 3 — WIG Receiving Report + HM Bingo Sheet.
 *          3 states: incoming (Word doc artifact) → parsing (BingoGrid animation) → results.
 *          Role: Lena. ProblemPanel + QuickActions for Bingo #36. 1-click confirm.
 *
 * DS TOKENS: bg-card · bg-success/5 · bg-amber-50 · border-border
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, CheckCircle2, AlertTriangle, FileText, Package, ChevronDown, ChevronUp, Mail } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocViewer, { BFI_DOCS } from './BFIDocViewer'

interface WIGDocParserSceneProps {
    onConfirm?: () => void
    onRoleChange?: (role: string) => void
}

type SceneState = 'incoming' | 'parsing' | 'results'

const BATCH_DELAYS = [400, 700, 950, 1150, 1300, 1500]
const BATCHES      = [6,   12,  18,  24,   30,   36  ]

const PARSE_LINES = [
    { label: 'Bingo #1–8   → Lounge Chair ×8',  coreL: 'CORE L1 ✓',              showAt: 6,  ok: true  },
    { label: 'Bingo #9–20  → Work Table ×12',    coreL: 'CORE L2 ✓',              showAt: 12, ok: true  },
    { label: 'Bingo #21–24 → Storage Unit ×4',   coreL: 'CORE L3 ✓',              showAt: 18, ok: true  },
    { label: 'Bingo #25–35 → Side Chair ×11',    coreL: 'CORE L4 (partial)',       showAt: 30, ok: true  },
    { label: 'Bingo #36    → Side Chair ×1',     coreL: 'CORE L4 — NOT received', showAt: 36, ok: false },
]

const LINE_ITEMS = [
    { line: 'L1', product: 'Lounge Chair',     ordered: 8,  received: 8,  gap: false },
    { line: 'L2', product: 'Work Table 60×30', ordered: 12, received: 12, gap: false },
    { line: 'L3', product: 'Storage Unit',     ordered: 4,  received: 4,  gap: false },
    { line: 'L4', product: 'Side Chair',       ordered: 12, received: 11, gap: true  },
]

const ACTION_FEEDBACK: Record<string, string> = {
    carrier: 'Draft ready · ALTL · PO 18091-29443 + Bingo #36 + Side Chair ×1',
    wig:     'Email queued to WIG · May 6 · 8:06 AM · awaiting response',
    core:    'L4 marked 11/12 · partial receipt logged in CORE',
}

const ACTIVITY_TRAIL = [
    { time: 'May 6 · 8:06 AM', actor: 'WIG',    action: 'Word doc via email',                   tag: '📄 physical → digital capture', tagClass: 'text-muted-foreground' },
    { time: 'May 6 · 8:06 AM', actor: 'Strata', action: 'Parsed: 35/36 · Bingo #36 flagged',    tag: '✦ AI · <1 min',                 tagClass: 'text-ai'              },
    { time: 'May 6 · 8:06 AM', actor: 'Lauren', action: 'Auto-notified',                         tag: '● digital record',               tagClass: 'text-muted-foreground' },
    { time: 'May 6 · 9:02 AM', actor: 'Lena',   action: 'Confirmed in CORE · 35 items',         tag: '● digital record',               tagClass: 'text-muted-foreground' },
]

function BingoGrid({ visibleCount }: { visibleCount: number }) {
    return (
        <div className="grid grid-cols-6 gap-1">
            {Array.from({ length: 36 }, (_, i) => {
                const num = i + 1
                const isVisible = num <= visibleCount
                const isMissing = num === 36
                if (!isVisible) {
                    return <div key={num} className="h-7 rounded bg-muted/30 border border-border/40" />
                }
                return (
                    <div
                        key={num}
                        className={`h-7 rounded border flex items-center justify-center text-[10px] font-bold animate-in fade-in duration-150 ${
                            isMissing
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400 animate-pulse'
                                : 'bg-success/15 border-success/30 text-success'
                        }`}
                    >
                        {num}
                    </div>
                )
            })}
        </div>
    )
}

export default function WIGDocParserScene({ onConfirm }: WIGDocParserSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [sceneState, setSceneState]           = useState<SceneState>('incoming')
    const [visibleCount, setVisibleCount]       = useState(0)
    const [confirmed, setConfirmed]             = useState(false)
    const [problemExpanded, setProblemExpanded] = useState(true)
    const [actionTaken, setActionTaken]         = useState<string | null>(null)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const startParsing = useCallback(() => {
        setSceneState('parsing')
        setVisibleCount(0)
        BATCH_DELAYS.forEach((delay, i) => {
            setTimeout(pauseAware(() => setVisibleCount(BATCHES[i])), delay)
        })
        setTimeout(pauseAware(() => setSceneState('results')), 2200)
    }, [pauseAware])

    const handleConfirm = () => {
        setConfirmed(true)
        setTimeout(pauseAware(() => {
            onConfirm?.()
            nextStep()
        }), 900)
    }

    // ── Incoming ───────────────────────────────────────────────────────────────
    if (sceneState === 'incoming') {
        return (
            <div className="space-y-4 animate-in fade-in duration-500">
                {/* Before Strata */}
                <div className="bg-muted/60 border border-border rounded-xl p-3 space-y-1">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Before Strata</div>
                    <div className="text-xs text-foreground leading-relaxed">
                        WIG sends receiving doc → Lena processes on her own timeline →{' '}
                        <span className="font-bold text-destructive">up to 1 week delay</span>.
                        Lauren manually follows up after 1–2 days. Multiple orders arriving same day compound the lag.
                    </div>
                </div>

                {/* Incoming email card */}
                <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 py-2 bg-muted/40 border-b border-border">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Incoming · WIG Receiving Report</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">May 6 · 8:06 AM</span>
                    </div>
                    <div className="p-3.5 space-y-2.5">
                        <div className="text-[11px] text-muted-foreground">From: warehouse@wiggroup.com</div>
                        <div className="text-xs text-foreground font-medium">DOH-0671 · Receiving Report attached · 36 cartons</div>

                        {/* Word doc thumbnail */}
                        <div className="border border-border rounded-lg p-3 bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-[11px] text-foreground font-medium">RR-38821_DOH0671_May6.docx</span>
                            </div>
                            <pre className="font-mono text-[10px] text-muted-foreground leading-relaxed whitespace-pre-wrap">{`WIG RECEIVING REPORT #RR-38821
Date: 05/06/2026  Carrier: ALTL
Cartons rcv'd: 36  Damage: None
[bingo sheet + packing slips · pages 2-7]
Missing noted: carton 36 via FedEx per MK`}</pre>
                        </div>

                        <div className="text-[11px] text-muted-foreground">
                            Also received today on same trailer:{' '}
                            <span className="text-foreground font-medium">DCAS-1182 · NYPD-0394</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                            Without Strata: Lena processes each doc separately — 3 manual CORE entries on her own timeline
                        </div>
                    </div>
                </div>

                <button
                    onClick={startParsing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                >
                    <Sparkles className="h-4 w-4" />
                    Parse with Strata
                </button>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
            </div>
        )
    }

    // ── Parsing ────────────────────────────────────────────────────────────────
    if (sceneState === 'parsing') {
        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                    <div className="h-4 w-4 border-2 border-ai border-t-transparent rounded-full animate-spin shrink-0 mt-0.5" />
                    <div className="text-xs flex-1">
                        <div className="font-bold text-foreground">Parsing · WIG Receiving Report + HM Packing List</div>
                        <div className="text-muted-foreground mt-0.5">Cross-referencing Bingo # → CORE order lines...</div>
                    </div>
                </div>

                {/* Bingo Grid — fills progressively */}
                <div className="border border-border rounded-xl p-3.5 bg-card space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Bingo Sheet · GD2891</span>
                        <span className="text-[11px] text-muted-foreground tabular-nums">{visibleCount}/36 checked</span>
                    </div>
                    <BingoGrid visibleCount={visibleCount} />
                    {visibleCount === 36 && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 animate-in fade-in slide-in-from-top-1 duration-200">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            Bingo #36 not confirmed · Side Chair ×1 · FedEx subpath detected
                        </div>
                    )}
                </div>

                {/* Parse lines — reveal as batches complete */}
                <div className="border border-border rounded-xl overflow-hidden bg-card">
                    {PARSE_LINES.filter(l => l.showAt <= visibleCount).map((line) => (
                        <div
                            key={line.label}
                            className={`flex items-center justify-between gap-3 px-3.5 py-2 border-b border-border last:border-b-0 animate-in fade-in duration-200 ${
                                !line.ok ? 'bg-amber-50/50 dark:bg-amber-500/5' : ''
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                {line.ok
                                    ? <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                                    : <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                                }
                                <span className="font-mono text-[11px] text-foreground">{line.label}</span>
                            </div>
                            <span className={`text-[11px] font-medium shrink-0 ${line.ok ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400'}`}>
                                {line.coreL}
                            </span>
                        </div>
                    ))}
                </div>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
            </div>
        )
    }

    // ── Results ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* With Strata summary */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">With Strata — DOH-0671 · WIG Doc Parser</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Parsed instantly — each Bingo # mapped to CORE line, missing carton detected automatically.
                        Lauren notified without waiting for Lena.
                    </div>
                </div>
            </div>

            {/* Source document — actual RR PDF */}
            <BFIDocViewer {...BFI_DOCS.RR_37577_MISSING} height={320} />

            {/* Bingo Grid — static, all 36 cells */}
            <div className="border border-border rounded-xl p-3.5 bg-card space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Bingo Sheet · GD2891 · 36 cartons</span>
                    <div className="flex items-center gap-2.5">
                        <span className="text-[11px] text-success font-medium">35 ✓</span>
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">1 ⚠️</span>
                    </div>
                </div>
                <BingoGrid visibleCount={36} />
                <div className="text-[10px] text-muted-foreground">
                    Before Strata: Lauren and Lena cross-referenced page 1 vs page 2 of the bingo doc manually — no automatic detection
                </div>
            </div>

            {/* CORE Line Matching */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="px-3.5 py-2 border-b border-border bg-muted/40">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">CORE Line Matching</span>
                </div>
                <div className="grid grid-cols-4 gap-2 px-3.5 py-1.5 border-b border-border bg-muted/20">
                    {['Line', 'Product', 'Ordered', 'Received'].map(h => (
                        <div key={h} className="text-[10px] font-bold text-muted-foreground text-right first:text-left">{h}</div>
                    ))}
                </div>
                {LINE_ITEMS.map((item) => (
                    <div key={item.line} className={`grid grid-cols-4 gap-2 px-3.5 py-2.5 border-b border-border last:border-b-0 items-center ${
                        item.gap ? 'bg-amber-50/50 dark:bg-amber-500/5' : ''
                    }`}>
                        <div className="text-[11px] font-bold text-muted-foreground">{item.line}</div>
                        <div className="text-xs text-foreground">{item.product}</div>
                        <div className="text-xs text-foreground text-right tabular-nums">{item.ordered}</div>
                        <div className={`text-xs font-medium text-right tabular-nums flex items-center justify-end gap-1 ${
                            item.gap ? 'text-amber-600 dark:text-amber-400' : 'text-success'
                        }`}>
                            {item.gap && <AlertTriangle className="h-3 w-3 shrink-0" />}
                            {item.received}
                            {item.gap && <span className="text-[10px] font-normal ml-0.5">via FedEx</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* ProblemPanel — Bingo #36 */}
            <div className="border border-amber-200 dark:border-amber-500/30 rounded-xl overflow-hidden bg-amber-50 dark:bg-amber-500/5">
                <button
                    onClick={() => setProblemExpanded(v => !v)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-amber-100/50 dark:hover:bg-amber-500/10 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="text-[11px] font-bold text-foreground">Bingo #36 · Side Chair ×1 · Action Required</span>
                    </div>
                    {problemExpanded
                        ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    }
                </button>

                {problemExpanded && (
                    <div className="px-3.5 pb-3.5 space-y-3 border-t border-amber-200 dark:border-amber-500/20">
                        <div className="pt-2.5 text-[11px] text-foreground">
                            Status:{' '}
                            <span className="font-medium">FedEx small parcel subpath · not received at WIG dock</span>
                        </div>

                        <div className="space-y-2">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Quick Actions</div>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { key: 'carrier', label: 'Contact carrier →' },
                                    { key: 'wig',     label: 'Request WIG confirm →' },
                                    { key: 'core',    label: 'Update CORE partial' },
                                ].map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setActionTaken(key)}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                                            actionTaken === key
                                                ? 'bg-success/10 border-success/30 text-success'
                                                : 'bg-card border-border text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        {actionTaken === key && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {actionTaken && (
                                <div className="text-[11px] text-success animate-in fade-in duration-200">
                                    ✓ {ACTION_FEEDBACK[actionTaken]}
                                </div>
                            )}
                        </div>

                        <div className="text-[10px] text-muted-foreground border-t border-amber-200 dark:border-amber-500/20 pt-2.5">
                            Before Strata: Lauren tracked this via email threads — no status, no record, no ETA
                        </div>
                    </div>
                )}
            </div>

            {/* Same-trailer note */}
            <div className="bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-[11px] text-muted-foreground">
                Also received today on same trailer:{' '}
                <span className="text-foreground font-medium">DCAS-1182 · NYPD-0394</span>
                <span className="block mt-0.5 text-[10px]">
                    Without Strata: Lena processes each doc separately on her own timeline — 3 manual CORE entries
                </span>
            </div>

            {/* Lena CTA → confirm */}
            {!confirmed ? (
                <div className="flex justify-end">
                    <button
                        onClick={handleConfirm}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                    >
                        <Package className="h-3.5 w-3.5" />
                        Confirm receipt in CORE · 35 items
                    </button>
                </div>
            ) : (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <div className="font-bold text-foreground">35 items confirmed in CORE · DOH-0671</div>
                            <div className="text-muted-foreground mt-0.5">L4 marked partial · Bingo #36 → FedEx tracking pending · Lauren notified</div>
                        </div>
                    </div>

                    {/* Order Activity Trail */}
                    <div className="border border-border rounded-xl p-3.5 bg-card space-y-2.5">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Order Activity · DOH-0671</div>
                        {ACTIVITY_TRAIL.map((ev, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <div className="text-[10px] text-muted-foreground w-[112px] shrink-0 pt-0.5 tabular-nums">{ev.time}</div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[11px] font-medium text-foreground">{ev.actor}</span>
                                    <span className="text-[11px] text-muted-foreground"> · {ev.action}</span>
                                    <span className={`text-[10px] ml-1.5 ${ev.tagClass}`}>[{ev.tag}]</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
        </div>
    )
}
