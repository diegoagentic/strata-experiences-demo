// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Calculation Logic
// Phase 2 of WRG Demo v6 implementation
// Pure function, no side effects — based on Project Aries calculateInstallHours
// ═══════════════════════════════════════════════════════════════════════════════

import type {
    ConfigState,
    EstimateResult,
    LineItem,
    OperationalVariables,
} from './types'

/**
 * Calculates the full install estimate from line items, variables, and config.
 *
 * Formula:
 * 1. baseHours = Σ (subcategory.rate OR category.rate) × quantity for each line item
 * 2. adjustedHours = baseHours × (stair carry) × (after hours) × (site protection)
 * 3. cost = adjustedHours × (union rate OR non-union rate)
 * 4. salesPrice = cost / (1 - defaultMargin)
 * 5. crewSize = ceil(adjustedHours / (8 × duration days))
 */
export function calculateInstall(
    lineItems: LineItem[],
    variables: OperationalVariables,
    config: ConfigState
): EstimateResult {
    // Step 1: Sum base hours across all line items
    let baseHours = 0
    for (const item of lineItems) {
        const category = config.categories[item.categoryId]
        if (!category) continue

        const subcategory = item.subCategoryId
            ? category.subcategories?.[item.subCategoryId]
            : null

        const rate = subcategory ? subcategory.rate : category.rate
        const qty = parseFloat(String(item.quantity)) || 0
        baseHours += rate * qty
    }

    // Step 2: Apply multipliers
    let adjustedHours = baseHours
    if (variables.noElevator) adjustedHours *= config.multipliers.STAIR_CARRY
    if (variables.afterHours) adjustedHours *= config.multipliers.AFTER_HOURS
    if (variables.siteProtection) adjustedHours *= config.multipliers.SITE_PROTECTION

    // Step 3: Cost based on union status
    const hourlyRate = variables.isUnion ? config.rates.UNION : config.rates.NON_UNION
    const cost = adjustedHours * hourlyRate

    // Step 4: Sales price with margin
    const margin = config.defaultMargin || 0.35
    const salesPrice = cost / (1 - margin)

    // Step 5: Crew size (rounded up)
    const duration = parseFloat(String(variables.duration)) || 1
    const crewSize = Math.ceil(adjustedHours / (8 * duration))

    return {
        baseHours: baseHours.toFixed(2),
        totalHours: adjustedHours.toFixed(2),
        totalCost: cost.toFixed(2),
        salesPrice: salesPrice.toFixed(2),
        grossMargin: (salesPrice - cost).toFixed(2),
        crewSize,
        hourlyRate,
    }
}
