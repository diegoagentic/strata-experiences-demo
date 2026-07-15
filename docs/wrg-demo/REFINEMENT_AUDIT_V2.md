# WRG Demo v6 — Refinement Audit v2 (Process Fidelity Pass)

**Date:** 2026-04-14
**Companion to:** [`REFINEMENT_PLAN.md`](./REFINEMENT_PLAN.md) · [`REFINEMENT_PROGRESS.md`](./REFINEMENT_PROGRESS.md)
**Source docs cross-checked:**
- [`wrg-read/WRG_CONSOLIDATED_REFERENCE.md`](../../wrg-read/WRG_CONSOLIDATED_REFERENCE.md) — §2 AS-IS 18-stage process, §3 7-step agent workflow, §2 six pain points
- [`wrg-read/MEETING_2026-03-27_WRG_Demo_Review.md`](../../wrg-read/MEETING_2026-03-27_WRG_Demo_Review.md) — Rey's focus on real workflow + mismatch detection + product-to-delivery-category mapping
- [`docs/wrg-demo/requirements/CORE_INTEGRATION_CONSTRAINT.md`](./requirements/CORE_INTEGRATION_CONSTRAINT.md) — CORE is export-only

---

## 1 · What the user reported

> _"En el paso 2.1 está la interfaz pero no se muestran cosas del proceso que se menciona como la importación y poner a correr el financial hero al generar proposal; se corta el proceso, el botón dice seleccionar dealer y en la pantalla del paso 2.2 empezamos con un Designer. Eso se ve muy desconectado. Aparte el módulo que se muestra no se ve dónde sale y cómo aparece y no está conectado con el paso anterior. Hay que pensar en cada paso del flujo, pasos, sub-pasos y micro-interacciones para que sea más realista y fluido, además agregar procesos que tengamos en la documentación."_

Core complaints, translated into design language:

1. **w2.1 narrative is incomplete** — several AI-pipeline beats from the
   docs aren't visible; the BoM just appears with categories already
   mapped, the hero just "knows" the split, Generate Proposal never
   actually runs from w2.1.
2. **w2.1 → w2.2 handoff is a jump cut** — the user clicks a CTA, the
   screen swaps and a Designer overlay appears from nowhere with no
   "routing / receiving / notified" micro-transition in between.
3. **w2.2 entry lacks provenance** — the DesignerVerificationOverlay
   doesn't visually come _from_ the escalate action; there's no trail
   that says "Alex just got an email / notification / task in her queue".
4. **Stale copy claim**: _"el botón dice seleccionar dealer"_ — this is
   from before refinement Phase 3. The current PricingWaterfall CTA is
   already **Send for Review** (`08e5da9`). Flagged as a no-op; verify.
5. **Global ask**: every step needs sub-steps + micro-interactions so
   the demo feels like a living workflow, not a slide deck.

---

## 2 · Cross-reference: 7-step AI agent workflow vs current demo

From `WRG_CONSOLIDATED_REFERENCE.md` §3 (Claude Sonnet 4 solution):

| Agent Step | Doc time | Current demo coverage | Status |
| --- | --- | --- | --- |
| **1. Trigger** — Agent monitors CORE, identifies estimator by location, creates job record | ~12 s | w0.1 splash mentions email icon; w2.1 opens already inside the Shell with no "agent picked this up" moment | ⚠ implicit |
| **2. Ingest & Extract** — Pull site constraints, download PDFs, Claude extracts item list | ~18-25 s | w2.1 beat 2 shows the stagger import with `Importing 24 items from JPS_specs.pdf…` indicator | ✅ covered |
| **3. Map to Categories** — 85% template lookup, 15% LLM fallback | ~13-15 s | Categories appear pre-assigned in the BoM rows; the HIGH/LOW confidence dots hint at it but there's no beat where the mapping happens | ❌ **missing** |
| **4. Dual-Engine Calculation** — Installation × man-hrs + Delivery × min + Section F/G multipliers + scope limit enforcement | ~12-14 s | Hero shows the split label but never animates the calc. Scope breach alert is the only visible engine moment | ⚠ partial |
| **5. Produce Draft** — Line-item breakdown + combined lump sum + exceptions list | ~13-15 s | Implicit — BoM + hero + flagged banner land at the end of the beat timeline | ⚠ implicit |
| **6. Human Review** — Estimator reviews, overrides, approves | 5-20 min | w2.1-w2.3 user interaction + DesignerVerificationOverlay | ✅ covered |
| **7. Write Back** — Approved totals + audit trail PDF to CORE | ~15-20 s | w2.4 release modal + approval chain + audit trail panel (6d) | ✅ covered |

