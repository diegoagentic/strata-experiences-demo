/**
 * COMPONENT: UpstreamPreviewSheet
 * PURPOSE: Apr 23 stakeholder ask (Matt): "we have to SHOW creation of the
 *          project". The Overview UpstreamCards (CRM · Project Creation)
 *          communicated upstream existence but were static. This sheet
 *          opens on click and renders a mock view of each upstream artifact
 *          so MBI sees what the lead form / project record looks like in
 *          their existing CORE workflow before Strata takes over.
 *
 *          Two presentational forms · no real wiring · clearly marked as
 *          "current MBI workflow" (no AI changes here, that's the point).
 *
 * USED BY: MBIOverviewPage (UpstreamCard click handlers)
 *
 * PROPS:
 *   - kind: 'crm' | 'project' | null   null = closed
 *   - onClose: () => void
 *
 * DS TOKENS: bg-card · border-border · text-foreground/muted ·
 *            destructive accent for "no AI here" callout
 */

import {
    Users, Building2, Mail, Phone, Calendar, MapPin, Briefcase, Hash,
    User, Tag, ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle,
} from 'lucide-react'
import MBIDetailSheet from './MBIDetailSheet'
import { StatusBadge } from '../shared'

interface UpstreamPreviewSheetProps {
    kind: 'crm' | 'project' | null
    onClose: () => void
}

