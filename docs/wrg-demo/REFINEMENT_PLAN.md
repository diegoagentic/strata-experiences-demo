# WRG Demo v6 — Refinement Plan

**Status:** Diagnosis + proposed execution plan
**Date:** 2026-04-14
**Scope:** Align the running Strata Estimator demo with the real WRG process
and pain points documented in `wrg-read/WRG_CONSOLIDATED_REFERENCE.md`.

---

## 1 · Diagnosis

### 1.1 What we have today

| Step | What actually runs in the Shell | Interactive closure |
| --- | --- | --- |
| `w0.1` Origin Splash | 10 s fullscreen animation (5 tool icons → pain statement → Strata logo). Auto-advances. | ✅ auto |
| `w2.1` Estimation — Expert | Shell pre-loaded with JPS (24 line items, $22 k hero, 1 day, 0 constraints). User can edit anything. | ❌ none |
| `w2.2` Designer verification | Same shell + `DesignerVerificationOverlay` (right-side panel with 5 modules). | ✅ "Send Back to Expert" |
| `w2.3` Quote assembly | Same shell. User must manually click Generate Proposal → `PricingWaterfall` modal with hard-coded $287 k → $202 k numbers. | ❌ waterfall has no closure CTA wired to `nextStep` |
| `w2.4` Proposal review | Same editable shell. No read-only mode, no approval chain, no release animation. | ❌ none |

The "step state" plumbing (`stepStates.ts`) exists, but only one branch actually
gates behavior: `estimation-escalated` → open the Designer overlay. Every other
state returns the same Shell.

### 1.2 Real WRG pain points (from `WRG_CONSOLIDATED_REFERENCE.md`)

The source docs identify **6 core pains** — the demo needs to show at least the
first 4 visually to deliver value for a technical stakeholder (Rey / Mark):

| # | Pain | Source | Currently in demo? |
| --- | --- | --- | --- |
| 1 | **Tribal knowledge** — install rates only in Mark's head | BPMN task 7 + Mark's 100 yrs | ❌ not shown |
| 2 | **Two disconnected tools** — delivery (min) and installation (hrs) are separate Excels | BPMN tasks 8-13 | ⚠️ only implied in origin splash |
| 3 | **Manual PDF interpretation** — reads drawings line by line | BPMN task 6 | ⚠️ AI Import modal exists but not wired to the w2.1 narrative |
| 4 | **No structured data layer** — only lump sum in CORE, no breakdown | BPMN task 14 | ⚠️ "Recovery Active" pill implies it but never proven |
| 5 | **Inconsistent outputs** — 85 % lump sum, no audit trail | — | ❌ not shown |
| 6 | **Scope limit risk** — ≤50 chairs, ≤2 desks, ≤20 files, ≤10 HATs | Delivery Pricer Section F/G | ❌ not shown |

### 1.3 Step-level disconnects (user report)

* **Flow 1 gives no value** — the splash ends in 10 s, then the estimator
  appears fully populated. There's no narrative bridge between "the old way"
  and "look, Strata has already ingested everything." **Pain 3 is invisible.**
* **w2.1 feels incomplete** — the plan described a 5-sub-step micro-narrative
  (rate lookup → AI stagger import → constraints → flag item → escalate).
  None of those sub-steps are wired. The user lands on a static, fully
  populated estimator with no CTA that advances the demo.
* **w2.2 → w2.3 handoff feels abrupt** — after the designer clicks "Send back",
  the shell doesn't animate the return or show David re-taking ownership. The
  handoff banner fires but there is no reinforcement inside the content.
* **w2.3 has no in-shell closure** — the waterfall modal ends with "Select
  Dealer" but clicking it just closes the modal; it doesn't fire `nextStep`.
* **w2.4 has no closure at all** — the dealer role shows an identical editable
  shell. There is no approval chain, no release animation, no final summary,
  and no way to restart the demo.

### 1.4 Visual gaps vs the plan

The `FLOW_AND_STEPS.md` doc promises behavior that was never built:

