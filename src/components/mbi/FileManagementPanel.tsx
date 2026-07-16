/**
 * COMPONENT: FileManagementPanel
 * PURPOSE: Phase 1 prerequisites visualized — addresses MBI's file infrastructure
 *          gaps that block all Design AI value:
 *
 *          1. ProjectNumberGenerator — replaces designer-opens-Excel-and-scrolls
 *             with auto-increment by location (STL: 2000-3000, KC: 5000, Riverside: <1000)
 *          2. FolderTemplateTree — SharePoint folder template (replaces ad-hoc
 *             iDrive folders inconsistently named)
 *          3. VersionHistoryTimeline — every CET/CAP/Budget change versioned
 *             (today: previous SIF gets overwritten)
 *          4. TeamsBotMessagePreview — bot routes spec check requests in Teams
 *             with structured payload
 *
 * PROPS: none
 *
 * DS TOKENS: bg-card · border-border · primary/info/success/ai accents
 *
 * USED BY: MBIDesignPage (Phase 5.C)
 */

import { Hash, FolderTree, History, Bot, FileCode2, FileSpreadsheet, FileText, Folder, Sparkles, ArrowRight } from 'lucide-react'
import { StatusBadge } from '../shared'

export default function FileManagementPanel() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProjectNumberGenerator />
            <FolderTemplateTree />
            <VersionHistoryTimeline />
            <TeamsBotMessagePreview />
        </div>
    )
}

