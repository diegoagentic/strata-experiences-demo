import { useMemo } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, DevicePhoneMobileIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { SharedBlockEntry } from '../config/sharedBlocks';
import { DEMO_PROFILES } from '../config/demoProfiles';
import logoLightBrand from '../assets/logo-light-brand.png';
import logoDarkBrand from '../assets/logo-dark-brand.png';

interface SharedBlockShellProps {
  block: SharedBlockEntry;
  onExit: () => void;
}

/**
 * SharedBlockShell · frame around a shared building block preview.
 *
 * Uses the same floating-pill navbar look as the real Strata experiences
 * (Navbar.tsx) so previews sit inside the ecosystem visually. Three modes:
 *
 *  · 'strata-shell'     (default) — floating pill navbar with Strata logo +
 *    experience-style eyebrow ("SHARED BUILDING BLOCK · PREVIEW IN DEALER X")
 *    + block title. Below the navbar, a small breadcrumb "Shared Blocks ›
 *    Block Name". Body renders with the same pt-24 max-w-7xl treatment as
 *    Strata's PageShell.
 *
 *  · 'external-preview'          — warning-tinted top strip "External System
 *    Preview · Legacy tool Strata replaces" + body in a tinted warning
 *    envelope. Explicit signal that this is NOT Strata.
 *
 *  · 'mobile-preview'            — info-tinted top strip + body wrapped in
 *    a phone frame (max-w-[420px] rounded corners + border).
 */
export default function SharedBlockShell({ block, onExit }: SharedBlockShellProps) {
  const frameMode = block.frameMode ?? 'strata-shell';
  const Component = block.component;

  // Rotating tenant crumb · picks one usedByExperiences entry per open
  // (memoized on block.id so it stays stable during the session).
  const tenantCrumb = useMemo(() => {
    const consumers = block.usedByExperiences ?? [];
    if (consumers.length === 0) return null;
    const idx = Math.floor(Math.random() * consumers.length);
    const consumerId = consumers[idx];
    const profile = DEMO_PROFILES.find(p => p.id === consumerId);
    return profile?.companyName ?? consumerId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id]);

  const kindLabel =
    block.kind === 'widget' ? 'Widget'
    : 'Shared Building Block';

  // ─── strata-shell (default) · floating-pill navbar + breadcrumb ────────
  if (frameMode === 'strata-shell') {
    return (
      <div className="min-h-screen bg-background">
        {/* Floating-pill navbar · mimics src/components/Navbar.tsx */}
        <div className="fixed top-6 z-50 flex justify-center px-4 left-0 right-0">
          <div className="relative flex items-center lg:justify-between px-3 py-2 rounded-full gap-1 bg-card/80 backdrop-blur-xl border border-border shadow-lg dark:shadow-glow-md w-full max-w-7xl">
            {/* Left · logo + experience-style title */}
            <div className="flex items-center gap-1">
              <div className="px-2 shrink-0">
                <img src={logoLightBrand} alt="Strata" className="h-8 w-20 object-contain block dark:hidden" />
                <img src={logoDarkBrand}  alt="Strata" className="h-8 w-20 object-contain hidden dark:block" />
              </div>
              <div className="h-6 w-px bg-border mx-1 hidden lg:block" />
              <div className="flex flex-col items-start text-left px-2 py-1.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none">
                  {kindLabel}
                  {tenantCrumb && <> · preview in <span className="text-foreground">{tenantCrumb}</span></>}
                </span>
                <span className="text-sm font-bold text-foreground leading-tight flex items-center gap-1.5 mt-0.5">
                  <span className="text-base">{block.icon}</span>
                  {block.title}
                </span>
              </div>
            </div>

            {/* Right · exit button (no theme/user/notifs · this is a preview) */}
            <div className="flex items-center gap-1 pr-1">
              <button
                onClick={onExit}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Exit block preview"
              >
                <XMarkIcon className="w-4 h-4" />
                Exit preview
              </button>
            </div>
          </div>
        </div>

        {/* Body · pt-24 matches Strata PageShell top padding */}
        <div className="pt-24 px-4 pb-20">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumbs · matches Strata Dashboard › Transactions pattern */}
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
              <button
                onClick={onExit}
                className="hover:text-foreground transition-colors"
              >
                Shared Blocks
              </button>
              <ChevronRightIcon className="w-3 h-3 shrink-0" />
              <span className="text-foreground font-medium">{block.title}</span>
            </nav>

            {/* Title + description · matches Strata PageShell header */}
            <header className="pb-4 mb-6 border-b border-border">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 text-lg">
                  {block.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium uppercase tracking-wider">{kindLabel}</span>
                    {tenantCrumb && (
                      <>
                        <span>·</span>
                        <span>Preview inside {tenantCrumb}</span>
                      </>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-foreground leading-tight mt-0.5">
                    {block.title}
                  </h1>
                  {block.description && (
                    <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
                      {block.description}
                    </p>
                  )}
                </div>
              </div>
            </header>

            {/* Block body */}
            <Component />
          </div>
        </div>
      </div>
    );
  }

  // ─── external-preview ──────────────────────────────────────────────────
  if (frameMode === 'external-preview') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 border-b border-warning/30 bg-warning/10 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-warning/20 text-warning flex items-center justify-center shrink-0">
                <ExclamationTriangleIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-warning uppercase tracking-wider leading-none">
                  External System Preview · Legacy tool Strata replaces
                </p>
                <h1 className="text-sm font-semibold text-foreground leading-tight truncate flex items-center gap-2 mt-0.5">
                  <span className="text-base shrink-0">{block.icon}</span>
                  {block.title}
                  {tenantCrumb && <span className="text-xs font-normal text-muted-foreground">· in use at {tenantCrumb}</span>}
                </h1>
              </div>
            </div>
            <ExitButton onExit={onExit} />
          </div>
          {block.description && (
            <div className="max-w-7xl mx-auto px-6 pb-3">
              <p className="text-xs text-muted-foreground">{block.description}</p>
            </div>
          )}
        </div>

        <div className="p-4 max-w-7xl mx-auto">
          <div className="rounded-2xl border-2 border-dashed border-warning/40 bg-muted/20 overflow-hidden">
            <Component />
          </div>
        </div>
      </div>
    );
  }

  // ─── mobile-preview ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-info/10 text-info flex items-center justify-center shrink-0">
              <DevicePhoneMobileIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-info uppercase tracking-wider leading-none">
                Mobile Scene Preview
                {tenantCrumb && <> · previewed inside <span className="text-foreground">{tenantCrumb}</span></>}
              </p>
              <h1 className="text-sm font-semibold text-foreground leading-tight truncate flex items-center gap-2 mt-0.5">
                <span className="text-base shrink-0">{block.icon}</span>
                {block.title}
              </h1>
            </div>
          </div>
          <ExitButton onExit={onExit} />
        </div>
        {block.description && (
          <div className="max-w-7xl mx-auto px-6 pb-3">
            <p className="text-xs text-muted-foreground">{block.description}</p>
          </div>
        )}
      </div>

      <div className="py-10 flex items-start justify-center bg-muted/10">
        <div className="w-full max-w-[420px] rounded-[2.5rem] border-[10px] border-foreground/85 bg-background shadow-2xl overflow-hidden">
          <Component />
        </div>
      </div>
    </div>
  );
}

function ExitButton({ onExit }: { onExit: () => void }) {
  return (
    <button
      onClick={onExit}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
      aria-label="Exit block preview"
    >
      <XMarkIcon className="w-4 h-4" />
      Exit
    </button>
  );
}
