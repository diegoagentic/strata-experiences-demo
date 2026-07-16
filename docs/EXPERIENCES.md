# Experiences Board · strata-experiences-demo

Status board · **13 experiencias end-to-end + 14 shared blocks + 3 widgets**.
Fuente de verdad de qué se muestra por experiencia · `docs/experience-map.csv`
(módulo × experiencia × rol).

## Cómo leer este doc

- **Estado funcional** — 🟢 renderea OK · 🟡 renderea con warnings o gap
  documentado · 🔴 broken (crash / dep rota).
- **UI-Legacy** — 🟢 alineado con DS actual · 🟡 divergencias detectadas ·
  🔴 patrones legacy dominantes. Auditoría UI se hace en F5-F16 (por ahora
  todas ⏳).
- **Notas** — hallazgos del smoke test F4 (2026-07-15).

## 13 experiencias end-to-end

| # | ID | Título | Estado | UI-Legacy | Notas F4 |
|---|---|---|---|---|---|
| 1 | `inbound-outbound` | Manufacturer Order Entry | 🟢 | 🟢 F16 | **No requiere `defaultApp`** · el shell heredado (Transactions con branch `isInboundOutbound` · tabs RFQs/Quotes/Orders/Shipping) ya renderea coherente en modo normal. Único profile que sigue el patrón original del clon. RoleSwitcher activo (manufacturer/dealer). 12 steps · 5 apps. |
| 2 | `clc` | Install Scheduling + Data Reconciliation | 🟢 | 🟢 F8 | Landing modo normal via `defaultApp: 'clc-dashboard'` (case ya wireado en F2.5). 2 progress bars inline → `<ProgressBar>`. **Pendientes** (skipped for scope): 70 Callout sites en 17 files + 87 raw color states + 5 `dark:bg-zinc-*` en scenes · Recharts hex → CSS vars. Grueso queda para F18 polish. Comentario cabecera dice 12 steps · runtime son 11. |
| 3 | `officeworks` | Spec Check & Design Validation | 🟢 | 🟢 F6 | Landing modo normal via `defaultApp: 'officeworks-dashboard'`. `OfficeworksDashboardScene` KPI cards adoptaron `<HeroMetric>`; `AckReviewScene` summary cards igual. **Gap CSV**: Labor & Delivery + Sales scenes (`manattLaborData` 583 LOC + `manattSalesData` 619 LOC + Dashboard 914/251 LOC + ReviewModal 6832/759 LOC) existen en `demo-2026-strata` y NO fueron copiadas · pendiente sync futuro. |
| 4 | `workspaces` | Expense Management End-to-End | 🟢 | 🟢 F14 | Landing modo normal via `defaultApp: 'workspaces-submit'` (Mobile OCR intake · primer step del flow). `WorkspacesPage` maneja los 4 apps (submit/approval/ap/reporting) internamente. Fixed F4 hotfix: tab "Spend Dashboard" navega bien. |
| 5 | `bfi` | Agency Fee Lifecycle | 🟢 | 🟢 F7 | Landing modo normal via `defaultApp: 'bfi-dashboard'` + fix del case latente ausente en `renderAppByName`. 13 steps · Pre-Award + Receiving + CPR. Cleanup de `dark:bg-zinc-*` skippeado: son paper-mock intencionales en document viewers. Follow-up: `PricingValidationScene` en producción tiene CORE-push state machine (Wendy feedback) que aún no está aquí · +17 scenes huérfanas candidatas a purga. |
| 6 | `leland` | PO-to-Order Automation | 🟡 | ⏳ F5 | 4 apps en tour · CSV solo formaliza 2 (Strata Shell + Review Queue). Inbox + Seradex son additions. |
| 7 | `mbi` | Back-Office AI (AP + AR + Quotes) | 🟢 | 🟡 F10 | Landing modo normal via `defaultApp: 'mbi-accounting'`. 70 archivos MBI · MBIPageShell propio existente (candidato consolidar con PageShell DS en F18). Refactor primitivas skipped scope (5 pages custom · tocar cada uno individualmente). `MBIOverviewPage`/`BudgetPage`/`DesignPage` siguen dead-code intencional (per Apr 27 stakeholder). |
| 8 | `wrg` | Labor Estimation | 🟢 | 🟢 F11 | Landing modo normal via `defaultApp: 'wrg-estimator'`. StrataEstimatorShell autocontenido con tabs internos · nav global vacío (correcto). ~20 componentes en `src/features/strata-estimator/` · refactor a primitivas DS pospuesto a F18 (bien encapsulado). |
| 9 | `continua` | Project & Inventory Intelligence | 🟢 | 🟡 F9 | Landing modo normal via `defaultApp: 'inventory'` (Continua no tiene apps custom · toda personalización es `isContinua && stepId === 'X.X'` en 10 archivos shared: Dashboard, Inventory, Transactions, MACPunchList, ExpertHub, DealerKanban, CRMSim, ConversationalSurvey, AckDetail, OrderDetail). Refactor a primitivas cruza cross-profile · alto riesgo de romper coi/acme/inbound-outbound · pospuesto a F18. 21 steps · 8 apps · rota nav a crmNav para step 3.1. |
| 10 | `dupler` | Vendor Data → SIF → Warehouse | 🟢 | 🟢 F12 | Landing modo normal via `defaultApp: 'dupler-pdf'` (primer flow · PDF Processor). Los 3 simulations (DuplerPdfProcessor · DuplerWarehouse · DuplerReporting) viven en `src/components/simulations/`. Refactor primitivas pospuesto a F18. |
| 11 | `ops` | Receiving → Invoice → QB Sync | 🟢 | 🟡 F13 | Landing modo normal via `defaultApp: 'dashboard'` (Apex Furniture usa Dashboard shared con branch `dashboardVariant: 'ops'` cuando aplique). Sin apps custom (`ops-*`) · como Continua, personalización vive en ramas `isOps && stepId === 'X.X'` en shared files. Refactor primitivas cross-profile skipped scope. |
| 12 | `coi` | Email RFQ → PO → Warranty | 🟢 | 🟡 F15 | Landing modo normal via `defaultApp: 'email-marketplace'` (RFQ intake · primer step del flow). 27 steps · consumidor más pesado del stack shared (Email + Kanban + Expert Hub + MAC + CRM + Dashboard). Refactor cross-profile pospuesto a F18. |
| 13 | `acme` | Dealer RFQ → PO | 🟢 | 🟡 F15 | Landing igual a COI (`defaultApp: 'email-marketplace'`) · reutiliza `COI_STEPS` (23 steps · sin CRM). |
| 14 | `crm` | CRM Standalone | 🟢 | ⏳ F18 | **[F16.5]** Nueva 14ª experiencia agregada por CSV alignment · row `CRM Standalone App · Feature module · Strata CRM` (fila 34 del CSV). Landing modo normal via `defaultApp: 'crm'`. Reutiliza `<CRMSimulation>` shared. 8 steps existentes (previamente dead-code en `src/config/profiles/crm.ts`). |

