/**
 * RoleSwitchToast · transient strip shown on every "View as" change (W11)
 *
 * Replaces the old persistent DealerViewBanner. Listens to the viewAs
 * CustomEvent directly (NOT useViewAs) so it fires ONLY on a change — never on
 * initial mount. The strip is colored by the chosen role (Manufacturer = brand
 * lime · Dealer = info blue), shows for ~2.5s and fades itself out.
 */

import { useEffect, useRef, useState } from 'react'
import { Factory, Store } from 'lucide-react'
import type { ViewAs } from './viewAsSignal'

const EVENT = 'inbound-outbound:view-as-change'
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
            const detail = (e as CustomEvent).detail as ViewAs | undefined
            const next: ViewAs = detail === 'dealer' ? 'dealer' : 'manufacturer'
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
        window.addEventListener(EVENT, onChange)
        return () => {
            window.removeEventListener(EVENT, onChange)
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
