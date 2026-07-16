# Workscapes — Análisis Brief vs Demo
**Fecha:** Mayo 2026 · **Preparado por:** Avanto

---

## El hilo conductor

Un empleado de campo gasta $142.50 en combustible y estacionamiento. Ese gasto tiene que viajar por 4 personas antes de que le reembolsen. Esta es la historia de ese viaje.

**Roles involucrados:** Empleado (John) → Manager (Operations Manager) → AP Coordinator (Accountant) → CFO (CFO) / CAO (AP Coordinator)
**Plataformas:** 📱 Móvil (pasos del empleado) · 🖥 Desktop (pasos del resto)
**Brief:** 6 pantallas wireframe · **Demo:** 8 pasos (la diferencia se explica en cada paso)

---

## Paso 1 — El empleado envía un gasto

| | **HTML Brief (Screen 1)** | **Demo (w1.1)** |
|---|---|---|
| **Rol** | Empleado · 📱 Móvil | Empleado (John) · 📱 Móvil |
| **Entra porque** | Tiene un recibo que reportar | Tiene un recibo que reportar |
| **Qué ve al abrir** | Cámara centrada + formulario vacío abajo | Pantalla de login → lista de gastos previos → opciones de carga |
| **Cómo carga el recibo** | Toca cámara | Elige entre: Foto, Galería, PDF, o Excel (importación masiva) |
| **Qué hace el sistema** | Detecta monto, fecha, categoría automáticamente | Animación OCR: campos se llenan uno por uno en tiempo real |
| **Resultado del AI** | `$47.50 · Dining · 05/06/26` (ejemplo del brief) | `$142.50 · Fuel + Parking · May 5, 2026` (gasto canónico) |
| **Campo Categoría** | Dropdown seleccionable ▾ | Tappable — abre selector inline con 5 opciones para confirmar o cambiar |
| **Campo Manager** | Dropdown seleccionable ▾ (Operations Manager Solano) | Read-only (configurado por el admin, no editable por el empleado) |
| **Múltiples recibos** | "📎 Receipt attached · + Add another" | Botón "+ Add another receipt" — escanea y adjunta automáticamente |
| **Nota al manager** | No aparece | Campo opcional de texto libre antes de enviar |
| **Acción principal** | Botón "Submit Expense →" | Botón "Submit Expense →" |
| **Qué ve después de enviar** | `Submitted ○ → Approved ○ → Paid ○` (3 pasos) | `Submitted ✓ → In Review ○ → Approved ○ → Paid ○` (4 pasos) + SLA 3 días + nombre de Operations Manager |
| **Sale hacia** | Notificación automática a Operations Manager | Notificación automática a Operations Manager |
| **Alineado** | ✅ Categoría editable corregida · Manager read-only es decisión de diseño |

---

## Paso 2 — La manager ve la cola de aprobaciones

| | **HTML Brief (Screen 2)** | **Demo (w1.2)** |
|---|---|---|
| **Rol** | Manager · 🖥 Desktop | Manager (Operations Manager Solano) · 🖥 Desktop |
| **Entra porque** | Tiene gastos pendientes de aprobar | Le llegó notificación de un gasto nuevo |
| **Qué ve al abrir** | Lista de 3 gastos con título "Pending Approvals (3)" | Cola de 5 gastos con filtros, búsqueda y categorías |
| **Formato de cada fila** | 🧾 ícono + nombre + monto + categoría + recibos visibles | Nombre + monto + categoría + estado de recibos + edad del gasto |
| **Recibos visibles** | "2 receipts ✅ visible" junto al nombre | Ícono de recibo + cantidad + checkmark verde |
| **Alerta de SLA** | Sponsor Ruiz: borde rojo + "⚠️ Aging 4 days — SLA exceeded" | Sponsor Ruiz: badge naranja con días transcurridos |
| **Notificación** | No aparece | Toast aparece desde arriba a los 2s: *"Employee Alpha · $142.50 — listo para revisar"* |
| **Botones por fila (John)** | ✓ Approve + ✗ Reject directamente en la fila | "Review >" + ícono ✓ verde + ícono ✗ rojo |
| **Botones otras filas** | ✓ Approve + ✗ Reject en cada fila | Badge de estado (Pending / SLA / Approved) — sin acción directa |
| **Decisión en este paso** | Sí — aprueba o rechaza desde la lista | No — cualquier botón lleva al detalle (w1.3) |
| **Sale hacia** | Gasto aprobado o rechazado | Pantalla de detalle del gasto (w1.3) |
| **Alineado** | ⚠️ Brief decide en lista / Demo requiere abrir detalle — justificado: Operations Manager ve el recibo antes de decidir · Botones ✓/✗ añadidos |

