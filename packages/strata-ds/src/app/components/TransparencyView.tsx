import { Layers, Droplets } from 'lucide-react';
import { CopyButton } from './CopyButton';

export function TransparencyView() {


    const glassTokens = [
        {
            name: 'Navbar Glass',
            token: '--color-glass-navbar',
            borderToken: '--color-glass-navbar-border',
            usage: 'Main navigation headers',
            blur: 'backdrop-blur-xl',
            description: 'High transparency for navigation bars to blend with content while maintaining legibility.'
        },
        {
            name: 'Popover Glass',
            token: '--color-glass-popover',
            borderToken: '--color-glass-popover-border',
            usage: 'Dropdowns, menus, and popovers',
            blur: 'backdrop-blur-xl',
            description: 'Higher opacity for overlaid interactive elements to ensure readability against complex backgrounds.'
        }
    ];

    return (
        <div>
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Transparency & Glassmorphism
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Standardized tokens for glass effects, blurs, and translucent surfaces.
                    </p>
                </div>
            </div>

            <div className="mb-12">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                    Glass Surfaces
                </h2>

                {/* Preview Container */}
                <div className="rounded-xl p-12 transition-colors duration-300 relative overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                    {/* Background Pattern to show transparency */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>

                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse delay-700"></div>

                    <div className="grid grid-cols-1 gap-8 relative z-10">
                        <div className="grid grid-cols-1 gap-12 relative z-10">

                            {/* Navbar Example */}
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="w-full md:w-1/2">
                                    <div className="relative rounded-xl overflow-hidden h-[200px] border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white/50 dark:bg-zinc-900/50">
                                        {/* Background content to scroll 'behind' */}
                                        <div className="absolute inset-0 p-4 space-y-4 overflow-hidden">
                                            <div className="w-3/4 h-8 bg-zinc-200 dark:bg-zinc-800 rounded mb-8"></div>
                                            <div className="space-y-2">
                                                <div className="w-full h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                                                <div className="w-full h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                                                <div className="w-5/6 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                                            </div>
                                            <div className="space-y-2 pt-4">
                                                <div className="w-full h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                                                <div className="w-4/5 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                                            </div>
                                            {/* Floating colored shapes to show blur */}
                                            <div className="absolute top-10 right-10 w-16 h-16 bg-blue-500 rounded-full blur-xl opacity-50"></div>
                                            <div className="absolute bottom-10 left-10 w-20 h-20 bg-purple-500 rounded-full blur-xl opacity-50"></div>
                                        </div>

                                        {/* Glass Navbar */}
                                        <div
                                            className="absolute top-4 left-4 right-4 h-14 rounded-lg flex items-center justify-between px-4 transition-all"
                                            style={{
                                                backgroundColor: 'var(--color-glass-navbar)',
                                                border: '1px solid var(--color-glass-navbar-border)',
                                                backdropFilter: 'blur(var(--blur-glass-xl))',
                                                boxShadow: 'var(--shadow-glass-lg)'
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-zinc-400 dark:bg-zinc-600"></div>
                                                <div className="w-20 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-full"></div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-6 h-6 rounded bg-zinc-400/20"></div>
                                                <div className="w-6 h-6 rounded bg-zinc-400/20"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm text-zinc-500 text-center italic">
                                        "Navbar Glass" overlaying scrolling content
                                    </p>
                                </div>

                                {/* Navbar Components Documentation */}
                                <div className="w-full md:w-1/2 space-y-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Navbar Glass</h3>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">High transparency for navigation bars to blend with content while maintaining legibility.</p>
                                        <div className="mt-3">
                                            <CopyButton size="sm" formats={[
                                                {
                                                    label: 'Copy Full Styles',
                                                    value: `.glass-navbar {\n  background-color: var(--color-glass-navbar);\n  border: 1px solid var(--color-glass-navbar-border);\n  backdrop-filter: blur(var(--blur-glass-xl));\n  box-shadow: var(--shadow-glass-lg);\n}`,
                                                    description: 'Complete CSS class'
                                                }
                                            ]} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 p-3 flex items-center justify-between">
                                            <div>
                                                <div className="text-xs uppercase text-zinc-400 font-semibold mb-1">Background</div>
                                                <code className="text-sm font-mono text-zinc-700 dark:text-zinc-300">--color-glass-navbar</code>
                                            </div>
                                            <CopyButton size="sm" formats={[
                                                { label: 'Token', value: 'var(--color-glass-navbar)', description: 'CSS variable' },
                                                { label: 'CSS', value: 'background-color: var(--color-glass-navbar);', description: 'CSS property' },
                                                { label: 'Tailwind', value: 'bg-[var(--color-glass-navbar)]', description: 'Tailwind arbitrary value' }
                                            ]} />
                                        </div>
                                        <div className="bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 p-3 flex items-center justify-between">
                                            <div>
                                                <div className="text-xs uppercase text-zinc-400 font-semibold mb-1">Border</div>
                                                <code className="text-sm font-mono text-zinc-700 dark:text-zinc-300">--color-glass-navbar-border</code>
                                            </div>
                                            <CopyButton size="sm" formats={[
                                                { label: 'Token', value: 'var(--color-glass-navbar-border)', description: 'CSS variable' },
                                                { label: 'CSS', value: 'border: 1px solid var(--color-glass-navbar-border);', description: 'CSS property' },
                                                { label: 'Tailwind', value: 'border-[var(--color-glass-navbar-border)]', description: 'Tailwind arbitrary value' }
                                            ]} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card/Popover Example */}
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="w-full md:w-1/2">
                                    <div className="relative rounded-xl overflow-hidden h-[240px] border border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">

                                        <div className="absolute inset-0">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                                            <div className="absolute inset-0 bg-[radial-gradient(#a1a1aa_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
                                        </div>

                                        {/* Glass Card */}
                                        <div
                                            className="relative w-64 p-5 rounded-xl transition-all flex flex-col gap-4"
                                            style={{
                                                backgroundColor: 'var(--color-glass-popover)',
                                                border: '1px solid var(--color-glass-popover-border)',
                                                backdropFilter: 'blur(var(--blur-glass-xl))',
                                                boxShadow: 'var(--shadow-glass-lg)'
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                                    UI
                                                </div>
                                                <div>
                                                    <div className="h-4 w-24 bg-zinc-900/10 dark:bg-white/20 rounded"></div>
                                                    <div className="h-3 w-16 bg-zinc-900/5 dark:bg-white/10 rounded mt-1.5"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-2 w-full bg-zinc-900/5 dark:bg-white/5 rounded"></div>
                                                <div className="h-2 w-5/6 bg-zinc-900/5 dark:bg-white/5 rounded"></div>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <button className="flex-1 py-1.5 rounded text-xs font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                                                    Action
                                                </button>
                                                <button className="flex-1 py-1.5 rounded text-xs font-medium border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm text-zinc-500 text-center italic">
                                        "Popover Glass" used for cards and dropdowns
                                    </p>
                                </div>

                                {/* Popover Components Documentation */}
                                <div className="w-full md:w-1/2 space-y-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Popover Glass</h3>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Higher opacity for overlaid interactive elements to ensure readability against complex backgrounds.</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 p-3 flex items-center justify-between">
                                            <div>
                                                <div className="text-xs uppercase text-zinc-400 font-semibold mb-1">Background</div>
                                                <code className="text-sm font-mono text-zinc-700 dark:text-zinc-300">--color-glass-popover</code>
                                            </div>
                                            <CopyButton size="sm" formats={[
                                                { label: 'Token', value: 'var(--color-glass-popover)', description: 'CSS variable' },
                                                { label: 'CSS', value: 'background-color: var(--color-glass-popover);', description: 'CSS property' },
                                                { label: 'Tailwind', value: 'bg-[var(--color-glass-popover)]', description: 'Tailwind arbitrary value' }
                                            ]} />
                                        </div>
                                        <div className="bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 p-3 flex items-center justify-between">
                                            <div>
                                                <div className="text-xs uppercase text-zinc-400 font-semibold mb-1">Border</div>
                                                <code className="text-sm font-mono text-zinc-700 dark:text-zinc-300">--color-glass-popover-border</code>
                                            </div>
                                            <CopyButton size="sm" formats={[
                                                { label: 'Token', value: 'var(--color-glass-popover-border)', description: 'CSS variable' },
                                                { label: 'CSS', value: 'border: 1px solid var(--color-glass-popover-border);', description: 'CSS property' },
                                                { label: 'Tailwind', value: 'border-[var(--color-glass-popover-border)]', description: 'Tailwind arbitrary value' }
                                            ]} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                        Utilities
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <Droplets className="w-5 h-5 text-zinc-500" />
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Blur Intensity</h3>
                            </div>
                            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-3 rounded mb-3 border border-zinc-200 dark:border-zinc-800">
                                <code className="text-sm font-mono text-zinc-700 dark:text-zinc-300">--blur-glass-xl</code>
                                <span className="text-xs text-zinc-500">24px</span>
                            </div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Standard blur amount for all glass surfaces to ensure consistency.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <Layers className="w-5 h-5 text-zinc-500" />
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Glass Shadow</h3>
                            </div>
                            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-3 rounded mb-3 border border-zinc-200 dark:border-zinc-800">
                                <code className="text-sm font-mono text-zinc-700 dark:text-zinc-300">--shadow-glass-lg</code>
                                <span className="text-xs text-zinc-500">Soft drop shadow</span>
                            </div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Specialized shadow for lifting glass elements off the background.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
