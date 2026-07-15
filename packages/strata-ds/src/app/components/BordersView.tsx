import { Check, X } from 'lucide-react';
import { CopyButton } from './CopyButton';

export function BordersView() {


  // Helper function to convert HEX to RGB
  const hexToRgb = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Helper function to convert HEX to HSL
  const hexToHsl = (hex: string): string => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const borderWidths = [
    { primitive: '0', token: 'border-width-0', value: '0px', usage: 'No border, reset styles', className: 'border-0' },
    { primitive: '1', token: 'border-width-1', value: '1px', usage: 'Default borders, cards, dividers', className: 'border', primary: true },
    { primitive: '2', token: 'border-width-2', value: '2px', usage: 'Emphasized borders, focus states', className: 'border-2', primary: true },
    { primitive: '4', token: 'border-width-4', value: '4px', usage: 'Strong emphasis, decorative borders', className: 'border-4' },
    { primitive: '8', token: 'border-width-8', value: '8px', usage: 'Heavy borders, visual indicators', className: 'border-8' },
  ];

  const borderRadius = [
    { primitive: 'none', token: 'radius-none', value: '0px', usage: 'No rounding, sharp corners', className: 'rounded-none', visual: 0 },
    { primitive: 'sm', token: 'radius-sm', value: '2px', usage: 'Minimal rounding, tight elements', className: 'rounded-sm', visual: 2 },
    { primitive: 'base', token: 'radius-base', value: '4px', usage: 'Default rounding, badges', className: 'rounded', visual: 4, primary: true },
    { primitive: 'md', token: 'radius-md', value: '6px', usage: 'Standard rounding, cards, buttons', className: 'rounded-md', visual: 6, primary: true },
    { primitive: 'lg', token: 'radius-lg', value: '8px', usage: 'Large rounding, containers', className: 'rounded-lg', visual: 8, primary: true },
    { primitive: 'xl', token: 'radius-xl', value: '12px', usage: 'Extra large rounding, modals', className: 'rounded-xl', visual: 12 },
    { primitive: '2xl', token: 'radius-2xl', value: '16px', usage: 'Very large rounding, overlays', className: 'rounded-2xl', visual: 16 },
    { primitive: '3xl', token: 'radius-3xl', value: '24px', usage: 'Maximum rounding, special elements', className: 'rounded-3xl', visual: 24 },
    { primitive: 'full', token: 'radius-full', value: '9999px', usage: 'Circular, pills, avatars', className: 'rounded-full', visual: 9999, primary: true },
  ];

  const borderColors = [
    {
      primitive: 'neutral-200',
      token: 'border-default-light',
      hex: '#e4e4e7',
      usage: 'Default border (light mode)',
      primary: true
    },
    {
      primitive: 'neutral-300',
      token: 'border-hover-light',
      hex: '#d4d4d8',
      usage: 'Hover border (light mode)'
    },
    {
      primitive: 'neutral-700',
      token: 'border-hover-dark',
      hex: '#3f3f46',
      usage: 'Hover border (dark mode)'
    },
    {
      primitive: 'neutral-800',
      token: 'border-default-dark',
      hex: '#27272a',
      usage: 'Default border (dark mode)',
      primary: true
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Borders & Radius
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Border width, radius, and color tokens for consistent edge treatment and shape definition.
          </p>
        </div>

      </div>


      {/* Border Widths */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Border Width
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          5-step scale for border thickness. 1px and 2px are primary choices for most UI elements.
        </p>

        <div className="space-y-3">
          {borderWidths.map((border) => (
            <div
              key={border.primitive}
              className={`bg-white dark:bg-zinc-900 border rounded-md p-5 flex items-center gap-6 ${border.primary
                ? 'border-zinc-800 dark:border-zinc-600'
                : 'border-zinc-200 dark:border-zinc-800'
                }`}
            >
              {/* Visual Example */}
              <div className="w-32 h-16 bg-zinc-50 dark:bg-zinc-800 rounded flex items-center justify-center">
                <div
                  className="w-20 h-12 bg-zinc-100 dark:bg-zinc-900 rounded"
                  style={{
                    border: `${border.value} solid #27272a`,
                  }}
                />
              </div>

              {/* Primitive */}
              <div className="w-16">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                  Primitive
                </div>
                <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                  {border.primitive}
                </code>
              </div>

              {/* Token */}
              <div className="w-48">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                  Token
                </div>
                <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded">
                  {border.token}
                </code>
              </div>

              {/* Value */}
              <div className="w-24">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                  Value
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{border.value}</span>
              </div>

              {/* Usage */}
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                  Usage
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{border.usage}</span>
              </div>

              {/* Copy Button */}
              <div className="flex-shrink-0">
                <CopyButton
                  formats={[
                    { label: 'PX', value: border.value, description: 'Pixel value' },
                    { label: 'Token', value: border.token, description: 'Design system token' },
                    { label: 'CSS Class', value: border.className, description: 'Tailwind CSS class' },
                    { label: 'Primitive', value: border.primitive, description: 'Primitive value' },
                  ]}
                  size="sm"
                />
              </div>

              {/* Badge */}
              {border.primary && (
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Border Radius
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          9-step scale for corner rounding. Base (4px), Medium (6px), Large (8px), and Full are primary options.
        </p>

        <div className="space-y-3">
          {borderRadius.map((radius) => (
            <div
              key={radius.primitive}
              className={`bg-white dark:bg-zinc-900 border rounded-md p-5 ${radius.primary
                ? 'border-zinc-800 dark:border-zinc-600'
                : 'border-zinc-200 dark:border-zinc-800'
                }`}
            >
              <div className="flex items-center gap-6">
                {/* Visual Example */}
                <div className="w-32 h-16 bg-zinc-50 dark:bg-zinc-800 rounded flex items-center justify-center">
                  <div
                    className="w-16 h-12 bg-zinc-800 dark:bg-zinc-600"
                    style={{ borderRadius: radius.value }}
                  />
                </div>

                {/* Primitive */}
                <div className="w-20">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Primitive
                  </div>
                  <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                    {radius.primitive}
                  </code>
                </div>

                {/* Token */}
                <div className="w-48">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Token
                  </div>
                  <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded">
                    {radius.token}
                  </code>
                </div>

                {/* Value */}
                <div className="w-24">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Value
                  </div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{radius.value}</span>
                </div>

                {/* Usage */}
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Usage
                  </div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{radius.usage}</span>
                </div>

                {/* Copy Button */}
                <div className="flex-shrink-0">
                  <CopyButton
                    formats={[
                      { label: 'PX', value: radius.value, description: 'Pixel value' },
                      { label: 'Token', value: radius.token, description: 'Design system token' },
                      { label: 'CSS Class', value: radius.className, description: 'Tailwind CSS class' },
                      { label: 'Primitive', value: radius.primitive, description: 'Primitive value' },
                    ]}
                    size="sm"
                  />
                </div>

                {/* Badge */}
                {radius.primary && (
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded flex-shrink-0">
                    Primary
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Border Colors */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Border Colors
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Semantic border color tokens from the neutral palette for mode-aware boundaries.
        </p>

        <div className="space-y-3">
          {borderColors.map((color) => (
            <div
              key={color.token}
              className={`bg-white dark:bg-zinc-900 border rounded-md p-5 ${color.primary
                ? 'border-zinc-800 dark:border-zinc-600'
                : 'border-zinc-200 dark:border-zinc-800'
                }`}
            >
              {/* Row 1: Visual + Main Info */}
              <div className="flex items-center gap-6 mb-3">
                {/* Visual Swatch */}
                <div className="w-24 h-16 rounded border-4" style={{ borderColor: color.hex }} />

                {/* Primitive */}
                <div className="w-32">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Primitive
                  </div>
                  <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                    {color.primitive}
                  </code>
                </div>

                {/* Token */}
                <div className="w-56">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Token
                  </div>
                  <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded">
                    {color.token}
                  </code>
                </div>

                {/* Hex */}
                <div className="w-28">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Hex
                  </div>
                  <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400">{color.hex}</span>
                </div>

                {/* Copy Button */}
                <div className="flex-shrink-0">
                  <CopyButton
                    formats={[
                      { label: 'HEX', value: color.hex, description: 'Hexadecimal color code' },
                      { label: 'RGB', value: hexToRgb(color.hex), description: 'RGB color format' },
                      { label: 'HSL', value: hexToHsl(color.hex), description: 'HSL color format' },
                      { label: 'Token', value: color.token, description: 'Design system token' },
                      { label: 'Primitive', value: color.primitive, description: 'Primitive token reference' },
                    ]}
                    size="sm"
                  />
                </div>

                {/* Badge */}
                {color.primary && (
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">
                    Primary
                  </span>
                )}
              </div>

              {/* Row 2: Additional Info */}
              <div className="flex items-start gap-6 pl-[136px]">
                {/* RGB */}
                <div className="w-32">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    RGB
                  </div>
                  <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400">{hexToRgb(color.hex)}</span>
                </div>

                {/* HSL */}
                <div className="w-40">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    HSL
                  </div>
                  <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400">{hexToHsl(color.hex)}</span>
                </div>

                {/* Usage */}
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Usage
                  </div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{color.usage}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Component Examples */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Component Examples
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card */}
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 mb-3">
              Card
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Standard Card
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                border-width-1 + radius-md
              </p>
            </div>
            <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-2 block">
              border border-zinc-200 rounded-md
            </code>
          </div>

          {/* Input */}
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 mb-3">
              Input Field
            </div>
            <input
              type="text"
              placeholder="Enter text..."
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm"
            />
            <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-2 block">
              border-width-1 + radius-md
            </code>
          </div>

          {/* Button */}
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 mb-3">
              Button
            </div>
            <button className="w-full px-4 py-2 bg-zinc-800 dark:bg-zinc-700 border-2 border-transparent rounded-md text-sm font-semibold text-zinc-50">
              Primary Button
            </button>
            <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-2 block">
              border-width-2 + radius-md
            </code>
          </div>

          {/* Badge */}
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 mb-3">
              Badge
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold">
                Active
              </span>
            </div>
            <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-2 block">
              border-width-1 + radius-full
            </code>
          </div>

          {/* Avatar */}
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 mb-3">
              Avatar
            </div>
            <div className="w-12 h-12 bg-zinc-800 dark:bg-zinc-600 rounded-full border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-50 font-semibold">
              AB
            </div>
            <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-2 block">
              border-width-2 + radius-full
            </code>
          </div>

          {/* Divider */}
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 mb-3">
              Divider
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-4">
              <p className="text-sm mb-3">Section A</p>
              <div className="border-t border-zinc-200 dark:border-zinc-800 my-3" />
              <p className="text-sm mt-3">Section B</p>
            </div>
            <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-2 block">
              border-width-1 on one side
            </code>
          </div>
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
                <span>Use border-width-1 (1px) for default cards, containers, and dividers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Apply radius-md (6px) for standard buttons, inputs, and cards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Use radius-full for avatars, badges, and pill-shaped elements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Use border-default-light/dark tokens for mode-aware borders</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Apply border-width-2 (2px) for focus states and emphasis</span>
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
                <span>Don't use border widths above 4px for standard UI elements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Avoid mixing different radius values within the same component</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't create custom border radius values outside the scale</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Avoid using radius-none unless specifically required for edge-to-edge designs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't use semantic color borders (success, error) for standard containers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}