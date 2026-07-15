# COI Demo — Speech & Guía de Presentación

> Tono: consultor de confianza, no vendedor. No leer la pantalla — conectar features con pain points.

---

## 1. INTRO (3 min, antes de abrir el demo)

### Opening

Gracias por el tiempo. Voy a ser directo:

**No vinimos a venderles un software.** Vinimos porque leímos lo que necesitan — acknowledgments más rápidos, menos re-entry, reportes que no dependan de Excel, quotes que los clientes quieran abrir — y creemos que podemos resolverlo sin pedirles que cambien nada de lo que ya tienen.

### El Problema

Hoy el journey de un proyecto se ve así:

Un vendor manda un PDF con 200 items. Alguien lo re-tipea en cotización. Esos mismos datos se tipean en el PO. Llega el acknowledgment — se compara a mano contra el PO, línea por línea. Cuando se genera el invoice, los mismos 200 items se tipean por quinta vez.

**200 items. 5 sistemas. 1,000 entries manuales.** Y si hay un error en la línea 41, nadie lo descubre hasta que el cliente llama.

Mientras tanto, Annie pasa 4 horas cada lunes compilando reportes en Excel. Martin quiere saber si el acknowledgment se procesó pero tiene que preguntar. Y el cliente — ese que pagó $43,000 — no tiene idea de dónde está su pedido.

### La Propuesta

Strata no reemplaza nada. **Es una capa de AI entre sus sistemas existentes** — Core, eManage ONE, QuickBooks, Outlook — que los conecta.

1. **Eliminamos el re-entry.** El dato se ingresa una vez y fluye a 5 sistemas. 847 entries eliminadas por proyecto.
2. **Automatizamos lo repetitivo, escalamos lo que importa.** 95% de acks se procesan solos. El 5% llega al expert con opciones concretas.
3. **Reportes determinísticos.** Auto-generados cada lunes a las 7 AM. No es un LLM — son reglas de negocio auditables.

En producción, todo vive dentro de Copilot — Outlook, Teams, Excel. No es otro software. Es una capa.

### Transición

Van a ver 3 flows con datos de Apex Furniture — 200 items, $43,750, 4 zonas:

- **Flow 1**: Email con RFQ → AI extrae del PDF → quote → aprobación → PO. Zero re-tipeo.
- **Flow 2**: Acknowledgments del vendor → AI compara contra PO → resuelve excepciones.
- **Flow 3**: Claim de warranty → AI valida docs y reglas → reporte al cliente en su celular.

Empecemos.

---

## 2. PAIN POINTS — Referencia rápida

*6 temas que agrupan los 13 pain points. Usar para conectar lo que ven en pantalla con lo que les duele.*

### A. Zero Re-Entry (pain points #4, #5, #13)

| Lo que dicen | Lo que ven en el demo | One-liner |
|---|---|---|
| "Re-tipeamos el PDF a mano" | Step 1.2: PDF a la izquierda, datos normalizados a la derecha. Zero teclado. | *"Eso pasó sin que nadie tocara un teclado."* |
| "Tocamos datos 5 veces en 5 sistemas" | Step 1.12: Before/After card — 1,000 entries → 0 re-entries. KPI: 847 eliminadas. | *"200 items, 5 sistemas, zero re-entry."* |
| "CRM, quoting, receiving, daily log, QB desconectados" | Step 3.6: trazabilidad email→quote→PO→ack→claim. Invoice auto-linked a Daily Log. QB synced. | *"5 sistemas, un solo dato ingresado una vez."* |

### B. Acknowledgments & AP (pain points #1, #2)

| Lo que dicen | Lo que ven en el demo | One-liner |
|---|---|---|
| "Comparamos acks a mano, 45 min cada uno" | Flow 2: 8 agentes comparan 50 líneas. 47 acks/día, 95% sin intervención. 3-way match PO↔ACK↔INV. | *"47 acks al día. Misma lógica, misma calidad."* |
| "No sabemos dónde están los envíos" | Step 3.5: tracking multi-zona estilo Amazon. El cliente confirma recepción desde su celular. | *"Tu cliente lo sabe antes que tú."* |

### C. Reportes & Confianza (pain points #6, #7)

| Lo que dicen | Lo que ven en el demo | One-liner |
|---|---|---|
| "Annie pasa 4 hrs/lunes en Excel" | CRM Reports: 3 reportes auto-generados cada lunes 7 AM. Backlog, Bookings, Project Health. | *"Annie, tu ritual del lunes se acabó."* |
| "No confío en que AI genere mi reporte" | Badge "Rule-Based · Deterministic". 6 reglas, v2.4, 52 semanas mismo formato. | *"No es ChatGPT. Son reglas auditables."* |

### D. Design & Quotes (pain points #8, #9)

| Lo que dicen | Lo que ven en el demo | One-liner |
|---|---|---|
| "Ya evaluamos otras AI para takeoffs" | Step 1.2: AI Takeoff (4 pisos, 125 workstations). Step 1.5: Spec Validation (3 flags, 96.5% pass). | *"3 horas de design review ahorradas."* |
| "Nuestros quotes son feos" | Step 1.7→1.8: quote técnico del dealer → quote visual del cliente en mobile. Mismo quote, dos vistas. | *"El dealer ve márgenes. El cliente ve estilo."* |

