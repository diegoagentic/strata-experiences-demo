import { useState } from 'react';
import { Copy, Check, Code2, FileCode, Palette, Sparkles } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import { FigmaExport } from './FigmaExport';

export interface CodeViewerProps {
  title?: string;
  react: string;
  html: string;
  css: string;
  prompt: string;
  enableFigmaExport?: boolean;
  figmaSpecs?: Record<string, string>;
  figmaTokens?: Record<string, Record<string, string>>;
}

export function CodeViewer({
  title,
  react,
  html,
  css,
  prompt,
  enableFigmaExport = false,
  figmaSpecs,
  figmaTokens
}: CodeViewerProps) {
  const [activeTab, setActiveTab] = useState<'react' | 'html' | 'css' | 'prompt'>('react');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const content = activeTab === 'react' ? react : activeTab === 'html' ? html : activeTab === 'css' ? css : prompt;
    if (content) {
      const success = await copyToClipboard(content);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const currentContent = activeTab === 'react' ? react : activeTab === 'html' ? html : activeTab === 'css' ? css : prompt;

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Code2 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          {title && (
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Export to Figma Button */}
          {enableFigmaExport && (
            <FigmaExport
              componentName={title || 'Component'}
              htmlCode={html}
              cssCode={css}
            />
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <button
          key="react"
          onClick={() => setActiveTab('react')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded transition-colors whitespace-nowrap ${activeTab === 'react'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
        >
          <Code2 className="w-4 h-4" />
          React
        </button>
        <button
          key="html"
          onClick={() => setActiveTab('html')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded transition-colors whitespace-nowrap ${activeTab === 'html'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
        >
          <FileCode className="w-4 h-4" />
          HTML
        </button>
        <button
          key="css"
          onClick={() => setActiveTab('css')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded transition-colors whitespace-nowrap ${activeTab === 'css'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
        >
          <Palette className="w-4 h-4" />
          CSS
        </button>
        <button
          key="prompt"
          onClick={() => setActiveTab('prompt')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded transition-colors whitespace-nowrap ${activeTab === 'prompt'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Prompt
        </button>
      </div>

      {/* Code Content */}
      <div className="hidden">
        {/* Helper to keep the language class logic if needed for copy or other tools, 
            but visual rendering is now handled by CodeBlock below */}
        <pre className="text-sm leading-relaxed">
          <code className={`language-${activeTab === 'prompt' ? 'text' : activeTab}`}>
            {currentContent}
          </code>
        </pre>
      </div>
      <CodeBlock
        code={currentContent}
        language={activeTab === 'prompt' ? 'text' : activeTab}
      />
    </div>
  );
}

// Syntax highlighting component for inline code display
interface CodeBlockProps {
  code: string;
  language?: 'html' | 'react' | 'css' | 'text';
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, language = 'react', showLineNumbers = false }: CodeBlockProps) {
  const lines = code.split('\n');

  const getColorForToken = (line: string): string => {
    if (language === 'text') return 'text-zinc-700 dark:text-zinc-300';
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*') || line.trim().startsWith('<!--')) return 'text-zinc-500 dark:text-zinc-400';
    if (line.includes('import ') || line.includes('export ') || line.includes('from ')) return 'text-purple-600 dark:text-purple-300';
    if (line.includes('const ') || line.includes('let ') || line.includes('var ') || line.includes('function ') || line.includes('return ')) return 'text-blue-600 dark:text-blue-300';
    if (line.includes('className=') || line.includes('class=')) return 'text-emerald-600 dark:text-emerald-300';
    if (line.includes('<') || line.includes('/>') || line.includes('</') || line.includes('>')) return 'text-indigo-600 dark:text-indigo-300';
    if (line.includes(':') && !line.includes('//')) return 'text-sky-600 dark:text-sky-300'; // Props/CSS properties
    return 'text-zinc-900 dark:text-zinc-100';
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 rounded-lg overflow-hidden border-t border-zinc-200 dark:border-zinc-800">
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed">
          {lines.map((line, index) => (
            <div key={index} className="flex">
              {showLineNumbers && (
                <span className="inline-block w-8 text-right mr-4 text-zinc-600 dark:text-zinc-500 select-none">
                  {index + 1}
                </span>
              )}
              <code className={getColorForToken(line)}>
                {line || ' '}
              </code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}