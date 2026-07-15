import { useState, useEffect } from 'react';
import { 
  Upload, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Clock, 
  Users, 
  Bell,
  GitBranch,
  Package,
  Link as LinkIcon,
  Copy,
  ExternalLink
} from 'lucide-react';
import { FigmaIntegrationPanel } from './FigmaIntegrationPanel';

interface ComponentUpdate {
  id: string;
  name: string;
  version: string;
  source: 'figma' | 'manual' | 'ai-prompt';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: string;
  changeType: 'major' | 'minor' | 'patch';
}

interface VersionInfo {
  current: string;
  latest: string;
  hasUpdates: boolean;
  breakingChanges: number;
  affectedComponents: string[];
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'updates' | 'versions' | 'sync' | 'notifications' | 'figma'>('updates');
  const [updates, setUpdates] = useState<ComponentUpdate[]>([]);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [figmaUrl, setFigmaUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    // Use mock data directly instead of trying to fetch
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Set mock version info
    setVersionInfo({
      current: '2.0.0',
      latest: '2.1.0',
      hasUpdates: true,
      breakingChanges: 0,
      affectedComponents: ['Button', 'Modal', 'Input'],
    });

    // Set mock updates
    const mockUpdates: ComponentUpdate[] = [
      {
        id: '1',
        name: 'Primary Button',
        version: '2.0.0',
        source: 'figma',
        status: 'completed',
        timestamp: new Date().toISOString(),
        changeType: 'minor',
      },
      {
        id: '2',
        name: 'Modal Component',
        version: '1.5.0',
        source: 'manual',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        changeType: 'patch',
      },
      {
        id: '3',
        name: 'Input Field',
        version: '1.3.0',
        source: 'ai-prompt',
        status: 'completed',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        changeType: 'major',
      },
      {
        id: '4',
        name: 'Card Component',
        version: '1.8.0',
        source: 'figma',
        status: 'completed',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        changeType: 'minor',
      },
      {
        id: '5',
        name: 'Navigation Bar',
        version: '2.1.0',
        source: 'manual',
        status: 'completed',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        changeType: 'major',
      },
    ];
    
    setUpdates(mockUpdates);
  };

  const fetchVersionInfo = async () => {
    // Deprecated - using mock data only
    // Uncomment when API is available
    /*
    try {
      const response = await fetch(`${API_BASE_URL}/versions/latest/info`);
      
      if (!response.ok) {
        throw new Error('API not available');
      }
      
      const data = await response.json();
      
      setVersionInfo({
        current: data.version,
        latest: data.version,
        hasUpdates: false,
        breakingChanges: data.breakingChanges?.length || 0,
        affectedComponents: [],
      });
    } catch (error) {
      console.error('Error fetching version info:', error);
      loadMockData();
    }
    */
  };

  const fetchRecentUpdates = async () => {
    // Deprecated - using mock data only
    // Uncomment when API is available
    /*
    try {
      const response = await fetch(`${API_BASE_URL}/webhooks/events?limit=10`);
      
      if (!response.ok) {
        throw new Error('API not available');
      }
      
      const data = await response.json();
      
      const formattedUpdates: ComponentUpdate[] = data.events.map((event: any) => ({
        id: event.id,
        name: event.data.componentName || event.data.componentId || 'Unknown',
        version: '1.0.0',
        source: event.source,
        status: 'completed',
        timestamp: event.timestamp,
        changeType: event.versionChange || 'patch',
      }));

      setUpdates(formattedUpdates);
    } catch (error) {
      console.error('Error fetching updates:', error);
      loadMockData();
    }
    */
  };

