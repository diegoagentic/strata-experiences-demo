import type { HeroPo, HeroValidation } from './types';

// Hero scenario synthesised from the structure of real SO2604102 / Q18533
// (real customer data anonymized — see strata-projects/leland/LELAND_DEMO_DEVELOPMENT_PLAN.md).
export const HERO_PO_HAPPY: HeroPo = {
    poNumber: 'A173125-2',
    project: 'State University · Teaching & Learning Center',
    dealer: 'Northeast Office Group',
    endCustomer: 'State University Project Office',
    shipTo: {
        name: 'Project Logistics Co.',
        street: '3580 Coastal Road, Unit 6',
        city: 'Coastal City',
        state: 'NY',
        zip: '11572',
    },
    contactName: 'AM Contact',
    contactEmail: 'contact@northeastoffice.example',
    contactPhone: '+1 (555) 555-0633',
    poDate: '2026-04-17',
    quoteRef: 'Q18533-01',
    lineItems: [
        {
            line: 1,
            sku: 'F48A-L-PW-B-NA',
            description: 'Fast 48" Round Table Top · Wilsonart Kensington Maple',
            qty: 5,
            unitPrice: 712.55,
            quoteUnitPrice: 712.55,
            laminate: { vendor: 'Wilsonart', selection: 'Kensington Maple (10776-60)', pattern: '$' },
        },
        {
            line: 2,
            sku: 'FBA-DLT-B',
            description: 'Fast Size A Table Base · Dolphin Textured · Black',
            qty: 5,
            unitPrice: 684.69,
            quoteUnitPrice: 684.69,
        },
        {
            line: 3,
            sku: 'FTT',
            description: 'Fast Table Trolley · Black Texture',
            qty: 1,
            unitPrice: 1324.05,
            quoteUnitPrice: 1324.05,
        },
    ],
    total: 7479.23,
    commissionDeduct: -831.02,
    poInstructions: [
        'MARK CARTONS AND INVOICES A173125-2',
        'Q18533-01',
        'SHIP TO ARRIVE WEEK OF 07-20-2026',
    ],
};

// Same dealer/customer, second order — used as exception path scenario
// with three deterministic twists (see LELAND_FLOWS_SPEC.md §5):
//   l2.3  price mismatch in line 1 (-$87.75/unit · $87.75 total)
//   l2.4  customer not in Seradex (new dealer onboarding)
//   l2.6  textile in additional line is "Pending Approval"
export const HERO_PO_EXCEPTION: HeroPo = {
    ...HERO_PO_HAPPY,
    poNumber: 'A173144',
    project: 'State University · Teaching & Learning · Phase 2',
    quoteRef: 'Q18406',
    lineItems: [
        {
            line: 1,
            sku: 'F48A-L-PW-B-NA',
            description: 'Fast 48" Round Table Top · Wilsonart Kensington Maple',
            qty: 5,
            unitPrice: 695.00,           // ⚠ MISMATCH
            quoteUnitPrice: 712.55,      //    quote price
            laminate: { vendor: 'Wilsonart', selection: 'Kensington Maple (10776-60)', pattern: '$' },
        },
        {
            line: 2,
            sku: 'FBA-DLT-B',
            description: 'Fast Size A Table Base · Dolphin Textured · Black',
            qty: 5,
            unitPrice: 684.69,
            quoteUnitPrice: 684.69,
        },
        {
            line: 3,
            sku: 'FUP-A-T',
            description: 'Fast Upholstered Side Chair · Custom textile',
            qty: 8,
            unitPrice: 412.00,
            quoteUnitPrice: 412.00,
            textileStatus: 'Pending',     // ⚠ TEXTILE PENDING APPROVAL
        },
    ],
};

// Quantitative hero — projection logic for the reveal screen.
export const HERO_VALIDATION: HeroValidation = {
    lineImpactUsd: 87.75,                         // $17.55/unit × 5 units
    assumedWeeklyPoVolume: 100,                   // ~100 POs/week
    annualProjectionUsd: 87.75 * 100 * 52,        // ≈ $456,300/year
    disclaimer: 'Estimated projection based on observed PO patterns. Actual savings vary by volume and pricing accuracy.',
};
