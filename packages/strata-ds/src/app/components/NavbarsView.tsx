import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from "./ui/navbar"
import { CodeViewer } from './CodeViewer';

import { CatalystNavbarDemo } from "./demos/CatalystNavbar";

export function NavbarsView() {
  const basicNavbarReact = `import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from "@/components/ui/navbar"

export function Example() {
  return (
    <Navbar>
      <NavbarSection>
        <NavbarItem current>Dashboard</NavbarItem>
        <NavbarItem>Orders</NavbarItem>
        <NavbarItem>Products</NavbarItem>
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <NavbarItem>Settings</NavbarItem>
      </NavbarSection>
    </Navbar>
  )
}`;

  const basicNavbarHTML = `<!-- Navbar Component -->
<nav class="flex items-center gap-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
  <div class="flex items-center gap-2">
    <button class="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-lg px-2 py-1.5 text-sm font-medium">
      Dashboard
    </button>
    <button class="text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg px-2 py-1.5 text-sm font-medium">
      Orders
    </button>
  </div>
  <div class="flex-1"></div>
  <div class="flex items-center gap-2">
    <button class="text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg px-2 py-1.5 text-sm font-medium">
      Settings
    </button>
  </div>
</nav>`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-zinc-950 dark:white mb-4">
          Navbars
        </h1>
        <p className="text-lg text-zinc-600 dark:zinc-400">
          Top-level navigation components for persistent application headers.
        </p>
      </div>

      {/* Basic Navbar */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-zinc-950 dark:white mb-6">
          Basic Usage
        </h2>
        <div className="bg-white dark:zinc-900 border border-zinc-200 dark:zinc-800 rounded-xl overflow-hidden mb-6 p-6">
          <Navbar>
            <NavbarSection>
              <NavbarItem current>Dashboard</NavbarItem>
              <NavbarItem>Orders</NavbarItem>
              <NavbarItem>Products</NavbarItem>
            </NavbarSection>
            <NavbarSpacer />
            <NavbarSection>
              <NavbarItem>Settings</NavbarItem>
            </NavbarSection>
          </Navbar>
        </div>

        <CodeViewer
          title="Simple Navbar"
          react={basicNavbarReact}
          html={basicNavbarHTML}
          css=".navbar { display: flex; align-items: center; border-bottom: 1px solid var(--zinc-200); }"
          prompt="Generate a high-density Navbar component using standardized NavbarItem and NavbarSection components."
        />
      </section>



      {/* Application Navbar (Custom) */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-zinc-950 dark:white mb-6">
          Application Navbar (Custom)
        </h2>
        <p className="text-sm text-zinc-500 mb-6">
          A complex, floating navbar used in the Catalyst Application, featuring tenant switching, action center integration, and responsive menus.
        </p>
        <div className="bg-white dark:zinc-900 border border-zinc-200 dark:zinc-800 rounded-xl overflow-hidden mb-6 p-6">
          <CatalystNavbarDemo />
        </div>

        <CodeViewer
          title="Catalyst Navbar"
          react={`import { Navbar } from '@/components/Navbar';`}
          html={`<!-- See CatalystNavbar.tsx for full implementation -->`}
          css={`.navbar-container { position: fixed; top: 1.5rem; ... }`}
          prompt="Generate a complex application navbar with floating glassmorphism effect, tenant selector, and notification center."
        />
      </section>

      {/* Usage Guidelines */}
      <section className="mt-20">
        <h2 className="text-2xl font-bold text-zinc-950 dark:white mb-6">
          Usage Guidelines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:zinc-100">When to use</h3>
            <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:zinc-400">
              <li>Primary navigation for web applications.</li>
              <li>When the sidebar is insufficient or you need horizontal nav.</li>
              <li>Use <strong>NavbarSpacer</strong> to push items to the right.</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:zinc-100">Best practices</h3>
            <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:zinc-400">
              <li>Keep the number of primary links limited (usually 3-5).</li>
              <li>Always indicate the <strong>current</strong> active item.</li>
              <li>Ensure consistent spacing and vertical alignment.</li>
            </ul>
          </div>
        </div>
      </section>
    </div >
  );
}