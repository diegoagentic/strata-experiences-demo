# BFI Furniture — Análisis Multi-Rol y Plan de Implementación

> Basado en: bfi-sot.md (AS-IS completo) + demos Strata existentes (MBI, Leland) + feedback de Danny & Sales Director

---

## Parte 1 — Estado Actual del Flujo (AS-IS mapeado)

Los dos procesos en scope están documentados en bfi-sot.md:
- **Process 1 (Agency Fee):** 13 fases, 38+ tareas, 10 pain points priorizados. Project Manager pain points #1 (CPR) y #2 (agency fee blind spot) identificados.
- **Process 2 (Product Receiving):** 9 etapas, 7 pain points. Gate crítico: 100% received antes de work order.
- **7 conexiones cross-proceso** documentadas. CPR reconciliation es el closing event compartido, payment-critical.
- **Excluido:** Ack Checking (Diana — change management risk).
- **AI Readiness:** 2.2/5 — Explorer tier. Claims Analyst es la early adopter crítica. Project Manager tiene 5 prerequisites.

---

## Parte 2 — Análisis por Rol

---

### 2.1 Business Intelligence (BI)

**Lo que ve:**
- $7M en backlog CoNY a 0% GP sin distinción entre "direct bill agency fee pending" vs "regular 0-margin order" — invisible en el dashboard actual de CORE.
- Claims Analyst mantiene un Excel manual con order#, agency, ship date. Ese Excel es la única fuente de tracking fuera de CORE. No hay reporting automático del lifecycle de una orden CoNY.
- Power BI existe y lo administra Avanto/Sales Coordinator — potencial canal de distribución de métricas.
- El 75% de CPR discrepancies es una tasa medible y valiosa: el equipo no la tiene capturada como KPI, pero existe como patrón estructural.

**Oportunidades BI para el demo:**
- **CoNY Backlog Dashboard:** Distinguir en tiempo real entre "direct bill agency fee pending" y "regular 0%". Mostrar valor esperado del agency fee por orden.
- **CPR Discrepancy Rate Tracker:** Visualizar % de órdenes que requieren revisión, tiempo promedio de resolución, impacto en cash flow.
- **30-Day Storage Window Monitor:** Countdown por orden desde arrival en WIG. Alertas automáticas a los 20 días.
- **Claims Analyst Workload View:** Cuántas órdenes activas, cuántas pendientes de 100% received, cuántas en CPR reconciliation.

**Recomendación para demo:** El dashboard de CoNY backlog con agency fee proyectado es la imagen de impacto más fuerte — Project Manager puede ver en tiempo real lo que hoy es opaco.

---

### 2.2 Customer Experience (CX)

**Lo que ve:**
- El cliente de BFI (City of New York — city agencies) experimenta:
  - Incertidumbre sobre status de su orden (Operations Manager no puede comunicar)
  - Delays en scheduling de delivery/instalación por cascada del receiving lag
  - Variación en documentación requerida por agencia (no sistematizada)
- BFI experimenta:
  - Claims Analyst como cuello de botella único — single point of failure para el cliente CoNY
  - Operations Manager recibiendo preguntas de status que no puede responder
  - Respuestas reactivas en lugar de proactivas

**Oportunidades CX:**
- Notificación automática a Operations Manager (y potencialmente al city agency contact) cuando una orden es 100% received — reemplaza el vacío de comunicación antes del paper handoff.
- Dashboard de status visible para Operations Manager (no requiere que Claims Analyst le informe manualmente).
- Reducción de lead time total: menos tiempo entre receiving y scheduling = mejor experiencia para la city agency.

**Recomendación para demo:** Mostrar el "Operations Manager moment" — antes vs. después. Antes: se entera cuando Claims Analyst le trae papel. Después: recibe notificación en CORE o email cuando su orden está lista.

---

### 2.3 Product Owner

