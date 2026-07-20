# Prod-Sync Pattern

## Why this exists

`strata-experiences-demo` fue clonado de `inbound-outbound` en F1 (2026-05).
Los componentes que renderean los shared blocks (Dashboard · Transactions ·
Kanban · Email · etc.) fueron heredados de ese clon y luego parcheados
in-place durante F5-F18 para las necesidades del demo. En paralelo, los
repos de producto (`UI-Dealer` · `UI-Manufacturer` · `expert-hub` ·
`smart-comparator` · `demo-2026-strata`) evolucionaron independientemente.

Resultado (auditoría 2026-07-20): **6 shared blocks tienen drift 🔴** frente
a sus referentes de producción. El disparador fue Diego notando que
`?block=expert-hub-tx` mostraba 5 columnas manufacturer-style mientras
`expert-hub-seven.vercel.app` mostraba 4 columnas expert-hub-style — dos
apps visualmente distintas para el mismo bloque.

Este documento describe el **pattern de sync** que estamos aplicando bloque
por bloque para eliminar el drift.

## Cuatro categorías

Cada shared block cae en una de estas 4 categorías. La decisión la toma
producto/diseño mirando el drift entre local y prod y qué versión es
"la verdad".

### A · Sync from prod (pull)

El componente prod es la verdad. Local lo importa 1:1.

**Regla de oro**: nunca editar el archivo prod-importado in-place. Cualquier
adaptación (mock data, no-op callbacks, `previewMode`) va en un **wrapper**
delgado bajo `src/blocks/prod-imports/wrappers/`.

**Header requerido** al tope del archivo copiado:
```ts
// ─────────────────────────────────────────────────────────────────────────────
// SOURCE: <sibling-repo>/<relative-path>
// COMMIT: <7-char-hash> · <YYYY-MM-DD>
// Do not edit in place · re-sync from source when prod evolves.
// Adaptations for shared-block preview (mock props, no navigation) are
// isolated to src/blocks/prod-imports/wrappers/<Name>Wrapper.tsx.
// ─────────────────────────────────────────────────────────────────────────────
```

Estructura de folders:
- `src/blocks/prod-imports/<Name>.tsx` · componente prod copiado.
- `src/blocks/prod-imports/deps/**` · deps transitivas copiadas · misma
  estructura de folders que en el repo prod.
- `src/blocks/prod-imports/utils/**` · utils prod que las deps referencian
  via `../../utils/...`.
- `src/blocks/prod-imports/wrappers/<Name>Wrapper.tsx` · el único archivo
  con lógica del demo (mocks, `previewMode`, context providers scoped).

### B · Local ahead of prod (back-port pending)

Local ha evolucionado más allá de prod. No lo tocamos · lo dejamos como
está pero anotamos el back-port pendiente.

Header:
```ts
// ─────────────────────────────────────────────────────────────────────────────
// LOCAL AHEAD OF PROD
// Reference: <sibling-repo>/<path> @ <commit> (<YYYY-MM-DD>)
// This file evolved past prod during F<XX>. Back-port pending.
// ─────────────────────────────────────────────────────────────────────────────
```

### C · Intentional superset (do not sync)

Local es un superset intencional de N variantes prod. Sincronizar rompería
funcionalidad de este demo.

Header:
```ts
// ─────────────────────────────────────────────────────────────────────────────
// INTENTIONAL SUPERSET · does NOT sync with prod
// Merges per-profile branches (Continua · OPS · Dupler · Leland · …) into
// a single canvas so the strata-experiences-demo can host all tenants from
// the same shell. Product repos split into pages/variants.
// ─────────────────────────────────────────────────────────────────────────────
```

### D · Demo-only (sin canonical prod)

No existe una versión producto real de este componente. Vive solo en
`inbound-outbound` (repo demo).

Header:
```ts
// ─────────────────────────────────────────────────────────────────────────────
// DEMO-ONLY component · no product-repo canonical.
// Originated in the inbound-outbound clone. If a product-repo version
// emerges, promote to Category A.
// ─────────────────────────────────────────────────────────────────────────────
```

## Estado por bloque (17 total · 14 shared + 3 widgets)

Actualizar esta tabla cada vez que se sincroniza un bloque. Última auditoría:
2026-07-20.

