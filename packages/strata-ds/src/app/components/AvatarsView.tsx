import { Plus, Check, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ProjectAvatarsDemo } from './demos/ProjectAvatarsDemo';
import { CodeViewer } from './CodeViewer';

export function AvatarsView() {
  const avatarStackReact = `import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AvatarStack() {
  return (
    <div className="flex -space-x-3 hover:space-x-0 transition-all duration-300">
      <Avatar className="ring-2 ring-white dark:ring-zinc-950">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar className="ring-2 ring-white dark:ring-zinc-950">
        <AvatarImage src="https://github.com/leerob.png" />
        <AvatarFallback>LR</AvatarFallback>
      </Avatar>
      <Avatar className="ring-2 ring-white dark:ring-zinc-950">
        <AvatarFallback>+3</AvatarFallback>
      </Avatar>
    </div>
  )
}`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Avatars
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          User profile images with multiple sizes, fallbacks, and stacking patterns.
        </p>
      </div>

      {/* Sizes */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Sizes
        </h2>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 mb-6">
          <div className="flex flex-wrap items-end gap-8">
            <div className="flex flex-col items-center gap-2">
              <Avatar size="xs"><AvatarFallback>XS</AvatarFallback></Avatar>
              <span className="text-xs text-zinc-500">xs</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar size="sm"><AvatarFallback>SM</AvatarFallback></Avatar>
              <span className="text-xs text-zinc-500">sm</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar size="md"><AvatarFallback>MD</AvatarFallback></Avatar>
              <span className="text-xs text-zinc-500">md</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar size="lg"><AvatarFallback>LG</AvatarFallback></Avatar>
              <span className="text-xs text-zinc-500">lg</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar size="xl"><AvatarFallback>XL</AvatarFallback></Avatar>
              <span className="text-xs text-zinc-500">xl</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar size="2xl"><AvatarFallback>2X</AvatarFallback></Avatar>
              <span className="text-xs text-zinc-500">2xl</span>
            </div>
          </div>
        </div>
      </section>

      {/* Avatar Stack */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Avatar Stacks
        </h2>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
              <Avatar className="ring-2 ring-white dark:ring-zinc-950">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar className="ring-2 ring-white dark:ring-zinc-950">
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <Avatar className="ring-2 ring-white dark:ring-zinc-950">
                <AvatarFallback>MR</AvatarFallback>
              </Avatar>
              <Avatar className="ring-2 ring-white dark:ring-zinc-950">
                <AvatarFallback className="bg-zinc-100 text-zinc-600">+12</AvatarFallback>
              </Avatar>
            </div>
            <button className="size-10 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-50 transition-colors">
              <Plus className="size-4 text-zinc-500" />
            </button>
          </div>
        </div>

        <CodeViewer
          title="Avatar Stack"
          react={avatarStackReact}
          html={`<!-- Avatar Stack HTML -->`}
          css={`.stack { display: flex; transform: translateX(-0.75rem); }`}
          prompt="Generate an overlapping avatar stack with a hover extension effect and a 'plus' action button."
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
            <li>• Use "lg" (40px) as the default size for user profiles.</li>
            <li>• Always include a fallback for accessibility.</li>
            <li>• Add a ring border to stacked avatars for better separation.</li>
          </ul>
        </div>
      </section>

      {/* Project Examples */}
      <section className="space-y-4 pt-12 border-t border-zinc-200 dark:border-zinc-800 mt-12">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Project Examples (Custom)
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Real-world usage patterns extracted from the Catalyst application (e.g., User Lists details).
        </p>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <ProjectAvatarsDemo />
        </div>
      </section>
    </div>
  );
}