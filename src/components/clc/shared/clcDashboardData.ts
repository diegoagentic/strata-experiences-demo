// Mock data for Flow 4 — Data Lake Dashboard
//
// KPIs + chart series feed the persistent Dashboard tab.

export interface KpiCardData {
    id: string
    label: string
    value: string
    delta?: string
    deltaTone: 'good' | 'bad' | 'neutral'
    sublabel: string
    source: 'IQ' | 'QuickBooks' | 'Outlook' | 'SharePoint' | 'CET'
    aiDerived?: boolean
}

export const KPI_CARDS: KpiCardData[] = [
    {
        id: 'cycle',
        label: 'Avg install cycle',
        value: '18 days',
        delta: '−4 days vs 2025',
        deltaTone: 'good',
        sublabel: 'Target · 14 days',
        source: 'IQ',
        aiDerived: true,
    },
    {
        id: 'backlog',
        label: 'Punch-order backlog',
        value: '$42K',
        delta: '4 projects open',
        deltaTone: 'neutral',
        sublabel: 'Open · 0-90+ days',
        source: 'QuickBooks',
    },
    {
        id: 'load',
        label: 'Regional load',
        value: 'NY 92%',
        delta: 'NJ 71% · PA 54%',
        deltaTone: 'bad',
        sublabel: 'In-house crew utilization',
        source: 'Outlook',
    },
    {
        id: 'intake',
        label: 'Intake completeness',
        value: '86%',
        delta: '+45pp vs pre-Strata',
        deltaTone: 'good',
        sublabel: 'Awards with full site-conditions day 1',
        source: 'IQ',
        aiDerived: true,
    },
]

// ─── Charts ──────────────────────────────────────────────────────────────────

export const CYCLE_TIME_TREND = [
    { month: 'Jan', days: 24 },
    { month: 'Feb', days: 23 },
    { month: 'Mar', days: 21 },
    { month: 'Apr', days: 20 },
    { month: 'May', days: 19 },
    { month: 'Jun', days: 18 },
]

export const PUNCH_AGEING = [
    { bucket: '0-30 d',  amount: 8000 },
    { bucket: '31-60 d', amount: 14000 },
    { bucket: '61-90 d', amount: 12000 },
    { bucket: '90+ d',   amount: 8000 },
]

export const VENDOR_MIX = [
    { vendor: 'TMC',          value: 28, color: '#3b82f6' },
    { vendor: 'KI',           value: 24, color: '#f59e0b' },
    { vendor: 'Smith System', value: 18, color: '#10b981' },
    { vendor: 'Media Tech',   value: 12, color: '#8b5cf6' },
    { vendor: 'Aurora',       value: 11, color: '#ef4444' },
    { vendor: 'Other',        value: 7,  color: '#71717a' },
]

export const REGIONAL_LOAD = [
    { week: 'Jun 1',  ny: 3, nj: 1, pa: 1 },
    { week: 'Jun 8',  ny: 1, nj: 2, pa: 1 },
    { week: 'Jun 15', ny: 2, nj: 2, pa: 1 },
    { week: 'Jun 22', ny: 1, nj: 1, pa: 2 },
    { week: 'Jun 29', ny: 1, nj: 2, pa: 1 },
    { week: 'Jul 6',  ny: 2, nj: 2, pa: 2 },
]

export const ACTIVITY_FEED = [
    { ts: 'Now',     flow: 'Calendar',   text: 'Director of Operations queued 1 install date change for IQ batch sync · Fairport · Jun 2 → Jun 5' },
    { ts: '15m ago', flow: 'SharePoint', text: 'Folder published · Fairport-Library-Phase1 · 15 assets · 1 AI flag (KI ACK short-ship)' },
    { ts: '1h ago',  flow: 'Intake',     text: 'Survey returned · Fairport · 5 match · 2 mismatch · 3 IQ-blank · pending reconcile' },
    { ts: '3h ago',  flow: 'Calendar',   text: 'Capacity alert · NY region · week of Jun 1 · third-party suggestion sent (Albany Install Co.)' },
    { ts: '5h ago',  flow: 'SharePoint', text: 'Brockport-Library-Q1 archived · install complete · punch closed' },
    { ts: '1d ago',  flow: 'Intake',     text: 'Survey delivered via Procore · Fairport · response rate ~92% historical' },
    { ts: '2d ago',  flow: 'Calendar',   text: 'Outlook calendar refresh · 14 jobs pulled from IQ' },
    { ts: '3d ago',  flow: 'SharePoint', text: 'Princeton-TechBar-Q1 archived · install complete' },
]

export const AT_RISK = [
    {
        id: 'fairport',
        title: 'Fairport Public Library',
        when: 'Install Jun 2 · in 7 days',
        risk: 'NY region over capacity · 3 jobs back-to-back · third-party installer suggested',
        severity: 'red' as const,
        flow: 'Calendar',
    },
    {
        id: 'brockport-survey',
        title: 'Brockport Public Library',
        when: 'Site-conditions survey · sent 4d ago',
        risk: '3 of 10 fields still blank in IQ · survey unanswered · re-send via Procore',
        severity: 'amber' as const,
        flow: 'Intake',
    },
]
