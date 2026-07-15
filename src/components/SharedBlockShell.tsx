import { XMarkIcon } from '@heroicons/react/24/outline';
import type { SharedBlockEntry } from '../config/sharedBlocks';

interface SharedBlockShellProps {
  block: SharedBlockEntry;
  onExit: () => void;
}

/**
 * Minimal shell used when the user opens a shared building block or widget
 * from the navbar selector. No tour, no per-profile navigation, no role
 * switcher — just a compact header identifying the block + an exit button
 * back to the currently active experience.
 */
export default function SharedBlockShell({ block, onExit }: SharedBlockShellProps) {
  const kindLabel = block.kind === 'widget' ? 'Widget' : 'Shared Building Block';
  const Component = block.component;

  return (
    <div className="min-h-screen bg-background">
      {/* Header banner */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl shrink-0">{block.icon}</span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                {kindLabel}
              </p>
              <h1 className="text-base font-semibold text-foreground leading-tight truncate">
                {block.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {block.usedByExperiences && block.usedByExperiences.length > 0 && (
              <span className="hidden md:inline-flex text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Used by · {block.usedByExperiences.join(' · ')}
              </span>
            )}
            <button
              onClick={onExit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Exit block preview"
            >
              <XMarkIcon className="w-4 h-4" />
              Exit
            </button>
          </div>
        </div>
        {block.description && (
          <div className="max-w-7xl mx-auto px-6 pb-3">
            <p className="text-xs text-muted-foreground">{block.description}</p>
          </div>
        )}
      </div>

      {/* Block body */}
      <div>
        <Component />
      </div>
    </div>
  );
}
