import * as React from 'react';
import { cn } from '../utils/cn';

/**
 * DataListTable — typed table wrapper for list-style data views.
 *
 * Sits on top of the DS Table primitive but adds:
 *   - Typed `columns` config with `cell(row)` render functions
 *   - Per-row click handler with cursor-pointer + hover background
 *   - Empty state slot
 *   - Optional caption row for column groups
 *
 * Consolidates the table shape repeated in inbound-outbound's
 * QuoteConverter / Officeworks / BFI list views, smart-comparator's
 * Transactions, expert-hub's Inventory + Transactions + Catalogs. Each
 * project was reinventing the same Tailwind <table> + thead + tbody +
 * divide-y arrangement.
 */

export interface ColumnDef<TRow> {
  /** Unique column key. */
  key: string;
  /** Header text or node. */
  header: React.ReactNode;
  /** Cell render. Receives the row. */
  cell: (row: TRow, rowIndex: number) => React.ReactNode;
  /** Optional cell alignment. */
  align?: 'left' | 'center' | 'right';
  /** Tailwind width hint (e.g. 'w-10', 'w-48'). */
  width?: string;
  /** Optional header className override. */
  headerClassName?: string;
  /** Optional cell className override. */
  cellClassName?: string;
}

export interface DataListTableProps<TRow>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  rows: TRow[];
  columns: ColumnDef<TRow>[];
  getRowKey: (row: TRow, rowIndex: number) => string;
  onRowClick?: (row: TRow, rowIndex: number) => void;
  /** Disable click + hover on individual rows by returning true. */
  isRowDisabled?: (row: TRow) => boolean;
  /** Visible when `rows.length === 0`. */
  emptyState?: React.ReactNode;
}

const ALIGN_CLASSES: Record<NonNullable<ColumnDef<unknown>['align']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function DataListTable<TRow>({
  rows,
  columns,
  getRowKey,
  onRowClick,
  isRowDisabled,
  emptyState,
  className,
  ...rest
}: DataListTableProps<TRow>) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-xl border border-border bg-card',
        className,
      )}
      {...rest}
    >
      <table className="min-w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground',
                  ALIGN_CLASSES[col.align ?? 'left'],
                  col.width,
                  col.headerClassName,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                {emptyState ?? 'No items'}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => {
              const disabled = isRowDisabled?.(row) ?? false;
              const clickable = !!onRowClick && !disabled;
              return (
                <tr
                  key={getRowKey(row, rowIndex)}
                  onClick={
                    clickable ? () => onRowClick?.(row, rowIndex) : undefined
                  }
                  className={cn(
                    'transition-colors',
                    clickable
                      ? 'cursor-pointer hover:bg-muted/30'
                      : 'cursor-default',
                    disabled && 'opacity-60',
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-foreground',
                        ALIGN_CLASSES[col.align ?? 'left'],
                        col.cellClassName,
                      )}
                    >
                      {col.cell(row, rowIndex)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
