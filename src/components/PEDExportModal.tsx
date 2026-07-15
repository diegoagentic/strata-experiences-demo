import { Dialog, DialogPanel, Transition, TransitionChild, Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { Fragment, useRef, useState, useCallback, useEffect } from 'react';
import {
    XMarkIcon, ArrowDownTrayIcon, PrinterIcon, DocumentTextIcon,
    CalendarIcon, TruckIcon, CheckCircleIcon, ExclamationTriangleIcon,
    ChevronUpDownIcon, CheckIcon, DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

// --- Types ---

export type PEDDocumentType = 'order' | 'quote' | 'acknowledgment';

interface LineItemConfig {
    label: string;
    value: string;
}

interface LineItem {
    lineRef: number;
    itemNumber: string;
    description: string;
    qtyReq: number;
    qtyShip: number;
    qtyBO: number;
    listPrice: string;
    discPct: string;
    netPrice: string;
    amount: string;
    tag: string;        // location/zone grouping
    configs?: LineItemConfig[];  // finish, edge, laminate, fabric, etc.
}

export interface PEDData {
    type: PEDDocumentType;
    id: string;
    salesOrderNumber: string;
    status: string;
    orderDate: string;
    // Manufacturer / Vendor
    vendorName: string;
    vendorAddress: string;
    vendorPhone: string;
    // Bill To
    billToName: string;
    billToAddress: string;
    billToPhone: string;
    // Ship To
    shipToName: string;
    shipToAddress: string;
    shipToDeliveryContact: string;
    // Order metadata
    poNumber: string;
    shipVia: string;
    terms: string;
    fob: string;
    custSvcRep: string;
    salesRep: string;
    salesRepEmail: string;
    projMgr: string;
    designChk: string;
    eta: string;
    discountStructure: string;
    spaNumber: string;
    project: string;
    specialShippingInstructions: string;
    // Lines
    lineItems: LineItem[];
    // Totals
    totalListProducts: string;
    totalNetProducts: string;
    totalFreight: string;
    totalProductWeight: string;
    nontaxableSubtotal: string;
    taxableSubtotal: string;
    tax: string;
    totalOrder: string;
    // Material specs summary
    materialSpecs: { label: string; value: string }[];
    // Type-specific
    validUntil?: string;          // quotes
    discrepancyNotes?: string;    // acks
    notes?: string;
}

// --- Mock data generators ---

const MOCK_LINE_ITEMS: LineItem[] = [
    {
        lineRef: 1, itemNumber: 'T-RCR306029HLG2', description: 'TBL, REC, 2mm, 30Dx60Wx29H, HAL, GLD V2',
        qtyReq: 37, qtyShip: 0, qtyBO: 0, listPrice: '$3,603.00', discPct: '84.75', netPrice: '$549.46', amount: '$20,330.02',
        tag: '1-L-SHAPED OFFICES',
        configs: [
            { label: '2mm Edge Selection', value: 'RO-E5269-2mm Edge - Landmark' },
            { label: 'Laminate Choice', value: 'RO-L0443-A-Laminate - Landmark' },
            { label: '30" Base Color', value: 'Hat Base, 3 Seg, 50x80, 2 Leg, 30d, Black' },
        ],
    },
    {
        lineRef: 2, itemNumber: 'X-BBFPFS182812', description: 'CBX Full Depth BBF Ped 18Dx28Hx12W',
        qtyReq: 37, qtyShip: 0, qtyBO: 0, listPrice: '$1,782.00', discPct: '84.75', netPrice: '$271.76', amount: '$10,055.12',
        tag: '1-L-SHAPED OFFICES',
        configs: [
            { label: 'Case Finish', value: 'RO-L1433-Laminate Casegoods - Landmark' },
            { label: 'Handle', value: 'Bar Pull Painted Black' },
            { label: 'Lock Choice', value: 'Black Lock' },
            { label: 'Drawer Face Finish', value: 'RO-L1433-Laminate Casegoods - Landmark' },
        ],
    },
    {
        lineRef: 3, itemNumber: 'W-WS3072', description: 'WORKSURFACE - RECT - 30D X 72W X 1 1/8TH',
        qtyReq: 17, qtyShip: 0, qtyBO: 0, listPrice: '$1,147.00', discPct: '84.75', netPrice: '$174.92', amount: '$2,973.64',
        tag: '2-U-SHAPED OFFICE',
        configs: [
            { label: '2mm Edge Selection', value: 'RO-E5269-2mm Edge - Landmark' },
            { label: 'Grommet Hole Option', value: 'Option A - No Additional Grommets' },
            { label: 'Laminate Selection', value: 'RO-L0443-A-Laminate - Landmark' },
        ],
    },
    {
        lineRef: 4, itemNumber: 'S-LATJJ2D36', description: 'LATERAL FILE VER 2 L-SERIES R PULL 2 DRAWER 36"',
        qtyReq: 10, qtyShip: 0, qtyBO: 0, listPrice: '$2,337.00', discPct: '84.75', netPrice: '$356.39', amount: '$3,563.90',
        tag: '1-L-SHAPED OFFICES',
        configs: [
            { label: 'Paint Selection', value: 'RO-P0002-Bk - Black' },
        ],
    },
    {
        lineRef: 5, itemNumber: 'X-LSWM167212H', description: 'CBX Wall Mounted L Shelf HORZ 16Hx72Wx12D',
        qtyReq: 37, qtyShip: 0, qtyBO: 0, listPrice: '$1,073.00', discPct: '84.75', netPrice: '$163.63', amount: '$6,054.31',
        tag: '1-L-SHAPED OFFICES',
        configs: [
            { label: 'Case Finish', value: 'RO-L1433-Laminate Casegoods - Landmark' },
            { label: 'Case Finish 1 1/8"', value: 'RO-L0284-Laminate - Black' },
        ],
    },
    {
        lineRef: 6, itemNumber: 'X-WP1636WB', description: 'Calibrate Whiteboard Wall Panel 16H x36W',
        qtyReq: 37, qtyShip: 0, qtyBO: 0, listPrice: '$800.00', discPct: '84.75', netPrice: '$122.00', amount: '$4,514.00',
        tag: '1-L-SHAPED OFFICES',
        configs: [
            { label: 'Case Wb Finish 3/4"', value: 'RO-L0349-07-Laminate - Brite White Markerboard' },
        ],
    },
    {
        lineRef: 7, itemNumber: 'F-SSC346030C', description: 'LB LOUNGE 2 SEAT 34"H X 60"W X 30" OPEN BASE',
        qtyReq: 4, qtyShip: 0, qtyBO: 0, listPrice: '$1,940.00', discPct: '60', netPrice: '$776.00', amount: '$3,104.00',
        tag: 'MAIN CONF. ROOM',
        configs: [
            { label: 'Case Finish 1 1/8"', value: 'RO-L0443-A-Laminate - Landmark' },
            { label: 'Fabric Back 1', value: 'RO-FU1317-Wellesley Ocean' },
            { label: 'Fabric Back 2', value: 'RO-FU1323-Terrain Bluebird' },
            { label: 'Fabric Seat 1', value: 'RO-FU1317-Wellesley Ocean' },
        ],
    },
    {
        lineRef: 8, itemNumber: '7730', description: 'AUBURN GRAY CONFERENCE CHAIR - EXPRESS',
        qtyReq: 23, qtyShip: 0, qtyBO: 0, listPrice: '$1,129.00', discPct: '62', netPrice: '$429.02', amount: '$9,867.46',
        tag: 'MAIN CONF. ROOM',
    },
    {
        lineRef: 9, itemNumber: 'X-LTD661218L', description: 'CBX Triple Door Locker Left 66h x 12w x 18d',
        qtyReq: 5, qtyShip: 0, qtyBO: 0, listPrice: '$3,211.00', discPct: '84.75', netPrice: '$489.68', amount: '$2,448.40',
        tag: 'LOCKER AREA',
        configs: [
            { label: 'Case Finish', value: 'RO-L1001-Laminate Casegoods - Black' },
            { label: 'Front Finish', value: 'RO-L1433-Laminate Casegoods - Landmark' },
            { label: 'Handle', value: 'Bar Pull Painted Black' },
            { label: 'Lock', value: 'Black Lock' },
        ],
    },
    {
        lineRef: 10, itemNumber: 'SER-DELIVERYI', description: 'DELIVERY - INCLUDED (NO CHARGE, THIRD PARTY OR COLLECT)',
        qtyReq: 1, qtyShip: 0, qtyBO: 0, listPrice: '$0.00', discPct: '0', netPrice: '$0.00', amount: '$0.00',
        tag: 'SERVICE',
    },
];

export function getMockPEDData(type: PEDDocumentType, id?: string): PEDData {
    const base: Omit<PEDData, 'type' | 'id' | 'salesOrderNumber' | 'status' | 'orderDate'> = {
        vendorName: 'Strata — Strata Experience Platform',
        vendorAddress: '25 Tucker Drive\nLeominster, MA 01453 USA',
        vendorPhone: '978/562-7500',
        billToName: 'Corporate Interior Systems',
        billToAddress: '3311 East Broadway Road\nSuite A\nPhoenix, AZ 85040 USA',
        billToPhone: '602/304-0100',
        shipToName: 'Corporate Furniture Services',
        shipToAddress: '135 E Watkins St\nPhoenix, AZ 85004 USA',
        shipToDeliveryContact: 'Warehouse - 480/640-2818 - warehouse@cfsinaz.com',
        poNumber: '8648-19240',
        shipVia: 'MAIN',
        terms: 'Net 30 Days',
        fob: 'ORIGIN',
        custSvcRep: 'CAT',
        salesRep: '*FNA',
        salesRepEmail: 'cchestnut@cisinphx.com',
        projMgr: '',
        designChk: '',
        eta: '04/24/26',
        discountStructure: 'SPA #: OACA3A006YPD',
        spaNumber: 'OACA3A006YPD',
        project: 'Premier Underground',
        specialShippingInstructions: 'Call Before Delivery — Warehouse 480/640-2818',
        lineItems: MOCK_LINE_ITEMS,
        totalListProducts: '$702,599.00',
        totalNetProducts: '$127,880.17',
        totalFreight: '$0.00',
        totalProductWeight: '14,820',
        nontaxableSubtotal: '$127,880.17',
        taxableSubtotal: '$0.00',
        tax: '$0.00',
        totalOrder: '$127,880.17',
        materialSpecs: [
            { label: 'Fabric', value: 'Wellesley Ocean, Terrain Bluebird' },
            { label: 'Trim', value: 'BK (Black)' },
            { label: 'Laminate', value: 'Black (A-T-S-L203), Landmark 7981K-12 (A-T-W)' },
            { label: 'Casegoods Laminate', value: 'Black (A-T-TFL), Landmark 7981K-12 (A-T-TFL)' },
            { label: 'Edge', value: '2MM - Landmark 7981' },
            { label: 'Markerboard', value: 'Formica Brite White HPL 11/16"' },
        ],
        notes: 'Installation to be scheduled in phases. Weekend installation preferred. Loading dock access confirmed with building management.',
    };

    const orderVariants: Record<string, { so: string; status: string; date: string }> = {
        '#ORD-2055': { so: '1151064-B', status: 'PO received', date: '12/20/25' },
        '#ORD-2054': { so: '1148032-A', status: 'In production', date: '11/15/25' },
        '#ORD-2053': { so: '1145091-C', status: 'Ready to ship', date: '10/30/25' },
        '#ORD-2052': { so: '1142007-A', status: 'Delivered', date: '10/15/25' },
        '#ORD-2051': { so: '1155019-B', status: 'PO received', date: '01/05/26' },
    };

    // Post-Neocon-review (2026-06-05) · E.1.i: Draft → In Progress, Approved → Sent (terminal).
    const quoteVariants: Record<string, { so: string; status: string; date: string; valid: string }> = {
        'QT-1025': { so: 'QT-2026-1025', status: 'Sent', date: '01/12/26', valid: '02/12/26' },
        'QT-1024': { so: 'QT-2026-1024', status: 'In Progress', date: '01/10/26', valid: '02/10/26' },
        'QT-1023': { so: 'QT-2026-1023', status: 'Sent', date: '01/08/26', valid: '02/08/26' },
        'QT-1022': { so: 'QT-2025-1022', status: 'Sent', date: '12/28/25', valid: '01/28/26' },
    };

    const ackVariants: Record<string, { so: string; status: string; date: string; notes: string }> = {
        'ACK-8839': { so: '1151064-B', status: 'Confirmed', date: '01/14/26', notes: 'None — All line items confirmed as ordered.' },
        'ACK-8840': { so: '1148032-A', status: 'Discrepancy', date: '01/13/26', notes: 'Price Mismatch on Line 3 — List $3,603 vs Ack $3,450. Quantity shortfall Line 7: Req 4, Ack 2.' },
        'ACK-8841': { so: '1145091-C', status: 'Partial', date: '01/12/26', notes: 'Lines 2, 5, 9 backordered — ETA updated to 03/15/26.' },
    };

    if (type === 'order') {
        const v = orderVariants[id || '#ORD-2055'] || orderVariants['#ORD-2055'];
        return {
            ...base,
            type: 'order',
            id: id || '#ORD-2055',
            salesOrderNumber: v.so,
            status: v.status,
            orderDate: v.date,
        };
    }

    if (type === 'quote') {
        const v = quoteVariants[id || 'QT-1025'] || quoteVariants['QT-1025'];
        return {
            ...base,
            type: 'quote',
            id: id || 'QT-1025',
            salesOrderNumber: v.so,
            status: v.status,
            orderDate: v.date,
            validUntil: v.valid,
        };
    }

    // acknowledgment
    const v = ackVariants[id || 'ACK-8839'] || ackVariants['ACK-8839'];
    return {
        ...base,
        type: 'acknowledgment',
        id: id || 'ACK-8839',
        salesOrderNumber: v.so,
        status: v.status,
        orderDate: v.date,
        discrepancyNotes: v.notes,
    };
}

// --- Document selector options per type ---

interface DocOption { id: string; label: string; sub: string }

const DOCUMENT_OPTIONS: Record<PEDDocumentType, DocOption[]> = {
    order: [
        { id: '#ORD-2055', label: '#ORD-2055', sub: 'AutoManfacture Co. — $385,000' },
        { id: '#ORD-2054', label: '#ORD-2054', sub: 'TechDealer Solutions — $62,500' },
        { id: '#ORD-2053', label: '#ORD-2053', sub: 'Urban Living Inc. — $112,000' },
        { id: '#ORD-2052', label: '#ORD-2052', sub: 'Global Logistics — $45,000' },
        { id: '#ORD-2051', label: '#ORD-2051', sub: 'City Builders — $120,000' },
    ],
    quote: [
        { id: 'QT-1025', label: 'QT-1025', sub: 'Apex Furniture — $43,750' },
        { id: 'QT-1024', label: 'QT-1024', sub: 'BioLife Inc — $540,000' },
        { id: 'QT-1023', label: 'QT-1023', sub: 'FinServe Corp — $890,000' },
        { id: 'QT-1022', label: 'QT-1022', sub: 'Redwood School — $150,000' },
    ],
    acknowledgment: [
        { id: 'ACK-8839', label: 'ACK-8839', sub: 'Herman Miller — Confirmed' },
        { id: 'ACK-8840', label: 'ACK-8840', sub: 'Steelcase — Discrepancy' },
        { id: 'ACK-8841', label: 'ACK-8841', sub: 'Knoll — Partial' },
    ],
};

// --- Component ---

interface PEDExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: PEDData | null;
    /** 'export' (default) shows Print + Export PDF; 'duplicate' shows a single Duplicate CTA. */
    purpose?: 'export' | 'duplicate';
    /** Called when the Duplicate CTA is clicked (purpose='duplicate'). */
    onDuplicate?: () => void;
}

const typeLabels: Record<PEDDocumentType, string> = {
    order: 'Purchase Order',
    quote: 'Quote Estimate',
    acknowledgment: 'Acknowledgement',
};

const statusColors: Record<string, string> = {
    'In production': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    'PO received': 'bg-zinc-100 text-muted-foreground dark:bg-zinc-800 dark:text-zinc-300',
    'Ready to ship': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'Delivered': 'bg-gray-100 text-foreground dark:bg-gray-800 dark:text-gray-300',
    'Sent': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Draft': 'bg-zinc-100 text-muted-foreground dark:bg-zinc-800 dark:text-zinc-300',
    'Confirmed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'Discrepancy': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    'Partial': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
};

export default function PEDExportModal({ isOpen, onClose, data: initialData, purpose = 'export', onDuplicate }: PEDExportModalProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [activeData, setActiveData] = useState<PEDData | null>(initialData);
    const [selectedDocId, setSelectedDocId] = useState<string>('');
    const printRef = useRef<HTMLDivElement>(null);

    // Sync internal state when parent passes new data (opening modal)
    useEffect(() => {
        if (initialData) {
            setActiveData(initialData);
            setSelectedDocId(initialData.id);
        }
    }, [initialData]);

    const data = activeData;
    const label = data ? typeLabels[data.type] : '';
    const docOptions = data ? DOCUMENT_OPTIONS[data.type] : [];

    const handleDocChange = (docId: string) => {
        if (!data) return;
        setSelectedDocId(docId);
        setActiveData(getMockPEDData(data.type, docId));
    };

    const buildPdfHtml = useCallback(() => {
        if (!data) return '';
        const grouped = data.lineItems.reduce<Record<string, LineItem[]>>((acc, item) => {
            if (!acc[item.tag]) acc[item.tag] = [];
            acc[item.tag].push(item);
            return acc;
        }, {});

        const lineRows = Object.entries(grouped).map(([, items]) =>
            items.map((item, idx) => `
                <tr style="${idx === 0 ? 'border-top:2px solid #d4d4d8;' : ''}">
                    <td style="padding:5px 6px;border:1px solid #e4e4e7;font-size:11px;font-weight:600;color:#3f3f46;vertical-align:top;">${item.lineRef}</td>
                    <td style="padding:5px 4px;border:1px solid #e4e4e7;font-size:11px;color:#3f3f46;text-align:center;vertical-align:top;">${item.qtyReq}</td>
                    <td style="padding:5px 4px;border:1px solid #e4e4e7;font-size:11px;color:#71717a;text-align:center;vertical-align:top;">${item.qtyShip}</td>
                    <td style="padding:5px 6px;border:1px solid #e4e4e7;font-size:10px;font-family:monospace;color:#52525b;vertical-align:top;">${item.itemNumber}</td>
                    <td style="padding:5px 6px;border:1px solid #e4e4e7;vertical-align:top;">
                        <div style="font-size:11px;color:#18181b;font-weight:500;">${item.description}</div>
                        <div style="font-size:9px;color:#0ea5e9;font-weight:600;margin-top:3px;">Tag: ${item.tag}</div>
                        ${item.configs ? item.configs.map(c => `<div style="font-size:9px;color:#a1a1aa;margin-top:1px;"><span style="color:#71717a;">${c.label}:</span> ${c.value}</div>`).join('') : ''}
                    </td>
                    <!-- Disc % cell omitted on PO export per Wendy PDF item 10 (Neocon-review 2026-06-05). -->
                    ${data.type === 'acknowledgment' ? `<td style="padding:5px 6px;border:1px solid #e4e4e7;font-size:11px;color:#52525b;text-align:right;vertical-align:top;">${item.discPct}</td>` : ''}
                    <td style="padding:5px 6px;border:1px solid #e4e4e7;font-size:11px;color:#71717a;text-align:right;vertical-align:top;">${item.listPrice}</td>
                    <td style="padding:5px 6px;border:1px solid #e4e4e7;font-size:11px;color:#52525b;text-align:right;vertical-align:top;">${item.netPrice}</td>
                    <td style="padding:5px 6px;border:1px solid #e4e4e7;font-size:11px;font-weight:600;color:#18181b;text-align:right;vertical-align:top;">${item.amount}</td>
                </tr>
            `).join('')
        ).join('');

        return `
        <div style="font-family:'Inter',system-ui,-apple-system,sans-serif;color:#18181b;max-width:860px;margin:0 auto;padding:24px 32px;background:#fff;font-size:12px;">
            <!-- HEADER -->
            <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:12px;border-bottom:2px solid #18181b;margin-bottom:16px;">
                <div>
                    <div style="font-size:18px;font-weight:700;color:#18181b;">${data.vendorName.split('—')[0].trim()}</div>
                    <div style="font-size:10px;color:#71717a;white-space:pre-line;margin-top:4px;">${data.vendorAddress}</div>
                    <div style="font-size:10px;color:#71717a;">Tel: ${data.vendorPhone}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#71717a;">${label}</div>
                    <div style="font-size:18px;font-weight:800;color:#18181b;margin-top:2px;">${data.salesOrderNumber}</div>
                    <div style="font-size:11px;color:#52525b;margin-top:4px;">Order Date: <strong>${data.orderDate}</strong></div>
                    <span style="display:inline-block;margin-top:6px;padding:2px 10px;border-radius:12px;font-size:10px;font-weight:600;background:#e0e7ff;color:#4338ca;">${data.status}</span>
                </div>
            </div>

            ${data.specialShippingInstructions ? `
            <div style="background:#fef9c3;border:1px solid #fde047;border-radius:6px;padding:6px 12px;font-size:11px;font-weight:600;color:#854d0e;margin-bottom:14px;text-align:center;">
                ⚠ ${data.specialShippingInstructions}
            </div>` : ''}

            <!-- BILL TO / SHIP TO -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;border:1px solid #e4e4e7;border-radius:6px;padding:12px;margin-bottom:14px;">
                <div>
                    <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#a1a1aa;margin-bottom:4px;">Bill To:</div>
                    <div style="font-size:12px;font-weight:600;color:#18181b;">${data.billToName}</div>
                    <div style="font-size:10px;color:#52525b;white-space:pre-line;margin-top:2px;">${data.billToAddress}</div>
                    <div style="font-size:10px;color:#71717a;margin-top:2px;">Tel: ${data.billToPhone}</div>
                </div>
                <div>
                    <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#a1a1aa;margin-bottom:4px;">Ship To:</div>
                    <div style="font-size:12px;font-weight:600;color:#18181b;">${data.shipToName}</div>
                    <div style="font-size:10px;color:#52525b;white-space:pre-line;margin-top:2px;">${data.shipToAddress}</div>
                    <div style="font-size:10px;color:#71717a;margin-top:2px;">Delivery Contact: ${data.shipToDeliveryContact}</div>
                </div>
            </div>

            <!-- METADATA GRID -->
            <div style="border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;margin-bottom:14px;">
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#e4e4e7;">
                    ${[
                        ['P.O. No.', data.poNumber], ['Ship Via', data.shipVia], ['Cust Svc Rep', data.custSvcRep], ['Design Chk', data.designChk || '—'],
                        ['Terms', data.terms], ['F.O.B.', data.fob], ['Sales Rep', data.salesRep], ['ETA', data.eta],
                    ].map(([l, v]) => `<div style="background:#fff;padding:6px 8px;"><div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#a1a1aa;">${l}</div><div style="font-size:11px;font-weight:500;color:#18181b;margin-top:2px;">${v}</div></div>`).join('')}
                </div>
                <div style="background:#fff;padding:6px 8px;border-top:1px solid #e4e4e7;">
                    <span style="font-size:8px;font-weight:700;text-transform:uppercase;color:#a1a1aa;">Discount Structure: </span>
                    <span style="font-size:11px;font-weight:500;color:#18181b;">${data.discountStructure}</span>
                    <span style="margin-left:16px;font-size:8px;font-weight:700;text-transform:uppercase;color:#a1a1aa;">Project: </span>
                    <span style="font-size:11px;font-weight:600;color:#18181b;">${data.project}</span>
                </div>
                <div style="background:#fff;padding:6px 8px;border-top:1px solid #e4e4e7;">
                    <span style="font-size:8px;font-weight:700;text-transform:uppercase;color:#a1a1aa;">Salesperson: </span>
                    <span style="font-size:10px;color:#52525b;">${data.salesRepEmail} : Chestnut, Crystal</span>
                </div>
                ${data.type === 'quote' && data.validUntil ? `
                <div style="background:#eff6ff;padding:6px 8px;border-top:1px solid #bfdbfe;">
                    <span style="font-size:8px;font-weight:700;text-transform:uppercase;color:#2563eb;">Expiration Date: </span>
                    <span style="font-size:11px;font-weight:600;color:#1e40af;">${data.validUntil}</span>
                </div>` : ''}
            </div>

            <!-- LINE ITEMS TABLE -->
            <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
                <thead>
                    <tr style="background:#f4f4f5;">
                        <th style="padding:5px 6px;border:1px solid #d4d4d8;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#71717a;text-align:left;">Line</th>
                        <th style="padding:5px 4px;border:1px solid #d4d4d8;font-size:9px;font-weight:700;text-transform:uppercase;color:#71717a;text-align:center;" colspan="2">Qty</th>
                        <th style="padding:5px 6px;border:1px solid #d4d4d8;font-size:9px;font-weight:700;text-transform:uppercase;color:#71717a;text-align:left;">Item Number</th>
                        <th style="padding:5px 6px;border:1px solid #d4d4d8;font-size:9px;font-weight:700;text-transform:uppercase;color:#71717a;text-align:left;">Description</th>
                        <!-- Post-Neocon-review (2026-06-05) · Wendy PDF item 10: Disc % column removed from PO export. -->
                        ${data.type === 'acknowledgment' ? `<th style="padding:5px 6px;border:1px solid #d4d4d8;font-size:9px;font-weight:700;text-transform:uppercase;color:#71717a;text-align:right;">Disc %</th>` : ''}
                        <th style="padding:5px 6px;border:1px solid #d4d4d8;font-size:9px;font-weight:700;text-transform:uppercase;color:#71717a;text-align:right;">List</th>
                        <th style="padding:5px 6px;border:1px solid #d4d4d8;font-size:9px;font-weight:700;text-transform:uppercase;color:#71717a;text-align:right;">${data.type === 'quote' ? 'List Price' : 'Unit Price'}</th>
                        <th style="padding:5px 6px;border:1px solid #d4d4d8;font-size:9px;font-weight:700;text-transform:uppercase;color:#71717a;text-align:right;">Amount</th>
                    </tr>
                    <tr style="background:#fafafa;">
                        <th style="padding:2px 6px;border:1px solid #e4e4e7;font-size:8px;color:#a1a1aa;">Ref.</th>
                        <th style="padding:2px 4px;border:1px solid #e4e4e7;font-size:8px;color:#a1a1aa;">Req.</th>
                        <th style="padding:2px 4px;border:1px solid #e4e4e7;font-size:8px;color:#a1a1aa;">Ship</th>
                        <th style="padding:2px 6px;border:1px solid #e4e4e7;"></th>
                        <th style="padding:2px 6px;border:1px solid #e4e4e7;"></th>
                        <th style="padding:2px 6px;border:1px solid #e4e4e7;"></th>
                        <th style="padding:2px 6px;border:1px solid #e4e4e7;"></th>
                        <th style="padding:2px 6px;border:1px solid #e4e4e7;"></th>
                        <th style="padding:2px 6px;border:1px solid #e4e4e7;"></th>
                    </tr>
                </thead>
                <tbody>${lineRows}</tbody>
            </table>

            <!-- MATERIAL SPECS + TOTALS -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px;">
                <div style="border:1px solid #e4e4e7;border-radius:6px;padding:10px;">
                    <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#a1a1aa;margin-bottom:6px;">Material Specifications</div>
                    ${data.materialSpecs.map(s => `<div style="font-size:10px;color:#71717a;margin-bottom:2px;"><span style="font-weight:600;color:#52525b;">${s.label}:</span> ${s.value}</div>`).join('')}
                </div>
                <div>
                    ${[
                        ['Total List Products', data.totalListProducts],
                        ['Total Net Products', data.totalNetProducts],
                        ['Total Freight', data.totalFreight],
                    ].map(([l, v]) => `<div style="display:flex;justify-content:space-between;font-size:11px;color:#52525b;padding:3px 0;"><span>${l}</span><span style="font-weight:500;">${v}</span></div>`).join('')}
                    <div style="display:flex;justify-content:space-between;font-size:11px;color:#71717a;padding:3px 0;border-top:1px solid #e4e4e7;margin-top:4px;">
                        <span>Total Product Weight</span><span>${data.totalProductWeight} lbs</span>
                    </div>
                    <!-- Post-Neocon-review (2026-06-05) · Wendy PDF item 9:
                         Nontaxable Subtotal / Taxable Subtotal / Tax removed from Quote export
                         ("we don't add these lines in the quote"). -->
                    ${data.type !== 'quote' ? `<div style="border-top:1px solid #e4e4e7;margin-top:6px;padding-top:6px;">${[
                            ['Nontaxable Subtotal', data.nontaxableSubtotal],
                            ['Taxable Subtotal', data.taxableSubtotal],
                            ['Tax', data.tax],
                        ].map(([l, v]) => `<div style="display:flex;justify-content:space-between;font-size:11px;color:#52525b;padding:2px 0;"><span>${l}</span><span>${v}</span></div>`).join('')}</div>` : ''}
                    <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:800;color:#18181b;padding:8px 10px;margin-top:8px;border-top:2px solid #18181b;background:#fefce8;border-radius:4px;">
                        <span>Total Order</span><span>${data.totalOrder}</span>
                    </div>
                </div>
            </div>

            <!-- SHIPPING INFO -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:10px 14px;background:#fafafa;border:1px solid #e4e4e7;border-radius:6px;margin-bottom:14px;">
                <div><div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#a1a1aa;">Ship Via</div><div style="font-size:11px;font-weight:500;color:#3f3f46;">${data.shipVia}</div></div>
                <div><div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#a1a1aa;">ETA</div><div style="font-size:11px;font-weight:500;color:#3f3f46;">${data.eta}</div></div>
                <div><div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#a1a1aa;">F.O.B.</div><div style="font-size:11px;font-weight:500;color:#3f3f46;">${data.fob}</div></div>
            </div>

            ${data.type === 'acknowledgment' && data.discrepancyNotes ? `
            <div style="padding:10px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;margin-bottom:14px;">
                <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#166534;margin-bottom:3px;">✓ Discrepancy Check</div>
                <div style="font-size:11px;color:#166534;">${data.discrepancyNotes}</div>
            </div>` : ''}

            ${data.notes ? `
            <div style="padding:10px 14px;background:#fafafa;border:1px solid #e4e4e7;border-radius:6px;margin-bottom:14px;">
                <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#a1a1aa;margin-bottom:3px;">Notes & Special Instructions</div>
                <div style="font-size:11px;color:#52525b;line-height:1.5;">${data.notes}</div>
            </div>` : ''}

            <!-- FOOTER -->
            <div style="text-align:center;padding-top:12px;border-top:1px solid #e4e4e7;">
                <div style="font-size:9px;color:#a1a1aa;">Customer Original — Page 1 • Generated by <strong>Strata Experience Platform</strong></div>
                <div style="font-size:9px;color:#a1a1aa;margin-top:2px;">${label} ${data.salesOrderNumber} • ${data.vendorName} • ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
        </div>`;
    }, [data, label]);

    const handleExport = useCallback(async () => {
        if (isExporting || !data) return;
        setIsExporting(true);

        try {
            const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
                import('html2canvas'),
                import('jspdf'),
            ]);

            // Build clean HTML with inline styles only (no Tailwind) for html2canvas compatibility
            const htmlContent = buildPdfHtml();

            const offscreen = document.createElement('div');
            offscreen.style.cssText = 'position:fixed;left:-9999px;top:0;width:900px;background:#fff;';
            offscreen.innerHTML = htmlContent;
            document.body.appendChild(offscreen);

            const target = offscreen.firstElementChild as HTMLElement;
            const canvas = await html2canvas(target, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                width: 900,
                windowWidth: 900,
            });

            document.body.removeChild(offscreen);

            // Generate PDF — letter size (8.5 x 11 in)
            const pageWidth = 215.9;
            const pageHeight = 279.4;
            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'letter');
            const yOffset = 10;

            if (imgHeight <= pageHeight - 20) {
                pdf.addImage(imgData, 'PNG', 10, yOffset, imgWidth, imgHeight);
            } else {
                const pageContentHeight = pageHeight - 20;
                const sourceSliceHeight = (pageContentHeight / imgWidth) * canvas.width;
                let sourceY = 0;
                let remaining = imgHeight;

                while (remaining > 0) {
                    const sliceH = Math.min(sourceSliceHeight, canvas.height - sourceY);
                    const sliceCanvas = document.createElement('canvas');
                    sliceCanvas.width = canvas.width;
                    sliceCanvas.height = sliceH;
                    const ctx = sliceCanvas.getContext('2d');
                    if (ctx) {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
                        ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
                    }
                    if (sourceY > 0) pdf.addPage();
                    pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 10, yOffset, imgWidth, (sliceH * imgWidth) / canvas.width);
                    sourceY += sliceH;
                    remaining -= pageContentHeight;
                }
            }

            const filename = `${label.replace(/\s+/g, '_')}_${data.salesOrderNumber}_${new Date().toISOString().slice(0, 10)}.pdf`;
            pdf.save(filename);
        } catch (err) {
            console.error('PDF export failed:', err);
        } finally {
            setIsExporting(false);
        }
    }, [data, label, isExporting, buildPdfHtml]);

    const handlePrint = () => {
        if (printRef.current && data) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html><head><title>${label} — ${data.salesOrderNumber}</title>
                    <style>
                        body { font-family: 'Inter', system-ui, sans-serif; color: #18181b; padding: 32px; max-width: 960px; margin: 0 auto; font-size: 12px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { padding: 5px 8px; text-align: left; border: 1px solid #d4d4d8; font-size: 11px; }
                        th { background: #f4f4f5; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: #52525b; }
                        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #18181b; padding-bottom: 12px; margin-bottom: 16px; }
                        .header-left { font-size: 18px; font-weight: 700; }
                        .header-right { text-align: right; }
                        .doc-type { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #71717a; }
                        .doc-id { font-size: 20px; font-weight: 800; }
                        .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; padding: 12px; border: 1px solid #d4d4d8; }
                        .party-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #71717a; margin-bottom: 4px; }
                        .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 8px; border: 1px solid #d4d4d8; margin-bottom: 16px; }
                        .meta-item label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #a1a1aa; display: block; }
                        .meta-item span { font-size: 11px; font-weight: 500; }
                        .configs { font-size: 10px; color: #71717a; padding: 2px 0; }
                        .configs span { color: #52525b; }
                        .tag { font-size: 10px; color: #0ea5e9; font-weight: 600; }
                        .totals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
                        .totals-right { text-align: right; }
                        .totals-right .row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; }
                        .totals-right .total-row { font-weight: 800; font-size: 14px; border-top: 2px solid #18181b; padding-top: 6px; margin-top: 6px; background: #fefce8; padding: 6px 8px; }
                        .specs { font-size: 10px; color: #71717a; padding: 8px; border: 1px solid #e4e4e7; margin-bottom: 8px; }
                        .specs strong { color: #52525b; }
                        .notes { background: #f4f4f5; padding: 12px; border-radius: 6px; font-size: 11px; margin-top: 16px; }
                        .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #d4d4d8; font-size: 10px; color: #a1a1aa; text-align: center; }
                        .call-before { background: #fef9c3; border: 1px solid #fde047; padding: 4px 8px; font-size: 11px; font-weight: 600; text-align: center; }
                        .amount-right { text-align: right; }
                        .center { text-align: center; }
                        @media print { body { padding: 16px; } }
                    </style></head><body>
                    ${printRef.current.innerHTML}
                    </body></html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    if (!data) return null;

    // Group line items by tag for visual separation
    const groupedItems = data.lineItems.reduce<Record<string, LineItem[]>>((acc, item) => {
        if (!acc[item.tag]) acc[item.tag] = [];
        acc[item.tag].push(item);
        return acc;
    }, {});

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-background border border-border shadow-2xl transition-all flex flex-col max-h-[92vh]">
                                {/* Toolbar */}
                                <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <DocumentTextIcon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-foreground">{purpose === 'duplicate' ? `Duplicate ${label}` : `PDF Preview — ${label}`}</h2>
                                            <p className="text-xs text-muted-foreground">{data.salesOrderNumber} • {data.vendorName.split('—')[0].trim()}</p>
                                        </div>
                                        {/* Document Selector */}
                                        {docOptions.length > 1 && (
                                            <Listbox value={selectedDocId} onChange={handleDocChange}>
                                                <div className="relative ml-2">
                                                    <ListboxButton className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted transition-colors cursor-pointer min-w-[180px]">
                                                        <span className="truncate text-foreground">{selectedDocId}</span>
                                                        <ChevronUpDownIcon className="w-4 h-4 text-muted-foreground ml-auto shrink-0" />
                                                    </ListboxButton>
                                                    <ListboxOptions className="absolute z-50 mt-1 w-72 rounded-lg bg-background border border-border shadow-xl py-1 max-h-60 overflow-auto scrollbar-micro focus:outline-none">
                                                        {docOptions.map((doc) => (
                                                            <ListboxOption
                                                                key={doc.id}
                                                                value={doc.id}
                                                                className={({ active, selected }) =>
                                                                    `relative cursor-pointer select-none px-3 py-2 ${active ? 'bg-muted' : ''} ${selected ? 'bg-primary/5' : ''}`
                                                                }
                                                            >
                                                                {({ selected }) => (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className={`text-xs font-medium truncate ${selected ? 'text-primary' : 'text-foreground'}`}>{doc.label}</p>
                                                                            <p className="text-[10px] text-muted-foreground truncate">{doc.sub}</p>
                                                                        </div>
                                                                        {selected && <CheckIcon className="w-4 h-4 text-primary shrink-0" />}
                                                                    </div>
                                                                )}
                                                            </ListboxOption>
                                                        ))}
                                                    </ListboxOptions>
                                                </div>
                                            </Listbox>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {purpose === 'duplicate' ? (
                                            <button
                                                onClick={onDuplicate}
                                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                            >
                                                <DocumentDuplicateIcon className="w-4 h-4" /> Duplicate this {label.toLowerCase()}
                                            </button>
                                        ) : (
                                            <>
                                                <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border">
                                                    <PrinterIcon className="w-4 h-4" /> Print
                                                </button>
                                                <button
                                                    onClick={handleExport}
                                                    disabled={isExporting}
                                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                                                >
                                                    {isExporting ? (
                                                        <><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Exporting...</>
                                                    ) : (
                                                        <><ArrowDownTrayIcon className="w-4 h-4" /> Export PDF</>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                        <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Document Preview */}
                                <div className="flex-1 overflow-y-auto scrollbar-micro p-6 bg-muted/50">
                                    <div ref={printRef} className="max-w-4xl mx-auto bg-card rounded-xl shadow-sm border border-border p-8 space-y-5">

                                        {/* === HEADER === */}
                                        <div className="flex items-start justify-between pb-4 border-b-2 border-zinc-900 dark:border-zinc-100">
                                            <div>
                                                <h1 className="text-xl font-bold text-foreground tracking-tight">{data.vendorName.split('—')[0].trim()}</h1>
                                                <p className="text-[11px] text-muted-foreground whitespace-pre-line mt-1">{data.vendorAddress}</p>
                                                <p className="text-[11px] text-muted-foreground">Tel: {data.vendorPhone}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                                                <p className="text-xl font-extrabold text-foreground mt-0.5">{data.salesOrderNumber}</p>
                                                <p className="text-sm text-muted-foreground mt-1">Order Date: <span className="font-semibold">{data.orderDate}</span></p>
                                                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusColors[data.status] || 'bg-zinc-100 text-muted-foreground'}`}>
                                                    {data.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* === CALL BEFORE DELIVERY === */}
                                        {data.specialShippingInstructions && (
                                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg px-4 py-2 flex items-center gap-2">
                                                <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">{data.specialShippingInstructions}</p>
                                            </div>
                                        )}

                                        {/* === BILL TO / SHIP TO === */}
                                        <div className="grid grid-cols-2 gap-6 border border-border rounded-lg p-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Bill To:</p>
                                                <p className="text-sm font-semibold text-foreground">{data.billToName}</p>
                                                <p className="text-xs text-muted-foreground whitespace-pre-line mt-1">{data.billToAddress}</p>
                                                <p className="text-xs text-muted-foreground mt-1">Tel: {data.billToPhone}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Ship To:</p>
                                                <p className="text-sm font-semibold text-foreground">{data.shipToName}</p>
                                                <p className="text-xs text-muted-foreground whitespace-pre-line mt-1">{data.shipToAddress}</p>
                                                <p className="text-xs text-muted-foreground mt-1">Delivery Contact: {data.shipToDeliveryContact}</p>
                                            </div>
                                        </div>

                                        {/* === ORDER METADATA GRID === */}
                                        <div className="border border-border rounded-lg overflow-hidden">
                                            <div className="grid grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-700">
                                                {[
                                                    { label: 'P.O. No.', value: data.poNumber },
                                                    { label: 'Ship Via', value: data.shipVia },
                                                    { label: 'Cust Svc Rep', value: data.custSvcRep },
                                                    { label: 'Design Chk', value: data.designChk || '—' },
                                                    { label: 'Terms', value: data.terms },
                                                    { label: 'F.O.B.', value: data.fob },
                                                    { label: 'Sales Rep', value: data.salesRep },
                                                    { label: 'ETA', value: data.eta },
                                                ].map((item, i) => (
                                                    <div key={i} className="bg-card px-3 py-2">
                                                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                                                        <p className="text-xs font-medium text-foreground mt-0.5">{item.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-card px-3 py-2 border-t border-border flex items-center gap-6">
                                                <div>
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Discount Structure: </span>
                                                    <span className="text-xs font-medium text-foreground">{data.discountStructure}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Project: </span>
                                                    <span className="text-xs font-semibold text-foreground">{data.project}</span>
                                                </div>
                                            </div>
                                            <div className="bg-card px-3 py-2 border-t border-border">
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Salesperson: </span>
                                                <span className="text-xs text-muted-foreground">{data.salesRepEmail} : Chestnut, Crystal</span>
                                            </div>
                                            {data.type === 'quote' && data.validUntil && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 border-t border-blue-200 dark:border-blue-800">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Expiration Date: </span>
                                                    <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">{data.validUntil}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* === LINE ITEMS TABLE === */}
                                        <div>
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-zinc-100 dark:bg-zinc-900/80 border-y border-border">
                                                        <th className="py-2 px-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground w-10">Line</th>
                                                        <th className="py-2 px-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground" colSpan={2}>Qty</th>
                                                        <th className="py-2 px-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Item Number</th>
                                                        <th className="py-2 px-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                                                        {/* Disc % column shown ONLY on Acknowledgement export.
                                                            Quote: Wendy PDF #10 ("remove the discount from the quote PDF").
                                                            PO: Wendy PDF #10 interpretation (manufacturer doesn't surface dealer's contract discount).
                                                            Ack: keeps the field so the dealer can verify the contract discount on the issued ack. */}
                                                        {data.type === 'acknowledgment' && (
                                                            <th className="py-2 px-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground text-right">Disc %</th>
                                                        )}
                                                        <th className="py-2 px-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground text-right">List</th>
                                                        <th className="py-2 px-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground text-right">{data.type === 'quote' ? 'List Price' : 'Unit Price'}</th>
                                                        <th className="py-2 px-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                                                    </tr>
                                                    <tr className="bg-muted/40 border-b border-border">
                                                        <th className="py-1 px-2 text-[8px] text-muted-foreground">Ref.</th>
                                                        <th className="py-1 px-1 text-[8px] text-muted-foreground">Req.</th>
                                                        <th className="py-1 px-1 text-[8px] text-muted-foreground">Ship</th>
                                                        <th className="py-1 px-2 text-[8px] text-muted-foreground"></th>
                                                        <th className="py-1 px-2 text-[8px] text-muted-foreground"></th>
                                                        <th className="py-1 px-2 text-[8px] text-muted-foreground"></th>
                                                        <th className="py-1 px-2 text-[8px] text-muted-foreground"></th>
                                                        <th className="py-1 px-2 text-[8px] text-muted-foreground"></th>
                                                        <th className="py-1 px-2 text-[8px] text-muted-foreground"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(groupedItems).map(([tag, items]) => (
                                                        <Fragment key={tag}>
                                                            {items.map((item, idx) => (
                                                                <Fragment key={item.lineRef}>
                                                                    <tr className={`border-b border-zinc-100 dark:border-zinc-800 ${idx === 0 ? 'border-t-2 border-t-zinc-200 dark:border-t-zinc-600' : ''}`}>
                                                                        <td className="py-2 px-2 text-xs font-semibold text-muted-foreground align-top">{item.lineRef}</td>
                                                                        <td className="py-2 px-1 text-xs text-muted-foreground align-top text-center">{item.qtyReq}</td>
                                                                        <td className="py-2 px-1 text-xs text-muted-foreground align-top text-center">{item.qtyShip}</td>
                                                                        <td className="py-2 px-2 text-xs font-mono text-muted-foreground align-top">{item.itemNumber}</td>
                                                                        <td className="py-2 px-2 align-top">
                                                                            <p className="text-xs text-foreground font-medium">{item.description}</p>
                                                                            <p className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold mt-1">Tag: {item.tag}</p>
                                                                            {item.configs && item.configs.length > 0 && (
                                                                                <div className="mt-1 space-y-0.5">
                                                                                    {item.configs.map((cfg, ci) => (
                                                                                        <p key={ci} className="text-[10px] text-muted-foreground">
                                                                                            <span className="text-muted-foreground dark:text-muted-foreground">{cfg.label}:</span>{' '}
                                                                                            <span className="text-muted-foreground">{cfg.value}</span>
                                                                                        </p>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        {/* Disc % cell shown only on Ack export (see header comment above for rationale). */}
                                                                        {data.type === 'acknowledgment' && (
                                                                            <td className="py-2 px-2 text-xs text-muted-foreground text-right align-top">{item.discPct}</td>
                                                                        )}
                                                                        <td className="py-2 px-2 text-xs text-muted-foreground text-right align-top">{item.listPrice}</td>
                                                                        <td className="py-2 px-2 text-xs text-muted-foreground text-right align-top">{item.netPrice}</td>
                                                                        <td className="py-2 px-2 text-xs font-semibold text-foreground text-right align-top">{item.amount}</td>
                                                                    </tr>
                                                                </Fragment>
                                                            ))}
                                                        </Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* === MATERIAL SPECS + TOTALS === */}
                                        <div className="grid grid-cols-2 gap-6">
                                            {/* Left: Material Specs */}
                                            <div className="border border-border rounded-lg p-3 space-y-1">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Material Specifications</p>
                                                {data.materialSpecs.map((spec, i) => (
                                                    <p key={i} className="text-[10px] text-muted-foreground">
                                                        <span className="font-semibold text-muted-foreground">{spec.label}:</span>{' '}
                                                        {spec.value}
                                                    </p>
                                                ))}
                                            </div>

                                            {/* Right: Totals */}
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Total List Products</span><span className="font-medium">{data.totalListProducts}</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Total Net Products</span><span className="font-medium">{data.totalNetProducts}</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Total Freight</span><span>{data.totalFreight}</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                                                    <span>Total Product Weight</span><span>{data.totalProductWeight} lbs</span>
                                                </div>
                                                {/* Post-Neocon-review (2026-06-05) · Wendy PDF item 9 — tax lines removed from Quote export. */}
                                                {data.type !== 'quote' && (
                                                    <div className="pt-2 mt-1 border-t border-border space-y-1">
                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                            <span>Nontaxable Subtotal</span><span>{data.nontaxableSubtotal}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                            <span>Taxable Subtotal</span><span>{data.taxableSubtotal}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                            <span>Tax</span><span>{data.tax}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-sm font-extrabold text-foreground pt-2 mt-2 border-t-2 border-zinc-900 dark:border-zinc-100 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-md -mx-1">
                                                    <span>Total Order</span><span>{data.totalOrder}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* === SHIPPING INFO === */}
                                        <div className="grid grid-cols-3 gap-4 py-3 px-4 rounded-lg bg-muted/50 border border-border">
                                            <div className="flex items-center gap-2">
                                                <TruckIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                                <div>
                                                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Ship Via</p>
                                                    <p className="text-xs font-medium text-muted-foreground">{data.shipVia}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                                <div>
                                                    <p className="text-[9px] text-muted-foreground uppercase font-bold">ETA</p>
                                                    <p className="text-xs font-medium text-muted-foreground">{data.eta}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <DocumentTextIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                                <div>
                                                    <p className="text-[9px] text-muted-foreground uppercase font-bold">F.O.B.</p>
                                                    <p className="text-xs font-medium text-muted-foreground">{data.fob}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* === DISCREPANCY CHECK (Acks only) === */}
                                        {data.type === 'acknowledgment' && data.discrepancyNotes && (
                                            <div className="py-3 px-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">Discrepancy Check</p>
                                                </div>
                                                <p className="text-xs text-green-700 dark:text-green-300">{data.discrepancyNotes}</p>
                                            </div>
                                        )}

                                        {/* === NOTES === */}
                                        {data.notes && (
                                            <div className="py-3 px-4 rounded-lg bg-muted/50 border border-border">
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Notes & Special Instructions</p>
                                                <p className="text-xs text-muted-foreground leading-relaxed">{data.notes}</p>
                                            </div>
                                        )}

                                        {/* === FOOTER === */}
                                        <div className="pt-4 border-t border-border text-center">
                                            <p className="text-[10px] text-muted-foreground">
                                                Customer Original — Page 1 • Generated by <span className="font-semibold">Strata Experience Platform</span>
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                {label} {data.salesOrderNumber} • {data.vendorName} • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
