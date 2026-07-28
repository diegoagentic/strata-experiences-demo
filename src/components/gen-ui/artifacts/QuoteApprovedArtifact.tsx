// F43.c · Wrapper alrededor de CreateRecordModal (Expert Hub prod).
// Reemplaza el custom "Generate PO" button-only screen del legacy con:
//   1. Success card (Quote Approved) sigue igual — brand identity del demo.
//   2. Click "Generate Purchase Order" → abre CreateRecordModal canonical
//      (PaneView header/lineItems/extras + PublishingOverlay + PublishedView).
//   3. Al Publish (dentro del modal) el user ve PublishedView; al cerrar,
//      onCreated dispara onGeneratePO() y el parent (QuoteGenerationFlow)
//      transiciona a phase 'ORDERED'.
//
// El "Simulate Benefit View" side-flow (OrderSimulationArtifact) se preserva
// intact — Diego puede activarlo desde el mismo screen.
import { useMemo, useState } from 'react'
import { CheckCircleIcon, DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline'
import { useGenUI } from '../../../context/GenUIContext'
import OrderSimulationArtifact from './OrderSimulationArtifact'
import CreateRecordModal, {
    type CreateRecordDoc,
} from '../../../blocks/prod-imports/deps/create-record/CreateRecordModal'

interface QuoteApprovedArtifactProps {
    /** Fired when the CreateRecordModal Publish → user closes / views record.
        Parent (QuoteGenerationFlow) uses this to advance to phase 'ORDERED'. */
    onGeneratePO?: () => void;
    /** Optional context passed from AssetReview → surfaces vendor + source
        filename on the CreateRecordModal header. */
    quoteContext?: {
        fileName?: string
        vendor?: string
    }
}

export default function QuoteApprovedArtifact({
    onGeneratePO,
    quoteContext,
}: QuoteApprovedArtifactProps) {
    const { pushSystemArtifact } = useGenUI()
    const [modalOpen, setModalOpen] = useState(false)
    const [simulating, setSimulating] = useState(false)

    // Synthesize a mock CreateRecordDoc from quote context. The mock
    // preflight generator (getPreflightForDoc) keys off doc.id last digit
    // for "messy vs clean" — we force odd so the modal opens in messy mode
    // and shows the AI reconciliation UI (better demo).
    const mockDoc: CreateRecordDoc = useMemo(() => ({
        id: 'QUOTE-0007',
        name: quoteContext?.fileName ?? 'Client_Request_Draft.pdf',
        vendor: quoteContext?.vendor ?? 'Herman Miller',
        type: 'Purchase Order',
    }), [quoteContext?.fileName, quoteContext?.vendor])

    const handleGeneratePO = () => {
        setModalOpen(true)
    }

    const handleModalCreated = (recordId: string) => {
        pushSystemArtifact(
            `I've generated the official Purchase Order ${recordId} and sent it to the vendor.`,
            {
                id: 'art_order_placed_' + Date.now(),
                type: 'order_placed',
                data: { recordId },
                source: 'Quote Approved',
            }
        )
        if (onGeneratePO) onGeneratePO()
    }

    if (simulating) {
        return (
            <div className="w-full max-w-4xl h-[600px] -ml-2 -mt-2 shadow-lg rounded-2xl overflow-hidden border border-border bg-card">
                <OrderSimulationArtifact
                    onBack={() => setSimulating(false)}
                    onGeneratePO={handleGeneratePO}
                />
            </div>
        )
    }

    return (
        <>
            <div className="h-full flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-success/20 shadow-sm animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-success/15 rounded-full flex items-center justify-center mb-6">
                    <CheckCircleIcon className="w-10 h-10 text-success" />
                </div>
                <h3 className="text-2xl font-bold font-brand text-foreground mb-2">Quote Approved</h3>
                <p className="text-muted-foreground text-center max-w-md mb-8">
                    The quote has been validated and approved. You can now generate the Purchase Order using the Orderbahn record creator.
                </p>
                <button
                    onClick={handleGeneratePO}
                    className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                >
                    <DocumentTextIcon className="w-5 h-5" />
                    Generate Purchase Order
                </button>
                <button
                    onClick={() => setSimulating(true)}
                    className="mt-6 text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                    <EyeIcon className="w-4 h-4" />
                    Simulate Benefit View
                </button>
            </div>

            <CreateRecordModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                document={mockDoc}
                recordType="PO"
                onCreated={handleModalCreated}
            />
        </>
    )
}
