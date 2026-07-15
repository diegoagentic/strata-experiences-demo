/**
 * w2.4 — CFODashboardScene
 * State machine: inbox → notified → company → role-switch → division
 *
 *   'inbox'      — CFO sees expense cycles list; May 2026 is "Processing"
 *   'notified'   — Strata notification slides in; May 2026 updates to "Complete ✓"
 *   'company'    — Mehmet full dashboard: working filters (dept/location/category/period)
 *   'role-switch'— Mehmet → Tammy transition banner (~1s auto)
 *   'division'   — Tammy CAO view with overdue alert and reminder action
 *
 *   showPreview  — PDF report modal overlay on top of 'company'
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Download, AlertTriangle, ChevronRight, ChevronDown, Bell, Sparkles, ArrowRight, FileText, X, Loader2, CheckCircle2, Calendar, RefreshCw } from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import { useDemo } from '../../context/DemoContext'

type ScenePhase    = 'inbox' | 'notified' | 'company' | 'role-switch' | 'division'
type Period        = 'may' | 'april'
type DeptFilter    = 'all' | 'operations' | 'sales' | 'procurement'
type LocationFilter = 'all' | 'tampa' | 'orlando' | 'miami'
type CategoryFilter = 'all' | 'Mileage' | 'Personal Meals' | 'Air Fare' | 'Misc Cost'

// ── Data ─────────────────────────────────────────────────────────────────────

const EXPENSE_CYCLES = [
    { period: 'May 2026',      total: '$48K', count: 23, status: 'processing', postedBy: 'Letza Bombard', time: '2:48 PM' },
    { period: 'April 2026',    total: '$43K', count: 19, status: 'closed' },
    { period: 'March 2026',    total: '$41K', count: 21, status: 'closed' },
    { period: 'February 2026', total: '$38K', count: 18, status: 'closed' },
]

const CATEGORIES_BY_DEPT: Record<DeptFilter, Record<Period, { name: string; amount: number }[]>> = {
    all: {
        may:   [{ name: 'Mileage', amount: 12000 }, { name: 'Personal Meals', amount: 8500  }, { name: 'Air Fare', amount: 6000 }, { name: 'Misc Cost', amount: 4000 }],
        april: [{ name: 'Mileage', amount: 9000  }, { name: 'Personal Meals', amount: 7800  }, { name: 'Air Fare', amount: 5500 }, { name: 'Misc Cost', amount: 4200 }],
    },
    operations: {
        may:   [{ name: 'Mileage', amount: 8000  }, { name: 'Air Fare', amount: 4000 }, { name: 'Personal Meals', amount: 3000  }, { name: 'Misc Cost', amount: 2000 }],
        april: [{ name: 'Mileage', amount: 6000  }, { name: 'Air Fare', amount: 3500 }, { name: 'Personal Meals', amount: 2800  }, { name: 'Misc Cost', amount: 2100 }],
    },
    sales: {
        may:   [{ name: 'Personal Meals', amount: 5000 }, { name: 'Air Fare', amount: 3000 }, { name: 'Mileage', amount: 2000  }, { name: 'Misc Cost', amount: 1500 }],
        april: [{ name: 'Personal Meals', amount: 4500 }, { name: 'Air Fare', amount: 2800 }, { name: 'Mileage', amount: 1800  }, { name: 'Misc Cost', amount: 1600 }],
    },
    procurement: {
        may:   [{ name: 'Air Fare', amount: 4000 }, { name: 'Misc Cost', amount: 2500 }, { name: 'Personal Meals', amount: 1500 }, { name: 'Mileage', amount: 2000 }],
        april: [{ name: 'Air Fare', amount: 3500 }, { name: 'Misc Cost', amount: 2400 }, { name: 'Personal Meals', amount: 1400 }, { name: 'Mileage', amount: 1700 }],
    },
}

const KPI_BY_DEPT: Record<DeptFilter, { month: string; pending: number; onTime: string }> = {
    all:         { month: '$48K',   pending: 23, onTime: '94%' },
    operations:  { month: '$19K',   pending: 10, onTime: '96%' },
    sales:       { month: '$11.5K', pending: 7,  onTime: '93%' },
    procurement: { month: '$10K',   pending: 6,  onTime: '91%' },
}

const FUEL_DRILL = [
    { name: 'John Smith',  amount: '$95.00',  receipt: true, purpose: 'Field ops — Tampa',     location: 'Tampa'   },
    { name: 'Maria G.',    amount: '$140.00', receipt: true, purpose: 'Client site — Orlando', location: 'Orlando' },
    { name: 'Carlos Ruiz', amount: '$180.00', receipt: true, purpose: 'Field ops — Miami',     location: 'Miami'   },
]

const OVERDUE_ALERTS = [
    { name: 'Carlos Ruiz', amount: '$210', manager: 'Mike Torres',   days: 4 },
    { name: 'Ana Kim',     amount: '$312', manager: 'Sarah Johnson', days: 3 },
]

const DIVISION_DEPTS = [
    { name: 'Operations',  amount: 28000 },
    { name: 'Procurement', amount: 14000 },
    { name: 'Other',       amount:  6000 },
]

const LOCATIONS_LIST = [
    { city: 'Tampa',           amount: 22000 },
    { city: 'Orlando',         amount: 12000 },
    { city: 'Miami',           amount:  8000 },
    { city: 'Other locations', amount:  6000 },
]

// ── Operations Spend data (from Tammy's HTML report) ─────────────────────────

const OPS_DEPTS = [
    { name: 'Field operations', amount: 18420 },
    { name: 'Procurement',      amount: 11850 },
    { name: 'Sales support',    amount:  8940 },
    { name: 'Warehouse',        amount:  5620 },
    { name: 'Install',          amount:  3380 },
]

const OPS_CATEGORIES = [
    { name: 'Lodging', pct: 35, color: '#378ADD', dasharray: 92,  offset: 0    },
    { name: 'Airfare', pct: 25, color: '#1D9E75', dasharray: 66,  offset: -92  },
    { name: 'Mileage', pct: 20, color: '#EF9F27', dasharray: 53,  offset: -158 },
    { name: 'Dining',  pct: 13, color: '#7F77DD', dasharray: 33,  offset: -211 },
    { name: 'Other',   pct:  7, color: '#888780', dasharray: 20,  offset: -244 },
]

const OPS_RECENT = [
    { name: 'M. Henderson', dept: 'Field operations', location: 'Orlando',      date: 'Apr 28', amount: '$842.10',   receipt: true  },
    { name: 'J. Park',      dept: 'Procurement',      location: 'Tampa',        date: 'Apr 27', amount: '$1,240.00', receipt: true  },
    { name: 'R. Alvarez',   dept: 'Field operations', location: 'Orlando',      date: 'Apr 26', amount: '$385.50',   receipt: true  },
    { name: 'S. Carter',    dept: 'Sales support',    location: 'Jacksonville', date: 'Apr 25', amount: '$612.75',   receipt: false },
    { name: 'D. Kim',       dept: 'Warehouse',        location: 'Tampa',        date: 'Apr 24', amount: '$215.00',   receipt: true  },
    { name: 'A. Rivera',    dept: 'Procurement',      location: 'Orlando',      date: 'Apr 23', amount: '$478.90',   receipt: true  },
    { name: 'L. Nguyen',    dept: 'Install',          location: 'Orlando',      date: 'Apr 22', amount: '$129.40',   receipt: true  },
]

const DEPT_LABELS: Record<DeptFilter, string> = {
    all: 'All Departments', operations: 'Operations', sales: 'Sales', procurement: 'Procurement'
}

const LOCATION_SCALE: Record<LocationFilter, number> = {
    all: 1, tampa: 0.46, orlando: 0.25, miami: 0.17
}
const LOCATION_LABELS: Record<LocationFilter, string> = {
    all: 'All Locations', tampa: 'Tampa', orlando: 'Orlando', miami: 'Miami'
}
const CATEGORY_FILTER_LABELS: Record<CategoryFilter, string> = {
    all: 'All Categories', Mileage: 'Mileage', 'Personal Meals': 'Personal Meals', 'Air Fare': 'Air Fare', 'Misc Cost': 'Misc Cost'
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NotificationBadge() {
    return (
        <div className="animate-in fade-in slide-in-from-top-1 duration-300 flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-ai" />
            <p className="text-[10px] text-ai">Sourced from CORE · Updated 2:48 PM · Auto-aggregated by Strata</p>
        </div>
    )
}

function RoleSwitchBanner() {
    const [progress, setProgress] = useState(false)
    useEffect(() => {
        const t = setTimeout(() => setProgress(true), 50)
        return () => clearTimeout(t)
    }, [])

    return (
        <div className="animate-in fade-in duration-300">
            <div className="bg-card border border-border rounded-xl px-6 py-8 text-center space-y-5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Switching view</p>
                <div className="flex items-center justify-center gap-4">
                    <div className="space-y-1.5">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground mx-auto">MB</div>
                        <p className="text-xs font-semibold text-foreground">Mehmet B.</p>
                        <p className="text-[10px] text-muted-foreground">CFO · Company-wide</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-ai shrink-0" />
                    <div className="space-y-1.5">
                        <div className="h-12 w-12 rounded-full bg-ai/10 border border-ai/20 flex items-center justify-center text-sm font-bold text-ai mx-auto">TA</div>
                        <p className="text-xs font-semibold text-foreground">Tammy A.</p>
                        <p className="text-[10px] text-muted-foreground">CAO · Ops &amp; Procurement</p>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <p className="text-[10px] text-muted-foreground">Loading division view...</p>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-ai rounded-full transition-all duration-[900ms] ease-out" style={{ width: progress ? '100%' : '0%' }} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function TammyNotificationBanner() {
    return (
        <div className="animate-in slide-in-from-top duration-400 bg-warning/5 border border-warning/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <div>
                <p className="text-xs font-bold text-warning">Action required · Ops &amp; Procurement</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">2 managers pending &gt; 3 days · Review and send reminders below</p>
            </div>
        </div>
    )
}

// ── ReminderScheduler ─────────────────────────────────────────────────────────

type ReminderStep    = 'idle' | 'choosing' | 'configuring' | 'sent'
type PeriodicityId   = 'now' | 'weekly' | 'biweekly' | 'monthly'

const PERIODICITY_OPTIONS: { id: PeriodicityId; label: string; sub: string; icon: 'bell' | 'refresh' | 'calendar' }[] = [
    { id: 'now',      label: 'Send now',   sub: 'One-time reminder',           icon: 'bell'     },
    { id: 'weekly',   label: 'Weekly',     sub: 'Every Monday · 9:00 AM',      icon: 'refresh'  },
    { id: 'biweekly', label: 'Bi-weekly',  sub: 'Every other Monday · 9:00 AM', icon: 'refresh' },
    { id: 'monthly',  label: 'Monthly',    sub: 'Last Friday of month · 9:00 AM', icon: 'calendar' },
]

const NEXT_REMINDER: Record<PeriodicityId, string> = {
    now:      'Sent immediately',
    weekly:   'Next: Mon May 11 · 9:00 AM',
    biweekly: 'Next: Mon May 18 · 9:00 AM',
    monthly:  'Next: Fri May 30 · 9:00 AM',
}

function ReminderScheduler({ alerts }: { alerts: { name: string; manager: string; days: number }[] }) {
    const [step, setStep]       = useState<ReminderStep>('idle')
    const [selected, setSelected] = useState<PeriodicityId | null>(null)

    const uniqueManagers = [...new Set(alerts.map(a => a.manager))]

    if (step === 'idle') {
        return (
            <button
                onClick={() => setStep('choosing')}
                className="w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-medium bg-muted text-muted-foreground hover:text-foreground border border-border transition-all"
            >
                <Bell className="h-3 w-3" />
                Send reminder to managers
            </button>
        )
    }

    if (step === 'choosing') {
        return (
            <div className="space-y-2.5 animate-in fade-in duration-200">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Select reminder schedule</p>
                <div className="grid grid-cols-2 gap-1.5">
                    {PERIODICITY_OPTIONS.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => { setSelected(opt.id); setStep('configuring') }}
                            className="text-left px-3 py-2.5 bg-muted/40 border border-border rounded-xl hover:border-foreground/30 hover:bg-muted transition-all"
                        >
                            <div className="flex items-center gap-1.5 mb-0.5">
                                {opt.icon === 'bell'     && <Bell className="h-3 w-3 text-muted-foreground" />}
                                {opt.icon === 'refresh'  && <RefreshCw className="h-3 w-3 text-muted-foreground" />}
                                {opt.icon === 'calendar' && <Calendar className="h-3 w-3 text-muted-foreground" />}
                                <p className="text-xs font-semibold text-foreground">{opt.label}</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-tight">{opt.sub}</p>
                        </button>
                    ))}
                </div>
                <button onClick={() => setStep('idle')} className="text-[10px] text-muted-foreground hover:text-foreground w-full text-center py-1">
                    Cancel
                </button>
            </div>
        )
    }

    if (step === 'configuring' && selected) {
        const option = PERIODICITY_OPTIONS.find(o => o.id === selected)!
        return (
            <div className="space-y-2.5 animate-in fade-in duration-200">
                {/* Config card */}
                <div className="bg-ai/5 border border-ai/20 rounded-xl px-3 py-3 space-y-3">
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-ai" />
                        <p className="text-[10px] font-bold text-ai uppercase tracking-wide">Reminder configuration</p>
                    </div>

                    {/* Recipients */}
                    <div className="space-y-1.5">
                        <p className="text-[10px] text-muted-foreground font-medium">Recipients</p>
                        {uniqueManagers.map(mgr => (
                            <div key={mgr} className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-foreground shrink-0">
                                    {mgr.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <p className="text-xs text-foreground">{mgr}</p>
                                <span className="text-[10px] text-muted-foreground ml-auto">
                                    {alerts.find(a => a.manager === mgr)?.days}d pending
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Message preview */}
                    <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground font-medium">Message</p>
                        <div className="bg-card border border-border rounded-lg px-2.5 py-2">
                            <p className="text-[10px] text-foreground leading-relaxed">
                                You have expense reports pending approval for over 3 days. Please review and approve or escalate to ensure timely approval.
                            </p>
                            <p className="text-[9px] text-muted-foreground mt-1">From: Strata · Automated · Workspaces, Inc.</p>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-muted-foreground font-medium">Schedule</p>
                            <p className="text-xs font-semibold text-foreground">{option.label}</p>
                            <p className="text-[10px] text-muted-foreground">{option.sub}</p>
                        </div>
                        <button
                            onClick={() => setStep('choosing')}
                            className="text-[10px] text-ai hover:underline font-medium"
                        >
                            Change
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setStep('idle')}
                        className="flex-1 text-xs text-muted-foreground py-2 hover:text-foreground border border-border rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => setStep('sent')}
                        className="flex-[2] text-xs bg-foreground text-background font-bold py-2 rounded-lg hover:opacity-90 flex items-center justify-center gap-1.5 transition-opacity"
                    >
                        <Bell className="h-3 w-3" />
                        Confirm &amp; Send
                    </button>
                </div>
            </div>
        )
    }

    // sent
    return (
        <div className="space-y-2 animate-in fade-in duration-300">
            <div className="bg-success/10 border border-success/20 rounded-xl px-3 py-3 space-y-1.5">
                <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    <p className="text-xs font-semibold text-success">Reminders sent ✓</p>
                </div>
                <p className="text-[10px] text-muted-foreground">
                    {uniqueManagers.join(' · ')} notified via Strata
                </p>
                {selected !== 'now' && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <RefreshCw className="h-2.5 w-2.5" />
                        {NEXT_REMINDER[selected!]}
                    </p>
                )}
            </div>
        </div>
    )
}

