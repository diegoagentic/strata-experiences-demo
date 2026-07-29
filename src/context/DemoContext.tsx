import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useDemoProfile } from './useDemoProfile';
import type { DemoStep } from '../config/demoProfiles';

export type { SimulationApp, DemoStep } from '../config/demoProfiles';

interface DemoContextType {
    currentStepIndex: number;
    currentStep: DemoStep;
    steps: DemoStep[];
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (index: number) => void;
    isDemoActive: boolean;
    setIsDemoActive: (active: boolean) => void;
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (collapsed: boolean) => void;
    isPaused: boolean;
    togglePause: () => void;
    procCompleteStep: string | null;
    setProcCompleteStep: (step: string | null) => void;
    lupaStep: string | null;
    setLupaStep: (step: string | null) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { activeProfile } = useDemoProfile();
    const steps = activeProfile.steps;

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isDemoActive, setIsDemoActive] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [procCompleteStep, setProcCompleteStep] = useState<string | null>(null);
    const [lupaStep, setLupaStep] = useState<string | null>(null);

    // Reset step index when profile changes. F44.a · profiles con
    // `autoStart: true` (ej. COI/Dealer Sage) arrancan con `isDemoActive=true`
    // porque el step 1.1 depende de ese flag para su autoplay timeline
    // (EmailSimulation → AI Processing Modal → nextStep). Sin autoStart, el
    // default es reset a `false` para que otros profiles pidan Start Demo.
    useEffect(() => {
        setCurrentStepIndex(0);
        setIsPaused(false);
        setProcCompleteStep(null);
        setLupaStep(null);
        setIsDemoActive(activeProfile.autoStart ?? false);
    }, [activeProfile.id, activeProfile.autoStart]);

    // Reset signals when step changes
    useEffect(() => {
        setProcCompleteStep(null);
        setLupaStep(null);
    }, [currentStepIndex]);

    const togglePause = () => setIsPaused(prev => !prev);

    const nextStep = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const goToStep = (index: number) => {
        if (index >= 0 && index < steps.length) {
            setCurrentStepIndex(index);
        }
    };

    return (
        <DemoContext.Provider
            value={{
                currentStepIndex,
                currentStep: steps[currentStepIndex],
                steps,
                nextStep,
                prevStep,
                goToStep,
                isDemoActive,
                setIsDemoActive,
                isSidebarCollapsed,
                setIsSidebarCollapsed,
                isPaused,
                togglePause,
                procCompleteStep,
                setProcCompleteStep,
                lupaStep,
                setLupaStep
            }}
        >
            {children}
        </DemoContext.Provider>
    );
};

export const useDemo = () => {
    const context = useContext(DemoContext);
    if (context === undefined) {
        throw new Error('useDemo must be used within a DemoProvider');
    }
    return context;
};
