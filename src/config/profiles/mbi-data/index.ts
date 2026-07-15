// ═══════════════════════════════════════════════════════════════════════════════
// MBI Mock Data — barrel export
// All MBI demo data lives here. Import from '@/config/profiles/mbi-data'.
// ═══════════════════════════════════════════════════════════════════════════════

export * from './types';
export { MBI_TENANT } from './tenant';
export { MBI_STAKEHOLDERS, getStakeholder } from './stakeholders';
export { MBI_MANUFACTURERS, getManufacturer } from './manufacturers';
export { MBI_CONTRACTS, getContract } from './contracts';
export { MBI_PRICING_REFERENCE, PRICING_BUFFER_PCT } from './pricingReference';
export { MBI_TYPICALS } from './typicals';
export { MBI_BUDGET_REQUESTS, HERO_VALIDATION, HERO_VALIDATION_SECONDARY, HERO_SCENARIOS, getHeroBudget } from './budgetRequests';
export { MBI_SIF_SAMPLES, getSIFSample } from './sifSamples';
export { MBI_INVOICES } from './invoices';
export { MBI_AR_RECORDS } from './arRecords';
export { MBI_BILLING_FORECAST, FORECAST_ACCURACY } from './billingForecast';
export { MBI_PROPOSALS } from './proposals';
export { MBI_SPEC_CHECKS } from './specChecks';
export { MBI_DESIGN_PROJECTS } from './designProjects';
export {
    MBI_PAIN_POINTS,
    PAIN_POINTS_BY_MODULE,
    getPainPointsByModule,
    getPainPointsByPhase,
    getCriticalAndHighByModule,
    assertNoCETInAccounting,
} from './painPoints';
export type { PainModule, PainSeverity, RoadmapPhase, PainPoint } from './painPoints';
export {
    MBI_MODULE_PHASES,
    MODULE_PHASES_BY_MODULE,
    getPhasesForModule,
} from './modulePhases';
export type { ModulePhase, ModulePhaseNumber } from './modulePhases';
