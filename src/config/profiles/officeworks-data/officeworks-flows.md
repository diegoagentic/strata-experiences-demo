# Officeworks — Spec Check & Design Flow (BPMN integrated)

> Fuente: Notion v3 (process) + v2 (BPMN element-by-element) + diagrama swimlane usuario 2026-05-20

## 5 Swimlanes (Pool: "Officeworks — Spec Check & Design Process (Furniture)")

| Lane # | Role | Tasks owned |
|---|---|---|
| 1 | Design Manager (Felicia/Rebecca/Kimberly) | Task 1 |
| 2 | **Designer (Kimberly — protagonist)** | 1A, 2, 3, 4, 5, 5A, 5B, 6A, 7, 7A, 7B, 8, 8A, 9, 10, 12, 12A + all designer gateways |
| 3 | Project Manager (Abigail's team) | Task 6 (con Designer) |
| 4 | Sales Coordinator | Task 11 |
| 5 | Salesperson / WPC (Caitlin Barolet · Danielle Dunlap for Metro Legal) | SE1 + Task 11A + receives messages |

## Mapping BPMN → demo steps (17 incluyendo small-project alt path)

| Step ID | BPMN ref | Title | Pain | Gateway |
|---|---|---|---|---|
| `sc1.0` | SE1 + Task 1 + GW1 (soft) + Task 1A | Works form arrives · CAD missing | SC1 | GW1 soft (parallel kickoff allowed) |
| `sc1.0b` | Task 1 cont | Manager assigns designer | SC5 | criteria: history → capacity → complexity |
| `sc1.1` | Task 2 + GW1B | Kickoff call · scope + project size | "Shot in the dark" handoff | GW1B Small vs Standard/Large |
| `sc1.1-bypass` | GW1B small branch | (alt) Skip to Task 4 | bypass dramatized | — |
| `sc1.2` | Task 3 (+ optional DDP parallel) | Draw furniture plan CET | — | DDP parallel toggle |
| `sc1.2b` | Task 4 | Export BOM CET → CAP | — | specs + electrical embedded |
| `sc1.3` | Task 5 + 5A + IE Wait + GW2A | Validation document + client approval | Client approval gate | GW2A approved / revisions sub-gateway type |
| `sc1.3b` | Task 5B + Task 6 + GW2B | Field verification (pre-order timing) | Pre-install drawings | GW2B issues found? |
| `sc1.4` | GW2C + Task 6A | SQ / price-protected check | SC4 | GW2C SQ required? |
| `sc1.5` | Task 7 + IE Wait + GW3 | Submit Order Preview Teknion (Tifani) | 1-2 wk turnaround | GW3 clean / gap / timeline |
| `sc1.5b` | Task 7A | Resolve specification gaps | sub-loop | back to GW3 |
| `sc1.5c` | Task 7B + GW3A | Strategize order phasing | cross-lane huddle | GW3A new preview? |
| **`sc1.6`** | Task 8 + 8A nested + GW4 + GW4A | **Self-audit BOM × 6 attrs · floor plan + validation doc** ⭐ | **SC2 (CEO#1) + SC3** | GW4 + GW4A drawing/BOM error type |
| **`sc1.7`** | Task 9 + GW5 + GW5A | **Peer review (Rebecca/Felicia)** ⭐ | **SC7 (CEO#3)** | GW5 + GW5A drawing/BOM error type |
| `sc1.8` | Task 10 | BOM submission email (PDF + SP4) | handoff trigger | — |
| `sc1.8b` | Task 11 + 11A | Coordinator uploads NetSuite + Salesperson releases PO | observed · 2 lanes | — |
| **`sc1.9`** | Task 12 + GW6 + 12A + GW6B + 2 EEs | **Acknowledgment review · Gemini supercharge** ⭐ | Gemini already in use | GW6 matches? · GW6B resolved? → Confirmed / Held |

## Key v2 clarifications

- **GW1 soft check** — designer no espera CAD; kickoff puede iniciar paralelo
- **Task 1A en Designer lane** (no Manager) — Message Flow back a Salesperson
- **GW1B Small-project bypass** — 1-5 stations skip Tasks 3, 5, 6, 7 → direct Task 4 → 8 → 10
- **Task 3 paralelo opcional:** Prepare Deep Discounting BOM (DDP — volume discount)
- **Task 5A + IE Wait + GW2A** — client approval gate antes de field verification
- **Field verification timing** — BEFORE order placed con Teknion (no post-delivery)
- **Task 8 cross-references BOTH** Floor Plan AND Validation Document (Data Objects)
- **Task 8A NESTED sub-process** — CR lookup per-line inline DURING audit
- **Task 11A en Salesperson lane** (Coordinator uploads, Salesperson releases)
- **Task 12 annotation:** Gemini AI ya en uso experimental
- **2 End Events distintos:** "Order Confirmed" (None) vs "Order Held/Canceled" (Terminate)

## Process Relationships (v3)

| Dirección | Proceso | Cruza |
|---|---|---|
| ⬅️ INPUT | Sales Process | Works form · scope · CAD · client brief · floor plan · SQ # · budget · NetSuite SO# · Ignite folder |
| ➡️ OUTPUT | Sales Process | BOM · spec check sign-off · SP4 file · validation doc · pre-install drawings · field verification confirm · CAD |
| ↔️ PARALLEL | Labor & Delivery Estimation | RFP drawings · scope · takeoff (Bluebeam) · building address · union determination · timeline |
