/**
 * COMPONENT: PeerReviewScene
 * STEP: sc1.7 — Peer review by second designer (HERO #2)
 * PAIN: SC7 (CEO #3 · Key person and knowledge concentration risk)
 *
 * Designer-led peer review:
 *   · The peer reviewer (picked at sc1.6) actively reviews Kimberly's audit.
 *   · The peer can add their own review notes, resolve concerns, or accept Strata
 *     suggestions.
 *   · Felicia's tacit knowledge is reframed as "Strata suggests · tacit rules from
 *     Felicia's history" — a knowledge-base card SEPARATE from the active peer's
 *     comments. The peer can save these rules to the OW KB before approving.
 *
 * The peer reviewer flows in from OfficeworksPage state (peerReviewerName).
 *
 * DS TOKENS: bg-card · bg-muted · bg-warning/X · bg-primary/X · bg-ai/X ·
 *            text-foreground · text-muted-foreground · text-primary · text-ai
 */

import { useMemo, useState } from 'react'
import {
    UserCheck, Sparkles, MessageCircle, Lightbulb, ArrowRight, CheckCircle2,
    AlertTriangle, BookmarkPlus, Bell, FileText, Plus, ChevronRight,
} from 'lucide-react'
import BOMTable from './shared/BOMTable'
import { FELICIA_TACIT_KNOWLEDGE, AUDITOR_GOLDEN_RULE } from './shared/auditChecklistSteps'
import { findDesigner, regionLabel } from './shared/designerProfiles'

interface Props {
    onContinue: () => void
    /** Peer reviewer name picked at sc1.6 · falls back to Rebecca Warren for back-compat */
    peerName: string | null
}

interface PeerComment {
    id: string
    authorName: string
    authorInitials: string
    text: string
    timestamp: string
    resolved: boolean
    lineRef?: number
}

/** Pre-populated review notes from the active peer reviewer · 2 examples to seed the demo. */
const INITIAL_PEER_NOTES = (peerName: string, peerInitials: string): PeerComment[] => [
    {
        id: 'c1',
        authorName: peerName,
        authorInitials: peerInitials,
        text: 'Line 24 — CR 2075919 BIFMA stability advisory. Confirmed mockup recommended before order.',
        timestamp: '2 min ago',
        resolved: false,
        lineRef: 24,
    },
    {
        id: 'c2',
        authorName: peerName,
        authorInitials: peerInitials,
        text: 'Line 6 part code differs from acknowledged version. Verify intentional or merge to single code.',
        timestamp: '1 min ago',
        resolved: false,
        lineRef: 6,
    },
]

/** Available BOM line references for the lineRef select · simple range, no shared dep */
const LINE_OPTIONS = Array.from({ length: 30 }, (_, i) => i + 1)

