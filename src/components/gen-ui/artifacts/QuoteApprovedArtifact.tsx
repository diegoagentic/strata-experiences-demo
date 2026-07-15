import { useState } from 'react'
import { CheckCircleIcon, DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline'
import { useGenUI } from '../../../context/GenUIContext'
import OrderSimulationArtifact from './OrderSimulationArtifact'

interface QuoteApprovedArtifactProps {
    onGeneratePO?: () => void;
}

export default function QuoteApprovedArtifact({ onGeneratePO }: QuoteApprovedArtifactProps) {
    const { pushSystemArtifact } = useGenUI()
    const [actionTaken, setActionTaken] = useState<'po' | 'simulate' | null>(null)

    const handleGeneratePO = () => {
        setActionTaken('po')
        pushSystemArtifact(
            "I've generated the official Purchase Order and sent it to the vendor.",
            {
                id: 'art_order_placed_' + Date.now(),
                type: 'order_placed',
                data: {},
                source: 'Quote Approved',
            }
        )
        if (onGeneratePO) {
            onGeneratePO();
        }
    }

    const handleSimulate = () => {
        setActionTaken('simulate')
    }

    if (actionTaken === 'simulate') {
        return (
            <div className="w-full max-w-4xl h-[600px] -ml-2 -mt-2 shadow-lg rounded-2xl overflow-hidden border border-border bg-card">
                <OrderSimulationArtifact
                    onBack={() => setActionTaken(null)}
                    onGeneratePO={handleGeneratePO}
                />
            </div>
        )
    }

    if (actionTaken === 'po') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted dark:bg-zinc-800/50 animate-in fade-in zoom-in duration-300 h-full">
                <div className="bg-white/90 dark:bg-zinc-900/90 p-4 rounded-xl border border-border shadow-sm flex items-center gap-3 text-left">
                    <div className="w-10 h-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center shrink-0">
                        <DocumentTextIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-foreground">PO Generation Started</h4>
                        <p className="text-xs text-muted-foreground">Action has moved to the next step below.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-green-100 dark:border-green-900 shadow-sm animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold font-brand text-foreground mb-2">Quote Approved</h3>
            <p className="text-muted-foreground text-center max-w-md mb-8">
                The quote has been validated and approved. You can now generate the Purchase Order.
            </p>
            <button
                onClick={handleGeneratePO}
                className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
            >
                <DocumentTextIcon className="w-5 h-5" />
                Generate Purchase Order
            </button>
            <button
                onClick={handleSimulate}
                className="mt-6 text-sm font-medium text-muted-foreground hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-2"
            >
                <EyeIcon className="w-4 h-4" />
                Simulate Benefit View
            </button>
        </div>
    )
}
