import type { Notification } from './types';

export const mockNotifications: Notification[] = [
    // ORD-2056 · Delayed shipment scenario (Kenya feedback 2026-06-04) — surfaces in default bell + Shipping tab.
    {
        id: 'shipment-delayed-ord-2056',
        type: 'shipment',
        priority: 'high',
        title: 'Shipment Delayed — ORD-2056',
        message: 'Carrier weather hold on I-80 · +8d delay. New ETA Mar 28 (was Mar 20). Dealer notification recommended · 24hr call-before-delivery required.',
        meta: 'CarrierTrackingAgent · NorthPoint Furniture Group',
        timestamp: 'Just now',
        unread: true,
        actions: [
            { label: 'View Order', primary: true },
            { label: 'Notify Dealer', primary: false }
        ],
    },
    {
        id: 'doe-2847-cpr',
        type: 'discrepancy',
        priority: 'high',
        title: 'DOE-2847 — CPR discrepancy detected',
        message: 'Carpenters: 50h → 45h · Overtime: 8h → 6h · Impact: −$2,340',
        meta: 'DOE-2847 · NYC Dept. of Education',
        timestamp: 'May 6 · 9:02 AM',
        unread: true,
        actions: [{ label: 'Review order', primary: true }],
    },
    {
        id: '1',
        type: 'system',
        priority: 'high',
        title: 'PO Created from RFQ',
        message: 'Order #PO-1029 generated for Apex Furniture',
        meta: 'System Auto-PO',
        timestamp: 'Just now',
        unread: true,
        actions: [
            { label: 'View PO', primary: true }
        ]
    },
    {
        id: '2',
        type: 'discrepancy',
        priority: 'high',
        title: 'Quantity Mismatch',
        message: 'Order vs Invoice: 24 → 22 units',
        meta: '#DSC-112',
        timestamp: '2 min ago',
        unread: true,
        actions: [
            { label: 'Resolve', primary: true },
            // Arrow icon will be added in component
        ]
    },
    {
        id: '2',
        type: 'discrepancy',
        priority: 'high',
        title: 'Price Discrepancy',
        message: 'PO #4521 - $2,340 variance',
        meta: '#DSC-118',
        timestamp: '15 min ago',
        unread: true,
        actions: [
            { label: 'Review', primary: true }
        ]
    },
    {
        id: '3',
        type: 'discrepancy',
        priority: 'medium',
        title: 'SKU Mismatch',
        message: 'Wrong product code detected',
        meta: '#DSC-124',
        timestamp: '1 hour ago',
        unread: true,
        actions: [
            { label: 'Fix', primary: true }
        ]
    },
    {
        id: '4',
        type: 'invoice',
        priority: 'high',
        title: 'Overdue Invoice',
        message: '$12,450 - 15 days overdue',
        meta: '#INV-7834',
        timestamp: '2 hours ago',
        unread: true,
        actions: [
            { label: 'Collect', primary: true }
        ]
    },
    {
        id: '5',
        type: 'payment',
        priority: 'medium',
        title: 'Pending Payment',
        message: '$8,920 awaiting confirmation',
        meta: '#PAY-445',
        timestamp: '3 hours ago',
        unread: true,
        actions: [
            { label: 'Follow Up', primary: true }
        ]
    },
    {
        id: '6',
        type: 'payment',
        priority: 'high',
        title: 'Failed Transaction',
        message: 'Card declined - retry needed',
        meta: '#TXN-892',
        timestamp: '4 hours ago',
        unread: true,
        actions: [
            { label: 'Retry', primary: true }
        ]
    },
    {
        id: '7',
        type: 'approval',
        priority: 'high',
        title: 'Review Quote',
        message: 'Steelcase Flex - $45,230',
        meta: '#QT-2847',
        timestamp: '5 hours ago',
        unread: true,
        actions: [
            { label: 'Convert', primary: true }
        ]
    },
    {
        id: '8',
        type: 'approval',
        priority: 'high',
        title: 'Approve Order',
        message: 'Herman Miller Aeron batch',
        meta: '#OR-9823',
        timestamp: '6 hours ago',
        unread: true,
        actions: [
            { label: 'Approve', primary: true }
        ]
    },
    {
        id: '9',
        type: 'approval',
        priority: 'medium',
        title: 'Pending Quote',
        message: 'Knoll workspace setup',
        meta: '#Q1-2851',
        timestamp: '1 day ago',
        unread: false,
        actions: [
            { label: 'Review', primary: true }
        ]
    },
    {
        id: '10',
        type: 'approval',
        priority: 'low',
        title: 'Contract Renewal',
        message: 'Annual maintenance agreement',
        meta: '#CN-44',
        timestamp: '2 days ago',
        unread: false,
        actions: [
            { label: 'Sign', primary: true }
        ]
    },
    // Flow 1: Email Intake notifications
    {
        id: '13',
        type: 'quote_update',
        priority: 'medium',
        title: 'RFQ Received',
        message: 'Apex Furniture RFQ #1029 received. AI processing started.',
        meta: 'System',
        timestamp: 'Just now',
        unread: true,
        actions: [{ label: 'View Status', primary: true }],
        persona: 'dealer'
    },
    {
        id: '14',
        type: 'quote_update',
        priority: 'high',
        title: 'Quote Needs Attention',
        message: 'Quote #QT-1025: 3 fields below 70% confidence.',
        meta: 'AI Engine',
        timestamp: '2 min ago',
        unread: true,
        actions: [{ label: 'Review', primary: true }],
        persona: 'expert'
    },
    {
        id: '15',
        type: 'po_created',
        priority: 'medium',
        title: 'PO Generated',
        message: 'PO #PO-1029 created from Quote #QT-1025.',
        meta: 'System Auto-PO',
        timestamp: '5 min ago',
        unread: true,
        actions: [{ label: 'View PO', primary: true }],
        persona: 'dealer'
    },
    // Flow 2: ERP Intake notifications
    {
        id: '16',
        type: 'ack_received',
        priority: 'medium',
        title: 'Acknowledgement Received',
        message: 'Acknowledgement for PO #ORD-2055 received from eManage ONE.',
        meta: 'ERP Connector',
        timestamp: '1 min ago',
        unread: true,
        actions: [{ label: 'View Acknowledgement', primary: true }],
        persona: 'dealer'
    },
    {
        id: '17',
        type: 'backorder',
        priority: 'medium',
        title: 'Backorder Created',
        message: 'Line 2 backordered: Conference Room Chair, ETA March 15.',
        meta: 'BackorderAgent',
        timestamp: '5 min ago',
        unread: true,
        actions: [{ label: 'View Details', primary: true }],
        persona: 'dealer'
    },
    // Flow 3: Document Intake notifications
    {
        id: '18',
        type: 'shipment',
        priority: 'medium',
        title: 'Shipment Update',
        message: 'Tracking updated: Order #ORD-2055 shipped via FedEx.',
        meta: 'ShipmentAgent',
        timestamp: '10 min ago',
        unread: true,
        actions: [{ label: 'Track', primary: true }],
        persona: 'dealer'
    },
    {
        id: '19',
        type: 'shipment',
        priority: 'high',
        title: 'Shipment Delayed',
        message: 'Delivery delayed by 3 days. New ETA: April 2.',
        meta: 'ShipmentAgent',
        timestamp: '15 min ago',
        unread: true,
        actions: [{ label: 'View Timeline', primary: true }],
        persona: 'dealer'
    },
    {
        id: '22',
        type: 'invoice',
        priority: 'high',
        title: '3-Way Match Failed',
        message: 'Tax variance of $0.03 on Invoice #INV-9001.',
        meta: 'MatchAgent',
        timestamp: '30 min ago',
        unread: true,
        actions: [{ label: 'Resolve', primary: true }],
        persona: 'expert'
    },
];
