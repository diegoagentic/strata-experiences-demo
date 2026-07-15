# CLC — Source of Truth

> Live de la transcripción Avanto · CLC del 2026-05-27 y el Notion "14. Creative Library Concepts".

## Company facts

- **Name**: Creative Library Concepts (CLC)
- **Founded**: 1993 · Manalapan NJ
- **Size**: ~12 employees · revenue ~$7–10M
- **Territory**: New York · New Jersey · Pennsylvania
- **Ownership**: Privately owned
- **Manufacturer network**: 100+ authorized vendors (most on state/cooperative contracts)
- **Listed in Blue Book since 1994**
- **Growth posture**: slow & steady · no PE pressure · stable customer base · expanding territory

## Stakeholders (roles only · no proper names)

| Role | Tenure | Scope |
|---|---|---|
| **Director of Operations** | Joined Aug 2025 · 18yr prior library furniture industry | SOP standardization · scheduling · installation coordination · operational systems · primary Avanto contact |
| **Office Director** | 14yr CLC | Accounting · invoicing · IQ champion · QuickBooks · day-to-day office ops |
| Owner | (n/a) | Sales & business development focus · brought in Director of Operations to free up bandwidth |

## Tech stack

| System | Role | Notes |
|---|---|---|
| **IQ** | System of record | 6yrs in · quotes · POs · invoicing · status states · **API is READ-ONLY · no write-back** |
| **QuickBooks** | Accounting | Already integrated with IQ · IQ pushes bills to QB |
| **Microsoft 365** | Productivity | Outlook · SharePoint · OneDrive |
| **CET** | Design | Primary design/layout tool · exports SIF imports into IQ |
| Canva · AutoCAD | Supplementary | Designers use sporadically |

## Business model constraint

State contracts dominate. For one customer project on contract:

- The customer sends 5 separate POs (one per manufacturer)
- IQ creates 5 separate job entries (one per vendor)
- The dealer (CLC) earns a commission · vendors hold receivables directly
- **Customer-tag linkage exists** to relate the 5 IQ jobs to one project (already in use today)

Off-contract direct sales follow the simpler 1-PO-1-job pattern but represent a smaller share.

## Anchor narrative for the demo

**Project**: Fairport Public Library (Fairport NY)
**Architects**: Tappé Architects · SWBR Architects & Engineers
**Vendors on this project (5)**: TMC · KI · Smith System · Media Tech · Aurora

These are real CLC manufacturer partners. All demo data references this project for verisimilitude.

## Out of scope (mention as roadmap chips, do not deepen)

- **AP Automation** — Office Director confirmed manual bill entry to IQ → push to QB is "pretty basic" · long project cycles keep volume manageable · revisit post-foundation
- **Customer-facing portal** — concept-level only · surfaces as a design consideration in Flow 3, not a deliverable
- **SIF converter** — Avanto already has this as a standard tool · surface as available capability but not part of this demo
