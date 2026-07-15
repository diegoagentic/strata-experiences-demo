/**
 * COMPONENT: ConfigOverviewCanvas
 * PURPOSE: Step l1.5 canvas — combines customer/address validation, product
 *          configuration cascade, and laminate validation in a single panel.
 *          Each section reveals in sequence as Strata processes them.
 *
 * USED BY: LelandStrataShell when currentStep.id === 'l1.5'
 */

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Users, Package, Spool, Truck } from 'lucide-react';
import StatusBadge from '../../../components/shared/StatusBadge';
import StepCompletionCta from './StepCompletionCta';
import { usePauseAware } from '../../../context/usePauseAware';
import { HERO_PO_HAPPY } from '../../../config/profiles/leland-data';

type Section = 'customer' | 'config' | 'laminate' | 'freight';
const SECTIONS: Section[] = ['customer', 'config', 'laminate', 'freight'];

interface ConfigOverviewCanvasProps {
    autoplay?: boolean;
    perSectionDelay?: number;
}

export default function ConfigOverviewCanvas({ autoplay = true, perSectionDelay = 1100 }: ConfigOverviewCanvasProps) {
    const [phase, setPhase] = useState(autoplay ? 0 : SECTIONS.length);
    const { pauseAwareTimeout } = usePauseAware();

    useEffect(() => {
        if (!autoplay || phase >= SECTIONS.length) return;
        return pauseAwareTimeout(() => setPhase(p => p + 1), perSectionDelay);
    }, [autoplay, phase, perSectionDelay, pauseAwareTimeout]);

    const stateOf = (s: Section): 'pending' | 'running' | 'done' => {
        const i = SECTIONS.indexOf(s);
        if (i < phase) return 'done';
        if (i === phase) return 'running';
        return 'pending';
    };

    return (
        <div className="space-y-3">
            <ConfigSection
                state={stateOf('customer')}
                title="Customer & address validation"
                icon={<Users className="h-3.5 w-3.5" />}
            >
                <CustomerValidation />
            </ConfigSection>

            <ConfigSection
                state={stateOf('config')}
                title="Product configuration · 3 line items"
                icon={<Package className="h-3.5 w-3.5" />}
            >
                <LineItemsConfig />
            </ConfigSection>

            <ConfigSection
                state={stateOf('laminate')}
                title="Laminate validation"
                icon={<Spool className="h-3.5 w-3.5" />}
            >
                <LaminateValidation />
            </ConfigSection>

            <ConfigSection
                state={stateOf('freight')}
                title="Freight calculation"
                icon={<Truck className="h-3.5 w-3.5" />}
            >
                <FreightCalc />
            </ConfigSection>

            {phase >= SECTIONS.length && (
                <div className="flex items-center gap-2 text-xs text-success bg-success/5 border border-success/20 rounded-lg px-3 py-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>All checks clean · ready for SO generation in Seradex</span>
                </div>
            )}

            <StepCompletionCta
                visible={phase >= SECTIONS.length}
                label="Build the order in the order system"
                hint="Hand off to the automated form fill"
            />
        </div>
    );
}

// ─── Section wrapper ────────────────────────────────────────────────────────

interface ConfigSectionProps {
    state: 'pending' | 'running' | 'done';
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

function ConfigSection({ state, title, icon, children }: ConfigSectionProps) {
    return (
        <div
            className={`
                rounded-xl border bg-card transition-colors
                ${state === 'done' ? 'border-success/30' : ''}
                ${state === 'running' ? 'border-ai/40 ring-1 ring-ai/30' : ''}
                ${state === 'pending' ? 'border-border opacity-60' : ''}
            `}
        >
            <div className={`px-3 py-2 border-b border-border/60 flex items-center justify-between ${state === 'pending' ? '' : 'bg-muted/20'}`}>
                <div className="flex items-center gap-2">
                    <div
                        className={`
                            size-6 rounded-md flex items-center justify-center
                            ${state === 'done' ? 'bg-success/15 text-success' : ''}
                            ${state === 'running' ? 'bg-ai/15 text-ai' : ''}
                            ${state === 'pending' ? 'bg-muted text-muted-foreground' : ''}
                        `}
                    >
                        {icon}
                    </div>
                    <span className="text-[12px] font-bold text-foreground">{title}</span>
                </div>
                {state === 'done' && <StatusBadge label="OK" tone="success" size="xs" icon={<CheckCircle2 className="h-2.5 w-2.5" />} />}
                {state === 'running' && <StatusBadge label="Processing" tone="ai" size="xs" icon={<Loader2 className="h-2.5 w-2.5 animate-spin" />} />}
                {state === 'pending' && <span className="text-[10px] text-muted-foreground">queued</span>}
            </div>
            {state !== 'pending' && <div className="px-3 py-3 animate-in fade-in duration-200">{children}</div>}
        </div>
    );
}

// ─── Section bodies ─────────────────────────────────────────────────────────

function CustomerValidation() {
    const po = HERO_PO_HAPPY;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
            <ValidationRow label="Customer" value={po.dealer} ok>
                <span className="text-muted-foreground text-[11px]">Found in the order system</span>
            </ValidationRow>
            <ValidationRow label="Bill To" value={po.dealer} ok>
                <span className="text-muted-foreground text-[11px]">Address valid · required state present</span>
            </ValidationRow>
            <ValidationRow label="Ship To" value={`${po.shipTo.name} · ${po.shipTo.city}, ${po.shipTo.state}`} ok>
                <span className="text-muted-foreground text-[11px]">Address valid · shipping zone resolved</span>
            </ValidationRow>
            <ValidationRow label="Contract" value="Government · standard discount" ok>
                <span className="text-muted-foreground text-[11px]">Government price list applied</span>
            </ValidationRow>
        </div>
    );
}

