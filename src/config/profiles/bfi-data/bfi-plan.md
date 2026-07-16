# Plan Integrado — Demo BFI Furniture (Strata)

> Última revisión: 2026-05-06
> Proyecto: `demo-2026-strata` · React 18 + TypeScript + Tailwind CSS + Vite
> Repositorio: `diegoagentic/demo-2026-strata` · rama `master`
> Dev server: `http://localhost:8085`
> **Fecha de presentación: 14 de mayo — ~8 días hábiles disponibles**
> **Presentadores: CEO de la empresa o Wendy (SME Avanto/Strata)**

---

## Estado de implementación

| Fase | Estado | Notas |
|---|---|---|
| **1 — Shell + nav** | ✅ Completa | BFIPage, demoProfiles, App.tsx |
| **2 — Queue + Monitor** | ✅ Completa | CoNYMorningQueue, CoNYOrderMonitorScene |
| **3 — Pricing + CPR** | ✅ Completa | PricingValidationScene, CPRReconciliationScene |
| **4 — Fee + Dispatch** | ✅ Completa | AgencyFeeVerifyScene, WorkOrderDispatchScene |
| **5 — Polish + presentación** | 🔲 Pendiente | DS audit, timings 400ms+, dark mode, pause controls |
| **6 — Buffer / rehearsal** | 🔲 Pendiente | Flujo completo b1.1→b2.2, timing para CEO/Wendy |

---

## 1. Plataforma y stack

| Capa | Tecnología | Notas |
|---|---|---|
| UI framework | React 18 + TypeScript | Vite, strict mode |
| Estilos | Tailwind CSS + Design System tokens | Semánticos exclusivamente (`bg-card`, `bg-ai`, `text-success`, etc.) |
| Navegación demo | `DemoContext` + `useDemo()` hook | Maneja `currentStep`, `isDemoActive`, `goToStep` |
| Tour steps | `src/config/profiles/bfi.ts` | Ids: `b1.1` → `b2.2` |
| Iconos | Lucide React | Consistente con MBI |
| Animaciones | Tailwind transitions + `setTimeout` con `pauseAware` | Patrón del proyecto |
| Componentes base | MBI library (`MBIWizardShell`, `MBIPageShell`, etc.) | Ver sección 3 |

**Principio de interacción:**
> Cada escena simula a un operador real usando el producto. Las transiciones ocurren por acciones con sentido (aprobar, revisar, despachar) — nunca por un botón "Siguiente". El demo se siente como una sesión de trabajo, no como una presentación. Patrón aplicado: Dupler + Leland (botón semántico como side effect de nextStep).

### Requisitos de presentación en vivo (CEO / Wendy)
- **Animaciones:** velocidad media-lenta. Mínimo 400ms por transición visible.
- **Pause controls:** `isPausedRef` + `pauseAware` en todos los `setTimeout`. Patrón ya aplicado en los 6 componentes BFI.
- **Sin auto-advance:** ninguna escena avanza sola. El avance siempre requiere acción del presentador.
- **Estados estables:** cada escena se ve bien en pausa indefinida.
- **Fallback manual:** step buttons del wizard permiten navegar si el tour se desincroniza.

---

## 2. Principio de contenido — Roles, no nombres propios

| Persona real | Rol en la UI |
|---|---|
| Account Manager DeMar | CoNY Account Lead |
| Manager Boyle | Director of Strategic Accounts |
| Lena Cisowski | Receiving Coordinator |
| Nancy Bos (Miller Knoll) | MK Invoice Processor |
| Operations Manager Bly | CoNY Project Manager |
| Finance Lead Halbert | Finance / AR |

---

## 3. Archivos del proyecto BFI

### Configuración
| Archivo | Descripción |
|---|---|
| `src/config/profiles/bfi.ts` | Steps b1.1→b2.2, stepBehavior, stepMessages, selfIndicatedSteps |
| `src/config/demoProfiles.ts` | + tipos `bfi-agency-fee` / `bfi-receiving`, `DemoProfileId 'bfi'`, entrada DEMO_PROFILES |
| `src/App.tsx` | + `isBFI`, `bfiNav`, `bfiAppName`, `appToTab`, `case 'bfi-agency-fee'/'bfi-receiving'` |

### Componentes
| Componente | Path | Escena |
|---|---|---|
| `BFIPage` | `components/bfi/BFIPage.tsx` | Shell 2 tabs + DemoContext sync |
| `CoNYMorningQueue` | `components/bfi/CoNYMorningQueue.tsx` | b1.1 · Queue AI triage |
| `PricingValidationScene` | `components/bfi/PricingValidationScene.tsx` | b1.2 · SIF vs contrato CoNY |
| `CPRReconciliationScene` | `components/bfi/CPRReconciliationScene.tsx` | b1.3 · Horas CPR vs cotizadas |
| `AgencyFeeVerifyScene` | `components/bfi/AgencyFeeVerifyScene.tsx` | b1.4 · Fee vs MK Invoice Processor |
| `CoNYOrderMonitorScene` | `components/bfi/CoNYOrderMonitorScene.tsx` | b2.1 · WIG monitor + FedEx gap |
| `WorkOrderDispatchScene` | `components/bfi/WorkOrderDispatchScene.tsx` | b2.2 · Work order + CoNY PM |

### Reutilización MBI (sin cambios)
`MBIPageShell` · `MBIWizardShell` · `MBIPersonaBadge` · `DataSourcesBar` · `ReasonDialog`

