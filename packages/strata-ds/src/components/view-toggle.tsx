import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * ViewToggle — segmented icon toggle for switching between rendering modes.
 *
 * The canonical use is list-vs-grid view at the top of a data list (e.g. SIF
 * Generator, Inventory, Catalogs). Each option renders as an icon button; the
 * active option gets `bg-muted text-foreground`.
 *
 * Promoted from inbound-outbound (QuoteConverter list/grid switcher) and
 * UI-Dealer (Inventory). Generic over the option key type so consumers get
 * type-safe values.
 */

export interface ViewToggleOption<TValue extends string = string> {
  value: TValue;
  /** Lucide icon component (List, LayoutGrid, Rows, etc). */
  icon: LucideIcon;
  /** Accessible label — used as `aria-label` and tooltip. */
  label: string;
}

export interface ViewToggleProps<TValue extends string = string>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: ViewToggleOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  /** Visible size of the icon buttons. Default 'md'. */
  size?: 'sm' | 'md';
}

const SIZE_CLASSES: Record<NonNullable<ViewToggleProps['size']>, string> = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
};

const ICON_SIZES: Record<NonNullable<ViewToggleProps['size']>, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
};

export function ViewToggle<TValue extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
  ...rest
}: ViewToggleProps<TValue>) {
  return (
    <div
      role="group"
      className={cn(
        'inline-flex items-center rounded-lg border border-border overflow-hidden',
        className,
      )}
      {...rest}
    >
      {options.map((opt, i) => {
        const Icon = opt.icon;
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-label={opt.label}
            aria-pressed={isActive}
            title={opt.label}
            className={cn(
              SIZE_CLASSES[size],
              'inline-flex items-center justify-center transition-colors',
              i > 0 && 'border-l border-border',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/50',
            )}
          >
            <Icon className={ICON_SIZES[size]} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
