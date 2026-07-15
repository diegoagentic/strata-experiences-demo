import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface Toast {
    id: string
    title: string
    detail: string
}

const TOAST_DURATION_MS = 2800
const BULK_TOAST_DURATION_MS = 3600

/**
 * Listens for `clc:job-published` (per-job) and `clc:bulk-published`
 * (summary) window events and renders a small stacked toast (top-right
 * of the viewport). Each toast lives for its own duration · enough
 * to read without becoming visual noise.
 *
 * Mounted once at the top of CLCCalendarScene · no props.
 *
 * Event payload shapes:
 *   clc:job-published   · detail: { jobId: string; customer: string }
 *   clc:bulk-published  · detail: { count: number }
 */
export default function CLCToastStack() {
    const [toasts, setToasts] = useState<Toast[]>([])

    useEffect(() => {
        const perJobHandler = (e: Event) => {
            const detail = (e as CustomEvent).detail as { jobId?: string; customer?: string } | undefined
            if (!detail?.jobId) return
            const id = `${detail.jobId}-${performance.now()}`
            const customer = detail.customer ?? 'Install job'
            setToasts(prev => [...prev, { id, title: 'Sent to Outlook', detail: customer }])
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id))
            }, TOAST_DURATION_MS)
        }
        const bulkHandler = (e: Event) => {
            const detail = (e as CustomEvent).detail as { count?: number } | undefined
            const count = detail?.count ?? 0
            if (count <= 0) return
            const id = `bulk-${performance.now()}`
            setToasts(prev => [...prev, {
                id,
                title: `${count} jobs sent to Outlook`,
                detail: 'Director of Operations · calendar in sync',
            }])
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id))
            }, BULK_TOAST_DURATION_MS)
        }
        window.addEventListener('clc:job-published', perJobHandler)
        window.addEventListener('clc:bulk-published', bulkHandler)
        return () => {
            window.removeEventListener('clc:job-published', perJobHandler)
            window.removeEventListener('clc:bulk-published', bulkHandler)
        }
    }, [])

    if (toasts.length === 0) return null

    return (
        <>
            <div
                className="fixed top-24 right-6 z-[10001] flex flex-col gap-2 max-w-sm pointer-events-none"
                aria-live="polite"
                aria-atomic="false"
            >
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-success/30 bg-card shadow-lg pointer-events-auto"
                        style={{ animation: 'clcToastSlideIn 220ms ease-out' }}
                        role="status"
                    >
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        <div className="text-xs min-w-0">
                            <div className="font-bold text-foreground">{toast.title}</div>
                            <div className="text-muted-foreground truncate">{toast.detail}</div>
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes clcToastSlideIn {
                    from { transform: translateX(24px); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
            `}</style>
        </>
    )
}
