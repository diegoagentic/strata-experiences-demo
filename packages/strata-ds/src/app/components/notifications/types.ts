import type { ElementType } from 'react';

export interface NotificationAction {
    label: string;
    primary?: boolean;
}

export interface Notification {
    id: string;
    type: 'discrepancy' | 'invoice' | 'payment' | 'approval' | 'system' | 'announcement' | 'live_chat';
    priority: 'high' | 'medium' | 'low';
    title: string;
    message: string;
    timestamp: string;
    unread: boolean;
    meta: string; // e.g., "Invoice #1023" or "System Alert"
    actions: NotificationAction[];
}

export interface NotificationTab {
    id: string;
    label: string;
    count: number;
    icon: ElementType;
    colorTheme: {
        activeBg: string;
        activeText: string;
        activeBorder: string;
        badgeBg: string;
        badgeText: string;
    };
    filter: (n: Notification) => boolean;
}
