# WRG Demo v6 — Implementation Plan (AI-Optimized)

**Branch:** `demo`
**Base:** `99a05a7` (latest demo-strata/main)
**Target:** New "Strata Estimator" app based on Project Aries structure, using Strata DS components.
**Flow strategy:** 1 splash + 4 collaborative steps in a single unified Shell (Opción F).
**Date:** 2026-04-10 (updated with Opción F + CORE constraint)

## Related documents
- `docs/wrg-demo/FLOW_AND_STEPS.md` — full step-by-step narrative with sub-steps
- `docs/wrg-demo/requirements/CORE_INTEGRATION_CONSTRAINT.md` — CORE is export-only (critical)
- `docs/wrg-demo/requirements/estimating app V1.txt` — Project Aries reference code

---

## AI Execution Strategy

This plan is designed to be executed **phase by phase** with Claude (or any LLM agent) to minimize hallucinations and context loss. Each phase is **self-contained** and produces a **verifiable artifact** (file + build passing). Never execute more than one phase per conversation turn without checkpoint validation.

### Anti-hallucination rules:
1. **Read before write** — every phase starts by reading existing files (specific paths given)
2. **One file per phase** when possible — keeps context tight
3. **Build check after every phase** — `npx vite build` must pass
4. **Explicit imports** — every phase declares which existing components to import (no inference)
5. **Mock data inline** — no external JSON, all data embedded in the component
6. **DS tokens listed verbatim** — no interpretation of "use brand colors", exact class names given
7. **Aries parity rule** — NEVER add elements, sections, or features that don't exist in the Aries reference (`docs/wrg-demo/requirements/estimating app V1.txt`). Each phase has a "Must NOT include" list.

---

## 🚨 ARIES PARITY RULE (CRITICAL)

**The WRG Demo v6 must match the Project Aries structure 1:1.** Any component, section, or feature that does NOT exist in the Aries reference code MUST NOT appear in our implementation.

### Global forbidden list (applies to all phases):

The Strata Estimator MUST NOT contain any of the following unless explicitly approved:

- ❌ Breadcrumbs
- ❌ Sidebar (secondary nav)
- ❌ Workflow / status steppers
- ❌ Timeline component
- ❌ Comments / notes panels
- ❌ Related documents section
- ❌ Activity log
- ❌ Notifications / Action Center
- ❌ User avatar / profile menu
- ❌ Tenant selector
- ❌ Theme toggle (in the estimator navbar)
- ❌ My Apps grid
- ❌ Help / support buttons
- ❌ Global search
- ❌ Sort options in Projects tab
- ❌ View toggle (grid/list)
- ❌ Pagination (Aries uses simple vertical list)
- ❌ Summary bar (Aries doesn't have one)
- ❌ Analytics charts
- ❌ Bulk actions
- ❌ Vendor filter
- ❌ Discrepancy status in the Estimator tab
- ❌ Quick actions secondary bar (only the Save in navbar)

### Aries allowed structure (1:1 reference):

**Navbar (exactly these elements):**
1. Brand icon pill + app name + sync status (only `synced` or `saving`)
2. 3 tabs pill (ESTIMATOR, PROJECTS, CONFIG)
3. Backup icon group (Download + UploadCloud)
4. Save Project CTA

**ESTIMATOR tab (exactly these 4 sections, in order):**
1. Project Dossier card (Client Name + Postal/Region + Site Location)
2. Financial Summary Hero (Final Quote Price + 4 stats + Generate Proposal CTA)
3. Bill of Materials table (with AI Import + AI Refine + Add Line buttons)
4. Operational Constraints (Planned Install Days + 4 checkboxes + Crew Capacity card)

**PROJECTS tab (exactly these elements):**
1. Header: "Project History" title + search input
2. Vertical list of project cards, each showing: Client + Status dropdown + ZIP + Date + Proposal Price + Load/Delete + Est./Actual/Variance row

**CONFIG tab (exactly these sections):**
1. Title: "Administrative Logic"
2. Top row: Default Margin slider + Base Labor Rates card
3. Category cards with subcategory rate configs

**Vision Engine Modal (exactly these states):**
1. Initial upload state
2. Refinement state (when file exists)
3. Analyzing state

### Validation checklist for every phase:

Before committing any phase:
- [ ] Does every element I added exist in the Aries reference?
- [ ] Did I add any element from the forbidden list?
- [ ] Is the order of sections identical to Aries?
- [ ] Is every state/variable justified by Aries code?

If any answer violates the rule → **remove the extra element before committing**.

---

## Pre-Phase: Context Loading (DO FIRST on each session)

Before starting ANY phase, the agent must:

1. Confirm branch:
   ```bash
   git branch --show-current  # must be "demo"
   ```
2. Read these 3 anchor files (they define DS conventions):
   - `packages/strata-ds/guidelines/BRAND_STYLING.md`
   - `src/components/widgets/WidgetCard.tsx` (card pattern)
   - `src/components/MetricCard.tsx` (metric pattern)
3. Verify build passes before touching code:
   ```bash
   npx vite build 2>&1 | tail -3
   ```
4. Load the current todo state from this plan (which phases are done).

---

## Implementation Phases

### Phase 0 — Scaffold (30 min)

**Goal:** Create the empty feature folder structure with stubs.

**Files to create:**
- `src/features/strata-estimator/index.ts` — barrel export
- `src/features/strata-estimator/types.ts` — TypeScript interfaces
- `src/features/strata-estimator/mockData.ts` — JPS line items + constants

**Context needed:**
- None (isolated scaffolding)

**Exit criteria:**
- Build passes
- 3 files created, empty exports
- Commit: `feat(estimator): scaffold strata-estimator feature folder`

**Verification:**
```bash
ls src/features/strata-estimator/
npx vite build 2>&1 | tail -3
```

---

### Phase 1 — Types + Mock Data (45 min)

**Goal:** Define all TypeScript types and JPS mock data inline, no UI.

**Files to modify:**
- `src/features/strata-estimator/types.ts`

**Types required (exact):**
```typescript
export type EstimatorTab = 'ESTIMATOR' | 'PROJECTS' | 'CONFIG'
export type EstimateStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'COMPLETED'
export type SyncStatus = 'idle' | 'saving' | 'synced' | 'error'

export interface Category {
    id: string
    label: string
    rate: number
    subcategories: Record<string, Subcategory>
}

export interface Subcategory {
    id: string
    label: string
    rate: number
}

export interface LineItem {
    id: string
    categoryId: string
    subCategoryId: string
    description: string
    quantity: number
}

export interface Customer {
    name: string
    address: string
    zipCode: string
}

export interface OperationalVariables {
    noElevator: boolean
    isUnion: boolean
    afterHours: boolean
    siteProtection: boolean
    duration: number
}

export interface EstimateResult {
    baseHours: string
    totalHours: string
    totalCost: string
    salesPrice: string
    grossMargin: string
    crewSize: number
    hourlyRate: number
}

export interface ConfigState {
    categories: Record<string, Category>
    rates: { NON_UNION: number; UNION: number }
    multipliers: { STAIR_CARRY: number; AFTER_HOURS: number; SITE_PROTECTION: number }
    defaultMargin: number
}

export interface SavedEstimate {
    id: string
    customer: Customer
    lineItems: LineItem[]
    variables: OperationalVariables
    config: ConfigState
    estimate: EstimateResult
    status: EstimateStatus
    actualCost: number
    timestamp: number
}
```

**Mock data (`mockData.ts`):**
- `INITIAL_CATEGORIES` — 5 categories (SYSTEMS, PRIVATE_OFFICE, TASK_SEATING, CONFERENCE, ANCILLARY) each with subcategories (copy rates from Project Aries code)
- `INITIAL_RATES` — `{ NON_UNION: 65, UNION: 95 }`
- `INITIAL_MULTIPLIERS` — `{ STAIR_CARRY: 1.30, AFTER_HOURS: 1.50, SITE_PROTECTION: 1.05 }`
- `INITIAL_MARGIN = 0.35`
- `JPS_LINE_ITEMS` — 24 pre-filled items (first pass: 3-5 items representative, rest in Phase 5)
- `MOCK_SAVED_ESTIMATES` — 4 sample projects (JPS, 3 others) with variance data

**Exit criteria:**
- Build passes
- All types exported from barrel
- Commit: `feat(estimator): add types and mock data`

---

### Phase 2 — Calculation Logic (30 min)

**Goal:** Pure function for cost calculation, no UI, unit-testable.

**File:** `src/features/strata-estimator/calculations.ts`

**Function signature:**
```typescript
export function calculateInstall(
    lineItems: LineItem[],
    variables: OperationalVariables,
    config: ConfigState
): EstimateResult
```

**Logic (exact, from Project Aries):**
1. Sum `baseHours` = Σ (rate × quantity) for each line item
2. Apply multipliers: STAIR_CARRY if `noElevator`, AFTER_HOURS if `afterHours`, SITE_PROTECTION if `siteProtection`
3. `cost = adjustedHours × (isUnion ? UNION_RATE : NON_UNION_RATE)`
4. `salesPrice = cost / (1 - defaultMargin)`
5. `crewSize = ceil(adjustedHours / (8 × duration))`
6. Return with `.toFixed(2)` formatting

**Exit criteria:**
- Build passes
- Export from barrel
- Commit: `feat(estimator): add calculation logic`

---

### Phase 3 — Shell + Navbar (1 hour)

**Goal:** Top-level container with 3-tab navigation, no tab content yet.

**Files to create:**
- `src/features/strata-estimator/StrataEstimatorShell.tsx`
- `src/features/strata-estimator/StrataEstimatorNavbar.tsx`

**Context needed (read before coding):**
- `src/components/Navbar.tsx` (for brand area pattern)
- `src/Transactions.tsx` lines 400-460 (tab switcher pattern with `TabGroup` headless UI)

**Navbar requirements (Aries parity):**
- Brand icon pill (Calculator) + "Strata Estimator" + sync status
- Sync badge: ONLY `synced` (Recovery Active) or `saving` (Auto-saving) — NO idle/error states
- Tabs pill: ESTIMATOR | PROJECTS | CONFIG with icons (`LayoutDashboard`, `Archive`, `Settings` from lucide-react)
- Icon buttons: Download / Upload (use `Download` / `UploadCloud` from lucide-react)
- CTA: "Save Project" with `Save` icon, `bg-brand-300 dark:bg-brand-500 text-zinc-900 hover:bg-brand-400 rounded-lg`

**Must NOT include (Aries parity):**
- ❌ Theme toggle
- ❌ User avatar / profile
- ❌ Notifications / Action Center
- ❌ Tenant selector
- ❌ Search
- ❌ Help button
- ❌ Breadcrumbs below navbar
- ❌ Sync states beyond `synced` and `saving`

**Shell requirements:**
- Full-page container: `flex flex-col min-h-screen bg-background text-foreground`
- Navbar at top
- TabPanels area with placeholder: `<div className="p-6">Tab content placeholder</div>`
- State: `activeTab`, `syncStatus`, `customer`, `lineItems`, `variables`, `config` (initialized from `INITIAL_*`)

**Exit criteria:**
- Build passes
- Shell renders with empty tabs
- Commit: `feat(estimator): add shell and navbar with 3 tabs`

---

### Phase 4 — Project Dossier Card (45 min)

**Goal:** Header card for client info with ZIP rate lookup.

**File:** `src/features/strata-estimator/EstimatorDossierCard.tsx`

**Context needed:**
- `src/components/widgets/WidgetCard.tsx` (base card structure)

**Props:**
```typescript
{
    customer: Customer
    onCustomerChange: (customer: Customer) => void
    onRateLookup: () => void
    isSearchingRates: boolean
}
```

**Structure (Aries parity):**
- Card: `bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm relative overflow-hidden`
- Accent left bar: `<div className="absolute top-0 left-0 w-1 h-full bg-primary" />`
- Padding: `p-6`
- Title row: `User` icon + "Project Dossier" (`text-sm font-semibold uppercase tracking-wider text-muted-foreground`)
- 3-column grid (`grid-cols-1 md:grid-cols-3 gap-6`):
  1. Client Name input
  2. Postal/Region input + Search icon button
  3. Site Location input
- Input style: `w-full px-3 py-2 text-sm bg-background border-b border-border focus:border-primary outline-none transition-colors`
- Search button: `p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors`

**Must NOT include (Aries parity):**
- ❌ Save draft button inside the card
- ❌ Project number / ID display
- ❌ Client logo / avatar
- ❌ Status badge
- ❌ Tabs inside this card
- ❌ Contact info fields (phone, email)
- ❌ Project description textarea
- ❌ Due date / deadline

**Wire up in Shell:** Render in ESTIMATOR tab.

**Exit criteria:**
- Build passes
- Card renders with 3 functional inputs
- Commit: `feat(estimator): add project dossier card`

---

### Phase 4.5 — Role Profiles + Step State Mapping (45 min) 🆕

**Goal:** Infrastructure for role-aware demo — who is connected + what the Estimator shows per step.

**Files to create:**
- `src/features/strata-estimator/roles.ts` — 3 ConnectedUser profiles
- `src/features/strata-estimator/stepStates.ts` — step → estimator state mapping

**Roles (exact):**
```typescript
export const ROLE_PROFILES: Record<string, ConnectedUser> = {
    Expert: {
        name: 'David Park',
        role: 'Regional Sales Manager',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    },
    Designer: {
        name: 'Alex Rivera',
        role: 'Designer',
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face',
    },
    Dealer: {
        name: 'Sara Chen',
        role: 'Account Manager',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    },
}
```

**Step states:**
```typescript
export type EstimatorStepState =
    | 'idle'                // default — JPS pre-loaded
    | 'estimation-active'   // w2.1 — Hero live, checkboxes enabled
    | 'estimation-escalated'// w2.2 — focus item 19, others opacity-40
    | 'estimation-assembly' // w2.3 — Generate Proposal pulsing
    | 'proposal-review'     // w2.4 — read-only + approval chain

export function getStepState(stepId: string): EstimatorStepState
export function getStepRole(stepId: string): ConnectedUser | null
```

**Mapping:**
- w2.1 → `estimation-active`, Expert
- w2.2 → `estimation-escalated`, Designer
- w2.3 → `estimation-assembly`, Expert
- w2.4 → `proposal-review`, Dealer

**Must NOT include (Aries parity):**
- ❌ Intake states (w1.x flows removed per Opción F)
- ❌ Roles beyond Expert/Designer/Dealer

**Exit criteria:**
- Build passes
- Functions exported from barrel
- Commit: `feat(estimator): add role profiles and step state mapping`

---

### Phase 4.6 — WrgOriginSplash Component (1 hour) 🆕

**Goal:** Fullscreen splash animation explaining "the old way" before the Estimator appears.

**File:** `src/features/strata-estimator/WrgOriginSplash.tsx`

**Props:**
```typescript
{
    onComplete: () => void
}
```

**Narrative (CORE export-only compliant):**
Refer to `docs/wrg-demo/FLOW_AND_STEPS.md` section w0.1 for the full sub-step sequence.

**Key rule:** CORE is shown as a **file source** that users manually export FROM, not as an integration. The splash says:
- "Estimator opens CORE manually → downloads scope files (PDF + CSV)"
- NOT: "CORE syncs with Strata"

**Structure:**
- Fullscreen container: `fixed inset-0 z-50 bg-zinc-950 text-white`
- Title fade-in (1s)
- 5 tool icons appear sequentially (5s): Outlook, CORE, PDF, Excel (Selection), Excel (Pricer)
- Pain statement (1.5s): "4 disconnected tools. 8 hours of manual work."
- Transformation (2s): icons collapse into Strata logo
- Final text: "Strata Estimator replaces the tools in the middle. CORE still receives the final file."
- Fade out (0.5s) + `onComplete()` callback

**Icons:** Use `Mail`, `Database`, `FileText`, `FileSpreadsheet`, `FileSpreadsheet` from lucide-react.

**DS tokens:**
- Background: `bg-zinc-950`
- Text: `text-white`
- Accent brand: `text-brand-400`
- Pain red: `text-red-400`
- Icons: `w-16 h-16`

**Must NOT include:**
- ❌ Claims of CORE integration / sync / API
- ❌ Icons or references to tools that aren't in the WRG BPMN
- ❌ Skip button during auto-advance (it's only 8-10s)
- ❌ User interaction beyond waiting

**Exit criteria:**
- Build passes
- Splash renders for 8-10 seconds and calls `onComplete`
- Commit: `feat(estimator): add WrgOriginSplash fullscreen component`

---

### Phase 4.7 — HandoffBanner Component (30 min) 🆕

**Goal:** Temporary banner that shows when a role hands off work to another role.

**File:** `src/features/strata-estimator/HandoffBanner.tsx`

**Props:**
```typescript
{
    fromUser: ConnectedUser
    message: string  // e.g. "sent you 1 item to verify"
    duration?: number  // default 3000ms
    onDismiss?: () => void
}
```

**Structure:**
- Sticky top banner below the Estimator navbar
- Slide-in from top on mount
- Fade out after `duration` ms
- Content: avatar + name + message
- Brand accent border-b
- Class: `bg-brand-300/10 dark:bg-brand-500/5 border-b border-brand-400`

**Must NOT include:**
- ❌ Persistent notification (auto-dismiss only)
- ❌ Multiple handoff banners stacked
- ❌ Close button (auto-dismiss handles it)

**Exit criteria:**
- Build passes
- Banner shows and auto-dismisses
- Commit: `feat(estimator): add handoff banner component`

---

### Phase 4.8 — Rewire App.tsx + wrg-demo.ts (1.5 hours) 🆕

**Goal:** Collapse the WRG demo routes into a single Shell. Reduce profile from 9 steps to 5.

**Files to modify:**
- `src/App.tsx` — all `wrg-*` routes render `<StrataEstimatorShell />` or `<WrgOriginSplash />`
- `src/config/profiles/wrg-demo.ts` — reduce to 5 steps

**App.tsx routing changes:**
Replace all of these old cases:
```tsx
case 'wrg-labor': <><WrgLaborEstimation /><Transactions /></>
case 'wrg-handoff': <><WrgHandoff /><Transactions /></>
case 'wrg-designer': <><WrgDesigner /><Transactions /></>
case 'wrg-intake': <WrgIntake />
case 'wrg-intake-review': <Dashboard />
case 'wrg-review': <Dashboard />
```

With:
```tsx
case 'wrg-origin':
    return <WrgOriginSplash onComplete={() => nextStep()} />
case 'wrg-estimator':
    return <StrataEstimatorShell />
```

**CRITICAL:** Remove the `<Transactions>` and `<Dashboard>` overlays that currently render alongside WRG components. The Shell must be the ONLY visible UI.

**wrg-demo.ts — new 5 steps:**
```typescript
export const WRG_DEMO_STEPS: DemoStep[] = [
    {
        id: 'w0.1',
        groupId: 0,
        groupTitle: 'Origin: The Old Way',
        title: 'How WRG builds quotes today',
        description: '4 disconnected tools, 8 hours of manual work, 85% without audit trail',
        app: 'wrg-origin',
        role: 'System',
    },
    {
        id: 'w2.1',
        groupId: 1,
        groupTitle: 'Strata Estimator Flow',
        title: 'Cost Estimation & Expert Review',
        description: 'David runs the full estimation with live rates and operational constraints',
        app: 'wrg-estimator',
        role: 'Expert',
    },
    {
        id: 'w2.2',
        groupId: 1,
        groupTitle: 'Strata Estimator Flow',
        title: 'Designer Verification',
        description: 'Alex verifies the custom OFS Serpentine item escalated by David',
        app: 'wrg-estimator',
        role: 'Designer',
    },
    {
        id: 'w2.3',
        groupId: 1,
        groupTitle: 'Strata Estimator Flow',
        title: 'Quote Assembly',
        description: 'David assembles the final proposal — $287K list → $202K net with labor and freight',
        app: 'wrg-estimator',
        role: 'Expert',
    },
    {
        id: 'w2.4',
        groupId: 1,
        groupTitle: 'Strata Estimator Flow',
        title: 'Proposal Review & Release',
        description: 'Sara reviews the $202K proposal, approves the 4-person chain, and releases to JPS',
        app: 'wrg-estimator',
        role: 'Dealer',
    },
]
```

**Remove from wrg-demo.ts:**
- All w1.x entries (w1.1 → w1.5)
- STEP_BEHAVIOR for w1.x
- STEP_MESSAGES for w1.x
- SELF_INDICATED entries for w1.x
- STEP_TIMING for w1.x

**Shell integration (update StrataEstimatorShell.tsx):**
- Read `currentStep` from `useDemo()` context
- Pass `connectedUser={getStepRole(currentStep.id)}` to the navbar
- Use `getStepState(currentStep.id)` to determine Estimator visual state
- Show HandoffBanner when step changes to a new role

**Must NOT include:**
- ❌ `<Transactions>` or `<Dashboard>` overlays alongside the Shell
- ❌ The global app Navbar rendered on top of the Estimator
- ❌ Breadcrumbs rendered inside the Shell
- ❌ Sidebar rendered alongside the Shell
- ❌ Any reference to w1.1–w1.5 steps

**Exit criteria:**
- Build passes
- Demo profile WRG shows 5 steps (not 9)
- Navigating w0.1 shows splash, then auto-advances to w2.1 which shows the Shell
- Commit: `feat(wrg-demo): collapse flow 1 into splash + single shell route`

---

### Phase 5 — Financial Summary Hero (1 hour)

**Goal:** Dark hero card showing final quote price + 4 metrics + CTA.

**File:** `src/features/strata-estimator/FinancialSummaryHero.tsx`

**Context needed:**
- `src/components/MetricCard.tsx` (for trend pattern reference)
- Project Aries code lines 432-469 (hero bar layout reference only, DO NOT copy classes)

**Props:**
```typescript
{
    estimate: EstimateResult
    onGenerateProposal: () => void
}
```

**Structure:**
- Outer: `bg-zinc-900 dark:bg-zinc-950 rounded-2xl border-l-4 border-brand-500 shadow-lg p-6 text-white overflow-hidden`
- Flex row: Final Quote Price (left) + divider + 4 metrics inline (center) + CTA (right)
- Final Quote:
  - Label: `text-[10px] font-bold text-brand-400 uppercase tracking-widest`
  - Value: `text-4xl font-bold tracking-tight text-white` with `$` in `text-xl text-zinc-400`
- 4 metrics (grid-cols-4 gap-4):
  1. Base Cost — `text-xs text-zinc-400` label, `text-lg font-semibold` value
  2. Margin (with %) — `text-success` color
  3. Total Hours — normal
  4. Crew Requirement — with "installers" suffix
- CTA button:
  - `bg-brand-300 dark:bg-brand-500 text-zinc-900 hover:bg-brand-400 rounded-xl px-6 py-3 font-semibold`
  - Icon: `Receipt` + text "Generate Proposal" + `ArrowRight`

**Must NOT include (Aries parity):**
- ❌ Progress bar showing completion %
- ❌ Pricing history trend chart
- ❌ Comparison vs previous quote
- ❌ Currency selector
- ❌ Tax breakdown
- ❌ Discount inputs (discount is in Config tab only)
- ❌ Secondary CTAs (only "Generate Proposal")
- ❌ Price lock indicator

**Wire up in Shell:** Below dossier card in ESTIMATOR tab. Compute `estimate` via `useMemo` calling `calculateInstall()`.

**Exit criteria:**
- Build passes
- Hero renders with live calculations
- Commit: `feat(estimator): add financial summary hero`

---

### Phase 6 — Bill of Materials Table (1.5 hours)

**Goal:** Editable table of line items with AI Import button.

**File:** `src/features/strata-estimator/BillOfMaterialsTable.tsx`

**Context needed:**
- `src/features/po-conversion/PODetailPage.tsx` lines 238-270 (table pattern reference)

**Props:**
```typescript
{
    lineItems: LineItem[]
    config: ConfigState
    onUpdateItem: (id: string, field: keyof LineItem, value: any) => void
    onAddItem: () => void
    onRemoveItem: (id: string) => void
    onAiImport: () => void
    onAiRefine: () => void
    hasLastFile: boolean
}
```

**Structure:**
- Card container: standard DS card
- Header:
  - Title "Bill of Materials" with `FileText` icon
  - Actions right:
    - "AI Import" button: `bg-ai/10 text-ai border border-ai/20 hover:bg-ai/20 px-4 py-2 rounded-lg text-xs font-semibold` with `Sparkles` icon
    - "AI Refine" (if `hasLastFile`): same style but `Wand2` icon
    - "+ Add Line" button: brand CTA
- Table:
  - Columns: Group (select) | Product Line (select) | Description (textarea) | QTY (number) | Actions (trash)
  - Row hover: `hover:bg-muted/50`
  - Inline editing with `bg-transparent` inputs
  - Trash button: `text-muted-foreground hover:text-destructive`

**Must NOT include (Aries parity):**
- ❌ Price column (only qty, no per-item price display)
- ❌ Total row at the bottom (totals are in the Hero above)
- ❌ Category filter
- ❌ Search within line items
- ❌ Bulk select / checkbox column
- ❌ Drag-to-reorder handles
- ❌ Row expansion (subrows)
- ❌ Comments per line
- ❌ Image/thumbnail column
- ❌ SKU separate from Product Line
- ❌ Pagination (Aries shows all items, scrollable)

**Wire up in Shell:** Below Financial Hero in ESTIMATOR tab.

**Exit criteria:**
- Build passes
- Table renders 3-5 mock items from Phase 1
- Inline editing works, quantities recalculate hero in real-time
- Commit: `feat(estimator): add bill of materials table`

---

### Phase 7 — Operational Constraints Panel (1 hour)

**Goal:** Panel for install days + 4 checkboxes + crew capacity display.

**File:** `src/features/strata-estimator/OperationalConstraintsPanel.tsx`

**Props:**
```typescript
{
    variables: OperationalVariables
    onVariablesChange: (variables: OperationalVariables) => void
    crewSize: number
}
```

**Structure:**
- Card container: standard DS card
- Title: "Operational Constraints" with `HardHat` icon
- 2-column grid:
  - **Left column:**
    - Planned Install Days card:
      - `Calendar` icon + "Planned Install Days" label
      - Number input `text-xl font-semibold text-primary` centered
      - "Days" suffix
    - 2x2 grid of checkboxes:
      - Union Force, Stair Carry, After Hours, Protection
      - Each checkbox: `flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary transition-colors cursor-pointer`
  - **Right column:**
    - Target Crew Capacity card (dark):
      - `bg-zinc-900 dark:bg-zinc-950 rounded-2xl p-6 text-white`
      - `HardHat` icon large (right side)
      - "Target Crew Capacity" label in `text-brand-400 text-[10px] uppercase`
      - Crew number in `text-3xl font-bold` + "installers" label

**Must NOT include (Aries parity):**
- ❌ Start date / end date pickers
- ❌ Shift selection (morning/afternoon/night)
- ❌ Equipment needed checklist
- ❌ Site photos / reference images
- ❌ Risk assessment dropdown
- ❌ Permit status
- ❌ Weather forecast
- ❌ Tools required list
- ❌ Supervisor assignment

**Wire up in Shell:** Below BoM table in ESTIMATOR tab.

**Exit criteria:**
- Build passes
- Checkbox changes trigger hero recalculation
- Commit: `feat(estimator): add operational constraints panel`

---

### Phase 8 — Vision Engine Modal (AI Import) (1.5 hours)

**Goal:** Modal for AI spec extraction.

**File:** `src/features/strata-estimator/VisionEngineModal.tsx`

**Context needed:**
- `src/components/modals/AIProcessingModal.tsx` (reuse pattern)
- `src/components/simulations/DuplerPdfProcessor.tsx` lines 1-100 (AI simulation pattern)

**Props:**
```typescript
{
    isOpen: boolean
    onClose: () => void
    onItemsExtracted: (items: LineItem[]) => void
    lastFile: { name: string } | null
}
```

**Structure:**
- `Dialog` from headless UI with backdrop
- Panel: `bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-2xl max-w-2xl`
- Header:
  - Icon: `Sparkles` in `bg-ai/10 text-ai p-3 rounded-xl`
  - Title: "Strata Vision Engine" + subtitle "Deep Spec Scan" / "Refinement Mode"
  - Close button
- Body (3 states):
  1. **Initial** (no file): Upload area with `Upload` icon + "Select Spec Document" button
  2. **Refinement** (has file): File name display + textarea for corrections
  3. **Analyzing**: Spinner animation (reuse pattern from AIProcessingModal)
- Footer actions: Cancel + Submit (brand CTA)

**Must NOT include (Aries parity):**
- ❌ PDF preview pane
- ❌ Extracted items preview list before confirming
- ❌ Confidence score per item
- ❌ Category mapping preview
- ❌ Progress bar with percentage
- ❌ Agent pipeline visualization
- ❌ History of previous uploads
- ❌ File type selector beyond PDF/image
- ❌ Multiple file upload
- ❌ OCR settings / options

**Simulation:** When user clicks submit, wait 2 seconds, then call `onItemsExtracted` with 5 mock line items.

**Exit criteria:**
- Build passes
- Modal opens from "AI Import" button in BoM table
- Submits mock items that populate the table
- Commit: `feat(estimator): add vision engine modal`

---

### Phase 9 — Wire Up ESTIMATOR Tab (30 min)

**Goal:** Connect all phase 4-8 components in the Shell with shared state.

**File:** `src/features/strata-estimator/StrataEstimatorShell.tsx`

**Tasks:**
1. Add state: `lineItems`, `customer`, `variables`, `config`, `isAiModalOpen`, `lastFile`
2. Compute `estimate` via `useMemo(() => calculateInstall(lineItems, variables, config), [lineItems, variables, config])`
3. Render in ESTIMATOR tab:
   ```tsx
   <main className="p-6 space-y-6 max-w-7xl mx-auto">
     <EstimatorDossierCard ... />
     <FinancialSummaryHero estimate={estimate} ... />
     <BillOfMaterialsTable ... />
     <OperationalConstraintsPanel ... />
   </main>
   ```
4. Wire the VisionEngineModal at the bottom of the shell

**Exit criteria:**
- Build passes
- Full ESTIMATOR tab renders end-to-end
- All calculations live (checkbox → hero update)
- AI Import modal populates table
- Commit: `feat(estimator): wire up ESTIMATOR tab with shared state`

**Checkpoint:** This is the MVP. Demo can show the Estimator tab as standalone feature from here.

---

### Phase 10 — PROJECTS Tab (1 hour)

**Goal:** Archive view listing saved projects with variance tracking.

**File:** `src/features/strata-estimator/ProjectsArchiveView.tsx`

**Context needed:**
- `src/features/po-conversion/PODraftsListPage.tsx` (80% reusable pattern)

**Props:**
```typescript
{
    savedEstimates: SavedEstimate[]
    onLoadEstimate: (estimate: SavedEstimate) => void
    onDeleteEstimate: (id: string) => void
    onUpdateStatus: (id: string, status: EstimateStatus) => void
    onUpdateActualCost: (id: string, cost: number) => void
}
```

**Structure:**
- Header with title "Project History" + search input
- Grid of cards, each showing:
  - Client name + status badge (DRAFT/PENDING/APPROVED/COMPLETED)
  - ZIP + date
  - 3 metrics: Est. Labor | Actual Labor (editable) | Yield Variance (trending up/down)
  - Actions: Load / Delete icon buttons

**Reuse:**
- Status badge pattern from `ConversionStatusBadge` (copy + adapt)
- Card layout from `PODraftsListPage`

**Must NOT include (Aries parity):**
- ❌ Filters bar (status, vendor, date)
- ❌ Sort options
- ❌ View toggle (grid/list/table)
- ❌ Pagination
- ❌ Summary bar with totals
- ❌ Analytics charts
- ❌ Export button (PDF/CSV)
- ❌ Bulk select / bulk delete
- ❌ Archive / unarchive toggle
- ❌ Tag system
- ❌ Starred / favorites
- ❌ Share button
- ❌ Activity feed

**Wire up in Shell:** Render in PROJECTS tab.

**Exit criteria:**
- Build passes
- 4 mock projects render
- Commit: `feat(estimator): add projects archive tab`

---

### Phase 11 — CONFIG Tab (1.5 hours)

**Goal:** Admin view for rates, categories, and margin.

**Files:**
- `src/features/strata-estimator/EstimatorAdminView.tsx`
- `src/features/strata-estimator/RangeSlider.tsx`
- `src/features/strata-estimator/CategoryConfigCard.tsx`

**Range Slider component:**
- `<input type="range">` wrapped in card
- Display value in large brand color
- Accent: `accent-primary`

**Admin View structure:**
- Title: "Administrative Logic" with `Settings2` icon
- 2-column grid:
  - Default Margin slider (0.1 - 0.6)
  - Base Labor Hourly Costs (Non-Union / Union inputs)
- Below: Grid of Category Config Cards
  - Each category: title + subcategories list + add subcategory button
  - Each subcategory: label + editable rate input

**Must NOT include (Aries parity):**
- ❌ User management section
- ❌ Role permissions
- ❌ Tenant / workspace settings
- ❌ API keys / integrations
- ❌ Webhooks
- ❌ Notification preferences
- ❌ Email templates
- ❌ Audit log
- ❌ Data import/export settings
- ❌ Theme / branding customization
- ❌ Language / locale settings
- ❌ Tax settings (beyond margin)
- ❌ Currency settings
- ❌ Backup schedule
- ❌ Multi-step config wizards

**Exit criteria:**
- Build passes
- CONFIG tab fully functional
- Commit: `feat(estimator): add config/admin tab`

---

### Phase 12 — ❌ ELIMINATED (merged into Phase 4.8)

This phase was merged into **Phase 4.8** (Rewire App.tsx + wrg-demo.ts) when we
adopted Opción F. All routing and integration work happens in 4.8 before Phase 5
so that every subsequent phase (Hero, BoM, Constraints, etc.) is immediately
visible in the demo as soon as it's implemented.

---

### Phase 13 — Pricing Waterfall + Quote Assembly (1.5 hours)

**Goal:** Extract pricing waterfall from `WrgLaborEstimation.tsx` into a reusable component, integrate in Estimator for w2.3.

**Files:**
- `src/features/strata-estimator/PricingWaterfall.tsx` (new)
- Extract logic from `src/components/simulations/WrgLaborEstimation.tsx` (search for "waterfall" or "$287" or pricing animation)

**Component:**
- Shows price breakdown animation: List Price → Discount → Net → +Labor → +Freight → Final
- Each step appears sequentially with fade-in

**Integration:**
- When user clicks "Generate Proposal" in hero, trigger the waterfall animation
- After animation, show "Select Dealer" button to send for review

**Exit criteria:**
- Build passes
- Waterfall plays when Generate Proposal clicked
- Commit: `feat(estimator): add pricing waterfall for quote assembly`

---

### Phase 14 — Designer Verification Sub-view (1 hour)

**Goal:** Overlay view within Estimator for w2.2 (Designer validates 5 modules).

**File:** `src/features/strata-estimator/DesignerVerificationOverlay.tsx`

**Structure:**
- Side panel or overlay over the Estimator
- 5 checkbox modules:
  1. Cost Summary
  2. Project Scope
  3. Escalated Item (OFS Serpentine)
  4. Assembly Verification
  5. Applied Rate ($798)
- Each module expandable with comments textarea
- "Preview PDF" button
- "Send Back to Expert" CTA

**Exit criteria:**
- Build passes
- Overlay triggered during w2.2
- Commit: `feat(estimator): add designer verification overlay`

---

### Phase 15 — Polish + Dark Mode + Narrative (1 hour)

**Goal:** Final polish pass.

**Tasks:**
1. Verify all components render correctly in dark mode (toggle and check each tab)
2. Verify responsive layout on `min-w-[1024px]` viewport
3. Update `wrg-demo.ts` descriptions with user-facing copy (narrative from plan section 8)
4. Add smooth transitions between tabs
5. Add loading skeleton for initial Estimator render

**Exit criteria:**
- Build passes
- Visual QA complete
- Commit: `feat(estimator): polish dark mode, responsive, narrative`

---

### Phase 16 — Documentation + Final Commit (30 min)

**Goal:** Add implementation report and final commit.

**Files:**
- `docs/wrg-demo/IMPLEMENTATION_REPORT.md` — what was built, how to test, gaps

**Tasks:**
1. Write implementation report following SDB-1365 format
2. List all files created/modified
3. Test instructions for each tab
4. Final commit + push

**Exit criteria:**
- Docs complete
- Build passes
- Commit: `docs(wrg-demo): add implementation report`

---

## Phase Dependency Graph (updated for Opción F)

```
✅ Phase 0 (Scaffold)
    ↓
✅ Phase 1 (Types + Mock Data)
    ↓
✅ Phase 2 (Calculations)
    ↓
✅ Phase 3 (Shell + Navbar)
    ↓
✅ Phase 4 (Dossier Card)
    ↓
🆕 Phase 4.5 (Roles + Step States)
    ↓
🆕 Phase 4.6 (WrgOriginSplash)
    ↓
🆕 Phase 4.7 (HandoffBanner)
    ↓
🆕 Phase 4.8 (Rewire App.tsx + wrg-demo.ts)  ← 🎬 DEMO NAVIGABLE
    ↓
Phase 5 (Financial Hero)
    ↓
Phase 6 (BoM Table)
    ↓
Phase 7 (Constraints)
    ↓
Phase 8 (Vision Modal)
    ↓
Phase 9 (Wire Up + Step State Awareness)  ← 🎯 MVP CHECKPOINT
    ↓
Phase 10 (Projects Tab) ─── can run parallel with Phase 11
Phase 11 (Config Tab)
    ↓
❌ Phase 12 (ELIMINATED — merged into 4.8)
    ↓
Phase 13 (Pricing Waterfall — for w2.3)
    ↓
Phase 14 (Designer Verification State — for w2.2)
    ↓
Phase 15 (Polish + Dark Mode + Narrative)
    ↓
Phase 16 (Documentation + Final Commit)
```

### Key checkpoints
- **After Phase 4.8** → The demo is navigable end-to-end but with empty content inside the Shell. You can see the splash → Estimator with dossier.
- **After Phase 9** → MVP complete. All 4 sections of ESTIMATOR tab are visible with real data and live calculations.
- **After Phase 11** → All 3 Aries tabs (ESTIMATOR, PROJECTS, CONFIG) are functional.
- **After Phase 14** → Role-aware state transitions (w2.1 → w2.4) fully working.

### Progress summary

**Completed (5 / 19):** 0, 1, 2, 3, 4
**Next to execute:** 4.5 (Roles + Step States)
**Remaining:** 4.5, 4.6, 4.7, 4.8, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16
**Eliminated:** 12

---

## Session Management

### Recommended session sizes:
- **Short session (1-2 phases):** Phase 0+1, Phase 2+3, Phase 4+5, etc.
- **Medium session (3 phases):** Phase 6+7+8 (they build on each other)
- **Never:** More than 3 phases in one session (context loss risk)

### Session template for continuing:

```
Continue WRG Demo v6 implementation from the IMPLEMENTATION_PLAN.md at
docs/wrg-demo/IMPLEMENTATION_PLAN.md

Current state: Phase X completed, commit hash: <hash>
Next phase to execute: Phase Y

Before starting:
1. Verify branch is "demo"
2. Verify build passes
3. Read the "Context needed" files listed in Phase Y
4. Execute Phase Y following the exact structure in the plan
5. Commit with the exact message from the plan

Do NOT execute Phase Y+1 in the same session unless I explicitly ask.
```

---

## Rollback Strategy

If any phase produces a broken build:

1. **Do NOT continue to next phase**
2. `git diff` to see what changed
3. Fix the issue OR `git checkout -- .` to discard changes
4. Re-execute the failed phase with the specific error context
5. If stuck, mark the phase as "blocked" and skip to a parallel phase (see dependency graph)

---

## Success Metrics

- [ ] 16 commits, one per phase
- [ ] Each commit passes `npx vite build`
- [ ] Final demo: Navigate w1.1 → w1.5 → w2.1 (Estimator) → w2.4 (Dealer Review)
- [ ] All 3 tabs (Estimator, Projects, Config) functional
- [ ] Dark mode works in all screens
- [ ] AI Import modal populates BoM with mock items
- [ ] Financial hero updates in real-time when checkboxes toggle
- [ ] Total new code: ~2300 lines
- [ ] Zero regressions in existing Flow 1 (w1.1-w1.5)

---

## Open Questions (Resolve before Phase 12)

1. Should CONFIG tab be hidden from stakeholder demos? (Affects Phase 11 scope)
2. Does w2.4 stay in Transactions or move into Estimator? (Affects Phase 12 routing)
3. Are the 24 JPS line items the same as in `WrgLaborEstimation.tsx`? (Affects Phase 1 mock data)
4. Should the Vision Engine modal show a real PDF preview or just animation? (Affects Phase 8 complexity)