---

## 4. Tour steps

```
b1.1  Flow 1: Agency Fee AI  →  CoNY Morning Queue        app: bfi-agency-fee
b1.2  Flow 1: Agency Fee AI  →  Pricing Validation        app: bfi-agency-fee
b1.3  Flow 1: Agency Fee AI  →  CPR Reconciliation        app: bfi-agency-fee
b1.4  Flow 1: Agency Fee AI  →  Agency Fee Verification   app: bfi-agency-fee
b2.1  Flow 2: Receiving AI   →  Order Status Monitor      app: bfi-receiving
b2.2  Flow 2: Receiving AI   →  Work Order Dispatch       app: bfi-receiving
```

---

## 5. Datos realistas del demo

### Órdenes en queue (b1.1 / b2.1)
| Orden | Agency | Valor | Status |
|---|---|---|---|
| DOE-2847 | NYC Dept. of Education | $48,200 | CPR Pending ⚠️ |
| NYPD-0394 | NYPD Precinct 40 | $31,750 | Pricing Validation |
| DCAS-1182 | NYC DCAS | $127,400 | Receiving — FedEx gap |
| DOH-0671 | NYC Dept. of Health | $22,100 | ✅ Listo para despachar |

### CPR (b1.3) — DOE-2847
| Categoría | Cotizadas | CPR | Diff | Valor |
|---|---|---|---|---|
| Teamsters | 24h | 24h | — | — |
| Carpenters | 50h | 45h | -5h | -$1,800 |
| OT Carpenters | 8h | 6h | -2h | -$540 |
| Inside Delivery | 4h | 4h | — | — |
| **Total** | | | | **-$2,340** |

### Agency Fee (b1.4) — DOE-2847 · T-code 18%
| Producto | Lista | Fee | MK Reporta | Match |
|---|---|---|---|---|
| Lounge Seating ×12 | $84,000 | $15,120 | | |
| Workstations ×24 | $144,000 | $25,920 | | |
| **Total** | | **$41,040** | **$41,040** | **✅** |

### Pricing (b1.2) — NYPD-0394 · Descuento 42.3%
| Producto | SIF | Contrato CoNY | Estado |
|---|---|---|---|
| Workstations ×18 | $108,000 | $108,000 | ✅ |
| Task Chairs ×18 | $32,400 | $32,400 | ✅ |
| Filing Units ×6 | $8,100 | $7,560 | ⚠️ Ajustado |

### Receiving (b2.1) — WIG monitor
| Orden | Received% | Días WIG | Días restantes |
|---|---|---|---|
| DOH-0671 | 100% | 22 días | 8 días ⚠️ |
| DCAS-1182 | 72% | 18 días | 12 días |
| NYPD-0394 | 45% | 8 días | 22 días |

FedEx gap DCAS-1182: `FX284920 · FX284921 · FX284922` — POD request enviado a MK Contact.

---

## 6. Reglas de interacción — NO hacer

| ❌ No hacer | ✅ En cambio |
|---|---|
| Botón "Siguiente ›" genérico | Botón semántico: "Aprobar revisión CPR", "Confirmar despacho" |
| Modal "¿Listo para continuar?" | CTA inline que aparece solo cuando la animación termina |
| Spinner genérico | Banner AI con descripción específica de lo que Strata procesó |
| Datos obvios ($1, Test Order) | Agencias reales NYC, labor categories sindicales, T-code 18% |
| Overlay "Demo Mode" | El demo se vive como producto, no se anuncia como demo |

---

## 7. Criterios de éxito (Fase 5)

- [ ] `npx tsc --noEmit` limpio
- [ ] Sin colores hardcoded — solo tokens semánticos
- [ ] Pausa funciona en cada escena (todos los `setTimeout` usan `pauseAware`)
- [ ] Dark mode automático vía tokens
- [ ] Timing mínimo 400ms por transición visible
- [ ] Flujo completo b1.1→b2.2 sin interrupciones (~8-10 min)
- [ ] CEO puede señalar cualquier elemento — la respuesta está en los datos

---

## 8. Tech Lead — Blockers para producción

| # | Blocker | Acción | Owner |
|---|---|---|---|
| 1 | CORE API License no activa | BFI activa license con RPC vendor | BFI + Avanto |
| 2 | Formato CPR docs no confirmado | Director Strategic Accounts envía 3–5 samples | Manager Boyle |
| 3 | T-codes CoNY no exportados | Confirmar acceso Noel & Miller site | Kate / Michael |
| 4 | R Drive local (VPN) | Decisión de migrar a SharePoint | BFI (Kate) |

### Tecnologías candidatas
| Oportunidad AI | Tecnología | Confiabilidad |
|---|---|---|
| Email parsing (WIG docs, CPR) | Microsoft Graph API webhooks | Alta si M365 |
| WIG Word doc extraction | python-docx + Claude API | Alta |
| CPR extraction | Depende del formato (Blocker #2) | Variable |
| CORE read/write | RPC CORE API REST/SOAP post-license | Alta |
| Agency fee calculator | Server-side T-code lookup, sin LLM | Alta |
| FedEx gap detection | Omni EDI extendido o FedEx API | Media |
| CoNY PM notification | Microsoft Graph o SendGrid | Alta |
| Kate dashboard | Power BI (ya conectado a CORE) | Alta |
