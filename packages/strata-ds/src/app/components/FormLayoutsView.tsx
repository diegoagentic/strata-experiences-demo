import { Check, X, HelpCircle } from 'lucide-react';
import { CodeViewer } from './CodeViewer';
import { Heading } from './ui/heading';
import { Text } from './ui/text';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Field, FieldLabel, FieldDescription } from './ui/field';

export function FormLayoutsView() {
  const stackedFormReact = `import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function StackedForm() {
  return (
    <form className="space-y-6 max-w-sm">
      <Field>
        <FieldLabel>Email Address</FieldLabel>
        <Input type="email" placeholder="you@example.com" />
      </Field>
      <Field>
        <FieldLabel>Password</FieldLabel>
        <Input type="password" />
        <FieldDescription>Must be at least 8 characters.</FieldDescription>
      </Field>
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button>Submit</Button>
      </div>
    </form>
  )
}`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12">
        <Heading level={1} className="text-4xl font-bold mb-2">Form Layouts</Heading>
        <Text className="text-zinc-500 dark:text-zinc-400">
          Structured form patterns for organizing inputs, labels, and validation feedback.
        </Text>
      </div>

      {/* Stacked Layout */}
      <section className="mb-16">
        <Heading level={2} className="text-2xl font-bold mb-6">Stacked Layout</Heading>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 mb-6">
          <form className="space-y-6 max-w-sm">
            <Field>
              <FieldLabel>Email Address</FieldLabel>
              <Input type="email" placeholder="you@example.com" />
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input type="password" placeholder="••••••••" />
              <FieldDescription>Must be at least 8 characters.</FieldDescription>
            </Field>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline">Cancel</Button>
              <Button>Submit</Button>
            </div>
          </form>
        </div>

        <CodeViewer
          title="Stacked Form"
          react={stackedFormReact}
          html={`<form class="space-y-6">...</form>`}
          css={`.form { display: flex; flex-direction: column; gap: 1.5rem; }`}
          prompt="Generate a vertical stacked form with field labels and descriptions."
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
            <li>• Use consistent spacing (e.g., space-y-6) between fields.</li>
            <li>• Provide helper text for complex or sensitive inputs.</li>
          </ul>
        </div>
      </section>
    </div >
  );
}
