# BFI Demo Review — Transcript
**Fecha:** May 12, 2026  
**Participantes:** Diego Zuluaga, David Penagos (dpenagos@goavanto.com), Jenniffer Vargas  
**Archivo adjunto:** BFI Demo Review

---

## Resumen ejecutivo (Gemini)

La reunión reorganizó los flujos de trabajo del demo e integró automatización mediante OCR.

- **Flujos:** Agency Fee va PRIMERO, luego Product Receiving (antes estaba al revés)
- **OCR:** Se integra en el primer paso del flujo para automatizar inyección de datos
- **Automatización:** Notificaciones de estado, conectividad VPN para contratos de ciudad
- **Estrategia:** Prototipo → validación interna → presentación cliente → Tech Solution (Cristian)

---

## Próximos pasos acordados

- [David] Ubicar contrato digital de BFI (¿R-drive o digitalizar?)
- [David] Revisar lógica comisiones / porcentajes en transcripts
- [David] Mostrar documentos adicionales enviados por cliente (tras repaso del flujo)
- [Diego] Descargar documentos compartidos por David para incorporar como referencia
- [Jenniffer] Consultar con Cristian entrega documento técnico
- [Diego] Ajustar demostración / implementar cambios finales

---

## Transcripción completa

### 00:01:09 — Intro y orden de flujos

Diego Zuluaga: Acuerdan cambiar orden: primero Agency Fee, luego Product Receiving.

David Penagos: "El product receiving es un punto intermedio casi inmerso dentro del agency fee."

David agregó documentos de ejemplo en Notion (Product Receiving) que le mandaron de Dani Bermúes.

---

### 00:06:31 — Roles en el flujo Agency Fee

David Penagos: "En el de [Agency Fee] son cuatro roles. La mayoría es Lauren de Marco, que es la account manager de ese cliente."

Lauren ejecuta casi todas las acciones principales.

---

### 00:08:29 — Detalles operativos del flujo Agency Fee

**Lo que Lauren recibe:**
> "Lauren recibe un correo del fabricante que es Herman Miller. Básicamente lo recibes de un diseñador de Herman Miller."
> "En el correo ella tiene un PDF donde lista todas las especificaciones de todos los productos, **los diseños, pues el dibujo de la parte arquitectónica** y un archivo SIF que tiene todo el tema de los códigos de producto y precios."

**Acción de Lauren:** Coge sus archivos y hace una revisión contra OVNIQ (plataforma de Herman Miller). OVNIQ devuelve un archivo SIF corregido y la comparación de la cotización. Lauren sube la info corregida a CORE en formato SIF.

**Diego sobre el plano (00:11:56):**
> Diego: "el SIF precios y el diseño es como que el plano. Listo."
> Diego: "**Falta como referenciar eso ahí.**"
> David: "Sí."

→ **GAP IDENTIFICADO:** El PDF adjunto en el email de Robert Chen debe mostrar:
  1. Especificaciones de producto (ya implementado como `specs.pdf`)
  2. **Dibujo arquitectónico / plano de distribución del mobiliario** (NO implementado)
  3. El SIF (ya implementado como tab separado)

---

### 00:13:21 — OCR y automatización

Jenniffer propone usar OCR para automatizar inyección de datos del PDF.

Diego: integrar validación OCR en el primer paso — sistema detecta llegada del documento y ejecuta validación OCR automáticamente.

---

### 00:16:11 — Contrato y auditoría

Problema: la ciudad exige firmas físicas y documentos impresos.
David se compromete a revisar dónde está alojado el contrato (¿R-drive?).

---

### 00:17:30 — T-codes y porcentajes de Agency Fee

OVNIQ lee los SIF y aplica automáticamente el porcentaje de Agency Fee según tipo de producto y T-code.
Porcentajes varían: 4%, 3.9%, 2.9%, etc. según producto.

Fórmula de descuento (Ciudad de NY — no gross profit):
> Descuento = (Valor de venta ÷ Precio de lista) - 1

Dos caminos: contrato **ciudad** NY vs. **estado** NY → diferente estructura de precios, pero mismo proceso. Se identifica por número de contrato en el encabezado de la Purchase Order.

