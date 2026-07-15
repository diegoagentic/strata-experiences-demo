/**
 * COMPONENT: PeerReviewScene
 * STEP: sc1.7 — Peer review by second designer (HERO #2)
 * PAIN: SC7 (CEO #3 · Key person and knowledge concentration risk)
 *
 * Same Audit Checklist 5-step (per PDF: "used during self audit & peer audit")
 * Difference: Rebecca Warren reviews + Felicia's tacit knowledge surfaces as
 * proposed rules ("Save to Officeworks knowledge base") — tacit → explicit
 *
 * DS TOKENS: bg-card · bg-muted · bg-warning/X · bg-destructive/X · bg-primary/X ·
 *            text-foreground · text-muted-foreground · text-primary · text-warning
 */

import { useState } from 'react'
import {
    UserCheck, Sparkles, MessageCircle, Lightbulb, ArrowRight, CheckCircle2,
    AlertTriangle, BookmarkPlus,
} from 'lucide-react'
import BOMTable from './shared/BOMTable'
import { FELICIA_TACIT_KNOWLEDGE, AUDITOR_GOLDEN_RULE } from './shared/auditChecklistSteps'

interface Props { onContinue: () => void }

interface PeerComment {
    id: string
    author: 'Rebecca' | 'Felicia'
    avatar: string
    text: string
    timestamp: string
    resolved: boolean
    isTacit?: boolean
    rule?: string
}

const INITIAL_COMMENTS: PeerComment[] = [
    {
        id: 'c1',
        author: 'Rebecca',
        avatar: 'RW',
        text: 'Line 24 — CR 2075919 BIFMA stability advisory. Confirmed mockup recommended before order.',
        timestamp: '2 min ago',
        resolved: false,
    },
    {
        id: 'c2',
        author: 'Rebecca',
        avatar: 'RW',
        text: 'Line 6 part code differs from acknowledged version. Verify intentional or merge to single code.',
        timestamp: '1 min ago',
        resolved: false,
    },
    {
        id: 'c3',
        author: 'Felicia',
        avatar: 'FM',
        text: FELICIA_TACIT_KNOWLEDGE[0].rule,
        timestamp: 'just now',
        resolved: false,
        isTacit: true,
        rule: FELICIA_TACIT_KNOWLEDGE[0].rule,
    },
    {
        id: 'c4',
        author: 'Felicia',
        avatar: 'FM',
        text: FELICIA_TACIT_KNOWLEDGE[1].rule,
        timestamp: 'just now',
        resolved: false,
        isTacit: true,
        rule: FELICIA_TACIT_KNOWLEDGE[1].rule,
    },
]

