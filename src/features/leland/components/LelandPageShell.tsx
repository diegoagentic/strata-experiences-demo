/**
 * COMPONENT: LelandPageShell
 * PURPOSE: Shared shell for the 4 Leland demo apps (PO Workspace · Inbox ·
 *          Seradex · Review Queue). Provides consistent header + body layout
 *          + tenant context. Adapted from MBIPageShell.
 *
 * PROPS:
 *   - title: string                 — page title (e.g. "PO Workspace")
 *   - subtitle?: string             — optional 1-line description
 *   - icon?: ReactNode              — optional Lucide icon for the title
 *   - iconTone?: 'brand'|'blue'|'indigo'|'amber'  — icon background tone (per app)
 *   - actions?: ReactNode           — optional right-aligned actions
 *   - children: ReactNode           — page body
 *
 * DS TOKENS USED:
 *   - bg-background · text-foreground · text-muted-foreground
 *   - border-border · max-w-7xl · pt-24 px-4
 *   - Icon tone map: primary / info / warning · all via semantic tokens.
 *
 * USED BY: LelandStrataShell, LelandInboxApp, LelandSeradexApp, LelandReviewQueueApp
 */

import type { ReactNode } from 'react';
import { LELAND_TENANT } from '../../../config/profiles/leland-data';

interface LelandPageShellProps {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    iconTone?: 'brand' | 'info' | 'warning';
    actions?: ReactNode;
    children: ReactNode;
}

const TONE_CLASSES: Record<NonNullable<LelandPageShellProps['iconTone']>, string> = {
    brand: 'bg-primary text-primary-foreground',
    info: 'bg-info/10 text-info',
    warning: 'bg-warning/10 text-warning',
};

export default function LelandPageShell({
    title,
    subtitle,
    icon,
    iconTone = 'brand',
    actions,
    children,
}: LelandPageShellProps) {
    return (
        <div className="min-h-screen bg-background pt-24 px-4 pb-20">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page title row */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${TONE_CLASSES[iconTone]}`}>
                                {icon}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-medium uppercase tracking-wider">{LELAND_TENANT.short}</span>
                                <span>·</span>
                                <span>Strata for {LELAND_TENANT.name}</span>
                            </div>
                            <h1 className="text-2xl font-bold text-foreground leading-tight">{title}</h1>
                            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
                        </div>
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>

                {/* Page body */}
                {children}
            </div>
        </div>
    );
}
