# WRG Demo v6 — Refinement Progress & Remaining Plan

**Companion to:** [`REFINEMENT_PLAN.md`](./REFINEMENT_PLAN.md)
**Updated:** 2026-04-14
**Branch:** `demo`

This doc tracks the execution of the refinement plan against the actual
commits on the branch, and is the single source of truth for what still
needs to ship. Phases are ordered by delivered value (biggest gap first).

---

## ✅ Completed phases

### 🥇 Phase 1 — w2.4 proposal review closure · `6a9e5f1`

> **Why first:** The demo had no ending at all. Sara Chen's role (Dealer)
> rendered the same editable Shell as w2.1, with no approval, no release,
> no way to restart.

**Delivered:**

- **`readOnly` plumbing** across every Shell section. Gated by
  `stepState === 'proposal-review'`.
  - `EstimatorDossierCard` — combobox hides chevron + rate lookup, inputs
    become plain text
  - `BillOfMaterialsTable` — row inputs become read-only, `InlineListbox`
    gains a `disabled` prop that suppresses hover + chevron, Add Line /
    AI Import / Trash buttons hidden
  - `OperationalConstraintsPanel` — number input + checkboxes disabled
  - `FinancialSummaryHero` — `hideGenerateCTA` prop hides the
    "Generate Proposal" button (replaced by the floating action bar)
- **`ProposalActionBar.tsx` (NEW)** — floating bottom pill with
  `Request Clarification` · `Preview PDF` · `Approve & Release`
  (primary). Shows `estimate.salesPrice` on the left. Only mounts when
  `isProposalReview`.
- **`ApprovalChainModal.tsx` (NEW)** — 4-role chain (David → Alex → Sara
  → Jordan) auto-approves each row 800 ms apart with a progress bar and
  a pulsing ring on the currently-pending avatar. Dialog is not
  dismissible while the chain is in flight. Calls `onComplete()` 600 ms
  after the last signature.
- **`ReleaseSuccessModal.tsx` (NEW)** — sober release animation: SVG
  checkmark that strokes itself (`stroke-dashoffset`, 600 ms), single
  ring pulse (`animate-ping` with `iterationCount: 1`), 3 staggered
  metric cards (_8 hrs → 12 min_, _4 tools → 1 app_, _15 % → 100 %_).
  Footer: `Start new quote` · `Send by email` · `Download PDF`.
- **Restart flow** — `handleRestartDemo` resets customer, lineItems,
  variables, config, lastFile, activeTab, savedEstimates back to mocks,
  closes every modal, and calls `goToStep(0)` → replays from w0.1.

---

### 🥈 Phase 2 — w2.1 narrative beat timeline · `81cb053`

> **Why second:** First impression after the splash. The Shell used to
> render fully-populated JPS out of the gate, so the "AI did 8 hours of
> work for you" story never landed.

**Delivered:**

- **Beat timeline (`useEffect` on `stepId === 'w2.1'`)** — resets the
  Shell to an empty-ish state and plays 4 beats:

  | t (ms) | Beat | What happens |
  | --- | --- | --- |
  | 0 | reset | Customer name kept, ZIP/address cleared, lineItems empty, variables at defaults |
  | 800 | dossier land | ZIP + address fill in (state swap, no keystroke-level animation) |
  | 1100 | import intro | `importStatus` string shows in the BoM header with a pulsing Sparkles icon |
  | 1400 | stagger import | `setLineItems(JPS_LINE_ITEMS)` → BoM rows fade + slide in from the left, 80 ms apart per row |
  | 3600 | status off | Import indicator cleared |
  | 3900 | scope breach | `ScopeBreachAlert` fires above the BoM (119 KD chairs > 50 limit). Self-dismisses after 3.5 s |
  | 6900 | flagged | `flaggedRowIds = ['li-19']` → OFS Serpentine row gets amber ring + bg. `FlaggedItemBanner` slides in under the BoM with the Escalate CTA |

- **`ScopeBreachAlert.tsx` (NEW)** — Pain #6 visualization. Amber banner
  with warning icon, `"119 KD task chairs · Delivery Pricer limit is 50
  · AI applied a documented override"`, and a green `Override logged`
  chip on the right. Self-dismissing.
- **`FlaggedItemBanner.tsx` (NEW)** — indigo accent with Sparkles,
  label + reason, and primary `Escalate to Designer` pill that calls
  `nextStep()`.
- **`BillOfMaterialsTable` props** —
  - `staggerImport?: boolean` — rows render with `animate-in fade-in
    slide-in-from-left-1 duration-300` + `animationDelay: index × 80ms`
  - `flaggedRowIds?: string[]` — rows in this array get
    `bg-amber-500/5 ring-1 ring-inset ring-amber-500/40` and lose the
    normal hover
  - `importStatus?: string | null` — inline hint next to the header title
- **Restart flow** — extends `handleRestartDemo` to also reset
  `w21Phase`, `importStatus`, `scopeBreachOpen`, `flaggedRowIds` so the
  narrative replays cleanly.
