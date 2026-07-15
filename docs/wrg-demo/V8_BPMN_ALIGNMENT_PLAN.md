# WRG Demo v8 — BPMN Alignment Plan

> **Status:** Draft · awaiting implementation
> **Owner:** Claude (pair programming with Diego)
> **Source of truth:** `wrg-read/diagram.svg` + `wrg-read/WRG_CONSOLIDATED_REFERENCE.md` + `wrg-read/MEETING_2026-03-27_WRG_Demo_Review.md`
> **Trigger:** Stakeholder feedback (Rey, March 2026) — "demo still does not cover the full process, risk of not closing the agreement"

---

## 1 · Why this plan exists

Rey and the WRG stakeholders reviewed the current v7 demo and flagged three blocking gaps:

1. **Ingestion is misrepresented.** The current `FileImportModal` is a generic file upload. The real process starts with the estimator **logging into CORE**, reading scope, and pulling PDFs that the design team already uploaded. Ingestion is an **extraction from CORE**, not a manual file drop.
2. **Project context is invisible.** The Delivery Pricer applies Section F multipliers (stairs, floors, dock, KD) and Section G transport charges (parking, downtown, hospital, >50 mi) based on site constraints. None of these appear in the demo, so the AI's value collapses to "count products" — which misses the point.
3. **Flow 2 has the wrong framing.** `w2.3 Representative handoff` currently shows Riley sending to an external "client representative" (Lauren Kim). The WRG process is internal — the labor estimate is a **WRG-internal artifact** that flows to the salesperson → SAC → PM. Client delivery is Phase 2 / out of scope per the Technical Proposal.

This plan restructures the demo to match the BPMN diagram exactly and surfaces the context data that makes the AI's job non-trivial.

---

## 2 · Current state diagnosis

### Mapping: BPMN etapas → demo actual

| # | Etapa BPMN | Demo v7 | Estado |
|---|---|---|---|
| 1 | Quote assigned in CORE → Outlook email triggered | ❌ | **Falta** |
| 2 | Estimator receives email | ❌ | **Falta** |
| 3 | Logs into CORE + reads scope (elevator/stairs/overtime/push distance/parking/downtown/hospital) | ❌ | **Falta** |
| 4 | Opens Product Selection Sheet | ⚠️ Implícito | **Parcial** |
| 5 | Opens Product Spec Sheet (PDF) | ⚠️ `JPS_specs.pdf` aparece en FileImportModal | **Parcial** |
| 6 | Reads each PDF line | ✅ BoM stagger en w1.1 | OK |
| 7 | Maps to delivery + installation categories | ✅ Mapping beat con chips | OK |
| 8 | Opens Delivery Pricer Excel | ❌ | **Falta** |
| 9 | Enters qty by category | ❌ | **Falta** |
| 10 | Applies Section F multipliers + Section G charges | ❌ **Crítico** | **Falta** |
| 11 | Calculates delivery subtotal (scope limits) | ⚠️ OperationalConstraintsPanel existe pero plano | **Parcial** |
| 12 | Opens labor worksheet (second Excel) | ✅ FinancialSummaryHero | OK |
| 13 | Enters line items + man-hours | ✅ | OK |
| 14 | $57/hr fixed, totals by area | ⚠️ Total sí, traza no | **Parcial** |
| 15 | Bid scenario gateway (15% breakdown / 85% lump sum) | ❌ | **Falta** |
| 16 | Submit to CORE | ⚠️ w2.2 simula "release into Strata" (confuso) | **Parcial** |
| 17 | CORE notifies salesperson | ❌ | **Falta** |
| 18 | Salesperson accepts / SAC assembles full quote | ⚠️ w2.3 lo muestra como "representante del cliente" | **Incorrecto** |

### Pain points · visualización

| Pain | Diagrama | Demo v7 |
|---|---|---|
| 🧠 TK — Tribal knowledge en cabeza del estimador | Explícito | ⚠️ Parcial (mapping chips sugieren pero no explican) |
| ✋ MAN — Manual por cada line item | Explícito | ✅ Stagger + mapping |
| ⚡ SILO — Dos Excel privados no conectados a CORE | Explícito | ❌ **Invisible** |
| ⏱ TIME — Horas por proyecto grande | Explícito | ✅ ReleaseSuccessModal metrics |
| ⚠ ERR — Mismatch, scope limits, wrong category | Explícito | ⚠️ Solo scope breach (119 chairs) |

