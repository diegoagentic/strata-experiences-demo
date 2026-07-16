import type { Stakeholder } from './types';

// 17 respondents from the MBI AI Readiness Questionnaire (Notion)
export const MBI_STAKEHOLDERS: Stakeholder[] = [
    // Leadership
    { id: 'jordan-hart', name: 'Controller Hart', role: 'Owner & President', team: 'leadership', q4Trust: 9, adoption: 'innovator' },
    { id: 'mark-kielhafner', name: 'Executive Sponsor', role: 'Director of Business Operations', team: 'leadership', email: 'mkielhafner@mbioffice.com', q4Trust: 7, adoption: 'early-adopter' },
    { id: 'justin-laramie', name: 'Sales Lead', role: 'BD Manager & Process Leader', team: 'bd', q4Trust: 8, adoption: 'early-adopter', isEarlyAdopter: true },

    // Design
    { id: 'lisa-garretson', name: 'Collections Lead', role: 'Director of Design', team: 'design', q4Trust: 4, adoption: 'early-majority' },
    { id: 'amy-shoemaker', name: 'AP Lead', role: 'Senior Designer', team: 'design', q4Trust: 4, adoption: 'early-majority' },
    { id: 'beth-gianino', name: 'Design Manager Fane', role: 'Designer', team: 'design', q4Trust: 8, adoption: 'early-adopter', isEarlyAdopter: true },
    { id: 'carrie-numelin', name: 'Operations Lead', role: 'Designer', team: 'design', q4Trust: 1, adoption: 'laggard' },

    // Project Coordination / PM
    { id: 'marcia-ludwig', name: 'Design Coordinator', role: 'Director of PM', team: 'pm', q4Trust: 5, adoption: 'early-majority' },
    { id: 'erin-skinner', name: 'Project Coordinator', role: 'PC & Design (hybrid)', team: 'pc', q4Trust: 5, adoption: 'early-majority' },
    { id: 'erin-pm', name: 'Erin', role: 'PM', team: 'pm', q4Trust: 5, adoption: 'early-majority' },
    { id: 'amy-behl', name: 'Estimator Nova', role: 'PC', team: 'pc', q4Trust: 5, adoption: 'early-majority' },
    { id: 'mario', name: 'Mario', role: 'PC', team: 'pc', q4Trust: 5, adoption: 'early-majority' },
    { id: 'michael-nickel', name: 'Approver Nix', role: 'PM', team: 'pm', q4Trust: 6, adoption: 'early-majority' },
    { id: 'nicki-nevad', name: 'Designer Vale', role: 'PM', team: 'pm', q4Trust: 6, adoption: 'early-majority' },

    // Accounting
    { id: 'kathy-belleville', name: 'Operations Manager Rowe', role: 'Controller', team: 'accounting', q4Trust: 8, adoption: 'early-adopter', isEarlyAdopter: true },

    // Healthcare
    { id: 'lynda-alexander', name: 'Designer Quinn', role: 'Director of Healthcare', team: 'healthcare', q4Trust: 6, adoption: 'early-majority' },

    // Sales
    { id: 'amanda-renshaw', name: 'Sales Rep Ash', role: 'Account Manager', team: 'sales', q4Trust: 6, adoption: 'early-majority' },
    { id: 'nicky-wesemann', name: 'Designer Wren', role: 'Sales', team: 'sales', q4Trust: 5, adoption: 'early-majority' },
    { id: 'stacey', name: 'Stacey', role: 'Sales', team: 'sales', q4Trust: 5, adoption: 'early-majority' },
    { id: 'keyla-gettings', name: 'Coordinator Blake', role: 'Sales', team: 'sales', q4Trust: 5, adoption: 'early-majority' },

    // Warehouse
    { id: 'mark-ramsey', name: 'PM Marlow', role: 'Warehouse', team: 'warehouse', q4Trust: 4, adoption: 'late-majority' },
];

export const getStakeholder = (id: string): Stakeholder | undefined =>
    MBI_STAKEHOLDERS.find(s => s.id === id);
