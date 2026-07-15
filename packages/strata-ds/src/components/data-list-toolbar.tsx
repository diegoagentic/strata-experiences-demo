import * as React from 'react';
import { cn } from '../utils/cn';

/**
 * DataListToolbar — slot-based row that sits above a data list / table / grid.
 *
 * Canonical layout (left → right):
 *   [ search ][ viewToggle ][ filters ][ ─── flex spacer ─── ][ actions ]
 *
 * Each slot is optional. The search slot grows to fill space (max-md). The
 * actions slot is right-aligned. `filters` (e.g. checkbox "My Documents",
 * status menu) and `viewToggle` go between, in the order they're passed.
 *
 * Pattern observed in inbound-outbound (QuoteConverter, ManualUploadModal
 * list views), smart-comparator (Transactions), expert-hub (Inventory,
 * Transactions, Catalogs). Each consumer was reinventing the same flex
 * arrangement; this centralises it.
 */

export interface DataListToolbarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Search input — typically `<Input>` wrapped with a leading icon. */
  search?: React.ReactNode;
  /** View toggle (list/grid). Use `<ViewToggle>`. */
  viewToggle?: React.ReactNode;
  /** Inline filter controls — checkboxes, status menus, etc. */
  filters?: React.ReactNode;
  /** Primary action(s) — right-aligned. */
  actions?: React.ReactNode;
  /** Override how slots flex by setting `searchFlex={false}` to keep search compact. */
  searchFlex?: boolean;
}

export function DataListToolbar({
  search,
  viewToggle,
  filters,
  actions,
  searchFlex = true,
  className,
  children,
  ...rest
}: DataListToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3',
        className,
      )}
      {...rest}
    >
      {search && (
        <div
          className={cn(
            'min-w-[220px]',
            searchFlex ? 'flex-1 max-w-md' : '',
          )}
        >
          {search}
        </div>
      )}
      {viewToggle}
      {filters}
      {children}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}
