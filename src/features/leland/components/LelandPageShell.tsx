/**
 * LelandPageShell · thin passthrough over the DS `PageShell` primitive.
 *
 * Every Leland app (StrataShell · Inbox · Seradex · Review Queue) mounts
 * inside this wrapper so they share the same tenant crumb (LF · Strata for
 * Leland). All layout work is done by `PageShell` from the embedded DS —
 * this component only injects the Leland-specific tenant chip.
 *
 * Migrated from a stand-alone shell (~80 LOC) to a wrapper as part of F5.
 * See `packages/strata-ds/src/components/page-shell.tsx` for the primitive.
 */

import type { ReactNode } from 'react';
import { PageShell, type PageShellProps } from 'strata-design-system';
import { LELAND_TENANT } from '../../../config/profiles/leland-data';

interface LelandPageShellProps {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    iconTone?: PageShellProps['iconTone'];
    actions?: ReactNode;
    children: ReactNode;
}

export default function LelandPageShell({
    title,
    subtitle,
    icon,
    iconTone = 'brand',
    actions,
    children,
}: LelandPageShellProps) {
    return (
        <PageShell
            title={title}
            subtitle={subtitle}
            icon={icon}
            iconTone={iconTone}
            actions={actions}
            tenantCrumb={
                <>
                    <span className="font-medium uppercase tracking-wider">{LELAND_TENANT.short}</span>
                    <span>·</span>
                    <span>Strata for {LELAND_TENANT.name}</span>
                </>
            }
        >
            {children}
        </PageShell>
    );
}