---

## Paso 3 — La manager revisa el recibo y decide

*Este paso no existe como pantalla separada en el brief. El demo lo añade para que la manager vea el recibo antes de tomar la decisión.*

| | **HTML Brief** | **Demo (w1.3)** |
|---|---|---|
| **Rol** | Manager · 🖥 Desktop *(no existe como pantalla separada)* | Manager (Operations Manager Solano) · 🖥 Desktop |
| **Entra porque** | — | Quiere ver el recibo antes de tomar la decisión |
| **Qué ve al abrir** | — | Recibo visible inline + datos del gasto + selector de escenario para el presentador |
| **Selector de escenario** | — | Pills: "✓ Normal approval" / "↩ Return path" / "⚠ Policy flag" |
| **Path: aprobación** | — | Toca "Approve & Route to AP →" → confirmación → avanza |
| **Path: rechazo** | — | Cambia a "↩ Return path" → campo de nota obligatorio → "Return to Employee →" → "Continue demo" |
| **Qué pasa al aprobar** | El gasto va solo a la cola de AP | El gasto va solo a la cola de Accountant (AP) |
| **Qué pasa al rechazar** | John recibe notificación | John recibe notificación con la nota exacta de Operations Manager |
| **Sale hacia** | Cola de AP (aprobado) o John (rechazado) | w1.4 — John ve el resultado |
| **Alineado** | ➕ Pantalla extra que el brief no tenía — mejora el flujo porque Operations Manager ve el recibo antes de decidir |

---

## Paso 4 — El empleado ve qué pasó con su gasto

*El brief distribuye este momento entre S1 (post-submit) y S6 (rechazo). El demo lo unifica en una sola pantalla con toggle.*

| | **HTML Brief (S1 post-submit + S6)** | **Demo (w1.4)** |
|---|---|---|
| **Rol** | Empleado · 📱 Móvil *(sin pantalla dedicada)* | Empleado (John) · 📱 Móvil |
| **Entra porque** | Le llegó una notificación | Le llegó una notificación de aprobación o rechazo |
| **Toggle de escenario** | No existe | "Presenter: show both paths" — pills Approved / Returned |
| **— PATH APROBADO —** | | |
| **Notificación** | No definida | Push verde de Strata AI: *"Expense processed · GL confirmed · payment in 2 days"* |
| **Acción** | — | Toca la notificación |
| **Qué ve tras tocarla** | `Status: Submitted ✓ → Approved ✓ → Paid ✓` (3 pasos simples) | Timeline de 6 pasos con fechas y notas: Submitted · Manager Notified · Approved · In AP Review · Posted to CORE · Payment Issued |
| **Handoff a AP** | No existe | Card "Send confirmation to:" — selecciona AP Coordinator o Finance Team → "Send confirmation" → w2.1 |
| **— PATH RECHAZADO —** | | |
| **Notificación** | No definida para este momento | Push rojo de Operations Manager: *"Receipt is unclear — correction needed"* |
| **Rejection card** | S6: `❌ Rejected by Operations Manager Solano · "Receipt is unclear"` | Card roja con nota exacta de Operations Manager |
| **Ítem específico a corregir** | `📎 Fuel — $95.00 · Receipt missing` destacado | `Fuel · $95.00 · Receipt unclear — reattach required` en card roja |
| **Re-adjuntar** | Camera box: "Re-attach corrected receipt" | Camera box idéntico + opción de galería |
| **Nota al manager** | Campo "Note to manager (optional)" | Campo de texto libre opcional |
| **Acción final** | Botón "Resubmit for Approval →" | Botón "Resubmit for Approval →" |
| **Tras reenviar** | — | Confirmación verde + nuevo timeline "Resubmitted ✓ · Operations Manager notified" + "Continue demo →" |
| **Sale hacia** | — | w2.1 — Accountant ve el gasto en su cola |
| **Alineado** | ✅ Path rechazado: 1:1 con S6 del brief · Path aprobado: demo añade toda la capa de transparencia que el brief no tenía |

