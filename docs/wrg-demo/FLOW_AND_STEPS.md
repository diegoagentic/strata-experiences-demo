# WRG Demo v6 — Flow, Steps & Sub-steps

**Version:** Opción F + E (hybrid)
**Date:** 2026-04-10
**Branch:** `demo`

---

## High-level structure

The demo consists of **2 phases**:

1. **Origin Splash** (w0.1) — 8-10 second fullscreen animation showing "the old way" (4 disconnected tools) and transitioning to Strata Estimator. Plays once at the start.
2. **Strata Estimator Flow** (w2.1 → w2.4) — 4 collaborative steps where 3 roles work in the same app, passing the project between them.

The demo uses **ONE shared UI** (Strata Estimator with 3 tabs: ESTIMATOR / PROJECTS / CONFIG). Each step changes:
- The `connectedUser` shown in the top-right of the navbar
- The active tab
- The state of the data visible inside the tab
- A handoff banner at the top (temporary, 3 seconds)

---

## The 5 steps in detail

### **w0.1 — Origin Splash (System / Auto)**

**Duration:** 8-10 seconds, auto-advance
**Role indicator:** none (system)
**App shown:** `WrgOriginSplash` fullscreen overlay (not the Estimator yet)

#### Sub-steps (visual sequence):

**w0.1.a — Title fade in (1s)**
- Dark zinc-950 background
- Title appears: "WRG Quoting Process — The Old Way"
- Subtitle: "How a $202K quote got built yesterday"

**w0.1.b — Tool chain reveal (5s)**
Each tool icon appears with fade-in + slide-up, 1s apart:

1. 📧 **Outlook** icon
   - Label: "Email with PDF specs arrives"
   - Context: "Estimator manually reads and forwards"

2. 📥 **CORE** icon
   - Label: "Estimator opens CORE manually"
   - Context: "Downloads scope files (PDF + CSV)"
   - **Important**: This shows CORE as file source, not as integration

3. 📎 **PDF** icon
   - Label: "Spec PDFs opened"
   - Context: "Read line by line, hours of work"

4. 📊 **Excel** icon (Product Selection Sheet)
   - Label: "Product Selection Sheet"
   - Context: "Map items to categories manually"

5. 📊 **Excel** icon (Delivery Pricer)
   - Label: "Delivery Pricer + Labor Worksheet"
   - Context: "Apply rates from Mark's 100-year experience"

**w0.1.c — Pain statement (1.5s)**
- Red pulsing text appears centered:
- "4 disconnected tools. 8 hours of manual work."
- "85% of quotes have no audit trail."

**w0.1.d — Transformation (2s)**
- All 5 tool icons collapse into a single central icon (Strata logo)
- Icons animate inward with scale + fade
- New text: "Strata Estimator replaces the tools in the middle."
- Subtitle: "CORE still receives the final file — but now there's full audit trail."

**w0.1.e — Transition out (0.5s)**
- Fade to background
- `onComplete()` triggers → demo advances to w2.1 → Shell renders with Estimator ready

---

### **w2.1 — Cost Estimation & Expert Review (Expert David Park)**

**Duration:** Interactive, ~3-4 minutes
**Role indicator:** Navbar shows David Park + "Regional Sales Manager"
**App shown:** `StrataEstimatorShell` with ESTIMATOR tab active

#### Initial state when entering w2.1:
- Tab ESTIMATOR is active
- Project Dossier card shows JPS Health Network pre-filled
- Source Files card shows the 3 uploaded files (CORE exports + email attachment)
- Financial Hero Bar shows $0.00 (not yet calculated)
- Bill of Materials table is EMPTY
- Operational Constraints panel shows default values
- **Handoff banner at top**: "AI processed 3 source files — ready for your review" (fade out 3s)

#### Sub-steps:

**w2.1.a — Lookup labor rates by ZIP (auto, 1.5s)**
- David clicks the search icon next to ZIP code "76104" (Fort Worth)
- Simulated AI call: rates appear in the background config (Non-Union $65, Union $95)
- Tiny toast: "Market rates loaded for Fort Worth, TX area"

