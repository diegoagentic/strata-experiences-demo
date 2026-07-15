# WRG Demo v6 — Phase 7 Execution Report (Process Fidelity Pass)

**Source plan:** [`REFINEMENT_AUDIT_V2.md`](./REFINEMENT_AUDIT_V2.md)
**Completed:** 2026-04-14
**Commit range:** `0e3c008` → `9f66dfa`

All 8 items from the audit landed. The demo now plays a continuous
choreographed narrative where every transition has an explicit entry,
middle and exit beat, and the 7-step AI agent workflow from
`wrg-read/WRG_CONSOLIDATED_REFERENCE.md` §3 is visually represented
end to end.

---

## Completed items

| # | Title | Commit | Files | Status |
| --- | --- | --- | --- | --- |
| 7.1 | Mapping beat with TEMPLATE/FALLBACK chips | `0e3c008` | BoM + Shell | ✅ |
| 7.2 | Dual-engine calculation count-up in hero | `42e16ce` | Hero + Shell | ✅ |
| 7.3 | Reusable RoleHandoffTransition | `d2a2685` | new · Shell | ✅ |
| 7.4 | Designer overlay provenance header | `4279ff8` | DVO + Shell | ✅ |
| 7.5 | Verification log card before waterfall | `92f7fed` | new · Shell | ✅ |
| 7.6 | Dealer arrival toast (w2.4 preamble) | `3b99fa5` | new · Shell | ✅ |
| 7.7 | Agent Step 1 routing toast (w2.1 preamble) | `9f66dfa` | new · Shell | ✅ |
| 7.8 | CTA copy QA pass | _this commit_ | 1-line comment fix | ✅ |

### New components (5)

- [`RoleHandoffTransition.tsx`](../../src/features/strata-estimator/RoleHandoffTransition.tsx) — reusable 1.8 s role-to-role overlay (Expert → Designer, Designer → Expert, Expert → Dealer)
- [`VerificationLogCard.tsx`](../../src/features/strata-estimator/VerificationLogCard.tsx) — w2.3 preamble checklist summarising what Alex validated
- [`DealerArrivalToast.tsx`](../../src/features/strata-estimator/DealerArrivalToast.tsx) — w2.4 "Your turn, Sara" pill
- [`AgentRoutingToast.tsx`](../../src/features/strata-estimator/AgentRoutingToast.tsx) — w2.1 opener surfacing Agent Step 1 (Trigger)
- _Reused and extended:_ [`BillOfMaterialsTable.tsx`](../../src/features/strata-estimator/BillOfMaterialsTable.tsx) gained `mappingResolvedCount` and a conditional TEMPLATE/FALLBACK chip cell

### Component prop additions

- **FinancialSummaryHero**: `calculationProgress` (0 → 1) for the dual-engine count-up
- **BillOfMaterialsTable**: `mappingResolvedCount` (index cutoff for chip state)
- **DesignerVerificationOverlay**: `escalationContext` (from/role/photo/reason/receivedAt/itemRef) + `onScrollToItem` callback

---

## Final w2.1 beat timeline (reference)

Every tick in milliseconds, measured from the moment the demo advances
to the `w2.1` step. The `t=0` reset + `setAgentRoutingOpen(true)` is
synchronous with the handoff transition dismissing the splash.

```
t=0        reset + agent routing toast opens
           audit: 'Agent Step 1 · Routed JPS to David Park (Dallas)'
t=800      dossier ZIP + address land
           audit: 'Loaded CORE export · ZIP 76104 / Fort Worth'
t=1100     BoM header importStatus = 'Importing 24 items from JPS_specs.pdf…'
t=1400     lineItems populated, 24-row stagger starts (80ms apart)
           audit: 'Imported 24 line items · 85% template, 15% fallback'
t=1600     agent routing toast auto-dismisses
t=3600     stagger done → mapping-bom phase starts
           importStatus = 'Mapping products to labor categories…'
           audit: 'Mapping products to labor categories'
t=3700     resolvedCount = 1 (first category chip resolves)
…          40 ms per row
t=4660     resolvedCount = 24 (all categories resolved)
t=4700     importStatus cleared
           audit: 'Mapped 24 items · 21 template, 3 fallback'
t=4900     scope breach alert fires
           audit: 'Scope override · 119 KD chairs > 50 (Delivery Pricer)'
t=5100     dual-engine calc beat starts (rAF 0 → 1, 1600ms)
           audit: 'Running dual-engine calculation · installation + delivery'
t=6700     calc complete, hero lands on final values
           audit: 'Draft produced · line items + margin + crew'
t=6900     flagged beat: row 19 amber ring + FlaggedItemBanner
           audit: 'Flagged OFS Serpentine 12-seat lounge for review'
 ^         user clicks Escalate to Designer
```

### Full narrative arc (end to end)

