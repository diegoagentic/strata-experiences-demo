/**
 * AckHeroMatchPanel · Surface ThreeWayMatchView + DiscrepancyResolver hero (C4)
 *
 * UN-CUTTABLE per committee consensus: this is THE magical AI moment for
 * Matt's Senator pitch (PO·ACK·Invoice 3-way match + AI resolver).
 *
 * Both source components are already in the project:
 *   - widgets/ThreeWayMatchView.tsx (canonical · in use by DealerMonitorKanban)
 *   - gen-ui/artifacts/DiscrepancyResolverArtifact.tsx (303 LOC · identical to smart-comparator)
 *
 * We wrap them in a normalized header + modal overlay so they read as one
 * coherent surface: "Reconciliation hub" → "Resolve" button → AI modal.
 *
 * Token-remap of source widgets is OUT OF SCOPE for this wrapper (would affect
 * other profiles). Only the wrapper chrome uses semantic tokens.
 */

import { Fragment, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, Scale, Sparkles, ShieldAlert, Table2 } from 'lucide-react'
import ThreeWayMatchView, { type MatchLine } from '../widgets/ThreeWayMatchView'
import DiscrepancyResolverArtifact, { type DiscrepancyItem } from '../gen-ui/artifacts/DiscrepancyResolverArtifact'

interface AckHeroMatchPanelProps {
    orderId: string
}

const MOCK_LINES: MatchLine[] = [
    { lineItem: 'TBL, REC, 30Dx60Wx29H', sku: 'T-RCR306029HLG2', poValue: '$1,916.72', ackValue: '$1,916.72', invoiceValue: '$1,916.72', status: 'match' },
    { lineItem: 'CBX Full Depth BBF Ped', sku: 'X-BBFPFS182812', poValue: '$1,592.96', ackValue: '$1,592.96', invoiceValue: '$1,592.96', status: 'match' },
    { lineItem: 'WORKSURFACE RECT 30Dx72W', sku: 'W-WS3072', poValue: '$1,495.68', ackValue: '$1,495.68', invoiceValue: '$1,495.68', status: 'match' },
    { lineItem: 'LB LOUNGE 2 SEAT 34"H', sku: 'F-SSC346030C', poValue: 'Fabric: CF-6036 Ocean', ackValue: 'Fabric: CF-6021 Navy (substituted)', invoiceValue: 'pending', status: 'partial', delta: 'Catalog-equivalent fabric · same tier' },
    { lineItem: 'CBX Triple Door Locker', sku: 'X-LTD661218L', poValue: 'Qty 8 · $5,581.44', ackValue: 'Qty 6 · $4,186.08 (2 backordered ETA Nov 27)', invoiceValue: '$4,186.08', status: 'mismatch', delta: '2 units short · $1,395.36' },
    { lineItem: 'AUBURN GRAY CONFERENCE CHAIR', sku: '7730', poValue: '$5,659.20', ackValue: '$5,659.20', invoiceValue: '$5,659.20', status: 'match' },
]

const MOCK_DISCREPANCIES: DiscrepancyItem[] = [
    {
        id: 'disc-001',
        type: 'line_item',
        title: 'Fabric substitution · LB LOUNGE',
        description: 'Original CF-6036 Ocean Blue is backordered. Manufacturer proposes CF-6021 Navy (catalog-equivalent, same price tier).',
        severity: 'medium',
        original: { label: 'PO Specification', value: 'CF-6036 Ocean Blue', subText: '2 units · F-SSC346030C' },
        suggestion: {
            label: 'Manufacturer Substitution',
            value: 'CF-6021 Navy',
            subText: 'In stock · same tier · same price $2,031.12/unit',
            reason: 'AI cross-referenced fabric catalog · same grade (Tier B) · same price · 0-day lead time vs 14-day for original.',
            confidence: 91,
        },
    },
    {
        id: 'disc-002',
        type: 'line_item',
        title: 'Quantity shortfall · Triple Door Locker',
        description: '8 units ordered · 6 ack confirmed · 2 backordered with ETA Nov 27.',
        severity: 'high',
        original: { label: 'PO Quantity', value: '8 units · $5,581.44', subText: 'X-LTD661218L · LG2 finish' },
        suggestion: {
            label: 'Manufacturer Ack',
            value: '6 + 2 backorder',
            subText: 'Ship 6 now ($4,186.08) · ship balance 2 on Nov 27 ($1,395.36)',
            reason: 'Production capacity confirms 6 ready. Backordered 2 enter next line slot · 27-day delay flagged for client approval.',
            confidence: 76,
        },
    },
]

