export type Priority = 'high' | 'medium' | 'low';
export type NotificationType =
    | 'discrepancy' | 'invoice' | 'payment' | 'approval'
    | 'system' | 'announcement' | 'live_chat'
    | 'quote_update' | 'po_created' | 'ack_received'
    | 'backorder' | 'shipment' | 'warranty' | 'mac';

export type NotificationPersona = 'dealer' | 'expert' | 'both';

export interface Action {
    label: string;
    primary?: boolean;
    onClick?: () => void;
}

export interface Notification {
    id: string;
    type: NotificationType;
    priority: Priority;
    title: string;
    message: string;
    meta: string;
    timestamp: string;
    unread: boolean;
    actions: Action[];
    persona?: NotificationPersona;
}

export interface NotificationTab {
    id: string;
    label: string;
    count: number;
    icon: React.ElementType;
    colorTheme: {
        activeBg: string; // e.g., 'bg-blue-500/20'
        activeText: string; // e.g., 'text-blue-500'
        activeBorder: string; // e.g., 'border-blue-500/20'
        badgeBg: string;
        badgeText: string;
    };
    filter: (n: Notification) => boolean;
}
