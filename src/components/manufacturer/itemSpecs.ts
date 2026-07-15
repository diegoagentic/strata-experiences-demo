/**
 * itemSpecs · shared item spec helpers (Wendy item 2b · Product Size).
 *
 * Product size is a manufacturer-level convention derived from the item
 * category. Centralized so the item rows (Quote/Order/Ack) and the item
 * detail drawer surface the same value.
 */

export const SIZE_BY_CATEGORY: Record<string, string> = {
    Tables: '30Dx60Wx29H',
    Storage: '15Wx18Dx28H',
    Worksurfaces: '30Dx72W',
    Seating: 'W34xD33xH36',
    Panels: '60Hx48W',
    'Task Seating': 'B-Medium',
}

/** Product size for a category, or undefined when unknown. */
export function sizeForCategory(category?: string): string | undefined {
    return category ? SIZE_BY_CATEGORY[category] : undefined
}

// ── Human-readable size formatting ────────────────────────────────────────
// Raw codes like "30Dx60Wx29H" / "W34xD33xH36" / "60Hx48W" are cryptic. These
// helpers parse both number-first (30D) and letter-first (D33) notations,
// normalize to Width × Depth × Height order, and add inch units so the value
// reads clearly for non-technical users.

const DIM_ORDER = ['W', 'D', 'H'] as const
const DIM_WORD: Record<string, { short: string; long: string }> = {
    W: { short: 'W', long: 'wide' },
    D: { short: 'D', long: 'deep' },
    H: { short: 'H', long: 'high' },
}

/** Parse a raw size into {W,D,H} inch values (any subset). Returns null for non-dimensional codes. */
function parseDims(raw: string): Partial<Record<'W' | 'D' | 'H', number>> | null {
    const dims: Partial<Record<'W' | 'D' | 'H', number>> = {}
    let matched = false
    for (const seg of raw.split(/x/i)) {
        const s = seg.trim()
        // number-first (e.g. 30D) or letter-first (e.g. D33)
        const m = s.match(/^(\d+(?:\.\d+)?)\s*([DWH])$/i) ?? s.match(/^([DWH])\s*(\d+(?:\.\d+)?)$/i)
        if (!m) continue
        const [a, b] = [m[1], m[2]]
        const letter = (/[DWH]/i.test(a) ? a : b).toUpperCase() as 'W' | 'D' | 'H'
        const num = parseFloat(/[DWH]/i.test(a) ? b : a)
        if (!Number.isNaN(num)) { dims[letter] = num; matched = true }
    }
    return matched ? dims : null
}

/** Compact readable size, e.g. `60" W × 30" D × 29" H`; `B-Medium` → `Size B · Medium`. */
export function formatSize(raw?: string): string | undefined {
    if (!raw) return undefined
    const dims = parseDims(raw)
    if (!dims) {
        // Non-dimensional size code (e.g. "B-Medium")
        const parts = raw.split('-')
        return parts.length === 2 ? `Size ${parts[0]} · ${parts[1]}` : raw
    }
    return DIM_ORDER.filter(d => dims[d] != null).map(d => `${dims[d]}" ${DIM_WORD[d].short}`).join(' × ')
}

/** Long readable size for tooltips, e.g. `60" wide × 30" deep × 29" high`. */
export function formatSizeLong(raw?: string): string | undefined {
    if (!raw) return undefined
    const dims = parseDims(raw)
    if (!dims) {
        const parts = raw.split('-')
        return parts.length === 2 ? `Size ${parts[0]} (${parts[1]})` : raw
    }
    return DIM_ORDER.filter(d => dims[d] != null).map(d => `${dims[d]}" ${DIM_WORD[d].long}`).join(' × ')
}
