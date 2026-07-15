import { useState, useEffect } from 'react';
import { 
  Key, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Upload,
  RefreshCw,
  Download
} from 'lucide-react';
import { 
  FigmaAPIClient, 
  FigmaTokenStorage, 
  parseFigmaUrl,
  validateFigmaToken,
  getFigmaUser
} from '../utils/figmaApi';

export function FigmaIntegrationPanel() {
  const [accessToken, setAccessToken] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [figmaUser, setFigmaUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [extractedData, setExtractedData] = useState<any>(null);

  useEffect(() => {
    // Load saved token
    const savedToken = FigmaTokenStorage.get();
    if (savedToken) {
      setAccessToken(savedToken);
      checkTokenValidity(savedToken);
    }
  }, []);

  const checkTokenValidity = async (token: string) => {
    setIsLoading(true);
    try {
      const valid = await validateFigmaToken(token);
      setIsTokenValid(valid);
      
      if (valid) {
        const user = await getFigmaUser(token);
        setFigmaUser(user);
        FigmaTokenStorage.save(token);
      }
    } catch (error) {
      setIsTokenValid(false);
      setFigmaUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToken = async () => {
    if (!accessToken.trim()) {
      alert('Please enter a valid Figma access token');
      return;
    }

    await checkTokenValidity(accessToken);
  };

  const handleRemoveToken = () => {
    FigmaTokenStorage.remove();
    setAccessToken('');
    setIsTokenValid(null);
    setFigmaUser(null);
  };

  const handleImportFromFigma = async () => {
    if (!accessToken || !isTokenValid) {
      alert('Please configure a valid Figma access token first');
      return;
    }

    if (!figmaUrl.trim()) {
      alert('Please enter a Figma file URL');
      return;
    }

    const parsed = parseFigmaUrl(figmaUrl);
    if (!parsed) {
      alert('Invalid Figma URL format');
      return;
    }

    setIsLoading(true);
    setImportStatus('Connecting to Figma...');

    try {
      const client = new FigmaAPIClient(accessToken);
      
      setImportStatus('Fetching file data...');
      const file = await client.getFile(parsed.fileKey);
      
      setImportStatus('Extracting color tokens...');
      const colorTokens = await client.extractColorTokens(parsed.fileKey);
      
      setImportStatus('Extracting text styles...');
      const textStyles = await client.extractTextStyles(parsed.fileKey);
      
      setImportStatus('Extracting components...');
      const components = await client.extractComponents(parsed.fileKey);
      
      setExtractedData({
        fileName: file.name,
        lastModified: file.lastModified,
        colorTokens,
        textStyles,
        components,
        fileKey: parsed.fileKey,
      });
      
      setImportStatus('Import successful!');
      
      setTimeout(() => {
        setImportStatus('');
      }, 3000);
    } catch (error: any) {
      console.error('Figma import error:', error);
      setImportStatus(`Error: ${error.message}`);
      
      setTimeout(() => {
        setImportStatus('');
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadExtractedData = () => {
    if (!extractedData) return;
    
    const json = JSON.stringify(extractedData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `figma-extract-${extractedData.fileKey}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Figma Integration
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Connect your Figma account to import design tokens, components, and styles directly into Strata DS.
        </p>
      </div>

      {/* Token Configuration */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Access Token Configuration
          </h3>
          {isTokenValid && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Token Valid</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <Key className="w-4 h-4" />
            How to get your Figma Access Token:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
            <li>Go to <a href="https://www.figma.com/settings" target="_blank" rel="noopener noreferrer" className="underline">Figma Settings</a></li>
            <li>Scroll to "Personal access tokens"</li>
            <li>Click "Create new token"</li>
            <li>Give it a name (e.g., "Strata DS Integration")</li>
            <li>Copy the token and paste it below</li>
          </ol>
          <a
            href="https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
          >
            <ExternalLink className="w-3 h-3" />
            View Figma Documentation
          </a>
        </div>

        {/* Token Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Figma Personal Access Token
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-mono text-zinc-900 dark:text-zinc-50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleSaveToken}
                disabled={isLoading || !accessToken.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white rounded-md font-semibold transition-colors"
              >
                {isLoading ? 'Validating...' : 'Save Token'}
              </button>
              {isTokenValid && (
                <button
                  onClick={handleRemoveToken}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Token Status */}
          {isTokenValid === false && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900 dark:text-red-100">Invalid Token</p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Please check your Figma access token and try again.
                </p>
              </div>
            </div>
          )}

          {isTokenValid && figmaUser && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
              <p className="text-sm text-emerald-900 dark:text-emerald-100">
                <strong>Connected as:</strong> {figmaUser.email || 'Figma User'}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                Token is valid and ready to use
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File Import */}
      {isTokenValid && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Import from Figma File
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Figma File URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  placeholder="https://www.figma.com/file/..."
                  className="flex-1 px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-50"
                />
                <button
                  onClick={handleImportFromFigma}
                  disabled={isLoading}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-400 text-white rounded-md font-semibold transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Import
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Import Status */}
            {importStatus && (
              <div className={`rounded-lg p-3 ${
                importStatus.startsWith('Error')
                  ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                  : importStatus.includes('successful')
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800'
              }`}>
                <p className={`text-sm ${
                  importStatus.startsWith('Error')
                    ? 'text-red-900 dark:text-red-100'
                    : importStatus.includes('successful')
                    ? 'text-emerald-900 dark:text-emerald-100'
                    : 'text-blue-900 dark:text-blue-100'
                }`}>
                  {importStatus}
                </p>
              </div>
            )}

            {/* Extracted Data Preview */}
            {extractedData && (
              <div className="space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">
                      Extracted Data from: {extractedData.fileName}
                    </h4>
                    <button
                      onClick={downloadExtractedData}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download JSON
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-600 dark:text-zinc-400">Color Tokens</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {Object.keys(extractedData.colorTokens).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-600 dark:text-zinc-400">Components</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {extractedData.components.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-zinc-600 dark:text-zinc-400">Last Modified</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {new Date(extractedData.lastModified).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Color Tokens Preview */}
                  {Object.keys(extractedData.colorTokens).length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                        Color Tokens Sample
                      </h5>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(extractedData.colorTokens).slice(0, 8).map(([name, hex]: [string, any]) => (
                          <div key={name} className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded border border-zinc-300 dark:border-zinc-700 flex-shrink-0"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                              {name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Next Steps:</strong> Review the extracted data and integrate it into your design system. 
                    You can download the JSON file to save this extraction.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documentation */}
      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-3">
          What can you import from Figma?
        </h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>Color Tokens:</strong> Extract all color styles from your Figma file</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>Text Styles:</strong> Import typography settings (font families, sizes, weights)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>Components:</strong> Get a list of all components with metadata</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>File Info:</strong> Name, last modified date, and version information</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
