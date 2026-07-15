# Experiences Board · strata-experiences-demo

Status board de las **12 experiencias** heredadas de `inbound-outbound`.
Fuente de verdad de qué se muestra por experiencia · `docs/experience-map.csv`
(módulo × experiencia × rol).

## Cómo leer este doc

- **Estado** — 🟢 baseline OK · 🟡 needs refresh · 🔴 broken/WIP.
- **UI-Legacy** — 🟢 alineado con DS actual · 🟡 divergencias detectadas ·
  🔴 patrones legacy dominantes (tabs `bg-primary text-white`, cards con
  hex hardcoded, iconos raw color, modals shell viejo, overlays `bg-black/`).
- **Roles** — cuántos roles distintos declara según el CSV.
- **Módulos CSV** — cantidad de features/scenes que el CSV asigna a esta
  experiencia (baseline objetivo).
- **Archivos clave** — paths dentro del repo que renderean esta experiencia.

Estados se completan durante **Fase F4 · smoke test** una vez que la
arquitectura declarativa esté lista (F2-F3).

## Registry actual (orden del dropdown Switch Demo)

| # | ID | Name | Icon | Estado | UI-Legacy | Roles (CSV) | Módulos (CSV) | Archivos clave |
|---|---|---|---|---|---|---|---|---|
| 1 | `inbound-outbound` | Inbound \| Outbound | 📦 | ⏳ F4 | ⏳ F4 | 2 (Dealer, Manufacturer) | 6 | `src/config/profiles/inbound-outbound.ts` · `src/components/manufacturer/*` · `src/pages/Transactions.tsx` |
| 2 | `officeworks` | Officeworks | 📐 | ⏳ F4 | ⏳ F4 | 3 (Designer, Sales Rep, Installer) | 3 scenes | `src/config/profiles/officeworks.ts` · `src/config/profiles/officeworks-data/` · Officeworks scene pages |
| 3 | `workspaces` | Workscapes | 📊 | ⏳ F4 | ⏳ F4 | ? | Workscapes-specific | `src/config/profiles/workspaces.ts` · `workspaces-data/` |
| 4 | `bfi` | BFI | 🏛️ | ⏳ F4 | ⏳ F4 | 2 (Manufacturer, Installer) | 2 (Pre-Award + Receiving) | `src/config/profiles/bfi.ts` · `bfi-data/` |
| 5 | `leland` | Leland | 🪑 | ⏳ F4 | ⏳ F4 | 2 (Dealer, Expert Hub) | 2 (Strata Shell + Review Queue) | `src/config/profiles/leland-demo.ts` · `leland-data/` · `src/features/leland/` |
| 6 | `mbi` | MBI | 🏢 | ⏳ F4 | ⏳ F4 | 1 (Designer) | 2 (Quotes + Design AI) | `src/config/profiles/mbi.ts` · `mbi-data/` |
| 7 | `wrg` | WRG | 🔧 | ⏳ F4 | ⏳ F4 | 3 (Quote-to-SIF, Dealer, CRM) | 1 (Strata Estimator) | `src/config/profiles/wrg-demo.ts` · `src/features/strata-estimator/` |
| 8 | `continua` | Continua | 🏗️ | ⏳ F4 | ⏳ F4 | 2 (Facility Manager, Manufacturer) | 2 shared + survey | `src/config/profiles/continua-demo.ts` |
| 9 | `dupler` | Dupler | 🏢 | ⏳ F4 | ⏳ F4 | 3 (Quote-to-SIF, Manufacturer, CRM) | 3 (PDF + Warehouse + Reporting) | `src/config/profiles/dupler.ts` |
| 10 | `ops` | OPS Demo | 📦 | ⏳ F4 | ⏳ F4 | 1 (Expert Hub) | 2 (Three-Way Match + ERP Sync) | `src/config/profiles/ops-demo.ts` |
| 11 | `coi` | COI | 🏗️ | ⏳ F4 | ⏳ F4 | Multiple (shared modules) | 1+ (Email Ingestion) | `src/config/profiles/coi.ts` + `coi-demo.ts` |
| 12 | `acme` | Acme Corp | 🪑 | ⏳ F4 | ⏳ F4 | Multiple (shared modules) | 1 (Email Ingestion) | `src/config/profiles/coi.ts` (aliased) |

## Módulos compartidos que aparecen en múltiples experiencias

Según el CSV, estos módulos se reusan en 2+ experiencias · candidatos a
levantar como componentes DS custom (si aún no lo son) y consumir desde
cada profile:

| Módulo | # Experiencias | Estado en repo |
|---|---|---|
| Dashboard (shared shell) | Todos los tour-based | `src/pages/Dashboard.tsx` · 3 variants (ops · continua · inbound-outbound) |
| Expert Hub Transactions | COI · Acme · Continua · OPS | `src/pages/Transactions.tsx` |
| CRM Simulation | COI · OPS · Continua | ? · verificar en F4 |
| Approval Chain Modal | Multiple | ? · buscar |
| Confidence Score Badge | Multiple | Widget · buscar en `packages/strata-ds/src/components/` |
| Smart Quote Hub | Multiple | Widget · buscar |
| Notification / Action Center | Multiple | ? · verificar |

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

1. F5 · Leland (superstar CSV)
2. F6 · Officeworks (más scenes específicas)
3. F7 · BFI (Pre-Award + Receiving)
4. F8 · CLC (Calendar/SharePoint/Intake · pendiente registrar como profile)
5. F9 · Continua
6. F10 · MBI
7. F11 · WRG
8. F12 · Dupler
9. F13 · OPS
10. F14 · Continua/CLC (Conversational Survey)
11. F15 · COI/Acme
12. F16 · Workspaces

## Notas de arquitectura

Actualmente `src/App.tsx` tiene ~180 líneas de `if (isMBI)` / `if (isLeland)`
scattered. Fase F2 los reemplaza por reads declarativas del profile
(`profile.features.showX`, `profile.navigation`, etc.). Ver el plan
`~/.claude/plans/cuddly-greeting-meadow.md` para detalles.
