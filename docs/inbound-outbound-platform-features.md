# Inbound | Outbound · Platform Features Spec

> Senator Group manufacturer demo · target Sunday 2026-06-07 · Wendy Marchuck/Liliana team review Friday EOD.
>
> **NO guided tour · NO step-by-step**. This is a free-navigation platform standalone demo.
> Matt presents by navigating Dashboard → Transactions → QuoteDetail → OrderDetail → AckDetail surfacing the features below.

---

## Status · Phase 1 + 2 + Wendy alignment shipped

### Components (19 total in manufacturer/)

| Component | File | Wired in | Wendy item |
|---|---|---|---|
| KPIDashboardGrid (4 clusters) | `KPIDashboardGrid.tsx` | Dashboard Follow Up tab | **11** (Sales/Ops/CX/Financial) |
| OCRPipeline (RFQ default view) | `OCRPipeline.tsx` | Transactions RFQ tab | — |
| SalesRepChip | `SalesRepChip.tsx` | Quote + Order + Ack headers | **2a** |
| CustomizedItemBadge | `CustomizedItemBadge.tsx` | QuoteDetail line item | — |
| SpecsExpandRow | `SpecsExpandRow.tsx` | QuoteDetail line item | **2b** Size |
| ProformaInvoiceModal | `ProformaInvoiceModal.tsx` | QuoteDetail header (manufacturer view only) | **8** |
| TrackingModal | `TrackingModal.tsx` | Transactions + Shipping page row 📍 | **6** |
| ARDepositsPanel | `ARDepositsPanel.tsx` | OrderDetail (manufacturer view only) | **7** deposits + history + credit |
| OrderActionsBar | `OrderActionsBar.tsx` | OrderDetail (manufacturer view only) | **6** notifications |
| OrderStagePipeline (10 stages) | `OrderStagePipeline.tsx` | OrderDetail | **5** exact stage names |
| AckHeroMatchPanel | `AckHeroMatchPanel.tsx` | AckDetail body top | — |
| SampleRequestStub → Workflow | `SampleRequestStub.tsx` | QuoteDetail line item | **9** full 4-step |
| TextileGradedInBadge + Excel + upcharge | `TextileGradedInBadge.tsx` | QuoteDetail fabric line items | **10** validate + upcharge |
| **QuoteComparisonModal** | `QuoteComparisonModal.tsx` | QuoteDetail header button | **3** compare |
| **QuoteRevisionsHistory** | `QuoteRevisionsHistory.tsx` | QuoteDetail Revisions tab | **3** revisions |
| **FreightCalculator** | `FreightCalculator.tsx` | QuoteDetail · Quote Items tab | **4** auto + recalc |
| **viewAsSignal** | `viewAsSignal.ts` | sessionStorage signal | dealer mirror |
| **ViewAsToggle** | `ViewAsToggle.tsx` | Floating top-right | dealer mirror |
| **DealerViewBanner** | `DealerViewBanner.tsx` | Floating top | dealer mirror |

### Pages

| Page | File | Nav item | Wendy item |
|---|---|---|---|
| Dashboard | `Dashboard.tsx` (enhanced) | Dashboard | 11 KPIs |
| Transactions | `Transactions.tsx` (enhanced) | Transactions | 2, 5 sources |
| **Shipping** (NEW) | `Shipping.tsx` | Shipping | **6** dedicated page |
| QuoteDetail | (enhanced) | (drilldown) | 2, 3, 8 |
| OrderDetail | (enhanced) | (drilldown) | 5, 6, 7 |
| AckDetail | (enhanced) | (drilldown) | — |

### Wendy 11-point feedback · alignment status

