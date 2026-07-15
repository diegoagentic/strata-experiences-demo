/** Domain-specific terms used across the MBI demo. Each entry has a short
 *  label (used as the display trigger if needed) and a definition shown in
 *  the tooltip. Keep definitions under ~120 chars so they fit in one line. */
export const GLOSSARY: Record<string, { label: string; definition: string }> = {
    EDI: {
        label: 'EDI',
        definition: 'Electronic Data Interchange — vendor sends the invoice directly into CORE. No OCR, no re-keying.',
    },
    'CORE': {
        label: 'CORE',
        definition: 'MBI\'s ERP system. Strata interacts with it via RPA — there is no direct API yet.',
    },
    'OCR': {
        label: 'OCR',
        definition: 'Optical Character Recognition — Strata reads the PDF bill and extracts every field automatically.',
    },
    'RPA': {
        label: 'RPA',
        definition: 'Robotic Process Automation — a Strata bot fills the CORE voucher form so no one types it manually.',
    },
    'OCR_RPA': {
        label: 'OCR + RPA',
        definition: 'Paper bill flow: Strata reads the PDF (OCR) then posts the voucher into CORE via a bot (RPA).',
    },
    'EDI_CORE': {
        label: 'EDI · CORE native',
        definition: 'Vendor pushes the invoice directly into CORE. Strata validates it — no OCR, no bot needed.',
    },
    'GPO': {
        label: 'GPO',
        definition: 'Group Purchasing Organization. Healthcare clients (e.g. Riverside Medical) belong to HealthTrust GPO — MBI must report a 3% rebate on every bill tied to a GPO project.',
    },
    'HealthTrust': {
        label: 'HealthTrust GPO',
        definition: 'The GPO that covers MBI\'s healthcare clients. Per MBI\'s master agreement, a 3% rebate line auto-appends to every healthcare bill and posts to the GPO payable account — outside CORE.',
    },
    'GPO_rebate': {
        label: '3% GPO rebate',
        definition: 'A 3% amount MBI owes HealthTrust per purchase from a GPO member client. Posts to GPO payable — it\'s not a discount to the client.',
    },
    'SIF': {
        label: 'SIF',
        definition: 'Standard Interchange Format — the XML file CET exports with every furniture item, qty, finish, and dimension for a project.',
    },
    'CET': {
        label: 'CET',
        definition: 'Computer-aided design tool used by MBI\'s designers to spec furniture layouts. Source of the SIF export.',
    },
    'CAP': {
        label: 'CAP',
        definition: 'Capital worksheet — a pricing spreadsheet the designer exports alongside the SIF with cost and sell figures.',
    },
    'BOM': {
        label: 'BOM',
        definition: 'Bill of Materials — itemized list of every product in the quote with quantities, finishes, and pricing.',
    },
    'AR_escalated': {
        label: 'Escalated',
        definition: '30+ days past due. Strata flags it and loops in the salesperson — the client relationship needs a direct call.',
    },
    'AR_no_response': {
        label: 'No response',
        definition: 'Invoice sent, multiple follow-ups attempted, no reply. Needs a direct email or call this week.',
    },
    'AR_committed': {
        label: 'Committed to pay',
        definition: 'Client confirmed payment date in writing. Strata tracks the commitment and resurfaces it if the date passes.',
    },
    'AR_pending': {
        label: 'Pending approval',
        definition: 'Invoice sent to the client — waiting on their internal PO approval before payment is released.',
    },
    'invoice_exception': {
        label: 'Exception',
        definition: 'Line items, quantities, or amounts don\'t match the PO. Strata flags it — a human must decide before posting.',
    },
}
