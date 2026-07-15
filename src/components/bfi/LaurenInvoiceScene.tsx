/**
 * COMPONENT: LaurenInvoiceScene (a1.3c)
 * PURPOSE: Lauren uploads the Quote Tool approved invoice to the CPR attachments.
 *          Strata AI detects it's the approved invoice → prominent detection banner.
 *          Lauren forwards it to Patricia (Finance/AR) to initiate fee verification.
 *
 * FLOW:
 *   Action Center notification appears after 2s (from Michael — final quote ready)
 *   → click CTA → modal opens (invoiceUpload mode, Attachments tab)
 *   → AI activation animation → upload zone → simulate upload → detection → Forward
 *   → nextStep() → a1.4 (Agency Fee Verify)
 */

import { useState, useEffect } from 'react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

const ACTIVE_COL = 3

export default function LaurenInvoiceScene() {
    const { nextStep } = useDemo()
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const handler = () => setIsModalOpen(true)
        window.addEventListener('bfi:invoice-open', handler)
        return () => window.removeEventListener('bfi:invoice-open', handler)
    }, [])

    const handleOpenModal = () => setIsModalOpen(true)

    const handleValidate = () => {
        setIsModalOpen(false)
        nextStep()
    }

    return (
        <div className="space-y-3">

            {/* CPR kanban */}
            <BFIProcessKanban
                activeCol={ACTIVE_COL}
                showDoe={true}
                onReviewDoe={handleOpenModal}
                highlightReview={true}
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · invoice upload pending…
            </p>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OVNIQ] }]} />

            {/* CPR modal — invoiceUpload mode */}
            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="cpr"
                onValidate={handleValidate}
                invoiceUpload
            />
        </div>
    )
}
