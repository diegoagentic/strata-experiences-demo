# BFI Furniture — Source of Truth (Strata AI Assessment)

> Última actualización: 2026-05-06
> Fuentes: 10 PDFs de proceso (BPMN + docs), emails de socialización (Apr 30 – May 1), transcripción reunión Apr 30, Notion AS-IS pages (Agency Fee + Product Receiving), AI Readiness Report (Apr 2026), Kickoff session transcript (Apr 8).

---

## 1. Empresa

| Campo | Valor |
|---|---|
| Cliente | BFI Furniture (dealer) — MillerKnoll Certified Dealer, Women Owned |
| HQ | Elizabeth, New Jersey |
| Empleados | ~50 (redujo de 65 en 8 años mientras duplicó volumen de revenue) |
| Revenue estimado | ~$25–30M+ |
| Mercado principal | City of New York (CoNY) + Central/Northern NJ |
| Fabricante único (CoNY) | Miller Knoll (ex Herman Miller) |
| Sistema core | RPC CORE (ERP) |
| Modelo de negocio CoNY | Miller Knoll tiene contrato directo con CoNY. BFI facilita la venta (dealer holding the paper). BFI cobra agency fee separado a HM. |
| Sectores | Corporate, gobierno, healthcare, higher ed, K-12, real estate, architecture/design |
| AI Readiness | 2.2/5.0 — AI Explorer tier |

**Servicios:** consulting, space solutions, project management, installation & delivery (outsourced a WIG), service & warranty, liquidation.

---

## 2. Personas clave

| Persona | Rol | Notas críticas |
|---|---|---|
| **Kate Kerpchar** | President & CEO | Stakeholder principal. Define scope. Confía en Jessica y Matt. Protectora de su equipo. Trust threshold: 5/10. 5 adoption prerequisites. |
| **Lauren DeMarco** | CoNY Account Lead / Data Coordinator | Propietaria end-to-end de ambos procesos en scope. Trust threshold: 8/10 — early adopter. Proceso CoNY vive casi completamente con ella. |
| **Michael Boyle** | Director Strategic Accounts & PM | Revisa labor quotes, relays CPR revisions a Nancy Bos. Boss de Lauren. Contacto para document samples de receiving. |
| **Jessica Young** (Avanto) | Sales Assistant embedded en BFI | Canal de confianza clave. Propuso los flows al assessment. Conoce CORE y los procesos. Habla ambos lenguajes (Avanto + BFI). |
| **Wendy Marchuck** (Avanto) | SME — Operations | Su equipo soporta BFI actualmente (2 personas PC). Experta en direct bill y warehouse. SME crítica para feasibility. |
| **Lena Cisowski** | BFI — Receiving (company-wide) | Ingresa confirmaciones de WIG en CORE. Sin SLA. Puede tardar hasta 7 días. No notifica a Lauren cuando hay 100% receipt. |
| **Diana Bonilla** | Acknowledgement Checker | **EXCLUIDA del scope** — Kate no quiere que sepa del AI assessment. Change management risk alto. |
| **Donna Banks** | Director of Sales Administration | Supervisa sales admins. Resistente al cambio ("knows everything, doesn't want to hear anything"). No respondió questionnaire. Cámara apagada en kickoff. |
| **Patricia Hilger** | Finance / AR | Aplica el agency fee, cierra la orden en CORE. No respondió questionnaire. |
| **Walter Goley** | PM CoNY (BFI) | Zero visibilidad del proceso hasta que Lauren le entrega el work order impreso. No puede pre-coordinar con la agencia. |
| **Nancy Bos** | Invoice Processor — Miller Knoll (CoNY) | BFI depende de sus datos de agency fee sin poder verificarlos (blind spot). Recibe labor revision relay vía Michael. |
| **Andy** | Contacto Lauren en Miller Knoll | Fuente de Proof of Delivery (POD) para shipments FedEx no confirmados por WIG. |
| **Patrick Dunne** | COO | No respondió AI Readiness questionnaire. |
| **Matt** (Avanto) | Relación ejecutiva | Canal de presentación recomendado junto con Jessica. |

