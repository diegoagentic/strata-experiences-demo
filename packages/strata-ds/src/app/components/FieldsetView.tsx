import { Fieldset, Legend, FieldGroup, Field, Label, Description, ErrorMessage } from '../../components/catalyst/fieldset';
import { Input } from '../../components/catalyst/input';
import { CopyButton } from './CopyButton';

export function FieldsetView() {
    return (
        <div>
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Fieldset
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        A set of primitive components for grouping form fields with proper layout and spacing.
                    </p>
                </div>
            </div>

            {/* Examples */}
            <div className="grid grid-cols-1 gap-10">

                {/* Basic Fieldset */}
                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                        Basic Fieldset
                    </h2>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-900">
                        <Fieldset>
                            <Legend>Shipping Details</Legend>
                            <FieldGroup>
                                <Field>
                                    <Label>Street Address</Label>
                                    <Input name="address" placeholder="123 Main St" />
                                </Field>
                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <Label>City</Label>
                                        <Input name="city" placeholder="New York" />
                                    </Field>
                                    <Field>
                                        <Label>Postal Code</Label>
                                        <Input name="postal_code" placeholder="10001" />
                                    </Field>
                                </div>
                            </FieldGroup>
                        </Fieldset>
                    </div>
                    <div className="mt-4">
                        <CopyButton
                            formats={[{
                                label: 'React', value: `<Fieldset>
  <Legend>Shipping Details</Legend>
  <FieldGroup>
    <Field>
      <Label>Street Address</Label>
      <Input name="address" />
    </Field>
    <Field>
      <Label>City</Label>
      <Input name="city" />
    </Field>
  </FieldGroup>
</Fieldset>` }]}
                        />
                    </div>
                </section>

                {/* Field with Description & Error */}
                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                        Field with Description & Error
                    </h2>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-900">
                        <Field>
                            <Label>Email</Label>
                            <Description>We'll use this for spam.</Description>
                            <Input name="email" defaultValue="invalid-email" invalid />
                            <ErrorMessage>Please enter a valid email address.</ErrorMessage>
                        </Field>
                    </div>
                    <div className="mt-4">
                        <CopyButton
                            formats={[{
                                label: 'React', value: `<Field>
  <Label>Email</Label>
  <Description>We'll use this for spam.</Description>
  <Input name="email" invalid />
  <ErrorMessage>Please enter a valid email address.</ErrorMessage>
</Field>` }]}
                        />
                    </div>
                </section>

                {/* Usage Guidelines */}
                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                        Usage Guidelines
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md p-6">
                            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Do's</h3>
                            <ul className="list-disc list-inside text-sm text-emerald-800 dark:text-emerald-200 space-y-1">
                                <li>Use <code>Fieldset</code> to group related fields (e.g., Shipping vs. Billing).</li>
                                <li>Always provide a <code>Legend</code> for accessibility.</li>
                                <li>Use <code>FieldGroup</code> to control vertical spacing between fields.</li>
                            </ul>
                        </div>
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md p-6">
                            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Don'ts</h3>
                            <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                                <li>Don't nest <code>Fieldset</code> deeper than 2 levels.</li>
                                <li>Don't use <code>Field</code> without a <code>Label</code> (unless visually hidden).</li>
                            </ul>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