function initialsOf(name: string): string {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function PeerReviewScene({ onContinue, peerName }: Props) {
    // Resolve the peer profile · fall back to Rebecca Warren for back-compat.
    const peer = useMemo(() => {
        return findDesigner(peerName ?? 'Rebecca Warren') ?? findDesigner('Rebecca Warren')!
    }, [peerName])

    const peerInitials = initialsOf(peer.name)
    const [comments, setComments] = useState<PeerComment[]>(() => INITIAL_PEER_NOTES(peer.name, peerInitials))
    const [savedRules, setSavedRules] = useState<string[]>([])
    const [newNoteText, setNewNoteText] = useState('')
    const [newNoteLineRef, setNewNoteLineRef] = useState<number | ''>('')
    const [expandedRules, setExpandedRules] = useState<Set<number>>(new Set())

    const toggleRule = (i: number) => {
        setExpandedRules(prev => {
            const next = new Set(prev)
            if (next.has(i)) next.delete(i)
            else next.add(i)
            return next
        })
    }

    const resolveComment = (id: string) => {
        setComments(prev => prev.map(c => c.id === id ? { ...c, resolved: true } : c))
    }

    const saveRule = (rule: string, ruleIndex: number) => {
        setSavedRules(prev => prev.includes(rule) ? prev : [...prev, rule])
        // Collapse the rule once saved · the badge "Saved" replaces the View/Hide tag.
        setExpandedRules(prev => {
            if (!prev.has(ruleIndex)) return prev
            const next = new Set(prev)
            next.delete(ruleIndex)
            return next
        })
    }

    const addNote = () => {
        const text = newNoteText.trim()
        if (!text) return
        const note: PeerComment = {
            id: `c-${Date.now()}`,
            authorName: peer.name,
            authorInitials: peerInitials,
            text,
            timestamp: 'just now',
            resolved: false,
            lineRef: newNoteLineRef === '' ? undefined : newNoteLineRef,
        }
        setComments(prev => [note, ...prev])
        setNewNoteText('')
        setNewNoteLineRef('')
    }

    const unresolvedCount = comments.filter(c => !c.resolved).length
    const unresolvedRulesCount = FELICIA_TACIT_KNOWLEDGE.filter(r => !savedRules.includes(r.rule)).length

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Notification banner · review request received */}
            <section
                aria-label="Review request notification"
                className="rounded-xl border border-ai/30 bg-ai/5 px-4 py-3 flex items-start gap-2.5"
            >
                <Bell className="h-4 w-4 text-ai shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="font-semibold text-foreground">
                        Review request from Design Manager Ellis
                    </div>
                    <div className="text-muted-foreground mt-0.5">
                        Kimberly sent her Metro Legal 4th Floor self-audit for peer review · 2 min ago · 5 items pre-flagged by Strata · Metro Legal-4F_audit-notes-v1.pdf
                    </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-ai text-ai-foreground border border-ai rounded px-1.5 py-0.5 shrink-0">
                    <FileText className="h-3 w-3" aria-hidden="true" />
                    Audit attached
                </span>
            </section>

            {/* Header · peer reviewer profile + counters */}
            <section
                aria-label="Peer review header"
                className="bg-card border border-border rounded-xl p-5"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0" aria-hidden="true">
                            <UserCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Peer review · {peer.name}</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {peer.seniority} · {regionLabel(peer.region)} · {peer.yearsAtOW} yrs at OW · {peer.kpis.peerReviewsCompletedYTD} peer reviews YTD
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="bg-warning/10 text-warning border border-warning/20 rounded-md px-2.5 py-1 flex items-center gap-1.5">
                            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            <span className="font-medium tabular-nums">{unresolvedCount} unresolved</span>
                        </div>
                        <div className="bg-primary text-primary-foreground border border-primary rounded-md px-2.5 py-1 flex items-center gap-1.5">
                            <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
                            <span className="font-medium tabular-nums">{savedRules.length} rules saved</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left · BOM (read-only with Kimberly's marks) */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="text-xs text-muted-foreground flex items-center gap-2 px-1">
                        <Sparkles className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
                        <span>AI delta summary: focus on CRs + electrical layout · Kimberly already verified 22/24 lines</span>
                    </div>
                    <BOMTable compact />
                    <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 text-xs">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                            <div>
                                <div className="font-medium text-foreground">Past incident warning</div>
                                <div className="text-muted-foreground italic mt-0.5">
                                    &quot;Recent project: three people checked it · 2 lines accidentally deleted during revision · missing shelves discovered at installation day.&quot; — EVP Design
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right · add note · peer comments · KB suggestions · KB saved */}
                <div className="space-y-3">
                    {/* Add review note · peer authors a new comment */}
                    <section
                        aria-label="Add review note"
                        className="bg-card border border-border rounded-xl p-4 space-y-2"
                    >
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Plus className="h-4 w-4 text-foreground" aria-hidden="true" />
                            Add review note
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                            Flag a concern, propose a fix, or ask Kimberly to clarify a BOM line.
                        </p>
                        <textarea
                            value={newNoteText}
                            onChange={e => setNewNoteText(e.target.value)}
                            placeholder="Type your review note here…"
                            rows={3}
                            aria-label="Review note text"
                            className="w-full px-3 py-2 rounded-md border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
                        />
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                Reference line
                                <select
                                    value={newNoteLineRef}
                                    onChange={e => setNewNoteLineRef(e.target.value === '' ? '' : Number(e.target.value))}
                                    aria-label="Reference BOM line (optional)"
                                    className="h-7 px-2 rounded-md border border-border bg-card text-[11px] text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
                                >
                                    <option value="">none</option>
                                    {LINE_OPTIONS.map(n => (
                                        <option key={n} value={n}>Line {n}</option>
                                    ))}
                                </select>
                            </label>
                            <button
                                type="button"
                                onClick={addNote}
                                disabled={newNoteText.trim().length === 0}
                                aria-label="Add review note"
                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-[11px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
                            >
                                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                Add note
                            </button>
                        </div>
                    </section>

                    {/* Peer comments · active reviewer only */}
                    <section
                        aria-label="Peer reviewer comments"
                        role="region"
                        className="bg-card border border-border rounded-xl p-4 space-y-3"
                    >
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-foreground" aria-hidden="true" />
                            Review notes · {peer.name.split(' ')[0]}
                        </h3>
                        <div className="space-y-3">
                            {comments.map(c => (
                                <article
                                    key={c.id}
                                    aria-label={`Review note by ${c.authorName}${c.lineRef ? ` referencing line ${c.lineRef}` : ''}`}
                                    className={`rounded-lg border p-3 text-xs space-y-2 transition-all ${
                                        c.resolved
                                            ? 'bg-muted/30 border-border opacity-60'
                                            : 'bg-card border-border'
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 bg-primary text-primary-foreground" aria-hidden="true">
                                            {c.authorInitials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="sr-only">By </span>
                                                <span className="font-medium text-foreground">{c.authorName}</span>
                                                {c.lineRef !== undefined && (
                                                    <span className="text-[9px] uppercase tracking-wider font-bold bg-muted text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                                                        Line {c.lineRef}
                                                    </span>
                                                )}
                                                <span className="text-muted-foreground text-[10px] ml-auto">{c.timestamp}</span>
                                            </div>
                                            <div className="text-foreground mt-1">{c.text}</div>
                                        </div>
                                    </div>
                                    {!c.resolved && (
                                        <div className="flex gap-1.5 ml-9">
                                            <button
                                                type="button"
                                                onClick={() => resolveComment(c.id)}
                                                aria-label={`Resolve review note: ${c.text.slice(0, 60)}`}
                                                className="inline-flex items-center gap-1 h-7 px-2 rounded bg-success/10 hover:bg-success/20 text-success text-[11px] font-medium border border-success/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
                                            >
                                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                Resolve
                                            </button>
                                        </div>
                                    )}
                                </article>
                            ))}
                            {comments.length === 0 && (
                                <p className="text-[11px] italic text-muted-foreground">No review notes yet · add one above.</p>
                            )}
                        </div>
                    </section>

                    {/* Strata suggests · tacit rules from Felicia's history · NOT inline with peer comments */}
                    <section
                        aria-label="Strata-suggested tacit rules from Felicia's history"
                        className="bg-ai/5 border border-ai/30 rounded-xl p-4 space-y-3"
                    >
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-foreground" aria-hidden="true" />
                            Strata suggests · tacit rules from Felicia&apos;s history
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                            These rules were captured from Felicia&apos;s prior projects · save them to the OW knowledge base before approving.
                            {(() => {
                                const savedFromTacitCount = FELICIA_TACIT_KNOWLEDGE.filter(r => savedRules.includes(r.rule)).length
                                if (savedFromTacitCount === 0) return null
                                return (
                                    <span className="ml-1 font-medium text-foreground tabular-nums">
                                        ({savedFromTacitCount}/{FELICIA_TACIT_KNOWLEDGE.length} saved)
                                    </span>
                                )
                            })()}
                        </p>
                        <ul className="-mx-1 divide-y divide-border">
                            {FELICIA_TACIT_KNOWLEDGE.map((rule, i) => {
                                const isSaved = savedRules.includes(rule.rule)
                                const isExpanded = expandedRules.has(i)
                                const panelId = `tacit-rule-${i}-panel`
                                return (
                                    <li key={i} className={isSaved ? 'opacity-60' : ''}>
                                        <button
                                            type="button"
                                            onClick={() => toggleRule(i)}
                                            aria-expanded={isExpanded}
                                            aria-controls={panelId}
                                            className="w-full flex items-start gap-2 px-2 py-2 text-left hover:bg-ai/10 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ai/40 focus-visible:ring-offset-1"
                                        >
                                            <ChevronRight
                                                className={`h-3.5 w-3.5 text-foreground shrink-0 mt-0.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                                aria-hidden="true"
                                            />
                                            <span className="text-xs text-foreground flex-1 min-w-0">{rule.rule}</span>
                                            {isSaved ? (
                                                <span
                                                    role="status"
                                                    className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 rounded px-1.5 py-0.5 shrink-0"
                                                >
                                                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                    Saved
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                                                    {isExpanded ? 'Hide' : 'View'}
                                                </span>
                                            )}
                                        </button>
                                        {isExpanded && (
                                            <div
                                                id={panelId}
                                                role="region"
                                                aria-label={`Details for rule: ${rule.rule}`}
                                                className="px-2 pb-2 pl-7 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
                                            >
                                                {rule.context && (
                                                    <div className="text-[10px] italic text-muted-foreground">{rule.context}</div>
                                                )}
                                                <div className="text-[10px] text-muted-foreground">
                                                    Source: EVP Design · 25 yrs OW · tacit knowledge captured by Strata
                                                </div>
                                                {!isSaved && (
                                                    <button
                                                        type="button"
                                                        onClick={() => saveRule(rule.rule, i)}
                                                        aria-label={`Save rule to knowledge base: ${rule.rule}`}
                                                        className="inline-flex items-center gap-1 h-7 px-2 rounded bg-ai hover:bg-ai/90 text-ai-foreground text-[11px] font-medium border border-ai focus:outline-none focus-visible:ring-2 focus-visible:ring-ai/40 focus-visible:ring-offset-1"
                                                    >
                                                        <BookmarkPlus className="h-3 w-3" aria-hidden="true" />
                                                        Save to knowledge base
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    </section>

                    {/* Officeworks knowledge base summary */}
                    <section
                        aria-label="Officeworks knowledge base summary"
                        className="bg-card border border-border rounded-xl p-4 space-y-2"
                    >
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-warning" aria-hidden="true" />
                            Officeworks knowledge base
                        </h3>
                        <div className="text-xs text-muted-foreground">
                            Tacit rules captured this project: <span className="font-semibold text-foreground tabular-nums">{savedRules.length}</span> · total: <span className="font-semibold text-foreground tabular-nums">{47 + savedRules.length}</span>
                        </div>
                        {savedRules.length > 0 && (
                            <ul className="space-y-1.5 text-xs pt-2 border-t border-border">
                                {savedRules.map((r, i) => (
                                    <li key={i} className="flex items-start gap-1.5 text-foreground">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                                        <span>{r}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="text-[10px] text-muted-foreground italic pt-2 border-t border-border">
                            CEO #3 priority SC7: knowledge concentration risk · onboarding new designers 60% faster
                        </div>
                    </section>
                </div>
            </div>

            {/* Auditor's golden rule footer */}
            <section
                aria-label="Auditor's golden rule"
                className="bg-card border border-border rounded-xl p-4"
            >
                <blockquote className="border-l-2 border-primary pl-3 italic text-sm text-muted-foreground">
                    &quot;{AUDITOR_GOLDEN_RULE}&quot;
                </blockquote>
            </section>

            {/* Footer CTAs */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
                <div id="approve-status" className="text-xs text-muted-foreground">
                    Peer audit complete · {savedRules.length} tacit knowledge rules converted to explicit
                    {unresolvedCount > 0 && ` · ${unresolvedCount} unresolved comment${unresolvedCount > 1 ? 's' : ''}`}
                    {unresolvedRulesCount > 0 && ` · ${unresolvedRulesCount} KB suggestion${unresolvedRulesCount > 1 ? 's' : ''} pending`}
                </div>
                <button
                    type="button"
                    onClick={onContinue}
                    disabled={unresolvedCount > 0}
                    aria-label="Approve audit and send BOM submission"
                    aria-describedby="approve-status"
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
                >
                    Approve · send BOM submission
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
            </div>
        </div>
    )
}
