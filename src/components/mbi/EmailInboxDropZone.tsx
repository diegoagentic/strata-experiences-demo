/**
 * COMPONENT: EmailInboxDropZone
 * PURPOSE: Apr 23 stakeholder ask (Matt, "highly desired but not no-go"):
 *          "we need a way to show … me opening up like an email inbox …
 *          and physically dropping something in here to trigger the flow".
 *
 *          Matt originally requested it for Budget Builder, but Budget is
 *          out of the Thursday demo (Carlos). We surface the same
 *          interaction in Accounting · Morning Queue: drag a vendor
 *          invoice (or click "Simulate a new email") → Strata picks it up,
 *          extracts fields, and the new invoice card appears in the
 *          Pending column of the kanban.
 *
 *          HTML5 native drag-drop, no react-dnd. Falls back to the
 *          "Simulate" button when the user has no file at hand (which is
 *          the demo case 95% of the time).
 *
 * USED BY: AccountingMorningQueue (Flow 1 · Scene 1)
 *
 * PROPS:
 *   - onIngest: (filename: string) => void   called once the simulated
 *                                            processing completes
 *
 * DS TOKENS: bg-card · border-dashed · ai accents during dragover ·
 *            success accents on processed
 */

import { useState, useRef, useEffect } from 'react'
import { Mail, Inbox, Upload, Sparkles, CheckCircle2, Loader2, Paperclip, FileText } from 'lucide-react'

interface EmailInboxDropZoneProps {
    onIngest: (filename: string) => void
    activeFilter?: string
}

type Stage = 'idle' | 'dragover' | 'processing' | 'done'
type EmailCategory = 'edi' | 'non-edi' | 'healthtrust' | 'exception' | 'statement'

interface FauxEmail {
    vendor: string
    subject: string
    attached?: boolean
    time: string
    emailType?: EmailType
    category: EmailCategory
}

const FAUX_EMAILS: FauxEmail[] = [
    // EDI
    { vendor: 'Allsteel · billing@allsteel.example',      subject: 'Bill INV-0482 · PO-2026-0047',                        attached: true, time: '6:14 AM', emailType: 'bill',        category: 'edi' },
    { vendor: 'HON · billing@hon.example',                 subject: 'Bill INV-0493 · service line',                        attached: true, time: '9:55 AM', emailType: 'bill',        category: 'edi' },
    { vendor: 'Kimball · edi@kimball.example',             subject: 'EDI 810 INV-0501 · PO-2026-0052',                     attached: true, time: '7:48 AM', emailType: 'bill',        category: 'edi' },
    // Non-EDI
    { vendor: 'Global Industries · billing@global.example', subject: 'Invoice INV-0471 · paper invoice enclosed',          attached: true, time: '7:15 AM', emailType: 'bill',        category: 'non-edi' },
    { vendor: 'Steelcase · billing@steelcase.example',     subject: 'Invoice INV-3301 · non-catalog item · PO-2026-0039',  attached: true, time: '8:03 AM', emailType: 'bill',        category: 'non-edi' },
    // HealthTrust GPO
    { vendor: 'Allsteel · gpo@allsteel.example',           subject: 'Bill INV-0488 · HealthTrust contract · Lakeside',     attached: true, time: '7:30 AM', emailType: 'healthtrust', category: 'healthtrust' },
    { vendor: 'Teknion · billing@teknion.example',         subject: 'Invoice INV-2218 · HealthTrust GPO terms apply',      attached: true, time: '8:45 AM', emailType: 'healthtrust', category: 'healthtrust' },
    // Exceptions
    { vendor: 'Apex Workspace · billing@apex.example',     subject: 'Bill INV-0484 · PO qty mismatch · 6 vs 5 units',      attached: true, time: '7:55 AM', emailType: 'exception',   category: 'exception' },
    { vendor: 'Teknion · billing@teknion.example',         subject: 'Bill INV-2211 · price discrepancy flagged',           attached: true, time: '9:10 AM', emailType: 'exception',   category: 'exception' },
    // Statement
    { vendor: 'Allsteel · statements@allsteel.example',    subject: 'Q1 2026 Statement · account summary',                                time: '8:22 AM', emailType: 'statement',   category: 'statement' },
    { vendor: 'HON · statements@hon.example',              subject: 'Mar 2026 Account Statement · balance $0',                            time: '6:50 AM', emailType: 'statement',   category: 'statement' },
]

