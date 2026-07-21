import { Fragment } from 'react';
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useDemoProfile } from '../../context/useDemoProfile';
import { SHARED_BLOCKS } from '../../config/sharedBlocks';

interface ExperienceSwitcherProps {
  appName?: string;
  companyName?: string;
  activeBlockId?: string | null;
  showExperienceIcon?: boolean;
}

/**
 * ExperienceSwitcher · popover that lets the user jump between the 3
 * catalog surfaces (Feature Modules · Tour Profiles · Shared Blocks ·
 * Widgets). Extracted from Navbar.tsx (F18.polish.v2 Paso A) so both the
 * main Navbar and SharedBlockShell can reuse it.
 */
export default function ExperienceSwitcher({
  appName,
  companyName,
  activeBlockId,
  showExperienceIcon = true,
}: ExperienceSwitcherProps) {
  const { activeProfile, profiles, switchProfile } = useDemoProfile();

  const activeBlock = activeBlockId
    ? SHARED_BLOCKS.find(b => b.id === activeBlockId)
    : undefined;

  const displayIcon = activeBlock?.icon ?? activeProfile.icon;
  const displayLabel = activeBlock
    ? activeBlock.kind === 'widget' ? 'Widget · Preview' : 'Shared Block · Preview'
    : (appName || activeProfile.experienceLabel || 'Dealer Experience');
  const displayCompany = activeBlock
    ? activeBlock.title
    : (companyName || activeProfile.companyName);

  return (
    <Popover className="relative hidden lg:block">
      <PopoverButton className="flex items-center gap-2 text-left px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer outline-none group">
        {showExperienceIcon && (
          <span
            className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-base"
            aria-hidden="true"
          >
            {displayIcon}
          </span>
        )}
        <span className="flex flex-col items-start">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none">
            {displayLabel}
          </span>
          <span className="text-sm font-bold text-foreground leading-tight flex items-center gap-1 mt-0.5">
            {displayCompany}
          </span>
        </span>
      </PopoverButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel className="absolute left-0 top-full mt-2 w-80 py-2 rounded-xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl z-[200] max-h-[70vh] flex flex-col">
          {(() => {
          const featureModules = profiles.filter(p => p.experienceKind === 'feature-module');
          const tourProfiles = profiles.filter(p => p.experienceKind !== 'feature-module');
          const renderProfile = (profile: typeof profiles[number]) => (
            <PopoverButton
              as="button"
              key={profile.id}
              onClick={() => {
                const url = new URL(window.location.href);
                if (url.searchParams.has('block')) {
                  url.searchParams.delete('block');
                  window.history.pushState({}, '', url.toString());
                  window.dispatchEvent(new CustomEvent('block:change'));
                }
                switchProfile(profile.id);
              }}
              className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-left"
            >
              <span className="text-lg shrink-0 leading-tight pt-0.5">{profile.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {profile.title ?? profile.name}
                </p>
                {profile.subtitle && (
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                    {profile.subtitle}
                  </p>
                )}
              </div>
              {!activeBlockId && activeProfile.id === profile.id && (
                <CheckIcon className="w-4 h-4 text-primary shrink-0 mt-1" />
              )}
            </PopoverButton>
          );
          return (
          <div className="overflow-y-auto flex-1 min-h-0">
            {/* SHARED BUILDING BLOCKS — first (Diego request 2026-07-17) */}
            <div className="px-3 py-2 border-b border-border shrink-0 sticky top-0 bg-card/95 backdrop-blur-xl z-10">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Shared Building Blocks
              </p>
            </div>
            {SHARED_BLOCKS.filter(b => b.kind === 'shared-block').map(block => (
              <PopoverButton
                as="button"
                key={block.id}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('block', block.id);
                  window.history.pushState({}, '', url.toString());
                  window.dispatchEvent(new CustomEvent('block:change'));
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors text-left"
              >
                <span className="text-base shrink-0">{block.icon}</span>
                <p className="flex-1 text-sm text-foreground truncate">{block.title}</p>
                {activeBlockId === block.id && (
                  <CheckIcon className="w-4 h-4 text-primary shrink-0" />
                )}
              </PopoverButton>
            ))}

            {/* FEATURE MODULES */}
            <div className="px-3 py-2 border-y border-border shrink-0 sticky top-0 bg-card/95 backdrop-blur-xl z-10 mt-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Feature Modules
              </p>
            </div>
            {featureModules.map(renderProfile)}

            {/* TOUR PROFILES */}
            <div className="px-3 py-2 border-y border-border shrink-0 sticky top-0 bg-card/95 backdrop-blur-xl z-10 mt-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Tour Profiles
              </p>
            </div>
            {tourProfiles.map(renderProfile)}

            {/* WIDGETS — last (Diego request 2026-07-21) */}
            <div className="px-3 py-2 border-y border-border shrink-0 sticky top-0 bg-card/95 backdrop-blur-xl z-10 mt-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Widgets
              </p>
            </div>
            {SHARED_BLOCKS.filter(b => b.kind === 'widget').map(block => (
              <PopoverButton
                as="button"
                key={block.id}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('block', block.id);
                  window.history.pushState({}, '', url.toString());
                  window.dispatchEvent(new CustomEvent('block:change'));
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors text-left"
              >
                <span className="text-base shrink-0">{block.icon}</span>
                <p className="flex-1 text-sm text-foreground truncate">{block.title}</p>
                {activeBlockId === block.id && (
                  <CheckIcon className="w-4 h-4 text-primary shrink-0" />
                )}
              </PopoverButton>
            ))}
          </div>
          );
          })()}
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
