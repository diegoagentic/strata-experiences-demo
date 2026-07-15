# WRG Demo v7 — Flow Restructure Plan

**Date:** 2026-04-14
**Branch:** `demo`
**Status:** In progress · 2 of 9 implementation steps started (see §6)
**Source docs cross-checked:**
- [`wrg-read/WRG_CONSOLIDATED_REFERENCE.md`](../../wrg-read/WRG_CONSOLIDATED_REFERENCE.md) §2 (18-stage AS-IS) + §3 (7-step agent workflow)
- [`docs/wrg-demo/REFINEMENT_AUDIT_V2.md`](./REFINEMENT_AUDIT_V2.md)
- [`docs/wrg-demo/REFINEMENT_PHASE_7_REPORT.md`](./REFINEMENT_PHASE_7_REPORT.md)

---

## 1 · Why this restructure

### What the user reported

> _"El 1 no es útil ni da valor, dejemos como el número 1 lo que está en el
> flujo 2 y en el 2 hagamos un flujo basado en generar propuesta utilizando
> la documentación y los planes que hemos analizado."_
>
> _"Elimina el splash."_

### Current state problems

1. **Flow 1 (w0.1 origin splash)** — a 10 s animated explanation of "the
   old way" with 4 disconnected tools. It sets context but adds no
   interactive value to the demo, and the narrative bridge into Flow 2
   (Phase 7.7's `AgentRoutingToast`) already covers the same ground.
2. **Flow 2 (w2.1-w2.4)** — collapses labor estimation (w2.1-w2.2) and
   proposal generation (w2.3-w2.4) into a single flow. This hides the
   fact that WRG's real process has **two phases** per the doc:
   - **Phase 1**: AI labor estimation agent (stages 10-14) — internal
   - **Phase 2**: SAC quote assembly + client delivery (stages 15-17) —
     external / client-facing

### Target

Split the demo into two clearly-scoped flows and introduce the client
delivery workflow that's currently missing entirely.

---

## 2 · New structure

### Flow 1 — AI Labor Estimation (2 steps · internal)

**Roles:** Expert (David) + Designer (Alex)
**Boundary:** ends the moment Alex approves the escalated module

| ID | Title | Role | What happens |
| --- | --- | --- | --- |
| `w1.1` | Expert kickoff | David Park | Agent routing toast → dossier fill → BoM stagger → mapping chips → scope override → dual-engine calc → row 19 flagged → **Escalate to Designer** |
| `w1.2` | Designer verification | Alex Rivera | Overlay slides in with provenance ("From David Park · 5s ago") → 5 module checklist → **Send Back to Expert** |

**Same components as today** for w2.1-w2.2 of the old Flow 2. Only the
step IDs get renamed.

### Flow 2 — Proposal Generation (3 steps · internal → external)

**Roles:** Expert (David) + Dealer (Sara) + Sales Coordinator (Riley — new)
**Boundary:** starts right after Alex sends back the verified module,
ends when the proposal reaches the client

| ID | Title | Role | What happens |
| --- | --- | --- | --- |
| `w2.1` | Quote assembly | David Park | `VerificationLogCard` (Alex's 3 checks) → waterfall auto-opens with live numbers → dealer picker → **Send for Review** |
| `w2.2` | Dealer review & release | Sara Chen | Read-only Shell + `ProposalActionBar` → **Approve & Release** → `ApprovalChainModal` (4 signatures) → `ReleaseSuccessModal` |
| `w2.3` | **Client delivery** (NEW) | Riley Morgan | Email notification → client-facing PDF preview (JPS branded, no internal cost fields) → **Send to Client** → delivery tracking → "Delivered" success |

**Only w2.3 is new.** w2.1-w2.2 reuse all the components built in
refinement phases 1-7.

### What happens to `w0.1` (splash)

- Step removed from `WRG_DEMO_STEPS`
- `WrgOriginSplash.tsx` **deleted** from the repo (confirmed by user)
- `wrg-origin` removed from the `SimulationApp` union type
- `App.tsx` `case 'wrg-origin':` branch removed
- `isOriginSplashStep` helper removed from `stepStates.ts`

The AS-IS "4 disconnected tools" narrative is still covered by:
- `AgentRoutingToast` at w1.1 entry ("Routing JPS to David Park · Dallas")
- The BoM stagger import with "Importing 24 items from JPS_specs.pdf"
- The mapping chips showing 85/15 template/fallback ratio
- The audit trail panel documenting every AI action

---

## 3 · The new w2.3 — Client Delivery

This is the only genuinely new step. It surfaces WRG's **Phase 2 SAC
workflow** from `WRG_CONSOLIDATED_REFERENCE.md` §8 (stages 15-17 of the
18-stage process):

> _"CORE emails Sales. Quote reviewed and accepted. SAC combines labor
> + product quote, applies markup, sends to client."_

### New role · Riley Morgan

Added to `roles.ts` under key `'Sales Coordinator'` (which already exists
in the `DemoStep.role` union):

```ts
'Sales Coordinator': {
    name: 'Riley Morgan',
    role: 'Sales Account Coordinator',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face',
}
```

### New component · `ClientProposalDelivery.tsx`

Replaces the normal ESTIMATOR tab content (Dossier → Hero → BoM →
Constraints) while the demo is on w2.3. Everything else (navbar, audit
panel, role handoff transition, tabs) stays the same.

### Beat timeline

| Phase | Trigger | What's visible |
| --- | --- | --- |
| **email-received** | auto on step enter (500ms after handoff) | Email notification card at the top of the ESTIMATOR tab: `CORE · New approved proposal` / `JPS Health Network · $202,138` / "From David Park · just now" / "Open PDF" CTA |
| **reviewing-pdf** | auto, 1200ms after email appears | PDF preview panel reveals below the email. Three-up layout: cover letter preview on the left, line-item summary in the middle, delivery schedule on the right. Client-facing only — no internal cost breakdown. |
| **sending** | user click on `Send to Client` CTA | CTA becomes loading state. Envelope icon animates from the PDF panel toward an "Inbox" icon representing the JPS client. 1200ms spinner. |
| **delivered** | auto, at end of sending | Panel flips to a success state: green check, "Proposal delivered to JPS Health Network", delivery timestamp, tracking bar with 3 checkpoints (Sent → Received → Opened — only "Sent" is active), summary metrics card. |

### Visible surfaces

1. **Email card** — looks like the `HandoffBanner` pill but styled as an
   Outlook-style envelope notification
2. **Client PDF mock** — large card with:
   - Header strip: "JPS Health Network · Proposal" + JPS logo placeholder
   - Left column: "Cover letter" with 3-4 lorem-style paragraphs
   - Center: Line item summary with Product + Labor totals (no
     breakdown by category — client-facing view)
   - Right column: Delivery schedule with 3-week timeline
3. **Action bar** — floating at bottom, just like `ProposalActionBar`,
   but labeled for Sales: `Download PDF · Preview in browser · Send to Client`
4. **Delivered state** — replaces the PDF mock with a centered success
   card + tracking bar

### Audit trail entries (w2.3)

- `Approved proposal routed from CORE · notifying Riley Morgan` (ai)
- `Generated client-facing PDF · JPS branding applied` (ai)
- `Proposal sent to JPS Health Network · jps@...` (edit)
- `Delivery confirmed · tracking ID #...` (system)

### Audit panel should still show

`AuditTrailPanel` is unchanged — it already renders whatever is in
`auditLog`. The new events get appended automatically.

---

## 4 · What stays the same

- `RoleHandoffTransition` already reusable — used for all 4 role swaps
  (David → Alex, Alex → David, David → Sara, Sara → Riley)
- `AuditTrailPanel` unchanged
- `BillOfMaterialsTable` unchanged (but hidden during w2.3)
- `FinancialSummaryHero` unchanged (hidden during w2.3)
- `EstimatorDossierCard` unchanged (hidden during w2.3)
- `OperationalConstraintsPanel` unchanged (hidden during w2.3)
- `PricingWaterfall` unchanged — only the stepId that triggers it
  changes from `w2.3` to `w2.1`
- `DealerArrivalToast` unchanged — only the stepId that triggers it
  changes from `w2.4` to `w2.2`
- `ApprovalChainModal` + `ReleaseSuccessModal` unchanged — triggered
  from inside the new w2.2 instead of w2.4
- `DesignerVerificationOverlay` unchanged — only the stepState that
  opens it stays (`estimation-escalated`) but the step ID triggering it
  changes from `w2.2` to `w1.2`

---

## 5 · Changes by file

### Code

| File | Change | Scope |
| --- | --- | --- |
| `src/config/profiles/wrg-demo.ts` | Full rewrite — 5 steps · 2 flows · remove w0.1 | ✅ started |
| `src/features/strata-estimator/roles.ts` | Add `'Sales Coordinator'` key for Riley Morgan | ✅ done |
| `src/features/strata-estimator/stepStates.ts` | New `STEP_MAP` with renamed IDs · remove `'origin-splash'` state · add `'client-delivery'` state · remove `isOriginSplashStep` helper | pending |
| `src/features/strata-estimator/StrataEstimatorShell.tsx` | Replace every `stepId === 'w2.x'` with the renamed ID · add `stepId === 'w2.3'` branch to render `ClientProposalDelivery` instead of Dossier/Hero/BoM/Constraints · update `handleRestartDemo` to `goToStep(0)` now pointing to `w1.1` · add audit entries for the new step | pending |
| `src/features/strata-estimator/ClientProposalDelivery.tsx` | **NEW** — 4-phase component (email → PDF → sending → delivered) | pending |
| `src/features/strata-estimator/index.ts` | Export the new component · remove `WrgOriginSplash` | pending |
| `src/App.tsx` | Remove `case 'wrg-origin'` branch + `WrgOriginSplash` import | pending |
| `src/config/demoProfiles.ts` | Remove `'wrg-origin'` from `SimulationApp` union | pending |
| `src/features/strata-estimator/WrgOriginSplash.tsx` | **DELETE** (confirmed by user) | pending |

### Docs

| File | Change |
| --- | --- |
| `docs/wrg-demo/FLOW_RESTRUCTURE_PLAN.md` | **NEW · this file** |
| `docs/wrg-demo/FLOW_AND_STEPS.md` | Update to reference the new v7 structure after implementation lands |
| `docs/wrg-demo/REFINEMENT_PROGRESS.md` | Add a section referencing the v7 restructure after it ships |

---

## 6 · Execution order

Landing as **2 commits** to keep the diffs reviewable:

### Commit 1 · `refactor(wrg-demo): restructure into 2 flows + eliminate splash`

1. ✅ **roles.ts** — add `'Sales Coordinator'` profile (Riley Morgan)
2. ✅ **wrg-demo.ts** — full rewrite with 5 renamed steps
3. **stepStates.ts** — new `STEP_MAP` · new `client-delivery` state · remove `origin-splash` + helper
4. **StrataEstimatorShell.tsx** — rename every `stepId`/`stepState` reference · update `handleRestartDemo`
5. **App.tsx** — remove `case 'wrg-origin':` + `WrgOriginSplash` import
6. **demoProfiles.ts** — remove `'wrg-origin'` from `SimulationApp` union
7. **WrgOriginSplash.tsx** — delete
8. **index.ts** — remove `WrgOriginSplash` export

Build check. The demo should still work end-to-end but with the new IDs
and the splash gone. w2.3 will be a blank ESTIMATOR tab for 1-2 s during
testing because the new component isn't wired yet — that's expected
between commits 1 and 2.

### Commit 2 · `feat(estimator): add client delivery step (Flow 2 w2.3)`

1. **ClientProposalDelivery.tsx** — new component with the 4-phase beat
   timeline (email → PDF → sending → delivered)
2. **StrataEstimatorShell.tsx** — branch into the new component when
   `stepId === 'w2.3'` · add the beat timeline effect on step enter ·
   add the audit log entries for the new step
3. **index.ts** — export the new component
4. Build check. w2.3 should now play a full narrative and bring the
   demo to a clean finish.

Once both commits land, the demo arc is:

```
w1.1  (Flow 1 · David · 7s auto-play + interactive escalate)
  ↓ RoleHandoffTransition David → Alex
w1.2  (Flow 1 · Alex · interactive 5-module verification)
  ↓ RoleHandoffTransition Alex → David
w2.1  (Flow 2 · David · VerificationLogCard + waterfall auto-open)
  ↓ RoleHandoffTransition David → picked dealer
w2.2  (Flow 2 · Sara · DealerArrivalToast + ActionBar + ApprovalChain + ReleaseSuccess)
  ↓ RoleHandoffTransition Sara → Riley (new)
w2.3  (Flow 2 · Riley · email → PDF → Send to Client → delivered)
```

The restart button on `ReleaseSuccessModal` + on the `delivered` state
of w2.3 both call `goToStep(0)` which now points to `w1.1`.

---

## 7 · Risks & open items

1. **Double release animation** — after refactor, w2.2 triggers
   `ReleaseSuccessModal` ("Quote released") and then the demo moves to
   w2.3 for client delivery. Users could think the demo is over at w2.2.
   **Mitigation:** in commit 2, change the w2.2 ReleaseSuccessModal CTA
   from "Start new quote" to "Continue to client delivery →" when the
   user is not yet on the last step, and delay `nextStep()` until the
   user clicks it (instead of auto-triggering the handoff transition).

2. **Riley avatar** — using an Unsplash URL consistent with the rest of
   the demo. The specific photo ID (`1580489944761-15a19d654956`) needs
   a quick sanity check that it's a reasonable head-shot.

3. **Client PDF mock scope** — we can make the client-facing PDF preview
   as simple as 3 text blocks + a summary table, or as polished as a
   letter-format component with real typography. Default: **simple**.
   Polished can be a P1 follow-up.

4. **Restart from w2.3** — when Riley's "delivered" state completes,
   the user expects a way to restart. Currently that lives in
   `ReleaseSuccessModal` which is a w2.2 component. Options:
   - Add a `Start new quote` button to the "delivered" state of
     `ClientProposalDelivery` (duplicated copy but contextually right)
   - Pop `ReleaseSuccessModal` automatically after w2.3 `delivered`
     (reuse existing component, saves work)
   **Decision:** go with option A — a dedicated button inside
   `ClientProposalDelivery` that calls the same `handleRestartDemo`.
   The existing `ReleaseSuccessModal` triggered in w2.2 should NOT have
   "Start new quote" anymore (replaced by "Continue to client delivery").

5. **Documentation updates** — `FLOW_AND_STEPS.md` and
   `REFINEMENT_PROGRESS.md` reference the old step IDs everywhere.
   Both need a quick pass after commits 1 and 2 land.

---

## 8 · Out of scope (deferred)

Items consciously NOT part of this restructure:

- **Change order / counter-offer flow** — if the client comes back with
  changes, there's no branch for that. Single-shot delivery only.
- **Multi-version proposal tracking** — revisions / v1 / v2 / v3
- **Real PDF generation** — the preview is a styled DOM mock; no actual
  PDF is produced
- **Email service integration** — the "send to client" is a visual
  animation, not a real SMTP/SendGrid call
- **CORE write-back of the delivery event** — the audit log captures it
  locally but no integration hook fires
- **Translation of the client-facing PDF** — English only in v7

These can land as follow-up work once the v7 structure is stable.

---

## 9 · Current state snapshot (before resuming implementation)

Two files are already edited in the working tree but NOT committed:

- `roles.ts` — has the new `'Sales Coordinator'` entry added
- `wrg-demo.ts` — fully rewritten with the 5 new step IDs

Everything else is untouched. The demo is in an **intermediate state**
where the profile has step IDs the Shell doesn't recognise yet. The
build will still compile (TypeScript is lenient on stepId strings) but
the beat timelines won't fire because the `useEffect` checks short-
circuit on the new IDs. This is fine for a pause point.

**To resume:** pick up at §6 Commit 1 step 3 (update `stepStates.ts`).