---

## Paso 5 — Accountant ve la cola de AP con códigos pre-sugeridos

| | **HTML Brief (Screen 3 — primera parte)** | **Demo (w2.1)** |
|---|---|---|
| **Rol** | AP Coordinator (Accountant) · 🖥 Desktop | AP Coordinator (Accountant) · 🖥 Desktop |
| **Entra porque** | Tiene gastos manager-aprobados para procesar | Gastos aprobados llegaron a su cola con códigos ya sugeridos |
| **Qué ve al abrir** | Directamente el gasto de John con los 2 códigos listos | Cola de gastos con leyenda de confianza + KPIs de AP |
| **Leyenda de confianza** | No existe | `≥90% = safe · 75–89% = review · <75% = manual` |
| **Formato del gasto de John** | `Employee Alpha — $142.50 · Ready for GL` con 2 líneas de código | Tarjeta de John con 2 líneas de código + porcentaje + color por confianza |
| **Línea 1** | `Fuel $95.00 → GL 6200 · Vehicle ✨ AI` | `6200 · Vehicle Expenses · $95.00 · 94%` — borde verde |
| **Línea 2** | `Parking $47.50 → GL 6210 · Travel ✨ AI` | `6210 · Travel & Transit · $47.50 · 72%` — borde rojo + "Manual review" |
| **Recibos** | `2 receipts verified inline ✅` | Accesibles en este paso vía carrusel |
| **Notificación** | No existe | Toast a los 2s: *"Employee Alpha · $142.50 · approved by Operations Manager Solano · GL pre-filled"* |
| **Acción** | Botón "Confirm & Auto-Post to CORE →" (en la misma pantalla) | Botón "Review GL — Employee Alpha" en el toast → abre w2.2 |
| **Sale hacia** | CORE (confirmación directa) | w2.2 — pantalla de confirmación detallada |
| **Alineado** | ✅ Datos idénticos · Demo mejora con % de confianza y color semántico · La separación en 2 pasos hace la narrativa más clara |

---

## Paso 6 — Accountant confirma los códigos y el sistema publica en CORE

| | **HTML Brief (Screen 3 — segunda parte)** | **Demo (w2.2)** |
|---|---|---|
| **Rol** | AP Coordinator (Accountant) · 🖥 Desktop | AP Coordinator (Accountant) · 🖥 Desktop |
| **Entra porque** | Quiere confirmar o corregir los códigos contables | Viene de revisar la cola — abre el gasto de John para confirmar |
| **Qué ve al abrir** | Los 2 códigos con etiqueta ✨ AI y botón de confirmar | Los 2 códigos con % de confianza, editables inline — empieza directo en la acción |
| **Línea en riesgo** | No diferenciada visualmente | Línea al 72% tiene borde rojo + badge "Manual review" — llama la atención |
| **Recibos** | `2 receipts verified inline ✅` (texto) | Carrusel de recibos navigable sin salir de la pantalla |
| **Override** | Botón secundario "Override a GL Code" | Dropdown inline por línea para cambiar el código sin salir |
| **Botón principal** | "Confirm & Auto-Post to CORE →" | "Confirm & Post to CORE →" |
| **Qué pasa al confirmar** | Nota de pie: *"Post will auto-sync to CORE · No re-entry needed"* | Animación de 3 pasos en tiempo real: `Validating ✓` → `Creating entry #CR-2847 ✓` → `Notifying team ✓` |
| **Estado final** | — | "Posted ✓ · No re-entry · No calls to AP" |
| **Sale hacia** | Entrada publicada en CORE | Entrada en CORE · John recibirá el pago · aparece en el dashboard |
| **Alineado** | ✅ Mismo resultado · Demo es más impactante: la animación de 3 pasos convierte un botón en el "wow moment" del demo |

