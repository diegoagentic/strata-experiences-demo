/**
 * COMPONENT: AlertClaimScene  (r1.4)
 * PURPOSE: Product Receiving step 4 — missing carton detected.
 *          Lauren sends POD request to Andy (Herman Miller).
 *          Depending on Andy's response: Workplace investigation OR Omni claim.
 *
 * States: 'alert' → 'awaiting' → 'resolution'
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { AlertTriangle, Mail, FileWarning, CheckCircle2, ChevronRight, X, GitBranch, Clock } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import ReceivingProcessBar from './ReceivingProcessBar'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import EmailMetadataBlock from './EmailMetadataBlock'

interface AlertClaimSceneProps {
    onProceed?: () => void
}

type AlertPhase = 'alert' | 'awaiting' | 'resolution'

const POD_DRAFT = `Hi Andy,

We're reviewing PMO-2026-0412 and Carton #34 did not arrive at the WIG dock.

Line 24 — Chair Frame Assembly ×1 is missing from the Bingo Sheet.

Can you confirm the shipment and share the Proof of Delivery (POD)?

— Lauren D., BFI Furniture`

const CLAIM_REASONS = [
    'Short shipped — carton not received at warehouse',
    'Damaged in transit',
    'Wrong item shipped',
    'Missing from bingo sheet — not shipped',
    'Other',
]

const CLAIM_FIELDS = [
    { label: 'PMO Number',   value: 'PMO-2026-0412' },
    { label: 'Claim Type',   value: 'Short Shipped'  },
    { label: 'Warehouse',    value: 'WIG New Jersey'  },
    { label: 'Bingo Number', value: '#34'             },
    { label: 'Line',         value: 'Line 24'         },
    { label: 'Item',         value: 'Chair Frame Assembly ×1' },
    { label: 'Vendor',       value: 'Herman Miller'   },
    { label: 'Carrier',      value: 'ALTL'            },
]

export default function AlertClaimScene({ onProceed }: AlertClaimSceneProps) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [phase, setPhase] = useState<AlertPhase>('alert')
    const [showPOD, setShowPOD]         = useState(false)
    const [showClaim, setShowClaim]     = useState(false)
    const [podSending, setPodSending]   = useState(false)
    const [claimed, setClaimed]         = useState(false)
    const [submitting, setSubmitting]   = useState(false)
    const [claimReason, setClaimReason] = useState(CLAIM_REASONS[0])
    const [claimNotes, setClaimNotes]   = useState('')

    // POD email metadata · editable via EmailMetadataBlock toggle
    const [podFrom,    setPodFrom]    = useState('lauren.demarco@bfifurniture.com')
    const [podTo,      setPodTo]      = useState('andy@hermanmiller.com')
    const [podSubject, setPodSubject] = useState('Missing carton alert — PMO-2026-0412 · Bingo #34')
    const [podBody,    setPodBody]    = useState(POD_DRAFT)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleSendPOD = () => {
        setPodSending(true)
        setTimeout(pauseAware(() => {
            setPodSending(false)
            setShowPOD(false)
            setPhase('awaiting')
            setTimeout(pauseAware(() => setPhase('resolution')), 1500)
        }), 600)
    }

    const handleSubmitClaim = () => {
        setSubmitting(true)
        setTimeout(pauseAware(() => {
            setClaimed(true)
            setSubmitting(false)
            setShowClaim(false)
        }), 600)
    }

    return (
        <div className="space-y-4">
            <ReceivingProcessBar stepId="r1.4" />

            {/* Alert banner — always visible */}
            <div className="bg-destructive/5 border border-destructive/40 rounded-xl px-3.5 py-3 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-destructive text-sm">Missing: Carton #34</div>
                    <div className="text-foreground mt-0.5">Line 24 · Chair Frame Assembly ×1 · short-shipped at origin</div>
                    <div className="text-muted-foreground mt-1 text-[11px]">PMO-2026-0412 · WIG New Jersey · detected by AI analysis</div>
                </div>
            </div>

            {/* Phase: alert — two-path context + POD CTA */}
            {phase === 'alert' && (
                <>
                    {/* Two-path context */}
                    <div className="bg-muted/40 border border-border rounded-xl px-3.5 py-3 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                            <GitBranch className="h-3 w-3" />
                            Two possible paths depending on Andy's response
                        </div>
                        <div className="space-y-1.5 text-[11px] text-muted-foreground">
                            <div className="flex items-start gap-2">
                                <span className="text-warning font-bold shrink-0 mt-0.5">A</span>
                                <span><span className="text-foreground font-medium">Andy confirms shipped</span> → Workplace investigation — at what point was the carton lost in transit?</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-destructive font-bold shrink-0 mt-0.5">B</span>
                                <span><span className="text-foreground font-medium">Andy confirms not shipped</span> → Omni carrier claim — short-ship at origin, filed against Herman Miller.</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowPOD(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                    >
                        <Mail className="h-4 w-4" />
                        Send POD request to Andy
                    </button>
                </>
            )}

            {/* Phase: awaiting */}
            {phase === 'awaiting' && (
                <div className="bg-ai/5 border border-ai/20 rounded-xl px-3.5 py-3 flex items-center gap-2.5 animate-in fade-in duration-300">
                    <Clock className="h-4 w-4 text-ai shrink-0 animate-pulse" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">POD request sent to Andy (Herman Miller)</div>
                        <div className="text-muted-foreground mt-0.5">andy@hermanmiller.com · May 11 · 8:06 AM · waiting for response…</div>
                    </div>
                </div>
            )}

            {/* Phase: resolution — Andy's response + two-path cards */}
            {phase === 'resolution' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-0.5">
                        Andy O'Brien (Herman Miller) responded · 2 minutes ago
                    </div>

                    {/* Card A — Shipment confirmed (out of scope path) */}
                    <div className="bg-warning/5 border border-warning/30 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex items-start gap-2.5">
                            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <div className="text-xs font-bold text-foreground">Path A — "I have the BOL showing 35 cartons picked up."</div>
                                <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed italic">
                                    "Carton #34 was loaded. POD attached."
                                </div>
                            </div>
                        </div>
                        <div className="bg-muted/50 border border-border/60 rounded-lg px-3 py-2">
                            <div className="text-[10px] text-muted-foreground leading-relaxed">
                                <span className="font-medium text-foreground">→ Workplace investigation:</span> At what point was the carton lost in transit? Out of scope for this demo — investigation flow.
                            </div>
                        </div>
                        <button disabled className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground opacity-50 cursor-not-allowed">
                            Investigate with Workplace
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {/* Card B — Not shipped (demo path → Omni claim) */}
                    <div className="bg-destructive/5 border border-destructive/30 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex items-start gap-2.5">
                            <FileWarning className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <div className="text-xs font-bold text-foreground">Path B — "Carton #34 was not included in this shipment."</div>
                                <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed italic">
                                    "It was not packed. This is on us."
                                </div>
                            </div>
                        </div>
                        <div className="bg-muted/50 border border-border/60 rounded-lg px-3 py-2">
                            <div className="text-[10px] text-muted-foreground">
                                <span className="font-medium text-foreground">→ Omni carrier claim:</span> Short-ship at origin — claim against Herman Miller.
                            </div>
                        </div>

                        {!claimed ? (
                            <button
                                onClick={() => setShowClaim(true)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all"
                            >
                                <FileWarning className="h-3.5 w-3.5" />
                                Open Omni Claim
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 text-xs text-success font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                Claim #OM-2026-0412 filed
                            </div>
                        )}
                    </div>

                    {/* Proceed CTA — unlocks after claim filed */}
                    {claimed && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
                            <div className="bg-success/5 border border-success/30 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                <div className="text-xs">
                                    <div className="font-bold text-foreground">Both actions complete</div>
                                    <div className="text-muted-foreground">Andy notified · Omni claim #OM-2026-0412 filed · 34/35 cartons can proceed to CORE</div>
                                </div>
                            </div>
                            <button
                                onClick={() => onProceed?.()}
                                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                            >
                                Proceed to Core Entry
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Before Strata */}
            <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Before Strata:</span> Lauren manually drafted the email to Andy and separately filed the Omni claim by copying PMO and item details by hand. Both steps took 20–30 minutes combined and were error-prone.
                </p>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />

            {/* Modal — POD Request to Andy */}
            {showPOD && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 pl-[calc(320px+1.5rem)]">
                    <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
                            <div className="text-sm font-bold text-foreground">POD Request · Andy O'Brien · Herman Miller</div>
                            <button onClick={() => setShowPOD(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <EmailMetadataBlock
                                subject={{ value: podSubject, onChange: setPodSubject }}
                                fields={[
                                    { label: 'From', value: podFrom, onChange: setPodFrom },
                                    { label: 'To',   value: podTo,   onChange: setPodTo },
                                ]}
                            />
                            <textarea
                                value={podBody}
                                onChange={e => setPodBody(e.target.value)}
                                rows={10}
                                className="w-full text-xs text-foreground bg-card border border-border rounded-xl px-4 py-3 resize-y font-mono leading-relaxed focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPOD(false)}
                                    className="flex-1 text-sm font-semibold text-muted-foreground py-3 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendPOD}
                                    disabled={podSending}
                                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 transition-all"
                                >
                                    <Mail className="h-4 w-4" />
                                    {podSending ? 'Sending…' : 'Send POD Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal — Omni Claim */}
            {showClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 pl-[calc(320px+1.5rem)]">
                    <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
                            <div className="text-sm font-bold text-foreground">Omni Service Claim · Pre-filled</div>
                            <button onClick={() => setShowClaim(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
                            <div className="flex items-start gap-3 bg-destructive/5 border border-destructive/30 rounded-xl px-4 py-3">
                                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-xs font-bold text-destructive mb-0.5">Short-ship detected — AI bingo sheet analysis</div>
                                    <div className="text-xs text-foreground">
                                        Carton <span className="font-semibold">#34 (Bingo #34)</span> was not received at WIG New Jersey warehouse.
                                        Carrier ALTL delivered <span className="font-semibold">34 of 35</span> cartons on May 11.
                                    </div>
                                </div>
                            </div>
                            <div className="border border-border rounded-xl overflow-hidden">
                                {CLAIM_FIELDS.map((f, i) => (
                                    <div key={f.label} className={`flex items-center justify-between gap-3 px-4 py-2.5 ${i < CLAIM_FIELDS.length - 1 ? 'border-b border-border' : ''}`}>
                                        <span className="text-xs text-muted-foreground w-28 shrink-0">{f.label}</span>
                                        <span className="text-xs font-semibold text-foreground text-right">{f.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Claim Reason</label>
                                <select
                                    value={claimReason}
                                    onChange={e => setClaimReason(e.target.value)}
                                    className="w-full text-xs bg-muted/30 border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    {CLAIM_REASONS.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Notes <span className="normal-case font-normal">(optional)</span></label>
                                <textarea
                                    value={claimNotes}
                                    onChange={e => setClaimNotes(e.target.value)}
                                    placeholder="Add any additional details about the missing carton…"
                                    rows={2}
                                    className="w-full text-xs bg-muted/30 border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowClaim(false)}
                                    className="flex-1 text-sm font-semibold text-muted-foreground py-3 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitClaim}
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 transition-all"
                                >
                                    <FileWarning className="h-4 w-4" />
                                    {submitting ? 'Filing…' : 'Submit Claim'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
