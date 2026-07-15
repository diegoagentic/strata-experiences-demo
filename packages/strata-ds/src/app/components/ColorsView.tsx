import { CheckCircle2, AlertTriangle, AlertCircle, Info, Check, X } from 'lucide-react';
import { CopyButton } from './CopyButton';

export function ColorsView() {

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '';
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Helper function to convert hex to HSL
  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '';
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

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

  const brandScale = [
    { primitive: '50', token: 'brand-50', hex: '#fdfee7', usage: 'Subtle backgrounds', light: true },
    { primitive: '100', token: 'brand-100', hex: '#F4F8E1', usage: 'Light backgrounds', light: true },
    { primitive: '200', token: 'brand-200', hex: '#F4FFC9', usage: 'Interactive hover (light)', light: true },
    { primitive: '300', token: 'brand-300', hex: '#E6F993', usage: 'Primary Brand Color (Light Mode)', light: true, primary: true },
    { primitive: '400', token: 'brand-400', hex: '#DAF75F', usage: 'Highlights', light: true },
    { primitive: '500', token: 'brand-500', hex: '#C3E433', usage: 'Primary Brand Color (Dark Mode)', dark: true, primary: true },
    { primitive: '600', token: 'brand-600', hex: '#A0C114', usage: 'Borders, accents', dark: true },
    { primitive: '700', token: 'brand-700', hex: '#718B03', usage: 'Dark accents', dark: true },
    { primitive: '800', token: 'brand-800', hex: '#507206', usage: 'Text on light brand bg', dark: true },
    { primitive: '900', token: 'brand-900', hex: '#2A3400', usage: 'Darkest brand background', dark: true },
    { primitive: '950', token: 'brand-950', hex: '#233502', usage: 'Deepest background', dark: true },
  ];



  const zincScale = [
    {
      primitive: '50',
      token: 'zinc-50',
      tailwind: 'gray-50',
      hex: '#fafafa',
      usage: 'Backgrounds, subtle overlays',
      light: true
    },
    {
      primitive: '100',
      token: 'zinc-100',
      tailwind: 'gray-100',
      hex: '#EBECEE',
      usage: 'Hover states, secondary backgrounds',
      light: true
    },
    {
      primitive: '200',
      token: 'zinc-200',
      tailwind: 'gray-200',
      hex: '#E0E2E5',
      usage: 'Borders (light mode default)',
      light: true,
      primary: true
    },
    {
      primitive: '300',
      token: 'zinc-300',
      tailwind: 'gray-300',
      hex: '#D0D4D8',
      usage: 'Border hover states, dividers',
      light: true
    },
    {
      primitive: '400',
      token: 'zinc-400',
      tailwind: 'gray-400',
      hex: '#B4BBC2',
      usage: 'Placeholder text, disabled states',
      light: true
    },
    {
      primitive: '500',
      token: 'zinc-500',
      tailwind: 'gray-500',
      hex: '#959DA7',
      usage: 'Secondary text, captions',
      dark: true,
      primary: true
    },
    {
      primitive: '600',
      token: 'zinc-600',
      tailwind: 'gray-600',
      hex: '#546070',
      usage: 'Body text, primary icons',
      dark: true
    },
    {
      primitive: '700',
      token: 'zinc-700',
      tailwind: 'gray-700',
      hex: '#333F4E',
      usage: 'Border hover (dark mode)',
      dark: true
    },
    {
      primitive: '800',
      token: 'zinc-800',
      tailwind: 'gray-800',
      hex: '#141E2C',
      usage: 'Borders (dark mode default)',
      dark: true,
      primary: true
    },
    {
      primitive: '900',
      token: 'zinc-900',
      tailwind: 'gray-900',
      hex: '#02060C',
      usage: 'Headings, primary text (light mode)',
      dark: true,
      primary: true
    },
    {
      primitive: '950',
      token: 'zinc-950',
      tailwind: 'gray-950',
      hex: '#09090b',
      usage: 'Backgrounds (dark mode)',
      dark: true
    },
  ];

  const semanticColors = [
    {
      name: 'Success',
      token: 'emerald-600',
      primitive: 'emerald-600',
      hex: '#10b981',
      usage: 'Success messages, completed states, positive actions',
      icon: CheckCircle2,
      bg: 'bg-emerald-50 dark:bg-emerald-950',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-900 dark:text-emerald-100',
      subtext: 'text-emerald-700 dark:text-emerald-300',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      name: 'Warning',
      token: 'amber-600',
      primitive: 'amber-600',
      hex: '#f59e0b',
      usage: 'Warning states, caution alerts, pending actions',
      icon: AlertTriangle,
      bg: 'bg-amber-50 dark:bg-amber-950',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-900 dark:text-amber-100',
      subtext: 'text-amber-700 dark:text-amber-300',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      name: 'Error',
      token: 'red-500',
      primitive: 'red-500',
      hex: '#E52D49',
      usage: 'Error messages, destructive actions, critical alerts',
      icon: AlertCircle,
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-900 dark:text-red-100',
      subtext: 'text-red-700 dark:text-red-300',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      name: 'Info',
      token: 'blue-600',
      primitive: 'blue-600',
      hex: '#3b82f6',
      usage: 'Informational messages, help text, neutral notifications',
      icon: Info,
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-100',
      subtext: 'text-blue-700 dark:text-blue-300',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  ];

  // Data Visualization Colors with 5-step scales (WCAG AA compliant)
  const dataVizColorFamilies = [
    {
      name: 'Primary',
      description: 'Blue-indigo spectrum optimized for primary data series and main charts',
      usage: 'Primary data series, main charts, key metrics',
      scales: [
        { step: '100', hex: '#e0e7ff', token: 'color-chart-primary-100', primitive: 'indigo-100', usage: 'Backgrounds, subtle highlights', contrast: 'AAA' },
        { step: '200', hex: '#c7d2fe', token: 'color-chart-primary-200', primitive: 'indigo-200', usage: 'Hover states, light fills', contrast: 'AA' },
        { step: '300', hex: '#a5b4fc', token: 'color-chart-primary-300', primitive: 'indigo-300', usage: 'Secondary data points', contrast: 'AA' },
        { step: '400', hex: '#818cf8', token: 'color-chart-primary-400', primitive: 'indigo-400', usage: 'Interactive elements', contrast: 'AA', primary: true },
        { step: '500', hex: '#6366f1', token: 'color-chart-primary-500', primitive: 'indigo-500', usage: 'Primary data series', contrast: 'AA', primary: true },
      ],
    },
    {
      name: 'Secondary',
      description: 'Teal spectrum for secondary data series and comparison charts',
      usage: 'Secondary data series, comparison metrics, alternative views',
      scales: [
        { step: '100', hex: '#ccfbf1', token: 'color-chart-secondary-100', primitive: 'teal-100', usage: 'Backgrounds, subtle highlights', contrast: 'AAA' },
        { step: '200', hex: '#99f6e4', token: 'color-chart-secondary-200', primitive: 'teal-200', usage: 'Hover states, light fills', contrast: 'AA' },
        { step: '300', hex: '#5eead4', token: 'color-chart-secondary-300', primitive: 'teal-300', usage: 'Secondary data points', contrast: 'AA' },
        { step: '400', hex: '#2dd4bf', token: 'color-chart-secondary-400', primitive: 'teal-400', usage: 'Interactive elements', contrast: 'AA', primary: true },
        { step: '500', hex: '#14b8a6', token: 'color-chart-secondary-500', primitive: 'teal-500', usage: 'Secondary data series', contrast: 'AA', primary: true },
      ],
    },
    {
      name: 'Tertiary',
      description: 'Red spectrum for tertiary data and critical visualizations',
      usage: 'Tertiary data series, critical indicators, attention markers',
      scales: [
        { step: '100', hex: '#FFECEE', token: 'color-chart-tertiary-100', primitive: 'red-100', usage: 'Backgrounds, subtle highlights', contrast: 'AAA' },
        { step: '200', hex: '#FFD6DC', token: 'color-chart-tertiary-200', primitive: 'red-200', usage: 'Hover states, light fills', contrast: 'AA' },
        { step: '300', hex: '#F99DAA', token: 'color-chart-tertiary-300', primitive: 'red-300', usage: 'Secondary data points', contrast: 'AA' },
        { step: '400', hex: '#ED5F74', token: 'color-chart-tertiary-400', primitive: 'red-400', usage: 'Interactive elements', contrast: 'AA', primary: true },
        { step: '500', hex: '#E52D49', token: 'color-chart-tertiary-500', primitive: 'red-500', usage: 'Tertiary data series', contrast: 'AA', primary: true },
      ],
    },
    {
      name: 'Quaternary',
      description: 'Amber-orange spectrum for supplementary data and warm tones',
      usage: 'Additional data series, supplementary metrics, warm accents',
      scales: [
        { step: '100', hex: '#fef3c7', token: 'color-chart-quaternary-100', primitive: 'amber-100', usage: 'Backgrounds, subtle highlights', contrast: 'AAA' },
        { step: '200', hex: '#fde68a', token: 'color-chart-quaternary-200', primitive: 'amber-200', usage: 'Hover states, light fills', contrast: 'AA' },
        { step: '300', hex: '#fcd34d', token: 'color-chart-quaternary-300', primitive: 'amber-300', usage: 'Secondary data points', contrast: 'AA' },
        { step: '400', hex: '#fbbf24', token: 'color-chart-quaternary-400', primitive: 'amber-400', usage: 'Interactive elements', contrast: 'AA', primary: true },
        { step: '500', hex: '#f59e0b', token: 'color-chart-quaternary-500', primitive: 'amber-500', usage: 'Additional data series', contrast: 'AA', primary: true },
      ],
    },
    {
      name: 'Accent 1',
      description: 'Violet spectrum for distinct visual markers and highlights',
      usage: 'Accent data points, special highlights, distinctive markers',
      scales: [
        { step: '100', hex: '#ede9fe', token: 'color-chart-accent-1-100', primitive: 'violet-100', usage: 'Backgrounds, subtle highlights', contrast: 'AAA' },
        { step: '200', hex: '#ddd6fe', token: 'color-chart-accent-1-200', primitive: 'violet-200', usage: 'Hover states, light fills', contrast: 'AA' },
        { step: '300', hex: '#c4b5fd', token: 'color-chart-accent-1-300', primitive: 'violet-300', usage: 'Secondary data points', contrast: 'AA' },
        { step: '400', hex: '#a78bfa', token: 'color-chart-accent-1-400', primitive: 'violet-400', usage: 'Interactive elements', contrast: 'AA', primary: true },
        { step: '500', hex: '#8b5cf6', token: 'color-chart-accent-1-500', primitive: 'violet-500', usage: 'Accent data points', contrast: 'AA', primary: true },
      ],
    },
    {
      name: 'Accent 2',
      description: 'Cyan spectrum for fresh data accents and cool tone highlights',
      usage: 'Accent data points, cool highlights, fresh markers',
      scales: [
        { step: '100', hex: '#cffafe', token: 'color-chart-accent-2-100', primitive: 'cyan-100', usage: 'Backgrounds, subtle highlights', contrast: 'AAA' },
        { step: '200', hex: '#a5f3fc', token: 'color-chart-accent-2-200', primitive: 'cyan-200', usage: 'Hover states, light fills', contrast: 'AA' },
        { step: '300', hex: '#67e8f9', token: 'color-chart-accent-2-300', primitive: 'cyan-300', usage: 'Secondary data points', contrast: 'AA' },
        { step: '400', hex: '#22d3ee', token: 'color-chart-accent-2-400', primitive: 'cyan-400', usage: 'Interactive elements', contrast: 'AA', primary: true },
        { step: '500', hex: '#06b6d4', token: 'color-chart-accent-2-500', primitive: 'cyan-500', usage: 'Accent data points', contrast: 'AA', primary: true },
      ],
    },
    {
      name: 'Accent 3',
      description: 'Orange spectrum for energetic data markers and warm highlights',
      usage: 'Accent data points, warm highlights, energetic markers',
      scales: [
        { step: '100', hex: '#ffedd5', token: 'color-chart-accent-3-100', primitive: 'orange-100', usage: 'Backgrounds, subtle highlights', contrast: 'AAA' },
        { step: '200', hex: '#fed7aa', token: 'color-chart-accent-3-200', primitive: 'orange-200', usage: 'Hover states, light fills', contrast: 'AA' },
        { step: '300', hex: '#fdba74', token: 'color-chart-accent-3-300', primitive: 'orange-300', usage: 'Secondary data points', contrast: 'AA' },
        { step: '400', hex: '#fb923c', token: 'color-chart-accent-3-400', primitive: 'orange-400', usage: 'Interactive elements', contrast: 'AA', primary: true },
        { step: '500', hex: '#f97316', token: 'color-chart-accent-3-500', primitive: 'orange-500', usage: 'Accent data points', contrast: 'AA', primary: true },
      ],
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Colors
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Zinc neutral palette with semantic feedback colors and data visualization tokens.
          </p>
        </div>
      </div>

      <div className="mb-8 p-4 bg-brand-50/50 dark:bg-zinc-900/50 border border-brand-200 dark:border-zinc-800 rounded-lg">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Accessibility & Usage Update</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          The color system has been updated to improve readability and contrast.
          <strong> Light Mode</strong> now uses <code className="font-mono text-xs bg-zinc-100 px-1 py-0.5 rounded">brand-300</code> (#E6F993) for primary actions to ensure high contrast with black text.
          <strong> Dark Mode</strong> uses <code className="font-mono text-xs bg-zinc-800 px-1 py-0.5 rounded">brand-500</code> (#C3E433) for visibility against dark backgrounds.
        </p>
      </div>

      {/* Brand Palette */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Brand Palette (Volt Lime)
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          The primary signal color for Strata. Used for high-priority actions, accents, and branding elements.
        </p>

        {/* Preview Container */}
        <div>
          <div className="rounded-xl p-6 transition-colors duration-300 bg-background border border-border">
            <div className="space-y-3 mb-8">
              {brandScale.map((color) => (
                <div
                  key={color.primitive}
                  className={`bg-card border rounded-md p-5 flex items-center gap-6 transition-all duration-300 ${color.primary
                    ? 'border-brand-400 ring-1 ring-brand-400'
                    : 'border-border'
                    }`}
                >
                  {/* Visual Swatch */}
                  <div
                    className="w-20 h-14 rounded border border-zinc-200 dark:border-zinc-700 flex-shrink-0 relative overflow-hidden"
                    style={{ backgroundColor: color.hex }}
                  >
                    {color.primary && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-black/20" />
                      </div>
                    )}
                  </div>

                  {/* Primitive Value */}
                  <div className="w-16">
                    <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                      Step
                    </div>
                    <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {color.primitive}
                    </code>
                  </div>

                  {/* Token */}
                  <div className="w-48">
                    <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                      Token
                    </div>
                    <code
                      onClick={() => navigator.clipboard.writeText(color.token)}
                      className="text-xs font-mono bg-zinc-100 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded border border-transparent dark:border-zinc-700 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                      title="Click to copy token"
                    >
                      {color.token}
                    </code>
                  </div>

                  {/* Hex Value */}
                  <div className="w-24">
                    <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                      Hex
                    </div>
                    <span
                      onClick={() => navigator.clipboard.writeText(color.hex)}
                      className="text-sm font-mono text-zinc-600 dark:text-zinc-300 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      title="Click to copy hex"
                    >
                      {color.hex}
                    </span>
                  </div>

                  {/* Usage */}
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                      Usage
                    </div>
                    <span className="text-sm text-zinc-600 dark:text-zinc-300">{color.usage}</span>
                  </div>

                  {/* Copy Button */}
                  <div className="flex-shrink-0">
                    <CopyButton
                      formats={[
                        { label: 'HEX', value: color.hex, description: 'Hexadecimal color code' },
                        { label: 'Token', value: color.token, description: 'Design system token' },
                      ]}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Harmony & Accessibility */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Harmony & Accessibility
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Optimized pairings for Brand, Neutral (Zinc), and Muted (Slate) colors across modes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Light Mode: Brand Background */}
          <div className="rounded-xl border border-zinc-200 overflow-hidden">
            <div className="bg-brand-300 p-8 flex flex-col items-center justify-center text-center h-40">
              <h3 className="text-zinc-900 font-bold text-lg mb-1">Brand Soft</h3>
              <p className="text-zinc-800 text-sm">Background: brand-300</p>
              <p className="text-zinc-900 text-sm font-semibold">Text: zinc-900</p>
            </div>
            <div className="bg-white p-4 border-t border-zinc-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-semibold text-zinc-600">WCAG AA Pass</span>
              </div>
              <p className="text-xs text-zinc-500">Optimal for light mode cards/sections.</p>
            </div>
          </div>

          {/* Dark Mode: Brand Signal */}
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <div className="bg-zinc-900 p-8 flex flex-col items-center justify-center text-center h-40 relative">
              <div className="absolute top-4 right-4 text-brand-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-brand-500 font-bold text-lg mb-1">Brand Signal</h3>
              <p className="text-zinc-400 text-sm">Background: zinc-900</p>
              <p className="text-brand-500 text-sm font-semibold">Accent: brand-500</p>
            </div>
            <div className="bg-zinc-950 p-4 border-t border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-semibold text-zinc-400">High Contrast</span>
              </div>
              <p className="text-xs text-zinc-500">Best for icons, borders, and text accents in dark mode.</p>
            </div>
          </div>

          {/* Scale Harmony */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-zinc-50 dark:bg-zinc-900 p-8 flex flex-col justify-center h-40 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-zinc-500 flex items-center justify-center text-white text-xs">Zn</div>
                <span className="text-sm font-mono text-zinc-500">Zinc (Neutral)</span>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-4 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Use Zinc for sharp UI elements and primary structure.
              </p>
            </div>
          </div>
        </div>
      </div>



      {/* Neutral Palette */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Neutral Palette (Zinc)
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          11-step sharp greyscale foundation for primary backgrounds, borders, and text.
        </p>

        {/* Preview Container */}
        <div>
          <div className="rounded-xl p-6 transition-colors duration-300 bg-background border border-border">
            <div className="space-y-3 mb-8">
              {zincScale.map((color) => (
                <div
                  key={color.primitive}
                  className={`bg-card border rounded-md p-5 flex items-center gap-6 transition-all duration-300 ${color.primary
                    ? 'border-border-strong'
                    : 'border-border'
                    }`}
                >
                  {/* Visual Swatch */}
                  <div
                    className="w-20 h-14 rounded border border-zinc-300 dark:border-zinc-700 flex-shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />

                  {/* Primitive Value */}
                  <div className="w-16">
                    <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                      Primitive
                    </div>
                    <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {color.primitive}
                    </code>
                  </div>

                  {/* Catalyst Token */}
                  <div className="w-40">
                    <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                      Catalyst
                    </div>
                    <code
                      onClick={() => navigator.clipboard.writeText(color.token)}
                      className="text-xs font-mono bg-zinc-100 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded border border-transparent dark:border-zinc-700 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                      title="Click to copy token"
                    >
                      {color.token}
                    </code>
                  </div>

                  {/* Tailwind Token */}
                  <div className="w-40">
                    <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                      Tailwind
                    </div>
                    <code
                      className="text-xs font-mono text-zinc-500 dark:text-zinc-400 px-3 py-1.5"
                      title="Tailwind Equivalent"
                    >
                      {color.tailwind}
                    </code>
                  </div>

                  {/* Hex Value */}
                  <div className="w-24">
                    <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                      Hex
                    </div>
                    <span
                      onClick={() => navigator.clipboard.writeText(color.hex)}
                      className="text-sm font-mono text-zinc-600 dark:text-zinc-300 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      title="Click to copy hex"
                    >
                      {color.hex}
                    </span>
                  </div>

                  {/* RGB Value */}
                  <div className="w-24">
                    <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                      RGB
                    </div>
                    <span className="text-sm font-mono text-zinc-600 dark:text-zinc-300">{hexToRgb(color.hex)}</span>
                  </div>

                  {/* HSL Value */}
                  <div className="w-24">
                    <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                      HSL
                    </div>
                    <span className="text-sm font-mono text-zinc-600 dark:text-zinc-300">{hexToHsl(color.hex)}</span>
                  </div>

                  {/* Usage */}
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                      Usage
                    </div>
                    <span className="text-sm text-zinc-600 dark:text-zinc-300">{color.usage}</span>
                  </div>

                  {/* Copy Button */}
                  <div className="flex-shrink-0">
                    <CopyButton
                      formats={[
                        { label: 'HEX', value: color.hex, description: 'Hexadecimal color code' },
                        { label: 'RGB', value: hexToRgb(color.hex), description: 'RGB color format' },
                        { label: 'HSL', value: hexToHsl(color.hex), description: 'HSL color format' },
                        { label: 'Token', value: color.token, description: 'Design system token' },
                      ]}
                      size="sm"
                    />
                  </div>

                  {/* Badge */}
                  {color.primary && (
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-600 px-2 py-1 rounded flex-shrink-0 border border-transparent dark:border-zinc-500">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Semantic Colors */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Processing / Feedback Colors
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Feedback and status colors for user interface communication.
        </p>

        {/* Preview Container */}
        <div>
          <div className="rounded-xl p-6 transition-colors duration-300 bg-background border border-border">
            <div className="grid grid-cols-1 gap-4 mb-8">
              {semanticColors.map((color) => {
                const Icon = color.icon;
                return (
                  <div
                    key={color.name}
                    className={`${color.bg} border ${color.border} rounded-md p-5 transition-all duration-300`}
                  >
                    <div className="flex items-start gap-6">
                      {/* Icon + Visual */}
                      <div className="flex items-center gap-3 w-32 flex-shrink-0">
                        <Icon className={`w-6 h-6 ${color.iconColor}`} />
                        <div>
                          <div className={`text-sm font-semibold ${color.text}`}>
                            {color.name}
                          </div>
                          <div className={`text-xs ${color.subtext}`}>
                            {color.hex}
                          </div>
                        </div>
                      </div>

                      {/* Token */}
                      <div className="w-56">
                        <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                          Token
                        </div>
                        <code
                          onClick={() => navigator.clipboard.writeText(color.token)}
                          className="text-xs font-mono bg-white/50 dark:bg-black/20 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded cursor-pointer hover:bg-white dark:hover:bg-black/40 transition-colors"
                          title="Click to copy token"
                        >
                          {color.token}
                        </code>
                      </div>

                      {/* Primitive */}
                      <div className="w-32">
                        <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                          Primitive
                        </div>
                        <code className="text-xs font-mono text-zinc-700 dark:text-zinc-300">
                          {color.primitive}
                        </code>
                      </div>

                      {/* Usage */}
                      <div className="flex-1">
                        <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                          Usage
                        </div>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">{color.usage}</span>
                      </div>

                      {/* Copy Button */}
                      <div className="flex-shrink-0">
                        <CopyButton
                          formats={[
                            { label: 'HEX', value: color.hex, description: 'Hexadecimal color code' },
                            { label: 'RGB', value: hexToRgb(color.hex), description: 'RGB color format' },
                            { label: 'HSL', value: hexToHsl(color.hex), description: 'HSL color format' },
                            { label: 'Token', value: color.token, description: 'Design system token' },
                          ]}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Data Visualization */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Data Visualization
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Chart and graph color palette for clear data differentiation. Each family includes 5-step scales optimized for various use cases and WCAG AA compliant.
        </p>

        {/* Preview Container */}
        <div>
          <div className="rounded-xl p-6 transition-colors duration-300 bg-background border border-border">
            {dataVizColorFamilies.map((family) => (
              <div key={family.name} className="mb-8">
                {/* Family Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                    {family.name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    {family.description}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    Use case: {family.usage}
                  </p>
                </div>

                {/* Color Scales */}
                <div className="space-y-3">
                  {family.scales.map((color) => (
                    <div
                      key={color.step}
                      className={`bg-white dark:bg-zinc-800 border rounded-md p-5 transition-all duration-300 ${color.primary
                        ? 'border-zinc-300 dark:border-zinc-600'
                        : 'border-zinc-200 dark:border-zinc-700'
                        }`}
                    >
                      {/* Row 1: Visual Info + Core Tokens */}
                      <div className="flex items-center gap-6 mb-4">
                        {/* Visual Swatch */}
                        <div
                          className="w-20 h-14 rounded border border-zinc-300 dark:border-zinc-700 flex-shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />

                        {/* Step Value */}
                        <div className="w-16">
                          <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                            Step
                          </div>
                          <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                            {color.step}
                          </code>
                        </div>

                        {/* Primitive */}
                        <div className="w-28">
                          <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                            Primitive
                          </div>
                          <code className="text-xs font-mono text-zinc-700 dark:text-zinc-200">
                            {color.primitive}
                          </code>
                        </div>

                        {/* Token */}
                        <div className="flex-1">
                          <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                            Token
                          </div>
                          <code
                            onClick={() => navigator.clipboard.writeText(color.token)}
                            className="text-xs font-mono bg-zinc-100 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded inline-block border border-transparent dark:border-zinc-700 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                            title="Click to copy token"
                          >
                            {color.token}
                          </code>
                        </div>

                        {/* Hex Value */}
                        <div className="w-24">
                          <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                            Hex
                          </div>
                          <span
                            onClick={() => navigator.clipboard.writeText(color.hex)}
                            className="text-sm font-mono text-zinc-600 dark:text-zinc-300 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            title="Click to copy hex"
                          >
                            {color.hex}
                          </span>
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

                        {/* Badges */}
                        <div className="flex gap-2 flex-shrink-0">
                          {color.primary && (
                            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-600 px-2 py-1 rounded border border-transparent dark:border-zinc-500">
                              Primary
                            </span>
                          )}
                          {color.contrast && (
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${color.contrast === 'AAA'
                              ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-800'
                              : 'text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-800'
                              }`}>
                              {color.contrast}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Color Formats + Usage */}
                      <div className="flex items-start gap-6 pl-[104px]">
                        {/* RGB Value */}
                        <div className="w-36">
                          <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                            RGB
                          </div>
                          <span className="text-sm font-mono text-zinc-600 dark:text-zinc-300">{hexToRgb(color.hex)}</span>
                        </div>

                        {/* HSL Value */}
                        <div className="w-36">
                          <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                            HSL
                          </div>
                          <span className="text-sm font-mono text-zinc-600 dark:text-zinc-300">{hexToHsl(color.hex)}</span>
                        </div>

                        {/* Usage */}
                        <div className="flex-1">
                          <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                            Usage
                          </div>
                          <span className="text-sm text-zinc-600 dark:text-zinc-300">{color.usage}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
                <span>Use neutral-200 and neutral-800 for default borders in light and dark modes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Apply semantic colors consistently across similar UI patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Maintain WCAG AA contrast ratios for text on colored backgrounds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Use data viz colors in the specified sequence for multi-series charts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Test color combinations in both light and dark modes</span>
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
                <span>Don't use semantic colors for decorative purposes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Avoid creating custom color values outside the defined palette</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't use data viz colors for general UI elements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Avoid using more than 5-6 colors in a single chart</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't rely solely on color to convey information (use icons, labels)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}