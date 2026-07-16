# BFI Furniture — Blueprint V0 & Process Reference

> Fuente: Sesión Notion AI (May 2026) — transcripción de proceso E2E con Lauren DeMarco y Michael Boyle.
> Complementa: `bfi-flows.md` (análisis de cuellos de botella) y `bfi-sot.md` (source of truth de empresa y personas).
> Uso: referencia autoritativa para datos demo, lógica de scenes, y matching de documentos.

---

## 1. Blueprint V0 — 3 fases del ciclo CoNY

El ciclo CoNY completo es **3 fases secuenciales** que los 16 demo steps comprimen:

```
Phase 1 — Agency Fee:  AF-1 → AF-7   (quote intake → PO recibido → CORE entry completo)
Phase 2 — Receiving:   R-1 → R-FX → R-6  (HM ships → WIG confirma → 100% gate → work order)
Phase 3 — Closure:     C-1 → C-5    (install completa → CPR → fee verify → CORE close)
```

### Dependencia estructural crítica (para el demo)

> Sin 100% received en CORE → no hay work order → no hay CPR/invoice → no se puede cerrar Agency Fee.

**Flow 2 (Receiving) desbloquea el cierre de Flow 1 (Agency Fee). Los dos flujos no son independientes.**

---

## 2. AS-IS — Agency Fee: pasos reales A1–A15

> Comprimidos a 8 scenes demo (b1.1–b1.8).

