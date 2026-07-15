/**
 * textileRef · shared textile/finish reference helpers (Wendy items 9 & 10)
 *
 * Single source for the graded-in textile inference + fabric-spec detection,
 * reused by QuoteDetail (actions) and OrderDetail/AckDetail (read-only review).
 * Mock vendor mapping until P3 wires Kenya's real vendor library.
 */

import type { TextileState } from './TextileGradedInBadge'

export type { TextileState }

export interface TextileRef {
    state: TextileState
    vendor: string
    tier: string
    pricePerYard: string
    url: string
}

/** Mock: SKU root determines vendor + state for the demo. */
export function inferredTextileState(itemId: string): TextileRef {
    const root = itemId.split('-')[0] ?? ''
    if (root === 'F') {
        return { state: 'price-ok', vendor: 'CF Stinson', tier: 'Tier B', pricePerYard: '$58/yd', url: 'https://cfstinson.com' }
    }
    if (root === '7730') {
        return { state: 'price-missing', vendor: 'Maharam', tier: 'Tier C', pricePerYard: '—', url: 'https://maharam.com' }
    }
    return { state: 'vendor-tier-unknown', vendor: 'Knoll Textiles', tier: '—', pricePerYard: '—', url: 'https://knolltextiles.com' }
}

/** True when a line item carries a graded-in fabric spec (configs has "Fabric: …"). */
export function hasFabric(configs?: string[]): boolean {
    return !!configs?.some(c => /fabric/i.test(c))
}

/** The human fabric value, e.g. "CF-6036 Ocean Blue" (without the "Fabric:" prefix). */
export function fabricLabel(configs?: string[]): string | undefined {
    const fab = configs?.find(c => /fabric/i.test(c))
    return fab ? fab.replace(/^fabric:\s*/i, '').trim() : undefined
}

// ── Material swatch catalog ───────────────────────────────────────────────
// Grounded in the real fabric/finish codes used across the item lists + the
// documented CF-6036 → CF-6021 graded-equivalent substitution. The `hex` is a
// representative approximation of each named color (for visual swatches only).

export interface MaterialSwatch {
    code: string
    name: string
    type: 'fabric' | 'finish'
    hex: string
    vendor?: string
    grade?: string
    pricePerYard?: string
    /** Marks a catalog-equivalent alternative (e.g. CF-6021 for CF-6036). */
    equivalentOf?: string
    /** Numeric price/yd for the upcharge math (Wendy item 10). */
    tierPriceNum?: number
    /** Base (Tier A) price/yd this grade is measured against. */
    baseTierNum?: number
    /** W7 · whether this textile is on the approved Excel list (v3). */
    excelApproved?: boolean
}

export const MATERIAL_SWATCHES: MaterialSwatch[] = [
    { code: 'CF-6036', name: 'Ocean Blue', type: 'fabric', hex: '#1E5A82', vendor: 'CF Stinson', grade: 'Tier B', pricePerYard: '$58/yd', tierPriceNum: 58, baseTierNum: 35, excelApproved: true },
    { code: 'CF-6021', name: 'Navy', type: 'fabric', hex: '#1B2A4A', vendor: 'CF Stinson', grade: 'Tier B', pricePerYard: '$58/yd', tierPriceNum: 58, baseTierNum: 35, excelApproved: true, equivalentOf: 'CF-6036' },
    // GR-5505 is NOT on the approved Excel list → drives the escalation case in the quote.
    { code: 'GR-5505', name: 'Charcoal', type: 'fabric', hex: '#3A3A3C', vendor: 'Maharam', grade: 'Tier C', pricePerYard: '$72/yd', tierPriceNum: 72, baseTierNum: 35, excelApproved: false },
    { code: 'RO-FU1317', name: 'Wellesley Ocean', type: 'fabric', hex: '#2C6E8F', vendor: 'CF Stinson', grade: 'Tier B', pricePerYard: '$58/yd', tierPriceNum: 58, baseTierNum: 35, excelApproved: true },
    { code: 'LG2', name: 'Loft Gray', type: 'finish', hex: '#9B9B97' },
]

/** Resolve a swatch from a config string like "Fabric: CF-6036 Ocean Blue" or "LG2-Loft Gray". */
export function swatchFor(configValue?: string): MaterialSwatch | undefined {
    if (!configValue) return undefined
    const v = configValue.toLowerCase()
    return MATERIAL_SWATCHES.find(s => v.includes(s.code.toLowerCase()) || v.includes(s.name.toLowerCase()))
}

// ── Upcharge resolver (single source of truth · Wendy item 10) ─────────────
// One function the quote/order/ack rows all call, so the inline UI and the
// badge popover never disagree. Grounded in the swatch catalog above.

const VENDOR_URL: Record<string, string> = {
    'CF Stinson': 'https://cfstinson.com',
    Maharam: 'https://maharam.com',
    'Knoll Textiles': 'https://knolltextiles.com',
}

/** Estimated fabric yardage for a line: yd-per-unit by category × qty. */
export function yardsForItem(category: string, qty: number): number {
    const perUnit: Record<string, number> = { Seating: 5, Panels: 3 }
    return (perUnit[category] ?? 4) * Math.max(1, qty)
}

export interface TextileResolution {
    code?: string
    name?: string
    state: TextileState
    vendor: string
    tier: string
    pricePerYard: string
    url: string
    excelApproved: boolean
    baseTierPrice: number
    tierPrice: number | null
    yards: number
    upchargePerYd: number | null
    upchargeTotal: number | null
}

/** Resolve full textile validation + upcharge for a line item. */
export function resolveTextile(configs: string[] | undefined, category: string, qty: number): TextileResolution {
    const sw = swatchFor(fabricLabel(configs))
    const yards = yardsForItem(category, qty)
    const vendor = sw?.vendor ?? 'Knoll Textiles'
    const baseTierPrice = sw?.baseTierNum ?? 35
    const tierPrice = sw?.tierPriceNum ?? null
    const state: TextileState = !sw ? 'vendor-tier-unknown' : tierPrice == null ? 'price-missing' : 'price-ok'
    const upchargePerYd = tierPrice !== null ? tierPrice - baseTierPrice : null
    const upchargeTotal = upchargePerYd !== null ? upchargePerYd * yards : null
    return {
        code: sw?.code,
        name: sw?.name,
        state,
        vendor,
        tier: sw?.grade ?? '—',
        pricePerYard: sw?.pricePerYard ?? '—',
        url: VENDOR_URL[vendor] ?? 'https://knolltextiles.com',
        excelApproved: sw?.excelApproved ?? true,
        baseTierPrice,
        tierPrice,
        yards,
        upchargePerYd,
        upchargeTotal,
    }
}
