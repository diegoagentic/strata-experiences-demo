import { useRef, useEffect } from 'react';
import CommandCenter from './CommandCenter';
import StreamFeed from './StreamFeed';
import { useGenUI } from '../../context/GenUIContext';

export default function GenUIContainer() {
    const { isStreamOpen, setStreamOpen, setShowTriggers } = useGenUI();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if click is outside the container and stream is open
            if (isStreamOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setStreamOpen(false);
                setShowTriggers(false);
            }
        };

        // Add event listener to document
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup event listener
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isStreamOpen, setStreamOpen, setShowTriggers]);

    return (
        <div ref={containerRef}>
            <CommandCenter />
            <StreamFeed />
        </div>
    );
}
