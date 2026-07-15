import { ActionPanel } from '../../components/catalyst/action-center';
import { CodeViewer } from './CodeViewer';

export function ActionPanelsView() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Action Center
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-4xl">
          The primary notification and action interface.
        </p>
      </div>

      {/* Main Component Display */}
      <section className="space-y-8">

        {/* Visual Preview - Centered and constrained */}
        <div className="p-12 bg-zinc-100 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center items-start">
          <div className="w-full max-w-md shadow-2xl rounded-2xl ring-1 ring-zinc-900/5 dark:ring-white/10">
            <ActionPanel />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Component Analysis / Breakdown */}
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Component Structure</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="flex-none p-2 h-10 w-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 font-bold text-xs ring-1 ring-zinc-900/5 dark:ring-white/10">01</div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">Header & Tabs</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Contains the "Action Center" title, global actions (Search, Close), and a scrollable `TabGroup` for filtering (All, Alerts, Payments, etc).
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-none p-2 h-10 w-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 font-bold text-xs ring-1 ring-zinc-900/5 dark:ring-white/10">02</div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">Metrics Bar</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    A secondary strip displaying high-level stats like "Pending: 142" or "Low Stock: 15", providing immediate context.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-none p-2 h-10 w-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 font-bold text-xs ring-1 ring-zinc-900/5 dark:ring-white/10">03</div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">Notification List</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Scrollable area containing `NotificationItem` components. Each item features a severity strip (red/amber/blue), icon, text content, and action buttons.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Code Viewer */}
          <CodeViewer
            react={`import { ActionPanel } from '@/components/catalyst/action-center';

export function ActionCenterWindow() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <ActionPanel className="shadow-2xl" />
    </div>
  );
}`}
            html={`<div class="action-panel">
  <!-- Header -->
  <div class="flex justify-between p-4 bg-white dark:bg-zinc-900">
    <h2>Action Center</h2>
    <div class="tabs">...</div>
  </div>
  
  <!-- Metrics -->
  <div class="metrics-bar bg-zinc-50 dark:bg-zinc-800">
    <span>Pending: 142</span>
  </div>

  <!-- List -->
  <div class="overflow-y-auto">
    <div class="notification-item border-l-4 border-red-500">
        <h4>Quantity Mismatch</h4>
        <button class="btn-primary">Resolve</button>
    </div>
  </div>
</div>`}
            css={`.action-panel {
  @apply w-full max-w-md flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-900/5 dark:bg-[#18181b] dark:ring-white/10;
}`}
            prompt="Create a detailed notification panel with tabs, metric summaries, and severity-coded alert cards."
          />
        </div>
      </section>
    </div>
  );
}
