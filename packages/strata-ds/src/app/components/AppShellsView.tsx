import { Home, Users, FolderOpen, Settings, Bell, Search, Menu, Plus, Check, X } from 'lucide-react';
import { CodeViewer } from './CodeViewer';
import { Heading } from './ui/heading';
import { Text } from './ui/text';

export function AppShellsView() {
  const sidebarReact = `import { Sidebar, SidebarHeader, SidebarContent, SidebarItem } from "@/components/ui/sidebar"

export function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar>
        <SidebarHeader>Strata</SidebarHeader>
        <SidebarContent>
          <SidebarItem icon={<Home />}>Dashboard</SidebarItem>
          <SidebarItem icon={<Users />}>Team</SidebarItem>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950">
        {children}
      </main>
    </div>
  )
}`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12">
        <Heading level={1} className="text-4xl font-bold mb-2">Application Shells</Heading>
        <Text className="text-zinc-500 dark:text-zinc-400">
          Complete page layouts with navigation patterns: sidebar, multi-column, and stacked configurations.
        </Text>
      </div>

      {/* Sidebar Layout Preview */}
      <section className="mb-16">
        <Heading level={2} className="text-2xl font-bold mb-6">Sidebar Layout</Heading>
        <div className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-6 shadow-sm">
          <div className="h-[400px] flex scale-90 origin-top">
            {/* Sidebar Mockup */}
            <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
              <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 font-bold">Strata</div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-md text-sm font-semibold"><Home className="size-4" /> Dashboard</div>
                <div className="flex items-center gap-3 px-3 py-2 text-zinc-600 dark:text-zinc-400 rounded-md text-sm"><Users className="size-4" /> Team</div>
              </nav>
            </aside>
            {/* Main Content Mockup */}
            <main className="flex-1 bg-zinc-50 dark:bg-zinc-950 p-8">
              <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded" />
                <div className="h-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded" />
                <div className="h-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded" />
              </div>
            </main>
          </div>
        </div>

        <CodeViewer
          title="Sidebar Shell"
          react={sidebarReact}
          html={`<div class="flex"> <aside>...</aside> <main>...</main> </div>`}
          css={`.shell { display: flex; height: 100vh; }`}
          prompt="Generate a standard application shell with a fixed sidebar and scrollable main content area."
        />
      </section >

      {/* Guidelines */}
      < section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20" >
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Do's</h3>
          </div>
          <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
            <li>• Use Sidebar for complex, data-heavy applications.</li>
            <li>• Ensure the main content area has proper padding.</li>
          </ul>
        </div>
      </section >
    </div >
  );
}