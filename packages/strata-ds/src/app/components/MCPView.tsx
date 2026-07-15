import { useState } from 'react';
import { Code2, Sparkles, Terminal, Copy, CheckCircle2, Download } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

export function MCPView() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50">
            Model Context Protocol (MCP)
          </h1>
          <span className="inline-flex items-center px-3 py-1 rounded-md bg-violet-600 dark:bg-violet-700 text-white text-xs font-bold tracking-wider uppercase">
            AI-Native
          </span>
        </div>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-6 max-w-4xl">
          Seamlessly integrate Strata DS with AI assistants like Claude, ChatGPT, and custom LLMs using the Model Context Protocol. Enable AI to directly access and generate components from the design system.
        </p>
      </div>

      {/* What is MCP */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          What is Model Context Protocol?
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                  AI-First Integration
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                  MCP is an <strong>open protocol</strong> that enables AI assistants to securely connect to external data sources and tools. It provides a standardized way for LLMs to interact with your design system.
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Instead of copying prompts manually, AI assistants can <strong>directly query</strong> components, tokens, and documentation in real-time.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Terminal className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                  How It Works
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                  The MCP server acts as a <strong>bridge</strong> between AI models and the Strata DS design system. When you ask an AI to create a button, it queries the MCP server for specifications and generates code instantly.
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  This ensures <strong>100% accuracy</strong> with the latest design system specifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Why Use MCP?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Real-Time Data
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              AI always has access to the latest components and tokens. No need to manually update prompts.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              100% Accurate
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Generated components always match design system specs. No hallucinations or outdated code.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Context-Aware
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              AI understands relationships between components, tokens, and foundations automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Setup Instructions
        </h2>
        
        {/* Step 1: Install */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-zinc-900 dark:bg-zinc-700 text-zinc-50 rounded-full text-sm font-bold">1</span>
            Install MCP Client
          </h3>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Install the Strata DS MCP client package via npm or use our Docker container.
            </p>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">NPM Installation</span>
                  <button
                    onClick={() => handleCopy('npm install @strata-ds/mcp-client', 'npm-install')}
                    className="flex items-center gap-2 px-3 py-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md text-xs transition-colors"
                  >
                    {copiedCode === 'npm-install' ? (
                      <><CheckCircle2 className="w-3 h-3" /> Copied!</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy</>
                    )}
                  </button>
                </div>
                <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4">
                  <pre className="text-sm text-emerald-400 font-mono">
                    <code>npm install @strata-ds/mcp-client</code>
                  </pre>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Docker Container</span>
                  <button
                    onClick={() => handleCopy('docker pull strata-ds/mcp-server:latest', 'docker-install')}
                    className="flex items-center gap-2 px-3 py-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md text-xs transition-colors"
                  >
                    {copiedCode === 'docker-install' ? (
                      <><CheckCircle2 className="w-3 h-3" /> Copied!</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy</>
                    )}
                  </button>
                </div>
                <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4">
                  <pre className="text-sm text-emerald-400 font-mono">
                    <code>docker pull strata-ds/mcp-server:latest</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Configure */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-zinc-900 dark:bg-zinc-700 text-zinc-50 rounded-full text-sm font-bold">2</span>
            Configure MCP Server
          </h3>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Create a configuration file to connect the MCP server to your AI assistant.
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">mcp-config.json</span>
              <button
                onClick={() => handleCopy(`{
  "mcpServers": {
    "strata-ds": {
      "command": "npx",
      "args": ["@strata-ds/mcp-client"],
      "env": {
        "STRATA_API_KEY": "your-api-key-here"
      }
    }
  }
}`, 'mcp-config')}
                className="flex items-center gap-2 px-3 py-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md text-xs transition-colors"
              >
                {copiedCode === 'mcp-config' ? (
                  <><CheckCircle2 className="w-3 h-3" /> Copied!</>
                ) : (
                  <><Copy className="w-3 h-3" /> Copy</>
                )}
              </button>
            </div>
            <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4">
              <pre className="text-sm text-zinc-300 font-mono overflow-x-auto">
{`{
  "mcpServers": {
    "strata-ds": {
      "command": "npx",
      "args": ["@strata-ds/mcp-client"],
      "env": {
        "STRATA_API_KEY": "your-api-key-here"
      }
    }
  }
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Step 3: Connect */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-zinc-900 dark:bg-zinc-700 text-zinc-50 rounded-full text-sm font-bold">3</span>
            Connect to AI Assistant
          </h3>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Add the configuration to your AI assistant's MCP settings.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  Claude Desktop
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  Add to <code className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs">claude_desktop_config.json</code>
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Location: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">~/Library/Application Support/Claude/</code>
                </p>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ChatGPT
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  Use OpenAI MCP integration
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Add server URL in ChatGPT settings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Test */}
        <div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-zinc-900 dark:bg-zinc-700 text-zinc-50 rounded-full text-sm font-bold">4</span>
            Test the Connection
          </h3>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Ask your AI assistant to generate a component from Strata DS to verify the connection works.
            </p>
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-zinc-900 dark:text-zinc-50 font-semibold mb-1">Example prompt:</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">
                    "Using Strata DS, create a primary button component in React with light and dark mode support."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available MCP Tools */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Available MCP Tools
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tool Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Parameters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr>
                <td className="px-6 py-4">
                  <code className="text-sm font-mono text-indigo-600 dark:text-indigo-400">get_component</code>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                  Fetch a specific component with all code variants
                </td>
                <td className="px-6 py-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  componentId, format?
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <code className="text-sm font-mono text-indigo-600 dark:text-indigo-400">get_foundations</code>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                  Get design system foundations (colors, typography, spacing)
                </td>
                <td className="px-6 py-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  foundationType
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <code className="text-sm font-mono text-indigo-600 dark:text-indigo-400">search_components</code>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                  Search components by keyword or category
                </td>
                <td className="px-6 py-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  query, category?
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <code className="text-sm font-mono text-indigo-600 dark:text-indigo-400">list_components</code>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                  List all available components with metadata
                </td>
                <td className="px-6 py-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  status?, category?
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <code className="text-sm font-mono text-indigo-600 dark:text-indigo-400">get_tokens</code>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                  Get design tokens for a specific component
                </td>
                <td className="px-6 py-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  componentId, tokenType?
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <code className="text-sm font-mono text-indigo-600 dark:text-indigo-400">get_ai_prompt</code>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                  Get detailed AI prompt engineering template
                </td>
                <td className="px-6 py-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  componentId
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Usage Examples
        </h2>
        <div className="space-y-6">
          {/* Example 1 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Generate a Button Component</h3>
            </div>
            <div className="p-6">
              <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-900 dark:text-zinc-50 font-semibold mb-1">User:</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      "Create a primary button from Strata DS in React with hover states."
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-900 dark:text-zinc-50 font-semibold mb-2">AI Assistant:</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">
                      "I'll fetch the button component from Strata DS using MCP..."
                    </p>
                    <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4">
                      <pre className="text-xs text-zinc-300 font-mono overflow-x-auto">
{`import React from 'react';

export function Button({ children, variant = 'primary' }) {
  return (
    <button className="px-4 py-2 bg-zinc-900 dark:bg-zinc-700 
      text-zinc-50 rounded-md font-semibold 
      hover:bg-zinc-800 dark:hover:bg-zinc-600 
      transition-colors">
      {children}
    </button>
  );
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Example 2 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Get Color Tokens</h3>
            </div>
            <div className="p-6">
              <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-900 dark:text-zinc-50 font-semibold mb-1">User:</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      "What are the success and error colors in Strata DS?"
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-900 dark:text-zinc-50 font-semibold mb-2">AI Assistant:</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                      "Based on Strata DS foundations:"
                    </p>
                    <ul className="text-sm text-zinc-700 dark:text-zinc-300 space-y-1 list-disc list-inside">
                      <li><strong>Success:</strong> <code className="px-1 bg-zinc-100 dark:bg-zinc-800 rounded">#10b981</code> (Emerald 500)</li>
                      <li><strong>Error:</strong> <code className="px-1 bg-zinc-100 dark:bg-zinc-800 rounded">#ef4444</code> (Red 500)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          MCP vs Manual Prompts
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manual */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="bg-amber-50 dark:bg-amber-950/20 px-6 py-3 border-b border-amber-200 dark:border-amber-800">
              <h3 className="font-bold text-amber-900 dark:text-amber-100">Manual Prompts</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠</span>
                  <span className="text-zinc-600 dark:text-zinc-400">Must copy/paste prompts manually</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠</span>
                  <span className="text-zinc-600 dark:text-zinc-400">Prompts can become outdated</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠</span>
                  <span className="text-zinc-600 dark:text-zinc-400">AI might hallucinate details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠</span>
                  <span className="text-zinc-600 dark:text-zinc-400">No real-time token access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠</span>
                  <span className="text-zinc-600 dark:text-zinc-400">Manual updates required</span>
                </li>
              </ul>
            </div>
          </div>

          {/* MCP */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 px-6 py-3 border-b border-emerald-200 dark:border-emerald-800">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-100">With MCP</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-zinc-600 dark:text-zinc-400">AI queries components automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-zinc-600 dark:text-zinc-400">Always uses latest specifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-zinc-600 dark:text-zinc-400">100% accurate, no hallucinations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-zinc-600 dark:text-zinc-400">Real-time token and color access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-zinc-600 dark:text-zinc-400">Zero maintenance required</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Supported AI Platforms */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Supported AI Platforms
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Claude Desktop', status: 'Full Support', color: 'emerald' },
            { name: 'ChatGPT', status: 'In Beta', color: 'amber' },
            { name: 'Custom LLMs', status: 'Full Support', color: 'emerald' },
            { name: 'Cursor IDE', status: 'Coming Soon', color: 'zinc' },
          ].map((platform) => (
            <div key={platform.name} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2">{platform.name}</h4>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                platform.color === 'emerald' 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : platform.color === 'amber'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}>
                {platform.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Get Started CTA */}
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border border-violet-200 dark:border-violet-800 rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Start using MCP today
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
          Connect your AI assistant to Strata DS in minutes and experience real-time, accurate component generation.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-700 text-zinc-50 rounded-lg font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-600 transition-colors">
            <Download className="w-5 h-5" />
            <span>Download MCP Client</span>
          </button>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <Terminal className="w-5 h-5" />
            <span>View Docs</span>
          </button>
        </div>
      </div>
    </div>
  );
}