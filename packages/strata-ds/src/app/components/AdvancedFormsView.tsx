import * as React from "react"
import { CodeViewer } from "./CodeViewer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Fieldset, Legend, FieldGroup, FieldHeader } from "./ui/fieldset"
import { Field, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, ListboxLabel, ListboxDescription } from "./ui/listbox"
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from "./ui/combobox"
import { Disclosure, DisclosureButton, DisclosurePanel } from "./ui/disclosure"

const people = [
    { id: 1, name: 'Durward Reynolds', role: 'Admin' },
    { id: 2, name: 'Kenton Towne', role: 'Editor' },
    { id: 3, name: 'Therese Wunsch', role: 'Viewer' },
    { id: 4, name: 'Benedict Kessler', role: 'Admin' },
    { id: 5, name: 'Katelyn Rohan', role: 'Editor' },
]

export function AdvancedFormsView() {
    const [selectedPerson, setSelectedPerson] = React.useState(people[0])
    const [query, setQuery] = React.useState('')

    const filteredPeople =
        query === ''
            ? people
            : people.filter((person) => {
                return person.name.toLowerCase().includes(query.toLowerCase())
            })

    return (
        <div className="space-y-12 pb-20">
            <section className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Advanced Forms</h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                    Complex form primitives for data-heavy applications, including semantic grouping and advanced selection.
                </p>
            </section>

            {/* Fieldset & Legend */}
            <section className="space-y-6">
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Fieldset & Legend</h2>
                <Card variant="default">
                    <CardContent className="pt-6">
                        <Fieldset>
                            <FieldHeader>
                                <Legend>Shipping Information</Legend>
                                <p className="text-sm text-zinc-500">Provide the destination for this shipment.</p>
                            </FieldHeader>
                            <FieldGroup>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <Field>
                                        <FieldLabel>Address</FieldLabel>
                                        <Input placeholder="123 Main St" />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Apartment / Suite</FieldLabel>
                                        <Input placeholder="Apt 4B" />
                                    </Field>
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                    <Field>
                                        <FieldLabel>City</FieldLabel>
                                        <Input placeholder="San Francisco" />
                                    </Field>
                                    <Field>
                                        <FieldLabel>State</FieldLabel>
                                        <Input placeholder="CA" />
                                    </Field>
                                    <Field>
                                        <FieldLabel>ZIP Code</FieldLabel>
                                        <Input placeholder="94103" />
                                    </Field>
                                </div>
                            </FieldGroup>
                        </Fieldset>
                    </CardContent>
                </Card>

                <CodeViewer
                    title="Fieldset Usage"
                    react={`import { Fieldset, Legend, FieldGroup, FieldHeader } from "./ui/fieldset"
import { Field, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"

export function ShippingForm() {
  return (
    <Fieldset>
      <FieldHeader>
        <Legend>Shipping Information</Legend>
        <p className="text-sm text-zinc-500">Provide the destination for this shipment.</p>
      </FieldHeader>
      <FieldGroup>
        <Field>
          <FieldLabel>Address</FieldLabel>
          <Input placeholder="123 Main St" />
        </Field>
        {/* ... */}
      </FieldGroup>
    </Fieldset>
  )
}`}
                    html="<fieldset class='space-y-6'>...</fieldset>"
                    css="/* Zinc-based styles */"
                    prompt="Create a shipping form using Fieldset and FieldGroup."
                />
            </section>

            {/* Listbox */}
            <section className="space-y-6">
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Listbox (Advanced Select)</h2>
                <div className="grid gap-8 lg:grid-cols-2">
                    <Card variant="default">
                        <CardHeader>
                            <CardTitle>Semantic Selection</CardTitle>
                            <CardDescription>An accessible Listbox for high-density applications.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-72 relative">
                                <Listbox value={selectedPerson} onChange={setSelectedPerson}>
                                    <ListboxButton className="flex items-center justify-between">
                                        {selectedPerson.name}
                                    </ListboxButton>
                                    <ListboxOptions>
                                        {people.map((person) => (
                                            <ListboxOption key={person.id} value={person}>
                                                <div className="flex flex-col">
                                                    <ListboxLabel>{person.name}</ListboxLabel>
                                                    <ListboxDescription>{person.role}</ListboxDescription>
                                                </div>
                                            </ListboxOption>
                                        ))}
                                    </ListboxOptions>
                                </Listbox>
                            </div>
                        </CardContent>
                    </Card>

                    <CodeViewer
                        title="Listbox Usage"
                        react={`import { Listbox, ListboxButton, ListboxOptions, ListboxOption, ListboxLabel, ListboxDescription } from "./ui/listbox"

export function PeopleSelect() {
  const [selected, setSelected] = useState(people[0])

  return (
    <Listbox value={selected} onChange={setSelected}>
      <ListboxButton>{selected.name}</ListboxButton>
      <ListboxOptions>
        {people.map((person) => (
          <ListboxOption key={person.id} value={person}>
            <ListboxLabel>{person.name}</ListboxLabel>
            <ListboxDescription>{person.role}</ListboxDescription>
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  )
}`}
                        html="<div class='relative'>...</div>"
                        css="/* Listbox styles */"
                        prompt="Implement a custom Listbox using Headless UI."
                    />
                </div>
            </section>

            {/* Combobox */}
            <section className="space-y-6">
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Combobox (Autocomplete)</h2>
                <div className="grid gap-8 lg:grid-cols-2">
                    <Card variant="default">
                        <CardHeader>
                            <CardTitle>Rich Autocomplete</CardTitle>
                            <CardDescription>Searchable selection with custom option layouts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-72 relative">
                                <Combobox value={selectedPerson} onChange={setSelectedPerson} onClose={() => setQuery('')}>
                                    <div className="relative">
                                        <ComboboxInput
                                            displayValue={(person: any) => person?.name}
                                            onChange={(event) => setQuery(event.target.value)}
                                        />
                                        <ComboboxButton />
                                    </div>
                                    <ComboboxOptions>
                                        {filteredPeople.map((person) => (
                                            <ComboboxOption key={person.id} value={person}>
                                                <ListboxLabel>{person.name}</ListboxLabel>
                                            </ComboboxOption>
                                        ))}
                                    </ComboboxOptions>
                                </Combobox>
                            </div>
                        </CardContent>
                    </Card>

                    <CodeViewer
                        title="Combobox Usage"
                        react={`import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from "./ui/combobox"

export function PeopleSearch() {
  const [selected, setSelected] = useState(people[0])
  const [query, setQuery] = useState('')

  return (
    <Combobox value={selected} onChange={setSelected}>
      <ComboboxInput 
        displayValue={(p) => p.name} 
        onChange={(e) => setQuery(e.target.value)} 
      />
      <ComboboxButton />
      <ComboboxOptions>
        {filteredPeople.map((person) => (
          <ComboboxOption key={person.id} value={person}>
            {person.name}
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </Combobox>
  )
}`}
                        html="<div class='relative'>...</div>"
                        css="/* Combobox styles */"
                        prompt="Create a searchable Combobox with Headless UI."
                    />
                </div>
            </section>
        </div>
    )
}