const NEW_EMAIL: FauxEmail = { vendor: 'HON · billing@hon.example', subject: 'Invoice INV-0498 · service line', attached: true, time: '10:02 AM', emailType: 'bill', category: 'non-edi' }

const SIMULATED_FILENAMES = [
    'AceContract_INV_4421.pdf',
    'NorthFurnishings_INV_882.pdf',
    'WrgAcoustics_INV_1209.pdf',
    'StructureLLC_INV_5510.pdf',
]

const PROCESSING_STEPS = [
    'Receiving file from inbox',
    'Document AI extracting fields',
    'Matching to open POs in CORE',
    'Routing to the queue',
]

export default function EmailInboxDropZone({ onIngest, activeFilter = 'all' }: EmailInboxDropZoneProps) {
    const [stage, setStage] = useState<Stage>('idle')
    const [activeFilename, setActiveFilename] = useState<string | null>(null)
    const [processStepIdx, setProcessStepIdx] = useState(0)
    const [newEmailVisible, setNewEmailVisible] = useState(false)
    const dragCounter = useRef(0)
    const autoTriggered = useRef(false)

    useEffect(() => {
        if (autoTriggered.current) return
        autoTriggered.current = true
        const t1 = setTimeout(() => setNewEmailVisible(true), 1800)
        const t2 = setTimeout(() => runProcessing('HON_Billing_INV-0498.pdf'), 2800)
        return () => { clearTimeout(t1); clearTimeout(t2) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const runProcessing = (filename: string) => {
        setActiveFilename(filename)
        setStage('processing')
        setProcessStepIdx(0)

        let i = 0
        const tick = () => {
            i++
            setProcessStepIdx(i)
            if (i < PROCESSING_STEPS.length) {
                setTimeout(tick, 700)
            } else {
                setStage('done')
                onIngest(filename)
                // Reset after a beat so users can try again
                setTimeout(() => {
                    setStage('idle')
                    setActiveFilename(null)
                    setProcessStepIdx(0)
                }, 2400)
            }
        }
        setTimeout(tick, 500)
    }

    const handleSimulate = () => {
        const pick = SIMULATED_FILENAMES[Math.floor(Math.random() * SIMULATED_FILENAMES.length)]
        runProcessing(pick)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        dragCounter.current = 0
        if (stage === 'processing') return
        const file = e.dataTransfer.files?.[0]
        if (file) {
            runProcessing(file.name)
        } else {
            // Plain text drag (no file), still trigger simulate so the demo doesn't dead-end
            handleSimulate()
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (stage !== 'processing') setStage('dragover')
    }
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        dragCounter.current += 1
        if (stage !== 'processing') setStage('dragover')
    }
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        dragCounter.current -= 1
        if (dragCounter.current <= 0 && stage === 'dragover') {
            setStage('idle')
        }
    }

    const isProcessing = stage === 'processing'
    const isDone = stage === 'done'
    const isHover = stage === 'dragover'

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            {/* Inbox header */}
            <div className="px-4 py-2.5 border-b border-border bg-muted/20 flex items-center gap-2">
                <Inbox className="h-4 w-4 text-foreground" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <div className="text-xs font-bold text-foreground">Vendor inbox · ap@mbi.example</div>
                        <span className="h-2 w-2 rounded-full bg-success animate-pulse shrink-0" />
                    </div>
                    <div className="text-[10px] text-muted-foreground">Strata monitors this inbox · AI classifies emails · bills route to AP queue automatically</div>
                </div>
                <span className="text-[10px] text-muted-foreground">{FAUX_EMAILS.length + 1} emails · today</span>
            </div>

            {/* Faux inbox items */}
            {(() => {
                const newVisible = newEmailVisible && (activeFilter === 'all' || activeFilter === 'non-edi')
                const visible = FAUX_EMAILS.filter(e => activeFilter === 'all' || e.category === activeFilter)
                const isEmpty = !newVisible && visible.length === 0
                return (
                    <div className="px-4 py-2 border-b border-border space-y-1.5 bg-background/40 dark:bg-zinc-900/40 max-h-52 overflow-y-auto">
                        {newVisible && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <FauxEmailRow {...NEW_EMAIL} highlight />
                            </div>
                        )}
                        {visible.map(e => (
                            <FauxEmailRow key={e.subject} {...e} muted />
                        ))}
                        {isEmpty && (
                            <div className="text-center text-[10px] text-muted-foreground py-3">
                                No emails in this category
                            </div>
                        )}
                    </div>
                )
            })()}

            {/* Dropzone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                className={`
                    m-3 rounded-xl border-2 border-dashed p-4 transition-all
                    ${isHover ? 'border-ai bg-ai/10' : ''}
                    ${isProcessing ? 'border-ai/60 bg-ai/5' : ''}
                    ${isDone ? 'border-success/60 bg-success/5' : ''}
                    ${stage === 'idle' ? 'border-border bg-background/30 dark:bg-zinc-900/30' : ''}
                `}
            >
                {stage === 'idle' && (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-ai/10 text-ai flex items-center justify-center shrink-0">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-foreground">Drop a vendor bill here</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                PDF, image, .eml — Strata processes it like any other inbound email.
                            </div>
                        </div>
                        <button
                            onClick={handleSimulate}
                            className="shrink-0 text-[10px] text-muted-foreground hover:text-foreground underline transition-colors"
                        >
                            Simulate
                        </button>
                    </div>
                )}

                {isHover && (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-ai/20 text-ai flex items-center justify-center shrink-0">
                            <Upload className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-ai">Drop to ingest</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                Strata will extract fields and route it to the queue.
                            </div>
                        </div>
                    </div>
                )}

                {isProcessing && activeFilename && (
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-ai/20 text-ai flex items-center justify-center shrink-0">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <FileText className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs font-mono text-foreground truncate">{activeFilename}</span>
                            </div>
                            <div className="text-[11px] text-ai font-bold mt-1">{PROCESSING_STEPS[Math.min(processStepIdx, PROCESSING_STEPS.length - 1)]}…</div>
                            <div className="mt-2 h-1 bg-background dark:bg-zinc-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-ai transition-all duration-500"
                                    style={{ width: `${((processStepIdx + 1) / PROCESSING_STEPS.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {isDone && activeFilename && (
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-success">Ingested · added to Pending</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                <span className="font-mono">{activeFilename}</span> · scroll to the queue below to see it appear.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

type EmailType = 'bill' | 'rebate-bill' | 'statement' | 'healthtrust' | 'exception'

const EMAIL_TYPE_CHIP: Record<EmailType, { label: string; cls: string }> = {
    'bill':        { label: 'Bill → AP queue',          cls: 'text-success bg-success/10' },
    'rebate-bill': { label: 'Rebate · Bill → AP',       cls: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
    'statement':   { label: 'Statement · tagged',        cls: 'text-muted-foreground bg-muted/60' },
    'healthtrust': { label: 'HealthTrust GPO · review',  cls: 'text-amber-700 dark:text-amber-400 bg-amber-500/10' },
    'exception':   { label: 'Exception · needs review',  cls: 'text-red-600 dark:text-red-400 bg-red-500/10' },
}

function FauxEmailRow({ vendor, subject, attached, time, muted, emailType, highlight }: { vendor: string; subject: string; attached?: boolean; time: string; muted?: boolean; emailType?: EmailType; highlight?: boolean }) {
    const chip = emailType ? EMAIL_TYPE_CHIP[emailType] : null
    return (
        <div className={`flex items-start gap-3 px-2 py-1.5 rounded transition-all ${muted ? 'opacity-60' : ''} ${highlight ? 'ring-1 ring-amber-400/60 bg-amber-50/60 dark:bg-amber-500/10 rounded-lg' : ''}`}>
            <Mail className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-foreground truncate">{vendor}</div>
                <div className="text-[10px] text-muted-foreground truncate">{subject}</div>
                {chip && (
                    <span className={`mt-0.5 inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${chip.cls}`}>
                        {chip.label}
                    </span>
                )}
            </div>
            {attached && <Paperclip className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" aria-label="has attachment" />}
            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 mt-0.5">{time}</span>
        </div>
    )
}