---

## Paso 7 — Accountant configura el sistema sin llamar a IT

| | **HTML Brief (Screen 5)** | **Demo (w2.3)** |
|---|---|---|
| **Rol** | AP Coordinator (Accountant) · 🖥 Desktop | AP Coordinator (Accountant) · 🖥 Desktop |
| **Entra porque** | Necesita actualizar la configuración | Necesita actualizar managers, categorías o jerarquía |
| **Sección: Managers** | Operations Manager Solano (Ops · Tampa) + Mike Torres (Sales · Orlando) con botón "Edit" | Mismos managers + formulario expandible inline por fila + toggle activo/inactivo |
| **Agregar manager** | Botón "+ Add Manager" | Botón "+ Add Manager" → abre formulario con nombre, depto, email |
| **Sección: Categorías** | `Fuel · Meals · Travel · Parking · Office · +8 más` + botón "Manage Categories" | Mismas categorías + campo para agregar custom + botón eliminar por categoría |
| **Sección: Jerarquía** | `Employee → Manager → Dept Head → CFO/AP` + botón "Edit Hierarchy" | Misma jerarquía en lectura → al editar: filas arrastrables con drag & drop |
| **Accesibilidad jerarquía** | No aplica (wireframe estático) | Badge numérico corregido a contraste máximo (bg-foreground text-background) |
| **Labels de jerarquía** | No existen | Leyenda fija: "1 = submits first · 4 = final approver" + "reports to ↑" por fila |
| **Sección extra** | No existe en el brief | Card "Accounting System Integration · Active ✓" — conexión con CORE, auto-post habilitado, último sync |
| **Acción final** | — | Botón "Save all changes →" → confirmación "Live for all new submissions · CORE sync triggered ✓" |
| **Sale hacia** | Cambios en vigor | Configuración activa de inmediato para todos los empleados |
| **Alineado** | ✅ Todas las secciones del brief presentes · Demo añade interactividad real y card de integración |

---

## Paso 8 — CFO y CAO ven el gasto de toda la empresa

| | **HTML Brief (Screen 4)** | **Demo (w2.4)** |
|---|---|---|
| **Rol** | CFO / CAO (CFO / AP Coordinator) · 🖥 Desktop | CFO (CFO) → transición automática → CAO (AP Coordinator) · 🖥 Desktop |
| **Entra porque** | Quieren ver en qué se gasta la empresa | Primera vez que tienen visibilidad sin pedir reportes manualmente |
| **Filtros** | Mayo 2026 · All Depts · All Locations | Mismos filtros + funcionales: cambian datos en tiempo real |
| **KPI: Gasto del mes** | $48K | $48K ✅ |
| **KPI: Pendientes** | 23 | 23 ✅ |
| **KPI: A tiempo** | 94% | 94% ✅ |
| **Barras de categoría** | Fuel $12K · Meals $8.5K · Travel $6K · Office $4K | Fuel $12K · Meals $8.5K · Travel $6K · Office $4K ✅ |
| **Alertas de SLA** | No aparece en el brief | Sección de gastos con más de 3 días sin aprobarse — visible para CFO y para AP Coordinator |
| **Vista de división (AP Coordinator)** | No diferenciada — una sola pantalla genérica | Switch automático después de 1s → banner de transición → vista filtrada por división Ops & Procurement · Florida |
| **Reminders de SLA** | No existe | AP Coordinator puede enviar reminder al manager desde el dashboard |
| **Comparación por período** | No aparece | Gráfico de tendencias mes a mes por categoría |
| **Exportar** | "Export CSV / PDF →" | Botones CSV y PDF funcionales con animación de descarga |
| **Sale hacia** | Fin del flujo | Fin del flujo — el $142.50 de John es ahora parte de la visibilidad de liderazgo |
| **Alineado** | ✅ Todos los números exactos · Demo supera el brief con switch CFO/AP Coordinator, alertas SLA, tendencias y reminders |

