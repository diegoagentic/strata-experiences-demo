
import WidgetCard from './WidgetCard'
import { DocumentCheckIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const verificationItems = [
    {
        id: 'PO-9921',
        ackId: 'ACK-8821',
        client: 'TechStart Inc.',
        status: 'discrepancy', // discrepancy, matched, pending
        mismatches: 2,
        details: 'Price variance ($450), Finish mismatch (Line 12)',
        date: 'Today, 10:23 AM'
    },
    {
        id: 'PO-9924',
        ackId: 'ACK-8825',
        client: 'Global Finance',
        status: 'matched',
        mismatches: 0,
        details: 'All lines verified',
        date: 'Yesterday'
    },
    {
        id: 'PO-9928',
        ackId: 'Pending',
        client: 'Creative Studio',
        status: 'pending',
        mismatches: null,
        details: 'Waiting for factory acknowledgement...',
        date: 'Today, 09:00 AM'
    }
]

export default function POVerificationWidget() {
    return (
        <WidgetCard
            title="PO vs Acknowledgement"
            description="AI-powered discrepancy detection."
            icon={DocumentCheckIcon}
            action={
                <button className="text-xs font-medium text-foreground hover:text-muted-foreground dark:hover:text-zinc-300 transition-colors flex items-center gap-1">
                    <ArrowPathIcon className="w-3 h-3" />
                    Sync
                </button>
            }
        >
            <div className="space-y-4">
                {verificationItems.map((item) => (
                    <div key={item.id} className="p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="text-sm font-bold text-foreground">{item.client}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-0.5">
                                    <span>{item.id}</span>
                                    <span className="text-zinc-300 dark:text-muted-foreground">vs</span>
                                    <span>{item.ackId}</span>
                                </div>
                            </div>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1 ${item.status === 'discrepancy' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' :
                                item.status === 'matched' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' :
                                    'bg-muted text-muted-foreground border-border'
                                }`}>
                                {item.status === 'discrepancy' && <ExclamationTriangleIcon className="w-3 h-3" />}
                                {item.status === 'matched' && <CheckCircleIcon className="w-3 h-3" />}
                                {item.status === 'pending' && <MagnifyingGlassIcon className="w-3 h-3" />}
                                {item.status}
                            </div>
                        </div>

                        {item.status === 'discrepancy' && (
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg p-2 mt-2">
                                <div className="flex items-start gap-2">
                                    <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-red-900 dark:text-red-200">
                                            AI Detected {item.mismatches} Mismatches
                                        </p>
                                        <p className="text-[10px] text-red-700 dark:text-red-300 mt-0.5 leading-relaxed">
                                            {item.details}
                                        </p>
                                        <button className="mt-2 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 px-2 py-1 rounded transition-colors">
                                            Review & Fix
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {item.status === 'matched' && (
                            <p className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-1 mt-2">
                                <CheckCircleIcon className="w-3 h-3" /> Verified by AI {item.date}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </WidgetCard>
    )
}
