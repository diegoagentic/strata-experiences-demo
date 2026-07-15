# COI Interiors — Demo Flow Specification

> **Profile**: COI Interiors
> **Profile ID**: `coi`
> **Company Name**: COI Interiors
> **Total Steps**: 27 (across 3 flows with integrated CRM steps)
> **Source**: `src/config/profiles/coi-demo.ts`

---

## Flow 1: RFQ → PO Processing (13 steps)

**6 automated + 5 HITL + 2 CRM** — Data flows email → extraction → normalization → quote → PO → CRM without re-typing
**Addresses**: #4 PDF/email quote ingestion, #5 reduce double entry, #9 better customer quote, #10 familiar interfaces

| Step | Title | Mode | Role | AI Automation | Expert-in-the-Loop |
|------|-------|------|------|---------------|-------------------|
| 1.1 | Email Ingestion | auto (34s) | Dealer | System detects email with RFQ, identifies PDF spec + CSV attachments | Dealer sends email (passive trigger) |
| 1.2 | AI Extraction | auto (27s) | System | 5 AI agents: OCR processes PDF, TextExtract parses CSV, extracts 200 line items, maps 4 delivery zones | None — fully automated |
| 1.3 | Normalization | interactive | System | 4 AI agents: DataNormalizationAgent unifies data, generates confidence score per field, flags missing fields. 94% accuracy | Expert sees confidence scores; low-confidence items escalate as "Needs Attention" |
| 1.4 | Quote Draft | interactive | System | QuoteBuilder Agent auto-generates draft with pricing rules, applies volume discounts. Multi-zone freight requires validation | Expert decides: "Route to Expert Hub" if exceptions exist |
| 1.5 | Expert Review (HITL) | interactive | Expert | QuotePricingAgent validated 8 items, avg discount 60.8%. Flag: lounge seating 58% < standard 62%. Flag: Freight LTL $2,450 Austin TX | Expert inputs freight rate manually, reviews warranties, approves corrections. Audit trail records each decision |
| 1.6 | Approval Chain | auto (19s) | Dealer | Policy Engine auto-approves: VP Operations → auto, CFO → auto. 3-level chain | None — visual progression shown |
| 1.7 | Dealer Approval | interactive | Dealer | AI pre-fills summary: $43,750 total, 35.4% margin, key metrics | Dealer reviews and approves final quote |
| 1.8 | Sales Approval (Mobile) | interactive | End User | Automatic push notification to mobile | End User taps "Acknowledge" from phone |
| 1.9 | PO Generation | auto (50s) | Dealer | Generates PO, maps 5 SKUs, executes 3-level approval chain, transmits to supplier | None — fully automated |
| 1.10 | Smart Notifications | interactive | Dealer | AI digests by role: Dealer lifecycle summary, Expert exceptions only by priority | Informational — no action required |
| 1.11 | Pipeline View | interactive | Dealer | New order card with animated column transition. CRM auto-created | Informational |
| **1.12** | **CRM: Project Auto-Created** | **auto (12s)** | **Sales Rep** | **ProjectCreationAgent auto-creates CRM project from approved quote. Customer "Apex Furniture", Quote #QT-1025 ($43,750), PO #ORD-2055, 200 items, 4 zones — zero manual entry** | **None — data flows automatically** |
| **1.13** | **CRM: Customer 360 Updated** | **interactive** | **Sales Rep** | **CustomerIntelligenceAgent updates Apex Furniture profile: $1.2M lifetime value, 5 projects, cross-system data aggregated** | **Sales Rep reviews unified customer view** |

---

## Flow 2: PO & Acknowledgement Comparison (8 steps)

**AI eliminates ~95% of manual PO vs Acknowledgement comparison work + CRM sync**
**Addresses**: #1 AI acknowledgement processing (highest priority), #2 shipment/order visibility, #3 customer communication

