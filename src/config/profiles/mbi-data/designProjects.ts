import type { DesignProject } from './types';

export const MBI_DESIGN_PROJECTS: DesignProject[] = [
    { id: 'DP-001', name: 'Lakeside ICU Expansion', client: 'Lakeside Health', vertical: 'healthcare', designerId: 'beth-gianino', status: 'design', hoursLogged: 28, budgetTracked: { allocated: 425000, spent: 411750 } },
    { id: 'DP-002', name: 'Enterprise HQ Floor 12', client: 'Enterprise Holdings', vertical: 'corporate', designerId: 'amy-shoemaker', status: 'review', hoursLogged: 42, budgetTracked: { allocated: 385000, spent: 372500 } },
    { id: 'DP-003', name: 'Commerce Bank Clayton', client: 'Commerce Bank', vertical: 'corporate', designerId: 'beth-gianino', status: 'approved', hoursLogged: 18 },
    { id: 'DP-004', name: 'Lindenwood Admin', client: 'Lindenwood University', vertical: 'education', designerId: 'erin-skinner', status: 'intake', hoursLogged: 4 },
    { id: 'DP-005', name: 'Riverside Fort Smith Phase 2', client: 'Riverside Medical Fort Smith', vertical: 'healthcare', designerId: 'amy-shoemaker', status: 'design', hoursLogged: 56 },
];
