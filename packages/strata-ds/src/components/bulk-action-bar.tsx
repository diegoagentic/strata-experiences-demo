import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * BulkActionBar — sticky / inline action bar that appears when one or more
 * list rows are selected. Centralises the "5 documents selected · Export ·
 * Archive · Delete" pattern that today is inline-duplicated across
 * Transactions / Inventory / Orders / Documents views.
 *
 * Pluralisation is data-driven via `itemNoun`; consumers can also override
 * the entire selection summary node via `summary`.
 */

export interface BulkActionBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  selectedCount: number;
  /** Singular noun, pluralised by appending "s" when selectedCount !== 1. */
  itemNoun?: string;
  /** Plural noun override (used verbatim when selectedCount !== 1). */
  itemNounPlural?: string;

  /** Override the entire selection summary node. */
  summary?: React.ReactNode;

  /** Action buttons / nodes rendered to the right. */
  actions?: React.ReactNode;

  /** When provided, renders an "X" clear button. */
  onClearSelection?: () => void;
  clearLabel?: string;

  /** When true, sits at the bottom as a floating bar. */
  floating?: boolean;

  /** Hide the bar when 0 items are selected (default true). */
  hideWhenEmpty?: boolean;
}

export function BulkActionBar({
  selectedCount,
  itemNoun = 'item',
  itemNounPlural,
  summary,
  actions,
  onClearSelection,
  clearLabel = 'Clear selection',
  floating = false,
  hideWhenEmpty = true,
  className,
  ...rest
}: BulkActionBarProps) {
  if (hideWhenEmpty && selectedCount <= 0) return null;

  const plural = itemNounPlural ?? `${itemNoun}s`;
  const noun = selectedCount === 1 ? itemNoun : plural;

  return (
    <div
      role="region"
      aria-label={`${selectedCount} ${noun} selected`}
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-2.5 shadow-sm',
        floating &&
          'fixed left-1/2 bottom-6 -translate-x-1/2 z-40 shadow-2xl bg-foreground text-background border-foreground/10',
        className,
      )}
      {...rest}
    >
      <div className="flex items-center gap-3 min-w-0">
        {onClearSelection && (
          <button
            type="button"
            onClick={onClearSelection}
            aria-label={clearLabel}
            className={cn(
              'inline-flex items-center justify-center h-6 w-6 rounded-md transition-colors',
              floating
                ? 'text-background/70 hover:text-background hover:bg-background/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
        <span
          className={cn(
            'text-sm font-medium tabular-nums',
            floating ? 'text-background' : 'text-foreground',
          )}
        >
          {summary ?? (
            <>
              <span className="font-bold">{selectedCount}</span> {noun} selected
            </>
          )}
        </span>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