| Step | Title | Mode | Role | AI Automation | Expert-in-the-Loop |
|------|-------|------|------|---------------|-------------------|
| 2.1 | Acknowledgement Intake | auto (14s) | System | EDI/855 automatic intake. AIS (50 lines, $65K) + HAT (5 lines, $8K) arrive in pipeline | None — monitoring only |
| 2.2 | Smart Comparison | interactive | System | 8 AI agents: EDI normalization from eManage ONE. HAT: "Warm Grey 4" vs "Folkstone Grey" → same part# → auto-confirms 91%. AIS: grommet config error → flagged | Expert sees: HAT = green "Confirmed", AIS = red "Discrepancy". Click "Review Discrepancies" |
| 2.3 | Delta Engine | interactive | System | Auto-corrections: (1) Grommet error → auto-corrected, (2) Dates +14d/+11d → auto-accepted. Escalated: Qty shortfall 8→6, 4→2 → exceeds threshold | Expert chooses: Accept new date / Expedite (+$800) / Cancel |
| 2.4 | Expert Review — 50 Lines (HITL) | interactive | Expert | DiscrepancyResolverAgent: Azure fabric ≈ Navy (same price $89, same lead time). Confidence 91%, 76% | Expert reviews side-by-side PO vs Ack: accept ✓, reject ✗, edit, add notes. 50 line items. Full audit log |
| 2.5 | Authorization Chain | auto (20s) | System | 3-approver chain automatic (5s intervals) | None |
| 2.6 | Pipeline Resolution | interactive | Dealer | HAT → Confirmed column. AIS → Partial column | Informational |
| 2.7 | Smart Notifications | interactive | Dealer | "2 Acknowledgements processed, 1 clean, 1 with 3 exceptions resolved" (Dealer). Expert: exceptions only | Informational |
| **2.8** | **CRM: Order Lifecycle Synced** | **auto (10s)** | **System** | **OrderSyncAgent updates CRM project timeline: AIS (50 lines, $65K) — 3 exceptions resolved, +14d. HAT (5 lines, $8K) — confirmed. Milestones auto-updated** | **None — data flows automatically** |

---

## Flow 3: Punch List / Warranty Claims (6 steps)

**AI validates documentation + business rules before expert acts + CRM traceability**
**Addresses**: #6 reporting automation, #7 consistent reporting, #2 shipment visibility, #3 customer communication

| Step | Title | Mode | Role | AI Automation | Expert-in-the-Loop |
|------|-------|------|------|---------------|-------------------|
| 3.1 | Request Intake (HITL) | interactive | Expert | AI validates 5 docs: Order# ✓98%, Line# ✓96%, Issue photo ✓94%, Label ⚠️62% (SKU mismatch CC-AZ-2024 vs 2025), Box ✗0% (missing) | Expert reviews flags: Label → "model year variant, confirm". Box → "carrier liability, contact requester" |
| 3.2 | Labor Quote Requested | interactive | Expert | Strata tracks request, triggers AI validation on arrival | Presenter narration — click Next |
| 3.3 | Labor Review (HITL) | interactive | Expert | 6 rules: Repair $510 vs $500 max ⚠️, Trip $175 ✓, Certified ✓, Labor 6hrs vs 4hrs ⚠️, Warranty ✓, No dupes ✓. 4/6 pass | Expert AI suggestions: Repair → [Adjust $495] [Exception $510] [Split 2×$255]. Hours → [4hrs] [5hrs] [6hrs justified] |
| 3.4 | Claim Submission & Tracking | auto (24s) | Dealer | ClaimSubmissionAgent: assembles claim, SHA256 hashes, verifies ship-to, submits, tracks replacement | Expert can review liability (optional) |
| 3.5 | End User Report (Mobile) | interactive | End User | AI generates punch list report with photos, status, timeline | End User reviews on mobile, leaves comments, taps "Acknowledge" |
| **3.6** | **CRM: Full Project Traceability** | **interactive** | **Sales Rep** | **ServiceRecordAgent logs claim against project. Full lifecycle: email (1.1) → AI (1.2) → quote (1.7) → PO (1.9) → ack (2.4) → service (3.4). Zero re-entry across 5 systems** | **Sales Rep reviews project health: $43,750, 98% delivered, 1 open claim** |

---

