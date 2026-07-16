# BFI Furniture — Flujos AS-IS → Strata Flow

> Objetivo: mapear cada paso del flujo actual, identificar cuellos de botella y puntos de valor, y diseñar el flujo optimizado con Strata como base del demo.
> Basado en: bfi-sot.md + bfi-analysis.md + referencia demo MBI

---

## Leyenda

```
⛔ CUELLO DE BOTELLA — bloquea el flujo, genera espera o cascada de delays
⚠️ RIESGO — potencial de error manual, pérdida de revenue o dato incorrecto
👁️ INVISIBLE — estado que nadie puede ver en tiempo real
✅ VALOR STRATA — punto de intervención AI con alto ROI percibido
🎯 MOMENTO DEMO — pantalla o interacción que debe aparecer en el demo
```

---

# FLOW 1 — Agency Fee / Direct Bill Pricing Verification

## 1A. AS-IS con análisis de cuellos de botella

### Fase A — Quote Intake

```
[MK Designer] ──email──► [Claims Analyst's inbox]
                              │
                              ▼
                    Claims Analyst crea quote number en CORE
                    Claims Analyst responde email al designer
                              │
                              ▼
                    Claims Analyst organiza en su cabeza
                    qué órdenes están pendientes
```

| Paso | Rol que espera | Rol que bloquea | Tiempo perdido |
|---|---|---|---|
| Email llega sin estructura | Claims Analyst | Sistema (sin queue) | ~15 min/orden en triaje |
| Claims Analyst responde manualmente | Designer espera | Claims Analyst | Variable |

**⛔ Cuello de botella:** El inbox de Claims Analyst ES el sistema de queue. No hay visibilidad de volumen, prioridad ni aging.
**👁️ Invisible:** Cuántas cotizaciones están en cola, cuánto tiempo llevan esperando.
**Roles afectados:** Claims Analyst (PO, UX), Project Manager (BI — no puede ver la demanda en tiempo real).

---

### Fase B — Pricing Verification (OmniQuote)

```
Claims Analyst sube SIF a OmniQuote
        │
        ▼ (espera email de vuelta — sin SLA conocido)
OmniQuote devuelve corrected SIF + quote comparison
        │
        ▼
Claims Analyst descarga corrected SIF
        │
        ▼
Claims Analyst re-sube corrected SIF a CORE
        │
  (si hay restricted items)
        ▼
Claims Analyst toma screenshot → email a designer → espera resolución MK
```

| Paso | Rol que espera | Rol que bloquea | Tiempo perdido |
|---|---|---|---|
| Upload → wait → download cycle | Claims Analyst | OmniQuote (email-driven) | ~30–45 min/orden |
| Restricted item resolution | Claims Analyst + Designer | Miller Knoll | 1–3 días |

**⛔ Cuello de botella mayor:** El ciclo OmniQuote es serial y manual para cada orden. No se puede paralelizar.
**⚠️ Riesgo:** La ciudad requiere precio exacto del contrato, no higher, no lower. Un error en el re-upload pasa al cliente.
**Roles afectados:** Claims Analyst (UX, PO), experto en procesos (el ciclo no agrega valor — OmniQuote ya tiene el precio correcto).

---

### Fase C/D — Contract Type + Discount Calculation (0% GP)

```
Claims Analyst identifica tipo de contrato (City vs State)
        │
        ▼
Claims Analyst aplica fórmula manualmente:
  descuento = (sale ÷ list) - 1
        │
  (por CADA orden, por CADA línea)
        │
        ▼
Claims Analyst ingresa descuento en CORE
Claims Analyst agrega true-up template line
```

| Paso | Rol que espera | Rol que bloquea | Tiempo perdido |
|---|---|---|---|
| Cálculo manual per-line | — | CORE (no auto-calcula) | ~20 min/orden multi-línea |
| Verificación manual de 0% GP | — | Claims Analyst | Error-prone |

**⛔ Cuello de botella:** CORE no soporta auto-cálculo desde el fee % del contrato. Claims Analyst hace aritmética manual.
**⚠️ Riesgo:** Un error en el descuento = GP incorrecto = problema de compliance con la Ciudad.
**👁️ Invisible:** El backlog CoNY muestra $7M a 0% GP sin distinción entre "direct bill pending" y "regular 0-margin". Project Manager no puede ver el verdadero valor del pipeline.
**Roles afectados:** Claims Analyst (UX, process expert), Project Manager (BI — ceguera de $7M).

