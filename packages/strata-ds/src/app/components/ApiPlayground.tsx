import { useState } from 'react';
import { Play, Copy, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import MockApiServer from '../utils/mockApi';
import { copyToClipboard } from '../utils/clipboard';

interface PlaygroundProps {
  endpoint: string;
  method?: 'GET' | 'POST';
  title: string;
  description: string;
}

export function ApiPlayground({ endpoint, method = 'GET', title, description }: PlaygroundProps) {
  const [apiKey, setApiKey] = useState('strata_test_key_12345');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await MockApiServer.get(endpoint, apiKey);
      setResponse(result);
    } catch (err: any) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = async () => {
    if (response) {
      const success = await copyToClipboard(JSON.stringify(response, null, 2));
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const copyCurl = async () => {
    const success = await copyToClipboard(curlCommand);
    if (success) {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  const curlCommand = MockApiServer.generateCurl(endpoint, apiKey);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold">
              {method}
            </span>
            <code className="text-sm font-mono text-zinc-900 dark:text-zinc-50">{endpoint}</code>
          </div>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* API Key Input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            API Key
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-mono text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter API key"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Use test key: <code className="px-1 bg-zinc-100 dark:bg-zinc-800 rounded">strata_test_key_12345</code>
          </p>
        </div>

        {/* Execute Button */}
        <button
          onClick={handleExecute}
          disabled={loading || !apiKey}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white rounded-md font-semibold transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Try it out
            </>
          )}
        </button>

        {/* cURL Command */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">cURL Command</h4>
            <button
              onClick={copyCurl}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              {copiedCurl ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs text-emerald-400 font-mono">{curlCommand}</pre>
          </div>
        </div>

        {/* Response */}
        {(response || error) && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                Response
                {response?.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </h4>
              {response && (
                <button
                  onClick={copyResponse}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>
            <div className={`rounded-lg p-4 overflow-x-auto ${
              response?.success 
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800' 
                : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
            }`}>
              <pre className="text-xs text-zinc-900 dark:text-zinc-50 font-mono">
                {JSON.stringify(response || { error }, null, 2)}
              </pre>
            </div>

            {/* Response Info */}
            {response && (
              <div className="mt-3 flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  Status: <strong className={response.success ? 'text-emerald-600' : 'text-red-600'}>
                    {response.success ? '200 OK' : '400 Error'}
                  </strong>
                </span>
                <span>
                  Time: <strong>~{Math.floor(300 + Math.random() * 200)}ms</strong>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}