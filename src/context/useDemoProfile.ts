import { useContext } from 'react';
import { DemoProfileContext } from './DemoProfileContext';

export function useDemoProfile() {
    const context = useContext(DemoProfileContext);
    if (!context) throw new Error('useDemoProfile must be used within DemoProfileProvider');
    return context;
}