function LineItemsConfig() {
    const po = HERO_PO_HAPPY;
    return (
        <div className="space-y-1.5">
            <div className="grid grid-cols-[60px_minmax(140px,1fr)_70px_120px_60px_auto] gap-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <div>Line</div>
                <div>SKU</div>
                <div className="text-right">Qty</div>
                <div className="text-right">Total</div>
                <div>Zone</div>
                <div className="text-right">Status</div>
            </div>
            {po.lineItems.map((li, i) => (
                <div
                    key={li.sku}
                    className="grid grid-cols-[60px_minmax(140px,1fr)_70px_120px_60px_auto] gap-2 px-2 py-2 items-center text-[12px] rounded-lg bg-muted/20 animate-in fade-in slide-in-from-left-2 duration-300"
                    style={{ animationDelay: `${i * 120}ms` }}
                >
                    <div className="font-mono tabular-nums text-muted-foreground">{li.line}</div>
                    <div className="font-mono font-bold text-foreground truncate">{li.sku}</div>
                    <div className="text-right tabular-nums text-muted-foreground">×{li.qty}</div>
                    <div className="text-right font-mono tabular-nums text-foreground">${(li.unitPrice * li.qty).toLocaleString()}</div>
                    <div className="text-[10.5px] text-muted-foreground">2</div>
                    <div className="text-right">
                        <StatusBadge label="Configured" tone="success" size="xs" icon={<CheckCircle2 className="h-2.5 w-2.5" />} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function LaminateValidation() {
    const lam = HERO_PO_HAPPY.lineItems[0].laminate!;
    return (
        <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-full bg-muted/40 border border-border px-3 py-1.5">
                <Spool className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[12px] text-foreground font-semibold">{lam.vendor}</span>
                <span className="text-[11px] text-muted-foreground">·</span>
                <span className="text-[11px] text-foreground">{lam.selection}</span>
            </div>
            <StatusBadge label={`Pattern ${lam.pattern} · standard`} tone="success" size="sm" icon={<CheckCircle2 className="h-2.5 w-2.5" />} />
            <span className="text-[11px] text-muted-foreground">No upcharge · COM yardage 0.75 yd</span>
        </div>
    );
}

function FreightCalc() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[12px]">
            <FreightCell label="Zone 2" value="Base" />
            <FreightCell label="Subtotal" value="$148.50" />
            <FreightCell label="Engineering" value="excluded" muted />
            <FreightCell label="Final freight" value="$148.50" highlight />
        </div>
    );
}

function FreightCell({ label, value, muted, highlight }: { label: string; value: string; muted?: boolean; highlight?: boolean }) {
    return (
        <div className={`rounded-lg border px-3 py-2 ${highlight ? 'border-success/30 bg-success/5' : 'border-border bg-muted/20'}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className={`text-[13px] font-mono font-bold mt-0.5 tabular-nums ${muted ? 'text-muted-foreground' : highlight ? 'text-success' : 'text-foreground'}`}>{value}</div>
        </div>
    );
}

// ─── Atoms ─────────────────────────────────────────────────────────────────

function ValidationRow({ label, value, ok, children }: { label: string; value: string; ok: boolean; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
                {ok && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
            </div>
            <div className="text-[13px] font-semibold text-foreground truncate">{value}</div>
            <div className="mt-1">{children}</div>
        </div>
    );
}
