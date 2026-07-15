import { Check, X } from 'lucide-react';
import { CopyButton } from './CopyButton';

export function ShadowsView() {


  const shadowLevels = [
    {
      primitive: 'sm',
      token: 'shadow-sm',
      value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      darkValue: '0 1px 2px 0 rgba(255, 255, 255, 0.1)',
      usage: 'Subtle elevation for cards, dropdowns, tooltips',
      elevation: '1dp',
      zIndex: 'z-10',
    },
    {
      primitive: 'md',
      token: 'shadow-md',
      value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      darkValue: '0 4px 6px -1px rgba(255, 255, 255, 0.15), 0 2px 4px -2px rgba(255, 255, 255, 0.15)',
      usage: 'Standard elevation for cards, popovers, floating elements',
      elevation: '4dp',
      zIndex: 'z-20',
      primary: true,
    },
    {
      primitive: 'lg',
      token: 'shadow-lg',
      value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      darkValue: '0 10px 15px -3px rgba(255, 255, 255, 0.2), 0 4px 6px -4px rgba(255, 255, 255, 0.2)',
      usage: 'Higher elevation for modals, slide-overs, overlays',
      elevation: '8dp',
      zIndex: 'z-30',
      primary: true,
    },
    {
      primitive: 'xl',
      token: 'shadow-xl',
      value: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      darkValue: '0 20px 25px -5px rgba(255, 255, 255, 0.25), 0 8px 10px -6px rgba(255, 255, 255, 0.25)',
      usage: 'Maximum elevation for command palettes, critical dialogs',
      elevation: '16dp',
      zIndex: 'z-50',
    },
    {
      primitive: 'glow-sm',
      token: 'shadow-glow-sm',
      value: 'none',
      darkValue: '0 0 10px rgba(255, 255, 255, 0.05)',
      usage: 'Subtle highlight for small interactive elements',
      elevation: 'Special',
      zIndex: 'z-10',
    },
    {
      primitive: 'glow-md',
      token: 'shadow-glow-md',
      value: 'none',
      darkValue: '0 0 20px rgba(255, 255, 255, 0.15)',
      usage: 'Standard atmospheric glow for cards/surfaces',
      elevation: 'Special',
      zIndex: 'z-10',
      primary: true,
    },
    {
      primitive: 'glow-lg',
      token: 'shadow-glow-lg',
      value: 'none',
      darkValue: '0 0 30px rgba(255, 255, 255, 0.25)',
      usage: 'Strong backlight for active or modal elements',
      elevation: 'Special',
      zIndex: 'z-20',
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Elevation & Shadows
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            4-level shadow system with z-index tokens for consistent depth and elevation hierarchy.
          </p>
        </div>

      </div>


      {/* Shadow Scale */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Shadow Scale
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Progressive elevation levels based on Material Design principles. Medium (md) and Large (lg) are primary choices.
        </p>

        <div className="space-y-6">
          {shadowLevels.map((shadow) => (
            <div
              key={shadow.primitive}
              className={`bg-white dark:bg-zinc-900 border rounded-md p-6 ${shadow.primary
                ? 'border-zinc-800 dark:border-zinc-600'
                : 'border-zinc-200 dark:border-zinc-800'
                }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Info Section */}
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Primitive
                      </div>
                      <code className="text-lg font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                        {shadow.primitive}
                      </code>
                    </div>

                    <div className="ml-4">
                      <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Token
                      </div>
                      <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded">
                        {shadow.token}
                      </code>
                    </div>

                    {shadow.primary && (
                      <span className="ml-auto text-xs font-semibold text-zinc-800 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">
                        Primary
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Usage
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {shadow.usage}
                      </p>
                    </div>

                    <div className="flex gap-6">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                          Elevation
                        </div>
                        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                          {shadow.elevation}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                          Z-Index
                        </div>
                        <code className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                          {shadow.zIndex}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <CopyButton
                    formats={[
                      { label: 'CSS Light', value: `box-shadow: ${shadow.value};`, description: 'Light mode CSS' },
                      { label: 'CSS Dark', value: `box-shadow: ${shadow.darkValue};`, description: 'Dark mode CSS' },
                      { label: 'Token', value: shadow.token, description: 'Design system token' },
                      { label: 'CSS Class', value: shadow.token, description: 'Tailwind CSS class' },
                      { label: 'Z-Index', value: shadow.zIndex, description: 'Z-index token' },
                    ]}
                    size="sm"
                  />
                </div>

                {/* Visual Example */}
                <div className="lg:col-span-7">
                  <div className="bg-zinc-100 dark:bg-zinc-950 rounded-lg p-12 flex items-center justify-center">
                    <div
                      className={`w-56 h-32 bg-white dark:bg-zinc-800 rounded-md flex items-center justify-center ${shadow.token}`}
                    >
                      <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                        {shadow.elevation}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CSS Values */}
              <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 mb-2">
                      Light Mode
                    </div>
                    <code className="text-xs font-mono bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 p-3 rounded block overflow-x-auto">
                      box-shadow: {shadow.value};
                    </code>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 mb-2">
                      Dark Mode
                    </div>
                    <code className="text-xs font-mono bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 p-3 rounded block overflow-x-auto">
                      box-shadow: {shadow.darkValue};
                    </code>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison View */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Side-by-Side Comparison
        </h2>
        <div className="bg-zinc-100 dark:bg-zinc-950 rounded-lg p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {shadowLevels.map((shadow) => (
              <div key={shadow.primitive} className="text-center">
                <div className={`w-full h-40 bg-white dark:bg-zinc-800 rounded-md mb-4 flex items-center justify-center ${shadow.token}`}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                      {shadow.primitive.toUpperCase()}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {shadow.elevation}
                    </div>
                  </div>
                </div>
                <code className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  {shadow.token}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Component Applications */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Component Applications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: 'Data Card', shadow: 'shadow-sm dark:shadow-glow-sm', description: 'Subtle shadow for content cards' },
            { name: 'Dropdown Menu', shadow: 'shadow-md dark:shadow-glow-md', description: 'Medium shadow for floating menus' },
            { name: 'Modal Dialog', shadow: 'shadow-lg dark:shadow-glow-lg', description: 'Large shadow for modal overlays' },
            { name: 'Command Palette', shadow: 'shadow-xl dark:shadow-glow-lg', description: 'Extra large for critical UI' },
          ].map((example, index) => (
            <div key={index} className="bg-zinc-100 dark:bg-zinc-950 rounded-lg p-8">
              <div className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 mb-4">
                {example.name}
              </div>
              <div className={`bg-white dark:bg-zinc-800 rounded-md p-6 ${example.shadow} mb-3`}>
                <div className="h-20 flex items-center justify-center">
                  <code className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                    {example.shadow.split(' ')[0]}
                  </code>
                </div>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {example.description}
              </p>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-8 mb-4">
          Dark Mode Glows
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Atmospheric lighting effects used in dark mode to separate layers without heavy shadows.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Interactive Element', shadow: 'shadow-glow-sm', description: 'Subtle highlight for buttons/inputs' },
            { name: 'Card / Surface', shadow: 'shadow-glow-md', description: 'Standard ambient glow for surfaces' },
            { name: 'Active / Modal', shadow: 'shadow-glow-lg', description: 'Strong backlight for focused UI' },
          ].map((example, index) => (
            <div key={index} className="bg-zinc-100 dark:bg-zinc-950 rounded-lg p-8">
              <div className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 mb-4">
                {example.name}
              </div>
              <div className={`bg-white dark:bg-zinc-800 rounded-md p-6 ${example.shadow} mb-3 border border-zinc-200 dark:border-zinc-700`}>
                <div className="h-20 flex items-center justify-center">
                  <code className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                    {example.shadow}
                  </code>
                </div>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {example.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stacking Context */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Elevation Hierarchy
        </h2>
        <div className="bg-zinc-100 dark:bg-zinc-950 rounded-lg p-12">
          <div className="relative h-96">
            {/* Base Layer - sm */}
            <div className="absolute left-0 top-0 w-64 h-48 bg-white dark:bg-zinc-800 rounded-md shadow-sm dark:shadow-glow-sm p-6 z-10 transition-shadow duration-300">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Base Layer
              </div>
              <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                shadow-sm
              </code>
            </div>

            {/* Mid Layer - md */}
            <div className="absolute left-20 top-16 w-64 h-48 bg-white dark:bg-zinc-800 rounded-md shadow-md dark:shadow-glow-md p-6 z-20 transition-shadow duration-300">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Card Layer
              </div>
              <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                shadow-md
              </code>
            </div>

            {/* High Layer - lg */}
            <div className="absolute left-40 top-32 w-64 h-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg dark:shadow-glow-lg p-6 z-30 transition-shadow duration-300">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Modal Layer
              </div>
              <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                shadow-lg
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Z-Index Scale */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Z-Index Tokens
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Standardized z-index values that correspond to elevation levels for proper stacking order.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { primitive: '10', token: 'z-index-base', usage: 'Base elevated elements', shadow: 'shadow-sm' },
            { primitive: '20', token: 'z-index-dropdown', usage: 'Dropdowns, popovers', shadow: 'shadow-md', primary: true },
            { primitive: '30', token: 'z-index-modal', usage: 'Modals, overlays', shadow: 'shadow-lg', primary: true },
            { primitive: '50', token: 'z-index-critical', usage: 'Critical UI, toasts', shadow: 'shadow-xl' },
          ].map((zIndex) => (
            <div
              key={zIndex.primitive}
              className={`bg-white dark:bg-zinc-900 border rounded-md p-5 ${zIndex.primary
                ? 'border-zinc-800 dark:border-zinc-600'
                : 'border-zinc-200 dark:border-zinc-800'
                }`}
            >
              <div className="mb-3">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                  Value
                </div>
                <code className="text-xl font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                  {zIndex.primitive}
                </code>
              </div>

              <div className="mb-3">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                  Token
                </div>
                <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded">
                  {zIndex.token}
                </code>
              </div>

              <div className="mb-3">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                  Pairs With
                </div>
                <code className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  {zIndex.shadow}
                </code>
              </div>

              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                {zIndex.usage}
              </div>

              {/* Copy Button */}
              <CopyButton
                formats={[
                  { label: 'Value', value: zIndex.primitive, description: 'Z-index value' },
                  { label: 'Token', value: zIndex.token, description: 'Design system token' },
                  { label: 'Shadow', value: zIndex.shadow, description: 'Paired shadow' },
                ]}
                size="sm"
              />

              {zIndex.primary && (
                <span className="inline-block mt-3 text-xs font-semibold text-zinc-800 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">
                  Primary
                </span>
              )}
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
                <span>Use shadow-md for standard cards and floating elements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Apply stronger shadows to elements appearing "closer" to the user</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Pair shadows with corresponding z-index values for proper stacking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Use darker shadow values in dark mode for better contrast</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Reserve shadow-xl for critical UI like command palettes</span>
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
                <span>Don't apply multiple shadow levels to nested elements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Avoid shadows on elements that don't need elevation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't create custom shadow values outside the defined scale</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Avoid using shadow-xl for standard UI components</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't use shadows without considering z-index stacking context</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}