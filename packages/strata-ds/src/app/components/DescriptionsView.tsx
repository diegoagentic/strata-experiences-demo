import { Check, X } from 'lucide-react';
import { DescriptionList, DescriptionTerm, DescriptionDetails } from './ui/description-list';
import { CodeViewer } from './CodeViewer';
import { Badge } from './ui/badge';

export function DescriptionsView() {
  const basicReact = `import { DescriptionList, DescriptionTerm, DescriptionDetails } from "@/components/ui/description-list"

export function DescriptionDemo() {
  return (
    <DescriptionList>
      <DescriptionTerm>Full Name</DescriptionTerm>
      <DescriptionDetails>Sarah Chen</DescriptionDetails>

      <DescriptionTerm>Email Address</DescriptionTerm>
      <DescriptionDetails>sarah.chen@company.com</DescriptionDetails>
    </DescriptionList>
  )
}`

  const basicHTML = `<dl class="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
  <dt class="col-start-1 border-t border-zinc-950/5 pt-4 text-sm/6 font-medium text-zinc-500 sm:border-none sm:pt-0 dark:border-white/5 dark:text-zinc-400">
    Full Name
  </dt>
  <dd class="pb-4 pt-1 text-sm/6 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-4 dark:text-white dark:sm:border-white/5">
    Sarah Chen
  </dd>
</dl>`

  const basicCSS = `.description-list {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  column-gap: 2.5rem;
  row-gap: 1rem;
}

.description-term {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-zinc-500);
}

.description-details {
  font-size: 0.875rem;
  color: var(--color-zinc-950);
}`

  const basicPrompt = `# AI PROMPT: Description List
## CONTEXT
Implement a responsive description list for key-value pairs.

## API
\`\`\`tsx
<DescriptionList>
  <DescriptionTerm>Label</DescriptionTerm>
  <DescriptionDetails>Value</DescriptionDetails>
</DescriptionList>
\`\`\`

## SPECS
- Grid layout (columns-1 / sm:columns-2)
- Term: text-sm/6 font-medium zinc-500
- Details: text-sm/6 zinc-950`

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Description Lists
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Structured lists for displaying key-value pairs, metadata, and detailed information.
        </p>
      </div>

      {/* Simple Description List */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Basic Usage
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 mb-6">
          <DescriptionList>
            <DescriptionTerm>Full Name</DescriptionTerm>
            <DescriptionDetails>Sarah Chen</DescriptionDetails>

            <DescriptionTerm>Email Address</DescriptionTerm>
            <DescriptionDetails>sarah.chen@company.com</DescriptionDetails>

            <DescriptionTerm>Role</DescriptionTerm>
            <DescriptionDetails>Product Designer</DescriptionDetails>

            <DescriptionTerm>Department</DescriptionTerm>
            <DescriptionDetails>Design Team</DescriptionDetails>
          </DescriptionList>
        </div>

        <CodeViewer
          title="Description List"
          react={basicReact}
          html={basicHTML}
          css={basicCSS}
          prompt={basicPrompt}
          enableFigmaExport={true}
        />
      </div>

      {/* Advanced Example */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          With Badges and Complex Data
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12">
          <DescriptionList>
            <DescriptionTerm>Project Name</DescriptionTerm>
            <DescriptionDetails>Website Redesign 2024</DescriptionDetails>

            <DescriptionTerm>Status</DescriptionTerm>
            <DescriptionDetails>
              <Badge variant="outline">Active</Badge>
            </DescriptionDetails>

            <DescriptionTerm>Start Date</DescriptionTerm>
            <DescriptionDetails>December 1, 2024</DescriptionDetails>

            <DescriptionTerm>Description</DescriptionTerm>
            <DescriptionDetails>
              Complete redesign of the company website with new branding, improved UX, and modern tech stack.
            </DescriptionDetails>
          </DescriptionList>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Usage Guidelines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Do's */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                Do's
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-emerald-800 dark:text-emerald-200">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Use DescriptionList for structured key-value maps</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Keep labels concise and informative</span>
              </li>
            </ul>
          </div>

          {/* Don'ts */}
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-red-600 dark:bg-red-500 flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                Don'ts
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-red-800 dark:text-red-200">
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't use for long-form narrative content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Avoid over-nesting list components</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
