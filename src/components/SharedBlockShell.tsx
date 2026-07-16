import { useMemo } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import type { SharedBlockEntry } from '../config/sharedBlocks';
import { DEMO_PROFILES } from '../config/demoProfiles';
import logoLightBrand from '../assets/logo-light-brand.png';
import logoDarkBrand from '../assets/logo-dark-brand.png';

interface SharedBlockShellProps {
  block: SharedBlockEntry;
  onExit: () => void;
}

/**
 * SharedBlockShell · frame around a shared building block or widget preview.
 *
 * Renders one of three frames depending on `block.frameMode`:
 *
 *  · 'strata-shell'     (default) — top navbar with Strata logo + tenant crumb
 *    rotated from a random `usedByExperiences` entry. Signals "this block
 *    lives INSIDE a Strata experience".
 *
 *  · 'external-preview'          — warning banner "External System Preview ·
 *    Legacy tool that Strata replaces". Body wrapped in a tinted warning
 *    envelope. Signals "this is what the user's existing tool looks like,
 *    before Strata".
 *
 *  · 'mobile-preview'            — phone-shaped frame (max-w-[420px] rounded
 *    corners + border) around the body. Signals "this scene targets a mobile
 *    device".
 *
 * All three modes keep the top `Exit` button and the block's short
 * description below the frame chrome.
 */
export default function SharedBlockShell({ block, onExit }: SharedBlockShellProps) {
  const frameMode = block.frameMode ?? 'strata-shell';
  const Component = block.component;

  // Tenant crumb: pick one usedByExperiences entry at random per open.
  // Use useMemo(block.id) so the same block keeps the same crumb between
  // re-renders within a session, but a fresh visit rerolls.
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
    frameMode === 'external-preview' ? 'External System Preview'
    : frameMode === 'mobile-preview' ? 'Mobile Scene Preview'
    : block.kind === 'widget' ? 'Widget'
    : 'Shared Building Block';

  // ─── strata-shell (default) ────────────────────────────────────────────
  if (frameMode === 'strata-shell') {
    return (
      <div className="min-h-screen bg-background">
        {/* Strata-style compact navbar */}
        <div className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <img src={logoLightBrand} alt="Strata" className="h-6 w-auto object-contain block dark:hidden shrink-0" />
              <img src={logoDarkBrand}  alt="Strata" className="h-6 w-auto object-contain hidden dark:block shrink-0" />
              <div className="h-6 w-px bg-border shrink-0" />
              <div className="flex flex-col min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                  {kindLabel}
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

        {/* Block body — rendered as if it were inside a Strata page */}
        <div>
          <Component />
        </div>
      </div>
    );
  }

  // ─── external-preview ──────────────────────────────────────────────────
  if (frameMode === 'external-preview') {
    return (
      <div className="min-h-screen bg-background">
        {/* Warning banner · signals legacy external tool */}
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

        {/* Block body — framed in a warning envelope */}
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
      {/* Compact Strata-style header */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-info/10 text-info flex items-center justify-center shrink-0">
              <DevicePhoneMobileIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-info uppercase tracking-wider leading-none">
                {kindLabel}
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

      {/* Phone frame around the body */}
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
