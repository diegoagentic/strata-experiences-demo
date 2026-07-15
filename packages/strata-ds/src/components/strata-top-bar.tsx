import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * StrataTopBar — branded application top bar with leading / center / trailing slots.
 *
 * Visible in every Strata app (smart-comparator, inbound-outbound,
 * UI-Dealer, quote-converter): rounded pill with logo + tenant chip on the
 * left, an optional active mode pill in the center, and user/theme/notifications
 * on the right.
 *
 * Slot-based to avoid baking in specific contexts (useTenant, useAuth,
 * useDemo, etc) that each app provides differently. Consumers compose the
 * companion primitives `<TenantChip>` and `<ModePill>` or pass any content.
 */

export interface StrataTopBarProps extends React.HTMLAttributes<HTMLElement> {
  /** Left side: logo + tenant chip. */
  leading?: React.ReactNode;
  /** Centered content: active mode pill or section indicator. */
  center?: React.ReactNode;
  /** Right side: theme toggle, notifications, user menu, etc. */
  trailing?: React.ReactNode;
  /** Render the bar floating inside a max-width container with rounded shape. Default true. */
  floating?: boolean;
}

export function StrataTopBar({
  leading,
  center,
  trailing,
  floating = true,
  className,
  ...rest
}: StrataTopBarProps) {
  return (
    <header
      className={cn(
        'flex items-center gap-4 bg-card text-foreground',
        floating
          ? 'mx-auto max-w-[1400px] mt-3 mx-3 rounded-full border border-border shadow-sm px-5 py-2.5'
          : 'border-b border-border px-5 py-2.5',
        className,
      )}
      {...rest}
    >
      {leading && <div className="flex items-center gap-4 shrink-0">{leading}</div>}
      {center && (
        <div className="flex-1 flex items-center justify-center">{center}</div>
      )}
      {trailing && (
        <div className="flex items-center gap-3 shrink-0 ml-auto">{trailing}</div>
      )}
    </header>
  );
}

// ── Companion primitives ─────────────────────────────────────────────────

export interface TenantChipProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Small uppercase label above the name. */
  label?: string;
  /** Tenant name. */
  name: string;
}

/**
 * TenantChip — uppercase label + bold name. Used to the right of the logo
 * to indicate the current tenant / workspace context.
 */
export function TenantChip({ label = 'TENANT', name, className, ...rest }: TenantChipProps) {
  return (
    <div className={cn('leading-tight', className)} {...rest}>
      <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </div>
      <div className="text-sm font-bold text-foreground">{name}</div>
    </div>
  );
}

export interface ModePillProps extends React.HTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

/**
 * ModePill — active mode indicator that fits in the StrataTopBar center slot.
 * Active state uses bg-primary + text-primary-foreground. Renders as a button
 * so consumers can wire click behaviour (open menu, switch mode, etc).
 */
export function ModePill({
  icon: Icon,
  label,
  active = true,
  className,
  ...rest
}: ModePillProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-bold transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80',
        className,
      )}
      {...rest}
    >
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {label}
    </button>
  );
}