| Step | Role | Opening beat | Middle | Closure |
| --- | --- | --- | --- | --- |
| w0.1 | System | 11 s splash · "The Old Way" | 5-tool animation → pain → transform → continuity line "Loading JPS Health Network…" | auto-advance |
| w2.1 | David | `AgentRoutingToast` "JPS → David Park · Dallas" | dossier fill → stagger import → mapping chips → scope override → dual-engine count-up → row 19 flag | click **Escalate to Designer** |
| — | — | `RoleHandoffTransition` (David → Alex, 1.8 s) | — | `nextStep()` |
| w2.2 | Alex | Designer overlay slides in with **provenance header** (From David · 5s ago · reason) | 5-module checklist + scroll-to-row-19 link | click **Send Back to Expert** |
| — | — | `RoleHandoffTransition` (Alex → David) | — | `nextStep()` |
| w2.3 | David | `VerificationLogCard` (✓ Cost Summary · ✓ OFS Serpentine · ✓ Applied Rate) | waterfall auto-opens at 2600 ms with live numbers | pick dealer + click **Send for Review** |
| — | — | `RoleHandoffTransition` (David → picked dealer) | — | `nextStep()` |
| w2.4 | Sara | `DealerArrivalToast` "Your turn, Sara — review the $X proposal" | read-only Shell + `ProposalActionBar` | click **Approve & Release** → `ApprovalChainModal` → `ReleaseSuccessModal` → **Start new quote** |

Total duration (auto-play sections only): ~30 s + user pauses.

---

## Coverage of WRG pain points

| # | Pain | Where it's shown today |
| --- | --- | --- |
| 1 | Tribal Knowledge | AgentRoutingToast ("routed to David Park · Dallas") + mapping beat chips (template = codified knowledge) |
| 2 | Two Disconnected Tools | Hero dual-engine split + dual-engine calc beat count-up |
| 3 | Manual PDF Interpretation | w2.1 stagger import + mapping beat chips + audit trail entries |
| 4 | No Structured Data Layer | AuditTrailPanel (6d) + Recovery Active pill in navbar |
| 5 | Inconsistent Outputs | Release success modal showing full line-item breakdown + approval chain audit |
| 6 | Scope Limit Risk | ScopeBreachAlert (transient) + sticky `119 / 50` badge in BoM header |

## Coverage of the 7-step AI agent workflow

| # | Agent Step | Where it's shown |
| --- | --- | --- |
| 1 | Trigger | **AgentRoutingToast** (7.7) + first audit log entry |
| 2 | Ingest & Extract | w2.1 stagger import beat (6a, 7.1) |
| 3 | Map to Categories | **Mapping beat with TEMPLATE/FALLBACK chips** (7.1) |
| 4 | Dual-Engine Calculation | **Hero count-up with `isCalculating` label** (7.2) |
| 5 | Produce Draft | Beat ends with "Draft produced" audit entry + flagged banner |
| 6 | Human Review | w2.1-w2.3 interactive user flow |
| 7 | Write Back | w2.4 release success modal + audit trail footer line |

Every step from the doc has a visible beat or surface now.

---

## What still could improve (deferred, not blocking)

These were out of scope per §5 of `REFINEMENT_AUDIT_V2.md` but worth
capturing for a possible Phase 8:

- **Constraint change logging** — `handleVariablesChange` could log
  "Applied After Hours multiplier" etc. to the audit trail in real
  time. Today only the AI beats are logged.
- **Route to real Delivery Pricer math** — replace the
  `DELIVERY_HOURS_RATIO` presentation trick with the real Section
  A-G minute calculation so the dual-engine split is actually computed.
- **Multi-scenario support** — the demo is JPS-only. Loading a
  different preset from the Projects tab should replay the narrative
  with that dataset (currently it just swaps the state).
- **Keyboard accessibility pass** — several new overlays (handoff
  transition, approval chain, release modal) lack `role="dialog"`
  on the inner panels and focus trap handling.
- **Dark-mode QA on the new components** — spot-checked during
  dev but not formally audited against every token.

---

## Closing the loop

With Phase 7 complete, the original complaint from the user audit
_("se siente desconectado … hay que pensar en cada paso del flujo,
sub-pasos y micro-interacciones")_ should be resolved. The demo now
has beginning / middle / end beats at every step boundary, the AI
agent workflow from the source doc is represented, and the audit
trail proves the "Recovery Active" pill isn't decorative.

Next action for the maintainer: run through the full demo once in
a browser (dev or preview build) with the new narrative and verify
the timings feel right. If anything needs retiming, the only file
to touch is the w2.1 beat timeline `useEffect` in
[`StrataEstimatorShell.tsx`](../../src/features/strata-estimator/StrataEstimatorShell.tsx) and the
auto-open delays for w2.3 waterfall + dealer toast.
