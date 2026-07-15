import { CodeViewer } from './CodeViewer';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

export function SwitchesView() {
    const switchReact = `import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function SwitchDemo() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  )
}
`

    const switchHTML = `<!-- Switch -->
<button
  type="button"
  role="switch"
  aria-checked="false"
  data-state="unchecked"
  value="on"
  class="peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-zinc-900 data-[state=unchecked]:bg-zinc-200 dark:focus-visible:ring-zinc-300 dark:focus-visible:ring-offset-zinc-950 dark:data-[state=checked]:bg-zinc-50 dark:data-[state=unchecked]:bg-zinc-800"
>
  <span
    data-state="unchecked"
    class="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 dark:bg-zinc-950"
  ></span>
</button>`

    const switchCSS = `@theme {
  --color-zinc-200: #e4e4e7;
  --color-zinc-900: #18181b;
}

.switch {
  width: 2rem;
  height: 1.15rem;
  border-radius: 9999px;
  background-color: var(--color-zinc-200);
}

.switch[data-state="checked"] {
  background-color: var(--color-zinc-900);
}
`

    const switchPrompt = `# AI PROMPT: Generate Switch Component
## CONTEXT
Toggle control to switch between two states.

## API
\`\`\`tsx
<Switch id="airplane-mode" />
\`\`\`

## SPECS
- Height: 1.15rem
- Width: 2rem
- Radius: Full
- Unchecked: Zinc-200
- Checked: Zinc-900
- Thumb: White, size-4`

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Switch</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    A control that allows the user to toggle between checked and not checked.
                </p>
            </div>

            <div className="mb-12">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Basic Usage</h2>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                        <Switch id="airplane-mode" />
                        <Label htmlFor="airplane-mode" className="text-zinc-900 dark:text-zinc-50">Airplane Mode</Label>
                    </div>
                </div>

                <div className="mt-6">
                    <CodeViewer
                        title="Switch"
                        react={switchReact}
                        html={switchHTML}
                        css={switchCSS}
                        prompt={switchPrompt}
                        enableFigmaExport={true}
                        figmaSpecs={{
                            width: "32px",
                            height: "20px",
                            borderRadius: "9999px",
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
