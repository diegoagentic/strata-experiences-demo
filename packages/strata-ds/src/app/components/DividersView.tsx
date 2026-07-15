import { Check, X } from 'lucide-react';
import { CodeViewer } from './CodeViewer';
import { Divider } from './ui/divider';

export function DividersView() {
  // Code examples for Basic Divider
  const basicDividerReact = `import { Divider } from "@/components/ui/divider"

export function DividerDemo() {
  return (
    <>
      <p>Content above</p>
      <Divider />
      <p>Content below</p>
    </>
  )
}`;

  const basicDividerHTML = `<hr class="w-full border-t border-zinc-950/10 dark:border-white/10" />`;

  const basicDividerCSS = `.divider {
  width: 100%;
  border-top: 1px solid var(--color-zinc-950-10);
}`;

  const basicDividerPrompt = `# AI PROMPT: Divider Component
## CONTEXT
Subtle horizontal separator using Zinc primitives.

## API
\`\`\`tsx
<Divider soft />
\`\`\`

## SPECS
- Border: 1px border-t
- Color: zinc-950/10 (light) / white/10 (dark)
- Soft variant: zinc-950/5 / white/5`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Dividers
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Horizontal separators for content organization and visual hierarchy.
        </p>
      </div>

      {/* Basic Dividers */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Basic Usage
        </h2>

        <div className="space-y-6 mb-8">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Content above the standard divider
            </p>
            <Divider />
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-4">
              Content below the standard divider
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Content above the soft divider
            </p>
            <Divider soft />
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-4">
              Content below the soft divider
            </p>
          </div>
        </div>

        <CodeViewer
          title="Divider"
          react={basicDividerReact}
          html={basicDividerHTML}
          css={basicDividerCSS}
          prompt={basicDividerPrompt}
          enableFigmaExport={true}
        />
      </div>

      {/* Usage Guidelines */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Usage Guidelines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Do's */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                Do's
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-emerald-800 dark:text-emerald-200">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Use dividers to separate distinct sections of content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Prefer 'soft' dividers for subtle grouping within a section</span>
              </li>
            </ul>
          </div>

          {/* Don'ts */}
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-red-600 dark:bg-red-500 flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                Don'ts
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-red-800 dark:text-red-200">
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't stack multiple dividers sequentially</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Avoid using dividers to create complex borders</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}