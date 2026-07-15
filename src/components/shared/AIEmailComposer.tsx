import { useEffect, useState, type ReactNode } from 'react'
import { Wand2, Save, X } from 'lucide-react'
import MBIDetailSheet from '../mbi/MBIDetailSheet'
import { StatusBadge, type StatusTone } from './index'

export type EmailPolishDirection = 'friendlier' | 'firmer' | 'shorter'

/**
 * Generic AI-assisted email composer · extracted from MBI's
 * AIEmailDraftsPanel EmailEditSheet pattern so other surfaces (CLC's
 * capacity outreach / dispatcher contact, future flows) can reuse the
 * exact same look-and-feel without copy-pasting the editor shell.
 *
 * The polish toolbar offers three one-click tone shifts (friendlier /
 * firmer / shorter). Consumers can pass a `polishFn` to plug in
 * domain-specific rewrites · the default polish is generic enough for
 * vendor outreach, internal escalation, and external collections.
 *
 * The primary action is parameterized (label + icon + handler) so the
 * same component serves "Save changes" (edit) and "Send draft" (commit)
 * use cases. Recipient is structural (read-only) · subject + body are
 * editable. Reset reverts to the initialSubject/initialBody pair.
 */

interface AIEmailComposerProps {
    isOpen: boolean
    onClose: () => void
    /** Header copy · defaults are sensible for "edit draft" use cases. */
    title?: string
    subtitle?: string
    icon?: ReactNode
    /** Floating-sheet width · matches MBIDetailSheet's three sizes. */
    width?: 'sm' | 'md' | 'lg'

    /** Recipient label · rendered as read-only mono text in the header. */
    to: string
    /** Initial subject · also acts as the polish-from-original baseline. */
    initialSubject: string
    /** Initial body · also acts as the polish-from-original baseline. */
    initialBody: string

    /** Optional badge rendered next to the recipient · use for tone label,
        sender role, urgency, etc. */
    badge?: { label: string; tone: StatusTone; icon?: ReactNode }

    /** Hide polish toolbar entirely if the use case doesn't need rewrites. */
    polishEnabled?: boolean
    /** Override the default polish rewrites with domain-specific logic.
        When omitted, the generic transformer below is used (greeting
        swap + closing swap + length trim). */
    polishFn?: (body: string, direction: EmailPolishDirection) => string

    /** Primary action button label · e.g. "Save changes", "Send draft". */
    actionLabel: string
    /** Primary action icon · defaults to a Save icon. */
    actionIcon?: ReactNode
    /** Called with the current (possibly edited) subject + body when the
        operator commits. Parent decides what to do (send via API, save
        edit, mark sent, etc.). */
    onAction: (subject: string, body: string) => void

    /** Optional reset-link label · defaults to "Reset to original draft". */
    resetLabel?: string
}

/** Generic polish rewrites · safe for any business email. Consumers who
    need domain-specific tone shifts should pass their own `polishFn`. */
function defaultPolish(body: string, direction: EmailPolishDirection): string {
    if (direction === 'friendlier') {
        return body
            .replace(/^(Hello|To whom it may concern|Dear)[,.]?/im, 'Hi there,')
            .replace(/^(Hi),?/im, 'Hi there,')
            .replace(/Please /g, 'Could you ')
            .replace(/(Regards|Best regards|Sincerely)[,.]?\s*$/im, 'Thanks so much,')
            .replace(/Thanks[,.]?\s*$/im, 'Thanks a ton,')
    }
    if (direction === 'firmer') {
        return body
            .replace(/^(Hi there|Hi|Hello)[,.]?/im, 'To whom it may concern,')
            .replace(/Could you /g, 'Please ')
            .replace(/(Thanks so much|Thanks a ton|Thanks)[,.]?\s*$/im, 'Regards,')
            .replace(/Warm regards[,.]?\s*$/im, 'Sincerely,')
    }
    // shorter · keep first 5 substantive lines, drop blank padding
    return body
        .split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 5)
        .join('\n')
}

