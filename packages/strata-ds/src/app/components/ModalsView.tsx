import { CodeViewer } from './CodeViewer';
import { ProjectModalsDemo } from './demos/ProjectModalsDemo';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function ModalsView() {
  const dialogReact = `import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" value="@peduarte" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
`

  const dialogHTML = `<!-- Dialog Overlay -->
<div data-state="open" class="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"></div>

<!-- Dialog Content -->
<div role="dialog" data-state="open" class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-zinc-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg dark:border-zinc-800 dark:bg-zinc-950">
  <div class="flex flex-col space-y-1.5 text-center sm:text-left">
    <h2 class="text-lg font-semibold leading-none tracking-tight text-zinc-900 dark:text-zinc-50">Edit profile</h2>
    <p class="text-sm text-zinc-500 dark:text-zinc-400">Make changes to your profile here. Click save when you're done.</p>
  </div>
  <div class="grid gap-4 py-4">
    <!-- Form Content -->
  </div>
  <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
    <button class="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300">Save changes</button>
  </div>
  <button type="button" class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-zinc-100 data-[state=open]:text-zinc-500 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300 dark:data-[state=open]:bg-zinc-800 dark:data-[state=open]:text-zinc-400">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
    <span class="sr-only">Close</span>
  </button>
</div>`

  const dialogCSS = `@theme {
  --color-zinc-200: #e4e4e7;
  --color-zinc-900: #18181b;
}

.dialog-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;
}

.dialog-content {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 50;
  width: 100%;
  max-width: 32rem;
  transform: translate(-50%, -50%);
  border-radius: 0.5rem;
  border: 1px solid var(--color-zinc-200);
  background-color: white;
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
`

  const dialogPrompt = `# AI PROMPT: Generate Dialog Component
## CONTEXT
Modal dialog for actions.

## API
\`\`\`tsx
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogFooter>
        <Button>Action</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
\`\`\`

## SPECS
- Overlay: bg-black/50
- Content: bg-white dark:bg-zinc-950
- Border: Zinc-200 dark:Zinc-800
- Radius: sm:rounded-lg
- Shadow: shadow-lg`

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Dialog</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Basic Usage</h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 flex items-center justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-zinc-900 dark:text-zinc-50">
                    Name
                  </Label>
                  <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right text-zinc-900 dark:text-zinc-50">
                    Username
                  </Label>
                  <Input id="username" defaultValue="@peduarte" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-6">
          <CodeViewer
            title="Dialog"
            react={dialogReact}
            html={dialogHTML}
            css={dialogCSS}
            prompt={dialogPrompt}
            enableFigmaExport={true}
            figmaSpecs={{
              width: "Full (max 32rem)",
              backgroundColor: "White / Zinc-900",
              borderRadius: "8px",
              border: "1px solid Zinc-200",
            }}
          />
        </div>
      </div>


      {/* Project Examples */}
      <section className="space-y-4 pt-12 border-t border-zinc-200 dark:border-zinc-800 mt-12 pb-20">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Project Examples (Custom)
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Real-world usage patterns extracted from the Catalyst application (e.g., Document Preview Dialog).
        </p>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <ProjectModalsDemo />
        </div>
      </section>
    </div >
  )
}