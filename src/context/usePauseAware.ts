import { useCallback, useEffect, useRef } from 'react'
import { useDemo } from './DemoContext'

/**
 * Returns a ref whose `.current` mirrors the demo guide's isPaused state,
 * plus a `pauseAwareTimeout` helper for one-shot timers that should also
 * respect pause.
 *
 * Use cases:
 *
 * 1. `setInterval` — gate the body on `pausedRef.current`. The interval
 *    keeps firing but does nothing while paused, so progress is preserved
 *    and resume is seamless.
 *
 *      const { pausedRef } = usePauseAware()
 *      useEffect(() => {
 *          const id = setInterval(() => {
 *              if (pausedRef.current) return
 *              tick()
 *          }, 80)
 *          return () => clearInterval(id)
 *      }, [])
 *
 * 2. Chained `setTimeout` — wrap with `pauseAwareTimeout`. While paused
 *    the timer polls every 120ms and only fires the callback once
 *    unpaused, so phased animations don't run during pause.
 *
 *      const { pauseAwareTimeout } = usePauseAware()
 *      useEffect(() => {
 *          const cancel = pauseAwareTimeout(() => setPhase(p => p + 1), 900)
 *          return cancel
 *      }, [phase])
 */
export function usePauseAware() {
    const { isPaused } = useDemo()
    const pausedRef = useRef(isPaused)
    useEffect(() => { pausedRef.current = isPaused }, [isPaused])

    const pauseAwareTimeout = useCallback((cb: () => void, delayMs: number) => {
        let cancelled = false
        let id: ReturnType<typeof setTimeout>
        const fire = () => {
            if (cancelled) return
            if (pausedRef.current) {
                id = setTimeout(fire, 120)
                return
            }
            cb()
        }
        id = setTimeout(fire, delayMs)
        return () => {
            cancelled = true
            clearTimeout(id)
        }
    }, [])

    return { pausedRef, pauseAwareTimeout }
}