| # | Wendy item | Status |
|---|---|---|
| 2a | Sales Representative | ✅ chip en Quote + Order + Ack |
| 2b | Product Size | ✅ SpecsExpandRow |
| 2c | Textile/Fabric Grade | ✅ TextileGradedInBadge + upcharge |
| 2d | Revision Number | ✅ chip en QuoteDetail header |
| 2e | Discount ownership/approval | ✅ chip per line item |
| 3 | Quote Revision + history + comparison | ✅ Revisions tab + Compare modal |
| 4 | Automatic freight + recalc | ✅ FreightCalculator |
| 5 | 10-stage lifecycle (exact names) | ✅ OrderStagePipeline · 10 stages match feedback |
| 6 | Shipping & Logistics | ✅ Shipping page + TrackingModal + Send Notification |
| 7 | Payments (deposits + history + credit) | ✅ ARDepositsPanel · 3 sections |
| 8 | Proforma invoice | ⚠️ Modal from QuoteDetail (user-decided · "new space" deferred) |
| 9 | Sample Request Workflow | ✅ 4-step workflow + link to quote |
| 10 | Textile validation + upcharge + Excel | ✅ TextileGradedInBadge expanded |
| 11 | KPI Dashboard (4 categories) | ✅ Sales/Operations/Customer Experience/Financial |
| W1 W2 W3 W4 | Dealer mirror MVP | ✅ ViewAs toggle + 3 read-only views |

**Token-clean · TypeScript clean · 0 raw-color violations in active code.**

### Deferred to Phase C (post-Sunday)

DS Phase A swap-ins (13 badges + 7 buttons + 1 table → Strata DS primitives) intentionally deferred to preserve visual look-and-feel that Wendy validated. Chips already use semantic tokens · no LAW violations. Refactor postponed for clean DS migration sprint.

### Cómo probar las features nuevas (post-Wendy alignment)

1. **Switch Demo → Inbound | Outbound** → notice navbar tiene 3 tabs ahora (Dashboard + Transactions + **Shipping**)
2. **Top-right toggle** "Manufacturer / Dealer" · click Dealer:
   - Aparece banner azul "Dealer View · Read-only"
   - QuoteDetail: Generate Proforma button hidden
   - OrderDetail: OrderActionsBar + ARDepositsPanel hidden
   - Shipping page: bulk actions (Resend / Escalate) hidden, Export sigue visible
   - Click Manufacturer para revertir
3. **Dashboard** → 4 KPI clusters (Sales · Operations · Customer Experience · Financial) en 2x2 grid
4. **Transactions → Purchase Orders → click cualquier order**:
   - OrderStagePipeline tiene **10 stages exactos** de Wendy (PO received · PO Reviewed · Order Entered · Order Approved · Scheduled for production · In production · Quality control · Ready to ship · Shipped · Delivered)
5. **Transactions → Quotes → open quote**:
   - Header tiene chip "**Rev #3**" (W3)
   - Buttons "Generate Proforma" + **"Compare Quotes"** (W9) en header
   - Cada línea muestra discount + chip verde "**✓ Approved**" con hover (W4 ownership)
   - Tab "**Revisions**" entre Quote Items y Activity Stream → version history con diff (W8)
   - Quote Items tab tiene **FreightCalculator** debajo de la tabla (W10)
   - Click chip textil → popover muestra **Excel approved** + **Upcharge calc** (W7)
   - Click "Request Sample" en line item → modal funcional con **4-step state machine** + Reset/Advance (W6)
6. **OrderDetail Line Items tab → scroll abajo**:
   - **ARDepositsPanel**: aging table + nueva sección **Credit status by dealer** (4 dealers con progress bar) + nueva sección **Payment history** (5 last payments)
7. **Shipping page**:
   - Header con 5 summary metrics
   - Toolbar: search + status filter pills + bulk actions (Resend Notifications · Escalate Delays · Export)
   - Active shipments table con checkbox · ETA · carrier · tracking # · status · source · 📍 → TrackingModal
8. **AckDetail** → header tiene **Sales Rep chip** (David Park) además del Linked Order

---

## Final smoke checklist (Fri PM)

