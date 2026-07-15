/**
 * COMPONENT: BudgetRequestFormPreview
 * PURPOSE: Apr 23 stakeholder ask (Matt): show MBI the future-state Budget
 *          Request Form (single trigger that gathers SIF + CAP + template +
 *          substitution rules) but flag it as "to validate with MBI" so they
 *          can shape the field set in their Phase 1 design session.
 *
 *          Originally lived inside BudgetIntakeStep, but Budget Builder is
 *          out of scope for the Thursday demo (Carlos), so the component now
 *          lives standalone and is rendered on the MBI Overview as a Future
 *          State preview. Kept importable from BudgetIntakeStep so re-enabling
 *          Budget Builder later doesn't fork the implementation.
 *
 * PROPS:
 *   - onUse?: () => void   when set, renders an action button that hands off
 *                          to the existing intake flow. When omitted (the
 *                          Overview case), renders a passive caveat instead
 *                          so the audience reads the section as a preview,
 *                          not a working form.
 *
 * STATES:
 *   - default                  4 illustrative inputs, dashed/muted styling
 *   - hands-off (onUse set)    primary CTA "Use this trigger →" visible
 *   - preview only (no onUse)  caption "Validate field set with MBI..."
 *
 * DS TOKENS: bg-ai/5 + dashed border-ai/40 to mark "future state" without
 * stealing focus from the active flow nearby.
 */

import {
    Sparkles, ArrowRight, Upload, ChevronDown,
    FileSpreadsheet, FileCode2, FileText, Replace, AlertTriangle,
} from 'lucide-react'
import { StatusBadge } from '../shared'

interface BudgetRequestFormPreviewProps {
    onUse?: () => void
}

export default function BudgetRequestFormPreview({ onUse }: BudgetRequestFormPreviewProps) {
    return (
        <div className="bg-ai/5 dark:bg-ai/10 border-2 border-dashed border-ai/40 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-ai/15 text-ai flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge label="Future state" tone="ai" size="xs" icon={<Sparkles className="h-2.5 w-2.5" />} />
                        <StatusBadge label="To validate with MBI" tone="warning" size="xs" />
                    </div>
                    <h3 className="text-base font-bold text-foreground mt-1.5 leading-tight">
                        Budget Request Form · single trigger for the whole flow
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        In the future state every budget starts here: one form gathers the SIF, the CAP, the
                        template and the substitution rules, and Strata routes to the correct engine without
                        forcing the salesperson to know which path they're on. Validate the field set with
                        MBI in the Phase 1 design session before we build this for real.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FutureFieldFile
                    label="CET export (SIF)"
                    icon={<FileCode2 className="h-4 w-4" />}
                    placeholder="EnterpriseHoldings_HQF12_SIF_v5.xml"
                />
                <FutureFieldFile
                    label="CAP worksheet"
                    icon={<FileSpreadsheet className="h-4 w-4" />}
                    placeholder="EnterpriseHoldings_CAP.xlsx"
                />
                <FutureFieldSelect
                    label="Budget template"
                    icon={<FileText className="h-4 w-4" />}
                    value="Corporate · New Build"
                    options={['Corporate · New Build', 'Healthcare · Clinic Refresh', 'Education · Library Refit', 'Government · Office Renovation']}
                />
                <FutureFieldSelect
                    label="Substitution rules"
                    icon={<Replace className="h-4 w-4" />}
                    value="MBI default · Good/Better/Best"
                    options={['MBI default · Good/Better/Best', 'High/Low only', 'Single tier · client-specified', 'Custom rule set…']}
                />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-ai/20">
                <div className="text-[11px] text-muted-foreground italic flex items-start gap-1.5">
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>Field set illustrative only · final fields TBD in the Phase 1 design session with MBI.</span>
                </div>
                {onUse ? (
                    <button
                        onClick={onUse}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                    >
                        Use this trigger
                        <ArrowRight className="h-4 w-4" />
                    </button>
                ) : (
                    <span className="shrink-0 text-[11px] font-bold text-ai uppercase tracking-wider">
                        Preview only · no action wired yet
                    </span>
                )}
            </div>
        </div>
    )
}

function FutureFieldFile({ label, icon, placeholder }: { label: string; icon: React.ReactNode; placeholder: string }) {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {icon}
                <span>{label}</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-2 bg-background/60 dark:bg-zinc-900/40 border border-dashed border-border rounded-lg cursor-not-allowed opacity-90">
                <Upload className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-[11px] text-muted-foreground truncate">{placeholder}</span>
            </div>
        </div>
    )
}

function FutureFieldSelect({ label, icon, value, options }: { label: string; icon: React.ReactNode; value: string; options: string[] }) {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {icon}
                <span>{label}</span>
            </div>
            <div
                className="flex items-center justify-between gap-2 px-2.5 py-2 bg-background/60 dark:bg-zinc-900/40 border border-border rounded-lg cursor-not-allowed opacity-90"
                title={`Options: ${options.join(' · ')}`}
            >
                <span className="text-[11px] text-foreground truncate">{value}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>
        </div>
    )
}
