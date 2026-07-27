
import WidgetCard from './WidgetCard'
import { ShieldCheckIcon, PlusIcon, PhotoIcon, ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

const claims = [
    {
        id: 'CLM-2024-882',
        product: 'Eames Lounge Chair',
        issue: 'Leather scratch on armrest',
        date: '2 Days ago',
        status: 'in_review',
        image: true
    },
    {
        id: 'CLM-2024-879',
        product: 'Setu Stool (x4)',
        issue: 'Gas lift malfunction',
        date: '1 Week ago',
        status: 'approved',
        image: false
    },
    {
        id: 'CLM-2024-875',
        product: 'Nelson Bench',
        issue: 'Shipping damage (Leg)',
        date: 'Jan 15',
        status: 'action_required',
        image: true
    }
]

export default function WarrantyClaimsWidget() {
    return (
        <WidgetCard
            title="Warranty & Claims"
            description="Active support requests."
            icon={ShieldCheckIcon}
            action={
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity">
                    <PlusIcon className="w-3.5 h-3.5" />
                    New Claim
                </button>
            }
        >
            <div className="space-y-4">
                {claims.map((claim) => (
                    <div key={claim.id} className="relative pl-4 border-l-2 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors group">
                        {/* Status Icon Indicator */}
                        <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-card flex items-center justify-center ${claim.status === 'approved' ? 'border-success text-success' :
                            claim.status === 'action_required' ? 'border-destructive text-destructive' :
                                'border-warning text-warning'
                            }`}>
                            {claim.status === 'approved' && <CheckCircleIcon className="w-2.5 h-2.5" />}
                            {claim.status === 'action_required' && <ExclamationCircleIcon className="w-2.5 h-2.5" />}
                            {claim.status === 'in_review' && <ClockIcon className="w-2.5 h-2.5" />}
                        </div>

                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <h4 className="text-sm font-bold text-foreground">
                                    {claim.id}
                                </h4>
                                <p className="text-xs font-medium text-muted-foreground mt-0.5">
                                    {claim.product}
                                </p>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border capitalize ${claim.status === 'approved' ? 'bg-success/10 text-success border-success/30 dark:bg-success/15 dark:text-success dark:border-success/40' :
                                claim.status === 'action_required' ? 'bg-destructive/10 text-destructive border-destructive/30 dark:bg-destructive/15 dark:text-destructive dark:border-destructive/40' :
                                    'bg-warning/10 text-warning border-warning/30 dark:bg-warning/15 dark:text-warning dark:border-warning/40'
                                }`}>
                                {claim.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="bg-muted/50 p-2 rounded-lg mt-2 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground truncate max-w-[70%]">
                                <span className="font-medium text-foreground">Issue:</span> {claim.issue}
                            </span>
                            {claim.image && (
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                    <PhotoIcon className="w-3 h-3" />
                                    <span>Image attached</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <div className="pt-2 text-center">
                    <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                        View 8 Closed Claims
                    </button>
                </div>
            </div>
        </WidgetCard>
    )
}
