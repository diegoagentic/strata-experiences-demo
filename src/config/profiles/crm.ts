// ═══════════════════════════════════════════════════════════════════════════════
// CRM Demo Profile — Placeholder (content TBD)
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

export const CRM_STEPS: DemoStep[] = [
    // Flow 1: Contact Management
    {
        id: 'crm-1.1',
        groupId: 1,
        groupTitle: 'Flow 1: Contact Management',
        title: 'Contact Intake',
        description: 'New contact enters the CRM pipeline via web form or email integration.',
        app: 'crm',
        role: 'Sales Rep',
    },
    {
        id: 'crm-1.2',
        groupId: 1,
        groupTitle: 'Flow 1: Contact Management',
        title: 'AI Enrichment',
        description: 'AI enriches contact data with company info, social profiles, and engagement history.',
        app: 'crm',
        role: 'System',
    },
    {
        id: 'crm-1.3',
        groupId: 1,
        groupTitle: 'Flow 1: Contact Management',
        title: 'Assignment & Follow-up',
        description: 'Contact auto-assigned to sales rep based on territory and capacity. Follow-up scheduled.',
        app: 'crm',
        role: 'Sales Rep',
    },

    // Flow 2: Pipeline Tracking
    {
        id: 'crm-2.1',
        groupId: 2,
        groupTitle: 'Flow 2: Pipeline Tracking',
        title: 'Deal Creation',
        description: 'New deal created from qualified contact. AI suggests pricing and products based on company profile.',
        app: 'crm',
        role: 'Sales Rep',
    },
    {
        id: 'crm-2.2',
        groupId: 2,
        groupTitle: 'Flow 2: Pipeline Tracking',
        title: 'Pipeline Progression',
        description: 'Deal moves through stages: Qualified → Proposal → Negotiation. AI tracks engagement signals.',
        app: 'crm',
        role: 'System',
    },
    {
        id: 'crm-2.3',
        groupId: 2,
        groupTitle: 'Flow 2: Pipeline Tracking',
        title: 'Deal Close & Handoff',
        description: 'Deal closed-won. Auto-handoff to implementation team with full context and requirements.',
        app: 'crm',
        role: 'Sales Rep',
    },

    // Flow 3: Reporting & Analytics
    {
        id: 'crm-3.1',
        groupId: 3,
        groupTitle: 'Flow 3: Reporting & Analytics',
        title: 'Performance Dashboard',
        description: 'AI-generated insights on sales performance, pipeline health, and forecasting.',
        app: 'crm',
        role: 'Sales Rep',
    },
    {
        id: 'crm-3.2',
        groupId: 3,
        groupTitle: 'Flow 3: Reporting & Analytics',
        title: 'Smart Alerts',
        description: 'Proactive alerts for at-risk deals, stale contacts, and missed follow-ups.',
        app: 'crm',
        role: 'System',
    },
];

export const CRM_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'crm-1.1': { mode: 'interactive', userAction: 'Review incoming contact details' },
    'crm-1.2': { mode: 'auto', duration: 10, aiSummary: 'Enriching contact data with AI...' },
    'crm-1.3': { mode: 'interactive', userAction: 'Review assignment and schedule follow-up' },
    'crm-2.1': { mode: 'interactive', userAction: 'Create deal from qualified contact' },
    'crm-2.2': { mode: 'auto', duration: 12, aiSummary: 'Tracking engagement and pipeline progression...' },
    'crm-2.3': { mode: 'interactive', userAction: 'Close deal and initiate handoff' },
    'crm-3.1': { mode: 'interactive', userAction: 'Review AI-generated performance insights' },
    'crm-3.2': { mode: 'auto', duration: 8, aiSummary: 'Generating proactive alerts and recommendations...' },
};

export const CRM_STEP_MESSAGES: Record<string, string[]> = {
    'crm-1.1': ['New contact detected...', 'Processing intake form data'],
    'crm-1.2': ['Querying company databases...', 'Enriching with LinkedIn data', 'Contact profile complete'],
    'crm-1.3': ['Analyzing territory assignments...', 'Follow-up scheduled'],
    'crm-2.1': ['Deal pipeline initialized...', 'AI pricing suggestions ready'],
    'crm-2.2': ['Monitoring engagement signals...', 'Deal progressing through stages', 'Ready for next action'],
    'crm-2.3': ['Deal closed successfully...', 'Preparing handoff package'],
    'crm-3.1': ['Generating performance report...', 'AI insights ready for review'],
    'crm-3.2': ['Scanning pipeline for risks...', 'Alerts generated for stale deals'],
};

export const CRM_SELF_INDICATED: string[] = [];
