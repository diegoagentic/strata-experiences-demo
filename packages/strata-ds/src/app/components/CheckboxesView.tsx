import { CodeViewer } from './CodeViewer';
import { Checkbox } from './ui/checkbox';

export function CheckboxesView() {
    const checkboxReact = `import { Checkbox } from "@/components/ui/checkbox"

export function CheckboxDemo() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <label
        htmlFor="terms"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Accept terms and conditions
      </label>
    </div>
  )
}
`

    const checkboxHTML = `<!-- Checkbox -->
<button
  type="button"
  role="checkbox"
  aria-checked="false"
  value="on"
  class="peer size-4 shrink-0 rounded-[4px] border border-zinc-200 bg-white shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-white dark:border-zinc-800 dark:bg-zinc-950/30 dark:focus-visible:ring-zinc-300/20 dark:data-[state=checked]:bg-zinc-50 dark:data-[state=checked]:text-zinc-900"
>
  <!-- Indicator -->
</button>`

    const checkboxCSS = `@theme {
  --color-zinc-200: #e4e4e7;
  --color-zinc-900: #18181b;
}

.checkbox {
  height: 1rem;
  width: 1rem;
  border-radius: 4px;
  border: 1px solid var(--color-zinc-200);
}

.checkbox[data-state="checked"] {
  background-color: var(--color-zinc-900);
  color: white;
}
`

    const checkboxPrompt = `# AI PROMPT: Generate Checkbox Component
## CONTEXT
Interactive checkbox input.

## API
\`\`\`tsx
<Checkbox id="terms" />
\`\`\`

## SPECS
- Size: size-4 (16px)
- Radius: rounded-[4px]
- Border: Zinc-200
- Checked: Zinc-900 bg, White text
- Focus: Ring-zinc-900/20`

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Checkbox</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    A control that allows the user to toggle between checked and not checked.
                </p>
            </div>

            <div className="mb-12">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Basic Usage</h2>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="terms" />
                        <label
                            htmlFor="terms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-50"
                        >
                            Accept terms and conditions
                        </label>
                    </div>
                </div>

                <div className="mt-6">
                    <CodeViewer
                        title="Checkbox"
                        react={checkboxReact}
                        html={checkboxHTML}
                        css={checkboxCSS}
                        prompt={checkboxPrompt}
                        enableFigmaExport={true}
                        figmaSpecs={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "4px",
                            border: "1px solid Zinc-200",
                        }}
                    />
                </div>
            </div>

            <div className="mb-12">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Disabled</h2>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="disabled" disabled />
                        <label
                            htmlFor="disabled"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-50"
                        >
                            Accept terms and conditions
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}
