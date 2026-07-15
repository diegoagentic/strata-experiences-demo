import { 
  Code2, 
  Key, 
  Server, 
  Zap, 
  CheckCircle2, 
  Copy,
  Terminal,
  Download,
  Book,
  PlayCircle,
  Rocket,
  AlertTriangle,
  Info,
  FileJson
} from 'lucide-react';
import { useState } from 'react';
import { ApiPlayground } from './ApiPlayground';
import MockApiServer from '../utils/mockApi';
import { copyToClipboard } from '../utils/clipboard';
import { downloadDesignTokens, copyDesignTokensToClipboard } from '../utils/designTokens';

export function APIViewImproved() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quickstart' | 'playground' | 'reference' | 'guide'>('quickstart');
  const [tokensDownloaded, setTokensDownloaded] = useState(false);

  const handleCopy = async (text: string, id: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleDownloadTokens = () => {
    downloadDesignTokens();
    setTokensDownloaded(true);
    setTimeout(() => setTokensDownloaded(false), 3000);
  };

  const handleCopyTokens = async () => {
    const success = await copyDesignTokensToClipboard();
    if (success) {
      setCopiedCode('tokens-json');
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const baseUrl = MockApiServer.getBaseUrl();
  const testApiKey = MockApiServer.getTestApiKey();

  return (
    <div>
      {/* Hero */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50">
            REST API
          </h1>
          <span className="inline-flex items-center px-3 py-1 rounded-md bg-emerald-600 text-white text-xs font-bold uppercase">
            Live & Working
          </span>
        </div>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-6 max-w-4xl">
          Programmatically access all design system foundations, components, tokens, and AI prompts. 
          <strong className="text-zinc-900 dark:text-zinc-50"> Try it now with our interactive playground!</strong>
        </p>

        {/* Status Banner */}
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">
              ✅ Mock API Server Active
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              You can test all endpoints right now using our mock server. No backend setup required! 
              All responses are realistic and based on actual design system data.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-2">
          {[
            { id: 'quickstart' as const, label: 'Quick Start', icon: Rocket },
            { id: 'playground' as const, label: 'Try It Live', icon: PlayCircle },
            { id: 'reference' as const, label: 'API Reference', icon: Book },
            { id: 'guide' as const, label: 'Integration Guide', icon: Code2 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold transition-colors ${
                activeTab === id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Start Tab */}
      {activeTab === 'quickstart' && (
        <div className="space-y-8">
          {/* Step by Step */}
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
              Get Started in 3 Steps
            </h2>

            {/* Step 1 */}
            <div className="mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                    Get Your API Key
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    For testing, use our demo API key. In production, you'll need to register for your own key.
                  </p>
                  <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Test API Key</span>
                      <button
                        onClick={() => handleCopy(testApiKey, 'apikey')}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        {copiedCode === 'apikey' ? (
                          <><CheckCircle2 className="w-3 h-3" /> Copied!</>
                        ) : (
                          <><Copy className="w-3 h-3" /> Copy</>
                        )}
                      </button>
                    </div>
                    <code className="text-sm font-mono text-zinc-900 dark:text-zinc-50 break-all">
                      {testApiKey}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                    Make Your First Request
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Try fetching all components. Include your API key in the <code className="px-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs">x-api-key</code> header.
                  </p>
                  
                  {/* Code Examples */}
                  <div className="space-y-4">
                    {/* cURL */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">cURL</span>
                        <button
                          onClick={() => handleCopy(MockApiServer.generateCurl('/components'), 'curl1')}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          {copiedCode === 'curl1' ? (
                            <><CheckCircle2 className="w-3 h-3" /> Copied!</>
                          ) : (
                            <><Copy className="w-3 h-3" /> Copy</>
                          )}
                        </button>
                      </div>
                      <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-xs text-emerald-400 font-mono">
                          {MockApiServer.generateCurl('/components')}
                        </pre>
                      </div>
                    </div>

                    {/* JavaScript */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">JavaScript</span>
                        <button
                          onClick={() => handleCopy(MockApiServer.generateFetch('/components'), 'js1')}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          {copiedCode === 'js1' ? (
                            <><CheckCircle2 className="w-3 h-3" /> Copied!</>
                          ) : (
                            <><Copy className="w-3 h-3" /> Copy</>
                          )}
                        </button>
                      </div>
                      <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-xs text-zinc-300 font-mono">
                          {MockApiServer.generateFetch('/components')}
                        </pre>
                      </div>
                    </div>

                    {/* Python */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Python</span>
                        <button
                          onClick={() => handleCopy(MockApiServer.generatePython('/components'), 'py1')}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          {copiedCode === 'py1' ? (
                            <><CheckCircle2 className="w-3 h-3" /> Copied!</>
                          ) : (
                            <><Copy className="w-3 h-3" /> Copy</>
                          )}
                        </button>
                      </div>
                      <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-xs text-zinc-300 font-mono">
                          {MockApiServer.generatePython('/components')}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                    Use the Response
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    All responses are in JSON format with a consistent structure.
                  </p>
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <pre className="text-xs text-zinc-900 dark:text-zinc-50 font-mono overflow-x-auto">
{`{
  "success": true,
  "data": {
    "stats": {
      "total": 29,
      "aiReady": 12,
      "inProgress": 15,
      "special": 2
    },
    "components": [
      {
        "id": "button",
        "name": "Buttons",
        "category": "Application UI",
        "status": "ai-ready",
        "description": "Interactive button components...",
        "variants": 6,
        "code": {
          "react": "import React...",
          "html": "<button...",
          "css": ".btn...",
          "aiPrompt": "# AI PROMPT..."
        }
      }
      // ... more components
    ]
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Base URL Info */}
          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center gap-2">
              <Server className="w-5 h-5" />
              Base URL
            </h3>
            <code className="text-sm font-mono text-indigo-700 dark:text-indigo-300">
              {baseUrl}
            </code>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-2">
              All endpoints are relative to this base URL. Currently using mock server for demonstration.
            </p>
          </div>
        </div>
      )}

      {/* Playground Tab */}
      {activeTab === 'playground' && (
        <div className="space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Interactive API Testing
            </h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              Test any endpoint directly from your browser. All requests use our mock server with realistic data. 
              Perfect for developers, prompt engineers, and AI agents to understand the API structure.
            </p>
          </div>

          <ApiPlayground
            endpoint="/foundations/colors"
            title="Get Color Palette"
            description="Retrieve the complete color system including Zinc scale, semantic colors, and data visualization palette"
          />

          <ApiPlayground
            endpoint="/components"
            title="List All Components"
            description="Get a list of all available components with metadata and AI-ready status"
          />

          <ApiPlayground
            endpoint="/components/button"
            title="Get Button Component"
            description="Retrieve complete button component with React, HTML, CSS code and AI prompts"
          />

          <ApiPlayground
            endpoint="/components/button/code/react"
            title="Get React Code"
            description="Get only the React code for the button component"
          />

          <ApiPlayground
            endpoint="/components/button/code/ai-prompt"
            title="Get AI Prompt"
            description="Get the detailed AI prompt engineering template for generating the button component"
          />

          <ApiPlayground
            endpoint="/search?q=button"
            title="Search Components"
            description="Search across all components by name, description, or category"
          />
        </div>
      )}

      {/* API Reference Tab */}
      {activeTab === 'reference' && (
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Complete API Reference
          </h2>

          {/* Foundations */}
          <div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Foundations Endpoints
            </h3>
            <div className="space-y-4">
              {[
                { endpoint: '/foundations', desc: 'Get all foundations (colors, typography, spacing, etc.)' },
                { endpoint: '/foundations/colors', desc: 'Get color palette (Zinc + semantic + data viz)' },
                { endpoint: '/foundations/typography', desc: 'Get typography system (font scale, weights)' },
                { endpoint: '/foundations/spacing', desc: 'Get spacing system (8px grid)' },
                { endpoint: '/foundations/borders', desc: 'Get border system (radius, width)' },
                { endpoint: '/foundations/shadows', desc: 'Get shadow/elevation system' }
              ].map((item) => (
                <div key={item.endpoint} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold">GET</span>
                    <code className="text-sm font-mono text-zinc-900 dark:text-zinc-50">{item.endpoint}</code>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Components */}
          <div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Components Endpoints
            </h3>
            <div className="space-y-4">
              {[
                { endpoint: '/components', desc: 'List all components with stats and metadata' },
                { endpoint: '/components?category=Application UI', desc: 'Filter components by category' },
                { endpoint: '/components?status=ai-ready', desc: 'Filter by AI-ready status' },
                { endpoint: '/components/:id', desc: 'Get specific component (e.g., /components/button)' },
                { endpoint: '/components/:id/code/react', desc: 'Get React code for component' },
                { endpoint: '/components/:id/code/html', desc: 'Get HTML code for component' },
                { endpoint: '/components/:id/code/css', desc: 'Get CSS code for component' },
                { endpoint: '/components/:id/code/ai-prompt', desc: 'Get AI prompt for generating component' },
                { endpoint: '/components/:id/tokens', desc: 'Get design tokens for component' }
              ].map((item) => (
                <div key={item.endpoint} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold">GET</span>
                    <code className="text-sm font-mono text-zinc-900 dark:text-zinc-50">{item.endpoint}</code>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Search Endpoint
            </h3>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold">GET</span>
                <code className="text-sm font-mono text-zinc-900 dark:text-zinc-50">/search?q=:query</code>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                Search components by name, description, or category
              </p>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Example: <code className="px-1 bg-zinc-100 dark:bg-zinc-800 rounded">/search?q=button&limit=10</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integration Guide Tab */}
      {activeTab === 'guide' && (
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
            Integration Guide
          </h2>

          {/* For Developers */}
          <div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              For Developers
            </h3>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-3">Use Case: Fetch Components Programmatically</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Integrate Strata DS components into your build pipeline or documentation generator.
              </p>
              <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-zinc-300 font-mono">
{`// Example: Load all AI-ready components
async function loadDesignSystem() {
  const response = await fetch('${baseUrl}/components?status=ai-ready', {
    headers: { 'x-api-key': '${testApiKey}' }
  });
  
  const { data } = await response.json();
  
  // Process components
  data.components.forEach(component => {
    console.log(\`\${component.name}: \${component.variants} variants\`);
    
    // Access code examples
    if (component.code) {
      const reactCode = component.code.react;
      const htmlCode = component.code.html;
      // Use in your app...
    }
  });
}

loadDesignSystem();`}
                </pre>
              </div>
            </div>
          </div>

          {/* For Prompt Engineers */}
          <div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              For Prompt Engineers
            </h3>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-3">Use Case: Generate Components with AI</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Fetch AI prompts to guide LLMs in generating accurate components.
              </p>
              <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4 overflow-x-auto mb-4">
                <pre className="text-xs text-zinc-300 font-mono">
{`// Get AI prompt for button component
const response = await fetch(
  '${baseUrl}/components/button/code/ai-prompt',
  { headers: { 'x-api-key': '${testApiKey}' } }
);

const { data } = await response.json();
const aiPrompt = data.code;

// Send to LLM (OpenAI, Claude, etc.)
const completion = await openai.createCompletion({
  prompt: aiPrompt,
  model: 'gpt-4'
});`}
                </pre>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Pro Tip:</strong> Use the <code className="px-1 bg-amber-100 dark:bg-amber-900 rounded">/code/ai-prompt</code> endpoint 
                    to get detailed, pre-engineered prompts that include all design tokens and specifications.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* For AI Agents */}
          <div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              For AI Agents
            </h3>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-3">Use Case: Autonomous Component Generation</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                AI agents can autonomously discover, fetch, and generate components.
              </p>
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2 text-sm">Step 1: Discover Components</h5>
                  <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded block">
                    GET /components → List all available components
                  </code>
                </div>
                <div>
                  <h5 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2 text-sm">Step 2: Search for Specific Needs</h5>
                  <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded block">
                    GET /search?q=navigation → Find navigation components
                  </code>
                </div>
                <div>
                  <h5 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2 text-sm">Step 3: Fetch Full Component Data</h5>
                  <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded block">
                    GET /components/navbar → Get navbar with all code examples
                  </code>
                </div>
                <div>
                  <h5 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2 text-sm">Step 4: Access Design Tokens</h5>
                  <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded block">
                    GET /foundations/colors → Get color palette for customization
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Error Handling */}
          <div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Error Handling
            </h3>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                All errors follow a consistent format:
              </p>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <pre className="text-xs text-zinc-900 dark:text-zinc-50 font-mono">
{`{
  "success": false,
  "error": {
    "message": "Component 'invalid-id' not found",
    "code": "COMPONENT_NOT_FOUND"
  }
}`}
                </pre>
              </div>
              <div className="mt-4">
                <h5 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2 text-sm">Common Error Codes:</h5>
                <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                  <li><code className="px-1 bg-zinc-100 dark:bg-zinc-800 rounded">UNAUTHORIZED</code> - Missing or invalid API key</li>
                  <li><code className="px-1 bg-zinc-100 dark:bg-zinc-800 rounded">NOT_FOUND</code> - Endpoint or resource not found</li>
                  <li><code className="px-1 bg-zinc-100 dark:bg-zinc-800 rounded">COMPONENT_NOT_FOUND</code> - Component ID doesn't exist</li>
                  <li><code className="px-1 bg-zinc-100 dark:bg-zinc-800 rounded">INVALID_FORMAT</code> - Invalid code format requested</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-12 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Ready to integrate?
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
          Start using the Strata DS API in your projects today. All endpoints are live and ready to test.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setActiveTab('playground')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
          >
            <PlayCircle className="w-5 h-5" />
            <span>Try Interactive Playground</span>
          </button>
          <button
            onClick={() => handleCopy(testApiKey, 'final-key')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {copiedCode === 'final-key' ? (
              <><CheckCircle2 className="w-5 h-5" /> API Key Copied!</>
            ) : (
              <><Key className="w-5 h-5" /> Copy Test API Key</>
            )}
          </button>
          <button
            onClick={handleDownloadTokens}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {tokensDownloaded ? (
              <><CheckCircle2 className="w-5 h-5" /> Tokens Downloaded!</>
            ) : (
              <><Download className="w-5 h-5" /> Download Design Tokens</>
            )}
          </button>
          <button
            onClick={handleCopyTokens}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {copiedCode === 'tokens-json' ? (
              <><CheckCircle2 className="w-5 h-5" /> Tokens Copied!</>
            ) : (
              <><FileJson className="w-5 h-5" /> Copy Design Tokens</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}