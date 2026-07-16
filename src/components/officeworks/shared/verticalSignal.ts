// ─── Officeworks L&D vertical signal ─────────────────────────────────────────
// The active vertical (furniture | walls) is a 3rd dimension of state for the
// L&D flow · orthogonal to the demo profile + step. The sidebar sub-toggle owns
// the writer; the navbar, funnel and modal panels are readers.
//
// We use sessionStorage + a custom event ('officeworks:vertical-change')
// because the navbar sits outside the OfficeworksPage subtree so React context
// would not reach it. Lightweight signal pattern.

import { useEffect, useState } from 'react';

export type OfficeworksVertical = 'furniture' | 'walls';

const STORAGE_KEY = 'officeworks:active-vertical';
const EVENT_NAME = 'officeworks:vertical-change';

export function readVertical(): OfficeworksVertical {
    if (typeof window === 'undefined') return 'furniture';
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return stored === 'walls' ? 'walls' : 'furniture';
}

export function writeVertical(v: OfficeworksVertical): void {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(STORAGE_KEY, v);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: v }));
}

/** Reactive hook · re-renders the consumer when the vertical changes. */
export function useOfficeworksVertical(): OfficeworksVertical {
    const [vertical, setVertical] = useState<OfficeworksVertical>(readVertical);
    useEffect(() => {
        const onChange = (e: Event) => {
            const detail = (e as CustomEvent).detail as OfficeworksVertical | undefined;
            if (detail === 'furniture' || detail === 'walls') {
                setVertical(detail);
            }
        };
        window.addEventListener(EVENT_NAME, onChange);
        return () => window.removeEventListener(EVENT_NAME, onChange);
    }, []);
    return vertical;
}
