/**
 * COMPONENT: SIFParserPreview
 * PURPOSE: Animated file-to-structure extraction panel for the Budget Builder
 *          parsing step. Left = SIF file tree view; right = extracted fields
 *          appear line-by-line with stagger. Progress bar at top.
 *
 * PROPS:
 *   - sif: SIFSample                 — the parsed source file (uses mock data)
 *   - animate?: boolean              — autoplay animation on mount (default true)
 *   - stagger?: number               — ms between each extracted line (default 120)
 *
 * STATES:
 *   - extractedCount: number         — how many line items are revealed so far
 *   - progress: 0-100                — parsing progress %
 *
 * DS TOKENS: bg-card · border-border · rounded-2xl · text-foreground
 *            · text-ai for AI/parser accents · bg-primary for progress bar
 *
 * USED BY: ParsingStep (wizard step 1 · demo tour m1.2)
 */

import { useEffect, useState } from 'react'
import { FileCode2, Sparkles, ChevronRight } from 'lucide-react'
import type { SIFSample } from '../../config/profiles/mbi-data'
import { usePauseAware } from '../../context/usePauseAware'

interface SIFParserPreviewProps {
    sif: SIFSample
    animate?: boolean
    stagger?: number
}

export default function SIFParserPreview({ sif, animate = true, stagger = 120 }: SIFParserPreviewProps) {
    const [extractedCount, setExtractedCount] = useState(animate ? 0 : sif.lineItems.length)

    const { pausedRef } = usePauseAware()
    useEffect(() => {
        if (!animate) return
        setExtractedCount(0)
        let i = 0
        const interval = setInterval(() => {
            if (pausedRef.current) return
            i++
            setExtractedCount(i)
            if (i >= sif.lineItems.length) clearInterval(interval)
        }, stagger)
        return () => clearInterval(interval)
    }, [sif.id, animate, stagger, sif.lineItems.length, pausedRef])

    const progress = Math.round((extractedCount / sif.lineItems.length) * 100)
    const isComplete = extractedCount >= sif.lineItems.length

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            {/* Header with progress */}
            <div className="px-4 py-3 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-ai/10 text-ai flex items-center justify-center">
                            <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-foreground">SIF Parser · {sif.fileName}</div>
                            <div className="text-[10px] text-muted-foreground">CET v{sif.cetVersion} · {sif.fieldCount} fields detected</div>
                        </div>
                    </div>
                    <div className="text-xs font-bold text-foreground tabular-nums">{progress}%</div>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-200 ${isComplete ? 'bg-success' : 'bg-ai'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Two-column body */}
            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border">
                {/* Left — SIF tree preview (2/5 cols) */}
                <div className="md:col-span-2 p-4 bg-muted/10">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">SIF source</div>
                    <div className="font-mono text-[11px] text-muted-foreground space-y-0.5 leading-relaxed">
                        <div className="text-foreground font-bold">&lt;sif-export&gt;</div>
                        <div>&nbsp;&nbsp;&lt;header&gt;</div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;&lt;cet-version&gt;{sif.cetVersion}&lt;/cet-version&gt;</div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;&lt;field-count&gt;{sif.fieldCount}&lt;/field-count&gt;</div>
                        <div>&nbsp;&nbsp;&lt;/header&gt;</div>
                        <div>&nbsp;&nbsp;&lt;line-items&gt;</div>
                        {sif.lineItems.slice(0, Math.min(extractedCount + 2, sif.lineItems.length)).map((item, i) => {
                            const isExtracted = i < extractedCount
                            const isActive = i === extractedCount - 1
                            return (
                                <div
                                    key={i}
                                    className={`
                                        px-1 rounded transition-colors
                                        ${isActive ? 'bg-ai/10 text-ai' : ''}
                                        ${isExtracted && !isActive ? 'text-muted-foreground' : ''}
                                        ${!isExtracted ? 'text-muted-foreground/40' : ''}
                                    `}
                                >
                                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;item sku="{item.sku}" qty="{item.quantity}" /&gt;
                                </div>
                            )
                        })}
                        <div className={isComplete ? 'text-muted-foreground' : 'text-muted-foreground/40'}>&nbsp;&nbsp;&lt;/line-items&gt;</div>
                        <div className={`text-foreground font-bold ${isComplete ? '' : 'text-muted-foreground/40'}`}>&lt;/sif-export&gt;</div>
                    </div>
                </div>

                {/* Right — extracted fields (3/5 cols) */}
                <div className="md:col-span-3 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Extracted structured data</div>
                        <div className="text-[10px] font-bold text-muted-foreground tabular-nums">{extractedCount}/{sif.lineItems.length}</div>
                    </div>

                    <div className="space-y-1.5">
                        {sif.lineItems.slice(0, extractedCount).map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 bg-muted/50 dark:bg-zinc-900/40 border border-border rounded-lg px-3 py-2 text-xs animate-in fade-in slide-in-from-left-2 duration-300"
                            >
                                <FileCode2 className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="font-mono text-muted-foreground truncate w-20">{item.sku}</span>
                                <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="text-foreground truncate flex-1">{item.description}</span>
                                <span className="text-muted-foreground tabular-nums shrink-0">×{item.quantity}</span>
                                <span className="font-bold text-foreground tabular-nums shrink-0">${item.total.toLocaleString()}</span>
                            </div>
                        ))}

                        {/* Placeholder lines for items not yet extracted */}
                        {Array.from({ length: Math.max(0, sif.lineItems.length - extractedCount) }).map((_, i) => (
                            <div
                                key={`ph-${i}`}
                                className="flex items-center gap-2 bg-zinc-100/50 dark:bg-zinc-800/30 border border-dashed border-border/50 rounded-lg px-3 py-2 text-xs opacity-60"
                            >
                                <div className="h-3 w-3 rounded-sm bg-muted" />
                                <div className="h-2 bg-muted rounded w-20" />
                                <div className="h-2 bg-muted rounded flex-1" />
                                <div className="h-2 bg-muted rounded w-8" />
                            </div>
                        ))}
                    </div>

                    {isComplete && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-success bg-success/5 border border-success/20 rounded-lg px-3 py-2 animate-in fade-in duration-300">
                            <Sparkles className="h-3.5 w-3.5 shrink-0" />
                            <span>All {sif.lineItems.length} line items extracted · <strong>${sif.totals.grossValue.toLocaleString()}</strong> gross value</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
