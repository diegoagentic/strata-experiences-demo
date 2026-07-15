import { CodeViewer } from './CodeViewer';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

export function RadioGroupsView() {
    const radioGroupReact = `import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">Option One</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">Option Two</Label>
      </div>
    </RadioGroup>
  )
}
`

    const radioGroupHTML = `<!-- Radio Group -->
<div class="grid gap-2" role="radiogroup" dir="ltr" tabindex="0" style="outline: none;">
  <div class="flex items-center space-x-2">
    <button
      type="button"
      role="radio"
      aria-checked="true"
      data-state="checked"
      value="default"
      class="aspect-square size-4 text-zinc-900 rounded-full border border-zinc-200 border-zinc-900 shadow-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:border-zinc-50 dark:text-zinc-50 dark:focus-visible:ring-zinc-300"
    >
      <span data-state="checked" class="flex items-center justify-center pointer-events-none">
        <svg class="size-2.5 fill-current text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
        </svg>
      </span>
    </button>
    <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-50">Default</label>
  </div>
</div>`

    const radioGroupCSS = `@theme {
  --color-zinc-200: #e4e4e7;
  --color-zinc-900: #18181b;
}

.radio-item {
  height: 1rem;
  width: 1rem;
  border-radius: 9999px;
  border: 1px solid var(--color-zinc-200);
}

.radio-item[data-state="checked"] {
  border-color: var(--color-zinc-900);
  color: var(--color-zinc-900);
}
`

    const radioGroupPrompt = `# AI PROMPT: Generate Radio Group Component
## CONTEXT
Set of radio buttons for single selection.

## API
\`\`\`tsx
<RadioGroup defaultValue="comfortable">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="default" id="r1" />
    <Label htmlFor="r1">Default</Label>
  </div>
</RadioGroup>
\`\`\`

## SPECS
- Size: size-4 (16px)
- Radius: rounded-full
- Border: Zinc-200
- Checked: Border-Zinc-900, Circle Icon fill-current`

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Radio Group</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.
                </p>
            </div>

            <div className="mb-12">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Basic Usage</h2>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 flex items-center justify-center">
                    <RadioGroup defaultValue="option-one">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="option-one" id="option-one" />
                            <Label htmlFor="option-one" className="text-zinc-900 dark:text-zinc-50">Option One</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="option-two" id="option-two" />
                            <Label htmlFor="option-two" className="text-zinc-900 dark:text-zinc-50">Option Two</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="mt-6">
                    <CodeViewer
                        title="Radio Group"
                        react={radioGroupReact}
                        html={radioGroupHTML}
                        css={radioGroupCSS}
                        prompt={radioGroupPrompt}
                        enableFigmaExport={true}
                        figmaSpecs={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "9999px",
                            border: "1px solid Zinc-200",
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
