import type { ARRecord } from './types';

export const MBI_AR_RECORDS: ARRecord[] = [
    { id: 'AR-001', client: 'Enterprise Holdings', poNumber: 'PO-2025-0892', amount: 42500, daysPastDue: 12, status: 'pending-approval', salesperson: 'Amanda Renshaw', collectionsHold: true, holdReason: 'installation-pending', installationDate: '2026-05-15' },
    { id: 'AR-002', client: 'Commerce Bank', poNumber: 'PO-2025-0901', amount: 18200, daysPastDue: 18, status: 'no-response', lastContact: '2026-04-10', salesperson: 'Nicky Wesemann', replyIntent: 'Client replied Apr 27 · "contact us after Apr 29" · follow-up scheduled' },
    { id: 'AR-003', client: 'Lakeside Health', poNumber: 'PO-2025-0915', amount: 88400, daysPastDue: 5, status: 'committed-to-pay', lastContact: '2026-04-18', salesperson: 'Lynda Alexander' },
    { id: 'AR-004', client: 'Lindenwood University', poNumber: 'PO-2025-0928', amount: 24600, daysPastDue: 32, status: 'escalated', lastContact: '2026-04-12', salesperson: 'Keyla Gettings' },
    { id: 'AR-005', client: 'Riverside Medical Fort Smith', poNumber: 'PO-2025-0934', amount: 156800, daysPastDue: 8, status: 'committed-to-pay', salesperson: 'Lynda Alexander' },
    { id: 'AR-006', client: 'City of St. Charles', poNumber: 'PO-2025-0942', amount: 32100, daysPastDue: 14, status: 'pending-approval', salesperson: 'Amanda Renshaw' },
    { id: 'AR-007', client: 'Ranken Technical College', poNumber: 'PO-2025-0951', amount: 14800, daysPastDue: 22, status: 'no-response', lastContact: '2026-04-08', salesperson: 'Stacey Hoover' },
    { id: 'AR-008', client: 'Boeing St. Louis', poNumber: 'PO-2025-0966', amount: 78400, daysPastDue: 3, status: 'pending-approval', salesperson: 'Justin Laramie', collectionsHold: true, holdReason: 'punch-list-open', punchListOpen: 4 },
    { id: 'AR-009', client: 'Washington University', poNumber: 'PO-2025-0972', amount: 41200, daysPastDue: 45, status: 'escalated', lastContact: '2026-04-05', salesperson: 'Keyla Gettings' },
    { id: 'AR-010', client: 'Edward Jones', poNumber: 'PO-2025-0980', amount: 92500, daysPastDue: 9, status: 'committed-to-pay', salesperson: 'Amanda Renshaw' },
    { id: 'AR-011', client: 'SSM Health', poNumber: 'PO-2025-0987', amount: 67200, daysPastDue: 17, status: 'pending-approval', salesperson: 'Lynda Alexander' },
    { id: 'AR-012', client: 'Anheuser-Busch', poNumber: 'PO-2025-0991', amount: 124800, daysPastDue: 2, status: 'committed-to-pay', salesperson: 'Justin Laramie' },
];
