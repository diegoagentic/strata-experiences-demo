import { Badge } from './ui/badge';
import { ProjectBadgesDemo } from './demos/ProjectBadgesDemo';
import { CodeViewer } from './CodeViewer';
import { Check, X } from 'lucide-react';

export function BadgesView() {
  const badgeColors = [
    'brand', 'zinc', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald',
    'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'
  ];

  const badgeReact = `import { Badge } from "@/components/ui/badge"

export function BadgeDemo() {
  return (
    <div className="flex gap-2">
      <Badge color="emerald">Success</Badge>
      <Badge variant="soft" color="blue">Info</Badge>
      <Badge variant="outline" color="amber">Warning</Badge>
    </div>
  )
}`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Badges
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Small status indicators available in every color of the Catalyst palette.
        </p>
      </div>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Color Palette
        </h2>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 mb-6">
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">Solid</h3>
              <div className="flex flex-wrap gap-3">
                {badgeColors.map(color => (
                  <Badge key={color} color={color as any} variant="solid">{color}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">Soft</h3>
              <div className="flex flex-wrap gap-3">
                {badgeColors.map(color => (
                  <Badge key={color} color={color as any} variant="soft">{color}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">Outline</h3>
              <div className="flex flex-wrap gap-3">
                {badgeColors.map(color => (
                  <Badge key={color} color={color as any} variant="outline">{color}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <CodeViewer
          title="Badge Demo"
          react={badgeReact}
          html={`<span class="bg-emerald-600 px-2.5 py-0.5 rounded-full">...</span>`}
          css={`.badge { border-radius: 9999px; }`}
          prompt="Generate a set of badges showcasing the full Catalyst color palette."
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Do's</h3>
          </div>
          <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
            <li>• Use "soft" variants for secondary information to avoid visual noise.</li>
            <li>• Pair with icons for quick status identification.</li>
          </ul>
        </div>
      </section>

      {/* Project Examples */}
      <section className="space-y-4 pt-12 border-t border-zinc-200 dark:border-zinc-800 mt-12">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Project Examples (Custom)
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Real-world usage patterns extracted from the Catalyst application (e.g., Table Status Pills).
        </p>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <ProjectBadgesDemo />
        </div>
      </section>
    </div >
  );
}