  const handleFigmaImport = async () => {
    if (!figmaUrl.trim()) {
      alert('Please enter a Figma URL');
      return;
    }

    setIsProcessing(true);

    try {
      // Extract file key from Figma URL
      const fileKeyMatch = figmaUrl.match(/file\/([a-zA-Z0-9]+)/);
      
      if (!fileKeyMatch) {
        alert('Invalid Figma URL format');
        setIsProcessing(false);
        return;
      }

      const fileKey = fileKeyMatch[1];

      // Simulate Figma import (in production, call actual Figma API)
      const response = await fetch(`${API_BASE_URL}/webhooks/manual-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          componentId: `figma-${fileKey}`,
          componentData: {
            fileKey,
            source: 'figma',
            url: figmaUrl,
          },
          changeType: 'update',
          description: 'Manual Figma import',
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Figma components imported successfully!');
        setFigmaUrl('');
        fetchRecentUpdates();
      } else {
        alert('Failed to import Figma components');
      }
    } catch (error) {
      console.error('Error importing from Figma:', error);
      alert('Error importing from Figma');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIPromptUpdate = async (prompt: string) => {
    setIsProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/webhooks/ai-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          generatedComponent: {
            name: 'AI Generated Component',
            code: '// Component code here',
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('AI-generated component created successfully!');
        fetchRecentUpdates();
      }
    } catch (error) {
      console.error('Error creating AI component:', error);
      alert('Error creating AI component');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyWebhookUrl = () => {
    const webhookUrl = `${API_BASE_URL}/webhooks/figma`;
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'figma':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded">
            <FileCode className="w-3 h-3" />
            Figma
          </span>
        );
      case 'manual':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded">
            <Upload className="w-3 h-3" />
            Manual
          </span>
        );
      case 'ai-prompt':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded">
            <Zap className="w-3 h-3" />
            AI
          </span>
        );
      default:
        return null;
    }
  };

  const getChangeTypeBadge = (changeType: string) => {
    switch (changeType) {
      case 'major':
        return (
          <span className="px-2 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-bold rounded">
            MAJOR
          </span>
        );
      case 'minor':
        return (
          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold rounded">
            MINOR
          </span>
        );
      case 'patch':
        return (
          <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded">
            PATCH
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50">
            Admin Panel
          </h1>
          <span className="inline-flex items-center px-3 py-1 rounded-md bg-indigo-600 dark:bg-indigo-700 text-white text-xs font-bold tracking-wider uppercase">
            Dashboard
          </span>
        </div>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-4xl">
          Manage design system updates, sync with Figma, track versions, and monitor component changes in real-time.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Current Version</span>
            <GitBranch className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {versionInfo?.current || 'Loading...'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Total Components</span>
            <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">42</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Recent Updates</span>
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{updates.length}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Active Users</span>
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">156</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('updates')}
          className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'updates'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
          }`}
        >
          Recent Updates
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'sync'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
          }`}
        >
          Figma Sync
        </button>
        <button
          onClick={() => setActiveTab('versions')}
          className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'versions'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
          }`}
        >
          Versions
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'notifications'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('figma')}
          className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'figma'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
          }`}
        >
          Figma Integration
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'updates' && (
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Recent Updates
          </h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-950">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                    Component
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                    Change Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {updates.map((update) => (
                  <tr key={update.id}>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {update.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getSourceBadge(update.source)}</td>
                    <td className="px-6 py-4">{getChangeTypeBadge(update.changeType)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        {update.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(update.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'sync' && (
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Figma Synchronization
          </h2>

          {/* Figma Webhook Setup */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-3">
              Webhook Configuration
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Configure Figma webhooks to automatically sync component updates in real-time.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Webhook URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`${API_BASE_URL}/webhooks/figma`}
                    readOnly
                    className="flex-1 px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-mono text-zinc-900 dark:text-zinc-50"
                  />
                  <button
                    onClick={copyWebhookUrl}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                  <a
                    href="https://www.figma.com/developers/api#webhooks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-md text-sm font-semibold transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Docs
                  </a>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  How to set up Figma webhooks:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  <li>Go to your Figma file settings</li>
                  <li>Navigate to "Webhooks" section</li>
                  <li>Click "Create webhook"</li>
                  <li>Paste the webhook URL above</li>
                  <li>Select events: FILE_UPDATE, LIBRARY_PUBLISH</li>
                  <li>Save the webhook</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Manual Figma Import */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-3">
              Manual Figma Import
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Import components directly from a Figma file URL.
            </p>
            
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                placeholder="https://www.figma.com/file/..."
                className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-50"
              />
              <button
                onClick={handleFigmaImport}
                disabled={isProcessing}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-400 text-white rounded-md font-semibold transition-colors flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Import from Figma
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'versions' && (
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Version Management
          </h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Current Version: {versionInfo?.current}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {versionInfo?.breakingChanges} breaking changes in this version
                </p>
              </div>
              <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors">
                Publish New Version
              </button>
            </div>
            
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              <p>Version management features will be available here:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Create and publish new versions</li>
                <li>View version history and changelogs</li>
                <li>Manage deprecations and breaking changes</li>
                <li>Generate migration guides</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Notification Settings
          </h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  Real-time Notifications
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Configure how users are notified about design system updates.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">Email Notifications</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Send email alerts for major updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">Webhook Notifications</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Send webhook events for all updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">Slack Integration</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Post updates to Slack channel</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'figma' && (
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Figma Integration
          </h2>
          <FigmaIntegrationPanel />
        </div>
      )}
    </div>
  );
}