**Lo que ve:**
- **Scope real para MVP:** CPR reconciliation + agency fee calculator son los dos pain points que Project Manager nombró explícitamente. Todo lo demás es secundario.
- **Gate de factibilidad pendiente:** Warehouse receiving (OCR) no tiene luz verde aún — Sales Director dijo que el receiving "is an animal of its own." No se puede incluir en MVP hasta que se valide con document samples reales.
- **Dependencies:**
  - CORE API License — no activa hoy. Sin ella, no hay integración directa con CORE. ¿Puede ser un blocker?
  - Acceso a contract T-codes de Miller Knoll (Noel & Miller website) — necesario para agency fee calculator.
  - Document samples de WIG (labor quotes + receiving docs) — Manager Boyle es el owner de conseguirlos.
- **Riesgo de scope creep:** El análisis cross-proceso muestra 7 conexiones. Hay tentación de resolver todo. El PO debe proteger el scope: CPR + agency fee calculator primero, receiving después.
- **Change management risk:** Donna y Diana no respondieron questionnaire. Cualquier herramienta que toque sus workflows necesita un plan de adopción separado.

**Definición de MVP sugerida:**
1. Agency fee calculator (per-line, desde contrato CoNY)
2. CPR reconciliation assistant (comparar CPR hours vs quoted hours, flagear discrepancias)
3. Unified order status view para Claims Analyst (y Operations Manager como view-only)

---

### 2.4 UX Designer

**Lo que ve:**
- **Claims Analyst es la única usuaria que importa en producción.** Si Claims Analyst no lo usa, nada funciona. Diseñar para su modelo mental, no para el de Project Manager o el de Avanto.
- **Claims Analyst's success metric:** "Seeing it completing the task start to finish." Quiere ver el resultado completo, no un wizard paso a paso. Implica: flujos cortos, confirmación clara del outcome, sin pasos redundantes.
- **Project Manager's adoption prerequisites** son un brief de UX:
  1. Demo con órdenes reales → el demo debe usar datos BFI-like, no genéricos
  2. Velocidad → sin loading screens innecesarios, respuesta percibida < 2 segundos
  3. Override capability → siempre debe haber un "editar" o "rechazar sugerencia de AI"
  4. Walkthrough one-on-one → el onboarding es conversacional, no un manual
  5. Entender errores → cuando AI se equivoca, el error debe ser comprensible, no un mensaje técnico
- **Directiva CEO Strata:** UI minimalista. Ir al punto. Evitar ruido visual. Back-office/ops. Los demos MBI son la referencia de densidad correcta.
- **Anti-pattern a evitar (lección MBI):** Demasiadas métricas en pantalla al mismo tiempo, conceptos no resueltos técnicamente que generan preguntas en el demo, tabs que no demuestran valor inmediato.

**Principios UX para BFI demo:**
- Una acción principal por pantalla
- El AI sugiere, Claims Analyst aprueba (override siempre visible)
- El estado de la orden como ancla visual (received%, CPR status, fee calculated)
- Sin jerga técnica en la UI — términos de Claims Analyst ("work order", "CPR", "agency fee")
- Dark-mode aware, tokens semánticos del DS (sin hardcoded)

---

### 2.5 Experto en Procesos B2B (Análisis de flujo)

**Lo que ve:**
- **El proceso es lineal pero con muchas ramas de excepción.** El happy path de Agency Fee tiene ~13 pasos; pero cada uno tiene un "si hay restricción", "si hay discrepancia", "si el formato es diferente" — la complejidad real está en las excepciones.
- **El modelo direct bill es estructuralmente diferente a un dealer estándar.** BFI no tiene margen (0% GP). Su valor es el agency fee. Esto crea un proceso no estándar que las herramientas genéricas (incluyendo CORE) no soportan — de ahí el cálculo manual de descuento.
- **El cuello de botella no es la AI — es el proceso.** Darya lo dijo en la reunión: "sin cambiar el proceso, ninguna solución AI funcionará." Donna's resistance es un blocker de proceso, no de tecnología.
- **WIG es un proveedor crítico sin integración.** Sus Word docs son la única señal de que el producto llegó. Mientras WIG no tenga integración directa con CORE, la dependencia de AP Coordinator persiste.
- **El 30-day storage window es una restricción financiera de primer orden** que debería ser un KPI monitoreado activamente, no un ítem de Excel.
- **La tasa de discrepancia en CPR (75%)** indica que el "proceso de cotización de labor" no refleja la realidad — el problema está upstream (Workplace no cotiza bien), no solo en la reconciliación.

