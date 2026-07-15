import { useEffect, useRef } from 'react';
import { useDemo } from '../../context/DemoContext';

/**
 * Side-effect component that auto-scrolls to the highlighted element
 * on each demo step change and applies a pulsing spotlight glow.
 * Renders nothing — purely drives scroll + CSS class toggling.
 */
export default function DemoSpotlight() {
    const { isDemoActive, currentStep } = useDemo();
    const prevElementRef = useRef<Element | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        // Clean up previous spotlight
        if (prevElementRef.current) {
            prevElementRef.current.classList.remove('demo-spotlight-active', 'demo-spotlight-steady');
            prevElementRef.current = null;
        }
        if (timerRef.current) clearTimeout(timerRef.current);

        if (!isDemoActive || !currentStep?.highlightId) return;

        // Delay to let page transition / render complete
        const findTimer = setTimeout(() => {
            const el =
                document.querySelector(`[data-demo-target="${currentStep.highlightId}"]`) ||
                document.getElementById(currentStep.highlightId!);

            if (!el) return;

            prevElementRef.current = el;

            // Scroll into view
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Apply pulsing spotlight (3 pulses = 3s)
            el.classList.add('demo-spotlight-active');

            // After 3 pulses, switch to steady subtle glow
            timerRef.current = setTimeout(() => {
                el.classList.remove('demo-spotlight-active');
                el.classList.add('demo-spotlight-steady');
            }, 3000);
        }, 600);

        return () => {
            clearTimeout(findTimer);
            if (timerRef.current) clearTimeout(timerRef.current);
            if (prevElementRef.current) {
                prevElementRef.current.classList.remove('demo-spotlight-active', 'demo-spotlight-steady');
                prevElementRef.current = null;
            }
        };
    }, [isDemoActive, currentStep?.id, currentStep?.highlightId]);

    return null;
}
