import { 
  Code2, 
  Key, 
  Server, 
  Zap, 
  Lock, 
  CheckCircle2, 
  Copy,
  Terminal,
  Globe,
  Database,
  FileJson,
  Download,
  Upload,
  Search,
  Filter,
  Layers,
  Palette,
  Type,
  Box
} from 'lucide-react';
import { useState } from 'react';
import { copyToClipboard } from '../utils/clipboard';

export function APIView() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedEndpoint(id);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50">
            REST API Documentation
          </h1>
          <span className="inline-flex items-center px-3 py-1 rounded-md bg-emerald-600 dark:bg-emerald-700 text-white text-xs font-bold tracking-wider uppercase">
            v1.0
          </span>
        </div>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-6 max-w-4xl">
          RESTful API to programmatically access all design system foundations, components, tokens, and AI prompts. Built for scalability and ease of integration.
        </p>
      </div>

      {/* Quick Start */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Quick Start
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
              <Server className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Base URL
            </h3>
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 font-mono text-sm text-zinc-900 dark:text-zinc-50">
              https://api.strata-ds.com/v1
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
              <Key className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Authentication
            </h3>
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 font-mono text-sm text-zinc-900 dark:text-zinc-50 break-all">
              Bearer YOUR_API_KEY
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center mb-4">
              <FileJson className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Response Format
            </h3>
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 font-mono text-sm text-zinc-900 dark:text-zinc-50">
              application/json
            </div>
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Authentication
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            All API requests require authentication using an API key. Include your API key in the Authorization header of each request.
          </p>
          
          <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Request Header</span>
              <button
                onClick={() => handleCopy('Authorization: Bearer YOUR_API_KEY', 'auth-header')}
                className="flex items-center gap-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md text-xs transition-colors"
              >
                {copiedEndpoint === 'auth-header' ? (
                  <><CheckCircle2 className="w-3 h-3" /> Copied!</>
                ) : (
                  <><Copy className="w-3 h-3" /> Copy</>
                )}
              </button>
            </div>
            <pre className="text-sm text-emerald-400 font-mono overflow-x-auto">
              <code>Authorization: Bearer YOUR_API_KEY</code>
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Secure Storage
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Store API keys securely in environment variables, never commit them to version control.
              </p>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Rate Limits
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Standard: 1000 requests/hour. Enterprise: Unlimited requests with dedicated support.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Endpoints */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Core Endpoints
        </h2>
        
        {/* Foundations Endpoints */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Foundations
          </h3>
          <div className="space-y-4">
            {/* Colors Endpoint */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold">GET</span>
                    <code className="text-sm font-mono text-zinc-900 dark:text-zinc-50">/foundations/colors</code>
                  </div>
                  <button
                    onClick={() => handleCopy('GET https://api.strata-ds.com/v1/foundations/colors', 'colors-endpoint')}
                    className="flex items-center gap-2 px-3 py-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md text-xs transition-colors"
                  >
                    {copiedEndpoint === 'colors-endpoint' ? (
                      <><CheckCircle2 className="w-3 h-3" /> Copied!</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy</>
                    )}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Get all color tokens including Zinc scale, semantic colors, and data visualization palette.
                </p>
                <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Response Example</div>
                  <pre className="text-sm text-zinc-300 font-mono overflow-x-auto">
{`{
  "success": true,
  "data": {
    "zinc": {
      "50": "#fafafa",
      "100": "#f4f4f5",
      "900": "#18181b",
      "950": "#09090b"
    },
    "semantic": {
      "success": "#10b981",
      "error": "#ef4444",
      "warning": "#f59e0b",
      "info": "#3b82f6"
    },
    "dataViz": [
      "#6366f1", "#8b5cf6", "#ec4899"
    ]
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Typography Endpoint */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold">GET</span>
                    <code className="text-sm font-mono text-zinc-900 dark:text-zinc-50">/foundations/typography</code>
                  </div>
                  <button
                    onClick={() => handleCopy('GET https://api.strata-ds.com/v1/foundations/typography', 'typo-endpoint')}
                    className="flex items-center gap-2 px-3 py-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md text-xs transition-colors"
                  >
                    {copiedEndpoint === 'typo-endpoint' ? (
                      <><CheckCircle2 className="w-3 h-3" /> Copied!</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy</>
                    )}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Get complete typography scale with font sizes, weights, line heights, and letter spacing.
                </p>
                <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Response Example</div>
                  <pre className="text-sm text-zinc-300 font-mono overflow-x-auto">
{`{
  "success": true,
  "data": {
    "fontFamily": "Inter, sans-serif",
    "scale": {
      "display-lg": {
        "size": "36px",
        "lineHeight": "40px",
        "weight": 700
      },
      "heading-1": {
        "size": "30px",
        "lineHeight": "36px",
        "weight": 700
      }
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Spacing Endpoint */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold">GET</span>
                  <code className="text-sm font-mono text-zinc-900 dark:text-zinc-50">/foundations/spacing</code>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Get 8px-based spacing scale and grid system specifications.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Components Endpoints */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <Box className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            Components
          </h3>
          <div className="space-y-4">
            {/* Get All Components */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold">GET</span>
                    <code className="text-sm font-mono text-zinc-900 dark:text-zinc-50">/components</code>
                  </div>
                  <button
                    onClick={() => handleCopy('GET https://api.strata-ds.com/v1/components', 'components-endpoint')}
                    className="flex items-center gap-2 px-3 py-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md text-xs transition-colors"
                  >
                    {copiedEndpoint === 'components-endpoint' ? (
                      <><CheckCircle2 className="w-3 h-3" /> Copied!</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy</>
                    )}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Get list of all available components with metadata and status.
                </p>
                <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Response Example</div>
                  <pre className="text-sm text-zinc-300 font-mono overflow-x-auto">
{`{
  "success": true,
  "data": {
    "total": 29,
    "aiReady": 12,
    "components": [
      {
        "id": "button",
        "name": "Buttons",
        "category": "Application UI",
        "status": "ai-ready",
        "variants": 6
      }
    ]
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Get Specific Component */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold">GET</span>
                    <code className="text-sm font-mono text-zinc-900 dark:text-zinc-50">/components/:id</code>
                  </div>
                  <button
                    onClick={() => handleCopy('GET https://api.strata-ds.com/v1/components/button', 'component-id-endpoint')}
                    className="flex items-center gap-2 px-3 py-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md text-xs transition-colors"
                  >
                    {copiedEndpoint === 'component-id-endpoint' ? (
                      <><CheckCircle2 className="w-3 h-3" /> Copied!</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy</>
                    )}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Get complete component data including React, HTML, CSS code and AI prompts.
                </p>
                <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Response Example</div>
                  <pre className="text-sm text-zinc-300 font-mono overflow-x-auto">
{`{
  "success": true,
  "data": {
    "id": "button",
    "name": "Buttons",
    "category": "Application UI",
    "description": "Interactive button components...",
    "code": {
      "react": "import React from 'react'...",
      "html": "<button class='...'...",
      "css": ".btn { ... }",
      "aiPrompt": "# AI PROMPT: Generate Button..."
    },
    "tokens": {
      "colors": { ... },
      "spacing": { ... }
    },
    "figmaExport": {
      "methods": [ ... ],
      "specs": { ... }
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Get Component Code */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold">GET</span>
                  <code className="text-sm font-mono text-zinc-900 dark:text-zinc-50">/components/:id/code/:format</code>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  Get component code in specific format (react, html, css, or ai-prompt).
                </p>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  Examples: <span className="text-indigo-600 dark:text-indigo-400">/components/button/code/react</span>, 
                  <span className="text-indigo-600 dark:text-indigo-400 ml-1">/components/modal/code/ai-prompt</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <Search className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Search & Filter
          </h3>
          <div className="space-y-4">
            {/* Search Components */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold">GET</span>
                  <code className="text-sm font-mono text-zinc-900 dark:text-zinc-50">/search?q=:query</code>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  Search across all components, foundations, and tokens.
                </p>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  Example: <span className="text-indigo-600 dark:text-indigo-400">/search?q=button</span>
                </div>
              </div>
            </div>

            {/* Filter by Category */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold">GET</span>
                  <code className="text-sm font-mono text-zinc-900 dark:text-zinc-50">/components?category=:category</code>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  Filter components by category.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Application UI', 'Forms', 'Overlays', 'Navigation', 'Data'].map((cat) => (
                    <span key={cat} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-mono text-zinc-700 dark:text-zinc-300">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter by Status */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold">GET</span>
                  <code className="text-sm font-mono text-zinc-900 dark:text-zinc-50">/components?status=:status</code>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  Filter components by AI-ready status.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-xs font-mono">
                    ai-ready
                  </span>
                  <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs font-mono">
                    in-progress
                  </span>
                  <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs font-mono">
                    special
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Integration Examples
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* JavaScript/TypeScript */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">JavaScript / TypeScript</h3>
            </div>
            <div className="p-6">
              <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4">
                <pre className="text-sm text-zinc-300 font-mono overflow-x-auto">
{`// Fetch button component
const response = await fetch(
  'https://api.strata-ds.com/v1/components/button',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
console.log(data.data.code.react);`}
                </pre>
              </div>
            </div>
          </div>

          {/* Python */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Python</h3>
            </div>
            <div className="p-6">
              <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4">
                <pre className="text-sm text-zinc-300 font-mono overflow-x-auto">
{`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.strata-ds.com/v1/foundations/colors',
    headers=headers
)

data = response.json()
print(data['data']['zinc'])`}
                </pre>
              </div>
            </div>
          </div>

          {/* cURL */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">cURL</h3>
            </div>
            <div className="p-6">
              <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4">
                <pre className="text-sm text-zinc-300 font-mono overflow-x-auto">
{`curl -X GET \\
  https://api.strata-ds.com/v1/components/modal \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json'`}
                </pre>
              </div>
            </div>
          </div>

          {/* Node.js with Axios */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Node.js (Axios)</h3>
            </div>
            <div className="p-6">
              <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4">
                <pre className="text-sm text-zinc-300 font-mono overflow-x-auto">
{`const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.strata-ds.com/v1',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const { data } = await api.get('/components');
console.log(data.data.components);`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Codes */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          HTTP Response Codes
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-sm font-mono">200</span>
                </td>
                <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">OK</td>
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">Request successful</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-sm font-mono">400</span>
                </td>
                <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Bad Request</td>
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">Invalid request parameters</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm font-mono">401</span>
                </td>
                <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Unauthorized</td>
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">Invalid or missing API key</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-sm font-mono">404</span>
                </td>
                <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Not Found</td>
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">Resource not found</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm font-mono">429</span>
                </td>
                <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Too Many Requests</td>
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">Rate limit exceeded</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm font-mono">500</span>
                </td>
                <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Internal Server Error</td>
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">Server error occurred</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Best Practices */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Best Practices
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2">Cache Responses</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Design system data changes infrequently. Implement client-side caching to reduce API calls.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2">Error Handling</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Always handle errors gracefully and check response status codes before processing data.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2">Use Query Parameters</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Leverage filtering and search parameters to fetch only the data you need.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2">Version Pinning</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Use /v1 in URLs to ensure stability. We'll maintain backwards compatibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Get Started CTA */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Ready to integrate?
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
          Get your API key and start consuming the Strata DS design system programmatically in minutes.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-700 text-zinc-50 rounded-lg font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-600 transition-colors">
            <Key className="w-5 h-5" />
            <span>Get API Key</span>
          </button>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <Terminal className="w-5 h-5" />
            <span>Try in Playground</span>
          </button>
        </div>
      </div>
    </div>
  );
}