---

## 3 · Restructured demo — v8

### Personajes (6 roles internos WRG)

| Rol v7 | Rol v8 | Justificación (doc) |
|---|---|---|
| David Park · Regional Sales Manager | **David Park · Senior Estimator** (Dallas) | BPMN etapas 10-14 es trabajo del estimator (ref: Mark Williams, Dallas) |
| Alex Rivera · Designer | Alex Rivera · Designer ✓ | Sin cambios — revisa escalated custom items |
| Sara Chen · Account Manager | **Sara Chen · Salesperson** (Dallas) | Stages 15-16: recibe email CORE, revisa/acepta |
| Riley Morgan · Sales Coordinator | **Riley Morgan · Sales Account Coordinator (SAC)** (Dallas) | Stage 17: SAC ensambla labor+product+markup |
| Jordan Park · VP Sales | Jordan Park · VP Sales ✓ | Firma final en release checklist |
| — | **James Ortiz · Senior Project Manager** (Dallas) · NEW | Stage 18: PM usa horas presupuestadas para delivery + installation |

### Step structure (6 steps, 2 flows)

| Step | Rol | Título | BPMN etapas |
|---|---|---|---|
| **w1.1** | Estimator | CORE Ingestion & Context | 1–3 (trigger → login CORE → scope + PDFs) |
| **w1.2** | Estimator | Dual-Engine Calculation | 4–14 (mapping + Delivery Pricer + Labor Worksheet + submit) |
| **w1.3** | Designer | Designer Verification | Custom item escalation path |
| **w2.1** | Salesperson | Labor Estimate Review | 15–16 (salesperson receives + accepts) |
| **w2.2** | SAC | Quote Assembly & Release | 17 (labor+product+markup → internal release checklist → client quote delivered) |
| **w2.3** | PM | Execution Handoff | 18 (PM plans delivery + installation) |

w1.1 y w1.2 se separan en dos steps para dar aire a la nueva ingesta CORE y al nuevo Project Context Panel.

---

## 4 · Nuevos módulos

### A. CORE Connection Modal (reemplaza `FileImportModal` en w1.1)

**Reutiliza:** `src/components/modals/ERPSyncModal.tsx` + `src/components/catalogs/CatalogImportModal.tsx`

Flow dentro del modal:

1. **Source picker** — dos tarjetas: `Connect to CORE (ERP)` (recomendado, pre-configurado) y `Manual upload` (fallback).
2. **CORE login screen (embedded)** — iframe-looking simulation del login real: logo CORE, username `dpark@wrgtexas.com`, password masked, "Connecting…" spinner. ~2 s handshake.
3. **CORE dashboard (embedded)** — mini-UI que simula la pantalla de proyectos pendientes de CORE:
   - Lista de 4–5 proyectos mock (JPS resaltado con badge "Awaiting estimator")
   - Cada row: customer, location, item count, date received, priority
   - Cursor simulado hace hover sobre JPS y click
4. **Project detail view (embedded)** — vista del proyecto JPS en CORE:
   - Attached files section: `JPS_PSS_ANCILLARY.pdf`, `JPS_Spec_Sheet.pdf`, `JPS_Contract.pdf`
   - Site constraints form (read from CORE): elevator ✓, stairs ✗, loading dock ✗, hospital ✓, downtown ✓, after-hours ✗, push distance 180 ft, transport 32 mi
   - "Pull into Strata" CTA (primary)
5. **Extraction phase** — mismo patrón que el FileImportModal actual: uploading → parsing → extracting → done. Pero ahora con los archivos reales del mock y el source label = "CORE · Project JPS_116719".
6. **Done** — modal cierra, w1.1 continúa con Project Context Panel visible.

**Characters/data a inventar:**
- Projects en el dashboard: JPS Health Center for Women · Fort Worth (Healthcare), Tarrant County Admin · Fort Worth (Commercial), Frost Bank HQ · Dallas (Commercial), Texas Health Resources · Arlington (Healthcare), Mesquite ISD · Mesquite (Education)
- Login credentials: David Park · `dpark@wrgtexas.com`

### B. Project Context Panel (nuevo, reemplaza/extiende `OperationalConstraintsPanel`)

**Reutiliza:** `OperationalConstraintsPanel.tsx` base + iconography