**Gaps:** Steps 1, 3, 4, 5 need explicit visual beats in the w2.1 timeline.

---

## 3 · Gap-by-gap diagnosis

### Gap A — w2.1 opening has no "agent is working" preamble

**Current:** The splash fades out, the Shell appears with the customer name
already filled (step 1 of the beat timeline resets it to an empty-ish
state, but the transition from splash to Shell is instantaneous).

**Doc says:** Step 1 (Trigger, ~12 s) is where the agent notices the
quote request, identifies the estimator, and creates a job record.

**Fix:**
- Add a **pre-beat** at `t = -600 ms → 0` (during the splash fade-out):
  a small "Agent picked up JPS Health Network · routing to David Park"
  toast that lives above the Shell before the dossier loading begins.
- This ties the splash continuity line (_"Loading JPS Health Network…"_)
  directly to the first Shell event.

**Files:** New `AgentNotificationToast.tsx` OR reuse `HandoffBanner`
pattern with a `system` actor variant.

---

### Gap B — w2.1 skips Map-to-Categories (Agent Step 3)

**Current:** After the stagger import finishes, the BoM rows already
have their categories assigned. The user never sees the AI _doing_ the
mapping.

**Doc says:** Step 3 is where 85 % of items get template-parsed and
15 % get LLM fallback — this is the **core technical value** of the
agent, per `WRG_CONSOLIDATED_REFERENCE.md` ADR-002 and §3.

**Fix — Category mapping beat (~1.5 s)**:
1. When the BoM stagger finishes (`t ≈ 3600 ms`), every row's category
   is momentarily set to `—` (placeholder).
2. Over the next 1.5 s, each row fills its category sequentially, with
   the confidence dot appearing first (green/amber) and then the
   category text crossfading in.
3. Header importStatus changes to `"Mapping products to labor
   categories…"` during this beat.
4. When the beat finishes, the log gets a new entry:
   `Mapped 24 items · 21 template, 3 fallback`.

**Files:** `BillOfMaterialsTable.tsx` (new `mappingRowIds` prop),
`StrataEstimatorShell.tsx` (new beat slot in the w2.1 timeline).

---

### Gap C — w2.1 skips Dual-Engine Calculation (Agent Step 4)

**Current:** The hero just displays the final number. The install /
delivery split label is present but static.

**Doc says:** Step 4 runs the two engines (delivery minutes +
installation hours) in parallel and applies Section F/G multipliers.
The scope breach is a _side effect_ of this engine, not the whole thing.

**Fix — Calculation beat (~1.8 s)**:
1. After the mapping beat, the hero shows a pulsing `Calculating…`
   label where the `$Final Quote Price` number lives.
2. The number counts up from `$0` to the final value using a CountUp
   animation driven by `requestAnimationFrame`.
3. While it counts, the sub-line _install_ / _delivery_ numbers also
   count up (synced).
4. Scope breach alert fires _during_ the count-up (at ~60 % progress)
   so it visibly interrupts the engine.
5. When the count finishes, the log gets:
   `Calculated $X (install $A + delivery $B + margin $C)`.

**Files:** `FinancialSummaryHero.tsx` (needs a `isCalculating` prop +
CountUp logic), `StrataEstimatorShell.tsx` (beat slot).

---

### Gap D — w2.1 → w2.2 handoff is a cut, not a transition

**Current:**
```
user clicks Escalate → nextStep() → w2.2 enters → DesignerVerificationOverlay slides in
```

There's no:
- "Sending…" state on the Escalate button
- Visual of the escalation being routed
- Arrival cue for Alex (photo zoom-in, toast, etc.)

**Doc says:** Per the AI readiness assessment, Mark/Jaime's UX
preference is "simple output with reference to what was put in, easy
to update directly". The handoff between roles is the piece that
should feel most like an email / notification inbox, not a slide change.

**Fix — 3-beat handoff sequence (~2.5 s total)**:

| Beat | t (ms) | What happens |
| --- | --- | --- |
| **D.1** | 0 → 400 | Escalate button turns into a loading state (`"Routing to designer…"` with a spinner). FlaggedItemBanner stays mounted but dims. |
| **D.2** | 400 → 1200 | A small notification toast appears top-right showing Alex Rivera's avatar + _"New task · verify OFS Serpentine from David Park"_. Animates in with a subtle slide. |
| **D.3** | 1200 → 2000 | Toast slides out to the right; DesignerVerificationOverlay slides in from the right along the same path, as if it emerged from the toast. Navbar connectedUser flips to Alex. BoM dims everything except row 19. |
| — | 2000 | `nextStep()` fires, demo is now officially on w2.2 |

