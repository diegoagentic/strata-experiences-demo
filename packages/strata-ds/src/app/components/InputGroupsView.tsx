import { AtSign, Calendar, CreditCard, DollarSign, Globe, Link, Lock, Mail, Search, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CodeViewer } from './CodeViewer';

export function InputGroupsView() {
  const inputGroupsReact = `import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Lock, Search } from "lucide-react"

export function InputDemo() {
  return (
    <div className="space-y-4">
      {/* With Icon */}
      <div className="relative">
        <div className="absolute left-2.5 top-2.5 text-zinc-500">
          <Mail className="size-4" />
        </div>
        <Input type="email" placeholder="Email" className="pl-9" />
      </div>

      {/* With Addon */}
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input type="email" placeholder="Email" />
        <Button type="submit">Subscribe</Button>
      </div>

      {/* File Input */}
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <label htmlFor="picture">Picture</label>
        <Input id="picture" type="file" />
      </div>
    </div>
  )
}`;

  const inputGroupsHTML = `<!-- Input with Icon -->
<div class="relative">
  <div class="absolute left-2.5 top-2.5 text-zinc-500">
    <svg class="size-4">...</svg>
  </div>
  <input class="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 pl-9 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Email" />
</div>`;

  const inputGroupsCSS = `@theme {
  --color-zinc-200: #e4e4e7;
  --color-zinc-500: #71717a;
  --color-zinc-950: #09090b;
}

.input {
  display: flex;
  height: 2.25rem;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid var(--color-zinc-200);
  background-color: transparent;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.input:focus-visible {
  outline: none;
  box-shadow: 0 0 0 1px var(--color-zinc-950);
}
`;

  const inputGroupsPrompt = `# AI PROMPT: Generate Input Component
## CONTEXT
Form input field.

## API
\`\`\`tsx
<Input type="email" placeholder="Email" />
<Input type="file" />
<Input disabled />
\`\`\`

## SPECS
- Height: 36px (h-9)
- Rounded: md
- Border: Zinc-200 (light) / Zinc-800 (dark)
- Focus: Ring Zinc-950 (light) / Zinc-300 (dark)
- Placeholder: Zinc-500`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Input
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Displays a form input field or a component that looks like an input field.
        </p>
      </div>

      {/* Default Input */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Default
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12">
          <div className="max-w-sm mx-auto space-y-4">
            <Input type="email" placeholder="Email" />
            <Input type="password" placeholder="Password" />
          </div>
        </div>

        <div className="mt-6">
          <CodeViewer
            title="Input"
            react={inputGroupsReact}
            html={inputGroupsHTML}
            css={inputGroupsCSS}
            prompt={inputGroupsPrompt}
            enableFigmaExport={true}
            figmaSpecs={{
              height: '36px',
              borderRadius: '6px',
              border: '1px solid Zinc-200',
              padding: '4px 12px'
            }}
          />
        </div>
      </div>

      {/* Input with Icons */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          With Icons
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="relative">
              <div className="absolute left-2.5 top-2.5 text-zinc-500 pointer-events-none">
                <Search className="size-4" />
              </div>
              <Input type="search" placeholder="Search..." className="pl-9" />
            </div>

            <div className="relative">
              <div className="absolute left-2.5 top-2.5 text-zinc-500 pointer-events-none">
                <Mail className="size-4" />
              </div>
              <Input type="email" placeholder="Email" className="pl-9" />
            </div>
          </div>
        </div>
      </div>

      {/* Input with Addons */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          With Addons
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="flex w-full items-center space-x-2">
              <Input type="email" placeholder="Email" />
              <Button type="submit">Subscribe</Button>
            </div>

            <div className="flex w-full items-center space-x-2">
              <div className="relative flex-1">
                <div className="absolute left-2.5 top-2.5 text-zinc-500 pointer-events-none">
                  <Link className="size-4" />
                </div>
                <Input value="https://example.com/invite" readOnly className="pl-9" />
              </div>
              <Button variant="outline" className="shrink-0">Copy</Button>
            </div>
          </div>
        </div>
      </div>

      {/* File Input */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          File Input
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="picture" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-zinc-300">Picture</label>
              <Input id="picture" type="file" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}