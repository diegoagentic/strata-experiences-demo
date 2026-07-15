/**
 * sampleFlowSignal · in-memory record of completed sample-request flows.
 *
 * Intentionally NOT persisted (no sessionStorage/localStorage): the store lives
 * only in memory, so it survives in-app navigation (the App stays mounted) but
 * RESETS on a full page reload — per the demo requirement "al recargar la página
 * se reinicia el proceso". Once a flow is confirmed, the chosen material (incl. a
 * graded-equivalent substitution) is reflected in the modal and the line rows.
 */

import { useEffect, useState } from 'react'

export interface SampleFlowDone {
    /** Final material after the flow (e.g. "CF-6021 Navy" if substituted). */
    finalMaterial: string
    /** True when the graded-equivalent substitution was accepted. */
    substituted: boolean
    tracking: string
}

const store = new Map<string, SampleFlowDone>()
const EVENT = 'sample-flow:change'
const keyOf = (linkedTo: string, sku: string) => `${linkedTo}::${sku}`

export function getSampleFlow(linkedTo: string, sku: string): SampleFlowDone | undefined {
    return store.get(keyOf(linkedTo, sku))
}

/** Find a confirmed flow for an sku across any quote (for shared consumers like the item drawer). */
export function getSampleFlowBySku(sku: string): SampleFlowDone | undefined {
    for (const [key, value] of store) {
        if (key.endsWith(`::${sku}`)) return value
    }
    return undefined
}

export function markSampleFlowDone(linkedTo: string, sku: string, data: SampleFlowDone): void {
    store.set(keyOf(linkedTo, sku), data)
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { linkedTo, sku } }))
}

/** Re-render subscriber — bumps on any sample-flow change; read getSampleFlow() after. */
export function useSampleFlowVersion(): number {
    const [v, setV] = useState(0)
    useEffect(() => {
        const on = () => setV(n => n + 1)
        window.addEventListener(EVENT, on)
        return () => window.removeEventListener(EVENT, on)
    }, [])
    return v
}