---

## 3. Sistemas

| Sistema | Función |
|---|---|
| **CORE (RPC)** | Sistema principal de negocio. Órdenes, backlog, templates. No auto-calcula descuentos. Tiene CORE Open Order Dashboard (received%, acknowledged%, ticketed%, delivered%) — Lauren no lo usaba hasta sesión Apr 21. |
| **OmniQuote Tools** | Validación de precios vs contrato CoNY. Email-driven (upload SIF → esperar email → download corrected SIF). |
| **Omni (HM portal)** | Portal Miller Knoll. Recibe EDI desde CORE. Genera customer acceptance forms. Fuente de shipment notifications. |
| **R Drive** | Servidor local (no cloud). Requiere VPN. Almacena PMO docs, POs, labor SIFs. |
| **Excel manual** | Tracker de órdenes CoNY (order#, agency, ship date) + reporte mensual. Sin integración con CORE. Guardado en R Drive / CNY Monthly Reports. |
| **EDI** | Transmisión automática CORE → Omni al crear orden. |
| **Power BI** | Reporting financiero (administrado por Avanto/Jessica). |
| **CET** | Usado por design team para spec/quoting, alimenta order flow. |
| **WIG Word docs** | Documentos Word de confirmación de receiving que envía WIG. Pág 1: número WIG + carton count. Páginas siguientes: packing slips originales. |

---

## 4. Scope del assessment

| Proceso | Estado |
|---|---|
| Agency Fee / Direct Bill Pricing Verification | ✅ EN SCOPE |
| Product Receiving / Warehouse Receiving | ✅ EN SCOPE |
| Acknowledgement Checking (Diana) | ❌ EXCLUIDO — pedido de Kate |

**Restricciones del cliente:**
- Acceso limitado a stakeholders (Kate decidió quién puede participar)
- Resistencia interna (Donna, Diana — no involucradas)
- Firma física con tinta requerida por CoNY (no digital)
- Labor bajo reglas sindicales de NYC
- R Drive local + VPN (no cloud-ready)
- Deadline: ~2 semanas para entregable al cliente

---

## 5. Proceso 1 — Agency Fee / Direct Bill Pricing Verification

**Actores:** Lauren De Mark (principal), Michael Boyle (labor), Patricia (finance)
**Modelo:** cost = sale, 0% GP en order entry. Agency fee cobrado después separado a Miller Knoll.

### 5a. Flujo de tareas

**Fase A — Quote Intake**
1. Miller Knoll designer envía quote request a Lauren por email (PDF + planos arquitectónicos + ZIP)
2. Lauren crea quote/order number en CORE, responde al designer confirmando + incluye quote number
3. **Pain point:** 100% manual, email-driven. Sin system intake, sin queue automatizado.

**Fase B — Pricing Verification**
4. Lauren sube SIF del designer a OmniQuote
5. OmniQuote valida precios vs contrato CoNY, devuelve corrected SIF + quote comparison (por email)
6. Lauren descarga corrected SIF, lo re-sube a CORE
7. **Pain point:** Ciclo manual upload→wait→download→re-upload para CADA orden. Precio debe ser exacto (no higher, no lower).

**Fase C — Restricciones y tipo de contrato**
8. Si hay restricted items: screenshot + email al designer → espera resolución Miller Knoll
9. Identifica tipo de contrato: City contract vs State contract → set order type = "third party bill"

**Fase D — Discount Calculation (0% GP)**
10. Fórmula manual: `descuento = (sale ÷ list) - 1` — Lauren lo calcula para CADA orden, CADA línea
11. Ingresa descuento en CORE + agrega true-up template line para garantizar cost = sale ($0 GP)
12. **Pain point crítico:** CORE no auto-calcula el descuento desde el porcentaje del contrato. Cálculo 100% manual.
13. **Pain point:** El backlog de CoNY muestra $7M a 0% GP sin distinción entre "direct bill agency fee pending" y "regular 0-margin order." Sin visibilidad.

**Fase E — Labor Quote (en paralelo con Fase B/C/D)**
14. Lauren solicita a Workplace (WIC) labor quote: inside delivery, installation (Teamsters, OT differential, Carpenters, OT differential), strike truck charges (si >600 cubes — 100% BFI profit)
15. Workplace devuelve labor quote (formato no estandarizado)
16. Michael Boyle revisa y categoriza manualmente las líneas
17. Lauren sube SIF template de labor desde CORE, ingresa manualmente los números de Michael
18. **Pain point:** Sin formato estándar de intake. Michael debe extraer y categorizar a mano desde cualquier formato que mande Workplace.

**Fase F — Order Entry y tracking**
19. Lauren confirma receipt con cliente, clarifica fecha de entrega
20. Dropea PMO en R Drive (local, VPN)
21. Ingresa orden completa en CORE (flagged: third party bill)
22. Orden EDI automático CORE → Omni. Miller Knoll crea customer acceptance form en Omni.
23. Lauren registra order number + agency + ship date en Excel manual + reporte mensual
24. **Pain point:** Tracking fragmentado: CORE + R Drive + Excel + monthly report. Sin integración.
25. **Pain point:** Order number matching extremadamente lento — cada city agency tiene su propio numbering system; debe matchearse manualmente al CORE order number.

**Fase G — Acknowledgement Review** *(EXCLUIDA)*
26. Diana revisa EDI acknowledgement desde Omni (~2 órdenes/semana con preguntas)
27. Si hay discrepancia alta → Diana acepta precio menor. Si baja → Lauren contacta Miller Knoll.

**Fase H — Delivery, Installation, Labor Revision**
28. Lauren monitorea receiving status en CORE. Espera "100% receiving" call.
29. Imprime 2 versiones del documento (warehouse + Walter) — CoNY requiere firma física con tinta.
30. Entrega a Walter (desconectado hasta este punto).
31. Coordina delivery/installation con city agency. Revisa labor hours en CORE.
32. Aplica fees sindicales (CoNY es union).

**Fase I — CPR Reconciliation** ⭐ PAIN POINT #1 DE KATE
33. Michael relays labor revision a Nancy Boss (Miller Knoll). Nancy envía revision back.
34. Lauren reconcilia **Certified Payroll Records (CPR) vs installation quote** — 100% manual.
35. No puede comenzar hasta fin de semana/trabajo completado.
36. **~75% de las veces** las horas cotizadas difieren de las facturadas → requiere revisión antes de poder facturar.
37. Lauren logea en Omni, imprime Miller Knoll invoices, envía a Patricia.

**Fase J — Agency Fee & Close**
38. Patricia aplica el agency fee y cierra la orden en CORE.
39. **Pain point:** BFI no puede verificar si los datos de Nancy (Miller Knoll) son correctos. **Blind spot de agency fee.** ⭐ PAIN POINT #2 DE KATE

### 5b. Pain points — resumen priorizado

| # | Pain Point | Impacto | Prioridad Kate |
|---|---|---|---|
| 1 | CPR vs installation hours: 100% manual, ~75% discrepancia, bloquea facturación | Alto | ⭐ #1 |
| 2 | Agency fee verification blind spot (dependen de Nancy, sin verificación independiente) | Alto | ⭐ #2 |
| 3 | OmniQuote upload cycle manual por cada orden | Medio-alto | — |
| 4 | Discount calc manual (0% GP) para cada orden/línea | Medio | — |
| 5 | $7M backlog sin visibilidad de direct bill vs regular 0-margin | Medio | — |
| 6 | Quote intake sin system queue (email-driven) | Medio | — |
| 7 | Labor quote formato no estandarizado | Medio | — |
| 8 | Order tracking fragmentado (CORE + R Drive + Excel + report) | Medio | — |
| 9 | Order number matching manual cross-agency | Bajo-medio | — |
| 10 | Walter desconectado hasta entrega física | Bajo | — |

---

## 6. Proceso 2 — Product Receiving: Third-Party Warehouse (CoNY / WIG)

**Warehouse:** WIG = Workplace Installation Group — tercero principal para CoNY. BFI no tiene instalación ni warehouse propio.
**Actores:** Lauren DeMarco (verifica + gestiona), Lena Cisowski (ingresa en CORE), WIG staff (confirman physical receipt), Walter Goley (PM, recibe work order), Michael Boyle (coordina CPR relay).

**Contexto:** Cubre desde que el producto llega a WIG hasta que Lauren imprime el work order y se lo entrega a Walter. La mayor parte de la logística es externa (WIG). Lauren es el cuello de botella de verificación.

### 6a. Flujo de tareas (9 etapas)

**Etapa 1 — Producto sale de Miller Knoll**
- Freight estándar → va directo a WIG warehouse.
- Artículos pequeños → Miller envía via FedEx small parcel, bypassing WIG, puede llegar directo a la city agency.
- **Pain point crítico:** FedEx bypasses WIG. Lauren no recibe confirmación automática. Gap sistemático en cada shipment FedEx, no una excepción ocasional.

**Etapa 2 — WIG recibe físicamente y envía confirmación**
- WIG staff logea la entrega y envía Word doc a todos (Lauren, Michael, Lena, otros CC).
- Formato fijo: pág 1 = WIG receiving number + carton count; páginas siguientes = packing slips originales.
- Tiempo: 24–48h después del receipt físico. Si hay daño, WIG lo flags en ese mismo plazo.
- **Pain point:** No hay procesamiento automático. La confirmación llega a los inboxes y depende de Lena monitoreando activamente.

**Etapa 3 — Lena ingresa el receipt en CORE**
- Lena revisa el Word doc de WIG e ingresa el receipt en CORE contra las order lines correspondientes.
- Lena envía email a Lauren listando qué órdenes fueron received — pero NO indica si son 100% o parciales.
- **Pain point crítico:** Sin SLA. Lena puede tardar hasta 7 días. Lauren generalmente la contacta después de 1-2 días para acelerar. Worst case: 9 días desde physical delivery hasta CORE entry (48h WIG + 7 días Lena).
- **Pain point:** Lena maneja receiving company-wide. CoNY compite con todo el resto de BFI. Lauren no tiene visibilidad del queue de Lena.

**Etapa 4 — Lauren verifica 100% receipt en CORE (gate firme)**
- Lauren abre CORE y verifica independientemente que cada línea de cada orden esté 100% received. No confía en el resumen de Lena.
- BFI cobra un solo delivery-and-installation fee por orden → toda la orden debe estar en warehouse antes de scheduling.
- Herramienta: CORE Open Order Dashboard (received%, acknowledged%, ticketed%, delivered%). Lauren comenzó a usarlo recién en la sesión Apr 21 — antes usaba solo Excel manual.
- **Pain point:** Lauren no recibía ninguna señal de "orden completa". Debía monitorear CORE activamente.

**Etapa 5 — Manejo de receipts parciales y FedEx gaps**
- Si CORE no muestra 100%: Lauren inicia secuencia de resolución.
- Pasos: (1) Chequea Omni para shipment notifications → (2) Si un ítem no aparece en WIG, emailea a Andy (HM) con FO number pidiendo POD → (3) Andy envía POD → (4) Lauren reenvía POD a WIG con fecha de delivery, pide confirmación.
- Para FedEx: misma secuencia, pero sin confirmación WIG de ningún tipo desde el inicio.
- **Pain point:** FedEx gap requiere detección manual + email chain de 3 pasos entre 2 partes para cada shipment FedEx. Es un método de envío recurrente, no excepcional.
- **Pain point:** No hay alert ni dashboard que distinga: FedEx gap vs. Lena no entró todavía vs. short shipment real. Lauren diagnostica manualmente cada vez.

**Etapa 6 — Imprimir Work Order y despachar a Walter**
- Cuando CORE muestra 100%: Lauren imprime work order + drawings desde CORE.
- Da 1 copia a Walter en persona.
- Prepara 2 copias adicionales (work order + drawings) para WIG — entrega en mano o vía FedEx.
- Envía a WIG sus purchase orders por separado.
- **Hard constraint:** CoNY y los sindicatos requieren firmas físicas con tinta. No se aceptan firmas electrónicas.
- **Pain point:** Walter no sabe nada del proyecto hasta que Lauren le entrega el papel físico. No puede pre-coordinar con la city agency. Lauren recibe preguntas de estado de Walter y la agencia mientras sigue monitoreando receipts.

**Etapa 7 — Delivery, Installation y excepciones post-delivery**
- Walter coordina delivery e instalación con la city agency.
- Post-instalación: si hay daños o service items, Lauren ingresa warranty/service record en CORE.
- WIG / installer envía **invoice package** con CPRs (certified payroll records) con horas reales (ej: 45h carpenter vs 50h cotizadas).
- Lauren reconcilia CPR vs quoted hours: actualiza CORE, verifica monto, emailea a Michael Boyle con revised install dollar amount → Michael notifica a Nancy Bos (Miller Knoll) para actualizar invoice.
- **Pain point crítico:** La ciudad no paga si CPR y la invoice no coinciden exactamente. Proceso 100% manual, multi-sistema, multi-partie.
- **Pain point:** Cada city agency requiere documentación diferente. La variación no está sistematizada — depende del conocimiento institucional de Lauren y Michael.

**Etapa 8 — 30-Day Storage Window**
- BFI tiene 30 días desde que el producto llega a WIG antes de que comiencen los storage charges.
- Lauren pregunta al cliente si quiere la orden ingresada inmediatamente o una fecha específica de delivery.
- **Pain point:** En temporada alta (Mar–Jul), cuando docenas de órdenes convergen hacia el June 30, el delay en receiving confirmation o CORE entry puede reducir el available delivery window y generar storage fees.

**Etapa 9 — Estacionalidad**
- **Jan–Feb:** Spike en quote requests de diseñadores Miller Knoll.
- **Mar–Jul (peak):** POs en alto volumen. Deadline interno BFI: Apr 1 para garantizar delivery + instalación + invoicing antes del June 30 (fiscal year-end CoNY). En la sesión Apr 21, Lauren tenía 6 POs en inbox esa mañana.
- **Off-season:** Menor volumen pero mayor valor por proyecto.

### 6b. Pain Points — Product Receiving (priorizados)

| # | Pain Point | Impacto |
|---|---|---|
| 1 | FedEx delivery gap — sistemático, Lauren debe detectar manualmente + POD chain | Delays en 100% receiving gate |
| 2 | Lena sin SLA (hasta 7 días) + no notifica cuando orden es 100% | Delays en scheduling, Lauren sigue up manualmente |
| 3 | Walter sin visibilidad hasta handoff físico | No puede pre-coordinar; Lauren recibe status questions innecesarias |
| 4 | CPR reconciliation 100% manual (payment-critical, multi-partie) | Risk de error en payment; alto costo de tiempo |
| 5 | 30-day storage window + temporada alta = exposición a storage fees | Costo financiero directo |
| 6 | Lauren no usaba CORE Open Order Dashboard (usaba Excel manual) | Duplicación de esfuerzo (resuelto en Apr 21, pero refleja adoption gap) |
| 7 | Firmas físicas requeridas — constraint externo inamovible | Work order process no se puede digitalizar (near term) |

---

## 6c. Conexiones Cross-Proceso (Agency Fee ↔ Product Receiving)

Los dos procesos no son independientes — forman 3 fases secuenciales del mismo lifecycle CoNY.

| ID | Conexión | Steps vinculados | Riesgo |
|---|---|---|---|
| C1 | 100% receiving gate = handoff entre procesos. Agency Fee crea la orden; Product Receiving debe lograr 100% antes de imprimir work order, que desencadena cierre de Agency Fee. | AF Steps 7-8 ↔ PR Steps 3-6 | Bloqueante |
| C2 | WIG es fuente de labor quotes Y confirmaciones de receiving. Ambas llegan sin formato estándar. Mismo problema en 2 puntos del lifecycle. | AF Step 4 ↔ PR Step 2 | Eficiencia |
| C3 | CPR reconciliation = closing event compartido (75% requieren revisión, payment-critical). AF y PR convergen en este punto. | AF Step 10 ↔ PR Step 7 | Payment-critical |
| C4 | 30-day storage window crea presión simultánea en ambos procesos. Delay en Lena's entry reduce la ventana; delay en order entry (AF) también comprime el tiempo. | AF Step 5 ↔ PR Steps 3-4 | Storage fees |
| C5 | FedEx gap bloquea ambos procesos. Sin confirmación WIG, el 100% gate de PR está bloqueado → work order no se puede imprimir → AF no puede cerrar. | AF Step 7 ↔ PR Steps 1, 5 | Bloqueante |
| C6 | Excel tracking duplicado. AF usa Excel para order tracking; PR usaba Excel para received% status. Mismas órdenes, dos spreadsheets, sin sync con CORE. | AF Step 5 ↔ PR Step 4 | Data drift |
| C7 | Lauren es el único operador de todo el lifecycle end-to-end CoNY. Single point of failure para ambos procesos, especialmente crítico en temporada alta. | Todos los steps | Operacional |

**Riesgos compuestos clave:**
- Lena lag + 30-day window + temporada alta = acumulación de exposure en múltiples órdenes simultáneas
- No hay alert de 100% received + Walter sin visibilidad + scheduling delay → comprime tiempo antes del June 30
- CPR discrepancy rate (75%) + relay chain manual + blind spot de agency fee → convergen en el mismo closing step

## 7. Oportunidades AI — evaluación

| Oportunidad | Factibilidad | Proceso | Fuente |
|---|---|---|---|
| Agency fee calculation — calcular fee esperado desde SIF vs contrato | Alta — "definitely doable" (Wendy) | AF | Kate #2, Wendy |
| CPR vs installation hours reconciliation | Alta (si CPR docs son estructurados) | AF+PR | Kate #1 |
| Agency fee blind spot — verificación independiente vs Nancy Bos | Alta (requiere acceso a contract T-codes) | AF | Kate #2. NOTA: Lauren dijo "nunca hay discrepancias" porque nunca se pudo verificar — el blind spot es un riesgo no detectado, no una fortaleza. |
| Discount auto-calculation (0% GP, fórmula: sale÷list-1) | Alta — fórmula simple, CORE no la soporta hoy | AF | Pain point #4 |
| Quote intake → system queue (desde email) | Media-alta | AF | Pain point #6 |
| Unified order status monitor (CORE + WIG + FedEx alerts) | Alta concepto, media técnica | PR | Kate mencionó como high-value. Reemplaza Excel + Lena lag + FedEx gap |
| Notificación automática a Walter (100% received trigger) | Alta | PR | Kate identificó como high-value |
| WIG document parser (labor quotes AF + Word docs PR) | Media — WIG Word doc es formato consistente | AF+PR | C2, una sola integración para dos pain points |
| FedEx shipment detection automática | Media-alta (si hay acceso a tracking data) | PR | Pain point #1 |
| Order number matching cross-agency | Media | AF | Pain point #9 |
| Warehouse receiving OCR (docs mixtos, fotos) | **Incierta — OCR históricamente fallido en Audubon** | PR | Wendy concern |
| Trigger-based packing list pull desde Omni | Media-alta (evita OCR) | PR | Alternativa técnica bajo evaluación |

---

## 8. Estrategia y posicionamiento recomendado

**Opciones evaluadas:**
1. Pure AI implementation
2. AI + process redesign ← recomendada por el equipo
3. Process-first with selective AI
4. Zero AI (si nada es factible)

**Consenso del equipo Strata (Apr 30):**
- Agency fee calculation en sí → Strata puede hacerlo
- El problema real es la **ineficiencia del proceso** + resistencia de Donna/Diana
- Warehouse receiving: definir feasibility técnica antes de comprometer
- Mensaje a Kate: "sin cambiar el proceso, ninguna solución AI funcionará" — necesita process redesign + AI
- Kate confía en el equipo vía Jessica y Matt → son el canal de presentación

**Channel recomendado:** Jessica (fractional controller, conoce el proceso internamente) + Matt (relación ejecutiva).

---

## 9. Contexto demo Strata

> Estos son lineamientos para diseñar el demo — no compromisos de producto.

**Directiva CEO Strata:** UI minimalista, ir al punto, evitar ruido visual. Back-office/ops only. Eficiencia, no reemplazo.

**Patrón de referencia:** Demo MBI (wizard 2-step por proceso, tour steps tipados, componentes MBIWizardShell).

**Flows candidatos para demo v1:**
- Flow 1A: CPR Reconciliation (pain point #1 Kate) — matching automático horas CPR vs invoice
- Flow 1B: Agency Fee Verification (pain point #2 Kate) — validación independiente vs Miller Knoll data
- Flow 1C: Quote intake + discount calculation — eliminación ciclo manual OmniQuote

**Scope demo v1:** Por confirmar con usuario antes de implementar. Warehouse receiving requiere definir feasibility primero.

---

## 9b. AI Readiness Score (Apr 2026)

**Score:** 2.2/5.0 — **AI Explorer** tier
**Respondentes:** 2 de 8 personas clave (Kate Kerpchar + Lauren DeMarco). 6 no respondieron: Donna, Diana, Lena, Patricia, Patrick Dunne, Walter.

| Dimensión | Score | Peso | Nota |
|---|---|---|---|
| Data Foundation | 2.5/5 | 30% | Funcional pero siloed. API license de CORE no activa. |
| Technology & Infrastructure | 2.5/5 | 15% | Stack adecuado para el tamaño. Gap = decisión de licensing, no arquitectura. |
| Process Standardization | 2.0/5 | 20% | E2E sessions de Apr 2026 = primera documentación sistemática de los flows. |
| People & Culture | 2.0/5 | 25% | 2 respondentes. Resistencia de Donna y Diana no medida. |
| Governance & Strategy | 1.5/5 | 10% | AI strategy early stage. Kate no tenía referencia de lo que AI puede hacer. |

**Perfiles de adopción:**
- **Lauren DeMarco:** Trust threshold 8/10. Prefiere self-directed onboarding. Define éxito como "ver que completa la tarea de principio a fin." Early adopter — es el único deployment path que importa para los 2 procesos en scope.
- **Kate Kerpchar:** Trust threshold 5/10. 5 prerequisites antes de adoptar: (1) demo con órdenes reales, (2) velocidad, (3) capability de override, (4) walkthrough one-on-one, (5) entender cómo maneja errores.

**Gate de deployment:** El AI Readiness Report identifica que la documentación de procesos es el gate primario. Los E2E sessions de Apr 2026 son la primera documentación sistemática — ninguna herramienta debería deployarse en producción en un proceso que no fue documentado hasta este assessment.

## 10. Emails y reuniones de referencia

| Fecha | Tipo | Contenido |
|---|---|---|
| Apr 30, 2026 | Email (Carlos → equipo) | Recap post-socialization. Scope, pain points, Wendy flags. |
| Apr 30, 2026 | Meeting transcript | David walkthrough completo de Flow 1. Wendy/Darya/Danny reacciones. Próximos pasos. |
| May 1, 2026 | Email agenda (Carlos) | Agenda reunión: context recap, Flow #2 walkthrough, open questions, feasibility, strategy. |
| May 1, 2026 | Email agenda v2 (Carlos) | Confirmación scope CoNY, agenda para revisión Flow 2 + open questions receiving. |