// ─── 1. ProjectNumberGenerator ───────────────────────────────────────────────
function ProjectNumberGenerator() {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                    <Hash className="h-3.5 w-3.5" />
                </div>
                <div>
                    <div className="text-xs font-bold text-foreground">Auto project numbering</div>
                    <div className="text-[10px] text-muted-foreground">
                        Replaces 'designer opens Excel · scrolls to bottom · picks number'
                    </div>
                </div>
            </div>
            <div className="p-4 space-y-3">
                <div className="space-y-2">
                    {[
                        { label: 'St. Louis (STL)', range: '2000–3000', next: 'STL-2847' },
                        { label: 'Kansas City', range: '5000+', next: 'KC-5193' },
                        { label: 'Riverside Medical', range: '< 1000', next: 'MRC-0428' },
                    ].map(s => (
                        <div key={s.label} className="flex items-center justify-between bg-muted/20 border border-border rounded-lg px-3 py-2">
                            <div>
                                <div className="text-xs font-bold text-foreground">{s.label}</div>
                                <div className="text-[10px] text-muted-foreground">Range {s.range}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Next</div>
                                <div className="text-sm font-bold text-zinc-900 dark:text-primary tabular-nums font-mono">{s.next}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-ai/5 border border-ai/10 rounded-xl p-2.5">
                    <Sparkles className="h-3 w-3 text-ai shrink-0" />
                    <span>Auto-assigned from SharePoint · syncs to CORE/CAP/CET on creation</span>
                </div>
            </div>
        </div>
    )
}

// ─── 2. FolderTemplateTree ───────────────────────────────────────────────────
function FolderTemplateTree() {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-info/10 text-info flex items-center justify-center">
                    <FolderTree className="h-3.5 w-3.5" />
                </div>
                <div>
                    <div className="text-xs font-bold text-foreground">SharePoint folder template</div>
                    <div className="text-[10px] text-muted-foreground">
                        iDrive (St. Louis local server) → SharePoint · standardized for KC/IA/TX remote designers
                    </div>
                </div>
            </div>
            <div className="p-4 font-mono text-[11px]">
                <div className="space-y-0.5 text-foreground">
                    <TreeRow icon={<Folder className="h-3 w-3" />} text="STL-2847 · Enterprise Holdings · HQ F12" bold />
                    <TreeRow indent={1} icon={<Folder className="h-3 w-3" />} text="01-Drawings/" />
                    <TreeRow indent={1} icon={<Folder className="h-3 w-3" />} text="02-Renders/" />
                    <TreeRow indent={1} icon={<Folder className="h-3 w-3" />} text="03-SIF-CET/" />
                    <TreeRow indent={2} icon={<FileCode2 className="h-3 w-3" />} text="EnterpriseHQF12_v5.sif" muted />
                    <TreeRow indent={2} icon={<FileCode2 className="h-3 w-3" />} text="EnterpriseHQF12_v4.sif" muted />
                    <TreeRow indent={1} icon={<Folder className="h-3 w-3" />} text="04-CAP/" />
                    <TreeRow indent={2} icon={<FileSpreadsheet className="h-3 w-3" />} text="EnterpriseHoldings_CAP.xlsx" muted />
                    <TreeRow indent={1} icon={<Folder className="h-3 w-3" />} text="05-Specs-PDFs/" />
                    <TreeRow indent={1} icon={<Folder className="h-3 w-3" />} text="06-Quotes/" />
                    <TreeRow indent={2} icon={<FileText className="h-3 w-3" />} text="PROP-2026-003.pdf" muted />
                </div>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/20 rounded-lg px-2 py-1.5">
                    <Folder className="h-3 w-3 text-muted-foreground" />
                    <span>Template auto-applied on project creation · folder names enforced</span>
                </div>
            </div>
        </div>
    )
}

function TreeRow({ indent = 0, icon, text, bold, muted }: { indent?: number; icon: React.ReactNode; text: string; bold?: boolean; muted?: boolean }) {
    return (
        <div className="flex items-center gap-1.5" style={{ paddingLeft: `${indent * 16}px` }}>
            <span className="text-muted-foreground">{icon}</span>
            <span className={`${bold ? 'font-bold text-foreground' : ''} ${muted ? 'text-muted-foreground' : ''}`}>{text}</span>
        </div>
    )
}

// ─── 3. VersionHistoryTimeline ───────────────────────────────────────────────
function VersionHistoryTimeline() {
    const versions = [
        { v: 'v5', author: 'Design Manager Fane', timestamp: 'Apr 18 · 10:20 AM', note: 'Vertex Profile 72×36 swap (per CET assistant)', current: true },
        { v: 'v4', author: 'Design Manager Fane', timestamp: 'Apr 16 · 4:12 PM', note: 'Added 6 lounge seats · client request' },
        { v: 'v3', author: 'AP Lead', timestamp: 'Apr 14 · 11:30 AM', note: 'Initial floor plan import' },
    ]
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-success/10 text-success flex items-center justify-center">
                    <History className="h-3.5 w-3.5" />
                </div>
                <div>
                    <div className="text-xs font-bold text-foreground">Version history</div>
                    <div className="text-[10px] text-muted-foreground">
                        CET/CAP/Budget · today previous SIFs are overwritten · Strata logs every change
                    </div>
                </div>
            </div>
            <div className="p-4">
                <ol className="space-y-2">
                    {versions.map((v, i) => (
                        <li key={v.v} className="flex gap-2.5">
                            <div className="flex flex-col items-center shrink-0">
                                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${v.current ? 'bg-success text-white ring-4 ring-success/20' : 'bg-muted text-muted-foreground'}`}>
                                    {v.v}
                                </div>
                                {i < versions.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" style={{ minHeight: 20 }} />}
                            </div>
                            <div className={`flex-1 border border-l-4 rounded-lg px-3 py-2 ${v.current ? 'bg-success/5 border-success/20 border-l-success' : 'bg-muted/50 dark:bg-zinc-800 border-border border-l-muted-foreground/30'}`}>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-foreground">{v.author}</span>
                                    {v.current && (
                                        <StatusBadge label="Current" tone="success" size="xs" />
                                    )}
                                </div>
                                <div className="text-[11px] text-foreground">{v.note}</div>
                                <div className="text-[10px] text-muted-foreground italic mt-0.5">{v.timestamp}</div>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    )
}

// ─── 4. TeamsBotMessagePreview ───────────────────────────────────────────────
function TeamsBotMessagePreview() {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-ai/10 text-ai flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5" />
                </div>
                <div>
                    <div className="text-xs font-bold text-foreground">Strata Teams bot</div>
                    <div className="text-[10px] text-muted-foreground">
                        Spec check requests · handoff checklists · structured payloads (not free-text)
                    </div>
                </div>
            </div>
            <div className="p-4">
                {/* Mock Teams card */}
                <div className="bg-muted/20 border border-border rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded bg-[#5059C9] text-white flex items-center justify-center text-[10px] font-bold">
                            S
                        </div>
                        <div>
                            <div className="text-xs font-bold text-foreground">Strata Bot</div>
                            <div className="text-[9px] text-muted-foreground">posted to #design-handoffs · 10:24 AM</div>
                        </div>
                    </div>

                    <div className="bg-background border border-border rounded-lg p-3 space-y-2">
                        <div className="text-xs font-bold text-foreground">
                            🔍 Spec Check ready · STL-2847 · Enterprise Holdings
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                            Design Manager Fane requested AI spec check on her Enterprise HQ F12 design.
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                            <Cell label="Items scanned" value="143" />
                            <Cell label="Critical" value="1" warn />
                            <Cell label="Warnings" value="1" warn />
                            <Cell label="Time taken" value="4m 32s" />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <button className="text-[10px] font-bold text-primary-foreground bg-primary px-3 py-1.5 rounded-lg hover:opacity-90">
                                Open report
                            </button>
                            <button className="text-[10px] font-bold text-foreground bg-background border border-border px-3 py-1.5 rounded-lg hover:bg-muted">
                                Acknowledge
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
                        <ArrowRight className="h-3 w-3" />
                        <span>Beth · PC team · Lisa · auto-tagged based on handoff workflow</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Cell({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
    return (
        <div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
            <div className={`text-sm font-bold tabular-nums ${warn ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>{value}</div>
        </div>
    )
}
