/**
 * COMPONENT: DesignProjectPick
 * PURPOSE: Flow 4 · Scene 0 — Design Manager Fane (Phase 1 Pilot · early adopter
 *          8/10) selects a project and launches Spec Check. The pilot
 *          sequencing narrative is visible: only Beth uses this first, the
 *          rest of the design team adopts after her success.
 *
 *          Lakeside ICU Expansion picked as the hero project (47 line items,
 *          Marine Blue palette). Card shows palette preview, line count,
 *          CET version. 'Launch Spec Check' advances to scene 1.
 *
 * USED BY: MBIDesignPage (wizard scene 0)
 */

import { useState } from 'react'
import {
    Palette, ArrowRight, Building2, Layers, FileCode2, Award,
    CheckCircle2, Clock, AlertCircle, Users,
} from 'lucide-react'
import { StatusBadge } from '../shared'
import { MBI_STAKEHOLDERS, MBI_DESIGN_PROJECTS } from '../../config/profiles/mbi-data'

const MARINE_BLUE_PALETTE = [
    { name: 'Marine Blue', hex: '#1E3A5F' },
    { name: 'Slate Gray', hex: '#475569' },
    { name: 'Onyx Black', hex: '#1F2937' },
    { name: 'Warm Oak', hex: '#8B6F47' },
    { name: 'Bone White', hex: '#F5F0E8' },
]

export default function DesignProjectPick() {
    const beth = MBI_STAKEHOLDERS.find(s => s.id === 'beth-gianino')!
    const bethProjects = MBI_DESIGN_PROJECTS.filter(p => p.designerId === 'beth-gianino')
    const icu = bethProjects.find(p => p.id === 'DP-001')!
    const [selectedId, setSelectedId] = useState(icu.id)
    const selected = bethProjects.find(p => p.id === selectedId) ?? icu

    return (
        <div className="space-y-4">
            {/* Adoption sequencing strip — why Beth first */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Users className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">
                        Phase 1 Pilot · Beth first, design team after
                    </div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Design team's Q4 AI trust averages <strong className="text-foreground">3.3/10</strong> — lowest in company.
                        Rogers Diffusion says don't deploy to the 1-out-of-10 first. Beth (<strong className="text-foreground">8/10</strong> early adopter)
                        pilots Spec Check on a real project · visible win unlocks team rollout.
                    </div>
                </div>
            </div>

            {/* Beth's project picker */}
            <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                            <Palette className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-foreground">Beth's active projects</div>
                            <div className="text-[10px] text-muted-foreground">
                                Pick one to run Spec Check · Lakeside ICU is today's pilot target
                            </div>
                        </div>
                    </div>
                    <StatusBadge label="Phase 1 Pilot" tone="ai" size="xs" icon={<Award className="h-2.5 w-2.5" />} />
                </div>
                <div className="divide-y divide-border">
                    {bethProjects.map(p => {
                        const active = selectedId === p.id
                        const isHero = p.id === 'DP-001'
                        return (
                            <button
                                key={p.id}
                                onClick={() => setSelectedId(p.id)}
                                className={`
                                    w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-l-4
                                    ${active
                                        ? 'bg-primary/5 dark:bg-primary/10 border-l-primary'
                                        : 'border-l-transparent hover:bg-muted/30 dark:hover:bg-zinc-800/30'
                                    }
                                `}
                            >
                                <div className={`
                                    h-8 w-8 rounded-lg flex items-center justify-center shrink-0
                                    ${active ? 'bg-primary/15 text-zinc-900 dark:text-primary' : 'bg-muted text-muted-foreground'}
                                `}>
                                    <Building2 className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-bold text-foreground truncate">{p.name}</span>
                                        {isHero && (
                                            <StatusBadge label="Today's target" tone="ai" size="xs" />
                                        )}
                                        <StatusBadge
                                            label={p.status}
                                            tone={
                                                p.status === 'approved' ? 'success'
                                                : p.status === 'design' ? 'warning'
                                                : p.status === 'review' ? 'info'
                                                : 'neutral'
                                            }
                                            size="xs"
                                        />
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        {p.client} · {p.vertical} · {p.hoursLogged}h logged
                                    </div>
                                </div>
                                {active && <CheckCircle2 className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0" />}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Hero project card — Lakeside ICU detail */}
            <div className="bg-gradient-to-br from-primary/5 to-ai/5 dark:from-primary/10 dark:to-ai/10 border border-primary/30 rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-ai/15 text-ai flex items-center justify-center shrink-0">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-ai uppercase tracking-wider">
                            Project ready for Spec Check
                        </div>
                        <div className="text-base font-bold text-foreground mt-0.5">{selected.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            {selected.client} · {selected.vertical} · CET BOM exported · palette locked
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <ProjectStat icon={<Layers className="h-4 w-4" />} value="47" sub="line items in BOM" />
                    <ProjectStat icon={<FileCode2 className="h-4 w-4" />} value="v16.5.2" sub="CET schema version" />
                    <ProjectStat
                        icon={<Award className="h-4 w-4" />}
                        value={`${beth.q4Trust}/10`}
                        sub="Beth's AI trust"
                        accent="text-success"
                    />
                    <ProjectStat icon={<Clock className="h-4 w-4" />} value="< 5 min" sub="expected scan time" />
                </div>
            </div>

            {/* Palette preview — makes the "this chair is green" story visible */}
            <div className="bg-card dark:bg-zinc-800 border border-border rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Project palette · {selected.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Every spec item must match</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {MARINE_BLUE_PALETTE.map(c => (
                        <div key={c.hex} className="flex items-center gap-1.5 bg-background dark:bg-zinc-900 border border-border rounded-lg px-2 py-1">
                            <div
                                className="h-4 w-4 rounded-md border border-border shrink-0"
                                style={{ backgroundColor: c.hex }}
                            />
                            <span className="text-[10px] font-mono text-foreground">{c.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Forward cue */}
            <div className="flex items-center gap-3 text-xs bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3">
                <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0" />
                <span className="flex-1 text-foreground">
                    Click <strong>Run Spec Check</strong> below to let Strata scan all 47 items — dimensions, finish, palette match, availability. Under 5 minutes vs. today's manual review.
                </span>
            </div>
        </div>
    )
}

function ProjectStat({
    icon,
    value,
    sub,
    accent = 'text-foreground',
}: {
    icon: React.ReactNode
    value: string
    sub: string
    accent?: string
}) {
    return (
        <div className="bg-muted/60 dark:bg-zinc-900/40 border border-border rounded-xl p-3">
            <div className={`flex items-center gap-1.5 ${accent}`}>
                {icon}
                <span className="text-lg font-bold tabular-nums leading-none">{value}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1.5">{sub}</div>
        </div>
    )
}
