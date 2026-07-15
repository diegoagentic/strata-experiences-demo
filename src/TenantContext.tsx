import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useDemoProfile } from './context/useDemoProfile';

export type Tenant = string;

interface TenantContextType {
    currentTenant: Tenant;
    tenants: Tenant[];
    setTenant: (tenant: Tenant) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
    const { activeProfile } = useDemoProfile();
    const [currentTenant, setCurrentTenant] = useState<Tenant>(activeProfile.companyName);
    const tenants: Tenant[] = ['Acme Corp', 'Globex', 'Initech'];

    // Sync tenant with active demo profile
    useEffect(() => {
        setCurrentTenant(activeProfile.companyName);
    }, [activeProfile.companyName]);

    return (
        <TenantContext.Provider value={{ currentTenant, tenants, setTenant: setCurrentTenant }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
}
