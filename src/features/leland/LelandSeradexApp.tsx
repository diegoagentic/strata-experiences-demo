// ═══════════════════════════════════════════════════════════════════════════════
// LelandSeradexApp — Seradex ERP mock (quote viewer · customer registry · SO output)
//
// Phase L1.D: shell wrapped in LelandPageShell. Real RPA Bot Canvas + Quote
// PDF render arrive in Phase L2 (steps l1.7, l1.8, l2.10).
// ═══════════════════════════════════════════════════════════════════════════════

import { Database } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import LelandPageShell from './components/LelandPageShell';

export default function LelandSeradexApp() {
    const { currentStep, isDemoActive } = useDemo();

    return (
        <LelandPageShell
            title="Order System"
            subtitle="Quotes · customers · sales orders"
            icon={<Database className="size-5" />}
            iconTone="indigo"
        >
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Phase L0 stub · current step
                </div>
                {isDemoActive && currentStep ? (
                    <>
                        <div className="mt-1 text-[12px] font-mono text-indigo-600 dark:text-indigo-400">
                            {currentStep.id} · {currentStep.role}
                        </div>
                        <h2 className="mt-3 text-lg font-bold text-foreground">{currentStep.title}</h2>
                        <p className="mt-2 text-[13.5px] text-muted-foreground leading-6 max-w-3xl">
                            {currentStep.description}
                        </p>
                    </>
                ) : (
                    <div className="mt-3 text-[13.5px] text-muted-foreground">
                        The order system is where Strata builds the sales order automatically.
                    </div>
                )}
            </section>

            <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
                <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Order system placeholder
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground max-w-xl mx-auto">
                    Quotes · customers · sales order entry — surfaced when the pipeline reaches the build step.
                </p>
            </section>
        </LelandPageShell>
    );
}
