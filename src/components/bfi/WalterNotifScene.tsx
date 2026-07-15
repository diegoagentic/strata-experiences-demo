/**
 * COMPONENT: WalterNotifScene
 * PURPOSE: Flow 2 · Scene 6 — Walter (CoNY PM, client side) receives a
 *          Strata notification on his phone before the paper work order arrives.
 *          Rendered inside MobileDeviceFrame on a bg-zinc-950 background.
 *
 *          States: 'locked' → tap → 'app' → confirm
 *
 *          Order: PMO-2026-0412 · NYC Dept. of Education
 *          34/35 cartons confirmed · Carton #34 claim OM-2026-0412 filed
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, Calendar, Package, ChevronDown, ChevronUp, Bell, Zap, FileText, Expand, Download } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface WalterNotifSceneProps {
    onConfirm?: () => void
}

type WalterState = 'locked' | 'app'

export default function WalterNotifScene({ onConfirm }: WalterNotifSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [walterState, setWalterState] = useState<WalterState>('locked')
    const [confirmed, setConfirmed]     = useState(false)
    const [claimExpanded, setClaimExpanded] = useState(false)
    const [reportExpanded, setReportExpanded] = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleUnlock = () => setWalterState('app')

    const handleConfirm = () => {
        setConfirmed(true)
        setTimeout(pauseAware(() => {
            onConfirm?.()
            nextStep()
        }), 800)
    }

    // ── Lock screen ───────────────────────────────────────────────────────────
    if (walterState === 'locked') {
        return (
            <div
                className="flex flex-col h-full bg-gradient-to-b from-zinc-800 to-zinc-900 cursor-pointer select-none"
                onClick={handleUnlock}
            >
                {/* Time + date */}
                <div className="flex flex-col items-center pt-10 pb-6">
                    <div className="text-5xl font-thin text-white tracking-tight">9:04</div>
                    <div className="text-sm text-muted-foreground mt-1">Tuesday, May 6</div>
                </div>

                {/* Notification banner */}
                <div className="mx-3 animate-in slide-in-from-top-2 fade-in duration-500">
                    <div className="bg-zinc-700/80 backdrop-blur rounded-2xl px-4 py-3 space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center shrink-0">
                                <Bell className="h-3.5 w-3.5 text-primary-foreground" />
                            </div>
                            <span className="text-[11px] font-bold text-white">Strata</span>
                            <span className="text-[10px] text-muted-foreground ml-auto">now</span>
                        </div>
                        <div className="text-xs font-semibold text-white">PMO-2026-0412 · 34 of 35 cartons confirmed</div>
                        <div className="text-[11px] text-zinc-300 leading-relaxed">
                            NYC Dept. of Education · Ready for scheduling · Carton #34 claim filed
                        </div>
                    </div>
                </div>

                {/* Swipe hint */}
                <div className="flex-1 flex flex-col items-center justify-end pb-10">
                    <div className="text-[11px] text-muted-foreground animate-pulse">Tap to view</div>
                </div>
            </div>
        )
    }

    // ── App state ─────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full bg-background">
            {/* In-app header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center shrink-0">
                        <Bell className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                    <span className="text-xs font-bold text-foreground">Strata</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-[9px] font-bold text-muted-foreground">WG</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">Walter Goley</span>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Main notification */}
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2.5 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">PMO-2026-0412 · 34 of 35 cartons confirmed at WIG</div>
                        <div className="text-muted-foreground mt-1 leading-relaxed italic text-[11px]">
                            "Physical work order in transit — pre-coordination can begin now."
                        </div>
                        <div className="text-muted-foreground mt-1 text-[10px]">3 minutes ago · via Strata</div>
                    </div>
                </div>

                {/* Key moments strip */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-muted/40 border border-border rounded-xl p-2.5 flex flex-col items-center text-center gap-1">
                        <Zap className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                        <div className="text-[10px] font-bold text-foreground">Instant</div>
                        <div className="text-[9px] text-muted-foreground leading-tight">vs printed copy, days later</div>
                    </div>
                    <div className="bg-muted/40 border border-border rounded-xl p-2.5 flex flex-col items-center text-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-foreground shrink-0" aria-hidden="true" />
                        <div className="text-[10px] font-bold text-foreground">May 14–21</div>
                        <div className="text-[9px] text-muted-foreground leading-tight">delivery window · 8 days</div>
                    </div>
                    <div className="bg-muted/40 border border-border rounded-xl p-2.5 flex flex-col items-center text-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" aria-hidden="true" />
                        <div className="text-[10px] font-bold text-foreground">Claim filed</div>
                        <div className="text-[9px] text-muted-foreground leading-tight">#OM-2026-0412</div>
                    </div>
                </div>

                {/* Order summary */}
                <div className="border border-border rounded-xl p-3 space-y-2.5 bg-card">
                    <div className="flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                        <div>
                            <div className="text-[11px] font-bold text-foreground">NYC Dept. of Education</div>
                            <div className="text-[10px] text-muted-foreground">52 Chambers St, New York, NY 10007</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                            <div className="text-muted-foreground text-[10px]">Items confirmed</div>
                            <div className="font-medium text-foreground mt-0.5 text-[10px]">Workstations ×24<br />Lounge Seating ×12</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-[10px]">WIG status</div>
                            <div className="font-medium text-success mt-0.5 flex items-center gap-1 text-[10px]">
                                <CheckCircle2 className="h-2.5 w-2.5" /> 34/35 confirmed
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground border-t border-border pt-2">
                        <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
                        Delivery window: May 14 – May 21, 2026
                    </div>
                </div>

                {/* Storage urgency card */}
                <div className="bg-warning/5 border border-warning/30 rounded-xl px-3 py-2.5 flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-[11px] font-bold text-foreground">8 days remaining in WIG storage</div>
                            <span className="text-[9px] font-bold bg-warning/20 text-warning px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">Urgent</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Coordinate installation crew before May 14 to avoid storage surcharges.</div>
                    </div>
                </div>

                {/* Short-ship claim — expandable */}
                <div className="border border-border rounded-xl overflow-hidden bg-card">
                    <button
                        onClick={() => setClaimExpanded(v => !v)}
                        aria-expanded={claimExpanded}
                        aria-label="Short-ship claim details"
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/40 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" aria-hidden="true" />
                            <span className="text-[10px] font-bold text-foreground">Carton #34 · Short-ship claim filed</span>
                        </div>
                        {claimExpanded
                            ? <ChevronUp className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                            : <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                        }
                    </button>
                    {claimExpanded && (
                        <div id="claim-detail" className="px-3 pb-3 space-y-1.5 border-t border-border animate-in fade-in duration-200">
                            <div className="pt-2 text-[10px] text-muted-foreground space-y-1">
                                <div>Item: Line 24 · Chair Frame Assembly ×1</div>
                                <div>Claim: Omni #OM-2026-0412 · filed May 11</div>
                                <div>POD request sent to Andy (Herman Miller) · May 11 · 8:06 AM</div>
                                <div className="text-amber-600 dark:text-amber-400 font-medium">Status: awaiting response · excluded from this delivery</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Receiving report card */}
                <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-muted/20">
                        <FileText className="h-3 w-3 text-muted-foreground shrink-0" aria-hidden="true" />
                        <span className="text-[10px] font-bold text-foreground">Receiving Report · PMO-2026-0412</span>
                        <span className="text-[9px] text-muted-foreground ml-auto">RR-37577 · May 11</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2.5">
                        <span className="text-[10px] text-muted-foreground flex-1">34/35 cartons · Carton #34 missing</span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setReportExpanded(v => !v)}
                                aria-label={reportExpanded ? 'Close PDF preview' : 'Preview receiving report PDF'}
                                className="flex items-center gap-1 px-2 py-1 rounded border border-border text-[9px] text-muted-foreground hover:bg-muted/40 transition-colors"
                            >
                                <Expand className="h-2.5 w-2.5" aria-hidden="true" />
                                {reportExpanded ? 'Close' : 'Preview'}
                            </button>
                            <a
                                href="/docs/bfi/receiving/RR-37577-missing.pdf"
                                download="RR-37577-PMO-2026-0412.pdf"
                                aria-label="Download receiving report PDF"
                                className="flex items-center gap-1 px-2 py-1 rounded border border-border text-[9px] text-muted-foreground hover:bg-muted/40 transition-colors"
                            >
                                <Download className="h-2.5 w-2.5" aria-hidden="true" />
                                PDF
                            </a>
                        </div>
                    </div>
                    {reportExpanded && (
                        <div className="border-t border-border animate-in fade-in duration-200">
                            <iframe
                                src="/docs/bfi/receiving/RR-37577-missing.pdf"
                                className="w-full border-0"
                                style={{ height: 240 }}
                                title="Receiving Report PMO-2026-0412"
                            />
                        </div>
                    )}
                </div>

                {/* Before Strata */}
                <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Before Strata:</span> Lauren and Kate both reported that Walter was completely out of the loop until Lauren brought him a printed copy in person — always after the fact. BFI never spoke directly with Walter during the project.
                </div>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
            </div>

            {/* Fixed bottom action */}
            <div className="border-t border-border p-3 bg-card">
                {!confirmed ? (
                    <button
                        onClick={handleConfirm}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirm · scheduling installation crew
                    </button>
                ) : (
                    <div className="space-y-2 animate-in fade-in duration-300">
                        <div className="bg-success/5 border border-success/30 rounded-xl p-2.5 flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                            <div className="text-[11px]">
                                <div className="font-bold text-foreground">Crew confirmed · May 14–16</div>
                                <div className="text-muted-foreground text-[10px] mt-0.5">
                                    "Crew available May 14–16. Confirmed with NYC DOE agency."
                                </div>
                                <div className="text-muted-foreground text-[10px] mt-0.5">
                                    May 6 · 9:45 AM · loop closed without a phone call
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
