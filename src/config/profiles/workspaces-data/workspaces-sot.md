# Source of Truth — Workscapes, Inc.
# Expense Report Management · Strata AI Demo

> Version: 1.0 · May 2026
> Primary reference: `Workscapes_Designer_Brief.html` (Designer Brief v1)
> Demo project: `demo-2026-strata` · React 18 + TypeScript + Tailwind CSS

---

## Company Profile

| Field | Value |
|---|---|
| Company | Workscapes, Inc. |
| Type | MillerKnoll dealer · Woman-owned business |
| Employees | ~126 |
| Revenue | ~$60.7M |
| Locations | 5 (Florida — Tampa HQ + Orlando, Miami, + 2 others) |
| Scope | Expense Report Management (AI Modernization) |
| Presentation date | TBD |

---

## Stakeholders

| Name | Role | Primary Need | Demo perspective |
|---|---|---|---|
| Mehmet | CFO | Company-wide spend visibility · category vs time · CSV/PDF export | Dashboard w2.4 (Company View) |
| Tammy | CAO (~80 reports) | Ops & Procurement division rollup · cross-location · SLA aging alerts | Dashboard w2.4 (Division View) + approval queue |
| Letza (Lisa Bombard) | AP Coordinator | GL pre-filled by AI · auto-post to CORE · self-service admin | w2.1 AP Queue · w2.2 GL Sync · w2.3 Admin |
| Managers | Direct report supervisors | One-click approve · see receipts inline · no GlobalSearch login | w1.2 Queue · w1.3 Approve |
| Employees | Field staff, Sales, PMs | Submit from mobile · receipt scan · track status without calling AP | w1.1 Submit · w1.4 Status |

---

## Technology Stack — AS-IS (4 disconnected systems)

| System | Function | Problem |
|---|---|---|
| Company Intranet | Expense report form (desktop only) | No mobile · no receipt scan · upload fails → email workaround |
| GlobalSearch (Square 9 ECM) | Document repository + approval workflow | Approval button grayed out — **BROKEN for months** |
| Email | Manager notification + AP communication | Process outside system · no traceability · approvals by email |
| CORE (accounting ERP) | GL entries · check issuance | Zero integration with GlobalSearch · 100% manual re-entry by AP |

---

## AS-IS Workflow — 8 steps

| Step | Actor | Action | Pain point |
|---|---|---|---|
| 1 | Employee | Fill Intranet form (desktop only) | PP6: desktop-only · PP9: receipt upload fails → email workaround |
| 2 | GlobalSearch | Document uploaded automatically | OK — works |
| 3 | GlobalSearch | Sends email notification to manager | System notifies but approval UI is broken |
| 4 | Manager (Tammy) | Tries to approve in GlobalSearch | **PP5: button grayed out** · approves by email instead |
| 5 | AP (Letza) | Reviews expense in GlobalSearch | PP1: can't see receipts · requests separately by email |
| 6 | AP (Letza) | Manual GL breakdown line by line | PP8: ~15 min/expense · inconsistent across AP staff |
| 7 | AP (Letza) | Manual re-entry into CORE | PP8: copy field by field · error-prone · biggest bottleneck |
| 8 | CORE | Issues check and processes payment | Only automated output in the whole process |

---

## TO-BE Workflow — Strata unified platform

| Step | Actor | Action | Gain |
|---|---|---|---|
| 1 | Employee | Mobile/Web app · snap receipt · AI auto-fill | Seconds vs minutes · mobile-first |
| 2 | Platform | Receipt + form → submission engine | Replaces GlobalSearch backend |
| 3 | Platform | Email + push notification to manager | Parity + push added |
| 4 | Manager | One-click approve with inline receipts | Fixes broken UX · PP1 + PP5 resolved |
| 5 | Platform | Auto-routes approved expense to AP queue | No manual handoff |
| 6 | AP (Letza) | GL pre-filled by AI rules engine · confirm/override | PP8 resolved · major time save |
| 7 | AP (Letza) | Auto-post to CORE via API/RPA after confirm | PP8 resolved · manual re-entry eliminated |
| 8 | CORE | Issues check (unchanged) | Parity |

---

## Pain Points — 10 identified, 9 strongly resolved