1. ✅ Profile switcher shows "Inbound | Outbound 📦" · select it
2. ✅ Navbar reduced to **Dashboard + Transactions** (no CRM/Inventory/MAC/Pricing/Workspace/Catalogs)
3. ✅ Dashboard Follow Up tab → 6 KPIs in 3 clusters (Revenue / Throughput / Quality with sparkline)
4. ✅ Transactions → RFQ tab → **OCR Kanban as default** with 5 columns (Ingesting · Needs Attention · Awaiting Expert · In-progress · Reconciled)
5. ✅ Click any RFQ card → opens RFQ detail
6. ✅ Transactions → Quotes → open Approved quote → header has **Sales Rep chip** + **Generate Proforma** button
7. ✅ QuoteDetail line items table has **Part # · Model** cols, **filter dropdown**, **pagination**, **specs expand**, **Customized chip** with popover, **Textile badge** (CF Stinson verified · Maharam call vendor · Knoll tier unknown), **Request Sample** button
8. ✅ Generate Proforma → modal with PROFORMA badge + 30% deposit alert + AI email draft
9. ✅ Transactions → Purchase Orders → click 📍 in actions → **TrackingModal** with timeline + AI Forecast + Contact Team
10. ✅ Open Purchase Order detail → **OrderStagePipeline** (10 stages grouped 3 phases + deposit gate)
11. ✅ Below pipeline → **OrderActionsBar** (Send Ack + Send Shipping Notification buttons)
12. ✅ Scroll OrderDetail Line Items tab → **ARDepositsPanel** with aging table + AI drafts
13. ✅ Transactions → Acknowledgements → open ack → **3-Way Match Hero** card · click **Resolve 2 exceptions** → DiscrepancyResolver modal (substitution + qty shortfall)
14. ✅ TypeScript `npx tsc --noEmit` returns zero errors
15. ✅ Browser HMR clean

---

---

## Source narratives covered

From 2 stakeholder meetings (Wendy/Matt kickoff AM + Asly/Kenya demo review PM):

- **N1 Shipping workflow** (Asly): receive PO → enter info → send acknowledgement → schedule production → ship with `{ETA + carrier + tracking #}` email
- **N2 Deposit-before-production gating** (Asly): some clients require deposit before production starts
- **N3 Proforma timing** (Asly): proforma created BEFORE client pays deposit (between quote approval and Ack)
- **N4 Sample requests** (Asly): dealer requests fabric/finish sample → manufacturer → production → ship → tracking
- **N5 Textile graded-in** (Asly + K1 Kenya): Excel approved + vendor website price/grade · sometimes call vendor when website lacks price
- **N6 Quote revisions** (Asly): client requests change → quote v2 → keep history
- **N7 Quote comparison** (Asly): compare 2 quotes for best price/specs
- **N8 10-stage order pipeline** (Asly): PO revised → preview → peer review → order entered → order approved → schedule production → in production → QC → ready to ship → shipped → delivered
- **N9 Customized item flag** (Asly + K3 Kenya): items not in standard catalog need manual price · "call Leland" alert
- **N10 KPIs** (Asly): dollars sold · backlog dollars · dollars shipped/day · quote count · order count · accuracy
- **N11 Edit PO** (Asly): edit button on PO modal (not just review)
- **N12 Product specs** (Asly): size + finish + edge + lock + fabric · not just materials
- **N13 Sales rep on quote** (Asly): commission owner visible
- **N14 Model/part number visible** (Asly)
- **K2 Delivery delay notifications** (Kenya): proactive alerts to client when shipment delayed
- **W1 One demo manufacturer + dealer flows** (Wendy/Matt): unified experience

---

## Modal normalization spec (Phase 0.5)

All modals + drawers in the manufacturer experience MUST follow this shape so they feel like one DS family, not 5 different apps.

### Modal primitive

Use **Headless UI `Dialog`** with token classNames inline. The local DS package does not export `dialog.tsx` yet (added to Phase 3 backlog as F10).

```tsx
import { Dialog, Transition } from '@headlessui/react'

<Dialog className="relative z-50" onClose={onClose}>
  <Dialog.Backdrop className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" />
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <Dialog.Panel className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-lg overflow-hidden flex flex-col max-h-[85vh]">
      {/* Header / Body / Footer per spec below */}
    </Dialog.Panel>
  </div>
</Dialog>
```

### Header

