/**
 * COMPONENT: BriefingCanvas
 * PURPOSE: Step l0.1 canvas — the "before Strata" friction. Shows a real-feel
 *          HubSpot inbox with 6 PO emails, the hero PO at top, and a side
 *          panel illustrating the AM's manual journey across 4 systems
 *          (HubSpot → Seradex → Excel → Leland.com) with a chrono ticker
 *          and a Joshua-backlog counter.
 *
 *          Sets up the emotional pain that Strata resolves in steps l1.1–l1.8.
 *
 * USED BY: LelandInboxApp when currentStep.id === 'l0.1'
 */

import { Mail, ArrowRight, Database, FileSpreadsheet, Globe, Clock, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import StatusBadge from '../../../components/shared/StatusBadge';
import StepCompletionCta from './StepCompletionCta';
import { useDemo } from '../../../context/DemoContext';
import { HERO_PO_HAPPY } from '../../../config/profiles/leland-data';

interface InboxEmail {
    id: string;
    sender: string;
    subject: string;
    snippet: string;
    status: 'New' | 'Waiting on Contact' | 'Waiting on Us' | 'In For Checking';
    minutesAgo: number;
    isHero?: boolean;
}

const INBOX: InboxEmail[] = [
    {
        id: 'hero',
        sender: HERO_PO_HAPPY.dealer,
        subject: `${HERO_PO_HAPPY.project} — PO ${HERO_PO_HAPPY.poNumber}`,
        snippet: 'Please process per attached PO. Ship to arrive week of 07-20-2026.',
        status: 'Waiting on Us',
        minutesAgo: 8,
        isHero: true,
    },
    { id: 'a', sender: 'Atlantic Workspace', subject: 'PO 234118 · Library Renovation', snippet: 'New PO attached · co-op contract.',          status: 'New',                minutesAgo: 22 },
    { id: 'b', sender: 'Pacific Office',     subject: 'Confirm quote status?',          snippet: 'Following up on the quote sent last Tuesday…', status: 'Waiting on Contact', minutesAgo: 45 },
    { id: 'c', sender: 'Lakeside Group',     subject: 'PO 234120 · ICU expansion',      snippet: 'Healthcare order · please prioritize.',       status: 'New',                minutesAgo: 67 },
    { id: 'd', sender: 'Heritage Interiors', subject: 'Re: PO 234105 · materials sub',  snippet: 'Customer accepted the substitute material…',  status: 'In For Checking',    minutesAgo: 92 },
    { id: 'e', sender: 'Plains Office',      subject: 'PO 234112 · government contract',snippet: 'Pricing confirmed · submitting PO.',          status: 'Waiting on Us',      minutesAgo: 134 },
];

interface ManualStep {
    icon: React.ReactNode;
    label: string;
    detail: string;
    minutes: string;
}

const AM_JOURNEY: ManualStep[] = [
    { icon: <Mail className="h-3.5 w-3.5" />,            label: '1. Open the email',                     detail: 'Read the document · note what is being ordered and where it ships',  minutes: '2 min' },
    { icon: <Database className="h-3.5 w-3.5" />,         label: '2. Switch to the order system',         detail: 'Search for the matching quote · pull pricing and configuration',     minutes: '4 min' },
    { icon: <FileSpreadsheet className="h-3.5 w-3.5" />,  label: '3. Open the materials reference',       detail: 'Look up approval status · grade · supplier codes by hand',           minutes: '5 min' },
    { icon: <Globe className="h-3.5 w-3.5" />,            label: '4. Check the supplier site',            detail: 'Cross-reference current pricing on the manufacturer website',         minutes: '3 min' },
    { icon: <Database className="h-3.5 w-3.5" />,         label: '5. Build the order by hand',            detail: 'Type fields · paste comments · add the contract rebate manually',     minutes: '8 min' },
    { icon: <ShieldCheck className="h-3.5 w-3.5" />,      label: '6. Hand off for review',                detail: 'Every order goes through the Reviewer before it can move forward',    minutes: '~1 day' },
];

const STATUS_TONE: Record<InboxEmail['status'], 'info' | 'warning' | 'neutral' | 'ai'> = {
    'New': 'info',
    'Waiting on Contact': 'warning',
    'Waiting on Us': 'ai',
    'In For Checking': 'neutral',
};

export default function BriefingCanvas() {
    const { nextStep } = useDemo();
    return (
        <div className="space-y-4">
            {/* Top stats — today's friction at a glance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <PainStat
                    icon={<Mail className="h-4 w-4" />}
                    value="Inbox piling up"
                    label="Orders waiting for action"
                    tone="info"
                />
                <PainStat
                    icon={<ShieldCheck className="h-4 w-4" />}
                    value="Every order"
                    label="Has to go through the Reviewer"
                    tone="warning"
                />
                <PainStat
                    icon={<Clock className="h-4 w-4" />}
                    value="Half an hour"
                    label="The Account Manager spends per order"
                    tone="ai"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Inbox list — 3 cols */}
                <div className="lg:col-span-3 rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-bold text-foreground">Support · Inbox</span>
                            <span className="text-[10px] text-muted-foreground">· several orders waiting</span>
                        </div>
                        <StatusBadge label="Inbox" tone="info" size="xs" />
                    </div>
                    <div className="divide-y divide-border">
                        {INBOX.map(email => {
                            const Wrapper: React.ElementType = email.isHero ? 'button' : 'div';
                            const wrapperProps = email.isHero
                                ? { type: 'button' as const, onClick: nextStep, title: 'Click to let Strata pick up this PO' }
                                : {};
                            return (
                                <Wrapper
                                    key={email.id}
                                    {...wrapperProps}
                                    className={`
                                        w-full flex items-start gap-3 px-4 py-3 text-left transition-colors
                                        ${email.isHero
                                            ? 'bg-brand-300/10 dark:bg-brand-500/10 border-l-4 border-l-brand-400 dark:border-l-brand-500 hover:bg-brand-300/20 dark:hover:bg-brand-500/15 cursor-pointer'
                                            : 'hover:bg-muted/20'}
                                    `}
                                >
                                    <div className={`size-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${email.isHero ? 'bg-brand-300 dark:bg-brand-500 text-zinc-900' : 'bg-muted text-muted-foreground'}`}>
                                        {email.sender.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className={`text-[12px] truncate ${email.isHero ? 'font-bold text-foreground' : 'font-semibold text-foreground/90'}`}>
                                                    {email.sender}
                                                </span>
                                                {email.isHero && (
                                                    <StatusBadge
                                                        label="Hero · click to process"
                                                        tone="primary"
                                                        size="xs"
                                                        icon={<Sparkles className="h-2.5 w-2.5" />}
                                                    />
                                                )}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">{email.minutesAgo}m</span>
                                        </div>
                                        <div className={`text-[12px] mt-0.5 truncate ${email.isHero ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {email.subject}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">
                                            {email.snippet}
                                        </div>
                                    </div>
                                    <StatusBadge label={email.status} tone={STATUS_TONE[email.status]} size="xs" />
                                </Wrapper>
                            );
                        })}
                    </div>
                </div>

                {/* AM journey — 2 cols */}
                <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 text-warning" />
                            <span className="text-xs font-bold text-foreground">What the AM does today · per PO</span>
                        </div>
                        <StatusBadge label="Manual" tone="warning" size="xs" />
                    </div>
                    <ol className="p-3 space-y-1.5">
                        {AM_JOURNEY.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 px-2.5 py-2">
                                <div className="size-6 rounded-md bg-warning/15 text-warning flex items-center justify-center shrink-0 mt-0.5">
                                    {step.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="text-[11.5px] font-semibold text-foreground">{step.label}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">{step.minutes}</span>
                                    </div>
                                    <div className="text-[10.5px] text-muted-foreground leading-snug mt-0.5">{step.detail}</div>
                                </div>
                            </li>
                        ))}
                    </ol>
                    <div className="px-3 py-2 border-t border-border bg-muted/20 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <ArrowRight className="h-3 w-3" />
                        <span>Multiply that by every order in the queue · every day</span>
                    </div>
                </div>
            </div>

            {/* Closing tagline */}
            <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-3 text-center text-[12px] text-muted-foreground italic">
                Click the <span className="font-bold text-brand-400 dark:text-brand-300 not-italic">highlighted email above</span> (or the button) to see Strata take over and run the pipeline end-to-end.
            </div>

            <StepCompletionCta
                visible
                label="Strata picks up this order"
                hint="Or click the highlighted email above"
            />
        </div>
    );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

interface PainStatProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    tone: 'info' | 'warning' | 'ai';
}

function PainStat({ icon, value, label, tone }: PainStatProps) {
    const toneClasses = {
        info: 'border-info/30 bg-info/5 text-info',
        warning: 'border-warning/30 bg-warning/5 text-warning',
        ai: 'border-ai/30 bg-ai/5 text-ai',
    };
    return (
        <div className={`rounded-2xl border ${toneClasses[tone]} p-4`}>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-90">
                {icon}
                <span>{label}</span>
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums">{value}</div>
        </div>
    );
}