* Row 19 (OFS Serpentine) highlighted with an amber ring in w2.1 → w2.2.
* Other rows dimmed to `opacity-40` while w2.2 is active.
* Pulsing "Generate Proposal" CTA in w2.3.
* Floating action bar with Request Clarification / Preview / Approve in w2.4.
* `ApprovalChainModal` with staggered checkmarks in w2.4.
* Read-only mode on every input during w2.4.
* Source Files card in the dossier showing the 3 "CORE export" files.

---

## 2 · Refinement plan

Each step below lists **Current → Target → Micro-interactions → Files to
touch**. Priorities: P0 = blocking the narrative, P1 = enhances it, P2 = polish.

### 2.1 · Phase A — Cross-step plumbing (P0)

> Without this layer, the individual step refinements can't land cleanly.

1. **`useStepBehavior` hook (new)** — a small hook that reads `stepState`
   from `stepStates.ts` and returns flags the Shell/components can react to:
   `{ isReadOnly, flagRow19, pulseGenerateProposal, autoOpenWaterfall, … }`.
2. **Programmatic `setCustomer / setLineItems / setVariables` per step** —
   when `stepId` transitions to `w2.1`, the Shell should RESET to an "empty"
   baseline (no lineItems, hero at $0, constraints off). Then sub-steps
   populate the data through animations. Today the Shell pre-loads JPS
   unconditionally.
3. **Step-advance callbacks** — wire `nextStep()` from `useDemo()` into:
   * Escalate button (new, w2.1 closure)
   * Designer overlay "Send Back" (already wired)
   * Pricing waterfall "Send for Review" (currently only closes modal)
   * Approval chain final checkmark (new, w2.4 closure)
4. **`BillOfMaterialsTable` flagging prop** — new prop `flaggedRowIds: string[]`
   that renders an amber ring + warning badge on matching rows.
5. **`BillOfMaterialsTable` dim prop** — new prop `focusedRowId?: string` that
   dims every other row to `opacity-40`.
6. **`readOnly` prop on every section** — when true, inputs are disabled, the
   dossier combobox doesn't open, the `AI Import` and `Add Line` CTAs hide.

**Files:** `stepStates.ts` (extend), new `useStepBehavior.ts`, `StrataEstimatorShell.tsx`, `BillOfMaterialsTable.tsx`, `EstimatorDossierCard.tsx`, `FinancialSummaryHero.tsx`, `OperationalConstraintsPanel.tsx`.

---

### 2.2 · Step `w2.1` — Expert kick-off (P0)

**Current:** Shell renders fully populated JPS. No in-step narrative. No CTA
that advances the demo.

**Target:** A 4-beat auto-narrative that proves Pain 3 + Pain 4, then hands
off to the user for a single interactive click ("Escalate").

**Beats:**

| Beat | Trigger | Duration | What happens |
| --- | --- | --- | --- |
| w2.1.a | auto on step enter | 1.5 s | Dossier already shows client name, but ZIP and rates are blank. A small AI agent pill in the hero area announces: _"Loading CORE export…"_. Dossier fills in ZIP + address via CountUp / typewriter. Toast: "Market rates loaded for Fort Worth, TX". |
| w2.1.b | auto, 500 ms after a | 3 s | A ghost "AI Import" progress row appears above the BoM with a Sparkles icon: _"Extracting items from JPS_specs.pdf…"_. 24 line items stagger-fade into the BoM table, 120 ms apart. Hero counts up from $0 → $22 k in sync. This is the ONLY moment the user sees Pain 3 solved. |
| w2.1.c | interactive | user-paced | Constraints panel becomes interactive. Highlight hint on the "Planned Install Days" input with a one-time tooltip: _"Drag or type to see crew capacity react"_. Changing constraints animates the hero + crew count. |
| w2.1.d | auto, 1 s after b finishes | instant | Row 19 (OFS Serpentine) gets an amber ring + warning badge. A contextual banner appears just above the BoM: _"1 item flagged by AI — custom product, designer verification recommended"_ with a brand-primary "Escalate to Designer" button on the right. |
| w2.1.e | interactive (closure) | n/a | User clicks Escalate → confirmation dialog (headless-ui) → `nextStep()` fires → step w2.2 entered with the same shell but the DesignerVerificationOverlay slides in. |

**Micro-interactions:**
* `useEffect` on step mount resets Shell state to "empty" and runs the beat
  timeline via `setTimeout` chain (pausable via `isPaused` from DemoContext).