export default function AIEmailComposer({
    isOpen,
    onClose,
    title = 'Edit email draft',
    subtitle,
    icon,
    width = 'lg',
    to,
    initialSubject,
    initialBody,
    badge,
    polishEnabled = true,
    polishFn,
    actionLabel,
    actionIcon,
    onAction,
    resetLabel = 'Reset to original draft',
}: AIEmailComposerProps) {
    const [subject, setSubject] = useState(initialSubject)
    const [body, setBody] = useState(initialBody)
    const [appliedPolish, setAppliedPolish] = useState<EmailPolishDirection | undefined>(undefined)

    // Re-seed the editor whenever the parent opens it with a different
    // draft · prevents the previous edits from leaking into a new case.
    useEffect(() => {
        if (isOpen) {
            setSubject(initialSubject)
            setBody(initialBody)
            setAppliedPolish(undefined)
        }
    }, [isOpen, initialSubject, initialBody])

    const isDirty = subject !== initialSubject || body !== initialBody
    const charCount = body.length
    const polishImpl = polishFn ?? defaultPolish

    const handlePolish = (direction: EmailPolishDirection) => {
        // Always polish from the ORIGINAL body so chained one-click rewrites
        // (e.g. "shorter" then "friendlier") don't compound into noise.
        setBody(polishImpl(initialBody, direction))
        setAppliedPolish(direction)
    }

    const handleReset = () => {
        setSubject(initialSubject)
        setBody(initialBody)
        setAppliedPolish(undefined)
    }

    const handleAction = () => {
        onAction(subject, body)
    }

    const ActionIcon = actionIcon ?? <Save className="h-3.5 w-3.5" />

    return (
        <MBIDetailSheet
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle={subtitle}
            icon={icon}
            width={width}
        >
            <div className="space-y-4">
                {/* Header context · recipient + optional badge */}
                <section className="bg-background/60 dark:bg-zinc-900/40 border border-border rounded-xl p-3 flex flex-wrap items-center gap-2">
                    {badge && (
                        <StatusBadge label={badge.label} tone={badge.tone} size="xs" icon={badge.icon} />
                    )}
                    <span className="text-[11px] text-muted-foreground">→</span>
                    <span className="text-xs font-mono text-foreground">{to}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground italic">
                        Recipient is structural · not editable
                    </span>
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

                {/* Polish with AI toolbar (optional) */}
                {polishEnabled && (
                    <section className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2">
                            <Wand2 className="h-3.5 w-3.5 text-ai" />
                            <span className="text-[10px] font-bold text-ai uppercase tracking-wider">Polish with AI</span>
                            {appliedPolish && (
                                <StatusBadge label={`Applied: ${appliedPolish}`} tone="ai" size="xs" />
                            )}
                            <span className="ml-auto text-[10px] text-muted-foreground">
                                One click rewrites the body · always from the original
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <PolishButton label="Friendlier" hint="Warmer greeting + softer closing" active={appliedPolish === 'friendlier'} onClick={() => handlePolish('friendlier')} />
                            <PolishButton label="Firmer" hint="More formal · clearer deadline" active={appliedPolish === 'firmer'} onClick={() => handlePolish('firmer')} />
                            <PolishButton label="Shorter" hint="Strip optional context · keep the ask" active={appliedPolish === 'shorter'} onClick={() => handlePolish('shorter')} />
                        </div>
                    </section>
                )}

                {/* Body */}
                <FieldGroup label="Email body" hint={`${charCount} chars`}>
                    <textarea
                        value={body}
                        onChange={e => { setBody(e.target.value); setAppliedPolish(undefined) }}
                        rows={12}
                        className="w-full bg-background dark:bg-zinc-800 border border-border rounded-lg px-3 py-2 text-sm text-foreground font-sans whitespace-pre-line focus:outline-none focus:border-primary resize-y leading-relaxed"
                    />
                </FieldGroup>

                {/* Footer · reset link + cancel + primary action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={!isDirty}
                        className="text-[11px] text-muted-foreground hover:text-foreground underline self-start disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                    >
                        {resetLabel}
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleAction}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-zinc-900 bg-primary rounded-lg hover:opacity-90 transition-opacity"
                        >
                            {ActionIcon}
                            {actionLabel}
                        </button>
                    </div>
                </div>
            </div>
        </MBIDetailSheet>
    )
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
                {hint && <span className="text-[10px] text-muted-foreground tabular-nums">{hint}</span>}
            </div>
            {children}
        </div>
    )
}

function PolishButton({ label, hint, active, onClick }: { label: string; hint: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`text-left p-2 rounded-lg border transition-colors ${
                active
                    ? 'bg-ai/15 border-ai/50 text-foreground'
                    : 'bg-background dark:bg-zinc-900 border-border text-foreground hover:border-ai/40 hover:bg-ai/5'
            }`}
        >
            <div className="text-xs font-bold">{label}</div>
            <div className="text-[10px] text-muted-foreground leading-snug">{hint}</div>
        </button>
    )
}
