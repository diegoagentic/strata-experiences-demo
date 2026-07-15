import type { Notification } from './types';

export const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'discrepancy',
        priority: 'high',
        title: 'Discrepancy Detected',
        message: 'Shipment #SH-9921 weight mismatch (+4.2kg) at origin facility.',
        timestamp: '2 mins ago',
        unread: true,
        meta: 'Logistics Center',
        actions: [
            { label: 'Review', primary: true },
            { label: 'Dismiss' }
        ]
    },
    {
        id: '2',
        type: 'live_chat',
        priority: 'medium',
        title: 'New Message from Support',
        message: 'Sarah: "I can help you with that invoice adjustment..."',
        timestamp: '15 mins ago',
        unread: true,
        meta: 'Chat #442',
        actions: [
            { label: 'Reply', primary: true }
        ]
    },
    {
        id: '3',
        type: 'payment',
        priority: 'medium',
        title: 'Payment Failed',
        message: 'Monthly subscription payment for Pro Plan was declined.',
        timestamp: '1 hour ago',
        unread: true,
        meta: 'Billing',
        actions: [
            { label: 'Update Method', primary: true }
        ]
    },
    {
        id: '4',
        type: 'approval',
        priority: 'low',
        title: 'Leave Request Approved',
        message: 'Your time off request for Dec 24-26 has been approved by manager.',
        timestamp: '3 hours ago',
        unread: false,
        meta: 'HR System',
        actions: []
    },
    {
        id: '5',
        type: 'announcement',
        priority: 'low',
        title: 'System Maintenance',
        message: 'Scheduled maintenance this Saturday 2AM-4AM UTC.',
        timestamp: 'Yesterday',
        unread: true,
        meta: 'Platform',
        actions: [
            { label: 'View Details' }
        ]
    },
    {
        id: '6',
        type: 'discrepancy',
        priority: 'high',
        title: 'Compliance Alert',
        message: 'Vendor "Acme Corp" certification expired 2 days ago.',
        timestamp: 'Yesterday',
        unread: false,
        meta: 'Vendor Management',
        actions: [
            { label: 'Contact Vendor', primary: true }
        ]
    }
];
