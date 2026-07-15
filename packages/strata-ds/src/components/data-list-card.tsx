import * as React from 'react';
import { cn } from '../utils/cn';

/**
 * DataListCard — slot-based card for the grid view of a data list.
 *
 * Paired with DataListTable for list/grid switching at the top of the same
 * dataset. Where the table renders rows, this renders one card per item.
 *
 * Canonical layout (top → bottom):
 *   header   — file/avatar icon + title block + trailing badge or avatar
 *   rows     — list of label/value pairs (Filename, Line Items, etc.)
 *   footer   — date + status pill + inline actions
 *
 * All slots optional. Click handler + hover affordance built in.
 */

export interface DataListCardRow {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface DataListCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  /** Top section — typically file/avatar icon + title block + trailing badge or avatar. */
  header?: React.ReactNode;
  /** Body rows — label / value pairs rendered as a two-column grid. */
  rows?: DataListCardRow[];
  /** Bottom section — date + status pill + actions. */
  footer?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function DataListCard({
  header,
  rows,
  footer,
  onClick,
  disabled = false,
  className,
  children,
  ...rest
}: DataListCardProps) {
  const clickable = !!onClick && !disabled;
  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        'rounded-xl border border-border bg-card p-4 transition-all flex flex-col gap-3',
        clickable
          ? 'cursor-pointer hover:border-primary/40 hover:shadow-sm'
          : 'cursor-default',
        disabled && 'opacity-60',
        className,
      )}
      {...rest}
    >
      {header}
      {rows && rows.length > 0 && (
        <dl className="space-y-1.5">
          {rows.map((r, i) => (
            <div
              key={i}
              className="flex items-baseline justify-between gap-3 text-sm"
            >
              <dt className="text-muted-foreground">{r.label}</dt>
              <dd className="text-foreground font-medium text-right truncate">
                {r.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {children}
      {footer && (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * DataListCardGrid — convenience wrapper that arranges DataListCards in a
 * responsive grid (1 col mobile, 2 cols sm, 3 cols lg, 4 cols xl by default).
 */
export interface DataListCardGridProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Tailwind grid template — default 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'. */
  columns?: string;
}

export function DataListCardGrid({
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  className,
  children,
  ...rest
}: DataListCardGridProps) {
  return (
    <div className={cn('grid gap-3', columns, className)} {...rest}>
      {children}
    </div>
  );
}
