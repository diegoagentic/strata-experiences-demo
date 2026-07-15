/**
 * EditableLineTable<TRow> — Headless UI-compatible port of the canonical
 * DS EditableLineTable. No Radix dep; this is a near-direct copy of
 * Strata Design System/strata-ds/src/components/application-ui/editable-line-table.tsx
 * with only the `cn` import path changed.
 */

import * as React from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { cn } from '../utils/cn'

export interface EditingCell {
    rowKey: string
    columnKey: string
}

export interface EditableLineColumn<TRow> {
    key: string
    header: React.ReactNode
    cell: (row: TRow, rowIndex: number) => React.ReactNode
    onCommit?: (row: TRow, value: string) => void
    inputType?: 'text' | 'number'
    getEditValue?: (row: TRow) => string
    align?: 'left' | 'center' | 'right'
    width?: string
    headerHidden?: boolean
}

export interface EditableLineTableProps<TRow>
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
    rows: TRow[]
    columns: EditableLineColumn<TRow>[]
    getRowKey: (row: TRow, rowIndex: number) => string

    onAdd?: () => void
    addLabel?: string

    onRemove?: (row: TRow, rowIndex: number) => void

    showDragHandle?: boolean
    onMoveRow?: (fromIndex: number, toIndex: number) => void

    editingCell?: EditingCell | null
    onEditingCellChange?: (cell: EditingCell | null) => void

    footer?: React.ReactNode
    emptyState?: React.ReactNode

    title?: React.ReactNode
}

const ALIGN: Record<NonNullable<EditableLineColumn<unknown>['align']>, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
}

export function EditableLineTable<TRow>({
    rows,
    columns,
    getRowKey,
    onAdd,
    addLabel = 'Add row',
    onRemove,
    showDragHandle = false,
    editingCell: editingCellProp,
    onEditingCellChange,
    footer,
    emptyState,
    title,
    className,
    ...rest
}: EditableLineTableProps<TRow>) {
    const isControlled = editingCellProp !== undefined
    const [internalEditing, setInternalEditing] = React.useState<EditingCell | null>(
        null,
    )
    const editingCell = isControlled ? editingCellProp : internalEditing
    const setEditingCell = (cell: EditingCell | null) => {
        if (isControlled) onEditingCellChange?.(cell)
        else setInternalEditing(cell)
    }

    const totalCols =
        columns.length + (showDragHandle ? 1 : 0) + (onRemove ? 1 : 0)

    return (
        <div className={cn('space-y-3', className)} {...rest}>
            {(title || onAdd) && (
                <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {title}
                    </div>
                    {onAdd && (
                        <button
                            type="button"
                            onClick={onAdd}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-bold bg-foreground text-background hover:bg-foreground/90 transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" /> {addLabel}
                        </button>
                    )}
                </div>
            )}
            <div className="rounded-lg border border-border overflow-x-auto bg-card">
                <table className="min-w-full">
                    <thead className="border-b border-border">
                        <tr>
                            {showDragHandle && <th className="w-8 px-2 py-2.5" />}
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={cn(
                                        'px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground',
                                        ALIGN[col.align ?? 'left'],
                                        col.width,
                                    )}
                                >
                                    {col.headerHidden ? (
                                        <span className="sr-only">{col.header}</span>
                                    ) : (
                                        col.header
                                    )}
                                </th>
                            ))}
                            {onRemove && <th className="w-8 px-2 py-2.5" />}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={totalCols}
                                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                                >
                                    {emptyState ?? 'No items'}
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, rowIndex) => {
                                const rowKey = getRowKey(row, rowIndex)
                                return (
                                    <tr key={rowKey} className="group">
                                        {showDragHandle && (
                                            <td className="w-8 px-2 py-2 align-middle">
                                                <span
                                                    className="inline-flex items-center justify-center h-6 w-6 rounded text-muted-foreground/60 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                                                    aria-label="Drag to reorder"
                                                >
                                                    <GripVertical className="h-4 w-4" aria-hidden="true" />
                                                </span>
                                            </td>
                                        )}
                                        {columns.map((col) => {
                                            const isEditing =
                                                editingCell?.rowKey === rowKey &&
                                                editingCell?.columnKey === col.key
                                            const canEdit = !!col.onCommit
                                            return (
                                                <td
                                                    key={col.key}
                                                    className={cn(
                                                        'px-3 py-2 align-middle text-sm text-foreground',
                                                        ALIGN[col.align ?? 'left'],
                                                        canEdit && 'cursor-text',
                                                    )}
                                                    onClick={() => {
                                                        if (canEdit && !isEditing) {
                                                            setEditingCell({ rowKey, columnKey: col.key })
                                                        }
                                                    }}
                                                >
                                                    {isEditing && canEdit ? (
                                                        <EditableCellInput
                                                            initialValue={
                                                                col.getEditValue
                                                                    ? col.getEditValue(row)
                                                                    : String(col.cell(row, rowIndex) ?? '')
                                                            }
                                                            inputType={col.inputType ?? 'text'}
                                                            align={col.align ?? 'left'}
                                                            onCommit={(value) => {
                                                                col.onCommit?.(row, value)
                                                                setEditingCell(null)
                                                            }}
                                                            onCancel={() => setEditingCell(null)}
                                                        />
                                                    ) : (
                                                        col.cell(row, rowIndex)
                                                    )}
                                                </td>
                                            )
                                        })}
                                        {onRemove && (
                                            <td className="w-8 px-2 py-2 align-middle">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onRemove(row, rowIndex)
                                                    }}
                                                    aria-label="Remove row"
                                                    className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                    {footer && rows.length > 0 && (
                        <tfoot className="border-t border-border bg-muted/30">{footer}</tfoot>
                    )}
                </table>
            </div>
        </div>
    )
}

// ── Internal editable cell input ─────────────────────────────────────────

interface EditableCellInputProps {
    initialValue: string
    inputType: 'text' | 'number'
    align: 'left' | 'center' | 'right'
    onCommit: (value: string) => void
    onCancel: () => void
}

function EditableCellInput({
    initialValue,
    inputType,
    align,
    onCommit,
    onCancel,
}: EditableCellInputProps) {
    const [value, setValue] = React.useState(initialValue)
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
    }, [])

    return (
        <input
            ref={inputRef}
            type={inputType}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => onCommit(value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault()
                    onCommit(value)
                } else if (e.key === 'Escape') {
                    e.preventDefault()
                    onCancel()
                }
            }}
            className={cn(
                'w-full bg-background border border-primary/40 rounded px-1.5 py-0.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30',
                ALIGN[align],
                inputType === 'number' && 'tabular-nums',
            )}
        />
    )
}
