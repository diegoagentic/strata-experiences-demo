/**
 * SpecsExpandRow · Expandable specs cell (Asly N12)
 *
 * Replaces the always-visible specs inline (`configs.join(' · ')`) with a
 * collapsible row. Default closed (chevron leftmost) so the table density
 * stays manageable for Sara's screen-share demo.
 *
 * Specs supported: size · finish · edge · lock · fabric · frame · shelf
 */

import { ChevronRight, Maximize2 } from 'lucide-react'
import { useState } from 'react'

interface SpecsExpandRowProps {
    configs: string[]
    /** Extra specs not in the original `configs` array · injected for manufacturer demo. */
    extraSpecs?: Array<{ label: string; value: string }>
    /** Render mode: inline (current line) or block (under the description). */
    mode?: 'inline' | 'block'
}

function parseConfigs(configs: string[]): Array<{ label: string; value: string }> {
    return configs.map(c => {
        const [label, ...rest] = c.split(':')
        return { label: label.trim(), value: rest.join(':').trim() }
    })
}

export default function SpecsExpandRow({ configs, extraSpecs = [], mode = 'block' }: SpecsExpandRowProps) {
    const [open, setOpen] = useState(false)
    const parsed = parseConfigs(configs)
    const all = [...parsed, ...extraSpecs]
    const visible = open ? all : all.slice(0, 0)
    const previewSummary = all.map(s => s.value).slice(0, 2).join(' · ')

    return (
        <div className={mode === 'inline' ? 'inline-flex items-center gap-1' : 'mt-0.5'}>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    setOpen(v => !v)
                }}
                aria-expanded={open}
                aria-label={open ? 'Hide product specs' : 'Show product specs'}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 rounded"
            >
                <ChevronRight
                    className={`h-3 w-3 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
                    aria-hidden="true"
                />
                <span className="text-[11px] font-medium uppercase tracking-wider">
                    {open ? 'Specs' : `${all.length} specs`}
                </span>
                {!open && previewSummary && (
                    <span className="text-[11px] text-muted-foreground italic truncate max-w-[160px]">
                        · {previewSummary}
                    </span>
                )}
            </button>

            {open && (
                <div className="mt-2 ml-4 p-3 rounded-lg border border-border bg-muted/30 grid grid-cols-2 gap-x-4 gap-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {visible.length === 0 ? (
                        <div className="col-span-2 text-[11px] text-muted-foreground italic">No specs captured</div>
                    ) : (
                        visible.map((s, i) => (
                            <div key={`${s.label}-${i}`} className="flex items-baseline gap-2 text-[11px]">
                                <span className="text-muted-foreground uppercase tracking-wider font-medium min-w-[52px]">{s.label}</span>
                                <span className="text-foreground font-medium">{s.value}</span>
                            </div>
                        ))
                    )}
                    {visible.length > 0 && (
                        <div className="col-span-2 mt-1 pt-1 border-t border-border flex items-center gap-1 text-[10px] text-muted-foreground italic">
                            <Maximize2 className="h-2.5 w-2.5" aria-hidden="true" />
                            captured from RFQ + AI inference
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