Card persistente que se muestra en w1.1, w1.2, w1.3, w2.1, w2.2, w2.3 (colapsable). Muestra el contexto del proyecto para que cada rol lo vea.

**Filas (editable + AI suggestions):**

| Ícono | Label | Valor JPS mock | AI highlight? |
|---|---|---|---|
| 📍 | Location | Fort Worth, TX · Downtown (+$57) | ✅ |
| 🏥 | Venue type | Healthcare · Hospital campus (+$114) | ✅ |
| 🏢 | Floor | 2nd floor (+5%) | |
| 🚪 | Loading access | No dock (+15%) · Elevator ✓ | ✅ |
| 📏 | Push distance | 180 ft from truck to install zone | |
| 🕐 | Hours | Standard business hours | |
| 🚚 | Transport | Dallas → Fort Worth · 32 mi | |
| 📐 | Floor area | 12,400 sq ft · 48 rooms | |
| 👷 | Crew needed | 4 installers · 3 days (AI est.) | ✅ |
| 🛠 | Equipment | Dollies, 2-wheelers, lift gate, PPE | |
| 🧰 | Tools | Allen wrench set, cordless drills, spacers | |
| ⚠️ | Scope flags | 119 KD chairs exceed Pricer limit (50) | ✅ |

**Comportamiento:**
- Cada row tiene un ícono brand + label + value.
- Rows con `aiHighlight` llevan ring-brand + chip "✨ AI flagged".
- Click en row → inline edit field. Para toggles (ej. `loading dock`), checkbox. Para números (push distance), input numérico.
- Cada edit dispara recálculo en vivo del Delivery Pricer (multipliers + transport charges cambian).
- Siguiere "💡 AI suggestion: Because this is a hospital campus, consider adding security coordination (+2 hrs)" como fila adicional que el estimator puede aceptar con un click.

**Archivo:** `src/features/strata-estimator/ProjectContextPanel.tsx` (nuevo)

### C. Dual-Engine Calculation View (w1.2)

Reemplaza la vista única del Financial Summary con **dos engines separados lado-a-lado**, reflejando que en la realidad son dos Excel distintos.

**Layout:**

```
┌─ DELIVERY PRICER ──────────┐  ┌─ LABOR WORKSHEET ──────────┐
│ Section A — Seating         │  │ Healthcare guest chairs     │
│ 119 KD chairs × 30 min     │  │ 40 × 0.20 hr = 8.0 hrs     │
│ 5 task stools × 25 min     │  │ 119 × 0.30 hr = 35.7 hrs   │
│ ...                         │  │ 17 × 0.50 hr = 8.5 hrs     │
│ Section F multipliers       │  │ ...                         │
│  · No dock +15%            │  │ Custom serpentine           │
│  · 2nd floor +5%            │  │  12.0 hrs ⚠ tribal knowledge│
│ Section G charges           │  │                             │
│  · Downtown +$57            │  │ Rate: $57/hr (fixed)        │
│  · Hospital +$114           │  │                             │
│                             │  │ Total: 185.04 hrs           │
│ Delivery subtotal: $3,421   │  │ Labor subtotal: $10,547     │
└─────────────────────────────┘  └─────────────────────────────┘

                    ↓ ↓ ↓
           ┌─── STRATA MERGES BOTH ───┐
           │  Combined: $13,968        │
           │  (first time ever in WRG) │
           └───────────────────────────┘
```

**Narrativa visual:**
- Los dos engines aparecen primero como cards separadas con un ícono de candado `🔒` en cada una y un subtitle "Private Excel · not in CORE".
- Una animación de "merge" pinta una línea brand conectándolos y revela el total combinado.
- Chip "⚡ SILO — first time combined" aparece al lado del total.

Esto visualiza el pain point #2 (dos herramientas desconectadas) del consolidated reference.

**Archivo:** `src/features/strata-estimator/DualEngineCalculation.tsx` (nuevo, reemplaza parte de `FinancialSummaryHero`)

### D. Salesperson Review View (w2.1)

Para Sara (Salesperson). Lo que ve es el labor estimate terminado + notification de CORE.

**Layout:**
- Inline email notification (CORE → Outlook): "New estimating request complete · JPS Health Network · $13,968"
- Read-only labor estimate summary (con Project Context Panel colapsado arriba)
- Actions:
  - **Accept & forward to SAC** (primary)
  - **Request clarification from estimator** (secondary — reuses existing RequestClarificationModal)
