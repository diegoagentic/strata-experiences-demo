/**
 * COMPONENT: AIEmailDraftsPanel
 * PURPOSE: Shows LLM-drafted collection email previews for the top AR records.
 *          The Controller reviews, optionally edits via a floating sheet,
 *          and one-click sends. Replaces today's manual follow-up writing.
 *
 *          Mock: 2 drafts generated based on MBI_AR_RECORDS
 *          (1 escalation, 1 firm 2nd follow-up).
 *
 * STATES per draft:
 *   - pending     — preview with Edit / Approve+send buttons
 *   - editing     — floating EmailEditSheet open with subject + body editable
 *                   plus a 3-tone "polish with AI" toolbar (friendlier /
 *                   firmer / shorter)
 *   - edited      — preview shows the edited content + "Edited" pill
 *   - sent        — collapsed success state with Undo
 *
 * DS TOKENS: bg-card · ai/5 bg · primary CTA · MBIDetailSheet shell
 *
 * USED BY: MBIAccountingPage (Flow 1 · Scene 5 / m2.5)
 */

import { useEffect, useState } from 'react'
import { Sparkles, Send, Pencil, CheckCircle2, AlertTriangle, Mail, Wand2, RotateCcw, Save, X } from 'lucide-react'
import MBIDetailSheet from './MBIDetailSheet'
import { StatusBadge, type StatusTone } from '../shared'
import { MBI_AR_RECORDS } from '../../config/profiles/mbi-data'

type DraftTone = 'friendly' | 'firm' | 'escalation'

interface EmailDraft {
    id: string
    recordId: string
    tone: DraftTone
    subject: string
    body: string
    to: string
    autoSent?: boolean
}

interface DraftEdit {
    subject: string
    body: string
    polishedAs?: 'friendlier' | 'firmer' | 'shorter'
}

function buildDrafts(): EmailDraft[] {
    const escalated = MBI_AR_RECORDS.find(r => r.status === 'escalated')
    const noResponse = MBI_AR_RECORDS.find(r => r.status === 'no-response')
    const drafts: EmailDraft[] = []

    if (escalated) {
        drafts.push({
            id: 'DRAFT-001',
            recordId: escalated.id,
            tone: 'escalation',
            to: `${escalated.client} AP team + ${escalated.salesperson ?? 'Account Manager'}`,
            subject: `${escalated.poNumber} — ${escalated.daysPastDue} days past due · escalating to salesperson`,
            body: `Hello,\n\nPO ${escalated.poNumber} ($${escalated.amount.toLocaleString()}) is ${escalated.daysPastDue} days past due. We've escalated internally — your Account Manager will follow up within 72 hours.\n\nIf payment has already been sent, please reply with the reference number.\n\nBest,\nMBI · Accounting`,
        })
    }
    if (noResponse) {
        drafts.push({
            id: 'DRAFT-002',
            recordId: noResponse.id,
            tone: 'firm',
            to: `${noResponse.client} AP team`,
            subject: `Second follow-up: ${noResponse.poNumber} · $${(noResponse.amount / 1000).toFixed(0)}K past due`,
            body: `Hi,\n\nWe haven't received a response to our first reminder on ${noResponse.poNumber} (sent ${noResponse.lastContact}). The balance of $${noResponse.amount.toLocaleString()} is now ${noResponse.daysPastDue} days past due.\n\nCan you confirm receipt of the invoice and expected payment date?\n\nThanks,\nMBI · Accounting`,
            autoSent: true,
        })
    }
    return drafts
}

const TONE_META = {
    friendly: { label: 'Friendly · 1st reminder', tone: 'info' as StatusTone, icon: <Mail className="h-3 w-3" /> },
    firm: { label: '2nd follow-up', tone: 'warning' as StatusTone, icon: <Mail className="h-3 w-3" /> },
    escalation: { label: 'Escalation', tone: 'danger' as StatusTone, icon: <AlertTriangle className="h-3 w-3" /> },
}

