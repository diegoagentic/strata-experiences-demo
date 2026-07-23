/**
 * COMPONENT: AgencyFeeVerifyScene (a1.4)
 * PURPOSE: Agency Fee step 4 — Patricia reviews fee vs MK Invoice.
 *
 * FLOW:
 *   Action Center notification appears after 2s (from Lauren — invoice forwarded)
 *   → click CTA → modal opens (step="fee") → Patricia reviews
 *   → optionally "Return to Lauren" back-channel
 *   → "Confirm Fee" → modal closes → success banner → card moves to Fee Verify (col 4)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

interface AgencyFeeVerifySceneProps {
    onComplete?: () => void
    onReset?: () => void
}

export default function AgencyFeeVerifyScene({ onComplete, onReset }: AgencyFeeVerifySceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const scenario = 'match' as const
    const [isModalOpen,  setIsModalOpen]  = useState(false)
    const [kanbanCol,    setKanbanCol]    = useState<3 | 4>(3)
    const [verified,     setVerified]     = useState(false)

    useEffect(() => {
        const handler = () => setIsModalOpen(true)
        window.addEventListener('bfi:fee-open', handler)
        return () => window.removeEventListener('bfi:fee-open', handler)
    }, [])

    const handleOpenModal = () => setIsModalOpen(true)

    const handleValidate = () => {
        setIsModalOpen(false)
        setVerified(true)
        setKanbanCol(4)
        setTimeout(pauseAware(() => { onComplete?.(); nextStep() }), 1400)
    }

    return (
        <div className="space-y-3">

            {/* Closing dashboard — order summary after verification */}
            {verified && (
                <div className="rounded-xl border border-success/20 bg-success/5 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <div className="px-4 py-3 border-b border-success/20 bg-success/10 flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-foreground">Order DOE-2847 closed · all reconciled</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Agency fee verified · matches contract · ready for AR posting</p>
                        </div>
                        <span className="text-[8px] font-bold text-success bg-success/15 border border-success/30 px-2 py-1 rounded uppercase tracking-wider">Closed</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-4 py-3 text-[11px]">
                        <div className="flex justify-between"><span className="text-muted-foreground">Product total</span><span className="font-mono text-foreground">$235,560</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Labor final</span><span className="font-mono text-foreground">$6,920</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">PO total</span><span className="font-mono font-bold text-foreground">$242,480</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">CMF Free line</span><span className="font-mono font-bold text-success">+$9,255.24 Day-1 GP</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">GP recognized</span><span className="font-mono text-foreground">avg 4.0%</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-mono text-foreground">Closed · day 1</span></div>
                    </div>
                </div>
            )}

            {/* Process Kanban */}
            <BFIProcessKanban
                activeCol={kanbanCol}
                showDoe={true}
                doeSubtitle={kanbanCol === 3
                    ? 'Quote Tool invoice attached · fee verification pending'
                    : 'Agency fee verified · $9,255.24 · order closed'
                }
                onReviewDoe={!verified ? handleOpenModal : undefined}
                highlightReview={!verified}
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · verifying agency fee…
            </p>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />

            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="fee"
                scenario={scenario}
                onValidate={handleValidate}
                onReset={onReset}
            />
        </div>
    )
}
