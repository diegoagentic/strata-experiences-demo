/**
 * COMPONENT: MarkupSlider
 * PURPOSE: Range slider for adjusting scenario markup % (20-45%, default 35%).
 *          Snap to 1% increments. Shows current value + quick presets.
 *
 * PROPS:
 *   - value: number                  — current markup (0.20 - 0.45)
 *   - onChange: (v: number) => void  — fires on every change (no debounce)
 *   - min?: number                   — default 0.20
 *   - max?: number                   — default 0.45
 *
 * STATES: controlled only
 *
 * DS TOKENS:
 *   - bg-muted (track) · bg-primary (thumb + fill)
 *   - text-foreground · text-muted-foreground · border-border
 *
 * USED BY: ScenariosStep (inside Budget Builder wizard)
 */

import { Sliders } from 'lucide-react'

interface MarkupSliderProps {
    value: number
    onChange: (v: number) => void
    min?: number
    max?: number
}

const PRESETS = [0.25, 0.30, 0.35, 0.40]

export default function MarkupSlider({ value, onChange, min = 0.20, max = 0.45 }: MarkupSliderProps) {
    const percent = Math.round(value * 100)
    const fillPercent = ((value - min) / (max - min)) * 100

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                        <Sliders className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Markup</div>
                        <div className="text-[10px] text-muted-foreground">Adjust dealer margin per scenario</div>
                    </div>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground tabular-nums">{percent}</span>
                    <span className="text-sm text-muted-foreground">%</span>
                </div>
            </div>

            {/* Slider with custom fill */}
            <div className="relative mb-3 px-1">
                <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-1.5 bg-muted rounded-full pointer-events-none">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${fillPercent}%` }} />
                </div>
                <input
                    type="range"
                    min={min * 100}
                    max={max * 100}
                    step={1}
                    value={percent}
                    onChange={e => onChange(parseInt(e.target.value) / 100)}
                    className="relative z-10 w-full appearance-none bg-transparent cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                        [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-card
                        [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-card"
                />
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground tabular-nums">
                    <span>{Math.round(min * 100)}%</span>
                    <span>{Math.round(max * 100)}%</span>
                </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Preset</span>
                {PRESETS.map(p => {
                    const active = Math.abs(value - p) < 0.005
                    return (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onChange(p)}
                            className={`
                                text-xs font-bold px-2.5 py-1 rounded-md transition-colors tabular-nums
                                ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}
                            `}
                        >
                            {Math.round(p * 100)}%
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
