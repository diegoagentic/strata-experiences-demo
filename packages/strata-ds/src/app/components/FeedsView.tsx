import { Upload, CheckCircle, UserPlus, Check, X } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { CodeViewer } from './CodeViewer';

export function FeedsView() {
  const activityFeedReact = `import { Upload, CheckCircle } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function ActivityFeed() {
  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <div className="relative flex-shrink-0">
          <Avatar size="lg">
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
            <Upload className="w-3 h-3 text-white" />
          </div>
        </div>
        <div className="flex-1 pt-1">
          <p className="text-sm text-zinc-900 dark:text-zinc-50">
            <span className="font-semibold">Sarah Chen</span> uploaded a new file
          </p>
          <p className="text-xs text-zinc-500 mt-1">15m ago</p>
        </div>
      </div>
    </div>
  )
}`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Activity Feeds
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Timeline-based lists showing chronological activities and updates.
        </p>
      </div>

      <section className="mb-16">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 mb-6">
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="relative flex-shrink-0">
                <Avatar size="lg">
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                  <Upload className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-zinc-900 dark:text-zinc-50">
                  <span className="font-semibold text-zinc-950 dark:text-white">Sarah Chen</span> uploaded a new file
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">15 minutes ago</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative flex-shrink-0">
                <Avatar size="lg">
                  <AvatarFallback>MR</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-zinc-900 dark:text-zinc-50">
                  <span className="font-semibold text-zinc-950 dark:text-white">Michael Rodriguez</span> marked task as complete
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>

        <CodeViewer
          title="Activity Feed"
          react={activityFeedReact}
          html={`<!-- Activity Feed HTML -->`}
          css={`.feed-item { display: flex; gap: 1rem; }`}
          prompt="Generate a chronological activity feed using avatars with status icons."
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Do's</h3>
          </div>
          <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
            <li>• Use clear icons to categorize activity types.</li>
            <li>• Provide relative timestamps (e.g., "5m ago").</li>
          </ul>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <X className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Don'ts</h3>
          </div>
          <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
            <li>• Don't clutter the feed with too much technical detail.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
