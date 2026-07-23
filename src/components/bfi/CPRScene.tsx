/**
 * COMPONENT: CPRScene (a1.3)
 * PURPOSE: Agency Fee step 3 — CPR Reconciliation.
 */

import { useState } from 'react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

interface CPRSceneProps {
    onSend?: () => void
    onReset?: () => void
}

const ACTIVE_COL = 3  // CPR Review

export default function CPRScene({ onSend, onReset }: CPRSceneProps) {
    const { nextStep } = useDemo()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleValidate = () => {
        setIsModalOpen(false)
        onSend?.()
        nextStep()
    }

    return (
        <div className="space-y-3">

            {/* ── Process Kanban — CPR Review active ── */}
            <BFIProcessKanban
                activeCol={ACTIVE_COL}
                showDoe={true}
                onReviewDoe={() => setIsModalOpen(true)}
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · reconciling CPR hours…
            </p>

            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="cpr"
                onValidate={handleValidate}
                onReset={onReset}
            />

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
