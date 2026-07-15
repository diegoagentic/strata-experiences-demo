import { 
  Layers, 
  CheckCircle2, 
  Library, 
  Zap, 
  Code2, 
  Sparkles, 
  Users, 
  Workflow, 
  Palette, 
  Copy, 
  Download,
  Figma,
  Terminal,
  ArrowRight,
  GitBranch,
  Shield,
  Gauge
} from 'lucide-react';

export function OverviewView() {
  return (
    <div>
      {/* Hero Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50">
            Strata DS White Label
          </h1>
          <span className="inline-flex items-center px-3 py-1 rounded-md bg-zinc-900 dark:bg-zinc-700 text-zinc-50 text-xs font-bold tracking-wider uppercase">
            v1.0
          </span>
        </div>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-6 max-w-4xl">
          Enterprise-grade white label design system with high-density patterns, designed as an AI creation library that generates custom interfaces for clients.
        </p>
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              12 AI-Ready Components
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-md">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
              System as a Service
            </span>
          </div>
        </div>
      </div>

      {/* What is Strata DS */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          What is Strata DS White Label?
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Library className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                  AI Creation Library
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                  Strata DS functions as a <strong>component library for AI</strong>, where each component is documented with code in React, HTML, CSS, and detailed prompt engineering prompts.
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Users can copy the prompts and use them to generate custom components that maintain the visual and functional consistency of the system.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                  System as a Service
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                  We operate as a <strong>"system as a service"</strong> where AI uses this design system to create customized interfaces for each client.
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Each client gets unique AI-generated interfaces, but all maintain the quality, accessibility, and consistency of the base system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Audience */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Who is it designed for?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-3">
              AI Teams
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Teams that use AI to generate user interfaces and need structured prompts and well-documented components.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-3">
              Developers
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Developers who need ready-to-use React, HTML, and CSS code with complete light/dark mode support.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center mb-4">
              <Palette className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-3">
              Designers
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Designers who need to export components to Figma with exact tokens and specifications for recreation.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          How does the process work?
        </h2>
        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8">
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-zinc-900 dark:bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-zinc-50 font-bold">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  Select the Component
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Browse through the design system and find the component you need (button, modal, table, etc.).
                </p>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <Terminal className="w-4 h-4" />
                    <span>Example: ButtonsView → Primary Button</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-zinc-900 dark:bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-zinc-50 font-bold">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  Copy the Code or Prompt
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Each component includes 4 code formats. Select the one you need:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">React</span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">React code with TypeScript</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">HTML</span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Pure HTML with Tailwind</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Code2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">CSS</span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Vanilla CSS with media queries</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">AI Prompt</span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Detailed prompt for AI</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-zinc-900 dark:bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-zinc-50 font-bold">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  Generate or Implement
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  You have two options depending on your workflow:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-50">With AI</h4>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                      Use the AI Prompt in your favorite AI tool (ChatGPT, Claude, etc.) to generate the custom component.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-violet-600 dark:text-violet-400 font-semibold">
                      <ArrowRight className="w-3 h-3" />
                      <span>Automated generation</span>
                    </div>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-50">Manual</h4>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                      Copy the React, HTML, or CSS code directly and use it in your project without modifications.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      <Copy className="w-3 h-3" />
                      <span>Copy & Paste ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-zinc-900 dark:bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-zinc-50 font-bold">4</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  Export to Figma (Optional)
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  If you need to work in Figma, each component includes 4 export methods:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 flex items-start gap-3">
                    <Figma className="w-5 h-5 text-zinc-600 dark:text-zinc-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">HTML to Figma</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Free conversion plugin</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 flex items-start gap-3">
                    <Download className="w-5 h-5 text-zinc-600 dark:text-zinc-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">html.to.design</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Premium conversion service</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 flex items-start gap-3">
                    <GitBranch className="w-5 h-5 text-zinc-600 dark:text-zinc-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Tokens Studio</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Exportable design tokens</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 flex items-start gap-3">
                    <Layers className="w-5 h-5 text-zinc-600 dark:text-zinc-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Manual Recreation</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Exact specifications</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              High Density
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Designed for enterprise applications that handle large volumes of data and complex information.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Light/Dark Mode
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Complete support for light and dark mode in all components with smooth transitions.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              AI-Ready Prompts
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Each component includes detailed prompt engineering prompts for AI generation.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              WCAG Accessibility
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Complies with WCAG 2.1 AA standards with contrast, keyboard navigation, and ARIA labels.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
              <Palette className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Zinc Greyscale
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Zinc color palette as neutral base with semantic colors for states and feedback.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <Gauge className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              8px Grid System
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Base 8px spacing system to maintain consistency and perfect alignment.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Technology Stack
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Code2 className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-1">React + TypeScript</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Base framework</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Layers className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-1">Tailwind CSS v4</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Styling system</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Palette className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-1">Lucide Icons</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Icon system</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-1">Inter Font</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Typography</p>
            </div>
          </div>
        </div>
      </div>

      {/* Component Status */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Component Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                AI Ready
              </h3>
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-4xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">
              12
            </div>
            <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-4">
              Complete components with code, prompts, and Figma export
            </p>
            <div className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
              <div>✓ Buttons</div>
              <div>✓ Badges</div>
              <div>✓ Avatars</div>
              <div>✓ Dividers</div>
              <div>✓ Alerts</div>
              <div>✓ Navbars</div>
              <div>✓ Inputs</div>
              <div>✓ Modals</div>
              <div>✓ Dropdowns</div>
              <div>✓ Breadcrumbs</div>
              <div>✓ Stats</div>
              <div>✓ Selects</div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">
                In Progress
              </h3>
              <Workflow className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-2">
              17
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
              Visual components completed, pending AI documentation
            </p>
            <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
              <div>→ Data Tables</div>
              <div>→ Page Headings</div>
              <div>→ Form Layouts</div>
              <div>→ File Upload</div>
              <div>→ Stacked Lists</div>
              <div>→ Data Visualization</div>
              <div className="pt-2 text-amber-600 dark:text-amber-400">+ 11 more</div>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Special
              </h3>
              <Layers className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              2
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              System components with special export functionality
            </p>
            <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
              <div>• Colors (Complete palette)</div>
              <div>• Typography (Type scale)</div>
              <div className="pt-2 text-zinc-500 dark:text-zinc-400">Include integrated CopyButton</div>
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Best Practices
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            <div className="p-6 flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2">Use AI Prompts as foundation</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  The prompts include all system specifications. Modify them according to your needs but maintain the base structure for consistency.
                </p>
              </div>
            </div>
            <div className="p-6 flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2">Respect the Zinc scale</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Keep semantic colors (success, error, warning, info) but use Zinc for all neutral elements.
                </p>
              </div>
            </div>
            <div className="p-6 flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2">Maintain the 8px grid</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  All spacing should be multiples of 8px (8, 16, 24, 32, etc.) to maintain visual consistency.
                </p>
              </div>
            </div>
            <div className="p-6 flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2">Implement light/dark mode from the start</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  All components include complete support. Don't wait until the end to implement dark mode.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started CTA */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Ready to get started?
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
          Explore the components in the left sidebar. Each includes complete code, AI prompts, and Figma export options.
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-700 text-zinc-50 rounded-lg font-semibold">
            <Layers className="w-5 h-5" />
            <span>Explore Components</span>
          </div>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg font-semibold">
            <Sparkles className="w-5 h-5" />
            <span>View AI Prompts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