## Summary

| Metric | Flow 1 | Flow 2 | Flow 3 | Total |
|--------|--------|--------|--------|-------|
| Steps | 13 | 8 | 6 | **27** |
| Auto (AI only) | 5 | 3 | 2 | **10** |
| Interactive (HITL) | 8 | 5 | 4 | **17** |
| CRM Steps (integrated) | 2 | 1 | 1 | **4** |
| Named AI Agents | 5+ | 8+ | 1+ | **14+** |

## CRM Integration Philosophy

The CRM is **not** a separate workflow. Instead, CRM steps appear at the **end of each flow**, demonstrating how data from the preceding workflow automatically flows into the CRM project record:

- **Flow 1 → CRM**: Quote and PO data create a project automatically (1.12), customer profile updated with cross-system data (1.13)
- **Flow 2 → CRM**: Acknowledgment data syncs to project timeline with delivery milestones (2.8)
- **Flow 3 → CRM**: Service claim linked to project with full end-to-end traceability (3.6)

**CRM has 6 navigable tabs**: Projects | Customer 360 | Order Timeline | **Daily Log** | **Invoicing** | Reports. The Daily Log and Invoicing tabs are accessible from any CRM step — they demonstrate change-order tracking feeding into auto-generated invoices with QuickBooks sync.

This addresses the client requirement: _"A CRM where information seamlessly flows into new projects"_ — data enters **once** (email) and flows through every system without re-entry.

## Stakeholder Initiative Coverage

| # | Initiative | Covered By |
|---|-----------|------------|
| 1 | AI Acknowledgement Processing | Flow 2 (2.1–2.7) — 8 AI agents, ~95% automation |
| 2 | Shipment/Order Visibility | Flow 2 (2.6–2.8), Flow 3 (3.4), **Step 3.5 (Amazon-style tracking)** |
| 3 | Customer Communication | Flow 1 (1.8, 1.10), Flow 2 (2.7), Flow 3 (3.5), CRM (1.13, 3.6) |
| 4 | PDF/Email Quote Ingestion | Flow 1 (1.1–1.4) — 5+4 AI agents |
| 5 | Reduce Double Entry | Flow 1 (1.2, 1.9, 1.12), CRM (2.8, 3.6 — zero re-entry across 5 systems) |
| 6 | Reporting Automation | Flow 3 (3.1, 3.3), CRM (3.6 — AI project health report) |
| 7 | Consistent Reporting Logic | Flow 3 (3.3 — 6 business rules), CRM (3.6 — cross-platform traceability) |
| 8 | CRM & Project Intelligence | CRM steps (1.12, 1.13, 2.8, 3.6) — project-centric, data flows from all workflows |
| 9.1 | Daily Log + Change-Order Tracking | **CRM tab "Daily Log"** — accessible from any CRM step (1.12, 1.13, 2.8, 3.6). Chronological log of all project activity: change orders, claims, deliveries, POs, acks. Change orders feed directly into invoicing. |
| 9.2 | Invoicing / QuickBooks Integration | **CRM tab "Invoicing"** — auto-generated invoice from PO + change orders + service labor. QuickBooks Online sync with GL code auto-mapping. Zero manual line items. |
| 9.3 | Shipment Notices (Amazon-style) | **Step 3.5 End User Mobile** — horizontal progress tracker (Ordered→Delivered), zone-based shipment cards with carrier/tracking/ETA, push notification for in-transit shipments. |
| 9 | Better Customer Quote Experience | Flow 1 (1.4, 1.7, 1.8) |
| 10 | Familiar Interfaces | All flows reuse existing simulation apps |

## Simulation Apps Used

| App Key | Used In Steps |
|---------|--------------|
| `email-marketplace` | 1.1 |
| `dealer-kanban` | 1.2, 1.3, 1.4 |
| `expert-hub` | 1.5, 1.11, 2.1–2.6 |
| `dashboard` | 1.6–1.10, 2.7, 3.5 |
| `mac` | 3.1–3.4 |
| `crm` | 1.12, 1.13, 2.8, 3.6 |
