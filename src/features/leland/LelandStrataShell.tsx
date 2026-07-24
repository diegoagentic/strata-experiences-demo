// ═══════════════════════════════════════════════════════════════════════════════
// LelandStrataShell — PO Workspace ⭐ (the protagonist app)
//
// Phase L1.A-C: structural shell with PipelineRail + Main Canvas + step echo.
// Per-step canvas content (PoExtractionPreview, QuoteSearchChain, etc.)
// arrives in subsequent L1 sub-phases.
// ═══════════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
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
import JoshuaReviewCard from './components/JoshuaReviewCard';

// F31 · Diego 2026-07-23 · orden lineal de los 9 steps del Pipeline
// navegables desde el hero PO Workspace (excluye 'l0.1' que vive en
// LelandInboxApp). Usado por el stepper flotante fuera de tour.
const LELAND_STEP_ORDER: string[] = [
    'l1.1',  // Strata picks up the PO
    'l1.2',  // Quote search chain
    'l1.3',  // Price comparison
    'l1.4',  // Joshua review
    'l1.5',  // Config overview
    'l1.6',  // RPA bot
    'l1.7',  // Comments & rebate
    'l1.8',  // Entered celebration
    'l2.1',  // Reveal metrics
];

const STEP_LABELS: Record<string, string> = {
    'l1.1': 'Strata picks up the PO',
    'l1.2': 'Quote search · chain retrieval',
    'l1.3': 'Price comparison · catch mismatches',
    'l1.4': 'Peer review · Joshua approves',
    'l1.5': 'Config overview · line items',
    'l1.6': 'RPA bot · post to Seradex',
    'l1.7': 'Comments + rebate applied',
    'l1.8': 'Sales Order entered · celebration',
    'l2.1': 'Reveal · impact metrics',
};

