import {
    MetricCard, Callout, ProgressBar, PageShell, PipelineRail,
    type MetricTone, type CalloutTone,
} from 'strata-design-system';
import { Button } from 'strata-design-system';
import {
    Sparkles, AlertTriangle, CheckCircle2, Info, Zap,
    ShieldCheck, TrendingUp, Clock,
} from 'lucide-react';

const TONES: MetricTone[] = ['brand', 'success', 'warning', 'ai', 'info', 'danger', 'neutral'];
const CALLOUT_TONES: CalloutTone[] = ['brand', 'success', 'warning', 'ai', 'info', 'danger'];

/**
 * PrimitivesPreviewBlock — visual gallery of the 5 F4.5 DS primitives
 * (MetricCard · Callout · ProgressBar · PageShell · PipelineRail) plus
 * the new brand-glow Button variant. Rendered as a shared block so the
 * user can inspect every variant and tone without launching an experience.
 */
export default function PrimitivesPreviewBlock() {
    return (
        <div className="p-6 max-w-6xl mx-auto space-y-10">
            {/* ─── MetricCard ─────────────────────────────────────────────── */}
            <section>
                <PreviewHeader
                    title="MetricCard"
                    desc="Hero stat with uppercase label · large tabular value · optional icon + sub-caption. Tones: brand · success · warning · ai · info · danger · neutral. Sizes: sm · md · lg."
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TONES.map((tone) => (
                        <MetricCard
                            key={tone}
                            label={`${tone} tone`}
                            value="Half an hour"
                            sub="Time per PO before Strata"
                            icon={<Clock className="size-4" />}
                            tone={tone}
                            size="md"
                        />
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                    <MetricCard label="size · sm" value="18d" sub="avg cycle" tone="success" size="sm" icon={<TrendingUp className="size-3.5" />} />
                    <MetricCard label="size · md" value="18d" sub="avg cycle" tone="success" size="md" icon={<TrendingUp className="size-4" />} />
                    <MetricCard label="size · lg" value="18d" sub="avg cycle" tone="success" size="lg" icon={<TrendingUp className="size-4.5" />} />
                </div>
            </section>

            {/* ─── Callout ────────────────────────────────────────────────── */}
            <section>
                <PreviewHeader
                    title="Callout"
                    desc="Tinted banner with eyebrow + title + body + optional icon and actions. Variants: soft (default · light tint) and strong (higher-contrast fill for critical prompts)."
                />
                <div className="space-y-2">
                    {CALLOUT_TONES.map((tone) => (
                        <Callout
                            key={`soft-${tone}`}
                            tone={tone}
                            variant="soft"
                            eyebrow={`${tone} · soft`}
                            title={`${cap(tone)} callout title`}
                            body={`This is a ${tone} callout in the soft variant. Use for gentle contextual information.`}
                            icon={iconForTone(tone)}
                        />
                    ))}
                    <div className="pt-2 border-t border-border" />
                    {CALLOUT_TONES.map((tone) => (
                        <Callout
                            key={`strong-${tone}`}
                            tone={tone}
                            variant="strong"
                            eyebrow={`${tone} · strong`}
                            title={`${cap(tone)} callout title`}
                            body="Strong variant · higher contrast for critical prompts."
                            icon={iconForTone(tone)}
                            actions={<Button variant="ghost" className="!py-1 !px-2 !text-xs">Dismiss</Button>}
                        />
                    ))}
                </div>
            </section>

            {/* ─── ProgressBar ────────────────────────────────────────────── */}
            <section>
                <PreviewHeader
                    title="ProgressBar"
                    desc="Thin horizontal progress atom. Tones: brand · success · warning · ai · info · danger. Heights: xs · sm · md. Supports indeterminate pulse."
                />
                <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
                    {(['brand', 'success', 'warning', 'ai', 'info', 'danger'] as const).map((tone, i) => (
                        <div key={tone} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{tone}</span>
                                <span className="text-foreground font-mono">{20 + i * 15}%</span>
                            </div>
                            <ProgressBar value={20 + i * 15} tone={tone} height="sm" />
                        </div>
                    ))}
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">indeterminate · ai · xs / sm / md</div>
                        <ProgressBar tone="ai" height="xs" indeterminate />
                        <ProgressBar tone="ai" height="sm" indeterminate />
                        <ProgressBar tone="ai" height="md" indeterminate />
                    </div>
                </div>
            </section>

            {/* ─── PageShell ──────────────────────────────────────────────── */}
            <section>
                <PreviewHeader
                    title="PageShell"
                    desc="Page-level layout wrapper. Renders a tenant crumb + title + subtitle + iconed tone pill + right-aligned actions. Body slot is caller-owned. Preview shows a miniature version with topPadding='none' + maxWidth='4xl'."
                />
                <div className="rounded-2xl border border-border overflow-hidden">
                    <PageShell
                        title="PO Workspace"
                        subtitle="Where Strata turns purchase orders into sales orders"
                        icon={<Sparkles className="size-5" />}
                        iconTone="brand"
                        tenantCrumb={<><span className="font-medium uppercase tracking-wider">LF</span><span>·</span><span>Strata for Leland</span></>}
                        actions={<Button variant="outline" className="!py-1 !px-3 !text-xs">Action</Button>}
                        maxWidth="4xl"
                        topPadding="none"
                    >
                        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                            Body slot · caller-owned. In production this holds the canvas/scene.
                        </div>
                    </PageShell>
                </div>
            </section>

            {/* ─── PipelineRail ───────────────────────────────────────────── */}
            <section>
                <PreviewHeader
                    title="PipelineRail"
                    desc="Vertical stepper / sidebar rail for guided flows. Steps derive state from currentId (done · active · pending). Props are explicit — no context coupling."
                />
                <div className="flex rounded-2xl border border-border overflow-hidden bg-card min-h-[320px]">
                    <PipelineRail
                        groupTitle="Pipeline"
                        currentId="s3"
                        onStepClick={(id) => console.log('clicked', id)}
                        steps={[
                            { id: 's1', label: 'Strata picks up the purchase order', sub: 'Auto · System' },
                            { id: 's2', label: 'Matching quote found',              sub: 'Auto · System' },
                            { id: 's3', label: 'Catches a price difference',        sub: 'Auto · System' },
                            { id: 's4', label: 'Reviewer approves the catch',       sub: 'Manual · Expert' },
                            { id: 's5', label: 'Order built in the order system',   sub: 'Auto · System' },
                            { id: 's6', label: 'Comments and rebate applied',       sub: 'Auto · System' },
                        ]}
                    />
                    <div className="flex-1 p-6 text-sm text-muted-foreground">
                        Caller-owned content pane. Rail on the left · content on the right.
                    </div>
                </div>
            </section>

            {/* ─── Button · brand-glow variant ────────────────────────────── */}
            <section>
                <PreviewHeader
                    title="Button · brand-glow variant"
                    desc="Primary CTA with the lime shadow that Leland (StepCompletionCta, JoshuaReviewCard) used inline. Kept as a Tailwind arbitrary shadow · no new token needed."
                />
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
                    <Button variant="primary">Primary (baseline)</Button>
                    <Button variant="brand-glow">Brand glow</Button>
                    <Button variant="brand-glow" className="!px-6 !py-3 !text-base">Brand glow · large</Button>
                    <Button variant="outline">Outline (comparison)</Button>
                </div>
            </section>
        </div>
    );
}

function PreviewHeader({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="mb-3">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground max-w-3xl mt-1">{desc}</p>
        </div>
    );
}

function iconForTone(tone: CalloutTone) {
    switch (tone) {
        case 'brand':   return <Sparkles className="size-4" />;
        case 'success': return <CheckCircle2 className="size-4" />;
        case 'warning': return <AlertTriangle className="size-4" />;
        case 'ai':      return <Zap className="size-4" />;
        case 'info':    return <Info className="size-4" />;
        case 'danger':  return <ShieldCheck className="size-4" />;
    }
}

function cap(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
