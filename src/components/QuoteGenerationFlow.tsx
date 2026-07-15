import React, { useState, useEffect } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import SmartQuoteHub from './widgets/SmartQuoteHub';
import QuoteExtractionArtifact from './gen-ui/artifacts/QuoteExtractionArtifact';
import AssetReviewArtifact from './gen-ui/artifacts/AssetReviewArtifact';
import QuoteApprovedArtifact from './gen-ui/artifacts/QuoteApprovedArtifact';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for conditional classNames
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface QuoteGenerationFlowProps {
    onNavigate: (path: string) => void;
    onComplete?: () => void;
}

export default function QuoteGenerationFlow({ onNavigate, onComplete }: QuoteGenerationFlowProps) {
    const [phase, setPhase] = useState<'IDLE' | 'ANALYZING' | 'REVIEW_NEEDED' | 'APPROVED' | 'ORDERED'>('IDLE');
    const [isHighlighted, setIsHighlighted] = useState(false);

    useEffect(() => {
        const handleHighlight = (e: CustomEvent) => {
            if (e.detail === 'quote-flow') {
                setIsHighlighted(true);
                // Automatically remove highlight after 4 seconds
                setTimeout(() => setIsHighlighted(false), 4000);
            }
        };
        window.addEventListener('demo-highlight', handleHighlight as EventListener);
        return () => window.removeEventListener('demo-highlight', handleHighlight as EventListener);
    }, []);

    // Mock data for review Phase
    const reviewData = {
        fileName: "Client_Request_Draft.pdf",
        totalValue: 134250,
        assetCount: 142,
        issues: [
            { id: 1, type: "ambiguity", critical: true },
            { id: 2, type: "missing", critical: false }
        ]
    }

    const handleUploadStart = () => {
        setIsHighlighted(false); // remove highlight on interaction
        setPhase('ANALYZING');
    }

    const handleAnalysisComplete = () => {
        setPhase('REVIEW_NEEDED');
    }

    const handleReviewComplete = () => {
        setPhase('APPROVED');
    }

    const handlePOAdded = () => {
        setPhase('ORDERED');
    }

    if (phase === 'IDLE') {
        return (
            <div className={cn(
                "transition-all duration-700 ease-in-out rounded-2xl",
                isHighlighted && "ring-4 ring-brand-500 ring-offset-4 ring-offset-background shadow-[0_0_30px_rgba(var(--brand-500),0.6)] animate-pulse"
            )}>
                <SmartQuoteHub onNavigate={onNavigate} onUploadStart={handleUploadStart} />
            </div>
        );
    }

    if (phase === 'ANALYZING') {
        return <QuoteExtractionArtifact fileName="Client_Request_Draft.pdf" onComplete={handleAnalysisComplete} />;
    }

    if (phase === 'REVIEW_NEEDED') {
        return <AssetReviewArtifact data={reviewData} onApprove={handleReviewComplete} onBack={() => setPhase('ANALYZING')} source="upload" />;
    }

    if (phase === 'APPROVED') {
        return (
            <div className="h-full w-full max-w-4xl min-h-[450px]">
                <QuoteApprovedArtifact onGeneratePO={handlePOAdded} />
            </div>
        );
    }

    if (phase === 'ORDERED') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-border shadow-sm animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <SparklesIcon className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-3xl font-bold font-brand text-foreground mb-4">Order Placed Successfully!</h3>
                <p className="text-muted-foreground text-center max-w-md mb-8">
                    PO #ORD-7829 has been generated and sent to the vendor. You can track its status in the Orders tab.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setPhase('IDLE');
                            if (onComplete) onComplete();
                        }}
                        className="px-6 py-2 bg-muted text-foreground font-medium rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        Start Over
                    </button>
                    <button
                        onClick={() => {
                            setPhase('IDLE');
                            localStorage.setItem('demo_view_order_id', 'ORD-7829');
                            onNavigate('order-detail');
                            if (onComplete) onComplete();
                        }}
                        className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg shadow-sm hover:bg-primary/90 transition-colors"
                    >
                        View Order Details
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
