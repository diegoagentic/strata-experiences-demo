import React from 'react';
import { Card } from '@/components/catalyst/card';
import logoBlack from '@/assets/branding/logo-black.png';
import logoWhite from '@/assets/branding/logo-white.png';
import logoLime from '@/assets/branding/logo-lime.png';
import logoGray from '@/assets/branding/logo-gray.png';

export function BrandingView() {
    const logos = [
        { name: 'Logo Black (Mark)', file: logoBlack, bg: 'bg-zinc-50', text: 'text-zinc-900', desc: 'For light backgrounds (Official documents, Light Mode)' },
        { name: 'Logo White (Mark)', file: logoWhite, bg: 'bg-zinc-950', text: 'text-zinc-50', desc: 'For dark backgrounds (Dark Mode, Primary Navigation)' },
        { name: 'Logo Lime (Mark)', file: logoLime, bg: 'bg-zinc-900', text: 'text-zinc-400', desc: 'Accent/Signal usage (Dark Mode Only)' },
        { name: 'Logo Gray (Mark)', file: logoGray, bg: 'bg-zinc-100', text: 'text-zinc-600', desc: 'For muted/secondary contexts' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold font-brand tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
                    Branding & Assets
                </h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl">
                    The Strata brand identity is technical, functional, and precise. Our assets are designed to work seamlessly across light and dark modes, with "Volt Lime" serving as our primary signal color.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {logos.map((logo, index) => (
                    <div key={index} className="group relative">
                        <div className={`aspect-square rounded-lg ${logo.bg} border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-8 transition-all group-hover:shadow-lg`}>
                            <img src={logo.file} alt={logo.name} className="w-full h-auto object-contain" />
                        </div>
                        <div className="mt-3">
                            <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{logo.name}</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{logo.desc}</p>
                            <a
                                href={logo.file}
                                download
                                className="mt-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:underline inline-flex items-center gap-1"
                            >
                                Download PNG
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold font-brand text-zinc-900 dark:text-zinc-50">Usage Examples</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Example 1: Sidebar Header */}
                    <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
                        <div className="bg-zinc-950 p-4 border-b border-zinc-800">
                            <div className="flex items-center gap-3">
                                <img src={logoLime} className="w-8 h-8" alt="Logo" />
                                <div>
                                    <div className="text-white font-bold text-sm tracking-wide">STRATA</div>
                                    <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Intelligence Layer</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-zinc-500">
                                <strong className="text-zinc-900 dark:text-zinc-50 block mb-1">Sidebar Context (Dark)</strong>
                                Use the Lime or White logo mark at 32px (w-8) for application headers in dark mode.
                            </p>
                        </div>
                    </Card>

                    {/* Example 2: Auth Screen */}
                    <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                        <div className="p-8 flex flex-col items-center justify-center gap-6 min-h-[160px]">
                            <img src={logoBlack} className="w-12 h-12 dark:hidden" alt="Logo" />
                            <img src={logoWhite} className="w-12 h-12 hidden dark:block" alt="Logo" />
                            <div className="text-center space-y-1">
                                <div className="h-2 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto"></div>
                                <div className="h-2 w-16 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto"></div>
                            </div>
                        </div>
                        <div className="p-6 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
                            <p className="text-sm text-zinc-500">
                                <strong className="text-zinc-900 dark:text-zinc-50 block mb-1">Center Hero (Auth)</strong>
                                For authentication or centered layouts, use the mark at 48px (w-12) or larger.
                            </p>
                        </div>
                    </Card>

                    {/* Example 3: Minimal Footer */}
                    <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-2 opacity-60 grayscale hover:grayscale-0 transition-all cursor-pointer">
                                <img src={logoBlack} className="w-6 h-6 dark:hidden" alt="Logo" />
                                <img src={logoWhite} className="w-6 h-6 hidden dark:block" alt="Logo" />
                                <span className="font-brand text-xs font-bold text-zinc-900 dark:text-zinc-50">STRATA</span>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-zinc-500">
                                <strong className="text-zinc-900 dark:text-zinc-50 block mb-1">Footer / Condensed</strong>
                                Use the mark at 24px (w-6) for footers or secondary attribution.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-2">Technical Implementation</h3>
                <code className="text-xs font-mono text-zinc-600 dark:text-zinc-400 block p-4 bg-white dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                    {`// Import assets
import logoLime from '@/assets/branding/logo-lime.png';

// Usage in Component
<div className="flex items-center gap-3">
  <img src={logoLime} className="w-8 h-8" alt="Strata Logo" />
  <span className="font-brand font-bold text-white">STRATA</span>
</div>`}
                </code>
            </div>
        </div>
    );
}
