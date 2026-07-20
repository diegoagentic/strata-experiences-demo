// ─────────────────────────────────────────────────────────────────────────────
// Wrapper para el shared-block preview de expert-hub-tx.
// Mantiene el componente prod (`../ExpertHubTransactions.tsx`) sin ediciones
// in-place · adapta solo las props que expert-hub le exige (nav callbacks,
// logout) a no-ops porque en el shared block no hay a dónde navegar.
// ─────────────────────────────────────────────────────────────────────────────

import ExpertHubTransactions from '../ExpertHubTransactions';
import { TenantProvider } from '../deps/TenantContext';

const noop = () => {};

export default function ExpertHubTransactionsWrapper() {
  return (
    <TenantProvider>
      <ExpertHubTransactions
        onLogout={noop}
        onNavigateToDetail={noop}
        onNavigateToWorkspace={noop}
        onNavigate={noop}
      />
    </TenantProvider>
  );
}