- **Bonus** — `flaggedRowIds` is set at beat 4 and **not cleared** when
  advancing to w2.2, so the Designer's overlay lands on a BoM where
  row 19 already has the amber ring. Free continuity for w2.2.

**Pain points now visualized:**
- ✅ **Pain #3** (Manual PDF interpretation) — stagger import + indicator
- ✅ **Pain #4** (No structured data) — "Override logged" chip + Recovery Active pill
- ✅ **Pain #6** (Scope limit risk) — explicit breach banner with the real JPS numbers

---

### 🥉 Phase 3 — w2.3 quote assembly closure · `08e5da9`

> **Why third:** The only remaining disconnected step. Users had to
> click Generate Proposal manually, the waterfall showed hard-coded
> numbers, and the "Select Dealer" button just closed the modal.

**Delivered:**

- **Live numbers in the waterfall** — `mockData.ts` exports
  `JPS_PRODUCT_LIST` ($287,450), `JPS_CONTRACT_DISCOUNT` (0.38),
  `JPS_FREIGHT` ($6,234). Product list + freight stay constant but the
  labor line flows from `estimate.salesPrice`, so w2.1 edits ripple
  into the waterfall total in real time. Row formatting uses signed
  money (`+$17,685` / `-$109,231`) so the modal reads like a ledger.
- **3-option dealer picker** — new `DealerOption` type + `DEALERS`
  array (Sara Chen _Primary_, Jordan Park, Michael Torres). The
  waterfall footer hosts a headless-ui `Listbox` with avatar + name +
  role in both the trigger and the options. Dropdown opens upward
  (`bottom-full`) so it never clips the modal.
- **Auto-open + closure** — Shell watches `stepId === 'w2.3'` and opens
  the waterfall 1200 ms after entry, giving the handoff banner time to
  fade. `handleSendForReview(dealerId)` closes the modal and calls
  `nextStep()` → w2.4. CTA renamed from "Select Dealer" (misnamed, the
  picker sits next to it) to "Send for Review".

---

## 🗺 Current end-to-end narrative

With Phases 1-3 in place, the 5-step arc now plays cleanly from the
splash to the restart:

| Step | Role | What happens | Closure |
| --- | --- | --- | --- |
| **w0.1** | System | 10 s fullscreen splash — "The Old Way" 5-tool animation | Auto-advances |
| **w2.1** | Expert (David) | Dossier loads → AI stagger imports 24 items → scope breach alert → row 19 flagged | Click **Escalate to Designer** |
| **w2.2** | Designer (Alex) | `DesignerVerificationOverlay` slides in from the right · 5 modules to validate | Click **Send Back to Expert** |
| **w2.3** | Expert (David) | 1.2 s breath, then waterfall auto-opens with live numbers | Pick dealer + click **Send for Review** |
| **w2.4** | Dealer (Sara) | Read-only Shell + floating `ProposalActionBar` | Click **Approve & Release** → `ApprovalChainModal` (4 auto-checkmarks) → `ReleaseSuccessModal` (SVG check + metrics) → **Start new quote** returns to w0.1 |

**Time to complete the demo (no pauses):** ~60 seconds of auto-play +
user interaction at each step boundary.

---

## 🔜 Remaining phases

### Phase 4 — w2.2 focus mode (polish, ~45 min)

> **Why next:** Cheapest phase. w2.2 already works (overlay opens, Send
> Back fires), but the BoM behind the overlay is untouched — the
> narrative says "Alex is verifying the escalated item" but visually
> the whole table is still there at full opacity. Tighten this.

**Scope:**

1. **`focusedRowId` prop on `BillOfMaterialsTable`** — when set, every
   other row gets `opacity-40` and the focused row scales slightly.
   Reuses the same row loop that already handles `flaggedRowIds`.
2. **Shell wiring** — pass `focusedRowId='li-19'` when `stepState ===
   'estimation-escalated'`. Clears automatically when leaving w2.2.
3. **Scroll-into-view** — on `stepState` transition to `estimation-
   escalated`, scroll the BoM so row 19 is centered in the viewport.
   `useEffect` + `scrollIntoView({ behavior: 'smooth', block: 'center' })`.
4. **Designer overlay slide-out delay** — today `onSendBack` fires
   `nextStep()` immediately. Add a 400 ms `setTimeout` so the overlay
   finishes its leave transition before the step changes and the
   banner fires for w2.3.

**Files:** `BillOfMaterialsTable.tsx` (+ focusedRowId prop),
`StrataEstimatorShell.tsx` (pass prop, add scroll effect),
`DesignerVerificationOverlay.tsx` (delay onSendBack).

**No new components.**

---

### Phase 5 — Splash → w2.1 continuity (20 min)

> **Why:** Small but noticeable. The splash ends abruptly and w2.1's
> narrative starts cold.

**Scope:**

