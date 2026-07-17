import { useState, useEffect, useCallback, useRef } from 'react';
import { useDemo } from '../../context/DemoContext';
import {
    Bars3Icon,
    MagnifyingGlassIcon,
    QuestionMarkCircleIcon,
    Cog6ToothIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArchiveBoxIcon,
    ExclamationCircleIcon,
    TrashIcon,
    EnvelopeIcon,
    ClockIcon,
    CheckCircleIcon,
    ArrowDownTrayIcon,
    ArrowUturnLeftIcon,
    ShareIcon,
    FolderIcon,
    TagIcon,
    EllipsisVerticalIcon,
    StarIcon,
    PencilIcon,
    InboxIcon,
    PaperAirplaneIcon,
    DocumentIcon,
    ChevronDownIcon,
    ArrowLeftIcon,
    Squares2X2Icon,
    VideoCameraIcon,
    ChatBubbleLeftEllipsisIcon,
    UsersIcon,
    PlusIcon,
    SparklesIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AIProcessingModal from '../modals/AIProcessingModal';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// ─── WRG Email Data ──────────────────────────────────────────────────────────

const WRG_EMAILS: Array<{ id: number; sender: string; senderEmail: string; subject: string; snippet: string; time: string; unread: boolean; labels: string[] }> = [
    { id: 1, sender: 'Jennifer Martinez', senderEmail: 'jmartinez@jpshealthnet.org', subject: 'Quote Request — JPS Women\'s Health Center (Installation + Delivery Required)', snippet: 'We need a full quote including product pricing, installation labor, and delivery logistics for the new Women\'s Health Center...', time: '9:14 AM', unread: true, labels: ['Inbox', 'Urgent'] },
    { id: 2, sender: 'Herman Miller Support', senderEmail: 'support@hermanmiller.com', subject: 'Catalog Update Q2 — Ergonomic Series pricing', snippet: 'Please review the latest pricing updates for the ergonomic seating catalog...', time: '8:15 AM', unread: false, labels: ['Inbox'] },
    { id: 3, sender: 'Smartsheet Notification', senderEmail: 'notify@smartsheet.com', subject: 'Row Updated: UTSW Lab Renovation #2026-UTX', snippet: 'A row was updated in your sheet: Design phase complete, ready for estimation...', time: 'Yesterday', unread: false, labels: ['Inbox'] },
    { id: 4, sender: 'Lisa Chen', senderEmail: 'lchen@wrgtexas.com', subject: 'RE: Parkland Phase 2 — Estimate finalized', snippet: 'The estimate for Parkland Phase 2 is ready. Total labor: $12,340, delivery: $3,280...', time: 'Yesterday', unread: false, labels: ['Inbox'] },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface EmailSimulationProps {
    /** When true (shared-block preview), autoplay the RFQ opening + processing
     *  modal without a demo tour, and short-circuit `nextStep` on completion. */
    previewMode?: boolean;
}

export default function EmailSimulation({ previewMode = false }: EmailSimulationProps = {}) {
    const { isDemoActive, nextStep, currentStep, isPaused, demoProfile } = useDemo();
    const [selectedEmail, setSelectedEmail] = useState<number | null>(null);
    const [starred, setStarred] = useState<Record<number, boolean>>({ 1: true });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showProcessingModal, setShowProcessingModal] = useState(false);
    const [previewCompleted, setPreviewCompleted] = useState(false);

    // Pause-aware timer helper
    const isPausedRef = useRef(isPaused);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    const pauseAware = useCallback((fn: () => void) => {
        return () => {
            if (!isPausedRef.current) { fn(); return; }
            const poll = setInterval(() => {
                if (!isPausedRef.current) { clearInterval(poll); fn(); }
            }, 200);
        };
    }, []);

    const isWRG = demoProfile?.id === 'wrg';

    // Auto-open RFQ email and auto-start processing.
    // In demo tour: gated on step 1.1 / w1.1.
    // In shared-block preview: always autoplay on mount (no tour to gate on).
    useEffect(() => {
        const stepAutoplay = isDemoActive && (currentStep.id === '1.1' || currentStep.id === 'w1.1');
        if (!stepAutoplay && !previewMode) return;

        const timers: ReturnType<typeof setTimeout>[] = [];
        // Auto-click on email #1 after a short delay
        timers.push(setTimeout(pauseAware(() => setSelectedEmail(1)), 1080));
        // Auto-start processing after email opens
        timers.push(setTimeout(pauseAware(() => setShowProcessingModal(true)), 4050));

        return () => timers.forEach(clearTimeout);
    }, [isDemoActive, currentStep.id, previewMode, pauseAware]);

    const handleProcessingComplete = useCallback(() => {
        setShowProcessingModal(false);
        if (previewMode) {
            // No tour to advance in preview · surface an inline completion state
            // so the shared-block viewer sees the flow finished.
            setPreviewCompleted(true);
        } else {
            nextStep();
        }
    }, [nextStep, previewMode]);

    const defaultEmails: Array<{ id: number; sender: string; senderEmail: string; subject: string; snippet: string; time: string; unread: boolean; labels: string[] }> = [
        { id: 1, sender: 'Apex Furniture Procurement', senderEmail: 'orders@apexfurniture.com', subject: 'RFQ: 200 Executive Task Chairs & Specs', snippet: 'Please review the attached RFQ data and PDF specifications for 200 Task Chairs...', time: '10:42 AM', unread: true, labels: ['Inbox', 'Urgent'] },
        { id: 2, sender: 'Expert Hub System', senderEmail: 'alerts@experthub.io', subject: 'Daily Recap: 12 Transactions Pending Action', snippet: 'Your daily summary of transactions that require your expertise for reconciliation...', time: '8:15 AM', unread: false, labels: ['Inbox'] },
        { id: 3, sender: 'IT Service Desk', senderEmail: 'help@it.agentic.com', subject: 'ServiceNow: New Incident INC-1102 Assigned', snippet: 'A new high-priority infrastructure incident has been assigned to your workspace group...', time: 'Yesterday', unread: false, labels: ['Inbox', 'Work'] },
        { id: 4, sender: 'Herman Miller Support', senderEmail: 'support@hermanmiller.com', subject: 'Catalog Update Notification: Q2 Ergonomic Series', snippet: 'Please review the latest pricing updates for the ergonomic seating catalog...', time: 'Yesterday', unread: false, labels: ['Inbox'] },
    ];

    const emails = isWRG ? WRG_EMAILS : defaultEmails;

    const currentEmail = emails.find(e => e.id === selectedEmail);

    return (
        <div className="relative flex h-full bg-gray-50 dark:bg-zinc-950 overflow-hidden text-foreground">
            {/* Apps Sidebar (Left-most vertical bar) */}
            <aside className="w-16 flex flex-col items-center py-2 shrink-0 bg-gray-50 dark:bg-zinc-950 border-r dark:border-zinc-800/30 gap-1">
                {[
                    { icon: EnvelopeIcon, label: 'Mail', active: true },
                    { icon: ChatBubbleLeftEllipsisIcon, label: 'Chat' },
                    { icon: UsersIcon, label: 'Spaces' },
                    { icon: VideoCameraIcon, label: 'Meet' }
                ].map((app, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 group cursor-pointer mb-2">
                        <div className={cn(
                            "p-1.5 rounded-full transition-all duration-200 relative",
                            app.active ? "bg-blue-100 dark:bg-brand-500/20 text-blue-950 dark:text-brand-400" : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-muted-foreground"
                        )}>
                            <app.icon className="w-6 h-6" />
                            {app.active && <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-brand-600 dark:bg-brand-400 rounded-r-full" />}
                        </div>
                        <span className={cn("text-[10px] font-medium transition-colors", app.active ? "text-blue-950 dark:text-brand-400 underline underline-offset-4 decoration-2" : "text-muted-foreground group-hover:text-zinc-800 dark:group-hover:text-zinc-200")}>{app.label}</span>
                    </div>
                ))}
            </aside>

            {/* Sidebar Contextual */}
            <aside className={cn(
                "flex flex-col px-3 shrink-0 transition-all duration-300",
                isSidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"
            )}>
                <button className="flex items-center gap-4 bg-blue-200 dark:bg-brand-500 hover:shadow-lg py-4 px-6 rounded-2xl mb-4 transition-all w-fit mt-2 group shadow-sm active:scale-95">
                    <PencilIcon className="w-6 h-6 text-blue-950 dark:text-zinc-900 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-blue-950 dark:text-zinc-900 pr-2">Compose</span>
                </button>

                <nav className="space-y-0.5">
                    {[
                        { icon: InboxIcon, label: 'Inbox', count: '4', active: true },
                        { icon: StarIcon, label: 'Starred' },
                        { icon: ClockIcon, label: 'Snoozed' },
                        { icon: PaperAirplaneIcon, label: 'Sent' },
                        { icon: DocumentIcon, label: 'Drafts', count: '1' },
                        { icon: ChevronDownIcon, label: 'More' }
                    ].map((item, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex items-center gap-4 py-1 px-5 rounded-full cursor-pointer group transition-all",
                                item.active
                                    ? "bg-blue-100 dark:bg-brand-500/30 text-blue-950 dark:text-brand-100 font-bold"
                                    : "hover:bg-gray-200 dark:hover:bg-zinc-800/80 text-muted-foreground dark:text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", item.active && "text-blue-950 dark:text-brand-100")} />
                            <span className="flex-1 text-sm">{item.label}</span>
                            {item.count && <span className={cn("text-xs", item.active ? "text-brand-600 dark:text-brand-300" : "text-muted-foreground")}>{item.count}</span>}
                        </div>
                    ))}
                </nav>

                <div className="mt-8 px-4 flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
                    <span>Labels</span>
                    <PlusIcon className="w-4 h-4" />
                </div>
                <div className="mt-4 space-y-0.5">
                    {['Work', 'Projects', 'Finance'].map((label, i) => (
                        <div key={i} className="flex items-center gap-4 py-1 px-5 rounded-full cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800/50 text-muted-foreground text-sm transition-colors">
                            <TagIcon className="w-4 h-4" />
                            <span className="flex-1">{label}</span>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 bg-card mr-4 mb-4 rounded-3xl overflow-hidden flex flex-col shadow-sm border border-border/50 transition-all">
                {selectedEmail === null ? (
                    <>
                        {/* Toolbar */}
                        <div className="h-12 flex items-center px-4 gap-4 border-b border-zinc-100 dark:border-zinc-800/30 shrink-0">
                            <div className="flex items-center">
                                <div className="p-2 hover:bg-muted rounded-md cursor-pointer transition-colors group">
                                    <div className="w-4 h-4 border-2 border-zinc-400 dark:border-zinc-600 rounded-[2px] group-hover:border-zinc-600" />
                                </div>
                                <div className="p-2 hover:bg-muted rounded-full cursor-pointer transition-colors">
                                    <ChevronDownIcon className="w-3 h-3 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="flex items-center gap-0.5 text-muted-foreground border-l border-zinc-100 dark:border-zinc-800 pl-2">
                                {[ArchiveBoxIcon, ExclamationCircleIcon, TrashIcon, EnvelopeIcon, ClockIcon].map((Icon, i) => (
                                    <button key={i} className="p-2.5 hover:bg-muted rounded-full transition-colors active:bg-zinc-200">
                                        <Icon className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1" />
                            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-tighter">
                                <span>1-{emails.length} of {emails.length}</span>
                                <div className="flex gap-1 ml-2">
                                    <button className="p-2 hover:bg-muted rounded-full transition-colors"><ChevronLeftIcon className="w-4 h-4" /></button>
                                    <button className="p-2 hover:bg-muted rounded-full transition-colors"><ChevronRightIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>

                        {/* List Section Tabs */}
                        <div className="flex items-center px-4 border-b border-zinc-100 dark:border-zinc-800/30 overflow-x-auto scrollbar-hide">
                            {[
                                { icon: InboxIcon, label: 'Primary', active: true, color: 'text-brand-600', border: 'border-brand-600' },
                                { icon: TagIcon, label: 'Promotions', active: false },
                                { icon: UsersIcon, label: 'Social', active: false }
                            ].map((tab, i) => (
                                <div key={i} className={cn(
                                    "flex items-center gap-4 px-4 py-3 cursor-pointer min-w-max hover:bg-muted dark:hover:bg-zinc-800/30 transition-colors border-b-4",
                                    tab.active ? "border-brand-600 dark:border-brand-500" : "border-transparent"
                                )}>
                                    <tab.icon className={cn("w-5 h-5", tab.active ? "text-brand-600 dark:text-brand-400" : "text-muted-foreground")} />
                                    <span className={cn("text-sm font-bold", tab.active ? "text-brand-600 dark:text-brand-400" : "text-muted-foreground")}>{tab.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Email List */}
                        <div className="flex-1 overflow-y-auto font-sans">
                            {emails.map((email) => (
                                <div
                                    key={email.id}
                                    onClick={() => setSelectedEmail(email.id)}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-2 border-b border-zinc-50 dark:border-zinc-800/30 cursor-pointer group hover:shadow-inner transition-all relative z-10",
                                        email.unread ? "bg-[#F2F6FC] dark:bg-brand-500/5 font-bold shadow-sm" : "bg-card/40"
                                    )}
                                >
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="w-4 h-4 border-2 border-border rounded-[2px] opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setStarred(s => ({ ...s, [email.id]: !s[email.id] })) }}
                                            className="transition-all transform active:scale-125"
                                        >
                                            {starred[email.id]
                                                ? <StarIconSolid className="w-5 h-5 text-yellow-400" />
                                                : <StarIcon className="w-5 h-5 text-zinc-300 dark:text-muted-foreground hover:text-muted-foreground" />
                                            }
                                        </button>
                                    </div>
                                    <div className="w-48 shrink-0 truncate text-sm font-medium">{email.sender}</div>
                                    <div className="flex-1 flex gap-2 overflow-hidden items-center min-w-0">
                                        <span className="text-sm truncate shrink-0">{email.subject}</span>
                                        <span className="text-sm text-muted-foreground truncate font-normal opacity-80">- {email.snippet}</span>
                                        {email.labels && email.labels.map((l, idx) => (
                                            <span key={idx} className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter shrink-0">{l}</span>
                                        ))}
                                    </div>
                                    {/* Hover Actions */}
                                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity absolute right-24 bg-gradient-to-l from-zinc-50 dark:from-zinc-800 px-4 py-1">
                                        {[ArchiveBoxIcon, TrashIcon, EnvelopeIcon, ClockIcon].map((Icon, i) => (
                                            <button key={i} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
                                                <Icon className="w-4 h-4 text-muted-foreground dark:text-zinc-300" />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="w-20 text-right shrink-0 text-[11px] font-bold text-muted-foreground group-hover:hidden">{email.time}</div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    /* Individual Email View */
                    <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500 bg-card">
                        {/* Toolbar */}
                        <div className="h-12 flex items-center px-4 gap-4 border-b border-zinc-100 dark:border-zinc-800/30 shrink-0">
                            <button onClick={() => setSelectedEmail(null)} className="p-3 hover:bg-muted rounded-full transition-colors active:bg-zinc-200">
                                <ArrowLeftIcon className="w-5 h-5 text-muted-foreground" />
                            </button>
                            <div className="flex items-center gap-0.5 text-muted-foreground border-l border-zinc-100 dark:border-zinc-800 pl-2">
                                {[ArchiveBoxIcon, ExclamationCircleIcon, TrashIcon, EnvelopeIcon, ClockIcon, FolderIcon, TagIcon, EllipsisVerticalIcon].map((Icon, i) => (
                                    <button key={i} className="p-2.5 hover:bg-muted rounded-full transition-colors">
                                        <Icon className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1" />
                            <div className="flex items-center gap-1">
                                <button className="p-2 hover:bg-muted rounded-full"><ChevronLeftIcon className="w-4 h-4" /></button>
                                <button className="p-2 hover:bg-muted rounded-full"><ChevronRightIcon className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 scroll-smooth font-sans">
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <h2 className="text-2xl font-normal text-zinc-800 dark:text-zinc-100 leading-tight">{currentEmail?.subject}</h2>
                                        <span className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-widest">Inbox</span>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white shrink-0 font-bold text-lg shadow-inner ring-4 ring-brand-500/10">
                                            {currentEmail?.sender[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-foreground">{currentEmail?.sender}</span>
                                                    <span className="text-[11px] text-muted-foreground">&lt;{currentEmail?.senderEmail}&gt;</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] text-muted-foreground font-bold">{currentEmail?.time} (2 mins ago)</span>
                                                    <div className="flex items-center gap-1">
                                                        <button className="p-1.5 hover:bg-muted rounded-full text-muted-foreground"><StarIcon className="w-4 h-4" /></button>
                                                        <button className="p-1.5 hover:bg-muted rounded-full text-muted-foreground"><ArrowUturnLeftIcon className="w-4 h-4" /></button>
                                                        <button className="p-1.5 hover:bg-muted rounded-full text-muted-foreground"><EllipsisVerticalIcon className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground cursor-pointer hover:bg-muted w-fit px-1 py-0.5 rounded transition-colors group">
                                                to me <ChevronDownIcon className="w-3 h-3 group-hover:rotate-180 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Email Content */}
                            <div className="pl-0 md:pl-16 space-y-10 max-w-4xl">
                                {currentEmail?.id === 1 && !isWRG && (
                                    <>
                                        <div className="text-[15px] leading-relaxed text-muted-foreground space-y-5 font-normal">
                                            <p>Hello Sales Team,</p>
                                            <p>
                                                Please find attached our Request For Quote (RFQ) for <span className="font-bold text-foreground underline decoration-brand-500/50 decoration-2 underline-offset-4 cursor-help">200 Executive Task Chairs</span>.
                                            </p>
                                            <p>
                                                We have included the <span className="italic">Specs.pdf</span> detailing the required ergonomic features and the <span className="italic">OrderData.csv</span> with shipping locations and line item quantities.
                                            </p>
                                            <p className="text-muted-foreground text-sm">Let us know if you have any questions or when we can expect the drafted quote.</p>
                                            <p>Thanks,<br />Apex Furniture</p>
                                        </div>

                                        {/* AI Monitoring Strip — auto-starts processing */}
                                        <div
                                            id="email-rfq-incoming"
                                            className="w-full bg-indigo-500/5 dark:bg-indigo-500/5 border border-indigo-200/50 dark:border-indigo-500/20 p-5 rounded-2xl flex items-center gap-5 overflow-hidden relative shadow-sm"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5 animate-pulse transition-all" />
                                            <div className="relative shrink-0">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center">
                                                    <SparklesIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                                                </div>
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
                                            </div>
                                            <div className="relative z-10 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100">AI Agent Monitoring</h4>
                                                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 rounded-full border border-indigo-500/20">{previewCompleted ? 'Complete' : 'Active'}</span>
                                                </div>
                                                <p className="text-[11px] text-indigo-700/60 dark:text-indigo-300/60 mt-0.5">
                                                    {previewCompleted
                                                        ? <>EmailIntakeAgent processed RFQ · <span className="text-indigo-600 dark:text-indigo-300 font-semibold">quote draft queued in Dealer Kanban</span></>
                                                        : <>EmailIntakeAgent detected RFQ with attachments — <span className="text-indigo-600 dark:text-indigo-300 font-semibold">auto-processing initiated</span></>
                                                    }
                                                </p>
                                            </div>
                                            <div className="relative z-10 flex items-center gap-2 shrink-0 px-4 py-2 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl border border-indigo-500/20">
                                                {previewCompleted ? (
                                                    <>
                                                        <CheckCircleIcon className="w-4 h-4 text-indigo-500" />
                                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">Complete</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">Processing</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {previewMode && previewCompleted && (
                                            <NextStepsCta blocks={EMAIL_NEXT_BLOCKS} />
                                        )}

                                        {/* Refined Attachments */}
                                        <div className="pt-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">2 Attachments</span>
                                                <div className="flex-1 h-px bg-muted" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                                                <div className="inline-flex items-center gap-4 bg-card border border-border p-4 rounded-2xl hover:bg-muted dark:hover:bg-zinc-800/50 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                                    <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-600 group-hover:scale-105 transition-transform">
                                                        <DocumentIcon className="w-8 h-8" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <p className="text-sm font-bold text-foreground truncate">Specs.pdf</p>
                                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">1.4 MB • PDF Document</p>
                                                    </div>
                                                    <ArrowDownTrayIcon className="w-5 h-5 text-muted-foreground group-hover:text-brand-600 group-hover:translate-y-0.5 transition-all" />
                                                </div>
                                                <div className="inline-flex items-center gap-4 bg-card border border-border p-4 rounded-2xl hover:bg-muted dark:hover:bg-zinc-800/50 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                                    <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-xl text-green-600 group-hover:scale-105 transition-transform">
                                                        <DocumentIcon className="w-8 h-8" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <p className="text-sm font-bold text-foreground truncate">OrderData.csv</p>
                                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">24 KB • Spreadsheet</p>
                                                    </div>
                                                    <ArrowDownTrayIcon className="w-5 h-5 text-muted-foreground group-hover:text-brand-600 group-hover:translate-y-0.5 transition-all" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* WRG: JPS Health Network email body */}
                                {currentEmail?.id === 1 && isWRG && (
                                    <>
                                        <div className="text-[15px] leading-relaxed text-muted-foreground space-y-5 font-normal">
                                            <p>Dear WRG Team,</p>
                                            <p>
                                                We need a <span className="font-bold text-foreground underline decoration-brand-500/50 decoration-2 underline-offset-4 cursor-help">complete quote</span> for our new Women's Health Center Wing at JPS Health Network — including <span className="font-bold text-foreground">product pricing, installation labor, and delivery logistics</span>.
                                            </p>
                                            <p>
                                                The project covers <span className="font-bold text-foreground">14,200 sqft across 6 floors</span> — patient rooms, consultation areas, waiting spaces, and administrative offices. Primary spec is MillerKnoll, with select items from OFS and Nemschoff.
                                            </p>
                                            <p>
                                                Please account for the <span className="font-bold text-foreground">installation effort</span> — this is a hospital environment requiring phased installation, after-hours work, and specialized handling. <span className="font-bold text-foreground">Delivery</span> will need sterile corridor access, freight elevator reservations, and dock scheduling.
                                            </p>
                                            <p>
                                                Attached: <span className="italic">Spec Narrative</span>, <span className="italic">Selection Document</span>, and <span className="italic">Site Requirements</span> with delivery constraints.
                                            </p>
                                            <p>Best regards,<br />Jennifer Martinez<br /><span className="text-sm text-muted-foreground">Facilities Director, JPS Health Network</span></p>
                                        </div>

                                        {/* AI Monitoring Strip */}
                                        <div
                                            id="email-rfq-incoming"
                                            className="w-full bg-indigo-500/5 dark:bg-indigo-500/5 border border-indigo-200/50 dark:border-indigo-500/20 p-5 rounded-2xl flex items-center gap-5 overflow-hidden relative shadow-sm"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5 animate-pulse transition-all" />
                                            <div className="relative shrink-0">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center">
                                                    <SparklesIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                                                </div>
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
                                            </div>
                                            <div className="relative z-10 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100">AI Agent Monitoring</h4>
                                                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 rounded-full border border-indigo-500/20">{previewCompleted ? 'Complete' : 'Active'}</span>
                                                </div>
                                                <p className="text-[11px] text-indigo-700/60 dark:text-indigo-300/60 mt-0.5">
                                                    {previewCompleted
                                                        ? <>EmailIntakeAgent processed procurement request · <span className="text-indigo-600 dark:text-indigo-300 font-semibold">labor + delivery estimate queued</span></>
                                                        : <>EmailIntakeAgent detected procurement request with 3 PDFs — <span className="text-indigo-600 dark:text-indigo-300 font-semibold">auto-processing initiated</span></>
                                                    }
                                                </p>
                                            </div>
                                            <div className="relative z-10 flex items-center gap-2 shrink-0 px-4 py-2 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl border border-indigo-500/20">
                                                {previewCompleted ? (
                                                    <>
                                                        <CheckCircleIcon className="w-4 h-4 text-indigo-500" />
                                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">Complete</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">Processing</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {previewMode && previewCompleted && (
                                            <NextStepsCta blocks={EMAIL_NEXT_BLOCKS} />
                                        )}

                                        {/* Attachments — 3 PDFs */}
                                        <div className="pt-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">3 Attachments</span>
                                                <div className="flex-1 h-px bg-muted" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
                                                {[
                                                    { name: 'JPS_Spec_Narrative.pdf', size: '1.8 MB • 12 pages', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' },
                                                    { name: 'JPS_Selection_Document.pdf', size: '2.4 MB • 18 pages', color: 'bg-red-50 dark:bg-red-500/10 text-red-600' },
                                                    { name: 'JPS_Site_Requirements.pdf', size: '0.9 MB • 8 pages', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' },
                                                ].map((file) => (
                                                    <div key={file.name} className="inline-flex items-center gap-3 bg-card border border-border p-3 rounded-2xl hover:bg-muted dark:hover:bg-zinc-800/50 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                                        <div className={cn("p-2.5 rounded-xl group-hover:scale-105 transition-transform", file.color)}>
                                                            <DocumentIcon className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-foreground truncate">{file.name}</p>
                                                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{file.size}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {currentEmail?.id === 2 && (
                                    <div className="space-y-6">
                                        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
                                            <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                                <h3 className="font-bold text-lg text-foreground">Daily Recap: Expert Hub</h3>
                                                <span className="bg-brand-100 text-brand-700 text-xs px-2 py-1 rounded font-bold">12 Pending Actions</span>
                                            </div>
                                            <div className="space-y-4 text-sm text-muted-foreground">
                                                <p>Good morning,</p>
                                                <p>You have <strong className="text-foreground">12 transactions</strong> requiring your review in the Expert Hub today. Below is a quick summary:</p>
                                                <ul className="list-disc pl-5 space-y-2 font-medium">
                                                    <li><span className="text-red-600 dark:text-red-400">3 Orders</span> flagged for margin override</li>
                                                    <li><span className="text-amber-600 dark:text-amber-400">5 Quotes</span> requiring technical approval</li>
                                                    <li><span className="text-blue-600 dark:text-blue-400">4 Acknowledgements</span> with vendor discrepancies</li>
                                                </ul>
                                                <div className="pt-4">
                                                    <button className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm font-semibold transition-colors">Go to Expert Hub</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentEmail?.id === 3 && (
                                    <div className="space-y-6">
                                        <div className="p-0 border border-border rounded-xl overflow-hidden bg-card shadow-sm">
                                            <div className="bg-[#0568AE] text-white p-4">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-bold text-lg">ServiceNow Assignment</h3>
                                                    <span className="text-sm font-medium">INC-1102</span>
                                                </div>
                                            </div>
                                            <div className="p-6 space-y-4 text-sm text-muted-foreground">
                                                <p><strong>Priority:</strong> <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">High (P2)</span></p>
                                                <p><strong>Caller:</strong> John Doe (Marketing Team)</p>
                                                <p><strong>Short description:</strong> CRM Gateway API Timeout</p>
                                                <div className="bg-muted dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 mt-4">
                                                    <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Work Notes</p>
                                                    <p>A new high-priority infrastructure incident has been assigned to your workspace group. Please acknowledge and begin investigation within the SLA window (2 hours).</p>
                                                </div>
                                                <button className="mt-4 text-brand-600 hover:underline font-semibold flex items-center gap-1">Take me to the incident <ArrowRightIcon className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentEmail?.id === 4 && (
                                    <div className="space-y-6">
                                        <div className="p-6 border-l-4 border-[#FF4D00] bg-card border border-y-zinc-200 border-r-zinc-200 dark:border-y-zinc-800 dark:border-r-zinc-800 rounded-r-xl shadow-sm">
                                            <h3 className="font-bold text-xl text-foreground mb-2">Herman Miller: Q2 Catalog Update</h3>
                                            <div className="space-y-4 text-sm text-muted-foreground">
                                                <p>Hello Strata Market Partners,</p>
                                                <p>We are announcing a pricing update for our <strong className="text-foreground">Ergonomic Seating Series (Aeron, Embody)</strong>, effective starting next month.</p>
                                                <div className="bg-muted dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 flex gap-4 mt-2">
                                                    <DocumentIcon className="w-8 h-8 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-bold text-foreground">HM_Q2_Pricing_Matrix.xlsx</p>
                                                        <p className="text-xs text-muted-foreground">Spreadsheet • 1.2 MB</p>
                                                    </div>
                                                </div>
                                                <p className="pt-2 text-xs text-muted-foreground">The Strata Catalog AI has already begun processing these updates into Demo Environment staging.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons Shadow Footer */}
                                <div className="flex flex-wrap items-center gap-3 pt-6 pb-20">
                                    <button className="px-8 py-2.5 border-2 border-border rounded-full text-sm font-bold text-muted-foreground hover:bg-muted dark:hover:bg-zinc-800 transition-all flex items-center gap-3 group/reply active:scale-95 shadow-sm">
                                        <ArrowUturnLeftIcon className="w-4 h-4 group-hover/reply:-translate-x-0.5 transition-transform" />
                                        Reply
                                    </button>
                                    <button className="px-8 py-2.5 border-2 border-border rounded-full text-sm font-bold text-muted-foreground hover:bg-muted dark:hover:bg-zinc-800 transition-all flex items-center gap-3 group/fwd active:scale-95 shadow-sm">
                                        Forward
                                        <ArrowRightIcon className="w-4 h-4 group-hover/fwd:translate-x-0.5 transition-transform" />
                                    </button>
                                    <div className="flex-1" />
                                    <button className="p-2.5 hover:bg-zinc-100 rounded-full text-muted-foreground"><EllipsisHorizontalIcon className="w-6 h-6" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Right Apps Sidebar (Static/Hidden) */}
            <aside className="w-14 flex flex-col items-center py-4 bg-gray-50 dark:bg-zinc-950 shrink-0 gap-8 border-l border-border/30">
                <img src="https://www.gstatic.com/companion/icon_assets/calendar_2020q4_2x.png" className="w-5 h-5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" alt="Calendar" />
                <img src="https://www.gstatic.com/companion/icon_assets/keep_2020q4_v3_2x.png" className="w-5 h-5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" alt="Keep" />
                <img src="https://www.gstatic.com/companion/icon_assets/tasks_2021_2x.png" className="w-5 h-5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" alt="Tasks" />
                <div className="h-px w-6 bg-zinc-200 dark:bg-zinc-800" />
                <PlusIcon className="w-5 h-5 text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer" />
            </aside>

            {/* AI Processing Modal — auto-triggered during demo step 1.1 */}
            <AIProcessingModal open={showProcessingModal} onComplete={handleProcessingComplete} />

            {/* Copilot production footer */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
                <p className="text-[10px] text-muted-foreground/50 italic whitespace-nowrap">
                    In production → Copilot plugin for Outlook: auto-detects RFQs in your inbox
                </p>
            </div>
        </div>
    );
}

// ─── Next-steps CTA (shared-block preview only) ──────────────────────────────
// After the AI Monitoring strip goes "Complete" we surface the natural
// downstream shared blocks so the viewer doesn't dead-end. Each entry
// pushes ?block=<id> + fires the same 'block:change' event the
// ExperienceSwitcher uses, so the app re-renders inside the current shell
// without a full reload.

const EMAIL_NEXT_BLOCKS: Array<{ id: string; icon: string; title: string; body: string }> = [
    { id: 'dealer-kanban', icon: '📋', title: 'Dealer Kanban Pipeline', body: 'See the AI extraction + normalization stage that just picked up this RFQ.' },
    { id: 'expert-hub-tx', icon: '🔀', title: 'Expert Hub Transactions', body: 'HITL review & reconciliation of the quote draft before it goes back to the client.' },
];

function NextStepsCta({ blocks }: { blocks: typeof EMAIL_NEXT_BLOCKS }) {
    const goToBlock = (id: string) => {
        const url = new URL(window.location.href);
        url.searchParams.set('block', id);
        window.history.pushState({}, '', url.toString());
        window.dispatchEvent(new CustomEvent('block:change'));
    };
    return (
        <div className="mt-4 rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Continue the flow
                </span>
                <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {blocks.map(next => (
                    <button
                        key={next.id}
                        onClick={() => goToBlock(next.id)}
                        className="group flex items-start gap-3 p-3 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/40 transition-all text-left"
                    >
                        <span className="text-xl shrink-0 leading-none">{next.icon}</span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold text-foreground truncate">{next.title}</p>
                                <ArrowRightIcon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{next.body}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
