// ═══════════════════════════════════════════════════════════════════════════════
// Leland Mock Data — Type definitions
// ═══════════════════════════════════════════════════════════════════════════════

export interface LelandTenant {
    name: string;            // 'Leland Furniture'
    short: string;           // 'LF'
    hq: string;              // 'Grand Rapids, MI'
    address: string;         // '5695 Eagle Dr SE'
    nysVendorId: string;     // '1000008256'
    founded: number;
    primarySystems: ('HubSpot' | 'Seradex' | 'Rica AI')[];
    aiReadiness?: { current: number; target: number; tier: string };
}

export type LelandTeam = 'leadership' | 'review' | 'admin' | 'sales' | 'design';
export type LelandRole = 'Owner' | 'Director Operations' | 'Reviewer' | 'Admin' | 'Account Manager' | 'Designer' | string;
export type AdoptionPhase = 'innovator' | 'early-adopter' | 'early-majority' | 'late-majority' | 'laggard';

export interface LelandStakeholder {
    id: string;
    name: string;
    role: LelandRole;
    team: LelandTeam;
    email?: string;
    q4Trust?: number;        // 1-10
    adoption?: AdoptionPhase;
    isEarlyAdopter?: boolean;
}

// ─── Hero scenario data ──────────────────────────────────────────────────────

export interface HeroPoLineItem {
    line: number;
    sku: string;
    description: string;
    qty: number;
    unitPrice: number;
    quoteUnitPrice: number;  // for price-check comparison
    laminate?: { vendor: string; selection: string; pattern: '$' | '$$' };
    textileStatus?: 'Approved' | 'Pending' | 'Denied' | 'Conditional' | 'Not Submitted';
}

export interface HeroPo {
    poNumber: string;
    project: string;
    dealer: string;
    endCustomer: string;
    shipTo: { name: string; street: string; city: string; state: string; zip: string };
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    poDate: string;
    quoteRef: string;
    lineItems: HeroPoLineItem[];
    total: number;
    commissionDeduct: number;
    poInstructions: string[];
}

export interface HeroValidation {
    /** Per-line $ saved by Strata catching the mismatch */
    lineImpactUsd: number;
    /** Assumed weekly PO volume for projection */
    assumedWeeklyPoVolume: number;
    /** Annual projection in $ */
    annualProjectionUsd: number;
    /** Disclaimer text shown alongside the projection */
    disclaimer: string;
}