// Tiny mock "polish with AI" — applies a tone-shifting transform to the
// body so the demo can show that the user can ask the model to rewrite,
// not just edit by hand. NOT a real LLM call — picks a templated rewrite
// per chosen tone direction. Good enough to land the interaction.
function polishBody(originalBody: string, direction: 'friendlier' | 'firmer' | 'shorter'): string {
    const greetingFriendly = ['Hi there,', 'Hello!', 'Hi,'][Math.floor(Math.random() * 3)]
    const greetingFirm = 'To whom it may concern,'

    if (direction === 'friendlier') {
        return originalBody
            .replace(/^Hello,/i, greetingFriendly)
            .replace(/^Hi,/i, greetingFriendly)
            .replace(/escalated internally/i, 'flagged this internally so we can sort it out together')
            .replace(/please reply with the reference number/i, 'just send us the reference number when you can — we\'ll close it on our side')
            .replace(/Can you confirm/i, 'Could you confirm')
            .replace(/Thanks,/i, 'Thanks so much,')
            .replace(/Best,/i, 'Warm regards,')
    }
    if (direction === 'firmer') {
        return originalBody
            .replace(/^Hello,/i, greetingFirm)
            .replace(/^Hi,/i, greetingFirm)
            .replace(/will follow up within 72 hours/i, 'will be in contact within 48 hours to discuss next steps')
            .replace(/please reply with the reference number/i, 'please confirm payment status with the reference number by end of week')
            .replace(/Can you confirm/i, 'Please confirm')
            .replace(/Thanks,/i, 'Regards,')
    }
    // shorter
    return originalBody
        .split('\n')
        .filter(line => line.length < 200)
        .slice(0, 4)
        .join('\n')
        .replace(/We've escalated internally — your Account Manager will follow up within 72 hours\.\s*/i, 'Account Manager will follow up.')
        .replace(/We haven't received a response to our first reminder on .+\. /i, '')
}

type AIQuestionState = 'hidden' | 'visible' | 'resolved'

export default function AIEmailDraftsPanel() {
    const drafts = buildDrafts()
    const [sent, setSent] = useState<Record<string, boolean>>({})
    const [edits, setEdits] = useState<Record<string, DraftEdit>>({})
    const [editingId, setEditingId] = useState<string | null>(null)
    const [aiQuestion, setAiQuestion] = useState<AIQuestionState>('hidden')
    const [aiChoice, setAiChoice] = useState<string | null>(null)

    useEffect(() => {
        const t = setTimeout(() => setAiQuestion('visible'), 1400)
        return () => clearTimeout(t)
    }, [])

    const handleAiChoice = (choice: string) => {
        setAiChoice(choice)
        setAiQuestion('resolved')
        // Auto-send the escalation draft once the user resolves the AI question
        setSent(prev => ({ ...prev, 'DRAFT-001': true }))
    }

    const editingDraft = editingId ? drafts.find(d => d.id === editingId) ?? null : null

    const handleSaveEdit = (draftId: string, edit: DraftEdit) => {
        setEdits(prev => ({ ...prev, [draftId]: edit }))
        setEditingId(null)
    }

    const handleDiscardEdit = (draftId: string) => {
        setEdits(prev => {
            const next = { ...prev }
            delete next[draftId]
            return next
        })
    }

    return (
        <>
            <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-ai/10 text-ai flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs font-bold text-foreground">AI-drafted collection emails</div>
                        <div className="text-[10px] text-muted-foreground">
                            Escalation cases only · routine follow-ups already auto-sent · review, edit if needed, send
                        </div>
                    </div>
                    <StatusBadge label="1 auto-sent · 1 awaiting your review" tone="ai" size="sm" />
                </div>

                {/* AI question — surfaces before the escalation can be sent */}
                {aiQuestion === 'visible' && (
                    <div className="px-4 py-3 border-b border-border bg-ai/5 dark:bg-ai/10 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-start gap-2.5">
                            <div className="h-6 w-6 rounded-lg bg-ai/15 text-ai flex items-center justify-center shrink-0 mt-0.5">
                                <Sparkles className="h-3 w-3" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-foreground mb-0.5">
                                    Strata has a question before sending the escalation
                                </div>
                                <div className="text-[11px] text-muted-foreground mb-3">
                                    Lindenwood University is 32 days past due with no response. Should I copy the Account Manager (Coordinator Blake) on this email? She can apply direct pressure if the AP team ignores it.
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={() => handleAiChoice('cc-am')}
                                        className="flex-1 flex items-center gap-2 px-3 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                        Yes · CC Coordinator Blake
                                    </button>
                                    <button
                                        onClick={() => handleAiChoice('direct')}
                                        className="flex-1 flex items-center gap-2 px-3 py-2 text-xs font-bold text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:border-muted-foreground/50 transition-colors"
                                    >
                                        No · Send directly to AP team
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="divide-y divide-border">
                    {drafts.map(draft => {
                        const isSent = sent[draft.id]
                        const edit = edits[draft.id]
                        const tone = TONE_META[draft.tone]
                        const subject = edit?.subject ?? draft.subject
                        const body = edit?.body ?? draft.body
                        const wasEdited = !!edit
                        return (
                            <div key={draft.id} className={`px-4 py-3 ${draft.autoSent ? 'bg-success/5' : ''}`}>
                                {draft.autoSent ? (
                                    <div className="flex items-center gap-2 text-xs">
                                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="font-semibold text-success">Auto-sent by Strata · delivered</span>
                                            <span className="text-muted-foreground ml-2">→ {draft.to}</span>
                                        </div>
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-success/15 text-success uppercase tracking-wider shrink-0">No action needed</span>
                                    </div>
                                ) : isSent ? (
                                    <div className="flex items-start gap-2 text-xs">
                                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-muted-foreground">
                                                Sent to <span className="font-semibold text-foreground">{draft.to}</span>
                                                {wasEdited && <span className="text-[10px] text-muted-foreground italic ml-1">(edited)</span>}
                                            </span>
                                            {draft.id === 'DRAFT-001' && aiChoice && (
                                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                                    {aiChoice === 'cc-am'
                                                        ? '· CC\'d Coordinator Blake (Account Manager)'
                                                        : '· Sent directly to AP team only'}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setSent(prev => ({ ...prev, [draft.id]: false }))}
                                            className="ml-auto text-[10px] text-muted-foreground hover:text-foreground underline shrink-0"
                                        >
                                            Undo
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <StatusBadge label={tone.label} tone={tone.tone} size="xs" icon={tone.icon} />
                                            {wasEdited && (
                                                <StatusBadge label="Edited" tone="ai" size="xs" icon={<Pencil className="h-2.5 w-2.5" />} />
                                            )}
                                            <span className="text-[10px] text-muted-foreground font-mono">→ {draft.to}</span>
                                        </div>

                                        <div className="text-sm font-bold text-foreground mb-1">{subject}</div>

                                        <div className="bg-muted/30 rounded-lg p-2.5 text-[11px] text-muted-foreground whitespace-pre-line leading-relaxed mb-2 max-h-32 overflow-y-auto">
                                            {body}
                                        </div>

                                        <div className="flex items-center gap-2 justify-end">
                                            {wasEdited && (
                                                <button
                                                    onClick={() => handleDiscardEdit(draft.id)}
                                                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                                                    title="Discard your edits and use the original AI draft"
                                                >
                                                    <RotateCcw className="h-3 w-3" />
                                                    Revert to AI draft
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setEditingId(draft.id)}
                                                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-foreground bg-background border border-border rounded hover:bg-muted transition-colors"
                                            >
                                                <Pencil className="h-3 w-3" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setSent(prev => ({ ...prev, [draft.id]: true }))}
                                                className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-primary-foreground bg-primary rounded hover:opacity-90 transition-opacity"
                                            >
                                                <Send className="h-3 w-3" />
                                                Approve + send
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <EmailEditSheet
                draft={editingDraft}
                existingEdit={editingDraft ? edits[editingDraft.id] : undefined}
                onClose={() => setEditingId(null)}
                onSave={handleSaveEdit}
            />
        </>
    )
}

// ─── EmailEditSheet · floating editor ───────────────────────────────────────
// Right-side floating sheet (reuses MBIDetailSheet for consistency with the
// rest of the demo). Keeps the Controller in the same screen — no full page
// redirect. Subject + body are editable; recipient is structural and stays
// read-only. The "Polish with AI" toolbar offers 3 tone-shift one-click
// rewrites so the user doesn't have to do all the wordsmithing themselves.

function EmailEditSheet({
    draft,
    existingEdit,
    onClose,
    onSave,
}: {
    draft: EmailDraft | null
    existingEdit: DraftEdit | undefined
    onClose: () => void
    onSave: (draftId: string, edit: DraftEdit) => void
}) {
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const [appliedPolish, setAppliedPolish] = useState<DraftEdit['polishedAs']>(undefined)

    // Reset form when a different draft opens
    useEffect(() => {
        if (draft) {
            setSubject(existingEdit?.subject ?? draft.subject)
            setBody(existingEdit?.body ?? draft.body)
            setAppliedPolish(existingEdit?.polishedAs)
        }
    }, [draft, existingEdit])

    if (!draft) return null

    const tone = TONE_META[draft.tone]
    const isDirty =
        subject !== draft.subject ||
        body !== draft.body ||
        appliedPolish !== existingEdit?.polishedAs
    const charCount = body.length

    const handlePolish = (direction: 'friendlier' | 'firmer' | 'shorter') => {
        // Always polish from the ORIGINAL body (not the current edit) so
        // hitting "shorter" then "friendlier" doesn't compound transforms
        // into noise.
        setBody(polishBody(draft.body, direction))
        setAppliedPolish(direction)
    }

    const handleSave = () => {
        onSave(draft.id, { subject, body, polishedAs: appliedPolish })
    }

    const handleResetToOriginal = () => {
        setSubject(draft.subject)
        setBody(draft.body)
        setAppliedPolish(undefined)
    }

    return (
        <MBIDetailSheet
            isOpen={!!draft}
            onClose={onClose}
            title="Edit collection email"
            subtitle="Tweak the AI draft · or polish it in one click"
            icon={<Pencil className="h-4 w-4" />}
            width="lg"
        >
            <div className="space-y-4">
                {/* Header context · tone + recipient */}
                <section className="bg-background/60 dark:bg-zinc-900/40 border border-border rounded-xl p-3 flex flex-wrap items-center gap-2">
                    <StatusBadge label={tone.label} tone={tone.tone} size="xs" icon={tone.icon} />
                    <span className="text-[11px] text-muted-foreground">→</span>
                    <span className="text-xs font-mono text-foreground">{draft.to}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground italic">Recipient is structural · not editable</span>
                </section>

                {/* Subject */}
                <FieldGroup label="Subject">
                    <input
                        type="text"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="w-full bg-background dark:bg-zinc-800 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </FieldGroup>

                {/* Polish with AI toolbar */}
                <section className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                        <Wand2 className="h-3.5 w-3.5 text-ai" />
                        <span className="text-[10px] font-bold text-ai uppercase tracking-wider">Polish with AI</span>
                        {appliedPolish && (
                            <StatusBadge label={`Applied: ${appliedPolish}`} tone="ai" size="xs" />
                        )}
                        <span className="ml-auto text-[10px] text-muted-foreground">One click rewrites the body · always from the original</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <PolishButton label="Friendlier" hint="Warmer greeting + softer closing" active={appliedPolish === 'friendlier'} onClick={() => handlePolish('friendlier')} />
                        <PolishButton label="Firmer" hint="More formal · clearer deadline" active={appliedPolish === 'firmer'} onClick={() => handlePolish('firmer')} />
                        <PolishButton label="Shorter" hint="Strip optional context · keep the ask" active={appliedPolish === 'shorter'} onClick={() => handlePolish('shorter')} />
                    </div>
                </section>

                {/* Body */}
                <FieldGroup label="Email body" hint={`${charCount} chars`}>
                    <textarea
                        value={body}
                        onChange={e => { setBody(e.target.value); setAppliedPolish(undefined) }}
                        rows={12}
                        className="w-full bg-background dark:bg-zinc-800 border border-border rounded-lg px-3 py-2 text-sm text-foreground font-sans whitespace-pre-line focus:outline-none focus:border-primary resize-y leading-relaxed"
                    />
                </FieldGroup>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                    <button
                        onClick={handleResetToOriginal}
                        className="text-[11px] text-muted-foreground hover:text-foreground underline self-start"
                    >
                        Reset to original AI draft
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!isDirty}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Save className="h-3.5 w-3.5" />
                            Save changes
                        </button>
                    </div>
                </div>
            </div>
        </MBIDetailSheet>
    )
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
                {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
            </div>
            {children}
        </div>
    )
}

function PolishButton({ label, hint, active, onClick }: { label: string; hint: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                active
                    ? 'bg-ai/15 border-ai/60 text-foreground'
                    : 'bg-card dark:bg-zinc-900 border-border hover:border-ai/40 hover:bg-ai/5'
            }`}
        >
            <div className="text-xs font-bold text-foreground">{label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{hint}</div>
        </button>
    )
}