**w2.1.b — AI Import of line items (auto, 2s)**
- A simulated "AI is importing 24 line items from spec PDFs..." progress bar appears above the BoM
- Items stagger-fade-in into the BoM table one by one (24 rows, 80ms apart = ~2s total)
- Financial Hero Bar updates in real-time as items appear:
  - $0 → $45,000 → $89,000 → ... → $141,135 (final base)
- Toast: "24 line items imported from JPS_specs.pdf"

**w2.1.c — Operational constraints (interactive)**
- David marks checkboxes one by one:
  1. "After Hours" → Hero bar jumps from $141K to $211K
  2. "Protection" → Hero bar jumps from $211K to $222K
  3. Changes "Planned Install Days" from 1 to 4 → Crew Capacity updates from 3 to 10
- Each interaction has a smooth number transition (CountUp animation)

**w2.1.d — Flag custom item (auto)**
- Line item #19 (OFS Serpentine — 12-seat curved lounge) gets highlighted with amber ring
- Small badge appears on the row: "⚠️ Custom item — needs designer verification"
- Button appears below the BoM: "Escalate to Designer"

**w2.1.e — Handoff (interactive)**
- David clicks "Escalate to Designer"
- Confirmation: "Send OFS Serpentine verification to Alex Rivera?"
- On confirm → demo advances to w2.2

---

### **w2.2 — Designer Verification (Designer Alex Rivera)**

**Duration:** Interactive, ~1-2 minutes
**Role indicator:** Navbar changes to Alex Rivera + "Designer"
**App shown:** Same StrataEstimatorShell, same ESTIMATOR tab

#### State when entering w2.2:
- **Handoff banner**: "David Park sent you 1 item to verify" (fade out 3s)
- Estimator shows the SAME data from w2.1, but visually focused on item #19
- All other rows in BoM are `opacity-40` (grayed out)
- Row #19 (OFS Serpentine) is highlighted with ring-primary
- A floating verification panel appears to the right of the row

#### Sub-steps:

**w2.2.a — Review item details (visual)**
- Floating panel shows:
  - Product: OFS Serpentine 12-seat curved lounge
  - Category: Ancillary / Lounge
  - Current rate: 1.5 hours (standard)
  - AI confidence: 72% (below threshold → needs human review)
  - Spec snippet: "Custom fabric grade, connection hardware TBD"

**w2.2.b — Adjust rate**
- Alex can override the rate via a number input in the panel
- Default override: 14.0 hours (12 seats × 1.0 hour + 2.0 hours alignment)
- When Alex changes the value, the Financial Hero recalculates live

**w2.2.c — Add designer note (optional)**
- Textarea: "Comments for the estimator"
- Pre-filled example: "Standard brackets compatible — confirmed modular assembly"

**w2.2.d — Approve verification (interactive)**
- Button: "Approve & Return to Expert"
- On click → all items in BoM regain full opacity
- Demo advances to w2.3

---

### **w2.3 — Quote Assembly (Expert David Park)**

**Duration:** Interactive → animation ~15s
**Role indicator:** Navbar changes back to David Park
**App shown:** Same Shell, ESTIMATOR tab, now with updated rates

#### State when entering w2.3:
- **Handoff banner**: "Alex Rivera approved the verification" (fade out 3s)
- All BoM items visible again
- Hero bar shows updated total with the adjusted labor hours
- Generate Proposal CTA is now **pulsing** to draw attention

#### Sub-steps:

**w2.3.a — Click Generate Proposal (interactive)**
- David clicks the "Generate Proposal" button in the Hero
- The BoM table fades slightly
- A **Pricing Waterfall** modal/overlay appears centered

**w2.3.b — Pricing waterfall animation (auto, 8s)**
Lines appear sequentially (1s each):
```
MillerKnoll list price:      $287,450
JPS contract discount (-38%):  -$109,231
─────────────────────────
Net product price:            $178,219
+ Labor cost:                 +$17,685  ← from Strata calculation
+ Freight:                     +$6,234
─────────────────────────
FINAL PROPOSAL:               $202,138
```
Each line counts up with CountUp animation.

**w2.3.c — Select dealer for review (interactive)**
- After waterfall, a dealer selector appears:
  - Dropdown: "Select dealer to review"
  - Options: Sara Chen (pre-selected), Jordan Park, ...
- Button: "Send proposal for review"