---

### Fase E — Labor Quote (Workplace/WIG)

```
Claims Analyst envía request a WIG para labor quote
        │
        ▼ (sin formato estándar de request ni de respuesta)
WIG devuelve quote en formato libre
        │
        ▼
Manager Boyle extrae y categoriza manualmente:
  - Inside delivery
  - Teamsters (+ OT differential)
  - Carpenters (+ OT differential)
  - Strike truck charges (si > 600 cubes)
        │
        ▼
Approver pasa cifras a Claims Analyst
        │
        ▼
Claims Analyst sube SIF template de labor desde CORE
Claims Analyst ingresa manualmente los números de Approver
```

| Paso | Rol que espera | Rol que bloquea | Tiempo perdido |
|---|---|---|---|
| WIG response (sin SLA) | Claims Analyst, Approver | WIG | Variable |
| Categorización manual | — | Approver (parse mental) | ~30 min/orden |
| Re-ingreso en CORE | — | Claims Analyst | ~15 min/orden |

**⛔ Cuello de botella:** WIG no usa un formato estándar. Approver re-interpreta cada vez. Mismo problema que con las receiving confirmations en Flow 2.
**⚠️ Riesgo:** Categoría de labor incorrecta = fee incorrecto = compliance issue con sindicatos.
**Roles afectados:** Approver (BI, process), Claims Analyst (UX), QA (sin validación automática de categorías).

---

### Fase F — Order Entry y Tracking

```
Claims Analyst confirma receipt con cliente
Claims Analyst dropea PMO en R Drive (requiere VPN)
Claims Analyst ingresa orden completa en CORE (todo: third party bill)
        │
        ▼ (automático)
EDI → Omni → MK crea customer acceptance form en Omni
        │
        ▼ (manual)
Claims Analyst registra en Excel manual: order#, agency, ship date
Claims Analyst actualiza monthly end report
```

| Paso | Rol que espera | Rol que bloquea | Tiempo perdido |
|---|---|---|---|
| Tracking manual (Excel + R Drive) | — | Claims Analyst | ~20 min/orden |
| Order # matching (cada agencia tiene su propio número) | — | Claims Analyst | Alto variability |

**⛔ Cuello de botella:** El tracking está en 3 lugares (CORE + Excel + monthly report). Ninguno está sincronizado.
**👁️ Invisible:** No hay una vista unificada del estado de la orden CoNY.
**Roles afectados:** BI (duplicación), UX (Claims Analyst hace trabajo de sistema), QA (risk de desync).

---

### Fase I — CPR Reconciliation ⭐ PAIN POINT #1 KATE

```
Instalación completada
        │
        ▼
WIG/installer envía invoice package con CPRs
  (horas reales: ej. 45h carpenters vs 50h cotizadas)
        │
        ▼
Claims Analyst localiza work order en CORE
Claims Analyst compara CPR hours vs quoted hours (línea por línea, manualmente)
        │
  (75% de las veces: discrepancia detectada)
        │
        ▼
Claims Analyst actualiza hours en CORE
Claims Analyst verifica que $ se actualizó correctamente
Claims Analyst emailea a Approver con revised install dollar amount
        │
        ▼
Approver notifica a Receiving Coordinator Bos (MK) para actualizar invoice
        │
        ▼
Receiving Coordinator actualiza invoice en MK system
        │
        ▼
Claims Analyst verifica que todo coincide antes de invoicear a la ciudad
```

| Paso | Rol que espera | Rol que bloquea | Tiempo perdido |
|---|---|---|---|
| CPR vs quoted comparison manual | — | Claims Analyst | ~45–60 min/orden |
| 3-hop relay (Claims Analyst → Approver → Receiving Coordinator) | — | Cada eslabón | 1–3 días |
| Ciudad no paga si no hay match exacto | BFI (cash flow) | Proceso manual | Impacto financiero directo |

