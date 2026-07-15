
import WidgetCard from './WidgetCard'
import { CalendarIcon, UserGroupIcon, MapPinIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const scheduleItems = [
    {
        id: 'SCH-001',
        date: '2024-02-12',
        time: '09:00 AM',
        client: 'TechStart Inc. HQ',
        team: 'Team Alpha',
        location: 'Downtown',
        status: 'confirmed'
    },
    {
        id: 'SCH-002',
        date: '2024-02-14',
        time: '08:30 AM',
        client: 'Global Finance Offices',
        team: 'Team Beta',
        location: 'Financial District',
        status: 'pending'
    },
    {
        id: 'SCH-003',
        date: '2024-02-15',
        time: '10:00 AM',
        client: 'Creative Studio',
        team: 'Team Alpha',
        location: 'Arts District',
        status: 'confirmed'
    }
]

export default function InstallationSchedulerWidget() {
    return (
        <WidgetCard
            title="Installation Scheduler"
            description="Upcoming team deployments."
            icon={CalendarIcon}
            action={
                <button className="text-xs font-medium text-foreground hover:text-muted-foreground dark:hover:text-zinc-300 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-zinc-400 rounded">
                    View Calendar
                    <ChevronRightIcon className="w-3 h-3" />
                </button>
            }
        >
            <div className="space-y-4">
                {/* Date Header Grouping could go here, for now simple list */}
                {scheduleItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 rounded-xl border border-border bg-muted/20 hover:border-primary/30 transition-colors group">
                        {/* Date Box */}
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-card border border-border shadow-sm shrink-0">
                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">
                                {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-xl font-bold text-foreground">
                                {new Date(item.date).getDate()}
                            </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-bold text-foreground truncate pr-2">
                                    {item.client}
                                </h4>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.status === 'confirmed'
                                    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                    : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>

                            <div className="mt-1 flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <UserGroupIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span>{item.team}</span>
                                    <span className="text-zinc-300 dark:text-muted-foreground">•</span>
                                    <span>{item.time}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground dark:text-muted-foreground">
                                    <MapPinIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="truncate">{item.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button className="w-full py-2 text-xs font-medium text-muted-foreground border border-dashed border-border rounded-lg hover:bg-muted/50 transition-colors">
                    + Schedule New Installation
                </button>
            </div>
        </WidgetCard>
    )
}
