/**
 * COMPONENT: BOMTable
 * PURPOSE: Reusable BOM table with real MANATT data (71 lines + 13 CRs).
 *          Used by sc1.6 SelfAuditScene + sc1.7 PeerReviewScene + sc1.9 AckReviewScene
 *
 * Features:
 *   - Sticky header
 *   - Scroll vertical (max-h)
 *   - Subtotals per Tag (grouped by Alias 1)
 *   - 6 verification columns (Special · Quote # · Part # · Description · Qty · Price)
 *   - Per-row status (verified / warning / critical / pending)
 *   - Hover tooltip with statusReason
 *   - Click row to trigger CR lookup (if isSpecial)
 *
 * DS TOKENS: bg-card · bg-background · bg-muted · border-border · text-foreground ·
 *            text-muted-foreground · text-success · text-warning · text-destructive
 */

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Circle } from 'lucide-react'
import { MANATT_BOM_LINES, MANATT_TAGS, type BOMLine, type BOMLineStatus } from './manattOrderData'

interface Props {
    /** When set, filters lines to specific status (used by audit scene for "Issues only" view) */
    filterStatus?: BOMLineStatus
    /** Called when an isSpecial row is clicked — opens inline CR panel */
    onCRClick?: (line: BOMLine) => void
    /** Highlight a specific seq number */
    highlightSeq?: number
    /** Render in compact mode (no descriptions, just key columns) */
    compact?: boolean
}

function StatusIcon({ status }: { status?: BOMLineStatus }) {
    if (status === 'verified') return <CheckCircle2 className="h-4 w-4 text-success" />
    if (status === 'warning') return <AlertTriangle className="h-4 w-4 text-warning" />
    if (status === 'critical') return <AlertCircle className="h-4 w-4 text-destructive" />
    return <Circle className="h-4 w-4 text-muted-foreground" />
}

function statusLabel(s?: BOMLineStatus): string {
    if (s === 'verified') return 'Verified'
    if (s === 'warning') return 'Advisory'
    if (s === 'critical') return 'Critical'
    return 'Pending'
}

function statusBgClass(s?: BOMLineStatus): string {
    if (s === 'verified') return 'bg-success/5'
    if (s === 'warning') return 'bg-warning/5'
    if (s === 'critical') return 'bg-destructive/5'
    return ''
}

export default function BOMTable({ filterStatus, onCRClick, highlightSeq, compact = false }: Props) {
    const [expandedTooltipSeq, setExpandedTooltipSeq] = useState<number | null>(null)

    const lines = filterStatus
        ? MANATT_BOM_LINES.filter(l => l.status === filterStatus)
        : MANATT_BOM_LINES

    const linesByTag = new Map<number, BOMLine[]>()
    for (const line of lines) {
        if (!linesByTag.has(line.tag)) linesByTag.set(line.tag, [])
        linesByTag.get(line.tag)!.push(line)
    }

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-auto max-h-[600px]">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                            <th className="text-left px-3 py-2 font-medium w-8">✓</th>
                            <th className="text-left px-3 py-2 font-medium w-12">Seq</th>
                            <th className="text-left px-3 py-2 font-medium w-12">Spec</th>
                            <th className="text-left px-3 py-2 font-medium">Part #</th>
                            {!compact && <th className="text-left px-3 py-2 font-medium">Description</th>}
                            <th className="text-left px-3 py-2 font-medium">CR #</th>
                            <th className="text-right px-3 py-2 font-medium w-16">Qty</th>
                            <th className="text-right px-3 py-2 font-medium w-24">Unit List</th>
                            <th className="text-right px-3 py-2 font-medium w-24">Ext List</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MANATT_TAGS.map(tagInfo => {
                            const tagLines = linesByTag.get(tagInfo.tag) ?? []
                            if (tagLines.length === 0) return null
                            const tagSubtotal = tagLines.reduce((acc, l) => acc + l.extList, 0)
                            return (
                                <>
                                    <tr key={`tag-${tagInfo.tag}-header`} className="bg-muted/40 border-b border-border">
                                        <td colSpan={compact ? 8 : 9} className="px-3 py-2 text-xs font-semibold text-foreground">
                                            Tag {tagInfo.tag} · {tagInfo.field1} · {tagInfo.field2}
                                        </td>
                                    </tr>
                                    {tagLines.map(line => {
                                        const isHighlighted = highlightSeq === line.seq
                                        return (
                                            <tr
                                                key={`line-${line.seq}`}
                                                onClick={() => line.isSpecial && onCRClick?.(line)}
                                                onMouseEnter={() => setExpandedTooltipSeq(line.seq)}
                                                onMouseLeave={() => setExpandedTooltipSeq(null)}
                                                className={`border-b border-border/50 transition-colors ${statusBgClass(line.status)} ${
                                                    line.isSpecial ? 'cursor-pointer hover:bg-muted/40' : 'hover:bg-muted/20'
                                                } ${isHighlighted ? 'ring-2 ring-primary ring-inset' : ''}`}
                                            >
                                                <td className="px-3 py-2">
                                                    <span title={statusLabel(line.status)}>
                                                        <StatusIcon status={line.status} />
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-xs tabular-nums text-muted-foreground">
                                                    {String(line.seq).padStart(4, '0')}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {line.isSpecial && (
                                                        <span className="text-[10px] uppercase font-bold tracking-wider bg-warning/10 text-warning border border-warning/20 rounded px-1.5 py-0.5">
                                                            CR
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 font-mono text-xs text-foreground">{line.partNumber}</td>
                                                {!compact && (
                                                    <td className="px-3 py-2 text-foreground max-w-md">
                                                        <div className="truncate" title={line.description}>{line.description}</div>
                                                        {line.statusReason && expandedTooltipSeq === line.seq && (
                                                            <div className="text-xs text-warning mt-1 italic">{line.statusReason}</div>
                                                        )}
                                                    </td>
                                                )}
                                                <td className="px-3 py-2 text-xs font-mono">
                                                    {line.crNumber ? (
                                                        <span className="text-warning">{line.crNumber}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-right tabular-nums text-foreground">{line.quantity}</td>
                                                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                                                    ${line.unitList.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
                                                    ${line.extList.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    <tr key={`tag-${tagInfo.tag}-subtotal`} className="border-b-2 border-border bg-muted/20">
                                        <td colSpan={compact ? 7 : 8} className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                                            Tag {tagInfo.tag} subtotal
                                        </td>
                                        <td className="px-3 py-2 text-right text-sm font-semibold tabular-nums text-foreground">
                                            ${tagSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
