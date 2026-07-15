import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { CodeViewer } from "./CodeViewer"
import { Heading } from './ui/heading';
import { Text } from './ui/text';

export function TextareaView() {
    const basicTextareaReact = `import { Textarea } from "@/components/ui/textarea"

export function TextareaDemo() {
  return <Textarea placeholder="Type your message here." />
}`

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="mb-12">
                <Heading level={1} className="text-4xl font-bold mb-2">Textarea</Heading>
                <Text className="text-zinc-500 dark:text-zinc-400">
                    Displays a form textarea or a component that looks like a textarea.
                </Text>
            </div>

            <div className="mb-12">
                <Heading level={2} className="text-2xl font-bold mb-4">Basic Usage</Heading>
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 mb-6">
                    <div className="max-w-sm mx-auto space-y-4">
                        <Textarea placeholder="Type your message here." />
                    </div>
                </div>

                <CodeViewer
                    title="Textarea"
                    react={basicTextareaReact}
                    html={`<!-- Textarea HTML -->`}
                    css={`.textarea { min-height: 60px; }`}
                    prompt="Generate a multi-line textarea input."
                    enableFigmaExport={true}
                />
            </div>
        </div>
    )
}
