import type { Invoice } from './types';

// Kathy's morning AP queue · 12 bills distributed across 3 workflow columns.
// Apr 23 transcript (Christian to Matt @ 13:36): the queue must show
// PENDING / IN-PROGRESS / DONE, not just pending+done.
//
//   PENDING REVIEW (4)  Needs Kathy's eyes — exceptions + HealthTrust rebate approvals
//   IN PROGRESS (3)     Agent reconciling or awaiting vendor reply
//   DONE (5)            Auto-posted to CORE (EDI · clean OCR · matched PO)
//
// Vendor model: vendor = the manufacturer sending the bill TO MBI.
// HealthTrust flag = MBI sold to a GPO member; a 3% rebate line posts to GPO payable.
// clientName = the end client (hospital) on HealthTrust-flagged bills.
export const MBI_INVOICES: Invoice[] = [
    // ── DONE · 5 auto-posted EDI bills ───────────────────────────────────────
    { id: 'INV-0482', vendor: 'Allsteel',   poNumber: 'PO-2026-0047', amount: 41400, invoiceDate: '2026-04-17', paymentTerms: 'Net 30',      dueDate: '2026-05-17', received: '2026-04-19T06:15:00Z', isEDI: true,  ocrConfidence: 98, status: 'done' },
    { id: 'INV-0483', vendor: 'HON',        poNumber: 'PO-2026-0049', amount: 17850, invoiceDate: '2026-04-17', paymentTerms: 'Net 30',      dueDate: '2026-05-17', received: '2026-04-19T06:22:00Z', isEDI: true,  ocrConfidence: 99, status: 'done' },
    { id: 'INV-0487', vendor: 'Gunlocke',   poNumber: 'PO-2026-0055', amount: 8750,  invoiceDate: '2026-04-18', paymentTerms: 'Net 45',      dueDate: '2026-06-02', received: '2026-04-19T08:15:00Z', isEDI: true,  ocrConfidence: 99, status: 'done' },
    { id: 'INV-0489', vendor: 'Kimball',    poNumber: 'PO-2026-0058', amount: 22450, invoiceDate: '2026-04-18', paymentTerms: 'Net 30',      dueDate: '2026-05-18', received: '2026-04-19T08:45:00Z', isEDI: true,  ocrConfidence: 98, status: 'done' },
    { id: 'INV-0493', vendor: 'HON',        poNumber: 'PO-2026-0062', amount: 11250, invoiceDate: '2026-04-18', paymentTerms: '2/10 Net 30', dueDate: '2026-05-18', received: '2026-04-19T09:55:00Z', isEDI: true,  ocrConfidence: 99, status: 'done' },

    // ── IN PROGRESS · 3 non-EDI being agent-reconciled ───────────────────────
    { id: 'INV-0488', vendor: 'Pinnacle',       poNumber: 'PO-2026-0056', amount: 16800, invoiceDate: '2026-04-16', paymentTerms: 'Net 30',      dueDate: '2026-05-16', received: '2026-04-19T08:22:00Z', isEDI: false, ocrConfidence: 91, status: 'in-progress', inProgressReason: 'Non-EDI · agent reconciling line items vs PO' },
    { id: 'INV-0490', vendor: 'ErgoTech',       poNumber: 'PO-2026-0059', amount: 4250,  invoiceDate: '2026-04-17', paymentTerms: 'Net 45',      dueDate: '2026-06-01', received: '2026-04-19T09:01:00Z', isEDI: false, ocrConfidence: 88, status: 'in-progress', inProgressReason: 'Awaiting vendor confirmation on freight terms' },
    { id: 'INV-0491', vendor: 'Pacific Fabrics', poNumber: 'PO-2026-0060', amount: 6800, invoiceDate: '2026-04-17', paymentTerms: 'Net 30',      dueDate: '2026-05-17', received: '2026-04-19T09:15:00Z', isEDI: false, ocrConfidence: 89, status: 'in-progress', inProgressReason: 'Non-EDI · agent matching SKUs to catalog' },

    // ── PENDING REVIEW · 4 need Kathy's eyes ─────────────────────────────────
    // Exception: quantity mismatch (PO 6, bill 5) → lands in Pending Review, not Done
    { id: 'INV-0484', vendor: 'Apex Workspace', poNumber: 'PO-2026-0051', amount: 12900, invoiceDate: '2026-04-16', paymentTerms: 'Net 30',      dueDate: '2026-05-16', received: '2026-04-19T07:04:00Z', isEDI: false, ocrConfidence: 92, hasException: true, exceptionReason: 'Quantity mismatch: PO 6, bill 5 · short-shipped Jarvis desks', status: 'pending' },
    // Exception: missing freight line
    { id: 'INV-0485', vendor: 'CaseWorks',      poNumber: 'PO-2026-0052', amount: 38250, invoiceDate: '2026-04-15', paymentTerms: '2/10 Net 30', dueDate: '2026-05-15', received: '2026-04-19T07:30:00Z', isEDI: false, ocrConfidence: 94, hasException: true, exceptionReason: 'Missing freight line · PO includes $420 inbound freight not on bill', status: 'pending' },
    // Exception: unit price mismatch vs PO — 160 chairs billed at $345 vs agreed $320
    { id: 'INV-0486', vendor: 'Versteel',        poNumber: 'PO-2026-0053', amount: 54800, invoiceDate: '2026-04-16', paymentTerms: 'Net 45',      dueDate: '2026-06-01', received: '2026-04-19T08:00:00Z', isEDI: false, ocrConfidence: 84, hasException: true, exceptionReason: 'Unit price mismatch: PO $320/unit, bill $345/unit · 160 chairs', status: 'pending' },
    // Exception: low OCR confidence — manual field review required before posting
    { id: 'INV-0492', vendor: 'Global Industries', poNumber: 'PO-2026-0061', amount: 31600, invoiceDate: '2026-04-17', paymentTerms: 'Net 30',    dueDate: '2026-05-07', received: '2026-04-19T09:30:00Z', isEDI: false, ocrConfidence: 78, hasException: true, exceptionReason: 'Low OCR confidence (78%) · manual field review required before posting', status: 'pending' },
];