// ── ReportPreviewModal ────────────────────────────────────────────────────────

function ReportPreviewModal({ onClose }: { onClose: () => void }) {
    const [exportState, setExportState] = useState<'idle' | 'generating' | 'done'>('idle')

    const handleExport = () => {
        setExportState('generating')
        setTimeout(() => {
            setExportState('done')
            setTimeout(() => setExportState('idle'), 2000)
        }, 800)
    }

    const MAY = CATEGORIES_BY_DEPT.all.may
    const APR = CATEGORIES_BY_DEPT.all.april
    const mayTotal = MAY.reduce((s, c) => s + c.amount, 0)
    const aprTotal = APR.reduce((s, c) => s + c.amount, 0)
    const totalDelta = Math.round(((mayTotal - aprTotal) / aprTotal) * 100)

    return (
        <div className="fixed left-80 top-0 right-0 bottom-0 z-[400] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Modal header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border sticky top-0 bg-card z-10">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs font-bold text-foreground">Expense Report — May 2026</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExport}
                            disabled={exportState !== 'idle'}
                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
                                exportState === 'done'
                                    ? 'bg-success/10 border-success/20 text-success'
                                    : 'bg-card border-border text-foreground hover:border-primary'
                            }`}
                        >
                            <Download className="h-3 w-3" />
                            {exportState === 'generating' ? 'Generating...' : exportState === 'done' ? 'PDF downloaded ✓' : 'Export PDF'}
                        </button>
                        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Document body */}
                <div className="px-6 py-5 space-y-5 font-mono">
                    {/* Company header */}
                    <div className="space-y-0.5">
                        <p className="text-xs font-bold text-foreground uppercase tracking-widest">Strata Financial</p>
                        <p className="text-[10px] text-muted-foreground">Expense Report — May 2026</p>
                        <p className="text-[10px] text-muted-foreground">Generated May 8, 2026 · 2:48 PM</p>
                        <p className="text-[10px] text-muted-foreground">Posted to CORE by Letza Bombard · Accountant</p>
                    </div>

                    <div className="border-t border-border" />

                    {/* Executive summary */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Executive Summary</p>
                        <div className="space-y-1">
                            {[
                                { label: 'Total Spend',          value: `$${(mayTotal / 1000).toFixed(0)},000` },
                                { label: 'vs. April 2026',       value: `+$${((mayTotal - aprTotal) / 1000).toFixed(0)},000 (+${totalDelta}%)`, highlight: 'warning' },
                                { label: 'Expenses submitted',   value: '23' },
                                { label: 'On-time Rate',          value: '94%' },
                                { label: 'Receipts verified',    value: '23 / 23 ✓', highlight: 'success' },
                            ].map(row => (
                                <div key={row.label} className="flex items-center justify-between">
                                    <span className="text-[11px] text-muted-foreground">{row.label}</span>
                                    <span className={`text-[11px] font-semibold ${row.highlight === 'warning' ? 'text-warning' : row.highlight === 'success' ? 'text-success' : 'text-foreground'}`}>
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-border" />

                    {/* Spend by category table */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Spend by Category</p>
                        <div className="space-y-0">
                            <div className="flex items-center justify-between pb-1 border-b border-border">
                                <span className="text-[10px] font-bold text-muted-foreground w-28">Category</span>
                                <span className="text-[10px] font-bold text-muted-foreground w-16 text-right">May</span>
                                <span className="text-[10px] font-bold text-muted-foreground w-16 text-right">Apr</span>
                                <span className="text-[10px] font-bold text-muted-foreground w-14 text-right">Δ</span>
                            </div>
                            {MAY.map(cat => {
                                const apr = APR.find(c => c.name === cat.name)?.amount ?? 0
                                const delta = apr > 0 ? Math.round(((cat.amount - apr) / apr) * 100) : 0
                                return (
                                    <div key={cat.name} className="flex items-center justify-between py-1 border-b border-border/40">
                                        <span className="text-[11px] text-foreground w-28">{cat.name}</span>
                                        <span className="text-[11px] font-semibold text-foreground w-16 text-right">${(cat.amount / 1000).toFixed(1)}K</span>
                                        <span className="text-[11px] text-muted-foreground w-16 text-right">${(apr / 1000).toFixed(1)}K</span>
                                        <span className={`text-[11px] font-bold w-14 text-right ${delta > 0 ? 'text-warning' : 'text-success'}`}>
                                            {delta > 0 ? '+' : ''}{delta}%
                                        </span>
                                    </div>
                                )
                            })}
                            <div className="flex items-center justify-between py-1.5">
                                <span className="text-[11px] font-bold text-foreground w-28">TOTAL</span>
                                <span className="text-[11px] font-bold text-foreground w-16 text-right">${(mayTotal / 1000).toFixed(0)}K</span>
                                <span className="text-[11px] font-bold text-muted-foreground w-16 text-right">${(aprTotal / 1000).toFixed(0)}K</span>
                                <span className="text-[11px] font-bold text-warning w-14 text-right">+{totalDelta}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border" />

                    {/* Top transactions */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Top Transactions — Fuel</p>
                        <div className="space-y-1">
                            {FUEL_DRILL.map(item => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div>
                                        <span className="text-[11px] text-foreground">{item.name}</span>
                                        <span className="text-[10px] text-muted-foreground"> · {item.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-semibold text-foreground">{item.amount}</span>
                                        {item.receipt && <span className="text-[10px] text-success">receipt ✓</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-border" />

                    {/* SLA status */}
                    <div className="bg-warning/5 border border-warning/20 rounded-lg px-3 py-2.5 flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[11px] font-semibold text-warning">2 reports pending &gt; 3 days</p>
                            <p className="text-[10px] text-muted-foreground">Carlos Ruiz · Ana Kim — action required</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border pt-3">
                        <p className="text-[9px] text-muted-foreground text-center">
                            Strata Financial Platform · Auto-generated · Sourced from CORE · May 8, 2026
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── OperationsSpendView — 2-card launcher + full report views ─────────────────

function ReportCard({ title, subtitle, preview, onClick }: {
    title: string; subtitle: string; preview: React.ReactNode; onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary/40 hover:shadow-md transition-all group w-full space-y-3"
        >
            <div className="aspect-video bg-muted/40 rounded-lg overflow-hidden flex items-end">
                {preview}
            </div>
            <div>
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] text-ai font-semibold">
                View report <ChevronRight className="h-3 w-3" />
            </span>
        </button>
    )
}

function OperationsSpendView() {
    const [activeReport, setActiveReport] = useState<null | 'ops' | 'approvals' | 'gl'>(null)

    if (activeReport === 'ops')       return <OpsSpendReport      onBack={() => setActiveReport(null)} />
    if (activeReport === 'approvals') return <ApprovalTrendsReport onBack={() => setActiveReport(null)} />
    if (activeReport === 'gl')        return <GLSummaryReport      onBack={() => setActiveReport(null)} />

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div>
                <p className="text-xs font-bold text-foreground">Spend Dashboard</p>
                <p className="text-[10px] text-muted-foreground">Select a report to view and export</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <ReportCard
                    title="Operations spend"
                    subtitle="April 2026 · all departments"
                    onClick={() => setActiveReport('ops')}
                    preview={
                        <div className="w-full h-full flex items-end gap-1 px-3 pb-2">
                            {[95, 61, 46, 29, 17].map((h, i) => (
                                <div key={i} className="flex-1 bg-primary/50 rounded-t-sm" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    }
                />
                <ReportCard
                    title="Supervisor approval trends"
                    subtitle="Last 6 months · Tammy Flick"
                    onClick={() => setActiveReport('approvals')}
                    preview={
                        <div className="w-full h-full flex items-end gap-1 px-3 pb-2">
                            {[58, 46, 70, 73, 81, 89].map((h, i) => (
                                <div key={i} className={`flex-1 rounded-t-sm ${i === 5 ? 'bg-primary' : 'bg-primary/40'}`} style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    }
                />
                <ReportCard
                    title="Category × GL summary"
                    subtitle="April 2026 · ready to post to Core"
                    onClick={() => setActiveReport('gl')}
                    preview={
                        <div className="w-full h-full flex flex-col gap-1.5 justify-end px-3 pb-3">
                            {[['#378ADD', '70%'], ['#1D9E75', '50%'], ['#EF9F27', '38%'], ['#7F77DD', '24%']].map(([c, w], i) => (
                                <div key={i} className="h-1.5 rounded-full" style={{ width: w, backgroundColor: c }} />
                            ))}
                        </div>
                    }
                />
            </div>
            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
        </div>
    )
}

// ── OpsSpendReport — full Operations Spend report ─────────────────────────────

function OpsSpendReport({ onBack }: { onBack: () => void }) {
    const [exportState, setExportState] = useState<'idle' | 'generating' | 'done'>('idle')
    const [showFull, setShowFull]       = useState(false)
    const maxDept = Math.max(...OPS_DEPTS.map(d => d.amount))

    const handleExport = () => {
        setExportState('generating')
        setTimeout(() => { setExportState('done'); setTimeout(() => setExportState('idle'), 2000) }, 800)
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Nav */}
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Back
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFull(v => !v)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:border-primary transition-colors font-medium"
                    >
                        <FileText className="h-3 w-3" />
                        {showFull ? 'Collapse' : 'Preview report'}
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exportState !== 'idle'}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
                            exportState === 'done' ? 'bg-success/10 border-success/20 text-success'
                            : 'bg-foreground text-background border-foreground hover:opacity-90'
                        }`}
                    >
                        <Download className="h-3 w-3" />
                        {exportState === 'generating' ? 'Generating...' : exportState === 'done' ? 'PDF downloaded ✓' : 'Export PDF'}
                    </button>
                </div>
            </div>

            {/* Header */}
            <div>
                <p className="text-sm font-bold text-foreground">Operations spend</p>
                <p className="text-[10px] text-muted-foreground">April 2026 · all departments · Tammy Flick</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-2">
                {[
                    { label: 'Total approved', value: '$48,210',  color: 'text-foreground' },
                    { label: 'Reports',         value: '87',       color: 'text-foreground' },
                    { label: 'Avg / report',    value: '$554',     color: 'text-foreground' },
                    { label: 'vs. last month',  value: '+12%',     color: 'text-success'    },
                ].map(kpi => (
                    <div key={kpi.label} className="bg-card border border-border rounded-xl px-3 py-2.5">
                        <p className="text-[10px] text-muted-foreground mb-1">{kpi.label}</p>
                        <p className={`text-lg font-bold leading-none ${kpi.color}`}>{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts: dept bars + donut */}
            <div className="grid grid-cols-[1.4fr_1fr] gap-3 items-start">
                <div className="bg-card border border-border rounded-xl px-4 py-3 space-y-3">
                    <p className="text-xs font-bold text-foreground">By department</p>
                    {OPS_DEPTS.map(dept => (
                        <div key={dept.name} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-foreground">{dept.name}</span>
                                <span className="text-[11px] text-muted-foreground">${dept.amount.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary/70 rounded-full" style={{ width: `${(dept.amount / maxDept) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-card border border-border rounded-xl px-4 py-3">
                    <p className="text-xs font-bold text-foreground mb-2">By category</p>
                    <div className="flex justify-center mb-3">
                        <svg viewBox="0 0 120 120" width="110" height="110" aria-label="Donut chart of expense categories">
                            {OPS_CATEGORIES.map(cat => (
                                <circle key={cat.name} cx="60" cy="60" r="42" fill="none" stroke={cat.color}
                                    strokeWidth="16" strokeDasharray={`${cat.dasharray} 264`}
                                    strokeDashoffset={cat.offset} transform="rotate(-90 60 60)" />
                            ))}
                        </svg>
                    </div>
                    <div className="space-y-1.5">
                        {OPS_CATEGORIES.map(cat => (
                            <div key={cat.name} className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
                                <span className="text-[11px] text-foreground flex-1">{cat.name}</span>
                                <span className="text-[11px] text-muted-foreground">{cat.pct}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent reports table — full or collapsed */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground">Recent approved reports</p>
                    <button onClick={() => setShowFull(v => !v)} className="text-[10px] text-ai font-medium hover:underline">
                        {showFull ? 'Collapse ↑' : 'View all →'}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                {['Employee', 'Department', 'Location', 'Date', 'Amount', ''].map((h, i) => (
                                    <th key={i} className={`px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap ${i >= 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {(showFull ? OPS_RECENT : OPS_RECENT.slice(0, 3)).map(row => (
                                <tr key={row.name + row.date} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-2.5 text-[11px] font-medium text-foreground whitespace-nowrap">{row.name}</td>
                                    <td className="px-4 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{row.dept}</td>
                                    <td className="px-4 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{row.location}</td>
                                    <td className="px-4 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{row.date}</td>
                                    <td className="px-4 py-2.5 text-[11px] font-bold text-foreground text-right whitespace-nowrap">{row.amount}</td>
                                    <td className="px-4 py-2.5 text-right">
                                        {row.receipt ? <CheckCircle2 className="h-3.5 w-3.5 text-success inline" /> : <AlertTriangle className="h-3.5 w-3.5 text-warning inline" />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-2 border-t border-border bg-muted/20">
                    <p className="text-[9px] text-muted-foreground text-center">Mockup · Workscapes AI assessment · prepared for client demo</p>
                </div>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
        </div>
    )
}

// ── ApprovalTrendsReport — Supervisor approval response times ─────────────────

const APPROVAL_MANAGERS = [
    { name: 'Sarah Johnson', dept: 'Operations',   avgDays: 0.9, onTime: '98%', total: 14, color: 'bg-success/60' },
    { name: 'Mike Torres',   dept: 'Procurement',  avgDays: 1.4, onTime: '93%', total: 11, color: 'bg-success/40' },
    { name: 'Ana Reyes',     dept: 'Sales',        avgDays: 2.1, onTime: '88%', total:  8, color: 'bg-warning/50' },
    { name: 'Jorge Mata',    dept: 'Install',      avgDays: 3.8, onTime: '72%', total:  4, color: 'bg-destructive/40' },
]

const GL_ROWS = [
    { category: 'Lodging',              glCode: '6220', april: 16890, vsMarch: '+19%', up: true,  reports: 22, status: 'posted',  spark: '0,12 16,10 32,8 48,7 64,6 80,2'   },
    { category: 'Airfare',              glCode: '6210', april: 12050, vsMarch: '+15%', up: true,  reports: 18, status: 'posted',  spark: '0,14 16,17 32,8 48,5 64,7 80,3'   },
    { category: 'Mileage',              glCode: '6230', april:  9640, vsMarch: '-14%', up: false, reports: 31, status: 'posted',  spark: '0,5 16,11 32,3 48,4 64,4 80,14'   },
    { category: 'Meals & dining',        glCode: '6250', april:  6275, vsMarch: '+23%', up: true,  reports: 15, status: 'pending', spark: '0,15 16,13 32,11 48,12 64,9 80,2'  },
    { category: 'Car rental',           glCode: '6240', april:  4210, vsMarch: '+11%', up: true,  reports:  8, status: 'posted',  spark: '0,14 16,12 32,10 48,9 64,10 80,5'  },
    { category: 'Client entertainment', glCode: '6260', april:  3440, vsMarch: '+23%', up: true,  reports:  6, status: 'pending', spark: '0,15 16,13 32,12 48,10 64,11 80,3' },
    { category: 'Office supplies',       glCode: '6310', april:  1890, vsMarch: '-18%', up: false, reports:  4, status: 'posted',  spark: '0,9 16,6 32,8 48,5 64,7 80,13'    },
    { category: 'Other',                glCode: '6290', april:   850, vsMarch: '+33%', up: true,  reports:  3, status: 'posted',  spark: '0,9 16,16 32,11 48,8 64,13 80,4'  },
]

const GL_PENDING_ITEMS = [
    { initials: 'SC', name: 'S. Carter',    detail: 'Sales support · Approved Apr 25 · GL 6250', amount: '$612.75'   },
    { initials: 'BT', name: 'B. Torres',    detail: 'Sales support · Approved Apr 24 · GL 6260', amount: '$284.50'   },
    { initials: 'KO', name: 'K. Owens',     detail: 'Operations · Approved Apr 23 · GL 6250',    amount: '$1,142.00' },
    { initials: 'NP', name: 'N. Patel',     detail: 'Operations · Approved Apr 22 · GL 6260',    amount: '$418.90'   },
    { initials: 'GW', name: 'G. Whitfield', detail: 'Sales support · Approved Apr 21 · GL 6260', amount: '$2,981.50' },
]

const APPROVAL_MONTHS = [
    { month: 'Nov', label: '$8.2k',  height: 58, current: false },
    { month: 'Dec', label: '$6.4k',  height: 46, current: false },
    { month: 'Jan', label: '$9.8k',  height: 70, current: false },
    { month: 'Feb', label: '$10.2k', height: 73, current: false },
    { month: 'Mar', label: '$11.4k', height: 81, current: false },
    { month: 'Apr', label: '$12.5k', height: 89, current: true  },
]

const TOP_APPROVERS = [
    { initials: 'TF', name: 'Tammy Flick',      role: 'CAO, Operations', amount: '$58.5k', width: 100 },
    { initials: 'MC', name: 'Mike Chen',         role: 'Sales Director',  amount: '$42.3k', width: 72  },
    { initials: 'SR', name: 'Sarah Reynolds',    role: 'PM Lead',         amount: '$38.1k', width: 65  },
    { initials: 'DP', name: 'David Park',        role: 'Install Manager', amount: '$28.7k', width: 49  },
    { initials: 'MB', name: 'Mehmet Bakkaloglu', role: 'CFO',             amount: '$20.4k', width: 35  },
]

const RECENT_APPROVALS = [
    { date: 'Apr 28', employee: 'M. Henderson', dept: 'Field operations', category: 'Lodging',    amount: '$842.10',   status: 'approved' },
    { date: 'Apr 27', employee: 'J. Park',      dept: 'Procurement',      category: 'Airfare',    amount: '$1,240.00', status: 'approved' },
    { date: 'Apr 26', employee: 'R. Alvarez',   dept: 'Field operations', category: 'Mileage',    amount: '$385.50',   status: 'approved' },
    { date: 'Apr 25', employee: 'S. Carter',    dept: 'Sales support',    category: 'Dining',     amount: '$612.75',   status: 'pending'  },
    { date: 'Apr 24', employee: 'D. Kim',        dept: 'Warehouse',        category: 'Car rental', amount: '$215.00',   status: 'approved' },
    { date: 'Apr 23', employee: 'A. Rivera',    dept: 'Procurement',      category: 'Lodging',    amount: '$478.90',   status: 'approved' },
    { date: 'Apr 22', employee: 'L. Nguyen',    dept: 'Install',          category: 'Mileage',    amount: '$129.40',   status: 'approved' },
]

// ── GLSummaryReport — Expense category × GL summary ──────────────────────────

function GLSummaryReport({ onBack }: { onBack: () => void }) {
    const [exportState, setExportState] = useState<'idle' | 'generating' | 'done'>('idle')
    const [postState,   setPostState]   = useState<'idle' | 'posting' | 'done'>('idle')

    const handleExport = () => {
        setExportState('generating')
        setTimeout(() => { setExportState('done'); setTimeout(() => setExportState('idle'), 2000) }, 800)
    }
    const handlePost = () => {
        setPostState('posting')
        setTimeout(() => { setPostState('done'); setTimeout(() => setPostState('idle'), 2500) }, 1000)
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Nav */}
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Back
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        disabled={exportState !== 'idle'}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
                            exportState === 'done' ? 'bg-success/10 border-success/20 text-success'
                            : 'bg-card border-border text-foreground hover:border-primary'
                        }`}
                    >
                        <Download className="h-3 w-3" />
                        {exportState === 'generating' ? 'Generating...' : exportState === 'done' ? 'CSV downloaded ✓' : 'Export CSV'}
                    </button>
                    <button
                        onClick={handlePost}
                        disabled={postState !== 'idle'}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
                            postState === 'done' ? 'bg-success/10 border-success/20 text-success'
                            : 'bg-foreground text-background border-foreground hover:opacity-90'
                        }`}
                    >
                        <CheckCircle2 className="h-3 w-3" />
                        {postState === 'posting' ? 'Posting...' : postState === 'done' ? 'Posted to Core ✓' : 'Post to Core'}
                    </button>
                </div>
            </div>

            {/* Header */}
            <div>
                <p className="text-sm font-bold text-foreground">Expense category × GL summary</p>
                <p className="text-[10px] text-muted-foreground">April 2026 · ready to post to Core</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-2">
                {[
                    { label: 'Posted this month',   value: '$55,245', color: 'text-foreground' },
                    { label: 'Reports processed',   value: '107',     color: 'text-foreground' },
                    { label: 'Pending to post',     value: '5',       color: 'text-warning'    },
                    { label: 'GL accounts touched', value: '8',       color: 'text-foreground' },
                ].map(kpi => (
                    <div key={kpi.label} className="bg-card border border-border rounded-xl px-3 py-2.5">
                        <p className="text-[10px] text-muted-foreground mb-1">{kpi.label}</p>
                        <p className={`text-lg font-bold leading-none ${kpi.color}`}>{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Category × GL table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div>
                        <p className="text-xs font-bold text-foreground">Category × GL breakdown</p>
                        <p className="text-[10px] text-muted-foreground">April 2026 · all departments</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                {[
                                    { label: 'Category',   right: false },
                                    { label: 'GL Account', right: false },
                                    { label: 'April',      right: true  },
                                    { label: 'vs March',   right: true  },
                                    { label: 'Reports',    right: true  },
                                    { label: '6-mo trend', right: true  },
                                    { label: 'Status',     right: true  },
                                ].map(h => (
                                    <th key={h.label} className={`px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap ${h.right ? 'text-right' : 'text-left'}`}>{h.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {GL_ROWS.map(row => (
                                <tr key={row.category} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-2.5 text-[11px] text-foreground whitespace-nowrap">{row.category}</td>
                                    <td className="px-4 py-2.5">
                                        <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{row.glCode}</span>
                                    </td>
                                    <td className="px-4 py-2.5 text-[11px] font-medium text-foreground text-right whitespace-nowrap">${row.april.toLocaleString()}</td>
                                    <td className={`px-4 py-2.5 text-[11px] font-semibold text-right whitespace-nowrap ${row.up ? 'text-success' : 'text-destructive'}`}>{row.vsMarch}</td>
                                    <td className="px-4 py-2.5 text-[11px] text-muted-foreground text-right">{row.reports}</td>
                                    <td className="px-4 py-2.5 text-right">
                                        <svg width="60" height="18" viewBox="0 0 80 22" aria-hidden="true">
                                            <polyline points={row.spark} fill="none" stroke="rgb(var(--color-primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                                            row.status === 'posted'
                                                ? 'bg-success/10 text-success border-success/20'
                                                : 'bg-warning/10 text-warning border-warning/20'
                                        }`}>
                                            {row.status === 'posted' ? 'Posted' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            <tr className="border-t-2 border-border bg-muted/10">
                                <td className="px-4 py-2.5 text-[11px] font-bold text-foreground">Total</td>
                                <td className="px-4 py-2.5 text-[11px] text-muted-foreground">8 accounts</td>
                                <td className="px-4 py-2.5 text-[11px] font-bold text-foreground text-right">$55,245</td>
                                <td className="px-4 py-2.5 text-[11px] font-semibold text-success text-right">+14%</td>
                                <td className="px-4 py-2.5 text-[11px] font-bold text-foreground text-right">107</td>
                                <td />
                                <td className="px-4 py-2.5 text-[11px] text-muted-foreground text-right">102 of 107</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pending to post */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground">Pending to post to Core</p>
                    <p className="text-[10px] text-muted-foreground">5 approved reports waiting for AP processing</p>
                </div>
                <div className="divide-y divide-border/60">
                    {GL_PENDING_ITEMS.map(item => (
                        <div key={item.name} className="flex items-center gap-3 px-4 py-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                                {item.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold text-foreground">{item.name}</p>
                                <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                            </div>
                            <span className="text-[11px] font-medium text-foreground whitespace-nowrap">{item.amount}</span>
                            <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border bg-warning/10 text-warning border-warning/20 shrink-0">Pending</span>
                            <button className="text-[10px] text-foreground border border-border rounded-lg px-2.5 py-1 hover:bg-muted transition-colors shrink-0 font-medium">Post</button>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                    <span className="text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">$5,439.65</span> across 5 reports · 2 GL accounts
                    </span>
                    <button
                        onClick={handlePost}
                        disabled={postState !== 'idle'}
                        className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg font-bold transition-all ${
                            postState === 'done' ? 'bg-success/10 text-success' : 'bg-foreground text-background hover:opacity-90'
                        }`}
                    >
                        {postState === 'posting' ? 'Posting...' : postState === 'done' ? 'Posted ✓' : 'Post all to Core'}
                    </button>
                </div>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
        </div>
    )
}

// ── ApprovalTrendsReport — Supervisor approval trends ─────────────────────────

function ApprovalTrendsReport({ onBack }: { onBack: () => void }) {
    const [exportState, setExportState] = useState<'idle' | 'generating' | 'done'>('idle')

    const handleExport = () => {
        setExportState('generating')
        setTimeout(() => { setExportState('done'); setTimeout(() => setExportState('idle'), 2000) }, 800)
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Nav */}
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Back
                </button>
                <button
                    onClick={handleExport}
                    disabled={exportState !== 'idle'}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
                        exportState === 'done' ? 'bg-success/10 border-success/20 text-success'
                        : 'bg-foreground text-background border-foreground hover:opacity-90'
                    }`}
                >
                    <Download className="h-3 w-3" />
                    {exportState === 'generating' ? 'Generating...' : exportState === 'done' ? 'PDF downloaded ✓' : 'Export PDF'}
                </button>
            </div>

            {/* Header */}
            <div>
                <p className="text-sm font-bold text-foreground">Supervisor approval trends</p>
                <p className="text-[10px] text-muted-foreground">Last 6 months · Tammy Flick — CAO, Operations &amp; Procurement</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-2">
                {[
                    { label: '6-month total',      value: '$58,500', color: 'text-foreground' },
                    { label: 'Monthly avg',         value: '$9,750',  color: 'text-foreground' },
                    { label: 'Reports approved',    value: '142',     color: 'text-foreground' },
                    { label: 'vs. prior 6 months', value: '+18%',    color: 'text-success'    },
                ].map(kpi => (
                    <div key={kpi.label} className="bg-card border border-border rounded-xl px-3 py-2.5">
                        <p className="text-[10px] text-muted-foreground mb-1">{kpi.label}</p>
                        <p className={`text-lg font-bold leading-none ${kpi.color}`}>{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Two-column: bar chart + top approvers */}
            <div className="grid grid-cols-[1.6fr_1fr] gap-3 items-start">

                {/* Approvals by month */}
                <div className="bg-card border border-border rounded-xl px-4 py-3">
                    <p className="text-xs font-bold text-foreground">Approvals by month</p>
                    <p className="text-[10px] text-muted-foreground mb-3">Tammy Flick · Nov 2025 — Apr 2026</p>
                    <div className="relative h-36 flex items-end gap-1.5">
                        <div className="absolute left-0 right-0 border-t border-dashed border-success/50 pointer-events-none" style={{ bottom: '69%' }}>
                            <span className="absolute right-0 text-[9px] text-success -translate-y-full pr-1 bg-card">Avg $9.7k</span>
                        </div>
                        {APPROVAL_MONTHS.map(m => (
                            <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-0.5 h-full">
                                <span className="text-[9px] text-muted-foreground whitespace-nowrap">{m.label}</span>
                                <div
                                    className={`w-full rounded-t-sm ${m.current ? 'bg-primary' : 'bg-primary/40'}`}
                                    style={{ height: `${m.height}%` }}
                                />
                                <span className="text-[10px] text-muted-foreground">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top approvers */}
                <div className="bg-card border border-border rounded-xl px-4 py-3">
                    <p className="text-xs font-bold text-foreground">Top approvers</p>
                    <p className="text-[10px] text-muted-foreground mb-3">Last 6 months · all supervisors</p>
                    <div className="space-y-3">
                        {TOP_APPROVERS.map(a => (
                            <div key={a.name} className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                                    {a.initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] font-semibold text-foreground truncate">{a.name}</p>
                                        <p className="text-[11px] font-bold text-foreground ml-2 shrink-0">{a.amount}</p>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground">{a.role}</p>
                                    <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${a.width}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent approvals table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground">Recent approvals · Tammy Flick</p>
                    <span className="text-[10px] text-primary font-medium cursor-pointer hover:underline">View all approvals</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                {[
                                    { label: 'Date',       right: false },
                                    { label: 'Employee',   right: false },
                                    { label: 'Department', right: false },
                                    { label: 'Category',   right: false },
                                    { label: 'Amount',     right: true  },
                                    { label: 'Status',     right: true  },
                                ].map(h => (
                                    <th key={h.label} className={`px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap ${h.right ? 'text-right' : 'text-left'}`}>{h.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {RECENT_APPROVALS.map(row => (
                                <tr key={row.date + row.employee} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{row.date}</td>
                                    <td className="px-4 py-2.5 text-[11px] font-medium text-foreground whitespace-nowrap">{row.employee}</td>
                                    <td className="px-4 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{row.dept}</td>
                                    <td className="px-4 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{row.category}</td>
                                    <td className="px-4 py-2.5 text-[11px] font-bold text-foreground text-right whitespace-nowrap">{row.amount}</td>
                                    <td className="px-4 py-2.5 text-right">
                                        <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                                            row.status === 'approved'
                                                ? 'bg-success/10 text-success border-success/20'
                                                : 'bg-warning/10 text-warning border-warning/20'
                                        }`}>
                                            {row.status === 'approved' ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CFODashboardScene() {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    isPausedRef.current = isPaused

    const [phase, setPhase]                   = useState<ScenePhase>('company')
    const [may2026Complete, setMay2026Complete] = useState(true)
    const [showPreview, setShowPreview]         = useState(false)
    const [showSpend, setShowSpend]             = useState(true)
    const [barsVisible, setBarsVisible]         = useState(true)
    const [kpisVisible, setKpisVisible]         = useState(true)
    const [period, setPeriod]                   = useState<Period>('may')
    const [deptFilter, setDeptFilter]           = useState<DeptFilter>('all')
    const [deptOpen, setDeptOpen]               = useState(false)
    const [locationFilter, setLocationFilter]   = useState<LocationFilter>('all')
    const [locationOpen, setLocationOpen]       = useState(false)
    const [categoryFilter, setCategoryFilter]   = useState<CategoryFilter>('all')
    const [categoryOpen, setCategoryOpen]       = useState(false)
    const [drillCategory, setDrillCategory]     = useState<string | null>(null)


    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const tick = () => {
            if (isPausedRef.current) { setTimeout(tick, 100); return }
            if (Date.now() - start >= delay) fn()
            else setTimeout(tick, 100)
        }
        setTimeout(tick, 0)
    }, [])

    // inbox → notified
    useEffect(() => {
        if (phase !== 'inbox') return
        pauseAware(() => {
            setMay2026Complete(true)
            setPhase('notified')
        }, 2500)
    }, [phase, pauseAware])

    // role-switch → division
    useEffect(() => {
        if (phase !== 'role-switch') return
        pauseAware(() => {
            setPhase('division')
            setKpisVisible(false)
            setTimeout(() => setKpisVisible(true), 100)
            setTimeout(() => setBarsVisible(true), 400)
        }, 1000)
    }, [phase, pauseAware])

    // Barras: activar 300ms después de entrar a 'company'
    useEffect(() => {
        if (phase !== 'company') { setBarsVisible(false); return }
        const t = setTimeout(() => setBarsVisible(true), 300)
        return () => clearTimeout(t)
    }, [phase])


    // Resetear barras al cambiar cualquier filtro
    useEffect(() => {
        if (phase !== 'company') return
        setBarsVisible(false)
        const t = setTimeout(() => setBarsVisible(true), 150)
        return () => clearTimeout(t)
    }, [deptFilter, locationFilter, categoryFilter, period])

    // KPI stagger
    useEffect(() => {
        if (phase !== 'company') return
        setKpisVisible(false)
        const t = setTimeout(() => setKpisVisible(true), 100)
        return () => clearTimeout(t)
    }, [deptFilter, phase])

    const goToCompany = () => {
        setPhase('company')
        setKpisVisible(false)
        setTimeout(() => setKpisVisible(true), 100)
    }

    // ── Fase: inbox / notified ──
    if (phase === 'inbox' || phase === 'notified') {
        const aprCategories = CATEGORIES_BY_DEPT.all.april
        const aprMax = Math.max(...aprCategories.map(c => c.amount))

        return (
            <div className="space-y-4 animate-in fade-in duration-400">
                {/* Strata notification — slide-in on 'notified' */}
                {phase === 'notified' && (
                    <button
                        onClick={goToCompany}
                        className="w-full animate-in slide-in-from-top duration-500 bg-ai/5 border border-ai/30 rounded-xl px-4 py-3 text-left flex items-start gap-2.5 hover:border-ai/60 transition-all group shadow-sm"
                    >
                        <div className="relative shrink-0 mt-0.5">
                            <div className="h-8 w-8 rounded-xl bg-ai/10 flex items-center justify-center">
                                <Sparkles className="h-3.5 w-3.5 text-ai" />
                            </div>
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-ai border-2 border-card animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-ai uppercase tracking-wide mb-0.5">Strata · Expense cycle complete</p>
                            <p className="text-xs font-semibold text-foreground">May 2026 · $48K posted to accounting system</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Accountant · 2:48 PM · All receipts verified ✓</p>
                            <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                                <span className="text-[10px] bg-success/10 text-success border border-success/20 px-1.5 py-0.5 rounded-full font-medium">23 expenses posted</span>
                                <span className="text-[10px] bg-ai/10 text-ai border border-ai/20 px-1.5 py-0.5 rounded-full font-medium">1 rule improved · Parking 72%→97%</span>
                            </div>
                            <p className="text-xs font-semibold text-ai mt-1.5 group-hover:underline flex items-center gap-1">
                                View May dashboard <ChevronRight className="h-3 w-3" />
                            </p>
                        </div>
                    </button>
                )}

                {/* Mehmet in context — reviewing April 2026 */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between border-b border-border">
                        <div>
                            <p className="text-sm font-bold text-foreground">CFO Dashboard · Mehmet B.</p>
                            <p className="text-[10px] text-muted-foreground">Currently reviewing: April 2026 · Closed cycle</p>
                        </div>
                        <span className="text-[10px] font-medium text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">Closed ✓</span>
                    </div>
                    {/* April KPIs */}
                    <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                        {[
                            { label: 'Total spend',   value: '$43K'  },
                            { label: 'Expenses',      value: '19'    },
                            { label: 'On-time Rate',   value: '97%'   },
                        ].map(kpi => (
                            <div key={kpi.label} className="px-3 py-2.5 text-center">
                                <p className="text-base font-bold text-foreground">{kpi.value}</p>
                                <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                            </div>
                        ))}
                    </div>
                    {/* Mini spend bars — April (muted, static) */}
                    <div className="px-4 py-3 space-y-2">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Spend by category — April</p>
                        {aprCategories.map(cat => (
                            <div key={cat.name} className="flex items-center gap-2.5">
                                <span className="text-[11px] text-muted-foreground w-14 shrink-0">{cat.name}</span>
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-muted-foreground/25 rounded-full"
                                        style={{ width: `${(cat.amount / aprMax) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[11px] text-muted-foreground w-9 text-right shrink-0">${(cat.amount / 1000).toFixed(1)}K</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expense cycles list */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                        <p className="text-xs font-bold text-foreground">Expense Cycles</p>
                        <p className="text-[10px] text-muted-foreground">All departments · Strata-aggregated</p>
                    </div>
                    <div className="divide-y divide-border">
                        {EXPENSE_CYCLES.map((cycle, i) => {
                            const isMay = i === 0
                            const isComplete = isMay ? may2026Complete : cycle.status === 'closed'
                            return (
                                <div
                                    key={cycle.period}
                                    className={`flex items-center justify-between px-4 py-3 transition-all ${isMay && may2026Complete ? 'bg-success/5' : ''}`}
                                >
                                    <div className="space-y-0.5">
                                        <p className={`text-xs font-semibold ${isMay ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {cycle.period}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {cycle.total} · {cycle.count} expenses
                                            {isMay && may2026Complete && cycle.postedBy && (
                                                <span className="text-success"> · {cycle.postedBy}</span>
                                            )}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-medium transition-all duration-300 ${
                                        isComplete
                                            ? 'text-success'
                                            : 'text-muted-foreground flex items-center gap-1'
                                    }`}>
                                        {isMay && !may2026Complete
                                            ? <span className="flex items-center gap-1"><Loader2 className="h-2.5 w-2.5 animate-spin" />Processing...</span>
                                            : isComplete ? 'Closed ✓' : 'Closed ✓'
                                        }
                                        {isMay && may2026Complete && (
                                            <span className="animate-in fade-in duration-300">Complete ✓</span>
                                        )}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground">
                        <span className="font-medium text-foreground">Before Strata:</span> Mehmet opened each expense report one by one — no consolidated view, no auto-aggregation.
                    </p>
                </div>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
            </div>
        )
    }

    // ── Fase: role-switch ──
    if (phase === 'role-switch') {
        return <RoleSwitchBanner />
    }

    // ── Fases: company + division ──
    return (
        <div className="space-y-4">
            {/* PDF preview modal */}
            {showPreview && <ReportPreviewModal onClose={() => setShowPreview(false)} />}

            {/* Tab switcher */}
            <div className="flex gap-1 bg-muted/40 border border-border rounded-xl p-1 flex-wrap">
                <button
                    onClick={() => setShowSpend(false)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${!showSpend && phase === 'company' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    🏢 Company — Mehmet
                </button>
                <button
                    onClick={() => { setShowSpend(false); if (phase === 'company') setPhase('role-switch') }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${!showSpend && phase === 'division' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    📊 Ops &amp; Procurement — Tammy
                </button>
                <button
                    onClick={() => setShowSpend(true)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${showSpend ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    📈 Operations Spend
                </button>
            </div>

            {!showSpend && phase === 'company' && <NotificationBadge />}

            {showSpend ? (
                <OperationsSpendView />
            ) : phase === 'company' ? (
                <CompanyView
                    period={period} setPeriod={setPeriod}
                    deptFilter={deptFilter} setDeptFilter={setDeptFilter}
                    deptOpen={deptOpen} setDeptOpen={setDeptOpen}
                    locationFilter={locationFilter} setLocationFilter={setLocationFilter}
                    locationOpen={locationOpen} setLocationOpen={setLocationOpen}
                    categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
                    categoryOpen={categoryOpen} setCategoryOpen={setCategoryOpen}
                    drillCategory={drillCategory} setDrillCategory={setDrillCategory}
                    kpisVisible={kpisVisible} barsVisible={barsVisible}
                    onPreviewClick={() => setShowPreview(true)}
                />
            ) : (
                <DivisionView kpisVisible={kpisVisible} barsVisible={barsVisible} />
            )}
        </div>
    )
}

// ── CompanyView ───────────────────────────────────────────────────────────────

function CompanyView({
    period, setPeriod, deptFilter, setDeptFilter, deptOpen, setDeptOpen,
    locationFilter, setLocationFilter, locationOpen, setLocationOpen,
    categoryFilter, setCategoryFilter, categoryOpen, setCategoryOpen,
    drillCategory, setDrillCategory,
    kpisVisible, barsVisible, onPreviewClick,
}: {
    period: Period; setPeriod: (p: Period) => void
    deptFilter: DeptFilter; setDeptFilter: (d: DeptFilter) => void
    deptOpen: boolean; setDeptOpen: (v: boolean) => void
    locationFilter: LocationFilter; setLocationFilter: (l: LocationFilter) => void
    locationOpen: boolean; setLocationOpen: (v: boolean) => void
    categoryFilter: CategoryFilter; setCategoryFilter: (c: CategoryFilter) => void
    categoryOpen: boolean; setCategoryOpen: (v: boolean) => void
    drillCategory: string | null; setDrillCategory: (c: string | null) => void
    kpisVisible: boolean; barsVisible: boolean
    onPreviewClick: () => void
}) {
    const kpi = KPI_BY_DEPT[deptFilter]

    // Apply location scale + category filter
    const rawCategories = CATEGORIES_BY_DEPT[deptFilter][period]
    const locationScaled = rawCategories.map(c => ({
        ...c,
        amount: locationFilter === 'all' ? c.amount : Math.round(c.amount * LOCATION_SCALE[locationFilter] / 100) * 100,
    }))
    const displayCategories = categoryFilter === 'all'
        ? locationScaled
        : locationScaled.filter(c => c.name === categoryFilter)
    const maxCat = Math.max(...displayCategories.map(c => c.amount), 1)

    const scaledKPI = {
        month: locationFilter === 'all'
            ? kpi.month
            : `$${Math.round(parseInt(kpi.month.replace(/\D/g, '')) * LOCATION_SCALE[locationFilter]).toFixed(0)}K`,
        pending: locationFilter === 'all' ? kpi.pending : Math.ceil(kpi.pending * LOCATION_SCALE[locationFilter]),
        onTime: kpi.onTime,
    }

    const KPIs = [
        { label: 'This Month',        value: scaledKPI.month,              sub: 'May 2026' },
        { label: 'Pending Approvals', value: String(scaledKPI.pending),    sub: 'expenses' },
        { label: 'On-time Rate',      value: scaledKPI.onTime,             sub: '↑ from 89%' },
    ]

    const [compareMode, setCompareMode] = useState(false)

    const [exportState, setExportState] = useState<Record<string, 'idle' | 'generating' | 'done'>>({
        csv: 'idle', pdf: 'idle',
    })
    const handleExport = (type: 'csv' | 'pdf') => {
        setExportState(prev => ({ ...prev, [type]: 'generating' }))
        setTimeout(() => {
            setExportState(prev => ({ ...prev, [type]: 'done' }))
            setTimeout(() => setExportState(prev => ({ ...prev, [type]: 'idle' })), 2000)
        }, 700)
    }

    // Close all dropdowns when clicking one
    const openDept = () => { setDeptOpen(!deptOpen); setLocationOpen(false); setCategoryOpen(false) }
    const openLoc  = () => { setLocationOpen(!locationOpen); setDeptOpen(false); setCategoryOpen(false) }
    const openCat    = () => { setCategoryOpen(!categoryOpen); setDeptOpen(false); setLocationOpen(false) }
    const [periodOpen, setPeriodOpen] = useState(false)
    const openPeriod = () => { setPeriodOpen(p => !p); setDeptOpen(false); setLocationOpen(false); setCategoryOpen(false) }

    const PERIOD_OPTIONS = [
        { id: 'may'    as Period, label: 'May 2026',       available: true  },
        { id: 'april'  as Period, label: 'April 2026',     available: true  },
        { id: null,               label: 'Last 6 months',  available: false },
        { id: null,               label: 'Custom range…',  available: false },
    ]
    const periodLabel = period === 'may' ? 'May 2026' : 'April 2026'

    return (
        <div className="space-y-4">
            {/* Filter bar — dept / location / category / period */}
            <div className="flex gap-1.5 flex-wrap">
                {/* Dept */}
                <div className="relative">
                    <button
                        onClick={openDept}
                        className={`flex items-center gap-1 text-xs border px-2.5 py-1 rounded-full transition-colors ${deptFilter !== 'all' ? 'bg-foreground text-background border-foreground font-semibold' : 'bg-card border-border text-foreground hover:border-primary'}`}
                    >
                        {DEPT_LABELS[deptFilter]} <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                    </button>
                    {deptOpen && (
                        <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-xl shadow-md overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                            {(Object.keys(DEPT_LABELS) as DeptFilter[]).map(d => (
                                <button key={d} onClick={() => { setDeptFilter(d); setDeptOpen(false); setDrillCategory(null) }}
                                    className={`w-full text-left px-4 py-2 text-xs hover:bg-muted transition-colors ${deptFilter === d ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                                    {DEPT_LABELS[d]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Location */}
                <div className="relative">
                    <button
                        onClick={openLoc}
                        className={`flex items-center gap-1 text-xs border px-2.5 py-1 rounded-full transition-colors ${locationFilter !== 'all' ? 'bg-foreground text-background border-foreground font-semibold' : 'bg-card border-border text-foreground hover:border-primary'}`}
                    >
                        {LOCATION_LABELS[locationFilter]} <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                    </button>
                    {locationOpen && (
                        <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-xl shadow-md overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                            {(Object.keys(LOCATION_LABELS) as LocationFilter[]).map(l => (
                                <button key={l} onClick={() => { setLocationFilter(l); setLocationOpen(false) }}
                                    className={`w-full text-left px-4 py-2 text-xs hover:bg-muted transition-colors ${locationFilter === l ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                                    {LOCATION_LABELS[l]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category */}
                <div className="relative">
                    <button
                        onClick={openCat}
                        className={`flex items-center gap-1 text-xs border px-2.5 py-1 rounded-full transition-colors ${categoryFilter !== 'all' ? 'bg-foreground text-background border-foreground font-semibold' : 'bg-card border-border text-foreground hover:border-primary'}`}
                    >
                        {CATEGORY_FILTER_LABELS[categoryFilter]} <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                    </button>
                    {categoryOpen && (
                        <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-xl shadow-md overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                            {(Object.keys(CATEGORY_FILTER_LABELS) as CategoryFilter[]).map(c => (
                                <button key={c} onClick={() => { setCategoryFilter(c); setCategoryOpen(false); setDrillCategory(null) }}
                                    className={`w-full text-left px-4 py-2 text-xs hover:bg-muted transition-colors ${categoryFilter === c ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                                    {CATEGORY_FILTER_LABELS[c]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Period */}
                <div className="relative">
                    <button
                        onClick={openPeriod}
                        className={`flex items-center gap-1 text-xs border px-2.5 py-1 rounded-full transition-colors bg-card border-border text-foreground hover:border-primary`}
                    >
                        {periodLabel} <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                    </button>
                    {periodOpen && (
                        <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-xl shadow-md overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 min-w-[148px]">
                            {PERIOD_OPTIONS.map((opt, i) => (
                                opt.available ? (
                                    <button key={i} onClick={() => { setPeriod(opt.id!); setPeriodOpen(false); setCompareMode(false) }}
                                        className={`w-full text-left px-4 py-2 text-xs hover:bg-muted transition-colors ${period === opt.id ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                                        {opt.label}
                                    </button>
                                ) : (
                                    <div key={i} className="flex items-center justify-between px-4 py-2 opacity-40 cursor-not-allowed">
                                        <span className="text-xs text-muted-foreground">{opt.label}</span>
                                        <span className="text-[9px] text-muted-foreground font-medium">Soon</span>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-2">
                {KPIs.map((kpi, i) => (
                    <div key={kpi.label}
                        className={`bg-card border border-border rounded-xl px-3 py-3 text-center transition-all duration-500 ${kpisVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        style={{ transitionDelay: `${i * 200}ms` }}
                    >
                        <p className="text-lg font-bold text-foreground leading-none">{kpi.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{kpi.label}</p>
                        <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* Cycle summary — connects to w2.2 (posted) + w2.3 (rule improved) */}
            <div className="bg-card border border-border rounded-xl px-4 py-3 space-y-2">
                <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-ai shrink-0" />
                    <p className="text-[10px] font-semibold text-ai">May 2026 · Cycle closed by Letza Bombard · 2:48 PM</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                        { value: '23',   label: 'Expenses posted',    color: 'text-foreground' },
                        { value: '100%', label: 'Receipts verified',  color: 'text-success'    },
                        { value: '1 ↑',  label: 'GL rule improved',   color: 'text-ai'         },
                    ].map(stat => (
                        <div key={stat.label} className="bg-muted/40 rounded-xl px-2 py-2">
                            <p className={`text-sm font-bold ${stat.color} leading-none`}>{stat.value}</p>
                            <p className="text-[9px] text-muted-foreground mt-1 leading-tight">{stat.label}</p>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-muted-foreground">Parking auto-classification updated · next submissions will match at 97%+</p>
            </div>

            {/* Spend bars */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground">Spend by Category</p>
                    <div className="flex gap-1 bg-muted/40 rounded-lg p-0.5">
                        {(['april', 'may'] as Period[]).map(p => (
                            <button key={p}
                                onClick={() => { setPeriod(p); setCompareMode(false) }}
                                className={`text-[10px] px-2 py-1 rounded font-medium capitalize transition-all ${!compareMode && period === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                                {p === 'april' ? 'Apr' : 'May'}
                            </button>
                        ))}
                        <button
                            onClick={() => setCompareMode(c => !c)}
                            className={`text-[10px] px-2 py-1 rounded font-medium transition-all ${compareMode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                        >
                            Compare ↔
                        </button>
                    </div>
                </div>

                {/* Compare mode — side-by-side bars per category (Mehmet's ask) */}
                {compareMode ? (
                    <div className="px-4 py-3 space-y-3 animate-in fade-in duration-300">
                        {/* Legend */}
                        <div className="flex items-center gap-4 pb-1">
                            <div className="flex items-center gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-sm bg-primary/70 shrink-0" />
                                <span className="text-[10px] text-muted-foreground font-medium">May 2026</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/30 shrink-0" />
                                <span className="text-[10px] text-muted-foreground font-medium">April 2026</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground ml-auto">MoM Δ</span>
                        </div>

                        {CATEGORIES_BY_DEPT[deptFilter].may.map((cat, catIdx) => {
                            const rawCat  = CATEGORIES_BY_DEPT[deptFilter]
                            const mayAmt  = locationFilter === 'all' ? cat.amount : Math.round(cat.amount * LOCATION_SCALE[locationFilter] / 100) * 100
                            const aprAmt  = locationFilter === 'all'
                                ? (rawCat.april.find(c => c.name === cat.name)?.amount ?? 0)
                                : Math.round((rawCat.april.find(c => c.name === cat.name)?.amount ?? 0) * LOCATION_SCALE[locationFilter] / 100) * 100
                            const maxAmt  = Math.max(mayAmt, aprAmt, 1)
                            const delta   = aprAmt > 0 ? Math.round(((mayAmt - aprAmt) / aprAmt) * 100) : 0

                            return (
                                <div key={cat.name} className="space-y-1 animate-in fade-in duration-300" style={{ animationDelay: `${catIdx * 60}ms` }}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-foreground w-16 shrink-0">{cat.name}</span>
                                        <span className={`text-[10px] font-bold ${delta > 0 ? 'text-warning' : 'text-success'}`}>
                                            {delta > 0 ? '+' : ''}{delta}%
                                        </span>
                                    </div>
                                    {/* May bar */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-muted-foreground w-8 shrink-0 text-right">May</span>
                                        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary/70 rounded-full transition-all duration-700 ease-out"
                                                style={{ width: barsVisible ? `${(mayAmt / maxAmt) * 100}%` : '0%' }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-semibold text-foreground w-10 text-right shrink-0">
                                            ${mayAmt >= 1000 ? `${(mayAmt / 1000).toFixed(1)}K` : mayAmt}
                                        </span>
                                    </div>
                                    {/* Apr bar */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-muted-foreground w-8 shrink-0 text-right">Apr</span>
                                        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-muted-foreground/30 rounded-full transition-all duration-700 ease-out"
                                                style={{ width: barsVisible ? `${(aprAmt / maxAmt) * 100}%` : '0%' }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground w-10 text-right shrink-0">
                                            ${aprAmt >= 1000 ? `${(aprAmt / 1000).toFixed(1)}K` : aprAmt}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}

                        <p className="text-[10px] text-muted-foreground pt-1 border-t border-border">
                            Comparing May 2026 vs April 2026 · {DEPT_LABELS[deptFilter]} · {LOCATION_LABELS[locationFilter]}
                        </p>
                    </div>
                ) : (
                <div className="px-4 py-3 space-y-2.5" key={`${deptFilter}-${period}-${locationFilter}-${categoryFilter}`}>
                    {displayCategories.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">No data for selected filters</p>
                    ) : displayCategories.map((cat, catIdx) => {
                        const rawCat   = CATEGORIES_BY_DEPT[deptFilter]
                        const catMay   = (locationFilter === 'all' ? rawCat.may.find(c => c.name === cat.name)?.amount : Math.round((rawCat.may.find(c => c.name === cat.name)?.amount ?? 0) * LOCATION_SCALE[locationFilter] / 100) * 100) ?? 0
                        const catApril = (locationFilter === 'all' ? rawCat.april.find(c => c.name === cat.name)?.amount : Math.round((rawCat.april.find(c => c.name === cat.name)?.amount ?? 0) * LOCATION_SCALE[locationFilter] / 100) * 100) ?? 0
                        const delta    = catApril > 0 ? Math.round(((catMay - catApril) / catApril) * 100) : 0
                        const isDrilled = drillCategory === cat.name

                        return (
                            <div key={cat.name} className="animate-in fade-in duration-300" style={{ animationDelay: `${catIdx * 60}ms` }}>
                                <button onClick={() => setDrillCategory(isDrilled ? null : cat.name)} className="w-full text-left group">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-foreground w-16 shrink-0">{cat.name}</span>
                                        <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden relative">
                                            <div
                                                className="h-full bg-primary/70 group-hover:bg-primary/90 rounded-full transition-all duration-700 ease-out"
                                                style={{ width: barsVisible ? `${(cat.amount / maxCat) * 100}%` : '0%' }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-foreground w-12 text-right shrink-0">
                                            ${cat.amount >= 1000 ? `${(cat.amount / 1000).toFixed(1)}K` : cat.amount}
                                        </span>
                                        {period === 'may' && delta !== 0 && (
                                            <span className={`text-[10px] font-bold w-10 text-right shrink-0 ${delta > 0 ? 'text-warning' : 'text-success'}`}>
                                                {delta > 0 ? '+' : ''}{delta}%
                                            </span>
                                        )}
                                        <ChevronDown className={`h-3 w-3 shrink-0 text-muted-foreground transition-all duration-200 ${isDrilled ? 'rotate-180 opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />
                                    </div>
                                </button>

                                {isDrilled && (
                                    <div className="ml-[72px] space-y-1.5 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {FUEL_DRILL.map(item => (
                                            <div key={item.name} className="flex items-center justify-between bg-muted/40 border border-border rounded-lg px-3 py-1.5 gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-xs text-foreground">{item.name}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">{item.purpose}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs font-mono text-foreground">{item.amount}</span>
                                                    {item.receipt && <span className="text-[10px] text-success">receipt ✓</span>}
                                                </div>
                                            </div>
                                        ))}
                                        {cat.name === 'Fuel' && period === 'may' && (
                                            <p className="text-[10px] text-muted-foreground px-1">Fuel +{delta}% MoM — 3 new field staff onboarded in May</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
                )}
            </div>

            {/* Preview Full Report CTA */}
            <button
                onClick={onPreviewClick}
                className="w-full flex items-center justify-center gap-1.5 text-xs bg-card border border-border text-foreground py-2.5 rounded-xl hover:border-primary transition-colors font-medium"
            >
                <FileText className="h-3.5 w-3.5" />
                Preview Full Report
            </button>

            {/* Pending > 3 days */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    <p className="text-xs font-bold text-foreground">{OVERDUE_ALERTS.length} reports pending &gt; 3 days</p>
                </div>
                <div className="divide-y divide-border">
                    {OVERDUE_ALERTS.map(a => (
                        <div key={a.name} className="flex items-center justify-between px-4 py-2.5">
                            <div>
                                <p className="text-xs font-semibold text-foreground">{a.name} · {a.amount}</p>
                                <p className="text-[10px] text-muted-foreground">Manager: {a.manager} · {a.days} days pending</p>
                            </div>
                            <span className="text-[10px] font-bold text-warning">{a.days}d ⚠️</span>
                        </div>
                    ))}
                </div>
                <div className="px-4 py-3 border-t border-border">
                    <ReminderScheduler alerts={OVERDUE_ALERTS} />
                </div>
            </div>

            {/* Export */}
            <div className="flex gap-2">
                <ExportButton type="csv" state={exportState.csv} onClick={() => handleExport('csv')} />
                <ExportButton type="pdf" state={exportState.pdf} onClick={() => handleExport('pdf')} />
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
        </div>
    )
}

// ── DivisionView ──────────────────────────────────────────────────────────────

function DivisionView({ kpisVisible, barsVisible }: { kpisVisible: boolean; barsVisible: boolean }) {
    const [reminderSent, setReminderSent] = useState(false)
    const maxDept = Math.max(...DIVISION_DEPTS.map(d => d.amount))

    const divisionKPIs = [
        { label: 'Division Spend', value: '$48K', sub: 'May 2026' },
        { label: 'Your Reports',   value: '38',   sub: 'direct + indirect' },
        { label: 'On-time Rate',    value: '92%',  sub: 'Ops & Procurement' },
    ]

    return (
        <div className="space-y-4">
            <TammyNotificationBanner />

            <div className="grid grid-cols-3 gap-2">
                {divisionKPIs.map((kpi, i) => (
                    <div key={kpi.label}
                        className={`bg-card border border-border rounded-xl px-3 py-3 text-center transition-all duration-500 ${kpisVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        style={{ transitionDelay: `${i * 200}ms` }}
                    >
                        <p className="text-lg font-bold text-foreground leading-none">{kpi.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{kpi.label}</p>
                        <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* Hierarchy */}
            <div className="bg-card border border-border rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {['Employee', 'Manager', 'Dept Head (Tammy)', 'CFO/AP'].map((level, i, arr) => (
                        <div key={level} className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-2 py-1 rounded-full ${level === 'Dept Head (Tammy)' ? 'bg-ai/10 border border-ai/20 text-ai font-semibold' : 'bg-muted text-foreground'}`}>{level}</span>
                            {i < arr.length - 1 && <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />}
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Your division: Ops &amp; Procurement · 38 direct + indirect reports</p>
            </div>

            {/* Division bars */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground">Division Spend — May 2026</p>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                    {DIVISION_DEPTS.map(dept => (
                        <div key={dept.name} className="flex items-center gap-2">
                            <span className="text-xs text-foreground w-24 shrink-0">{dept.name}</span>
                            <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary/70 rounded-full transition-all duration-700 ease-out"
                                    style={{ width: barsVisible ? `${(dept.amount / maxDept) * 100}%` : '0%' }} />
                            </div>
                            <span className="text-xs font-bold text-foreground w-12 text-right shrink-0">${(dept.amount / 1000).toFixed(0)}K</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* By Location */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground">By Location</p>
                </div>
                <div className="divide-y divide-border">
                    {LOCATIONS_LIST.map(loc => (
                        <div key={loc.city} className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-xs text-foreground">{loc.city}</span>
                            <span className="text-xs font-bold text-foreground">${(loc.amount / 1000).toFixed(0)}K</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Overdue — highlighted for Tammy */}
            <div className="bg-card border border-border rounded-xl overflow-hidden ring-1 ring-warning/30">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    <p className="text-xs font-bold text-foreground">Overdue in your division</p>
                </div>
                <div className="divide-y divide-border">
                    {[{ name: 'Mike Torres', days: 4 }, { name: 'Ana Reyes', days: 3 }].map(m => (
                        <div key={m.name} className="flex items-center justify-between px-4 py-2.5">
                            <div>
                                <p className="text-xs font-semibold text-foreground">{m.name} (manager)</p>
                                <p className="text-[10px] text-muted-foreground">1 expense · {m.days} days pending</p>
                            </div>
                            <span className="text-[10px] font-bold text-warning">{m.days}d ⚠️</span>
                        </div>
                    ))}
                </div>
                <div className="px-4 py-3 border-t border-border">
                    <button
                        onClick={() => setReminderSent(true)}
                        className={`w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-medium transition-all border ${reminderSent ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20'}`}
                    >
                        <Bell className="h-3 w-3" />
                        {reminderSent ? 'Reminders sent ✓' : 'Send reminder to both managers'}
                    </button>
                </div>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
        </div>
    )
}

// ── ExportButton ──────────────────────────────────────────────────────────────

function ExportButton({ type, state, onClick }: { type: 'csv' | 'pdf'; state: 'idle' | 'generating' | 'done'; onClick: () => void }) {
    return (
        <button onClick={onClick} disabled={state !== 'idle'}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-xl font-medium transition-all border ${state === 'done' ? 'bg-success/10 border-success/20 text-success' : 'bg-card border-border text-foreground hover:border-primary'}`}
        >
            <Download className="h-3.5 w-3.5" />
            {state === 'generating' ? 'Generating...' : state === 'done' ? `${type.toUpperCase()} downloaded ✓` : `Export ${type.toUpperCase()}`}
        </button>
    )
}
