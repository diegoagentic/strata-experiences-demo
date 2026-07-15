import { FigmaExport } from './FigmaExport';
import { Figma, Download, Palette, FileJson, Sparkles, CheckCircle2 } from 'lucide-react';

export function FigmaExportGuide() {
  // Example data for demonstration
  const exampleHTML = `<button class="btn-primary">
  Click me
</button>`;

  const exampleCSS = `.btn-primary {
  padding: 0.5rem 1rem;
  background-color: #18181b;
  color: #fafafa;
  font-weight: 600;
  border-radius: 0.375rem;
}`;

  const exampleTokens = {
    colors: {
      'primary-bg': '#18181b',
      'primary-text': '#fafafa',
      'primary-hover': '#27272a',
    },
    spacing: {
      'button-padding-x': '16px',
      'button-padding-y': '8px',
    },
    borders: {
      'button-radius': '6px',
    },
  };

  const exampleSpecs = {
    padding: '16px horizontal, 8px vertical',
    backgroundColor: '#18181b',
    color: '#fafafa',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Figma Export Guide
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Learn how to export Design System components to Figma using multiple methods.
        </p>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-900 rounded-xl p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Figma className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Smart Export System
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4 leading-relaxed">
              We've implemented multiple export methods so you can bring Design System components into Figma in the way that best fits your workflow.
            </p>
            <div className="flex items-center gap-2">
              <FigmaExport
                componentName="Button Example"
                htmlCode={exampleHTML}
                cssCode={exampleCSS}
                tokens={exampleTokens}
                specs={exampleSpecs}
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                ← Click to see available methods
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Methods Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          4 Available Export Methods
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Method 1 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950 rounded-lg flex items-center justify-center flex-shrink-0">
                <Figma className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
                    HTML to Figma Plugin
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded">
                    Recommended
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  The fastest and most accurate way
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Automatic HTML + CSS conversion</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Preserves structure and styles</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Free and easy to use</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Difficulty: Easy
              </span>
            </div>
          </div>

          {/* Method 2 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
                    html.to.design
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs font-bold rounded">
                    Premium
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Specialized online service
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <span>High-fidelity conversion</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <span>Generates reusable components</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <span>Supports responsive design</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Difficulty: Easy
              </span>
            </div>
          </div>

          {/* Method 3 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center flex-shrink-0">
                <Palette className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                  Tokens Studio
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  For design tokens and variables
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Syncs colors and styles</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Ideal for design systems</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Exports as Figma variables</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Difficulty: Intermediate
              </span>
            </div>
          </div>

          {/* Method 4 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileJson className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                  Manual Recreation
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  With exact specifications
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400 flex-shrink-0 mt-0.5" />
                <span>Exact design values</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400 flex-shrink-0 mt-0.5" />
                <span>Full control over results</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400 flex-shrink-0 mt-0.5" />
                <span>No plugins required</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Difficulty: Easy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Quick Start
        </h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                Find the component you want to export
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Browse through the design system and find the component you need (buttons, colors, typography, etc.)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                Click "Export to Figma"
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Look for the purple "Export to Figma" button in the component's code block
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                Choose your preferred method
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Select one of the 4 available methods based on your needs and follow the step-by-step instructions
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                Import into Figma and customize
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Once imported, the component will be ready to use and customize in your Figma file
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips & Best Practices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-emerald-900 dark:text-emerald-100">
              Helpful Tips
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-emerald-800 dark:text-emerald-200">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
              <span>Use the HTML to Figma Plugin method to get started quickly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
              <span>Tokens Studio is ideal if you work with variables and themes in Figma</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
              <span>Manual recreation gives you maximum control over the final result</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
              <span>All methods include step-by-step visual instructions</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-blue-900 dark:text-blue-100">
              Recommendations
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>For complete components: use HTML to Figma or html.to.design</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>For colors and tokens: use Tokens Studio</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>For fine-tuning: use the manual specifications</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Combine methods depending on what you need to export</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}