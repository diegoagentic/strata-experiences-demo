import { Combobox, ComboboxOption } from '../../components/catalyst/combobox';
import { Field, Label, Description } from '../../components/catalyst/fieldset';
import { CopyButton } from './CopyButton';
import { useState } from 'react';

const people = [
    { id: 1, name: 'Durward Reynolds' },
    { id: 2, name: 'Kenton Towne' },
    { id: 3, name: 'Therese Wunsch' },
    { id: 4, name: 'Benedict Kessler' },
    { id: 5, name: 'Katelyn Rohan' },
];

export function ComboboxView() {
    const [selectedPerson, setSelectedPerson] = useState(people[0])
    const [query, setQuery] = useState('')

    const filteredPeople =
        query === ''
            ? people
            : people.filter((person) => {
                return person.name.toLowerCase().includes(query.toLowerCase())
            })

    return (
        <div>
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Combobox
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        An autocomplete component for searching and selecting options.
                    </p>
                </div>
            </div>

            {/* Examples */}
            <div className="grid grid-cols-1 gap-10">

                {/* Basic Combobox */}
                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                        Basic Combobox
                    </h2>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-900 h-64">
                        <div className="w-full max-w-xs">
                            <Field>
                                <Label>Assignee</Label>
                                <Combobox
                                    value={selectedPerson}
                                    onChange={(val: any) => setSelectedPerson(val)}
                                    onClose={() => setQuery('')}
                                    displayValue={(person: any) => person?.name}
                                >
                                    {filteredPeople.map((person) => (
                                        <ComboboxOption key={person.id} value={person}>
                                            {person.name}
                                        </ComboboxOption>
                                    ))}
                                </Combobox>
                                <Description>Search for a person</Description>
                            </Field>
                        </div>
                    </div>
                    <div className="mt-4">
                        <CopyButton
                            formats={[{
                                label: 'React', value: `<Combobox value={selected} onChange={setSelected}>
{filteredPeople.map((person) => (
  <ComboboxOption key={person.id} value={person}>
    {person.name}
  </ComboboxOption>
))}
</Combobox>` }]}
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
                                <li>Use <code>Combobox</code> when the list of options is large (&gt;10 items).</li>
                                <li>Allow filtering to help users find options quickly.</li>
                            </ul>
                        </div>
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md p-6">
                            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Don'ts</h3>
                            <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                                <li>Don't use <code>Combobox</code> for short lists (use <code>Listbox</code> or Radio Group).</li>
                            </ul>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
