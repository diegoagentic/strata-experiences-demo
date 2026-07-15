
import WidgetCard from './WidgetCard'
import { ClipboardDocumentListIcon, TruckIcon, WrenchScrewdriverIcon, CheckCircleIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'

const projects = [
    {
        id: 'PRJ-2024-001',
        client: 'TechStart Inc. HQ',
        stage: 'production', // planning, production, shipping, installation, complete
        progress: 65,
        nextMilestone: 'Shipment: Feb 12',
        status: 'on_track', // on_track, delayed, at_risk
        items: 145
    },
    {
        id: 'PRJ-2024-004',
        client: 'Global Finance Offices',
        stage: 'planning',
        progress: 25,
        nextMilestone: 'Sign-off: Jan 30',
        status: 'at_risk',
        items: 450
    },
    {
        id: 'PRJ-2024-002',
        client: 'Creative Studio',
        stage: 'installation',
        progress: 90,
        nextMilestone: 'Final Walkthrough: Tomorrow',
        status: 'delayed',
        items: 32
    }
]

const stages = [
    { id: 'planning', label: 'Plan', icon: ClipboardDocumentListIcon },
    { id: 'production', label: 'Mfg', icon: WrenchScrewdriverIcon },
    { id: 'shipping', label: 'Ship', icon: TruckIcon },
    { id: 'installation', label: 'Install', icon: CheckCircleIcon },
]

export default function ProjectTrackerWidget() {
    return (
        <WidgetCard
            title="Project Tracker"
            description="Active fit-out milestones and timeline."
            icon={ClipboardDocumentListIcon}
            action={
                <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    View All Projects
                </button>
            }
        >
            <div className="space-y-6">
                {projects.map((project) => (
                    <div key={project.id} className="group">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h4 className="text-sm font-semibold text-foreground group-hover:text-muted-foreground dark:group-hover:text-zinc-300 transition-colors cursor-pointer">
                                    {project.client}
                                </h4>
                                <span className="text-xs text-muted-foreground font-mono">{project.id} • {project.items} Items</span>
                            </div>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${project.status === 'on_track' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' :
                                project.status === 'delayed' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' :
                                    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30'
                                }`}>
                                {project.status.replace('_', ' ')}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                            <div
                                className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000"
                                style={{ width: `${project.progress}%` }}
                            />
                        </div>

                        {/* Milestones Visual */}
                        <div className="flex items-center justify-between text-xs relative">
                            {/* Connector Line */}
                            <div className="absolute top-3 left-4 right-4 h-0.5 bg-muted -z-10" />

                            {stages.map((stage, idx) => {
                                const isCompleted = ['planning', 'production', 'shipping', 'installation'].indexOf(project.stage) >= idx;
                                const isCurrent = project.stage === stage.id;
                                const StageIcon = stage.icon;

                                return (
                                    <div key={stage.id} className="flex flex-col items-center gap-1.5 bg-card px-1">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${isCurrent ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-110' :
                                            isCompleted ? 'bg-muted text-muted-foreground border-border' :
                                                'bg-card text-muted-foreground/50 border-border'
                                            }`}>
                                            <StageIcon className="w-3 h-3" />
                                        </div>
                                        <span className={`text-[9px] font-medium uppercase ${isCurrent ? 'text-foreground' : 'text-muted-foreground'
                                            }`}>{stage.label}</span>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-3 bg-muted/50 p-1.5 rounded-md w-fit">
                            <EllipsisHorizontalIcon className="w-3 h-3" />
                            Next: <span className="font-medium text-foreground">{project.nextMilestone}</span>
                        </div>
                    </div>
                ))}
            </div>
        </WidgetCard>
    )
}
