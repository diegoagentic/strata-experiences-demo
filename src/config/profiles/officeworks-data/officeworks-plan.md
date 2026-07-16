# Officeworks Demo — Integrated Plan

> Full plan en `C:\Users\User\.claude\plans\cuddly-greeting-meadow.md`

## Iter 1 deliverable (este pase)

**Foundation completa + 4 hero scenes + 13 placeholders navegables**

### Hero scenes (CEO top 4 priorities)
1. **sc1.6 SelfAuditScene** (SC2 + SC3 · CEO #1) — BOM 71 lines + 5-step audit panels + inline Create CR panel
2. **sc1.7 PeerReviewScene** (SC7 · CEO #3) — split view + Felicia tacit-knowledge surface
3. **sc1.9 AckReviewScene** (Gemini supercharge) — clone AckReconciliationModal pattern + real PO data + 2 EEs
4. **OfficeworksDashboardScene** (SC5 + SC6 · CEO #2 + #4) — capacity heatmap + KPIs (persistent tab)

### Shared components
- `BOMTable` (reusable · 71 Metro Legal lines)
- `CapacityHeatmap` (~30 designers · 3 regions)
- `PDFPreviewModal` (iframe-based · 3 PDFs assets)
- `manattOrderData.ts` (constants from real PO)
- `auditChecklistSteps.ts` (5-step structure)

### Files modified
- `demoProfiles.ts` — add SimulationApp ids + Design Manager role + DemoProfileId 'officeworks' + entry
- `App.tsx` — isOfficeworks + nav + appName + appToTab + renderSimulation cases

## Real data sources (3 PDFs)
- `src/assets/officeworks-pdfs/PO-DC-0009642.pdf` (Metro Legal Ack · 71 lines · real)
- `src/assets/officeworks-pdfs/OW_Design_Checklist_-_2026.pdf` (12 sections)
- `src/assets/officeworks-pdfs/OW_Audit_Checklist_-_2026.pdf` (5 steps · self + peer)

## Next iterations
- **Iter 2:** flesh sc1.0 (CAD missing) + sc1.0b (assignment) + sc1.4 (SQ) + sc1.5 (Teknion preview)
- **Iter 3:** flesh sc1.1 + sc1.2/sc1.2b + sc1.3 + sc1.3b + sc1.5b/sc1.5c + sc1.8 + sc1.8b
- **Iter 4:** polish microinteractions + dark mode + accessibility + rehearsal