## CSV alignment (F16.5)

El dropdown Experiences se reordenó según el orden del CSV
`docs/experience-map.csv` + se agregó una división visual en 2 subgrupos
via el nuevo field `experienceKind`:

- **Feature modules** (8) · rows con `Category: Feature module` en CSV.
  Orden CSV literal: WRG · Dupler · CLC · Officeworks · BFI · Leland ·
  MBI · Strata CRM.
- **Tour profiles** (6) · rows que solo aparecen en `Profile(s)` como
  consumers de shared modules. Orden: Inbound|Outbound · Workscapes ·
  Continua · OPS · COI · Acme.

Los subtitles Officeworks / MBI se mantienen "honest tour" (reflejan lo
que hay implementado, no literal CSV) por decisión Diego (2026-07-16).

## 14 shared building blocks

| # | ID | Componente base | Estado | Notas F4 |
|---|---|---|---|---|
| 1 | `email-ingestion` | `EmailSimulation` | 🟡 | Destructura `demoProfile` de `useDemo()` (no existe en el contexto). Silencioso por optional chain, renderea. |
| 2 | `dealer-kanban` | `DealerMonitorKanban` | 🟢 | Overlays step-específicos quedan hidden por defecto. |
| 3 | `expert-hub-tx` | `ExpertHubTransactions` | 🟢 | Fallback a lista base cuando ningún step matchea. |
| 4 | `mac` | `MAC` | 🟢 | Estado default limpio. |
| 5 | `dashboard-shell` | `Dashboard` | 🟢 | Fixed F4: `SharedBlockShell` ahora envuelto en `GenUIProvider` · antes crasheaba porque `Dashboard` usa `useGenUI()`. |
| 6 | `crm-sim` | `CRMSimulation` | 🟢 | Render limpio con `activePage: undefined`. |
| 7 | `approval-chain` | `ApprovalChainModal` (wrapper) | 🟢 | Modal puro · abre por default. |
| 8 | `conv-survey` | `ConversationalSurvey` | 🟢 | Path genérico (no-continua). |
| 9 | `inventory-mgmt` | `Inventory` | 🟢 | Layout base sin Navbar. |
| 10 | `tx-screen` | `Transactions` | 🟢 | Fixed F4: SmartQuoteHub interno ahora funciona por el mismo GenUIProvider wrapper. Layout hereda tabs de inbound-outbound (esperado con default profile). |
| 11 | `catalog-rules` | `Catalogs` | 🟢 | Solo usa TenantContext. |
| 12 | `order-forms` | `OrderCreationForm` (wrapper) | 🟢 | Form puro · callbacks noop. |
| 13 | `erp-sync` | `ERPSyncModal` (wrapper) | 🟢 | Modal puro · abre por default. |
| 14 | `notif-center` | `ActionCenter` (wrapper) | 🟢 | Renderea vacío/base (sin currentStep match). |

