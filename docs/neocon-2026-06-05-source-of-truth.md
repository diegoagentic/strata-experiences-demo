# Plan — Source of Truth post-reunión Neocon (2026-06-05 8:07PM) + plan de acción escalonado

## Context

La reunión de revisión Inbound/Outbound del 2026-06-05 con Wendy Marchuck, Christian Mejia, Asly Olarte, Kenya Perez, Magda C. Sanchez, Leydi Valbuena, Daniela Puerta y Diego Zuluaga generó una lista grande de cambios. Adicionalmente Wendy compartió un PDF de feedback ("Feedback from teams NEOCON.pdf") con 18 ítems numerados.

Demo target: **Sunday 2026-06-07**. Margen: ~36 horas desde la reunión.

### Jerarquía de autoridad (importante para resolver conflictos)

1. **Wendy Marchuck** es la aprobadora del demo. Sus decisiones priman sobre el resto.
2. **Transcripción de la reunión > PDF** cuando hay conflicto. Razón: el PDF fue escrito ANTES de la reunión, la reunión es la última palabra.
3. Asly, Kenya, Magda, Leydi contribuyen con conocimiento de negocio pero las decisiones finales las cierra Wendy.
4. Christian arbitra implementación pero la dirección la marca Wendy.

## Ask de Matt (llamada paralela a Wendy · 0:30 del transcript)

Wendy abrió la reunión con esto:

> "Matt had called me separately on my cell phone. He wants to make sure that we're showing that **input can be received like in volume**, meaning it could be an Inbox that's being monitored. And we're capturing from that Inbox the requests that are coming in. Or it could be that it's just a drag and drop to receive the information."

Matt quiere que el demo demuestre **ingesta de alto volumen** desde 2 canales:
1. **Inbox monitoreado** (auto-captura de emails)
2. **Drag-and-drop manual** (upload de docs)

**Estado de la conversación**: Christian mostró el Smart Comparator/OCR flow del Quote Converter. Wendy dijo "we should show an upload document in RFQ and POs". Luego ella misma se corrigió: el manufacturer no carga docs manualmente, así que el manual upload affordance en RFQ/PO no aplica. La conversación derivó en "remover Manual source" y **el ask original de volumen quedó parcialmente sin cerrar**.

### Diagnóstico · qué tenemos hoy vs qué falta para cerrar el ask de Matt

| Affordance | Hoy | Notas |
|---|---|---|
| Upload modal 4-step (Select→Selected→Uploading→Complete) | ✅ | En QuoteConverter.tsx · solo SIF Generator demo |
| Drag-and-drop upload con file validation | ✅ | En QuoteConverter.tsx (`onDrop` handler) |
| Estado `ocr-running` con "Calculating…" spinner + auto-resolve a `ready` después de 4s | ✅ | QuoteConverter.tsx `finishUpload` |
| Toast `"{n} uploaded · OCR running"` | ✅ | QuoteConverter.tsx fireToast |
| Documentos prepended al list inmediatamente tras upload | ✅ | Es justo lo que muestra volumen entrante |
| Source field en cada row de Transactions (Email, Dealer Portal, etc.) | ✅ | Pero es metadata estática, no signal de "live" |
| Ingestion event notifications en ActionCenter (`Acknowledgement-7841 confirmed`, `Miller Knoll quote received`) | ✅ | Tipo `ack_received` y `quote_update` |
| Sequential progress en BFI demo step a1.1 (staggered 600ms) | ✅ | Solo en BFI, no en inbound-outbound profile |
| **Panel "Inbox Monitor" mostrando emails arriving en real-time** | ❌ | No existe en ningún archivo |
| **KPI card "X documents ingested today" en Dashboard** | ❌ | Dashboard tiene métricas de pipeline, no ingestion volume |
| **Live badges "Just now via Email" / "Arrived 2m ago" en rows de Transactions** | ❌ | dateLabels son estáticos ("Mar 12, 2026") |
| **Auto-spawn de docs nuevos durante demo (simular volumen continuo)** | ❌ | El OCR Running solo aparece tras upload manual |
| **Animación de fila "flying in" cuando llega un doc nuevo** | ❌ | No hay framer-motion ni animación de inserción |

### Opciones para cerrar el ask de Matt

**Opción A · Inbox Monitor widget** (la más explícita y demo-friendly)
- Panel al inicio de Transactions (o como nuevo widget en Dashboard) que muestra los últimos N eventos de ingesta
- Estilo: "📧 RFQ from NorthPoint Furniture Group · arrived 2m ago via Email", "📑 PO from Cascade Workplace · arrived 5m ago via Dealer Portal"
- Counter top: "**24** documents ingested today · 18 via Email · 4 via Dealer Portal · 2 via NetSuite"
- Auto-refresh cada 30s con timestamp relativo que va corriendo

**Opción B · KPI cards + sparkline en Dashboard**
- Card "Ingestion volume today: 24 docs" con breakdown por source
- Sparkline mini-chart mostrando last 7 days
- "Last ingested: 2m ago" footer
- Menos espacio pero más cuantitativo

**Opción C · Live badges "Just now" en rows de Transactions**
- Recently arrived items muestran badge `🟢 Live · 2m ago` que se desvanece al envejecer
- Auto-refresh badges cada 30s
- Combinable con A o B

**Opción D · Auto-spawn de docs durante demo (simular volumen continuo)**
- Cada 60-90s durante el demo, agregar un nuevo doc "OCR Running" al inicio del list de RFQ/PO
- Animación slide-in + toast "New RFQ from {dealer} via Email"
- Después de 4-6s pasa a status normal
- El presentador puede señalar "ven, está siempre llegando"

**Recomendación pragmática para Sunday demo**: combinar **A** (Inbox Monitor widget en Transactions) + **D** (auto-spawn cada 60s durante demo). A explica el "qué" visualmente, D demuestra el "volumen" en vivo durante la presentación.

### TBD añadido por este ask

5. **¿Cuál opción implementar para Matt?** Recomendación: A + D. Alternativa más simple: solo B (sparkline en Dashboard). **Pendiente decisión user**.

### Referencia: Smart Comparator en producción (`dev-strata.orderbahn.com/smart-comparator/ocr`)

Christian mostró este URL en la reunión como el "ejemplo de cómo funciona" la ingesta automática + manual. Confirmado por screenshots del user:

**Estructura producción**:
- **Kanban con 7 columnas**: `Ingesting` · `Needs Attention` · `Awaiting Expert` · `In-Progress` · `Reconciled` · `Completed` · `Deprecated`
- **Botón `Upload Document`** top-right (drag-and-drop manual)
- **Cards por documento**: nombre + tipo (badge `QUOTE` / `PO` / `ACK`) + filename + line items count + tiempo desde upload + action icons
- **Upload modal de 5 pasos** (1 MÁS que el demo actual):
  1. **NUEVO**: Select document type (`Purchase Order` / `Acknowledgment` / `Quote`)
  2. Drop PDF files (drag-and-drop) — con breadcrumb back al type selection
  3. Review files (X Selected, list, Add more, Upload N file button)
  4. Uploading progress
  5. Upload Complete success

**Mapeo · demo actual (QuoteConverter.tsx) vs producción**:

| Feature | Producción Smart Comparator | Demo QuoteConverter | Gap |
|---|---|---|---|
| Drag-and-drop upload | ✅ | ✅ | — |
| Multi-step modal | 5 steps | 4 steps | **Falta step 1: select document type** |
| Kanban por status | 7 columnas | Tabla con funnel filter | Diferente layout pero equivalente |
| Document type badge (QUOTE/PO/ACK) | ✅ | Parcial (kind field existe pero no se ve como badge prominente) | Refinable |
| "Calculating…" placeholder | ✅ (en columna Ingesting) | ✅ (con spinner) | — |
| Auto-resolve a status terminal | ✅ | ✅ (después de 4s) | — |

### Respuesta concreta a las 3 preguntas (¿emular?, ¿secciones?, ¿rol?)

Re-leyendo el segmento clave del transcript (4:32 - 10:00) con cuidado:

**Pregunta 1: ¿Wendy quiere emular este proceso?**
- **Sí**, pero **NO en RFQ/PO del manufacturer view**. Lo que ya emula bien es el **Quote Converter (SIF Generator)** que tiene el mismo flujo 4-step.
- Wendy literalmente dijo: "we should show an upload document" en RFQ + POs, y después se corrigió: "but that would be from the dealer side. That's what's making this complex. Because this is the manufacturer view, and the manufacturer would not be uploading those documents."
- Christian cerró: "yeah, then then we don't want to have that manual part and remove the manual source because it makes no sense."

**Pregunta 2: ¿En qué secciones?**
- **DEMO actual (manufacturer view)** → SOLO en Quote Converter (ya existe, equivalente a producción). NO en RFQ ni PO tabs.
- **Para Matt's volume ask** → NO con upload manual sino con **simulación de Inbox monitoring** (Christian: "Diego probably we can emulate going into an Email Inbox, and show that an email has just arrived with some information, and then we can simulate that it got into ingesting after a certain period of time"). Esto es la Opción A + D del plan.

**Pregunta 3: ¿Bajo qué rol?**
- **Manufacturer view** (rol actual del demo · Sara Chen / Daniela Puerta): NO upload affordance en RFQ/PO. Reciben via Inbox monitoreado + auto-ingest.
- **Dealer view** (vía `useViewAs() === 'dealer'`): aquí SÍ tendría sentido el upload affordance (el dealer sí carga manualmente quote requests para enviar al manufacturer). Pero **Wendy NO autorizó construir esto explícitamente**. Wendy dijo "this is for a manufacturer to look at... is being presented at Neocon" — el demo de Sunday es manufacturer-focused.
- **Por ahora**: dejar el upload solo en Quote Converter (sirve a ambos roles para SIF generation). Si Wendy/Matt piden agregar upload en dealer view de RFQ/PO post-Sunday, lo agregamos en V2.

### Implicaciones para Fase 0 del plan de acción

Refinamiento de la recomendación A + D con base en el Smart Comparator de producción:

1. **NO duplicar el upload modal en RFQ/PO tabs** — eso fue rechazado por Wendy. El upload sigue solo en Quote Converter.
2. **Considerar agregar el step "Select document type"** al Quote Converter para matchear producción (Purchase Order / Acknowledgment / Quote). Hoy el upload va directo a Quote por default. **TBD adicional**: ¿agregar este step? Recomiendo SÍ porque acerca el demo al producto real.
3. **Para el Inbox Monitor widget (Opción A) en Transactions**: simular un "📥 Inbox" virtual que recibe emails de dealers con RFQs/POs/Acks. Cuando se "recibe" un nuevo email, el doc aparece en el tab correspondiente con status `Ingesting` (siguiendo el lenguaje de producción).
4. **Para el auto-spawn (Opción D)**: usar el mismo patrón que `finishUpload` del QuoteConverter (status `ocr-running` → resolve a `ready`). Cada 60-90s aparece un nuevo RFQ/PO en el list con vendor random del pool.
5. **Alinear lenguaje con producción**: usar `Ingesting` en vez de `OCR Running` (matchea las columnas del Kanban de producción).

### TBD adicional (6)

6. **¿Agregar step "Select document type" al Quote Converter upload modal?** Recomendación: SÍ, para matchear producción (Purchase Order / Acknowledgment / Quote). Trabajo extra: ~30min. **Pendiente decisión user**.

### Refinamiento (clarificación user 2026-06-05): manual upload como edge-case affordance

**Re-lectura del transcript con esta lente**:

Christian (7:13): "in some odd case that you receive this, I don't know, via WhatsApp message, you can upload it here."

Wendy rechazó WhatsApp específicamente ("that would not happen") pero el patrón general — **edge case donde el doc llega fuera de canal estándar** — es real. Christian mismo lo planteó: "if that is if the actual transaction didn't came through neither a dealer portal, email, NetSuite, or something like that."

**Decisión final** (clarificación del user): el flujo principal sigue siendo Inbox + auto-ingest, pero hay que **agregar un upload manual de respaldo** que matchea el modal 5-step del Smart Comparator de producción, integrado dentro de las features de Transactions que ya tenemos.

### Diseño del manual upload edge-case (replicando producción · alineado a Wendy)

**CORRECCIÓN tras re-verificación del transcript (6:07)**: Wendy nombró EXPLÍCITAMENTE solo 2 secciones — **Request for Quote** y **Purchase Orders**. NO mencionó Quotes ni Acknowledgements.

Lógica de Wendy (verificada):
> "In request for quote. as well as purchase orders. We should show an upload document. Because those are two things that can either be... an Inbox that's being monitored... Or it could be that it's just being manually uploaded."

**¿Por qué solo RFQ y PO?**
- **RFQ** + **PO** son docs **INBOUND** al manufacturer (los envía el dealer) → pueden llegar por múltiples canales.
- **Quotes** y **Acks** son **OUTBOUND** desde el manufacturer (se autoran en el sistema) → no se "suben", se crean.

**Diferencia explícita con producción Smart Comparator**:

| | Producción Smart Comparator | Demo Manufacturer (Wendy decision) |
|---|---|---|
| Document types ofrecidos | Purchase Order · Acknowledgment · Quote (3) | Request for Quote · Purchase Order (2) |
| Contexto | PDF→SIF generic converter | Manufacturer view inbound-only |
| Por qué difiere | No es manufacturer-specific | Solo inbound docs aplican |

### Placement: per-tab (NO global)

Re-leyendo "in request for quote AS WELL AS purchase orders, we should show an upload document" — el lenguaje de Wendy sugiere fuertemente **botón en cada tab** (RFQ tab + PO tab) en vez de un botón global. Esto también:
- Hace el affordance contextual al type del doc.
- Evita el step 1 del modal (selección de type ya está implícita por el tab activo).
- Reduce el modal a 4 steps (igual al Quote Converter actual): drop → review → uploading → complete.

**Decisión final** (revertida desde la versión anterior del plan):
- **Botón `Upload Document` en el toolbar de cada tab RFQ y PO** (no global).
- Modal **4-step** (no 5) porque el type ya está implícito por el tab activo.
- En RFQ tab: botón abre modal cuya etiqueta dice "Upload RFQ · for documents not received via Inbox".
- En PO tab: botón abre modal cuya etiqueta dice "Upload PO · for documents not received via Inbox".
- En Quotes y Acks tabs: **NO botón** (esos docs los crea el manufacturer internamente, no se suben).

**Modal 4-step** (clon del Quote Converter existente, ajustado):

1. **Step 1 · Drop PDF files**: drag-and-drop con header "Upload {RFQ | PO} · Drop PDF files here or click to select". Background dashed border.
2. **Step 2 · Review files**: "{N} File Selected · Review files · {RFQ | PO}" + lista de archivos + botones `Cancel` / `Upload N file`.
3. **Step 3 · Uploading {N} Document**: spinner + "Uploading {RFQ | PO} files..." + cada archivo con su estado.
4. **Step 4 · Upload Complete**: ✓ verde + "{N} {RFQ | PO} uploaded successfully · Ingesting" + botones `Upload More` / `Done`.

**Comportamiento post-upload**:
- El doc subido aparece al inicio del list del tab activo con status `Ingesting`.
- Auto-resolve a status terminal después de 4-6s (`New` para RFQ, `PO Received` para PO).
- Toast: "{N} {Type} uploaded · Ingesting" estilo solid card.

### Respuesta refinada a las 3 preguntas (corrected)

**1. ¿Emular?** Sí parcialmente: el **patrón visual** del modal upload (drag-and-drop, review, uploading, complete) se emula desde el Smart Comparator pero **adaptado al contexto inbound-only del manufacturer demo**. El **step 1 de selección de tipo** se **elimina** (el tipo está implícito por el tab). El **Kanban de 7 columnas** de producción NO se replica.

**2. ¿En qué secciones?** **Solo RFQ tab y PO tab** (per Wendy). Botón "Upload Document" en el toolbar de cada uno. NO en Quotes ni Acks tabs (outbound) ni global.

**3. ¿Bajo qué rol?**
- **Manufacturer view**: SÍ — botón disponible para edge cases (WhatsApp, fax escaneado · "casos particulares" que Christian mencionó).
- **Dealer view**: SÍ también — el dealer NATURALMENTE sube docs al enviar RFQ/PO al manufacturer.
- **Sub-label diferenciado por rol** (opcional · refinamiento de UX):
  - Manufacturer: `Upload {RFQ | PO} · for documents not received via Inbox` (edge case framing).
  - Dealer: `Upload {RFQ | PO} · send to manufacturer` (action framing).
- Mismo modal, mismo flujo técnico, sub-label distinto.

### Implicaciones para Fase 0 (actualizado)

Fase 0 ahora incluye **3 sub-piezas que se combinan**:

1. **Inbox Monitor widget** en Transactions (Opción A) — visualiza el flujo automático principal.
2. **Auto-spawn cada 60-90s** (Opción D) — demuestra ingesta de volumen en vivo.
3. **NUEVO: Manual upload edge-case** (Opción E) — botón `Upload Document` global + modal 5-step replicando Smart Comparator. Para cuando el doc no llega via canal estándar.

Las 3 piezas comparten infra (el status `Ingesting` y la auto-resolución después de 4s) y se diferencian en el trigger:
- Auto-spawn → trigger por timer, simula email arriving.
- Manual upload → trigger por user click, doc específico provisto.
- Inbox Monitor widget → visualiza ambos en el mismo feed de eventos recientes.

### TBDs cerrados con la corrección del transcript

~~7. Manual upload types~~ → **RESUELTO**: solo RFQ + PO (Wendy explicit), no Quote ni Ack.
~~8. Global vs per-tab~~ → **RESUELTO**: per-tab (en RFQ tab y PO tab), no global. Wendy dijo "in request for quote AS WELL AS purchase orders" — lenguaje per-tab.

### TBD remanente (7 nuevo)

7. **Sub-label diferenciado del botón por rol**: ¿agregar texto distinto en manufacturer view ("edge case · not received via Inbox") vs dealer view ("send to manufacturer")? Recomendación: SÍ — clarifica el use case. Trabajo extra: ~10min. **Pendiente decisión user**.

---

## Conflictos resueltos (PDF vs Transcript)