---

### 00:22:23 — Cotización de mano de obra (Labor)

Lauren solicita cotización de trabajo a **Workplace (Wick)**: entrega, instalación, cargos de camiones.
**Michael** (jefe de Lauren) revisa y compila cifras de mano de obra: carpinteros, instaladores, etc.

Line items en CORE (template preexistente):
- Inside Delivery
- Installation
- OT Differentials
- Truck Charge

Michael ingresa los números en CORE manualmente. Lauren genera la propuesta y la envía al cliente (contacto identificado por el diseñador).

---

### 00:24:03 — Purchase Order y transmisión EDI

Cliente (agencia NYC) genera Purchase Order (puede tardar 1 semana a 1 año).
Lauren confirma fecha de entrega → Workplace da 30 días (después aplican cargos adicionales).
Lauren guarda PO en **disco R** (servidor local, requiere VPN).
Orden ingresa en CORE como factura de tercero → EDI automático desde CORE hacia OVNIQ (sistema Herman Miller).
OVNIQ genera formulario de aceptación del cliente (acknowledgement).

**Diana** (persona con resistencia al cambio, excluida del demo por decisión de Kate) revisa acknowledgement EDI.

---

### 00:28:51 — Flujo Product Receiving

Inicio: Herman Miller envía a Workplace. Todo linked por **Vendor Order number**.

Workplace recibe físicamente y usa **Bingo Sheet** (documento Word):
- 35 cajas marcadas con círculo si están presentes
- Carton 34 no encontrado → escrito manualmente "no se encuentra la caja 34"
- No hay checkbox para "faltante" en el documento

Lena (receiving coordinator BFI) carga en CORE sin distinguir orden completa vs. parcial.

Lauren revisa, pide bingo sheet, si falta algo pide prueba de envío a Herman Miller (Andy).

---

### 00:31:51 — Claims y notificaciones

Si falta algo → reclamo a Herman Miller.
Diego sugiere: dropdown de motivos + campo de notas para detallar faltantes.

**Walter (CoNY PM):** Solo se entera al final cuando Lauren le lleva documentos impresos.
Sistema en CORE permite generar notificaciones automáticas → ya implementado en demo.

---

### 00:34:41 — Documentos de trazabilidad de mano de obra (CPR)

David muestra documentos adicionales en Notion — trazabilidad de pagos de mano de obra:

Vendor Order #17706 linkado en todos los archivos:
1. **Correo** con factura de Workplace (costos de instalación)
2. **Firma manual** del empleado (carpintero, 1:00–3:30)
3. **Colilla de pago certificada** (para ciudad de NY — sindicatos)

Ciudad de NY trabaja con empleados sindicalizados → pagos deben coincidir casi al centavo.

→ **RELEVANCIA PARA EL DEMO:** Estos documentos apoyan la trazabilidad del CPR (step a1.3 / CPRScene). Son el sustento de "por qué el CPR importa" — son la evidencia de los pagos certificados.

---

### 00:37:45 — Prioridades y cierre

Prioridades de trabajo:
1. Smart Comparator (alta prioridad)
2. Workplace (para mañana)
3. BFI (para el jueves)

David confirma que el contrato está en el drive de la empresa → evaluar VPN para acceso.

---

## Análisis de gaps para el demo

| Gap | Descripción | Step afectado | Severidad |
|---|---|---|---|
| **Plano arquitectónico** | El PDF del email de Robert Chen debe incluir un dibujo de distribución del mobiliario, no solo specs de producto | a1.2 (QuoteIntakePricingScene — tab PDF) | 🟠 Mencionado explícitamente en transcript 00:11:56 |
| **Documentos CPR trazabilidad** | Factura Workplace + firma manual + colilla de pago deben referenciarse en el flujo CPR | a1.3 (CPRScene) | 🟡 Contexto — David mostró estos docs como referencia |
| **Acknowledgement (Diana)** | Excluido del demo intencionalmente — Diana tiene resistencia al cambio | Excluido | ✅ Decisión correcta |
| **Disco R / VPN** | Contrato guardado en servidor local, requiere VPN — David lo revisará | Contexto futuro | 🟡 Info, no demo |