export default function AckHeroMatchPanel({ orderId }: AckHeroMatchPanelProps) {
    const [resolverOpen, setResolverOpen] = useState(false)
    // User feedback (2026-06-05 browser smoke): the reconciliation table was taking too much vertical space
    // on Ack detail. Converted to a quick action that opens the table as a modal so the hero card stays compact.
    const [matchViewOpen, setMatchViewOpen] = useState(false)
    const [issues, setIssues] = useState<DiscrepancyItem[]>(MOCK_DISCREPANCIES)
    const [resolvedCount, setResolvedCount] = useState(0)

    const handleResolve = (id: string) => {
        setIssues(prev => prev.filter(i => i.id !== id))
        setResolvedCount(n => n + 1)
    }

    const exceptionCount = MOCK_LINES.filter(l => l.status !== 'match').length
    const allResolved = issues.length === 0 && resolvedCount > 0

    return (
        <section aria-labelledby="ack-hero-match" className="space-y-3">
            <header className="rounded-xl border border-ai/30 bg-ai/5 px-5 py-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-ai/10 flex items-center justify-center shrink-0">
                    <Scale className="h-4 w-4 text-ai" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 id="ack-hero-match" className="text-sm font-bold text-foreground flex items-center gap-2 flex-wrap">
                        {/* Post-Neocon-review (2026-06-05) · PDF #7 + L.8: it's actually a 2-way match
                            (PO vs Ack); Invoice belongs to the Orders/Invoiced stage. */}
                        PO vs Acknowledgement · Reconciliation
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-ai/15 text-ai border border-ai/30">
                            <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                            Strata AI
                        </span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        PO vs Acknowledgement · {MOCK_LINES.length} lines · {exceptionCount} exception{exceptionCount === 1 ? '' : 's'} · DiscrepancyDetector pre-analyzed both
                    </p>
                </div>
                {/* Quick actions row · View reconciliation table (modal) + Notify dealer.
                    Both right-aligned so the hero card stays compact (browser-smoke 2026-06-05). */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => setMatchViewOpen(true)}
                        title="Open the PO vs Acknowledgement line-by-line reconciliation table"
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[11px] font-bold border border-border bg-card text-foreground hover:bg-muted/50 hover:border-info/40 transition-colors whitespace-nowrap"
                    >
                        <Table2 className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                        View reconciliation table
                    </button>
                    {/* Post-Neocon-review · L.16.b + L.19: manufacturer DETECTS, doesn't RESOLVE.
                        "Resolve N exceptions" CTA replaced by "Notify dealer of N exceptions"
                        so the action matches Wendy 41:16 + Christian 38:01 (dealer resolves externally). */}
                    {exceptionCount > 0 && !allResolved && (
                        <button
                            type="button"
                            onClick={() => setResolverOpen(true)}
                            title="Notify dealer of detected exceptions · drafts an email per exception"
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
                        >
                            <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                            Notify dealer of {issues.length} exception{issues.length === 1 ? '' : 's'}
                        </button>
                    )}
                    {allResolved && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-success/10 text-success border border-success/20">
                            All resolved · ready to ack
                        </span>
                    )}
                </div>
            </header>

            {/* Reconciliation table now lives inside a modal (browser-smoke 2026-06-05) so it doesn't dominate the page. */}

            {/* Reconciliation table modal · opens from the View reconciliation table chip.
                Keeps Ack detail compact while still surfacing the full per-line comparison on demand. */}
            <Transition appear show={matchViewOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setMatchViewOpen(false)}>
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="w-full max-w-4xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                                    <div className="px-5 py-3 border-b border-border bg-card flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-2">
                                            <Table2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                            <h3 className="text-sm font-bold text-foreground">PO vs Acknowledgement · Reconciliation</h3>
                                        </div>
                                        <button type="button" onClick={() => setMatchViewOpen(false)} aria-label="Close reconciliation table" className="h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                            <X className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4">
                                        <ThreeWayMatchView
                                            orderId={orderId}
                                            lines={MOCK_LINES}
                                            onResolve={() => { setMatchViewOpen(false); if (exceptionCount > 0 && !allResolved) setResolverOpen(true) }}
                                        />
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Resolver modal overlay · per Modal Normalization Spec */}
            <Transition appear show={resolverOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setResolverOpen(false)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-200"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-150"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="w-full max-w-3xl rounded-xl border border-border bg-card shadow-lg overflow-hidden flex flex-col max-h-[85vh]">
                                    <div className="px-5 py-4 border-b border-border bg-card flex items-start gap-3 shrink-0">
                                        <div className="h-9 w-9 rounded-lg bg-ai/10 flex items-center justify-center shrink-0">
                                            <ShieldAlert className="h-4 w-4 text-ai" aria-hidden="true" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-foreground">Resolve discrepancies · {orderId}</h3>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                AI suggests substitutions or escalations · you decide before commit
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setResolverOpen(false)}
                                            aria-label="Close resolver"
                                            className="shrink-0 h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                        >
                                            <X className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-5">
                                        {issues.length > 0 ? (
                                            <DiscrepancyResolverArtifact
                                                issues={issues}
                                                onResolve={(id) => handleResolve(id)}
                                                onClose={() => setResolverOpen(false)}
                                                title="Review Substitutions"
                                            />
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-success/10 mb-3">
                                                    <Sparkles className="h-6 w-6 text-success" aria-hidden="true" />
                                                </div>
                                                <p className="text-sm font-bold text-foreground">All exceptions resolved</p>
                                                <p className="text-xs text-muted-foreground mt-1">{resolvedCount} substitution{resolvedCount === 1 ? '' : 's'} accepted · ready to acknowledge</p>
                                            </div>
                                        )}
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </section>
    )
}