**Files:** New `RoleHandoffTransition.tsx` (timeline-managed overlay
that sits between `nextStep()` calls), `StrataEstimatorShell.tsx`
(escalate handler becomes async + drives the transition before
calling nextStep).

---

### Gap E — w2.2 overlay lacks provenance

**Current:** The overlay just slides in. Nothing says "this is what
David escalated" _inside_ the overlay header.

**Doc says:** Rey's meeting notes highlight that the hand-off moment
is exactly where mismatches get lost — the system must surface _who
sent what, when, why_.

**Fix — Overlay header redesign**:
- The header of `DesignerVerificationOverlay` gets a "From David Park"
  section right under the title:
  - Avatar + name + role
  - Timestamp (now - 5s)
  - The exact Escalate reason text: `"Custom product · designer
    verification recommended"`
  - A small link: _"See row in the BoM"_ that scrolls row 19 into view
    (even though it's already dimmed behind the overlay).
- The 5 verification modules stay as-is.

**Files:** `DesignerVerificationOverlay.tsx` (header restructure),
`StrataEstimatorShell.tsx` (pass `escalationContext` prop).

---

### Gap F — w2.3 waterfall has no "Expert took over" preamble

**Current:** Handoff banner fires, waterfall opens 1200 ms later, no
connective tissue.

**Doc says:** Step 5 (Produce Draft) and Step 7 (Write Back) in the
agent workflow are _sequential_ — the expert verifies, then the draft
is finalized, then the dealer receives it. The demo skips the
_finalization_ moment.

**Fix — Expert confirmation beat (~1.5 s before waterfall opens)**:
1. Handoff banner fires: `"Alex Rivera verified the escalation"`
2. A small `Verification log` card appears above the BoM showing:
   - ✓ Cost summary confirmed
   - ✓ OFS Serpentine: 14 h install (standard brackets)
   - ✓ Applied rate validated
3. Hero pulses once (subtle brand ring) to signal "ready to assemble"
4. _Then_ waterfall auto-opens

**Files:** New `VerificationLogCard.tsx`, `StrataEstimatorShell.tsx`.

---

### Gap G — w2.4 entry has no "Your turn, dealer" cue

**Current:** Dealer connects, Shell becomes read-only, ProposalActionBar
slides in from the bottom. The action bar is the only cue.

**Fix — Dealer arrival beat (~1.5 s)**:
1. Handoff banner: `"David Park sent you a $X proposal"`.
2. The Shell dims everything _briefly_ (200 ms) and a centered toast
   says: _"Review the full proposal below and release when ready."_
   Toast auto-dismisses after 1.5 s.
3. Action bar slides up.

**Files:** Reuse `HandoffBanner` or a new
`RoleArrivalToast.tsx`, `StrataEstimatorShell.tsx`.

---

### Gap H — Stale CTA text check (verification only)

**Current:** Refinement Phase 3 (`08e5da9`) renamed the waterfall CTA
from "Select Dealer" to "Send for Review". The user's complaint
references the old text.

**Action:** Visual QA pass after Phase 7 lands to confirm every CTA
matches the current copy in a live demo run.

---

## 4 · Proposed execution plan (Phase 7 — Process Fidelity Pass)

Ordered by delivered narrative value. Every item is scoped so it can
land as its own commit.

### 🥇 7.1 — Agent Step 3 beat (category mapping reveal)

> Biggest missing piece from the docs: the Map-to-Categories step is
> the core technical value of the solution and is currently invisible.

- Add a `mappingRowIds` state to the Shell
- Between the stagger beat (t=3600) and scope breach (t=3900), insert
  a 1.5 s mapping beat where every row's category is `—` then fills
  in sequentially
- New log entry: `Mapped 24 items · 21 template, 3 fallback`
- **Effort:** ~1 h · **Impact:** Very high

### 🥈 7.2 — Agent Step 4 beat (dual-engine calculation)

> Hero should _run_ once, not just show a final number.

- `FinancialSummaryHero.tsx` accepts `isCalculating` + animates the
  value with CountUp (simple `requestAnimationFrame` loop)
- Shell drives a 1.8 s calculation beat right after mapping
- The scope breach alert fires at ~60 % of the count-up so it visibly
  interrupts the engine
- **Effort:** ~1.5 h · **Impact:** High

### 🥉 7.3 — Role handoff transition (w2.1 → w2.2)

> The single biggest narrative disconnect today.

- New `RoleHandoffTransition.tsx` component: full-screen overlay that
  plays a 3-beat sequence (loading → notification toast → overlay
  slide-in) between `nextStep()` calls
- Escalate handler becomes async: fires the transition first, then
  calls `nextStep()` after ~2 s
- Same component can be reused for w2.2→w2.3 and w2.3→w2.4 role swaps
- **Effort:** ~2 h · **Impact:** Very high

### 7.4 — Designer overlay provenance

- `DesignerVerificationOverlay` header gets the "From David Park"
  section with avatar + timestamp + reason + "See row in BoM" link
- Shell passes `escalationContext={{ fromUser, timestamp, reason }}`
- **Effort:** ~30 min · **Impact:** Medium

### 7.5 — Expert confirmation beat (w2.3 preamble)

- New `VerificationLogCard.tsx` — 3-row checklist that appears above
  the hero when w2.3 enters
- Waterfall auto-open delay bumped from 1200 ms to 2500 ms
- **Effort:** ~1 h · **Impact:** Medium

### 7.6 — Dealer arrival toast (w2.4 preamble)

- Small centered toast `"Review the full proposal below and release
  when ready."` auto-dismiss 1.5 s after w2.4 enters
- Action bar appears after the toast clears
- **Effort:** ~30 min · **Impact:** Medium

### 7.7 — Agent Step 1 pre-beat (optional)

- Tiny "Agent picked up JPS" toast during the splash fade-out
- Connects the splash continuity line to the Shell opening
- **Effort:** ~30 min · **Impact:** Low-medium

### 7.8 — Visual QA (CTA copy pass)

- Run the full demo end-to-end in dev and verify every CTA label
  matches the current implementation
- **Effort:** ~15 min · **Impact:** Confidence check

**Total estimated effort:** ~7 h of focused work, landed across
~7 commits.

---

## 5 · What's **not** in scope here

Items that came up while reading the docs but that we consciously
defer to a later phase or leave as P2 polish:

- **Agent Step 1 full visualization** (monitoring CORE, identifying
  estimator by location) — too abstract for a 60-second demo, and
  would require a separate "behind the scenes" panel.
- **18-stage process stages 1-9** (client email, Smartsheet, scope
  development) — these belong to the AS-IS comparison and are covered
  by the w0.1 splash. Showing them individually would turn the demo
  into a tour.
- **Stages 15-18** (sales review, SAC assembly, PM execution) — these
  are downstream of the estimator and belong to Phase 2 of the WRG
  engagement per `WRG_CONSOLIDATED_REFERENCE.md` §8. Not a demo
  deliverable today.
- **Real delivery pricer minute-by-minute calculation** — keeping the
  mock `DELIVERY_HOURS_RATIO` split for now; the real engine would
  need the full Section A-G lookup and isn't demo-critical.

---

## 6 · Decision log (so the plan is concrete before implementation)

Before starting 7.x, confirm:

1. **Handoff transition scope** — should it be reusable for all 3
   role transitions (w2.1→w2.2→w2.3→w2.4) or just w2.1→w2.2 for now?
2. **Calculation beat timing** — 1.8 s total feels right, but should
   the scope breach interrupt at 60 % or 100 % (after the count-up
   completes)?
3. **Mapping beat visual** — categories fade in from `—` to the
   label, OR a more explicit "template" / "fallback" chip that
   resolves into the final category name?
4. **Audit log integration** — every new beat adds one entry. Is that
   desired or should we group them (e.g., a single "AI draft produced"
   instead of one per agent step)?

---

## 7 · Quick sanity-check table of current vs target

| Step | Current entry | Proposed entry | Current closure | Proposed closure |
| --- | --- | --- | --- | --- |
| w0.1 | splash plays | _(unchanged)_ | continuity line → Shell fade in | _(unchanged)_ |
| w2.1 | dossier fills | + agent pickup pre-beat | escalate click | + 2 s routing transition |
| w2.2 | overlay slides in | + provenance header | send back click | + slide-out delay _(already in Phase 4)_ |
| w2.3 | handoff banner → waterfall auto-opens | + verification log card → waterfall | send for review | _(unchanged)_ |
| w2.4 | handoff banner → action bar | + arrival toast → action bar | approve & release | _(unchanged)_ |

If every 7.x item lands, the demo goes from 5 fixed-beat steps to a
continuous choreographed narrative where every transition has
beginning / middle / end micro-interactions.