- Container: `px-5 py-4 border-b border-border bg-card flex items-start gap-3 shrink-0`
- Icon avatar (optional): `h-9 w-9 rounded-lg bg-ai/10 flex items-center justify-center shrink-0`
- Title: `text-sm font-bold text-foreground`
- Subtitle: `text-[11px] text-muted-foreground mt-0.5`
- Optional right-side confidence badge: `Badge variant="soft"` with semantic color (success/warning/destructive)
- Close X: icon-only Button ghost variant with `aria-label`

### Body

- Container: `flex-1 overflow-y-auto p-5 space-y-4`
- Sections: `rounded-xl border border-border bg-card overflow-hidden`
- Section header: `px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2`
- Section title: `text-[11px] font-bold uppercase tracking-wider text-foreground`

### Footer

- Container: `px-5 py-3 border-t border-border bg-card flex items-center justify-end gap-2 shrink-0`
- Left = secondary/cancel button (ghost or outline)
- Right = primary action button (`bg-primary text-primary-foreground hover:bg-primary/90`)

### Max widths

- Default modal: `max-w-2xl` (640px)
- Compare / 3-way / wide tables: `max-w-4xl` (960px)
- Right drawer (EmailComposer): `w-[440px]`

### Tokens reference

Per Strata DS LAWS:
- LAW 1: NEVER raw hex or Tailwind colors (`bg-green-500`, `text-zinc-900`, `bg-[#E6F993]`)
- LAW 2: `brand-300`/`brand-400` NEVER as body text on light backgrounds
- LAW 3: `bg-primary` ALWAYS pairs with `text-primary-foreground`
- LAW 5: Dark mode via tokens, not `dark:` classes
- LAW 7: Every interactive element needs `hover:` + `transition-colors`

---

## Page enrichment plan

### Dashboard
- **6 Asly KPIs** in 3×2 grid: Revenue (sold + backlog) · Throughput (shipped/day + quote count + order count) · Quality (accuracy with sparkline)
- Build with `Card` + `Badge` primitives (NOT lift PerformanceMetrics which has wrong-brand `bg-lime-400`)
- Hide widgets: ProjectTracker · InstallationScheduler · WarrantyClaims (dealer-flavored)