| Ítem | PDF dice | Transcript dice | Decisión final |
|---|---|---|---|
| **Sources** (PDF #11) | "Just MANUAL and EMAIL, eliminate the other ones" | Christian + Wendy: **Manual NO** (manufacturer view, dealer no carga docs). OCR NO (es un proceso, no una source) | **Email + Dealer Portal + NetSuite** (Manual y OCR fuera) |
| **Sample/textile workflow** (PDF #5) | "Pending Sample and textile review status would be Pending" | Wendy: "totally not even related, I don't think we need to account for that in what we're doing right now" | Sample requested = sub-flag opcional sobre status Pending. NO workflow dedicado de samples. Quitar botones "Request sample" per-line |
| **RFQ pending highlight** (PDF #2) | Mostrar "pending" en RFQ | Wendy reorganizó las RFQ statuses completas: `New`, `In Review`, `Additional Information Required`, `Sent` | Implementación previa (commit c6700e5 con `Pending Review`) **se queda obsoleta**, hay que rehacerla con la nueva taxonomía |

## Source of Truth · lista consolidada de cambios

### A. Estructura de tabs en Transactions (Wendy decision)

Estado actual: `Request for Quote | Quotes | Purchase Orders | Acknowledgements | Projects`

Target:
- `Request for Quote` (IN) → quotes/RFQs pending response
- `Quotes` (OUT) → quotes sent
- `Purchase Orders` (IN) → POs received from dealer
- `Acknowledgements` (OUT) → acks sent to dealer
- **`Orders`** (NEW) → consolidación post-PO con statuses tipo HermanMiller portal (Acknowledged/Shipped/Invoiced/Cancelled)
- **`Shipping`** (NEW, mover desde la página separada) → shipment notifications + tracking
- ~~Projects~~ → **REMOVER**
- (Invoicing — Wendy mencionó pero fuera de scope para Sunday demo)

### B. Sources cleanup (verificado contra clarificaciones de Christian)

#### Las 4 clarificaciones de Christian (transcript 7:42 - 10:07)

1. **7:42** — "OCR should not be a source. OCR is a process."
2. **8:11** — "You either remove manual OR add the manual upload on the two transactions that Wendy just said." (regla condicional)
3. **8:52** — "Only way [Manual makes sense] is if the actual transaction didn't came through neither a **dealer portal, email, NetSuite**, or something like that." (lista las 3 sources válidas)
4. **10:07** (final word) — "Just change whatever says manual to something else."

#### Reconciliación lógica de las 4 reglas

| Regla | Aplica |
|---|---|
| #1 (OCR no es source) | **Sí absoluto** — reemplazar TODO OCR por otra source |
| #2 (Manual o sin Manual sólo si hay upload) | **Sí condicional** — Manual es válido SI agregamos upload affordance |
| #3 (Dealer Portal · Email · NetSuite son las válidas) | **Sí absoluto** — esas son las 3 base |
| #4 (cambiar todo Manual) | **Aplica solo bajo el supuesto "no agregamos upload"**. Nuestro plan rompe ese supuesto al agregar upload en RFQ + PO. Por la regla #2 condicional, Manual es válido en esos 2 tabs. |

#### Reglas finales (alineadas con Christian + Wendy)

1. **Reemplazar TODO `OCR`** por `Email` (default) · mezclar algunos con `Dealer Portal` o `NetSuite` para diversidad. **Regla #1 absoluta**.
2. **Reemplazar TODO `RPA`** por `Email` o `NetSuite`. **Coherente con regla #3** (solo las 3 listadas son válidas).
3. **`Manual` se mantiene en RFQ + PO** como ejemplo del edge-case upload. Christian dijo "you can keep Manual IF you add the upload affordance" (regla #2) — y nosotros estamos agregando esa affordance.
4. **`Manual` se elimina de Quotes y Acks** si aparece. Esos tabs NO tienen upload affordance (son outbound, los crea el manufacturer en sistema).

#### Sources finales

| Source | Disponible en | Justificación |
|---|---|---|
| `Email` | Todos los tabs | Regla #3 (Christian) |
| `Dealer Portal` | Todos los tabs | Regla #3 (Christian) |
| `NetSuite` | Todos los tabs | Regla #3 (Christian) |
| `Manual` | **Solo RFQ + PO** | Regla #2 condicional (Christian) — habilitado por nuestro upload affordance |

#### Sources finales

| Source | Disponible en |
|---|---|
| `Email` | Todos los tabs (default replacement para OCR) |
| `Dealer Portal` | Todos los tabs |
| `NetSuite` | Todos los tabs (replacement para RPA cuando aplica) |
| `Manual` | **Solo RFQ + PO** (mantener como ejemplo edge-case) |

#### Files afectados

- [src/Transactions.tsx](inbound-outbound/src/Transactions.tsx) — `recentOrders`, `recentRFQs`, `recentQuotes`, `recentAcknowledgments`
- [src/QuoteConverter.tsx](inbound-outbound/src/QuoteConverter.tsx) — `LIST_SEED`
- [src/Shipping.tsx](inbound-outbound/src/Shipping.tsx) — shipment seeds
- [src/OrderDetail.tsx](inbound-outbound/src/OrderDetail.tsx), [QuoteDetail.tsx](inbound-outbound/src/QuoteDetail.tsx), [AckDetail.tsx](inbound-outbound/src/AckDetail.tsx) — item-level `source` per-line
- [src/components/inbound-outbound/SourceBadge.tsx](inbound-outbound/src/components/inbound-outbound/SourceBadge.tsx) — actualizar `TransactionSource` union (remover OCR y RPA; Manual queda)

#### Validación post-cleanup

```bash
grep -rn "'OCR'" inbound-outbound/src/   # 0 hits esperado
grep -rn "'RPA'" inbound-outbound/src/   # 0 hits esperado
grep -rn "'Manual'" inbound-outbound/src/ # algunos hits en RFQ/PO contexts (ejemplos válidos)
```

### C. Status taxonomies (Wendy decision)

**RFQ tab** (reemplaza el `rfqStages` actual):
- `New` (era "Pending Review")
- `In Review` (cuando alguien se la asignó, evita doble pick)
- `Additional Information Required` (waiting on dealer)
- `Sent` (se envió quote, sale del bucket RFQ y entra a Quotes)

**Quotes tab**:
- ~~`Draft`~~ → cambia a **`In Progress`** (Magda + Wendy)
- ~~`Negotiating`~~ → **REMOVER** (no es un status real; PDF #3)
- ~~`Approved`~~ → **REMOVER** (cuando se aprueba → PO, sale de Quotes)
- `Pending` (puede tener sub-flag "Sample & textile review" pero es un sub-state opcional)
- `Sent` (existente, OK)
- **`Expired`** (NUEVO, cuando `validUntil` < today)
- Variar `revisionNumber` (no todos en #3 — mix #1/#2/#3)

**Purchase Orders tab**:
- `PO Received`
- ~~`PO Reviewed`~~ → **REMOVER** (no aporta valor según Wendy)
- `More Information Required` (alineado con RFQ)
- `Deposit Required` / `Pending Deposit` (cuando aplica)
- ~~In production, Ready to ship, Shipped, Delivered~~ → **MOVER al tab Orders**

**Orders tab** (NUEVO, basado en HermanMiller portal):
- `Acknowledged`
- `In Production`
- `Ready to ship`
- `Shipped`
- `Delivered`
- `Invoiced`
- `Cancelled`
- (+ flag operacional `Delayed` — ya implementado para ORD-2056)

**Acknowledgements tab**:
- `Pending` (48hr ventana de revisión del dealer)
- `Confirmed`
- `Partial`
- ~~`Discrepancy`~~ → **REMOVER** del tab (las discrepancies se manejan ANTES de entrar la orden, no aquí)
- Cambiar label "Expected Ship Date" si aplica

### D. Request for Quote (RFQ) · cleanup detallado del tab y detail page

**Aclaración importante (transcript 10:19, 13:33, 18:45)**: Wendy NUNCA pidió eliminar el tab RFQ. Dijo "none of this should be appearing" refiriéndose a los DATOS actuales (que son statuses de Order, precios, etc.). Confirmó en 18:45: "I think we should keep it" — el tab se mantiene, su CONTENIDO cambia.

#### D.0 · Audit chips, filtros y columnas del tab RFQ (estado actual vs target)

**Wendy 30:56 dijo**: "This would be **very basic**, like **we don't even need any of the elements**" — RFQ debe ser una vista minimalista, NO una réplica completa del tab Orders.

**Estado actual (verificado en screenshot user 2026-06-05)**:

| Elemento | Hoy | Target Wendy | Acción |
|---|---|---|---|
| Tab label | "Request for Quote (IN) · 3 PENDING" | "Request for Quote (IN) · N NEW" | Renombrar "Pending" → "New" en sub-counter |
| Section title | "Recent Orders" (BUG · Wendy notó esto implícito) | "Recent RFQs" o "Recent Requests" | Cambiar por tab |
| Sub-filter pills (top) | Active / Completed / All / Metrics | Active / Completed / All / Metrics | Mantener (genérico OK) |
| Search input | "Search orders..." | "Search RFQs..." | Cambiar placeholder |
| ~~Status dropdown~~ "All Statuses" | ✅ Visible hoy | ❌ **REMOVER** (Wendy 30:56 "very basic, don't need elements") | Eliminar dropdown · funnel pills + pipeline view ya cubren filtering por status |
| ~~Location dropdown~~ "All Locations" | ✅ Visible hoy | ❌ **REMOVER** (mismo principio "very basic") | Location no es relevante en stage RFQ |
| Pipeline view (cuando se selecciona) | Stages: `PO received / In production / Ready to ship / Shipped / Delivered` (statuses de Order · BUG) | `New / In Review / Additional Information Required / Sent` | **REHACER** (commit c6700e5 obsoleto) |
| Columnas tabla list view | DETAILS / PROJECT & LOCATION / AMOUNT / STATUS / SOURCE / DATE / ACTIONS | DETAILS / PROJECT & LOCATION / **(sin Amount)** / STATUS / SOURCE / DATE / ACTIONS | **Remover Amount** — RFQ no tiene precio |
| Sub-counter chip en tab | "3 PENDING" amber | "N NEW" amber (cuenta status === 'New') | Renombrar |
| Actions per row | Eye (view) / Pin (location) / chevron (expand) | + **Quick Message button** (nuevo) | Agregar Quick Message CTA |

**Reconciliación de la contradicción aparente Wendy 15:09 vs 30:56**:
- 15:09 (en abstracto · hablando de capacidad): "they would be able to filter by those statuses"
- 30:56 (específico para RFQ · viendo la UI): "very basic, we don't even need any of the elements"
- **Resolución**: la capacidad de filtrar por status SÍ existe (via funnel pills + pipeline view Kanban), pero el DROPDOWN explícito "All Statuses" es redundante y se remueve. Mismo principio para "All Locations" (no aporta valor en RFQ stage).

**Filtros que quedan en RFQ tab post-cleanup**:
- ✅ Search input (siempre útil)
- ✅ Sub-filter pills Active / Completed / All / Metrics (genéricos, OK)
- ✅ Pipeline view Kanban con 4 statuses (rfqStages) — cubre filter visual por status
- ❌ Status dropdown explícito (removido)
- ❌ Location dropdown explícito (removido)

**Pipeline view fix** (esto es el bug que Wendy notó implícitamente cuando dijo "this is for orders that are in progress, not RFQs"):

```ts
// Antes (commit c6700e5 · obsoleto):
const rfqStages = ['Pending Review', 'In Review', 'Quote Sent']

// Target post-update:
const rfqStages = ['New', 'In Review', 'Additional Information Required', 'Sent']
```

#### D.1 · Statuses del tab RFQ · audit exhaustivo del transcript (10:19-24:29)

**18 statuses mencionados en la discusión · 4 quedaron como final**

##### D.1.a · Statuses propuestos y decisión final

| # | Status propuesto | Quién | Decisión | Razón |
|---|---|---|---|---|
| 1 | `Pending` / `Pending quote` | Wendy 10:50 | ❌ Renombrado a `New` | Más claro |
| 2 | `PO Received` (heredado de Orders) | — | ❌ Quitar | Wendy 11:06: "shouldn't be there" |
| 3 | `Pending fabric testing` | Wendy 11:14 | ❌ NO en RFQ | Movido a Quotes (36:18) |
| 4 | `Sample pending` | Wendy 12:02 | ❌ Descartado | "totally not even related" (37:32) |
| 5 | `Waiting for information` | Asly 12:42 | ✅ Renombrado a #6 | Christian rephrased |
| 6 | `Additional Information Required` | Christian 13:04 | ✅ **FINAL** | Aprobado Wendy 13:07 |
| 7 | `In Review` | Christian 18:00 | ✅ **FINAL** | "interview" para evitar doble-pick |
| 8 | `Pending Review` (existente) | — | ❌ Renombrado a `New` | Wendy 18:45 |
| 9 | `New` | Wendy 18:45 | ✅ **FINAL** | Asly aprobó "New request, yes" |
| 10 | `Custom request` | Asly 14:14 | ❌ NO adoptado | Wendy 23:54 "let's keep with the basics" |
| 11 | `Sent` | Asly + Wendy 14:53/15:09 | ✅ **FINAL** | Disparator: convierte RFQ→Quote |
| 12 | `Declined` | Leydi 20:10 | ❌ Descartado | Reabsorbido por discusión de Rejected |
| 13 | `Discontinued` (parts) | Leydi 20:10 | ❌ Implícito en alternate suggestion | No status separado |
| 14 | `Rejected` | Wendy 20:15 | ❌ Descartado | Christian 24:13: "we cannot reject it" |
| 15 | `Alternate suggested` | Asly 21:51 | ❌ NO status · es ACCIÓN | "yes, that's exactly what we do" — workflow, no estado |
| 16 | `Information requested` (sinónimo) | Christian 24:25 | = #6 | Sinonimia con `Additional Information Required` |
| 17 | `Sample required` parallel | Christian 24:29 | ❌ NO en RFQ | Wendy 37:32 "totally not even related" |
| 18 | `New with samples required` (combo) | Christian 24:54 | ❌ Descartado | Sample workflow OOS V1 |

##### D.1.b · Final 4 statuses + transitions (decisiones user 2026-06-05)

```
┌──────────────────────────────────────────────────────────────────┐
│ NEW                                                              │
│ (doc recién ingestado vía Email/Dealer Portal/NetSuite/Manual)   │
│ Avatar: vacío · sin user asignado                                │
└────┬─────────────────────────────────────────────────────────────┘
     │
     │ Trigger: Botón 'Take' / 'Assign to me' visible en row
     │ (decisión user: explicit button · no auto-asignar on click)
     │ → user actual queda asignado · avatar cambia
     ▼
┌──────────────────────────────────────────────────────────────────┐
│ IN REVIEW                                                        │
│ (user específico trabajando · avatar visible · previene double)  │
└────┬──────────────────────────────────────┬──────────────────────┘
     │                                       │
     │ Trigger: botón 'Request more info'    │ Trigger: botón 'Send Quote'
     │ en detail · abre Reply (EmailDraft)   │ en detail · genera Quote
     │ → user manda email · status cambia    │ → status final
     ▼                                       ▼
┌────────────────────────────────────┐   ┌──────────────────────────────────┐
│ ADDITIONAL INFORMATION REQUIRED    │   │ SENT                             │
│ (waiting on dealer reply)          │   │ + row aparece en Quotes tab      │
└────┬───────────────────────────────┘   │   con status 'In Progress'       │
     │                                    │                                  │
     │ Trigger: AUTO-SIMULADO durante     │ Visibilidad en RFQ tab:          │
     │ demo (cada 30-60s)                 │ - 'Active' filter: NO            │
     │ "Dealer responded with info"       │ - 'Completed' filter: SÍ         │
     │ (decisión user: auto-trigger)      │ - 'All' filter: SÍ               │
     ▼                                    │                                  │
   vuelve a IN REVIEW                     └──────────────────────────────────┘
```

##### D.1.c · Sub-filters del tab RFQ (Wendy implícito 16:31)

| Sub-filter | Statuses visibles | Razón |
|---|---|---|
| `Active` | New · In Review · Additional Info Required | "trabajo en progreso" |
| `Completed` | Sent | Wendy 16:31: "would move out... go into quote bucket" pero queda visible aquí (decisión user · reconciliación) |
| `All` | Todos los 4 | View histórico completo |
| `Metrics` | (read-only KPIs) | OK como está |

##### D.1.d · Acciones disponibles per status

| Status | Actions visibles en row | Actions en detail page |
|---|---|---|
| New | Take · View · Reply | Take · Send Quote (disabled until Take) · Reply |
| In Review | Request more info · View · Reply · Send Quote | Request more info · Send Quote · Reply |
| Additional Info Required | Mark as ready (manual override) · View · Reply | Mark as ready · Send Quote · Reply |
| Sent (en Completed) | View only · Reply (re-open conversation) | View · Reply |

**Decisiones user aplicadas a las 3 ambigüedades del round previo**:
- Sent visibility: opción B (visible solo bajo Completed sub-filter)
- New → In Review trigger: opción A (botón Take explícito)
- Additional Info → In Review trigger: opción A (auto-trigger cada 30-60s simulado durante demo)

##### D.1.e · Statuses considerados y descartados (para no perder trazabilidad)

Si en futuras reuniones se vuelven a proponer, el trazo histórico está:
- `Rejected` (Wendy/Leydi debate, descartado por Christian 24:13)
- `Custom Request` (Asly 14:14, no formalizado)
- `Declined` (Leydi 20:10, reabsorbido)
- `Sample required` parallel (Christian 24:29, descartado por Wendy 37:32 como OOS)
- `Pending fabric testing` en RFQ (movido a Quotes únicamente)

**Sample workflow — RESUELTO post-discusión completa (24:29-38:31)**:
- Christian propuso parallel status para samples (24:29)
- Wendy preguntó a Asly/Kenya si sample request es parte del quote o separado (36:54)
- Asly: "It's a **separate request**, but it's **not a stopper**" (37:27)
- Wendy: "**Totally not even related. I don't even think we need to account for that in what we're doing right now**" (37:32)
- Conclusión: sample workflow **OUT** del RFQ tab. No aparece como status, ni como flag, ni como botón.

#### D.2 · Quick Reply / Quick Message action · contextual templates (transcript 25:22-27:30)

**Discusión completa**:
- Asly 25:22: propuso "way to respond that mail for that response part when it is whatever reason"
- Wendy 25:40: "under actions, there should be a way to communicate back to the dealer"
- Christian 25:50 + 26:39: "Only if it's by email" + "in the actions, put a reply and then an email should be open regardless if it came from a portal or whatever"
- Christian 27:01: **insight clave** — "Write a quick reply that opens up email modal... **when we are talking about request more information, you obviously should actually send something requesting the more information**" → IMPLICA templates contextuales según el caso de uso operativo
- Diego 26:56: "I have a component for that I can reuse" → reutilizar el `EmailDraftModal` existente

**Implementación · botón Quick Message con templates contextuales**:

##### D.2.a · Aplicabilidad por tab

| Tab | ¿Tiene botón Quick Message? | Razón |
|---|---|---|
| **RFQ** | ✅ Sí (Reply al dealer que mandó el RFQ) | Discusión específica del transcript |
| **Quotes** | ✅ Sí (Reply al dealer sobre el quote) | Extensión natural · misma operación |
| **Purchase Orders** | ✅ Sí (Reply al dealer sobre el PO) | Idem · puede haber clarificaciones |
| **Acknowledgements** | ❌ NO (manufacturer envía Ack, no responde) | Es outbound, no inbound |
| **Orders** | ✅ Sí (notificar al dealer sobre shipping, delays) | Útil para escalations |
| **Shipping** | ✅ Sí (notificar al dealer sobre tracking, ETA) | Útil para coordinar |

##### D.2.b · Templates pre-cargados según contexto (transaction type + status)

El modal `EmailDraftModal` se abre con un **selector de template** arriba que permite elegir el caso de uso. Cada template pre-llena Subject + Body con el contexto correcto.

**Templates para RFQ tab**:

| Template | Subject | Body skeleton | Aplica cuando |
|---|---|---|---|
| `Request more information` | `RFQ {id} · need clarification` | "Hi {dealer name}, regarding your RFQ {id} we need some clarification on {item}. Could you please provide..." | status = New o In Review |
| `Acknowledge receipt` | `RFQ {id} · received, reviewing` | "Hi {dealer name}, we received your RFQ {id} and are reviewing. Expect a quote within X business days." | status = New |
| `Sample / textile inquiry` | `RFQ {id} · fabric specification` | "Hi {dealer name}, regarding the fabric on item {x} in your RFQ {id}, we need to know..." | Cualquier status, custom case |
| `Suggest alternative` | `RFQ {id} · alternative suggestion` | "Hi {dealer name}, for item {x} on your RFQ {id}, the requested part is discontinued. We suggest..." | In Review, edge case |
| `Custom` | (empty) | (empty) | Default para escribir desde cero |

**Templates para Quotes tab**:

| Template | Subject | Aplica cuando |
|---|---|---|
| `Quote ready for review` | `Quote {id} · ready` | status = Sent (pre-canned send notification) |
| `Quote revision sent` | `Quote {id} · revision {N}` | Después de revisión |
| `Quote expiring soon` | `Quote {id} · expires {date}` | Antes de Expired |
| `Custom` | (empty) | Default |

**Templates para Purchase Orders tab**:

| Template | Subject | Aplica cuando |
|---|---|---|
| `PO acknowledgment` | `{poId} · acknowledged` | status = PO Received |
| `Deposit reminder` | `{poId} · deposit required` | status = Deposit Required |
| `Discrepancy detected` | `{poId} · PO vs Quote mismatch` | Edge case |
| `Custom` | (empty) | Default |

**Templates para Orders tab**:

| Template | Subject | Aplica cuando |
|---|---|---|
| `Shipment notification` | `{orderId} · shipped` | status = Shipped (auto template) |
| `Delivery confirmation` | `{orderId} · delivered` | status = Delivered |
| `Delay notification` | `{orderId} · shipping delay` | flag = delayed |
| `Custom` | (empty) | Default |

**Templates para Shipping tab**:

| Template | Subject |
|---|---|
| `Tracking info` | `{orderId} · tracking #{number}` |
| `ETA update` | `{orderId} · updated ETA {date}` |
| `Delay alert` | `{orderId} · delivery delay` |
| `Custom` | (empty) |

##### D.2.c · Estructura del modal · interactive flow

```
┌──────────────────────────────────────────────────────────────────┐
│ Quick Message · {Transaction Type} {ID}                         X│
├──────────────────────────────────────────────────────────────────┤
│ Select template:                                                  │
│ [Request more information ▾]  ← dropdown contextual              │
├──────────────────────────────────────────────────────────────────┤
│ To: {dealer email auto-fill}                                     │
│ Subject: {pre-filled per template}                               │
├──────────────────────────────────────────────────────────────────┤
│ Body:                                                             │
│ {pre-filled template body · user can edit before send}           │
│                                                                   │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                              [Cancel]              [Send]         │
└──────────────────────────────────────────────────────────────────┘
```

##### D.2.d · Reutilización del `EmailDraftModal` existente

- El modal `EmailDraftModal` ya existe (Diego: "I have a component for that I can reuse")
- Agregar prop opcional `templates: TemplateOption[]` que activa el selector dropdown
- Si no se pasa `templates`, comportamiento actual (modal simple sin selector)
- Mantener back-compat con usos actuales (Shipping notification, Backorder follow-up, etc.)

##### D.2.e · Botón en row · placement y label

- Placement: dentro de la columna `Actions`, después del View icon
- Icon: `MessageSquare` o `Mail` (Lucide)
- Label: tooltip "Quick Message" / aria-label "Send quick message to dealer"
- Visible siempre (no condicional por status) — el user decide cuándo usarlo

#### D.3.0 · RFQ Detail page · audit visual completo (basado en screenshot user 2026-06-05)

Wendy señaló múltiples piezas en la RFQ detail page que no deben aparecer. La regla general (30:56): "we don't have pricing... very basic, we don't even need any of the elements".

**RFQ Information card (sección métricas arriba)**:

| Métrica | Hoy | Decisión | Razón |
|---|---|---|---|
| ~~Gross Value~~ | $67,240 | ❌ REMOVE | RFQ no tiene precio (Wendy 27:33) |
| ~~Net Value~~ | $25,398 | ❌ REMOVE | RFQ no tiene precio |
| ~~Avg Discount~~ | 60.8% | ❌ REMOVE | Manufacturer no aplica discount (Wendy 39:30) · y RFQ no tiene precio |
| **Line Items** | 8 | ✅ KEEP | Count válido (informativo, sin precio) |
| **Status** | "Awaiting Pricing" | ⚠️ Cambiar a taxonomía nueva | "Awaiting Pricing" no está en `[New / In Review / Additional Info / Sent]` |

**Status badge "Awaiting Pricing"** específicamente:
- No matchea la taxonomía aprobada por Wendy/Christian
- Replacement directo: `In Review` (manufacturer trabajando en el quote) o `New` (si nadie asignado aún)
- Decisión recomendada: mapear "Awaiting Pricing" → `In Review` (más probable porque tiene rev #3 indicando trabajo activo)

**Header de la card**:
- "Current Phase · Pricing in Progress" → **REMOVE** o cambiar a "Current Phase · Reviewing Request" (consistente con RFQ stage, no Quote)

**Chip "Awaiting Pricing"** en el header (right side) → reemplazar con badge `In Review` warning/info tone.

**Sub-chips debajo de la card** (`Source EMAIL · DP SALES REP David Park · REV #3`):
- ✅ Source EMAIL — OK (después del cleanup de sources)
- ✅ Sales Rep David Park — OK
- ✅ REV #3 — OK (mostrar revisions reales)

**Tabs de detail page** (RFQ Items / Revisions / Activity Stream):
- ✅ RFQ Items — OK
- ✅ Revisions — OK (Wendy 30:56 "we have revisions, that's fine")
- ✅ Activity Stream — OK (Wendy 30:56 "And then the activity. Okay.")

**Compare button** (top right): ✅ OK (existente)

---

#### D.3.1 · RFQ Items table filters · ESPECÍFICO (Wendy señaló en screenshot)

Wendy 30:56 dijo "we don't need any of the elements" señalando los filtros de la tabla de items:

| Filtro hoy | Decisión | Razón |
|---|---|---|
| Search SKU, Product Name | ✅ KEEP | Search siempre útil |
| ~~All items~~ dropdown | ❌ **REMOVE** | "very basic, don't need" |
| ~~All Materials~~ dropdown | ❌ **REMOVE** | "very basic, don't need" |
| ~~Price Status~~ dropdown | ❌ **REMOVE** | RFQ no tiene pricing → filtro irrelevante |

**Filtro que queda en RFQ Items table post-cleanup**:
- ✅ Solo Search input (búsqueda por SKU/Product Name)

#### D.3 · RFQ Items page (detail view) cleanup (Wendy 27:33-30:32) · audit detallado

**Tabla de items RFQ · columnas finales + handling de unknowns**:

| Columna | Decisión | Handling cuando no hay data |
|---|---|---|
| **Part #** | ✅ Mantener | Placeholder `—` muted italic, tooltip "Part number not provided in RFQ" |
| **Model** | ✅ Mantener | Placeholder `—` muted italic |
| **Description** | ✅ Mantener | Si vino texto unstructured del email, mostrar literal · si vacío `—` |
| **QTY** | ✅ Mantener | Required field (siempre tiene valor) |
| ~~Net Price~~ | ❌ Remover | — |
| ~~Amount~~ | ❌ Remover | — |
| ~~Status per-line~~ | ❌ Remover | — |
| ~~Source per-line~~ | ❌ Remover | Source es a nivel doc, no per-line (Christian 28:31) |
| ~~Request sample buttons~~ | ❌ Remover | Sample workflow OOS V1 |

**Citation textual de Wendy sobre unknowns** (29:07):
> "And they may not know. This information, like the **part numbers, may be unknown**."

**Implementación del placeholder "unknown"**:
- Visual: dash em `—` muted con tooltip explicativo
- Alternativa: texto literal "Not provided" / "Pending from dealer" (más explícito, menos sutil)
- **Recomendación**: usar `—` muted con tooltip — más limpio visualmente y coherente con patrones DS

**Fixtures observados de los 4 emails reales (variedad confirmada por Wendy 29:59)**:

| Source dealer | Part # presente? | Format | Notas |
|---|---|---|---|
| Business Interiors (Laine Durr) | ✅ Sí (AM4-PO-WT-C-S) | Email texto plano | "Same as previous order" — referencia histórica |
| Main Solutions (Jennifer McNemar) | (depende de embedded) | Email corporativo + signature | Forward chain visible |
| KSM Design Source (Yvette Nelson) | ✅ Sí (AM4-PO) | Email + **tabla embedded** con specs | Specs por columnas (Frame, Color, etc.) |
| Contract Connection (Jamie Campbell) | ✅ Sí (MASSU-BK-F-BT-S) | Forward email + lista SKUs | Multi-forwarded |

**Conclusión sobre Part numbers**:
- En la práctica TODOS los 4 emails reales SÍ tenían part numbers → el caso "unknown" es minoritario pero existe
- Para el demo: tener al menos 1 row con part # vacío que muestre el handling
- Resto de rows con part numbers reales tomados de los fixtures

**Configs / Options · cómo manejarlos**:
- KSM email tenía specs en tabla embedded (Frame Finish, Color, Option Description)
- Esto sugiere que en RFQ Items debe mostrarse un sub-campo "Configurations" con specs cuando aplica
- Si no vino → placeholder vacío
- Decision: keep como sub-campo dentro de Description column, no como columna separada

#### D.4 · Secciones de RFQ detail que se mantienen

- ✅ **Revisions tab** (Wendy 30:56: "we have revisions, that's fine")
- ✅ **Activity tab** (Wendy 30:56: "And then the activity. Okay.")

#### D.5 · Fixtures reales pendientes (Wendy 29:39)

- Asly + Kenya van a enviar emails/PDFs/Excel **REALES** de RFQs de dealers
- Variedad: "They should not all be the same" — mezclar emails, PDFs adjuntos, Excel sheets
- **Referencia recibida 2026-06-05**: 4 RFQ emails reales de producción Leland:
  - Business Interiors · Laine Durr · "quote request - amadeus chairs" (texto simple, 2 unidades)
  - Main Solutions · Jennifer McNemar · "FW: Oglethorpe Power Project" (formato corporativo con signature)
  - KSM Design Source · Yvette Nelson · "RE: ***URGENT REQUEST Leland Quote..." (con tabla de specs)
  - Contract Connection · Jamie Campbell · "Fwd: updated quotes for microvention/terumo" (con lista de SKUs)
- **Patrón observado**: la mayoría llegan por email · texto + tabla embedded · NO siempre tienen part numbers (algunos sí, otros solo description)
- **No bloquea Fase 1** — usar estos 4 como base de fixtures (text + tablas embedded) hasta que Asly mande algo más curado

### D.7 · Audit visual completo · 3 ubicaciones donde Sample aparece en Quote (basado en screenshots user 2026-06-05)

#### D.7.0 · Reconciliación de las 2 frases aparentemente contradictorias de Wendy

| Tiempo | Frase de Wendy | Sobre qué hablaba |
|---|---|---|
| **32:11** | "leave the sample and textile review, that's fine" | List view sub-chip (estado abstracto) |
| **37:45** | "get rid of this" (after Christian "should we remove it?") | Quote detail buttons (acción concreta) |

**Resolución** combinando con Wendy 37:32 ("totally not even related" sobre sample workflow) y 36:18 (endorsement de "textile review"):
- "Sample" como concepto → OUT entirely (workflow separado, post-V1)
- "textile review" → KEEP como sub-flag de `Pending` SOLO en Quotes

#### D.7.1 · Ubicación 1 · Quotes list view sub-chip

**Hoy (screenshot user)**: QT-1025 row muestra `Negotiating` + sub-chip `● Sample & textile review` (verde).

**Target post-cleanup**:
- Status badge: `Negotiating` → `Pending` (rename per audit E.0)
- Sub-chip: `Sample & textile review` → `textile review` (drop la palabra "Sample")
- Visual final: `Pending · textile review` (combo chip stacked)

**Cambio en seed** (`Transactions.tsx` línea 235):
```diff
- { id: "QT-1025", ..., status: "Negotiating", stageFlag: "Sample & textile review", ... }
+ { id: "QT-1025", ..., status: "Pending", stageFlag: "textile review", ... }
```

#### D.7.2 · Ubicación 2 · Quote detail page · "Request sample" buttons per-row

**Hoy (screenshot user)**: 2 rows tienen botón `📦 Request sample` (right side de la table row):
- `F-SSC346030C · LB LOUNGE 2 SEAT 34"H` · CF-6036 Ocean Blue + Tier B + ✓ Verified
- `7730 · AUBURN GRAY CONFERENCE CHAIR` · GR-5505 Charcoal + Tier C + Not in approved list - Escalate

**Target post-cleanup**:
- ❌ **REMOVE** botón "Request sample" en TODOS los rows (no solo estos 2)
- ✅ KEEP sub-chips de fabric info (`CF-6036 Ocean Blue · TIER B · ✓ VERIFIED`) — textile graded-in legítimo
- ✅ KEEP advertencia (`Not in approved list · Escalate`) — info válida del textile review
- ✅ KEEP textile upcharge calc (`Textile upcharge · 10 yd · +$230.00`) — cálculo legítimo

**Justificación Wendy 37:45**: "Yeah, but you quote details. Yeah, **get rid of this**" — explícita sobre Quote details

#### D.7.2.1 · Christian's wording correction (referencia V2 · no aplica V1 porque V1 lo remueve entero)

Christian 38:01 hizo una clarificación lingüística sobre el botón:

> "If it actually was something usable, **it's not 'request sample', it's 'sample requested'**. If we're actually going to use that, because **it's the dealer requesting a sample for the manufacturers**, and we at this time are the manufacturers viewing the request."

**Análisis semántico**:

| Wording | Voice | ¿Quién hace la acción? | Correcto desde manufacturer view? |
|---|---|---|---|
| `Request Sample` (botón actual) | Imperative active | Implies manufacturer hace el request | ❌ NO · semánticamente al revés |
| `Sample Requested` (Christian's fix) | Passive | Dealer hizo el request · manufacturer la registra | ✅ SÍ · correcto desde el POV del manufacturer |

**Wendy 38:31 (focus declaration)**:
> "Yeah, no, **I agree with you 100%. I don't think that's the focus of this. Definitely not.**"

**Resolución por capa**:

| Capa | Decisión V1 | Nota V2 |
|---|---|---|
| **Wording** | N/A (se remueve el botón completo) | Si vuelve en V2 → usar "Sample Requested" (passive) |
| **Existencia del botón** | ❌ REMOVE entirely (Wendy: not focus) | Reconstruir con workflow correcto |
| **Modal asociado** | ❌ REMOVE entirely | Re-design en V2 |

**Nota para el equipo V2** (anotación en el plan para que no se pierda):
> Cuando se diseñe el sampling workflow separado, recordar:
> 1. Wording: "Sample Requested" (passive · refleja que el dealer pidió, el manufacturer registra)
> 2. Workflow separated del quote flow (Asly 37:27: "It's a separate request")
> 3. No es un stopper (Asly 37:27: "but it's not a stopper")
> 4. Wendy eventually figurará out el sampling workflow propio (Christian 38:01)

#### D.7.3 · Ubicación 3 · Sample Request Modal

**Hoy**: existe un modal/dialog component que se abre al hacer click en `Request sample` (probable nombre: `RequestSampleModal.tsx` o `SampleRequestModal.tsx`).

**Target post-cleanup**:
- ❌ **REMOVE** modal component entirely
- ❌ REMOVE state hook (`requestSampleOpen`, `setRequestSampleOpen`)
- ❌ REMOVE handler (`handleRequestSample`)
- ❌ REMOVE import statements en consumer files

**Alternativa considerada**: dejar como dead code para V2 → DESCARTADA porque:
- Christian 38:01 dijo "Wendy eventually will have to figure out a sampling workflow to put it separated"
- Cuando llegue V2, el workflow se reconstruye desde cero con el design correcto (no se aprovecha el dead code actual)
- Mantener dead code es deuda técnica

#### D.7.4 · Resumen visual antes/después

```
LIST VIEW (Quotes tab)               DETAIL PAGE (Quote items)         MODAL
─────────────────────────             ─────────────────────────         ───────────────
ANTES:                                ANTES:                            ANTES:
[Negotiating] amber                   [item row] ... [Request sample]   [Sample Request
[● Sample & textile review] green                  [item row] ... [Request sample]      Modal opens
                                                                       on click]
DESPUÉS:                              DESPUÉS:                          DESPUÉS:
[Pending] amber                       [item row] ... (no button)        ❌ NO existe
[● textile review] green                                                   (removido del codebase)
(sub-flag absorbed)
```

---

### D.6 · Sample / Textile workflow · scope clarificado (FINAL · Christian + Wendy)

**Distinción semántica clave** (revisada por user request 2026-06-05):

| Concepto | Definición | ¿Va en V1? |
|---|---|---|
| **Sample** | Muestra física (sample chair, sample swatch, etc.) · workflow de envío físico dealer ↔ manufacturer | ❌ OUT entirely |
| **Textile** | Especificación de tela que requiere validación / testing antes de cotizar | ✅ ONLY como sub-flag `textile review` en Quotes |

#### D.6.a · Las 2 menciones de Christian + clarificación final

**Mención 1 (24:29-25:19)** · Christian propone parallel status:
> "There should be a parallel status about samples and textiles. So it can be **waiting for review**, or **new with samples required**... I don't want to tie up the sample part to this process."

→ Christian quería samples como **flag paralelo combinable** (e.g. `In Review · samples required`).

**Mención 2 · CLARIFICACIÓN FINAL (38:01) + Wendy 100% accept (38:31)**:

> Christian 38:01: "If it actually was something usable, it's not 'request sample', it's 'sample requested'... Anyways, **Wendy eventually will have to figure out a sampling workflow to put it separated**, but I don't think we have the time to do that right now."
>
> Wendy 38:31: "Yeah, no, **I agree with you 100%**. I don't think that's the focus of this. **Definitely not**."

→ Christian explícitamente revierte su propuesta inicial: el sample workflow debe ir **separado** del demo actual. Wendy acepta al 100%.

#### D.6.b · Resolución por concepto / tab / pieza

| Pieza | Decisión final | Aparece en | Citation |
|---|---|---|---|
| **Sample workflow completo** (envío físico) | ❌ OUT entirely | Ningún tab | Christian 38:01 "put it separated" + Wendy 38:31 "100% agree" |
| **Sample-related parallel status en RFQ** (Christian 24:29 idea inicial) | ❌ DESCARTADO por el propio Christian | Ningún tab | Christian 38:01 reverted his own proposal |
| **Sample-related parallel status en Quote** | ❌ DESCARTADO | Ningún tab | Mismo motivo · Wendy 37:32 "totally not even related" |
| **"Request Sample" buttons per-line** (existentes hoy) | ❌ REMOVER | RFQ items + Quote items | Wendy 37:45 "get rid of this" |
| **Sample request notifications** (ActionCenter) | ❌ OUT | Ningún tab | Mismo principio |
| **Sample request modal** (Quote detail) | ❌ OUT | Ningún tab | Wendy 37:45 |
| **Textile review pending** (Quote queda en hold mientras se testea fabric) | ✅ **KEEP como sub-flag** | **Solo Quotes tab** · status `Pending` + sub-flag `textile review` | Wendy 36:18 endorsement explícito |
| **`Pending · textile review` combined chip** | ✅ Implementar | Quotes tab solamente | Wendy 36:18 |

#### D.6.c · Por qué textile review queda solo en Quotes (no en RFQ)

- En **RFQ** aún no hay fabric definido (el dealer está pidiendo "give me a quote for X")
- En **Quote** el manufacturer ya evaluó qué fabric usar → si es non-stocked → requiere testing → estado `Pending · textile review`
- Asly 37:27: "It's a separate request, but it's not a stopper" — confirma que sample workflow es separado del quote workflow

#### D.6.d · Cleanup definitivo a implementar

**En RFQ tab + RFQ detail page**:
- ❌ NINGÚN chip o sub-flag relacionado a samples/textile
- ❌ Quitar "Request sample" buttons per-line en RFQ Items page
- ❌ Statuses RFQ NO incluyen sample-related (lista final ya audited: New / In Review / Additional Info Required / Sent · NO hay `samples required`)

**En Quotes tab + Quote detail page**:
- ✅ Mantener `Pending · textile review` como sub-flag combinable del status `Pending` (chip secundario stacked debajo del status badge)
- ❌ Quitar "Request sample" buttons per-line en Quote Items page
- ❌ Quitar cualquier modal de sample request
- ✅ El seed actual de QT-1025 con sub-chip "Sample & textile review" → cambiar a `Pending · textile review` (absorbido al status, no separado del lado)

**En ActionCenter (notifications)**:
- ❌ Cero notificaciones relacionadas a sample workflow
- ✅ Si en el futuro hay textile review timeout, podría notificarse — pero NO en V1

**En PO / Acks / Orders / Shipping**:
- ❌ Cero referencias a samples en estos tabs (stage demasiado tarde · el textile review ya pasó antes del PO)

### E. Quotes · audit exhaustivo del transcript (31:39-40:25)

#### E.00 · Timelines completos de los 2 cambios de status más discutidos

##### Draft → In Progress · timeline (33 segundos de discusión)

| Tiempo | Quien | Quote textual |
|---|---|---|
| 32:18 | Wendy | "It could be in draft because it's being finalized. That's fine." (inicialmente acepta Draft como OK) |
| 33:44 | **Magda** | "Maybe at the time of working on it instead of draft **in progress** status." (propone el rename) |
| 33:51 | **Wendy** | "Yes, **I like that better**. In progress." (aprueba enthusiastically) |
| 33:54 | Wendy | "So again, just for recording purposes, **we're changing draft to in progress**." (confirma explícitamente · señal de "esto va al record") |

**Razón del cambio** (semántica):
- `Draft` = nombre genérico · puede confundirse con "documento incompleto"
- `In Progress` = descriptivo · indica acción concreta ("manufacturer está trabajando activamente")
- Alineado con principio rector: status refleja acción real del negocio

##### Expired status · timeline (1.5 minutos de discusión)

| Tiempo | Quien | Quote textual |
|---|---|---|
| 32:42 | **Magda** | "When it should have a like **expiration date**? Like after a certain amount of time, it's no longer valid, so it gets an alert or out." (introduce el concepto) |
| 32:55 | Wendy | "It's here. **Valid until**." (reconoce que el campo ya existe en código) |
| 34:15 | **Magda** | "And perhaps when the valid until date has reached, maybe then the status that says like..." (propone status para ese caso) |
| 34:24 | **Wendy** | "**Expired**." (define el nombre del status) |
| 34:25 | Magda | "Invalid. Oh, expired, yeah." (initially proposed "Invalid", agrees con Expired) |
| 34:28 | **Wendy** | "Expired, yep. **So we need to add expired**." (explicit add request) |

**Implementación de `Expired`**:
- Auto-trigger temporal: cuando `validUntil` (renamed UI label "Expiration Date") < today
- Status terminal · queda visible solo bajo sub-filter "Completed"
- Visual: chip muted gray + strike-through (consistente con `Sent` pattern)
- Logic en seed: marcar 1 quote con validUntil pasado para demonstrar visualmente

**Connection con rename `Valid Until → Expiration Date`** (E.1.f.0):
- El status `Expired` y la columna `Expiration Date` ahora forman un par semántico claro
- Antes: `Valid Until` + status genérico → confuso
- Después: `Expiration Date` + status `Expired` → directo y claro

---

#### E.00000.X · Wendy minuto 39 · resumen completo del rework de columnas y valores

**Frase clave de Wendy 38:40** (resumen final del bloque Quote details):
> "Just to go over it, **we already said everything from the right of quantity. This has to be changed to list, and then this could be extended list, and we would. Get rid of. the rest** because if we're issuing the quote or I mean we could depict."

##### Decodificación de "everything from the right of quantity"

```
Layout actual:
[PART #] [MODEL] [DESCRIPTION] [QTY] | [NET PRICE] [AMOUNT] [STATUS] [SOURCE] [actions]
                                      ↑
                                      "everything from the right of quantity"
```

##### Mapping completo · columnas a la derecha de QTY

| Columna | Decisión Wendy 38:40 | Acción |
|---|---|---|
| `NET PRICE` ($479.18 + "-62%") | "This has to be changed to **list**" | ❌ **RENAME** a `LIST` + remove "-62%" sub-line |
| `AMOUNT` ($1,916.72) | "and then this **could be extended list**" | ❌ **RENAME** a `EXTENDED LIST` (o `EXTENDED`) |
| `STATUS` ("Priced" / "Needs Review") | "we would. **Get rid of. the rest**" | ❌ **REMOVE** |
| `SOURCE` ("EMAIL" / "OCR" / "API") | "Get rid of. the rest" + Christian 28:31 source es doc-level | ❌ **REMOVE** |
| Eye icon (view actions) | (no afectada · es actions column) | ✅ KEEP |

##### Wendy 39:21-39:48 · propuestas de Magda RECHAZADAS

Magda propuso agregar columnas adicionales que Wendy rechazó explícitamente:

| Propuesta Magda | Wendy en minuto 39 | Decisión |
|---|---|---|
| **Payment terms column** | (no respondió directo, foco en discount) | ❌ NO (futuro) |
| **Discount column per-line** | 39:30: "**The manufacturer does not state what the discount is**" | ❌ NO |
| **Contract column per-line** | 39:43: "**That's in the RFQ screen. The contract.**" (ya doc-level) | ❌ NO |
| **Lead time column** | 40:12: "future state, not for the purpose of what we're doing to get this for Sunday" | ❌ NO (future state) |

##### Layout final aprobado por Wendy

```
Quote Items table:
[PART #] [MODEL] [DESCRIPTION] [QTY] | [LIST] [EXTENDED LIST] | [actions: eye]
```

Donde:
- `LIST` = manufacturer's quoted list price per item (era Net Price)
- `EXTENDED LIST` = List × Qty per row (era Amount)
- Sin Status per-line (la status es a nivel doc en el header del Quote)
- Sin Source per-line (la source es a nivel doc, no varía por item)

##### Línea adicional detectada en screenshot 3 · custom item warning

```
⚠ 1 custom item pending price · excluded · call Leland
```

**Análisis**:
- No discutido explícitamente en transcript
- Refleja un caso real: items custom (no en catálogo estándar) necesitan pricing manual de Leland
- Excluded del subtotal (no se cuenta hasta tener precio)
- ✅ KEEP · es info útil, no contradice ningún principio

##### E.00000 · Pricing Breakdown box · audit visual (screenshot 2 · bottom right Quote detail)

##### E.00000.a · Estado actual visible

```
PRICING BREAKDOWN
─────────────────────────────────────────
Product net (after discount):    $25,398.72
Textile upcharges:               +$3,140.00
Freight (LTL):                   +$3,320.00
─────────────────────────────────────────
Extended total:                  $31,858.72
```

##### E.00000.b · Conflicto detectado con Wendy 39:30

| Línea | Decisión | Conflicto con transcript |
|---|---|---|
| `Product net (after discount)` | ❌ CONFLICT | Wendy 39:30: "the manufacturer does not state the discount" |
| `Textile upcharges` | ✅ KEEP | Wendy 36:18 endorsed textile review |
| `Freight (LTL)` | ✅ KEEP | No discutido pero valid |
| `Extended total` | ✅ KEEP | Wendy 38:40 "extended list" |

##### E.00000.c · Resolución elegida · Opción B (rename + ajustar valores a LIST)

**Decisión**: cambiar el label Y los valores a List (pre-discount), no solo rename cosmético.

```
PRICING BREAKDOWN
─────────────────────────────────────────
List subtotal:                   $X  ← sum of (List Price × Qty) per row
Textile upcharges:               +$3,140.00
Freight (LTL):                   +$3,320.00
─────────────────────────────────────────
Extended total:                  $X
```

##### E.00000.d · Coherencia cross-check con cambios per-line ya decididos

| Per-line cambio | Pricing Breakdown impact |
|---|---|
| NET PRICE column → LIST PRICE rename | ✅ "Product net" → "List subtotal" coherente |
| `-62% APPROVED` per-line REMOVE | ✅ "after discount" REMOVE del label coherente |
| AMOUNT column → EXTENDED rename | ✅ "Extended total" ya coherente (mantiene) |
| Values per-line: Net → List (e.g. $479.18 → $1,261) | ⚠️ **Cambia visualmente los números totales del demo** |

##### E.00000.e · Tensión: cambio numérico significativo

**Hoy** (con discount aplicado):
- T-RCR306029HLG2: $479.18 × 4 = $1,916.72
- Total quote: $25,398.72

**Después** (List values, sin discount):
- T-RCR306029HLG2: $1,261 × 4 = $5,044
- Total quote: ~$67,240 (que de hecho aparece como `GROSS VALUE: $67,240` en el card top!)

**Insight**: El `GROSS VALUE: $67,240` actual ya es el LIST TOTAL. Después del cleanup:
- `GROSS VALUE` se convierte en `LIST VALUE` (mantiene número $67,240)
- `NET VALUE: $25,398` desaparece (era after discount)
- `Product net (after discount): $25,398.72` (en breakdown) desaparece
- Breakdown muestra el List subtotal $67,240 (mismo número que GROSS VALUE pero ahora coherente)

##### E.00000.f · Implementación final consolidada

**Quote Information card (top)**:
```
LIST VALUE: $67,240          LINE ITEMS: 8         STATUS: Pending · textile review
EXPIRATION DATE: Feb 12, 2026
```

**Pricing Breakdown (bottom)**:
```
List subtotal:               $67,240.00
Textile upcharges:           +$3,140.00
Freight (LTL):               +$3,320.00
─────────────────────────────────────
Quote total:                 $73,700.00
```

**Per-line columns**:
```
PART # | MODEL | DESCRIPTION | QTY | LIST PRICE | EXTENDED | STATUS
T-RCR306029HLG2 | TAB-T | TBL... | 4 | $1,261.00 | $5,044.00 | Priced
```

Donde cada `LIST PRICE` es el valor pre-discount real del manufacturer's list.

##### E.00000.g · Validación con Wendy's vision

✅ Manufacturer cotiza LIST (no aplica discount)
✅ No aparece "discount" en ningún lugar del quote view
✅ Dealer aplica su discount al hacer el PO (lifecycle siguiente)
✅ Textile upcharges (legítimo, endorsed)
✅ Freight separado (no discount)
✅ Total coherente

---

#### E.0000 · Transcript moment crítico (34:36-35:00) + mapeo al PDF feedback

**Wendy enlazó revisions con quote details en transcript 34:36-34:58**:

> Wendy 34:36: "I also would not reflect that every single one of these is **revision #3**."
> Christian 34:51: "Yep, you can **mix up the revisions** and..."
> Wendy 34:58: "Okay, so then we get into view quote details. **I gave feedback on this in the chat**. Net price needs to be removed as list price."

**Insight**: Wendy refirió al PDF "Feedback from teams NEOCON.pdf" que adjuntó al chat. Específicamente los items #8, #9, #10 del PDF documentan los cambios que ella anuncia verbalmente.

##### Mapeo exacto · PDF item #8 (Item Details Drawer · red marks "Remove both of these")

**Valores específicos a remover** (transcripción exacta de los boxes del PDF):

| Sección PDF | Contenido visual | Acción |
|---|---|---|
| `QUANTITIES & PRICE` (3 boxes apilados) | `NET PRICE: $2,031.12` + `DISCOUNT: -58%` + `LIST PRICE: $4,836` | ❌ REMOVE sección entera |
| `VALIDATION` (panel completo) | "Discount 58% approved · Owner: Sales Mgr · Approved by Felicia M.-P. · At: 2026-01-18 11:42" | ❌ REMOVE panel entero |

**Razón Wendy** (39:30): "the manufacturer does not state the discount" — toda la info de discount/validation del manufacturer no aplica.

**Qué QUEDA en el drawer post-cleanup**:
- ✅ Header del item (Title · SKU · tags Needs Review/Tag D/Seating/EMAIL/Rev #N/David Park)
- ✅ `AMOUNT: $4,062.24` (single metric top-right)
- ✅ `LIFECYCLE` pipeline (PO received → ... → Delivered)
- ✅ `SPECIFICATIONS` (Fabric CF-6036 Ocean Blue · Finish LG2-Loft Gray · Size 34"W x 33"D x 36"H)
- ✅ `TEXTILE GRADED-IN` (Grade B · CF Stinson · $24/yd · vendor verified)
- ✅ `AI SUGGESTIONS` (Action required mismatch detected)

##### Mapeo exacto · PDF item #9 (Quote PDF Export · red box on Tax lines)

**Líneas específicas a remover del Quote PDF**:

| Línea PDF | Valor mostrado | Acción |
|---|---|---|
| `Nontaxable Subtotal` | $127,880.17 | ❌ REMOVE |
| `Taxable Subtotal` | $0.00 | ❌ REMOVE |
| `Tax` | $0.00 | ❌ REMOVE |

**Qué QUEDA en el Quote PDF post-cleanup**:
- ✅ `Total List Products: $702,599.00`
- ✅ `Total Net Products: $127,880.17`
- ✅ `Total Freight: $0.00`
- ✅ `Total Product Weight: 14,820 lbs`
- ✅ `Total Order: $127,880.17` (línea final)

**Razón Wendy PDF #9**: "we don't add these lines in the quote"

##### Mapeo exacto · PDF item #10 (PO PDF Export · red box on DISC% column)

**Columna específica a remover**:

| Columna PDF | Contenido | Acción |
|---|---|---|
| `DISC %` | Valores tipo "84.75" en cada row del PO | ❌ REMOVE columna entera |

**Qué QUEDA en el PO PDF post-cleanup** (columnas):
`LINE | Req | Qty | Ship | ITEM NUMBER | DESCRIPTION | LIST | NET PRICE | AMOUNT`

**Razón**: alineado con principio que manufacturer view no muestra discount del dealer (manufacturer cotiza list, dealer aplica su contract discount al ordenar).

##### Audit "REV #N" → "Revision # N" (rename completo · Wendy 34:36 usó palabra completa)

**Citation textual**: Wendy 34:36: "I also would not reflect that every single one of these is **revision #3**." — usó palabra completa "revision" en su speech, NO la abreviatura "Rev".

**Ubicaciones a renombrar** (audit por grep):

| Ubicación | Hoy | Después |
|---|---|---|
| Quote detail header sub-chip | `REV #3` | `Revision # 3` |
| Quote list view (Transactions tab) | `Rev #N` | `Revision # N` |
| RFQ detail header sub-chip | `REV #N` | `Revision # N` |
| Ack detail header sub-chip | `Rev #N` | `Revision # N` |
| Item Details Drawer · revision badge | `Rev #3` (visible en PDF #8) | `Revision # 3` |
| Quote Comparison modal | `Rev #N` | `Revision # N` |
| Quote PDF Export | `Rev #N` | `Revision # N` |
| Shipping rows | `REV #2` | `Revision # 2` |

**Espaciado**: Wendy usó "revision #3" sin espacio extra, pero para legibilidad visual el plan recomienda `Revision # 3` con espacios entre la palabra, el `#` y el número.

##### Variar los revision numbers en seed (Wendy 34:36 + Christian 34:51)

**Estado actual**: todos los Quotes en seed muestran `REV #3` (revisionNumber: 3 hardcoded)

**Target**: variar entre #1, #2, #3 (algunos quotes recién creados sin revisión, otros con varias)

**Distribución sugerida en seed `recentQuotes`**:

| ID | Revision suggested | Razón |
|---|---|---|
| QT-1025 NorthPoint | `Revision # 3` (mantener · es el caso del demo principal) | Status Pending · textile review |
| QT-1024 Pacific | `Revision # 1` (recién creado) | Status In Progress |
| QT-1023 Summit | `Revision # 2` (una iteración) | Status Sent |

---

#### E.000 · Audit visual completo del Quote detail page (basado en screenshot user 2026-06-05 · QT-1025)

##### Header / sticky bar

| Elemento | Hoy | Decisión | Razón |
|---|---|---|---|
| `#QT-1025 · NorthPoint Furniture Group` | OK | ✅ KEEP | OK |
| Status badge top-right: `Awaiting Client` | Fuera de taxonomía | ❌ Cambiar a `Pending` o `Sent` | No está en `[In Progress / Pending / Sent / Expired]` |
| Current Phase: `Negotiating` | Rejected explicitly | ❌ Cambiar a `Quote Review` o quitar header | Wendy 31:39 "you don't negotiate a quote" |

##### Quote Information card · métricas (los 5 boxes arriba)

| Métrica | Hoy | Decisión | Razón |
|---|---|---|---|
| ~~GROSS VALUE~~ | $67,240 | ❌ **REMOVE** | Wendy 35:00 + no aplica gross/net en quote |
| **NET VALUE → `LIST VALUE`** | $25,398 (green) | ❌ **RENAME** | Wendy 35:00: "Net price needs to be removed as list price" |
| ~~AVG DISCOUNT~~ | 60.8% | ❌ **REMOVE** | Wendy 39:30: "manufacturer does not state the discount" |
| **LINE ITEMS** | 8 | ✅ KEEP | OK |
| **STATUS** | "Awaiting Client" | ❌ Cambiar a status nueva taxonomía | Mismo principio |
| **EXPIRATION DATE** (NUEVO · agregar) | (n/a hoy) | ✅ ADD | Pair semántico con status `Expired` |

**Card post-cleanup** (4 métricas):
- `LIST VALUE: $X`
- `LINE ITEMS: 8`
- `EXPIRATION DATE: Feb 12, 2026`
- `STATUS: Pending` (con sub-flag textile review para QT-1025)

##### Sub-chips debajo de la card

| Chip | Hoy | Decisión | Razón |
|---|---|---|---|
| Source `EMAIL` | OK (post sources cleanup) | ✅ KEEP | OK |
| `DP SALES REP David Park` | OK | ✅ KEEP | OK |
| `REV #3` | Abreviado | ❌ **CAMBIAR a `Revision # 3`** (palabra completa) | Wendy 34:36 usó palabra completa "revision" |

**Esta decisión del rename `Rev #N` → `Revision # N` aplica TAMBIÉN a otros tabs**:

Audit de uso · buscar en código todos los `Rev #N` y cambiar a `Revision # N`:
- Quote list view (Transactions tab)
- Quote detail header sub-chips
- Quote Items table (si aparece)
- RFQ detail header sub-chips
- Ack detail header sub-chips (si aplica)
- Quote Comparison modal
- Quote PDF Export

##### Action buttons (top right de "Quote Items" tab bar)

| Botón | Hoy | Decisión | Razón |
|---|---|---|---|
| **Proforma** | ✅ Visible | ❌ **VERIFICAR removido** | Asly PDF #1 + ya implementado en commit 0cd44e8 (debería no aparecer post-rebase) |
| **Compare** | ✅ Visible | ✅ KEEP | OK |
| **New Revision** | OK | ✅ KEEP | Ya usa palabra completa "Revision" |
| **Freight** | OK | ✅ KEEP | OK |

##### Quote Items table filters (decisión user previa · KEEP los 3)

| Filtro | Decisión |
|---|---|
| Search | ✅ KEEP |
| All items | ✅ KEEP |
| All Materials | ✅ KEEP |
| Price Status | ✅ KEEP |

##### Quote Items table · columnas

| Columna | Hoy | Decisión | Razón |
|---|---|---|---|
| PART # | OK | ✅ KEEP | OK |
| MODEL | OK | ✅ KEEP | OK |
| DESCRIPTION (con tags + size) | OK | ✅ KEEP | OK |
| QTY | OK | ✅ KEEP | OK |
| **NET PRICE** ($479.18 + "-62%" line) | rename + remove discount % | ❌ **RENAME a `List Price`** + REMOVE the "-62%" sub-line | Wendy 35:00 (rename) + 39:30 (no discount) |
| **AMOUNT** ($1,916.72) | rename | ❌ **RENAME a `Extended`** | Wendy 38:40 "extended list" |
| STATUS per-line (Priced / Needs Review) | Per-line status | ⚠️ TBD · valid case use o remover | Christian: "es a nivel doc" · pero `Needs Review` per-line tiene valor (e.g. textile review) |
| SOURCE per-line (EMAIL / OCR) | Per-line source | ❌ **REMOVE** | Christian 28:31: "source es a nivel doc, no per-line" |
| `✓ APPROVED` chip per-line (price approval) | OK | ✅ KEEP | Validation del price aprobado por sales mgr |
| `Request sample` button | Solo en F-SSC346030C | ❌ **REMOVE** | Wendy 37:45 "get rid of this" |
| `+ Textile upcharge · 10 yd · +$230.00` | F-SSC346030C row | ✅ KEEP | Wendy 36:18 endorsed (caso textile review) |
| `CF-6036 Ocean Blue · TIER B · ✓ VERIFIED` | F-SSC346030C sub-chips | ✅ KEEP | Refleja `Pending · textile review` (case valid) |

**Reorganización propuesta para Quote Items table** (post-cleanup):

```
PART # | MODEL | DESCRIPTION | QTY | LIST PRICE | EXTENDED | STATUS | (sin SOURCE)
```

Donde:
- `LIST PRICE` muestra solo el monto (sin discount per-line)
- `EXTENDED` muestra List × Qty
- `STATUS` per-line opcional (Priced / Needs Review · valid case)
- Sub-chip `✓ APPROVED` debajo del LIST PRICE cuando aplica
- Textile upcharge sub-info debajo del EXTENDED cuando aplica

##### Status especial del row F-SSC346030C (caso textile review)

Este row es el case study perfecto del sub-flag `Pending · textile review`:
- Quote status overall: `Pending`
- Quote sub-flag: `textile review`
- Row status per-line: `Needs Review` (porque fabric needs validation)
- Sub-chips: `CF-6036 Ocean Blue · TIER B · ✓ VERIFIED`
- Textile upcharge calc: `+ 10 yd · +$230.00`

Esta visualización refleja exactamente lo que Wendy 36:18 endosó.

---

#### E.0 · Principio rector de Wendy para evaluar Quote statuses

**Wendy 31:39 (ejemplo principal)**:
> "I already put in the comments, **negotiating is not a status. You don't negotiate a quote**."

**Insight**: un status válido debe reflejar una **acción real del negocio** que le ocurre al quote, no una abstracción genérica. Wendy usó Negotiating como ejemplo: nadie "negocia" un quote literalmente — el dealer lo aprueba (→ PO), lo rechaza, lo deja expirar, o pide revisión.

**Filtro aplicado a cada Quote status**:

| Status | ¿Refleja acción real? | Decisión basada en el principio |
|---|---|---|
| `Negotiating` | ❌ NO · "you don't negotiate a quote" | REMOVE |
| `Draft` | ✅ Sí pero nombre genérico | RENAME a `In Progress` (Magda 33:44 más descriptivo) |
| `Sent` | ✅ Sí · acción concreta · quote enviado | KEEP |
| `Approved` | ⚠️ Sí pero redundante · "becomes a PO" (Wendy 33:22) | REMOVE (redundancia) |
| `Lost` | ✅ Real pero no discutido | REMOVE (principio "let's keep with the basics") |
| `In Progress` (nuevo) | ✅ Sí · manufacturer trabajando activamente | ADD |
| `Pending` (nuevo) | ✅ Sí · waiting on something específico (textile review, etc.) | ADD |
| `Expired` (nuevo) | ✅ Sí · trigger temporal real cuando validUntil < today | ADD |

**Aplicación a sub-flags**:
- `Pending · textile review` ✅ pasa el filtro — refleja la acción real de "quote en hold mientras fabric se testea" · Wendy 36:18 endorsement directo

**9 statuses mencionados · 5 finales (1 con sub-estado) · 3 descartados · 1 ambiguo**

#### E.1.a · Statuses propuestos y decisión final

| # | Status | Quién | Decisión | Razón |
|---|---|---|---|---|
| 1 | `Negotiating` (existente) | Wendy 31:39 | ❌ **REMOVE** | "You don't negotiate a quote" |
| 2 | `Draft` (existente) | Wendy 32:18 | ❌ Renombrado a `In Progress` | Magda 33:44 + Wendy 33:51 "I like that better" |
| 3 | `Pending` | Wendy 32:11 | ✅ **FINAL** | Reemplaza el rol que tenía Negotiating |
| 4 | `Sent` | Wendy 32:35 | ✅ **FINAL** | "Tent is where that flow ends" (33:40) |
| 5 | `Approved` | Christian 33:10 | ❌ **REMOVE** | Wendy 33:22: "at that point you're getting a PO" |
| 6 | `In Progress` | Magda 33:44 | ✅ **FINAL** | Replaces Draft (Wendy 33:51) |
| 7 | `Expired` | Magda 34:15 | ✅ **FINAL** | Wendy 34:24: cuando `valid until` expira |
| 8 | `Pending · textile review` (sub-estado) | Wendy 36:18 | ✅ **FINAL como sub-flag de Pending** | "stays pending until that comes back" cuando fabric needs testing |
| 9 | `Lost` (existente) | NO discutido en transcript | ⚠️ **AMBIGUO** | Decisión user pendiente · analogía con `Rejected` (descartado) pero `Lost` es semánticamente distinto (perdido a competidor) |

#### E.1.b · Final statuses + transitions (Wendy decisions)

```
┌──────────────────────────────────────────────────────────────────┐
│ IN PROGRESS                                                      │
│ (manufacturer trabajando · finalizing draft)                     │
└────┬─────────────────────────────────────────────────────────────┘
     │
     │ Trigger: usuario completa data básica
     │ pero aún falta validar algo (fabric, etc.)
     ▼
┌──────────────────────────────────────────────────────────────────┐
│ PENDING                                                          │
│ (waiting on something · puede tener sub-flag 'textile review')   │
│ Sub-flag: 'Pending · textile review' si fabric no es stocked     │
└────┬─────────────────────────────────────────────────────────────┘
     │
     │ Trigger: validación completa · click 'Send Quote'
     ▼
┌──────────────────────────────────────────────────────────────────┐
│ SENT                                                             │
│ (quote enviado al dealer · esperando aceptación o expiración)    │
└────┬─────────────────────────────────────────────────────────────┘
     │
     │ Auto-trigger: cuando `validUntil` < today
     ▼
┌──────────────────────────────────────────────────────────────────┐
│ EXPIRED                                                          │
│ (terminal · puede re-issuearse como nueva revisión)              │
└──────────────────────────────────────────────────────────────────┘

Path adicional (cuando dealer acepta):
SENT → (dealer envía PO) → row se mueve fuera de Quotes tab,
         aparece como nueva fila en Purchase Orders tab
```

#### E.1.c · Sub-filters del tab Quotes

| Sub-filter | Statuses visibles | Razón |
|---|---|---|
| `Active` | In Progress · Pending · Sent | Work in progress y waiting for response |
| `Completed` | Expired · (Approved if Lost kept) | Terminal states históricos |
| `All` | Todos | Vista completa |
| `Metrics` | KPIs read-only | OK |

#### E.1.d · Columnas del Quotes list view y Quote detail

**Quote list view (tab Quotes)**:

| Columna | Estado | Razón |
|---|---|---|
| DETAILS (avatar, dealer, ID, sales rep, rev) | ✅ Mantener | OK |
| PROJECT & LOCATION | ✅ Mantener | OK |
| AMOUNT | ✅ Mantener | Quote SÍ tiene precio (diferente de RFQ) |
| STATUS | ✅ Mantener (con nuevos statuses) | OK |
| SOURCE | ✅ Mantener doc-level | OK (Email/Dealer Portal/NetSuite/Manual) |
| CONTRACT | ✅ Mantener | Existente |
| VALID UNTIL | ✅ Mantener | Wendy 32:55 confirmó |
| ACTIONS | ✅ Mantener (sin Reply nuevo, ya no es inbound) | OK |

**Quote detail · per-line columns**:

| Columna | Estado | Razón |
|---|---|---|
| Part # / SKU | ✅ Mantener | OK |
| Description | ✅ Mantener | OK |
| QTY | ✅ Mantener | OK |
| `List Price` (renombrado de Net Price) | ✅ **FINAL** | Wendy 35:00: "Net price needs to be removed as list price" |
| `Extended` (= List × Qty) | ✅ Agregar | Wendy 38:40: "this could be extended list" |
| ~~Discount per-line~~ | ❌ Remover | Wendy 39:30: "manufacturer does not state what the discount is" |
| ~~Amount per-line~~ | ❌ Remover | Wendy 38:40: "get rid of the rest" |
| ~~Sample request buttons~~ | ❌ Remover | Wendy 37:45: "get rid of this" |

**Columnas adicionales propuestas y descartadas**:
- ~~`Contract` per-line~~ → Wendy 39:43: "that's in the RFQ screen" · ya existe a nivel doc, no per-line
- ~~`Lead time`~~ → Wendy 40:12: "future state, not for Sunday"
- ~~`Payment terms`~~ → Magda mencionó · no adoptado (mismo principio out of scope V1)

#### E.1.e · Otros refinamientos de Quotes

- **Revisions**: variar los números (no todos en #3) · Wendy 34:36 "I also would not reflect that every single one is revision #3"
- **Sub-flag `Pending · textile review`**: combinable como chip secundario debajo del status badge · Wendy 36:18 endosó explícitamente
- **Quote Approval Draft email**: remover línea "Approve here and we will convert it to a PO and request the production deposit" (PDF #6 + transcript implícito)
- **PDF Export del Quote**: remover lineas Nontaxable Subtotal / Taxable Subtotal / Tax (PDF #9 · Wendy: "we don't add these lines in the quote")
- **Item Details Drawer**: remover los 3 boxes de "Net Price / Discount / List Price" + el panel "Validation: Discount 58% approved" (PDF #8)

#### E.1.f · Alignment current code vs target (filters + chips)

**Estado actual en código** (Transactions.tsx línea 262):
```ts
const quoteStages = ['Draft', 'Sent', 'Negotiating', 'Approved', 'Lost']
```

**Seed actual** (recentQuotes 235-238):
- QT-1025 NorthPoint · `Negotiating` + sub-chip `Sample & textile review`
- QT-1024 Pacific · `Draft`
- QT-1023 Summit · `Sent`
- QT-1022 Beacon Hill · `Approved`

**Alignment table**:

| Status | En código hoy | Decisión transcript | Acción cleanup |
|---|---|---|---|
| `Draft` | ✅ | RENAME → `In Progress` | Rename array + seed + filter dropdown |
| `Sent` | ✅ | KEEP | Sin cambio |
| `Negotiating` | ✅ | REMOVE | Eliminar de array · QT-1025 cambia status |
| `Approved` | ✅ | REMOVE | Eliminar de array · QT-1022 needs decision |
| `Lost` | ✅ | ⚠️ NO mencionado en transcript | **AMBIGUO** · decisión user pendiente |
| `In Progress` | ❌ | ADD (replace Draft) | Agregar |
| `Pending` | ❌ | ADD | Agregar |
| `Pending · textile review` | ❌ | ADD como sub-flag de Pending | Implementar chip secundario combinable |
| `Expired` | ❌ | ADD | Agregar · auto-trigger por validUntil |

**Cleanup específico del seed**:

| ID | Status hoy | Status target | Razón |
|---|---|---|---|
| QT-1025 | `Negotiating` + sub `Sample & textile review` | `Pending · textile review` | Sub-flag absorbido dentro del status |
| QT-1024 | `Draft` | `In Progress` | Rename directo |
| QT-1023 | `Sent` | `Sent` | Sin cambio |
| QT-1022 | `Approved` | ⚠️ **Decisión pendiente**: a) cambiar a Sent · b) mover a Purchase Orders · c) eliminar del seed | Wendy: "becomes a PO at that point" |

**Chips visualmente alineados**:

| Status | Tone | Visual |
|---|---|---|
| `In Progress` | warning amber | 🟡 In Progress |
| `Pending` | warning amber | 🟡 Pending |
| `Pending · textile review` | warning amber + sub-flag info | 🟡 Pending · 🔵 Sample & textile review (stacked) |
| `Sent` | info blue | 🔵 Sent |
| `Expired` | muted gray + strike | ⚪ Expired |
| `Lost` (TBD) | destructive red | 🔴 Lost |

#### E.1.f.0 · Rename "Valid Until" → "Expiration Date" (decisión user 2026-06-05)

**Razón**: alinea con el nuevo status `Expired` y es más claro semánticamente. "Valid Until" suena vago; "Expiration Date" es preciso.

**Scope**: solo el LABEL visible al user. El field name interno `validUntil` se mantiene en código (menos invasivo, no afecta lógica).

**Archivos afectados** (audit completo · 6 archivos, 6 lugares de UI label):

| Archivo | Línea | Lugar visual | Cambio |
|---|---|---|---|
| `Dashboard.tsx` | 111 | KPI card label | `'Valid Until'` → `'Expiration Date'` |
| `Transactions.tsx` | 2434 | Column header tab Quotes | `'Valid Until'` → `'Expiration Date'` |
| `Transactions.tsx` | 2788 | Label expanded view | `'Valid Until'` → `'Expiration Date'` |
| `PEDExportModal.tsx` | 447 | PDF export label | `Valid Until: ` → `Expiration Date: ` |
| `PEDExportModal.tsx` | 838 | Modal preview label | `Valid Until: ` → `Expiration Date: ` |
| `QuoteComparisonModal.tsx` | 222 | Compare modal label | `Valid until` → `Expiration Date` |

**Aplicación por tab**:

| Tab | ¿Aplica rename? | Razón |
|---|---|---|
| Quotes | ✅ SÍ | Es el target principal · pair con status `Expired` |
| RFQ | N/A | No muestra la columna ("Date" en su lugar) |
| Purchase Orders | N/A | No tiene `Valid Until` |
| Acknowledgements | ❌ NO | Muestra `"Exp. Ship"` que es diferente concepto (expected ship date) |
| Orders/Shipping | N/A | Tienen ETA, no Valid Until |

#### E.1.f.1 · Quote Items table filters (decisión user 2026-06-05)

A diferencia de RFQ (donde se removieron por "very basic"), **en Quote tab los 3 dropdowns SE MANTIENEN**:

| Filtro | RFQ tab | Quote tab |
|---|---|---|
| Search SKU/Product Name | ✅ KEEP | ✅ KEEP |
| `All items` dropdown | ❌ REMOVE | ✅ **KEEP** |
| `All Materials` dropdown | ❌ REMOVE | ✅ **KEEP** |
| `Price Status` dropdown | ❌ REMOVE | ✅ **KEEP** |

**Razón**: Quote tiene más data y los filtros aportan valor para navegación. Wendy mencionó "very basic" específicamente para RFQ, no para Quote.

#### E.1.g · Ambigüedades RESUELTAS (decisiones user 2026-06-05)

✅ **`Lost` status** → **REMOVER**. Alinearse con principio Wendy 23:54 "let's keep with the basics". `Lost` se quita de `quoteStages` array, de filter dropdown, y de chips.

✅ **QT-1022 Beacon Hill `Approved`** → **MOVER a recentOrders como PO `PO Received`**. Coherente con Wendy: "becomes a PO at that point". Esto requiere:
- Eliminar QT-1022 de `recentQuotes` seed
- Agregar nuevo entry en `recentOrders` con datos derivados (Beacon Hill Furnishings · Coastal Hospitality · Beach Hotel Renovation · status `PO Received` · linkedQuote: 'QT-1022' como referencia histórica)
- El demo ahora muestra el flujo realista Quote → PO

#### E.1.h · Lista final de statuses para Quote (post ambiguity resolution)

```
4 statuses finales + 1 sub-flag:
  1. In Progress      (warning amber)
  2. Pending          (warning amber · puede tener sub-flag textile review)
  3. Sent             (info blue)
  4. Expired          (muted gray, strike-through)

  Sub-flag (combinable solo con Pending):
  - Pending · textile review  (chip secundario info blue debajo de Pending)
```

#### E.1.i · `quoteStages` final code

```ts
// Antes:
const quoteStages = ['Draft', 'Sent', 'Negotiating', 'Approved', 'Lost']

// Después:
const quoteStages = ['In Progress', 'Pending', 'Sent', 'Expired']
```

#### E.1.j · Seed `recentQuotes` final

| ID | Customer | Status final | Sub-flag | Notas |
|---|---|---|---|---|
| QT-1025 | NorthPoint | `Pending` | `textile review` | Sub-flag absorbido (era chip separado) |
| QT-1024 | Pacific | `In Progress` | — | Renombrado de Draft |
| QT-1023 | Summit | `Sent` | — | Sin cambio |
| ~~QT-1022~~ | ~~Beacon Hill~~ | ~~Approved~~ | — | **MOVIDO a recentOrders como PO Received** |

#### E.1.k · Nuevo entry en `recentOrders` (derivado de QT-1022)

```ts
{
  id: "#ORD-2046",  // próximo ID disponible
  customer: "Beacon Hill Furnishings",
  client: "Coastal Hospitality",
  project: "Beach Hotel · Renovation",
  amount: "$150,000",
  status: "PO Received",
  date: "(reciente)",
  initials: "BH",
  source: "Email",  // o el que aplique
  dealer: "Beacon Hill Furnishings",
  endCustomer: "Coastal Hospitality",
  linkedQuote: "QT-1022",  // referencia histórica
  contract: "OMNIA-2024-FP",
}
```

#### E.1.g · Statuses considerados y descartados (trazabilidad histórica)

- `Negotiating` → Wendy 31:39 "you don't negotiate a quote"
- `Draft` → renamed to `In Progress` (Magda 33:44 + Wendy 33:51)
- `Approved` → Wendy 33:22 "becomes a PO at that point"
- ~~`Sample required`~~ → Wendy 37:32 "totally not even related" (OOS V1)

### F. Item Details Drawer cleanup (PDF #8)

En el drawer de un line item:
- ~~Net Price / Discount / List Price — los 3 boxes de "Quantities & Price"~~ → **REMOVER**
- ~~"Validation: Discount 58% approved · Owner: Sales Mgr · Approved by Felicia M.-P."~~ → **REMOVER**

Mantener: Specifications (Fabric, Finish), Lifecycle pipeline, AI suggestions, Textile graded-in badge.

### G. Quote/PO PDF previews cleanup (PDF #9 #10)

**Quote PDF Export** (Quote Estimate):
- ~~`Nontaxable Subtotal`~~ → REMOVER
- ~~`Taxable Subtotal`~~ → REMOVER
- ~~`Tax`~~ → REMOVER
- Razón Wendy: "we don't add these lines in the quote"

**PO PDF Export** (Purchase Order):
- ~~`DISC%` column~~ → REMOVER (manufacturer view no muestra el discount del dealer)

### H. Email drafts cleanup

**Quote for Approval Draft** (PDF #6):
- ~~"Approve here and we will convert it to a PO and request the production deposit"~~ → REMOVER esa línea entera
- Razón Wendy: "The manufacturer is not issuing a PO" — el manufacturer envía el quote, el dealer manda el PO

### I. Three-Way Match / Discrepancies modal (PDF #7 #18)

- "3-Way Match · Reconciliation Hub" → cambiar a **"PO vs Acknowledgement · Reconciliation"** (es 2-way en realidad)
- Column header **"Source of Truth"** → cambiar a **"Purchase Order"** (PDF #7)
- ~~Column `Invoice`~~ → REMOVER del match (manufacturer no emite invoice en este view)
- ~~Botones de "Resolve" / "Accept Fix" / "Keep Original" en la vista manufacturer~~ → REMOVER o ocultar
- Razón Wendy: "the manufacturer just sends the acknowledgement. Discrepancies are resolved by the dealer before the order is entered"

### J. RFQ row actions: add Reply CTA (Christian decision)

- Agregar botón **"Reply"** en actions de cada RFQ row
- Click → abre EmailDraftModal con draft pre-poblado pidiendo más info o respondiendo al dealer
- Razón Christian: cuando un RFQ está en "Additional Information Required" el user necesita una forma estándar de pedirle al dealer ese info
- Reutilizar `EmailDraftModal` que ya existe

### K. Manual upload affordance (Christian + Wendy decision)

Wendy inicialmente sugirió agregar upload en RFQ y Purchase Orders. Pero después aclaró: "this is the manufacturer view, the manufacturer would not be uploading those documents."

**Decisión final**: NO agregar upload affordance ni en RFQ ni en PO. Manual source queda eliminada.

(El upload sigue funcionando en Quote Converter porque ahí SÍ es manual-by-design para el SIF Generator demo.)

### L. Acknowledgement page (manufacturer view) cleanup (Wendy + PDF #18) · AUDIT EXHAUSTIVO

**Principio rector Wendy (sobre Ack)**: "the manufacturer **just sends** the acknowledgement. Discrepancies are resolved by the dealer before the order is entered" — el manufacturer **detecta y documenta**, NO resuelve.

#### L.0 · Estado actual del Ack (verificado en código 2026-06-05)

**Files**:
- `src/Transactions.tsx` líneas 241-245 · `recentAcknowledgments` seed
- `src/Transactions.tsx` línea 263 · `ackStages` array
- `src/AckDetail.tsx` · componente extensivo con DiscrepancyResolverAgent + 3-Way Match

**Seed actual** (3 entries):

| ID | Status | Linked Order | Exp Ship | Shipment No | Source | Discrepancy field | Dealer |
|---|---|---|---|---|---|---|---|
| Ack-8839 | `Confirmed` | #ORD-2055 | Mar 20, 2026 | SHP-7437123 | `RPA` | "None" | NorthPoint |
| Ack-8840 | `Discrepancy` | #ORD-2049 | Mar 10, 2026 | SHP-7438250 | `OCR` | "Price Mismatch ($500)" | Beacon Hill |
| Ack-8841 | `Partial` | #ORD-2053 | Jan 30, 2026 | SHP-7440188 | `Dealer Portal` | "Backordered Items" | Pacific |

**ackStages actual** (línea 263):
```ts
const ackStages = ['Pending', 'Discrepancy', 'Partial', 'Confirmed']
```

#### L.1 · Statuses del Ack tab · audit + decisión final

| Status actual | Decisión | Razón |
|---|---|---|
| `Pending` | ✅ KEEP | 48hr ventana de revisión del dealer |
| `Discrepancy` | ❌ **REMOVE** | Wendy: no es un status · es un FIELD detectado |
| `Partial` | ✅ KEEP | Ack parcial (algunos items confirmados, otros no) |
| `Confirmed` | ✅ KEEP | Ack confirmado fully |

**Nuevo `ackStages` final**:
```ts
const ackStages = ['Pending', 'Partial', 'Confirmed']
```

#### L.2 · Distinción crítica · Discrepancy como FIELD vs Discrepancy como STATUS

**Wendy clarification (inferred from "manufacturer just sends... dealer resolves")**:
- Discrepancy como **STATUS** → ❌ REMOVE (no es un estado del Ack, es información detectada)
- Discrepancy como **FIELD detectado** → ✅ KEEP (info útil que el manufacturer documenta y comunica)
- Discrepancy **RESOLUTION** en manufacturer view → ❌ REMOVE (lo hace el dealer)

**Implicación visual**:
- En list view: cuando un Ack tiene discrepancy detectado, NO cambia el status badge a "Discrepancy"
- En su lugar: status sigue siendo `Pending` o `Partial` + sub-flag chip `⚠ Discrepancy detected` (similar pattern a `Pending · textile review`)
- Esto refleja la realidad: la Ack está pendiente o parcial, Y ADICIONALMENTE hay info que el dealer debe revisar

**Sub-flag chips para Ack**:
| Status primary | Sub-flag posible | Visual |
|---|---|---|
| `Pending` | (none) | 🟡 Pending |
| `Pending` | `discrepancy detected` | 🟡 Pending · ⚠ discrepancy detected |
| `Partial` | (none) | 🟠 Partial |
| `Partial` | `backorder detected` | 🟠 Partial · ⚠ backorder detected |
| `Confirmed` | (none) | 🟢 Confirmed |

#### L.3 · Seed cleanup post-statuses + sources

| ID | Status target | Sub-flag | Source target | Notas |
|---|---|---|---|---|
| Ack-8839 | `Confirmed` | (none) | `Email` (era RPA) | Sources cleanup B |
| Ack-8840 | `Pending` o `Partial` (era Discrepancy) | `price mismatch detected` | `Email` (era OCR) | Status reasignado · discrepancy a sub-flag |
| Ack-8841 | `Partial` | `backorder detected` | `Dealer Portal` | Sub-flag refleja "Backordered Items" |

**Decisión recomendada para Ack-8840**: cambiar a `Pending` (waiting for dealer review of discrepancy) con sub-flag · más realista que `Partial`.

#### L.4 · Columnas Ack list view · audit

| Columna | Hoy | Decisión | Razón |
|---|---|---|---|
| DETAILS (avatar, dealer, ID, sales rep, rev) | ✅ Visible | ✅ KEEP | OK |
| PROJECT & LOCATION | ✅ Visible | ✅ KEEP | OK |
| AMOUNT | ✅ Visible | ✅ KEEP | Ack tiene precio (inherited from PO) |
| STATUS | ✅ Visible | ✅ KEEP (con 3 nuevos statuses + sub-flags) | L.1 + L.2 |
| ~~SOURCE~~ | ✅ Visible | ❌ **REMOVE** | Wendy: manufacturer es sender, no receiver · source no aplica |
| EXP. SHIP DATE | ✅ Visible | ⚠️ **RENAME a `PLANNED DELIVERY`** | F.11.h consistency con HermanMiller wording |
| ~~SHIPMENT NUMBER~~ | ✅ Visible? | ❌ **REMOVE display** (field stays in data) | Wendy: no disponible cuando se envía Ack |
| DATE | ✅ Visible | ✅ KEEP | Fecha de envío del Ack |
| ACTIONS | ✅ Visible | ✅ KEEP (sin Quick Message · D.2.a Ack es outbound) | OK |

**Filtros del Ack tab** (parecido a PO):
- ✅ Search input · KEEP
- ✅ Status dropdown · KEEP (con `Pending`/`Partial`/`Confirmed`)
- ✅ Sub-filter pills (Active/Completed/All/Metrics) · KEEP

#### L.5 · Information card del Ack detail (top métricas)

| Métrica esperada | Decisión |
|---|---|
| `ACK VALUE: $X` (= sum of confirmed amounts) | ✅ Mantener |
| `LINKED ORDER: #ORD-XXXX` | ✅ Mantener (con link al PO/Order detail) |
| `LINE ITEMS: N confirmed / M total` | ✅ Mantener (refleja partial cases) |
| `STATUS: Pending` (+ sub-flag) | ✅ Mantener |
| `PLANNED DELIVERY: Mar 20, 2026` | ✅ Mantener (renamed from Exp Ship Date) |
| ~~`SHIPMENT NUMBER`~~ | ❌ REMOVE (Wendy: no disponible aún) |
| `DEPOSIT STATUS` (si aplica) | ⚠️ Conditional · solo si workflow de deposit-required pasó por este Ack |

**Sub-chips del header**:
| Chip | Decisión |
|---|---|
| `LINKED PO #ORD-XXXX` | ✅ KEEP (con link al PO detail) |
| ~~`Source EMAIL`~~ | ❌ REMOVE (Ack es outbound, no inbound) |
| `SALES REP {name}` | ✅ KEEP |
| ~~`REV #N`~~ | ❌ RENAME a `Revision # N` (cross-section consistency) |
| `Planned Delivery Mar 20, 2026` | ✅ KEEP |

#### L.6 · Per-line columns del Ack detail · pricing

Hereda del PO (Ack confirma lo que el PO solicitó):

| Column | Decisión | Razón |
|---|---|---|
| `Item #` (SKU) | ✅ KEEP | OK |
| `Description` (con specs) | ✅ KEEP | OK |
| `Qty Ordered` | ✅ KEEP | Del PO original |
| `Qty Confirmed` | ✅ ADD (NEW) | Refleja partial cases (backordered) |
| `Price` (renamed from Net Price) | ✅ KEEP | F.15 consistency · Wendy 53:48 |
| `Discount` sub-line `-62%` etc. | ✅ KEEP | F.15 · discount visible en PO/Ack/Order |
| `Amount` | ✅ KEEP | Price × Qty Confirmed |
| `Status` per-line (`Confirmed` / `Backordered` / `Substituted`) | ✅ KEEP | Útil para partial cases |
| ~~`Source` per-line~~ | ❌ REMOVE | Christian 28:31 |

#### L.7 · DiscrepancyResolverAgent · AI moment audit (DELICADO)

**Estado actual** (AckDetail.tsx líneas 74, 113, 338, 562, 1203):
- `DiscrepancyResolutionFlow` component (line 74) · muestra discrepancies y acciones
- `DiscrepancyActionCard` (line 338) · acciones de resolución per discrepancy
- "AI Analysis Complete — DiscrepancyResolverAgent pre-analyzed both exceptions" (line 113)
- "TrackingAgent — Price Discrepancy Detected on Knoll ACK" (line 752)
- "DiscrepancyResolverAgent analyzing exceptions..." (line 1203)

**Tensión con Wendy/PDF #18**:
- Wendy: manufacturer NO resuelve discrepancies (lo hace el dealer)
- Pero el AI detection es valuable hero moment del demo
- Si removemos todo, perdemos el AI showcase

**Resolución propuesta · DETECT-but-not-RESOLVE pattern**:

| Aspecto | Decisión | Razón |
|---|---|---|
| AI DETECTA discrepancies (DiscrepancyResolverAgent analyzing) | ✅ KEEP | Hero moment válido · manufacturer-side detection |
| AI shows "AI Analysis Complete · 2 exceptions found" | ✅ KEEP | Documentación de lo detectado |
| Visual cards con info de cada discrepancy | ✅ KEEP (renamed) | Info útil · pero ya no como "resolution flow" |
| Action buttons "Accept Fix" / "Keep Original" / "Resolve" | ❌ REMOVE | Wendy: manufacturer NO resuelve |
| Action button reemplazo: "Notify dealer · awaits review" | ✅ ADD | Refleja workflow real (dealer resuelve) |
| Status `Discrepancy` | ❌ REMOVE | L.1 · es sub-flag, no status |
| Timeline step `Resolved` | ❌ REMOVE | Manufacturer no resuelve · no aplica al timeline |
| TrackingAgent badge "Price Discrepancy Detected" | ✅ KEEP (rename si necesario) | OK detection |

**Rename component**: `DiscrepancyResolutionFlow` → `DiscrepancyDetectionPanel` (semánticamente correcto).

#### L.8 · 3-Way Match · audit completo (PDF #7 + #18)

**Estado actual**: modal con `setIsReconciliationOpen` (AckDetail.tsx line 1362) · "3-way reconcile" button · "3-Way Match · Reconciliation Hub" title.

**Cambios per PDF #7 + #18 + L principio**:

| Pieza | Hoy | Decisión |
|---|---|---|
| Title `3-Way Match · Reconciliation Hub` | OK | ❌ RENAME a **`PO vs Acknowledgement · Reconciliation`** (es 2-way en realidad, no 3-way) |
| Column header `Source of Truth` | OK | ❌ RENAME a **`Purchase Order`** (PDF #7) |
| Column `Invoice` | Presente | ❌ REMOVE (manufacturer no emite invoice en este view · PDF #18) |
| Action buttons "Resolve" / "Accept Fix" / "Keep Original" | Presentes | ❌ REMOVE en manufacturer view (Wendy) |
| Visual de comparison PO vs Ack | OK | ✅ KEEP (es el core valor del modal) |
| Action button reemplazo: "Notify dealer of differences" | (n/a) | ✅ ADD |

#### L.9 · Timeline en Ack detail · audit

**Estado actual** (AckDetail.tsx line 667): timeline incluye step `Resolved`:
```ts
{ name: 'Resolved', status: 'pending' }
```

**Wendy/PDF L**: timeline para manufacturer view debe ser:
```
Order Entered → Acknowledgement Sent → In Production
```

Sin `Resolved` (que aplica solo al dealer-side workflow).

**Acción**:
- ❌ REMOVE step `Resolved` del timeline
- ✅ Verificar que los 3 steps restantes (Order Entered / Acknowledgement Sent / In Production) tienen visual + states correctos

#### L.10 · Action buttons del Ack detail header

Acciones esperadas en Ack detail (manufacturer view):

| Botón | Decisión | Razón |
|---|---|---|
| `Send Ack` (cuando status es Pending para Send / Draft) | ✅ KEEP | Workflow primary |
| `Mark as Sent` (manual override) | ✅ KEEP | Edge case |
| `Reconcile` / `Compare PO vs Ack` | ✅ KEEP (rename si necesario) | Abre el modal de L.8 |
| `Notify dealer of changes` | ✅ ADD | Reemplaza los buttons removidos de resolution |
| ~~`Generate Proforma`~~ | ❌ NO (movido a PO detail per F.0.1.f) | Workflow correcto Wendy 41:16 |
| ~~`Convert to PO`~~ | ❌ N/A | Ack no se convierte a PO · es al revés |
| `Email dealer` (genérico) | ✅ KEEP (reutiliza EmailDraftModal) | Útil para comunicación ad-hoc |

#### L.11 · Sources cleanup específico del Ack

**Aplicación de regla B al seed Ack** (todos los entries):

| Entry | Source hoy | Source target |
|---|---|---|
| Ack-8839 | `RPA` | `Email` (default replacement) |
| Ack-8840 | `OCR` | `Email` (default replacement) |
| Ack-8841 | `Dealer Portal` | `Dealer Portal` (KEEP · valid source) |

**Adicional**: el field `source` en Ack entries puede ser **completamente removido** de la display (L.4 column REMOVE), pero el field debe quedar en data por back-compat. La display es lo que importa.

#### L.12 · Aplicabilidad de F.10 (no shipment content) al Ack

**¿Aplica el principio "no shipment content" al Ack?** Análisis:

| Pieza shipment | En Ack? | Razón |
|---|---|---|
| Tracking number | ❌ NO | Aún no hay tracking · viene en Shipping tab |
| Carrier | ❌ NO | Aún no asignado en Ack stage |
| Planned Delivery Date | ✅ SÍ | Wendy: el Ack ES donde se commit la fecha |
| Delay flag | ❌ NO | Aplica post-shipping |
| ETA actual vs Planned | ❌ NO | Solo Planned existe en Ack stage |

**Conclusión**: Ack es el lugar correcto para mostrar `Planned Delivery Date` (rename desde Exp Ship Date). Otros artifacts de shipment aplican a Orders/Shipping.

#### L.13 · Sub-counter chip en tab Ack

Similar a otros tabs (RFQ "N NEW", PO posible "N PENDING"):
- Ack tab podría mostrar `N PENDING` (counting `Pending` status)
- O `N AWAITING REVIEW` si hay sub-flag `discrepancy detected` o `backorder detected`
- **Decisión recomendada**: `N PENDING` (simple) · OK V1

#### L.14 · Resumen de cleanup para AckDetail.tsx

**Archivos afectados**:

1. **`src/Transactions.tsx`**:
   - Línea 263: `ackStages` array → remove `Discrepancy`
   - Líneas 241-245: seed `recentAcknowledgments`:
     - Sources cleanup (RPA/OCR → Email/etc.)
     - Ack-8840 status `Discrepancy` → `Pending` con sub-flag
     - Add `subFlag` field to relevant entries

2. **`src/AckDetail.tsx`**:
   - Remove DiscrepancyResolutionFlow action buttons (Accept Fix / Keep Original)
   - Rename `DiscrepancyResolutionFlow` → `DiscrepancyDetectionPanel`
   - Remove `Resolved` step del timeline (line 667)
   - Rename 3-way match title → "PO vs Acknowledgement · Reconciliation"
   - Remove "Source of Truth" column → "Purchase Order"
   - Remove Invoice column en match modal
   - Remove Source column del list view per-row
   - Remove Shipment Number del display
   - Rename "Exp. Ship Date" → "Planned Delivery Date" (cross-section consistency)
   - Per-line columns: rename Net Price → Price + add Qty Confirmed column
   - Sub-chips header: rename REV #N → Revision # N · remove Source

3. **`src/components/AckReconciliationModal.tsx`** (si existe separate):
   - Mismos cambios de title + columns

#### L.21 · Unit Price refinement · alineación cross-stage (user request 2026-06-05)

##### L.21.a · Contexto

User detectó que el plan tiene **tensión interna** entre 2 decisiones sobre pricing labels:

| Plan section | Decision | Source |
|---|---|---|
| **Section M** (original capture) | Ack y posteriores: `Unit Price` | Wendy: "becomes unit price" |
| **F.15** (más reciente · PO context) | PO/Ack/Orders: `Price` (renamed from Net Price) | Wendy 53:48: "to be safe, just take net and change it to price" |

**Tensión**: F.15 usó `Price` simple para PO/Ack/Orders. Section M dijo `Unit Price` para Ack+. Resulta en 2 labels distintos entre PO y Ack si se aplican literalmente las 2 secciones.

User pidió revisar lo que Wendy dijo sobre `Unit Price` para refinar.

##### L.21.b · Análisis textual · 3 quotes de Wendy sobre pricing

| Tiempo | Quote textual | Stage |
|---|---|---|
| 35:00 | "Net price needs to be removed **as list price**" | Quote (rename to List) |
| 53:48 | "I'm thinking **to be safe**, just take net and change it to **price**" | PO context |
| (later · captured M) | "**becomes unit price**" | Ack context |

##### L.21.c · Análisis semántico de cada label

| Label | Precisión semántica | Ambigüedades | Industry standard? |
|---|---|---|---|
| `Net Price` | ❌ Vago | After discount? After tax? After freight? | Inconsistent (different ERPs use it differently) |
| `Price` | ⚠️ Ambiguo | Tipo de precio? Per-unit o total? | Generic shorthand |
| `Unit Price` | ✅ Preciso | Per-unit cost confirmed | ✅ Universal standard |
| `List Price` | ✅ Preciso | Published catalog price | ✅ Industry standard for Quote |
| `Extended Price` | ✅ Preciso | List × Qty | ✅ Standard for Quote total |

##### L.21.d · Wendy intent · "to be safe"

Wendy 53:48: "**to be safe**, just take net and change it to price"

**Decoding the intent**:
- "to be safe" → quiere terminology **inequívoca**
- `Price` simple was the conservative tentative
- BUT later (Ack context) Wendy clarified to "becomes unit price"
- **Final inferred intent**: `Unit Price` es más "safe" que `Price` solo (más específico)

Por qué Wendy fue tentative en 53:48: probablemente estaba pensando en voz alta · "Price" fue su primer instinct conservador · "Unit Price" fue la versión refined cuando llegó al Ack context.

##### L.21.e · Resolution · 3 opciones

| Opción | Label PO | Label Ack | Label Order | Label Invoice | Consistency |
|---|---|---|---|---|---|
| **A · Strict Wendy verbatim** | `Price` (53:48) | `Unit Price` ("becomes") | `Unit Price` | `Unit Price` | ❌ Inconsistent (PO vs rest) |
| **B · Unify post-Quote a `Unit Price`** | `Unit Price` | `Unit Price` | `Unit Price` | `Unit Price` | ✅ Full consistency |
| **C · Keep F.15 simple `Price`** | `Price` | `Price` | `Price` | `Price` | ⚠️ Diverge de Section M Wendy "unit price" |

**Recomendación · Opción B**:

1. **Honra Wendy's "to be safe" principle**: `Unit Price` es MÁS seguro que `Price` solo (menos ambiguo)
2. **Honra Wendy's "becomes unit price"**: aplica desde el primer stage post-Quote (PO)
3. **Cross-stage consistency**: same label en todos los views post-Quote · reduce cognitive load
4. **Industry alignment**: `Unit Price` es universal standard en ERPs (SAP, NetSuite, Oracle, etc.)
5. **PO 53:48 "Price" interpretation**: tentative shorthand · refinement Wendy llegó a "Unit Price" después en Ack context

##### L.21.f · Cross-stage table final · pricing terminology consolidated

| Stage | Column label | Sub-line displayed? | Discount visible? | Citation primary |
|---|---|---|---|---|
| **RFQ** | (no price column) | n/a | n/a | Wendy 27:33 "RFQ doesn't have pricing" |
| **Quote** | `List Price` | Extended = List × Qty | ❌ NO (manufacturer cotiza list) | Wendy 35:00 + 38:40 |
| **PO** | `Unit Price` | Discount % sub-line | ✅ SÍ (dealer's contract applied) | Wendy 53:48 + 54:03 · refined to Unit Price per L.21.e |
| **Ack** | `Unit Price` | Discount % sub-line (inherited) | ✅ SÍ (carry-over PO) | Wendy "becomes unit price" |
| **Orders** | `Unit Price` | Discount % sub-line (inherited) | ✅ SÍ (carry-over PO) | L.21 consistency |
| **Shipping** | (no price column · tracking focus) | n/a | n/a | F.12 |
| **Invoice** (future · OOS V1) | `Unit Price` | TBD | TBD | TBD |

##### L.21.g · Visual antes/después · per-line columns post-L.21

**ANTES (F.15 que dijo `Price`)**:
```
PART # | DESCRIPTION | QTY | PRICE     | AMOUNT
T-RCR  | TBL REC     | 6   | $479.18   | $2,875.08
       |             |     | (-62%)    |
```

**DESPUÉS post-L.21 (refinement a `Unit Price`)**:
```
PART # | DESCRIPTION | QTY | UNIT PRICE | AMOUNT
T-RCR  | TBL REC     | 6   | $479.18    | $2,875.08
       |             |     | (-62%)     |
```

Cambio mínimo visual (column header) pero alineamiento semántico completo.

##### L.21.h · Update consolidado a F.15 (override)

**F.15 actual** dice `Price` (Wendy 53:48 verbatim). 

**L.21 override** dice `Unit Price` (Wendy refined intent · Ack context · industry standard · consistency).

**Resolución**:
- F.15 stays como historical record del razonamiento intermedio
- L.21 es la decisión FINAL aplicable
- F.15 references en plan summary tables se actualizan a `Unit Price`

##### L.21.i · Update consolidado a Section M

**Section M actual** dice tentative entre `List Price` y `Unit Price` para Quote · `Unit Price` para Ack+.

**L.21 confirms**:
- Quote → `List Price` (Wendy 35:00 + 38:40 verbatim · ✅ no más tentative)
- Quote `Unit Price` fallback DESCARTADO
- Ack+/PO+/Orders+ → `Unit Price` (Section M intent preserved + extended to PO)

**TBD #M (Wendy circle back con Mark sobre Quote)**: CERRADO post-L.21:
- Quote = `List Price` (Wendy 35:00 verbatim wins · no more tentative)

##### L.21.j · Item Drawer · Wendy item 8 PDF reconciliation

PDF #8: "Remove both of these" pointed at the 3 boxes en Item Details Drawer:
- `NET PRICE: $2,031.12`
- `DISCOUNT: -58%`
- `LIST PRICE: $4,836`

**L.21 implications para Drawer**:

| Pieza del Drawer (Wendy item 8) | Decisión post-L.21 | Razón |
|---|---|---|
| Box `NET PRICE` | ❌ REMOVE (Wendy item 8) | Confirmed |
| Box `DISCOUNT` | ❌ REMOVE (Wendy item 8) | Confirmed |
| Box `LIST PRICE` | ❌ REMOVE (Wendy item 8) | Confirmed |
| Single metric `AMOUNT` top-right | ✅ KEEP | OK |
| (NEW · si necesario) métrica `UNIT PRICE` adicional | ⚠️ Optional · solo si valuable para context | TBD |

**Decision**: Drawer mantains single `AMOUNT` métrica (per F.15.k). Si user pide más detail, se puede agregar inline en table row (no en Drawer header).

##### L.21.k · Files afectados por L.21

Audit + rename `Price` → `Unit Price` en:

- `src/Transactions.tsx` · column headers (PO/Ack/Orders list views)
- `src/OrderDetail.tsx` · column headers + Information card
- `src/AckDetail.tsx` · column headers + Information card + 3-Way Match modal columns
- `src/components/manufacturer/ItemDetailsDrawer.tsx` · si tiene unit price reference
- `src/components/AckReconciliationModal.tsx` · column headers
- PDF Export modals (Quote/PO) · si referencia "Price" labels
- Email templates · si hay mention de prices

**No cambia** (Quote sigue siendo List Price):
- `src/QuoteDetail.tsx` · `List Price` column (NO rename · L.21.f confirmed)

##### L.21.l · Verification post-L.21

```bash
# 1. PO/Ack/Order use 'Unit Price' (not 'Price' alone)
grep -rn "'Price'\|>Price<\|: Price " inbound-outbound/src/OrderDetail.tsx
# 0 hits esperado · todo 'Unit Price'

grep -rn "Unit Price" inbound-outbound/src/OrderDetail.tsx
# Hits esperados

# 2. Quote NO usa Unit Price (stays List Price)
grep -rn "Unit Price" inbound-outbound/src/QuoteDetail.tsx
# 0 hits esperado

grep -rn "List Price" inbound-outbound/src/QuoteDetail.tsx
# Hits esperados

# 3. No más 'Net Price' anywhere
grep -rn "Net Price\|netPrice" inbound-outbound/src/
# 0 hits esperado (excepto field name de back-compat si aplica)

# 4. No 'Price' bare en Ack/PO contexts
grep -rn "header.*Price\|>Price<" inbound-outbound/src/AckDetail.tsx
# Solo Unit Price esperado
```

##### L.21.m · Cross-section consistency table final · pricing labels

Resumen ejecutivo del refinement:

```
RFQ        → (no pricing)
Quote      → List Price + Extended (Wendy 35:00 · 38:40)
PO         → Unit Price + Discount sub-line + Amount (L.21)
Ack        → Unit Price + Discount sub-line + Amount (L.21)
Orders     → Unit Price + Discount sub-line + Amount (L.21)
Shipping   → (no pricing · tracking focus)
Invoice    → Unit Price (V2 · OOS V1)
```

##### L.21.n · TBDs resueltos por L.21

| TBD | Resolution |
|---|---|
| Section M TBD (Quote · circle back con Mark) | ✅ CERRADO · `List Price` (Wendy 35:00 verbatim wins) |
| F.15 vs Section M tension | ✅ RESUELTO · L.21 unifica a `Unit Price` para post-Quote stages |

---

#### L.18 · Refinamientos minuto 57 · sources + dealers no resuelven + backorders + columnas + DATE rename (user request 2026-06-05)

##### L.18.a · 5 puntos del minuto 57 (user request)

User pidió revisar 5 puntos específicos del segmento ~57min del transcript Wendy:
1. Sources acordes al Ack (Ack es outbound · qué sources son válidas)
2. Dealers TAMPOCO resuelven discrepancias (refinement crítico al principle L.16.b)
3. Backorders · qué decide Wendy específicamente
4. Columnas adicionales que Wendy señala REMOVE
5. Rename DATE column · término específico Wendy minuto 57 (TBD · transcript no accesible)

##### L.18.b · Sources acordes al Ack · refinement final

**Análisis cross-source**:

| Source name | Aplica a INBOUND docs (RFQ/PO) | Aplica a OUTBOUND docs (Ack/Quote-sent) |
|---|---|---|
| `Email` | ✅ Sí (dealer mandó por email) | ⚠️ Conceptualmente "delivery channel" (manufacturer envía por email) |
| `Dealer Portal` | ✅ Sí (dealer cargó en portal) | ⚠️ "delivery channel" (manufacturer publica en portal) |
| `NetSuite` | ✅ Sí (sync via API inbound) | ⚠️ "delivery channel" (manufacturer push via NetSuite) |
| `Manual` | ✅ Sí (edge case upload por manufacturer) | ❌ N/A (manufacturer creates Ack in system, no upload) |

**Tensión semántica**:
- `Source` literalmente = "de dónde vino" → solo aplica a inbound
- Para outbound debería ser `Channel` o `Delivery Method`
- Pero usar 2 nombres distintos en 2 tabs genera inconsistency visual

**Decisión final · 3 opciones**:

| Opción | Pro | Contra |
|---|---|---|
| **A · REMOVE source de Ack/Quote-sent entirely** | Consistent con "outbound no tiene source" · alineado con L.4 ya documentado | Pierde info de delivery channel · no track de cómo se envió |
| **B · KEEP source pero renombrar en Ack a `Channel`** | Preserva data · semánticamente correcto | Diverge naming entre tabs |
| **C · KEEP source con same name + 3 valores válidos** (`Email`/`Dealer Portal`/`NetSuite`) | Consistency visual | Semánticamente raro ("source" para outbound) |

**Recomendación**: **Opción A** (REMOVE column del display) + KEEP field en data layer para analytics.
- Coherente con Wendy L: "manufacturer es sender, no receiver"
- Coherente con L.4 + L.16.d ya documentado
- Si en V2 queremos surface delivery channel, lo agregamos como `Channel` column nueva

##### L.18.c · Dealers TAMPOCO resuelven (refinement crítico a L.16.b)

**Citation original (L.16.b)**: "Discrepancies are resolved by the dealer before the order is entered"

**Refinement del user 2026-06-05**: "los dealers no pueden resolver discrepancias también"

**Reconciliación · qué significa esto**:

Hipótesis A · **In our demo app, NEITHER manufacturer NOR dealer resolves**:
- Discrepancies son DETECTED y DOCUMENTED en el demo
- La resolución sucede FUERA del demo app (en dealer's own system, manual workflow, etc.)
- En manufacturer view del demo: zero resolution buttons
- En dealer view del demo (si existe): zero resolution buttons (consistente)

Hipótesis B · **Dealer resuelve pero en OTHER context (not in our app)**:
- Resolution conceptually happens dealer-side
- But that workflow is in dealer's ERP/portal, NOT in our manufacturer demo
- Same practical outcome as Hipótesis A para nuestro scope

**Decisión consolidada**:
- **Manufacturer view (demo current)**: ❌ ZERO resolution actions
- **Dealer view (demo viewAs)**: ❌ ZERO resolution actions (consistency)
- **Resolution conceptual workflow**: out-of-demo · dealer handles externamente

**Implicación al plan**:
- L.7 ya removió manufacturer-side resolution buttons → ✅ aplica también a dealer view
- L.16.b update: "Discrepancies are documented by the manufacturer **and resolved outside this app** (in dealer's own systems or manual workflow)"

**Update específico a L.7 + L.16.b**: agregar nota "dealer-side resolution también out-of-scope · zero resolution buttons en cualquier viewAs"

##### L.18.d · Backorder workflow · qué decide Wendy específicamente

L.17 ya documentó el backorder workflow básico. Wendy minuto 57 likely refinó algún aspecto. Sin transcript, posibles refinements (best guesses):

| Posible refinement Wendy | Impacto |
|---|---|
| **Backorder requires ETA mandatory** | Item-level status `Backordered` requiere ETA field no null · si null → status `Discontinued` o `Pending Source` |
| **Backorder vs Substitution mutual exclusion** | Per-line: NO puede ser ambos simultáneo (compound case F-SSC346030C real revisitar) |
| **Backorder partial qty display** | Mostrar `2 of 4 shipping / 2 backordered ETA Nov 27` (split clear) |
| **Backorder triggers automatic email** | Auto-template "Backorder notification" cuando se detecta · pre-drafted |
| **Backorder no afecta deposit timing** | Deposit (F.0.1) puede pedirse incluso si hay backorder · independent flows |

**Sin transcript verificable, documentar como TBD**:

**TBD #L.18.d**: confirmar con user qué refinement específico de backorders Wendy dijo en minuto 57. Hipótesis recomendada de implementación V1:
- Backorder requires ETA field
- Item-level visual: `2 of 4 shipping · 2 backordered · ETA Nov 27`
- Auto-template email triggered
- Compound (backorder + substitution simultáneo): caso real ya en código (F-SSC346030C) → KEEP

##### L.18.e · Columnas adicionales que Wendy señala REMOVE

Cross-referenciando screenshots 10-11 vs Wendy principles, columns que NO deben estar en Ack list view:

| Column | Decisión | Status del plan |
|---|---|---|
| `DISCREPANCY` (dedicated) | ❌ REMOVE | ✅ documentado L.16.d |
| `SOURCE` per-row | ❌ REMOVE | ✅ documentado L.4 · L.16.d |
| `SHIPMENT #` | ❌ REMOVE | ✅ documentado L.4 · L.16.d |
| `VENDOR` (wrong-named en manufacturer view) | ⚠️ RENAME a `DEALER` | ✅ documentado L.16.f |

**Posibles columns adicionales que Wendy minuto 57 pudo mencionar** (hipotéticas sin transcript):
- `LOCATION` (Austin/London) · puede ser redundante con PO & Location · TBD
- `Sales Rep` (David Park visible como sub-chip) · puede ser redundante · TBD
- `Avatar` initials · cosmético · likely KEEP

**TBD #L.18.e**: confirmar con user qué columnas específicas Wendy mencionó remover en minuto 57.

##### L.18.f · DATE column rename · término específico de Wendy minuto 57

**Estado actual** (screenshot 10 · tooltip "Document creation date"):
- Column label: `DATE`
- Tooltip explica: representa cuando se creó el documento

**Wendy minuto 57**: pidió cambiar el término. Sin transcript verificable, opciones posibles:

| Posible rename | Razón semántica | Probabilidad |
|---|---|---|
| `Acknowledged Date` | Cuando manufacturer ack'd el order | Alta · matches workflow Wendy |
| `Sent Date` | Cuando manufacturer envió el Ack | Alta · matches "manufacturer just sends" principle |
| `Issued Date` | Cuando manufacturer emitió el Ack | Media · alternative formal |
| `Created Date` | Cuando se creó en sistema | Baja · es el tooltip current · no necesita rename |
| `Ack Date` | Abreviado | Media |

**Decisión propuesta**: `Sent Date` (alinea con Wendy's "the manufacturer just sends the acknowledgement" · L.16.b).

**TBD #L.18.f**: confirmar el término exacto que Wendy dijo en minuto 57.

**Aplicabilidad cross-section**: si rename aplica a Ack tab, validar también en:
- Quote tab DATE column → ¿`Quoted Date` / `Sent Date`?
- RFQ tab DATE column → ¿`Received Date` (mejor que "Date")?
- PO tab DATE column → `Received Date` (cuando PO arrived)
- Orders tab DATE column → `Order Date` (HermanMiller usa esto)

**Cross-tab decisión** (consistency):

| Tab | Naturaleza | DATE rename target |
|---|---|---|
| RFQ | INBOUND | `Received Date` |
| Quotes | OUTBOUND | `Sent Date` |
| Purchase Orders | INBOUND | `Received Date` |
| Acknowledgements | OUTBOUND | `Sent Date` |
| Orders | (overall) | `Order Date` |
| Shipping | OUTBOUND | `Sent Date` (notification) |

##### L.18.g · Files afectados por L.18

- `src/Transactions.tsx` · column headers per tab (DATE rename)
- `src/Transactions.tsx` · `recentAcknowledgments` seed (source field cleanup)
- `src/AckDetail.tsx` · resolution refinement (dealer-side cero también)
- `src/components/AckReconciliationModal.tsx` · resolution buttons cleanup completo
- `src/components/StatusBadge.tsx` o equivalent · item-level statuses backorder ETA mandatory

---

#### L.19 · 3-Way Match modal · roles + actions + columns audit (user screenshot 2026-06-05)

##### L.19.a · Contexto

Screenshot 11 muestra modal `3-Way Match · Reconciliation Hub` abierto desde Ack #ACK-3099 NorthPoint Furniture Group. User pidió analizar roles + actions + refinements.

##### L.19.b · Elemento-por-elemento audit con role assignment

**Header del modal**:

| Elemento | Rol implícito | Decisión Wendy/PDF | Acción |
|---|---|---|---|
| Title `3-Way Match · Reconciliation Hub · STRATA AI` | n/a | PDF #7 | RENAME a `PO vs Acknowledgement · Reconciliation` · KEEP `STRATA AI` badge |
| Subtitle `PO vs Acknowledgement vs Invoice · 6 lines · 2 exceptions · DiscrepancyResolver pre-analyzed both` | n/a | PDF #18 | RENAME quitando "vs Invoice" + rename `DiscrepancyResolver` → `DiscrepancyDetector` |
| CTA amarillo `Resolve 2 exceptions` | Action attributed to: manufacturer (implicit) | Wendy L.16.b + user L.18.c: nadie resuelve | ❌ **REMOVE** o RENAME a `Notify dealer of 2 exceptions` |

##### L.19.c · 3-Way Match table · column-by-column

| Column hoy | Datos visibles | Decisión | Razón |
|---|---|---|---|
| `LINE ITEM` | SKU + name (T-RCR306029HLG2 / TBL REC) | ✅ KEEP | Core identifier |
| `PO` | $1,916.72 etc (precio del PO) | ✅ KEEP | Una de las 2 partes |
| `ACKNOWLEDGEMENT` | $1,916.72 / Fabric CF-6021 Navy (substituted) / Qty 6 $4,186.08 (2 backordered) | ✅ KEEP | La otra parte | 
| `INVOICE` | $1,916.72 / pending / $4,186.08 | ❌ **REMOVE** | PDF #18 · manufacturer no emite invoice en este stage |
| `STATUS` | Green check / amber chip "Catalog-equivalent fabric · same tier" / orange chip "2 units short · $1,395.36" | ✅ KEEP (renamed sub-info L.17) | Detection output |

**Layout final del table post-cleanup**:

```
LINE ITEM                  | PO            | ACKNOWLEDGEMENT                                  | STATUS
TBL REC 30Dx60Wx29H        | $1,916.72     | $1,916.72                                        | 🟢 Match
T-RCR306029HLG2            |               |                                                  |
CBX Full Depth BBF Ped     | $1,592.96     | $1,592.96                                        | 🟢 Match
X-BBFPFS182812             |               |                                                  |
WORKSURFACE RECT 30Dx72W   | $1,495.68     | $1,495.68                                        | 🟢 Match
W-WS3072                   |               |                                                  |
LB LOUNGE 2 SEAT 34"H      | Fabric        | Fabric CF-6021 Navy (substituted)                | 🔵 Substituted
F-SSC346030C               | CF-6036 Ocean |                                                  | Catalog-equivalent · same tier
CBX Triple Door Locker     | Qty 8         | Qty 6 · $4,186.08 (2 backordered · ETA Nov 27)   | 🟠 Backordered
X-LTD661218L               | $5,581.44     |                                                  | 2 units short · $1,395.36
AUBURN GRAY CONFERENCE     | $5,659.20     | $5,659.20                                        | 🟢 Match
7730                       |               |                                                  |
```

Cambios:
- Column INVOICE removed completely
- Status chip alignment con L.17 taxonomy (item-level statuses)
- Color tokens via DS · no hardcoded

##### L.19.d · Footer del modal

| Elemento hoy | Quien actúa | Decisión |
|---|---|---|
| `4/6 lines matched · 1 exception require resolution` | (texto · sin role específico) | RENAME a `4/6 lines matched · 1 exception requires dealer notification` |
| `Resolve & Approve` CTA verde | Implícito manufacturer/dealer · ambos OOS | ❌ **REMOVE** completely |
| (NEW · post-removal) CTA `Notify dealer of exceptions` | Manufacturer action explícita | ✅ ADD · opens EmailDraftModal con template per exception type (L.17.h) |

##### L.19.e · Information card debajo del modal

| Métrica | Decisión | Razón |
|---|---|---|
| `MATCH RATE 95%` | ✅ KEEP | Detection metric útil |
| `LINE ITEMS 40` | ✅ KEEP | OK |
| `TOTAL ORDER $127,880.17` | ✅ KEEP | OK |
| `EXCEPTIONS 2` | ✅ KEEP | Detection metric útil |
| `STATUS Review Needed` | ⚠️ Adapt a L.17 taxonomy | Probable rename a `Pending · 2 exceptions detected` (status primary + sub-flag) |

**Sub-chips del card**:

| Chip hoy | Decisión |
|---|---|
| `Source RPA` | ❌ REMOVE o rename per L.18.b · Ack outbound |
| `DP SALES REP David Park` | ✅ KEEP |
| `REV #1` | ❌ RENAME `Revision # 1` |

##### L.19.f · Roles consolidated · who does what en el 3-Way Match modal

| Rol | Acciones VÁLIDAS en este modal | Acciones REMOVED |
|---|---|---|
| **Manufacturer** (current viewAs) | View exceptions · View detection details · Notify dealer · Send Ack (workflow primary) | ~~Resolve · Accept Fix · Keep Original · Resolve & Approve~~ |
| **Dealer** (other viewAs) | Receive notification (out-of-modal · email) · Decide externally | ~~Same as manufacturer · ZERO resolution actions en demo~~ |
| **DiscrepancyDetectorAgent** (AI) | Compare PO vs Ack · Detect exceptions · Categorize by type · Propose narrative | ~~Resolve · Auto-fix~~ |
| **System** | Persist match rate · Log timeline event | n/a |

**Insight**: el único actor con acciones en este modal es el **manufacturer** (notify + send) · y son **detection-then-notify** actions, NO resolution actions.

##### L.19.g · Refinements consolidated

12 refinements para el 3-Way Match modal:
1. Rename title `3-Way Match · Reconciliation Hub` → `PO vs Acknowledgement · Reconciliation`
2. Rename subtitle removing "vs Invoice"
3. Rename `DiscrepancyResolver` → `DiscrepancyDetector`
4. Remove `Resolve 2 exceptions` yellow CTA
5. Replace with `Notify dealer of 2 exceptions` CTA
6. Remove `INVOICE` column completely
7. Apply L.17 item-level statuses to status chips (5 types)
8. Update footer text `requires resolution` → `requires dealer notification`
9. Remove `Resolve & Approve` button
10. Add `Notify dealer of exceptions` button (opens EmailDraftModal with template)
11. Update `STATUS Review Needed` chip in Info card to L.17 taxonomy
12. Cross-section cleanup: `Source RPA` (per L.18.b) + `REV #1` (per E.0000)

---

#### L.20 · Tracking Progress timeline · alignment con Hybrid C statuses (user request 2026-06-05)

##### L.20.a · Contexto

Screenshot 12 muestra Tracking Progress modal abierto desde ORD-2056 NorthPoint Furniture Group. User pidió alinear el timeline con los statuses revisados (Hybrid C · 5 primary + sub-phase chips).

##### L.20.b · Estado actual del timeline (screenshot 12)

```
STRATA AI · SMART FORECAST
"Based on current traffic and workflow velocity, the team is expected to arrive 15 minutes early"
98% Probability · ETA Mar 28, 2026

Timeline steps:
1. ✅ Order Entered (Dec 20, 9:00 AM)        @ System
2. ✅ In production (Dec 21, 10:30 AM)        @ Warehouse A
3. ✅ Shipped (Dec 22, 4:15 PM)               @ Logistics Center
4. ⏳ Delivered (Dec 24, 11:00 AM)            @ Port of Entry [current]

+ Add Comment button
+ Contact Team button (top right)
```

##### L.20.c · Mapping a Hybrid C statuses (Opción C aprobada por user)

Recordatorio · Hybrid C:
- **5 primary statuses**: Acknowledged / Shipped / Invoiced / Cancelled / CancelledWithFee
- **Sub-phase chips bajo Acknowledged**: In Production · Ready to Ship
- **Sub-phase chips bajo Shipped**: In Transit · Out for Delivery · Delivered (terminal)

| Timeline step actual | Hybrid C mapping | Decisión |
|---|---|---|
| `Order Entered` | Pre-primary · es el event que **CREA** el Order | KEEP o RENAME a `Acknowledgement Sent` (= momento que origina el Order desde manufacturer view) |
| `In production` | Sub-phase de `Acknowledged` | Convert a sub-phase indicator · timeline event válido |
| `Shipped` | ✅ Primary status (transition Acknowledged → Shipped) | KEEP |
| `Delivered` | Sub-phase terminal de `Shipped` | KEEP como event terminal · marca el end del Shipped phase |

##### L.20.d · 2 patterns posibles para timeline + decisión

**Pattern A · Status-only timeline (strict Hybrid C)**:
```
✅ Acknowledged (Dec 20, 9:00 AM)      sub-phase: In Production
✅ Shipped (Dec 22, 4:15 PM)           sub-phase: In Transit → Delivered
✅ Invoiced (Dec 27, future)           [aún no occurs]
```
- Solo 3 steps primary visible
- Sub-phase chips se actualizan inline
- **Pro**: matches Hybrid C exactly
- **Contra**: pierde granularidad cronológica de los sub-phases

**Pattern B · Event-based timeline (hybrid expanded)**:
```
✅ Acknowledgement Sent (Dec 20, 9:00 AM)    @ System          [Acknowledged primary]
✅ Production Started (Dec 21, 10:30 AM)     @ Warehouse A     [Acknowledged · In Production sub-phase]
✅ Ready to Ship (date)                      @ Warehouse A     [Acknowledged · Ready to Ship sub-phase]
✅ Shipped (Dec 22, 4:15 PM)                 @ Logistics       [Shipped primary]
⏳ In Transit                                @ ...             [Shipped · In Transit sub-phase]
⏳ Delivered (Dec 24, 11:00 AM)              @ Port of Entry   [Shipped · Delivered sub-phase terminal]
```
- 6+ steps con event detail
- Cada event mapea a primary status + sub-phase para info
- **Pro**: granular · matches operational reality
- **Contra**: más visual content

**Recomendación · Pattern B** (event-based):
- Más rich storytelling para demo
- Cada event tagged con su status primary (color + chip lateral)
- Sub-phases visibles cronológicamente

##### L.20.e · Timeline final propuesto (Pattern B)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ STRATA AI · SMART FORECAST                                                │
│ ETA Mar 28, 2026 · 98% Probability · expected to arrive 15 minutes early │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ ✅ Acknowledgement Sent           Dec 20, 9:00 AM       @ System          │
│    [Acknowledged · primary status starts]                                 │
│                                                                            │
│ ✅ Production Started             Dec 21, 10:30 AM      @ Warehouse A     │
│    [Acknowledged · In Production sub-phase]                               │
│                                                                            │
│ (✅ Ready to Ship · auto-triggered)   Dec 22, 9:00 AM   @ Warehouse A     │
│    [Acknowledged · Ready to Ship sub-phase]                               │
│                                                                            │
│ ✅ Shipped                        Dec 22, 4:15 PM       @ Logistics       │
│    [Shipped · primary status transition]                                  │
│                                                                            │
│ ⏳ In Transit                     [in progress]         @ ...             │
│    [Shipped · In Transit sub-phase]                                       │
│                                                                            │
│ ⏳ Delivered (expected)           Dec 24, 11:00 AM      @ Port of Entry   │
│    [Shipped · Delivered sub-phase · terminal]                             │
│                                                                            │
│ (⏳ Invoiced · post-delivery)     ~Dec 27, expected     @ Finance         │
│    [Invoiced · primary status terminal]                                   │
│                                                                            │
└──────────────────────────────────────────────────────────────────────────┘
+ Add Comment button
```

Cambios respecto al timeline actual:
1. **`Order Entered` → `Acknowledgement Sent`** (cuando manufacturer issued the Ack)
2. **Add `Ready to Ship`** step (entre In Production y Shipped)
3. **Add `In Transit`** step (entre Shipped y Delivered · refleja Hybrid C sub-phase)
4. **Add `Invoiced` event** (post-Delivered · al final del lifecycle)
5. **Each step tagged con status primary lateral** (Acknowledged/Shipped/Invoiced)
6. **Sub-phase chips inline** muestra granularidad sin perder Hybrid C principles

##### L.20.f · Status badge en timeline · DS tokens

| Status indicator | Token (sugerido) | Visual |
|---|---|---|
| `Acknowledged` (primary) | `text-info` o brand | 🔵 |
| `In Production` (sub-phase) | `text-info-soft` muted | sub-chip |
| `Ready to Ship` (sub-phase) | `text-success-soft` | sub-chip |
| `Shipped` (primary) | `text-success` | 🟢 |
| `In Transit` (sub-phase) | `text-success-soft` | sub-chip |
| `Delivered` (sub-phase terminal) | `text-success` strong | 🟢 strong |
| `Invoiced` (primary terminal) | `text-foreground` | terminal |
| `Cancelled` (primary) | `text-destructive` | 🔴 |

NO hardcoded · consultar MCP strata-ds antes de impl (per CLAUDE.md proyecto).

##### L.20.g · Smart Forecast section · KEEP + alignment

Estado actual: `STRATA AI · SMART FORECAST · 98% Probability · ETA Mar 28, 2026 · expected to arrive 15 minutes early`

**Decisión**: ✅ KEEP completely · es un AI moment valioso · no contradice Wendy principles.

**Mejora propuesta**: dynamically show forecast for next pending step:
- Si current step es `Delivered` (pending): forecast describe arrival
- Si current step es `Invoiced` (pending): forecast describe invoicing
- Si terminal: forecast hidden o "Order complete"

##### L.20.h · "Contact Team" button + "Add Comment" button

| Botón | Quien actúa | Decisión |
|---|---|---|
| `Contact Team` (top right) | Manufacturer | ✅ KEEP · útil para escalations · opens EmailDraftModal con template de tracking inquiry |
| `Add Comment` (bottom) | Manufacturer | ✅ KEEP · útil para internal log de exceptions o notes |

Ambos pasan principle filter (no resolution actions · son communication/logging).

##### L.20.i · Cross-link con L.17 item-level statuses (timeline lifecycle vs item lifecycle)

**Distinción importante**:
- **Order timeline (L.20)** → muestra el lifecycle macro del Order (Ack → Shipped → Delivered → Invoiced)
- **Item-level statuses (L.17)** → muestra el estado de cada item dentro del Ack (Confirmed / Backordered / Substituted / etc.)

**No conflictan · son orthogonales**:
- Un Order puede estar `Shipped + In Transit` (timeline level)
- Y simultáneamente tener 1 item `Backordered` (item level · pero ese item probablemente se shippea separately)

**Edge case**: si un item está `Backordered` cuando el Order está `Shipped` overall:
- Item se split en 2 shipments cronológicamente
- Timeline puede mostrar `Shipped (partial)` + `Shipped (backorder)` como 2 events separates
- O simplemente: `Shipped` overall + nota "1 item backordered · ETA Nov 27" en el timeline event

**Decisión recomendada**: si hay backorder, agregar event card en timeline:
```
✅ Shipped (partial · 5 of 6 items) Dec 22, 4:15 PM    @ Logistics
⏳ Backordered Items Pending Ship   ETA Nov 27          1 item awaiting production
```

##### L.20.j · Files afectados por L.20

- `src/components/TrackingProgressModal.tsx` (o equivalent) · timeline restructure
- `src/components/manufacturer/TrackingModal.tsx` (verificar nombre exacto)
- Status badge tokens · consult DS

##### L.20.k · Relación con Shipping tab (F.12 restructure)

Tracking Progress modal muestra info de shipment:
- Carrier (TBD in screenshot)
- Tracking events
- ETA

Esto duplica info del Shipping tab (F.12 restructure). Decisión:
- Tracking modal = vista resumida desde Order context
- Shipping tab = vista full lifecycle de todas las shipments

Coexistencia OK · pero validar que data flow es consistent (single source of truth).

---

#### L.17 · Backorder + Substitution workflows + item-level statuses (user request 2026-06-05)

##### L.17.a · Contexto

Detallar los 2 casos demo principales del Ack workflow (post-L.16 cleanup): cuando el Ack diverge del PO original. Pattern existente en código (AckDetail.tsx línea 562):
> "DiscrepancyResolverAgent compared Acknowledgement against PO #ORD-2055. Match rate: 95%. Found 2 exceptions — Item F-SSC346030C (finish backordered, substitution proposed) and X-LTD661218L (2 units backordered, ETA Nov 27)."

Este ya documenta los 2 patterns clave:
1. **Backorder** (qty insuficiente · ETA conocida)
2. **Substitution** (item not fulfillable · alternative proposed)

##### L.17.b · Taxonomy completa · 3 tipos de discrepancies en Ack

| Tipo discrepancy | Trigger | Item-level status | Sub-flag chip Ack | Doc-level status Ack |
|---|---|---|---|---|
| **Price Mismatch** | Manufacturer detecta precio del PO ≠ price actual del item (price changed since Quote) | (n/a · doc-level) | `price mismatch detected` | `Pending` (awaiting dealer review) |
| **Backorder** | Manufacturer no tiene stock suficiente · ETA conocida | `Backordered` | `backorder detected` | `Partial` (some items confirmed, some backordered) |
| **Substitution** | Item discontinuado o not available · manufacturer propone alternative | `Substituted` | `substitution proposed` | `Pending` o `Partial` (waiting dealer approval) |

**Tipo compound** (real case ya en código F-SSC346030C):
- Backorder + Substitution simultáneo (item backordered + alternative proposed concurrently)
- Item-level status: `Substituted` (substitución toma precedencia · si el dealer la acepta resuelve también el backorder)
- Sub-flag: `substitution + backorder detected` (chip combo) o solo `substitution proposed` (más prominente)

##### L.17.c · Item-level statuses · taxonomy completa para Ack

| Status item-level | Visual | Significado | Manufacturer ya completó la acción? |
|---|---|---|---|
| `Confirmed` | 🟢 green check chip | Item OK · qty completa · price match | ✅ SÍ |
| `Backordered` | 🟠 amber clock chip + ETA | Qty parcial available · resto backordered con ETA | ✅ Documentado · waiting dealer decision |
| `Substituted` | 🔵 blue swap chip + alternative SKU | Original not available · alternative proposed | ✅ Proposed · waiting dealer accept/reject |
| `Discontinued` | 🔴 red x chip | Item discontinued · NO alternative posible | ✅ Documented · waiting dealer cancellation |
| `Price Adjusted` | 🟡 yellow $ chip + new price | Price changed desde Quote | ✅ Documented · waiting dealer review |

**Decisión rector** (Wendy L.16.b): manufacturer DETECTA y DOCUMENTA todos · dealer DECIDE en cada caso.

##### L.17.d · Per-line columns del Ack detail · expanded post-L.17

| Column | Decisión | Notas |
|---|---|---|
| `Item #` (SKU) | ✅ KEEP | Original SKU del PO |
| `Description` (con specs) | ✅ KEEP | OK |
| `Qty Ordered` | ✅ KEEP | Qty del PO original |
| `Qty Confirmed` | ✅ KEEP (added en L.6) | Qty que manufacturer puede fulfill |
| `Price` | ✅ KEEP (F.15 rename de Net Price) | Wendy 53:48 |
| `Discount` sub-line | ✅ KEEP | F.15 · discount visible en Ack (carry-over PO) |
| `Amount` | ✅ KEEP | Price × Qty Confirmed (NOT Qty Ordered) |
| `Status` per-line | ✅ KEEP (con L.17.c taxonomy) | 5 statuses possible |
| `Substitute SKU` sub-info (when Substituted) | ✅ ADD (conditional) | Si Substituted: muestra alternative SKU + name |
| `ETA` sub-info (when Backordered) | ✅ ADD (conditional) | Si Backordered: muestra ETA + qty backordered |
| `Reason` sub-info | ✅ ADD (conditional) | Si Discontinued/Substituted: explain |
| ~~`Source` per-line~~ | ❌ REMOVE | Christian 28:31 (consistency) |

##### L.17.e · Visual per-line · ejemplos concretos

**Confirmed row** (normal case):
```
F-RCR306029HLG2  TBL REC 30Dx60Wx29H        Qty 6   Price $479.18    Amount $2,875.08    🟢 Confirmed
                 Tag A · Size 60"W × 30"D    (-62%)
```

**Backordered row** (ORD-2055 X-LTD661218L example):
```
X-LTD661218L     CBX Triple Door Locker      Qty 4 / 2 confirmed   Price $697.68    Amount $1,395.36    🟠 Backordered
                 Tag C · Size 15"W × 18"D    (-62%)                                                       2 units backordered · ETA Nov 27
                                              (2 backordered)
```

**Substituted row** (ORD-2055 F-SSC346030C example):
```
F-SSC346030C     LB LOUNGE 2 SEAT 34"H        Qty 4   Price $2,031.12   Amount $8,124.48    🔵 Substituted
                 Tag B · CF-6036 Ocean Blue   (-58%)                                          Original finish backordered
                                                                                              Proposed: CF-6036 Pacific Blue (similar tier)
                                                                                              Awaiting dealer approval
```

**Discontinued row** (hypothetical case to add to seed):
```
F-DSC123456X     OLD MODEL CHAIR              Qty 2   Price -          Amount -    🔴 Discontinued
                 Tag D                                                              Item discontinued Q4 2025
                                                                                    No suitable alternative
                                                                                    Awaiting dealer cancellation
```

**Price Adjusted row** (Ack-8840 case · current "Price Mismatch ($500)"):
```
T-XYZ            CONFERENCE CHAIR             Qty 4   Price $1,250.00 (was $1,125)   Amount $5,000.00    🟡 Price Adjusted
                 Tag C                        (-50%)                                                       Price increased by $125/unit
                                                                                                            Approved escalation by Sales Mgr
                                                                                                            Awaiting dealer review
```

##### L.17.f · Seed transformation para demonstrar los 5 item-level statuses

Estado actual `recentAcknowledgments` (post-L.3 cleanup):
- Ack-8839 (Confirmed · NorthPoint) → all items `Confirmed`
- Ack-8840 (was Discrepancy → Pending + price mismatch detected) → item-level: 1 `Price Adjusted`
- Ack-8841 (Partial + backorder detected) → item-level: 1-2 `Backordered`

**Cobertura actual**: 3 statuses (Confirmed, Price Adjusted, Backordered) de los 5

**Pendientes para demonstrar**: `Substituted` + `Discontinued`

**Decisión propuesta · agregar 1-2 entries para cobertura completa**:

| Nueva entry | Status Ack | Sub-flag | Item-level highlight |
|---|---|---|---|
| `Ack-8842` (NEW) | `Pending` | `substitution proposed` | 1 item `Substituted` (e.g. F-SSC346030C compound case) |
| `Ack-8843` (NEW · opcional) | `Partial` | `discontinuation detected` | 1 item `Discontinued` |

**Alternativa más simple**: enriquecer Ack-8841 (que ya tiene backorder) con un segundo item con `Substituted` status. Demuestra compound real (similar al pattern de F-SSC346030C ya en código).

**Recomendación**: usar Ack-8839 (Confirmed full) como happy path · Ack-8840 (Price Adjusted) como mismatch detection · Ack-8841 (Partial: backorder + substitution compound) como complex case. Total 3 entries cubren los 5 statuses item-level (Confirmed implicit en Ack-8839 · Price Adjusted en Ack-8840 · Backordered + Substituted en Ack-8841 · Discontinued omitido para no sobrecargar V1).

##### L.17.g · Workflow detection · cuándo se asigna cada item-level status

**Trigger automático del DiscrepancyResolverAgent** (línea 562 existing pattern):

```
Manufacturer click 'Convert to Ack' en PO detail
   ↓
DiscrepancyResolverAgent runs comparison PO vs current manufacturer inventory
   ↓
Per item:
   - Stock check: ¿Qty available >= Qty ordered?
     - SÍ + price OK → status `Confirmed`
     - NO + ETA known → status `Backordered` + ETA estimated
     - NO + no ETA → status `Discontinued` o `Substituted` if alternative found
   - Price check: ¿Price del PO == current price?
     - SÍ → no flag
     - NO → flag `Price Adjusted` (price changed since Quote was issued)
   - Item availability check:
     - Discontinued en catalog → status `Discontinued`
     - Alternative available → status `Substituted` con propuesta
   ↓
Ack generated con:
   - Sub-flag chip combo (e.g. 'backorder detected', 'substitution proposed')
   - Doc-level status: Pending (if items requiere dealer review) o Confirmed (if all items Confirmed)
```

**Pattern technically simulado** (no real inventory check · todo seeded para demo).

##### L.17.h · Dealer notification flow · post-detection

Manufacturer NO resuelve (Wendy L.16.b) · pero notifica al dealer. Flow:

```
Item-level status assigned (e.g. Substituted)
   ↓
Manufacturer reviews en Ack detail page (AI moment muestra detection)
   ↓
Click 'Send Ack' (workflow primary)
   ↓
Pre-drafted email opens con template específico per type:
   - Backorder template: "Items backordered · review proposed ETA"
   - Substitution template: "Alternative proposed · review and approve"
   - Discontinued template: "Items unavailable · cancellation requested"
   - Price Adjusted template: "Price update · review new amount"
   - Confirmed only: "Acknowledgement issued · production starting"
   ↓
Manufacturer reviews + edits email + sends
   ↓
Ack status: 'Pending' (waiting dealer response) o 'Confirmed' (if all OK)
   ↓
Dealer side: receives email + opens portal + decides per item
   (Out of demo scope · happens en dealer view o externamente)
```

**Templates para Quick Message en Ack tab** (extender D.2.b):

| Template (Ack-specific) | Subject | Aplicabilidad |
|---|---|---|
| `Backorder notification` | `{ackId} · items backordered` | Cuando hay items `Backordered` |
| `Substitution proposal` | `{ackId} · alternative proposed for {sku}` | Cuando hay items `Substituted` |
| `Discontinued items notice` | `{ackId} · items unavailable` | Cuando hay items `Discontinued` |
| `Price adjustment notice` | `{ackId} · price update for {sku}` | Cuando hay items `Price Adjusted` |
| `Acknowledgement issued` | `{ackId} · order acknowledged` | Default · all items Confirmed |
| `Custom` | (empty) | Default writable |

**Decisión sobre Quick Message para Ack** (revisar D.2.a):
- D.2.a actual: `Acknowledgements: ❌ NO (manufacturer envía Ack, no responde)`
- **Conflict detectado**: con el flow detection-then-notify, Ack SÍ necesita capacidad de enviar emails (no responder, pero sí proactively notify)
- **Decisión revisada**: Ack tab SÍ tiene Quick Message · pero el mensaje es **outbound notification proactivo** (NO reply a algo recibido)
- Distinción semántica: en RFQ/Quote/PO/Order el dealer envió algo y el manufacturer puede "Reply" · en Ack el manufacturer notifies proactively

**Update a D.2.a**:

| Tab | Quick Message? | Naturaleza |
|---|---|---|
| RFQ | ✅ Sí (Reply al dealer) | Inbound reply |
| Quotes | ✅ Sí (Reply al dealer sobre quote) | Inbound reply |
| Purchase Orders | ✅ Sí (Reply al dealer sobre PO) | Inbound reply |
| **Acknowledgements** | ✅ **Sí (Proactive Notify al dealer)** | **Outbound notification** (cambio) |
| Orders | ✅ Sí (notificar shipping, delays) | Outbound notification |
| Shipping | ✅ Sí (tracking, ETA) | Outbound notification |

##### L.17.i · AI moment refinement para Detection (post-L.7)

L.7 ya estableció que AI DETECTA pero no RESUELVE. L.17 expande el pattern:

**Estado actual** (AckDetail.tsx · línea 562):
> "DiscrepancyResolverAgent compared Acknowledgement against PO #ORD-2055. Match rate: 95%. Found 2 exceptions"

**Refinement post-L.17**:
- Rename del agent: `DiscrepancyResolverAgent` → `DiscrepancyDetectorAgent` (DETECT, no RESOLVE)
- Match rate display: ✅ KEEP (valuable metric)
- Exceptions list: ✅ KEEP, con sub-categorization por type (Backorder · Substitution · Discontinued · Price Adjusted)
- Per exception card: muestra item-level status + propuesta + reasoning · NO action buttons de resolución
- Reemplaza Resolve buttons con: `Notify dealer of this exception` (que abre el EmailDraftModal con template apropiado)

**Visual del AI detection panel** (post-refinement):

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🤖 AI Detection Complete · DiscrepancyDetectorAgent                 │
│ Compared Ack-8841 against PO #ORD-2053 · Match rate: 92%           │
│                                                                       │
│ 2 exceptions detected:                                                │
│                                                                       │
│   ⚠ F-SSC346030C · LB LOUNGE 2 SEAT                                  │
│   Type: Substitution + Backorder (compound)                          │
│   Detection: Original finish 'CF-6036 Ocean Blue' backordered        │
│              Alternative proposed 'CF-6036 Pacific Blue' (same tier) │
│   [Notify dealer of this exception]  [View details]                  │
│                                                                       │
│   ⚠ X-LTD661218L · CBX Triple Door Locker                            │
│   Type: Backorder (qty)                                              │
│   Detection: 2 of 4 units available · 2 backordered · ETA Nov 27     │
│   [Notify dealer of this exception]  [View details]                  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

Cambios vs estado actual:
- ❌ NO buttons "Accept Fix" / "Keep Original" / "Resolve"
- ✅ ADD button "Notify dealer of this exception" (opens EmailDraftModal · template based on type)
- ✅ KEEP "View details" (opens Item Drawer · L.17.j)
- ✅ KEEP match rate metric + detection narrative

##### L.17.j · Item Drawer del Ack · per-item detail with exception info

Extension del L.6 + L.17.d:

**Cuando item has `Confirmed` status**:
- Standard drawer · specs · price · amount

**Cuando item has `Backordered` status**:
- Header chip: 🟠 Backordered
- Expansion: "Qty ordered: 4 · Qty available: 2 · Backordered: 2 units · ETA: Nov 27, 2026"
- Reasoning text: "Inventory check shows 2 units in {warehouse} · 2 additional units expected on production run {ID}"
- Footer action: "Notify dealer" (opens EmailDraftModal with Backorder template)

**Cuando item has `Substituted` status**:
- Header chip: 🔵 Substituted
- Expansion: "Original: {Original SKU + name + spec}" / "Proposed: {Alternative SKU + name + spec}"
- Reasoning text: "{Original SKU} discontinued / backordered · {Alternative SKU} matches functional tier"
- Side-by-side comparison card (original vs proposed)
- Footer action: "Notify dealer of substitution proposal"

**Cuando item has `Discontinued` status**:
- Header chip: 🔴 Discontinued
- Expansion: "Item {SKU} discontinued · No suitable alternative in current catalog"
- Reasoning text: explanation
- Footer action: "Notify dealer of cancellation requirement"

**Cuando item has `Price Adjusted` status**:
- Header chip: 🟡 Price Adjusted
- Expansion: "Original price: $X · Current price: $Y · Adjustment: ±$Z (±N%)"
- Reasoning text: "Catalog price changed since Quote was issued on {date}"
- Footer action: "Notify dealer of price adjustment"

##### L.17.k · Item-level status badge tokens (DS compliance)

Validar contra Strata DS:

| Item-level status | Token recomendado | Razón |
|---|---|---|
| `Confirmed` | `bg-success-soft text-success-foreground` o equivalent | Green semantic |
| `Backordered` | `bg-warning-soft text-warning-foreground` | Amber semantic |
| `Substituted` | `bg-info-soft text-info-foreground` | Blue semantic |
| `Discontinued` | `bg-destructive-soft text-destructive-foreground` | Red semantic |
| `Price Adjusted` | `bg-warning-soft text-warning-foreground` | Amber semantic (similar a Backordered, ambos requieren attention) |

**NO hardcoded colors** (per CLAUDE.md proyecto + governance rules · consultar MCP strata-ds antes de implementar).

##### L.17.l · Files afectados por L.17

**`src/Transactions.tsx`**:
- Líneas 241-245 · seed `recentAcknowledgments`:
  - Add `itemStatuses` field per entry · array de per-item status info
  - Posible: agregar 1 entry nueva o enriquecer existing entries para cubrir 5 statuses

**`src/AckDetail.tsx`**:
- Rename `DiscrepancyResolverAgent` strings → `DiscrepancyDetectorAgent`
- Update detection panel layout (L.17.i)
- Per-line table render: support 5 item-level statuses
- Conditional sub-info (ETA / Substitute / Reason)
- Item Drawer expansion per status type

**`src/components/manufacturer/ItemDetailsDrawer.tsx`**:
- Conditional rendering based on item-level status
- 5 different layouts (one per status type)
- Action button per type ("Notify dealer of {type}")

**`src/components/inbound-outbound/StatusBadge.tsx`** (o equivalent):
- Add 5 item-level status variants
- Token-compliant (consultar MCP strata-ds)

**Email templates · D.2 update**:
- Add 5 Ack-specific templates
- Update Quick Message: Ack tab SÍ tiene (cambio respecto D.2.a)

##### L.17.m · TBDs introducidos por L.17

| # | TBD | Recomendación |
|---|---|---|
| 1 | ¿Agregar Ack-8842 nueva entry para Substituted o enriquecer Ack-8841 con compound case? | **Enriquecer Ack-8841** (compound case · más realista · menos seed bloat) |
| 2 | ¿Incluir status `Discontinued` en V1 o posponer V2? | **Posponer V2** (no es common case · 4 statuses suficientes para demo Sunday) |
| 3 | Per-item ETA display · ¿absolute date solo o + relative ("in 18 days")? | **Both** (absolute date primary · relative en sub-line · matches pattern de Shipping tab) |
| 4 | Substitution acceptance · ¿el dealer accept flow está en demo o solo el "proposed" state? | **Solo proposed state** (demo es manufacturer view · dealer accept es flow externo) |

##### L.17.n · Verification post-L.17

```bash
# 1. Item-level statuses presentes en código
grep -rn "'Backordered'\|'Substituted'\|'Discontinued'\|'Price Adjusted'" inbound-outbound/src/
# Esperados en seed + StatusBadge component

# 2. DiscrepancyDetectorAgent (no Resolver)
grep -rn "DiscrepancyResolverAgent" inbound-outbound/src/
# 0 hits esperado (renamed to Detector)

grep -rn "DiscrepancyDetectorAgent" inbound-outbound/src/
# Hits esperados

# 3. Notify dealer buttons (no Resolve)
grep -rn "Notify dealer" inbound-outbound/src/AckDetail.tsx
# Hits esperados

# 4. DS tokens (no hardcoded colors)
grep -rn "bg-orange-\|bg-amber-\|bg-blue-\|bg-red-" inbound-outbound/src/AckDetail.tsx
# 0 hits esperado · todo via tokens
```

---

#### L.16 · Consolidación · Wendy on Discrepancies + Invoice + decisiones de refinement (user request 2026-06-05)

##### L.16.a · Contexto

User pidió revisar específicamente:
1. Qué dijo Wendy sobre discrepancies en Ack
2. Cosas que no deberían estar
3. Decisiones para refinar el plan
4. Lo que se menciona de invoice

Screenshot 10 (user 2026-06-05) muestra Ack list view "Active 2" con 2 entries visibles · referencia visual concreta para mapear las decisiones.

##### L.16.b · Wendy on Discrepancies · citation textual

**Quote principal de Wendy sobre discrepancies en Ack** (capturada en el plan original sección L · framing de PDF #18 + clarificación verbal):

> "The manufacturer **just sends** the acknowledgement. **Discrepancies are resolved by the dealer** before the order is entered."

**Decodificación**:
- Verb "just sends" → acción **única y simple** del manufacturer en Ack stage
- "Discrepancies are resolved by the dealer" → resolución es **del dealer**, no del manufacturer
- "before the order is entered" → timing: la resolution pasa **ANTES** de que el order llegue al manufacturer
- Implicación: cuando el manufacturer crea un Ack, las discrepancies ya están (porque las detectó), pero la resolución no es suya

**Distinción operacional crítica** (que extraemos del quote):

| Actor | Rol respecto a discrepancies |
|---|---|
| Dealer | RESUELVE (decide accept fix, keep original, escalate, etc.) |
| Manufacturer | DETECTA + DOCUMENTA + NOTIFICA al dealer (passive observer) |

##### L.16.c · Wendy on Invoice · citation + análisis

**Source primary**: PDF "Feedback from teams NEOCON.pdf" items #7 + #18.

**PDF #7** (Three-Way Match):
- Column header "Source of Truth" → cambiar a "Purchase Order"
- Implícitamente: ya no es "Three-Way" (3 partes) sino "Two-Way" (2 partes · PO + Ack)

**PDF #18** (Acknowledgement manufacturer view):
- Remove Invoice column del three-way match modal
- Razón implícita: manufacturer no emite invoice en este view stage

**Análisis · por qué Invoice NO va en Ack manufacturer view**:

| Stage del lifecycle | ¿Existe invoice? | ¿Manufacturer la emitió? |
|---|---|---|
| PO Received | ❌ NO | N/A |
| Ack Sent | ❌ NO aún | N/A |
| In Production | ❌ NO aún | N/A |
| Shipped | ❌ NO aún (normally) | N/A |
| **Invoiced** (status nuevo · Orders tab) | ✅ SÍ | ✅ SÍ (manufacturer la genera al cobrar) |
| Delivered | ✅ Ya emitida | N/A |

**Conclusión**: Invoice es un **artifact post-shipping** que vive en el lifecycle Orders tab (HermanMiller Hybrid C: Invoiced es status). NO aparece en Ack stage porque temporalmente aún no existe.

**Validation cross-source · HermanMiller portal confirma esto**:
- Orders dropdown HermanMiller (screenshot 7): `Acknowledged / Shipped / Invoiced / Cancelled / CancelledWithFee`
- `Invoiced` es status post-`Shipped`
- En Ack view de HermanMiller no aparece info de Invoice (sería temporally incorrect)

##### L.16.d · Cosas que NO deberían estar en Ack (consolidación per user request)

Mapping al screenshot 10 + decisions documentadas en L.0-L.15:

| Pieza visible en screenshot 10 | NO debe estar | Razón / Citation |
|---|---|---|
| Column `VENDOR` con value "Acme Manufacturing" | ⚠️ Wrong-named en manufacturer view | El user ES el manufacturer · column debe mostrar DEALER, no vendor (manufacturer es vendor solo desde dealer's POV) |
| Column `DISCREPANCY` dedicated con texto rojo | ❌ NO | Wendy: discrepancy es info detectada, no column dedicated · debe ser sub-flag chip sobre status |
| Chip `Discrepancy` (red) en STATUS column | ❌ NO | Wendy: no es un status (L.1) · es FIELD de detección · queda como sub-flag |
| Column `SOURCE` per-row con value `OCR` / `DEALER PORTAL` | ❌ NO | Wendy: Ack es outbound, manufacturer es sender, no receiver · column completa REMOVE (L.4) |
| Value `OCR` específicamente | ❌ NO | Christian: OCR no es source (sección B) |
| Column `SHIPMENT #` con value `SHP-7438250` / `SHP-7440188` | ❌ NO | Wendy: shipment number no disponible cuando se envía Ack (L.4 · L.12) |
| Chip `REV #1` | ❌ NO | Wendy 34:36: usar palabra completa `Revision # 1` (E.0000) |
| (En 3-way match modal accedido desde Ack) Column `Invoice` | ❌ NO | PDF #18 + L.16.c · manufacturer no emite invoice en este stage |
| (En 3-way match modal) Column `Source of Truth` header | ❌ NO | PDF #7 · rename a `Purchase Order` |
| (En 3-way match modal) Title `3-Way Match · Reconciliation Hub` | ❌ NO | PDF #7 + L.8 · es 2-way en realidad · rename a `PO vs Acknowledgement · Reconciliation` |
| (En Ack detail) Buttons `Resolve` / `Accept Fix` / `Keep Original` | ❌ NO | Wendy L.16.b · manufacturer NO resuelve · removed (L.7 · L.10) |
| (En timeline) Step `Resolved` | ❌ NO | Wendy: manufacturer no resuelve (L.9) |

##### L.16.e · Decisiones para refinar el plan · consolidación

**12 decisiones aplicadas** (mapped a screenshot 10):

| # | Decisión | Plan section | Aplicación visual |
|---|---|---|---|
| 1 | Status `Discrepancy` → REMOVE de ackStages | L.1 | Chip `Discrepancy` desaparece del STATUS column |
| 2 | Discrepancy info → KEEP como sub-flag chip sobre status primary | L.2 | "Price Mismatch ($500)" se vuelve sub-chip de `Pending` |
| 3 | Column `DISCREPANCY` dedicated → REMOVE | L.4 (extendido en L.16.d) | Column desaparece · info absorbida en sub-flag |
| 4 | Column `SOURCE` per-row → REMOVE | L.4 | Column completa desaparece |
| 5 | Column `SHIPMENT #` → REMOVE display | L.4 | Column desaparece (field stays en data) |
| 6 | Column `VENDOR` → RENAME a `DEALER` o `CUSTOMER` | L.16.d (nuevo) | Manufacturer view contextually correct |
| 7 | Chip `REV #1` → RENAME `Revision # 1` | E.0000 (cross-section) | Wording fix |
| 8 | Modal 3-way match title → `PO vs Acknowledgement · Reconciliation` | L.8 | Rename completo |
| 9 | Column `Source of Truth` (en modal) → `Purchase Order` | L.8 | Rename header column |
| 10 | Column `Invoice` (en modal) → REMOVE | L.8 + L.16.c | Column completa desaparece |
| 11 | Buttons `Resolve` / `Accept Fix` / `Keep Original` en manufacturer view → REMOVE | L.7 · L.8 · L.10 | Action buttons desaparecen |
| 12 | Timeline step `Resolved` → REMOVE | L.9 | Step desaparece · 3 steps restantes |

##### L.16.f · NEW finding · column `VENDOR` wrong-named en manufacturer view

**Detectado en screenshot 10**:
- Column header dice `VENDOR`
- Value muestra "Acme Manufacturing" (que es el manufacturer fictional del demo)

**Análisis semántico**:
- En **dealer view**: el manufacturer ES el vendor (el dealer compra a un vendor) → `VENDOR` column es correcta
- En **manufacturer view** (current view, Sara Chen): el manufacturer ES nosotros · `Vendor: Acme Manufacturing` se vuelve redundante (siempre será nosotros mismos) · debería mostrar el DEALER al que se le envía el Ack

**Decisión propuesta**:

| ViewAs | Column label | Column value |
|---|---|---|
| Manufacturer | `DEALER` o `CUSTOMER` | NorthPoint / Beacon Hill / Pacific (dealer name from seed) |
| Dealer | `VENDOR` o `MANUFACTURER` | Acme Manufacturing (vendor name from seed) |

**Implementación**: usar pattern `useViewAs()` ya existente para switchear column header + value según rol.

**Cross-section consistency**: validar también para otros tabs:
- Quote tab: similar issue posible
- PO tab: similar issue posible
- Order tab: similar issue posible

**Audit grep necesario**:
```bash
grep -rn "Vendor\|VENDOR\|vendor:" inbound-outbound/src/Transactions.tsx
grep -rn "{vendor}" inbound-outbound/src/  # JSX usage
```

##### L.16.g · Visual antes/después del Ack list view (screenshot 10 → target)

**ANTES (screenshot 10 actual)**:
```
VENDOR              | PO & LOCATION       | DISCREPANCY        | STATUS       | SOURCE       | SHIPMENT #      | DATE       | ACTIONS
Acme Manufacturing  | #ORD-2049 London    | Price Mismatch ($500) | Discrepancy | OCR        | SHP-7438250    | Jan 13     | 👁 📍 ▼
Ack-8840 BH         | Coastal Hospitality |                    | (red chip)   |             |                 |            |
DP Rep David Park   |                     |                    |              |             |                 |            |
REV #1              |                     |                    |              |             |                 |            |
```

**DESPUÉS (post-refinement)**:
```
DEALER              | PO & LOCATION       | STATUS                              | PLANNED DELIVERY | DATE       | ACTIONS
Beacon Hill Furnish | #ORD-2049 London    | Pending · ⚠ price mismatch detected | Mar 10, 2026     | Jan 13     | 👁 📍 ▼
Ack-8840 BH         | Coastal Hospitality | (amber + warning sub-flag)          |                  |            |
DP Rep David Park   |                     |                                     |                  |            |
Revision # 1        |                     |                                     |                  |            |
```

Cambios visuales:
- VENDOR → DEALER (column rename · L.16.f)
- "Acme Manufacturing" → "Beacon Hill Furnishings" (value reflects dealer in manufacturer view)
- DISCREPANCY column → REMOVED (info absorbed en sub-flag de STATUS)
- STATUS `Discrepancy` red → `Pending · ⚠ price mismatch detected` (status + sub-flag)
- SOURCE column → REMOVED
- SHIPMENT # column → REMOVED
- PLANNED DELIVERY column → ADDED (rename de Exp Ship Date · F.11.h)
- REV #1 → Revision # 1

Resultado: tabla más limpia (6 columns vs 8), info crítica preservada, alignment con Wendy's principles.

##### L.16.h · Files afectados · update consolidado

**`src/Transactions.tsx`**:
- Línea 263 · `ackStages` → `['Pending', 'Partial', 'Confirmed']`
- Líneas 241-245 · `recentAcknowledgments` seed:
  - Source cleanup (RPA/OCR → Email)
  - Ack-8840 status `Discrepancy` → `Pending` + new field `subFlag: 'price mismatch detected'`
  - Ack-8841 status `Partial` + new field `subFlag: 'backorder detected'`
- Column headers Ack list view:
  - `VENDOR` → `DEALER` (en manufacturer view via useViewAs)
  - `DISCREPANCY` column → REMOVE
  - `SOURCE` column → REMOVE
  - `SHIPMENT #` column → REMOVE
  - `EXP. SHIP DATE` → `PLANNED DELIVERY`
- Status chip rendering · soportar sub-flag display

**`src/AckDetail.tsx`**:
- Cleanup completo per L.7 · L.8 · L.9 · L.10
- Rename component `DiscrepancyResolutionFlow` → `DiscrepancyDetectionPanel`
- Timeline: REMOVE step `Resolved`
- Action buttons: REMOVE `Resolve` / `Accept Fix` / `Keep Original`
- ADD button `Notify dealer of differences` o equivalent

**`src/components/AckReconciliationModal.tsx`** (o donde esté el 3-way match):
- Title rename
- Column `Source of Truth` → `Purchase Order`
- Column `Invoice` → REMOVE
- Action buttons cleanup en manufacturer view

**Cross-section**:
- `useViewAs` pattern validation para column labels en otros tabs (Quote, PO, Order)
- `REV #` rename audit cross-section

##### L.16.i · Verification post-refinement

```bash
# Wendy's principle enforcement · manufacturer no resuelve
grep -rn "Accept Fix\|Keep Original\|onClick.*[Rr]esolve" inbound-outbound/src/AckDetail.tsx
# 0 hits esperado (excepto detection-related)

# Invoice column out
grep -rn "Invoice" inbound-outbound/src/components/AckReconciliationModal.tsx  # 0 hits
grep -rn "Invoice" inbound-outbound/src/AckDetail.tsx  # 0 hits

# 3-way → PO vs Ack rename
grep -rn "Source of Truth\|3-Way Match" inbound-outbound/src/  # 0 hits

# Discrepancy as status
grep -n "'Discrepancy'" inbound-outbound/src/Transactions.tsx  # 0 hits

# Vendor column en manufacturer view
grep -rn "VENDOR\|Vendor.*column" inbound-outbound/src/Transactions.tsx
# audit results · validar que se usa useViewAs para switchear
```

---

#### L.15 · Verification post-cleanup

```bash
# 1. No more 'Discrepancy' as status
grep -n "'Discrepancy'" inbound-outbound/src/Transactions.tsx  # 0 hits esperado
grep -n "Discrepancy" inbound-outbound/src/AckDetail.tsx | grep -v "DetectionPanel\|detected"  # solo refs detection-only

# 2. No 'Source of Truth' string anywhere
grep -rn "Source of Truth" inbound-outbound/src/  # 0 hits esperado

# 3. No 'Resolved' timeline step
grep -n "'Resolved'" inbound-outbound/src/AckDetail.tsx  # 0 hits esperado

# 4. No 'Exp. Ship' wording
grep -rn "Exp. Ship\|Expected Ship" inbound-outbound/src/  # 0 hits esperado (all renamed)
grep -rn "expShipDate" inbound-outbound/src/  # field name OK · UI label changed

# 5. REV # cross-section
grep -rn "REV #\|Rev #" inbound-outbound/src/  # 0 hits esperado (all Revision # N)

# 6. Sources cleanup
grep -rn "'OCR'\|'RPA'" inbound-outbound/src/  # 0 hits esperado
```

---

### M. Pricing terminology consolidation (Wendy decision con TBD)

- **Quote**: `List Price` preferred (Wendy) o `Unit Price` fallback. **TBD: confirmar Wendy va a circle back con Mark**.
- **Acknowledgement** y posteriores: `Unit Price` (Wendy clara: "becomes unit price")
- **Order/PO**: `Unit Price`
- Consistente en columnas de tabla, drawer, PDF preview, exports

### N. Dashboard alignment (Wendy verificó OK + refinement user 2026-06-05)

Wendy revisó el dashboard al final y dijo que está OK. Solo necesita que las quote pipeline stages matcheen las nuevas statuses (In Progress / Pending / Sent / Expired) y no usen "Draft" o "Negotiating".

#### N.1 · Dashboard Quote pipeline refinement (user screenshot 2026-06-05)

##### N.1.a · Estado actual (screenshot)

Dashboard card `Quote pipeline · Open quotes by stage` muestra 4 horizontal bars:

| Bar | Length visual | Status hoy |
|---|---|---|
| `Draft` | Medium | Tiene quotes |
| `Sent` | Longest | Tiene más quotes |
| `Negotiating` | Very short | 1 quote (QT-1025) |
| `Approved` | Medium-long | Tiene quotes (QT-1022) |

Adicional · `DSO` card visible (38d · ON TARGET · ≤40d target · Prior 41d · -3d trend) · **no requiere cambios** (informational metric).

##### N.1.b · Bar-by-bar audit · alignment con E.1.i

| Bar actual | Decisión | Citation Wendy |
|---|---|---|
| `Draft` | ❌ RENAME a `In Progress` | Magda 33:44 + Wendy 33:51 "I like that better" |
| `Sent` | ✅ KEEP | Wendy 33:40 "tent is where that flow ends" |
| `Negotiating` | ❌ **REMOVE** | Wendy 31:39 "you don't negotiate a quote" |
| `Approved` | ❌ **REMOVE** | Wendy 33:22 "becomes a PO at that point" |
| `In Progress` (NEW) | ✅ ADD | Replaces Draft per Magda/Wendy refinement |
| `Pending` (NEW) | ✅ ADD | Wendy 32:11 (status) + 36:18 (textile review sub-flag) |
| `Expired` (NEW) | ✅ ADD | Wendy 34:24 explicit add |

##### N.1.c · Target final (Quote pipeline post-refinement)

```
Quote pipeline · Open quotes by stage:
  In Progress    [length per count]
  Pending        [length per count · with textile review sub-flag info]
  Sent           [length per count]
  Expired        [length per count]
```

4 bars (was 4) · totally different labels.

##### N.1.d · Seed counts post-E.1.j cleanup

Estado del seed después de aplicar E.1.j (con QT-1022 movido a recentOrders):

| Status | Quote ID | Counts | Notas |
|---|---|---|---|
| `In Progress` | QT-1024 Pacific | 1 | Renamed from Draft |
| `Pending` | QT-1025 NorthPoint | 1 | + sub-flag `textile review` |
| `Sent` | QT-1023 Summit | 1 | KEEP |
| `Expired` | (ninguno) | 0 | Bar vacía · no demo data |

**Problema visual**: bar `Expired` vacía + total seed sparse (3 quotes) · no demuestra el pipeline rich.

##### N.1.e · Seed enrichment propuesto · 2 entries nuevas opcionales

Para que el pipeline tenga visual richness en el demo:

| Nuevo ID | Customer | Status | Sub-flag | Razón demo |
|---|---|---|---|---|
| `QT-1026` (NEW · recomendado) | (nuevo dealer) | `Expired` | — | Demuestra Expired (validUntil < today) |
| `QT-1027` (NEW · opcional) | (nuevo dealer) | `In Progress` | — | Bulk up bar In Progress |
| `QT-1028` (NEW · opcional) | (nuevo dealer) | `Pending` | `textile review` | Bulk up bar Pending |

**Recomendación mínima**: agregar solo `QT-1026 Expired` (1 entry · demuestra el status nuevo sin sobrecargar seed). Bars sparse pero los 4 statuses representados.

**Recomendación rich** (si se quiere demo más impactante): agregar 3 entries (QT-1026/1027/1028) para que cada bar tenga visual presence balanced.

##### N.1.f · Sub-filter consideration · `Pending · textile review` en el bar

Wendy 36:18 endosó el sub-flag textile review como combinable con `Pending`. En el pipeline bar visual:

**Opción A · Bar consolidado** (`Pending` count incluye todas las variantes con/sin sub-flag):
- Pending bar = 1 (QT-1025 with textile review counts as Pending)
- Sub-info en tooltip: "1 with textile review pending"

**Opción B · Bar split** (separar `Pending` vs `Pending · textile review`):
- Pending bar = 0
- Pending · textile review bar = 1
- 5 bars en total · más granular pero más complex

**Recomendación · Opción A** (consolidado): cleaner visual · alineado con sub-flag being a chip modifier, not a separate status.

##### N.1.g · Otros elementos del Dashboard · validation pendiente

Screenshot solo muestra DSO + Quote pipeline. Otros widgets posibles del Dashboard que NO están en el screenshot pero pueden necesitar audit:

| Widget posible | Razón a auditar |
|---|---|
| Order lifecycle pipeline (similar al Quote pipeline) | Debe matchear los 5 statuses Hybrid C (Acknowledged/Shipped/Invoiced/Cancelled/CancelledWithFee · F.11) |
| RFQ status counter | Debe matchear los 4 nuevos statuses (New/In Review/Additional Info Required/Sent · D.1) |
| Ack status counter | Debe matchear los 3 nuevos statuses (Pending/Partial/Confirmed · L.1) · sub-flags incluidos en Pending |
| `Valid Until` references | Rename a `Expiration Date` (E.1.f.0 · Dashboard.tsx línea 111 ya identificado) |
| `Net Price` / `Price` references | Rename a `Unit Price` (L.21) |
| `Source` filters/displays | Sources cleanup (B · remove OCR/RPA · keep Email/Dealer Portal/NetSuite/Manual edge-case) |
| Métricas globales tipo "Total Quotes Sent" | Validar terminology + alignment con nuevos statuses |

**Action**: audit completo del Dashboard.tsx para identificar todas las referencias que cambian con esta release. Aplicar cleanup cross-cutting.

##### N.1.h · Files afectados por N.1

- **`src/Dashboard.tsx`**:
  - Quote pipeline component · bar labels (4 cambios)
  - Línea 111 ya identificada: `'Valid Until'` → `'Expiration Date'` (E.1.f.0)
  - Cross-section: audit `Net Price`/`Price` → `Unit Price` (L.21)
  - Cross-section: audit Order/RFQ/Ack pipeline widgets si existen
- **`src/Transactions.tsx`**:
  - Seed `recentQuotes` · agregar 1-3 entries nuevas opcionales (N.1.e)

##### N.1.i · Verification post-N.1

```bash
# 1. Dashboard quote pipeline bars
grep -rn "Draft\|Negotiating\|Approved" inbound-outbound/src/Dashboard.tsx
# 0 hits esperado (en context de Quote pipeline)

grep -rn "In Progress\|Pending\|Expired" inbound-outbound/src/Dashboard.tsx
# Hits esperados (Quote pipeline new labels)

# 2. Valid Until rename
grep -n "Valid Until" inbound-outbound/src/Dashboard.tsx  # 0 hits (E.1.f.0)
grep -n "Expiration Date" inbound-outbound/src/Dashboard.tsx  # Hits esperados

# 3. Unit Price consistency
grep -rn "Net Price\|Price " inbound-outbound/src/Dashboard.tsx
# Solo Unit Price o no price refs esperado

# 4. Sources cleanup
grep -rn "OCR\|RPA" inbound-outbound/src/Dashboard.tsx
# 0 hits esperado
```

##### N.1.j · TBDs introducidos por N.1

| TBD | Recomendación |
|---|---|
| ¿Agregar 1, 2 o 3 entries nuevas al seed `recentQuotes`? | **Solo 1 (QT-1026 Expired)** · mínimo viable para demo |
| Pending bar · ¿consolidado vs split textile review? | **Opción A consolidado** (cleaner) |
| ¿Auditar Order/RFQ/Ack pipelines del Dashboard? | **SÍ** · audit + cleanup completo en Fase 2 o 5 |
| Dashboard.tsx audit completo de referencias cross-section | **SÍ** · grep + fix todos los matches en una pasada |

---

## Already done desde sesiones previas (validar que sobrevive)

| Commit | Track | Sobrevive? | Notas |
|---|---|---|---|
| `3261a66` | ORD-2056 delayed PO scenario | ✅ SÍ | PDF #1 explícitamente lo pedía. Delay flag se mantiene como flag operacional. |
| `3f2b98e` | Real Leland PDFs en preview | ✅ SÍ | El Quote PDF preview hay que limpiar (tax lines, disc%) — el archivo bundleado sigue OK. |
| `b9d17b6` | Back buttons en modals | ✅ SÍ | Patrón onBack que se quedará útil. |
| `50c0ccf` | Delayed chip en Transactions list | ✅ SÍ | Funcional. |
| `0cd44e8` | Proforma de Quote → Ack | ✅ SÍ | Asly explicit ask. |
| `0398da8` | Rev #N chip abre history | ✅ SÍ | Asly ask. |
| `4d505cf` | Shipping confirmation CTA | ⚠️ AJUSTAR | Shipping ahora se va a integrar como tab de Transactions; el panel explicativo + CTA per-row se mueve al tab. La página standalone se deprecia. |
| `c6700e5` | RFQ pipeline + pending counter | ⚠️ **REHACER** | Statuses cambiaron por completo. `rfqStages = ['Pending Review', 'In Review', 'Quote Sent']` → debe ser `['New', 'In Review', 'Additional Information Required', 'Sent']`. Sub-counter "pending" ahora cuenta `status === 'New'`. |

## TBDs · estado

### ✅ Cerrados (decisiones del user 2026-06-05)

1. **Quote pricing label** → **`List Price` para Quote** (Wendy last word); **`Unit Price` para Ack y posteriores**. Aplicar consistente en columnas, drawer, PDF preview, exports.
2. **RFQ Items fixtures** → pendiente input externo de Asly/Kenya (no bloquea, podemos usar placeholders de momento). **Pending external**.
3. **Invoicing tab** → **stretch goal**: si quedan horas después de Fases 1-5, agregar Invoicing tab con statuses básicos. NO bloquea Sunday demo si no se logra.
4. **Reply action en RFQ** → **EmailDraftModal genérico**. Pre-llenamos To/Subject con contexto del RFQ row + body base que el user edita.
5. **Matt's volume ingestion** → **A + D + E**: Inbox Monitor widget + Auto-spawn cada 60-90s + Manual upload edge-case per-tab en RFQ y PO.
6. (Resuelto en sección Matt's ask · transcript review) Manual upload solo en RFQ + PO tabs, per-tab, modal 4-step.

### ✅ Cerrados (segundo round · decisiones del user 2026-06-05)

7. **Quote Converter type selection** → **NO agregar step de selección al inicio** (al estar en tab específico no es necesario). **SÍ señalar en los pasos posteriores** lo que se está creando (e.g. "Uploading PO files…" / "PO uploaded successfully"). Aplica también al nuevo botón en RFQ/PO tabs — header del modal indica claramente qué tipo se está subiendo.
8. **Sub-label diferenciado por rol** → **SÍ**: manufacturer view muestra `for documents not received via Inbox`, dealer view muestra `send to manufacturer`. Mismo modal, contexto distinto.

### Source distribution approach (simplificado por user)

- NO armar script complejo de reasignación 60/25/15.
- Simplemente: reemplazar OCR por Email (default) y mezclar algunos con Dealer Portal o NetSuite para que no sea todo uno.
- Mantener 1-2 ejemplos de Manual en RFQ y PO seeds para demostrar el edge-case upload.
- Manual NO va en Quotes ni Acks (esos no tienen upload affordance).

### Pendientes de cerrar

Ya están todos cerrados. Solo queda input externo:
- **#2 (RFQ Items fixtures)** → Asly + Kenya van a mandar emails reales · no bloquea Fase 0-1, podemos usar placeholders con texto realista mientras tanto.

## Diagnóstico actual vs target

| Área | Estado actual | Target Wendy | Magnitud cambio |
|---|---|---|---|
| Transactions tabs | 5 tabs (RFQ/Quotes/PO/Ack/Projects) | 6 tabs (RFQ/Quotes/PO/Ack/Orders/Shipping) | **Alta** (nuevo tab Orders + mover Shipping) |
| Sources | 6 sources (Email/Dealer Portal/OCR/API/RPA/Manual) | 3 sources (Email/Dealer Portal/NetSuite) | **Alta** (cross-cutting cambio de seeds) |
| RFQ statuses | `Pending Review / In Review / Quote Sent` | `New / In Review / Additional Information Required / Sent` | **Alta** (rehacer Track D previo) |
| Quote statuses | `Draft / Sent / Negotiating / Approved / Lost` | `In Progress / Pending / Sent / Expired` | **Alta** |
| PO statuses | `PO Received / PO Reviewed / In production / Ready / Shipped / Delivered` | `PO Received / More Info Required / Deposit Required` | **Alta** (mover In production y posteriores a Orders) |
| Ack statuses | `Pending / Discrepancy / Partial / Confirmed` | `Pending / Confirmed / Partial` (sin Discrepancy en tab) | Media |
| RFQ Items page | columnas con precios | sin precios, basic info only | Media |
| Quote per-line | Net Price + Discount + Amount | List Price (+ Extended) | Media |
| Item Details Drawer | 3 boxes precios + Validation panel | sin esos elementos | Baja |
| Quote PDF | con Tax lines | sin Tax lines | Baja |
| PO PDF | con Disc% column | sin Disc% column | Baja |
| Email draft | "Approve here and we will convert..." | sin esa línea | Trivial |
| 3-Way Match | "Source of Truth" + Invoice column + manufacturer resolve actions | "Purchase Order" + sin Invoice + sin manufacturer resolve | Media |
| Shipping page | standalone route | tab dentro de Transactions | Media |

## Proceso de revisión por fase · anti-alucinación checkpoint

**Por qué este proceso** (request user 2026-06-05): el plan ya tiene 20+ decisiones acumuladas, 8 TBDs cerrados, 18 items del PDF, ~1h de transcript citado, 4 stakeholders con jerarquía distinta y 5 screenshots de referencia. Sin checkpoints formales el riesgo de:
- Implementar algo que NADIE pidió (alucinación generativa)
- Olvidar un item del PDF entre tantos cambios
- Citar mal a Wendy/Christian
- Cascade error: una decisión equivocada en Fase 1 contamina Fases 2-5

…es alto. Este proceso baja ese riesgo.

### Estructura de cada checkpoint

```
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE N · STATUS: pending → in-progress → under-review → approved  │
└─────────────────────────────────────────────────────────────────────┘

PRE-FLIGHT (antes de empezar la fase)
─────────────────────────────────────
1. Plan reference: cita la sub-sección del SOT que justifica esta fase
2. Archivos a tocar: lista exhaustiva
3. Cambios planeados: bullets concretos por archivo
4. SOT references: para cada cambio, link al transcript / PDF / clarificación
5. User confirma o pide refinement → si confirma, paso a in-progress

EXECUTION (durante la fase)
─────────────────────
- Commits granulares: 1 commit por sub-tarea (no batchear)
- Cada commit message cita explícitamente el SOT (e.g. "per Wendy 36:18", "PDF #7", "Christian 24:13")
- Si encuentro algo no planeado, PARO y pregunto antes de proceder

POST-FLIGHT (después de la fase, antes de pasar a la siguiente)
─────────────────────────────────────────────────────────────
1. Diff summary: archivos tocados + líneas añadidas/eliminadas
2. TS check: `npx tsc --noEmit` → 0 errors
3. Vite serve check: todos los archivos transformados sin error
4. DS sanity: 0 hits de bg-green/red/orange/brand-300/400
5. Cross-reference table:
   | Cambio implementado | SOT citation | ✓ |
   | ... | ... | ✓ |
6. Anti-hallucination checklist (ver abajo)
7. Browser smoke test: walkthrough end-to-end de la pieza tocada
8. User reviewa + aprueba (o pide ajuste)
9. Si aprueba: status pasa a "approved"; arrancamos pre-flight de la próxima fase
```

### Anti-hallucination checklist (correr en cada POST-FLIGHT)

Por cada cambio implementado en la fase, verificar las 5 reglas:

- [ ] **Regla 1 · Trazabilidad**: ¿cada cambio tiene una cita textual del transcript, un item del PDF, o un screenshot referenciado en el plan? Si la respuesta es "porque me pareció lógico" → ALUCINACIÓN, revertir.
- [ ] **Regla 2 · Sin invención**: ¿algún archivo tiene código que NADIE pidió? (e.g. una animación que sumé yo "para mejorar UX"). Si sí → revertir.
- [ ] **Regla 3 · Sin remoción no autorizada**: ¿algún archivo perdió código que NO se pidió eliminar? Especialmente importante con grep cleanups (e.g. remover OCR puede tocar más de lo intencionado).
- [ ] **Regla 4 · Jerarquía de autoridad respetada**: ¿alguna decisión va contra lo que Wendy dijo? (Wendy > PDF > otros).
- [ ] **Regla 5 · Sin cascade error**: ¿algún cambio de esta fase rompió algo de una fase previa? Especialmente revisar regression tests.

### Tracking de fases · status board

| Fase | Status | Pre-flight aprobado | Post-flight aprobado | Commits |
|---|---|---|---|---|
| 0 · Matt's ingestion + manual upload | ⏳ pending | — | — | — |
| 1 · Foundation (tabs + sources + statuses) | ⏳ pending | — | — | — |
| 2 · RFQ + Quote views cleanup | ⏳ pending | — | — | — |
| 3 · Documents cleanup (PDF + emails) | ⏳ pending | — | — | — |
| 4 · Ack + Reconciliation cleanup | ⏳ pending | — | — | — |
| 5 · Verification + polish | ⏳ pending | — | — | — |

Estados:
- `⏳ pending` — no empezada
- `🟡 pre-flight under review` — esperando user confirme antes de empezar
- `🔵 in-progress` — implementando
- `🟠 post-flight under review` — esperando user verifique antes de pasar a la próxima
- `✅ approved` — done, commits pushed, próxima fase puede empezar

### Reglas de pausa obligatoria

Tengo que parar y preguntar al user (no avanzar autónomamente) en estos casos:
1. **Descubro un item del SOT que el plan no contempla** → preguntar si lo agrego al plan antes de implementar
2. **Encuentro un conflict entre dos clarificaciones de stakeholders** → preguntar cómo resolver (default: Wendy gana)
3. **El TS check falla con un error que no sé cómo fix** → preguntar antes de ad-libbear
4. **Una sub-tarea toma >2x el tiempo estimado** → preguntar si seguimos o pivotamos
5. **El user pide algo en otro mensaje que contradice el plan aprobado** → re-validar el plan antes de implementar

### Cuándo NO hace falta checkpoint formal

Para no over-engineerar:
- Cambios triviales (typos, comentarios) → commit directo sin checkpoint
- Smoke tests → no necesitan checkpoint, son parte del post-flight
- Si el user explícitamente dice "skip checkpoint" para una fase → respetar

### Configuración confirmada por user (2026-06-05)

- **Formato PRE-FLIGHT**: detallado con cross-reference table. Cada sub-tarea muestra:
  - Sub-tarea + descripción de cambio
  - Archivos afectados
  - SOT citation textual (transcript ref / PDF item / clarificación)
  - Líneas estimadas de cambio
  - Riesgo (low / medium / high)
- **Edge cases (Regla #1 de pausa)**: **PARAR siempre y preguntar**. No decisiones autónomas conservadoras, prefiere fricción a alucinación.

---

## F. Purchase Orders · audit exhaustivo del transcript (40:25-54:00)

**Wendy distribuyó el contenido del antiguo "lifecycle" entre 2 tabs nuevos** (PO tab simplificado + Orders tab nuevo). Aquí el detalle completo.

#### F.00 · Audit visual del PO tab actual + transformación completa del seed (basado en screenshot user 2026-06-05)

##### F.00.a · Status dropdown actual vs target

**Hoy (screenshot)**: dropdown muestra:
- ✓ All Statuses
- Shipped
- PO received
- In production
- Ready to s... (Ready to Ship)
- Delivered
- PO Reviewed

**Target post-cleanup**:
- ✓ All Statuses
- **PO Received** (KEEP)
- **More Information Required** (NEW · sync Quote/RFQ)
- **Pending Deposit** (NEW · conditional · solo si manufacturer policy)

**Removidos del dropdown**:
- ❌ `Shipped` → MOVE a Orders tab
- ❌ `In production` → MOVE a Orders tab
- ❌ `Ready to Ship` → MOVE a Orders tab
- ❌ `Delivered` → MOVE a Orders tab
- ❌ `PO Reviewed` → REMOVE entirely (Wendy 42:23: "I don't see our need")

##### F.00.b · Transformación del seed `recentOrders` (9 entries actuales)

| ID | Customer | Status hoy | Destino post-restructure | Notas |
|---|---|---|---|---|
| ORD-2056 | NorthPoint Tech HQ Phase 2 | Shipped + Delayed +8d | **Orders tab** | Mantener status `Shipped` + flag `Delayed +8d` |
| ORD-2055 | NorthPoint Tech HQ Buildout | PO Received | **PO tab** ✅ | OK · stay |
| ORD-2054 | Cascade Workplace HQ Upgrade | In Production | **Orders tab** | Move |
| ORD-2053 | Pacific Workspaces Lobby Refresh | Ready to Ship | **Orders tab** | Move |
| ORD-2052 | Global Furniture Warehouse | Delivered | **Orders tab** | Move (status `Delivered` final) |
| ORD-2051 | Summit Office Solutions Tower B | PO Received | **PO tab** ✅ | OK · stay |
| ORD-2050 | Heritage Office Modern Residences | PO Reviewed | **PO tab** ⚠️ | Re-asignar status (PO Reviewed quitado) · cambiar a `PO Received` o `More Information Required` |
| ORD-2049 | Beacon Hill Beach Hotel | In Production | **Orders tab** | Move |
| ORD-2048 | Midwest Mountain Retreat | Ready to Ship | **Orders tab** | Move |
| ORD-2047 | Apex Sky Vista Tower 3 | Shipped | **Orders tab** | Move |

##### F.00.c · Distribución post-restructure

- **PO tab**: 3 rows (ORD-2055, ORD-2051, ORD-2050 re-asignado)
- **Orders tab**: 7 rows (todos los lifecycle posteriores incluyendo ORD-2056 delayed)

**Problema detectado**: PO tab queda con solo 3 rows, todos en `PO Received`. Falta demostrar los otros 2 statuses (`More Information Required`, `Pending Deposit`) en el demo.

##### F.00.d · Agregar 2-3 rows nuevos al seed para demostrar todos los statuses

| Nuevo ID | Customer (sugerido) | Status | Razón demo |
|---|---|---|---|
| ORD-2058 | (nuevo dealer) | `More Information Required` | Demuestra status #2 |
| ORD-2059 | (nuevo dealer) | `Pending Deposit` | Demuestra status #3 (conditional) |
| ORD-2050 (reasignado) | Heritage Office | `More Information Required` (era PO Reviewed) | Reutilizar entry existente |

**Alternativa**: cambiar ORD-2050 a `More Information Required` + agregar 1 nuevo ORD-2058 con `Pending Deposit`. Mínimo de seeds nuevos.

##### F.00.e · Bug visual detectado

El header del list view dice **"Recent Orders"** pero el tab activo es **"Purchase Orders"**.

| Hoy | Target |
|---|---|
| "Recent Orders" (genérico) | **"Recent Purchase Orders"** (tab-aware) |

Esto debe ser dinámico por tab:
- RFQ tab → "Recent RFQs"
- Quote tab → "Recent Quotes"
- PO tab → "Recent Purchase Orders"
- Ack tab → "Recent Acknowledgements"
- Orders tab → "Recent Orders"
- Shipping tab → "Recent Shipments"

##### F.00.f · Filtros del PO tab (Status dropdown + Locations)

| Filtro | Decisión |
|---|---|
| Search input | ✅ KEEP |
| Status dropdown | ✅ KEEP (auto-update con 3 nuevos statuses) |
| Location dropdown | ✅ KEEP (PO tab tiene location relevante) |
| Sub-filter pills (Active/Completed/All/Metrics) | ✅ KEEP |

**Diferencia con RFQ**: PO tab SÍ mantiene Status + Location dropdowns porque PO no es "very basic" como RFQ.

---

#### F.0 · Decisión estructural · split del lifecycle entre PO tab y nuevo Orders tab

**Antes**: 1 tab `Purchase Orders` con TODOS los statuses del lifecycle (PO Received → In Production → Ready to Ship → Shipped → Delivered)

**Después**:
- `Purchase Orders` tab → solo statuses de **recepción/validación inicial** del PO
- `Orders` tab (NUEVO) → statuses de **lifecycle post-acknowledgment** (mirror HermanMiller portal)

#### F.0.1 · Deposit · refinamiento detallado (Wendy 40:53-46:04 · user request 2026-06-05)

##### F.0.1.a · Citation completa del transcript

| Tiempo | Quote |
|---|---|
| 40:53 | Wendy: "Or is it, is it **deposit pending**?" |
| 41:01 | Asly: "I don't think that going in PO. Better on the acknowledgement because workflow is: PO → Ack → payment → proforma." |
| **41:16** | **Wendy correction**: "But an **acknowledgement is not a pro forma request**. And **many of the manufacturers are not acknowledging an order until they get their deposit**." |
| 41:30 | Asly: "Okay, so it should be here." (acepta correction de Wendy) |
| 41:34 | Wendy: "**Deposit pending**." |
| 41:39 | Wendy: "or **pending deposit**." |
| **46:04** | **Wendy condicionalidad**: "**not every manufacturer, there's not a deposit required from every single dealer.**" |

##### F.0.1.b · Workflow correcto (con deposit gating)

```
PO Received
   ↓ (if manufacturer requires deposit · conditional)
Manufacturer issues Proforma  ← requests deposit
   ↓
PO Status: Pending Deposit    ← waiting for dealer payment
   ↓ (dealer paga)
Deposit Received
   ↓
Manufacturer issues Acknowledgement
   ↓
PO moves to Orders tab as "Acknowledged"
   ↓
Production starts

Alternative (no deposit required):
PO Received → Ack Sent → Acknowledged (skip deposit gate)
```

##### F.0.1.c · 4 lugares donde mostrar el deposit en PO section

| # | Ubicación | Qué muestra | Visibilidad condicional |
|---|---|---|---|
| 1 | **Status badge en list view** | `Pending Deposit` (amber tone) | Cuando PO está en este estado |
| 2 | **Status badge en detail page header** | Mismo `Pending Deposit` | Mismo |
| 3 | **Métrica nueva en Information card** | `DEPOSIT REQUIRED: $X (30%)` + sub-info "Due: <date>" | Solo cuando aplica (manufacturer policy) |
| 4 | **Sección dedicada en detail page** | Block "Deposit Status" expandible · amount, due date, current status (Pending/Received/Confirmed), botón "Mark as Received" | Cuando aplica |

##### F.0.1.d · Cálculo del deposit amount

**Pattern típico de manufacturers** (basado en general industry knowledge):
- 30-50% del PO total como deposit
- Recomendación demo: **30%** del PO amount (e.g. PO $385,000 → Deposit $115,500)
- Mostrar como porcentaje (`30%`) + valor absoluto (`$115,500`) en la métrica

##### F.0.1.e · Conditional display logic

```ts
// Pseudo-code
const showDepositMetric = order.depositRequired && order.status !== 'Acknowledged'

if (showDepositMetric) {
  display: `DEPOSIT REQUIRED: $${order.depositAmount} (${order.depositPct}%)`
  subInfo: `Due: ${order.depositDueDate}`
  status: order.depositStatus // 'Pending' | 'Received' | 'Confirmed'
}
```

**Decisión clave**: agregar 2 campos al seed `recentOrders`:
- `depositRequired: boolean`
- `depositPct: number` (default 30)

##### F.0.1.f · INCONSISTENCIA detectada con Proforma placement (work previo)

**Trabajo previo (commit 0cd44e8)**: el botón `Generate Proforma` fue movido de Quote → **Ack detail page** (basado en Asly's feedback PDF #1)

**Pero Wendy 41:16 corrigió a Asly**: "an acknowledgement is **not** a pro forma request"

**Workflow correcto según Wendy**:
- Proforma se emite **ANTES** del Ack (para pedir el deposit)
- Ack se emite **DESPUÉS** del deposit received (confirma el order)

**Implicación**: el botón `Generate Proforma` debería estar en el **PO detail page** (no en Ack), porque conceptualmente:
- PO arrives → manufacturer evaluates if deposit required
- If yes → manufacturer generates Proforma to request deposit
- Wait for payment
- Once paid → manufacturer issues Acknowledgement

**Opciones para resolver la inconsistencia**:

| Opción | Pro | Contra |
|---|---|---|
| A · Move Proforma button de Ack → PO detail (alinea con Wendy) | Workflow correcto | Re-trabaja el commit previo |
| B · Mantener Proforma en Ack (alineado con primera lectura de Asly PDF #1) | Sin cambio | Workflow incorrecto · contradice Wendy 41:16 |
| C · Mantener en ambos lados (Quote AND Ack already removed · agregar también en PO) | Cobertura | Confusion |
| D · Crear `Generate Proforma` button SOLO en PO detail (revert el commit previo) | Workflow correcto + clean | Más trabajo de revert |

**Recomendación**: **Opción A o D** — alinear con Wendy 41:16 que es la jerarquía más alta. El feedback de Asly del PDF #1 fue una observación válida (Proforma no va en Quote) pero la ubicación final correcta es PO, no Ack.

**Necesita decisión user antes de Fase 1**.

##### F.0.1.g · Resumen para refinar el plan de F.1

El status `Pending Deposit` se mantiene como uno de los 3 final del PO tab, pero ahora con:
- Métrica `Deposit Required` en Information card (conditional)
- Sección "Deposit Status" en detail page (expandible)
- `Generate Proforma` button (post-decisión user sobre placement)
- 2 campos nuevos en seed: `depositRequired: boolean`, `depositPct: number`

---

#### F.1 · Statuses del PO tab · audit exhaustivo (10 statuses discutidos, 3 finales)

| # | Status propuesto | Quien | Decisión | Razón |
|---|---|---|---|---|
| 1 | `PO Received` | Wendy 40:53 | ✅ **FINAL** | "Deal received" inicial · OK |
| 2 | `PO Reviewed` (heredado) | Magda 42:07 | ❌ REMOVE | Wendy 42:23: "I don't see our need for peer reviewed" |
| 3 | `Deposit Pending` / `Pending Deposit` | Wendy 41:34 | ✅ **FINAL** (condicional) | "not every manufacturer requires deposit" · solo cuando aplica |
| 4 | `More Information Required` | Christian 43:03 | ✅ **FINAL** | Wendy 43:07: "the same thing. Let's keep it standard" (sync RFQ/Quote) |
| 5 | `Waiting for information` | Asly 42:47 | ❌ Renamed a #4 | Christian rephrased |
| 6 | `In Production` (heredado) | — | ❌ **MOVE a Orders tab** | Wendy 41:39: "we would not" (no in PO) |
| 7 | `Ready to Ship` (heredado) | Asly 45:37 | ❌ **MOVE a Orders tab** | "should go on proforma, not here" |
| 8 | `Shipped` (heredado) | Asly 45:37 | ❌ **MOVE a Orders tab** | Mismo |
| 9 | `Delivered` (heredado) | Asly 45:37 | ❌ **MOVE a Orders tab** | Mismo |
| 10 | `Engineering Reviewing` (HermanMiller-style) | Magda 51:19 | ❌ NO adopted | "let's keep with the basics" principle |

**3 statuses finales para PO tab**:
1. `PO Received`
2. `More Information Required`
3. `Deposit Required` / `Pending Deposit` (condicional)

#### F.2 · Statuses del NUEVO Orders tab (mirror HermanMiller portal)

**Wendy 50:28** (después de ver HermanMiller portal):
> "I think we should add an orders tab. That would show you the overall, and there's your statuses. **Is it acknowledged? Was it shipped? Was it invoiced? Is it cancelled?**"

| # | Status | Origen | Razón |
|---|---|---|---|
| 1 | `Acknowledged` | HermanMiller portal | El ack fue enviado, PO confirmado |
| 2 | `In Production` | MOVED desde PO tab | Lifecycle estage post-ack |
| 3 | `Ready to Ship` | MOVED desde PO tab | Idem |
| 4 | `Shipped` | HermanMiller portal | Self-explanatory |
| 5 | `Invoiced` | HermanMiller portal | Invoice generado al dealer |
| 6 | `Delivered` | MOVED desde PO tab | Lifecycle final |
| 7 | `Cancelled` | HermanMiller portal | Order cancelado |
| 8 | `Cancelled With Fee` | HermanMiller portal | Cancel con penalty · opcional V2 |

**Final**: 7 statuses (sin Cancelled With Fee · simplified) o 8 con CancelledWithFee · **TBD decisión user**

**Delay flag** existente (de ORD-2056 trabajo previo) sigue siendo un flag operacional ortogonal al status — aplica a `Shipped` (por ejemplo "Shipped + Delayed +8d").

#### F.3 · Projects tab · REMOVE

**Wendy 51:30**:
> "I would get rid of projects and change this to Order."

**Implementación**:
- ❌ REMOVE `Projects` tab del lifecycleTab type
- ❌ REMOVE seed `recentProjects` (si existe)
- ❌ REMOVE filtros y rendering relacionado

#### F.4 · Shipping · move INTO Transactions como tab

**Wendy 51:30** (continuación):
> "after orders would be the shipment notifications, the shipping. Where we can see the shipping information."

**Daniela 51:54**: "But inside of transactions or outside, like a section."

**Wendy 51:59**: "No, **inside of transactions**."

**Implementación**:
- ✅ ADD `Shipping` como tab dentro de Transactions (después de Orders)
- ❌ REMOVE `Shipping.tsx` como página standalone separada
- Mover el contenido (panel info + per-row Send notification CTA) al nuevo tab

#### F.5 · Orden final de tabs en Transactions

```
ANTES (5 tabs):
[RFQ] [Quotes] [Purchase Orders] [Acknowledgements] [Projects]

DESPUÉS (6 tabs):
[RFQ] [Quotes] [Purchase Orders] [Acknowledgements] [Orders] [Shipping]
                                                       ↑       ↑
                                                       NEW     moved from standalone page
```

(Invoicing como stretch goal post Sundays · TBD #3)

#### F.6 · PO matching con Quote · workflow vs status

**Christian 43:28** preguntó: "What if the PO diverted from the quote?"

**Wendy 43:37** + **Asly 44:55** clarificaron 3 escenarios:

| Escenario | Frecuencia | Resolución |
|---|---|---|
| PO sin quote previo (recurring purchase) | Común | No issue · PO flow normal |
| PO matches el quote | Caso ideal | Auto-process |
| PO diverged del quote (typo, change request, qty/finish diff) | Pain point real | Status = `More Information Required` · workflow: "we go back and ask dealer" (Asly 44:55) |

**Conclusión**: NO necesita status nuevo. `More Information Required` cubre el caso de diverged PO.

#### F.7 · Per-line columns en PO tab + detail page

**Wendy 54:03**: "yeah, this is totally fine"

PO per-line es MENOS restrictivo que Quote/RFQ porque ya es un documento "real" con pricing:

| Columna PO per-line | Decisión | Razón |
|---|---|---|
| Part # / SKU | ✅ KEEP | OK |
| Description | ✅ KEEP | OK |
| Qty | ✅ KEEP | OK |
| `Net Price` per-line | ⚠️ **TBD label** | Wendy: "I'm going to circle back" |
| `Discount` per-line | ✅ KEEP en PO (diferente de Quote) | Wendy 54:03: "discount would show here because they've already received the PO and it's reflecting the discount that they took" |
| `Amount` per-line | ✅ KEEP | OK |
| `Status` per-line | TBD | No discutido explícitamente para PO |
| `Source` per-line | ❌ REMOVE | Christian 28:31 principio aplicable (doc-level) |

**Pricing terminology en PO** (TBD #1 del plan):
- Wendy 53:48: "I'm thinking to be safe, just take net and change it to **price**"
- Wendy tentative: usar `Price` o `Unit Price`
- Decisión user previa: para Ack y posteriores usar `Unit Price` (ya cerrada en el plan)
- **PO debería usar `Unit Price`** (consistencia con Ack +)

#### F.8 · Audit visual del PO tab list view (basado en estructura paralela a Quote)

**Columnas list view del PO tab**:

| Columna | Decisión |
|---|---|
| DETAILS (avatar, dealer, ID, sales rep, rev) | ✅ Mantener |
| PROJECT & LOCATION | ✅ Mantener |
| AMOUNT | ✅ Mantener (PO tiene precio) |
| STATUS (con 3 nuevos statuses) | ✅ Mantener |
| SOURCE (Email/Dealer Portal/NetSuite/Manual edge-case) | ✅ Mantener |
| ~~SHIP DATE~~ | ❌ **REMOVE** (corrige decisión previa · ver F.10.d) |
| DATE | ✅ Mantener |
| ACTIONS | ✅ Mantener + agregar Quick Message |

**Sub-counter chip en tab** (similar a RFQ "N NEW"):
- Posible: `N AWAITING` o `N PENDING DEPOSIT` (counting `Pending Deposit` rows)
- TBD si aplica

#### F.9 · Statuses considerados y descartados (trazabilidad)

- `PO Reviewed` (Wendy: "I don't see our need")
- `Waiting for information` (Asly · renamed a Additional Info Required)
- `Engineering Reviewing` (Magda · "let's keep with the basics")
- `No Ship Date Yet` (Magda · mismo principio)

---

#### F.10 · Shipment en contexto PO · audit del minuto 40-46 + 51:30 (user request 2026-06-05)

##### F.10.a · Resumen de la pregunta

¿Qué dijo Wendy/equipo sobre shipment cerca al minuto 40 mientras revisaban PO? ¿Algo de eso debe quedar en PO tab?

##### F.10.b · Citas textuales completas del segmento

| Tiempo | Quien | Quote textual | Contexto |
|---|---|---|---|
| 41:39 | Wendy | "we would not" (sobre tener `In Production` en PO) | Rechazo · status no aplica a PO stage |
| 45:37 | Asly | "[Ready to Ship, Shipped, Delivered] should go on proforma, not here" | Rechazo · statuses no aplican a PO stage |
| 50:28 | Wendy | "I think we should add an orders tab... Is it acknowledged? Was it shipped? Was it invoiced? Is it cancelled?" | Propuesta NUEVO Orders tab |
| 51:30 | Wendy | "after orders would be the **shipment notifications, the shipping**. Where we can see the shipping information" | Shipping = tab separado, post-Orders |
| 51:59 | Wendy | "No, **inside of transactions**" | Shipping vive dentro de Transactions, NO en PO |

##### F.10.c · Lectura semántica · cleanup negativo, no contenido positivo

Cerca al minuto 40-46 NO se identificó NINGÚN contenido de shipment que deba **quedar** en PO tab. Toda la conversación fue **negativa** (qué sacar):
- Statuses de shipping → fuera de PO
- Lifecycle post-Ack → Orders tab
- Notifications, tracking, ETA → Shipping tab
- PO tab queda como `PO Received` + `More Info Required` + `Pending Deposit` solamente

##### F.10.d · Implicación cross-section · `Ship Date` column en PO list view

**Estado actual del código** (verificado · Transactions.tsx línea 2429):
```tsx
<th title="Promised ship date for this order">Ship Date</th>
```

**Status hoy en plan F.8**: `SHIP DATE | ✅ Mantener` (sane default sin auditoría)

**Conflicto detectado**: por toda la lógica del minuto 40-46, en stage `PO Received` el manufacturer **aún no se ha comprometido con un ship date**. Ese commitment se da cuando se emite el Ack:
- Industry standard: Ack incluye Expected Ship Date (lead time committed)
- En `PO Received` / `Pending Deposit` / `More Info Required` → no debería mostrarse ship date (sería false promise)

**Decisión revisada para F.10.d**:

| Pieza | Decisión | Razón |
|---|---|---|
| Column `Ship Date` en PO list view | ❌ **REMOVE** | Stage demasiado temprano · ship date no committed aún |
| Field `shipDate` en seed entries | ✅ KEEP | Se usa en Orders tab (donde sí aplica post-Ack) |
| Display de Ship Date en PO detail page | ❌ **REMOVE** | Mismo principio |
| Display de Ship Date en Orders tab list/detail | ✅ KEEP/ADD | Stage correcto · Ack ya issued |
| Display de Ship Date en Ack detail | ✅ KEEP (como "Expected Ship Date") | Wendy aprobó label rename si aplica (sección L) |

##### F.10.e · Actualización a F.8 (columnas PO list view)

Tabla F.8 corregida con el audit de shipment:

| Columna PO list view | Decisión NUEVA | Razón |
|---|---|---|
| DETAILS | ✅ Mantener | OK |
| PROJECT & LOCATION | ✅ Mantener | OK |
| AMOUNT | ✅ Mantener | PO tiene precio |
| STATUS | ✅ Mantener (3 nuevos statuses) | OK |
| SOURCE | ✅ Mantener (doc-level) | OK |
| ~~SHIP DATE~~ | ❌ **REMOVE** (corrige decisión previa) | F.10.d · stage demasiado temprano para ship commitment |
| DATE | ✅ Mantener | Fecha de recepción del PO · válido |
| ACTIONS | ✅ Mantener + Quick Message | OK |

##### F.10.f · Implicación para Orders tab (futuro audit)

Orders tab DEBE incluir Ship Date prominently (cuando se haga su audit):
- Column en list view
- Métrica en Information card en detail page
- Pipeline visual mostrando Acknowledged → Ready to Ship → Shipped con fechas

##### F.10.g · Implicación para Shipping tab (futuro audit)

Shipping tab DEBE incluir:
- Tracking number
- Carrier
- ETA actual (puede diferir de Expected Ship Date)
- Delay flags (caso ORD-2056 +8d)
- Notificaciones outbound al dealer

##### F.10.h · Conclusión

**Respuesta a la pregunta del user**: NO hay nada de la discusión de shipment cerca al minuto 40 que deba quedar en PO tab. Al contrario, esto revela una inconsistencia en F.8 (Ship Date column) que se corrige aquí.

**Cambios al plan**:
1. ✅ Aplicar `Ship Date` column REMOVE en F.8 (corregido inline arriba)
2. ✅ Documentar audit completo en F.10 (esta sección)
3. ⚠️ Recordar para futuro audit de Orders tab: ahí SÍ va Ship Date prominently
4. ⚠️ Recordar para futuro audit de Shipping tab: ahí van tracking + ETA + delays

---

#### F.11 · HermanMiller portal validation · alignment de statuses + estructura (user request 2026-06-05)

##### F.11.a · Contexto

Wendy mostró el portal **HermanMiller Order Manager** (`webprod.hermanmiller.com/om/ordermanager`) después de la discusión de shipment. El portal sirve como **referencia de ecosistema** para validar nuestro plan de statuses, columnas, y estructura de detail pages. User screenshots 2026-06-05 capturaron:
- Purchase Orders list view (270,051 entries en producción)
- PO Status dropdown (7 statuses técnicos)
- PO Detail page con tabs internos
- Orders list view (302,468 entries en producción)
- Orders Status dropdown (5 statuses)
- Order Detail page con Transactions timeline
- Sub-nav Orders dropdown con 5 secciones

##### F.11.b · PO Status dropdown HermanMiller · análisis

**Statuses observados** (screenshot 3):
```
Draft / Pending / Failed / Sending / Received / Preparing / Validating
```

**Análisis**: estos son **technical processing states** (estados del pipeline de ingestión del documento PO), NO business states. Mapeo:
- `Draft` · doc creado pero no submitted
- `Pending` · doc submitted, waiting processing
- `Failed` · processing error (OCR fail, validation fail)
- `Sending` · doc siendo enviado al ERP
- `Received` · doc procesado exitosamente · **EQUIVALENTE a nuestro `PO Received`**
- `Preparing` · doc siendo preparado para ERP
- `Validating` · doc en validation queue

**Decisión**: NO importar los technical states al demo. Solo `Received` (= `PO Received`) aplica. Nuestros statuses business-level (`PO Received` + `More Information Required` + `Pending Deposit`) son la abstracción correcta para el manufacturer view del demo.

**Trazabilidad**: documentar esta decisión para evitar que en V2 alguien quiera importar Draft/Pending/Failed sin contexto.

##### F.11.c · Orders Status dropdown HermanMiller · CRITICAL VALIDATION

**Statuses observados** (screenshot 7):
```
Acknowledged / Shipped / Invoiced / Cancelled / CancelledWithFee
```

**Total: 5 statuses · exactamente lo que Wendy 50:28 listó verbalmente**:
> "Is it **acknowledged**? Was it **shipped**? Was it **invoiced**? Is it **cancelled**?"

**Conflict con F.2 del plan**:

| Plan F.2 actual | HermanMiller real | Decisión |
|---|---|---|
| Acknowledged | ✅ Acknowledged | KEEP |
| **In Production** | ❌ NO existe | ⚠️ DECISIÓN |
| **Ready to Ship** | ❌ NO existe | ⚠️ DECISIÓN |
| Shipped | ✅ Shipped | KEEP |
| Invoiced | ✅ Invoiced | KEEP |
| **Delivered** | ❌ NO existe | ⚠️ DECISIÓN |
| Cancelled | ✅ Cancelled | KEEP |
| Cancelled With Fee | ✅ CancelledWithFee | KEEP |

**Insight**: HermanMiller usa "Planned Delivery Date" (Planned column) como **indicador de progreso temporal**, NO statuses intermedios. El status solo cambia en transitions clave (Ack → Shipped → Invoiced/Cancelled).

##### F.11.d · 3 opciones para resolver el conflict

**Opción A · Strict HermanMiller (5 statuses)**
- Acknowledged / Shipped / Invoiced / Cancelled / CancelledWithFee
- "In Production" / "Ready to Ship" / "Delivered" se quedan FUERA como statuses
- Progress visualizado via `Planned Delivery Date` column + ETA badges
- **Pro**: matching exacto con ecosistema · más simple · alineado con Wendy 50:28 verbatim
- **Contra**: pierde granularidad visual del seed actual (4 entries en intermediates)

**Opción B · Extended (8 statuses, mantiene plan F.2 actual)**
- Acknowledged / In Production / Ready to Ship / Shipped / Invoiced / Delivered / Cancelled / CancelledWithFee
- **Pro**: más granular · matchea seed actual del demo
- **Contra**: diverge de HermanMiller · contradicts Wendy 50:28 (ella nombró solo 4)

**Opción C · Hybrid (5 primary statuses + sub-phase indicators)**
- 5 statuses primary (HermanMiller)
- `Acknowledged` puede tener sub-phase chip `In Production` o `Ready to Ship` (similar al pattern `Pending · textile review`)
- `Shipped` puede tener sub-phase chip `Out for Delivery` o `Delivered` (terminal)
- **Pro**: best of both · granularidad + alignment
- **Contra**: complica el seed · necesita data model adicional · más UI work

**Recomendación**: **Opción A · Strict HermanMiller**. Razones:
1. Wendy 50:28 verbatim listó solo 4 (ella nunca mencionó In Production/Ready to Ship/Delivered en Orders context)
2. Principio rector Wendy: "let's keep with the basics" (23:54)
3. Las intermediates `In Production`/`Ready to Ship` se pueden inferir de `Planned Delivery Date` proximity vs `Acknowledged date`
4. `Delivered` es un estado post-`Shipped` → se puede absorber en `Shipped + delivered flag` (similar al pattern delay) o moverlo al Shipping tab donde sí aplica

**Acción si user aprueba Opción A**:
- Update F.2 a 5 statuses
- Seed cleanup: ORD-2054 (In Production) → reasignar a `Acknowledged` con planned delivery próxima
- Seed cleanup: ORD-2053 (Ready to Ship) → `Acknowledged` con planned delivery muy próxima
- Seed cleanup: ORD-2052 (Delivered) → `Shipped` + flag `delivered`
- ORD-2048 (Ready to Ship), ORD-2049 (In Production) → mismo treatment

##### F.11.e · PO Detail page tabs · HermanMiller inspiration

**Tabs internos del PO detail HermanMiller** (screenshot 4):
```
PO / Upload Files / Lines / Ship To / End Customer / Notices / Status / Audit
```

**Mapping a nuestro demo**:

| HermanMiller tab | Demo equivalente | Acción |
|---|---|---|
| `PO` | PO header info (Sold To, BP#, Quote#, etc.) | Default view |
| `Upload Files` | (Edge-case upload from F.0.3) | Reutilizar UploadModal |
| `Lines` | PO Items table (per-line) | F.7 column audit |
| `Ship To` | Ship-to address | Sub-section |
| `End Customer` | End customer info | Sub-section |
| `Notices` | Notifications log (emails sent/received) | Reutilizar EmailDraftModal log |
| `Status` | Status history timeline | Mini-timeline component |
| `Audit` | Activity log (who did what when) | Reutilizar activity stream component |

**Decisión propuesta · tabs internos del PO detail del demo (V1, simplified)**:
1. **PO Items** (default · table de líneas)
2. **Activity** (combina Notices + Status + Audit en una vista unificada · pattern actual)
3. **Documents** (uploads + linked Quote PDF + Proforma generated)

3 tabs es suficiente para V1. HermanMiller tiene 8 porque es producción enterprise · over-kill para demo.

##### F.11.f · Order Detail page · Transactions timeline (KEY INSIGHT)

**Screenshot 6 muestra Order Detail HermanMiller** con sección **Transactions** al top:

```
Transactions                                                Download
Type                                                        Created Date
─────────────────────────────────────────────────────────────────────
Acknowledgment (SO # 100GN8343 Planned Delivery Jun 18, 2026)  Jun 5, 2026 4:34:20 PM
Purchase Order (PO # 24876 Received Jun 5, 2026 9:49:17 AM)    Jun 5, 2026 9:49:17 AM
```

**Insight crítico**: muestra **el linked PO + el linked Ack como timeline cronológico** en el mismo lugar. Este pattern es valioso porque:
- Manufacturer ve el full lifecycle en un solo lugar
- Cada link es clickeable (puede ir al PO detail o Ack detail)
- Muestra el `Planned Delivery Date` derivado del Ack

**Aplicación al demo · Orders tab detail page**:
- Sección `Transactions Timeline` al top del Order detail
- Lista cronológica: PO Received → Ack Sent → (Proforma Issued if applies) → Shipped → Invoiced
- Cada entrada con: type · ID · date · link clickeable
- Planned Delivery Date mostrado prominently

**Reuso de componentes existentes**: probable que tengamos algún Activity Stream component que se pueda adaptar.

##### F.11.g · Sub-nav Orders dropdown HermanMiller

**Observado en screenshot 4 + 7** (top right nav dropdown):
```
Orders
Acknowledgments
Past Due Orders
Shipment Notices
Cancellations
```

**Mapping a nuestro demo**:

| HermanMiller sub-nav | Demo cubre via | Decisión |
|---|---|---|
| Orders | Tab Orders | ✅ |
| Acknowledgments | Tab Acknowledgements | ✅ |
| Past Due Orders | Filter dentro de Orders tab (status `Acknowledged` + Planned < today) | ✅ via filter |
| Shipment Notices | Tab Shipping | ✅ (F.12 restructure) |
| Cancellations | Filter dentro de Orders tab (status `Cancelled` o `CancelledWithFee`) | ✅ via filter |

**Conclusión**: nuestros 6 tabs (RFQ/Quotes/PO/Acks/Orders/Shipping) cubren todo lo que HermanMiller separa en sub-nav · sin necesidad de añadir nada nuevo.

##### F.11.h · "Planned Delivery Date" como concepto cross-tab

HermanMiller usa `Planned` column en Orders list view (e.g. `06/18/2026`). Este es:
- El ETA committed en el Ack
- Diferente del "Ship Date" del PO (que removimos en F.10.d porque no está committed aún)
- Mismo concepto que nuestro `shipDate` field pero con nombre más preciso

**Decisión**: rename `shipDate` field UI label en Orders/Ack tabs a `Planned Delivery` (manteniendo el field name interno `shipDate` para minimizar refactor).

**Aplicación**:
- Orders list view column: `PLANNED DELIVERY` (en vez de `SHIP DATE`)
- Orders detail Information card: métrica `Planned Delivery: Jun 18, 2026`
- Ack detail (cuando se emite): `Planned Delivery Date` field
- Shipping tab: `ETA` (más específico que Planned, refleja current estimate vs original commitment)

##### F.11.i · Resumen de impacto cross-section

| Sección del plan | Impacto F.11 |
|---|---|
| F.2 (Orders tab statuses) | Reducir de 8 a 5 si user aprueba Opción A |
| F.7 (PO per-line columns) | Sin cambio (HermanMiller no afecta esto) |
| F.8 (PO list view columns) | Sin cambio (Ship Date ya removido en F.10) |
| L (Ack page) | Rename "Expected Ship Date" → "Planned Delivery Date" para consistencia |
| Orders detail (futuro audit) | Implementar Transactions Timeline pattern de HermanMiller |
| PO detail (futuro audit) | Considerar 3 tabs internos (PO Items / Activity / Documents) |

---

#### F.12 · Shipping page · restructure como tab + format alignment (user request 2026-06-05)

##### F.12.a · Estado actual (screenshot 8 user 2026-06-05)

**Ubicación actual**: standalone route `Dashboard > Shipping`

**Layout actual**:
- Breadcrumb `Dashboard > Shipping`
- Title `Shipping`
- **Header card** "Shipping & Logistics" con sub-text `Automatic notifications · tracking · carrier · ETA per Wendy item 6`
- **5 KPI cards**: Active Shipments 6 / Ready to Ship 2 / In Transit 4 / Delivered Today 1 / Delayed 1
- **Info panel** "How shipping confirmations are sent" (verbose explanation)
- **Filter row**: Search input + pills `All / Ready to ship / Shipped / Delivered / Delayed` + counter `7 of 7` + Export button
- **Table**: SHIPMENT | DEALER/PROJECT | ETA | CARRIER | TRACKING # | STATUS | SOURCE | ACTIONS

##### F.12.b · Target post-restructure (Wendy 51:59 + format alignment)

**Ubicación target**: tab dentro de Transactions (después de Orders)

**Cambios estructurales**:

| Pieza actual | Cambio | Razón |
|---|---|---|
| Breadcrumb `Dashboard > Shipping` | ❌ REMOVE | Ya no es route standalone |
| Title `Shipping` | ❌ REMOVE | El tab label lo provee |
| Header card "Shipping & Logistics" + verbose subtitle | ⚠️ Compactar | Demasiado pesado para un tab interno |
| 5 KPI cards | ⚠️ KEEP pero compactar | Útiles · mover a header tab (similar a `Metrics` sub-filter de otros tabs) |
| Info panel "How shipping confirmations are sent" | ⚠️ Move a tooltip/popover | Es help text, no contenido primary |
| Filter row | ✅ KEEP (alineado con otros tabs) | OK |
| Table columns | ⚠️ Audit + align con PO/Order list view | Format consistency |

**Layout final propuesto** (matching PO tab structure):

```
[Header del tab: "Recent Shipments"]
[Sub-filter pills: Active | Completed | All | Metrics]
[Filter row: Search | Status dropdown | Location dropdown | Export]
[Counter: N rows | per page selector]
[Table]:
| SHIPMENT | DEALER & PROJECT | PLANNED DELIVERY → ETA | CARRIER | TRACKING # | STATUS | SOURCE | ACTIONS |
[Pagination si aplica · OOS V1]
```

Cuando user selecciona `Metrics` sub-filter, muestra los 5 KPI cards. En vista default (Active/All), va directo a la tabla.

##### F.12.c · Per-row columns audit + alignment con DS conventions

**Hoy** (screenshot 8):

| Column actual | Issue | Acción |
|---|---|---|
| SHIPMENT (`SHP-2026-018` + `#ORD-2055`) | OK · alineado con pattern PO/Order | KEEP |
| DEALER / PROJECT (NorthPoint Furniture Group · Tech HQ Buildout) + `DP Rep · David Park` + `REV #2` | `REV #2` outdated | ✅ Rename `REV #2` → `Revision # 2` (alignment with E.0000) |
| ETA (`Mar 20, 2026` + `8d to ETA`) | OK · relative time es buen pattern | KEEP |
| CARRIER (`FedEx Freight LTL` etc.) | OK | KEEP |
| TRACKING # (`129483-AB-2055`) | OK | KEEP |
| STATUS (`READY TO SHIP` / `SHIPPED` chips) | OK · usa pattern badge | KEEP · validar tokens DS |
| SOURCE (`EMAIL` / `OCR` / `DEALER PORTAL`) | ❌ `OCR` no debería existir | Apply sources cleanup (F.B) · `OCR` → `Email` o `Dealer Portal` |
| ACTIONS (`Send notification` + location pin) | OK | KEEP + agregar Quick Message (per D.2.a · Shipping tab tiene Quick Message) |

##### F.12.d · Pre-draft pattern de notifications · KEEP

El info panel actual dice:
> "Strata pre-drafts a per-order shipping notification with ETA, carrier and tracking number. The order owner reviews and sends it from this list (Send notification per row) or in bulk via Resend Notifications above."

Este **pre-draft pattern** es valioso · alineado con Quick Message templates de D.2.b · Templates específicos para Shipping ya están en D.2.b. Mantener pero compactar:
- Mover el explanation completo a un tooltip/popover en el header del tab
- Default UX: row action `Send notification` (sin necesidad de explainer)

##### F.12.e · Bulk action "Resend Notifications" (mencionado en info panel)

El info panel referencia `Resend Notifications` arriba (en el header del tab). Esta bulk action existe hoy en algún lugar?

Audit pendiente en código. Si existe:
- ✅ KEEP · es feature útil
- Validar alignment con DS

Si no existe:
- Decidir si implementar en V1 (low priority)

##### F.12.f · Files afectados por F.12

- **NUEVO/REFACTOR**: `src/Transactions.tsx` — agregar tab `Shipping` con sub-counter
- **REFACTOR**: `src/Shipping.tsx` — convertir el component standalone en un sub-component renderable dentro del tab
- **REFACTOR**: `src/App.tsx` — remover route standalone (o keep como redirect a Transactions/Shipping tab para back-compat)
- Audit components compartidos (KPI cards, info panel) para reutilización

##### F.12.g · Riesgo + complejidad

**Riesgo medio**: requiere refactor del routing + extracción del Shipping component en sub-component reutilizable. Cuidado con:
- State management interno (filters, search, selection)
- Hooks que asumen route params
- Links/breadcrumbs que apunten a la ruta vieja

**Tiempo estimado**: ~1.5-2h con audit incluido.

---

#### F.13 · Shipping accessibility audit (user request 2026-06-05)

##### F.13.a · Issues detectados en screenshot 8

**Issue 1 · Subtitle con jargon interno**:
- Texto: `Automatic notifications · tracking · carrier · ETA **per Wendy item 6**`
- Problema: `per Wendy item 6` es referencia interna al PDF feedback (Wendy item 6) · NO es texto user-facing
- **Acción**: REMOVE `per Wendy item 6` · texto final: `Automatic notifications · tracking · carrier · ETA`

**Issue 2 · Info panel verbose con UI element references en italic**:
- Texto: "...The order owner reviews and sends it from this list (**Send notification** per row) or in bulk via **Resend Notifications** above. The same draft is also available on the Order Details page between the *Scheduled → Shipped* stages."
- Problemas:
  - Mezcla de bold + italic + parentheses · cognitive load alto
  - `Scheduled → Shipped` stages es jargon (esos no son nuestros statuses finales · OPCIÓN A son Acknowledged → Shipped)
  - Demasiado denso para info panel
- **Acción**: reescribir simplificado · ej: "Send shipping notifications individually (Send notification button per row) or in bulk (Resend Notifications above). Drafts include ETA, carrier, and tracking number."

**Issue 3 · `REV #2` badge wording**:
- Hoy: `REV #2`
- Target: `Revision # 2` (per Wendy 34:36 + audit E.0000)
- **Acción**: rename en Shipping rows también (cross-section consistency)

**Issue 4 · `8d to ETA` / `2d to ETA` / `18d to ETA` muted-foreground contrast**:
- Texto relativo debajo del ETA absoluto
- Probable contrast ratio < 4.5:1 si usa `text-muted-foreground` sin validación
- **Acción**: verificar contrast ratio con DS · si falla WCAG AA, escalar token (e.g. `text-foreground/70` en vez de `text-muted-foreground`)

**Issue 5 · Status chips `READY TO SHIP` / `SHIPPED`**:
- Yellow/blue fill con texto
- Validar contrast ratio · DS tokens deberían cumplir pero hay que verificar en context
- Validar que no usen colors hardcoded (bg-yellow-100 etc.) — debe ser tokens semánticos

**Issue 6 · Source chips `EMAIL` / `OCR` / `DEALER PORTAL`**:
- Mismos checks que Issue 5
- Adicional: `OCR` debe removerse (sources cleanup)

**Issue 7 · KPI card values con high-contrast colors**:
- Card "ACTIVE SHIPMENTS 6" usa color `text-foreground`
- Card "DELAYED 1" usa color destructive/red
- Validar que destructive token cumple contrast en tema dark/light
- Posible issue: el `1` rojo de Delayed puede ser muy chico (font-size) — verificar legibilidad

**Issue 8 · Filter pill "All" highlight yellow**:
- El pill activo usa un yellow brand
- Verificar contrast del texto sobre el fill yellow
- Si es `bg-brand-300` con `text-foreground` puede fallar
- Validar usa el token correct (probablemente `bg-brand-500` con `text-brand-foreground`)

##### F.13.b · Validation steps · accessibility audit

```bash
# 1. Grep por colors hardcoded en Shipping.tsx
grep -E "bg-(green|red|orange|yellow|blue|amber|indigo)-[0-9]" inbound-outbound/src/Shipping.tsx
grep -E "text-(green|red|orange|yellow|blue|amber|indigo)-[0-9]" inbound-outbound/src/Shipping.tsx
grep -E "brand-(300|400)" inbound-outbound/src/Shipping.tsx

# 2. Buscar "Wendy" references en código user-facing
grep -in "wendy" inbound-outbound/src/Shipping.tsx

# 3. Validar aria-labels en interactive elements
grep -in "aria-label" inbound-outbound/src/Shipping.tsx
```

##### F.13.c · Issues recurrentes a verificar cross-section

Si Shipping tiene estos issues, probable que otros tabs también:
- `per Wendy item N` references en subtitles · buscar en Dashboard, Transactions, etc.
- `REV #N` wording · audit cross (ya documentado en E.0000)
- Hardcoded colors en chips de status
- Brand-300/400 mal usado para texto

**Acción**: aplicar fixes en Shipping primero · luego propagar pattern a otros tabs si aplica.

##### F.13.d · Validation post-fix

```bash
# Después del cleanup
grep -rn "per Wendy" inbound-outbound/src/  # 0 hits
grep -rn "REV #" inbound-outbound/src/      # 0 hits (todos a Revision # N)
grep -rn "bg-green-[0-9]\|bg-red-[0-9]\|bg-orange-[0-9]" inbound-outbound/src/Shipping.tsx  # 0 hits
```

##### F.13.e · WCAG checks a correr (browser DevTools)

1. Axe DevTools scan en `/shipping` (o el tab post-restructure)
2. Lighthouse accessibility score · target >= 95
3. Keyboard navigation: Tab order debe seguir visual layout
4. Screen reader test (NVDA / JAWS / VoiceOver): chips deben anunciar status correctamente
5. Color contrast: todos los text/bg combinations deben cumplir WCAG AA (4.5:1 normal, 3:1 large)

##### F.13.f · Files afectados

- `src/Shipping.tsx` — texts (subtitle, info panel, REV badges), color tokens
- Quizás `src/components/ShippingStatusBadge.tsx` o similar — si existe component dedicado para chips
- Cross-section: Dashboard, Transactions (si comparten patterns)

---

#### F.15 · Price display refinement en PO detail + Order detail (user request 2026-06-05)

##### F.15.a · Contexto

Screenshot 9 (user 2026-06-05): Order detail ORD-2056 NorthPoint Furniture Group Tech HQ Phase 2 muestra columna `Net Price` con la palabra `Net` resaltada en azul · user pointing que ese label necesita cambio per Wendy.

**Nota**: el screenshot es Order detail, no PO detail estricto. Pero ambos comparten data model (los Orders son post-Ack lifecycle de POs accepted) · refinement aplica a ambos.

##### F.15.b · Citas exactas del transcript sobre price en PO

**Wendy 53:48 (key quote para PO)**:
> "I'm thinking **to be safe**, just take **net** and change it to **price**."

**Wendy 54:03 (clarifica que discount stays)**:
> "this is totally fine" · "**discount would show here** because they've already received the PO and it's **reflecting the discount that they took**"

**Insight Wendy**: el discount existe en PO porque el **dealer ya lo aplicó** cuando mandó el PO al manufacturer (su contract discount). Esto es la diferencia clave con Quote (donde manufacturer cotiza list sin aplicar discount).

##### F.15.c · Reconciliación cross-stage del pricing label

| Stage | Quien aplica discount | Label de columna | Discount per-line visible | Citation |
|---|---|---|---|---|
| **Quote** | Nadie (manufacturer cotiza) | `List Price` | ❌ NO | Wendy 35:00 · 39:30 |
| **PO** | Dealer (al mandar PO) | `Price` (renamed from Net) | ✅ SÍ (refleja dealer's contract) | Wendy 53:48 · 54:03 |
| **Ack** | Inherited del PO | `Price` (consistency) | ✅ SÍ | Plan section M |
| **Orders** | Inherited del PO | `Price` (consistency) | ✅ SÍ | F.15 (esta sección) |

##### F.15.d · Decisión final del label

Wendy 53:48 dijo literalmente `Price` (no `Unit Price`). Reconciliación con plan section M:
- Section M originalmente proponía `Unit Price` para Ack y posteriores
- Wendy 53:48 verbatim para PO: `Price`
- **Decisión consolidada**: usar `Price` en PO/Ack/Orders (Wendy's verbatim wins over section M's inference)

**Excepción válida**: si hay ambigüedad en algún context, usar `Unit Price` para enfatizar que es per-unit (vs Amount = per-row). Pero default es `Price`.

##### F.15.e · Aplicación al screenshot ORD-2056 · audit completo

**Columnas actuales del Order Items table (screenshot 9)**:

| Column | Status hoy | Target post-F.15 | Razón |
|---|---|---|---|
| `Item #` (SKU) | ✅ OK | ✅ KEEP | OK |
| `Description` (con Tag + Size sub-info) | ✅ OK | ✅ KEEP | OK |
| `Qty` | ✅ OK | ✅ KEEP | OK |
| `Net Price` ($479.18 + `-62%` sub-line) | ❌ Wendy 53:48 | ✅ **RENAME a `Price`** · KEEP discount sub-line `-62%` | Wendy 53:48 + 54:03 |
| `Amount` ($2,875.08) | ✅ OK | ✅ KEEP | Calculation Price × Qty |
| `Status` per-line (`Shipped` + `Delayed · 8d`) | ✅ OK | ✅ KEEP | Lifecycle real per-item |
| `Source` per-line (`DEALER PORTAL`) | ❌ Christian 28:31 | ❌ **REMOVE per-line** | Source es doc-level |

##### F.15.f · Visual antes/después

**ANTES (screenshot 9)**:
```
ITEM # | DESCRIPTION       | QTY | NET PRICE        | AMOUNT     | STATUS                | SOURCE
T-RCR  | TBL REC 30Dx60Wx  | 6   | $479.18 / -62%   | $2,875.08  | Shipped               | DEALER PORTAL
F-SSC  | LB LOUNGE 2 SEAT  | 4   | $2,031.12 / -58% | $8,124.48  | Shipped + Delayed 8d  | DEALER PORTAL
X-LTD  | CBX TRIPLE DOOR   | 2   | $697.68 / -62%   | $1,395.36  | Shipped + Delayed 8d  | DEALER PORTAL
```

**DESPUÉS post-F.15**:
```
ITEM # | DESCRIPTION       | QTY | PRICE            | AMOUNT     | STATUS
T-RCR  | TBL REC 30Dx60Wx  | 6   | $479.18 / -62%   | $2,875.08  | Shipped
F-SSC  | LB LOUNGE 2 SEAT  | 4   | $2,031.12 / -58% | $8,124.48  | Shipped + Delayed 8d
X-LTD  | CBX TRIPLE DOOR   | 2   | $697.68 / -62%   | $1,395.36  | Shipped + Delayed 8d
```

Cambios:
- `NET PRICE` → `PRICE` (header rename · Wendy 53:48)
- `-62%` / `-58%` sub-lines STAY (Wendy 54:03 · discount visible in PO/Ack/Order)
- `SOURCE` column REMOVED (per-line · Christian 28:31 · source es doc-level)

##### F.15.g · Information card del Order detail (screenshot 9 top)

Sub-section adicional notada en screenshot:

| Métrica actual | Decisión | Razón |
|---|---|---|
| `ORDER VALUE $142,800.00` | ✅ KEEP | Net total · OK |
| `SHIPPED 12 of 12` | ✅ KEEP | Progress indicator útil |
| `LINE ITEMS 3` | ✅ KEEP | Count |
| `STATUS Shipped` | ⚠️ Validar con F.11.d Opción C | Si user aprueba sub-phase chips, mostrar también `delivered` sub-phase si aplica |

**Sub-chips del header** (`Source EMAIL · DP SALES REP David Park · Call Before Delivery 24hrs · REV #2`):
- ✅ `Source EMAIL` · OK (post sources cleanup)
- ✅ `SALES REP David Park` · OK
- ✅ `Call Before Delivery 24hrs · 480-640-2818` · operational info útil · KEEP
- ❌ `REV #2` → **RENAME a `Revision # 2`** (cross-section consistency con E.0000)

##### F.15.h · Action buttons header del Order detail

| Botón | Hoy | Decisión |
|---|---|---|
| `Convert to ACK` | ✅ Visible | Validar workflow: PO → Ack es OK · pero este es ORDER detail (post-Ack) · ¿should not show here? · **TBD** |
| `AR & Deposits` | ✅ Visible | Aligned con F.0.1 deposit feature · KEEP · validar placement |
| `Tracking` | ✅ Visible | OK · refiere a Shipping tab info · KEEP |
| `Review shipment delay alert` (yellow CTA) | ✅ Visible | Operational · valid para Delayed orders · KEEP |

**Nota sobre `Convert to ACK` en Order detail**:
- Conceptualmente raro: el order ya tiene un Ack (es por eso que está en status Shipped)
- Probablemente sea un legacy button del refactor anterior
- **Decisión recomendada**: REMOVE el `Convert to ACK` button de Order detail (solo aplica en PO detail antes del Ack)
- En PO detail: ✅ KEEP (workflow correcto: PO → Convert to Ack)
- En Order detail: ❌ REMOVE

##### F.15.i · Files afectados

- `src/OrderDetail.tsx` — column headers + per-line columns + sub-chips
- `src/components/manufacturer/ItemDetailsDrawer.tsx` — si tiene mismo pattern de Net Price
- `src/QuoteDetail.tsx` — verificar que NO aplique este rename (Quote = List, no Price)
- Cross-section: PO detail (si tiene su propio component) · Ack detail · Shipping tab (per-row tracking has price?)

##### F.15.j · Validación post-fix

```bash
# 1. PO/Ack/Order detail debe usar 'Price' not 'Net Price'
grep -rn "Net Price" inbound-outbound/src/OrderDetail.tsx inbound-outbound/src/AckDetail.tsx
# 0 hits esperado

# 2. Quote detail debe seguir usando 'List Price'
grep -rn "List Price" inbound-outbound/src/QuoteDetail.tsx
# Hits esperados (no remover)

# 3. RFQ detail no debe tener ninguna mención de Price
grep -rn "Price" inbound-outbound/src/RFQItemsView.tsx  # o similar
# 0 hits esperado
```

##### F.15.k · Aplicabilidad a Item Details Drawer

PDF #8 ya pedía REMOVE de los 3 boxes `Net Price / Discount / List Price` en el Item Details Drawer.

Reconciliación con F.15:
- En Drawer del Quote: ❌ REMOVE los 3 boxes (PDF #8 · sin pricing breakdown per-item)
- En Drawer del PO/Ack/Order: ⚠️ **TBD si se aplica el mismo REMOVE**
- Hipótesis: el Drawer del PO/Ack/Order debería seguir el mismo pattern de tabla (Price column con discount sub-line · NO 3 boxes separados)

**Decisión recomendada**: en Drawer de PO/Ack/Order, mostrar:
- Top-right métrica única: `Amount: $X` (single metric · Price × Qty)
- Sin los 3 boxes de Quote Drawer
- Si discount aplica, mostrar inline `Amount $X (-62%)` o similar

##### F.15.l · Cross-stage consistency table final

| Pricing label | RFQ | Quote | PO | Ack | Order |
|---|---|---|---|---|---|
| Column header | (no price) | `List Price` | `Price` | `Price` | `Price` |
| Discount per-line visible | N/A | ❌ NO | ✅ YES | ✅ YES | ✅ YES |
| Discount % sub-line | N/A | N/A | `-62%` etc. | `-62%` etc. | `-62%` etc. |
| Drawer pricing boxes | N/A | ❌ REMOVE | TBD | TBD | TBD |
| Source per-line | N/A | ❌ NO | ❌ NO | ❌ NO | ❌ NO |
| Source doc-level | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES |

---

#### F.14 · Resumen consolidado de decisiones pendientes user post-screenshots

**Decisión #1 (F.11.d)**: Orders tab statuses
- A · Strict HermanMiller (5) **[recomendada]**
- B · Extended (8, plan actual)
- C · Hybrid (5 primary + sub-phase indicators)

**Decisión #2 (F.11.h)**: Rename `Ship Date` → `Planned Delivery Date` cross-section
- Apply a Orders tab, Ack tab
- Skip o aplicar a otros tabs según corresponda

**Decisión #3 (F.12.b)**: Shipping tab restructure
- Approval del layout propuesto (header + sub-filter pills + table alineado con PO tab pattern)
- KPI cards: ¿en header del tab siempre visibles, o solo en sub-filter `Metrics`?

**Decisión #4 (F.13)**: Shipping accessibility cleanup
- ¿Aplica fix completo en Fase 0/1 (junto con sources cleanup)? · Recomendación: SÍ porque sources cleanup ya toca Shipping
- ¿O posponer a Fase 5 polish?

---

## Plan de acción escalonado · 7 fases con Test+Review checkpoint integrado

**Cambios respecto al plan original (6 fases · ~11h)**:
- Renumerado: 7 fases con checkpoints (~22h total con tests)
- Foundation ahora es Phase 1 (era Phase 1) · bloquea everything
- Matt's ingestion moved a Phase 2 (era Phase 0) · depende de tabs structure de Phase 1
- Agregadas decisiones acumuladas: Hybrid C statuses (F.11), Shipping restructure (F.12), Unit Price (L.21), Item-level statuses Ack (L.17), 3-Way Match refinement (L.19), Tracking timeline (L.20), Dashboard alignment (N.1)
- Test + Review checkpoint explícito post cada fase (~30min cada uno)

**Total estimado**: ~22h (16h impl + 4h checkpoints + 2h final verification)

### Phase board · status tracking

| Phase | Topic | Est. impl | Est. checkpoint | Status |
|---|---|---|---|---|
| 1 | Foundation (structural · breaks if not first) | 4h | 30min | ⏳ pending |
| 2 | Matt's volume ingestion (CEO-level demo) | 2.5h | 30min | ⏳ pending |
| 3 | RFQ + Quote cleanup | 2.5h | 30min | ⏳ pending |
| 4 | PO + Orders implementation | 4h | 30min | ⏳ pending |
| 5 | Ack + Reconciliation | 3h | 30min | ⏳ pending |
| 6 | Shipping + Dashboard + Accessibility | 2.5h | 30min | ⏳ pending |
| 7 | Final verification + smoke test | 1.5h | n/a | ⏳ pending |

Estados:
- `⏳ pending` — no empezada
- `🟡 pre-flight under review` — esperando user confirme antes de empezar
- `🔵 in-progress` — implementando
- `🟠 post-flight under review` — esperando user verifique antes de pasar a la próxima
- `✅ approved` — done, commits pushed, próxima fase puede empezar

---

### Phase 1 · Foundation (structural changes) · ~4h impl + 30min checkpoint

**Por qué primera**: cambios cross-cutting que rompen everything else si no se hacen primero. Sources cleanup, tabs structure, status taxonomies, renames cross-section.

#### Pre-flight (Phase 1)
- **Plan references**: A (Tabs), B (Sources), C (Status taxonomies), L.21 (Unit Price), E.0000 (Revision #), E.1.f.0 (Expiration Date), L.18.f (DATE column rename)
- **Files a tocar (mayor)**: `src/Transactions.tsx`, `src/components/inbound-outbound/SourceBadge.tsx`, `src/App.tsx`, todos los `*Detail.tsx` (cross-section renames)
- **Riesgo**: alto (cross-cutting · breaking changes)
- **Mitigación**: commits granulares · TS check después de cada sub-tarea

#### Sub-tareas (1.1 - 1.6)

**1.1 · Sources cleanup** (~45min · Risk medium)
- Reemplazar `OCR`, `RPA`, `API` en seeds → `Email` / `Dealer Portal` / `NetSuite` mix
- Update `TransactionSource` union type en SourceBadge.tsx
- `Manual` mantener solo en RFQ + PO seeds (edge-case)
- Files: `Transactions.tsx` seeds + `SourceBadge.tsx` + `*Detail.tsx` source refs
- SOT: B + Christian 7:42/8:11/10:07
- Validation: `grep -rn "'OCR'\|'RPA'\|'API'" inbound-outbound/src/` → 0 hits

**1.2 · Tabs structure restructure** (~45min · Risk high)
- ADD `Orders` tab a Transactions
- ADD `Shipping` tab a Transactions (mover desde route standalone)
- REMOVE `Projects` tab
- Update lifecycleTab type
- Update routing en `App.tsx` (Shipping ya no standalone)
- Files: `Transactions.tsx`, `App.tsx`, `Shipping.tsx` (refactor a sub-component)
- SOT: A + Wendy 50:28 + 51:30 + 51:59

**1.3 · Status taxonomies update** (~60min · Risk high)
- `rfqStages` → `['New', 'In Review', 'Additional Information Required', 'Sent']` (D.1)
- `quoteStages` → `['In Progress', 'Pending', 'Sent', 'Expired']` (E.1.i)
- `ackStages` → `['Pending', 'Partial', 'Confirmed']` (L.1 · remove Discrepancy)
- ADD `orderStages` = `['Acknowledged', 'Shipped', 'Invoiced', 'Cancelled', 'CancelledWithFee']` (F.2 + F.11 Hybrid C)
- ADD `orderSubPhases` para Hybrid C: `['In Production', 'Ready to Ship']` (under Acknowledged) + `['In Transit', 'Delivered']` (under Shipped)
- Files: `Transactions.tsx` arrays + seeds para reflect new statuses
- SOT: C + F.11.d Opción C aprobada

**1.4 · Unit Price cross-stage rename** (~30min · Risk low)
- Quote stays `List Price`
- PO/Ack/Orders → `Unit Price` (renamed from `Net Price` o `Price`)
- Files: `OrderDetail.tsx`, `AckDetail.tsx`, `QuoteDetail.tsx` (verify NO change), column headers, PDF exports
- SOT: L.21
- Validation: `grep -rn "Net Price" inbound-outbound/src/` → 0 hits

**1.5 · REV #N → Revision # N cross-section** (~20min · Risk low)
- Audit cross-section · replace todos los `REV #N` con `Revision # N`
- Files: todos los `*Detail.tsx`, `Transactions.tsx`, modals (PED Export, Quote Comparison)
- SOT: E.0000 + Wendy 34:36
- Validation: `grep -rn "REV #\|Rev #" inbound-outbound/src/` → 0 hits

**1.6 · DATE column rename cross-tab + Expiration Date** (~20min · Risk low)
- Quote: `Valid Until` → `Expiration Date` (E.1.f.0 · 6 files identified)
- RFQ/PO: DATE → `Received Date` (L.18.f)
- Quote/Ack/Shipping: DATE → `Sent Date` (L.18.f)
- Orders: DATE → `Order Date` (L.18.f · HermanMiller alignment)
- Files: `Dashboard.tsx`, `Transactions.tsx`, `PEDExportModal.tsx`, `QuoteComparisonModal.tsx`
- SOT: L.18.f + Wendy minuto 57 (TBD term verification)

#### Commits sugeridos (Phase 1)
- `refactor(sources): cleanup OCR/RPA/API → Email/Dealer Portal/NetSuite per Christian`
- `feat(Transactions): add Orders tab + move Shipping as tab + remove Projects per Wendy 50:28`
- `refactor(statuses): apply Neocon-review taxonomies (RFQ/Quote/PO/Ack/Orders)`
- `refactor(pricing): rename Net Price → Unit Price cross-stage per Wendy L.21`
- `refactor(wording): REV #N → Revision # N cross-section per Wendy 34:36`
- `refactor(columns): rename DATE per stage (Sent/Received/Order Date) + Expiration Date`

#### Post-flight (Phase 1) · Test + Review checkpoint (~30min)

1. **TS check**: `npx tsc --noEmit` desde `inbound-outbound/` → 0 errors
2. **DS sanity**: grep `bg-(green|red|orange|amber|blue|yellow)-` → cero new matches
3. **Browser smoke**: load app · verify 6 tabs visible (RFQ/Quotes/PO/Acks/Orders/Shipping · sin Projects)
4. **Status pipelines visible**: cada tab muestra los nuevos statuses correctos
5. **Cross-references table** (commit messages cite SOT)
6. **Anti-hallucination checklist** (5 rules)
7. **User approval** antes de Phase 2

---

### Phase 2 · Matt's volume ingestion (CEO-level demo) · ~2.5h impl + 30min checkpoint

**Por qué segunda**: depende de tabs structure de Phase 1 · pero high priority (Matt CEO ask).

#### Pre-flight (Phase 2)
- **Plan references**: Matt's ask section (Inbox Monitor + Auto-spawn + Manual upload) · TBDs #5/#7/#8 cerrados con A+D+E
- **Files a tocar**: `Transactions.tsx`, `Dashboard.tsx`, NEW `InboxMonitor.tsx`, NEW `ManualUploadModal.tsx` (or reuse QuoteConverter modal)
- **Riesgo**: medio (NEW components · auto-spawn timing puede romper si mal coded)

#### Sub-tareas (2.1 - 2.4)

**2.1 · Inbox Monitor widget** (~45min · Opción A) — Panel al inicio de Transactions
- Recent ingestion events list
- Counter "X documents today" + breakdown per source
- Auto-refresh cada 30s
- Files: NEW `src/components/inbox-monitor/InboxMonitorWidget.tsx` + integration en Transactions.tsx

**2.2 · Auto-spawn simulado** (~60min · Opción D)
- `setInterval` cada 60-90s · new doc with status `Ingesting` → auto-resolve después 4-6s
- Animación slide-in + toast
- Files: `Transactions.tsx` (hook integration)
- SOT: Matt's ask + Smart Comparator pattern

**2.3 · Manual upload edge-case** (~45min · Opción E · per-tab RFQ + PO)
- Botón `📤 Upload {RFQ | PO}` en toolbar de cada tab
- Sub-label diferenciado por rol (manufacturer "for documents not received via Inbox" vs dealer "send to manufacturer")
- Modal 4-step reusing QuoteConverter pattern
- Post-upload: doc aparece con status `Ingesting` → auto-resolve a `New` (RFQ) o `PO Received` (PO)
- Source asignada: `Manual` (edge-case)
- Files: `Transactions.tsx` button + reuse QuoteConverter modal
- SOT: K + TBDs #7/#8

**2.4 · Language alignment** (~15min)
- `ocr-running` status → `ingesting`
- Label "OCR Running" → "Ingesting"
- "Calculating…" → "Ingesting…"
- Files: STATUS_META map · cross-section grep

#### Commits sugeridos (Phase 2)
- `feat(Transactions): Inbox Monitor widget for Matt's volume ingestion demo`
- `feat(Transactions): auto-spawn new docs every 60-90s during demo`
- `feat(Transactions): manual upload modal in RFQ + PO tabs (edge-case)`
- `refactor(language): rename ocr-running → ingesting per Smart Comparator alignment`

#### Post-flight (Phase 2) · Test + Review checkpoint (~30min)

1. Inbox Monitor visible + actualiza en tiempo real
2. Auto-spawn dispara cada 60-90s + animación correcta
3. Manual upload modal funciona en RFQ + PO tabs (4 steps)
4. Manual upload assigns source `Manual` · doc aparece en list
5. TS check + DS sanity
6. **Demo simulation**: walk through "Matt's volume" scenario
7. User approval antes de Phase 3

---

### Phase 3 · RFQ + Quote views cleanup · ~2.5h impl + 30min checkpoint

#### Pre-flight (Phase 3)
- **Plan references**: D (RFQ audit), E (Quote audit), J (Reply CTA), D.7 (sample/textile audit)
- **Files**: `QuoteDetail.tsx`, `Transactions.tsx`, `ItemDetailsDrawer.tsx`

#### Sub-tareas (3.1 - 3.5)

**3.1 · RFQ Items page cleanup** (~40min)
- REMOVE columnas Net Price / Amount / Status / Source per-line
- REMOVE "Request sample" buttons
- KEEP: Part # / Model / Description / QTY
- Handle "unknown" placeholders (`—` muted)
- Files: RFQ Items component
- SOT: D.3 + Wendy 27:33 + 29:07

**3.2 · Quote detail per-line cleanup** (~45min)
- Apply L.21 column rename · `List Price` + `Extended` (was Net Price + Amount)
- REMOVE Discount per-line + Source per-line (E.0000.X)
- KEEP textile review chips + `✓ APPROVED` chip when applies
- REMOVE "Request sample" buttons (D.7)
- Files: `QuoteDetail.tsx`
- SOT: Wendy 38:40 + 39:30 + 37:45

**3.3 · Item Details Drawer cleanup** (~30min)
- REMOVE 3 boxes pricing (`NET PRICE / DISCOUNT / LIST PRICE`)
- REMOVE Validation panel
- KEEP single AMOUNT métrica top-right + Specs + AI suggestions
- Files: `ItemDetailsDrawer.tsx`
- SOT: PDF #8 + F.15.k

**3.4 · Mix revision numbers + seed cleanup** (~20min)
- Variar `revisionNumber` en seeds (mix #1/#2/#3)
- QT-1024 Pacific → `In Progress` (was Draft)
- QT-1025 NorthPoint → `Pending · textile review` (was Negotiating + sub-chip)
- QT-1022 Beacon Hill → MOVE a recentOrders como PO Received
- Add QT-1026 Expired (N.1.e para Dashboard pipeline)
- Files: `Transactions.tsx` seeds
- SOT: E.1.j + N.1.e + Wendy 34:36

**3.5 · Reply CTA en RFQ row + EmailDraftModal templates** (~25min)
- ADD Reply action button en RFQ rows
- Update `EmailDraftModal` con templates contextuales (D.2.b)
- Templates por tab: RFQ (Request more info / Acknowledge / Custom etc.)
- Files: `Transactions.tsx` + `EmailDraftModal.tsx`
- SOT: D.2 + J + Christian 27:01

#### Commits sugeridos (Phase 3)
- `refactor(RFQ): remove pricing from items page + handle unknowns per Wendy 27:33`
- `refactor(QuoteDetail): per-line cleanup · List Price/Extended + remove Discount/Source per Wendy 38:40`
- `refactor(ItemDrawer): remove pricing boxes + Validation panel per PDF #8`
- `chore(seeds): mix revision numbers + Quote seed cleanup E.1.j + add QT-1026 Expired`
- `feat(RFQ): Reply CTA + EmailDraftModal templates per tab D.2`

#### Post-flight (Phase 3) · Test + Review checkpoint (~30min)

1. RFQ Items page sin pricing · placeholders OK
2. Quote detail per-line muestra List Price + Extended (no Discount/Source)
3. Item Drawer sin 3 boxes pricing
4. Revisions mixed en seeds (visible #1/#2/#3)
5. Reply CTA en RFQ rows abre EmailDraftModal con templates
6. TS check + DS sanity
7. User approval antes de Phase 4

---

### Phase 4 · PO + Orders implementation · ~4h impl + 30min checkpoint

#### Pre-flight (Phase 4)
- **Plan references**: F (PO audit completo · F.0-F.15), F.2 + F.11 (Hybrid C Orders), F.0.1 (Deposit + Proforma), G (PDF cleanups), H (Email cleanup), L.20 (Tracking timeline)
- **Files**: `OrderDetail.tsx`, `Transactions.tsx`, `TrackingProgressModal.tsx`, PDF export modals

#### Sub-tareas (4.1 - 4.7)

**4.1 · PO tab statuses + restructure** (~45min)
- Apply 3 final statuses: `PO Received` / `More Information Required` / `Pending Deposit`
- Transform seed `recentOrders` (F.00.b · 9 entries · move 7 a Orders tab)
- Add 2 entries nuevas (`ORD-2058 More Info` + opcional `ORD-2059 Pending Deposit`)
- Fix header bug: "Recent Orders" → tab-aware (F.00.e)
- REMOVE Ship Date column en PO list view (F.10.d)
- Files: `Transactions.tsx`
- SOT: F.1 + F.00 + F.10

**4.2 · Orders tab implementation (NEW · Hybrid C)** (~60min)
- 5 primary statuses: Acknowledged / Shipped / Invoiced / Cancelled / CancelledWithFee
- Sub-phase chips: `In Production` / `Ready to Ship` (bajo Acknowledged), `In Transit` / `Delivered` (bajo Shipped)
- 7 seed entries moved desde PO tab + status reasign
- Files: `Transactions.tsx` + NEW Orders detail page logic
- SOT: F.2 + F.11.d Opción C aprobada

**4.3 · Orders detail page · Transactions Timeline + columns audit** (~45min)
- ADD Transactions Timeline section al top (F.11.f pattern HermanMiller)
- Information card: ADD `Planned Delivery` métrica (F.11.h)
- Per-line columns: Unit Price + Discount + Amount + Status (F.15)
- Sub-chips header: rename `REV #N` → `Revision # N`
- REMOVE `Convert to ACK` button del Order detail (F.15.h)
- Files: `OrderDetail.tsx`
- SOT: F.11.f + F.15

**4.4 · Tracking Progress timeline alignment** (~40min)
- Apply L.20.e Pattern B (event-based timeline)
- Steps: Acknowledgement Sent → Production Started → Ready to Ship → Shipped → In Transit → Delivered (→ Invoiced)
- Each step tagged con status primary lateral + sub-phase chips
- Smart Forecast section KEEP (AI moment)
- Files: `TrackingProgressModal.tsx` (verify exact name)
- SOT: L.20

**4.5 · Deposit Status section + Generate Proforma button** (~30min)
- ADD `Deposit Required` métrica en PO detail Information card (conditional)
- ADD `Deposit Status` section expandible en PO detail (4 lugares de F.0.1.c)
- ADD `Generate Proforma` button en PO detail (NOT Ack · per Wendy 41:16)
- REMOVE `Generate Proforma` button del Ack detail (revert part del commit 0cd44e8)
- Add seed fields `depositRequired: boolean`, `depositPct: number` (default 30)
- Files: `OrderDetail.tsx` (PO render branch) + `AckDetail.tsx` (revert button)
- SOT: F.0.1 + Wendy 41:16

**4.6 · PDF exports cleanup** (~30min)
- Quote PDF: REMOVE Nontaxable Subtotal / Taxable Subtotal / Tax lines (PDF #9)
- PO PDF: REMOVE DISC% column (PDF #10)
- Update terminology a Unit Price (L.21)
- Files: PDF Export modals (PEDExportModal et al)
- SOT: G + PDF #9 + #10

**4.7 · Email "Quote for Approval Draft" cleanup** (~15min)
- REMOVE línea "Approve here and we will convert it to a PO and request the production deposit"
- Files: EmailDraftModal templates · Quote approval template
- SOT: H + PDF #6

#### Commits sugeridos (Phase 4)
- `refactor(PO): 3 final statuses + seed transformation + Ship Date column REMOVE`
- `feat(Orders): NEW Orders tab with Hybrid C statuses + sub-phase chips`
- `feat(OrderDetail): Transactions Timeline pattern + Planned Delivery metric per HermanMiller F.11.f`
- `refactor(TrackingProgress): event-based timeline aligned with Hybrid C statuses per L.20`
- `feat(PO): Deposit Status section + Generate Proforma button per F.0.1 (move from Ack to PO)`
- `style(PDF): cleanup tax lines (Quote) + DISC column (PO) per PDF #9 #10`
- `style(email): remove 'Approve here · convert to PO' line per PDF #6`

#### Post-flight (Phase 4) · Test + Review checkpoint (~30min)

1. PO tab muestra 3 statuses · seed transformation OK
2. Orders tab visible con 5 statuses Hybrid C
3. Orders detail muestra Transactions Timeline
4. Tracking Progress timeline alineada con Hybrid C
5. Deposit + Proforma visible en PO detail (NO en Ack)
6. PDFs cleanup verificado
7. TS check + DS sanity
8. User approval antes de Phase 5

---

### Phase 5 · Ack + Reconciliation cleanup · ~3h impl + 30min checkpoint

#### Pre-flight (Phase 5)
- **Plan references**: L (Ack audit completo · L.0-L.21), L.7 + L.17 (AI detection), L.19 (3-Way Match), I (Reconciliation)
- **Files**: `AckDetail.tsx`, `AckReconciliationModal.tsx`, `Transactions.tsx`, `ItemDetailsDrawer.tsx`

#### Sub-tareas (5.1 - 5.7)

**5.1 · Ack seed + statuses cleanup** (~30min)
- `ackStages` → `['Pending', 'Partial', 'Confirmed']` (L.1 · already done en Phase 1)
- Seed transform: Ack-8839 (Confirmed) · Ack-8840 (Pending + sub-flag price mismatch) · Ack-8841 (Partial + sub-flag backorder)
- Sources cleanup (RPA/OCR → Email)
- Add `subFlag` field y `itemStatuses` array para per-line
- Files: `Transactions.tsx` seeds
- SOT: L.3 + L.17.f

**5.2 · Ack list view columns cleanup** (~30min)
- `VENDOR` → `DEALER` (en manufacturer view via useViewAs · L.16.f)
- REMOVE `DISCREPANCY` column dedicated (info absorbed in sub-flag)
- REMOVE `SOURCE` column per-row
- REMOVE `SHIPMENT #` column display
- ADD `PLANNED DELIVERY` column (renamed from Exp Ship Date · F.11.h)
- Status chips support sub-flag display (Pending · ⚠ price mismatch detected)
- Files: `Transactions.tsx` Ack tab render
- SOT: L.4 + L.16

**5.3 · Ack detail page + Information card** (~45min)
- Information card métricas: Ack Value / Linked Order / Line Items / Status + sub-flag / Planned Delivery (REMOVE Shipment #)
- Sub-chips header: KEEP Linked PO + Sales Rep · REMOVE Source · RENAME REV #N
- Per-line columns: Unit Price + Discount + Amount + Item-level Status (5 types)
- Action buttons cleanup: REMOVE Generate Proforma (movido a PO) · REMOVE Resolve buttons
- ADD `Notify dealer of changes` button
- Files: `AckDetail.tsx`
- SOT: L.5 + L.6 + L.10 + L.15

**5.4 · Item-level statuses + workflows** (~45min · Backorder + Substitution)
- ADD item-level statuses: Confirmed / Backordered / Substituted / Discontinued / Price Adjusted
- Conditional sub-info per status (ETA / Substitute SKU / Reason)
- Item Drawer · 5 different layouts (L.17.j)
- Status badge tokens (consultar MCP strata-ds antes de impl)
- Enriquecer Ack-8841 con compound case (backorder + substitution real F-SSC346030C)
- Files: `AckDetail.tsx` + `ItemDetailsDrawer.tsx` + `StatusBadge.tsx`
- SOT: L.17

**5.5 · 3-Way Match modal refinement** (~30min)
- RENAME title `3-Way Match · Reconciliation Hub` → `PO vs Acknowledgement · Reconciliation`
- REMOVE `INVOICE` column
- RENAME `Source of Truth` header → `Purchase Order`
- REMOVE `Resolve & Approve` button
- ADD `Notify dealer of exceptions` button (opens EmailDraftModal con template)
- Apply L.17 item-level status chips
- Update footer: `requires resolution` → `requires dealer notification`
- Files: `AckReconciliationModal.tsx`
- SOT: L.8 + L.19 + PDF #7 + #18

**5.6 · DiscrepancyResolver → DiscrepancyDetector rename** (~20min)
- Rename component + strings + AI badges
- Update detection panel layout (L.17.i pattern)
- REMOVE Accept Fix / Keep Original / Resolve buttons
- ADD Notify dealer + View details buttons
- Files: `AckDetail.tsx` + dependent components
- SOT: L.7 + L.17.i

**5.7 · Timeline cleanup** (~15min)
- REMOVE step `Resolved` (line 667)
- Verify 3 steps restantes: Order Entered → Acknowledgement Sent → In Production
- Files: `AckDetail.tsx`
- SOT: L.9

#### Commits sugeridos (Phase 5)
- `refactor(Ack): seed + statuses cleanup + sub-flag pattern per L.1 L.3`
- `refactor(Ack): list view columns · VENDOR→DEALER + remove DISCREPANCY/SOURCE/SHIPMENT per L.16`
- `refactor(AckDetail): Information card + per-line + remove resolve buttons per L.5 L.6 L.10`
- `feat(Ack): item-level statuses Backorder/Substitution/etc + Item Drawer per L.17`
- `refactor(AckReconciliation): PO vs Ack rename + remove Invoice column + Notify dealer per L.19`
- `refactor(Ack): DiscrepancyResolver → DiscrepancyDetector per L.7 L.17.i`
- `refactor(Ack): remove Resolved timeline step per L.9`

#### Post-flight (Phase 5) · Test + Review checkpoint (~30min)

1. Ack tab muestra 3 statuses + sub-flags (no Discrepancy as status)
2. Ack list view sin columnas removidas · VENDOR → DEALER en manufacturer view
3. Ack detail page sin Source · sin Shipment # · sin Generate Proforma
4. Item-level statuses funcionan (Backorder + Substitution visible en Ack-8841 compound case)
5. 3-Way Match modal renamed · sin Invoice · sin Resolve · CON Notify dealer
6. DiscrepancyDetector AI moment funcional sin action buttons
7. Timeline sin Resolved step
8. TS check + DS sanity (validar tokens via MCP strata-ds)
9. User approval antes de Phase 6

---

### Phase 6 · Shipping + Dashboard + Accessibility · ~2.5h impl + 30min checkpoint

#### Pre-flight (Phase 6)
- **Plan references**: F.12 (Shipping restructure), F.13 (accessibility), N + N.1 (Dashboard alignment)
- **Files**: `Shipping.tsx`, `Dashboard.tsx`, possibly `Transactions.tsx`

#### Sub-tareas (6.1 - 6.4)

**6.1 · Shipping tab integration + format alignment** (~60min)
- Convert `Shipping.tsx` standalone → sub-component renderable dentro de Transactions
- Layout alignment con PO tab pattern (F.12.b)
- KPI cards solo en sub-filter `Metrics` (decisión user)
- Columns audit (F.12.c): KEEP Shipment / Dealer&Project / ETA / Carrier / Tracking# / Status / Actions
- REMOVE Source per-line (sources cleanup applies)
- Add Quick Message action (D.2.a Shipping tab tiene)
- Files: `Shipping.tsx` (refactor) + `Transactions.tsx` (tab integration)
- SOT: F.12

**6.2 · Shipping accessibility cleanup** (~30min)
- REMOVE `per Wendy item 6` jargon (F.13.a Issue 1)
- Rewrite info panel verbose text (F.13.a Issue 2)
- Rename `REV #N` → `Revision # N` (cross-section)
- Validate contrast ratios + DS tokens (consultar MCP strata-ds)
- Validate aria-labels en interactive elements
- Files: `Shipping.tsx` text + tokens
- SOT: F.13

**6.3 · Dashboard alignment** (~45min)
- Quote pipeline bars: `In Progress / Pending / Sent / Expired` (N.1)
- Dashboard.tsx línea 111: `Valid Until` → `Expiration Date` (E.1.f.0)
- Cross-section audit: Net Price → Unit Price (L.21)
- Sources cleanup en filters/displays (B)
- Audit Order/RFQ/Ack pipelines del Dashboard si existen (N.1.g)
- Files: `Dashboard.tsx`
- SOT: N + N.1

**6.4 · Cross-section grep audit final** (~15min)
- Grep audit completo para missed references:
  - `Net Price` → 0 hits
  - `REV #` → 0 hits
  - `OCR` / `RPA` → 0 hits
  - `Valid Until` → 0 hits
  - `Negotiating` / `Approved` (en Quote context) → 0 hits
  - `Discrepancy` (como status) → 0 hits
- Files: cross-section
- SOT: verification post all phases

#### Commits sugeridos (Phase 6)
- `refactor(Shipping): convert standalone page to tab in Transactions per F.12`
- `style(Shipping): accessibility cleanup · jargon + contrast + aria per F.13`
- `refactor(Dashboard): Quote pipeline alignment + Expiration Date + Unit Price per N.1 L.21`
- `chore: cross-section grep audit · cleanup missed references`

#### Post-flight (Phase 6) · Test + Review checkpoint (~30min)

1. Shipping vive como tab dentro de Transactions (no más standalone page)
2. Shipping layout alineado con PO tab pattern
3. KPI cards solo en sub-filter Metrics
4. Accessibility: no `per Wendy` jargon · contrast OK · aria-labels presents
5. Dashboard Quote pipeline muestra 4 nuevos statuses
6. Dashboard cross-references actualizadas (Expiration Date · Unit Price · etc.)
7. Grep audit clean
8. User approval antes de Phase 7

---

### Phase 7 · Final verification + smoke test · ~1.5h

#### Sub-tareas (7.1 - 7.4)

**7.1 · TS check + DS sanity completo** (~20min)
- `npx tsc --noEmit` desde `inbound-outbound/` → 0 errors
- Grep `bg-(green|red|orange|amber|blue|yellow|indigo)-[0-9]` → 0 new matches
- Validate tokens via MCP strata-ds

**7.2 · Smoke flow end-to-end · Manufacturer view (Sara Chen)** (~30min)
- Dashboard → métricas OK con quote pipeline en nuevas statuses
- Transactions → 6 tabs visibles
- RFQ flow: New → Assign (In Review) → Request more info → Send quote
- Quote flow: status validation + Item Drawer sin pricing boxes
- PO flow: 3 statuses + Deposit + Proforma button
- Ack flow: detection (no resolution) + 3-Way Match (no Invoice)
- Orders flow: Hybrid C statuses + Transactions Timeline
- Shipping tab: tracking + notifications
- PDF exports: clean (no tax lines, no DISC column)
- Email drafts: clean (no "convert to PO" line)

**7.3 · Smoke flow · Dealer view (toggleable via useViewAs)** (~20min)
- Validar VENDOR/DEALER column rename
- Validar que NO hay resolution actions en Ack (consistency con manufacturer view)
- Validar upload modal sub-label diferente

**7.4 · Regression validation** (~20min)
- ORD-2056 delay scenario sigue funcionando (DelayAlertCard modal · etc.)
- Existing components no rompieron (Item Drawer · Email modal · Pipeline view)
- BFI/Officeworks demos NO afectadas (scoped a inbound-outbound)

#### Commit sugerido (Phase 7)
- `chore: final verification + smoke flow post-Neocon-review · TS + DS + E2E`

#### Final · Walkthrough antes de Sunday demo
- Demo simulation con Daniela + Wendy (si disponible)
- Capture feedback para hotfix si aplica

## Files to modify (consolidado por fase)

### Fase 1
- `src/Transactions.tsx` — recentRFQs, recentQuotes, recentOrders, recentAcknowledgments seeds; tabs definitions; lifecycleTab type; rfqStages/quoteStages/ackStages arrays + new orderStages
- `src/components/inbound-outbound/SourceBadge.tsx` — TransactionSource union type
- `src/QuoteConverter.tsx` — LIST_SEED sources
- `src/OrderDetail.tsx`, `src/QuoteDetail.tsx`, `src/AckDetail.tsx`, `src/Shipping.tsx` — source references en seeds
- `src/App.tsx` — routing: integrar Shipping en Transactions, remover ruta standalone

### Fase 2
- `src/QuoteDetail.tsx` (extensivo: per-line columns, RFQ branch)
- `src/components/manufacturer/ItemDetailsDrawer.tsx` — remover pricing boxes + Validation panel
- `src/Transactions.tsx` — RFQ row Reply action

### Fase 3
- Buscar PDF Export modal del Quote (probable `QuotePDFExportModal.tsx` o similar)
- Buscar PDF Export modal del PO (probable `POPDFExportModal.tsx` o similar)
- `src/QuoteDetail.tsx` o template del EmailDraftModal donde está el draft de approval

### Fase 4
- `src/AckDetail.tsx`
- `src/components/AckReconciliationModal.tsx`

## Out of scope (V1 · explícito de Wendy)

- **Dedicated sample/textile workflow** ("totally not even related, I don't think we need to account for that in what we're doing right now")
- **Rejected status para RFQ** (edge case, no vale el tiempo)
- **Lead time + payment terms columns** (future state)
- **Invoicing tab** (mencionado pero "if we can't, we can't")
- **SIF send capability** (Wendy: "I would think we would want to show here that we're able to send the SIF. But again, I don't know that we could do that at this point")
- **Manual upload affordance en RFQ/PO** (manufacturer view doesn't need it)
- **BFI/Officeworks demos** (sin tocar, este trabajo es scoped a inbound-outbound)

## Verification end-to-end (después de las 5 fases)

1. **TS check** desde `inbound-outbound/`: `npx tsc --noEmit` limpio
2. **Vite serve sin errores** en localhost:8086
3. **Flujo demo Sunday** (rol Manufacturer · Sara Chen):
   - Dashboard → métricas OK con quote pipeline en nuevas statuses
   - Transactions → 6 tabs visibles: RFQ → Quotes → POs → Acks → Orders → Shipping
   - RFQ tab → 4 statuses (New/In Review/Add'l Info/Sent), Reply action funciona, Items page sin precios
   - Quotes tab → statuses (In Progress/Pending/Sent/Expired), revisions mixed, Quote Detail per-line con List Price sin Discount/Amount, Item Drawer sin pricing boxes
   - PO tab → statuses (PO Received/More Info Required/Deposit Required), sin In production
   - Acks tab → statuses (Pending/Confirmed/Partial), sin Source column ni Shipment number, sin discrepancy resolution
   - Orders tab → statuses (Acknowledged/In Production/Ready/Shipped/Invoiced/Cancelled/Delivered)
   - Shipping tab → tabla de shipments con CTA Send notification
   - Quote PDF export → sin Tax lines
   - PO PDF export → sin Disc%
   - Email Quote Approval → sin línea "Approve here and we will convert..."
   - Reconciliation → "PO vs Acknowledgement" header, "Purchase Order" column (no más "Source of Truth"), sin Invoice column
   - Sources en todos lados: solo Email / Dealer Portal / NetSuite
4. **DS sanity**: grep clean
5. **Regression**: ORD-2056 delay scenario sigue funcionando (DelayAlertCard modal, etc.)

## Notas sociales para el record

- La reunión fue colaborativa y constructiva. Wendy lideró con claridad y autoridad — sus decisiones son las que cuentan.
- Christian arbitró bien la implementación (sources, OCR-no-es-source, reply action) y reconoció cuando Wendy lo corrigió.
- Asly y Kenya van a aportar fixtures reales (emails de RFQ) — input externo pendiente.
- Magda y Leydi contribuyeron con conocimiento de negocio (lead time, partes discontinuadas) que se documentó como future state.
- La línea negativa de Christian sobre Diego del thread anterior NO se replicó en esta reunión — ambiente productivo y al final hubo "happy birthday" a Wendy.

---

**Próximo paso**: aprobar este plan, cerrar los 4 TBDs con Wendy si es posible, y arrancar **Fase 1** (foundation). Si Wendy confirma "List Price" rápido, también se puede arrancar Fase 2 en paralelo.