**⛔ CUELLO DE BOTELLA CRÍTICO:** 75% de órdenes requieren revisión. 100% manual. Multi-sistema. Multi-partie.
**⚠️ RIESGO CRÍTICO:** Un error aquí = la ciudad no paga = impacto directo en cash flow de BFI.
**Roles afectados:** TODOS — Claims Analyst (UX, workload), Approver (coordinator), Project Manager (BI + revenue), Tech Lead (payment-critical, debe ser robusto), QA (test crítico).

---

### Fase J — Agency Fee Application ⭐ PAIN POINT #2 KATE

```
Estimator aplica el agency fee y cierra la orden en CORE
        │
        ▼ (sin verificación independiente)
BFI confía en los datos de Receiving Coordinator Bos (MK)
        │
        ▼
NUNCA se ha detectado una discrepancia
  (no porque no las haya — sino porque nunca se pudo verificar)
```

**⚠️ RIESGO CRÍTICO:** BFI no tiene cálculo propio del fee. El "nunca hay discrepancias" es una bandera roja: si el error existe, BFI no tiene forma de detectarlo.
**👁️ INVISIBLE:** Revenue leakage potencial no cuantificado.
**Roles afectados:** Project Manager (#1 en importancia — es su concern explícito), BI (revenue reporting incompleto), process expert (single point of failure externo), AI expert (este es EL caso de uso de agency fee calculator).

---

## 1B. STRATA FLOW — Agency Fee Optimizado

### Principio de diseño Strata para este flow:

> Claims Analyst trabaja **por excepción** — Strata hace el trabajo de volumen, Claims Analyst aprueba o corrige.
> Project Manager tiene **visibilidad del valor** — puede ver en tiempo real qué fee se espera, qué está pendiente, qué está reconciliado.

```
┌─────────────────────────────────────────────────────────────────┐
│  STRATA FLOW — Agency Fee (CoNY)                                │
│                                                                 │
│  Trigger: Email de MK designer                                  │
│  ↓                                                              │
│  [Strata] Parsea email → crea queue item con metadata           │
│  Claims Analyst ve queue → no su inbox ← ✅ VALOR #1                    │
│  ↓                                                              │
│  [Strata] Valida SIF pricing vs contrato CoNY T-codes           │
│  Claims Analyst ve: precio OK / precio incorrecto (highlight)           │
│  Aprueba con un click ← ✅ VALOR #2                             │
│  ↓                                                              │
│  [Strata] Auto-calcula descuento por línea (sale÷list-1)        │
│  Claims Analyst ve resultado → aprueba o edita con razón                │
│  ← ✅ VALOR #3: elimina 20 min de aritmética por orden          │
│  ↓                                                              │
│  [Strata] WIG doc llega → parser extrae categorías de labor     │
│  Approver ve tabla estructurada → aprueba en lugar de re-tipear  │
│  ← ✅ VALOR #4                                                  │
│  ↓                                                              │
│  [Strata] Unified Order Tracker (reemplaza Excel + R Drive)     │
│  ← ✅ VALOR #5                                                  │
│  ↓                                                              │
│  [Strata] CPR llega → AI compara línea por línea                │
│  Claims Analyst ve diff resaltado → aprueba o edita                     │
│  Strata genera notification a Approver automáticamente           │
│  ← 🎯 MOMENTO DEMO CRÍTICO #1 (Project Manager's pain point #1)           │
│  ↓                                                              │
│  [Strata] Calcula expected agency fee desde contrato T-codes    │
│  Claims Analyst ve: esperado X — Receiving Coordinator dice Y — diferencia: ΔZ          │
│  Si match → aprueba. Si gap → flag con un click                 │
│  ← 🎯 MOMENTO DEMO CRÍTICO #2 (Project Manager's pain point #2)           │
└─────────────────────────────────────────────────────────────────┘
```

### Tabla de transformación por paso

| Paso AS-IS | Tiempo AS-IS | Strata | Tiempo TO-BE | Ahorro |
|---|---|---|---|---|
| Quote intake (email → queue manual) | 15 min/orden | AI parsea email → queue automático | 2 min (revisar) | 87% |
| OmniQuote cycle (upload→wait→download) | 45 min/orden | AI valida contra T-codes (en paralelo o alternativo) | 5 min (revisar) | 89% |
| Discount calc manual (por línea) | 20 min/orden | Auto-calculado, Claims Analyst aprueba | 3 min | 85% |
| Labor quote parsing (Approver) | 30 min/orden | AI parsea WIG doc → tabla estructurada | 5 min (Approver revisa) | 83% |
| Order tracking (Excel + R Drive) | 20 min/orden | Unified tracker automático | 0 min | 100% |
| CPR reconciliation (manual, multi-partie) | 60 min/orden | AI compara → Claims Analyst aprueba diff → notif automática | 10 min | 83% |
| Agency fee verification | 0 min (imposible hoy) | AI calcula expected → Claims Analyst compara vs Receiving Coordinator | 5 min | ∞ (nuevo) |

**Total estimado:** De ~190 min/orden a ~30 min/orden. Claims Analyst recupera ~2.7h por orden de alta complejidad.

---

## 1C. Momentos de valor por rol (Agency Fee)

| Momento Strata | Valor para Claims Analyst | Valor para Project Manager | Valor para BI |
|---|---|---|---|
| Queue de órdenes CoNY (no inbox) | Claridad de carga de trabajo | Visibilidad de demanda | Forecasting de volumen |
| Pricing validation AI (vs OmniQuote) | Elimina ciclo de espera | Compliance automático vs contrato | — |
| Discount auto-calc | Elimina aritmética manual | — | — |
| Labor quote structuring | Elimina re-tipeo de Approver | — | Categorías estandarizadas |
| CPR reconciliation AI | 1 click vs 60 min | KPI: tasa de discrepancia visible | Cash flow predictible |
| Agency fee calculator | Nuevo: puede verificar lo que antes no veía | Elimina blind spot de revenue | Revenue reporting real |
| $7M backlog con distinción AF vs 0% | Contexto de trabajo | Pipeline real de CoNY | BI actionable |

---
---

# FLOW 2 — Product Receiving (CoNY / WIG)

## 2A. AS-IS con análisis de cuellos de botella

### Etapa 1 — MK shipea producto

```
MK confirma shipment
        │
   ┌────┴────┐
   ▼         ▼
Freight     FedEx small parcel
(→ WIG)     (→ bypassa WIG, puede ir directo a la agencia)
   │              │
   ▼              ▼
WIG recibe    NADIE recibe confirmación
              Claims Analyst no sabe que llegó
```

**⛔ CUELLO DE BOTELLA / GAP SISTEMÁTICO:** FedEx bypassa WIG. Claims Analyst no tiene señal de llegada.
**👁️ INVISIBLE:** Estado real de los ítems FedEx.
**⚠️ RIESGO:** Ítem llega a city agency sin registro en CORE → gap en 100% received → work order bloqueado.
**Roles afectados:** Claims Analyst (UX), QA (caso de prueba crítico), Tech Lead (requires Omni shipment notification monitoring).

---

### Etapa 2 — WIG confirma receipt

```
WIG staff logea entrega
        │
        ▼ (24–48h después)
WIG envía Word doc a todos (Claims Analyst, Approver, AP Coordinator CC):
  Pág 1: WIG receiving# + carton count
  Pág 2+: packing slips originales
        │
        ▼
Doc aterriza en los inboxes
Nadie lo procesa automáticamente
Todo depende de que AP Coordinator lo vea y actúe
```

**⛔ Cuello de botella:** La confirmación es un Word doc en un inbox. No hay handoff estructurado.
**👁️ Invisible:** Si AP Coordinator lo vio, si lo ingresó, cuándo lo va a ingresar.
**Roles afectados:** AP Coordinator (workload, no SLA), Claims Analyst (espera sin señal), QA (sin audit trail del doc).

---

### Etapa 3 — AP Coordinator ingresa en CORE

```
AP Coordinator recibe Word doc de WIG
        │
        ▼ (su propio timeline, sin SLA)
        │  (puede tardar hasta 7 días)
        │  (Claims Analyst generalmente la contacta a los 1-2 días)
        ▼
AP Coordinator ingresa receipt en CORE contra order lines
        │
        ▼
AP Coordinator envía email a Claims Analyst: "ingresé órdenes X, Y, Z"
  (sin indicar si son 100% o parciales)
```

| Rol | Estado de espera | Señal que recibe |
|---|---|---|
| Claims Analyst | Esperando en el vacío | Email de AP Coordinator (sin SLA, sin % de completitud) |
| Operations Manager | Ni siquiera sabe que hay producto llegando | Nada |
| BFI (30-day window) | Reloj corriendo desde day 1 | Nada automático |

**⛔ CUELLO DE BOTELLA CRÍTICO:** AP Coordinator es el único camino entre la confirmación de WIG y CORE. Sin SLA. Sin prioridad especial para CoNY. Claims Analyst compite con todos los clientes de BFI por el tiempo de AP Coordinator.
**👁️ INVISIBLE:** Queue de AP Coordinator, cuánto tiempo lleva el WIG doc sin procesar, cuántas órdenes están a riesgo de storage fee.
**Roles afectados:** Claims Analyst (UX — sigue up manualmente), PO (latencia es el blocker del downstream), QA (worst case 9 días = 30% del storage window consumido sin entregar nada).

---

### Etapa 4 — Claims Analyst verifica 100% receipt (gate firme)

```
Claims Analyst recibe email de AP Coordinator
        │
        ▼
Claims Analyst ABRE CORE manualmente
Claims Analyst chequea CADA línea de CADA orden relevante
        │
  ¿100% en todas las líneas?
  ┌─────┴──────┐
  SÍ           NO
  │             │
  ▼             ▼
Continúa     Inicia secuencia
             de resolución (ver Etapa 5)
```

**⛔ Cuello de botella:** La verificación es 100% manual. Claims Analyst no recibe señal cuando alcanza 100%.
**👁️ Invisible:** Estado real de cada línea en tiempo real (hasta que Claims Analyst abre CORE).
**Nota:** Claims Analyst comenzó a usar el CORE Open Order Dashboard en Apr 21, pero antes usaba solo Excel — el hábito aún no está arraigado.
**Roles afectados:** Claims Analyst (UX — trabajo de sistema, no de valor), Operations Manager (sigue sin saber nada).

---

### Etapa 5 — Resolución de parciales y FedEx gaps

```
Si orden no está 100%:
        │
        ▼
Claims Analyst chequea Omni para shipment notifications
        │
  ¿Ítem FedEx no confirmado?
        │
        ▼
Claims Analyst emailea a Andy (HM) con FO number → pide POD
        │
        ▼ (espera respuesta de Andy)
Andy envía POD a Claims Analyst
        │
        ▼
Claims Analyst reenvía POD a WIG + fecha de delivery
Claims Analyst pide a WIG que confirme en su sistema y envíe receiving doc
        │
        ▼ (vuelve a Etapa 2 para esos ítems)
```

**⛔ CUELLO DE BOTELLA:** 3-step email chain para CADA shipment FedEx. FedEx es un método recurrente, no una excepción.
**⚠️ RIESGO:** Sin diagnóstico automático, Claims Analyst no puede distinguir: FedEx gap vs AP Coordinator no entró vs short shipment real. Diagnostica manualmente cada vez.
**Roles afectados:** Claims Analyst (UX — detective work en lugar de verificación), Tech Lead (FedEx detection requiere Omni monitoring), QA (caso de prueba crítico).

---

### Etapa 6 — Work Order y despacho a Operations Manager

```
Claims Analyst confirma 100% en CORE
        │
        ▼
Claims Analyst imprime work order desde CORE
Claims Analyst imprime drawings
        │
        ▼
Da 1 copia a Operations Manager EN PERSONA
        │
        ▼ (Operations Manager: primer momento de awareness)
Operations Manager recibe papel
Operations Manager puede empezar a coordinar con city agency
        │
        ▼
Claims Analyst prepara 2 copias adicionales para WIG
Entrega en mano o vía FedEx
Claims Analyst envía POs a WIG por separado
```

**⛔ HARD CONSTRAINT (externo):** La ciudad requiere firmas físicas con tinta. No digitizable.
**👁️ INVISIBLE:** Para Operations Manager, para la city agency, para Approver — hasta este momento, nada.
**⚠️ RIESGO:** Operations Manager no puede pre-coordinar. Cualquier conflicto de agenda de la city agency se descubre tarde.
**Roles afectados:** Operations Manager (CX — cero visibilidad), Claims Analyst (UX — todo paper), CX (experiencia del cliente final degradada por lag), QA (constraint externo debe modelarse en el demo).

---

### Etapa 7 — CPR Reconciliation (conectado con Flow 1)

```
Instalación completada
        │
        ▼
WIG/installer envía invoice package + CPRs
  (ej: 45h carpenters reales vs 50h cotizadas)
        │
        ▼
Claims Analyst localiza work order en CORE
Claims Analyst compara CPR vs quoted MANUALMENTE por línea
        │
  75% de veces: discrepancia
        │
        ▼
Claims Analyst actualiza CORE
Claims Analyst emailea a Approver → Approver a Receiving Coordinator Bos → Receiving Coordinator actualiza invoice MK
        │
        ▼
BFI puede invoicear a la ciudad
  (solo cuando CPR y invoice coinciden exactamente)
```

**⛔ CUELLO DE BOTELLA CRÍTICO (compartido con Flow 1):** Ver Flow 1 Fase I.

---

## 2B. STRATA FLOW — Product Receiving Optimizado

### Principio de diseño Strata para este flow:

> Los eventos físicos (producto llega) se traducen **automáticamente** en señales digitales.
> Claims Analyst trabaja **reactiva a señales**, no monitoreando CORE constantemente.
> Operations Manager tiene **visibilidad anticipada**, no papel tardío.

```
┌─────────────────────────────────────────────────────────────────┐
│  STRATA FLOW — Product Receiving (CoNY)                         │
│                                                                 │
│  MK shipea producto                                             │
│  ↓                                                              │
│  [Strata] Monitorea Omni para shipment notifications            │
│  ¿FedEx expected pero sin WIG confirmation?                     │
│  → Alert automático a Claims Analyst + pre-filled POD request           │
│  ← ✅ VALOR #1: FedEx gap detectado antes de que Claims Analyst lo busque│
│  ↓                                                              │
│  WIG Word doc llega al inbox                                    │
│  [Strata] Parsea Word doc automáticamente:                      │
│    - WIG receiving# extraído                                    │
│    - Carton count extraído                                      │
│    - Packing slip lines mapeadas a order lines de CORE          │
│  AP Coordinator ve preview en CORE → aprueba con 1 click                  │
│  (no re-tipea desde el Word doc)                                │
│  ← ✅ VALOR #2: AP Coordinator de 7 días a <1 día                        │
│  ↓                                                              │
│  [Strata] Monitorea received% en CORE por orden                 │
│  Cuando alcanza 100% en todas las líneas:                       │
│  → Notificación automática a Claims Analyst                             │
│  → Vista de status enviada a Operations Manager (view-only)                 │
│  ← 🎯 MOMENTO DEMO CRÍTICO: "Operations Manager se entera antes del papel"  │
│  ↓                                                              │
│  Claims Analyst: 1 click para aprobar work order print trigger          │
│  (ya no tiene que abrir CORE a verificar manualmente)           │
│  ← ✅ VALOR #3: Gate de verificación de minutos a segundos      │
│  ↓                                                              │
│  [Strata] Monitor de 30-day window por orden                    │
│  Alerta a día 20 con lista de órdenes en riesgo de storage fee  │
│  ← ✅ VALOR #4: Storage fee exposure eliminada                  │
│  ↓                                                              │
│  CPR reconciliation → ver Flow 1 (compartido)                   │
│  ← 🎯 MOMENTO DEMO CRÍTICO #1 compartido                        │
└─────────────────────────────────────────────────────────────────┘
```

### Tabla de transformación por paso

| Paso AS-IS | Tiempo AS-IS | Strata | Tiempo TO-BE | Ahorro |
|---|---|---|---|---|
| FedEx gap detection (manual detective work) | 30–60 min/gap | Detección automática + POD request pre-filled | 5 min (aprobar) | 90% |
| WIG Word doc → AP Coordinator → CORE entry | 7 días (worst case) | AI parsea → AP Coordinator aprueba en 1 click | <24h | 85%+ |
| Claims Analyst verifica 100% received (abre CORE manualmente) | 20 min/revisión | Notificación automática cuando 100% | 0 min (reactiva) | 100% |
| Operations Manager no sabe nada hasta papel | Indefinido | View-only automático cuando 100% received | Inmediato | ∞ (nuevo) |
| 30-day window (sin monitoring) | Sin datos | Countdown visual por orden + alert día 20 | 5 min/semana | ∞ (nuevo) |
| CPR reconciliation | 60 min/orden | AI compara + Claims Analyst aprueba | 10 min | 83% |

---

## 2C. Momentos de valor por rol (Product Receiving)

| Momento Strata | Valor para Claims Analyst | Valor para Project Manager | Valor para Operations Manager |
|---|---|---|---|
| FedEx gap detectado automáticamente | Elimina detective work manual | Órdenes no se quedan atascadas silenciosamente | — |
| WIG doc parsed → AP Coordinator 1-click | Claims Analyst recibe signal más rápido | Receiving lag reducido drásticamente | — |
| Notificación 100% received | No tiene que monitorear CORE | Velocidad del proceso mejorada | Pre-coordinación con city agency posible |
| Operations Manager view-only de status | Elimina status questions de Operations Manager a Claims Analyst | — | Ve el status sin esperar papel |
| 30-day countdown | Previene storage fees | Protección financiera directa | — |
| CPR AI (ver Flow 1) | 1 click vs 60 min | KPI visible | — |

---
---

# RESUMEN — Cuellos de Botella Priorizados (ambos flows)

## Por impacto en tiempo de Claims Analyst

| # | Cuello de Botella | Tiempo perdido | Strata elimina cómo |
|---|---|---|---|
| 1 | CPR reconciliation manual (Flow 1+2) | 60 min/orden × 75% órdenes | AI compara CPR vs quoted, Claims Analyst aprueba diff |
| 2 | WIG doc → AP Coordinator lag (hasta 7 días) | Bloqueo downstream completo | AI parsea Word doc, AP Coordinator 1-click en CORE |
| 3 | OmniQuote upload cycle (por orden) | 45 min/orden | AI valida pricing directo contra T-codes |
| 4 | Discount calculation manual (por línea) | 20 min/orden | Auto-calculado con fórmula del contrato |
| 5 | Claims Analyst verifica 100% received manualmente | 20 min/revisión múltiple | Notificación automática al alcanzar 100% |
| 6 | Labor quote parsing (Approver) | 30 min/orden | AI parsea WIG → tabla estructurada |
| 7 | FedEx gap detection + POD chain | 30–60 min/gap | Detección automática + request pre-filled |
| 8 | Order tracking fragmentado (3 sistemas) | 20 min/orden | Unified tracker automático |

## Por impacto en revenue (Project Manager)

| # | Riesgo de revenue | Situación actual | Strata |
|---|---|---|---|
| 1 | Agency fee blind spot vs Miller Knoll | Claims Analyst dijo "nunca hay discrepancias" = nunca se verificó | AI calcula expected fee por T-code, compara vs Receiving Coordinator Bos |
| 2 | CPR error = ciudad no paga | 75% discrepancia, multi-partie manual | AI detecta discrepancia antes del relay chain |
| 3 | Storage fees por receiving lag | Sin monitoring del 30-day window | Countdown por orden, alert día 20 |
| 4 | $7M backlog sin visibilidad AF vs 0% real | Project Manager no puede ver el pipeline real | Dashboard con distinción + fee proyectado |

---

# DISEÑO DEL DEMO — Screens y Flujo

## Tab 1: "Agency Fee" — 3 steps

### Step 1: CoNY Morning Queue
**Análogo MBI:** AccountingMorningQueue
**Qué muestra:** Todas las órdenes CoNY activas con su estado (Pricing Pending / Discount Pending / CPR Pending / Closed). AI badge en órdenes que necesitan atención.
**Momento de valor:** Claims Analyst llega por la mañana y ve su trabajo del día — sin abrir su inbox.
**🎯 Tour step:** `b1.1`

### Step 2: Agency Fee Calculator + Pricing Validator
**Análogo MBI:** AISpecCheckSimulation / NonEDIReconcilerScene
**Qué muestra:** Una orden seleccionada. Strata valida el SIF contra el contrato CoNY (T-codes). Auto-calcula el descuento por línea. Muestra: precio SIF → precio contrato → descuento calculado → Claims Analyst aprueba.
**Momento de valor:** "En lugar de 45 min con OmniQuote + 20 min calculando, Claims Analyst aprueba en 5 min."
**🎯 Tour step:** `b1.2`

### Step 3: CPR Reconciliation Scene
**Análogo MBI:** NonEDIReconcilerScene (tabla línea por línea)
**Qué muestra:** CPR llegó. Strata comparó con las horas cotizadas. Claims Analyst ve tabla: "Cotizado 50h carpenters → CPR: 45h → Diferencia: -5h → Valor revisado: $X". Aprueba con 1 click. Strata notifica a Approver automáticamente.
**Sub-scene:** Agency fee verification — "Fee esperado: $12,450 (contrato T-code 18%) — Fee Receiving Coordinator Bos: $12,450 — ✅ Match" vs "Fee Receiving Coordinator Bos: $11,200 — ⚠️ Diferencia de $1,250 — Flag."
**🎯 Tour step:** `b1.3` (CPR) + `b1.4` (fee verify)

---

## Tab 2: "Receiving" — 2 steps

### Step 1: CoNY Order Status Monitor
**Análogo MBI:** ARAgingReviewScene
**Qué muestra:** Todas las órdenes CoNY activas con: received% en CORE, días en WIG desde arrival, días restantes en 30-day window, status de FedEx items. Alerts highlighted (órdenes en riesgo).
**Momento de valor (Project Manager):** "Finalmente puedo ver qué está llegando, qué está atascado y qué está en riesgo de storage fee."
**🎯 Tour step:** `b2.1`

### Step 2: Work Order Dispatch + Operations Manager Notification
**Análogo MBI:** ARAgingWrapScene
**Qué muestra:** Una orden acaba de alcanzar 100% received. Strata muestra: "Orden #CNY-0847 — 100% received en CORE — 24 días en WIG (6 días antes del límite). Operations Manager Bly notificado automáticamente. ¿Aprobar dispatch?" Claims Analyst aprueba → Strata genera work order para imprimir (constraint externo: firma física requerida).
**Momento de valor (Project Manager explícita):** Project Manager pidió específicamente una notificación automática a todos los recursos del CORE cuando la orden está received en full.
**🎯 Tour step:** `b2.2`

---

## Tour steps definitivos

| Step ID | Tab | Scene | Descripción demo |
|---|---|---|---|
| `b1.1` | Agency Fee | CoNY Morning Queue | Claims Analyst ve sus órdenes del día con AI triage |
| `b1.2` | Agency Fee | Pricing Validator + Discount Auto-calc | AI valida SIF vs contrato, calcula descuento |
| `b1.3` | Agency Fee | CPR Reconciliation | AI detecta discrepancia de horas, Claims Analyst aprueba |
| `b1.4` | Agency Fee | Agency Fee Verification | AI compara fee esperado vs Receiving Coordinator Bos |
| `b2.1` | Receiving | Order Status Monitor | Dashboard de órdenes CoNY con 30-day countdown |
| `b2.2` | Receiving | Work Order Dispatch + Operations Manager Alert | 100% received → Operations Manager notificado → Claims Analyst aprueba |

---

## Componentes React a crear (referenciando MBI)

| Componente BFI | Base | Complejidad |
|---|---|---|
| `BFIPage` (shell con 2 tabs) | MBIAccountingPage | Baja |
| `BFIPersonaBadge` (Claims Analyst) | MBIPersonaBadge | Mínima |
| `BFIModuleHeader` | MBIModuleHeader | Mínima |
| `CoNYMorningQueue` | AccountingMorningQueue | Media |
| `AgencyFeeValidatorScene` | AISpecCheckSimulation | Media-alta |
| `CPRReconciliationScene` | NonEDIReconcilerScene | Media |
| `AgencyFeeVerifyScene` | ARAgingReviewScene (adapted) | Media |
| `CoNYOrderMonitorScene` | ARAgingReviewScene | Media |
| `WorkOrderDispatchScene` | ARAgingWrapScene | Media |
