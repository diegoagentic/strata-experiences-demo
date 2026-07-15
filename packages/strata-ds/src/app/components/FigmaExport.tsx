import React from 'react';
import { Download, Copy, CheckCircle2, X, Code, FileCode, Puzzle, CloudUpload } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

interface FigmaExportProps {
  componentName: string;
  htmlCode: string;
  cssCode?: string;
}

type ExportMethod = 'plugin' | 'copy-paste' | 'html-to-design' | 'download';

interface Method {
  id: ExportMethod;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  recommended?: boolean;
  icon: typeof Code;
}

export function FigmaExport({ componentName, htmlCode, cssCode }: FigmaExportProps) {
  const [copied, setCopied] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeMethod, setActiveMethod] = React.useState<ExportMethod>('copy-paste');

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const fullHTML = getFullHTML();
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${componentName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate combined HTML + CSS for plugins
  const getFullHTML = () => {
    if (!htmlCode) return '';
    
    let fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName}</title>
`;
    
    if (cssCode) {
      fullHTML += `  <style>
${cssCode}
  </style>
`;
    }
    
    fullHTML += `</head>
<body>
${htmlCode}
</body>
</html>`;
    
    return fullHTML;
  };

  const methods: Method[] = [
    {
      id: 'copy-paste',
      title: 'Copy & Paste',
      description: 'Copy HTML code and paste directly into Figma',
      difficulty: 'easy',
      recommended: true,
      icon: Copy
    },
    {
      id: 'plugin',
      title: 'HTML to Figma Plugin',
      description: 'Use the HTML to Figma plugin for advanced conversion',
      difficulty: 'medium',
      icon: Puzzle
    },
    {
      id: 'html-to-design',
      title: 'HTML.to.design',
      description: 'Import using HTML.to.design service',
      difficulty: 'easy',
      icon: CloudUpload
    },
    {
      id: 'download',
      title: 'Download HTML',
      description: 'Download HTML file to import with external tools',
      difficulty: 'easy',
      icon: Download
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400';
      case 'advanced':
        return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  const renderMethodContent = () => {
    const activeMethodData = methods.find(m => m.id === activeMethod);
    
    switch (activeMethod) {
      case 'copy-paste':
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="text-2xl">✨</div>
              <div>
                <h5 className="font-bold text-blue-900 dark:text-blue-100 mb-1">
                  Easiest Method
                </h5>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Copy the HTML code and paste directly into Figma. Works for simple components.
                </p>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Steps:</h5>
              <ol className="space-y-2 list-decimal list-inside text-sm text-zinc-600 dark:text-zinc-400">
                <li>Copy the HTML code below</li>
                <li>Open Figma and select a frame</li>
                <li>Paste (Cmd/Ctrl + V)</li>
                <li>Figma will automatically convert it to layers</li>
              </ol>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-zinc-900 dark:text-zinc-50">HTML Code</h5>
                <button
                  onClick={() => handleCopy(htmlCode)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy HTML
                    </>
                  )}
                </button>
              </div>
              <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4 overflow-x-auto max-h-96">
                <pre className="text-xs text-zinc-300 font-mono">
                  {htmlCode}
                </pre>
              </div>
            </div>
          </div>
        );

      case 'plugin':
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="text-2xl">🔌</div>
              <div>
                <h5 className="font-bold text-purple-900 dark:text-purple-100 mb-1">
                  Advanced Conversion
                </h5>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Use Figma plugins for more accurate HTML to design conversion with better styling preservation.
                </p>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Recommended Plugins:</h5>
              <div className="space-y-3">
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <h6 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">HTML to Figma</h6>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                    Official plugin that converts HTML/CSS to Figma layers
                  </p>
                  <a
                    href="https://www.figma.com/community/plugin/1159123024924461424"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Install from Figma Community →
                  </a>
                </div>

                <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <h6 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Builder.io</h6>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                    Convert HTML to Figma with advanced options
                  </p>
                  <a
                    href="https://www.figma.com/community/plugin/747985167520967365"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Install from Figma Community →
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Usage:</h5>
              <ol className="space-y-2 list-decimal list-inside text-sm text-zinc-600 dark:text-zinc-400">
                <li>Install one of the plugins above</li>
                <li>Copy the full HTML code (with CSS)</li>
                <li>Run the plugin in Figma</li>
                <li>Paste the code when prompted</li>
                <li>The plugin will generate Figma layers</li>
              </ol>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-zinc-900 dark:text-zinc-50">Full HTML + CSS</h5>
                <button
                  onClick={() => handleCopy(getFullHTML())}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy Full HTML
                    </>
                  )}
                </button>
              </div>
              <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4 overflow-x-auto max-h-96">
                <pre className="text-xs text-zinc-300 font-mono">
                  {getFullHTML()}
                </pre>
              </div>
            </div>
          </div>
        );

      case 'html-to-design':
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
              <div className="text-2xl">☁️</div>
              <div>
                <h5 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">
                  Cloud Service
                </h5>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Use HTML.to.design cloud service for high-quality conversion without plugins.
                </p>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Steps:</h5>
              <ol className="space-y-2 list-decimal list-inside text-sm text-zinc-600 dark:text-zinc-400">
                <li>Go to <a href="https://html.to.design" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">html.to.design</a></li>
                <li>Copy the HTML code below</li>
                <li>Paste it into the converter</li>
                <li>Download the .fig file</li>
                <li>Import the .fig file into Figma</li>
              </ol>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-zinc-900 dark:text-zinc-50">HTML Code</h5>
                <button
                  onClick={() => handleCopy(getFullHTML())}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy HTML
                    </>
                  )}
                </button>
              </div>
              <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4 overflow-x-auto max-h-96">
                <pre className="text-xs text-zinc-300 font-mono">
                  {getFullHTML()}
                </pre>
              </div>
            </div>
          </div>
        );

      case 'download':
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="text-2xl">💾</div>
              <div>
                <h5 className="font-bold text-amber-900 dark:text-amber-100 mb-1">
                  Download HTML File
                </h5>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Download a complete HTML file to use with external conversion tools.
                </p>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">What you'll get:</h5>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Complete HTML file with embedded CSS</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Ready to open in any browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Compatible with HTML-to-Figma conversion tools</span>
                </li>
              </ul>
            </div>

            <div>
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Download className="w-5 h-5" />
                Download {componentName}.html
              </button>
            </div>

            <div>
              <h5 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-3">File Preview:</h5>
              <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4 overflow-x-auto max-h-96">
                <pre className="text-xs text-zinc-300 font-mono">
                  {getFullHTML()}
                </pre>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold text-sm transition-colors"
      >
        <FileCode className="w-4 h-4" />
        Export to Figma
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-zinc-200 dark:border-zinc-800">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <FileCode className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
                    Export to Figma
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {componentName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>

            {/* Body */}
            <div className="flex h-[calc(90vh-80px)]">
              {/* Sidebar - Methods */}
              <div className="w-72 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 overflow-y-auto">
                <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-3">
                  Export Methods
                </h4>
                <div className="space-y-2">
                  {methods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setActiveMethod(method.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          activeMethod === method.id
                            ? 'bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700'
                            : 'hover:bg-white dark:hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              activeMethod === method.id
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
                                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">
                                {method.title}
                              </span>
                              {method.recommended && (
                                <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded">
                                  ★
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-2">
                              {method.description}
                            </p>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getDifficultyColor(
                                method.difficulty
                              )}`}
                            >
                              {getDifficultyLabel(method.difficulty)}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {renderMethodContent()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