---

## Mapa de entradas y salidas

| Paso | Demo | Rol | Plataforma | Entra porque | Sale hacia |
|---|---|---|---|---|---|
| 1 | w1.1 | Empleado (John) | 📱 Móvil | Tiene un recibo que reportar | Gasto llega a cola de Operations Manager |
| 2 | w1.2 | Manager (Operations Manager) | 🖥 Desktop | Le llegó notificación de gasto nuevo | Abre detalle del gasto |
| 3 | w1.3 | Manager (Operations Manager) | 🖥 Desktop | Quiere ver el recibo antes de decidir | Aprueba (→ Accountant) o rechaza (→ John) |
| 4 | w1.4 | Empleado (John) | 📱 Móvil | Le llegó notificación (aprobado o rechazado) | Aprobado: selecciona a quién notificar → Accountant · Rechazado: corrige y reenvía → Operations Manager |
| 5 | w2.1 | AP (Accountant) | 🖥 Desktop | Gasto aprobado llegó a su cola con códigos pre-sugeridos | Abre el gasto para confirmar códigos |
| 6 | w2.2 | AP (Accountant) | 🖥 Desktop | Necesita confirmar o corregir los códigos contables | Confirma → CORE recibe la entrada automáticamente |
| 7 | w2.3 | AP (Accountant) | 🖥 Desktop | Gestiona la configuración del sistema | Cambios guardados, en vigor inmediato |
| 8 | w2.4 | CFO (CFO) → CAO (AP Coordinator) | 🖥 Desktop | Quieren ver el gasto total de la empresa | Fin del flujo |

---

## Mapa de brechas consolidado

| Paso | Brief | Demo | Brecha | Estado |
|---|---|---|---|---|
| 1 — Submit | Categoría editable ▾ | Selector inline con 5 opciones | Categoría era read-only | ✅ corregido |
| 2 — Manager queue | ✓/✗ por fila en la lista | ✓/✗ + "Review >" en fila de John | Faltaban los botones de acción | ✅ corregido |
| 3 — Approve detail | No existe como pantalla | Pantalla completa con recibo inline | Extra del demo — mejora el flujo | ➕ |
| 4 — Employee status | Sin pantalla dedicada | w1.4 con toggle y 5 estados internos | Demo añade capa completa de transparencia | ➕ |
| 5 — AP queue | Cola + confirmación en 1 pantalla | Cola separada de confirmación | División intencional — mejor narrativa | ➕ |
| 6 — GL + CORE | Botón simple de confirmar | Animación 3 pasos + línea roja diferenciada | Demo convierte el botón en el wow moment | ➕ |
| 7 — Admin | 3 secciones estáticas | 3 secciones interactivas + drag & drop + integración contable | Demo supera el brief | ➕ |
| 8 — Dashboard | Una vista genérica CFO/CAO | Switch CFO → AP Coordinator + alertas + tendencias + reminders | Demo supera el brief | ➕ |

---

## Conclusión

El brief está cubierto al 100%. Todas las brechas activas fueron corregidas.

Los pasos extra del demo (w1.3 detalle de aprobación, w1.4 status del empleado, división w2.1/w2.2) no son gaps — son mejoras narrativas que hacen el demo más creíble y el flujo más fácil de entender para la audiencia.

**El demo mejora el brief en:**
- Confianza de IA (%) por línea contable — no estaba en el brief
- Animación de 3 pasos al publicar en CORE — más dramático que solo un botón
- Toggle approved/rejected en w1.4 para mostrar ambos caminos sin salir del paso
- Switch automático CFO → AP Coordinator en el dashboard
- Alertas de SLA y reminders en el dashboard
- Integración contable visible en el admin