export default function LelandStrataShell() {
    const { currentStep, isDemoActive, nextStep, goToStep, steps: profileSteps } = useDemo();

    // F31 · Manual step index para navegación fuera de tour · default 0
    // = 'l1.1' (primer step del Pipeline · PoExtractionPreview).
    const [manualStepIdx, setManualStepIdx] = useState(0);
    // F31 · Reset counter · forza remount del StepCanvas via key wrapper.
    // Limpia state interno de todos los scenes children sin editarlos
    // individualmente (autoplay phase de QuoteSearchChain, resolved de
    // JoshuaReviewCard, cascade de PoExtractionPreview, etc).
    const [resetTick, setResetTick] = useState(0);

    // F31 · Sync manualStepIdx cuando el tour avanza a un step del array ·
    // así al terminar el tour el user retoma navegación desde el último
    // step visto.
    useEffect(() => {
        if (!isDemoActive || !currentStep) return;
        const idx = LELAND_STEP_ORDER.indexOf(currentStep.id);
        if (idx >= 0) setManualStepIdx(idx);
    }, [isDemoActive, currentStep]);

    // F31 · stepId dual · si tour activo deriva de currentStep · si no
    // deriva del manualStepIdx. Fallback siempre 'l1.1'.
    const stepId = isDemoActive
        ? (currentStep?.id ?? 'l1.1')
        : (LELAND_STEP_ORDER[manualStepIdx] ?? 'l1.1');

    // F31 · Handlers dual · con tour delegan a nextStep del context · fuera
    // navegan el manualStepIdx en LELAND_STEP_ORDER.
    const handleManualNext = useCallback(() => {
        if (isDemoActive) { nextStep(); return; }
        setManualStepIdx(i => Math.min(i + 1, LELAND_STEP_ORDER.length - 1));
    }, [isDemoActive, nextStep]);
    const handleManualPrev = useCallback(() => {
        if (isDemoActive) return;
        setManualStepIdx(i => Math.max(i - 1, 0));
    }, [isDemoActive]);
    const handleResetClick = useCallback(() => {
        setResetTick(t => t + 1);
        setManualStepIdx(0);
        if (isDemoActive) goToStep(0);
    }, [isDemoActive, goToStep]);

    // F31 · Header info derivado del step visible · con tour usa
    // currentStep · fuera busca el step correspondiente en el profile.
    const activeStepMeta = useMemo(() => {
        if (isDemoActive && currentStep) return currentStep;
        return profileSteps.find(s => s.id === stepId) ?? null;
    }, [isDemoActive, currentStep, profileSteps, stepId]);

    // Show the rail only for the main pipeline (group 1, 8 steps).
    // Briefing (group 0) and Reveal (group 2) are single-step framing scenes.
    const railGroupId = activeStepMeta?.groupId ?? 1;
    const showRail = railGroupId === 1;
    const railTitle = 'Pipeline progress';

    const totalSteps = LELAND_STEP_ORDER.length;

    // F31 · Botón Reset visible en el header (via prop actions del
    // LelandPageShell) · pattern F30 BFI + F26 CLC + F29.f Officeworks.
    const resetButton = (
        <button
            type="button"
            onClick={handleResetClick}
            aria-label="Reset the PO-to-Order flow to the initial state"
            title="Reset the flow to the first step · clears scene interaction state"
            className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset flow
        </button>
    );

    // F31 · Stepper flotante · pattern F30.c BFI · fixed top-24 z-[60]
    // pill glassmorphism. Visible solo fuera de tour · con tour el
    // DemoGuide sidebar toma control.
    const stepperInline = !isDemoActive ? (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/95 backdrop-blur-xl shadow-lg">
            <button
                type="button"
                onClick={handleManualPrev}
                disabled={manualStepIdx === 0}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-foreground bg-muted hover:bg-muted/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Previous step"
            >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Prev
            </button>
            <div className="flex flex-col items-center px-3 min-w-0 max-w-xs">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Pipeline · Step {manualStepIdx + 1} of {totalSteps}
                </p>
                <p className="text-xs font-semibold text-foreground truncate max-w-full">
                    {STEP_LABELS[stepId] ?? stepId}
                </p>
            </div>
            <button
                type="button"
                onClick={handleResetClick}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                aria-label="Reset to first step"
                title="Reset the pipeline to the first step"
            >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset
            </button>
            <button
                type="button"
                onClick={handleManualNext}
                disabled={manualStepIdx >= totalSteps - 1}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Next step"
            >
                Next
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
        </div>
    ) : null;

    return (
        <>
            <LelandPageShell
                title="PO Workspace"
                subtitle="Where Strata turns purchase orders into sales orders"
                icon={<Sparkles className="size-5" />}
                iconTone="brand"
                actions={
                    <div className="flex items-center gap-3">
                        <PersistentPoHeader />
                        {resetButton}
                    </div>
                }
            >
                <div className="flex gap-0 rounded-2xl border border-border bg-card overflow-hidden min-h-[640px]">
                    {showRail && (
                        <PipelineRail groupId={railGroupId} groupTitle={railTitle} />
                    )}

                    <main className="flex-1 min-w-0 p-6">
                        {/* F31 · StepCanvas SIEMPRE visible · reemplaza el empty
                            state anterior "PO-to-Order pipeline · Start the demo".
                            El scene se determina por el stepId dual (tour o
                            manual). Diego 2026-07-23. */}
                        {activeStepMeta && (
                            <div className="mb-4">
                                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                                    Step {activeStepMeta.id} · {activeStepMeta.role}
                                </div>
                                <h2 className="mt-1 text-xl font-bold text-foreground">{activeStepMeta.title}</h2>
                                <p className="mt-2 text-[13.5px] text-muted-foreground leading-6 max-w-3xl">
                                    {activeStepMeta.description}
                                </p>
                            </div>
                        )}

                        <StepCanvas key={`${stepId}-${resetTick}`} stepId={stepId} />
                    </main>
                </div>
            </LelandPageShell>
            {stepperInline}
        </>
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
        case 'l1.4':
            // F31 · l1.4 canónicamente vive en LelandReviewQueueApp (tab
            // Review Queue) · lo inlineamos aquí para que fuera de tour
            // el user vea el content sin cambiar de tab.
            return <JoshuaReviewCard key={stepId} />;
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