* `BillOfMaterialsTable` receives a `staggerImport` prop so it renders rows
  with an incremental `transform + opacity` transition.
* `EstimatorDossierCard` accepts an `animateFieldIn` prop per field for the
  typewriter effect on ZIP / address.
* New `FlaggedItemBanner` component sits between the Hero and the BoM.

**Pain points covered:** 2 (dual tools via origin splash recap), 3 (PDF
interpretation via AI Import animation), 4 (structured data via the "Recovery
Active" pill actually proving itself as rows land).

**Files to touch:**
* `StrataEstimatorShell.tsx` — add the beat timeline effect.
* `BillOfMaterialsTable.tsx` — add stagger prop.
* `EstimatorDossierCard.tsx` — add animate-in props.
* `src/features/strata-estimator/FlaggedItemBanner.tsx` (NEW).

---

### 2.3 · Step `w2.2` — Designer verification (P0 — small tweaks)

**Current:** `DesignerVerificationOverlay` opens as a right-side panel with
5 modules. Works, but the BoM behind it is untouched.

**Target:** Keep the overlay but visually focus the BoM on row 19 while
w2.2 is active.

**Beats:**

| Beat | Trigger | What happens |
| --- | --- | --- |
| w2.2.a | auto on step enter | BoM rows 1-18 and 20-24 dim to opacity-40. Row 19 gets `ring-2 ring-primary` + scroll-into-view. Designer overlay slides in from the right. Handoff banner shows "David Park sent you 1 item to verify". |
| w2.2.b | interactive | Designer checks the 5 modules in the overlay. Each checkbox is accessible and its state is kept in local state (already works). |
| w2.2.c | interactive | Designer types a comment in a textarea pre-filled with a sensible default ("Standard brackets compatible — confirmed modular assembly"). |
| w2.2.d | closure | Once all 5 modules are checked, the "Send Back to Expert" CTA enables. Click → overlay slides out right, BoM rows regain full opacity, handoff banner flips to "Alex Rivera approved the verification", then `nextStep()` fires into w2.3. |

**Micro-interactions:**
* `BillOfMaterialsTable` uses the new `focusedRowId` prop (from Phase A).
* The overlay already gates `Send Back` on `allChecked`; add a short
  `setTimeout(nextStep, 400)` inside `onSendBack` to let the slide-out animate.
* Handoff banner auto-fires on the role change — already wired.

**Files:** `StrataEstimatorShell.tsx` (pass focusedRowId), `DesignerVerificationOverlay.tsx` (delay `onSendBack`).

---

### 2.4 · Step `w2.3` — Quote assembly (P0)

**Current:** User manually clicks Generate Proposal → waterfall modal plays →
"Select Dealer" button just closes the modal.

**Target:** The step auto-triggers the waterfall (w2.3 is a celebratory
moment, not a user task) and the "Select Dealer" button actually advances
the demo.

**Beats:**

| Beat | Trigger | Duration | What happens |
| --- | --- | --- | --- |
| w2.3.a | auto on step enter | 1 s | Handoff banner: "Alex Rivera approved the verification — all rates finalized". Generate Proposal CTA in the hero starts pulsing (brand primary ring animation). |
| w2.3.b | auto, 1.5 s after a | 6 s | `PricingWaterfall` modal opens automatically. Rows stream in: Product List → Discount → Net → Labor → Freight → Total. Numbers count up. |
| w2.3.c | interactive (closure) | user-paced | Once the total lands, the footer reveals a `Listbox` "Select dealer to review" (pre-selected: Sara Chen) + "Send for review" CTA. |
| w2.3.d | closure | n/a | Click Send for review → modal closes → handoff banner "Sent to Sara Chen (…)" → `nextStep()` fires into w2.4. |

**Micro-interactions:**
* `PricingWaterfall` gains a `dealerOptions` + `onSendForReview` contract.
  Currently `onSendForReview` fires but the Shell's handler only closes the
  modal; it should call `nextStep()` too.
* The hard-coded $287,450 → $202,138 numbers should derive from the live
  estimate: base cost from `estimate.totalCost`, margin from `estimate.grossMargin`,
  and a configurable contract discount (keep 38 % as a constant in mockData).
* The "pulsing" effect on Generate Proposal CTA is a 1 s `animate-pulse` ring
  that starts when stepState = `estimation-assembly`.

**Files:** `StrataEstimatorShell.tsx` (auto-open waterfall + wire nextStep), `PricingWaterfall.tsx` (dealer selector, live numbers, closure).

---

### 2.5 · Step `w2.4` — Proposal review & release (P0)

**Current:** Dealer profile connected, but the Shell is identical to w2.1
(fully editable, no approval chain).

**Target:** Read-only snapshot + approval chain modal + release animation +
summary screen. This is the most visible gap.

**Beats:**

| Beat | Trigger | What happens |
| --- | --- | --- |
| w2.4.a | auto on step enter | Every input in the Shell becomes read-only (via `readOnly` prop from Phase A). Handoff banner: "David Park sent you a $202,138 proposal to review". A floating action bar slides in from the bottom: `Request Clarification` · `Preview PDF` · `Approve & Release`. |
| w2.4.b | optional | Preview PDF opens a simple modal with a styled PDF mock (title, line items, totals, signature). |
| w2.4.c | interactive (closure) | Approve & Release opens `ApprovalChainModal` (new). Shows 4 rows: David, Alex, Sara, Jordan. Each gets a green checkmark 800 ms apart (auto-animated). Progress bar fills. |
| w2.4.d | auto, 3 s after all checks | Modal transitions to success state. Confetti (lightweight canvas / CSS) + "Quote released" + sub-text "JPS_proposal_$202K.pdf generated" + 3 buttons: Download PDF / Send by email / Start new quote. |
| w2.4.e | auto, 5 s later | Optional summary overlay with 3 metrics: _"8 hours → 12 minutes" · "4 tools → 1 unified app" · "100 % audit trail preserved"_. "Start new quote" restarts the demo (reset state + `goToStep(0)`). |

**Files:**
* `StrataEstimatorShell.tsx` — read-only flag + floating action bar for w2.4.
* `src/features/strata-estimator/ProposalActionBar.tsx` (NEW).
* `src/features/strata-estimator/ApprovalChainModal.tsx` (NEW).
* `src/features/strata-estimator/ReleaseSuccessModal.tsx` (NEW).

**Pain points covered:** 4 (structured data proven), 5 (consistent output
with audit trail), 6 (implicit — no scope limit breach triggered).

---

### 2.6 · Step `w0.1` — Origin Splash (P1)

**Current:** 10 s fullscreen animation. Works and tells the story of the 4
tools. Auto-advances to w2.1.

**Target:** Keep as-is but sharpen the narrative so the user doesn't feel
"Flow 1 is empty". Two small additions:

1. After the transformation beat (9 s in), show one extra line of text for
   half a second: _"Next: the same $202 k quote, built inside Strata."_ Then
   fade to w2.1's "Loading CORE export…" intro so there's continuity.
2. Reduce the "pain statement" from 1.5 s to 1 s and extend the transition
   animation so the splash exits naturally into the Estimator intro.

**Files:** `WrgOriginSplash.tsx`, `wrg-demo.ts` (shift timings).

---

### 2.7 · P1 add-ons (after the 5 steps feel right)

* **Scope limit flag in `BillOfMaterialsTable`** — show a red badge when
  category totals exceed the Delivery Pricer scope limits (≤50 chairs,
  ≤2 desks, ≤20 files). Covers Pain 6.
* **AI confidence per row** — tiny HIGH / LOW chip in the QTY column based
  on mock data. Covers the 85 %/15 % split from the WRG assessment.
* **Dual-engine breakdown in the hero** — split Total Hours into
  "Installation hrs" + "Delivery hrs" derived from mock data. Makes Pain 2
  explicit.
* **Audit trail side panel** — read-only event log that updates as the user
  edits. Ties the "Recovery Active" pill to something tangible.

### 2.8 · P2 polish

* Demo summary overlay at the end (Part of w2.4.e above).
* Restart-the-demo flow from the success modal.
* Optional sound effects (off by default).
* Per-step progress indicator in the floating pill navbar (w0 / w1 / w2 /
  w3 / w4 of 5).

---

## 3 · Execution phases

| Phase | Scope | Deliverable | Est. effort |
| --- | --- | --- | --- |
| **A** | Cross-step plumbing (§2.1) + small tweaks to existing components | Step state reactively drives the Shell. One commit per file. | ~2 h |
| **B** | w2.1 narrative (§2.2) | Beat timeline + FlaggedItemBanner + stagger import. | ~2-3 h |
| **C** | w2.2 focus mode (§2.3) | `focusedRowId` wired, slide-out delay, handoff refinement. | ~45 min |
| **D** | w2.3 closure (§2.4) | Auto-open waterfall + live numbers + Listbox dealer selector. | ~1.5 h |
| **E** | w2.4 closure (§2.5) | Read-only mode, action bar, approval chain modal, release, summary. | ~3-4 h |
| **F** | Splash polish (§2.6) | Timing adjustments. | ~20 min |
| **G** | P1 add-ons (§2.7) | Scope flag, confidence chips, dual-engine breakdown, audit panel. | ~3 h |
| **H** | P2 polish (§2.8) | Progress indicator, restart flow. | ~1 h |

Phases A-F must land in order; G and H can be skipped for a stakeholder
demo and picked up later.

---

## 4 · Decisions (2026-04-14)

1. **Restart flow** → `goToStep(0)`. The "Start new quote" button after the
   release success replays the w0.1 origin splash. Shell state resets too.
2. **Scope limit breach narrative** → dedicated beat in w2.1 (option **a**).
   The 119 KD chairs vs the 50-chair limit becomes a visible sub-step where
   the AI detects the breach and notes an override. This is the cleanest
   visualization of Pain #6.
3. **Dealer selector options** → multi. The w2.3 dealer picker shows 3
   options (Sara Chen, Jordan Park, Michael Torres) with their roles, not
   just Sara pre-selected.
4. **Release animation** → sober, no confetti. A large SVG check that draws
   itself + a single ring pulse + staggered metric cards. No particle
   effects and no third-party lib.

## 5 · Impact-ordered execution

After the decisions above, the 8-phase sequence from §3 has been
re-ordered by delivered value:

| Order | Phase | Scope | Why this order |
| --- | --- | --- | --- |
| 🥇 **1** | **w2.4 closure + minimal plumbing** | Read-only mode in every section, `ProposalActionBar`, `ApprovalChainModal`, `ReleaseSuccessModal` (sober), restart to w0.1. Step-state reset hook. | Biggest gap: the demo currently has no ending. Completes the arc. |
| 🥈 **2** | **w2.1 narrative** | Empty-state reset on entry, beat timeline (rate lookup → AI stagger import → scope breach beat → flag row 19 → escalate), `FlaggedItemBanner`, `ScopeBreachBanner`. | First impression after the splash. Activates Pain 3 + Pain 6. |
| 🥉 **3** | **w2.3 closure** | Auto-open waterfall, live numbers from `estimate`, 3-option dealer selector, wire `nextStep`. | Closes the only remaining disconnected step. |
| 4 | w2.2 focus mode | `focusedRowId` prop, row dimming, scroll-into-view, slide-out delay. | Polish — works today but visually thin. |
| 5 | Splash continuity | Extra "Next: …" line + transition timing. | 20-min refinement. |
| 6 | P1 add-ons | Dual-engine breakdown, audit panel, confidence chips. | After the 5 steps feel complete. |
| 7 | P2 polish | Progress indicator, restart, sound off-by-default. | Final polish. |

---

## 5 · References

* `wrg-read/WRG_CONSOLIDATED_REFERENCE.md` — 18-stage AS-IS process + 7-step
  AI agent workflow + 6 core pain points.
* `wrg-read/MEETING_2026-03-27_WRG_Demo_Review.md` — Rey's focus on real
  estimator workflow + product-to-delivery-category mapping.
* `docs/wrg-demo/FLOW_AND_STEPS.md` — the "intended" v6 flow (written before
  the Shell was built; several promises never landed).
* `docs/wrg-demo/IMPLEMENTATION_PLAN.md` — phase breakdown up to Phase 16.
* `docs/wrg-demo/requirements/CORE_INTEGRATION_CONSTRAINT.md` — CORE is
  export-only. Any refinement must preserve this.
