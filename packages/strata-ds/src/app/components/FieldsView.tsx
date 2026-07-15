import { CodeViewer } from './CodeViewer';
import { ProjectInputsDemo } from './demos/ProjectInputsDemo';
import { Field, FieldLabel, FieldDescription, FieldError } from './ui/field';
import { Input } from './ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select"
import { Textarea } from './ui/textarea';

export function FieldsView() {
    const fieldReact = `import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function FieldDemo() {
  return (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <Input type="email" placeholder="hello@example.com" />
      <FieldDescription>
        We'll never share your email with anyone else.
      </FieldDescription>
    </Field>
  )
}
`

    const fieldHTML = `<!-- Field -->
<div class="flex flex-col gap-2">
  <!-- Label -->
  <label class="flex w-full items-center justify-between text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-50">
    <span>Email</span>
  </label>
  
  <!-- Input -->
  <input class="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300" type="email" placeholder="hello@example.com">
  
  <!-- Description -->
  <p class="text-[0.8rem] text-zinc-500 dark:text-zinc-400">
    We'll never share your email with anyone else.
  </p>
</div>`

    const fieldCSS = `@theme {
  --color-zinc-500: #71717a;
  --color-zinc-900: #18181b;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
}

.field-description {
  font-size: 0.8rem;
  color: var(--color-zinc-500);
}
`

    const fieldPrompt = `# AI PROMPT: Generate Field Component
## CONTEXT
Wrapper for form controls including Label, Description, and Error message.

## API
\`\`\`tsx
<Field>
  <FieldLabel optional>Label</FieldLabel>
  <Input />
  <FieldDescription>Help text</FieldDescription>
  <FieldError>Error message</FieldError>
</Field>
\`\`\`

## SPECS
- Gap: 2 (0.5rem)
- Label: Text-sm font-medium
- Description: Text-xs text-zinc-500
- Error: Text-xs text-red-500`

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Field</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    A wrapper component that provides context for form controls, including label, description, and error message.
                </p>
            </div>

            <div className="mb-12">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Basic Usage</h2>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12">
                    <div className="max-w-sm mx-auto">
                        <Field>
                            <FieldLabel>Email</FieldLabel>
                            <Input type="email" placeholder="hello@example.com" />
                            <FieldDescription>
                                We'll never share your email with anyone else.
                            </FieldDescription>
                        </Field>
                    </div>
                </div>

                <div className="mt-6">
                    <CodeViewer
                        title="Field"
                        react={fieldReact}
                        html={fieldHTML}
                        css={fieldCSS}
                        prompt={fieldPrompt}
                        enableFigmaExport={true}
                        figmaSpecs={{
                            gap: "8px",
                        }}
                    />
                </div>
            </div>

            <div className="mb-12">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">With Error</h2>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12">
                    <div className="max-w-sm mx-auto">
                        <Field>
                            <FieldLabel>Username</FieldLabel>
                            <Input placeholder="username" aria-invalid="true" />
                            <FieldError>
                                This username is already taken.
                            </FieldError>
                        </Field>
                    </div>
                </div>
            </div>

            <div className="mb-12">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Optional Label</h2>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12">
                    <div className="max-w-sm mx-auto">
                        <Field>
                            <FieldLabel optional>Bio</FieldLabel>
                            <Textarea placeholder="Tell us about yourself" />
                        </Field>
                    </div>
                </div>
            </div>

            <div className="mb-12">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">With Select</h2>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12">
                    <div className="max-w-sm mx-auto">
                        <Field>
                            <FieldLabel>Role</FieldLabel>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldDescription>Select the user's role in the organization.</FieldDescription>
                        </Field>
                    </div>
                </div>
            </div>


            {/* Project Examples */}
            <section className="space-y-4 pt-12 border-t border-zinc-200 dark:border-zinc-800 mt-12">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                    Project Examples (Custom)
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                    Real-world usage patterns extracted from the Catalyst application (e.g., Search Bar).
                </p>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                    <ProjectInputsDemo />
                </div>
            </section>
        </div >
    )
}
