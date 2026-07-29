// F45 (Diego 2026-07-29) · reemplazo del placeholder "CRM Content Placeholder"
// por CRMSimulation (mismo componente que Dealer Sage usa en steps 1.12/1.13
// vía renderAppByName). CRMSimulation ya consume `strata-design-system`
// directo (HeroMetric, Callout, ProgressBar) · projects table con Apex HQ
// Office Renovation · Customer 360 con Apex Furniture · activity timeline.
// Diego navegó a la CRM tab en Dealer Rust (acme profile) y vio el placeholder ·
// este fix hace que la CRM tab renderee contenido real para cualquier profile
// (Dealer Rust · Inbound|Outbound · Continua · etc). CRMSimulation no
// renderea su propio Navbar · lo hereda del parent (preservamos el <Navbar> abajo).
import Navbar from './components/Navbar'
import CRMSimulation from './components/simulations/CRMSimulation'

interface PageProps {
    onLogout: () => void;
    onNavigateToDetail: () => void;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: string) => void;
}

export default function CRM({ onLogout, onNavigateToWorkspace, onNavigate }: PageProps) {
    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            <Navbar
                onLogout={onLogout}
                activeTab="CRM"
                onNavigateToWorkspace={onNavigateToWorkspace}
                onNavigate={onNavigate}
            />
            {/* F45.d.5 · sin pt-16 wrapper · CRMSimulation ya aplica `pt-24`
                internamente (asume que renderea sin shell). El navbar mide
                ~64px · pt-24 = 96px total → 32px de whitespace bajo el
                navbar · aceptable. Antes había pt-16 acá + pt-24 dentro =
                112px de whitespace excesivo. */}
            <CRMSimulation onNavigate={onNavigate} activePage="crm" />
        </div>
    )
}
