import { clsx } from 'clsx';

// ─── iPhone-style Device Frame ──────────────────────────────────────────────────
// Wraps children in a realistic phone bezel with status bar and Dynamic Island.

interface MobileDeviceFrameProps {
    children: React.ReactNode;
    className?: string;
    overlay?: React.ReactNode;
    size?: 'md' | 'lg';
    darkScreen?: boolean;
}

export default function MobileDeviceFrame({ children, className, overlay, size = 'md', darkScreen }: MobileDeviceFrameProps) {
    const width = size === 'lg' ? 'w-[430px]' : 'w-[375px]'
    const statusBg  = darkScreen ? 'bg-zinc-950' : 'bg-background'
    const statusText = darkScreen ? 'text-white' : 'text-foreground'
    const iconColor  = darkScreen ? 'bg-white' : 'bg-foreground'
    const wifiColor  = darkScreen ? 'text-white' : 'text-foreground'
    const battBorder = darkScreen ? 'border-white/60' : 'border-foreground/60'
    const battFill   = darkScreen ? 'bg-white' : 'bg-foreground'
    const battCap    = darkScreen ? 'bg-white/60' : 'bg-foreground/60'
    const homeBg     = darkScreen ? 'bg-zinc-950' : 'bg-background'
    const homeBar    = darkScreen ? 'bg-white/20' : 'bg-foreground/30'

    return (
        <div className={clsx('flex justify-center', className)}>
            <div className={`relative ${width} bg-background rounded-[3rem] border-[6px] border-zinc-800 dark:border-zinc-600 shadow-2xl shadow-black/30 dark:shadow-black/60 overflow-hidden`}>
                {/* Dynamic Island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30">
                    <div className="w-[120px] h-[34px] bg-black rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-zinc-800 ring-1 ring-zinc-700" />
                    </div>
                </div>

                {/* Status Bar */}
                <div className={`relative z-20 flex items-center justify-between px-8 pt-3 pb-1 ${statusBg}`}>
                    <span className={`text-[11px] font-semibold ${statusText}`}>9:41</span>
                    <div className="flex items-center gap-1.5">
                        {/* Signal bars */}
                        <div className="flex items-end gap-[2px]">
                            {[6, 8, 10, 12].map((h, i) => (
                                <div key={i} className={`w-[3px] rounded-sm ${iconColor}`} style={{ height: h }} />
                            ))}
                        </div>
                        {/* WiFi */}
                        <svg className={`w-[15px] h-[11px] ${wifiColor}`} viewBox="0 0 15 11" fill="currentColor">
                            <path d="M7.5 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-3.18-2.12a4.5 4.5 0 016.36 0 .75.75 0 01-1.06 1.06 3 3 0 00-4.24 0 .75.75 0 01-1.06-1.06zm-2.83-2.83a8.25 8.25 0 0112.02 0 .75.75 0 01-1.06 1.06 6.75 6.75 0 00-9.9 0A.75.75 0 011.49 4.55z" />
                        </svg>
                        {/* Battery */}
                        <div className="flex items-center gap-[2px]">
                            <div className={`w-[22px] h-[10px] rounded-[3px] border ${battBorder} p-[1.5px]`}>
                                <div className={`h-full w-[75%] rounded-[1.5px] ${battFill}`} />
                            </div>
                            <div className={`w-[1.5px] h-[4px] rounded-r-sm ${battCap}`} />
                        </div>
                    </div>
                </div>

                {/* Content area */}
                <div className="min-h-[calc(100vh-12rem)] max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-micro bg-background">
                    {children}
                </div>

                {/* Home indicator */}
                <div className={`flex justify-center py-2 ${homeBg}`}>
                    <div className={`w-[134px] h-[5px] rounded-full ${homeBar}`} />
                </div>

                {/* Overlay — renders above scroll content, inside phone bezel */}
                {overlay && (
                    <div className="absolute inset-0 z-50">
                        {overlay}
                    </div>
                )}
            </div>
        </div>
    );
}
