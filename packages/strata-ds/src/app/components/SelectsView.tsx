import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "./ui/select"
import { CodeViewer } from './CodeViewer';
import { ProjectSelectsDemo } from "./demos/ProjectSelectsDemo";
import { Heading } from './ui/heading';
import { Text } from './ui/text';

export function SelectsView() {
  const simpleSelectReact = `import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SelectDemo() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  )
}`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12">
        <Heading level={1} className="text-4xl font-bold mb-2">Select</Heading>
        <Text className="text-zinc-500 dark:text-zinc-400">
          Displays a list of options for the user to pick from—triggered by a button.
        </Text>
      </div>

      {/* Basic Select */}
      <div className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">Basic Usage</Heading>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 flex items-center justify-center min-h-[200px] mb-6">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <CodeViewer
          title="Select"
          react={simpleSelectReact}
          html={`<!-- Select HTML -->`}
          css={`.select-trigger { height: 2.25rem; }`}
          prompt="Generate a dropdown select component."
          enableFigmaExport={true}
        />
      </div>

      {/* Project Examples */}
      <section className="space-y-4 pt-12 border-t border-zinc-200 dark:border-zinc-800 mt-12 pb-20">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Project Examples (Custom)
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Real-world usage patterns extracted from the Catalyst application (e.g., Client Filter).
        </p>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <ProjectSelectsDemo />
        </div>
      </section>
    </div >
  );
}