**Recomendación:** Cualquier propuesta de AI debe ir acompañada de una propuesta de proceso rediseñado. Strata puede calcular el fee, pero si el proceso de intake de labor quotes no se estandariza, el 75% de discrepancias persiste.

---

### 2.6 Stakeholders MBI — Perspectiva de Danny & Sales Director (correcciones del mundo real)

**Strata Sales Director — SME Operations:**
- "Warehouse receiving is an animal of its own." OCR nunca funcionó en Audubon. No comprometerse con OCR de documentos de baja calidad hasta ver los docs reales.
- "The agency fee calculation itself is doable. It's their process that's making it difficult." → El AI puede calcular el fee, pero el proceso alrededor necesita rediseñarse.
- Su equipo ya soporta a BFI (2 personas en PC role) → tiene contexto real del día a día, no solo lo del assessment.
- Señal clave: reacción de "wow, this is really complicated" en la reunión de Apr 30 — hay complejidad oculta que el BPMN no captura completamente.

**Danny Bermudez — Relación con Project Manager:**
- Project Manager confía en el equipo vía Sales Coordinator y Sales Lead. La presentación debe ir por ese canal, no cold.
- Project Manager es "very like, oh, limited to let people do or show things to her" — hay que construir confianza incremental.
- La presentación no debe sonar como "vamos a reemplazar a tu equipo" — debe sonar como "vamos a darles superpoderes."

**Darya Lukyanchuk — Assessment Lead:**
- El outcome puede ser zero AI si el proceso no está listo. No prometer AI donde no es factible.
- La propuesta debe incluir el diagnóstico honesto del proceso + la recomendación de redesign + el AI layer encima.
- Positioning: "Sin cambiar el proceso, ninguna solución AI funcionará. Y nosotros podemos ayudar con ambas."

**Lecciones aplicadas del demo MBI:**
- Los flows de MBI se iteraron múltiples veces con stakeholders reales antes de estabilizarse.
- El feedback de Sales Director y Danny en MBI fue sobre accuracy del proceso — en BFI el mismo riesgo existe: si el demo muestra algo que BFI sabe que es incorrecto, pierde credibilidad inmediatamente.
- El demo MBI usa datos ficticios pero realistas. Para BFI, la fidelidad de los datos es crítica — Project Manager quiere "real orders" en el demo.

---

### 2.7 Experto en IA — ¿Cómo puede ayudar la IA que venimos generando en demos Strata?

**Inventario de AI generada en demos Strata:**

| Componente Strata | Qué hace | Aplicación en BFI |
|---|---|---|
| **AccountingMorningQueue** (MBI) | Queue de excepiones AP con AI triage, razones, acciones sugeridas | Agency Fee: Queue de órdenes CoNY pendientes con status (pricing verification, discount pending, CPR pending) |
| **NonEDIReconcilerScene** (MBI) | Revisión línea por línea de facturas con discrepancias AI-detectadas | CPR Reconciliation: comparar horas CPR vs quoted, línea por línea, con AI marcando discrepancias |
| **ARAgingReviewScene** (MBI) | Review de aging con AI-suggested actions por cuenta | Agency Fee Blind Spot: review de fees esperados vs recibidos de Miller Knoll, línea por línea |
| **AISpecCheckSimulation** (Quotes) | Validación AI de BOM contra specs, con decisiones y recap | Agency Fee Calculator: validar pricing de SIF contra contrato CoNY T-codes, retornar corrected pricing |
| **MBIWizardShell** | Shell de wizard 2-step con tour steps, nav, persona badge | Shell reutilizable para demo BFI — 2 tabs (Agency Fee / Receiving), 2-3 steps cada uno |
| **MBIPersonaBadge** | Badge de persona con nombre + rol + tone | Account Manager DeMar · CoNY Account Lead |
| **MBIModuleHeader** | Header con módulo, tint, outcome statement | "Claims Analyst recupera 4h diarias — fee calculado automáticamente, CPR reconciled antes del Friday." |
| **ReasonDialog/MBIReasonModal** | Modal de escalación con categorías + notas | Override AI: cuando Claims Analyst no está de acuerdo con el fee calculado, puede editarlo con razón |
| **DataSourcesBar** | Barra de fuentes de datos (DS tokens, specs) | Agency Fee: mostrar fuentes (Contrato CoNY, OmniQuote, CORE) |

