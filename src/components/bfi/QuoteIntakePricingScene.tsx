/**
 * COMPONENT: QuoteIntakePricingScene (a1.2b — unified)
 * PURPOSE: Agency Fee a1.2b — Quote Tool validation + CMF Free line booking + Labor Quote Request.
 *
 * The modal opens at step="quote" and stays there. After the CMF Free line is confirmed,
 * QuoteReviewPanel internally opens a LaborQuoteDialog overlay (email composer pattern,
 * consistent with SendProposalDialog/NancyDialog). When the labor quote is received and
 * Lauren clicks Continue, the dialog completes → onValidate fires → modal closes →
 * wizard advances to a1.2b3 (Send Proposal). Wizard has 13 steps (no a1.2b2).
 */

import { useState } from 'react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

interface QuoteIntakePricingSceneProps {
    onApply?: () => void
    onReset?: () => void
}

const ACTIVE_COL = 1  // Quote

export default function QuoteIntakePricingScene({ onApply, onReset }: QuoteIntakePricingSceneProps) {
    const { nextStep } = useDemo()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleValidate = () => {
        setIsModalOpen(false)
        onApply?.()
        nextStep()
    }

    return (
        <div className="space-y-3">

            {/* ── Process Kanban — Quote active ── */}
            <BFIProcessKanban
                activeCol={ACTIVE_COL}
                showDoe={true}
                onReviewDoe={() => setIsModalOpen(true)}
                reviewLabel="Continue"
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · validating DOE-2847 vs Quote Tool…
            </p>

            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="quote"
                onValidate={handleValidate}
                onReset={onReset}
            />

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OVNIQ, SOURCES.CORE_PO] }]} />
        </div>
    )
}
