/**
 * COMPONENT: QuoteVendorUploadScene
 * PURPOSE: Flow 3 · Scene 2 — Manual vendor quote upload.
 *          Drop a vendor quote PDF → Strata reads it automatically →
 *          Non-catalog validator highlights the flagged item + vendor quote demo.
 *
 * USED BY: MBIQuotesPage (wizard scene 1, between AI validation and GP review)
 */

import { useState, useRef } from 'react'
import {
    Upload, FileText, Sparkles, Search, AlertTriangle,
    CheckCircle2, ChevronRight, Package, X, Loader2,
} from 'lucide-react'
import NonCatalogValidatorTable from './NonCatalogValidatorTable'
import NonCatalogVendorQuoteDemo from './NonCatalogVendorQuoteDemo'
import MBIDetailSheet from './MBIDetailSheet'
import DataSourcesBar, { SOURCES } from './DataSourcesBar'

type UploadPhase = 'idle' | 'uploading' | 'ready'

const MOCK_FILE = 'BluDot_VendorQuote_Apr2026.pdf'

export default function QuoteVendorUploadScene() {
    const [phase, setPhase] = useState<UploadPhase>('idle')
    const [isDragOver, setIsDragOver] = useState(false)
    const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set())
    const [tableOpen, setTableOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const flaggedCount = resolvedIds.has('NC-004') ? 0 : 1

    const triggerUpload = () => {
        if (phase !== 'idle') return
        setPhase('uploading')
        setTimeout(() => setPhase('ready'), 1800)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        triggerUpload()
    }

    return (
        <div className="space-y-4">

            {/* Intro */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Vendor quote upload — Strata reads it for you</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        The non-catalog validator flagged a pricing gap on NC-004. Upload the vendor's quote PDF and Strata extracts SKU, unit price, lead time, and MOQ — no manual re-entry.
                    </div>
                </div>
            </div>

            {/* Upload zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`rounded-2xl border-2 border-dashed transition-all ${
                    phase === 'ready'
                        ? 'border-success/40 bg-success/5 dark:bg-success/10'
                        : isDragOver
                            ? 'border-primary/60 bg-primary/5 dark:bg-primary/10 scale-[1.01]'
                            : phase === 'uploading'
                                ? 'border-ai/40 bg-ai/5 dark:bg-ai/10'
                                : 'border-border bg-card dark:bg-zinc-800 hover:border-primary/40 hover:bg-primary/5'
                }`}
            >
                {phase === 'idle' && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-8 text-center">
                        <div className="h-12 w-12 rounded-2xl bg-muted/60 dark:bg-zinc-700 flex items-center justify-center">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-foreground">Drop vendor quote here</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">PDF · Excel · or any format from your manufacturer</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={triggerUpload}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                Upload quote
                            </button>
                            <button
                                onClick={triggerUpload}
                                className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                            >
                                or use demo file · {MOCK_FILE}
                            </button>
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.xlsx,.csv" />
                    </div>
                )}

                {phase === 'uploading' && (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-8 text-center">
                        <div className="h-12 w-12 rounded-2xl bg-ai/10 flex items-center justify-center">
                            <Loader2 className="h-5 w-5 text-ai animate-spin" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-foreground">Strata is reading the quote…</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">Extracting SKU · unit price · lead time · MOQ</div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-ai font-semibold">
                            <FileText className="h-3.5 w-3.5" />
                            {MOCK_FILE}
                        </div>
                    </div>
                )}

                {phase === 'ready' && (
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="h-9 w-9 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-foreground">{MOCK_FILE}</div>
                            <div className="text-[10px] text-success font-semibold mt-0.5">Quote read · data extracted · ready for review</div>
                        </div>
                        <button
                            onClick={() => setPhase('idle')}
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                            title="Remove file"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Non-catalog validator + vendor quote demo (visible once uploaded) */}
            {phase === 'ready' && (
                <>
                    <div className={`rounded-2xl border overflow-hidden transition-colors ${
                        flaggedCount > 0
                            ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/40 dark:bg-amber-500/5'
                            : 'border-success/30 bg-success/5 dark:bg-success/10'
                    }`}>
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-inherit flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                flaggedCount > 0
                                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                    : 'bg-success/15 text-success'
                            }`}>
                                <Search className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-foreground">Non-catalog validator</span>
                                    {flaggedCount > 0 ? (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                            <AlertTriangle className="h-2.5 w-2.5" />
                                            1 item needs resolution
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-success/15 text-success uppercase tracking-wider">
                                            <CheckCircle2 className="h-2.5 w-2.5" />
                                            All resolved
                                        </span>
                                    )}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                    80–90% of MBI spec sheets have manual items · Strata cross-checks against mfg price books
                                </div>
                            </div>
                            <button
                                onClick={() => setTableOpen(true)}
                                className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                            >
                                View all 5
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {/* Flagged item */}
                        <div className="px-4 py-3">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-bold text-foreground">NC-004 · BluDot Frame side table · walnut</span>
                                        <span className="text-[10px] font-mono text-muted-foreground">BluDot · Qty 8</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="text-[11px] text-muted-foreground">Quoted <strong className="text-foreground">$380/u</strong></span>
                                        <span className="text-muted-foreground/40">→</span>
                                        <span className="text-[11px] text-muted-foreground">Price book <strong className="text-foreground">$445/u</strong></span>
                                        {flaggedCount > 0 && (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400">
                                                <AlertTriangle className="h-2.5 w-2.5" />
                                                −$65/u · vendor quote needed
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {flaggedCount > 0 && (
                                <NonCatalogVendorQuoteDemo onResolved={() => setResolvedIds(prev => new Set([...prev, 'NC-004']))} />
                            )}

                            {flaggedCount === 0 && (
                                <div className="mt-2 text-[11px] text-success font-semibold">
                                    Vendor quote accepted · $445/u confirmed · SIF entry updated · $3,560 total
                                </div>
                            )}
                        </div>
                    </div>

                    <DataSourcesBar groups={[
                        { sources: [SOURCES.MFR_BOOKS, SOURCES.SPEC_DB] },
                        { sources: [SOURCES.STRATA_AI] },
                    ]} />
                </>
            )}

            {/* Detail sheet */}
            <MBIDetailSheet
                isOpen={tableOpen}
                onClose={() => setTableOpen(false)}
                title="Non-catalog item validator"
                subtitle="Strata cross-checks manual items against manufacturer price books + historical projects"
                icon={<Package className="h-4 w-4" />}
                width="lg"
            >
                <NonCatalogValidatorTable resolvedIds={resolvedIds} />
            </MBIDetailSheet>
        </div>
    )
}
