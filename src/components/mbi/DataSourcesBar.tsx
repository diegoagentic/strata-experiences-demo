/**
 * COMPONENT: DataSourcesBar
 * PURPOSE: Thin footer strip that surfaces which systems contribute data to
 *          the current scene. Helps stakeholders trust that Strata is
 *          actually connected — data doesn't come from nowhere.
 *
 *          Pattern: horizontal chip chain, each chip is a system node.
 *          Optional arrows between groups show the data flow direction.
 *          Hover tooltip explains what the system contributes.
 *
 *          Used at the bottom of every MBI scene (Accounting + Quotes).
 *          Intentionally subtle — it supports the main content, not competes.
 *
 * DS TOKENS: bg-muted · text-muted-foreground · colored icon badges per type
 */

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { ArrowRight, Database, Bot, Mail, MessageSquare, FileCode2, BookOpen } from 'lucide-react'

export type SourceType = 'erp' | 'ai' | 'external' | 'communication' | 'file'

export interface DataSource {
    name: string
    type: SourceType
    /** What this system contributes to the scene — shown in tooltip */
    note: string
    /** Optional custom icon — otherwise uses the type default */
    icon?: React.ReactNode
}

/** Groups separated by → arrows in the bar */
export interface DataSourceGroup {
    sources: DataSource[]
}

interface DataSourcesBarProps {
    /** Source groups — each group separated by → arrow from the next */
    groups: DataSourceGroup[]
    /** Override the default "Connected systems" label */
    label?: string
}

const TYPE_STYLE: Record<SourceType, { bg: string; text: string; dot: string }> = {
    erp:           { bg: 'bg-blue-500/10',   text: 'text-blue-700 dark:text-blue-400',   dot: 'bg-blue-500' },
    ai:            { bg: 'bg-ai/10',          text: 'text-ai',                             dot: 'bg-ai' },
    external:      { bg: 'bg-amber-500/10',   text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    communication: { bg: 'bg-ai/10',  text: 'text-violet-700 dark:text-ai', dot: 'bg-ai' },
    file:          { bg: 'bg-muted',          text: 'text-muted-foreground',               dot: 'bg-zinc-400' },
}

const TYPE_ICON: Record<SourceType, React.ReactNode> = {
    erp:           <Database className="h-2.5 w-2.5" />,
    ai:            <Bot className="h-2.5 w-2.5" />,
    external:      <BookOpen className="h-2.5 w-2.5" />,
    communication: <MessageSquare className="h-2.5 w-2.5" />,
    file:          <FileCode2 className="h-2.5 w-2.5" />,
}

function SourceChip({ source }: { source: DataSource }) {
    const style = TYPE_STYLE[source.type]
    const icon = source.icon ?? TYPE_ICON[source.type]
    return (
        <TooltipPrimitive.Provider delayDuration={150}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider cursor-default select-none ${style.bg} ${style.text}`}>
                        {icon}
                        {source.name}
                    </span>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        side="top"
                        sideOffset={6}
                        className="z-50 max-w-[240px] rounded-lg bg-zinc-900 px-3 py-2 text-[11px] leading-snug text-zinc-100 shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                    >
                        <div className="font-bold text-zinc-300 mb-0.5">{source.name}</div>
                        <div>{source.note}</div>
                        <TooltipPrimitive.Arrow className="fill-zinc-900" />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    )
}

export default function DataSourcesBar({ groups, label = 'Connected systems' }: DataSourcesBarProps) {
    return (
        <div className="flex items-center gap-2 flex-wrap px-3 py-2 bg-muted/30 dark:bg-zinc-900/40 border border-border/60 rounded-xl">
            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider shrink-0">{label}</span>
            <div className="flex items-center gap-1.5 flex-wrap">
                {groups.map((group, gi) => (
                    <span key={gi} className="flex items-center gap-1.5">
                        {group.sources.map((src, si) => (
                            <span key={si} className="flex items-center gap-1">
                                <SourceChip source={src} />
                            </span>
                        ))}
                        {gi < groups.length - 1 && (
                            <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40 shrink-0" />
                        )}
                    </span>
                ))}
            </div>
        </div>
    )
}

// ─── Pre-built source definitions (reused across scenes) ──────────────────────

export const SOURCES = {
    CORE_RPA:       { name: 'CORE · RPA',        type: 'erp'           as SourceType, note: 'MBI\'s ERP. Strata posts entries via RPA bot — no direct API yet.' },
    CORE_AR:        { name: 'CORE · AR',          type: 'erp'           as SourceType, note: 'CORE\'s Accounts Receivable module. Feeds live aging data to Strata.' },
    CORE_GL:        { name: 'CORE · GL',          type: 'erp'           as SourceType, note: 'General Ledger in CORE. Approved lines post here via RPA after reconciliation.' },
    CORE_PO:        { name: 'CORE · POs',         type: 'erp'           as SourceType, note: 'CORE purchase orders. Strata matches every bill line against the open PO.' },
    DOC_AI:         { name: 'Document AI',        type: 'ai'            as SourceType, note: 'Strata\'s OCR engine. Reads vendor PDFs continuously as they arrive — extracts fields at 88–99% confidence.' },
    STRATA_AI:      { name: 'Strata AI',          type: 'ai'            as SourceType, note: 'Strata\'s AI layer — orchestrates agents, applies contract logic, drafts emails.' },
    STRATA_NLP:     { name: 'Strata NLP',         type: 'ai'            as SourceType, note: 'Natural-language model. Drafts AR follow-up emails in the client\'s tone history.' },
    STRATA_SPEC:    { name: 'Strata Spec Engine', type: 'ai'            as SourceType, note: 'Cross-checks every spec line against manufacturer price books and CET footprint.' },
    HT_DB:          { name: 'HealthTrust DB',     type: 'external'      as SourceType, note: 'HealthTrust GPO member registry. Strata checks every client project against this list.' },
    MFR_BOOKS:      { name: 'Mfr price books',    type: 'external'      as SourceType, note: 'HNI brand pricing catalogs (Allsteel, HON, Gunlocke, Kimball). Updated per contract.' },
    SPEC_DB:        { name: 'Spec DB',            type: 'external'      as SourceType, note: 'Specification database. Strata checks dimensions, finishes, and compatibility rules.' },
    TEAMS:          { name: 'Teams',              type: 'communication' as SourceType, note: 'Microsoft Teams. Escalation notifications and #healthcare-gpo channel pings.' },
    VENDOR_EMAIL:   { name: 'Vendor email',       type: 'communication' as SourceType, note: 'ap@mbi.example inbox. Vendor bills arrive here and land in the queue automatically.' },
    OUTLOOK:        { name: 'Outlook',            type: 'communication' as SourceType, note: 'Strata sends drafted AR follow-up emails directly from here after Controller review.' },
    SIF_FILE:       { name: 'SIF (CET export)',   type: 'file'          as SourceType, note: 'Standard Interchange Format — XML export from the designer\'s CET tool. 24 fields.' },
    CRM:            { name: 'CRM',                type: 'external'      as SourceType, note: 'MBI\'s CRM. Budget requests originate from approved opportunities here.' },
    INVOICE_HISTORY:{ name: 'Invoice History',    type: 'erp'           as SourceType, note: 'Historical vendor invoices in CORE. Strata cross-references prior bills to detect partial shipment and backorder patterns per vendor and SKU.' },
    OVNIQ:          { name: 'Quote Tool',          type: 'external'      as SourceType, note: 'Herman Miller\'s validation platform. Checks SIF against the CoNY contract and auto-applies T-code rates.' },
} satisfies Record<string, DataSource>
