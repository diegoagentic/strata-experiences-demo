import * as React from 'react';
import { cn } from '../utils/cn';

/**
 * PageShell — page-level layout wrapper with consistent title row + body slot.
 *
 * Consolidates the per-profile shells duplicated across the app:
 *  · `src/features/leland/components/LelandPageShell.tsx`
 *  · `src/components/mbi/MBIPageShell.tsx`
 *  · `src/components/bfi/BFIPage.tsx` shell wrapper
 *  · `src/components/officeworks/OfficeworksPage.tsx` shell wrapper
 *
 * Every experience gets the same header treatment: tenant crumb + title +
 * subtitle + iconed tone pill + right-aligned actions slot. The body slot
 * (`children`) is caller-owned.
 *
 * ─── Relation to the canonical DS ─────────────────────────────────────
 * The canonical DS ships `PageLayout` + `Layout` (both hard-wired to the
 * ExperiencesNavbar sidebar), and `PageHeader` (only heading + subheading,
 * no icon/crumb/actions). Nothing standalone exists for pages that render
 * *without* the full sidebar shell (like demo canvases).
 * Candidate to promote to `Strata Design System/src/components/application-ui/
 * page-shell.tsx` alongside PageLayout.
 */

export type PageShellIconTone = 'brand' | 'success' | 'warning' | 'ai' | 'info' | 'danger' | 'neutral';

export interface PageShellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    /** Page title (ex: "PO Workspace"). */
    title: React.ReactNode;
    /** Optional 1-line description under the title. */
    subtitle?: React.ReactNode;
    /** Optional Lucide icon rendered in the tone pill. */
    icon?: React.ReactNode;
    iconTone?: PageShellIconTone;
    /** Small uppercase crumb rendered above the title (ex: "LF · Strata for Leland"). */
    tenantCrumb?: React.ReactNode;
    /** Right-aligned actions (buttons, chips). */
    actions?: React.ReactNode;
    /** Max content width — matches Tailwind max-w-* tokens. */
    maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
    /** Top padding — accounts for a floating navbar (default fits the shared Navbar). */
    topPadding?: 'none' | 'md' | 'lg';
}

const TONE: Record<PageShellIconTone, string> = {
    brand:   'bg-primary text-primary-foreground',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    ai:      'bg-ai/10 text-ai',
    info:    'bg-info/10 text-info',
    danger:  'bg-destructive/10 text-destructive',
    neutral: 'bg-muted text-muted-foreground',
};

const MAX_WIDTH: Record<NonNullable<PageShellProps['maxWidth']>, string> = {
    md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl',
    '2xl': 'max-w-2xl', '3xl': 'max-w-3xl', '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl', '6xl': 'max-w-6xl', '7xl': 'max-w-7xl',
    full: 'max-w-full',
};

const TOP_PAD: Record<NonNullable<PageShellProps['topPadding']>, string> = {
    none: 'pt-4',
    md:   'pt-16',
    lg:   'pt-24',
};

export function PageShell({
    title,
    subtitle,
    icon,
    iconTone = 'brand',
    tenantCrumb,
    actions,
    maxWidth = '7xl',
    topPadding = 'lg',
    className,
    children,
    ...rest
}: PageShellProps) {
    return (
        <div className={cn('min-h-screen bg-background px-4 pb-20', TOP_PAD[topPadding], className)} {...rest}>
            <div className={cn('mx-auto space-y-6', MAX_WIDTH[maxWidth])}>
                {/* Title row */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-3 min-w-0">
                        {icon && (
                            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', TONE[iconTone])}>
                                {icon}
                            </div>
                        )}
                        <div className="min-w-0">
                            {tenantCrumb && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {tenantCrumb}
                                </div>
                            )}
                            <h1 className="text-2xl font-bold text-foreground leading-tight truncate">{title}</h1>
                            {subtitle && (
                                <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
                </div>

                {/* Body */}
                {children}
            </div>
        </div>
    );
}
