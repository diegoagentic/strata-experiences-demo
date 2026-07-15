/**
 * COMPONENT: POLaborScene (a1.2c)
 * PURPOSE: Agency Fee step 2c — Purchase Order arrives from NYC DoE in response
 *          to the proposal sent in a1.2b3. Lauren reviews the PO against the
 *          proposal she sent (product from Quote Tool + labor from WIG) and
 *          confirms the order in CORE.
 *
 * FLOW:
 *   kanban → modal (step="labor") opens to review PO vs proposal → validate → nextStep()
 */

import { useState, useEffect } from 'react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

const ACTIVE_COL = 2  // PO & Labor

export default function POLaborScene() {
    const { nextStep } = useDemo()
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const handler = () => setIsModalOpen(true)
        window.addEventListener('bfi:po-review-open', handler)
        return () => window.removeEventListener('bfi:po-review-open', handler)
    }, [])

    const handleValidate = () => {
        setIsModalOpen(false)
        nextStep()
    }

    return (
        <div className="space-y-3">

            {/* ── Process Kanban — PO & Labor active ── */}
            <BFIProcessKanban
                activeCol={ACTIVE_COL}
                showDoe={true}
                onReviewDoe={() => setIsModalOpen(true)}
                doeSubtitle="PO received from NYC DOE · ready for CORE entry"
                reviewLabel="Review PO"
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · Purchase Order received from NYC DOE · awaiting CORE entry…
            </p>

            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="labor"
                onValidate={handleValidate}
            />

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
