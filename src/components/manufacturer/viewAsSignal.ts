/**
 * viewAsSignal · sessionStorage + CustomEvent signal for dealer mirror toggle (W11)
 *
 * Lets any component read the current "View as" state without prop-drilling.
 * Toggling triggers a CustomEvent that all `useViewAs()` consumers react to.
 *
 * States:
 *   - 'manufacturer' (default) · full UI · all actions enabled
 *   - 'dealer'                 · read-only · hides AR/proforma/financial · disables write actions
 */

import { useEffect, useState } from 'react'

export type ViewAs = 'manufacturer' | 'dealer'

const KEY = 'inbound-outbound:view-as'
const EVENT = 'inbound-outbound:view-as-change'

export function readViewAs(): ViewAs {
    if (typeof window === 'undefined') return 'manufacturer'
    const v = window.sessionStorage.getItem(KEY)
    return v === 'dealer' ? 'dealer' : 'manufacturer'
}

export function writeViewAs(value: ViewAs): void {
    if (typeof window === 'undefined') return
    window.sessionStorage.setItem(KEY, value)
    window.dispatchEvent(new CustomEvent(EVENT, { detail: value }))
}

export function useViewAs(): ViewAs {
    const [state, setState] = useState<ViewAs>(readViewAs)
    useEffect(() => {
        const onChange = (e: Event) => {
            const detail = (e as CustomEvent).detail as ViewAs | undefined
            setState(detail === 'dealer' ? 'dealer' : 'manufacturer')
        }
        window.addEventListener(EVENT, onChange)
        return () => window.removeEventListener(EVENT, onChange)
    }, [])
    return state
}
