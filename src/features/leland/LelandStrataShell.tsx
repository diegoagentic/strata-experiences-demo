// ═══════════════════════════════════════════════════════════════════════════════
// LelandStrataShell — PO Workspace ⭐ (the protagonist app)
//
// Phase L1.A-C: structural shell with PipelineRail + Main Canvas + step echo.
// Per-step canvas content (PoExtractionPreview, QuoteSearchChain, etc.)
// arrives in subsequent L1 sub-phases.
// ═══════════════════════════════════════════════════════════════════════════════

import { Sparkles } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { HERO_PO_HAPPY } from '../../config/profiles/leland-data';
import LelandPageShell from './components/LelandPageShell';
import PipelineRail from './components/PipelineRail';
import PoExtractionPreview from './components/PoExtractionPreview';
import QuoteSearchChain from './components/QuoteSearchChain';
import PriceComparisonTable from './components/PriceComparisonTable';
import ConfigOverviewCanvas from './components/ConfigOverviewCanvas';
import RpaBotCanvas from './components/RpaBotCanvas';
import CommentsRebateCanvas from './components/CommentsRebateCanvas';
import EnteredCelebration from './components/EnteredCelebration';
import RevealMetrics from './components/RevealMetrics';

export default function LelandStrataShell() {
    const { currentStep, isDemoActive } = useDemo();

    // Show the rail only for the main pipeline (group 1, 8 steps).
    // Briefing (group 0) and Reveal (group 2) are single-step framing scenes.
    const railGroupId = currentStep?.groupId ?? 1;
    const showRail = railGroupId === 1;
    const railTitle = 'Pipeline progress';

    return (
        <LelandPageShell
            title="PO Workspace"
            subtitle="Where Strata turns purchase orders into sales orders"
            icon={<Sparkles className="size-5" />}
            iconTone="brand"
            actions={
                <PersistentPoHeader />
            }
        >
            <div className="flex gap-0 rounded-2xl border border-border bg-card overflow-hidden min-h-[640px]">
                {showRail && (
                    <PipelineRail groupId={railGroupId} groupTitle={railTitle} />
                )}

                <main className="flex-1 min-w-0 p-6">
                    {isDemoActive && currentStep ? (
                        <>
                            <div className="mb-4">
                                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                                    Step {currentStep.id} · {currentStep.role}
                                </div>
                                <h2 className="mt-1 text-xl font-bold text-foreground">{currentStep.title}</h2>
                                <p className="mt-2 text-[13.5px] text-muted-foreground leading-6 max-w-3xl">
                                    {currentStep.description}
                                </p>
                            </div>

                            <StepCanvas stepId={currentStep.id} />
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-center">
                            <div>
                                <Sparkles className="size-10 text-brand-400 dark:text-brand-300 mx-auto mb-3" />
                                <h2 className="text-lg font-bold text-foreground">PO-to-Order pipeline</h2>
                                <p className="mt-2 text-[13px] text-muted-foreground max-w-md">
                                    Start the demo to see Strata pick up a PO from HubSpot, validate it against Seradex, and post the SO — happy path or exception.
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </LelandPageShell>
    );
}

/**
 * StepCanvas — routes currentStep.id to the right per-step component.
 * Steps without a dedicated canvas yet fall back to a placeholder card.
 */
function StepCanvas({ stepId }: { stepId: string }) {
    switch (stepId) {
        case 'l1.1':
            return <PoExtractionPreview key={stepId} />;
        case 'l1.2':
            return <QuoteSearchChain key={stepId} />;
        case 'l1.3':
            return <PriceComparisonTable key={stepId} />;
        case 'l1.5':
            return <ConfigOverviewCanvas key={stepId} />;
        case 'l1.6':
            return <RpaBotCanvas key={stepId} />;
        case 'l1.7':
            return <CommentsRebateCanvas key={stepId} />;
        case 'l1.8':
            return <EnteredCelebration key={stepId} />;
        case 'l2.1':
            return <RevealMetrics key={stepId} />;
        default:
            return <PlaceholderCanvas stepId={stepId} />;
    }
}

function PlaceholderCanvas({ stepId }: { stepId: string }) {
    return (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
            <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Main Canvas placeholder
            </div>
            <p className="mt-2 text-[13px] text-muted-foreground max-w-xl mx-auto">
                Per-step content for <span className="font-mono text-foreground">{stepId}</span> arrives in upcoming L1 sub-phases.
            </p>
        </div>
    );
}

/** Compact PO header chip — lives in the LelandPageShell `actions` slot */
function PersistentPoHeader() {
    return (
        <div className="hidden md:flex items-center gap-3 text-[12px] text-muted-foreground bg-muted/40 border border-border rounded-full px-3 py-1.5">
            <span>
                PO <span className="font-mono text-foreground">{HERO_PO_HAPPY.poNumber}</span>
            </span>
            <span>·</span>
            <span className="truncate max-w-[140px]">{HERO_PO_HAPPY.dealer}</span>
            <span>·</span>
            <span className="font-mono text-foreground">${HERO_PO_HAPPY.total.toLocaleString()}</span>
        </div>
    );
}
