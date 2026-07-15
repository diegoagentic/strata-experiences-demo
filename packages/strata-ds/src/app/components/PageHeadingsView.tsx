import { ChevronRight, Users, MapPin, DollarSign, CheckCircle2, Check, X } from 'lucide-react';
import { CodeViewer } from './CodeViewer';
import { Heading } from './ui/heading';
import { Text } from './ui/text';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function PageHeadingsView() {
  const pageHeadingReact = `import { Heading, Subheading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function PageHeader() {
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <Heading level={1}>Inventory Dashboard</Heading>
        <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
          <div className="mt-2 flex items-center text-sm text-zinc-500">
            <Users className="mr-1.5 size-4" /> Logistics Team
          </div>
          <div className="mt-2 flex items-center text-sm text-zinc-500">
            <Badge color="emerald">Synced</Badge>
          </div>
        </div>
      </div>
      <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
        <Button variant="outline">Edit</Button>
        <Button>Publish</Button>
      </div>
    </div>
  )
}`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12">
        <Heading level={1} className="text-4xl font-bold mb-2">Page Headings</Heading>
        <Text className="text-zinc-500 dark:text-zinc-400">
          Complex header patterns with breadcrumbs, metadata, and action groups.
        </Text>
      </div>

      {/* Full Featured Header */}
      <section className="mb-16">
        <Heading level={2} className="text-2xl font-bold mb-6">Full Featured</Heading>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 mb-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-zinc-500">Assets</span>
                <ChevronRight className="size-4 text-zinc-400" />
                <span className="text-sm text-zinc-500">Seating</span>
                <ChevronRight className="size-4 text-zinc-400" />
                <span className="text-sm text-zinc-950 dark:text-white font-medium">Aeron Chair</span>
              </div>
              <Heading level={1} className="text-3xl font-bold">Inventory Dashboard</Heading>
              <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6 gap-y-2">
                <div className="flex items-center text-sm text-zinc-500">
                  <Users className="mr-1.5 size-4" /> Logistics Team
                </div>
                <div className="flex items-center text-sm text-zinc-500">
                  <MapPin className="mr-1.5 size-4" /> Remote
                </div>
                <div className="flex items-center text-sm text-zinc-500">
                  <DollarSign className="mr-1.5 size-4" /> $120k Value
                </div>
              </div>
            </div>
            <div className="mt-6 flex md:ml-4 md:mt-0 gap-3">
              <Button variant="outline">Edit</Button>
              <Button variant="outline">View</Button>
              <Button>Publish</Button>
            </div>
          </div>
        </div>

        <CodeViewer
          title="Page Heading"
          react={pageHeadingReact}
          html={`<div class="md:flex md:items-center md:justify-between">...</div>`}
          css={`.header { padding: 1.5rem; }`}
          prompt="Generate a complex page header with breadcrumbs, multi-line metadata icons, and a primary action group."
        />
      </section>

      {/* Guidelines */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Do's</h3>
          </div>
          <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
            <li>• Use breadcrumbs for deep navigation hierarchies.</li>
            <li>• Group primary actions together on the right (desktop).</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
