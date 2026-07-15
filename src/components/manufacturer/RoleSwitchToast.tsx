/**
 * RoleSwitchToast · transient strip shown on every "View as" change (W11).
 *
 * Listens to the generalized 'role:change' event (from src/lib/roleSignal.ts)
 * filtered to `profileId === 'inbound-outbound'`, so the toast only fires for
 * the manufacturer/dealer split · not for role changes in other experiences.
 * F5+ will generalize the toast look per experience if needed.
 */

import { useEffect, useRef, useState } from 'react'
import { Factory, Store } from 'lucide-react'
import type { ViewAs } from './viewAsSignal'
import { ROLE_EVENT } from '../../lib/roleSignal'

const PROFILE_ID = 'inbound-outbound'
const DURATION = 2500

const CONFIG: Record<ViewAs, { label: string; sub: string; Icon: typeof Factory; cls: string }> = {
    manufacturer: {
        label: 'Manufacturer view',
        sub: 'Full access',
        Icon: Factory,
        cls: 'bg-primary text-primary-foreground border-primary/40',
    },
    dealer: {
        label: 'Dealer view',
        sub: 'Read-only',
        Icon: Store,
        cls: 'bg-info text-primary-foreground border-info/40',
    },
}

export default function RoleSwitchToast() {
    const [role, setRole] = useState<ViewAs | null>(null)
    const [leaving, setLeaving] = useState(false)
    const timers = useRef<number[]>([])

    useEffect(() => {
        const clear = () => {
            timers.current.forEach((t) => window.clearTimeout(t))
            timers.current = []
        }
        const onChange = (e: Event) => {
            const detail = (e as CustomEvent).detail as { profileId?: string; roleId?: string } | undefined
            if (detail?.profileId !== PROFILE_ID) return
            const next: ViewAs = detail.roleId === 'dealer' ? 'dealer' : 'manufacturer'
            clear()
            setLeaving(false)
            setRole(next)
            const t1 = window.setTimeout(() => setLeaving(true), DURATION - 300)
            const t2 = window.setTimeout(() => {
                setRole(null)
                setLeaving(false)
            }, DURATION)
            timers.current = [t1, t2]
        }
        window.addEventListener(ROLE_EVENT, onChange)
        return () => {
            window.removeEventListener(ROLE_EVENT, onChange)
            clear()
        }
    }, [])

    if (!role) return null
    const c = CONFIG[role]
    const Icon = c.Icon

    return (
        <div
            role="status"
            aria-live="polite"
            className={`fixed top-0 left-0 right-0 z-[60] border-b shadow-sm transition-all duration-300 ${c.cls} ${
                leaving ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'
            }`}
        >
            <div className="max-w-[1600px] mx-auto px-4 py-1.5 flex items-center justify-center gap-2">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider">{c.label}</span>
                <span className="text-[11px] opacity-90 hidden sm:inline">· {c.sub}</span>
            </div>
        </div>
    )
}