### E. Arquitectura & Adopción (pain points #10, #11)

| Lo que dicen | Lo que ven en el demo | One-liner |
|---|---|---|
| "No queremos otro software" | Architecture Slide: Copilot for Outlook, Teams, Excel. Strata vive dentro de tu stack. | *"Es una capa, no una app."* |
| "Queremos mantener Core 18 meses" | Badges ⚡ eManage ONE, System of Record, Supplier Portal. Diagrama: sistemas → Strata → outcomes. | *"Core stays. Strata accelerates."* |

### F. Customer Experience (pain points #3, #12)

| Lo que dicen | Lo que ven en el demo | One-liner |
|---|---|---|
| "La comunicación es reactiva" | CRM: 4 comms auto-enviadas. Step 3.5 Mobile: portal con My Orders, Claims, Messages. | *"Strata comunica en tu nombre."* |
| "Queremos co-innovar en problemas reales" | 12/12 pain points cubiertos. Cada feature nació de conversaciones con dealers. | *"Todo es operacional, nada es catálogo."* |

---

## 3. TALKING POINTS POR STEP

*Frases de referencia durante el demo. No leer — usar como ancla.*

### Flow 1: Quote → PO

| Step | Frase |
|------|-------|
| 1.1 | "Intake automático. Nadie descargó nada." |
| 1.2 | "PDF a la izquierda, datos a la derecha. Zero teclado." |
| 1.3 | "94% confianza. Lo que no está seguro, lo escala. No adivina." |
| 1.5 | "AI hizo el 95%. El expert valida el 5% que importa. Unit cost, sell, margin por línea." |
| 1.7 | "$43,750, margin 35.4%. Un click." |
| 1.8 | "Mismo quote, vista del cliente. Productos y estilo, no part numbers." |
| 1.9 | "PO al supplier. Badge ⚡ Supplier Portal. Strata conecta, no reemplaza." |
| 1.12 | "CRM auto-populated. Before/After: 1,000 entries → 0." |

### Flow 2: Acknowledgments

| Step | Frase |
|------|-------|
| 2.1 | "47 acks hoy — vemos 2. Badge ⚡ eManage ONE." |
| 2.2 | "50 líneas comparadas. HAT confirmado auto. AIS: error en grommet, flagged." |
| 2.3 | "Rutina se acepta auto. Excepciones se escalan con opciones." |
| 2.4 | "El expert revisa 3 líneas, no 50. Un click: Send to System of Record." |

### Flow 3: Service & Reporting

| Step | Frase |
|------|-------|
| 3.1 | "5 docs validados. Label 62% — posible mismatch. El expert decide." |
| 3.3 | "6 reglas. Repair $510 > $500 max. AI sugiere, expert elige." |
| 3.5 | "Portal del cliente: Orders, Claims, Messages. Confirma entregas desde el celular." |
| 3.6 | "Trazabilidad completa. 5 sistemas, zero re-entry." |

---

## 4. CIERRE (60 seg)

Tres cosas antes de preguntas:

**Primero**: Todo corre sobre sus sistemas actuales. Core se queda. eManage ONE se queda. Strata es una capa.

**Segundo**: Los números son reales. 847 entries eliminadas. 95% de acks sin intervención. Reportes cada lunes. Specs validados antes de llegar al vendor.

**Tercero**: En producción, Strata vive dentro de Copilot — Outlook, Teams, Excel. Nadie aprende software nuevo.

La pregunta no es "¿funciona?" — acaban de verlo. La pregunta es: **¿cuántos acknowledgments quieren procesar la primera semana?**

---

## 5. OBJECIONES

| Objeción | Respuesta |
|----------|-----------|
| "Ya tenemos Core" | "Core se queda. Strata lo potencia." |
| "¿Si el AI se equivoca?" | "Expert Hub. AI: 95%, expert: 5%. Nada sale sin aprobación humana." |
| "Evaluamos otras AI" | "Pregúntenles cómo manejan 50 líneas de eManage ONE. Si viven dentro de Copilot." |
| "¿Cuánto toma?" | "Fase 1: acknowledgments. La más rápida y la que más ahorra hoy." |
| "No confío en AI para reportes" | "Tampoco nosotros. Rule-based, no LLM. 6 reglas, auditables, 52 semanas mismo formato." |

---

## 6. NOTAS DEL PRESENTADOR

1. **No leer la pantalla.** El demo se explica solo. Tu trabajo: conectar con pain points.
2. **Pausar en momentos wow.** Step 1.2 (extracción), 2.2 (comparación), 3.6 (trazabilidad). Silencio > explicación.
3. **Usar nombres.** "Apex Furniture", "Annie", "Martin", "Daniel" — no genéricos.
4. **Si preguntan por Core**: Architecture Slide (botón abajo-derecha). El diagrama habla solo.
5. **Si preguntan por Copilot**: Tab "Copilot Integration" en Architecture Slide.
6. **"¿Esto es real?"**: "Demo funcional con datos reales. La lógica es la misma que va a producción."