| ID | Categoría | Estado | Fuente (si A/B) | Snapshot commit | Última sync | Notas |
|---|---|---|---|---|---|---|
| `expert-hub-tx` | A | ✅ synced | `expert-hub/src/Transactions.tsx` | `f59da74` | 2026-07-20 | Pilot F19. 25 archivos deps copiados a `prod-imports/`. |
| `email-ingestion` | pending | 🟡 | `UI-Manufacturer/.../EmailSimulation.tsx` | — | — | Local +257 LOC de scaffolding preview-mode/autoplay. |
| `dealer-kanban` | pending B | 🔴 | `UI-Manufacturer/.../DealerMonitorKanban.tsx` | — | — | Local (5 cols + toolbar + list mode) > prod (3 cols baseline). |
| `mac` | pending A | 🔴 | `UI-Dealer/src/MAC.tsx` | — | — | Local 3× prod (294 vs 101 LOC). |
| `dashboard-shell` | pending C | 🔴 | — | — | — | Superset intencional que fusiona branches per-profile. |
| `crm-sim` | pending D | 🟢 | — (solo en inbound-outbound) | — | — | Sin canonical prod. |
| `approval-chain` | pending A | 🟡 | `UI-Manufacturer/.../ApprovalChainModal.tsx` | — | — | Wrapper thin · verificar que el modal interno sync. |
| `conv-survey` | pending D | 🟢 | — (solo en inbound-outbound) | — | — | Sin canonical prod. |
| `inventory-mgmt` | pending A | 🔴 | `UI-Dealer/src/Inventory.tsx` | — | — | Local 2× prod (2168 vs 957 LOC). |
| `tx-screen` | pending | 🟡 | `UI-Dealer/src/Transactions.tsx` | — | — | Ambigüedad · idéntico a inbound-outbound, drift real vs UI-Dealer. |
| `catalog-rules` | pending A | 🟢 | `UI-Dealer/src/Catalogs.tsx` | — | — | Diff mínimo (~4 LOC). Refresh trivial. |
| `order-forms` | pending A | 🟢 | `UI-Dealer/.../OrderCreationForm.tsx` | — | — | Diff mínimo (~9 LOC). |
| `erp-sync` | pending A | 🟡 | `UI-Dealer/.../ERPSyncModal.tsx` | — | — | Elegir variant (dealer 312 vs manuf 322). |
| `notif-center` | pending A | 🔴 | `UI-Dealer/.../ActionCenter.tsx` o UI-Manufacturer | — | — | Local 856 LOC, superset · decidir cuál variant prod es la verdad. |
| `three-way-match` | pending A | 🟢 | `UI-Manufacturer/.../ThreeWayMatchView.tsx` | — | — | Casi idéntico (~10 LOC drift). |
| `smart-quote-hub` | pending A | 🟢 | `UI-Manufacturer/.../SmartQuoteHub.tsx` | — | — | Idéntico byte-a-byte. |
| `confidence-score` | pending A | 🟢 | `UI-Manufacturer/.../ConfidenceScoreBadge.tsx` | — | — | Idéntico byte-a-byte. |

## Flujo para sincronizar un bloque (categoría A)

1. **Confirmar canonical prod** · qué sibling repo tiene la versión de
   verdad. Confirmar con `git log -1 --format="%h %ad" -- <path>` en el
   sibling repo para snapshot commit + fecha.
2. **Crear la estructura**:
   ```
   src/blocks/prod-imports/
   ├─ <Name>.tsx               ← copy directo
   ├─ deps/**                  ← deps transitivas (misma estructura)
   ├─ utils/**                 ← utils que `../../utils/...` referencia
   └─ wrappers/<Name>Wrapper.tsx  ← el adaptador demo
   ```
3. **Copy directo con `cp`** (bash) del componente + todas sus deps
   relativas. NO editar los archivos copiados. Insertar el header SOURCE
   solo en el archivo raíz (no en cada dep).
4. **Reapuntar imports raíz** en el archivo copiado a `./deps/...`.
5. **Iterar** vía `grep -rhoE "from '\./[^']+'|from '\.\./[^']+'" prod-imports/`
   para detectar deps transitivas faltantes. Copiar cada round hasta que
   `Failed to resolve` desaparece del log de Vite.
6. **Wrapper** con mock props + provider scoping si el prod usa un
   `TenantContext` con API distinta al local.
7. **Wire** en `src/config/sharedBlocks.tsx` swappeando el import viejo por
   el wrapper.
8. **Verificar**: TS clean, security scan clean, `?block=<id>` renderea
   igual visualmente a la URL prod.
9. **Actualizar esta tabla** con estado ✅ + commit hash + fecha.
10. **Commit atómico** con mensaje del formato:
    ```
    F19.<n> · prod-sync: <block-id> from <sibling-repo>@<hash>
    ```

## Reglas duras

- **NUNCA** editar un archivo bajo `src/blocks/prod-imports/` que NO sea el
  wrapper. Toda adaptación va en el wrapper. Si el wrapper no alcanza, la
  única salida es refactorear el componente en el sibling repo prod y
  re-sincronizar.
- **NO borrar** el componente heredado del clon (`src/components/simulations/...`
  o `src/<Page>.tsx` original). Sigue en uso por las experiencias tour
  con branches step-específicas (`isOps && stepId === '1.3'` etc).
  El swap solo afecta al shared block preview.
- **NO agregar imports desde `src/blocks/prod-imports/`** hacia fuera de
  esa carpeta. Los prod-imports son un island; el resto del repo no debe
  saber que existen (excepto `sharedBlocks.tsx` que los wire).
- **Sync bidireccional prohibido** · nunca hacer que un wrapper importe de
  un `prod-import` Y de un `src/components/...` original a la vez. El
  wrapper importa solo del prod-import.

## Cómo detectar drift a futuro

Cuando prod evoluciona, el snapshot commit del header queda desactualizado.
Para detectar drift:

```bash
# Diff local prod-import vs prod actual
diff \
  strata-experiences-demo/src/blocks/prod-imports/<Name>.tsx \
  <sibling-repo>/src/<original-path>/<Name>.tsx
```

Si el diff es mayor a ~50 líneas o toca render, re-sincronizar siguiendo
los pasos arriba y actualizar el snapshot commit + fecha en el header y
en esta tabla.