**w2.3.d — Handoff (interactive)**
- David clicks "Send proposal for review"
- Confirmation: "Send $202,138 proposal to Sara Chen?"
- On confirm → demo advances to w2.4

---

### **w2.4 — Proposal Review & Release (Dealer Sara Chen)**

**Duration:** Interactive → HITL, ~2 minutes
**Role indicator:** Navbar changes to Sara Chen + "Account Manager"
**App shown:** Same Shell, ESTIMATOR tab

#### State when entering w2.4:
- **Handoff banner**: "David Park sent you a $202,138 proposal to review"
- Estimator is now in **read-only mode** — all inputs disabled
- A new floating action bar appears at the bottom with 3 buttons:
  1. "Request Clarification"
  2. "Preview PDF"
  3. "Approve & Release"

#### Sub-steps:

**w2.4.a — Review sections (visual)**
- Sara scrolls through the Estimator
- Each section (Dossier, Hero, BoM, Constraints) is visible but read-only
- Sub-totals per section are now visible as small badges:
  - Dossier: "JPS Health Network — verified"
  - Hero: "$202,138 final"
  - BoM: "24 items — all verified"
  - Constraints: "Night work + Protection applied"

**w2.4.b — Preview PDF (optional)**
- Sara clicks "Preview PDF"
- Modal opens showing a styled PDF preview with:
  - Header: JPS Health Network proposal
  - Line items table
  - Financial summary
  - Footer with signature block

**w2.4.c — Approve & trigger approval chain (interactive)**
- Sara clicks "Approve & Release"
- `ApprovalChainModal` opens showing:
  - David Park — Regional Sales Manager ✓ (auto-checks after 1s)
  - Alex Rivera — Designer ✓ (auto-checks after 2s)
  - Sara Chen — Account Manager ✓ (auto-checks after 3s)
  - Jordan Park — VP Sales ✓ (auto-checks after 4s)
- Progress bar fills as each signature is added
- Final message: "Proposal approved by 4-person chain"

**w2.4.d — Release animation (auto, 2s)**
- Modal transitions to success state
- Confetti or checkmark animation
- Final message: "Quote released"
- Sub-text: "JPS_proposal_$202K.pdf generated"
- Action buttons:
  - "Download PDF" (primary — for uploading to CORE manually)
  - "Send by email" (secondary)
  - "Start new quote" (tertiary)

**w2.4.e — End of demo (auto)**
- After 5 seconds, demo auto-returns to step menu or shows summary screen
- Optional summary overlay with metrics:
  - "8 hours → 12 minutes"
  - "4 tools → 1 unified app"
  - "100% audit trail preserved"

---

## Role participation summary

| Role | Person | Participates in | App shown |
|---|---|---|---|
| **System** | — | w0.1 | WrgOriginSplash |
| **Expert** | David Park | w2.1, w2.3 | StrataEstimatorShell |
| **Designer** | Alex Rivera | w2.2 | StrataEstimatorShell (focused mode) |
| **Dealer** | Sara Chen | w2.4 | StrataEstimatorShell (read-only + approval) |

All roles share the **same Strata Estimator UI** — only the `connectedUser`, data state, and interactivity change per step.

---

## What's NOT in the demo anymore (eliminated from Flow 1)

- ❌ `w1.1 Email Ingestion` (replaced by splash)
- ❌ `w1.2 Mismatch Detection` (not in real WRG BPMN)
- ❌ `w1.3 Designer Field Review` (not in real WRG BPMN)
- ❌ `w1.4 Scope Registration` (replaced by source files card in Dossier)
- ❌ `w1.5 Design Review` (not in real WRG BPMN)

These were artifacts of the previous demo version but are not reflected in the actual WRG BPMN pain points. Removing them simplifies the demo and increases fidelity to the real process.

---

## What's NEW in the demo

- ✅ `w0.1 Origin Splash` — 8-10s visual explanation of "the old way"
- ✅ Single unified UI (Strata Estimator) used by all 3 roles
- ✅ HandoffBanner showing role transitions
- ✅ Source Files card in Dossier showing CORE exports as origin
- ✅ Live recalculation of Financial Hero as constraints change
- ✅ Designer verification as a focused state (not a separate page)
- ✅ Pricing waterfall animation for quote assembly
- ✅ Approval chain modal at the end
