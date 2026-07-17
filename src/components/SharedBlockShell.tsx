import { useMemo } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, DevicePhoneMobileIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { SharedBlockEntry } from '../config/sharedBlocks';
import { DEMO_PROFILES } from '../config/demoProfiles';
import { useAuth } from '../context/AuthContext';

import NavbarPill from './navbar/NavbarPill';
import ExperienceSwitcher from './navbar/ExperienceSwitcher';
import ThemeToggleButton from './navbar/ThemeToggleButton';
import UserAvatarMenu from './navbar/UserAvatarMenu';
import ActionCenter from './notifications/ActionCenter';
import RoleSwitcher from './RoleSwitcher';

import logoLightBrand from '../assets/logo-light-brand.png';
import logoDarkBrand from '../assets/logo-dark-brand.png';

interface SharedBlockShellProps {
  block: SharedBlockEntry;
  onExit: () => void;
  onLogout: () => void;
}

/**
 * SharedBlockShell · frame around a shared building block preview.
 *
 * Three modes:
 *  · 'strata-shell'     (default) — consumes NavbarPill so the preview sits
 *    inside the real Strata platform chrome: logo · ExperienceSwitcher (with
 *    block active) · RoleSwitcher · ThemeToggleButton · ActionCenter ·
 *    UserAvatarMenu · Exit. Below the pill, a breadcrumb + PageShell-style
 *    header render the block title with its icon.
 *  · 'external-preview'          — warning-tinted top strip "External System
 *    Preview · Legacy tool Strata replaces" + body in a tinted warning
 *    envelope. Explicit signal that this is NOT Strata.
 *  · 'mobile-preview'            — info-tinted top strip + body wrapped in
 *    a phone frame.
 */
export default function SharedBlockShell({ block, onExit, onLogout }: SharedBlockShellProps) {
  const frameMode = block.frameMode ?? 'strata-shell';
  const Component = block.component;
  const { user } = useAuth();

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

  const kindLabel = block.kind === 'widget' ? 'Widget' : 'Shared Building Block';

  // ─── strata-shell (default) · NavbarPill + breadcrumb ─────────────────
  if (frameMode === 'strata-shell') {
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userInitials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    const leading = (
      <>
        <div className="px-2 shrink-0">
          <img src={logoLightBrand} alt="Strata" className="h-8 w-20 object-contain block dark:hidden" />
          <img src={logoDarkBrand}  alt="Strata" className="h-8 w-20 object-contain hidden dark:block" />
        </div>
        <div className="h-6 w-px bg-border mx-1 hidden lg:block" />
        <ExperienceSwitcher activeBlockId={block.id} />
      </>
    );

    const trailing = (
      <>
        <div className="hidden lg:block">
          <RoleSwitcher />
        </div>
        <ThemeToggleButton />
        <ActionCenter />
        <UserAvatarMenu
          onLogout={onLogout}
          demoProfile={null}
          displayName={displayName}
          userInitials={userInitials}
        />
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Exit block preview"
        >
          <XMarkIcon className="w-4 h-4" />
          Exit preview
        </button>
      </>
    );

    return (
      <div className="min-h-screen bg-background">
        <NavbarPill leading={leading} trailing={trailing} respectSidebar={false} />

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
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
            {/* Left · warning marker + ExperienceSwitcher (jump control) */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <div className="h-8 w-8 rounded-lg bg-warning/20 text-warning flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                </div>
                <span className="hidden md:inline text-[10px] font-bold text-warning uppercase tracking-wider leading-none">
                  External · Legacy tool
                </span>
              </div>
              <div className="h-6 w-px bg-warning/30 hidden md:block" />
              <ExperienceSwitcher activeBlockId={block.id} />
            </div>
            {/* Right · standard chrome controls */}
            <div className="flex items-center gap-1 shrink-0">
              <RoleSwitcher />
              <ThemeToggleButton />
              <ExitButton onExit={onExit} />
            </div>
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
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-8 w-8 rounded-lg bg-info/10 text-info flex items-center justify-center">
                <DevicePhoneMobileIcon className="w-4 h-4" />
              </div>
              <span className="hidden md:inline text-[10px] font-bold text-info uppercase tracking-wider leading-none">
                Mobile Scene
              </span>
            </div>
            <div className="h-6 w-px bg-border hidden md:block" />
            <ExperienceSwitcher activeBlockId={block.id} />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <RoleSwitcher />
            <ThemeToggleButton />
            <ExitButton onExit={onExit} />
          </div>
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