- Al aceptar: audit log + triggerHandoff(Salesperson → SAC) + nextStep.

**Archivo:** `src/features/strata-estimator/SalespersonReviewView.tsx` (nuevo)

### E. SAC Quote Assembly (w2.2)

Riley Morgan. Reutiliza todo lo actual de w2.1/w2.2 con reframe:

- PricingWaterfall sigue igual (MillerKnoll list → JPS contract discount → product net + labor + freight)
- ProposalActionBar sigue con Preview PDF / Request Clarification / Release
- ApprovalChainModal se renombra a **"Internal Release Checklist"** (4 sign-offs): David (Estimator), Alex (Designer), Sara (Salesperson), Jordan (VP Sales)
- David workspace detour se mantiene (la redirección a David para aprobar)
- ReleaseSuccessModal cambia copy: "Quote released to client · PM handoff next"

### F. PM Execution Handoff (w2.3) — reemplaza `ClientProposalDelivery`

James Ortiz (PM). La vista es INTERNA, no client-facing.

**Layout:**
- Inline HandoffBanner: "Riley Morgan (SAC) → James Ortiz (PM) · Quote released, ready for execution planning"
- Project Context Panel (colapsado arriba, persistente)
- **Execution Planning Card** (nuevo):
  - Delivery window: Week 8–10 (from proposal)
  - Crew assignments: Lead installer + 3 assistants (based on 185 hrs / 3 days / 8h day)
  - Tools required: Full install kit + lift gate
  - Transport: Dallas → Fort Worth, 32 mi, 1 truck
  - Site requirements: badge approval (hospital), security briefing, dock workaround
  - Special notes: 12-seat OFS serpentine requires 2-person assembly team
  - AI suggestions: "Coordinate with JPS facilities 3 days prior for dock access"
- Actions:
  - **Accept for execution** (primary) → final "Queued for execution" success state
  - **Flag for review** (secondary) → reopens clarification modal

**Final state:** "Handoff complete · JPS execution queued · crews assigned" — demo termina aquí, internal.

**Archivo:** `src/features/strata-estimator/PMExecutionHandoff.tsx` (rename de `ClientProposalDelivery.tsx`)

---

## 5 · Orden de implementación

Siguiendo la sugerencia del product owner (y el trade-off scope/impact):

### **Paso C · Reframe Flow 2 (current turn)**
Cambios cosméticos + rename roles. Baja complejidad, alto valor narrativo. ~1 turn.

- `roles.ts` — add James Ortiz (PM), rename David/Sara/Riley roles
- `wrg-demo.ts` — step titles, descriptions, messages, user actions
- `StrataEstimatorShell.tsx` — audit log copy, handoff messages, handler rename
- `ReleaseSuccessModal.tsx` — CTA copy
- `ApprovalChainModal.tsx` — re-caption as "Internal Release Checklist"
- `ClientProposalDelivery.tsx` → rename to `PMExecutionHandoff.tsx`, remove rep-preview cutaway, add execution planning card
- Commit + push

### **Paso A · CORE Connection (next turn)**
Replace `FileImportModal` with multi-step CORE connection flow. Medium complexity, highest stakeholder impact. ~2 turns.

- `CoreConnectionModal.tsx` (new) — source picker + login + dashboard + project detail + extraction
- `CoreProjectList.tsx` (new helper) — mock project list component
- `StrataEstimatorShell.tsx` — replace FileImportModal import + handler, extend beat timeline
- Mock data for CORE projects in `mockData.ts`
- Commit + push

### **Paso B · Project Context Panel (next turn)**
Rich iconography panel with AI suggestions and editability. Medium complexity, reinforces AI value. ~1 turn.

- `ProjectContextPanel.tsx` (new)
- `mockData.ts` — extend JPS with contextFacts array
- `StrataEstimatorShell.tsx` — render in w1.1/w1.2/w1.3/w2.1/w2.2/w2.3 (collapsible)
- Commit + push

### **Paso D · Dual-Engine Visualization (final turn)**
Separate delivery + labor engines lado-a-lado with merge animation. Medium complexity, closes the "two silo tools" pain point. ~1 turn.

- `DualEngineCalculation.tsx` (new)
- `FinancialSummaryHero.tsx` — refactor to use dual-engine internally or be replaced
- `mockData.ts` — extend with Delivery Pricer sections A-G data for JPS
- Commit + push

---