**Qué construir de cero para BFI:**
1. **CPR Reconciliation Scene** — tabla de horas CPR vs quoted por línea, con AI flagging y override inline (análogo a NonEDIReconcilerScene pero para labor hours)
2. **Agency Fee Calculator Scene** — ingresa SIF lines, AI calcula expected fee por T-code del contrato, muestra proyectado vs recibido de Receiving Coordinator Bos
3. **CoNY Order Monitor** — status view por orden (received%, CPR status, fee calculated, days remaining in 30-day window)
4. **WIG Document Parser Scene** — simulación de upload de Word doc de WIG → extracción estructurada automática → CORE entry preview

**Lo que podemos reusar directamente (bajo costo):**
- MBIWizardShell — el shell del demo BFI
- MBIPersonaBadge — Account Manager DeMar
- MBIModuleHeader — con outcome text BFI-specific
- Patrón de tour steps (demoStepId → wizard index sync)
- ARAgingWrapScene como referencia para el "wrap up" screen de CPR resolved

---

### 2.8 Tech Lead

**Evaluación técnica:**

| Item | Estado | Riesgo |
|---|---|---|
| CORE API License | **No activa.** Blocker para integración real. | Alto — sin API, no hay lectura/escritura en CORE. Para el demo: mock data. |
| OmniQuote integration | Email-driven hoy. ¿Tiene API? No confirmado. | Medio — alternativa: AI parsea el corrected SIF que OmniQuote envía por email. |
| Omni (HM portal) integration | EDI saliente desde CORE ya existe. ¿Shipment notification feed? | Medio — la alternativa de packing list pull desde Omni ya fue evaluada. |
| WIG Word doc parsing | Formato consistente (Word). Parseable. | Bajo-medio — LLM puede extraer carton count + packing slip data. |
| FedEx tracking detection | Requiere acceso a tracking data (FedEx API o HM Omni feed). | Medio — dependencia en fuente de datos externa. |
| CPR docs format | ¿Son PDFs estructurados o escaneados? No confirmado. | Alto si escaneados — OCR risk. Necesita doc samples de Manager Boyle. |
| R Drive (VPN required) | No cloud. Acceso requiere VPN o migración. | Bajo para el demo (mock). Alto para producción. |

**Para el demo:** Todo es mock data — no se necesita integración real. El stack del demo es React + TypeScript + Tailwind (demo-2026-strata). Los componentes Strata están disponibles.