export default function PeerReviewScene({ onContinue }: Props) {
    const [comments, setComments] = useState<PeerComment[]>(INITIAL_COMMENTS)
    const [savedRules, setSavedRules] = useState<string[]>([])

    const resolveComment = (id: string) => {
        setComments(prev => prev.map(c => c.id === id ? { ...c, resolved: true } : c))
    }

    const saveRule = (rule: string, commentId: string) => {
        setSavedRules(prev => [...prev, rule])
        resolveComment(commentId)
    }

    const unresolvedCount = comments.filter(c => !c.resolved).length

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <UserCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Peer review · Rebecca Warren</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Second designer audits Kimberly's work · Felicia (EVP · 25 yrs exp) drops tacit knowledge
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="bg-warning/10 text-warning border border-warning/20 rounded-md px-2.5 py-1 flex items-center gap-1.5">
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span className="font-medium tabular-nums">{unresolvedCount} unresolved</span>
                        </div>
                        <div className="bg-primary/10 text-primary border border-primary/20 rounded-md px-2.5 py-1 flex items-center gap-1.5">
                            <BookmarkPlus className="h-3.5 w-3.5" />
                            <span className="font-medium tabular-nums">{savedRules.length} rules saved</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: BOM (read-only with Kimberly's marks) */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="text-xs text-muted-foreground flex items-center gap-2 px-1">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span>AI delta summary: focus on CRs + electrical layout · Kimberly already verified 22/24 lines</span>
                    </div>
                    <BOMTable compact />
                    <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 text-xs">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                            <div>
                                <div className="font-medium text-foreground">Past incident warning</div>
                                <div className="text-muted-foreground italic mt-0.5">
                                    "Recent project: three people checked it · 2 lines accidentally deleted during revision · missing shelves discovered at installation day." — Felicia Miano-Poles
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: annotations + tacit knowledge */}
                <div className="space-y-3">
                    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-primary" />
                            Annotations
                        </h3>
                        <div className="space-y-3">
                            {comments.map(c => (
                                <div
                                    key={c.id}
                                    className={`rounded-lg border p-3 text-xs space-y-2 transition-all ${
                                        c.resolved
                                            ? 'bg-muted/30 border-border opacity-50'
                                            : c.isTacit
                                                ? 'bg-primary/5 border-primary/20'
                                                : 'bg-card border-border'
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                                            c.author === 'Felicia' ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'
                                        }`}>
                                            {c.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-medium text-foreground">{c.author === 'Rebecca' ? 'Rebecca W.' : 'Felicia M-P.'}</span>
                                                {c.isTacit && (
                                                    <span className="text-[9px] uppercase tracking-wider font-bold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded">
                                                        Tacit
                                                    </span>
                                                )}
                                                <span className="text-muted-foreground text-[10px] ml-auto">{c.timestamp}</span>
                                            </div>
                                            <div className="text-foreground mt-1">{c.text}</div>
                                        </div>
                                    </div>
                                    {!c.resolved && (
                                        <div className="flex gap-1.5 ml-9">
                                            {c.isTacit && c.rule ? (
                                                <button
                                                    type="button"
                                                    onClick={() => saveRule(c.rule!, c.id)}
                                                    className="inline-flex items-center gap-1 h-7 px-2 rounded bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-medium border border-primary/20"
                                                >
                                                    <BookmarkPlus className="h-3 w-3" />
                                                    Save to knowledge base
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => resolveComment(c.id)}
                                                    className="inline-flex items-center gap-1 h-7 px-2 rounded bg-success/10 hover:bg-success/20 text-success text-[11px] font-medium border border-success/20"
                                                >
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Resolve
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Saved rules card */}
                    <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-warning" />
                            Officeworks knowledge base
                        </h3>
                        <div className="text-xs text-muted-foreground">
                            Tacit rules captured this project: <span className="font-semibold text-foreground tabular-nums">{savedRules.length}</span> · total: <span className="font-semibold text-foreground tabular-nums">{47 + savedRules.length}</span>
                        </div>
                        {savedRules.length > 0 && (
                            <ul className="space-y-1.5 text-xs pt-2 border-t border-border">
                                {savedRules.map((r, i) => (
                                    <li key={i} className="flex items-start gap-1.5 text-foreground">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                                        <span>{r}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="text-[10px] text-muted-foreground italic pt-2 border-t border-border">
                            CEO #3 priority SC7: knowledge concentration risk · onboarding new designers 60% faster
                        </div>
                    </div>
                </div>
            </div>

            {/* Auditor's golden rule footer */}
            <div className="bg-card border border-border rounded-xl p-4">
                <blockquote className="border-l-2 border-primary pl-3 italic text-sm text-muted-foreground">
                    "{AUDITOR_GOLDEN_RULE}"
                </blockquote>
            </div>

            {/* Footer CTAs */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
                <div className="text-xs text-muted-foreground">
                    Peer audit complete · {savedRules.length} tacit knowledge rules converted to explicit
                </div>
                <button
                    type="button"
                    onClick={onContinue}
                    disabled={unresolvedCount > 0}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Approve · send BOM submission
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    )
}