## 6 · Open risks

- **Scope creep.** The plan adds 4 new modules + restructures 2 steps. Total delta ~1500 LOC. Commit strategy: one commit per step (C/A/B/D), push after each.
- **Existing David detour coupling.** The David workspace redirect in w2.2 (Approve & Release → cutaway → signed) depends on current Shell state + ApprovalChainModal gating. Re-framing the approval chain as "release checklist" should not break the detour but needs testing.
- **Rep-preview cutaway we just built (w2.3).** It gets removed with the ClientProposalDelivery rewrite. No loss because it was the wrong framing — but note for the commit message.
- **Character names.** Inventing Marcus Holloway and James Ortiz — if the real WRG team doesn't like them, we can rename in 5 min. Confirmed with Diego that inventing is fine.
- **Animation timing.** Adding 4 new modules extends the total demo length. Current total ~90–120 s. v8 estimated ~140–180 s. Monitor and trim if the story drags.

---

## 7 · Pre-flight checklist

- [x] Diagram reviewed (18 stages)
- [x] Consolidated reference read (pain points + characters + rates)
- [x] Reusable components identified (Explore agent report)
- [x] Role matrix drafted
- [x] Step structure finalized (6 steps → implemented as 5)
- [x] New modules scoped
- [x] Paso C committed (`80b8f76`, `b9da29c`)
- [x] Paso A committed (`91b1868`)
- [x] Paso B committed (`6035844`)
- [x] Paso D committed (`a778884`)

---

## 8 · Post-v8 coverage audit (vs BPMN + consolidated reference)

After Paso C/A/B/D were shipped, we re-audited the BPMN diagram and the
consolidated reference against the live demo. Most of the flow is
covered, but 6 gaps remain.

### BPMN etapas · cobertura actual

| # | Etapa BPMN | Cobertura | Dónde |
|---|---|---|---|
| 1 | Quote assigned in CORE | ✅ | CORE dashboard queue + audit log |
| 2 | Outlook email triggered by CORE | ⚠️ Implícito | No hay beat visible |
| 3 | Estimator receives email in Outlook | ⚠️ Implícito | No se ve el email llegando |
| 4 | Logs into CORE + reads scope | ✅ | CoreConnectionModal |
| 5 | Opens Product Selection Sheet | ⚠️ Implícito | En attached files list |
| 6 | Opens Product Spec Sheet | ⚠️ Implícito | Idem |
| 7 | Reads each line of PDF | ✅ | BoM stagger |
| 8 | Maps to delivery + installation category | ✅ | Mapping beat |
| 9 | Opens Delivery Pricer Excel | ✅ | DualEngineCalculation Engine 1 |
| 10 | Enters qty by category | ✅ | Engine 1 lines |
| 11 | Applies Section F + G | ✅ | Engine 1 multipliers + charges |
| 12 | Calculates delivery subtotal | ✅ | Engine 1 total |
| 13 | Opens Labor Worksheet Excel | ✅ | Engine 2 with "Private Excel" chip |
| 14 | Assigns man-hours from memory | ⚠️ Parcial | TK pain no es explícito |
| 15 | Rate applied $57/hr | ✅ | Engine 2 rate row |
| 16 | Totals by area or floor | ❌ Falta | Total agregado, no por área |
| 17 | Bid scenario? (85% lump / 15% breakdown) | ❌ Falta | No se representa la decisión |
| 18 | Submit lump sum to CORE / attach breakdown | ❌ Falta | No hay beat explícito del write-back |
| 19 | CORE notifies salesperson | ⚠️ Implícito | Sara ve email pero no se ve CORE enviándolo |

### Pain points · cobertura actual

| Pain | Cobertura | Nota |
|---|---|---|
| 🧠 TK Tribal Knowledge | ⚠️ Parcial | Mapping fallback chips lo sugieren pero no se nombra |
| ✋ MAN Manual | ✅ | Stagger + DualEngine |
| ⚡ SILO Two disconnected Excels | ✅ | DualEngine merge animation |
| ⚠ ERR Wrong category / mismatch | ⚠️ Parcial | Solo scope breach. **Mismatch drawing vs spec NO** |
| ⏱ TIME Hours on large projects | ✅ | ReleaseSuccessModal metrics |
| 💾 No structured data layer | ⚠️ Parcial | DualEngine hint but no before/after |

---

## 9 · Paso E · Gap closure