### Transactions (5 tabs)
- RFQ (IN) · default view = **OCR 5-column Kanban** (rebuild from smart-comparator pattern)
- Quotes (OUT)
- Purchase Orders (IN)
- Acknowledgements (OUT) — surface `ThreeWayMatchView` + `DiscrepancyResolverArtifact`
- Projects subtab — HIDDEN (dealer construct, not in Asly's pipeline)
- Source badges visible: EMAIL · DEALER PORTAL · OCR · (hide RPA + API)
- Row action 📍 → `TrackingModal`

### QuoteDetail (4 zones)
- **Z1 Header**: Sales rep chip + customer + quote # + status (Badge primitives, no floating)
- **Z2 Toolbar**: search + filter dropdown (Customized/Standard) + pagination · right-aligned above table
- **Z3 Table**: Part # + Model fixed-width cols (96px) before Description · Customized chip inline as Badge warning + AlertTriangle in Description cell (NOT separate column)
- **Z4 Row expansion**: Specs (size · finish · edge · lock · fabric · frame · shelf) collapse into expandable row, default closed, chevron leftmost
- **Action**: "Generate Proforma" button when status = Approved

### OrderDetail
- **10-stage pipeline** grouped in 3 collapsible phases (Pre-Production · Production · Post-Production) with deposit-received gate between order approved and schedule production
- **AR section** wiring existing `mbi/AIEmailDraftsPanel` + `ARStatusBoard` (parameterize MBI data)
- **"Send Acknowledgement" button** after PO entered → EmailComposer drawer
- **"Send Shipping Notification" button** when ready to ship → EmailComposer drawer with `{ETA + carrier + tracking #}`
- **EmailComposer drawer** right-side 440px (NOT modal · NOT global navbar)

### AckDetail
- Surface `ThreeWayMatchView` PO·ACK·Invoice prominently
- Wire existing `DiscrepancyResolverArtifact` (already in `src/components/gen-ui/artifacts/` at 303 LOC · indigo→info + amber→warning remap)

---

## Component sources (production-grade reuse map)

### Already wired internally (verify coverage, no lift needed)
- `widgets/ThreeWayMatchView.tsx` — PO·ACK·Invoice 3-way match
- `widgets/ConfidenceScoreBadge.tsx` — AI confidence per field/value
- `widgets/BackorderTraceCard.tsx` — backorder ETA detail
- `widgets/SmartQuoteHub.tsx` — Quote hub
- `widgets/AgentPipelineStrip.tsx` — AI agent progress strip
- `widgets/POVerificationWidget.tsx` — PO validation widget
- `components/bfi/SpecsDocViewer.tsx` — PDF specs + SIF.csv tabbed viewer
- `components/notifications/ActionCenter.tsx` — notification hub
- `components/gen-ui/artifacts/DiscrepancyResolverArtifact.tsx` — discrepancy resolver

### Wire-existing (already in project, parameterize + wire only)
- `components/mbi/AIEmailDraftsPanel.tsx` — email drafts with tone polish (parameterize: replace MBI_AR_RECORDS/Lindenwood/Keyla with manufacturer scenario)
- `components/mbi/ARStatusBoard.tsx` — AR aging board
- `components/mbi/InvoiceDetailPanel.tsx` — invoice preview (basis for proforma adapt)
- `components/mbi/FreightTariffPanel.tsx` — freight calc (Phase 3)
- `components/bfi/BFIDocumentReviewModal.tsx` — add prop `documentType: 'invoice'|'proforma'`

### Lift from sibling projects (token-remap required per LAWS)
- `UI-Manufacturer/src/components/TrackingModal.tsx` (11 violations: text-blue-500→info, text-green-500→success, text-amber-500→warning, bg-blue-600/text-white→primary/primary-foreground)

### Build new from scratch in `src/components/manufacturer/`
- `KPIDashboardGrid.tsx` — 3×2 grouped KPIs (Revenue/Throughput/Quality)
- `SalesRepChip.tsx` — Badge with avatar + commission owner
- `CustomizedItemBadge.tsx` — Badge warning + AlertTriangle + "call Leland" tooltip
- `SpecsExpandRow.tsx` — chevron + expandable specs (size/finish/edge/lock/fabric/frame/shelf)
- `OrderStagePipeline.tsx` — 3-phase grouped 10-stage with deposit gate
- `SampleRequestModal.tsx` (stub Phase 2 · full Phase 3)
- `TextileGradedInBadge.tsx` (stub Phase 2 · full Phase 3)

### Cut order if Friday slips
1. ✂️ #9 Quote revisions tab
2. ✂️ #10 Quote comparison side-by-side
3. ✂️ #26 OCR Kanban downgrade (fallback to status badges in table)

### NEVER cut (un-cuttable hero moments)
- #27 DiscrepancyResolver modal (THE magical AI moment)
- #14 KPIs (Asly's first check)
- #1 TrackingModal (Wendy's #1 priority)

---

## Sunday Senator demo storyline (12 beats · ~8 min)

Matt's free-navigation walkthrough:

1. **Open · Dashboard 3-beat KPI** (30s)
2. **Inbound funnel · OCR Kanban** (60s)
3. **Quote with AI assist** (60s) — sales rep chip, customized filter, specs expand, confidence badge
4. **Proforma → deposit gate** (45s) — generate proforma from QuoteDetail post-approval
5. **🎯 3-way match hero moment** (60s) — DiscrepancyResolver + ThreeWayMatchView · "the moment that pays the platform back"
6. **Production pipeline 10-stage** (45s) — 3 phases collapsible · deposit gate visible
7. **Outbound shipping with tracking** (45s) — Send Shipping Notification button + EmailComposer drawer + TrackingModal
8. **AI assist polish** (30s) — tone selector
9. **🎬 Teaser samples + textile** (20s) — preview stubs
10. **Dealer mirror** (30s · OPTIONAL on Matt confirm)
11. **Close · KPI loop** (20s)
12. **Q&A handoff** (30s)

Cut-line if <5min: drop 8, 9, 10 · core in 1-7+11.
