import { useEffect, useState } from 'react'
import { useDemo } from '../../context/DemoContext'
import CLCCalendarScene from './CLCCalendarScene'
import CLCSharePointScene from './CLCSharePointScene'
import CLCIntakeChannelDialog from './CLCIntakeChannelDialog'
import CLCIntakeSurveyScene from './CLCIntakeSurveyScene'
import CLCIntakeReconcileScene from './CLCIntakeReconcileScene'
import CLCDashboardScene from './CLCDashboardScene'

/**
 * CLCPage — shell que ruta steps a su scene correspondiente.
 * Patrón copiado de OfficeworksPage: stepIdToStage + listeners para `clc:*` events.
 */
export default function CLCPage() {
    const { currentStep } = useDemo()
    const [intakeChannel, setIntakeChannel] = useState<'email' | 'platform' | null>(null)

    // Map step id → which scene to render. Anything outside the map shows
    // the calendar scene as a safe default (Schedule AI lands by default).
    const stepToScene = (stepId: string | undefined): 'calendar' | 'sharepoint' | 'intake-survey' | 'intake-reconcile' => {
        if (!stepId) return 'calendar'
        if (stepId.startsWith('clc1.')) return 'calendar'
        if (stepId.startsWith('clc2.')) return 'sharepoint'
        if (stepId === 'clc3.1' || stepId === 'clc3.2') return 'intake-survey'
        if (stepId === 'clc3.3') return 'intake-reconcile'
        // Fallback by app
        if (currentStep?.app === 'clc-calendar') return 'calendar'
        if (currentStep?.app === 'clc-sharepoint') return 'sharepoint'
        if (currentStep?.app === 'clc-intake') return 'intake-survey'
        return 'calendar'
    }

    const scene = stepToScene(currentStep?.id)

    // Channel-picker dialog: open on clc3.1, close once a channel is picked.
    const [showChannelDialog, setShowChannelDialog] = useState(false)
    useEffect(() => {
        if (currentStep?.id === 'clc3.1' && intakeChannel === null) {
            setShowChannelDialog(true)
        }
    }, [currentStep?.id, intakeChannel])

    // Reset channel on step rewind back to before clc3.1
    useEffect(() => {
        const id = currentStep?.id
        if (id && !id.startsWith('clc3.')) {
            // keep choice once user advanced past intake — only reset on fresh return
        }
    }, [currentStep?.id])

    return (
        <div className="flex-1 overflow-y-auto">
            {scene === 'calendar' && <CLCCalendarScene />}
            {scene === 'sharepoint' && <CLCSharePointScene />}
            {scene === 'intake-survey' && (
                <CLCIntakeSurveyScene channel={intakeChannel} onOpenChannelDialog={() => setShowChannelDialog(true)} />
            )}
            {scene === 'intake-reconcile' && <CLCIntakeReconcileScene />}

            <CLCIntakeChannelDialog
                isOpen={showChannelDialog}
                onClose={() => setShowChannelDialog(false)}
                onPick={(channel) => {
                    setIntakeChannel(channel)
                    setShowChannelDialog(false)
                }}
            />
        </div>
    )
}

/**
 * CLCDashboardPage — persistent Dashboard tab. Same content as CLCDashboardScene
 * but rendered as a top-level page (not via a step).
 */
export function CLCDashboardPage() {
    return (
        <div className="flex-1 overflow-y-auto">
            <CLCDashboardScene />
        </div>
    )
}
