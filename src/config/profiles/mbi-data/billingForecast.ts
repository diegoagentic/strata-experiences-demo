import type { BillingForecastPoint } from './types';

// Last 6 weeks of billing forecast — simulating the live dashboard
export const MBI_BILLING_FORECAST: BillingForecastPoint[] = [
    { week: '2026-W11', projected: 285000, actual: 278400, confidence: 88 },
    { week: '2026-W12', projected: 312000, actual: 318200, confidence: 91 },
    { week: '2026-W13', projected: 298000, actual: 291500, confidence: 87 },
    { week: '2026-W14', projected: 345000, actual: 351800, confidence: 92 },
    { week: '2026-W15', projected: 308000, actual: 302400, confidence: 90 },
    { week: '2026-W16', projected: 327000, confidence: 89 },     // current week — no actual yet
];

export const FORECAST_ACCURACY = {
    legacy: '75-80%',           // Excel-based bi-weekly
    strata: '90%+',             // automated draft
    manualSteps: { legacy: 8, strata: 2 },
};
