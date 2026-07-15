# CORE Integration Constraint — WRG Demo v6

**Source:** User clarification during Phase 4.5 planning
**Date:** 2026-04-10
**Applies to:** All WRG demo v6 phases

---

## The Constraint

**CORE is an export-only system.** Strata cannot integrate with CORE through APIs, live sync, or bidirectional data flow.

### What Strata CAN do:
- ✅ Receive files that the user **manually exports** from CORE (PDF, CSV, Excel)
- ✅ Process those files with AI (extract line items, categorize, etc.)
- ✅ Generate output files (PDF quotes, proposals) that the user can then **manually upload** back to CORE

### What Strata CANNOT do:
- ❌ Read data directly from CORE
- ❌ Write data directly to CORE
- ❌ Sync in real-time with CORE
- ❌ Trigger CORE workflows
- ❌ Receive notifications from CORE

### Why this matters for the demo:
The BPMN diagrams show CORE as a central system that the estimator interacts with at the beginning and end of the process. Strata does NOT replace CORE. Strata replaces the **4 disconnected tools in the middle** (Product Selection Sheet, Spec PDFs, Delivery Pricer Excel, Labor Worksheet Excel).

---

## Correct narrative for the demo

### Old way (pain points):
```
📧 Outlook (email with PDF attachments)
  ↓
📄 CORE (manually read scope, download files)
  ↓
📎 PDF spec sheets (read line by line)
  ↓
📊 Product Selection Sheet Excel
  ↓
📊 Delivery Pricer Excel
  ↓
🧠 Mark's head (man-hour rates from 100 years of experience)
  ↓
📊 Labor Worksheet Excel
  ↓
📝 Type final lump sum back into CORE manually
```

**Result:** Working files stay in silos, CORE only has the final number. 85% of quotes have no audit trail.

### New way (Strata):
```
📥 Estimator downloads files from CORE (same manual step)
  ↓
📤 Estimator drops files into Strata Estimator (NEW)
  ↓
✨ Strata AI extracts all line items + categories (NEW — replaces 4 tools)
  ↓
🎯 Estimator works in ONE unified interface (NEW — replaces Excel silos)
  ↓
💾 Strata preserves ALL calculation logic + line items + rates (NEW — audit trail)
  ↓
📥 Estimator downloads final quote PDF from Strata
  ↓
📝 Estimator uploads PDF to CORE manually (same manual step)
```

**Result:** CORE receives the same final file, but now there's full audit trail in Strata for every calculation, rate, and decision.

---

## UI rules derived from this constraint

### 1. Splash screen (Phase 4.6)
**DO NOT say:** "CORE → Strata sync"
**DO say:** "Files manually exported from CORE + email attachments → Strata"

### 2. Project Dossier badges (Phase 4)
**DO NOT show:** "🔗 CORE live sync"
**DO show:** "📥 Uploaded from CORE export" (with file names)

### 3. Vision Engine Modal (Phase 8)
**DO NOT say:** "Connect to CORE to import"
**DO say:** "Drop files here — PDF, CSV, or Excel exported from CORE or email"

### 4. Final quote generation (Phase 13)
**DO NOT say:** "Submit to CORE"
**DO say:** "Download PDF → upload to CORE" (acknowledging the manual step)

### 5. Source files card (NEW — add to Dossier area)
Show the actual files that were used as input:
```
┌─ Source Files (uploaded from CORE export) ─┐
│ 📄 JPS_scope.pdf      (CORE export)         │
│ 📊 JPS_products.csv   (CORE export)         │
│ 📎 JPS_specs.pdf      (from email)          │
└─────────────────────────────────────────────┘
```

This makes the "file-based origin" visually obvious and honest about CORE's role.

---

## Phases affected by this constraint

| Phase | Change required |
|---|---|
| **4.5 Roles + Step States** | Step state `intake-empty` should trigger the splash with correct narrative |
| **4.6 WrgOriginSplash** | Complete rewrite of the narrative to show manual export + upload steps |
| **4 EstimatorDossierCard** | Add "Source Files" sub-card showing uploaded files from CORE |
| **8 VisionEngineModal** | Copy changes: "Drop files exported from CORE" instead of "Connect to CORE" |
| **13 PricingWaterfall** | Final CTA changes: "Download PDF" instead of "Submit to CORE" |
| **15 Polish / Narrative** | Review all copy to ensure no phrase implies direct CORE integration |

---

## Key talking points for the stakeholder demo

1. **"Strata doesn't replace CORE."** CORE keeps being the source of truth for WRG's contracts and financials.
2. **"Strata replaces the 4 silos in the middle."** The Excel files, the Product Selection Sheet, the Delivery Pricer, the Labor Worksheet — all disappear.
3. **"The same manual steps at the beginning and end."** Download from CORE, upload to CORE. Nothing changes there.
4. **"What changes is everything in between."** 8 hours of manual work across 4 tools → 12 minutes in one unified app.
5. **"Full audit trail preserved."** Unlike the old Excel workflow where 85% of quotes had no breakdown, Strata keeps every calculation, every rate, every decision.
