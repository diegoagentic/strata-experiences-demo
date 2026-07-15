# Strata Experiences Demo

Unified demo shell that showcases the 12+ Strata experiences (production +
WIP) in a single application. The user selects an experience from the
navbar dropdown and the UI reconfigures: custom navigation, feature flags,
tour steps, role-based views.

Cloned from `inbound-outbound` (2026-07-15) which already had a working
multi-profile shell (`DemoProfileContext`, `switchProfile`, per-profile
`customNavigation`, `view-as` toggle) plus 20 custom Strata DS components.

## Reference

- `docs/experience-map.csv` — module × experience × role mapping (source
  of truth, provided by the tech lead).
- `docs/EXPERIENCES.md` — per-experience status board (baseline audit
  + refinement notes).
- `SECURITY.md` — malware signature + defense (inherits the ecosystem
  guard: `.githooks/pre-commit` + `scripts/scan-security.mjs` + build guard).

## Local dev

```bash
npm install
npm run dev
```

Local URL: `http://localhost:8095/` (dedicated port to avoid colliding
with sibling projects at `:8086`).

## Scripts

- `npm run dev` — Vite dev server on `:8095`.
- `npm run build` — production build (runs security scan first, then the
  `strata-ds` sublib build, then Vite).
- `npm run scan:security` — malware scan (should always exit 0).
- `npm run lint` — ESLint.

## Architecture

The `DemoProfileContext` at `src/context/DemoProfileContext.tsx` exposes
`{ activeProfile, profiles, switchProfile }`. The active profile drives:

- Navbar tabs (`profile.navigation`).
- Dashboard widgets and default views (`profile.features.*`).
- Hidden pages (`profile.features.hiddenPages`).
- Role switcher availability (`profile.hasRoleSwitcher` + `profile.roles`).
- Custom item / price gating.
- Demo tour steps.

Profiles are declared one-per-file under `src/config/profiles/` and
aggregated in `src/config/demoProfiles.ts`.

## Deploy

Vercel project (URL TBD in Fase F17). See the sibling `strata-landing`
which links to this demo.