export default function UpstreamPreviewSheet({ kind, onClose }: UpstreamPreviewSheetProps) {
    if (!kind) return null

    return (
        <MBIDetailSheet
            isOpen={kind !== null}
            onClose={onClose}
            title={kind === 'crm' ? 'CRM · Lead capture (current MBI workflow)' : 'Project Creation (current MBI workflow)'}
            subtitle={kind === 'crm'
                ? 'How a new opportunity enters CORE today · before Strata picks it up'
                : 'How a project record opens in CORE today · before Strata takes over'
            }
            icon={kind === 'crm' ? <Users className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
            width="md"
        >
            {kind === 'crm' ? <CRMLeadView /> : <ProjectCreationView />}
        </MBIDetailSheet>
    )
}

// ─── CRM Lead view ─────────────────────────────────────────────────────────
function CRMLeadView() {
    return (
        <div className="space-y-4">
            <NoAIBanner />

            {/* Lead identity card */}
            <section className="bg-background/60 dark:bg-zinc-900/40 border border-border rounded-xl p-4 space-y-3">
                <header className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <StatusBadge label="LEAD-2026-0184" tone="info" size="xs" />
                        <StatusBadge label="Qualified" tone="success" size="xs" icon={<CheckCircle2 className="h-2.5 w-2.5" />} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">Created 5 days ago · Account Manager</span>
                </header>
                <h3 className="text-base font-bold text-foreground leading-tight">Enterprise Holdings · New HQ Floor 12</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Renovation of the 12th floor of their downtown HQ. Mix of workstations, private offices, conferencing, and a small lounge area. Expected delivery Q3.
                </p>
            </section>

            {/* Contact + classification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FieldGroup label="Primary contact">
                    <FieldRow icon={<User className="h-3 w-3" />} label="Name" value="Sarah Chen" />
                    <FieldRow icon={<Briefcase className="h-3 w-3" />} label="Role" value="Director of Facilities" />
                    <FieldRow icon={<Mail className="h-3 w-3" />} label="Email" value="s.chen@enterprise-corp.example" />
                    <FieldRow icon={<Phone className="h-3 w-3" />} label="Phone" value="+1 314 555 0142" />
                </FieldGroup>

                <FieldGroup label="Classification">
                    <FieldRow icon={<Tag className="h-3 w-3" />} label="Vertical" value="Corporate" />
                    <FieldRow icon={<ShieldCheck className="h-3 w-3" />} label="Contract" value="HNI · 55%" />
                    <FieldRow icon={<MapPin className="h-3 w-3" />} label="Site" value="St. Louis, MO" />
                    <FieldRow icon={<Calendar className="h-3 w-3" />} label="Target install" value="2026-08-15" />
                </FieldGroup>
            </div>

            {/* Scope estimate (what salesperson captured) */}
            <FieldGroup label="Rough scope (captured by Account Manager)">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                    <ScopeChip label="Workstations" value="45" />
                    <ScopeChip label="Private offices" value="8" />
                    <ScopeChip label="Conf. rooms" value="2" />
                    <ScopeChip label="Lounge" value="1" />
                </div>
                <FieldRow icon={<Hash className="h-3 w-3" />} label="Expected ceiling" value="$385,000" />
            </FieldGroup>

            {/* Activity */}
            <FieldGroup label="Recent activity">
                <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                    <li className="flex items-start gap-2">
                        <span className="text-success mt-0.5">●</span>
                        <span><strong className="text-foreground">5 days ago:</strong> Discovery call · scope confirmed · qualified</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-info mt-0.5">●</span>
                        <span><strong className="text-foreground">3 days ago:</strong> NDA signed · contract HNI confirmed</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-muted-foreground mt-0.5">●</span>
                        <span><strong className="text-foreground">Today:</strong> Ready to convert to Project</span>
                    </li>
                </ul>
            </FieldGroup>

            {/* Convert CTA (mock) */}
            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/30 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="text-[11px] text-foreground">
                    <strong>Next:</strong> Convert this lead to a Project. PC team picks it up · auto-numbered · contract tagged.
                </div>
                <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-primary-foreground bg-primary rounded-lg cursor-not-allowed opacity-90">
                    Convert to Project
                    <ArrowRight className="h-3 w-3" />
                </span>
            </div>
        </div>
    )
}

// ─── Project Creation view ─────────────────────────────────────────────────
function ProjectCreationView() {
    return (
        <div className="space-y-4">
            <NoAIBanner />

            {/* Auto-generated header */}
            <section className="bg-background/60 dark:bg-zinc-900/40 border border-border rounded-xl p-4 space-y-3">
                <header className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <StatusBadge label="PRJ-2026-0184" tone="primary" size="xs" />
                        <StatusBadge label="Active" tone="success" size="xs" icon={<CheckCircle2 className="h-2.5 w-2.5" />} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">Just now · auto-numbered from LEAD-2026-0184</span>
                </header>
                <h3 className="text-base font-bold text-foreground leading-tight">Enterprise Holdings · New HQ Floor 12</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    CORE created the project record using the lead context. Numbering follows the STL series (St. Louis), contract pre-filled, vertical tagged. From here Strata picks up the workflow.
                </p>
            </section>

            {/* Read-only fields from CRM */}
            <FieldGroup label="From CRM (read-only)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1">
                    <FieldRow icon={<Building2 className="h-3 w-3" />} label="Client" value="Enterprise Holdings" />
                    <FieldRow icon={<Tag className="h-3 w-3" />} label="Vertical" value="Corporate" />
                    <FieldRow icon={<ShieldCheck className="h-3 w-3" />} label="Contract" value="HNI · 55%" />
                    <FieldRow icon={<MapPin className="h-3 w-3" />} label="Site" value="St. Louis, MO" />
                </div>
            </FieldGroup>

            {/* Newly assigned */}
            <FieldGroup label="Newly assigned">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1">
                    <FieldRow icon={<User className="h-3 w-3" />} label="Account Manager" value="(named on lead)" />
                    <FieldRow icon={<Briefcase className="h-3 w-3" />} label="PC assigned" value="Auto-routed by load" />
                    <FieldRow icon={<Calendar className="h-3 w-3" />} label="Target install" value="2026-08-15" />
                    <FieldRow icon={<Hash className="h-3 w-3" />} label="Budget ceiling" value="$385,000" />
                </div>
            </FieldGroup>

            {/* Flags */}
            <FieldGroup label="Project flags">
                <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge label="Healthcare: no" tone="neutral" size="xs" />
                    <StatusBadge label="Government: no" tone="neutral" size="xs" />
                    <StatusBadge label="Salesperson-led" tone="info" size="xs" />
                    <StatusBadge label="Standard scope" tone="neutral" size="xs" />
                </div>
            </FieldGroup>

            {/* Handoff card */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <ArrowRight className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-[11px]">
                    <div className="font-bold text-foreground">Strata picks up here</div>
                    <div className="text-muted-foreground mt-0.5">
                        From this point on, AP invoices for this project will land in the Accounting AI queue (Flow 1). When the budget is signed, the PC team picks it up via Quotes AI (Flow 2).
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Shared bits ────────────────────────────────────────────────────────────
function NoAIBanner() {
    return (
        <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 flex items-center gap-2.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-[10px] text-foreground leading-snug">
                <strong>Pre-AI · existing CORE workflow.</strong>
                <span className="text-muted-foreground"> Strata does not change this step — it picks up after the project is created.</span>
            </span>
        </div>
    )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <section>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</div>
            <div className="space-y-1">{children}</div>
        </section>
    )
}

function FieldRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-2 text-[11px] py-1">
            <span className="text-muted-foreground shrink-0">{icon}</span>
            <span className="text-muted-foreground w-28 shrink-0">{label}</span>
            <span className="text-foreground font-semibold truncate">{value}</span>
        </div>
    )
}

function ScopeChip({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-lg p-2">
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
            <div className="text-base font-bold text-foreground tabular-nums leading-tight mt-0.5">{value}</div>
        </div>
    )
}