## 3 widgets

| # | ID | Componente base | Estado | Notas F4 |
|---|---|---|---|---|
| 1 | `three-way-match` | `ThreeWayMatchView` | 🟢 | Widget puro · 4 líneas mock (match/mismatch/partial). |
| 2 | `smart-quote-hub` | `SmartQuoteHub` | 🟢 | Wrappeado en GenUIProvider local propio. |
| 3 | `confidence-score` | `ConfidenceScoreBadge` | 🟢 | Presentational · 3 tamaños comparados. |

## Bugs fixed en F4

- 🔴 `dashboard-shell` crash cuando el user abría el bloque · `Dashboard`
  invocaba `useGenUI()` sin provider en el árbol pre-block. Fix: envolver el
  `SharedBlockShell` con `GenUIProvider`. Beneficio colateral: `tx-screen`
  también deja de crashear cuando el user abre el SmartQuoteHub interno.
- 🟡 `workspaces` tab "Spend Dashboard" apuntaba a `page: 'workspaces-dashboard'`
  · no existía como `SimulationApp`, click muerto. Ahora apunta a
  `workspaces-reporting` (el app real).
- 🧹 Dead imports en `sharedBlocks.tsx` (`CRM`, `ServiceNowSimulation`)
  removidos.

## Gaps documentados (van a F5-F16)

- **Officeworks**: agregar tours de Labor & Delivery + Sales Scenes (CSV
  los pide) o documentar exclusión.
- **CLC**: reconciliar comentario cabecera (12 steps) vs steps reales (11).
- **MBI**: decidir si eliminar dead code de Overview/Budget/Design o
  reactivar tour.
- **`EmailSimulation`**: quitar destructuring de `demoProfile` en `useDemo()`
  o exponer el field en `DemoContextType`.
- **`crm.ts`** en `src/config/profiles/`: 8 steps definidos, no consumido
  en `DEMO_PROFILES`. Decidir si registrar como CRM Standalone (feature
  module del CSV) o eliminar.

## Reglas de refinamiento (Fases F5-F16)

Cada experiencia pasa por estos 7 pasos antes de considerarse "done":

1. **Auditoría funcional** vs CSV · gaps de features.
2. **Auditoría UI vs DS actual** · grep de `hex JSX`, `text-white`, `bg-black/`,
   raw color classes.
3. **Update a DS Strata última** · swap a tokens semánticos + componentes DS.
4. **Simplificar legacy** · remover código muerto compartido.
5. **Ajustar `profile.features` declarativas**.
6. **TS check + scan security + commit LOCAL**.
7. **CHECKPOINT Diego** · comparación visual antes/después.

## Orden de refinamiento (F5-F16)

Basado en # experiencias touched del CSV + prioridad comercial:

1. F5 · **PO-to-Order Automation** (Leland · superstar CSV)
2. F6 · **Spec Check & Design Validation** (Officeworks · 17 steps, más scenes)
3. F7 · **Agency Fee Lifecycle** (BFI · Pre-Award + Receiving)
4. F8 · **Install Scheduling + Data Reconciliation** (CLC · recién importado)
5. F9 · **Project & Inventory Intelligence** (Continua · 4 flujos)
6. F10 · **Back-Office AI (AP + AR + Quotes)** (MBI)
7. F11 · **Labor Estimation** (WRG · Strata Estimator)
8. F12 · **Vendor Data → SIF → Warehouse** (Dupler)
9. F13 · **Receiving → Invoice → QB Sync** (Apex Furniture / OPS)
10. F14 · **Expense Management End-to-End** (Workscapes)
11. F15 · **Email RFQ → PO → Warranty** (COI + Acme)
12. F16 · **Manufacturer Order Entry** (Senator · Inbound|Outbound)

## Notas de arquitectura

- Arquitectura declarativa refactor · **F2 done** (title/subtitle + features).
- CLC importado completo · **F2.5 done** (13ª experiencia).
- Shared blocks + widgets aislados · **F2.6 done** (17 entries adicionales
  en dropdown).
- RoleSwitcher generalizado · **F3 done** (`roleSignal` + `<RoleSwitcher />`
  registry-driven).