Surgical fixes to cover the 4 highest-impact gaps without restructuring
the step count. Stays within the 5-step demo.

### Gap A · Bid scenario gateway (BPMN stage 17)

**Problem:** The diagram's gateway says ~85% of quotes go as lump sum
only and ~15% need a per-piece breakdown. Currently the demo produces a
full breakdown every time but does not call out that this is itself the
value unlock.

**Fix:** Add a chip or note on the DualEngineCalculation combined total
card:
`"⚡ Strata always produces a full breakdown · legacy process shipped
85% of quotes as lump sum only"`.

**Files:** `DualEngineCalculation.tsx`

### Gap B · Submit to CORE (BPMN stage 18)

**Problem:** There is no explicit beat where the estimator/agent writes
the labor estimate back into CORE. The demo jumps from w1.2 (designer
verification) to w2.1 (Sara review) without showing the hand-off
artifact: "labor estimate + audit trail + breakdown written to CORE,
Outlook email triggered to salesperson".

**Fix:** Render an inline `CoreOutlookCard` variant=`outgoing` at the
top of the w2.1 workspace for 2.5 s when the step enters, before Sara's
normal view reveals. Card shows:
- "Writing labor estimate back to CORE" spinner + progress
- "CORE → Outlook: notification sent to Sara Chen" line
- Auto-dismisses after 2.5 s

**Files:** `CoreOutlookCard.tsx` (new), `StrataEstimatorShell.tsx`

### Gap D · Mismatch risk (BPMN ERR annotation)

**Problem:** The BPMN's biggest ERR annotation is:
*"mismatch risk between typed scope quantities and the quantities
shown on the drawing · Estimator must cross-check both manually ·
no system check."*
The demo does not visualise this at all.

**Fix:** Extend `ScopeBreachAlert` to show a second compact line
explicitly calling out a mismatch the AI caught. Example:
`"⚠ Drawing shows 115 KD chairs · spec PDF lists 119 · AI flagged
mismatch automatically (no manual cross-check needed)"`.

**Files:** `ScopeBreachAlert.tsx`

### Gap F · CORE → Outlook trigger (BPMN stages 2-3)

**Problem:** Flow 1 starts with David opening CORE but the audience
never sees **why** David is opening CORE in the first place. The
trigger — "CORE assigned you a new estimating request" — is missing.

**Fix:** Render an inline `CoreOutlookCard` variant=`incoming` at the
very top of the w1.1 workspace for the first 1.8 s before the Import
button pulse + CoreConnectionModal kick in. Card shows:
- "📧 CORE → Outlook: new estimating request assigned"
- Customer preview: JPS Health Network · 24 items · Healthcare
- Auto-dismisses at 1.8 s, then the existing Import button pulse + CORE
  connection flow starts with all timers shifted by +1800 ms

**Files:** `CoreOutlookCard.tsx` (new), `StrataEstimatorShell.tsx`
(shift IMPORT_OFFSET from 9400 → 11200 ms)

### Paso E scope summary

| Gap | Effort | Impact |
|---|---|---|
| F · CORE → Outlook incoming | small | 🔴 High — opens the story |
| B · Write-back to CORE | small | 🔴 High — closes Flow 1 |
| A · Bid scenario note | tiny | 🟡 Medium — pain point surfaced |
| D · Mismatch alert extension | small | 🟡 Medium — pain point #3 surfaced |

Deferred to post-E:
- Gap C · Tribal Knowledge chip on DualEngine labor engine
- Gap E · Totals by area/floor breakdown
- Gap · Salesperson + Design pre-stages (1-8) as a backstory timeline

### Implementation plan (single commit)

1. New `CoreOutlookCard.tsx` component with `variant: 'incoming' | 'outgoing'`
   and phase handling (intro / body / fade-out)
2. `StrataEstimatorShell.tsx`:
   - Add `outlookCardVariant` + `outlookCardVisible` state
   - w1.1 timeline: render incoming card at t=0-1800, shift all CORE
     modal timers by +1800, bump IMPORT_OFFSET to 11200
   - w2.1 entry effect: render outgoing card at t=0-2500, delay Sara's
     auto-forward press to start at t=2500
3. `DualEngineCalculation.tsx`: add bid-scenario chip on the combined
   total card footer
4. `ScopeBreachAlert.tsx`: append a second "mismatch detected" line to
   the alert body
5. Build + commit + push