**Deuda técnica a anticipar en producción:**
- Activar CORE API License (prerequisite #1)
- Definir canal de integración con WIG (webhook vs. email parsing)
- Validar formato de CPR docs antes de commitear a extraction approach
- Evaluar Omni API para packing list pull

---

### 2.9 QA

**Casos de prueba críticos para el demo:**

| Escenario | Qué validar |
|---|---|
| Happy path — Agency Fee | Orden CoNY → SIF upload → AI calcula expected fee → Claims Analyst aprueba → CPR match → orden cierra |
| CPR discrepancy (75% case) | AI detecta discrepancia quoted vs CPR hours → Claims Analyst overridea → Approver notificado |
| FedEx gap detection | Orden con FedEx shipment → AI detecta ausencia de WIG confirmation → alert a Claims Analyst con POD chain |
| Agency fee mismatch vs Receiving Coordinator Bos | AI proyecta fee X, Receiving Coordinator envía fee Y → dashboard muestra discrepancia → Claims Analyst puede flag |
| Partial receiving | Orden con 3 de 5 líneas received → gate no se abre → Claims Analyst ve qué falta |
| Override AI decision | Claims Analyst no está de acuerdo con el fee calculado → puede editar con razón → se registra |
| 30-day window warning | Orden a 22 días en WIG → alert visual en dashboard → Claims Analyst puede priorizar |

**Datos de prueba:** Usar órdenes BFI-like (T-codes de contrato CoNY, labor categories reales, agencias reales — City of NY, Teamsters, Carpenters). Project Manager espera "real orders" en el demo.

---

## Parte 3 — Plan de Implementación por Fases

> Principio rector: primero CPR + agency fee calculator (Project Manager's #1 y #2), luego receiving. No comprometer OCR hasta ver document samples.

---

### Fase 0 — Validación pre-demo (Ahora → esta semana)

| Tarea | Owner | Notas |
|---|---|---|
| Obtener document samples de WIG (labor quotes + receiving docs) | Manager Boyle → Product Manager Pen | Sin esto no se puede confirmar approach para WIG parsing |
| Confirmar formato de CPR docs (structured PDF vs scanned) | Account Manager DeMar → Senior Estimator | Define si OCR es necesario o no para CPR |
| Validar acceso a T-codes del contrato CoNY | Senior Estimator / Sales Coordinator | Noel & Miller website — ¿son accesibles sin login? |
| Confirmar status CORE API License | Avanto Tech | Blocker para producción (no para el demo) |
| Definir datos de prueba para el demo | Diego + Senior Estimator | Órdenes BFI-like con números realistas |

---

### Fase 1 — Demo MVP (Esta semana → siguiente)

**Objetivo:** Demo funcional que muestre los 2 pain points de Project Manager en acción. Minimalist UI, datos realistas, Claims Analyst como persona.

**Componentes a construir:**

| Componente | Base existente | Esfuerzo |
|---|---|---|
| `BFIAccountingPage` (shell) | MBIAccountingPage | Bajo — copiar estructura, cambiar tabs |
| `BFIPersonaBadge` (Account Manager DeMar) | MBIPersonaBadge | Mínimo |
| `AgencyFeeCalculatorScene` | AISpecCheckSimulation | Medio — adaptar flujo de validación |
| `CPRReconciliationScene` | NonEDIReconcilerScene | Medio — tabla de hours con AI diff |
| `CoNYOrderMonitorScene` | ARAgingReviewScene | Medio — adaptar a order status view |
| `BFIWizardShell` + tour steps | MBIWizardShell | Bajo — reusar casi completamente |

**Flow del demo (2 tabs, 2 steps cada uno):**
- Tab "Agency Fee": Step 1 → Agency Fee Calculator · Step 2 → CPR Reconciliation
- Tab "Receiving": Step 1 → Order Status Monitor · Step 2 → Work Order Dispatch (Operations Manager)

**Tour steps:** `b1.1` (AF calculator), `b1.2` (CPR), `b1.3` (order monitor), `b1.4` (Operations Manager dispatch)

---

### Fase 2 — Refinamiento con feedback (Post-demo → 2 semanas)

- Integrar feedback de Project Manager y Claims Analyst del demo
- Validar datos de CPR + WIG docs reales (si llegan antes)
- Decidir approach para receiving (OCR vs Omni packing list pull)
- Agregar `WIGDocumentParserScene` si doc samples son favorables
- Preparar presentación ejecutiva (Project Manager + Sales Coordinator channel)

---

### Fase 3 — Producción (Post-presentación → con cliente)

| Prerequisite | Owner |
|---|---|
| CORE API License activada | BFI + Avanto |
| T-codes del contrato CoNY accesibles en sistema | BFI (Project Manager / Approver) |
| WIG integration channel definido | Avanto Tech + WIG |
| CPR doc format confirmado | Claims Analyst + Approver |
| Change management plan para Donna | Project Manager + Sales Coordinator |
| Claims Analyst onboarding (one-on-one, datos reales) | Senior Estimator + Sales Coordinator |

---

## Resumen ejecutivo para el demo

**Qué mostramos:** Claims Analyst recupera 3-4h diarias. Strata calcula el agency fee por línea (Project Manager's blind spot eliminado), detecta discrepancias CPR automáticamente (Project Manager's #1 pain point resuelto), y le da a Operations Manager visibilidad sin que Claims Analyst tenga que imprimir nada.

**Qué NO mostramos en v1:** OCR de warehouse documents (pending feasibility). Integración real con CORE (pending API license). Ack checking (Diana — excluded).

**Canal de presentación:** Sales Coordinator Young + Sales Lead → Project Manager Kerpchar. Demo con datos BFI-like, no genéricos.
