// ═══════════════════════════════════════════════════════════════════════════════
// LelandReviewQueueApp — Joshua's Review Queue (exceptions only)
//
// Phase L1.D: shell wrapped in LelandPageShell. Used in step l2.9
// (interactive). Real queue list + packed exception detail card arrive in
// Phase L3.
// ═══════════════════════════════════════════════════════════════════════════════

import { ShieldCheck } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import LelandPageShell from './components/LelandPageShell';
import JoshuaReviewCard from './components/JoshuaReviewCard';

export default function LelandReviewQueueApp() {
    const { currentStep, isDemoActive } = useDemo();
    const isReviewStep = currentStep?.id === 'l1.4';

    return (
        <LelandPageShell
            title="Review queue"
            subtitle="The Reviewer only sees what needs a human decision"
            icon={<ShieldCheck className="size-5" />}
            iconTone="amber"
        >
            {isDemoActive && isReviewStep ? (
                <JoshuaReviewCard />
            ) : (
                <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
                    <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Queue idle
                    </div>
                    <p className="mt-2 text-[13px] text-muted-foreground max-w-xl mx-auto">
                        Strata routes work here only when a catch needs a human decision.
                    </p>
                </section>
            )}
        </LelandPageShell>
    );
}
