import type { Stakeholder } from './types';

// 17 respondents from the MBI AI Readiness Questionnaire (Notion)
export const MBI_STAKEHOLDERS: Stakeholder[] = [
    // Leadership
    { id: 'jordan-hart', name: 'Jordan Hart', role: 'Owner & President', team: 'leadership', q4Trust: 9, adoption: 'innovator' },
    { id: 'mark-kielhafner', name: 'Mark Kielhafner', role: 'Director of Business Operations', team: 'leadership', email: 'mkielhafner@mbioffice.com', q4Trust: 7, adoption: 'early-adopter' },
    { id: 'justin-laramie', name: 'Justin Laramie', role: 'BD Manager & Process Leader', team: 'bd', q4Trust: 8, adoption: 'early-adopter', isEarlyAdopter: true },

    // Design
    { id: 'lisa-garretson', name: 'Lisa Garretson', role: 'Director of Design', team: 'design', q4Trust: 4, adoption: 'early-majority' },
    { id: 'amy-shoemaker', name: 'Amy Shoemaker', role: 'Senior Designer', team: 'design', q4Trust: 4, adoption: 'early-majority' },
    { id: 'beth-gianino', name: 'Beth Gianino', role: 'Designer', team: 'design', q4Trust: 8, adoption: 'early-adopter', isEarlyAdopter: true },
    { id: 'carrie-numelin', name: 'Carrie Numelin', role: 'Designer', team: 'design', q4Trust: 1, adoption: 'laggard' },

    // Project Coordination / PM
    { id: 'marcia-ludwig', name: 'Marcia Ludwig', role: 'Director of PM', team: 'pm', q4Trust: 5, adoption: 'early-majority' },
    { id: 'erin-skinner', name: 'Erin Skinner', role: 'PC & Design (hybrid)', team: 'pc', q4Trust: 5, adoption: 'early-majority' },
    { id: 'erin-pm', name: 'Erin', role: 'PM', team: 'pm', q4Trust: 5, adoption: 'early-majority' },
    { id: 'amy-behl', name: 'Amy Behl', role: 'PC', team: 'pc', q4Trust: 5, adoption: 'early-majority' },
    { id: 'mario', name: 'Mario', role: 'PC', team: 'pc', q4Trust: 5, adoption: 'early-majority' },
    { id: 'michael-nickel', name: 'Michael Nickel', role: 'PM', team: 'pm', q4Trust: 6, adoption: 'early-majority' },
    { id: 'nicki-nevad', name: 'Nicki Nevad', role: 'PM', team: 'pm', q4Trust: 6, adoption: 'early-majority' },

    // Accounting
    { id: 'kathy-belleville', name: 'Kathy Belleville', role: 'Controller', team: 'accounting', q4Trust: 8, adoption: 'early-adopter', isEarlyAdopter: true },

    // Healthcare
    { id: 'lynda-alexander', name: 'Lynda Alexander', role: 'Director of Healthcare', team: 'healthcare', q4Trust: 6, adoption: 'early-majority' },

    // Sales
    { id: 'amanda-renshaw', name: 'Amanda Renshaw', role: 'Account Manager', team: 'sales', q4Trust: 6, adoption: 'early-majority' },
    { id: 'nicky-wesemann', name: 'Nicky Wesemann', role: 'Sales', team: 'sales', q4Trust: 5, adoption: 'early-majority' },
    { id: 'stacey', name: 'Stacey', role: 'Sales', team: 'sales', q4Trust: 5, adoption: 'early-majority' },
    { id: 'keyla-gettings', name: 'Keyla Gettings', role: 'Sales', team: 'sales', q4Trust: 5, adoption: 'early-majority' },

    // Warehouse
    { id: 'mark-ramsey', name: 'Mark Ramsey', role: 'Warehouse', team: 'warehouse', q4Trust: 4, adoption: 'late-majority' },
];

export const getStakeholder = (id: string): Stakeholder | undefined =>
    MBI_STAKEHOLDERS.find(s => s.id === id);
