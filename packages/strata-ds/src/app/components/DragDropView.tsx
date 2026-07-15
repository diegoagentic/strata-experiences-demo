import * as React from "react";
import { useState } from 'react';
import { Check, X, GripVertical, Plus, Trash2, Archive, Clock } from 'lucide-react';
import { Heading } from './ui/heading';
import { Text } from './ui/text';
import { CodeViewer } from './CodeViewer';

export function DragDropView() {
  const [sortableItems] = useState([
    { id: 1, title: 'Homepage redesign', priority: 'High' },
    { id: 2, title: 'Mobile app updates', priority: 'Medium' },
    { id: 3, title: 'Blog post creation', priority: 'Low' },
  ]);

  const sortableListReact = `import { GripVertical } from "lucide-react"

export function SortableList() {
  const items = [
    { id: 1, title: 'Homepage redesign', priority: 'High' },
    { id: 2, title: 'Mobile app updates', priority: 'Medium' },
  ]

  return (
    <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md">
      {items.map((item) => (
        <div key={item.id} className="px-4 py-3 flex items-center gap-3 hover:bg-zinc-50 transition-colors cursor-move group">
          <GripVertical className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 flex-shrink-0" />
          <div className="flex-1 font-semibold">{item.title}</div>
        </div>
      ))}
    </div>
  )
}`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12">
        <Heading level={1} className="text-4xl font-bold mb-2">Drag & Drop</Heading>
        <Text className="text-zinc-500 dark:text-zinc-400">
          Interactive drag and drop patterns for reordering, organizing, and moving content within the application.
        </Text>
      </div>

      {/* Sortable List */}
      <section className="mb-16">
        <Heading level={2} className="text-2xl font-bold mb-4">Sortable List</Heading>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Reorderable list items with drag handles for manual sorting and organization.
        </Text>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 mb-6 flex justify-center">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm">
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {sortableItems.map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-move group"
                >
                  <GripVertical className="w-5 h-5 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {item.title}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${item.priority === 'High'
                      ? 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400'
                      : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400'
                    }`}>
                    {item.priority}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <CodeViewer
          title="Sortable List"
          react={sortableListReact}
          html={`<div class="divide-y border rounded-md">
  <div class="flex items-center gap-3 p-4 cursor-move group">
    <svg class="text-zinc-400 group-hover:text-zinc-600">...</svg>
    <div class="font-semibold">Item Title</div>
  </div>
</div>`}
          css={`.cursor-move { cursor: move; } .group:hover { background-color: var(--color-zinc-50); }`}
          prompt="Generate a vertical sortable list with drag handles and hover states using Zinc primitives."
        />
      </section>

      {/* File Drop Zone */}
      <section className="mb-16">
        <Heading level={2} className="text-2xl font-bold mb-4">File Drop Zone</Heading>
        <Text className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Drag and drop area for uploading files with clear visual cues and feedback.
        </Text>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8">
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-md p-12 text-center hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all cursor-pointer group">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
              <Plus className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
            </div>
            <Heading level={3} className="font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              Drop files here or click to upload
            </Heading>
            <Text className="text-sm text-zinc-500 dark:text-zinc-400">
              PNG, JPG, PDF up to 10MB
            </Text>
          </div>
        </div>
      </section>

      {/* Usage Guidelines */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Do's</h3>
          </div>
          <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
            <li>• Use clear visual signifiers like the `GripVertical` icon.</li>
            <li>• Provide instant visual feedback when an item is picked up.</li>
            <li>• Offer an alternative for keyboard-only and screen reader users.</li>
          </ul>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <X className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Don'ts</h3>
          </div>
          <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
            <li>• Don't hide the drop targets; keep them visible during the drag operation.</li>
            <li>• Avoid non-standard cursors that might confuse users.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