1. **Add a continuity line** to `WrgOriginSplash.tsx` at ~9.2 s:
   _"Next: the same $202 k quote, built inside Strata."_ (fade in, 600 ms)
2. **Tighten phase timings** — shrink the pain statement from 1.5 s to
   1.2 s and extend the fade-out from 500 ms to 700 ms, so the splash
   exits smoothly into w2.1's dossier-loading beat.
3. **Sync the step behavior** — update `WRG_DEMO_STEP_BEHAVIOR['w0.1']`
   duration from 10 to 10.4 s to match the new timings.

**Files:** `WrgOriginSplash.tsx`, `wrg-demo.ts`.

---

### Phase 6 — P1 add-ons (~3 h)

> Optional. Only if there's time before the stakeholder demo. None of
> these block the narrative, but each one adds weight to a pain point.

- **Dual-engine breakdown in the hero** — split Total Hours into
  _"Installation hrs"_ + _"Delivery hrs"_ using `estimate` + delivery
  pricer constants. Makes Pain #2 (two disconnected tools) explicit.
- **AI confidence chips per BoM row** — tiny `HIGH / LOW` indicator in
  the QTY column based on mock data. ~85 % HIGH, ~15 % LOW. Reinforces
  the 85/15 split from the WRG assessment.
- **Audit trail side panel** — read-only event log that updates as the
  user edits constraints / quantities. Ties the "Recovery Active" pill
  to something tangible. Pain #4 proof.
- **Scope breach as a sticky badge** — currently the scope breach alert
  self-dismisses. Keep a compact `119 / 50` badge in the BoM header
  after it fades so the state is always visible.

---

### Phase 7 — P2 polish (~1 h)

> Final polish. Skip if tight on time.

- **Per-step progress indicator** in the floating pill navbar
  (e.g. `w2.1 of 5`).
- **Handoff toast sound effect** (off by default, toggle in a
  hidden config panel).
- **"Skip to step" menu** — hold Shift + number keys to jump between
  w0.1 / w2.1 / w2.2 / w2.3 / w2.4 during development.
- **Dark mode validation pass** — audit every new component from
  Phases 1-3 for dark-mode contrast (spot check already good).

---

## Commit log

```
08e5da9 feat(estimator): refinement phase 3 — w2.3 quote assembly closure
81cb053 feat(estimator): refinement phase 2 — w2.1 narrative beat timeline
6a9e5f1 feat(estimator): refinement phase 1 — w2.4 proposal review closure
200eb57 docs(wrg-demo): add refinement plan cross-referencing WRG source + current shell
```

## Files touched by the refinement

**New (6):**

- [`ProposalActionBar.tsx`](../../src/features/strata-estimator/ProposalActionBar.tsx) — Phase 1
- [`ApprovalChainModal.tsx`](../../src/features/strata-estimator/ApprovalChainModal.tsx) — Phase 1
- [`ReleaseSuccessModal.tsx`](../../src/features/strata-estimator/ReleaseSuccessModal.tsx) — Phase 1
- [`ScopeBreachAlert.tsx`](../../src/features/strata-estimator/ScopeBreachAlert.tsx) — Phase 2
- [`FlaggedItemBanner.tsx`](../../src/features/strata-estimator/FlaggedItemBanner.tsx) — Phase 2
- [`REFINEMENT_PLAN.md`](./REFINEMENT_PLAN.md) + this file

**Modified:**

- [`StrataEstimatorShell.tsx`](../../src/features/strata-estimator/StrataEstimatorShell.tsx) — all 3 phases
- [`EstimatorDossierCard.tsx`](../../src/features/strata-estimator/EstimatorDossierCard.tsx) — readOnly
- [`BillOfMaterialsTable.tsx`](../../src/features/strata-estimator/BillOfMaterialsTable.tsx) — readOnly, stagger, flagged, importStatus, InlineListbox disabled
- [`OperationalConstraintsPanel.tsx`](../../src/features/strata-estimator/OperationalConstraintsPanel.tsx) — readOnly
- [`FinancialSummaryHero.tsx`](../../src/features/strata-estimator/FinancialSummaryHero.tsx) — hideGenerateCTA
- [`PricingWaterfall.tsx`](../../src/features/strata-estimator/PricingWaterfall.tsx) — live props + dealer picker
- [`mockData.ts`](../../src/features/strata-estimator/mockData.ts) — DEALERS, JPS_PRODUCT_LIST, JPS_CONTRACT_DISCOUNT, JPS_FREIGHT
- [`index.ts`](../../src/features/strata-estimator/index.ts) — barrel exports

---

## Decisions in effect (from `REFINEMENT_PLAN.md` §4)

1. **Restart flow** → `goToStep(0)` (replays the w0.1 splash)
2. **Scope breach narrative** → dedicated beat in w2.1 (option **a**)
3. **Dealer selector** → 3 options (Sara _Primary_, Jordan, Michael)
4. **Release animation** → sober, no confetti (SVG check + ring pulse +
   staggered metric cards)
