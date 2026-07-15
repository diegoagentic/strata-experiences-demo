import { useState } from 'react';
import { Copy, Check, ChevronDown } from 'lucide-react';

export interface CopyFormat {
  label: string;
  value: string;
  description?: string;
}

interface CopyButtonProps {
  formats: CopyFormat[];
  defaultFormat?: number;
  size?: 'sm' | 'md';
}

export function CopyButton({ formats, defaultFormat = 0, size = 'md' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(defaultFormat);

  const handleCopy = async (formatIndex: number) => {
    const format = formats[formatIndex];
    
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(format.value);
      } else {
        // Fallback for environments where Clipboard API is blocked
        copyToClipboardFallback(format.value);
      }
      
      setSelectedFormat(formatIndex);
      setCopied(true);
      setShowMenu(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // If Clipboard API fails, use fallback method
      try {
        copyToClipboardFallback(format.value);
        setSelectedFormat(formatIndex);
        setCopied(true);
        setShowMenu(false);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy:', fallbackErr);
      }
    }
  };

  const copyToClipboardFallback = (text: string) => {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    
    // Select and copy the text
    textarea.focus();
    textarea.select();
    
    try {
      document.execCommand('copy');
      textarea.remove();
    } catch (err) {
      textarea.remove();
      throw err;
    }
  };

  const sizeClasses = {
    sm: 'h-7 px-2 text-xs',
    md: 'h-8 px-3 text-sm',
  };

  if (formats.length === 1) {
    // Single format - simple button
    return (
      <button
        onClick={() => handleCopy(0)}
        className={`${sizeClasses[size]} inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded font-mono font-medium text-zinc-700 dark:text-zinc-300 transition-all`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>
    );
  }

  // Multiple formats - dropdown button
  return (
    <div className="relative">
      <div className="flex gap-0">
        {/* Main copy button */}
        <button
          onClick={() => handleCopy(selectedFormat)}
          className={`${sizeClasses[size]} inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded-l font-mono font-medium text-zinc-700 dark:text-zinc-300 transition-all`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="truncate max-w-[80px]">{formats[selectedFormat].label}</span>
            </>
          )}
        </button>

        {/* Dropdown trigger */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`${sizeClasses[size]} inline-flex items-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-l-0 border border-zinc-300 dark:border-zinc-700 rounded-r text-zinc-700 dark:text-zinc-300 transition-all px-1.5`}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 py-1">
            {formats.map((format, index) => (
              <button
                key={index}
                onClick={() => handleCopy(index)}
                className="w-full px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {format.label}
                  </span>
                  {selectedFormat === index && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      Selected
                    </span>
                  )}
                </div>
                <code className="text-xs font-mono text-zinc-600 dark:text-zinc-400 block truncate">
                  {format.value}
                </code>
                {format.description && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 block">
                    {format.description}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