| Paso | ID | Trigger | Rol | Inputs | Sistema | Output / DoD | Excepciones | Demo scene |
|---|---|---|---|---|---|---|---|---|
| Quote intake | A1 | Email MK designer | Lauren | Email + PDF specs + ZIP | CORE, Email | Quote # en CORE, reply al designer | — | b1.1 (queue) |
| SIF pricing validation | A2 | Quote # existe | Lauren | SIF del designer | OmniQuote | Corrected SIF + quote comparison | Restricted items → sub-path A2a | b1.2 |
| Restricted item resolution | A2a | Item no está en catálogo CoNY | Lauren + Designer | Screenshot del flag | Email | Designer confirma o sustituye | 1–3 días espera MK | b1.2 (sub-step) |
| SIF load en CORE | A3 | Corrected SIF listo | Lauren | Corrected SIF | CORE | SIF cargado en CORE | — | b1.2 (parte) |
| Contract type config | A4 | Orden CoNY confirmada | Lauren | Contract# / PO header | CORE | City vs State type guardado, order = third party bill | — | b1.2 (parte) |
| Discount calc | A5 | Orden third-party bill | Lauren | List + Sell prices | CORE | Descuento% + true-up line → 0 GP | Cálculo manual: (sale÷list)-1 | b1.3 |
| Labor quote request | A6 | Orden activa | Lauren | Carton count estimado (si >600 cubes → strike truck) | WIG, Email | Labor quote de WIG (formato libre) | Formato no estandarizado | b1.4 |
| Labor categorization | A7 | Quote WIG recibido | Michael | WIG quote (texto libre) | — | Categorías: Inside Delivery, Teamsters, Carpenters, OT Carpenters, Strike Truck | OT differential por categoría | b1.4 |
| Labor entry en CORE | A8 | Michael categoriza | Lauren | Cifras de Michael | CORE | Labor SIF template completado en CORE | — | b1.4 (parte) |
| Order confirmation | A9 | Pricing + labor completo | Lauren | Datos CORE | Email, CORE | Propuesta enviada al cliente | — | b1.5 |
| PO receipt | A10 | Cliente envía PO | Lauren | PO + delivery date | CORE, R Drive | CORE order completo + Omni + Excel + R Drive | Order # matching por agencia = manual | b1.5 |
| EDI acknowledgement | A11 | Order en CORE | Dianna (excluida del demo) | ACK EDI en Omni | Omni | Ack aceptado/corregido | Nota: Kate pidió excluir a Diana | — |
| WIG receiving doc | A12 | Producto llega a WIG | WIG → Lena | Word doc (pág1: WIG RR# + carton count) | CORE | Receipt ingresado en CORE | Lena sin SLA, hasta 7 días | b2.3 |
| 100% gate | A13 | Lena notifica | Lauren | CORE received% | CORE | Work order impreso | Verificación manual de Lauren | b2.4 |
| CPR reconciliation | A14 | Post-instalación, WIG envía invoice + CPR | Lauren → Michael → Nancy | CPR (horas reales) vs quoted hours | CORE, Omni, Email | CORE ajustado, Nancy notificada | 75% tienen discrepancia | b1.6 + b1.7 |
| Agency fee close | A15 | HM invoice disponible | Lauren → Patricia | Invoices Omni + fee Nancy | CORE | Agency fee aplicado, CORE cerrado | Blind spot: nunca se verificó vs contrato | b1.8 |

---

## 3. AS-IS — Product Receiving: pasos reales R0–R19

> Comprimidos a 8 scenes demo (b2.1–b2.8).

| Paso | ID | Trigger | Rol | Inputs | Sistema | Output / DoD | Excepciones | Demo scene |
|---|---|---|---|---|---|---|---|---|
| MK shipea | R0 | PO confirmado | Miller Knoll | Shipment | HM internal | Shipment activo | — | (pre-story) |
| Tipo de shipment | R1 | Producto en tránsito | Sistema | Carrier type | Omni | Freight → WIG / FedEx → posible bypass WIG | FedEx bypasses WIG sistemáticamente | b2.1 dashboard |
| Freight llega WIG | R2 | Entrega física | WIG staff | Cartons físicos + packing slips | WIG internal | Receipt físico registrado | Daño → flag en 24–48h | b2.3 (Lena) |
| WIG envía doc | R3 | 24–48h post-receipt | WIG | Word doc (pág1: RR# + carton count; pags siguientes: packing slips) | Email → inboxes | Doc aterriza en Lauren, Michael, Lena CC | Sin procesamiento automático | b2.3 |
| Lena ingresa en CORE | R4 | Doc llega al inbox de Lena | Lena | Word doc + packing slips | CORE | Receipt ingresado contra order lines | Sin SLA, hasta 7 días; no indica si 100% o parcial | b2.3 |
| Email resumen de Lena | R5 | Lena termina batch | Lena | Lista órdenes procesadas | Email | Email a Lauren sin indicar % de completitud | — | b2.3 (parte) |
| Lauren verifica 100% | R6 | Email Lena o proactivo | Lauren | CORE received% (Open Order Dashboard) | CORE | ¿100%? SÍ → continúa / NO → R7 | Lauren comenzó a usar dashboard recién Apr 21 | b2.4 |
| Diagnóstico de gap | R7 | CORE no muestra 100% | Lauren | Omni shipment notifications | Omni | ¿FedEx gap? ¿Lena pendiente? ¿Short shipment real? | Diagnóstico manual cada vez | b2.2 |
| POD request | R8 | FedEx gap detectado | Lauren | FO number de Omni | Email → Andy (HM) | POD enviado a Lauren | 2-hop: Andy → Lauren → WIG | b2.2 |
| WIG confirmation | R9 | POD recibido | Lauren | POD de Andy | Email → WIG | WIG confirma en su sistema + envía receiving doc | Vuelve a R4 para esos ítems | b2.2 |
| 100% confirmado | R10 | All lines 100% en CORE | Lauren | CORE status | CORE | Gate desbloqueado → imprime work order | — | b2.4 (alert) |
| Work order print | R11 | 100% gate OK | Lauren | CORE work order | CORE, Printer | Work order impreso + drawings | NYC requiere firma física con tinta | b2.5 |
| Walter handoff | R12 | Work order listo | Lauren | Papel impreso | Entrega física | Walter recibe su copia | Walter: primer awareness del proyecto | b2.6 |
| WIG package | R13 | Walter recibió | Lauren | 2 copias work order + drawings + POs | FedEx o en mano | WIG tiene paquete completo | — | b2.5 (parte) |
| Walter schedula | R14 | WIG tiene todo | Walter | Work order + coordinations con city agency | Teléfono / email | Instalación scheduleada | Conflictos de agenda city agency = descubiertos tarde | b2.6 |
| Post-install issues | R15 | Post-instalación | Installer | Notas de damage o issues | CORE | Warranty/service record | (no en demo) | — |
| Storage window | R16 | Desde arrival en WIG | BFI (Lauren monitoreo) | CORE received date | CORE | ¿30 días excedidos? → storage fee | Sin monitoring automático hoy | b2.7 |
| CPR desde WIG | R17 | Post-instalación | WIG/installer | Invoice package + CPRs | Email + papel | Lauren recibe para reconciliar | Mismo proceso que A14 | b1.6 |
| Relay a Nancy | R18 | Lauren reconcilia CPR | Lauren → Michael → Nancy | Revised amounts | Email chain | Nancy actualiza invoice MK | 1–3 días de relay chain | b1.7 |
| Close | R19 | Invoice alineado | Cadena | Confirmaciones de match | CORE | Orden "invoiceable" | — | b2.8 |

---

## 4. Sub-path FedEx (R-FX)

El FedEx sub-path es un loop dentro del proceso de receiving que ocurre en **cada shipment FedEx**:

```
MK shipea FedEx small parcel
        │
        ▼ (bypasses WIG — NO hay WIG confirmation)
Lauren no recibe ninguna señal de arrival
        │
        ▼
Lauren detecta gap (manualmente, chequeando Omni):
   Item aparece en Omni como shipped pero NO en WIG receiving doc
        │
        ▼
Lauren emailea a Andy (HM) con FO number → pide POD
        │   ← espera respuesta Andy
        ▼
Andy manda POD a Lauren
        │
        ▼
Lauren reenvía POD a WIG + fecha de delivery → pide receiving confirmation
        │
        ▼   ← vuelve al loop principal (R4)
WIG envía nuevo doc con esos ítems confirmados
```

**Strata elimina este loop:**
1. Detecta discrepancia Omni vs WIG log automáticamente
2. Pre-rellena email a Andy con FO numbers
3. Lauren aprueba con 1 click → Andy responde → WIG confirmado

---

## 5. Bingo Document Spec (HM Packing List)

El Bingo # es el **identificador de cartón** dentro de un embarque HM. Aparece en el HM Packing List adjunto al WIG Receiving Report.

### 5a. Estructura del documento (3 secciones)

**Sección 1 — Bingo Sheet (portada)**
```
Order GD2891 · Shipping ID GD2891-1
Total cartons declared: 36
Missing noted: Bingo #36

Bingo # │ Product               │ Qty
────────┼───────────────────────┼─────
1 – 8   │ Lounge Chair          │ ×8
9 – 20  │ Work Table 60×30      │ ×12
21 – 24 │ Storage Unit          │ ×4
25 – 35 │ Side Chair            │ ×11
36      │ Side Chair (FedEx)    │ ×1   ← missing
```

**Sección 2 — Line Item Sequence (producto → Bingo#s)**
```
Line  │ Product             │ Qty │ Bingo #s
──────┼─────────────────────┼─────┼──────────────
L1    │ Lounge Chair        │  8  │ 1, 2, 3, 4, 5, 6, 7, 8
L2    │ Work Table 60×30    │ 12  │ 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
L3    │ Storage Unit        │  4  │ 21, 22, 23, 24
L4    │ Side Chair          │ 12  │ 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36
```

**Sección 3 — Bingo Number Sequence (index inverso: Bingo# → producto)**
```
Bingo # 1  → L1 Lounge Chair (unit 1 of 8)
Bingo # 8  → L1 Lounge Chair (unit 8 of 8)
Bingo # 9  → L2 Work Table 60×30 (unit 1 of 12)
...
Bingo # 35 → L4 Side Chair (unit 11 of 12)
Bingo # 36 → L4 Side Chair (unit 12 of 12) ← MISSING, FedEx small parcel
```

### 5b. Datos demo (DOH-0671 — WIG RR-38821)

```
WIG Receiving Report #RR-38821
Date: May 6, 2026
Dealer: BFI Furniture
Client: NYC Dept. of Health (DOH-0671)
PO: 18091-29443
Order / SO#: GD2891
Carrier: ALTL
Received: 36 cartons declared · 35 physically confirmed
Damage noted: None
Missing: Bingo #36 → FedEx small parcel, bypassed WIG
```

---

## 6. Matching Keys — prioridad para unir documentos WIG/HM → CORE

Orden de prioridad para match entre packing list de HM, WIG Receiving Report, y orden en CORE:

| Prioridad | Campo | Dónde aparece |
|---|---|---|
| 1 | **Ship To PO** (en HM packing list) + Dealer = BFI | HM packing list header |
| 2 | **PO Number** (en WIG Receiving Report header) | WIG RR portada |
| 3 | **HM Order Number / SO Number** (ej. GD2891) | HM packing list + CORE |
| 4 | Date window + client/agency name | Fallback cuando los IDs no coinciden |

**Nota crítica:** Cada city agency tiene su propio numbering system. El CORE order number raramente coincide directamente con el PO de la agencia — Lauren matchea manualmente hoy. El Strata matching debe usar la cascada de 4 campos.

---

## 7. Canonical Data Model

Entidades que los datos hardcoded del demo deben respetar para mantener consistencia entre scenes.

```typescript
type OrderStatus =
    | 'entered'           // Quote/order creado en CORE
    | 'shipped'           // HM confirmó envío
    | 'received_partial'  // Lena ingresó, no 100%
    | 'received_100'      // 100% en CORE — gate desbloqueado
    | 'work_order_issued' // Lauren imprimió y entregó a Walter
    | 'installed'         // Walter coordinó instalación
    | 'cpr_received'      // WIG mandó CPR post-instalación
    | 'reconciled'        // Lauren reconcilió CPR, Michael notificó Nancy
    | 'closed'            // Patricia cerró en CORE, agency fee aplicado

interface DemoOrder {
    order_id: string        // CORE: 'DOE-2847', 'NYPD-0394', 'DCAS-1182', 'DOH-0671'
    coNY_agency: string     // 'NYC Dept. of Education'
    po_number: string       // '18082-27619'
    hm_order_ref: string    // 'GD2891' (SO/Order # en HM docs)
    status: OrderStatus
    value_usd: number       // valor de la orden
    days_in_wig: number     // días desde arrival físico en WIG
    received_pct: number    // % received en CORE (0-100)
}

interface DemoShipment {
    shipping_id: string          // 'GD2891-1'
    type: 'freight' | 'fedex_small_parcel'
    carrier: string              // 'ALTL' (freight) | 'FedEx'
    cartons_expected: number
    cartons_received: number
    fo_numbers?: string[]        // FedEx FO#s: ['FX284920', 'FX284921', 'FX284922']
}

interface DemoReceivingEvent {
    rr_number: string            // 'RR-38821'
    received_date: string        // 'May 6, 2026'
    cartons_physically_received: number
    damage: boolean
    notes?: string               // 'Bingo #36 missing — FedEx small parcel'
}

interface DemoBingoUnit {        // Un cartón individual del embarque
    bingo_number: number
    status: 'received' | 'missing' | 'fedex_pending'
    product: string              // 'Lounge Chair'
    line_item: string            // CORE line ID: 'L1', 'L4'
    unit_number: string          // '1 of 8', '12 of 12'
}

interface DemoLaborLine {
    category:
        | 'inside_delivery'
        | 'teamsters'
        | 'ot_teamsters'
        | 'carpenters'
        | 'ot_carpenters'
        | 'strike_truck'
    hours_quoted: number
    hours_cpr: number | null     // null = pre-CPR
    rate_per_hour: number
    total_quoted: number
    total_cpr: number | null
    delta: number | null         // horas_cpr - horas_quoted (negativo = baja)
    delta_usd: number | null
}

interface DemoAgencyFee {
    t_code_pct: number           // 18% — CoNY contract rate
    expected_fee_usd: number     // calculado por Strata (sale price × t_code_pct)
    nancy_bos_fee_usd: number    // reportado por MK Invoice Processor
    variance_usd: number         // 0 si match, >0 si discrepancia
    status: 'match' | 'gap' | 'pending'
}
```

---

## 8. Automation Hooks → Demo Scenes

Los 5 hooks de automatización que Strata implementa, mapeados a qué scene los demuestra:

| Hook | Proceso automatizado | Trigger | Output | Demo scene |
|---|---|---|---|---|
| **Hook 1** | WIG doc ingestion + Bingo # parsing → JSON estructurado | Email de WIG con Word doc adjunto | Tabla Bingo mapeada a CORE order lines | b2.3 WIGDocParserScene |
| **Hook 2** | 100% received monitor (CORE polling + FedEx expected vs actual) | received% en CORE cruza 100% | Notificación Lauren + status a Walter | b2.1 Dashboard + b2.4 Alert |
| **Hook 3** | POD orchestration: detecta FedEx gap desde Omni → draft email a Andy → track gaps | FedEx item en Omni sin WIG confirmation | Pre-filled POD request para Lauren | b2.2 FedExGapScene |
| **Hook 4** | CPR reconciliation: quoted vs CPR actual → delta por categoría + message packet a Michael | CPR document recibido | Diff table + mensaje pre-redactado a Michael | b1.6 CPR + b1.7 Relay |
| **Hook 5** | Agency fee verification: fee esperado (T-code calc) vs datos de Nancy Bos | Invoice MK disponible | Expected vs actual comparison + gap alert | b1.8 AgencyFeeVerify |

---

## 9. Labor Quote — Reglas sindicales NYC (para validación demo)

Las categorías de labor de WIG siguen reglas sindicales de NYC. Strata debe respetar estas reglas para que el demo sea creíble:

| Categoría | Cuándo aplica | Rate demo | OT differential |
|---|---|---|---|
| Inside Delivery | Siempre — llevar muebles desde camión hasta el piso | $85/h | No aplica OT en demo |
| Teamsters Local 807 | Operación de elevadores, carga pesada | $110/h | OT separado en CORE |
| Carpenters | Instalación y ensamble de muebles | $125/h | OT = línea separada |
| OT Carpenters | Horas adicionales de Carpenters | $187/h (aprox 1.5×) | Línea independiente |
| Strike Truck | Solo si embarque > 600 cubes | Variable | 100% BFI profit |

**Regla del strike truck:** si `cubes > 600` → aplica strike truck charge. Si ≤ 600 → `N/A` (sin costo). El demo usa 480 cubes → bajo el límite → `Strike Truck: N/A`.

**OT differential:** Las categorías con OT tienen líneas **separadas** en CORE — "Carpenters" y "OT Carpenters" son dos line items distintos. Esto es lo que genera la discrepancia más frecuente en CPR (Carpenters 50h → 45h + OT 8h → 6h = -$2,340 en DOE-2847).

---

## 10. Orders demo — datos canónicos

Tabla maestra de las 4 órdenes que aparecen en el demo. Todos los datos hardcoded en scenes deben coincidir con esta tabla.

| Campo | DOE-2847 | NYPD-0394 | DCAS-1182 | DOH-0671 |
|---|---|---|---|---|
| Agency | NYC Dept. of Education | NYPD Precinct 40 | NYC DCAS | NYC Dept. of Health |
| Value | $48,200 | $31,750 | $127,400 | $22,100 |
| PO # | 18082-27619 | 18083-31041 | 18085-19923 | 18091-29443 |
| HM Order # | GD2574 | GD2731 | GD2812 | GD2891 |
| Status (demo) | CPR pending | Pricing validation | Receiving partial | 100% received |
| Days in WIG | — | — | 18 | 22 |
| Received % | — | — | 72% | 100% |
| Days remaining | — | — | 12 | 8 |
| Featured in | b1.1 · b1.4 · b1.6 · b1.7 | b1.2 · b1.3 | b2.1 · b2.2 | b2.3 · b2.4 · b2.5 · b2.6 · b1.8 |

---

## 11. Cross-Process Connections (Agency Fee ↔ Receiving)

Los 7 puntos de conexión documentados en el lifecycle CoNY:

| ID | Conexión | Bloqueante | Steps |
|---|---|---|---|
| C1 | 100% receiving = handoff entre procesos. Sin receiving, no hay work order, sin work order, no se cierra Agency Fee | Sí | b2.4 → b1.8 |
| C2 | WIG es fuente de labor quotes Y receiving docs. Mismo formato libre en 2 puntos del lifecycle | No (eficiencia) | b1.4 ↔ b2.3 |
| C3 | CPR reconciliation = closing event compartido para ambos flows | Sí (payment) | b1.6 + b1.7 ↔ b2.8 |
| C4 | 30-day storage window crea presión. Lena lag comprime la ventana | No (financiero) | b2.7 ↔ b1.5 |
| C5 | FedEx gap bloquea ambos. Sin WIG confirmation → 100% gate bloqueado → work order bloqueado → AF no cierra | Sí | b2.2 ↔ b1.8 |
| C6 | Excel tracking duplicado. Mismas órdenes en dos spreadsheets sin sync con CORE | No (data drift) | b1.5 ↔ b2.1 |
| C7 | Lauren = single point of failure para todo el lifecycle CoNY | Sí (operacional) | Todos |

---

## 12. Personas — datos operativos (para diálogos y notificaciones demo)

| Persona | Rol en demo | Email demo | Aparece en |
|---|---|---|---|
| Lauren DeMarco | CoNY Account Lead — principal | lauren@bfifurniture.com | b1.1–b1.6, b2.1, b2.4–b2.5, b2.7–b2.8 |
| Michael Boyle | Director of Strategic Accounts | michael@bfifurniture.com | b1.4, b1.7 |
| Lena Cisowski | Receiving Coordinator | lena@bfifurniture.com | b2.3 |
| Operations Manager Bly | CoNY PM | walter@bfifurniture.com | b2.6 |
| Patricia Hilger | Finance / AR | patricia@bfifurniture.com | b1.8 |
| Nancy Bos | MK Invoice Processor (externo) | nancy.bos@millerknoll.com | b1.7, b1.8 |
| Andy | MK Contact (externo) | andy@millerknoll.com | b2.2 |
| MK Designer | Trigger de quote intake (externo) | designer@millerknoll.com | b1.1, b1.2 |