| # | Pain Point | Where | Who | Resolution | Strength |
|---|---|---|---|---|---|
| PP1 | Cannot see receipts during approval | Step 4 · GlobalSearch | Tammy / Managers | Inline receipt viewer in approval card | STRONG |
| PP2 | No departmental spending visibility | Post-payment reporting | Tammy (CAO) · Mehmet | Reporting dashboard with division rollup | STRONG |
| PP3 | No summary reports or dashboards | Reporting | Mehmet · Tammy · Letza | Company-wide dashboard · filters · export | STRONG |
| PP4 | Risk of losing GlobalSearch platform | Entire backbone | All | New platform replaces GlobalSearch end-to-end | STRONG |
| PP5 | GlobalSearch approval UI grayed out | Step 4 | Managers | New clean approval UX · shown in demo explicitly | STRONG |
| PP6 | Cannot add managers to approval dropdown | Step 1 + Admin | Letza (#1 ask) | Self-service Admin module | STRONG |
| PP7 | Expense categories need updating | Step 1 + Admin | Letza | Admin module — add/edit/archive categories | STRONG |
| PP8 | Manual re-entry from GlobalSearch into CORE | Step 7 — biggest bottleneck | Letza | Auto-post via API or RPA after GL confirm | STRONG |
| PP9 | Email workarounds for receipt upload | Step 1 | Employees | Multi-format upload · explicit messaging in UI | IMPLICIT → needs explicit callout |
| PP10 | Must open each report one by one | Reporting | Mehmet | Dashboard with filters + drill-down + export | STRONG |

---

## Client Desires — 8

| # | Desire | Demo scene |
|---|---|---|
| D1 | Mobile submission with receipt scan (OCR) | w1.1 |
| D2 | Manager approves with receipts visible inline | w1.3 |
| D3 | Reporting dashboard by dept / category / period | w2.4 |
| D4 | Admin module (managers, categories, hierarchy) | w2.3 |
| D5 | CORE integration automatic (no manual entry) | w2.2 |
| D6 | Policy validation at submit time | w1.1 (category rules) |
| D7 | Digital audit trail with timestamps | w1.4 |
| D8 | Employee status visibility (real-time tracking) | w1.1 post-submit + w1.4 |

---

## 5 Feature Modules (from Designer Brief)

### Module 1 — Mobile / Web Submission (Employee)
| Feature | Priority | Demo scene |
|---|---|---|
| Receipt Camera Capture — AI extracts merchant, date, amount, category | CRITICAL | w1.1 |
| Multi-File Upload — JPG, PNG, PDF, multiple receipts per expense | CRITICAL | w1.1 |
| Expense Submission Form — manager dropdown always current, AI pre-fills | CRITICAL | w1.1 |
| Submission Status Tracker — real-time: Submitted → In Review → Approved → Paid | HIGH | w1.1 post-submit + w1.4 |
| Reject → Resubmit Loop — employee gets note, corrects, resubmits; audit trail maintained | HIGH | w1.3 |

### Module 2 — Manager Approval
| Feature | Priority | Demo scene |
|---|---|---|
| Inline Receipt Viewer — receipts visible IN approval card, no separate system | CRITICAL | w1.3 |
| One-Click Approve / Reject — reject requires note (mandatory) | CRITICAL | w1.3 |
| Manager Approval Queue — list view with receipt count, sortable/filterable | HIGH | w1.2 |
| Email + Push Notifications — SLA aging alert > 3 days | HIGH | w1.2 |

### Module 3 — AP Review & CORE Integration (Letza)
| Feature | Priority | Demo scene |
|---|---|---|
| GL Pre-fill Rules Engine — suggests GL code per line, Letza confirms or overrides | CRITICAL | w2.2 |
| Auto-Post to CORE — API or RPA after AP confirms; manual re-entry eliminated | CRITICAL | w2.2 |
| AP Queue View — batch view, aging indicators, SLA outlier flags | HIGH | w2.1 |

### Module 4 — Reporting Dashboard (Tammy / Mehmet)
| Feature | Priority | Demo scene |
|---|---|---|
| Company-Wide Spend View — role-based: CFO sees all, CAO sees division | CRITICAL | w2.4 |
| Multi-Dimensional Filters — time · dept · location · employee · category · manager | CRITICAL | w2.4 |
| Category Trend Charts — fuel vs dining by month, side-by-side comparison | HIGH | w2.4 |
| Approval Aging / SLA Tracker — reports > 3 days flagged with manager names | HIGH | w2.4 |
| Export CSV / PDF — any filtered view exportable | HIGH | w2.4 |
| Role Hierarchy Visibility — Employee→Manager→Dept Head→CFO/AP powers rollup | HIGH | w2.4 |

### Module 5 — Self-Service Admin (Letza)
| Feature | Priority | Demo scene |
|---|---|---|
| Manager List Management — add/edit/remove from approval dropdown without IT | CRITICAL | w2.3 |
| Expense Category Management — add/rename/archive categories | CRITICAL | w2.3 |
| Role & Hierarchy Configuration — define/edit approval chain | HIGH | w2.3 |

---

## Demo Data — Canonical

### Primary expense (flows through demo)
```
Employee:  Employee Alpha (field staff)
Vendor:    The Capital Grille — Tampa, FL
Date:      May 5, 2026
Lines:     Fuel $95.00 + Parking $47.50
Total:     $142.50
Receipts:  2 attached
Category:  Fuel + Parking → GL 6200 Vehicle + GL 6210 Travel
Approved by: Sarah Johnson (Operations · Tampa)
```

### Manager Approval Queue (Tammy sees)
| Employee | Amount | Category | Receipts | Submitted | Status |
|---|---|---|---|---|---|
| Employee Alpha | $142.50 | Fuel + Parking | 2 ✓ visible | May 5 | Pending |
| Maria Lopez | $89.00 | Client Meals | 1 ✓ visible | May 4 | Pending |
| Carlos Ruiz | $210.00 | Travel | 1 | May 1 | ⚠️ 4 days · SLA exceeded |

### GL mapping (AP Letza confirms)
| Line | Description | Amount | GL Code | Source | Confidence |
|---|---|---|---|---|---|
| 1 | Fuel — Tampa | $95.00 | 6200 · Vehicle Expenses | ✨ AI | 94% |
| 2 | Parking | $47.50 | 6210 · Travel & Transit | ✨ AI | 97% |

### CFO Dashboard — May 2026
| Metric | Value |
|---|---|
| This Month | $48K |
| Pending approvals | 23 expenses |
| On-time SLA | 94% |
| Fuel | $12K |
| Meals | $8.5K |
| Travel | $6K |
| Office | $4K |

### Admin — Manager List
| Manager | Department | Location |
|---|---|---|
| Sarah Johnson | Operations | Tampa |
| Mike Torres | Sales | Orlando |
| Ana Reyes | Procurement | Miami |

---

## Open Questions (from Designer Brief — 8 gaps)

| # | Question | How demo handles it |
|---|---|---|
| OQ1 | Native app vs PWA/Responsive Web? | Demo shows responsive web (mobile viewport simulated in ExpenseSubmitScene) |
| OQ2 | Multiple receipts per expense line explicitly supported? | "+ Add another receipt" button + "JPG PNG PDF · multiple supported" label |
| OQ3 | Reject → Resubmit full flow (states, re-review)? | Toggle in w1.3: approve or reject scenario, resubmit card visible |
| OQ4 | Tammy's division rollup hierarchy definition? | w2.4 Tammy tab shows Ops & Procurement with "38 reports" |
| OQ5 | SLA threshold — 3 days, who gets notified? | Badge "> 3 days ⚠️" on Carlos Ruiz card + "Push sent to manager" |
| OQ6 | Monthly category comparison (Mehmet ask)? | Side-by-side bars April vs May with % delta in w2.4 |
| OQ7 | CORE integration: API vs RPA? | Text in w2.2: "Auto-post to CORE · integration method TBD" |
| OQ8 | Receipt upload messaging explicit? | w1.1: "Camera · Gallery · File · JPG PNG PDF · multiple receipts supported" |

---

## Explicitly Out of Scope

- Budget alerts / spend caps (Mehmet: "not an immediate need")
- Full ERP replacement (CORE payment system unchanged — integration only)
- Travel booking / pre-approval
- Native mobile app (responsive web for prototype)

---

## Demo Flow Map

```
FLOW 1 — Expense Submission & Approval
  w1.1  ExpenseSubmitScene     Employee → OCR + form + submit + status chain
  w1.2  ApprovalQueueScene     Manager  → queue + SLA badge + receipt count visible
  w1.3  ApproveWithReceiptScene Manager  → receipt inline + approve/reject + resubmit loop
  w1.4  ExpenseStatusScene     Employee → timeline + history + avg payment time

FLOW 2 — AP Processing & Reporting
  w2.1  APReviewQueueScene     AP (Letza) → queue + GL pre-suggestion + aging
  w2.2  GLCoreSyncScene        AP (Letza) → GL confidence% + override + CORE auto-post
  w2.3  AdminScene             AP (Letza) → manager list + categories + hierarchy
  w2.4  CFODashboardScene      CFO/CAO   → spend bars + filters + comparison + drill-down + export

ROLE HANDOFFS:
  Employee → Manager at w1.2
  Manager  → AP at w2.1
  AP       → CFO at w2.4
```

---

## Design Mandates (from Designer Brief)

1. **"Wow moment #1"** — Snap a receipt and watch fields auto-fill (w1.1 OCR animation)
2. **"Wow moment #2"** — See receipts inline when approving (w1.3 — resolves PP#1 directly)
3. **"Wow moment #3"** — See the entire company's spend on one dashboard for the first time (w2.4)

> "This is not a reinvention — it's the current process simplified."
> Same flow, made to actually work. Mobile-first for field staff. Desktop fine for managers/AP/CFO.
