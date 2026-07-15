import { Check, X } from 'lucide-react';
import { CopyButton } from './CopyButton';

export function SpacingView() {


  const spacingScale = [
    { primitive: '0', token: 'spacing-0', value: '0px', usage: 'No spacing, reset margins/padding', rem: '0rem' },
    { primitive: '1', token: 'spacing-1', value: '4px', usage: 'Minimal spacing, icon gaps', rem: '0.25rem' },
    { primitive: '2', token: 'spacing-2', value: '8px', usage: 'Tight spacing, compact layouts', rem: '0.5rem', primary: true },
    { primitive: '3', token: 'spacing-3', value: '12px', usage: 'Small spacing, button padding', rem: '0.75rem', primary: true },
    { primitive: '4', token: 'spacing-4', value: '16px', usage: 'Base spacing, card padding', rem: '1rem', primary: true },
    { primitive: '5', token: 'spacing-5', value: '20px', usage: 'Medium spacing, section gaps', rem: '1.25rem' },
    { primitive: '6', token: 'spacing-6', value: '24px', usage: 'Large spacing, component margins', rem: '1.5rem', primary: true },
    { primitive: '8', token: 'spacing-8', value: '32px', usage: 'Extra large spacing, layout sections', rem: '2rem', primary: true },
    { primitive: '10', token: 'spacing-10', value: '40px', usage: 'Section dividers, hero spacing', rem: '2.5rem' },
    { primitive: '12', token: 'spacing-12', value: '48px', usage: 'Major sections, page padding', rem: '3rem', primary: true },
    { primitive: '16', token: 'spacing-16', value: '64px', usage: 'Large page sections', rem: '4rem' },
    { primitive: '20', token: 'spacing-20', value: '80px', usage: 'Hero sections, major layouts', rem: '5rem' },
  ];

  const gridColumns = [
    { primitive: '12-col', token: 'grid-columns-12', value: 'repeat(12, 1fr)', usage: 'Default grid system', primary: true },
    { primitive: '6-col', token: 'grid-columns-6', value: 'repeat(6, 1fr)', usage: 'Two-column layouts', primary: true },
    { primitive: '4-col', token: 'grid-columns-4', value: 'repeat(4, 1fr)', usage: 'Card grids, three-column' },
    { primitive: '3-col', token: 'grid-columns-3', value: 'repeat(3, 1fr)', usage: 'Basic card layouts' },
    { primitive: '2-col', token: 'grid-columns-2', value: 'repeat(2, 1fr)', usage: 'Split views, form layouts' },
  ];

  const containerSizes = [
    { primitive: 'sm', token: 'container-sm', value: '640px', usage: 'Small content, forms', rem: '40rem' },
    { primitive: 'md', token: 'container-md', value: '768px', usage: 'Medium content, articles', rem: '48rem' },
    { primitive: 'lg', token: 'container-lg', value: '1024px', usage: 'Large content, dashboards', rem: '64rem', primary: true },
    { primitive: 'xl', token: 'container-xl', value: '1280px', usage: 'Extra large content, wide layouts', rem: '80rem', primary: true },
    { primitive: '2xl', token: 'container-2xl', value: '1536px', usage: 'Maximum width content', rem: '96rem' },
  ];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Spacing & Grid
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Base-8 spacing system with grid layout tokens for consistent spacing and structure.
          </p>
        </div>

      </div>



      {/* Spacing Scale */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Spacing Scale
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          12-step scale based on 4px (0.25rem) increments. Primary values (2, 3, 4, 6, 8, 12) cover most use cases.
        </p>

        {/* Preview Container */}
        <div>
          <div className="rounded-xl p-6 transition-colors duration-300 bg-zinc-50 dark:bg-zinc-950">
            <div className="space-y-3">
              {spacingScale.map((space) => (
                <div
                  key={space.primitive}
                  className={`bg-white dark:bg-zinc-800 border rounded-md p-5 transition-all duration-300 ${space.primary
                    ? 'border-zinc-300 dark:border-zinc-600'
                    : 'border-zinc-200 dark:border-zinc-700'
                    }`}
                >
                  <div className="flex items-center gap-6">
                    {/* Visual Bar */}
                    <div className="w-32 h-12 bg-zinc-100 dark:bg-zinc-900/80 rounded flex items-center p-2 border border-zinc-200 dark:border-zinc-700">
                      <div
                        className="h-full bg-zinc-800 dark:bg-zinc-300 rounded"
                        style={{ width: space.value }}
                      />
                    </div>

                    {/* Primitive */}
                    <div className="w-16">
                      <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Primitive
                      </div>
                      <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                        {space.primitive}
                      </code>
                    </div>

                    {/* Token */}
                    <div className="w-40">
                      <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Token
                      </div>
                      <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded border border-transparent dark:border-zinc-700">
                        {space.token}
                      </code>
                    </div>

                    {/* Value */}
                    <div className="w-32">
                      <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Value
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-300">
                        {space.value} / {space.rem}
                      </div>
                    </div>

                    {/* Usage */}
                    <div className="flex-1">
                      <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Usage
                      </div>
                      <span className="text-sm text-zinc-600 dark:text-zinc-300">{space.usage}</span>
                    </div>

                    {/* Copy Button */}
                    <div className="flex-shrink-0">
                      <CopyButton
                        formats={[
                          { label: 'PX', value: space.value, description: 'Pixel value' },
                          { label: 'REM', value: space.rem, description: 'REM value' },
                          { label: 'Token', value: space.token, description: 'Design system token' },
                          { label: 'CSS Class', value: `p-${space.primitive}`, description: 'Tailwind padding class' },
                          { label: 'Primitive', value: space.primitive, description: 'Primitive value' },
                        ]}
                        size="sm"
                      />
                    </div>

                    {/* Badge */}
                    {space.primary && (
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-600 px-2 py-1 rounded flex-shrink-0 border border-transparent dark:border-zinc-500">
                        Primary
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Spacing Examples */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Spacing Examples
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Padding Example */}
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 mb-3">
              Padding (spacing-4)
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-md p-1">
              <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded p-4">
                <div className="bg-zinc-800 dark:bg-zinc-600 rounded h-16 flex items-center justify-center text-zinc-50 text-sm">
                  Content
                </div>
              </div>
            </div>
            <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-2 block">
              p-4 (16px padding)
            </code>
          </div>

          {/* Gap Example */}
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 mb-3">
              Gap (spacing-3)
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-4">
              <div className="flex gap-3">
                <div className="flex-1 bg-zinc-800 dark:bg-zinc-600 rounded h-16" />
                <div className="flex-1 bg-zinc-800 dark:bg-zinc-600 rounded h-16" />
                <div className="flex-1 bg-zinc-800 dark:bg-zinc-600 rounded h-16" />
              </div>
            </div>
            <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-2 block">
              gap-3 (12px gap)
            </code>
          </div>

          {/* Margin Example */}
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 mb-3">
              Margin (spacing-6)
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-md p-1">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2">
                <div className="bg-zinc-800 dark:bg-zinc-600 rounded h-12 mb-6" />
                <div className="bg-zinc-800 dark:bg-zinc-600 rounded h-12" />
              </div>
            </div>
            <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-2 block">
              mb-6 (24px margin)
            </code>
          </div>
        </div>
      </div>

      {/* Grid Columns */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Grid Columns
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          CSS Grid column configurations for responsive layouts. 12-column and 6-column are primary choices.
        </p>

        <div className="space-y-4">
          {gridColumns.map((grid) => (
            <div
              key={grid.primitive}
              className={`bg-white dark:bg-zinc-900 border rounded-md p-5 ${grid.primary
                ? 'border-zinc-800 dark:border-zinc-600'
                : 'border-zinc-200 dark:border-zinc-800'
                }`}
            >
              <div className="flex items-center gap-6 mb-4">
                {/* Primitive */}
                <div className="w-24">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Primitive
                  </div>
                  <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                    {grid.primitive}
                  </code>
                </div>

                {/* Token */}
                <div className="w-48">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Token
                  </div>
                  <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded border border-transparent dark:border-zinc-700">
                    {grid.token}
                  </code>
                </div>

                {/* Usage */}
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Usage
                  </div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">{grid.usage}</span>
                </div>

                {/* Copy Button */}
                <div className="flex-shrink-0">
                  <CopyButton
                    formats={[
                      { label: 'CSS Value', value: grid.value, description: 'CSS grid-template-columns value' },
                      { label: 'Token', value: grid.token, description: 'Design system token' },
                      { label: 'Primitive', value: grid.primitive, description: 'Primitive value' },
                    ]}
                    size="sm"
                  />
                </div>

                {/* Badge */}
                {grid.primary && (
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-600 px-2 py-1 rounded border border-transparent dark:border-zinc-500">
                    Primary
                  </span>
                )}
              </div>

              {/* Visual Grid */}
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: grid.value }}
              >
                {Array.from({ length: parseInt(grid.primitive) }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-zinc-200 dark:bg-zinc-800 rounded h-12 flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Container Widths */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Container Widths
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Maximum width tokens for content containers. Large (1024px) and Extra Large (1280px) are most common.
        </p>

        <div className="space-y-3">
          {containerSizes.map((container) => (
            <div
              key={container.primitive}
              className={`bg-white dark:bg-zinc-900 border rounded-md p-5 ${container.primary
                ? 'border-zinc-800 dark:border-zinc-600'
                : 'border-zinc-200 dark:border-zinc-800'
                }`}
            >
              <div className="flex items-center gap-6">
                {/* Primitive */}
                <div className="w-16">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Size
                  </div>
                  <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                    {container.primitive}
                  </code>
                </div>

                {/* Token */}
                <div className="w-48">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Token
                  </div>
                  <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded">
                    {container.token}
                  </code>
                </div>

                {/* Value */}
                <div className="w-32">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Max Width
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {container.value} / {container.rem}
                  </div>
                </div>

                {/* Usage */}
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Usage
                  </div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{container.usage}</span>
                </div>

                {/* Copy Button */}
                <div className="flex-shrink-0">
                  <CopyButton
                    formats={[
                      { label: 'PX', value: container.value, description: 'Pixel value' },
                      { label: 'REM', value: container.rem, description: 'REM value' },
                      { label: 'Token', value: container.token, description: 'Design system token' },
                      { label: 'CSS Class', value: `max-w-${container.primitive}`, description: 'Tailwind max-width class' },
                    ]}
                    size="sm"
                  />
                </div>

                {/* Badge */}
                {container.primary && (
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">
                    Primary
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Guidelines */}
      <div>
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
                <span>Use spacing-4 (16px) as the default padding for cards and containers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Apply spacing-6 (24px) for section margins and component spacing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Use 12-column grid for complex layouts and 6-column for simpler ones</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Set max-width with container-lg (1024px) or container-xl (1280px)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Use consistent gap values (spacing-3 or spacing-4) within components</span>
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
                <span>Don't create custom spacing values outside the defined scale</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Avoid using odd number spacing (5, 7, 9, 11) unless necessary</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't mix different gap values within the same component grid</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Avoid using spacing-12 or larger for component internal padding</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't use container widths for small components or cards</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}