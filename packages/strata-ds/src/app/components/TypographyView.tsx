import { Check, X } from 'lucide-react';
import { Heading, Subheading } from './ui/heading';
import { Text, Strong } from './ui/text';
import { Link } from './ui/link';
import { CodeViewer } from './CodeViewer';
import { CopyButton } from './CopyButton';

export function TypographyView() {


  const typeScales = [
    {
      primitive: 'display-lg',
      token: 'typography-display-large',
      size: '36px / 2.25rem',
      lineHeight: '40px / 2.5rem',
      weight: '700 (Bold)',
      usage: 'Large page titles, hero headings',
      className: 'text-4xl font-bold',
      sample: 'Display Large',
      primary: true,
    },
    {
      primitive: 'heading-1',
      token: 'typography-heading-1',
      size: '30px / 1.875rem',
      lineHeight: '36px / 2.25rem',
      weight: '700 (Bold)',
      usage: 'Page headings, section titles',
      className: 'text-3xl font-bold',
      sample: 'Heading 1',
      primary: true,
    },
    {
      primitive: 'heading-2',
      token: 'typography-heading-2',
      size: '24px / 1.5rem',
      lineHeight: '32px / 2rem',
      weight: '700 (Bold)',
      usage: 'Subsection headings, card titles',
      className: 'text-2xl font-bold',
      sample: 'Heading 2',
      primary: true,
    },
    {
      primitive: 'heading-3',
      token: 'typography-heading-3',
      size: '20px / 1.25rem',
      lineHeight: '28px / 1.75rem',
      weight: '700 (Bold)',
      usage: 'Component headings, labels',
      className: 'text-xl font-bold',
      sample: 'Heading 3',
    },
    {
      primitive: 'subtitle',
      token: 'typography-subtitle',
      size: '18px / 1.125rem',
      lineHeight: '28px / 1.75rem',
      weight: '600 (Semibold)',
      usage: 'Section subtitles, emphasized text',
      className: 'text-lg font-semibold',
      sample: 'Subtitle',
    },
    {
      primitive: 'body-base',
      token: 'typography-body-base',
      size: '16px / 1rem',
      lineHeight: '24px / 1.5rem',
      weight: '400 (Regular)',
      usage: 'Body copy, paragraph text',
      className: 'text-base',
      sample: 'Body Base',
      primary: true,
    },
    {
      primitive: 'body-sm',
      token: 'typography-body-small',
      size: '14px / 0.875rem',
      lineHeight: '20px / 1.25rem',
      weight: '400 (Regular)',
      usage: 'Secondary body text, descriptions',
      className: 'text-sm',
      sample: 'Body Small',
      primary: true,
    },
    {
      primitive: 'caption',
      token: 'typography-caption',
      size: '12px / 0.75rem',
      lineHeight: '16px / 1rem',
      weight: '700 (Bold)',
      usage: 'Labels, captions, metadata',
      className: 'text-xs uppercase tracking-wider font-bold',
      sample: 'CAPTION',
    },
  ];

  const fontWeights = [
    { primitive: '400', token: 'font-weight-regular', name: 'Regular', usage: 'Body text, default content', className: 'font-normal' },
    { primitive: '500', token: 'font-weight-medium', name: 'Medium', usage: 'Emphasized text, button labels', className: 'font-medium' },
    { primitive: '600', token: 'font-weight-semibold', name: 'Semibold', usage: 'Subtitles, secondary headings', className: 'font-semibold', primary: true },
    { primitive: '700', token: 'font-weight-bold', name: 'Bold', usage: 'Headings, important text', className: 'font-bold', primary: true },
  ];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Typography
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Inter font family type scale with semantic tokens for consistent text hierarchy.
          </p>
        </div>

      </div>


      {/* Components */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Typography Components
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Standardized React components for consistent text rendering.
        </p>

        <div className="space-y-8">
          {/* Headings */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8">
            <div className="max-w-2xl">
              <Heading level={1} className="mb-4">Standard Page Heading (H1)</Heading>
              <Subheading level={2} className="mb-2">Logical Subheading (H2)</Subheading>
              <Text>
                This is a standard paragraph using the <Strong>Text</Strong> component.
                It includes support for <Strong>Strong</Strong> emphasis and <Link href="#">navigational links</Link> that follow the system's design tokens.
              </Text>
            </div>
          </div>

          <CodeViewer
            title="Typography Components"
            react={`import { Heading, Subheading } from "@/components/ui/heading"
import { Text, Strong } from "@/components/ui/text"
import { Link } from "@/components/ui/link"

export function TypographyDemo() {
  return (
    <>
      <Heading level={1}>Heading 1</Heading>
      <Subheading level={2}>Subheading</Subheading>
      <Text>
        Standard body text with <Strong>important</Strong> content 
        and a <Link href="#">link</Link>.
      </Text>
    </>
  )
}`}
            html={`<h1 class="text-2xl/8 font-semibold sm:text-xl/8 text-zinc-950 dark:text-white">Heading 1</h1>
<h2 class="text-base/7 font-semibold text-zinc-950 sm:text-sm/6 dark:text-white">Subheading</h2>
<p class="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
  Standard body text with <strong class="font-semibold text-zinc-950 dark:text-white">important</strong> content 
  and a <a class="text-zinc-950 underline decoration-zinc-950/20 underline-offset-4 hover:decoration-zinc-950/50 dark:text-white dark:decoration-white/20 dark:hover:decoration-white/50" href="#">link</a>.
</p>`}
            css={`.text {
  font-size: 1rem;
  line-height: 1.5rem;
  color: var(--color-zinc-500);
}

.heading-1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-zinc-950);
}`}
            prompt={`# AI PROMPT: Typography Components
## CONTEXT
Implement Heading, Text, and Link components using Zinc primitives.

## SPECS
- Text: text-base/6, zinc-500
- Heading 1: text-2xl/8 font-semibold
- Link: underline decoration-zinc-950/20`}
          />
        </div>
      </div>

      {/* Font Family */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Font Families
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Primary typographic voices for the Strata interface.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand Font */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-50 font-brand text-9xl leading-none text-zinc-100 dark:text-zinc-800 pointer-events-none select-none -mr-4 -mt-4">
              Aa
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Brand Font</h3>
                <code className="text-xs font-mono px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400">font-brand</code>
              </div>
              <div className="text-3xl font-brand font-bold text-zinc-900 dark:text-zinc-50 mb-4">PP Monument Extended</div>
              <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <p>Used for: <strong>Headings, Display text, Marketing headers</strong></p>
                <p className="font-brand uppercase tracking-wider text-xs">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                <p className="font-brand font-bold">1234567890</p>
              </div>
            </div>
          </div>

          {/* Body Font */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-50 font-sans text-9xl leading-none text-zinc-100 dark:text-zinc-800 pointer-events-none select-none -mr-4 -mt-4">
              Aa
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Body Font</h3>
                <code className="text-xs font-mono px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400">font-sans</code>
              </div>
              <div className="text-3xl font-sans font-medium text-zinc-900 dark:text-zinc-50 mb-4">Inter</div>
              <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <p>Used for: <strong>Body text, UI elements, Data grid</strong></p>
                <p className="font-sans">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz</p>
                <p className="font-sans font-medium">1234567890</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Type Scale */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Type Scale
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          8-level hierarchy for text sizing and line-height. Primary scales (Display, H1, H2, Body Base, Body Small) cover 90% of use cases.
        </p>

        {/* Preview Container */}
        <div>
          <div className="rounded-xl p-6 transition-colors duration-300 bg-zinc-50 dark:bg-zinc-950">
            <div className="space-y-3">
              {typeScales.map((scale) => (
                <div
                  key={scale.primitive}
                  className={`bg-white dark:bg-zinc-800 border rounded-md p-6 transition-all duration-300 ${scale.primary
                    ? 'border-zinc-300 dark:border-zinc-600'
                    : 'border-zinc-200 dark:border-zinc-700'
                    }`}
                >
                  <div className="grid grid-cols-12 gap-6 items-center">
                    {/* Visual Sample */}
                    <div className="col-span-3">
                      <div className={`${scale.className} text-zinc-900 dark:text-zinc-100`}>
                        {scale.sample}
                      </div>
                    </div>

                    {/* Primitive */}
                    <div className="col-span-2">
                      <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Primitive
                      </div>
                      <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                        {scale.primitive}
                      </code>
                    </div>

                    {/* Token */}
                    <div className="col-span-2">
                      <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Token
                      </div>
                      <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded border border-transparent dark:border-zinc-700">
                        {scale.token}
                      </code>
                    </div>

                    {/* Specs */}
                    <div className="col-span-2">
                      <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Size / Line Height
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-300">
                        {scale.size}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-300">
                        LH: {scale.lineHeight}
                      </div>
                    </div>

                    {/* Copy Button */}
                    <div className="col-span-2 flex justify-center">
                      <CopyButton
                        formats={[
                          { label: 'PX', value: scale.size.split(' / ')[0], description: 'Pixel value' },
                          { label: 'REM', value: scale.size.split(' / ')[1], description: 'REM value' },
                          { label: 'Token', value: scale.token, description: 'Design system token' },
                          { label: 'CSS Class', value: scale.className, description: 'Tailwind CSS class' },
                          { label: 'Primitive', value: scale.primitive, description: 'Primitive token reference' },
                        ]}
                        size="sm"
                      />
                    </div>

                    {/* Badge */}
                    <div className="col-span-1 flex justify-end">
                      {scale.primary && (
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-600 px-2 py-1 rounded whitespace-nowrap border border-transparent dark:border-zinc-500">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Usage */}
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                      Usage
                    </div>
                    <span className="text-sm text-zinc-600 dark:text-zinc-300">{scale.usage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Font Weights */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Font Weights
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          4 weight variations for emphasis and hierarchy. Semibold (600) and Bold (700) are most commonly used.
        </p>

        {/* Preview Container */}
        <div>
          <div className="rounded-xl p-6 transition-colors duration-300 bg-zinc-50 dark:bg-zinc-950">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fontWeights.map((weight) => (
                <div
                  key={weight.primitive}
                  className={`bg-white dark:bg-zinc-800 border rounded-md p-5 transition-all duration-300 ${weight.primary
                    ? 'border-zinc-300 dark:border-zinc-600'
                    : 'border-zinc-200 dark:border-zinc-700'
                    }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`text-2xl text-zinc-900 dark:text-zinc-100 ${weight.className}`}>
                      {weight.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <CopyButton
                        formats={[
                          { label: 'Value', value: weight.primitive, description: 'Font weight value' },
                          { label: 'Token', value: weight.token, description: 'Design system token' },
                          { label: 'CSS Class', value: weight.className, description: 'Tailwind CSS class' },
                        ]}
                        size="sm"
                      />
                      {weight.primary && (
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-600 px-2 py-1 rounded border border-transparent dark:border-zinc-500">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Primitive
                      </div>
                      <code className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
                        {weight.primitive}
                      </code>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Token
                      </div>
                      <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded border border-transparent dark:border-zinc-700">
                        {weight.token}
                      </code>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Usage
                      </div>
                      <span className="text-sm text-zinc-600 dark:text-zinc-300">{weight.usage}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Text Colors */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Text Colors
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Semantic text color tokens for consistent contrast and hierarchy.
        </p>

        <div className="grid grid-cols-1 gap-3">
          {[
            {
              name: 'Primary Text',
              token: 'text-primary',
              light: 'zinc-900',
              dark: 'zinc-50',
              usage: 'Headings, primary content',
              primary: true
            },
            {
              name: 'Secondary Text',
              token: 'text-secondary',
              light: 'zinc-600',
              dark: 'zinc-400',
              usage: 'Body text, descriptions',
              primary: true
            },
            {
              name: 'Tertiary Text',
              token: 'text-tertiary',
              light: 'zinc-500',
              dark: 'zinc-500',
              usage: 'Captions, metadata, disabled',
            },
            {
              name: 'Placeholder Text',
              token: 'text-placeholder',
              light: 'zinc-400',
              dark: 'zinc-600',
              usage: 'Form placeholders, empty states',
            },
          ].map((textColor) => (
            <div
              key={textColor.token}
              className={`bg-white dark:bg-zinc-900 border rounded-md p-5 flex items-center gap-6 ${textColor.primary
                ? 'border-zinc-800 dark:border-zinc-600'
                : 'border-zinc-200 dark:border-zinc-800'
                }`}
            >
              <div className="w-48">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                  {textColor.name}
                </div>
                <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded">
                  {textColor.token}
                </code>
              </div>

              <div className="w-64">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                  Light / Dark Mode
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {textColor.light} / {textColor.dark}
                </div>
              </div>

              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                  Usage
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{textColor.usage}</span>
              </div>

              {textColor.primary && (
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">
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
                <span>Use display-lg, heading-1, and heading-2 for primary page hierarchy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Maintain consistent line-height for optimal readability (1.5x font size)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Use semibold (600) for emphasized text and bold (700) for headings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Apply text-secondary for body content and descriptions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Use caption style for labels, tags, and metadata</span>
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
                <span>Don't create custom font sizes outside the defined scale</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Avoid using more than 3 type scales in a single component</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't use font weights below 400 or above 700 for UI elements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Avoid ALL CAPS except for labels and captions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't use text-primary on light backgrounds or text-secondary on dark backgrounds</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}